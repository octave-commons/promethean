# OpenCode Client Integration Guide

## Overview

This guide provides comprehensive documentation for working with the OpenCode client integration in the `@promethean-os/opencode-client` package. It covers the architecture, usage patterns, and best practices for managing OpenCode sessions, events, and messages.

## Architecture

### OpenCode System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CLI Client    │───▶│  OpenCode API    │───▶│  Session Store  │
│                 │    │                  │    │                 │
│ • sessions      │    │ • Sessions       │    │ • Session Data  │
│ • events        │    │ • Events         │    │ • Event History │
│ • messages      │    │ • Messages       │    │ • Message Log   │
│ • indexer       │    │ • Indexer        │    │ • Search Index  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Plugin System   │◀───────────┘
                        │                  │
                        │ • Agent Mgmt     │
                        │ • Cache          │
                        │ • Events         │
                        └──────────────────┘
```

### Core Components

1. **Session Management**: Create, list, and manage OpenCode sessions
2. **Event Processing**: Track and query system events
3. **Message Handling**: Send and receive messages within sessions
4. **Indexer Service**: Search and index session content
5. **Plugin System**: Extensible architecture for additional functionality

## Getting Started

### Basic Setup

```typescript
import {
  spawnSession,
  listSessions,
  sendPrompt,
  listEvents,
  compileContext,
} from '@promethean-os/opencode-client';

// The client connects to OpenCode automatically
// Default URL: http://localhost:4096
```

### Creating Your First Session

```typescript
// Simple session creation
const sessionResult = await spawnSession.execute({
  title: 'My Development Session',
  message: 'Start working on the project',
});

console.log('Session created:', JSON.parse(sessionResult));
// Output: { success: true, session: { id: "uuid", title: "...", createdAt: ... } }
```

### Listing Sessions

```typescript
// List all active sessions
const sessionsResult = await listSessions.execute({
  limit: 10,
});

const sessions = JSON.parse(sessionsResult);
console.log('Active sessions:', sessions);
```

## Core Operations

### 1. Session Management

#### Create Session with Spawn

```typescript
const session = await spawnSession.execute({
  title: 'Code Review Session',
  message: 'Review the authentication module for security issues',
  options: {
    timeout: 300000, // 5 minutes
    autoStart: true,
  },
});
```

#### List Sessions

```typescript
// List with filters
const activeSessions = await listSessions.execute({
  limit: 20,
  offset: 0,
});

// Parse and use results
const sessionList = JSON.parse(activeSessions);
sessionList.sessions.forEach((session) => {
  console.log(`Session: ${session.title} (${session.id})`);
});
```

### 2. Message Operations

#### Send Message to Session

```typescript
const messageResult = await sendPrompt.execute({
  sessionId: 'session-uuid',
  content: 'Analyze the database schema for optimization opportunities',
  type: 'instruction',
});

const message = JSON.parse(messageResult);
console.log('Message sent:', message.id);
```

#### List Messages

```typescript
const messagesResult = await listMessages.execute({
  sessionId: 'session-uuid',
  limit: 50,
});

const messages = JSON.parse(messagesResult);
messages.messages.forEach((msg) => {
  console.log(`${msg.role}: ${msg.content.substring(0, 100)}...`);
});
```

### 3. Event Operations

#### List System Events

```typescript
const eventsResult = await listEvents.execute({
  limit: 100,
  eventType: 'session.created',
});

const events = JSON.parse(eventsResult);
events.events.forEach((event) => {
  console.log(`${event.timestamp}: ${event.type} - ${event.description}`);
});
```

#### Search Events

```typescript
const searchResult = await listEvents.execute({
  query: 'authentication',
  limit: 50,
});

const searchEvents = JSON.parse(searchResult);
console.log(`Found ${searchEvents.events.length} authentication-related events`);
```

### 4. Indexer Operations

#### Compile Context

```typescript
const contextResult = await compileContext.execute({
  query: 'TypeScript compilation errors',
  includeSessions: true,
  includeEvents: true,
  includeMessages: true,
  limit: 1000,
});

