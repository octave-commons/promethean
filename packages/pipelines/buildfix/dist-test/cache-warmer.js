"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheWarmer = void 0;
class CacheWarmer {
    constructor(cache) {
        this.cache = cache;
    }
    /**
     * Warm cache with common dependency patterns
     */
    async warmCache(patterns) {
        let warmedCount = 0;
        for (const pattern of patterns) {
            const warmed = await this.warmPattern(pattern);
            if (warmed) {
                warmedCount++;
            }
        }
        return warmedCount;
    }
    /**
     * Warm a specific dependency pattern
     */
    async warmPattern(pattern) {
        try {
            // Generate cache keys for different workflows
            const workflows = ['build', 'test', 'lint'];
            for (const workflow of workflows) {
                const pnpmKey = `pnpm-${pattern.lockfile}-${pattern.package}`;
                const clojureKey = `clojure-${pattern.lockfile}-${pattern.package}`;
                // Check if already cached
                const pnpmCached = await this.cache.get(pnpmKey);
                const clojureCached = await this.cache.get(clojureKey);
                if (!pnpmCached) {
                    // Simulate warming pnpm cache
                    const pnpmData = await this.simulatePnpmWarm(pattern);
                    await this.cache.set(pnpmKey, pnpmData);
                }
                if (!clojureCached) {
                    // Simulate warming Clojure cache
                    const clojureData = await this.simulateClojureWarm(pattern);
                    await this.cache.set(clojureKey, clojureData);
                }
            }
            return true;
        }
        catch (error) {
            console.error(`Failed to warm pattern ${pattern.lockfile}-${pattern.package}:`, error);
            return false;
        }
    }
    /**
     * Simulate pnpm cache warming
     */
    async simulatePnpmWarm(pattern) {
        // Simulate warming time
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
            type: 'pnpm',
            pattern,
            warmedAt: Date.now(),
            dependencies: [
                `@promethean/core@1.0.0-${pattern.lockfile.slice(0, 8)}`,
                `@promethean/utils@1.0.0-${pattern.package.slice(0, 8)}`,
            ],
        };
    }
    /**
     * Simulate Clojure cache warming
     */
    async simulateClojureWarm(pattern) {
        // Simulate warming time
        await new Promise((resolve) => setTimeout(resolve, 75));
        return {
            type: 'clojure',
            pattern,
            warmedAt: Date.now(),
            dependencies: [
                `org.clojure/clojure@1.11.1-${pattern.lockfile.slice(0, 8)}`,
                `org.clojure/tools.deps@0.18.1354-${pattern.package.slice(0, 8)}`,
            ],
        };
    }
    /**
     * Get warming statistics
     */
    async getWarmingStats() {
        let totalEntries = 0;
        let pnpmEntries = 0;
        let clojureEntries = 0;
        try {
            for await (const [key, value] of this.cache.entries()) {
                totalEntries++;
                if (key.startsWith('pnpm-')) {
                    pnpmEntries++;
                }
                else if (key.startsWith('clojure-')) {
                    clojureEntries++;
                }
            }
        }
        catch (error) {
            // If entries() is not available, return zeros
            console.warn('Could not get cache entries for stats:', error);
        }
        return {
            totalEntries,
            pnpmEntries,
            clojureEntries,
        };
    }
}
exports.CacheWarmer = CacheWarmer;
