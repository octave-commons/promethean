// src/core/mcp-server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createRequire } from 'node:module';
const reqr = createRequire(import.meta.url);
console.log('[mcp:server] sdk.mcp path:', reqr.resolve('@modelcontextprotocol/sdk/server/mcp.js'));
export const createMcpServer = (tools) => {
    const server = new McpServer({ name: 'promethean-mcp', version: '0.1.0' });
    const toText = (value) => {
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
        }
        catch {
            return String(value);
        }
    };
    for (const t of tools) {
        const def = {
            title: t.spec.name,
            description: t.spec.description,
            ...(t.spec.inputSchema ? { inputSchema: t.spec.inputSchema } : {}),
            ...(t.spec.outputSchema ? { outputSchema: t.spec.outputSchema } : {}),
        };
        // Pass schemas through as-is to prevent _parse errors
        // The SDK handles ZodRawShape properly when passed directly
        const sdkDef = {
            ...def,
            inputSchema: def.inputSchema ?? undefined,
            outputSchema: def.outputSchema ?? undefined,
        };
        server.registerTool(t.spec.name, sdkDef, async (args) => {
            const result = await t.invoke(args);
            const hasStructuredOutput = Boolean(t.spec.outputSchema);
            if (hasStructuredOutput) {
                const text = toText(result);
                const content = text.length > 0 ? [{ type: 'text', text }] : [];
                // Always include structuredContent when outputSchema is declared
                // This prevents the -32602 error about missing structured content
                const structuredContent = result ?? null;
                return {
                    content,
                    structuredContent,
                };
            }
            const text = toText(result);
            // Return a content union member the SDK definitely accepts
            return { content: [{ type: 'text', text }] };
        });
    }
    return server;
};
//# sourceMappingURL=mcp-server.js.map