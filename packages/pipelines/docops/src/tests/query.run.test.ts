import test from "ava";

import { runQuery } from "../03-query.js";

function makeKV() {
  const m = new Map<any, any>();
  return {
    async put(k: any, v: any) {
      m.set(k, v);
    },
    async get(k: any) {
      if (!m.has(k)) throw new Error("not found");
      return m.get(k);
    },
    iterator() {
      const it = m[Symbol.iterator]();
      return {
        async *[Symbol.asyncIterator]() {
          for (const kv of it) yield kv as any;
        },
        async close() {},
      };
    },
    _map: m,
  };
}

test.serial("runQuery writes qhits for candidates", async (t) => {
  // Two docs with one chunk each
  const chunksA = Object.freeze([
    { id: "a:0", docUuid: "a", startLine: 1, startCol: 0 },
  ]);
  const chunksB = Object.freeze([
    { id: "b:0", docUuid: "b", startLine: 5, startCol: 1 },
  ]);

  const docsKV = makeKV();
  const chunksKV = makeKV();
  await docsKV.put("a", { path: "/tmp/a.md", title: "A" });
  await docsKV.put("b", { path: "/tmp/b.md", title: "B" });
  await chunksKV.put("a", chunksA);
  await chunksKV.put("b", chunksB);

  const qhitsStore = new Map<string, any>();
  const db = {
    root: {
      sublevel() {
        return {
          async put(k: any, v: any) {
            qhitsStore.set(k, v);
          },
          async get(k: any) {
            if (!qhitsStore.has(k)) throw new Error("nf");
            return qhitsStore.get(k);
          },
        };
      },
    },
    docs: docsKV,
    chunks: chunksKV,
  } as any;

  // Fake Chroma collection responding with one embedding and one hit
  const coll = {
    async get({ ids }: { ids: string[] }) {
      return { embeddings: ids.map(() => [0.1, 0.2, 0.3]) };
    },
    async query({
      queryEmbeddings,
      nResults: _nResults,
    }: {
      queryEmbeddings: number[][];
      nResults: number;
    }) {
      // For a:0, return b:0 with distance 0.2. For b:0, return a:0 with distance 0.4
      const ids = queryEmbeddings.map((_: number[], i: number) =>
        i === 0 ? ["b:0"] : ["a:0"],
      );
      const distances = queryEmbeddings.map((_: number[], i: number) =>
        i === 0 ? [0.2] : [0.4],
      );
      return { ids, distances };
    },
  } as any;

  await runQuery(
    { embedModel: "m", collection: "c", k: 3, force: true },
    db,
    coll,
  );

  const aHits = qhitsStore.get("a:0") || [];
  const bHits = qhitsStore.get("b:0") || [];

  t.true(Array.isArray(aHits));
  t.true(Array.isArray(bHits));
  t.is(aHits.length, 1);
  t.is(bHits.length, 1);
  t.is(aHits[0].docUuid, "b");
  t.is(bHits[0].docUuid, "a");
});
