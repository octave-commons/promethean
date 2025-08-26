import test from 'ava';
import path from 'node:path';
import { withServer } from '../helpers/server.js';
import { setChromaClient, setEmbeddingFactory, resetChroma } from '../../src/indexer.ts';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

class ThrowingChroma {
    async getOrCreateCollection() {
        throw new Error('no chroma');
    }
}

test('POST /v0/search 500 on chroma error; /v0/files/reindex 400 missing path', async (t) => {
    setChromaClient(new ThrowingChroma());
    setEmbeddingFactory(async () => ({ generate: async () => [] }));
    await withServer(ROOT, async (req) => {
        const s = await req.post('/v0/search').send({ q: 'x' }).expect(500);
        t.false(s.body.ok);
        const r = await req.post('/v0/files/reindex').send({}).expect(400);
        t.false(r.body.ok);
        const missingQ = await req.post('/v0/search').send({}).expect(400);
        t.is(missingQ.status, 400);
    });
});

test.after.always(() => {
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
