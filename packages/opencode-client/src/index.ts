import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from './AgentTask.js';
import { AgentTaskManager } from './api/AgentTaskManager.js';
import { EventProcessor } from './api/EventProcessor.js';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

// Storage
export let sessionStore: DualStoreManager<'text', 'timestamp'>;
export let agentTaskStore: DualStoreManager<'text', 'timestamp'>;

// Initialize the API layers with the global state
export function initializeStores(
  _sessionStore: DualStoreManager<'text', 'timestamp'>,
  _agentTaskStore: DualStoreManager<'text', 'timestamp'>,
) {
  sessionStore = _sessionStore;
  agentTaskStore = _agentTaskStore;

  // Initialize all API layers
  AgentTaskManager.initializeStores(_sessionStore, _agentTaskStore);
}

// Export all API classes and utilities
export { SessionUtils, MessageProcessor, AgentTaskManager, EventProcessor, InterAgentMessenger };
export type { AgentTask, SessionInfo, Timestamp };
