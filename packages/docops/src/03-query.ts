import { parseArgs, cosine, writeJSON, readJSON } from "./utils";
import type { Chunk, QueryHit } from "./types";
import * as path from "path";

const args = parseArgs({
  "--k": "8",
});

const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");
const QUERY_CACHE = path.join(CACHE, "queries.json");

async function main() {
  const chunksByDoc: Record<string, Chunk[]> = await readJSON(CHUNK_CACHE, {});
  const k = Number(args["--k"]);
  const allChunks = Object.values(chunksByDoc).flat();

  // Build index in-memory
  const byId = new Map<string, Chunk>(allChunks.map((c) => [c.id, c]));
  const hits: Record<string, QueryHit[]> = await readJSON(QUERY_CACHE, {});

  for (const q of allChunks) {
    if (hits[q.id]) continue;
    const scores: Array<QueryHit> = [];
    for (const cand of allChunks) {
      if (cand.docUuid === q.docUuid) continue; // skip same doc
      const score = cosine(q.embedding!, cand.embedding!);
      scores.push({ id: cand.id, docUuid: cand.docUuid, score, startLine: cand.startLine, startCol: cand.startCol });
    }
    scores.sort((a, b) => b.score - a.score);
    hits[q.id] = scores.slice(0, k);
  }

  await writeJSON(QUERY_CACHE, hits);
  console.log("03-query: done.");
}
main().catch((e) => { console.error(e); process.exit(1); });
