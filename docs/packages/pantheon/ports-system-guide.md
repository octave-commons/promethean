# Ports System Guide

## Overview

The Ports System is the foundation of the Pantheon Framework's hexagonal architecture, providing clean dependency injection and adapter patterns that enable loose coupling between core business logic and external infrastructure. This design allows for easy testing, flexibility in implementation choices, and clear separation of concerns.

## Hexagonal Architecture Principles

### Core Concepts

The Ports System implements the hexagonal (or ports and adapters) architecture pattern:

- **Core Logic**: Business logic that doesn't depend on external systems
- **Ports**: Interfaces defining contracts for external dependencies
- **Adapters**: Implementations of ports for specific technologies
- **Dependency Injection**: External dependencies are injected through ports

### Benefits

1. **Testability**: Core logic can be tested with mock implementations
2. **Flexibility**: Easy to swap implementations without changing core logic
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: New technologies can be added by implementing new adapters

## Port Definitions

### ContextPort

Manages dynamic semantic retrieval and context compilation:

```typescript
export type ContextPort = {
  compile: (opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }) => Promise<Message[]>;
};
```

**Responsibilities:**

- Compile context from multiple sources
- Handle semantic retrieval and ranking
- Manage context limits and filtering
- Provide caching and optimization

**Implementation Considerations:**

- Support for vector databases
- Semantic search capabilities
- Caching strategies
- Performance optimization

### ToolPort

Provides tool registration and invocation capabilities:

```typescript
export type ToolPort = {
  register: (tool: ToolSpec) => void;
  invoke: (name: string, args: Record<string, unknown>) => Promise<unknown>;
};
```

**Responsibilities:**

- Tool registration and discovery
- Parameter validation
- Execution isolation
- Error handling and logging

**Implementation Considerations:**

- Security and permission validation
- Timeout handling
- Resource management
- Tool sandboxing

### LlmPort

Handles large language model interactions:

```typescript
export type LlmPort = {
  complete: (
    messages: Message[],
    opts?: { model?: string; temperature?: number },
  ) => Promise<Message>;
};
```

**Responsibilities:**

- Model communication
- Message formatting
- Parameter handling
- Response processing

**Implementation Considerations:**

- Multiple provider support
- Rate limiting
- Cost optimization
- Fallback strategies

### MessageBus

Manages inter-component communication:

```typescript
export type MessageBus = {
  send: (msg: { from: string; to: string; content: string }) => Promise<void>;
  subscribe: (handler: (msg: { from: string; to: string; content: string }) => void) => () => void;
};
```

**Responsibilities:**

- Message routing
- Subscription management
- Event distribution
- Error handling

**Implementation Considerations:**

- Message persistence
- Delivery guarantees
- Scalability
- Monitoring

### Scheduler

Provides task scheduling capabilities:

```typescript
export type Scheduler = {
  every: (ms: number, f: () => Promise<void>) => () => void;
  once: (ms: number, f: () => Promise<void>) => void;
};
```

**Responsibilities:**

- Periodic task execution
- One-time task scheduling
- Task lifecycle management
- Error handling

**Implementation Considerations:**

- Precision and reliability
- Resource management
- Task persistence
- Monitoring

### ActorStatePort

Manages actor state and lifecycle:

```typescript
export type ActorStatePort = {
  spawn: (script: ActorScript, goal: string) => Promise<Actor>;
  list: () => Promise<Actor[]>;
  get: (id: string) => Promise<Actor | null>;
  update: (id: string, updates: Partial<Actor>) => Promise<Actor>;
};
```

**Responsibilities:**

- Actor creation and management
- State persistence
- Actor discovery
- Lifecycle management

**Implementation Considerations:**

- Storage backend choice
- Concurrency control
- State validation
- Performance optimization

## Adapter Implementation Patterns

### 1. Basic Adapter Structure

