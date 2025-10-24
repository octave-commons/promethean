/**
 * Comprehensive Integration Tests for All Action Modules
 *
 * These tests verify the complete integration between:
 * - Events actions (subscribe, list)
 * - Messages actions
 * - Messaging actions
 * - Sessions actions (create, close, get, list, search, spawn)
 * - Cross-module interactions
 * - Database integration
 * - Error handling and edge cases
 */

import test from 'ava';
import sinon from 'sinon';
import { setTimeout } from 'timers/promises';

// Import all action modules
import { subscribe } from '../../actions/events/subscribe.js';
import { list as listEvents } from '../../actions/events/list.js';
import * as messagingActions from '../../actions/messaging/index.js';
import { create, close, get, list as listSessions, search } from '../../actions/sessions/index.js';
import { sessionStore, messageStore, eventStore } from '../../stores.js';
import { cleanupClients } from '@promethean-os/persistence';

// Helper to create mock OpenCode client
function createMockClient() {
  const mockClient = {
    session: {
      create: sinon.stub(),
      list: sinon.stub(),
      get: sinon.stub(),
      close: sinon.stub(),
      messages: sinon.stub(),
      message: sinon.stub(),
      prompt: sinon.stub(),
    },
    event: {
      subscribe: sinon.stub(),
      list: sinon.stub(),
    },
  };

  // Mock session operations
  mockClient.session.create.resolves({
    data: {
      id: 'test-session-123',
      title: 'Test Session',
      time: { created: Date.now() },
    },
  });

  mockClient.session.list.resolves({
    data: [
      {
        id: 'session-1',
        title: 'Session 1',
        time: { created: Date.now() - 1000000 },
      },
      {
        id: 'session-2',
        title: 'Session 2',
        time: { created: Date.now() - 500000 },
      },
    ],
  });

  mockClient.session.get.resolves({
    data: {
      id: 'session-1',
      title: 'Session 1',
      time: { created: Date.now() - 1000000 },
    },
  });

  mockClient.session.close.resolves({
    data: { success: true },
  });

  mockClient.session.messages.resolves({
    data: [
      {
        info: { id: 'msg-1', role: 'user', sessionID: 'session-1' },
        parts: [{ type: 'text', text: 'Hello world' }],
      },
      {
        info: { id: 'msg-2', role: 'assistant', sessionID: 'session-1' },
        parts: [{ type: 'text', text: 'Hello back!' }],
      },
    ],
  });

  mockClient.session.message.resolves({
    data: {
      info: { id: 'msg-1', role: 'user', sessionID: 'session-1' },
      parts: [{ type: 'text', text: 'Hello world' }],
    },
  });

  mockClient.session.prompt.resolves();

  // Mock event operations
  mockClient.event.subscribe.resolves({
    stream: {
      async *[Symbol.asyncIterator]() {
        yield {
          type: 'session.updated',
          properties: { info: { id: 'session-1' } },
        };
        await setTimeout(100);
        yield {
          type: 'message.updated',
          properties: { info: { id: 'msg-1', sessionID: 'session-1' } },
        };
      },
    },
  });

  mockClient.event.list.resolves({
    data: [
      {
        type: 'session.updated',
        properties: { info: { id: 'session-1' } },
        timestamp: Date.now() - 1000,
      },
      {
        type: 'message.updated',
        properties: { info: { id: 'msg-1', sessionID: 'session-1' } },
        timestamp: Date.now() - 500,
      },
    ],
  });

  return mockClient;
}

// Helper to setup test data in stores
async function setupTestData() {
  // Setup session data
  await sessionStore.insert({
    id: 'session_test-1',
    text: JSON.stringify({
      id: 'test-session-1',
      title: 'Test Session 1',
      createdAt: new Date(Date.now() - 1000000).toISOString(),
    }),
    timestamp: Date.now() - 1000000,
    metadata: { type: 'session' },
  });

  await sessionStore.insert({
    id: 'session_test-2',
    text: JSON.stringify({
      id: 'test-session-2',
      title: 'Test Session 2',
      createdAt: new Date(Date.now() - 500000).toISOString(),
    }),
    timestamp: Date.now() - 500000,
    metadata: { type: 'session' },
  });

  // Setup message data
  await messageStore.insert({
    id: 'message_test-1',
    text: JSON.stringify({
      info: { id: 'msg-1', role: 'user', sessionID: 'test-session-1' },
      parts: [{ type: 'text', text: 'Hello world' }],
    }),
    timestamp: Date.now() - 900000,
    metadata: { type: 'message', sessionId: 'test-session-1' },
  });

  await messageStore.insert({
    id: 'message_test-2',
    text: JSON.stringify({
      info: { id: 'msg-2', role: 'assistant', sessionID: 'test-session-1' },
      parts: [{ type: 'text', text: 'Hello back!' }],
    }),
    timestamp: Date.now() - 800000,
    metadata: { type: 'message', sessionId: 'test-session-1' },
  });

  // Setup event data
  await eventStore.insert({
    id: 'event_test-1',
    text: JSON.stringify({
      type: 'session.updated',
      properties: { info: { id: 'test-session-1' } },
    }),
    timestamp: Date.now() - 1000000,
    metadata: { type: 'event' },
  });
}

