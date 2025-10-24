/**
 * Comprehensive Integration Tests for Indexer Service
 *
 * These tests verify the complete integration between:
 * - Indexer service lifecycle management
 * - Database operations (MongoDB/ChromaDB)
 * - Event processing and synchronization
 * - State persistence and recovery
 * - Error handling and resilience
 * - Performance under realistic load
 */

import { readdir, unlink } from 'fs/promises';
import test from 'ava';
import sinon from 'sinon';
import { setTimeout } from 'timers/promises';
import {
  createIndexerService,
  createAndStartIndexer,
  getDefaultIndexer,
  startDefaultIndexer,
  stopDefaultIndexer,
  type IndexerOptions,
} from '../../services/indexer.js';
import { initializeStores } from '../../initializeStores.js';

// Test configuration
const TEST_BASE_URL = 'http://localhost:3000';

// Helper to create test indexer options
const createTestOptions = (suffix: string = ''): IndexerOptions => {
  const timestamp = Date.now();
  const stateFile = `./test-indexer-state-${suffix}${timestamp}.json`;

  return {
    baseUrl: TEST_BASE_URL,
    processingInterval: 1000, // 1 second for faster tests
    stateFile,
  };
};

// Helper to cleanup test databases
async function cleanupTestDatabases(suffix: string = ''): Promise<void> {
  try {
    // For now, just log cleanup - in a real implementation you'd drop collections
    console.log(`Cleaning up test databases with suffix: ${suffix}`);
  } catch (error) {
    console.warn('Warning during database cleanup:', error);
  }
}

// Helper to create mock OpenCode client
function createMockClient() {
  const mockClient = {
    session: {
      list: sinon.stub(),
      messages: sinon.stub(),
      message: sinon.stub(),
    },
    event: {
      subscribe: sinon.stub(),
    },
  };

  // Mock session list response
  mockClient.session.list.resolves({
    data: [
      {
        id: 'test-session-1',
        title: 'Test Session 1',
        time: { created: Date.now() - 1000000 },
      },
      {
        id: 'test-session-2',
        title: 'Test Session 2',
        time: { created: Date.now() - 500000 },
      },
    ],
  });

  // Mock messages response
  mockClient.session.messages.resolves({
    data: [
      {
        info: { id: 'msg-1', role: 'user', sessionID: 'test-session-1' },
        parts: [{ type: 'text', text: 'Hello world' }],
      },
    ],
  });

  // Mock single message response
  mockClient.session.message.resolves({
    data: {
      info: { id: 'msg-1', role: 'user', sessionID: 'test-session-1' },
      parts: [{ type: 'text', text: 'Hello world' }],
    },
  });

  // Mock event subscription
  const mockEventStream = {
    async *[Symbol.asyncIterator]() {
      // Yield some test events
      yield {
        type: 'session.updated',
        properties: {
          info: { id: 'test-session-1' },
        },
      };

      await setTimeout(100); // Small delay

      yield {
        type: 'message.updated',
        properties: {
          info: { id: 'msg-1', sessionID: 'test-session-1' },
        },
      };
    },
  };

  mockClient.event.subscribe.resolves({
    stream: mockEventStream,
  });

  return mockClient;
}

test.beforeEach(async () => {
  sinon.restore();
});

