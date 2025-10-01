import WebSocket, { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { queueManager } from "@promethean/legacy/queueManager.js";

const rateLimitEnv = Number(process.env.BROKER_RATE_LIMIT_MS);
if (rateLimitEnv > 0) {
  queueManager.setRateLimit(rateLimitEnv);
}

const subscriptions = new Map(); // topic -> Set<WebSocket>
const clients = new Map(); // WebSocket -> { id, topics:Set<string> }
const actions = new EventEmitter();

actions.on("subscribe", ({ ws, data, msg, id }) => {
  const topic = msg.topic;
  if (typeof topic !== "string") return;
  data.topics.add(topic);
  if (!subscriptions.has(topic)) subscriptions.set(topic, new Set());
  subscriptions.get(topic).add(ws);
  console.log(`client ${id} subscribed ${topic}`);
});

actions.on("unsubscribe", ({ ws, data, msg, id }) => {
  const topic = msg.topic;
  if (typeof topic !== "string") return;
  data.topics.delete(topic);
  const set = subscriptions.get(topic);
  if (set) {
    set.delete(ws);
    if (set.size === 0) subscriptions.delete(topic);
  }
  console.log(`client ${id} unsubscribed ${topic}`);
});

actions.on("publish", ({ ws, msg, id }) => {
  const event = normalize(msg.message || {});
  if (!event.type) return;
  event.source = event.source || id;
  route(event, ws);
  console.log(`client ${id} published ${event.type}`);
});

actions.on("enqueue", async ({ msg, id }) => {
  const { queue, task } = msg;
  if (typeof queue !== "string") return;
  await queueManager.enqueue(queue, task);
  console.log(`client ${id} enqueued task on ${queue}`);
});

actions.on("ready", async ({ ws, msg, id }) => {
  const { queue } = msg;
  if (typeof queue !== "string") return;
  await queueManager.ready(ws, id, queue);
  console.log(`client ${id} ready on ${queue}`);
});

actions.on("ack", async ({ msg, id }) => {
  const { taskId } = msg;
  await queueManager.acknowledge(id, taskId);
});

actions.on("heartbeat", async ({ id }) => {
  await queueManager.heartbeat(id);
});

function normalize(message) {
  const event = {
    type: message?.type,
    source: message?.source,
    payload: message?.payload,
    timestamp: message?.timestamp || new Date().toISOString(),
  };
  if (message?.correlationId) event.correlationId = message.correlationId;
  if (message?.replyTo) event.replyTo = message.replyTo;
  return event;
}

function route(event, sender) {
  const subs = subscriptions.get(event.type);
  if (!subs) return;
  for (const ws of subs) {
    if (ws === sender) continue;
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ event }));
      } catch (err) {
        console.warn("failed to send", err);
      }
    }
  }
}

export async function start(port = process.env.PORT || 7000) {
  subscriptions.clear();
  clients.clear();

  const wss = new WebSocketServer({ port });

  // Always attach error handlers to avoid process crashes
  wss.on("error", (err) => {
    console.error("wss error:", err);
  });

  wss.on("connection", (ws) => {
    const id = randomUUID();
    const data = { id, topics: new Set() };
    clients.set(ws, data);
    console.log(`client connected ${id}`);

    ws.on("error", (err) => {
      console.error(`ws error (${id}):`, err);
    });

    ws.on("message", async (raw) => {
      // Normalize raw Buffer/String
      const text = typeof raw === "string" ? raw : raw.toString("utf8");
      let msg;
      try {
        msg = JSON.parse(text);
      } catch {
        ws.send(JSON.stringify({ error: "invalid json" }));
        return;
      }

      const { action } = msg || {};
      try {
        const ctx = { ws, id, data, msg };
        if (actions.listenerCount(action)) {
          actions.emit(action, ctx);
        } else {
          ws.send(JSON.stringify({ error: "unknown action" }));
        }
      } catch (err) {
        console.error("handler error:", err);
        ws.send(JSON.stringify({ error: "handler error" }));
      }
    });

    ws.on("close", () => {
      console.log(`client disconnected ${id}`);
      for (const topic of data.topics) {
        const set = subscriptions.get(topic);
        if (set) {
          set.delete(ws);
          if (set.size === 0) subscriptions.delete(topic);
        }
      }
      clients.delete(ws);
      try {
        queueManager.unregisterWorker(id);
      } catch (e) {
        console.error("unregisterWorker error:", e);
      }
    });
  });

  await new Promise((resolve, reject) => {
    wss.once("listening", resolve);
    wss.once("error", reject); // startup errors only
  });

  return wss;
}

export async function stop(server) {
  if (!server) return;
  console.log("I'm stoppin");
  for (const ws of server.clients) {
    try {
      ws.terminate();
    } catch {}
  }
  await new Promise((resolve) => server.close(resolve));
}

// Make sure this file runs as ESM (package.json: { "type": "module" } or .mjs)
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      console.log("starting…");
      const wss = await start();
      console.log("listening");
      // Catch process-level crashes too
      process.on("uncaughtException", (e) => {
        console.error("uncaughtException:", e);
      });
      process.on("unhandledRejection", (r) => {
        console.error("unhandledRejection:", r);
      });
      process.on("SIGINT", () => stop(wss).then(() => process.exit(0)));
      process.on("SIGTERM", () => stop(wss).then(() => process.exit(0)));
    } catch (err) {
      console.error("failed to start broker", err);
      process.exit(1);
    }
  })();
}