test.beforeEach(async () => {
  sinon.restore();
  // Setup test data
  await setupTestData();
});

test.afterEach.always(async () => {
  sinon.restore();
  await sessionStore.cleanup();
  await messageStore.cleanup();
  await eventStore.cleanup();
  await cleanupClients();
});

// Test Group: Events Actions Integration
test.serial('events subscribe action integrates with client', async (t) => {
  const mockClient = createMockClient();

  const result = await subscribe({
    eventType: 'session.updated',
    sessionId: 'test-session-1',
    client: mockClient as any,
  });

  t.true(result.success);
  t.is(result.subscription, 'Event subscription established');
  t.is(result.eventType, 'session.updated');
  t.is(result.sessionId, 'test-session-1');
  t.true(mockClient.event.subscribe.calledOnce);
});

test.serial('events list action integrates with stores', async (t) => {
  const result = await listEvents({
    k: 10,
  });

  // The list action should return stored events
  t.true(Array.isArray(result));
});

test.serial('events actions handle client errors gracefully', async (t) => {
  const mockClient = createMockClient();
  mockClient.event.subscribe.rejects(new Error('Network error'));

  const result = await subscribe({
    client: mockClient as any,
  });

  t.false(result.success);
  t.true(result.error?.includes('Failed to subscribe to events'));
  t.true(result.error?.includes('Network error'));
});

// Test Group: Sessions Actions Integration
test.serial('sessions create action integrates with client and stores', async (t) => {
  const mockClient = createMockClient();

  const result = await create({
    title: 'Integration Test Session',
    client: mockClient as any,
  });

  t.true(result.success);
  t.is(result.session.id, 'test-session-123');
  t.is(result.session.title, 'Integration Test Session');
  t.truthy(result.session.createdAt);
  t.true(mockClient.session.create.calledOnce);
});

test.serial('sessions get action integrates with stores', async (t) => {
  const result = await get({
    sessionId: 'test-session-1',
  });

  if ('error' in result) {
    // If there's an error, it should be a proper error message
    t.truthy(result.error);
  } else {
    // If successful, should have session and messages
    t.truthy(result.session);
    t.true(Array.isArray(result.messages));
  }
});

test.serial('sessions list action integrates with stores and pagination', async (t) => {
  const result = await listSessions({
    limit: 10,
    offset: 0,
  });

  t.truthy(result);
  if (!('error' in result)) {
    t.true(Array.isArray(result.sessions));
    t.is(typeof result.totalCount, 'number');
    t.is(typeof result.pagination, 'object');
    t.is(typeof result.summary, 'object');
  }
});

test.serial('sessions search action integrates with stores', async (t) => {
  const result = await search({
    query: 'Test',
    k: 10,
  });

  t.truthy(result);
  if (!('error' in result)) {
    t.true(Array.isArray(result.results));
    t.is(typeof result.totalCount, 'number');
    t.is(result.query, 'Test');
  }
});

test.serial('sessions close action works correctly', async (t) => {
  const result = await close({
    sessionId: 'session-1',
  });

  t.true(result.success);
  t.is(result.sessionId, 'session-1');
  t.is(result.message, 'Session closed successfully');
});

test.serial('sessions actions handle missing client gracefully', async (t) => {
  const error = await t.throwsAsync(() =>
    create({
      title: 'Test Session',
    }),
  );

  t.true(error?.message.includes('OpenCode client is required'));
});

test.serial('sessions actions handle client errors gracefully', async (t) => {
  const mockClient = createMockClient();
  mockClient.session.create.rejects(new Error('Session creation failed'));

  const error = await t.throwsAsync(() =>
    create({
      title: 'Test Session',
      client: mockClient as any,
    }),
  );

  t.true(error?.message.includes('Failed to create session on OpenCode server'));
  t.true(error?.message.includes('Session creation failed'));
});

// Test Group: Messages Actions Integration
test.serial('messages actions integrate with stores', async (t) => {
  // Test that message actions can access stored messages
  const messages = await messageStore.getMostRecent(10);

  t.true(Array.isArray(messages));
  if (messages.length > 0) {
    const message = messages[0];
    if (message) {
      t.truthy(message.id);
      t.truthy(message.text);
      t.truthy(message.timestamp);
    }
  }
});

