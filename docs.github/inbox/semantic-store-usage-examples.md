# Semantic Store Usage Examples

This document provides comprehensive usage examples for the Semantic Store architecture, covering common patterns, advanced configurations, and best practices.

## Basic Usage

### Creating a Semantic Store

```typescript
import { SemanticStore } from '@promethean-os/persistence';

// Basic usage - identical to DualStoreManager
const store = await SemanticStore.create('thoughts', 'text', 'createdAt');

console.log(`Created store: ${store.name}`);
console.log(`Supports images: ${store.supportsImages}`);
```

### Inserting Data

```typescript
// Insert a simple entry
await store.insert({
  text: 'This is a thought about semantic search',
  metadata: {
    userName: 'alice',
    isThought: true,
    tags: ['semantic', 'search', 'ai'],
  },
});

// Insert with custom ID and timestamp
await store.insert({
  id: 'custom-entry-123',
  text: 'Custom entry with specific ID',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  metadata: {
    type: 'note',
    priority: 'high',
  },
});

// Backward compatibility method
await store.addEntry({
  text: 'Using the legacy addEntry method',
  metadata: { legacy: true },
});
```

### Retrieving Data

```typescript
// Get most recent entries
const recent = await store.getMostRecent(10);
console.log(
  'Recent entries:',
  recent.map((e) => ({ id: e.id, text: e.text.substring(0, 50) + '...' })),
);

// Get most relevant entries
const relevant = await store.getMostRelevant(['semantic search', 'vector database'], 5);
console.log(
  'Relevant entries:',
  relevant.map((e) => ({ id: e.id, score: e.metadata?.score })),
);

// Get specific entry by ID
const entry = await store.get('custom-entry-123');
if (entry) {
  console.log('Found entry:', entry.text);
} else {
  console.log('Entry not found');
}

// Get with custom filter and sort
const filtered = await store.getMostRecent(
  20,
  { 'metadata.type': 'note' }, // Filter by metadata
  { createdAt: -1, 'metadata.priority': -1 }, // Custom sort
);
```

## Advanced Configuration

### Custom Driver Configuration

```typescript
import { SemanticStoreFactory } from '@promethean-os/persistence';

// PostgreSQL + Pinecone configuration
const customStore = await SemanticStoreFactory.create('advanced-store', 'content', 'created_at', {
  primaryDriver: 'postgresql',
  vectorDriver: 'pinecone',
  consistency: 'strict',
  dualWriteEnabled: true,
  supportsImages: true,

  postgresql: {
    host: 'localhost',
    port: 5432,
    database: 'promethean',
    username: 'user',
    password: 'password',
    ssl: false,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
  },

  pinecone: {
    apiKey: process.env.PINECONE_API_KEY!,
    environment: 'us-west1-gcp',
    indexName: 'promethean-vectors',
    namespace: 'production',
    dimension: 1536,
    metric: 'cosine',
  },

  vectorBatchSize: 50,
  vectorFlushInterval: 2000,
  maxRetries: 5,
});
```

### Environment-Based Configuration

```typescript
// Configuration from environment variables
const envStore = await SemanticStoreFactory.create('env-store', 'text', 'createdAt', {
  primaryDriver: (process.env.PRIMARY_DRIVER as any) || 'mongodb',
  vectorDriver: (process.env.VECTOR_DRIVER as any) || 'chromadb',
  consistency: (process.env.CONSISTENCY_MODE as any) || 'eventual',
  dualWriteEnabled: (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false',
  supportsImages: !process.env.EMBEDDING_FUNCTION?.toLowerCase().includes('text'),

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'database',
    options: {
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE || '1'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_TIMEOUT || '10000'),
    },
  },

  chromadb: {
    url: process.env.CHROMA_URL || 'http://localhost:8000',
    collection: process.env.CHROMA_COLLECTION || 'default',
    embeddingFunction: {
      driver: process.env.EMBEDDING_DRIVER || 'ollama',
      fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
    },
  },
});
```

