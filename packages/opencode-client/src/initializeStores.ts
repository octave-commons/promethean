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
    // Create all collections using ContextStore
    const sessionCollection = await contextStore.createCollection(
      SESSION_STORE_NAME,
      'text',
      'timestamp',
    );
    const eventCollection = await contextStore.createCollection(
      EVENT_STORE_NAME,
      'text',
      'timestamp',
    );
    const messageCollection = await contextStore.createCollection(
      MESSAGE_STORE_NAME,
      'text',
      'timestamp',
    );

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
