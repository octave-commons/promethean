import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

const subscriptions = new Map(); // topic -> Set of ws
const clients = new Map(); // ws -> { id, topics:Set }

function normalize(message) {
  const event = {
    type: message.type,
    source: message.source,
    payload: message.payload,
    timestamp: message.timestamp || new Date().toISOString(),
  };
  if (message.correlationId) event.correlationId = message.correlationId;
  if (message.replyTo) event.replyTo = message.replyTo;
  return event;
}

function route(event, sender) {
  const subs = subscriptions.get(event.type);
  if (!subs) return;
  for (const ws of subs) {
    if (ws.readyState === ws.OPEN) {
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
  wss.on("connection", (ws) => {
    const id = randomUUID();
    const data = { id, topics: new Set() };
    clients.set(ws, data);
    console.log(`client connected ${id}`);

    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        ws.send(JSON.stringify({ error: "invalid json" }));
        return;
      }
      const { action } = msg;
      if (action === "subscribe") {
        const topic = msg.topic;
        if (typeof topic !== "string") return;
        data.topics.add(topic);
        if (!subscriptions.has(topic)) subscriptions.set(topic, new Set());
        subscriptions.get(topic).add(ws);
        console.log(`client ${id} subscribed ${topic}`);
      } else if (action === "unsubscribe") {
        const topic = msg.topic;
        if (typeof topic !== "string") return;
        data.topics.delete(topic);
        const set = subscriptions.get(topic);
        if (set) {
          set.delete(ws);
          if (set.size === 0) subscriptions.delete(topic);
        }
        console.log(`client ${id} unsubscribed ${topic}`);
      } else if (action === "publish") {
        const event = normalize(msg.message || {});
        if (!event.type) return;
        event.source = event.source || id;
        route(event, ws);
        console.log(`client ${id} published ${event.type}`);
      } else {
        ws.send(JSON.stringify({ error: "unknown action" }));
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
    });
  });

  await new Promise((resolve) => wss.on("listening", resolve));
  console.log(`broker listening on ${wss.address().port}`);
  return wss;
}

export async function stop(server) {
  for (const ws of server.clients) {
    try {
      ws.terminate();
    } catch {}
  }
  await new Promise((resolve) => server.close(resolve));
}

if (process.env.NODE_ENV !== "test") {
  start().catch((err) => {
    console.error("failed to start broker", err);
    process.exit(1);
  });
}
