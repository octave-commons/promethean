import { DualStoreManager } from '@promethean/persistence';
import { contextStore, SESSION_STORE_NAME, EVENT_STORE_NAME, MESSAGE_STORE_NAME } from './index.js';

export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  console.log('🔧 Initializing stores...');

  // Create all collections using ContextStore
  console.log('📝 Creating session collection...');
  let [, sessionCollection] = await contextStore.createCollection(
    SESSION_STORE_NAME,
    'text',
    'timestamp',
  );
  console.log('📝 Creating event collection...');
  let [, eventCollection] = await contextStore.createCollection(
    EVENT_STORE_NAME,
    'text',
    'timestamp',
  );
  console.log('📝 Creating message collection...');
  let [, messageCollection] = await contextStore.createCollection(
    MESSAGE_STORE_NAME,
    'text',
    'timestamp',
  );

  console.log('✅ All collections created successfully');

  // you shouldn't need to do this. the context store was screwed up when moving it so it no longer accepts generics properly
  // It should be:
  // const sessionCollection = await contextStore.createCollection<"text","timestamp">(
  //   SESSION_STORE_NAME,
  //   'text',
  //   'timestamp',
  // );
  // const eventCollection = await contextStore.createCollection<"text","timestamp">(
  //   EVENT_STORE_NAME,
  //   'text',
  //   'timestamp',
  // );
  // const messageCollection = await contextStore.createCollection<"text","timestamp">(
  //   MESSAGE_STORE_NAME,
  //   'text',
  //   'timestamp',
  // );
  // but instead we have to do this ugly cast
  return {
    [SESSION_STORE_NAME]: sessionCollection as unknown as DualStoreManager<'text', 'timestamp'>,
    [EVENT_STORE_NAME]: eventCollection as unknown as DualStoreManager<'text', 'timestamp'>,
    [MESSAGE_STORE_NAME]: messageCollection as unknown as DualStoreManager<'text', 'timestamp'>,
  };
}
