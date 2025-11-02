# API Reference

## Overview

This document provides a comprehensive reference for all public APIs in the Pantheon Framework. It includes detailed descriptions of all interfaces, types, functions, and classes available to developers.

## Core Types

### Actor

Represents an autonomous agent with goals, behaviors, and context.

```typescript
interface Actor {
  /** Unique identifier for the actor */
  id: string;

  /** Script defining the actor's capabilities */
  script: ActorScript;

  /** Current goals the actor is working towards */
  goals: string[];

  /** Optional metadata about the actor */
  metadata?: Record<string, unknown>;
}
```

**Example:**

```typescript
const actor: Actor = {
  id: 'customer-service-001',
  script: customerServiceScript,
  goals: ['Provide excellent customer service', 'Resolve customer issues efficiently'],
  metadata: {
    department: 'support',
    level: 'senior',
  },
};
```

### ActorScript

Defines the capabilities and context sources for an actor.

```typescript
interface ActorScript {
  /** Human-readable name for the actor */
  name: string;

  /** Description of the actor's purpose */
  description: string;

  /** Array of talents the actor possesses */
  talents: Talent[];

  /** Sources of context for the actor */
  contextSources: ContextSource[];
}
```

**Example:**

```typescript
const script: ActorScript = {
  name: 'Customer Service Agent',
  description: 'Handles customer inquiries and support requests',
  talents: [customerServiceTalent, escalationTalent],
  contextSources: [
    {
      type: 'text',
      content: 'Company policies and procedures...',
      metadata: { category: 'policies' },
    },
  ],
};
```

### Talent

Represents a collection of related behaviors that an actor can perform.

```typescript
interface Talent {
  /** Name of the talent */
  name: string;

  /** Description of what the talent does */
  description: string;

  /** Array of behaviors in this talent */
  behaviors: Behavior[];
}
```

**Example:**

```typescript
const talent: Talent = {
  name: 'customer-service',
  description: 'Handles customer interactions and support',
  behaviors: [greetBehavior, resolveBehavior, escalateBehavior],
};
```

### Behavior

Defines how an actor responds to specific situations.

```typescript
interface Behavior {
  /** Name of the behavior */
  name: string;

  /** Description of the behavior's purpose */
  description: string;

  /** When this behavior should be active */
  mode: 'active' | 'passive' | 'persistent';

  /** Function that generates action plans */
  plan: (params: { goal: string; context: Message[] }) => Promise<{ actions: Action[] }>;
}
```

**Example:**

```typescript
const behavior: Behavior = {
  name: 'greet-customer',
  description: 'Greets customers and identifies their needs',
  mode: 'active',
  plan: async ({ goal, context }) => {
    const response = await llm.complete([
      { role: 'system', content: 'You are a customer service agent.' },
      ...context,
      { role: 'user', content: goal },
    ]);

    return {
      actions: [
        {
          type: 'message',
          content: response.content,
          target: 'user',
        },
      ],
    };
  },
};
```

### Action

Represents a specific action that an actor can perform.

```typescript
type Action =
  | { type: 'message'; content: string; target?: string }
  | { type: 'tool'; name: string; args: Record<string, unknown> }
  | { type: 'spawn'; actor: ActorScript; goal: string };
```

**Examples:**

```typescript
// Message action
const messageAction: Action = {
  type: 'message',
  content: 'Hello! How can I help you today?',
  target: 'user',
};

// Tool action
const toolAction: Action = {
  type: 'tool',
  name: 'get-weather',
  args: { location: 'New York', units: 'metric' },
};

// Spawn action
const spawnAction: Action = {
  type: 'spawn',
  actor: subAgentScript,
  goal: 'Analyze customer sentiment',
};
```

### Message

Represents a communication message in the system.

```typescript
interface Message {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant';

  /** Content of the message */
  content: string;

  /** Optional metadata */
  metadata?: Record<string, unknown>;
}
```

**Example:**

