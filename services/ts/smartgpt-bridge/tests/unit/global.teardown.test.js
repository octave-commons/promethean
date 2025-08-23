import test from 'ava';
import { resetChroma, setEmbeddingFactory, setChromaClient } from '../../src/indexer.js';
import { cleanupMongo } from '../../src/mongo.js';

test('teardown placeholder', (t) => {
    t.pass();
});

test.after.always('global teardown', () => {
    try {
        resetChroma();
    } catch {}
    try {
        setEmbeddingFactory(null);
    } catch {}
    try {
        setChromaClient({
            getOrCreateCollection: async () => ({
                query: async () => ({}),
                upsert: async () => {},
            }),
        });
    } catch {}
    try {
        cleanupMongo();
    } catch {}
});
