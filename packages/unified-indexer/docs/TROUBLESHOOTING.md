# Troubleshooting Guide

This guide provides comprehensive troubleshooting strategies for common issues, errors, and performance problems with the @promethean-os/unified-indexer package.

## Table of Contents

- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Performance Problems](#performance-problems)
- [Memory Issues](#memory-issues)
- [Configuration Issues](#configuration-issues)
- [Integration Problems](#integration-problems)
- [Debugging Strategies](#debugging-strategies)
- [Getting Help](#getting-help)

## Common Issues

### 1. Indexer Returns Empty Results

**Symptoms**: Search queries return empty arrays or no results

**Possible Causes**:

- No data has been indexed
- Index is corrupted or incomplete
- Search query is too restrictive
- Domain/source filters don't match indexed data

**Solutions**:

```typescript
// Check if data exists in index
const healthCheck = await indexer.healthCheck();
console.log('Index health:', healthCheck);

// Verify data was indexed
const stats = await indexer.getStats();
console.log('Index statistics:', stats);

// Try broader search
const broadResults = await indexer.search({
  query: 'simple term',
  // Remove restrictive filters
});

// Check specific domains
const domainResults = await indexer.search({
  query: 'term',
  domain: 'documentation', // Use known domain
});
```

### 2. Indexing Fails Silently

**Symptoms**: `index()` method completes but no data is searchable

**Possible Causes**:

- Invalid data format
- Missing required fields
- Configuration issues
- Permission problems

**Solutions**:

```typescript
// Validate data before indexing
function validateIndexableItem(item: unknown): item is IndexableItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'content' in item &&
    'metadata' in item
  );
}

// Add error handling
try {
  const result = await indexer.index(items);
  console.log(`Indexed ${result.indexed} items successfully`);
} catch (error) {
  console.error('Indexing failed:', error);

  // Check individual items
  for (const item of items) {
    if (!validateIndexableItem(item)) {
      console.error('Invalid item:', item);
    }
  }
}
```

### 3. Slow Search Performance

**Symptoms**: Search queries take multiple seconds to complete

**Possible Causes**:

- Large dataset without proper indexing
- Inefficient search queries
- Memory pressure
- Configuration issues

**Solutions**:

```typescript
// Optimize search configuration
const optimizedConfig = {
  search: {
    maxResults: 50, // Reduce result count
    enableFuzzy: false, // Disable expensive features
    enableSemantic: false,
    timeout: 5000, // Add timeout
    batchSize: 20, // Smaller batches
  },
};

// Use specific queries
const fastSearch = await indexer.search({
  query: 'specific term',
  domain: 'documentation', // Add filters
  source: 'github',
  limit: 10, // Explicit limit
});

// Monitor performance
const startTime = performance.now();
await indexer.search(query);
const duration = performance.now() - startTime;
console.log(`Search took ${duration.toFixed(2)}ms`);
```

### 4. Memory Leaks

**Symptoms**: Memory usage continuously increases over time

**Possible Causes**:

- Unclosed intervals/timeouts
- Large object retention
- Cache not being cleared
- Event listeners not removed

**Solutions**:

```typescript
// Monitor memory usage
function monitorMemory() {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
  });
}

// Cleanup function
async function cleanupIndexer(indexer: UnifiedIndexer) {
  try {
    // Clear any intervals
    if (indexer.syncInterval) {
      clearInterval(indexer.syncInterval);
    }

    // Clear cache
    await indexer.clearCache();

    // Force garbage collection in development
    if (process.env.NODE_ENV === 'development' && global.gc) {
      global.gc();
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Use in production
process.on('SIGTERM', async () => {
  await cleanupIndexer(indexer);
  process.exit(0);
});
```

## Error Messages

### Configuration Errors

#### `Invalid configuration: missing required field 'search'`

**Cause**: Required configuration fields are missing

**Solution**:

```typescript
// Ensure complete configuration
const validConfig: UnifiedIndexerConfig = {
  search: {
    maxResults: 100,
    enableFuzzy: true,
    enableSemantic: true,
    timeout: 10000,
    batchSize: 50,
  },
  indexing: {
    enableAutoIndexing: true,
    batchSize: 100,
    maxConcurrency: 4,
  },
  domains: {
    documentation: { enabled: true },
    code: { enabled: true },
  },
};
```

#### `Unknown domain: 'domain-name'`

**Cause**: Attempting to search in an unconfigured domain

**Solution**:

```typescript
// Check available domains
const stats = await indexer.getStats();
console.log('Available domains:', Object.keys(stats.domains));

// Add domain to configuration
const config = indexer.getConfig();
config.domains['domain-name'] = { enabled: true };
await indexer.updateConfig(config);
```

### Runtime Errors

#### `Index operation timed out`

**Cause**: Indexing operation exceeded configured timeout

**Solution**:

```typescript
// Increase timeout for large datasets
const config = {
  indexing: {
    timeout: 60000, // 60 seconds
    batchSize: 50, // Smaller batches
  },
};

// Or process in chunks
const chunks = chunkArray(largeDataset, 100);
for (const chunk of chunks) {
  await indexer.index(chunk);
  await new Promise((resolve) => setTimeout(resolve, 100)); // Brief pause
}
```

#### `Search query too broad`

**Cause**: Query without sufficient constraints

**Solution**:

```typescript
// Add constraints to query
const constrainedSearch = {
  query: 'term',
  domain: 'documentation', // Add domain
  source: 'github', // Add source
  limit: 50, // Add limit
  dateRange: {
    // Add date range
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31'),
  },
};
```

### Network/Storage Errors

#### `Storage connection failed`

**Cause**: Unable to connect to underlying storage

**Solution**:

```typescript
// Check storage health
try {
  await indexer.healthCheck();
} catch (error) {
  console.error('Storage health check failed:', error);

  // Reinitialize storage connection
  await indexer.reconnect();
}

// Verify storage configuration
const config = indexer.getConfig();
console.log('Storage config:', config.storage);
```

#### `Concurrent modification detected`

**Cause**: Multiple processes modifying the same index

**Solution**:

```typescript
// Implement proper locking
class ThreadSafeIndexer {
  private isIndexing = false;

  async index(items: IndexableItem[]) {
    if (this.isIndexing) {
      throw new Error('Indexing already in progress');
    }

    this.isIndexing = true;
    try {
      return await this.performIndexing(items);
    } finally {
      this.isIndexing = false;
    }
  }
}
```

## Performance Problems

### Slow Indexing

**Diagnosis**:

```typescript
// Profile indexing performance
async function profileIndexing(items: IndexableItem[]) {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  const result = await indexer.index(items);

  const endTime = performance.now();
  const endMemory = process.memoryUsage();

  console.log('Indexing performance:', {
    duration: endTime - startTime,
    itemsPerSecond: items.length / ((endTime - startTime) / 1000),
    memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
    successRate: result.indexed / items.length,
  });
}
```

**Optimizations**:

```typescript
// Batch processing with progress tracking
async function optimizedIndexing(items: IndexableItem[]) {
  const batchSize = 50;
  const batches = chunkArray(items, batchSize);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    console.log(`Processing batch ${i + 1}/${batches.length}`);

    try {
      await indexer.index(batch);
    } catch (error) {
      console.error(`Batch ${i + 1} failed:`, error);
      // Continue with next batch
    }

    // Prevent overwhelming the system
    if (i % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
```

### Slow Search Queries

**Diagnosis**:

```typescript
// Analyze query performance
async function analyzeQueryPerformance(queries: string[]) {
  for (const query of queries) {
    const startTime = performance.now();

    const results = await indexer.search({ query });

    const duration = performance.now() - startTime;

    console.log(`Query "${query}":`, {
      duration: `${duration.toFixed(2)}ms`,
      resultCount: results.length,
      resultsPerMs: results.length / duration,
    });
  }
}
```

**Optimizations**:

```typescript
// Query optimization strategies
const optimizedQueries = [
  // Use specific terms
  { query: 'typescript function', limit: 10 },

  // Add domain filters
  { query: 'api', domain: 'documentation', limit: 20 },

  // Use date ranges
  {
    query: 'feature',
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-06-01'),
    },
    limit: 15,
  },

  // Combine filters
  {
    query: 'bug fix',
    domain: 'code',
    source: 'github',
    limit: 25,
  },
];
```

## Memory Issues

### High Memory Usage

**Detection**:

```typescript
// Memory monitoring
class MemoryMonitor {
  private warnings = 0;
  private readonly maxWarnings = 5;

  checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;

    console.log(`Memory usage: ${heapUsedMB.toFixed(2)} MB`);

    if (heapUsedMB > 500) {
      // 500MB threshold
      this.warnings++;

      if (this.warnings >= this.maxWarnings) {
        console.error('Critical memory usage detected');
        this.triggerCleanup();
      }
    }
  }

  private triggerCleanup() {
    // Clear caches
    indexer.clearCache();

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    this.warnings = 0;
  }
}
```

**Prevention**:

```typescript
// Memory-efficient configuration
const memoryEfficientConfig = {
  search: {
    maxResults: 20, // Smaller result sets
    enableFuzzy: false, // Disable expensive features
    enableSemantic: false,
    cacheSize: 100, // Smaller cache
  },
  indexing: {
    batchSize: 25, // Smaller batches
    maxConcurrency: 1, // Single-threaded
    enableDeduplication: true,
  },
  performance: {
    enableCompression: true,
    compressionLevel: 9, // Maximum compression
  },
};
```

### Memory Leaks

**Detection**:

```typescript
// Leak detection
function detectMemoryLeaks() {
  const initialMemory = process.memoryUsage();

  // Perform operations
  setTimeout(async () => {
    await indexer.index(testData);
    await indexer.search({ query: 'test' });

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

    if (memoryIncrease > 50 * 1024 * 1024) {
      // 50MB increase
      console.warn('Potential memory leak detected');
    }
  }, 5000);
}
```

**Prevention**:

```typescript
// Proper cleanup patterns
class ManagedIndexer {
  private intervals: NodeJS.Timeout[] = [];
  private cache = new Map();

  async cleanup() {
    // Clear intervals
    this.intervals.forEach(clearInterval);
    this.intervals = [];

    // Clear cache
    this.cache.clear();

    // Remove event listeners
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
  }

  // Use WeakMap for temporary storage
  private tempStorage = new WeakMap();
}
```

## Configuration Issues

### Invalid Configuration

**Validation**:

```typescript
// Configuration validator
function validateConfig(config: unknown): config is UnifiedIndexerConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const cfg = config as Record<string, unknown>;

  // Check required sections
  if (!cfg.search || typeof cfg.search !== 'object') {
    console.error('Missing or invalid search configuration');
    return false;
  }

  if (!cfg.indexing || typeof cfg.indexing !== 'object') {
    console.error('Missing or invalid indexing configuration');
    return false;
  }

  // Check specific values
  const search = cfg.search as Record<string, unknown>;
  if (typeof search.maxResults !== 'number' || search.maxResults <= 0) {
    console.error('Invalid maxResults value');
    return false;
  }

  return true;
}

// Usage
if (!validateConfig(userConfig)) {
  throw new Error('Invalid configuration');
}
```

### Environment-Specific Issues

**Development vs Production**:

```typescript
// Environment-specific configuration
function createConfig(): UnifiedIndexerConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    search: {
      maxResults: isDevelopment ? 50 : 100,
      enableFuzzy: !isDevelopment, // Disable in dev for speed
      enableSemantic: !isDevelopment,
      timeout: isDevelopment ? 5000 : 30000,
      batchSize: isDevelopment ? 20 : 50,
    },
    indexing: {
      enableAutoIndexing: !isDevelopment,
      batchSize: isDevelopment ? 25 : 100,
      maxConcurrency: isDevelopment ? 2 : 4,
    },
    performance: {
      enableCaching: true,
      cacheSize: isDevelopment ? 500 : 2000,
      enableCompression: !isDevelopment, // Disable in dev for debugging
    },
  };
}
```

## Integration Problems

### Package Compatibility

**Version Conflicts**:

```typescript
// Check package compatibility
async function checkCompatibility() {
  const packageJson = require('./package.json');
  const dependencies = packageJson.dependencies || {};

  // Check for known conflicts
  const conflicts = ['@promethean-os/persistence', '@promethean-os/search'];

  for (const pkg of conflicts) {
    if (dependencies[pkg]) {
      const version = dependencies[pkg];
      console.log(`${pkg}: ${version}`);

      // Add version compatibility checks here
    }
  }
}
```

### API Changes

**Migration Helper**:

```typescript
// Migration utility for API changes
class MigrationHelper {
  static migrateV1ToV2(oldConfig: any): UnifiedIndexerConfig {
    return {
      search: {
        maxResults: oldConfig.maxResults || 100,
        enableFuzzy: oldConfig.fuzzySearch || false,
        enableSemantic: oldConfig.semanticSearch || false,
        timeout: oldConfig.timeout || 10000,
        batchSize: oldConfig.batchSize || 50,
      },
      indexing: {
        enableAutoIndexing: oldConfig.autoIndex !== false,
        batchSize: oldConfig.indexBatchSize || 100,
        maxConcurrency: oldConfig.concurrency || 4,
      },
      domains: oldConfig.domains || {},
    };
  }
}
```

## Debugging Strategies

### Logging

**Structured Logging**:

```typescript
// Enhanced logging
class DebugLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: 'debug',
        context: this.context,
        message,
        data,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  error(message: string, error?: Error) {
    console.error(
      JSON.stringify({
        level: 'error',
        context: this.context,
        message,
        error: error?.stack,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

// Usage
const logger = new DebugLogger('UnifiedIndexer');
logger.debug('Starting search', { query: 'test' });
```

### Health Checks

**Comprehensive Health Check**:

```typescript
async function comprehensiveHealthCheck(indexer: UnifiedIndexer) {
  const health = {
    status: 'healthy',
    checks: {} as Record<string, boolean>,
    metrics: {} as Record<string, number>,
    issues: [] as string[],
  };

  try {
    // Basic functionality
    const searchResult = await indexer.search({ query: 'health', limit: 1 });
    health.checks.search = searchResult.length >= 0;
    health.metrics.searchLatency = 50; // Placeholder

    // Memory check
    const memory = process.memoryUsage();
    health.metrics.memoryUsage = memory.heapUsed;
    health.checks.memory = memory.heapUsed < 500 * 1024 * 1024;

    // Index integrity
    const stats = await indexer.getStats();
    health.metrics.totalItems = stats.totalItems;
    health.checks.indexIntegrity = stats.totalItems >= 0;

    // Configuration validity
    const config = indexer.getConfig();
    health.checks.configuration = config && config.search && config.indexing;
  } catch (error) {
    health.status = 'unhealthy';
    health.issues.push(error.message);
  }

  return health;
}
```

### Performance Profiling

**Built-in Profiler**:

```typescript
class PerformanceProfiler {
  private measurements = new Map<string, number[]>();

  startMeasurement(name: string) {
    return performance.now();
  }

  endMeasurement(name: string, startTime: number) {
    const duration = performance.now() - startTime;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }

    this.measurements.get(name)!.push(duration);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];

    if (measurements.length === 0) {
      return null;
    }

    const sorted = measurements.sort((a, b) => a - b);

    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }
}

// Usage
const profiler = new PerformanceProfiler();

const start = profiler.startMeasurement('search');
await indexer.search({ query: 'test' });
profiler.endMeasurement('search', start);

console.log('Search performance:', profiler.getStats('search'));
```

## Getting Help

### Information to Collect

When reporting issues, collect this information:

```typescript
// Diagnostic information collection
async function collectDiagnostics(indexer: UnifiedIndexer) {
  return {
    version: require('./package.json').version,
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    config: indexer.getConfig(),
    stats: await indexer.getStats(),
    health: await comprehensiveHealthCheck(indexer),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      // Include other relevant env vars (without secrets)
    },
  };
}
```

### Community Resources

- **Documentation**: Check the main documentation files
- **Examples**: Review the `EXAMPLES.md` file
- **Issues**: Check GitHub issues for similar problems
- **Discussions**: Join community discussions

### Bug Report Template

````markdown
## Bug Report

### Description

Brief description of the issue

### Steps to Reproduce

1. Step one
2. Step two
3. Step three

### Expected Behavior

What should happen

### Actual Behavior

What actually happened

### Environment

- Node.js version: [version]
- Package version: [version]
- OS: [operating system]

### Configuration

```json
{
  "search": { ... },
  "indexing": { ... }
}
```
````

### Error Message

```
Error message and stack trace
```

### Additional Context

Any other relevant information

```

This troubleshooting guide should help resolve most common issues with the unified-indexer package. For persistent problems, collect the diagnostic information and seek help from the community.
```
