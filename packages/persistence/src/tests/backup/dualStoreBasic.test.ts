import test from 'ava';

// Basic tests for dualStore standalone functions
// These tests verify the functions exist and have correct signatures

test('dualStore module exports expected functions', async (t) => {
    const dualStore = await import('../../dualStore.js');

    // Test that main functions are exported
    t.truthy(dualStore.create);
    t.is(typeof dualStore.create, 'function');

    t.truthy(dualStore.insert);
    t.is(typeof dualStore.insert, 'function');

    t.truthy(dualStore.addEntry);
    t.is(typeof dualStore.addEntry, 'function');

    t.truthy(dualStore.getMostRecent);
    t.is(typeof dualStore.getMostRecent, 'function');

    t.truthy(dualStore.getMostRelevant);
    t.is(typeof dualStore.getMostRelevant, 'function');

    t.truthy(dualStore.get);
    t.is(typeof dualStore.get, 'function');

    t.truthy(dualStore.cleanup);
    t.is(typeof dualStore.cleanup, 'function');
});

test('create function has correct signature', async (t) => {
    const { create } = await import('../../dualStore.js');

    // Test that create is async and returns a promise
    t.true(create.length >= 3); // At least name, textKey, timeStampKey parameters
    t.is(typeof create('test', 'text', 'createdAt'), 'object');
});

test('cleanup function exists and is callable', async (t) => {
    const { cleanup } = await import('../dualStore.js');

    t.is(typeof cleanup, 'function');

    // Should not throw when called
    await t.notThrowsAsync(async () => await cleanup());
});

test('helper functions are exported', async (t) => {
    const helpers = await import('../dualStoreHelpers.js');

    // Check that helper functions are exported
    const expectedHelpers = [
        'createDualStoreManagerDependencies',
        'toEpochMilliseconds',
        'pickTimestamp',
        'withTimestampMetadata',
        'toChromaMetadata',
        'cloneMetadata',
        'toGenericEntry',
        'createDefaultMongoFilter',
        'createDefaultSorter',
    ];

    for (const helper of expectedHelpers) {
        t.true(helper in helpers, `Helper function ${helper} should be exported`);
    }
});

test('contextStore functions are exported', async (t) => {
    const contextStore = await import('../contextStore.js');

    // Check that contextStore functions are exported
    const expectedFunctions = [
        'createContextStore',
        'createCollection',
        'getOrCreateCollection',
        'getAllRelatedDocuments',
        'getLatestDocuments',
        'getCollection',
        'compileContext',
        'makeContextStore',
        'ContextStore',
    ];

    for (const fn of expectedFunctions) {
        t.true(fn in contextStore, `ContextStore function ${fn} should be exported`);
    }
});

test('error handling functions exist', async (t) => {
    const { cleanupClients } = await import('../clients.js');

    t.is(typeof cleanupClients, 'function');

    // Should not throw when called
    await t.notThrowsAsync(async () => await cleanupClients());
});
