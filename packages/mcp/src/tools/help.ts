import type { ToolFactory } from "../core/types.js";

export const help: ToolFactory = (ctx) => {
  const spec = {
    name: "mcp.help",
    description: "List available tools with args, defaults, outputs, and examples.",
    inputSchema: {},
    outputSchema: { tools: { } } as any,
  } as const;

  const invoke = async () => {
    const list = (ctx as any).__registryList?.() ?? [];
    const tools = list.map((t): any => ({
      name: t.spec.name,
      description: t.spec.description,
      inputSchema: t.spec.inputSchema || null,
      outputSchema: t.spec.outputSchema || null,
      examples: t.spec.examples || [],
      notes: t.spec.notes || "",
    }));
    return { tools };
  };

  return { spec, invoke };
};

export default help;
