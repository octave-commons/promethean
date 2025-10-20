import test from 'ava';

import { makeChromaWrapper } from './chroma.js';

test('chroma wrapper upsert/delete/count', async (t) => {
    const c = makeChromaWrapper({
        url: 'http://localhost:8000',
        prefix: 'prom_',
        collection: 'prom_messages',
        embeddingDim: 8,
    });
    await c.ensureCollection();
    await c.upsert([
        {
            id: 'x1',
            embedding: new Array<number>(8).fill(0.1),
            metadata: { a: 1 },
            document: 'hello',
        },
    ]);
    t.is(await c.count(), 1);
    await c.upsert([{ id: 'x1', embedding: new Array<number>(8).fill(0.2) }]);
    t.is(await c.count(), 1);
    await c.delete(['x1']);
    t.is(await c.count(), 0);
});
