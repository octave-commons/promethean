import test from 'ava';
import type { EventRecord, CursorPosition } from '../dist/types.js';
import {
  IsolatedEventBus,
  WorkspaceManager,
  createWorkspaceManager,
  createIsolatedEventBus,
  type WorkspaceConfig,
  type WorkspaceEventRecord,
} from '../dist/workspace.js';

// ============================================================================
// IsolatedEventBus Tests
// ============================================================================

test('IsolatedEventBus creates workspace with unique ID', (t) => {
  const config: WorkspaceConfig = {
    id: 'workspace-test-1',
    sessionId: 'session-123',
  };

  const bus = new IsolatedEventBus(config);
  t.is(bus.workspaceId, 'workspace-test-1');
  t.is(bus.sessionId, 'session-123');
});

test('IsolatedEventBus publishes events with workspace metadata', async (t) => {
  const config: WorkspaceConfig = { id: 'ws-1' };
  const bus = new IsolatedEventBus(config);

  const event = await bus.publish('test.topic', { data: 'test' });

  t.is(event.topic, 'test.topic');
  t.is((event as WorkspaceEventRecord).workspaceId, 'ws-1');
  t.truthy(event.id);
  t.truthy(event.ts);
});

test('IsolatedEventBus isolates events between workspaces', async (t) => {
  const bus1 = new IsolatedEventBus({ id: 'ws-1' });
  const bus2 = new IsolatedEventBus({ id: 'ws-2' });

  await bus1.publish('test.topic', { workspace: 1 });
  await bus2.publish('test.topic', { workspace: 2 });

  const events1 = bus1.getEvents('test.topic');
  const events2 = bus2.getEvents('test.topic');

  t.is(events1.length, 1);
  t.is(events2.length, 1);
  t.deepEqual(events1[0].payload, { workspace: 1 });
  t.deepEqual(events2[0].payload, { workspace: 2 });
  t.is((events1[0] as WorkspaceEventRecord).workspaceId, 'ws-1');
  t.is((events2[0] as WorkspaceEventRecord).workspaceId, 'ws-2');
});

test('IsolatedEventBus respects maxEventsPerTopic config', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1', maxEventsPerTopic: 3 });

  for (let i = 0; i < 5; i++) {
    await bus.publish('test.topic', { index: i });
  }

  const events = bus.getEvents('test.topic');
  t.is(events.length, 3);
  // Should keep the last 3 events
  t.is((events[0].payload as { index: number }).index, 2);
  t.is((events[1].payload as { index: number }).index, 3);
  t.is((events[2].payload as { index: number }).index, 4);
});

test('IsolatedEventBus supports subscriptions within workspace', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1' });
  const received: EventRecord[] = [];

  await bus.subscribe('test.topic', 'test-group', async (event) => {
    received.push(event);
  });

  await bus.publish('test.topic', { data: 'test' });

  // Wait for async delivery
  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(received.length, 1);
  t.deepEqual(received[0].payload, { data: 'test' });
});

test('IsolatedEventBus subscriptions do not cross workspaces', async (t) => {
  const bus1 = new IsolatedEventBus({ id: 'ws-1' });
  const bus2 = new IsolatedEventBus({ id: 'ws-2' });

  const received1: EventRecord[] = [];
  const received2: EventRecord[] = [];

  await bus1.subscribe('test.topic', 'group', async (event) => {
    received1.push(event);
  });

  await bus2.subscribe('test.topic', 'group', async (event) => {
    received2.push(event);
  });

  // Publish to bus1 only
  await bus1.publish('test.topic', { source: 'ws-1' });

  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(received1.length, 1);
  t.is(received2.length, 0);
});

test('IsolatedEventBus supports filtering', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1' });
  const received: EventRecord[] = [];

  await bus.subscribe(
    'test.topic',
    'filter-group',
    async (event) => {
      received.push(event);
    },
    {
      filter: (e) => (e.payload as { priority?: string }).priority === 'high',
    },
  );

  await bus.publish('test.topic', { priority: 'low' });
  await bus.publish('test.topic', { priority: 'high' });
  await bus.publish('test.topic', { priority: 'low' });

  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(received.length, 1);
  t.deepEqual(received[0].payload, { priority: 'high' });
});

test('IsolatedEventBus supports cursor management', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1' });

  const cursor: CursorPosition = {
    topic: 'test.topic',
    lastId: 'event-123',
    lastTs: Date.now(),
  };

  await bus.setCursor('test.topic', 'group-1', cursor);

  const retrieved = await bus.getCursor('test.topic', 'group-1');
  t.deepEqual(retrieved, cursor);
});

