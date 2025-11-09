import { DualStoreManager } from '@promethean/persistence';
import { sessionStore, initializeStores } from './dist/index.js';
import { get } from './dist/actions/sessions/get.js';

async function testSessionActionDirectly() {
  console.log('=== Test Session Action Directly ===');

  // Create store
  const testStore = await DualStoreManager.create('action_test', 'text', 'timestamp');
  const testAgentStore = await DualStoreManager.create('action_agent_test', 'text', 'timestamp');

  // Initialize
  initializeStores(testStore, testAgentStore);

  console.log('sessionStore initialized:', typeof sessionStore?.get === 'function');

  // Insert test data
  const testSession = {
    id: 'action-test-session',
    title: 'Action Test Session',
    description: 'Testing session action',
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

  console.log('Inserted test data for session:', testSession.id);

  // Mock client that should never be called
  const client = {
    session: {
      get: async (sessionId) => {
        console.log('❌ CLIENT FALLBACK CALLED - This should not happen!');
        return { data: null, error: 'Client fallback - dual store failed' };
      },
      list: async () => {
        console.log('❌ CLIENT LIST CALLED - This should not happen!');
        return { data: [], error: 'Client fallback - dual store failed' };
      },
      search: async () => {
        console.log('❌ CLIENT SEARCH CALLED - This should not happen!');
        return { data: [], error: 'Client fallback - dual store failed' };
      },
      messages: async () => {
        console.log('❌ CLIENT MESSAGES CALLED - This should not happen!');
        return { data: [], error: 'Client fallback - dual store failed' };
      },
    },
    events: {
      list: async () => {
        console.log('❌ CLIENT EVENTS CALLED - This should not happen!');
        return { data: [], error: 'Client fallback - dual store failed' };
      },
    },
  };

  try {
    console.log('Calling get action...');
    const result = await get({
      sessionId: 'action-test-session',
      client,
    });

    console.log('SUCCESS: get action returned:', result);

    // Parse the result
    const parsed = JSON.parse(result);
    console.log('Parsed result session:', parsed.session);
  } catch (error) {
    console.log('ERROR: get action failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testSessionActionDirectly().catch(console.error);
