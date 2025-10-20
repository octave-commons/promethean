import { DualStoreManager, ContextStore, type GenericEntry } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import { SessionUtils } from './SessionUtils.js';
import type { Timestamp } from './types/index.js';

export type SearchableStore = DualStoreManager<'text', 'timestamp'>;

// Define Message type locally to avoid ollama dependency
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
}

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

// Centralized context store for managing all DualStores
const contextStore = new ContextStore();

// Store access proxies using ContextStore with proper type casting
const createStoreProxy = (storeName: string): DualStoreManager<'text', 'timestamp'> => {
  return new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
    get(_, prop) {
      const collection = contextStore.getCollection(storeName);
      // Cast from DualStoreManager<string, string> to DualStoreManager<'text', 'timestamp'>
      const typedCollection = collection as DualStoreManager<'text', 'timestamp'>;
      return typedCollection[prop as keyof DualStoreManager<'text', 'timestamp'>];
    },
  });
};

export const sessionStore = createStoreProxy(SESSION_STORE_NAME);
export const agentTaskStore = createStoreProxy(AGENT_TASK_STORE_NAME);
export const eventStore = createStoreProxy(EVENT_STORE_NAME);
export const messageStore = createStoreProxy(MESSAGE_STORE_NAME);

export async function initializeStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  // Create all collections using ContextStore
  const sessionCollection = await contextStore.createCollection(
    SESSION_STORE_NAME,
    'text',
    'timestamp',
  );
  const agentTaskCollection = await contextStore.createCollection(
    AGENT_TASK_STORE_NAME,
    'text',
    'timestamp',
  );
  const eventCollection = await contextStore.createCollection(
    EVENT_STORE_NAME,
    'text',
    'timestamp',
  );
  const messageCollection = await contextStore.createCollection(
    MESSAGE_STORE_NAME,
    'text',
    'timestamp',
  );

  // Cast from DualStoreManager<string, string> to DualStoreManager<'text', 'timestamp'>
  return {
    [SESSION_STORE_NAME]: sessionCollection as unknown as DualStoreManager<'text', 'timestamp'>,
    [AGENT_TASK_STORE_NAME]: agentTaskCollection as unknown as DualStoreManager<
      'text',
      'timestamp'
    >,
    [EVENT_STORE_NAME]: eventCollection as unknown as DualStoreManager<'text', 'timestamp'>,
    [MESSAGE_STORE_NAME]: messageCollection as unknown as DualStoreManager<'text', 'timestamp'>,
  };
}

export async function getStore(name: StoreNames): Promise<SearchableStore> {
  return contextStore.getCollection(name) as SearchableStore;
}

// Context management functions for advanced operations
export async function getAllRelatedDocuments(
  queries: readonly string[],
  limit: number = 100,
  where?: import('chromadb').Where,
): Promise<GenericEntry[]> {
  return contextStore.getAllRelatedDocuments(queries, limit, where);
}

export async function getLatestDocuments(limit: number = 100): Promise<GenericEntry[]> {
  return contextStore.getLatestDocuments(limit);
}

export async function compileContext(
  textsOrOptions:
    | readonly string[]
    | {
        readonly texts?: readonly string[];
        readonly recentLimit?: number;
        readonly queryLimit?: number;
        readonly limit?: number;
        readonly formatAssistantMessages?: boolean;
      } = [],
  ...legacyArgs: readonly [number?, number?, number?, boolean?]
): Promise<Message[]> {
  // Cast the return type since ContextStore returns ollama.Message which is compatible
  return contextStore.compileContext(textsOrOptions, ...legacyArgs) as Promise<Message[]>;
}

// Context store utilities
export const getContextStore = (): ContextStore => contextStore;
export const listStoreNames = (): readonly string[] => contextStore.listCollectionNames();
export const getStoreCount = (): number => contextStore.collectionCount();

// Export utilities
export { SessionUtils };
export type { SessionInfo, Timestamp };

// Create a global agentTasks Map for backward compatibility
export const agentTasks = new Map<string, any>();

// Export store instances for backward compatibility
export { sessionStore, agentTaskStore, eventStore, messageStore };

// Create a global agentTasks Map for backward compatibility
export const agentTasks = new Map<string, any>();
