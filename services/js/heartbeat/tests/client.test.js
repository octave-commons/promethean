import test from "ava";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import { fileURLToPath } from "url";
import { start, stop } from "../index.js";
import { HeartbeatClient } from "../../../../shared/js/heartbeat/index.js";

let server;
let mongo;

test.before(async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  process.env.ECOSYSTEM_CONFIG = path.resolve(
    __dirname,
    "test-ecosystem.config.cjs",
  );
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
  process.env.HEARTBEAT_TIMEOUT = "1000";
  process.env.CHECK_INTERVAL = "500";
  server = await start(0);
});

test.after.always(async () => {
  await stop();
  if (mongo) await mongo.stop();
});

test("heartbeat client posts pid", async (t) => {
  const url = `http://127.0.0.1:${server.address().port}/heartbeat`;
  const client = new HeartbeatClient({ url, pid: 999, name: "test-app" });
  const res = await client.sendOnce();
  t.is(res.pid, 999);
  t.is(res.name, "test-app");
  t.is(typeof res.cpu, "number");
  t.is(typeof res.memory, "number");
  t.is(typeof res.netRx, "number");
  t.is(typeof res.netTx, "number");
});
