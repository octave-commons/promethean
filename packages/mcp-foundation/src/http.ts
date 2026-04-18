import { randomUUID } from "node:crypto";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

type TransportRequest = Parameters<StreamableHTTPServerTransport["handleRequest"]>[0];
type TransportResponse = Parameters<StreamableHTTPServerTransport["handleRequest"]>[1];
type HeaderValue = string | readonly string[] | undefined;

type McpHttpRequest = TransportRequest & {
  headers: Record<string, HeaderValue>;
  query: Record<string, unknown>;
  body?: unknown;
};

type McpHttpResponse = TransportResponse & {
  status: (code: number) => McpHttpResponse;
  json: (payload: unknown) => void;
  send: (payload: string) => void;
};

export type McpHttpRouterOptions = Readonly<{
  createServer: () => McpServer;
  sessionIdGenerator?: () => string;
  requireInitializeForNewSession?: boolean;
}>;

export type McpHttpRouter = Readonly<{
  handlePost: (req: McpHttpRequest, res: McpHttpResponse) => Promise<void>;
  handleSession: (req: McpHttpRequest, res: McpHttpResponse) => Promise<void>;
}>;

function resolveSessionId(req: McpHttpRequest): string | undefined {
  const headerSessionId = req.headers["mcp-session-id"];
  if (typeof headerSessionId === "string" && headerSessionId.length > 0) {
    return headerSessionId;
  }
  const querySessionId = req.query.sessionId;
  if (typeof querySessionId === "string" && querySessionId.length > 0) {
    return querySessionId;
  }
  return undefined;
}

export function createMcpHttpRouter(options: McpHttpRouterOptions): McpHttpRouter {
  const transports = new Map<string, StreamableHTTPServerTransport>();
  const requireInitializeForNewSession = options.requireInitializeForNewSession ?? true;
  const sessionIdGenerator = options.sessionIdGenerator ?? randomUUID;

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

  const handlePost = async (req: McpHttpRequest, res: McpHttpResponse): Promise<void> => {
    const sessionId = resolveSessionId(req);
    const existingTransport = sessionId ? transports.get(sessionId) : undefined;
    if (existingTransport) {
      await existingTransport.handleRequest(req, res, req.body);
      return;
    }

    if (requireInitializeForNewSession && !isInitializeRequest(req.body)) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: Server not initialized" },
        id: null,
      });
      return;
    }

    const transport = createTransport();
    const server = options.createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  };

  const handleSession = async (req: McpHttpRequest, res: McpHttpResponse): Promise<void> => {
    const sessionId = resolveSessionId(req);
    if (!sessionId) {
      res.status(400).send("Missing mcp-session-id");
      return;
    }
    const existingTransport = transports.get(sessionId);
    if (!existingTransport) {
      res.status(400).send(`Invalid mcp-session-id: ${sessionId}`);
      return;
    }
    await existingTransport.handleRequest(req, res);
  };

  return { handlePost, handleSession };
}
