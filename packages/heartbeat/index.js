import { getMongoClient } from "@promethean/persistence/clients.js";
import { createRequire } from "module";
import path from "path";
import { randomUUID } from "crypto";
import { pathToFileURL } from "url";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";

import { createHeartbeatWorld } from "./ecs/world.js";

let HEARTBEAT_TIMEOUT = 10000;
let CHECK_INTERVAL = 5000;
let DB_NAME = "heartbeat_db";
let COLLECTION = "heartbeats";
let BROKER_URL = "ws://127.0.0.1:7000";

const state = {
  world: null,
  broker: null,
  interval: null,
  runChain: Promise.resolve(),
  sessionId: null,
  shuttingDown: false,
};

function loadConfig() {
  const require = createRequire(import.meta.url);
  const configPath = process.env.ECOSYSTEM_CONFIG;
  if (!configPath) return {};
  try {
    const ecosystem = require(configPath);
    const allowed = {};
    for (const app of ecosystem.apps || []) {
      if (app?.name) {
        allowed[app.name] = app.instances || 1;
      }
    }
    return allowed;
  } catch (err) {
    console.warn("failed to load ecosystem config", err);
    return {};
  }
}

function queueRun(time = Date.now()) {
  if (!state.world) return Promise.resolve();
  const scheduled = time;
  state.runChain = state.runChain.then(async () => {
    try {
      await state.world.run(scheduled);
    } catch (err) {
      console.error("heartbeat frame failed", err);
    }
  });
  return state.runChain;
}

function queueForceMonitor(time = Date.now()) {
  if (!state.world) return Promise.resolve();
  const scheduled = time;
  state.runChain = state.runChain.then(async () => {
    try {
      await state.world.forceMonitor(scheduled);
    } catch (err) {
      console.error("heartbeat monitor failed", err);
    }
  });
  return state.runChain;
}

export async function start() {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || "10000", 10);
  CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || "5000", 10);
  DB_NAME = process.env.DB_NAME || DB_NAME;
  COLLECTION = process.env.COLLECTION || COLLECTION;
  BROKER_URL = process.env.BROKER_URL || BROKER_URL;

  const allowedInstances = loadConfig();
  state.sessionId = randomUUID();

  const broker = new BrokerClient({ url: BROKER_URL });
  const world = createHeartbeatWorld({
    sessionId: state.sessionId,
    allowedInstances,
    heartbeatTimeout: HEARTBEAT_TIMEOUT,
    checkInterval: CHECK_INTERVAL,
    dbName: DB_NAME,
    collectionName: COLLECTION,
    getMongoClient,
    broker,
  });

  state.world = world;
  state.broker = broker;
  await queueRun();

  await broker.connect();
  broker.subscribe("heartbeat", (event) => {
    if (!state.world) return;
    state.world.enqueueHeartbeat(event.payload || {});
    queueRun();
  });

  state.interval = setInterval(() => {
    queueRun();
  }, CHECK_INTERVAL);
}

export async function monitor(now = Date.now()) {
  await queueForceMonitor(now);
}

export async function cleanup() {
  await state.runChain;
  if (state.world) {
    await state.world.cleanup();
  }
}

export async function stop() {
  await cleanup();
  if (state.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }
  if (state.broker) {
    try {
      state.broker.disconnect();
    } catch {}
    state.broker = null;
  }
  if (state.world) {
    await state.world.close();
    state.world = null;
  }
  state.runChain = Promise.resolve();
}

async function handleSignal() {
  if (state.shuttingDown) return;
  state.shuttingDown = true;
  await stop();
  process.exit(0);
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, handleSignal);
}

process.on("beforeExit", () => {
  cleanup().catch(() => {});
});

if (process.env.NODE_ENV !== "test") {
  const entry = process.argv[1];
  const isMain = () => {
    if (!entry) return false;
    try {
      return pathToFileURL(path.resolve(entry)).href === import.meta.url;
    } catch {
      return false;
    }
  };
  if (isMain()) {
    start().catch((err) => {
      console.error("Failed to start service", err);
      process.exit(1);
    });
  }
}