const context = JSON.parse(contextResult);
console.log('Context compiled:', context.summary);
```

#### Search Context

```typescript
const searchResult = await searchContext.execute({
  query: 'performance optimization',
  sessionId: 'session-uuid',
  limit: 20,
});

const results = JSON.parse(searchResult);
results.matches.forEach((match) => {
  console.log(`Match in ${match.type}: ${match.content.substring(0, 100)}...`);
});
```

## Advanced Usage Patterns

### Batch Session Processing

```typescript
async function processMultipleSessions(tasks: Array<{ title: string; message: string }>) {
  const sessions = [];

  // Create multiple sessions
  for (const task of tasks) {
    const session = await spawnSession.execute({
      title: task.title,
      message: task.message,
    });
    sessions.push(JSON.parse(session));
  }

  // Monitor all sessions
  const sessionIds = sessions.map((s) => s.session.id);

  // Periodically check status
  const monitor = setInterval(async () => {
    const activeSessions = await listSessions.execute({ limit: 100 });
    const active = JSON.parse(activeSessions);

    const stillActive = active.sessions.filter((s) => sessionIds.includes(s.id));
    console.log(`Active sessions: ${stillActive.length}/${sessionIds.length}`);

    if (stillActive.length === 0) {
      clearInterval(monitor);
      console.log('All sessions completed');
    }
  }, 5000);

  return sessions;
}
```

### Event-Driven Workflows

```typescript
async function monitorSessionActivity(sessionId: string) {
  let lastEventCount = 0;

  const monitor = setInterval(async () => {
    const events = await listEvents.execute({
      sessionId,
      limit: 50,
    });

    const eventData = JSON.parse(events);

    if (eventData.events.length > lastEventCount) {
      const newEvents = eventData.events.slice(lastEventCount);
      newEvents.forEach((event) => {
        console.log(`New event: ${event.type} at ${new Date(event.timestamp)}`);
      });
      lastEventCount = eventData.events.length;
    }
  }, 2000);

  return monitor;
}
```

### Context Search and Analysis

```typescript
async function analyzeSessionPatterns(sessionId: string) {
  // Get all messages for analysis
  const messages = await listMessages.execute({
    sessionId,
    limit: 1000,
  });

  const messageData = JSON.parse(messages);

  // Analyze message patterns
  const patterns = {
    totalMessages: messageData.messages.length,
    userMessages: messageData.messages.filter((m) => m.role === 'user').length,
    assistantMessages: messageData.messages.filter((m) => m.role === 'assistant').length,
    averageLength:
      messageData.messages.reduce((sum, m) => sum + m.content.length, 0) /
      messageData.messages.length,
  };

  console.log('Session Analysis:', patterns);
  return patterns;
}
```

## Plugin Integration

### Using Agent Management Plugin

```typescript
import { AgentManagementPlugin } from '@promethean-os/opencode-client';

// The plugin provides additional tools for agent operations
const agentPlugin = new AgentManagementPlugin();

// Create agent session with task
const agentSession = await agentPlugin.tools['agent.createSession']({
  task: 'Analyze codebase for security vulnerabilities',
  message: 'Focus on authentication and authorization mechanisms',
  options: {
    title: 'Security Analysis',
    priority: 'high',
    files: ['src/auth/', 'src/middleware/'],
  },
});
```

### Cache Plugin Operations

```typescript
// Cache operations are available through the main client
const cacheStats = await manageCache.execute({
  action: 'stats',
});

