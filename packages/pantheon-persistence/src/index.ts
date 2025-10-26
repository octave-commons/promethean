/**
 * Pantheon Persistence Adapter
 * Wraps @promethean-os/persistence to provide ContextPort implementation
 */

import type { ContextSource } from '@promethean-os/pantheon-core';
import type { ContextPort, ContextPortDeps } from '@promethean-os/pantheon-core';
import { makeContextPort } from '@promethean-os/pantheon-core';
import type { DualStoreManager } from '@promethean-os/persistence';

/**
 * Metadata structure for context items used in role and name resolution.
 *
 * @interface ContextMetadata
 *
 * @example
 * ```typescript
 * const metadata: ContextMetadata = {
 *   role: 'user',
 *   type: 'user',
 *   displayName: 'John Doe',
 *   id: 'user-123',
 *   sessionId: 'session-456'
 * };
 * ```
 */
export interface ContextMetadata {
  /** Optional role specification for the context item */
  role?: 'system' | 'user' | 'assistant';

  /** Optional type specification (legacy support) */
  type?: 'user' | 'assistant';

  /** Optional display name for the context item */
  displayName?: string;

  /** Optional name field for the context item */
  name?: string;

  /** Optional unique identifier */
  id?: string;

  /** Additional metadata properties */
  [key: string]: unknown;
}

/**
 * Dependencies required for creating a Pantheon persistence adapter.
 *
 * @interface PersistenceAdapterDeps
 *
 * @example
 * ```typescript
 * const deps: PersistenceAdapterDeps = {
 *   getStoreManagers: async () => [mongoManager, chromaManager],
 *   resolveRole: (meta) => meta.role || 'system',
 *   resolveName: (meta) => meta.displayName || 'Unknown',
 *   formatTime: (ms) => new Date(ms).toLocaleString()
 * };
 * ```
 */
export type PersistenceAdapterDeps = {
  /**
   * Function that returns available DualStoreManager instances.
   * This function is called whenever context compilation is requested.
   *
   * @returns Promise resolving to an array of DualStoreManager instances
   *
   * @example
   * ```typescript
   * getStoreManagers: async () => {
   *   return [mongoManager, chromaManager];
   * }
   * ```
   */
  getStoreManagers: () => Promise<DualStoreManager[]>;

  /**
   * Optional function to resolve message roles from metadata.
   * If not provided, a default resolution strategy will be used.
   *
   * @param meta - Optional metadata object containing role information
   * @returns The resolved role as 'system', 'user', or 'assistant'
   *
   * @example
   * ```typescript
   * resolveRole: (meta) => {
   *   if (meta?.sender === 'human') return 'user';
   *   if (meta?.sender === 'ai') return 'assistant';
   *   return 'system';
   * }
   * ```
   */
  resolveRole?: (meta?: ContextMetadata) => 'system' | 'user' | 'assistant';

  /**
   * Optional function to resolve display names from metadata.
   * If not provided, a default resolution strategy will be used.
   *
   * @param meta - Optional metadata object containing name information
   * @returns The resolved display name as a string
   *
   * @example
   * ```typescript
   * resolveName: (meta) => {
   *   return meta?.username || meta?.author || 'Anonymous';
   * }
   * ```
   */
  resolveName?: (meta?: ContextMetadata) => string;

  /**
   * Optional function to format timestamps for display.
   * If not provided, ISO string format will be used.
   *
   * @param ms - Timestamp in milliseconds since epoch
   * @returns Formatted time string
   *
   * @example
   * ```typescript
   * formatTime: (ms) => {
   *   return new Date(ms).toLocaleString('en-US', {
   *     hour: '2-digit',
   *     minute: '2-digit',
   *     month: 'short',
   *     day: 'numeric'
   *   });
   * }
   * ```
   */
  formatTime?: (ms: number) => string;
};

/**
 * Creates a Pantheon persistence adapter that bridges the Pantheon context system
 * with the persistence layer using DualStoreManager instances.
 *
 * This adapter provides a ContextPort implementation that compiles context from
 * persistence stores by mapping context sources to their corresponding store managers.
 *
 * @param deps - Dependencies required for the adapter
 * @param deps.getStoreManagers - Function that returns available DualStoreManager instances
 * @param deps.resolveRole - Optional function to resolve message roles from metadata
 * @param deps.resolveName - Optional function to resolve display names from metadata
 * @param deps.formatTime - Optional function to format timestamps
 * @returns A ContextPort implementation that compiles context from persistence stores
 *
 * @example
 * ```typescript
 * const adapter = makePantheonPersistenceAdapter({
 *   getStoreManagers: async () => [manager1, manager2],
 *   resolveRole: (meta) => meta.role || 'system'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With all optional dependencies
 * const adapter = makePantheonPersistenceAdapter({
 *   getStoreManagers: async () => {
 *     const mongoManager = new DualStoreManager('mongodb', mongoClient);
 *     const chromaManager = new DualStoreManager('chroma', chromaClient);
 *     return [mongoManager, chromaManager];
 *   },
 *   resolveRole: (meta) => {
 *     if (meta?.sender === 'human') return 'user';
 *     if (meta?.sender === 'ai') return 'assistant';
 *     return 'system';
 *   },
 *   resolveName: (meta) => meta?.username || 'Anonymous',
 *   formatTime: (ms) => new Date(ms).toLocaleString()
 * });
 * ```
 *
 * @throws {Error} When getStoreManagers is not provided or not a function
 * @throws {Error} When dependencies object is null or undefined
 *
 * @since 0.1.0
 */

