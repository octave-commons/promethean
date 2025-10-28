/**
 * Review Cache
 *
 * Caching system for code review results to improve performance
 * and avoid redundant analysis.
 */
import type { ReviewCacheEntry } from '../types.js';
export interface CacheConfig {
    enabled: boolean;
    ttl: number;
    maxSize: number;
}
/**
 * In-memory cache for code review results
 */
export declare class ReviewCache {
    private config;
    private cache;
    private cleanupTimer?;
    constructor(config: CacheConfig);
    /**
     * Get cached result
     */
    get(key: string): Promise<ReviewCacheEntry | undefined>;
    /**
     * Set cache entry
     */
    set(key: string, entry: ReviewCacheEntry): Promise<void>;
    /**
     * Delete cache entry
     */
    delete(key: string): Promise<void>;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate?: number;
        memoryUsage?: number;
    };
    /**
     * Evict oldest entries
     */
    private evictOldest;
    /**
     * Start periodic cleanup
     */
    private startCleanup;
    /**
     * Cleanup expired entries
     */
    private cleanup;
    /**
     * Stop cleanup timer
     */
    destroy(): void;
}
//# sourceMappingURL=review-cache.d.ts.map