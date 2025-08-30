import test from "ava";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { once } from "events";
import type { AddressInfo } from "net";
import { EventEmitter } from "events";

import { attachRouter } from "../src/router.js";
import { createWsServer } from "../src/wsListener.js";

class MockWS extends EventEmitter {
  public sent: any[] = [];
  public bufferedAmount = 0;
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
}

test("attachRouter emits progress, result, error and cleans up on close", async (t) => {
  const bridgeServer = new WebSocketServer({ port: 0 });
  bridgeServer.on("connection", (ws) => ws.on("error", () => {}));
  await once(bridgeServer, "listening");
  const bridgePort = (bridgeServer.address() as AddressInfo).port;
  process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridgePort}`;

  const ws = new MockWS();
  attachRouter(ws as any, "session");

  const [bridgeSocket] = await once(bridgeServer, "connection");

  bridgeSocket.send(
    JSON.stringify({ kind: "tool.chunk", id: "1", data: { step: 1 } }),
  );
  bridgeSocket.send(
    JSON.stringify({ kind: "tool.result", id: "2", result: { done: true } }),
  );
  bridgeSocket.send(
    JSON.stringify({ kind: "tool.error", id: "3", error: "boom" }),
  );
  await new Promise((res) => setTimeout(res, 10));

  t.deepEqual(ws.sent[0], {
    jsonrpc: "2.0",
    method: "tools/progress",
    params: { id: "1", data: { step: 1 } },
  });
  t.deepEqual(ws.sent[1], { jsonrpc: "2.0", id: "2", result: { done: true } });
  t.deepEqual(ws.sent[2], {
    jsonrpc: "2.0",
    id: "3",
    error: { code: -32000, message: "boom" },
  });

  const closed = once(bridgeSocket, "close");
  ws.emit("close");
  await closed;

  await new Promise<void>((res, rej) =>
    bridgeServer.close((err) => (err ? rej(err) : res())),
  );
});

test("createWsServer rejects unauthorized connections", async (t) => {
  process.env.MCP_TOKEN = "secret";
  const server = http.createServer();
  const wss = createWsServer(server);
  await new Promise<void>((res) => server.listen(0, res));
  const port = (server.address() as AddressInfo).port;

  await t.throwsAsync(
    () =>
      new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${port}/mcp`);
        ws.on("open", () => resolve(undefined));
        ws.on("error", reject);
      }),
    { message: /401/ },
  );

  await new Promise<void>((res, rej) =>
    wss.close((err) => (err ? rej(err) : res())),
  );
  await new Promise<void>((res, rej) =>
    server.close((err) => (err ? rej(err) : res())),
  );
});

test("createWsServer authorizes connections and attaches router", async (t) => {
  process.env.MCP_TOKEN = "secret";
  const bridgeServer = new WebSocketServer({ port: 0 });
  bridgeServer.on("connection", (ws) => ws.on("error", () => {}));
  await once(bridgeServer, "listening");
  const bridgePort = (bridgeServer.address() as AddressInfo).port;
  process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridgePort}`;

  const server = http.createServer();
  const wss = createWsServer(server);
  await new Promise<void>((res) => server.listen(0, res));
  const port = (server.address() as AddressInfo).port;

  const ws = new WebSocket(`ws://localhost:${port}/mcp`, {
    headers: { Authorization: "Bearer secret" },
  });
  await once(ws, "open");
  ws.send(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }));
  const [raw] = await once(ws, "message");
  const msg = JSON.parse(raw.toString());
  t.true(Array.isArray(msg.result.capabilities.tools));

  const closed = once(ws, "close");
  ws.close();
  await closed;

  await new Promise<void>((res, rej) =>
    wss.close((err) => (err ? rej(err) : res())),
  );
  await new Promise<void>((res, rej) =>
    server.close((err) => (err ? rej(err) : res())),
  );
  await new Promise<void>((res, rej) =>
    bridgeServer.close((err) => (err ? rej(err) : res())),
  );
});
