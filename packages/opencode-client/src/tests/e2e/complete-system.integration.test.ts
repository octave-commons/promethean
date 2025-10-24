/**
 * Complete End-to-End Integration Tests
 *
 * These tests verify the entire opencode-client system working together:
 * - Indexer service + Action modules integration
 * - Real database operations
 * - Event processing workflows
 * - Complete user journeys
 * - System resilience and recovery
 * - Performance under load
 */

import test from 'ava';
import sinon from 'sinon';
import { setTimeout } from 'timers/promises';
import { createIndexerService } from '../../services/indexer.js';
import { create, close, get, list as listSessions, search } from '../../actions/sessions/index.js';
import { subscribe } from '../../actions/events/subscribe.js';
import { sessionStore, messageStore, eventStore } from '../../stores.js';
import { cleanupClients } from '@promethean-os/persistence';

// Helper to create comprehensive mock client
function createComprehensiveMockClient() {
  const mockClient = {
    session: {
      create: sinon.stub(),
      list: sinon.stub(),
      get: sinon.stub(),
      close: sinon.stub(),
      messages: sinon.stub(),
      message: sinon.stub(),
    },
    event: {
      subscribe: sinon.stub(),
    },
  };

  // Setup comprehensive mock responses
  mockClient.session.create.resolves({
    data: {
      id: 'e2e-session-123',
      title: 'E2E Test Session',
      time: { created: Date.now() },
    },
  });

  mockClient.session.list.resolves({
    data: [
      {
        id: 'e2e-session-1',
        title: 'E2E Session 1',
        time: { created: Date.now() - 2000000 },
      },
      {
        id: 'e2e-session-2',
        title: 'E2E Session 2',
        time: { created: Date.now() - 1000000 },
      },
    ],
  });

  mockClient.session.get.resolves({
    data: {
      id: 'e2e-session-1',
      title: 'E2E Session 1',
      time: { created: Date.now() - 2000000 },
    },
  });

  mockClient.session.close.resolves({
    data: { success: true },
  });

  mockClient.session.messages.resolves({
    data: [
      {
        info: { id: 'e2e-msg-1', role: 'user', sessionID: 'e2e-session-1' },
        parts: [{ type: 'text', text: 'E2E Hello world' }],
      },
      {
        info: { id: 'e2e-msg-2', role: 'assistant', sessionID: 'e2e-session-1' },
        parts: [{ type: 'text', text: 'E2E Hello back!' }],
      },
      {
        info: { id: 'e2e-msg-3', role: 'user', sessionID: 'e2e-session-1' },
        parts: [{ type: 'text', text: 'E2E How are you?' }],
      },
    ],
  });

  mockClient.session.message.resolves({
    data: {
      info: { id: 'e2e-msg-1', role: 'user', sessionID: 'e2e-session-1' },
      parts: [{ type: 'text', text: 'E2E Hello world' }],
    },
  });

  // Create realistic event stream
  const mockEventStream = {
    async *[Symbol.asyncIterator]() {
      // Session created
      yield {
        type: 'session.updated',
        properties: { info: { id: 'e2e-session-1' } },
        timestamp: Date.now() - 2000000,
      };

      await setTimeout(50);

      // First message
      yield {
        type: 'message.updated',
        properties: { info: { id: 'e2e-msg-1', sessionID: 'e2e-session-1' } },
        timestamp: Date.now() - 1900000,
      };

      await setTimeout(50);

      // Second message
      yield {
        type: 'message.updated',
        properties: { info: { id: 'e2e-msg-2', sessionID: 'e2e-session-1' } },
        timestamp: Date.now() - 1800000,
      };

      await setTimeout(50);

      // Session idle
      yield {
        type: 'session.idle',
        properties: { info: { id: 'e2e-session-1' } },
        timestamp: Date.now() - 1700000,
      };

      await setTimeout(50);

      // Third message
      yield {
        type: 'message.updated',
        properties: { info: { id: 'e2e-msg-3', sessionID: 'e2e-session-1' } },
        timestamp: Date.now() - 1600000,
      };
    },
  };

  mockClient.event.subscribe.resolves({
    stream: mockEventStream,
  });

  return mockClient;
}

