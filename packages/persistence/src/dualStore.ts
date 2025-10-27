import type { Collection as ChromaCollection } from 'chromadb';

import { RemoteEmbeddingFunction } from '@promethean-os/embedding';
import type { Collection, OptionalUnlessRequiredId, WithId } from 'mongodb';

import { randomUUID } from 'node:crypto';
import type { DualStoreEntry, AliasDoc, DualStoreMetadata } from './types.js';
import { getChromaClient, getMongoClient, validateMongoConnection } from './clients.js';
import { getOrCreateQueue } from './chroma-write-queue.js';

export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    name: string;
    chromaCollection: ChromaCollection;
    mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;
    private chromaWriteQueue: ReturnType<typeof getOrCreateQueue>;

    constructor(
        name: string,
        chromaCollection: ChromaCollection,
        mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>,
        textKey: TextKey,
        timeStampKey: TimeKey,
        supportsImages = false,
    ) {
        this.name = name;
        this.chromaCollection = chromaCollection;
        this.mongoCollection = mongoCollection;
        this.textKey = textKey;
        this.timeStampKey = timeStampKey;
        this.supportsImages = supportsImages;
        this.chromaWriteQueue = getOrCreateQueue(name, chromaCollection);
    }

    static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(
        name: string,
        textKey: TTextKey,
        timeStampKey: TTimeKey,
    ): Promise<DualStoreManager<TTextKey, TTimeKey>> {
        const chromaClient = await getChromaClient();
        const mongoClient = await getMongoClient();
        const family = `${process.env.AGENT_NAME || 'duck'}_${name}`;
        const db = mongoClient.db('database');
        const aliases = db.collection<AliasDoc>('collection_aliases');
        const alias = await aliases.findOne({ _id: family });

        const embedFnName = alias?.embed?.fn || process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
        const embeddingFn = alias?.embed
            ? RemoteEmbeddingFunction.fromConfig({
                  driver: alias.embed.driver,
                  fn: alias.embed.fn,
              })
            : RemoteEmbeddingFunction.fromConfig({
                  driver: process.env.EMBEDDING_DRIVER || 'ollama',
                  fn: embedFnName,
              });

        const chromaCollection = await chromaClient.getOrCreateCollection({
            name: alias?.target || family,
            embeddingFunction: embeddingFn,
        });

        const mongoCollection = db.collection<DualStoreEntry<TTextKey, TTimeKey>>(family);

        const supportsImages = !embedFnName.toLowerCase().includes('text');
        return new DualStoreManager(family, chromaCollection, mongoCollection, textKey, timeStampKey, supportsImages);
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        const id = entry.id ?? randomUUID();
        const timestamp =
            entry[this.timeStampKey] || (Date.now() as unknown as DualStoreEntry<TextKey, TimeKey>[TimeKey]);

        const mutableEntry = {
            ...entry,
            id,
            [this.timeStampKey]: timestamp,
            metadata: {
                ...entry.metadata,
                [this.timeStampKey]: timestamp,
            },
        };

        const dualWrite = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
        const isImage = mutableEntry.metadata?.type === 'image';
        let vectorWriteSuccess = true;
        let vectorWriteError: Error | null = null;

        if (dualWrite && (!isImage || this.supportsImages)) {
            try {
                const chromaMetadata: Record<string, string | number | boolean | null> = {};
                if (mutableEntry.metadata) {
                    for (const [key, value] of Object.entries(mutableEntry.metadata)) {
                        if (value === null || value === undefined) {
                            chromaMetadata[key] = null;
                        } else if (
                            typeof value === 'string' ||
                            typeof value === 'number' ||
                            typeof value === 'boolean'
                        ) {
                            chromaMetadata[key] = value;
                        } else {
                            chromaMetadata[key] = JSON.stringify(value);
                        }
                    }
                }

                await this.chromaWriteQueue.add(id, mutableEntry[this.textKey], chromaMetadata);
            } catch (e) {
                vectorWriteSuccess = false;
                vectorWriteError = e instanceof Error ? e : new Error(String(e));

                console.error('Vector store write failed for entry', {
                    id,
                    collection: this.name,
                    error: vectorWriteError.message,
                    stack: vectorWriteError.stack,
                    metadata: mutableEntry.metadata,
                });

                const consistencyLevel = process.env.DUAL_WRITE_CONSISTENCY || 'eventual';
                if (consistencyLevel === 'strict') {
                    throw new Error(`Critical: Vector store write failed for entry ${id}: ${vectorWriteError.message}`);
                }
            }
        }

        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        const enhancedMetadata: DualStoreMetadata = {
            ...mutableEntry.metadata,
            vectorWriteSuccess,
            vectorWriteError: vectorWriteError?.message,
            vectorWriteTimestamp: vectorWriteSuccess ? Date.now() : null,
        };

        await collection.insertOne({
            id: mutableEntry.id,
            [this.textKey]: mutableEntry[this.textKey],
            [this.timeStampKey]: mutableEntry[this.timeStampKey],
            metadata: enhancedMetadata,
        } as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>);
    }

    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        return this.insert(entry);
    }

    async getMostRecent(
        limit = 10,
        mongoFilter: Record<string, unknown> = { [this.textKey]: { $nin: [null, ''], $not: /^\s*$/ } },
        sorter: Record<string, unknown> = { [this.timeStampKey]: -1 },
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        return (await collection.find(mongoFilter).sort(sorter).limit(limit).toArray()).map(
            (entry: WithId<DualStoreEntry<TextKey, TimeKey>>) => ({
                id: entry.id,
                text: (entry as Record<TextKey, unknown>)[this.textKey] as string,
                timestamp: new Date((entry as Record<TimeKey, unknown>)[this.timeStampKey] as string).getTime(),
                metadata: entry.metadata,
            }),
        ) as DualStoreEntry<'text', 'timestamp'>[];
    }

    async getMostRelevant(
        queryTexts: string[],
        limit: number,
        where: Record<string, unknown> = {},
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        if (!queryTexts || queryTexts.length === 0) return Promise.resolve([]);

        const query: Record<string, unknown> = {
            queryTexts,
            nResults: limit,
        };
        if (where && Object.keys(where).length > 0) query.where = where;
        const queryResult = await this.chromaCollection.query(query);
        const uniqueThoughts = new Set<string>();
        const ids = queryResult.ids.flat(2);
        const meta = queryResult.metadatas.flat(2);
        return queryResult.documents
            .flat(2)
            .map((doc, i) => ({
                id: ids[i],
                text: doc,
                metadata: meta[i],
                timestamp: meta[i]?.timeStamp || meta[i]?.[this.timeStampKey] || Date.now(),
            }))
            .filter((doc) => {
                if (!doc.text) return false;
                if (uniqueThoughts.has(doc.text)) return false;
                uniqueThoughts.add(doc.text);
                return true;
            }) as DualStoreEntry<'text', 'timestamp'>[];
    }

    async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
        const filter = { id } as Record<string, unknown>;

        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        const document = await collection.findOne(filter);

        if (!document) {
            return null;
        }

        return {
            id: document.id,
            text: (document as Record<TextKey, unknown>)[this.textKey] as string,
            timestamp: new Date((document as Record<TimeKey, unknown>)[this.timeStampKey] as string).getTime(),
            metadata: document.metadata,
        } as DualStoreEntry<'text', 'timestamp'>;
    }

    async cleanup(): Promise<void> {
        try {
            await this.chromaWriteQueue.shutdown();
            const { cleanupClients } = await import('./clients.js');
            await cleanupClients();
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}
