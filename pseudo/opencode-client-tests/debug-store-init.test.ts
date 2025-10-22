import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';
import { sessionStore, agentTaskStore, initializeStores } from '../index.js';

test.serial('Debug store initialization', async (t) => {
  console.log('\n=== Debug Store Initialization ===');

  console.log('Before initialization:');
  console.log('sessionStore:', sessionStore);
  console.log('agentTaskStore:', agentTaskStore);

  // Create stores
  const testStore = await DualStoreManager.create('debug_test', 'text', 'timestamp');
  const testAgentStore = await DualStoreManager.create('debug_agent_test', 'text', 'timestamp');

  console.log('Created stores:');
  console.log('testStore:', testStore);
  console.log('testAgentStore:', testAgentStore);

  // Initialize
  initializeStores(testStore, testAgentStore);

  console.log('After initialization:');
  console.log('sessionStore:', sessionStore);
  console.log('agentTaskStore:', agentTaskStore);
  console.log(
    'sessionStore methods:',
    sessionStore ? Object.getOwnPropertyNames(sessionStore) : 'undefined',
  );

  t.truthy(sessionStore, 'sessionStore should be defined after initialization');
  t.truthy(agentTaskStore, 'agentTaskStore should be defined after initialization');
  t.truthy(typeof sessionStore.get === 'function', 'sessionStore should have get method');
});
