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

// Re-export persistence adapter
export {
  makePantheonPersistenceAdapter,
  type PersistenceAdapterDeps,
} from '@promethean/pantheon-persistence';

// Re-export MCP adapter
export {
  makeMCPToolAdapter,
  makeMCPAdapterWithDefaults,
  createActorTool,
  tickActorTool,
  compileContextTool,
  type ToolPort,
  type MCPTool,
  type MCPToolResult,
} from '@promethean/pantheon-mcp';

// Re-export OpenAI adapter
export {
  makeOpenAIAdapter,
  type OpenAIAdapterConfig,
} from '@promethean/pantheon-llm-openai';

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

  // Create adapters based on configuration
  const contextAdapter = persistence 
    ? persistence.makePantheonPersistenceAdapter?.(persistence)
    : inMemory 
      ? makeInMemoryContextAdapter()
      : null;

  const toolAdapter = mcp
    ? mcp.makeMCPAdapterWithDefaults?.()
    : inMemory
      ? makeInMemoryToolAdapter()
      : null;

  const llmAdapter = openai
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