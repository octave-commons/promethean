# Semantic Store Interface Definitions

## Core Type Definitions

### Base Types

```typescript
/**
 * Represents a timestamp in various formats
 */
export type DualStoreTimestamp = number | Date | string;

/**
 * Metadata associated with dual store entries
 */
export type DualStoreMetadata = {
  readonly userName?: string;
  readonly isThought?: boolean;
  readonly type?: string;
  readonly caption?: string;
  readonly timeStamp?: DualStoreTimestamp;
  readonly vectorWriteSuccess?: boolean;
  readonly vectorWriteError?: string;
  readonly vectorWriteTimestamp?: number | null;
  readonly [key: string]: unknown;
};

/**
 * Generic entry structure for dual store
 */
export type DualStoreEntry<
  TextKey extends string = 'text',
  TimeKey extends string = 'createdAt',
  Metadata extends DualStoreMetadata = DualStoreMetadata,
> = {
  readonly _id?: ObjectId; // MongoDB internal ID
  readonly id?: string;
  readonly metadata?: Metadata;
} & {
  readonly [K in TextKey]: string;
} & {
  readonly [K in TimeKey]: DualStoreTimestamp;
};

/**
 * Specialized entry types
 */
export type DiscordEntry = DualStoreEntry<'content', 'created_at'>;
export type ThoughtEntry = DualStoreEntry<'text', 'createdAt'>;
```

### Driver Configuration Types

```typescript
/**
 * Base configuration for all drivers
 */
export interface BaseDriverConfig {
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * MongoDB driver configuration
 */
export interface MongoDriverConfig extends BaseDriverConfig {
  /** MongoDB connection URI */
  uri: string;
  /** Database name */
  database: string;
  /** Collection name prefix */
  collectionPrefix?: string;
  /** MongoDB connection options */
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    connectTimeoutMS?: number;
    heartbeatFrequencyMS?: number;
    retryWrites?: boolean;
    retryReads?: boolean;
    maxConnecting?: number;
    waitQueueTimeoutMS?: number;
  };
}

/**
 * PostgreSQL driver configuration
 */
export interface PostgresDriverConfig extends BaseDriverConfig {
  /** PostgreSQL connection host */
  host: string;
  /** PostgreSQL connection port */
  port?: number;
  /** Database name */
  database: string;
  /** Username */
  username: string;
  /** Password */
  password: string;
  /** SSL configuration */
  ssl?: boolean | object;
  /** Connection pool configuration */
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
  };
}

/**
 * ChromaDB driver configuration
 */
export interface ChromaDriverConfig extends BaseDriverConfig {
  /** ChromaDB server URL */
  url: string;
  /** Collection name */
  collection?: string;
  /** Embedding function configuration */
  embeddingFunction: {
    driver: string;
    fn: string;
    dims?: number;
    version?: string;
  };
  /** Write queue configuration */
  writeQueue?: {
    batchSize: number;
    flushIntervalMs: number;
    maxRetries: number;
    retryDelayMs: number;
    enabled: boolean;
  };
}

/**
 * Pinecone driver configuration
 */
export interface PineconeDriverConfig extends BaseDriverConfig {
  /** Pinecone API key */
  apiKey: string;
  /** Pinecone environment */
  environment: string;
  /** Index name */
  indexName: string;
  /** Namespace for multi-tenancy */
  namespace?: string;
  /** Embedding dimension */
  dimension?: number;
  /** Metric type for similarity */
  metric?: 'cosine' | 'euclidean' | 'dotproduct';
}

/**
 * Qdrant driver configuration
 */
export interface QdrantDriverConfig extends BaseDriverConfig {
  /** Qdrant server URL */
  url: string;
  /** API key (if required) */
  apiKey?: string;
  /** Collection name */
  collection?: string;
  /** Embedding dimension */
  dimension?: number;
  /** Distance metric */
  distance?: 'Cosine' | 'Euclid' | 'Dot';
  /** Vector configuration */
  vectors?: {
    size: number;
    distance: string;
  };
}
```

### Primary Database Driver Interface

```typescript
/**
 * Interface for primary database storage drivers
 */
export interface PrimaryDatabaseDriver<
  TextKey extends string = 'text',
  TimeKey extends string = 'createdAt',
> {
  /**
   * Initialize the driver and establish connections
   */
  initialize(): Promise<void>;

  /**
   * Insert a new entry into the primary database
   * @param entry - The entry to insert
   */
  insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;

  /**
   * Retrieve an entry by ID
   * @param id - The entry ID
   * @returns The entry or null if not found
   */
  get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null>;

  /**
   * Get the most recent entries
   * @param limit - Maximum number of entries to return
   * @param filter - MongoDB-style filter object
   * @param sorter - MongoDB-style sort object
   * @returns Array of recent entries
   */
  getMostRecent(
    limit?: number,
    filter?: any,
    sorter?: any,
  ): Promise<DualStoreEntry<'text', 'timestamp'>[]>;

  /**
   * Update vector write status for an entry
   * @param id - The entry ID
   * @param success - Whether the vector write was successful
   * @param error - Error message if write failed
   */
  updateVectorWriteStatus(id: string, success: boolean, error?: string): Promise<void>;

  /**
   * Get consistency report for recent entries
   * @param limit - Number of entries to check
   * @returns Consistency report
   */
  getConsistencyReport(limit?: number): Promise<ConsistencyReport>;

  /**
   * Check consistency for a specific entry
   * @param id - The entry ID
   * @returns Consistency status
   */
  checkConsistency(id: string): Promise<ConsistencyResult>;

  /**
   * Cleanup resources and close connections
   */
  cleanup(): Promise<void>;
}
```

