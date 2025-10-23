import type { Collection as ChromaCollection } from 'chromadb';

import { RemoteEmbeddingFunction } from '@promethean/embedding';
import type { Collection, OptionalUnlessRequiredId, WithId } from 'mongodb';
import { AGENT_NAME } from '@promethean/legacy/env.js';
import { randomUUID } from 'node:crypto';
import type { DualStoreEntry, AliasDoc } from './types.js';
import { getChromaClient, getMongoClient } from './clients.js';

export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    name: string;
    chromaCollection: ChromaCollection;
    mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;

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
    }

    static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(
        name: string,
        textKey: TTextKey,
        timeStampKey: TTimeKey,
    ) {
        const chromaClient = await getChromaClient();
        const mongoClient = await getMongoClient();
        const family = `${AGENT_NAME}_${name}`;
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

    async insert(entry: DualStoreEntry<TextKey, TimeKey>) {
        const id = entry.id ?? randomUUID();
        const timestamp =
            entry[this.timeStampKey] || (Date.now() as unknown as DualStoreEntry<TextKey, TimeKey>[TimeKey]);

        // Create mutable copy to work with readonly types
        const mutableEntry = {
            ...entry,
            id,
            [this.timeStampKey]: timestamp,
            metadata: {
                ...entry.metadata,
                [this.timeStampKey]: timestamp,
            },
        };

        // console.log("Adding entry to collection", this.name, entry);

        const dualWrite = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
        const isImage = mutableEntry.metadata?.type === 'image';
        if (dualWrite && (!isImage || this.supportsImages)) {
            try {
                await this.chromaCollection.add({
                    ids: [id],
                    documents: [mutableEntry[this.textKey]],
                    metadatas: [mutableEntry.metadata as any], // Cast to any for Chroma compatibility
                });
            } catch (e) {
                console.warn('Failed to embed entry', e);
            }
        }

        await this.mongoCollection.insertOne({
            id: mutableEntry.id,
            [this.textKey]: mutableEntry[this.textKey],
            [this.timeStampKey]: mutableEntry[this.timeStampKey],
            metadata: mutableEntry.metadata,
        } as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>);
    }

    // TODO: remove in future – alias for backwards compatibility
    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>) {
        return this.insert(entry);
    }

    async getMostRecent(
        limit: number = 10,
        mongoFilter: any = { [this.textKey]: { $nin: [null, ''], $not: /^\s*$/ } },
        sorter: any = { [this.timeStampKey]: -1 },
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        // console.log("Getting most recent entries from collection", this.name, "with limit", limit);
        return (await this.mongoCollection.find(mongoFilter).sort(sorter).limit(limit).toArray()).map(
            (entry: WithId<DualStoreEntry<TextKey, TimeKey>>) => ({
                id: entry.id,
                text: (entry as Record<TextKey, any>)[this.textKey],
                timestamp: new Date((entry as Record<TimeKey, any>)[this.timeStampKey]).getTime(),
                metadata: entry.metadata,
            }),
        ) as DualStoreEntry<'text', 'timestamp'>[];
    }
    async getMostRelevant(
        queryTexts: string[],
        limit: number,
        where: Record<string, unknown> = {},
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        // console.log("Getting most relevant entries from collection", this.name, "for queries", queryTexts, "with limit", limit);
        if (!queryTexts || queryTexts.length === 0) return Promise.resolve([]);

        const query: Record<string, any> = {
            queryTexts,
            nResults: limit,
        };
        if (where && Object.keys(where).length > 0) query.where = where;
        const queryResult = await this.chromaCollection.query(query);
        const uniqueThoughts = new Set();
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
                if (!doc.text) return false; // filter out undefined text
                if (uniqueThoughts.has(doc.text)) return false; // filter out duplicates
                uniqueThoughts.add(doc.text);
                return true;
            }) as DualStoreEntry<'text', 'timestamp'>[];
    }
}
