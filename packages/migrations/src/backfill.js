#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import { makeDeterministicEmbedder } from './embedder.js';
import { makeChromaWrapper } from './chroma.js';
import { makeCheckpointStore } from './checkpoints.js';
import { checksumFor } from './integrity.js';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
    const a = process.argv.slice(2);
    const out = { collection: 'messages' };
    for (let i = 0; i < a.length; i++) {
        const k = a[i];
        const v = a[i + 1];
        if (k === '--collection') (out.collection = v), i++;
        else if (k === '--batch') (out.batch = Number(v)), i++;
        else if (k === '--since') (out.since = v), i++;
        else if (k === '--dry-run') out.dryRun = true;
    }
    return out;
}

async function main() {
    const args = parseArgs();
    const {
        MONGO_URI = 'mongodb://localhost:27017',
        CHROMA_URL = 'http://localhost:8000',
        CHROMA_COLLECTION_PREFIX = 'promethean_',
        EMBEDDING_MODEL = 'deterministic:v1',
        EMBEDDING_DIM = '1536',
        BATCH_SIZE = '128',
    } = process.env;

    const batchSize = Number(BATCH_SIZE) || 128;
    const dim = Number(EMBEDDING_DIM) || 1536;
    const dryRun = !!args.dryRun || process.env.MIGRATION_DRY_RUN === 'true';

    const embedder = makeDeterministicEmbedder({ modelId: EMBEDDING_MODEL, dim });
    const collectionName = `${CHROMA_COLLECTION_PREFIX}${args.collection}`;
    const chroma = makeChromaWrapper({
        url: CHROMA_URL,
        prefix: CHROMA_COLLECTION_PREFIX,
        collection: collectionName,
        embeddingDim: dim,
    });
    await chroma.ensureCollection();

    const fixturePath = process.env.MIGRATION_FIXTURE_JSON;
    let processed = 0;
    const failures = [];
    let docs = [];
    let startedAtISO = new Date().toISOString();

    let dbName = 'promethean';
    let cpBatchBase = 0;
    if (fixturePath) {
        // Fixture mode: load docs from JSON and skip Mongo/Checkpoints
        const raw = fs.readFileSync(path.resolve(process.cwd(), fixturePath), 'utf8');
        docs = JSON.parse(raw);
    } else {
        const mongo = new MongoClient(MONGO_URI);
        await mongo.connect();
        dbName = new URL(MONGO_URI).pathname.replace(/\//, '') || 'promethean';
        const db = mongo.db(dbName);
        const cps = await makeCheckpointStore(MONGO_URI, dbName);
        const cpId = `backfill:${args.collection}`;
        const cp = (await cps.get(cpId)) ?? {
            id: cpId,
            phase: 'backfill',
            batch: 0,
            updatedAt: new Date().toISOString(),
        };
        cpBatchBase = cp.batch ?? 0;
        startedAtISO = cp.updatedAt;
        const src = db.collection(args.collection);
        const q = {};
        if (args.since) q.updatedAt = { $gte: args.since };
        docs = await src.find(q).sort({ _id: 1 }).toArray();
        // close client after processing
        process.on('beforeExit', async () => {
            await mongo.close().catch(() => {});
        });
    }
    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const texts = batch.map((d) => d.text ?? '');
        const embeddings = await embedder.embedMany(texts);
        const items = batch.map((d, idx) => ({
            id: String(d._id),
            embedding: embeddings[idx],
            metadata: d.meta ?? {},
            document: d.text ?? '',
        }));
        if (!dryRun) await chroma.upsert(items);
        processed += batch.length;
        // Only persist checkpoints when not running in fixture mode
        if (!fixturePath) {
            const mongo = new MongoClient(MONGO_URI);
            await mongo.connect();
            const cps = await makeCheckpointStore(MONGO_URI, dbName);
            const cpId = `backfill:${args.collection}`;
            await cps.set({
                id: cpId,
                phase: 'backfill',
                batch: cpBatchBase + Math.ceil((i + batch.length) / batchSize),
                lastId: String(batch[batch.length - 1]._id),
                updatedAt: new Date().toISOString(),
            });
            await mongo.close();
        }
    }

    const report = {
        runId: `${Date.now()}`,
        modelId: EMBEDDING_MODEL,
        embedDim: dim,
        counts: { mongo: processed, chroma: await chroma.count() },
        orphans: { mongoOnly: [], chromaOnly: [] },
        sampleChecksums: docs.slice(0, 10).map((d) => ({
            id: String(d._id),
            checksum: checksumFor({
                id: String(d._id),
                text: d.text ?? '',
                meta: d.meta ?? {},
                embedDim: dim,
            }),
        })),
        failures,
        startedAt: startedAtISO,
        finishedAt: new Date().toISOString(),
    };

    const outDir = path.resolve(process.cwd(), 'docs/data/reports');
    fs.mkdirSync(outDir, { recursive: true });
    const base = `backfill_${args.collection}_${report.runId}`;
    fs.writeFileSync(path.join(outDir, `${base}.json`), JSON.stringify(report, null, 2));
    fs.writeFileSync(
        path.join(outDir, `${base}.md`),
        `# Backfill Report\n\n- runId: ${report.runId}\n- model: ${report.modelId}\n- dim: ${report.embedDim}\n- counts: mongo=${report.counts.mongo} chroma=${report.counts.chroma}\n- failures: ${report.failures.length}\n`,
    );

    // no-op: connections closed earlier if opened
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
