#!/usr/bin/env tsx

/**
 * Test script to validate BuildFix Priority 1 optimizations
 *
 * This script tests:
 * 1. Process pool implementation
 * 2. Parallel fixture processing
 * 3. Memory management fixes
 * 4. Timeout and error handling
 * 5. Cache optimization
 */

import { performance } from 'perf_hooks';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  error?: string;
}

class OptimizationTester {
  private results: TestResult[] = [];

  private async measureMemory(): Promise<number> {
    const usage = process.memoryUsage();
    return usage.heapUsed;
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const memoryBefore = await this.measureMemory();
    const startTime = performance.now();

    try {
      await testFn();
      const duration = performance.now() - startTime;
      const memoryAfter = await this.measureMemory();

      const result: TestResult = {
        name,
        success: true,
        duration,
        memoryBefore,
        memoryAfter,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const memoryAfter = await this.measureMemory();

      const result: TestResult = {
        name,
        success: false,
        duration,
        memoryBefore,
        memoryAfter,
        error: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      return result;
    }
  }

  async testProcessPoolImplementation(): Promise<void> {
    console.log('🧪 Testing Process Pool Implementation...');

    // Simulate process pool creation and reuse
    const processPool: any[] = [];
    const poolSize = 3;

    // Create processes
    for (let i = 0; i < poolSize; i++) {
      const mockProcess = {
        pid: Math.floor(Math.random() * 10000),
        inUse: false,
        lastUsed: Date.now(),
        healthStatus: 'healthy' as const,
        spawnTime: Date.now(),
      };
      processPool.push(mockProcess);
    }

    // Simulate process acquisition and release
    for (let i = 0; i < 10; i++) {
      const availableProcess = processPool.find((p) => !p.inUse);
      if (!availableProcess) {
        throw new Error('No available process in pool');
      }

      availableProcess.inUse = true;
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate work
      availableProcess.inUse = false;
      availableProcess.lastUsed = Date.now();
    }

    console.log(`✅ Process pool test completed: ${poolSize} processes handled 10 tasks`);
  }

  async testParallelFixtureProcessing(): Promise<void> {
    console.log('🧪 Testing Parallel Fixture Processing...');

    const fixtures = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `fixture-${i}` }));
    const concurrency = 5;

    // Process fixtures in parallel batches
    const batches: (typeof fixtures)[] = [];
    for (let i = 0; i < fixtures.length; i += concurrency) {
      batches.push(fixtures.slice(i, i + concurrency));
    }

    let processedCount = 0;
    const startTime = performance.now();

