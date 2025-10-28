import test from 'ava';
import { ContextStore } from '../contextStore.js';
import { DualStoreManager } from '../dualStore.js';
const createEntry = (id, text, timestamp, metadata = {}) => ({
    id,
    text,
    timestamp,
    metadata,
});
const createManagerStub = (name, data) => {
    const relevantCalls = [];
    return {
        name,
        getMostRelevant: async (queries, limit, where) => {
            relevantCalls.push({ queries: [...queries], limit, where });
            const pool = where?.type === 'image' ? data.images ?? [] : data.relevant ?? [];
            return pool.slice(0, limit);
        },
        getMostRecent: async (limit) => {
            const pool = data.latest ?? [];
            return pool.slice(0, limit);
        },
        getRelevantCalls: () => [...relevantCalls],
    };
};
const makeDocs = () => {
    const baseTime = Date.now();
    return {
        relevant: [
            createEntry('rel-1', 'assistant reply', baseTime - 30, { userName: 'Duck', isThought: false }),
            createEntry('rel-2', 'duplicate', baseTime - 20, { userName: 'Alice' }),
        ],
        images: [createEntry('img-1', 'https://image', baseTime - 10, { type: 'image', userName: 'Duck', caption: 'Diagram' })],
        latest: [
            createEntry('lat-1', 'duplicate', baseTime - 50, { userName: 'Alice' }),
            createEntry('lat-2', 'fresh update', baseTime - 5, { userName: 'Bob' }),
        ],
    };
};
const originalCreate = DualStoreManager.create;
test.afterEach.always(() => {
    DualStoreManager.create = originalCreate;
});
test('createCollection stores new manager and blocks duplicates', async (t) => {
    const store = new ContextStore();
    const stubManager = createManagerStub('alpha', makeDocs());
    DualStoreManager.create = (async (_name, _textKey, _timeStampKey) => stubManager);
    const created = await store.createCollection('alpha', 'text', 'timestamp');
    t.is(created, stubManager);
    t.is(store.collectionCount(), 1);
    await t.throwsAsync(() => store.createCollection('alpha', 'text', 'timestamp'), {
        message: /already exists/i,
    });
});
test('getOrCreateCollection reuses existing collection', async (t) => {
    const store = new ContextStore();
    const existing = createManagerStub('existing', makeDocs());
    store.collections.set('existing', existing);
    const retrieved = await store.getOrCreateCollection('existing');
    t.is(retrieved, existing);
    let called = false;
    DualStoreManager.create = (async (_name, _textKey, _timeStampKey) => {
        called = true;
        return createManagerStub('new', makeDocs());
    });
    const created = await store.getOrCreateCollection('new');
    t.true(called);
    t.truthy(created);
    t.is(store.collectionCount(), 2);
});
test('collection helpers expose stored managers', (t) => {
    const store = new ContextStore();
    const alpha = createManagerStub('alpha', makeDocs());
    const beta = createManagerStub('beta', makeDocs());
    store.collections.set('alpha', alpha);
    store.collections.set('beta', beta);
    t.is(store.collectionCount(), 2);
    t.deepEqual(new Set(store.listCollectionNames()), new Set(['alpha', 'beta']));
    t.is(store.getCollection('alpha'), alpha);
    t.throws(() => store.getCollection('gamma'), { message: /does not exist/i });
});
test('getAllRelatedDocuments aggregates across collections', async (t) => {
    const store = new ContextStore();
    const alpha = createManagerStub('alpha', {
        relevant: [createEntry('a1', 'alpha doc', Date.now(), {})],
    });
    const beta = createManagerStub('beta', {
        relevant: [createEntry('b1', 'beta doc', Date.now(), {})],
    });
    store.collections.set('alpha', alpha);
    store.collections.set('beta', beta);
    const results = await store.getAllRelatedDocuments(['query'], 5, { type: 'note' });
    t.is(results.length, 2);
    t.true(results.some((doc) => doc.id === 'a1'));
    t.true(results.some((doc) => doc.id === 'b1'));
    const alphaCalls = alpha.getRelevantCalls();
    t.is(alphaCalls[0]?.where?.type, 'note');
});
test('getLatestDocuments gathers latest items', async (t) => {
    const store = new ContextStore();
    const alpha = createManagerStub('alpha', {
        latest: [createEntry('a1', 'alpha recent', Date.now(), {})],
    });
    const beta = createManagerStub('beta', {
        latest: [createEntry('b1', 'beta recent', Date.now(), {})],
    });
    store.collections.set('alpha', alpha);
    store.collections.set('beta', beta);
    const results = await store.getLatestDocuments(10);
    t.deepEqual(results.map((doc) => doc.id).sort(), ['a1', 'b1']);
});
test('compileContext returns deduplicated conversation with images and formatting', async (t) => {
    const store = new ContextStore();
    const docs = makeDocs();
    const manager = createManagerStub('alpha', docs);
    store.collections.set('alpha', manager);
    const messages = await store.compileContext(['seed question'], 2, 3, 5, true);
    t.true(messages.some((msg) => msg.images?.length === 1));
    t.true(messages.some((msg) => msg.role === 'assistant'));
    t.true(messages.some((msg) => msg.role === 'user'));
    const assistantMessage = messages.find((msg) => msg.role === 'assistant');
    t.regex(assistantMessage?.content ?? '', /Duck said/);
    const calls = manager.getRelevantCalls();
    t.true(calls.length >= 2);
    t.truthy(calls.find((call) => call.where?.type === 'image'));
});
test('compileContext supports legacy positional arguments', async (t) => {
    const store = new ContextStore();
    const docs = makeDocs();
    const manager = createManagerStub('alpha', docs);
    store.collections.set('alpha', manager);
    const messages = await store.compileContext(['legacy prompt'], 1, 1, 3, false);
    t.true(messages.length > 0);
    t.true(manager.getRelevantCalls().length >= 1);
});
//# sourceMappingURL=contextStore.class.test.js.map