import * as path from 'path';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';

import { requestPlan } from '../iter/plan.js';
import { materializeSnippet } from '../iter/dsl.js';
import { buildAndJudge } from '../iter/eval.js';
import { applySnippetToProject } from '../utils.js';
import { globalTimeoutManager } from '../timeout/timeout-manager.js';

import { createFixtures, fixtures, loadMassiveFixtures } from './fixtures.js';
import type { Fixture } from './fixtures.js';
import type { BenchmarkResult, ModelConfig } from './index.js';

interface CacheEntry {
  result: BenchmarkResult;
  timestamp: number;
  inputHash: string;
  modelConfig: ModelConfig;
  fixtureHash: string;
}

interface CacheMetadata {
  version: string;
  createdAt: number;
  lastAccessed: number;
  totalEntries: number;
  cacheHits: number;
  cacheMisses: number;
}

export class MemoizedBuildFixBenchmark {
  private tempDir: string;
  private fixturesDir: string;
  private cacheDir: string;
  private cacheFile: string;
  private metadataFile: string;
  private metadata: CacheMetadata;
  private useMassiveFixtures: boolean;
  private allFixtures: Fixture[] = [];

  constructor(
    tempDir = './benchmark-temp',
    cacheDir = './benchmark-cache',
    useMassiveFixtures = false,
  ) {
    this.tempDir = path.resolve(tempDir);
    this.fixturesDir = path.join(this.tempDir, 'fixtures');
    this.cacheDir = path.resolve(cacheDir);
    this.cacheFile = path.join(this.cacheDir, 'benchmark-cache.json');
    this.metadataFile = path.join(this.cacheDir, 'metadata.json');
    this.useMassiveFixtures = useMassiveFixtures;

    this.metadata = {
      version: '1.0.0',
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      totalEntries: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  async setup(): Promise<void> {
    await fs.rm(this.tempDir, { recursive: true, force: true });
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.cacheDir, { recursive: true });

    if (this.useMassiveFixtures) {
      // Load massive fixtures
      const massiveFixturesDir = path.resolve(
        process.cwd(),
        'packages/buildfix/massive-fixture-generation-2',
      );
      this.allFixtures = await loadMassiveFixtures(massiveFixturesDir);
      // Copy massive fixtures to the temp directory
      await this.copyMassiveFixtures(massiveFixturesDir);
    } else {
      await createFixtures(this.fixturesDir);
      this.allFixtures = fixtures;
    }

    // Load existing cache metadata
    await this.loadCacheMetadata();
  }

  async cleanup(): Promise<void> {
    await fs.rm(this.tempDir, { recursive: true, force: true });
    // Don't cleanup cache - keep it for future runs
  }

  private async loadCacheMetadata(): Promise<void> {
    try {
      const metadataContent = await fs.readFile(this.metadataFile, 'utf8');
      this.metadata = JSON.parse(metadataContent);
      this.metadata.lastAccessed = Date.now();
    } catch {
      // Cache doesn't exist yet, will be created on first save
      this.metadata = {
        version: '1.0.0',
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        totalEntries: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };
    }
  }

  private async saveCacheMetadata(): Promise<void> {
    this.metadata.lastAccessed = Date.now();
    await fs.writeFile(this.metadataFile, JSON.stringify(this.metadata, null, 2));
  }

  private async loadCache(): Promise<Map<string, CacheEntry>> {
    try {
      const cacheContent = await fs.readFile(this.cacheFile, 'utf8');
      const cacheData = JSON.parse(cacheContent);
      const cache = new Map<string, CacheEntry>();

      for (const [key, entry] of Object.entries(cacheData)) {
        cache.set(key, entry as CacheEntry);
      }

      return cache;
    } catch {
      return new Map<string, CacheEntry>();
    }
  }

  private async saveCache(cache: Map<string, CacheEntry>, incremental = false): Promise<void> {
    if (incremental) {
      // For incremental updates, only save new/modified entries
      await this.saveCacheIncremental(cache);
    } else {
      // Full cache save
      const cacheData: Record<string, CacheEntry> = {};

      for (const [key, entry] of cache.entries()) {
        cacheData[key] = entry;
      }

      await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
      this.metadata.totalEntries = cache.size;
      await this.saveCacheMetadata();
    }
  }

  private async saveCacheIncremental(cache: Map<string, CacheEntry>): Promise<void> {
    try {
      // Load existing cache to compare
      const existingCache = await this.loadCache();
      const updates: Record<string, CacheEntry> = {};
      let hasUpdates = false;

      // Find new or modified entries
      for (const [key, entry] of cache.entries()) {
        const existingEntry = existingCache.get(key);
        if (!existingEntry || existingEntry.timestamp !== entry.timestamp) {
          updates[key] = entry;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        // Append updates to a separate file for incremental changes
        const incrementalFile = path.join(this.cacheDir, `cache-updates-${Date.now()}.json`);
        await fs.writeFile(incrementalFile, JSON.stringify(updates, null, 2));

        // Also update the main cache file periodically
        if (cache.size % 10 === 0) {
          // Every 10 entries
          await this.saveCache(cache, false); // Full save
        }
      }

      this.metadata.totalEntries = cache.size;
      await this.saveCacheMetadata();
    } catch (error) {
      // Fallback to full save if incremental fails
      console.warn('Incremental cache save failed, falling back to full save:', error);
      await this.saveCache(cache, false);
    }
  }

  private generateInputHash(fixture: Fixture, modelConfig: ModelConfig): string {
    // Create a hash based on fixture content and model configuration
    const fixtureContent = JSON.stringify({
      name: fixture.name,
      files: fixture.files,
    });

    const modelContent = JSON.stringify({
      name: modelConfig.name,
      model: modelConfig.model,
      options: modelConfig.options || {},
    });

    const combinedContent = fixtureContent + modelContent;
    return crypto.createHash('sha256').update(combinedContent).digest('hex');
  }

  private generateFixtureHash(fixture: Fixture): string {
    // Hash only the fixture files content
    const fixtureContent = JSON.stringify({
      name: fixture.name,
      files: fixture.files,
    });
    return crypto.createHash('sha256').update(fixtureContent).digest('hex');
  }

  private generateCacheKey(fixtureHash: string, modelConfig: ModelConfig): string {
    const modelHash = crypto
      .createHash('md5')
      .update(
        JSON.stringify({
          name: modelConfig.name,
          model: modelConfig.model,
          options: modelConfig.options || {},
        }),
      )
      .digest('hex');

    return `${fixtureHash}-${modelHash}`;
  }

  private async findCachedResult(
    cache: Map<string, CacheEntry>,
    fixture: Fixture,
    modelConfig: ModelConfig,
  ): Promise<CacheEntry | null> {
    const fixtureHash = this.generateFixtureHash(fixture);
    const inputHash = this.generateInputHash(fixture, modelConfig);
    const cacheKey = this.generateCacheKey(fixtureHash, modelConfig);

    const entry = cache.get(cacheKey);

    if (!entry) {
      this.metadata.cacheMisses++;
      return null;
    }

    // Verify the entry is still valid (same input hash)
    if (entry.inputHash !== inputHash) {
      this.metadata.cacheMisses++;
      cache.delete(cacheKey);
      return null;
    }

    this.metadata.cacheHits++;
    return entry;
  }

  private async cacheResult(
    cache: Map<string, CacheEntry>,
    fixture: Fixture,
    modelConfig: ModelConfig,
    result: BenchmarkResult,
  ): Promise<void> {
    const fixtureHash = this.generateFixtureHash(fixture);
    const inputHash = this.generateInputHash(fixture, modelConfig);
    const cacheKey = this.generateCacheKey(fixtureHash, modelConfig);

    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      inputHash,
      modelConfig,
      fixtureHash,
    };

    cache.set(cacheKey, entry);

    // Cleanup cache if it's getting too large
    if (cache.size > 500) {
      this.cleanupCache(cache);
    }
  }

  private cleanupCache(cache: Map<string, CacheEntry>): void {
    const now = Date.now();
    const entries = Array.from(cache.entries());

    // Sort by timestamp (oldest first) for LRU eviction
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    let evictedCount = 0;
    const maxCacheSize = 500; // Maximum cache entries
    const ttlMs = 300000; // 5 minutes TTL

    // First, remove expired entries
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > ttlMs) {
        cache.delete(key);
        evictedCount++;
      }
    }

