# Semantic Store Migration Guide

This guide provides a comprehensive roadmap for migrating from the existing `DualStoreManager` to the new flexible `SemanticStore` architecture.

## Migration Overview

The Semantic Store is designed as a **drop-in replacement** for `DualStoreManager` while providing enhanced flexibility through a driver-based architecture. The migration can be performed gradually with minimal disruption to existing code.

### Migration Benefits

1. **Backward Compatibility**: Existing code continues to work without changes
2. **Enhanced Flexibility**: Choose optimal storage backends for different use cases
3. **Better Testability**: In-memory drivers for unit testing
4. **Future-Proof**: Easy to add new storage providers
5. **Improved Performance**: Optimized driver implementations
6. **Better Observability**: Enhanced monitoring and debugging capabilities

## Migration Phases

### Phase 1: Drop-in Replacement (Zero Code Changes)

The simplest migration path is to use the backward compatibility alias:

```typescript
// Before
import { DualStoreManager } from '@promethean-os/persistence';
const store = await DualStoreManager.create('thoughts', 'text', 'createdAt');

// After - just change the import
import { DualStoreManager } from '@promethean-os/persistence'; // This now points to SemanticStore
const store = await DualStoreManager.create('thoughts', 'text', 'createdAt');

// Or use the explicit new name
import { SemanticStore } from '@promethean-os/persistence';
const store = await SemanticStore.create('thoughts', 'text', 'createdAt');
```

**Benefits:**

- No code changes required
- Immediate access to bug fixes and improvements
- Same API, same behavior

**Considerations:**

- Still uses MongoDB + ChromaDB under the hood
- No access to new driver features yet

### Phase 2: Configuration-Based Migration

Use environment variables to switch drivers without code changes:

```typescript
// No code changes needed - just set environment variables

// Environment variables for driver selection
PRIMARY_DRIVER=mongodb          // or postgresql, memory
VECTOR_DRIVER=chromadb          // or pinecone, qdrant, memory
CONSISTENCY_MODE=strict        // or eventual
DUAL_WRITE_ENABLED=true
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text

// Database-specific configuration
MONGODB_URI=mongodb://localhost:27017
CHROMA_URL=http://localhost:8000

// For PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=promethean
POSTGRES_USERNAME=user
POSTGRES_PASSWORD=password

// For Pinecone
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=promethean-vectors
```

**Benefits:**

- No code changes required
- Easy to switch between storage backends
- Can test different configurations in different environments

### Phase 3: Explicit Configuration

Gradually migrate to explicit configuration for new features:

```typescript
import { SemanticStoreFactory } from '@promethean-os/persistence';

// New stores use explicit configuration
const newStore = await SemanticStoreFactory.create('new-feature', 'text', 'createdAt', {
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
  },

  pinecone: {
    apiKey: process.env.PINECONE_API_KEY!,
    environment: 'us-west1-gcp',
    indexName: 'promethean-vectors',
  },
});

// Existing stores continue to work unchanged
const existingStore = await SemanticStore.create('legacy-thoughts', 'text', 'createdAt');
```

### Phase 4: Full Migration

Migrate all stores to use the new architecture:

```typescript
// All stores use SemanticStoreFactory
const thoughtsStore = await SemanticStoreFactory.create('thoughts', 'text', 'createdAt', {
  primaryDriver: 'postgresql',
  vectorDriver: 'pinecone',
  consistency: 'strict',
});

const documentsStore = await SemanticStoreFactory.create('documents', 'content', 'created_at', {
  primaryDriver: 'mongodb',
  vectorDriver: 'chromadb',
  consistency: 'eventual',
});

const testStore = await SemanticStoreFactory.create('test', 'text', 'createdAt', {
  primaryDriver: 'memory',
  vectorDriver: 'memory',
});
```

## Step-by-Step Migration Process

### Step 1: Assessment and Planning

1. **Inventory Existing Usage**

   ```bash
   # Find all DualStoreManager usage
   grep -r "DualStoreManager" src/ --include="*.ts" --include="*.js"

   # Find all create() calls
   grep -r "DualStoreManager.create" src/ --include="*.ts" --include="*.js"
   ```

