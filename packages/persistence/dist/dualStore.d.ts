import type { Collection as ChromaCollection } from 'chromadb';
import type { Collection } from 'mongodb';
import type { DualStoreEntry } from './types.js';
import { getOrCreateQueue } from './chroma-write-queue.js';
import { type DualStoreImplementation } from './factories/dualStore.js';
export declare class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    name: string;
    chromaCollection: ChromaCollection;
    mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;
    private implementation;
    private queue;
    constructor(name: string, chromaCollection: ChromaCollection, mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>, textKey: TextKey, timeStampKey: TimeKey, supportsImages?: boolean);
    get chromaWriteQueue(): ReturnType<typeof getOrCreateQueue>;
    set chromaWriteQueue(queue: ReturnType<typeof getOrCreateQueue>);
    static create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(name: string, textKey: TTextKey, timeStampKey: TTimeKey): Promise<DualStoreManager<TTextKey, TTimeKey>>;
    insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;
    addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;
    getMostRecent(limit?: number, mongoFilter?: Record<string, unknown>, sorter?: Record<string, 1 | -1>): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    getMostRelevant(queryTexts: string[], limit: number, where?: Record<string, unknown>): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null>;
    checkConsistency(id: string): Promise<{
        hasDocument: boolean;
        hasVector: boolean;
        vectorWriteSuccess?: boolean;
        vectorWriteError?: string;
    }>;
    retryVectorWrite(id: string, maxRetries?: number): Promise<boolean>;
    getConsistencyReport(limit?: number): Promise<{
        totalDocuments: number;
        consistentDocuments: number;
        inconsistentDocuments: number;
        missingVectors: number;
        vectorWriteFailures: Array<{
            id: string;
            error?: string;
            timestamp?: number;
        }>;
    }>;
    getChromaQueueStats(): import("./actions/dual-store/types.js").QueueStats;
    cleanup(): Promise<void>;
}
export declare const createDualStoreManager: <TextKey extends string, TimeKey extends string>(options: {
    name: string;
    textKey: TextKey;
    timeStampKey: TimeKey;
    agentName?: string;
    getChromaClient?: () => Promise<import("chromadb").ChromaClient>;
    getMongoClient?: () => Promise<import("mongodb").MongoClient>;
    validateMongoConnection?: (client: import("mongodb").MongoClient) => Promise<import("mongodb").MongoClient>;
    cleanupClients?: () => Promise<void>;
    env?: import("./factories/dualStore.js").DualStoreFactoryEnvironment;
    uuid?: () => string;
    time?: () => number;
    logger?: import("./actions/dual-store/types.js").DualStoreDependencies<TextKey_1, TimeKey_1>["logger"];
}) => Promise<DualStoreImplementation<TextKey, TimeKey>>;
//# sourceMappingURL=dualStore.d.ts.map