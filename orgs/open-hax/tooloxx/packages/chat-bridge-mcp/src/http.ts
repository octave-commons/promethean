import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

export interface NodeMcpRequest extends IncomingMessage {
  query: Record<string, string | undefined>;
}

export type UnknownSessionHandler = (
  sessionId: string,
  req: NodeMcpRequest,
  res: ServerResponse,
) => Promise<boolean>;

export interface McpHttpRouterOptions {
  readonly createServer: () => McpServer;
  readonly sessionIdGenerator?: () => string;
  readonly requireInitializeForNewSession?: boolean;
  readonly onUnknownSession?: UnknownSessionHandler;
}

export interface McpHttpRouter {
  readonly transports: Map<string, StreamableHTTPServerTransport>;
  handlePost: (req: NodeMcpRequest, res: ServerResponse, body: unknown) => Promise<void>;
  handleSession: (req: NodeMcpRequest, res: ServerResponse) => Promise<void>;
}

function resolveSessionId(req: NodeMcpRequest): string | undefined {
  const header = req.headers["mcp-session-id"];
  if (typeof header === "string" && header.length > 0) {
    return header;
  }

  const query = req.query.sessionId;
  return typeof query === "string" && query.length > 0 ? query : undefined;
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

function sendText(res: ServerResponse, statusCode: number, payload: string): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.end(payload);
}

export function createMcpHttpRouter(options: McpHttpRouterOptions): McpHttpRouter {
  const transports = new Map<string, StreamableHTTPServerTransport>();
  const sessionIdGenerator = options.sessionIdGenerator ?? randomUUID;
  const requireInitializeForNewSession = options.requireInitializeForNewSession ?? true;

  const createTransport = (): StreamableHTTPServerTransport => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator,
      onsessioninitialized: async (sessionId) => {
        transports.set(sessionId, transport);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        transports.delete(transport.sessionId);
      }
    };

    return transport;
  };

  const handlePost = async (req: NodeMcpRequest, res: ServerResponse, body: unknown): Promise<void> => {
    const sessionId = resolveSessionId(req);
    const existing = sessionId ? transports.get(sessionId) : undefined;
    if (existing) {
      await existing.handleRequest(req, res, body);
      return;
    }

    if (requireInitializeForNewSession && !isInitializeRequest(body)) {
      sendJson(res, 400, {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: Server not initialized" },
        id: null,
      });
      return;
    }

    const transport = createTransport();
    const server = options.createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  };

  const handleSession = async (req: NodeMcpRequest, res: ServerResponse): Promise<void> => {
    const sessionId = resolveSessionId(req);
    if (!sessionId) {
      sendText(res, 400, "Missing mcp-session-id");
      return;
    }

    const existing = transports.get(sessionId);
    if (existing) {
      await existing.handleRequest(req, res);
      return;
    }

    if (options.onUnknownSession) {
      const handled = await options.onUnknownSession(sessionId, req, res);
      if (handled) {
        return;
      }
    }

    sendText(res, 400, `Invalid mcp-session-id: ${sessionId}`);
  };

  return { transports, handlePost, handleSession };
}
