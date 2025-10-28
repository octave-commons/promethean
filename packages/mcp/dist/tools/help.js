import { z } from 'zod';
export const help = (ctx) => {
    const Schema = z
        .object({
        includeDeprecated: z.boolean().optional(),
    })
        .strict();
    const spec = {
        name: 'mcp_help',
        description: 'List available tools with args, defaults, outputs, and examples.',
        inputSchema: Schema.shape,
        outputSchema: {},
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const parsed = Schema.parse(raw ?? {});
        const includeDeprecated = parsed.includeDeprecated ?? false;
        const registry = ctx.listTools?.() ?? [];
        const tools = registry.reduce((entries, tool) => {
            const stability = tool.spec.stability ?? 'experimental';
            if (!includeDeprecated && stability === 'deprecated') {
                return entries;
            }
            const entry = {
                name: tool.spec.name,
                description: tool.spec.description,
                stability,
                since: tool.spec.since ?? null,
                inputSchema: tool.spec.inputSchema ?? null,
                outputSchema: tool.spec.outputSchema ?? null,
                examples: tool.spec.examples ?? [],
                notes: tool.spec.notes ?? '',
            };
            entries.push(entry);
            return entries;
        }, []);
        return { tools };
    };
    return { spec, invoke };
};
export const toolset = (ctx) => {
    const spec = {
        name: 'mcp_toolset',
        description: "Describe this endpoint's toolset: purpose, workflow, expectations, and tools.",
        inputSchema: {},
        outputSchema: undefined,
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async () => {
        const meta = ctx.__endpointDef?.meta ?? {};
        const path = ctx.__endpointDef?.path ?? '/mcp';
        const includeHelp = ctx.__endpointDef?.includeHelp;
        const list = ctx.__registryList?.() ?? [];
        const tools = list.map((t) => ({
            name: t.spec.name,
            description: t.spec.description,
        }));
        return { path, includeHelp, meta, tools };
    };
    return { spec, invoke };
};
export const endpoints = (ctx) => {
    const spec = {
        name: 'mcp_endpoints',
        description: 'List all configured endpoints with metadata and includeHelp flag.',
        inputSchema: {},
        outputSchema: undefined,
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async () => {
        const eps = ctx.__allEndpoints ?? [];
        return { endpoints: eps };
    };
    return { spec, invoke };
};
export default help;
//# sourceMappingURL=help.js.map