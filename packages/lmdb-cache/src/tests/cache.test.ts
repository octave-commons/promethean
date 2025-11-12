import { rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import test from 'ava';
import { sleep } from '@promethean-os/utils';

import { openLmdbCache } from '../index.js';

const TMP_ROOT = '.cache/tests-lmdb';

function tmpPath(name: string): string {
  const p = join(TMP_ROOT, `${name}-${Date.now()}-${process.pid}`);
  try {
    mkdirSync(TMP_ROOT, { recursive: true });
  } catch {}
  return p;
}

test('set/get/has basic', async (t) => {
  const path = tmpPath('basic');
  const cache = openLmdbCache({ path, namespace: 'n1' });
  await cache.set('a', 123);
  t.true(await cache.has('a'));
  t.is(await cache.get('a'), 123);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('ttl expiry prunes on read', async (t) => {
  const path = tmpPath('ttl');
  const cache = await openLmdbCache({ path, namespace: 'n1' });
  await cache.set('k', 'v', { ttlMs: 500 });
  t.is(await cache.get('k'), 'v');
  await sleep(800);
  t.is(await cache.get('k'), undefined);
  t.false(await cache.has('k'));
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('namespaces are isolated and composable', async (t) => {
  const path = tmpPath('ns');
  const cache = await openLmdbCache({ path, namespace: 'root' });
  await cache.set('x', 1);
  const a = cache.withNamespace('a');
  const b = cache.withNamespace('b');
  await a.set('x', 2);
  await b.set('x', 3);
  t.is(await cache.get('x'), 1);
  t.is(await a.get('x'), 2);
  t.is(await b.get('x'), 3);
  const a1 = a.withNamespace('child');
  await a1.set('y', 42);
  t.is(await a1.get('y'), 42);
  t.is(await a.get('y'), undefined);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('entries yields non-expired logical keys only', async (t) => {
  const path = tmpPath('entries');
  const cache = openLmdbCache({ path, namespace: 'ns' });
  await cache.batch([
    { type: 'put', key: 'a', value: 1 },
    { type: 'put', key: 'b', value: 2, ttlMs: 500 },
  ]);
  const first: [string, number][] = [];
  for await (const [k, v] of cache.entries()) first.push([k, v] as [string, number]);
  t.deepEqual(first.sort(), [
    ['a', 1],
    ['b', 2],
  ] as [string, number][]);
  await sleep(800);
  const second: [string, number][] = [];
  for await (const [k, v] of cache.entries()) second.push([k, v] as [string, number]);
  t.deepEqual(second, [['a', 1]] as [string, number][]);
  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('batch operations work correctly', async (t) => {
  const path = tmpPath('batch');
  const cache = openLmdbCache({ path });

  await cache.batch([
    { type: 'put', key: 'key1', value: 'value1' },
    { type: 'put', key: 'key2', value: 'value2', ttlMs: 1000 },
    { type: 'del', key: 'key3' }, // Should not error
  ]);

  t.is(await cache.get('key1'), 'value1');
  t.is(await cache.get('key2'), 'value2');
  t.is(await cache.get('key3'), undefined);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('sweepExpired removes expired entries', async (t) => {
  const path = tmpPath('sweep');
  const cache = await openLmdbCache({ path });

  await cache.set('permanent', 'keep');
  await cache.set('temporary', 'delete', { ttlMs: 100 });

  // Verify both exist
  t.is(await cache.get('permanent'), 'keep');
  t.is(await cache.get('temporary'), 'delete');

  // Wait for expiry
  await sleep(200);

  // Sweep expired entries
  const deletedCount = await cache.sweepExpired();
  t.is(deletedCount, 1);

  // Verify only permanent remains
  t.is(await cache.get('permanent'), 'keep');
  t.is(await cache.get('temporary'), undefined);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('entries with limit works correctly', async (t) => {
  const path = tmpPath('entries-limit');
  const cache = await openLmdbCache<string>({ path });

  // Add multiple entries
  for (let i = 0; i < 10; i++) {
    await cache.set(`key${i}`, `value${i}`);
  }

  const entries: [string, string][] = [];
  for await (const [k, v] of cache.entries({ limit: 5 })) {
    entries.push([k, v]);
  }

  t.is(entries.length, 5);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('concurrent operations work correctly', async (t) => {
  const path = tmpPath('concurrent');
  const cache = await openLmdbCache<string>({ path });

  // Test concurrent writes
  const writePromises: Promise<void>[] = [];
  for (let i = 0; i < 10; i++) {
    writePromises.push(cache.set(`key${i}`, `value${i}`));
  }

  await Promise.all(writePromises);

  // Test concurrent reads
  const readPromises: Promise<string | undefined>[] = [];
  for (let i = 0; i < 10; i++) {
    readPromises.push(cache.get(`key${i}`));
  }

  const results = await Promise.all(readPromises);

  for (let i = 0; i < 10; i++) {
    t.is(results[i], `value${i}`);
  }

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('default TTL is applied correctly', async (t) => {
  const path = tmpPath('default-ttl');
  const cache = await openLmdbCache<string>({
    path,
    defaultTtlMs: 500,
  });

  await cache.set('key', 'value'); // Should use default TTL
  t.is(await cache.get('key'), 'value');

  await sleep(800);
  t.is(await cache.get('key'), undefined);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('complex objects are handled correctly', async (t) => {
  const path = tmpPath('complex-objects');
  type ComplexObj = {
    string: string;
    number: number;
    array: number[];
    nested: { a: string; c: string };
    date: Date;
  };
  const cache = await openLmdbCache<ComplexObj>({ path });

  const complexObj: ComplexObj = {
    string: 'test',
    number: 42,
    array: [1, 2, 3],
    nested: { a: 'b', c: 'd' },
    date: new Date(),
  };

  await cache.set('complex', complexObj);
  const retrieved = await cache.get('complex');

  t.deepEqual(retrieved, complexObj);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('getStats returns correct statistics', async (t) => {
  const path = tmpPath('stats');
  const cache = await openLmdbCache<string>({ path, namespace: 'test' });

  // Initially empty
  let stats = await cache.getStats();
  t.is(stats.totalEntries, 0);
  t.is(stats.expiredEntries, 0);
  t.is(stats.hitRate, 0);
  t.deepEqual(stats.namespaces, ['test']);

  // Add some entries
  await cache.set('key1', 'value1');
  await cache.set('key2', 'value2');
  await cache.set('key3', 'value3', { ttlMs: 100 });

  stats = await cache.getStats();
  t.is(stats.totalEntries, 3);
  t.is(stats.expiredEntries, 0);

  // Access some entries to affect hit rate
  await cache.get('key1'); // hit
  await cache.get('nonexistent'); // miss
  await cache.get('key2'); // hit

  stats = await cache.getStats();
  t.is(stats.hitRate, 2 / 3); // 2 hits out of 3 total accesses

  // Wait for expiry and check stats
  await sleep(200);
  stats = await cache.getStats();
  t.is(stats.expiredEntries, 1);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('LMDBCache class constructor works correctly', async (t) => {
  const path = tmpPath('class-constructor');
  const { LMDBCache } = await import('../cache.js');
  const cache = new LMDBCache<string>(path, {
    namespace: 'class-test',
    defaultTtlMs: 1000,
  });

  await cache.set('test', 'value');
  t.is(await cache.get('test'), 'value');
  t.true(await cache.has('test'));

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('cache persists across restarts', async (t) => {
  const path = tmpPath('persistence');

  // First cache instance
  const cache1 = await openLmdbCache<string>({ path, namespace: 'persist' });
  await cache1.set('persistent', 'data');
  await cache1.set('temporary', 'expires', { ttlMs: 100 });
  await cache1.close();

  // Wait a bit for TTL to potentially expire
  await sleep(200);

  // Second cache instance - should read persisted data
  const cache2 = await openLmdbCache<string>({ path, namespace: 'persist' });
  t.is(await cache2.get('persistent'), 'data');
  t.is(await cache2.get('temporary'), undefined); // Should be expired

  await cache2.close();
  rmSync(path, { recursive: true, force: true });
});

test('delete operations work correctly', async (t) => {
  const path = tmpPath('delete');
  const cache = await openLmdbCache<string>({ path });

  await cache.set('toDelete', 'value');
  t.is(await cache.get('toDelete'), 'value');
  t.true(await cache.has('toDelete'));

  await cache.del('toDelete');
  t.is(await cache.get('toDelete'), undefined);
  t.false(await cache.has('toDelete'));

  // Deleting non-existent key should not error
  await t.notThrowsAsync(async () => {
    await cache.del('nonexistent');
  });

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('entries with namespace filter works correctly', async (t) => {
  const path = tmpPath('entries-namespace');
  const cache = await openLmdbCache<string>({ path });

  const ns1 = cache.withNamespace('ns1');
  const ns2 = cache.withNamespace('ns2');

  await ns1.set('key1', 'value1');
  await ns1.set('key2', 'value2');
  await ns2.set('key1', 'value3');

  // Test entries with namespace filter
  const ns1Entries: [string, string][] = [];
  for await (const [k, v] of cache.entries({ namespace: 'ns1' })) {
    ns1Entries.push([k, v]);
  }
  t.is(ns1Entries.length, 2);

  const ns2Entries: [string, string][] = [];
  for await (const [k, v] of cache.entries({ namespace: 'ns2' })) {
    ns2Entries.push([k, v]);
  }
  t.is(ns2Entries.length, 1);

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('error handling for invalid operations', async (t) => {
  const path = tmpPath('error-handling');
  const cache = await openLmdbCache<string | null | undefined>({ path });

  // Test that undefined values can be stored and retrieved
  await cache.set('undefined', undefined);
  t.is(await cache.get('undefined'), undefined);

  // Test that null values can be stored and retrieved
  await cache.set('null', null);
  t.is(await cache.get('null'), null);

  // Test empty string keys
  await cache.set('', 'empty-key');
  t.is(await cache.get(''), 'empty-key');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('large values are handled correctly', async (t) => {
  const path = tmpPath('large-values');
  const cache = await openLmdbCache<string>({ path });

  // Create a large string (1MB)
  const largeString = 'x'.repeat(1024 * 1024);
  await cache.set('large', largeString);

  const retrieved = await cache.get('large');
  if (retrieved) {
    t.is(retrieved.length, largeString.length);
    t.is(retrieved, largeString);
  } else {
    t.fail('retrieved value should not be undefined');
  }

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});
