/**
 * Context Engine — Dynamic context compilation port adapter
 * Wraps @promethean/persistence to provide Pantheon-native context
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
      const colls = await deps.getCollectionsFor(sources);

      // Dynamically import persistence to avoid circular deps
      const { makeContextStore } = await import('@promethean/persistence');
      const { compileContext } = makeContextStore({
        getCollections: () => colls,
        resolveRole: deps.resolveRole,
        resolveDisplayName: deps.resolveName,
        formatTime: deps.formatTime,
      });

      return compileContext({ texts, recentLimit, queryLimit, limit });
    },
  };
};
