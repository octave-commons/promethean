import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";
import type { UpsertRecordsParams } from "chromadb";
import {
  setChromaClient,
  setEmbeddingFactory,
  resetChroma,
} from "../../indexer.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

class CollectingCollection {
  calls = 0;
  async upsert(_args?: UpsertRecordsParams): Promise<void> {
    this.calls++;
  }
  async query(): Promise<{}> {
    return {};
  }
  async delete(): Promise<void> {
    /* no-op */
  }
}
class FakeChroma {
  constructor(private col: CollectingCollection) {}
  async getOrCreateCollection(): Promise<CollectingCollection> {
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
      delete: async () => {},
    }),
  });
});
