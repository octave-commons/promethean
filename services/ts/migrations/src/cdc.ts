#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import { makeDeterministicEmbedder } from '@shared/prom-lib';
import { makeChromaWrapper } from '@shared/prom-lib';
import { makeCheckpointStore } from '@shared/prom-lib';

async function main() {
    const {
        MONGO_URI = 'mongodb://localhost:27017',
        CHROMA_URL = 'http://localhost:8000',
        CHROMA_COLLECTION_PREFIX = 'promethean_',
        EMBEDDING_MODEL = 'deterministic:v1',
        EMBEDDING_DIM = '1536',
    } = process.env as Record<string, string>;

    const mongo = new MongoClient(MONGO_URI);
    await mongo.connect();
    const dbName = new URL(MONGO_URI).pathname.replace(/\//, '') || 'promethean';
    const db = mongo.db(dbName);
    const cps = await makeCheckpointStore(MONGO_URI, dbName);

    const dim = Number(EMBEDDING_DIM) || 1536;
    const embedder = makeDeterministicEmbedder({ modelId: EMBEDDING_MODEL, dim });

    const collections = (
        process.argv.find((a) => a === '--collections')
            ? process.argv[process.argv.indexOf('--collections') + 1] ?? ''
            : 'messages'
    )
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    for (const collName of collections) {
        const chroma = makeChromaWrapper({
            url: CHROMA_URL,
            prefix: CHROMA_COLLECTION_PREFIX,
            collection: `${CHROMA_COLLECTION_PREFIX}${collName}`,
            embeddingDim: dim,
        });
        await chroma.ensureCollection();

        const cpId = `cdc:${collName}`;
        const resumeToken = await cps.getResumeToken(cpId);
        const coll = db.collection<any>(collName);
        const changeStream = coll.watch(
            [],
            resumeToken ? { resumeAfter: resumeToken as any } : undefined,
        );
        console.log(`[cdc] tailing ${collName} ...`);
        changeStream.on('change', async (evt) => {
            try {
                if (
                    evt.operationType === 'insert' ||
                    evt.operationType === 'replace' ||
                    evt.operationType === 'update'
                ) {
                    const full =
                        evt.fullDocument ??
                        (await coll.findOne({ _id: (evt as any).documentKey?._id }));
                    if (!full) return;
                    const emb = await embedder.embedOne(full.text ?? '');
                    await chroma.upsert([
                        {
                            id: String(full._id),
                            embedding: emb,
                            metadata: full.meta ?? {},
                            document: full.text ?? '',
                        },
                    ]);
                } else if (evt.operationType === 'delete') {
                    const id = String((evt as any).documentKey?._id);
                    await chroma.delete([id]);
                }
                await cps.setResumeToken(cpId, evt._id);
            } catch (err) {
                console.error(`[cdc:${collName}] error`, err);
            }
        });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
