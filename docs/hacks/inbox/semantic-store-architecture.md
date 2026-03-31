# Semantic Store Architecture

## Overview

The Semantic Store is a flexible, driver-based architecture that provides a unified interface for both primary database storage and vector search capabilities. It serves as a drop-in replacement for the existing `DualStoreManager` while offering enhanced flexibility through a modular driver system.

## Architecture Goals

1. **Flexibility**: Support multiple database and vector search providers
2. **Backward Compatibility**: Maintain identical API to existing `DualStoreManager`
3. **Testability**: Enable easy testing with in-memory drivers
4. **Extensibility**: Simplify addition of new storage backends
5. **Configuration-Driven**: Support environment-based driver selection
6. **Separation of Concerns**: Isolate storage logic from business logic

## Core Components

### 1. Driver Interfaces

#### PrimaryDatabaseDriver

Handles primary data storage (documents, metadata, timestamps).

```typescript
interface PrimaryDatabaseDriver<
  TextKey extends string = 'text',
  TimeKey extends string = 'createdAt',
> {
  // Core operations
  insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;
  get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null>;
  getMostRecent(
    limit?: number,
    filter?: any,
    sorter?: any,
  ): Promise<DualStoreEntry<'text', 'timestamp'>[]>;

  // Consistency operations
  updateVectorWriteStatus(id: string, success: boolean, error?: string): Promise<void>;
  getConsistencyReport(limit?: number): Promise<ConsistencyReport>;

  // Lifecycle
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}
```

#### VectorSearchDriver

Handles vector similarity search and storage.

```typescript
interface VectorSearchDriver {
  // Core operations
  add(id: string, text: string, metadata?: Record<string, any>): Promise<void>;
  query(
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
  ): Promise<VectorQueryResult>;
  get(ids: string[]): Promise<VectorGetResult>;

  // Batch operations
  addBatch(
    entries: Array<{ id: string; text: string; metadata?: Record<string, any> }>,
  ): Promise<void>;

  // Lifecycle
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}
```

### 2. Configuration System

#### SemanticStoreConfig

Centralized configuration for driver selection and behavior.

```typescript
interface SemanticStoreConfig {
  // Driver selection
  primaryDriver: 'mongodb' | 'postgresql' | 'memory';
  vectorDriver: 'chromadb' | 'pinecone' | 'qdrant' | 'memory';

  // Driver-specific configuration
  mongodb?: MongoDriverConfig;
  postgresql?: PostgresDriverConfig;
  chromadb?: ChromaDriverConfig;
  pinecone?: PineconeDriverConfig;
  qdrant?: QdrantDriverConfig;

  // Behavior configuration
  consistency: 'strict' | 'eventual';
  dualWriteEnabled: boolean;
  supportsImages: boolean;

  // Performance tuning
  vectorBatchSize: number;
  vectorFlushInterval: number;
  maxRetries: number;
}
```

### 3. Main SemanticStore Class

The primary implementation that composes drivers and provides the same interface as `DualStoreManager`.

```typescript
export class SemanticStore<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
  // Core properties (same as DualStoreManager)
  name: string;
  textKey: TextKey;
  timeStampKey: TimeKey;
  supportsImages: boolean;

  // Driver instances
  private primaryDriver: PrimaryDatabaseDriver<TextKey, TimeKey>;
  private vectorDriver: VectorSearchDriver;

  // Constructor and factory methods
  constructor(config: SemanticStoreConfig, name: string, textKey: TextKey, timeStampKey: TimeKey);
  static async create<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    name: string,
    textKey: TextKey,
    timeStampKey: TimeKey,
  ): Promise<SemanticStore<TextKey, TimeKey>>;

  // Public API (identical to DualStoreManager)
  async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;
  async addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>; // Backward compatibility
  async getMostRecent(
    limit?: number,
    mongoFilter?: any,
    sorter?: any,
  ): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
  async getMostRelevant(
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
  ): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
  async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null>;

  // Consistency and monitoring
  async checkConsistency(id: string): Promise<ConsistencyResult>;
  async retryVectorWrite(id: string, maxRetries?: number): Promise<boolean>;
  async getConsistencyReport(limit?: number): Promise<ConsistencyReport>;

  // Lifecycle
  async cleanup(): Promise<void>;
}
```

## Driver Implementations

### MongoDB Driver

Extracts and encapsulates MongoDB-specific logic from the existing `DualStoreManager`.

```typescript
export class MongoDriver<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>
  implements PrimaryDatabaseDriver<TextKey, TimeKey>
{
  constructor(private config: MongoDriverConfig) {}

  async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
    // MongoDB insertion logic with connection validation
    // Handles metadata flattening and timestamp management
  }

  async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
    // MongoDB document retrieval with connection validation
  }

  async getMostRecent(
    limit: number,
    filter: any,
    sorter: any,
  ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
    // MongoDB query with sorting and limiting
  }

  // ... other methods
}
```

