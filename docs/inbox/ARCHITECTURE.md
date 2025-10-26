# OpenCode Client Architecture

## Overview

The OpenCode client has been refactored from a class-based architecture to a functional action-based architecture. This change improves testability, modularity, and maintainability while preserving backward compatibility.

## Architecture Layers

### 1. Actions Layer (`src/actions/`)

The core business logic is implemented as pure functions that accept context parameters:

```
src/actions/
├── tasks/        # Task management actions
├── events/       # Event handling actions
├── messages/     # Message processing actions
├── sessions/     # Session utility actions
└── messaging/    # Inter-agent messaging actions
```

Each action module exports functions that accept a context object containing dependencies:

```typescript
// Example: TaskContext
export interface TaskContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  agentTasks: Map<string, AgentTask>;
}

// Example action function
export async function createTask(
  context: TaskContext,
  sessionId: string,
  task: string
): Promise<AgentTask> {
  // Pure function implementation
}
```

### 2. API Layer (`src/api/`)

Thin wrapper classes that provide dependency injection and maintain the original class-based interface for backward compatibility:

```typescript
export class AgentTaskManager {
  private static context: TaskContext;

  static initializeStores(
    sessionStore: DualStoreManager<'text', 'timestamp'>,
    agentTaskStore: DualStoreManager<'text', 'timestamp'>
  ) {
    this.context = { sessionStore, agentTaskStore, agentTasks };
  }

  static async createTask(sessionId: string, task: string): Promise<AgentTask> {
    return await taskActions.createTask(this.context, sessionId, task);
  }
}
```

### 3. Commands Layer (`src/commands/`)

CLI-specific implementations that use the API layer:

```typescript
export const createTask = {
  description: 'Create a new agent task',
  args: { /* ... */ },
  async execute(args: any, context: any) {
    return await AgentTaskManager.createTask(args.sessionId, args.task);
  }
};
```

## Key Benefits

### 1. **Testability**
- Pure functions are easy to unit test
- Context can be easily mocked
- No hidden dependencies or global state

### 2. **Modularity**
- Each action is independently testable and reusable
- Clear separation of concerns
- Easy to extend and modify

### 3. **Dependency Injection**
- All dependencies are explicit through context parameters
- No static dependencies or global state
- Easy to swap implementations for testing

### 4. **Backward Compatibility**
- Existing API is preserved through wrapper classes
- No breaking changes for consumers
- Gradual migration path

## Migration Guide

### For Consumers

No changes required - the existing API continues to work:

```typescript
// This still works exactly as before
import { AgentTaskManager } from '@promethean/opencode-client';

AgentTaskManager.initializeStores(sessionStore, agentTaskStore);
const task = await AgentTaskManager.createTask('session-123', 'My task');
```

### For New Development

Use the action functions directly for better testability:

```typescript
import { taskActions } from '@promethean/opencode-client/actions/tasks';

const context: TaskContext = {
  sessionStore,
  agentTaskStore,
  agentTasks: new Map()
};

const task = await taskActions.createTask(context, 'session-123', 'My task');
```

## Context Interfaces

### TaskContext
```typescript
interface TaskContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  agentTasks: Map<string, AgentTask>;
}
```

### EventContext
```typescript
interface EventContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  agentTasks: Map<string, AgentTask>;
}
```

### MessageContext
```typescript
interface MessageContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
}
```

### SessionContext
```typescript
interface SessionContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
}
```

### MessagingContext
```typescript
interface MessagingContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  agentTasks: Map<string, AgentTask>;
}
```

## Action Functions

### Task Actions (`src/actions/tasks/index.ts`)
- `createTask(context, sessionId, task)` - Create a new agent task
- `updateTaskStatus(context, sessionId, status, completionMessage)` - Update task status
- `loadPersistedTasks(context, client)` - Load tasks from persistence
- `monitorTasks(context)` - Monitor for task timeouts
- `getAllTasks(context)` - Get all tasks
- `verifySessionExists(context, client, sessionId)` - Verify session exists
- `cleanupOrphanedTask(context, sessionId)` - Clean up orphaned tasks

### Event Actions (`src/actions/events/index.ts`)
- `handleSessionIdle(context, client, sessionId)` - Handle session idle events
- `handleSessionUpdated(context, client, sessionId)` - Handle session update events
- `handleMessageUpdated(context, client, sessionId)` - Handle message update events
- `processSessionMessages(context, client, sessionId)` - Process session messages

### Message Actions (`src/actions/messages/index.ts`)
- `processMessage(context, client, sessionId, message)` - Process a single message
- `processSessionMessages(context, client, sessionId)` - Process all session messages
- `detectTaskCompletion(messages)` - Detect if task is completed

### Session Actions (`src/actions/sessions/index.ts`)
- `createSession(context, sessionData)` - Create a new session
- `getSession(context, sessionId)` - Get session by ID
- `listSessions(context, filters)` - List sessions with filters
- `searchSessions(context, query)` - Search sessions
- `closeSession(context, sessionId)` - Close a session

### Session Utils (`src/actions/sessions/utils.ts`)
- `extractSessionId(event)` - Extract session ID from event
- `getSessionMessages(context, client, sessionId)` - Get session messages
- `determineActivityStatus(session, messageCount, agentTask)` - Determine activity status
- `createSessionInfo(session, messageCount, agentTask)` - Create session info object

### Messaging Actions (`src/actions/messaging/index.ts`)
- `sendMessage(context, fromAgent, toAgent, message)` - Send message between agents
- `getMessages(context, agentId)` - Get messages for agent
- `markMessageRead(context, messageId)` - Mark message as read

## Testing

The new architecture makes testing much simpler:

```typescript
import { taskActions } from '@promethean/opencode-client/actions/tasks';

describe('Task Actions', () => {
  it('should create a task', async () => {
    const mockContext = createMockTaskContext();
    const task = await taskActions.createTask(mockContext, 'session-123', 'Test task');
    
    expect(task.sessionId).toBe('session-123');
    expect(task.task).toBe('Test task');
    expect(task.status).toBe('running');
  });
});
```

## Performance Considerations

- **Context Passing**: Context objects are passed by reference, so there's minimal overhead
- **Pure Functions**: No hidden state makes optimization easier
- **Dependency Injection**: Allows for efficient resource sharing

## Future Enhancements

1. **Context Pooling**: Reuse context objects to reduce allocation
2. **Action Composition**: Combine multiple actions into workflows
3. **Middleware**: Add cross-cutting concerns like logging and metrics
4. **Async Context**: Use async context propagation for better tracing

## Conclusion

The new action-based architecture provides a solid foundation for future development while maintaining backward compatibility. The separation of concerns and explicit dependencies make the codebase more maintainable and testable.