import type { Tool, ToolFactory, ToolContext } from "./types.js";

export const buildRegistry = (
  factories: readonly ToolFactory[],
  ctx: ToolContext,
) => {
  const list = (): readonly Tool[] => tools;
  const ctxWithRegistry: ToolContext = {
    ...ctx,
    listTools: list,
  };
  const tools: readonly Tool[] = factories.map((f) => f(ctxWithRegistry));
  const byName = new Map(tools.map((t) => [t.spec.name, t]));
  return Object.freeze({
    list,
    get: (name: string) => byName.get(name),
  });
};