## Testing with In-Memory Drivers

### Unit Testing Example

```typescript
import test from 'ava';
import { SemanticStoreFactory } from '@promethean-os/persistence';

test('SemanticStore with in-memory drivers', async (t) => {
  // Create store with in-memory drivers for testing
  const store = await SemanticStoreFactory.create('test-store', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  // Insert test data
  await store.insert({
    text: 'Test document about machine learning',
    metadata: { type: 'test', category: 'ml' },
  });

  await store.insert({
    text: 'Another test about neural networks',
    metadata: { type: 'test', category: 'nn' },
  });

  // Test retrieval
  const recent = await store.getMostRecent(10);
  t.is(recent.length, 2);

  // Test search
  const relevant = await store.getMostRelevant(['machine learning'], 5);
  t.true(relevant.length > 0);
  t.true(relevant[0].text.includes('machine learning'));

  // Test individual retrieval
  const first = await store.get(recent[0].id);
  t.not(first, null);
  t.is(first?.text, recent[0].text);

  await store.cleanup();
});
```

### Integration Testing with Real Drivers

```typescript
test('SemanticStore integration test', async (t) => {
  // Use real drivers for integration testing
  const store = await SemanticStore.create('integration-test', 'text', 'createdAt');

  // Test bulk insertion
  const entries = Array.from({ length: 100 }, (_, i) => ({
    text: `Test entry ${i}: ${['machine learning', 'neural networks', 'AI', 'deep learning'][i % 4]}`,
    metadata: {
      batch: i,
      category: ['ml', 'nn', 'ai', 'dl'][i % 4],
      timestamp: Date.now() - i * 1000,
    },
  }));

  // Insert all entries
  for (const entry of entries) {
    await store.insert(entry);
  }

  // Test pagination
  const page1 = await store.getMostRecent(10);
  const page2 = await store.getMostRecent(10, {}, {}, page1[page1.length - 1].timestamp);

  t.is(page1.length, 10);
  t.is(page2.length, 10);

  // Test search with metadata filtering
  const mlResults = await store.getMostRelevant(['machine learning'], 5, { category: 'ml' });

  t.true(mlResults.every((r) => r.metadata?.category === 'ml'));

  // Test consistency
  const report = await store.getConsistencyReport(50);
  t.true(report.totalDocuments > 0);
  t.true(report.consistentDocuments >= 0);

  await store.cleanup();
});
```

## Error Handling

### Robust Error Handling

```typescript
import {
  SemanticStoreError,
  DriverInitializationError,
  ConsistencyError,
  VectorOperationError,
} from '@promethean-os/persistence';

async function robustStoreUsage() {
  try {
    const store = await SemanticStore.create('robust-test', 'text', 'createdAt');

    try {
      await store.insert({
        text: 'Test data',
        metadata: { important: true },
      });
    } catch (insertError) {
      if (insertError instanceof VectorOperationError) {
        console.warn('Vector write failed, but document was saved:', insertError.message);
        // Handle partial failure
      } else {
        throw insertError; // Re-throw other errors
      }
    }

    try {
      const results = await store.getMostRelevant(['search query'], 10);
      console.log('Search results:', results.length);
    } catch (searchError) {
      console.error('Search failed:', searchError);
      // Fallback to recent documents
      const fallback = await store.getMostRecent(10);
      console.log('Fallback results:', fallback.length);
    }
  } catch (initError) {
    if (initError instanceof DriverInitializationError) {
      console.error('Failed to initialize drivers:', initError.details);
      // Try with fallback configuration
      const fallbackStore = await SemanticStoreFactory.create('fallback', 'text', 'createdAt', {
        primaryDriver: 'memory',
        vectorDriver: 'memory',
      });
      return fallbackStore;
    }
    throw initError;
  }
}
```

### Consistency Monitoring

