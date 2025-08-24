/**
 * @deprecated Use DualStoreManager from @shared/ts/persistence/dualStore instead.
 */
import mongoose from 'mongoose';
import { getChroma } from '../indexer.js';
import { initMongo } from '../mongo.js';
import { RemoteEmbeddingFunction } from '@shared/ts/dist/embeddings/remote.js';

export class DualSink {
    constructor(name, schema, metadataBuilder) {
        this.name = name;
        this.schema = schema;
        this.metadataBuilder = metadataBuilder;
        const s = new mongoose.Schema(schema, { timestamps: { createdAt: true } });
        this.mongoModel = mongoose.models[name] || mongoose.model(name, s, name);
        this.collection = null;
    }

    async init() {
        if (this.collection) return;
        const chroma = await getChroma();
        this.collection = await chroma.getOrCreateCollection({
            name: this.name,
            metadata: { type: this.name },
            embeddingFunction: RemoteEmbeddingFunction.fromConfig({
                driver: process.env.EMBEDDING_DRIVER || 'ollama',
                fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
            }),
        });
    }

    async add(entry) {
        await initMongo();
        await this.init();
        const mongoDoc = await this.mongoModel.create(entry);
        const metadata = this.metadataBuilder(mongoDoc.toObject());
        await this.collection.add({
            ids: [mongoDoc._id.toString()],
            documents: [JSON.stringify(mongoDoc)],
            metadatas: [metadata],
        });
        return mongoDoc;
    }

    async queryMongo(filter, limit = 100) {
        await initMongo();
        return this.mongoModel.find(filter).sort({ createdAt: -1 }).limit(limit);
    }

    async searchChroma(q, n = 10, where = {}) {
        await this.init();
        return this.collection.query({ queryTexts: [q], nResults: n, where });
    }

    getCollection() {
        return this.collection;
    }
}
