import { DualStoreManager } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

// Storage

export const stores = new DualStoreManager<'text', 'timestamp'>();
export function initializeStores(): void {
  stores.create();
}
// Initialize the API layers with the global state
// Export all API classes and utilities
export type { SessionInfo, Timestamp };
