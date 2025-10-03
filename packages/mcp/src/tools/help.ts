import type { ToolExample, ToolFactory, ToolSpec } from "../core/types.js";

type HelpToolEntry = Readonly<{
  name: string;
  description: string;
  inputSchema: ToolSpec["inputSchema"] | null;
  outputSchema: ToolSpec["outputSchema"] | null;
  examples: ReadonlyArray<ToolExample>;
  notes: string;
}>;

export const help: ToolFactory = (ctx) => {
  const spec = {
    name: "mcp.help",
    description:
      "List available tools with args, defaults, outputs, and examples.",
    inputSchema: {},
    outputSchema: {},
  } as const;

  const invoke = async () => {
    const registry = ctx.listTools?.() ?? [];
    const tools: readonly HelpToolEntry[] = registry.map((tool) => ({
      name: tool.spec.name,
      description: tool.spec.description,
      inputSchema: tool.spec.inputSchema ?? null,
      outputSchema: tool.spec.outputSchema ?? null,
      examples: tool.spec.examples ?? [],
      notes: tool.spec.notes ?? "",
    }));
    return { tools };
  };

  return { spec, invoke };
};

export const toolset: ToolFactory = (ctx) => {
  const spec = {
    name: "mcp.toolset",
    description: "Describe this endpoint's toolset: purpose, workflow, expectations, and tools.",
    inputSchema: {},
    outputSchema: { meta: {}, path: "", includeHelp: true, tools: [] } as any,
  } as const;

  const invoke = async () => {
    const meta = (ctx as any).__endpointDef?.meta ?? {};
    const path = (ctx as any).__endpointDef?.path ?? "/mcp";
    const includeHelp = (ctx as any).__endpointDef?.includeHelp;
    const list = (ctx as any).__registryList?.() ?? [];
    const tools = list.map((t: any) => ({ name: t.spec.name, description: t.spec.description }));
    return { path, includeHelp, meta, tools };
  };

  return { spec, invoke };
};

export const endpoints: ToolFactory = (ctx) => {
  const spec = {
    name: "mcp.endpoints",
    description: "List all configured endpoints with metadata and includeHelp flag.",
    inputSchema: {},
    outputSchema: { endpoints: [] } as any,
  } as const;

  const invoke = async () => {
    const eps = (ctx as any).__allEndpoints ?? [];
    return { endpoints: eps };
  };

  return { spec, invoke };
};

export default help;
