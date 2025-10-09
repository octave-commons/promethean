// src/core/mcp-server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { Tool } from './types.js';
import { z, type ZodRawShape } from 'zod';
import { createRequire } from 'node:module';
const reqr = createRequire(import.meta.url);
console.log('[mcp:server] sdk.mcp path:', reqr.resolve('@modelcontextprotocol/sdk/server/mcp.js'));

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
  const server = new McpServer({ name: 'promethean-mcp', version: '0.1.0' });

  const toText = (value: unknown): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null) {
      return 'null';
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  for (const t of tools) {
    const def: ToolDef = {
      title: t.spec.name,
      description: t.spec.description,
      ...(t.spec.inputSchema ? { inputSchema: t.spec.inputSchema } : {}),
      ...(t.spec.outputSchema ? { outputSchema: t.spec.outputSchema } : {}),
    };

    // Wrap schemas in Zod objects before registration to prevent _parse errors
    const sdkDef = {
      ...def,
      ...(def.inputSchema
        ? { inputSchema: z.object(def.inputSchema).strict() }
        : {}),
      ...(def.outputSchema
        ? { outputSchema: z.object(def.outputSchema).strict() }
        : {}),
    };

    server.registerTool(t.spec.name, sdkDef as any, async (args: unknown): Promise<CallToolResult> => {
      const result = await t.invoke(args);
      const hasStructuredOutput = Boolean(t.spec.outputSchema);

      if (hasStructuredOutput) {
        const text = toText(result);
        const content = text.length > 0 ? [{ type: 'text', text }] : [];
        // Always include structuredContent when outputSchema is declared
        // This prevents the -32602 error about missing structured content
        return {
          content,
          structuredContent: result as unknown,
        } as CallToolResult;
      }

      const text = toText(result);
      // Return a content union member the SDK definitely accepts
      return { content: [{ type: 'text', text }] } as CallToolResult;
    });
  }

  return server;
};
