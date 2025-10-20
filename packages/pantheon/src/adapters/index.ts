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

// Try to re-export external adapters (these may not exist yet)
try {
  export * from '@promethean/pantheon-llm-openai';
} catch (e) {
  // OpenAI adapter not available
}

try {
  export * from '@promethean/pantheon-mcp';
} catch (e) {
  // MCP adapter not available
}

try {
  export * from '@promethean/pantheon-persistence';
} catch (e) {
  // Persistence adapter not available
}

// Import the functions we need for the composite factory
import {
  makeInMemoryContextAdapter as _makeInMemoryContextAdapter,
  makeInMemoryToolAdapter as _makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter as _makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter as _makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter as _makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter as _makeInMemoryActorStateAdapter,
} from '@promethean/pantheon-core';

// Composite adapter factory
export const makeCompletePantheonSystem = (options: {
  persistence?: any;
  openai?: any;
  mcp?: any;
  inMemory?: boolean;
}) => {
  const { persistence, openai, mcp, inMemory = false } = options;

  // Create adapters based on configuration
  let contextAdapter = null;
  let toolAdapter = null;
  let llmAdapter = null;

  // Try to create external adapters if available
  if (persistence) {
    try {
      const { makePantheonPersistenceAdapter } = require('@promethean/pantheon-persistence');
      contextAdapter = makePantheonPersistenceAdapter(persistence);
    } catch (e) {
      // Fall back to in-memory
      if (inMemory) contextAdapter = _makeInMemoryContextAdapter();
    }
  } else if (inMemory) {
    contextAdapter = _makeInMemoryContextAdapter();
  }

  if (mcp) {
    try {
      const { makeMCPAdapterWithDefaults } = require('@promethean/pantheon-mcp');
      toolAdapter = makeMCPAdapterWithDefaults();
    } catch (e) {
      // Fall back to in-memory
      if (inMemory) toolAdapter = _makeInMemoryToolAdapter();
    }
  } else if (inMemory) {
    toolAdapter = _makeInMemoryToolAdapter();
  }

  if (openai) {
    try {
      const { makeOpenAIAdapter } = require('@promethean/pantheon-llm-openai');
      llmAdapter = makeOpenAIAdapter(openai);
    } catch (e) {
      // Fall back to in-memory
      if (inMemory) llmAdapter = _makeInMemoryLlmAdapter();
    }
  } else if (inMemory) {
    llmAdapter = _makeInMemoryLlmAdapter();
  }

  const messageBusAdapter = inMemory ? _makeInMemoryMessageBusAdapter() : null;
  const schedulerAdapter = inMemory ? _makeInMemorySchedulerAdapter() : null;
  const actorStateAdapter = inMemory ? _makeInMemoryActorStateAdapter() : null;

  return {
    context: contextAdapter,
    tools: toolAdapter,
    llm: llmAdapter,
    messageBus: messageBusAdapter,
    scheduler: schedulerAdapter,
    actorState: actorStateAdapter,
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