/**
 * Configuration options for the manager cache.
 * 
 * @interface CacheConfig
 * 
 * @example
 * ```typescript
 * const config: CacheConfig = {
 *   ttl: 300000, // 5 minutes
 *   maxSize: 20   // Maximum 20 cached entries
 * };
 * ```
 */
export interface CacheConfig {
  /** Time to live for cache entries in milliseconds */
  ttl: number;
  
  /** Maximum number of cached entries before eviction */
  maxSize: number;
}

/**
 * Metrics and statistics for cache performance monitoring.
 * 
 * @interface CacheMetrics
 * 
 * @example
 * ```typescript
 * const metrics: CacheMetrics = {
 *   hits: 150,
 *   misses: 25,
 *   sets: 30,
 *   evictions: 5,
 *   currentSize: 15
 * };
 * ```
 */
export interface CacheMetrics {
  /** Number of successful cache hits */
  hits: number;
  
  /** Number of cache misses */
  misses: number;
  
  /** Number of items added to cache */
  sets: number;
  
  /** Number of items evicted from cache */
  evictions: number;
  
  /** Current number of items in cache */
  currentSize: number;
}

/**
 * Internal cache manager for DualStoreManager instances with TTL and size limits.
 *
 * @class ManagerCache
 *
 * @example
 * ```typescript
 * const cache = new ManagerCache({ ttl: 60000, maxSize: 10 });
 * const managers = await cache.get('sources-key', async () => {
 *   return await fetchManagers();
 * });
 * ```
 */
class ManagerCache {
  private cache: Map<string, { managers: DualStoreManager[]; timestamp: number }> = new Map();
  private config: CacheConfig;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    currentSize: 0,
  };

  /**
   * Creates a new ManagerCache instance.
   *
   * @param config - Cache configuration options
   */
  constructor(config: CacheConfig = { ttl: 60000, maxSize: 10 }) {
    this.config = config;
  }

  /**
   * Retrieves managers from cache or fetches them using the provided function.
   *
   * @param key - Cache key for the managers
   * @param fetcher - Async function to fetch managers when cache miss occurs
   * @returns Promise resolving to DualStoreManager array
   */
  async get(key: string, fetcher: () => Promise<DualStoreManager[]>): Promise<DualStoreManager[]> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.config.ttl) {
      this.metrics.hits++;
      return cached.managers;
    }

    this.metrics.misses++;
    const managers = await fetcher();

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, { managers, timestamp: now });
    this.metrics.sets++;
    this.metrics.currentSize = this.cache.size;

    // Cleanup expired entries
    this.cleanup();

    return managers;
  }

  /**
   * Gets current cache metrics.
   *
   * @returns Copy of current cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Clears all cached entries and resets metrics.
   */
  clear(): void {
    this.cache.clear();
    this.metrics.currentSize = 0;
  }

  /**
   * Evicts the oldest entry from cache.
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Removes expired entries from cache.
   * @private
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });

    this.metrics.currentSize = this.cache.size;
  }
}

export const makePantheonPersistenceAdapter = (deps: PersistenceAdapterDeps): ContextPort => {
  // Input validation for dependencies
  if (!deps) {
    throw new Error('Dependencies object is required for makePantheonPersistenceAdapter');
  }

  if (typeof deps.getStoreManagers !== 'function') {
    throw new Error('getStoreManagers function is required in dependencies');
  }

  const contextDeps: ContextPortDeps = {
    getCollectionsFor: async (sources: readonly ContextSource[]) => {
      // Input validation for sources
      if (!Array.isArray(sources)) {
        throw new Error('Sources must be an array');
      }

      if (sources.length === 0) {
        console.warn('Empty sources array provided to getCollectionsFor');
        return [];
      }

      // Validate that all sources have valid IDs
      const invalidSources = sources.filter(
        (source) => !source.id || typeof source.id !== 'string',
      );
      if (invalidSources.length > 0) {
        console.warn(
          'Found sources with invalid IDs:',
          invalidSources.map((s) => ({ id: s.id, label: s.label })),
        );
      }

      try {
        const managers = await deps.getStoreManagers();

        if (!managers) {
          console.warn('getStoreManagers returned null or undefined');
          return [];
        }

        if (!Array.isArray(managers)) {
          console.error('getStoreManagers did not return an array, got:', typeof managers);
          throw new Error('getStoreManagers must return an array of DualStoreManager objects');
        }

        if (managers.length === 0) {
          console.warn('No store managers available');
          return [];
        }

        // Map context sources to actual store managers
        const validManagers = managers.filter((manager) =>
          sources.some((source) => source.id && source.id === manager.name),
        );

        if (validManagers.length === 0) {
          const sourceIds = sources.filter((s) => s.id).map((s) => s.id);
          const managerNames = managers.map((m) => m.name);
          console.warn(
            'No matching managers found for sources. Source IDs:',
            sourceIds,
            'Available managers:',
            managerNames,
          );
        }

        return validManagers;
      } catch (error) {
        console.error('Failed to get store managers:', error);
        throw new Error(
          `Store manager retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    resolveRole:
      deps.resolveRole ||
      ((meta?: ContextMetadata) => {
        // Default role resolution logic
        if (meta?.role) return meta.role;
        if (meta?.type === 'user') return 'user';
        if (meta?.type === 'assistant') return 'assistant';
        return 'system';
      }),
    resolveName:
      deps.resolveName ||
      ((meta?: ContextMetadata) => {
        // Default name resolution logic
        return meta?.displayName || meta?.name || meta?.id || 'Unknown';
      }),
    formatTime:
      deps.formatTime ||
      ((ms: number) => {
        // Default time formatting
        return new Date(ms).toISOString();
      }),
  };

  const contextPort = makeContextPort(contextDeps);

  return contextPort;
};
