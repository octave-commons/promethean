/**
 * Unified Indexing Client Implementation
 *
 * This module implements the unified indexing client that provides a single
 * interface for all indexing operations across different storage backends.
 */

import type {
    UnifiedIndexingClient,
    UnifiedIndexingConfig,
    SearchQuery,
    SearchResponse,
    SearchResult,
    IndexingStats,
    IndexingOptions,
} from './unified-indexing-api.js';

import {
    IndexableContent,
    ContentType,
    ContentSource,
    validateIndexableContent,
    transformDualStoreEntry,
} from './unified-content-model.js';

import type { DualStoreManager } from './dualStore.js';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Partial<UnifiedIndexingConfig> = {
    embedding: {
        model: 'text-embedding-ada-002',
        dimensions: 1536,
        batchSize: 100,
    },
    cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
    },
    validation: {
        strict: true,
        skipVectorValidation: false,
        maxContentLength: 1000000, // 1MB
    },
};

/**
 * Unified indexing client implementation
 */
export class UnifiedIndexingClientImpl implements UnifiedIndexingClient {
    private config: UnifiedIndexingConfig;
    private dualStoreManager: DualStoreManager<'text', 'timestamp'>;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();

    constructor(config: UnifiedIndexingConfig, dualStoreManager: DualStoreManager<'text', 'timestamp'>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.dualStoreManager = dualStoreManager;
    }