```typescript
import type { ContextPort } from '@promethean/pantheon-core';

export class InMemoryContextAdapter implements ContextPort {
  private cache = new Map<string, Message[]>();

  async compile(opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }): Promise<Message[]> {
    // Implementation logic
    const cacheKey = this.generateCacheKey(opts);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const messages = await this.doCompile(opts);
    this.cache.set(cacheKey, messages);

    return messages;
  }

  private generateCacheKey(opts: any): string {
    return JSON.stringify(opts);
  }

  private async doCompile(opts: any): Promise<Message[]> {
    // Actual compilation logic
    return [];
  }
}
```

### 2. Error Handling Pattern

```typescript
export class RobustToolAdapter implements ToolPort {
  private tools = new Map<string, ToolSpec>();

  register(tool: ToolSpec): void {
    // Validate tool specification
    if (!tool.name || !tool.execute) {
      throw new Error('Invalid tool specification');
    }

    this.tools.set(tool.name, tool);
  }

  async invoke(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      // Validate arguments
      this.validateArgs(tool, args);

      // Execute with timeout
      return await this.executeWithTimeout(tool, args);
    } catch (error) {
      // Log and rethrow with context
      console.error(`Tool execution failed: ${name}`, { error, args });
      throw new Error(
        `Tool ${name} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private validateArgs(tool: ToolSpec, args: Record<string, unknown>): void {
    // Argument validation logic
  }

  private async executeWithTimeout(
    tool: ToolSpec,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    // Timeout implementation
  }
}
```

### 3. Caching Pattern

```typescript
export class CachedLlmAdapter implements LlmPort {
  private cache = new Map<string, Message>();
  private delegate: LlmPort;

  constructor(delegate: LlmPort) {
    this.delegate = delegate;
  }

  async complete(
    messages: Message[],
    opts?: { model?: string; temperature?: number },
  ): Promise<Message> {
    const cacheKey = this.generateCacheKey(messages, opts);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = await this.delegate.complete(messages, opts);
    this.cache.set(cacheKey, result);

    return result;
  }

