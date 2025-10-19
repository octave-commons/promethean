/**
 * Context Management Module
 *
 * Complete context management system migrated from agent-context package
 * with enhanced unified type system integration.
 */

// ============================================================================
// Core Context Management
// ============================================================================

export * from './types.js';
export * from './context-manager.js';
export * from './context-manager-helpers.js';
export * from './context-lifecycle.js';

// ============================================================================
// Event and Snapshot Management
// ============================================================================

export * from './event-store.js';
export * from './snapshot-manager.js';

// ============================================================================
// Authentication and Security
// ============================================================================

export * from './auth.js';
export * from './security.js';

// ============================================================================
// Context Sharing
// ============================================================================

export * from './context-sharing.js';
export * from './context-sharing-helpers.js';
export * from './share-store.js';

// ============================================================================
// Metadata Management
// ============================================================================

export * from './context-metadata.js';
export * from './metadata-store.js';

// ============================================================================
// Module Information
// ============================================================================

export const ContextModule = {
  name: 'context',
  version: '1.0.0',
  status: 'complete',
  description: 'Complete context management system with unified types',
  features: [
    'Context managers and event stores',
    'Authentication and security',
    'Context sharing with permissions',
    'Metadata management',
    'Snapshot and recovery',
    'Lifecycle management',
  ],
} as const;
