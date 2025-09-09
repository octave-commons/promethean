import test from "ava";
import { getMongoClient } from "@promethean/persistence/clients.js";

import {
  resetChroma,
  setEmbeddingFactory,
  setChromaClient,
} from "../../indexer.js";

test("teardown placeholder", (t) => {
  t.pass();
});

test.after.always("global teardown", async () => {
  try {
    resetChroma();
  } catch {}
  try {
    setEmbeddingFactory(null);
  } catch {}
  try {
    setChromaClient({
      getOrCreateCollection: async () => ({
        query: async () => ({}),
        upsert: async () => {},
      }),
    });
  } catch {}
  try {
    const mongo = await getMongoClient();
    await mongo.close();
  } catch {}
});
