// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import test from "ava";
import path from "node:path";
import fs from "node:fs/promises";
import {
  reindexAll,
  reindexSubset,
  setChromaClient,
  setEmbeddingFactory,
  search,
  resetChroma,
} from "../../indexer.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");

class FakeCollection {
  constructor() {
    this.upserts = [];
  }
  async upsert(payload) {
    this.upserts.push(payload);
  }
  async query({ queryTexts, nResults }) {
    return {
      ids: [[["x#0"]]],
      documents: [[["doc"]]],
      metadatas: [[[{ path: "x", chunkIndex: 0, startLine: 1, endLine: 1 }]]],
      distances: [[[0.42]]],
    };
  }
}

class FakeChroma {
  async getOrCreateCollection() {
    return new FakeCollection();
  }
}

test.before(() => {
  setChromaClient(new FakeChroma());
  setEmbeddingFactory(async () => ({
    generate: async (texts) => texts.map(() => [0, 0, 0]),
  }));
});

test("reindexAll processes multiple chunks and calls upsert", async (t) => {
  const tmp = path.join(ROOT, "tmp_big.txt");
  const line = "A".repeat(2050); // > 2000 to trigger 2 chunks with overlap
  await fs.writeFile(tmp, `${line}\n${line}`);
  try {
    const info = await reindexAll(ROOT, { include: ["tmp_big.txt"] });
    t.true(info.processed >= 2);
  } finally {
    await fs.unlink(tmp).catch(() => {});
  }
});

test.after.always(() => {
  resetChroma();
  setEmbeddingFactory(null);
  setChromaClient({
    getOrCreateCollection: async () => ({
      query: async () => ({}),
      upsert: async () => {},
    }),
  });
});

test("reindexSubset forwards include globs", async (t) => {
  const tmp = path.join(ROOT, "tmp_small.txt");
  await fs.writeFile(tmp, "hello");
  try {
    const info = await reindexSubset(ROOT, "tmp_small.txt", {});
    t.true(info.processed >= 1);
  } finally {
    await fs.unlink(tmp).catch(() => {});
  }
});

test("search returns shaped results from fake client", async (t) => {
  const res = await search(ROOT, "q", 1);
  t.is(res.length, 1);
  t.is(res[0].path, "x");
  t.is(res[0].startLine, 1);
  t.is(res[0].endLine, 1);
  t.is(res[0].score, 0.42);
});
