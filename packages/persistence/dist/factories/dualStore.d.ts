import type { Collection as ChromaCollection, ChromaClient } from 'chromadb';
import type { Collection, MongoClient } from 'mongodb';
import { getChromaQueueStats, type DualStoreDependencies, type DualStoreEnvironment, type DualStoreState, type QueueDependencies } from '../actions/dual-store/index.js';
import { getOrCreateQueue } from '../chroma-write-queue.js';
import type { DualStoreEntry } from '../types.js';
export type DualStoreFactoryEnvironment = Partial<DualStoreEnvironment>;
export type DualStoreFactoryConfig<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
    name: string;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;
    chromaCollection: ChromaCollection;
    mongoCollection?: Collection<DualStoreEntry<TextKey, TimeKey>>;
    getCollection?: () => Promise<Collection<DualStoreEntry<TextKey, TimeKey>>>;
    queue?: ReturnType<typeof getOrCreateQueue>;
    env?: DualStoreFactoryEnvironment;
    uuid?: () => string;
    time?: () => number;
    logger?: DualStoreDependencies<TextKey, TimeKey>['logger'];
    cleanupClients?: () => Promise<void>;
};
export type DualStoreImplementation<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
    readonly state: DualStoreState<TextKey, TimeKey>;
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
    getChromaQueueStats(): ReturnType<typeof getChromaQueueStats>;
    cleanup(): Promise<void>;
    setQueue(queue: QueueDependencies): void;
};
export declare const createDualStoreImplementation: <TextKey extends string, TimeKey extends string>(config: DualStoreFactoryConfig<TextKey, TimeKey>) => DualStoreImplementation<TextKey, TimeKey>;
export declare const registerPendingDualStoreConfig: <TextKey extends string, TimeKey extends string>(config: DualStoreFactoryConfig<TextKey, TimeKey>) => void;
export declare const consumePendingDualStoreConfig: <TextKey extends string, TimeKey extends string>(name: string) => DualStoreFactoryConfig<TextKey, TimeKey> | undefined;
type DualStoreCreateOptions<TextKey extends string, TimeKey extends string> = {
    name: string;
    textKey: TextKey;
    timeStampKey: TimeKey;
    agentName?: string;
    getChromaClient?: () => Promise<ChromaClient>;
    getMongoClient?: () => Promise<MongoClient>;
    validateMongoConnection?: (client: MongoClient) => Promise<MongoClient>;
    cleanupClients?: () => Promise<void>;
    env?: DualStoreFactoryEnvironment;
    uuid?: () => string;
    time?: () => number;
    logger?: DualStoreDependencies<TextKey, TimeKey>['logger'];
};
export declare const resolveDualStoreResources: <TextKey extends string, TimeKey extends string>(options: DualStoreCreateOptions<TextKey, TimeKey>) => Promise<{
    factoryConfig: {
        name: string;
        textKey: TextKey;
        timeStampKey: TimeKey;
        supportsImages: boolean;
        chromaCollection: ChromaCollection;
        getCollection: () => Promise<Collection<DualStoreEntry<TextKey, TimeKey>>>;
        queue: import("../chroma-write-queue.js").ChromaWriteQueue;
        env: Partial<DualStoreEnvironment> | undefined;
        uuid: (() => string) | undefined;
        time: (() => number) | undefined;
        logger: import("../actions/dual-store/types.js").Logger | undefined;
        cleanupClients: () => Promise<void>;
    };
}>;
export declare const createDualStore: <TextKey extends string, TimeKey extends string>(options: DualStoreCreateOptions<TextKey, TimeKey>) => Promise<DualStoreImplementation<TextKey, TimeKey>>;
export {};
//# sourceMappingURL=dualStore.d.ts.map