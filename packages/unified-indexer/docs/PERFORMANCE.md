# Performance Guide

This guide provides comprehensive performance optimization strategies, benchmarks, and best practices for the @promethean-os/unified-indexer package.

## Table of Contents

- [Performance Characteristics](#performance-characteristics)
- [Benchmarking](#benchmarking)
- [Optimization Strategies](#optimization-strategies)
- [Memory Management](#memory-management)
- [Scaling Considerations](#scaling-considerations)
- [Monitoring](#monitoring)
- [Performance Tuning](#performance-tuning)

## Performance Characteristics

### Baseline Performance Metrics

Based on testing with standard hardware (8GB RAM, 4 CPU cores):

| Operation                  | Small Dataset (<1K items) | Medium Dataset (1K-10K) | Large Dataset (>10K) |
| -------------------------- | ------------------------- | ----------------------- | -------------------- |
| Index Creation             | <10ms                     | 10-50ms                 | 50-200ms             |
| Search Query               | <5ms                      | 5-20ms                  | 20-100ms             |
| Context Compilation        | <15ms                     | 15-75ms                 | 75-300ms             |
| Batch Indexing (100 items) | 20-50ms                   | 50-150ms                | 150-500ms            |

### Performance Bottlenecks

1. **Synchronous Operations**: Some operations block the event loop
2. **Memory Usage**: Large datasets can consume significant memory
3. **Search Scoring**: Complex scoring algorithms impact query time
4. **Context Compilation**: Expensive operations for large result sets

## Benchmarking

### Running Benchmarks

```typescript
import { createPerformanceBenchmark } from './src/utils/performance';

const benchmark = createPerformanceBenchmark({
  iterations: 1000,
  warmupIterations: 100,
  datasetSize: 10000,
});

// Benchmark search performance
const searchResults = await benchmark.run('search', async () => {
  return await unifiedIndexer.search({
    query: 'test query',
    limit: 10,
  });
});

console.log('Search Performance:', searchResults);
```

### Custom Benchmark Suite

```typescript
import { UnifiedIndexer } from '@promethean-os/unified-indexer';

async function runPerformanceSuite() {
  const indexer = new UnifiedIndexer({
    // Production configuration
  });

  const testQueries = [
    'simple query',
    'complex query with multiple terms',
    'domain-specific query',
    'cross-domain search',
  ];

  for (const query of testQueries) {
    const startTime = performance.now();

    await indexer.search({ query });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Query "${query}": ${duration.toFixed(2)}ms`);
  }
}
```

## Optimization Strategies

### 1. Configuration Optimization

#### High-Performance Configuration

```typescript
const highPerformanceConfig: UnifiedIndexerConfig = {
  search: {
    maxResults: 50, // Reduced from default 100
    enableFuzzy: false, // Disable for exact matches only
    enableSemantic: false, // Disable if not needed
    timeout: 5000, // Shorter timeout
    batchSize: 20, // Smaller batches for faster response
  },
  indexing: {
    enableAutoIndexing: false, // Manual control
    batchSize: 50, // Smaller batches
    maxConcurrency: 2, // Limit concurrency
    enableDeduplication: true, // Reduce storage overhead
  },
  performance: {
    enableCaching: true,
    cacheSize: 1000,
    enableCompression: true,
    compressionLevel: 6,
  },
};
```

#### Memory-Optimized Configuration

```typescript
const memoryOptimizedConfig: UnifiedIndexerConfig = {
  search: {
    maxResults: 20, // Minimal result set
    enableFuzzy: false,
    enableSemantic: false,
    timeout: 3000,
    batchSize: 10,
  },
  indexing: {
    enableAutoIndexing: false,
    batchSize: 25, // Smaller batches
    maxConcurrency: 1, // Single-threaded
    enableDeduplication: true,
    maxStorageSize: 100 * 1024 * 1024, // 100MB limit
  },
  performance: {
    enableCaching: true,
    cacheSize: 500, // Smaller cache
    enableCompression: true,
    compressionLevel: 9, // Maximum compression
  },
};
```

### 2. Search Optimization

#### Efficient Query Patterns

```typescript
// ✅ Good: Specific queries with limits
const optimizedSearch = await indexer.search({
  query: 'specific term',
  domain: 'documentation',
  source: 'github',
  limit: 10,
  timeout: 2000,
});

// ❌ Avoid: Broad queries without limits
const inefficientSearch = await indexer.search({
  query: 'general term',
  // No domain, source, or limit specified
});
```

#### Batch Search Optimization

```typescript
// Process multiple queries efficiently
const queries = ['query 1', 'query 2', 'query 3'];

const results = await Promise.all(
  queries.map((query) =>
    indexer.search({
      query,
      limit: 10,
      timeout: 1000,
    }),
  ),
);
```

### 3. Indexing Optimization

#### Efficient Batch Indexing

```typescript
// ✅ Good: Chunked batch processing
const items = largeDataset;
const chunkSize = 50;

for (let i = 0; i < items.length; i += chunkSize) {
  const chunk = items.slice(i, i + chunkSize);
  await indexer.index(chunk);

  // Small delay to prevent overwhelming the system
  await new Promise((resolve) => setTimeout(resolve, 10));
}

// ❌ Avoid: Processing all items at once
await indexer.index(largeDataset); // May cause memory issues
```

#### Selective Indexing

```typescript
// Only index relevant items
const relevantItems = allItems.filter(
  (item) => item.metadata.domain === 'important' && item.metadata.score > 0.5,
);

await indexer.index(relevantItems);
```

## Memory Management

### Memory Usage Patterns

```typescript
// Monitor memory usage
function monitorMemoryUsage() {
  const usage = process.memoryUsage();

  console.log('Memory Usage:', {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
  });
}

// Run periodically during intensive operations
setInterval(monitorMemoryUsage, 5000);
```

### Memory Leak Prevention

```typescript
class MemoryManagedIndexer {
  private cache = new Map();
  private readonly maxCacheSize = 1000;

  async search(query: SearchQuery) {
    // Implement cache eviction
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Use WeakMap for temporary storage
    const tempResults = new WeakMap();

    // Clear references when done
    const results = await this.performSearch(query);
    tempResults.set(results, true);

    return results;
  }
}
```

### Garbage Collection Optimization

```typescript
// Force garbage collection in development
if (process.env.NODE_ENV === 'development') {
  global.gc = global.gc || (() => {});

  // Periodic cleanup
  setInterval(() => {
    global.gc();
  }, 60000); // Every minute
}
```

## Scaling Considerations

### Horizontal Scaling

```typescript
// Distributed indexing setup
class DistributedIndexer {
  private nodes: UnifiedIndexer[] = [];

  constructor(nodeCount: number) {
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push(
        new UnifiedIndexer({
          nodeId: `node-${i}`,
          // Node-specific configuration
        }),
      );
    }
  }

  async distributeIndex(items: IndexableItem[]) {
    const chunks = this.chunkArray(items, this.nodes.length);

    const promises = chunks.map((chunk, index) => this.nodes[index].index(chunk));

    return Promise.all(promises);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
```

### Load Balancing

```typescript
class LoadBalancedIndexer {
  private currentIndex = 0;

  constructor(private indexers: UnifiedIndexer[]) {}

  async search(query: SearchQuery) {
    // Round-robin load balancing
    const indexer = this.indexers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.indexers.length;

    return indexer.search(query);
  }

  async index(items: IndexableItem[]) {
    // Distribute based on current load
    const loads = await Promise.all(this.indexers.map((indexer) => indexer.getCurrentLoad()));

    const leastLoadedIndex = loads.indexOf(Math.min(...loads));
    return this.indexers[leastLoadedIndex].index(items);
  }
}
```

## Monitoring

### Performance Metrics

```typescript
interface PerformanceMetrics {
  searchLatency: number;
  indexingThroughput: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  recordSearch(duration: number) {
    this.metrics.push({
      searchLatency: duration,
      indexingThroughput: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      cacheHitRate: 0,
      errorRate: 0,
    });
  }

  getAverageMetrics(): PerformanceMetrics {
    const sum = this.metrics.reduce(
      (acc, metric) => ({
        searchLatency: acc.searchLatency + metric.searchLatency,
        indexingThroughput: acc.indexingThroughput + metric.indexingThroughput,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
        errorRate: acc.errorRate + metric.errorRate,
      }),
      { searchLatency: 0, indexingThroughput: 0, memoryUsage: 0, cacheHitRate: 0, errorRate: 0 },
    );

    const count = this.metrics.length;
    return {
      searchLatency: sum.searchLatency / count,
      indexingThroughput: sum.indexingThroughput / count,
      memoryUsage: sum.memoryUsage / count,
      cacheHitRate: sum.cacheHitRate / count,
      errorRate: sum.errorRate / count,
    };
  }
}
```

### Health Checks

```typescript
async function performHealthCheck(indexer: UnifiedIndexer) {
  const health = {
    status: 'healthy',
    checks: {} as Record<string, boolean>,
    metrics: {} as Record<string, number>,
  };

  try {
    // Check search functionality
    const searchStart = Date.now();
    await indexer.search({ query: 'health check', limit: 1 });
    health.checks.search = true;
    health.metrics.searchLatency = Date.now() - searchStart;
  } catch (error) {
    health.checks.search = false;
    health.status = 'degraded';
  }

  try {
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    health.metrics.memoryUsage = memoryUsage.heapUsed;
    health.checks.memory = memoryUsage.heapUsed < 500 * 1024 * 1024; // 500MB limit
  } catch (error) {
    health.checks.memory = false;
    health.status = 'unhealthy';
  }

  return health;
}
```

## Performance Tuning

### JIT Compilation Optimization

```typescript
// Warm up functions for optimal JIT performance
async function warmupIndexer(indexer: UnifiedIndexer) {
  const warmupQueries = [
    'short',
    'medium length query',
    'very long query with multiple terms and complex structure',
  ];

  for (const query of warmupQueries) {
    await indexer.search({ query });
  }
}

// Initialize with warmup
const indexer = new UnifiedIndexer(config);
await warmupIndexer(indexer);
```

### Connection Pooling

```typescript
class PooledIndexer {
  private pool: UnifiedIndexer[] = [];
  private available: UnifiedIndexer[] = [];

  constructor(
    private config: UnifiedIndexerConfig,
    poolSize: number = 5,
  ) {
    for (let i = 0; i < poolSize; i++) {
      const indexer = new UnifiedIndexer(config);
      this.pool.push(indexer);
      this.available.push(indexer);
    }
  }

  async acquire(): Promise<UnifiedIndexer> {
    if (this.available.length === 0) {
      // Wait for available indexer
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.available.length > 0) {
            clearInterval(checkInterval);
            resolve(undefined);
          }
        }, 10);
      });
    }

    return this.available.pop()!;
  }

  release(indexer: UnifiedIndexer) {
    this.available.push(indexer);
  }
}
```

### Async Operation Optimization

```typescript
// Use Promise.allSettled for concurrent operations
async function optimizedBatchSearch(indexer: UnifiedIndexer, queries: string[]) {
  const searchPromises = queries.map((query) => indexer.search({ query, limit: 10 }));

  const results = await Promise.allSettled(searchPromises);

  return results.map((result, index) => ({
    query: queries[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}
```

## Performance Best Practices

### Do's

- ✅ Use specific search queries with domain and source filters
- ✅ Implement proper caching for frequently accessed data
- ✅ Monitor memory usage and implement cleanup strategies
- ✅ Use batch operations for bulk indexing
- ✅ Set appropriate timeouts for search operations
- ✅ Implement proper error handling and retry logic

### Don'ts

- ❌ Perform broad searches without limits
- ❌ Index large datasets all at once
- ❌ Ignore memory leak warnings
- ❌ Use synchronous operations in hot paths
- ❌ Skip performance monitoring in production
- ❌ Assume linear performance scaling

## Performance Testing

### Load Testing Script

```typescript
import { UnifiedIndexer } from '@promethean-os/unified-indexer';

async function loadTest() {
  const indexer = new UnifiedIndexer();

  const testQueries = Array.from({ length: 1000 }, (_, i) => `test query ${i}`);

  console.time('Load Test');

  const promises = testQueries.map((query) => indexer.search({ query, limit: 5 }));

  const results = await Promise.all(promises);

  console.timeEnd('Load Test');
  console.log(`Processed ${results.length} queries`);

  // Analyze results
  const successCount = results.filter((r) => r.length > 0).length;
  console.log(`Success rate: ${((successCount / results.length) * 100).toFixed(2)}%`);
}

// Run load test
loadTest().catch(console.error);
```

This performance guide provides comprehensive strategies for optimizing the unified-indexer package for various use cases and deployment scenarios.
