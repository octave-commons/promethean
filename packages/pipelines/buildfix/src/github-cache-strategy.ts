import type { Cache } from '@promethean/level-cache';

/**
 * GitHub Cache Strategy
 *
 * Integrates with GitHub Actions workflow context for optimal caching.
 */

export interface GitHubContext {
  workflow: string;
  job: string;
  runner: {
    os: string;
  };
  repository: string;
}

export interface GitHubCacheResult {
  cacheKey: string;
  restoreKeys: string[];
  path: string[];
}

export class GitHubCacheStrategy {
  constructor(private cache: Cache<any>) {}

  /**
   * Setup cache for GitHub Actions workflow
   */
  async setupCache(context: GitHubContext): Promise<GitHubCacheResult> {
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
  private generateCacheKey(context: GitHubContext): string {
    const { workflow, job, runner, repository } = context;

    // Include OS, workflow, job, and repository for specificity
    return `${runner.os}-${repository}-${workflow}-${job}-v1`;
  }

  /**
   * Generate fallback restore keys for partial cache hits
   */
  private generateRestoreKeys(context: GitHubContext): string[] {
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
  private getCachePaths(): string[] {
    return ['~/.pnpm-store', '~/.npm', '~/.cache/Cypress', 'node_modules/.cache', '.nx/cache'];
  }

  /**
   * Check if cache exists for given context
   */
  async hasCache(context: GitHubContext): Promise<boolean> {
    const cacheKey = this.generateCacheKey(context);
    return await this.cache.has(`github-data-${cacheKey}`);
  }

  /**
   * Get cached data for context
   */
  async getCachedData(context: GitHubContext): Promise<any> {
    const cacheKey = this.generateCacheKey(context);
    return await this.cache.get(`github-data-${cacheKey}`);
  }

  /**
   * Set cached data for context
   */
  async setCachedData(context: GitHubContext, data: any): Promise<void> {
    const cacheKey = this.generateCacheKey(context);
    await this.cache.set(`github-data-${cacheKey}`, data);
  }
}
