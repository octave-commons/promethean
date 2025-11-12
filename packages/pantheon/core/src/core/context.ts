/**
 * Context Engine — Dynamic context compilation port adapter
 * Wraps @promethean-os/persistence collections to provide Pantheon-native context
 */

import { makeContextStore } from '@promethean-os/persistence';

import type { ContextPort } from './ports.js';
import type { ContextSource } from './types.js';

export type ContextPortDeps = {
  getCollectionsFor: (sources: readonly ContextSource[]) => Promise<readonly unknown[]>;
  resolveRole: (meta?: Record<string, unknown>) => 'system' | 'user' | 'assistant';
  resolveName: (meta?: Record<string, unknown>) => string;
  formatTime: (ms: number) => string;
};

const ASSISTANT_NAME = 'Pantheon';

export const makeContextPort = (deps: ContextPortDeps): ContextPort => ({
  compile: async ({ texts = [], sources, recentLimit, queryLimit, limit }) => {
    const { compileContext } = makeContextStore({
      getCollections: () => deps.getCollectionsFor(sources),
      resolveRole: deps.resolveRole,
      resolveDisplayName: deps.resolveName,
      formatTime: deps.formatTime,
      assistantName: ASSISTANT_NAME,
    });

    return compileContext({ texts, recentLimit, queryLimit, limit });
  },
});
