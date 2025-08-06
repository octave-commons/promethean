import test from "ava";
import WebSocket from "ws";
import * as llm from "../src/index.js";
import ollama from "ollama";
import { HeartbeatClient } from "../../../../shared/js/heartbeat/index.js";

// mock ollama chat to avoid external dependency
ollama.chat = async () => ({ message: { content: "ok" } });
process.env.name = "test";
HeartbeatClient.prototype.sendOnce = async () => {};
HeartbeatClient.prototype.start = () => {};

test("websocket generates replies", async (t) => {
  const server = await llm.start(0);
  const port = server.address().port;

  const ws = new WebSocket(`ws://localhost:${port}/generate`);
  const reply = await new Promise((resolve, reject) => {
    ws.on("open", () => {
      ws.send(JSON.stringify({ prompt: "p", context: [], format: undefined }));
    });
    ws.on("message", (data) => {
      resolve(JSON.parse(data.toString()).reply);
    });
    ws.on("error", reject);
  });
  t.is(reply, "ok");
  ws.close();
  await new Promise((r) => server.close(r));
});
