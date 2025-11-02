/**
 * Create Tool Actor Action
 * Creates an actor script with tool execution capabilities
 */

import type {
  ActorScript,
  Behavior,
  Talent,
  Action,
  Message,
  ContextSource,
} from '@promethean-os/pantheon-core';

export type ToolConfig = {
  name: string;
  description: string;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
};

export type ToolActorConfig = {
  tools: ToolConfig[];
  maxToolCalls?: number;
};

export type CreateToolActorInput = {
  name: string;
  config: ToolActorConfig;
  contextSources?: ContextSource[];
};

export type CreateToolActorScope = {
  // No external dependencies needed for this action
};

const isToolRelevantToGoal = (
  goal: string,
  context: readonly Message[],
  tool: ToolConfig,
): boolean => {
  const goalLower = goal.toLowerCase();
  const toolNameLower = tool.name.toLowerCase();

  const goalMatches = goalLower.includes(toolNameLower);
  const contextMatches = context.some((msg) => msg.content.toLowerCase().includes(toolNameLower));

  return goalMatches || contextMatches;
};

const createToolActions = (
  goal: string,
  context: readonly Message[],
  tools: ToolConfig[],
  maxToolCalls: number,
): Action[] => {
  return tools
    .filter((tool) => isToolRelevantToGoal(goal, context, tool))
    .slice(0, maxToolCalls)
    .map((tool) => ({
      type: 'tool' as const,
      name: tool.name,
      args: {
        goal,
        context: context.map((msg) => msg.content),
      },
    }));
};

const createToolBehavior = (config: ToolActorConfig): Behavior => {
  const { tools, maxToolCalls = 5 } = config;

  return {
    name: 'tool-execution',
    mode: 'active',
    description: 'Execute tools based on context and goals',
    plan: async ({ goal, context }) => {
      const actions = createToolActions(goal, context, tools, maxToolCalls);
      return { actions };
    },
  };
};

const createToolTalent = (config: ToolActorConfig): Talent => {
  const behavior = createToolBehavior(config);

  return {
    name: 'tool-execution',
    behaviors: [behavior],
    description: 'Tool execution capabilities',
  };
};

export const createToolActor = (
  input: CreateToolActorInput,
  _scope: CreateToolActorScope,
): ActorScript => {
  const { name, config, contextSources = [] } = input;
  const { tools, maxToolCalls = 5 } = config;

  const talent = createToolTalent(config);

  return {
    name,
    contextSources,
    talents: [talent],
    description: `Tool Actor with ${tools.length} tools`,
    config: { tools, maxToolCalls },
  };
};