  private generateCacheKey(messages: Message[], opts?: any): string {
    return JSON.stringify({ messages, opts });
  }
}
```

### 4. Monitoring Pattern

```typescript
export class MonitoredMessageBus implements MessageBus {
  private delegate: MessageBus;
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
  };

  constructor(delegate: MessageBus) {
    this.delegate = delegate;
  }

  async send(msg: { from: string; to: string; content: string }): Promise<void> {
    try {
      await this.delegate.send(msg);
      this.metrics.messagesSent++;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  subscribe(handler: (msg: { from: string; to: string; content: string }) => void): () => void {
    const wrappedHandler = (msg: { from: string; to: string; content: string }) => {
      try {
        this.metrics.messagesReceived++;
        handler(msg);
      } catch (error) {
        this.metrics.errors++;
        console.error('Message handler error', { error, msg });
      }
    };

    return this.delegate.subscribe(wrappedHandler);
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

## Dependency Injection

### 1. Factory Pattern

```typescript
export class PantheonFactory {
  static createOrchestrator(config: {
    contextAdapter: ContextPort;
    toolAdapter: ToolPort;
    llmAdapter: LlmPort;
    messageBus: MessageBus;
    scheduler: Scheduler;
    actorStateAdapter: ActorStatePort;
  }) {
    return makeOrchestrator({
      now: () => Date.now(),
      log: console.log,
      context: config.contextAdapter,
      tools: config.toolAdapter,
      llm: config.llmAdapter,
      bus: config.messageBus,
      schedule: config.scheduler,
      state: config.actorStateAdapter,
    });
  }
}
```

### 2. Configuration Pattern

```typescript
export interface PantheonConfig {
  context: {
    type: 'in-memory' | 'vector-db' | 'hybrid';
    options?: any;
  };
  tools: {
    type: 'local' | 'remote' | 'sandboxed';
    options?: any;
  };
  llm: {
    type: 'openai' | 'claude' | 'opencode';
    model: string;
    apiKey?: string;
  };
  messageBus: {
    type: 'in-memory' | 'redis' | 'rabbitmq';
    options?: any;
  };
  scheduler: {
    type: 'set-timeout' | 'node-cron' | 'bull';
    options?: any;
  };
  actorState: {
    type: 'in-memory' | 'mongodb' | 'postgres';
    options?: any;
  };
}

export class ConfigurablePantheon {
  static create(config: PantheonConfig) {
    const adapters = this.createAdapters(config);
    return PantheonFactory.createOrchestrator(adapters);
  }

  private static createAdapters(config: PantheonConfig) {
    return {
      contextAdapter: this.createContextAdapter(config.context),
      toolAdapter: this.createToolAdapter(config.tools),
      llmAdapter: this.createLlmAdapter(config.llm),
      messageBus: this.createMessageBus(config.messageBus),
      scheduler: this.createScheduler(config.scheduler),
      actorStateAdapter: this.createActorStateAdapter(config.actorState),
    };
  }

  private static createContextAdapter(config: PantheonConfig['context']) {
    switch (config.type) {
      case 'in-memory':
        return new InMemoryContextAdapter();
      case 'vector-db':
        return new VectorDbContextAdapter(config.options);
      case 'hybrid':
        return new HybridContextAdapter(config.options);
      default:
        throw new Error(`Unknown context adapter type: ${config.type}`);
    }
  }

  // Similar methods for other adapters...
}
```

## Testing Strategies

### 1. Mock Adapters

```typescript
export class MockContextAdapter implements ContextPort {
  private responses: Message[][] = [];
  private calls: any[] = [];

  setResponse(response: Message[]) {
    this.responses.push(response);
  }

  async compile(opts: any): Promise<Message[]> {
    this.calls.push(opts);
    return this.responses.shift() || [];
  }

  getCalls() {
    return this.calls;
  }

  reset() {
    this.responses = [];
    this.calls = [];
  }
}

// Usage in tests
const mockContext = new MockContextAdapter();
mockContext.setResponse([{ role: 'system', content: 'Test context' }]);

const orchestrator = makeOrchestrator({
  // ... other dependencies
  context: mockContext,
});

await orchestrator.tickActor(actor);
expect(mockContext.getCalls()).toHaveLength(1);
```

### 2. Spy Adapters

```typescript
export class SpyToolAdapter implements ToolPort {
  private delegate: ToolPort;
  private calls: Array<{ name: string; args: Record<string, unknown> }> = [];

  constructor(delegate: ToolPort) {
    this.delegate = delegate;
  }

  register(tool: ToolSpec): void {
    this.delegate.register(tool);
  }

  async invoke(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    return this.delegate.invoke(name, args);
  }

  getCalls() {
    return this.calls;
  }

  reset() {
    this.calls = [];
  }
}
```

### 3. Integration Testing

```typescript
describe('Pantheon Integration', () => {
  let orchestrator: ReturnType<typeof makeOrchestrator>;
  let adapters: TestAdapters;

  beforeEach(() => {
    adapters = createTestAdapters();
    orchestrator = makeOrchestrator(adapters);
  });

  it('should handle complete actor lifecycle', async () => {
    const actor = createTestActor();

    // Start actor loop
    const stopLoop = orchestrator.startActorLoop(actor, 100);

    // Wait for some execution
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Stop loop
    stopLoop();

    // Verify expectations
    expect(adapters.messageBus.getMetrics().messagesSent).toBeGreaterThan(0);
    expect(adapters.llm.getCalls()).toHaveLength(1);
  });
});
```

## Performance Optimization

### 1. Connection Pooling

```typescript
export class PooledLlmAdapter implements LlmPort {
  private pool: LlmPort[];
  private currentIndex = 0;

  constructor(poolSize: number, factory: () => LlmPort) {
    this.pool = Array.from({ length: poolSize }, factory);
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    const adapter = this.pool[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.pool.length;
    return adapter.complete(messages, opts);
  }
}
```

### 2. Batching

```typescript
export class BatchingMessageBus implements MessageBus {
  private delegate: MessageBus;
  private batch: Array<{ from: string; to: string; content: string }> = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(delegate: MessageBus, batchSize: number = 10, batchTimeout: number = 100) {
    this.delegate = delegate;
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
  }

  async send(msg: { from: string; to: string; content: string }): Promise<void> {
    this.batch.push(msg);

    if (this.batch.length >= this.batchSize) {
      await this.flushBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.batchTimeout);
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const messages = [...this.batch];
    this.batch = [];

    await Promise.all(messages.map((msg) => this.delegate.send(msg)));
  }
}
```

### 3. Circuit Breaker

```typescript
export class CircuitBreakerLlmAdapter implements LlmPort {
  private delegate: LlmPort;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000;

  constructor(delegate: LlmPort) {
    this.delegate = delegate;
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await this.delegate.complete(messages, opts);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

## Security Considerations

### 1. Input Validation

```typescript
export class SecureToolAdapter implements ToolPort {
  private delegate: ToolPort;
  private allowedTools: Set<string>;

  constructor(delegate: ToolPort, allowedTools: string[]) {
    this.delegate = delegate;
    this.allowedTools = new Set(allowedTools);
  }

  register(tool: ToolSpec): void {
    if (!this.allowedTools.has(tool.name)) {
      throw new Error(`Tool not allowed: ${tool.name}`);
    }
    this.delegate.register(tool);
  }

  async invoke(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.allowedTools.has(name)) {
      throw new Error(`Tool not allowed: ${name}`);
    }

    // Sanitize arguments
    const sanitizedArgs = this.sanitizeArgs(args);

    return this.delegate.invoke(name, sanitizedArgs);
  }

  private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
    // Implement argument sanitization
    return args;
  }
}
```

### 2. Rate Limiting

```typescript
export class RateLimitedLlmAdapter implements LlmPort {
  private delegate: LlmPort;
  private requests: number[] = [];
  private readonly limit: number;
  private readonly window: number;

  constructor(delegate: LlmPort, limit: number, window: number) {
    this.delegate = delegate;
    this.limit = limit;
    this.window = window;
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    this.cleanupOldRequests();

    if (this.requests.length >= this.limit) {
      throw new Error('Rate limit exceeded');
    }

    this.requests.push(Date.now());
    return this.delegate.complete(messages, opts);
  }

  private cleanupOldRequests(): void {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.window);
  }
}
```

## Best Practices

### 1. Adapter Design

- Keep adapters focused on single responsibilities
- Implement proper error handling and logging
- Use composition over inheritance
- Provide clear documentation for each adapter

### 2. Configuration Management

- Use environment variables for sensitive configuration
- Provide sensible defaults
- Validate configuration at startup
- Support runtime configuration updates

### 3. Monitoring and Observability

- Implement comprehensive logging
- Add metrics for performance monitoring
- Support health checks
- Provide debugging capabilities

### 4. Testing Strategy

- Test adapters in isolation
- Test integration between adapters
- Use mock adapters for unit testing
- Implement end-to-end testing

### 5. Performance Optimization

- Implement appropriate caching strategies
- Use connection pooling for external services
- Optimize for common use cases
- Monitor and profile performance

## Related Documentation

- [[Type System Reference]]: For type definitions used by ports
- [[Orchestrator Guide]]: For orchestrator usage and dependency injection
- [[architecture-overview.md|Architecture Overview]]: For hexagonal architecture principles
- [[Developer Guide]]: For implementation guidelines and best practices

## File Locations

- **Port Definitions**: `/packages/pantheon-core/src/core/ports.ts`
- **Adapter Examples**: `/packages/pantheon-adapters/src/`
- **Test Utilities**: `/packages/pantheon-core/src/test/`
- **Configuration**: `/packages/pantheon/src/config/`
