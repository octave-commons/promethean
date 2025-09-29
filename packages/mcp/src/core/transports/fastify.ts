import Fastify from "fastify";
import type { Transport } from "../types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import crypto from "node:crypto";
import { createSessionIdGenerator } from "./session-id.js";

type ServerEntries = ReadonlyArray<readonly [string, McpServer]>;

const toEntries = (input: unknown): ServerEntries => {
  if (!input) return [];
  if (input instanceof Map) {
    return Array.from(input.entries());
  }
  if (
    typeof input === "object" &&
    input !== null &&
    "connect" in (input as Record<string, unknown>) &&
    typeof (input as Record<string, unknown>)["connect"] === "function"
  ) {
    return [["/mcp", input as McpServer]];
  }
  if (typeof input === "object" && input !== null) {
    return Object.entries(input as Record<string, McpServer>);
  }
  return [["/mcp", input as McpServer]];
};

const normalizePath = (p: string): string => (p.startsWith("/") ? p : `/${p}`);

const createRouteHandler = (
  server: McpServer,
  sessions: Map<string, StreamableHTTPServerTransport>,
) => {
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

  return async function handler(req: any, reply: any) {
    reply.hijack();
    const rawReq = req.raw;
    const rawRes = reply.raw;

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
      const body = parseBody(req.body);
      const sidHeader = rawReq.headers["mcp-session-id"] as string | undefined;

      let transport: StreamableHTTPServerTransport | undefined;

      if (sidHeader) {
        transport = sessions.get(sidHeader);
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
        let self: StreamableHTTPServerTransport;

        const t: StreamableHTTPServerTransport =
          new StreamableHTTPServerTransport({
            sessionIdGenerator: createSessionIdGenerator(crypto),
            onsessioninitialized: (sid: string): void => {
              sessions.set(sid, self);
            },
          });

        t.onclose = () => {
          if (t.sessionId) sessions.delete(t.sessionId);
        };

        self = t;
        transport = t;
        await server.connect(transport);
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
  };
};

export const fastifyTransport = (opts?: {
  port?: number;
  host?: string;
}): Transport => {
  const port = opts?.port ?? Number(process.env.PORT ?? 3210);
  const host = opts?.host ?? process.env.HOST ?? "0.0.0.0";
  const app = Fastify({ logger: false });

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

  const sessionStores = new Map<
    string,
    Map<string, StreamableHTTPServerTransport>
  >();

  return {
    start: async (server?: unknown) => {
      const entries = toEntries(server);
      if (entries.length === 0) {
        throw new Error("fastifyTransport requires at least one MCP server");
      }

      for (const [route, srv] of entries) {
        const normalized = normalizePath(route);
        if (sessionStores.has(normalized)) {
          throw new Error(`Duplicate MCP endpoint path: ${normalized}`);
        }

        const sessions = new Map<string, StreamableHTTPServerTransport>();
        sessionStores.set(normalized, sessions);
        app.post(normalized, createRouteHandler(srv, sessions));
        console.log(`[mcp:http] bound endpoint ${normalized}`);
      }

      await app.listen({ port, host } as any);
      console.log(`[mcp:http] listening on http://${host}:${port}`);
    },
    stop: async () => app.close(),
  };
};
