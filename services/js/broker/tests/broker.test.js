import test from "ava";
import WebSocket from "ws";
import { start, stop } from "../index.js";

let server;
let port;

async function connect() {
  return await new Promise((resolve) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.on("open", () => resolve(ws));
  });
}

test.beforeEach(async () => {
  server = await start(0);
  port = server.address().port;
});

test.afterEach.always(async () => {
  await stop(server);
});

test.serial("routes published messages to subscribers", async (t) => {
  const sub = await connect();
  const pub = await connect();
  sub.send(JSON.stringify({ action: "subscribe", topic: "greet" }));
  await new Promise((r) => setTimeout(r, 50));
  const received = new Promise((resolve) => {
    sub.on("message", (data) => resolve(JSON.parse(data)));
  });
  pub.send(
    JSON.stringify({
      action: "publish",
      message: { type: "greet", source: "tester", payload: { msg: "hi" } },
    }),
  );
  const msg = await received;
  t.is(msg.event.payload.msg, "hi");
  sub.close();
  pub.close();
});

test.serial("unsubscribe stops delivery", async (t) => {
  const sub = await connect();
  const pub = await connect();
  sub.send(JSON.stringify({ action: "subscribe", topic: "ping" }));
  await new Promise((r) => setTimeout(r, 50));
  sub.send(JSON.stringify({ action: "unsubscribe", topic: "ping" }));
  await new Promise((r) => setTimeout(r, 50));
  let received = false;
  sub.on("message", () => {
    received = true;
  });
  pub.send(
    JSON.stringify({
      action: "publish",
      message: { type: "ping", payload: {} },
    }),
  );
  await new Promise((r) => setTimeout(r, 100));
  t.false(received);
  sub.close();
  pub.close();
});

test.serial("forwards correlation and replyTo", async (t) => {
  const sub = await connect();
  const pub = await connect();
  sub.send(JSON.stringify({ action: "subscribe", topic: "ask" }));
  await new Promise((r) => setTimeout(r, 50));
  const received = new Promise((resolve) => {
    sub.on("message", (data) => resolve(JSON.parse(data)));
  });
  pub.send(
    JSON.stringify({
      action: "publish",
      message: {
        type: "ask",
        payload: { q: 1 },
        correlationId: "123",
        replyTo: "answer",
      },
    }),
  );
  const msg = await received;
  t.is(msg.event.correlationId, "123");
  t.is(msg.event.replyTo, "answer");
  sub.close();
  pub.close();
});
