import type { Tool, ToolFactory, ToolContext } from './types.js';
import { applyAuthorization } from './authorization.js';

export const buildRegistry = (
  factories: readonly ToolFactory[],
  ctx: ToolContext,
  toolNames?: readonly string[],
) => {
  const list = (): readonly Tool[] => tools;
  const ctxWithRegistry: ToolContext = {
    ...ctx,
    listTools: list,
  };

  // Apply authorization if tool names are provided
  const authorizedFactories = toolNames ? applyAuthorization(factories, toolNames) : factories;

  const tools: readonly Tool[] = authorizedFactories.map((f) => f(ctxWithRegistry));
  const byName = new Map(tools.map((t) => [t.spec.name, t]));
  return Object.freeze({
    list,
    get: (name: string) => byName.get(name),
  });
};