### Vector Search Driver Interface

```typescript
/**
 * Result from vector query operation
 */
export interface VectorQueryResult {
  /** Array of result IDs (nested for multiple queries) */
  ids: ReadonlyArray<ReadonlyArray<string>>;
  /** Array of document texts (nested for multiple queries) */
  documents: ReadonlyArray<ReadonlyArray<string | null>>;
  /** Array of metadata objects (nested for multiple queries) */
  metadatas: ReadonlyArray<ReadonlyArray<Record<string, any> | null>>;
  /** Array of distance scores (nested for multiple queries) */
  distances?: ReadonlyArray<ReadonlyArray<number | null>>;
}

/**
 * Result from vector get operation
 */
export interface VectorGetResult {
  /** Array of IDs */
  ids: string[];
  /** Array of documents */
  documents: (string | null)[];
  /** Array of metadata objects */
  metadatas: (Record<string, any> | null)[];
}

/**
 * Interface for vector search drivers
 */
export interface VectorSearchDriver {
  /**
   * Initialize the driver and establish connections
   */
  initialize(): Promise<void>;

  /**
   * Add a single document to the vector store
   * @param id - Document ID
   * @param text - Document text
   * @param metadata - Optional metadata
   */
  add(id: string, text: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Add multiple documents in batch
   * @param entries - Array of documents to add
   */
  addBatch(
    entries: Array<{
      id: string;
      text: string;
      metadata?: Record<string, any>;
    }>,
  ): Promise<void>;

  /**
   * Query for similar documents
   * @param queryTexts - Array of query texts
   * @param limit - Maximum number of results per query
   * @param where - Metadata filter conditions
   * @returns Query results
   */
  query(
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
  ): Promise<VectorQueryResult>;

  /**
   * Get documents by IDs
   * @param ids - Array of document IDs
   * @returns Retrieved documents
   */
  get(ids: string[]): Promise<VectorGetResult>;

  /**
   * Delete documents by IDs
   * @param ids - Array of document IDs to delete
   */
  delete(ids: string[]): Promise<void>;

  /**
   * Update an existing document
   * @param id - Document ID
   * @param text - Updated text
   * @param metadata - Updated metadata
   */
  update(id: string, text: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Get statistics about the vector store
   * @returns Store statistics
   */
  getStats(): Promise<VectorStoreStats>;

  /**
   * Cleanup resources and close connections
   */
  cleanup(): Promise<void>;
}
```

### Configuration Interface

```typescript
/**
 * Main semantic store configuration
 */
export interface SemanticStoreConfig {
  /** Primary database driver type */
  primaryDriver: 'mongodb' | 'postgresql' | 'memory';
  /** Vector search driver type */
  vectorDriver: 'chromadb' | 'pinecone' | 'qdrant' | 'memory';

  /** Driver-specific configurations */
  mongodb?: MongoDriverConfig;
  postgresql?: PostgresDriverConfig;
  chromadb?: ChromaDriverConfig;
  pinecone?: PineconeDriverConfig;
  qdrant?: QdrantDriverConfig;

  /** Consistency level for dual writes */
  consistency: 'strict' | 'eventual';
  /** Enable dual writes to both stores */
  dualWriteEnabled: boolean;
  /** Support image embeddings */
  supportsImages: boolean;

  /** Performance tuning parameters */
  vectorBatchSize: number;
  vectorFlushInterval: number;
  maxRetries: number;

  /** Feature flags */
  enableMetrics?: boolean;
  enableTracing?: boolean;
  enableCaching?: boolean;
}
```

### Result Types

```typescript
/**
 * Consistency check result for a single entry
 */
export interface ConsistencyResult {
  /** Whether document exists in primary store */
  hasDocument: boolean;
  /** Whether vector exists in vector store */
  hasVector: boolean;
  /** Whether vector write was successful */
  vectorWriteSuccess?: boolean;
  /** Vector write error message */
  vectorWriteError?: string;
}

/**
 * Consistency report for multiple entries
 */
export interface ConsistencyReport {
  /** Total number of documents checked */
  totalDocuments: number;
  /** Number of consistent documents */
  consistentDocuments: number;
  /** Number of inconsistent documents */
  inconsistentDocuments: number;
  /** Number of documents missing vectors */
  missingVectors: number;
  /** Details about vector write failures */
  vectorWriteFailures: Array<{
    id: string;
    error?: string;
    timestamp?: number;
  }>;
}

/**
 * Vector store statistics
 */
export interface VectorStoreStats {
  /** Total number of vectors */
  totalVectors: number;
  /** Vector dimension */
  dimension: number;
  /** Index type */
  indexType?: string;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Number of collections */
  collectionCount?: number;
}

/**
 * Queue statistics for write operations
 */
export interface QueueStats {
  /** Current queue length */
  queueLength: number;
  /** Whether queue is currently processing */
  processing: boolean;
  /** Queue configuration */
  config: {
    batchSize: number;
    flushIntervalMs: number;
    maxRetries: number;
    retryDelayMs: number;
    enabled: boolean;
  };
}
```

