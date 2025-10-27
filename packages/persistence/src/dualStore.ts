import type { Collection as ChromaCollection } from 'chromadb';
import type { Collection } from 'mongodb';

import type { DualStoreEntry } from './types.js';
import { getOrCreateQueue } from './chroma-write-queue.js';
import { cleanupClients as defaultCleanupClients } from './clients.js';
import {
    createDualStore,
    createDualStoreImplementation,
    resolveDualStoreResources,
    registerPendingDualStoreConfig,
    consumePendingDualStoreConfig,
    type DualStoreFactoryConfig,
    type DualStoreImplementation,
} from './factories/dualStore.js';

const warnDeprecationOnce = (() => {
    let warned = false;
    return () => {
        if (!warned) {
            warned = true;
            const message =
                'DualStoreManager is deprecated. Use the functional actions + factory pattern from src/actions/dual-store instead.';
            if (typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
                process.emitWarning(message, { code: 'DualStoreManagerDeprecation', type: 'DeprecationWarning' });
            } else {
                console.warn(message);
            }
        }
    };
})();

const ensureFactoryConfig = <TextKey extends string, TimeKey extends string>(
    name: string,
    chromaCollection: ChromaCollection,
    mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>,
    textKey: TextKey,
    timeStampKey: TimeKey,
    supportsImages: boolean,
    queue: ReturnType<typeof getOrCreateQueue>,
): DualStoreFactoryConfig<TextKey, TimeKey> => {
    const pending = consumePendingDualStoreConfig<TextKey, TimeKey>(name);

    if (pending) {
        if (!pending.mongoCollection) {
            pending.mongoCollection = mongoCollection;
        }
        if (!pending.queue) {
            pending.queue = queue;
        }
        if (!pending.cleanupClients) {
            pending.cleanupClients = defaultCleanupClients;
        }
        return pending;
    }

    return {
        name,
        textKey,
        timeStampKey,
        supportsImages,
        chromaCollection,
        mongoCollection,
        queue,
        cleanupClients: defaultCleanupClients,
    } satisfies DualStoreFactoryConfig<TextKey, TimeKey>;
};

export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    name: string;
    chromaCollection: ChromaCollection;
    mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;
    private implementation: DualStoreImplementation<TextKey, TimeKey>;

    constructor(
        name: string,
        chromaCollection: ChromaCollection,
        mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>,
        textKey: TextKey,
        timeStampKey: TimeKey,
        supportsImages = false,
    ) {
        warnDeprecationOnce();

        const queue = getOrCreateQueue(name, chromaCollection);
        const factoryConfig = ensureFactoryConfig(
            name,
            chromaCollection,
            mongoCollection,
            textKey,
            timeStampKey,
            supportsImages,
            queue,
        );

        this.implementation = createDualStoreImplementation(factoryConfig);

        this.name = factoryConfig.name;
        this.chromaCollection = chromaCollection;
        this.mongoCollection = mongoCollection;
        this.textKey = factoryConfig.textKey;
        this.timeStampKey = factoryConfig.timeStampKey;
        this.supportsImages = factoryConfig.supportsImages;
    }

    static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'> (
        name: string,
        textKey: TTextKey,
        timeStampKey: TTimeKey,
    ): Promise<DualStoreManager<TTextKey, TTimeKey>> {
        warnDeprecationOnce();

        const resources = await resolveDualStoreResources<TTextKey, TTimeKey>({
            name,
            textKey,
            timeStampKey,
        });

        const mongoCollection = await resources.factoryConfig.getCollection();
        const factoryConfig: DualStoreFactoryConfig<TTextKey, TTimeKey> = {
            ...resources.factoryConfig,
            mongoCollection,
        };

        registerPendingDualStoreConfig(factoryConfig);

        return new DualStoreManager<TTextKey, TTimeKey>(
            factoryConfig.name,
            factoryConfig.chromaCollection,
            mongoCollection,
            factoryConfig.textKey,
            factoryConfig.timeStampKey,
            factoryConfig.supportsImages,
        );
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        await this.implementation.insert(entry);
    }

    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        await this.implementation.addEntry(entry);
    }

    async getMostRecent(
        limit = 10,
        mongoFilter?: Record<string, unknown>,
        sorter?: Record<string, 1 | -1>,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        return this.implementation.getMostRecent(limit, mongoFilter, sorter);
    }

    async getMostRelevant(
        queryTexts: string[],
        limit: number,
        where?: Record<string, unknown>,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        return this.implementation.getMostRelevant(queryTexts, limit, where);
    }

    async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
        return this.implementation.get(id);
    }

    async checkConsistency(id: string): Promise<{
        hasDocument: boolean;
        hasVector: boolean;
        vectorWriteSuccess?: boolean;
        vectorWriteError?: string;
    }> {
        return this.implementation.checkConsistency(id);
    }

    async retryVectorWrite(id: string, maxRetries = 3): Promise<boolean> {
        return this.implementation.retryVectorWrite(id, maxRetries);
    }

    async getConsistencyReport(limit = 100): Promise<{
        totalDocuments: number;
        consistentDocuments: number;
        inconsistentDocuments: number;
        missingVectors: number;
        vectorWriteFailures: Array<{ id: string; error?: string; timestamp?: number }>;
    }> {
        return this.implementation.getConsistencyReport(limit);
    }

    getChromaQueueStats() {
        return this.implementation.getChromaQueueStats();
    }

    async cleanup(): Promise<void> {
        await this.implementation.cleanup();
    }
}

export const createDualStoreManager = createDualStore;
