/**
 * Unit tests for caching functionality in pantheon-persistence adapter
 */

import test from 'ava';
import { makePantheonPersistenceAdapter } from '../../index.js';
import { mockManagers } from '../fixtures/mock-managers.js';
import type { PersistenceAdapterDeps } from '../../index.js';
import type { CacheConfig } from '../../index.js';

test('should create adapter with caching enabled', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const cacheConfig: CacheConfig = {
    ttl: 60000,
    maxSize: 10,
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
  t.truthy(adapter.getCacheMetrics);
  t.truthy(adapter.clearCache);
  t.is(typeof adapter.getCacheMetrics, 'function');
  t.is(typeof adapter.clearCache, 'function');
});

test('should not add cache methods when caching is disabled', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
  t.falsy(adapter.getCacheMetrics);
  t.falsy(adapter.clearCache);
});

test('should return initial cache metrics', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const cacheConfig: CacheConfig = {
    ttl: 60000,
    maxSize: 10,
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);
  const metrics = adapter.getCacheMetrics!();

  t.is(metrics.hits, 0);
  t.is(metrics.misses, 0);
  t.is(metrics.sets, 0);
  t.is(metrics.evictions, 0);
  t.is(metrics.currentSize, 0);
});

test('should clear cache and reset metrics', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const cacheConfig: CacheConfig = {
    ttl: 60000,
    maxSize: 10,
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);

  // Clear cache
  adapter.clearCache!();

  const metrics = adapter.getCacheMetrics!();
  t.is(metrics.currentSize, 0);
});

test('should use cache when compiling context', async (t) => {
  let callCount = 0;
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => {
      callCount++;
      return mockManagers;
    },
  };

  const cacheConfig: CacheConfig = {
    ttl: 60000,
    maxSize: 10,
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);

  // First call should hit fetcher
  await adapter.compile({
    sources: [{ id: 'test-source', label: 'Test Source' }],
    texts: ['test text'],
  });
  t.is(callCount, 1);

  // Second call should use cache
  await adapter.compile({
    sources: [{ id: 'test-source', label: 'Test Source' }],
    texts: ['test text'],
  });
  t.is(callCount, 1);

  // Second call should use cache
  await adapter.compile({
    sources: [{ id: 'test-source', label: 'Test Source' }],
    texts: ['test text'],
  });
  t.is(callCount, 1); // Should still be 1, not 2

  const metrics = adapter.getCacheMetrics!();
  t.is(metrics.hits, 1);
  t.is(metrics.misses, 1);
  t.is(metrics.sets, 1);
});

test('should handle cache expiration', async (t) => {
  let callCount = 0;
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => {
      callCount++;
      return mockManagers;
    },
  };

  const cacheConfig: CacheConfig = {
    ttl: 50, // Very short TTL
    maxSize: 10,
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);

  // First call
  await adapter.compile({
    sources: [{ id: 'test-source', label: 'Test Source' }],
    texts: ['test text'],
  });
  t.is(callCount, 1);

  // Wait for cache to expire
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Second call should hit fetcher again due to expiration
  await adapter.compile({
    sources: [{ id: 'test-source', label: 'Test Source' }],
    texts: ['test text'],
  });
  t.is(callCount, 1);

  // Wait for cache to expire
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Second call should hit fetcher again due to expiration
  await adapter.compile({
    sources: [{ id: 'test-source', label: 'Test Source' }],
    texts: ['test text'],
  });
  t.is(callCount, 2);

  const metrics = adapter.getCacheMetrics!();
  t.is(metrics.hits, 0);
  t.is(metrics.misses, 2);
  t.is(metrics.sets, 2);
});

test('should handle different source combinations separately', async (t) => {
  let callCount = 0;
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => {
      callCount++;
      return mockManagers;
    },
  };

  const cacheConfig: CacheConfig = {
    ttl: 60000,
    maxSize: 10,
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);

  // Different source combinations should create separate cache entries
  await adapter.compile({
    sources: [{ id: 'source1', label: 'Source 1' }],
    texts: ['test text'],
  });
  t.is(callCount, 1);

  await adapter.compile({
    sources: [{ id: 'source2', label: 'Source 2' }],
    texts: ['test text'],
  });
  t.is(callCount, 2);

  await adapter.compile({
    sources: [{ id: 'source1', label: 'Source 1' }],
    texts: ['test text'],
  });
  t.is(callCount, 2); // Should use cache

  await adapter.compile({
    sources: [{ id: 'source2', label: 'Source 2' }],
    texts: ['test text'],
  });
  t.is(callCount, 2); // Should use cache

  await adapter.compile({
    sources: [{ id: 'source2', label: 'Source 2' }],
    texts: ['test text'],
  });
  t.is(callCount, 2); // Should use cache

  const metrics = adapter.getCacheMetrics!();
  t.is(metrics.hits, 2);
  t.is(metrics.misses, 2);
  t.is(metrics.sets, 2);
  t.is(metrics.currentSize, 2);
});

test('should handle cache eviction when max size is reached', async (t) => {
  let callCount = 0;
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => {
      callCount++;
      return mockManagers;
    },
  };

  const cacheConfig: CacheConfig = {
    ttl: 60000,
    maxSize: 2, // Small max size to trigger eviction
  };

  const adapter = makePantheonPersistenceAdapter(deps, cacheConfig);

  // Fill cache to max capacity
  await adapter.compile({
    sources: [{ id: 'source1', label: 'Source 1' }],
    texts: ['test text'],
  });
  await adapter.compile({
    sources: [{ id: 'source2', label: 'Source 2' }],
    texts: ['test text'],
  });
  t.is(callCount, 2);

  // Add one more to trigger eviction
  await adapter.compile({
    sources: [{ id: 'source3', label: 'Source 3' }],
    texts: ['test text'],
  });
  await adapter.compile({
    sources: [{ id: 'source2', label: 'Source 2' }],
    texts: ['test text'],
  });
  t.is(callCount, 3);

  const metrics = adapter.getCacheMetrics!();
  t.is(metrics.evictions, 1);
  t.is(metrics.currentSize, 2); // Should still be at max size
});
