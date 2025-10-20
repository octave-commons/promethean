import { DualStoreManager } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

// Storage
export let stores: DualStoreManager<'text', 'timestamp'>;

export async function initializeStores(): Promise<void> {
  stores = await DualStoreManager.create('sessions', 'text', 'timestamp');
}

// Export types and utilities
export type { SessionInfo, Timestamp };