```typescript
const message: Message = {
  role: 'user',
  content: 'What is the weather like today?',
  metadata: {
    timestamp: Date.now(),
    userId: 'user-123',
  },
};
```

### ContextSource

Defines a source of context information for actors.

```typescript
type ContextSource =
  | { type: 'text'; content: string; metadata?: Record<string, unknown> }
  | { type: 'url'; url: string; metadata?: Record<string, unknown> }
  | { type: 'file'; path: string; metadata?: Record<string, unknown> };
```

**Examples:**

```typescript
// Text context source
const textSource: ContextSource = {
  type: 'text',
  content: 'Company policies and procedures...',
  metadata: { category: 'policies' },
};

// URL context source
const urlSource: ContextSource = {
  type: 'url',
  url: 'https://example.com/policies',
  metadata: { category: 'policies' },
};

// File context source
const fileSource: ContextSource = {
  type: 'file',
  path: '/path/to/policies.txt',
  metadata: { category: 'policies' },
};
```

### ToolSpec

Defines a tool that actors can use.

```typescript
interface ToolSpec {
  /** Name of the tool */
  name: string;

  /** Description of what the tool does */
  description: string;

  /** JSON Schema for tool parameters */
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };

  /** Function that executes the tool */
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}
```

**Example:**

```typescript
const weatherTool: ToolSpec = {
  name: 'get-weather',
  description: 'Gets current weather information for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The location to get weather for',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        default: 'metric',
        description: 'Temperature units',
      },
    },
    required: ['location'],
  },
  execute: async (args) => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${args.location}`,
    );
    const data = await response.json();
    return `Current weather: ${data.current.temp_c}°C, ${data.current.condition.text}`;
  },
};
```

## Core Functions

### makeOrchestrator

Creates the main orchestrator instance with provided dependencies.

```typescript
function makeOrchestrator(deps: OrchestratorDeps): {
  tickActor: (actor: Actor, input?: { userMessage?: string }) => Promise<void>;
  startActorLoop: (actor: Actor, intervalMs?: number) => () => void;
  executeAction: (action: Action, actor: Actor) => Promise<void>;
};
```

**Parameters:**

- `deps`: OrchestratorDeps - Required dependencies for the orchestrator

**Returns:**
An object with orchestrator methods

**Example:**

```typescript
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

// Use orchestrator
await orchestrator.tickActor(actor, { userMessage: 'Hello' });
```

### isActor

Type guard to check if an object is an Actor.

```typescript
function isActor(obj: unknown): obj is Actor;
```

**Parameters:**

- `obj`: unknown - Object to check

**Returns:**
`true` if the object is an Actor, `false` otherwise

**Example:**

```typescript
const obj = { id: 'test', script: {}, goals: [] };
if (isActor(obj)) {
  console.log('This is an actor');
}
```

### isAction

Type guard to check if an object is an Action.

```typescript
function isAction(obj: unknown): obj is Action;
```

**Parameters:**

- `obj`: unknown - Object to check

**Returns:**
`true` if the object is an Action, `false` otherwise

**Example:**

```typescript
const obj = { type: 'message', content: 'Hello' };
if (isAction(obj)) {
  console.log('This is an action');
}
```

### isMessage

Type guard to check if an object is a Message.

```typescript
function isMessage(obj: unknown): obj is Message;
```

**Parameters:**

- `obj`: unknown - Object to check

**Returns:**
`true` if the object is a Message, `false` otherwise

**Example:**

```typescript
const obj = { role: 'user', content: 'Hello' };
if (isMessage(obj)) {
  console.log('This is a message');
}
```

## Port Interfaces

### ContextPort

Interface for context compilation and management.

```typescript
interface ContextPort {
  compile: (opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }) => Promise<Message[]>;
}
```

**Methods:**

#### compile

Compiles context from various sources.

**Parameters:**

- `opts.texts`: `readonly string[]` - Optional text inputs to include
- `opts.sources`: `readonly ContextSource[]` - Context sources to compile
- `opts.recentLimit`: `number` - Limit to recent messages
- `opts.queryLimit`: `number` - Limit for query results
- `opts.limit`: `number` - Overall limit for compiled context

**Returns:**
`Promise<Message[]>` - Compiled context messages

**Example:**

```typescript
const context = await contextPort.compile({
  texts: ['What is the weather?'],
  sources: [textSource, urlSource],
  limit: 10,
});
```

### ToolPort

Interface for tool registration and invocation.

```typescript
interface ToolPort {
  register: (tool: ToolSpec) => void;
  invoke: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}
