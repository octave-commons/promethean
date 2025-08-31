---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Debugging WebSocket Restarts"
conversation_id: 68976b10-96a4-8331-8f63-ab079c8206f2
create_time: 08/09/2025 at 10:36 AM
update_time: 08/09/2025 at 11:05 AM
---

# Title: Debugging WebSocket Restarts

Created: 08/09/2025 at 10:36 AM
Last Updated: 08/09/2025 at 11:05 AM
Chat URL: https://chat.openai.com/c/68976b10-96a4-8331-8f63-ab079c8206f2


>[!nexus_user] **User** - 08/09/2025 at 10:36 AM
> Something is wrong with this. But I'm not seeeing any errors. It just seems to restart over and over.
> import { WebSocketServer } from "ws";
> import { randomUUID } from "crypto";
> import { queueManager } from "../../../shared/js/queueManager.js";
> 
> const subscriptions = new Map(); // topic -> Set of ws
> const clients = new Map(); // ws -> { id, topics:Set }
> 
> function normalize(message) {
>  const event = {
>  type: message.type,
>  source: message.source,
>  payload: message.payload,
>  timestamp: message.timestamp || new Date().toISOString(),
>  };
>  if (message.correlationId) event.correlationId = message.correlationId;
>  if (message.replyTo) event.replyTo = message.replyTo;
>  return event;
> }
> 
> function route(event, sender) {
>  const subs = subscriptions.get(event.type);
>  if (!subs) return;
>  for (const ws of subs) {
>  if (ws.readyState === ws.OPEN) {
>  try {
>  ws.send(JSON.stringify({ event }));
>  } catch (err) {
>  console.warn("failed to send", err);
>  }
>  }
>  }
> }
> 
> export async function start(port = process.env.PORT || 7000) {
>  subscriptions.clear();
>  clients.clear();
>  const wss = new WebSocketServer({ port });
>  wss.on("connection", (ws) => {
>  const id = randomUUID();
>  const data = { id, topics: new Set() };
>  clients.set(ws, data);
>  console.log(`client connected ${id}`);
> 
>  ws.on("message", async (raw) => {
>  let msg;
>  try {
>  msg = JSON.parse(raw);
>  } catch {
>  ws.send(JSON.stringify({ error: "invalid json" }));
>  return;
>  }
>  const { action } = msg;
>  if (action === "subscribe") {
>  const topic = msg.topic;
>  if (typeof topic !== "string") return;
>  data.topics.add(topic);
>  if (!subscriptions.has(topic)) subscriptions.set(topic, new Set());
>  subscriptions.get(topic).add(ws);
>  console.log(`client ${id} subscribed ${topic}`);
>  } else if (action === "unsubscribe") {
>  const topic = msg.topic;
>  if (typeof topic !== "string") return;
>  data.topics.delete(topic);
>  const set = subscriptions.get(topic);
>  if (set) {
>  set.delete(ws);
>  if (set.size === 0) subscriptions.delete(topic);
>  }
>  console.log(`client ${id} unsubscribed ${topic}`);
>  } else if (action === "publish") {
>  const event = normalize(msg.message || {});
>  if (!event.type) return;
>  event.source = event.source || id;
>  route(event, ws);
>  console.log(`client ${id} published ${event.type}`);
>  } else if (action === "enqueue") {
>  const { queue, task } = msg;
>  if (typeof queue !== "string") return;
>  queueManager.enqueue(queue, task);
>  console.log(`client ${id} enqueued task on ${queue}`);
>  } else if (action === "ready") {
>  const { queue } = msg;
>  if (typeof queue !== "string") return;
>  queueManager.ready(ws, id, queue);
>  console.log(`client ${id} ready on ${queue}`);
>  } else if (action === "ack") {
>  const { taskId } = msg;
>  queueManager.acknowledge(id, taskId);
>  } else if (action === "heartbeat") {
>  queueManager.heartbeat(id);
>  } else {
>  ws.send(JSON.stringify({ error: "unknown action" }));
>  }
>  });
> 
>  ws.on("close", () => {
>  console.log(`client disconnected ${id}`);
>  for (const topic of data.topics) {
>  const set = subscriptions.get(topic);
>  if (set) {
>  set.delete(ws);
>  if (set.size === 0) subscriptions.delete(topic);
>  }
>  }
>  clients.delete(ws);
>  queueManager.unregisterWorker(id);
>  });
>  });
> 
>  await new Promise((resolve, reject) => wss
>  .once("listening", resolve)
>  .once("error", reject));
>  return wss;
> }
> 
> export async function stop(server) {
>  for (const ws of server.clients) {
>  try {
>  ws.terminate();
>  } catch { }
>  }
>  await new Promise((resolve) => server.close(resolve));
> }
> 
> if (process.env.NODE_ENV !== "test") {
>  console.log("starting?")
>  const wss = await start().catch((err) => {
>  console.error("failed to start broker", err);
>  process.exit(1);
>  });
> }
<!-- UID: ac1c57ad-ab90-49b3-a7a9-10f55f825813 -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:36 AM
> Gut check on a few things that can cause “mysterious PM2 restarts” here:
> 
> 1) You’re comparing to the wrong OPEN constant 
> Inside `route()` you do `if (ws.readyState === ws.OPEN)`. On a connection instance, `ws.OPEN` is **undefined**, so this is always false and you never send. Use `WebSocket.OPEN` from the library, not the instance.
> 
> 2) Unhandled `"error"` events can crash the process 
> `ws` and `wss` emit `"error"`; if you don’t attach listeners, Node will throw and your process will bounce without a clear message.
> 
> 3) `JSON.parse(raw)` on Buffers 
> `ws` hands you a `Buffer` by default. Parsing without `toString()` will throw (you’re catching it, which is good), but better to normalize it.
> 
> 4) Top-level `await` + PM2/Node mode 
> Your file must truly run as ESM. If PM2 is launching it as CJS you’ll get a syntax error (“await is only valid…”) and an instant restart. Make sure either `"type":"module"` in `package.json` or use `.mjs`.
> 
> 5) Anything thrown inside your message branches (e.g., `queueManager.*`) will kill the process unless you catch it.
> 
> Here’s a hardened version you can drop in:
> 
> ```js
> import WebSocket, { WebSocketServer } from "ws";
> import { randomUUID } from "crypto";
> import { queueManager } from "../../../shared/js/queueManager.js";
> 
> const subscriptions = new Map(); // topic -> Set<WebSocket>
> const clients = new Map(); // WebSocket -> { id, topics:Set<string> }
> 
> function normalize(message) {
>  const event = {
>  type: message?.type,
>  source: message?.source,
>  payload: message?.payload,
>  timestamp: message?.timestamp || new Date().toISOString(),
>  };
>  if (message?.correlationId) event.correlationId = message.correlationId;
>  if (message?.replyTo) event.replyTo = message.replyTo;
>  return event;
> }
> 
> function route(event, sender) {
>  const subs = subscriptions.get(event.type);
>  if (!subs) return;
>  for (const ws of subs) {
>  if (ws.readyState === WebSocket.OPEN) {
>  try {
>  ws.send(JSON.stringify({ event }));
>  } catch (err) {
>  console.warn("failed to send", err);
>  }
>  }
>  }
> }
> 
> export async function start(port = process.env.PORT || 7000) {
>  subscriptions.clear();
>  clients.clear();
> 
>  const wss = new WebSocketServer({ port });
> 
>  // Always attach error handlers to avoid process crashes
>  wss.on("error", (err) => {
>  console.error("wss error:", err);
>  });
> 
>  wss.on("connection", (ws) => {
>  const id = randomUUID();
>  const data = { id, topics: new Set() };
>  clients.set(ws, data);
>  console.log(`client connected ${id}`);
> 
>  ws.on("error", (err) => {
>  console.error(`ws error (${id}):`, err);
>  });
> 
>  ws.on("message", async (raw) => {
>  // Normalize raw Buffer/String
>  const text = typeof raw === "string" ? raw : raw.toString("utf8");
>  let msg;
>  try {
>  msg = JSON.parse(text);
>  } catch {
>  ws.send(JSON.stringify({ error: "invalid json" }));
>  return;
>  }
> 
>  const { action } = msg || {};
>  try {
>  if (action === "subscribe") {
>  const topic = msg.topic;
>  if (typeof topic !== "string") return;
>  data.topics.add(topic);
>  if (!subscriptions.has(topic)) subscriptions.set(topic, new Set());
>  subscriptions.get(topic).add(ws);
>  console.log(`client ${id} subscribed ${topic}`);
> 
>  } else if (action === "unsubscribe") {
>  const topic = msg.topic;
>  if (typeof topic !== "string") return;
>  data.topics.delete(topic);
>  const set = subscriptions.get(topic);
>  if (set) {
>  set.delete(ws);
>  if (set.size === 0) subscriptions.delete(topic);
>  }
>  console.log(`client ${id} unsubscribed ${topic}`);
> 
>  } else if (action === "publish") {
>  const event = normalize(msg.message || {});
>  if (!event.type) return;
>  event.source = event.source || id;
>  route(event, ws);
>  console.log(`client ${id} published ${event.type}`);
> 
>  } else if (action === "enqueue") {
>  const { queue, task } = msg;
>  if (typeof queue !== "string") return;
>  await queueManager.enqueue(queue, task);
>  console.log(`client ${id} enqueued task on ${queue}`);
> 
>  } else if (action === "ready") {
>  const { queue } = msg;
>  if (typeof queue !== "string") return;
>  await queueManager.ready(ws, id, queue);
>  console.log(`client ${id} ready on ${queue}`);
> 
>  } else if (action === "ack") {
>  const { taskId } = msg;
>  await queueManager.acknowledge(id, taskId);
> 
>  } else if (action === "heartbeat") {
>  await queueManager.heartbeat(id);
> 
>  } else {
>  ws.send(JSON.stringify({ error: "unknown action" }));
>  }
>  } catch (err) {
>  console.error("handler error:", err);
>  ws.send(JSON.stringify({ error: "handler error" }));
>  }
>  });
> 
>  ws.on("close", () => {
>  console.log(`client disconnected ${id}`);
>  for (const topic of data.topics) {
>  const set = subscriptions.get(topic);
>  if (set) {
>  set.delete(ws);
>  if (set.size === 0) subscriptions.delete(topic);
>  }
>  }
>  clients.delete(ws);
>  try {
>  queueManager.unregisterWorker(id);
>  } catch (e) {
>  console.error("unregisterWorker error:", e);
>  }
>  });
>  });
> 
>  await new Promise((resolve, reject) => {
>  wss.once("listening", resolve);
>  wss.once("error", reject); // startup errors only
>  });
> 
>  return wss;
> }
> 
> export async function stop(server) {
>  if (!server) return;
>  for (const ws of server.clients) {
>  try { ws.terminate(); } catch {}
>  }
>  await new Promise((resolve) => server.close(resolve));
> }
> 
> // Make sure this file runs as ESM (package.json: { "type": "module" } or .mjs)
> if (process.env.NODE_ENV !== "test") {
>  (async () => {
>  try {
>  console.log("starting…");
>  const wss = await start();
>  // Catch process-level crashes too
>  process.on("uncaughtException", (e) => {
>  console.error("uncaughtException:", e);
>  });
>  process.on("unhandledRejection", (r) => {
>  console.error("unhandledRejection:", r);
>  });
>  process.on("SIGINT", () => stop(wss).then(() => process.exit(0)));
>  process.on("SIGTERM", () => stop(wss).then(() => process.exit(0)));
>  } catch (err) {
>  console.error("failed to start broker", err);
>  process.exit(1);
>  }
>  })();
> }
> ```
> 
> Quick checklist to stop the restart loop:
> 
> - Verify ESM is **actually** enabled (`node -v` and `cat package.json` for `"type": "module"`). 
> - Fix `ws.OPEN` → `WebSocket.OPEN`. 
> - Add `wss.on("error")` and `ws.on("error")`. 
> - Parse messages with `raw.toString("utf8")`. 
> - Wrap `queueManager` calls in try/catch. 
> - If using PM2 with `watch`, make sure you’re not watching a directory your app writes to (that’ll trigger endless restarts).
> 
> If it still flaps after this, paste the first 50 lines of `pm2 logs <app>` and the `pm2 describe <app>`—we’ll zero in fast.
<!-- UID: 413791c4-9281-4d11-a2b1-7ed35a8ef761 -->

