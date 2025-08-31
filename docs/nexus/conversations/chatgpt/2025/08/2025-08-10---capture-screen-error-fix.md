---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Capture screen error fix"
conversation_id: 6899291c-a0dc-832f-aa18-78a070b5e720
create_time: 08/10/2025 at 6:19 PM
update_time: 08/10/2025 at 9:00 PM
---

# Title: Capture screen error fix

Created: 08/10/2025 at 6:19 PM
Last Updated: 08/10/2025 at 9:00 PM
Chat URL: https://chat.openai.com/c/6899291c-a0dc-832f-aa18-78a070b5e720


>[!nexus_user] **User** - 08/10/2025 at 6:19 PM
> 10|vision | capture failed RangeError [ERR_CHILD_PROCESS_STDIO_MAXBUFFER]: stdout maxBuffer length exceeded
> 10|vision | at Socket.onChildStdout (node:child_process:484:14)
> 10|vision | at Socket.emit (node:events:518:28)
> 10|vision | at addChunk (node:internal/streams/readable:561:12)
> 10|vision | at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
> 10|vision | at Readable.push (node:internal/streams/readable:392:5)
> 10|vision | at Pipe.onStreamRead (node:internal/stream_base_commons:189:23) {
> 10|vision | code: 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER',
> 10|vision | cmd: 'import -silent -window root -crop 2560x1600+0+0 -screen png:"-" '
> 10|vision | }
<!-- UID: 0704fa9f-fbbb-4e63-bb82-0b4b93cb46da -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 6:19 PM
> You hit Node’s `exec` stdout cap. A full-screen PNG (2560×1600) easily blows past the default 1 MB `maxBuffer`, so `exec` chokes.
> 
> Quick fixes (pick one):
> 
> 1) Stream instead of buffering (recommended)
> ```ts
> import { spawn } from "node:child_process";
> 
> export function captureScreen(): Promise<Buffer> {
>  return new Promise((resolve, reject) => {
>  const proc = spawn("import", [
>  "-silent",
>  "-window", "root",
>  "-crop", "2560x1600+0+0",
>  "-screen",
>  "png:-",
>  "-depth", "8", // smaller output; 8-bit per channel is enough
>  "-strip" // drop metadata
>  ], { stdio: ["ignore", "pipe", "pipe"] });
> 
>  const chunks: Buffer[] = [];
>  proc.stdout.on("data", c => chunks.push(c));
>  proc.stderr.on("data", e => {/* optional: log e.toString() */});
>  proc.on("error", reject);
>  proc.on("close", code => {
>  if (code !== 0) return reject(new Error(`import exited ${code}`));
>  resolve(Buffer.concat(chunks));
>  });
>  });
> }
> ```
> - No `maxBuffer` limit because you’re streaming.
> - Keep reading `stderr` so it doesn’t back up.
> - `-depth 8` and `-strip` shrink the blob.
> 
> 2) If you must use `exec`/`execFile`, bump the cap (less safe)
> ```ts
> import { execFile } from "node:child_process";
> 
> execFile("import",
>  ["-silent","-window","root","-crop","2560x1600+0+0","-screen","png:-","-depth","8","-strip"],
>  { encoding: "buffer", maxBuffer: 50 * 1024 * 1024 }, // 50MB
>  (err, stdout) => { /* … */ }
> );
> ```
> This still buffers the entire image in RAM.
> 
> Extra dials if size is still chunky:
> - If lossless isn’t required, switch to JPEG/WebP to cut size:
>  `… "jpg:-", "-quality", "90"` or `… "webp:-", "-quality", "85"`
> - Or downscale a bit: add `"-resize","1280x800"` before the format.
> - Or use ffmpeg pipe (since you’re already using it elsewhere):
>  `ffmpeg -f x11grab -video_size 2560x1600 -i :0.0 -frames:v 1 -f image2pipe -vcodec png -`
>  (same `spawn` pattern as above)
> 
> TL;DR: swap `exec` → `spawn` and stream the output; optionally force 8-bit and strip metadata. That’ll kill the `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` and make the capture cheaper.
<!-- UID: efb8dd94-c237-4c5d-95cc-754c49a27c0f -->