```typescript
async function monitorConsistency(store: SemanticStore) {
  // Check overall consistency
  const report = await store.getConsistencyReport(100);

  console.log('Consistency Report:');
  console.log(`Total documents: ${report.totalDocuments}`);
  console.log(`Consistent: ${report.consistentDocuments}`);
  console.log(`Inconsistent: ${report.inconsistentDocuments}`);
  console.log(`Missing vectors: ${report.missingVectors}`);

  // Retry failed vector writes
  for (const failure of report.vectorWriteFailures) {
    console.log(`Retrying vector write for ${failure.id}...`);
    const success = await store.retryVectorWrite(failure.id);

    if (success) {
      console.log(`✅ Successfully retried ${failure.id}`);
    } else {
      console.log(`❌ Retry failed for ${failure.id}`);
    }
  }

  // Check specific document consistency
  const testId = 'specific-document-id';
  const consistency = await store.checkConsistency(testId);

  if (!consistency.hasDocument) {
    console.warn(`Document ${testId} not found in primary store`);
  }

  if (!consistency.hasVector) {
    console.warn(`Vector for ${testId} not found in vector store`);
  }

  if (!consistency.vectorWriteSuccess) {
    console.error(`Vector write failed for ${testId}: ${consistency.vectorWriteError}`);
  }
}
```

## Performance Optimization

### Batch Operations

```typescript
async function batchInsertion(
  store: SemanticStore,
  documents: Array<{ text: string; metadata?: any }>,
) {
  const batchSize = 50;
  const batches = [];

  // Create batches
  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize));
  }

  console.log(`Processing ${documents.length} documents in ${batches.length} batches`);

  // Process batches with concurrency control
  const maxConcurrency = 3;
  for (let i = 0; i < batches.length; i += maxConcurrency) {
    const concurrentBatches = batches.slice(i, i + maxConcurrency);

    await Promise.all(
      concurrentBatches.map(async (batch, batchIndex) => {
        console.log(
          `Processing batch ${i + batchIndex + 1}/${batches.length} (${batch.length} documents)`,
        );

        await Promise.all(
          batch.map((doc) =>
            store.insert({
              text: doc.text,
              metadata: {
                ...doc.metadata,
                batchIndex: i + batchIndex,
                processedAt: Date.now(),
              },
            }),
          ),
        );
      }),
    );
  }

  console.log('All batches processed');
}
```

### Optimized Search

```typescript
async function optimizedSearch(store: SemanticStore) {
  // Use specific metadata filters to reduce search space
  const recentResults = await store.getMostRelevant(['machine learning'], 10, {
    // Only search recent documents
    'metadata.timestamp': { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    // Only search specific categories
    'metadata.category': { $in: ['ml', 'ai', 'research'] },
    // Exclude low-quality content
    'metadata.quality': { $gte: 0.7 },
  });

  // Fallback to broader search if no results
  if (recentResults.length === 0) {
    const broaderResults = await store.getMostRelevant(['machine learning'], 10, {
      'metadata.category': { $in: ['ml', 'ai', 'research'] },
    });
    return broaderResults;
  }

  return recentResults;
}
```

## Event-Driven Architecture

### Event Listeners

