import { DualStoreManager } from '@promethean/persistence';
import { sessionStore, initializeStores } from './dist/index.js';

async function testBrokenDatabase() {
  console.log('=== Test Broken Database ===');

  const originalMongoUrl = process.env.MONGO_URL;

  try {
    // Point to non-existent database
    process.env.MONGO_URL = 'mongodb://localhost:27999/nonexistent_db';
    console.log('Pointing to non-existent MongoDB on port 27999...');

    // Try to create dual store
    console.log('Creating dual store...');
    const failingStore = await DualStoreManager.create('failure_test', 'text', 'timestamp');
    const failingAgentStore = await DualStoreManager.create(
      'failure_agent_test',
      'text',
      'timestamp',
    );

    console.log('Stores created successfully!');
    console.log('failingStore:', failingStore ? 'defined' : 'undefined');
    console.log('failingStore.get:', typeof failingStore?.get);

    // Initialize
    initializeStores(failingStore, failingAgentStore);

    console.log('sessionStore after init:', typeof sessionStore?.get === 'function');

    // Try to use the store
    try {
      const result = await sessionStore.get('test-key');
      console.log('SUCCESS: get() returned:', result);
    } catch (error) {
      console.log('ERROR: get() failed:', error.message);
    }
  } catch (error) {
    console.log('ERROR during store creation:', error.message);
  } finally {
    // Restore environment
    if (originalMongoUrl) {
      process.env.MONGO_URL = originalMongoUrl;
    } else {
      delete process.env.MONGO_URL;
    }
  }
}

testBrokenDatabase().catch(console.error);