test('IsolatedEventBus cursors are isolated per workspace', async (t) => {
  const bus1 = new IsolatedEventBus({ id: 'ws-1' });
  const bus2 = new IsolatedEventBus({ id: 'ws-2' });

  await bus1.setCursor('topic', 'group', { topic: 'topic', lastId: 'e1' });
  await bus2.setCursor('topic', 'group', { topic: 'topic', lastId: 'e2' });

  const cursor1 = await bus1.getCursor('topic', 'group');
  const cursor2 = await bus2.getCursor('topic', 'group');

  t.is(cursor1?.lastId, 'e1');
  t.is(cursor2?.lastId, 'e2');
});

test('IsolatedEventBus getStats returns correct statistics', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1' });

  await bus.publish('topic-a', { data: 1 });
  await bus.publish('topic-a', { data: 2 });
  await bus.publish('topic-b', { data: 3 });

  await bus.subscribe('topic-a', 'group-1', async () => {});
  await bus.subscribe('topic-b', 'group-2', async () => {});

  await bus.setCursor('topic-a', 'group-1', { topic: 'topic-a', lastId: 'e1' });

  const stats = bus.getStats();

  t.is(stats.topicCount, 2);
  t.is(stats.totalEvents, 3);
  t.is(stats.subscriptionCount, 2);
  t.is(stats.cursorCount, 1);
});

test('IsolatedEventBus clear removes all data', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1' });

  await bus.publish('topic', { data: 'test' });
  await bus.subscribe('topic', 'group', async () => {});
  await bus.setCursor('topic', 'group', { topic: 'topic', lastId: 'e1' });

  bus.clear();

  const stats = bus.getStats();
  t.is(stats.topicCount, 0);
  t.is(stats.totalEvents, 0);
});

test('IsolatedEventBus assigns partition based on key', async (t) => {
  const bus = new IsolatedEventBus({ id: 'ws-1' });

  const event1 = await bus.publish('topic', { data: 1 }, { key: 'user-1' });
  const event2 = await bus.publish('topic', { data: 2 }, { key: 'user-2' });
  const event3 = await bus.publish('topic', { data: 3 }, { key: 'user-1' });

  t.is((event1 as WorkspaceEventRecord).partition, (event3 as WorkspaceEventRecord).partition);
  t.not((event1 as WorkspaceEventRecord).partition, (event2 as WorkspaceEventRecord).partition);
});

// ============================================================================
// WorkspaceManager Tests
// ============================================================================

test('WorkspaceManager creates and retrieves workspaces', (t) => {
  const manager = new WorkspaceManager();

  const bus1 = manager.getWorkspace({ id: 'ws-1' });
  const bus2 = manager.getWorkspace({ id: 'ws-2' });

  t.is(bus1.workspaceId, 'ws-1');
  t.is(bus2.workspaceId, 'ws-2');

  // Retrieve same workspace should return same instance
  const bus1Again = manager.getWorkspace({ id: 'ws-1' });
  t.is(bus1, bus1Again);
});

test('WorkspaceManager createWorkspace generates unique IDs', (t) => {
  const manager = new WorkspaceManager();

  const bus1 = manager.createWorkspace('session-1');
  const bus2 = manager.createWorkspace('session-2');

  t.not(bus1.workspaceId, bus2.workspaceId);
  t.is(bus1.sessionId, 'session-1');
  t.is(bus2.sessionId, 'session-2');
});

test('WorkspaceManager hasWorkspace checks existence', (t) => {
  const manager = new WorkspaceManager();

  t.false(manager.hasWorkspace('ws-1'));

  manager.getWorkspace({ id: 'ws-1' });

  t.true(manager.hasWorkspace('ws-1'));
  t.false(manager.hasWorkspace('ws-2'));
});

test('WorkspaceManager listWorkspaces returns all IDs', (t) => {
  const manager = new WorkspaceManager();

  manager.getWorkspace({ id: 'ws-1' });
  manager.getWorkspace({ id: 'ws-2' });
  manager.getWorkspace({ id: 'ws-3' });

  const ids = manager.listWorkspaces();
  t.deepEqual(ids.sort(), ['ws-1', 'ws-2', 'ws-3']);
});

test('WorkspaceManager removeWorkspace clears and removes', async (t) => {
  const manager = new WorkspaceManager();

  const bus = manager.getWorkspace({ id: 'ws-1' });
  await bus.publish('topic', { data: 'test' });

  const removed = manager.removeWorkspace('ws-1');

  t.true(removed);
  t.false(manager.hasWorkspace('ws-1'));
  t.is(bus.getStats().totalEvents, 0); // Should be cleared
});