```

**Methods:**

#### register

Registers a tool for use by actors.

**Parameters:**

- `tool`: `ToolSpec` - Tool specification to register

**Returns:**
`void`

**Example:**

```typescript
toolPort.register(weatherTool);
```

#### invoke

Invokes a registered tool with provided arguments.

**Parameters:**

- `name`: `string` - Name of the tool to invoke
- `args`: `Record<string, unknown>` - Arguments for the tool

**Returns:**
`Promise<unknown>` - Result of tool execution

**Example:**

```typescript
const result = await toolPort.invoke('get-weather', {
  location: 'New York',
  units: 'metric',
});
```

### LlmPort

Interface for large language model interactions.

```typescript
interface LlmPort {
  complete: (
    messages: Message[],
    opts?: { model?: string; temperature?: number },
  ) => Promise<Message>;
}
```

**Methods:**

#### complete

Generates a completion using the language model.

**Parameters:**

- `messages`: `Message[]` - Array of messages for context
- `opts.model`: `string` - Optional model to use
- `opts.temperature`: `number` - Optional temperature setting

**Returns:**
`Promise<Message>` - Generated completion

**Example:**

```typescript
const response = await llmPort.complete(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ],
  {
    model: 'gpt-4',
    temperature: 0.7,
  },
);
```

### MessageBus

Interface for inter-component messaging.

```typescript
interface MessageBus {
  send: (msg: { from: string; to: string; content: string }) => Promise<void>;
  subscribe: (handler: (msg: { from: string; to: string; content: string }) => void) => () => void;
}
```

**Methods:**

#### send

Sends a message to a target.

**Parameters:**

- `msg.from`: `string` - Sender identifier
- `msg.to`: `string` - Target identifier
- `msg.content`: `string` - Message content

**Returns:**
`Promise<void>`

**Example:**

```typescript
await messageBus.send({
  from: 'actor-001',
  to: 'user',
  content: 'Hello! How can I help you?',
});
```

#### subscribe

Subscribes to messages for a specific target.

**Parameters:**

- `handler`: `(msg: { from: string; to: string; content: string }) => void` - Message handler function

**Returns:**
`() => void` - Unsubscribe function

**Example:**

```typescript
const unsubscribe = messageBus.subscribe((msg) => {
  if (msg.to === 'actor-001') {
    console.log(`Received message from ${msg.from}: ${msg.content}`);
  }
});

// Later, unsubscribe
unsubscribe();
```

### Scheduler

Interface for task scheduling.

```typescript
interface Scheduler {
  every: (ms: number, f: () => Promise<void>) => () => void;
  once: (ms: number, f: () => Promise<void>) => void;
}
```

**Methods:**

#### every

Schedules a function to run repeatedly at specified intervals.

**Parameters:**

- `ms`: `number` - Interval in milliseconds
- `f`: `() => Promise<void>` - Function to execute

**Returns:**
`() => void` - Stop function

**Example:**

```typescript
const stop = scheduler.every(5000, async () => {
  console.log('Running periodic task');
});

