import type { Cache } from '@promethean/level-cache';

/**
 * Build Cache Manager
 *
 * Central cache management for build operations with performance tracking.
 */

export interface BuildCacheStats {
  cacheHits: number;
  cacheMisses: number;
  totalOperations: number;
  corruptedEntries: number;
}

export interface PerformanceMetrics {
  totalOperations: number;
  cacheHitRate: number;
  averageCacheTime: number;
  cacheSize: number;
}

export class BuildCacheManager {
  private stats: BuildCacheStats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalOperations: 0,
    corruptedEntries: 0,
  };

  private cacheTimes: number[] = [];

  constructor(private cache: Cache<any>) {}

  /**
   * Get cached build result or build and cache it
   */
  async getOrBuild(
    workflowName: string,
    lockfileHash: string,
    packageJsonHash: string,
  ): Promise<{ cached: boolean; result: any }> {
    const startTime = Date.now();
    const cacheKey = `${workflowName}-build-${lockfileHash}-${packageJsonHash}`;

    this.stats.totalOperations++;

    try {
      // Try to get from cache
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        // Check for corruption
        if (this.isCorrupted(cached)) {
          // Remove corrupted entry and rebuild without caching
          await this.cache.del(cacheKey);
          this.stats.corruptedEntries++;
          const result = await this.simulateBuild(workflowName, lockfileHash, packageJsonHash);
          const cacheTime = Date.now() - startTime;
          this.cacheTimes.push(cacheTime);
          return { cached: false, result };
        } else {
          this.stats.cacheHits++;
          const cacheTime = Date.now() - startTime;
          this.cacheTimes.push(cacheTime);
          return { cached: true, result: cached };
        }
      }

      // Cache miss - simulate build (or corruption recovery)
      this.stats.cacheMisses++;
      const result = await this.simulateBuild(workflowName, lockfileHash, packageJsonHash);

      // Cache the result
      await this.cache.set(cacheKey, result);

      const cacheTime = Date.now() - startTime;
      this.cacheTimes.push(cacheTime);

      return { cached: false, result };
    } catch (error) {
      const cacheTime = Date.now() - startTime;
      this.cacheTimes.push(cacheTime);
      throw error;
    }
  }

  /**
   * Simulate build operation
   */
  private async simulateBuild(
    workflowName: string,
    lockfileHash: string,
    packageJsonHash: string,
  ): Promise<any> {
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
  /**
   * Check if cached data is corrupted
   */
  private isCorrupted(data: any): boolean {
    // Simple corruption detection - check for known corruption markers
    return data && typeof data === 'object' && 'corrupted' in data && data.corrupted === true;
  }

  getStats(): BuildCacheStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const cacheHitRate =
      this.stats.totalOperations > 0 ? this.stats.cacheHits / this.stats.totalOperations : 0;

    const averageCacheTime =
      this.cacheTimes.length > 0
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
  resetStats(): void {
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalOperations: 0,
      corruptedEntries: 0,
    };
    this.cacheTimes = [];
  }
}
