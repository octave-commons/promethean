import test from "ava";
import path from "path";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";
import { WebSocket } from "ws";
import { start, stop } from "../index.js";
import {
  start as startBroker,
  stop as stopBroker,
} from "../../broker/index.js";

let server;
let mongo;
let broker;
let brokerPort;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.before(async () => {
  process.env.ECOSYSTEM_CONFIG = path.resolve(
    __dirname,
    "test-ecosystem.config.cjs",
  );
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
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

test("accepts heartbeat over websocket", async (t) => {
  const port = server.address().port;
  const ws = new WebSocket(`ws://127.0.0.1:${port}/heartbeat`);
  const payload = { pid: process.pid, name: "ws-test" };
  const response = await new Promise((resolve, reject) => {
    ws.on("open", () => ws.send(JSON.stringify(payload)));
    ws.on("message", (msg) => {
      resolve(JSON.parse(msg.toString()));
    });
    ws.on("error", reject);
  });
  t.is(response.pid, payload.pid);
  t.is(response.name, payload.name);
  ws.close();
});