2. **Identify Migration Candidates**

   - High-traffic stores that could benefit from performance improvements
   - Test suites that could use in-memory drivers
   - Stores that need different consistency levels

3. **Plan Migration Order**
   - Start with low-risk stores (test environments, internal tools)
   - Move to medium-risk stores (non-critical features)
   - Finally migrate critical production stores

### Step 2: Environment Preparation

1. **Install Dependencies**

   ```bash
   # For PostgreSQL support
   pnpm add pg @types/pg

   # For Pinecone support
   pnpm add @pinecone-database/pinecone

   # For Qdrant support
   pnpm add @qdrant/js-client-rest
   ```

2. **Set Up Infrastructure**

   - Configure PostgreSQL instances if needed
   - Set up Pinecone indexes
   - Configure Qdrant clusters
   - Update connection strings and credentials

3. **Update Configuration Files**
   ```typescript
   // config/stores.ts
   export const storeConfigs = {
     development: {
       primaryDriver: 'memory' as const,
       vectorDriver: 'memory' as const,
     },
     staging: {
       primaryDriver: 'postgresql' as const,
       vectorDriver: 'chromadb' as const,
       postgresql: {
         host: process.env.STAGING_DB_HOST,
         // ... other config
       },
     },
     production: {
       primaryDriver: 'postgresql' as const,
       vectorDriver: 'pinecone' as const,
       // ... production config
     },
   };
   ```

### Step 3: Testing Migration

1. **Create Migration Tests**

   ```typescript
   // tests/migration.test.ts
   import test from 'ava';
   import { SemanticStore, SemanticStoreFactory } from '@promethean-os/persistence';

   test('backward compatibility', async (t) => {
     // Test that old API still works
     const oldStore = await SemanticStore.create('test', 'text', 'createdAt');
     await oldStore.insert({ text: 'test' });
     const results = await oldStore.getMostRecent(10);
     t.is(results.length, 1);
     await oldStore.cleanup();
   });

   test('new API compatibility', async (t) => {
     // Test that new API produces same results
     const newStore = await SemanticStoreFactory.create('test', 'text', 'createdAt', {
       primaryDriver: 'memory',
       vectorDriver: 'memory',
     });

     await newStore.insert({ text: 'test' });
     const results = await newStore.getMostRecent(10);
     t.is(results.length, 1);
     await newStore.cleanup();
   });

   test('API parity', async (t) => {
     // Test that both APIs return identical results
     const oldStore = await SemanticStore.create('test-old', 'text', 'createdAt');
     const newStore = await SemanticStoreFactory.create('test-new', 'text', 'createdAt', {
       primaryDriver: 'memory',
       vectorDriver: 'memory',
     });

     const testData = { text: 'comparison test', metadata: { test: true } };

     await oldStore.insert(testData);
     await newStore.insert(testData);

     const oldResults = await oldStore.getMostRecent(10);
     const newResults = await newStore.getMostRecent(10);

     t.deepEqual(oldResults, newResults);

     await oldStore.cleanup();
     await newStore.cleanup();
   });
   ```

2. **Performance Testing**

   ```typescript
   // tests/performance.test.ts
   import { performance } from 'perf_hooks';

   async function benchmarkStore(store: any, operations: number) {
     const start = performance.now();

     for (let i = 0; i < operations; i++) {
       await store.insert({
         text: `Test document ${i}`,
         metadata: { index: i },
       });
     }

     const insertTime = performance.now() - start;

     const searchStart = performance.now();
     await store.getMostRelevant(['test'], 10);
     const searchTime = performance.now() - searchStart;

     return { insertTime, searchTime };
   }

   test('performance comparison', async (t) => {
     const oldStore = await SemanticStore.create('perf-old', 'text', 'createdAt');
     const newStore = await SemanticStoreFactory.create('perf-new', 'text', 'createdAt', {
       primaryDriver: 'memory',
       vectorDriver: 'memory',
     });

     const operations = 100;

     const oldPerf = await benchmarkStore(oldStore, operations);
     const newPerf = await benchmarkStore(newStore, operations);

     console.log('Old store:', oldPerf);
     console.log('New store:', newPerf);

     // New store should be competitive or better
     t.true(newPerf.insertTime <= oldPerf.insertTime * 1.2); // Allow 20% tolerance

     await oldStore.cleanup();
     await newStore.cleanup();
   });
   ```

