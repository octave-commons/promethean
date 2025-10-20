/**
 * Pantheon Persistence Adapter
 * Wraps @promethean/persistence to provide ContextPort implementation
 */

import type { ContextSource } from '@promethean/pantheon';
import type { ContextPort, ContextPortDeps } from '@promethean/pantheon/core/context.js';
import { makeContextPort } from '@promethean/pantheon/core/context.js';
import type { DualStoreManager } from '@promethean/persistence';

export type PersistenceAdapterDeps = {
  getStoreManager: () => DualStoreManager;
  resolveRole?: (meta?: any) => 'system' | 'user' | 'assistant';
  resolveName?: (meta?: any) => string;
  formatTime?: (ms: number) => string;
};

export const makePantheonPersistenceAdapter = (deps: PersistenceAdapterDeps): ContextPort => {
  const contextDeps: ContextPortDeps = {
    getCollectionsFor: async (sources: readonly ContextSource[]) => {
      const manager = deps.getStoreManager();

      // Map context sources to actual collections
      const collections = await Promise.all(
        sources.map(async (source) => {
          try {
            // Use the source ID to get the appropriate collection
            return manager.getCollection(source.id);
          } catch (error) {
            console.warn(`Failed to get collection for source ${source.id}:`, error);
            return null;
          }
        }),
      );

      // Filter out null collections and return valid ones
      return collections.filter(Boolean) as any[];
    },
    resolveRole:
      deps.resolveRole ||
      ((meta?: any) => {
        // Default role resolution logic
        if (meta?.role) return meta.role;
        if (meta?.type === 'user') return 'user';
        if (meta?.type === 'assistant') return 'assistant';
        return 'system';
      }),
    resolveName:
      deps.resolveName ||
      ((meta?: any) => {
        // Default name resolution logic
        return meta?.displayName || meta?.name || meta?.id || 'Unknown';
      }),
    formatTime:
      deps.formatTime ||
      ((ms: number) => {
        // Default time formatting
        return new Date(ms).toLocaleISOString();
      }),
  };

  return makeContextPort(contextDeps);
};
