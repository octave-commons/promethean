import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, readJSON } from "./utils";
import type { Chunk, Front, QueryHit } from "./types";

const args = parseArgs({
  "--docs-dir": "docs/unique",
  "--doc-threshold": "0.78",
  "--ref-threshold": "0.85",
});

const ROOT = path.resolve(args["--docs-dir"]);
const DOC_THRESHOLD = Number(args["--doc-threshold"]);
const REF_THRESHOLD = Number(args["--ref-threshold"]);
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");
const QUERY_CACHE = path.join(CACHE, "queries.json");
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

async function listAllMarkdown(root: string): Promise<string[]> {
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
  return out.filter((p) => /\.(md|mdx|txt)$/i.test(p));
}

async function main() {
  const files = await listAllMarkdown(ROOT);
  const chunksByDoc: Record<string, Chunk[]> = await readJSON(CHUNK_CACHE, {});
  const queryCache: Record<string, QueryHit[]> = await readJSON(QUERY_CACHE, {});
  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});
  const docPairs: Record<string, Record<string, number>> = {};

  function addPair(a: string, b: string, score: number) {
    if (!docPairs[a]) docPairs[a] = {};
    docPairs[a][b] = Math.max(docPairs[a][b] ?? 0, score);
  }

  // aggregate doc-to-doc by best chunk similarity
  for (const [docUuid, chunks] of Object.entries(chunksByDoc)) {
    for (const ch of chunks) {
      const hits = queryCache[ch.id] || [];
      for (const h of hits) addPair(docUuid, h.docUuid, h.score);
    }
  }

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm = (gm.data || {}) as Front;
    if (!fm.uuid) continue;

    // related
    const peers = Object.entries(docPairs[fm.uuid] ?? {})
      .filter(([, score]) => score >= DOC_THRESHOLD)
      .sort((a, b) => b[1] - a[1]);
    fm.related_to_uuid = Array.from(new Set([...(fm.related_to_uuid ?? []), ...peers.map(([u]) => u)]));
    fm.related_to_title = Array.from(
      new Set([
        ...(fm.related_to_title ?? []),
        ...peers.map(([u]) => docsByUuid[u]?.title ?? u),
      ])
    );

    // references (top chunk hits above threshold)
    const myChunks = chunksByDoc[fm.uuid] ?? [];
    const acc = new Map<string, { uuid: string; line: number; col: number; score?: number }>();
    for (const ch of myChunks) {
      for (const h of (queryCache[ch.id] || []).filter((x) => x.score >= REF_THRESHOLD)) {
        const k = `${h.docUuid}:${h.startLine}:${h.startCol}`;
        if (!acc.has(k)) acc.set(k, { uuid: h.docUuid, line: h.startLine, col: h.startCol, score: Math.round(h.score * 100) / 100 });
      }
    }
    const refs = Array.from(acc.values());
    fm.references = refs;

    // write FM only (body unchanged)
    const out = matter.stringify(gm.content, fm, { language: "yaml" });
    await fs.writeFile(f, out, "utf-8");
  }

  console.log("04-relations: done.");
}
main().catch((e) => { console.error(e); process.exit(1); });
