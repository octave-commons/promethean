/**
 * Simple Mock Factories for Type Testing
 *
 * These factories create mock objects that match the actual type definitions
 * from the unified-indexing-api and unified-indexing-client modules.
 */
import type { IndexableContent } from '../unified-content-model.js';
import type { SearchQuery, SearchResult, SearchResponse, IndexingStats, IndexingOptions, UnifiedIndexingConfig } from '../unified-indexing-api.js';
/**
 * Create a mock IndexableContent object
 */
export declare function createMockIndexableContent(overrides?: Partial<IndexableContent>): IndexableContent;
/**
 * Create a mock SearchQuery object
 */
export declare function createMockSearchQuery(overrides?: Partial<SearchQuery>): SearchQuery;
/**
 * Create a mock SearchResult object
 */
export declare function createMockSearchResult(overrides?: Partial<SearchResult>): SearchResult;
/**
 * Create a mock SearchResponse object
 */
export declare function createMockSearchResponse(overrides?: Partial<SearchResponse>): SearchResponse;
/**
 * Create a mock IndexingStats object
 */
export declare function createMockIndexingStats(overrides?: Partial<IndexingStats>): IndexingStats;
/**
 * Create a mock IndexingOptions object
 */
export declare function createMockIndexingOptions(overrides?: Partial<IndexingOptions>): IndexingOptions;
/**
 * Create a mock UnifiedIndexingConfig object
 */
export declare function createMockUnifiedIndexingConfig(overrides?: Partial<UnifiedIndexingConfig>): UnifiedIndexingConfig;
/**
 * Type guards for validation
 */
export declare function isValidIndexableContent(obj: unknown): obj is IndexableContent;
export declare function isValidSearchQuery(obj: unknown): obj is SearchQuery;
export declare function isValidSearchResult(obj: unknown): obj is SearchResult;
export declare function isValidSearchResponse(obj: unknown): obj is SearchResponse;
export declare function isValidIndexingStats(obj: unknown): obj is IndexingStats;
//# sourceMappingURL=simple-mocks.d.ts.map