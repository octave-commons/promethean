import type { Collection as ChromaCollection, Metadata as ChromaMetadata } from 'chromadb';
import type { Collection } from 'mongodb';
import { RemoteEmbeddingFunction } from '@promethean/embedding';
import { AGENT_NAME } from '@promethean/legacy/env.js';

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
    console.log('[DualStoreManager] Connecting to clients...');
    const chromaClient = await getChromaClient();
    console.log('[DualStoreManager] Chroma client connected');
    const mongoClient = await getMongoClient();
    console.log('[DualStoreManager] MongoDB client connected');
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
    const chromaCollection: ChromaCollection = await chromaClient.getOrCreateCollection({
        name: alias?.target ?? family,
        embeddingFunction: embeddingFn,
    });

    const mongoCollection = db.collection(family);
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
    console.log(`[DualStoreManager] Creating store for ${name}...`);

    const { chromaClient, mongoClient } = await setupClients();

    const agentName = options?.agentName ?? AGENT_NAME;
    const databaseName = options?.databaseName ?? 'database';
    const family = `${agentName}_${name}`;
    console.log(`[DualStoreManager] Accessing database: ${databaseName}, collection family: ${family}`);

    const db = mongoClient.db(databaseName);
    const alias = await lookupAlias(db, family);

    const embedFnName = alias?.embed?.fn ?? process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text';
    const embeddingFn = createEmbeddingFunction(alias);

    const { chromaCollection, mongoCollection } = await setupCollections(chromaClient, db, family, alias, embeddingFn);

    const supportsImages = !embedFnName.toLowerCase().includes('text');
    return {
        name: family,
        agent_name: AGENT_NAME ?? 'default_agent',
        embedding_fn: embedFnName,
        chromaCollection,
        mongoCollection,
        textKey,
        timeStampKey,
        supportsImages,
    };
};
