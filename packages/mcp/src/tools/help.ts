import { z } from 'zod';

import type { ToolExample, ToolFactory, ToolSpec } from '../core/types.js';

type HelpToolEntry = Readonly<{
  name: string;
  description: string;
  stability: NonNullable<ToolSpec['stability']>;
  since: string | null;
  inputSchema: ToolSpec['inputSchema'] | null;
  outputSchema: ToolSpec['outputSchema'] | null;
  examples: ReadonlyArray<ToolExample>;
  notes: string;
}>;

export const help: ToolFactory = (ctx) => {
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
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const parsed = Schema.parse(raw ?? {});
    const includeDeprecated = parsed.includeDeprecated ?? false;

    const registry = ctx.listTools?.() ?? [];
    const tools: readonly HelpToolEntry[] = registry.reduce<HelpToolEntry[]>((entries, tool) => {
      const stability = tool.spec.stability ?? 'experimental';
      if (!includeDeprecated && stability === 'deprecated') {
        return entries;
      }

      const entry: HelpToolEntry = {
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

export const toolset: ToolFactory = (ctx) => {
  const spec = {
    name: 'mcp_toolset',
    description: "Describe this endpoint's toolset: purpose, workflow, expectations, and tools.",
    inputSchema: {},
    outputSchema: undefined,
    stability: 'stable',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async () => {
    const meta = (ctx as any).__endpointDef?.meta ?? {};
    const path = (ctx as any).__endpointDef?.path ?? '/mcp';
    const includeHelp = (ctx as any).__endpointDef?.includeHelp;
    const list = (ctx as any).__registryList?.() ?? [];
    const tools = list.map((t: any) => ({
      name: t.spec.name,
      description: t.spec.description,
    }));
    return { path, includeHelp, meta, tools };
  };

  return { spec, invoke };
};

export const endpoints: ToolFactory = (ctx) => {
  const spec = {
    name: 'mcp_endpoints',
    description: 'List all configured endpoints with metadata and includeHelp flag.',
    inputSchema: {},
    outputSchema: undefined,
    stability: 'stable',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async () => {
    const eps = (ctx as any).__allEndpoints ?? [];
    return { endpoints: eps };
  };

  return { spec, invoke };
};

export default help;
