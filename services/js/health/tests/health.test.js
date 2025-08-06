import test from "ava";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import os from "os";
import { start, stop } from "../index.js";

let server;
let mongo;

async function clear() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  await client.db("heartbeat_db").collection("heartbeats").deleteMany({});
  await client.close();
}

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
  process.env.HEARTBEAT_TIMEOUT = "10000";
  server = await start(0);
});

test.after.always(async () => {
  await stop();
  if (mongo) await mongo.stop();
});

test.beforeEach(async () => {
  await clear();
});

test.serial("returns aggregated metrics", async (t) => {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const now = Date.now();
  await client
    .db("heartbeat_db")
    .collection("heartbeats")
    .insertOne({ pid: 1, name: "svc", last: now, cpu: 10, memory: 1024 });
  await client.close();
  const res = await request(server).get("/health").expect(200);
  t.is(res.body.status, "ok");
  t.true(res.body.cpu.total >= 10);
  t.true(res.body.memory.total >= 1024);
});

test.serial("reports critical when load high", async (t) => {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const now = Date.now();
  await client
    .db("heartbeat_db")
    .collection("heartbeats")
    .insertOne({
      pid: 2,
      name: "svc",
      last: now,
      cpu: 0,
      memory: os.totalmem() * 0.95,
    });
  await client.close();
  const res = await request(server).get("/health").expect(200);
  t.is(res.body.status, "critical");
});
