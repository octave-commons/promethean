import type { Cache } from '@promethean/level-cache';

/**
 * Cache Invalidator
 *
 * Handles intelligent cache invalidation based on dependency changes.
 */

export class CacheInvalidator {
  constructor(private cache: Cache<any>) {}

  /**
   * Invalidate cache entries when lockfile changes
   */
  async invalidateOnLockfileChange(
    oldLockfileHash: string,
    _newLockfileHash: string,
  ): Promise<number> {
    let invalidatedCount = 0;

    try {
      // Iterate through all cache entries
      for await (const [key] of await this.cache.entries()) {
        if (
          key.includes(`pnpm-${oldLockfileHash}-`) ||
          key.includes(`clojure-${oldLockfileHash}-`)
        ) {
          await this.cache.del(key);
          invalidatedCount++;
        }
      }
    } catch (error) {
      console.warn('Could not iterate cache entries for invalidation:', error);
    }

    return invalidatedCount;
  }

  /**
   * Invalidate cache entries when package.json changes
   */
  async invalidateOnPackageChange(
    lockfileHash: string,
    oldPackageHash: string,
    _newPackageHash: string,
  ): Promise<number> {
    let invalidatedCount = 0;

    try {
      // Iterate through all cache entries
      for await (const [key] of await this.cache.entries()) {
        if (key.includes(`-${lockfileHash}-${oldPackageHash}`)) {
          await this.cache.del(key);
          invalidatedCount++;
        }
      }
    } catch (error) {
      console.warn('Could not iterate cache entries for invalidation:', error);
    }

    return invalidatedCount;
  }

  /**
   * Invalidate cache entries for a specific workflow
   */
  async invalidateWorkflow(workflowName: string, dependencySignature: string): Promise<number> {
    let invalidatedCount = 0;

    try {
      // Iterate through all cache entries
      for await (const [key] of await this.cache.entries()) {
        if (key.startsWith(`${workflowName}-`) && key.includes(dependencySignature)) {
          await this.cache.del(key);
          invalidatedCount++;
        }
      }
    } catch (error) {
      console.warn('Could not iterate cache entries for invalidation:', error);
    }

    return invalidatedCount;
  }

  /**
   * Invalidate all cache entries (full cache clear)
   */
  async invalidateAll(): Promise<number> {
    let invalidatedCount = 0;

    try {
      // Iterate through all cache entries and delete them
      for await (const [key] of await this.cache.entries()) {
        await this.cache.del(key);
        invalidatedCount++;
      }
    } catch (error) {
      console.warn('Could not iterate cache entries for invalidation:', error);
    }

    return invalidatedCount;
  }

  /**
   * Invalidate expired cache entries
   */
  async invalidateExpired(): Promise<number> {
    // Use the built-in sweepExpired function if available
    if ('sweepExpired' in this.cache) {
      return await (this.cache as any).sweepExpired();
    }

    // Fallback: manual expired entry removal
    let invalidatedCount = 0;
    const now = Date.now();

    try {
      const cache = this.cache as Cache<any>;
      for await (const [key, value] of cache.entries()) {
        if (value && typeof value === 'object' && 'expiresAt' in value && value.expiresAt < now) {
          await cache.del(key);
          invalidatedCount++;
        }
      }
    } catch (error) {
      console.warn('Could not iterate cache entries for expired cleanup:', error);
    }

    return invalidatedCount;
  }
}