---




>[!nexus_user] **User** - 08/10/2025 at 6:23 PM
> It was working as an http servicce... this was introduced after we switched to websockets... I thought it was a payload limit, but the ws docs say the default payload limit is 100mb
> 
> ```js
> import express from "express";
> import screenshot from "screenshot-desktop";
> import { HeartbeatClient } from "../../../shared/js/heartbeat/index.js";
> import { startService } from "../../../shared/js/serviceTemplate.js";
> import { WebSocketServer } from "ws";
> 
> export const app = express();
> let capture = async () => screenshot({ format: "png" });
> if (process.env.VISION_STUB) {
>  capture = async () => Buffer.from("stub");
> }
> 
> export function setCaptureFn(fn) {
>  capture = fn;
> }
> 
> export async function start(port = process.env.PORT || 5003) {
>  try {
>  const hb = new HeartbeatClient({ name: process.env.name || "vision" });
>  await hb.sendOnce();
>  hb.start();
>  } catch {}
> 
>  const server = app.listen(port, () => {
>  console.log(`vision service listening on ${port}`);
>  });
> 
>  const wss = new WebSocketServer({ server, path: "/capture" });
>  wss.on("connection", (ws) => {
>  ws.on("message", async () => {
>  try {
>  const img = await capture();
>  ws.send(img);
>  } catch {
>  ws.close();
>  }
>  });
>  });
> 
>  let broker;
>  const handleTask = async (task) => {
>  if (task.queue === "vision-capture") {
>  try {
>  const img = await capture();
>  broker?.publish("vision-capture", { image: img.toString("base64") });
>  } catch (err) {
>  console.error("capture task failed", err);
>  }
>  }
>  };
>  startService({
>  id: process.env.name || "vision",
>  queues: ["vision-capture"],
>  handleTask,
>  })
>  .then((b) => {
>  broker = b;
>  })
>  .catch((err) => {
>  console.warn("[vision] broker connection failed", err);
>  });
> 
>  return server;
> }
> 
> app.get("/capture", async (req, res) => {
>  try {
>  const img = await capture();
>  res.set("Content-Type", "image/png");
>  res.send(img);
>  } catch (err) {
>  console.error("capture failed", err);
>  res.status(500).send("capture failed");
>  }
> });
> 
> if (process.env.NODE_ENV !== "test") {
>  start().catch((err) => {
>  console.error("Failed to start vision service", err);
>  process.exit(1);
>  });
> }
> ```
<!-- UID: a8edb2a4-dfee-4979-b7f6-00d5967b2940 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 6:23 PM
> Yep—this isn’t the WS payload cap. It’s your capture subprocess blowing Node’s `exec`/`execFile` stdout buffer (the `import … png:"-"` in the stack trace gives it away). `screenshot-desktop` uses ImageMagick on Linux and (on some versions) reads the whole PNG via `exec` with the 1 MB default `maxBuffer`. When you switched to WS you likely increased call frequency and hit it reliably.
> 
> Fix: stream the capture (spawn + pipe) and add a tiny bit of WS backpressure. Drop-in patch below.
> 
> ```js
> // vision service
> import express from "express";
> import { spawn } from "node:child_process";
> import { HeartbeatClient } from "../../../shared/js/heartbeat/index.js";
> import { startService } from "../../../shared/js/serviceTemplate.js";
> import { WebSocketServer } from "ws";
> 
> export const app = express();
> 
> // --- streaming capture (no maxBuffer) ---
> const W = Number(process.env.SCREEN_W) || 2560;
> const H = Number(process.env.SCREEN_H) || 1600;
> const FORMAT = (process.env.VISION_FORMAT || "png").toLowerCase();
> 
> async function captureStreamed() {
>  const args = [
>  "-silent",
>  "-window", "root",
>  "-crop", `${W}x${H}+0+0`,
>  "-screen",
>  ];
> 
>  if (FORMAT === "png") {
>  args.push("-depth", "8", "-strip", "png:-");
>  } else if (FORMAT === "jpg" || FORMAT === "jpeg") {
>  args.push("-quality", process.env.VISION_QUALITY || "85", "jpg:-");
>  } else if (FORMAT === "webp") {
>  args.push("-quality", process.env.VISION_QUALITY || "85", "webp:-");
>  } else {
>  throw new Error(`Unsupported format: ${FORMAT}`);
>  }
> 
>  return new Promise((resolve, reject) => {
>  const p = spawn("import", args, { stdio: ["ignore", "pipe", "pipe"] });
>  const bufs = [];
>  let stderr = "";
>  p.stdout.on("data", (d) => bufs.push(d));
>  p.stderr.on("data", (d) => (stderr += d));
>  p.on("error", reject);
>  p.on("close", (code) => {
>  if (code !== 0) return reject(new Error(`import exited ${code}: ${stderr}`));
>  resolve(Buffer.concat(bufs));
>  });
>  });
> }
> 
> let capture = captureStreamed;
> if (process.env.VISION_STUB) {
>  capture = async () => Buffer.from("stub");
> }
> 
> export function setCaptureFn(fn) {
>  capture = fn;
> }
> 
> export async function start(port = process.env.PORT || 5003) {
>  try {
>  const hb = new HeartbeatClient({ name: process.env.name || "vision" });
>  await hb.sendOnce();
>  hb.start();
>  } catch {}
> 
>  const server = app.listen(port, () => {
>  console.log(`vision service listening on ${port}`);
>  });
> 
>  // Helpful WS tweaks: lower CPU and add simple “busy” gate
>  const wss = new WebSocketServer({
>  server,
>  path: "/capture",
>  perMessageDeflate: { threshold: 64 * 1024 }, // avoid compressing giant frames
>  // maxPayload defaults to 100 MiB; leave it unless you want stricter limits
>  });
> 
>  wss.on("connection", (ws) => {
>  let busy = false;
>  ws.on("message", async () => {
>  if (busy || ws.readyState !== ws.OPEN) return;
>  busy = true;
>  try {
>  const img = await capture();
>  // Backpressure: if network is slow, avoid piling up
>  if (ws.readyState === ws.OPEN && ws.bufferedAmount < 16 * 1024 * 1024) {
>  ws.send(img, { binary: true });
>  }
>  } catch (e) {
>  console.error("capture failed", e);
>  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ error: "capture_failed" }));
>  } finally {
>  busy = false;
>  }
>  });
>  });
> 
>  let broker;
>  const handleTask = async (task) => {
>  if (task.queue === "vision-capture") {
>  try {
>  const img = await capture();
>  // base64 expands ~33%; consider sending binary via your broker if possible
>  broker?.publish("vision-capture", { image: img.toString("base64") });
>  } catch (err) {
>  console.error("capture task failed", err);
>  }
>  }
>  };
> 
>  startService({
>  id: process.env.name || "vision",
>  queues: ["vision-capture"],
>  handleTask,
>  })
>  .then((b) => { broker = b; })
>  .catch((err) => { console.warn("[vision] broker connection failed", err); });
> 
>  return server;
> }
> 
> app.get("/capture", async (_req, res) => {
>  try {
>  const img = await capture();
>  res.set("Content-Type", `image/${FORMAT === "jpg" ? "jpeg" : FORMAT}`);
>  res.send(img);
>  } catch (err) {
>  console.error("capture failed", err);
>  res.status(500).send("capture failed");
>  }
> });
> 
> if (process.env.NODE_ENV !== "test") {
>  start().catch((err) => {
>  console.error("Failed to start vision service", err);
>  process.exit(1);
>  });
> }
> ```
> 
> Optional dials if you still see spikes:
> - `VISION_FORMAT=jpg` (or `webp`) to shrink frames drastically.
> - Add a simple rate limit (e.g., ignore WS requests if last capture < X ms ago).
> - If multiple clients connect, keep a global semaphore so only one capture runs at a time.
> - If you stick with `screenshot-desktop`, fork/patch it to use `spawn` or pass a larger `maxBuffer`—but streaming is the robust fix.
<!-- UID: 06110350-cc57-480d-89c8-395cb5ac51a2 -->

