import * as path from "path";

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

function chunk(id: string, uuid: string, startLine = 1) {
  return { id, docUuid: uuid, startLine, startCol: 0 } as any;
}

// force=false should skip already-cached hits

test.serial("runQuery skips cached when force=false", async (t) => {
  const docsKV = makeKV();
  const chunksKV = makeKV();
  await docsKV.put("a", { path: "/tmp/a.md", title: "A" });
  await docsKV.put("b", { path: "/tmp/b.md", title: "B" });
  await chunksKV.put("a", Object.freeze([chunk("a:0", "a")]));
  await chunksKV.put("b", Object.freeze([chunk("b:0", "b")]));

  const qhitsStore = new Map<string, any>();
  // seed cache for a:0 only
  qhitsStore.set("a:0", [
    { id: "b:0", docUuid: "b", score: 0.9, startLine: 1, startCol: 0 },
  ]);

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

  const coll = {
    async get({ ids }: { ids: string[] }) {
      return { embeddings: ids.map(() => [0.1, 0.2]) };
    },
    async query({ queryEmbeddings }: { queryEmbeddings: number[][] }) {
      // Return empty hits; we're testing skip logic not hit content
      const n = queryEmbeddings.length;
      return {
        ids: Array.from({ length: n }, () => []),
        distances: Array.from({ length: n }, () => []),
      };
    },
  } as any;

  await runQuery(
    { embedModel: "m", collection: "c", k: 3, force: false },
    db,
    coll,
  );

  // a:0 should remain as seeded; b:0 should be written (possibly empty)
  t.true(qhitsStore.has("a:0"));
  t.true(qhitsStore.has("b:0"));
});

// files filter should restrict to docs whose paths match

test.serial("runQuery respects files filter", async (t) => {
  const docsKV = makeKV();
  const chunksKV = makeKV();
  const dir = "/tmp/some";
  const aPath = path.join(dir, "a.md");
  const bPath = path.join(dir, "b.md");
  await docsKV.put("a", { path: aPath, title: "A" });
  await docsKV.put("b", { path: bPath, title: "B" });
  await chunksKV.put("a", Object.freeze([chunk("a:0", "a")]));
  await chunksKV.put("b", Object.freeze([chunk("b:0", "b")]));

  const qhitsStore = new Map<string, any>();
  const db = {
    root: {
      sublevel: () => ({
        async put(k: any, v: any) {
          qhitsStore.set(k, v);
        },
        async get(_k: any) {
          throw new Error("nf");
        },
      }),
    },
    docs: docsKV,
    chunks: chunksKV,
  } as any;

  const coll = {
    async get({ ids }: { ids: string[] }) {
      return { embeddings: ids.map(() => [0.2, 0.3]) };
    },
    async query({ queryEmbeddings }: { queryEmbeddings: number[][] }) {
      const n = queryEmbeddings.length;
      return {
        ids: Array.from({ length: n }, () => []),
        distances: Array.from({ length: n }, () => []),
      };
    },
  } as any;

  await runQuery(
    { embedModel: "m", collection: "c", files: [bPath] },
    db,
    coll,
  );

  t.false(qhitsStore.has("a:0"));
  t.true(qhitsStore.has("b:0"));
});

// null embeddings should be skipped and not queried

test.serial("runQuery skips items with null embeddings", async (t) => {
  const docsKV = makeKV();
  const chunksKV = makeKV();
  await docsKV.put("a", { path: "/tmp/a.md", title: "A" });
  await chunksKV.put(
    "a",
    Object.freeze([chunk("a:0", "a"), chunk("a:1", "a")]),
  );

  const qhitsStore = new Map<string, any>();
  let lastQuerySize = -1;
  const db = {
    root: {
      sublevel: () => ({
        async put(k: any, v: any) {
          qhitsStore.set(k, v);
        },
        async get() {
          throw new Error("nf");
        },
      }),
    },
    docs: docsKV,
    chunks: chunksKV,
  } as any;

  const coll = {
    async get({ ids }: { ids: string[] }) {
      // First has embedding, second is null
      return { embeddings: ids.map((_, i) => (i === 0 ? [0.1, 0.1] : null)) };
    },
    async query({ queryEmbeddings }: { queryEmbeddings: number[][] }) {
      lastQuerySize = queryEmbeddings.length;
      return {
        ids: Array.from({ length: lastQuerySize }, () => []),
        distances: Array.from({ length: lastQuerySize }, () => []),
      };
    },
  } as any;

  await runQuery({ embedModel: "m", collection: "c", k: 2 }, db, coll);
  t.is(lastQuerySize, 1);
  t.true(qhitsStore.has("a:0"));
  t.false(qhitsStore.has("a:1"));
});

// batching: ensure query is called in chunks of qBatch

test.serial("runQuery batches by qBatch size", async (t) => {
  const docsKV = makeKV();
  const chunksKV = makeKV();
  await docsKV.put("a", { path: "/tmp/a.md", title: "A" });
  const chs = Array.from({ length: 5 }, (_, i) => chunk(`a:${i}`, "a", 1 + i));
  await chunksKV.put("a", Object.freeze(chs));

  const qhitsStore = new Map<string, any>();
  const seenBatchSizes: number[] = [];
  const db = {
    root: {
      sublevel: () => ({
        async put(k: any, v: any) {
          qhitsStore.set(k, v);
        },
        async get() {
          throw new Error("nf");
        },
      }),
    },
    docs: docsKV,
    chunks: chunksKV,
  } as any;

  const coll = {
    async get({ ids }: { ids: string[] }) {
      return { embeddings: ids.map(() => [0.1]) };
    },
    async query({ queryEmbeddings }: { queryEmbeddings: number[][] }) {
      seenBatchSizes.push(queryEmbeddings.length);
      const n = queryEmbeddings.length;
      // Return empty hits
      return {
        ids: Array.from({ length: n }, () => []),
        distances: Array.from({ length: n }, () => []),
      };
    },
  } as any;

  await runQuery({ embedModel: "m", collection: "c", qBatch: 2 }, db, coll);
  t.deepEqual(seenBatchSizes, [2, 2, 1]);
});
