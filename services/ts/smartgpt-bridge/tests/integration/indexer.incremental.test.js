import test from 'ava';
import fs from 'fs/promises';
import path from 'path';

import {
    setChromaClient,
    setEmbeddingFactory,
    resetChroma,
    indexerManager,
} from '../../src/indexer.js';
import { loadBootstrapState } from '../../src/indexerState.js';

function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function waitIdle(timeoutMs = 5000) {
    const start = Date.now();
    while (indexerManager.isBusy()) {
        if (Date.now() - start > timeoutMs) throw new Error('waitIdle timeout');
        await delay(10);
    }
}

class RecordingCollection {
    constructor() {
        this.upserts = []; // { ids, metadatas }
        this.deletes = []; // { where }
    }
    async upsert(payload) {
        this.upserts.push({ ids: payload.ids, metadatas: payload.metadatas });
    }
    async delete(payload) {
        this.deletes.push(payload);
    }
    async query() {
        return {};
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

test.serial('bootstrap persists cursor and restart performs incremental diffs', async (t) => {
    // Speed up drain loops
    process.env.INDEXER_FILE_DELAY_MS = '0';

    // Create temp root
    const ROOT = path.join(
        process.cwd(),
        'services',
        'ts',
        'smartgpt-bridge',
        'tests',
        'tmp',
        'inc1',
    );
    await fs.mkdir(ROOT, { recursive: true });
    const a = path.join(ROOT, 'a.txt');
    const b = path.join(ROOT, 'b.txt');
    const c = path.join(ROOT, 'c.md');
    await fs.writeFile(a, 'alpha');
    await fs.writeFile(b, 'bravo');
    await fs.writeFile(c, '# charlie');

    // Stub chroma + embeddings
    const col = new RecordingCollection();
    setChromaClient(new FakeChroma(col));
    setEmbeddingFactory(async () => ({ generate: async () => [] }));

    // Fresh bootstrap
    await indexerManager.resetAndBootstrap(ROOT);
    await waitIdle();

    // Confirm state saved and mode becomes indexed
    const s1 = indexerManager.status();
    t.is(s1.mode, 'indexed');
    const stateFile = await loadBootstrapState(ROOT);
    t.truthy(stateFile);
    t.true(['indexed', 'bootstrap'].includes(stateFile.mode));

    // Clear call history for incremental phase
    col.upserts = [];
    col.deletes = [];

    // Change files: modify b, add d, remove a
    const d = path.join(ROOT, 'd.txt');
    await fs.appendFile(b, '++changed');
    await fs.writeFile(d, 'delta');
    await fs.rm(a);

    // Simulate service restart by clearing in-memory root so ensureBootstrap re-runs
    indexerManager.rootPath = null;
    indexerManager.queue = [];
    indexerManager.active = false;
    indexerManager._draining = false;

    await indexerManager.ensureBootstrap(ROOT);
    await waitIdle();

    // Validate: upserted for b and d; deleted a
    const upsertPaths = new Set(col.upserts.flatMap((u) => (u.metadatas || []).map((m) => m.path)));
    t.true(upsertPaths.has('b.txt'));
    t.true(upsertPaths.has('d.txt'));

    const deletedPaths = new Set(
        col.deletes.map(
            (d) => (d.where && d.where.path) || (d.where && d.where.eq && d.where.eq.path),
        ),
    );
    t.true(deletedPaths.has('a.txt'));
});

test.after.always(() => {
    // Reset globals
    resetChroma();
    setEmbeddingFactory(null);
    setChromaClient({
        getOrCreateCollection: async () => ({
            query: async () => ({}),
            upsert: async () => {},
            delete: async () => {},
        }),
    });
});