---




>[!nexus_user] **User** - 08/10/2025 at 8:40 PM
> It was working for a while, then it stopped... there should only be the one client, but I can't rule out greedy/delayed services over queueing jobs...
<!-- UID: 00b4ff86-ae88-477e-900e-aaebb42a514c -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 8:40 PM
> Ya, “works for a bit then dies” smells like overlapping captures + a stuck `import` child, not a WS size cap. With WS you probably started hammering faster and/or in parallel (from the queue side), so you hit:
> 
> - multiple captures in flight → RAM spikes + ImageMagick sadness 
> - a hung child process (never resolves) → subsequent requests pile up 
> - base64 on the broker making backpressure worse
> 
> Here’s a tight fix set:
> 
> # Lock it to single-flight + add a timeout + throttle
> 
> Drop-in changes for your service (JS). This keeps exactly one capture running at a time, reuses the same promise for concurrent callers, hard-kills hung children, and avoids flooding.
> 
> ```js
> import express from "express";
> import { spawn } from "node:child_process";
> import { WebSocketServer } from "ws";
> import { HeartbeatClient } from "../../../shared/js/heartbeat/index.js";
> import { startService } from "../../../shared/js/serviceTemplate.js";
> 
> export const app = express();
> 
> // ---------- capture impl (streamed; no maxBuffer) ----------
> const W = +process.env.SCREEN_W || 2560;
> const H = +process.env.SCREEN_H || 1600;
> const FORMAT = (process.env.VISION_FORMAT || "png").toLowerCase();
> const QUALITY = process.env.VISION_QUALITY || "85";
> const CAPTURE_TIMEOUT_MS = +process.env.CAPTURE_TIMEOUT_MS || 2500;
> const MIN_CAPTURE_GAP_MS = +process.env.MIN_CAPTURE_GAP_MS || 100; // throttle
> 
> function spawnImport() {
>  const args = ["-silent", "-window", "root", "-crop", `${W}x${H}+0+0`, "-screen"];
>  if (FORMAT === "png") args.push("-depth", "8", "-strip", "png:-");
>  else if (FORMAT === "jpg" || FORMAT === "jpeg") args.push("-quality", QUALITY, "jpg:-");
>  else if (FORMAT === "webp") args.push("-quality", QUALITY, "webp:-");
>  else throw new Error(`Unsupported format: ${FORMAT}`);
> 
>  return spawn("import", args, { stdio: ["ignore", "pipe", "pipe"] });
> }
> 
> async function captureOnce() {
>  if (process.env.VISION_STUB) return Buffer.from("stub");
> 
>  return new Promise((resolve, reject) => {
>  const p = spawnImport();
>  const bufs = [];
>  let stderr = "";
> 
>  const killer = setTimeout(() => {
>  // hard kill hung capture
>  try { p.kill("SIGKILL"); } catch {}
>  reject(new Error("capture timeout"));
>  }, CAPTURE_TIMEOUT_MS);
> 
>  p.stdout.on("data", d => bufs.push(d));
>  p.stderr.on("data", d => (stderr += d));
>  p.on("error", err => { clearTimeout(killer); reject(err); });
>  p.on("close", code => {
>  clearTimeout(killer);
>  if (code !== 0) return reject(new Error(`import exited ${code}: ${stderr}`));
>  resolve(Buffer.concat(bufs));
>  });
>  });
> }
> 
> // ---------- single-flight wrapper + simple throttle ----------
> let inflight = null; // Promise<Buffer> | null
> let lastCaptureAt = 0;
> 
> async function captureSingleFlight() {
>  // throttle
>  const now = Date.now();
>  const wait = lastCaptureAt + MIN_CAPTURE_GAP_MS - now;
>  if (wait > 0) await new Promise(r => setTimeout(r, wait));
> 
>  if (!inflight) {
>  inflight = captureOnce()
>  .finally(() => {
>  lastCaptureAt = Date.now();
>  inflight = null;
>  });
>  }
>  return inflight;
> }
> 
> // Expose the capture to both WS and broker
> let capture = captureSingleFlight;
> export function setCaptureFn(fn) { capture = fn; }
> 
> // ---------- service start ----------
> export async function start(port = process.env.PORT || 5003) {
>  try {
>  const hb = new HeartbeatClient({ name: process.env.name || "vision" });
>  await hb.sendOnce(); hb.start();
>  } catch {}
> 
>  const server = app.listen(port, () => {
>  console.log(`vision service listening on ${port}`);
>  });
> 
>  const wss = new WebSocketServer({
>  server,
>  path: "/capture",
>  perMessageDeflate: { threshold: 64 * 1024 }, // don’t waste CPU compressing giant frames
>  });
> 
>  // Keep connections clean; detect zombies
>  const interval = setInterval(() => {
>  wss.clients.forEach(ws => {
>  if (ws.isAlive === false) return ws.terminate();
>  ws.isAlive = false; ws.ping();
>  });
>  }, 30000);
> 
>  wss.on("connection", (ws) => {
>  ws.isAlive = true;
>  ws.on("pong", () => { ws.isAlive = true; });
> 
>  ws.on("message", async () => {
>  if (ws.readyState !== ws.OPEN) return;
>  try {
>  const img = await capture();
>  // backpressure guard
>  if (ws.bufferedAmount > 16 * 1024 * 1024) return; // drop if client is slow
>  ws.send(img, { binary: true });
>  } catch (e) {
>  console.error("[vision] capture failed", e);
>  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ error: "capture_failed" }));
>  }
>  });
>  });
> 
>  wss.on("close", () => clearInterval(interval));
> 
>  // ---------- broker task handler ----------
>  let broker;
>  const handleTask = async (task) => {
>  if (task.queue !== "vision-capture") return;
>  try {
>  const img = await capture();
>  // base64 expands ~33%; if your broker can send binary, prefer that
>  broker?.publish("vision-capture", { image: img.toString("base64") });
>  } catch (err) {
>  console.error("capture task failed", err);
>  }
>  };
> 
>  startService({
>  id: process.env.name || "vision",
>  queues: ["vision-capture"],
>  handleTask,
>  })
>  .then((b) => { broker = b; })
>  .catch((err) => { console.warn("[vision] broker connection failed", err); });
> 
>  return server;
> }
> 
> // ---------- legacy HTTP endpoint ----------
> app.get("/capture", async (_req, res) => {
>  try {
>  const img = await capture();
>  res.set("Content-Type", `image/${FORMAT === "jpg" ? "jpeg" : FORMAT}`);
>  res.send(img);
>  } catch (err) {
>  console.error("capture failed", err);
>  res.status(500).send("capture failed");
>  }
> });
> 
> if (process.env.NODE_ENV !== "test") {
>  start().catch((err) => {
>  console.error("Failed to start vision service", err);
>  process.exit(1);
>  });
> }
> ```
> 
> # Why this helps
> 
> - **Single-flight**: if two requests hit at once (WS + queue, or a laggy client retry), they await the *same* capture, not spawn two ImageMagicks.
> - **Timeout + hard kill**: a wedged `import` won’t freeze the service forever.
> - **Throttle**: avoids spamming the X server/IM at sub-frame intervals.
> - **Backpressure**: `ws.bufferedAmount` gate keeps slow clients from building a write queue.
> - **Keepalive**: pings close dead WS connections so they don’t keep asking.
> 
> # Minimal extra sanity checks
> 
> - Log child PIDs and exit codes for a bit to confirm no overlaps:
>  - add `console.debug('[vision] spawn PID', p.pid)` and on close `console.debug('[vision] exit', code)`
> - If you still see stalls, try `VISION_FORMAT=jpg` or `webp` to shrink frames.
> - If your broker can handle binary, skip base64 to reduce memory churn.
> 
> # Tiny mental model
> 
> ```mermaid
> sequenceDiagram
>  participant Client
>  participant WS as WS / HTTP
>  participant Svc as Vision Service
>  participant IM as ImageMagick `import`
> 
>  Client->>WS: "capture"
>  WS->>Svc: request
>  alt inflight capture exists
>  Svc-->>WS: await same Promise
>  else
>  Svc->>IM: spawn import (timeout)
>  IM-->>Svc: image buffer
>  end
>  Svc-->>WS: binary frame (backpressure checked)
>  WS-->>Client: image
> ```
> 
> If you want, I can adapt this to keep a *single* capture loop pushing frames at N fps to all connected clients (pub/sub), which usually plays nicer than request/response for screenshots.
<!-- UID: 1baf0421-239f-4c2a-8f05-b18dc28b50fd -->

