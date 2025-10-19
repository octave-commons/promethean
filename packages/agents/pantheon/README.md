# Pantheon Agent Framework

The unified agent framework for the Promethean ecosystem, consolidating context management, orchestration, protocols, and workflow systems into a single cohesive package.

## Overview

Pantheon brings together 7 previously separate agent packages:

- **Context Management** - Agent context with event sourcing and snapshots
- **Orchestration** - Agent orchestration and scheduling system
- **Protocol Communication** - AMQP and WebSocket transport protocols
- **Workflow System** - Workflow execution with healing and providers
- **OS Protocol** - Operating system interface for agents
- **Agent Generator** - CLI tools for agent generation
- **Management UI** - UI components for agent management

## Installation

```bash
pnpm add @promethean/pantheon
```

## Quick Start

```typescript
import {
  AgentId,
  AgentStatus,
  ContextManager,
  AgentOrchestrator,
  MessageEnvelope,
} from '@promethean/pantheon';

// Create an agent ID
const agentId: AgentId = {
  value: 'my-agent-123',
  type: 'uuid',
};

// Work with contexts
const contextManager = new ContextManager();
const context = await contextManager.createContext({
  id: { value: 'session-1', type: 'session' },
  agentId,
  name: 'My Session',
  permissions: {
    read: [agentId],
    write: [agentId],
    admin: [agentId],
    public: false,
  },
});

// Send messages
const message: MessageEnvelope = {
  id: { value: 'msg-1', type: 'uuid' },
  from: agentId,
  to: { value: 'target-agent', type: 'uuid' },
  type: 'greeting',
  payload: { hello: 'world' },
  timestamp: new Date(),
  priority: 1,
};
```

## Module Structure

```
src/
├── core/           # Unified types and base classes
├── context/        # Context management system
├── orchestrator/   # Agent orchestration
├── protocol/       # Communication protocols
├── workflow/       # Workflow execution engine
├── os-protocol/    # OS interface
├── generator/      # Agent generation tools
├── management-ui/  # UI components
└── shared/         # Shared utilities
```

## Development

### Building

```bash
# Build TypeScript
pnpm run build:ts

# Build ClojureScript
pnpm run build:clj

# Build both
pnpm run build
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### Development Mode

```bash
# Watch TypeScript compilation
pnpm dev

# Watch ClojureScript compilation
pnpm dev:clj
```

## API Documentation

### Core Types

The framework provides unified types that work across all modules:

- `AgentId` - Unique agent identifier
- `AgentStatus` - Agent lifecycle states
- `ContextId` - Context identifier
- `MessageEnvelope` - Message structure
- `WorkflowDefinition` - Workflow specification
- And many more...

### Error Handling

Pantheon provides specialized error types for each module:

```typescript
import {
  PantheonError,
  ContextError,
  ProtocolError,
  WorkflowError,
  OrchestrationError,
} from '@promethean/pantheon';

try {
  // Your code here
} catch (error) {
  if (error instanceof ContextError) {
    console.log('Context error:', error.code);
  }
}
```

## Migration from Separate Packages

If you're migrating from the separate agent packages:

```typescript
// Before
import { ContextManager } from '@promethean/agent-context';
import { AgentOrchestrator } from '@promethean/agent-orchestrator';
import { AMQPTransport } from '@promethean/agent-protocol';

// After
import { Context } from '@promethean/pantheon';
const { ContextManager } = Context;
import { Orchestrator } from '@promethean/pantheon';
const { AgentOrchestrator } = Orchestrator;
import { Protocol } from '@promethean/pantheon';
const { AMQPTransport } = Protocol;
```

## Contributing

1. Follow the existing code patterns and conventions
2. Add tests for new functionality
3. Update documentation
4. Ensure TypeScript types are complete

## License

GPL-3.0-only
