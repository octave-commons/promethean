"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClojureCacheStrategy = void 0;
class ClojureCacheStrategy {
    constructor(cache) {
        this.cache = cache;
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            totalOperations: 0,
        };
    }
    /**
     * Get cached dependencies or install and cache them
     */
    async getOrInstall(workflowName, depsEdnHash, bbEdnHash) {
        const cacheKey = `${workflowName}-clojure-${depsEdnHash}-${bbEdnHash}`;
        this.stats.totalOperations++;
        // Try to get from cache
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            this.stats.cacheHits++;
            return { cached: true, dependencies: cached.dependencies };
        }
        // Cache miss - simulate installing dependencies
        this.stats.cacheMisses++;
        const dependencies = await this.simulateClojureInstall(depsEdnHash, bbEdnHash);
        // Cache the result
        await this.cache.set(cacheKey, { dependencies });
        return { cached: false, dependencies };
    }
    /**
     * Simulate Clojure dependency installation
     */
    async simulateClojureInstall(depsEdnHash, bbEdnHash) {
        // Simulate installation time
        await new Promise((resolve) => setTimeout(resolve, 150));
        // Return mock dependencies based on hashes
        return [
            `org.clojure/clojure@1.11.1-${depsEdnHash.slice(0, 8)}`,
            `org.clojure/tools.deps@0.18.1354-${bbEdnHash.slice(0, 8)}`,
            'borkdude/rewrite-edn@0.4.7',
            'borkdude/grasp@0.4.5',
        ];
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return { ...this.stats };
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
    }
}
exports.ClojureCacheStrategy = ClojureCacheStrategy;
