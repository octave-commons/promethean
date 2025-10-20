import { DualStoreManager } from '@promethean/persistence';
import { AgentTaskManager } from './api/AgentTaskManager.js';
import { EventProcessor } from './api/EventProcessor.js';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

// Storage
export const sessionStore: DualStoreManager<'text', 'timestamp'>;
export const agentTaskStore: DualStoreManager<'text', 'timestamp'>;

// Initialize the API layers with the global state
export function initializeStores(
  _sessionStore: DualStoreManager<'text', 'timestamp'>,
  _agentTaskStore: DualStoreManager<'text', 'timestamp'>,
) {
  // Initialize all API layers
  AgentTaskManager.initializeStores(sessionStore, _agentTaskStore);
}

// Export all API classes and utilities
export { SessionUtils, MessageProcessor, AgentTaskManager, EventProcessor, InterAgentMessenger };
export type { AgentTask, SessionInfo, Timestamp };
