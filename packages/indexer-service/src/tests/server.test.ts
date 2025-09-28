import test from "ava";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  setChromaClient,
  setEmbeddingFactory,
} from "@promethean/indexer-core";

test.before(() => {
  setChromaClient({
    async getOrCreateCollection() {
      return {
        upsert: async () => {},
        delete: async () => {},
        query: async () => ({ ids: [], documents: [], metadatas: [], distances: [] }),
      };
    },
  });
  setEmbeddingFactory(async () => ({
    generate: async () => [],
  }));
});
