import { randomUUID } from 'node:crypto';

import type { Collection as ChromaCollection, Metadata as ChromaMetadata, Where } from 'chromadb';
import { RemoteEmbeddingFunction } from '@promethean/embedding';
import type { Collection, Filter, OptionalUnlessRequiredId, Sort, WithId } from 'mongodb';
import { AGENT_NAME } from '@promethean/legacy/env.js';

import type { DualStoreEntry, AliasDoc, DualStoreMetadata, DualStoreTimestamp } from './types.js';
import { getChromaClient, getMongoClient } from './clients.js';

const toEpochMilliseconds = (timestamp: DualStoreTimestamp | undefined): number => {
    if (timestamp instanceof Date) return timestamp.getTime();
    if (typeof timestamp === 'string') return new Date(timestamp).getTime();
    if (typeof timestamp === 'number') return timestamp;
    return Date.now();
};

const pickTimestamp = (...candidates: readonly unknown[]): DualStoreTimestamp | undefined => {
    for (const candidate of candidates) {
        if (candidate instanceof Date || typeof candidate === 'number' || typeof candidate === 'string') {
            return candidate;
        }
    }
    return undefined;
};

const withTimestampMetadata = (
    metadata: DualStoreMetadata | undefined,
    timeStampKey: string,
    timestamp: number,
): DualStoreMetadata => ({
    ...(metadata ?? {}),
    [timeStampKey]: timestamp,
});

const toChromaMetadata = (metadata: DualStoreMetadata): ChromaMetadata => {
    const result: Record<string, boolean | number | string | null> = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (value === null) {
            result[key] = null;
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            result[key] = value;
        }
    }
    return result;
};

const cloneMetadata = (metadata: ChromaMetadata | null | undefined): DualStoreMetadata | undefined =>
    metadata ? { ...metadata } : undefined;

const toGenericEntry = <TextKey extends string, TimeKey extends string>(
    entry: DualStoreEntry<TextKey, TimeKey> | WithId<DualStoreEntry<TextKey, TimeKey>>,
    textKey: TextKey,
    timeStampKey: TimeKey,
): DualStoreEntry<'text', 'timestamp'> => {
    const metadata = entry.metadata;
    const timestampSource = pickTimestamp(metadata?.[timeStampKey], metadata?.timeStamp, entry[timeStampKey]);

    return {
        id: entry.id,
        text: entry[textKey],
        timestamp: toEpochMilliseconds(timestampSource),
        metadata,
    };
};

type QueryArgs = Parameters<ChromaCollection['query']>[0];

type DualStoreManagerDependencies<TextKey extends string, TimeKey extends string> = {
    readonly name: string;
    readonly agent_name: string;
    readonly embedding_fn: string;
    readonly chromaCollection: ChromaCollection;
    readonly mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    readonly textKey: TextKey;
    readonly timeStampKey: TimeKey;
    readonly supportsImages: boolean;
};

export type DualStoreManagerState<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
    readonly name: string;
    readonly chromaCollection: ChromaCollection;
    readonly mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    readonly agent_name: string;
    readonly embedding_fn: string;
    readonly textKey: TextKey;
    readonly timeStampKey: TimeKey;
    readonly supportsImages: boolean;
};

const createDualStoreManagerState = <TextKey extends string, TimeKey extends string>({
    name,
    agent_name = AGENT_NAME ?? 'default_agent',
    embedding_fn = process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text',
    chromaCollection,
    mongoCollection,
    textKey,
    timeStampKey,
    supportsImages,
}: DualStoreManagerDependencies<TextKey, TimeKey>): DualStoreManagerState<TextKey, TimeKey> => ({
    name,
    agent_name,
    embedding_fn,
    chromaCollection,
    mongoCollection,
    textKey,
    timeStampKey,
    supportsImages,
});

