/**
 * Context Management Module
 * Phase 2: Complete migration from agent-context package
 * 
 * This module provides comprehensive context management capabilities including:
 * - Context lifecycle management
 * - Event sourcing and snapshot management
 * - Authentication and authorization
 * - Context sharing and collaboration
 * - Metadata management
 * - Security and validation
 */

// Core types and interfaces
export * from './types.js';

// Core context management
export { DefaultContextManager } from './context-manager.js';
export { ContextManagerHelpers } from './context-manager-helpers.js';

// Event and snapshot storage
export { MemoryEventStore, PostgresEventStore } from './event-store.js';
export { MemorySnapshotStore, PostgresSnapshotStore } from './snapshot-manager.js';

// Authentication and security
export { JWTAuthService, AuthUtils, ApiKeyManager } from './auth.js';
export { SecurityValidator, SecurityLogger, RateLimiter, SECURITY_CONFIG } from './security.js';

// Context sharing
export { ContextSharingService } from './context-sharing.js';
export { ContextSharingHelpers } from './context-sharing-helpers.js';

// Metadata management
export { ContextMetadataService } from './context-metadata.js';

// Store implementations
export { MemoryContextShareStore, PostgresContextShareStore } from './share-store.js';
export { MemoryContextMetadataStore, PostgresContextMetadataStore } from './metadata-store.js';

// Lifecycle management
export { 
  ContextLifecycleManager,
  type ContextExportData,
  type SystemStatistics,
  type ContextValidationResult,
  type ContextInitialState,
  type IContextLifecycleManager,
  type ContextLifecycleConfig
} from './context-lifecycle.js';

// Convenience exports for common use cases
export type {
  // Legacy types for backward compatibility
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  AuthToken,
  ContextShare,
  ContextQuery,
  ContextStatistics,
  // Enhanced unified types
  UnifiedContextEvent,
  UnifiedContextSnapshot,
  UnifiedAgentContext,
  // Core types
  EventStore,
  SnapshotStore,
  ContextManager as IContextManager,
  AuthService,
  ContextShareStore,
  ContextMetadataStore,
  ContextLifecycleManager as IContextLifecycleManager
} from './types.js';

// Factory functions for easy setup
export function createContextManager(
  eventStore: import('./types.js').EventStore,
  snapshotStore: import('./types.js').SnapshotStore,
  snapshotInterval?: number
): DefaultContextManager {
  return new DefaultContextManager(eventStore, snapshotStore, snapshotInterval);
}

export function createAuthService(config?: string | {
  jwtSecret?: string;
  tokenExpiry?: string;
  rateLimitWindow?: number;
  maxAttempts?: number;
}, tokenExpiry?: string): JWTAuthService {
  return new JWTAuthService(config, tokenExpiry);
}

export function createContextSharingService(
  shareStore: import('./types.js').ContextShareStore,
  snapshotStore: import('./types.js').SnapshotStore
): ContextSharingService {
  return new ContextSharingService(shareStore, snapshotStore);
}

export function createContextMetadataService(
  metadataStore: import('./types.js').ContextMetadataStore
): ContextMetadataService {
  return new ContextMetadataService(metadataStore);
}

export function createContextLifecycleManager(
  config: ContextLifecycleConfig
): ContextLifecycleManager {
  return new ContextLifecycleManager(config);
}

// In-memory store factories for testing/development
export function createInMemoryEventStore(): import('./event-store.js').MemoryEventStore {
  const { MemoryEventStore } = require('./event-store.js');
  return new MemoryEventStore();
}

export function createInMemorySnapshotStore(): import('./snapshot-manager.js').MemorySnapshotStore {
  const { MemorySnapshotStore } = require('./snapshot-manager.js');
  return new MemorySnapshotStore();
}

export function createInMemoryShareStore(): import('./share-store.js').MemoryContextShareStore {
  const { MemoryContextShareStore } = require('./share-store.js');
  return new MemoryContextShareStore();
}

export function createInMemoryMetadataStore(): import('./metadata-store.js').MemoryContextMetadataStore {
  const { MemoryContextMetadataStore } = require('./metadata-store.js');
  return new MemoryContextMetadataStore();
}

// Complete in-memory context system factory
export function createInMemoryContextSystem(options: {
  snapshotInterval?: number;
  jwtSecret?: string;
} = {}): {
  contextManager: DefaultContextManager;
  authService: JWTAuthService;
  sharingService: ContextSharingService;
  metadataService: ContextMetadataService;
  lifecycleManager: ContextLifecycleManager;
  eventStore: import('./event-store.js').MemoryEventStore;
  snapshotStore: import('./snapshot-manager.js').MemorySnapshotStore;
  shareStore: import('./share-store.js').MemoryContextShareStore;
  metadataStore: import('./metadata-store.js').MemoryContextMetadataStore;
} {
  const eventStore = createInMemoryEventStore();
  const snapshotStore = createInMemorySnapshotStore();
  const shareStore = createInMemoryShareStore();
  const metadataStore = createInMemoryMetadataStore();

  const contextManager = createContextManager(eventStore, snapshotStore, options.snapshotInterval);
  const authService = createAuthService(options.jwtSecret);
  const sharingService = createContextSharingService(shareStore, snapshotStore);
  const metadataService = createContextMetadataService(metadataStore);
  const lifecycleManager = createContextLifecycleManager({
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore
  });

  return {
    contextManager,
    authService,
    sharingService,
    metadataService,
    lifecycleManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore
  };
}

// Version and metadata
export const CONTEXT_MODULE_VERSION = '2.0.0';
export const CONTEXT_MODULE_STATUS = 'complete';

// Default configurations
export const DEFAULT_CONTEXT_CONFIG = {
  snapshotInterval: 100,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  tokenExpiry: '24h',
  rateLimitWindow: 60000,
  maxRequests: 100,
  maxShareDuration: 365 * 24 * 60 * 60 * 1000, // 1 year
} as const;