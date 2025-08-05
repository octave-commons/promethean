import express from "express";
import { MongoClient } from "mongodb";
import { createRequire } from "module";
import path from "path";

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
let allowedInstances = {};

function loadConfig() {
  try {
    const require = createRequire(import.meta.url);
    const configPath =
      process.env.ECOSYSTEM_CONFIG ||
      path.resolve(process.cwd(), "../../../ecosystem.config.js");
    const ecosystem = require(configPath);
    allowedInstances = {};
    for (const app of ecosystem.apps || []) {
      if (app?.name) {
        allowedInstances[app.name] = app.instances || 1;
      }
    }
  } catch (err) {
    console.warn("failed to load ecosystem config", err);
    allowedInstances = {};
  }
}

app.post("/heartbeat", async (req, res) => {
  const pid = parseInt(req.body?.pid, 10);
  const name = req.body?.name;
  if (!pid || !name) {
    return res.status(400).json({ error: "pid and name required" });
  }
  const now = Date.now();
  const existing = await collection.findOne({ pid });
  if (!existing) {
    const allowed = allowedInstances[name] ?? Infinity;
    const count = await collection.countDocuments({
      name,
      last: { $gte: now - HEARTBEAT_TIMEOUT },
      killedAt: { $exists: false },
    });
    if (count >= allowed) {
      return res
        .status(409)
        .json({ error: `instance limit exceeded for ${name}` });
    }
  }
  await collection.updateOne(
    { pid },
    { $set: { last: now, name }, $unset: { killedAt: "" } },
    { upsert: true },
  );
  res.json({ status: "ok", pid, name });
});

export async function monitor(now = Date.now()) {
  const stale = await collection
    .find({ last: { $lt: now - HEARTBEAT_TIMEOUT } })
    .toArray();
  for (const doc of stale) {
    try {
      process.kill(doc.pid, "SIGKILL");
    } catch (err) {
      console.error(`failed to kill pid ${doc.pid}`, err);
    } finally {
      await collection.updateOne({ pid: doc.pid }, { $set: { killedAt: now } });
    }
  }
}

export async function start(port = process.env.PORT || 5000) {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || "10000", 10);
  CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || "5000", 10);
  MONGO_URL = process.env.MONGO_URL || MONGO_URL;
  DB_NAME = process.env.DB_NAME || DB_NAME;
  COLLECTION = process.env.COLLECTION || COLLECTION;

  loadConfig();

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