---




>[!nexus_user] **User** - 08/10/2025 at 8:56 PM
> yea... how am i gonna refactor this. I hate changing protocol stuff up. It always means work that spans across services.
<!-- UID: 61fcbd3f-bbd0-4ca4-baca-0d54df1a42b2 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 8:56 PM
> Totally fair—you don’t need a protocol migration to fix this. Do it as an internal refactor: add a **single-flight capture manager with a tiny cache + timeout**, and keep your HTTP/WS message shapes exactly the same.
> 
> Here’s the plan (no cross-service churn):
> 
> 1) Wrap capture in a singleton “manager”
> - Guarantees **one child process at a time**
> - **Timeout** + hard kill if `import` hangs
> - **Throttle** (min gap) so queues can’t spam the X server
> - **Freshness cache** (e.g., 100–200 ms). WS/HTTP/broker all ask the same manager.
> 
> 2) Keep current endpoints & behavior
> - WS: still “send any message → get a frame”.
> - HTTP: still `GET /capture` returns a PNG (or your chosen format).
> - Broker: still publishes base64 (you can drop-in later to binary without touching this file).
> 
> 3) Add two env dials, not protocol
> - `CAPTURE_TIMEOUT_MS` (default 2500)
> - `MIN_CAPTURE_GAP_MS` (default 100)
> - `FRAME_TTL_MS` (default 150): serve recent cached frame if fresh
> 
> Drop-in code (tight, minimal change):
> 
> ```js
> // at top of your file
> import { spawn } from "node:child_process";
> 
> // --- capture manager (single-flight + ttl cache) ---
> const W = +process.env.SCREEN_W || 2560;
> const H = +process.env.SCREEN_H || 1600;
> const FORMAT = (process.env.VISION_FORMAT || "png").toLowerCase();
> const QUALITY = process.env.VISION_QUALITY || "85";
> 
> const CAPTURE_TIMEOUT_MS = +process.env.CAPTURE_TIMEOUT_MS || 2500;
> const MIN_CAPTURE_GAP_MS = +process.env.MIN_CAPTURE_GAP_MS || 100;
> const FRAME_TTL_MS = +process.env.FRAME_TTL_MS || 150;
> 
> function spawnImport() {
>  const args = ["-silent", "-window", "root", "-crop", `${W}x${H}+0+0`, "-screen"];
>  if (FORMAT === "png") args.push("-depth", "8", "-strip", "png:-");
>  else if (FORMAT === "jpg" || FORMAT === "jpeg") args.push("-quality", QUALITY, "jpg:-");
>  else if (FORMAT === "webp") args.push("-quality", QUALITY, "webp:-");
>  else throw new Error(`Unsupported format: ${FORMAT}`);
>  return spawn("import", args, { stdio: ["ignore", "pipe", "pipe"] });
> }
> 
> async function captureOnce() {
>  if (process.env.VISION_STUB) return Buffer.from("stub");
>  return new Promise((resolve, reject) => {
>  const p = spawnImport();
>  const chunks = [];
>  let stderr = "";
> 
>  const t = setTimeout(() => { try { p.kill("SIGKILL"); } catch {} ; reject(new Error("capture timeout")); }, CAPTURE_TIMEOUT_MS);
> 
>  p.stdout.on("data", d => chunks.push(d));
>  p.stderr.on("data", d => (stderr += d));
>  p.on("error", e => { clearTimeout(t); reject(e); });
>  p.on("close", code => {
>  clearTimeout(t);
>  if (code !== 0) return reject(new Error(`import exited ${code}: ${stderr}`));
>  resolve(Buffer.concat(chunks));
>  });
>  });
> }
> 
> const CaptureManager = (() => {
>  let inflight = null; // Promise<Buffer> | null
>  let lastCaptureAt = 0;
>  let lastFrame = null; // Buffer | null
>  let lastFrameAt = 0;
> 
>  async function getFrame() {
>  const now = Date.now();
>  // serve cached if "fresh"
>  if (lastFrame && now - lastFrameAt <= FRAME_TTL_MS) return lastFrame;
> 
>  // throttle
>  const wait = lastCaptureAt + MIN_CAPTURE_GAP_MS - now;
>  if (wait > 0) await new Promise(r => setTimeout(r, wait));
> 
>  if (!inflight) {
>  inflight = captureOnce()
>  .then(buf => { lastFrame = buf; lastFrameAt = Date.now(); return buf; })
>  .finally(() => { lastCaptureAt = Date.now(); inflight = null; });
>  }
>  return inflight;
>  }
> 
>  return { getFrame };
> })();
> ```
> 
> Now use it **without** changing your protocol:
> 
> ```js
> // keep your existing glue; only swap capture() calls
> 
> wss.on("connection", (ws) => {
>  ws.on("message", async () => {
>  try {
>  const img = await CaptureManager.getFrame();
>  if (ws.readyState === ws.OPEN && ws.bufferedAmount < 16 * 1024 * 1024) {
>  ws.send(img, { binary: true });
>  }
>  } catch {
>  ws.close();
>  }
>  });
> });
> 
> app.get("/capture", async (_req, res) => {
>  try {
>  const img = await CaptureManager.getFrame();
>  res.set("Content-Type", `image/${FORMAT === "jpg" ? "jpeg" : FORMAT}`);
>  res.send(img);
>  } catch (err) {
>  console.error("capture failed", err);
>  res.status(500).send("capture failed");
>  }
> });
> 
> const handleTask = async (task) => {
>  if (task.queue === "vision-capture") {
>  try {
>  const img = await CaptureManager.getFrame();
>  broker?.publish("vision-capture", { image: img.toString("base64") });
>  } catch (err) {
>  console.error("capture task failed", err);
>  }
>  }
> };
> ```
> 
> That’s it. Same endpoints, same WS flow, same broker payload; you just centralize capture semantics so **WS + HTTP + broker can’t trip over each other**.
> 
> Tiny extras (still protocol-neutral):
> - Add keepalive for WS (ping/pong) to cull dead sockets.
> - Set `perMessageDeflate: { threshold: 64 * 1024 }` on the WS server to skip compressing giant frames.
> - If memory spikes: `VISION_FORMAT=jpg` or `webp` to shrink frames; you can toggle by env.
> 
> If you ever *want* a streaming mode later, add a **new WS path** (`/stream`) and broadcast frames from the same manager at N fps. Old clients keep using `/capture` unchanged. But you don’t need that to stabilize things now.
<!-- UID: 927e0cba-38a3-4b60-a4ec-e6b6dd91de9a -->

---