### Step 4: Data Migration

For stores that need to change storage backends:

1. **Create Migration Scripts**

   ```typescript
   // scripts/migrate-store.ts
   import { SemanticStore, SemanticStoreFactory } from '@promethean-os/persistence';

   async function migrateStore(sourceName: string, targetName: string, targetConfig: any) {
     console.log(`Starting migration: ${sourceName} -> ${targetName}`);

     const sourceStore = await SemanticStore.create(sourceName, 'text', 'createdAt');
     const targetStore = await SemanticStoreFactory.create(
       targetName,
       'text',
       'createdAt',
       targetConfig,
     );

     const batchSize = 100;
     let totalMigrated = 0;
     let hasMore = true;

     while (hasMore) {
       const batch = await sourceStore.getMostRecent(batchSize);

       if (batch.length === 0) {
         hasMore = false;
       } else {
         console.log(`Migrating batch of ${batch.length} documents...`);

         await Promise.all(
           batch.map(async (doc) => {
             try {
               await targetStore.insert(doc);
             } catch (error) {
               console.error(`Failed to migrate document ${doc.id}:`, error);
               // Continue with other documents
             }
           }),
         );

         totalMigrated += batch.length;
         console.log(`Total migrated: ${totalMigrated}`);
       }
     }

     // Verify migration
     const sourceCount = (await sourceStore.getMostRecent(1000000)).length;
     const targetCount = (await targetStore.getMostRecent(1000000)).length;

     console.log(`Migration complete. Source: ${sourceCount}, Target: ${targetCount}`);

     if (sourceCount !== targetCount) {
       console.warn('Warning: Document count mismatch!');
     }

     await sourceStore.cleanup();
     await targetStore.cleanup();
   }

   // Usage
   migrateStore('old-thoughts', 'new-thoughts', {
     primaryDriver: 'postgresql',
     vectorDriver: 'pinecone',
     // ... config
   });
   ```

2. **Validation Scripts**

   ```typescript
   // scripts/validate-migration.ts
   async function validateMigration(sourceName: string, targetName: string) {
     const sourceStore = await SemanticStore.create(sourceName, 'text', 'createdAt');
     const targetStore = await SemanticStoreFactory.create(targetName, 'text', 'createdAt', {
       primaryDriver: 'memory', // Use memory for validation
       vectorDriver: 'memory',
     });

     // Sample documents for comparison
     const sampleSize = 100;
     const sourceDocs = await sourceStore.getMostRecent(sampleSize);

     let mismatches = 0;

     for (const sourceDoc of sourceDocs) {
       const targetDoc = await targetStore.get(sourceDoc.id);

       if (!targetDoc) {
         console.error(`Missing document: ${sourceDoc.id}`);
         mismatches++;
       } else if (targetDoc.text !== sourceDoc.text) {
         console.error(`Text mismatch for ${sourceDoc.id}`);
         mismatches++;
       } else if (JSON.stringify(targetDoc.metadata) !== JSON.stringify(sourceDoc.metadata)) {
         console.error(`Metadata mismatch for ${sourceDoc.id}`);
         mismatches++;
       }
     }

     console.log(`Validation complete. Mismatches: ${mismatches}/${sampleSize}`);

     await sourceStore.cleanup();
     await targetStore.cleanup();

     return mismatches === 0;
   }
   ```

### Step 5: Production Rollout

1. **Blue-Green Deployment**

   ```typescript
   // Feature flag for gradual rollout
   const USE_NEW_STORE = process.env.USE_NEW_STORE === 'true';

   export function createStore(name: string, textKey: string, timeKey: string) {
     if (USE_NEW_STORE) {
       return SemanticStoreFactory.create(name, textKey, timeKey, {
         primaryDriver: 'postgresql',
         vectorDriver: 'pinecone',
       });
     } else {
       return SemanticStore.create(name, textKey, timeKey);
     }
   }
   ```