### Error Types

```typescript
/**
 * Base error class for semantic store operations
 */
export abstract class SemanticStoreError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when driver initialization fails
 */
export class DriverInitializationError extends SemanticStoreError {
  constructor(driverType: string, cause: Error) {
    super(
      `Failed to initialize ${driverType} driver: ${cause.message}`,
      'DRIVER_INITIALIZATION_ERROR',
      { driverType, originalError: cause.message },
    );
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends SemanticStoreError {
  constructor(message: string, field?: string) {
    super(message, 'CONFIGURATION_ERROR', { field });
  }
}

/**
 * Error thrown when consistency check fails
 */
export class ConsistencyError extends SemanticStoreError {
  constructor(id: string, details: ConsistencyResult) {
    super(`Consistency check failed for entry ${id}`, 'CONSISTENCY_ERROR', { id, details });
  }
}

/**
 * Error thrown when vector operation fails
 */
export class VectorOperationError extends SemanticStoreError {
  constructor(operation: string, cause: Error) {
    super(`Vector ${operation} failed: ${cause.message}`, 'VECTOR_OPERATION_ERROR', {
      operation,
      originalError: cause.message,
    });
  }
}

/**
 * Error thrown when primary database operation fails
 */
export class PrimaryDatabaseError extends SemanticStoreError {
  constructor(operation: string, cause: Error) {
    super(`Primary database ${operation} failed: ${cause.message}`, 'PRIMARY_DATABASE_ERROR', {
      operation,
      originalError: cause.message,
    });
  }
}
```

### Event Types

```typescript
/**
 * Base event type for semantic store operations
 */
export interface SemanticStoreEvent {
  /** Event timestamp */
  timestamp: number;
  /** Event type */
  type: string;
  /** Store name */
  store: string;
  /** Event ID */
  id: string;
}

/**
 * Event emitted when an entry is inserted
 */
export interface EntryInsertedEvent extends SemanticStoreEvent {
  type: 'entry_inserted';
  /** Entry ID */
  entryId: string;
  /** Whether vector write was successful */
  vectorWriteSuccess: boolean;
  /** Vector write error if any */
  vectorWriteError?: string;
}

/**
 * Event emitted when consistency check is performed
 */
export interface ConsistencyCheckedEvent extends SemanticStoreEvent {
  type: 'consistency_checked';
  /** Entry ID */
  entryId: string;
  /** Consistency result */
  result: ConsistencyResult;
}

/**
 * Event emitted when vector write is retried
 */
export interface VectorWriteRetriedEvent extends SemanticStoreEvent {
  type: 'vector_write_retried';
  /** Entry ID */
  entryId: string;
  /** Attempt number */
  attempt: number;
  /** Whether retry was successful */
  success: boolean;
  /** Error if retry failed */
  error?: string;
}

/**
 * Event listener type
 */
export type EventListener<T extends SemanticStoreEvent = SemanticStoreEvent> = (
  event: T,
) => void | Promise<void>;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  /**
   * Add event listener
   * @param eventType - Event type to listen for
   * @param listener - Event listener function
   */
  on<T extends SemanticStoreEvent>(eventType: T['type'], listener: EventListener<T>): void;

  /**
   * Remove event listener
   * @param eventType - Event type
   * @param listener - Event listener function
   */
  off<T extends SemanticStoreEvent>(eventType: T['type'], listener: EventListener<T>): void;

  /**
   * Emit an event
   * @param event - Event to emit
   */
  emit<T extends SemanticStoreEvent>(event: T): Promise<void>;
}
```

### Utility Types

```typescript
/**
 * Deep partial type for configuration updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Driver factory type
 */
export type DriverFactory<TConfig, TDriver> = (config: TConfig) => Promise<TDriver>;

/**
 * Async function type
 */
export type AsyncFunction<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => Promise<TReturn>;

/**
 * Union of all driver types
 */
export type AnyDriver = PrimaryDatabaseDriver | VectorSearchDriver;

/**
 * Union of all driver configuration types
 */
export type AnyDriverConfig =
  | MongoDriverConfig
  | PostgresDriverConfig
  | ChromaDriverConfig
  | PineconeDriverConfig
  | QdrantDriverConfig;

/**
 * Union of all driver names
 */
export type DriverName = 'mongodb' | 'postgresql' | 'memory' | 'chromadb' | 'pinecone' | 'qdrant';
```
