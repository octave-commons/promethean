import test from "ava";
import path from "path";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";
import { start, stop } from "../index.js";

test.before(async (t) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  process.env.ECOSYSTEM_CONFIG = path.resolve(
    __dirname,
    "test-ecosystem.config.cjs",
  );
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
  t.context.mongo = mongo;
});

test.after.always(async (t) => {
  await stop();
  if (t.context.mongo) await t.context.mongo.stop();
});

// Ensure stopping twice does not throw and cleans up internal state.
test("stop may be called multiple times", async (t) => {
  await start(0);
  await stop();
  await t.notThrowsAsync(stop);
});