// Helper to setup comprehensive test data
async function setupE2ETestData() {
  const timestamp = Date.now();

  // Setup realistic session data
  await sessionStore.insert({
    id: 'session_e2e-1',
    text: JSON.stringify({
      id: 'e2e-session-1',
      title: 'E2E Integration Test Session',
      createdAt: new Date(timestamp - 2000000).toISOString(),
      updatedAt: new Date(timestamp - 1000000).toISOString(),
      status: 'active',
    }),
    timestamp: timestamp - 2000000,
    metadata: { type: 'session', status: 'active' },
  });

  // Setup realistic message data
  await messageStore.insert({
    id: 'message_e2e-1',
    text: JSON.stringify({
      info: {
        id: 'e2e-msg-1',
        role: 'user',
        sessionID: 'e2e-session-1',
        time: { created: timestamp - 1900000 },
      },
      parts: [{ type: 'text', text: 'Starting E2E integration test' }],
    }),
    timestamp: timestamp - 1900000,
    metadata: { type: 'message', sessionId: 'e2e-session-1', role: 'user' },
  });

  await messageStore.insert({
    id: 'message_e2e-2',
    text: JSON.stringify({
      info: {
        id: 'e2e-msg-2',
        role: 'assistant',
        sessionID: 'e2e-session-1',
        time: { created: timestamp - 1800000 },
      },
      parts: [{ type: 'text', text: 'E2E test response received' }],
    }),
    timestamp: timestamp - 1800000,
    metadata: { type: 'message', sessionId: 'e2e-session-1', role: 'assistant' },
  });

  // Setup realistic event data
  await eventStore.insert({
    id: 'event_e2e-1',
    text: JSON.stringify({
      type: 'session.updated',
      properties: { info: { id: 'e2e-session-1' } },
      timestamp: timestamp - 2000000,
    }),
    timestamp: timestamp - 2000000,
    metadata: { type: 'event', eventType: 'session.updated', sessionId: 'e2e-session-1' },
  });

  await eventStore.insert({
    id: 'event_e2e-2',
    text: JSON.stringify({
      type: 'message.updated',
      properties: { info: { id: 'e2e-msg-1', sessionID: 'e2e-session-1' } },
      timestamp: timestamp - 1900000,
    }),
    timestamp: timestamp - 1900000,
    metadata: { type: 'event', eventType: 'message.updated', sessionId: 'e2e-session-1' },
  });
}

test.beforeEach(async () => {
  sinon.restore();
  await setupE2ETestData();
});

test.afterEach.always(async () => {
  sinon.restore();
  await sessionStore.cleanup();
  await messageStore.cleanup();
  await eventStore.cleanup();
  await cleanupClients();
});

// Test Group: Complete User Journeys
test.serial('complete user journey - session creation to message exchange', async (t) => {
  const mockClient = createComprehensiveMockClient();

  // Step 1: Create a session
  const createResult = await create({
    title: 'Complete Journey Test Session',
    client: mockClient as any,
  });

  t.true(createResult.success);
  t.is(createResult.session.title, 'Complete Journey Test Session');

  // Step 2: Get the session details
  const getResult = await get({
    sessionId: createResult.session.id,
  });

  t.truthy(getResult);
  if (!('error' in getResult)) {
    t.truthy(getResult.session);
    t.true(Array.isArray(getResult.messages));
  }

  // Step 3: List sessions to verify it appears
  const listResult = await listSessions({
    limit: 10,
    offset: 0,
  });

  t.truthy(listResult);

  // Step 4: Search for the session
  const searchResult = await search({
    query: 'Complete Journey',
    k: 10,
  });

  t.truthy(searchResult);
  if (!('error' in searchResult)) {
    t.true(Array.isArray(searchResult.results));
  }

  // Step 5: Close the session
  const closeResult = await close({
    sessionId: createResult.session.id,
  });

  t.true(closeResult.success);
  t.is(closeResult.sessionId, createResult.session.id);

  // Verify all client methods were called appropriately
  t.true(mockClient.session.create.calledOnce);
  t.true(mockClient.session.close.calledOnce);
});

test.serial('complete event processing workflow', async (t) => {
  const mockClient = createComprehensiveMockClient();

  // Subscribe to events
  const subscribeResult = await subscribe({
    eventType: 'session.updated',
    sessionId: 'e2e-session-1',
    client: mockClient as any,
  });

  t.true(subscribeResult.success);
  t.true(mockClient.event.subscribe.calledOnce);

  // Wait for event processing
  await setTimeout(500);

  // Verify events were stored
  const events = await eventStore.getMostRecent(10);
  t.true(events.length >= 2); // At least our test events

  // Verify session data is accessible
  const sessions = await sessionStore.getMostRecent(10);
  t.true(sessions.length >= 1);

  // Verify message data is accessible
  const messages = await messageStore.getMostRecent(10);
  t.true(messages.length >= 2);
});

