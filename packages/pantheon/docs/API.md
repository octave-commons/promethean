# Pantheon Agent Management Framework - API Documentation

This document provides comprehensive API reference documentation for the Pantheon Agent Management Framework.

## Table of Contents

- [Core Types](#core-types)
- [Ports and Interfaces](#ports-and-interfaces)
- [Context Management](#context-management)
- [Actor Management](#actor-management)
- [LLM Integration](#llm-integration)
- [MCP Tool Integration](#mcp-tool-integration)
- [Error Handling](#error-handling)
- [Type Reference](#type-reference)

## Core Types

### Actor

```typescript
interface Actor {
  id: string;
  config: ActorConfig;
  state: unknown;
  lastTick: number;
}
```

**Description**: Represents an agent in the system with its configuration, state, and lifecycle information.

**Properties**:

- `id`: Unique identifier for the actor
- `config`: Configuration object defining the actor's behavior
- `state`: Current state of the actor (can be any type)
- `lastTick`: Timestamp of the last execution tick

### ActorConfig

```typescript
interface ActorConfig {
  name: string;
  type: 'llm' | 'tool' | 'composite';
  parameters: Record<string, unknown>;
}
```

**Description**: Configuration object for creating actors.

**Properties**:

- `name`: Human-readable name for the actor
- `type`: Type of actor (`llm`, `tool`, or `composite`)
- `parameters`: Additional configuration parameters

### Context

```typescript
interface Context {
  id: string;
  sources: string[];
  text: string;
  compiled: unknown;
  timestamp: number;
}
```

**Description**: Represents compiled context information for agents.

**Properties**:

- `id`: Unique identifier for the context
- `sources`: Array of source identifiers used to compile this context
- `text`: Raw text content of the context
- `compiled`: Compiled/processed context data
- `timestamp`: Creation timestamp

### Message

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**Description**: Represents a message in a conversation.

**Properties**:

- `role`: Role of the message sender (`system`, `user`, or `assistant`)
- `content`: Text content of the message

## Ports and Interfaces

### ToolPort

```typescript
interface ToolPort {
  execute(command: string, args?: Record<string, unknown>): Promise<unknown>;
  list?(): Promise<string[]>;
  register?(tool: MCPTool): void;
  getSchema?(toolName: string): Promise<any>;
}
```

**Description**: Interface for executing tools and commands.

**Methods**:

- `execute(command, args?)`: Execute a tool with given arguments
- `list()?`: List available tools (optional)
- `register?(tool)`: Register a new tool (optional)
- `getSchema?(toolName)`: Get schema for a specific tool (optional)

### ContextPort

```typescript
interface ContextPort {
  compile(sources: string[], text: string): Promise<Context>;
  get(id: string): Promise<Context | null>;
  save(context: Context): Promise<void>;
}
```

**Description**: Interface for managing context compilation and storage.

**Methods**:

- `compile(sources, text)`: Compile context from sources and text
- `get(id)`: Retrieve a context by ID
- `save(context)`: Save a context to storage

### ActorPort

```typescript
interface ActorPort {
  tick(actorId: string): Promise<void>;
  create(config: ActorConfig): Promise<string>;
  get(id: string): Promise<Actor | null>;
}
```

**Description**: Interface for managing actor lifecycle.

**Methods**:

- `tick(actorId)`: Execute one tick of an actor's lifecycle
- `create(config)`: Create a new actor and return its ID
- `get(id)`: Retrieve an actor by ID

### LlmPort

```typescript
interface LlmPort {
  complete(messages: Message[], opts?: { model?: string; temperature?: number }): Promise<Message>;
}
```

**Description**: Interface for LLM completion functionality.

**Methods**:

- `complete(messages, opts?)`: Generate completion for given messages

**Options**:

- `model`: Model to use for completion (optional)
- `temperature`: Temperature parameter for completion (optional)

## Context Management

### makeContextAdapter

```typescript
function makeContextAdapter(): ContextPort;
```

**Description**: Creates a context adapter with in-memory storage.

**Returns**: A `ContextPort` implementation

**Example**:

```typescript
import { makeContextAdapter } from '@promethean-os/pantheon-fp';

const contextAdapter = makeContextAdapter();

// Compile context
const context = await contextAdapter.compile(
  ['sessions', 'agent-tasks'],
  'Hello world, I am an AI agent',
);

console.log('Context ID:', context.id);

// Retrieve context
const retrieved = await contextAdapter.get(context.id);
console.log('Retrieved context:', retrieved);

// Save context
await contextAdapter.save(context);
```

### Context Compilation

```typescript
const context = await contextAdapter.compile(
  ['sessions', 'agent-tasks', 'user-preferences'],
  `User wants to create a new AI assistant with the following requirements:
   - Natural language processing
   - Memory management
   - Task automation
   - User preference learning`,
);
```

**Parameters**:

- `sources`: Array of source identifiers
- `text`: Text content to compile into context

**Returns**: Promise resolving to a `Context` object

## Actor Management

### makeActorAdapter

```typescript
function makeActorAdapter(): ActorPort;
```

**Description**: Creates a basic actor adapter with in-memory storage.

**Returns**: An `ActorPort` implementation

**Example**:

```typescript
import { makeActorAdapter, type ActorConfig } from '@promethean-os/pantheon-fp';

const actorAdapter = makeActorAdapter();

// Create an actor
const config: ActorConfig = {
  name: 'test-actor',
  type: 'tool',
  parameters: { timeout: 5000 },
};

const actorId = await actorAdapter.create(config);
console.log('Created actor:', actorId);

// Tick the actor
await actorAdapter.tick(actorId);

// Get actor info
const actor = await actorAdapter.get(actorId);
console.log('Actor info:', actor);
```

### makeLLMActorAdapter

```typescript
function makeLLMActorAdapter(): ActorPort & {
  addMessage(actorId: string, message: Message): Promise<void>;
  getMessages(actorId: string): Promise<Message[]>;
};
```

**Description**: Creates an LLM-powered actor adapter with conversation management.

**Returns**: Extended `ActorPort` with additional message management methods

**Example**:

```typescript
import {
  makeLLMActorAdapter,
  makeOpenAIAdapter,
  type LLMActorConfig,
} from '@promethean-os/pantheon-fp';

const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultModel: 'gpt-3.5-turbo',
});

const llmActorAdapter = makeLLMActorAdapter();

const config: LLMActorConfig = {
  name: 'assistant',
  type: 'llm',
  parameters: { model: 'gpt-3.5-turbo' },
  llm: llmAdapter,
  systemPrompt: 'You are a helpful AI assistant.',
  maxMessages: 20,
};

const actorId = await llmActorAdapter.create(config);

// Add a message
await llmActorAdapter.addMessage(actorId, {
  role: 'user',
  content: 'Hello, how are you?',
});

// Tick the actor to process messages
await llmActorAdapter.tick(actorId);

// Get conversation history
const messages = await llmActorAdapter.getMessages(actorId);
console.log('Conversation:', messages);
```

### LLMActorConfig

```typescript
interface LLMActorConfig extends ActorConfig {
  llm: LlmPort;
  systemPrompt?: string;
  maxMessages?: number;
}
```

**Description**: Extended configuration for LLM-powered actors.

**Properties**:

- `llm`: LLM adapter instance
- `systemPrompt`: System prompt for the LLM (optional)
- `maxMessages`: Maximum number of messages to keep in history (optional, default: 20)

## LLM Integration

### makeOpenAIAdapter

```typescript
function makeOpenAIAdapter(config: OpenAIAdapterConfig): LlmPort;
```

**Description**: Creates an OpenAI LLM adapter.

**Parameters**:

- `config`: Configuration object for the OpenAI adapter

**Returns**: An `LlmPort` implementation

### OpenAIAdapterConfig

```typescript
interface OpenAIAdapterConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  defaultTemperature?: number;
}
```

**Description**: Configuration for the OpenAI adapter.

**Properties**:

- `apiKey`: OpenAI API key (required)
- `baseURL`: Custom base URL for OpenAI API (optional, default: 'https://api.openai.com/v1')
- `defaultModel`: Default model to use (optional, default: 'gpt-3.5-turbo')
- `defaultTemperature`: Default temperature (optional, default: 0.7)

**Example**:

```typescript
import { makeOpenAIAdapter } from '@promethean-os/pantheon-fp';

const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultModel: 'gpt-4',
  defaultTemperature: 0.7,
});

// Generate completion
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
];

const response = await llmAdapter.complete(messages, {
  model: 'gpt-4',
  temperature: 0.5,
});

console.log('Response:', response.content);
```

## MCP Tool Integration

### makeMCPToolAdapter

```typescript
function makeMCPToolAdapter(): ToolPort;
```

**Description**: Creates an MCP tool adapter with tool registration capabilities.

**Returns**: A `ToolPort` implementation

**Example**:

```typescript
import { makeMCPToolAdapter, type MCPTool } from '@promethean-os/pantheon-mcp';

const mcpAdapter = makeMCPToolAdapter();

// Register a custom tool
const customTool: MCPTool = {
  name: 'calculate',
  description: 'Perform mathematical calculations',
  inputSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate',
      },
    },
    required: ['expression'],
  },
  handler: async (args) => {
    const { expression } = args;
    // WARNING: eval is dangerous, use a proper math parser in production
    const result = eval(expression);
    return { result, expression };
  },
};

mcpAdapter.register?.(customTool);

// Execute the tool
const result = await mcpAdapter.execute('calculate', {
  expression: '2 + 2',
});

console.log('Calculation result:', result);
```

### makeMCPAdapterWithDefaults

```typescript
function makeMCPAdapterWithDefaults(): ToolPort;
```

**Description**: Creates an MCP tool adapter with pre-registered default tools.

**Default Tools**:

- `create_actor`: Create a new actor
- `tick_actor`: Execute a tick on an actor
- `compile_context`: Compile context from sources

**Returns**: A `ToolPort` implementation with default tools

**Example**:

```typescript
import { makeMCPAdapterWithDefaults } from '@promethean-os/pantheon-mcp';

const mcpAdapter = makeMCPAdapterWithDefaults();

// List available tools
const tools = await mcpAdapter.list();
console.log('Available tools:', tools);

// Execute default tool
const result = await mcpAdapter.execute('compile_context', {
  sources: ['sessions', 'agent-tasks'],
  text: 'Sample context text',
});

console.log('Tool execution result:', result);
```

### MCPTool

```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}
```

**Description**: Interface for defining MCP tools.

**Properties**:

- `name`: Unique name for the tool
- `description`: Human-readable description
- `inputSchema`: JSON Schema for input validation
- `handler`: Async function that handles tool execution

### MCPToolResult

```typescript
interface MCPToolResult {
  success: boolean;
  result?: any;
  error?: string;
}
```

**Description**: Standard result format for MCP tool execution.

**Properties**:

- `success`: Whether the tool executed successfully
- `result`: Tool execution result (if successful)
- `error`: Error message (if failed)

## Error Handling

### Standard Errors

The framework uses standard JavaScript Error objects with additional context:

```typescript
try {
  const context = await contextAdapter.compile(sources, text);
} catch (error) {
  console.error('Context compilation failed:', error.message);
  // Handle error appropriately
}
```

### Common Error Scenarios

**Actor Not Found**:

```typescript
try {
  await actorAdapter.tick('non-existent-actor');
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Actor does not exist');
    // Create actor or handle missing actor
  }
}
```

**LLM API Errors**:

```typescript
try {
  const response = await llmAdapter.complete(messages);
} catch (error) {
  if (error.message.includes('OpenAI API error')) {
    console.error('LLM API error:', error.message);
    // Handle API errors (rate limits, invalid keys, etc.)
  }
}
```

**Tool Execution Errors**:

```typescript
try {
  const result = await mcpAdapter.execute('tool-name', args);
} catch (error) {
  console.error('Tool execution failed:', error.message);
  // Handle tool execution errors
}
```

### Custom Error Types

You can extend the error handling with custom error types:

```typescript
class PantheonError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PantheonError';
  }
}

class ContextError extends PantheonError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONTEXT_ERROR', details);
    this.name = 'ContextError';
  }
}

class ActorError extends PantheonError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ACTOR_ERROR', details);
    this.name = 'ActorError';
  }
}
```

## Type Reference

### Complete Type Definitions

```typescript
// Core Types
export interface Actor {
  id: string;
  config: ActorConfig;
  state: unknown;
  lastTick: number;
}

export interface ActorConfig {
  name: string;
  type: 'llm' | 'tool' | 'composite';
  parameters: Record<string, unknown>;
}

export interface Context {
  id: string;
  sources: string[];
  text: string;
  compiled: unknown;
  timestamp: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Port Interfaces
export interface ToolPort {
  execute(command: string, args?: Record<string, unknown>): Promise<unknown>;
  list?(): Promise<string[]>;
  register?(tool: MCPTool): void;
  getSchema?(toolName: string): Promise<any>;
}

export interface ContextPort {
  compile(sources: string[], text: string): Promise<Context>;
  get(id: string): Promise<Context | null>;
  save(context: Context): Promise<void>;
}

export interface ActorPort {
  tick(actorId: string): Promise<void>;
  create(config: ActorConfig): Promise<string>;
  get(id: string): Promise<Actor | null>;
}

export interface LlmPort {
  complete(messages: Message[], opts?: { model?: string; temperature?: number }): Promise<Message>;
}

// LLM Types
export interface OpenAIAdapterConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  defaultTemperature?: number;
}

export interface LLMActorConfig extends ActorConfig {
  llm: LlmPort;
  systemPrompt?: string;
  maxMessages?: number;
}

// MCP Types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

export interface MCPToolResult {
  success: boolean;
  result?: any;
  error?: string;
}
```

### Type Guards

```typescript
function isActor(obj: unknown): obj is Actor {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof obj.id === 'string' &&
    'config' in obj &&
    'state' in obj &&
    'lastTick' in obj &&
    typeof obj.lastTick === 'number'
  );
}

function isContext(obj: unknown): obj is Context {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof obj.id === 'string' &&
    'sources' in obj &&
    Array.isArray(obj.sources) &&
    'text' in obj &&
    typeof obj.text === 'string' &&
    'compiled' in obj &&
    'timestamp' in obj &&
    typeof obj.timestamp === 'number'
  );
}

function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'role' in obj &&
    ['system', 'user', 'assistant'].includes(obj.role) &&
    'content' in obj &&
    typeof obj.content === 'string'
  );
}
```

### Utility Types

```typescript
// Extract actor type from config
type ActorType<T extends ActorConfig> = T['type'];

// Extract message role
type MessageRole<T extends Message> = T['role'];

// Context with typed compiled data
type TypedContext<T> = Context & {
  compiled: T;
};

// Actor with typed state
type TypedActor<TState> = Actor & {
  state: TState;
};

// Tool handler with typed arguments
type TypedToolHandler<TArgs> = (args: TArgs) => Promise<any>;

// MCP tool with typed arguments
type TypedMCPTool<TArgs> = MCPTool & {
  handler: TypedToolHandler<TArgs>;
};
```

## Best Practices

### Type Safety

```typescript
// Use type assertions carefully
const actor = (await actorAdapter.get(actorId)) as Actor | null;

// Use type guards for runtime validation
if (isActor(actor)) {
  // Safe to use actor properties
  console.log(actor.config.name);
}

// Use generic types for reusable components
class Repository<T> {
  private items = new Map<string, T>();

  async save(id: string, item: T): Promise<void> {
    this.items.set(id, item);
  }

  async get(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }
}
```

### Async Patterns

```typescript
// Use Promise.all for concurrent operations
const [actor1, actor2] = await Promise.all([
  actorAdapter.get('actor-1'),
  actorAdapter.get('actor-2'),
]);

// Use Promise.allSettled for error handling
const results = await Promise.allSettled([
  actorAdapter.tick('actor-1'),
  actorAdapter.tick('actor-2'),
  contextAdapter.compile(['source1'], 'text1'),
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`Operation ${index} succeeded:`, result.value);
  } else {
    console.error(`Operation ${index} failed:`, result.reason);
  }
});
```

### Error Boundaries

```typescript
class ErrorHandler {
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    fallback: T,
    errorHandler?: (error: Error) => void,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      }
      return fallback;
    }
  }
}

// Usage
const context = await ErrorHandler.withErrorHandling(
  () => contextAdapter.compile(sources, text),
  null,
  (error) => console.error('Context compilation failed:', error),
);
```

This comprehensive API documentation provides all the information needed to effectively use the Pantheon Agent Management Framework. The documentation includes type definitions, method signatures, examples, and best practices for building robust agent-based applications.
