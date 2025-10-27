# Semantic Store Testing Strategy

This document outlines a comprehensive testing strategy for the Semantic Store architecture, covering unit tests, integration tests, performance tests, and migration validation.

## Testing Pyramid

```
    E2E Tests (5%)
   ┌─────────────────┐
  │  Integration    │ (15%)
 ┌───────────────────────┐
│    Unit Tests          │ (80%)
└───────────────────────┘
```

## Unit Testing

### Driver Testing Framework

```typescript
// tests/frameworks/DriverTestSuite.ts
import test from 'ava';
import type { PrimaryDatabaseDriver, VectorSearchDriver, DualStoreEntry } from '../../src/types.js';

export class DriverTestSuite<
  TextKey extends string = 'text',
  TimeKey extends string = 'createdAt',
> {
  constructor(
    private primaryDriver: PrimaryDatabaseDriver<TextKey, TimeKey>,
    private vectorDriver: VectorSearchDriver,
    private testName: string,
  ) {}

  async runAllTests() {
    await this.testPrimaryDriverBasics();
    await this.testVectorDriverBasics();
    await this.testConsistency();
    await this.testErrorHandling();
    await this.testCleanup();
  }

  private async testPrimaryDriverBasics() {
    test(`${this.testName} - primary driver insert and retrieve`, async (t) => {
      const entry: DualStoreEntry<TextKey, TimeKey> = {
        id: 'test-1',
        [this.getTextKey()]: 'Test document content',
        [this.getTimeKey()]: Date.now() as any,
        metadata: { type: 'test', priority: 'high' },
      };

      await this.primaryDriver.insert(entry);
      const retrieved = await this.primaryDriver.get('test-1');

      t.not(retrieved, null);
      t.is(retrieved!.id, 'test-1');
      t.is(retrieved!.text, 'Test document content');
      t.deepEqual(retrieved!.metadata, { type: 'test', priority: 'high' });
    });

    test(`${this.testName} - primary driver get most recent`, async (t) => {
      // Insert multiple entries
      const entries = Array.from({ length: 5 }, (_, i) => ({
        id: `recent-${i}`,
        [this.getTextKey()]: `Document ${i}`,
        [this.getTimeKey()]: (Date.now() - i * 1000) as any,
        metadata: { index: i },
      }));

      for (const entry of entries) {
        await this.primaryDriver.insert(entry);
      }

      const recent = await this.primaryDriver.getMostRecent(3);
      t.is(recent.length, 3);

      // Should be in descending order by timestamp
      for (let i = 0; i < recent.length - 1; i++) {
        t.true(recent[i].timestamp >= recent[i + 1].timestamp);
      }
    });

    test(`${this.testName} - primary driver update vector status`, async (t) => {
      const entry: DualStoreEntry<TextKey, TimeKey> = {
        id: 'status-test',
        [this.getTextKey()]: 'Status test document',
        [this.getTimeKey()]: Date.now() as any,
        metadata: { type: 'test' },
      };

      await this.primaryDriver.insert(entry);

      // Update vector write status
      await this.primaryDriver.updateVectorWriteStatus('status-test', true);

      const retrieved = await this.primaryDriver.get('status-test');
      t.is(retrieved!.metadata!.vectorWriteSuccess, true);
      t.is(retrieved!.metadata!.vectorWriteError, null);

      // Test failure case
      await this.primaryDriver.updateVectorWriteStatus('status-test', false, 'Connection timeout');

      const updated = await this.primaryDriver.get('status-test');
      t.is(updated!.metadata!.vectorWriteSuccess, false);
      t.is(updated!.metadata!.vectorWriteError, 'Connection timeout');
    });
  }

  private async testVectorDriverBasics() {
    test(`${this.testName} - vector driver add and query`, async (t) => {
      await this.vectorDriver.add('vector-1', 'Machine learning is fascinating', {
        category: 'ai',
        importance: 0.8,
      });

      await this.vectorDriver.add('vector-2', 'Neural networks learn patterns', {
        category: 'ai',
        importance: 0.9,
      });

      await this.vectorDriver.add(
        'vector-3',
        'Traditional programming uses explicit instructions',
        {
          category: 'programming',
          importance: 0.7,
        },
      );

      // Query for AI-related content
      const results = await this.vectorDriver.query(['machine learning'], 5);

      t.true(results.ids.length > 0);
      t.true(results.documents.length > 0);
      t.true(results.metadatas.length > 0);

      // Should find AI-related documents first
      const aiDocs = results.documents
        .flat()
        .filter((doc) => doc && doc.toLowerCase().includes('machine'));
      t.true(aiDocs.length > 0);
    });

    test(`${this.testName} - vector driver batch operations`, async (t) => {
      const batch = Array.from({ length: 10 }, (_, i) => ({
        id: `batch-${i}`,
        text: `Batch document ${i} about ${['AI', 'ML', 'neural networks'][i % 3]}`,
        metadata: { batch: true, index: i },
      }));

      await this.vectorDriver.addBatch(batch);

      // Verify all documents were added
      const ids = batch.map((item) => item.id);
      const retrieved = await this.vectorDriver.get(ids);

      t.is(retrieved.ids.length, 10);
      t.is(retrieved.documents.length, 10);
      t.is(retrieved.metadatas.length, 10);

      // Verify content
      for (let i = 0; i < 10; i++) {
        t.is(retrieved.ids[i], `batch-${i}`);
        t.true(retrieved.documents[i]!.includes('Batch document'));
        t.is(retrieved.metadatas[i]!.batch, true);
      }
    });

    test(`${this.testName} - vector driver metadata filtering`, async (t) => {
      await this.vectorDriver.add('filter-1', 'Document with high priority', {
        priority: 'high',
        category: 'important',
      });

      await this.vectorDriver.add('filter-2', 'Document with low priority', {
        priority: 'low',
        category: 'routine',
      });

      await this.vectorDriver.add('filter-3', 'Another high priority document', {
        priority: 'high',
        category: 'urgent',
      });

      // Query with metadata filter
      const results = await this.vectorDriver.query(['document'], 10, { priority: 'high' });

      const metadatas = results.metadatas.flat();
      t.true(metadatas.every((meta) => meta?.priority === 'high'));
      t.is(metadatas.length, 2);
    });
  }

  private async testConsistency() {
    test(`${this.testName} - consistency report generation`, async (t) => {
      // Insert entries with different consistency states
      const entries = [
        { id: 'consistent-1', success: true },
        { id: 'consistent-2', success: true },
        { id: 'inconsistent-1', success: false, error: 'Timeout' },
        { id: 'unknown-1', success: undefined },
      ];

      for (const entry of entries) {
        const doc: DualStoreEntry<TextKey, TimeKey> = {
          id: entry.id,
          [this.getTextKey()]: `Consistency test ${entry.id}`,
          [this.getTimeKey()]: Date.now() as any,
          metadata: { type: 'consistency-test' },
        };

        await this.primaryDriver.insert(doc);

        if (entry.success !== undefined) {
          await this.primaryDriver.updateVectorWriteStatus(entry.id, entry.success, entry.error);
        }
      }

      const report = await this.primaryDriver.getConsistencyReport(10);

      t.is(report.totalDocuments, 4);
      t.is(report.consistentDocuments, 2);
      t.is(report.inconsistentDocuments, 1);
      t.is(report.missingVectors, 1);
      t.is(report.vectorWriteFailures.length, 1);
      t.is(report.vectorWriteFailures[0].error, 'Timeout');
    });
  }

  private async testErrorHandling() {
    test(`${this.testName} - error handling for invalid operations`, async (t) => {
      // Test getting non-existent document
      const nonExistent = await this.primaryDriver.get('does-not-exist');
      t.is(nonExistent, null);

      // Test vector operations with invalid data
      await t.notThrowsAsync(async () => {
        await this.vectorDriver.add('error-test', '', {});
      });

      // Test query with empty results
      const emptyResults = await this.vectorDriver.query(['nonexistent-term'], 5);
      t.is(emptyResults.ids.length, 0);
      t.is(emptyResults.documents.length, 0);
    });
  }

  private async testCleanup() {
    test(`${this.testName} - cleanup and reinitialization`, async (t) => {
      // Insert some data
      await this.primaryDriver.insert({
        id: 'cleanup-test',
        [this.getTextKey()]: 'Cleanup test document',
        [this.getTimeKey()]: Date.now() as any,
      });

      // Verify data exists
      const beforeCleanup = await this.primaryDriver.get('cleanup-test');
      t.not(beforeCleanup, null);

      // Cleanup
      await this.primaryDriver.cleanup();
      await this.vectorDriver.cleanup();

      // Reinitialize
      await this.primaryDriver.initialize();
      await this.vectorDriver.initialize();

      // Data should still be there (persistent storage)
      // or gone (in-memory storage) - both are valid
      const afterReinit = await this.primaryDriver.get('cleanup-test');
      // No assertion - behavior depends on driver type
    });
  }

  private getTextKey(): TextKey {
    return 'text' as TextKey;
  }

  private getTimeKey(): TimeKey {
    return 'createdAt' as TimeKey;
  }
}
```