test('WorkspaceManager getGlobalStats aggregates statistics', async (t) => {
  const manager = new WorkspaceManager();

  const bus1 = manager.getWorkspace({ id: 'ws-1' });
  const bus2 = manager.getWorkspace({ id: 'ws-2' });

  await bus1.publish('topic', { data: 1 });
  await bus1.publish('topic', { data: 2 });
  await bus2.publish('topic', { data: 3 });

  const stats = manager.getGlobalStats();

  t.is(stats.workspaceCount, 2);
  t.is(stats.workspaces.length, 2);

  const ws1Stats = stats.workspaces.find((w) => w.id === 'ws-1');
  const ws2Stats = stats.workspaces.find((w) => w.id === 'ws-2');

  t.is(ws1Stats?.stats.totalEvents, 2);
  t.is(ws2Stats?.stats.totalEvents, 1);
});

test('WorkspaceManager broadcast sends to all workspaces', async (t) => {
  const manager = new WorkspaceManager();

  manager.getWorkspace({ id: 'ws-1' });
  manager.getWorkspace({ id: 'ws-2' });

  const received1: EventRecord[] = [];
  const received2: EventRecord[] = [];

  await manager.getWorkspace({ id: 'ws-1' }).subscribe('broadcast', 'group', async (e) => {
    received1.push(e);
  });

  await manager.getWorkspace({ id: 'ws-2' }).subscribe('broadcast', 'group', async (e) => {
    received2.push(e);
  });

  await manager.broadcast('broadcast', { message: 'hello' });

  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(received1.length, 1);
  t.is(received2.length, 1);
  t.deepEqual(received1[0].payload, { message: 'hello' });
  t.deepEqual(received2[0].payload, { message: 'hello' });
});

test('WorkspaceManager clearAll removes all workspaces', async (t) => {
  const manager = new WorkspaceManager();

  manager.getWorkspace({ id: 'ws-1' });
  manager.getWorkspace({ id: 'ws-2' });

  manager.clearAll();

  t.is(manager.listWorkspaces().length, 0);
});

test('WorkspaceManager applies default config to new workspaces', (t) => {
  const manager = new WorkspaceManager({
    retentionMs: 7200000,
    maxEventsPerTopic: 100,
  });

  const bus = manager.createWorkspace();

  const stats = bus.getStats();
  t.is(stats.topicCount, 0);
});

// ============================================================================
// Factory Function Tests
// ============================================================================

test('createWorkspaceManager creates manager with defaults', (t) => {
  const manager = createWorkspaceManager({ retentionMs: 3600000 });

  t.true(manager instanceof WorkspaceManager);
  t.is(manager.listWorkspaces().length, 0);
});

test('createIsolatedEventBus creates isolated bus', (t) => {
  const config: WorkspaceConfig = {
    id: 'test-workspace',
    sessionId: 'test-session',
  };

  const bus = createIsolatedEventBus(config);

  t.true(bus instanceof IsolatedEventBus);
  t.is(bus.workspaceId, 'test-workspace');
  t.is(bus.sessionId, 'test-session');
});

// ============================================================================
// Session ID Propagation Tests
// ============================================================================

test('Session ID is propagated to events when set in workspace config', async (t) => {
  const bus = new IsolatedEventBus({
    id: 'ws-1',
    sessionId: 'session-abc',
  });

  const event = await bus.publish('test.topic', { data: 'test' });

  t.is(event.sid, 'session-abc');
  t.is((event as WorkspaceEventRecord).sessionId, 'session-abc');
});

test('Explicit sid in publish options overrides workspace session', async (t) => {
  const bus = new IsolatedEventBus({
    id: 'ws-1',
    sessionId: 'session-default',
  });

  const event = await bus.publish('test.topic', { data: 'test' }, { sid: 'session-explicit' });

  t.is(event.sid, 'session-explicit');
  t.is((event as WorkspaceEventRecord).sessionId, 'session-explicit');
});

// ============================================================================
// Hierarchical Workspace Tests
// ============================================================================

test('Workspace can have parent workspace for hierarchical isolation', (t) => {
  const bus = new IsolatedEventBus({
    id: 'child-ws',
    parentId: 'parent-ws',
  });

  // Workspace should be created successfully with parent reference
  t.is(bus.workspaceId, 'child-ws');
});

// ============================================================================
// Metadata Tests
// ============================================================================

test('Workspace can store custom metadata', (t) => {
  const metadata = {
    owner: 'user-123',
    environment: 'development',
    createdAt: Date.now(),
  };

  const bus = new IsolatedEventBus({
    id: 'ws-1',
    metadata,
  });

  // Workspace should be created successfully with metadata
  t.is(bus.workspaceId, 'ws-1');
});
