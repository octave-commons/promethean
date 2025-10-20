#!/usr/bin/env node

/**
 * Real Failure Integration Tests for Dual Store
 * Tests actual dual store failures - not just empty results
 * Reveals what really happens when the infrastructure fails
 */

import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';
import { get, list } from '../actions/sessions/index.js';
import { initializeStores } from '../index.js';

let testSessionStore: DualStoreManager<'text', 'timestamp'>;
let testAgentTaskStore: DualStoreManager<'text', 'timestamp'>;

test.before(async () => {
  testSessionStore = await DualStoreManager.create('test_failures', 'text', 'timestamp');
  testAgentTaskStore = await DualStoreManager.create('test_agent_failures', 'text', 'timestamp');
  initializeStores(testSessionStore, testAgentTaskStore);
});

test.after.always(async () => {
  try {
    if (testSessionStore) {
      const mongoCollection = testSessionStore.getMongoCollection();
      await mongoCollection.deleteMany({});
    }
    if (testAgentTaskStore) {
      const mongoCollection = testAgentTaskStore.getMongoCollection();
      await mongoCollection.deleteMany({});
    }
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
});

test.serial('Test actual dual store failure - corrupted data', async (t) => {
  // Insert corrupted JSON data that will cause parsing to fail
  await testSessionStore.insert({
    id: `session:corrupted-session`,
    text: '{ invalid json data',
    timestamp: new Date().toISOString(),
    metadata: {
      type: 'session',
      sessionId: 'corrupted-session',
    },
  });

  // This should fail when trying to parse the corrupted data
  const result = await get({
    sessionId: 'corrupted-session',
  });

  // Should handle the parsing failure gracefully
  t.true(typeof result === 'string');
  t.true(result.includes('Failed') || result.includes('Error'));
});

test.serial('Test actual dual store failure - broken connection', async (t) => {
  // Simulate broken database connection by overriding get method to throw
  testSessionStore.get = async () => {
    throw new Error('Database connection broken');
  };

  // This should fail when trying to access the closed store
  const result = await get({
    sessionId: 'test-after-close',
  });

  // Should fail gracefully, not fallback to client
  t.true(typeof result === 'string');
  t.true(result.includes('Failed') || result.includes('Error'));
});

test.serial('Test dual store failure - simulate network timeout', async (t) => {
  // Reopen store for this test
  testSessionStore = await DualStoreManager.create('test_timeout', 'text', 'timestamp');
  initializeStores(testSessionStore, testAgentTaskStore);

  // Override the get method to simulate timeout
  const originalGet = testSessionStore.get.bind(testSessionStore);
  testSessionStore.get = async (id: string) => {
    if (id === 'session:timeout-session') {
      // Simulate timeout by delaying
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return originalGet(id);
    }
    return originalGet(id);
  };

  // This should timeout and fail
  const result = await get({
    sessionId: 'timeout-session',
  });

  // Should fail due to timeout
  t.true(typeof result === 'string');
  t.true(result.includes('Failed') || result.includes('Error'));
});

test.serial('Test dual store failure - simulate memory exhaustion', async (t) => {
  // Override getMostRecent to simulate memory error
  testSessionStore.getMostRecent = async () => {
    throw new Error('Out of memory');
  };

  // Try to list - this should fail due to simulated memory error
  const result = await list({
    limit: 10,
    offset: 0,
  });

  // Should fail gracefully
  t.true(typeof result === 'string');
  t.true(result.includes('Failed') || result.includes('Error'));
});

test.serial('Test dual store failure - concurrent access overload', async (t) => {
  // Reopen clean store
  testSessionStore = await DualStoreManager.create('test_concurrent', 'text', 'timestamp');
  initializeStores(testSessionStore, testAgentTaskStore);

  // Insert some test data
  await testSessionStore.insert({
    id: `session:concurrent-test`,
    text: JSON.stringify({
      id: 'concurrent-test',
      title: 'Concurrent Test Session',
      createdAt: new Date().toISOString(),
    }),
    timestamp: new Date().toISOString(),
    metadata: {
      type: 'session',
      sessionId: 'concurrent-test',
    },
  });

  // Launch many concurrent operations to overload the system
  const promises = Array.from({ length: 50 }, () =>
    get({
      sessionId: 'concurrent-test',
    }),
  );

  const results = await Promise.allSettled(promises);

  // Count successes vs failures
  const successes = results.filter((r) => r.status === 'fulfilled').length;
  const failures = results.filter((r) => r.status === 'rejected').length;

  console.log(`Concurrent test: ${successes} successes, ${failures} failures`);

  // Should handle concurrent access reasonably well
  t.true(successes > 0, 'Should have some successful operations');
});

test.serial('Test dual store failure - invalid operations', async (t) => {
  // Test with invalid session IDs that might cause database errors
  const invalidIds = [
    '', // Empty string
    '../../../etc/passwd', // Path traversal
    'session-with\x00null-byte', // Null byte
    'a'.repeat(10000), // Extremely long ID
  ];

  for (const invalidId of invalidIds) {
    const result = await get({
      sessionId: invalidId,
    });

    // Should handle invalid input gracefully
    t.true(typeof result === 'string');
  }
});
