import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';
import { setChromaClient, setEmbeddingFactory, resetChroma } from '../../src/indexer.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

class CollectingCollection {
    constructor() {
        this.calls = 0;
    }
    async upsert() {
        this.calls++;
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

test('POST /reindex returns 200 with stubbed chroma', async (t) => {
    const col = new CollectingCollection();
    setChromaClient(new FakeChroma(col));
    setEmbeddingFactory(async () => ({ generate: async () => [] }));
    await withServer(ROOT, async (req) => {
        const res = await req.post('/reindex').send({ limit: 1 }).expect(200);
        t.true(res.body.ok);
    });
});

test.after.always(() => {
    resetChroma();
    setEmbeddingFactory(null);
    setChromaClient({
        getOrCreateCollection: async () => ({ query: async () => ({}), upsert: async () => {} }),
    });
});