### ChromaDB Driver

Encapsulates ChromaDB-specific vector operations.

```typescript
export class ChromaDriver implements VectorSearchDriver {
  private collection: ChromaCollection;
  private writeQueue: ChromaWriteQueue;

  constructor(private config: ChromaDriverConfig) {}

  async add(id: string, text: string, metadata?: Record<string, any>): Promise<void> {
    // Uses write queue for batching
    // Handles metadata flattening for ChromaDB compatibility
  }

  async query(
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
  ): Promise<VectorQueryResult> {
    // ChromaDB similarity search
    // Handles duplicate filtering and result formatting
  }

  // ... other methods
}
```

### In-Memory Drivers

For testing and development without external dependencies.

```typescript
export class MemoryDriver<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>
  implements PrimaryDatabaseDriver<TextKey, TimeKey>
{
  private storage = new Map<string, DualStoreEntry<TextKey, TimeKey>>();

  async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
    const id = entry.id ?? randomUUID();
    this.storage.set(id, { ...entry, id });
  }

  // Simple in-memory implementation of all methods
}

export class MemoryVectorDriver implements VectorSearchDriver {
  private vectors = new Map<
    string,
    { text: string; embedding: number[]; metadata?: Record<string, any> }
  >();

  async add(id: string, text: string, metadata?: Record<string, any>): Promise<void> {
    // Simple embedding calculation (for testing only)
    const embedding = await this.calculateEmbedding(text);
    this.vectors.set(id, { text, embedding, metadata });
  }

  // Simple similarity search implementation
}
```

## Factory Pattern

### SemanticStoreFactory

Creates configured SemanticStore instances based on environment or explicit configuration.

```typescript
export class SemanticStoreFactory {
  static async create<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    name: string,
    textKey: TextKey,
    timeStampKey: TimeKey,
    config?: Partial<SemanticStoreConfig>,
  ): Promise<SemanticStore<TextKey, TimeKey>> {
    // Merge default config with provided config
    const finalConfig = this.mergeConfig(config);

    // Create drivers based on configuration
    const primaryDriver = await this.createPrimaryDriver(finalConfig);
    const vectorDriver = await this.createVectorDriver(finalConfig);

    // Initialize drivers
    await Promise.all([primaryDriver.initialize(), vectorDriver.initialize()]);

    return new SemanticStore(finalConfig, name, textKey, timeStampKey, primaryDriver, vectorDriver);
  }

  private static async createPrimaryDriver(
    config: SemanticStoreConfig,
  ): Promise<PrimaryDatabaseDriver> {
    switch (config.primaryDriver) {
      case 'mongodb':
        return new MongoDriver(config.mongodb);
      case 'postgresql':
        return new PostgresDriver(config.postgresql);
      case 'memory':
        return new MemoryDriver();
      default:
        throw new Error(`Unsupported primary driver: ${config.primaryDriver}`);
    }
  }

  private static async createVectorDriver(
    config: SemanticStoreConfig,
  ): Promise<VectorSearchDriver> {
    switch (config.vectorDriver) {
      case 'chromadb':
        return new ChromaDriver(config.chromadb);
      case 'pinecone':
        return new PineconeDriver(config.pinecone);
      case 'qdrant':
        return new QdrantDriver(config.qdrant);
      case 'memory':
        return new MemoryVectorDriver();
      default:
        throw new Error(`Unsupported vector driver: ${config.vectorDriver}`);
    }
  }
}
```

## Configuration Examples

### Environment-Based Configuration

```typescript
// Default configuration from environment variables
const config: SemanticStoreConfig = {
  primaryDriver: process.env.PRIMARY_DRIVER || 'mongodb',
  vectorDriver: process.env.VECTOR_DRIVER || 'chromadb',
  consistency: (process.env.DUAL_WRITE_CONSISTENCY as any) || 'eventual',
  dualWriteEnabled: (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false',
  supportsImages: !process.env.EMBEDDING_FUNCTION?.toLowerCase().includes('text'),

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'database',
    options: {
      maxPoolSize: 1,
      minPoolSize: 1,
      // ... other MongoDB options
    },
  },

  chromadb: {
    url: process.env.CHROMA_URL || 'http://localhost:8000',
    embeddingFunction: {
      driver: process.env.EMBEDDING_DRIVER || 'ollama',
      fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
    },
  },
};
```

### Explicit Configuration

```typescript
const customConfig: SemanticStoreConfig = {
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
    apiKey: process.env.PINECONE_API_KEY,
    environment: 'us-west1-gcp',
    indexName: 'promethean-vectors',
  },
};
```

## Usage Examples

### Basic Usage (Backward Compatible)

