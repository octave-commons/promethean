/**
 * Unit tests for makePantheonPersistenceAdapter function
 */

import test from 'ava';
import { makePantheonPersistenceAdapter } from '../../index.js';
import { mockManagers, createMockManager } from '../fixtures/mock-managers.js';
import type { PersistenceAdapterDeps } from '../../index.js';

test('should create adapter with valid dependencies', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});

test('should create adapter with custom resolvers', (t) => {
  const customResolveRole = () => 'user' as const;
  const customResolveName = () => 'Custom Name';
  const customFormatTime = () => '2023-01-01T00:00:00.000Z';

  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
    resolveRole: customResolveRole,
    resolveName: customResolveName,
    formatTime: customFormatTime,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});

test('should create adapter with minimal dependencies', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => [],
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});

test('should throw error with invalid getStoreManagers', (t) => {
  const deps = {
    getStoreManagers: 'not-a-function' as any,
  };

  t.throws(() => makePantheonPersistenceAdapter(deps), {
    message: /getStoreManagers must be a function/,
  });
});

test('should handle null dependencies gracefully', (t) => {
  t.throws(() => makePantheonPersistenceAdapter(null as any), {
    message: /deps must be an object/,
  });
});

test('should handle undefined dependencies gracefully', (t) => {
  t.throws(() => makePantheonPersistenceAdapter(undefined as any), {
    message: /deps must be an object/,
  });
});

test('should create adapter with async getStoreManagers returning empty array', async (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => [],
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});

test('should create adapter with getStoreManagers that throws', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => {
      throw new Error('Store managers unavailable');
    },
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});

test('should create adapter with mixed valid and invalid resolvers', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => mockManagers,
    resolveRole: null as any,
    resolveName: undefined as any,
    formatTime: 'not-a-function' as any,
  };

  // Should not throw during creation, but may throw during usage
  t.notThrows(() => makePantheonPersistenceAdapter(deps));
});

test('should create adapter with getStoreManagers returning non-array', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () => null as any,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});

test('should create adapter with getStoreManagers returning mixed types', (t) => {
  const deps: PersistenceAdapterDeps = {
    getStoreManagers: async () =>
      [createMockManager('valid-manager'), null, undefined, 'not-a-manager'] as any,
  };

  const adapter = makePantheonPersistenceAdapter(deps);

  t.truthy(adapter);
  t.is(typeof adapter, 'object');
});