```typescript
import type {
  EventListener,
  EntryInsertedEvent,
  ConsistencyCheckedEvent,
} from '@promethean-os/persistence';

async function setupEventMonitoring(store: SemanticStore) {
  // Listen for entry insertion events
  const onEntryInserted: EventListener<EntryInsertedEvent> = async (event) => {
    console.log(`📝 Entry inserted: ${event.entryId}`);

    if (!event.vectorWriteSuccess) {
      console.warn(`⚠️ Vector write failed for ${event.entryId}: ${event.vectorWriteError}`);

      // Auto-retry failed vector writes
      setTimeout(async () => {
        const success = await store.retryVectorWrite(event.entryId);
        if (success) {
          console.log(`✅ Auto-retry successful for ${event.entryId}`);
        }
      }, 5000);
    }
  };

  // Listen for consistency check events
  const onConsistencyChecked: EventListener<ConsistencyCheckedEvent> = async (event) => {
    if (!event.result.hasDocument || !event.result.hasVector) {
      console.warn(`🔍 Consistency issue for ${event.id}:`, event.result);
    }
  };

  // Register listeners
  store.on('entry_inserted', onEntryInserted);
  store.on('consistency_checked', onConsistencyChecked);

  // Cleanup function
  return () => {
    store.off('entry_inserted', onEntryInserted);
    store.off('consistency_checked', onConsistencyChecked);
  };
}
```

## Migration Patterns

### Gradual Migration from DualStoreManager

```typescript
// Phase 1: Backward compatibility - just change imports
import { SemanticStore as DualStoreManager } from '@promethean-os/persistence';

// Existing code continues to work unchanged
const store = await DualStoreManager.create('thoughts', 'text', 'createdAt');

// Phase 2: Use factory for new features
import { SemanticStoreFactory } from '@promethean-os/persistence';

const newStore = await SemanticStoreFactory.create('new-feature', 'text', 'createdAt', {
  primaryDriver: 'postgresql',
  vectorDriver: 'pinecone',
  consistency: 'strict',
});

// Phase 3: Migrate existing stores gradually
async function migrateStore(oldName: string, newName: string) {
  const oldStore = await SemanticStore.create(oldName, 'text', 'createdAt');
  const newStore = await SemanticStoreFactory.create(newName, 'text', 'createdAt', {
    primaryDriver: 'postgresql',
    vectorDriver: 'pinecone',
  });

  // Migrate data in batches
  const batchSize = 100;
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const batch = await oldStore.getMostRecent(batchSize, {}, {}, offset);

    if (batch.length === 0) {
      hasMore = false;
    } else {
      await Promise.all(batch.map((entry) => newStore.insert(entry)));
      offset += batchSize;
      console.log(`Migrated ${offset} documents...`);
    }
  }

  await oldStore.cleanup();
  await newStore.cleanup();

  console.log(`Migration complete: ${oldName} -> ${newName}`);
}
```

## Multi-Tenant Patterns

### Tenant Isolation

```typescript
class TenantSemanticStore {
  private stores = new Map<string, SemanticStore>();

  async getTenantStore(tenantId: string): Promise<SemanticStore> {
    if (!this.stores.has(tenantId)) {
      const store = await SemanticStoreFactory.create(`tenant_${tenantId}`, 'text', 'createdAt', {
        primaryDriver: 'postgresql',
        vectorDriver: 'pinecone',
        // Use tenant-specific collection/namespace
        chromadb: {
          collection: `tenant_${tenantId}`,
          // ... other config
        },
        pinecone: {
          namespace: tenantId,
          // ... other config
        },
      });

      this.stores.set(tenantId, store);
    }

    return this.stores.get(tenantId)!;
  }

  async cleanup(): Promise<void> {
    await Promise.all(Array.from(this.stores.values()).map((store) => store.cleanup()));
    this.stores.clear();
  }
}

// Usage
const tenantStore = new TenantSemanticStore();

const aliceStore = await tenantStore.getTenantStore('alice');
const bobStore = await tenantStore.getTenantStore('bob');

// Each tenant has isolated storage
await aliceStore.insert({ text: "Alice's private data" });
await bobStore.insert({ text: "Bob's private data" });
```

## Caching Patterns

### Multi-Level Caching

