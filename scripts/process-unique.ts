/* eslint-disable no-console */
/**
 * process-unique.ts
 *
 * Steps:
 * 1) Read docs, extract/update frontmatter; generate {filename, description, tags} with Ollama if missing; ensure uuid + created_at.
 * 2) Markdown-aware chunking w/ line+col; embed with Ollama; add to in-memory "Chroma"-like index. Cache chunks+embeddings.
 * 3) For each chunk, query index; cache query results.
 * 4) Aggregate doc-to-doc similarity; add related_to_title / related_to_uuid in frontmatter when >= threshold.
 * 5) For per-chunk results above ref-threshold, add references {uuid, line, col} to frontmatter.
 * 6) Write updated frontmatter.
 * 7) Append "Related content" footer.
 * 8) Append "Sources" footer.
 * 9) Rename file to frontmatter.filename (slugged) if changed.
 */

import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { z } from "zod";
import * as yaml from "yaml";

type Front = {
  uuid?: string;
  created_at?: string; // original filename as requested
  filename?: string;   // title/sluggy name (no extension enforced)
  description?: string;
  tags?: string[];
  related_to_title?: string[];
  related_to_uuid?: string[];
  references?: Array<{ uuid: string; line: number; col: number; score?: number }>;
  [k: string]: any;
};

type Chunk = {
  id: string; // docUuid:chunkIndex
  docUuid: string;
  docPath: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  text: string;
  embedding?: number[];
  title?: string; // closest heading if any
};

type QueryHit = {
  id: string;
  docUuid: string;
  score: number; // cosine similarity
  startLine: number;
  startCol: number;
};

type QueryCache = Record<string, QueryHit[]>; // key=chunk.id

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--dir": "docs/unique",
  "--gen-model": "qwen3:4b",
  "--embed-model": "nomic-embed-text:latest",
  "--doc-threshold": "0.78",
  "--ref-threshold": "0.85",
  "--ext": ".md,.mdx,.txt",
  "--dry-run": "false",
});

const ROOT_DIR = path.resolve(process.cwd(), args["--dir"]);
const GEN_MODEL = args["--gen-model"];
const EMBED_MODEL = args["--embed-model"];
const DOC_THRESHOLD = Number(args["--doc-threshold"]);
const REF_THRESHOLD = Number(args["--ref-threshold"]);
const DRY_RUN = args["--dry-run"] === "true";
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CHUNK_CACHE_FILE = path.join(CACHE_DIR, "unique-chunks.json");
const EMBED_CACHE_FILE = path.join(CACHE_DIR, "unique-embeddings.json");
const QUERY_CACHE_FILE = path.join(CACHE_DIR, "unique-queries.json");
function relMdLink(fromFileAbs: string, toFileAbs: string, anchor?: string): string {
  const rel = path.relative(path.dirname(fromFileAbs), toFileAbs).replace(/\\/g, "/");
  return anchor ? `${rel}#${anchor}` : rel;
}

function ensureArray<T>(x: T | T[] | undefined): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function randomUUID(): string {
  // Node 18+: crypto.randomUUID available
  return (globalThis as any).crypto?.randomUUID?.() ?? require("crypto").randomUUID();
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extnamePrefer(originalPath: string): string {
  const e = path.extname(originalPath);
  return e || ".md";
}

async function listFilesRec(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of ents) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(root);
  return out.filter((p) => EXTS.has(path.extname(p).toLowerCase()));
}

const GenSchema = z.object({
  filename: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).min(1),
});
type GenResult = z.infer<typeof GenSchema>;

