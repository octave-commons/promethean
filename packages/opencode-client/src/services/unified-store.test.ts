/**
 * Unified Store Test Suite
 *
 * Tests for the unified store interface that provides standardized access
 * to OpenCode context stores with proper error handling, transaction support,
 * and performance optimizations.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

import {
  StoreOperationError,
  TransactionError,
  IdGenerator,
  StoreConnectionPool,
  StoreTransactionManager,
  createStoreAccess,
  sessionStoreAccess,
  eventStoreAccess,
  messageStoreAccess,
  withTransaction,
  batchInsert,
  searchAcrossStores,
  type UnifiedStoreAccess,
  type QueryOptions,
} from './unified-store.js';

describe('IdGenerator', () => {
  test('should generate unique session IDs', () => {
    const id1 = IdGenerator.generateSessionId('123');
    const id2 = IdGenerator.generateSessionId('456');

    assert.notStrictEqual(id1, id2);
    assert.ok(id1.startsWith('sess_'));
    assert.ok(id2.startsWith('sess_'));
  });

  test('should generate unique message IDs', () => {
    const id1 = IdGenerator.generateMessageId('msg123');
    const id2 = IdGenerator.generateMessageId('msg456');

    assert.notStrictEqual(id1, id2);
    assert.ok(id1.startsWith('msg_'));
    assert.ok(id2.startsWith('msg_'));
  });

  test('should generate unique event IDs', () => {
    const id1 = IdGenerator.generateEventId('user_action');
    const id2 = IdGenerator.generateEventId('system_event');

    assert.notStrictEqual(id1, id2);
    assert.ok(id1.startsWith('evt_'));
    assert.ok(id2.startsWith('evt_'));
  });
});

describe('StoreConnectionPool', () => {
  test('should be a singleton', () => {
    const pool1 = StoreConnectionPool.getInstance();
    const pool2 = StoreConnectionPool.getInstance();

    assert.strictEqual(pool1, pool2);
  });

  test('should manage connections', async () => {
    const pool = StoreConnectionPool.getInstance();

    // Test connection management
    await pool.clearAllConnections();

    // Should not throw
    await pool.getConnection('testStore');
  });
});

describe('StoreTransactionManager', () => {
  test('should be a singleton', () => {
    const manager1 = StoreTransactionManager.getInstance();
    const manager2 = StoreTransactionManager.getInstance();

    assert.strictEqual(manager1, manager2);
  });

  test('should manage transactions', async () => {
    const manager = StoreTransactionManager.getInstance();

    const result = await manager.withTransaction('test-tx', async () => {
      return 'test-result';
    });

    assert.strictEqual(result, 'test-result');
    assert.deepStrictEqual(manager.getActiveTransactions(), []);
  });

  test('should handle transaction failures', async () => {
    const manager = StoreTransactionManager.getInstance();

    await assert.rejects(async () => {
      await manager.withTransaction('fail-tx', async () => {
        throw new Error('Test error');
      });
    }, TransactionError);
  });
});

describe('UnifiedStore', () => {
  let store: UnifiedStoreAccess;

  test('should create store access', () => {
    store = createStoreAccess('testStore');
    assert.ok(store);
    assert.strictEqual(store.storeName, 'testStore');
  });

  test('should handle insert operations', async () => {
    const store = createStoreAccess('testStore');
    const entry = {
      text: 'Test content',
      timestamp: Date.now(),
      metadata: {
        type: 'session' as const,
        sessionId: 'test-session',
        title: 'Test Session',
      },
    };

    const id = await store.insert(entry);

    assert.ok(typeof id === 'string');
    assert.ok(id.length > 0);
  });

  test('should handle insert errors', async () => {
    const store = createStoreAccess('testStore');
    const invalidEntry = {
      text: 'Test content',
      timestamp: Date.now(),
      metadata: {
        type: 'invalid' as any,
      },
    };

    await assert.rejects(async () => {
      await store.insert(invalidEntry);
    }, StoreOperationError);
  });

  test('should handle query operations', async () => {
    const store = createStoreAccess('testStore');
    const options: QueryOptions = {
      queries: ['test query'],
      limit: 10,
    };

    const results = await store.query(options);

    assert.ok(Array.isArray(results));
  });

  test('should handle get operations', async () => {
    const store = createStoreAccess('testStore');
    const result = await store.get('non-existent-id');

    assert.strictEqual(result, null);
  });

  test('should handle getMostRecent operations', async () => {
    const store = createStoreAccess('testStore');
    const results = await store.getMostRecent(5);

    assert.ok(Array.isArray(results));
  });

  test('should handle getMostRelevant operations', async () => {
    const store = createStoreAccess('testStore');
    const results = await store.getMostRelevant(['test query'], 5);

    assert.ok(Array.isArray(results));
  });

  test('should handle query operations', async () => {
    const options: QueryOptions = {
      queries: ['test query'],
      limit: 10,
    };

    const results = await store.query(options);

    assert.ok(Array.isArray(results));
  });

  test('should handle get operations', async () => {
    const result = await store.get('non-existent-id');

    assert.strictEqual(result, null);
  });

  test('should handle getMostRecent operations', async () => {
    const results = await store.getMostRecent(5);

    assert.ok(Array.isArray(results));
  });

  test('should handle getMostRelevant operations', async () => {
    const results = await store.getMostRelevant(['test query'], 5);

    assert.ok(Array.isArray(results));
  });
});

describe('Pre-configured Store Access', () => {
  test('should provide session store access', () => {
    assert.ok(sessionStoreAccess);
    assert.strictEqual(sessionStoreAccess.storeName, 'sessionStore');
  });

  test('should provide event store access', () => {
    assert.ok(eventStoreAccess);
    assert.strictEqual(eventStoreAccess.storeName, 'eventStore');
  });

  test('should provide message store access', () => {
    assert.ok(messageStoreAccess);
    assert.strictEqual(messageStoreAccess.storeName, 'messageStore');
  });
});

describe('Utility Functions', () => {
  test('should handle withTransaction utility', async () => {
    const result = await withTransaction('utility-test', async () => {
      return 'transaction-result';
    });

    assert.strictEqual(result, 'transaction-result');
  });

  test('should handle batchInsert utility', async () => {
    const entries = [
      {
        text: 'Entry 1',
        timestamp: Date.now(),
        metadata: { type: 'event' as const, eventType: 'test' },
      },
      {
        text: 'Entry 2',
        timestamp: Date.now(),
        metadata: { type: 'event' as const, eventType: 'test' },
      },
    ] as const;

    const ids = await batchInsert(sessionStoreAccess, entries);

    assert.strictEqual(ids.length, 2);
    assert.notStrictEqual(ids[0], ids[1]);
  });

  test('should handle searchAcrossStores utility', async () => {
    const results = await searchAcrossStores('test query', {
      limit: 5,
      includeSessions: true,
      includeMessages: true,
      includeEvents: true,
    });

    assert.ok(results.sessions);
    assert.ok(results.messages);
    assert.ok(results.events);
    assert.ok(Array.isArray(results.sessions));
    assert.ok(Array.isArray(results.messages));
    assert.ok(Array.isArray(results.events));
  });
});

describe('Error Handling', () => {
  test('StoreOperationError should include proper context', () => {
    const cause = new Error('Original error');
    const error = new StoreOperationError('insert', 'testStore', cause);

    assert.strictEqual(error.operation, 'insert');
    assert.strictEqual(error.storeName, 'testStore');
    assert.strictEqual(error.cause, cause);
    assert.ok(error.message.includes('insert'));
    assert.ok(error.message.includes('testStore'));
  });

  test('TransactionError should include proper context', () => {
    const cause = new Error('Transaction failed');
    const error = new TransactionError(['op1', 'op2'], cause);

    assert.deepStrictEqual(error.operations, ['op1', 'op2']);
    assert.strictEqual(error.cause, cause);
    assert.ok(error.message.includes('op1'));
    assert.ok(error.message.includes('op2'));
  });
});

describe('Integration Tests', () => {
  test('should handle complete workflow', async () => {
    // Insert test data
    const sessionId = await sessionStoreAccess.insert({
      text: 'Test session content',
      timestamp: Date.now(),
      metadata: {
        type: 'session',
        sessionId: 'integration-test',
        title: 'Integration Test Session',
      },
    });

    const messageId = await messageStoreAccess.insert({
      text: 'Test message content',
      timestamp: Date.now(),
      metadata: {
        type: 'message',
        messageId: 'msg-integration-test',
        sessionId: 'integration-test',
        role: 'user',
      },
    });

    const eventId = await eventStoreAccess.insert({
      text: 'Test event content',
      timestamp: Date.now(),
      metadata: {
        type: 'event',
        eventType: 'test_event',
        sessionId: 'integration-test',
      },
    });

    // Verify data was inserted
    assert.ok(sessionId);
    assert.ok(messageId);
    assert.ok(eventId);

    // Search across stores
    const searchResults = await searchAcrossStores('test', {
      sessionId: 'integration-test',
    });

    assert.ok(searchResults.sessions.length >= 0);
    assert.ok(searchResults.messages.length >= 0);
    assert.ok(searchResults.events.length >= 0);
  });
});
