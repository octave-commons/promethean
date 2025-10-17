import { ContextSharingService } from './src/context-sharing.js';
import { MockShareStore, MockSnapshotStore } from './src/tests/utils/mocks.js';
import { createMockSnapshot } from './src/tests/utils/fixtures.js';

async function debugTest() {
  try {
    console.log('Starting debug test...');

    const shareStore = new MockShareStore();
    const snapshotStore = new MockSnapshotStore();
    const sharingService = new ContextSharingService(shareStore, snapshotStore);

    const sourceAgentId = 'agent-1';
    const targetAgentId = 'agent-2';

    console.log('Creating mock snapshot...');
    const mockSnapshot = createMockSnapshot({ agentId: sourceAgentId });
    await snapshotStore.saveSnapshot(mockSnapshot);
    console.log('Mock snapshot saved:', mockSnapshot.id);

    console.log('Sharing context...');
    const share = await sharingService.shareContext(sourceAgentId, targetAgentId, 'read');
    console.log('Share created:', share);

    console.log('Getting shared contexts...');
    const sharedContexts = await sharingService.getSharedContexts(targetAgentId);
    console.log('Shared contexts:', sharedContexts);

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  }
}

debugTest();
