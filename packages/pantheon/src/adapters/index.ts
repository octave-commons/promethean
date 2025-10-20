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
    // persistence, // TODO: implement when persistence adapter is available
    // openai, // TODO: implement when OpenAI adapter is available
    // mcp, // TODO: implement when MCP adapter is available
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
