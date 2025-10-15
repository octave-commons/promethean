import test from 'ava';
import { ContextSharingService } from '../context-sharing.js';
import { MockShareStore, MockSnapshotStore } from './utils/mocks.js';
import { createMockSnapshot } from './utils/fixtures.js';

test.serial('ContextSharingService: should share context between agents', async (t) => {
  const shareStore = new MockShareStore();
  const snapshotStore = new MockSnapshotStore();
  const sharingService = new ContextSharingService(shareStore, snapshotStore);

  const sourceAgentId = 'agent-1';
  const targetAgentId = 'agent-2';

  // Setup mock snapshot
  const mockSnapshot = createMockSnapshot({ agentId: sourceAgentId });
  await snapshotStore.saveSnapshot(mockSnapshot);

  const share = await sharingService.shareContext(sourceAgentId, targetAgentId, 'read');

  t.truthy(share);
  t.is(share.sourceAgentId, sourceAgentId);
  t.is(share.targetAgentId, targetAgentId);
  t.is(share.shareType, 'read');
  t.truthy(share.id);
  t.truthy(share.createdAt);
});

test.serial('ContextSharingService: should get shared contexts for agent', async (t) => {
  const shareStore = new MockShareStore();
  const snapshotStore = new MockSnapshotStore();
  const sharingService = new ContextSharingService(shareStore, snapshotStore);

  const sourceAgentId = 'agent-1';
  const targetAgentId = 'agent-2';

  // Setup mock snapshot
  const mockSnapshot = createMockSnapshot({ agentId: sourceAgentId });
  await snapshotStore.saveSnapshot(mockSnapshot);

  // Create a share
  await sharingService.shareContext(sourceAgentId, targetAgentId, 'read');

  // Get shared contexts
  const sharedContexts = await sharingService.getSharedContexts(targetAgentId);

  t.is(sharedContexts.length, 1);
  t.is(sharedContexts[0]?.sourceAgentId, sourceAgentId);
  t.is(sharedContexts[0]?.targetAgentId, targetAgentId);
  t.truthy(sharedContexts[0]?.snapshot);
});

test.serial('ContextSharingService: should check share access permissions', async (t) => {
  const shareStore = new MockShareStore();
  const snapshotStore = new MockSnapshotStore();
  const sharingService = new ContextSharingService(shareStore, snapshotStore);

  const targetAgentId = 'agent-2';

  // Create separate snapshots for different agents to test different permission levels
  const readSnapshot = createMockSnapshot({ agentId: 'agent-read' });
  const writeSnapshot = createMockSnapshot({ agentId: 'agent-write' });
  const adminSnapshot = createMockSnapshot({ agentId: 'agent-admin' });

  await snapshotStore.saveSnapshot(readSnapshot);
  await snapshotStore.saveSnapshot(writeSnapshot);
  await snapshotStore.saveSnapshot(adminSnapshot);

  // Create shares with different permission levels using different source agents
  const readShare = await sharingService.shareContext('agent-read', targetAgentId, 'read');
  const writeShare = await sharingService.shareContext('agent-write', targetAgentId, 'write');
  const adminShare = await sharingService.shareContext('agent-admin', targetAgentId, 'admin');

  // Check access permissions for read-only share
  t.true(await sharingService.checkShareAccess(targetAgentId, readShare.contextSnapshotId, 'read'));
  t.false(
    await sharingService.checkShareAccess(targetAgentId, readShare.contextSnapshotId, 'write'),
  );
  t.false(
    await sharingService.checkShareAccess(targetAgentId, readShare.contextSnapshotId, 'admin'),
  );

  // Check access permissions for write share
  t.true(
    await sharingService.checkShareAccess(targetAgentId, writeShare.contextSnapshotId, 'read'),
  );
  t.true(
    await sharingService.checkShareAccess(targetAgentId, writeShare.contextSnapshotId, 'write'),
  );
  t.false(
    await sharingService.checkShareAccess(targetAgentId, writeShare.contextSnapshotId, 'admin'),
  );

  // Check access permissions for admin share
  t.true(
    await sharingService.checkShareAccess(targetAgentId, adminShare.contextSnapshotId, 'read'),
  );
  t.true(
    await sharingService.checkShareAccess(targetAgentId, adminShare.contextSnapshotId, 'write'),
  );
  t.true(
    await sharingService.checkShareAccess(targetAgentId, adminShare.contextSnapshotId, 'admin'),
  );
});

test.serial('ContextSharingService: should handle expired shares', async (t) => {
  const shareStore = new MockShareStore();
  const snapshotStore = new MockSnapshotStore();
  const sharingService = new ContextSharingService(shareStore, snapshotStore);

  const sourceAgentId = 'agent-1';
  const targetAgentId = 'agent-2';

  // Setup mock snapshot
  const mockSnapshot = createMockSnapshot({ agentId: sourceAgentId });
  await snapshotStore.saveSnapshot(mockSnapshot);

  // Create an expired share
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

  const share = await sharingService.shareContext(sourceAgentId, targetAgentId, 'read', {
    expiresAt: expiredDate,
  });

  // Check access - should be false for expired share
  t.false(await sharingService.checkShareAccess(targetAgentId, share.contextSnapshotId, 'read'));
});

test.serial('ContextSharingService: should get share statistics', async (t) => {
  const shareStore = new MockShareStore();
  const snapshotStore = new MockSnapshotStore();
  const sharingService = new ContextSharingService(shareStore, snapshotStore);

  const agent1Id = 'agent-1';
  const agent2Id = 'agent-2';
  const agent3Id = 'agent-3';

  // Setup mock snapshots
  const snapshot1 = createMockSnapshot({ agentId: agent1Id });
  const snapshot2 = createMockSnapshot({ agentId: agent2Id });
  await snapshotStore.saveSnapshot(snapshot1);
  await snapshotStore.saveSnapshot(snapshot2);

  // Create shares
  await sharingService.shareContext(agent1Id, agent2Id, 'read');
  await sharingService.shareContext(agent1Id, agent3Id, 'write');
  await sharingService.shareContext(agent2Id, agent1Id, 'read');

  // Get statistics for agent1
  const stats = await sharingService.getShareStatistics(agent1Id);

  t.is(stats.created, 2); // agent1 created 2 shares
  t.is(stats.received, 1); // agent1 received 1 share
  t.is(stats.active, 3); // all shares are active
  t.is(stats.expired, 0); // no expired shares
});

test.serial('ContextSharingService: should throw error when no context found', async (t) => {
  const shareStore = new MockShareStore();
  const snapshotStore = new MockSnapshotStore();
  const sharingService = new ContextSharingService(shareStore, snapshotStore);

  const sourceAgentId = 'agent-without-context';
  const targetAgentId = 'agent-2';

  await t.throwsAsync(() => sharingService.shareContext(sourceAgentId, targetAgentId, 'read'), {
    message: `No context found for agent ${sourceAgentId}`,
  });
});
