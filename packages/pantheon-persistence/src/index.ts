/**
 * Pantheon Persistence Adapter
 * Wraps @promethean-os/persistence to provide ContextPort implementation
 */

import type { ContextSource } from '@promethean-os/pantheon-core';
import type { ContextPort, ContextPortDeps } from '@promethean-os/pantheon-core';
import { makeContextPort } from '@promethean-os/pantheon-core';
import type { DualStoreManager } from '@promethean-os/persistence';

export type PersistenceAdapterDeps = {
  getStoreManagers: () => Promise<DualStoreManager[]>;
  resolveRole?: (meta?: any) => 'system' | 'user' | 'assistant';
  resolveName?: (meta?: any) => string;
  formatTime?: (ms: number) => string;
};

export const makePantheonPersistenceAdapter = (deps: PersistenceAdapterDeps): ContextPort => {
  const contextDeps: ContextPortDeps = {
    getCollectionsFor: async (sources: readonly ContextSource[]) => {
      const managers = await deps.getStoreManagers();

      // Map context sources to actual store managers
      const validManagers = managers.filter((manager) =>
        sources.some((source) => source.id === manager.name),
      );

      return validManagers as any[];
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
        return new Date(ms).toISOString();
      }),
  };

  return makeContextPort(contextDeps);
};
