import test from "ava";
import request from "supertest";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";
import os from "os";
import { start, stop, reset } from "../index.js";
// Use in-memory broker for unit test; no real WS server

let server;

async function sendHeartbeat(payload) {
  const client = new BrokerClient({ url: process.env.BROKER_URL });
  await client.connect();
  client.publish("heartbeat", payload);
  await new Promise((r) => setTimeout(r, 50));
  // Ensure we don’t schedule reconnect timers that keep the process alive.
  await new Promise((resolve) => {
    const sock = client.socket;
    if (sock) sock.once("close", resolve);
    else resolve();
    client.disconnect();
  });
}

test.before(async () => {
  process.env.BROKER_URL = "memory://health";
  process.env.HEARTBEAT_TIMEOUT = "10000";
  server = await start(0);
});

test.after.always(async () => {
  await stop();
});

test.beforeEach(() => {
  reset();
});
test.serial("returns aggregated metrics", async (t) => {
  await sendHeartbeat({ name: "svc", cpu: 10, memory: 1024 });
  const res = await request(server).get("/health").expect(200);
  t.is(res.body.status, "ok");
  t.true(res.body.cpu.total >= 10);
  t.true(res.body.memory.total >= 1024);
});

test.serial("reports critical when load high", async (t) => {
  await sendHeartbeat({ name: "svc", cpu: 0, memory: os.totalmem() * 0.95 });
  const res = await request(server).get("/health").expect(200);
  t.is(res.body.status, "critical");
});