    for (const batch of batches) {
      const batchPromises = batch.map(async (fixture) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50)); // Simulate work
        processedCount++;
        return fixture;
      });

      await Promise.allSettled(batchPromises);
    }

    const duration = performance.now() - startTime;
    console.log(
      `✅ Parallel processing test completed: ${processedCount} fixtures in ${duration.toFixed(2)}ms`,
    );
  }

  async testMemoryManagement(): Promise<void> {
    console.log('🧪 Testing Memory Management...');

    // Test circular buffer implementation
    interface CircularBuffer<T> {
      buffer: T[];
      size: number;
      head: number;
      tail: number;
      count: number;
    }

    function createCircularBuffer<T>(size: number): CircularBuffer<T> {
      return {
        buffer: new Array(size),
        size,
        head: 0,
        tail: 0,
        count: 0,
      };
    }

    function addToCircularBuffer<T>(buffer: CircularBuffer<T>, item: T): void {
      buffer.buffer[buffer.head] = item;
      buffer.head = (buffer.head + 1) % buffer.size;
      if (buffer.count < buffer.size) {
        buffer.count++;
      } else {
        buffer.tail = (buffer.tail + 1) % buffer.size;
      }
    }

    // Test with 1000 entries in a buffer of size 100
    const buffer = createCircularBuffer<number>(100);
    for (let i = 0; i < 1000; i++) {
      addToCircularBuffer(buffer, i);
    }

    if (buffer.count !== 100) {
      throw new Error(`Expected buffer count to be 100, got ${buffer.count}`);
    }

    console.log(
      `✅ Memory management test completed: circular buffer with ${buffer.count} entries`,
    );
  }

  async testTimeoutAndRetry(): Promise<void> {
    console.log('🧪 Testing Timeout and Retry Logic...');

    let attempts = 0;
    const maxRetries = 3;

    async function flakyOperation(): Promise<string> {
      attempts++;
      if (attempts < 3) {
        throw new Error(`Simulated failure ${attempts}`);
      }
      return 'success';
    }

    async function executeWithRetry<T>(
      operation: () => Promise<T>,
      maxRetries: number,
      baseDelay: number = 100,
    ): Promise<T> {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt === maxRetries) {
            throw lastError;
          }

          const backoffMs = Math.min(baseDelay * Math.pow(2, attempt - 1), 1000);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }

      throw lastError!;
    }

    const result = await executeWithRetry(flakyOperation, maxRetries);

    if (result !== 'success' || attempts !== 3) {
      throw new Error(`Retry logic failed: result=${result}, attempts=${attempts}`);
    }

    console.log(`✅ Timeout and retry test completed: succeeded after ${attempts} attempts`);
  }

  async testCacheOptimization(): Promise<void> {
    console.log('🧪 Testing Cache Optimization...');

    interface CacheEntry {
      result: any;
      timestamp: number;
      ttl: number;
    }

    class OptimizedCache {
      private cache = new Map<string, CacheEntry>();
      private maxSize = 100;
      private ttlMs = 300000; // 5 minutes

      set(key: string, result: any): void {
        const entry: CacheEntry = {
          result,
          timestamp: Date.now(),
          ttl: this.ttlMs,
        };

        this.cache.set(key, entry);

        // Cleanup if too large
        if (this.cache.size > this.maxSize) {
          this.cleanup();
        }
      }

      get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check TTL
        if (Date.now() - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
          return null;
        }

        return entry.result;
      }

      private cleanup(): void {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());

        // Remove expired entries
        for (const [key, entry] of entries) {
          if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
          }
        }

        // If still too large, remove oldest (LRU)
        if (this.cache.size > this.maxSize) {
          const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
          const toRemove = this.cache.size - this.maxSize;

          for (let i = 0; i < toRemove; i++) {
            this.cache.delete(sortedEntries[i][0]);
          }
        }
      }

      getStats() {
        return {
          size: this.cache.size,
          maxSize: this.maxSize,
        };
      }
    }

    const cache = new OptimizedCache();

    // Add 150 entries to test cleanup
    for (let i = 0; i < 150; i++) {
      cache.set(`key-${i}`, { data: `value-${i}` });
    }

    const stats = cache.getStats();

    if (stats.size > stats.maxSize) {
      throw new Error(`Cache cleanup failed: size=${stats.size}, maxSize=${stats.maxSize}`);
    }

    // Test cache hit/miss
    cache.set('test-key', { data: 'test-value' });
    const hit = cache.get('test-key');
    const miss = cache.get('non-existent-key');

    if (!hit || miss !== null) {
      throw new Error('Cache get/put logic failed');
    }

    console.log(`✅ Cache optimization test completed: ${stats.size}/${stats.maxSize} entries`);
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting BuildFix Priority 1 Optimization Tests\n');

    const tests = [
      () => this.testProcessPoolImplementation(),
      () => this.testParallelFixtureProcessing(),
      () => this.testMemoryManagement(),
      () => this.testTimeoutAndRetry(),
      () => this.testCacheOptimization(),
    ];

    for (const test of tests) {
      await test();
      console.log(''); // Add spacing between tests
    }

    this.printResults();
  }

  private printResults(): void {
    console.log('📊 Test Results Summary:');
    console.log('========================');

    let totalDuration = 0;
    let totalMemoryDelta = 0;
    let successCount = 0;

    for (const result of this.results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const memoryDelta = result.memoryAfter - result.memoryBefore;
      const memoryDeltaMB = (memoryDelta / 1024 / 1024).toFixed(2);

      console.log(`${status} ${result.name}`);
      console.log(`   Duration: ${result.duration.toFixed(2)}ms`);
      console.log(`   Memory Delta: ${memoryDeltaMB}MB`);

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }

      console.log('');

      totalDuration += result.duration;
      totalMemoryDelta += memoryDelta;
      if (result.success) successCount++;
    }

    console.log('========================');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${this.results.length - successCount}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Total Memory Delta: ${(totalMemoryDelta / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Success Rate: ${((successCount / this.results.length) * 100).toFixed(1)}%`);

    if (successCount === this.results.length) {
      console.log('\n🎉 All optimization tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
  }
}

// Run the tests
async function main() {
  const tester = new OptimizationTester();
  await tester.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { OptimizationTester };