    // If still too large, remove oldest entries (LRU)
    if (cache.size > maxCacheSize) {
      const currentEntries = Array.from(cache.entries());
      currentEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = cache.size - maxCacheSize;
      for (let i = 0; i < toRemove; i++) {
        const entry = currentEntries[i];
        if (entry) {
          cache.delete(entry[0]);
          evictedCount++;
        }
      }
    }

    if (evictedCount > 0) {
      console.log(`🗑️  Cache cleanup: evicted ${evictedCount} entries (${cache.size} remaining)`);
    }
  }

  async runSingleBenchmark(
    fixture: Fixture,
    modelConfig: ModelConfig,
    maxAttempts = 3,
    forceRefresh = false,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();

    // Load cache
    const cache = await this.loadCache();

    // Check for cached result
    if (!forceRefresh) {
      const cachedEntry = await this.findCachedResult(cache, fixture, modelConfig);
      if (cachedEntry) {
        console.log(`🎯 Cache hit for ${fixture.name} with ${modelConfig.name}`);
        await this.saveCacheMetadata();
        return {
          ...cachedEntry.result,
          duration: cachedEntry.result.duration, // Keep original duration
        };
      }
    }

    console.log(`🔄 Cache miss for ${fixture.name} with ${modelConfig.name} - running benchmark`);

    // Run the actual benchmark
    const result = await this.runActualBenchmark(fixture, modelConfig, maxAttempts, startTime);

    // Cache the result
    await this.cacheResult(cache, fixture, modelConfig, result);
    await this.saveCache(cache);

    return result;
  }

  private async runActualBenchmark(
    fixture: Fixture,
    modelConfig: ModelConfig,
    maxAttempts: number,
    startTime: number,
  ): Promise<BenchmarkResult> {
    const fixtureDir = path.join(this.fixturesDir, fixture.name);
    const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');

    // Backup original source files before making changes
    const originalFiles = new Map<string, string>();
    for (const filename of Object.keys(fixture.files)) {
      const filePath = path.join(fixtureDir, filename);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        originalFiles.set(filename, content);
      } catch {
        // File might not exist yet, that's ok
      }
    }

    const result: BenchmarkResult = {
      fixture: fixture.name,
      model: modelConfig.name,
      success: false,
      errorCountBefore: 0,
      errorCountAfter: 0,
      errorsResolved: false,
      planGenerated: false,
      duration: 0,
      attempts: 0,
    };

    try {
      // Get initial error count
      const { r: beforeBuild } = await buildAndJudge(tsconfigPath, '', { timeout: globalTimeoutManager.getTimeout('tsc') });
      result.errorCountBefore = beforeBuild.diags.length;

      if (result.errorCountBefore === 0) {
        result.errorMessage = 'No errors found in fixture';
        result.duration = Date.now() - startTime;
        return result;
      }

      // Try to fix with multiple attempts
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        result.attempts = attempt;

        // Create a mock error object for the first error
        const firstError = beforeBuild.diags[0];
        if (!firstError) {
          result.errorMessage = 'No error details found';
          result.duration = Date.now() - startTime;
          return result;
        }

        const mockError = {
          file: path.join(fixtureDir, 'src.ts'),
          line: firstError.line,
          col: firstError.col,
          code: firstError.code,
          message: firstError.message,
          frame: firstError.message || '',
          key: `${firstError.code}|${path.join(fixtureDir, 'src.ts')}|${firstError.line}`,
        };

        // Create mock history
        const mockHistory = {
          key: mockError.key,
          file: mockError.file,
          code: mockError.code,
          attempts: [],
        };

        try {
          // Generate plan (this is the expensive LLM call we're caching)
          const plan = await requestPlan(modelConfig.model, mockError, mockHistory);
          result.planGenerated = true;
          result.planTitle = plan.title;

          // Materialize and apply snippet
          const snippetPath = path.join(fixtureDir, `attempt-${attempt}.mjs`);
          await materializeSnippet(plan, snippetPath);
          await applySnippetToProject(tsconfigPath, snippetPath);

          // Check if fixed
          const { r: afterBuild, present } = await buildAndJudge(tsconfigPath, mockError.key, { timeout: globalTimeoutManager.getTimeout('tsc') });
          result.errorCountAfter = afterBuild.diags.length;
          result.errorsResolved = !present;

          if (result.errorsResolved) {
            result.success = true;
            result.duration = Date.now() - startTime;
            return result;
          }
        } catch (error) {
          result.errorMessage = error instanceof Error ? error.message : String(error);
          // Continue to next attempt
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.errorMessage = error instanceof Error ? error.message : String(error);
      result.duration = Date.now() - startTime;
      return result;
    } finally {
      // Restore original files
      for (const [filename, content] of originalFiles.entries()) {
        const filePath = path.join(fixtureDir, filename);
        try {
          await fs.writeFile(filePath, content);
        } catch {
          // Ignore restore errors
        }
      }
    }
  }

  async runBenchmark(
    modelConfigs: ModelConfig[],
    forceRefresh = false,
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const fixtureList = this.allFixtures;

    console.log(`🚀 Starting optimized memoized benchmark with parallel processing`);
    console.log(`📁 Cache directory: ${this.cacheDir}`);
    console.log(`🎯 Force refresh: ${forceRefresh}`);
    console.log(
      `\n🎯 Running ${fixtureList.length} fixtures against ${modelConfigs.length} models`,
    );
    console.log(
      `📊 Optimized batching: ${modelConfigs.length} model batches instead of ${fixtureList.length * modelConfigs.length} individual loads`,
    );

    // Process each model separately (load once, test all fixtures)
    for (const modelConfig of modelConfigs) {
      console.log(`\n🤖 Loading model: ${modelConfig.name}`);
      console.log(`📋 Processing ${fixtureList.length} fixtures with ${modelConfig.name}...`);

      // Use parallel processing for fixtures with controlled concurrency
      const modelResults = await this.processFixturesInParallel(
        fixtureList,
        modelConfig,
        forceRefresh,
      );

      console.log(
        `\n✅ Completed ${modelConfig.name}: ${modelResults.filter((r) => r.success).length}/${modelResults.length} successful`,
      );
      results.push(...modelResults);
    }

    // Print cache statistics
    console.log(`\n📊 Cache Statistics:`);
    console.log(`  Cache hits: ${this.metadata.cacheHits}`);
    console.log(`  Cache misses: ${this.metadata.cacheMisses}`);
    console.log(
      `  Hit rate: ${(this.metadata.cacheHits / (this.metadata.cacheHits + this.metadata.cacheMisses)) * 100}%`,
    );
    console.log(`  Total entries: ${this.metadata.totalEntries}`);

    return results;
  }

  private async processFixturesInParallel(
    fixtures: Fixture[],
    modelConfig: ModelConfig,
    forceRefresh: boolean,
    concurrency = 5, // Process up to 5 fixtures in parallel
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const totalFixtures = fixtures.length;
    let completed = 0;

    // Create batches of fixtures for parallel processing
    const batches: Fixture[][] = [];
    for (let i = 0; i < fixtures.length; i += concurrency) {
      batches.push(fixtures.slice(i, i + concurrency));
    }

    console.log(
      `🔄 Processing ${totalFixtures} fixtures in ${batches.length} batches (concurrency: ${concurrency})`,
    );

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Process all fixtures in this batch in parallel
      const batchPromises = (batch || []).map(async (fixture) => {
        if (!fixture) {
          console.warn(`⚠️  Fixture is undefined, skipping`);
          return null;
        }

        try {
          const result = await this.runSingleBenchmark(fixture, modelConfig, 3, forceRefresh);
          completed++;

          const progress = Math.round((completed / totalFixtures) * 100);
          process.stdout.write(
            `\r⚡ ${modelConfig.name}: ${completed}/${totalFixtures} fixtures (${progress}%) - Batch ${batchIndex + 1}/${batches.length}`,
          );

          return result;
        } catch (error) {
          completed++;
          console.error(`❌ Error processing fixture ${fixture.name}:`, error);

          // Return a failed result instead of null to maintain consistency
          return {
            fixture: fixture.name,
            model: modelConfig.name,
            success: false,
            errorCountBefore: 0,
            errorCountAfter: 0,
            errorsResolved: false,
            planGenerated: false,
            duration: 0,
            attempts: 1,
            errorMessage: error instanceof Error ? error.message : String(error),
          };
        }
      });

      // Wait for all fixtures in this batch to complete
      const batchResults = await Promise.allSettled(batchPromises);

      // Aggregate results from this batch
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value !== null) {
          results.push(result.value);
        } else if (result.status === 'rejected') {
          console.error(`❌ Batch promise rejected:`, result.reason);
        }
      });

      // Small delay between batches to prevent overwhelming the system
      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(); // New line after progress indicator
    return results;
  }

  async clearCache(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
      this.metadata = {
        version: '1.0.0',
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        totalEntries: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };
      await this.saveCacheMetadata();
      console.log('🗑️  Cache cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  async getCacheInfo(): Promise<void> {
    await this.loadCacheMetadata();
    const cache = await this.loadCache();

    console.log('📊 Cache Information:');
    console.log(`  Version: ${this.metadata.version}`);
    console.log(`  Created: ${new Date(this.metadata.createdAt).toISOString()}`);
    console.log(`  Last accessed: ${new Date(this.metadata.lastAccessed).toISOString()}`);
    console.log(`  Total entries: ${cache.size}`);
    console.log(`  Cache hits: ${this.metadata.cacheHits}`);
    console.log(`  Cache misses: ${this.metadata.cacheMisses}`);

    if (this.metadata.cacheHits + this.metadata.cacheMisses > 0) {
      const hitRate =
        (this.metadata.cacheHits / (this.metadata.cacheHits + this.metadata.cacheMisses)) * 100;
      console.log(`  Hit rate: ${hitRate.toFixed(1)}%`);
    }

    // Show cache size
    try {
      const stats = await fs.stat(this.cacheFile);
      console.log(`  Cache file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } catch {
      console.log(`  Cache file size: Not available`);
    }
  }

  private async copyMassiveFixtures(massiveFixturesDir: string): Promise<void> {
    const fixtureDirs = await fs.readdir(massiveFixturesDir);
    const fixtureNames = fixtureDirs.filter((name) => name.startsWith('fixture-'));

    for (const fixtureName of fixtureNames) {
      const sourceDir = path.join(massiveFixturesDir, fixtureName);
      const targetDir = path.join(this.fixturesDir, fixtureName);

      // Copy fixture directory
      await fs.mkdir(targetDir, { recursive: true });
      const files = await fs.readdir(sourceDir);

      for (const file of files) {
        const sourceFile = path.join(sourceDir, file);
        const targetFile = path.join(targetDir, file);
        await fs.copyFile(sourceFile, targetFile);
      }
    }

    console.log(`Copied ${fixtureNames.length} massive fixtures to ${this.fixturesDir}`);
  }

  async exportCache(exportPath: string): Promise<void> {
    const cache = await this.loadCache();
    const exportData = {
      metadata: this.metadata,
      entries: Object.fromEntries(cache),
      exportedAt: new Date().toISOString(),
    };

    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`📤 Cache exported to: ${exportPath}`);
  }

  async importCache(importPath: string): Promise<void> {
    try {
      const importData = JSON.parse(await fs.readFile(importPath, 'utf8'));

      if (importData.metadata) {
        this.metadata = importData.metadata;
        await this.saveCacheMetadata();
      }

      if (importData.entries) {
        const cache = new Map<string, CacheEntry>();
        for (const [key, entry] of Object.entries(importData.entries)) {
          cache.set(key, entry as CacheEntry);
        }
        await this.saveCache(cache);
      }

      console.log(`📥 Cache imported from: ${importPath}`);
    } catch (error) {
      console.error('❌ Failed to import cache:', error);
    }
  }
}

// Export a singleton instance for easy use
export const memoizedBenchmark = new MemoizedBuildFixBenchmark();