```typescript
// Exactly the same as DualStoreManager
const store = await SemanticStore.create('thoughts', 'text', 'createdAt');

await store.insert({
  text: 'This is a thought',
  metadata: { userName: 'alice', isThought: true },
});

const recent = await store.getMostRecent(10);
const relevant = await store.getMostRelevant(['search query'], 5);
const single = await store.get('document-id');
```

### Custom Configuration

```typescript
const store = await SemanticStoreFactory.create('custom-store', 'content', 'created_at', {
  primaryDriver: 'postgresql',
  vectorDriver: 'pinecone',
  consistency: 'strict',
});
```

### Testing with In-Memory Drivers

```typescript
const testStore = await SemanticStoreFactory.create('test-store', 'text', 'createdAt', {
  primaryDriver: 'memory',
  vectorDriver: 'memory',
});

// No external dependencies required
await testStore.insert({ text: 'test data' });
const results = await testStore.getMostRelevant(['test'], 10);
```

## Migration Guide

### From DualStoreManager

The migration is designed to be seamless:

1. **Import Change**: Replace `DualStoreManager` with `SemanticStore`
2. **Factory Method**: Use `SemanticStore.create()` instead of `DualStoreManager.create()`
3. **API Compatibility**: All existing method calls remain identical

```typescript
// Before
import { DualStoreManager } from '@promethean-os/persistence';
const store = await DualStoreManager.create('thoughts', 'text', 'createdAt');

// After
import { SemanticStore } from '@promethean-os/persistence';
const store = await SemanticStore.create('thoughts', 'text', 'createdAt');
```

### Backward Compatibility Aliases

For existing code that cannot be immediately updated:

```typescript
// Alias for backward compatibility
export const DualStoreManager = SemanticStore;

// Existing code continues to work without changes
const store = await DualStoreManager.create('thoughts', 'text', 'createdAt');
```

## Testing Strategy

### Unit Testing

```typescript
test('SemanticStore with memory drivers', async (t) => {
  const store = await SemanticStoreFactory.create('test', 'text', 'createdAt', {
    primaryDriver: 'memory',
    vectorDriver: 'memory',
  });

  await store.insert({
    text: 'test document',
    metadata: { type: 'test' },
  });

  const results = await store.getMostRecent(1);
  t.is(results.length, 1);
  t.is(results[0].text, 'test document');
});
```

### Integration Testing

```typescript
test('SemanticStore with real drivers', async (t) => {
  // Test with actual MongoDB and ChromaDB
  const store = await SemanticStore.create('integration-test', 'text', 'createdAt');

  // Verify all operations work as expected
  await store.insert(testData);
  const recent = await store.getMostRecent(10);
  const relevant = await store.getMostRelevant(['query'], 5);

  t.true(recent.length > 0);
  t.true(relevant.length > 0);
});
```

### Driver-Specific Testing

Each driver includes its own test suite:

```typescript
test('MongoDriver operations', async (t) => {
  const driver = new MongoDriver(testConfig);
  await driver.initialize();

  await driver.insert(testEntry);
  const retrieved = await driver.get(testEntry.id);

  t.deepEqual(retrieved, testEntry);

  await driver.cleanup();
});
```

## Benefits

### For Developers

1. **Flexibility**: Choose the best storage backend for your use case
2. **Testability**: Easy unit testing without external dependencies
3. **Consistency**: Uniform API across all storage backends
4. **Migration**: Gradual migration path from existing systems

### For Operations

1. **Vendor Independence**: Easy to switch between cloud providers
2. **Cost Optimization**: Use different backends for different workloads
3. **Performance**: Optimize each backend independently
4. **Reliability**: Isolate failures to specific drivers

### For the Project

1. **Maintainability**: Clear separation of concerns
2. **Extensibility**: Simple to add new storage backends
3. **Testing**: Comprehensive test coverage possible
4. **Documentation**: Self-documenting driver interfaces

## Future Extensions

### Planned Drivers

1. **PostgreSQL Driver**: For organizations preferring PostgreSQL
2. **Pinecone Driver**: For managed vector search at scale
3. **Qdrant Driver**: For high-performance vector search
4. **Redis Driver**: For caching and real-time applications
5. **Elasticsearch Driver**: For full-text and vector search

### Advanced Features

1. **Driver Chaining**: Multiple primary databases for different data types
2. **Hybrid Search**: Combine keyword and vector search
3. **Multi-tenancy**: Isolate data per tenant
4. **Sharding**: Distribute data across multiple instances
5. **Caching**: Intelligent caching layers for performance

## Conclusion

The Semantic Store architecture provides a robust, flexible foundation for data storage and retrieval that maintains backward compatibility while enabling future growth. The driver-based approach ensures that the system can adapt to changing requirements and new technologies without requiring application changes.
