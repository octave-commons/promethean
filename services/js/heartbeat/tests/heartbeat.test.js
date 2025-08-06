import test from "ava";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { start, stop } from "../index.js";

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
  process.env.HEARTBEAT_TIMEOUT = "100";
  process.env.CHECK_INTERVAL = "50";
  server = await start(0);
});

test.after.always(async () => {
  await stop();
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
  await request(server)
    .post("/heartbeat")
    .send({ pid: child.pid, name: "test-app" });
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
  await request(server)
    .post("/heartbeat")
    .send({ pid: child1.pid, name: "test-app" })
    .expect(200);
  const res = await request(server)
    .post("/heartbeat")
    .send({ pid: child2.pid, name: "test-app" });
  t.is(res.status, 409);
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
  await request(server)
    .post("/heartbeat")
    .send({ pid: child.pid, name: "metric-app" })
    .expect(200);
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
  await request(server)
    .post("/heartbeat")
    .send({ pid: child.pid, name: "list-app" })
    .expect(200);
  const res = await request(server).get("/heartbeats").expect(200);
  const found = res.body.find((h) => h.pid === child.pid);
  t.truthy(found);
  t.is(found.name, "list-app");
});