2. **Monitoring and Rollback**
   ```typescript
   // Monitor migration health
   async function monitorMigrationHealth(store: SemanticStore) {
     const report = await store.getConsistencyReport(100);

     if (report.inconsistentDocuments > report.totalDocuments * 0.05) {
       // 5% threshold
       console.error('High inconsistency detected, considering rollback');
       // Trigger rollback procedure
     }

     // Log metrics
     console.log('Consistency report:', report);
   }
   ```

## Common Migration Patterns

### Pattern 1: Test Environment First

```typescript
// config/stores.ts
const isTestEnvironment = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';

export function createOptimizedStore(name: string, textKey: string, timeKey: string) {
  if (isTestEnvironment) {
    // Use in-memory drivers for tests
    return SemanticStoreFactory.create(name, textKey, timeKey, {
      primaryDriver: 'memory',
      vectorDriver: 'memory',
    });
  } else if (isDevelopment) {
    // Use PostgreSQL for development
    return SemanticStoreFactory.create(name, textKey, timeKey, {
      primaryDriver: 'postgresql',
      vectorDriver: 'chromadb',
    });
  } else {
    // Production configuration
    return SemanticStoreFactory.create(name, textKey, timeKey, {
      primaryDriver: 'postgresql',
      vectorDriver: 'pinecone',
      consistency: 'strict',
    });
  }
}
```

### Pattern 2: Gradual Driver Migration

```typescript
// Migrate primary database first, keep vector store
async function migratePrimaryDatabase(name: string) {
  const oldStore = await SemanticStore.create(name, 'text', 'createdAt');

  // Create new store with PostgreSQL but keep ChromaDB
  const newStore = await SemanticStoreFactory.create(`${name}-v2`, 'text', 'createdAt', {
    primaryDriver: 'postgresql',
    vectorDriver: 'chromadb', // Keep existing vector store
    chromadb: {
      collection: name, // Use same collection
    },
  });

  // Migrate data...
  await migrateData(oldStore, newStore);

  return newStore;
}
```

### Pattern 3: A/B Testing

```typescript
// Test new configuration on a subset of traffic
class StoreRouter {
  private newStore: SemanticStore;
  private oldStore: SemanticStore;

  constructor() {
    this.oldStore = await SemanticStore.create('thoughts', 'text', 'createdAt');
    this.newStore = await SemanticStoreFactory.create('thoughts-v2', 'text', 'createdAt', {
      primaryDriver: 'postgresql',
      vectorDriver: 'pinecone',
    });
  }

  async insert(entry: any) {
    // Route 10% of traffic to new store
    if (Math.random() < 0.1) {
      await this.newStore.insert(entry);
    } else {
      await this.oldStore.insert(entry);
    }
  }

  async search(query: string[]) {
    // Compare results from both stores
    const [oldResults, newResults] = await Promise.all([
      this.oldStore.getMostRelevant(query, 10),
      this.newStore.getMostRelevant(query, 10),
    ]);

    // Log comparison metrics
    console.log(`Old: ${oldResults.length} results, New: ${newResults.length} results`);

    // Return old results for now
    return oldResults;
  }
}
```

## Troubleshooting Common Issues

### Issue 1: Connection Failures

**Problem:** New drivers can't connect to database

**Solution:**

```typescript
// Test connections before migration
async function testConnections(config: any) {
  try {
    const testStore = await SemanticStoreFactory.create('test', 'text', 'createdAt', config);
    await testStore.insert({ text: 'connection test' });
    await testStore.cleanup();
    console.log('✅ Connection test passed');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    throw error;
  }
}
```

### Issue 2: Performance Degradation

**Problem:** New drivers are slower than expected

**Solution:**

```typescript
// Optimize configuration
const optimizedConfig = {
  primaryDriver: 'postgresql',
  vectorDriver: 'pinecone',

  postgresql: {
    pool: {
      min: 5,
      max: 20,
      idleTimeoutMillis: 30000,
    },
    // Connection pooling settings
  },

  pinecone: {
    // Batch size for vector operations
    batchSize: 100,
  },

  // Enable batching
  vectorBatchSize: 50,
  vectorFlushInterval: 1000,
};
```

