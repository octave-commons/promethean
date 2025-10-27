/**
 * Shared Types for Unified Indexer
 *
 * Common types used across the unified indexer package
 */

// Re-export commonly used types from persistence
export type {
  ContentType,
  ContentSource,
  ContentMetadata,
  FileMetadata,
  SearchQuery,
  SearchResponse,
  SearchResult,
  IndexableContent,
  ContextMessage,
  IndexingStats,
} from '@promethean-os/persistence';

// Re-export service-specific types
export type { UnifiedIndexerServiceConfig, UnifiedIndexerStats, ServiceStatus } from './service.js';

// Re-export search-specific types
export type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from './search.js';