async function ollamaGenerateJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0 },
      format: "json",
    }),
  });
  if (!res.ok) {
    throw new Error(`Ollama /generate failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // data.response might be JSON or JSON string—handle both
  try {
    return typeof data.response === "string" ? JSON.parse(data.response) : data.response;
  } catch (e) {
    // Sometimes models wrap code fences—strip and retry
    const cleaned = String(data.response ?? "")
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim();
    return JSON.parse(cleaned);
  }
}

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) throw new Error(`Ollama /embeddings failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.embedding as number[];
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Minimal in-memory "Chroma-like" index with add/query */
class InMemoryChroma {
  private vectors: Map<string, { embedding: number[]; meta: any }> = new Map();

  add(ids: string[], embeddings: number[][], metadatas: any[]) {
    for (let i = 0; i < ids.length; i++) {
      this.vectors.set(ids[i], { embedding: embeddings[i], meta: metadatas[i] });
    }
  }

  queryByEmbedding(qEmbedding: number[], k = 5, filter?: (meta: any) => boolean) {
    const scores: Array<{ id: string; score: number; meta: any }> = [];
    for (const [id, { embedding, meta }] of this.vectors) {
      if (filter && !filter(meta)) continue;
      scores.push({ id, score: cosine(qEmbedding, embedding), meta });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k);
  }
}

function parseMarkdownChunks(markdown: string): Array<{
  text: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  title?: string;
}> {
  const ast = unified().use(remarkParse).parse(markdown) as any;
  const chunks: Array<{
    text: string;
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
    title?: string;
  }> = [];

  let currentHeading: string | undefined;

  visit(ast, (node: any) => {
    if (!node || !node.type) return;

    if (node.type === "heading") {
      currentHeading = (node.children || [])
        .filter((c: any) => c.type === "text" || c.value)
        .map((c: any) => c.value || c.children?.map((cc: any) => cc.value).join(" ") || "")
        .join(" ")
        .trim();
    }

    // chunk paragraphs, list items, code blocks
    if (["paragraph", "listItem", "code"].includes(node.type)) {
      const pos = node.position;
      if (!pos) return;
      const raw = node.type === "code" ? (node.value || "") : extractText(node);
      const trimmed = (raw || "").trim();
      if (!trimmed) return;

      // If a chunk is extremely long, split on sentences to keep embedding sane
      const sentencey = sentenceSplit(trimmed, 1200);
      for (const s of sentencey) {
        chunks.push({
          text: s,
          startLine: pos.start.line,
          startCol: pos.start.column,
          endLine: pos.end.line,
          endCol: pos.end.column,
          title: currentHeading,
        });
      }
    }
  });

  // fallback: whole doc as one chunk if we found nothing
  if (chunks.length === 0 && markdown.trim().length > 0) {
    chunks.push({
      text: markdown.trim(),
      startLine: 1,
      startCol: 1,
      endLine: markdown.split("\n").length,
      endCol: 1,
      title: undefined,
    });
  }

  return chunks;
}

function extractText(node: any): string {
  let out = "";
  visit(node, (n: any) => {
    if (n.type === "text") out += n.value ?? "";
  });
  return out;
}

function sentenceSplit(s: string, maxLen: number): string[] {
  if (s.length <= maxLen) return [s];
  const parts = s.split(/(?<=[\.\!\?])\s+/);
  const chunks: string[] = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + " " + p).trim().length > maxLen) {
      if (buf) chunks.push(buf.trim());
      buf = p;
    } else {
      buf = (buf ? buf + " " : "") + p;
    }
  }
  if (buf) chunks.push(buf.trim());
  // still too long? hard wrap
  const final: string[] = [];
  for (const c of chunks) {
    if (c.length <= maxLen) final.push(c);
    else {
      for (let i = 0; i < c.length; i += maxLen) final.push(c.slice(i, i + maxLen));
    }
  }
  return final;
}

async function readOrEmptyJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const s = await fs.readFile(file, "utf-8");
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function frontToYAML(front: Front): string {
  return yaml.stringify(front, { indent: 2, simpleKeys: true });
}

