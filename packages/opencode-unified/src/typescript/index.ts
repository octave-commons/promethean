/**
 * Promethean OpenCode Unified Package
 *
 * This is the main entry point for the unified OpenCode package that combines:
 * - TypeScript HTTP server (from dualstore-http)
 * - TypeScript client library (from opencode-client)
 * - ClojureScript editor (from opencode-cljs-electron)
 * - Electron integration
 */

// Export main server functionality
export * from './server';

// Export client functionality
export * from './client';

// Export shared utilities and types
export * from './shared';

// Export Electron main process utilities
export * from './electron';

// Export schemas
export * from '../schemas';

// Version information
export const VERSION = '1.0.0';

// Main package metadata
export const PACKAGE_INFO = {
  name: '@promethean/opencode-unified',
  version: VERSION,
  description:
    'Unified OpenCode client combining TypeScript server, ClojureScript editor, and Electron integration',
  author: 'Promethean Team',
  license: 'GPL-3.0-only',
} as const;

// Default export for convenience
export default {
  VERSION,
  PACKAGE_INFO,
};
