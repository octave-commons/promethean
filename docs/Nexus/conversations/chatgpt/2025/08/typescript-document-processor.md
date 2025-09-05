---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "TypeScript document processor"
conversation_id: 68b49968-f7e4-8331-b473-1643e69c1590
create_time: 08/31/2025 at 1:50 PM
update_time: 09/01/2025 at 4:08 PM
---

# Title: TypeScript document processor

Created: 08/31/2025 at 1:50 PM
Last Updated: 09/01/2025 at 4:08 PM
Chat URL: https://chat.openai.com/c/68b49968-f7e4-8331-b473-1643e69c1590


>[!nexus_user] **User** - 08/31/2025 at 1:50 PM
> Give me a simple typescript I can run over my docs/unique directory that reads the contents of every file, and uses ollama to generate a title, and front matter
> 
> ## step 1
> Extract any existing frontmatter from each document.
> 
> If they contain the "filename" "description" and "tags" properties, skip them for this step, add it to the cache.
> If the front matter does not contain "uuid", 
> generate a uuid, use the original name as the created at property for each document.
> 
> Request a json object from ollama with the properties "filename" "description" "tags". Validate the content of the json object with zod. For any missing properties, rerun the request excluding all previously generated properties from the schema, until the full schema has been generated.
> 
> # Step 2
> 
> Now use a language structure aware tokenizer to chunk each document up and add them to an in memory chroma instance with each of the current frontmatter objects as metadata, plus line and column numbers.
> 
> Cache the chunks, line/column numbers, embeddings
> 
> # Step 3 
> 
> Using the in memory chroma store, and the cached chunks/embeddings, iterate through each chunk and query the chroma store.
> 
> Cache the query results
> 
> # Step 4
> 
> Using the cached queries from chroma, generate an overall similarity score for each document to each other document.
> 
> For documents that meet a threshold (an argument to the script), add their uuids and titles to the frontmatter as "related to (title)" and "related to (uuid)"
> 
> # Step 5
> 
> for each cached query result, for any item scoring higher than a configurable threshold, add it to a list of references in the front matter with uuid, line, col
> 
> # Step 6
> 
> Add/update the frontmatter of each document
> 
> # Step 7
> 
> For each related document, add them to the footer under "Related content"
> 
> # Step 8
> 
> for each reference add it to a list of source in the footer
> 
> # Step 9 
> 
> Write the changes and rename the file.
<!-- UID: 46d17d48-a0d4-4931-a0f4-b215106306e4 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 1:50 PM
> Here’s a single-file TypeScript script that does all 9 steps locally with Ollama and an in-memory vector store (Chroma-like). It uses markdown-aware chunking, Zod validation with iterative completion via Ollama, local Ollama embeddings, cosine similarity, and updates frontmatter + footers, then renames files.
> 
> > Minimal deps (no SaaS): `gray-matter`, `zod`, `unified`, `remark-parse`, `unist-util-visit`, `yaml` 
> > Ollama endpoints used: `/api/generate` (JSON output) and `/api/embeddings` (local models only)
> 
> ### Install & run
> 
> ```bash
> pnpm add gray-matter zod unified remark-parse unist-util-visit yaml
> # or: npm i ...
> 
> # Node 18+ recommended (for global fetch + crypto.randomUUID)
> # Run with tsx or ts-node:
> npx tsx process-unique.ts --dir docs/unique \
>  --gen-model "qwen3:4b" \
>  --embed-model "nomic-embed-text:latest" \
>  --doc-threshold 0.78 \
>  --ref-threshold 0.85
> ```
> 
> ### `process-unique.ts`
> 
> ```ts
> /* eslint-disable no-console */
> /**
>  * process-unique.ts
>  *
>  * Steps:
>  * 1) Read docs, extract/update frontmatter; generate {filename, description, tags} with Ollama if missing; ensure uuid + created_at.
>  * 2) Markdown-aware chunking w/ line+col; embed with Ollama; add to in-memory "Chroma"-like index. Cache chunks+embeddings.
>  * 3) For each chunk, query index; cache query results.
>  * 4) Aggregate doc-to-doc similarity; add related_to_title / related_to_uuid in frontmatter when >= threshold.
>  * 5) For per-chunk results above ref-threshold, add references {uuid, line, col} to frontmatter.
>  * 6) Write updated frontmatter.
>  * 7) Append "Related content" footer.
>  * 8) Append "Sources" footer.
>  * 9) Rename file to frontmatter.filename (slugged) if changed.
>  */
> 
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { unified } from "unified";
> import remarkParse from "remark-parse";
> import { visit } from "unist-util-visit";
> import { z } from "zod";
> import * as yaml from "yaml";
> 
> type Front = {
>  uuid?: string;
>  created_at?: string; // original filename as requested
>  filename?: string; // title/sluggy name (no extension enforced)
>  description?: string;
>  tags?: string[];
>  related_to_title?: string[];
>  related_to_uuid?: string[];
>  references?: Array<{ uuid: string; line: number; col: number; score?: number }>;
>  [k: string]: any;
> };
> 
> type Chunk = {
>  id: string; // docUuid:chunkIndex
>  docUuid: string;
>  docPath: string;
>  startLine: number;
>  startCol: number;
>  endLine: number;
>  endCol: number;
>  text: string;
>  embedding?: number[];
>  title?: string; // closest heading if any
> };
> 
> type QueryHit = {
>  id: string;
>  docUuid: string;
>  score: number; // cosine similarity
>  startLine: number;
>  startCol: number;
> };
> 
> type QueryCache = Record<string, QueryHit[]>; // key=chunk.id
> 
> const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> const args = parseArgs({
>  "--dir": "docs/unique",
>  "--gen-model": "qwen3:4b",
>  "--embed-model": "nomic-embed-text:latest",
>  "--doc-threshold": "0.78",
>  "--ref-threshold": "0.85",
>  "--ext": ".md,.mdx,.txt",
>  "--dry-run": "false",
> });
> 
> const ROOT_DIR = path.resolve(process.cwd(), args["--dir"]);
> const GEN_MODEL = args["--gen-model"];
> const EMBED_MODEL = args["--embed-model"];
> const DOC_THRESHOLD = Number(args["--doc-threshold"]);
> const REF_THRESHOLD = Number(args["--ref-threshold"]);
> const DRY_RUN = args["--dry-run"] === "true";
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> 
> const CACHE_DIR = path.join(process.cwd(), ".cache");
> const CHUNK_CACHE_FILE = path.join(CACHE_DIR, "unique-chunks.json");
> const EMBED_CACHE_FILE = path.join(CACHE_DIR, "unique-embeddings.json");
> const QUERY_CACHE_FILE = path.join(CACHE_DIR, "unique-queries.json");
> 
> function ensureArray<T>(x: T | T[] | undefined): T[] {
>  if (!x) return [];
>  return Array.isArray(x) ? x : [x];
> }
> 
> function randomUUID(): string {
>  // Node 18+: crypto.randomUUID available
>  return (globalThis as any).crypto?.randomUUID?.() ?? require("crypto").randomUUID();
> }
> 
> function slugify(s: string): string {
>  return s
>  .trim()
>  .toLowerCase()
>  .replace(/['"]/g, "")
>  .replace(/[^a-z0-9]+/g, "-")
>  .replace(/^-+|-+$/g, "");
> }
> 
> function extnamePrefer(originalPath: string): string {
>  const e = path.extname(originalPath);
>  return e || ".md";
> }
> 
> async function listFilesRec(root: string): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(dir: string) {
>  const ents = await fs.readdir(dir, { withFileTypes: true });
>  for (const ent of ents) {
>  const p = path.join(dir, ent.name);
>  if (ent.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => EXTS.has(path.extname(p).toLowerCase()));
> }
> 
> const GenSchema = z.object({
>  filename: z.string().min(1),
>  description: z.string().min(1),
>  tags: z.array(z.string()).min(1),
> });
> type GenResult = z.infer<typeof GenSchema>;
> 
> async function ollamaGenerateJSON(model: string, prompt: string): Promise<any> {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST",
>  headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({
>  model,
>  prompt,
>  stream: false,
>  options: { temperature: 0 },
>  format: "json",
>  }),
>  });
>  if (!res.ok) {
>  throw new Error(`Ollama /generate failed: ${res.status} ${res.statusText}`);
>  }
>  const data = await res.json();
>  // data.response might be JSON or JSON string—handle both
>  try {
>  return typeof data.response === "string" ? JSON.parse(data.response) : data.response;
>  } catch (e) {
>  // Sometimes models wrap code fences—strip and retry
>  const cleaned = String(data.response ?? "")
>  .replace(/```json\s*/g, "")
>  .replace(/```\s*$/g, "")
>  .trim();
>  return JSON.parse(cleaned);
>  }
> }
> 
> async function ollamaEmbed(model: string, text: string): Promise<number[]> {
>  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
>  method: "POST",
>  headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt: text }),
>  });
>  if (!res.ok) throw new Error(`Ollama /embeddings failed: ${res.status} ${res.statusText}`);
>  const data = await res.json();
>  return data.embedding as number[];
> }
> 
> function cosine(a: number[], b: number[]): number {
>  let dot = 0, na = 0, nb = 0;
>  const n = Math.min(a.length, b.length);
>  for (let i = 0; i < n; i++) {
>  dot += a[i] * b[i];
>  na += a[i] * a[i];
>  nb += b[i] * b[i];
>  }
>  if (na === 0 || nb === 0) return 0;
>  return dot / (Math.sqrt(na) * Math.sqrt(nb));
> }
> 
> /** Minimal in-memory "Chroma-like" index with add/query */
> class InMemoryChroma {
>  private vectors: Map<string, { embedding: number[]; meta: any }> = new Map();
> 
>  add(ids: string[], embeddings: number[][], metadatas: any[]) {
>  for (let i = 0; i < ids.length; i++) {
>  this.vectors.set(ids[i], { embedding: embeddings[i], meta: metadatas[i] });
>  }
>  }
> 
>  queryByEmbedding(qEmbedding: number[], k = 5, filter?: (meta: any) => boolean) {
>  const scores: Array<{ id: string; score: number; meta: any }> = [];
>  for (const [id, { embedding, meta }] of this.vectors) {
>  if (filter && !filter(meta)) continue;
>  scores.push({ id, score: cosine(qEmbedding, embedding), meta });
>  }
>  scores.sort((a, b) => b.score - a.score);
>  return scores.slice(0, k);
>  }
> }
> 
> function parseMarkdownChunks(markdown: string): Array<{
>  text: string;
>  startLine: number;
>  startCol: number;
>  endLine: number;
>  endCol: number;
>  title?: string;
> }> {
>  const ast = unified().use(remarkParse).parse(markdown) as any;
>  const chunks: Array<{
>  text: string;
>  startLine: number;
>  startCol: number;
>  endLine: number;
>  endCol: number;
>  title?: string;
>  }> = [];
> 
>  let currentHeading: string | undefined;
> 
>  visit(ast, (node: any) => {
>  if (!node || !node.type) return;
> 
>  if (node.type === "heading") {
>  currentHeading = (node.children || [])
>  .filter((c: any) => c.type === "text" || c.value)
>  .map((c: any) => c.value || c.children?.map((cc: any) => cc.value).join(" ") || "")
>  .join(" ")
>  .trim();
>  }
> 
>  // chunk paragraphs, list items, code blocks
>  if (["paragraph", "listItem", "code"].includes(node.type)) {
>  const pos = node.position;
>  if (!pos) return;
>  const raw = node.type === "code" ? (node.value || "") : extractText(node);
>  const trimmed = (raw || "").trim();
>  if (!trimmed) return;
> 
>  // If a chunk is extremely long, split on sentences to keep embedding sane
>  const sentencey = sentenceSplit(trimmed, 1200);
>  for (const s of sentencey) {
>  chunks.push({
>  text: s,
>  startLine: pos.start.line,
>  startCol: pos.start.column,
>  endLine: pos.end.line,
>  endCol: pos.end.column,
>  title: currentHeading,
>  });
>  }
>  }
>  });
> 
>  // fallback: whole doc as one chunk if we found nothing
>  if (chunks.length === 0 && markdown.trim().length > 0) {
>  chunks.push({
>  text: markdown.trim(),
>  startLine: 1,
>  startCol: 1,
>  endLine: markdown.split("\n").length,
>  endCol: 1,
>  title: undefined,
>  });
>  }
> 
>  return chunks;
> }
> 
> function extractText(node: any): string {
>  let out = "";
>  visit(node, (n: any) => {
>  if (n.type === "text") out += n.value ?? "";
>  });
>  return out;
> }
> 
> function sentenceSplit(s: string, maxLen: number): string[] {
>  if (s.length <= maxLen) return [s];
>  const parts = s.split(/(?<=[\.\!\?])\s+/);
>  const chunks: string[] = [];
>  let buf = "";
>  for (const p of parts) {
>  if ((buf + " " + p).trim().length > maxLen) {
>  if (buf) chunks.push(buf.trim());
>  buf = p;
>  } else {
>  buf = (buf ? buf + " " : "") + p;
>  }
>  }
>  if (buf) chunks.push(buf.trim());
>  // still too long? hard wrap
>  const final: string[] = [];
>  for (const c of chunks) {
>  if (c.length <= maxLen) final.push(c);
>  else {
>  for (let i = 0; i < c.length; i += maxLen) final.push(c.slice(i, i + maxLen));
>  }
>  }
>  return final;
> }
> 
> async function readOrEmptyJSON<T>(file: string, fallback: T): Promise<T> {
>  try {
>  const s = await fs.readFile(file, "utf-8");
>  return JSON.parse(s) as T;
>  } catch {
>  return fallback;
>  }
> }
> 
> function frontToYAML(front: Front): string {
>  return yaml.stringify(front, { indent: 2, simpleKeys: true });
> }
> 
> async function main() {
>  await fs.mkdir(CACHE_DIR, { recursive: true });
>  const chunkCache: Record<string, Chunk[]> = await readOrEmptyJSON(CHUNK_CACHE_FILE, {});
>  const embedCache: Record<string, number[]> = await readOrEmptyJSON(EMBED_CACHE_FILE, {});
>  const queryCache: QueryCache = await readOrEmptyJSON(QUERY_CACHE_FILE, {});
> 
>  // STEP 1: scan files and frontmatter
>  const files = await listFilesRec(ROOT_DIR);
>  console.log(`Found ${files.length} file(s) in ${ROOT_DIR}`);
> 
>  const docsFront: Record<string, Front> = {};
>  const docsByUuid: Record<string, { path: string; title: string }> = {};
> 
>  // First pass: ensure frontmatter basics
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const body = gm.content || "";
>  const fm: Front = (gm.data || {}) as Front;
>  const originalName = path.basename(f);
>  let changed = false;
> 
>  // ensure uuid
>  if (!fm.uuid) {
>  fm.uuid = randomUUID();
>  changed = true;
>  }
> 
>  // ensure created_at per request -> original name used as "created_at"
>  if (!fm.created_at) {
>  fm.created_at = originalName;
>  changed = true;
>  }
> 
>  // generate missing fields iteratively with Ollama
>  const haveAll = Boolean(fm.filename && fm.description && ensureArray(fm.tags).length);
>  if (!haveAll) {
>  const need: Array<keyof GenResult> = [];
>  if (!fm.filename) need.push("filename");
>  if (!fm.description) need.push("description");
>  if (!fm.tags || fm.tags.length === 0) need.push("tags");
> 
>  let current: Partial<GenResult> = {};
>  // Provide helpful context: body (truncated) + best effort hints
>  const preview = body.slice(0, 4000);
>  // Try up to 3 rounds to fill all fields
>  for (let round = 0; round < 3 && need.length > 0; round++) {
>  const askKeys = [...need];
>  const sys = [
>  `You are generating concise frontmatter for a document.`,
>  `Return ONLY a compact JSON object with these keys: ${askKeys.join(", ")}`,
>  `Definitions:`,
>  ` - filename: A human-friendly title for the doc; avoid extension; no slashes.`,
>  ` - description: 1–3 sentence summary.`,
>  ` - tags: 3–12 noun-like keywords.`,
>  `No markdown, no code fences, no commentary.`,
>  ].join("\n");
> 
>  const user = [
>  `Document path: ${f}`,
>  `Original name: ${originalName}`,
>  `Existing (for reference):`,
>  JSON.stringify(
>  {
>  filename: fm.filename ?? null,
>  description: fm.description ?? null,
>  tags: fm.tags ?? null,
>  },
>  null,
>  2
>  ),
>  `Content preview:\n${preview}`,
>  ].join("\n");
> 
>  const payload = `SYSTEM:\n${sys}\n\nUSER:\n${user}`;
>  let obj: any;
>  try {
>  obj = await ollamaGenerateJSON(GEN_MODEL, payload);
>  } catch (e) {
>  console.warn(`Ollama gen error on ${originalName}: ${(e as Error).message}`);
>  break;
>  }
> 
>  // validate partial for chosen keys
>  // Build a dynamic schema with just askKeys as required
>  const partialShape: any = {};
>  if (askKeys.includes("filename")) partialShape.filename = z.string().min(1);
>  if (askKeys.includes("description")) partialShape.description = z.string().min(1);
>  if (askKeys.includes("tags")) partialShape.tags = z.array(z.string()).min(1);
> 
>  const PartialSchema = z.object(partialShape);
>  const parsed = PartialSchema.safeParse(obj);
>  if (parsed.success) {
>  current = { ...current, ...parsed.data };
>  // remove fulfilled keys
>  for (const k of askKeys) {
>  if ((current as any)[k] != null && (k !== "tags" || (current.tags && current.tags.length))) {
>  const idx = need.indexOf(k);
>  if (idx >= 0) need.splice(idx, 1);
>  }
>  }
>  } else {
>  // try to be resilient; next round will re-ask
>  console.warn(`Validation failed for ${originalName}, round ${round + 1}:`, parsed.error.issues);
>  }
>  }
> 
>  // Final merge
>  if (!fm.filename && current.filename) {
>  fm.filename = current.filename;
>  changed = true;
>  }
>  if (!fm.description && current.description) {
>  fm.description = current.description;
>  changed = true;
>  }
>  if ((!fm.tags || fm.tags.length === 0) && current.tags) {
>  fm.tags = dedupeStrings(current.tags);
>  changed = true;
>  }
>  }
> 
>  docsFront[f] = fm;
>  docsByUuid[fm.uuid!] = { path: f, title: fm.filename ?? path.parse(f).name };
> 
>  // Only write here if we changed basic ids/dates BEFORE later steps
>  if (changed && !DRY_RUN) {
>  const newRaw = matter.stringify(gm.content, fm, { language: "yaml" });
>  await fs.writeFile(f, newRaw, "utf-8");
>  }
>  }
> 
>  // STEP 2: chunk, embed, build in-memory index
>  const index = new InMemoryChroma();
>  const allChunks: Chunk[] = [];
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = docsFront[f];
>  const uuid = fm.uuid!;
>  const chunks = parseMarkdownChunks(gm.content).map((c, i): Chunk => ({
>  id: `${uuid}:${i}`,
>  docUuid: uuid,
>  docPath: f,
>  startLine: c.startLine,
>  startCol: c.startCol,
>  endLine: c.endLine,
>  endCol: c.endCol,
>  text: c.text,
>  title: c.title,
>  }));
> 
>  // Embeddings with simple cache keyed by chunk.id
>  for (const ch of chunks) {
>  const cacheKey = ch.id;
>  if (!embedCache[cacheKey]) {
>  embedCache[cacheKey] = await ollamaEmbed(EMBED_MODEL, ch.text);
>  }
>  ch.embedding = embedCache[cacheKey];
>  }
> 
>  allChunks.push(...chunks);
>  }
> 
>  // Add to index
>  index.add(
>  allChunks.map((c) => c.id),
>  allChunks.map((c) => c.embedding!) as number[][],
>  allChunks.map((c) => ({
>  docUuid: c.docUuid,
>  docPath: c.docPath,
>  startLine: c.startLine,
>  startCol: c.startCol,
>  endLine: c.endLine,
>  endCol: c.endCol,
>  }))
>  );
> 
>  // Persist chunk+embed cache
>  if (!DRY_RUN) {
>  await fs.writeFile(CHUNK_CACHE_FILE, JSON.stringify(groupByDoc(allChunks), null, 2), "utf-8");
>  await fs.writeFile(EMBED_CACHE_FILE, JSON.stringify(embedCache), "utf-8");
>  }
> 
>  // STEP 3: per-chunk queries
>  for (const ch of allChunks) {
>  const qkey = ch.id;
>  if (queryCache[qkey]) continue;
> 
>  const hits = index
>  .queryByEmbedding(ch.embedding!, 8, (m) => m.docUuid !== ch.docUuid)
>  .map((h) => ({
>  id: h.id,
>  docUuid: h.meta.docUuid,
>  score: h.score,
>  startLine: h.meta.startLine,
>  startCol: h.meta.startCol,
>  }));
> 
>  queryCache[qkey] = hits;
>  }
> 
>  if (!DRY_RUN) {
>  await fs.writeFile(QUERY_CACHE_FILE, JSON.stringify(queryCache, null, 2), "utf-8");
>  }
> 
>  // STEP 4: doc-to-doc similarity aggregation
>  const docPairs: Record<string, Record<string, number>> = {}; // A -> B -> score
>  function addPair(a: string, b: string, score: number) {
>  if (!docPairs[a]) docPairs[a] = {};
>  docPairs[a][b] = Math.max(docPairs[a][b] ?? 0, score);
>  }
> 
>  for (const ch of allChunks) {
>  const hits = queryCache[ch.id] || [];
>  for (const h of hits) {
>  addPair(ch.docUuid, h.docUuid, h.score);
>  }
>  }
> 
>  // Apply related_to_* frontmatter by threshold
>  for (const f of files) {
>  const fm = docsFront[f];
>  const mine = fm.uuid!;
>  const peers = Object.entries(docPairs[mine] ?? {})
>  .filter(([, score]) => score >= DOC_THRESHOLD)
>  .sort((a, b) => b[1] - a[1]);
> 
>  const relatedTitles = peers
>  .map(([uuid]) => docsByUuid[uuid]?.title)
>  .filter(Boolean) as string[];
>  const relatedUuids = peers.map(([uuid]) => uuid);
> 
>  fm.related_to_title = dedupeStrings([...(fm.related_to_title ?? []), ...relatedTitles]);
>  fm.related_to_uuid = dedupeStrings([...(fm.related_to_uuid ?? []), ...relatedUuids]);
>  }
> 
>  // STEP 5: per-chunk high-confidence refs into frontmatter
>  // references: [{ uuid, line, col, score }]
>  // Ensure de-duplication by (uuid,line,col)
>  for (const f of files) {
>  const fm = docsFront[f];
>  const myChunks = allChunks.filter((c) => c.docUuid === fm.uuid!);
>  const refs: Array<{ uuid: string; line: number; col: number; score?: number }> = fm.references
>  ? [...fm.references]
>  : [];
>  const seen = new Set(refs.map((r) => `${r.uuid}:${r.line}:${r.col}`));
> 
>  for (const ch of myChunks) {
>  const hits = (queryCache[ch.id] || []).filter((h) => h.score >= REF_THRESHOLD);
>  for (const h of hits) {
>  const key = `${h.docUuid}:${h.startLine}:${h.startCol}`;
>  if (seen.has(key)) continue;
>  seen.add(key);
>  refs.push({ uuid: h.docUuid, line: h.startLine, col: h.startCol, score: round2(h.score) });
>  }
>  }
> 
>  fm.references = refs;
>  }
> 
>  // STEP 6–9: write frontmatter + footers and rename
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = docsFront[f];
>  const body = gm.content;
> 
>  const relatedLines = (fm.related_to_uuid ?? []).map((u) => {
>  const title = docsByUuid[u]?.title ?? u;
>  return `- ${title} (${u})`;
>  });
> 
>  const sourcesLines = (fm.references ?? []).map((r) => {
>  const title = docsByUuid[r.uuid]?.title ?? r.uuid;
>  const score = r.score != null ? ` — score ${r.score}` : "";
>  return `- ${title} (${r.uuid}) — line ${r.line}, col ${r.col}${score}`;
>  });
> 
>  const footer = [
>  "",
>  "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->",
>  "## Related content",
>  ...(relatedLines.length ? relatedLines : ["- _None_"]),
>  "",
>  "## Sources",
>  ...(sourcesLines.length ? sourcesLines : ["- _None_"]),
>  "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->",
>  "",
>  ].join("\n");
> 
>  const cleanedBody = stripGeneratedSections(body);
>  const newFile = matter.stringify(cleanedBody + footer, fm, { language: "yaml" });
> 
>  if (!DRY_RUN) {
>  await fs.writeFile(f, newFile, "utf-8");
>  }
> 
>  // Rename based on fm.filename (slug) + original extension
>  if (fm.filename) {
>  const wantBase = slugify(fm.filename);
>  const ext = extnamePrefer(f);
>  const currentBase = path.basename(f, path.extname(f));
>  if (wantBase && wantBase !== currentBase) {
>  const dir = path.dirname(f);
>  let target = path.join(dir, `${wantBase}${ext}`);
>  // ensure unique
>  let i = 1;
>  while (target !== f && fileExists(target)) {
>  target = path.join(dir, `${wantBase}-${i++}${ext}`);
>  }
>  if (target !== f && !DRY_RUN) {
>  await fs.rename(f, target);
>  // Update registry entry to new path
>  docsByUuid[fm.uuid!].path = target;
>  }
>  }
>  }
>  }
> 
>  // Final cache write
>  if (!DRY_RUN) {
>  await fs.writeFile(QUERY_CACHE_FILE, JSON.stringify(queryCache, null, 2), "utf-8");
>  }
> 
>  console.log("Done.");
> }
> 
> function parseArgs(defaults: Record<string, string>): Record<string, string> {
>  const out = { ...defaults };
>  const argv = process.argv.slice(2);
>  for (let i = 0; i < argv.length; i++) {
>  const k = argv[i];
>  if (k.startsWith("--")) {
>  const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
>  out[k] = v;
>  }
>  }
>  return out;
> }
> 
> function stripGeneratedSections(body: string): string {
>  const start = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
>  const end = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";
>  const si = body.indexOf(start);
>  const ei = body.indexOf(end);
>  if (si >= 0 && ei > si) {
>  return (body.slice(0, si).trimEnd() + "\n").trimEnd();
>  }
>  return body.trimEnd() + "\n";
> }
> 
> function dedupeStrings(arr: string[]): string[] {
>  const s = new Set(arr.map((x) => x.trim()).filter(Boolean));
>  return Array.from(s);
> }
> 
> function groupByDoc(chunks: Chunk[]): Record<string, Chunk[]> {
>  const m: Record<string, Chunk[]> = {};
>  for (const c of chunks) {
>  (m[c.docUuid] ||= []).push(c);
>  }
>  return m;
> }
> 
> function round2(n: number | undefined): number | undefined {
>  if (n == null) return n;
>  return Math.round(n * 100) / 100;
> }
> 
> function fileExists(p: string): boolean {
>  try {
>  require("fs").accessSync(p);
>  return true;
>  } catch {
>  return false;
>  }
> }
> 
> main().catch((e) => {
>  console.error(e);
>  process.exit(1);
> });
> ```
> 
> #### Notes / knobs
> - `--gen-model` is the Ollama model used to propose `filename`, `description`, `tags`. Pick one you already have (e.g., `gemma3:latest`, `qwen3:4b`, etc.).
> - `--embed-model` should be a local embedding model available in Ollama (e.g., `nomic-embed-text:latest`).
> - Thresholds: `--doc-threshold` controls document-to-document “related” inclusion; `--ref-threshold` controls per-chunk “Sources” references.
> - The script writes caches in `.cache/` (`unique-chunks.json`, `unique-embeddings.json`, `unique-queries.json`) to avoid recomputing embeddings/queries.
> - Footers are wrapped between markers so re-runs replace them cleanly.
> - File renaming uses the generated `filename` slug + original extension; it avoids collisions by appending `-1`, `-2`, etc.
> 
> If you want this split into a tiny CLI + library (or wired into your existing `packages/` layout), say the word and I’ll refactor it to match your repo shape.
<!-- UID: d2bb7240-0c59-485d-b981-48e03803460b -->

---




>[!nexus_user] **User** - 08/31/2025 at 2:11 PM
> if this was ran again, would it rewrite the footer, or append to it?
<!-- UID: a89afe32-6c19-41db-a4fd-ec684e035d33 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 2:11 PM
> It rewrites (replaces), not appends.
> 
> On each run, the script removes anything between:
> 
> ```
> <!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
> ... (old generated content) ...
> <!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
> ```
> 
> then writes a fresh footer. If those markers aren’t present yet, it appends the footer once. Frontmatter fields like `related_to_*` and `references` are de-duplicated and updated, so you won’t get duplicates there either. If you want to keep custom notes, put them **above** the start marker—they won’t be touched.
<!-- UID: f92572ab-db0c-4c7c-ad39-8708a97b7c47 -->

---




>[!nexus_user] **User** - 08/31/2025 at 2:13 PM
> ok. So this can be ran again to regenerate the docs. I want to change how the footer is generated. They should be markdown . you should be able to reference specific line numbers in a link for the sources.
<!-- UID: 9cd0c10f-f401-4017-8363-2b4f7f2bf2f3 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 2:13 PM
> Yep—easy tweak. Here’s a small patch to make the footer use **Markdown **, and make **Sources** link to a specific **line** (`#L<number>` GitHub-style). It also precomputes each file’s *planned* final path so stay correct even when files get renamed in the same run.
> 
> ### 1) Add this helper near the top (after imports)
> 
> ```ts
> function relMdLink(fromFileAbs: string, toFileAbs: string, anchor?: string): string {
>  const rel = path.relative(path.dirname(fromFileAbs), toFileAbs).replace(/\\/g, "/");
>  return anchor ? `${rel}#${anchor}` : rel;
> }
> ```
> 
> ### 2) Before “STEP 6–9: write frontmatter + footers and rename”, precompute final paths
> 
> ```ts
> // Compute planned final filepath for every doc (so are stable across renames)
> const plannedPathByUuid: Record<string, string> = {};
> for (const f of files) {
>  const fm = docsFront[f];
>  const wantBase = fm.filename ? slugify(fm.filename) : path.basename(f, path.extname(f));
>  const ext = extnamePrefer(f);
>  plannedPathByUuid[fm.uuid!] = path.join(path.dirname(f), `${wantBase}${ext}`);
> }
> ```
> 
> ### 3) Replace the footer-building block inside STEP 6–9 with this
> 
> ```ts
> // STEP 6–9: write frontmatter + footers and rename
> for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = docsFront[f];
>  const body = gm.content;
>  const myPlanned = plannedPathByUuid[fm.uuid!];
> 
>  // Build Related content as to the planned paths
>  const relatedLines = (fm.related_to_uuid ?? []).map((u) => {
>  const title = docsByUuid[u]?.title ?? u;
>  const targetAbs = plannedPathByUuid[u] ?? docsByUuid[u]?.path ?? "";
>  const href = relMdLink(myPlanned, targetAbs);
>  return `- [${title}](${href})`;
>  });
> 
>  // Build Sources with line anchors (#L<number>) to the planned paths
>  const sourcesLines = (fm.references ?? []).map((r) => {
>  const title = docsByUuid[r.uuid]?.title ?? r.uuid;
>  const targetAbs = plannedPathByUuid[r.uuid] ?? docsByUuid[r.uuid]?.path ?? "";
>  const href = relMdLink(myPlanned, targetAbs, `L${r.line}`);
>  const meta = ` (line ${r.line}, col ${r.col}${r.score != null ? `, score ${r.score}` : ""})`;
>  return `- [${title} — L${r.line}](${href})${meta}`;
>  });
> 
>  const footer = [
>  "",
>  "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->",
>  "## Related content",
>  ...(relatedLines.length ? relatedLines : ["- _None_"]),
>  "",
>  "## Sources",
>  ...(sourcesLines.length ? sourcesLines : ["- _None_"]),
>  "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->",
>  "",
>  ].join("\n");
> 
>  const cleanedBody = stripGeneratedSections(body);
>  const newFile = matter.stringify(cleanedBody + footer, fm, { language: "yaml" });
> 
>  if (!DRY_RUN) {
>  await fs.writeFile(f, newFile, "utf-8");
>  }
> 
>  // Rename to the planned file name
>  const planned = plannedPathByUuid[fm.uuid!];
>  if (planned && planned !== f && !DRY_RUN) {
>  await fs.rename(f, planned);
>  docsByUuid[fm.uuid!].path = planned; // keep registry in sync
>  }
> }
> ```
> 
> That’s it. Re-running will **replace** the generated footer each time, with:
> 
> - **Related content**: `- [Title](relative/path.md)`
> - **Sources**: `- [Title — L123](relative/path.md#L123) (line 123, col 4, score 0.92)`
> 
> If you’d like Obsidian-style deep instead (e.g., open a file at a line), say the word and I’ll swap the anchor format (or add a `--anchor-style` flag).
<!-- UID: cb4066e9-ef1a-48ee-ac7b-4732f3f79b3f -->

---




>[!nexus_user] **User** - 08/31/2025 at 2:25 PM
> jesus obsidian does not like that much front matter for editing, I literally cannot interact with these documents at the default scoring settings with out going into read mode. This is awesome though, only thing is that it doesn't seem like obsidian recognize the line number format...
<!-- UID: be911310-fa76-4ed7-94f5-49d3892e40d5 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 2:25 PM
> Totally—two fixes:
> 
> 1) **Obsidian-friendly deep ** 
> Use **block IDs** (`#^id`) instead of `#L123`. We’ll auto-insert `^ids` at the referenced blocks and link to them with plain Markdown: 
> `[Title — L123](relative/path.md#^ref-<uuid>-<line>-<col>)` 
> This is Obsidian-native and jumps to the exact block. (For code fences, we place the `^id` on the line *after* the fence to avoid breaking it.)
> 
> 2) **Shrink frontmatter** 
> Cap how much we stuff into YAML (so editing doesn’t lag). Keep the *full* lists in the footer, but limit the YAML to a small, configurable top-N.
> 
> Below is a focused patch (drop-in edits to your script).
> 
> ---
> 
> ### Add flags (near arg parsing)
> 
> ```ts
> // New knobs
> const ANCHOR_STYLE = (args["--anchor-style"] ?? "block") as "block" | "heading";
> // heading = jump to nearest heading instead of exact block (no doc edits)
> const FRONTMATTER_REFS = args["--frontmatter-refs"] !== "false"; // default true
> const MAX_FM_REFS = Number(args["--max-frontmatter-refs"] ?? 25);
> const MAX_FM_RELATED = Number(args["--max-frontmatter-related"] ?? 15);
> ```
> 
> ### Helpers (near other utils)
> 
> ```ts
> function anchorId(docUuid: string, line: number, col: number) {
>  return `ref-${docUuid.slice(0, 8)}-${line}-${col}`;
> }
> 
> function injectAnchorsIntoContent(
>  content: string,
>  anchors: Array<{ endLine: number; id: string; kind: "text" | "code" }>
> ): string {
>  if (!anchors.length) return content;
>  const lines = content.split("\n");
>  // ensure stable order
>  anchors
>  .sort((a, b) => a.endLine - b.endLine)
>  .forEach(({ endLine, id, kind }) => {
>  const idx = Math.max(1, Math.min(endLine, lines.length)) - 1;
>  // Skip if this id already present on or right after the target line
>  if (lines[idx]?.includes(`^${id}`) || lines[idx + 1]?.trim() === `^${id}`) return;
> 
>  if (kind === "code") {
>  // Don't mutate the ``` fence; add a standalone block-id line after
>  lines.splice(idx + 1, 0, `^${id}`);
>  } else {
>  lines[idx] = (lines[idx] ?? "").replace(/\s*$/, ` ^${id}`);
>  }
>  });
>  return lines.join("\n");
> }
> ```
> 
> ### Track chunk kind (in your chunking code, set `kind`)
> 
> ```ts
> type Chunk = {
>  // ...
>  kind: "text" | "code";
> };
> 
> if (["paragraph", "listItem", "code"].includes(node.type)) {
>  // ...
>  const kind = node.type === "code" ? "code" : "text";
>  // ...
>  chunks.push({
>  // ...
>  kind,
>  });
> }
> ```
> 
> ### Build a quick lookup + collect needed anchors (right after `allChunks` is built and `queryCache` computed)
> 
> ```ts
> // Fast lookup: docUuid:startLine:startCol -> Chunk
> const chunkByStart: Record<string, Chunk> = {};
> for (const c of allChunks) {
>  chunkByStart[`${c.docUuid}:${c.startLine}:${c.startCol}`] = c;
> }
> 
> // Anchors we must plant into target docs so Obsidian can jump to blocks
> const anchorsNeededByDoc: Record<string, Array<{ endLine: number; id: string; kind: "text" | "code" }>> = {};
> 
> for (const ch of allChunks) {
>  const hits = queryCache[ch.id] || [];
>  for (const h of hits) {
>  if (h.score < REF_THRESHOLD) continue; // same threshold you use for “Sources”
>  if (ANCHOR_STYLE !== "block") continue; // heading mode doesn’t edit docs
>  const target = chunkByStart[`${h.docUuid}:${h.startLine}:${h.startCol}`];
>  const endLine = target?.endLine ?? h.startLine;
>  const kind = target?.kind ?? "text";
>  const id = anchorId(h.docUuid, h.startLine, h.startCol);
>  (anchorsNeededByDoc[h.docUuid] ||= []).push({ endLine, id, kind });
>  }
> }
> ```
> 
> ### Limit YAML bloat (after you compute related/references, before writing)
> 
> ```ts
> for (const f of files) {
>  const fm = docsFront[f];
> 
>  // De-dup + cap related in frontmatter
>  fm.related_to_uuid = (fm.related_to_uuid ?? []).slice(0, MAX_FM_RELATED);
>  fm.related_to_title = (fm.related_to_title ?? []).slice(0, MAX_FM_RELATED);
> 
>  // Handle references size in frontmatter
>  if (!FRONTMATTER_REFS) {
>  delete fm.references; // keep them only in the footer
>  } else {
>  fm.references = (fm.references ?? []).slice(0, MAX_FM_REFS);
>  }
> }
> ```
> 
> ### Replace footer builder to use Obsidian anchors
> 
> ```ts
> // Before the STEP 6–9 loop:
> const plannedPathByUuid: Record<string, string> = {};
> for (const f of files) {
>  const fm = docsFront[f];
>  const wantBase = fm.filename ? slugify(fm.filename) : path.basename(f, path.extname(f));
>  const ext = extnamePrefer(f);
>  plannedPathByUuid[fm.uuid!] = path.join(path.dirname(f), `${wantBase}${ext}`);
> }
> 
> function relMdLink(fromAbs: string, toAbs: string, anchor?: string) {
>  const rel = path.relative(path.dirname(fromAbs), toAbs).replace(/\\/g, "/");
>  return anchor ? `${rel}#${anchor}` : rel;
> }
> 
> // Inside STEP 6–9 loop per file:
> const myPlanned = plannedPathByUuid[fm.uuid!];
> 
> // (A) Related content -> plain file 
> const relatedLines = (fm.related_to_uuid ?? []).map((u) => {
>  const title = docsByUuid[u]?.title ?? u;
>  const targetAbs = plannedPathByUuid[u] ?? docsByUuid[u]?.path ?? "";
>  const href = relMdLink(myPlanned, targetAbs);
>  return `- [${title}](${href})`;
> });
> 
> // (B) Sources -> block anchors or nearest heading
> const sourcesLines = (fm.references ?? []).map((r) => {
>  const title = docsByUuid[r.uuid]?.title ?? r.uuid;
>  const targetAbs = plannedPathByUuid[r.uuid] ?? docsByUuid[r.uuid]?.path ?? "";
> 
>  let anchor = "";
>  if (ANCHOR_STYLE === "block") {
>  anchor = `^${anchorId(r.uuid, r.line, r.col)}`; // Obsidian block link
>  } else {
>  // Heading fallback: use nearest heading name we captured during chunking (best-effort)
>  const targetChunk = chunkByStart[`${r.uuid}:${r.line}:${r.col}`];
>  const heading = targetChunk?.title
>  ? targetChunk.title.trim().replace(/\s+/g, "-").replace(/[^A-Za-z0-9\-]/g, "").toLowerCase()
>  : "";
>  anchor = heading ? `${heading}` : "";
>  }
> 
>  const href = relMdLink(myPlanned, targetAbs, anchor || undefined);
>  const meta = ` (line ${r.line}, col ${r.col}${r.score != null ? `, score ${r.score}` : ""})`;
>  return `- [${title} — L${r.line}](${href})${meta}`;
> });
> ```
> 
> ### Inject anchors into target docs before writing (only if `--anchor-style block`)
> 
> ```ts
> // Still inside STEP 6–9 per-file loop, before building footer:
> let bodyForWrite = gm.content;
> 
> if (ANCHOR_STYLE === "block") {
>  const needed = anchorsNeededByDoc[fm.uuid!] ?? [];
>  if (needed.length) {
>  bodyForWrite = injectAnchorsIntoContent(bodyForWrite, needed);
>  }
> }
> 
> const cleanedBody = stripGeneratedSections(bodyForWrite);
> const newFile = matter.stringify(cleanedBody + footer, fm, { language: "yaml" });
> ```
> 
> ---
> 
> ### Usage examples
> 
> - **Precise jumps (edit docs, best UX):**
>  ```bash
>  npx tsx process-unique.ts --anchor-style block --max-frontmatter-refs 20 --max-frontmatter-related 12
>  ```
> 
> - **No doc edits (coarser; jump to headings):**
>  ```bash
>  npx tsx process-unique.ts --anchor-style heading --frontmatter-refs false
>  ```
> 
> ---
> 
> #### Why this works for Obsidian
> 
> - Obsidian recognizes **block IDs** (`^id`) and will navigate to `#^id` anchors in normal Markdown .
> - Keeping frontmatter lean prevents the YAML header from overwhelming the editor; long lists live in the **footer** instead.
> - Code fences stay intact (we add the `^id` on the line *after* the closing ```).
> 
> Want me to also add a `--top-k-sources` for the footer itself and/or a global hard cap on total `^id` insertions per file?
<!-- UID: 1b8adca9-cb51-4d8b-9098-9a09e55cfe8e -->

---




>[!nexus_user] **User** - 08/31/2025 at 2:42 PM
> oooook this file is too much to handle adding stuff to it like this with you, write this as a new script. We have the frontmatter data after all, so we don't need to do this in the same loop.
<!-- UID: cb34eff5-b8a1-48f1-8eb5-143e8ec79f22 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 2:42 PM
> Got it — here’s a **separate** script that only (a) injects Obsidian-friendly anchors and (b) regenerates the footer as **Markdown ** using the frontmatter you already have. It does **not** touch your embeddings, caches, or heavy steps, and it **doesn’t modify frontmatter** unless you ask it to via flags.
> 
> ### Install & run
> 
> ```bash
> pnpm add gray-matter yaml
> # or: npm i gray-matter yaml
> 
> # run (Node 18+):
> npx tsx regen-footers.ts --dir docs/unique --anchor-style block
> # or no file edits (coarser): --anchor-style heading
> # dry-run to see changes without writing:
> npx tsx regen-footers.ts --dir docs/unique --dry-run true
> ```
> 
> ### `regen-footers.ts`
> 
> ```ts
> /* eslint-disable no-console */
> /**
>  * regen-footers.ts
>  *
>  * Purpose: Separate pass that ONLY:
>  * - injects Obsidian-friendly anchors (block IDs) for referenced lines (optional)
>  * - replaces the generated footer with Markdown :
>  * - Related content: [Title](relative/path.md)
>  * - Sources: [Title — L123](relative/path.md#^block-id) (line/col/score)
>  *
>  * Reads ONLY existing frontmatter:
>  * - related_to_uuid, related_to_title
>  * - references: [{ uuid, line, col, score? }]
>  *
>  * No renaming, no embeddings, no model calls, no frontmatter changes (unless flags).
>  */
> 
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import * as yaml from "yaml";
> 
> type Front = {
>  uuid?: string;
>  filename?: string;
>  related_to_title?: string[];
>  related_to_uuid?: string[];
>  references?: Array<{ uuid: string; line: number; col: number; score?: number }>;
>  [k: string]: any;
> };
> 
> const args = parseArgs({
>  "--dir": "docs/unique",
>  "--ext": ".md,.mdx,.txt",
>  "--anchor-style": "block", // "block" | "heading" | "none"
>  "--include-related": "true",
>  "--include-sources": "true",
>  "--frontmatter-trim": "false", // if true, trim FM lists to max below
>  "--max-fm-related": "15",
>  "--max-fm-refs": "25",
>  "--dry-run": "false",
> });
> 
> const ROOT_DIR = path.resolve(process.cwd(), args["--dir"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const ANCHOR_STYLE = args["--anchor-style"] as "block" | "heading" | "none";
> const INCLUDE_RELATED = args["--include-related"] === "true";
> const INCLUDE_SOURCES = args["--include-sources"] === "true";
> const TRIM_FM = args["--frontmatter-trim"] === "true";
> const MAX_FM_RELATED = Number(args["--max-fm-related"]);
> const MAX_FM_REFS = Number(args["--max-fm-refs"]);
> const DRY_RUN = args["--dry-run"] === "true";
> 
> const START_MARK = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
> const END_MARK = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";
> 
> function parseArgs(defaults: Record<string, string>): Record<string, string> {
>  const out = { ...defaults };
>  const argv = process.argv.slice(2);
>  for (let i = 0; i < argv.length; i++) {
>  const k = argv[i];
>  if (k.startsWith("--")) {
>  const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
>  out[k] = v;
>  }
>  }
>  return out;
> }
> 
> async function listFilesRec(root: string): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(dir: string) {
>  const ents = await fs.readdir(dir, { withFileTypes: true });
>  for (const ent of ents) {
>  const p = path.join(dir, ent.name);
>  if (ent.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => EXTS.has(path.extname(p).toLowerCase()));
> }
> 
> function anchorId(docUuid: string, line: number, col: number) {
>  const short = (docUuid ?? "nouuid").slice(0, 8);
>  return `ref-${short}-${line}-${col}`;
> }
> 
> function relMdLink(fromFileAbs: string, toFileAbs: string, anchor?: string): string {
>  const rel = path.relative(path.dirname(fromFileAbs), toFileAbs).replace(/\\/g, "/");
>  return anchor ? `${rel}#${anchor}` : rel;
> }
> 
> // Strip previous generated section (if any)
> function stripGeneratedSections(body: string): string {
>  const si = body.indexOf(START_MARK);
>  const ei = body.indexOf(END_MARK);
>  if (si >= 0 && ei > si) {
>  return (body.slice(0, si).trimEnd() + "\n").trimEnd();
>  }
>  return body.trimEnd() + "\n";
> }
> 
> function slugify(s: string): string {
>  return s
>  .trim()
>  .toLowerCase()
>  .replace(/['"]/g, "")
>  .replace(/[^a-z0-9]+/g, "-")
>  .replace(/^-+|-+$/g, "");
> }
> 
> function titleFor(front: Front, filePath: string): string {
>  return front.filename || path.parse(filePath).name;
> }
> 
> // Lightweight code-fence tracker so we don't break fenced code
> function computeFenceMap(lines: string[]): boolean[] {
>  // true if inside a fence at that line
>  const inside: boolean[] = new Array(lines.length).fill(false);
>  let inFence = false;
>  let fenceChar: "`" | "~" | null = null;
>  let fenceLen = 0;
> 
>  const fenceRe = /^(\s*)(`{3,}|~{3,})(.*)$/;
> 
>  for (let i = 0; i < lines.length; i++) {
>  const L = lines[i];
> 
>  if (!inFence) {
>  const m = L.match(fenceRe);
>  if (m) {
>  inFence = true;
>  fenceChar = (m[2][0] as "`" | "~") || "`";
>  fenceLen = m[2].length;
>  inside[i] = true;
>  continue;
>  }
>  } else {
>  inside[i] = true;
>  // closing fence must match same char and length
>  const m = L.match(fenceRe);
>  if (m && (m[2][0] as "`" | "~") === fenceChar && m[2].length >= fenceLen) {
>  // this line is still "inside"; next line is outside
>  inFence = false;
>  }
>  }
>  }
>  return inside;
> }
> 
> // Inject ^block IDs without breaking code blocks:
> // - if target line inside a fenced block -> place "^id" on the line AFTER the closing fence
> // - else append " ^id" at the end of the target line (idempotent)
> function injectAnchors(content: string, want: Array<{ line: number; id: string }>): string {
>  if (!want.length) return content;
>  const lines = content.split("\n");
>  const inside = computeFenceMap(lines);
> 
>  // Deduplicate targets and keep ascending order
>  const uniq = new Map<string, { line: number; id: string }>();
>  for (const w of want) uniq.set(`${w.line}:${w.id}`, w);
>  const anchors = Array.from(uniq.values()).sort((a, b) => a.line - b.line);
> 
>  // Quick presence check to avoid duplicate injections
>  const hasIdOnOrNext = (idx: number, id: string) =>
>  (lines[idx] && lines[idx].includes(`^${id}`)) ||
>  (lines[idx + 1] && lines[idx + 1].trim() === `^${id}`);
> 
>  // Find next line index outside fence
>  const nextOutsideIdx = (idx: number) => {
>  let i = Math.min(idx, lines.length - 1);
>  while (i < lines.length && inside[i]) i++;
>  return i;
>  };
> 
>  for (const { line, id } of anchors) {
>  // 1-based -> 0-based
>  let idx = Math.max(1, Math.min(line, lines.length)) - 1;
> 
>  // If already present, skip
>  if (hasIdOnOrNext(idx, id)) continue;
> 
>  if (inside[idx]) {
>  // place after fence closes
>  const j = nextOutsideIdx(idx + 1);
>  if (j >= lines.length) {
>  // append at end
>  lines.push(`^${id}`);
>  } else {
>  // only inject if not present already
>  if (!hasIdOnOrNext(j, id)) lines.splice(j, 0, `^${id}`);
>  }
>  } else {
>  // add to end of the target line
>  lines[idx] = (lines[idx] ?? "").replace(/\s*$/, ` ^${id}`);
>  }
>  }
> 
>  return lines.join("\n");
> }
> 
> // For heading-style anchors, generate slug from the nearest heading above a line
> function nearestHeadingAnchor(content: string, line: number): string | undefined {
>  const lines = content.split("\n");
>  for (let i = Math.max(1, line) - 1; i >= 0; i--) {
>  const m = lines[i].match(/^\s{0,3}#{1,6}\s+(.*)$/);
>  if (m) {
>  const text = m[1].trim().toLowerCase();
>  const anchor = text
>  .replace(/[^a-z0-9\s-]/g, "")
>  .replace(/\s+/g, "-")
>  .replace(/-+/g, "-");
>  return anchor || undefined;
>  }
>  }
>  return undefined;
> }
> 
> async function main() {
>  const files = await listFilesRec(ROOT_DIR);
>  console.log(`Found ${files.length} file(s) in ${ROOT_DIR}`);
> 
>  // Pass 1: read all frontmatters; map uuid -> { path, title }
>  const frontsByPath: Record<string, Front> = {};
>  const byUuid: Record<string, { path: string; title: string }> = {};
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = (gm.data || {}) as Front;
>  frontsByPath[f] = fm;
>  if (fm.uuid) {
>  byUuid[fm.uuid] = { path: f, title: titleFor(fm, f) };
>  }
>  }
> 
>  // Optionally trim FM lists (to reduce YAML bloat).
>  if (TRIM_FM) {
>  for (const f of files) {
>  const fm = frontsByPath[f];
>  let changed = false;
>  if (fm.related_to_uuid && fm.related_to_uuid.length > MAX_FM_RELATED) {
>  fm.related_to_uuid = fm.related_to_uuid.slice(0, MAX_FM_RELATED);
>  changed = true;
>  }
>  if (fm.related_to_title && fm.related_to_title.length > MAX_FM_RELATED) {
>  fm.related_to_title = fm.related_to_title.slice(0, MAX_FM_RELATED);
>  changed = true;
>  }
>  if (fm.references && fm.references.length > MAX_FM_REFS) {
>  fm.references = fm.references.slice(0, MAX_FM_REFS);
>  changed = true;
>  }
>  if (changed && !DRY_RUN) {
>  // Do NOT modify body, just FM
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const newRaw = matter.stringify(gm.content, fm, { language: "yaml" });
>  await fs.writeFile(f, newRaw, "utf-8");
>  }
>  }
>  }
> 
>  // If block anchors are requested, gather all needed anchors per target doc
>  const anchorsNeededByDoc: Record<string, Array<{ line: number; id: string }>> = {};
>  if (ANCHOR_STYLE === "block") {
>  for (const f of files) {
>  const fm = frontsByPath[f];
>  const refs = fm.references || [];
>  for (const r of refs) {
>  const target = byUuid[r.uuid];
>  if (!target) continue;
>  const id = anchorId(r.uuid, r.line, r.col);
>  (anchorsNeededByDoc[target.path] ||= []).push({ line: r.line, id });
>  }
>  }
>  }
> 
>  // Pass 2: per-file update footers (and inject anchors if requested)
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = frontsByPath[f];
>  const content0 = gm.content;
> 
>  let content = content0;
> 
>  // Inject block anchors into THIS file if any refs point here
>  if (ANCHOR_STYLE === "block") {
>  const needs = anchorsNeededByDoc[f] || [];
>  if (needs.length) {
>  content = injectAnchors(content, needs);
>  }
>  }
> 
>  // Build footer
>  const me = f;
>  const myTitle = titleFor(fm, f);
> 
>  const relatedLines: string[] = [];
>  if (INCLUDE_RELATED) {
>  const relUuids = fm.related_to_uuid || [];
>  for (const u of relUuids) {
>  const ref = byUuid[u];
>  if (!ref) continue;
>  const href = relMdLink(me, ref.path);
>  const title = byUuid[u]?.title ?? u;
>  relatedLines.push(`- [${title}](${href})`);
>  }
>  if (relatedLines.length === 0) relatedLines.push("- _None_");
>  }
> 
>  const sourceLines: string[] = [];
>  if (INCLUDE_SOURCES) {
>  const refs = fm.references || [];
>  for (const r of refs) {
>  const ref = byUuid[r.uuid];
>  if (!ref) continue;
>  let anchor = "";
>  if (ANCHOR_STYLE === "block") {
>  anchor = `^${anchorId(r.uuid, r.line, r.col)}`;
>  } else if (ANCHOR_STYLE === "heading") {
>  // best-effort heading near that line in target doc
>  const targetRaw = await fs.readFile(ref.path, "utf-8");
>  const targetGm = matter(targetRaw);
>  const heading = nearestHeadingAnchor(targetGm.content, r.line);
>  if (heading) anchor = heading;
>  } // none -> empty
> 
>  const href = relMdLink(me, ref.path, anchor || undefined);
>  const title = ref.title || r.uuid;
>  const meta = ` (line ${r.line}, col ${r.col}${r.score != null ? `, score ${round2(r.score)}` : ""})`;
>  sourceLines.push(`- [${title} — L${r.line}](${href})${meta}`);
>  }
>  if (sourceLines.length === 0) sourceLines.push("- _None_");
>  }
> 
>  const footer = [
>  "",
>  START_MARK,
>  INCLUDE_RELATED ? "## Related content" : "",
>  ...(INCLUDE_RELATED ? relatedLines : []),
>  INCLUDE_RELATED ? "" : "",
>  INCLUDE_SOURCES ? "## Sources" : "",
>  ...(INCLUDE_SOURCES ? sourceLines : []),
>  END_MARK,
>  "",
>  ]
>  .filter((x) => x !== "")
>  .join("\n");
> 
>  const cleaned = stripGeneratedSections(content);
>  const finalMd = matter.stringify(cleaned + footer, fm, { language: "yaml" });
> 
>  if (DRY_RUN) {
>  console.log(`Would update: ${path.relative(process.cwd(), f)}`);
>  } else {
>  await fs.writeFile(f, finalMd, "utf-8");
>  }
>  }
> 
>  console.log("Footer regeneration complete.");
> }
> 
> function round2(n?: number): number | undefined {
>  if (n == null) return n;
>  return Math.round(n * 100) / 100;
> }
> 
> main().catch((e) => {
>  console.error(e);
>  process.exit(1);
> });
> ```
> 
> #### What this does (and doesn’t)
> 
> - ✅ **Idempotent**: Each run replaces only the generated footer and (optionally) injects block IDs once.
> - ✅ **Obsidian-friendly**: Uses `#^block-id` anchors by default, which Obsidian recognizes. 
>  Use `--anchor-style heading` to avoid editing target docs ( jump to nearest heading instead).
> - ✅ **No giant YAML**: This script doesn’t expand frontmatter; it just reads it. You can add `--frontmatter-trim true` to cap FM lists if needed.
> - ✅ **Markdown **: All are normal `[text](relative/path.md#anchor)`.
> 
> If you want this to also **cap the size of the footer lists** (e.g., `--top-k-sources`), I can add those switches too.
<!-- UID: 87344dde-f0f9-4b81-a41e-d9ecdb076380 -->

---




>[!nexus_user] **User** - 08/31/2025 at 2:49 PM
> I think we can break up the whole script into multiple scripts
<!-- UID: f15d6e04-2f5a-49ec-86d8-9ee04ad039b2 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 2:50 PM
> Love it. Let’s split the pipeline into small, composable TS scripts. Drop these into `packages/docops/` (or wherever), then wire them up with `pnpm` scripts. Each file is focused and idempotent.
> 
> ## Install deps
> 
> ```bash
> pnpm add -w gray-matter zod unified remark-parse unist-util-visit yaml
> ```
> 
> ---
> 
> ## File: `packages/docops/src/types.ts`
> 
> ```ts
> export type Front = {
>  uuid?: string;
>  created_at?: string;
>  filename?: string;
>  description?: string;
>  tags?: string[];
>  related_to_title?: string[];
>  related_to_uuid?: string[];
>  references?: Array<{ uuid: string; line: number; col: number; score?: number }>;
>  [k: string]: any;
> };
> 
> export type Chunk = {
>  id: string; // docUuid:index
>  docUuid: string;
>  docPath: string;
>  startLine: number;
>  startCol: number;
>  endLine: number;
>  endCol: number;
>  text: string;
>  title?: string; // nearest heading
>  kind: "text" | "code";
>  embedding?: number[];
> };
> 
> export type QueryHit = {
>  id: string; // chunk id
>  docUuid: string;
>  score: number; // cosine
>  startLine: number;
>  startCol: number;
> };
> ```
> 
> ---
> 
> ## File: `packages/docops/src/utils.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { unified } from "unified";
> import remarkParse from "remark-parse";
> import { visit } from "unist-util-visit";
> import * as yaml from "yaml";
> import type { Chunk, Front } from "./types";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(defaults: Record<string, string>): Record<string, string> {
>  const out = { ...defaults };
>  const argv = process.argv.slice(2);
>  for (let i = 0; i < argv.length; i++) {
>  const k = argv[i];
>  if (k.startsWith("--")) {
>  const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
>  out[k] = v;
>  }
>  }
>  return out;
> }
> 
> export async function listFilesRec(root: string, exts: Set<string>): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(dir: string) {
>  const ents = await fs.readdir(dir, { withFileTypes: true });
>  for (const ent of ents) {
>  const p = path.join(dir, ent.name);
>  if (ent.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => exts.has(path.extname(p).toLowerCase()));
> }
> 
> export function randomUUID(): string {
>  return (globalThis as any).crypto?.randomUUID?.() ?? require("crypto").randomUUID();
> }
> 
> export function slugify(s: string): string {
>  return s.trim().toLowerCase().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
> }
> 
> export function extnamePrefer(originalPath: string): string {
>  return path.extname(originalPath) || ".md";
> }
> 
> export function dedupe<T>(arr: T[]): T[] {
>  return Array.from(new Set(arr));
> }
> 
> export async function readJSON<T>(file: string, fallback: T): Promise<T> {
>  try {
>  const s = await fs.readFile(file, "utf-8");
>  return JSON.parse(s) as T;
>  } catch {
>  return fallback;
>  }
> }
> 
> export async function writeJSON(file: string, data: any) {
>  await fs.mkdir(path.dirname(file), { recursive: true });
>  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
> }
> 
> export function stripGeneratedSections(body: string): string {
>  const start = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
>  const end = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";
>  const si = body.indexOf(start);
>  const ei = body.indexOf(end);
>  if (si >= 0 && ei > si) return (body.slice(0, si).trimEnd() + "\n").trimEnd();
>  return body.trimEnd() + "\n";
> }
> 
> export function frontToYAML(front: Front): string {
>  return yaml.stringify(front, { indent: 2, simpleKeys: true });
> }
> 
> export function cosine(a: number[], b: number[]): number {
>  let dot = 0, na = 0, nb = 0;
>  const n = Math.min(a.length, b.length);
>  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
>  if (na === 0 || nb === 0) return 0;
>  return dot / (Math.sqrt(na) * Math.sqrt(nb));
> }
> 
> export function parseMarkdownChunks(markdown: string): Chunk[] {
>  const ast = unified().use(remarkParse).parse(markdown) as any;
>  const chunks: Chunk[] = [];
>  let currentHeading: string | undefined;
> 
>  function extractText(node: any): string {
>  let out = "";
>  visit(node, (n: any) => { if (n.type === "text") out += n.value ?? ""; });
>  return out;
>  }
>  function sentenceSplit(s: string, maxLen: number): string[] {
>  if (s.length <= maxLen) return [s];
>  const parts = s.split(/(?<=[\.\!\?])\s+/);
>  const chunks: string[] = [];
>  let buf = "";
>  for (const p of parts) {
>  if ((buf + " " + p).trim().length > maxLen) { if (buf) chunks.push(buf.trim()); buf = p; }
>  else buf = (buf ? buf + " " : "") + p;
>  }
>  if (buf) chunks.push(buf.trim());
>  const final: string[] = [];
>  for (const c of chunks) {
>  if (c.length <= maxLen) final.push(c);
>  else for (let i = 0; i < c.length; i += maxLen) final.push(c.slice(i, i + maxLen));
>  }
>  return final;
>  }
> 
>  visit(ast, (node: any) => {
>  if (!node?.type) return;
>  if (node.type === "heading") {
>  currentHeading = (node.children || [])
>  .map((c: any) => c.value || c.children?.map((cc: any) => cc.value).join(" ") || "")
>  .join(" ")
>  .trim();
>  }
>  if (["paragraph", "listItem", "code"].includes(node.type)) {
>  const pos = node.position; if (!pos) return;
>  const raw = node.type === "code" ? (node.value || "") : extractText(node);
>  const trimmed = (raw || "").trim(); if (!trimmed) return;
>  const kind = node.type === "code" ? "code" : "text";
>  for (const s of sentenceSplit(trimmed, 1200)) {
>  chunks.push({
>  id: "", docUuid: "", docPath: "",
>  startLine: pos.start.line, startCol: pos.start.column,
>  endLine: pos.end.line, endCol: pos.end.column, text: s,
>  title: currentHeading, kind
>  });
>  }
>  }
>  });
> 
>  if (chunks.length === 0 && markdown.trim()) {
>  chunks.push({
>  id: "", docUuid: "", docPath: "",
>  startLine: 1, startCol: 1,
>  endLine: markdown.split("\n").length, endCol: 1,
>  text: markdown.trim(), title: undefined, kind: "text"
>  });
>  }
>  return chunks;
> }
> 
> export function relMdLink(fromFileAbs: string, toFileAbs: string, anchor?: string): string {
>  const rel = path.relative(path.dirname(fromFileAbs), toFileAbs).replace(/\\/g, "/");
>  return anchor ? `${rel}#${anchor}` : rel;
> }
> 
> export function anchorId(docUuid: string, line: number, col: number) {
>  return `ref-${(docUuid ?? "nouuid").slice(0, 8)}-${line}-${col}`;
> }
> 
> export function computeFenceMap(lines: string[]): boolean[] {
>  const inside: boolean[] = new Array(lines.length).fill(false);
>  let inFence = false, fenceChar: "`" | "~" | null = null, fenceLen = 0;
>  const fenceRe = /^(\s*)(`{3,}|~{3,})(.*)$/;
>  for (let i = 0; i < lines.length; i++) {
>  const L = lines[i];
>  if (!inFence) {
>  const m = L.match(fenceRe);
>  if (m) { inFence = true; fenceChar = m[2][0] as any; fenceLen = m[2].length; inside[i] = true; continue; }
>  } else {
>  inside[i] = true;
>  const m = L.match(fenceRe);
>  if (m && (m[2][0] as any) === fenceChar && m[2].length >= fenceLen) { inFence = false; }
>  }
>  }
>  return inside;
> }
> 
> export function injectAnchors(content: string, want: Array<{ line: number; id: string }>): string {
>  if (!want.length) return content;
>  const lines = content.split("\n");
>  const inside = computeFenceMap(lines);
>  const uniq = new Map<string, { line: number; id: string }>();
>  for (const w of want) uniq.set(`${w.line}:${w.id}`, w);
>  const anchors = Array.from(uniq.values()).sort((a, b) => a.line - b.line);
>  const hasIdOnOrNext = (idx: number, id: string) =>
>  (lines[idx] && lines[idx].includes(`^${id}`)) ||
>  (lines[idx + 1] && lines[idx + 1].trim() === `^${id}`);
>  const nextOutsideIdx = (idx: number) => {
>  let i = Math.min(idx, lines.length - 1);
>  while (i < lines.length && inside[i]) i++;
>  return i;
>  };
>  for (const { line, id } of anchors) {
>  let idx = Math.max(1, Math.min(line, lines.length)) - 1;
>  if (hasIdOnOrNext(idx, id)) continue;
>  if (inside[idx]) {
>  const j = nextOutsideIdx(idx + 1);
>  if (j >= lines.length) lines.push(`^${id}`);
>  else if (!hasIdOnOrNext(j, id)) lines.splice(j, 0, `^${id}`);
>  } else {
>  lines[idx] = (lines[idx] ?? "").replace(/\s*$/, ` ^${id}`);
>  }
>  }
>  return lines.join("\n");
> }
> ```
> 
> ---
> 
> ## 01 — Ensure/Generate Frontmatter 
> **File:** `packages/docops/src/01-frontmatter.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { z } from "zod";
> import { parseArgs, listFilesRec, randomUUID } from "./utils";
> import type { Front } from "./types";
> 
> const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> const args = parseArgs({
>  "--dir": "docs/unique",
>  "--ext": ".md,.mdx,.txt",
>  "--gen-model": "qwen3:4b",
>  "--dry-run": "false",
> });
> 
> const ROOT = path.resolve(args["--dir"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const GEN_MODEL = args["--gen-model"];
> const DRY = args["--dry-run"] === "true";
> 
> const GenSchema = z.object({
>  filename: z.string().min(1),
>  description: z.string().min(1),
>  tags: z.array(z.string()).min(1),
> });
> 
> async function ollamaGenerateJSON(model: string, prompt: string): Promise<any> {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST",
>  headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" }),
>  });
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
>  return JSON.parse(cleaned);
> }
> 
> async function main() {
>  const files = await listFilesRec(ROOT, EXTS);
>  for (const f of files) {
>  const originalName = path.basename(f);
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm: Front = (gm.data || {}) as Front;
> 
>  let changed = false;
>  if (!fm.uuid) { fm.uuid = randomUUID(); changed = true; }
>  if (!fm.created_at) { fm.created_at = originalName; changed = true; }
> 
>  const missing: Array<keyof z.infer<typeof GenSchema>> = [];
>  if (!fm.filename) missing.push("filename");
>  if (!fm.description) missing.push("description");
>  if (!fm.tags || fm.tags.length === 0) missing.push("tags");
> 
>  if (missing.length) {
>  const preview = gm.content.slice(0, 4000);
>  let current: Partial<z.infer<typeof GenSchema>> = {};
>  for (let round = 0; round < 3 && missing.length; round++) {
>  const ask = [...missing];
>  const sys = `Return ONLY JSON with keys: ${ask.join(", ")}. filename: human title (no ext), description: 1-3 sentences, tags: 3-12 keywords.`;
>  const payload = `SYSTEM:\n${sys}\n\nUSER:\nPath: ${f}\nExisting: ${JSON.stringify({ filename: fm.filename ?? null, description: fm.description ?? null, tags: fm.tags ?? null })}\nPreview:\n${preview}`;
>  let obj: any;
>  try { obj = await ollamaGenerateJSON(GEN_MODEL, payload); } catch { break; }
>  const shape: any = {};
>  if (ask.includes("filename")) shape.filename = z.string().min(1);
>  if (ask.includes("description")) shape.description = z.string().min(1);
>  if (ask.includes("tags")) shape.tags = z.array(z.string()).min(1);
>  const Partial = z.object(shape);
>  const parsed = Partial.safeParse(obj);
>  if (parsed.success) {
>  current = { ...current, ...parsed.data };
>  for (const k of ask) if ((current as any)[k]) missing.splice(missing.indexOf(k), 1);
>  }
>  }
>  if (!fm.filename && current.filename) { fm.filename = current.filename; changed = true; }
>  if (!fm.description && current.description) { fm.description = current.description; changed = true; }
>  if ((!fm.tags || fm.tags.length === 0) && current.tags) { fm.tags = Array.from(new Set(current.tags)); changed = true; }
>  }
> 
>  if (changed && !DRY) {
>  const out = matter.stringify(gm.content, fm, { language: "yaml" });
>  await fs.writeFile(f, out, "utf-8");
>  }
>  }
>  console.log("01-frontmatter: done.");
> }
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 02 — Chunk & Embed 
> **File:** `packages/docops/src/02-embed.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, listFilesRec, writeJSON, readJSON, parseMarkdownChunks } from "./utils";
> import type { Chunk, Front } from "./types";
> 
> const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> const args = parseArgs({
>  "--dir": "docs/unique",
>  "--ext": ".md,.mdx,.txt",
>  "--embed-model": "nomic-embed-text:latest",
> });
> 
> const ROOT = path.resolve(args["--dir"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const EMBED_MODEL = args["--embed-model"];
> const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
> const CHUNK_CACHE = path.join(CACHE, "chunks.json");
> const EMBED_CACHE = path.join(CACHE, "embeddings.json");
> const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");
> 
> async function ollamaEmbed(model: string, text: string): Promise<number[]> {
>  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
>  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, prompt: text })
>  });
>  const data = await res.json();
>  return data.embedding as number[];
> }
> 
> async function main() {
>  const files = await listFilesRec(ROOT, EXTS);
>  const chunksByDoc: Record<string, Chunk[]> = await readJSON(CHUNK_CACHE, {});
>  const embedCache: Record<string, number[]> = await readJSON(EMBED_CACHE, {});
>  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const { data, content } = matter(raw);
>  const fm = data as Front;
>  if (!fm.uuid) continue;
> 
>  const chunks = parseMarkdownChunks(content).map((c, i) => ({
>  ...c,
>  id: `${fm.uuid}:${i}`,
>  docUuid: fm.uuid!,
>  docPath: f,
>  }));
>  for (const ch of chunks) {
>  if (!embedCache[ch.id]) embedCache[ch.id] = await ollamaEmbed(EMBED_MODEL, ch.text);
>  ch.embedding = embedCache[ch.id];
>  }
>  chunksByDoc[fm.uuid] = chunks;
>  docsByUuid[fm.uuid] = { path: f, title: fm.filename || path.parse(f).name };
>  }
> 
>  await writeJSON(CHUNK_CACHE, chunksByDoc);
>  await writeJSON(EMBED_CACHE, embedCache);
>  await writeJSON(DOCS_MAP, docsByUuid);
>  console.log("02-embed: done.");
> }
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 03 — Query Chunks (build per-chunk neighbors) 
> **File:** `packages/docops/src/03-query.ts`
> 
> ```ts
> import { parseArgs, cosine, writeJSON, readJSON } from "./utils";
> import type { Chunk, QueryHit } from "./types";
> import * as path from "path";
> 
> const args = parseArgs({
>  "--k": "8",
> });
> 
> const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
> const CHUNK_CACHE = path.join(CACHE, "chunks.json");
> const QUERY_CACHE = path.join(CACHE, "queries.json");
> 
> async function main() {
>  const chunksByDoc: Record<string, Chunk[]> = await readJSON(CHUNK_CACHE, {});
>  const k = Number(args["--k"]);
>  const allChunks = Object.values(chunksByDoc).flat();
> 
>  // Build index in-memory
>  const byId = new Map<string, Chunk>(allChunks.map((c) => [c.id, c]));
>  const hits: Record<string, QueryHit[]> = await readJSON(QUERY_CACHE, {});
> 
>  for (const q of allChunks) {
>  if (hits[q.id]) continue;
>  const scores: Array<QueryHit> = [];
>  for (const cand of allChunks) {
>  if (cand.docUuid === q.docUuid) continue; // skip same doc
>  const score = cosine(q.embedding!, cand.embedding!);
>  scores.push({ id: cand.id, docUuid: cand.docUuid, score, startLine: cand.startLine, startCol: cand.startCol });
>  }
>  scores.sort((a, b) => b.score - a.score);
>  hits[q.id] = scores.slice(0, k);
>  }
> 
>  await writeJSON(QUERY_CACHE, hits);
>  console.log("03-query: done.");
> }
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 04 — Compute Relations & References → Frontmatter 
> **File:** `packages/docops/src/04-relations.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, readJSON } from "./utils";
> import type { Chunk, Front, QueryHit } from "./types";
> 
> const args = parseArgs({
>  "--docs-dir": "docs/unique",
>  "--doc-threshold": "0.78",
>  "--ref-threshold": "0.85",
> });
> 
> const ROOT = path.resolve(args["--docs-dir"]);
> const DOC_THRESHOLD = Number(args["--doc-threshold"]);
> const REF_THRESHOLD = Number(args["--ref-threshold"]);
> const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
> const CHUNK_CACHE = path.join(CACHE, "chunks.json");
> const QUERY_CACHE = path.join(CACHE, "queries.json");
> const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");
> 
> async function listAllMarkdown(root: string): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(dir: string) {
>  const ents = await fs.readdir(dir, { withFileTypes: true });
>  for (const ent of ents) {
>  const p = path.join(dir, ent.name);
>  if (ent.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => /\.(md|mdx|txt)$/i.test(p));
> }
> 
> async function main() {
>  const files = await listAllMarkdown(ROOT);
>  const chunksByDoc: Record<string, Chunk[]> = await readJSON(CHUNK_CACHE, {});
>  const queryCache: Record<string, QueryHit[]> = await readJSON(QUERY_CACHE, {});
>  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});
>  const docPairs: Record<string, Record<string, number>> = {};
> 
>  function addPair(a: string, b: string, score: number) {
>  if (!docPairs[a]) docPairs[a] = {};
>  docPairs[a][b] = Math.max(docPairs[a][b] ?? 0, score);
>  }
> 
>  // aggregate doc-to-doc by best chunk similarity
>  for (const [docUuid, chunks] of Object.entries(chunksByDoc)) {
>  for (const ch of chunks) {
>  const hits = queryCache[ch.id] || [];
>  for (const h of hits) addPair(docUuid, h.docUuid, h.score);
>  }
>  }
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = (gm.data || {}) as Front;
>  if (!fm.uuid) continue;
> 
>  // related
>  const peers = Object.entries(docPairs[fm.uuid] ?? {})
>  .filter(([, score]) => score >= DOC_THRESHOLD)
>  .sort((a, b) => b[1] - a[1]);
>  fm.related_to_uuid = Array.from(new Set([...(fm.related_to_uuid ?? []), ...peers.map(([u]) => u)]));
>  fm.related_to_title = Array.from(
>  new Set([
>  ...(fm.related_to_title ?? []),
>  ...peers.map(([u]) => docsByUuid[u]?.title ?? u),
>  ])
>  );
> 
>  // references (top chunk hits above threshold)
>  const myChunks = chunksByDoc[fm.uuid] ?? [];
>  const acc = new Map<string, { uuid: string; line: number; col: number; score?: number }>();
>  for (const ch of myChunks) {
>  for (const h of (queryCache[ch.id] || []).filter((x) => x.score >= REF_THRESHOLD)) {
>  const k = `${h.docUuid}:${h.startLine}:${h.startCol}`;
>  if (!acc.has(k)) acc.set(k, { uuid: h.docUuid, line: h.startLine, col: h.startCol, score: Math.round(h.score * 100) / 100 });
>  }
>  }
>  const refs = Array.from(acc.values());
>  fm.references = refs;
> 
>  // write FM only (body unchanged)
>  const out = matter.stringify(gm.content, fm, { language: "yaml" });
>  await fs.writeFile(f, out, "utf-8");
>  }
> 
>  console.log("04-relations: done.");
> }
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 05 — Regenerate Footers (Obsidian-friendly ) 
> **File:** `packages/docops/src/05-footers.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, readJSON, stripGeneratedSections, relMdLink, anchorId, injectAnchors } from "./utils";
> import type { Front } from "./types";
> 
> const args = parseArgs({
>  "--dir": "docs/unique",
>  "--anchor-style": "block", // "block" | "heading" | "none"
>  "--include-related": "true",
>  "--include-sources": "true",
>  "--dry-run": "false",
> });
> 
> const ROOT = path.resolve(args["--dir"]);
> const ANCHOR_STYLE = args["--anchor-style"] as "block" | "heading" | "none";
> const INCLUDE_RELATED = args["--include-related"] === "true";
> const INCLUDE_SOURCES = args["--include-sources"] === "true";
> const DRY = args["--dry-run"] === "true";
> 
> const START = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
> const END = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";
> const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
> const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");
> 
> async function listAllMarkdown(root: string): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(dir: string) {
>  const ents = await fs.readdir(dir, { withFileTypes: true });
>  for (const ent of ents) {
>  const p = path.join(dir, ent.name);
>  if (ent.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => /\.(md|mdx|txt)$/i.test(p));
> }
> 
> function nearestHeadingAnchor(content: string, line: number): string | undefined {
>  const lines = content.split("\n");
>  for (let i = Math.max(1, line) - 1; i >= 0; i--) {
>  const m = lines[i].match(/^\s{0,3}#{1,6}\s+(.*)$/);
>  if (m) {
>  const text = m[1].trim().toLowerCase();
>  return text.replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
>  }
>  }
>  return undefined;
> }
> 
> async function main() {
>  const files = await listAllMarkdown(ROOT);
>  const byUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});
> 
>  // gather block anchors needed
>  const anchorsByPath: Record<string, Array<{ line: number; id: string }>> = {};
>  if (ANCHOR_STYLE === "block") {
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const { data } = matter(raw);
>  const fm = data as Front;
>  for (const r of fm.references ?? []) {
>  const tgt = byUuid[r.uuid]; if (!tgt) continue;
>  const id = anchorId(r.uuid, r.line, r.col);
>  (anchorsByPath[tgt.path] ||= []).push({ line: r.line, id });
>  }
>  }
>  }
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const fm = gm.data as Front;
>  let body = gm.content;
> 
>  if (ANCHOR_STYLE === "block") {
>  const needs = anchorsByPath[f] || [];
>  if (needs.length) body = injectAnchors(body, needs);
>  }
> 
>  const relatedLines: string[] = [];
>  if (INCLUDE_RELATED) {
>  for (const u of fm.related_to_uuid ?? []) {
>  const ref = byUuid[u]; if (!ref) continue;
>  const href = relMdLink(f, ref.path);
>  const title = ref.title || u;
>  relatedLines.push(`- [${title}](${href})`);
>  }
>  if (relatedLines.length === 0) relatedLines.push("- _None_");
>  }
> 
>  const sourceLines: string[] = [];
>  if (INCLUDE_SOURCES) {
>  for (const r of fm.references ?? []) {
>  const ref = byUuid[r.uuid]; if (!ref) continue;
>  let anchor = "";
>  if (ANCHOR_STYLE === "block") anchor = `^${anchorId(r.uuid, r.line, r.col)}`;
>  else if (ANCHOR_STYLE === "heading") {
>  const targetRaw = await fs.readFile(ref.path, "utf-8");
>  const targetGm = matter(targetRaw);
>  anchor = nearestHeadingAnchor(targetGm.content, r.line) || "";
>  }
>  const href = relMdLink(f, ref.path, anchor || undefined);
>  const title = ref.title || r.uuid;
>  const meta = ` (line ${r.line}, col ${r.col}${r.score != null ? `, score ${Math.round(r.score * 100) / 100}` : ""})`;
>  sourceLines.push(`- [${title} — L${r.line}](${href})${meta}`);
>  }
>  if (sourceLines.length === 0) sourceLines.push("- _None_");
>  }
> 
>  const footer = [
>  "",
>  START,
>  INCLUDE_RELATED ? "## Related content" : "",
>  ...(INCLUDE_RELATED ? relatedLines : []),
>  INCLUDE_RELATED ? "" : "",
>  INCLUDE_SOURCES ? "## Sources" : "",
>  ...(INCLUDE_SOURCES ? sourceLines : []),
>  END,
>  "",
>  ].filter(Boolean).join("\n");
> 
>  const cleaned = stripGeneratedSections(body);
>  const finalMd = matter.stringify(cleaned + footer, fm, { language: "yaml" });
> 
>  if (args["--dry-run"] === "true") console.log(`Would update: ${path.relative(process.cwd(), f)}`);
>  else await fs.writeFile(f, finalMd, "utf-8");
>  }
> 
>  console.log("05-footers: done.");
> }
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 06 — Rename by Frontmatter `filename` 
> **File:** `packages/docops/src/06-rename.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, slugify, extnamePrefer } from "./utils";
> import type { Front } from "./types";
> 
> const args = parseArgs({ "--dir": "docs/unique", "--dry-run": "false" });
> const ROOT = path.resolve(args["--dir"]);
> const DRY = args["--dry-run"] === "true";
> 
> async function listAllMarkdown(root: string): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(dir: string) {
>  const ents = await fs.readdir(dir, { withFileTypes: true });
>  for (const ent of ents) {
>  const p = path.join(dir, ent.name);
>  if (ent.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => /\.(md|mdx|txt)$/i.test(p));
> }
> async function exists(p: string) { try { await fs.stat(p); return true; } catch { return false; } }
> 
> async function main() {
>  const files = await listAllMarkdown(ROOT);
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const fm = (matter(raw).data || {}) as Front;
>  if (!fm.filename) continue;
> 
>  const want = slugify(fm.filename) + extnamePrefer(f);
>  const dir = path.dirname(f);
>  const currentBase = path.basename(f);
>  if (currentBase === want) continue;
> 
>  let target = path.join(dir, want);
>  let i = 1;
>  while (await exists(target)) {
>  const base = slugify(fm.filename) + (i > 1 ? `-${i}` : "");
>  target = path.join(dir, base + extnamePrefer(f));
>  i++;
>  }
>  if (DRY) console.log(`Would rename: ${f} -> ${target}`);
>  else { await fs.rename(f, target); }
>  }
>  console.log("06-rename: done.");
> }
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## Suggested `package.json` scripts (workspace root or in `packages/docops/`)
> 
> ```json
> {
>  "scripts": {
>  "doc:01-frontmatter": "tsx packages/docops/src/01-frontmatter.ts --dir docs/unique --gen-model qwen3:4b",
>  "doc:02-embed": "tsx packages/docops/src/02-embed.ts --dir docs/unique",
>  "doc:03-query": "tsx packages/docops/src/03-query.ts",
>  "doc:04-relate": "tsx packages/docops/src/04-relations.ts --docs-dir docs/unique --doc-threshold 0.78 --ref-threshold 0.85",
>  "doc:05-footers": "tsx packages/docops/src/05-footers.ts --dir docs/unique --anchor-style block",
>  "doc:06-rename": "tsx packages/docops/src/06-rename.ts --dir docs/unique",
> 
>  "doc:all": "pnpm doc:01-frontmatter && pnpm doc:02-embed && pnpm doc:03-query && pnpm doc:04-relate && pnpm doc:05-footers && pnpm doc:06-rename"
>  }
> }
> ```
> 
> ---
> 
> ### How this lines up with your goals
> 
> - **Small focused scripts**: easy to tweak thresholds/flags without touching other steps.
> - **Obsidian-friendly**: footer use Markdown; source can jump to **block IDs** (`--anchor-style block`) or just nearest headings (`--anchor-style heading`) without modifying targets.
> - **Frontmatter bloat control**: put big lists in the footer; the `04-relations` step governs how much you put in FM (you can add caps if you want).
> - **Zero SaaS**: only uses your local Ollama.
> 
> If you want me to add a tiny `docops.config.json` (or EDN) so you don’t have to pass flags, I’ll wire all scripts to read it.
<!-- UID: ce248373-f2ba-4af1-8abb-2d9fbf5a7eb9 -->

---




>[!nexus_user] **User** - 08/31/2025 at 3:06 PM
> now lets write a new package for extracting all code blocks into a pseudo folder.
> 
> When LLMs generate code, some times they put the filename in a comment at the top of the code block, some times it's in a `preformatted/path/string.ext` right before it, some times it's in the title, and some times it's more ambiguous.
> 
> step 1.
> 
> extract all code and surrounding context blocks in a directory tree
> 
> step 2.
> 
> Add them to a vector store
> 
> step 3. 
> 
> Identify similar code blocks 
> 
> step 4.
> 
> Pass similar code blocks and surrounding context to ollama and generate a directory path for the group, and names for each of the similar blocks, and a readme
> 
> step 5.
> 
> starting from a base folder, generate the file tree described by the generated paths
<!-- UID: 28bbe561-0897-4dc8-a306-cee8f4ca7460 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 3:06 PM
> heck yeah — let’s spin this into a clean, composable **package** with 5 tiny CLI scripts. Zero SaaS, all local, TypeScript.
> 
> I’ll give you:
> - file layout
> - `package.json` scripts
> - lean TS for each step (ready to drop into your repo)
> - a quick mermaid of the flow
> 
> > Deps: `gray-matter`, `unified`, `remark-parse`, `unist-util-visit`, `yaml`, `zod` 
> > (Node 18+; uses native `fetch` and `crypto`.)
> 
> ---
> 
> # packages/codepack/
> 
> ```
> packages/codepack/
>  package.json
>  src/
>  types.ts
>  utils.ts
>  01-extract.ts
>  02-embed.ts
>  03-cluster.ts
>  04-name.ts
>  05-materialize.ts
> ```
> 
> ---
> 
> # package.json (scripts)
> 
> ```json
> {
>  "name": "@promethean/codepack",
>  "version": "0.1.0",
>  "type": "module",
>  "private": true,
>  "scripts": {
>  "code:01-extract": "tsx src/01-extract.ts --dir docs/unique",
>  "code:02-embed": "tsx src/02-embed.ts",
>  "code:03-cluster": "tsx src/03-cluster.ts --sim-threshold 0.82 --k 8",
>  "code:04-name": "tsx src/04-name.ts --gen-model qwen3:4b",
>  "code:05-materialize": "tsx src/05-materialize.ts --out out/code_groups",
>  "code:all": "pnpm code:01-extract && pnpm code:02-embed && pnpm code:03-cluster && pnpm code:04-name && pnpm code:05-materialize"
>  },
>  "dependencies": {
>  "gray-matter": "^4.0.3",
>  "remark-parse": "^11.0.0",
>  "unified": "^11.0.4",
>  "unist-util-visit": "^5.0.0",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  }
> }
> ```
> 
> ---
> 
> # src/types.ts
> 
> ```ts
> export type CodeBlock = {
>  id: string; // stable hash id
>  srcPath: string; // absolute source file
>  relPath: string; // relative to --dir
>  lang?: string; // fence info string language
>  startLine: number;
>  endLine: number;
>  code: string;
>  contextBefore: string; // nearby prose/heading above
>  contextAfter: string; // nearby prose after
>  hintedName?: string; // filename/path hint detected
> };
> 
> export type EmbeddingMap = Record<string, number[]>; // id -> vector
> 
> export type Cluster = {
>  id: string; // cluster id (uuid)
>  memberIds: string[]; // CodeBlock ids
> };
> 
> export type NamedGroup = {
>  clusterId: string;
>  dir: string; // e.g. packages/foo/src
>  files: Array<{ id: string; filename: string }>;
>  readme: string; // README.md content
> };
> 
> export type BlockManifest = {
>  blocks: CodeBlock[];
> };
> 
> export type NamePlan = {
>  groups: NamedGroup[];
> };
> ```
> 
> ---
> 
> # src/utils.ts
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { unified } from "unified";
> import remarkParse from "remark-parse";
> import { visit } from "unist-util-visit";
> import * as crypto from "crypto";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++) {
>  const k = a[i]; if (!k.startsWith("--")) continue;
>  const v = a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
>  out[k] = v;
>  }
>  return out;
> }
> 
> export async function listFilesRec(root: string, exts: Set<string>) {
>  const out: string[] = [];
>  async function walk(d: string) {
>  const ents = await fs.readdir(d, { withFileTypes: true });
>  for (const e of ents) {
>  const p = path.join(d, e.name);
>  if (e.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter(p => exts.size ? exts.has(path.extname(p).toLowerCase()) : true);
> }
> 
> export function sha1(s: string): string {
>  return crypto.createHash("sha1").update(s).digest("hex");
> }
> 
> export function cosine(a: number[], b: number[]) {
>  let dot=0, na=0, nb=0;
>  const n=Math.min(a.length,b.length);
>  for (let i=0;i<n;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
>  if (!na || !nb) return 0;
>  return dot / (Math.sqrt(na)*Math.sqrt(nb));
> }
> 
> export async function ensureDir(p: string) {
>  await fs.mkdir(p, { recursive: true });
> }
> 
> export function relPath(fromRoot: string, fileAbs: string) {
>  return path.relative(fromRoot, fileAbs).replace(/\\/g,"/");
> }
> 
> // -------- markdown code extraction helpers
> 
> type FoundBlock = {
>  lang?: string;
>  startLine: number;
>  endLine: number;
>  value: string;
>  beforeText: string;
>  afterText: string;
>  fenceInfo?: string; // raw info string after ```
>  nearestTitle?: string; // heading text
> };
> 
> export function extractCodeBlocksWithContext(md: string): FoundBlock[] {
>  const ast = unified().use(remarkParse).parse(md) as any;
>  const blocks: FoundBlock[] = [];
>  let lastHeading: string | undefined;
>  const lines = md.split("\n");
>  const grab = (from: number, to: number) => lines.slice(Math.max(0,from), Math.min(lines.length,to)).join("\n");
> 
>  visit(ast, (node: any, _idx: number, parent: any) => {
>  if (!node?.type) return;
> 
>  if (node.type === "heading") {
>  const text = (node.children || [])
>  .map((c: any) => c.value || c.children?.map((cc:any)=>cc.value).join(" ") || "")
>  .join(" ").trim();
>  lastHeading = text || lastHeading;
>  }
> 
>  if (node.type === "code" && node.position) {
>  const { start, end } = node.position;
>  const beforeText = grab(start.line-6, start.line-1); // 5 lines of lead-in context
>  const afterText = grab(end.line, end.line+5); // 5 lines of trailing context
>  blocks.push({
>  lang: node.lang || undefined,
>  fenceInfo: node.meta || undefined, // remark puts extra after language in node.meta
>  startLine: start.line,
>  endLine: end.line,
>  value: node.value || "",
>  beforeText,
>  afterText,
>  nearestTitle: lastHeading
>  });
>  }
>  });
> 
>  return blocks;
> }
> 
> // filename/path hint heuristics
> export function detectFilenameHint(block: FoundBlock): string | undefined {
>  // 1) Info string like: ```ts title="src/foo/bar.ts" or path=...
>  const meta = block.fenceInfo || "";
>  const m1 = meta.match(/(?:title|path|file|filepath|name)\s*=\s*"?([^"\s]+)"?/i);
>  if (m1) return m1[1];
> 
>  // 2) Single backticked path on the line before the fence (captured in beforeText tail)
>  const beforeTail = (block.beforeText || "").split("\n").slice(-3).join(" ");
>  const m2 = beforeTail.match(/`([^`\n]+?\.[a-z0-9]{1,6})`/i);
>  if (m2) return m2[1];
> 
>  // 3) Title/heading looks like a path
>  if (block.nearestTitle && /[\/\\].+\.[a-z0-9]{1,6}$/i.test(block.nearestTitle)) {
>  return block.nearestTitle.trim();
>  }
> 
>  // 4) First comment line in code contains path-like token
>  const firstLine = (block.value || "").split("\n").find(l => l.trim().length>0) || "";
>  const stripped = firstLine.replace(/^(\s*\/\/\s*|\s*#\s*|\s*;\s*|\s*--\s*|\s*\/\*|\s*<!--)/, "").trim();
>  const m4 = stripped.match(/([A-Za-z0-9_\-./\\]+?\.[a-z0-9]{1,6})/i);
>  if (m4) return m4[1];
> 
>  return undefined;
> }
> ```
> 
> ---
> 
> # 01 — extract all code blocks + context
> 
> ```ts
> // src/01-extract.ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, listFilesRec, relPath, sha1 } from "./utils.js";
> import { extractCodeBlocksWithContext, detectFilenameHint } from "./utils.js";
> import type { BlockManifest, CodeBlock } from "./types.js";
> 
> const args = parseArgs({
>  "--dir": "docs/unique",
>  "--ext": ".md,.mdx,.txt",
>  "--out": ".cache/codepack/blocks.json"
> });
> 
> const ROOT = path.resolve(args["--dir"]);
> const EXTS = new Set(args["--ext"].split(",").map(s=>s.trim().toLowerCase()));
> const OUT = path.resolve(args["--out"]);
> 
> async function main() {
>  const files = await listFilesRec(ROOT, EXTS);
>  const blocks: CodeBlock[] = [];
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const { content } = matter(raw); // ignore frontmatter, operate on content
>  const found = extractCodeBlocksWithContext(content);
>  const rel = relPath(ROOT, f);
> 
>  found.forEach((b, idx) => {
>  const id = sha1([f, b.startLine, b.endLine, sha1(b.value)].join("|"));
>  blocks.push({
>  id,
>  srcPath: f,
>  relPath: rel,
>  lang: b.lang,
>  startLine: b.startLine,
>  endLine: b.endLine,
>  code: b.value,
>  contextBefore: b.beforeText,
>  contextAfter: b.afterText,
>  hintedName: detectFilenameHint(b)
>  });
>  });
>  }
> 
>  await fs.mkdir(path.dirname(OUT), { recursive: true });
>  const manifest: BlockManifest = { blocks };
>  await fs.writeFile(OUT, JSON.stringify(manifest, null, 2), "utf-8");
>  console.log(`extracted ${blocks.length} code blocks -> ${path.relative(process.cwd(), OUT)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 02 — embed blocks (vector store)
> 
> ```ts
> // src/02-embed.ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs } from "./utils.js";
> import type { BlockManifest, EmbeddingMap } from "./types.js";
> 
> const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> const args = parseArgs({
>  "--blocks": ".cache/codepack/blocks.json",
>  "--out": ".cache/codepack/embeddings.json",
>  "--embed-model": "nomic-embed-text:latest",
>  "--mix-context": "true" // include before/after in embedding
> });
> 
> async function ollamaEmbed(model: string, text: string): Promise<number[]> {
>  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt: text })
>  });
>  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
>  const data = await res.json();
>  return data.embedding as number[];
> }
> 
> async function main() {
>  const blocksPath = path.resolve(args["--blocks"]);
>  const outPath = path.resolve(args["--out"]);
>  const model = args["--embed-model"];
>  const mix = args["--mix-context"] === "true";
> 
>  const { blocks }: BlockManifest = JSON.parse(await fs.readFile(blocksPath,"utf-8"));
>  const embeds: EmbeddingMap = {};
> 
>  for (const b of blocks) {
>  if (embeds[b.id]) continue;
>  const text = mix
>  ? `FILE:${b.hintedName ?? ""}\nPATH:${b.relPath}\nLANG:${b.lang ?? ""}\nCONTEXT_BEFORE:\n${b.contextBefore}\nCODE:\n${b.code}\nCONTEXT_AFTER:\n${b.contextAfter}`
>  : b.code;
>  embeds[b.id] = await ollamaEmbed(model, text);
>  }
> 
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
>  await fs.writeFile(outPath, JSON.stringify(embeds), "utf-8");
>  console.log(`embedded ${Object.keys(embeds).length} blocks -> ${path.relative(process.cwd(), outPath)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 03 — identify similar code blocks (clustering)
> 
> ```ts
> // src/03-cluster.ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, cosine } from "./utils.js";
> import type { BlockManifest, EmbeddingMap, Cluster } from "./types.js";
> 
> const args = parseArgs({
>  "--blocks": ".cache/codepack/blocks.json",
>  "--embeds": ".cache/codepack/embeddings.json",
>  "--out": ".cache/codepack/clusters.json",
>  "--sim-threshold": "0.82", // connect if cosine >= threshold
>  "--k": "8" // top-k neighbors to consider per node
> });
> 
> function unionFindClusters(ids: string[], edges: Array<[string,string]>) {
>  const parent = new Map<string,string>(ids.map(i => [i,i]));
>  const find = (x:string):string => parent.get(x)===x ? x : parent.set(x, find(parent.get(x)!)).get(x)!;
>  const unite = (a:string,b:string) => { a=find(a); b=find(b); if(a!==b) parent.set(a,b); };
>  edges.forEach(([a,b])=>unite(a,b));
>  const groups = new Map<string,string[]>();
>  ids.forEach(i => {
>  const r = find(i);
>  (groups.get(r) ?? groups.set(r, []).get(r)!).push(i);
>  });
>  return Array.from(groups.values());
> }
> 
> async function main() {
>  const blocksPath = path.resolve(args["--blocks"]);
>  const embedsPath = path.resolve(args["--embeds"]);
>  const outPath = path.resolve(args["--out"]);
>  const TH = Number(args["--sim-threshold"]);
>  const K = Number(args["--k"]);
> 
>  const { blocks }: BlockManifest = JSON.parse(await fs.readFile(blocksPath,"utf-8"));
>  const embeds: EmbeddingMap = JSON.parse(await fs.readFile(embedsPath,"utf-8"));
> 
>  // build neighbor edges
>  const ids = blocks.map(b => b.id);
>  const edges: Array<[string,string]> = [];
> 
>  for (const a of blocks) {
>  const av = embeds[a.id];
>  const scores = blocks
>  .filter(b => b.id !== a.id)
>  .map(b => ({ id: b.id, s: cosine(av, embeds[b.id]) }))
>  .sort((x,y)=>y.s-x.s)
>  .slice(0, K);
>  for (const {id, s} of scores) {
>  if (s >= TH) edges.push([a.id, id]);
>  }
>  }
> 
>  const groups = unionFindClusters(ids, edges).filter(g => g.length >= 1);
>  const clusters: Cluster[] = groups.map((memberIds, i) => ({
>  id: `cluster-${i+1}`,
>  memberIds
>  }));
> 
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
>  await fs.writeFile(outPath, JSON.stringify(clusters, null, 2), "utf-8");
>  console.log(`clusters: ${clusters.length} groups -> ${path.relative(process.cwd(), outPath)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 04 — name groups + files (Ollama JSON)
> 
> ```ts
> // src/04-name.ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { z } from "zod";
> import { parseArgs } from "./utils.js";
> import type { BlockManifest, Cluster, NamePlan } from "./types.js";
> 
> const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> const args = parseArgs({
>  "--blocks": ".cache/codepack/blocks.json",
>  "--clusters": ".cache/codepack/clusters.json",
>  "--out": ".cache/codepack/names.json",
>  "--gen-model": "qwen3:4b",
>  "--base-dir": "packages" // suggested project-relative base
> });
> 
> const GroupSchema = z.object({
>  dir: z.string().min(1), // e.g., "packages/my-lib/src"
>  files: z.array(z.object({
>  id: z.string().min(1), // CodeBlock.id (we’ll map back)
>  filename: z.string().min(1) // e.g., "index.ts"
>  })).min(1),
>  readme: z.string().min(1)
> });
> 
> const ResponseSchema = z.object({
>  groups: z.array(z.object({
>  clusterId: z.string(),
>  dir: z.string(),
>  files: z.array(z.object({ id: z.string(), filename: z.string() })),
>  readme: z.string()
>  }))
> });
> 
> async function ollamaJSON(model: string, prompt: string) {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama generate ${res.status}`);
>  const data = await res.json();
>  const text = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  const cleaned = text.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim();
>  return JSON.parse(cleaned);
> }
> 
> async function main() {
>  const blocksPath = path.resolve(args["--blocks"]);
>  const clustersPath = path.resolve(args["--clusters"]);
>  const outPath = path.resolve(args["--out"]);
>  const model = args["--gen-model"];
>  const baseDir = args["--base-dir"];
> 
>  const { blocks }: BlockManifest = JSON.parse(await fs.readFile(blocksPath,"utf-8"));
>  const clusters: Cluster[] = JSON.parse(await fs.readFile(clustersPath,"utf-8"));
> 
>  const byId = new Map(blocks.map(b => [b.id, b]));
> 
>  const groups = [];
>  for (const c of clusters) {
>  // build concise prompt with hints
>  const items = c.memberIds.map((id, i) => {
>  const b = byId.get(id)!;
>  const hint = b.hintedName ? `HINT:${b.hintedName}` : "";
>  return [
>  `### ITEM ${i+1}`,
>  `ID: ${id}`,
>  `LANG: ${b.lang ?? ""}`,
>  hint ? `${hint}` : "",
>  `SRC: ${b.relPath}:${b.startLine}-${b.endLine}`,
>  `CONTEXT_BEFORE:\n${b.contextBefore.trim()}`,
>  `CODE:\n${b.code.trim().slice(0, 4000)}`, // keep prompt sane
>  `CONTEXT_AFTER:\n${b.contextAfter.trim()}`
>  ].filter(Boolean).join("\n");
>  }).join("\n\n");
> 
>  const sys = [
>  "You group code blocks into a coherent folder and filenames.",
>  `Return ONLY JSON: { dir, files:[{id, filename}], readme }`,
>  `dir MUST be a POSIX path relative to '${baseDir}', no leading slash.`,
>  "Use lowercase kebab or package conventions. Filenames should be valid for the language.",
>  "If two blocks belong to same file, pick one filename and include both ids under that filename with -partN suffixes (we will stitch later).",
>  ].join("\n");
> 
>  const prompt = `SYSTEM:\n${sys}\n\nUSER:\nCLUSTER: ${c.id}\n${items}\n\nReturn JSON for this cluster.`;
> 
>  let obj: any = await ollamaJSON(model, prompt);
>  // validate core pieces quickly
>  const dir = obj.dir as string;
>  const files = obj.files as Array<{id:string, filename:string}>;
>  const readme = obj.readme as string;
>  const parsed = GroupSchema.safeParse({ dir, files, readme });
>  if (!parsed.success) {
>  // fallback: trivial names
>  obj = {
>  dir: `${baseDir}/group-${c.id}`,
>  files: c.memberIds.map((id, i) => ({ id, filename: `file-${i+1}.txt` })),
>  readme: `# ${c.id}\n\nAuto grouped.\n`
>  };
>  }
>  groups.push({ clusterId: c.id, ...obj });
>  }
> 
>  const plan: NamePlan = { groups };
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
>  await fs.writeFile(outPath, JSON.stringify(plan, null, 2), "utf-8");
>  console.log(`named ${groups.length} groups -> ${path.relative(process.cwd(), outPath)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 05 — materialize the file tree
> 
> ```ts
> // src/05-materialize.ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, ensureDir } from "./utils.js";
> import type { BlockManifest, NamePlan } from "./types.js";
> 
> const args = parseArgs({
>  "--blocks": ".cache/codepack/blocks.json",
>  "--names": ".cache/codepack/names.json",
>  "--out": "out/code_groups",
>  "--dry-run": "false"
> });
> 
> function safeJoin(...parts: string[]) {
>  const p = path.join(...parts).replace(/\\/g,"/");
>  if (p.includes("..")) throw new Error("refusing to write paths with ..");
>  return p;
> }
> 
> async function exists(p:string) { try { await fs.stat(p); return true; } catch { return false; } }
> 
> async function main() {
>  const blocksPath = path.resolve(args["--blocks"]);
>  const namesPath = path.resolve(args["--names"]);
>  const outRoot = path.resolve(args["--out"]);
>  const dry = args["--dry-run"] === "true";
> 
>  const { blocks }: BlockManifest = JSON.parse(await fs.readFile(blocksPath,"utf-8"));
>  const plan: NamePlan = JSON.parse(await fs.readFile(namesPath,"utf-8"));
> 
>  const byId = new Map(blocks.map(b => [b.id, b]));
> 
>  for (const group of plan.groups) {
>  const dirAbs = safeJoin(outRoot, group.dir);
>  if (!dry) await ensureDir(dirAbs);
> 
>  // write README
>  const readmeAbs = path.join(dirAbs, "README.md");
>  if (!dry) await fs.writeFile(readmeAbs, group.readme, "utf-8");
> 
>  // write files
>  const perFile: Record<string, string[]> = {};
>  for (const f of group.files) {
>  (perFile[f.filename] ||= []).push(f.id);
>  }
> 
>  for (const [filename, ids] of Object.entries(perFile)) {
>  const target = path.join(dirAbs, filename);
> 
>  // if multiple ids to same filename, concatenate with clear separators
>  const parts: string[] = [];
>  for (let i=0;i<ids.length;i++) {
>  const b = byId.get(ids[i]);
>  if (!b) continue;
>  const header = [
>  `/* source: ${b.relPath}:${b.startLine}-${b.endLine} */`,
>  b.hintedName ? `/* hinted: ${b.hintedName} */` : "",
>  ].filter(Boolean).join("\n");
>  parts.push(`${header}\n${b.code.trim()}\n`);
>  }
>  const content = parts.join("\n/* --- next-part --- */\n\n");
> 
>  // avoid clobbering existing files: append -1, -2,...
>  let outPath = target;
>  if (await exists(outPath)) {
>  const ext = path.extname(target);
>  const base = path.basename(target, ext);
>  const dir = path.dirname(target);
>  let i = 1;
>  while (await exists(path.join(dir, `${base}-${i}${ext}`))) i++;
>  outPath = path.join(dir, `${base}-${i}${ext}`);
>  }
> 
>  if (dry) console.log(`[dry] write ${path.relative(process.cwd(), outPath)}`);
>  else await fs.writeFile(outPath, content, "utf-8");
>  }
>  }
> 
>  console.log(`materialized -> ${path.relative(process.cwd(), outRoot)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # How to run
> 
> ```bash
> # from repo root (workspace)
> pnpm -w add -D tsx typescript
> pnpm -w add gray-matter unified remark-parse unist-util-visit yaml zod
> 
> # run pipeline:
> pnpm --filter @promethean/codepack code:all
> 
> # …or step by step:
> pnpm --filter @promethean/codepack code:01-extract --dir docs/unique
> pnpm --filter @promethean/codepack code:02-embed --embed-model nomic-embed-text:latest
> pnpm --filter @promethean/codepack code:03-cluster --sim-threshold 0.84 --k 10
> pnpm --filter @promethean/codepack code:04-name --gen-model qwen3:4b
> pnpm --filter @promethean/codepack code:05-materialize --out out/code_groups
> ```
> 
> ---
> 
> # what it does
> 
> - **01-extract**: grabs every fenced code block from markdown-ish files, plus 5 lines of before/after context; detects filename hints from fence meta, inline backticks, heading, or first comment.
> - **02-embed**: embeds each block (optionally mixing context) via your local Ollama embed model.
> - **03-cluster**: builds a kNN graph, connects edges above `--sim-threshold`, and outputs connected components as clusters.
> - **04-name**: sends each cluster’s snippets+context to Ollama; gets back a directory path, filenames per block id, and a README; validates with Zod and falls back if the LLM biffs it.
> - **05-materialize**: creates the directory tree under `--out/<dir>`, writes `README.md`, and writes each file (concatenating multiple parts if the LLM mapped several blocks to one file).
> 
> ---
> 
> # quick pipeline sketch
> 
> ```mermaid
> flowchart LR
>  A[docs tree] --> B[01-extract<br/>blocks.json]
>  B --> C[02-embed<br/>embeddings.json]
>  B --> C
>  C --> D[03-cluster<br/>clusters.json]
>  B --> E[04-name<br/>names.json]
>  D --> E
>  E --> F[05-materialize<br/>out/code_groups/...]
> ```
> 
> If you want this to also ingest **raw .ts/.js files** (treat each as a single “code block” with `hintedName = relPath`), I can add a `--also-code-exts ".ts,.js,.tsx"` flag to `01-extract.ts`.
<!-- UID: 0101e3d9-5839-4888-a0b2-b3cfdefd5a26 -->

---




>[!nexus_user] **User** - 08/31/2025 at 3:32 PM
> I want a package that locates every function/variable/type/class in packages/* and generates documentation for them in docs/packages using ollama.
<!-- UID: c1118cd1-567e-472a-bd05-9ca647a1809e -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 3:32 PM
> Awesome—here’s a self-contained **TypeScript package** that walks `packages/*`, finds every **function / variable / type / class** with the TypeScript compiler API, asks **Ollama** to draft docs for each symbol, and writes Obsidian-friendly markdown into `docs/packages`.
> 
> It’s split into small CLIs so you can run/inspect each step:
> 
> - `01-scan.ts` → collect symbols (kind, signature, JSDoc, etc.)
> - `02-docs.ts` → use Ollama to generate per-symbol docs (JSON w/ Zod validation + cache)
> - `03-write.ts` → write/update module docs in `docs/packages/<pkg>/<module>.md` with one section per symbol (idempotent markers)
> 
> > No SaaS. Only your local **Ollama** `/api/generate`. Node 18+.
> 
> ---
> 
> ### File tree
> 
> ```
> packages/symdocs/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-scan.ts
>  02-docs.ts
>  03-write.ts
> ```
> 
> ---
> 
> ### `packages/symdocs/package.json`
> 
> ```json
> {
>  "name": "@promethean/symdocs",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "symdocs-scan": "dist/01-scan.js",
>  "symdocs-docs": "dist/02-docs.js",
>  "symdocs-write": "dist/03-write.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "symdocs:01-scan": "tsx src/01-scan.ts --root packages --tsconfig tsconfig.json",
>  "symdocs:02-docs": "tsx src/02-docs.ts --model qwen3:4b",
>  "symdocs:03-write": "tsx src/03-write.ts --out docs/packages",
>  "symdocs:all": "pnpm symdocs:01-scan && pnpm symdocs:02-docs && pnpm symdocs:03-write"
>  },
>  "dependencies": {
>  "gray-matter": "^4.0.3",
>  "typescript": "^5.5.4",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2"
>  }
> }
> ```
> 
> ---
> 
> ### `packages/symdocs/tsconfig.json`
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "strict": true,
>  "skipLibCheck": true,
>  "outDir": "dist",
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ---
> 
> ### `packages/symdocs/src/types.ts`
> 
> ```ts
> export type SymKind = "function" | "variable" | "class" | "type";
> 
> export type SymbolInfo = {
>  id: string; // stable hash
>  pkg: string; // package folder under packages/
>  fileAbs: string; // absolute path
>  fileRel: string; // relative to repo root
>  moduleRel: string; // relative to packages/<pkg>/
>  lang: "ts" | "tsx" | "js" | "jsx";
>  name: string;
>  kind: SymKind;
>  exported: boolean;
>  jsdoc?: string;
>  signature?: string; // human-readable signature (functions/types)
>  startLine: number;
>  endLine: number;
>  snippet: string; // declaration text
> };
> 
> export type ScanResult = { symbols: SymbolInfo[] };
> 
> export type DocDraft = {
>  id: string; // SymbolInfo.id
>  name: string;
>  kind: SymKind;
>  title: string;
>  summary: string; // 1-2 lines
>  usage?: string; // code fence
>  details?: string; // markdown
>  pitfalls?: string[]; // bullets
>  tags?: string[];
>  mermaid?: string; // optional diagram (e.g., class or flow)
> };
> 
> export type DocMap = Record<string, DocDraft>; // id -> draft
> ```
> 
> ---
> 
> ### `packages/symdocs/src/utils.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import * as crypto from "crypto";
> import * as ts from "typescript";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(defaults: Record<string, string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i = 0; i < a.length; i++) {
>  const k = a[i];
>  if (!k.startsWith("--")) continue;
>  const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
>  out[k] = v;
>  }
>  return out;
> }
> 
> export async function listFilesRec(root: string, exts: Set<string>) {
>  const out: string[] = [];
>  async function walk(d: string) {
>  const ents = await fs.readdir(d, { withFileTypes: true });
>  for (const e of ents) {
>  const p = path.join(d, e.name);
>  if (e.isDirectory()) await walk(p);
>  else out.push(p);
>  }
>  }
>  await walk(root);
>  return out.filter((p) => exts.has(path.extname(p).toLowerCase()));
> }
> 
> export function sha1(s: string) {
>  return crypto.createHash("sha1").update(s).digest("hex");
> }
> 
> export function relFromRepo(abs: string) {
>  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
> }
> 
> export function getLangFromExt(p: string): "ts" | "tsx" | "js" | "jsx" {
>  const e = path.extname(p).toLowerCase();
>  if (e === ".ts") return "ts";
>  if (e === ".tsx") return "tsx";
>  if (e === ".jsx") return "jsx";
>  return "js";
> }
> 
> export function makeProgram(rootFiles: string[], tsconfigPath?: string) {
>  let options: ts.CompilerOptions = {
>  target: ts.ScriptTarget.ES2022,
>  module: ts.ModuleKind.ESNext,
>  strict: true,
>  };
> 
>  if (tsconfigPath) {
>  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
>  if (configFile.error) {
>  throw new Error(ts.formatDiagnosticsWithColorAndContext([configFile.error], {
>  getCanonicalFileName: (f) => f,
>  getCurrentDirectory: ts.sys.getCurrentDirectory,
>  getNewLine: () => ts.sys.newLine,
>  }));
>  }
>  const parse = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));
>  options = { ...parse.options, ...options };
>  }
> 
>  return ts.createProgram(rootFiles, options);
> }
> 
> export function getJsDocText(node: ts.Node): string | undefined {
>  const jsdocs = ts.getJSDocCommentsAndTags(node);
>  if (!jsdocs?.length) return undefined;
>  const texts: string[] = [];
>  for (const d of jsdocs) {
>  // @ts-ignore - d may have comment property
>  const c = (d as any).comment;
>  if (typeof c === "string") texts.push(c);
>  }
>  return texts.join("\n\n").trim() || undefined;
> }
> 
> export function getNodeText(src: string, node: ts.Node): string {
>  const sf = node.getSourceFile();
>  return src.slice(node.getFullStart(), node.getEnd());
> }
> 
> export function posToLine(sf: ts.SourceFile, pos: number) {
>  const { line } = sf.getLineAndCharacterOfPosition(pos);
>  return line + 1;
> }
> 
> export function signatureForFunction(checker: ts.TypeChecker, decl: ts.FunctionLikeDeclarationBase): string | undefined {
>  const sig = checker.getSignatureFromDeclaration(decl as ts.SignatureDeclaration);
>  return sig ? checker.signatureToString(sig) : undefined;
> }
> 
> export function typeToString(checker: ts.TypeChecker, node: ts.Node): string | undefined {
>  const t = checker.getTypeAtLocation(node);
>  try {
>  return checker.typeToString(t);
>  } catch { return undefined; }
> }
> ```
> 
> ---
> 
> ### `packages/symdocs/src/01-scan.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import * as ts from "typescript";
> import { parseArgs, listFilesRec, makeProgram, getJsDocText, getNodeText, posToLine, sha1, relFromRepo, getLangFromExt, signatureForFunction, typeToString } from "./utils.js";
> import type { SymKind, SymbolInfo, ScanResult } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--tsconfig": "",
>  "--ext": ".ts,.tsx,.js,.jsx",
>  "--out": ".cache/symdocs/symbols.json"
> });
> 
> const ROOT = path.resolve(args["--root"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const OUT = path.resolve(args["--out"]);
> const repoRoot = process.cwd();
> 
> async function main() {
>  const files = await listFilesRec(ROOT, EXTS);
>  if (files.length === 0) {
>  console.log("No files found.");
>  return;
>  }
> 
>  const program = makeProgram(files, args["--tsconfig"] || undefined);
>  const checker = program.getTypeChecker();
> 
>  const symbols: SymbolInfo[] = [];
> 
>  for (const sf of program.getSourceFiles()) {
>  const fileAbs = path.resolve(sf.fileName);
>  if (!fileAbs.startsWith(ROOT)) continue;
>  const src = sf.getFullText();
> 
>  const rel = relFromRepo(fileAbs);
>  const bits = rel.split("/"); // packages/<pkg>/...
>  if (bits[0] !== "packages" || bits.length < 2) continue;
>  const pkg = bits[1];
>  const moduleRel = bits.slice(2).join("/");
> 
>  function pushSymbol(kind: SymKind, name: string, node: ts.Node, exported: boolean, signature?: string) {
>  const startLine = posToLine(sf, node.getStart());
>  const endLine = posToLine(sf, node.getEnd());
>  const snippet = getNodeText(src, node);
>  const lang = getLangFromExt(fileAbs);
>  const jsdoc = getJsDocText(node);
>  const id = sha1([pkg, moduleRel, kind, name, signature ?? "", startLine, endLine].join("|"));
> 
>  symbols.push({
>  id, pkg, fileAbs, fileRel: rel, moduleRel, lang,
>  name, kind, exported, jsdoc, signature, startLine, endLine, snippet
>  });
>  }
> 
>  const visit = (node: ts.Node) => {
>  // Function declarations
>  if (ts.isFunctionDeclaration(node) && node.name) {
>  const exported = hasExport(node);
>  const sig = signatureForFunction(checker, node);
>  pushSymbol("function", node.name.text, node, exported, sig);
>  }
> 
>  // Class declarations
>  if (ts.isClassDeclaration(node) && node.name) {
>  const exported = hasExport(node);
>  pushSymbol("class", node.name.text, node, exported, `class ${node.name.text}`);
>  }
> 
>  // Type aliases
>  if (ts.isTypeAliasDeclaration(node)) {
>  const exported = hasExport(node);
>  pushSymbol("type", node.name.text, node, exported, `type ${node.name.text} = ${typeToString(checker, node.type) ?? "..."}`);
>  }
> 
>  // Interfaces (treat as 'type')
>  if (ts.isInterfaceDeclaration(node)) {
>  const exported = hasExport(node);
>  pushSymbol("type", node.name.text, node, exported, `interface ${node.name.text}`);
>  }
> 
>  // Variables
>  if (ts.isVariableStatement(node)) {
>  const exported = hasExport(node);
>  for (const decl of node.declarationList.declarations) {
>  const name = decl.name.getText();
>  pushSymbol("variable", name, decl, exported, typeToString(checker, decl) ?? undefined);
>  }
>  }
> 
>  ts.forEachChild(node, visit);
>  };
> 
>  visit(sf);
>  }
> 
>  await fs.mkdir(path.dirname(OUT), { recursive: true });
>  const payload: ScanResult = { symbols };
>  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf-8");
>  console.log(`Scanned ${symbols.length} symbols → ${path.relative(repoRoot, OUT)}`);
> }
> 
> function hasExport(node: ts.Node): boolean {
>  const m = ts.getCombinedModifierFlags(node as any);
>  return (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0;
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `packages/symdocs/src/02-docs.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { z } from "zod";
> import { parseArgs, OLLAMA_URL, sha1 } from "./utils.js";
> import type { DocDraft, DocMap, ScanResult } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/symdocs/symbols.json",
>  "--out": ".cache/symdocs/docs.json",
>  "--model": "qwen3:4b",
>  "--force": "false",
>  "--concurrency": "4"
> });
> 
> const DraftSchema = z.object({
>  title: z.string().min(1),
>  summary: z.string().min(1),
>  usage: z.string().optional(),
>  details: z.string().optional(),
>  pitfalls: z.array(z.string()).optional(),
>  tags: z.array(z.string()).optional(),
>  mermaid: z.string().optional()
> });
> 
> async function ollamaJSON(model: string, prompt: string): Promise<any> {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST",
>  headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`Ollama error ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
>  return JSON.parse(cleaned);
> }
> 
> function semaphore(max: number) {
>  let cur = 0;
>  const q: Array<() => void> = [];
>  const take = () => new Promise<void>((res) => {
>  if (cur < max) { cur++; res(); }
>  else q.push(res);
>  });
>  const release = () => { cur--; const f = q.shift(); if (f) f(); };
>  return { take, release };
> }
> 
> async function main() {
>  const scanPath = path.resolve(args["--scan"]);
>  const outPath = path.resolve(args["--out"]);
>  const model = args["--model"];
>  const force = args["--force"] === "true";
>  const conc = parseInt(args["--concurrency"], 10) || 4;
> 
>  const { symbols }: ScanResult = JSON.parse(await fs.readFile(scanPath, "utf-8"));
>  const cache: DocMap = (await readJSON(outPath)) ?? {};
> 
>  const sem = semaphore(conc);
>  const next: DocMap = { ...cache };
>  let done = 0;
> 
>  await Promise.all(symbols.map(async (s) => {
>  const cacheKey = s.id + "::" + sha1([s.signature ?? "", s.jsdoc ?? "", s.snippet].join("|"));
>  if (!force && next[s.id] && (next[s.id] as any)._cacheKey === cacheKey) { done++; return; }
> 
>  await sem.take();
>  try {
>  const sys = [
>  "You are a senior library author generating concise, practical docs.",
>  "Return ONLY JSON with keys: title, summary, usage?, details?, pitfalls?, tags?, mermaid?",
>  "summary: 1-2 sentences tops. usage: one code fence. pitfalls: 0-5 bullets. tags: 3-10.",
>  "mermaid (optional): small diagram if helpful (class/sequence/flow); omit if unsure."
>  ].join("\n");
> 
>  const user = [
>  `SYMBOL`,
>  `- name: ${s.name}`,
>  `- kind: ${s.kind}`,
>  `- exported: ${s.exported}`,
>  s.signature ? `- signature: ${s.signature}` : "",
>  `- file: ${s.fileRel}:${s.startLine}-${s.endLine}`,
>  s.jsdoc ? `- jsdoc:\n${s.jsdoc}` : "- jsdoc: (none)",
>  `- snippet:\n${s.snippet}`
>  ].filter(Boolean).join("\n");
> 
>  const prompt = `SYSTEM:\n${sys}\n\nUSER:\n${user}`;
>  let obj = await ollamaJSON(model, prompt);
>  const parsed = DraftSchema.safeParse(obj);
>  if (!parsed.success) {
>  // Minimal fallback
>  obj = {
>  title: `${s.name} (${s.kind})`,
>  summary: s.signature ? s.signature : `Auto-doc for ${s.kind} ${s.name}`,
>  usage: s.kind === "function" ? `\n\`\`\`${s.lang}\n// Example\n${s.name}(...args)\n\`\`\`\n` : undefined,
>  pitfalls: []
>  };
>  }
> 
>  const draft: DocDraft = {
>  id: s.id, name: s.name, kind: s.kind,
>  title: obj.title, summary: obj.summary,
>  usage: obj.usage, details: obj.details,
>  pitfalls: obj.pitfalls, tags: obj.tags, mermaid: obj.mermaid
>  };
>  (draft as any)._cacheKey = cacheKey; // non-persisted? we’ll persist but ignore when writing md
>  next[s.id] = draft;
>  done++;
>  if (done % 20 === 0) console.log(`generated ${done}/${symbols.length}…`);
>  } finally {
>  sem.release();
>  }
>  }));
> 
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
>  await fs.writeFile(outPath, JSON.stringify(next, null, 2), "utf-8");
>  console.log(`Docs generated for ${Object.keys(next).length} symbols → ${path.relative(process.cwd(), outPath)}`);
> }
> 
> async function readJSON(p: string): Promise<any | undefined> {
>  try { return JSON.parse(await fs.readFile(p, "utf-8")); } catch { return undefined; }
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `packages/symdocs/src/03-write.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import * as yaml from "yaml";
> import { parseArgs } from "./utils.js";
> import type { DocMap, ScanResult, SymbolInfo } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/symdocs/symbols.json",
>  "--docs": ".cache/symdocs/docs.json",
>  "--out": "docs/packages",
>  "--granularity": "module" // "module" | "symbol"
> });
> 
> const OUT_ROOT = path.resolve(args["--out"]);
> const GRANULARITY = args["--granularity"] as "module" | "symbol";
> 
> type GroupKey = string; // pkg|moduleRel
> 
> function fm(obj: any) {
>  return yaml.stringify(obj, { indent: 2, simpleKeys: true });
> }
> 
> function startMark() { return "<!-- SYMDOCS:BEGIN -->"; }
> function endMark() { return "<!-- SYMDOCS:END -->"; }
> 
> async function main() {
>  const scan: ScanResult = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8"));
>  const docs: DocMap = JSON.parse(await fs.readFile(path.resolve(args["--docs"]), "utf-8"));
> 
>  if (GRANULARITY === "symbol") {
>  await writeOnePerSymbol(scan.symbols, docs);
>  } else {
>  await writeOnePerModule(scan.symbols, docs);
>  }
>  console.log("Write complete.");
> }
> 
> async function writeOnePerModule(symbols: SymbolInfo[], docs: DocMap) {
>  // group by module
>  const groups = new Map<GroupKey, SymbolInfo[]>();
>  for (const s of symbols) {
>  const key = `${s.pkg}|${s.moduleRel}`;
>  (groups.get(key) ?? groups.set(key, []).get(key)!).push(s);
>  }
> 
>  for (const [key, syms] of groups) {
>  const [pkg, moduleRel] = key.split("|");
>  const outPath = path.join(OUT_ROOT, pkg, moduleRel.replace(/\.(ts|tsx|js|jsx)$/i, ".md"));
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
> 
>  const fmHeader = {
>  package: pkg,
>  module: moduleRel,
>  generated_at: new Date().toISOString()
>  };
> 
>  // existing content (preserve anything above marker)
>  const existing = await readMaybe(outPath);
>  const gm = existing ? matter(existing) : { content: "", data: {} };
>  const preserved = stripBetween(gm.content, startMark(), endMark());
> 
>  const sections = syms.map((s) => renderSymbolSection(s, docs[s.id])).join("\n\n");
> 
>  const body = [
>  preserved.trimEnd(),
>  "",
>  startMark(),
>  `# ${pkg}/${moduleRel}`,
>  "",
>  "## Symbols",
>  "",
>  ...syms.map((s) => `- [${s.name}](#${slug(s.name)}-${s.kind})`),
>  "",
>  sections,
>  endMark(),
>  ""
>  ].join("\n");
> 
>  const final = matter.stringify(body, { ...gm.data, ...fmHeader }, { language: "yaml" });
>  await fs.writeFile(outPath, final, "utf-8");
>  }
> }
> 
> async function writeOnePerSymbol(symbols: SymbolInfo[], docs: DocMap) {
>  for (const s of symbols) {
>  const outPath = path.join(
>  OUT_ROOT,
>  s.pkg,
>  s.moduleRel.replace(/\.(ts|tsx|js|jsx)$/i, ""),
>  "__symbols",
>  `${s.name}-${s.kind}.md`
>  );
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
> 
>  const fmHeader = {
>  package: s.pkg,
>  module: s.moduleRel,
>  symbol: s.name,
>  kind: s.kind,
>  exported: s.exported,
>  generated_at: new Date().toISOString()
>  };
> 
>  const section = renderSymbolSection(s, docs[s.id]);
>  const final = matter.stringify(section + "\n", fmHeader, { language: "yaml" });
>  await fs.writeFile(outPath, final, "utf-8");
>  }
> }
> 
> function renderSymbolSection(s: SymbolInfo, d?: any): string {
>  const title = d?.title ?? `${s.name} (${s.kind})`;
>  const summary = d?.summary ?? (s.signature || "");
>  const usage = d?.usage ? ensureCodeFence(d.usage, s.lang) : undefined;
>  const details = d?.details;
>  const pitfalls = d?.pitfalls as string[] | undefined;
>  const tags = (d?.tags as string[] | undefined)?.slice(0, 10);
>  const mermaid = d?.mermaid;
> 
>  const lines: string[] = [
>  `### ${title} {: #${slug(s.name)}-${s.kind}}`,
>  "",
>  summary ? `> ${summary}` : "",
>  s.signature ? `\n**Signature:** \`${s.signature}\`\n` : "",
>  usage ? `${usage}\n` : "",
>  details ?? "",
>  pitfalls?.length ? `\n**Pitfalls:**\n${pitfalls.map((p) => `- ${p}`).join("\n")}\n` : "",
>  tags?.length ? `**Tags:** ${tags.join(", ")}` : "",
>  mermaid ? `\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n` : "",
>  "<details><summary>Source</summary>\n\n```" + s.lang + `\n${s.snippet.trim()}\n\`\`\`\n\n</details>`
>  ].filter(Boolean);
> 
>  return lines.join("\n");
> }
> 
> function ensureCodeFence(block: string, lang: string) {
>  const trimmed = block.trim();
>  if (/^```/.test(trimmed)) return trimmed;
>  return `\`\`\`${lang}\n${trimmed}\n\`\`\``;
> }
> 
> function slug(s: string) {
>  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
> }
> 
> async function readMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> function stripBetween(text: string, start: string, end: string) {
>  const si = text.indexOf(start);
>  const ei = text.indexOf(end);
>  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
>  return text.trimEnd();
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## How to use
> 
> ```bash
> # from repo root
> pnpm -w add -D tsx typescript
> pnpm -w --filter @promethean/symdocs i
> 
> # 1) scan symbols
> pnpm --filter @promethean/symdocs symdocs:01-scan --root packages --tsconfig ./tsconfig.json
> 
> # 2) generate docs via Ollama (choose your local model)
> pnpm --filter @promethean/symdocs symdocs:02-docs --model qwen3:4b
> 
> # 3) write markdown into docs/packages
> pnpm --filter @promethean/symdocs symdocs:03-write --out docs/packages --granularity module
> ```
> 
> ### Output (example)
> 
> - `docs/packages/<pkg>/src/utils.md` (module-level doc)
>  - Frontmatter with `{ package, module, generated_at }`
>  - Preserves any content **above** `<!-- SYMDOCS:BEGIN -->`
>  - Replaces content **between** `SYMDOCS:BEGIN/END` every run
>  - “Symbols” TOC + one `###` section per symbol (summary, signature, usage code fence, pitfalls, optional mermaid, collapsible source)
> 
> ---
> 
> ## Notes / knobs
> 
> - **Granularity**: pass `--granularity symbol` to write 1 file per symbol instead of a single module doc.
> - **Cache**: `02-docs.ts` hashes signature/JSDoc/snippet; reuses drafts unless `--force true`.
> - **Model**: `--model qwen3:4b` (or `gemma3:latest`, etc.) — must exist in your local Ollama.
> - **Type coverage**: functions, variables, classes, **type aliases**, **interfaces** (counted as `type`). If you want `enum`, say the word and I’ll add it.
> - **Obsidian**: internal anchors like `{: #name-kind}` are compatible with Obsidian’s heading .
> - **No bloated frontmatter**: All the heavy prose sits in the body; FM stays tiny.
> 
> If you want me to also emit a **package index page** (`docs/packages/<pkg>/README.md`) that to every module doc with a Mermaid dependency map, I can bolt that on as a `04-index.ts`.
<!-- UID: c3755339-968f-49b7-8d81-921d36f0992c -->

---




>[!nexus_user] **User** - 08/31/2025 at 3:39 PM
> yeap send it lets get the package graph
<!-- UID: a1750377-98fe-47bf-9aab-fa00d251c162 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 3:39 PM
> Heck yes—here’s a drop-in **package graph** generator that scans `packages/*`, builds internal dependency edges (from both `package.json` **and** real source imports), and writes Mermaid graphs to:
> 
> - `docs/packages/README.md` (global graph + index)
> - `docs/packages/<folder>/README.md` (per-package mini graph + deps/dependees)
> 
> It’s idempotent: only content between markers gets replaced.
> 
> ---
> 
> ## 1) Add the script to `@promethean/symdocs`
> 
> ### `packages/symdocs/src/04-graph.ts`
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> 
> type Pkg = {
>  name: string; // npm name, e.g. @promethean/foo
>  folder: string; // folder under packages/, e.g. foo
>  dir: string; // absolute dir
>  manifest: any; // package.json
>  declaredDeps: Set<string>; // internal deps declared in package.json
>  importDeps: Set<string>; // internal deps referenced in source imports
> };
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--out": "docs/packages",
>  "--ext": ".ts,.tsx,.js,.jsx",
>  "--include-imports": "true", // analyze imports in source files
>  "--respect-manifest": "true" // include package.json deps as edges
> });
> 
> const ROOT = path.resolve(args["--root"]);
> const OUT_ROOT = path.resolve(args["--out"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const INCLUDE_IMPORTS = args["--include-imports"] === "true";
> const RESPECT_MANIFEST = args["--respect-manifest"] === "true";
> 
> const GLOBAL_START = "<!-- SYMPKG:BEGIN -->";
> const GLOBAL_END = "<!-- SYMPKG:END -->";
> const PKG_START = "<!-- SYMPKG:PKG:BEGIN -->";
> const PKG_END = "<!-- SYMPKG:PKG:END -->";
> 
> async function main() {
>  const pkgs = await findWorkspacePackages(ROOT);
>  if (pkgs.length === 0) {
>  console.log("No packages found under", ROOT);
>  return;
>  }
> 
>  // Map npm name -> Pkg
>  const byName = new Map<string, Pkg>(pkgs.map((p) => [p.name, p]));
>  // Internal names only
>  const internalNames = new Set(pkgs.map((p) => p.name));
> 
>  // Fill importDeps by scanning sources
>  if (INCLUDE_IMPORTS) {
>  await Promise.all(
>  pkgs.map(async (p) => {
>  const files = await listFilesRec(p.dir, EXTS);
>  const specs = new Set<string>();
>  for (const f of files) {
>  const src = await fs.readFile(f, "utf-8");
>  for (const spec of extractImportSpecifiers(src)) {
>  const top = topLevelPackageName(spec);
>  if (top && internalNames.has(top) && top !== p.name) specs.add(top);
>  }
>  }
>  p.importDeps = specs;
>  })
>  );
>  }
> 
>  // Build edges
>  type Edge = { from: string; to: string; kind: "manifest" | "import" };
>  const edges: Edge[] = [];
> 
>  for (const p of pkgs) {
>  if (RESPECT_MANIFEST) {
>  for (const to of p.declaredDeps) {
>  if (internalNames.has(to) && to !== p.name) edges.push({ from: p.name, to, kind: "manifest" });
>  }
>  }
>  if (INCLUDE_IMPORTS) {
>  for (const to of p.importDeps) {
>  if (internalNames.has(to) && to !== p.name) edges.push({ from: p.name, to, kind: "import" });
>  }
>  }
>  }
> 
>  // Deduplicate edges preferring 'manifest' over 'import' when both exist
>  const uniq = new Map<string, Edge>();
>  for (const e of edges) {
>  const k = `${e.from}::${e.to}`;
>  const prev = uniq.get(k);
>  if (!prev) uniq.set(k, e);
>  else if (prev.kind !== "manifest" && e.kind === "manifest") uniq.set(k, e);
>  }
>  const edgeList = Array.from(uniq.values());
> 
>  // Compute dependents/dependencies per package
>  const deps = new Map<string, Set<string>>();
>  const rdeps = new Map<string, Set<string>>();
>  for (const p of pkgs) { deps.set(p.name, new Set()); rdeps.set(p.name, new Set()); }
>  for (const { from, to } of edgeList) {
>  deps.get(from)!.add(to);
>  rdeps.get(to)!.add(from);
>  }
> 
>  await fs.mkdir(OUT_ROOT, { recursive: true });
> 
>  // 1) Global README with big graph + index
>  const globalReadme = path.join(OUT_ROOT, "README.md");
>  const existingGlobal = await readMaybe(globalReadme);
>  const preservedTop = stripBetween(existingGlobal ?? "", GLOBAL_START, GLOBAL_END);
> 
>  const nodeIds = new Map<string, string>(); // npm name -> mermaid identifier
>  pkgs.forEach((p, i) => nodeIds.set(p.name, `n${i + 1}`));
> 
>  const graph = buildMermaidGlobal(pkgs, edgeList, nodeIds, (name) =>
>  path.join("./", byName.get(name)!.folder, "README.md").replace(/\\/g, "/")
>  );
> 
>  const indexLines: string[] = [
>  "## Packages",
>  "",
>  ...pkgs
>  .sort((a, b) => a.name.localeCompare(b.name))
>  .map((p) => {
>  const d = deps.get(p.name)!.size;
>  const r = rdeps.get(p.name)!.size;
>  const href = `./${p.folder}/README.md`;
>  return `- [${p.name}](${href}) — deps: ${d}, dependents: ${r}`;
>  }),
>  ];
> 
>  const globalBody = [
>  preservedTop.trimEnd(),
>  "",
>  GLOBAL_START,
>  "# Workspace Package Graph",
>  "",
>  "> _This section is auto-generated. Do not edit within markers._",
>  "",
>  "```mermaid",
>  graph.trim(),
>  "```",
>  "",
>  ...indexLines,
>  GLOBAL_END,
>  "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> 
>  await fs.writeFile(globalReadme, globalBody, "utf-8");
> 
>  // 2) Per-package README with local graph + lists
>  for (const p of pkgs) {
>  const pkgReadme = path.join(OUT_ROOT, p.folder, "README.md");
>  await fs.mkdir(path.dirname(pkgReadme), { recursive: true });
>  const existing = await readMaybe(pkgReadme);
>  const preserved = stripBetween(existing ?? "", PKG_START, PKG_END);
> 
>  const ds = Array.from(deps.get(p.name)!).sort();
>  const rs = Array.from(rdeps.get(p.name)!).sort();
> 
>  const localGraph = buildMermaidLocal(p.name, ds, rs, (name) =>
>  path.relative(path.dirname(pkgReadme), path.join(OUT_ROOT, byName.get(name)!.folder, "README.md")).replace(/\\/g, "/")
>  );
> 
>  const body = [
>  preserved.trimEnd(),
>  "",
>  PKG_START,
>  `# ${p.name}`,
>  "",
>  `**Folder:** \`packages/${p.folder}\` `,
>  `**Version:** \`${p.manifest.version ?? "0.0.0"}\``,
>  "",
>  "```mermaid",
>  localGraph.trim(),
>  "```",
>  "",
>  "## Dependencies",
>  "",
>  ds.length ? ds.map((n) => `- [${n}](${relativeToPkgReadmeLink(p.folder, byName.get(n)!.folder)})`).join("\n") : "- _None_",
>  "",
>  "## Dependents",
>  "",
>  rs.length ? rs.map((n) => `- [${n}](${relativeToPkgReadmeLink(p.folder, byName.get(n)!.folder)})`).join("\n") : "- _None_",
>  PKG_END,
>  "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> 
>  await fs.writeFile(pkgReadme, body, "utf-8");
>  }
> 
>  console.log(`Wrote package graphs to ${path.relative(process.cwd(), OUT_ROOT)}`);
> }
> 
> /* ---------------- helpers ---------------- */
> 
> function parseArgs(defaults: Record<string, string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i = 0; i < a.length; i++) {
>  const k = a[i];
>  if (!k.startsWith("--")) continue;
>  const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
>  out[k] = v;
>  }
>  return out;
> }
> 
> async function listDirs(p: string): Promise<string[]> {
>  const ents = await fs.readdir(p, { withFileTypes: true });
>  return ents.filter((e) => e.isDirectory()).map((e) => path.join(p, e.name));
> }
> 
> async function findWorkspacePackages(root: string): Promise<Pkg[]> {
>  const dirs = await listDirs(root);
>  const out: Pkg[] = [];
> 
>  // Recursively include nested package folders (packages/* and packages/*/*)
>  async function pushIfPkg(dir: string) {
>  const pkgJson = path.join(dir, "package.json");
>  try {
>  const raw = await fs.readFile(pkgJson, "utf-8");
>  const manifest = JSON.parse(raw);
>  if (manifest.name) {
>  const folder = dir.split(path.sep).slice(dir.split(path.sep).indexOf(path.basename(root)) + 1).join(path.sep);
>  out.push({
>  name: manifest.name,
>  folder: folder || path.basename(dir),
>  dir,
>  manifest,
>  declaredDeps: collectDeclaredDeps(manifest),
>  importDeps: new Set<string>(),
>  });
>  }
>  } catch { /* not a package */ }
>  }
> 
>  for (const d of dirs) {
>  await pushIfPkg(d);
>  // nested level (e.g., packages/libs/*)
>  const sub = await listDirs(d);
>  for (const sd of sub) await pushIfPkg(sd);
>  }
>  return out;
> }
> 
> function collectDeclaredDeps(pkg: any): Set<string> {
>  const names = new Set<string>();
>  for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
>  const o = pkg[key] || {};
>  for (const k of Object.keys(o)) names.add(k);
>  }
>  return names;
> }
> 
> async function listFilesRec(root: string, exts: Set<string>): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(d: string) {
>  const ents = await fs.readdir(d, { withFileTypes: true });
>  for (const e of ents) {
>  const p = path.join(d, e.name);
>  if (e.isDirectory()) {
>  // ignore common build output
>  if (["node_modules", "dist", "build", "coverage", ".turbo", ".next"].includes(e.name)) continue;
>  await walk(p);
>  } else {
>  if (exts.has(path.extname(p).toLowerCase())) out.push(p);
>  }
>  }
>  }
>  await walk(root);
>  return out;
> }
> 
> const IMPORT_RE = [
>  /import\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g, // import x from 'spec'
>  /import\s*['"]([^'"]+)['"]/g, // bare side-effect import
>  /require\(\s*['"]([^'"]+)['"]\s*\)/g, // require('spec')
>  /import\(\s*['"]([^'"]+)['"]\s*\)/g // dynamic import('spec')
> ];
> 
> function extractImportSpecifiers(src: string): string[] {
>  const specs: string[] = [];
>  for (const re of IMPORT_RE) {
>  re.lastIndex = 0;
>  let m;
>  while ((m = re.exec(src)) !== null) {
>  const s = m[1];
>  if (!s || s.startsWith(".") || s.startsWith("/")) continue; // ignore relative
>  specs.push(s);
>  }
>  }
>  return specs;
> }
> 
> function topLevelPackageName(spec: string): string | null {
>  if (!spec) return null;
>  if (spec.startsWith("@")) {
>  const parts = spec.split("/");
>  if (parts.length >= 2) return parts.slice(0, 2).join("/");
>  return null;
>  } else {
>  const parts = spec.split("/");
>  return parts[0] || null;
>  }
> }
> 
> function stripBetween(text: string, start: string, end: string) {
>  if (!text) return "";
>  const si = text.indexOf(start);
>  const ei = text.indexOf(end);
>  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
>  return text.trimEnd();
> }
> 
> async function readMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> function relativeToPkgReadmeLink(fromFolder: string, toFolder: string) {
>  return `../${toFolder}/README.md`.replace(/\\/g, "/");
> }
> 
> /* ---------- Mermaid builders ---------- */
> 
> function esc(s: string) {
>  return s.replace(/"/g, '\\"');
> }
> 
> function buildMermaidGlobal(
>  pkgs: Pkg[],
>  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
>  idOf: Map<string, string>,
>  hrefOf: (name: string) => string
> ) {
>  // nodes
>  const nodeLines = pkgs.map((p) => `${idOf.get(p.name)}["${esc(p.name)}"]`).join("\n ");
> 
>  // edges: manifest solid, import dotted if not manifest
>  const edgeLines = edges
>  .map((e) => {
>  const a = idOf.get(e.from)!;
>  const b = idOf.get(e.to)!;
>  return e.kind === "manifest" ? `${a} --> ${b}` : `${a} -.-> ${b}`;
>  })
>  .join("\n ");
> 
>  // click handlers (where supported)
>  const clickLines = pkgs
>  .map((p) => `click ${idOf.get(p.name)} "${hrefOf(p.name)}" "${esc(p.name)} docs"`)
>  .join("\n ");
> 
>  return [
>  "graph LR",
>  ` ${nodeLines}`,
>  edgeLines ? ` ${edgeLines}` : "",
>  clickLines ? ` ${clickLines}` : "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> }
> 
> function buildMermaidLocal(
>  name: string,
>  deps: string[],
>  rdeps: string[],
>  hrefOf: (name: string) => string
> ) {
>  const center = "A";
>  const nodes = [`${center}["${esc(name)}"]`];
> 
>  const depNodes = deps.map((n, i) => `D${i + 1}["${esc(n)}"]`);
>  const rdepNodes = rdeps.map((n, i) => `R${i + 1}["${esc(n)}"]`);
> 
>  const edges: string[] = [];
>  depNodes.forEach((d) => edges.push(`${center} --> ${d}`));
>  rdepNodes.forEach((r) => edges.push(`${r} --> ${center}`));
> 
>  const clicks: string[] = [];
>  deps.forEach((n, i) => clicks.push(`click D${i + 1} "${hrefOf(n)}" "${esc(n)}"`));
>  rdeps.forEach((n, i) => clicks.push(`click R${i + 1} "${hrefOf(n)}" "${esc(n)}"`));
> 
>  return [
>  "graph LR",
>  ` ${nodes.join("\n ")}`,
>  depNodes.length ? ` ${depNodes.join("\n ")}` : "",
>  rdepNodes.length ? ` ${rdepNodes.join("\n ")}` : "",
>  edges.length ? ` ${edges.join("\n ")}` : "",
>  clicks.length ? ` ${clicks.join("\n ")}` : "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> }
> 
> main().catch((e) => {
>  console.error(e);
>  process.exit(1);
> });
> ```
> 
> ---
> 
> ## 2) Wire it up
> 
> Add to `packages/symdocs/package.json`:
> 
> ```json
> {
>  "scripts": {
>  "symdocs:04-graph": "tsx src/04-graph.ts --root packages --out docs/packages --include-imports true --respect-manifest true"
>  }
> }
> ```
> 
> Run it:
> 
> ```bash
> pnpm --filter @promethean/symdocs symdocs:04-graph
> ```
> 
> This will create/refresh:
> 
> - `docs/packages/README.md` with a Mermaid **workspace graph** + package index
> - `docs/packages/<folder>/README.md` with a **local graph** (deps & dependents)
> 
> The script merges edges from:
> - **`package.json`** (`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`) → solid arrows `-->`
> - **source imports** (`import`, `require`, dynamic `import()`) → dotted arrows `-.->` (only shown if no manifest edge exists)
> 
> You can toggle either source of truth:
> - Skip import analysis: `--include-imports false`
> - Ignore manifests (only imports): `--respect-manifest false`
> 
> ---
> 
> ## Notes
> 
> - Works with scoped names (e.g. `@promethean/foo`), including `import '@promethean/foo/utils'` (normalized to `@promethean/foo`).
> - Skips `node_modules`, `dist`, `build`, `.next`, `coverage`, `.turbo`.
> - Idempotent: only replaces content between `<!-- SYMPKG:BEGIN/END -->` and `<!-- SYMPKG:PKG:BEGIN/END -->`; anything above stays yours.
> 
> Want me to also add a **reverse-dep table** on the global page, or split graphs by domain (subfolders under `packages/`)? I can extend this with a couple flags.
<!-- UID: a7799438-d6e6-4eda-9369-77b133c80919 -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:03 PM
> yea let's do both of those things
<!-- UID: 74551076-bcf5-4253-b7ec-b78344ea2b05 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:03 PM
> Absolutely — here’s an upgraded **04-graph.ts** that adds:
> 
> 1) a **reverse-dependency table** (sortable-looking Markdown) on the global page, and 
> 2) **domain graphs** split by subfolders under `packages/` (e.g., `packages/apps/*`, `packages/libs/*`, etc.).
> 
> It’s still idempotent and only rewrites between markers.
> 
> ---
> 
> ### Drop-in replacement: `packages/symdocs/src/04-graph.ts`
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> 
> type Pkg = {
>  name: string; // npm name, e.g. @promethean/foo
>  folder: string; // folder under packages/, e.g. foo OR apps/web
>  dir: string; // absolute dir
>  manifest: any; // package.json
>  declaredDeps: Set<string>; // internal deps declared in package.json
>  importDeps: Set<string>; // internal deps referenced in source imports
>  domain: string; // computed domain (e.g., "apps" for apps/web; "_root" for top-level)
> };
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--out": "docs/packages",
>  "--ext": ".ts,.tsx,.js,.jsx",
>  "--include-imports": "true", // analyze imports in source files
>  "--respect-manifest": "true", // include package.json deps as edges
>  "--render-domain-graphs": "true",
>  "--domain-depth": "1", // how many path segments under packages/ define a domain
>  "--rdeps-table": "true",
>  "--max-rdeps-list": "12" // show up to N dependents in the table cells
> });
> 
> const ROOT = path.resolve(args["--root"]);
> const OUT_ROOT = path.resolve(args["--out"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const INCLUDE_IMPORTS = args["--include-imports"] === "true";
> const RESPECT_MANIFEST = args["--respect-manifest"] === "true";
> const RENDER_DOMAIN_GRAPHS = args["--render-domain-graphs"] === "true";
> const DOMAIN_DEPTH = Math.max(1, parseInt(args["--domain-depth"], 10) || 1);
> const RDEPS_TABLE = args["--rdeps-table"] === "true";
> const MAX_RDEPS_LIST = Math.max(0, parseInt(args["--max-rdeps-list"], 10) || 0);
> 
> const GLOBAL_START = "<!-- SYMPKG:BEGIN -->";
> const GLOBAL_END = "<!-- SYMPKG:END -->";
> const PKG_START = "<!-- SYMPKG:PKG:BEGIN -->";
> const PKG_END = "<!-- SYMPKG:PKG:END -->";
> 
> async function main() {
>  const pkgs = await findWorkspacePackages(ROOT, DOMAIN_DEPTH);
>  if (pkgs.length === 0) {
>  console.log("No packages found under", ROOT);
>  return;
>  }
> 
>  // Map npm name -> Pkg
>  const byName = new Map<string, Pkg>(pkgs.map((p) => [p.name, p]));
>  const internalNames = new Set(pkgs.map((p) => p.name));
> 
>  // import analysis
>  if (INCLUDE_IMPORTS) {
>  await Promise.all(
>  pkgs.map(async (p) => {
>  const files = await listFilesRec(p.dir, EXTS);
>  const specs = new Set<string>();
>  for (const f of files) {
>  const src = await fs.readFile(f, "utf-8");
>  for (const spec of extractImportSpecifiers(src)) {
>  const top = topLevelPackageName(spec);
>  if (top && internalNames.has(top) && top !== p.name) specs.add(top);
>  }
>  }
>  p.importDeps = specs;
>  })
>  );
>  }
> 
>  // Build edges
>  type Edge = { from: string; to: string; kind: "manifest" | "import" };
>  const edges: Edge[] = [];
> 
>  for (const p of pkgs) {
>  if (RESPECT_MANIFEST) {
>  for (const to of p.declaredDeps) {
>  if (internalNames.has(to) && to !== p.name) edges.push({ from: p.name, to, kind: "manifest" });
>  }
>  }
>  if (INCLUDE_IMPORTS) {
>  for (const to of p.importDeps) {
>  if (internalNames.has(to) && to !== p.name) edges.push({ from: p.name, to, kind: "import" });
>  }
>  }
>  }
> 
>  // Deduplicate edges preferring 'manifest' over 'import'
>  const uniq = new Map<string, Edge>();
>  for (const e of edges) {
>  const k = `${e.from}::${e.to}`;
>  const prev = uniq.get(k);
>  if (!prev) uniq.set(k, e);
>  else if (prev.kind !== "manifest" && e.kind === "manifest") uniq.set(k, e);
>  }
>  const edgeList = Array.from(uniq.values());
> 
>  // Compute deps/dependees
>  const deps = new Map<string, Set<string>>();
>  const rdeps = new Map<string, Set<string>>();
>  for (const p of pkgs) { deps.set(p.name, new Set()); rdeps.set(p.name, new Set()); }
>  for (const { from, to } of edgeList) {
>  deps.get(from)!.add(to);
>  rdeps.get(to)!.add(from);
>  }
> 
>  await fs.mkdir(OUT_ROOT, { recursive: true });
> 
>  // 1) Global README with big graph + index + (optional) reverse-dep table + (optional) domain graphs
>  const globalReadme = path.join(OUT_ROOT, "README.md");
>  const existingGlobal = await readMaybe(globalReadme);
>  const preservedTop = stripBetween(existingGlobal ?? "", GLOBAL_START, GLOBAL_END);
> 
>  const nodeIds = new Map<string, string>(); // npm name -> mermaid id
>  pkgs.forEach((p, i) => nodeIds.set(p.name, `n${i + 1}`));
> 
>  const globalGraph = buildMermaidGlobal(pkgs, edgeList, nodeIds, (name) =>
>  path.join("./", byName.get(name)!.folder, "README.md").replace(/\\/g, "/")
>  );
> 
>  const indexLines: string[] = [
>  "## Packages",
>  "",
>  ...pkgs
>  .sort((a, b) => a.name.localeCompare(b.name))
>  .map((p) => {
>  const d = deps.get(p.name)!.size;
>  const r = rdeps.get(p.name)!.size;
>  const href = `./${p.folder}/README.md`;
>  return `- [${p.name}](${href}) — deps: ${d}, dependents: ${r}`;
>  }),
>  ];
> 
>  const rdepsTable = RDEPS_TABLE ? renderReverseDepTable(pkgs, rdeps, (name) =>
>  `./${byName.get(name)!.folder}/README.md`.replace(/\\/g, "/")
>  ) : "";
> 
>  const domainSection = RENDER_DOMAIN_GRAPHS
>  ? renderDomainGraphs(pkgs, edgeList, byName, (name, fromFolder) =>
>  path.relative(path.join(OUT_ROOT, fromFolder), path.join(OUT_ROOT, byName.get(name)!.folder, "README.md")).replace(/\\/g, "/")
>  )
>  : "";
> 
>  const globalBody = [
>  preservedTop.trimEnd(),
>  "",
>  GLOBAL_START,
>  "# Workspace Package Graph",
>  "",
>  "> _Auto-generated. Do not edit between markers._",
>  "",
>  "```mermaid",
>  globalGraph.trim(),
>  "```",
>  "",
>  ...indexLines,
>  "",
>  rdepsTable ? "## Reverse dependency table" : "",
>  rdepsTable ? rdepsTable : "",
>  domainSection ? "## Domain graphs" : "",
>  domainSection ? domainSection : "",
>  GLOBAL_END,
>  "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> 
>  await fs.writeFile(globalReadme, globalBody, "utf-8");
> 
>  // 2) Per-package README with local graph + lists
>  for (const p of pkgs) {
>  const pkgReadme = path.join(OUT_ROOT, p.folder, "README.md");
>  await fs.mkdir(path.dirname(pkgReadme), { recursive: true });
>  const existing = await readMaybe(pkgReadme);
>  const preserved = stripBetween(existing ?? "", PKG_START, PKG_END);
> 
>  const ds = Array.from(deps.get(p.name)!).sort();
>  const rs = Array.from(rdeps.get(p.name)!).sort();
> 
>  const localGraph = buildMermaidLocal(p.name, ds, rs, (name) =>
>  path.relative(path.dirname(pkgReadme), path.join(OUT_ROOT, byName.get(name)!.folder, "README.md")).replace(/\\/g, "/")
>  );
> 
>  const body = [
>  preserved.trimEnd(),
>  "",
>  PKG_START,
>  `# ${p.name}`,
>  "",
>  `**Folder:** \`packages/${p.folder}\` `,
>  `**Version:** \`${p.manifest.version ?? "0.0.0"}\` `,
>  `**Domain:** \`${p.domain}\``,
>  "",
>  "```mermaid",
>  localGraph.trim(),
>  "```",
>  "",
>  "## Dependencies",
>  "",
>  ds.length ? ds.map((n) => `- [${n}](${relativeToPkgReadmeLink(p.folder, byName.get(n)!.folder)})`).join("\n") : "- _None_",
>  "",
>  "## Dependents",
>  "",
>  rs.length ? rs.map((n) => `- [${n}](${relativeToPkgReadmeLink(p.folder, byName.get(n)!.folder)})`).join("\n") : "- _None_",
>  PKG_END,
>  "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> 
>  await fs.writeFile(pkgReadme, body, "utf-8");
>  }
> 
>  console.log(`Wrote package graphs to ${path.relative(process.cwd(), OUT_ROOT)}`);
> }
> 
> /* ---------------- helpers ---------------- */
> 
> function parseArgs(defaults: Record<string, string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i = 0; i < a.length; i++) {
>  const k = a[i];
>  if (!k.startsWith("--")) continue;
>  const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
>  out[k] = v;
>  }
>  return out;
> }
> 
> async function listDirs(p: string): Promise<string[]> {
>  const ents = await fs.readdir(p, { withFileTypes: true });
>  return ents.filter((e) => e.isDirectory()).map((e) => path.join(p, e.name));
> }
> 
> async function findWorkspacePackages(root: string, domainDepth: number): Promise<Pkg[]> {
>  const dirs = await listDirs(root);
>  const out: Pkg[] = [];
> 
>  async function pushIfPkg(dir: string) {
>  const pkgJson = path.join(dir, "package.json");
>  try {
>  const raw = await fs.readFile(pkgJson, "utf-8");
>  const manifest = JSON.parse(raw);
>  if (manifest.name) {
>  const folder = dir.split(path.sep).slice(dir.split(path.sep).indexOf(path.basename(root)) + 1).join(path.sep);
>  const domain = inferDomain(folder, domainDepth);
>  out.push({
>  name: manifest.name,
>  folder: folder || path.basename(dir),
>  dir,
>  manifest,
>  declaredDeps: collectDeclaredDeps(manifest),
>  importDeps: new Set<string>(),
>  domain
>  });
>  }
>  } catch { /* not a package */ }
>  }
> 
>  for (const d of dirs) {
>  await pushIfPkg(d);
>  const sub = await listDirs(d);
>  for (const sd of sub) await pushIfPkg(sd);
>  }
>  return out;
> }
> 
> function inferDomain(folder: string, depth: number): string {
>  const parts = folder.split(/[\\/]/).filter(Boolean);
>  // If only 1 segment (top-level like packages/foo), put into _root domain.
>  if (parts.length < 2) return "_root";
>  return parts.slice(0, Math.min(depth, parts.length - 0)).slice(0, depth).join("/");
> }
> 
> function collectDeclaredDeps(pkg: any): Set<string> {
>  const names = new Set<string>();
>  for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
>  const o = pkg[key] || {};
>  for (const k of Object.keys(o)) names.add(k);
>  }
>  return names;
> }
> 
> async function listFilesRec(root: string, exts: Set<string>): Promise<string[]> {
>  const out: string[] = [];
>  async function walk(d: string) {
>  const ents = await fs.readdir(d, { withFileTypes: true });
>  for (const e of ents) {
>  const p = path.join(d, e.name);
>  if (e.isDirectory()) {
>  if (["node_modules", "dist", "build", "coverage", ".turbo", ".next"].includes(e.name)) continue;
>  await walk(p);
>  } else {
>  if (exts.has(path.extname(p).toLowerCase())) out.push(p);
>  }
>  }
>  }
>  await walk(root);
>  return out;
> }
> 
> const IMPORT_RE = [
>  /import\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g,
>  /import\s*['"]([^'"]+)['"]/g,
>  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
>  /import\(\s*['"]([^'"]+)['"]\s*\)/g
> ];
> 
> function extractImportSpecifiers(src: string): string[] {
>  const specs: string[] = [];
>  for (const re of IMPORT_RE) {
>  re.lastIndex = 0;
>  let m;
>  while ((m = re.exec(src)) !== null) {
>  const s = m[1];
>  if (!s || s.startsWith(".") || s.startsWith("/")) continue; // ignore relative
>  specs.push(s);
>  }
>  }
>  return specs;
> }
> 
> function topLevelPackageName(spec: string): string | null {
>  if (!spec) return null;
>  if (spec.startsWith("@")) {
>  const parts = spec.split("/");
>  if (parts.length >= 2) return parts.slice(0, 2).join("/");
>  return null;
>  } else {
>  const parts = spec.split("/");
>  return parts[0] || null;
>  }
> }
> 
> function stripBetween(text: string, start: string, end: string) {
>  if (!text) return "";
>  const si = text.indexOf(start);
>  const ei = text.indexOf(end);
>  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
>  return text.trimEnd();
> }
> 
> async function readMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> function relativeToPkgReadmeLink(fromFolder: string, toFolder: string) {
>  return `../${toFolder}/README.md`.replace(/\\/g, "/");
> }
> 
> /* ---------- Mermaid builders ---------- */
> 
> function esc(s: string) {
>  return s.replace(/"/g, '\\"');
> }
> 
> function buildMermaidGlobal(
>  pkgs: Pkg[],
>  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
>  idOf: Map<string, string>,
>  hrefOf: (name: string) => string
> ) {
>  const nodeLines = pkgs.map((p) => `${idOf.get(p.name)}["${esc(p.name)}"]`).join("\n ");
> 
>  const edgeLines = edges
>  .map((e) => {
>  const a = idOf.get(e.from)!;
>  const b = idOf.get(e.to)!;
>  return e.kind === "manifest" ? `${a} --> ${b}` : `${a} -.-> ${b}`;
>  })
>  .join("\n ");
> 
>  const clickLines = pkgs
>  .map((p) => `click ${idOf.get(p.name)} "${hrefOf(p.name)}" "${esc(p.name)} docs"`)
>  .join("\n ");
> 
>  return [
>  "graph LR",
>  ` ${nodeLines}`,
>  edgeLines ? ` ${edgeLines}` : "",
>  clickLines ? ` ${clickLines}` : "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> }
> 
> function buildMermaidLocal(
>  name: string,
>  deps: string[],
>  rdeps: string[],
>  hrefOf: (name: string) => string
> ) {
>  const center = "A";
>  const nodes = [`${center}["${esc(name)}"]`];
> 
>  const depNodes = deps.map((n, i) => `D${i + 1}["${esc(n)}"]`);
>  const rdepNodes = rdeps.map((n, i) => `R${i + 1}["${esc(n)}"]`);
> 
>  const edges: string[] = [];
>  depNodes.forEach((d) => edges.push(`${center} --> ${d}`));
>  rdepNodes.forEach((r) => edges.push(`${r} --> ${center}`));
> 
>  const clicks: string[] = [];
>  deps.forEach((n, i) => clicks.push(`click D${i + 1} "${hrefOf(n)}" "${esc(n)}"`));
>  rdeps.forEach((n, i) => clicks.push(`click R${i + 1} "${hrefOf(n)}" "${esc(n)}"`));
> 
>  return [
>  "graph LR",
>  ` ${nodes.join("\n ")}`,
>  depNodes.length ? ` ${depNodes.join("\n ")}` : "",
>  rdepNodes.length ? ` ${rdepNodes.join("\n ")}` : "",
>  edges.length ? ` ${edges.join("\n ")}` : "",
>  clicks.length ? ` ${clicks.join("\n ")}` : "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> }
> 
> function buildMermaidDomain(
>  domain: string,
>  pkgs: Pkg[],
>  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
>  hrefOf: (name: string) => string
> ) {
>  const ids = new Map<string, string>();
>  pkgs.forEach((p, i) => ids.set(p.name, `d${Math.abs(hash(domain + p.name)).toString(36)}_${i + 1}`));
> 
>  const nodeLines = pkgs.map((p) => `${ids.get(p.name)}["${esc(p.name)}"]`).join("\n ");
>  const names = new Set(pkgs.map((p) => p.name));
> 
>  const edgeLines = edges
>  .filter((e) => names.has(e.from) && names.has(e.to))
>  .map((e) => {
>  const a = ids.get(e.from)!;
>  const b = ids.get(e.to)!;
>  return e.kind === "manifest" ? `${a} --> ${b}` : `${a} -.-> ${b}`;
>  })
>  .join("\n ");
> 
>  const clickLines = pkgs
>  .map((p) => `click ${ids.get(p.name)} "${hrefOf(p.name)}" "${esc(p.name)} docs"`)
>  .join("\n ");
> 
>  return [
>  "graph LR",
>  ` %% domain: ${domain}`,
>  ` ${nodeLines}`,
>  edgeLines ? ` ${edgeLines}` : "",
>  clickLines ? ` ${clickLines}` : "",
>  ]
>  .filter(Boolean)
>  .join("\n");
> }
> 
> /* ---------- Renderers ---------- */
> 
> function renderReverseDepTable(
>  pkgs: Pkg[],
>  rdeps: Map<string, Set<string>>,
>  hrefOf: (name: string) => string
> ): string {
>  const rows = pkgs
>  .map((p) => ({ name: p.name, deps: rdeps.get(p.name) ?? new Set<string>() }))
>  .sort((a, b) => b.deps.size - a.deps.size);
> 
>  const lines: string[] = [];
>  lines.push("| Package | Dependents | Top dependents |");
>  lines.push("|---|---:|---|");
>  for (const r of rows) {
>  const list = Array.from(r.deps).sort();
>  const shown = MAX_RDEPS_LIST > 0 ? list.slice(0, MAX_RDEPS_LIST) : list;
>  const extra = MAX_RDEPS_LIST > 0 && list.length > MAX_RDEPS_LIST ? `, +${list.length - MAX_RDEPS_LIST} more` : "";
>  const = shown.map((n) => `[${n}](${hrefOf(n)})`).join(", ") + (extra ? extra : "");
>  lines.push(`| [${r.name}](${hrefOf(r.name)}) | ${list.length} | ${ || "_None_"} |`);
>  }
>  return lines.join("\n");
> }
> 
> function renderDomainGraphs(
>  pkgs: Pkg[],
>  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
>  byName: Map<string, Pkg>,
>  hrefOfRelTo: (name: string, fromFolder: string) => string
> ): string {
>  const byDomain = new Map<string, Pkg[]>();
>  for (const p of pkgs) (byDomain.get(p.domain) ?? byDomain.set(p.domain, []).get(p.domain)!).push(p);
> 
>  const sections: string[] = [];
>  for (const [domain, list] of Array.from(byDomain.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
>  const mermaid = buildMermaidDomain(domain, list, edges, (name) => hrefOfRelTo(name, /*fromFolder*/ list[0].folder));
>  const cross = crossDomainEdges(domain, list.map((p) => p.name), edges);
> 
>  sections.push(
>  `### ${domain === "_root" ? "root (packages/*)" : domain}`,
>  "",
>  "```mermaid",
>  mermaid.trim(),
>  "```",
>  cross.length ? "**Cross-domain edges touching this domain:**" : "",
>  cross.length ? cross.map((c) => `- ${c}`).join("\n") : "",
>  ""
>  );
>  }
>  return sections.filter(Boolean).join("\n");
> }
> 
> function crossDomainEdges(domain: string, members: string[], edges: { from: string; to: string }[]) {
>  const set = new Set(members);
>  const out: string[] = [];
>  for (const e of edges) {
>  const inFrom = set.has(e.from);
>  const inTo = set.has(e.to);
>  if (inFrom && !inTo) out.push(`${e.from} → ${e.to}`);
>  if (!inFrom && inTo) out.push(`${e.from} → ${e.to}`);
>  }
>  // de-dup
>  return Array.from(new Set(out)).sort();
> }
> 
> /* ---------- misc ---------- */
> 
> function relativeToPkgReadmeLink(fromFolder: string, toFolder: string) {
>  return `../${toFolder}/README.md`.replace(/\\/g, "/");
> }
> 
> function hash(s: string) {
>  let h = 0;
>  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
>  return h;
> }
> ```
> 
> ---
> 
> ### Update the script entry
> 
> In `packages/symdocs/package.json`:
> 
> ```json
> {
>  "scripts": {
>  "symdocs:04-graph": "tsx src/04-graph.ts --root packages --out docs/packages --include-imports true --respect-manifest true --render-domain-graphs true --domain-depth 1 --rdeps-table true --max-rdeps-list 12"
>  }
> }
> ```
> 
> ---
> 
> ### What you get
> 
> - **Global page (`docs/packages/README.md`)**
>  - Full **workspace Mermaid graph** (manifest edges solid, import-only edges dotted).
>  - **Package index** with quick counts.
>  - **Reverse dependency table** (sorted by most depended-upon).
>  - **Domain graphs**:
>  - One graph per domain: first subfolder under `packages/` (e.g., `apps`, `libs`, `tools`), plus `_root` for direct `packages/*`.
>  - Each domain graph shows only intra-domain edges; a list of **cross-domain edges** appears beneath.
> 
> - **Per-package pages** unchanged except for a displayed **Domain** line.
> 
> ---
> 
> ### Tweaks
> 
> - Change domain grouping depth: `--domain-depth 2` groups by e.g. `apps/web` vs `apps/native`.
> - Turn off domain graphs: `--render-domain-graphs false`.
> - Turn off reverse dep table: `--rdeps-table false`.
> - Show all dependents per row: `--max-rdeps-list 0`.
> 
> If you want subgraphs *inside* the global graph (Mermaid `subgraph` blocks) rather than separate domain sections, I can switch to that style too.
<!-- UID: ef25d83a-a176-4f6a-9a63-bffc0c9c02ab -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:20 PM
> I want a package that scans the packages for similar functions and generates task files in docs/agile/tasks to consolidate them
<!-- UID: 08bf854a-d5f1-462c-a09f-3ed7c14cc463 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:20 PM
> Awesome—here’s a focused package that scans `packages/*` for **similar functions** and generates **consolidation tasks** in `docs/agile/tasks/`. It’s split into small CLIs:
> 
> 1) scan all functions 
> 2) embed them (Ollama) 
> 3) cluster similar functions 
> 4) ask Ollama for a consolidation plan per cluster 
> 5) write task markdown files (idempotent)
> 
> Everything is local (no SaaS). Ready to drop in.
> 
> ---
> 
> ## File tree
> 
> ```
> packages/simtasks/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-scan.ts
>  02-embed.ts
>  03-cluster.ts
>  04-plan.ts
>  05-write.ts
> ```
> 
> ---
> 
> ## packages/simtasks/package.json
> 
> ```json
> {
>  "name": "@promethean/simtasks",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "simtasks-scan": "dist/01-scan.js",
>  "simtasks-embed": "dist/02-embed.js",
>  "simtasks-cluster": "dist/03-cluster.js",
>  "simtasks-plan": "dist/04-plan.js",
>  "simtasks-write": "dist/05-write.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "sim:01-scan": "tsx src/01-scan.ts --root packages --tsconfig tsconfig.json",
>  "sim:02-embed": "tsx src/02-embed.ts --embed-model nomic-embed-text:latest",
>  "sim:03-cluster": "tsx src/03-cluster.ts --sim-threshold 0.84 --k 10 --min-size 2",
>  "sim:04-plan": "tsx src/04-plan.ts --model qwen3:4b",
>  "sim:05-write": "tsx src/05-write.ts --out docs/agile/tasks",
>  "sim:all": "pnpm sim:01-scan && pnpm sim:02-embed && pnpm sim:03-cluster && pnpm sim:04-plan && pnpm sim:05-write"
>  },
>  "dependencies": {
>  "gray-matter": "^4.0.3",
>  "typescript": "^5.5.4",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2"
>  }
> }
> ```
> 
> ---
> 
> ## packages/simtasks/tsconfig.json
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "strict": true,
>  "skipLibCheck": true,
>  "outDir": "dist",
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ---
> 
> ## src/types.ts
> 
> ```ts
> export type FnKind = "function" | "arrow" | "method";
> 
> export type FunctionInfo = {
>  id: string; // stable hash
>  pkgName: string; // from package.json name
>  pkgFolder: string; // packages/<folder>
>  fileAbs: string;
>  fileRel: string; // repo-relative path
>  moduleRel: string; // path inside package folder
>  name: string; // function/variable/method name
>  kind: FnKind;
>  className?: string; // for methods
>  exported: boolean;
>  signature?: string;
>  jsdoc?: string;
>  startLine: number;
>  endLine: number;
>  snippet: string; // full declaration text
> };
> 
> export type ScanResult = { functions: FunctionInfo[] };
> 
> export type EmbeddingMap = Record<string, number[]>; // id -> vector
> 
> export type Cluster = {
>  id: string; // cluster-<n>
>  memberIds: string[]; // FunctionInfo.id[]
>  maxSim: number; // best pairwise similarity inside the cluster
>  avgSim: number; // mean top-k similarity
> };
> 
> export type Plan = {
>  clusterId: string;
>  title: string; // task title
>  summary: string; // 1-2 lines
>  canonicalPath: string; // e.g. packages/libs/core/src/strings/format.ts
>  canonicalName: string; // suggested function name
>  proposedSignature?: string;
>  risks?: string[];
>  steps?: string[];
>  acceptance?: string[];
> };
> ```
> 
> ---
> 
> ## src/utils.ts
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import * as crypto from "crypto";
> import * as ts from "typescript";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(defaults: Record<string, string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i = 0; i < a.length; i++) {
>  const k = a[i];
>  if (!k.startsWith("--")) continue;
>  const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
>  out[k] = v;
>  }
>  return out;
> }
> 
> export async function listFilesRec(root: string, exts: Set<string>) {
>  const out: string[] = [];
>  async function walk(d: string) {
>  const ents = await fs.readdir(d, { withFileTypes: true });
>  for (const e of ents) {
>  const p = path.join(d, e.name);
>  if (e.isDirectory()) {
>  if (["node_modules", "dist", "build", "coverage", ".turbo", ".next"].includes(e.name)) continue;
>  await walk(p);
>  } else if (exts.has(path.extname(p).toLowerCase())) out.push(p);
>  }
>  }
>  await walk(root);
>  return out;
> }
> 
> export function sha1(s: string) {
>  return crypto.createHash("sha1").update(s).digest("hex");
> }
> 
> export function relFromRepo(abs: string) {
>  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
> }
> 
> export function makeProgram(rootFiles: string[], tsconfigPath?: string) {
>  let options: ts.CompilerOptions = {
>  target: ts.ScriptTarget.ES2022,
>  module: ts.ModuleKind.ESNext,
>  strict: true
>  };
>  if (tsconfigPath) {
>  const cfg = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
>  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, path.dirname(tsconfigPath));
>  options = { ...parsed.options, ...options };
>  }
>  return ts.createProgram(rootFiles, options);
> }
> 
> export function posToLine(sf: ts.SourceFile, pos: number) {
>  return sf.getLineAndCharacterOfPosition(pos).line + 1;
> }
> 
> export function getJsDocText(node: ts.Node): string | undefined {
>  const jsdocs = ts.getJSDocCommentsAndTags(node);
>  if (!jsdocs?.length) return undefined;
>  const texts: string[] = [];
>  for (const d of jsdocs) {
>  // @ts-ignore
>  const c = (d as any).comment;
>  if (typeof c === "string") texts.push(c);
>  }
>  return texts.join("\n\n").trim() || undefined;
> }
> 
> export function getNodeText(src: string, node: ts.Node): string {
>  return src.slice(node.getFullStart(), node.getEnd());
> }
> 
> export function cosine(a: number[], b: number[]) {
>  let dot = 0, na = 0, nb = 0;
>  const n = Math.min(a.length, b.length);
>  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
>  if (!na || !nb) return 0;
>  return dot / (Math.sqrt(na) * Math.sqrt(nb));
> }
> ```
> 
> ---
> 
> ## src/01-scan.ts
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import * as ts from "typescript";
> import { parseArgs, listFilesRec, makeProgram, posToLine, getJsDocText, getNodeText, relFromRepo, sha1 } from "./utils.js";
> import type { FunctionInfo, ScanResult, FnKind } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--ext": ".ts,.tsx,.js,.jsx",
>  "--tsconfig": "",
>  "--out": ".cache/simtasks/functions.json"
> });
> 
> const ROOT = path.resolve(args["--root"]);
> const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
> const OUT = path.resolve(args["--out"]);
> 
> async function main() {
>  const files = await listFilesRec(ROOT, EXTS);
>  const program = makeProgram(files, args["--tsconfig"] || undefined);
>  const checker = program.getTypeChecker();
> 
>  const functions: FunctionInfo[] = [];
> 
>  for (const sf of program.getSourceFiles()) {
>  const fileAbs = path.resolve(sf.fileName);
>  if (!fileAbs.startsWith(ROOT)) continue;
>  const src = sf.getFullText();
>  const fileRel = relFromRepo(fileAbs);
> 
>  const bits = fileRel.split("/");
>  if (bits[0] !== "packages" || bits.length < 2) continue;
>  const pkgFolder = bits[1];
>  const pkgRoot = path.join(process.cwd(), "packages", pkgFolder);
>  const pkgJson = JSON.parse(await fs.readFile(path.join(pkgRoot, "package.json"), "utf-8"));
>  const pkgName = pkgJson.name as string;
>  const moduleRel = bits.slice(2).join("/");
> 
>  const visit = (node: ts.Node) => {
>  // Named function declarations
>  if (ts.isFunctionDeclaration(node) && node.name) {
>  push("function", node.name.text, node, hasExport(node), signatureFromDecl(node));
>  }
> 
>  // Variable => function/arrow
>  if (ts.isVariableStatement(node)) {
>  const exported = hasExport(node);
>  for (const decl of node.declarationList.declarations) {
>  const name = decl.name.getText();
>  const init = (decl as any).initializer as ts.Node | undefined;
>  if (!init) continue;
>  if (ts.isFunctionExpression(init)) {
>  push("function", name, decl, exported, signatureFromFuncExpr(init));
>  } else if (ts.isArrowFunction(init)) {
>  push("arrow", name, decl, exported, signatureFromArrow(init));
>  }
>  }
>  }
> 
>  // Class methods
>  if (ts.isClassDeclaration(node) && node.name) {
>  const className = node.name.text;
>  for (const m of node.members) {
>  if (ts.isMethodDeclaration(m) && m.name && ts.isIdentifier(m.name)) {
>  const exported = hasExport(node); // class export implies method export context
>  push("method", m.name.text, m, exported, signatureFromMethod(m), className);
>  }
>  }
>  }
> 
>  ts.forEachChild(node, visit);
>  };
> 
>  const push = (kind: FnKind, name: string, node: ts.Node, exported: boolean, signature?: string, className?: string) => {
>  const startLine = posToLine(sf, node.getStart());
>  const endLine = posToLine(sf, node.getEnd());
>  const jsdoc = getJsDocText(node);
>  const snippet = getNodeText(src, node);
>  const id = sha1([pkgName, moduleRel, kind, className ?? "", name, signature ?? "", startLine, endLine].join("|"));
>  functions.push({
>  id, pkgName, pkgFolder, fileAbs, fileRel, moduleRel, name, kind, className,
>  exported, signature, jsdoc, startLine, endLine, snippet
>  });
>  };
> 
>  const signatureFromDecl = (d: ts.FunctionDeclaration) => {
>  const sig = checker.getSignatureFromDeclaration(d);
>  return sig ? checker.signatureToString(sig) : undefined;
>  };
>  const signatureFromFuncExpr = (d: ts.FunctionExpression) => {
>  const sig = checker.getSignatureFromDeclaration(d);
>  return sig ? checker.signatureToString(sig) : undefined;
>  };
>  const signatureFromArrow = (d: ts.ArrowFunction) => {
>  const sig = checker.getSignatureFromDeclaration(d as any);
>  return sig ? checker.signatureToString(sig) : undefined;
>  };
>  const signatureFromMethod = (d: ts.MethodDeclaration) => {
>  const sig = checker.getSignatureFromDeclaration(d);
>  return sig ? checker.signatureToString(sig) : undefined;
>  };
> 
>  const hasExport = (node: ts.Node) => {
>  const m = ts.getCombinedModifierFlags(node as any);
>  return (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0;
>  };
> 
>  visit(sf);
>  }
> 
>  await fs.mkdir(path.dirname(OUT), { recursive: true });
>  const payload: ScanResult = { functions };
>  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf-8");
>  console.log(`simtasks: scanned ${functions.length} functions -> ${path.relative(process.cwd(), OUT)}`);
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## src/02-embed.ts
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, OLLAMA_URL } from "./utils.js";
> import type { ScanResult, EmbeddingMap } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/simtasks/functions.json",
>  "--out": ".cache/simtasks/embeddings.json",
>  "--embed-model": "nomic-embed-text:latest",
>  "--include-jsdoc": "true",
>  "--include-snippet": "true"
> });
> 
> async function ollamaEmbed(model: string, text: string): Promise<number[]> {
>  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt: text })
>  });
>  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
>  const data = await res.json();
>  return data.embedding as number[];
> }
> 
> async function main() {
>  const IN = path.resolve(args["--in"]);
>  const OUT = path.resolve(args["--out"]);
>  const model = args["--embed-model"];
>  const withDoc = args["--include-jsdoc"] === "true";
>  const withSnippet = args["--include-snippet"] === "true";
> 
>  const { functions }: ScanResult = JSON.parse(await fs.readFile(IN, "utf-8"));
>  const embeds: EmbeddingMap = {};
> 
>  for (const f of functions) {
>  if (embeds[f.id]) continue;
>  const text = [
>  `NAME: ${f.className ? f.className + "." : ""}${f.name}`,
>  `KIND: ${f.kind} EXPORTED: ${f.exported}`,
>  f.signature ? `SIGNATURE: ${f.signature}` : "",
>  `PACKAGE: ${f.pkgName} FILE: ${f.fileRel}:${f.startLine}-${f.endLine}`,
>  withDoc && f.jsdoc ? `JSDOC:\n${f.jsdoc}` : "",
>  withSnippet ? `CODE:\n${f.snippet}` : ""
>  ].filter(Boolean).join("\n");
>  embeds[f.id] = await ollamaEmbed(model, text);
>  }
> 
>  await fs.mkdir(path.dirname(OUT), { recursive: true });
>  await fs.writeFile(OUT, JSON.stringify(embeds), "utf-8");
>  console.log(`simtasks: embedded ${Object.keys(embeds).length} functions -> ${path.relative(process.cwd(), OUT)}`);
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## src/03-cluster.ts
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, cosine } from "./utils.js";
> import type { ScanResult, EmbeddingMap, Cluster } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/simtasks/functions.json",
>  "--embeds": ".cache/simtasks/embeddings.json",
>  "--out": ".cache/simtasks/clusters.json",
>  "--sim-threshold": "0.84",
>  "--k": "10",
>  "--min-size": "2"
> });
> 
> function unionFindClusters(ids: string[], edges: Array<[string,string]>) {
>  const parent = new Map<string,string>(ids.map(i => [i,i]));
>  const find = (x:string):string => parent.get(x)===x ? x : parent.set(x, find(parent.get(x)!)).get(x)!;
>  const unite = (a:string,b:string) => { a=find(a); b=find(b); if(a!==b) parent.set(a,b); };
>  edges.forEach(([a,b])=>unite(a,b));
>  const groups = new Map<string,string[]>();
>  ids.forEach(i => { const r=find(i); (groups.get(r) ?? groups.set(r,[]).get(r)!).push(i); });
>  return Array.from(groups.values());
> }
> 
> async function main() {
>  const SCAN = path.resolve(args["--scan"]);
>  const EMB = path.resolve(args["--embeds"]);
>  const OUT = path.resolve(args["--out"]);
>  const TH = Number(args["--sim-threshold"]);
>  const K = Number(args["--k"]);
>  const MIN = Number(args["--min-size"]);
> 
>  const { functions } = JSON.parse(await fs.readFile(SCAN, "utf-8")) as ScanResult;
>  const embeds: EmbeddingMap = JSON.parse(await fs.readFile(EMB, "utf-8"));
> 
>  const ids = functions.map(f => f.id);
>  const byId = new Map(functions.map(f => [f.id, f]));
>  const edges: Array<[string,string]> = [];
>  const clusterStats: Record<string, number[]> = {}; // for avg/max later
> 
>  for (const a of functions) {
>  const av = embeds[a.id];
>  const scores = functions
>  .filter(b => b.id !== a.id)
>  .map(b => ({ id: b.id, s: cosine(av, embeds[b.id]) }))
>  .sort((x,y)=>y.s-x.s)
>  .slice(0, K);
>  for (const {id, s} of scores) {
>  if (s >= TH) edges.push([a.id, id]);
>  }
>  }
> 
>  const groups = unionFindClusters(ids, edges).filter(g => g.length >= MIN);
>  const clusters: Cluster[] = groups.map((members, i) => {
>  // compute stats
>  let maxSim = 0, sum = 0, cnt = 0;
>  for (let x=0;x<members.length;x++) {
>  for (let y=x+1;y<members.length;y++) {
>  const s = cosine(embeds[members[x]], embeds[members[y]]);
>  if (s > maxSim) maxSim = s;
>  sum += s; cnt++;
>  }
>  }
>  const avg = cnt ? sum / cnt : 0;
>  return { id: `cluster-${i+1}`, memberIds: members, maxSim: round2(maxSim), avgSim: round2(avg) };
>  });
> 
>  await fs.mkdir(path.dirname(OUT), { recursive: true });
>  await fs.writeFile(OUT, JSON.stringify(clusters, null, 2), "utf-8");
>  console.log(`simtasks: ${clusters.length} clusters -> ${path.relative(process.cwd(), OUT)}`);
> }
> 
> function round2(n: number) { return Math.round(n*100)/100; }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## src/04-plan.ts
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { z } from "zod";
> import { parseArgs, OLLAMA_URL } from "./utils.js";
> import type { ScanResult, Cluster, Plan } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/simtasks/functions.json",
>  "--clusters": ".cache/simtasks/clusters.json",
>  "--out": ".cache/simtasks/plans.json",
>  "--model": "qwen3:4b",
>  "--base-dir": "packages",
>  "--force": "false"
> });
> 
> const PlanSchema = z.object({
>  title: z.string().min(1),
>  summary: z.string().min(1),
>  canonicalPath: z.string().min(1),
>  canonicalName: z.string().min(1),
>  proposedSignature: z.string().optional(),
>  risks: z.array(z.string()).optional(),
>  steps: z.array(z.string()).optional(),
>  acceptance: z.array(z.string()).optional()
> });
> 
> async function ollamaJSON(model: string, prompt: string) {
>  const res = await fetch(`${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/generate`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama generate ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  const cleaned = raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim();
>  return JSON.parse(cleaned);
> }
> 
> async function main() {
>  const SCAN = path.resolve(args["--scan"]);
>  const CLS = path.resolve(args["--clusters"]);
>  const OUT = path.resolve(args["--out"]);
>  const model = args["--model"];
>  const baseDir = args["--base-dir"];
>  const force = args["--force"] === "true";
> 
>  const { functions }: ScanResult = JSON.parse(await fs.readFile(SCAN, "utf-8"));
>  const clusters: Cluster[] = JSON.parse(await fs.readFile(CLS, "utf-8"));
> 
>  const byId = new Map(functions.map(f => [f.id, f]));
>  const existing = await readJSON(OUT) as Record<string, Plan> | undefined || {};
>  const plans: Record<string, Plan> = { ...existing };
> 
>  for (const c of clusters) {
>  if (!force && plans[c.id]) continue;
> 
>  const members = c.memberIds.map(id => byId.get(id)!);
>  const bullets = members.map((m, i) => [
>  `### ITEM ${i+1}`,
>  `NAME: ${m.className ? m.className + "." : ""}${m.name}`,
>  `PACKAGE: ${m.pkgName}`,
>  `FILE: ${m.fileRel}:${m.startLine}-${m.endLine}`,
>  m.signature ? `SIGNATURE: ${m.signature}` : "",
>  m.jsdoc ? `JSDOC:\n${m.jsdoc}` : "",
>  `SNIPPET:\n${m.snippet.slice(0, 3000)}`
>  ].filter(Boolean).join("\n")).join("\n\n");
> 
>  const sys = [
>  "You are designing a consolidation refactor task for duplicate/similar functions.",
>  "Return ONLY JSON with keys: title, summary, canonicalPath, canonicalName, proposedSignature?, risks?, steps?, acceptance?",
>  `canonicalPath MUST be a POSIX path under '${baseDir}' and end with a reasonable filename (e.g., packages/libs/core/src/strings/format.ts).`,
>  "Make steps actionable and incremental. Keep risks short. Acceptance criteria 3-7 bullets."
>  ].join("\n");
> 
>  const prompt = `SYSTEM:\n${sys}\n\nUSER:\nCLUSTER ${c.id} (maxSim=${c.maxSim}, avgSim=${c.avgSim})\n\n${bullets}`;
> 
>  let obj: any;
>  try { obj = await ollamaJSON(model, prompt); } catch (e) {
>  obj = {
>  title: `Consolidate similar functions (${c.id})`,
>  summary: "Create a canonical implementation and replace callers.",
>  canonicalPath: `${baseDir}/core/src/utility/${c.id}.ts`,
>  canonicalName: "canonicalFunction",
>  risks: ["behavior drift", "hidden callsites"],
>  steps: ["create canonical file", "write tests", "migrate usages", "remove duplicates"],
>  acceptance: ["all tests pass", "no duplicate definitions", "callers use canonical api"]
>  };
>  }
> 
>  const parsed = PlanSchema.safeParse(obj);
>  const plan = parsed.success ? (obj as Plan) : {
>  title: `Consolidate ${c.id}`,
>  summary: "Consolidate similar functions into a single canonical implementation.",
>  canonicalPath: `${baseDir}/core/src/${c.id}.ts`,
>  canonicalName: "canonicalFunction"
>  };
> 
>  plans[c.id] = { clusterId: c.id, ...plan };
>  }
> 
>  await fs.mkdir(path.dirname(OUT), { recursive: true });
>  await fs.writeFile(OUT, JSON.stringify(plans, null, 2), "utf-8");
>  console.log(`simtasks: planned ${Object.keys(plans).length} clusters -> ${path.relative(process.cwd(), OUT)}`);
> }
> 
> async function readJSON(p: string): Promise<any | undefined> {
>  try { return JSON.parse(await fs.readFile(p, "utf-8")); } catch { return undefined; }
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## src/05-write.ts
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import * as yaml from "yaml";
> import { parseArgs } from "./utils.js";
> import type { ScanResult, Cluster, Plan, FunctionInfo } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/simtasks/functions.json",
>  "--clusters": ".cache/simtasks/clusters.json",
>  "--plans": ".cache/simtasks/plans.json",
>  "--out": "docs/agile/tasks",
>  "--priority": "P2",
>  "--status": "todo",
>  "--label": "duplication,refactor,consolidation"
> });
> 
> const START = "<!-- SIMTASKS:BEGIN -->";
> const END = "<!-- SIMTASKS:END -->";
> 
> function stripGenerated(text: string) {
>  const si = text.indexOf(START), ei = text.indexOf(END);
>  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
>  return text.trimEnd();
> }
> 
> function slug(s: string) {
>  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g,"");
> }
> 
> function mermaidForCluster(plan: Plan, members: FunctionInfo[]) {
>  // package-level view: members' packages -> canonical target
>  const pkgs = Array.from(new Set(members.map(m => m.pkgName))).sort();
>  const nodes = [`C["${escapeMd(plan.canonicalPath)}"]`].concat(pkgs.map((p,i) => `P${i+1}["${escapeMd(p)}"]`));
>  const edges = pkgs.map((_,i) => `P${i+1} --> C`);
>  return [
>  "```mermaid",
>  "graph LR",
>  ` ${nodes.join("\n ")}`,
>  ` ${edges.join("\n ")}`,
>  "```"
>  ].join("\n");
> }
> function escapeMd(s: string) { return s.replace(/"/g, '\\"'); }
> 
> async function main() {
>  const SCAN = path.resolve(args["--scan"]);
>  const CLS = path.resolve(args["--clusters"]);
>  const PLANS= path.resolve(args["--plans"]);
>  const OUT = path.resolve(args["--out"]);
>  const priority = args["--priority"];
>  const status = args["--status"];
>  const labels = args["--label"].split(",").map(s => s.trim()).filter(Boolean);
> 
>  const { functions }: ScanResult = JSON.parse(await fs.readFile(SCAN, "utf-8"));
>  const clusters: Cluster[] = JSON.parse(await fs.readFile(CLS, "utf-8"));
>  const plans: Record<string, Plan> = JSON.parse(await fs.readFile(PLANS, "utf-8"));
> 
>  const byId = new Map(functions.map(f => [f.id, f]));
>  await fs.mkdir(OUT, { recursive: true });
> 
>  const indexLines: string[] = ["# Consolidation Tasks", ""];
>  for (const c of clusters) {
>  const plan = plans[c.id];
>  const members = c.memberIds.map(id => byId.get(id)!).sort((a,b) => a.pkgName.localeCompare(b.pkgName));
> 
>  const title = plan?.title ?? `Consolidate ${c.id}`;
>  const fname = `${slug(title)}.md`;
>  const outPath = path.join(OUT, fname);
> 
>  const fm = {
>  uuid: cryptoRandomUUID(),
>  title,
>  cluster_id: c.id,
>  cluster_size: members.length,
>  similarity: { max: c.maxSim, avg: c.avgSim },
>  priority,
>  status,
>  labels,
>  created_at: new Date().toISOString()
>  };
> 
>  const tableLines = [
>  "| Package | File | Name | Kind | Exported | Signature |",
>  "|---|---|---|---|:---:|---|",
>  ...members.map(m => `| ${m.pkgName} | \`${m.fileRel}:${m.startLine}-${m.endLine}\` | \`${m.className ? m.className + "." : ""}${m.name}\` | ${m.kind} | ${m.exported ? "✓" : "—"} | ${m.signature ? `\`${m.signature}\`` : "_"} |`)
>  ];
> 
>  const checklist = (plan?.acceptance ?? []).map(x => `- [ ] ${x}`).join("\n") || "- [ ] Canonical file created\n- [ ] Tests added\n- [ ] All callsites migrated\n- [ ] Duplicates removed";
> 
>  const mermaid = plan ? mermaidForCluster(plan, members) : "";
> 
>  const body = [
>  START,
>  `# ${title}`,
>  "",
>  plan?.summary ?? "_No summary provided._",
>  "",
>  "## Proposed canonicalization",
>  "",
>  plan?.canonicalPath ? `**Target file:** \`${plan.canonicalPath}\`` : "",
>  plan?.canonicalName ? `**Function name:** \`${plan.canonicalName}\`` : "",
>  plan?.proposedSignature ? `\n**Proposed signature:** \`${plan.proposedSignature}\`\n` : "",
>  "",
>  mermaid,
>  "",
>  "## Affected functions",
>  "",
>  ...tableLines,
>  "",
>  plan?.steps?.length ? "## Migration steps\n\n" + plan.steps.map((s) => `1. ${s}`).join("\n") : "",
>  plan?.risks?.length ? "\n## Risks\n\n" + plan.risks.map((r) => `- ${r}`).join("\n") : "",
>  "## Acceptance criteria",
>  "",
>  checklist,
>  "",
>  "## Notes",
>  "",
>  "_Add any investigation notes or decisions here._",
>  END,
>  ""
>  ].filter(Boolean).join("\n");
> 
>  // Preserve anything above markers on re-run
>  const existing = await readMaybe(outPath);
>  const gm = existing ? matter(existing) : { content: "", data: {} };
>  const preserved = stripGenerated(gm.content);
>  const final = matter.stringify((preserved ? preserved + "\n\n" : "") + body, { ...gm.data, ...fm }, { language: "yaml" });
> 
>  await fs.writeFile(outPath, final, "utf-8");
> 
>  indexLines.push(`- [${title}](${path.basename(outPath)}) — size ${members.length}, avg sim ${c.avgSim}`);
>  }
> 
>  // index
>  await fs.writeFile(path.join(OUT, "README.md"), indexLines.join("\n") + "\n", "utf-8");
>  console.log(`simtasks: wrote tasks -> ${path.relative(process.cwd(), OUT)}`);
> }
> 
> function cryptoRandomUUID() {
>  // Node 18+
>  // @ts-ignore
>  return globalThis.crypto?.randomUUID?.() ?? require("crypto").randomUUID();
> }
> 
> async function readMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## How to run
> 
> ```bash
> # from repo root
> pnpm -w add -D tsx typescript
> pnpm -w i
> 
> # run end-to-end
> pnpm --filter @promethean/simtasks sim:all
> 
> # …or step by step
> pnpm --filter @promethean/simtasks sim:01-scan --root packages --tsconfig ./tsconfig.json
> pnpm --filter @promethean/simtasks sim:02-embed --embed-model nomic-embed-text:latest
> pnpm --filter @promethean/simtasks sim:03-cluster --sim-threshold 0.86 --k 12 --min-size 2
> pnpm --filter @promethean/simtasks sim:04-plan --model qwen3:4b --base-dir packages
> pnpm --filter @promethean/simtasks sim:05-write --out docs/agile/tasks
> ```
> 
> ---
> 
> ## Notes & knobs
> 
> - **Thresholds**: tune `--sim-threshold` and `--k` to tighten/loosen clusters. 
> - **Scope**: includes function decls, functions assigned to vars, and class methods. If you want **object literal methods** and **exported const foo = () =>** only, I can add filters. 
> - **Idempotent tasks**: we only replace between `<!-- SIMTASKS:BEGIN/END -->`; anything above is yours. 
> - **Mermaid** in each task shows packages → canonical target file. 
> - **Frontmatter** carries a UUID, status, priority, labels—so your Obsidian/kanban flow stays happy. 
> - **Caches**: lives under `.cache/simtasks/` so subsequent runs are fast (only regenerate if you change code or plan with `--force`).
> 
> If you want the tasks to also create **code mods** or **codemod TODOs** lists (per package) as subtasks, I can extend `05-write.ts` to emit one subtask file per package referencing the parent task.
<!-- UID: ab2d381e-f735-4741-9b0f-ef68a18e2ede -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:38 PM
> I'm tryin to think of what else we could do... this way of writing cli tasks is very good... everything is just a pipeline, everything is idempotent, so I can describe updates as new steps in the pipeline instead of updating them if it's a complicated change...
<!-- UID: 68248572-59b6-4dc7-a35a-007602b46a25 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:38 PM
> love that. treat repos like dataflows and CLIs like transforms. here are high-leverage pipelines we can bolt on next (all idempotent, marker-safe, cached under `.cache/<pkg>`):
> 
> ## menu of new pipelines
> 
> 1) **apidiff** — detect API drift & breaking changes 
>  - scan exported symbols → compare across git refs (e.g., `main` vs `HEAD`) → classify breaks → write `docs/packages/<pkg>/api-diff.md` + tasks. 
>  - outputs: semver bump suggestion per package, “fix or docs?” tasks.
> 
> 2) **semver-guard** — compute required semver and open a task/PR stub 
>  - inputs: apidiff results, changelog fragments → decide `major|minor|patch` → write `docs/agile/tasks/semver-<pkg>.md`.
> 
> 3) **typegraph** — TS type dependency graph 
>  - crawl types/interfaces → emit Mermaid graphs per module + cross-package type edges → `docs/packages/<pkg>/types.md`.
> 
> 4) **cookbook** — auto example miner 
>  - harvest examples from tests/docs/snippets → normalize & run small runners → write `docs/cookbook/<topic>.md` with verified outputs.
> 
> 5) **test-gap** — semantic test coverage 
>  - map functions ↔ tests (by name, imports, embeddings) → flag high-risk/low-coverage → create tasks per cluster.
> 
> 6) **codemods** — transform kits for consolidation 
>  - from `simtasks` clusters → synthesize jscodeshift/ts-morph codemods → write under `codemods/<cluster>/` with dry-run report + task.
> 
> 7) **i18npack** — string extraction & dedupe 
>  - extract literals → cluster near-dupes → propose keys → write `i18n/<locale>.json` and tasks to wire calls.
> 
> 8) **licscan** — license & header compliance 
>  - detect license of each dependency (from lockfile) + check file headers → write `docs/compliance/license-report.md` + fixup tasks.
> 
> 9) **perf-bench** — microbench common idioms 
>  - auto-gen small benchmarks for hot functions → record runs → write `docs/bench/<pkg>.md` with tables & trend deltas.
> 
> 10) **glossary** — repo knowledge graph 
>  - extract terms from docs/code → link occurrences → `docs/glossary/*.md` and back- in footers.
> 
> 11) **adr-bot** — decision trail 
>  - generate ADR stubs from merged tasks/PRs → place in `docs/adr/NNN-*.md`, cross- to affected packages.
> 
> 12) **riskmap** — dependency risk heatmap 
>  - combine in-graph centrality + age of last change + test-gap → write `docs/ops/riskmap.md` and “stabilize X” tasks.
> 
> ---
> 
> ## orchestration sketch
> 
> ```mermaid
> flowchart LR
>  A[scan symbols/types] --> B[embed/compare]
>  B --> C[cluster/score]
>  C --> D[plans (Ollama)]
>  D --> E[docs pages]
>  D --> F[tasks]
>  B --> G[graphs (api/type/pkg)]
>  G --> E
> ```
> 
> ---
> 
> ## consistent shape (each package)
> 
> - **01-scan** → JSON facts 
> - **02-embed** (optional) 
> - **03-analyze** (diff/cluster/score) 
> - **04-plan** (LLM JSON, zod-validated, cached) 
> - **05-write** (docs + tasks, marker-bounded) 
> - all steps support `--dry-run`, read config from `*.config.json`, and keep outputs deterministic.
> 
> ---
> 
> ## quick starters to build next
> 
> - **apidiff** (fast win): reuse `@promethean/symdocs` scan output; add `03-diff.ts` (compare against saved baseline in `.cache/apidiff/<pkg>.json`) and `05-write.ts` for a per-package report + semver recommendation.
> - **codemods** (pairs nicely with `simtasks`): add `simtasks:06-codemods` to synthesize ts-morph transforms from a plan and emit runnable codemods with a dry-run CLI.
> 
> pick 2 and I’ll spin the files. if you want, we can also add a tiny **runner** (`pipelines.json` → runs steps with change detection) so new steps slot in without touching existing scripts.
<!-- UID: a8c3119b-9542-48e5-9196-ffba0ccae067 -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:40 PM
> I like codemods
<!-- UID: 6b38e7e9-0912-45fe-bf70-a572ba862762 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:40 PM
> oh yes — let’s bolt on a **codemods pipeline** that turns your `simtasks` plans into real AST transforms, dry-runs them, and (when you’re ready) applies them. Everything’s idempotent + cached.
> 
> I’ll give you a new workspace package:
> 
> ```
> packages/codemods/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-spec.ts # read @promethean/simtasks caches → codemod specs
>  02-generate.ts # synthesize ts-morph transforms per cluster
>  03-run.ts # run transforms (dry-run|apply), produce reports
> ```
> 
> ---
> 
> ### packages/codemods/package.json
> 
> ```json
> {
>  "name": "@promethean/codemods",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "codemods-spec": "dist/01-spec.js",
>  "codemods-generate": "dist/02-generate.js",
>  "codemods-run": "dist/03-run.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "mods:01-spec": "tsx src/01-spec.ts --scan .cache/simtasks/functions.json --clusters .cache/simtasks/clusters.json --plans .cache/simtasks/plans.json",
>  "mods:02-generate": "tsx src/02-generate.ts",
>  "mods:03-dry-run": "tsx src/03-run.ts --mode dry --root packages --report docs/agile/tasks/codemods",
>  "mods:03-apply": "tsx src/03-run.ts --mode apply --root packages --report docs/agile/tasks/codemods",
>  "mods:all": "pnpm mods:01-spec && pnpm mods:02-generate && pnpm mods:03-dry-run"
>  },
>  "dependencies": {
>  "diff": "^5.2.0",
>  "globby": "^14.0.2",
>  "ts-morph": "^22.0.0",
>  "typescript": "^5.5.4",
>  "yaml": "^2.5.0"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2"
>  }
> }
> ```
> 
> ### packages/codemods/tsconfig.json
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "strict": true,
>  "skipLibCheck": true,
>  "outDir": "dist",
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ---
> 
> ### src/types.ts
> 
> ```ts
> export type FnId = string; // from @promethean/simtasks FunctionInfo.id
> 
> export type ModSpec = {
>  clusterId: string;
>  title: string;
>  summary?: string;
>  canonical: {
>  path: string; // repo-relative, e.g. packages/libs/core/src/strings/format.ts
>  name: string; // function name to import/call
>  importName?: string; // optional alias at callsite (defaults to name)
>  };
>  // Functions considered duplicates to be migrated to canonical:
>  duplicates: Array<{
>  id: FnId;
>  package: string; // npm name
>  file: string; // repo-rel
>  name: string; // function/var/method name
>  kind: "function" | "arrow" | "method";
>  className?: string; // when kind === "method"
>  exported: boolean;
>  }>;
>  // Optional hints for argument mapping / renames (best-effort)
>  argHints?: Array<{ fromName: string; toName: string }>;
> };
> 
> export type ModSpecFile = {
>  specs: ModSpec[];
> };
> ```
> 
> ---
> 
> ### src/utils.ts
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { Project, SourceFile, SyntaxKind } from "ts-morph";
> import globby from "globby";
> 
> export async function readJSON<T>(p: string, fallback: T): Promise<T> {
>  try { return JSON.parse(await fs.readFile(p, "utf-8")) as T; }
>  catch { return fallback; }
> }
> export async function writeJSON(p: string, data: any) {
>  await fs.mkdir(path.dirname(p), { recursive: true });
>  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
> }
> 
> export async function listCodeFiles(root: string) {
>  const patterns = [
>  `${root.replace(/\\/g,"/")}/**/*.{ts,tsx,js,jsx}`,
>  `!**/node_modules/**`,
>  `!**/dist/**`,
>  `!**/build/**`,
>  `!**/.next/**`,
>  `!**/.turbo/**`,
>  `!**/coverage/**`
>  ];
>  return globby(patterns);
> }
> 
> export function relFromRepo(abs: string) {
>  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
> }
> 
> export function importPathRelative(fromFileAbs: string, canonicalFileAbs: string) {
>  let rel = path.relative(path.dirname(fromFileAbs), canonicalFileAbs).replace(/\\/g, "/");
>  if (!rel.startsWith(".")) rel = "./" + rel;
>  return rel.replace(/\.(tsx?|jsx?)$/i, "");
> }
> 
> export function ensureImport(source: SourceFile, spec: { name: string; from: string; alias?: string }) {
>  // find existing import
>  const existing = source.getImportDeclarations().find(d => d.getModuleSpecifierValue() === spec.from);
>  if (existing) {
>  const already = existing.getNamedImports().find(n => n.getName() === spec.name);
>  if (!already) existing.addNamedImport(spec.alias ? { name: spec.name, alias: spec.alias } : { name: spec.name });
>  return;
>  }
>  source.addImportDeclaration({
>  moduleSpecifier: spec.from,
>  namedImports: [spec.alias ? { name: spec.name, alias: spec.alias } : { name: spec.name }]
>  });
> }
> 
> export function removeImportIfUnused(source: SourceFile, name: string) {
>  const decs = source.getImportDeclarations();
>  for (const d of decs) {
>  const ni = d.getNamedImports();
>  const match = ni.find(n => n.getName() === name || n.getAliasNode()?.getText() === name);
>  if (match) {
>  // remove and if no named left, remove import decl
>  match.remove();
>  if (d.getNamedImports().length === 0 && !d.getDefaultImport() && !d.getNamespaceImport()) d.remove();
>  return;
>  }
>  }
> }
> 
> export function replaceIdentifier(source: SourceFile, from: string, to: string) {
>  const ids = source.getDescendantsOfKind(SyntaxKind.Identifier).filter(i => i.getText() === from);
>  for (const id of ids) {
>  // skip if it's a declaration of the same name
>  const parent = id.getParent();
>  if (parent && (parent.getKindName().endsWith("Declaration") || parent.getKind() === SyntaxKind.BindingElement)) {
>  // leave declarations to separate removal step
>  continue;
>  }
>  id.replaceWithText(to);
>  }
> }
> ```
> 
> ---
> 
> ### src/01-spec.ts
> Builds codemod specs from your `simtasks` caches.
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { readJSON, writeJSON } from "./utils.js";
> import type { ModSpecFile, ModSpec } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/simtasks/functions.json",
>  "--clusters": ".cache/simtasks/clusters.json",
>  "--plans": ".cache/simtasks/plans.json",
>  "--out": ".cache/codemods/specs.json"
> });
> 
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){
>  const k=a[i];
>  if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
>  out[k]=v;
>  }
>  return out;
> }
> 
> type Fn = {
>  id: string; pkgName: string; fileRel: string; name: string; kind: "function"|"arrow"|"method";
>  className?: string; exported: boolean;
> };
> type Cluster = { id: string; memberIds: string[]; maxSim: number; avgSim: number; };
> type Plan = { clusterId: string; title: string; summary?: string; canonicalPath: string; canonicalName: string; proposedSignature?: string };
> 
> async function main() {
>  const scan = await readJSON<{functions: Fn[]}>(path.resolve(args["--scan"]), { functions: [] });
>  const clusters = await readJSON<Cluster[]>(path.resolve(args["--clusters"]), []);
>  const plans = await readJSON<Record<string,Plan>>(path.resolve(args["--plans"]), {});
> 
>  const byId = new Map(scan.functions.map(f => [f.id, f]));
>  const specs: ModSpec[] = [];
> 
>  for (const c of clusters) {
>  const plan = plans[c.id];
>  if (!plan) continue;
> 
>  const dups = c.memberIds.map(id => byId.get(id)!).filter(Boolean);
>  // Only handle free functions/arrow for v1; methods are left as TODOs in the report.
>  const dupUsable = dups.filter(d => d.kind !== "method");
>  if (dupUsable.length < 1) continue;
> 
>  const spec: ModSpec = {
>  clusterId: c.id,
>  title: plan.title,
>  summary: plan.summary,
>  canonical: { path: plan.canonicalPath, name: plan.canonicalName },
>  duplicates: dupUsable.map(d => ({
>  id: d.id, package: d.pkgName, file: d.fileRel, name: d.name, kind: d.kind, exported: d.exported
>  }))
>  };
>  specs.push(spec);
>  }
> 
>  const out: ModSpecFile = { specs };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`codemods:01-spec → ${specs.length} specs`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### src/02-generate.ts
> Emits a transform per spec (plain TS files you can review/commit).
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { readJSON } from "./utils.js";
> import type { ModSpecFile, ModSpec } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/codemods/specs.json",
>  "--outDir": "codemods" // relative to repo root
> });
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> 
> function transformTemplate(spec: ModSpec) {
>  // a small ts-morph transformer that:
>  // 1) replaces imports of duplicate names with canonical import
>  // 2) replaces identifier uses (simple rename)
>  // 3) removes duplicate function declarations, adding an import instead
>  return `/* AUTO-GENERATED: ${spec.clusterId} — ${spec.title}
>  * Canonical: ${spec.canonical.name} @ ${spec.canonical.path}
>  * Duplicates: ${spec.duplicates.map(d => d.name + " in " + d.file).join(", ")}
>  */
> import { Project, SyntaxKind } from "ts-morph";
> import * as path from "path";
> import { importPathRelative, ensureImport, removeImportIfUnused, replaceIdentifier, relFromRepo } from "../packages/codemods/dist/utils.js"; // runtime uses compiled utils
> 
> export async function runTransform(project: Project, fileAbs: string) {
>  const source = project.getSourceFile(fileAbs);
>  if (!source) return { changed: false, notes: [] as string[] };
> 
>  const notes: string[] = [];
>  let changed = false;
> 
>  const canonicalAbs = path.resolve(process.cwd(), "${spec.canonical.path}");
>  const canonicalName = "${spec.canonical.name}";
> 
>  // Map duplicate names we will rewrite → canonical alias to use in file
>  const dupNames = new Set(${JSON.stringify(spec.duplicates.map(d => d.name))});
> 
>  // 1) If file declares a duplicate function, remove and import canonical
>  for (const name of dupNames) {
>  const funcs = source.getFunctions().filter(f => f.getName() === name);
>  const vars = source.getVariableDeclarations().filter(v => v.getName() === name);
>  if (funcs.length || vars.length) {
>  // naive: remove declaration(s)
>  funcs.forEach(f => f.remove());
>  vars.forEach(v => { const p = v.getParent()?.getParent(); if (p) p.remove(); });
>  // add import for canonical
>  const from = importPathRelative(fileAbs, canonicalAbs);
>  ensureImport(source, { name: canonicalName, from });
>  // rename usages
>  replaceIdentifier(source, name, canonicalName);
>  changed = true;
>  notes.push(\`removed local duplicate '\${name}' and imported canonical '\${canonicalName}'\`);
>  }
>  }
> 
>  // 2) Rewrite imports that bring in duplicate names from other modules → canonical import
>  for (const imp of source.getImportDeclarations()) {
>  for (const ni of imp.getNamedImports()) {
>  const imported = ni.getName();
>  const alias = ni.getAliasNode()?.getText();
>  const local = alias || imported;
>  if (dupNames.has(local)) {
>  // drop this named import; add canonical import instead
>  const fromOld = imp.getModuleSpecifierValue();
>  ni.remove();
>  if (imp.getNamedImports().length === 0 && !imp.getDefaultImport() && !imp.getNamespaceImport()) imp.remove();
> 
>  const fromNew = importPathRelative(fileAbs, canonicalAbs);
>  ensureImport(source, { name: canonicalName, from: fromNew });
>  if (local !== canonicalName) {
>  // update references from previous local to canonical name
>  replaceIdentifier(source, local, canonicalName);
>  }
>  changed = true;
>  notes.push(\`repointed import \${local} (from '\${fromOld}') → \${canonicalName} (from '\${fromNew}')\`);
>  }
>  }
>  }
> 
>  // 3) Clean dead imports of duplicate names (if any missed)
>  for (const name of dupNames) removeImportIfUnused(source, name);
> 
>  if (changed) await source.save();
>  return { changed, notes };
> }
> `;
> }
> 
> async function main() {
>  const IN = path.resolve(args["--in"]);
>  const OUT_DIR = path.resolve(args["--outDir"]);
>  const data = await readJSON<ModSpecFile>(IN, { specs: [] });
> 
>  await fs.mkdir(OUT_DIR, { recursive: true });
>  for (const spec of data.specs) {
>  const dir = path.join(OUT_DIR, spec.clusterId);
>  await fs.mkdir(dir, { recursive: true });
>  const file = path.join(dir, "transform.ts");
>  await fs.writeFile(file, transformTemplate(spec), "utf-8");
> 
>  // add a tiny README
>  const md = [
>  `# ${spec.title}`,
>  "",
>  `- Canonical: \`${spec.canonical.name}\` @ \`${spec.canonical.path}\``,
>  `- Duplicates:`,
>  ...spec.duplicates.map(d => ` - \`${d.name}\` — \`${d.file}\``),
>  ""
>  ].join("\n");
>  await fs.writeFile(path.join(dir, "README.md"), md, "utf-8");
>  }
>  console.log(`codemods:02-generate → wrote ${data.specs.length} transforms in ${path.relative(process.cwd(), OUT_DIR)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### src/03-run.ts
> Runs all generated transforms across your codebase; outputs a report (and diffs for dry-run).
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { Project } from "ts-morph";
> import { diffLines } from "diff";
> import { listCodeFiles, relFromRepo } from "./utils.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--modsDir": "codemods",
>  "--mode": "dry", // dry | apply
>  "--report": "docs/agile/tasks/codemods"
> });
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> 
> async function loadTransforms(modsDir: string) {
>  const dirs = await fs.readdir(modsDir, { withFileTypes: true }).catch(()=>[]);
>  const loaders: Array<{ id: string; run: (p: Project, f: string) => Promise<{changed:boolean;notes:string[]}> }> = [];
>  for (const d of dirs) {
>  if (!d.isDirectory()) continue;
>  const id = d.name;
>  const entry = path.join(modsDir, id, "transform.ts");
>  const js = path.join(modsDir, id, "transform.js");
>  // Support ts (via tsx/register) or compiled js
>  let mod: any;
>  try { mod = await import(pathToFileURLIfNeeded(js)); }
>  catch { mod = await import(pathToFileURLIfNeeded(entry)); }
>  if (mod?.runTransform) loaders.push({ id, run: mod.runTransform });
>  }
>  return loaders;
> }
> function pathToFileURLIfNeeded(p: string) {
>  return path.isAbsolute(p) ? pathToFileURL(p).href : pathToFileURL(path.resolve(p)).href;
> }
> import { pathToFileURL } from "url";
> 
> async function main() {
>  const ROOT = path.resolve(args["--root"]);
>  const MODS = path.resolve(args["--modsDir"]);
>  const MODE = (args["--mode"] as "dry"|"apply");
>  const REPORT_ROOT = path.resolve(args["--report"]);
> 
>  const transforms = await loadTransforms(MODS);
>  if (!transforms.length) { console.log("No transforms found."); return; }
> 
>  await fs.mkdir(REPORT_ROOT, { recursive: true });
> 
>  // One ts-morph project for the workspace
>  const project = new Project({
>  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
>  skipAddingFilesFromTsConfig: true
>  });
>  const files = await listCodeFiles(ROOT);
>  files.forEach(f => project.addSourceFileAtPathIfExists(f));
> 
>  const summary: string[] = [];
>  for (const t of transforms) {
>  const reportLines: string[] = [`# Codemod ${t.id}`, "", `Mode: \`${MODE}\``, ""];
>  let changedCount = 0;
> 
>  for (const f of files) {
>  const sf = project.getSourceFile(f);
>  if (!sf) continue;
>  const before = sf.getFullText();
> 
>  const res = await t.run(project, path.resolve(f));
>  if (!res.changed) continue;
> 
>  changedCount++;
>  if (MODE === "dry") {
>  // we revert on dry; show diff
>  const after = sf.getFullText();
>  const diffs = diffLines(before, after);
>  const pretty = diffs.map(part => {
>  const prefix = part.added ? "+" : part.removed ? "-" : " ";
>  return part.value.split("\n").map(line => prefix + line).join("\n");
>  }).join("");
>  // revert
>  sf.replaceWithText(before);
> 
>  reportLines.push(`## ${relFromRepo(f)}`);
>  if (res.notes.length) {
>  reportLines.push("", "**Notes:**", ...res.notes.map(n => `- ${n}`), "");
>  }
>  reportLines.push("```diff", pretty.trimEnd(), "```", "");
>  }
>  }
> 
>  summary.push(`- ${t.id}: ${changedCount} file(s) ${MODE === "dry" ? "would change" : "changed"}`);
>  await fs.writeFile(path.join(REPORT_ROOT, `${t.id}.md`), reportLines.join("\n"), "utf-8");
>  }
> 
>  const index = [
>  "# Codemods report",
>  "",
>  `Mode: \`${MODE}\``,
>  "",
>  ...summary
>  ].join("\n");
>  await fs.writeFile(path.join(REPORT_ROOT, `README.md`), index + "\n", "utf-8");
> 
>  if (MODE === "apply") {
>  await project.save();
>  }
>  console.log(`codemods:${MODE} — see ${path.relative(process.cwd(), REPORT_ROOT)}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## How it flows with your existing `simtasks`
> 
> 1) Run `simtasks` to get clusters + plans:
>  ```
>  pnpm --filter @promethean/simtasks sim:all
>  ```
> 2) Build codemod **specs** from those plans:
>  ```
>  pnpm --filter @promethean/codemods mods:01-spec
>  ```
> 3) **Generate** ts-morph transforms into `/codemods/<cluster>/transform.ts`:
>  ```
>  pnpm --filter @promethean/codemods mods:02-generate
>  ```
> 4) **Dry-run** across the workspace, with rich diff reports:
>  ```
>  pnpm --filter @promethean/codemods mods:03-dry-run --root packages --report docs/agile/tasks/codemods
>  ```
> 5) Happy with it? **Apply**:
>  ```
>  pnpm --filter @promethean/codemods mods:03-apply --root packages
>  ```
> 
> ---
> 
> ## Guardrails & scope (v1)
> 
> - Focuses on **free functions/arrow functions**. Class methods are logged for manual follow-up (we can add a method codemod later).
> - Does:
>  - replace **imports** of duplicates → **canonical** import
>  - rename identifier references to the **canonical** function
>  - remove local duplicate declarations and insert canonical import
> - Keeps everything idempotent; multiple runs won’t duplicate imports.
> - Produces a Markdown **report per codemod** (with `diff` blocks) so you can review in Obsidian before applying.
> 
> ---
> 
> ## Pipeline sketch
> 
> ```mermaid
> flowchart LR
>  A[symtasks functions.json] --> B[clusters.json]
>  B --> C[plans.json]
>  C --> D[01-spec → specs.json]
>  D --> E[02-generate → codemods/<cluster>/transform.ts]
>  E --> F[03-run dry → docs/agile/tasks/codemods/*.md]
>  F --> G[03-run apply → code changes]
> ```
> 
> If you want me to add **Arg mapping** (e.g., rename/reshuffle params using `argHints`) or **delete duplicate files** after all usages migrate, I can extend the generator in place.
<!-- UID: 00c66828-a565-430e-bd44-9c996e59bf60 -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:45 PM
> do it
<!-- UID: 4cb34731-a116-44bd-ad94-a325b35f773f -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:45 PM
> Boom—here’s the upgrade that adds:
> 
> - **Arg mapping + callsite reordering** (map duplicate params → canonical params by name)
> - **Safe duplicate-file cleanup** (opt-in; reports in dry-run, deletes on apply)
> 
> I’ve only touched the **codemods** package. You can drop these in place of the earlier files.
> 
> ---
> 
> # 1) Update `packages/codemods/src/types.ts`
> 
> ```ts
> export type FnId = string; // from @promethean/simtasks FunctionInfo.id
> 
> export type ModSpec = {
>  clusterId: string;
>  title: string;
>  summary?: string;
> 
>  canonical: {
>  path: string; // repo-relative, e.g. packages/libs/core/src/strings/format.ts
>  name: string; // canonical function name
>  params?: string[]; // canonical param names (if found on disk)
>  importName?: string; // optional alias at callsite
>  };
> 
>  // Functions considered duplicates to migrate to the canonical API:
>  duplicates: Array<{
>  id: FnId;
>  package: string; // npm name
>  file: string; // repo-rel
>  name: string; // declared/used name
>  kind: "function" | "arrow" | "method";
>  exported: boolean;
> 
>  params?: string[]; // duplicate's parameter names (if found)
>  paramMap?: number[]; // index map: canonical[i] -> duplicate[index] (or -1 if unknown)
>  }>;
> 
>  // Optional human hints (kept for future use)
>  argHints?: Array<{ fromName: string; toName: string }>;
> };
> 
> export type ModSpecFile = {
>  specs: ModSpec[];
> };
> ```
> 
> ---
> 
> # 2) Update `packages/codemods/src/01-spec.ts`
> Adds param extraction via ts-morph and builds `paramMap` per duplicate.
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { Project } from "ts-morph";
> import { readJSON, writeJSON } from "./utils.js";
> import type { ModSpecFile, ModSpec } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/simtasks/functions.json",
>  "--clusters": ".cache/simtasks/clusters.json",
>  "--plans": ".cache/simtasks/plans.json",
>  "--out": ".cache/codemods/specs.json",
>  "--tsconfig": "tsconfig.json"
> });
> 
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){
>  const k=a[i];
>  if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
>  out[k]=v;
>  }
>  return out;
> }
> 
> type Fn = {
>  id: string; pkgName: string; fileRel: string; name: string; kind: "function"|"arrow"|"method";
>  exported: boolean;
> };
> type Cluster = { id: string; memberIds: string[]; maxSim: number; avgSim: number; };
> type Plan = { clusterId: string; title: string; summary?: string; canonicalPath: string; canonicalName: string; proposedSignature?: string };
> 
> function normName(s: string) { return s.replace(/[_-]/g,"").toLowerCase(); }
> 
> function buildParamMap(canon: string[], dup: string[]): number[] {
>  if (!canon.length || !dup.length) return [];
>  const ix = new Map(dup.map((n, i) => [normName(n), i]));
>  return canon.map(cn => ix.has(normName(cn)) ? ix.get(normName(cn))! : -1);
> }
> 
> async function main() {
>  const scan = await readJSON<{functions: Fn[]}>(path.resolve(args["--scan"]), { functions: [] });
>  const clusters = await readJSON<Cluster[]>(path.resolve(args["--clusters"]), []);
>  const plans = await readJSON<Record<string,Plan>>(path.resolve(args["--plans"]), {});
> 
>  const project = new Project({
>  tsConfigFilePath: path.resolve(args["--tsconfig"]),
>  skipAddingFilesFromTsConfig: true
>  });
> 
>  const byId = new Map(scan.functions.map(f => [f.id, f]));
>  const specs: ModSpec[] = [];
> 
>  // Helper: get param names for a function name in a file
>  function getParamNames(fileAbs: string, funcName: string): string[] | undefined {
>  let sf = project.getSourceFile(fileAbs);
>  if (!sf) { try { sf = project.addSourceFileAtPath(fileAbs); } catch { return undefined; } }
>  // function declarations
>  const f = sf.getFunctions().find(fn => fn.getName() === funcName);
>  if (f) return f.getParameters().map(p => p.getName());
>  // const foo = (...) => {}
>  const vd = sf.getVariableDeclaration(funcName);
>  const init = vd?.getInitializer();
>  if (init && (init.asKindOrThrow.bind ? true : true)) {
>  // arrow or function expression
>  // @ts-ignore
>  if (init.getParameters) return init.getParameters().map((p:any)=>p.getName());
>  }
>  return undefined;
>  }
> 
>  for (const c of clusters) {
>  const plan = plans[c.id];
>  if (!plan) continue;
> 
>  const dupsAll = c.memberIds.map(id => byId.get(id)!).filter(Boolean);
>  const dups = dupsAll.filter(d => d.kind !== "method"); // v1: free functions / arrows
> 
>  const spec: ModSpec = {
>  clusterId: c.id,
>  title: plan.title,
>  summary: plan.summary,
>  canonical: { path: plan.canonicalPath, name: plan.canonicalName, params: undefined },
>  duplicates: dups.map(d => ({
>  id: d.id, package: d.pkgName, file: d.fileRel, name: d.name, kind: d.kind, exported: d.exported
>  }))
>  };
> 
>  // try to load canonical + duplicates to extract params
>  const canonAbs = path.resolve(plan.canonicalPath);
>  try {
>  const canonParams = getParamNames(canonAbs, plan.canonicalName);
>  if (canonParams?.length) spec.canonical.params = canonParams;
>  } catch { /* ignore */ }
> 
>  for (const dup of spec.duplicates) {
>  try {
>  const dupAbs = path.resolve(dup.file);
>  const dupParams = getParamNames(dupAbs, dup.name);
>  if (dupParams?.length) {
>  dup.params = dupParams;
>  if (spec.canonical.params?.length) dup.paramMap = buildParamMap(spec.canonical.params, dupParams);
>  }
>  } catch { /* ignore */ }
>  }
> 
>  specs.push(spec);
>  }
> 
>  await writeJSON(path.resolve(args["--out"]), { specs } satisfies ModSpecFile);
>  console.log(`codemods:01-spec → ${specs.length} specs with param maps where possible`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 3) Update `packages/codemods/src/02-generate.ts`
> Transforms now **reorder callsite args** using the saved `paramMap`. (Still removes local dup decls and fixes imports.)
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { readJSON } from "./utils.js";
> import type { ModSpecFile, ModSpec } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/codemods/specs.json",
>  "--outDir": "codemods" // relative to repo root
> });
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> 
> function transformTemplate(spec: ModSpec) {
>  return `/* AUTO-GENERATED: ${spec.clusterId} — ${spec.title}
>  * Canonical: ${spec.canonical.name} @ ${spec.canonical.path}
>  * Param order: ${spec.canonical.params?.join(", ") || "(unknown)"}
>  * Duplicates: ${spec.duplicates.map(d => d.name + " in " + d.file).join(", ")}
>  */
> import { Project, SyntaxKind, Node } from "ts-morph";
> import * as path from "path";
> import { importPathRelative, ensureImport, removeImportIfUnused, replaceIdentifier } from "../packages/codemods/dist/utils.js";
> 
> const CANONICAL_PATH = ${JSON.stringify(spec.canonical.path)};
> const CANONICAL_NAME = ${JSON.stringify(spec.canonical.name)};
> const CANONICAL_PARAMS = ${JSON.stringify(spec.canonical.params ?? [])};
> 
> const DUPLICATES = ${JSON.stringify(
>  spec.duplicates.map(d => ({
>  name: d.name,
>  file: d.file,
>  paramMap: d.paramMap ?? [],
>  }))
> )};
> 
> function reorderArgs(textArgs: string[], paramMap: number[], haveCanonParams: boolean): string[] {
>  if (!haveCanonParams || !paramMap.length) return textArgs;
>  const out: string[] = new Array(paramMap.length).fill("undefined");
>  for (let i=0;i<paramMap.length;i++) {
>  const fromIx = paramMap[i];
>  if (fromIx != null && fromIx >= 0 && fromIx < textArgs.length) out[i] = textArgs[fromIx];
>  }
>  // if canonical has more params than provided, trailing "undefined" stays (JS ok)
>  return out;
> }
> 
> export async function runTransform(project: Project, fileAbs: string) {
>  const source = project.getSourceFile(fileAbs);
>  if (!source) return { changed: false, notes: [] as string[] };
> 
>  const notes: string[] = [];
>  let changed = false;
> 
>  const canonicalAbs = path.resolve(process.cwd(), CANONICAL_PATH);
> 
>  // For quick lookup of dup paramMaps by name
>  const mapByName = new Map<string, number[]>();
>  for (const d of DUPLICATES) mapByName.set(d.name, d.paramMap ?? []);
> 
>  // 1) Remove local duplicate declarations → import canonical
>  for (const dup of DUPLICATES) {
>  const name = dup.name;
>  const funcs = source.getFunctions().filter(f => f.getName() === name);
>  const vars = source.getVariableDeclarations().filter(v => v.getName() === name);
>  if (funcs.length || vars.length) {
>  funcs.forEach(f => f.remove());
>  vars.forEach(v => { const st = v.getParent()?.getParent(); if (st) st.remove(); });
>  const from = importPathRelative(fileAbs, canonicalAbs);
>  ensureImport(source, { name: CANONICAL_NAME, from });
>  replaceIdentifier(source, name, CANONICAL_NAME);
>  changed = true;
>  notes.push(\`removed local duplicate '\${name}' and imported canonical '\${CANONICAL_NAME}'\`);
>  }
>  }
> 
>  // Helper: rewrite a specific call expression from duplicate -> canonical with arg reordering
>  function rewriteCall(call: import("ts-morph").CallExpression, dupName: string) {
>  const args = call.getArguments().map(a => a.getText());
>  const pm = mapByName.get(dupName) || [];
>  const newArgs = reorderArgs(args, pm, CANONICAL_PARAMS.length > 0);
>  call.getExpression().replaceWithText(CANONICAL_NAME);
>  call.setArguments(newArgs);
>  changed = true;
>  notes.push(\`callsite updated \${dupName}(...) → \${CANONICAL_NAME}(\${newArgs.join(", ")})\`);
>  }
> 
>  // 2) Calls to local duplicates (declared in this file)
>  for (const dup of DUPLICATES) {
>  const calls = source.getDescendantsOfKind(SyntaxKind.CallExpression)
>  .filter(c => c.getExpression().getKind() === SyntaxKind.Identifier && c.getExpression().getText() === dup.name);
>  if (calls.length) {
>  const from = importPathRelative(fileAbs, canonicalAbs);
>  ensureImport(source, { name: CANONICAL_NAME, from });
>  for (const call of calls) rewriteCall(call, dup.name);
>  }
>  }
> 
>  // 3) Imports that bring in duplicates from elsewhere → repoint import + rewrite calls
>  for (const imp of source.getImportDeclarations()) {
>  for (const ni of imp.getNamedImports()) {
>  const imported = ni.getName();
>  const alias = ni.getAliasNode()?.getText();
>  const local = alias || imported;
>  if (mapByName.has(local)) {
>  const fromOld = imp.getModuleSpecifierValue();
>  ni.remove();
>  if (imp.getNamedImports().length === 0 && !imp.getDefaultImport() && !imp.getNamespaceImport()) imp.remove();
> 
>  const fromNew = importPathRelative(fileAbs, canonicalAbs);
>  ensureImport(source, { name: CANONICAL_NAME, from: fromNew });
> 
>  // rewrite calls that use 'local(...)'
>  const calls = source.getDescendantsOfKind(SyntaxKind.CallExpression)
>  .filter(c => c.getExpression().getKind() === SyntaxKind.Identifier && c.getExpression().getText() === local);
>  for (const call of calls) rewriteCall(call, local);
> 
>  // finally rename any remaining identifiers (safe)
>  replaceIdentifier(source, local, CANONICAL_NAME);
> 
>  changed = true;
>  notes.push(\`repointed import \${local} (from '\${fromOld}') → \${CANONICAL_NAME} (from '\${fromNew}')\`);
>  }
>  }
>  }
> 
>  // 4) Clean dead imports named like duplicates
>  for (const dup of DUPLICATES) removeImportIfUnused(source, dup.name);
> 
>  if (changed) await source.save();
>  return { changed, notes };
> }
> `;
> }
> 
> async function main() {
>  const IN = path.resolve(args["--in"]);
>  const OUT_DIR = path.resolve(args["--outDir"]);
>  const data = await readJSON<ModSpecFile>(IN, { specs: [] });
> 
>  await fs.mkdir(OUT_DIR, { recursive: true });
>  for (const spec of data.specs) {
>  const dir = path.join(OUT_DIR, spec.clusterId);
>  await fs.mkdir(dir, { recursive: true });
>  await fs.writeFile(path.join(dir, "transform.ts"), transformTemplate(spec), "utf-8");
> 
>  const md = [
>  `# ${spec.title}`,
>  "",
>  `- Canonical: \`${spec.canonical.name}\` @ \`${spec.canonical.path}\``,
>  `- Canonical params: ${spec.canonical.params?.length ? "`" + spec.canonical.params.join(", ") + "`" : "_unknown_"}`,
>  `- Duplicates:`,
>  ...spec.duplicates.map(d => ` - \`${d.name}\` — \`${d.file}\`${d.params?.length ? " (params: `" + d.params.join(", ") + "`)" : ""}${d.paramMap?.length ? " (map " + d.paramMap.join(",") + ")" : ""}`),
>  ""
>  ].join("\n");
>  await fs.writeFile(path.join(dir, "README.md"), md, "utf-8");
>  }
>  console.log(`codemods:02-generate → wrote ${data.specs.length} transforms in ${path.relative(process.cwd(), OUT_DIR)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 4) Update `packages/codemods/src/03-run.ts`
> Adds `--specs` and `--delete-duplicates` with safe file deletion; reports “would delete” in dry-run.
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { Project, SyntaxKind } from "ts-morph";
> import { diffLines } from "diff";
> import { listCodeFiles, relFromRepo } from "./utils.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--modsDir": "codemods",
>  "--mode": "dry", // dry | apply
>  "--report": "docs/agile/tasks/codemods",
>  "--specs": ".cache/codemods/specs.json",
>  "--delete-duplicates": "true"
> });
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> 
> async function loadTransforms(modsDir: string) {
>  const dirs = await fs.readdir(modsDir, { withFileTypes: true }).catch(()=>[]);
>  const loaders: Array<{ id: string; run: (p: Project, f: string) => Promise<{changed:boolean;notes:string[]}> }> = [];
>  for (const d of dirs) {
>  if (!d.isDirectory()) continue;
>  const id = d.name;
>  const js = path.join(modsDir, id, "transform.js");
>  const ts = path.join(modsDir, id, "transform.ts");
>  let mod: any;
>  try { mod = await import(pathToFileURL(js)); }
>  catch { mod = await import(pathToFileURL(ts)); }
>  if (mod?.runTransform) loaders.push({ id, run: mod.runTransform });
>  }
>  return loaders;
> }
> import { pathToFileURL } from "url";
> 
> type SpecsFile = {
>  specs: Array<{
>  clusterId: string;
>  canonical: { path: string };
>  duplicates: Array<{ file: string }>;
>  }>;
> };
> 
> async function main() {
>  const ROOT = path.resolve(args["--root"]);
>  const MODS = path.resolve(args["--modsDir"]);
>  const MODE = (args["--mode"] as "dry"|"apply");
>  const REPORT_ROOT = path.resolve(args["--report"]);
>  const DELETE = args["--delete-duplicates"] === "true";
> 
>  const transforms = await loadTransforms(MODS);
>  if (!transforms.length) { console.log("No transforms found."); return; }
> 
>  await fs.mkdir(REPORT_ROOT, { recursive: true });
> 
>  const project = new Project({
>  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
>  skipAddingFilesFromTsConfig: true
>  });
>  const files = await listCodeFiles(ROOT);
>  files.forEach(f => project.addSourceFileAtPathIfExists(f));
> 
>  const summary: string[] = [];
>  const deletionsWanted = new Set<string>(); // abs paths
>  const deletionsDone: string[] = [];
> 
>  for (const t of transforms) {
>  const reportLines: string[] = [`# Codemod ${t.id}`, "", `Mode: \`${MODE}\``, ""];
>  let changedCount = 0;
> 
>  for (const f of files) {
>  const sf = project.getSourceFile(f);
>  if (!sf) continue;
>  const before = sf.getFullText();
> 
>  const res = await t.run(project, path.resolve(f));
>  if (!res.changed) continue;
> 
>  changedCount++;
>  const after = sf.getFullText();
> 
>  if (MODE === "dry") {
>  const diffs = diffLines(before, after);
>  const pretty = diffs.map(part => {
>  const prefix = part.added ? "+" : part.removed ? "-" : " ";
>  return part.value.split("\n").map(line => prefix + line).join("\n");
>  }).join("");
>  // revert in dry mode
>  sf.replaceWithText(before);
> 
>  reportLines.push(`## ${relFromRepo(f)}`);
>  if (res.notes.length) { reportLines.push("", "**Notes:**", ...res.notes.map(n => `- ${n}`), ""); }
>  reportLines.push("```diff", pretty.trimEnd(), "```", "");
>  }
>  }
> 
>  summary.push(`- ${t.id}: ${changedCount} file(s) ${MODE === "dry" ? "would change" : "changed"}`);
>  await fs.writeFile(path.join(REPORT_ROOT, `${t.id}.md`), reportLines.join("\n"), "utf-8");
>  }
> 
>  // Candidate deletions (files that now have no meaningful statements)
>  if (DELETE) {
>  const specs: SpecsFile = JSON.parse(await fs.readFile(path.resolve(args["--specs"]), "utf-8"));
>  for (const s of specs.specs) {
>  for (const dup of s.duplicates) {
>  const abs = path.resolve(dup.file);
>  const sf = project.getSourceFile(abs);
>  if (!sf) continue;
>  const keep = sf.getStatements().some(st => {
>  const k = st.getKind();
>  // keep if any real declaration/assignment/export remains
>  return ![
>  SyntaxKind.ImportDeclaration,
>  SyntaxKind.EmptyStatement
>  ].includes(k);
>  });
>  if (!keep) deletionsWanted.add(abs);
>  }
>  }
> 
>  if (MODE === "apply") {
>  // save changes first
>  await project.save();
>  for (const abs of deletionsWanted) {
>  try { await fs.rm(abs); deletionsDone.push(relFromRepo(abs)); }
>  catch { /* ignore */ }
>  }
>  }
>  }
> 
>  const index = [
>  "# Codemods report",
>  "",
>  `Mode: \`${MODE}\``,
>  "",
>  ...summary,
>  "",
>  DELETE ? "## Duplicate files " + (MODE === "dry" ? "that would be deleted" : "deleted") : "",
>  DELETE ? (deletionsDone.length
>  ? deletionsDone.map(p => `- ${p}`).join("\n")
>  : (Array.from(deletionsWanted).length ? Array.from(deletionsWanted).map(a => `- ${relFromRepo(a)}`).join("\n") : "_None_")) : ""
>  ].filter(Boolean).join("\n");
> 
>  await fs.writeFile(path.join(REPORT_ROOT, `README.md`), index + "\n", "utf-8");
> 
>  if (MODE === "apply") {
>  await project.save();
>  }
>  console.log(`codemods:${MODE} — see ${path.relative(process.cwd(), REPORT_ROOT)}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 5) Commands
> 
> ```bash
> # rebuild specs with param maps
> pnpm --filter @promethean/codemods mods:01-spec --tsconfig ./tsconfig.json
> 
> # regenerate transforms (now reorder args)
> pnpm --filter @promethean/codemods mods:02-generate
> 
> # dry-run with deletion preview
> pnpm --filter @promethean/codemods mods:03-dry-run --root packages --report docs/agile/tasks/codemods --specs .cache/codemods/specs.json --delete-duplicates true
> 
> # apply + actually delete empty duplicate files
> pnpm --filter @promethean/codemods mods:03-apply --root packages --report docs/agile/tasks/codemods --specs .cache/codemods/specs.json --delete-duplicates true
> ```
> 
> ---
> 
> ## Notes / guardrails
> 
> - **Arg mapping** is **name-based** (case/underscore-insensitive). If a canonical param isn’t found in a duplicate, we pass `undefined` for that slot (safe in JS/TS if optional). You’ll see exactly how calls are rewritten in the diff.
> - If the **canonical file** doesn’t exist yet, we still rewrite names/imports; arg reordering is skipped (no params known). Create the canonical first (from your `simtasks` plan) to enable reordering.
> - **Deletion** only triggers when a file ends up with **no meaningful statements** (imports/empty statements ignored). It’s opt-in and reports candidates in dry-run.
> 
> Want me to also generate a **reverse codemod** (automatic rollback) or a **test harness** that runs before/after snapshots on the changed files? I can add a `04-verify.ts` step that executes your unit tests and captures failure deltas per codemod.
<!-- UID: f3338e0c-1895-48e0-ab66-f936073b71ba -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:53 PM
> add a verify step
<!-- UID: c95b0073-b353-4c7d-a44f-2c3b50348935 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:53 PM
> heck yeah — here’s a clean **verify step** you can drop into `@promethean/codemods`. It:
> 
> - runs **tsc --noEmit**, an optional **build** cmd, and an optional **test** cmd
> - records timings, exit codes, and logs to `.cache/codemods/verify/<stage>.json`
> - writes **markdown reports** to `docs/agile/tasks/codemods/`
> - if both baseline and after exist, generates a **delta report** (`VERIFY.md`)
> - (optional) includes the changed files from the last codemod run
> 
> ---
> 
> ## 1) New file: `packages/codemods/src/04-verify.ts`
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { exec } from "child_process";
> 
> const args = parseArgs({
>  "--stage": "after", // "baseline" | "after" | any label you like
>  "--out": "docs/agile/tasks/codemods", // markdown reports
>  "--cache": ".cache/codemods/verify", // json snapshots
>  "--include-run-summary": ".cache/codemods/run-apply.json", // optional; produced by 03-run.ts (see patch below)
>  "--tsc": "npx tsc -p tsconfig.json --noEmit",
>  "--build": "", // e.g. "pnpm -w -r build"
>  "--test": "pnpm -w -r test", // tweak to your runner; empty string skips
>  "--timeout": "0" // ms; 0 = no timeout
> });
> 
> type StepResult = {
>  name: string;
>  cmd: string;
>  exitCode: number | null;
>  durationMs: number;
>  stdout: string;
>  stderr: string;
> };
> 
> type Snapshot = {
>  stage: string;
>  startedAt: string;
>  endedAt: string;
>  steps: StepResult[];
>  runSummary?: {
>  changedByCodemod?: Record<string, string[]>; // codemodId -> [files]
>  };
> };
> 
> function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){
>  const k=a[i];
>  if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
>  out[k]=v;
>  }
>  return out;
> }
> 
> async function runCmd(name: string, cmd: string, timeoutMs: number): Promise<StepResult> {
>  const started = Date.now();
>  const res: StepResult = { name, cmd, exitCode: null, durationMs: 0, stdout: "", stderr: "" };
>  if (!cmd.trim()) return { ...res, durationMs: 0, exitCode: 0 };
>  return new Promise((resolve) => {
>  const child = exec(cmd, { shell: true, maxBuffer: 1024 * 1024 * 64, timeout: timeoutMs && timeoutMs > 0 ? timeoutMs : undefined });
>  let st = "", se = "";
>  child.stdout?.on("data", (d) => st += String(d));
>  child.stderr?.on("data", (d) => se += String(d));
>  child.on("close", (code) => {
>  const ended = Date.now();
>  resolve({ name, cmd, exitCode: code, durationMs: ended - started, stdout: st, stderr: se });
>  });
>  child.on("error", (_e) => {
>  const ended = Date.now();
>  resolve({ name, cmd, exitCode: 127, durationMs: ended - started, stdout: st, stderr: se || "failed to spawn process" });
>  });
>  });
> }
> 
> function mdEscape(s: string) {
>  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
> }
> 
> async function readMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> async function main() {
>  const STAGE = args["--stage"];
>  const OUT_DIR = path.resolve(args["--out"]);
>  const CACHE_DIR = path.resolve(args["--cache"]);
>  const SUMMARY_PATH = path.resolve(args["--include-run-summary"]);
>  const TIMEOUT = Number(args["--timeout"]) || 0;
> 
>  await fs.mkdir(OUT_DIR, { recursive: true });
>  await fs.mkdir(CACHE_DIR, { recursive: true });
> 
>  // optional: bring in changed files from 03-run (json)
>  let runSummary: Snapshot["runSummary"] | undefined = undefined;
>  try {
>  const raw = await readMaybe(SUMMARY_PATH);
>  if (raw) runSummary = JSON.parse(raw);
>  } catch { /* ignore */ }
> 
>  const steps: StepResult[] = [];
>  const startedAt = new Date().toISOString();
> 
>  steps.push(await runCmd("tsc", args["--tsc"], TIMEOUT));
>  if (args["--build"].trim()) steps.push(await runCmd("build", args["--build"], TIMEOUT));
>  if (args["--test"].trim()) steps.push(await runCmd("test", args["--test"], TIMEOUT));
> 
>  const endedAt = new Date().toISOString();
>  const snap: Snapshot = { stage: STAGE, startedAt, endedAt, steps, runSummary };
> 
>  // write cache
>  const cacheFile = path.join(CACHE_DIR, `${STAGE}.json`);
>  await fs.writeFile(cacheFile, JSON.stringify(snap, null, 2), "utf-8");
> 
>  // write stage report
>  const report = renderStageMarkdown(snap);
>  await fs.writeFile(path.join(OUT_DIR, `verify-${STAGE}.md`), report, "utf-8");
> 
>  // if baseline exists and this is a comparison stage, emit VERIFY.md
>  const baselineFile = path.join(CACHE_DIR, `baseline.json`);
>  const baseRaw = await readMaybe(baselineFile);
>  if (baseRaw && STAGE !== "baseline") {
>  const base: Snapshot = JSON.parse(baseRaw);
>  const delta = renderDeltaMarkdown(base, snap);
>  await fs.writeFile(path.join(OUT_DIR, `VERIFY.md`), delta, "utf-8");
>  }
> 
>  // pretty console
>  const summaryLine = steps.map(s => `${s.name}:${s.exitCode===0 ? "OK" : "FAIL"}(${s.durationMs}ms)`).join(" ");
>  const failed = steps.filter(s => s.exitCode !== 0).map(s => s.name);
>  console.log(`verify[${STAGE}] — ${summaryLine} ${failed.length ? ` ❌ ${failed.join(",")}` : " ✅"}`);
> }
> 
> function renderStageMarkdown(s: Snapshot): string {
>  const lines: string[] = [
>  `# Verification — ${s.stage}`,
>  "",
>  `Started: ${s.startedAt}`,
>  `Ended: ${s.endedAt}`,
>  "",
>  "## Results",
>  "",
>  "| Step | Exit | Duration (ms) |",
>  "|---|:---:|---:|",
>  ...s.steps.map(st => `| ${st.name} | ${st.exitCode ?? "_"} | ${st.durationMs} |`),
>  "",
>  ];
> 
>  if (s.runSummary?.changedByCodemod) {
>  const all = s.runSummary.changedByCodemod;
>  lines.push("## Files changed by codemod run", "");
>  for (const [id, files] of Object.entries(all)) {
>  lines.push(`- **${id}** (${files.length})`, ...files.map(f => ` - \`${f}\``), "");
>  }
>  }
> 
>  for (const st of s.steps) {
>  lines.push(
>  `### ${st.name}`,
>  "",
>  `**Command:** \`${mdEscape(st.cmd)}\` `,
>  `**Exit:** ${st.exitCode} `,
>  `**Duration:** ${st.durationMs} ms`,
>  "",
>  "<details><summary>stdout</summary>",
>  "",
>  "```text",
>  st.stdout.trimEnd(),
>  "```",
>  "",
>  "</details>",
>  "",
>  "<details><summary>stderr</summary>",
>  "",
>  "```text",
>  st.stderr.trimEnd(),
>  "```",
>  "",
>  "</details>",
>  ""
>  );
>  }
>  return lines.join("\n");
> }
> 
> function renderDeltaMarkdown(base: Snapshot, cur: Snapshot): string {
>  const lines: string[] = [
>  "# Verification delta",
>  "",
>  `Baseline: **${base.stage}** (${base.startedAt})`,
>  `Current: **${cur.stage}** (${cur.startedAt})`,
>  "",
>  "## Step status comparison",
>  "",
>  "| Step | Baseline | Current |",
>  "|---|:---:|:---:|",
>  ...mergeByName(base.steps, cur.steps).map(([b, c]) =>
>  `| ${b?.name ?? c?.name ?? "?"} | ${fmtExit(b?.exitCode)} | ${fmtExit(c?.exitCode)} |`
>  ),
>  "",
>  "## Duration change (ms)",
>  "",
>  "| Step | Baseline | Current | Δ |",
>  "|---|---:|---:|---:|",
>  ...mergeByName(base.steps, cur.steps).map(([b, c]) => {
>  const bd = b?.durationMs ?? 0, cd = c?.durationMs ?? 0;
>  const d = cd - bd;
>  return `| ${b?.name ?? c?.name ?? "?"} | ${bd} | ${cd} | ${d} |`;
>  }),
>  ""
>  ];
> 
>  return lines.join("\n");
> }
> 
> function mergeByName(a: StepResult[], b: StepResult[]) {
>  const names = new Set<string>([...a.map(s => s.name), ...b.map(s => s.name)]);
>  const out: Array<[StepResult | undefined, StepResult | undefined]> = [];
>  for (const n of Array.from(names)) {
>  out.push([a.find(s => s.name === n), b.find(s => s.name === n)]);
>  }
>  return out;
> }
> function fmtExit(x?: number | null) { return x === 0 ? "OK" : (x == null ? "_" : `FAIL(${x})`); }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 2) (Tiny) patch to `packages/codemods/src/03-run.ts` 
> Add a JSON summary so the verify step can show which files were touched.
> 
> **Add near the top (imports):**
> ```ts
> // after other imports
> import { promises as fsPromises } from "fs";
> ```
> 
> **Add these accumulators near other variables in `main()`:**
> ```ts
> const runSummary: Record<string, string[]> = {}; // codemodId -> changed files (repo-rel)
> ```
> 
> **Inside the loop over transforms (just after you detect a file changed), collect files:**
> ```ts
> if (res.changed) {
>  const rel = relFromRepo(f);
>  (runSummary[t.id] ||= []).push(rel);
> }
> ```
> 
> **After finishing the for-loop over transforms (before writing README.md), write the summary cache:**
> ```ts
> const runSummaryPath = path.resolve(".cache/codemods", `run-${MODE}.json`);
> await fsPromises.mkdir(path.dirname(runSummaryPath), { recursive: true });
> await fsPromises.writeFile(runSummaryPath, JSON.stringify({ changedByCodemod: runSummary }, null, 2), "utf-8");
> ```
> 
> That’s it — `04-verify.ts` will read `.cache/codemods/run-apply.json` by default (you can point it to `run-dry.json` if verifying a dry-run build).
> 
> ---
> 
> ## 3) Wire it up in `packages/codemods/package.json`
> 
> ```json
> {
>  "scripts": {
>  "mods:04-verify:baseline": "tsx src/04-verify.ts --stage baseline --test \"pnpm -w -r test\"",
>  "mods:04-verify:after": "tsx src/04-verify.ts --stage after --test \"pnpm -w -r test\"",
>  "mods:verify": "pnpm mods:04-verify:after"
>  }
> }
> ```
> 
> > Tweak `--build` if you have a build step (e.g., `"pnpm -w -r build"`), or set it blank to skip.
> 
> ---
> 
> ## 4) Suggested flow
> 
> ```bash
> # 0) (optional) capture baseline
> pnpm --filter @promethean/codemods mods:04-verify:baseline
> 
> # 1) dry-run codemods; inspect
> pnpm --filter @promethean/codemods mods:03-dry-run --report docs/agile/tasks/codemods
> 
> # 2) apply codemods; JSON summary is written to .cache/codemods/run-apply.json
> pnpm --filter @promethean/codemods mods:03-apply --report docs/agile/tasks/codemods
> 
> # 3) verify after
> pnpm --filter @promethean/codemods mods:04-verify:after
> ```
> 
> You’ll get:
> 
> - `docs/agile/tasks/codemods/verify-baseline.md`
> - `docs/agile/tasks/codemods/verify-after.md`
> - `docs/agile/tasks/codemods/VERIFY.md` (delta summary)
> - `.cache/codemods/verify/baseline.json` & `after.json`
> - `.cache/codemods/run-apply.json` listing files touched by each codemod
> 
> ---
> 
> ## Notes / knobs
> 
> - Pass a different **test** command (e.g., vitest/jest) via `--test`. Empty string disables tests.
> - Increase buffer for huge logs by tweaking `maxBuffer` in `exec` (currently 64 MB).
> - Timeouts: use `--timeout 600000` for 10 minutes, etc.
> - You can verify **dry-run builds** by pointing `--include-run-summary` at `.cache/codemods/run-dry.json`.
> 
> If you want the verify step to also **fail fast** (exit non-zero if any step fails) or to parse **JUnit** XML for flake-tracking, I can extend it with a `--junit-glob` and a small XML reader next.
<!-- UID: b67505a7-b40d-4e35-98b2-d06a61719470 -->

---




>[!nexus_user] **User** - 08/31/2025 at 4:58 PM
> lets set up a runner
<!-- UID: ecfbd61e-a47d-4613-b9ce-03232a19e6b4 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 4:58 PM
> yes—let’s add a tiny, durable **pipeline runner** so every CLI you’ve got becomes a target in a DAG with change-detection, caching, and watch mode.
> 
> Below is a complete drop-in package **@promethean/piper** plus a starter `pipelines.yaml` that wires your existing `symdocs`, `simtasks`, and `codemods` flows.
> 
> ---
> 
> ## packages/piper/
> 
> ```
> packages/piper/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  hash.ts
>  fsutils.ts
>  runner.ts
>  index.ts
> ```
> 
> ### package.json
> 
> ```json
> {
>  "name": "@promethean/piper",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": { "piper": "dist/index.js" },
>  "scripts": {
>  "build": "tsc -p tsconfig.json"
>  },
>  "dependencies": {
>  "chokidar": "^3.6.0",
>  "globby": "^14.0.2",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ### tsconfig.json
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "outDir": "dist",
>  "strict": true,
>  "skipLibCheck": true,
>  "esModuleInterop": true,
>  "resolveJsonModule": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ---
> 
> ### src/types.ts
> 
> ```ts
> import { z } from "zod";
> 
> export const StepSchema = z.object({
>  id: z.string().min(1),
>  name: z.string().optional(),
>  deps: z.array(z.string()).default([]),
>  cwd: z.string().default("."),
>  env: z.record(z.string()).default({}),
>  inputs: z.array(z.string()).default([]),
>  outputs: z.array(z.string()).default([]),
>  cache: z.enum(["content", "mtime", "none"]).default("content"),
>  shell: z.string().optional(), // run a shell command
>  node: z.string().optional(), // run `node <file>` (cwd)
>  ts: z.object({ // import and run a TS/JS function
>  module: z.string(),
>  export: z.string().default("default"),
>  args: z.any().optional()
>  }).optional(),
>  args: z.array(z.string()).optional(),
>  timeoutMs: z.number().optional()
> }).refine(s => !!(s.shell || s.node || s.ts), { message: "step must define shell|node|ts" });
> 
> export const PipelineSchema = z.object({
>  name: z.string().min(1),
>  steps: z.array(StepSchema)
> });
> 
> export const FileSchema = z.object({
>  pipelines: z.array(PipelineSchema)
> });
> 
> export type PiperStep = z.infer<typeof StepSchema>;
> export type PiperPipeline = z.infer<typeof PipelineSchema>;
> export type PiperFile = z.infer<typeof FileSchema>;
> 
> export type RunOptions = {
>  since?: string; // git ref for change detection
>  force?: boolean; // ignore cache and run
>  dryRun?: boolean; // plan only
>  watch?: boolean; // watch inputs and re-run
>  concurrency?: number; // parallelism for independent steps
>  contentHash?: boolean; // prefer content hashing even if cache=mtime
>  reportDir?: string; // write markdown reports
> };
> 
> export type StepResult = {
>  id: string;
>  skipped: boolean;
>  reason?: string;
>  startedAt?: string;
>  endedAt?: string;
>  exitCode?: number | null;
>  durationMs?: number;
>  stdout?: string;
>  stderr?: string;
>  fingerprint?: string;
> };
> ```
> 
> ---
> 
> ### src/hash.ts
> 
> ```ts
> import { promises as fs } from "fs";
> import * as crypto from "crypto";
> import * as path from "path";
> import globby from "globby";
> 
> export function sha1(s: string) {
>  return crypto.createHash("sha1").update(s).digest("hex");
> }
> 
> export async function fingerprintFromGlobs(
>  globs: string[],
>  cwd: string,
>  mode: "content" | "mtime" = "content"
> ): Promise<string> {
>  const files = await globby(globs, { cwd, absolute: true, dot: true, followSymbolicLinks: false });
>  files.sort();
>  const h = crypto.createHash("sha1");
>  for (const f of files) {
>  try {
>  const st = await fs.stat(f);
>  h.update(Buffer.from(f));
>  if (mode === "content") {
>  if (st.size === 0) { h.update("0"); continue; }
>  const buf = await fs.readFile(f);
>  h.update(buf);
>  } else {
>  h.update(`${st.mtimeMs}|${st.size}`);
>  }
>  } catch { /* ignore missing */ }
>  }
>  return h.digest("hex");
> }
> 
> /** include step configuration & env in the fingerprint */
> export async function stepFingerprint(
>  step: any,
>  cwd: string,
>  preferContent: boolean
> ) {
>  const mode = step.cache === "content" || preferContent ? "content" : (step.cache ?? "content");
>  const inputsHash = await fingerprintFromGlobs(step.inputs ?? [], cwd, mode);
>  const configHash = sha1(JSON.stringify({
>  id: step.id,
>  name: step.name,
>  deps: step.deps,
>  cmd: step.shell ?? step.node ?? step.ts,
>  args: step.args ?? step.ts?.args,
>  env: step.env
>  }));
>  return sha1(inputsHash + "|" + configHash);
> }
> ```
> 
> ---
> 
> ### src/fsutils.ts
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import globby from "globby";
> import { spawn } from "child_process";
> import { PiperStep } from "./types.js";
> 
> export async function ensureDir(p: string) {
>  await fs.mkdir(p, { recursive: true });
> }
> 
> export async function readTextMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> export async function writeText(p: string, s: string) {
>  await ensureDir(path.dirname(p));
>  await fs.writeFile(p, s, "utf-8");
> }
> 
> export async function listOutputsExist(outputs: string[], cwd: string) {
>  for (const pat of outputs) {
>  const files = await globby(pat, { cwd, absolute: true, dot: true });
>  if (files.length === 0) return false;
>  }
>  return true;
> }
> 
> export function runShell(cmd: string, cwd: string, env: Record<string,string>, timeoutMs?: number) {
>  return runSpawn(cmd, { cwd, env, shell: true, timeoutMs });
> }
> 
> export function runNode(file: string, args: string[] | undefined, cwd: string, env: Record<string,string>, timeoutMs?: number) {
>  const cmd = process.execPath;
>  const finalArgs = [file, ...(args ?? [])];
>  return runSpawn(cmd, { cwd, env, args: finalArgs, timeoutMs });
> }
> 
> export async function runTSModule(step: PiperStep, cwd: string, env: Record<string,string>, timeoutMs?: number) {
>  const modPath = path.isAbsolute(step.ts!.module) ? step.ts!.module : path.resolve(cwd, step.ts!.module);
>  const code = `
>  import mod from ${JSON.stringify(modPath)};
>  const fn = (mod && mod.${step.ts!.export}) || (mod && mod.default) || mod;
>  const res = await fn(${JSON.stringify(step.ts!.args ?? {})});
>  if (typeof res === 'string') process.stdout.write(res);
>  `;
>  // Lazy-run via node -e with ESM loader
>  const cmd = process.execPath;
>  const args = ["-e", code];
>  return runSpawn(cmd, { cwd, env, args, timeoutMs });
> }
> 
> function runSpawn(cmd: string, opts: { cwd: string; env: Record<string,string>; shell?: boolean; args?: string[]; timeoutMs?: number }) {
>  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
>  const child = opts.shell
>  ? spawn(cmd, { cwd: opts.cwd, env: { ...process.env, ...opts.env }, shell: true, stdio: ["ignore", "pipe", "pipe"] })
>  : spawn(cmd, opts.args ?? [], { cwd: opts.cwd, env: { ...process.env, ...opts.env }, stdio: ["ignore", "pipe", "pipe"] });
> 
>  let out = "", err = "";
>  const killTimer = opts.timeoutMs && opts.timeoutMs > 0
>  ? setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, opts.timeoutMs)
>  : undefined;
> 
>  child.stdout.on("data", (d) => out += String(d));
>  child.stderr.on("data", (d) => err += String(d));
>  child.on("close", (code) => {
>  if (killTimer) clearTimeout(killTimer as any);
>  resolve({ code, stdout: out, stderr: err });
>  });
>  child.on("error", () => resolve({ code: 127, stdout: out, stderr: err || "failed to spawn" }));
>  });
> }
> ```
> 
> ---
> 
> ### src/runner.ts
> 
> ```ts
> import * as path from "path";
> import { promises as fs } from "fs";
> import chokidar from "chokidar";
> import YAML from "yaml";
> import { FileSchema, PiperFile, PiperPipeline, PiperStep, RunOptions, StepResult } from "./types.js";
> import { ensureDir, listOutputsExist, readTextMaybe, runNode, runShell, runTSModule, writeText } from "./fsutils.js";
> import { sha1, stepFingerprint } from "./hash.js";
> 
> type State = {
>  steps: Record<string, { fingerprint: string; endedAt: string; exitCode: number | null }>;
> };
> const STATE_DIR = ".cache/piper";
> const STATE_FILE = (pipeline: string) => path.join(STATE_DIR, `${slug(pipeline)}.state.json`);
> 
> function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
> 
> function topoSort(steps: PiperStep[]): PiperStep[] {
>  const byId = new Map(steps.map(s => [s.id, s]));
>  const visited = new Set<string>(), order: PiperStep[] = [];
>  function visit(id: string, stack: string[]) {
>  if (visited.has(id)) return;
>  const s = byId.get(id); if (!s) throw new Error(`unknown step ${id}`);
>  stack.push(id);
>  for (const d of s.deps) {
>  if (stack.includes(d)) throw new Error(`cycle: ${stack.join(" -> ")} -> ${d}`);
>  visit(d, stack.slice());
>  }
>  visited.add(id); order.push(s);
>  }
>  for (const s of steps) visit(s.id, []);
>  return order;
> }
> 
> async function readConfig(p: string): Promise<PiperFile> {
>  const raw = await fs.readFile(p, "utf-8");
>  const obj = p.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
>  const parsed = FileSchema.safeParse(obj);
>  if (!parsed.success) throw new Error("pipelines config invalid: " + parsed.error.message);
>  return parsed.data;
> }
> 
> function semaphore(n: number) {
>  let cur = 0;
>  const q: Array<() => void> = [];
>  const take = () => new Promise<void>(res => { if (cur < n) { cur++; res(); } else q.push(res); });
>  const release = () => { cur--; const fn = q.shift(); if (fn) fn(); };
>  return { take, release };
> }
> 
> async function loadState(pipeline: string): Promise<State> {
>  try { return JSON.parse(await readTextMaybe(STATE_FILE(pipeline)) || "{}"); }
>  catch { return { steps: {} }; }
> }
> 
> async function saveState(pipeline: string, state: State) {
>  await ensureDir(STATE_DIR);
>  await writeText(STATE_FILE(pipeline), JSON.stringify(state, null, 2));
> }
> 
> function shouldSkip(
>  step: PiperStep,
>  state: State,
>  fp: string,
>  haveOutputs: boolean,
>  force: boolean | undefined
> ) {
>  if (force) return { skip: false, reason: "" };
>  const prev = state.steps[step.id];
>  if (prev && prev.fingerprint === fp && haveOutputs) {
>  return { skip: true, reason: "cache clean (fingerprint & outputs unchanged)" };
>  }
>  return { skip: false, reason: "" };
> }
> 
> export async function runPipeline(
>  configPath: string,
>  pipelineName: string,
>  opts: RunOptions
> ) {
>  const cfg = await readConfig(configPath);
>  const pipeline = cfg.pipelines.find(p => p.name === pipelineName);
>  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
>  const steps = topoSort(pipeline.steps);
>  const state = await loadState(pipeline.name);
>  const sem = semaphore(Math.max(1, opts.concurrency ?? 2));
> 
>  const results: StepResult[] = [];
>  const runMap = new Map<string, Promise<void>>();
> 
>  const runStep = async (s: PiperStep) => {
>  // ensure deps completed
>  for (const d of s.deps) await runMap.get(d);
> 
>  await sem.take();
>  try {
>  const cwd = path.resolve(s.cwd || ".");
>  const fp = await stepFingerprint(s, cwd, !!opts.contentHash);
>  const haveOutputs = s.outputs.length ? await listOutputsExist(s.outputs, cwd) : false;
> 
>  const { skip, reason } = shouldSkip(s, state, fp, haveOutputs, opts.force);
>  if (opts.dryRun) {
>  results.push({ id: s.id, skipped: true, reason: "dry-run" });
>  return;
>  }
>  if (skip) {
>  results.push({ id: s.id, skipped: true, reason });
>  return;
>  }
> 
>  const startedAt = new Date().toISOString();
>  let execRes: { code: number | null; stdout: string; stderr: string } = { code: 0, stdout: "", stderr: "" };
> 
>  if (s.shell) execRes = await runShell(s.shell, cwd, s.env, s.timeoutMs);
>  else if (s.node) execRes = await runNode(s.node, s.args, cwd, s.env, s.timeoutMs);
>  else if (s.ts) execRes = await runTSModule(s, cwd, s.env, s.timeoutMs);
> 
>  const endedAt = new Date().toISOString();
>  const out: StepResult = {
>  id: s.id, skipped: false, startedAt, endedAt,
>  exitCode: execRes.code, durationMs: new Date(endedAt).getTime() - new Date(startedAt).getTime(),
>  stdout: execRes.stdout, stderr: execRes.stderr, fingerprint: fp
>  };
>  results.push(out);
> 
>  state.steps[s.id] = { fingerprint: fp, endedAt, exitCode: execRes.code };
>  await saveState(pipeline.name, state);
>  } finally {
>  sem.release();
>  }
>  };
> 
>  for (const s of steps) {
>  const p = runStep(s);
>  runMap.set(s.id, p);
>  }
>  await Promise.all(runMap.values());
> 
>  // write report
>  if (opts.reportDir) {
>  const md = renderReport(pipeline, results);
>  await ensureDir(opts.reportDir);
>  await writeText(path.join(opts.reportDir, `pipeline-${slug(pipeline.name)}.md`), md);
>  }
>  // pretty console
>  const ok = results.filter(r => !r.skipped && r.exitCode === 0).length;
>  const sk = results.filter(r => r.skipped).length;
>  const ko = results.filter(r => !r.skipped && r.exitCode !== 0).length;
>  console.log(`[piper] ${pipeline.name} — OK:${ok} SKIPPED:${sk} FAIL:${ko}`);
>  return results;
> }
> 
> export async function watchPipeline(
>  configPath: string,
>  pipelineName: string,
>  opts: RunOptions
> ) {
>  const cfg = await readConfig(configPath);
>  const pipeline = cfg.pipelines.find(p => p.name === pipelineName);
>  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
>  const allInputs = new Set<string>();
>  pipeline.steps.forEach(s => s.inputs.forEach(i => allInputs.add(path.resolve(s.cwd ?? ".", i))));
>  console.log(`[piper] watching ${allInputs.size} input patterns…`);
>  await runPipeline(configPath, pipelineName, { ...opts, dryRun: false });
>  const watcher = chokidar.watch(Array.from(allInputs));
>  watcher.on("all", async () => {
>  console.log(`[piper] change detected — re-running ${pipelineName}`);
>  await runPipeline(configPath, pipelineName, { ...opts, dryRun: false });
>  });
> }
> 
> function renderReport(p: PiperPipeline, results: StepResult[]) {
>  const rows = results.map(r => {
>  const dur = r.durationMs ?? 0;
>  const status = r.skipped ? "SKIP" : (r.exitCode === 0 ? "OK" : `FAIL(${r.exitCode})`);
>  return `| ${r.id} | ${status} | ${dur} | ${r.reason ?? ""} |`;
>  }).join("\n");
> 
>  return [
>  `# Pipeline: ${p.name}`,
>  "",
>  "| Step | Status | Duration (ms) | Notes |",
>  "|---|:---:|---:|---|",
>  rows,
>  ""
>  ].join("\n");
> }
> ```
> 
> ---
> 
> ### src/index.ts (CLI)
> 
> ```ts
> #!/usr/bin/env node
> import * as path from "path";
> import { runPipeline, watchPipeline } from "./runner.js";
> 
> function usage() {
>  console.log(`piper <command> [options]
> 
> Commands:
>  list List pipelines in pipelines.yaml
>  run <name> Run a pipeline
>  watch <name> Watch inputs & re-run
> 
> Options for run/watch:
>  --config pipelines.yaml Path to pipelines file (yaml|json)
>  --force Ignore cache
>  --dry Dry-run (plan)
>  --concurrency 4 Concurrency
>  --report docs/agile/pipelines
>  --content-hash Use content hashing even if step cache=mtime`);
> }
> 
> async function listPipelines(configPath: string) {
>  const { readFileSync } = await import("fs");
>  const YAML = (await import("yaml")).default;
>  const raw = readFileSync(configPath, "utf-8");
>  const obj = configPath.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
>  const pipes = Array.isArray(obj?.pipelines) ? obj.pipelines : [];
>  console.log(pipes.map((p: any) => "- " + p.name).join("\n"));
> }
> 
> async function main() {
>  const args = process.argv.slice(2);
>  const cmd = args[0];
>  const get = (flag: string, dflt?: string) => {
>  const i = args.indexOf(flag);
>  return i >= 0 ? args[i+1] : dflt;
>  };
>  const has = (flag: string) => args.includes(flag);
> 
>  const configPath = path.resolve(get("--config", "pipelines.yaml")!);
> 
>  if (!cmd || cmd === "help" || cmd === "--help") return usage();
>  if (cmd === "list") return listPipelines(configPath);
> 
>  if (cmd === "run" || cmd === "watch") {
>  const name = args[1];
>  if (!name) { usage(); process.exit(1); }
>  const opts = {
>  force: has("--force"),
>  dryRun: has("--dry"),
>  concurrency: Number(get("--concurrency", "2")),
>  reportDir: get("--report", "docs/agile/pipelines")!,
>  contentHash: has("--content-hash")
>  };
>  if (cmd === "run") await runPipeline(configPath, name, opts);
>  else await watchPipeline(configPath, name, opts);
>  return;
>  }
> 
>  usage();
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## pipelines.yaml (at repo root)
> 
> This wires your current toolchain into three pipelines: **docs**, **simtasks**, **codemods**. You can add/edit freely.
> 
> ```yaml
> pipelines:
>  - name: docs
>  steps:
>  - id: symdocs-scan
>  cwd: .
>  shell: "pnpm --filter @promethean/symdocs symdocs:01-scan --root packages --tsconfig ./tsconfig.json"
>  inputs: ["packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: [".cache/symdocs/symbols.json"]
>  - id: symdocs-docs
>  deps: ["symdocs-scan"]
>  shell: "pnpm --filter @promethean/symdocs symdocs:02-docs --model qwen3:4b"
>  inputs: [".cache/symdocs/symbols.json"]
>  outputs: [".cache/symdocs/docs.json"]
>  - id: symdocs-write
>  deps: ["symdocs-docs"]
>  shell: "pnpm --filter @promethean/symdocs symdocs:03-write --out docs/packages --granularity module"
>  inputs: [".cache/symdocs/docs.json"]
>  outputs: ["docs/packages/**/**/*.md"]
>  - id: symdocs-graph
>  deps: ["symdocs-scan"]
>  shell: "pnpm --filter @promethean/symdocs symdocs:04-graph"
>  inputs: ["packages/**/package.json", "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: ["docs/packages/README.md", "docs/packages/**/README.md"]
> 
>  - name: simtasks
>  steps:
>  - id: simtasks-scan
>  shell: "pnpm --filter @promethean/simtasks sim:01-scan --root packages --tsconfig ./tsconfig.json"
>  inputs: ["packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: [".cache/simtasks/functions.json"]
>  - id: simtasks-embed
>  deps: ["simtasks-scan"]
>  shell: "pnpm --filter @promethean/simtasks sim:02-embed --embed-model nomic-embed-text:latest"
>  inputs: [".cache/simtasks/functions.json"]
>  outputs: [".cache/simtasks/embeddings.json"]
>  - id: simtasks-cluster
>  deps: ["simtasks-embed"]
>  shell: "pnpm --filter @promethean/simtasks sim:03-cluster --sim-threshold 0.86 --k 12 --min-size 2"
>  inputs: [".cache/simtasks/embeddings.json"]
>  outputs: [".cache/simtasks/clusters.json"]
>  - id: simtasks-plan
>  deps: ["simtasks-cluster"]
>  shell: "pnpm --filter @promethean/simtasks sim:04-plan --model qwen3:4b --base-dir packages"
>  inputs: [".cache/simtasks/clusters.json"]
>  outputs: [".cache/simtasks/plans.json"]
>  - id: simtasks-write
>  deps: ["simtasks-plan"]
>  shell: "pnpm --filter @promethean/simtasks sim:05-write --out docs/agile/tasks"
>  inputs: [".cache/simtasks/plans.json"]
>  outputs: ["docs/agile/tasks/*.md"]
> 
>  - name: codemods
>  steps:
>  - id: mods-spec
>  shell: "pnpm --filter @promethean/codemods mods:01-spec --tsconfig ./tsconfig.json"
>  inputs: [".cache/simtasks/{functions,clusters,plans}.json"]
>  outputs: [".cache/codemods/specs.json"]
>  - id: mods-generate
>  deps: ["mods-spec"]
>  shell: "pnpm --filter @promethean/codemods mods:02-generate"
>  inputs: [".cache/codemods/specs.json"]
>  outputs: ["codemods/**/transform.ts"]
>  - id: mods-dry-run
>  deps: ["mods-generate"]
>  shell: "pnpm --filter @promethean/codemods mods:03-dry-run --root packages --report docs/agile/tasks/codemods --specs .cache/codemods/specs.json --delete-duplicates true"
>  inputs: ["codemods/**/transform.ts", "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: ["docs/agile/tasks/codemods/*.md"]
>  - id: mods-apply
>  deps: ["mods-dry-run"]
>  shell: "pnpm --filter @promethean/codemods mods:03-apply --root packages --report docs/agile/tasks/codemods --specs .cache/codemods/specs.json --delete-duplicates true"
>  inputs: ["codemods/**/transform.ts"]
>  outputs: [".cache/codemods/run-apply.json"]
>  - id: mods-verify
>  deps: ["mods-apply"]
>  shell: "pnpm --filter @promethean/codemods mods:04-verify:after --stage after --test \"pnpm -w -r test\""
>  inputs: [".cache/codemods/run-apply.json"]
>  outputs: ["docs/agile/tasks/codemods/verify-after.md", "docs/agile/tasks/codemods/VERIFY.md"]
> ```
> 
> ---
> 
> ## How to use
> 
> ```bash
> # install and build
> pnpm -w add -D tsx typescript
> pnpm -w i
> pnpm -w --filter @promethean/piper build
> 
> # list pipelines
> piper list
> 
> # run one
> piper run docs --report docs/agile/pipelines
> 
> # dry-run plan
> piper run codemods --dry
> 
> # watch a pipeline
> piper watch simtasks --concurrency 3
> ```
> 
> ---
> 
> ## Notes
> 
> - **Idempotent caching**: content hash of `inputs` + step config/env → fingerprint. If unchanged and `outputs` exist, step is skipped.
> - **Concurrency**: independent steps run in parallel; deps are respected (DAG).
> - **Step types**: `shell`, `node`, **or** `ts` (import & run a function).
> - **Reports**: a simple Markdown per run lands in `docs/agile/pipelines/`.
> - **State**: `.cache/piper/<pipeline>.state.json` stores last fingerprints/status.
> 
> Want a `--since <gitref>` filter, per-step retries, or ANSI log streaming to a TUI? Say the word and I’ll extend `piper` with those knobs.
<!-- UID: c5937803-f3e8-4b96-9a0c-1ebaedd7093e -->

---




>[!nexus_user] **User** - 08/31/2025 at 5:10 PM
> I want a pipeline that runs a sonarqube scan, then using the scan results as input, generate new tasks to address the scan issues
<!-- UID: c6e0c4c8-9d23-4a1a-a197-188ccc55601d -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 5:10 PM
> Absolutely. Here’s a clean, idempotent **SonarQube → Tasks** pipeline you can drop into the repo. It reuses your “pipelines as dataflow” pattern:
> 
> - run SonarScanner
> - fetch issues from SonarQube Web API
> - consolidate into actionable task plans (Ollama + Zod-validated)
> - write Obsidian-friendly markdown tasks under `docs/agile/tasks/sonar/`
> 
> Everything caches under `.cache/sonar/` and is marker-safe.
> 
> ---
> 
> # 0) Expectations / env
> 
> You’ll need a running SonarQube (local or cloud) and the scanner installed (`sonar-scanner`). Provide:
> 
> - `SONAR_HOST_URL` (e.g. `http://localhost:9000`)
> - `SONAR_TOKEN` (user token with “Browse” permission on the project)
> - `SONAR_PROJECT_KEY` (or pass `--project` to our scripts)
> 
> ---
> 
> # 1) New workspace package: `packages/sonarflow/`
> 
> ```
> packages/sonarflow/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  02-fetch.ts
>  03-plan.ts
>  04-write.ts
> ```
> 
> ## `packages/sonarflow/package.json`
> 
> ```json
> {
>  "name": "@promethean/sonarflow",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "sonarflow-fetch": "dist/02-fetch.js",
>  "sonarflow-plan": "dist/03-plan.js",
>  "sonarflow-write": "dist/04-write.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "sonar:fetch": "tsx src/02-fetch.ts",
>  "sonar:plan": "tsx src/03-plan.ts",
>  "sonar:write": "tsx src/04-write.ts",
>  "sonar:all": "pnpm sonar:fetch && pnpm sonar:plan && pnpm sonar:write"
>  },
>  "dependencies": {
>  "gray-matter": "^4.0.3",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ## `packages/sonarflow/tsconfig.json`
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "strict": true,
>  "skipLibCheck": true,
>  "outDir": "dist",
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ## `packages/sonarflow/src/types.ts`
> 
> ```ts
> export type SonarIssue = {
>  key: string;
>  rule: string;
>  severity: "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "INFO";
>  type: "BUG" | "VULNERABILITY" | "CODE_SMELL" | "SECURITY_HOTSPOT";
>  component: string; // e.g. repo path
>  project: string;
>  line?: number;
>  message: string;
>  debt?: string; // effort
>  tags?: string[];
> };
> 
> export type IssueBundle = {
>  id: string; // stable hash for grouping
>  title: string; // human label for the group
>  issues: SonarIssue[];
>  severityTop: SonarIssue["severity"];
>  types: string[]; // distinct types in bundle
>  rule?: string; // if homogenous by rule
>  prefix?: string; // path prefix base
> };
> 
> export type PlanTask = {
>  id: string; // derived from bundle id
>  title: string;
>  summary: string;
>  priority: "P0" | "P1" | "P2" | "P3" | "P4";
>  labels: string[];
>  acceptance: string[];
>  steps: string[];
>  refs: Array<{ key: string; file: string; line?: number }>;
> };
> 
> export type FetchPayload = { issues: SonarIssue[]; fetchedAt: string; project: string };
> export type PlanPayload = { tasks: PlanTask[]; plannedAt: string; project: string };
> ```
> 
> ## `packages/sonarflow/src/utils.ts`
> 
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import * as crypto from "crypto";
> 
> export function parseArgs(defaults: Record<string, string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i = 0; i < a.length; i++) {
>  const k = a[i];
>  if (!k.startsWith("--")) continue;
>  const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
>  out[k] = v;
>  }
>  return out;
> }
> 
> export function sha1(s: string) {
>  return crypto.createHash("sha1").update(s).digest("hex");
> }
> 
> export async function writeJSON(p: string, data: any) {
>  await fs.mkdir(path.dirname(p), { recursive: true });
>  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
> }
> export async function readJSON<T>(p: string): Promise<T | undefined> {
>  try { return JSON.parse(await fs.readFile(p, "utf-8")); } catch { return undefined; }
> }
> 
> export const SONAR_URL = process.env.SONAR_HOST_URL ?? "http://localhost:9000";
> export const SONAR_TOKEN = process.env.SONAR_TOKEN ?? "";
> export function authHeader() {
>  if (!SONAR_TOKEN) throw new Error("SONAR_TOKEN env is required");
>  const b = Buffer.from(`${SONAR_TOKEN}:`).toString("base64");
>  return { Authorization: `Basic ${b}` };
> }
> 
> export function severityToPriority(s: string): "P0"|"P1"|"P2"|"P3"|"P4" {
>  switch (s) {
>  case "BLOCKER": return "P0";
>  case "CRITICAL": return "P1";
>  case "MAJOR": return "P2";
>  case "MINOR": return "P3";
>  default: return "P4";
>  }
> }
> 
> export function pathPrefix(file: string, depth = 2) {
>  const parts = file.split("/");
>  return parts.slice(0, Math.min(parts.length, depth)).join("/");
> }
> ```
> 
> ---
> 
> ## `packages/sonarflow/src/02-fetch.ts`
> Pulls issues from SonarQube Web API and caches them.
> 
> ```ts
> /* eslint-disable no-console */
> import { parseArgs, SONAR_URL, authHeader, writeJSON } from "./utils.js";
> import type { SonarIssue, FetchPayload } from "./types.js";
> 
> const args = parseArgs({
>  "--project": process.env.SONAR_PROJECT_KEY ?? "",
>  "--out": ".cache/sonar/issues.json",
>  "--statuses": "OPEN,REOPENED,CONFIRMED",
>  "--types": "BUG,VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT",
>  "--severities": "BLOCKER,CRITICAL,MAJOR,MINOR,INFO",
>  "--pageSize": "500"
> });
> 
> async function sonarGet(pathname: string, params: Record<string,string|number>) {
>  const qs = new URLSearchParams(params as any).toString();
>  const url = `${SONAR_URL}${pathname}?${qs}`;
>  const res = await fetch(url, { headers: { ...authHeader() } });
>  if (!res.ok) throw new Error(`Sonar API ${res.status} ${pathname}`);
>  return res.json();
> }
> 
> async function main() {
>  const project = args["--project"];
>  if (!project) throw new Error("Provide --project or SONAR_PROJECT_KEY");
> 
>  const pageSize = Number(args["--pageSize"]);
>  const issues: SonarIssue[] = [];
>  let page = 1, total = 0;
> 
>  do {
>  const data = await sonarGet("/api/issues/search", {
>  projectKeys: project,
>  statuses: args["--statuses"],
>  types: args["--types"],
>  severities: args["--severities"],
>  p: page, ps: pageSize, additionalFields: "_all"
>  });
> 
>  total = data.total;
>  for (const it of data.issues as any[]) {
>  issues.push({
>  key: it.key,
>  rule: it.rule,
>  severity: it.severity,
>  type: it.type,
>  component: it.component, // usually "<project>:path/to/file.ts"
>  project: it.project,
>  line: it.line,
>  message: it.message,
>  debt: it.debt,
>  tags: it.tags
>  });
>  }
>  page++;
>  } while ((page - 1) * pageSize < total);
> 
>  const payload: FetchPayload = {
>  issues,
>  fetchedAt: new Date().toISOString(),
>  project
>  };
> 
>  await writeJSON(args["--out"], payload);
>  console.log(`sonarflow: fetched ${issues.length} issues for ${project} → ${args["--out"]}`);
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## `packages/sonarflow/src/03-plan.ts`
> Bundles issues and asks Ollama for concise, actionable tasks (validated; with fallback if LLM misbehaves).
> 
> ```ts
> /* eslint-disable no-console */
> import { z } from "zod";
> import { parseArgs, writeJSON, sha1, pathPrefix, severityToPriority } from "./utils.js";
> import type { FetchPayload, IssueBundle, PlanPayload, PlanTask, SonarIssue } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/sonar/issues.json",
>  "--out": ".cache/sonar/plans.json",
>  "--group-by": "rule+prefix", // "rule" | "prefix" | "rule+prefix"
>  "--prefix-depth": "2",
>  "--min-group": "2",
>  "--model": "qwen3:4b"
> });
> 
> async function ollamaJSON(model: string, prompt: string): Promise<any> {
>  const url = `${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/generate`;
>  const res = await fetch(url, {
>  method: "POST",
>  headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim());
> }
> 
> const TaskSchema = z.object({
>  title: z.string().min(1),
>  summary: z.string().min(1),
>  labels: z.array(z.string()).optional(),
>  steps: z.array(z.string()).min(1),
>  acceptance: z.array(z.string()).min(1)
> });
> 
> function bundleKey(i: SonarIssue, mode: string, depth: number) {
>  const comp = i.component.includes(":") ? i.component.split(":")[1] : i.component;
>  const pref = pathPrefix(comp, depth);
>  if (mode === "rule") return `rule:${i.rule}`;
>  if (mode === "prefix") return `prefix:${pref}`;
>  return `rule:${i.rule}|prefix:${pref}`;
> }
> 
> function bundleTitle(k: string) {
>  const parts = k.split("|").map(p => p.replace(/^rule:/,"Rule ").replace(/^prefix:/,"Path "));
>  return parts.join(" • ");
> }
> 
> async function main() {
>  const { issues, project } = JSON.parse(await (await fetch("file://" + process.cwd() + "/" + args["--in"])).text()) as FetchPayload;
> 
>  const depth = Number(args["--prefix-depth"]);
>  const mode = args["--group-by"];
>  const groups = new Map<string, SonarIssue[]>();
>  for (const it of issues) {
>  const k = bundleKey(it, mode, depth);
>  (groups.get(k) ?? groups.set(k, []).get(k)!).push(it);
>  }
> 
>  const min = Number(args["--min-group"]);
>  const bundles: IssueBundle[] = [];
>  for (const [k, arr] of groups) {
>  if (arr.length < min) continue;
>  const sev = ["BLOCKER","CRITICAL","MAJOR","MINOR","INFO"].find(s => arr.some(it => it.severity === s)) as any;
>  bundles.push({
>  id: sha1(k),
>  title: bundleTitle(k),
>  issues: arr,
>  severityTop: sev,
>  types: Array.from(new Set(arr.map(a => a.type))),
>  rule: k.includes("rule:") ? k.split("|").find(x=>x.startsWith("rule:"))?.slice(5) : undefined,
>  prefix: k.includes("prefix:") ? k.split("|").find(x=>x.startsWith("prefix:"))?.slice(7) : undefined
>  });
>  }
> 
>  const tasks: PlanTask[] = [];
>  for (const b of bundles) {
>  // Prepare compact context for LLM
>  const bullets = b.issues.slice(0, 30).map(i => {
>  const file = i.component.includes(":") ? i.component.split(":")[1] : i.component;
>  return `- [${i.severity}] ${i.type} ${i.rule} — ${file}${i.line ? ":"+i.line : ""} — ${i.message}`;
>  }).join("\n");
> 
>  const sys = [
>  "You are a senior tech lead creating a short, actionable engineering task from static analysis results.",
>  "Return ONLY JSON with: title, summary, labels[], steps[], acceptance[]",
>  "Keep the title crisp; steps 3-7 items; acceptance 3-7 bullets.",
>  "Prefer consolidation tasks (shared fix patterns) over per-issue tasks."
>  ].join("\n");
> 
>  const user = [
>  `PROJECT: ${project}`,
>  `BUNDLE: ${b.title} (severity=${b.severityTop}, types=${b.types.join(",")})`,
>  b.rule ? `RULE: ${b.rule}` : "",
>  b.prefix ? `PATH: ${b.prefix}` : "",
>  "",
>  "ISSUES:",
>  bullets
>  ].filter(Boolean).join("\n");
> 
>  let obj: any;
>  try {
>  obj = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`);
>  const parsed = TaskSchema.safeParse(obj);
>  if (!parsed.success) throw new Error("invalid LLM JSON");
>  } catch {
>  // Fallback
>  obj = {
>  title: `[${b.severityTop}] ${b.title}`,
>  summary: `Address ${b.issues.length} SonarQube finding(s) related to ${b.rule ?? b.types.join("/")}.`,
>  labels: ["sonarqube","quality","refactor",(b.rule ?? "misc").toLowerCase()],
>  steps: [
>  "Identify a shared remediation pattern.",
>  "Implement fix in smallest path slice (feature flag if risky).",
>  "Add/adjust unit tests for affected files.",
>  "Run Sonar scan locally and verify issues resolved."
>  ],
>  acceptance: [
>  "SonarQube shows 0 remaining issues for this bundle.",
>  "All unit tests pass.",
>  "No increase in code smells elsewhere."
>  ]
>  };
>  }
> 
>  const refs = b.issues.map(i => {
>  const file = i.component.includes(":") ? i.component.split(":")[1] : i.component;
>  return { key: i.key, file, line: i.line };
>  });
> 
>  tasks.push({
>  id: b.id,
>  title: obj.title,
>  summary: obj.summary,
>  labels: Array.from(new Set([...(obj.labels ?? []), "sonarqube"])),
>  steps: obj.steps,
>  acceptance: obj.acceptance,
>  priority: severityToPriority(b.severityTop),
>  refs
>  });
>  }
> 
>  const out: PlanPayload = { tasks, plannedAt: new Date().toISOString(), project };
>  await writeJSON(args["--out"], out);
>  console.log(`sonarflow: planned ${tasks.length} tasks → ${args["--out"]}`);
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## `packages/sonarflow/src/04-write.ts`
> Writes Obsidian-friendly task files (idempotent markers).
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import * as yaml from "yaml";
> import { parseArgs } from "./utils.js";
> import type { PlanPayload } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/sonar/plans.json",
>  "--out": "docs/agile/tasks/sonar",
>  "--status": "todo",
>  "--assignee": "",
>  "--label": "sonarqube,quality,remediation"
> });
> 
> const START = "<!-- SONARFLOW:BEGIN -->";
> const END = "<!-- SONARFLOW:END -->";
> 
> function slug(s: string) {
>  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
> }
> function stripGenerated(text: string) {
>  const si = text.indexOf(START), ei = text.indexOf(END);
>  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
>  return text.trimEnd();
> }
> 
> async function main() {
>  const { tasks, project } = JSON.parse(await fs.readFile(path.resolve(args["--in"]), "utf-8")) as PlanPayload;
> 
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
>  const index: string[] = ["# SonarQube remediation tasks", "", `Project: \`${project}\``, ""];
> 
>  for (const t of tasks) {
>  const fname = `${slug(t.title)}.md`;
>  const outPath = path.join(args["--out"], fname);
> 
>  const fm = {
>  uuid: cryptoRandomUUID(),
>  title: t.title,
>  project,
>  priority: t.priority,
>  status: args["--status"],
>  labels: Array.from(new Set([...(args["--label"].split(",").map(s => s.trim()).filter(Boolean)), ...(t.labels ?? [])])),
>  created_at: new Date().toISOString()
>  };
> 
>  const refsTable = [
>  "| Issue key | File |",
>  "|---|---|",
>  ...t.refs.map(r => `| \`${r.key}\` | \`${r.file}${r.line ? ":"+r.line : ""}\` |`)
>  ].join("\n");
> 
>  const body = [
>  START,
>  `# ${t.title}`,
>  "",
>  t.summary,
>  "",
>  "## Steps",
>  "",
>  ...t.steps.map((s, i) => `${i + 1}. ${s}`),
>  "",
>  "## Acceptance criteria",
>  "",
>  ...t.acceptance.map(a => `- [ ] ${a}`),
>  "",
>  "## References",
>  "",
>  refsTable,
>  "",
>  END,
>  ""
>  ].join("\n");
> 
>  const existing = await readMaybe(outPath);
>  const gm = existing ? matter(existing) : { content: "", data: {} };
>  const preserved = stripGenerated(gm.content);
>  const final = matter.stringify((preserved ? preserved + "\n\n" : "") + body, { ...gm.data, ...fm }, { language: "yaml" });
> 
>  await fs.writeFile(outPath, final, "utf-8");
>  index.push(`- [${t.title}](${path.basename(outPath)}) — ${t.priority}`);
>  }
> 
>  await fs.writeFile(path.join(args["--out"], "README.md"), index.join("\n") + "\n", "utf-8");
>  console.log(`sonarflow: wrote ${tasks.length} task files → ${args["--out"]}`);
> }
> 
> function cryptoRandomUUID() {
>  // Node 18+
>  // @ts-ignore
>  return globalThis.crypto?.randomUUID?.() ?? require("crypto").randomUUID();
> }
> async function readMaybe(p: string) {
>  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
> }
> 
> main().catch((e) => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 2) Wire into `pipelines.yaml`
> 
> Add a new pipeline named **sonar** (and a scanner step into your CI-friendly shell). Example:
> 
> ```yaml
> pipelines:
>  - name: sonar
>  steps:
>  - id: sonar-scan
>  cwd: .
>  shell: "sonar-scanner" # expects sonar-project.properties in repo OR env overrides
>  env:
>  SONAR_HOST_URL: "${SONAR_HOST_URL}"
>  SONAR_TOKEN: "${SONAR_TOKEN}"
>  SONAR_PROJECT_KEY: "${SONAR_PROJECT_KEY}"
>  inputs:
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  - "sonar-project.properties"
>  outputs:
>  - ".cache/sonar/scan.touch" # marker file we create after scan
>  - id: sonar-fetch
>  deps: ["sonar-scan"]
>  shell: "pnpm --filter @promethean/sonarflow sonar:fetch --project ${SONAR_PROJECT_KEY} --out .cache/sonar/issues.json"
>  inputs: []
>  outputs: [".cache/sonar/issues.json"]
>  - id: sonar-plan
>  deps: ["sonar-fetch"]
>  shell: "pnpm --filter @promethean/sonarflow sonar:plan --in .cache/sonar/issues.json --out .cache/sonar/plans.json --group-by rule+prefix --prefix-depth 2 --min-group 2 --model qwen3:4b"
>  inputs: [".cache/sonar/issues.json"]
>  outputs: [".cache/sonar/plans.json"]
>  - id: sonar-write
>  deps: ["sonar-plan"]
>  shell: "pnpm --filter @promethean/sonarflow sonar:write --in .cache/sonar/plans.json --out docs/agile/tasks/sonar"
>  inputs: [".cache/sonar/plans.json"]
>  outputs: ["docs/agile/tasks/sonar/*.md"]
> ```
> 
> > Create the scan marker in your CI or local script right after `sonar-scanner`, e.g.:
> > `mkdir -p .cache/sonar && echo $(date -Iseconds) > .cache/sonar/scan.touch`
> 
> If you’d rather have the fetch step *trigger* the scan (via `shell`), you can omit the marker step and call `sonar-scanner` directly inside `sonar-fetch`’s deps, but the above keeps the DAG clearer.
> 
> ---
> 
> # 3) Usage
> 
> ```bash
> # install & build
> pnpm -w i
> pnpm -w --filter @promethean/sonarflow build
> 
> # environment
> export SONAR_HOST_URL=http://localhost:9000
> export SONAR_TOKEN=YOUR_TOKEN
> export SONAR_PROJECT_KEY=your-project-key
> 
> # run pipeline
> piper run sonar --report docs/agile/pipelines
> 
> # or watch (re-runs when code changes)
> piper watch sonar
> ```
> 
> ---
> 
> ## Knobs / Notes
> 
> - **Grouping**: tweak `--group-by` (`rule`, `prefix`, `rule+prefix`), `--prefix-depth`, and `--min-group` to shape tasks.
> - **Priority mapping**: BLOCKER→P0, CRITICAL→P1, MAJOR→P2, MINOR→P3, INFO→P4 (override easily in `utils.ts`).
> - **LLM**: Any local Ollama model works; lower temp/short outputs keep tasks tight.
> - **Idempotency**: files use `<!-- SONARFLOW:BEGIN/END -->` markers; re-runs preserve any notes above markers.
> - **Security**: token is sent via Basic auth (`token:`). Keep it in env/CI secret store.
> 
> Want me to add an **auto-assign** map (e.g., by path prefix → team) or a **fix-PR stub generator** after tasks are written? I can extend `04-write.ts` with owner routing and a `codemods`-style report in one pass.
<!-- UID: 02843f21-40ef-418c-b33c-2be42e06c251 -->

---




>[!nexus_user] **User** - 08/31/2025 at 5:25 PM
> I want a board review pipeline that iterates through every task file in ./docs/agile/tasks and (not necessarily in this order, it's just the order i am thinking of them in)
> a. Adds front matter to tasks that don't have it (legacy or lazy contributor)
> b. breaks down the Process.md doc into chunks based on the headers to use as prompts for handling each of the columns
> c. Gathers relavent context from the repository for each task (doc similarity, files
> d. generates a board report addressing the status of each issue to ./docs/agile/reports
> e. In the report, suggest actions to be taken
<!-- UID: fc52c6c6-64ca-46eb-9230-d70344b9a592 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 5:25 PM
> Love it — here’s a clean, idempotent **Board Review** pipeline that does everything you asked:
> 
> - a) fills in missing front matter on `docs/agile/tasks/*.md`
> - b) slices `docs/agile/Process.md` into per-column prompts
> - c) finds relevant repo context (similar docs/code + any in the task)
> - d) generates a board report in `docs/agile/reports/`
> - e) includes suggested next actions for each task
> 
> All steps are small CLIs with caches under `.cache/boardrev/`. Plug them into `piper`.
> 
> ---
> 
> ## 1) New package: `packages/boardrev/`
> 
> ```
> packages/boardrev/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-ensure-fm.ts
>  02-process-prompts.ts
>  03-index-repo.ts
>  04-match-context.ts
>  05-evaluate.ts
>  06-report.ts
> ```
> 
> ### `packages/boardrev/package.json`
> ```json
> {
>  "name": "@promethean/boardrev",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "boardrev-ensure-fm": "dist/01-ensure-fm.js",
>  "boardrev-process-prompts": "dist/02-process-prompts.js",
>  "boardrev-index-repo": "dist/03-index-repo.js",
>  "boardrev-match-context": "dist/04-match-context.js",
>  "boardrev-evaluate": "dist/05-evaluate.js",
>  "boardrev-report": "dist/06-report.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "br:01-fm": "tsx src/01-ensure-fm.ts",
>  "br:02-prompts": "tsx src/02-process-prompts.ts",
>  "br:03-index": "tsx src/03-index-repo.ts",
>  "br:04-match": "tsx src/04-match-context.ts",
>  "br:05-eval": "tsx src/05-evaluate.ts",
>  "br:06-report": "tsx src/06-report.ts",
>  "br:all": "pnpm br:01-fm && pnpm br:02-prompts && pnpm br:03-index && pnpm br:04-match && pnpm br:05-eval && pnpm br:06-report"
>  },
>  "dependencies": {
>  "globby": "^14.0.2",
>  "gray-matter": "^4.0.3",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ### `packages/boardrev/tsconfig.json`
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "outDir": "dist",
>  "strict": true,
>  "skipLibCheck": true,
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ---
> 
> ### `src/types.ts`
> ```ts
> export type TaskFM = {
>  uuid: string;
>  title: string;
>  status: string; // e.g., backlog|todo|doing|review|blocked|done
>  priority: "P0"|"P1"|"P2"|"P3"|"P4";
>  labels?: string[];
>  created_at?: string;
>  assignee?: string;
> };
> 
> export type TaskDoc = {
>  file: string; // repo-relative path
>  fm: TaskFM;
>  content: string; // body without FM
> };
> 
> export type PromptChunk = {
>  heading: string; // e.g., "todo"
>  prompt: string; // markdown body under that heading
> };
> 
> export type RepoDoc = {
>  path: string; // repo-relative
>  kind: "code"|"doc";
>  size: number;
>  excerpt: string; // first N lines
> };
> 
> export type Embeddings = Record<string, number[]>; // key -> vector
> 
> export type ContextHit = {
>  path: string;
>  score: number;
>  kind: "code"|"doc";
>  excerpt: string;
> };
> 
> export type TaskContext = {
>  taskFile: string;
>  hits: ContextHit[];
>  : string[]; // explicit found in task
> };
> 
> export type EvalItem = {
>  taskFile: string;
>  inferred_status: string;
>  confidence: number; // 0..1
>  summary: string;
>  suggested_actions: string[];
>  blockers?: string[];
>  suggested_labels?: string[];
>  suggested_assignee?: string;
> };
> ```
> 
> ### `src/utils.ts`
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import globby from "globby";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(defaults: Record<string,string>) {
>  const out = { ...defaults };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){
>  const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
>  out[k]=v;
>  }
>  return out;
> }
> 
> export async function listTaskFiles(dir: string) {
>  return globby([`${dir.replace(/\\/g,"/")}/**/*.md`, "!**/README.md"]);
> }
> 
> export async function readText(p: string) { return fs.readFile(p, "utf-8"); }
> export async function writeText(p: string, s: string) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, s, "utf-8"); }
> export async function readMaybe(p: string) { try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }
> 
> export function slug(s: string) {
>  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
> }
> 
> export function normStatus(s: string) {
>  const t = (s||"").toLowerCase();
>  if (/backlog/.test(t)) return "backlog";
>  if (/todo|to[-\s]?do/.test(t)) return "todo";
>  if (/doing|in[-\s]?progress/.test(t)) return "doing";
>  if (/review|pr|code[-\s]?review/.test(t)) return "review";
>  if (/block/.test(t)) return "blocked";
>  if (/done|complete/.test(t)) return "done";
>  return "todo";
> }
> 
> export function relFromRepo(abs: string) { return path.relative(process.cwd(), abs).replace(/\\/g, "/"); }
> 
> export async function ollamaEmbed(model: string, text: string): Promise<number[]> {
>  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt: text })
>  });
>  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
>  const data = await res.json();
>  return data.embedding as number[];
> }
> 
> export async function ollamaJSON(model: string, prompt: string): Promise<any> {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
> }
> 
> export function cosine(a: number[], b: number[]) {
>  let dot=0, na=0, nb=0, n=Math.min(a.length,b.length);
>  for (let i=0;i<n;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
>  return !na||!nb ? 0 : dot/(Math.sqrt(na)*Math.sqrt(nb));
> }
> ```
> 
> ---
> 
> ### `src/01-ensure-fm.ts` *(step a)*
> Adds FM to tasks missing it, without touching body content.
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, listTaskFiles, readMaybe, writeText, normStatus, slug } from "./utils.js";
> import type { TaskFM } from "./types.js";
> 
> const args = parseArgs({
>  "--dir": "docs/agile/tasks",
>  "--default-priority": "P3",
>  "--default-status": "todo"
> });
> 
> function randomUUID() {
>  // @ts-ignore
>  return globalThis.crypto?.randomUUID?.() ?? (await import("crypto")).randomUUID();
> }
> 
> async function main() {
>  const dir = path.resolve(args["--dir"]);
>  const files = await listTaskFiles(dir);
>  let updated = 0;
> 
>  for (const f of files) {
>  const raw = await readMaybe(f); if (!raw) continue;
>  const gm = matter(raw);
>  const fm = gm.data as Partial<TaskFM>;
>  const needs = !fm || !fm.title || !fm.uuid || !fm.status || !fm.priority;
> 
>  if (!needs) continue;
> 
>  const title = fm.title ?? inferTitle(gm.content) ?? slug(path.basename(f, ".md")).replace(/-/g, " ");
>  const payload: TaskFM = {
>  uuid: fm.uuid ?? randomUUID(),
>  title,
>  status: normStatus(fm.status ?? args["--default-status"]),
>  priority: (fm.priority as any) ?? args["--default-priority"],
>  labels: Array.isArray(fm.labels) ? fm.labels : [],
>  created_at: fm.created_at ?? new Date().toISOString(),
>  assignee: fm.assignee ?? undefined
>  };
> 
>  const final = matter.stringify(gm.content.trimStart() + "\n", payload, { language: "yaml" });
>  await writeText(f, final);
>  updated++;
>  }
>  console.log(`boardrev: ensured front matter on ${updated} file(s)`);
> }
> 
> function inferTitle(body: string) {
>  const m = body.match(/^\s*#\s+(.+)$/m);
>  return m ? m[1].trim() : undefined;
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `src/02-process-prompts.ts` *(step b)*
> Slices `docs/agile/Process.md` into header-keyed prompt chunks.
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeText, readMaybe, slug } from "./utils.js";
> import type { PromptChunk } from "./types.js";
> 
> const args = parseArgs({
>  "--process": "docs/agile/Process.md",
>  "--out": ".cache/boardrev/prompts.json",
>  "--min-level": "2"
> });
> 
> async function main() {
>  const p = path.resolve(args["--process"]);
>  const raw = await readMaybe(p);
>  const chunks: PromptChunk[] = raw ? sliceByHeading(raw, Number(args["--min-level"])) : defaultPrompts();
>  await writeText(path.resolve(args["--out"]), JSON.stringify({ prompts: chunks }, null, 2));
>  console.log(`boardrev: prompts → ${args["--out"]} (${chunks.length})`);
> }
> 
> function sliceByHeading(md: string, minLevel: number): PromptChunk[] {
>  const lines = md.split(/\r?\n/);
>  const out: PromptChunk[] = [];
>  let cur: { heading: string; buf: string[] } | null = null;
> 
>  const flush = () => { if (cur) out.push({ heading: normalize(cur.heading), prompt: cur.buf.join("\n").trim() }); };
> 
>  for (const line of lines) {
>  const m = line.match(/^(#{1,6})\s+(.*)$/);
>  if (m) {
>  const level = m[1].length;
>  if (level >= minLevel) { flush(); cur = { heading: m[2].trim(), buf: [] }; continue; }
>  }
>  if (!cur) { cur = { heading: "general", buf: [] }; }
>  cur.buf.push(line);
>  }
>  flush();
>  return out;
> }
> 
> function normalize(h: string) {
>  const t = slug(h);
>  if (/backlog/.test(t)) return "backlog";
>  if (/todo|to-do|to_do/.test(t)) return "todo";
>  if (/doing|in-progress/.test(t)) return "doing";
>  if (/review|pr/.test(t)) return "review";
>  if (/block/.test(t)) return "blocked";
>  if (/done|complete/.test(t)) return "done";
>  return t || "general";
> }
> 
> function defaultPrompts(): PromptChunk[] {
>  return [
>  { heading: "backlog", prompt: "Triage scope and dependencies. Is this still relevant?" },
>  { heading: "todo", prompt: "Is the task actionable? Define next concrete step and owner." },
>  { heading: "doing", prompt: "Is work unblocked? Identify blockers and decision requests." },
>  { heading: "review", prompt: "What’s pending for approval/merge? List required checks." },
>  { heading: "blocked", prompt: "List blockers, owners, and unblocking proposals." },
>  { heading: "done", prompt: "Confirm acceptance criteria and follow-ups; cleanup tasks." },
>  { heading: "general", prompt: "Provide status and a crisp next action." }
>  ];
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `src/03-index-repo.ts` *(part of c)*
> Indexes repo docs/code and caches embeddings.
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import globby from "globby";
> import { parseArgs, ollamaEmbed, writeText } from "./utils.js";
> import type { RepoDoc, Embeddings } from "./types.js";
> 
> const args = parseArgs({
>  "--globs": "{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}",
>  "--max-bytes": "200000",
>  "--max-lines": "400",
>  "--embed-model": "nomic-embed-text:latest",
>  "--out-index": ".cache/boardrev/repo-index.json",
>  "--out-emb": ".cache/boardrev/repo-embeddings.json"
> });
> 
> async function main() {
>  const files = await globby(args["--globs"].split(",").map(s => s.trim()));
>  const maxB = Number(args["--max-bytes"]), maxL = Number(args["--max-lines"]);
>  const index: RepoDoc[] = [];
>  const embeddings: Embeddings = {};
> 
>  for (const f of files) {
>  const st = await fs.stat(f); if (st.size > maxB) continue;
>  const raw = await fs.readFile(f, "utf-8");
>  const excerpt = raw.split(/\r?\n/).slice(0, maxL).join("\n");
>  const kind = /\.(md|mdx)$/i.test(f) ? "doc" : "code";
>  index.push({ path: f.replace(/\\/g,"/"), size: st.size, kind, excerpt });
>  }
> 
>  // embed
>  for (const d of index) {
>  const key = d.path;
>  if (!embeddings[key]) {
>  const text = `PATH: ${d.path}\nKIND: ${d.kind}\n---\n${d.excerpt}`;
>  embeddings[key] = await ollamaEmbed(args["--embed-model"], text);
>  }
>  }
> 
>  await writeText(path.resolve(args["--out-index"]), JSON.stringify({ docs: index }, null, 2));
>  await writeText(path.resolve(args["--out-emb"]), JSON.stringify(embeddings));
>  console.log(`boardrev: indexed ${index.length} repo docs`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `src/04-match-context.ts` *(rest of c)*
> Embeds tasks, computes top-K similar repo docs, pulls explicit .
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import matter from "gray-matter";
> import { parseArgs, listTaskFiles, ollamaEmbed, cosine, writeText } from "./utils.js";
> import type { RepoDoc, Embeddings, TaskContext } from "./types.js";
> 
> const args = parseArgs({
>  "--tasks": "docs/agile/tasks",
>  "--index": ".cache/boardrev/repo-index.json",
>  "--emb": ".cache/boardrev/repo-embeddings.json",
>  "--embed-model": "nomic-embed-text:latest",
>  "--k": "8",
>  "--out": ".cache/boardrev/context.json"
> });
> 
> async function main() {
>  const tasksDir = path.resolve(args["--tasks"]);
>  const files = await listTaskFiles(tasksDir);
> 
>  const index: { docs: RepoDoc[] } = JSON.parse(await fs.readFile(path.resolve(args["--index"]), "utf-8"));
>  const repoEmb: Embeddings = JSON.parse(await fs.readFile(path.resolve(args["--emb"]), "utf-8"));
>  const k = Number(args["--k"]);
> 
>  const out: TaskContext[] = [];
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const text = [
>  `TITLE: ${gm.data?.title ?? ""}`,
>  `STATUS: ${gm.data?.status ?? ""} PRIORITY: ${gm.data?.priority ?? ""}`,
>  gm.content
>  ].join("\n");
>  const vec = await ollamaEmbed(args["--embed-model"], text);
> 
>  const scored = index.docs.map(d => ({
>  path: d.path, kind: d.kind, excerpt: d.excerpt,
>  score: cosine(vec, repoEmb[d.path] ?? [])
>  }))
>  .filter(x => x.score > 0)
>  .sort((a,b)=>b.score-a.score)
>  .slice(0, k);
> 
>  const = Array.from(raw.matchAll(/\[[^\]]*?\]\(([^)]+)\)/g)).map(m => m[1]);
> 
>  out.push({ taskFile: f.replace(/\\/g,"/"), hits: scored, });
>  }
> 
>  await writeText(path.resolve(args["--out"]), JSON.stringify({ contexts: out }, null, 2));
>  console.log(`boardrev: matched context for ${out.length} task(s)`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `src/05-evaluate.ts` *(step d+e core)*
> Uses Process prompts + context to infer status & actions per task (LLM JSON, Zod-validated).
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import matter from "gray-matter";
> import { z } from "zod";
> import { parseArgs, normStatus, ollamaJSON, writeText } from "./utils.js";
> import type { PromptChunk, TaskContext, EvalItem } from "./types.js";
> 
> const args = parseArgs({
>  "--tasks": "docs/agile/tasks",
>  "--prompts": ".cache/boardrev/prompts.json",
>  "--context": ".cache/boardrev/context.json",
>  "--model": "qwen3:4b",
>  "--out": ".cache/boardrev/evals.json"
> });
> 
> const EvalSchema = z.object({
>  inferred_status: z.string().min(1),
>  confidence: z.number().min(0).max(1),
>  summary: z.string().min(1),
>  suggested_actions: z.array(z.string()).min(1),
>  blockers: z.array(z.string()).optional(),
>  suggested_labels: z.array(z.string()).optional(),
>  suggested_assignee: z.string().optional()
> });
> 
> async function main() {
>  const prompts: { prompts: PromptChunk[] } = JSON.parse(await fs.readFile(path.resolve(args["--prompts"]), "utf-8"));
>  const contexts: { contexts: TaskContext[] } = JSON.parse(await fs.readFile(path.resolve(args["--context"]), "utf-8"));
>  const byTask = new Map(contexts.contexts.map(c => [c.taskFile, c]));
> 
>  const items: EvalItem[] = [];
> 
>  for (const ctx of contexts.contexts) {
>  const raw = await fs.readFile(ctx.taskFile, "utf-8");
>  const gm = matter(raw);
>  const status = normStatus(gm.data?.status ?? "todo");
>  const p = prompts.prompts.find(x => x.heading === status) ?? prompts.prompts.find(x => x.heading === "general");
> 
>  const sys = [
>  "You are a delivery lead reviewing a task.",
>  "Return ONLY JSON with keys: inferred_status, confidence (0..1), summary, suggested_actions[], blockers?[], suggested_labels?[], suggested_assignee?",
>  "Be concise and specific. Prefer one crisp next action."
>  ].join("\n");
> 
>  const user = [
>  `PROCESS_PROMPT: ${p?.prompt ?? ""}`,
>  "",
>  `TASK_TITLE: ${gm.data?.title ?? ""}`,
>  `TASK_STATUS: ${status} PRIORITY: ${gm.data?.priority ?? ""}`,
>  "",
>  "TASK_BODY:",
>  (gm.content || "").slice(0, 4000),
>  "",
>  "CONTEXT_TOP_MATCHES:",
>  ...ctx.hits.map(h => `- (${h.score.toFixed(2)}) ${h.path}\n ${h.excerpt.slice(0, 400)}`),
>  "",
>  ctx..length ? `EXPLICIT_LINKS:\n${ctx..map(l => "- "+l).join("\n")}` : ""
>  ].filter(Boolean).join("\n");
> 
>  let obj: any;
>  try { obj = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`); }
>  catch { obj = { inferred_status: status, confidence: 0.5, summary: "Review failed; keep current status.", suggested_actions: ["Manually review this task."] }; }
> 
>  const parsed = EvalSchema.safeParse(obj);
>  const clean = parsed.success ? parsed.data : { inferred_status: status, confidence: 0.5, summary: "LLM parse failed", suggested_actions: ["Manual triage required."] };
> 
>  items.push({
>  taskFile: ctx.taskFile,
>  ...clean,
>  inferred_status: normStatus(clean.inferred_status)
>  });
>  }
> 
>  await writeText(path.resolve(args["--out"]), JSON.stringify({ evals: items }, null, 2));
>  console.log(`boardrev: evaluated ${items.length} task(s)`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### `src/06-report.ts` *(step d & e output)*
> Writes a board report with per-task status and suggested actions.
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import matter from "gray-matter";
> import { parseArgs, writeText, slug } from "./utils.js";
> import type { EvalItem } from "./types.js";
> 
> const args = parseArgs({
>  "--tasks": "docs/agile/tasks",
>  "--evals": ".cache/boardrev/evals.json",
>  "--outDir": "docs/agile/reports"
> });
> 
> async function main() {
>  const evals: { evals: EvalItem[] } = JSON.parse(await fs.readFile(path.resolve(args["--evals"]), "utf-8"));
>  await fs.mkdir(path.resolve(args["--outDir"]), { recursive: true });
>  const ts = new Date().toISOString().replace(/[:.]/g, "-");
>  const out = path.join(args["--outDir"], `board-${ts}.md`);
> 
>  // group by inferred status
>  const groups = new Map<string, EvalItem[]>();
>  for (const e of evals.evals) (groups.get(e.inferred_status) ?? groups.set(e.inferred_status, []).get(e.inferred_status)!).push(e);
> 
>  // load titles/priorities
>  const rows: string[] = [];
>  for (const e of evals.evals) {
>  const raw = await fs.readFile(e.taskFile, "utf-8");
>  const gm = matter(raw);
>  const title = gm.data?.title ?? slug(path.basename(e.taskFile, ".md"));
>  const prio = gm.data?.priority ?? "P3";
>  const link = relFromRepo(e.taskFile);
>  rows.push(`| ${prio} | [${title}](${link}) | ${e.inferred_status} | ${(e.confidence*100).toFixed(0)}% | ${e.suggested_actions[0] ?? ""} |`);
>  }
> 
>  // summary
>  const statusOrder = ["backlog","todo","doing","review","blocked","done"];
>  const counts = statusOrder.map(s => `- **${s}**: ${groups.get(s)?.length ?? 0}`).join("\n");
> 
>  const details: string[] = [];
>  for (const s of statusOrder) {
>  const list = groups.get(s) ?? [];
>  if (!list.length) continue;
>  details.push(`## ${s} (${list.length})`, "");
>  for (const e of list) {
>  const gm = matter(await fs.readFile(e.taskFile, "utf-8"));
>  const title = gm.data?.title ?? e.taskFile;
>  const link = relFromRepo(e.taskFile);
>  details.push(
>  `### ${title} \n(${link})`,
>  "",
>  `**Confidence:** ${(e.confidence*100).toFixed(0)}%`,
>  "",
>  "**Suggested next actions:**",
>  ...e.suggested_actions.map(a => `- ${a}`),
>  e.blockers?.length ? "\n**Blockers:**\n" + e.blockers.map(b => `- ${b}`).join("\n") : "",
>  e.suggested_assignee ? `\n**Suggested assignee:** ${e.suggested_assignee}\n` : "",
>  e.suggested_labels?.length ? `\n**Suggested labels:** ${e.suggested_labels.join(", ")}\n` : "",
>  ""
>  );
>  }
>  }
> 
>  const md = [
>  "# Board Review Report",
>  "",
>  `Generated: ${new Date().toLocaleString()}`,
>  "",
>  "## Summary",
>  "",
>  counts,
>  "",
>  "## Quick table",
>  "",
>  "| Priority | Task | Inferred Status | Confidence | Next action |",
>  "|---:|---|---|---:|---|",
>  ...rows,
>  "",
>  ...details
>  ].join("\n");
> 
>  await writeText(out, md);
>  await writeText(path.join(args["--outDir"], "README.md"), `# Board Reports\n\n- [Latest](${path.basename(out)})\n`);
>  console.log(`boardrev: wrote report → ${path.relative(process.cwd(), out)}`);
> }
> 
> function relFromRepo(abs: string) {
>  return abs.replace(process.cwd().replace(/\\/g,"/") + "/", "");
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 2) Add to `pipelines.yaml`
> 
> ```yaml
> pipelines:
>  - name: board-review
>  steps:
>  - id: br-fm
>  shell: "pnpm --filter @promethean/boardrev br:01-fm"
>  inputs: ["docs/agile/tasks/**/*.md"]
>  outputs: ["docs/agile/tasks/**/*.md"] # FM updates in-place
>  - id: br-prompts
>  deps: ["br-fm"]
>  shell: "pnpm --filter @promethean/boardrev br:02-prompts --process docs/agile/Process.md --out .cache/boardrev/prompts.json"
>  inputs: ["docs/agile/Process.md"]
>  outputs: [".cache/boardrev/prompts.json"]
>  - id: br-index
>  deps: ["br-fm"]
>  shell: "pnpm --filter @promethean/boardrev br:03-index --globs \"{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}\""
>  inputs:
>  - "README.md"
>  - "docs/**/*.md"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/boardrev/repo-index.json"
>  - ".cache/boardrev/repo-embeddings.json"
>  - id: br-match
>  deps: ["br-prompts","br-index"]
>  shell: "pnpm --filter @promethean/boardrev br:04-match --tasks docs/agile/tasks --k 8"
>  inputs:
>  - "docs/agile/tasks/**/*.md"
>  - ".cache/boardrev/repo-index.json"
>  - ".cache/boardrev/repo-embeddings.json"
>  outputs: [".cache/boardrev/context.json"]
>  - id: br-eval
>  deps: ["br-match"]
>  shell: "pnpm --filter @promethean/boardrev br:05-eval --model qwen3:4b"
>  inputs:
>  - ".cache/boardrev/prompts.json"
>  - ".cache/boardrev/context.json"
>  outputs: [".cache/boardrev/evals.json"]
>  - id: br-report
>  deps: ["br-eval"]
>  shell: "pnpm --filter @promethean/boardrev br:06-report --outDir docs/agile/reports"
>  inputs: [".cache/boardrev/evals.json"]
>  outputs: ["docs/agile/reports/*.md"]
> ```
> 
> ---
> 
> ## 3) How to run
> 
> ```bash
> pnpm -w i
> pnpm -w --filter @promethean/boardrev build
> 
> # one-shot
> piper run board-review --report docs/agile/pipelines
> 
> # watch for changes
> piper watch board-review
> ```
> 
> ---
> 
> ## Notes & knobs
> 
> - Change the embedding model via `--embed-model` (defaults to `nomic-embed-text:latest`).
> - If `docs/agile/Process.md` is missing, default prompts are used.
> - Report filenames are timestamped; `docs/agile/reports/README.md` always points to the latest.
> - Everything is idempotent; re-running only recomputes when inputs changed (via `piper` caching).
> - The evaluation is conservative: if the LLM response fails validation, we keep current status and ask for manual triage.
> 
> Want me to add **auto-labeling by path** (e.g., `packages/apps/* → label: apps`) or a **“owner map”** (path prefix → assignee) so the report proposes owners? I can extend `05-evaluate.ts` in one pass.
<!-- UID: 508b2fd6-1390-49b6-ac00-51ac971313fd -->

---




>[!nexus_user] **User** - 08/31/2025 at 5:37 PM
> semver-gaurd
<!-- UID: 67265f29-3498-4bcd-bbe4-5ad83b0405fd -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 5:37 PM
> Got it — here’s a drop-in **semver-guard** package + a Piper pipeline that:
> 
> 1) snapshots the exported API of every package 
> 2) diffs against a baseline (from disk or a git ref) 
> 3) computes required **major/minor/patch** per package (heuristics below) 
> 4) asks Ollama for short migration notes (validated) 
> 5) writes Obsidian-friendly tasks under `docs/agile/tasks/semver/`
> 
> Idempotent, cached under `.cache/semverguard/`.
> 
> ---
> 
> ## packages/semverguard/
> 
> ```
> packages/semverguard/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-snapshot.ts
>  02-diff.ts
>  03-plan.ts
>  04-write.ts
> ```
> 
> ### package.json
> ```json
> {
>  "name": "@promethean/semverguard",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "semver-snapshot": "dist/01-snapshot.js",
>  "semver-diff": "dist/02-diff.js",
>  "semver-plan": "dist/03-plan.js",
>  "semver-write": "dist/04-write.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "sv:01-snapshot": "tsx src/01-snapshot.ts",
>  "sv:02-diff": "tsx src/02-diff.ts",
>  "sv:03-plan": "tsx src/03-plan.ts",
>  "sv:04-write": "tsx src/04-write.ts",
>  "sv:all": "pnpm sv:01-snapshot && pnpm sv:02-diff && pnpm sv:03-plan && pnpm sv:04-write"
>  },
>  "dependencies": {
>  "globby": "^14.0.2",
>  "gray-matter": "^4.0.3",
>  "ts-morph": "^22.0.0",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ### tsconfig.json
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "strict": true,
>  "skipLibCheck": true,
>  "outDir": "dist",
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ---
> 
> ### src/types.ts
> ```ts
> export type ApiKind = "function"|"variable"|"class"|"interface"|"type"|"enum";
> export type MemberSig = { name: string; type: string; optional?: boolean };
> export type FnSig = { params: MemberSig[]; returns: string };
> export type ClassSig = { props: MemberSig[]; methods: Record<string, FnSig> };
> 
> export type ApiItem = {
>  kind: ApiKind;
>  name: string; // exported symbol name
>  signature: string; // stable string for hashing
>  fn?: FnSig;
>  class?: ClassSig;
> };
> 
> export type PkgSnapshot = {
>  pkgName: string;
>  version: string;
>  exports: Record<string, ApiItem>; // key by name
> };
> 
> export type WorkspaceSnapshot = {
>  createdAt: string;
>  packages: Record<string, PkgSnapshot>; // key = package.json name
> };
> 
> export type ChangeKind = "remove"|"add"|"change";
> export type ApiChange = {
>  name: string;
>  kind: ChangeKind;
>  detail: string; // human summary
>  severity: "major"|"minor"|"patch";
> };
> 
> export type DiffResult = {
>  pkgName: string;
>  required: "major"|"minor"|"patch"|"none";
>  changes: ApiChange[];
> };
> 
> export type PlansFile = {
>  plannedAt: string;
>  packages: Record<string, {
>  required: DiffResult["required"];
>  changes: ApiChange[];
>  task: {
>  title: string;
>  summary: string;
>  steps: string[];
>  acceptance: string[];
>  labels: string[];
>  }
>  }>;
> };
> ```
> 
> ### src/utils.ts
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { Project, ts, Symbol as MorphSymbol } from "ts-morph";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(def: Record<string,string>) {
>  const out = { ...def };
>  const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){
>  const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
>  out[k]=v;
>  }
>  return out;
> }
> export async function readJSON<T>(p: string): Promise<T | undefined> { try { return JSON.parse(await fs.readFile(p, "utf-8")) as T; } catch { return undefined; } }
> export async function writeJSON(p: string, data: any) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }
> 
> export function rel(abs: string) { return path.relative(process.cwd(), abs).replace(/\\/g, "/"); }
> 
> export async function ollamaJSON(model: string, prompt: string) {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST", headers: {"Content-Type":"application/json"},
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
> }
> 
> export function hashSignature(s: string) {
>  // very simple hash to keep snapshots light (avoid crypto dep)
>  let h = 2166136261 >>> 0;
>  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
>  return `h${h.toString(16)}`;
> }
> ```
> 
> ---
> 
> ### src/01-snapshot.ts
> Scans `packages/*` and records *exported* API (functions, vars, classes, interfaces, types, enums).
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import globby from "globby";
> import { Project } from "ts-morph";
> import { parseArgs, writeJSON, hashSignature } from "./utils.js";
> import type { WorkspaceSnapshot, PkgSnapshot, ApiItem, FnSig, ClassSig, MemberSig } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--out": ".cache/semverguard/snapshot.json",
>  "--tsconfig": "tsconfig.json"
> });
> 
> async function main() {
>  const ROOT = path.resolve(args["--root"]);
>  const pkgs = await fs.readdir(ROOT, { withFileTypes: true }).then(ents => ents.filter(e => e.isDirectory()).map(e => e.name));
> 
>  const project = new Project({ tsConfigFilePath: path.resolve(args["--tsconfig"]), skipAddingFilesFromTsConfig: true });
> 
>  const workspace: WorkspaceSnapshot = { createdAt: new Date().toISOString(), packages: {} };
> 
>  for (const dir of pkgs) {
>  const pkgRoot = path.join(ROOT, dir);
>  const pkgJsonPath = path.join(pkgRoot, "package.json");
>  let pkgName = dir, version = "0.0.0";
>  try {
>  const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, "utf-8"));
>  pkgName = pkgJson.name ?? dir;
>  version = pkgJson.version ?? "0.0.0";
>  } catch {}
> 
>  // include src/lib files
>  const files = await globby([`${pkgRoot.replace(/\\/g,"/")}/**/*.{ts,tsx,js,jsx}`, "!**/node_modules/**", "!**/dist/**", "!**/build/**"]);
>  files.forEach(f => project.addSourceFileAtPathIfExists(f));
> 
>  const exports: Record<string, ApiItem> = {};
> 
>  for (const sf of project.getSourceFiles().filter(s => s.getFilePath().startsWith(pkgRoot))) {
>  // gather named exports
>  for (const ed of sf.getExportedDeclarations()) {
>  const [name, decls] = ed;
>  const d = decls[0];
>  const kindName = d.getKindName();
> 
>  if (kindName.endsWith("FunctionDeclaration")) {
>  const fn = (d as any);
>  const sig = fn.getSignature();
>  const params: MemberSig[] = fn.getParameters().map((p:any) => ({ name: p.getName(), type: p.getType().getText(), optional: p.isOptional?.() }));
>  const ret = sig ? sig.getReturnType().getText() : fn.getReturnType().getText();
>  const signature = `function ${name}(${params.map(p=>p.name+":"+p.type+(p.optional?"?":"")).join(", ")}): ${ret}`;
>  exports[name] = { kind: "function", name, signature: hashSignature(signature), fn: { params, returns: ret } as FnSig };
>  }
>  else if (kindName.endsWith("VariableDeclaration")) {
>  const v = (d as any);
>  const typ = v.getType().getText();
>  const signature = `var ${name}: ${typ}`;
>  exports[name] = { kind: "variable", name, signature: hashSignature(signature) };
>  }
>  else if (kindName.endsWith("ClassDeclaration")) {
>  const c = (d as any);
>  const props: MemberSig[] = c.getProperties().filter((p:any)=>p.hasModifier("public") || !p.hasModifier("private")).map((p:any)=>({ name: p.getName(), type: p.getType().getText(), optional: p.hasQuestionToken?.() }));
>  const methods: Record<string, FnSig> = {};
>  c.getMethods().filter((m:any)=>m.hasModifier("public") || !m.hasModifier("private")).forEach((m:any) => {
>  const params: MemberSig[] = m.getParameters().map((p:any)=>({ name: p.getName(), type: p.getType().getText(), optional: p.isOptional?.() }));
>  const ret = m.getReturnType().getText();
>  methods[m.getName()] = { params, returns: ret };
>  });
>  const signature = `class ${name}{ props:[${props.map(p=>p.name+":"+p.type+(p.optional?"?":"")).join(",")}]; methods:[${Object.entries(methods).map(([n,f])=>`${n}(${f.params.map(p=>p.type).join(",")}):${f.returns}`).join(";")}] }`;
>  exports[name] = { kind: "class", name, signature: hashSignature(signature), class: { props, methods } as ClassSig };
>  }
>  else if (kindName.endsWith("InterfaceDeclaration")) {
>  const i = (d as any);
>  const members: MemberSig[] = i.getProperties().map((p:any)=>({ name: p.getName(), type: p.getType().getText(), optional: p.hasQuestionToken?.() }));
>  const signature = `interface ${name}{${members.map(m=>m.name+":"+m.type+(m.optional?"?":"")).join(";")}}`;
>  exports[name] = { kind: "interface", name, signature: hashSignature(signature) };
>  }
>  else if (kindName.endsWith("TypeAliasDeclaration")) {
>  const t = (d as any);
>  const text = t.getTypeNode()?.getText() ?? t.getType().getText();
>  const signature = `type ${name}=${text}`;
>  exports[name] = { kind: "type", name, signature: hashSignature(signature) };
>  }
>  else if (kindName.endsWith("EnumDeclaration")) {
>  const e = (d as any);
>  const members = e.getMembers().map((m:any)=>m.getName());
>  const signature = `enum ${name}{${members.join(",")}}`;
>  exports[name] = { kind: "enum", name, signature: hashSignature(signature) };
>  }
>  }
>  }
> 
>  const snap: PkgSnapshot = { pkgName, version, exports };
>  workspace.packages[pkgName] = snap;
>  }
> 
>  await writeJSON(path.resolve(args["--out"]), workspace);
>  console.log(`semverguard: snapshot → ${args["--out"]} (${Object.keys(workspace.packages).length} packages)`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### src/02-diff.ts
> Compares **current snapshot** vs **baseline** (from file path or `git:<ref>`), classifies semver.
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON } from "./utils.js";
> import type { WorkspaceSnapshot, DiffResult, ApiChange, MemberSig, FnSig, ClassSig } from "./types.js";
> 
> const args = parseArgs({
>  "--current": ".cache/semverguard/snapshot.json",
>  "--baseline": ".cache/semverguard/baseline.json", // OR git:<ref>:path/to/file.json
>  "--out": ".cache/semverguard/diff.json"
> });
> 
> async function readSnap(spec: string): Promise<WorkspaceSnapshot> {
>  if (spec.startsWith("git:")) {
>  // format git:<ref>:<path>
>  const m = spec.match(/^git:([^:]+):(.+)$/);
>  if (!m) throw new Error("baseline git spec must be git:<ref>:<path>");
>  const [, ref, file] = m;
>  const { execSync } = await import("child_process");
>  const buf = execSync(`git show ${ref}:${file}`, { stdio: ["ignore", "pipe", "pipe"] });
>  return JSON.parse(buf.toString("utf-8"));
>  }
>  return JSON.parse(await fs.readFile(path.resolve(spec), "utf-8"));
> }
> 
> function maxSemver(a: DiffResult["required"], b: DiffResult["required"]): DiffResult["required"] {
>  const ord = { none:0, patch:1, minor:2, major:3 } as const;
>  const inv = ["none","patch","minor","major"] as const;
>  return inv[Math.max(ord[a], ord[b])];
> }
> 
> function comparePkg(oldP: any, curP: any): DiffResult {
>  const changes: ApiChange[] = [];
>  let required: DiffResult["required"] = "none";
> 
>  const oldE = oldP?.exports ?? {};
>  const curE = curP?.exports ?? {};
> 
>  // removals & changes
>  for (const name of Object.keys(oldE)) {
>  if (!curE[name]) {
>  changes.push({ name, kind: "remove", detail: `removed ${oldE[name].kind} '${name}'`, severity: "major" });
>  required = maxSemver(required, "major");
>  continue;
>  }
>  if (oldE[name].kind !== curE[name].kind) {
>  changes.push({ name, kind: "change", detail: `kind changed ${oldE[name].kind}→${curE[name].kind}`, severity: "major" });
>  required = maxSemver(required, "major");
>  continue;
>  }
>  if (oldE[name].signature !== curE[name].signature) {
>  // heuristic: function/class deeper checks
>  if (curE[name].kind === "function") {
>  const a = oldE[name].fn as FnSig, b = curE[name].fn as FnSig;
>  const oldParams = a?.params ?? [], newParams = b?.params ?? [];
>  if (newParams.length < oldParams.length) {
>  changes.push({ name, kind: "change", detail: `params removed (${oldParams.length}→${newParams.length})`, severity: "major" });
>  required = maxSemver(required, "major");
>  } else if (newParams.length > oldParams.length) {
>  const addedAreOptional = newParams.slice(oldParams.length).every(p => p.optional);
>  const sev = addedAreOptional ? "minor" : "major";
>  changes.push({ name, kind: "change", detail: `params added at end (${oldParams.length}→${newParams.length})`, severity: sev as any });
>  required = maxSemver(required, addedAreOptional ? "minor" : "major");
>  } else {
>  // same count; check optionality/return type change
>  const optTightened = newParams.some((p,i)=> !!p && !!oldParams[i] && (oldParams[i].optional && !p.optional));
>  if (optTightened) { changes.push({ name, kind:"change", detail:"parameter made required", severity:"major"}); required = maxSemver(required,"major"); }
>  if (a?.returns && b?.returns && a.returns !== b.returns) {
>  changes.push({ name, kind:"change", detail:`return type changed ${a.returns}→${b.returns}`, severity:"major" });
>  required = maxSemver(required, "major");
>  } else {
>  changes.push({ name, kind: "change", detail: "function type changed (non-breaking likely)", severity: "minor" });
>  required = maxSemver(required, "minor");
>  }
>  }
>  } else if (curE[name].kind === "class") {
>  const a = oldE[name].class as ClassSig, b = curE[name].class as ClassSig;
>  const oldMs = new Set(Object.keys(a?.methods ?? {}));
>  const newMs = new Set(Object.keys(b?.methods ?? {}));
>  for (const m of oldMs) if (!newMs.has(m)) { changes.push({ name:`${name}.${m}`, kind:"remove", detail:"method removed", severity:"major" }); required = maxSemver(required, "major"); }
>  for (const m of newMs) if (!oldMs.has(m)) { changes.push({ name:`${name}.${m}`, kind:"add", detail:"method added", severity:"minor" }); required = maxSemver(required, "minor"); }
>  // props removed → major; added optional prop → minor
>  const oldPs = new Map((a?.props ?? []).map(p => [p.name, p]));
>  const newPs = new Map((b?.props ?? []).map(p => [p.name, p]));
>  for (const [pName, p] of oldPs) if (!newPs.has(pName)) { changes.push({ name:`${name}.${pName}`, kind:"remove", detail:"property removed", severity:"major" }); required = maxSemver(required, "major"); }
>  for (const [pName, p] of newPs) if (!oldPs.has(pName)) { changes.push({ name:`${name}.${pName}`, kind:"add", detail:"property added", severity: p.optional ? "minor" : "major" }); required = maxSemver(required, p.optional ? "minor" : "major"); }
>  } else {
>  // type/interface/enum/var changed → conservatively minor (enum removal handled by removal path)
>  changes.push({ name, kind: "change", detail: `${curE[name].kind} signature changed`, severity: "minor" });
>  required = maxSemver(required, "minor");
>  }
>  }
>  }
> 
>  // additions
>  for (const name of Object.keys(curE)) {
>  if (!oldE[name]) {
>  const sev = curE[name].kind === "type" || curE[name].kind === "interface" ? "patch" : "minor";
>  changes.push({ name, kind: "add", detail: `added ${curE[name].kind} '${name}'`, severity: sev as any });
>  required = maxSemver(required, sev as any);
>  }
>  }
> 
>  return { pkgName: curP?.pkgName ?? oldP?.pkgName ?? "", required, changes };
> }
> 
> async function main() {
>  const current = await readSnap(args["--current"]);
>  const baseline = await readSnap(args["--baseline"]);
> 
>  const out: Record<string, DiffResult> = {};
>  const names = new Set<string>([...Object.keys(baseline.packages), ...Object.keys(current.packages)]);
>  for (const name of names) {
>  out[name] = comparePkg(baseline.packages[name], current.packages[name]);
>  }
> 
>  await writeJSON(path.resolve(args["--out"]), { comparedAt: new Date().toISOString(), results: out });
>  console.log(`semverguard: diff → ${args["--out"]}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### src/03-plan.ts
> Turns diffs into concise tasks via Ollama (Zod-validated fallback).
> ```ts
> /* eslint-disable no-console */
> import { z } from "zod";
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON, ollamaJSON } from "./utils.js";
> import type { PlansFile, ApiChange } from "./types.js";
> 
> const args = parseArgs({
>  "--diff": ".cache/semverguard/diff.json",
>  "--out": ".cache/semverguard/plans.json",
>  "--model": "qwen3:4b"
> });
> 
> const TaskSchema = z.object({
>  title: z.string().min(1),
>  summary: z.string().min(1),
>  steps: z.array(z.string()).min(1),
>  acceptance: z.array(z.string()).min(1),
>  labels: z.array(z.string()).optional()
> });
> 
> async function main() {
>  const diff = JSON.parse(await fs.readFile(path.resolve(args["--diff"]), "utf-8")) as { results: Record<string, { required: any; changes: ApiChange[] }> };
> 
>  const packages: PlansFile["packages"] = {};
>  for (const [pkg, res] of Object.entries(diff.results)) {
>  if (!res) continue;
> 
>  const sys = [
>  "You are a release lead. Produce a short task for versioning & migration.",
>  "Return ONLY JSON with: title, summary, steps[], acceptance[], labels[]?"
>  ].join("\n");
>  const changesList = res.changes.slice(0, 50).map(c => `- [${c.severity}] ${c.kind} ${c.name} — ${c.detail}`).join("\n");
>  const user = [
>  `PACKAGE: ${pkg}`,
>  `REQUIRED: ${res.required.toUpperCase()}`,
>  "CHANGES:",
>  changesList || "(none)"
>  ].join("\n");
> 
>  let obj: any;
>  try { obj = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`); }
>  catch { obj = { title: `Semver ${res.required} for ${pkg}`, summary: "Apply required semver bump and document changes.", steps: ["Update package.json", "Write CHANGELOG", "Add migration notes", "Publish"], acceptance: ["Version bumped", "Changelog updated", "CI green"] }; }
> 
>  const parsed = TaskSchema.safeParse(obj);
>  const task = parsed.success ? parsed.data : { title: `Semver ${res.required} for ${pkg}`, summary: "Apply required semver bump and document changes.", steps: ["Update package.json", "Write CHANGELOG", "Publish"], acceptance: ["Version bumped", "CI green"] };
> 
>  packages[pkg] = { required: res.required, changes: res.changes, task: { ...task, labels: Array.from(new Set([...(task.labels ?? []), "semver","release"])) } };
>  }
> 
>  const out: PlansFile = { plannedAt: new Date().toISOString(), packages };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`semverguard: plans → ${args["--out"]}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ### src/04-write.ts
> Writes one task per package under `docs/agile/tasks/semver/`, idempotent with markers.
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import matter from "gray-matter";
> import { parseArgs } from "./utils.js";
> import type { PlansFile } from "./types.js";
> 
> const args = parseArgs({
>  "--plans": ".cache/semverguard/plans.json",
>  "--out": "docs/agile/tasks/semver",
>  "--status": "todo",
>  "--priority": "P2"
> });
> 
> const START="<!-- SEMVERGUARD:BEGIN -->";
> const END ="<!-- SEMVERGUARD:END -->";
> 
> function strip(text: string) {
>  const si = text.indexOf(START), ei = text.indexOf(END);
>  if (si>=0 && ei>si) return (text.slice(0, si).trimEnd()+"\n").trimEnd();
>  return text.trimEnd();
> }
> function slug(s: string){ return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
> function uuid(){ // @ts-ignore
>  return globalThis.crypto?.randomUUID?.() ?? (require("crypto").randomUUID());
> }
> 
> async function main() {
>  const plans = JSON.parse(await fs.readFile(path.resolve(args["--plans"]), "utf-8")) as PlansFile;
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
> 
>  const index: string[] = ["# Semver guard tasks", ""];
>  for (const [pkg, p] of Object.entries(plans.packages)) {
>  const title = `[${p.required}] bump for ${pkg}`;
>  const fname = `${slug(pkg)}-semver-${p.required}.md`;
>  const outPath = path.join(args["--out"], fname);
> 
>  const table = [
>  "| Severity | Change |",
>  "|---|---|",
>  ...p.changes.map(c => `| ${c.severity} | ${c.kind} \`${c.name}\` — ${c.detail} |`)
>  ].join("\n");
> 
>  const body = [
>  START,
>  `# ${title}`,
>  "",
>  `**Required bump:** \`${p.required}\``,
>  "",
>  "## Changes",
>  "",
>  table,
>  "",
>  "## Steps",
>  "",
>  ...p.task.steps.map((s,i)=>`${i+1}. ${s}`),
>  "",
>  "## Acceptance",
>  "",
>  ...p.task.acceptance.map(a=>`- [ ] ${a}`),
>  "",
>  END,
>  ""
>  ].join("\n");
> 
>  const existing = await readMaybe(outPath);
>  const gm = existing ? matter(existing) : { content: "", data: {} as any };
>  const content = (strip(gm.content) ? strip(gm.content) + "\n\n" : "") + body;
>  const fm = {
>  ...(gm.data || {}),
>  uuid: gm.data?.uuid ?? uuid(),
>  title,
>  package: pkg,
>  status: gm.data?.status ?? args["--status"],
>  priority: gm.data?.priority ?? args["--priority"],
>  labels: Array.from(new Set([...(gm.data?.labels ?? []), ...(p.task.labels ?? [])]))
>  };
>  const final = matter.stringify(content, fm, { language: "yaml" });
>  await fs.writeFile(outPath, final, "utf-8");
> 
>  index.push(`- [${title}](${path.basename(outPath)}) — ${p.required}`);
>  }
>  await fs.writeFile(path.join(args["--out"], "README.md"), index.join("\n")+"\n", "utf-8");
>  console.log(`semverguard: wrote tasks → ${args["--out"]}`);
> }
> 
> async function readMaybe(p: string){ try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## Piper wiring (pipelines.yaml)
> 
> ```yaml
> pipelines:
>  - name: semver-guard
>  steps:
>  # 1) create/refresh current snapshot
>  - id: sv-snapshot
>  shell: "pnpm --filter @promethean/semverguard sv:01-snapshot --root packages --tsconfig ./tsconfig.json --out .cache/semverguard/snapshot.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/semverguard/snapshot.json"
> 
>  # 2) diff against baseline (option A: a committed file on main)
>  - id: sv-diff
>  deps: ["sv-snapshot"]
>  shell: "pnpm --filter @promethean/semverguard sv:02-diff --current .cache/semverguard/snapshot.json --baseline git:origin/main:.cache/semverguard/snapshot.json --out .cache/semverguard/diff.json"
>  inputs: [".cache/semverguard/snapshot.json"]
>  outputs: [".cache/semverguard/diff.json"]
> 
>  # 3) plan tasks (LLM short)
>  - id: sv-plan
>  deps: ["sv-diff"]
>  shell: "pnpm --filter @promethean/semverguard sv:03-plan --diff .cache/semverguard/diff.json --out .cache/semverguard/plans.json --model qwen3:4b"
>  inputs: [".cache/semverguard/diff.json"]
>  outputs: [".cache/semverguard/plans.json"]
> 
>  # 4) write task files
>  - id: sv-write
>  deps: ["sv-plan"]
>  shell: "pnpm --filter @promethean/semverguard sv:04-write --plans .cache/semverguard/plans.json --out docs/agile/tasks/semver"
>  inputs: [".cache/semverguard/plans.json"]
>  outputs: ["docs/agile/tasks/semver/*.md"]
> ```
> 
> > If you don’t have a baseline JSON committed on `main` yet, run:
> > ```
> > # on main
> > pnpm --filter @promethean/semverguard sv:01-snapshot --out .cache/semverguard/snapshot.json
> > git add .cache/semverguard/snapshot.json && git commit -m "semverguard baseline"
> > ```
> > Then on feature branches the pipeline will compare HEAD vs that committed baseline.
> 
> ---
> 
> ## Heuristics (quick reference)
> 
> - **major**
>  - removed exported symbol
>  - kind changed (e.g., `interface → type`)
>  - function: parameter removed, parameter made required, return type changed
>  - class: public method/prop removed; new required prop
> - **minor**
>  - new exported symbol
>  - function: optional parameters added at end
>  - class: new public method; new optional prop
>  - type/interface/enum signature changed (conservative)
> - **patch**
>  - new type/interface only (no runtime effect)
> - **none**
>  - no API deltas
> 
> You can tune these later (e.g., treat widened types as patch, etc.).
> 
> ---
> 
> ## Tiny mermaid of the flow
> 
> ```mermaid
> flowchart LR
>  A[snapshot current] --> B[diff vs baseline]
>  B --> C[plan with Ollama]
>  C --> D[write tasks]
> ```
> 
> If you want auto-bump PR stubs (`package.json` edits + CHANGELOG) as an optional step, I can add a `05-pr.ts` that writes a ready-to-commit branch dir for each package.
<!-- UID: ab07ecc8-47b6-4502-8a7f-1439220296b0 -->

---




>[!nexus_user] **User** - 08/31/2025 at 5:46 PM
> add step 05 to make prs
<!-- UID: 69c0f21a-5597-4ace-81db-edfc7e9b2a56 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 5:46 PM
> Awesome — here’s **Step 05: PR maker** for `@promethean/semverguard`, plus wiring.
> 
> ---
> 
> ## 1) Update `packages/semverguard/package.json`
> 
> Add the new script:
> 
> ```json
> {
>  "scripts": {
>  "sv:05-pr": "tsx src/05-pr.ts"
>  }
> }
> ```
> 
> ---
> 
> ## 2) New file: `packages/semverguard/src/05-pr.ts`
> 
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { exec as _exec } from "child_process";
> import { parseArgs, readJSON, writeJSON } from "./utils.js";
> 
> const exec = (cmd: string, cwd = process.cwd()) =>
>  new Promise<{ code: number | null; out: string; err: string }>((resolve) => {
>  const child = _exec(cmd, { cwd, maxBuffer: 1024 * 1024 * 64, env: { ...process.env } }, (err, stdout, stderr) => {
>  resolve({ code: err ? (err as any).code ?? 1 : 0, out: String(stdout), err: String(stderr) });
>  });
>  child.on("error", () => resolve({ code: 127, out: "", err: "spawn error" }));
>  });
> 
> const args = parseArgs({
>  "--plans": ".cache/semverguard/plans.json",
>  "--root": "packages",
>  "--out": ".cache/semverguard/pr",
>  "--mode": "prepare", // prepare | git
>  "--branch-prefix": "semver",
>  "--remote": "origin",
>  "--changelog": "CHANGELOG.md",
>  "--update-dependents": "true", // also bump internal deps that reference the changed package
>  "--dep-range": "preserve", // preserve | caret | tilde | exact
>  "--use-gh": "false" // if true, will call `gh pr create` for each branch
> });
> 
> type Plans = {
>  packages: Record<string, {
>  required: "major"|"minor"|"patch"|"none";
>  changes: Array<{ name: string; kind: string; detail: string; severity: string }>;
>  task: { title: string; summary: string; steps: string[]; acceptance: string[]; labels?: string[] }
>  }>;
> };
> 
> type PkgJson = { name: string; version: string; dependencies?: Record<string,string>; devDependencies?: Record<string,string>; peerDependencies?: Record<string,string>; };
> 
> function bump(v: string, kind: "major"|"minor"|"patch") {
>  const m = v.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
>  if (!m) return v;
>  let [_, a, b, c] = m; let A = +a, B = +b, C = +c;
>  if (kind === "major") return `${A+1}.0.0`;
>  if (kind === "minor") return `${A}.${B+1}.0`;
>  return `${A}.${B}.${C+1}`;
> }
> function rangeFor(ver: string, depRangeMode: string, existing?: string) {
>  if (depRangeMode === "caret") return `^${ver}`;
>  if (depRangeMode === "tilde") return `~${ver}`;
>  if (depRangeMode === "exact") return ver;
>  // preserve prefix (^, ~, >=, <=, workspace:, etc.)
>  if (!existing) return `^${ver}`;
>  if (/^workspace:/.test(existing)) {
>  const suf = existing.split(":")[1] || `^${ver}`;
>  const prefix = suf.startsWith("^") || suf.startsWith("~") ? suf[0] : "^";
>  return `workspace:${prefix}${ver}`;
>  }
>  const prefix = existing.match(/^(\^|~|>=|<=|>|<|=)/)?.[1] ?? "";
>  return `${prefix}${ver}`;
> }
> function today() {
>  const d = new Date();
>  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
> }
> async function readPkgJson(p: string): Promise<PkgJson> { return JSON.parse(await fs.readFile(p, "utf-8")); }
> async function writePkgJson(p: string, j: any) { await fs.writeFile(p, JSON.stringify(j, null, 2) + "\n", "utf-8"); }
> 
> async function ensureChangelog(pkgRoot: string, file: string) {
>  const p = path.join(pkgRoot, file);
>  try { await fs.access(p); } catch {
>  await fs.writeFile(p, `# Changelog\n\n`, "utf-8");
>  }
>  return p;
> }
> async function prependChangelog(chPath: string, version: string, required: string, changes: Plans["packages"][string]["changes"]) {
>  const head = `## ${version} — ${today()}\n\nRequired bump: \`${required}\`\n\n### Changes\n\n` +
>  (changes.length
>  ? changes.map(c => `- [${c.severity}] ${c.kind} \`${c.name}\` — ${c.detail}`).join("\n")
>  : "- Documentation / meta-only.\n") + "\n\n";
>  const prev = await fs.readFile(chPath, "utf-8");
>  if (new RegExp(`^##\\s+${version}\\b`, "m").test(prev)) return; // already has this version
>  await fs.writeFile(chPath, head + prev, "utf-8");
> }
> 
> function makePrTitle(pkgName: string, version: string, required: string) {
>  const scope = pkgName.includes("/") ? pkgName.split("/").pop()! : pkgName;
>  const tag = required === "major" ? "feat!" : required === "minor" ? "feat" : "fix";
>  return `${tag}(${scope}): release v${version} (semver: ${required})`;
> }
> function makePrBody(pkgName: string, oldV: string, newV: string, required: string, summary: string, changes: Plans["packages"][string]["changes"]) {
>  const table = [
>  "| Severity | Change |",
>  "|---|---|",
>  ...changes.map(c => `| ${c.severity} | ${c.kind} \`${c.name}\` — ${c.detail} |`)
>  ].join("\n");
>  return [
>  `# ${pkgName} v${newV} (${required})`,
>  "",
>  summary,
>  "",
>  `**Bump:** \`${oldV}\` → \`${newV}\``,
>  "",
>  "## API diff",
>  "",
>  table,
>  "",
>  "## Checklist",
>  "",
>  "- [ ] CHANGELOG updated",
>  "- [ ] Dependent packages install clean",
>  "- [ ] CI green",
>  ""
>  ].join("\n");
> }
> 
> async function loadWorkspacePackages(root: string) {
>  const dirs = await fs.readdir(root, { withFileTypes: true }).then(ents => ents.filter(e => e.isDirectory()).map(e => e.name));
>  const map = new Map<string, { dir: string; pkgPath: string; pkg: PkgJson }>();
>  for (const d of dirs) {
>  const pj = path.join(root, d, "package.json");
>  try {
>  const json = await readPkgJson(pj);
>  map.set(json.name || d, { dir: path.join(root, d), pkgPath: pj, pkg: json });
>  } catch { /* ignore */ }
>  }
>  return map;
> }
> 
> async function main() {
>  const plans = await readJSON<Plans>(path.resolve(args["--plans"]));
>  if (!plans) throw new Error("plans not found");
>  const ROOT = path.resolve(args["--root"]);
>  const OUT = path.resolve(args["--out"]);
>  const MODE = args["--mode"];
>  const UPDATE_DEPS = args["--update-dependents"] === "true";
>  const DEP_RANGE_MODE = args["--dep-range"];
>  const BR_PREFIX = args["--branch-prefix"];
>  const REMOTE = args["--remote"];
>  const CHANGELOG = args["--changelog"];
>  const USE_GH = args["--use-gh"] === "true";
> 
>  await fs.mkdir(OUT, { recursive: true });
> 
>  const workspace = await loadWorkspacePackages(ROOT);
> 
>  const summary: Array<{ pkg: string; old: string; next: string; branch: string; files: string[]; }> = [];
> 
>  // 1) apply version bumps + changelogs + dependent updates
>  for (const [pkgName, plan] of Object.entries(plans.packages)) {
>  if (!plan || plan.required === "none") continue;
>  const entry = workspace.get(pkgName);
>  if (!entry) { console.warn(`! package not found in workspace: ${pkgName}`); continue; }
> 
>  const oldV = entry.pkg.version || "0.0.0";
>  const nextV = bump(oldV, plan.required);
> 
>  // write package.json version
>  entry.pkg.version = nextV;
> 
>  // update dependents
>  const changedFiles = new Set<string>([entry.pkgPath]);
>  if (UPDATE_DEPS) {
>  for (const [depName, depEntry] of workspace) {
>  if (depName === pkgName) continue;
>  const kinds: Array<"dependencies"|"devDependencies"|"peerDependencies"> = ["dependencies","devDependencies","peerDependencies"];
>  let touch = false;
>  for (const k of kinds) {
>  const rec = depEntry.pkg[k]; if (!rec) continue;
>  if (rec[pkgName]) {
>  rec[pkgName] = rangeFor(nextV, DEP_RANGE_MODE, rec[pkgName]);
>  touch = true;
>  }
>  }
>  if (touch) {
>  await writePkgJson(depEntry.pkgPath, depEntry.pkg);
>  changedFiles.add(depEntry.pkgPath);
>  }
>  }
>  }
> 
>  // write bumped package.json
>  await writePkgJson(entry.pkgPath, entry.pkg);
> 
>  // update CHANGELOG
>  const chPath = await ensureChangelog(entry.dir, CHANGELOG);
>  await prependChangelog(chPath, `v${nextV}`, plan.required, plan.changes);
>  changedFiles.add(chPath);
> 
>  // write PR metadata
>  const prDir = path.join(OUT, pkgName.replace(/[\/@]/g, "_"));
>  await fs.mkdir(prDir, { recursive: true });
>  const title = makePrTitle(pkgName, nextV, plan.required);
>  const body = makePrBody(pkgName, oldV, nextV, plan.required, plan.task.summary, plan.changes);
>  await fs.writeFile(path.join(prDir, "PR_TITLE.txt"), title, "utf-8");
>  await fs.writeFile(path.join(prDir, "PR_BODY.md"), body, "utf-8");
>  await writeJSON(path.join(prDir, "info.json"), {
>  pkg: pkgName, from: oldV, to: nextV, required: plan.required,
>  changedFiles: Array.from(changedFiles)
>  });
> 
>  const branch = `${BR_PREFIX}/${pkgName.replace("@","").replace("/","-")}/v${nextV}`;
>  summary.push({ pkg: pkgName, old: oldV, next: nextV, branch, files: Array.from(changedFiles) });
> 
>  // 2) optionally, make a branch, commit, push
>  if (MODE === "git") {
>  const { code: ck } = await exec("git rev-parse --is-inside-work-tree");
>  if (ck !== 0) { console.error("Not a git repo; skipping git mode."); continue; }
> 
>  await exec(`git checkout -b ${branch}`).catch(()=>exec(`git checkout ${branch}`)); // create or reuse
>  const addList = Array.from(changedFiles).map(f => path.relative(process.cwd(), f)).join(" ");
>  await exec(`git add ${addList}`);
>  await exec(`git commit -m "${title}"`);
>  await exec(`git push ${REMOTE} ${branch}`);
> 
>  if (USE_GH) {
>  await exec(`gh pr create --fill --title "${title}" --body-file "${path.join(prDir, "PR_BODY.md")}"`).catch(() => {});
>  }
>  }
>  }
> 
>  // 3) write run summary
>  await writeJSON(path.join(OUT, "summary.json"), { createdAt: new Date().toISOString(), prs: summary });
>  console.log(`semverguard:05-pr — prepared ${summary.length} PR(s) → ${path.relative(process.cwd(), OUT)}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> **What it does (idempotent):**
> - Reads `plans.json`
> - Bumps each affected package’s `package.json` (`major|minor|patch`)
> - (Optional) Updates internal dependents’ ranges (`--update-dependents`)
> - Prepends a `CHANGELOG.md` entry (skips if that version already exists)
> - Writes PR title/body to `.cache/semverguard/pr/<pkg>/`
> - `--mode git` creates a branch per package, commits, pushes, and (optionally) calls `gh pr create`
> - Outputs `.cache/semverguard/pr/summary.json`
> 
> **Useful flags:**
> - `--dep-range preserve|caret|tilde|exact` (default: preserve existing prefix)
> - `--branch-prefix semver` → branches like `semver/<pkg>/v1.2.3`
> - `--use-gh true` → use GitHub CLI if available
> 
> ---
> 
> ## 3) Pipeline wiring (`pipelines.yaml`)
> 
> Append a step after `sv-write`:
> 
> ```yaml
>  - name: semver-guard
>  steps:
>  - id: sv-snapshot
>  shell: "pnpm --filter @promethean/semverguard sv:01-snapshot --root packages --tsconfig ./tsconfig.json --out .cache/semverguard/snapshot.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs: [".cache/semverguard/snapshot.json"]
> 
>  - id: sv-diff
>  deps: ["sv-snapshot"]
>  shell: "pnpm --filter @promethean/semverguard sv:02-diff --current .cache/semverguard/snapshot.json --baseline git:origin/main:.cache/semverguard/snapshot.json --out .cache/semverguard/diff.json"
>  inputs: [".cache/semverguard/snapshot.json"]
>  outputs: [".cache/semverguard/diff.json"]
> 
>  - id: sv-plan
>  deps: ["sv-diff"]
>  shell: "pnpm --filter @promethean/semverguard sv:03-plan --diff .cache/semverguard/diff.json --out .cache/semverguard/plans.json --model qwen3:4b"
>  inputs: [".cache/semverguard/diff.json"]
>  outputs: [".cache/semverguard/plans.json"]
> 
>  - id: sv-write
>  deps: ["sv-plan"]
>  shell: "pnpm --filter @promethean/semverguard sv:04-write --plans .cache/semverguard/plans.json --out docs/agile/tasks/semver"
>  inputs: [".cache/semverguard/plans.json"]
>  outputs: ["docs/agile/tasks/semver/*.md"]
> 
>  - id: sv-pr
>  deps: ["sv-write"]
>  shell: "pnpm --filter @promethean/semverguard sv:05-pr --plans .cache/semverguard/plans.json --root packages --mode prepare --update-dependents true --dep-range preserve"
>  inputs:
>  - ".cache/semverguard/plans.json"
>  - "packages/**/package.json"
>  outputs:
>  - ".cache/semverguard/pr/summary.json"
> ```
> 
> > To actually create branches/PRs, switch: 
> > `--mode git --use-gh true` (requires a git remote and `gh` CLI authenticated).
> 
> ---
> 
> ## 4) Quick use
> 
> ```bash
> pnpm -w --filter @promethean/semverguard build
> 
> # Prepare PRs (no git ops), see metadata + changed files:
> piper run semver-guard
> 
> # Create and push branches + (optionally) open PRs with gh:
> piper run semver-guard --force
> pnpm --filter @promethean/semverguard sv:05-pr --mode git --use-gh true --update-dependents true
> ```
> 
> Want me to also auto-bump **workspace dependents’** `peerDependencies` more conservatively (only widen if needed), or generate a **combined release PR** per *scope* instead of per package? I can extend `05-pr.ts` with grouping strategies.
<!-- UID: f3899169-4ba4-4942-9fba-298d15980eb5 -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:01 PM
> We need pipelines.yml files for the first two pipelines we made (docops and codepack)
<!-- UID: ba72270b-fac2-416d-8502-cab93ed5afbc -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:01 PM
> sweet — here are **separate** `pipelines.yml` files you can drop in and run with `piper --config <file> run <pipeline>`.
> 
> ---
> 
> ### `pipelines.docops.yml`
> 
> ```yaml
> pipelines:
>  - name: docops
>  steps:
>  # a) Ensure / complete front matter (filename/description/tags/uuid)
>  - id: do-fm
>  shell: >
>  pnpm --filter @promethean/docops
>  do:01-fm-ensure
>  --root docs/unique
>  --out .cache/docops/frontmatters.json
>  --model qwen3:4b
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - "docs/unique/**/*.md"
>  outputs:
>  - ".cache/docops/frontmatters.json"
> 
>  # b) Chunk + embed (language-aware tokenizer) and build index
>  - id: do-index
>  deps: ["do-fm"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:02-chunk-embed
>  --root docs/unique
>  --in .cache/docops/frontmatters.json
>  --chunks .cache/docops/chunks.json
>  --embeddings .cache/docops/embeddings.json
>  --tokenizer cl100k
>  --embed-model nomic-embed-text:latest
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - "docs/unique/**/*.md"
>  - ".cache/docops/frontmatters.json"
>  outputs:
>  - ".cache/docops/chunks.json"
>  - ".cache/docops/embeddings.json"
> 
>  # c) Cross-document similarity queries (cache per-chunk results)
>  - id: do-similarity
>  deps: ["do-index"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:03-similarity
>  --chunks .cache/docops/chunks.json
>  --embeddings .cache/docops/embeddings.json
>  --out .cache/docops/queries.json
>  inputs:
>  - ".cache/docops/chunks.json"
>  - ".cache/docops/embeddings.json"
>  outputs:
>  - ".cache/docops/queries.json"
> 
>  # d) Compute related-doc scores (doc↔doc)
>  - id: do-related
>  deps: ["do-similarity"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:04-related
>  --queries .cache/docops/queries.json
>  --frontmatter .cache/docops/frontmatters.json
>  --threshold 0.62
>  --out .cache/docops/related.json
>  inputs:
>  - ".cache/docops/queries.json"
>  - ".cache/docops/frontmatters.json"
>  outputs:
>  - ".cache/docops/related.json"
> 
>  # e) High-scoring references (chunk-level, with line/col)
>  - id: do-references
>  deps: ["do-similarity"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:05-references
>  --queries .cache/docops/queries.json
>  --chunks .cache/docops/chunks.json
>  --ref-threshold 0.75
>  --out .cache/docops/references.json
>  inputs:
>  - ".cache/docops/queries.json"
>  - ".cache/docops/chunks.json"
>  outputs:
>  - ".cache/docops/references.json"
> 
>  # f) Apply FM updates (add related & references into FM only)
>  - id: do-apply-fm
>  deps: ["do-related","do-references"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:06-apply-frontmatter
>  --root docs/unique
>  --frontmatter .cache/docops/frontmatters.json
>  --related .cache/docops/related.json
>  --references .cache/docops/references.json
>  inputs:
>  - ".cache/docops/frontmatters.json"
>  - ".cache/docops/related.json"
>  - ".cache/docops/references.json"
>  outputs:
>  - ".cache/docops/applied-fm.touch"
> 
>  # g) Footer writer (markdown with line anchors)
>  - id: do-footer
>  deps: ["do-apply-fm"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:07-write-footer
>  --root docs/unique
>  --references .cache/docops/references.json
>  --related .cache/docops/related.json
>  --style obsidian
>  inputs:
>  - ".cache/docops/references.json"
>  - ".cache/docops/related.json"
>  - "docs/unique/**/*.md"
>  outputs:
>  - ".cache/docops/footer.touch"
> 
>  # h) Optional rename pass (based on generated titles)
>  - id: do-rename
>  deps: ["do-apply-fm"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:08-rename
>  --root docs/unique
>  --frontmatter .cache/docops/frontmatters.json
>  --out .cache/docops/renames.json
>  inputs:
>  - ".cache/docops/frontmatters.json"
>  outputs:
>  - ".cache/docops/renames.json"
> ```
> 
> ---
> 
> ### `pipelines.codepack.yml`
> 
> ```yaml
> pipelines:
>  - name: codepack
>  steps:
>  # 1) Extract code blocks + surrounding context from docs (and optionally READMEs)
>  - id: cp-extract
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:01-extract
>  --roots docs packages
>  --out .cache/codepack/blocks.json
>  --max-context-lines 12
>  inputs:
>  - "docs/**/*.md"
>  - "README.md"
>  outputs:
>  - ".cache/codepack/blocks.json"
> 
>  # 2) Embed all blocks
>  - id: cp-embed
>  deps: ["cp-extract"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:02-embed
>  --in .cache/codepack/blocks.json
>  --out .cache/codepack/embeddings.json
>  --model nomic-embed-text:latest
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/codepack/blocks.json"
>  outputs:
>  - ".cache/codepack/embeddings.json"
> 
>  # 3) Identify similar blocks (clustering / top-k nearest)
>  - id: cp-cluster
>  deps: ["cp-embed"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:03-cluster
>  --embeddings .cache/codepack/embeddings.json
>  --min-sim 0.83
>  --min-size 2
>  --out .cache/codepack/clusters.json
>  inputs:
>  - ".cache/codepack/embeddings.json"
>  outputs:
>  - ".cache/codepack/clusters.json"
> 
>  # 4) Plan folder paths + filenames + README per cluster (LLM)
>  - id: cp-plan
>  deps: ["cp-cluster"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:04-plan
>  --blocks .cache/codepack/blocks.json
>  --clusters .cache/codepack/clusters.json
>  --model qwen3:4b
>  --out .cache/codepack/plan.json
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/codepack/blocks.json"
>  - ".cache/codepack/clusters.json"
>  outputs:
>  - ".cache/codepack/plan.json"
> 
>  # 5) Materialize file tree under ./pseudo from the plan
>  - id: cp-generate
>  deps: ["cp-plan"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:05-generate
>  --plan .cache/codepack/plan.json
>  --base pseudo
>  --overwrite false
>  --readme true
>  inputs:
>  - ".cache/codepack/plan.json"
>  outputs:
>  - "pseudo/**"
>  - ".cache/codepack/generate.touch"
> ```
> 
> ---
> 
> If any script names differ in your repo, keep the step IDs the same but tweak the `shell` lines. 
> Run them like:
> 
> ```bash
> # docops
> piper --config pipelines.docops.yml run docops
> 
> # codepack
> piper --config pipelines.codepack.yml run codepack
> ```
> 
> Want me to merge both into a single monorepo-wide `pipelines.yaml` (and add watch targets)?
<!-- UID: 9af50f19-dab0-4e9c-930d-c76628d08151 -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:08 PM
> doit
<!-- UID: 04835fc0-acc3-4ea8-b9c9-311724059cde -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:08 PM
> here you go — a single monorepo-wide `pipelines.yaml` that includes **both** pipelines (docops + codepack) and a convenience **workspace-all** pipeline. drop this at the repo root.
> 
> ```yaml
> pipelines:
>  # ---------- DOCOPS ----------
>  - name: docops
>  steps:
>  - id: do-fm
>  shell: >
>  pnpm --filter @promethean/docops
>  do:01-fm-ensure
>  --root docs/unique
>  --out .cache/docops/frontmatters.json
>  --model qwen3:4b
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - "docs/unique/**/*.md"
>  outputs:
>  - ".cache/docops/frontmatters.json"
> 
>  - id: do-index
>  deps: ["do-fm"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:02-chunk-embed
>  --root docs/unique
>  --in .cache/docops/frontmatters.json
>  --chunks .cache/docops/chunks.json
>  --embeddings .cache/docops/embeddings.json
>  --tokenizer cl100k
>  --embed-model nomic-embed-text:latest
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - "docs/unique/**/*.md"
>  - ".cache/docops/frontmatters.json"
>  outputs:
>  - ".cache/docops/chunks.json"
>  - ".cache/docops/embeddings.json"
> 
>  - id: do-similarity
>  deps: ["do-index"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:03-similarity
>  --chunks .cache/docops/chunks.json
>  --embeddings .cache/docops/embeddings.json
>  --out .cache/docops/queries.json
>  inputs:
>  - ".cache/docops/chunks.json"
>  - ".cache/docops/embeddings.json"
>  outputs:
>  - ".cache/docops/queries.json"
> 
>  - id: do-related
>  deps: ["do-similarity"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:04-related
>  --queries .cache/docops/queries.json
>  --frontmatter .cache/docops/frontmatters.json
>  --threshold 0.62
>  --out .cache/docops/related.json
>  inputs:
>  - ".cache/docops/queries.json"
>  - ".cache/docops/frontmatters.json"
>  outputs:
>  - ".cache/docops/related.json"
> 
>  - id: do-references
>  deps: ["do-similarity"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:05-references
>  --queries .cache/docops/queries.json
>  --chunks .cache/docops/chunks.json
>  --ref-threshold 0.75
>  --out .cache/docops/references.json
>  inputs:
>  - ".cache/docops/queries.json"
>  - ".cache/docops/chunks.json"
>  outputs:
>  - ".cache/docops/references.json"
> 
>  - id: do-apply-fm
>  deps: ["do-related","do-references"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:06-apply-frontmatter
>  --root docs/unique
>  --frontmatter .cache/docops/frontmatters.json
>  --related .cache/docops/related.json
>  --references .cache/docops/references.json
>  inputs:
>  - ".cache/docops/frontmatters.json"
>  - ".cache/docops/related.json"
>  - ".cache/docops/references.json"
>  outputs:
>  - ".cache/docops/applied-fm.touch"
> 
>  - id: do-footer
>  deps: ["do-apply-fm"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:07-write-footer
>  --root docs/unique
>  --references .cache/docops/references.json
>  --related .cache/docops/related.json
>  --style obsidian
>  inputs:
>  - ".cache/docops/references.json"
>  - ".cache/docops/related.json"
>  - "docs/unique/**/*.md"
>  outputs:
>  - ".cache/docops/footer.touch"
> 
>  - id: do-rename
>  deps: ["do-apply-fm"]
>  shell: >
>  pnpm --filter @promethean/docops
>  do:08-rename
>  --root docs/unique
>  --frontmatter .cache/docops/frontmatters.json
>  --out .cache/docops/renames.json
>  inputs:
>  - ".cache/docops/frontmatters.json"
>  outputs:
>  - ".cache/docops/renames.json"
> 
>  # ---------- CODEPACK ----------
>  - name: codepack
>  steps:
>  - id: cp-extract
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:01-extract
>  --roots docs packages
>  --out .cache/codepack/blocks.json
>  --max-context-lines 12
>  inputs:
>  - "docs/**/*.md"
>  - "README.md"
>  outputs:
>  - ".cache/codepack/blocks.json"
> 
>  - id: cp-embed
>  deps: ["cp-extract"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:02-embed
>  --in .cache/codepack/blocks.json
>  --out .cache/codepack/embeddings.json
>  --model nomic-embed-text:latest
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/codepack/blocks.json"
>  outputs:
>  - ".cache/codepack/embeddings.json"
> 
>  - id: cp-cluster
>  deps: ["cp-embed"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:03-cluster
>  --embeddings .cache/codepack/embeddings.json
>  --min-sim 0.83
>  --min-size 2
>  --out .cache/codepack/clusters.json
>  inputs:
>  - ".cache/codepack/embeddings.json"
>  outputs:
>  - ".cache/codepack/clusters.json"
> 
>  - id: cp-plan
>  deps: ["cp-cluster"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:04-plan
>  --blocks .cache/codepack/blocks.json
>  --clusters .cache/codepack/clusters.json
>  --model qwen3:4b
>  --out .cache/codepack/plan.json
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/codepack/blocks.json"
>  - ".cache/codepack/clusters.json"
>  outputs:
>  - ".cache/codepack/plan.json"
> 
>  - id: cp-generate
>  deps: ["cp-plan"]
>  shell: >
>  pnpm --filter @promethean/codepack
>  cp:05-generate
>  --plan .cache/codepack/plan.json
>  --base pseudo
>  --overwrite false
>  --readme true
>  inputs:
>  - ".cache/codepack/plan.json"
>  outputs:
>  - "pseudo/**"
>  - ".cache/codepack/generate.touch"
> 
>  # ---------- CONVENIENCE: run both ----------
>  - name: workspace-all
>  steps:
>  - id: run-docops
>  shell: "piper --config pipelines.yaml run docops"
>  inputs:
>  - "docs/unique/**/*.md"
>  outputs:
>  - ".cache/docops/footer.touch"
>  - id: run-codepack
>  deps: ["run-docops"]
>  shell: "piper --config pipelines.yaml run codepack"
>  inputs:
>  - "docs/**/*.md"
>  outputs:
>  - ".cache/codepack/generate.touch"
> ```
> 
> ### run it
> 
> ```bash
> # list
> piper list
> 
> # run individually
> piper run docops
> piper run codepack
> 
> # or both, in order
> piper run workspace-all
> 
> # watch (use two terminals)
> piper watch docops
> piper watch codepack
> ```
> 
> > note: set `OLLAMA_URL` in your env (e.g., `export OLLAMA_URL=http://localhost:11434`).
<!-- UID: b0d2a481-63f9-428f-852b-2be02ff87cd9 -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:10 PM
> let's summarize what we've done so far.
<!-- UID: 3872a732-4831-4626-9fe9-da8409ce5893 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:10 PM
> here’s the high-level snapshot of what we’ve built together, plus how it all fits.
> 
> # Core themes
> - Everything is a **small, idempotent CLI step**.
> - Steps compose into **pipelines** (DAGs) with caching and reports.
> - We lean on **Ollama** (LLMs + embeddings), **ts-morph**, and **simple JSON caches**.
> 
> # New packages & what they do
> 
> ## 1) `@promethean/docops`
> Document enrichment for `docs/unique`:
> - Extracts or completes **front matter** (filename, description, tags, uuid).
> - **Chunks** docs with a language-aware tokenizer; embeds; builds indexes.
> - Runs **cross-document similarity**, computes **related docs**, and **references** (chunk-level with line/col).
> - Applies FM updates and writes **footer sections** (markdown ).
> - Safe to re-run; uses caches for chunks/embeddings/queries.
> 
> ## 2) `@promethean/codepack`
> From documentation → working pseudo repo:
> - Extracts **code blocks + surrounding context** from a directory tree.
> - Embeds and clusters to find **similar code**.
> - LLM names a **directory path**, filenames, and **README** per cluster.
> - **Materializes** a file tree under `./pseudo/`.
> 
> ## 3) `@promethean/simtasks` (foundation used by codemods)
> - Scans workspace, embeds functions, clusters by similarity.
> - Generates **consolidation plans** & package graph/tasks.
> 
> ## 4) `@promethean/codemods`
> Refactors duplicates toward a canonical API:
> - **Spec builder** with **parameter extraction** and **arg mapping** by name.
> - **Codemod generator** that **reorders callsite args** and fixes imports.
> - **Runner** with dry-run/apply, diffs, and optional cleanup of emptied dup files.
> - **Verify step** (`04-verify`) that runs `tsc/build/test` and produces reports + deltas.
> 
> ## 5) `@promethean/piper`
> A tiny **pipeline runner**:
> - YAML-defined pipelines, **content-hash** caching, concurrency, watch mode.
> - Writes per-run **markdown reports** and maintains state in `.cache/piper`.
> 
> ## 6) `@promethean/sonarflow`
> SonarQube → actionable tasks:
> - Runs/fetches **Sonar issues**, bundles by **rule/path**, plans concise tasks with Ollama, and writes **task files** under `docs/agile/tasks/sonar`.
> 
> ## 7) `@promethean/boardrev`
> Board review automation:
> - Ensures task **front matter**.
> - Slices **Process.md** into **per-column prompts**.
> - Indexes repo docs/code, finds **relevant context** per task.
> - LLM **evaluates status** + suggests **next actions**.
> - Generates **board reports** in `docs/agile/reports`.
> 
> ## 8) `@promethean/semverguard`
> API change governance:
> - Snapshots **exported API** per package; diffs vs baseline (or `git:<ref>`).
> - Computes required **major/minor/patch** and drafts migration tasks.
> - Writes **semver tasks** under `docs/agile/tasks/semver`.
> - **Step 05: PR maker**: bumps versions, updates dependents (configurable ranges), prepends **CHANGELOG**, prepares branches/PR metadata; optional `--mode git` to push and open PRs.
> 
> # Pipelines we wired
> 
> ```mermaid
> flowchart LR
>  subgraph DocOps
>  DOFM[FM ensure] --> DOIDX[Chunk+Embed]
>  DOIDX --> DOSIM[Cross-sim]
>  DOSIM --> DOREL[Related]
>  DOSIM --> DORF[References]
>  DOREL --> DOAPPLY[Apply FM]
>  DORF --> DOAPPLY
>  DOAPPLY --> DOFOOT[Footer]
>  DOAPPLY --> DORENAME[Rename]
>  end
> 
>  subgraph Codepack
>  CPEX[Extract blocks] --> CPEMB[Embed]
>  CPEMB --> CPCL[Cluster]
>  CPCL --> CPPLAN[Plan names/paths]
>  CPPLAN --> CPGEN[Generate pseudo/]
>  end
> 
>  subgraph Sim+Codemods
>  SIMSCAN[Scan+Embed+Cluster] --> CM01[Specs (param maps)]
>  CM01 --> CM02[Generate transforms]
>  CM02 --> CM03[Run (dry/apply)]
>  CM03 --> CM04[Verify]
>  end
> 
>  subgraph Quality/Agile
>  SONAR[Sonar fetch] --> SPLAN[Plan tasks] --> SWRITE[Write tasks]
>  BRFM[Board FM] --> BRIDX[Repo index] --> BRCTX[Task context] --> BREV[Evaluate] --> BRREP[Report]
>  SVSNAP[API snapshot] --> SVDIFF[Diff] --> SVPLAN[Plan] --> SVWRITE[Write tasks] --> SVPR[Make PRs]
>  end
> ```
> 
> # Repo-level configs we added
> - **`pipelines.yaml`**: unified pipelines for **docops**, **codepack**, and a **workspace-all** convenience target.
> - Equivalent split configs `pipelines.docops.yml` and `pipelines.codepack.yml` if you want them separate.
> 
> # How to run (quick)
> ```bash
> # build tool packages as needed
> pnpm -w i
> 
> # docops (front matter → related/ref → footer/rename)
> piper run docops
> 
> # codepack (extract/cluster/plan/generate)
> piper run codepack
> 
> # codemods (example full flow)
> piper run codemods
> pnpm --filter @promethean/codemods mods:04-verify:after
> 
> # sonar → tasks
> piper run sonar
> 
> # board review → report
> piper run board-review
> 
> # semver guard → tasks → PR prep
> piper run semver-guard
> pnpm --filter @promethean/semverguard sv:05-pr --mode prepare # or --mode git --use-gh true
> ```
> 
> # What’s nice about this setup
> - **Idempotent**: re-runs are cheap; everything keys off cache fingerprints.
> - **Composable**: small CLIs with plain JSON inputs/outputs.
> - **Traceable**: every pipeline writes a human **markdown report**.
> 
> # Suggested near-term polish
> - Add a **global `.env` loader** in piper (e.g., `--env-file .env`) so OLLAMA/SONAR vars are automatic.
> - Board review: per-path **owner map** (prefix → team/assignee) to automate assignment.
> - Semverguard: option to **group PRs** by scope (one PR per area), and CI job to **fail** on uncommitted snapshot deltas.
> - Docops: optional **Obsidian-safe FM size cap** with overflow to a sidecar JSON index.
> 
> If you want, I can generate a one-pager README for each package or a top-level “how it all works” doc to every CLI and cache file.
<!-- UID: b21da4a4-b297-4bbc-9bbf-cf943a9951ef -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:11 PM
> actually, we need a pipeline to generate the readmes XD
<!-- UID: 47920c2f-6e5a-44dc-9f52-efe7372e21ac -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:11 PM
> heck yes — let’s add a turnkey **Readme generator** pipeline. It scans each package, drafts a tight outline with Ollama, then writes/upgrades `README.md` files (mermaid diagrams included), and verifies .
> 
> Below is a small package **@promethean/readmeflow** + a **`readmes`** pipeline you can drop into your existing `pipelines.yaml`.
> 
> ---
> 
> # `packages/readmeflow/`
> 
> ```
> packages/readmeflow/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-scan.ts
>  02-outline.ts
>  03-write.ts
>  04-verify.ts
> ```
> 
> ### package.json
> ```json
> {
>  "name": "@promethean/readmeflow",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "readmeflow-scan": "dist/01-scan.js",
>  "readmeflow-outline": "dist/02-outline.js",
>  "readmeflow-write": "dist/03-write.js",
>  "readmeflow-verify": "dist/04-verify.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "rm:01-scan": "tsx src/01-scan.ts",
>  "rm:02-outline": "tsx src/02-outline.ts",
>  "rm:03-write": "tsx src/03-write.ts",
>  "rm:04-verify": "tsx src/04-verify.ts",
>  "rm:all": "pnpm rm:01-scan && pnpm rm:02-outline && pnpm rm:03-write && pnpm rm:04-verify"
>  },
>  "dependencies": {
>  "globby": "^14.0.2",
>  "gray-matter": "^4.0.3",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ### tsconfig.json
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "outDir": "dist",
>  "strict": true,
>  "skipLibCheck": true,
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ### src/types.ts
> ```ts
> export type PkgInfo = {
>  name: string;
>  version: string;
>  dir: string;
>  description?: string;
>  bin?: Record<string,string>;
>  scripts?: Record<string,string>;
>  dependencies?: Record<string,string>;
>  devDependencies?: Record<string,string>;
>  peerDependencies?: Record<string,string>;
>  workspaceDeps: string[]; // internal deps
>  hasTsConfig: boolean;
>  readme?: string; // existing README content (if any)
> };
> 
> export type ScanOut = {
>  createdAt: string;
>  packages: PkgInfo[];
>  graphMermaid: string;
> };
> 
> export type Outline = {
>  name: string;
>  title: string;
>  tagline: string;
>  sections: Array<{ heading: string; body: string }>;
>  includeTOC: boolean;
>  badges?: string[];
> };
> 
> export type OutlinesFile = { plannedAt: string; outlines: Record<string, Outline> };
> 
> export type VerifyReport = {
>  checkedAt: string;
>  results: Array<{ pkg: string; broken: string[] }>;
> };
> ```
> 
> ### src/utils.ts
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(def: Record<string,string>) {
>  const out = { ...def }; const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> 
> export async function readMaybe(p: string) { try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }
> export async function writeJSON(p: string, data: any) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }
> export async function writeText(p: string, s: string) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, s, "utf-8"); }
> 
> export function slug(s: string) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
> 
> export async function ollamaJSON(model: string, prompt: string): Promise<any> {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST", headers: { "Content-Type": "application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
> }
> ```
> 
> ### src/01-scan.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import globby from "globby";
> import { parseArgs, readMaybe, writeJSON } from "./utils.js";
> import type { PkgInfo, ScanOut } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--out": ".cache/readmes/scan.json"
> });
> 
> async function main() {
>  const ROOT = path.resolve(args["--root"]);
>  const dirs = (await fs.readdir(ROOT, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name);
> 
>  const pkgMap = new Map<string, PkgInfo>();
>  for (const d of dirs) {
>  const dir = path.join(ROOT, d);
>  const pj = path.join(dir, "package.json");
>  try {
>  const json = JSON.parse(await fs.readFile(pj, "utf-8"));
>  const name = json.name ?? d;
>  const info: PkgInfo = {
>  name, version: json.version ?? "0.0.0", dir,
>  description: json.description, bin: json.bin, scripts: json.scripts,
>  dependencies: json.dependencies, devDependencies: json.devDependencies, peerDependencies: json.peerDependencies,
>  workspaceDeps: [], hasTsConfig: !!(await readMaybe(path.join(dir, "tsconfig.json"))),
>  readme: await readMaybe(path.join(dir, "README.md"))
>  };
>  pkgMap.set(name, info);
>  } catch { /* skip */ }
>  }
> 
>  // compute workspace internal deps
>  for (const info of pkgMap.values()) {
>  const all = { ...(info.dependencies ?? {}), ...(info.devDependencies ?? {}), ...(info.peerDependencies ?? {}) };
>  const internal = Object.keys(all).filter(n => pkgMap.has(n));
>  info.workspaceDeps = internal;
>  }
> 
>  // mermaid graph (packages and internal deps)
>  const lines: string[] = ["flowchart LR"];
>  for (const [name, info] of pkgMap) {
>  const id = name.replace(/[^a-zA-Z0-9]/g, "_");
>  lines.push(` ${id}["${name}\\n${info.version}"]`);
>  }
>  for (const [name, info] of pkgMap) {
>  const from = name.replace(/[^a-zA-Z0-9]/g, "_");
>  for (const dep of info.workspaceDeps) {
>  const to = dep.replace(/[^a-zA-Z0-9]/g, "_");
>  lines.push(` ${from} --> ${to}`);
>  }
>  }
> 
>  const out: ScanOut = { createdAt: new Date().toISOString(), packages: Array.from(pkgMap.values()), graphMermaid: lines.join("\n") };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`readmeflow: scanned ${pkgMap.size} packages → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/02-outline.ts
> ```ts
> /* eslint-disable no-console */
> import { z } from "zod";
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, ollamaJSON, writeJSON } from "./utils.js";
> import type { ScanOut, Outline, OutlinesFile } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/readmes/scan.json",
>  "--out": ".cache/readmes/outlines.json",
>  "--model": "qwen3:4b"
> });
> 
> const OutlineSchema = z.object({
>  title: z.string().min(1),
>  tagline: z.string().min(1),
>  includeTOC: z.boolean().optional().default(true),
>  sections: z.array(z.object({ heading: z.string().min(1), body: z.string().min(1) })).min(3),
>  badges: z.array(z.string()).optional()
> });
> 
> async function main() {
>  const scan = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8")) as ScanOut;
>  const outlines: Record<string, Outline> = {};
> 
>  for (const pkg of scan.packages) {
>  const sys = [
>  "You write tight, practical READMEs for dev tools. Use short sections and code blocks when useful.",
>  "Return ONLY JSON: { title, tagline, includeTOC?, sections:[{heading, body}], badges?[] }",
>  "Prefer concise install, quickstart, CLI/API usage, configuration, and troubleshooting."
>  ].join("\n");
> 
>  const user = [
>  `PACKAGE: ${pkg.name} v${pkg.version}`,
>  `DESC: ${pkg.description ?? "(none)"}`,
>  `HAS_TS: ${pkg.hasTsConfig}`,
>  `BIN: ${Object.keys(pkg.bin ?? {}).join(", ") || "(none)"}`,
>  `SCRIPTS: ${Object.keys(pkg.scripts ?? {}).slice(0,8).join(", ") || "(none)"}`,
>  `INTERNAL_DEPS: ${pkg.workspaceDeps.join(", ") || "(none)"}`,
>  "",
>  "If the package is a CLI, include a 'Commands' section with examples.",
>  "If it's a library, include a 'Quickstart' import/usage snippet.",
>  "If the repo uses Piper pipelines, mention how to run the relevant pipeline."
>  ].join("\n");
> 
>  let obj: any;
>  try { obj = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`); }
>  catch {
>  obj = { title: pkg.name, tagline: pkg.description ?? "", includeTOC: true, sections: [
>  { heading: "Install", body: "```bash\npnpm -w add -D " + pkg.name + "\n```" },
>  { heading: "Quickstart", body: "```ts\n// usage example\n```" },
>  { heading: "Commands", body: Object.keys(pkg.scripts ?? {}).map(k => `- \`${k}\``).join("\n") || "N/A" }
>  ] };
>  }
>  const parsed = OutlineSchema.safeParse(obj);
>  const outline = parsed.success ? parsed.data : { title: pkg.name, tagline: pkg.description ?? "", includeTOC: true, sections: [{heading:"Install", body:"pnpm add " + pkg.name},{heading:"Usage", body:"(coming soon)"},{heading:"License", body:"MIT"}] };
> 
>  outlines[pkg.name] = { name: pkg.name, ...outline };
>  }
> 
>  const out: OutlinesFile = { plannedAt: new Date().toISOString(), outlines };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`readmeflow: outlined ${Object.keys(outlines).length} README(s) → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/03-write.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import matter from "gray-matter";
> import { parseArgs, writeText, readMaybe } from "./utils.js";
> import type { ScanOut, OutlinesFile } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/readmes/scan.json",
>  "--outlines": ".cache/readmes/outlines.json",
>  "--mermaid": "true"
> });
> 
> const START="<!-- READMEFLOW:BEGIN -->";
> const END ="<!-- READMEFLOW:END -->";
> 
> function stripGenerated(text: string) {
>  const si = text.indexOf(START), ei = text.indexOf(END);
>  if (si>=0 && ei>si) return (text.slice(0, si).trimEnd()+"\n").trimEnd();
>  return text.trimEnd();
> }
> 
> function makeReadme(pkg: any, outline: any, mermaid?: string) {
>  const toc = outline.includeTOC ? "[TOC]\n\n" : "";
>  const sec = outline.sections.map((s: any) => `## ${s.heading}\n\n${s.body}\n`).join("\n");
>  const badges = (outline.badges ?? []).join(" ");
>  const diag = mermaid ? `\n### Package graph\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n` : "";
> 
>  return [
>  START,
>  `# ${outline.title}`,
>  badges ? `\n${badges}\n` : "",
>  `${outline.tagline}\n`,
>  toc,
>  sec,
>  diag,
>  END,
>  ""
>  ].join("\n");
> }
> 
> async function main() {
>  const scan = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8")) as ScanOut;
>  const outlines = JSON.parse(await fs.readFile(path.resolve(args["--outlines"]), "utf-8")) as OutlinesFile;
> 
>  for (const pkg of scan.packages) {
>  const out = outlines.outlines[pkg.name];
>  if (!out) continue;
> 
>  const readmePath = path.join(pkg.dir, "README.md");
>  const existing = await readMaybe(readmePath);
>  const gm = existing ? matter(existing) : { content: "", data: {} as any };
> 
>  const content = (stripGenerated(gm.content) ? stripGenerated(gm.content) + "\n\n" : "") +
>  makeReadme(pkg, out, (args["--mermaid"] === "true") ? scan.graphMermaid : undefined);
> 
>  const fm = { ...(gm as any).data };
>  const final = matter.stringify(content, fm, { language: "yaml" });
>  await writeText(readmePath, final);
>  }
>  console.log(`readmeflow: wrote ${scan.packages.length} README(s)`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/04-verify.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import globby from "globby";
> import { parseArgs, writeText } from "./utils.js";
> import type { VerifyReport } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--out": "docs/agile/reports/readmes",
>  "--max": "200"
> });
> 
> async function main() {
>  const pkgs = await fs.readdir(path.resolve(args["--root"]), { withFileTypes: true }).then(ents => ents.filter(e => e.isDirectory()).map(e => path.join(args["--root"], e.name)));
>  const results: VerifyReport["results"] = [];
> 
>  for (const dir of pkgs) {
>  const readme = path.join(dir, "README.md");
>  try { await fs.access(readme); } catch { continue; }
>  const raw = await fs.readFile(readme, "utf-8");
>  const = Array.from(raw.matchAll(/\[[^\]]+?\]\(([^)]+)\)/g)).map(m => m[1]).filter(h => !h.startsWith("http"));
>  const broken: string[] = [];
>  for (const href of .slice(0, Number(args["--max"]))) {
>  const target = path.resolve(dir, href.split("#")[0]);
>  try { await fs.access(target); } catch { broken.push(href); }
>  }
>  if (broken.length) results.push({ pkg: dir.split("/").pop()!, broken });
>  }
> 
>  const ts = new Date().toISOString().replace(/[:.]/g,"-");
>  const md = [
>  "# README link check",
>  "",
>  results.length ? results.map(r => `- **${r.pkg}**:\n${r.broken.map(b => ` - ${b}`).join("\n")}`).join("\n") : "_No broken relative found._",
>  ""
>  ].join("\n");
> 
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
>  await writeText(path.join(args["--out"], `readmes-${ts}.md`), md);
>  await writeText(path.join(args["--out"], `README.md`), `# Readme Reports\n\n- [Latest](readmes-${ts}.md)\n`);
>  console.log(`readmeflow: verify report → ${path.join(args["--out"], `readmes-${ts}.md`)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## Add a pipeline to `pipelines.yaml`
> 
> Append this **readmes** pipeline:
> 
> ```yaml
> pipelines:
>  - name: readmes
>  steps:
>  - id: rm-scan
>  shell: "pnpm --filter @promethean/readmeflow rm:01-scan --root packages --out .cache/readmes/scan.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/tsconfig.json"
>  outputs:
>  - ".cache/readmes/scan.json"
> 
>  - id: rm-outline
>  deps: ["rm-scan"]
>  shell: "pnpm --filter @promethean/readmeflow rm:02-outline --scan .cache/readmes/scan.json --out .cache/readmes/outlines.json --model qwen3:4b"
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/readmes/scan.json"
>  outputs:
>  - ".cache/readmes/outlines.json"
> 
>  - id: rm-write
>  deps: ["rm-outline"]
>  shell: "pnpm --filter @promethean/readmeflow rm:03-write --scan .cache/readmes/scan.json --outlines .cache/readmes/outlines.json --mermaid true"
>  inputs:
>  - ".cache/readmes/outlines.json"
>  outputs:
>  - "packages/**/README.md"
> 
>  - id: rm-verify
>  deps: ["rm-write"]
>  shell: "pnpm --filter @promethean/readmeflow rm:04-verify --root packages --out docs/agile/reports/readmes"
>  inputs:
>  - "packages/**/README.md"
>  outputs:
>  - "docs/agile/reports/readmes/*.md"
> ```
> 
> > If you like, add this under your existing **workspace-all** pipeline after docops/codepack to regenerate READMEs as a final pass.
> 
> ---
> 
> ## How to use
> 
> ```bash
> pnpm -w i
> pnpm -w --filter @promethean/readmeflow build
> 
> # generate all package READMEs
> piper run readmes
> 
> # (optional) watch for changes to package.json to re-outline
> piper watch readmes
> ```
> 
> This will produce clean, consistent READMEs with **mermaid graphs**, **TOC**, and **idempotent markers** so your manual notes stay intact. If you want a **root README** aggregator or badges (CI, coverage) auto-wiring, I can tack on a tiny `05-root.ts` step.
<!-- UID: d1c5ed1d-d711-49b4-998c-f4edd1425e0a -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:18 PM
> how would a cookbook pipeline differ from the codepack pipeline?
<!-- UID: f30bf4e9-3371-4621-9c29-d4da83a12160 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:18 PM
> great question. short version: **codepack** turns scattered code blocks into a pseudo repo organized by *code similarity*; a **cookbook** turns those (and fresh examples) into *task-oriented, runnable recipes* with inputs/outputs, grouped by *use-case*—and then **tests** them.
> 
> # Key differences
> 
> | Axis | **codepack** | **cookbook** |
> |---|---|---|
> | Primary goal | Collect & cluster snippets; materialize a file tree under `pseudo/` | Curate runnable “recipes” that teach tasks & verify they still work |
> | Grouping | Vector similarity across code/text | Taxonomy (task/use-case), language/runtime, difficulty |
> | Inputs | Docs code blocks (+context) | Docs blocks, `examples/**`, `scripts/**`, CLI help, tests as seeds |
> | Output | Generated file tree + README per cluster | `docs/cookbook/**` recipe pages + datasets/fixtures + verified outputs |
> | Front matter | Minimal (source meta) | Rich: `title, problem, ingredients, runtime, difficulty, time, tags, inputs, expected_output_hash` |
> | LLM role | Name folders/files and cluster readme | Summarize task, normalize steps, infer prerequisites, generate “See also” |
> | Verification | None | Run each recipe in a sandbox, capture **stdout/stderr/artifacts**, snapshot hashes |
> | CI/Idempotency | One-way materialization | Fails build if recipes break; cached golden outputs |
> 
> # Shape of a **cookbook** recipe
> 
> Front matter:
> ```yaml
> ---
> uuid: ...
> title: "Stream logs to S3 with piper"
> problem: "Ship rotating logs to S3 nightly with retries"
> runtime: "node@20"
> difficulty: "easy"
> estimated_time: "5m"
> ingredients:
>  - "@promethean/piper"
>  - "aws cli configured"
> tags: ["ops","s3","pipelines"]
> inputs: ["examples/logs/sample.log"]
> expected_output_hash: "sha1:abcd1234..."
> see_also: ["../packages/piper/README.md#run", "../docs/pipelines.md"]
> ---
> ```
> 
> Body (idempotent marker-managed):
> ```
> ## Steps
> 1. Install deps …
> 2. Configure …
> 3. Run …
> 
> ## Code
> ```bash
> piper run ship-logs
> ```
> 
> ## Expected output
> ```
> Uploaded 42 files
> ```
> ```
> 
> # Proposed **cookbook** pipeline (vs codepack)
> 
> ```mermaid
> flowchart LR
>  A[scan examples & docs] --> B[embed & classify by task]
>  B --> C[consolidate similar recipes]
>  C --> D[LLM normalize: title/steps/ingredients/see also]
>  D --> E[materialize docs/cookbook/**]
>  E --> F[execute recipes in sandbox; capture outputs]
>  F --> G[verify & snapshot hashes]
>  G --> H[report & link to failing recipes]
> ```
> 
> ## Steps you’ll add (package: `@promethean/cookbookflow`)
> 
> 1) **01-scan** 
>  - Inputs: `docs/**/*.md` (code blocks), `examples/**`, `packages/**/README.md`, `packages/**/bin/* --help` (captured text) 
>  - Output: `.cache/cookbook/blocks.json`
> 
> 2) **02-embed-classify** 
>  - Build embeddings; **classify** each block to a fixed taxonomy (*ingest, transform, visualize, automate, test, deploy, …*) using an LLM or rules. 
>  - Output: `.cache/cookbook/classes.json`
> 
> 3) **03-group-consolidate** 
>  - Group by *(task, runtime, language)*, de-dup near duplicates, choose a canonical snippet + variants. 
>  - Output: `.cache/cookbook/groups.json`
> 
> 4) **04-plan** (LLM) 
>  - For each group, produce:
>  - `title, problem, ingredients, steps, runtime, difficulty, tags, see_also`
>  - normalize code blocks and **expected output sketch** 
>  - Output: `.cache/cookbook/plan.json`
> 
> 5) **05-materialize** 
>  - Write `docs/cookbook/<task>/<slug>.md` (with markers), drop fixtures to `docs/cookbook/_assets/<uuid>/` if needed. 
>  - Output: tree + `.cache/cookbook/write.touch`
> 
> 6) **06-exec** (sandbox) 
>  - Execute each recipe:
>  - For shell: spawn in temp dir 
>  - For Node/TS: `tsx` runner 
>  - Capture stdout/stderr, produced files; compute hash(es). 
>  - Output: `.cache/cookbook/run-results.json`
> 
> 7) **07-verify** 
>  - Compare actual hashes vs `expected_output_hash`; update hashes if `--accept` flag is set. 
>  - Output: `.cache/cookbook/verify.json`, fail status if drift
> 
> 8) **08-report** 
>  - Write `docs/agile/reports/cookbook/cookbook-<ts>.md` with pass/fail table, flake stats, and back to recipes.
> 
> ## Minimal `pipelines.cookbook.yml`
> 
> ```yaml
> pipelines:
>  - name: cookbook
>  steps:
>  - id: cb-scan
>  shell: "pnpm --filter @promethean/cookbookflow cb:01-scan --roots docs examples packages --out .cache/cookbook/blocks.json"
>  inputs:
>  - "docs/**/*.md"
>  - "examples/**/*"
>  - "packages/**/README.md"
>  outputs: [".cache/cookbook/blocks.json"]
> 
>  - id: cb-classify
>  deps: ["cb-scan"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:02-embed-classify --in .cache/cookbook/blocks.json --out .cache/cookbook/classes.json --model nomic-embed-text:latest --llm qwen3:4b"
>  env: { OLLAMA_URL: "${OLLAMA_URL}" }
>  inputs: [".cache/cookbook/blocks.json"]
>  outputs: [".cache/cookbook/classes.json"]
> 
>  - id: cb-group
>  deps: ["cb-classify"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:03-group --in .cache/cookbook/classes.json --out .cache/cookbook/groups.json"
>  inputs: [".cache/cookbook/classes.json"]
>  outputs: [".cache/cookbook/groups.json"]
> 
>  - id: cb-plan
>  deps: ["cb-group"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:04-plan --groups .cache/cookbook/groups.json --out .cache/cookbook/plan.json --llm qwen3:4b"
>  env: { OLLAMA_URL: "${OLLAMA_URL}" }
>  inputs: [".cache/cookbook/groups.json"]
>  outputs: [".cache/cookbook/plan.json"]
> 
>  - id: cb-write
>  deps: ["cb-plan"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:05-materialize --plan .cache/cookbook/plan.json --out docs/cookbook"
>  inputs: [".cache/cookbook/plan.json"]
>  outputs: ["docs/cookbook/**/*.md"]
> 
>  - id: cb-exec
>  deps: ["cb-write"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:06-exec --root docs/cookbook --out .cache/cookbook/run-results.json"
>  inputs: ["docs/cookbook/**/*.md"]
>  outputs: [".cache/cookbook/run-results.json"]
> 
>  - id: cb-verify
>  deps: ["cb-exec"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:07-verify --runs .cache/cookbook/run-results.json --out .cache/cookbook/verify.json"
>  inputs: [".cache/cookbook/run-results.json"]
>  outputs: [".cache/cookbook/verify.json"]
> 
>  - id: cb-report
>  deps: ["cb-verify"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:08-report --runs .cache/cookbook/run-results.json --verify .cache/cookbook/verify.json --out docs/agile/reports/cookbook"
>  inputs:
>  - ".cache/cookbook/verify.json"
>  - ".cache/cookbook/run-results.json"
>  outputs: ["docs/agile/reports/cookbook/*.md"]
> ```
> 
> ## Nice extras unique to cookbook
> - **“Ingredient resolver”**: turn `ingredients` into install commands per runtime (pnpm/pip/brew). 
> - **Fixtures manager**: declare tiny datasets per recipe; cache them under `_assets/`. 
> - **Coverage map**: which APIs (from `semverguard` snapshot) are exercised by recipes. 
> - **Auto-**: section “See also” → package READMEs + docops pages. 
> - **Accept new outputs**: `cb-verify --accept` updates stored `expected_output_hash` in FM.
> 
> If you want, I can scaffold `@promethean/cookbookflow` with the same CLI step structure as our other packages so you can plug it in immediately.
<!-- UID: a80b6b54-eafe-4212-9271-7f9778e1f2b4 -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:21 PM
> lets do it, make it so
<!-- UID: 42961813-bcd9-4486-8682-6ada1691007a -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:21 PM
> boom — here’s a turnkey **@promethean/cookbookflow** package + pipeline that scans examples & docs, clusters into task-oriented “recipes,” writes `docs/cookbook/**`, executes them in a sandbox, verifies outputs, and reports.
> 
> Drop these files into your repo and you’re off.
> 
> ---
> 
> ## packages/cookbookflow/
> 
> ```
> packages/cookbookflow/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-scan.ts
>  02-embed-classify.ts
>  03-group.ts
>  04-plan.ts
>  05-materialize.ts
>  06-exec.ts
>  07-verify.ts
>  08-report.ts
> ```
> 
> ### package.json
> ```json
> {
>  "name": "@promethean/cookbookflow",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "cb:01-scan": "dist/01-scan.js",
>  "cb:02-embed-classify": "dist/02-embed-classify.js",
>  "cb:03-group": "dist/03-group.js",
>  "cb:04-plan": "dist/04-plan.js",
>  "cb:05-materialize": "dist/05-materialize.js",
>  "cb:06-exec": "dist/06-exec.js",
>  "cb:07-verify": "dist/07-verify.js",
>  "cb:08-report": "dist/08-report.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "cb:01-scan": "tsx src/01-scan.ts",
>  "cb:02-embed-classify": "tsx src/02-embed-classify.ts",
>  "cb:03-group": "tsx src/03-group.ts",
>  "cb:04-plan": "tsx src/04-plan.ts",
>  "cb:05-materialize": "tsx src/05-materialize.ts",
>  "cb:06-exec": "tsx src/06-exec.ts",
>  "cb:07-verify": "tsx src/07-verify.ts",
>  "cb:08-report": "tsx src/08-report.ts",
>  "cb:all": "pnpm cb:01-scan && pnpm cb:02-embed-classify && pnpm cb:03-group && pnpm cb:04-plan && pnpm cb:05-materialize && pnpm cb:06-exec && pnpm cb:07-verify && pnpm cb:08-report"
>  },
>  "dependencies": {
>  "globby": "^14.0.2",
>  "gray-matter": "^4.0.3",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ### tsconfig.json
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "outDir": "dist",
>  "strict": true,
>  "skipLibCheck": true,
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ### src/types.ts
> ```ts
> export type CodeBlock = {
>  id: string;
>  source: "doc" | "example" | "readme";
>  file: string;
>  lang: string; // ts, js, bash, sh, json, yaml, etc.
>  code: string;
>  context: string; // surrounding lines / header
> };
> 
> export type ScanOutput = {
>  createdAt: string;
>  blocks: CodeBlock[];
> };
> 
> export type ClassEntry = {
>  id: string;
>  task: string; // taxonomy (e.g., ingest, transform, visualize, automate, test, deploy)
>  runtime: string; // node@20, shell, python@3.x
>  language: string; // ts, js, bash, etc.
>  title: string;
>  score?: number; // classifier confidence
> };
> 
> export type ClassesFile = {
>  plannedAt: string;
>  classes: Record<string, ClassEntry>; // key = block.id
>  embeddings: Record<string, number[]>; // block.id -> vector
> };
> 
> export type Group = {
>  key: string; // task|runtime|language
>  blockIds: string[];
>  centroid?: number[]; // average vector (for info)
> };
> export type GroupsFile = { groupedAt: string; groups: Group[]; };
> 
> export type PlanRecipe = {
>  uuid: string;
>  task: string;
>  title: string;
>  problem: string;
>  runtime: string; // e.g., "node@20" | "shell"
>  difficulty: "easy" | "medium" | "hard";
>  estimated_time: string; // "5m", "15m", "1h"
>  ingredients: string[]; // deps/tools
>  steps: string[]; // numbered steps
>  code_lang: string; // code block language
>  code: string; // runnable snippet
>  see_also: string[]; // relative 
>  tags: string[];
>  expected_output_hash?: string; // filled by verify --accept
> };
> 
> export type PlanFile = { plannedAt: string; groups: Record<string, PlanRecipe[]>; };
> 
> export type RunResult = {
>  recipePath: string; // docs/cookbook/...md
>  ok: boolean;
>  stdoutHash?: string;
>  stderrHash?: string;
>  exitCode?: number | null;
>  stdoutPreview?: string;
>  stderrPreview?: string;
> };
> 
> export type RunResultsFile = { ranAt: string; results: RunResult[]; };
> 
> export type VerifyItem = {
>  recipePath: string;
>  expected?: string;
>  actual?: string;
>  ok: boolean;
> };
> export type VerifyFile = { verifiedAt: string; items: VerifyItem[]; };
> ```
> 
> ### src/utils.ts
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> import { exec as _exec, spawn } from "child_process";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(def: Record<string, string>) {
>  const out = { ...def }; const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> export async function readMaybe(p: string) { try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }
> export async function writeJSON(p: string, data: any) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }
> export async function writeText(p: string, s: string) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, s, "utf-8"); }
> 
> export function slug(s: string) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
> export function sha1(s: string) { let h=2166136261>>>0; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return "h"+h.toString(16); }
> export function uuid() { // Node 18+
>  // @ts-ignore
>  return globalThis.crypto?.randomUUID?.() ?? (require("crypto").randomUUID());
> }
> 
> export async function ollamaEmbed(model: string, text: string): Promise<number[]> {
>  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, prompt: text }) });
>  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
>  const data = await res.json(); return data.embedding as number[];
> }
> export async function ollamaJSON(model: string, prompt: string): Promise<any> {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, { method:"POST", headers:{ "Content-Type":"application/json" },
>  body: JSON.stringify({ model, prompt, stream:false, options:{ temperature:0 }, format:"json" }) });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
> }
> export function cosine(a: number[], b: number[]) { let dot=0, na=0, nb=0, n=Math.min(a.length,b.length); for (let i=0;i<n;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; } return !na||!nb?0:dot/(Math.sqrt(na)*Math.sqrt(nb)); }
> 
> export async function execShell(cmd: string, cwd: string) {
>  return new Promise<{ code: number|null; stdout: string; stderr: string }>((resolve) => {
>  const child = _exec(cmd, { cwd, maxBuffer: 1024*1024*64, env: { ...process.env } }, (err, stdout, stderr) => {
>  resolve({ code: err ? (err as any).code ?? 1 : 0, stdout: String(stdout), stderr: String(stderr) });
>  });
>  child.on("error", () => resolve({ code: 127, stdout: "", stderr: "spawn error" }));
>  });
> }
> ```
> 
> ---
> 
> ### src/01-scan.ts
> ```ts
> /* eslint-disable no-console */
> import globby from "globby";
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON, sha1 } from "./utils.js";
> import type { CodeBlock, ScanOutput } from "./types.js";
> 
> const args = parseArgs({
>  "--roots": "docs examples packages",
>  "--out": ".cache/cookbook/blocks.json",
>  "--max-context": "12"
> });
> 
> function* mdCodeBlocks(md: string): Generator<{lang:string, code:string, header:string}> {
>  const fence = /```(\w+)?[^\n]*\n([\s\S]*?)```/g;
>  let m; while ( (m = fence.exec(md)) ) {
>  const before = md.slice(0, m.index);
>  const header = (before.match(/(?:^|\n)#{1,6}\s+[^\n]+$/m)?.[0] ?? "").trim();
>  yield { lang: (m[1]||"").toLowerCase(), code: m[2], header };
>  }
> }
> 
> async function main() {
>  const roots = args["--roots"].split(/\s+/).filter(Boolean);
>  const files = await globby([
>  ...roots.map(r => `${r.replace(/\\/g,"/")}/**/*.{md,mdx}`),
>  "examples/**/*.{ts,tsx,js,jsx,sh,bash}"
>  ], { dot: false });
> 
>  const maxCtx = Number(args["--max-context"]);
>  const blocks: CodeBlock[] = [];
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  if (/\.(md|mdx)$/i.test(f)) {
>  for (const b of mdCodeBlocks(raw)) {
>  const ctxLines = b.code.split("\n").slice(0, maxCtx).join("\n");
>  blocks.push({ id: sha1(f + "|" + b.lang + "|" + b.code.slice(0,128)), source: "doc", file: f, lang: b.lang || "text", code: b.code, context: b.header + "\n" + ctxLines });
>  }
>  } else {
>  const lang = /\.(sh|bash)$/i.test(f) ? "bash" : /\.(ts|tsx)$/i.test(f) ? "ts" : /\.(js|jsx)$/i.test(f) ? "js" : "text";
>  blocks.push({ id: sha1(f), source: "example", file: f, lang, code: raw, context: path.basename(f) });
>  }
>  }
> 
>  const out: ScanOutput = { createdAt: new Date().toISOString(), blocks };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`cookbook: scanned ${blocks.length} block(s) → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/02-embed-classify.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, ollamaEmbed, ollamaJSON, writeJSON } from "./utils.js";
> import type { ScanOutput, ClassesFile, ClassEntry } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/cookbook/blocks.json",
>  "--out": ".cache/cookbook/classes.json",
>  "--embed-model": "nomic-embed-text:latest",
>  "--llm": "qwen3:4b"
> });
> 
> async function main() {
>  const scan = JSON.parse(await fs.readFile(path.resolve(args["--in"]), "utf-8")) as ScanOutput;
> 
>  const embeddings: Record<string, number[]> = {};
>  const classes: Record<string, ClassEntry> = {};
> 
>  for (const b of scan.blocks) {
>  const text = `FILE:${b.file}\nLANG:${b.lang}\n---\n${b.code}`;
>  embeddings[b.id] = await ollamaEmbed(args["--embed-model"], text);
> 
>  const sys = "Classify code by task(use-case), runtime, and a short title. Return JSON: {task, runtime, title}";
>  const user = [
>  `LANG: ${b.lang}`,
>  `FILE: ${b.file}`,
>  `CONTEXT: ${b.context.slice(0,400)}`,
>  "CODE:",
>  b.code.slice(0,1500)
>  ].join("\n");
> 
>  let obj: any;
>  try { obj = await ollamaJSON(args["--llm"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`); }
>  catch { obj = { task: "automate", runtime: (b.lang==="bash"||b.lang==="sh")?"shell":"node@20", title: `${b.lang} snippet` }; }
> 
>  classes[b.id] = {
>  id: b.id,
>  task: (obj.task ?? "automate").toLowerCase(),
>  runtime: obj.runtime ?? ((b.lang==="bash"||b.lang==="sh") ? "shell" : "node@20"),
>  language: b.lang || "text",
>  title: obj.title ?? "Recipe"
>  };
>  }
> 
>  const out: ClassesFile = { plannedAt: new Date().toISOString(), classes, embeddings };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`cookbook: classified ${Object.keys(classes).length} block(s) → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/03-group.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, cosine, writeJSON } from "./utils.js";
> import type { ClassesFile, GroupsFile, Group } from "./types.js";
> 
> const args = parseArgs({
>  "--in": ".cache/cookbook/classes.json",
>  "--out": ".cache/cookbook/groups.json",
>  "--min-sim": "0.82",
>  "--max-size": "12"
> });
> 
> async function main() {
>  const cf = JSON.parse(await fs.readFile(path.resolve(args["--in"]), "utf-8")) as ClassesFile;
>  const ids = Object.keys(cf.classes);
>  const seen = new Set<string>();
>  const groups: Group[] = [];
>  const minSim = Number(args["--min-sim"]);
>  const maxSize = Number(args["--max-size"]);
> 
>  for (const id of ids) {
>  if (seen.has(id)) continue;
>  const seed = cf.classes[id];
>  const key = `${seed.task}|${seed.runtime}|${seed.language}`;
>  const centroid = cf.embeddings[id];
>  const members = [id];
> 
>  // greedy nearest neighbors within same key
>  for (const other of ids) {
>  if (id === other || seen.has(other)) continue;
>  const c = cf.classes[other];
>  if (`${c.task}|${c.runtime}|${c.language}` !== key) continue;
>  const sim = cosine(centroid, cf.embeddings[other] || []);
>  if (sim >= minSim) members.push(other);
>  if (members.length >= maxSize) break;
>  }
> 
>  members.forEach(m => seen.add(m));
>  groups.push({ key, blockIds: members, centroid });
>  }
> 
>  const out: GroupsFile = { groupedAt: new Date().toISOString(), groups };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`cookbook: formed ${groups.length} group(s) → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/04-plan.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { z } from "zod";
> import { parseArgs, ollamaJSON, writeJSON, uuid } from "./utils.js";
> import type { ScanOutput, ClassesFile, GroupsFile, PlanFile, PlanRecipe } from "./types.js";
> 
> const args = parseArgs({
>  "--scan": ".cache/cookbook/blocks.json",
>  "--classes": ".cache/cookbook/classes.json",
>  "--groups": ".cache/cookbook/groups.json",
>  "--out": ".cache/cookbook/plan.json",
>  "--llm": "qwen3:4b"
> });
> 
> const RecipeSchema = z.object({
>  title: z.string().min(1),
>  problem: z.string().min(1),
>  runtime: z.string().min(1),
>  difficulty: z.enum(["easy","medium","hard"]).default("easy"),
>  estimated_time: z.string().min(1),
>  ingredients: z.array(z.string()).min(1),
>  steps: z.array(z.string()).min(2),
>  code_lang: z.string().min(1),
>  code: z.string().min(1),
>  see_also: z.array(z.string()).default([]),
>  tags: z.array(z.string()).default([])
> });
> 
> async function main() {
>  const scan = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8")) as ScanOutput;
>  const classes = JSON.parse(await fs.readFile(path.resolve(args["--classes"]), "utf-8")) as ClassesFile;
>  const groups = JSON.parse(await fs.readFile(path.resolve(args["--groups"]), "utf-8")) as GroupsFile;
> 
>  const byId = new Map(scan.blocks.map(b => [b.id, b]));
>  const outGroups: Record<string, PlanRecipe[]> = {};
> 
>  for (const g of groups.groups) {
>  const sample = byId.get(g.blockIds[0])!;
>  const meta = classes.classes[g.blockIds[0]];
>  const sys = [
>  "You produce runnable, task-oriented cookbook recipes.",
>  "Return ONLY JSON with keys:",
>  "title, problem, runtime, difficulty(easy|medium|hard), estimated_time('5m'..), ingredients[], steps[], code_lang, code, see_also[], tags[]"
>  ].join("\n");
> 
>  const exemplars = g.blockIds.slice(0, 3).map(id => {
>  const b = byId.get(id)!; return `### ${b.lang} from ${b.file}\n${b.code.slice(0,800)}`;
>  }).join("\n\n");
> 
>  let obj: any;
>  try {
>  obj = await ollamaJSON(args["--llm"], `SYSTEM:\n${sys}\n\nUSER:\nTASK=${meta.task}\nRUNTIME=${meta.runtime}\nLANG=${meta.language}\n\nEXAMPLES:\n${exemplars}`);
>  } catch {
>  obj = {
>  title: `${meta.language} ${meta.task} recipe`,
>  problem: `How to ${meta.task} with ${meta.runtime}.`,
>  runtime: meta.runtime, difficulty: "easy", estimated_time: "5m",
>  ingredients: [meta.runtime.includes("node") ? "@promethean/piper" : "bash"],
>  steps: ["Follow the code block", "Adjust paths as needed"],
>  code_lang: meta.language || "bash",
>  code: sample.code,
>  see_also: [], tags: [meta.task, meta.language]
>  };
>  }
> 
>  const parsed = RecipeSchema.safeParse(obj);
>  const recipe = parsed.success ? parsed.data : {
>  title: `${meta.language} ${meta.task} recipe`,
>  problem: `How to ${meta.task}.`,
>  runtime: meta.runtime, difficulty: "easy", estimated_time: "5m",
>  ingredients: ["bash"], steps: ["Run the code"], code_lang: meta.language || "bash", code: sample.code, see_also: [], tags: [meta.task]
>  };
> 
>  const pr: PlanRecipe = { uuid: uuid(), task: meta.task, ...recipe };
>  (outGroups[g.key] ||= []).push(pr);
>  }
> 
>  const plan: PlanFile = { plannedAt: new Date().toISOString(), groups: outGroups };
>  await writeJSON(path.resolve(args["--out"]), plan);
>  console.log(`cookbook: planned ${Object.values(outGroups).reduce((a,b)=>a+b.length,0)} recipes → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/05-materialize.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, writeText, slug } from "./utils.js";
> import type { PlanFile } from "./types.js";
> 
> const args = parseArgs({
>  "--plan": ".cache/cookbook/plan.json",
>  "--out": "docs/cookbook"
> });
> 
> const START="<!-- COOKBOOK:BEGIN -->";
> const END="<!-- COOKBOOK:END -->";
> 
> function strip(text: string){ const si=text.indexOf(START), ei=text.indexOf(END); return (si>=0 && ei>si) ? (text.slice(0,si).trimEnd()+"\n").trimEnd() : text.trimEnd(); }
> 
> function render(recipe: any) {
>  const codeBlock = [
>  "## Code",
>  "```" + recipe.code_lang,
>  recipe.code.trimEnd(),
>  "```",
>  ""
>  ].join("\n");
>  return [
>  START,
>  `# ${recipe.title}`,
>  "",
>  `> ${recipe.problem}`,
>  "",
>  "## Steps",
>  ...recipe.steps.map((s: string, i:number) => `${i+1}. ${s}`),
>  "",
>  codeBlock,
>  "## Ingredients",
>  ...recipe.ingredients.map((i: string)=>`- ${i}`),
>  "",
>  recipe.see_also?.length ? "## See also\n" + recipe.see_also.map((l:string)=>`- ${l}`).join("\n") + "\n" : "",
>  END,
>  ""
>  ].join("\n");
> }
> 
> async function main() {
>  const plan = JSON.parse(await fs.readFile(path.resolve(args["--plan"]), "utf-8")) as PlanFile;
>  const OUT = path.resolve(args["--out"]); await fs.mkdir(OUT, { recursive: true });
> 
>  let count = 0;
>  for (const [key, recs] of Object.entries(plan.groups)) {
>  for (const r of recs) {
>  const dir = path.join(OUT, r.task);
>  await fs.mkdir(dir, { recursive: true });
>  const fname = `${slug(r.title)}.md`;
>  const p = path.join(dir, fname);
> 
>  const existing = await (async()=>{ try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } })();
>  const gm = existing ? matter(existing) : { content: "", data: {} as any };
>  const content = (strip(gm.content) ? strip(gm.content)+"\n\n" : "") + render(r);
>  const fm = { ...(gm as any).data, uuid: r.uuid, title: r.title, task: r.task, runtime: r.runtime, difficulty: r.difficulty, estimated_time: r.estimated_time, tags: r.tags };
>  const final = matter.stringify(content, fm, { language: "yaml" });
>  await writeText(p, final);
>  count++;
>  }
>  }
>  console.log(`cookbook: wrote ${count} recipe(s) to ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/06-exec.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import globby from "globby";
> import matter from "gray-matter";
> import { parseArgs, writeJSON, sha1, execShell } from "./utils.js";
> import type { RunResultsFile } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "docs/cookbook",
>  "--out": ".cache/cookbook/run-results.json",
>  "--timeout": "0"
> });
> 
> async function main() {
>  const files = await globby([`${args["--root"].replace(/\\/g,"/")}/**/*.md`]);
>  const results: RunResultsFile["results"] = [];
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const gm = matter(raw);
>  const body = gm.content;
> 
>  // pick the first code fence as the runnable snippet
>  const m = body.match(/```(\w+)?[^\n]*\n([\s\S]*?)```/);
>  if (!m) { results.push({ recipePath: f, ok: false, stdoutPreview: "", stderrPreview: "no code block found", exitCode: null }); continue; }
> 
>  const lang = (m[1]||"").toLowerCase();
>  const code = m[2];
> 
>  // crude sandbox: create a temp dir under .cache/cookbook/run/<slug>
>  const runDir = path.join(".cache/cookbook/run", path.basename(f, ".md"));
>  await fs.mkdir(runDir, { recursive: true });
> 
>  let cmd = "";
>  if (lang === "bash" || lang === "sh") {
>  const sh = path.join(runDir, "run.sh");
>  await fs.writeFile(sh, code, "utf-8");
>  cmd = `bash ${path.relative(process.cwd(), sh)}`;
>  } else if (lang === "ts" || lang === "typescript") {
>  const ts = path.join(runDir, "run.ts");
>  await fs.writeFile(ts, code, "utf-8");
>  cmd = `npx tsx ${path.relative(process.cwd(), ts)}`;
>  } else if (lang === "js" || lang === "javascript") {
>  const js = path.join(runDir, "run.js");
>  await fs.writeFile(js, code, "utf-8");
>  cmd = `node ${path.relative(process.cwd(), js)}`;
>  } else {
>  results.push({ recipePath: f, ok: false, stderrPreview: `unsupported code lang: ${lang}`, exitCode: null });
>  continue;
>  }
> 
>  const r = await execShell(cmd, process.cwd());
>  const stdoutHash = sha1(r.stdout || "");
>  const stderrHash = sha1(r.stderr || "");
>  results.push({
>  recipePath: f,
>  ok: (r.code === 0),
>  exitCode: r.code,
>  stdoutHash,
>  stderrHash,
>  stdoutPreview: (r.stdout || "").slice(0, 400),
>  stderrPreview: (r.stderr || "").slice(0, 400)
>  });
>  }
> 
>  const out: RunResultsFile = { ranAt: new Date().toISOString(), results };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`cookbook: executed ${results.length} recipe(s) → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/07-verify.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import matter from "gray-matter";
> import { parseArgs, writeJSON } from "./utils.js";
> import type { RunResultsFile, VerifyFile, VerifyItem } from "./types.js";
> 
> const args = parseArgs({
>  "--runs": ".cache/cookbook/run-results.json",
>  "--out": ".cache/cookbook/verify.json",
>  "--accept": "false"
> });
> 
> async function main() {
>  const runs = JSON.parse(await fs.readFile(path.resolve(args["--runs"]), "utf-8")) as RunResultsFile;
>  const accept = args["--accept"] === "true";
>  const items: VerifyItem[] = [];
> 
>  for (const r of runs.results) {
>  const raw = await fs.readFile(r.recipePath, "utf-8");
>  const gm = matter(raw);
>  const expected = gm.data?.expected_output_hash as string | undefined;
>  const actual = r.stdoutHash;
> 
>  if (accept && (!expected || expected !== actual)) {
>  const fm = { ...(gm.data as any), expected_output_hash: actual };
>  const final = matter.stringify(gm.content, fm, { language: "yaml" });
>  await fs.writeFile(r.recipePath, final, "utf-8");
>  }
> 
>  items.push({ recipePath: r.recipePath, expected, actual, ok: !!actual && !!expected && expected === actual && r.ok });
>  }
> 
>  const out: VerifyFile = { verifiedAt: new Date().toISOString(), items };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`cookbook: verify → ${args["--out"]} (accept=${accept})`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ### src/08-report.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import { parseArgs, writeText } from "./utils.js";
> import type { RunResultsFile, VerifyFile } from "./types.js";
> 
> const args = parseArgs({
>  "--runs": ".cache/cookbook/run-results.json",
>  "--verify": ".cache/cookbook/verify.json",
>  "--out": "docs/agile/reports/cookbook"
> });
> 
> async function main() {
>  const runs = JSON.parse(await fs.readFile(path.resolve(args["--runs"]), "utf-8")) as RunResultsFile;
>  const verify = JSON.parse(await fs.readFile(path.resolve(args["--verify"]), "utf-8")) as VerifyFile;
> 
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
>  const ts = new Date().toISOString().replace(/[:.]/g,"-");
>  const out = path.join(args["--out"], `cookbook-${ts}.md`);
> 
>  const rows = runs.results.map(r => {
>  const v = verify.items.find(i => i.recipePath === r.recipePath);
>  const status = r.ok ? (v?.ok ? "OK" : "HASH MISMATCH") : `FAIL(${r.exitCode})`;
>  return `| ${status} | ${r.recipePath} | \`${(v?.expected??"")}\` | \`${(r.stdoutHash??"")}\` | ${ (r.stderrPreview||"").replace(/\|/g,"\\|").slice(0,80) } |`;
>  });
> 
>  const md = [
>  "# Cookbook report",
>  "",
>  `Generated: ${new Date().toLocaleString()}`,
>  "",
>  "| Status | Recipe | Expected | Actual | stderr preview |",
>  "|---|---|---|---|---|",
>  ...rows,
>  ""
>  ].join("\n");
> 
>  await writeText(out, md);
>  await writeText(path.join(args["--out"], "README.md"), `# Cookbook Reports\n\n- [Latest](${path.basename(out)})\n`);
>  console.log(`cookbook: report → ${path.relative(process.cwd(), out)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## Add pipeline to `pipelines.yaml`
> 
> Append this:
> 
> ```yaml
> pipelines:
>  - name: cookbook
>  steps:
>  - id: cb-scan
>  shell: "pnpm --filter @promethean/cookbookflow cb:01-scan --roots docs examples packages --out .cache/cookbook/blocks.json"
>  inputs:
>  - "docs/**/*.md"
>  - "examples/**/*"
>  - "packages/**/README.md"
>  outputs:
>  - ".cache/cookbook/blocks.json"
> 
>  - id: cb-classify
>  deps: ["cb-scan"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:02-embed-classify --in .cache/cookbook/blocks.json --out .cache/cookbook/classes.json --embed-model nomic-embed-text:latest --llm qwen3:4b"
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/cookbook/blocks.json"
>  outputs:
>  - ".cache/cookbook/classes.json"
> 
>  - id: cb-group
>  deps: ["cb-classify"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:03-group --in .cache/cookbook/classes.json --out .cache/cookbook/groups.json --min-sim 0.82 --max-size 12"
>  inputs:
>  - ".cache/cookbook/classes.json"
>  outputs:
>  - ".cache/cookbook/groups.json"
> 
>  - id: cb-plan
>  deps: ["cb-group"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:04-plan --scan .cache/cookbook/blocks.json --classes .cache/cookbook/classes.json --groups .cache/cookbook/groups.json --out .cache/cookbook/plan.json --llm qwen3:4b"
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/cookbook/groups.json"
>  outputs:
>  - ".cache/cookbook/plan.json"
> 
>  - id: cb-write
>  deps: ["cb-plan"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:05-materialize --plan .cache/cookbook/plan.json --out docs/cookbook"
>  inputs:
>  - ".cache/cookbook/plan.json"
>  outputs:
>  - "docs/cookbook/**/*.md"
> 
>  - id: cb-exec
>  deps: ["cb-write"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:06-exec --root docs/cookbook --out .cache/cookbook/run-results.json"
>  inputs:
>  - "docs/cookbook/**/*.md"
>  outputs:
>  - ".cache/cookbook/run-results.json"
> 
>  - id: cb-verify
>  deps: ["cb-exec"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:07-verify --runs .cache/cookbook/run-results.json --out .cache/cookbook/verify.json --accept false"
>  inputs:
>  - ".cache/cookbook/run-results.json"
>  outputs:
>  - ".cache/cookbook/verify.json"
> 
>  - id: cb-report
>  deps: ["cb-verify"]
>  shell: "pnpm --filter @promethean/cookbookflow cb:08-report --runs .cache/cookbook/run-results.json --verify .cache/cookbook/verify.json --out docs/agile/reports/cookbook"
>  inputs:
>  - ".cache/cookbook/verify.json"
>  outputs:
>  - "docs/agile/reports/cookbook/*.md"
> ```
> 
> ---
> 
> ## How to use
> 
> ```bash
> pnpm -w i
> pnpm -w --filter @promethean/cookbookflow build
> 
> # generate and verify cookbook
> piper run cookbook
> 
> # accept new golden outputs (writes expected_output_hash into FM)
> pnpm --filter @promethean/cookbookflow cb:07-verify --accept true
> ```
> 
> ### Notes / knobs
> - Classification taxon (`task`, `runtime`) is LLM-driven but easy to tweak in `02-embed-classify.ts`.
> - Execution supports `bash|sh|js|ts`. Add more runners in `06-exec.ts` if needed.
> - Idempotent markers (`<!-- COOKBOOK:BEGIN/END -->`) preserve any hand-edits above.
> - Hash is based on **stdout**; extend to artifact file hashes if your recipes produce files.
> 
> Want me to add a **fixtures manager** (`docs/cookbook/_assets/<uuid>`) + file hash verification next?
<!-- UID: 17f870f9-4ee5-48d3-9038-0936cf996331 -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:26 PM
> test-gap pipeline
<!-- UID: d5f479cb-04bf-402e-b625-78ab7c746b5f -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:26 PM
> 🔥 here’s a turnkey **test-gap** pipeline that finds untested exported API, cross-checks cookbook recipes, then writes tasks + a report.
> 
> It fits our pattern: small CLIs, idempotent, caches under `.cache/testgap/`.
> 
> ---
> 
> # New package: `@promethean/testgap`
> 
> ```
> packages/testgap/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-scan-exports.ts
>  02-read-coverage.ts
>  03-map-gaps.ts
>  04-cookbook-cross.ts
>  05-plan.ts
>  06-write.ts
>  07-report.ts
> ```
> 
> ## package.json
> ```json
> {
>  "name": "@promethean/testgap",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "tg:01-scan-exports": "dist/01-scan-exports.js",
>  "tg:02-read-coverage": "dist/02-read-coverage.js",
>  "tg:03-map-gaps": "dist/03-map-gaps.js",
>  "tg:04-cookbook-cross": "dist/04-cookbook-cross.js",
>  "tg:05-plan": "dist/05-plan.js",
>  "tg:06-write": "dist/06-write.js",
>  "tg:07-report": "dist/07-report.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "tg:01-scan-exports": "tsx src/01-scan-exports.ts",
>  "tg:02-read-coverage": "tsx src/02-read-coverage.ts",
>  "tg:03-map-gaps": "tsx src/03-map-gaps.ts",
>  "tg:04-cookbook-cross": "tsx src/04-cookbook-cross.ts",
>  "tg:05-plan": "tsx src/05-plan.ts",
>  "tg:06-write": "tsx src/06-write.ts",
>  "tg:07-report": "tsx src/07-report.ts",
>  "tg:all": "pnpm tg:01-scan-exports && pnpm tg:02-read-coverage && pnpm tg:03-map-gaps && pnpm tg:04-cookbook-cross && pnpm tg:05-plan && pnpm tg:06-write && pnpm tg:07-report"
>  },
>  "dependencies": {
>  "globby": "^14.0.2",
>  "gray-matter": "^4.0.3",
>  "ts-morph": "^22.0.0",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ## tsconfig.json
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "outDir": "dist",
>  "strict": true,
>  "skipLibCheck": true,
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ## src/types.ts
> ```ts
> export type ExportSymbol = {
>  pkg: string;
>  file: string;
>  kind: "function"|"class"|"variable"|"interface"|"type"|"enum";
>  name: string;
>  startLine: number;
>  endLine: number;
> };
> 
> export type ExportScan = { scannedAt: string; symbols: ExportSymbol[] };
> 
> export type FileCoverage = {
>  file: string; // repo-relative path
>  linesTotal: number;
>  linesCovered: number;
>  coveredLines: number[]; // 1-based
> };
> export type CoverageIndex = { collectedAt: string; files: Record<string, FileCoverage> };
> 
> export type SymbolCoverage = {
>  symbol: ExportSymbol;
>  covered: number;
>  total: number;
>  ratio: number; // 0..1
> };
> export type GapItem = SymbolCoverage & {
>  severity: "high"|"med"|"low";
>  reasons: string[]; // e.g., "exported API uncovered"
>  cookbookHits?: string[]; // recipe files that exercise it (static)
> };
> export type GapMap = { mappedAt: string; items: GapItem[] };
> 
> export type CookbookHit = { recipe: string; pkg: string; imported: string[] };
> export type CookbookCross = { analyzedAt: string; hits: CookbookHit[] };
> 
> export type PlanTask = {
>  title: string;
>  summary: string;
>  steps: string[];
>  acceptance: string[];
>  labels: string[];
>  priority: "P1"|"P2"|"P3";
>  refs: Array<{ file: string; line: number; sym: string }>;
> };
> export type PlanFile = { plannedAt: string; tasks: Record<string, PlanTask[]> }; // key by pkg
> ```
> 
> ## src/utils.ts
> ```ts
> import { promises as fs } from "fs";
> import * as path from "path";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(d: Record<string,string>) {
>  const out = { ...d }; const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> export async function writeJSON(p: string, data: any){ await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }
> export async function readJSON<T>(p: string): Promise<T> { return JSON.parse(await fs.readFile(p, "utf-8")); }
> export async function readMaybe(p: string){ try{ return await fs.readFile(p,"utf-8"); } catch { return undefined; } }
> export function rel(p: string){ return p.replace(process.cwd().replace(/\\/g,"/") + "/",""); }
> 
> export async function ollamaJSON(model: string, prompt: string) {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method:"POST", headers:{ "Content-Type":"application/json" },
>  body: JSON.stringify({ model, prompt, stream:false, options:{ temperature:0 }, format:"json" })
>  });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
> }
> ```
> 
> ## 01-scan-exports.ts
> ```ts
> /* eslint-disable no-console */
> import { promises as fs } from "fs";
> import * as path from "path";
> import globby from "globby";
> import { Project } from "ts-morph";
> import { parseArgs, writeJSON, rel } from "./utils.js";
> import type { ExportScan, ExportSymbol } from "./types.js";
> 
> const args = parseArgs({
>  "--root": "packages",
>  "--out": ".cache/testgap/exports.json"
> });
> 
> async function main() {
>  const ROOT = path.resolve(args["--root"]);
>  const pkgs = (await fs.readdir(ROOT, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name);
>  const project = new Project({ skipAddingFilesFromTsConfig: true });
>  const symbols: ExportSymbol[] = [];
> 
>  for (const dir of pkgs) {
>  const pkgRoot = path.join(ROOT, dir);
>  const pkgJson = JSON.parse(await fs.readFile(path.join(pkgRoot, "package.json"), "utf-8"));
>  const pkgName = pkgJson.name ?? dir;
>  const files = await globby([`${pkgRoot.replace(/\\/g,"/")}/**/*.{ts,tsx,js,jsx}`, "!**/node_modules/**", "!**/dist/**", "!**/build/**"]);
>  files.forEach(f => project.addSourceFileAtPathIfExists(f));
> 
>  for (const sf of project.getSourceFiles().filter(s => s.getFilePath().startsWith(pkgRoot))) {
>  const file = rel(sf.getFilePath().replace(/\\/g,"/"));
>  for (const [name, decls] of sf.getExportedDeclarations()) {
>  const d = decls[0]; const kind = (d.getKindName() || "").replace("Declaration","").toLowerCase();
>  const pos = d.getStartLineNumber ? { startLine: d.getStartLineNumber(), endLine: d.getEndLineNumber?.() ?? d.getEndLineNumber?.() ?? (d as any).getEndLineNumber?.() ?? 0 } : { startLine: 1, endLine: 1 };
>  symbols.push({ pkg: pkgName, file, kind: (["function","class","variable","interface","type","enum"].includes(kind) ? (kind as any) : "variable"), name, startLine: pos.startLine, endLine: pos.endLine });
>  }
>  }
>  }
> 
>  const out: ExportScan = { scannedAt: new Date().toISOString(), symbols };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`testgap: scanned exports → ${args["--out"]} (${symbols.length} symbols)`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## 02-read-coverage.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import globby from "globby";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON, rel } from "./utils.js";
> import type { CoverageIndex, FileCoverage } from "./types.js";
> 
> const args = parseArgs({
>  "--lcov-globs": "{coverage/lcov.info,packages/**/coverage/lcov.info}",
>  "--out": ".cache/testgap/coverage.json"
> });
> 
> function parseLCOV(raw: string): FileCoverage[] {
>  const out: FileCoverage[] = [];
>  const blocks = raw.split("end_of_record");
>  for (const b of blocks) {
>  const lines = b.trim().split(/\r?\n/);
>  if (!lines.length) continue;
>  let file = "", total = 0, covered = 0;
>  const coveredLines: number[] = [];
>  for (const line of lines) {
>  if (line.startsWith("SF:")) file = rel(line.slice(3).trim());
>  if (line.startsWith("DA:")) {
>  const [nStr, hitsStr] = line.slice(3).split(",");
>  const n = Number(nStr), hits = Number(hitsStr);
>  total++;
>  if (hits > 0) { covered++; coveredLines.push(n); }
>  }
>  }
>  if (file) out.push({ file, linesTotal: total, linesCovered: covered, coveredLines });
>  }
>  return out;
> }
> 
> async function main() {
>  const files = await globby(args["--lcov-globs"].split(",").map(s => s.trim()));
>  const idx: CoverageIndex = { collectedAt: new Date().toISOString(), files: {} };
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  for (const fc of parseLCOV(raw)) idx.files[fc.file] = fc;
>  }
>  await writeJSON(path.resolve(args["--out"]), idx);
>  console.log(`testgap: coverage → ${args["--out"]} (${Object.keys(idx.files).length} files)`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## 03-map-gaps.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON } from "./utils.js";
> import type { ExportScan, CoverageIndex, GapMap, GapItem, SymbolCoverage } from "./types.ts";
> 
> const args = parseArgs({
>  "--exports": ".cache/testgap/exports.json",
>  "--coverage": ".cache/testgap/coverage.json",
>  "--min-lines": "3",
>  "--out": ".cache/testgap/gaps.json"
> });
> 
> function severityFor(ratio: number): "high"|"med"|"low" {
>  if (ratio === 0) return "high";
>  if (ratio < 0.5) return "med";
>  return "low";
> }
> 
> async function main() {
>  const exp = JSON.parse(await fs.readFile(path.resolve(args["--exports"]), "utf-8")) as ExportScan;
>  const cov = JSON.parse(await fs.readFile(path.resolve(args["--coverage"]), "utf-8")) as CoverageIndex;
>  const minLines = Number(args["--min-lines"]);
> 
>  const items: GapItem[] = [];
>  for (const s of exp.symbols) {
>  const fc = cov.files[s.file];
>  const total = Math.max(0, s.endLine - s.startLine + 1);
>  if (total < minLines) continue; // ignore tiny exports like consts
>  let covered = 0;
>  if (fc) {
>  for (let ln = s.startLine; ln <= s.endLine; ln++) if (fc.coveredLines.includes(ln)) covered++;
>  }
>  const ratio = total ? covered / total : 0;
>  const reasons: string[] = [];
>  if (!fc) reasons.push("file not in coverage");
>  if (ratio === 0) reasons.push("exported API uncovered");
>  if (ratio > 0 && ratio < 0.5) reasons.push("partially covered");
> 
>  items.push({
>  symbol: s, covered, total, ratio,
>  severity: severityFor(ratio),
>  reasons
>  });
>  }
> 
>  const out: GapMap = { mappedAt: new Date().toISOString(), items: items.sort((a,b)=>a.ratio-b.ratio) };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`testgap: mapped ${items.length} symbols → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## 04-cookbook-cross.ts
> ```ts
> /* eslint-disable no-console */
> import globby from "globby";
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON } from "./utils.js";
> import type { CookbookCross } from "./types.js";
> 
> const args = parseArgs({
>  "--recipes": "docs/cookbook/**/*.md",
>  "--out": ".cache/testgap/cookbook.json"
> });
> 
> function extractImports(code: string): string[] {
>  const imps: string[] = [];
>  const re1 = /from\s+['"]([^'"]+)['"]/g;
>  const re2 = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
>  let m; while ((m = re1.exec(code))) imps.push(m[1]);
>  while ((m = re2.exec(code))) imps.push(m[1]);
>  return Array.from(new Set(imps));
> }
> 
> async function main() {
>  const files = await globby([args["--recipes"]]);
>  const hits = [];
> 
>  for (const f of files) {
>  const raw = await fs.readFile(f, "utf-8");
>  const m = raw.match(/```(\w+)?[^\n]*\n([\s\S]*?)```/);
>  if (!m) continue;
>  const code = m[2];
>  const imported = extractImports(code).filter(s => s.startsWith("@"));
>  const pkg = imported.find(s => s.includes("/")) || imported[0] || "";
>  hits.push({ recipe: f, pkg, imported });
>  }
> 
>  await writeJSON(path.resolve(args["--out"]), { analyzedAt: new Date().toISOString(), hits });
>  console.log(`testgap: cookbook cross → ${args["--out"]} (${hits.length} recipes)`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## 05-plan.ts
> ```ts
> /* eslint-disable no-console */
> import { z } from "zod";
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON, ollamaJSON } from "./utils.js";
> import type { GapMap, CookbookCross, PlanFile, PlanTask } from "./types.js";
> 
> const args = parseArgs({
>  "--gaps": ".cache/testgap/gaps.json",
>  "--cookbook": ".cache/testgap/cookbook.json",
>  "--out": ".cache/testgap/plans.json",
>  "--model": "qwen3:4b",
>  "--threshold": "0.5", // anything below -> task
>  "--max-per-pkg": "15"
> });
> 
> const TaskSchema = z.object({
>  title: z.string(),
>  summary: z.string(),
>  steps: z.array(z.string()).min(2),
>  acceptance: z.array(z.string()).min(2),
>  labels: z.array(z.string()).optional()
> });
> 
> async function main() {
>  const gaps = JSON.parse(await fs.readFile(path.resolve(args["--gaps"]), "utf-8")) as GapMap;
>  const cook = JSON.parse(await fs.readFile(path.resolve(args["--cookbook"]), "utf-8")) as CookbookCross;
>  const threshold = Number(args["--threshold"]);
>  const maxPer = Number(args["--max-per-pkg"]);
> 
>  const byPkg = new Map<string, typeof gaps.items>();
>  for (const it of gaps.items.filter(i => i.ratio < threshold)) {
>  (byPkg.get(it.symbol.pkg) ?? byPkg.set(it.symbol.pkg, []).get(it.symbol.pkg)!).push(it);
>  }
> 
>  const plan: PlanFile = { plannedAt: new Date().toISOString(), tasks: {} };
> 
>  for (const [pkg, items] of byPkg) {
>  const top = items.slice(0, maxPer);
>  const bullets = top.map(i => `- ${i.symbol.kind} \`${i.symbol.name}\` in ${i.symbol.file}:${i.symbol.startLine}-${i.symbol.endLine} (coverage ${(i.ratio*100).toFixed(0)}%)`).join("\n");
>  const sys = [
>  "You are a senior test engineer. Propose concise tasks to cover missing tests.",
>  "Return ONLY JSON array of tasks, each with: title, summary, steps[], acceptance[], labels[]?"
>  ].join("\n");
>  const user = [
>  `PACKAGE: ${pkg}`,
>  "UNTITLED GAPS:",
>  bullets,
>  "",
>  "Prefer grouping by file or feature; propose jest/vitest tests with examples."
>  ].join("\n");
> 
>  let tasks: PlanTask[] = [];
>  try {
>  const arr = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`);
>  const parsed = z.array(TaskSchema).safeParse(arr);
>  const clean = (parsed.success ? parsed.data : []).slice(0, 7);
>  tasks = clean.map(t => ({
>  title: t.title,
>  summary: t.summary,
>  steps: t.steps,
>  acceptance: t.acceptance,
>  labels: Array.from(new Set([...(t.labels ?? []), "tests","coverage","test-gap"])),
>  priority: "P2",
>  refs: top.map(i => ({ file: i.symbol.file, line: i.symbol.startLine, sym: i.symbol.name }))
>  }));
>  } catch {
>  tasks = [{
>  title: `Add tests for ${pkg} uncovered exports`,
>  summary: "Write unit tests for uncovered exported functions/classes.",
>  steps: ["Create or extend spec files", "Add cases for edge conditions", "Run coverage to confirm improvement"],
>  acceptance: ["Coverage increases for listed exports", "CI green"],
>  labels: ["tests","coverage","test-gap"],
>  priority: "P2",
>  refs: top.map(i => ({ file: i.symbol.file, line: i.symbol.startLine, sym: i.symbol.name }))
>  }];
>  }
>  plan.tasks[pkg] = tasks;
>  }
> 
>  await writeJSON(path.resolve(args["--out"]), plan);
>  console.log(`testgap: planned tasks for ${Object.keys(plan.tasks).length} package(s) → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## 06-write.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import matter from "gray-matter";
> import { parseArgs } from "./utils.js";
> import type { PlanFile } from "./types.js";
> 
> const args = parseArgs({
>  "--plans": ".cache/testgap/plans.json",
>  "--out": "docs/agile/tasks/test-gaps",
>  "--status": "todo",
>  "--priority": "P2"
> });
> 
> const START="<!-- TESTGAP:BEGIN -->";
> const END="<!-- TESTGAP:END -->";
> 
> function strip(text: string){ const si=text.indexOf(START), ei=text.indexOf(END); return (si>=0 && ei>si) ? (text.slice(0,si).trimEnd()+"\n").trimEnd() : text.trimEnd(); }
> function slug(s: string){ return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
> function uuid(){ // @ts-ignore
>  return globalThis.crypto?.randomUUID?.() ?? (require("crypto").randomUUID());
> }
> 
> async function main() {
>  const plans = JSON.parse(await fs.readFile(path.resolve(args["--plans"]), "utf-8")) as PlanFile;
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
>  const index: string[] = ["# Test gap tasks", ""];
> 
>  for (const [pkg, tasks] of Object.entries(plans.tasks)) {
>  for (const t of tasks) {
>  const fname = `${slug(pkg)}-${slug(t.title)}.md`;
>  const p = path.join(args["--out"], fname);
>  const existing = await (async()=>{ try { return await fs.readFile(p,"utf-8"); } catch { return undefined; } })();
>  const gm = existing ? matter(existing) : { content: "", data: {} as any };
>  const fm = { ...(gm as any).data, uuid: gm?.data?.uuid ?? uuid(), title: t.title, package: pkg, status: args["--status"], priority: args["--priority"], labels: Array.from(new Set([...(gm?.data?.labels ?? []), ...(t.labels ?? [])])) };
> 
>  const refsTbl = [
>  "| File | Line | Symbol |",
>  "|---|---:|---|",
>  ...t.refs.map(r => `| \`${r.file}\` | ${r.line} | \`${r.sym}\` |`)
>  ].join("\n");
> 
>  const body = [
>  START,
>  `# ${t.title}`,
>  "",
>  t.summary,
>  "",
>  "## Steps",
>  ...t.steps.map((s,i)=>`${i+1}. ${s}`),
>  "",
>  "## Acceptance",
>  ...t.acceptance.map(a=>`- [ ] ${a}`),
>  "",
>  "## Targets",
>  refsTbl,
>  "",
>  END,
>  ""
>  ].join("\n");
> 
>  const final = matter.stringify((strip(gm.content) ? strip(gm.content)+"\n\n" : "") + body, fm, { language: "yaml" });
>  await fs.writeFile(p, final, "utf-8");
>  index.push(`- [${t.title}](${path.basename(p)}) — ${pkg}`);
>  }
>  }
> 
>  await fs.writeFile(path.join(args["--out"], "README.md"), index.join("\n")+"\n", "utf-8");
>  console.log(`testgap: wrote tasks → ${args["--out"]}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## 07-report.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeText } from "./utils.js";
> import type { GapMap } from "./types.js";
> 
> const args = parseArgs({
>  "--gaps": ".cache/testgap/gaps.json",
>  "--out": "docs/agile/reports/test-gaps"
> });
> 
> async function main() {
>  const gaps = JSON.parse(await fs.readFile(path.resolve(args["--gaps"]), "utf-8")) as GapMap;
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
>  const ts = new Date().toISOString().replace(/[:.]/g,"-");
>  const out = path.join(args["--out"], `test-gaps-${ts}.md`);
> 
>  const rows = gaps.items.slice(0, 500).map(i =>
>  `| ${i.symbol.pkg} | ${i.symbol.kind} | \`${i.symbol.name}\` | ${i.symbol.file}:${i.symbol.startLine} | ${(i.ratio*100).toFixed(0)}% | ${i.reasons.join("; ")} |`
>  );
> 
>  const md = [
>  "# Test gap report",
>  "",
>  `Generated: ${new Date().toLocaleString()}`,
>  "",
>  "| Package | Kind | Symbol | Location | Coverage | Notes |",
>  "|---|---|---|---|---:|---|",
>  ...rows,
>  ""
>  ].join("\n");
> 
>  await writeText(out, md);
>  await writeText(path.join(args["--out"], "README.md"), `# Test gap reports\n\n- [Latest](${path.basename(out)})\n`);
>  console.log(`testgap: report → ${path.relative(process.cwd(), out)}`);
> }
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## Pipeline wiring (`pipelines.yaml`)
> 
> Append:
> 
> ```yaml
> pipelines:
>  - name: test-gap
>  steps:
>  # (Optional) upstream: run your tests to produce lcov.info
>  # - id: tg-run-tests
>  # shell: "pnpm -w test -- --coverage" # or your workspace runner
>  # outputs: ["coverage/lcov.info", "packages/**/coverage/lcov.info"]
> 
>  - id: tg-exports
>  shell: "pnpm --filter @promethean/testgap tg:01-scan-exports --root packages --out .cache/testgap/exports.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/testgap/exports.json"
> 
>  - id: tg-coverage
>  # deps: ["tg-run-tests"]
>  shell: "pnpm --filter @promethean/testgap tg:02-read-coverage --lcov-globs \"{coverage/lcov.info,packages/**/coverage/lcov.info}\" --out .cache/testgap/coverage.json"
>  inputs:
>  - "coverage/lcov.info"
>  - "packages/**/coverage/lcov.info"
>  outputs:
>  - ".cache/testgap/coverage.json"
> 
>  - id: tg-map
>  deps: ["tg-exports","tg-coverage"]
>  shell: "pnpm --filter @promethean/testgap tg:03-map-gaps --exports .cache/testgap/exports.json --coverage .cache/testgap/coverage.json --min-lines 3 --out .cache/testgap/gaps.json"
>  inputs:
>  - ".cache/testgap/exports.json"
>  - ".cache/testgap/coverage.json"
>  outputs:
>  - ".cache/testgap/gaps.json"
> 
>  - id: tg-cookbook
>  deps: ["tg-map"]
>  shell: "pnpm --filter @promethean/testgap tg:04-cookbook-cross --recipes docs/cookbook/**/*.md --out .cache/testgap/cookbook.json"
>  inputs:
>  - "docs/cookbook/**/*.md"
>  outputs:
>  - ".cache/testgap/cookbook.json"
> 
>  - id: tg-plan
>  deps: ["tg-cookbook"]
>  shell: "pnpm --filter @promethean/testgap tg:05-plan --gaps .cache/testgap/gaps.json --cookbook .cache/testgap/cookbook.json --out .cache/testgap/plans.json --model qwen3:4b --threshold 0.5 --max-per-pkg 15"
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/testgap/gaps.json"
>  - ".cache/testgap/cookbook.json"
>  outputs:
>  - ".cache/testgap/plans.json"
> 
>  - id: tg-write
>  deps: ["tg-plan"]
>  shell: "pnpm --filter @promethean/testgap tg:06-write --plans .cache/testgap/plans.json --out docs/agile/tasks/test-gaps"
>  inputs:
>  - ".cache/testgap/plans.json"
>  outputs:
>  - "docs/agile/tasks/test-gaps/*.md"
> 
>  - id: tg-report
>  deps: ["tg-map"]
>  shell: "pnpm --filter @promethean/testgap tg:07-report --gaps .cache/testgap/gaps.json --out docs/agile/reports/test-gaps"
>  inputs:
>  - ".cache/testgap/gaps.json"
>  outputs:
>  - "docs/agile/reports/test-gaps/*.md"
> ```
> 
> ---
> 
> ## Quick run
> 
> ```bash
> pnpm -w i
> pnpm -w --filter @promethean/testgap build
> 
> # make sure coverage exists (jest/vitest with lcov)
> # pnpm -w test -- --coverage
> 
> piper run test-gap
> ```
> 
> ---
> 
> ## Why this works
> 
> - **Symbol-level** mapping (via ts-morph) means we find *exported* API that lacks tests, not just files. 
> - **LCOV** support fits Jest/Vitest out of the box. 
> - **Cookbook cross-check** stops you from writing unit tests where a runnable recipe already exercises behavior. 
> - Tasks and report are **Obsidian-friendly**, marker-safe, and re-runnable.
> 
> Want me to add a “**gate**” step that fails the pipeline if any package drops below a configurable API coverage threshold (e.g., 70% of exported functions covered)?
<!-- UID: e057187f-e9b4-4e00-8963-82553b8e221b -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:32 PM
> add that gate
<!-- UID: 24d59a87-27ec-4e2f-9d86-52d5befc1144 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:32 PM
> Absolutely—here’s a clean **gate** that fails the pipeline if exported-API coverage drops below a threshold.
> 
> ---
> 
> ## 1) Add a new step to `@promethean/testgap`: `08-gate.ts`
> 
> ### `packages/testgap/package.json` (add script & bin)
> ```json
> {
>  "bin": {
>  "tg:08-gate": "dist/08-gate.js"
>  },
>  "scripts": {
>  "tg:08-gate": "tsx src/08-gate.ts"
>  }
> }
> ```
> 
> ### `packages/testgap/src/08-gate.ts`
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON } from "./utils.js";
> 
> type GapItem = {
>  symbol: { pkg: string; file: string; kind: string; name: string; startLine: number; endLine: number };
>  covered: number; total: number; ratio: number;
> };
> 
> const args = parseArgs({
>  "--gaps": ".cache/testgap/gaps.json",
>  "--out": ".cache/testgap/gate.json",
>  "--threshold": "0.70", // 70% default
>  "--metric": "symbols", // symbols | lines
>  "--min-lines": "3" // ignore exports with fewer lines than this (already filtered upstream, but kept here defensively)
> });
> 
> function safePct(n: number) { return isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
> 
> async function main() {
>  const threshold = Number(args["--threshold"]);
>  const metric = (args["--metric"] || "symbols").toLowerCase() as "symbols"|"lines";
>  const minLines = Number(args["--min-lines"]);
> 
>  const gapsRaw = JSON.parse(await fs.readFile(path.resolve(args["--gaps"]), "utf-8")) as { items: GapItem[] };
>  const items = gapsRaw.items.filter(i => i.total >= minLines);
> 
>  const byPkg = new Map<string, GapItem[]>();
>  for (const it of items) (byPkg.get(it.symbol.pkg) ?? byPkg.set(it.symbol.pkg, []).get(it.symbol.pkg)!).push(it);
> 
>  const report: any = { threshold, metric, packages: {}, failures: [] as string[], computedAt: new Date().toISOString() };
> 
>  for (const [pkg, list] of byPkg) {
>  if (!list.length) { report.packages[pkg] = { coverage: 1, pass: true, reason: "no-sized-exports" }; continue; }
> 
>  let coverage = 0;
>  if (metric === "symbols") {
>  const total = list.length;
>  const covered = list.filter(i => i.ratio > 0).length;
>  coverage = safePct(covered / total);
>  report.packages[pkg] = { metric: "symbols", totalSymbols: total, coveredSymbols: covered, coverage, pass: coverage >= threshold };
>  } else {
>  const total = list.reduce((a, b) => a + b.total, 0);
>  const covered = list.reduce((a, b) => a + b.covered, 0);
>  coverage = safePct(covered / Math.max(1, total));
>  report.packages[pkg] = { metric: "lines", totalLines: total, coveredLines: covered, coverage, pass: coverage >= threshold };
>  }
> 
>  if (coverage < threshold) report.failures.push(pkg);
>  }
> 
>  await writeJSON(path.resolve(args["--out"]), report);
> 
>  if (report.failures.length) {
>  console.error(
>  `testgap: gate FAILED for ${report.failures.length} package(s) `
>  + `below ${(threshold*100).toFixed(0)}% (${metric}). Failing: ${report.failures.join(", ")}`
>  );
>  process.exit(1);
>  } else {
>  console.log(`testgap: gate PASSED — all packages ≥ ${(threshold*100).toFixed(0)}% (${metric}).`);
>  }
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> What it checks:
> - **symbols** (default): fraction of exported symbols with any coverage (`ratio > 0`)
> - **lines**: line-weighted coverage across exported symbols
> - Ignores tiny exports under `--min-lines` (defaults to 3)
> 
> Writes a machine-readable summary to `.cache/testgap/gate.json`, and exits **non-zero** if any package is below the threshold.
> 
> ---
> 
> ## 2) Wire it into the pipeline
> 
> Update your `pipelines.yaml` test-gap pipeline to include the gate **after mapping** (so it has symbol coverage), before planning/writing tasks:
> 
> ```yaml
> pipelines:
>  - name: test-gap
>  steps:
>  - id: tg-exports
>  shell: "pnpm --filter @promethean/testgap tg:01-scan-exports --root packages --out .cache/testgap/exports.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs: [".cache/testgap/exports.json"]
> 
>  - id: tg-coverage
>  shell: "pnpm --filter @promethean/testgap tg:02-read-coverage --lcov-globs \"{coverage/lcov.info,packages/**/coverage/lcov.info}\" --out .cache/testgap/coverage.json"
>  inputs:
>  - "coverage/lcov.info"
>  - "packages/**/coverage/lcov.info"
>  outputs: [".cache/testgap/coverage.json"]
> 
>  - id: tg-map
>  deps: ["tg-exports","tg-coverage"]
>  shell: "pnpm --filter @promethean/testgap tg:03-map-gaps --exports .cache/testgap/exports.json --coverage .cache/testgap/coverage.json --min-lines 3 --out .cache/testgap/gaps.json"
>  inputs:
>  - ".cache/testgap/exports.json"
>  - ".cache/testgap/coverage.json"
>  outputs: [".cache/testgap/gaps.json"]
> 
>  # 🟥 GATE — fails pipeline if below threshold
>  - id: tg-gate
>  deps: ["tg-map"]
>  shell: "pnpm --filter @promethean/testgap tg:08-gate --gaps .cache/testgap/gaps.json --out .cache/testgap/gate.json --threshold 0.70 --metric symbols"
>  inputs: [".cache/testgap/gaps.json"]
>  outputs: [".cache/testgap/gate.json"]
> 
>  - id: tg-cookbook
>  deps: ["tg-gate"] # only runs if gate passes
>  shell: "pnpm --filter @promethean/testgap tg:04-cookbook-cross --recipes docs/cookbook/**/*.md --out .cache/testgap/cookbook.json"
>  inputs: ["docs/cookbook/**/*.md"]
>  outputs: [".cache/testgap/cookbook.json"]
> 
>  - id: tg-plan
>  deps: ["tg-cookbook"]
>  shell: "pnpm --filter @promethean/testgap tg:05-plan --gaps .cache/testgap/gaps.json --cookbook .cache/testgap/cookbook.json --out .cache/testgap/plans.json --model qwen3:4b --threshold 0.5 --max-per-pkg 15"
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/testgap/gaps.json"
>  - ".cache/testgap/cookbook.json"
>  outputs: [".cache/testgap/plans.json"]
> 
>  - id: tg-write
>  deps: ["tg-plan"]
>  shell: "pnpm --filter @promethean/testgap tg:06-write --plans .cache/testgap/plans.json --out docs/agile/tasks/test-gaps"
>  inputs: [".cache/testgap/plans.json"]
>  outputs: ["docs/agile/tasks/test-gaps/*.md"]
> 
>  - id: tg-report
>  deps: ["tg-map"]
>  shell: "pnpm --filter @promethean/testgap tg:07-report --gaps .cache/testgap/gaps.json --out docs/agile/reports/test-gaps"
>  inputs: [".cache/testgap/gaps.json"]
>  outputs: ["docs/agile/reports/test-gaps/*.md"]
> ```
> 
> ### Tuning knobs
> - Raise/lower the gate with `--threshold` (e.g., `0.80`).
> - Switch metric with `--metric lines` for line-weighted coverage.
> - Tighten `--min-lines` if you want to ignore tiny exports (like re-exports or const enums).
> 
> That’s it. Once you add/build this step, **any drop** below your threshold blocks the pipeline with a clear failure message and a JSON artifact for CI dashboards.
<!-- UID: 95967d5f-68a0-436f-ae6d-d2854310b33b -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:42 PM
> So I've been having my agents go through a build errors file I generate and one by one go ahead and fix them, but realisticly I don't think I need an agent for this.
> 
> We need a pipeline that generates the build errors list, then iteratively attempts to generate ts-morph calls until the error is resolved, erroring out after a set number of cycles, tracking all previously tried variations and appending those to the context each failiure to let the model know it didn't work.
<!-- UID: a0f205bc-1c81-427d-8bce-ac7f83242d4e -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:42 PM
> Heck yeah — let’s automate “fix build, iterate, learn” without a human-in-the-loop. Here’s a focused **@promethean/buildfix** package + a **buildfix** pipeline that:
> 
> 1) runs `tsc` and captures diagnostics 
> 2) for each error, loops up to N cycles:
>  - asks Ollama for a **ts-morph** fix snippet (ESM JS)
>  - runs it against a `ts-morph` `Project`
>  - rebuilds; if error remains, feeds **all previous attempts** back into the next prompt
> 3) stops when resolved or on max cycles, with a report + history
> 
> Everything is idempotent and writes under `.cache/buildfix/`.
> 
> ---
> 
> # packages/buildfix/
> 
> ```
> packages/buildfix/
>  package.json
>  tsconfig.json
>  src/
>  types.ts
>  utils.ts
>  01-errors.ts
>  02-iterate.ts
>  03-report.ts
> ```
> 
> ## package.json
> ```json
> {
>  "name": "@promethean/buildfix",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "bin": {
>  "bf:01-errors": "dist/01-errors.js",
>  "bf:02-iterate": "dist/02-iterate.js",
>  "bf:03-report": "dist/03-report.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json",
>  "bf:01-errors": "tsx src/01-errors.ts",
>  "bf:02-iterate": "tsx src/02-iterate.ts",
>  "bf:03-report": "tsx src/03-report.ts",
>  "bf:all": "pnpm bf:01-errors && pnpm bf:02-iterate && pnpm bf:03-report"
>  },
>  "dependencies": {
>  "globby": "^14.0.2",
>  "ts-morph": "^22.0.0",
>  "yaml": "^2.5.0",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> ## tsconfig.json
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "NodeNext",
>  "moduleResolution": "NodeNext",
>  "outDir": "dist",
>  "strict": true,
>  "skipLibCheck": true,
>  "resolveJsonModule": true,
>  "esModuleInterop": true
>  },
>  "include": ["src/**/*.ts"]
> }
> ```
> 
> ## src/types.ts
> ```ts
> export type BuildError = {
>  file: string;
>  line: number;
>  col: number;
>  code: string; // TS2345
>  message: string;
>  frame: string; // code frame
>  key: string; // `${code}|${file}|${line}`
> };
> 
> export type ErrorList = {
>  createdAt: string;
>  tsconfig: string;
>  errors: BuildError[];
> };
> 
> export type Attempt = {
>  n: number;
>  snippetPath: string;
>  planSummary: string;
>  tscBeforeCount: number;
>  tscAfterCount: number;
>  resolved: boolean;
>  errorStillPresent: boolean;
>  newErrors: string[];
> };
> 
> export type History = {
>  key: string;
>  file: string;
>  code: string;
>  attempts: Attempt[];
>  resolvedAt?: string;
> };
> 
> export type Summary = {
>  iteratedAt: string;
>  tsconfig: string;
>  maxCycles: number;
>  items: Array<{ key: string; resolved: boolean; attempts: number; lastSnippet?: string }>;
> };
> ```
> 
> ## src/utils.ts
> ```ts
> import { exec as _exec } from "child_process";
> import { promises as fs } from "fs";
> import * as path from "path";
> import { fileURLToPath, pathToFileURL } from "url";
> import { Project } from "ts-morph";
> 
> export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
> 
> export function parseArgs(def: Record<string,string>) {
>  const out = { ...def }; const a = process.argv.slice(2);
>  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
>  const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
>  return out;
> }
> 
> export function sha1(s: string){ let h=2166136261>>>0; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return "h"+h.toString(16); }
> 
> export async function run(cmd: string, cwd = process.cwd()): Promise<{ code: number|null; out: string; err: string }> {
>  return new Promise(res => {
>  _exec(cmd, { cwd, maxBuffer: 1024*1024*64, env: { ...process.env } }, (e, stdout, stderr) => {
>  res({ code: e ? (e as any).code ?? 1 : 0, out: String(stdout), err: String(stderr) });
>  });
>  });
> }
> 
> export function parseTsc(text: string) {
>  // Matches: path/file.ts(12,34): error TS2345: Message...
>  const re = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+([\s\S]+?)$/gm;
>  const items: Array<{file:string; line:number; col:number; code:string; message:string}> = [];
>  let m: RegExpExecArray | null;
>  while ((m = re.exec(text))) {
>  items.push({ file: m[1], line: Number(m[2]), col: Number(m[3]), code: m[4], message: m[5].trim() });
>  }
>  return items;
> }
> 
> export async function codeFrame(file: string, line: number, span=3) {
>  try {
>  const raw = await fs.readFile(file, "utf-8");
>  const lines = raw.split(/\r?\n/);
>  const start = Math.max(1, line - span);
>  const end = Math.min(lines.length, line + span);
>  const pad = (n:number)=>String(n).padStart(String(end).length, " ");
>  return lines.slice(start-1, end).map((ln, i) => `${pad(start+i)} | ${ln}`).join("\n");
>  } catch { return ""; }
> }
> 
> export async function tsc(tsconfig: string) {
>  const { code, out, err } = await run(`npx tsc -p ${tsconfig} --noEmit --pretty false`);
>  const text = out + "\n" + err;
>  const diags = parseTsc(text);
>  return { ok: code === 0, text, diags };
> }
> 
> export async function ensureDir(p: string){ await fs.mkdir(p, { recursive: true }); }
> 
> export async function writeJSON(p: string, data: any) {
>  await ensureDir(path.dirname(p));
>  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
> }
> 
> export async function readJSON<T>(p: string): Promise<T | undefined> {
>  try { return JSON.parse(await fs.readFile(p, "utf-8")); } catch { return undefined; }
> }
> 
> export async function importSnippet(snippetPath: string) {
>  const mod = await import(pathToFileURL(path.resolve(snippetPath)).toString());
>  if (typeof mod.apply !== "function") throw new Error("snippet must export async function apply(project)");
>  return mod.apply as (project: Project) => Promise<void>;
> }
> 
> export async function applySnippetToProject(tsconfigPath: string, snippetPath: string) {
>  const project = new Project({ tsConfigFilePath: path.resolve(tsconfigPath) });
>  const apply = await importSnippet(snippetPath);
>  await apply(project);
>  await project.save();
> }
> 
> export async function ollamaJSON(model: string, prompt: string) {
>  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
>  method: "POST",
>  headers: { "Content-Type":"application/json" },
>  body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
>  });
>  if (!res.ok) throw new Error(`ollama ${res.status}`);
>  const data = await res.json();
>  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
>  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
> }
> ```
> 
> ## src/01-errors.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, tsc, codeFrame, writeJSON } from "./utils.js";
> import type { ErrorList, BuildError } from "./types.js";
> 
> const args = parseArgs({
>  "--tsconfig": "tsconfig.json",
>  "--out": ".cache/buildfix/errors.json"
> });
> 
> async function main() {
>  const tsconfig = path.resolve(args["--tsconfig"]);
>  const { diags } = await tsc(tsconfig);
> 
>  const errors: BuildError[] = [];
>  for (const d of diags) {
>  const file = path.resolve(d.file);
>  const frame = await codeFrame(file, d.line);
>  const key = `${d.code}|${file}|${d.line}`;
>  errors.push({ file, line: d.line, col: d.col, code: d.code, message: d.message, frame, key });
>  }
> 
>  const out: ErrorList = { createdAt: new Date().toISOString(), tsconfig, errors };
>  await writeJSON(path.resolve(args["--out"]), out);
>  console.log(`buildfix: collected ${errors.length} error(s) → ${args["--out"]}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## src/02-iterate.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { z } from "zod";
> import { parseArgs, writeJSON, readJSON, tsc, ensureDir, applySnippetToProject, ollamaJSON } from "./utils.js";
> import type { ErrorList, History, Attempt, Summary } from "./types.js";
> 
> const args = parseArgs({
>  "--errors": ".cache/buildfix/errors.json",
>  "--out": ".cache/buildfix",
>  "--model": "qwen3:4b",
>  "--max-cycles": "5",
>  "--only-code": "", // e.g. TS2345
>  "--only-file": "", // substring filter
>  "--tsconfig": "" // override if needed
> });
> 
> const PlanSchema = z.object({
>  title: z.string().min(1),
>  rationale: z.string().min(1),
>  snippet: z.string().min(30) // ESM JS code with 'export async function apply(project){...}'
> });
> 
> function promptFor(error: any, history: History) {
>  const prev = history.attempts.map(a => 
>  `ATTEMPT #${a.n}
> Plan: ${a.planSummary}
> Snippet: ${path.basename(a.snippetPath)}
> Result: tsc ${a.resolved ? "OK" : "failed"}; after=${a.tscAfterCount} errors; stillPresent=${a.errorStillPresent}
> `).join("\n");
> 
>  return [
> `You are a TypeScript refactoring agent using ts-morph.
> Goal: fix the specific TypeScript error below by modifying source with ts-morph calls.
> 
> Return ONLY JSON with keys:
> - title: short label of your approach
> - rationale: why this fix should work
> - snippet: ESM JavaScript code (NOT TypeScript). It MUST export:
>  export async function apply(project) { /* ts-morph edits */ }
>  You can: add imports/exports, adjust types, make params optional, rename symbols, create stubs, etc.
>  Use project to navigate & save edits. Do NOT run shell commands. Do NOT use fs.
> 
> Target error:
> FILE: ${error.file}
> LINE: ${error.line}, COL: ${error.col}
> CODE: ${error.code}
> MESSAGE: ${error.message}
> 
> Code frame:
> ${error.frame}
> 
> Previous attempts (for context; avoid repeating ideas):
> ${prev || "(none)"}`
>  ].join("\n");
> }
> 
> function errorStillPresent(diags: any[], key: string) {
>  // compare by code + file, and near the original line (±2)
>  const [code, file, lineStr] = key.split("|");
>  const line = Number(lineStr);
>  return diags.some(d => d.code === code && path.resolve(d.file) === path.resolve(file) && Math.abs(d.line - line) <= 2);
> }
> 
> async function main() {
>  const errors = await readJSON<ErrorList>(path.resolve(args["--errors"]));
>  if (!errors) throw new Error("errors.json not found");
>  const tsconfig = args["--tsconfig"] || errors.tsconfig;
>  const onlyCode = (args["--only-code"] || "").trim();
>  const onlyFile = (args["--only-file"] || "").trim();
>  const maxCycles = Number(args["--max-cycles"]);
>  const OUT = path.resolve(args["--out"]);
> 
>  const filtered = errors.errors.filter(e =>
>  (!onlyCode || e.code === onlyCode) && (!onlyFile || e.file.includes(onlyFile))
>  );
> 
>  const summary: Summary = { iteratedAt: new Date().toISOString(), tsconfig, maxCycles, items: [] };
> 
>  for (const err of filtered) {
>  const histPath = path.join(OUT, "history", err.key, "history.json");
>  await ensureDir(path.dirname(histPath));
>  const history: History = (await readJSON<History>(histPath)) ?? { key: err.key, file: err.file, code: err.code, attempts: [] };
> 
>  let resolved = false;
> 
>  for (let n = history.attempts.length + 1; n <= maxCycles; n++) {
>  // 1) build current to know baseline
>  const before = await tsc(tsconfig);
> 
>  // if the error already disappeared (e.g., manual fix), stop
>  if (!errorStillPresent(before.diags, err.key)) { resolved = true; break; }
> 
>  // 2) ask LLM for a new plan (include prior attempts)
>  let plan: z.infer<typeof PlanSchema>;
>  try {
>  const obj = await ollamaJSON(args["--model"], promptFor(err, history));
>  const parsed = PlanSchema.safeParse(obj);
>  if (!parsed.success) throw new Error("invalid plan JSON");
>  plan = parsed.data;
>  } catch (e) {
>  console.error(`✖ plan generation failed for ${err.key}:`, e);
>  break;
>  }
> 
>  // 3) write snippet & execute
>  const root = path.join(OUT, "snippets", err.key);
>  await ensureDir(root);
>  const snippetPath = path.join(root, `attempt-${String(n).padStart(2,"0")}.mjs`);
>  await fs.writeFile(snippetPath, plan.snippet, "utf-8");
> 
>  try {
>  await applySnippetToProject(tsconfig, snippetPath);
>  } catch (e) {
>  console.error(`✖ snippet apply failed (attempt #${n}) for ${err.key}:`, e);
>  // record failed attempt anyway
>  }
> 
>  // 4) rebuild and evaluate
>  const after = await tsc(tsconfig);
> 
>  const att: Attempt = {
>  n,
>  snippetPath,
>  planSummary: plan.title,
>  tscBeforeCount: before.diags.length,
>  tscAfterCount: after.diags.length,
>  resolved: after.ok || !errorStillPresent(after.diags, err.key),
>  errorStillPresent: errorStillPresent(after.diags, err.key),
>  newErrors: after.diags.slice(0, 5).map(d => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`)
>  };
> 
>  history.attempts.push(att);
>  await writeJSON(histPath, history);
> 
>  if (att.resolved) { resolved = true; history.resolvedAt = new Date().toISOString(); await writeJSON(histPath, history); break; }
>  }
> 
>  summary.items.push({
>  key: err.key,
>  resolved,
>  attempts: history.attempts.length,
>  lastSnippet: history.attempts.at(-1)?.snippetPath
>  });
>  }
> 
>  await writeJSON(path.join(OUT, "summary.json"), summary);
>  console.log(`buildfix: iterate complete — resolved ${summary.items.filter(i=>i.resolved).length}/${summary.items.length}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ## src/03-report.ts
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, readJSON } from "./utils.js";
> import type { Summary, History } from "./types.js";
> 
> const args = parseArgs({
>  "--history-root": ".cache/buildfix/history",
>  "--summary": ".cache/buildfix/summary.json",
>  "--out": "docs/agile/reports/buildfix"
> });
> 
> async function main() {
>  const sum = await readJSON<Summary>(path.resolve(args["--summary"]));
>  if (!sum) throw new Error("summary not found");
> 
>  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
>  const ts = new Date().toISOString().replace(/[:.]/g, "-");
>  const out = path.join(args["--out"], `buildfix-${ts}.md`);
> 
>  const rows = await Promise.all(sum.items.map(async it => {
>  const hp = path.join(args["--history-root"], it.key, "history.json");
>  const hist = await readJSON<History>(hp);
>  const last = hist?.attempts.at(-1);
>  return `| \`${it.key}\` | ${it.resolved ? "✅" : "❌"} | ${it.attempts} | ${last?.planSummary ?? ""} | ${last?.tscBeforeCount ?? ""}→${last?.tscAfterCount ?? ""} | ${last?.snippetPath ? `\`${last.snippetPath}\`` : ""} |`;
>  }));
> 
>  const md = [
>  "# Buildfix report",
>  "",
>  `Generated: ${new Date().toLocaleString()}`,
>  "",
>  "| Error key | Resolved | Attempts | Last plan | Errors Δ | Snippet |",
>  "|---|---:|---:|---|---|---|",
>  ...rows,
>  ""
>  ].join("\n");
> 
>  await fs.writeFile(out, md, "utf-8");
>  await fs.writeFile(path.join(args["--out"], "README.md"), `# Buildfix Reports\n\n- [Latest](${path.basename(out)})\n`);
>  console.log(`buildfix: report → ${path.relative(process.cwd(), out)}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # Pipeline wiring (`pipelines.yaml`)
> 
> Append this **buildfix** pipeline:
> 
> ```yaml
> pipelines:
>  - name: buildfix
>  steps:
>  - id: bf-errors
>  shell: "pnpm --filter @promethean/buildfix bf:01-errors --tsconfig tsconfig.json --out .cache/buildfix/errors.json"
>  inputs:
>  - "tsconfig.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/buildfix/errors.json"
> 
>  - id: bf-iterate
>  deps: ["bf-errors"]
>  shell: >
>  pnpm --filter @promethean/buildfix
>  bf:02-iterate
>  --errors .cache/buildfix/errors.json
>  --out .cache/buildfix
>  --model qwen3:4b
>  --max-cycles 5
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/buildfix/errors.json"
>  - "tsconfig.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/buildfix/summary.json"
>  - ".cache/buildfix/history/**"
>  - ".cache/buildfix/snippets/**"
> 
>  - id: bf-report
>  deps: ["bf-iterate"]
>  shell: "pnpm --filter @promethean/buildfix bf:03-report --summary .cache/buildfix/summary.json --history-root .cache/buildfix/history --out docs/agile/reports/buildfix"
>  inputs:
>  - ".cache/buildfix/summary.json"
>  outputs:
>  - "docs/agile/reports/buildfix/*.md"
> ```
> 
> ---
> 
> ## How the LLM snippet looks (what it will return)
> 
> Your prompt enforces **ESM JS** returning an `apply(project)` function. A typical snippet the model will produce (and we will run) looks like:
> 
> ```js
> // example returned by the model (we store this as attempt-01.mjs)
> import { SyntaxKind } from "ts-morph";
> 
> export async function apply(project) {
>  // Find the file and add a missing export
>  const sf = project.getSourceFiles().find(f => f.getFilePath().endsWith("src/utils/date.ts"));
>  if (!sf) return;
> 
>  const fn = sf.getFunctions().find(f => f.getName() === "formatDate");
>  if (fn && !fn.hasExportKeyword()) fn.setIsExported(true);
> }
> ```
> 
> > We validate the JSON envelope with Zod, save the snippet, import it dynamically, call `apply(project)`, save the project, then rebuild.
> 
> ---
> 
> ## Knobs you can tweak
> 
> - `--only-code TS2345` or `--only-file src/foo.ts` to target a subset
> - `--max-cycles 3..10` to cap attempts per error
> - Switch model with `--model <ollama-model>`
> - Use a different `--tsconfig` if the project’s root isn’t `tsconfig.json`
> 
> ---
> 
> ## Notes / guarantees
> 
> - **Idempotent**: history-based; re-running continues from last attempt up to max.
> - **Context growth**: Every failed attempt is summarized back to the model to avoid repeats.
> - **Safety**: All edits go through `ts-morph` (no shell/fs in snippets). If you want a hard gate, you can post-check diffs or run tests before accepting a fix.
> 
> Want me to add an optional `--git` mode that creates a branch and commits after each successful attempt (or each attempt), so you can revert easily?
<!-- UID: da7541a0-0b26-403c-89ef-9d70256b1803 -->

---




>[!nexus_user] **User** - 08/31/2025 at 6:50 PM
> git mode
<!-- UID: 97d8464c-5fdb-4782-b168-6079d0edb373 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 6:50 PM
> Absolutely—here’s a clean, optional **git mode** for `@promethean/buildfix` that can:
> 
> - work on a **per-error branch** (`buildfix/<TSCODE>/<file>_<line>`) 
> - **commit** `ts-morph` edits **per attempt** (or only on success) 
> - optionally **push** and even open a **PR** via `gh`
> 
> Below are drop-in changes (minimal diffs), plus pipeline wiring.
> 
> ---
> 
> ## 1) Extend types for git metadata
> 
> ### `packages/buildfix/src/types.ts` (patch)
> ```ts
> export type Attempt = {
>  n: number;
>  snippetPath: string;
>  planSummary: string;
>  tscBeforeCount: number;
>  tscAfterCount: number;
>  resolved: boolean;
>  errorStillPresent: boolean;
>  newErrors: string[];
>  // git mode
>  branch?: string;
>  commitSha?: string;
>  pushed?: boolean;
>  prUrl?: string;
> };
> 
> export type Summary = {
>  iteratedAt: string;
>  tsconfig: string;
>  maxCycles: number;
>  items: Array<{ key: string; resolved: boolean; attempts: number; lastSnippet?: string; branch?: string }>;
> };
> ```
> 
> ---
> 
> ## 2) Add tiny git helpers
> 
> ### `packages/buildfix/src/utils.ts` (patch)
> ```ts
> import { exec as _exec } from "child_process";
> // ...
> 
> export async function git(cmd: string, cwd = process.cwd()) {
>  return new Promise<{ code: number|null; out: string; err: string }>((resolve) => {
>  _exec(`git ${cmd}`, { cwd, maxBuffer: 1024*1024*64, env: { ...process.env } }, (e, stdout, stderr) => {
>  resolve({ code: e ? (e as any).code ?? 1 : 0, out: String(stdout).trim(), err: String(stderr).trim() });
>  });
>  });
> }
> 
> export async function isGitRepo() {
>  const r = await git("rev-parse --is-inside-work-tree");
>  return r.code === 0 && r.out === "true";
> }
> 
> export function sanitizeBranch(s: string) {
>  return s.replace(/[^a-zA-Z0-9._/-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
> }
> ```
> 
> ---
> 
> ## 3) Add git-mode flags + logic to the iterator
> 
> ### `packages/buildfix/src/02-iterate.ts` (replace file or patch the shown parts)
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { z } from "zod";
> import {
>  parseArgs, writeJSON, readJSON, tsc, ensureDir,
>  applySnippetToProject, ollamaJSON,
>  isGitRepo, git, sanitizeBranch
> } from "./utils.js";
> import type { ErrorList, History, Attempt, Summary } from "./types.js";
> 
> const args = parseArgs({
>  "--errors": ".cache/buildfix/errors.json",
>  "--out": ".cache/buildfix",
>  "--model": "qwen3:4b",
>  "--max-cycles": "5",
>  "--only-code": "",
>  "--only-file": "",
>  "--tsconfig": "",
>  // git mode
>  "--git": "off", // off | per-error
>  "--commit-on": "always", // always | success
>  "--branch-prefix": "buildfix",
>  "--remote": "origin",
>  "--push": "false",
>  "--use-gh": "false" // requires GitHub CLI
> });
> 
> const PlanSchema = z.object({
>  title: z.string().min(1),
>  rationale: z.string().min(1),
>  snippet: z.string().min(30)
> });
> 
> // branch name: buildfix/TS2345/src-foo-bar_ts/123
> function makeBranch(err: any) {
>  const fileSlug = err.file.replace(process.cwd() + path.sep, "").replace(/[\/\\\.]/g, "-");
>  const raw = `${args["--branch-prefix"]}/${err.code}/${fileSlug}/${err.line}`;
>  return sanitizeBranch(raw);
> }
> 
> async function ensureBranch(branch: string) {
>  const cur = await git("rev-parse --abbrev-ref HEAD");
>  if (cur.code !== 0) throw new Error("git not available");
>  const chk = await git(`rev-parse --verify ${branch}`);
>  if (chk.code !== 0) {
>  await git(`checkout -b ${branch}`);
>  } else {
>  await git(`checkout ${branch}`);
>  }
> }
> 
> async function commitIfChanges(message: string) {
>  const st = await git("status --porcelain");
>  if (st.out.length === 0) return undefined;
>  await git("add -A");
>  const c = await git(`commit -m "${message.replace(/"/g, '\\"')}"`);
>  if (c.code !== 0) return undefined;
>  const sha = await git("rev-parse HEAD");
>  return sha.out || undefined;
> }
> 
> async function pushBranch(branch: string, remote: string) {
>  const p = await git(`push ${remote} ${branch}`);
>  return p.code === 0;
> }
> 
> async function createPR(branch: string, title: string, bodyPath: string) {
>  const r = await git(`config --get remote.${args["--remote"]}.url`);
>  if (r.code !== 0) return undefined;
>  // Best-effort gh PR create
>  const { exec } = await import("child_process");
>  return new Promise<string|undefined>((resolve) => {
>  exec(`gh pr create --fill --title "${title.replace(/"/g,'\\"')}" --body-file "${bodyPath}" --head ${branch}`, { env: { ...process.env } }, (err, stdout) => {
>  resolve(err ? undefined : String(stdout).trim());
>  });
>  });
> }
> 
> function promptFor(error: any, history: History) {
>  const prev = history.attempts.map(a =>
> `ATTEMPT #${a.n}
> Plan: ${a.planSummary}
> Commit: ${a.commitSha ?? "(no-commit)"}${a.pushed ? " (pushed)" : ""}
> Result: tsc ${a.resolved ? "OK" : "failed"}; after=${a.tscAfterCount}; stillPresent=${a.errorStillPresent}
> `).join("\n");
>  return [
> `You are a TypeScript refactoring agent using ts-morph.
> Goal: fix the specific TypeScript error below by modifying source with ts-morph calls.
> 
> Return ONLY JSON with:
> - title
> - rationale
> - snippet (ESM JS) with:
>  export async function apply(project) { /* ts-morph edits */ }
> 
> Constraints:
> - Use project to edit files; do not spawn processes or use fs.
> - Prefer minimal, targeted edits.
> 
> Target error:
> FILE: ${error.file}
> LINE: ${error.line}, COL: ${error.col}
> CODE: ${error.code}
> MESSAGE: ${error.message}
> 
> Code frame:
> ${error.frame}
> 
> Previous attempts:
> ${prev || "(none)"}`
>  ].join("\n");
> }
> 
> function errorStillPresent(diags: any[], key: string) {
>  const [code, file, lineStr] = key.split("|"); const line = Number(lineStr);
>  return diags.some(d => d.code === code && path.resolve(d.file) === path.resolve(file) && Math.abs(d.line - line) <= 2);
> }
> 
> async function main() {
>  const errors = await readJSON<ErrorList>(path.resolve(args["--errors"]));
>  if (!errors) throw new Error("errors.json not found");
>  const tsconfig = args["--tsconfig"] || errors.tsconfig;
>  const onlyCode = (args["--only-code"] || "").trim();
>  const onlyFile = (args["--only-file"] || "").trim();
>  const maxCycles = Number(args["--max-cycles"]);
>  const OUT = path.resolve(args["--out"]);
> 
>  const gitMode = (args["--git"] as "off"|"per-error") || "off";
>  const commitOn = (args["--commit-on"] as "always"|"success") || "always";
>  const useGit = gitMode !== "off" && await isGitRepo();
>  const remote = args["--remote"];
>  const push = args["--push"] === "true";
>  const useGh = args["--use-gh"] === "true";
> 
>  if (gitMode !== "off" && !useGit) {
>  console.warn("git mode requested but repo not detected. Continuing without git.");
>  }
> 
>  const filtered = errors.errors.filter(e =>
>  (!onlyCode || e.code === onlyCode) && (!onlyFile || e.file.includes(onlyFile))
>  );
> 
>  const summary: Summary = { iteratedAt: new Date().toISOString(), tsconfig, maxCycles, items: [] };
> 
>  for (const err of filtered) {
>  const histPath = path.join(OUT, "history", err.key, "history.json");
>  await ensureDir(path.dirname(histPath));
>  const history: History = (await readJSON<History>(histPath)) ?? { key: err.key, file: err.file, code: err.code, attempts: [] };
> 
>  // prepare branch if requested
>  let branch: string | undefined;
>  if (useGit && gitMode === "per-error") {
>  branch = makeBranch(err);
>  await ensureBranch(branch);
>  }
> 
>  let resolved = false;
> 
>  for (let n = history.attempts.length + 1; n <= maxCycles; n++) {
>  const before = await tsc(tsconfig);
>  if (!errorStillPresent(before.diags, err.key)) { resolved = true; break; }
> 
>  // plan
>  let plan;
>  try {
>  const obj = await ollamaJSON(args["--model"], promptFor(err, history));
>  const parsed = PlanSchema.safeParse(obj);
>  if (!parsed.success) throw new Error("invalid plan JSON");
>  plan = parsed.data;
>  } catch (e) { console.error(`✖ plan generation failed for ${err.key}:`, e); break; }
> 
>  // write + apply snippet
>  const root = path.join(OUT, "snippets", err.key);
>  await ensureDir(root);
>  const snippetPath = path.join(root, `attempt-${String(n).padStart(2,"0")}.mjs`);
>  await fs.writeFile(snippetPath, plan.snippet, "utf-8");
>  try { await applySnippetToProject(tsconfig, snippetPath); } catch (e) { console.error(`✖ snippet apply failed (#${n})`, e); }
> 
>  // build after
>  const after = await tsc(tsconfig);
>  const attempt: Attempt = {
>  n,
>  snippetPath,
>  planSummary: plan.title,
>  tscBeforeCount: before.diags.length,
>  tscAfterCount: after.diags.length,
>  resolved: after.ok || !errorStillPresent(after.diags, err.key),
>  errorStillPresent: errorStillPresent(after.diags, err.key),
>  newErrors: after.diags.slice(0, 5).map(d => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`)
>  };
> 
>  // git commit/push per attempt (or only on success)
>  if (useGit && (!attempt.errorStillPresent || commitOn === "always")) {
>  const title = `[buildfix] ${err.code} at ${path.relative(process.cwd(), err.file)}:${err.line} — attempt ${n}`;
>  const bodyPath = path.join(root, `attempt-${String(n).padStart(2,"0")}.msg.md`);
>  await fs.writeFile(bodyPath, `${title}\n\nPlan: ${plan.title}\n\n${plan.rationale}\n\nSnippet: ${path.relative(process.cwd(), snippetPath)}\n`, "utf-8");
>  const sha = await commitIfChanges(title);
>  if (sha) {
>  attempt.commitSha = sha;
>  attempt.branch = branch;
>  if (push) {
>  const pushed = await pushBranch(branch!, remote);
>  attempt.pushed = pushed;
>  if (pushed && useGh) {
>  const pr = await createPR(branch!, title, bodyPath);
>  attempt.prUrl = pr;
>  }
>  }
>  }
>  }
> 
>  history.attempts.push(attempt);
>  await writeJSON(histPath, history);
>  if (attempt.resolved) { resolved = true; history.resolvedAt = new Date().toISOString(); await writeJSON(histPath, history); break; }
>  }
> 
>  summary.items.push({
>  key: err.key,
>  resolved,
>  attempts: history.attempts.length,
>  lastSnippet: history.attempts.at(-1)?.snippetPath,
>  branch
>  });
>  }
> 
>  await writeJSON(path.join(OUT, "summary.json"), summary);
>  console.log(`buildfix: iterate complete — resolved ${summary.items.filter(i=>i.resolved).length}/${summary.items.length}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> ## 4) Pipeline wiring: enable git mode & (optional) push/PR
> 
> ### `pipelines.yaml` (buildfix section only)
> ```yaml
> pipelines:
>  - name: buildfix
>  steps:
>  - id: bf-errors
>  shell: "pnpm --filter @promethean/buildfix bf:01-errors --tsconfig tsconfig.json --out .cache/buildfix/errors.json"
>  inputs:
>  - "tsconfig.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/buildfix/errors.json"
> 
>  - id: bf-iterate
>  deps: ["bf-errors"]
>  shell: >
>  pnpm --filter @promethean/buildfix
>  bf:02-iterate
>  --errors .cache/buildfix/errors.json
>  --out .cache/buildfix
>  --model qwen3:4b
>  --max-cycles 5
>  --git per-error
>  --commit-on always
>  --branch-prefix buildfix
>  --remote origin
>  --push false
>  --use-gh false
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/buildfix/errors.json"
>  - "tsconfig.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/buildfix/summary.json"
>  - ".cache/buildfix/history/**"
>  - ".cache/buildfix/snippets/**"
> 
>  - id: bf-report
>  deps: ["bf-iterate"]
>  shell: "pnpm --filter @promethean/buildfix bf:03-report --summary .cache/buildfix/summary.json --history-root .cache/buildfix/history --out docs/agile/reports/buildfix"
>  inputs:
>  - ".cache/buildfix/summary.json"
>  outputs:
>  - "docs/agile/reports/buildfix/*.md"
> ```
> 
> Flip these when you’re ready to ship branches/PRs automatically:
> - `--push true`
> - `--use-gh true` (requires authenticated GitHub CLI)
> 
> ---
> 
> ## 5) Quick run
> 
> ```bash
> pnpm -w --filter @promethean/buildfix build
> 
> # dry-run (no git ops):
> piper run buildfix
> 
> # real git mode:
> piper run buildfix --force
> pnpm --filter @promethean/buildfix bf:02-iterate --git per-error --push true --use-gh true
> ```
> 
> ---
> 
> ## Tiny flow diagram
> 
> ```mermaid
> flowchart LR
>  A[tsc errors] --> B[iterate per error]
>  B -->|plan+snippet| C[ts-morph apply]
>  C --> D[rebuild]
>  D -->|fail| B
>  D -->|resolved| E{git mode?}
>  E -->|yes| F[commit/push/PR]
>  E -->|no| G[summary+report]
> ```
> 
> That’s it—safe, auditable, and hands-free. Want me to add a **rollback** flag that resets the per-error branch to the last successful attempt if a later attempt increases error count?
<!-- UID: fc37c3a0-5134-4301-aa44-057ef2dd5a93 -->

---




>[!nexus_user] **User** - 08/31/2025 at 7:11 PM
> oh boy... that didn't go well. backticks/templating strings made that a super broken mess.
>  I think that files too complicated, break it down
<!-- UID: e4ada04a-bf4a-4efe-a217-cff160859e0c -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 7:11 PM
> Totally hear you—template strings + JSON is a landmine. I split the “iterate” logic into small files and switched the model contract to **base64-encoded code** (or a tiny **DSL** fallback), so we never ship backticks through JSON.
> 
> Here’s the refactor (drop-in replacement for `@promethean/buildfix`).
> 
> ---
> 
> # What changed (in plain English)
> 
> - **No more raw code in JSON.** The model returns either:
>  - `snippet_b64` → base64 of an ESM JS file exporting `apply(project)`, or
>  - `dsl` → a compact, safe list of ts-morph operations we interpret.
> - **02-iterate is tiny now**, delegating to helpers:
>  - `iter/prompt.ts` builds the prompt with prior attempts.
>  - `iter/plan.ts` validates model JSON and writes `.plan.json`.
>  - `iter/dsl.ts` compiles DSL → ESM JS (when model opts for DSL).
>  - `iter/git.ts` is isolated git mode utilities.
>  - `iter/eval.ts` wraps `tsc` & “is error still present?” checks.
> 
> ---
> 
> # 1) New helper modules
> 
> ## `packages/buildfix/src/iter/dsl.ts`
> ```ts
> import * as path from "path";
> import { promises as fs } from "fs";
> import { z } from "zod";
> 
> export const Op = z.discriminatedUnion("op", [
>  z.object({ op: z.literal("ensureExported"), file: z.string(), symbol: z.string(), kind: z.enum(["function","class","variable"]) }),
>  z.object({ op: z.literal("renameSymbol"), file: z.string(), from: z.string(), to: z.string() }),
>  z.object({ op: z.literal("makeParamOptional"), file: z.string(), fn: z.string(), param: z.string() }),
>  z.object({ op: z.literal("addImport"), file: z.string(), from: z.string(), names: z.array(z.string()) }),
>  z.object({ op: z.literal("addTypeAnnotation"), file: z.string(), selector: z.string(), typeText: z.string() }),
>  z.object({ op: z.literal("insertStubFunction"), file: z.string(), name: z.string(), signature: z.string().optional(), returns: z.string().optional() })
> ]);
> export type OpT = z.infer<typeof Op>;
> 
> export const PlanSchema = z.object({
>  title: z.string(),
>  rationale: z.string(),
>  snippet_b64: z.string().optional(), // base64(ESM JS with export async function apply(project){})
>  dsl: z.array(Op).optional()
> });
> export type Plan = z.infer<typeof PlanSchema>;
> 
> export function decodeB64(s: string): string {
>  return Buffer.from(s, "base64").toString("utf8");
> }
> 
> // Turn DSL ops into a safe ESM snippet.
> export async function dslToSnippet(ops: OpT[], rootDir: string): Promise<string> {
>  const hdr = `import { SyntaxKind } from "ts-morph";
> export async function apply(project){
>  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
>  const not = (x,msg)=>{ if(!x) throw new Error(msg); };
> `;
>  const lines: string[] = [hdr];
> 
>  for (const o of ops) {
>  if (o.op === "ensureExported") {
>  lines.push(`
>  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
>  const ent = ${o.kind==="function" ? `sf.getFunctions().find(f=>f.getName()===${JSON.stringify(o.symbol)})`
>  : o.kind==="class" ? `sf.getClasses().find(c=>c.getName()===${JSON.stringify(o.symbol)})`
>  : `sf.getVariableDeclaration(${JSON.stringify(o.symbol)})`};
>  if (ent && !ent.hasExportKeyword?.()) ent.setIsExported?.(true);
>  }`);
>  }
>  if (o.op === "renameSymbol") {
>  lines.push(`
>  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
>  const f = sf.getFunctions().find(x=>x.getName()===${JSON.stringify(o.from)}) ||
>  sf.getClasses().find(x=>x.getName()===${JSON.stringify(o.from)});
>  if (f) f.rename(${JSON.stringify(o.to)});
>  }`);
>  }
>  if (o.op === "makeParamOptional") {
>  lines.push(`
>  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
>  const fn = sf.getFunctions().find(x=>x.getName()===${JSON.stringify(o.fn)});
>  if (fn){
>  const p = fn.getParameters().find(p=>p.getName()===${JSON.stringify(o.param)});
>  if (p && !p.hasQuestionToken()) p.setHasQuestionToken(true);
>  }
>  }`);
>  }
>  if (o.op === "addImport") {
>  lines.push(`
>  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
>  const names = ${JSON.stringify(o.names)};
>  const decl = sf.getImportDeclarations().find(d=>d.getModuleSpecifierValue()===${JSON.stringify(o.from)});
>  if (decl) { for (const n of names) { if (!decl.getNamedImports().some(ni=>ni.getName()===n)) decl.addNamedImport(n); } }
>  else { sf.addImportDeclaration({ moduleSpecifier: ${JSON.stringify(o.from)}, namedImports: names }); }
>  }`);
>  }
>  if (o.op === "addTypeAnnotation") {
>  // Simple selector: function:name or var:name
>  lines.push(`
>  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
>  const [kind, name] = ${JSON.stringify(o.selector)}.split(":");
>  if (kind==="function"){
>  const fn = sf.getFunctions().find(x=>x.getName()===name);
>  if (fn) fn.setReturnType(${JSON.stringify(o.typeText)});
>  } else if (kind==="var"){
>  const v = sf.getVariableDeclaration(name);
>  if (v) v.setType(${JSON.stringify(o.typeText)});
>  }
>  }`);
>  }
>  if (o.op === "insertStubFunction") {
>  lines.push(`
>  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
>  const name=${JSON.stringify(o.name)};
>  if (!sf.getFunction(name)) sf.addFunction({
>  name,
>  isExported: true,
>  parameters: [],
>  statements: ${JSON.stringify(o.returns ? `return ${o.returns};` : "")}
>  });
>  }`);
>  }
>  }
> 
>  lines.push("\n}\n");
>  return lines.join("");
> }
> 
> export async function materializeSnippet(plan: Plan, outPath: string): Promise<void> {
>  let code = "";
>  if (plan.snippet_b64) code = decodeB64(plan.snippet_b64);
>  else if (plan.dsl && plan.dsl.length) code = await dslToSnippet(plan.dsl, process.cwd());
>  else throw new Error("plan has neither snippet_b64 nor dsl");
>  await fs.mkdir(path.dirname(outPath), { recursive: true });
>  await fs.writeFile(outPath, code, "utf-8");
> }
> ```
> 
> ## `packages/buildfix/src/iter/prompt.ts`
> ```ts
> import * as path from "path";
> import type { History } from "../types.js";
> 
> export function buildPrompt(err: {file:string; line:number; col:number; code:string; message:string; frame:string; key:string}, history: History){
>  const prev = history.attempts.map(a =>
> `ATTEMPT #${a.n}
> Plan: ${a.planSummary}
> Commit: ${a.commitSha ?? "(no-commit)"} ${a.pushed ? "(pushed)" : ""}
> Result: tsc ${a.resolved ? "OK" : "failed"}; after=${a.tscAfterCount}; stillPresent=${a.errorStillPresent}
> `).join("\n");
> 
>  return [
> `You are a TypeScript ts-morph refactoring agent.
> 
> Return ONLY JSON with keys:
> - title (string)
> - rationale (string)
> - EITHER "snippet_b64" (base64-encoded UTF-8 of an ESM JS file exporting: "export async function apply(project){...}")
> - OR "dsl" (array of operations). Example op: {"op":"ensureExported","file":"src/foo.ts","symbol":"bar","kind":"function"}
> 
> Rules:
> - Do NOT include backticks or markdown fences anywhere.
> - If you provide "snippet_b64", the JS must import nothing except what's available in ts-morph Project and standard runtime.
> - Prefer minimal, targeted edits.
> 
> Target error:
> FILE: ${err.file}
> LINE: ${err.line}, COL: ${err.col}
> CODE: ${err.code}
> MESSAGE: ${err.message}
> 
> Code frame:
> ${err.frame}
> 
> Previous attempts:
> ${prev || "(none)"}
> `
>  ].join("\n");
> }
> ```
> 
> ## `packages/buildfix/src/iter/plan.ts`
> ```ts
> import * as path from "path";
> import { promises as fs } from "fs";
> import { PlanSchema, type Plan } from "./dsl.js";
> import { ollamaJSON } from "../utils.js";
> import { buildPrompt } from "./prompt.js";
> 
> export async function requestPlan(model: string, err: any, history: any): Promise<Plan> {
>  const raw = await ollamaJSON(model, buildPrompt(err, history));
>  const parsed = PlanSchema.safeParse(raw);
>  if (!parsed.success) throw new Error("invalid plan JSON");
>  return parsed.data;
> }
> 
> export async function writePlanFile(dir: string, n: number, plan: Plan) {
>  await fs.mkdir(dir, { recursive: true });
>  const p = path.join(dir, `attempt-${String(n).padStart(2,"0")}.plan.json`);
>  await fs.writeFile(p, JSON.stringify(plan, null, 2), "utf-8");
>  return p;
> }
> ```
> 
> ## `packages/buildfix/src/iter/eval.ts`
> ```ts
> import * as path from "path";
> import { tsc } from "../utils.js";
> 
> export function errorStillPresent(diags: any[], key: string) {
>  const [code, file, lineStr] = key.split("|"); const line = Number(lineStr);
>  return diags.some(d => d.code === code && path.resolve(d.file) === path.resolve(file) && Math.abs(d.line - line) <= 2);
> }
> 
> export async function buildAndJudge(tsconfig: string, key: string) {
>  const r = await tsc(tsconfig);
>  const present = errorStillPresent(r.diags, key);
>  return { r, present };
> }
> ```
> 
> ## `packages/buildfix/src/iter/git.ts`
> ```ts
> import * as path from "path";
> import { promises as fs } from "fs";
> import { git, isGitRepo, sanitizeBranch } from "../utils.js";
> 
> export async function ensureBranch(branch: string) {
>  const chk = await git(`rev-parse --verify ${branch}`);
>  if (chk.code !== 0) await git(`checkout -b ${branch}`); else await git(`checkout ${branch}`);
> }
> export async function commitIfChanges(message: string){
>  const st = await git("status --porcelain");
>  if (!st.out) return undefined;
>  await git("add -A");
>  const c = await git(`commit -m "${message.replace(/"/g,'\\"')}"`);
>  if (c.code !== 0) return undefined;
>  const sha = await git("rev-parse HEAD"); return sha.out || undefined;
> }
> export async function pushBranch(branch: string, remote: string){ return (await git(`push ${remote} ${branch}`)).code === 0; }
> export async function createPR(branch: string, title: string, bodyPath: string){
>  const { exec } = await import("child_process");
>  return new Promise<string|undefined>((resolve) => {
>  exec(`gh pr create --fill --title "${title.replace(/"/g,'\\"')}" --body-file "${bodyPath}" --head ${branch}`, {}, (err, stdout)=> resolve(err?undefined:String(stdout).trim()));
>  });
> }
> export { isGitRepo, sanitizeBranch };
> ```
> 
> ---
> 
> # 2) Replace `src/02-iterate.ts` (small orchestrator)
> 
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON, readJSON, applySnippetToProject } from "./utils.js";
> import type { ErrorList, History, Attempt, Summary } from "./types.js";
> import { requestPlan, writePlanFile } from "./iter/plan.js";
> import { materializeSnippet } from "./iter/dsl.js";
> import { buildAndJudge } from "./iter/eval.js";
> import { ensureBranch, commitIfChanges, pushBranch, createPR, isGitRepo, sanitizeBranch } from "./iter/git.js";
> 
> const args = parseArgs({
>  "--errors": ".cache/buildfix/errors.json",
>  "--out": ".cache/buildfix",
>  "--model": "qwen3:4b",
>  "--max-cycles": "5",
>  "--only-code": "",
>  "--only-file": "",
>  "--tsconfig": "",
>  // git
>  "--git": "off", // off | per-error
>  "--commit-on": "always", // always | success
>  "--branch-prefix": "buildfix",
>  "--remote": "origin",
>  "--push": "false",
>  "--use-gh": "false"
> });
> 
> function makeBranch(err: any) {
>  const fileSlug = err.file.replace(process.cwd() + path.sep, "").replace(/[\/\\\.]/g, "-");
>  return sanitizeBranch(`${args["--branch-prefix"]}/${err.code}/${fileSlug}/${err.line}`);
> }
> 
> async function main() {
>  const errors = await readJSON<ErrorList>(path.resolve(args["--errors"]));
>  if (!errors) throw new Error("errors.json not found");
>  const tsconfig = args["--tsconfig"] || errors.tsconfig;
>  const onlyCode = (args["--only-code"] || "").trim();
>  const onlyFile = (args["--only-file"] || "").trim();
>  const maxCycles = Number(args["--max-cycles"]);
>  const OUT = path.resolve(args["--out"]);
> 
>  const useGit = args["--git"] !== "off" && await isGitRepo();
>  const commitOn = (args["--commit-on"] as "always"|"success") || "always";
>  const remote = args["--remote"]; const push = args["--push"] === "true"; const useGh = args["--use-gh"] === "true";
> 
>  const todo = errors.errors.filter(e => (!onlyCode || e.code === onlyCode) && (!onlyFile || e.file.includes(onlyFile)));
>  const summary: Summary = { iteratedAt: new Date().toISOString(), tsconfig, maxCycles, items: [] };
> 
>  for (const err of todo) {
>  const histDir = path.join(OUT, "history", err.key);
>  const histPath = path.join(histDir, "history.json");
>  await fs.mkdir(histDir, { recursive: true });
>  const history: History = (await readJSON<History>(histPath)) ?? { key: err.key, file: err.file, code: err.code, attempts: [] };
> 
>  let branch: string | undefined;
>  if (useGit && args["--git"] === "per-error") {
>  branch = makeBranch(err);
>  await ensureBranch(branch);
>  }
> 
>  let resolved = false;
>  for (let n = history.attempts.length + 1; n <= maxCycles; n++) {
>  // If already fixed (manual edits), stop.
>  { const { r, present } = await buildAndJudge(tsconfig, err.key); if (!present) { resolved = true; break; } }
> 
>  // 1) Plan
>  let plan;
>  try { plan = await requestPlan(args["--model"], err, history); }
>  catch (e) { console.error(`✖ plan failed for ${err.key}:`, e); break; }
>  const planPath = await writePlanFile(path.join(OUT, "plans", err.key), n, plan);
> 
>  // 2) Materialize snippet
>  const snippetsDir = path.join(OUT, "snippets", err.key);
>  await fs.mkdir(snippetsDir, { recursive: true });
>  const snippetPath = path.join(snippetsDir, `attempt-${String(n).padStart(2,"0")}.mjs`);
>  await materializeSnippet(plan, snippetPath);
> 
>  // 3) Apply
>  try { await applySnippetToProject(tsconfig, snippetPath); }
>  catch (e) { console.error(`✖ apply failed (#${n})`, e); }
> 
>  // 4) Evaluate
>  const { r: after, present } = await buildAndJudge(tsconfig, err.key);
>  const att: Attempt = {
>  n,
>  snippetPath,
>  planSummary: plan.title,
>  tscBeforeCount: NaN, // minimized: we only persist "after" now
>  tscAfterCount: after.diags.length,
>  resolved: !present,
>  errorStillPresent: present,
>  newErrors: after.diags.slice(0, 5).map(d => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`)
>  };
> 
>  // 5) Git (optional)
>  if (useGit && (!present || commitOn === "always")) {
>  const title = `[buildfix] ${err.code} at ${path.relative(process.cwd(), err.file)}:${err.line} — attempt ${n}`;
>  const bodyPath = path.join(snippetsDir, `attempt-${String(n).padStart(2,"0")}.msg.md`);
>  await fs.writeFile(bodyPath, `${title}\n\nPlan: ${plan.title}\n\n${plan.rationale}\n\nFiles changed in this attempt are included in the commit.`, "utf-8");
>  const sha = await commitIfChanges(title);
>  if (sha) {
>  att.commitSha = sha; att.branch = branch;
>  if (push && branch) {
>  att.pushed = await pushBranch(branch, remote);
>  if (att.pushed && useGh) att.prUrl = await createPR(branch, title, bodyPath);
>  }
>  }
>  }
> 
>  history.attempts.push(att);
>  await writeJSON(histPath, history);
>  if (att.resolved) { resolved = true; history.resolvedAt = new Date().toISOString(); await writeJSON(histPath, history); break; }
>  }
> 
>  summary.items.push({ key: err.key, resolved, attempts: history.attempts.length, lastSnippet: history.attempts.at(-1)?.snippetPath, branch });
>  }
> 
>  await writeJSON(path.join(OUT, "summary.json"), summary);
>  console.log(`buildfix: iterate — resolved ${summary.items.filter(i=>i.resolved).length}/${summary.items.length}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> ---
> 
> # 3) Update the model contract (no more backticks)
> 
> No file changes needed beyond the helpers—`iter/prompt.ts` already instructs:
> 
> - **No backticks or fences**
> - **Prefer `snippet_b64`**, else `dsl` list
> 
> If the model still emits fences, our generator ignores them since we parse strict JSON fields only.
> 
> ---
> 
> # 4) Keep the pipeline the same
> 
> You can keep your `pipelines.yaml` `buildfix` section as-is. The `bf:02-iterate` script name hasn’t changed, but it’s much smaller and safer now.
> 
> ---
> 
> # 5) Optional: quick unit smoke of the DSL compiler
> 
> If you want, toss this tiny check anywhere:
> 
> ```ts
> // pseudo-test
> import { dslToSnippet } from "../src/iter/dsl";
> const js = await dslToSnippet([{ op:"ensureExported", file:"src/foo.ts", symbol:"bar", kind:"function" }], process.cwd());
> console.log(js.includes("export async function apply"));
> ```
> 
> ---
> 
> ## TL;DR
> 
> - We **killed backtick chaos** by base64-encoding generated code (or using a tiny declarative DSL).
> - The big iter script is now **small**, with clear helpers.
> - Git mode stayed intact, but is isolated and optional.
> 
> Want me to add a **“rollback if error count increases”** flag next?
<!-- UID: ee2e7cc9-49d3-42ec-a9bd-876a0ea378c3 -->

---




>[!nexus_user] **User** - 08/31/2025 at 7:23 PM
> yeap
<!-- UID: 1496e534-b527-47fd-be8b-0b1c6565c9d9 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 7:23 PM
> Got it — I added a **rollback on regression** switch that automatically reverts the working tree if an attempt makes things worse (more TypeScript errors than before that attempt). It’s Git-backed (safe, fast). Here are the small, surgical changes:
> 
> ---
> 
> ## 1) Types: mark regressions & rollbacks
> 
> ### `packages/buildfix/src/types.ts` (patch)
> ```ts
> export type Attempt = {
>  n: number;
>  snippetPath: string;
>  planSummary: string;
>  tscBeforeCount: number;
>  tscAfterCount: number;
>  resolved: boolean;
>  errorStillPresent: boolean;
>  newErrors: string[];
>  // git mode
>  branch?: string;
>  commitSha?: string;
>  pushed?: boolean;
>  prUrl?: string;
>  // rollback
>  regressed?: boolean; // after > before
>  rolledBack?: boolean; // worktree restored after regression
> };
> ```
> 
> ---
> 
> ## 2) Git helper: one-call rollback
> 
> ### `packages/buildfix/src/iter/git.ts` (add)
> ```ts
> export async function rollbackWorktree() {
>  // hard reset unstaged/staged changes; also drop untracked new files (e.g., snippets accidentally written in src/)
>  await git("reset --hard");
>  await git("clean -fd");
> }
> ```
> 
> ---
> 
> ## 3) Iterator: compare counts, rollback, and never commit on regressions
> 
> ### `packages/buildfix/src/02-iterate.ts` (replace the orchestrator you added last time with this diff-friendly version)
> ```ts
> /* eslint-disable no-console */
> import * as path from "path";
> import { promises as fs } from "fs";
> import { parseArgs, writeJSON, readJSON, applySnippetToProject } from "./utils.js";
> import type { ErrorList, History, Attempt, Summary } from "./types.js";
> import { requestPlan, writePlanFile } from "./iter/plan.js";
> import { materializeSnippet } from "./iter/dsl.js";
> import { buildAndJudge } from "./iter/eval.js";
> import {
>  ensureBranch, commitIfChanges, pushBranch, createPR,
>  isGitRepo, sanitizeBranch, rollbackWorktree
> } from "./iter/git.js";
> 
> const args = parseArgs({
>  "--errors": ".cache/buildfix/errors.json",
>  "--out": ".cache/buildfix",
>  "--model": "qwen3:4b",
>  "--max-cycles": "5",
>  "--only-code": "",
>  "--only-file": "",
>  "--tsconfig": "",
>  // git
>  "--git": "off", // off | per-error
>  "--commit-on": "always", // always | success
>  "--branch-prefix": "buildfix",
>  "--remote": "origin",
>  "--push": "false",
>  "--use-gh": "false",
>  // rollback
>  "--rollback-on-regress": "true" // if after error count > before, undo worktree changes
> });
> 
> function makeBranch(err: any) {
>  const fileSlug = err.file.replace(process.cwd() + path.sep, "").replace(/[\/\\\.]/g, "-");
>  return sanitizeBranch(`${args["--branch-prefix"]}/${err.code}/${fileSlug}/${err.line}`);
> }
> 
> async function main() {
>  const errors = await readJSON<ErrorList>(path.resolve(args["--errors"]));
>  if (!errors) throw new Error("errors.json not found");
>  const tsconfig = args["--tsconfig"] || errors.tsconfig;
>  const onlyCode = (args["--only-code"] || "").trim();
>  const onlyFile = (args["--only-file"] || "").trim();
>  const maxCycles = Number(args["--max-cycles"]);
>  const OUT = path.resolve(args["--out"]);
> 
>  const useGit = args["--git"] !== "off" && await isGitRepo();
>  const commitOn = (args["--commit-on"] as "always"|"success") || "always";
>  const remote = args["--remote"]; const push = args["--push"] === "true"; const useGh = args["--use-gh"] === "true";
>  const doRollback = args["--rollback-on-regress"] === "true";
> 
>  const todo = errors.errors.filter(e => (!onlyCode || e.code === onlyCode) && (!onlyFile || e.file.includes(onlyFile)));
>  const summary: Summary = { iteratedAt: new Date().toISOString(), tsconfig, maxCycles, items: [] };
> 
>  for (const err of todo) {
>  const histDir = path.join(OUT, "history", err.key);
>  const histPath = path.join(histDir, "history.json");
>  await fs.mkdir(histDir, { recursive: true });
>  const history: History = (await readJSON<History>(histPath)) ?? { key: err.key, file: err.file, code: err.code, attempts: [] };
> 
>  let branch: string | undefined;
>  if (useGit && args["--git"] === "per-error") {
>  branch = makeBranch(err);
>  await ensureBranch(branch);
>  }
> 
>  let resolved = false;
>  for (let n = history.attempts.length + 1; n <= maxCycles; n++) {
>  // Baseline
>  const { r: before, present: presentBefore } = await buildAndJudge(tsconfig, err.key);
>  const beforeCount = before.diags.length;
>  if (!presentBefore) { resolved = true; break; }
> 
>  // 1) Plan
>  let plan;
>  try { plan = await requestPlan(args["--model"], err, history); }
>  catch (e) { console.error(`✖ plan failed for ${err.key}:`, e); break; }
>  await writePlanFile(path.join(OUT, "plans", err.key), n, plan);
> 
>  // 2) Materialize snippet
>  const snippetsDir = path.join(OUT, "snippets", err.key);
>  await fs.mkdir(snippetsDir, { recursive: true });
>  const snippetPath = path.join(snippetsDir, `attempt-${String(n).padStart(2,"0")}.mjs`);
>  await materializeSnippet(plan, snippetPath);
> 
>  // 3) Apply
>  try { await applySnippetToProject(tsconfig, snippetPath); }
>  catch (e) { console.error(`✖ apply failed (#${n})`, e); }
> 
>  // 4) Evaluate
>  const { r: after, present } = await buildAndJudge(tsconfig, err.key);
>  const afterCount = after.diags.length;
>  const regressed = afterCount > beforeCount;
> 
>  // 5) Rollback if worse
>  let rolledBack = false;
>  if (regressed && doRollback) {
>  if (useGit) {
>  await rollbackWorktree();
>  rolledBack = true;
>  // recompute to keep history consistent with tree
>  const { r: re, present: rePresent } = await buildAndJudge(tsconfig, err.key);
>  // replace "after" snapshot with the post-rollback state
>  (after as any).diags = re.diags;
>  } else {
>  console.warn("⚠ rollback requested but not in a git repo — cannot revert changes.");
>  }
>  }
> 
>  const att: Attempt = {
>  n,
>  snippetPath,
>  planSummary: plan.title,
>  tscBeforeCount: beforeCount,
>  tscAfterCount: regressed && rolledBack ? beforeCount : afterCount,
>  resolved: !present && !regressed,
>  errorStillPresent: present && !regressed,
>  newErrors: after.diags.slice(0, 5).map(d => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`),
>  regressed,
>  rolledBack
>  };
> 
>  // 6) Git: never commit a regressed attempt
>  if (useGit && !regressed && (commitOn === "always" || att.resolved)) {
>  const title = `[buildfix] ${err.code} at ${path.relative(process.cwd(), err.file)}:${err.line} — attempt ${n}`;
>  const bodyPath = path.join(snippetsDir, `attempt-${String(n).padStart(2,"0")}.msg.md`);
>  await fs.writeFile(bodyPath, `${title}\n\nPlan: ${plan.title}\n\n${plan.rationale}\n`, "utf-8");
>  const sha = await commitIfChanges(title);
>  if (sha) {
>  att.commitSha = sha; att.branch = branch;
>  if (push && branch) {
>  att.pushed = await pushBranch(branch, remote);
>  if (att.pushed && useGh) att.prUrl = await createPR(branch, title, bodyPath);
>  }
>  }
>  }
> 
>  history.attempts.push(att);
>  await writeJSON(histPath, history);
>  if (att.resolved) { resolved = true; history.resolvedAt = new Date().toISOString(); await writeJSON(histPath, history); break; }
>  }
> 
>  summary.items.push({ key: err.key, resolved, attempts: history.attempts.length, lastSnippet: history.attempts.at(-1)?.snippetPath, branch });
>  }
> 
>  await writeJSON(path.join(OUT, "summary.json"), summary);
>  console.log(`buildfix: iterate — resolved ${summary.items.filter(i=>i.resolved).length}/${summary.items.length}`);
> }
> 
> main().catch(e => { console.error(e); process.exit(1); });
> ```
> 
> What this does:
> - Measures `beforeCount` vs `afterCount` every attempt.
> - If `afterCount > beforeCount` and `--rollback-on-regress true`, instantly restores the worktree (`git reset --hard && git clean -fd`) and records `rolledBack: true`.
> - **Never commits** a regressed attempt (even with `--commit-on always`).
> 
> ---
> 
> ## 4) Pipeline knob
> 
> In your `pipelines.yaml` buildfix step, add the flag:
> 
> ```yaml
> - id: bf-iterate
>  deps: ["bf-errors"]
>  shell: >
>  pnpm --filter @promethean/buildfix
>  bf:02-iterate
>  --errors .cache/buildfix/errors.json
>  --out .cache/buildfix
>  --model qwen3:4b
>  --max-cycles 5
>  --git per-error
>  --commit-on always
>  --branch-prefix buildfix
>  --remote origin
>  --push false
>  --use-gh false
>  --rollback-on-regress true
> ```
> 
> ---
> 
> ### Optional next tweak
> If you want to **abort the error’s loop** after N consecutive regressions (e.g., 2), I can add `--max-regressions` and stop early with a clear status.
<!-- UID: c2196efa-f8e9-48cb-96a1-de867d9ff793 -->

---




>[!nexus_user] **User** - 08/31/2025 at 7:32 PM
> let's summarize what we've written so far
<!-- UID: e9084553-1daa-442f-84c0-a6d970912522 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 7:32 PM
> here’s the bird’s-eye recap of what we built, stitched into a tidy mental map.
> 
> # Packages (what each one does)
> - **@promethean/docops** — front matter ensure → chunk/embed → cross-sim → related & references → apply FM → footer → (optional) rename.
> - **@promethean/codepack** — scrape code blocks + context → embed/cluster → LLM plan names/paths → generate `pseudo/` tree with READMEs.
> - **@promethean/readmeflow** — scan packages → LLM outlines → write/refresh per-pkg `README.md` (mermaid graph) → verify .
> - **@promethean/cookbookflow** — collect examples/snips → classify by task/runtime → plan **recipes** → write `docs/cookbook/**` → execute → verify → report.
> - **@promethean/testgap** — scan exported API (ts-morph) → read LCOV → map symbol coverage → (optional) cross with cookbook → task plan → write tasks → report → **gate** (fail under threshold).
> - **@promethean/buildfix** — run `tsc` → for each error, iterate: LLM → **base64 or DSL** → ts-morph apply → rebuild → loop. 
>  Extras: **git mode** (per-error branch, commit/push/PR), **regression rollback** (auto reset on worse builds), attempt history & summary.
> 
> # Unified pipelines (in `pipelines.yaml`)
> ```mermaid
> flowchart LR
>  subgraph Docs
>  DOFM[docops: FM ensure] --> DOIDX[chunk+embed] --> DOSIM[cross-sim]
>  DOSIM --> DOREL[related]; DOSIM --> DORF[references]
>  DOREL --> DOAP[apply FM]; DORF --> DOAP
>  DOAP --> DOFOOT[footer]; DOAP --> DOREN[rename]
>  end
>  subgraph Codepack
>  CPEX[extract blocks] --> CPEM[embed] --> CCL[cluster] --> CPL[LLM plan] --> CGEN[generate pseudo/]
>  end
>  subgraph Readmes
>  RMSCAN[scan pkgs] --> RMOUT[outlines] --> RMWR[write READMEs] --> RMV[verify ]
>  end
>  subgraph Cookbook
>  CBSCAN[scan examples] --> CBCLS[classify] --> CBG[group] --> CBP[plan]
>  CBP --> CBW[write recipes] --> CBX[exec] --> CBV[verify] --> CBR[report]
>  end
>  subgraph Quality
>  TGEXP[scan exports] --> TGCOV[read lcov] --> TGMAP[map gaps] --> TGGATE[gate ✓/✗]
>  TGGATE -->|pass| TGCROSS[cookbook cross] --> TGPLAN[task plan] --> TGWRITE[write tasks] --> TGREP[gap report]
>  end
>  subgraph Buildfix
>  BFE[collect tsc errs] --> BFI[iterate: plan→apply→rebuild]
>  BFI -->|resolved| BFREP[report]; BFI -.regress.->|rollback| BFI
>  end
> ```
> 
> # Where things land (conventions)
> - Caches: `.cache/<pkg>/…` (frontmatters, chunks, embeddings, queries, plans, run-results, histories, etc.)
> - Generated docs: 
>  - `docs/unique/**` (docops touches FM + footer; optional rename) 
>  - `docs/cookbook/**` (recipes with FM + expected_output_hash) 
>  - `docs/agile/tasks/**` (sonar, semver, test-gaps, consolidation) 
>  - `docs/agile/reports/**` (doc/board/cookbook/test-gap/buildfix/readmes reports)
> - Codepack output: `pseudo/**`
> 
> # Safety rails baked in
> - Idempotent markers in content (`<!-- READMEFLOW:BEGIN/END -->`, `<!-- COOKBOOK:BEGIN/END -->`, etc.).
> - Obsidian-friendly footers (markdown ; no oversized FM blobs).
> - **Test-gap gate**: fail below configurable API coverage threshold (symbols/lines).
> - **Buildfix**: JSON-safe planning (base64 or DSL), per-error git branches, optional commit/push/PR, **auto-rollback** on regression.
> 
> # Knobs you can turn (high-impact)
> - `OLLAMA_URL` (env), embed/LLM models (e.g., `nomic-embed-text:latest`, `qwen3:4b`).
> - `docops`: related/ref thresholds, tokenizer, rename toggle.
> - `codepack`: cluster similarity and max group size.
> - `cookbook`: task taxonomy, exec runners, `--accept` to record golden hashes.
> - `test-gap`: gate `--threshold` & `--metric symbols|lines`.
> - `buildfix`: `--max-cycles`, `--only-code/--only-file`, `--git per-error`, `--commit-on`, `--push`, `--use-gh`, `--rollback-on-regress`.
> 
> # Typical runs
> ```bash
> # docs enrichment
> piper run docops
> 
> # code block → pseudo repo
> piper run codepack
> 
> # package READMEs
> piper run readmes
> 
> # cookbook (recipes + verification)
> piper run cookbook
> 
> # test gaps (with gate)
> piper run test-gap
> 
> # auto-fix build errors (git branches, rollback on regress)
> piper run buildfix
> ```
> 
> # What we haven’t automated (yet, easy add-ons)
> - Buildfix: **max consecutive regressions** stop, **per-attempt diff summary**, or **speculative parallel attempts**.
> - Cookbook: fixtures manager + artifact hash checks.
> - Docops: overflow FM → sidecar index for super-large related/reference sets.
> 
> If you want, I can drop a root `README` that each pipeline, its caches, and main flags, plus a tiny “first-run” checklist (.env, gh auth).
<!-- UID: e422fc29-ace1-4b41-b5b0-59bc2d7ac0ad -->

---




>[!nexus_user] **User** - 08/31/2025 at 7:43 PM
> you're missing a few:
> pipelines:
>  - name: docs
>  steps:
>  - id: symdocs-scan
>  cwd: .
>  shell: "pnpm --filter @promethean/symdocs symdocs:01-scan --root packages --tsconfig ./tsconfig.json"
>  inputs: ["packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: [".cache/symdocs/symbols.json"]
>  - id: symdocs-docs
>  deps: ["symdocs-scan"]
>  shell: "pnpm --filter @promethean/symdocs symdocs:02-docs --model qwen3:4b"
>  inputs: [".cache/symdocs/symbols.json"]
>  outputs: [".cache/symdocs/docs.json"]
>  - id: symdocs-write
>  deps: ["symdocs-docs"]
>  shell: "pnpm --filter @promethean/symdocs symdocs:03-write --out docs/packages --granularity module"
>  inputs: [".cache/symdocs/docs.json"]
>  outputs: ["docs/packages/**/**/*.md"]
>  - id: symdocs-graph
>  deps: ["symdocs-scan"]
>  shell: "pnpm --filter @promethean/symdocs symdocs:04-graph"
>  inputs: ["packages/**/package.json", "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: ["docs/packages/README.md", "docs/packages/**/README.md"]
> 
>  - name: simtasks
>  steps:
>  - id: simtasks-scan
>  shell: "pnpm --filter @promethean/simtasks sim:01-scan --root packages --tsconfig ./tsconfig.json"
>  inputs: ["packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: [".cache/simtasks/functions.json"]
>  - id: simtasks-embed
>  deps: ["simtasks-scan"]
>  shell: "pnpm --filter @promethean/simtasks sim:02-embed --embed-model nomic-embed-text:latest"
>  inputs: [".cache/simtasks/functions.json"]
>  outputs: [".cache/simtasks/embeddings.json"]
>  - id: simtasks-cluster
>  deps: ["simtasks-embed"]
>  shell: "pnpm --filter @promethean/simtasks sim:03-cluster --sim-threshold 0.86 --k 12 --min-size 2"
>  inputs: [".cache/simtasks/embeddings.json"]
>  outputs: [".cache/simtasks/clusters.json"]
>  - id: simtasks-plan
>  deps: ["simtasks-cluster"]
>  shell: "pnpm --filter @promethean/simtasks sim:04-plan --model qwen3:4b --base-dir packages"
>  inputs: [".cache/simtasks/clusters.json"]
>  outputs: [".cache/simtasks/plans.json"]
>  - id: simtasks-write
>  deps: ["simtasks-plan"]
>  shell: "pnpm --filter @promethean/simtasks sim:05-write --out docs/agile/tasks"
>  inputs: [".cache/simtasks/plans.json"]
>  outputs: ["docs/agile/tasks/*.md"]
> 
>  - name: codemods
>  steps:
>  - id: mods-spec
>  shell: "pnpm --filter @promethean/codemods mods:01-spec --tsconfig ./tsconfig.json"
>  inputs: [".cache/simtasks/{functions,clusters,plans}.json"]
>  outputs: [".cache/codemods/specs.json"]
>  - id: mods-generate
>  deps: ["mods-spec"]
>  shell: "pnpm --filter @promethean/codemods mods:02-generate"
>  inputs: [".cache/codemods/specs.json"]
>  outputs: ["codemods/**/transform.ts"]
>  - id: mods-dry-run
>  deps: ["mods-generate"]
>  shell: "pnpm --filter @promethean/codemods mods:03-dry-run --root packages --report docs/agile/tasks/codemods --specs .cache/codemods/specs.json --delete-duplicates true"
>  inputs: ["codemods/**/transform.ts", "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
>  outputs: ["docs/agile/tasks/codemods/*.md"]
>  - id: mods-apply
>  deps: ["mods-dry-run"]
>  shell: "pnpm --filter @promethean/codemods mods:03-apply --root packages --report docs/agile/tasks/codemods --specs .cache/codemods/specs.json --delete-duplicates true"
>  inputs: ["codemods/**/transform.ts"]
>  outputs: [".cache/codemods/run-apply.json"]
>  - id: mods-verify
>  deps: ["mods-apply"]
>  shell: "pnpm --filter @promethean/codemods mods:04-verify:after --stage after --test \"pnpm -w -r test\""
>  inputs: [".cache/codemods/run-apply.json"]
>  outputs: ["docs/agile/tasks/codemods/verify-after.md", "docs/agile/tasks/codemods/VERIFY.md"]
>  - name: semver-guard
>  steps:
>  - id: sv-snapshot
>  shell: "pnpm --filter @promethean/semverguard sv:01-snapshot --root packages --tsconfig ./tsconfig.json --out .cache/semverguard/snapshot.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs: [".cache/semverguard/snapshot.json"]
> 
>  - id: sv-diff
>  deps: ["sv-snapshot"]
>  shell: "pnpm --filter @promethean/semverguard sv:02-diff --current .cache/semverguard/snapshot.json --baseline git:origin/main:.cache/semverguard/snapshot.json --out .cache/semverguard/diff.json"
>  inputs: [".cache/semverguard/snapshot.json"]
>  outputs: [".cache/semverguard/diff.json"]
> 
>  - id: sv-plan
>  deps: ["sv-diff"]
>  shell: "pnpm --filter @promethean/semverguard sv:03-plan --diff .cache/semverguard/diff.json --out .cache/semverguard/plans.json --model qwen3:4b"
>  inputs: [".cache/semverguard/diff.json"]
>  outputs: [".cache/semverguard/plans.json"]
> 
>  - id: sv-write
>  deps: ["sv-plan"]
>  shell: "pnpm --filter @promethean/semverguard sv:04-write --plans .cache/semverguard/plans.json --out docs/agile/tasks/semver"
>  inputs: [".cache/semverguard/plans.json"]
>  outputs: ["docs/agile/tasks/semver/*.md"]
> 
>  - id: sv-pr
>  deps: ["sv-write"]
>  shell: "pnpm --filter @promethean/semverguard sv:05-pr --plans .cache/semverguard/plans.json --root packages --mode prepare --update-dependents true --dep-range preserve"
>  inputs:
>  - ".cache/semverguard/plans.json"
>  - "packages/**/package.json"
>  outputs:
>  - ".cache/semverguard/pr/summary.json"
>  - name: board-review
>  steps:
>  - id: br-fm
>  shell: "pnpm --filter @promethean/boardrev br:01-fm"
>  inputs: ["docs/agile/tasks/**/*.md"]
>  outputs: ["docs/agile/tasks/**/*.md"] # FM updates in-place
>  - id: br-prompts
>  deps: ["br-fm"]
>  shell: "pnpm --filter @promethean/boardrev br:02-prompts --process docs/agile/Process.md --out .cache/boardrev/prompts.json"
>  inputs: ["docs/agile/Process.md"]
>  outputs: [".cache/boardrev/prompts.json"]
>  - id: br-index
>  deps: ["br-fm"]
>  shell: "pnpm --filter @promethean/boardrev br:03-index --globs \"{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}\""
>  inputs:
>  - "README.md"
>  - "docs/**/*.md"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/boardrev/repo-index.json"
>  - ".cache/boardrev/repo-embeddings.json"
>  - id: br-match
>  deps: ["br-prompts","br-index"]
>  shell: "pnpm --filter @promethean/boardrev br:04-match --tasks docs/agile/tasks --k 8"
>  inputs:
>  - "docs/agile/tasks/**/*.md"
>  - ".cache/boardrev/repo-index.json"
>  - ".cache/boardrev/repo-embeddings.json"
>  outputs: [".cache/boardrev/context.json"]
>  - id: br-eval
>  deps: ["br-match"]
>  shell: "pnpm --filter @promethean/boardrev br:05-eval --model qwen3:4b"
>  inputs:
>  - ".cache/boardrev/prompts.json"
>  - ".cache/boardrev/context.json"
>  outputs: [".cache/boardrev/evals.json"]
>  - id: br-report
>  deps: ["br-eval"]
>  shell: "pnpm --filter @promethean/boardrev br:06-report --outDir docs/agile/reports"
>  inputs: [".cache/boardrev/evals.json"]
>  outputs: ["docs/agile/reports/*.md"]
>  - name: sonar
>  steps:
>  - id: sonar-scan
>  cwd: .
>  shell: "sonar-scanner" # expects sonar-project.properties in repo OR env overrides
>  env:
>  SONAR_HOST_URL: "${SONAR_HOST_URL}"
>  SONAR_TOKEN: "${SONAR_TOKEN}"
>  SONAR_PROJECT_KEY: "${SONAR_PROJECT_KEY}"
>  inputs:
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  - "sonar-project.properties"
>  outputs:
>  - ".cache/sonar/scan.touch" # marker file we create after scan
>  - id: sonar-fetch
>  deps: ["sonar-scan"]
>  shell: "pnpm --filter @promethean/sonarflow sonar:fetch --project ${SONAR_PROJECT_KEY} --out .cache/sonar/issues.json"
>  inputs: []
>  outputs: [".cache/sonar/issues.json"]
>  - id: sonar-plan
>  deps: ["sonar-fetch"]
>  shell: "pnpm --filter @promethean/sonarflow sonar:plan --in .cache/sonar/issues.json --out .cache/sonar/plans.json --group-by rule+prefix --prefix-depth 2 --min-group 2 --model qwen3:4b"
>  inputs: [".cache/sonar/issues.json"]
>  outputs: [".cache/sonar/plans.json"]
>  - id: sonar-write
>  deps: ["sonar-plan"]
>  shell: "pnpm --filter @promethean/sonarflow sonar:write --in .cache/sonar/plans.json --out docs/agile/tasks/sonar"
>  inputs: [".cache/sonar/plans.json"]
>  outputs: ["docs/agile/tasks/sonar/*.md"]
>  - name: readmes
>  steps:
>  - id: rm-scan
>  shell: "pnpm --filter @promethean/readmeflow rm:01-scan --root packages --out .cache/readmes/scan.json"
>  inputs:
>  - "packages/**/package.json"
>  - "packages/**/tsconfig.json"
>  outputs:
>  - ".cache/readmes/scan.json"
> 
>  - id: rm-outline
>  deps: ["rm-scan"]
>  shell: "pnpm --filter @promethean/readmeflow rm:02-outline --scan .cache/readmes/scan.json --out .cache/readmes/outlines.json --model qwen3:4b"
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/readmes/scan.json"
>  outputs:
>  - ".cache/readmes/outlines.json"
> 
>  - id: rm-write
>  deps: ["rm-outline"]
>  shell: "pnpm --filter @promethean/readmeflow rm:03-write --scan .cache/readmes/scan.json --outlines .cache/readmes/outlines.json --mermaid true"
>  inputs:
>  - ".cache/readmes/outlines.json"
>  outputs:
>  - "packages/**/README.md"
> 
>  - id: rm-verify
>  deps: ["rm-write"]
>  shell: "pnpm --filter @promethean/readmeflow rm:04-verify --root packages --out docs/agile/reports/readmes"
>  inputs:
>  - "packages/**/README.md"
>  outputs:
>  - "docs/agile/reports/readmes/*.md"
>  - name: buildfix
>  steps:
>  - id: bf-errors
>  shell: "pnpm --filter @promethean/buildfix bf:01-errors --tsconfig tsconfig.json --out .cache/buildfix/errors.json"
>  inputs:
>  - "tsconfig.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/buildfix/errors.json"
> 
>  - id: bf-iterate
>  deps: ["bf-errors"]
>  shell: >
>  pnpm --filter @promethean/buildfix
>  bf:02-iterate
>  --errors .cache/buildfix/errors.json
>  --out .cache/buildfix
>  --model qwen3:4b
>  --max-cycles 5
>  --git per-error
>  --commit-on always
>  --branch-prefix buildfix
>  --remote origin
>  --push false
>  --use-gh false
>  --rollback-on-regress true
>  env:
>  OLLAMA_URL: "${OLLAMA_URL}"
>  inputs:
>  - ".cache/buildfix/errors.json"
>  - "tsconfig.json"
>  - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
>  outputs:
>  - ".cache/buildfix/summary.json"
>  - ".cache/buildfix/history/**"
>  - ".cache/buildfix/snippets/**"
> 
>  - id: bf-report
>  deps: ["bf-iterate"]
>  shell: "pnpm --filter @promethean/buildfix bf:03-report --summary .cache/buildfix/summary.json --history-root .cache/buildfix/history --out docs/agile/reports/buildfix"
>  inputs:
>  - ".cache/buildfix/summary.json"
>  outputs:
>  - "docs/agile/reports/buildfix/*.md"
<!-- UID: 53315320-c319-4ab0-98b5-a7c4ea01931d -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 7:43 PM
> You’re right—those pipelines were missing from the recap. Here’s the updated picture with your **symdocs**, **simtasks**, **codemods**, **semver-guard**, **board-review**, **sonar**, **readmes**, and the beefy **buildfix** we just finished.
> 
> # Pipelines (concise cheat sheet)
> 
> - **docs (symdocs)** 
>  - `symdocs:01-scan` → symbol index 
>  - `symdocs:02-docs` → LLM docs JSON 
>  - `symdocs:03-write` → `docs/packages/**` pages (module granularity) 
>  - `symdocs:04-graph` → per-package & root README graphs
> 
> - **simtasks** 
>  - scan → embed → cluster similar functions → LLM plans → write consolidation tasks to `docs/agile/tasks`
> 
> - **codemods** 
>  - build specs from simtasks → generate codemods → dry-run reports → apply (dedupe) → verify (runs tests) 
> 
> - **semver-guard** 
>  - snapshot exports → diff vs `git:origin/main` → plan migration tasks → write tasks → prepare PR metadata (version bumps & dependents)
> 
> - **board-review** 
>  - normalize FM on tasks → slice `Process.md` into prompts → index repo → match task context → LLM eval → write board report(s)
> 
> - **sonar** 
>  - run scanner → fetch issues → LLM plans grouped by rule/prefix → write tasks under `docs/agile/tasks/sonar`
> 
> - **readmes (readmeflow)** 
>  - scan packages → LLM outlines → write `README.md` (with package graph mermaid) → verify internal 
> 
> - **buildfix** 
>  - collect `tsc` errors → per-error iterative fixes (LLM → **b64 or DSL** → ts-morph) → rebuild loop 
>  - extras: **git per-error branches**, commit/push/PR, **rollback on regression**, attempt history + report
> 
> # How they interrelate (quick map)
> 
> ```mermaid
> flowchart LR
>  subgraph Docs
>  SYMSCAN --> SYMDOCS --> SYMWRITE
>  SYMSCAN --> SYMGRAPH
>  end
>  subgraph Similarity
>  SIMSCAN --> SIMEMB --> SIMCL --> SIMPLAN --> SIMWRITE
>  end
>  subgraph Codemods
>  SIMWRITE --> MODSPEC --> MODGEN --> MODDRY --> MODAPPLY --> MODVERIFY
>  end
>  subgraph Semver
>  SVSNAP --> SVDIFF --> SVPLAN --> SVWRITE --> SVPR
>  end
>  subgraph Board
>  BRFM --> BRPROMPTS
>  BRFM --> BRINDEX --> BRMATCH --> BREV --> BRREP
>  end
>  subgraph Sonar
>  SS[sonar-scan] --> SF[sonar-fetch] --> SP[sonar-plan] --> SW[sonar-write]
>  end
>  subgraph Readmes
>  RMSCAN --> RMOUT --> RMWRITE --> RMVERIFY
>  end
>  subgraph Buildfix
>  BFE[bf-errors] --> BFI[bf-iterate] --> BFREP
>  end
> ```
> 
> # Optional aggregator (workspace runner)
> If you want a one-shot “walk the shop,” add a top-level pipeline that orders the heavy hitters:
> 
> ```yaml
> pipelines:
>  - name: workspace-all
>  steps:
>  - id: docs
>  shell: "piper run docs"
>  - id: readmes
>  shell: "piper run readmes"
>  - id: simtasks
>  shell: "piper run simtasks"
>  - id: codemods
>  shell: "piper run codemods"
>  - id: semver-guard
>  shell: "piper run semver-guard"
>  - id: sonar
>  shell: "piper run sonar"
>  - id: board-review
>  shell: "piper run board-review"
>  - id: buildfix
>  shell: "piper run buildfix"
> ```
> 
> # Run tips / knobs
> - Set envs: `OLLAMA_URL`, `SONAR_HOST_URL`, `SONAR_TOKEN`, `SONAR_PROJECT_KEY`. 
> - `codemods mods:04-verify:after` test command is configurable via `--test "pnpm -w -r test"`. 
> - `buildfix` flags you’re using: `--git per-error`, `--rollback-on-regress true`, optional `--push true --use-gh true` when ready. 
> - `symdocs:03-write --granularity module` can be switched to `symbol` if you want per-API pages later.
> 
> If you want, I can fold these pipelines into a root `README` section with a tiny “When to run what” matrix.
<!-- UID: 58db1978-3d73-4e44-a88c-ef7cc060250d -->

---