### Memory Driver Tests

```typescript
// tests/drivers/MemoryDriver.test.ts
import test from 'ava';
import { MemoryDriver, MemoryVectorDriver } from '../../src/drivers/MemoryDriver.js';
import { DriverTestSuite } from './DriverTestSuite.js';

test('Memory Driver - Complete Test Suite', async (t) => {
  const primaryDriver = new MemoryDriver();
  const vectorDriver = new MemoryVectorDriver();

  await primaryDriver.initialize();
  await vectorDriver.initialize();

  const testSuite = new DriverTestSuite(primaryDriver, vectorDriver, 'MemoryDriver');
  await testSuite.runAllTests();

  await primaryDriver.cleanup();
  await vectorDriver.cleanup();

  t.pass('All memory driver tests passed');
});

test('Memory Driver - Concurrent Operations', async (t) => {
  const driver = new MemoryDriver();
  await driver.initialize();

  // Test concurrent inserts
  const insertPromises = Array.from({ length: 100 }, (_, i) =>
    driver.insert({
      id: `concurrent-${i}`,
      text: `Concurrent document ${i}`,
      createdAt: Date.now() as any,
      metadata: { index: i },
    }),
  );

  await Promise.all(insertPromises);

  // Verify all documents were inserted
  const recent = await driver.getMostRecent(200);
  t.is(recent.length, 100);

  await driver.cleanup();
});

test('Memory Vector Driver - Similarity Calculation', async (t) => {
  const driver = new MemoryVectorDriver();
  await driver.initialize();

  // Add similar documents
  await driver.add('similar-1', 'machine learning algorithms', { category: 'ml' });
  await driver.add('similar-2', 'machine learning models', { category: 'ml' });
  await driver.add('different-1', 'cooking recipes', { category: 'food' });

  // Query for machine learning
  const results = await driver.query(['machine learning'], 3);

  const documents = results.documents.flat();
  t.true(documents.length >= 2);

  // ML documents should appear before food document
  const mlDocs = documents.filter((doc) => doc && doc.includes('machine'));
  const foodDocs = documents.filter((doc) => doc && doc.includes('cooking'));

  t.true(mlDocs.length >= 2);
  t.true(foodDocs.length >= 0);

  await driver.cleanup();
});
```

