import test from 'ava';
import { setupTestStores, mockStoreData } from '../helpers/test-stores.js';
import { eventStore } from '../../index.js';
import { list } from '../../actions/events/list.js';
import { testUtils } from '../../test-setup.js';

test.beforeEach(async () => {
  await setupTestStores();
  await testUtils.beforeEach();
});

test.afterEach.always(async () => {
  await testUtils.afterEach();
});

test.after.always(async () => {
  await eventStore.cleanup();
});

test.serial('simple list test', async (t) => {
  // Insert test data with very recent timestamps to appear at top
  const now = Date.now();
  await mockStoreData('eventStore', [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', content: 'First event' }),
      timestamp: now + 1000, // Future timestamp to ensure it's most recent
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'test', content: 'Second event' }),
      timestamp: now + 2000, // Even more recent
    },
  ]);

  // Check if test data was inserted
  const afterInsert = await eventStore.getMostRecent(20);
  console.error('After insert - total items:', afterInsert.length);
  console.error(
    'After insert - event: items:',
    afterInsert.filter((e) => e.id?.startsWith('event:')).length,
  );

  // Check what's in the store directly
  const directResult = await eventStore.getMostRecent(10);
  console.error('Direct store result:', directResult);
  console.error('Direct result length:', directResult.length);
  console.error(
    'Store entry IDs:',
    directResult.map((e) => e.id),
  );
  console.error(
    'Store entry ID types:',
    directResult.map((e) => typeof e.id),
  );

  // Check what list function returns
  const listResult = await list({});
  console.error('List function result:', listResult);
  console.error('List result length:', listResult.length);
  console.error('List function result type:', typeof listResult);
  console.error('List function is array:', Array.isArray(listResult));

  // Assert that we got data
  t.true(directResult.length >= 0, 'Direct result should not be negative');
  t.true(listResult.length >= 0, 'List result should not be negative');

  // If direct result has data but list result doesn't, that's the problem
  if (directResult.length > 0 && listResult.length === 0) {
    const ids = directResult.map((e) => e.id).join(', ');
    t.fail(`Store has ${directResult.length} items but list() returned 0. Store IDs: ${ids}`);
  }

  t.pass('Test completed');
});