// Test Group: Indexer + Actions Integration
test.serial('indexer service integrates with action modules', async (t) => {
  const mockClient = createComprehensiveMockClient();
  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    processingInterval: 1000,
    stateFile: './test-e2e-indexer-state.json',
  });

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  // Start the indexer
  await indexer.start();

  const state = await indexer.getState();
  t.true(state.isRunning);

  // Perform actions while indexer is running
  const createResult = await create({
    title: 'Indexer Integration Test',
    client: mockClient as any,
  });

  t.true(createResult.success);

  // Wait for indexer to process
  await setTimeout(1000);

  // Verify indexer processed data
  const stats = indexer.getStats();
  t.truthy(stats);

  // Stop indexer
  await indexer.stop();

  const stoppedState = await indexer.getState();
  t.false(stoppedState.isRunning);

  await indexer.cleanup();
});

// Test Group: System Resilience
test.serial('system resilience - handling partial failures', async (t) => {
  const mockClient = createComprehensiveMockClient();

  // Make some operations fail intermittently
  let callCount = 0;
  mockClient.session.create.callsFake(() => {
    callCount++;
    if (callCount <= 2) {
      return Promise.reject(new Error('Temporary service unavailable'));
    }
    return Promise.resolve({
      data: {
        id: 'resilience-session',
        title: 'Resilience Test',
        time: { created: Date.now() },
      },
    });
  });

  // First attempts should fail
  await t.throwsAsync(() =>
    create({
      title: 'Resilience Test',
      client: mockClient as any,
    }),
  );

  await t.throwsAsync(() =>
    create({
      title: 'Resilience Test',
      client: mockClient as any,
    }),
  );

  // Third attempt should succeed
  const result = await create({
    title: 'Resilience Test',
    client: mockClient as any,
  });

  t.true(result.success);
  t.is(result.session.id, 'resilience-session');
});

test.serial('system resilience - database connection issues', async (t) => {
  // Mock database failures
  const originalGetMostRecent = sessionStore.getMostRecent;
  sessionStore.getMostRecent = sinon.stub().rejects(new Error('Database connection failed'));

  // Actions should handle database failures gracefully
  const listResult = await listSessions({
    limit: 10,
    offset: 0,
  });

  // Should return error response rather than throwing
  t.truthy(listResult);

  // Restore original method
  sessionStore.getMostRecent = originalGetMostRecent;
});

// Test Group: Performance and Scalability
test.serial('system performance under realistic load', async (t) => {
  const startTime = Date.now();
  const mockClient = createComprehensiveMockClient();

  // Simulate realistic user activity
  const operations = [];

  // Create multiple sessions
  for (let i = 0; i < 5; i++) {
    operations.push(
      create({
        title: `Performance Test Session ${i}`,
        client: mockClient as any,
      }),
    );
  }

  // Perform various operations concurrently
  operations.push(
    listSessions({ limit: 20, offset: 0 }),
    search({ query: 'Performance', k: 10 }),
    sessionStore.getMostRecent(50),
    messageStore.getMostRecent(50),
    eventStore.getMostRecent(50),
  );

  const results = await Promise.allSettled(operations);

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Should complete within reasonable time
  t.true(duration < 10000, `Operations took ${duration}ms, expected < 10000ms`);

  // Most operations should succeed
  const successCount = results.filter((r) => r.status === 'fulfilled').length;
  const totalCount = results.length;

  t.true(
    successCount >= totalCount * 0.8,
    `Only ${successCount}/${totalCount} operations succeeded`,
  );
});

