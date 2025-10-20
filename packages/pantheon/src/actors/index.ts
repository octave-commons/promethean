/**
 * Pantheon Actors Module
 * Exports all actor implementations and factory functions
 */

import type {
  ActorScript,
  Behavior,
  Talent,
  Action,
  Message,
  ContextSource,
} from '@promethean/pantheon-core';

// === LLM Actor Implementation ===

export type LLMActorConfig = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export const createLLMActor = (
  name: string,
  config: LLMActorConfig,
  contextSources: ContextSource[] = [],
): ActorScript => {
  const { model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 1000, systemPrompt } = config;

  const llmBehavior: Behavior = {
    name: 'llm-response',
    mode: 'active',
    description: 'Generate responses using LLM based on context and goals',
    plan: async ({ goal, context }) => {
      // Prepare messages for LLM
      const messages: Message[] = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      // Add context messages
      messages.push(...context);

      // Add goal as user message if not already in context
      if (!context.some((msg) => msg.content.includes(goal))) {
        messages.push({ role: 'user', content: goal });
      }

      // Create action to invoke LLM
      const actions: Action[] = [
        {
          type: 'tool',
          name: 'llm_complete',
          args: {
            messages,
            model,
            temperature,
            maxTokens,
          },
        },
      ];

      return { actions };
    },
  };

  const llmTalent: Talent = {
    name: 'llm-reasoning',
    behaviors: [llmBehavior],
    description: 'LLM-based reasoning and response generation',
  };

  return {
    name,
    contextSources,
    talents: [llmTalent],
    description: `LLM Actor using model ${model}`,
    config: { model, temperature, maxTokens, systemPrompt },
  };
};

// === Tool Actor Implementation ===

export type ToolActorConfig = {
  tools: Array<{
    name: string;
    description: string;
    handler: (args: any) => Promise<any>;
  }>;
  maxToolCalls?: number;
};

export const createToolActor = (
  name: string,
  config: ToolActorConfig,
  contextSources: ContextSource[] = [],
): ActorScript => {
  const { tools, maxToolCalls = 5 } = config;

  const toolBehavior: Behavior = {
    name: 'tool-execution',
    mode: 'active',
    description: 'Execute tools based on context and goals',
    plan: async ({ goal, context }) => {
      const actions: Action[] = [];
      let toolCalls = 0;

      // Simple tool selection logic - in a real implementation,
      // this would use LLM to determine which tools to use
      for (const tool of tools) {
        if (toolCalls >= maxToolCalls) break;

        // Check if tool is relevant to goal (simple keyword matching)
        if (
          goal.toLowerCase().includes(tool.name.toLowerCase()) ||
          context.some((msg) => msg.content.toLowerCase().includes(tool.name.toLowerCase()))
        ) {
          actions.push({
            type: 'tool',
            name: tool.name,
            args: { goal, context: context.map((msg) => msg.content) },
          });

          toolCalls++;
        }
      }

      return { actions };
    },
  };

  const toolTalent: Talent = {
    name: 'tool-execution',
    behaviors: [toolBehavior],
    description: 'Tool execution capabilities',
  };

  return {
    name,
    contextSources,
    talents: [toolTalent],
    description: `Tool Actor with ${tools.length} tools available`,
    config: { toolCount: tools.length, maxToolCalls },
  };
};

// === Composite Actor Implementation ===

export type CompositeActorConfig = {
  subActors: ActorScript[];
  coordinationMode?: 'sequential' | 'parallel' | 'conditional';
};

export const createCompositeActor = (
  name: string,
  config: CompositeActorConfig,
  contextSources: ContextSource[] = [],
): ActorScript => {
  const { subActors, coordinationMode = 'sequential' } = config;

  const coordinationBehavior: Behavior = {
    name: 'coordination',
    mode: 'persistent',
    description: 'Coordinate execution of sub-actors',
    plan: async ({ goal }) => {
      const actions: Action[] = [];

      switch (coordinationMode) {
        case 'sequential':
          // Execute sub-actors one after another
          for (const subActor of subActors) {
            actions.push({
              type: 'spawn',
              actor: subActor,
              goal: `${goal} (as ${subActor.name})`,
              config: { parentActor: name },
            });

            // Wait between spawns to allow for completion
            actions.push({
              type: 'wait',
              duration: 1000,
              reason: 'Wait for sub-actor execution',
            });
          }
          break;

        case 'parallel':
          // Spawn all sub-actors simultaneously
          for (const subActor of subActors) {
            actions.push({
              type: 'spawn',
              actor: subActor,
              goal: `${goal} (as ${subActor.name})`,
              config: { parentActor: name, parallel: true },
            });
          }
          break;

        case 'conditional':
          // Simple conditional logic based on goal content
          const relevantActor = subActors.find((actor) =>
            goal.toLowerCase().includes(actor.name.toLowerCase()),
          );

          if (relevantActor) {
            actions.push({
              type: 'spawn',
              actor: relevantActor,
              goal: `${goal} (as ${relevantActor.name})`,
              config: { parentActor: name },
            });
          } else if (subActors.length > 0) {
            // Default to first actor if no match
            actions.push({
              type: 'spawn',
              actor: subActors[0],
              goal: `${goal} (as ${subActors[0].name})`,
              config: { parentActor: name },
            });
          }
          break;
      }

      return { actions };
    },
  };

  const coordinationTalent: Talent = {
    name: 'coordination',
    behaviors: [coordinationBehavior],
    description: `Actor coordination in ${coordinationMode} mode`,
  };

  return {
    name,
    contextSources,
    talents: [coordinationTalent],
    description: `Composite Actor coordinating ${subActors.length} sub-actors`,
    config: { subActorCount: subActors.length, coordinationMode },
  };
};

// === Utility Functions ===

export const createActorFromTemplate = (
  template: 'llm' | 'tool' | 'composite',
  name: string,
  config: any,
  contextSources: ContextSource[] = [],
): ActorScript => {
  switch (template) {
    case 'llm':
      return createLLMActor(name, config as LLMActorConfig, contextSources);
    case 'tool':
      return createToolActor(name, config as ToolActorConfig, contextSources);
    case 'composite':
      return createCompositeActor(name, config as CompositeActorConfig, contextSources);
    default:
      throw new Error(`Unknown actor template: ${template}`);
  }
};

export const validateActorScript = (script: ActorScript): boolean => {
  return !!(
    script.name &&
    script.talents &&
    script.talents.length > 0 &&
    script.talents.every((talent) => talent.name && talent.behaviors && talent.behaviors.length > 0)
  );
};