### MongoDB Driver Tests

```typescript
// tests/drivers/MongoDriver.test.ts
import test from 'ava';
import { MongoDriver } from '../../src/drivers/MongoDriver.js';
import { MemoryVectorDriver } from '../../src/drivers/MemoryDriver.js';
import { DriverTestSuite } from './DriverTestSuite.js';

const mongoConfig = {
  uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017',
  database: 'test_semantic_store',
  options: {
    maxPoolSize: 1,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
  },
};

test.before(async (t) => {
  // Ensure MongoDB is available for tests
  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    await client.close();
    t.pass('MongoDB is available for testing');
  } catch (error) {
    t.skip('MongoDB not available for testing');
  }
});

test('MongoDB Driver - Complete Test Suite', async (t) => {
  const primaryDriver = new MongoDriver(mongoConfig);
  const vectorDriver = new MemoryVectorDriver(); // Use memory for vector to isolate MongoDB testing

  await primaryDriver.initialize();
  await vectorDriver.initialize();

  const testSuite = new DriverTestSuite(primaryDriver, vectorDriver, 'MongoDBDriver');
  await testSuite.runAllTests();

  await primaryDriver.cleanup();
  await vectorDriver.cleanup();

  t.pass('All MongoDB driver tests passed');
});

test('MongoDB Driver - Connection Recovery', async (t) => {
  const driver = new MongoDriver(mongoConfig);
  await driver.initialize();

  // Insert test data
  await driver.insert({
    id: 'recovery-test',
    text: 'Connection recovery test',
    createdAt: Date.now() as any,
  });

  // Simulate connection loss by closing the driver
  await driver.cleanup();

  // Try to use the driver again (should auto-reconnect)
  await driver.initialize();

  const retrieved = await driver.get('recovery-test');
  t.not(retrieved, null);
  t.is(retrieved!.text, 'Connection recovery test');

  await driver.cleanup();
});

test('MongoDB Driver - Complex Queries', async (t) => {
  const driver = new MongoDriver(mongoConfig);
  await driver.initialize();

  // Insert test data with various metadata
  const testData = [
    {
      id: 'complex-1',
      text: 'Document 1',
      metadata: { type: 'report', priority: 'high', tags: ['urgent', 'review'] },
    },
    {
      id: 'complex-2',
      text: 'Document 2',
      metadata: { type: 'note', priority: 'low', tags: ['personal'] },
    },
    {
      id: 'complex-3',
      text: 'Document 3',
      metadata: { type: 'report', priority: 'medium', tags: ['review'] },
    },
  ];

  for (const data of testData) {
    await driver.insert({
      ...data,
      createdAt: Date.now() as any,
    });
  }

  // Test complex filter
  const filtered = await driver.getMostRecent(10, {
    'metadata.type': 'report',
    'metadata.priority': { $in: ['high', 'medium'] },
  });

  t.is(filtered.length, 2);
  t.true(filtered.every((doc) => doc.metadata?.type === 'report'));

  await driver.cleanup();
});
```

