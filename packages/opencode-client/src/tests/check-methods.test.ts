import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';

test.serial('Check DualStoreManager methods', async (t) => {
  console.log('\n=== Check DualStoreManager Methods ===');

  const store = await DualStoreManager.create('method_test', 'text', 'timestamp');

  console.log('Store prototype methods:');
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(store)));
  console.log('\nStore own properties:');
  console.log(Object.getOwnPropertyNames(store));
  console.log('\nStore all keys:');
  console.log(Object.keys(store));
  console.log('\nStore has get method:', typeof store.get === 'function');
  console.log('Store has insert method:', typeof store.insert === 'function');
  console.log('Store has search method:', typeof (store as any).search === 'function');

  // Try to call get method
  try {
    const result = await store.get('test-key');
    console.log('get() result:', result);
  } catch (error) {
    console.log('get() error:', (error as Error).message);
  }

  t.pass();
});
