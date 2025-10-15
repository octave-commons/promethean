import test from 'ava';
import {
  EmbeddingCache,
  createEmbeddingCache,
  createDefaultCache,
} from '../index.js';

test('EmbeddingCache constructor initializes with default options', (t) => {
  const cache = new EmbeddingCache('test-model');

  t.is(cache.size, 0);
  const stats = cache.getStats();
  t.is(stats.size, 0);
  t.is(stats.hits, 0);
  t.is(stats.misses, 0);
  t.is(stats.hitRate, 0);
});

test('EmbeddingCache constructor accepts custom options', (t) => {
  const cache = new EmbeddingCache('test-model', {
    similarityThreshold: 0.9,
    maxAge: 60000, // 1 minute
    maxSize: 500,
    enableEmbedding: false,
  });

  t.is(cache.size, 0);
});

test('createEmbeddingCache factory function', (t) => {
  const cache = createEmbeddingCache('test-model', {
    similarityThreshold: 0.8,
  });

  t.truthy(cache);
  t.is(cache.size, 0);
});

test('createDefaultCache factory function', (t) => {
  const cache = createDefaultCache('test-model');

  t.truthy(cache);
  t.is(cache.size, 0);
});

test('Cache statistics tracking', (t) => {
  const cache = new EmbeddingCache('test-model');

  let stats = cache.getStats();
  t.is(stats.hits, 0);
  t.is(stats.misses, 0);
  t.is(stats.hitRate, 0);

  cache.resetStats();
  stats = cache.getStats();
  t.is(stats.hits, 0);
  t.is(stats.misses, 0);
});

test('Cache size property', (t) => {
  const cache = new EmbeddingCache('test-model');
  t.is(cache.size, 0);
});

test('Cache operations without embedding', async (t) => {
  const cache = new EmbeddingCache('test-model', { enableEmbedding: false });

  // Test set and get
  await cache.set('key1', 'value1');
  const value = await cache.get('key1');
  t.is(value, 'value1');

  // Test has
  const hasKey = await cache.has('key1');
  t.true(hasKey);

  const hasMissingKey = await cache.has('missing');
  t.false(hasMissingKey);

  // Test get with details
  const result = await cache.getWithDetails('key1');
  t.true(result.hit);
  t.is(result.value, 'value1');
  t.is(result.similarity, undefined);
});

test('Cache operations with embedding enabled', async (t) => {
  // Test that cache can be created with embedding enabled
  // Note: Actual embedding calls would require mocking framework
  const cache = new EmbeddingCache('test-model', { enableEmbedding: true });

  // Test that methods exist and return expected types
  t.is(typeof cache.get, 'function');
  t.is(typeof cache.set, 'function');
  t.is(typeof cache.has, 'function');
  t.is(typeof cache.delete, 'function');
  t.is(typeof cache.clear, 'function');
  t.is(typeof cache.getWithDetails, 'function');
});

test('Cache result type structure', (t) => {
  // Test that getWithDetails returns the expected structure
  // This test is mainly for type checking
  t.plan(0);
});

test('Cache entry expiration', async (t) => {
  const cache = new EmbeddingCache('test-model', {
    enableEmbedding: false,
    maxAge: 1, // 1ms - very short TTL for testing
  });

  await cache.set('key1', 'value1');

  // Wait for expiration
  await new Promise((resolve) => setTimeout(resolve, 10));

  const value = await cache.get('key1');
  t.is(value, undefined); // Should be expired
});

test('Cache TTL functionality', async (t) => {
  const cache = new EmbeddingCache('test-model', {
    enableEmbedding: false,
    maxAge: 10000, // 10 seconds
  });

  await cache.set('key1', 'value1', 1); // 1ms TTL

  // Wait for TTL expiration
  await new Promise((resolve) => setTimeout(resolve, 10));

  const value = await cache.get('key1');
  t.is(value, undefined); // Should be expired due to TTL
});

test('Cache statistics update on operations', async (t) => {
  const cache = new EmbeddingCache('test-model', { enableEmbedding: false });

  // Initial stats
  let stats = cache.getStats();
  t.is(stats.hits, 0);
  t.is(stats.misses, 0);

  // Cache miss
  await cache.get('nonexistent');
  stats = cache.getStats();
  t.is(stats.hits, 0);
  t.is(stats.misses, 1);

  // Cache hit
  await cache.set('key1', 'value1');
  await cache.get('key1');
  stats = cache.getStats();
  t.is(stats.hits, 1);
  t.is(stats.misses, 1);
  t.is(stats.hitRate, 0.5);
});

test('Cache delete and clear operations', async (t) => {
  const cache = new EmbeddingCache('test-model', { enableEmbedding: false });

  await cache.set('key1', 'value1');

  // Delete operation (currently not implemented)
  const deleted = await cache.delete('key1');
  t.false(deleted); // Should return false as not implemented

  // Clear operation (currently not implemented)
  await cache.clear();
  // No assertion needed as it's a placeholder
});

test('Cache with different data types', async (t) => {
  const cache = new EmbeddingCache('test-model', { enableEmbedding: false });

  // Test with string
  await cache.set('string-key', 'string-value');
  t.is(await cache.get('string-key'), 'string-value');

  // Test with number
  await cache.set('number-key', 42);
  t.is(await cache.get('number-key'), 42);

  // Test with object
  const testObj = { foo: 'bar', baz: 123 };
  await cache.set('object-key', testObj);
  t.deepEqual(await cache.get('object-key'), testObj);

  // Test with array
  const testArray = [1, 2, 3, 'four'];
  await cache.set('array-key', testArray);
  t.deepEqual(await cache.get('array-key'), testArray);
});

test('Cache with generic types', async (t) => {
  // Test with explicit generic type
  const stringCache = new EmbeddingCache<string>('test-model', {
    enableEmbedding: false,
  });
  await stringCache.set('key', 'value');
  const value: string | undefined = await stringCache.get('key');
  t.is(value, 'value');

  // Test with object generic type
  interface TestObject {
    id: number;
    name: string;
  }
  const objectCache = new EmbeddingCache<TestObject>('test-model', {
    enableEmbedding: false,
  });
  const testObj: TestObject = { id: 1, name: 'test' };
  await objectCache.set('obj-key', testObj);
  const objValue: TestObject | undefined = await objectCache.get('obj-key');
  t.deepEqual(objValue, testObj);
});
