import "dotenv/config";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { createDefaultIrcConfig, IrcChatAdapter } from "./irc/adapter.js";
import { createMcpHttpRouter, type NodeMcpRequest } from "./http.js";
import { createChatBridgeMcpServer } from "./server.js";
import { ChatBridgeService } from "./service.js";

const PORT = Number.parseInt(process.env.PORT || process.env.CHAT_BRIDGE_MCP_PORT || "4071", 10);

function parseQuery(req: IncomingMessage): Record<string, string | undefined> {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  return Object.fromEntries(url.searchParams.entries());
}

function withCors(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type,mcp-session-id");
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text.length > 0 ? JSON.parse(text) : undefined;
}

export function startServer(port = PORT): void {
  const ircConfig = createDefaultIrcConfig(process.env);
  const ircAdapter = new IrcChatAdapter(ircConfig);
  const service = new ChatBridgeService(ircAdapter);
  const mcpRouter = createMcpHttpRouter({
    createServer: () => createChatBridgeMcpServer(service),
  });

  const server = createServer(async (req, res) => {
    withCors(res);
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const request = Object.assign(req, { query: parseQuery(req) }) as NodeMcpRequest;

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      try {
        const [conversation] = await service.listConversations({ platform: "irc", limit: 1 });
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ ok: true, conversation }));
      } catch (error) {
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
      }
      return;
    }

    if (url.pathname !== "/mcp") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      await mcpRouter.handlePost(request, res, body);
      return;
    }

    if (req.method === "GET" || req.method === "DELETE") {
      await mcpRouter.handleSession(request, res);
      return;
    }

    res.statusCode = 405;
    res.end("method not allowed");
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[chat-bridge-mcp] listening on ${port}`);
    console.log(`[chat-bridge-mcp] IRC target ${ircConfig.host} ${ircConfig.channel}`);
  });

  const shutdown = async (): Promise<void> => {
    await ircAdapter.close().catch(() => undefined);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => { void shutdown(); });
  process.on("SIGTERM", () => { void shutdown(); });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
