/**
 * Context Manager Tests
 *
 * Tests for the migrated context manager functionality
 */

import test from 'ava';
import { DefaultContextManager } from '../../src/context/context-manager.js';
import { MockEventStore, MockSnapshotStore } from './utils/mocks.js';
import {
  createMockEvent,
  createMockContext,
  TEST_CONSTANTS,
} from './utils/fixtures.js';
import type { AgentId } from '../../src/core/types/agent.js';

// Helper function to create AgentId for testing
function createTestAgentId(value: string): AgentId {
  return { value, type: 'uuid' };
}

test.serial('ContextManager: should create new context', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;
  const context = await contextManager.getContext(agentId);

  t.truthy(context);
  t.is(context.agentId, agentId);
  t.is(context.version, 0);
  t.deepEqual(context.state, {});
});

test.serial('ContextManager: should update context state', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;
  const initialContext = await contextManager.getContext(agentId);

  const updates = {
    state: { status: 'active', counter: 1 },
    metadata: { lastUpdated: new Date() },
  };

  const updatedContext = await contextManager.updateContext(agentId, updates);

  t.is(updatedContext.agentId, agentId);
  t.is(updatedContext.version, initialContext.version + 1);
  t.deepEqual(updatedContext.state, updates.state);
  t.deepEqual(updatedContext.metadata, updates.metadata);
});

test.serial(
  'ContextManager: should append events and update version',
  async (t) => {
    const eventStore = new MockEventStore();
    const snapshotStore = new MockSnapshotStore();
    const contextManager = new DefaultContextManager(eventStore, snapshotStore);

    const agentId = TEST_CONSTANTS.AGENT_ID;
    const eventData = createMockEvent({ agentId, type: 'state-change' });

    const event = await contextManager.appendEvent(eventData);

    t.truthy(event);
    t.truthy(event.id);
    t.truthy(event.timestamp);
    t.is(event.agentId, agentId);
    t.is(event.type, eventData.type);
    t.deepEqual(event.data, eventData.data);

    // Verify context version is updated
    const context = await contextManager.getContext(agentId);
    t.is(context.version, 1);
  }
);

test.serial(
  'ContextManager: should create and restore from snapshots',
  async (t) => {
    const eventStore = new MockEventStore();
    const snapshotStore = new MockSnapshotStore();
    const contextManager = new DefaultContextManager(eventStore, snapshotStore);

    const agentId = TEST_CONSTANTS.AGENT_ID;

    // Create some context changes
    await contextManager.updateContext(agentId, { state: { counter: 5 } });
    await contextManager.updateContext(agentId, { state: { counter: 10 } });

    // Create snapshot
    const snapshot = await contextManager.createSnapshot(agentId);

    t.truthy(snapshot);
    t.is(snapshot.agentId, agentId);
    t.is(snapshot.version, 2);
    t.deepEqual(snapshot.state, { counter: 10 });

    // Restore from snapshot
    const restoredContext = await contextManager.restoreFromSnapshot(
      snapshot.id
    );

    t.is(restoredContext.agentId, agentId);
    t.is(restoredContext.version, snapshot.version);
    t.deepEqual(restoredContext.state, snapshot.state);
  }
);

test.serial('ContextManager: should handle concurrent updates', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;

  // Create concurrent updates
  const updates = Array.from({ length: 5 }, (_, i) =>
    contextManager.updateContext(agentId, {
      state: { counter: i + 1 },
    })
  );

  const results = await Promise.all(updates);

  // Verify all updates were applied
  const finalContext = await contextManager.getContext(agentId);
  t.is(finalContext.version, 5);

  // Verify each result has correct version
  results.forEach((result: any, i: number) => {
    t.is(result.version, i + 1);
  });
});

test.serial('ContextManager: should validate agent ID', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  await t.throwsAsync(() => contextManager.getContext(''), {
    message: /Agent ID cannot be empty/,
  });

  await t.throwsAsync(() => contextManager.updateContext('', { state: {} }), {
    message: /Agent ID cannot be empty/,
  });
});

test.serial(
  'ContextManager: should handle missing context gracefully',
  async (t) => {
    const eventStore = new MockEventStore();
    const snapshotStore = new MockSnapshotStore();
    const contextManager = new DefaultContextManager(eventStore, snapshotStore);

    const agentId = 'non-existent-agent';

    // Should create new context for non-existent agent
    const context = await contextManager.getContext(agentId);
    t.truthy(context);
    t.is(context.agentId, agentId);
    t.is(context.version, 0);
  }
);

test.serial('ContextManager: should create unified context', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;
  const initialState = { test: 'initial' };

  const unifiedContext = await contextManager.createUnifiedContext(
    agentId,
    initialState
  );

  t.truthy(unifiedContext);
  t.is(unifiedContext.agentId, agentId);
  t.deepEqual(unifiedContext.state, initialState);
  t.is(unifiedContext.version, 1);
  t.truthy(unifiedContext.metadata?.initialState);
  t.truthy(unifiedContext.metadata?.unified);
});

test.serial('ContextManager: should get context statistics', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;

  // Create some activity
  await contextManager.updateContext(agentId, { state: { counter: 1 } });
  await contextManager.appendEvent(createMockEvent({ agentId, type: 'test' }));

  const stats = await contextManager.getContextStatistics(agentId);

  t.truthy(stats);
  t.is(stats.totalEvents, 2); // One for update, one for append
  t.is(stats.version, 1);
  t.truthy(stats.lastActivity);
  t.is(typeof stats.contextSize, 'number');
});

test.serial('ContextManager: should validate context integrity', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;

  // Create a valid context
  await contextManager.updateContext(agentId, { state: { valid: true } });

  const validation = await contextManager.validateContextIntegrity(agentId);

  t.truthy(validation);
  t.true(validation.isValid);
  t.deepEqual(validation.issues, []);
});

test.serial('ContextManager: should handle context deletion', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;

  // Create context first
  await contextManager.updateContext(agentId, { state: { test: 'data' } });

  // Delete context
  await contextManager.deleteContext(agentId);

  // Verify deletion event was created
  const events = await eventStore.getEvents(agentId);
  const deleteEvent = events.find((e) => e.type === 'context_deleted');
  t.truthy(deleteEvent);
  if (deleteEvent) {
    t.truthy(deleteEvent.data.deletedAt);
    t.is(deleteEvent.data.deletedBy, 'system');
  }
});

test.serial('ContextManager: should get context history', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const contextManager = new DefaultContextManager(eventStore, snapshotStore);

  const agentId = TEST_CONSTANTS.AGENT_ID;

  // Create some history
  await contextManager.updateContext(agentId, { state: { step: 1 } });
  await contextManager.updateContext(agentId, { state: { step: 2 } });
  await contextManager.appendEvent(
    createMockEvent({ agentId, type: 'custom' })
  );

  const history = await contextManager.getContextHistory(agentId);

  t.truthy(history);
  t.is(history.length, 3); // Two updates + one custom event

  // Test with limit
  const limitedHistory = await contextManager.getContextHistory(agentId, 2);
  t.is(limitedHistory.length, 2);
});
