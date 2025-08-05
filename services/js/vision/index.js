import express from "express";
import screenshot from "screenshot-desktop";
import { HeartbeatClient } from "../../../shared/js/heartbeat/index.js";

export const app = express();
let capture = async () => screenshot({ format: "png" });
if (process.env.VISION_STUB) {
  capture = async () => Buffer.from("stub");
}

export function setCaptureFn(fn) {
  capture = fn;
}

export async function start(port = process.env.PORT || 5003) {
  const hb = new HeartbeatClient({ name: process.env.name || "vision" });
  await hb.sendOnce();
  hb.start();
  return app.listen(port, () => {
    console.log(`vision service listening on ${port}`);
  });
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
