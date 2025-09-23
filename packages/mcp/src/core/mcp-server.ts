// src/core/mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Tool } from "./types.js";
import type { ZodRawShape } from "zod";
import { createRequire } from "node:module";
const reqr = createRequire(import.meta.url);
console.log(
  "[mcp:server] sdk.mcp path:",
  reqr.resolve("@modelcontextprotocol/sdk/server/mcp.js"),
);

type ToolDef = {
  title?: string;
  description?: string;
  inputSchema?: ZodRawShape;
  outputSchema?: ZodRawShape;
  annotations?: {
    [x: string]: unknown;
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
};

export const createMcpServer = (tools: readonly Tool[]) => {
  const server = new McpServer({ name: "promethean-mcp", version: "0.1.0" });

  for (const t of tools) {
    const def: ToolDef = {
      title: t.spec.name,
      description: t.spec.description,
      ...(t.spec.inputSchema ? { inputSchema: t.spec.inputSchema } : {}),
      ...(t.spec.outputSchema ? { outputSchema: t.spec.outputSchema } : {}),
    };

    server.registerTool(t.spec.name, def, async (args: unknown) => {
      const result = await t.invoke(args);
      const text =
        typeof result === "string" ? result : JSON.stringify(result, null, 2);
      // Return a content union member the SDK definitely accepts
      return { content: [{ type: "text", text }] };
    });
  }

  return server;
};
