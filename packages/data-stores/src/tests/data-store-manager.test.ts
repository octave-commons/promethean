import test from 'ava';
import {
  createDataStoreManager,
  getDataStoreManager,
  resetGlobalDataStoreManager,
  StoreNames,
  OPENCODE_STORES,
  FILE_SYSTEM_STORES,
} from '../index.js';

test.beforeEach(async () => {
  // Reset global manager before each test
  resetGlobalDataStoreManager();
});

test('createDataStoreManager creates a functional manager', async (t) => {
  const manager = createDataStoreManager();

  // Should not be initialized yet
  await t.throwsAsync(() => manager.getStore(StoreNames.SESSION), { message: /not initialized/ });

  // Initialize successfully
  await t.notThrowsAsync(() => manager.initialize());

  // Should be able to get stores after initialization
  await t.notThrowsAsync(() => manager.getStore(StoreNames.SESSION));
  await t.notThrowsAsync(() => manager.getStore(StoreNames.FILE_INDEX));
});

test('getDataStoreManager returns singleton instance', async (t) => {
  const manager1 = getDataStoreManager();
  const manager2 = getDataStoreManager();

  t.is(manager1, manager2, 'Should return the same instance');
});

test('manager initializes all stores', async (t) => {
  const manager = createDataStoreManager();
  await manager.initialize();

  const storeNames = manager.getStoreNames();

  // Should include all OpenCode stores
  for (const storeName of OPENCODE_STORES) {
    t.true(storeNames.includes(storeName), `Should include ${storeName}`);
  }

  // Should include all file system stores
  for (const storeName of FILE_SYSTEM_STORES) {
    t.true(storeNames.includes(storeName), `Should include ${storeName}`);
  }
});

test('can get individual stores', async (t) => {
  const manager = createDataStoreManager();
  await manager.initialize();

  // Test getting OpenCode stores
  const sessionStore = await manager.getStore(StoreNames.SESSION);
  t.truthy(sessionStore, 'Should get session store');

  const eventStore = await manager.getStore(StoreNames.EVENT);
  t.truthy(eventStore, 'Should get event store');

  const messageStore = await manager.getStore(StoreNames.MESSAGE);
  t.truthy(messageStore, 'Should get message store');

  // Test getting file system store
  const fileIndexStore = await manager.getStore(StoreNames.FILE_INDEX);
  t.truthy(fileIndexStore, 'Should get file index store');
});

test('search across all stores', async (t) => {
  const manager = createDataStoreManager();
  await manager.initialize();

  // Insert test data
  const sessionStore = await manager.getStore(StoreNames.SESSION);
  const fileIndexStore = await manager.getStore(StoreNames.FILE_INDEX);

  await sessionStore.insert({
    id: 'test-session-1',
    text: 'Test session content',
    timestamp: Date.now(),
    metadata: {
      type: 'session',
      sessionId: 'session-1',
      title: 'Test Session',
    },
  });

  await fileIndexStore.insert({
    id: 'test-file-1',
    content: 'Test file content',
    lastModified: Date.now(),
    metadata: {
      type: 'file',
      filePath: '/test/file.txt',
      fileName: 'file.txt',
      fileSize: 100,
      fileType: 'txt',
      indexedAt: new Date(),
    },
  });

  // Search for content
  const results = await manager.searchAcrossAllStores(['test'], { limit: 10 });

  t.true(results.length >= 2, 'Should find results from multiple stores');

  const sessionResult = results.find((r) => r.storeName === StoreNames.SESSION);
  const fileResult = results.find((r) => r.storeName === StoreNames.FILE_INDEX);

  t.truthy(sessionResult, 'Should find session result');
  t.truthy(fileResult, 'Should find file result');
});

test('search in specific stores', async (t) => {
  const manager = createDataStoreManager();
  await manager.initialize();

  // Insert test data
  const sessionStore = await manager.getStore(StoreNames.SESSION);
  const messageStore = await manager.getStore(StoreNames.MESSAGE);

  await sessionStore.insert({
    id: 'test-session-1',
    text: 'Session specific content',
    timestamp: Date.now(),
    metadata: {
      type: 'session',
      sessionId: 'session-1',
      title: 'Test Session',
    },
  });

  await messageStore.insert({
    id: 'test-message-1',
    text: 'Message specific content',
    timestamp: Date.now(),
    metadata: {
      type: 'message',
      messageId: 'message-1',
      sessionId: 'session-1',
      role: 'user',
    },
  });

  // Search only in session store
  const sessionResults = await manager.searchInStores([StoreNames.SESSION], ['specific'], {
    limit: 10,
  });

  t.true(sessionResults.length >= 1, 'Should find session results');
  t.is(sessionResults[0].storeName, StoreNames.SESSION, 'Should only return session results');

  // Search only in message store
  const messageResults = await manager.searchInStores([StoreNames.MESSAGE], ['specific'], {
    limit: 10,
  });

  t.true(messageResults.length >= 1, 'Should find message results');
  t.is(messageResults[0].storeName, StoreNames.MESSAGE, 'Should only return message results');
});

test('get latest from stores', async (t) => {
  const manager = createDataStoreManager();
  await manager.initialize();

  // Insert test data with different timestamps
  const sessionStore = await manager.getStore(StoreNames.SESSION);
  const eventStore = await manager.getStore(StoreNames.EVENT);

  const now = Date.now();
  const earlier = now - 1000;

  await sessionStore.insert({
    id: 'test-session-1',
    text: 'Earlier session',
    timestamp: earlier,
    metadata: {
      type: 'session',
      sessionId: 'session-1',
      title: 'Earlier Session',
    },
  });

  await eventStore.insert({
    id: 'test-event-1',
    text: 'Later event',
    timestamp: now,
    metadata: {
      type: 'event',
      eventType: 'test',
    },
  });

  // Get latest from all stores
  const latestResults = await manager.getLatestFromAllStores(5);

  t.true(latestResults.length >= 2, 'Should get results from multiple stores');

  // Get latest from specific stores
  const sessionResults = await manager.getLatestFromStores([StoreNames.SESSION], 5);

  t.true(sessionResults.length >= 1, 'Should get session results');
  t.is(sessionResults[0].storeName, StoreNames.SESSION, 'Should return session results');
});

test('cleanup resets manager state', async (t) => {
  const manager = createDataStoreManager();
  await manager.initialize();

  // Should be able to get stores
  await t.notThrowsAsync(() => manager.getStore(StoreNames.SESSION));

  // Cleanup
  await manager.cleanup();

  // Should throw error when trying to get stores after cleanup
  await t.throwsAsync(() => manager.getStore(StoreNames.SESSION), { message: /not initialized/ });
});
