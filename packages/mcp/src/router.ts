import type { WebSocket, RawData } from "ws";
import { v4 as uuidv4 } from "uuid";

import { createBridge, BridgeMessage } from "./bridge.js";
import { tools } from "./tools/index.js";
import { createSender } from "./backpressure.js";
import { trackCall } from "./metrics.js";

type Pending = {
  resolve: (result: any) => void;
  reject: (err: any) => void;
};

type SessionMeta = {
  server?: string;
  cwd?: string;
};

function buildContext(sessionId: string, meta: SessionMeta) {
  const ctx: Record<string, string> = { sessionId };
  if (meta.server) ctx.server = meta.server;
  if (meta.cwd) ctx.cwd = meta.cwd;
  return ctx;
}

export function attachRouter(
  ws: WebSocket,
  sessionId: string,
  meta: SessionMeta = {},
) {
  const bridge = createBridge();
  const send = createSender(ws, Number(process.env.MCP_MAX_BUFFER || 1 << 20));
  const pending = new Map<string, Pending>();

  bridge.on("message", (msg: BridgeMessage) => {
    const id = msg.id;
    if (msg.kind === "tool.chunk") {
      send({
        jsonrpc: "2.0",
        method: "tools/progress",
        params: { id, data: msg.data },
      });
    } else if (msg.kind === "tool.result") {
      pending.get(id)?.resolve(msg.result);
      pending.delete(id);
      send({ jsonrpc: "2.0", id, result: msg.result });
    } else if (msg.kind === "tool.error") {
      pending.get(id)?.reject(msg.error);
      pending.delete(id);
      send({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: msg.error || "Tool error" },
      });
    }
  });

  ws.on("message", async (data: RawData) => {
    let msg: any;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    const { id, method, params } = msg;
    if (method === "initialize") {
      send({ jsonrpc: "2.0", id, result: { capabilities: { tools } } });
      return;
    }
    if (method === "tools/call") {
      trackCall();
      const callId = String(id ?? uuidv4());
      pending.set(callId, {
        resolve: () => {},
        reject: () => {},
      });
      bridge.send({
        kind: "tool.call",
        id: callId,
        tool: params.name,
        args: params.arguments,
        ctx: buildContext(sessionId, meta),
      });
      return;
    }
    if (method === "tools/cancel") {
      const target = String(params.id);
      bridge.send({ kind: "tool.cancel", id: target });
      pending.delete(target);
      send({ jsonrpc: "2.0", id, result: { cancelled: true } });
      return;
    }
    if (method === "resources/read") {
      send({ jsonrpc: "2.0", id, result: null });
      return;
    }
  });

  ws.on("close", () => {
    bridge.removeAllListeners("message");
    bridge.close();
  });
}
