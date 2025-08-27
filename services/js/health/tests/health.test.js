import test from "ava";
import request from "supertest";
import { BrokerClient } from "@shared/js/brokerClient.js";
import os from "os";
import { start, stop, reset } from "../index.js";
import {
  start as startBroker,
  stop as stopBroker,
} from "../../broker/index.js";

const SKIP = process.env.SKIP_NETWORK_TESTS === "1";

let server;
let broker;
let brokerPort;

async function sendHeartbeat(payload) {
  const client = new BrokerClient({ url: `ws://127.0.0.1:${brokerPort}` });
  await client.connect();
  client.publish("heartbeat", payload);
  await new Promise((r) => setTimeout(r, 50));
  // Ensure we don't leave behind reconnect timers or open sockets.
  await new Promise((resolve) => {
    client.socket.once("close", resolve);
    client.disconnect();
  });
}

test.before(async () => {
  if (SKIP) return; // do not start network listeners in sandbox
  broker = await startBroker(0);
  brokerPort = broker.address().port;
  process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
  process.env.HEARTBEAT_TIMEOUT = "10000";
  server = await start(0);
});

test.after.always(async () => {
  if (SKIP) return;
  await stop();
  if (broker) await stopBroker(broker);
});

test.beforeEach(() => {
  if (SKIP) return;
  reset();
});

if (SKIP) {
  test("health tests skipped in sandbox", (t) => t.pass());
} else {
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
}
