import { randomUUID } from "crypto";

import { WebSocketServer } from "ws";

import { attachRouter } from "./router.js";
import { authorize } from "./auth.js";
import { trackSession } from "./metrics.js";
import { getServerSpec } from "./config.js";

export function resolveSessionMeta(url: URL) {
  const serverName = url.searchParams.get("server") || undefined;
  const spec = serverName ? getServerSpec(serverName) : undefined;
  const meta: { server?: string; cwd?: string } = {};
  if (serverName) meta.server = serverName;
  if (spec?.cwd) meta.cwd = spec.cwd;
  return meta;
}

export function createWsServer(server: any) {
  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req: any, socket: any, head: any) => {
    if (req.url !== "/mcp") return;
    const url = new URL(req.url, "http://localhost");
    const token =
      req.headers["authorization"]?.replace("Bearer ", "") ||
      url.searchParams.get("token");
    const origin = req.headers["origin"];
    const meta = resolveSessionMeta(url);
    if (!authorize(token, origin)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws: import("ws").WebSocket) => {
      const sessionId = randomUUID();
      trackSession(1);
      attachRouter(ws, sessionId, meta);
      ws.on("close", () => trackSession(-1));
    });
  });
  return wss;
}
