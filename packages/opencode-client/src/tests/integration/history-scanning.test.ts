import test from 'ava';
import { DualStoreManager, cleanupClients } from '@promethean-os/persistence';
import { createIndexerService } from '../../services/indexer.js';
import type { EventMessage } from '../../types/index.js';

test.before(async () => {
  // Ensure clean test environment
  await cleanupClients();
});

test.after.always(async () => {
  // Cleanup after tests
  await cleanupClients();
});

test.serial('scanHistory processes all sessions and messages', async (t) => {
  // Create test stores
  const messageStore = await DualStoreManager.create('test-messages-history', 'text', 'timestamp');

  // Mock the OpencodeClient
  const mockClient = {
    session: {
      list: async () => ({
        data: [
          {
            id: 'session-1',
            title: 'Test Session 1',
            projectID: 'test-project',
            time: { created: Date.now() - 10000 },
          },
          {
            id: 'session-2',
            title: 'Test Session 2',
            projectID: 'test-project',
            time: { created: Date.now() - 5000 },
          },
        ],
      }),
      messages: async ({ path }: { path: { id: string } }) => {
        if (path.id === 'session-1') {
          return {
            data: [
              {
                info: { id: 'msg-1', role: 'user', time: { created: Date.now() - 9000 } },
                parts: [{ type: 'text', text: 'Hello from session 1' }],
              },
              {
                info: { id: 'msg-2', role: 'assistant', time: { created: Date.now() - 8000 } },
                parts: [{ type: 'text', text: 'Response in session 1' }],
              },
            ] as EventMessage[],
          };
        } else if (path.id === 'session-2') {
          return {
            data: [
              {
                info: { id: 'msg-3', role: 'user', time: { created: Date.now() - 4000 } },
                parts: [{ type: 'text', text: 'Hello from session 2' }],
              },
            ] as EventMessage[],
          };
        }
        return { data: [] as EventMessage[] };
      },
    },
  };

  // Create indexer with mocked dependencies
  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    stateFile: './test-history-state.json',
  });

  // Replace the client with our mock
  (indexer as any).client = mockClient;

  // Replace store access with test stores
  const { messageStoreAccess } = await import('../../services/unified-store.js');
  const originalMessageStore = messageStoreAccess;
  (messageStoreAccess as any) = messageStore;

  try {
    // Run history scan
    await indexer.scanHistory();

    // Verify messages were stored
    const messageResults = await messageStore.getMostRelevant(['msg-'], 10);

    t.true(messageResults.length >= 3); // Should have at least 3 messages

    // Verify message content
    const messageTexts = messageResults.map((entry) => {
      const parsed = JSON.parse(entry.text);
      return parsed.parts?.map((part: any) => part.text).join(' ') || '';
    });

    t.true(messageTexts.some((text) => text.includes('Hello from session 1')));
    t.true(messageTexts.some((text) => text.includes('Response in session 1')));
    t.true(messageTexts.some((text) => text.includes('Hello from session 2')));

    // Verify metadata
    const msg1Entry = messageResults.find((entry) => JSON.parse(entry.text).info?.id === 'msg-1');
    t.truthy(msg1Entry);
    t.is(msg1Entry?.metadata?.messageID, 'msg-1');
    t.is(msg1Entry?.metadata?.sessionId, 'session-1');
    t.is(msg1Entry?.metadata?.role, 'user');
  } finally {
    // Restore original store
    (messageStoreAccess as any) = originalMessageStore;
    await indexer.cleanup();
  }
});

test.serial('scanHistory handles empty sessions gracefully', async (t) => {
  const messageStore = await DualStoreManager.create('test-messages-empty', 'text', 'timestamp');

  const mockClient = {
    session: {
      list: async () => ({ data: [] }),
      messages: async () => ({ data: [] }),
    },
  };

  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    stateFile: './test-history-empty-state.json',
  });

  (indexer as any).client = mockClient;

  const { messageStoreAccess } = await import('../../services/unified-store.js');
  const originalMessageStore = messageStoreAccess;
  (messageStoreAccess as any) = messageStore;

  try {
    await indexer.scanHistory();

    // Should complete without errors
    const results = await messageStore.getMostRelevant(['any'], 1);
    t.is(results.length, 0);
  } finally {
    (messageStoreAccess as any) = originalMessageStore;
    await indexer.cleanup();
  }
});

