import { getOrCreateQueue } from './chroma-write-queue.js';
import { cleanupClients as defaultCleanupClients } from './clients.js';
import { createDualStore, createDualStoreImplementation, resolveDualStoreResources, registerPendingDualStoreConfig, consumePendingDualStoreConfig, } from './factories/dualStore.js';
const warnDeprecationOnce = (() => {
    let warned = false;
    return () => {
        if (!warned) {
            warned = true;
            const message = 'DualStoreManager is deprecated. Use the functional actions + factory pattern from src/actions/dual-store instead.';
            if (typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
                process.emitWarning(message, { code: 'DualStoreManagerDeprecation', type: 'DeprecationWarning' });
            }
            else {
                console.warn(message);
            }
        }
    };
})();
const ensureFactoryConfig = (name, chromaCollection, mongoCollection, textKey, timeStampKey, supportsImages, queue) => {
    const pending = consumePendingDualStoreConfig(name);
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
    };
};
export class DualStoreManager {
    name;
    chromaCollection;
    mongoCollection;
    textKey;
    timeStampKey;
    supportsImages;
    implementation;
    constructor(name, chromaCollection, mongoCollection, textKey, timeStampKey, supportsImages = false) {
        warnDeprecationOnce();
        const queue = getOrCreateQueue(name, chromaCollection);
        const factoryConfig = ensureFactoryConfig(name, chromaCollection, mongoCollection, textKey, timeStampKey, supportsImages, queue);
        this.implementation = createDualStoreImplementation(factoryConfig);
        this.name = factoryConfig.name;
        this.chromaCollection = chromaCollection;
        this.mongoCollection = mongoCollection;
        this.textKey = factoryConfig.textKey;
        this.timeStampKey = factoryConfig.timeStampKey;
        this.supportsImages = factoryConfig.supportsImages;
    }
    static async create(name, textKey, timeStampKey) {
        warnDeprecationOnce();
        const resources = await resolveDualStoreResources({
            name,
            textKey,
            timeStampKey,
        });
        const mongoCollection = await resources.factoryConfig.getCollection();
        const factoryConfig = {
            ...resources.factoryConfig,
            mongoCollection,
        };
        registerPendingDualStoreConfig(factoryConfig);
        return new DualStoreManager(factoryConfig.name, factoryConfig.chromaCollection, mongoCollection, factoryConfig.textKey, factoryConfig.timeStampKey, factoryConfig.supportsImages);
    }
    async insert(entry) {
        await this.implementation.insert(entry);
    }
    async addEntry(entry) {
        await this.implementation.addEntry(entry);
    }
    async getMostRecent(limit = 10, mongoFilter, sorter) {
        return this.implementation.getMostRecent(limit, mongoFilter, sorter);
    }
    async getMostRelevant(queryTexts, limit, where) {
        return this.implementation.getMostRelevant(queryTexts, limit, where);
    }
    async get(id) {
        return this.implementation.get(id);
    }
    async checkConsistency(id) {
        return this.implementation.checkConsistency(id);
    }
    async retryVectorWrite(id, maxRetries = 3) {
        return this.implementation.retryVectorWrite(id, maxRetries);
    }
    async getConsistencyReport(limit = 100) {
        return this.implementation.getConsistencyReport(limit);
    }
    getChromaQueueStats() {
        return this.implementation.getChromaQueueStats();
    }
    async cleanup() {
        await this.implementation.cleanup();
    }
}
export const createDualStoreManager = createDualStore;
