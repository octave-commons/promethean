// packages/docops/src/03-query.ts
import { OLLAMA_URL, parseArgs } from "./utils";
import { openDB  } from "./db";
import type { Chunk, QueryHit } from "./types";
import { ChromaClient } from "chromadb";
import { OllamaEmbeddingFunction } from "@chroma-core/ollama";

const args = parseArgs({
  "--k": "8",
  '--embed-model': 'nomic-embed-text:latest',
  "--collection": "docs",
});

const EMBED_MODEL = args['--embed-model'];
const K = Math.max(1, Number(args["--k"]) | 0) || 8;

const toScore = (distance: number) =>
  // Chroma returns a distance (0 = identical). Convert to a similarity-ish score.
  // If metric is cosine, score ~= 1 - d. If it's L2, this is still monotonic.
  1 - Math.max(0, Math.min(1, distance));

const mapHits = (
  ids: readonly string[],
  distances: readonly number[],
  byId: ReadonlyMap<string, Chunk>,
  qDocUuid: string,
  k: number
): readonly QueryHit[] =>
  ids
    .map((id, i) => {
      const c = byId.get(id);
      if (!c || c.docUuid === qDocUuid) return null;
      const d = distances[i] ?? 1;
      return Object.freeze({
        id,
        docUuid: c.docUuid,
        score: toScore(d),
        startLine: c.startLine,
        startCol: (c as any).startCol, // optional
      } as QueryHit);
    })
    .filter((x): x is QueryHit => !!x)
    .slice(0, k);

/**
 * Build a readonly id->chunk index by streaming LevelDB once.
 */
(async () => {

const db = await openDB();
// buildById: fix iterator destructuring
async function buildById(): Promise<ReadonlyMap<string, Chunk>> {
  const byId = new Map<string, Chunk>();
  for await (const [, value] of db.chunks.iterator()) {
    for (const c of (value as readonly Chunk[])) byId.set(c.id, c);
  }
  return byId;
}

async function main() {
  const qhits = db.root.sublevel<string, readonly QueryHit[]>("q", { valueEncoding: "json" });

  const client = new ChromaClient({});
  const embedder = new OllamaEmbeddingFunction({
    model: EMBED_MODEL,
    url: OLLAMA_URL
  });
  const coll = await client.getOrCreateCollection({
    name: args["--collection"],
    metadata: { embed_model: EMBED_MODEL },
    embeddingFunction:embedder

  });

  // Stream chunks → iterate deterministically per doc
  const byId = await buildById();

  for await (const [, value] of db.chunks.iterator()) {
    const cs = (value as readonly Chunk[]) ?? Object.freeze<Chunk[]>([]);
    for (const q of cs) {
      // skip if cached
      try {
        await qhits.get(q.id);
        continue;
      } catch {
        // not cached -> compute
      }

      // get the query embedding by id
      const got = await coll.get({ ids: [q.id], include: ["embeddings"] });
      const emb = (got.embeddings?.[0] ?? null) as number[] | null;
      if (!emb) continue; // not embedded yet

      // ask Chroma for neighbors from *other* docs
      const res = await coll.query({
        queryEmbeddings: [emb],
        nResults: K + 10, // small buffer; we'll filter same-doc & trim to K
        where: { docUuid: { $ne: q.docUuid } },
      });

      const ids = (res.ids?.[0] ?? []) as string[];
      const dists = (res.distances?.[0] ?? []) as number[];

      const hits = Object.freeze(mapHits(ids, dists, byId, q.docUuid, K));
      await qhits.put(q.id, hits);
    }
  }

  console.log("03-query: done (hits -> LevelDB sublevel 'q').");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
})()