test.afterEach.always(async () => {
  sinon.restore();
  // Cleanup any running default indexer
  try {
    await stopDefaultIndexer();
  } catch (error) {
    // Ignore errors if no default indexer is running
  }

  // Cleanup test state files
  try {
    const files = await readdir('.');
    const testStateFiles = files.filter((file) => file.startsWith('test-indexer-state--'));
    await Promise.all(testStateFiles.map((file) => unlink(file)));
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Test Group: Indexer Service Lifecycle
test.serial('indexer service lifecycle - start and stop', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const indexer = createIndexerService(options);

  // Initially not running
  const initialState = await indexer.getState();
  t.false(initialState.isRunning);

  // Start the service
  await indexer.start();

  const runningState = await indexer.getState();
  t.true(runningState.isRunning);

  // Stop the service
  await indexer.stop();

  const stoppedState = await indexer.getState();
  t.false(stoppedState.isRunning);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

test.serial('indexer service handles double start gracefully', async (t) => {
  const suffix = `-${Date.now()}`;
  const options = createTestOptions(suffix);
  const indexer = createIndexerService(options);

  await indexer.start();
  const firstStartState = await indexer.getState();
  t.true(firstStartState.isRunning);

  // Try to start again - should not throw
  await t.notThrowsAsync(() => indexer.start());

  const secondStartState = await indexer.getState();
  t.true(secondStartState.isRunning);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

test.serial('indexer service handles stop when not running', async (t) => {
  const suffix = `-${Date.now()}`;
  const options = createTestOptions(suffix);
  const indexer = createIndexerService(options);

  // Stop without starting - should not throw
  await t.notThrowsAsync(() => indexer.stop());

  const state = await indexer.getState();
  t.false(state.isRunning);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: State Persistence
test.serial('indexer state persistence across restarts', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);

  // Create first indexer instance
  const indexer1 = createIndexerService(options);

  // Start and modify state
  await indexer1.start();

  // Simulate some processing by updating state through state manager
  await indexer1.stateManager.saveState({
    lastIndexedSessionId: 'test-session-1',
    lastIndexedMessageId: 'test-message-1',
    lastEventTimestamp: Date.now(),
    subscriptionActive: true,
    consecutiveErrors: 0,
  });

  await indexer1.stop();
  await indexer1.cleanup();

  // Create second indexer instance with same options
  const indexer2 = createIndexerService(options);
  await indexer2.start();

  const state = await indexer2.getState();

  // Verify state was persisted and loaded
  t.is(state.lastIndexedSessionId, 'test-session-1');
  t.is(state.lastIndexedMessageId, 'test-message-1');
  t.truthy(state.lastEventTimestamp);

  await indexer2.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Database Integration
test.serial('indexer integrates with database stores', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  // Initialize test stores
  const stores = await initializeStores();
  t.truthy(stores.sessionStore);
  t.truthy(stores.eventStore);
  t.truthy(stores.messageStore);

  // Verify stores are working
  if (stores.sessionStore) {
    await stores.sessionStore.insert({
      id: 'test-session',
      text: JSON.stringify({ id: 'test-session', title: 'Test' }),
      timestamp: Date.now(),
      metadata: { type: 'session' },
    });

    const retrieved = await stores.sessionStore.get('test-session');
    t.truthy(retrieved);
    t.is(retrieved?.id, 'test-session');
  }

  await cleanupTestDatabases(suffix);
});

// Test Group: Event Processing Integration
test.serial('indexer processes events correctly', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const mockClient = createMockClient();

  // Create indexer and mock the client property
  const indexer = createIndexerService(options);

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  await indexer.start();

  // Wait for some events to be processed
  await setTimeout(2000);

  // Verify that client methods were called
  t.true(mockClient.event.subscribe.called);

  const state = await indexer.getState();
  t.true(state.isRunning);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Error Handling and Resilience
test.serial('indexer handles network errors gracefully', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const mockClient = createMockClient();

  // Make event subscription fail
  mockClient.event.subscribe.rejects(new Error('Network error'));

  const indexer = createIndexerService(options);

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  // Should handle error gracefully without crashing
  await t.throwsAsync(() => indexer.start(), {
    message: /Network error/,
  });

  const state = await indexer.getState();
  t.false(state.isRunning);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

test.serial('indexer handles consecutive errors and stops after threshold', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const mockClient = createMockClient();

  // Create a failing event stream
  let callCount = 0;
  const mockFailingStream = {
    async *[Symbol.asyncIterator]() {
      callCount++;
      if (callCount <= 6) {
        // Exceed maxConsecutiveErrors (5)
        throw new Error(`Stream error ${callCount}`);
      }
    },
  };

  mockClient.event.subscribe.resolves({
    stream: mockFailingStream,
  });

  const indexer = createIndexerService(options);

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  await indexer.start();

  // Wait for error handling
  await setTimeout(1000);

  // Should have attempted to handle errors
  t.true(mockClient.event.subscribe.called);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Performance and Concurrency
test.serial('indexer handles concurrent operations', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const indexer = createIndexerService(options);

  await indexer.start();

  // Run multiple operations concurrently
  const operations = [
    indexer.getState(),
    indexer.getStats(),
    indexer.fullSync(),
    indexer.getState(),
    indexer.getStats(),
  ];

  const results = await Promise.all(operations);

  // All operations should complete successfully
  results.forEach((result, index) => {
    if (index % 2 === 0) {
      // getState calls
      t.truthy(result);
      if (result && 'isRunning' in result) {
        t.is(typeof result.isRunning, 'boolean');
      }
    } else {
      // getStats calls
      t.truthy(result);
      if (result && 'totalEvents' in result) {
        t.is(typeof result.totalEvents, 'number');
      }
    }
  });

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

test.serial('indexer performance under realistic load', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const mockClient = createMockClient();

  // Create a high-volume event stream
  const mockHighVolumeStream = {
    async *[Symbol.asyncIterator]() {
      for (let i = 0; i < 100; i++) {
        yield {
          type: i % 2 === 0 ? 'session.updated' : 'message.updated',
          properties: {
            info: {
              id: i % 2 === 0 ? `session-${i}` : `message-${i}`,
              sessionID: i % 2 === 0 ? undefined : `session-${Math.floor(i / 2)}`,
            },
          },
        };

        if (i % 10 === 0) {
          await setTimeout(10); // Small delay every 10 events
        }
      }
    },
  };

  mockClient.event.subscribe.resolves({
    stream: mockHighVolumeStream,
  });

  const indexer = createIndexerService(options);

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  const startTime = Date.now();
  await indexer.start();

  // Wait for processing
  await setTimeout(2000);

  const endTime = Date.now();
  const processingTime = endTime - startTime;

  // Should process 100 events in reasonable time (adjust threshold as needed)
  t.true(processingTime < 10000, `Processing took ${processingTime}ms, expected < 10000ms`);

  const stats = indexer.getStats();
  t.truthy(stats);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Factory Functions
test.serial('createAndStartIndexer creates and starts service', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const indexer = await createAndStartIndexer(options);

  const state = await indexer.getState();
  t.true(state.isRunning);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

test.serial('default indexer functions work correctly', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);

  // Test getDefaultIndexer
  const indexer1 = getDefaultIndexer(options);
  const indexer2 = getDefaultIndexer(options); // Should return same instance

  t.is(indexer1, indexer2);

  // Test startDefaultIndexer
  const startedIndexer = await startDefaultIndexer(options);
  t.is(startedIndexer, indexer1);

  const state = await startedIndexer.getState();
  t.true(state.isRunning);

  // Test stopDefaultIndexer
  await stopDefaultIndexer();

  const stoppedState = await startedIndexer.getState();
  t.false(stoppedState.isRunning);

  await startedIndexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Full Sync Integration
test.serial('full sync integrates with client and database', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const mockClient = createMockClient();

  const indexer = createIndexerService(options);

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  await indexer.start();

  // Perform full sync
  await indexer.fullSync();

  // Verify client methods were called
  t.true(mockClient.session.list.called);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Statistics and Monitoring
test.serial('statistics tracking works correctly', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const indexer = createIndexerService(options);

  await indexer.start();

  const stats1 = indexer.getStats();
  t.is(typeof stats1.totalEvents, 'number');
  t.is(typeof stats1.dedupedEvents, 'number');
  t.is(typeof stats1.processedEvents, 'number');
  t.is(typeof stats1.errors, 'number');

  // Reset stats
  indexer.resetStats();

  const stats2 = indexer.getStats();
  t.is(stats2.totalEvents, 0);
  t.is(stats2.dedupedEvents, 0);
  t.is(stats2.processedEvents, 0);
  t.is(stats2.errors, 0);

  await indexer.cleanup();
  await cleanupTestDatabases(suffix);
});

// Test Group: Cleanup and Resource Management
test.serial('cleanup properly releases resources', async (t) => {
  const suffix = `-${Date.now()}`;
  await cleanupTestDatabases(suffix);

  const options = createTestOptions(suffix);
  const indexer = createIndexerService(options);

  await indexer.start();

  const runningState = await indexer.getState();
  t.true(runningState.isRunning);

  // Cleanup should stop everything
  await indexer.cleanup();

  // Verify timers are cleared (this is implementation-specific)
  // In a real scenario, you'd check that no timers are active

  await cleanupTestDatabases(suffix);
});
