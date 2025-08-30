import test from "ava";
import WebSocket, { WebSocketServer, RawData } from "ws";
import { startServer } from "../src/index.js";
import { once } from "events";
import type { AddressInfo } from "net";

async function createMockBridge() {
  const wss = new WebSocketServer({ port: 0 });
  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (data: RawData) => {
      const msg = JSON.parse(data.toString());
      if (msg.kind === "tool.call") {
        ws.send(
          JSON.stringify({ kind: "tool.result", id: msg.id, result: [] }),
        );
      }
    });
  });
  await once(wss, "listening");
  const port = (wss.address() as AddressInfo).port;
  return { wss, port };
}

test("initialize advertises search.query tool", async (t) => {
  const bridge = await createMockBridge();
  process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridge.port}`;
  const server = await startServer({ port: 0 });
  const client = new WebSocket(`ws://localhost:${server.port}/mcp`);
  await once(client, "open");
  client.send(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }));
  const [raw] = await once(client, "message");
  const msg = JSON.parse(raw.toString());
  t.is(msg.result.capabilities.tools[0].name, "search.query");
  t.truthy(msg.result.capabilities.tools[0].inputSchema);
  const closed = once(client, "close");
  client.close();
  await closed;
  await server.close();
  await new Promise((res) => bridge.wss.close(res));
});
