// integration: exercises real ws server
import test from "ava";
import { WebSocketServer } from "ws";
import { once } from "events";

import { sleep } from "@promethean/utils";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";

test.serial("BrokerClient sends messages and handles callbacks", async (t) => {
  const wss = new WebSocketServer({ port: 0 });
  await once(wss, "listening");
  const port = wss.address().port;
  const received = [];
  let task;

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      const msg = JSON.parse(data);
      received.push(msg);
      if (msg.action === "subscribe") {
        ws.send(JSON.stringify({ event: { type: msg.topic, data: 42 } }));
      }
    });
    setTimeout(() => {
      ws.send(JSON.stringify({ action: "task-assigned", task: { id: "t1" } }));
    }, 10);
  });

  const client = new BrokerClient({ url: `ws://localhost:${port}` });
  client.onTaskReceived((t) => {
    task = t;
  });

  await client.connect();

  let eventData;
  client.subscribe("foo", (evt) => {
    eventData = evt.data;
  });

  client.publish("note", { p: 1 });
  client.enqueue("alpha", { a: 1 });
  client.ready("alpha");
  client.ack("t1");
  client.heartbeat();

  await sleep(50);

  client.unsubscribe("foo");
  await sleep(10);

  t.is(eventData, 42);
  t.deepEqual(task, { id: "t1" });
  t.deepEqual(
    received.map((m) => m.action),
    [
      "subscribe",
      "publish",
      "enqueue",
      "ready",
      "ack",
      "heartbeat",
      "unsubscribe",
    ],
  );

  client.disconnect();
  await new Promise((resolve) => wss.close(resolve));
});

test.serial("BrokerClient reconnects and flushes queue", async (t) => {
  const wss = new WebSocketServer({ port: 0 });
  await once(wss, "listening");
  const port = wss.address().port;
  const received = [];
  let connectionCount = 0;

  wss.on("connection", (ws) => {
    connectionCount += 1;
    ws.on("message", (data) => {
      received.push(JSON.parse(data));
    });
    // Close only the first connection to trigger reconnect
    if (connectionCount === 1) {
      setTimeout(() => ws.close(), 20);
    }
  });

  const client = new BrokerClient({ url: `ws://localhost:${port}` });
  await client.connect();

  // Connection will close shortly; queue a message while disconnected
  await sleep(50);
  client.publish("after", { a: 1 });

  // Wait for reconnection and message flush
  await sleep(1500);

  t.true(
    received.some((m) => m.action === "publish" && m.message.payload.a === 1),
  );

  client.disconnect();
  await new Promise((resolve) => wss.close(resolve));
});
