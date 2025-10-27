/**
 * Simple Mock Factories for Type Testing
 *
 * These factories create mock objects that match the actual type definitions
 * from the unified-indexing-api and unified-indexing-client modules.
 */

import type { IndexableContent, ContentType, ContentSource, FileMetadata } from '../../unified-content-model.js';

import type {
    SearchQuery,
    SearchResult,
    SearchResponse,
    IndexingStats,
    IndexingOptions,
    UnifiedIndexingConfig,
} from '../../unified-indexing-api.js';

/**
 * Create a mock IndexableContent object
 */
export function createMockIndexableContent(overrides: Partial<IndexableContent> = {}): IndexableContent {
    const baseMetadata = {
        type: 'file' as const,
        source: 'filesystem' as const,
        path: '/test/path/test-file.txt',
        extension: 'txt',
        directory: '/test/path',
        size: 1024,
    };

    return {
        id: 'test-content-id',
        content: 'Test content for type validation',
        type: 'file' as ContentType,
        source: 'filesystem' as ContentSource,
        timestamp: Date.now(),
        metadata: {
            ...baseMetadata,
            ...overrides.metadata,
        } as FileMetadata,
        ...overrides,
    };
}

/**
 * Create a mock SearchQuery object
 */
export function createMockSearchQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
    return {
        query: 'test query',
        limit: 10,
        offset: 0,
        fuzzy: false,
        semantic: true,
        includeContent: true,
        ...overrides,
    };
}

/**
 * Create a mock SearchResult object
 */
export function createMockSearchResult(overrides: Partial<SearchResult> = {}): SearchResult {
    return {
        content: createMockIndexableContent(),
        score: 0.95,
        highlights: ['highlighted text'],
        ...overrides,
    };
}

/**
 * Create a mock SearchResponse object
 */
export function createMockSearchResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
    const results = Array.from({ length: 3 }, () => createMockSearchResult());

    return {
        results,
        total: results.length,
        took: 150,
        query: createMockSearchQuery(),
        ...overrides,
    };
}

/**
 * Create a mock IndexingStats object
 */
export function createMockIndexingStats(overrides: Partial<IndexingStats> = {}): IndexingStats {
    return {
        totalContent: 1000,
        contentByType: {
            file: 400,
            message: 300,
            task: 200,
            event: 100,
            session: 50,
            attachment: 25,
            thought: 15,
            document: 10,
            board: 5,
        },
        contentBySource: {
            filesystem: 400,
            discord: 300,
            opencode: 200,
            kanban: 100,
            agent: 50,
            user: 25,
            system: 15,
            external: 10,
        },
        lastIndexed: Date.now(),
        storageStats: {
            vectorSize: 1024000,
            metadataSize: 512000,
            totalSize: 1536000,
        },
        ...overrides,
    };
}

/**
 * Create a mock IndexingOptions object
 */
export function createMockIndexingOptions(overrides: Partial<IndexingOptions> = {}): IndexingOptions {
    return {
        skipVectors: false,
        skipMetadata: false,
        overwrite: false,
        batchSize: 100,
        concurrency: 1,
        validate: true,
        strict: false,
        ...overrides,
    };
}

/**
 * Create a mock UnifiedIndexingConfig object
 */
export function createMockUnifiedIndexingConfig(overrides: Partial<UnifiedIndexingConfig> = {}): UnifiedIndexingConfig {
    return {
        vectorStore: {
            type: 'chromadb',
            connectionString: 'http://localhost:8000',
            indexName: 'test-index',
            dimensions: 1536,
        },
        metadataStore: {
            type: 'mongodb',
            connectionString: 'mongodb://localhost:27017',
            tableName: 'test-metadata',
        },
        embedding: {
            model: 'text-embedding-ada-002',
            dimensions: 1536,
            batchSize: 100,
        },
        cache: {
            enabled: true,
            ttl: 300000,
            maxSize: 1000,
        },
        validation: {
            strict: true,
            skipVectorValidation: false,
            maxContentLength: 1000000,
        },
        ...overrides,
    };
}

/**
 * Type guards for validation
 */
export function isValidIndexableContent(obj: unknown): obj is IndexableContent {
    if (!obj || typeof obj !== 'object') return false;

    const content = obj as Record<string, unknown>;

    // Check that all required fields exist and have correct types
    return (
        typeof content.id === 'string' &&
        content.id.length > 0 &&
        typeof content.content === 'string' &&
        typeof content.type === 'string' &&
        content.type.length > 0 &&
        typeof content.source === 'string' &&
        content.source.length > 0 &&
        typeof content.timestamp === 'number' &&
        content.timestamp > 0 &&
        (!content.metadata || typeof content.metadata === 'object')
    );
}

export function isValidSearchQuery(obj: unknown): obj is SearchQuery {
    if (!obj || typeof obj !== 'object') return false;

    const query = obj as Record<string, unknown>;
    const keys = Object.keys(query);

    // Empty object should not be considered valid
    if (keys.length === 0) return false;

    return (
        (!query.query || typeof query.query === 'string') &&
        (!query.limit || typeof query.limit === 'number') &&
        (!query.offset || typeof query.offset === 'number') &&
        (!query.fuzzy || typeof query.fuzzy === 'boolean') &&
        (!query.semantic || typeof query.semantic === 'boolean') &&
        (!query.includeContent || typeof query.includeContent === 'boolean')
    );
}

export function isValidSearchResult(obj: unknown): obj is SearchResult {
    if (!obj || typeof obj !== 'object') return false;

    const result = obj as Record<string, unknown>;
    return (
        isValidIndexableContent(result.content) &&
        typeof result.score === 'number' &&
        (!result.highlights || Array.isArray(result.highlights))
    );
}

export function isValidSearchResponse(obj: unknown): obj is SearchResponse {
    if (!obj || typeof obj !== 'object') return false;

    const response = obj as Record<string, unknown>;

    // Check required fields exist and have correct types
    if (!Array.isArray(response.results)) return false;
    if (typeof response.total !== 'number') return false;
    if (typeof response.took !== 'number') return false;
    if (!isValidSearchQuery(response.query)) return false;

    // Empty query object should not be valid
    if (typeof response.query === 'object' && response.query !== null && Object.keys(response.query).length === 0)
        return false;

    return true;
}

export function isValidIndexingStats(obj: unknown): obj is IndexingStats {
    if (!obj || typeof obj !== 'object') return false;

    const stats = obj as Record<string, unknown>;
    const storageStats = stats.storageStats as Record<string, unknown>;
    return (
        typeof stats.totalContent === 'number' &&
        typeof stats.contentByType === 'object' &&
        typeof stats.contentBySource === 'object' &&
        typeof stats.lastIndexed === 'number' &&
        typeof storageStats === 'object' &&
        typeof storageStats.vectorSize === 'number' &&
        typeof storageStats.metadataSize === 'number' &&
        typeof storageStats.totalSize === 'number'
    );
}
