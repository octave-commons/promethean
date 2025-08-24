import { Collection, ObjectId } from 'mongodb';
import { Collection as ChromaCollection } from 'chromadb';
import { RemoteEmbeddingFunction } from '@shared/ts/embeddings/remote';
import { getMongoClient, getChromaClient } from './clients';
import { DualEntry } from './types';
import { randomUUID } from 'crypto';
import { AGENT_NAME } from '@shared/js/env';

type AliasDoc = {
    _id: string;
    target: string;
    embed?: { driver: string; fn: string; dims: number; version: string };
};

export class DualStore<T = any> {
    name: string;
    chroma: ChromaCollection;
    mongo: Collection<DualEntry<T>>;
    textKey: string;
    timeKey: string;

    private constructor(
        name: string,
        chroma: ChromaCollection,
        mongo: Collection<DualEntry<T>>,
        textKey: string,
        timeKey: string,
    ) {
        this.name = name;
        this.chroma = chroma;
        this.mongo = mongo;
        this.textKey = textKey;
        this.timeKey = timeKey;
    }

    /**
     * Factory method:
     * - Resolves collection aliases (Mongo: collection_aliases).
     * - Selects embedding function from alias or env.
     * - Creates both Mongo + Chroma collections.
     */
    static async create<T>(
        name: string,
        textKey: string = 'text',
        timeKey: string = 'createdAt',
    ): Promise<DualStore<T>> {
        const family = `${AGENT_NAME}_${name}`;
        const db = (await getMongoClient()).db('database');
        const aliases = db.collection<AliasDoc>('collection_aliases');
        const alias = await aliases.findOne({ _id: family });

        const embeddingFn = alias?.embed
            ? RemoteEmbeddingFunction.fromConfig({
                  driver: alias.embed.driver,
                  fn: alias.embed.fn,
              })
            : RemoteEmbeddingFunction.fromConfig({
                  driver: process.env.EMBEDDING_DRIVER || 'ollama',
                  fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
              });

        const chroma = await (
            await getChromaClient()
        ).getOrCreateCollection({
            name: alias?.target || family,
            embeddingFunction: embeddingFn,
        });

        const mongo = db.collection<DualEntry<T>>(family);

        return new DualStore(family, chroma, mongo, textKey, timeKey);
    }

    /**
     * Insert into both Mongo + Chroma.
     * - Generates UUID if missing.
     * - Adds timestamp if missing.
     * - Merges metadata with timestamp.
     */
    async insert(doc: DualEntry<T>) {
        const id = doc.id ?? randomUUID();
        doc.id = id;

        if (!doc[this.timeKey]) {
            (doc as any)[this.timeKey] = Date.now();
        }

        if (!doc.metadata) doc.metadata = {};
        doc.metadata[this.timeKey] = (doc as any)[this.timeKey];

        await this.chroma.add({
            ids: [id],
            documents: [doc[this.textKey]],
            metadatas: [doc.metadata],
        });

        await this.mongo.insertOne({
            id: doc.id,
            [this.textKey]: doc[this.textKey],
            [this.timeKey]: doc[this.timeKey],
            metadata: doc.metadata,
            createdAt: new Date(),
        } as any);

        return id;
    }

    /**
     * Fetch most recent Mongo entries.
     */
    async getMostRecent(
        limit = 10,
        filter: any = { [this.textKey]: { $nin: [null, ''], $not: /^\s*$/ } },
        sorter: any = { [this.timeKey]: -1 },
    ) {
        return (await this.mongo.find(filter).sort(sorter).limit(limit).toArray()).map((entry: any) => ({
            id: entry.id,
            text: entry[this.textKey],
            timestamp: new Date(entry[this.timeKey]).getTime(),
            metadata: entry.metadata,
        }));
    }

    /**
     * Fetch most relevant docs from Chroma.
     * Deduplicates by text, normalizes to (id, text, metadata, timestamp).
     */
    async getMostRelevant(querys: string[], limit = 5) {
        if (!querys || querys.length === 0) return [];

        const res = await this.chroma.query({ queryTexts: querys, nResults: limit });
        const ids = res.ids.flat(2);
        const docs = res.documents.flat(2);
        const metas = res.metadatas.flat(2);

        const unique = new Set<string>();
        return docs
            .map((doc, i) => ({
                id: ids[i],
                text: doc,
                metadata: metas[i],
                timestamp: metas[i]?.timeStamp || metas[i]?.[this.timeKey] || Date.now(),
            }))
            .filter((doc) => {
                if (!doc.text) return false;
                if (unique.has(doc.text)) return false;
                unique.add(doc.text);
                return true;
            });
    }
}
