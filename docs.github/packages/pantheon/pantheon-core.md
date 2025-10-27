# Pantheon Core

## Overview

`@promethean-os/pantheon-core` is the foundational library of the Pantheon ecosystem, providing the core types, interfaces, and functional primitives for building AI agents with embodied reasoning and perception-action loops.

## Key Features

- **Actor Model**: Autonomous agents with behaviors, talents, and goals
- **Context Engine**: Dynamic semantic retrieval and compilation from multiple sources
- **Port System**: Hexagonal architecture with dependency injection
- **Type Safety**: Comprehensive TypeScript interfaces with 747+ lines of documented types
- **Functional Programming**: Pure functions and immutable data structures

## Installation

```bash
pnpm add @promethean-os/pantheon-core
```

## Core Concepts

### Actor Model

The Actor Model represents autonomous agents that can perceive, reason, and act in their environment.

```typescript
import { Actor, ActorScript, Talent, Behavior } from '@promethean-os/pantheon-core';

// Define a behavior
const greetingBehavior: Behavior = {
  name: 'greet-user',
  description: 'Greets users with a friendly message',
  mode: 'active',
  plan: async ({ goal, context }) => {
    return {
      actions: [
        {
          type: 'message',
          content: `Hello! I'm here to help you with: ${goal}`,
          target: 'user',
        },
      ],
    };
  },
};

// Create a talent with the behavior
const socialTalent: Talent = {
  name: 'social-interaction',
  description: 'Handles social interactions with users',
  behaviors: [greetingBehavior],
};

// Define an actor script
const actorScript: ActorScript = {
  name: 'Customer Service Agent',
  description: 'Helps customers with their inquiries',
  talents: [socialTalent],
  contextSources: [
    {
      type: 'text',
      content: 'Company policies and support procedures...',
      metadata: { category: 'policies' },
    },
  ],
};

// Create an actor
const actor: Actor = {
  id: 'customer-service-001',
  script: actorScript,
  goals: ['Provide excellent customer service'],
  metadata: { department: 'support' },
};
```

### Context Engine

The Context Engine dynamically compiles relevant information from multiple sources.

```typescript
import { ContextPort, ContextSource } from '@promethean-os/pantheon-core';

// Define context sources
const contextSources: ContextSource[] = [
  {
    type: 'text',
    content: 'User preferences and history...',
    metadata: { type: 'user-data' },
  },
  {
    type: 'url',
    url: 'https://api.example.com/policies',
    metadata: { type: 'policies' },
  },
  {
    type: 'file',
    path: '/data/knowledge-base.txt',
    metadata: { type: 'knowledge' },
  },
];

// Compile context
const contextPort: ContextPort = makeContextAdapter(dependencies);
const messages = await contextPort.compile({
  texts: ['Current user inquiry about returns'],
  sources: contextSources,
  limit: 10,
});
```

### Port System

The framework uses a hexagonal architecture with well-defined ports for external dependencies.

```typescript
import {
  ContextPort,
  ToolPort,
  LlmPort,
  MessageBus,
  Scheduler,
  ActorStatePort,
} from '@promethean-os/pantheon-core';

// Context Port - for context compilation
interface ContextPort {
  compile(opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }): Promise<Message[]>;
}

// Tool Port - for tool management
interface ToolPort {
  register(tool: ToolSpec): void;
  invoke(name: string, args: Record<string, unknown>): Promise<unknown>;
}

// LLM Port - for language model interactions
interface LlmPort {
  complete(messages: Message[], opts?: { model?: string; temperature?: number }): Promise<Message>;
}
```

## Core Types

### Actor Types

```typescript
// Main actor interface
interface Actor {
  id: string;
  script: ActorScript;
  goals: string[];
  metadata?: Record<string, unknown>;
}

// Actor script definition
interface ActorScript {
  name: string;
  description: string;
  talents: Talent[];
  contextSources: ContextSource[];
}

// Talent - collection of related behaviors
interface Talent {
  name: string;
  description: string;
  behaviors: Behavior[];
}

// Behavior - reusable action pattern
interface Behavior {
  name: string;
  description: string;
  mode: 'active' | 'passive' | 'persistent';
  plan: (params: { goal: string; context: Message[] }) => Promise<{ actions: Action[] }>;
}
```

### Action Types

```typescript
// Actions an actor can perform
type Action =
  | { type: 'message'; content: string; target?: string }
  | { type: 'tool'; name: string; args: Record<string, unknown> }
  | { type: 'spawn'; actor: ActorScript; goal: string };

// Message type for communications
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}

// Context source types
type ContextSource =
  | { type: 'text'; content: string; metadata?: Record<string, unknown> }
  | { type: 'url'; url: string; metadata?: Record<string, unknown> }
  | { type: 'file'; path: string; metadata?: Record<string, unknown> };