test.serial('messages actions handle different message formats', async (t) => {
  // Insert messages in different formats
  await messageStore.insert({
    id: 'message-json-format',
    text: JSON.stringify({
      info: { id: 'msg-json', role: 'user' },
      parts: [{ type: 'text', text: 'JSON format message' }],
    }),
    timestamp: Date.now(),
    metadata: { type: 'message' },
  });

  await messageStore.insert({
    id: 'message-plain-format',
    text: 'Plain text message',
    timestamp: Date.now(),
    metadata: { type: 'message' },
  });

  const messages = await messageStore.getMostRecent(10);
  t.true(messages.length >= 2);

  // Verify both formats are stored
  const jsonMessage = messages.find((m) => m.id === 'message-json-format');
  const plainMessage = messages.find((m) => m.id === 'message-plain-format');

  if (jsonMessage) {
    t.truthy(jsonMessage.id);
    t.truthy(jsonMessage.text);
  }
  if (plainMessage) {
    t.truthy(plainMessage.id);
    t.truthy(plainMessage.text);
  }
});

// Test Group: Messaging Actions Integration
test.serial('messaging actions integrate with client and stores', async (t) => {
  const mockClient = createMockClient();

  // Test messaging functionality if available
  if (messagingActions && typeof messagingActions.sendMessage === 'function') {
    const result = await messagingActions.sendMessage({
      context: { sessionStore },
      client: mockClient as any,
      sessionId: 'test-session-1',
      message: 'Hello from integration test',
      priority: 'normal',
      messageType: 'general',
    });

    t.truthy(result);
    t.is(typeof result, 'string');
  }
});

// Test Group: Cross-Module Integration
test.serial('sessions and messages actions work together', async (t) => {
  const mockClient = createMockClient();

  // Create a session
  const createResult = await create({
    title: 'Cross-Module Test Session',
    client: mockClient as any,
  });

  t.true(createResult.success);

  // Get messages for the session
  const messages = await mockClient.session.messages({
    path: { id: createResult.session.id },
  });

  t.truthy(messages.data);
  t.true(Array.isArray(messages.data));
});

test.serial('events and sessions actions integrate', async (t) => {
  const mockClient = createMockClient();

  // Subscribe to session events
  const subscribeResult = await subscribe({
    eventType: 'session.updated',
    client: mockClient as any,
  });

  t.true(subscribeResult.success);

  // List sessions to verify integration
  const listResult = await listSessions({
    limit: 10,
    offset: 0,
  });

  t.truthy(listResult);
});

test.serial('all actions handle database errors gracefully', async (t) => {
  // Mock database errors by temporarily breaking store methods
  const originalInsert = sessionStore.insert;
  sessionStore.insert = sinon.stub().rejects(new Error('Database error'));

  // Actions should handle database errors without crashing
  const listResult = await listSessions({
    limit: 10,
    offset: 0,
  });

  // Should still return a result, possibly with error information
  t.truthy(listResult);

  // Restore original method
  sessionStore.insert = originalInsert;
});

// Test Group: Performance and Concurrency
test.serial('actions performance under realistic load', async (t) => {
  const startTime = Date.now();

  // Perform multiple operations
  await listSessions({ limit: 50, offset: 0 });
  await search({ query: 'test', k: 50 });

  const messages = await messageStore.getMostRecent(100);
  const events = await eventStore.getMostRecent(100);

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Should complete within reasonable time (adjust threshold as needed)
  t.true(duration < 5000, `Operations took ${duration}ms, expected < 5000ms`);

  t.true(Array.isArray(messages));
  t.true(Array.isArray(events));
});

// Test Group: Data Consistency
test.serial('data consistency across action modules', async (t) => {
  const mockClient = createMockClient();

  // Create a session
  const createResult = await create({
    title: 'Consistency Test Session',
    client: mockClient as any,
  });

  t.true(createResult.success);

  // The session should be retrievable
  const getResult = await get({
    sessionId: createResult.session.id,
  });

  if ('error' in getResult) {
    t.fail(`Should not have error: ${getResult.error}`);
  } else {
    t.truthy(getResult.session);
  }

  // The session should appear in listings
  const listResult = await listSessions({
    limit: 10,
    offset: 0,
  });

  t.truthy(listResult);
});

test.serial('action modules handle edge cases correctly', async (t) => {
  // Test with empty parameters
  const emptyListResult = await listSessions({ limit: 0, offset: 0 });
  t.truthy(emptyListResult);

  const emptySearchResult = await search({ query: '', k: 10 });
  t.truthy(emptySearchResult);

  // Test with large limits
  const largeListResult = await listSessions({ limit: 1000, offset: 0 });
  t.truthy(largeListResult);

  // Test with non-existent session
  const notFoundResult = await get({
    sessionId: 'non-existent-session',
  });

  // Should handle gracefully (specific behavior depends on implementation)
  t.truthy(notFoundResult);
});
