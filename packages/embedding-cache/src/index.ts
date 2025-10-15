/**
 * Embedding-based cache for LLM prompt/response caching
 * Provides similarity-based caching compatible with level-cache interface
 */

import { ollamaEmbed, InMemoryChroma } from '@promethean/utils';

export type CacheEntry<T = unknown> = Readonly<{
  key: string;
  value: T;
  embedding: number[];
  createdAt: number;
  ttl?: number;
}>;

export type CacheOptions = Readonly<{
  similarityThreshold?: number;
  maxAge?: number;
  maxSize?: number;
  enableEmbedding?: boolean;
}>;

export type CacheStats = Readonly<{
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage?: number;
}>;

export type CacheResult<T> = Readonly<{
  hit: boolean;
  value?: T;
  similarity?: number;
}>;

/**
 * Embedding-based cache with level-cache compatible interface
 */
export class EmbeddingCache<T = unknown> {
  private readonly cache: InMemoryChroma<CacheEntry<T>>;
  private readonly options: Required<CacheOptions>;
  private stats = { hits: 0, misses: 0 };

  constructor(
    private readonly modelName: string,
    options: CacheOptions = {}
  ) {
    this.options = {
      similarityThreshold: options.similarityThreshold ?? 0.85,
      maxAge: options.maxAge ?? 24 * 60 * 60 * 1000, // 24 hours
      maxSize: options.maxSize ?? 1000,
      enableEmbedding: options.enableEmbedding ?? true,
    };

    this.cache = new InMemoryChroma<CacheEntry<T>>();
  }

  /**
   * Get value from cache with similarity matching
   */
  async get(key: string): Promise<T | undefined> {
    try {
      if (!this.options.enableEmbedding) {
        // Fallback to exact key matching
        return this.getExact(key);
      }

      const queryEmbedding = await this.generateEmbedding(key);
      const hits = this.cache.queryByEmbedding(queryEmbedding, {
        k: 1,
        filter: (metadata) => this.isValidEntry(metadata),
      });

      if (
        hits.length > 0 &&
        hits[0]!.score >= this.options.similarityThreshold
      ) {
        this.stats.hits++;
        console.log(
          `Cache hit for ${this.modelName} with similarity ${hits[0]!.score.toFixed(3)}`
        );
        return hits[0]!.metadata.value;
      }

      this.stats.misses++;
      return undefined;
    } catch (error) {
      console.warn('Cache lookup failed:', error);
      this.stats.misses++;
      return undefined;
    }
  }

  /**
   * Advanced get with similarity information
   */
  async getWithDetails(key: string): Promise<CacheResult<T>> {
    try {
      if (!this.options.enableEmbedding) {
        const value = this.getExact(key);
        return { hit: value !== undefined, value };
      }

      const queryEmbedding = await this.generateEmbedding(key);
      const hits = this.cache.queryByEmbedding(queryEmbedding, {
        k: 1,
        filter: (metadata) => this.isValidEntry(metadata),
      });

      if (
        hits.length > 0 &&
        hits[0]!.score >= this.options.similarityThreshold
      ) {
        this.stats.hits++;
        return {
          hit: true,
          value: hits[0]!.metadata.value,
          similarity: hits[0]!.score,
        };
      }

      this.stats.misses++;
      return { hit: false };
    } catch (error) {
      console.warn('Cache lookup failed:', error);
      this.stats.misses++;
      return { hit: false };
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      // Check size limit
      if (this.cache.size >= this.options.maxSize) {
        this.evictOldest();
      }

      const embedding = this.options.enableEmbedding
        ? await this.generateEmbedding(key)
        : [];

      const entry: CacheEntry<T> = {
        key,
        value,
        embedding,
        createdAt: Date.now(),
        ttl,
      };

      this.cache.add([
        {
          id: this.createCacheKey(key),
          embedding,
          metadata: entry,
        },
      ]);

      console.log(
        `Stored ${this.modelName} result in cache (size: ${this.cache.size})`
      );
    } catch (error) {
      console.warn('Failed to store in cache:', error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const result = await this.getWithDetails(key);
    return result.hit;
  }

  /**
   * Delete entry from cache
   */
  async delete(_key: string): Promise<boolean> {
    try {
      // Note: InMemoryChroma doesn't have delete method, this is a placeholder
      // In a real implementation, you'd need to add delete capability
      console.warn('Delete operation not implemented for InMemoryChroma');
      return false;
    } catch (error) {
      console.warn('Failed to delete from cache:', error);
      return false;
    }
  }

  /**
   * Clear all entries from cache
   */
  async clear(): Promise<void> {
    try {
      // Note: InMemoryChroma doesn't have clear method, this is a placeholder
      console.warn('Clear operation not implemented for InMemoryChroma');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await ollamaEmbed(this.modelName, text);
    } catch (error) {
      console.warn('Failed to generate embedding:', error);
      throw error;
    }
  }

  private createCacheKey(key: string): string {
    return Buffer.from(key).toString('base64').slice(0, 32);
  }

  private isValidEntry(metadata: CacheEntry<T>): boolean {
    const now = Date.now();
    const age = now - metadata.createdAt;

    if (age > this.options.maxAge) {
      return false;
    }

    if (metadata.ttl && age > metadata.ttl) {
      return false;
    }

    return true;
  }

  private getExact(key: string): T | undefined {
    if (this.cache.size === 0) {
      return undefined;
    }

    const hits = this.cache.queryByEmbedding([], {
      k: 1,
      filter: (metadata) => metadata.key === key && this.isValidEntry(metadata),
    });

    return hits.length > 0 ? hits[0]!.metadata.value : undefined;
  }

  private evictOldest(): void {
    try {
      const allEntries = this.cache.queryByEmbedding([], {
        k: this.options.maxSize,
        filter: () => true,
      });

      if (allEntries.length > 0) {
        // Find oldest entry
        const oldest = allEntries.reduce((prev, current) =>
          prev.metadata.createdAt < current.metadata.createdAt ? prev : current
        );

        // Note: InMemoryChroma doesn't have delete method
        // In a real implementation, you'd remove the oldest entry
        console.warn(
          `Eviction not implemented for InMemoryChroma, would remove: ${oldest!.metadata.key}`
        );
      }
    } catch (error) {
      console.warn('Failed to evict oldest entry:', error);
    }
  }
}

/**
 * Factory function to create cache instances
 */
export function createEmbeddingCache<T = unknown>(
  modelName: string,
  options?: CacheOptions
): EmbeddingCache<T> {
  return new EmbeddingCache<T>(modelName, options);
}

/**
 * Default cache instance for common use cases
 */
export function createDefaultCache<T = unknown>(
  modelName: string
): EmbeddingCache<T> {
  return new EmbeddingCache<T>(modelName, {
    similarityThreshold: 0.85,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 1000,
    enableEmbedding: true,
  });
}
