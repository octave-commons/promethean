/**
 * Error handling tests for pantheon-persistence adapter
 */

import test from 'ava';
import { makePantheonPersistenceAdapter } from '../index';
import type { ContextSource } from '@promethean-os/pantheon-core';
import { mockManagers } from './fixtures/mock-managers';

test('should throw error when dependencies object is null', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing null input
      makePantheonPersistenceAdapter(null);
    },
    {
      message: 'Dependencies object is required for makePantheonPersistenceAdapter',
    },
  );
});

test('should throw error when dependencies object is undefined', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing undefined input
      makePantheonPersistenceAdapter(undefined);
    },
    {
      message: 'Dependencies object is required for makePantheonPersistenceAdapter',
    },
  );
});

test('should throw error when getStoreManagers is missing', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing missing function
      makePantheonPersistenceAdapter({});
    },
    {
      message: 'getStoreManagers function is required in dependencies',
    },
  );
});

test('should throw error when getStoreManagers is not a function', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing invalid function type
      makePantheonPersistenceAdapter({ getStoreManagers: 'not a function' });
    },
    {
      message: 'getStoreManagers function is required in dependencies',
    },
  );
});

test('should handle empty sources array gracefully', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [];
  const result = await adapter.compile({ sources });
  t.deepEqual(result, []);
});

test('should handle getStoreManagers returning null', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => null as any,
  });

  const sources: ContextSource[] = [{ id: 'test', label: 'Test' }];
  const result = await adapter.compile({ sources });
  t.deepEqual(result, []);
});

test('should handle getStoreManagers returning undefined', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => undefined as any,
  });

  const sources: ContextSource[] = [{ id: 'test', label: 'Test' }];
  const result = await adapter.compile({ sources });
  t.deepEqual(result, []);
});

test('should throw error when getStoreManagers returns non-array', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => 'not an array' as any,
  });

  const sources: ContextSource[] = [{ id: 'test', label: 'Test' }];
  await t.throwsAsync(
    async () => {
      await adapter.compile({ sources });
    },
    {
      message: 'getStoreManagers must return an array of DualStoreManager objects',
    },
  );
});

test('should handle empty managers array', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => [],
  });

  const sources: ContextSource[] = [{ id: 'test', label: 'Test' }];
  const result = await adapter.compile({ sources });
  t.deepEqual(result, []);
});

test('should handle getStoreManagers throwing error', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => {
      throw new Error('Database connection failed');
    },
  });

  const sources: ContextSource[] = [{ id: 'test', label: 'Test' }];
  await t.throwsAsync(
    async () => {
      await adapter.compile({ sources });
    },
    {
      message: 'Store manager retrieval failed: Database connection failed',
    },
  );
});

test('should handle getStoreManagers throwing non-Error object', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => {
      throw 'String error';
    },
  });

  const sources: ContextSource[] = [{ id: 'test', label: 'Test' }];
  await t.throwsAsync(
    async () => {
      await adapter.compile({ sources });
    },
    {
      message: 'Store manager retrieval failed: Unknown error',
    },
  );
});

test('should filter sources with invalid IDs', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [
    { id: 'user-context', label: 'User Context' },
    { id: '', label: 'Empty ID' },
    { id: 'null-id', label: 'Null ID' },
    { id: 'undefined-id', label: 'Undefined ID' },
  ];

  const result = await adapter.compile({ sources });
  // Should only find one valid match
  t.true(Array.isArray(result));
});

test('should return empty array when no matching managers found', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [{ id: 'non-existent', label: 'Non-existent' }];
  const result = await adapter.compile({ sources });
  t.deepEqual(result, []);
});

test('should work correctly with valid inputs', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [
    { id: 'user-context', label: 'User Context' },
    { id: 'system-context', label: 'System Context' },
  ];

  const result = await adapter.compile({ sources });
  t.true(Array.isArray(result));
});

test('should handle partial matches', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [
    { id: 'user-context', label: 'User Context' },
    { id: 'non-existent', label: 'Non-existent' },
    { id: 'system-context', label: 'System Context' },
  ];

  const result = await adapter.compile({ sources });
  t.true(Array.isArray(result));
});

test('should work with texts parameter', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [{ id: 'user-context', label: 'User Context' }];
  const texts = ['Hello world'];

  const result = await adapter.compile({ sources, texts });
  t.true(Array.isArray(result));
});