// Later, stop the periodic task
stop();
```

#### once

Schedules a function to run once after a delay.

**Parameters:**

- `ms`: `number` - Delay in milliseconds
- `f`: `() => Promise<void>` - Function to execute

**Returns:**
`void`

**Example:**

```typescript
scheduler.once(1000, async () => {
  console.log('Running delayed task');
});
```

### ActorStatePort

Interface for actor state management.

```typescript
interface ActorStatePort {
  spawn: (script: ActorScript, goal: string) => Promise<Actor>;
  list: () => Promise<Actor[]>;
  get: (id: string) => Promise<Actor | null>;
  update: (id: string, updates: Partial<Actor>) => Promise<Actor>;
}
```

**Methods:**

#### spawn

Creates a new actor from a script and goal.

**Parameters:**

- `script`: `ActorScript` - Actor script definition
- `goal`: `string` - Initial goal for the actor

**Returns:**
`Promise<Actor>` - Created actor

**Example:**

```typescript
const actor = await actorStatePort.spawn(customerServiceScript, 'Help customers');
```

#### list

Lists all actors in the system.

**Returns:**
`Promise<Actor[]>` - Array of all actors

**Example:**

```typescript
const actors = await actorStatePort.list();
console.log(`Total actors: ${actors.length}`);
```

#### get

Retrieves a specific actor by ID.

**Parameters:**

- `id`: `string` - Actor ID to retrieve

**Returns:**
`Promise<Actor | null>` - Actor if found, null otherwise

**Example:**

```typescript
const actor = await actorStatePort.get('actor-001');
if (actor) {
  console.log(`Found actor: ${actor.script.name}`);
}
```

#### update

Updates an actor's properties.

**Parameters:**

- `id`: `string` - Actor ID to update
- `updates`: `Partial<Actor>` - Properties to update

**Returns:**
`Promise<Actor>` - Updated actor

**Example:**

```typescript
const updatedActor = await actorStatePort.update('actor-001', {
  goals: [...actor.goals, 'New goal'],
});
```

## OrchestratorDeps

Interface for orchestrator dependencies.

```typescript
interface OrchestratorDeps {
  now: () => number;
  log: (msg: string, meta?: unknown) => void;
  context: ContextPort;
  tools: ToolPort;
  llm: LlmPort;
  bus: MessageBus;
  schedule: Scheduler;
  state: ActorStatePort;
}
```

**Properties:**

- `now`: `() => number` - Function that returns current timestamp
- `log`: `(msg: string, meta?: unknown) => void` - Logging function
- `context`: `ContextPort` - Context compilation adapter
- `tools`: `ToolPort` - Tool management adapter
- `llm`: `LlmPort` - Language model adapter
- `bus`: `MessageBus` - Message bus adapter
- `schedule`: `Scheduler` - Task scheduler adapter
- `state`: `ActorStatePort` - Actor state management adapter

## Error Types

### PantheonError

Base error class for Pantheon framework errors.

```typescript
class PantheonError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  );
}
```

**Properties:**

- `message`: `string` - Error message
- `code`: `string` - Error code
- `details`: `unknown` - Additional error details

### ActorError

Error thrown for actor-related issues.

```typescript
class ActorError extends PantheonError {
  constructor(
    message: string,
    public actorId: string,
    details?: unknown
  );
}
```

**Properties:**

- `actorId`: `string` - ID of the actor that caused the error

### BehaviorError

Error thrown for behavior-related issues.

```typescript
class BehaviorError extends PantheonError {
  constructor(
    message: string,
    public behaviorName: string,
    details?: unknown
  );
}
```

**Properties:**

- `behaviorName`: `string` - Name of the behavior that caused the error

### ToolError

Error thrown for tool-related issues.

```typescript
class ToolError extends PantheonError {
  constructor(
    message: string,
    public toolName: string,
    details?: unknown
  );
}
```

**Properties:**

- `toolName`: `string` - Name of the tool that caused the error

## Utility Functions

### createActorId

Generates a unique actor ID.

```typescript
function createActorId(prefix?: string): string;
```

**Parameters:**

- `prefix`: `string` - Optional prefix for the ID

**Returns:**
`string` - Unique actor ID

**Example:**

```typescript
const actorId = createActorId('customer-service');
// Returns: 'customer-service-1234567890'
```

### validateActor

Validates an actor object.

```typescript
function validateActor(actor: unknown): actor is Actor;
```

**Parameters:**

- `actor`: `unknown` - Object to validate

**Returns:**
`actor is Actor` - `true` if valid, `false` otherwise

**Example:**

```typescript
const obj = { id: 'test', script: {}, goals: [] };
if (validateActor(obj)) {
  console.log('Valid actor');
}
```

### sanitizeArgs

Sanitizes tool arguments.

```typescript
function sanitizeArgs(args: Record<string, unknown>): Record<string, unknown>;
```

**Parameters:**

- `args`: `Record<string, unknown>` - Arguments to sanitize

**Returns:**
`Record<string, unknown>` - Sanitized arguments

**Example:**

```typescript
const cleanArgs = sanitizeArgs({
  userInput: '<script>alert("xss")</script>',
  normal: 'value',
});
// Removes potentially dangerous content
```

## Configuration Types

### PantheonConfig

Main configuration interface for the Pantheon framework.

```typescript
interface PantheonConfig {
  environment: 'development' | 'production' | 'test';
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
  adapters: {
    context: {
      type: 'memory' | 'elasticsearch' | 'hybrid';
      options?: unknown;
    };
    llm: {
      type: 'openai' | 'claude' | 'opencode';
      model: string;
      apiKey?: string;
      timeout: number;
    };
    tools: {
      type: 'local' | 'remote' | 'sandboxed';
      options?: unknown;
    };
    messageBus: {
      type: 'in-memory' | 'redis' | 'rabbitmq';
      options?: unknown;
    };
    scheduler: {
      type: 'set-timeout' | 'node-cron' | 'bull';
      options?: unknown;
    };
    actorState: {
      type: 'in-memory' | 'mongodb' | 'postgres';
      options?: unknown;
    };
  };
  performance: {
    maxConcurrentActors: number;
    maxContextSize: number;
    cacheTtl: number;
  };
}
```

### AdapterConfig

Base configuration for adapters.

```typescript
interface AdapterConfig {
  type: string;
  options?: unknown;
}
```

### ContextAdapterConfig

Configuration for context adapters.

```typescript
interface ContextAdapterConfig extends AdapterConfig {
  type: 'memory' | 'elasticsearch' | 'hybrid';
  options?: {
    cacheSize?: number;
    ttl?: number;
    index?: string;
    url?: string;
  };
}
```

### LlmAdapterConfig

Configuration for LLM adapters.

```typescript
interface LlmAdapterConfig extends AdapterConfig {
  type: 'openai' | 'claude' | 'opencode';
  options?: {
    model: string;
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxTokens?: number;
    temperature?: number;
  };
}
```

## Event Types

### ActorEvent

Events related to actor lifecycle.

```typescript
type ActorEvent =
  | { type: 'actor-created'; actorId: string; timestamp: number }
  | { type: 'actor-started'; actorId: string; timestamp: number }
  | { type: 'actor-stopped'; actorId: string; timestamp: number }
  | { type: 'actor-updated'; actorId: string; updates: Partial<Actor>; timestamp: number };
