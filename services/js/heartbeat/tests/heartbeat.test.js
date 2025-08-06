import test from "ava";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import WebSocket from "ws";
import {
  start as startBroker,
  stop as stopBroker,
} from "../../broker/index.js";
import { start, stop } from "../index.js";

let server;
let mongo;
let broker;
let brokerPort;

async function publish(pid, name) {
  const ws = new WebSocket(`ws://127.0.0.1:${brokerPort}`);
  await new Promise((resolve) => ws.once("open", resolve));
  ws.send(
    JSON.stringify({
      action: "publish",
      message: { type: "heartbeat", payload: { pid, name } },
    }),
  );
  await new Promise((r) => setTimeout(r, 50));
  ws.close();
}

test.before(async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  process.env.ECOSYSTEM_CONFIG = path.resolve(
    __dirname,
    "test-ecosystem.config.cjs",
  );
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
  process.env.HEARTBEAT_TIMEOUT = "100";
  process.env.CHECK_INTERVAL = "50";
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

test.serial("stale process is killed", async (t) => {
  const child = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  t.teardown(() => {
    if (!child.killed) {
      try {
        child.kill();
      } catch {}
    }
  });
  await publish(child.pid, "test-app");
  const exit = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("not killed")), 2000);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
  t.is(exit.signal, "SIGKILL");
});

test.serial("rejects excess instances", async (t) => {
  const child1 = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  const child2 = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  t.teardown(() => {
    for (const child of [child1, child2]) {
      if (!child.killed) {
        try {
          child.kill();
        } catch {}
      }
    }
  });
  await publish(child1.pid, "test-app");
  await publish(child2.pid, "test-app");
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const count = await client
    .db("heartbeat_db")
    .collection("heartbeats")
    .countDocuments({ name: "test-app" });
  await client.close();
  t.is(count, 1);
});

test.serial("records process metrics", async (t) => {
  const child = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  t.teardown(() => {
    if (!child.killed) {
      try {
        child.kill();
      } catch {}
    }
  });
  await publish(child.pid, "metric-app");
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const doc = await client
    .db("heartbeat_db")
    .collection("heartbeats")
    .findOne({ pid: child.pid });
  await client.close();
  t.is(typeof doc.cpu, "number");
  t.is(typeof doc.memory, "number");
  t.is(typeof doc.netRx, "number");
  t.is(typeof doc.netTx, "number");
});

test.serial("lists heartbeats", async (t) => {
  const child = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  t.teardown(() => {
    if (!child.killed) {
      try {
        child.kill();
      } catch {}
    }
  });
  await publish(child.pid, "list-app");
  const res = await request(server).get("/heartbeats").expect(200);
  const found = res.body.find((h) => h.pid === child.pid);
  t.truthy(found);
  t.is(found.name, "list-app");
});

test.serial("ignores heartbeats from previous sessions", async (t) => {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  await client.db("heartbeat_db").collection("heartbeats").insertOne({
    pid: 12345,
    name: "test-app",
    last: Date.now(),
    sessionId: "old-session",
  });
  await client.close();
  await stop();
  server = await start(0);
  const child = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  t.teardown(() => {
    if (!child.killed) {
      try {
        child.kill();
      } catch {}
    }
  });
  await publish(child.pid, "test-app");
  const verify = new MongoClient(process.env.MONGO_URL);
  await verify.connect();
  const doc = await verify
    .db("heartbeat_db")
    .collection("heartbeats")
    .findOne({ pid: child.pid });
  await verify.close();
  t.truthy(doc.sessionId);
  t.not(doc.sessionId, "old-session");
});

test.serial("cleanup marks heartbeats killed on stop", async (t) => {
  const child = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  await publish(child.pid, "cleanup-app");
  await stop();
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const doc = await client
    .db("heartbeat_db")
    .collection("heartbeats")
    .findOne({ pid: child.pid });
  t.truthy(doc.killedAt);
  await client.close();
  server = await start(0);
  if (!child.killed) {
    try {
      child.kill();
    } catch {}
  }
});