console.log('Cache statistics:', JSON.parse(cacheStats));
```

## Error Handling

### Common Error Scenarios

```typescript
async function robustSessionCreation(title: string, message: string) {
  try {
    const session = await spawnSession.execute({
      title,
      message,
    });

    return JSON.parse(session);
  } catch (error) {
    if (error.message.includes('connection')) {
      console.error('Cannot connect to OpenCode server');
      // Retry with different configuration
      return await spawnSession.execute({
        title,
        message,
        options: { timeout: 60000 }, // Longer timeout
      });
    }
    throw error;
  }
}
```

### Session Failure Handling

```typescript
async function handleSessionErrors(sessionId: string) {
  try {
    const messages = await listMessages.execute({
      sessionId,
      limit: 10,
    });

    return JSON.parse(messages);
  } catch (error) {
    if (error.message.includes('not found')) {
      console.error(`Session ${sessionId} not found or expired`);
      // List available sessions as alternative
      const sessions = await listSessions.execute({ limit: 10 });
      console.log('Available sessions:', JSON.parse(sessions));
    }
    throw error;
  }
}
```

## Best Practices

### 1. Session Naming

Always use descriptive session titles for better organization:

```typescript
const session = await spawnSession.execute({
  title: 'Security Audit - Authentication Module',
  message: 'Perform comprehensive security analysis',
});
```

### 2. Resource Management

Monitor and manage session resources:

```typescript
// Check active session count before creating new ones
const activeSessions = await listSessions.execute({ limit: 100 });
const sessionData = JSON.parse(activeSessions);

if (sessionData.sessions.length > 20) {
  console.warn('High number of active sessions, consider cleanup');
}
```

### 3. Error Recovery

Implement robust error handling with retries:

```typescript
async function sendWithRetry(sessionId: string, content: string, maxRetries: number = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendPrompt.execute({
        sessionId,
        content,
        type: 'instruction',
      });
    } catch (error) {
      if (attempt === maxRetries) throw error;

      console.log(`Message send attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 4. Context Optimization

Use context compilation efficiently:

```typescript
// Compile context with specific filters for better performance
const focusedContext = await compileContext.execute({
  query: 'database optimization',
  includeSessions: true,
  includeEvents: false, // Skip events for faster compilation
  includeMessages: true,
  limit: 500, // Reasonable limit
});
```

## Performance Optimization

### 1. Batch Operations

Group similar operations to reduce overhead:

```typescript
// Send multiple messages in sequence
const messages = [
  'Analyze the API endpoints',
  'Check for security vulnerabilities',
  'Review error handling',
  'Validate input sanitization',
];

for (const msg of messages) {
  await sendPrompt.execute({
    sessionId: 'security-session',
    content: msg,
    type: 'instruction',
  });
}
```

### 2. Efficient Searching

Use specific queries for better search performance:

```typescript
// Good: Specific query
const specificResults = await searchContext.execute({
  query: 'TypeScript interface validation',
  sessionId: 'session-uuid',
  limit: 20,
});

// Less efficient: Broad query
const broadResults = await searchContext.execute({
  query: 'code',
  limit: 100,
});
```

### 3. Session Cleanup

Regular cleanup of old sessions:

```typescript
async function cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000) {
  // 24 hours
  const sessions = await listSessions.execute({ limit: 1000 });
  const sessionData = JSON.parse(sessions);

  const now = Date.now();
  const oldSessions = sessionData.sessions.filter(
    (session) => now - new Date(session.createdAt).getTime() > maxAge,
  );

  console.log(`Found ${oldSessions.length} old sessions to clean up`);
  // Implementation would depend on available cleanup APIs
}
```

## Troubleshooting

### Common Issues

1. **Connection failures**: Check OpenCode server is running on port 4096
2. **Session not found**: Verify session ID is correct and session hasn't expired
3. **Message sending fails**: Ensure session is active and not closed
4. **Search returns no results**: Check query syntax and available content

### Debug Information

```typescript
// Enable debug logging
process.env.DEBUG = 'opencode-client';

// Get detailed session information
const sessionInfo = await listSessions.execute({ limit: 1 });
console.log('Debug info:', JSON.parse(sessionInfo, null, 2));
```

For more troubleshooting information, see the [Troubleshooting Guide](./troubleshooting.md).