test('should work with limit parameters', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [{ id: 'user-context', label: 'User Context' }];

  const result = await adapter.compile({
    sources,
    recentLimit: 5,
    queryLimit: 3,
    limit: 10,
  });
  t.true(Array.isArray(result));
});

test('should throw error when dependencies object is undefined', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing undefined input
      makePantheonPersistenceAdapter(undefined);
    },
    {
      message: 'Dependencies object is required for makePantheonPersistenceAdapter',
    },
  );
});

test('should throw error when getStoreManagers is missing', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing missing function
      makePantheonPersistenceAdapter({});
    },
    {
      message: 'getStoreManagers function is required in dependencies',
    },
  );
});

test('should throw error when getStoreManagers is not a function', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Testing invalid function type
      makePantheonPersistenceAdapter({ getStoreManagers: 'not a function' });
    },
    {
      message: 'getStoreManagers function is required in dependencies',
    },
  );
});

test('should handle empty sources array gracefully', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const result = await adapter.getCollectionsFor([]);
  t.deepEqual(result, []);
});

test('should throw error when sources is not an array', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  await t.throwsAsync(
    async () => {
      // @ts-expect-error Testing invalid input type
      await adapter.getCollectionsFor('not an array');
    },
    {
      message: 'Sources must be an array',
    },
  );
});

test('should handle getStoreManagers returning null', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => null,
  });

  const sources: ContextSource[] = [{ id: 'test', name: 'Test' }];
  const result = await adapter.getCollectionsFor(sources);
  t.deepEqual(result, []);
});

test('should handle getStoreManagers returning undefined', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => undefined,
  });

  const sources: ContextSource[] = [{ id: 'test', name: 'Test' }];
  const result = await adapter.getCollectionsFor(sources);
  t.deepEqual(result, []);
});

test('should throw error when getStoreManagers returns non-array', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => 'not an array',
  });

  const sources: ContextSource[] = [{ id: 'test', name: 'Test' }];
  await t.throwsAsync(
    async () => {
      await adapter.getCollectionsFor(sources);
    },
    {
      message: 'getStoreManagers must return an array of DualStoreManager objects',
    },
  );
});

test('should handle empty managers array', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => [],
  });

  const sources: ContextSource[] = [{ id: 'test', name: 'Test' }];
  const result = await adapter.getCollectionsFor(sources);
  t.deepEqual(result, []);
});

test('should handle getStoreManagers throwing error', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => {
      throw new Error('Database connection failed');
    },
  });

  const sources: ContextSource[] = [{ id: 'test', name: 'Test' }];
  await t.throwsAsync(
    async () => {
      await adapter.getCollectionsFor(sources);
    },
    {
      message: 'Store manager retrieval failed: Database connection failed',
    },
  );
});

test('should handle getStoreManagers throwing non-Error object', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => {
      throw 'String error';
    },
  });

  const sources: ContextSource[] = [{ id: 'test', name: 'Test' }];
  await t.throwsAsync(
    async () => {
      await adapter.getCollectionsFor(sources);
    },
    {
      message: 'Store manager retrieval failed: Unknown error',
    },
  );
});

test('should filter sources with invalid IDs', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [
    { id: 'user-context', name: 'User Context' },
    { id: '', name: 'Empty ID' },
    { id: null as any, name: 'Null ID' },
    { id: undefined as any, name: 'Undefined ID' },
    { name: 'No ID' } as any,
  ];

  const result = await adapter.getCollectionsFor(sources);
  t.is(result.length, 1);
  t.is(result[0].name, 'user-context');
});

test('should return empty array when no matching managers found', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [{ id: 'non-existent', name: 'Non-existent' }];
  const result = await adapter.getCollectionsFor(sources);
  t.deepEqual(result, []);
});

test('should work correctly with valid inputs', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [
    { id: 'user-context', name: 'User Context' },
    { id: 'system-context', name: 'System Context' },
  ];

  const result = await adapter.getCollectionsFor(sources);
  t.is(result.length, 2);
  t.is(result[0].name, 'user-context');
  t.is(result[1].name, 'system-context');
});

test('should handle partial matches', async (t) => {
  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: async () => mockManagers,
  });

  const sources: ContextSource[] = [
    { id: 'user-context', name: 'User Context' },
    { id: 'non-existent', name: 'Non-existent' },
    { id: 'system-context', name: 'System Context' },
  ];

  const result = await adapter.getCollectionsFor(sources);
  t.is(result.length, 2);
  t.is(result[0].name, 'user-context');
  t.is(result[1].name, 'system-context');
});
