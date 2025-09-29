import { getMongoClient } from "@promethean/persistence/clients.js";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import pidusage from "pidusage";
import { randomUUID } from "crypto";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";
import { fileURLToPath } from "url";

let HEARTBEAT_TIMEOUT = 10000;
let CHECK_INTERVAL = 5000;
let DB_NAME = "heartbeat_db";
let COLLECTION = "heartbeats";
let BROKER_URL = "ws://127.0.0.1:7000";

let client;
let collection;
let interval;
let broker;
let allowedInstances = {};
let SESSION_ID;
let shuttingDown = false;

function isMissingProcessError(err) {
  if (!err || typeof err !== "object") return false;
  const code = err.code;
  if (code === "ENOENT" || code === "ESRCH") return true;
  const message = err.message;
  return typeof message === "string" && message.includes("No matching pid");
}

async function getProcessMetrics(pid) {
  const metrics = { cpu: 0, memory: 0, netRx: 0, netTx: 0 };
  let processExists = true;
  try {
    const { cpu, memory } = await pidusage(pid);
    metrics.cpu = cpu;
    metrics.memory = memory;
  } catch (err) {
    if (isMissingProcessError(err)) {
      processExists = false;
    } else {
      console.warn(`failed to get cpu/memory for pid ${pid}`, err);
    }
  }
  if (!processExists) {
    return metrics;
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

function resolveConfigPath() {
  if (process.env.ECOSYSTEM_CONFIG) {
    return process.env.ECOSYSTEM_CONFIG;
  }
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(moduleDir, "../../system/daemons/ecosystem.config.js");
}

async function loadConfig() {
  const require = createRequire(import.meta.url);
  const configPath = resolveConfigPath();
  let ecosystem;
  let failure;

  if (fs.existsSync(configPath)) {
    try {
      ecosystem = require(configPath);
    } catch (err) {
      failure = err;
    }
  }

  if (!ecosystem) {
    try {
      const fallbackModule = await import(
        new URL("./ecosystem.dependencies.js", import.meta.url)
      );
      ecosystem = fallbackModule.default ?? fallbackModule;
    } catch (err) {
      failure = failure || err;
    }
  }

  if (!ecosystem) {
    if (failure) {
      console.warn("failed to load ecosystem config", failure);
    }
    allowedInstances = {};
    return;
  }

  allowedInstances = {};
  for (const app of ecosystem.apps || []) {
    if (app?.name) {
      allowedInstances[app.name] = app.instances || 1;
    }
  }
}

async function handleHeartbeat({ pid, name }) {
  pid = parseInt(pid, 10);
  if (!pid || !name || !collection) return;
  const now = Date.now();
  try {
    const existing =
      typeof collection.findOne === "function"
        ? await collection.findOne({ pid, sessionId: SESSION_ID })
        : await collection
            .find({ pid, sessionId: SESSION_ID })
            .toArray()
            .then((docs = []) => docs[0]);
    if (!existing) {
      const allowed = allowedInstances[name] ?? Infinity;
      const count = await collection.countDocuments({
        name,
        sessionId: SESSION_ID,
        last: { $gte: now - HEARTBEAT_TIMEOUT },
        killedAt: { $exists: false },
      });
      if (count >= allowed) return;
    }
    const metrics = await getProcessMetrics(pid);
    await collection.updateOne(
      { pid },
      {
        $set: { pid, last: now, name, sessionId: SESSION_ID, ...metrics },
        $unset: { killedAt: "" },
      },
      { upsert: true },
    );
  } catch {
    /* swallow processing errors */
  }
}

export async function monitor(now = Date.now()) {
  if (!collection) return;
  let stale = [];
  try {
    stale = await collection
      .find({
        last: { $lt: now - HEARTBEAT_TIMEOUT },
        killedAt: { $exists: false },
      })
      .toArray();
  } catch {
    return;
  }
  for (const doc of stale) {
    try {
      // Preflight: if process does not exist, mark killed without logging noise
      try {
        process.kill(doc.pid, 0);
      } catch (e) {
        if (e && e.code === "ESRCH") {
          await collection.updateOne(
            { pid: doc.pid },
            { $set: { killedAt: now } },
          );
          continue;
        }
      }
      process.kill(doc.pid, "SIGKILL");
    } catch (err) {
      console.error(`failed to kill pid ${doc.pid}`, err);
    } finally {
      await collection.updateOne({ pid: doc.pid }, { $set: { killedAt: now } });
    }
  }
}

export async function start() {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || "10000", 10);
  CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || "5000", 10);
  DB_NAME = process.env.DB_NAME || DB_NAME;
  COLLECTION = process.env.COLLECTION || COLLECTION;
  BROKER_URL = process.env.BROKER_URL || BROKER_URL;

  await loadConfig();

  SESSION_ID = randomUUID();

  client = await getMongoClient();
  collection = client.db(DB_NAME).collection(COLLECTION);
  broker = new BrokerClient({ url: BROKER_URL });
  await broker.connect();
  broker.subscribe("heartbeat", (event) => {
    handleHeartbeat(event.payload || {}).catch(() => {});
  });
  interval = setInterval(() => {
    monitor().catch(() => {});
  }, CHECK_INTERVAL);
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
  if (broker) {
    try {
      broker.disconnect();
    } catch {}
    broker = null;
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
