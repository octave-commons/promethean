// Thin wrapper; plug into @modelcontextprotocol/sdk server per SDK docs.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Tool } from "./types.js";

export const createMcpServer = (tools: readonly Tool[]) => {
  const server = new Server({ name: "promethean-mcp", version: "0.1.0" });

  for (const t of tools) {
    server.tool(t.spec.name, {
      description: t.spec.description,
      inputSchema: t.spec.inputSchema,
    }, async (args: unknown) => t.invoke(args as any));
  }
  return server;
};