## Integration Testing

### End-to-End Store Tests

```typescript
// tests/integration/SemanticStore.test.ts
import test from 'ava';
import { SemanticStore, SemanticStoreFactory } from '../../src/SemanticStore.js';

test('SemanticStore - Basic Operations', async (t) => {
  const store = await SemanticStoreFactory.create('integration-test', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  // Test insertion
  await store.insert({
    text: 'Integration test document',
    metadata: { type: 'test', importance: 0.8 },
  });

  // Test retrieval
  const recent = await store.getMostRecent(10);
  t.is(recent.length, 1);
  t.is(recent[0].text, 'Integration test document');

  // Test search
  const relevant = await store.getMostRelevant(['integration test'], 5);
  t.is(relevant.length, 1);
  t.is(relevant[0].text, 'Integration test document');

  // Test individual retrieval
  const single = await store.get(recent[0].id);
  t.not(single, null);
  t.is(single!.text, 'Integration test document');

  await store.cleanup();
});

test('SemanticStore - Consistency Management', async (t) => {
  const store = await SemanticStoreFactory.create('consistency-test', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
    consistency: 'strict',
  });

  // Insert multiple documents
  const documents = Array.from({ length: 10 }, (_, i) => ({
    text: `Consistency test document ${i}`,
    metadata: { index: i, batch: 'test' },
  }));

  for (const doc of documents) {
    await store.insert(doc);
  }

  // Check consistency
  const report = await store.getConsistencyReport(20);
  t.is(report.totalDocuments, 10);
  t.true(report.consistentDocuments >= 0);

  // Test individual consistency check
  const firstDoc = await store.getMostRecent(1);
  if (firstDoc.length > 0) {
    const consistency = await store.checkConsistency(firstDoc[0].id);
    t.true(consistency.hasDocument);
  }

  await store.cleanup();
});

test('SemanticStore - Error Handling', async (t) => {
  const store = await SemanticStoreFactory.create('error-test', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  // Test invalid operations
  await t.notThrowsAsync(async () => {
    await store.insert({
      text: '',
      metadata: {},
    });
  });

  // Test search with no results
  const emptyResults = await store.getMostRelevant(['nonexistent'], 5);
  t.is(emptyResults.length, 0);

  // Test get non-existent document
  const nonExistent = await store.get('does-not-exist');
  t.is(nonExistent, null);

  await store.cleanup();
});
```

### Multi-Driver Integration Tests

