/**
 * Main exports for the Pantheon Framework
 */

// Core framework - selective exports to avoid conflicts
export {
  // Types
  type Actor,
  type ActorScript,
  type ActorState,
  type Message,
  type ContextSource,
  type ToolSpec,

  // Ports
  type ContextPort,
  type ToolPort,
  type LlmPort,
  type MessageBus,
  type Scheduler,
  type ActorStatePort,

  // Core functions
  makeOrchestrator,
  type OrchestratorDeps,
} from '@promethean-os/pantheon-core';

// Adapters
export {
  // Adapter types
  type ContextAdapterDeps,
  type ToolAdapterDeps,
  type LlmAdapterDeps,
  type MessageBusAdapterDeps,
  type SchedulerAdapterDeps,
  type ActorStateAdapterDeps,

  // Adapter factories
  makeContextAdapter,
  makeToolAdapter,
  makeLlmAdapter,
  makeMessageBusAdapter,
  makeSchedulerAdapter,
  makeActorStateAdapter,

  // In-memory implementations
  makeInMemoryContextAdapter,
  makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter,

  // Composite system factory
  makeCompletePantheonSystem,
} from './adapters/index.js';

// Actions
export {
  createLLMActor,
  createToolActor,
  createCompositeActor,
  type LLMActorConfig,
  type ToolActorConfig,
  type CompositeActorConfig,
} from './actions/actors/index.js';

// Factories
export {
  type LLMActorDependencies,
  type ToolActorDependencies,
  type CompositeActorDependencies,
  createLLMActorWithDependencies,
  createToolActorWithDependencies,
  createCompositeActorWithDependencies,
} from './factories/index.js';

// Serializers
export {
  createMockTokenExpiredError,
  createMockJsonWebTokenError,
  serializeJWTPayload,
  deserializeJWTPayload,
  decodeJWTPayload,
} from './serializers/index.js';

// Utilities
export {
  generateId,
  generateActorId,
  createMessage,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage,
  truncateMessages,
  createContextSource,
  mergeContextSources,
  createActorSummary,
  isActorActive,
  isActorCompleted,
  getActorAge,
  getActorIdleTime,
  mergeConfigs,
  validateConfig,
  PantheonError,
  createError,
  isError,
  withTimeout,
  retry,
  type LogLevel,
  type Logger,
  createConsoleLogger,
  createNullLogger,
  createTimer,
  measureAsync,
} from './utils/index.js';
