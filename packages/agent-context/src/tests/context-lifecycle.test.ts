import test from 'ava';
import { ContextLifecycleManager } from '../context-lifecycle.js';
import { DefaultContextManager } from '../context-manager.js';
import {
  MockEventStore,
  MockSnapshotStore,
  MockShareStore,
  MockMetadataStore,
} from './utils/mocks.js';
import { createMockEvent, createMockSnapshot } from './utils/fixtures.js';

test.serial('ContextLifecycleManager: should create new context', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  const agentId = 'agent-1';
  const initialState = { status: 'active', counter: 0 };

  // Create context
  const context = await lifecycleManager.createContext(agentId, initialState);

  t.is(context.agentId, agentId);
  t.deepEqual(context.state, initialState);
  t.truthy(context.id);
  t.truthy(context.createdAt);
  t.truthy(context.updatedAt);

  // Verify context was saved
  const retrieved = await contextManager.getContext(agentId);
  t.truthy(retrieved);
  t.is(retrieved?.agentId, agentId);
  t.deepEqual(retrieved?.state, initialState);
});

test.serial('ContextLifecycleManager: should archive context', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  const agentId = 'agent-1';

  // Create context first
  await lifecycleManager.createContext(agentId, { status: 'active' });

  // Archive context
  await lifecycleManager.archiveContext(agentId);

  // Verify archive event was created
  const events = await eventStore.getEvents(agentId);
  t.true(events.length > 0);
  t.true(events.some((e) => e.type === 'context_archived'));
});

test.serial('ContextLifecycleManager: should delete context', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  const agentId = 'agent-1';

  // Create context first
  await lifecycleManager.createContext(agentId, { status: 'active' });

  // Add some metadata
  await metadataStore.setMetadata({
    agentId,
    contextKey: 'test-data',
    contextValue: { important: true },
    contextType: 'test',
    visibility: 'private',
  });

  // Delete context
  await lifecycleManager.deleteContext(agentId);

  // Verify deletion event was created
  const events = await eventStore.getEvents(agentId);
  t.true(events.some((e) => e.type === 'context_deleted'));

  // Verify metadata was cleaned up
  const remainingMetadata = await metadataStore.getMetadata(agentId);
  t.is(remainingMetadata.length, 0);
});

test.serial('ContextLifecycleManager: should cleanup expired contexts', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  // Add expired metadata
  await metadataStore.setMetadata({
    agentId: 'agent-1',
    contextKey: 'expired-data',
    contextValue: { temp: true },
    contextType: 'temp',
    visibility: 'private',
    expiresAt: new Date(Date.now() - 1000), // 1 second ago
  });

  await metadataStore.setMetadata({
    agentId: 'agent-2',
    contextKey: 'valid-data',
    contextValue: { permanent: true },
    contextType: 'permanent',
    visibility: 'private',
    expiresAt: new Date(Date.now() + 10000), // 10 seconds from now
  });

  // Cleanup expired contexts
  await lifecycleManager.cleanupExpiredContexts();

  // Verify expired metadata was cleaned up
  const expiredMetadata = await metadataStore.getMetadata('agent-1');
  t.is(expiredMetadata.length, 0);

  // Verify valid metadata remains
  const validMetadata = await metadataStore.getMetadata('agent-2');
  t.is(validMetadata.length, 1);
});

test.serial('ContextLifecycleManager: should get context statistics', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  const agentId = 'agent-1';

  // Create context
  await lifecycleManager.createContext(agentId, { status: 'active' });

  // Add events
  const event1 = createMockEvent({ agentId });
  const event2 = createMockEvent({ agentId });
  await eventStore.appendEvent(event1);
  await eventStore.appendEvent(event2);

  // Add snapshot
  const snapshot = createMockSnapshot({ agentId });
  await snapshotStore.saveSnapshot(snapshot);

  // Create shares
  await shareStore.createShare({
    sourceAgentId: agentId,
    targetAgentId: 'agent-2',
    contextSnapshotId: snapshot.id,
    shareType: 'read',
    permissions: {},
  });

  // Get statistics
  const stats = await lifecycleManager.getContextStatistics(agentId);

  t.is(stats.totalEvents, 3);
  t.is(stats.totalSnapshots, 1);
  t.is(stats.totalShares, 1);
  t.truthy(stats.lastActivity);
  // Context size should match the actual context state after all operations
  t.true(stats.contextSize > 0);
});