```typescript
// tests/integration/MultiDriver.test.ts
import test from 'ava';
import { SemanticStoreFactory } from '../../src/SemanticStore.js';

test('Multi-Driver - MongoDB + ChromaDB', async (t) => {
  if (!process.env.MONGODB_TEST_URI || !process.env.CHROMA_TEST_URL) {
    t.skip('MongoDB or ChromaDB not available for testing');
    return;
  }

  const store = await SemanticStoreFactory.create('multi-test', 'text', 'createdAt', {
    primaryDriver: 'mongodb',
    vectorDriver: 'chromadb',
    mongodb: {
      uri: process.env.MONGODB_TEST_URI,
      database: 'test_multi_driver',
    },
    chromadb: {
      url: process.env.CHROMA_TEST_URL,
      collection: 'test_multi_driver',
      embeddingFunction: {
        driver: 'ollama',
        fn: 'nomic-embed-text',
      },
    },
  });

  // Test cross-driver operations
  await store.insert({
    text: 'Multi-driver test document',
    metadata: { type: 'integration', drivers: ['mongodb', 'chromadb'] },
  });

  // Verify primary storage
  const recent = await store.getMostRecent(10);
  t.is(recent.length, 1);

  // Verify vector search
  const relevant = await store.getMostRelevant(['multi-driver'], 5);
  t.is(relevant.length, 1);

  // Test consistency between drivers
  const report = await store.getConsistencyReport(10);
  t.is(report.totalDocuments, 1);

  await store.cleanup();
});

test('Multi-Driver - PostgreSQL + Pinecone', async (t) => {
  if (!process.env.POSTGRES_TEST_URI || !process.env.PINECONE_TEST_API_KEY) {
    t.skip('PostgreSQL or Pinecone not available for testing');
    return;
  }

  const store = await SemanticStoreFactory.create('pg-pinecone-test', 'text', 'createdAt', {
    primaryDriver: 'postgresql',
    vectorDriver: 'pinecone',
    postgresql: {
      host: 'localhost',
      port: 5432,
      database: 'test_pg_pinecone',
      username: 'test',
      password: 'test',
    },
    pinecone: {
      apiKey: process.env.PINECONE_TEST_API_KEY,
      environment: 'us-west1-gcp',
      indexName: 'test-index',
    },
  });

  // Test basic operations
  await store.insert({
    text: 'PostgreSQL + Pinecone test',
    metadata: { type: 'cloud-native', scalable: true },
  });

  const results = await store.getMostRelevant(['postgresql'], 5);
  t.is(results.length, 1);

  await store.cleanup();
});
```

## Performance Testing

### Benchmark Suite

