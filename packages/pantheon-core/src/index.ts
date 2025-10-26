/**
 * Main exports for the Pantheon Core Framework
 */

// Core types
export * from './core/types.js';

// Port interfaces
export * from './core/ports.js';

// Error handling
export * from './core/errors.js';

// Core factories and implementations
export * from './core/context.js';
export * from './core/actors.js';
export * from './core/orchestrator.js';

// Adapter implementations
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
} from './core/adapters.js';
