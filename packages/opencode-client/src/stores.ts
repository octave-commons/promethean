import { ContextStore, DualStoreManager } from '@promethean-os/persistence';
import { createStoreProxy } from './createStoreProxy.js';

export type SearchableStore = DualStoreManager<'text', 'timestamp'>;

// Define Message type locally to avoid ollama dependency
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
}

export const SESSION_STORE_NAME = 'sessionStore';
export const EVENT_STORE_NAME = 'eventStore';
export const MESSAGE_STORE_NAME = 'messageStore';

export enum StoreNames {
  SessionStore = 'sessionStore',
  EventStore = 'eventStore',
  MessageStore = 'messageStore',
}

// Create a properly typed context store instance
export const contextStore = new ContextStore();

// Create stores lazily to ensure AGENT_NAME is set when tests run
let _sessionStore: ReturnType<typeof createStoreProxy> | null = null;
let _eventStore: ReturnType<typeof createStoreProxy> | null = null;
let _messageStore: ReturnType<typeof createStoreProxy> | null = null;

export const sessionStore = new Proxy({} as ReturnType<typeof createStoreProxy>, {
  get(_, prop) {
    if (!_sessionStore) {
      _sessionStore = createStoreProxy(SESSION_STORE_NAME);
    }
    return (_sessionStore as any)[prop];
  },
});

export const eventStore = new Proxy({} as ReturnType<typeof createStoreProxy>, {
  get(_, prop) {
    if (!_eventStore) {
      _eventStore = createStoreProxy(EVENT_STORE_NAME);
    }
    return (_eventStore as any)[prop];
  },
});

export const messageStore = new Proxy({} as ReturnType<typeof createStoreProxy>, {
  get(_, prop) {
    if (!_messageStore) {
      _messageStore = createStoreProxy(MESSAGE_STORE_NAME);
    }
    return (_messageStore as any)[prop];
  },
});

// Context store utilities
export const getContextStore = (): ContextStore => contextStore;
export const listStoreNames = (): readonly string[] => contextStore.listCollectionNames();
export const getStoreCount = (): number => contextStore.collectionCount();

// Export utilities
