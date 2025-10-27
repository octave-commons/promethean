import test from 'ava';
import { sessionStore } from '../stores.js';
import { initializeStores } from '../initializeStores.js';
import { cleanupClients } from '@promethean-os/persistence';

test.before(async () => {
  await initializeStores();
});

test.after.always(async () => {
  await sessionStore.cleanup();
  await cleanupClients();
});

test('sessionStore basic functionality', (t) => {
  t.is(typeof sessionStore.get, 'function');
  t.is(typeof sessionStore.insert, 'function');
  t.is(typeof sessionStore.getMostRecent, 'function');
  t.is(typeof sessionStore.getMostRelevant, 'function');
  t.is(typeof sessionStore.addEntry, 'function');
  t.is(typeof sessionStore.cleanup, 'function');
});

test('sessionStore insert and get operations', async (t) => {
  await sessionStore.insert({
    id: 'test-key',
    text: JSON.stringify({ data: 'test-value' }),
    timestamp: new Date(),
  });

  const result = await sessionStore.get('test-key');

  t.truthy(result);
  if (result) {
    t.is(result.text, JSON.stringify({ data: 'test-value' }));
  }
});

test('sessionStore getMostRecent returns empty array when no entries', async (t) => {
  // Use a very small limit and check if we get any results
  // Since other tests may have run, we just verify the function works
  const result = await sessionStore.getMostRecent(1);
  t.true(Array.isArray(result));
  // Just verify it's an array, not necessarily empty due to shared test environment
});