    /**
     * Index a single content item
     */
    async index(content: IndexableContent, options: IndexingOptions = {}): Promise<string> {
        const startTime = Date.now();

        try {
            // Validate content if strict mode is enabled
            if (this.config.validation?.strict || options.validate) {
                const validation = validateIndexableContent(content);
                if (!validation.valid) {
                    throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
                }
            }

            // Check content length
            if (content.content.length > (this.config.validation?.maxContentLength || 1000000)) {
                throw new Error('Content exceeds maximum length limit');
            }

            // Transform to dual store format
            const dualStoreEntry = this.transformToDualStore(content);

            // Index using dual store manager
            await this.dualStoreManager.addEntry(dualStoreEntry);
            const id = dualStoreEntry.id;

            // Cache the result if caching is enabled
            if (this.config.cache?.enabled) {
                this.setCache(`content:${id}`, content);
            }

            return id;
        } catch (error) {
            throw new Error(`Indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            console.debug(`Indexing completed in ${Date.now() - startTime}ms`);
        }
    }

    /**
     * Index multiple content items in batch
     */
    async indexBatch(contents: IndexableContent[], options: IndexingOptions = {}): Promise<string[]> {
        const batchSize = options.batchSize || this.config.embedding?.batchSize || 100;
        const concurrency = options.concurrency || 1;

        const results: string[] = [];

        // Process in batches
        for (let i = 0; i < contents.length; i += batchSize) {
            const batch = contents.slice(i, i + batchSize);

            if (concurrency === 1) {
                // Sequential processing
                for (const content of batch) {
                    const id = await this.index(content, options);
                    results.push(id);
                }
            } else {
                // Parallel processing (limited concurrency)
                const promises = batch.map((content) => this.index(content, options));
                const batchResults = await Promise.all(promises);
                results.push(...batchResults);
            }
        }

        return results;
    }

    /**
     * Search content
     */
    async search(query: SearchQuery): Promise<SearchResponse> {
        const startTime = Date.now();

        try {
            // Execute search using getMostRelevant
            const dualStoreResults = await this.dualStoreManager.getMostRelevant(
                [query.query || ''],
                query.limit || 100,
                query.metadata,
            );

            // Transform results to unified format
            const results: SearchResult[] = dualStoreResults.map((result: any) => ({
                content: this.transformFromDualStore(result),
                score: result.score || 0,
                highlights: result.highlights || [],
            }));

            // Apply additional filtering if needed
            const filteredResults = this.applyFilters(results, query);

            return {
                results: filteredResults,
                total: filteredResults.length,
                took: Date.now() - startTime,
                query,
            };
        } catch (error) {
            throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get content by ID
     */
    async getById(id: string): Promise<IndexableContent | null> {
        // Check cache first
        if (this.config.cache?.enabled) {
            const cached = this.getCache(`content:${id}`);
            if (cached) {
                return cached;
            }
        }

        try {
            const result = await this.dualStoreManager.get(id);
            return result ? this.transformFromDualStore(result) : null;
        } catch (error) {
            console.error(`Failed to get content by ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Get content by type
     */
    async getByType(type: ContentType): Promise<IndexableContent[]> {
        const query: SearchQuery = { type };
        const response = await this.search(query);
        return response.results.map((r) => r.content);
    }

    /**
     * Get content by source
     */
    async getBySource(source: ContentSource): Promise<IndexableContent[]> {
        const query: SearchQuery = { source };
        const response = await this.search(query);
        return response.results.map((r) => r.content);
    }

    /**
     * Update existing content
     */
    async update(id: string, content: Partial<IndexableContent>): Promise<boolean> {
        try {
            // Get existing content
            const existing = await this.getById(id);
            if (!existing) {
                return false;
            }

            // Merge with updates
            const updated: IndexableContent = {
                ...existing,
                ...content,
                id, // Ensure ID is preserved
                timestamp: Date.now(), // Update timestamp
            };

            // Re-index the updated content
            await this.index(updated, { overwrite: true });

            // Update cache
            if (this.config.cache?.enabled) {
                this.setCache(`content:${id}`, updated);
            }

            return true;
        } catch (error) {
            console.error(`Failed to update content ${id}:`, error);
            return false;
        }
    }

    /**
     * Delete content by ID
     */
    async delete(id: string): Promise<boolean> {
        try {
            // Note: DualStoreManager doesn't have a delete method yet
            // This would need to be implemented in DualStoreManager
            console.warn(`Delete operation not yet implemented for ID: ${id}`);

            // Remove from cache
            if (this.config.cache?.enabled) {
                this.cache.delete(`content:${id}`);
            }

            return false; // Not implemented
        } catch (error) {
            console.error(`Failed to delete content ${id}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple content items in batch
     */
    async deleteBatch(ids: string[]): Promise<boolean[]> {
        const results = await Promise.allSettled(ids.map((id) => this.delete(id)));

        return results.map((result) => (result.status === 'fulfilled' ? result.value : false));
    }

    /**
     * Re-index all content
     */
    async reindex(_options: IndexingOptions = {}): Promise<void> {
        // This would typically involve:
        // 1. Getting all existing content
        // 2. Clearing the index
        // 3. Re-indexing everything with new options

        throw new Error('Reindex operation not yet implemented');
    }

    /**
     * Optimize the index
     */
    async optimize(): Promise<void> {
        try {
            // Note: DualStoreManager doesn't have an optimize method yet
            console.warn('Optimize operation not yet implemented');
        } catch (error) {
            throw new Error(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get indexing statistics
     */
    async getStats(): Promise<IndexingStats> {
        try {
            // Note: DualStoreManager doesn't have a getStats method yet
            // Using consistency report as a fallback
            const consistencyReport = await this.dualStoreManager.getConsistencyReport();

            return {
                totalContent: consistencyReport.totalDocuments || 0,
                contentByType: {} as Record<ContentType, number>,
                contentBySource: {} as Record<ContentSource, number>,
                lastIndexed: Date.now(),
                storageStats: {
                    vectorSize: 0,
                    metadataSize: 0,
                    totalSize: 0,
                },
            };
        } catch (error) {
            throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{
        healthy: boolean;
        vectorStore: boolean;
        metadataStore: boolean;
        issues: string[];
    }> {
        const issues: string[] = [];

        try {
            // Note: DualStoreManager doesn't have a healthCheck method yet
            // Using consistency check as a fallback
            const consistencyReport = await this.dualStoreManager.getConsistencyReport();

            return {
                healthy:
                    consistencyReport.consistentDocuments === consistencyReport.totalDocuments && issues.length === 0,
                vectorStore: consistencyReport.missingVectors === 0,
                metadataStore: true, // Assume metadata store is healthy if we can get the report
                issues,
            };
        } catch (error) {
            issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                healthy: false,
                vectorStore: false,
                metadataStore: false,
                issues,
            };
        }
    }

    /**
     * Transform IndexableContent to DualStoreEntry format
     */
    private transformToDualStore(content: IndexableContent): any {
        return {
            id: content.id,
            text: content.content,
            timestamp: content.timestamp,
            metadata: {
                ...content.metadata,
                type: content.type,
                source: content.source,
            },
        };
    }

    /**
     * Transform DualStoreEntry to IndexableContent format
     */
    private transformFromDualStore(entry: any): IndexableContent {
        return transformDualStoreEntry(entry);
    }

    /**
     * Apply additional filters to search results
     */
    private applyFilters(results: SearchResult[], query: SearchQuery): SearchResult[] {
        let filtered = results;

        // Type filtering
        if (query.type) {
            const types = Array.isArray(query.type) ? query.type : [query.type];
            filtered = filtered.filter((r) => types.includes(r.content.type));
        }

        // Source filtering
        if (query.source) {
            const sources = Array.isArray(query.source) ? query.source : [query.source];
            filtered = filtered.filter((r) => sources.includes(r.content.source));
        }

        // Date filtering
        if (query.dateFrom) {
            filtered = filtered.filter((r) => r.content.timestamp >= query.dateFrom!);
        }
        if (query.dateTo) {
            filtered = filtered.filter((r) => r.content.timestamp <= query.dateTo!);
        }

        // Tag filtering
        if (query.tags && query.tags.length > 0) {
            filtered = filtered.filter((r) => query.tags!.some((tag) => r.content.metadata.tags?.includes(tag)));
        }

        return filtered;
    }

    /**
     * Get cached value
     */
    private getCache(key: string): any | null {
        if (!this.config.cache?.enabled) return null;

        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check TTL
        if (Date.now() - cached.timestamp > (this.config.cache.ttl || 300000)) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Set cached value
     */
    private setCache(key: string, data: any): void {
        if (!this.config.cache?.enabled) return;

        // Check max size
        if (this.cache.size >= (this.config.cache.maxSize || 1000)) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
}

/**
 * Factory function to create unified indexing client
 */
export async function createUnifiedIndexingClient(config: UnifiedIndexingConfig): Promise<UnifiedIndexingClient> {
    // Import DualStoreManager dynamically to avoid circular dependencies
    const { DualStoreManager } = await import('./dualStore.js');

    // Create dual store manager
    const dualStoreManager = await DualStoreManager.create(
        config.vectorStore.indexName || 'unified-index',
        'text',
        'timestamp',
    );

    // Create and return unified client
    return new UnifiedIndexingClientImpl(config, dualStoreManager);
}
