# Tool Factories

This directory contains factory functions for creating tools from action modules. The factories provide a clean separation between:

1. **Actions** - Pure functions that implement core functionality
2. **Factories** - Functions that create tools with proper schemas from actions
3. **Tools** - The final tool objects that can be used in the system

## Available Factories

### Ollama Factories (9 factories)

- `createSubmitJobTool()` - Submit LLM jobs to queue
- `createGetJobStatusTool()` - Check job status
- `createGetJobResultTool()` - Get completed job results
- `createListJobsTool()` - List jobs with filtering
- `createCancelJobTool()` - Cancel pending jobs
- `createListModelsTool()` - List available Ollama models
- `createGetQueueInfoTool()` - Get queue statistics
- `createSubmitFeedbackTool()` - Submit feedback on cached results

### Process Factories (6 factories)

- `createStartProcessTool()` - Start long-running processes
- `createStopProcessTool()` - Stop running processes
- `createListProcessesTool()` - List active processes
- `createProcessStatusTool()` - Check process status
- `createTailProcessLogsTool()` - Tail process stdout
- `createTailProcessErrorTool()` - Tail process stderr

### Cache Factories (5 factories)

- `createInitializeCacheTool()` - Initialize cache for models
- `createCheckCacheTool()` - Check cache for prompts
- `createCreateCacheKeyTool()` - Create cache keys
- `createStoreInCacheTool()` - Store results in cache
- `createManageCacheTool()` - Manage cache (stats, clear, etc.)

### Sessions Factories (5 factories)

- `createCreateSessionTool()` - Create new sessions
- `createGetSessionTool()` - Get session details
- `createListSessionsTool()` - List all sessions
- `createCloseSessionTool()` - Close sessions
- `createSearchSessionsTool()` - Search sessions

### Events Factories (7 factories)

- `createHandleSessionIdleTool()` - Handle session idle events
- `createHandleSessionUpdatedTool()` - Handle session update events
- `createHandleMessageUpdatedTool()` - Handle message update events
- `createExtractSessionIdTool()` - Extract session ID from events
- `createGetSessionMessagesTool()` - Get session messages
- `createDetectTaskCompletionTool()` - Detect task completion from messages
- `createProcessSessionMessagesTool()` - Process all session messages

### Messages Factories (4 factories)

- `createDetectTaskCompletionMessagesTool()` - Detect task completion (messages version)
- `createProcessMessageTool()` - Process individual messages
- `createProcessSessionMessagesMessagesTool()` - Process session messages (messages version)
- `createGetSessionMessagesMessagesTool()` - Get session messages (messages version)

### Messaging Factories (5 factories)

- `createSendMessageTool()` - Send messages to other agents
- `createVerifyAgentExistsTool()` - Verify if agent exists
- `createGetSenderSessionIdTool()` - Get current sender's session ID
- `createFormatMessageTool()` - Format inter-agent messages
- `createLogCommunicationTool()` - Log communication to session store

### Tasks Factories (8 factories)

- `createLoadPersistedTasksTool()` - Load persisted tasks from storage
- `createVerifySessionExistsTool()` - Verify if session exists
- `createCleanupOrphanedTaskTool()` - Clean up orphaned tasks
- `createUpdateTaskStatusTool()` - Update task status
- `createMonitorTasksTool()` - Monitor tasks for timeouts
- `createCreateTaskTool()` - Create new tasks
- `createGetAllTasksTool()` - Get all tasks from memory and storage
- `createParseTimestampTool()` - Parse timestamps to Unix format

## Usage Example

```typescript
import {
  ollamaToolFactories,
  processToolFactories,
  sessionsToolFactories,
  eventsToolFactories,
  messagesToolFactories,
  messagingToolFactories,
  tasksToolFactories,
} from './index.js';

// Create tools using factories
const submitJobTool = ollamaToolFactories.createSubmitJobTool();
const startProcessTool = processToolFactories.createStartProcessTool();
const createSessionTool = sessionsToolFactories.createCreateSessionTool();
const handleSessionIdleTool = eventsToolFactories.createHandleSessionIdleTool();
const sendMessageTool = messagingToolFactories.createSendMessageTool();
const createTaskTool = tasksToolFactories.createCreateTaskTool();

// Use tools in your system
const tools = {
  submitJob: submitJobTool,
  startProcess: startProcessTool,
  createSession: createSessionTool,
  handleSessionIdle: handleSessionIdleTool,
  sendMessage: sendMessageTool,
  createTask: createTaskTool,
};
```

## Factory Categories Summary

**Total Factories: 49 factory functions across 8 categories**

- **Ollama**: 9 factories for LLM job queue operations
- **Process**: 6 factories for process management
- **Cache**: 5 factories for cache operations
- **Sessions**: 5 factories for session management
- **Events**: 7 factories for event handling
- **Messages**: 4 factories for message processing
- **Messaging**: 5 factories for inter-agent messaging
- **Tasks**: 8 factories for task management

## Benefits

1. **Separation of Concerns** - Actions are pure functions, tools handle the interface
2. **Reusability** - Actions can be used independently of tools
3. **Testability** - Actions can be tested without tool overhead
4. **Flexibility** - Different tools can be created from the same actions
5. **Type Safety** - Proper TypeScript types throughout
6. **Comprehensive Coverage** - All action categories have factory implementations
7. **Consistent Patterns** - All factories follow the same structure and conventions