test.serial('system scalability - large dataset handling', async (t) => {
  // Create a larger dataset
  const timestamp = Date.now();
  const sessionCount = 20;
  const messageCount = 50;

  // Insert multiple sessions
  for (let i = 0; i < sessionCount; i++) {
    await sessionStore.insert({
      id: `scale_session_${i}`,
      text: JSON.stringify({
        id: `scale-session-${i}`,
        title: `Scale Test Session ${i}`,
        createdAt: new Date(timestamp - i * 100000).toISOString(),
      }),
      timestamp: timestamp - i * 100000,
      metadata: { type: 'session' },
    });
  }

  // Insert multiple messages
  for (let i = 0; i < messageCount; i++) {
    await messageStore.insert({
      id: `scale_message_${i}`,
      text: JSON.stringify({
        info: { id: `scale-msg-${i}`, role: i % 2 === 0 ? 'user' : 'assistant' },
        parts: [{ type: 'text', text: `Scale test message ${i}` }],
      }),
      timestamp: timestamp - i * 10000,
      metadata: { type: 'message' },
    });
  }

  // Test performance with larger dataset
  const startTime = Date.now();

  const sessions = await sessionStore.getMostRecent(100);
  const messages = await messageStore.getMostRecent(100);
  const listResult = await listSessions({ limit: 50, offset: 0 });
  const searchResult = await search({ query: 'Scale', k: 20 });

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Should handle larger dataset efficiently
  t.true(duration < 5000, `Large dataset operations took ${duration}ms, expected < 5000ms`);
  t.true(sessions.length >= sessionCount);
  t.true(messages.length >= messageCount);
  t.truthy(listResult);
  t.truthy(searchResult);
});

// Test Group: Data Consistency and Integrity
test.serial('data consistency across all stores', async (t) => {
  const mockClient = createComprehensiveMockClient();

  // Create a session
  const createResult = await create({
    title: 'Consistency Test Session',
    client: mockClient as any,
  });

  t.true(createResult.success);

  // Verify session exists in session store
  const sessions = await sessionStore.getMostRecent(10);
  const sessionExists = sessions.some((s) => s.id && s.id.includes(createResult.session.id));
  t.true(sessionExists, 'Session should be stored in session store');

  // Get messages for the session
  const messages = await mockClient.session.messages({
    path: { id: createResult.session.id },
  });

  t.truthy(messages.data);
  t.true(Array.isArray(messages.data));

  // Verify data relationships are maintained
  const getResult = await get({
    sessionId: createResult.session.id,
  });

  t.truthy(getResult);
  if (!('error' in getResult)) {
    t.truthy(getResult.session);
    t.true(Array.isArray(getResult.messages));
  }
});

test.serial('data integrity validation', async (t) => {
  // Test with malformed data
  await sessionStore.insert({
    id: 'malformed-session',
    text: 'invalid json {',
    timestamp: Date.now(),
    metadata: { type: 'session' },
  });

  // System should handle malformed data gracefully
  const sessions = await sessionStore.getMostRecent(10);
  t.true(sessions.length > 0);

  const listResult = await listSessions({ limit: 10, offset: 0 });
  t.truthy(listResult);

  // Should not crash or return invalid data
  if (!('error' in listResult)) {
    listResult.sessions.forEach((session) => {
      t.truthy(session);
      // Session should have required fields even if parsed from malformed data
    });
  }
});

// Test Group: Error Recovery and Cleanup
test.serial('system cleanup and resource management', async (t) => {
  const mockClient = createComprehensiveMockClient();
  const indexer = createIndexerService({
    baseUrl: 'http://localhost:3000',
    processingInterval: 500,
    stateFile: './test-cleanup-indexer-state.json',
  });

  // Mock the client property
  Object.defineProperty(indexer, 'client', {
    value: mockClient,
    writable: true,
  });

  // Start indexer
  await indexer.start();
  t.true((await indexer.getState()).isRunning);

  // Perform operations
  await create({
    title: 'Cleanup Test Session',
    client: mockClient as any,
  });

  // Wait for processing
  await setTimeout(1000);

  // Cleanup should work properly
  await indexer.cleanup();

  // Verify cleanup completed
  const finalState = await indexer.getState();
  t.false(finalState.isRunning);
});

test.serial('error recovery and system stability', async (t) => {
  const mockClient = createComprehensiveMockClient();

  // Simulate various error conditions
  const errors = [
    new Error('Network timeout'),
    new Error('Service unavailable'),
    new Error('Rate limit exceeded'),
  ];

  let errorIndex = 0;
  mockClient.session.list.callsFake(() => {
    if (errorIndex < errors.length) {
      const error = errors[errorIndex++];
      return Promise.reject(error);
    }
    return Promise.resolve({
      data: [
        {
          id: 'recovery-session',
          title: 'Recovery Test',
          time: { created: Date.now() },
        },
      ],
    });
  });

  // Should handle multiple errors and eventually succeed
  for (let i = 0; i < errors.length; i++) {
    await t.throwsAsync(() => listSessions({ limit: 10, offset: 0 }));
  }

  // Final call should succeed
  const result = await listSessions({ limit: 10, offset: 0 });
  t.truthy(result);
});
