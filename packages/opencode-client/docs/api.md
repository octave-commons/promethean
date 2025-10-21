# API Documentation

This document provides comprehensive information about the OpenCode Client API, including core classes, interfaces, CLI commands, factory patterns, and plugin architecture.

## Table of Contents

- [Core API Classes](#core-api-classes)
  - [UnifiedAgentManager](#unifiedagentmanager)
  - [AgentTaskManager](#agenttaskmanager)
  - [AgentTask](#agenttask)
  - [SessionInfo](#sessioninfo)
- [CLI Command Structure](#cli-command-structure)
  - [Session Commands](#session-commands)
  - [Ollama Commands](#ollama-commands)
  - [PM2 Commands](#pm2-commands)
  - [Event Commands](#event-commands)
- [Factory Patterns](#factory-patterns)
  - [Agent Management Factories](#agent-management-factories)
  - [Ollama Factories](#ollama-factories)
  - [Process Factories](#process-factories)
  - [Cache Factories](#cache-factories)
  - [Sessions Factories](#sessions-factories)
  - [Events Factories](#events-factories)
  - [Messages Factories](#messages-factories)
  - [Messaging Factories](#messaging-factories)
  - [Tasks Factories](#tasks-factories)
- [Plugin Architecture](#plugin-architecture)
  - [Plugin Interface](#plugin-interface)
  - [Plugin Registration](#plugin-registration)
  - [Plugin Lifecycle](#plugin-lifecycle)
- [Ollama API Integration](#ollama-api-integration)
  - [Job Management](#job-management)
  - [Model Operations](#model-operations)
  - [Queue Management](#queue-management)
- [Sessions API](#sessions-api)
  - [Session Lifecycle](#session-lifecycle)
  - [Session Search](#session-search)
  - [Session Management](#session-management)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)

---

## Core API Classes

### UnifiedAgentManager

The `UnifiedAgentManager` class provides a high-level API for complete agent lifecycle management, including session creation, task assignment, and event handling.

#### Class Overview

```typescript
export class UnifiedAgentManager {
  private static instance: UnifiedAgentManager;
  private activeSessions = new Map<string, AgentSession>();
  private eventListeners = new Map<string, Set<Function>>();
}
```

#### Key Methods

##### `createAgentSession()`

Create a new agent session with task assignment in a single operation.

```typescript
async createAgentSession(
  taskDescription: string,
  initialMessage?: string,
  options: CreateAgentSessionOptions = {},
  sessionOptions: AgentSessionOptions = {},
): Promise<AgentSession>
```

**Parameters:**

- `taskDescription`: Description of the task to be assigned
- `initialMessage`: Optional initial message to send to the agent
- `options`: Session creation options
- `sessionOptions`: Session behavior options

**Returns:** Created `AgentSession` object

**Example:**

```typescript
const session = await unifiedAgentManager.createAgentSession(
  'Review the authentication module',
  'Please analyze the security implications of the current auth implementation',
  {
    title: 'Security Review',
    files: ['src/auth.ts', 'src/middleware.ts'],
    delegates: ['security-analyzer', 'code-reviewer'],
    priority: 'high',
  },
  {
    autoStart: true,
    onStatusChange: (sessionId, oldStatus, newStatus) => {
      console.log(`Session ${sessionId} changed from ${oldStatus} to ${newStatus}`);
    },
  },
);
```

##### `startAgentSession()`

Start an existing agent session.

```typescript
async startAgentSession(sessionId: string): Promise<void>
```

**Parameters:**

- `sessionId`: Unique session identifier

**Example:**

```typescript
await unifiedAgentManager.startAgentSession('sess_123456');
```

##### `stopAgentSession()`

Stop an agent session with optional completion message.

```typescript
async stopAgentSession(sessionId: string, completionMessage?: string): Promise<void>
```

**Parameters:**

- `sessionId`: Unique session identifier
- `completionMessage`: Optional message explaining completion reason

**Example:**

```typescript
await unifiedAgentManager.stopAgentSession('sess_123456', 'Task completed successfully');
```

##### `sendMessageToAgent()`

Send a message to an agent session.

```typescript
async sendMessageToAgent(
  sessionId: string,
  message: string,
  messageType: string = 'user',
): Promise<void>
```

**Parameters:**

- `sessionId`: Unique session identifier
- `message`: Message content
- `messageType`: Type of message (default: 'user')

**Example:**

```typescript
await unifiedAgentManager.sendMessageToAgent('sess_123456', 'Please focus on the database queries');
```

##### `getAgentSession()`

Get agent session details.

```typescript
getAgentSession(sessionId: string): AgentSession | undefined
```

**Parameters:**

- `sessionId`: Unique session identifier

**Returns:** Agent session object or undefined if not found

##### `listAgentSessions()`

List all active agent sessions.

```typescript
listAgentSessions(): AgentSession[]
```

**Returns:** Array of all active agent sessions

##### `getSessionsByStatus()`

Get sessions filtered by status.

```typescript
getSessionsByStatus(status: AgentSession['status']): AgentSession[]
```

**Parameters:**

- `status`: Status to filter by ('initializing' | 'running' | 'completed' | 'failed' | 'idle')

**Returns:** Array of sessions with the specified status

##### `closeAgentSession()`

Close and cleanup an agent session.

```typescript
async closeAgentSession(sessionId: string): Promise<void>
```

**Parameters:**

- `sessionId`: Unique session identifier

##### `getSessionStats()`

Get session statistics.

```typescript
getSessionStats(): {
  total: number;
  byStatus: Record<string, number>;
  averageAge: number;
}
```

**Returns:** Statistics about active sessions

##### `cleanupOldSessions()`

Cleanup old/completed sessions.

```typescript
async cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): Promise<number>
```

**Parameters:**

- `maxAge`: Maximum age in milliseconds (default: 24 hours)

**Returns:** Number of sessions cleaned up

#### Interfaces

##### `CreateAgentSessionOptions`

```typescript
export interface CreateAgentSessionOptions {
  title?: string;
  files?: string[];
  delegates?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  taskType?: string;
  metadata?: Record<string, any>;
}
```

##### `AgentSession`

```typescript
export interface AgentSession {
  sessionId: string;
  task: AgentTask;
  session: any;
  createdAt: Date;
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'idle';
}
```

##### `AgentSessionOptions`

```typescript
export interface AgentSessionOptions {
  autoStart?: boolean;
  timeout?: number;
  retryAttempts?: number;
  onStatusChange?: (sessionId: string, oldStatus: string, newStatus: string) => void;
  onMessage?: (sessionId: string, message: any) => void;
}
```

### AgentTaskManager

The `AgentTaskManager` class handles task creation, status updates, and lifecycle management for agent tasks.

#### Key Methods

##### `createTask()`

Create a new agent task.

```typescript
static async createTask(sessionId: string, taskDescription: string): Promise<AgentTask>
```

**Parameters:**

- `sessionId`: Session identifier
- `taskDescription`: Description of the task

**Returns:** Created `AgentTask` object

##### `updateTaskStatus()`

Update the status of an existing task.

```typescript
static async updateTaskStatus(
  sessionId: string,
  status: 'running' | 'completed' | 'failed' | 'idle',
  completionMessage?: string,
): Promise<void>
```

**Parameters:**

- `sessionId`: Session identifier
- `status`: New status
- `completionMessage`: Optional completion message

##### `getTask()`

Get task details for a session.

```typescript
static getTask(sessionId: string): AgentTask | undefined
```

**Parameters:**

- `sessionId`: Session identifier

**Returns:** Task object or undefined if not found

### AgentTask

The `AgentTask` type represents a task assigned to an agent session.

#### Type Definition

```typescript
export type AgentTask = {
  sessionId: string;
  task: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastActivity: number;
  completionMessage?: string;
};
```

#### Properties

- `sessionId`: Unique session identifier
- `task`: Task description
- `startTime`: Unix timestamp when task started
- `status`: Current task status
- `lastActivity`: Unix timestamp of last activity
- `completionMessage`: Optional message explaining completion

### SessionInfo

The `SessionInfo` interface provides detailed information about a session.

#### Interface Definition

```typescript
export interface SessionInfo {
  id: string;
  title: string;
  messageCount: number;
  lastActivityTime: string;
  sessionAge: number;
  activityStatus: string;
  isAgentTask: boolean;
  agentTaskStatus?: string;
  error?: string;
}
```

#### Properties

- `id`: Unique session identifier
- `title`: Session title
- `messageCount`: Number of messages in session
- `lastActivityTime`: ISO timestamp of last activity
- `sessionAge`: Session age in milliseconds
- `activityStatus`: Current activity status
- `isAgentTask`: Whether session is an agent task
- `agentTaskStatus`: Agent task status if applicable
- `error`: Error message if any

---

## CLI Command Structure

The CLI is organized into command groups for different functional areas.

### Session Commands

Commands for managing OpenCode sessions.

#### `opencode-client sessions list`

List all active sessions.

```bash
opencode-client sessions list [options]
```

**Options:**

- `--limit <number>`: Maximum number of sessions to return (default: 20)
- `--offset <number>`: Number of sessions to skip (default: 0)
- `--status <status>`: Filter by status

**Example:**

```bash
opencode-client sessions list --limit 10 --status active
```

#### `opencode-client sessions create`

Create a new session.

```bash
opencode-client sessions create [options]
```

**Options:**

- `--title <string>`: Session title
- `--files <paths>`: Files to include (comma-separated)
- `--delegates <names>`: Agent delegates (comma-separated)

**Example:**

```bash
opencode-client sessions create --title "Code Review" --files "src/main.ts,src/utils.ts"
```

#### `opencode-client sessions get`

Get details of a specific session.

```bash
opencode-client sessions get <sessionId>
```

**Parameters:**

- `sessionId`: Unique session identifier

**Example:**

```bash
opencode-client sessions get sess_123456
```

#### `opencode-client sessions close`

Close an active session.

```bash
opencode-client sessions close <sessionId>
```

**Parameters:**

- `sessionId`: Unique session identifier

**Example:**

```bash
opencode-client sessions close sess_123456
```

#### `opencode-client sessions search`

Search past sessions using semantic embeddings.

```bash
opencode-client sessions search <query> [options]
```

**Parameters:**

- `query`: Search query string

**Options:**

- `--limit <number>`: Maximum number of results (default: 5)

**Example:**

```bash
opencode-client sessions search "bug fix authentication" --limit 10
```

### Ollama Commands

Commands for managing Ollama LLM operations.

#### `opencode-client ollama list`

List available Ollama models.

```bash
opencode-client ollama list [options]
```

**Options:**

- `--detailed`: Show detailed model information

**Example:**

```bash
opencode-client ollama list --detailed
```

#### `opencode-client ollama submit`

Submit a new job to the queue.

```bash
opencode-client ollama submit [options]
```

**Options:**

- `--model <string>`: Model name (required)
- `--type <string>`: Job type (generate|chat|embedding) (required)
- `--priority <string>`: Priority (low|medium|high|urgent) (required)
- `--prompt <string>`: Prompt for generate jobs
- `--messages <string>`: Messages for chat jobs (JSON array)
- `--input <string>`: Input for embedding jobs
- `--temperature <number>`: Sampling temperature (0.0-1.0)
- `--top-p <number>`: Top-p sampling (0.0-1.0)
- `--num-ctx <number>`: Context window size
- `--num-predict <number>`: Maximum tokens to predict

**Example:**

```bash
opencode-client ollama submit \
  --model llama2 \
  --type generate \
  --priority high \
  --prompt "Explain quantum computing" \
  --temperature 0.7 \
  --num-predict 500
```

#### `opencode-client ollama status`

Get the status of a specific job.

```bash
opencode-client ollama status <jobId>
```

**Parameters:**

- `jobId`: Unique job identifier

**Example:**

```bash
opencode-client ollama status job_123456
```

#### `opencode-client ollama result`

Get the result of a completed job.

```bash
opencode-client ollama result <jobId>
```

**Parameters:**

- `jobId`: Unique job identifier

**Example:**

```bash
opencode-client ollama result job_123456
```

#### `opencode-client ollama cancel`

Cancel a pending or running job.

```bash
opencode-client ollama cancel <jobId>
```

**Parameters:**

- `jobId`: Unique job identifier

**Example:**

```bash
opencode-client ollama cancel job_123456
```

#### `opencode-client ollama queue`

Get information about the queue status.

```bash
opencode-client ollama queue
```

**Example:**

```bash
opencode-client ollama queue
```

#### `opencode-client ollama cache`

Manage the prompt cache.

```bash
opencode-client ollama cache <action> [options]
```

**Parameters:**

- `action`: Cache action (stats|clear|clear-expired|performance-analysis)

**Example:**

```bash
opencode-client ollama cache stats
opencode-client ollama cache clear-expired
```

### PM2 Commands

Commands for PM2 process management.

#### `opencode-client pm2 list`

List PM2 processes.

```bash
opencode-client pm2 list
```

#### `opencode-client pm2 start`

Start a PM2 process.

```bash
opencode-client pm2 start <script> [options]
```

**Parameters:**

- `script`: Script to start

**Options:**

- `--name <string>`: Process name
- `--instances <number>`: Number of instances
- `--env <string>`: Environment

**Example:**

```bash
opencode-client pm2 start server.js --name my-app --instances 4
```

#### `opencode-client pm2 stop`

Stop a PM2 process.

```bash
opencode-client pm2 stop <processId|name>
```

**Parameters:**

- `processId|name`: Process ID or name

**Example:**

```bash
opencode-client pm2 stop my-app
```

#### `opencode-client pm2 restart`

Restart a PM2 process.

```bash
opencode-client pm2 restart <processId|name>
```

**Parameters:**

- `processId|name`: Process ID or name

**Example:**

```bash
opencode-client pm2 restart my-app
```

#### `opencode-client pm2 delete`

Delete a PM2 process.

```bash
opencode-client pm2 delete <processId|name>
```

**Parameters:**

- `processId|name`: Process ID or name

**Example:**

```bash
opencode-client pm2 delete my-app
```

#### `opencode-client pm2 logs`

Show PM2 process logs.

```bash
opencode-client pm2 logs <processId|name> [options]
```

**Parameters:**

- `processId|name`: Process ID or name

**Options:**

- `--lines <number>`: Number of lines to show
- `--timestamp`: Show timestamps

**Example:**

```bash
opencode-client pm2 logs my-app --lines 100 --timestamp
```

### Event Commands

Commands for event management and processing.

#### `opencode-client events list`

List recent events.

```bash
opencode-client events list [options]
```

**Options:**

- `--limit <number>`: Maximum number of events (default: 50)
- `--type <string>`: Filter by event type
- `--session <string>`: Filter by session ID

**Example:**

```bash
opencode-client events list --limit 20 --type message
```

#### `opencode-client events process`

Process pending events.

```bash
opencode-client events process [options]
```

**Options:**

- `--batch-size <number>`: Number of events to process (default: 10)
- `--timeout <number>`: Processing timeout in milliseconds (default: 30000)

**Example:**

```bash
opencode-client events process --batch-size 5 --timeout 60000
```

---

## Factory Patterns

The package uses factory patterns to create tools for different functional areas. All factories are exported from `src/factories/index.ts`.

### Agent Management Factories

Factory functions for creating agent management tools.

#### `createCreateAgentSessionTool()`

Create a tool for creating agent sessions.

```typescript
export function createCreateAgentSessionTool(): Tool;
```

**Returns:** MCP tool for creating agent sessions

#### `createStartAgentSessionTool()`

Create a tool for starting agent sessions.

```typescript
export function createStartAgentSessionTool(): Tool;
```

**Returns:** MCP tool for starting agent sessions

#### `createStopAgentSessionTool()`

Create a tool for stopping agent sessions.

```typescript
export function createStopAgentSessionTool(): Tool;
```

**Returns:** MCP tool for stopping agent sessions

#### `createSendAgentMessageTool()`

Create a tool for sending messages to agents.

```typescript
export function createSendAgentMessageTool(): Tool;
```

**Returns:** MCP tool for sending agent messages

#### `createCloseAgentSessionTool()`

Create a tool for closing agent sessions.

```typescript
export function createCloseAgentSessionTool(): Tool;
```

**Returns:** MCP tool for closing agent sessions

#### `createListAgentSessionsTool()`

Create a tool for listing agent sessions.

```typescript
export function createListAgentSessionsTool(): Tool;
```

**Returns:** MCP tool for listing agent sessions

#### `createGetAgentSessionTool()`

Create a tool for getting agent session details.

```typescript
export function createGetAgentSessionTool(): Tool;
```

**Returns:** MCP tool for getting agent session details

#### `createGetAgentStatsTool()`

Create a tool for getting agent statistics.

```typescript
export function createGetAgentStatsTool(): Tool;
```

**Returns:** MCP tool for getting agent statistics

#### `createCleanupAgentSessionsTool()`

Create a tool for cleaning up old agent sessions.

```typescript
export function createCleanupAgentSessionsTool(): Tool;
```

**Returns:** MCP tool for cleaning up agent sessions

### Ollama Factories

Factory functions for creating Ollama-related tools.

#### `createSubmitJobTool()`

Create a tool for submitting Ollama jobs.

```typescript
export function createSubmitJobTool(): Tool;
```

**Returns:** MCP tool for submitting Ollama jobs

#### `createGetJobStatusTool()`

Create a tool for getting job status.

```typescript
export function createGetJobStatusTool(): Tool;
```

**Returns:** MCP tool for getting job status

#### `createGetJobResultTool()`

Create a tool for getting job results.

```typescript
export function createGetJobResultTool(): Tool;
```

**Returns:** MCP tool for getting job results

#### `createListJobsTool()`

Create a tool for listing jobs.

```typescript
export function createListJobsTool(): Tool;
```

**Returns:** MCP tool for listing jobs

#### `createCancelJobTool()`

Create a tool for canceling jobs.

```typescript
export function createCancelJobTool(): Tool;
```

**Returns:** MCP tool for canceling jobs

#### `createListModelsTool()`

Create a tool for listing Ollama models.

```typescript
export function createListModelsTool(): Tool;
```

**Returns:** MCP tool for listing Ollama models

#### `createGetQueueInfoTool()`

Create a tool for getting queue information.

```typescript
export function createGetQueueInfoTool(): Tool;
```

**Returns:** MCP tool for getting queue information

#### `createSubmitFeedbackTool()`

Create a tool for submitting feedback.

```typescript
export function createSubmitFeedbackTool(): Tool;
```

**Returns:** MCP tool for submitting feedback

### Process Factories

Factory functions for creating process management tools.

#### `createStartProcessTool()`

Create a tool for starting processes.

```typescript
export function createStartProcessTool(): Tool;
```

**Returns:** MCP tool for starting processes

#### `createStopProcessTool()`

Create a tool for stopping processes.

```typescript
export function createStopProcessTool(): Tool;
```

**Returns:** MCP tool for stopping processes

#### `createListProcessesTool()`

Create a tool for listing processes.

```typescript
export function createListProcessesTool(): Tool;
```

**Returns:** MCP tool for listing processes

#### `createProcessStatusTool()`

Create a tool for getting process status.

```typescript
export function createProcessStatusTool(): Tool;
```

**Returns:** MCP tool for getting process status

#### `createTailProcessLogsTool()`

Create a tool for tailing process logs.

```typescript
export function createTailProcessLogsTool(): Tool;
```

**Returns:** MCP tool for tailing process logs

#### `createTailProcessErrorTool()`

Create a tool for tailing process error logs.

```typescript
export function createTailProcessErrorTool(): Tool;
```

**Returns:** MCP tool for tailing process error logs

### Cache Factories

Factory functions for creating cache management tools.

#### `createInitializeCacheTool()`

Create a tool for initializing cache.

```typescript
export function createInitializeCacheTool(): Tool;
```

**Returns:** MCP tool for initializing cache

#### `createCheckCacheTool()`

Create a tool for checking cache.

```typescript
export function createCheckCacheTool(): Tool;
```

**Returns:** MCP tool for checking cache

#### `createCreateCacheKeyTool()`

Create a tool for creating cache keys.

```typescript
export function createCreateCacheKeyTool(): Tool;
```

**Returns:** MCP tool for creating cache keys

#### `createStoreInCacheTool()`

Create a tool for storing data in cache.

```typescript
export function createStoreInCacheTool(): Tool;
```

**Returns:** MCP tool for storing data in cache

### Sessions Factories

Factory functions for creating session management tools.

#### `createCreateSessionTool()`

Create a tool for creating sessions.

```typescript
export function createCreateSessionTool(): Tool;
```

**Returns:** MCP tool for creating sessions

#### `createGetSessionTool()`

Create a tool for getting session details.

```typescript
export function createGetSessionTool(): Tool;
```

**Returns:** MCP tool for getting session details

#### `createListSessionsTool()`

Create a tool for listing sessions.

```typescript
export function createListSessionsTool(): Tool;
```

**Returns:** MCP tool for listing sessions

#### `createCloseSessionTool()`

Create a tool for closing sessions.

```typescript
export function createCloseSessionTool(): Tool;
```

**Returns:** MCP tool for closing sessions

#### `createSearchSessionsTool()`

Create a tool for searching sessions.

```typescript
export function createSearchSessionsTool(): Tool;
```

**Returns:** MCP tool for searching sessions

### Events Factories

Factory functions for creating event management tools.

#### `createHandleSessionIdleTool()`

Create a tool for handling session idle events.

```typescript
export function createHandleSessionIdleTool(): Tool;
```

**Returns:** MCP tool for handling session idle events

#### `createHandleSessionUpdatedTool()`

Create a tool for handling session updated events.

```typescript
export function createHandleSessionUpdatedTool(): Tool;
```

**Returns:** MCP tool for handling session updated events

#### `createHandleMessageUpdatedTool()`

Create a tool for handling message updated events.

```typescript
export function createHandleMessageUpdatedTool(): Tool;
```

**Returns:** MCP tool for handling message updated events

#### `createExtractSessionIdTool()`

Create a tool for extracting session IDs.

```typescript
export function createExtractSessionIdTool(): Tool;
```

**Returns:** MCP tool for extracting session IDs

#### `createGetSessionMessagesTool()`

Create a tool for getting session messages.

```typescript
export function createGetSessionMessagesTool(): Tool;
```

**Returns:** MCP tool for getting session messages

#### `createDetectTaskCompletionTool()`

Create a tool for detecting task completion.

```typescript
export function createDetectTaskCompletionTool(): Tool;
```

**Returns:** MCP tool for detecting task completion

#### `createProcessSessionMessagesTool()`

Create a tool for processing session messages.

```typescript
export function createProcessSessionMessagesTool(): Tool;
```

**Returns:** MCP tool for processing session messages

### Messages Factories

Factory functions for creating message management tools.

#### `createDetectTaskCompletionMessagesTool()`

Create a tool for detecting task completion in messages.

```typescript
export function createDetectTaskCompletionMessagesTool(): Tool;
```

**Returns:** MCP tool for detecting task completion in messages

#### `createProcessMessageTool()`

Create a tool for processing messages.

```typescript
export function createProcessMessageTool(): Tool;
```

**Returns:** MCP tool for processing messages

#### `createProcessSessionMessagesMessagesTool()`

Create a tool for processing session messages.

```typescript
export function createProcessSessionMessagesMessagesTool(): Tool;
```

**Returns:** MCP tool for processing session messages

#### `createGetSessionMessagesMessagesTool()`

Create a tool for getting session messages.

```typescript
export function createGetSessionMessagesMessagesTool(): Tool;
```

**Returns:** MCP tool for getting session messages

### Messaging Factories

Factory functions for creating messaging tools.

#### `createSendMessageTool()`

Create a tool for sending messages.

```typescript
export function createSendMessageTool(): Tool;
```

**Returns:** MCP tool for sending messages

#### `createVerifyAgentExistsTool()`

Create a tool for verifying agent existence.

```typescript
export function createVerifyAgentExistsTool(): Tool;
```

**Returns:** MCP tool for verifying agent existence

#### `createGetSenderSessionIdTool()`

Create a tool for getting sender session ID.

```typescript
export function createGetSenderSessionIdTool(): Tool;
```

**Returns:** MCP tool for getting sender session ID

#### `createFormatMessageTool()`

Create a tool for formatting messages.

```typescript
export function createFormatMessageTool(): Tool;
```

**Returns:** MCP tool for formatting messages

#### `createLogCommunicationTool()`

Create a tool for logging communication.

```typescript
export function createLogCommunicationTool(): Tool;
```

**Returns:** MCP tool for logging communication

### Tasks Factories

Factory functions for creating task management tools.

#### `createLoadPersistedTasksTool()`

Create a tool for loading persisted tasks.

```typescript
export function createLoadPersistedTasksTool(): Tool;
```

**Returns:** MCP tool for loading persisted tasks

#### `createVerifySessionExistsTool()`

Create a tool for verifying session existence.

```typescript
export function createVerifySessionExistsTool(): Tool;
```

**Returns:** MCP tool for verifying session existence

#### `createCleanupOrphanedTaskTool()`

Create a tool for cleaning up orphaned tasks.

```typescript
export function createCleanupOrphanedTaskTool(): Tool;
```

**Returns:** MCP tool for cleaning up orphaned tasks

#### `createUpdateTaskStatusTool()`

Create a tool for updating task status.

```typescript
export function createUpdateTaskStatusTool(): Tool;
```

**Returns:** MCP tool for updating task status

#### `createMonitorTasksTool()`

Create a tool for monitoring tasks.

```typescript
export function createMonitorTasksTool(): Tool;
```

**Returns:** MCP tool for monitoring tasks

#### `createCreateTaskTool()`

Create a tool for creating tasks.

```typescript
export function createCreateTaskTool(): Tool;
```

**Returns:** MCP tool for creating tasks

#### `createGetAllTasksTool()`

Create a tool for getting all tasks.

```typescript
export function createGetAllTasksTool(): Tool;
```

**Returns:** MCP tool for getting all tasks

#### `createParseTimestampTool()`

Create a tool for parsing timestamps.

```typescript
export function createParseTimestampTool(): Tool;
```

**Returns:** MCP tool for parsing timestamps

---

## Plugin Architecture

The OpenCode Client supports a plugin architecture for extending functionality.

### Plugin Interface

All plugins must implement the following interface:

```typescript
interface Plugin {
  name: string;
  version: string;
  description: string;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getTools(): Tool[];
  getCommands(): Command[];
}
```

#### Properties

- `name`: Unique plugin name
- `version`: Plugin version (semantic versioning)
- `description`: Plugin description
- `initialize()`: Async initialization function
- `destroy()`: Async cleanup function
- `getTools()`: Returns array of MCP tools
- `getCommands()`: Returns array of CLI commands

### Plugin Registration

Plugins can be registered programmatically or via configuration files.

#### Programmatic Registration

```typescript
import { PluginRegistry } from '@promethean/opencode-client';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  async initialize() {
    // Plugin initialization logic
  },
  async destroy() {
    // Plugin cleanup logic
  },
  getTools() {
    return [
      // Return MCP tools
    ];
  },
  getCommands() {
    return [
      // Return CLI commands
    ];
  },
};

await PluginRegistry.register(myPlugin);
```

#### Configuration File Registration

Create a `plugins.json` file:

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "path": "./plugins/my-plugin.js",
      "enabled": true,
      "config": {
        "option1": "value1",
        "option2": "value2"
      }
    }
  ]
}
```

### Plugin Lifecycle

Plugins follow a specific lifecycle:

1. **Registration**: Plugin is registered with the system
2. **Initialization**: `initialize()` method is called
3. **Active**: Plugin tools and commands are available
4. **Destruction**: `destroy()` method is called on shutdown

#### Example Plugin Implementation

```typescript
import { Plugin, Tool } from '@promethean/opencode-client';

class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'Example plugin for demonstration';

  async initialize(): Promise<void> {
    console.log('Initializing MyPlugin');
    // Initialize plugin resources
  }

  async destroy(): Promise<void> {
    console.log('Destroying MyPlugin');
    // Cleanup plugin resources
  }

  getTools(): Tool[] {
    return [
      {
        name: 'my-plugin-tool',
        description: 'Example tool from my plugin',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to process',
            },
          },
          required: ['message'],
        },
        handler: async (params) => {
          return { result: `Processed: ${params.message}` };
        },
      },
    ];
  }

  getCommands(): Command[] {
    return [
      {
        name: 'my-plugin-command',
        description: 'Example command from my plugin',
        action: async (args) => {
          console.log('Executing my plugin command');
          return { success: true };
        },
      },
    ];
  }
}

export default new MyPlugin();
```

---

## Ollama API Integration

The package provides comprehensive integration with the Ollama API for LLM operations.

### Job Management

#### Job Lifecycle

Jobs follow a specific lifecycle through different states:

1. **pending**: Job is queued and waiting to be processed
2. **running**: Job is currently being processed
3. **completed**: Job finished successfully
4. **failed**: Job failed due to an error
5. **canceled**: Job was canceled by user

#### Job Interfaces

##### `JobOptions`

```typescript
interface JobOptions {
  status?: string; // Filter by job status
  limit?: number; // Maximum number of jobs to return
  agentOnly?: boolean; // Filter for agent-only jobs
}
```

##### `SubmitJobOptions`

```typescript
interface SubmitJobOptions {
  modelName: string; // Name of the model to use
  jobType: 'generate' | 'chat' | 'embedding'; // Type of job
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Job priority
  jobName?: string; // Optional human-readable job name
  prompt?: string; // Prompt text for generate jobs
  messages?: Array<{ role: string; content: string }>; // Messages for chat jobs
  input?: string | string[]; // Input text for embedding jobs
  options?: {
    temperature?: number; // Sampling temperature (0.0-1.0)
    top_p?: number; // Top-p sampling (0.0-1.0)
    num_ctx?: number; // Context window size
    num_predict?: number; // Maximum tokens to predict
    stop?: string[]; // Stop sequences
    format?: string | object; // Output format
  };
}
```

##### `Job`

```typescript
interface Job {
  id: string; // Unique job identifier
  modelName: string; // Model used for the job
  jobType: string; // Type of job
  status: string; // Current status
  jobName?: string; // Human-readable name
  createdAt: string; // ISO timestamp of creation
  updatedAt?: string; // ISO timestamp of last update
}
```

### Model Operations

#### List Models

```typescript
async function listModels(detailed = false): Promise<any[]>;
```

**Parameters:**

- `detailed`: Whether to include detailed model information

**Returns:** Array of model objects

**Example:**

```typescript
const models = await listModels(true);
console.log(
  'Available models:',
  models.map((m) => m.name),
);
```

#### Model Information

Each model object contains:

```typescript
interface Model {
  name: string; // Model name
  modified_at: string; // Last modification timestamp
  size: number; // Model size in bytes
  digest: string; // Model digest
  details?: {
    parent_model: string; // Parent model
    format: string; // Model format
    family: string; // Model family
    families: string[]; // Compatible families
    parameter_size: string; // Parameter size
    quantization_level: string; // Quantization level
  };
}
```

### Queue Management

#### Queue Information

```typescript
async function getQueueInfo(): Promise<any>;
```

**Returns:** Queue statistics and status

**Example:**

```typescript
const info = await getQueueInfo();
console.log('Queue status:', {
  pendingJobs: info.pendingJobs,
  runningJobs: info.runningJobs,
  completedJobs: info.completedJobs,
  failedJobs: info.failedJobs,
  averageWaitTime: info.averageWaitTime,
  averageProcessingTime: info.averageProcessingTime,
});
```

#### Cache Management

```typescript
async function manageCache(action: string): Promise<any>;
```

**Parameters:**

- `action`: Cache action ('stats', 'clear', 'clear-expired', 'performance-analysis')

**Returns:** Cache operation results

**Example:**

```typescript
const stats = await manageCache('stats');
console.log('Cache statistics:', {
  totalEntries: stats.totalEntries,
  hitRate: stats.hitRate,
  missRate: stats.missRate,
  averageAccessTime: stats.averageAccessTime,
  memoryUsage: stats.memoryUsage,
});
```

---

## Sessions API

The Sessions API provides comprehensive session management capabilities.

### Session Lifecycle

Sessions follow a specific lifecycle:

1. **created**: Session is created and initialized
2. **active**: Session is active and processing messages
3. **idle**: Session is idle waiting for input
4. **completed**: Session has completed its task
5. **closed**: Session is closed and cleaned up

### Session Interfaces

#### `Session`

```typescript
interface Session {
  id: string; // Unique session identifier
  title?: string; // Session title
  messageCount?: number; // Number of messages in session
  lastActivityTime?: string; // ISO timestamp of last activity
  activityStatus?: 'active' | 'waiting_for_input' | 'completed' | 'error';
  isAgentTask?: boolean; // Whether session is an agent task
  agentTaskStatus?: string; // Agent task status if applicable
  createdAt?: string; // ISO timestamp of creation
}
```

#### `CreateSessionOptions`

```typescript
interface CreateSessionOptions {
  title?: string; // Session title
  files?: string[]; // Files to include in session
  delegates?: string[]; // Agent delegates for the session
}
```

#### `ListSessionsOptions`

```typescript
interface ListSessionsOptions {
  limit?: number; // Maximum number of sessions to return
  offset?: number; // Number of sessions to skip
}
```

#### `SearchSessionsOptions`

```typescript
interface SearchSessionsOptions {
  query: string; // Search query
  k?: number; // Maximum number of results
}
```

### Session Management

#### Create Session

```typescript
async function createSession(options: CreateSessionOptions = {}): Promise<Session>;
```

**Parameters:**

- `options`: Session creation options

**Returns:** Created session object

**Example:**

```typescript
const session = await createSession({
  title: 'Code Review Session',
  files: ['src/main.ts', 'src/utils.ts'],
  delegates: ['reviewer', 'security-analyzer'],
});
```

#### Get Session

```typescript
async function getSession(sessionId: string): Promise<Session>;
```

**Parameters:**

- `sessionId`: Unique session identifier

**Returns:** Session object with full details

**Example:**

```typescript
const session = await getSession('sess_123456');
console.log('Session details:', session);
```

#### List Sessions

```typescript
async function listSessions(options: ListSessionsOptions = {}): Promise<Session[]>;
```

**Parameters:**

- `options`: Pagination options

**Returns:** Array of session objects

**Example:**

```typescript
const sessions = await listSessions({
  limit: 10,
  offset: 0,
});
```

#### Close Session

```typescript
async function closeSession(sessionId: string): Promise<void>;
```

**Parameters:**

- `sessionId`: Unique session identifier

**Example:**

```typescript
await closeSession('sess_123456');
```

### Session Search

#### Search Sessions

```typescript
async function searchSessions(options: SearchSessionsOptions): Promise<Session[]>;
```

**Parameters:**

- `options`: Search options

**Returns:** Array of matching sessions

**Example:**

```typescript
const results = await searchSessions({
  query: 'bug fix authentication',
  k: 5,
});
```

The search uses semantic embeddings to find relevant sessions based on the query content.

---

## Error Handling

The API provides comprehensive error handling for various failure conditions.

### Error Types

#### Network Errors

```typescript
try {
  const jobs = await listJobs();
} catch (error) {
  if (error.name === 'NetworkError') {
    console.error('Network connection failed');
  } else if (error.name === 'TimeoutError') {
    console.error('Request timed out');
  }
}
```

#### Authentication Errors

```typescript
try {
  const result = await getJobResult('job_123');
} catch (error) {
  if (error.status === 401) {
    console.error('Authentication required');
  } else if (error.status === 403) {
    console.error('Insufficient permissions');
  }
}
```

#### Validation Errors

```typescript
try {
  await submitJob({
    modelName: '', // Invalid empty model name
    jobType: 'generate',
    priority: 'medium',
  });
} catch (error) {
  if (error.name === 'ValidationError') {
    console.error('Validation failed:', error.message);
  }
}
```

#### Session Errors

```typescript
try {
  const session = await getSession('invalid_session_id');
} catch (error) {
  if (error.name === 'SessionNotFoundError') {
    console.error('Session not found');
  } else if (error.name === 'SessionClosedError') {
    console.error('Session is already closed');
  }
}
```

#### Task Errors

```typescript
try {
  await AgentTaskManager.updateTaskStatus('invalid_session', 'running');
} catch (error) {
  if (error.name === 'TaskNotFoundError') {
    console.error('Task not found');
  } else if (error.name === 'TaskUpdateError') {
    console.error('Failed to update task status');
  }
}
```

### Error Recovery

#### Retry Logic

The client implements automatic retry logic with exponential backoff:

```typescript
const config = {
  retries: 3,
  retryDelay: 1000, // Initial delay in milliseconds
  retryBackoff: 2, // Backoff multiplier
};
```

#### Circuit Breaker

For critical operations, the client implements a circuit breaker pattern:

```typescript
const circuitBreaker = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 60000, // 1 minute
};
```

---

## Authentication

The API supports multiple authentication methods for secure access.

### Bearer Token Authentication

```typescript
// Set via environment variable
process.env.OPENCODE_AUTH_TOKEN = 'your-bearer-token';

// Or in configuration file
const config = {
  auth: {
    type: 'bearer',
    token: 'your-bearer-token',
  },
};
```

### API Key Authentication

```typescript
const config = {
  auth: {
    type: 'apikey',
    key: 'your-api-key',
    header: 'X-API-Key',
  },
};
```

### Custom Authentication

```typescript
const config = {
  auth: {
    type: 'custom',
    handler: async (request) => {
      // Custom authentication logic
      request.headers.set('Authorization', 'Custom scheme');
    },
  },
};
```

### Token Management

#### Token Refresh

```typescript
async function refreshToken(): Promise<string> {
  // Implement token refresh logic
  return newToken;
}

// Configure automatic token refresh
const config = {
  auth: {
    type: 'bearer',
    token: 'initial-token',
    refreshToken,
  },
};
```

#### Token Validation

```typescript
async function validateToken(token: string): Promise<boolean> {
  // Implement token validation logic
  return isValid;
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage.

### Rate Limit Headers

```typescript
const response = await apiCall();
console.log('Rate limit remaining:', response.headers.get('X-RateLimit-Remaining'));
console.log('Rate limit reset:', response.headers.get('X-RateLimit-Reset'));
```

### Automatic Retry

The client automatically retries failed requests with exponential backoff:

```typescript
const config = {
  retries: 3,
  retryDelay: 1000, // Initial delay in milliseconds
  retryBackoff: 2, // Backoff multiplier
};
```

### Manual Rate Limit Handling

```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.status === 429) {
    const retryAfter = error.headers.get('Retry-After');
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  }
}
```

### Rate Limit Strategies

#### Token Bucket

```typescript
const tokenBucket = {
  capacity: 100,
  refillRate: 10, // tokens per second
  tokens: 100,
};
```

#### Sliding Window

```typescript
const slidingWindow = {
  windowSize: 60000, // 1 minute
  maxRequests: 100,
  requests: [],
};
```

### Configuration

#### Environment Variables

```bash
OPENCODE_SERVER_URL=http://localhost:3000
OPENCODE_AUTH_TOKEN=your-token
OPENCODE_TIMEOUT=30000
OPENCODE_RETRIES=3
```

#### Configuration File

```json
{
  "server": {
    "url": "http://localhost:3000",
    "timeout": 30000,
    "retries": 3
  },
  "auth": {
    "type": "bearer",
    "token": "your-token"
  },
  "rateLimit": {
    "enabled": true,
    "maxRetries": 3,
    "initialDelay": 1000,
    "backoffMultiplier": 2
  }
}
```

---

## Best Practices

### Error Handling

1. **Always wrap API calls in try-catch blocks**
2. **Handle specific error types appropriately**
3. **Implement retry logic for transient failures**
4. **Log errors for debugging purposes**

### Session Management

1. **Close sessions when no longer needed**
2. **Use appropriate session timeouts**
3. **Monitor session activity**
4. **Clean up orphaned sessions regularly**

### Task Management

1. **Set appropriate task priorities**
2. **Monitor task status and progress**
3. **Handle task completion and failures**
4. **Implement task cleanup procedures**

### Performance Optimization

1. **Use caching for repeated requests**
2. **Implement pagination for large result sets**
3. **Use connection pooling for network requests**
4. **Monitor and optimize response times**

### Security

1. **Store authentication tokens securely**
2. **Use HTTPS for all API calls**
3. **Validate all input parameters**
4. **Implement proper error handling to avoid information leakage**

### Testing

1. **Write comprehensive unit tests**
2. **Test error scenarios**
3. **Use mock data for testing**
4. **Implement integration tests**

---

## Migration from Mock to Production

To replace mock implementations with production API calls:

### Step 1: Update Base URL

```typescript
// Before (mock)
const baseUrl = 'http://localhost:3000/mock';

// After (production)
const baseUrl = process.env.OPENCODE_SERVER_URL || 'http://localhost:3000';
```

### Step 2: Add Authentication

```typescript
// Before (no auth)
const response = await fetch(`${baseUrl}/api/endpoint`);

// After (with auth)
const headers = new Headers();
headers.set('Authorization', `Bearer ${getAuthToken()}`);

const response = await fetch(`${baseUrl}/api/endpoint`, { headers });
```

### Step 3: Handle Errors

```typescript
// Before (simple error handling)
if (!response.ok) {
  throw new Error('Request failed');
}

// After (comprehensive error handling)
if (!response.ok) {
  const error = await response.json();
  throw new APIError(error.message, response.status, error.details);
}
```

### Step 4: Add Logging

```typescript
// Before (no logging)
const result = await apiCall();

// After (with logging)
console.log(`API Call: ${method} ${url}`);
const result = await apiCall();
console.log(`API Response: ${result.status} ${result.statusText}`);
```

### Step 5: Test Thoroughly

```typescript
// Test all endpoints
describe('API Integration', () => {
  it('should handle successful requests', async () => {
    // Test successful API calls
  });

  it('should handle authentication errors', async () => {
    // Test authentication failures
  });

  it('should handle rate limiting', async () => {
    // Test rate limiting scenarios
  });

  it('should handle network failures', async () => {
    // Test network failure scenarios
  });
});
```

### Example Migration

```typescript
// Before (mock)
export async function listJobs(options: JobOptions): Promise<Job[]> {
  console.log('Mock: Listing jobs with options:', options);
  return [];
}

// After (production)
export async function listJobs(options: JobOptions): Promise<Job[]> {
  const params = new URLSearchParams();
  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.agentOnly !== undefined) params.append('agentOnly', options.agentOnly.toString());

  const response = await fetch(`${getServerUrl()}/api/ollama-queue/listJobs?${params}`, {
    headers: getAuthHeaders(),
    signal: AbortSignal.timeout(getTimeout()),
  });

  if (!response.ok) {
    throw new APIError(`Failed to list jobs: ${response.statusText}`, response.status);
  }

  return response.json();
}
```

This comprehensive API documentation provides all the information needed to effectively use the OpenCode Client package, from basic usage to advanced features and best practices.