test.serial('scanHistory handles API errors gracefully', async (t) => {
  const messageStore = await DualStoreManager.create('test-messages-error', 'text', 'timestamp');

  const mockClient = {
    session: {
      list: async () => {
        throw new Error('API Error');
      },
      messages: async () => ({ data: [] }),
    },
  };

  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    stateFile: './test-history-error-state.json',
  });

  (indexer as any).client = mockClient;

  const { messageStoreAccess } = await import('../../services/unified-store.js');
  const originalMessageStore = messageStoreAccess;
  (messageStoreAccess as any) = messageStore;

  try {
    // Should not throw, but handle error gracefully
    await t.notThrowsAsync(() => indexer.scanHistory());
  } finally {
    (messageStoreAccess as any) = originalMessageStore;
    await indexer.cleanup();
  }
});

test.serial('scanHistory updates state with timestamp', async (t) => {
  const messageStore = await DualStoreManager.create('test-messages-state', 'text', 'timestamp');

  const mockClient = {
    session: {
      list: async () => ({
        data: [
          {
            id: 'session-state-test',
            title: 'State Test Session',
            projectID: 'test-project',
            time: { created: Date.now() },
          },
        ],
      }),
      messages: async () => ({
        data: [
          {
            info: { id: 'state-msg', role: 'user', time: { created: Date.now() } },
            parts: [{ type: 'text', text: 'State test message' }],
          },
        ] as EventMessage[],
      }),
    },
  };

  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    stateFile: './test-history-timestamp-state.json',
  });

  (indexer as any).client = mockClient;

  const { messageStoreAccess } = await import('../../services/unified-store.js');
  const originalMessageStore = messageStoreAccess;
  (messageStoreAccess as any) = messageStore;

  try {
    const beforeState = await indexer.getState();
    t.is(beforeState.lastFullSyncTimestamp, undefined);

    await indexer.scanHistory();

    const afterState = await indexer.getState();
    t.true(typeof afterState.lastFullSyncTimestamp === 'number');
    t.true(afterState.lastFullSyncTimestamp! > 0);
  } finally {
    (messageStoreAccess as any) = originalMessageStore;
    await indexer.cleanup();
  }
});

test.serial('scanHistory processes messages sequentially with delays', async (t) => {
  const messageStore = await DualStoreManager.create(
    'test-messages-sequential',
    'text',
    'timestamp',
  );

  let callCount = 0;
  const callTimestamps: number[] = [];

  const mockClient = {
    session: {
      list: async () => ({
        data: [
          {
            id: 'sequential-session',
            title: 'Sequential Test Session',
            projectID: 'test-project',
            time: { created: Date.now() },
          },
        ],
      }),
      messages: async () => ({
        data: Array.from({ length: 5 }, (_, i) => ({
          info: {
            id: `seq-msg-${i}`,
            role: 'user',
            time: { created: Date.now() + i * 1000 },
          },
          parts: [{ type: 'text', text: `Sequential message ${i}` }],
        })) as EventMessage[],
      }),
    },
  };

  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    stateFile: './test-history-sequential-state.json',
  });

  (indexer as any).client = mockClient;

  // Mock the indexing operations to track call timing
  const { createIndexingOperations } = await import('../../services/indexer-operations.js');
  const originalOps = createIndexingOperations();

  const mockOps = {
    ...originalOps,
    indexMessage: async (message: any, sessionId: string) => {
      callCount++;
      callTimestamps.push(Date.now());
      await originalOps.indexMessage(message, sessionId);
    },
  };

  // Replace the operations in sync manager
  (indexer.syncManager as any).indexingOps = mockOps;

  const { messageStoreAccess } = await import('../../services/unified-store.js');
  const originalMessageStore = messageStoreAccess;
  (messageStoreAccess as any) = messageStore;

  try {
    const startTime = Date.now();
    await indexer.scanHistory();
    const endTime = Date.now();

    // Should have processed all 5 messages
    t.is(callCount, 5);

    // Should have taken some time due to delays (50ms per message)
    t.true(endTime - startTime > 200); // At least 200ms for 5 messages with 50ms delays

    // Verify all messages were stored
    const results = await messageStore.getMostRelevant(['seq-msg'], 10);
    t.is(results.length, 5);

    // Verify message order and content
    const parsedMessages = results.map((entry) => JSON.parse(entry.text));
    const messageTexts = parsedMessages.map((msg) => msg.parts[0]?.text);

    for (let i = 0; i < 5; i++) {
      t.true(messageTexts.some((text) => text.includes(`Sequential message ${i}`)));
    }
  } finally {
    (messageStoreAccess as any) = originalMessageStore;
    await indexer.cleanup();
  }
});