const createDualStoreManagerDependencies = async <TextKey extends string, TimeKey extends string>(
    name: string,
    textKey: TextKey,
    timeStampKey: TimeKey,
    options?: {
        agentName?: string;
        databaseName?: string;
    },
): Promise<DualStoreManagerDependencies<TextKey, TimeKey>> => {
    console.log(`[DualStoreManager] Creating store for ${name}...`);
    const chromaClient = await getChromaClient();
    console.log(`[DualStoreManager] Chroma client connected`);
    const mongoClient = await getMongoClient();
    console.log(`[DualStoreManager] MongoDB client connected`);
    const agentName = options?.agentName ?? AGENT_NAME;
    const databaseName = options?.databaseName ?? 'database';
    const family = `${agentName}_${name}`;
    console.log(`[DualStoreManager] Accessing database: ${databaseName}, collection family: ${family}`);
    const db = mongoClient.db(databaseName);
    const aliases = db.collection<AliasDoc>('collection_aliases');
    console.log(`[DualStoreManager] Looking up alias for ${family}`);
    const alias = await aliases.findOne({ _id: family });
    console.log(`[DualStoreManager] Alias lookup complete`);

    const embedFnName = alias?.embed?.fn ?? process.env.EMBEDDING_FUNCTION ?? 'nomic-embed-text';
    const embeddingFn = alias?.embed
        ? RemoteEmbeddingFunction.fromConfig({
              driver: alias.embed.driver,
              fn: alias.embed.fn,
          })
        : RemoteEmbeddingFunction.fromConfig({
              driver: process.env.EMBEDDING_DRIVER ?? 'ollama',
              fn: embedFnName,
          });

    const chromaCollection: ChromaCollection = await chromaClient.getOrCreateCollection({
        name: alias?.target ?? family,
        embeddingFunction: embeddingFn,
    });

    const mongoCollection = db.collection<DualStoreEntry<TextKey, TimeKey>>(family);

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

export const create = async <TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    name: string,
    textKey: TextKey,
    timeStampKey: TimeKey,
    options?: {
        agentName?: string;
        databaseName?: string;
    },
): Promise<DualStoreManagerState<TextKey, TimeKey>> => {
    try {
        const dependencies = await createDualStoreManagerDependencies(name, textKey, timeStampKey, options);
        return createDualStoreManagerState(dependencies);
    } catch (error) {
        console.error('Failed to create DualStoreManager:', error);
        throw error;
    }
};

export const getMongoCollection = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): Collection<DualStoreEntry<TextKey, TimeKey>> => state.mongoCollection;

export const getChromaCollection = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): ChromaCollection => state.chromaCollection;

export const insert = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    entry: DualStoreEntry<TextKey, TimeKey>,
): Promise<void> => {
    const id = entry.id ?? randomUUID();
    const timestampCandidate = pickTimestamp(
        entry[state.timeStampKey],
        entry.metadata?.[state.timeStampKey],
        entry.metadata?.timeStamp,
    );
    const timestamp = toEpochMilliseconds(timestampCandidate);
    const metadata = withTimestampMetadata(entry.metadata, state.timeStampKey, timestamp);

    const preparedEntry = {
        ...entry,
        id,
        [state.timeStampKey]: timestamp,
        metadata,
    };

    const dualWriteEnabled = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
    const isImage = metadata.type === 'image';

    if (dualWriteEnabled && (!isImage || state.supportsImages)) {
        await state.chromaCollection.add({
            ids: [id],
            documents: [preparedEntry[state.textKey]],
            metadatas: [toChromaMetadata(metadata)],
        });
    }

    await state.mongoCollection.insertOne(preparedEntry as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>);
};

// TODO: remove in future – alias for backwards compatibility
export const addEntry = insert;

const createDefaultMongoFilter = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): Filter<DualStoreEntry<TextKey, TimeKey>> => {
    const textCondition = {
        $exists: true,
        $regex: '\\S',
    };

    return {
        [state.textKey]: textCondition,
    } as Filter<DualStoreEntry<TextKey, TimeKey>>;
};

const createDefaultSorter = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): Sort => ({ [state.timeStampKey]: -1 }) satisfies Sort;

