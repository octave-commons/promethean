import {
  ContextStore,
  DualStoreManager,
  createContextStore,
  createCollection,
  getOrCreateCollection,
} from '@promethean/persistence';
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

// Use functional API to avoid state mutation issues with deprecated ContextStore class
let contextStoreState = createContextStore();

export const contextStore = {
  get collections() {
    return contextStoreState.collections;
  },
  get formatTime() {
    return contextStoreState.formatTime;
  },
  get assistantName() {
    return contextStoreState.assistantName;
  },
  async createCollection(name: string, textKey: string, timeStampKey: string) {
    const [newState, collection] = await createCollection(
      contextStoreState,
      name,
      textKey,
      timeStampKey,
    );
    contextStoreState = newState;
    return [newState, collection];
  },
  async getOrCreateCollection(name: string) {
    const [newState, collection] = await getOrCreateCollection(contextStoreState, name);
    contextStoreState = newState;
    return [newState, collection];
  },
  collectionCount() {
    return contextStoreState.collections.size;
  },
  listCollectionNames() {
    return Array.from(contextStoreState.collections.keys());
  },
  getCollection(name: string) {
    const collection = contextStoreState.collections.get(name);
    if (!collection) {
      throw new Error(`Collection ${name} does not exist`);
    }
    return collection;
  },
} as any; // Type assertion to avoid compatibility issues

export const sessionStore = createStoreProxy(SESSION_STORE_NAME);
export const eventStore = createStoreProxy(EVENT_STORE_NAME);
export const messageStore = createStoreProxy(MESSAGE_STORE_NAME);

// Context store utilities
export const getContextStore = (): ContextStore => contextStore;
export const listStoreNames = (): readonly string[] => contextStore.listCollectionNames();
export const getStoreCount = (): number => contextStore.collectionCount();

// Export utilities
