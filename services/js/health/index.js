import express from "express";
import { MongoClient } from "mongodb";
import os from "os";

export const app = express();

let HEARTBEAT_TIMEOUT = 10000;
let MONGO_URL = "mongodb://127.0.0.1:27017";
let DB_NAME = "heartbeat_db";
let COLLECTION = "heartbeats";

let client;
let collection;
let server;

app.get("/health", async (req, res) => {
  if (!collection) {
    return res.status(503).json({ error: "db not available" });
  }
  const now = Date.now();
  try {
    const docs = await collection
      .find({
        last: { $gte: now - HEARTBEAT_TIMEOUT },
        killedAt: { $exists: false },
      })
      .toArray();
    let totalCpu = 0;
    let totalMemory = 0;
    for (const doc of docs) {
      totalCpu += doc.cpu || 0;
      totalMemory += doc.memory || 0;
    }
    const cores = os.cpus().length || 1;
    const cpuRatio = totalCpu / (cores * 100);
    const totalMem = os.totalmem() || 1;
    const memoryRatio = totalMemory / totalMem;
    let status = "ok";
    if (cpuRatio > 0.9 || memoryRatio > 0.9) status = "critical";
    else if (cpuRatio > 0.75 || memoryRatio > 0.75) status = "high";
    return res.json({
      status,
      cpu: { total: totalCpu, ratio: cpuRatio },
      memory: { total: totalMemory, ratio: memoryRatio },
    });
  } catch {
    return res.status(500).json({ error: "db failure" });
  }
});

export async function start(port = process.env.PORT || 0) {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || "10000", 10);
  MONGO_URL = process.env.MONGO_URL || MONGO_URL;
  DB_NAME = process.env.DB_NAME || DB_NAME;
  COLLECTION = process.env.COLLECTION || COLLECTION;

  client = new MongoClient(MONGO_URL);
  await client.connect();
  collection = client.db(DB_NAME).collection(COLLECTION);
  server = app.listen(port);
  return server;
}

export async function stop() {
  if (server) {
    server.close();
    server = null;
  }
  if (client) {
    try {
      await client.close();
    } catch {}
    client = null;
    collection = null;
  }
}

if (process.env.NODE_ENV !== "test") {
  start(process.env.PORT || 5006).catch((err) => {
    console.error("Failed to start health service", err);
    process.exit(1);
  });
}