```typescript
import { LRUCache } from 'lru-cache';

class CachedSemanticStore {
  private documentCache = new LRUCache<string, any>({
    max: 1000,
    ttl: 1000 * 60 * 5, // 5 minutes
  });

  private searchCache = new LRUCache<string, any[]>({
    max: 100,
    ttl: 1000 * 60 * 10, // 10 minutes
  });

  constructor(private store: SemanticStore) {}

  async get(id: string): Promise<any> {
    // Check cache first
    const cached = this.documentCache.get(id);
    if (cached) {
      return cached;
    }

    // Fetch from store
    const document = await this.store.get(id);

    // Cache the result
    if (document) {
      this.documentCache.set(id, document);
    }

    return document;
  }

  async getMostRelevant(queryTexts: string[], limit: number): Promise<any[]> {
    // Create cache key
    const cacheKey = `${queryTexts.join('|')}:${limit}`;

    // Check cache
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from store
    const results = await this.store.getMostRelevant(queryTexts, limit);

    // Cache results
    this.searchCache.set(cacheKey, results);

    return results;
  }

  async insert(entry: any): Promise<void> {
    await this.store.insert(entry);

    // Invalidate relevant caches
    if (entry.id) {
      this.documentCache.delete(entry.id);
    }

    // Clear search cache since new data might affect results
    this.searchCache.clear();
  }
}
```

## Monitoring and Observability

### Metrics Collection

```typescript
class SemanticStoreMetrics {
  private metrics = {
    insertCount: 0,
    insertErrors: 0,
    searchCount: 0,
    searchErrors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageInsertTime: 0,
    averageSearchTime: 0,
  };

  private insertTimes: number[] = [];
  private searchTimes: number[] = [];

  wrapStore(store: SemanticStore): SemanticStore {
    return new Proxy(store, {
      get: (target, prop) => {
        const original = (target as any)[prop];

        if (typeof original === 'function') {
          return (...args: any[]) => {
            const startTime = Date.now();

            if (prop === 'insert') {
              this.metrics.insertCount++;
            } else if (prop === 'getMostRelevant') {
              this.metrics.searchCount++;
            }

            try {
              const result = original.apply(target, args);

              if (result instanceof Promise) {
                return result
                  .then((value) => {
                    this.recordSuccess(prop, Date.now() - startTime);
                    return value;
                  })
                  .catch((error) => {
                    this.recordError(prop);
                    throw error;
                  });
              } else {
                this.recordSuccess(prop, Date.now() - startTime);
                return result;
              }
            } catch (error) {
              this.recordError(prop);
              throw error;
            }
          };
        }

        return original;
      },
    });
  }

  private recordSuccess(operation: string, duration: number): void {
    if (operation === 'insert') {
      this.insertTimes.push(duration);
      if (this.insertTimes.length > 100) {
        this.insertTimes.shift();
      }
      this.metrics.averageInsertTime =
        this.insertTimes.reduce((a, b) => a + b, 0) / this.insertTimes.length;
    } else if (operation === 'getMostRelevant') {
      this.searchTimes.push(duration);
      if (this.searchTimes.length > 100) {
        this.searchTimes.shift();
      }
      this.metrics.averageSearchTime =
        this.searchTimes.reduce((a, b) => a + b, 0) / this.searchTimes.length;
    }
  }

  private recordError(operation: string): void {
    if (operation === 'insert') {
      this.metrics.insertErrors++;
    } else if (operation === 'getMostRelevant') {
      this.metrics.searchErrors++;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      insertCount: 0,
      insertErrors: 0,
      searchCount: 0,
      searchErrors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageInsertTime: 0,
      averageSearchTime: 0,
    };
    this.insertTimes = [];
    this.searchTimes = [];
  }
}

// Usage
const metrics = new SemanticStoreMetrics();
const store = metrics.wrapStore(await SemanticStore.create('monitored', 'text', 'createdAt'));

// Later...
console.log('Store metrics:', metrics.getMetrics());
```

These examples demonstrate the flexibility and power of the Semantic Store architecture, from basic usage to advanced patterns like multi-tenancy, caching, and monitoring. The driver-based approach allows you to adapt the storage system to your specific needs while maintaining a consistent API.