```

### ActionEvent

Events related to action execution.

```typescript
type ActionEvent =
  | { type: 'action-started'; actionId: string; actorId: string; timestamp: number }
  | {
      type: 'action-completed';
      actionId: string;
      actorId: string;
      result: unknown;
      timestamp: number;
    }
  | { type: 'action-failed'; actionId: string; actorId: string; error: Error; timestamp: number };
```

### SystemEvent

System-level events.

```typescript
type SystemEvent =
  | { type: 'system-started'; timestamp: number }
  | { type: 'system-stopped'; timestamp: number }
  | { type: 'system-error'; error: Error; timestamp: number };
```

## Migration Guide

### Version 1.x to 2.x

#### Breaking Changes

1. **Actor Interface Changes**

   - `Actor.behaviors` moved to `Actor.script.talents[].behaviors`
   - `Actor.context` moved to `Actor.script.contextSources`

2. **Action Type Changes**

   - `Action.type` now uses string literals instead of enums
   - `Action.spawn` now requires `ActorScript` instead of `Actor`

3. **Port Interface Changes**
   - All port methods now return `Promise`
   - Added error handling requirements

#### Migration Steps

**Before (v1.x):**

```typescript
const actor: Actor = {
  id: 'test',
  behaviors: [behavior1, behavior2],
  context: [contextSource1],
  goals: ['goal1'],
};
```

**After (v2.x):**

```typescript
const actor: Actor = {
  id: 'test',
  script: {
    name: 'Test Actor',
    description: 'Test description',
    talents: [
      {
        name: 'test-talent',
        description: 'Test talent',
        behaviors: [behavior1, behavior2],
      },
    ],
    contextSources: [contextSource1],
  },
  goals: ['goal1'],
};
```

## Best Practices

### 1. Type Safety

```typescript
// Use type guards for runtime validation
function processActor(obj: unknown) {
  if (isActor(obj)) {
    // TypeScript knows obj is Actor here
    console.log(obj.script.name);
  }
}

