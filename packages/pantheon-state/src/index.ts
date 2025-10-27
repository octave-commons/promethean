/**
 * AGENT STATE MANAGEMENT via event sourcing
 *
 * This package manages AGENT STATE (events, snapshots, lifecycle), NOT conversation context.
 *
 * For LLM conversation compilation, use: @promethean-os/persistence makeContextStore
 * For agent state management, use: makeAgentStateManager from this package (functional approach)
 */

// Core functional exports (preferred approach)
export { makeAgentStateManager, type AgentStateDeps, type AgentStateManager } from './state';

// Re-export as ActorStatePort for Pantheon compatibility
export type { ActorStatePort, Actor, ActorScript } from './state';
export { makeActorStatePort } from './state';

// Legacy exports for backward compatibility
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
export { DefaultContextManager as LegacyAgentStateManager } from './context-manager';
