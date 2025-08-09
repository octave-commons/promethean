import test from "ava";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import {
  start as startBroker,
  stop as stopBroker,
} from "../../broker/index.js";
import { start, stop } from "../index.js";
import { HeartbeatClient } from "../../../../shared/js/heartbeat/index.js";

let server;
let mongo;
let broker;
let brokerPort;

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
  broker = await startBroker(0);
  brokerPort = broker.address().port;
  process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
  server = await start(0);
});

test.after.always(async () => {
  await stop();
  if (broker) await stopBroker(broker);
  if (mongo) await mongo.stop();
});

test("heartbeat client posts pid", async (t) => {
  const url = `ws://127.0.0.1:${brokerPort}`;
  const client = new HeartbeatClient({ url, pid: 999, name: "test-app" });
  await client.sendOnce();
  const mongoClient = new MongoClient(process.env.MONGO_URL);
  await mongoClient.connect();
  let doc = null;
  for (let i = 0; i < 10 && !doc; i++) {
    doc = await mongoClient
      .db("heartbeat_db")
      .collection("heartbeats")
      .findOne({ pid: 999 });
    if (!doc) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  await mongoClient.close();
  t.truthy(doc);
  t.is(doc.name, "test-app");
  t.is(typeof doc.cpu, "number");
});

test("heartbeat client invokes callback", async (t) => {
  const url = `ws://127.0.0.1:${brokerPort}`;
  await new Promise((resolve) => {
    const client = new HeartbeatClient({
      url,
      pid: 1000,
      name: "test-app",
      interval: 50,
      onHeartbeat(data) {
        t.is(data.pid, 1000);
        client.stop();
        resolve(null);
      },
    });
    client.start();
  });
});

test("heartbeat client requires name", (t) => {
  const url = `ws://127.0.0.1:${brokerPort}`;
  const err = t.throws(() => new HeartbeatClient({ url, pid: 1 }));
  t.regex(err.message, /name required/);
});
