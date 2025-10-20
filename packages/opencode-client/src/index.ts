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
export async function getStore(name: StoreNames): {};
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
