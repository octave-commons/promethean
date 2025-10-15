"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCacheManager = void 0;
class BuildCacheManager {
    constructor(cache) {
        this.cache = cache;
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            totalOperations: 0,
        };
        this.cacheTimes = [];
    }
    /**
     * Get cached build result or build and cache it
     */
    async getOrBuild(workflowName, lockfileHash, packageJsonHash) {
        const startTime = Date.now();
        const cacheKey = `${workflowName}-build-${lockfileHash}-${packageJsonHash}`;
        this.stats.totalOperations++;
        try {
            // Try to get from cache
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                this.stats.cacheHits++;
                const cacheTime = Date.now() - startTime;
                this.cacheTimes.push(cacheTime);
                return { cached: true, result: cached };
            }
            // Cache miss - simulate build
            this.stats.cacheMisses++;
            const result = await this.simulateBuild(workflowName, lockfileHash, packageJsonHash);
            // Cache the result
            await this.cache.set(cacheKey, result);
            const cacheTime = Date.now() - startTime;
            this.cacheTimes.push(cacheTime);
            return { cached: false, result };
        }
        catch (error) {
            const cacheTime = Date.now() - startTime;
            this.cacheTimes.push(cacheTime);
            throw error;
        }
    }
    /**
     * Simulate build operation
     */
    async simulateBuild(workflowName, lockfileHash, packageJsonHash) {
        // Simulate build time
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
            workflowName,
            buildTime: Date.now(),
            dependencies: [`dep-${lockfileHash.slice(0, 8)}`, `dep-${packageJsonHash.slice(0, 8)}`],
            artifacts: [`artifact-${workflowName}-${Date.now()}`],
        };
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const cacheHitRate = this.stats.totalOperations > 0 ? this.stats.cacheHits / this.stats.totalOperations : 0;
        const averageCacheTime = this.cacheTimes.length > 0
            ? this.cacheTimes.reduce((sum, time) => sum + time, 0) / this.cacheTimes.length
            : 0;
        return {
            totalOperations: this.stats.totalOperations,
            cacheHitRate,
            averageCacheTime,
            cacheSize: this.cacheTimes.length, // Simplified cache size
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            totalOperations: 0,
        };
        this.cacheTimes = [];
    }
}
exports.BuildCacheManager = BuildCacheManager;
