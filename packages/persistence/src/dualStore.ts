import { randomUUID } from 'node:crypto';

import type { Collection as ChromaCollection, Metadata as ChromaMetadata, Where } from 'chromadb';
import type { Collection, Filter, OptionalUnlessRequiredId, Sort, WithId } from 'mongodb';
import { AGENT_NAME } from '@promethean/legacy/env.js';

import type { DualStoreEntry } from './types.js';
import {
    createDualStoreManagerDependencies,
    toEpochMilliseconds,
    pickTimestamp,
    withTimestampMetadata,
    toChromaMetadata,
    cloneMetadata,
    toGenericEntry,
    createDefaultMongoFilter,
    createDefaultSorter,
} from './dualStoreHelpers.js';
import type { DualStoreManagerDependencies } from './dualStoreHelpers.js';

type QueryArgs = Parameters<ChromaCollection['query']>[0];

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
    console.log(`[DUALSTORE INSERT] Starting insert for store: ${state.name}`);
    console.log(`[DUALSTORE INSERT] Entry ID: ${entry.id}, TextKey: ${state.textKey}, TimeKey: ${state.timeStampKey}`);

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

    console.log(`[DUALSTORE INSERT] Prepared entry with ID: ${id}, timestamp: ${timestamp}`);

    const dualWriteEnabled = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
    const isImage = metadata.type === 'image';

    if (dualWriteEnabled && (!isImage || state.supportsImages)) {
        console.log(`[DUALSTORE INSERT] Adding to Chroma collection...`);
        await state.chromaCollection.add({
            ids: [id],
            documents: [preparedEntry[state.textKey]],
            metadatas: [toChromaMetadata(metadata)],
        });
        console.log(`[DUALSTORE INSERT] Chroma insert complete`);
    }

    console.log(`[DUALSTORE INSERT] About to insert into MongoDB...`);
    console.log(`[DUALSTORE INSERT] Mongo collection type: ${typeof state.mongoCollection}`);
    console.log(`[DUALSTORE INSERT] Mongo collection constructor: ${state.mongoCollection.constructor.name}`);

    try {
        await state.mongoCollection.insertOne(
            preparedEntry as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>,
        );
        console.log(`[DUALSTORE INSERT] MongoDB insert complete`);
    } catch (error) {
        console.error(`[DUALSTORE INSERT] MongoDB insert failed:`, error);
        console.error(`[DUALSTORE INSERT] Error details:`, {
            message: error instanceof Error ? error.message : String(error),
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : 'No stack trace',
        });
        throw error;
    }
};

// TODO: remove in future – alias for backwards compatibility
export const addEntry = insert;

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
// eslint-disable-next-line no-restricted-syntax
export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    private readonly state: DualStoreManagerState<TextKey, TimeKey>;

    private constructor(state: DualStoreManagerState<TextKey, TimeKey>) {
        this.state = state;
        // Emit deprecation warning on class instantiation
        console.warn(
            '[DEPRECATED] DualStoreManager class is deprecated. ' +
                "Use the standalone functions from './dualStore.js' instead.",
        );
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
        console.warn(
            '[DEPRECATED] DualStoreManager.create() is deprecated. ' +
                "Use the standalone create() function from './dualStore.js' instead.",
        );
        const state = await create(name, textKey, timeStampKey, options);
        return new DualStoreManager(state);
    }

    get name(): string {
        console.warn(
            '[DEPRECATED] DualStoreManager.name property is deprecated. ' +
                'Access name property from DualStoreManagerState directly.',
        );
        return this.state.name;
    }

    get dualStoreState(): DualStoreManagerState<TextKey, TimeKey> {
        // Provide access to state for migration to standalone functions
        return this.state;
    }

    get agent_name(): string {
        console.warn(
            '[DEPRECATED] DualStoreManager.agent_name property is deprecated. ' +
                'Access the agent_name property from the DualStoreManagerState directly.',
        );
        return this.state.agent_name;
    }

    get embedidng_fn(): string {
        console.warn(
            '[DEPRECATED] DualStoreManager.embedidng_fn property is deprecated. ' +
                'Access the embedding_fn property from the DualStoreManagerState directly.',
        );
        return this.state.embedding_fn;
    }

    getMongoCollection(): Collection<DualStoreEntry<TextKey, TimeKey>> {
        console.warn(
            '[DEPRECATED] DualStoreManager.getMongoCollection() is deprecated. ' +
                "Use the standalone getMongoCollection() function from './dualStore.js' instead.",
        );
        return getMongoCollection(this.state);
    }

    getChromaCollection(): ChromaCollection {
        console.warn(
            '[DEPRECATED] DualStoreManager.getChromaCollection() is deprecated. ' +
                "Use the standalone getChromaCollection() function from './dualStore.js' instead.",
        );
        return getChromaCollection(this.state);
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        console.warn(
            '[DEPRECATED] DualStoreManager.insert() is deprecated. ' +
                "Use the standalone insert() function from './dualStore.js' instead.",
        );
        await insert(this.state, entry);
    }

    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        console.warn(
            '[DEPRECATED] DualStoreManager.addEntry() is deprecated. ' +
                "Use the standalone addEntry() function from './dualStore.js' instead.",
        );
        await addEntry(this.state, entry);
    }

    async getMostRecent(
        limit = 10,
        mongoFilter?: Filter<DualStoreEntry<TextKey, TimeKey>>,
        sorter?: Sort,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        console.warn(
            '[DEPRECATED] DualStoreManager.getMostRecent() is deprecated. ' +
                "Use the standalone getMostRecent() function from './dualStore.js' instead.",
        );
        return getMostRecent(this.state, limit, mongoFilter, sorter);
    }

    async getMostRelevant(
        queryTexts: readonly string[],
        limit: number,
        where?: Where,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        console.warn(
            '[DEPRECATED] DualStoreManager.getMostRelevant() is deprecated. ' +
                "Use the standalone getMostRelevant() function from './dualStore.js' instead.",
        );
        return getMostRelevant(this.state, queryTexts, limit, where);
    }

    async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
        console.warn(
            '[DEPRECATED] DualStoreManager.get() is deprecated. ' +
                "Use the standalone get() function from './dualStore.js' instead.",
        );
        return get(this.state, id);
    }

    async cleanup(): Promise<void> {
        console.warn(
            '[DEPRECATED] DualStoreManager.cleanup() is deprecated. ' +
                "Use the standalone cleanup() function from './dualStore.js' instead.",
        );
        await cleanup();
    }
}

// Re-export helper functions for external use
export { createDualStoreManagerDependencies } from './dualStoreHelpers.js';
