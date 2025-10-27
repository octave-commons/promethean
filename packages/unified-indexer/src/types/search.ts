/**
 * Search Types for Unified Indexer
 *
 * Types specific to cross-domain search functionality
 */

import type {
  SearchQuery,
  SearchResult,
  ContentType,
  ContentSource,
} from '@promethean-os/persistence';
import type { ContextMessage } from '@promethean-os/persistence/dist/actions/context-store/types.js';

/**
 * Advanced search options for cross-domain queries
 */
export interface CrossDomainSearchOptions extends SearchQuery {
  // Context compilation options
  includeContext?: boolean;
  contextLimit?: number;
  formatForLLM?: boolean;

  // Source weighting
  sourceWeights?: Record<ContentSource, number>;
  typeWeights?: Record<ContentType, number>;

  // Temporal filtering
  timeBoost?: boolean; // Boost recent content
  recencyDecay?: number; // Hours for decay

  // Semantic search options
  semanticThreshold?: number;
  hybridSearch?: boolean; // Combine semantic + keyword
  keywordWeight?: number; // Weight for keyword search (0-1)

  // Result processing
  deduplicate?: boolean;
  groupBySource?: boolean;
  maxResultsPerSource?: number;

  // Analytics
  includeAnalytics?: boolean;
  explainScores?: boolean;
}

/**
 * Enhanced search result with additional metadata
 */
export interface EnhancedSearchResult extends SearchResult {
  // Source information
  sourceType: ContentSource;
  contentType: ContentType;

  // Temporal information
  age: number; // milliseconds since creation
  recencyScore: number; // 0-1 based on age

  // Context information
  context?: ContextMessage[];
  contextRelevance?: number; // 0-1 relevance to query

  // Analytics
  scoreBreakdown?: {
    semantic: number;
    keyword: number;
    temporal: number;
    source: number;
    type: number;
    final: number;
  };

  // Explanation
  explanation?: string;
}

/**
 * Cross-domain search response
 */
export interface CrossDomainSearchResponse {
  results: EnhancedSearchResult[];
  total: number;
  took: number; // milliseconds
  query: CrossDomainSearchOptions;

  // Analytics
  analytics?: {
    sourcesSearched: ContentSource[];
    typesFound: ContentType[];
    averageScore: number;
    scoreDistribution: Record<string, number>;
    temporalRange: {
      oldest: number;
      newest: number;
      span: number; // milliseconds
    };
  };

  // Context
  context?: ContextMessage[];
}
