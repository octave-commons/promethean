/**
 * Unified Indexing API
 *
 * This module provides a single, unified interface for all indexing operations
 * across different content types and storage backends.
 */

import type { IndexableContent, ContentType, ContentSource } from './unified-content-model.js';

/**
 * Search query interface for unified search
 */
export interface SearchQuery {
    // Basic search
    query?: string;
    type?: ContentType | ContentType[];
    source?: ContentSource | ContentSource[];

    // Time-based filtering
    dateFrom?: number;
    dateTo?: number;

    // Metadata filtering
    metadata?: Record<string, unknown>;
    tags?: string[];

    // Pagination
    limit?: number;
    offset?: number;

    // Search options
    fuzzy?: boolean;
    semantic?: boolean;
    includeContent?: boolean;
}

/**
 * Search result interface
 */
export interface SearchResult {
    content: IndexableContent;
    score: number;
    highlights?: string[];
}

/**
 * Search response interface
 */
export interface SearchResponse {
    results: SearchResult[];
    total: number;
    took: number; // milliseconds
    query: SearchQuery;
}

/**
 * Indexing statistics
 */
export interface IndexingStats {
    totalContent: number;
    contentByType: Record<ContentType, number>;
    contentBySource: Record<ContentSource, number>;
    lastIndexed: number;
    storageStats: {
        vectorSize: number;
        metadataSize: number;
        totalSize: number;
    };
}

/**
 * Indexing options
 */
export interface IndexingOptions {
    // Processing options
    skipVectors?: boolean;
    skipMetadata?: boolean;
    overwrite?: boolean;

    // Batch processing
    batchSize?: number;
    concurrency?: number;

    // Validation
    validate?: boolean;
    strict?: boolean;
}

/**
 * Unified indexing client interface
 */
export interface UnifiedIndexingClient {
    // Core indexing operations
    index(content: IndexableContent, options?: IndexingOptions): Promise<string>;
    indexBatch(contents: IndexableContent[], options?: IndexingOptions): Promise<string[]>;

    // Search operations
    search(query: SearchQuery): Promise<SearchResponse>;
    getById(id: string): Promise<IndexableContent | null>;
    getByType(type: ContentType): Promise<IndexableContent[]>;
    getBySource(source: ContentSource): Promise<IndexableContent[]>;

    // Management operations
    update(id: string, content: Partial<IndexableContent>): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    deleteBatch(ids: string[]): Promise<boolean[]>;

    // Utility operations
    reindex(options?: IndexingOptions): Promise<void>;
    optimize(): Promise<void>;
    getStats(): Promise<IndexingStats>;

    // Health and status
    healthCheck(): Promise<{
        healthy: boolean;
        vectorStore: boolean;
        metadataStore: boolean;
        issues: string[];
    }>;
}

/**
 * Configuration for unified indexing client
 */
export interface UnifiedIndexingConfig {
    // Storage configuration
    vectorStore: {
        type: 'chromadb' | 'pinecone' | 'weaviate' | 'qdrant';
        connectionString: string;
        apiKey?: string;
        indexName?: string;
        dimensions?: number;
    };

    metadataStore: {
        type: 'sqlite' | 'postgresql' | 'mongodb';
        connectionString: string;
        tableName?: string;
    };

    // Processing configuration
    embedding: {
        model: string;
        dimensions: number;
        batchSize: number;
    };

    // Performance configuration
    cache: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
    };

    // Validation configuration
    validation: {
        strict: boolean;
        skipVectorValidation: boolean;
        maxContentLength: number;
    };
}

/**
 * Factory function to create unified indexing client
 */
export declare function createUnifiedIndexingClient(config: UnifiedIndexingConfig): Promise<UnifiedIndexingClient>;

/**
 * Default configuration
 */
export declare const DEFAULT_CONFIG: Partial<UnifiedIndexingConfig>;
