import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';
import { sessionStore, initializeStores } from '../index.js';

test.serial('Test exact same import pattern as actions', async (t) => {
  console.log('\n=== Test Exact Import Pattern ===');

  // This mimics exactly what the test does
  const testStore = await DualStoreManager.create('import_test', 'text', 'timestamp');
  const testAgentStore = await DualStoreManager.create('import_agent_test', 'text', 'timestamp');

  initializeStores(testStore, testAgentStore);

  console.log('sessionStore after init:', sessionStore);
  console.log('typeof sessionStore.get:', typeof sessionStore?.get);

  // Try the exact same call that fails in the action
  try {
    const sessionEntry = await sessionStore.get(`session:test-session`);
    console.log('SUCCESS: get() returned:', sessionEntry);
    t.pass();
  } catch (error) {
    console.log('ERROR: get() failed:', error);
    t.fail(`sessionStore.get() failed: ${(error as Error).message}`);
  }
});
