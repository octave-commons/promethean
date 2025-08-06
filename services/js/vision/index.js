import express from "express";
import screenshot from "screenshot-desktop";
import { HeartbeatClient } from "../../../shared/js/heartbeat/index.js";
import { WebSocketServer } from "ws";

export const app = express();
let capture = async () => screenshot({ format: "png" });
if (process.env.VISION_STUB) {
  capture = async () => Buffer.from("stub");
}

export function setCaptureFn(fn) {
  capture = fn;
}

export async function start(port = process.env.PORT || 5003) {
  try {
    const hb = new HeartbeatClient({ name: process.env.name || "vision" });
    await hb.sendOnce();
    hb.start();
  } catch {}
  const server = app.listen(port, () => {
    console.log(`vision service listening on ${port}`);
  });
  const wss = new WebSocketServer({ server, path: "/capture" });
  wss.on("connection", (ws) => {
    ws.on("message", async () => {
      try {
        const img = await capture();
        ws.send(img);
      } catch {
        ws.close();
      }
    });
  });
  return server;
}

app.get("/capture", async (req, res) => {
  try {
    const img = await capture();
    res.set("Content-Type", "image/png");
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
