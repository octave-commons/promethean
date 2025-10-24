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

export const sessionStore = createStoreProxy(SESSION_STORE_NAME);
export const eventStore = createStoreProxy(EVENT_STORE_NAME);
export const messageStore = createStoreProxy(MESSAGE_STORE_NAME);

// Context store utilities
export const getContextStore = (): ContextStore => contextStore;
export const listStoreNames = (): readonly string[] => contextStore.listCollectionNames();
export const getStoreCount = (): number => contextStore.collectionCount();

// Export utilities