```

### Tool Types

```typescript
// Tool specification
interface ToolSpec {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

// Example tool implementation
const weatherTool: ToolSpec = {
  name: 'get-weather',
  description: 'Gets current weather information',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'Location to get weather for',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
    },
    required: ['location'],
  },
  execute: async (args) => {
    // Tool implementation
    const { location, units = 'metric' } = args;
    // Fetch weather data...
    return `Weather in ${location}: 22°C, sunny`;
  },
};
```

## Core Functions

### makeOrchestrator

Creates the main orchestrator for coordinating actor execution.

```typescript
import { makeOrchestrator, OrchestratorDeps } from '@promethean-os/pantheon-core';

const orchestrator = makeOrchestrator({
  now: () => Date.now(),
  log: console.log,
  context: contextAdapter,
  tools: toolAdapter,
  llm: llmAdapter,
  bus: messageBus,
  schedule: scheduler,
  state: actorStateAdapter,
});

// Tick an actor
await orchestrator.tickActor(actor, {
  userMessage: 'Help me with my order',
});

// Start actor loop
const stopLoop = orchestrator.startActorLoop(actor, 5000);
// Later: stopLoop();
```

### Type Guards

Runtime type checking utilities.

```typescript
import { isActor, isAction, isMessage } from '@promethean-os/pantheon-core';

function processUnknown(obj: unknown) {
  if (isActor(obj)) {
    console.log(`Actor: ${obj.script.name}`);
  }

  if (isAction(obj)) {
    switch (obj.type) {
      case 'message':
        console.log(`Message: ${obj.content}`);
        break;
      case 'tool':
        console.log(`Tool: ${obj.name}`);
        break;
    }
  }

  if (isMessage(obj)) {
    console.log(`Message from ${obj.role}: ${obj.content}`);
  }
}
```

## Adapter Implementations

### In-Memory Adapters

For testing and development, the core provides in-memory implementations:

```typescript
import {
  makeInMemoryContextAdapter,
  makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter,
} from '@promethean-os/pantheon-core';

// Create in-memory adapters
const contextAdapter = makeInMemoryContextAdapter();
const toolAdapter = makeInMemoryToolAdapter();
const llmAdapter = makeInMemoryLlmAdapter();
const messageBus = makeInMemoryMessageBusAdapter();
const scheduler = makeInMemorySchedulerAdapter();
const actorStateAdapter = makeInMemoryActorStateAdapter();
```

### Custom Adapters

Implement custom adapters by extending the port interfaces:

```typescript
// Custom context adapter
class DatabaseContextAdapter implements ContextPort {
  async compile(opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    limit?: number;
  }): Promise<Message[]> {
    // Custom implementation
    const messages: Message[] = [];

    // Process text inputs
    if (opts.texts) {
      for (const text of opts.texts) {
        messages.push({
          role: 'user',
          content: text,
        });
      }
    }

    // Process sources
    for (const source of opts.sources) {
      switch (source.type) {
        case 'text':
          messages.push({
            role: 'system',
            content: source.content,
          });
          break;
        case 'url':
          // Fetch URL content
          const response = await fetch(source.url);
          const content = await response.text();
          messages.push({
            role: 'system',
            content,
          });
          break;
      }
    }

    return messages.slice(0, opts.limit);
  }
}
```

## Error Handling

The core provides structured error types:

```typescript
import { PantheonError, ActorError, BehaviorError, ToolError } from '@promethean-os/pantheon-core';

