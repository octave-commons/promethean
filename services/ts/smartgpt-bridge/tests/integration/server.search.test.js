import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';
import { setChromaClient, setEmbeddingFactory, resetChroma } from '../../src/indexer.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

class FakeCollection {
    async query({ queryTexts, nResults }) {
        return {
            ids: [[['readme.md#0']]],
            documents: [[['Matched snippet']]],
            metadatas: [[[{ path: 'readme.md', chunkIndex: 0, startLine: 1, endLine: 3 }]]],
            distances: [[[0.12]]],
        };
    }
    async upsert() {
        /* no-op */
    }
    async add() {
        /* no-op */
    }
}

class FakeChroma {
    async getOrCreateCollection() {
        return new FakeCollection();
    }
}

test.before(() => {
    setChromaClient(new FakeChroma());
    setEmbeddingFactory(async () => ({
        generate: async (texts) => texts.map(() => [0.0, 0.0, 0.0]),
    }));
});

test('POST /v0/search returns stubbed results without external services', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.post('/v0/search').send({ q: 'readme', n: 1 }).expect(200);
        t.true(res.body.ok);
        t.is(res.body.results.length, 1);
        t.is(res.body.results[0].path, 'readme.md');
        t.is(res.body.results[0].startLine, 1);
        t.is(res.body.results[0].endLine, 3);
    });
});

test.after.always(() => {
    // Ensure no lingering clients or factories
    resetChroma();
    setEmbeddingFactory(null);
    setChromaClient({
        getOrCreateCollection: async () => ({
            query: async () => ({}),
            upsert: async () => {},
            add: async () => {},
        }),
    });
});
