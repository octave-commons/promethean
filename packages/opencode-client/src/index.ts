import { DualStoreManager } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import { SessionUtils } from './SessionUtils.js';
import type { Timestamp } from './types/index.js';

export type SearchableStore = DualStoreManager<'text', 'timestamp'>;
export const SESSION_STORE_NAME = 'sessionStore';
export const AGENT_TASK_STORE_NAME = 'agentTaskStore';
export const EVENT_STORE_NAME = 'eventStore';
export const MESSAGE_STORE_NAME = 'messageStore';

enum StoreNames {
  SessionStore = 'sessionStore',
  AgentTaskStore = 'agentTaskStore',
  EventStore = 'eventStore',
  MessageStore = 'messageStore',
}

// Re-export AgentTask from types to avoid conflicts
export type { AgentTask } from './types/index.js';

// Store instances - initialized lazily
let _stores: Record<string, DualStoreManager<'text', 'timestamp'>> | null = null;

const ensureStoresInitialized = (): Record<string, DualStoreManager<'text', 'timestamp'>> => {
  if (!_stores) {
    throw new Error('Stores not initialized. Call initializeStores() first.');
  }
  return _stores;
};

export const sessionStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    const stores = ensureStoresInitialized();
    return stores.sessionStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export const agentTaskStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    const stores = ensureStoresInitialized();
    return stores.agentTaskStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export const eventStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    const stores = ensureStoresInitialized();
    return stores.eventStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export const messageStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    const stores = ensureStoresInitialized();
    return stores.messageStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  _stores = {
    sessionStore: await DualStoreManager.create('sessionStore', 'text', 'timestamp'),
    agentTaskStore: await DualStoreManager.create('agentTaskStore', 'text', 'timestamp'),
    eventStore: await DualStoreManager.create('eventStore', 'text', 'timestamp'),
    messageStore: await DualStoreManager.create('messageStore', 'text', 'timestamp'),
  };

  return _stores;
}

export async function getStore(name: StoreNames): Promise<SearchableStore> {
  const stores = ensureStoresInitialized();
  return stores[name] as SearchableStore;
}

// Export utilities
export { SessionUtils };
export type { SessionInfo, Timestamp };
