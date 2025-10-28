/**
 * Create LLM Actor Action
 * Creates an actor script with LLM-based reasoning capabilities
 */

import type {
  ActorScript,
  Behavior,
  Talent,
  Action,
  Message,
  ContextSource,
} from '@promethean-os/pantheon-core';

export type LLMActorConfig = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export type CreateLLMActorInput = {
  name: string;
  config: LLMActorConfig;
  contextSources?: ContextSource[];
};

export type CreateLLMActorScope = {
  // No external dependencies needed for this action
};

const createLLMBehavior = (config: LLMActorConfig): Behavior => {
  const { model = 'gpt-5-nano', temperature = 0.7, maxTokens = 1000, systemPrompt } = config;

  return {
    name: 'llm-response',
    mode: 'active',
    description: 'Generate responses using LLM based on context and goals',
    plan: async ({ goal, context }) => {
      const messages = prepareLLMMessages(goal, context as readonly Message[], systemPrompt);
      const actions = createLLMAction(messages, { model, temperature, maxTokens });

      return { actions };
    },
  };
};

const prepareLLMMessages = (
  goal: string,
  context: Message[],
  systemPrompt?: string,
): readonly Message[] => {
  const baseMessages = systemPrompt
    ? [{ role: 'system' as const, content: systemPrompt } as Message]
    : [];

  const userMessage = !context.some((msg) => msg.content.includes(goal))
    ? [{ role: 'user' as const, content: goal } as Message]
    : [];

  return [...baseMessages, ...context, ...userMessage];
};

const createLLMAction = (
  messages: readonly Message[],
  config: { model: string; temperature: number; maxTokens: number },
): readonly Action[] => [
  {
    type: 'tool',
    name: 'llm_complete',
    args: {
      messages,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    },
  },
];

const createLLMTalent = (config: LLMActorConfig): Talent => {
  const behavior = createLLMBehavior(config);

  return {
    name: 'llm-reasoning',
    behaviors: [behavior],
    description: 'LLM-based reasoning and response generation',
  };
};

export const createLLMActor = (
  input: CreateLLMActorInput,
  _scope: CreateLLMActorScope,
): ActorScript => {
  const { name, config, contextSources = [] } = input;
  const { model = 'gpt-5-nano', temperature = 0.7, maxTokens = 1000, systemPrompt } = config;

  const talent = createLLMTalent(config);

  return {
    name,
    contextSources,
    talents: [talent],
    description: `LLM Actor using model ${model}`,
    config: { model, temperature, maxTokens, systemPrompt },
  };
};
