# Unified Agent Management API

The Unified Agent Management API provides high-level abstractions for managing agent sessions, tasks, and workflows in a single, cohesive interface. It simplifies complex operations into intuitive methods that can be chained together for powerful automation.

## 🚀 Quick Start

### Installation

```bash
import {
  createAgentSession,
  unifiedAgentManager
} from '@promethean/opencode-client';
```

### Basic Usage

```typescript
// Create a session with task assignment in one command
const session = await createAgentSession(
  'Analyze the codebase for performance issues',
  'Focus on database queries and API endpoints',
  {
    title: 'Performance Analysis',
    priority: 'high',
    files: ['src/api/', 'src/database/'],
  },
  {
    autoStart: true,
    onStatusChange: (id, old, newStatus) => console.log(`${id}: ${old} → ${newStatus}`),
  },
);

console.log(`Session created: ${session.sessionId}`);
```

## 📋 Core Concepts

### AgentSession

Represents a complete agent session with task assignment:

```typescript
interface AgentSession {
  sessionId: string; // Unique session identifier
  task: AgentTask; // Assigned task details
  session: any; // Raw session data
  createdAt: Date; // Creation timestamp
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'idle';
}
```

### Session Lifecycle

1. **Create** - Initialize session and assign task
2. **Start** - Begin agent execution
3. **Interact** - Send/receive messages
4. **Stop** - Complete with optional message
5. **Close** - Cleanup and remove

## 🔧 API Reference

### createAgentSession()

Create a new agent session with task assignment in a single operation.

```typescript
async function createAgentSession(
  taskDescription: string,
  initialMessage?: string,
  options?: CreateAgentSessionOptions,
  sessionOptions?: AgentSessionOptions,
): Promise<AgentSession>;
```

**Parameters:**

- `taskDescription` - What the agent should accomplish
- `initialMessage` - Optional first message to send
- `options` - Session configuration
- `sessionOptions` - Runtime behavior options

**Options:**

```typescript
interface CreateAgentSessionOptions {
  title?: string; // Session title
  files?: string[]; // Files to include
  delegates?: string[]; // Delegates to assign
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  taskType?: string; // Type of task
  metadata?: Record<string, any>; // Additional metadata
}

interface AgentSessionOptions {
  autoStart?: boolean; // Start immediately
  timeout?: number; // Session timeout
  retryAttempts?: number; // Retry on failure
  onStatusChange?: Function; // Status change callback
  onMessage?: Function; // Message received callback
}
```

**Example:**

```typescript
const session = await createAgentSession(
  'Review authentication code for security vulnerabilities',
  'Focus on OWASP top 10 vulnerabilities',
  {
    title: 'Security Review',
    files: ['src/auth/', 'src/middleware/'],
    priority: 'high',
    taskType: 'security-analysis',
  },
  {
    autoStart: true,
    onStatusChange: (id, oldStatus, newStatus) => {
      console.log(`Session ${id}: ${oldStatus} → ${newStatus}`);
      if (newStatus === 'completed') {
        // Handle completion
      }
    },
    onMessage: (sessionId, message) => {
      console.log(`Message: ${message.content}`);
    },
  },
);
```

### Session Management

#### startAgentSession()

```typescript
await startAgentSession(sessionId);
```

#### stopAgentSession()

```typescript
await stopAgentSession(sessionId, 'Task completed successfully');
```

#### sendMessageToAgent()

```typescript
await sendMessageToAgent(sessionId, 'Check for memory leaks', 'instruction');
```

#### closeAgentSession()

```typescript
await closeAgentSession(sessionId);
```

### UnifiedAgentManager Class

For advanced usage and session tracking:

```typescript
const manager = unifiedAgentManager;

// Get session details
const session = manager.getAgentSession(sessionId);

// List all sessions
const sessions = manager.listAgentSessions();

// Filter by status
const running = manager.getSessionsByStatus('running');

// Get statistics
const stats = manager.getSessionStats();
console.log(`Total: ${stats.total}, Running: ${stats.byStatus.running}`);

// Cleanup old sessions
const cleaned = await manager.cleanupOldSessions(24 * 60 * 60 * 1000); // 24 hours
```

## 🎯 Use Cases

### 1. Batch Processing

```typescript
const tasks = [
  'Analyze API performance',
  'Review database queries',
  'Check for security issues',
  'Update documentation',
];

const sessions = await Promise.all(
  tasks.map((task) => createAgentSession(task, undefined, { autoStart: true })),
);

// Monitor progress
const stats = unifiedAgentManager.getSessionStats();
console.log(`Running: ${stats.byStatus.running} sessions`);

// Cleanup when done
await Promise.all(sessions.map((session) => closeAgentSession(session.sessionId)));
```

### 2. Event-Driven Workflows

```typescript
const session = await createAgentSession(
  'Monitor application logs',
  undefined,
  { priority: 'high' },
  {
    autoStart: true,
    onStatusChange: (id, old, newStatus) => {
      if (newStatus === 'completed') {
        // Send notification
        notifyTeam(`Log monitoring completed: ${id}`);
      }
    },
    onMessage: (sessionId, message) => {
      if (message.type === 'alert') {
        // Handle critical alerts
        escalateIssue(message.content);
      }
    },
  },
);
```

