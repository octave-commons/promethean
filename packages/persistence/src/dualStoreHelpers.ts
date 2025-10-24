import type { Collection as ChromaCollection, Metadata as ChromaMetadata } from 'chromadb';
import type { Collection } from 'mongodb';
import { RemoteEmbeddingFunction } from '@promethean-os/embedding';
import { AGENT_NAME } from '@promethean-os/legacy/env.js';

import type { DualStoreEntry, DualStoreMetadata, DualStoreTimestamp } from './types.js';
import { getChromaClient, getMongoClient } from './clients.js';

export const toEpochMilliseconds = (timestamp: DualStoreTimestamp | undefined): number => {
    if (timestamp instanceof Date) return timestamp.getTime();
    if (typeof timestamp === 'string') return new Date(timestamp).getTime();
    if (typeof timestamp === 'number') return timestamp;
    return Date.now();
};

export const pickTimestamp = (...candidates: readonly unknown[]): DualStoreTimestamp | undefined => {
    for (const candidate of candidates) {
        if (candidate instanceof Date || typeof candidate === 'number' || typeof candidate === 'string') {
            return candidate as DualStoreTimestamp;
        }
    }
    return undefined;
};

export const withTimestampMetadata = (
    metadata: DualStoreMetadata | undefined,
    key: string,
    timestamp: number,
): DualStoreMetadata => ({
    ...metadata,
    [key]: timestamp,
    timeStamp: timestamp,
});

export const toChromaMetadata = (metadata: DualStoreMetadata): ChromaMetadata => {
    const result: ChromaMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (value !== null && value !== undefined) {
            result[key] = value as string | number | boolean | null;
        }
    }
    return result;
};

export const cloneMetadata = (metadata: ChromaMetadata | null | undefined): DualStoreMetadata | undefined =>
    metadata ? ({ ...metadata } as DualStoreMetadata) : undefined;

export const toGenericEntry = <TextKey extends string, TimeKey extends string>(
    entry: DualStoreEntry<TextKey, TimeKey> | any,
    textKey: TextKey,
    timeStampKey: TimeKey,
): DualStoreEntry<'text', 'timestamp'> => {
    const metadata = entry.metadata;
    const timestampSource = pickTimestamp(metadata?.[timeStampKey], metadata?.timeStamp, entry[timeStampKey]);

    return {
        id: entry.id,
        text: entry[textKey],
        timestamp: toEpochMilliseconds(timestampSource),
        metadata: withTimestampMetadata(metadata, 'timestamp', toEpochMilliseconds(timestampSource)),
    };
};

export const createDefaultMongoFilter = (_state: any, where?: any): any => {
    if (!where) return {};
    return where;
};

export const createDefaultSorter = (state: any): any => ({ [state.timeStampKey]: -1 });

export type DualStoreManagerDependencies<TextKey extends string, TimeKey extends string> = {
    readonly name: string;
    readonly agent_name: string;
    readonly embedding_fn: string;
    readonly chromaCollection: ChromaCollection;
    readonly mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    readonly textKey: TextKey;
    readonly timeStampKey: TimeKey;
    readonly supportsImages: boolean;
};

const setupClients = async (): Promise<{ chromaClient: any; mongoClient: any }> => {
    console.log('[DUALSTORE SETUP] Connecting to clients...');

    const chromaClient = await getChromaClient();
    console.log('[DUALSTORE SETUP] Chroma client connected');
    console.log(`[DUALSTORE SETUP] Chroma client type: ${typeof chromaClient}`);

    const mongoClient = await getMongoClient();
    console.log('[DUALSTORE SETUP] MongoDB client connected');
    console.log(`[DUALSTORE SETUP] MongoDB client type: ${typeof mongoClient}`);
    console.log(`[DUALSTORE SETUP] MongoDB client constructor: ${mongoClient.constructor?.name || 'unknown'}`);

    // Test client connection
    try {
        const pingResult = await mongoClient.db('admin').command({ ping: 1 });
        console.log(`[DUALSTORE SETUP] MongoDB ping successful:`, pingResult);
    } catch (error) {
        console.error(`[DUALSTORE SETUP] MongoDB ping failed:`, error);
    }

    return { chromaClient, mongoClient };
};

