# @promethean/agent-orchestrator

Agent session management and orchestration for the Promethean framework.

## Overview

This package provides a comprehensive agent orchestration system extracted from the OpenCode async-sub-agents plugin. It enables spawning, monitoring, and coordinating multiple AI agents working on different tasks simultaneously.

## Features

- **Agent Spawning**: Create new agent sessions with specific tasks
- **Session Management**: Monitor and manage agent sessions
- **Inter-Agent Communication**: Send messages between agents
- **Persistent Storage**: Optional persistence using DualStoreManager
- **Automatic Cleanup**: Configurable timeout and cleanup mechanisms
- **CLI Interface**: Command-line tools for agent management

## Installation

```bash
pnpm add @promethean/agent-orchestrator
```

## Quick Start

### Basic Usage

```typescript
import { AgentOrchestrator } from '@promethean/agent-orchestrator';
import { OpenCodeClient } from '@opencode-ai/sdk';

// Initialize the orchestrator
const client = new OpenCodeClient(/* config */);
const orchestrator = new AgentOrchestrator(client, {
  timeoutThreshold: 30 * 60 * 1000, // 30 minutes
  persistenceEnabled: true,
  autoCleanup: false,
});

await orchestrator.initialize();

// Spawn a new agent
const result = await orchestrator.spawnAgent({
  prompt: 'Analyze the codebase for security vulnerabilities',
  files: ['src/security/*.ts'],
  delegates: ['security-specialist'],
});

console.log(result);

// Monitor all agents
const summary = await orchestrator.monitorAgents();
console.log(`Active agents: ${summary.running}`);
```

### Inter-Agent Communication

```typescript
// Send a message to a specific agent
const response = await orchestrator.sendAgentMessage(
  'ses_abc123def456',
  'Please provide an update on your progress',
  'high',
  'status_request',
);

console.log(response);
```

## CLI Usage

The package includes a CLI tool for agent management:

```bash
# Spawn a new agent
agent-orchestrator spawn "Analyze the codebase for security issues"

# Monitor all agents
agent-orchestrator monitor

# Get status of a specific agent
agent-orchestrator status ses_abc123def456

# Send a message to an agent
agent-orchestrator send ses_abc123def456 "Please provide an update" --priority high

# List all sessions
agent-orchestrator list --limit 10

# Cleanup completed agents
agent-orchestrator cleanup --timeout 120
```

## API Reference

### AgentOrchestrator

#### Constructor

```typescript
new AgentOrchestrator(client: OpenCodeClient, config?: AgentOrchestratorConfig)
```

#### Configuration Options

```typescript
interface AgentOrchestratorConfig {
  timeoutThreshold?: number; // Agent timeout in milliseconds (default: 30 minutes)
  monitoringInterval?: number; // Monitoring interval in milliseconds (default: 5 minutes)
  autoCleanup?: boolean; // Enable automatic cleanup (default: false)
  persistenceEnabled?: boolean; // Enable persistent storage (default: true)
}
```

#### Methods

##### `initialize(): Promise<void>`

Initialize the orchestrator and set up persistent storage if enabled.

##### `spawnAgent(options: SpawnAgentOptions): Promise<string>`

Spawn a new agent with the given task.

```typescript
interface SpawnAgentOptions {
  prompt: string; // Task description for the agent
  files?: string[]; // Optional files to include
  delegates?: string[]; // Optional agents to delegate to
}
```

##### `monitorAgents(): Promise<AgentMonitoringSummary>`

Get a summary of all agent statuses.

##### `getAgentStatus(sessionId: string): Promise<AgentStatus | string>`

Get detailed status of a specific agent.

##### `sendAgentMessage(sessionId, message, priority?, messageType?): Promise<string>`

Send a message to a specific agent.

##### `listSessions(limit?, offset?): Promise<SessionListResponse>`

List all sessions with pagination.

##### `cleanupCompletedAgents(olderThanMinutes?): Promise<string>`

Clean up completed/failed agents older than the specified time.

##### `destroy(): Promise<void>`

Cleanup and destroy the orchestrator.

## Types

### AgentTask

```typescript
interface AgentTask {
  sessionId: string;
  task: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastActivity: number;
  completionMessage?: string;
}
```

### AgentStatus

```typescript
interface AgentStatus {
  sessionId: string;
  task: string;
  status: 'running' | 'completed' | 'failed' | 'idle';
  startTime: string;
  lastActivity: string;
  duration: number;
  completionMessage?: string;
}
```

### AgentMonitoringSummary

```typescript
interface AgentMonitoringSummary {
  totalAgents: number;
  running: number;
  completed: number;
  failed: number;
  idle: number;
  agents: AgentStatus[];
}
```

## Advanced Usage

### Custom Event Handling

```typescript
import { AgentOrchestrator } from '@promethean/agent-orchestrator';

const orchestrator = new AgentOrchestrator(client, {
  autoCleanup: true,
  timeoutThreshold: 60 * 60 * 1000, // 1 hour
});

await orchestrator.initialize();

// Set up custom monitoring
setInterval(async () => {
  const summary = await orchestrator.monitorAgents();
  if (summary.failed > 0) {
    console.warn(`⚠️ ${summary.failed} agents have failed`);
    // Handle failed agents
  }
}, 60000); // Check every minute
```

### Batch Operations

```typescript
// Spawn multiple agents for parallel processing
const tasks = [
  'Analyze frontend components',
  'Review API endpoints',
  'Check database queries',
  'Validate security configurations',
];

const agents = await Promise.all(tasks.map((task) => orchestrator.spawnAgent({ prompt: task })));

console.log(`Spawned ${agents.length} agents`);
```

## Integration with OpenCode

This package is designed to work seamlessly with the OpenCode SDK. When used within an OpenCode plugin, you can access the client directly:

```typescript
export const MyPlugin: Plugin = async ({ client }) => {
  const orchestrator = new AgentOrchestrator(client);
  await orchestrator.initialize();

  // Use orchestrator in your plugin
  return {
    tool: {
      spawn_agent: tool({
        description: 'Spawn a sub-agent',
        args: {
          prompt: tool.schema.string(),
        },
        async execute({ prompt }) {
          return await orchestrator.spawnAgent({ prompt });
        },
      }),
    },
  };
};
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## License

MIT
