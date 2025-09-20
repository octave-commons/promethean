import Fastify from "fastify";
import type { Transport } from "../types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import crypto from "node:crypto";

export const fastifyTransport = (opts?: {
  port?: number;
  host?: string;
}): Transport => {
  const port = opts?.port ?? Number(process.env.PORT ?? 3210);
  const host = opts?.host ?? process.env.HOST ?? "0.0.0.0";
  const app = Fastify({ logger: false });

  // Minimal parsers: keep request body as Buffer or object exactly as sent
  app.removeAllContentTypeParsers();
  app.addContentTypeParser(
    ["application/json", "application/*+json"],
    { parseAs: "buffer" },
    (_req, payload, done) => done(null, payload),
  );
  app.addContentTypeParser("*", { parseAs: "buffer" }, (_req, payload, done) =>
    done(null, payload),
  );

  app.get("/healthz", (_req, rep) => rep.send({ ok: true }));
  // If you previously had GET /mcp, remove it: Fastify will throw FST_ERR_DUPLICATED_ROUTE on restarts

  let srv: McpServer | undefined;

  // Active session transports
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Helper: parse a Buffer/JSON body into unknown
  const parseBody = (b: unknown): unknown => {
    if (Buffer.isBuffer(b)) {
      try {
        return JSON.parse(b.toString("utf8"));
      } catch {
        return undefined;
      }
    }
    return b;
  };

  app.post("/mcp", async (req: any, reply: any) => {
    // We hand raw sockets to the SDK transport
    reply.hijack();
    const rawReq = req.raw;
    const rawRes = reply.raw;

    // Spec: client must accept both JSON and event-stream
    const accept = String(rawReq.headers["accept"] || "");
    if (
      !(
        accept.includes("application/json") &&
        accept.includes("text/event-stream")
      )
    ) {
      rawReq.headers["accept"] = "application/json, text/event-stream";
    }

    try {
      if (!srv) throw new Error("MCP server not bound");

      const body = parseBody(req.body);
      const sidHeader = rawReq.headers["mcp-session-id"] as string | undefined;

      let transport: StreamableHTTPServerTransport | undefined;

      if (sidHeader) {
        // Reuse existing transport for this session
        transport = transports.get(sidHeader);
        if (!transport) {
          rawRes.writeHead(400).end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: "Bad Request: No valid session ID provided",
              },
              id: null,
            }),
          );
          return;
        }
      } else if (body && isInitializeRequest(body)) {
        // *** New session: predeclare a variable to break self-reference ***
        let self: StreamableHTTPServerTransport;

        const t: StreamableHTTPServerTransport =
          new StreamableHTTPServerTransport({
            sessionIdGenerator: crypto.randomUUID?.bind(crypto),
            onsessioninitialized: (sid: string): void => {
              transports.set(sid, self);
            },
          });

        t.onclose = () => {
          if (t.sessionId) transports.delete(t.sessionId);
        };

        self = t; // set after create to satisfy TS
        transport = t;

        // Connect server to this transport exactly once (on first initialize)
        await srv.connect(transport);
      } else {
        rawRes.writeHead(400).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Bad Request: No valid session ID provided",
            },
            id: null,
          }),
        );
        return;
      }

      // Hand off to SDK (it will set Mcp-Session-Id on initialize responses)
      await transport.handleRequest(rawReq, rawRes, body);
    } catch (e: any) {
      if (!rawRes.headersSent) {
        rawRes.writeHead(400).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32700,
              message: "Parse error",
              data: String(e?.message ?? e),
            },
            id: null,
          }),
        );
      }
    }
  });

  return {
    start: async (server?: unknown) => {
      if (server) {
        srv = server as McpServer;
        console.log("[mcp:http] server bound");
      }
      await app.listen({ port, host } as any);
      console.log(`[mcp:http] listening on http://${host}:${port}`);
    },
    stop: async () => app.close(),
  };
};