const lookupAlias = async (db: { collection(name: string): any }, family: string) => {
    console.log(`[DualStoreManager] Looking up alias for ${family}`);
    const aliases = db.collection('collection_aliases');
    const alias = await aliases.findOne({ _id: family });
    console.log('[DualStoreManager] Alias lookup complete');
    return alias;
};

const createEmbeddingFunction = (alias: any) => {
    const embedFnName = alias?.embed?.fn ?? process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text';
    return alias?.embed
        ? RemoteEmbeddingFunction.fromConfig({
              driver: alias.embed.driver,
              fn: alias.embed.fn,
          })
        : RemoteEmbeddingFunction.fromConfig({
              driver: process.env.EMBEDDING_DRIVER ?? 'ollama',
              fn: embedFnName,
          });
};

const setupCollections = async (
    chromaClient: any,
    db: { collection(name: string): any },
    family: string,
    alias: any,
    embeddingFn: any,
): Promise<{ chromaCollection: ChromaCollection; mongoCollection: any }> => {
    console.log(`[DUALSTORE SETUP] Creating collections for family: ${family}`);

    const chromaCollection: ChromaCollection = await chromaClient.getOrCreateCollection({
        name: alias?.target ?? family,
        embeddingFunction: embeddingFn,
    });
    console.log(`[DUALSTORE SETUP] Chroma collection created: ${alias?.target ?? family}`);

    console.log(`[DUALSTORE SETUP] Creating MongoDB collection: ${family}`);
    console.log(`[DUALSTORE SETUP] Database object type: ${typeof db}`);
    console.log(`[DUALSTORE SETUP] Database constructor: ${db.constructor?.name || 'unknown'}`);

    const mongoCollection = db.collection(family);
    console.log(`[DUALSTORE SETUP] MongoDB collection created`);
    console.log(`[DUALSTORE SETUP] Collection type: ${typeof mongoCollection}`);
    console.log(`[DUALSTORE SETUP] Collection constructor: ${mongoCollection.constructor?.name || 'unknown'}`);

    return { chromaCollection, mongoCollection };
};

export const createDualStoreManagerDependencies = async <TextKey extends string, TimeKey extends string>(
    name: string,
    textKey: TextKey,
    timeStampKey: TimeKey,
    options?: {
        agentName?: string;
        databaseName?: string;
    },
): Promise<DualStoreManagerDependencies<TextKey, TimeKey>> => {
    console.log(`[DUALSTORE CREATE] Creating store for ${name}...`);
    console.log(`[DUALSTORE CREATE] TextKey: ${String(textKey)}, TimeKey: ${String(timeStampKey)}`);

    const { chromaClient, mongoClient } = await setupClients();
    console.log(`[DUALSTORE CREATE] Clients setup complete`);

    const agentName = options?.agentName ?? AGENT_NAME;
    const databaseName = options?.databaseName ?? 'database';
    const family = `${agentName}_${name}`;
    console.log(`[DUALSTORE CREATE] Accessing database: ${databaseName}, collection family: ${family}`);

    const db = mongoClient.db(databaseName);
    console.log(`[DUALSTORE CREATE] Database reference created, type: ${typeof db}`);
    console.log(`[DUALSTORE CREATE] MongoDB client state: ${mongoClient.s?.serverDescription?.host || 'unknown'}`);

    const alias = await lookupAlias(db, family);
    console.log(`[DUALSTORE CREATE] Alias lookup complete`);

    const embedFnName = alias?.embed?.fn ?? process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text';
    const embeddingFn = createEmbeddingFunction(alias);

    const { chromaCollection, mongoCollection } = await setupCollections(chromaClient, db, family, alias, embeddingFn);
    console.log(`[DUALSTORE CREATE] Collections created`);
    console.log(`[DUALSTORE CREATE] Mongo collection type: ${typeof mongoCollection}`);
    console.log(`[DUALSTORE CREATE] Mongo collection constructor: ${mongoCollection.constructor.name}`);
    console.log(`[DUALSTORE CREATE] Chroma collection type: ${typeof chromaCollection}`);

    const supportsImages = !embedFnName.toLowerCase().includes('text');
    const result = {
        name: family,
        agent_name: AGENT_NAME ?? 'default_agent',
        embedding_fn: embedFnName,
        chromaCollection,
        mongoCollection,
        textKey,
        timeStampKey,
        supportsImages,
    };

    console.log(`[DUALSTORE CREATE] Dependencies created successfully for store: ${result.name}`);
    return result;
};
