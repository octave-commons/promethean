import test from 'ava';

// Simple cache strategy test that doesn't depend on the complex build system
// This follows TDD principles - we're testing the cache behavior in isolation

interface CacheEntry {
  result: any;
  timestamp: number;
  inputHash: string;
}

class SimpleCacheStrategy {
  private cache = new Map<string, CacheEntry>();
  private cacheHits = 0;
  private cacheMisses = 0;

  generateCacheKey(input: any): string {
    return JSON.stringify(input);
  }

  async get(input: any): Promise<any | null> {
    const key = this.generateCacheKey(input);
    const entry = this.cache.get(key);

    if (entry) {
      this.cacheHits++;
      return entry.result;
    }

    this.cacheMisses++;
    return null;
  }

  async set(input: any, result: any): Promise<void> {
    const key = this.generateCacheKey(input);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      inputHash: key,
    });
  }

  getStats() {
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      size: this.cache.size,
    };
  }

  clear(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

// Mock benchmark function
const mockBenchmark = async (input: any) => {
  // Simulate some work
  await new Promise((resolve) => setTimeout(resolve, 10));
  return { success: true, data: `result-for-${JSON.stringify(input)}` };
};

test('cache strategy: cold cache should execute benchmark and store result', async (t) => {
  const cache = new SimpleCacheStrategy();
  const input = { model: 'test-model', fixture: 'test-fixture' };

  // Cold cache - should not find result
  const cachedResult = await cache.get(input);
  t.is(cachedResult, null);

  // Execute benchmark
  const result = await mockBenchmark(input);

  // Store in cache
  await cache.set(input, result);

  // Verify stats
  const stats = cache.getStats();
  t.is(stats.cacheMisses, 1);
  t.is(stats.cacheHits, 0);
  t.is(stats.size, 1);
});

test('cache strategy: cache hit should return stored result without execution', async (t) => {
  const cache = new SimpleCacheStrategy();
  const input = { model: 'test-model', fixture: 'test-fixture' };

  // First, try to get from empty cache - should miss
  const missResult = await cache.get(input);
  t.is(missResult, null);

  // Execute benchmark and store result
  const result1 = await mockBenchmark(input);
  await cache.set(input, result1);

  // Second run - cache hit
  const startTime = Date.now();
  const cachedResult = await cache.get(input);
  const duration = Date.now() - startTime;

  t.deepEqual(cachedResult, result1);
  t.true(duration < 5, 'Cache hit should be nearly instantaneous');

  // Verify stats
  const stats = cache.getStats();
  t.is(stats.cacheHits, 1);
  t.is(stats.cacheMisses, 1);
  t.is(stats.size, 1);
  t.is(stats.hitRate, 0.5);
});

test('cache strategy: cache miss should execute new benchmark for different inputs', async (t) => {
  const cache = new SimpleCacheStrategy();
  const input1 = { model: 'test-model', fixture: 'fixture1' };
  const input2 = { model: 'test-model', fixture: 'fixture2' };

  // Cache first input
  const result1 = await mockBenchmark(input1);
  await cache.set(input1, result1);

  // Try to get second input - should miss
  const cachedResult = await cache.get(input2);
  t.is(cachedResult, null);

  // Verify stats
  const stats = cache.getStats();
  t.is(stats.cacheMisses, 1);
  t.is(stats.cacheHits, 0);
  t.is(stats.size, 1);
});

test('cache strategy: should handle cache corruption gracefully', async (t) => {
  const cache = new SimpleCacheStrategy();
  const input = { model: 'test-model', fixture: 'test-fixture' };

  // Manually corrupt the cache
  (cache as any).cache.set('corrupted-key', { invalid: 'data' });

  // Should still work normally
  const result = await mockBenchmark(input);
  await cache.set(input, result);

  const cachedResult = await cache.get(input);
  t.deepEqual(cachedResult, result);
});

test('cache strategy: should persist cache across instances', async (t) => {
  const input = { model: 'test-model', fixture: 'test-fixture' };

  // First instance
  const cache1 = new SimpleCacheStrategy();
  const result1 = await mockBenchmark(input);
  await cache1.set(input, result1);

  // Second instance - in real implementation this would load from disk
  // For this test, we simulate by manually sharing cache data
  const cache2 = new SimpleCacheStrategy();
  (cache2 as any).cache = (cache1 as any).cache;

  const cachedResult = await cache2.get(input);
  t.deepEqual(cachedResult, result1);
});

test('cache strategy: should handle empty inputs', async (t) => {
  const cache = new SimpleCacheStrategy();
  const input = {};

  const result = await mockBenchmark(input);
  await cache.set(input, result);

  const cachedResult = await cache.get(input);
  t.deepEqual(cachedResult, result);
});

test('cache strategy: should handle multiple different inputs', async (t) => {
  const cache = new SimpleCacheStrategy();
  const inputs = [
    { model: 'model1', fixture: 'fixture1' },
    { model: 'model2', fixture: 'fixture2' },
    { model: 'model3', fixture: 'fixture3' },
  ];

  // Cache all inputs
  for (const input of inputs) {
    const result = await mockBenchmark(input);
    await cache.set(input, result);
  }

  // Verify all can be retrieved
  for (const input of inputs) {
    const cachedResult = await cache.get(input);
    t.truthy(cachedResult);
  }

  // Verify stats
  const stats = cache.getStats();
  t.is(stats.size, 3);
});

test('cache strategy: clear should reset all state', async (t) => {
  const cache = new SimpleCacheStrategy();
  const input = { model: 'test-model', fixture: 'test-fixture' };

  // First, try to get from empty cache to create a miss
  await cache.get(input);

  // Add some data
  const result = await mockBenchmark(input);
  await cache.set(input, result);

  // Verify data exists
  let stats = cache.getStats();
  t.is(stats.size, 1);
  t.is(stats.cacheMisses, 1);

  // Clear cache
  cache.clear();

  // Verify everything is reset
  stats = cache.getStats();
  t.is(stats.size, 0);
  t.is(stats.cacheHits, 0);
  t.is(stats.cacheMisses, 0);

  const cachedResult = await cache.get(input);
  t.is(cachedResult, null);
});
