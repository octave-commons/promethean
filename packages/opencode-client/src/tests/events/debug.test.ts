import test from 'ava';
import { setupTestStores, mockStoreData } from '../helpers/test-stores.js';
import { eventStore } from '../../index.js';

test.beforeEach(async () => {
  await setupTestStores();
});

test.after.always(async () => {
  await eventStore.cleanup();
});

test.serial('debug store access', async (t) => {
  console.log('Starting debug test');

  // Try to access the store
  try {
    console.log('EventStore type:', typeof eventStore);
    console.log('EventStore methods:', Object.getOwnPropertyNames(eventStore));
    console.log('EventStore prototype:', Object.getPrototypeOf(eventStore));

    // Try to insert data
    await mockStoreData('eventStore', [
      {
        id: 'event:1',
        text: JSON.stringify({ type: 'test', content: 'First event' }),
        timestamp: 1000,
      },
    ]);

    console.log('Data inserted successfully');

    // Try to get data
    const result = await eventStore.getMostRecent(10);
    console.log('Get result:', result);

    t.pass('Store access worked');
  } catch (error) {
    console.error('Store access failed:', error);
    t.fail(`Store access failed: ${error}`);
  }
});
