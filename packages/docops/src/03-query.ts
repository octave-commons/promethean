// packages/docops/src/03-query.ts
import * as Path from "path";
import { pathToFileURL } from "node:url";

import { parseArgs } from "./utils.js";
import type { DBs } from "./db.js";
import type { Chunk, QueryHit } from "./types.js";
import { mapHits } from "./lib/query.js";
import type { ChromaCollection } from "./lib/query.js";
import { getChromaCollection } from "./lib/chroma.js";

// CLI entry (ESM-safe)

export type QueryOptions = {
  embedModel: string;
  collection: string;
  k?: number;
  force?: boolean;
  debug?: boolean;
  files?: string[]; // optional list of file paths to limit
  qBatch?: number; // batch size for query embeddings fetch/query
};

let __DBG = false;
const dbg = (...xs: any[]) => {
  if (__DBG) console.log("[03-query]", ...xs);
};

// helpers moved to ./lib/query

export async function runQuery(
  opts: QueryOptions,
  db: DBs,
  coll: ChromaCollection,
  onProgress?: (p: {
    step: "query";
    done: number;
    total: number;
    message?: string;
  }) => void,
) {
  __DBG = Boolean(opts.debug);
  const qhits = db.root.sublevel<string, readonly QueryHit[]>("q", {
    valueEncoding: "json",
  });

  // Determine selected uuids if files filter provided
  let selectedUuids: Set<string> | null = null;
  if (opts.files && opts.files.length) {
    selectedUuids = new Set<string>();
    const wanted = new Set(opts.files.map((p) => Path.resolve(p)));
    for await (const [uuid, info] of db.docs.iterator()) {
      const p = (info as any)?.path as string | undefined;
      if (p && wanted.has(Path.resolve(p))) selectedUuids.add(uuid);
    }
  }

  // Build id->chunk map and count total chunks for progress
  const byId = new Map<string, Chunk>();
  let total = 0;
  const allCandidates: Chunk[] = [];
  for await (const [, value] of db.chunks.iterator()) {
    const cs = value ?? [];
    const filtered = selectedUuids
      ? cs.filter((c) => selectedUuids.has(c.docUuid))
      : cs;
    total += filtered.length;
    for (const c of filtered) {
      byId.set(c.id, c);
      allCandidates.push(c);
    }
  }

  // Pre-filter: remove ones with cached hits unless force
  const candidates: Chunk[] = [];
  for (const q of allCandidates) {
    if (!opts.force) {
      try {
        await qhits.get(q.id);
        continue; // has cache
      } catch {}
    }
    candidates.push(q);
  }

  let computed = 0,
    skipped = allCandidates.length - candidates.length,
    totalHits = 0;
  const hist = new Array(11).fill(0);

  const BATCH = Math.max(1, Number(opts.qBatch ?? 16) | 0) || 16;
  for (let i = 0; i < candidates.length; i += BATCH) {
    const group = candidates.slice(i, i + BATCH);
    onProgress?.({
      step: "query",
      done: Math.min(total, i + group.length),
      total,
      message: `batch ${i / BATCH + 1}/${Math.ceil(
        candidates.length / BATCH,
      )} size=${group.length} computed=${computed} skipped=${skipped}`,
    });

    const ids = group.map((q) => q.id);
    const got = await coll.get({ ids, include: ["embeddings"] });
    const embs = (got.embeddings || []) as Array<number[] | null>;

    // Build queryEmbeddings and mapping index -> chunk
    const qEmbeddings: number[][] = [];
    const qChunks: Chunk[] = [];
    for (let j = 0; j < group.length; j++) {
      const e = embs[j] ?? null;
      if (e && Array.isArray(e) && e.length) {
        qEmbeddings.push(e);
        qChunks.push(group[j]!);
      }
    }
    if (!qEmbeddings.length) continue;

    const res: any = await coll.query({
      queryEmbeddings: qEmbeddings,
      nResults: (opts.k ?? 16) + 24, // small padding beyond k
    });
    const allIds = (res.ids || []) as string[][];
    const allDists = (res.distances || []) as number[][];

    for (let j = 0; j < qChunks.length; j++) {
      const q = qChunks[j]!;
      const idsJ = allIds[j] || [];
      const distsJ = allDists[j] || [];
      const hits = Object.freeze(
        mapHits(idsJ, distsJ, byId, q.docUuid, opts.k ?? 16),
      );
      await qhits.put(q.id, hits);
      computed++;
      totalHits += hits.length;
      if (__DBG && hits.length) {
        const top = hits.slice(0, 3).map((h: QueryHit) => h.score.toFixed(3));
        dbg("q", q.id, "hits", hits.length, "top", top);
      }
      for (const h of hits) {
        const b = Math.max(0, Math.min(10, Math.floor((h.score ?? 0) * 10)));
        hist[b]++;
      }
    }
  }
  dbg("summary", { computed, skipped, totalHits, hist });
  console.log("03-query: done (hits -> LevelDB sublevel 'q').");
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--k": "16",
    "--embed-model": "nomic-embed-text:latest",
    "--collection": "docs",
    "--force": "false",
    "--debug": "false",
  });
  const { openDB } = await import("./db.js");
  const db = await openDB();
  const embedModel = args["--embed-model"] ?? "nomic-embed-text:latest";
  const collection = args["--collection"] ?? "docs";
  const { client, coll } = await getChromaCollection({
    collection,
    embedModel,
  });
  const k = Math.max(1, Number(args["--k"] ?? "16") | 0) || 16;
  const force = (args["--force"] ?? "false") === "true";
  const debug = (args["--debug"] ?? "false") === "true";
  runQuery(
    {
      embedModel,
      collection,
      k,
      force,
      debug,
    },
    db,
    coll,
  )
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await db.root.close();
        try {
          await (client as any)?.close?.();
        } catch {}
      } catch {}
    });
}
