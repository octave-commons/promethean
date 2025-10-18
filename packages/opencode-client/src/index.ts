import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from './AgentTask.js';
import { AgentTaskManager } from './api/AgentTaskManager.js';
import { SessionUtils } from './api/SessionUtils.js';
import { MessageProcessor } from './api/MessageProcessor.js';
import { EventProcessor } from './api/EventProcessor.js';
import { InterAgentMessenger } from './api/InterAgentMessenger.js';
import { SessionInfo } from './SessionInfo.js';

// Storage
export const sessions = new Map<string, any>();
export let sessionStore: DualStoreManager<'text', 'timestamp'>;
export let agentTaskStore: DualStoreManager<'text', 'timestamp'>;
export const agentTasks = new Map<string, AgentTask>();

// Initialize the API layers with the global state
export function initializeStores(
  _sessionStore: DualStoreManager<'text', 'timestamp'>,
  _agentTaskStore: DualStoreManager<'text', 'timestamp'>,
) {
  sessionStore = _sessionStore;
  agentTaskStore = _agentTaskStore;

  // Initialize all API layers
  AgentTaskManager.initializeStores(_sessionStore, _agentTaskStore);
  MessageProcessor.initializeStore(_sessionStore);
  InterAgentMessenger.initializeStore(_sessionStore);
  InterAgentMessenger.setAgentTaskStore(_agentTaskStore);
  InterAgentMessenger.setAgentTasks(agentTasks);
}

// Export all API classes and utilities
export { SessionUtils, MessageProcessor, AgentTaskManager, EventProcessor, InterAgentMessenger };
export type { AgentTask, SessionInfo };
