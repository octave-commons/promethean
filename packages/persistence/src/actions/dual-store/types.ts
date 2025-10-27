import type { Collection as ChromaCollection } from 'chromadb';
import type { Collection, Filter, Sort, UpdateFilter } from 'mongodb';

import type { DualStoreEntry } from '../../types.js';

export type QueueStats = {
    queueLength: number;
    processing: boolean;
    config: {
        batchSize: number;
        flushIntervalMs: number;
        maxRetries: number;
        retryDelayMs: number;
        enabled: boolean;
    };
};

export type QueueDependencies = {
    add: (id: string, document: string, metadata: Record<string, string | number | boolean | null>) => Promise<void>;
    shutdown: () => Promise<void>;
    getQueueStats: () => QueueStats;
};

export type MongoCollectionFactory<TextKey extends string, TimeKey extends string> = () => Promise<
    Collection<DualStoreEntry<TextKey, TimeKey>>
>;

export type TimeProvider = () => number;

export type UuidProvider = () => string;

export type Logger = {
    error: (message?: unknown, ...rest: unknown[]) => void;
    warn: (message?: unknown, ...rest: unknown[]) => void;
};

export type DualStoreState<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
    name: string;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;
};

export type DualStoreEnvironment = {
    dualWriteEnabled: boolean;
    consistencyLevel: 'strict' | 'eventual';
};

export type DualStoreDependencies<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
    state: DualStoreState<TextKey, TimeKey>;
    chroma: {
        collection: ChromaCollection;
        queue: QueueDependencies;
    };
    mongo: {
        getCollection: MongoCollectionFactory<TextKey, TimeKey>;
    };
    env: DualStoreEnvironment;
    time: TimeProvider;
    uuid: UuidProvider;
    logger: Logger;
    cleanupClients?: () => Promise<void>;
};

export type InsertInputs<TextKey extends string, TimeKey extends string> = {
    entry: DualStoreEntry<TextKey, TimeKey>;
};

export type GetMostRecentInputs<TextKey extends string, TimeKey extends string> = {
    limit?: number;
    mongoFilter?: Filter<DualStoreEntry<TextKey, TimeKey>>;
    sorter?: Sort;
};

export type GetMostRelevantInputs = {
    queryTexts: string[];
    limit: number;
    where?: Record<string, unknown>;
};

export type GetInputs = {
    id: string;
};

export type CheckConsistencyInputs = GetInputs;

export type RetryVectorWriteInputs = {
    id: string;
    maxRetries?: number;
};

export type GetConsistencyReportInputs = {
    limit?: number;
};

export type MongoUpdateFilter<TextKey extends string, TimeKey extends string> = UpdateFilter<
    DualStoreEntry<TextKey, TimeKey>
>;