---




>[!nexus_user] **User** - 08/09/2025 at 10:40 AM
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | client connected 8a62d400-55d5-4bfe-a1ec-cc1e5c6d4d5a
> 68|broker | client 8a62d400-55d5-4bfe-a1ec-cc1e5c6d4d5a published heartbeat
> 68|broker | client connected 8a4a9e5a-9f07-4882-93ca-89180eca8a78
> 68|broker | client 8a4a9e5a-9f07-4882-93ca-89180eca8a78 ready on vision-capture
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | client connected 5bf3965d-31e5-4f3b-bdbb-7a1080738f9b
> 68|broker | starting…
> 68|broker | client connected 2e34399d-a3a9-435f-adfa-92e87e657d7d
> 68|broker | client 2e34399d-a3a9-435f-adfa-92e87e657d7d published heartbeat
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | client connected b29e8fbc-f234-4e29-a078-ecbc93a1eb72
> 68|broker | client b29e8fbc-f234-4e29-a078-ecbc93a1eb72 ready on vision-capture
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | client connected 6c73e59f-b620-4d33-ab58-e01e2a13f04b
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | client connected a417e5e9-56a6-4a83-bbe7-b626fc64ea4b
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | client connected 55155f77-d639-4d76-9aac-d77ac0aaa020
> 68|broker | client 55155f77-d639-4d76-9aac-d77ac0aaa020 published heartbeat
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
> 68|broker | starting…
<!-- UID: c9036bab-8c8a-4c66-93a3-94c5935e0fdb -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:40 AM
> This looks exactly like your broker is being **killed from the outside** (then PM2 respawns it), not crashing.
> 
> Why I think that:
> - You see tons of `starting…` with **no error** in between. If Node crashed, you’d usually get a stack or at least our `uncaughtException/unhandledRejection` logs.
> - Clients keep reconnecting (`client connected …`), which is classic when the server process gets SIGKILL/SIGTERM and PM2 restarts it.
> - In your stack you’ve got a heartbeat service that **kills processes that don’t ping it**. The broker itself isn’t sending heartbeats, so it’s a prime suspect.
> 
> Also: those `published heartbeat` lines are **WebSocket events from other services**, not the HTTP heartbeat your killer watches. So the killer still thinks the broker is dead.
> 
> ### Fast confirm (no code changes)
> 1) Stop PM2 watch temporarily and run the broker by hand:
> ```bash
> pm2 stop broker
> node path/to/broker.js
> ```
> If it stays up → PM2/watch/heartbeat killer was doing it.
> 
> 2) Check if your killer is reaping it:
> - Look at the killer logs around the same timestamps.
> - If it uses SIGKILL, you won’t see any Node-side logs (can’t catch SIGKILL).
> 
> ### Fix: make the broker send heartbeats
> Wire in your `HeartbeatClient` and give it a stable name:
> 
> ```js
> // near top
> import { HeartbeatClient } from "../path/to/HeartbeatClient.js"; // adjust path
> 
> // after start() resolves inside the IIFE
> const hb = new HeartbeatClient({
>  name: "broker", // don't rely on process.env.name
>  interval: 3000,
>  // url: `http://127.0.0.1:${process.env.PROXY_PORT || 8080}/heartbeat/heartbeat`, // if needed
> });
> hb.start?.(); // or setInterval(() => hb.sendOnce().catch(()=>{}), 3000);
> ```
> 
> And (optionally) advertise the PID:
> ```js
> process.title = "broker";
> ```
> 
> If you want the heartbeat killer to ignore the broker, add a whitelist there; but better to have the broker report liveness like everything else.
> 
> ### Add tiny signal instrumentation (helps prove it’s external)
> Drop this once at boot:
> ```js
> for (const sig of ["SIGINT","SIGTERM","SIGHUP","SIGUSR1","SIGUSR2"]) {
>  process.on(sig, () => console.log("got", sig));
> }
> process.on("beforeExit", (c) => console.log("beforeExit", c));
> process.on("exit", (c) => console.log("exit", c));
> setInterval(() => {}, 1 << 30); // keep event loop non-empty for 'beforeExit'
> ```
> If you still see restarts with **no** `got SIG*` and no `exit/beforeExit`, it was almost certainly **SIGKILL** (killer or OOM).
> 
> ### PM2 gotchas to rule out
> - If `watch` is on, make sure you’re **not watching** dirs that change frequently (logs, temp, db). Otherwise PM2 will keep restarting.
> - Set `min_uptime` and `max_restarts` sensibly so you can see when it’s flapping.
> 
> If you wire in the HeartbeatClient and it keeps flapping, paste:
> - `pm2 describe broker`
> - the killer’s recent logs around a restart window 
> and we’ll pin it down.
<!-- UID: 50b0a8df-12f7-48af-af77-1e750fdad28d -->

---




>[!nexus_user] **User** - 08/09/2025 at 10:44 AM
> I don't have mongodb running and the heartbeat never starts...
<!-- UID: 71b159fb-a4a0-4f04-9874-af464d207bc7 -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:44 AM
> Gotcha — if MongoDB isn’t up and your heartbeat service isn’t even running, the **next most likely culprit is `queueManager` blowing up** on any of these actions:
> 
> - `ready` → `queueManager.ready(ws, id, queue)`
> - `enqueue` → `queueManager.enqueue(queue, task)`
> - `ack` → `queueManager.acknowledge(id, taskId)`
> - `heartbeat` → `queueManager.heartbeat(id)`
> 
> If those methods try to touch Mongo (connections, queries, etc.) while Mongo is down, they’ll throw/reject. In your current code those calls aren’t wrapped, so the process exits → PM2 restarts → you see endless `starting…`.
> 
> Here’s the quickest hardening pass—**wrap all queue calls** and make them no-ops (or error replies) when the backend isn’t available. Also fix the `WebSocket.OPEN` constant if you haven’t already.
> 
> ```js
> import WebSocket, { WebSocketServer } from "ws";
> import { randomUUID } from "crypto";
> import { queueManager } from "../../../shared/js/queueManager.js";
> 
> function safe(fn, label) {
>  return async (...args) => {
>  try {
>  return await fn(...args);
>  } catch (err) {
>  console.error(`[queue:${label}]`, err?.code || err?.name || "Error", err?.message || err);
>  // Don’t crash the broker just because queues are down.
>  return null;
>  }
>  };
> }
> 
> const qm = {
>  enqueue: safe(queueManager.enqueue?.bind(queueManager) ?? (()=>{}), "enqueue"),
>  ready: safe(queueManager.ready?.bind(queueManager) ?? (()=>{}), "ready"),
>  acknowledge: safe(queueManager.acknowledge?.bind(queueManager) ?? (()=>{}), "acknowledge"),
>  heartbeat: safe(queueManager.heartbeat?.bind(queueManager) ?? (()=>{}), "heartbeat"),
>  unregisterWorker: (...args) => {
>  try { queueManager.unregisterWorker?.(...args); } catch (e) {
>  console.error("[queue:unregisterWorker]", e?.message || e);
>  }
>  }
> };
> 
> const subscriptions = new Map(); // topic -> Set<WebSocket>
> const clients = new Map(); // WebSocket -> { id, topics:Set<string> }
> 
> function normalize(message) {
>  const event = {
>  type: message?.type,
>  source: message?.source,
>  payload: message?.payload,
>  timestamp: message?.timestamp || new Date().toISOString(),
>  };
>  if (message?.correlationId) event.correlationId = message.correlationId;
>  if (message?.replyTo) event.replyTo = message.replyTo;
>  return event;
> }
> 
> function route(event) {
>  const subs = subscriptions.get(event.type);
>  if (!subs) return;
>  for (const ws of subs) {
>  if (ws.readyState === WebSocket.OPEN) {
>  try { ws.send(JSON.stringify({ event })); }
>  catch (err) { console.warn("failed to send", err); }
>  }
>  }
> }
> 
> export async function start(port = process.env.PORT || 7000) {
>  subscriptions.clear();
>  clients.clear();
> 
>  const wss = new WebSocketServer({ port });
>  wss.on("error", (err) => console.error("wss error:", err));
> 
>  wss.on("connection", (ws) => {
>  const id = randomUUID();
>  const data = { id, topics: new Set() };
>  clients.set(ws, data);
>  console.log(`client connected ${id}`);
> 
>  ws.on("error", (err) => console.error(`ws error (${id}):`, err));
> 
>  ws.on("message", async (raw) => {
>  const text = typeof raw === "string" ? raw : raw.toString("utf8");
>  let msg;
>  try { msg = JSON.parse(text); }
>  catch { ws.send(JSON.stringify({ error: "invalid json" })); return; }
> 
>  const { action } = msg || {};
>  if (action === "subscribe") {
>  const topic = msg.topic;
>  if (typeof topic !== "string") return;
>  data.topics.add(topic);
>  if (!subscriptions.has(topic)) subscriptions.set(topic, new Set());
>  subscriptions.get(topic).add(ws);
>  console.log(`client ${id} subscribed ${topic}`);
> 
>  } else if (action === "unsubscribe") {
>  const topic = msg.topic;
>  if (typeof topic !== "string") return;
>  data.topics.delete(topic);
>  const set = subscriptions.get(topic);
>  if (set) {
>  set.delete(ws);
>  if (set.size === 0) subscriptions.delete(topic);
>  }
>  console.log(`client ${id} unsubscribed ${topic}`);
> 
>  } else if (action === "publish") {
>  const event = normalize(msg.message || {});
>  if (!event.type) return;
>  event.source = event.source || id;
>  route(event);
>  console.log(`client ${id} published ${event.type}`);
> 
>  } else if (action === "enqueue") {
>  const { queue, task } = msg;
>  if (typeof queue !== "string") return;
>  await qm.enqueue(queue, task);
>  console.log(`client ${id} enqueued task on ${queue}`);
> 
>  } else if (action === "ready") {
>  const { queue } = msg;
>  if (typeof queue !== "string") return;
>  await qm.ready(ws, id, queue);
>  console.log(`client ${id} ready on ${queue}`);
> 
>  } else if (action === "ack") {
>  const { taskId } = msg;
>  await qm.acknowledge(id, taskId);
> 
>  } else if (action === "heartbeat") {
>  await qm.heartbeat(id);
> 
>  } else {
>  ws.send(JSON.stringify({ error: "unknown action" }));
>  }
>  });
> 
>  ws.on("close", () => {
>  console.log(`client disconnected ${id}`);
>  for (const topic of data.topics) {
>  const set = subscriptions.get(topic);
>  if (set) {
>  set.delete(ws);
>  if (set.size === 0) subscriptions.delete(topic);
>  }
>  }
>  clients.delete(ws);
>  qm.unregisterWorker(id);
>  });
>  });
> 
>  await new Promise((resolve, reject) => {
>  wss.once("listening", resolve);
>  wss.once("error", reject);
>  });
> 
>  return wss;
> }
> 
> export async function stop(server) {
>  if (!server) return;
>  for (const ws of server.clients) { try { ws.terminate(); } catch {} }
>  await new Promise((resolve) => server.close(resolve));
> }
> 
> if (process.env.NODE_ENV !== "test") {
>  (async () => {
>  try {
>  console.log("starting…");
>  const wss = await start();
>  process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
>  process.on("unhandledRejection", (r) => console.error("unhandledRejection:", r));
>  process.on("SIGINT", () => stop(wss).then(() => process.exit(0)));
>  process.on("SIGTERM", () => stop(wss).then(() => process.exit(0)));
>  } catch (err) {
>  console.error("failed to start broker", err);
>  process.exit(1);
>  }
>  })();
> }
> ```
> 
> ### Quick proofs / sanity checks
> 
> - **Run without PM2** to prove it’s not a PM2/watch issue:
>  ```bash
>  pm2 stop broker
>  node path/to/broker.js
>  ```
>  Then send a `ready` or `heartbeat` action while Mongo is down. Before the change it should crash; after, it should **log the error and keep running**.
> 
> - **See the actual queue errors**: with the wrappers above, you’ll get `[queue:ready] ECONNREFUSED 127.0.0.1:27017` or similar in your logs instead of silent restarts.
> 
> - **Optional**: if you want queues to be disabled cleanly when DB is down, add a tiny guard in your queueManager (if you control it), e.g. `queueManager.connected === true`, and early-return in the wrapper when false.
> 
> Also double-check:
> - You’re using `WebSocket.OPEN` (not `ws.OPEN`) in your `route`.
> - PM2 `watch` isn’t pointed at directories that your app (or other services) writes to; otherwise unrelated file changes will trigger restarts.
> 
> Try this patch and hit it again with your vision-capture client + heartbeats while Mongo is off. If it still flaps, paste the first 30 lines after an `action` that uses the queue so we can see the exact error now that it’s surfaced.
<!-- UID: 5df85f4f-0af6-4f06-b854-cbedd574d176 -->

---




>[!nexus_user] **User** - 08/09/2025 at 10:54 AM
> A bunch of my processes are doing this...
<!-- UID: 66b308d4-499f-4d87-84d6-347b8ca07a7d -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:54 AM
> Yep—sounds systemic, not just the broker. Let’s triage fast and pin the *one* thing that’s bouncing everything.
> 
> ### 0) Quick litmus test: is PM2/watch the culprit?
> ```bash
> # Start a do-nothing sentinel under PM2
> pm2 start "node -e 'setInterval(()=>{},1e9)'" --name sentinel --watch
> pm2 logs sentinel
> ```
> - If **sentinel restarts** → PM2 `watch` or external killer (OOM) is doing it.
> - If **sentinel stays up** → it’s your app code/deps (Mongo/queueManager/ESM) doing it.
> 
> ### 1) Kill noisy restarts immediately (so you can see logs)
> ```bash
> pm2 stop all
> pm2 unwatch all # turn off auto-restarts on file changes
> pm2 start <one-service> # bring up ONE service by hand
> pm2 logs <one-service>
> ```
> Also check if you set memory caps:
> ```bash
> pm2 describe <one-service> | grep -i memory -n
> # If "max memory restart" is set low, PM2 will recycle constantly.
> ```
> 
> ### 2) External killers: rule them in/out quickly
> - **OOM killer**:
>  ```bash
>  journalctl -k --since "15 min ago" | egrep -i "oom|killed process" -n
>  ```
>  If you see OOM kills, that’s your flapping source.
> - **Watch restarts**: if you had `watch: [__dirname]` and your services write files under that tree (logs/tmp/db), PM2 will restart on every write. Make sure your ecosystem has:
>  ```js
>  watch: false, // or
>  watch: [__dirname],
>  ignore_watch: ["logs", "tmp", "node_modules", ".git", "db", "data"],
>  ```
> 
> ### 3) App-level issues that ripple across processes
> - **ESM vs CJS**: any file using top-level `await` *must* be ESM. Ensure `"type":"module"` at the repo root (or use `.mjs`). A CJS/ESM mismatch gives instant restarts with little logging.
> - **Mongo down**: a bunch of your services call `queueManager.*`. If Mongo isn’t up and those calls aren’t `try/catch`ed, they’ll throw → PM2 restart. Wrap them (like I showed) or temporarily stub `queueManager` when DB is down.
> - **Unhandled errors**: add this once to every service entrypoint **before** doing real work:
>  ```js
>  process.on("uncaughtException", e => console.error("uncaughtException:", e));
>  process.on("unhandledRejection", r => console.error("unhandledRejection:", r));
>  ["SIGINT","SIGTERM","SIGHUP","SIGUSR1","SIGUSR2"].forEach(s =>
>  process.on(s, () => console.log("got", s)));
>  ```
>  If restarts continue with **no** signal logs, that strongly suggests SIGKILL (OOM or an external killer).
> 
> ### 4) PM2 config hardening (so restarts are meaningful)
> In your `ecosystem.config.js` for *every* app:
> ```js
> module.exports = {
>  apps: [{
>  name: "broker",
>  script: "./broker.js",
>  watch: false, // turn off unless you're actively dev-ing
>  min_uptime: "10s", // consider "up" only after 10s
>  max_restarts: 10, // avoid infinite flapping
>  kill_timeout: 5000, // allow graceful shutdowns
>  // optional, if you want controlled boot:
>  // wait_ready: true, // PM2 waits for process.send('ready')
>  // listen_timeout: 8000,
>  env: { NODE_ENV: "production" },
>  }]
> }
> ```
> And if you use `wait_ready`, send it after your server listens:
> ```js
> wss.once("listening", () => {
>  console.log("broker listening");
>  if (process.send) process.send("ready");
> });
> ```
> 
> ### 5) Minimal reproduce to isolate external vs internal
> Run a suspect service **outside PM2**:
> ```bash
> pm2 stop <that-service>
> node --trace-uncaught --trace-warnings path/to/service.js
> ```
> If it **stays up** here but **flaps under PM2**, it’s PM2/watch/memory caps. 
> If it **dies here too**, the error will print—fix that (queueManager/Mongo/ESM).
> 
> ---
> 
> If you want, paste these three things and I’ll point to the exact cause:
> - `pm2 describe broker` (or any flapping service)
> - First 100 lines of `pm2 logs <service>` right after a restart
> - The relevant `apps` block from your `ecosystem.config.js`
> 
> My bet, given your stack: **watch + services writing into watched dirs** *and* **queueManager throwing when Mongo is down**. Flip `watch:false`, wrap `queueManager` calls, and most of the storm should calm.
<!-- UID: 81eec6c7-e20b-489f-a983-d10d95f515b0 -->

---




>[!nexus_user] **User** - 08/09/2025 at 10:56 AM
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
> PM2 | AXM MONITOR Unknown id 17
<!-- UID: 25746113-9af8-427b-bfd2-536aa1cfc380 -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:56 AM
> That line is PM2 itself yelling—**not your app**. 
> `AXM MONITOR Unknown id 17` = the PM2 daemon’s monitoring bus (AXM) is getting probe/metric messages for a process id it no longer recognizes (usually after rapid restarts or a daemon/app version mismatch). It’s noisy, not the root cause—but it *does* mean the PM2 daemon state is out of sync.
> 
> ### Fix the AXM spam (and stabilize PM2)
> Run these in order:
> 
> ```bash
> # 1) Quick daemon refresh (non-destructive)
> pm2 update
> 
> # 2) If still spamming, nuke & relaunch the daemon cleanly
> pm2 save # optional if you want to preserve your current setup
> pm2 kill # kills the PM2 daemon and bus
> pm2 start ecosystem.config.js
> 
> # 3) Clean the logs so you can see fresh errors
> pm2 flush
> ```
> 
> Also make sure you’re on a sane, consistent PM2/tooling version:
> ```bash
> pm2 -v
> npm -g ls pm2
> ```
> If you use `@pm2/io` anywhere (directly or via deps), ensure versions match across your services:
> ```bash
> npm ls @pm2/io --all
> ```
> (If you don’t need PM2 app metrics, remove `@pm2/io` entirely.)
> 
> ### Why it happened
> - Rapid service flapping (e.g., exceptions, DB down) → old worker sends AXM messages after it’s been replaced.
> - Mixed PM2 versions (global daemon vs local scripts) → id map desync.
> - Multiple daemons (rare) → messages land on the “wrong” bus.
> 
> ### Meanwhile: stop the actual restarts
> From our earlier thread, two top causes in your stack:
> - **Mongo/queueManager** throwing when DB isn’t up → wrap those calls so the broker doesn’t crash.
> - **PM2 watch** restarting on file changes (logs/tmp/db dirs). Disable watch or add ignores:
> ```js
> watch: false,
> // or
> watch: [__dirname],
> ignore_watch: ["logs","tmp","node_modules",".git","db","data"]
> ```
> 
> If AXM spam persists after `pm2 update`/`pm2 kill` + clean start, paste:
> - `pm2 -v` and `npm -g ls pm2`
> - Output of `npm ls @pm2/io --all` (in your repo root)
> - The `apps` block for one flapping service (to check `watch`, memory caps, etc.)
> 
> Tiny mental model (why the spam appears):
> 
> ```mermaid
> sequenceDiagram
>  participant App as Node service
>  participant PM2 as PM2 Daemon (AXM bus)
>  App->>PM2: axm:monitor { id: 17, ... }
>  Note over App: Process restarts quickly → old worker still sending
>  PM2-->>App: Unknown id 17 (no longer tracked)
>  Note over PM2: Daemon map lost id ↔ proc after restart
> ```
<!-- UID: 4358b72d-e724-4498-9f26-a2a9d27eed74 -->

---




>[!nexus_user] **User** - 08/09/2025 at 11:04 AM
> ohh.... log files might be triggering restarts... I wasn't doing that across the board before... and it's all the js processes, which have their source code at the service's root.
<!-- UID: 601a8450-0c17-49b1-8a0b-1bce305c0ccc -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 11:04 AM
> Yep—that’ll do it. PM2’s `watch` + logs (or build artifacts) in the **same folder** = endless self-triggered restarts.
> 
> Here’s a tight, repeatable fix you can stamp across all JS services:
> 
> ### 1) Move logs out of watched trees
> Pick a central runtime dir (outside service roots), e.g. `./runtime/pm2-logs/`:
> ```js
> // ecosystem.config.js (per app)
> {
>  name: "broker",
>  script: "./broker.js",
>  cwd: __dirname,
>  watch: false, // default off unless you really need it
>  out_file: "../../runtime/pm2-logs/broker.out.log",
>  error_file: "../../runtime/pm2-logs/broker.err.log",
>  merge_logs: true,
> }
> ```
> 
> ### 2) If you must use watch, scope it + ignore junk
> Only watch **source**, never the whole service dir:
> ```js
> {
>  watch: ["./src"], // or a specific file list
>  ignore_watch: [
>  "node_modules", "logs", "tmp", "dist", "build", "coverage",
>  ".git", "*.log", "*.sqlite", "*.db", ".cache"
>  ],
>  watch_delay: 500, // debounce file bursts
>  exp_backoff_restart_delay: 200, // avoid restart storms
>  min_uptime: "10s", // consider “up” only after 10s
> }
> ```
> 
> ### 3) Bake it into your `defineApp` helper
> So you don’t forget on new services:
> ```js
> // pm2Helpers.js
> const path = require("path");
> const root = path.join(__dirname, ".."); // adjust to repo root
> const LOG_DIR = path.join(root, "runtime/pm2-logs");
> 
> exports.defineApp = function defineApp(name, script, deps = [], opts = {}) {
>  const watchOn = process.env.WATCH === "1";
>  return {
>  name,
>  script,
>  cwd: opts.cwd || process.cwd(),
>  watch: watchOn ? [path.join(opts.cwd || process.cwd(), "src")] : false,
>  ignore_watch: [
>  "node_modules","logs","tmp","dist","build","coverage",".git","*.log",".cache","data","db"
>  ],
>  out_file: path.join(LOG_DIR, `${name}.out.log`),
>  error_file: path.join(LOG_DIR, `${name}.err.log`),
>  merge_logs: true,
>  watch_delay: 500,
>  exp_backoff_restart_delay: 200,
>  min_uptime: "10s",
>  restart_delay: 1000,
>  env: { NODE_ENV: "production", ...opts.env },
>  ...opts,
>  };
> };
> ```
> 
> ### 4) Quick audit & clean restart
> ```bash
> pm2 unwatch all
> pm2 flush
> pm2 kill
> pm2 start ecosystem.config.js
> # sanity check each app’s watch/ignore settings:
> pm2 describe <app> | sed -n '/watch/,/env/ p'
> ```
> 
> ### 5) Common loop to avoid
> If you transpile or write files next to sources:
> ```
> tsc -> writes to ./dist ⟶ (watched) ⟶ PM2 restarts ⟶ tsc runs again ⟶ …
> logger -> writes *.log ⟶ (watched) ⟶ PM2 restarts ⟶ …
> ```
> 
> A tiny visual:
> ```mermaid
> flowchart LR
>  A[Your service] -- writes file --> B[watched dir]
>  B -- change event --> C[PM2 watch]
>  C -- restart --> A
> ```
> 
> Do the three things: **watch only src**, **ignore outputs/logs**, **log outside the repo/service root**. That should stop the flapping across all JS services. If any still bounce after this, it’s likely a genuine runtime error—then we’ll zero in on that one with `pm2 logs <app>` now that watch noise is gone.
<!-- UID: ae27d1d1-b951-4cf4-89e0-2f9c1aaf26d9 -->

---


