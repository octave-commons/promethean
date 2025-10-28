/**
 * Cross-Domain Search Utility (Functional)
 *
 * This utility provides advanced cross-domain search capabilities that leverage
 * the unified indexer service and contextStore compilation to deliver
 * comprehensive search results across all data sources.
 */

import type { SearchResponse } from '@promethean-os/persistence';
import type { ContextMessage } from '@promethean-os/persistence/dist/actions/context-store/types.js';
import type { UnifiedIndexerServiceState } from './unified-indexer-service.js';
import type { CrossDomainSearchOptions, CrossDomainSearchResponse } from './types/search.js';

import { compileSearchContext } from './cross-domain-context.js';
import { enhanceResults, processResults } from './cross-domain-processing.js';
import { generateAnalytics } from './cross-domain-scoring.js';

/**
 * Cross-Domain Search Engine State
 */
export type CrossDomainSearchEngineState = {
  indexerService: UnifiedIndexerServiceState;
  defaultOptions: Partial<CrossDomainSearchOptions>;
};

/**
 * Create cross-domain search engine
 */
export function createCrossDomainSearchEngine(
  indexerService: UnifiedIndexerServiceState,
  defaultOptions: Partial<CrossDomainSearchOptions> = {},
): CrossDomainSearchEngineState {
  return {
    indexerService,
    defaultOptions,
  };
}

/**
 * Perform cross-domain search with enhanced capabilities
 */
async function performBaseSearch(
  state: CrossDomainSearchEngineState,
  options: CrossDomainSearchOptions,
) {
  return state.indexerService.unifiedClient.search({
    query: options.query,
    type: options.type,
    source: options.source,
    dateFrom: options.dateFrom,
    dateTo: options.dateTo,
    metadata: options.metadata,
    tags: options.tags,
    limit: options.limit ? options.limit * 2 : 200,
    fuzzy: options.fuzzy,
    semantic: options.semantic,
    includeContent: true,
  });
}

async function buildSearchResponse(
  state: CrossDomainSearchEngineState,
  baseResponse: SearchResponse,
  options: CrossDomainSearchOptions,
  startTime: number,
): Promise<CrossDomainSearchResponse> {
  const enhancedResults = await enhanceResults(baseResponse.results, options);
  const processedResults = processResults([...enhancedResults], options);

  const context =
    options.includeContext && processedResults.length > 0
      ? await compileSearchContext(state.indexerService, processedResults, options)
      : undefined;

  const analytics = options.includeAnalytics
    ? generateAnalytics(processedResults, options)
    : undefined;

  const finalResults = processedResults.slice(0, options.limit || 50);

  return {
    results: finalResults,
    total: baseResponse.total,
    took: Date.now() - startTime,
    query: options,
    analytics: analytics
      ? {
          ...analytics,
          sourcesSearched: [...analytics.sourcesSearched] as any,
          typesFound: [...analytics.typesFound] as any,
        }
      : undefined,
    context: context ? ([...context] as any) : undefined,
  };
}

export async function search(
  state: CrossDomainSearchEngineState,
  query: CrossDomainSearchOptions,
): Promise<CrossDomainSearchResponse> {
  const startTime = Date.now();
  const options = { ...state.defaultOptions, ...query };

  try {
    console.log(
      `[cross-domain-search] Searching for: "${query.query}" across ${options.source ? (Array.isArray(options.source) ? options.source.join(', ') : options.source) : 'all'} sources`,
    );

    const baseResponse = await performBaseSearch(state, options);
    const response = await buildSearchResponse(state, baseResponse, options, startTime);

    console.log(
      `[cross-domain-search] Found ${response.results.length} enhanced results in ${response.took}ms`,
    );
    return response;
  } catch (error) {
    throw new Error(
      `Cross-domain search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Search with intelligent query expansion
 */
export async function intelligentSearch(
  state: CrossDomainSearchEngineState,
  query: string,
  options: Partial<CrossDomainSearchOptions> = {},
): Promise<CrossDomainSearchResponse> {
  const expandedQuery = await expandQuery(query);

  return search(state, {
    ...options,
    query: expandedQuery.original,
    semantic: true,
    hybridSearch: true,
    keywordWeight: 0.3,
    includeAnalytics: true,
    ...options,
  });
}

/**
 * Get contextual search results for LLM consumption
 */
export async function getContextualSearch(
  state: CrossDomainSearchEngineState,
  queries: string[],
  options: Partial<CrossDomainSearchOptions> = {},
): Promise<{
  searchResults: CrossDomainSearchResponse;
  context: ContextMessage[];
}> {
  const searchResponse = await search(state, {
    query: queries.join(' '),
    limit: 20,
    semantic: true,
    includeContext: true,
    contextLimit: 10,
    formatForLLM: true,
    includeAnalytics: true,
    ...options,
  });

  return {
    searchResults: searchResponse,
    context: searchResponse.context || [],
  };
}

/**
 * Expand query with related terms and synonyms
 */
async function expandQuery(query: string): Promise<{ original: string; expanded: string[] }> {
  const { expandQuery: expandQueryUtil } = await import('./cross-domain-processing.js');
  return expandQueryUtil(query);
}
