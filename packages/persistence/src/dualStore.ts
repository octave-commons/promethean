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
    readonly chromaCollection: ChromaCollection;
    readonly mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    readonly textKey: TextKey;
    readonly timeStampKey: TimeKey;
    readonly supportsImages: boolean;
};

export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    public readonly name: string;
    private readonly chromaCollection: ChromaCollection;
    private readonly mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    private readonly textKey: TextKey;
    private readonly timeStampKey: TimeKey;
    private readonly supportsImages: boolean;

    private constructor({
        name,
        chromaCollection,
        mongoCollection,
        textKey,
        timeStampKey,
        supportsImages,
    }: DualStoreManagerDependencies<TextKey, TimeKey>) {
        this.name = name;
        this.chromaCollection = chromaCollection;
        this.mongoCollection = mongoCollection;
        this.textKey = textKey;
        this.timeStampKey = timeStampKey;
        this.supportsImages = supportsImages;
    }

    static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(
        name: string,
        textKey: TTextKey,
        timeStampKey: TTimeKey,
    ): Promise<DualStoreManager<TTextKey, TTimeKey>> {
        const chromaClient = await getChromaClient();
        const mongoClient = await getMongoClient();
        const family = `${AGENT_NAME}_${name}`;
        const db = mongoClient.db('database');
        const aliases = db.collection<AliasDoc>('collection_aliases');
        const alias = await aliases.findOne({ _id: family });

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

        const chromaCollection = await chromaClient.getOrCreateCollection({
            name: alias?.target ?? family,
            embeddingFunction: embeddingFn,
        });

        const mongoCollection = db.collection<DualStoreEntry<TTextKey, TTimeKey>>(family);

        const supportsImages = !embedFnName.toLowerCase().includes('text');
        return new DualStoreManager({
            name: family,
            chromaCollection,
            mongoCollection,
            textKey,
            timeStampKey,
            supportsImages,
        });
    }

    getMongoCollection(): Collection<DualStoreEntry<TextKey, TimeKey>> {
        return this.mongoCollection;
    }

    getChromaCollection(): ChromaCollection {
        return this.chromaCollection;
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        const id = entry.id ?? randomUUID();
        const timestampCandidate = pickTimestamp(
            entry[this.timeStampKey],
            entry.metadata?.[this.timeStampKey],
            entry.metadata?.timeStamp,
        );
        const timestamp = toEpochMilliseconds(timestampCandidate);
        const metadata = withTimestampMetadata(entry.metadata, this.timeStampKey, timestamp);

        const preparedEntry: DualStoreEntry<TextKey, TimeKey> = {
            ...entry,
            id,
            [this.timeStampKey]: timestamp,
            metadata,
        };

        const dualWriteEnabled = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
        const isImage = metadata.type === 'image';

        if (dualWriteEnabled && (!isImage || this.supportsImages)) {
            try {
                await this.chromaCollection.add({
                    ids: [id],
                    documents: [preparedEntry[this.textKey]],
                    metadatas: [toChromaMetadata(metadata)],
                });
            } catch (error) {
                console.warn('Failed to embed entry', error);
            }
        }

        const mongoDocument = preparedEntry as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>;
        await this.mongoCollection.insertOne(mongoDocument);
    }

    // TODO: remove in future – alias for backwards compatibility
    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        await this.insert(entry);
    }

    private createDefaultMongoFilter(): Filter<DualStoreEntry<TextKey, TimeKey>> {
        return {
            [this.textKey]: { $nin: [null, ''], $not: /^\s*$/ },
        } as Filter<DualStoreEntry<TextKey, TimeKey>>;
    }

    private createDefaultSorter(): Sort {
        return { [this.timeStampKey]: -1 } satisfies Sort;
    }

    async getMostRecent(
        limit = 10,
        mongoFilter: Filter<DualStoreEntry<TextKey, TimeKey>> = this.createDefaultMongoFilter(),
        sorter: Sort = this.createDefaultSorter(),
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        const documents = await this.mongoCollection.find(mongoFilter).sort(sorter).limit(limit).toArray();
        return documents
            .map((entry: WithId<DualStoreEntry<TextKey, TimeKey>>) =>
                toGenericEntry(entry, this.textKey, this.timeStampKey),
            )
            .filter((entry) => typeof entry.text === 'string' && entry.text.trim().length > 0);
    }

    async getMostRelevant(
        queryTexts: readonly string[],
        limit: number,
        where?: Where,
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        if (queryTexts.length === 0) {
            return [];
        }

        const queryOptions: QueryArgs = {
            queryTexts: [...queryTexts],
            nResults: limit,
            include: ['documents', 'metadatas'],
            ...(where && Object.keys(where).length > 0 ? { where } : {}),
        };

        const queryResult = await this.chromaCollection.query(queryOptions);
        const rows = queryResult.rows().flat();

        const entries = rows.flatMap((row) => {
            if (typeof row.document !== 'string') {
                return [] as const;
            }

            const metadata = cloneMetadata(row.metadata as ChromaMetadata | null | undefined);
            const timestampSource = pickTimestamp(metadata?.[this.timeStampKey], metadata?.timeStamp);

            const result: DualStoreEntry<'text', 'timestamp'> = {
                id: row.id,
                text: row.document,
                metadata,
                timestamp: toEpochMilliseconds(timestampSource),
            };

            return [result] as const;
        });

        return entries.filter(
            (entry, index, array) => array.findIndex((candidate) => candidate.text === entry.text) === index,
        );
    }
}
