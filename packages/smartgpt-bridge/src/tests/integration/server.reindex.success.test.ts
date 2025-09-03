// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import test from "ava";
import path from "node:path";
import { withServer } from "../helpers/server.js";
import {
  setChromaClient,
  setEmbeddingFactory,
  resetChroma,
} from "../../indexer.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");

class CollectingCollection {
  constructor() {
    this.calls = 0;
  }
  async upsert() {
    this.calls++;
  }
}
class FakeChroma {
  constructor(col) {
    this.col = col;
  }
  async getOrCreateCollection() {
    return this.col;
  }
}

test("POST /v0/reindex returns 200 with stubbed chroma", async (t) => {
  const col = new CollectingCollection();
  setChromaClient(new FakeChroma(col));
  setEmbeddingFactory(async () => ({ generate: async () => [] }));
  await withServer(ROOT, async (req) => {
    const res = await req.post("/v0/reindex").send({ limit: 1 }).expect(200);
    t.true(res.body.ok);
  });
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
