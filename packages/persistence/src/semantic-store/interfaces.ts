import type { DualStoreEntry, DualStoreMetadata } from '../types.js';

// Re-export types for convenience
export type { DualStoreEntry, DualStoreMetadata } from '../types.js';

/**
 * Configuration for primary database drivers
 */
export interface PrimaryDatabaseConfig {
    readonly type: 'mongodb' | 'postgresql' | 'memory';
    readonly connection?: string;
    readonly database?: string;
    readonly options?: Record<string, unknown>;
}

/**
 * Configuration for vector search drivers
 */
export interface VectorSearchConfig {
    readonly type: 'chromadb' | 'pinecone' | 'qdrant' | 'memory';
    readonly endpoint?: string;
    readonly apiKey?: string;
    readonly collection?: string;
    readonly embeddingFunction?: {
        readonly driver: string;
        readonly fn: string;
        readonly dims?: number;
    };
    readonly options?: Record<string, unknown>;
}

/**
 * Main configuration for SemanticStore
 */
export interface SemanticStoreConfig {
    readonly name: string;
    readonly textKey: string;
    readonly timeStampKey: string;
    readonly primaryDriver: PrimaryDatabaseConfig;
    readonly vectorDriver: VectorSearchConfig;
    readonly dualWrite: boolean;
    readonly consistency: 'strict' | 'eventual';
    readonly writeQueue?: {
        readonly enabled: boolean;
        readonly batchSize: number;
        readonly flushIntervalMs: number;
        readonly maxRetries: number;
        readonly retryDelayMs: number;
    };
}

/**
 * Interface for primary database operations
 * Handles document storage, retrieval, and basic CRUD operations
 */
export interface PrimaryDatabaseDriver<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    readonly name: string;
    readonly config: PrimaryDatabaseConfig;

    /**
     * Insert a new document into the primary database
     */
    insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;

    /**
     * Retrieve a document by ID
     */
    get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null>;

    /**
     * Get most recent documents with optional filtering and sorting
     */
    getMostRecent(limit?: number, filter?: any, sorter?: any): Promise<DualStoreEntry<'text', 'timestamp'>[]>;

    /**
     * Update a document by ID
     */
    update(id: string, update: any): Promise<void>;

    /**
     * Check consistency between primary and vector stores
     */
    checkConsistency(id: string): Promise<{
        hasDocument: boolean;
        vectorWriteSuccess?: boolean;
        vectorWriteError?: string;
    }>;

    /**
     * Cleanup resources and connections
     */
    cleanup(): Promise<void>;
}

/**
 * Interface for vector search operations
 * Handles embedding generation, similarity search, and vector storage
 */
export interface VectorSearchDriver {
    readonly name: string;
    readonly config: VectorSearchConfig;

    /**
     * Add documents with their embeddings to the vector store
     */
    add(
        ids: string[],
        documents: string[],
        metadatas: Record<string, string | number | boolean | null>[],
    ): Promise<void>;

    /**
     * Search for similar documents based on query text
     */
    query(
        queryTexts: string[],
        limit: number,
        where?: Record<string, unknown>,
    ): Promise<{
        ids: string[][];
        documents: string[][];
        metadatas: (DualStoreMetadata | null)[][];
    }>;

    /**
     * Retrieve documents by their IDs
     */
    get(ids: string[]): Promise<{
        ids: string[];
        metadatas: (DualStoreMetadata | null)[];
    }>;

    /**
     * Retry a failed vector write
     */
    retryVectorWrite(
        id: string,
        document: string,
        metadata: Record<string, string | number | boolean | null>,
        maxRetries?: number,
    ): Promise<boolean>;

    /**
     * Cleanup resources and connections
     */
    cleanup(): Promise<void>;
}

/**
 * Queue statistics for monitoring write operations
 */
export interface QueueStats {
    readonly queueLength: number;
    readonly processing: boolean;
    readonly config: {
        readonly batchSize: number;
        readonly flushIntervalMs: number;
        readonly maxRetries: number;
        readonly retryDelayMs: number;
        readonly enabled: boolean;
    };
}

/**
 * Consistency report for monitoring dual-write status
 */
export interface ConsistencyReport {
    readonly totalDocuments: number;
    readonly consistentDocuments: number;
    readonly inconsistentDocuments: number;
    readonly missingVectors: number;
    readonly vectorWriteFailures: Array<{
        readonly id: string;
        readonly error?: string;
        readonly timestamp?: number;
    }>;
}

/**
 * Error types for semantic store operations
 */
export class SemanticStoreError extends Error {
    constructor(
        message: string,
        public readonly context: {
            readonly operation?: string;
            readonly driver?: string;
            readonly documentId?: string;
            readonly originalError?: unknown;
        },
    ) {
        super(message);
        this.name = 'SemanticStoreError';
    }
}

/**
 * Event types for monitoring and observability
 */
export interface SemanticStoreEvent {
    readonly type: 'vector_write' | 'vector_retry' | 'consistency_check' | 'driver_error';
    readonly timestamp: number;
    readonly collection: string;
    readonly documentId?: string;
    readonly details?: Record<string, unknown>;
}

/**
 * Driver factory interface for creating driver instances
 */
export interface DriverFactory<TConfig, TDriver> {
    create(config: TConfig): Promise<TDriver>;
    readonly supportedTypes: string[];
    readonly validateConfig?: (config: TConfig) => boolean;
}
