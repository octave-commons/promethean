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
    query?: string;
    type?: ContentType | ContentType[];
    source?: ContentSource | ContentSource[];
    dateFrom?: number;
    dateTo?: number;
    metadata?: Record<string, unknown>;
    tags?: string[];
    limit?: number;
    offset?: number;
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
    took: number;
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
    skipVectors?: boolean;
    skipMetadata?: boolean;
    overwrite?: boolean;
    batchSize?: number;
    concurrency?: number;
    validate?: boolean;
    strict?: boolean;
}
/**
 * Unified indexing client interface
 */
export interface UnifiedIndexingClient {
    index(content: IndexableContent, options?: IndexingOptions): Promise<string>;
    indexBatch(contents: IndexableContent[], options?: IndexingOptions): Promise<string[]>;
    search(query: SearchQuery): Promise<SearchResponse>;
    getById(id: string): Promise<IndexableContent | null>;
    getByType(type: ContentType): Promise<IndexableContent[]>;
    getBySource(source: ContentSource): Promise<IndexableContent[]>;
    update(id: string, content: Partial<IndexableContent>): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    deleteBatch(ids: string[]): Promise<boolean[]>;
    reindex(options?: IndexingOptions): Promise<void>;
    optimize(): Promise<void>;
    getStats(): Promise<IndexingStats>;
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
    embedding: {
        model: string;
        dimensions: number;
        batchSize: number;
    };
    cache: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
    };
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
//# sourceMappingURL=unified-indexing-api.d.ts.map