### 3. Interactive Development

```typescript
// Create session for code review
const reviewSession = await createAgentSession(
  'Review pull request #123',
  'Focus on code quality, performance, and security',
  {
    title: 'PR Review #123',
    files: ['src/components/', 'tests/'],
  },
);

// Send additional context
await sendMessageToAgent(reviewSession.sessionId, 'This PR adds user authentication features');

// Start when ready
await startAgentSession(reviewSession.sessionId);
```

## 🖥️ CLI Interface

The package includes a comprehensive CLI for managing sessions:

```bash
# Create new session
agent-cli create "Analyze performance" --title "Perf Analysis" --auto-start

# List sessions
agent-cli list --status running --format table

# Send message
agent-cli send abc12345 "Check for memory leaks"

# Get session info
agent-cli info abc12345

# Interactive mode
agent-cli interactive

# Cleanup old sessions
agent-cli cleanup --age 24
```

### CLI Commands

| Command           | Description        | Example                                          |
| ----------------- | ------------------ | ------------------------------------------------ |
| `create <task>`   | Create new session | `agent-cli create "Review code" --priority high` |
| `start <id>`      | Start session      | `agent-cli start abc12345`                       |
| `stop <id>`       | Stop session       | `agent-cli stop abc12345 --message "Done"`       |
| `send <id> <msg>` | Send message       | `agent-cli send abc12345 "Check security"`       |
| `close <id>`      | Close session      | `agent-cli close abc12345`                       |
| `list`            | List sessions      | `agent-cli list --status running`                |
| `info <id>`       | Session details    | `agent-cli info abc12345`                        |
| `stats`           | Statistics         | `agent-cli stats`                                |
| `cleanup`         | Cleanup old        | `agent-cli cleanup --age 24`                     |
| `interactive`     | Interactive mode   | `agent-cli interactive`                          |

## 🔄 Advanced Patterns

### Custom Event Handling

```typescript
class CustomAgentManager {
  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    unifiedAgentManager.addEventListener('*', 'statusChange', (id, old, newStatus) => {
      this.logStatusChange(id, old, newStatus);
    });
  }

  async createMonitoredSession(task: string) {
    return await createAgentSession(
      task,
      undefined,
      { priority: 'medium' },
      {
        onStatusChange: (id, old, newStatus) => {
          this.trackMetrics(id, old, newStatus);
        },
      },
    );
  }

  private trackMetrics(sessionId: string, oldStatus: string, newStatus: string) {
    // Custom metrics tracking
    metrics.increment(`session.status.${newStatus}`);
  }
}
```

### Session Pooling

```typescript
class SessionPool {
  private maxConcurrent = 5;
  private queue: Array<{ task: string; resolve: Function }> = [];

  async execute(task: string): Promise<AgentSession> {
    return new Promise(async (resolve) => {
      if (this.getCurrentCount() < this.maxConcurrent) {
        const session = await createAgentSession(task, undefined, {}, { autoStart: true });
        resolve(session);
      } else {
        this.queue.push({ task, resolve });
      }
    });
  }

  private getCurrentCount(): number {
    return unifiedAgentManager.getSessionsByStatus('running').length;
  }

  onSessionCompleted(sessionId: string) {
    // Process next in queue
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.execute(next.task).then(next.resolve);
    }
  }
}
```

## 📊 Monitoring and Analytics

### Session Statistics

```typescript
const stats = unifiedAgentManager.getSessionStats();
console.log(`
Session Statistics:
- Total: ${stats.total}
- Running: ${stats.byStatus.running}
- Completed: ${stats.byStatus.completed}
- Failed: ${stats.byStatus.failed}
- Average Age: ${Math.round(stats.averageAge / 1000)}s
`);
```

### Performance Monitoring

```typescript
// Track session lifecycle
const startTime = Date.now();
const session = await createAgentSession('Complex task');

const duration = Date.now() - startTime;
console.log(`Session creation took: ${duration}ms`);

// Monitor message processing
session.onMessage = (sessionId, message) => {
  const processingTime = Date.now() - message.timestamp;
  if (processingTime > 5000) {
    console.warn(`Slow message processing: ${processingTime}ms`);
  }
};
```

## 🛠️ Error Handling

```typescript
try {
  const session = await createAgentSession('Complex task');
  await startAgentSession(session.sessionId);
} catch (error) {
  console.error('Session creation failed:', error.message);

  // Retry logic
  if (error.message.includes('timeout')) {
    const retrySession = await createAgentSession(
      'Complex task',
      undefined,
      {},
      {
        timeout: 60000, // 1 minute timeout
        retryAttempts: 3,
      },
    );
  }
}
```

## 🔧 Configuration

### Environment Variables

```bash
OPENCODE_SERVER_URL=http://localhost:4096
OPENCODE_TIMEOUT=10000
OPENCODE_RETRIES=3
OPENCODE_LOG_LEVEL=info
OPENCODE_AUTH_TOKEN=your-token
```

