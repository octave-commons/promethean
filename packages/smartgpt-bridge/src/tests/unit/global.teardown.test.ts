// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import test from "ava";
import {
  resetChroma,
  setEmbeddingFactory,
  setChromaClient,
} from "../../indexer.js";
import { getMongoClient } from "@promethean/persistence/clients.js";

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
