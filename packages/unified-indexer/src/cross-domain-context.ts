/**
 * Cross-Domain Context Compilation
 *
 * Handles context compilation for cross-domain search results
 */

import type { ContextMessage } from '@promethean-os/persistence/dist/actions/context-store/types.js';
import type { UnifiedIndexerServiceState } from './unified-indexer-service.js';
import type { CrossDomainSearchOptions, EnhancedSearchResult } from './types/search.js';
import { compileContext } from '@promethean-os/persistence';

/**
 * Compile context from search results
 */
export async function compileSearchContext(
  indexerService: UnifiedIndexerServiceState,
  _results: EnhancedSearchResult[],
  options: CrossDomainSearchOptions,
): Promise<ContextMessage[]> {
  const contextLimit = options.contextLimit || 10;
  const queries = options.query ? [options.query] : [];

  return compileContext(
    {
      texts: queries,
      recentLimit: contextLimit,
      queryLimit: 5,
      limit: contextLimit,
      formatAssistantMessages: options.formatForLLM || false,
    },
    {
      state: indexerService.contextStore,
      createDualStore: async () => {
        throw new Error('createDualStore not supported in cross-domain search context');
      },
    },
  );
}
