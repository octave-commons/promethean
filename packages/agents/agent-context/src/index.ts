/**
 * AGENT STATE MANAGEMENT via event sourcing
 *
 * This package manages AGENT STATE (events, snapshots, lifecycle), NOT conversation context.
 *
 * For LLM conversation compilation, use: @promethean/persistence makeContextStore
 * For agent state management, use: makeAgentStateManager from this package
 */

export * from './types';
export * from './event-store';
export * from './snapshot-manager';
export * from './context-manager';
export * from './auth';
export * from './context-sharing';
export * from './context-metadata';
export * from './context-lifecycle';
export * from './share-store';
export * from './metadata-store';
export * from './security';
export * from './state';

// Functional factory (preferred approach)
export { makeAgentStateManager, type AgentStateDeps, type AgentStateManager } from './state';

// Convenience exports for common use cases
export { DefaultContextManager } from './context-manager';
export { PostgresEventStore } from './event-store';
export { PostgresSnapshotStore } from './snapshot-manager';
export {
  JWTAuthService,
  makeAuthService,
  type AuthServiceConfig,
  type AuthServiceDeps,
} from './auth';
export { ContextSharingService } from './context-sharing';
export { ContextMetadataService } from './context-metadata';
export { ContextLifecycleManager } from './context-lifecycle';
export { PostgresContextShareStore } from './share-store';
export { PostgresContextMetadataStore } from './metadata-store';

/**
 * @deprecated Use makeAgentStateManager (functional) instead of DefaultContextManager (class)
 * @deprecated This manages agent state, not conversation context
 */
export { DefaultContextManager as AgentStateManager } from './context-manager';
