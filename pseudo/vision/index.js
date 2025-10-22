// vision service
import express from "express";
import { spawn } from "node:child_process";
import { HeartbeatClient } from "@promethean/legacy/heartbeat/index.js";
import { WebSocketServer } from "ws";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";

export const app = express();

// --- streaming capture (no maxBuffer) ---
const W = Number(process.env.SCREEN_W) || 2560;
const H = Number(process.env.SCREEN_H) || 1600;
const FORMAT = (process.env.VISION_FORMAT || "png").toLowerCase();

async function captureStreamed() {
  const args = [
    "-silent",
    "-window",
    "root",
    "-crop",
    `${W}x${H}+0+0`,
    "-screen",
  ];

  if (FORMAT === "png") {
    args.push("-depth", "8", "-strip", "png:-");
  } else if (FORMAT === "jpg" || FORMAT === "jpeg") {
    args.push("-quality", process.env.VISION_QUALITY || "85", "jpg:-");
  } else if (FORMAT === "webp") {
    args.push("-quality", process.env.VISION_QUALITY || "85", "webp:-");
  } else {
    throw new Error(`Unsupported format: ${FORMAT}`);
  }

  return new Promise((resolve, reject) => {
    const p = spawn("import", args, { stdio: ["ignore", "pipe", "pipe"] });
    const bufs = [];
    let stderr = "";
    p.stdout.on("data", (d) => bufs.push(d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("error", reject);
    p.on("close", (code) => {
      if (code !== 0)
        return reject(new Error(`import exited ${code}: ${stderr}`));
      resolve(Buffer.concat(bufs));
    });
  });
}

let capture = captureStreamed;
if (process.env.VISION_STUB) {
  capture = async () => Buffer.from("stub");
}

export function setCaptureFn(fn) {
  capture = fn;
}

let hb;
let server;
let wss;
let broker;

export async function start(port = process.env.PORT || 5003) {
  if (process.env.NODE_ENV !== "test") {
    try {
      hb = new HeartbeatClient({ name: process.env.name || "vision" });
      await hb.sendOnce();
      hb.start();
    } catch {
      try {
        hb?.stop();
      } catch {}
      hb = null;
    }
  }

  server = app.listen(port, () => {
    console.log(`vision service listening on ${port}`);
  });

  // Helpful WS tweaks: lower CPU and add simple “busy” gate
  wss = new WebSocketServer({
    server,
    path: "/capture",
    perMessageDeflate: { threshold: 64 * 1024 }, // avoid compressing giant frames
    // maxPayload defaults to 100 MiB; leave it unless you want stricter limits
  });

  wss.on("connection", (ws) => {
    let busy = false;
    ws.on("message", async () => {
      if (busy || ws.readyState !== ws.OPEN) return;
      busy = true;
      try {
        const img = await capture();
        // Backpressure: if network is slow, avoid piling up
        if (ws.readyState === ws.OPEN && ws.bufferedAmount < 16 * 1024 * 1024) {
          ws.send(img, { binary: true });
        }
      } catch (e) {
        console.error("capture failed", e);
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({ error: "capture_failed" }));
      } finally {
        busy = false;
      }
    });
  });

  const handleTask = async (task) => {
    if (task.queue === "vision-capture") {
      try {
        const img = await capture();
        // base64 expands ~33%; consider sending binary via your broker if possible
        broker?.publish("vision-capture", { image: img.toString("base64") });
      } catch (err) {
        console.error("capture task failed", err);
      }
    }
  };

  if (
    process.env.NODE_ENV !== "test" ||
    process.env.VISION_ENABLE_BROKER_TEST === "1"
  ) {
    try {
      const url =
        process.env.BROKER_URL ||
        `ws://127.0.0.1:${process.env.BROKER_PORT || 7000}`;
      broker = new BrokerClient({ url, id: process.env.name || "vision" });
      await broker.connect();
      broker.onTaskReceived(async (task) => {
        broker.ack(task.id);
        try {
          await handleTask(task);
        } finally {
          broker.ready(task.queue);
        }
      });
      broker.ready("vision-capture");
    } catch (err) {
      console.warn("[vision] broker connection failed", err);
      try {
        broker?.disconnect();
      } catch {}
      broker = null;
    }
  }

  return server;
}

export async function stop() {
  if (wss) {
    for (const client of wss.clients) {
      try {
        client.terminate();
      } catch {}
    }
    await new Promise((resolve) => wss.close(resolve));
    wss = null;
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }

  try {
    hb?.stop();
  } catch {}
  hb = null;

  try {
    broker?.disconnect();
  } catch {}
  broker = null;
}

app.get("/capture", async (_req, res) => {
  try {
    const img = await capture();
    res.set("Content-Type", `image/${FORMAT === "jpg" ? "jpeg" : FORMAT}`);
    res.send(img);
  } catch (err) {
    console.error("capture failed", err);
    res.status(500).send("capture failed");
  }
});

if (process.env.NODE_ENV !== "test") {
  start().catch((err) => {
    console.error("Failed to start vision service", err);
    process.exit(1);
  });
}
