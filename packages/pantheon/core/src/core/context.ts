/**
 * Context Engine — Dynamic context compilation port adapter
 * Wraps @promethean-os/persistence to provide Pantheon-native context
 */

import type { ContextPort } from './ports.js';
import type { ContextSource } from './types.js';

export type ContextPortDeps = {
  getCollectionsFor: (sources: readonly ContextSource[]) => Promise<readonly any[]>;
  resolveRole: (meta?: any) => 'system' | 'user' | 'assistant';
  resolveName: (meta?: any) => string;
  formatTime: (ms: number) => string;
};

export const makeContextPort = (deps: ContextPortDeps): ContextPort => {
  return {
    compile: async ({ texts = [], sources, recentLimit = 10, queryLimit = 5, limit = 20 }) => {
      // Sources are currently unused but kept for future compatibility
      void sources;

      // Dynamically import persistence to avoid circular deps
      const { createContextStoreFactory } = await import('@promethean-os/persistence');

      const contextStore = createContextStoreFactory({
        formatTime: deps.formatTime,
        assistantName: 'Pantheon',
      });

      return contextStore.compileContext({
        texts,
        recentLimit,
        queryLimit,
        limit,
      });
    },
  };
};
