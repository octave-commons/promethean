import express from "express";
import os from "os";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";

export const app = express();

let HEARTBEAT_TIMEOUT = 10000;
let server;
let broker;
const heartbeats = new Map();

app.get("/health", (req, res) => {
  const now = Date.now();
  let totalCpu = 0;
  let totalMemory = 0;
  for (const hb of heartbeats.values()) {
    if (hb.last >= now - HEARTBEAT_TIMEOUT) {
      totalCpu += hb.cpu || 0;
      totalMemory += hb.memory || 0;
    }
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
});

export async function start(port = process.env.PORT || 0) {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || "10000", 10);
  const url =
    process.env.BROKER_URL ||
    `ws://127.0.0.1:${process.env.BROKER_PORT || 7000}`;
  broker = new BrokerClient({ url });
  heartbeats.clear();
  await broker.connect();
  broker.subscribe("heartbeat", (event) => {
    const { name, cpu = 0, memory = 0 } = event.payload || {};
    const key = name || event.source;
    heartbeats.set(key, { cpu, memory, last: Date.now() });
  });
  server = app.listen(port);
  return server;
}

export async function stop() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  if (broker) {
    try {
      await broker.disconnect();
    } catch {}
    broker = null;
  }
  heartbeats.clear();
}

export function reset() {
  heartbeats.clear();
}

if (process.env.NODE_ENV !== "test") {
  start(process.env.PORT || 5006).catch((err) => {
    console.error("Failed to start health service", err);
    process.exit(1);
  });
}
