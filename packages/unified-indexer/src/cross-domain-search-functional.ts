/**
 * Cross-Domain Search Utility (Functional Implementation)
 *
 * This utility provides advanced cross-domain search capabilities that leverage
 * unified indexer service and contextStore compilation to deliver
 * comprehensive search results across all data sources.
 */

import type { SearchResult, ContentSource } from '@promethean-os/persistence';
import type { ContextMessage } from '@promethean-os/persistence/dist/actions/context-store/types.js';
import type { UnifiedIndexerServiceState } from './unified-indexer-service.js';
import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from './types/search.js';

/**
 * Cross-domain search state
 */
export interface CrossDomainSearchState {
  indexerService: UnifiedIndexerServiceState;
  defaultOptions: Partial<CrossDomainSearchOptions>;
}

/**
 * Create cross-domain search engine
 */
export function createCrossDomainSearchEngine(
  indexerService: UnifiedIndexerServiceState,
  defaultOptions: Partial<CrossDomainSearchOptions> = {},
): CrossDomainSearchState {
  return {
    indexerService,
    defaultOptions,
  };
}

/**
 * Perform cross-domain search
 */
export async function searchCrossDomain(
  state: CrossDomainSearchState,
  query: string,
  options: Partial<CrossDomainSearchOptions> = {},
): Promise<CrossDomainSearchResponse> {
  const mergedOptions = { ...state.defaultOptions, ...options };

  try {
    const searchResults = await searchService(state.indexerService, {
      query,
      limit: mergedOptions.limit,
      offset: mergedOptions.offset,
      type: mergedOptions.type,
      source: mergedOptions.source,
    });

    const enhancedResults = await Promise.all(searchResults.results.map(enhanceSearchResult));

    const contextMessages = await getContextService(state.indexerService, [query], {
      limit: mergedOptions.contextLimit,
      formatAssistantMessages: mergedOptions.formatAssistantMessages,
    });

    const response: CrossDomainSearchResponse = {
      results: enhancedResults,
      total: searchResults.total,
      query,
      took: searchResults.took,
      context: contextMessages,
      hasMore: (mergedOptions.offset || 0) + enhancedResults.length < searchResults.total,
    };

    return response;
  } catch (error) {
    throw new Error(
      `Cross-domain search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Enhance search result with additional metadata
 */
async function enhanceSearchResult(result: SearchResult): Promise<EnhancedSearchResult> {
  const content = result.content;

  const enhanced: EnhancedSearchResult = {
    id: content.id,
    content: content.content,
    score: result.score,
    highlights: result.highlights,
    metadata: {
      source: content.source,
      type: content.type,
      timestamp: content.timestamp,
      ...content.metadata,
    },
    sourceType: content.source,
    contentType: content.type,
    timestamp: content.timestamp,
  };

  return enhanced;
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(
  state: CrossDomainSearchState,
  partialQuery: string,
  limit = 5,
): Promise<string[]> {
  try {
    const searchResults = await searchService(state.indexerService, {
      query: partialQuery,
      limit: limit * 2, // Get more results to extract suggestions
    });

    const suggestions = new Set<string>();

    for (const result of searchResults.results) {
      const content = result.content.content;
      const words = content.toLowerCase().split(/\s+/);

      for (const word of words) {
        if (word.includes(partialQuery.toLowerCase()) && word.length > partialQuery.length) {
          suggestions.add(word);
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    throw new Error(
      `Failed to get search suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get related content
 */
export async function getRelatedContent(
  state: CrossDomainSearchState,
  contentId: string,
  limit = 5,
): Promise<EnhancedSearchResult[]> {
  try {
    const searchResults = await searchService(state.indexerService, {
      limit: limit * 2, // Get more results to find related content
    });

    const relatedResults = searchResults.results
      .filter((result) => result.content.id !== contentId)
      .slice(0, limit);

    return Promise.all(relatedResults.map(enhanceSearchResult));
  } catch (error) {
    throw new Error(
      `Failed to get related content: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get search analytics
 */
export async function getSearchAnalytics(
  state: CrossDomainSearchState,
  timeRange?: { from: number; to: number },
): Promise<{
  totalSearches: number;
  averageResponseTime: number;
  popularQueries: Array<{ query: string; count: number }>;
  contentTypeDistribution: Record<ContentSource, number>;
}> {
  try {
    const stats = await getStatusService(state.indexerService);

    // Mock analytics data - in real implementation, this would query analytics store
    return {
      totalSearches: 0,
      averageResponseTime: 0,
      popularQueries: [],
      contentTypeDistribution: {} as Record<ContentSource, number>,
    };
  } catch (error) {
    throw new Error(
      `Failed to get search analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Partial<CrossDomainSearchOptions> = {
  limit: 10,
  offset: 0,
  contextLimit: 5,
  formatAssistantMessages: true,
  includeHighlights: true,
  includeMetadata: true,
};

// Import the service functions
import { searchService, getContextService, getStatusService } from './unified-indexer-service.js';
