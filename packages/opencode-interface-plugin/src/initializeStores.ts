// SPDX-License-Identifier: GPL-3.0-only

import { DualStoreManager } from '@promethean-os/persistence';
import { SESSION_STORE_NAME, EVENT_STORE_NAME, MESSAGE_STORE_NAME } from './stores.js';

export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  console.log('🔧 Initializing stores...');

  try {
    // Use getOrCreateCollection to handle existing collections in tests
    const sessionCollection = await DualStoreManager.create(
      SESSION_STORE_NAME,
      'text',
      'timestamp',
    );
    const eventCollection = await DualStoreManager.create(EVENT_STORE_NAME, 'text', 'timestamp');
    const messageCollection = await DualStoreManager.create(
      MESSAGE_STORE_NAME,
      'text',
      'timestamp',
    );

    return {
      [SESSION_STORE_NAME]: sessionCollection,
      [EVENT_STORE_NAME]: eventCollection,
      [MESSAGE_STORE_NAME]: messageCollection,
    };
  } catch (error) {
    console.error('Failed to initialize stores:', error);
    throw error;
  }
}
