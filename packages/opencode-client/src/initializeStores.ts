import { DualStoreManager } from '@promethean/persistence';
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
    return {
      [SESSION_STORE_NAME]: await contextStore.createCollection(
        SESSION_STORE_NAME,
        'text',
        'timestamp',
      ),
      [EVENT_STORE_NAME]: await contextStore.createCollection(
        EVENT_STORE_NAME,
        'text',
        'timestamp',
      ),
      [MESSAGE_STORE_NAME]: await contextStore.createCollection(
        MESSAGE_STORE_NAME,
        'text',
        'timestamp',
      ),
    };
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    throw error;
  }
}
