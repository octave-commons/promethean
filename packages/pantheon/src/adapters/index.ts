/**
 * Pantheon Adapters Module
 * Exports all adapter implementations and factory functions
 */

// Re-export core adapters
export {
  type ContextAdapterDeps,
  type ToolAdapterDeps,
  type LlmAdapterDeps,
  type MessageBusAdapterDeps,
  type SchedulerAdapterDeps,
  type ActorStateAdapterDeps,
  
  makeContextAdapter,
  makeToolAdapter,
  makeLlmAdapter,
  makeMessageBusAdapter,
  makeSchedulerAdapter,
  makeActorStateAdapter,
  
  makeInMemoryContextAdapter,
  makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter,
} from '@promethean/pantheon-core';

// Import the functions we need for the composite factory
import {
  makeInMemoryContextAdapter,
  makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter,
} from '@promethean/pantheon-core';

// Composite adapter factory
export const makeCompletePantheonSystem = (options: {
  persistence?: any;
  openai?: any;
  mcp?: any;
  inMemory?: boolean;
}) => {
  const {
    persistence,
    openai,
    mcp,
    inMemory = false,
  } = options;

  // For now, only support in-memory adapters
  // External adapters will be added when their packages are complete
  const contextAdapter = inMemory ? makeInMemoryContextAdapter() : null;
  const toolAdapter = inMemory ? makeInMemoryToolAdapter() : null;
  const llmAdapter = inMemory ? makeInMemoryLlmAdapter() : null;
  const messageBusAdapter = inMemory ? makeInMemoryMessageBusAdapter() : null;
  const schedulerAdapter = inMemory ? makeInMemorySchedulerAdapter() : null;
  const actorStateAdapter = inMemory ? makeInMemoryActorStateAdapter() : null;

  return {
    context: contextAdapter,
    tools: toolAdapter,
    llm: llmAdapter,
    messageBus: messageBusAdapter,
    scheduler: schedulerAdapter,
    actorState: actorStateAdapter,
  };
};
};

// Re-export external adapters if available
export { makeOpenAIAdapter } from '@promethean/pantheon-llm-openai';
export { makeMCPToolAdapter, makeMCPAdapterWithDefaults } from '@promethean/pantheon-mcp';
export { makePantheonPersistenceAdapter } from '@promethean/pantheon-persistence';

// Composite adapter factory
export const makeCompletePantheonSystem = (options: {
  persistence?: any;
  openai?: any;
  mcp?: any;
  inMemory?: boolean;
}) => {
  const { persistence, openai, mcp, inMemory = false } = options;

  // Create adapters based on configuration
  const contextAdapter =
    persistence && makePantheonPersistenceAdapter
      ? makePantheonPersistenceAdapter(persistence)
      : inMemory
        ? makeInMemoryContextAdapter()
        : null;

  const toolAdapter =
    mcp && makeMCPAdapterWithDefaults
      ? makeMCPAdapterWithDefaults()
      : inMemory
        ? makeInMemoryToolAdapter()
        : null;

  const llmAdapter =
    openai && makeOpenAIAdapter
      ? makeOpenAIAdapter(openai)
      : inMemory
        ? makeInMemoryLlmAdapter()
        : null;

  const messageBusAdapter = inMemory ? makeInMemoryMessageBusAdapter() : null;
  const schedulerAdapter = inMemory ? makeInMemorySchedulerAdapter() : null;
  const actorStateAdapter = inMemory ? makeInMemoryActorStateAdapter() : null;

  return {
    context: contextAdapter,
    tools: toolAdapter,
    llm: llmAdapter,
    messageBus: messageBusAdapter,
    scheduler: schedulerAdapter,
    actorState: actorStateAdapter,
  };
};