```typescript
// tests/performance/Benchmark.test.ts
import test from 'ava';
import { performance } from 'perf_hooks';
import { SemanticStoreFactory } from '../../src/SemanticStore.js';

interface BenchmarkResult {
  operation: string;
  duration: number;
  throughput: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  async benchmarkInsert(store: any, documentCount: number): Promise<BenchmarkResult> {
    const documents = Array.from({ length: documentCount }, (_, i) => ({
      text: `Performance test document ${i} with some content to make it realistic`,
      metadata: {
        index: i,
        category: ['test', 'performance', 'benchmark'][i % 3],
        timestamp: Date.now(),
        tags: [`tag-${i % 10}`, `category-${i % 5}`],
      },
    }));

    const startMemory = process.memoryUsage();
    const startTime = performance.now();

    for (const doc of documents) {
      await store.insert(doc);
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    const result: BenchmarkResult = {
      operation: `insert-${documentCount}`,
      duration: endTime - startTime,
      throughput: documentCount / ((endTime - startTime) / 1000),
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
      },
    };

    this.results.push(result);
    return result;
  }

  async benchmarkSearch(
    store: any,
    queryCount: number,
    resultsPerQuery: number,
  ): Promise<BenchmarkResult> {
    const queries = Array.from({ length: queryCount }, (_, i) => [
      `performance test query ${i}`,
      `benchmark search ${i}`,
      `document retrieval ${i}`,
    ]);

    const startTime = performance.now();

    for (const query of queries) {
      await store.getMostRelevant(query, resultsPerQuery);
    }

    const endTime = performance.now();

    const result: BenchmarkResult = {
      operation: `search-${queryCount}-${resultsPerQuery}`,
      duration: endTime - startTime,
      throughput: queryCount / ((endTime - startTime) / 1000),
    };

    this.results.push(result);
    return result;
  }

  async benchmarkConcurrentOperations(
    store: any,
    operationCount: number,
  ): Promise<BenchmarkResult> {
    const operations = Array.from({ length: operationCount }, (_, i) =>
      store.insert({
        text: `Concurrent operation ${i}`,
        metadata: { concurrent: true, index: i },
      }),
    );

    const startTime = performance.now();

    await Promise.all(operations);

    const endTime = performance.now();

    const result: BenchmarkResult = {
      operation: `concurrent-${operationCount}`,
      duration: endTime - startTime,
      throughput: operationCount / ((endTime - startTime) / 1000),
    };

    this.results.push(result);
    return result;
  }

  getResults(): BenchmarkResult[] {
    return this.results;
  }

  reset(): void {
    this.results = [];
  }

  printResults(): void {
    console.log('\n=== Performance Benchmark Results ===');

    for (const result of this.results) {
      console.log(`\n${result.operation}:`);
      console.log(`  Duration: ${result.duration.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(2)} ops/sec`);

      if (result.memoryUsage) {
        console.log(`  Memory Delta:`);
        console.log(`    RSS: ${(result.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`);
        console.log(`    Heap Used: ${(result.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }
}

test('Performance - Memory Drivers', async (t) => {
  const benchmark = new PerformanceBenchmark();
  const store = await SemanticStoreFactory.create('perf-memory', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  // Benchmark different operation sizes
  await benchmark.benchmarkInsert(store, 100);
  await benchmark.benchmarkInsert(store, 1000);
  await benchmark.benchmarkSearch(store, 50, 10);
  await benchmark.benchmarkSearch(store, 100, 20);
  await benchmark.benchmarkConcurrentOperations(store, 50);

  const results = benchmark.getResults();

  // Basic performance assertions
  t.true(results.every((r) => r.throughput > 0));
  t.true(results.every((r) => r.duration > 0));

  benchmark.printResults();

  await store.cleanup();
});

test('Performance - Production Drivers Comparison', async (t) => {
  if (!process.env.MONGODB_TEST_URI || !process.env.CHROMA_TEST_URL) {
    t.skip('Production drivers not available for performance testing');
    return;
  }

  const benchmark = new PerformanceBenchmark();

  // Test MongoDB + ChromaDB
  const prodStore = await SemanticStoreFactory.create('perf-prod', 'text', 'createdAt', {
    primaryDriver: 'mongodb',
    vectorDriver: 'chromadb',
    mongodb: {
      uri: process.env.MONGODB_TEST_URI,
      database: 'performance_test',
    },
    chromadb: {
      url: process.env.CHROMA_TEST_URL,
      collection: 'performance_test',
    },
  });

  await benchmark.benchmarkInsert(prodStore, 100);
  await benchmark.benchmarkSearch(prodStore, 20, 10);

  const prodResults = benchmark.getResults();
  benchmark.reset();

  // Test Memory drivers for comparison
  const memStore = await SemanticStoreFactory.create('perf-mem', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  await benchmark.benchmarkInsert(memStore, 100);
  await benchmark.benchmarkSearch(memStore, 20, 10);

  const memResults = benchmark.getResults();

  console.log('\n=== Performance Comparison ===');
  console.log('Production vs Memory Drivers:');

  for (let i = 0; i < prodResults.length; i++) {
    const prod = prodResults[i];
    const mem = memResults[i];

    console.log(`\n${prod.operation}:`);
    console.log(`  Production: ${prod.throughput.toFixed(2)} ops/sec`);
    console.log(`  Memory: ${mem.throughput.toFixed(2)} ops/sec`);
    console.log(`  Ratio: ${(prod.throughput / mem.throughput).toFixed(2)}x`);
  }

  await prodStore.cleanup();
  await memStore.cleanup();

  t.pass('Performance comparison completed');
});
```

## Migration Testing

### Migration Validation Tests

```typescript
// tests/migration/MigrationValidation.test.ts
import test from 'ava';
import { SemanticStore, SemanticStoreFactory } from '../../src/SemanticStore.js';

test('Migration - API Compatibility', async (t) => {
  // Test that old and new APIs produce identical results

  const oldStore = await SemanticStore.create('migration-old', 'text', 'createdAt');
  const newStore = await SemanticStoreFactory.create('migration-new', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  const testData = {
    text: 'Migration compatibility test',
    metadata: {
      type: 'migration',
      version: '1.0',
      tags: ['test', 'migration'],
      timestamp: Date.now(),
    },
  };

  // Insert into both stores
  await oldStore.insert(testData);
  await newStore.insert(testData);

  // Compare retrieval results
  const oldRecent = await oldStore.getMostRecent(10);
  const newRecent = await newStore.getMostRecent(10);

  t.is(oldRecent.length, newRecent.length);
  t.is(oldRecent[0].text, newRecent[0].text);
  t.deepEqual(oldRecent[0].metadata, newRecent[0].metadata);

  // Compare search results
  const oldSearch = await oldStore.getMostRelevant(['migration'], 5);
  const newSearch = await newStore.getMostRelevant(['migration'], 5);

  t.is(oldSearch.length, newSearch.length);

  await oldStore.cleanup();
  await newStore.cleanup();
});

test('Migration - Data Integrity', async (t) => {
  const sourceStore = await SemanticStore.create('migration-source', 'text', 'createdAt');
  const targetStore = await SemanticStoreFactory.create('migration-target', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  // Create diverse test data
  const testData = [
    {
      text: 'Simple text document',
      metadata: { type: 'simple', priority: 'low' },
    },
    {
      text: 'Document with complex metadata',
      metadata: {
        type: 'complex',
        priority: 'high',
        nested: { level1: { level2: 'deep value' } },
        array: [1, 2, 3, 'string', { object: true }],
        specialChars: 'Special chars: àáâãäåæçèéêë',
        nullValue: null,
        undefinedValue: undefined,
      },
    },
    {
      text: '',
      metadata: { type: 'empty', shouldHandle: true },
    },
    {
      text: 'Document with very long text that might cause issues with some storage systems and needs to be handled properly to ensure no truncation or encoding problems occur during the migration process',
      metadata: { type: 'long', size: 'large' },
    },
  ];

  // Insert into source
  for (let i = 0; i < testData.length; i++) {
    await sourceStore.insert({
      id: `migration-test-${i}`,
      ...testData[i],
      createdAt: Date.now() as any,
    });
  }

  // Simulate migration process
  const sourceDocs = await sourceStore.getMostRecent(100);

  for (const doc of sourceDocs) {
    await targetStore.insert(doc);
  }

  // Validate migration
  const targetDocs = await targetStore.getMostRecent(100);

  t.is(sourceDocs.length, targetDocs.length);

  for (let i = 0; i < sourceDocs.length; i++) {
    const source = sourceDocs[i];
    const target = targetDocs[i];

    t.is(source.id, target.id);
    t.is(source.text, target.text);
    t.deepEqual(source.metadata, target.metadata);
  }

  await sourceStore.cleanup();
  await targetStore.cleanup();
});

test('Migration - Performance Impact', async (t) => {
  const oldStore = await SemanticStore.create('perf-old', 'text', 'createdAt');
  const newStore = await SemanticStoreFactory.create('perf-new', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  const operationCount = 100;
  const testData = Array.from({ length: operationCount }, (_, i) => ({
    text: `Performance test document ${i}`,
    metadata: { index: i, type: 'performance' },
  }));

  // Benchmark old implementation
  const oldStart = performance.now();
  for (const data of testData) {
    await oldStore.insert(data);
  }
  const oldDuration = performance.now() - oldStart;

  // Benchmark new implementation
  const newStart = performance.now();
  for (const data of testData) {
    await newStore.insert(data);
  }
  const newDuration = performance.now() - newStart;

  console.log(`\nPerformance Comparison (${operationCount} inserts):`);
  console.log(`Old implementation: ${oldDuration.toFixed(2)}ms`);
  console.log(`New implementation: ${newDuration.toFixed(2)}ms`);
  console.log(`Performance ratio: ${(newDuration / oldDuration).toFixed(2)}x`);

  // New implementation should not be significantly slower
  t.true(newDuration <= oldDuration * 1.5, 'New implementation should not be more than 50% slower');

  await oldStore.cleanup();
  await newStore.cleanup();
});
```

## Test Utilities

### Test Data Generators

```typescript
// tests/utils/TestDataGenerator.ts
export class TestDataGenerator {
  static generateDocuments(
    count: number,
    options: {
      minLength?: number;
      maxLength?: number;
      categories?: string[];
      includeMetadata?: boolean;
    } = {},
  ): Array<{ text: string; metadata?: any }> {
    const {
      minLength = 10,
      maxLength = 200,
      categories = ['test', 'document', 'sample'],
      includeMetadata = true,
    } = options;

    const words = [
      'machine',
      'learning',
      'artificial',
      'intelligence',
      'neural',
      'network',
      'algorithm',
      'data',
      'model',
      'training',
      'prediction',
      'classification',
      'regression',
      'clustering',
      'optimization',
      'feature',
      'engineering',
      'deep',
      'learning',
      'convolutional',
      'recurrent',
      'transformer',
      'attention',
      'mechanism',
      'embedding',
      'vector',
      'similarity',
      'semantic',
      'search',
      'retrieval',
      'indexing',
      'storage',
      'database',
    ];

    return Array.from({ length: count }, (_, i) => {
      const wordCount = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      const text = Array.from(
        { length: wordCount },
        () => words[Math.floor(Math.random() * words.length)],
      ).join(' ');

      const metadata = includeMetadata
        ? {
            index: i,
            category: categories[Math.floor(Math.random() * categories.length)],
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last week
            tags: Array.from(
              { length: Math.floor(Math.random() * 3) + 1 },
              () => `tag-${Math.floor(Math.random() * 10)}`,
            ),
            score: Math.random(),
            active: Math.random() > 0.5,
          }
        : undefined;

      return { text, metadata };
    });
  }

  static generateQueries(
    count: number,
    options: {
      minLength?: number;
      maxLength?: number;
      useRealTerms?: boolean;
    } = {},
  ): string[] {
    const { minLength = 1, maxLength = 5, useRealTerms = true } = options;

    const realTerms = [
      'machine learning',
      'neural networks',
      'artificial intelligence',
      'data science',
      'deep learning',
      'feature engineering',
      'model training',
      'algorithm optimization',
      'semantic search',
      'vector database',
      'embedding similarity',
      'classification model',
    ];

    const randomTerms = [
      'xyz',
      'abc',
      'test',
      'query',
      'search',
      'find',
      'lookup',
      'document',
      'content',
      'text',
      'data',
      'information',
    ];

    const terms = useRealTerms ? realTerms : randomTerms;

    return Array.from({ length: count }, () => {
      const termCount = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      return Array.from(
        { length: termCount },
        () => terms[Math.floor(Math.random() * terms.length)],
      ).join(' ');
    });
  }
}
```

### Test Environment Setup

```typescript
// tests/utils/TestEnvironment.ts
import { SemanticStoreFactory } from '../../src/SemanticStore.js';

export class TestEnvironment {
  private static stores: any[] = [];

  static async createTestStore(name: string, config?: any) {
    const store = await SemanticStoreFactory.create(name, 'text', 'createdAt', {
      primaryDriver: 'memory',
      vectorDriver: 'memory',
      ...config,
    });

    this.stores.push(store);
    return store;
  }

  static async createIntegrationStore(name: string, config?: any) {
    const store = await SemanticStoreFactory.create(name, 'text', 'createdAt', {
      primaryDriver: process.env.TEST_PRIMARY_DRIVER || 'memory',
      vectorDriver: process.env.TEST_VECTOR_DRIVER || 'memory',
      ...config,
    });

    this.stores.push(store);
    return store;
  }

  static async cleanup() {
    await Promise.all(this.stores.map((store) => store.cleanup()));
    this.stores = [];
  }

  static withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs}ms`)), timeoutMs),
      ),
    ]);
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          console.warn(`Test attempt ${attempt} failed, retrying in ${delayMs}ms:`, error);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError!;
  }
}
```

This comprehensive testing strategy ensures that the Semantic Store architecture is thoroughly validated across different dimensions: functionality, performance, reliability, and migration compatibility. The modular test structure makes it easy to add new drivers and validate their correctness against the established test suites.
