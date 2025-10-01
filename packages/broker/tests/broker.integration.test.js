// integration
import test from "ava";
import WebSocket from "ws";
import { sleep } from "@promethean/test-utils";
import { start, stop } from "../index.js";

// In restricted CI/sandboxes, listening on sockets may be disallowed.
// Allow opting out of these networked tests by setting SKIP_NETWORK_TESTS=1.
if (process.env.SKIP_NETWORK_TESTS === "1") {
  test("broker network tests skipped in sandbox", (t) => {
    t.pass();
  });
  // Do not register the rest of the tests
} else {
  let server;
  let port;

  async function connect() {
    return await new Promise((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.on("open", () => resolve(ws));
    });
  }

  test.beforeEach(async () => {
    process.env.REDIS_URL = "redis://127.0.0.1:6390"; // force fallback to memory
    server = await start(0);
    port = server.address().port;
  });

  test.afterEach.always(async () => {
    await stop(server);
  });

  test.serial("dispatches tasks to ready workers", async (t) => {
    const prod = await connect();
    const worker = await connect();
    worker.send(JSON.stringify({ action: "ready", queue: "jobs" }));
    await sleep(20);
    prod.send(
      JSON.stringify({
        action: "enqueue",
        queue: "jobs",
        task: { x: 1 },
      }),
    );
    const msg = await new Promise((resolve) =>
      worker.once("message", (data) => resolve(JSON.parse(data))),
    );
    t.is(msg.action, "task-assigned");
    t.deepEqual(msg.task.payload, { x: 1 });
    worker.send(JSON.stringify({ action: "ack", taskId: msg.task.id }));
    // enqueue another task but don't mark ready yet
    prod.send(
      JSON.stringify({ action: "enqueue", queue: "jobs", task: { x: 2 } }),
    );
    let received = false;
    worker.once("message", () => {
      received = true;
    });
    await sleep(50);
    t.false(received);
    worker.send(JSON.stringify({ action: "ready", queue: "jobs" }));
    const msg2 = await new Promise((resolve) =>
      worker.once("message", (data) => resolve(JSON.parse(data))),
    );
    t.deepEqual(msg2.task.payload, { x: 2 });
    worker.send(JSON.stringify({ action: "ack", taskId: msg2.task.id }));
    prod.close();
    worker.close();
  });

  test.serial("routes published messages to subscribers", async (t) => {
    const sub = await connect();
    const pub = await connect();
    sub.send(JSON.stringify({ action: "subscribe", topic: "greet" }));
    await sleep(50);
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

  test.serial(
    "publishing clients do not receive their own events",
    async (t) => {
      const other = await connect();
      const publisher = await connect();
      const topic = "echo";
      other.send(JSON.stringify({ action: "subscribe", topic }));
      publisher.send(JSON.stringify({ action: "subscribe", topic }));
      await sleep(50);

      const otherReceived = new Promise((resolve) => {
        other.on("message", (data) => resolve(JSON.parse(data)));
      });

      let ownReceived = false;
      const ownListener = () => {
        ownReceived = true;
      };
      publisher.on("message", ownListener);

      publisher.send(
        JSON.stringify({
          action: "publish",
          message: { type: topic, payload: { msg: "hi" } },
        }),
      );

      const message = await otherReceived;
      t.is(message.event.payload.msg, "hi");
      await sleep(100);
      publisher.off("message", ownListener);
      t.false(ownReceived);

      other.close();
      publisher.close();
    },
  );

  test.serial("unsubscribe stops delivery", async (t) => {
    const sub = await connect();
    const pub = await connect();
    sub.send(JSON.stringify({ action: "subscribe", topic: "ping" }));
    await sleep(50);
    sub.send(JSON.stringify({ action: "unsubscribe", topic: "ping" }));
    await sleep(50);
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
    await sleep(100);
    t.false(received);
    sub.close();
    pub.close();
  });

  test.serial("forwards correlation and replyTo", async (t) => {
    const sub = await connect();
    const pub = await connect();
    sub.send(JSON.stringify({ action: "subscribe", topic: "ask" }));
    await sleep(50);
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
}
