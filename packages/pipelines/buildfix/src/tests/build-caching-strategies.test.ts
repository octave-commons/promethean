import test from 'ava';
import { rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openLevelCache } from '@promethean/level-cache';

// Import the strategies we're going to test
// These will be dynamically imported to avoid module resolution issues

// ===== RED PHASE: Build Caching Strategies Tests =====
// These tests define the required behavior for build caching strategies
// All tests should FAIL initially because the implementation doesn't exist yet

const TMP_ROOT = '.cache/tests-build-caching';

function tmpPath(name: string): string {
  const p = join(TMP_ROOT, `${name}-${Date.now()}-${process.pid}`);
  try {
    mkdirSync(TMP_ROOT, { recursive: true });
  } catch {}
  return p;
}

// ===== CACHE KEY GENERATION TESTS =====
test('build cache: should generate specific cache keys for pnpm dependencies', async (t) => {
  // This test will FAIL because we haven't implemented proper cache key generation yet
  const { BuildCacheKeyGenerator } = await import('../cache-key-generator.js');
  const cacheKeyGenerator = new BuildCacheKeyGenerator();

  const lockfileHash = 'abc123';
  const packageJsonHash = 'def456';
  const expectedKey = 'pnpm-deps-abc123-def456';

  const actualKey = cacheKeyGenerator.generatePnpmKey(lockfileHash, packageJsonHash);

  t.is(actualKey, expectedKey, 'Should generate specific pnpm cache key with both hashes');
});

test('build cache: should generate specific cache keys for Clojure dependencies', async (t) => {
  const cacheKeyGenerator = new (
    await import('../cache-key-generator.js')
  ).BuildCacheKeyGenerator();

  const depsEdnHash = 'clj789';
  const bbEdnHash = 'bb012';
  const expectedKey = 'clojure-deps-clj789-bb012';

  const actualKey = cacheKeyGenerator.generateClojureKey(depsEdnHash, bbEdnHash);

  t.is(actualKey, expectedKey, 'Should generate specific Clojure cache key with both hashes');
});

test('build cache: should include workflow context in cache keys', async (t) => {
  const cacheKeyGenerator = new (
    await import('../cache-key-generator.js')
  ).BuildCacheKeyGenerator();

  const workflowName = 'build';
  const jobName = 'build-job';
  const baseKey = 'pnpm-deps-abc123-def456';
  const expectedKey = `${workflowName}-${jobName}-${baseKey}`;

  const actualKey = cacheKeyGenerator.generateWorkflowKey(workflowName, jobName, baseKey);

  t.is(actualKey, expectedKey, 'Should include workflow and job context in cache key');
});