### Issue 3: Data Inconsistency

**Problem:** Migrated data doesn't match original

**Solution:**

```typescript
// Detailed comparison
async function compareStores(oldStore: SemanticStore, newStore: SemanticStore) {
  const oldDocs = await oldStore.getMostRecent(1000);
  let differences = [];

  for (const oldDoc of oldDocs) {
    const newDoc = await newStore.get(oldDoc.id);

    if (!newDoc) {
      differences.push({ type: 'missing', id: oldDoc.id });
    } else {
      // Deep comparison
      const textDiff = oldDoc.text !== newDoc.text;
      const metadataDiff = JSON.stringify(oldDoc.metadata) !== JSON.stringify(newDoc.metadata);

      if (textDiff || metadataDiff) {
        differences.push({
          type: 'content_mismatch',
          id: oldDoc.id,
          textDiff,
          metadataDiff,
        });
      }
    }
  }

  return differences;
}
```

## Rollback Strategy

### Emergency Rollback

```typescript
// Quick rollback to previous configuration
class RollbackManager {
  private previousConfig: any;

  async createRollbackStore(name: string) {
    // Store current config for rollback
    this.previousConfig = await this.getCurrentConfig(name);

    // Create store with fallback configuration
    return SemanticStore.create(name, 'text', 'createdAt');
  }

  async rollback(name: string) {
    console.log(`Rolling back store: ${name}`);

    // Switch back to old configuration
    return SemanticStore.create(name, 'text', 'createdAt');
  }
}
```

### Data Rollback

```typescript
// If data migration fails, restore from backup
async function restoreFromBackup(backupName: string, targetName: string) {
  const backupStore = await SemanticStore.create(backupName, 'text', 'createdAt');
  const targetStore = await SemanticStoreFactory.create(targetName, 'text', 'createdAt', {
    primaryDriver: 'memory', // Start with memory to clear data
    vectorDriver: 'memory',
  });

  // Clear target store
  await targetStore.cleanup();

  // Recreate with proper config
  const finalTargetStore = await SemanticStoreFactory.create(targetName, 'text', 'createdAt', {
    primaryDriver: 'postgresql',
    vectorDriver: 'pinecone',
  });

  // Restore data
  await migrateData(backupStore, finalTargetStore);

  await backupStore.cleanup();
  await finalTargetStore.cleanup();
}
```

## Post-Migration Optimization

### Performance Tuning

```typescript
// Monitor and optimize after migration
async function optimizeStore(store: SemanticStore) {
  // Monitor consistency
  const report = await store.getConsistencyReport(1000);

  if (report.inconsistentDocuments > 0) {
    console.log('Retrying failed vector writes...');
    for (const failure of report.vectorWriteFailures) {
      await store.retryVectorWrite(failure.id);
    }
  }

  // Get queue stats for optimization
  const queueStats = store.getChromaQueueStats();

  if (queueStats.queueLength > 100) {
    console.log('High queue length detected, consider increasing batch size');
  }
}
```

### Monitoring Setup

```typescript
// Set up ongoing monitoring
class MigrationMonitor {
  private metrics = {
    consistency: 0,
    performance: 0,
    errors: 0,
  };

  async monitor(store: SemanticStore) {
    setInterval(async () => {
      try {
        const report = await store.getConsistencyReport(100);
        this.metrics.consistency = report.consistentDocuments / report.totalDocuments;

        if (this.metrics.consistency < 0.95) {
          console.warn('Consistency below 95%:', this.metrics.consistency);
        }
      } catch (error) {
        this.metrics.errors++;
        console.error('Monitoring error:', error);
      }
    }, 60000); // Check every minute
  }
}
```

This migration guide provides a comprehensive approach to transitioning from DualStoreManager to Semantic Store while minimizing risk and ensuring data integrity. The phased approach allows for gradual adoption with proper testing and validation at each step.
