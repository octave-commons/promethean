/**
 * Unit tests for getCollectionsFor function
 */

import test from 'ava';
import { makePantheonPersistenceAdapter } from '../../index.js';
import { mockManagers, createMockManager, createSlowManager } from '../fixtures/mock-managers.js';
import {
  validContextSources,
  emptyContextSources,
  mixedContextSources,
} from '../fixtures/test-data.js';
import type { PersistenceAdapterDeps } from '../../index.js';

test('should return matching collections for valid sources', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  // Access the internal getCollectionsFor function through the adapter
  // Note: This may need adjustment based on the actual ContextPort interface
  const collections = await adapter.getCollectionsFor(validContextSources);

  t.true(Array.isArray(collections));
  t.is(collections.length, validContextSources.length);

  // Verify each collection matches a source
  collections.forEach((collection, index) => {
    t.is(collection.name, validContextSources[index].id);
  });
});

test('should return empty array for empty sources', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const collections = await adapter.getCollectionsFor(emptyContextSources);

  t.true(Array.isArray(collections));
  t.is(collections.length, 0);
});

test('should filter out non-matching managers', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const collections = await adapter.getCollectionsFor(mixedContextSources);

  t.true(Array.isArray(collections));
  // Should only return collections for matching sources
  t.true(collections.length <= mixedContextSources.length);

  // Verify returned collections match available managers
  collections.forEach((collection) => {
    t.true(mockManagers.some((manager) => manager.name === collection.name));
  });
});

test('should handle getStoreManagers throwing error', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => {
      throw new Error('Store managers unavailable');
    },
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  await t.throwsAsync(
    async () => {
      await adapter.getCollectionsFor(validContextSources);
    },
    {
      message: 'Store managers unavailable',
    },
  );
});

test('should handle getStoreManagers returning null', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => null as any,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const collections = await adapter.getCollectionsFor(validContextSources);

  t.true(Array.isArray(collections));
  t.is(collections.length, 0);
});

test('should handle getStoreManagers returning undefined', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => undefined as any,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const collections = await adapter.getCollectionsFor(validContextSources);

  t.true(Array.isArray(collections));
  t.is(collections.length, 0);
});

test('should handle slow getStoreManagers response', async (t) => {
  const slowManager = createSlowManager('slow-context', 100);
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => [slowManager],
  };

  const adapter = makePantheonPersistenceAdapter(deps);
  const startTime = Date.now();

  const collections = await adapter.getCollectionsFor([
    { id: 'slow-context', label: 'Slow Context' },
  ]);

  const endTime = Date.now();
  const duration = endTime - startTime;

  t.true(Array.isArray(collections));
  t.true(duration >= 100); // Should take at least 100ms
});

test('should handle duplicate source IDs', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const duplicateSources = [
    { id: 'user-context', label: 'User Context 1' },
    { id: 'user-context', label: 'User Context 2' },
  ];

  const collections = await adapter.getCollectionsFor(duplicateSources);

  t.true(Array.isArray(collections));
  // Should return one collection per matching manager, not per source
  t.is(collections.length, 1);
  t.is(collections[0].name, 'user-context');
});

test('should handle large number of sources efficiently', async (t) => {
  const manyManagers = Array.from({ length: 100 }, (_, i) => createMockManager(`context-${i}`));

  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => manyManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const manySources = Array.from({ length: 100 }, (_, i) => ({
    id: `context-${i}`,
    label: `Context ${i}`,
  }));

  const startTime = Date.now();
  const collections = await adapter.getCollectionsFor(manySources);
  const endTime = Date.now();

  t.true(Array.isArray(collections));
  t.is(collections.length, 100);
  t.true(endTime - startTime < 1000); // Should complete within 1 second
});

test('should handle managers with missing name property', async (t) => {
  const incompleteManager = { ...createMockManager('test') };
  delete (incompleteManager as any).name;

  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => [incompleteManager] as any,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  const collections = await adapter.getCollectionsFor([{ id: 'test', label: 'Test' }]);

  t.true(Array.isArray(collections));
  // Should handle gracefully - either return empty or the incomplete manager
});
