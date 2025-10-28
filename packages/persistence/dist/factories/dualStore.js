import { randomUUID } from 'node:crypto';
import { RemoteEmbeddingFunction } from '@promethean-os/embedding';
import { cleanup as cleanupAction, checkConsistency, get as getAction, getChromaQueueStats, getConsistencyReport, getMostRecent, getMostRelevant, insert, addEntry, retryVectorWrite, } from '../actions/dual-store/index.js';
import { getOrCreateQueue } from '../chroma-write-queue.js';
import { getChromaClient, getMongoClient, validateMongoConnection, cleanupClients as defaultCleanupClients, } from '../clients.js';
const defaultLogger = {
    error: console.error.bind(console),
    warn: console.warn.bind(console),
};
const resolveEnvironment = (overrides) => ({
    dualWriteEnabled: overrides?.dualWriteEnabled ?? (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false',
    consistencyLevel: overrides?.consistencyLevel === 'strict' ? 'strict' : 'eventual',
});
const createDependencies = (config) => {
    const queue = config.queue ?? getOrCreateQueue(config.name, config.chromaCollection);
    const getCollection = config.getCollection ??
        (async () => {
            if (!config.mongoCollection) {
                throw new Error('mongoCollection or getCollection must be provided to the dual store factory');
            }
            return config.mongoCollection;
        });
    return {
        state: {
            name: config.name,
            textKey: config.textKey,
            timeStampKey: config.timeStampKey,
            supportsImages: config.supportsImages,
        },
        chroma: {
            collection: config.chromaCollection,
            queue,
        },
        mongo: {
            getCollection,
        },
        env: resolveEnvironment(config.env),
        time: config.time ?? (() => Date.now()),
        uuid: config.uuid ?? randomUUID,
        logger: config.logger ?? defaultLogger,
        cleanupClients: config.cleanupClients,
    };
};
export const createDualStoreImplementation = (config) => {
    const dependencies = createDependencies(config);
    const state = dependencies.state;
    return {
        state,
        insert: (entry) => insert({ entry }, dependencies),
        addEntry: (entry) => addEntry({ entry }, dependencies),
        getMostRecent: (limit, mongoFilter, sorter) => getMostRecent({
            limit,
            mongoFilter: mongoFilter,
            sorter: sorter,
        }, dependencies),
        getMostRelevant: (queryTexts, limit, where) => getMostRelevant({ queryTexts, limit, where }, dependencies),
        get: (id) => getAction({ id }, dependencies),
        checkConsistency: (id) => checkConsistency({ id }, dependencies),
        retryVectorWrite: (id, maxRetries) => retryVectorWrite({ id, maxRetries }, dependencies),
        getConsistencyReport: (limit) => getConsistencyReport({ limit }, dependencies),
        getChromaQueueStats: () => getChromaQueueStats(undefined, dependencies),
        cleanup: () => cleanupAction(undefined, dependencies),
        setQueue: (queue) => {
            dependencies.chroma.queue = queue;
        },
    };
};
const pendingFactoryConfigs = new Map();
export const registerPendingDualStoreConfig = (config) => {
    pendingFactoryConfigs.set(config.name, config);
};
export const consumePendingDualStoreConfig = (name) => {
    const config = pendingFactoryConfigs.get(name);
    if (config) {
        pendingFactoryConfigs.delete(name);
    }
    return config;
};
export const resolveDualStoreResources = async (options) => {
    const agentName = options.agentName ?? process.env.AGENT_NAME ?? 'duck';
    const family = `${agentName}_${options.name}`;
    const chromaClient = await (options.getChromaClient ?? getChromaClient)();
    const mongoClient = await (options.getMongoClient ?? getMongoClient)();
    const validator = options.validateMongoConnection ?? validateMongoConnection;
    const validatedMongo = await validator(mongoClient);
    const db = validatedMongo.db('database');
    const aliases = db.collection('collection_aliases');
    const alias = await aliases.findOne({ _id: family });
    const embedFnName = alias?.embed?.fn ?? process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text';
    const embeddingFn = alias?.embed
        ? RemoteEmbeddingFunction.fromConfig({ driver: alias.embed.driver, fn: alias.embed.fn })
        : RemoteEmbeddingFunction.fromConfig({ driver: process.env.EMBEDDING_DRIVER ?? 'ollama', fn: embedFnName });
    const chromaCollection = await chromaClient.getOrCreateCollection({
        name: alias?.target ?? family,
        embeddingFunction: embeddingFn,
    });
    const mongoCollection = db.collection(family);
    const supportsImages = !embedFnName.toLowerCase().includes('text');
    const getCollection = async () => {
        const refreshedClient = await validator(mongoClient);
        const refreshedDb = refreshedClient.db('database');
        return refreshedDb.collection(mongoCollection.collectionName);
    };
    return {
        factoryConfig: {
            name: family,
            textKey: options.textKey,
            timeStampKey: options.timeStampKey,
            supportsImages,
            chromaCollection,
            getCollection,
            queue: getOrCreateQueue(family, chromaCollection),
            env: options.env,
            uuid: options.uuid,
            time: options.time,
            logger: options.logger,
            cleanupClients: options.cleanupClients ?? defaultCleanupClients,
        },
    };
};
export const createDualStore = async (options) => {
    const { factoryConfig } = await resolveDualStoreResources(options);
    return createDualStoreImplementation(factoryConfig);
};
//# sourceMappingURL=dualStore.js.map