test('build cache: should invalidate cache when dependencies change', async (t) => {
  const path = tmpPath('cache-invalidation');
  const cache = await openLevelCache({ path, namespace: 'build-cache' });

  const cacheKeyGenerator = new (
    await import('../cache-key-generator.js')
  ).BuildCacheKeyGenerator();

  // Initial cache entry
  const initialKey = cacheKeyGenerator.generatePnpmKey('hash1', 'hash2');
  await cache.set(initialKey, { dependencies: ['pkg1', 'pkg2'] });

  // Verify cache exists
  t.true(await cache.has(initialKey));

  // Change dependencies
  const newKey = cacheKeyGenerator.generatePnpmKey('hash1', 'hash3');

  // Should not find old cache entry with new key
  t.false(await cache.has(newKey), 'Cache should invalidate when dependencies change');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

// ===== CROSS-WORKFLOW CACHING TESTS =====
test('build cache: should share pnpm cache across workflows efficiently', async (t) => {
  const path = tmpPath('cross-workflow-pnpm');
  const cache = await openLevelCache({ path, namespace: 'pnpm-shared' });

  const { PnpmCacheStrategy } = await import('../pnpm-cache-strategy.js');
  const pnpmCacheStrategy = new PnpmCacheStrategy(cache);

  // Simulate multiple workflows accessing same pnpm dependencies
  const workflows = ['build', 'test', 'lint'];
  const lockfileHash = 'shared-lock-hash';
  const packageJsonHash = 'shared-pkg-hash';

  // First workflow populates cache
  const firstResult = await pnpmCacheStrategy.getOrInstall('build', lockfileHash, packageJsonHash);
  t.truthy(firstResult, 'First workflow should install and cache dependencies');

  // Subsequent workflows should use cached dependencies
  for (const workflow of workflows.slice(1)) {
    const result = await pnpmCacheStrategy.getOrInstall(workflow, lockfileHash, packageJsonHash);
    t.truthy(result, `Workflow ${workflow} should use cached dependencies`);
  }

  // Verify cache was used (not reinstalled)
  const stats = pnpmCacheStrategy.getStats();
  t.true(stats.cacheHits > 0, 'Should have cache hits for shared dependencies');
  t.true(stats.cacheHits === workflows.length - 1, 'Should have exactly N-1 cache hits');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('build cache: should share Clojure cache across workflows efficiently', async (t) => {
  const path = tmpPath('cross-workflow-clojure');
  const cache = await openLevelCache({ path, namespace: 'clojure-shared' });

  const clojureCacheStrategy = new (
    await import('../clojure-cache-strategy.js')
  ).ClojureCacheStrategy(cache);

  // Simulate multiple workflows accessing same Clojure dependencies
  const workflows = ['build', 'test-unit', 'test-integration'];
  const depsEdnHash = 'shared-deps-hash';
  const bbEdnHash = 'shared-bb-hash';

  // First workflow populates cache
  const firstResult = await clojureCacheStrategy.getOrInstall('build', depsEdnHash, bbEdnHash);
  t.truthy(firstResult, 'First workflow should install and cache dependencies');

  // Subsequent workflows should use cached dependencies
  for (const workflow of workflows.slice(1)) {
    const result = await clojureCacheStrategy.getOrInstall(workflow, depsEdnHash, bbEdnHash);
    t.truthy(result, `Workflow ${workflow} should use cached dependencies`);
  }

  // Verify cache was used
  const stats = clojureCacheStrategy.getStats();
  t.true(stats.cacheHits > 0, 'Should have cache hits for shared dependencies');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

// ===== CACHE INVALIDATION TESTS =====
test('build cache: should invalidate cache when lockfile changes', async (t) => {
  const path = tmpPath('lockfile-invalidation');
  const cache = await openLevelCache({ path, namespace: 'lockfile-cache' });

  const cacheInvalidator = new (await import('../cache-invalidator.js')).CacheInvalidator(cache);

  const oldLockfileHash = 'old-lock-hash';
  const newLockfileHash = 'new-lock-hash';
  const packageJsonHash = 'stable-pkg-hash';

  // Cache entry with old lockfile
  const oldKey = `pnpm-${oldLockfileHash}-${packageJsonHash}`;
  await cache.set(oldKey, { cached: true });

  // Invalidate based on lockfile change
  const invalidatedCount = await cacheInvalidator.invalidateOnLockfileChange(
    oldLockfileHash,
    newLockfileHash,
  );

  t.true(invalidatedCount > 0, 'Should invalidate cache entries when lockfile changes');
  t.false(await cache.has(oldKey), 'Old cache entry should be invalidated');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('build cache: should invalidate cache when package.json changes', async (t) => {
  const path = tmpPath('package-invalidation');
  const cache = await openLevelCache({ path, namespace: 'package-cache' });

  const cacheInvalidator = new (await import('../cache-invalidator.js')).CacheInvalidator(cache);

  const lockfileHash = 'stable-lock-hash';
  const oldPackageHash = 'old-pkg-hash';
  const newPackageHash = 'new-pkg-hash';

  // Cache entry with old package.json
  const oldKey = `pnpm-${lockfileHash}-${oldPackageHash}`;
  await cache.set(oldKey, { cached: true });

  // Invalidate based on package.json change
  const invalidatedCount = await cacheInvalidator.invalidateOnPackageChange(
    lockfileHash,
    oldPackageHash,
    newPackageHash,
  );

  t.true(invalidatedCount > 0, 'Should invalidate cache entries when package.json changes');
  t.false(await cache.has(oldKey), 'Old cache entry should be invalidated');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('build cache: should support selective cache invalidation', async (t) => {
  const path = tmpPath('selective-invalidation');
  const cache = await openLevelCache({ path, namespace: 'selective-cache' });

  const cacheInvalidator = new (await import('../cache-invalidator.js')).CacheInvalidator(cache);

  // Cache entries for different workflows
  await cache.set('build-pnpm-hash1-hash2', { workflow: 'build' });
  await cache.set('test-pnpm-hash1-hash2', { workflow: 'test' });
  await cache.set('lint-pnpm-hash1-hash2', { workflow: 'lint' });

  // Invalidate only build workflow cache
  const invalidatedCount = await cacheInvalidator.invalidateWorkflow('build', 'pnpm-hash1-hash2');

  t.is(invalidatedCount, 1, 'Should invalidate only specified workflow cache');
  t.false(await cache.has('build-pnpm-hash1-hash2'), 'Build cache should be invalidated');
  t.true(await cache.has('test-pnpm-hash1-hash2'), 'Test cache should remain');
  t.true(await cache.has('lint-pnpm-hash1-hash2'), 'Lint cache should remain');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

// ===== PERFORMANCE TESTS =====
test('build cache: should achieve >80% cache hit rate for repeated builds', async (t) => {
  const path = tmpPath('performance-test');
  const cache = await openLevelCache({ path, namespace: 'performance-cache' });

  const buildCacheManager = new (await import('../build-cache-manager.js')).BuildCacheManager(
    cache,
  );

  // Simulate multiple build iterations with same dependencies
  const iterations = 10;
  const lockfileHash = 'stable-lock-hash';
  const packageJsonHash = 'stable-pkg-hash';

  for (let i = 0; i < iterations; i++) {
    await buildCacheManager.getOrBuild('build', lockfileHash, packageJsonHash);
  }

  const stats = buildCacheManager.getStats();
  const hitRate = stats.cacheHits / (stats.cacheHits + stats.cacheMisses);

  t.true(hitRate > 0.8, `Cache hit rate should be >80%, got ${(hitRate * 100).toFixed(1)}%`);
  t.is(stats.cacheMisses, 1, 'Should have exactly 1 cache miss (first iteration)');
  t.is(stats.cacheHits, iterations - 1, 'Should have N-1 cache hits');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('build cache: should measure and report cache performance metrics', async (t) => {
  const path = tmpPath('metrics-test');
  const cache = await openLevelCache({ path, namespace: 'metrics-cache' });

  const buildCacheManager = new (await import('../build-cache-manager.js')).BuildCacheManager(
    cache,
  );

  // Perform some cache operations
  await buildCacheManager.getOrBuild('build', 'hash1', 'hash2');
  await buildCacheManager.getOrBuild('test', 'hash1', 'hash2');
  await buildCacheManager.getOrBuild('build', 'hash1', 'hash2'); // cache hit

  const metrics = buildCacheManager.getPerformanceMetrics();

  t.truthy(metrics.totalOperations, 'Should report total operations');
  t.truthy(metrics.cacheHitRate, 'Should report cache hit rate');
  t.truthy(metrics.averageCacheTime, 'Should report average cache access time');
  t.truthy(metrics.cacheSize, 'Should report cache size');
  t.true(
    metrics.cacheHitRate >= 0 && metrics.cacheHitRate <= 1,
    'Cache hit rate should be between 0 and 1',
  );

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

// ===== INTEGRATION TESTS =====
test('build cache: should integrate with GitHub Actions workflow context', async (t) => {
  const path = tmpPath('github-integration');
  const cache = await openLevelCache({ path, namespace: 'github-cache' });

  const githubCacheStrategy = new (await import('../github-cache-strategy.js')).GitHubCacheStrategy(
    cache,
  );

  // Simulate GitHub Actions environment
  const githubContext = {
    workflow: 'build.yml',
    job: 'build',
    runner: {
      os: 'linux',
    },
    repository: 'promethean/promethean',
  };

  const result = await githubCacheStrategy.setupCache(githubContext);

  t.truthy(result.cacheKey, 'Should generate GitHub-specific cache key');
  t.truthy(result.restoreKeys, 'Should provide fallback restore keys');
  t.true(
    result.cacheKey.includes(githubContext.workflow),
    'Cache key should include workflow name',
  );
  t.true(result.cacheKey.includes(githubContext.job), 'Cache key should include job name');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('build cache: should handle cache corruption gracefully', async (t) => {
  const path = tmpPath('corruption-test');
  const cache = await openLevelCache({ path, namespace: 'corruption-cache' });

  const buildCacheManager = new (await import('../build-cache-manager.js')).BuildCacheManager(
    cache,
  );

  // Manually corrupt cache data with the key the manager will use
  const expectedKey = 'build-build-corrupted-entry';
  await cache.set(expectedKey, { invalid: 'data', corrupted: true });

  // Should handle corruption gracefully
  const result = await buildCacheManager.getOrBuild('build', 'corrupted', 'entry');

  t.truthy(result, 'Should recover from cache corruption');
  t.false(await cache.has(expectedKey), 'Should remove corrupted entry');

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});

test('build cache: should support cache warming strategies', async (t) => {
  const path = tmpPath('warming-test');
  const cache = await openLevelCache({ path, namespace: 'warming-cache' });

  const cacheWarmer = new (await import('../cache-warmer.js')).CacheWarmer(cache);

  // Define common dependency patterns
  const commonPatterns = [
    { lockfile: 'common-lock-1', package: 'common-pkg-1' },
    { lockfile: 'common-lock-2', package: 'common-pkg-2' },
  ];

  // Warm cache with common patterns
  const warmedCount = await cacheWarmer.warmCache(commonPatterns);

  t.is(warmedCount, commonPatterns.length, 'Should warm all common patterns');

  // Verify warmed cache entries
  for (const pattern of commonPatterns) {
    const key = `pnpm-${pattern.lockfile}-${pattern.package}`;
    t.true(await cache.has(key), `Should have warmed cache entry for ${key}`);
  }

  await cache.close();
  rmSync(path, { recursive: true, force: true });
});
