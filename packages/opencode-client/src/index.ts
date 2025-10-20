import { DualStoreManager } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

const stores = new Map();
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

export type AgentTask = {
  sessionId: string;
  agentName: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completionMessage?: string;
};
// Storage
export async function getStore(name: StoreNames): Promise<SearchableStore> {}
export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  const sessionStore = await DualStoreManager.create('sessionStore', 'text', 'timestamp');
  const agentTaskStore = await DualStoreManager.create('agentTaskStore', 'text', 'timestamp');
  const eventStore = await DualStoreManager.create('eventStore', 'text', 'timestamp');
  const messageStore = await DualStoreManager.create('messageStore', 'text', 'timestamp');

  return {
    sessionStore,
    agentTaskStore,
    eventStore,
    messageStore,
  };
}

// Initialize the API layers with the global state
// Export all API classes and utilities
export type { AgentTask, SessionInfo, Timestamp };

// Export store instances for backward compatibility
let _stores: Record<string, DualStoreManager<'text', 'timestamp'>> | null = null;

export const sessionStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    if (!_stores) {
      throw new Error('Stores not initialized. Call initializeStores() first.');
    }
    return _stores.sessionStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export const agentTaskStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    if (!_stores) {
      throw new Error('Stores not initialized. Call initializeStores() first.');
    }
    return _stores.agentTaskStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export const eventStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    if (!_stores) {
      throw new Error('Stores not initialized. Call initializeStores() first.');
    }
    return _stores.eventStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

export const messageStore = new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
  get(_, prop) {
    if (!_stores) {
      throw new Error('Stores not initialized. Call initializeStores() first.');
    }
    return _stores.messageStore[prop as keyof DualStoreManager<'text', 'timestamp'>];
  },
});

// Override initializeStores to set the global reference
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
