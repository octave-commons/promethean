/**
 * Review Cache
 *
 * Caching system for code review results to improve performance
 * and avoid redundant analysis.
 */
/**
 * In-memory cache for code review results
 */
export class ReviewCache {
    config;
    cache = new Map();
    cleanupTimer;
    constructor(config) {
        this.config = config;
        if (this.config.enabled) {
            // Start periodic cleanup
            this.startCleanup();
        }
    }
    /**
     * Get cached result
     */
    async get(key) {
        if (!this.config.enabled) {
            return undefined;
        }
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        // Check if entry has expired
        const age = Date.now() - entry.timestamp;
        if (age > this.config.ttl * 1000) {
            this.cache.delete(key);
            return undefined;
        }
        return entry;
    }
    /**
     * Set cache entry
     */
    async set(key, entry) {
        if (!this.config.enabled) {
            return;
        }
        // Ensure cache doesn't exceed max size
        if (this.cache.size >= this.config.maxSize) {
            this.evictOldest();
        }
        this.cache.set(key, entry);
    }
    /**
     * Delete cache entry
     */
    async delete(key) {
        this.cache.delete(key);
    }
    /**
     * Clear all cache entries
     */
    async clear() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            // TODO: Add hit rate tracking and memory usage estimation
        };
    }
    /**
     * Evict oldest entries
     */
    evictOldest() {
        const entries = Array.from(this.cache.entries());
        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        // Remove oldest 25% of entries
        const toRemove = Math.ceil(entries.length * 0.25);
        for (let i = 0; i < toRemove; i++) {
            const entry = entries[i];
            if (entry) {
                this.cache.delete(entry[0]);
            }
        }
    }
    /**
     * Start periodic cleanup
     */
    startCleanup() {
        // Run cleanup every 5 minutes
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.cache.entries()) {
            const age = now - entry.timestamp;
            if (age > this.config.ttl * 1000) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.cache.delete(key);
        }
        if (expiredKeys.length > 0) {
            console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }
    /**
     * Stop cleanup timer
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.cache.clear();
    }
}
//# sourceMappingURL=review-cache.js.map