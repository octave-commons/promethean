import { JSONRPCClient } from "json-rpc-2.0"; // or your minimal client

export interface McpMount {
  serverId: string;
  transport: {
    kind: "http-stream" | "http-sse" | "stdio";
    url?: string;
    command?: string;
    args?: string[];
  };
}
export class McpClient {
  constructor(readonly mount: McpMount) {}
  async listTools() {
    /* call tools/list; return descriptors */
  }
  async callTool(name: string, args: any, ttlMs: number) {
    /* tools/call with timeout; stream partials via callbacks */
  }
}
