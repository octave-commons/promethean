// SPDX-License-Identifier: GPL-3.0-only
// Factory functions index - exports all tool factories

// Ollama tool factories
export { ollamaToolFactories } from './ollama-factory.js';

// Process tool factories
export { processToolFactories } from './process-factory.js';

// Cache tool factories
export { cacheToolFactories } from './cache-factory.js';

// Sessions tool factories
export { sessionsToolFactories } from './sessions-factory.js';

// Events tool factories
export { eventsToolFactories } from './events-factory.js';

// Messages tool factories
export { messagesToolFactories } from './messages-factory.js';

// Messaging tool factories
export { messagingToolFactories } from './messaging-factory.js';

// Tasks tool factories
export { tasksToolFactories } from './tasks-factory.js';

// Agent Management tool factories
export { agentManagementToolFactories } from './agent-management-factory.js';

// Re-export individual factory functions for convenience

// Agent Management factories
export {
  createCreateAgentSessionTool,
  createStartAgentSessionTool,
  createStopAgentSessionTool,
  createSendAgentMessageTool,
  createCloseAgentSessionTool,
  createListAgentSessionsTool,
  createGetAgentSessionTool,
  createGetAgentStatsTool,
  createCleanupAgentSessionsTool,
} from './agent-management-factory.js';

// Ollama factories
export {
  createSubmitJobTool,
  createGetJobStatusTool,
  createGetJobResultTool,
  createListJobsTool,
  createCancelJobTool,
  createListModelsTool,
  createGetQueueInfoTool,
  createSubmitFeedbackTool,
} from './ollama-factory.js';

// Process factories
export {
  createStartProcessTool,
  createStopProcessTool,
  createListProcessesTool,
  createProcessStatusTool,
  createTailProcessLogsTool,
  createTailProcessErrorTool,
} from './process-factory.js';

// Cache factories
export {
  createInitializeCacheTool,
  createCheckCacheTool,
  createCreateCacheKeyTool,
  createStoreInCacheTool,
} from './cache-factory.js';

// Sessions factories
export {
  createCreateSessionTool,
  createGetSessionTool,
  createListSessionsTool,
  createCloseSessionTool,
  createSearchSessionsTool,
} from './sessions-factory.js';

// Events factories
export {
  createHandleSessionIdleTool,
  createHandleSessionUpdatedTool,
  createHandleMessageUpdatedTool,
  createExtractSessionIdTool,
  createGetSessionMessagesTool,
  createDetectTaskCompletionTool,
  createProcessSessionMessagesTool,
} from './events-factory.js';

// Messages factories
export {
  createDetectTaskCompletionMessagesTool,
  createProcessMessageTool,
  createProcessSessionMessagesMessagesTool,
  createGetSessionMessagesMessagesTool,
} from './messages-factory.js';

// Messaging factories
export {
  createSendMessageTool,
  createVerifyAgentExistsTool,
  createGetSenderSessionIdTool,
  createFormatMessageTool,
  createLogCommunicationTool,
} from './messaging-factory.js';

// Tasks factories
export {
  createLoadPersistedTasksTool,
  createVerifySessionExistsTool,
  createCleanupOrphanedTaskTool,
  createUpdateTaskStatusTool,
  createMonitorTasksTool,
  createCreateTaskTool,
  createGetAllTasksTool,
  createParseTimestampTool,
} from './tasks-factory.js';
