/**
 * Pantheon Adapters Module
 * Exports all adapter implementations and factory functions
 */

// Import core adapters
import {
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

// Import external adapters (these may not exist yet, so we'll make them optional)
let makeOpenAIAdapter: any = null;
let makeMCPToolAdapter: any = null;
let makeMCPAdapterWithDefaults: any = null;
let makePantheonPersistenceAdapter: any = null;

try {
  const openaiModule = require('@promethean/pantheon-llm-openai');
  makeOpenAIAdapter = openaiModule.makeOpenAIAdapter;
} catch (e) {
  // OpenAI adapter not available
}

try {
  const mcpModule = require('@promethean/pantheon-mcp');
  makeMCPToolAdapter = mcpModule.makeMCPToolAdapter;
  makeMCPAdapterWithDefaults = mcpModule.makeMCPAdapterWithDefaults;
} catch (e) {
  // MCP adapter not available
}

try {
  const persistenceModule = require('@promethean/pantheon-persistence');
  makePantheonPersistenceAdapter = persistenceModule.makePantheonPersistenceAdapter;
} catch (e) {
  // Persistence adapter not available
}

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