test.serial('ContextLifecycleManager: should export and import context', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const sourceContextManager = new DefaultContextManager(eventStore, snapshotStore);
  const sourceLifecycleManager = new ContextLifecycleManager(
    sourceContextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  const targetEventStore = new MockEventStore();
  const targetSnapshotStore = new MockSnapshotStore();
  const targetMetadataStore = new MockMetadataStore();
  const targetContextManager = new DefaultContextManager(targetEventStore, targetSnapshotStore);

  const sourceAgentId = 'agent-1';
  const targetAgentId = 'agent-2';
  const initialState = { status: 'active', data: { important: 'information' } };

  // Create source context
  await sourceLifecycleManager.createContext(sourceAgentId, initialState);

  // Add metadata
  await metadataStore.setMetadata({
    agentId: sourceAgentId,
    contextKey: 'user-preferences',
    contextValue: { theme: 'dark' },
    contextType: 'preferences',
    visibility: 'private',
  });

  // Export context
  const exportData = await sourceLifecycleManager.exportContext(sourceAgentId);

  t.truthy(exportData.context);
  t.is(exportData.context.agentId, sourceAgentId);
  t.deepEqual(exportData.context.state, initialState);
  t.is(exportData.metadata.length, 1);
  t.is(exportData.metadata[0].contextKey, 'user-preferences');

  // Import to target
  const targetLifecycleManager = new ContextLifecycleManager(
    targetContextManager,
    targetEventStore,
    targetSnapshotStore,
    undefined,
    targetMetadataStore,
  );

  const importedContext = await targetLifecycleManager.importContext(targetAgentId, exportData);

  t.is(importedContext.agentId, targetAgentId);
  t.deepEqual(importedContext.state, initialState);

  // Verify metadata was imported
  const importedMetadata = await targetMetadataStore.getMetadata(targetAgentId);
  t.is(importedMetadata.length, 1);
  t.is(importedMetadata[0]?.contextKey, 'user-preferences');
});

test.serial('ContextLifecycleManager: should validate context integrity', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  const agentId = 'agent-1';

  // Create context
  await lifecycleManager.createContext(agentId, { status: 'active' });

  // Validate healthy context
  const healthyValidation = await lifecycleManager.validateContextIntegrity(agentId);
  t.true(healthyValidation.isValid);
  t.is(healthyValidation.issues.length, 0);

  // Add events with duplicate IDs to create integrity issue
  const eventId = 'duplicate-event-id';
  const event1 = createMockEvent({ agentId });
  const event2 = createMockEvent({ agentId });
  event1.id = eventId;
  event2.id = eventId; // Same ID - this should cause validation to fail
  await eventStore.appendEvent(event1);
  await eventStore.appendEvent(event2);

  // Validate context with version mismatch
  const validationWithMismatch = await lifecycleManager.validateContextIntegrity(agentId);

  // Debug: let's see what we have
  const events = await eventStore.getEvents(agentId);
  console.log(`Events count: ${events.length}`);
  console.log(`Validation result:`, validationWithMismatch);

  t.false(validationWithMismatch.isValid);
  t.true(validationWithMismatch.issues.length > 0);
  t.true(validationWithMismatch.issues.some((issue) => issue.includes('Duplicate event IDs')));
});

test.serial('ContextLifecycleManager: should get system statistics', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  // Get system statistics
  const systemStats = await lifecycleManager.getSystemStatistics();

  t.truthy(systemStats.totalContexts !== undefined);
  t.truthy(systemStats.totalEvents !== undefined);
  t.truthy(systemStats.totalSnapshots !== undefined);
  t.truthy(systemStats.totalShares !== undefined);
  t.truthy(systemStats.activeContexts !== undefined);
});

test.serial('ContextLifecycleManager: should handle errors gracefully', async (t) => {
  const eventStore = new MockEventStore();
  const snapshotStore = new MockSnapshotStore();
  const shareStore = new MockShareStore();
  const metadataStore = new MockMetadataStore();

  // Clear all stores to ensure clean state
  eventStore.clear();
  snapshotStore.clear();
  shareStore.clear();
  metadataStore.clear();

  const contextManager = new DefaultContextManager(eventStore, snapshotStore);
  const lifecycleManager = new ContextLifecycleManager(
    contextManager,
    eventStore,
    snapshotStore,
    shareStore,
    metadataStore,
  );

  // Use a unique agent ID to avoid conflicts with other tests
  const uniqueAgentId =
    'error-test-agent-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

  // Verify stores are empty before test
  console.log('Before test - Event store agents:', Array.from((eventStore as any).events.keys()));
  console.log(
    'Before test - Snapshot store agents:',
    Array.from((snapshotStore as any).snapshots.keys()),
  );

  // Try to archive non-existent context (should not throw)
  await t.notThrowsAsync(async () => {
    await lifecycleManager.archiveContext(uniqueAgentId);
  });

  // Try to delete non-existent context (should not throw)
  await t.notThrowsAsync(async () => {
    await lifecycleManager.deleteContext(uniqueAgentId);
  });

  // Try to export non-existent context
  const exportData = await lifecycleManager.exportContext(uniqueAgentId);
  console.log('Export data for unique agent:', {
    agentId: uniqueAgentId,
    events: exportData.events.length,
    snapshots: exportData.snapshots.length,
    metadata: exportData.metadata.length,
    shares: exportData.shares.length,
  });
  console.log('After test - Event store agents:', Array.from((eventStore as any).events.keys()));
  console.log(
    'Events for unique agent:',
    (eventStore as any).events.get(uniqueAgentId)?.length || 0,
  );

  t.truthy(exportData.context);
  t.is(exportData.events.length, 0);
  t.is(exportData.snapshots.length, 0);
  t.is(exportData.metadata.length, 0);
  t.is(exportData.shares.length, 0);

  // Validate non-existent context
  const validation = await lifecycleManager.validateContextIntegrity(uniqueAgentId);
  t.false(validation.isValid);
  t.true(validation.issues.length > 0);
});
