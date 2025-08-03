import express from "express";
import { MongoClient } from "mongodb";

export const app = express();
app.use(express.json());

let HEARTBEAT_TIMEOUT = 10000;
let CHECK_INTERVAL = 5000;
let MONGO_URL = "mongodb://127.0.0.1:27017";
let DB_NAME = "heartbeat_db";
let COLLECTION = "heartbeats";

let client;
let collection;
let interval;
let server;

app.post("/heartbeat", async (req, res) => {
  const pid = parseInt(req.body?.pid, 10);
  if (!pid) {
    return res.status(400).json({ error: "pid required" });
  }
  await collection.updateOne(
    { pid },
    { $set: { last: Date.now() } },
    { upsert: true },
  );
  res.json({ status: "ok", pid });
});

export async function monitor(now = Date.now()) {
  const stale = await collection
    .find({ last: { $lt: now - HEARTBEAT_TIMEOUT } })
    .toArray();
  for (const doc of stale) {
    try {
      process.kill(doc.pid, "SIGKILL");
    } catch (err) {
      /* ignore */
    }
    await collection.deleteOne({ pid: doc.pid });
  }
}

export async function start(port = process.env.PORT || 5000) {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || "10000", 10);
  CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || "5000", 10);
  MONGO_URL = process.env.MONGO_URL || MONGO_URL;
  DB_NAME = process.env.DB_NAME || DB_NAME;
  COLLECTION = process.env.COLLECTION || COLLECTION;

  client = new MongoClient(MONGO_URL);
  await client.connect();
  collection = client.db(DB_NAME).collection(COLLECTION);
  interval = setInterval(() => monitor(), CHECK_INTERVAL);
  server = app.listen(port, () => {
    console.log(`heartbeat service listening on ${port}`);
  });
  return server;
}

export async function stop() {
  if (interval) clearInterval(interval);
  if (server) server.close();
  if (client) await client.close();
}

if (process.env.NODE_ENV !== "test") {
  start().catch((err) => {
    console.error("Failed to start service", err);
    process.exit(1);
  });
}
