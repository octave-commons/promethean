import { DualStoreManager } from '@promethean-os/persistence';
import {
  contextStore,
  SESSION_STORE_NAME,
  EVENT_STORE_NAME,
  MESSAGE_STORE_NAME,
} from './stores.js';

export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  console.log('🔧 Initializing stores...');

  try {
    // Use getOrCreateCollection to handle existing collections in tests
    const sessionCollection = await contextStore.getOrCreateCollection(SESSION_STORE_NAME);
    const eventCollection = await contextStore.getOrCreateCollection(EVENT_STORE_NAME);
    const messageCollection = await contextStore.getOrCreateCollection(MESSAGE_STORE_NAME);

    return {
      [SESSION_STORE_NAME]: sessionCollection as DualStoreManager<'text', 'timestamp'>,
      [EVENT_STORE_NAME]: eventCollection as DualStoreManager<'text', 'timestamp'>,
      [MESSAGE_STORE_NAME]: messageCollection as DualStoreManager<'text', 'timestamp'>,
    };
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    throw error;
  }
}
