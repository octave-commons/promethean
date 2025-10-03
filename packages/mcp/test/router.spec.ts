import http from "http";
import { once } from "events";
import type { AddressInfo } from "net";
import { EventEmitter } from "events";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";

import WebSocket, { WebSocketServer } from "ws";
import test from "ava";

import { attachRouter } from "../src/router.js";
import { createWsServer, resolveSessionMeta } from "../src/wsListener.js";
import { clearConfigCacheForTesting } from "../src/config.js";

class MockWS extends EventEmitter {
  public sent: any[] = [];
  public bufferedAmount = 0;
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

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
  await sleep(10);

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

test("attachRouter forwards session metadata in ctx", async (t) => {
  const bridgeServer = new WebSocketServer({ port: 0 });
  await once(bridgeServer, "listening");
  const bridgePort = (bridgeServer.address() as AddressInfo).port;
  process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridgePort}`;

  const received: any[] = [];
  bridgeServer.on("connection", (ws) => {
    ws.on("message", (data) => received.push(JSON.parse(data.toString())));
    ws.on("error", () => {});
  });

  const ws = new MockWS();
  attachRouter(ws as any, "session-meta", {
    server: "filesystem",
    cwd: "/tmp/repo",
  });

  const [bridgeSocket] = await once(bridgeServer, "connection");

  ws.emit(
    "message",
    Buffer.from(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: { name: "search.query", arguments: { query: "ctx" } },
      }),
    ),
  );

  const [raw] = await once(bridgeSocket, "message");
  const msg = JSON.parse(raw.toString());
  t.deepEqual(received[0]?.ctx, {
    sessionId: "session-meta",
    server: "filesystem",
    cwd: "/tmp/repo",
  });
  t.deepEqual(msg.ctx, {
    sessionId: "session-meta",
    server: "filesystem",
    cwd: "/tmp/repo",
  });

  const bridgeClosed = once(bridgeSocket, "close");
  ws.emit("close");
  bridgeSocket.close();
  await bridgeClosed;
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

test("resolveSessionMeta returns cwd from config", (t) => {
  clearConfigCacheForTesting();
  const prevConfig = process.env.MCP_STDIO_CONFIG;
  const dir = mkdtempSync(path.join(tmpdir(), "mcp-config-"));
  const configPath = path.join(dir, "config.json");
  writeFileSync(
    configPath,
    JSON.stringify({
      mcpServers: {
        repo: { command: "node", cwd: "/srv/repo" },
      },
    }),
    "utf8",
  );
  process.env.MCP_STDIO_CONFIG = configPath;

  const meta = resolveSessionMeta(new URL("http://localhost/mcp?server=repo"));
  t.deepEqual(meta, { server: "repo", cwd: "/srv/repo" });

  clearConfigCacheForTesting();
  if (prevConfig === undefined) delete process.env.MCP_STDIO_CONFIG;
  else process.env.MCP_STDIO_CONFIG = prevConfig;
  rmSync(dir, { recursive: true, force: true });
});