try {
  await orchestrator.tickActor(actor);
} catch (error) {
  if (error instanceof ActorError) {
    console.error(`Actor ${error.actorId} failed: ${error.message}`);
  } else if (error instanceof BehaviorError) {
    console.error(`Behavior ${error.behaviorName} failed: ${error.message}`);
  } else if (error instanceof ToolError) {
    console.error(`Tool ${error.toolName} failed: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Configuration

### Environment Configuration

```typescript
interface PantheonConfig {
  environment: 'development' | 'production' | 'test';
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
  adapters: {
    context: ContextAdapterConfig;
    llm: LlmAdapterConfig;
    tools: ToolAdapterConfig;
    messageBus: MessageBusConfig;
    scheduler: SchedulerConfig;
    actorState: ActorStateConfig;
  };
  performance: {
    maxConcurrentActors: number;
    maxContextSize: number;
    cacheTtl: number;
  };
}
```

## Best Practices

### 1. Functional Programming

```typescript
// ✅ Good: Pure functions
const processMessage = (message: Message): string => {
  return message.content.toUpperCase();
};

// ❌ Bad: Side effects
let counter = 0;
const processMessageWithSideEffect = (message: Message): string => {
  counter++;
  return `${counter}: ${message.content}`;
};
```

### 2. Immutable Data

```typescript
// ✅ Good: Immutable updates
const updatedActor = {
  ...actor,
  goals: [...actor.goals, 'New goal'],
};

// ❌ Bad: Mutable updates
actor.goals.push('New goal');
```

### 3. Type Safety

```typescript
// ✅ Good: Type guards
function handleAction(action: unknown) {
  if (isAction(action)) {
    // TypeScript knows action is Action here
    switch (action.type) {
      case 'message':
        // Safe access to action.content
        break;
    }
  }
}

// ❌ Bad: Type assertions
const messageAction = action as any;
messageAction.content; // Unsafe
```

### 4. Error Handling

```typescript
// ✅ Good: Specific error types
try {
  await toolPort.invoke('weather-tool', args);
} catch (error) {
  if (error instanceof ToolError) {
    logger.error(`Tool ${error.toolName} failed`, error.details);
  }
}

// ❌ Bad: Generic error handling
try {
  await toolPort.invoke('weather-tool', args);
} catch (error) {
  console.log('Something went wrong');
}
```

## Performance Considerations

### Context Compilation

```typescript
// Efficient context compilation with limits
const messages = await contextPort.compile({
  sources: contextSources,
  limit: 50, // Limit total messages
  recentLimit: 10, // Limit recent messages
  queryLimit: 20, // Limit query results
});
```

### Actor Scheduling

```typescript
// Efficient actor loop management
const actorLoops = new Map<string, () => void>();

function startActorLoop(actor: Actor, intervalMs: number) {
  const stopLoop = scheduler.every(intervalMs, async () => {
    try {
      await orchestrator.tickActor(actor);
    } catch (error) {
      logger.error(`Actor ${actor.id} tick failed`, error);
    }
  });

  actorLoops.set(actor.id, stopLoop);
  return stopLoop;
}
```

## Testing

### Unit Testing

```typescript
import test from 'ava';
import { makeInMemoryContextAdapter } from '@promethean-os/pantheon-core';

test('context adapter compiles messages', async (t) => {
  const adapter = makeInMemoryContextAdapter();

  const messages = await adapter.compile({
    texts: ['Hello world'],
    sources: [],
    limit: 10,
  });

  t.is(messages.length, 1);
  t.is(messages[0].content, 'Hello world');
});
```

### Integration Testing

```typescript
test('actor execution flow', async (t) => {
  const orchestrator = makeOrchestrator({
    // Mock dependencies
    context: makeInMemoryContextAdapter(),
    tools: makeInMemoryToolAdapter(),
    llm: makeInMemoryLlmAdapter(),
    bus: makeInMemoryMessageBusAdapter(),
    schedule: makeInMemorySchedulerAdapter(),
    state: makeInMemoryActorStateAdapter(),
    now: () => Date.now(),
    log: () => {},
  });

  const actor = createTestActor();
  await orchestrator.tickActor(actor);

  // Assert results
  t.pass();
});
```

## Migration Guide

### From v0.0.x to v0.1.x

**Breaking Changes:**

1. Actor interface restructuring
2. Port method signatures updated
3. Configuration format changes

**Migration Steps:**

```typescript
// Before v0.1.x
const oldActor = {
  id: 'test',
  behaviors: [behavior],
  context: [contextSource],
  goals: ['goal'],
};

// After v0.1.x
const newActor = {
  id: 'test',
  script: {
    name: 'Test Actor',
    description: 'Test description',
    talents: [
      {
        name: 'test-talent',
        description: 'Test talent',
        behaviors: [behavior],
      },
    ],
    contextSources: [contextSource],
  },
  goals: ['goal'],
};
```

## Related Documentation

- [Type System Reference](Type%20System%20Reference.md): Complete type definitions
- [Actor Model Guide](Actor%20Model%20Guide.md): Actor model deep dive
- [Context Engine Guide](Context%20Engine%20Guide.md): Context compilation details
- [Ports System Guide](Ports%20System%20Guide.md): Adapter development
- [Architecture Overview](architecture-overview.md): System design principles

## File Locations

- **Core Types**: `/packages/pantheon-core/src/core/types.ts`
- **Port Interfaces**: `/packages/pantheon-core/src/core/ports.ts`
- **Orchestrator**: `/packages/pantheon-core/src/core/orchestrator.ts`
- **Adapters**: `/packages/pantheon-core/src/core/adapters.ts`
- **Type Guards**: `/packages/pantheon-core/src/core/guards.ts`
- **Error Classes**: `/packages/pantheon-core/src/core/errors.ts`

---

Pantheon Core provides the foundation for building sophisticated AI agents with clean architecture, type safety, and functional programming principles.
