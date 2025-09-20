export type McpTransport =
  | { kind: "http-stream"; url: string }
  | { kind: "http-sse"; url: string }
  | { kind: "stdio"; command: string; args?: string[] };

export interface McpMount {
  serverId: string;
  transport: McpTransport;
  metadata?: Record<string, unknown>;
}

export interface McpClientHandlers {
  listTools?: () => Promise<unknown[]> | unknown[];
  callTool?: (request: {
    name: string;
    args: unknown;
    ttlMs: number;
  }) => Promise<McpToolInvocationResult> | McpToolInvocationResult;
}

export interface McpToolInvocationResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

/**
 * Lightweight client wrapper used by tests and the reference implementation.
 * Consumers can provide custom handlers to integrate with a real MCP bridge
 * while keeping the protocol dependency-free.
 */
export class McpClient {
  constructor(
    readonly mount: McpMount,
    private readonly handlers: McpClientHandlers = {},
  ) {}

  async listTools(): Promise<unknown[]> {
    if (this.handlers.listTools) {
      return await this.handlers.listTools();
    }
    return [];
  }

  async callTool(request: {
    name: string;
    args: unknown;
    ttlMs: number;
  }): Promise<McpToolInvocationResult> {
    if (this.handlers.callTool) {
      const response = await this.handlers.callTool(request);
      return response;
    }
    return {
      ok: false,
      error: `No handler registered for tool invocation ${request.name}`,
    };
  }
}