### Default Options

```typescript
const defaultOptions: CreateAgentSessionOptions = {
  priority: 'medium',
  taskType: 'general',
};

const defaultSessionOptions: AgentSessionOptions = {
  autoStart: false,
  timeout: 300000, // 5 minutes
  retryAttempts: 3,
};
```

## 📚 Examples

See `src/examples/agent-management-example.ts` for comprehensive examples including:

- Basic session management
- Batch processing
- Event-driven workflows
- Statistics and cleanup

## 🤝 Integration

### With Existing Code

```typescript
// Replace multiple API calls with single operation
// Before:
const session = await createSession({ title: 'Task' });
const task = await createTask(session.id, 'Description');
await sendMessage(session.id, 'Start');

// After:
const session = await createAgentSession('Description', 'Start', { title: 'Task' });
```

### With Frameworks

```typescript
// Express.js endpoint
app.post('/api/agents', async (req, res) => {
  try {
    const { task, message, options } = req.body;
    const session = await createAgentSession(task, message, options);
    res.json({ sessionId: session.sessionId, status: session.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Session Creation Fails**

   - Check OpenCode server connection
   - Verify authentication tokens
   - Ensure sufficient permissions

2. **Messages Not Delivered**

   - Confirm session is running
   - Check message format
   - Verify network connectivity

3. **Status Updates Not Working**
   - Ensure event listeners are properly attached
   - Check for error handling in callbacks
   - Verify session ID is correct

### Debug Mode

```typescript
// Enable debug logging
process.env.OPENCODE_LOG_LEVEL = 'debug';

// Add debug event listeners
const session = await createAgentSession(
  'Debug task',
  undefined,
  {},
  {
    onStatusChange: (id, old, newStatus) => {
      console.debug(`[DEBUG] Status: ${id} ${old} → ${newStatus}`);
    },
    onMessage: (id, message) => {
      console.debug(`[DEBUG] Message: ${id}`, message);
    },
  },
);
```

## 🔌 OpenCode SDK Integration

The agent management functionality is also available as OpenCode SDK tools for seamless integration with OpenCode environments.

### Available Tools

The following tools are provided via the `AgentManagementPlugin`:

| Tool Name             | Description                        | Parameters                                        |
| --------------------- | ---------------------------------- | ------------------------------------------------- |
| `agent.createSession` | Create new agent session with task | `task`, `message?`, `options?`, `sessionOptions?` |
| `agent.startSession`  | Start an existing session          | `sessionId`                                       |
| `agent.stopSession`   | Stop a running session             | `sessionId`, `message?`                           |
| `agent.sendMessage`   | Send message to session            | `sessionId`, `message`, `type?`                   |
| `agent.closeSession`  | Close and cleanup session          | `sessionId`                                       |
| `agent.listSessions`  | List all sessions                  | `status?`, `limit?`                               |
| `agent.getSession`    | Get session details                | `sessionId`                                       |
| `agent.getStats`      | Get session statistics             | -                                                 |
| `agent.cleanup`       | Cleanup old sessions               | `maxAge?`                                         |

### OpenCode Plugin Usage

```typescript
import { AgentManagementPlugin } from '@promethean/opencode-client';

// Plugin automatically includes all agent management tools
// Tools are available as: agent.createSession, agent.sendMessage, etc.

// Example tool usage in OpenCode environment:
const result = await tools['agent.createSession']({
  task: 'Analyze codebase for security issues',
  message: 'Focus on authentication and authorization',
  options: {
    title: 'Security Analysis',
    priority: 'high',
    files: ['src/auth/', 'src/middleware/'],
  },
});
```

### Tool Parameters

#### createSession

```typescript
{
  task: string;           // Required: Task description
  message?: string;       // Optional: Initial message
  options?: {             // Optional: Session options
    title?: string;
    files?: string[];
    delegates?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    taskType?: string;
    metadata?: Record<string, any>;
  };
  sessionOptions?: {      // Optional: Runtime options
    autoStart?: boolean;
    timeout?: number;
    retryAttempts?: number;
  };
}
```

#### sendMessage

```typescript
{
  sessionId: string;      // Required: Session ID
  message: string;        // Required: Message content
  type?: string;          // Optional: Message type (default: 'info')
}
```

#### listSessions

```typescript
{
  status?: string;        // Optional: Filter by status
  limit?: number;         // Optional: Maximum results
}
```

### Integration Benefits

- **Unified Interface**: Same API across direct usage and OpenCode tools
- **Consistent Behavior**: Identical functionality in all environments
- **Type Safety**: Full TypeScript support for tool parameters
- **Error Handling**: Standardized error responses across all tools
- **Session Management**: Complete lifecycle management via tools

## 📖 Additional Resources

- [API Reference](./api-reference.md)
- [CLI Documentation](./cli-reference.md)
- [Examples](../src/examples/)
- [Migration Guide](./migration-guide.md)
- [OpenCode SDK Tools](./opencode-sdk-tools.md)
