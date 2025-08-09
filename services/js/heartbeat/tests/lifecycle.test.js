import test from "ava";
import path from "path";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";
import { start, stop } from "../index.js";
import {
  start as startBroker,
  stop as stopBroker,
} from "../../broker/index.js";

test.before(async (t) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  process.env.ECOSYSTEM_CONFIG = path.resolve(
    __dirname,
    "test-ecosystem.config.cjs",
  );
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
  const broker = await startBroker(0);
  const brokerPort = broker.address().port;
  process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
  t.context.mongo = mongo;
  t.context.broker = broker;
});

test.after.always(async (t) => {
  await stop();
  if (t.context.broker) await stopBroker(t.context.broker);
  if (t.context.mongo) await t.context.mongo.stop();
});

// Ensure stopping twice does not throw and cleans up internal state.
test("stop may be called multiple times", async (t) => {
  await start();
  await stop();
  await t.notThrowsAsync(stop);
});
