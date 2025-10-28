import test from 'ava';
import { DualStoreManager } from '../dualStore.js';
const createdStores = [];
test.afterEach.always(async () => {
    await Promise.all(createdStores.splice(0).map(async (store) => {
        try {
            await store.cleanup();
        }
        catch {
            // ignore cleanup errors in tests
        }
    }));
});
// Regression test: sessionStore.get() must return exact format expected by client
test.serial('sessionStore.get() regression test - exact client contract', async (t) => {
    t.timeout(20000);
    // RED: This test should fail with current implementation
    const store = await DualStoreManager.create('sessionStore-regression-get', 'text', 'timestamp');
    createdStores.push(store);
    // Insert data exactly like the client does
    const sessionData = {
        id: 'test-session-123',
        text: JSON.stringify({
            id: 'test-session-123',
            title: 'Test Session',
            createdAt: '2024-01-01T00:00:00.000Z',
        }),
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        metadata: { type: 'session' },
    };
    await store.insert(sessionData);
    // This is the exact call the client makes in getSessionEntry()
    const result = await store.get('test-session-123');
    // Client expects: SessionEntry | null
    // SessionEntry = { readonly text: string; readonly id?: string; readonly timestamp?: Date | number | string; }
    t.truthy(result, 'Should return the session entry');
    if (result) {
        t.is(typeof result.text, 'string', 'text should be a string');
        t.is(result.text, sessionData.text, 'text should match exactly what was inserted');
        // Client expects these optional properties to be present
        t.truthy(result.id, 'id should be present');
        t.is(result.id, 'test-session-123', 'id should match');
        t.truthy(result.timestamp, 'timestamp should be present');
        t.is(typeof result.timestamp, 'number', 'timestamp should be a number (Unix timestamp)');
        // Verify the timestamp is a Unix timestamp (what client expects)
        const expectedTimestamp = new Date('2024-01-01T00:00:00.000Z').getTime();
        t.is(result.timestamp, expectedTimestamp, 'timestamp should be Unix timestamp');
    }
});
// Regression test: getMostRecent must return exact format
test.serial('sessionStore.getMostRecent() regression test - exact client contract', async (t) => {
    t.timeout(20000);
    const store = await DualStoreManager.create('sessionStore-regression-recent', 'text', 'timestamp');
    createdStores.push(store);
    // Insert multiple entries like client would
    await store.insert({
        id: 'session-1',
        text: JSON.stringify({ id: 'session-1', title: 'Session 1' }),
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        metadata: { type: 'session' },
    });
    await store.insert({
        id: 'session-2',
        text: JSON.stringify({ id: 'session-2', title: 'Session 2' }),
        timestamp: new Date('2024-01-02T00:00:00.000Z'),
        metadata: { type: 'session' },
    });
    const results = await store.getMostRecent(10);
    t.true(Array.isArray(results), 'Should return an array');
    t.is(results.length, 2, 'Should return both entries');
    // Client expects DualStoreEntry<'text', 'timestamp'> format
    results.forEach((result, index) => {
        t.is(typeof result.text, 'string', `result ${index} text should be string`);
        t.is(typeof result.id, 'string', `result ${index} id should be string`);
        t.is(typeof result.timestamp, 'number', `result ${index} timestamp should be number`);
        t.truthy(result.metadata, `result ${index} should have metadata`);
    });
    // Should be sorted by timestamp descending (newest first)
    if (results[0] && results[1]) {
        t.is(results[0].id, 'session-2', 'Newest entry should be first');
        t.is(results[1].id, 'session-1', 'Older entry should be second');
    }
});
//# sourceMappingURL=regression.test.js.map