async function main() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const chunkCache: Record<string, Chunk[]> = await readOrEmptyJSON(CHUNK_CACHE_FILE, {});
  const embedCache: Record<string, number[]> = await readOrEmptyJSON(EMBED_CACHE_FILE, {});
  const queryCache: QueryCache = await readOrEmptyJSON(QUERY_CACHE_FILE, {});

  // STEP 1: scan files and frontmatter
  const files = await listFilesRec(ROOT_DIR);
  console.log(`Found ${files.length} file(s) in ${ROOT_DIR}`);

  const docsFront: Record<string, Front> = {};
  const docsByUuid: Record<string, { path: string; title: string }> = {};

  // First pass: ensure frontmatter basics
  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const body = gm.content || "";
    const fm: Front = (gm.data || {}) as Front;
    const originalName = path.basename(f);
    let changed = false;

    // ensure uuid
    if (!fm.uuid) {
      fm.uuid = randomUUID();
      changed = true;
    }

    // ensure created_at per request -> original name used as "created_at"
    if (!fm.created_at) {
      fm.created_at = originalName;
      changed = true;
    }

    // generate missing fields iteratively with Ollama
    const haveAll = Boolean(fm.filename && fm.description && ensureArray(fm.tags).length);
    if (!haveAll) {
      const need: Array<keyof GenResult> = [];
      if (!fm.filename) need.push("filename");
      if (!fm.description) need.push("description");
      if (!fm.tags || fm.tags.length === 0) need.push("tags");

      let current: Partial<GenResult> = {};
      // Provide helpful context: body (truncated) + best effort hints
      const preview = body.slice(0, 4000);
      // Try up to 3 rounds to fill all fields
      for (let round = 0; round < 3 && need.length > 0; round++) {
        const askKeys = [...need];
        const sys = [
          `You are generating concise frontmatter for a document.`,
          `Return ONLY a compact JSON object with these keys: ${askKeys.join(", ")}`,
          `Definitions:`,
          ` - filename: A human-friendly title for the doc; avoid extension; no slashes.`,
          ` - description: 1–3 sentence summary.`,
          ` - tags: 3–12 noun-like keywords.`,
          `No markdown, no code fences, no commentary.`,
        ].join("\n");

        const user = [
          `Document path: ${f}`,
          `Original name: ${originalName}`,
          `Existing (for reference):`,
          JSON.stringify(
            {
              filename: fm.filename ?? null,
              description: fm.description ?? null,
              tags: fm.tags ?? null,
            },
            null,
            2
          ),
          `Content preview:\n${preview}`,
        ].join("\n");

        const payload = `SYSTEM:\n${sys}\n\nUSER:\n${user}`;
        let obj: any;
        try {
          obj = await ollamaGenerateJSON(GEN_MODEL, payload);
        } catch (e) {
          console.warn(`Ollama gen error on ${originalName}: ${(e as Error).message}`);
          break;
        }

        // validate partial for chosen keys
        // Build a dynamic schema with just askKeys as required
        const partialShape: any = {};
        if (askKeys.includes("filename")) partialShape.filename = z.string().min(1);
        if (askKeys.includes("description")) partialShape.description = z.string().min(1);
        if (askKeys.includes("tags")) partialShape.tags = z.array(z.string()).min(1);

        const PartialSchema = z.object(partialShape);
        const parsed = PartialSchema.safeParse(obj);
        if (parsed.success) {
          current = { ...current, ...parsed.data };
          // remove fulfilled keys
          for (const k of askKeys) {
            if ((current as any)[k] != null && (k !== "tags" || (current.tags && current.tags.length))) {
              const idx = need.indexOf(k);
              if (idx >= 0) need.splice(idx, 1);
            }
          }
        } else {
          // try to be resilient; next round will re-ask
          console.warn(`Validation failed for ${originalName}, round ${round + 1}:`, parsed.error.issues);
        }
      }

      // Final merge
      if (!fm.filename && current.filename) {
        fm.filename = current.filename;
        changed = true;
      }
      if (!fm.description && current.description) {
        fm.description = current.description;
        changed = true;
      }
      if ((!fm.tags || fm.tags.length === 0) && current.tags) {
        fm.tags = dedupeStrings(current.tags);
        changed = true;
      }
    }

    docsFront[f] = fm;
    docsByUuid[fm.uuid!] = { path: f, title: fm.filename ?? path.parse(f).name };

    // Only write here if we changed basic ids/dates BEFORE later steps
    if (changed && !DRY_RUN) {
      const newRaw = matter.stringify(gm.content, fm, { language: "yaml" });
      await fs.writeFile(f, newRaw, "utf-8");
    }
  }

  // STEP 2: chunk, embed, build in-memory index
  const index = new InMemoryChroma();
  const allChunks: Chunk[] = [];
  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm = docsFront[f];
    const uuid = fm.uuid!;
    const chunks = parseMarkdownChunks(gm.content).map((c, i): Chunk => ({
      id: `${uuid}:${i}`,
      docUuid: uuid,
      docPath: f,
      startLine: c.startLine,
      startCol: c.startCol,
      endLine: c.endLine,
      endCol: c.endCol,
      text: c.text,
      title: c.title,
    }));

    // Embeddings with simple cache keyed by chunk.id
    for (const ch of chunks) {
      const cacheKey = ch.id;
      if (!embedCache[cacheKey]) {
        embedCache[cacheKey] = await ollamaEmbed(EMBED_MODEL, ch.text);
      }
      ch.embedding = embedCache[cacheKey];
    }

    allChunks.push(...chunks);
  }

  // Add to index
  index.add(
    allChunks.map((c) => c.id),
    allChunks.map((c) => c.embedding!) as number[][],
    allChunks.map((c) => ({
      docUuid: c.docUuid,
      docPath: c.docPath,
      startLine: c.startLine,
      startCol: c.startCol,
      endLine: c.endLine,
      endCol: c.endCol,
    }))
  );

  // Persist chunk+embed cache
  if (!DRY_RUN) {
    await fs.writeFile(CHUNK_CACHE_FILE, JSON.stringify(groupByDoc(allChunks), null, 2), "utf-8");
    await fs.writeFile(EMBED_CACHE_FILE, JSON.stringify(embedCache), "utf-8");
  }

  // STEP 3: per-chunk queries
  for (const ch of allChunks) {
    const qkey = ch.id;
    if (queryCache[qkey]) continue;

    const hits = index
      .queryByEmbedding(ch.embedding!, 8, (m) => m.docUuid !== ch.docUuid)
      .map((h) => ({
        id: h.id,
        docUuid: h.meta.docUuid,
        score: h.score,
        startLine: h.meta.startLine,
        startCol: h.meta.startCol,
      }));

    queryCache[qkey] = hits;
  }

  if (!DRY_RUN) {
    await fs.writeFile(QUERY_CACHE_FILE, JSON.stringify(queryCache, null, 2), "utf-8");
  }

  // STEP 4: doc-to-doc similarity aggregation
  const docPairs: Record<string, Record<string, number>> = {}; // A -> B -> score
  function addPair(a: string, b: string, score: number) {
    if (!docPairs[a]) docPairs[a] = {};
    docPairs[a][b] = Math.max(docPairs[a][b] ?? 0, score);
  }

  for (const ch of allChunks) {
    const hits = queryCache[ch.id] || [];
    for (const h of hits) {
      addPair(ch.docUuid, h.docUuid, h.score);
    }
  }

  // Apply related_to_* frontmatter by threshold
  for (const f of files) {
    const fm = docsFront[f];
    const mine = fm.uuid!;
    const peers = Object.entries(docPairs[mine] ?? {})
      .filter(([, score]) => score >= DOC_THRESHOLD)
      .sort((a, b) => b[1] - a[1]);

    const relatedTitles = peers
      .map(([uuid]) => docsByUuid[uuid]?.title)
      .filter(Boolean) as string[];
    const relatedUuids = peers.map(([uuid]) => uuid);

    fm.related_to_title = dedupeStrings([...(fm.related_to_title ?? []), ...relatedTitles]);
    fm.related_to_uuid = dedupeStrings([...(fm.related_to_uuid ?? []), ...relatedUuids]);
  }

  // STEP 5: per-chunk high-confidence refs into frontmatter
  // references: [{ uuid, line, col, score }]
  // Ensure de-duplication by (uuid,line,col)
  for (const f of files) {
    const fm = docsFront[f];
    const myChunks = allChunks.filter((c) => c.docUuid === fm.uuid!);
    const refs: Array<{ uuid: string; line: number; col: number; score?: number }> = fm.references
      ? [...fm.references]
      : [];
    const seen = new Set(refs.map((r) => `${r.uuid}:${r.line}:${r.col}`));

    for (const ch of myChunks) {
      const hits = (queryCache[ch.id] || []).filter((h) => h.score >= REF_THRESHOLD);
      for (const h of hits) {
        const key = `${h.docUuid}:${h.startLine}:${h.startCol}`;
        if (seen.has(key)) continue;
        seen.add(key);
        refs.push({ uuid: h.docUuid, line: h.startLine, col: h.startCol, score: round2(h.score) });
      }
    }

    fm.references = refs;
  }
  // Compute planned final filepath for every doc (so links are stable across renames)
  const plannedPathByUuid: Record<string, string> = {};
  for (const f of files) {
    const fm = docsFront[f];
    const wantBase = fm.filename ? slugify(fm.filename) : path.basename(f, path.extname(f));
    const ext = extnamePrefer(f);
    plannedPathByUuid[fm.uuid!] = path.join(path.dirname(f), `${wantBase}${ext}`);
  }

