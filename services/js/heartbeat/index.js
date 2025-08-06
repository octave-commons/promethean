import express from "express";
import { MongoClient } from "mongodb";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import pidusage from "pidusage";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";

export const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

let HEARTBEAT_TIMEOUT = 10000;
let CHECK_INTERVAL = 5000;
let MONGO_URL = "mongodb://127.0.0.1:27017";
let DB_NAME = "heartbeat_db";
let COLLECTION = "heartbeats";

let client;
let collection;
let interval;
let server;
let wss;
let allowedInstances = {};
let SESSION_ID;
let shuttingDown = false;

async function processHeartbeat(pid, name) {
  if (!pid || !name) {
    return { status: 400, body: { error: "pid and name required" } };
  }
  if (!collection) {
    return { status: 503, body: { error: "db not available" } };
  }
  const now = Date.now();
  try {
    const existing = await collection.findOne({ pid, sessionId: SESSION_ID });
    if (!existing) {
      const allowed = allowedInstances[name] ?? Infinity;
      const count = await collection.countDocuments({
        name,
        sessionId: SESSION_ID,
        last: { $gte: now - HEARTBEAT_TIMEOUT },
        killedAt: { $exists: false },
      });
      if (count >= allowed) {
        return {
          status: 409,
          body: { error: `instance limit exceeded for ${name}` },
        };
      }
    }
    const metrics = await getProcessMetrics(pid);
    await collection.updateOne(
      { pid },
      {
        $set: { last: now, name, sessionId: SESSION_ID, ...metrics },
        $unset: { killedAt: "" },
      },
      { upsert: true },
    );
    return { status: 200, body: { status: "ok", pid, name, ...metrics } };
  } catch {
    return { status: 500, body: { error: "db failure" } };
  }
}

async function getProcessMetrics(pid) {
  const metrics = { cpu: 0, memory: 0, netRx: 0, netTx: 0 };
  try {
    const { cpu, memory } = await pidusage(pid);
    metrics.cpu = cpu;
    metrics.memory = memory;
  } catch (err) {
    console.warn(`failed to get cpu/memory for pid ${pid}`, err);
  }
  try {
    const data = fs.readFileSync(`/proc/${pid}/net/dev`, "utf8");
    for (const line of data.trim().split("\n").slice(2)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 17) {
        metrics.netRx += parseInt(parts[1], 10) || 0;
        metrics.netTx += parseInt(parts[9], 10) || 0;
      }
    }
  } catch (err) {
    // ignore network stats errors
  }
  return metrics;
}

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
  const result = await processHeartbeat(pid, name);
  return res.status(result.status).json(result.body);
});

app.get("/heartbeats", async (req, res) => {
  if (!collection) {
    return res.status(503).json({ error: "db not available" });
  }
  try {
    const docs = await collection.find({}).toArray();
    return res.json(docs);
  } catch {
    return res.status(500).json({ error: "db failure" });
  }
});

export async function monitor(now = Date.now()) {
  if (!collection) return;
  let stale = [];
  try {
    stale = await collection
      .find({ last: { $lt: now - HEARTBEAT_TIMEOUT } })
      .toArray();
  } catch {
    return;
  }
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

  SESSION_ID = randomUUID();

  client = new MongoClient(MONGO_URL);
  await client.connect();
  collection = client.db(DB_NAME).collection(COLLECTION);
  interval = setInterval(() => {
    monitor().catch(() => {});
  }, CHECK_INTERVAL);
  server = app.listen(port, () => {
    console.log(`heartbeat service listening on ${port}`);
  });
  wss = new WebSocketServer({ server, path: "/heartbeat" });
  wss.on("connection", (ws) => {
    ws.on("message", async (msg) => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch {
        ws.send(JSON.stringify({ error: "invalid json" }));
        return;
      }
      const result = await processHeartbeat(parseInt(data.pid, 10), data.name);
      ws.send(JSON.stringify(result.body));
    });
  });
  return server;
}

export async function cleanup() {
  if (collection) {
    const now = Date.now();
    try {
      await collection.updateMany(
        { sessionId: SESSION_ID, killedAt: { $exists: false } },
        { $set: { killedAt: now } },
      );
    } catch {
      /* ignore cleanup errors */
    }
  }
}

export async function stop() {
  await cleanup();
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  if (server) {
    server.close();
    server = null;
  }
  if (wss) {
    wss.close();
    wss = null;
  }
  if (client) {
    try {
      await client.close();
    } catch {
      /* ignore errors from closing */
    }
    client = null;
    collection = null;
  }
}

if (process.env.NODE_ENV !== "test") {
  start().catch((err) => {
    console.error("Failed to start service", err);
    process.exit(1);
  });
}

async function handleSignal() {
  if (shuttingDown) return;
  shuttingDown = true;
  await stop();
  process.exit(0);
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, handleSignal);
}

process.on("beforeExit", () => {
  cleanup().catch(() => {});
});
