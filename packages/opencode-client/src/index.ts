import { DualStoreManager } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

// Storage
export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {}

// Initialize the API layers with the global state
// Export all API classes and utilities
export type { AgentTask, SessionInfo, Timestamp };