// Use discriminated unions for action handling
function handleAction(action: Action) {
  switch (action.type) {
    case 'message':
      // TypeScript knows action has content and target
      console.log(action.content);
      break;
    case 'tool':
      // TypeScript knows action has name and args
      console.log(action.name);
      break;
  }
}
```

### 2. Error Handling

```typescript
// Use specific error types
try {
  await orchestrator.tickActor(actor);
} catch (error) {
  if (error instanceof ActorError) {
    console.error(`Actor ${error.actorId} failed: ${error.message}`);
  } else if (error instanceof BehaviorError) {
    console.error(`Behavior ${error.behaviorName} failed: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### 3. Async Patterns

```typescript
// Use Promise.all for concurrent operations
const actors = await Promise.all([
  actorStatePort.get('actor-1'),
  actorStatePort.get('actor-2'),
  actorStatePort.get('actor-3'),
]);

// Use Promise.allSettled for partial failures
const results = await Promise.allSettled([
  orchestrator.tickActor(actor1),
  orchestrator.tickActor(actor2),
  orchestrator.tickActor(actor3),
]);

results.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.error(`Actor ${index + 1} failed:`, result.reason);
  }
});
```

### 4. Memory Management

```typescript
// Clean up resources properly
class ActorManager {
  private actors = new Map<string, () => void>();

  async startActor(actor: Actor) {
    const stopLoop = orchestrator.startActorLoop(actor);
    this.actors.set(actor.id, stopLoop);
  }

  async stopActor(actorId: string) {
    const stopLoop = this.actors.get(actorId);
    if (stopLoop) {
      stopLoop();
      this.actors.delete(actorId);
    }
  }

  async stopAllActors() {
    for (const [actorId, stopLoop] of this.actors) {
      stopLoop();
    }
    this.actors.clear();
  }
}
```

## Related Documentation

- [Type System Reference](Type%20System%20Reference.md): For detailed type definitions and relationships
- [Developer Guide](Developer%20Guide.md): For implementation examples and best practices
- [Orchestrator Guide](Orchestrator%20Guide.md): For orchestrator usage and configuration
- [Ports System Guide](Ports%20System%20Guide.md): For adapter development and integration
- [Architecture Overview](architecture-overview.md): For system design principles

## File Locations

- **Core Types**: `/packages/pantheon-core/src/core/types.ts`
- **Port Interfaces**: `/packages/pantheon-core/src/core/ports.ts`
- **Orchestrator**: `/packages/pantheon-core/src/core/orchestrator.ts`
- **Type Guards**: `/packages/pantheon-core/src/core/guards.ts`
- **Error Classes**: `/packages/pantheon-core/src/core/errors.ts`
- **Configuration**: `/packages/pantheon/src/config/types.ts`
