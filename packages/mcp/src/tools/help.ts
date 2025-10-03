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

export default help;
