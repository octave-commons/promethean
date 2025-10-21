"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubCacheStrategy = void 0;
class GitHubCacheStrategy {
    constructor(cache) {
        this.cache = cache;
    }
    /**
     * Setup cache for GitHub Actions workflow
     */
    async setupCache(context) {
        const cacheKey = this.generateCacheKey(context);
        const restoreKeys = this.generateRestoreKeys(context);
        const paths = this.getCachePaths();
        // Store the cache configuration for later use
        await this.cache.set(`github-config-${cacheKey}`, {
            context,
            cacheKey,
            restoreKeys,
            paths,
            timestamp: Date.now(),
        });
        return {
            cacheKey,
            restoreKeys,
            path: paths,
        };
    }
    /**
     * Generate GitHub-specific cache key
     */
    generateCacheKey(context) {
        const { workflow, job, runner, repository } = context;
        // Include OS, workflow, job, and repository for specificity
        return `${runner.os}-${repository}-${workflow}-${job}-v1`;
    }
    /**
     * Generate fallback restore keys for partial cache hits
     */
    generateRestoreKeys(context) {
        const { workflow, job, runner, repository } = context;
        return [
            // Most specific: exact match
            `${runner.os}-${repository}-${workflow}-${job}-v1`,
            // Less specific: same workflow, different job
            `${runner.os}-${repository}-${workflow}-v1`,
            // Even less specific: same repository, different workflow
            `${runner.os}-${repository}-v1`,
            // Least specific: same OS only
            `${runner.os}-v1`,
        ];
    }
    /**
     * Get cache paths for GitHub Actions
     */
    getCachePaths() {
        return ['~/.pnpm-store', '~/.npm', '~/.cache/Cypress', 'node_modules/.cache', '.nx/cache'];
    }
    /**
     * Check if cache exists for given context
     */
    async hasCache(context) {
        const cacheKey = this.generateCacheKey(context);
        return await this.cache.has(`github-data-${cacheKey}`);
    }
    /**
     * Get cached data for context
     */
    async getCachedData(context) {
        const cacheKey = this.generateCacheKey(context);
        return await this.cache.get(`github-data-${cacheKey}`);
    }
    /**
     * Set cached data for context
     */
    async setCachedData(context, data) {
        const cacheKey = this.generateCacheKey(context);
        await this.cache.set(`github-data-${cacheKey}`, data);
    }
}
exports.GitHubCacheStrategy = GitHubCacheStrategy;
