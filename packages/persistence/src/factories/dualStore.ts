import { randomUUID } from 'node:crypto';

import { RemoteEmbeddingFunction } from '@promethean-os/embedding';
import type { Collection as ChromaCollection, ChromaClient } from 'chromadb';
import type { Collection, MongoClient } from 'mongodb';

import {
    cleanup as cleanupAction,
    checkConsistency,
    get as getAction,
    getChromaQueueStats,
    getConsistencyReport,
    getMostRecent,
    getMostRelevant,
    insert,
    addEntry,
    retryVectorWrite,
    type DualStoreDependencies,
    type DualStoreEnvironment,
    type DualStoreState,
} from '../actions/dual-store/index.js';
import { getOrCreateQueue } from '../chroma-write-queue.js';
import {
    getChromaClient,
    getMongoClient,
    validateMongoConnection,
    cleanupClients as defaultCleanupClients,
} from '../clients.js';
import type { AliasDoc, DualStoreEntry } from '../types.js';

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
    getMostRecent(
        limit?: number,
        mongoFilter?: Record<string, unknown>,
        sorter?: Record<string, 1 | -1>,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    getMostRelevant(
        queryTexts: string[],
        limit: number,
        where?: Record<string, unknown>,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
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
        vectorWriteFailures: Array<{ id: string; error?: string; timestamp?: number }>;
    }>;
    getChromaQueueStats(): ReturnType<typeof getChromaQueueStats>;
    cleanup(): Promise<void>;
};

const defaultLogger: DualStoreDependencies['logger'] = {
    error: console.error.bind(console),
    warn: console.warn.bind(console),
};

const resolveEnvironment = (overrides: DualStoreFactoryEnvironment | undefined): DualStoreEnvironment => ({
    dualWriteEnabled: overrides?.dualWriteEnabled ?? (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false',
    consistencyLevel: overrides?.consistencyLevel === 'strict' ? 'strict' : 'eventual',
});

const createDependencies = <TextKey extends string, TimeKey extends string>(
    config: DualStoreFactoryConfig<TextKey, TimeKey>,
): DualStoreDependencies<TextKey, TimeKey> => {
    const queue = config.queue ?? getOrCreateQueue(config.name, config.chromaCollection);

    const getCollection =
        config.getCollection ??
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

export const createDualStoreImplementation = <TextKey extends string, TimeKey extends string>(
    config: DualStoreFactoryConfig<TextKey, TimeKey>,
): DualStoreImplementation<TextKey, TimeKey> => {
    const dependencies = createDependencies(config);
    const state = dependencies.state;

    return {
        state,
        insert: (entry) => insert({ entry }, dependencies),
        addEntry: (entry) => addEntry({ entry }, dependencies),
        getMostRecent: (limit, mongoFilter, sorter) =>
            getMostRecent({
                limit,
                mongoFilter: mongoFilter as any,
                sorter: sorter as any,
            }, dependencies),
        getMostRelevant: (queryTexts, limit, where) =>
            getMostRelevant({ queryTexts, limit, where }, dependencies),
        get: (id) => getAction({ id }, dependencies),
        checkConsistency: (id) => checkConsistency({ id }, dependencies),
        retryVectorWrite: (id, maxRetries) => retryVectorWrite({ id, maxRetries }, dependencies),
        getConsistencyReport: (limit) => getConsistencyReport({ limit }, dependencies),
        getChromaQueueStats: () => getChromaQueueStats(undefined, dependencies),
        cleanup: () => cleanupAction(undefined, dependencies),
    };
};

const pendingFactoryConfigs = new Map<string, DualStoreFactoryConfig<any, any>>();

export const registerPendingDualStoreConfig = <TextKey extends string, TimeKey extends string>(
    config: DualStoreFactoryConfig<TextKey, TimeKey>,
) => {
    pendingFactoryConfigs.set(config.name, config);
};

export const consumePendingDualStoreConfig = <TextKey extends string, TimeKey extends string>(
    name: string,
): DualStoreFactoryConfig<TextKey, TimeKey> | undefined => {
    const config = pendingFactoryConfigs.get(name) as DualStoreFactoryConfig<TextKey, TimeKey> | undefined;
    if (config) {
        pendingFactoryConfigs.delete(name);
    }
    return config;
};

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

export const resolveDualStoreResources = async <TextKey extends string, TimeKey extends string>(
    options: DualStoreCreateOptions<TextKey, TimeKey>,
) => {
    const agentName = options.agentName ?? process.env.AGENT_NAME ?? 'duck';
    const family = `${agentName}_${options.name}`;

    const chromaClient = await (options.getChromaClient ?? getChromaClient)();
    const mongoClient = await (options.getMongoClient ?? getMongoClient)();
    const validator = options.validateMongoConnection ?? validateMongoConnection;
    const validatedMongo = await validator(mongoClient);

    const db = validatedMongo.db('database');
    const aliases = db.collection<AliasDoc>('collection_aliases');
    const alias = await aliases.findOne({ _id: family });

    const embedFnName = alias?.embed?.fn ?? process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text';
    const embeddingFn = alias?.embed
        ? RemoteEmbeddingFunction.fromConfig({ driver: alias.embed.driver, fn: alias.embed.fn })
        : RemoteEmbeddingFunction.fromConfig({ driver: process.env.EMBEDDING_DRIVER ?? 'ollama', fn: embedFnName });

    const chromaCollection = await chromaClient.getOrCreateCollection({
        name: alias?.target ?? family,
        embeddingFunction: embeddingFn,
    });

    const mongoCollection = db.collection<DualStoreEntry<TextKey, TimeKey>>(family);

    const supportsImages = !embedFnName.toLowerCase().includes('text');

    const getCollection = async () => {
        const refreshedClient = await validator(mongoClient);
        const refreshedDb = refreshedClient.db('database');
        return refreshedDb.collection<DualStoreEntry<TextKey, TimeKey>>(mongoCollection.collectionName);
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
        } satisfies DualStoreFactoryConfig<TextKey, TimeKey>,
    };
};

export const createDualStore = async <TextKey extends string, TimeKey extends string>(
    options: DualStoreCreateOptions<TextKey, TimeKey>,
): Promise<DualStoreImplementation<TextKey, TimeKey>> => {
    const { factoryConfig } = await resolveDualStoreResources(options);
    return createDualStoreImplementation(factoryConfig);
};
