import type { Tool, ToolFactory, ToolContext } from "./types.js";

export const buildRegistry = (
  factories: readonly ToolFactory[],
  ctx: ToolContext,
) => {
  const tools: readonly Tool[] = factories.map((f) => f(ctx));
  const byName = new Map(tools.map((t) => [t.spec.name, t]));
  return Object.freeze({
    list: () => tools,
    get: (name: string) => byName.get(name),
  });
};
