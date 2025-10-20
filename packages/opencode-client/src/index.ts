import { DualStoreManager } from '@promethean/persistence';
import { SessionInfo } from './SessionInfo.js';
import type { Timestamp } from './types/index.js';

// Storage

export const stores = DualStoreManager<'text', 'timestamp'>;
// Initialize the API layers with the global state
// Export all API classes and utilities
export { SessionUtils, MessageProcessor, AgentTaskManager, EventProcessor, InterAgentMessenger };
export type { AgentTask, SessionInfo, Timestamp };