// STEP 6–9: write frontmatter + footers and rename
for (const f of files) {
  const raw = await fs.readFile(f, "utf-8");
  const gm = matter(raw);
  const fm = docsFront[f];
  const body = gm.content;
  const myPlanned = plannedPathByUuid[fm.uuid!];

  // Build Related content as links to the planned paths
  const relatedLines = (fm.related_to_uuid ?? []).map((u) => {
    const title = docsByUuid[u]?.title ?? u;
    const targetAbs = plannedPathByUuid[u] ?? docsByUuid[u]?.path ?? "";
    const href = relMdLink(myPlanned, targetAbs);
    return `- [${title}](${href})`;
  });

  // Build Sources with line anchors (#L<number>) to the planned paths
  const sourcesLines = (fm.references ?? []).map((r) => {
    const title = docsByUuid[r.uuid]?.title ?? r.uuid;
    const targetAbs = plannedPathByUuid[r.uuid] ?? docsByUuid[r.uuid]?.path ?? "";
    const href = relMdLink(myPlanned, targetAbs, `L${r.line}`);
    const meta = ` (line ${r.line}, col ${r.col}${r.score != null ? `, score ${r.score}` : ""})`;
    return `- [${title} — L${r.line}](${href})${meta}`;
  });

  const footer = [
    "",
    "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->",
    "## Related content",
    ...(relatedLines.length ? relatedLines : ["- _None_"]),
    "",
    "## Sources",
    ...(sourcesLines.length ? sourcesLines : ["- _None_"]),
    "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->",
    "",
  ].join("\n");

  const cleanedBody = stripGeneratedSections(body);
  const newFile = matter.stringify(cleanedBody + footer, fm, { language: "yaml" });

  if (!DRY_RUN) {
    await fs.writeFile(f, newFile, "utf-8");
  }

  // Rename to the planned file name
  const planned = plannedPathByUuid[fm.uuid!];
  if (planned && planned !== f && !DRY_RUN) {
    await fs.rename(f, planned);
    docsByUuid[fm.uuid!].path = planned; // keep registry in sync
  }
}

  // Final cache write
  if (!DRY_RUN) {
    await fs.writeFile(QUERY_CACHE_FILE, JSON.stringify(queryCache, null, 2), "utf-8");
  }

  console.log("Done.");
}

function parseArgs(defaults: Record<string, string>): Record<string, string> {
  const out = { ...defaults };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) {
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[k] = v;
    }
  }
  return out;
}

function stripGeneratedSections(body: string): string {
  const start = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
  const end = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";
  const si = body.indexOf(start);
  const ei = body.indexOf(end);
  if (si >= 0 && ei > si) {
    return (body.slice(0, si).trimEnd() + "\n").trimEnd();
  }
  return body.trimEnd() + "\n";
}

function dedupeStrings(arr: string[]): string[] {
  const s = new Set(arr.map((x) => x.trim()).filter(Boolean));
  return Array.from(s);
}

function groupByDoc(chunks: Chunk[]): Record<string, Chunk[]> {
  const m: Record<string, Chunk[]> = {};
  for (const c of chunks) {
    (m[c.docUuid] ||= []).push(c);
  }
  return m;
}

function round2(n: number | undefined): number | undefined {
  if (n == null) return n;
  return Math.round(n * 100) / 100;
}

function fileExists(p: string): boolean {
  try {
    require("fs").accessSync(p);
    return true;
  } catch {
    return false;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