export const getMostRecent = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    limit = 10,
    mongoFilter: Filter<DualStoreEntry<TextKey, TimeKey>> = createDefaultMongoFilter(state),
    sorter: Sort = createDefaultSorter(state),
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    const documents = await state.mongoCollection.find(mongoFilter).sort(sorter).limit(limit).toArray();
    return documents
        .map((entry: WithId<DualStoreEntry<TextKey, TimeKey>>) =>
            toGenericEntry(entry, state.textKey, state.timeStampKey),
        )
        .filter((entry) => typeof entry.text === 'string' && entry.text.trim().length > 0);
};

export const getMostRelevant = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    queryTexts: readonly string[],
    limit: number,
    where?: Where,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    if (queryTexts.length === 0) {
        return [];
    }

    const queryOptions: QueryArgs = {
        queryTexts: [...queryTexts],
        nResults: limit,
        include: ['documents', 'metadatas'],
        ...(where && Object.keys(where).length > 0 ? { where } : {}),
    };

    const queryResult = await state.chromaCollection.query<ChromaMetadata>(queryOptions);
    const rows = queryResult.rows().flat();

    return rows
        .map((row) => {
            if (!row.document) {
                return undefined;
            }

            const metadata = cloneMetadata(row.metadata);
            const timestampSource = pickTimestamp(metadata?.[state.timeStampKey], metadata?.timeStamp);

            const entry: DualStoreEntry<'text', 'timestamp'> = {
                id: row.id,
                text: row.document,
                metadata,
                timestamp: toEpochMilliseconds(timestampSource),
            };

            return entry;
        })
        .filter((entry): entry is DualStoreEntry<'text', 'timestamp'> => entry !== undefined)
        .filter((entry, index, array) => array.findIndex((candidate) => candidate.text === entry.text) === index);
};

export const get = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    id: string,
): Promise<DualStoreEntry<'text', 'timestamp'> | null> => {
    const filter = { id } as Filter<DualStoreEntry<TextKey, TimeKey>>;

    const document = await state.mongoCollection.findOne(filter);

    if (!document) {
        return null;
    }

    return toGenericEntry(document, state.textKey, state.timeStampKey);
};

export const cleanup = async (): Promise<void> => {
    try {
        // Close cached MongoDB connection
        const { cleanupClients } = await import('./clients.js');
        await cleanupClients();
    } catch (error) {
        // Ignore cleanup errors - connection might already be closed
    }
};

// Legacy class-based API for backward compatibility
export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    private readonly state: DualStoreManagerState<TextKey, TimeKey>;

    private constructor(state: DualStoreManagerState<TextKey, TimeKey>) {
        this.state = state;
    }

    static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(
        name: string,
        textKey: TTextKey,
        timeStampKey: TTimeKey,
        options?: {
            agentName?: string;
            databaseName?: string;
        },
    ): Promise<DualStoreManager<TTextKey, TTimeKey>> {
        const state = await create(name, textKey, timeStampKey, options);
        return new DualStoreManager(state);
    }

    get name(): string {
        return this.state.name;
    }

    get agent_name(): string {
        return this.state.agent_name;
    }

    get embedidng_fn(): string {
        return this.state.embedding_fn;
    }

    getMongoCollection(): Collection<DualStoreEntry<TextKey, TimeKey>> {
        return getMongoCollection(this.state);
    }

    getChromaCollection(): ChromaCollection {
        return getChromaCollection(this.state);
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        await insert(this.state, entry);
    }

    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        await addEntry(this.state, entry);
    }

    async getMostRecent(
        limit = 10,
        mongoFilter?: Filter<DualStoreEntry<TextKey, TimeKey>>,
        sorter?: Sort,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        return getMostRecent(this.state, limit, mongoFilter, sorter);
    }

    async getMostRelevant(
        queryTexts: readonly string[],
        limit: number,
        where?: Where,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        return getMostRelevant(this.state, queryTexts, limit, where);
    }

    async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
        return get(this.state, id);
    }

    async cleanup(): Promise<void> {
        await cleanup();
    }
}
