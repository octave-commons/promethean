import { DualStoreManager } from '@promethean/persistence';
import { sessionStore, initializeStores } from './dist/index.js';

async function testDualStoreDirectly() {
  console.log('=== Direct Dual Store Test ===');

  // Create store
  const testStore = await DualStoreManager.create('direct_test', 'text', 'timestamp');
  const testAgentStore = await DualStoreManager.create('direct_agent_test', 'text', 'timestamp');

  // Initialize
  initializeStores(testStore, testAgentStore);

  console.log('sessionStore:', sessionStore);
  console.log('sessionStore.get:', typeof sessionStore?.get);

  // Insert test data
  const testSession = {
    id: 'direct-test-session',
    title: 'Direct Test Session',
    description: 'Testing direct dual store access',
    agent: 'test-agent',
    createdAt: new Date().toISOString(),
  };

  await testStore.insert({
    id: `session:${testSession.id}`,
    text: JSON.stringify(testSession),
    timestamp: testSession.createdAt,
    metadata: {
      type: 'session',
      sessionId: testSession.id,
    },
  });

  console.log('Inserted test data');

  // Try to get it back
  try {
    const sessionEntry = await sessionStore.get(`session:${testSession.id}`);
    console.log('SUCCESS: get() returned:', sessionEntry);

    if (sessionEntry) {
      const session = JSON.parse(sessionEntry.text);
      console.log('Parsed session:', session);
    }
  } catch (error) {
    console.log('ERROR: get() failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDualStoreDirectly().catch(console.error);
