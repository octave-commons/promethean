/**
 * Cross-Domain Context Compilation
 *
 * Handles context compilation for cross-domain search results
 */

import { compileContext } from '@promethean-os/persistence';

import type { ContextMessage } from '@promethean-os/persistence/dist/actions/context-store/types.js';
import type { CrossDomainSearchOptions, EnhancedSearchResult } from './types/search.js';
import type { UnifiedIndexerServiceState } from './unified-indexer-service.js';

/**
 * Compile context from search results
 */
export async function compileSearchContext(
  indexerService: UnifiedIndexerServiceState,
  _results: readonly EnhancedSearchResult[],
  options: CrossDomainSearchOptions,
): Promise<readonly ContextMessage[]> {
  const contextLimit = options.contextLimit || 10;
  const queries = options.query ? [options.query] : [];

  return compileContext(indexerService.contextStore, {
    texts: queries,
    recentLimit: contextLimit,
    queryLimit: 5,
    limit: contextLimit,
    formatAssistantMessages: options.formatForLLM || false,
  });
}
