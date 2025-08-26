// @ts-nocheck
import test from 'ava';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
    embeddingEnvConfig,
    search,
    setChromaClient,
    setEmbeddingFactory,
    reindexAll,
    resetChroma,
} from '../../indexer.js';

const ROOT = path.join(process.cwd(), 'src', 'tests', 'fixtures');

class EmptyCollection {
    async query() {
        return {};
    }
    async upsert() {}
}
class WeirdCollection {
    async query() {
        return {
            ids: [[['id']]],
            documents: [[['doc']]],
            metadatas: [[[{ path: 'p', startLine: 1, endLine: 1 }]]],
            distances: [[['not-a-number']]],
        };
    }
}
class FakeChroma {
    constructor(col) {
        this.col = col;
    }
    async getOrCreateCollection() {
        return this.col;
    }
}

test.beforeEach(() => {
    // Default to harmless stubs to avoid cross-test interference
    setChromaClient(new FakeChroma(new EmptyCollection()));
    setEmbeddingFactory(async () => ({ generate: async () => [] }));
});

test.serial('embedding env config uses env defaults (no broker)', async (t) => {
    const prevD = process.env.EMBEDDING_DRIVER;
    const prevF = process.env.EMBEDDING_FUNCTION;
    try {
        process.env.EMBEDDING_DRIVER = 'driverZ';
        process.env.EMBEDDING_FUNCTION = 'fnZ';
        const cfg = embeddingEnvConfig();
        t.deepEqual(cfg, { driver: 'driverZ', fn: 'fnZ' });
    } finally {
        if (prevD === undefined) delete process.env.EMBEDDING_DRIVER;
        else process.env.EMBEDDING_DRIVER = prevD;
        if (prevF === undefined) delete process.env.EMBEDDING_FUNCTION;
        else process.env.EMBEDDING_FUNCTION = prevF;
    }
});

test.serial('search handles empty result shape via fallbacks', async (t) => {
    t.plan(1);
    try {
        setChromaClient(new FakeChroma(new EmptyCollection()));
        setEmbeddingFactory(async () => ({ generate: async () => [] }));
        const res = await search(ROOT, 'q', 2);
        t.deepEqual(res, []);
    } catch (err) {
        t.fail('search threw: ' + String(err?.message || err));
    }
});

test.serial('search sets undefined score when distance not a number', async (t) => {
    t.plan(2);
    try {
        setChromaClient(new FakeChroma(new WeirdCollection()));
        setEmbeddingFactory(async () => ({ generate: async () => [] }));
        const res = await search(ROOT, 'q', 1);
        t.is(res.length, 1);
        t.is(res[0].score, undefined);
    } catch (err) {
        t.fail('search threw: ' + String(err?.message || err));
    }
});

test.serial('reindexAll honors EXCLUDE_GLOBS', async (t) => {
    const prev = process.env.EXCLUDE_GLOBS;
    const tmp = path.join(ROOT, 'tmp_excl.txt');
    await fs.writeFile(tmp, 'x');
    try {
        process.env.EXCLUDE_GLOBS = 'tmp_excl.txt';
        setChromaClient(new FakeChroma(new EmptyCollection()));
        setEmbeddingFactory(async () => ({ generate: async () => [] }));
        const info = await reindexAll(ROOT, { include: ['tmp_excl.txt'] });
        t.is(info.processed, 0);
    } finally {
        if (prev === undefined) delete process.env.EXCLUDE_GLOBS;
        else process.env.EXCLUDE_GLOBS = prev;
        await fs.unlink(tmp).catch(() => {});
    }
});

test.after.always(() => {
    // Ensure no real clients linger
    resetChroma();
    setEmbeddingFactory(null);
    setChromaClient({
        getOrCreateCollection: async () => ({
            query: async () => ({}),
            upsert: async () => {},
        }),
    });
});
