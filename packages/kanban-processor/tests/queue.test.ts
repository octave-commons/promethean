// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import { WebSocketServer } from "ws";
import { startKanbanProcessor } from "../src/index.js";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("enqueues processing tasks for board and file changes", async (t) => {
  const wss = new WebSocketServer({ port: 0 });
  const messages: any[] = [];
  wss.on("connection", (ws) => {
    ws.on("message", (m) => messages.push(JSON.parse(m.toString())));
  });

  const port = (wss.address() as any).port;
  process.env.BROKER_URL = `ws://localhost:${port}`;
  const svc = startKanbanProcessor(process.cwd());

  await wait(100);
  t.truthy(messages.find((m) => m.action === "ready"));

  for (const client of wss.clients) {
    client.send(
      JSON.stringify({ event: { type: "file-watcher-board-change" } }),
    );
    client.send(
      JSON.stringify({ event: { type: "file-watcher-task-change" } }),
    );
  }

  await wait(100);
  t.truthy(
    messages.find((m) => m.action === "enqueue" && m.task?.kind === "board"),
  );
  t.truthy(
    messages.find((m) => m.action === "enqueue" && m.task?.kind === "tasks"),
  );

  await svc.close();
  await new Promise((r) => wss.close(r));
});
