import test from 'ava';

import { MockEventStore, MockSnapshotStore, MockAuthService } from './utils/mocks.js';
import { createMockEvent, createMockSnapshot } from './utils/fixtures.js';

test.serial('MockEventStore: basic functionality', async (t) => {
  const store = new MockEventStore();

  const event = createMockEvent();
  await store.appendEvent(event);

  const retrieved = await store.getEvent(event.id);
  t.not(retrieved, null);
  t.deepEqual(retrieved, event);

  const agentEvents = await store.getEvents(event.agentId);
  t.is(agentEvents.length, 1);
  t.deepEqual(agentEvents[0], event);
});

test.serial('MockSnapshotStore: basic functionality', async (t) => {
  const store = new MockSnapshotStore();

  const snapshot = createMockSnapshot();
  await store.saveSnapshot(snapshot);

  const retrieved = await store.getSnapshot(snapshot.id);
  t.not(retrieved, null);
  t.deepEqual(retrieved, snapshot);

  const latest = await store.getLatestSnapshot(snapshot.agentId);
  t.not(latest, null);
  t.deepEqual(latest, snapshot);
});

test.serial('MockAuthService: basic functionality', async (t) => {
  const authService = new MockAuthService();

  const agentId = 'agent-123';
  const permissions = ['read', 'write'];

  const token = await authService.generateToken(agentId, permissions);
  t.truthy(token.token);
  t.is(token.agentId, agentId);
  t.deepEqual(token.permissions, permissions);

  const validated = await authService.validateToken(token.token);
  t.not(validated, null);
  t.deepEqual(validated, token);

  await authService.revokeToken(token.token);
  const revoked = await authService.validateToken(token.token);
  t.is(revoked, null);
});
