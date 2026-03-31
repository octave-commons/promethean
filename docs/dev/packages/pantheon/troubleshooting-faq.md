# Troubleshooting & FAQ

This guide provides comprehensive troubleshooting information, performance optimization techniques, debugging strategies, and answers to frequently asked questions for the Pantheon Agent Management Framework.

## Table of Contents

- [Common Issues & Solutions](#common-issues--solutions)
- [Performance Optimization](#performance-optimization)
- [Debugging Strategies](#debugging-strategies)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Error Resolution Guide](#error-resolution-guide)
- [Best Practices Checklist](#best-practices-checklist)

---

## Common Issues & Solutions

### Actor Lifecycle Issues

#### Actor Not Starting

**Symptoms:**

- Actor remains in `initializing` state
- No messages processed by the actor
- Timeout errors during actor creation

**Common Causes:**

```typescript
// 1. Missing required dependencies
const actor = makeActor({
  // Missing required ports
  ports: {}, // Should include required ports
});

// 2. Invalid actor configuration
const actor = makeActor({
  name: '', // Empty name
  script: null as any, // Invalid script
});

// 3. Port initialization failure
const actor = makeActor({
  ports: {
    context: brokenContextPort, // Port not properly initialized
  },
});
```

**Solutions:**

```typescript
// 1. Ensure all required ports are provided
const actor = makeActor({
  name: 'my-actor',
  script: myActorScript,
  ports: {
    context: contextPort,
    tool: toolPort,
    llm: llmPort,
    messageBus: messageBus,
    scheduler: scheduler,
    actorState: actorStatePort,
  },
});

// 2. Validate configuration before creation
function validateActorConfig(config: ActorConfig): void {
  if (!config.name || config.name.trim() === '') {
    throw new Error('Actor name is required');
  }
  if (!config.script) {
    throw new Error('Actor script is required');
  }
  // Add more validation as needed
}

// 3. Initialize ports properly
const contextPort = makeContextPort({
  sources: [myContextSource],
  cache: makeMemoryCache(),
});
```

#### Actor Crashing on Message Processing

**Symptoms:**

- Actor processes one message then crashes
- Uncaught exceptions in message handlers
- Actor state becomes inconsistent

**Common Causes:**

```typescript
// 1. Unhandled exceptions in message handlers
const actorScript: ActorScript = {
  onMessage: async (message) => {
    // This might throw
    const data = JSON.parse(message.content as string);
    return { status: 'processed' };
  },
};

// 2. Invalid message format
const malformedMessage = {
  type: 'invalid',
  content: null, // Missing required fields
};

// 3. State corruption
const actorScript: ActorScript = {
  onMessage: async (message, context) => {
    // Direct state mutation without validation
    context.state.someProperty = 'new value';
  },
};
```

**Solutions:**

```typescript
// 1. Add proper error handling
const actorScript: ActorScript = {
  onMessage: async (message, context) => {
    try {
      const data = JSON.parse(message.content as string);
      // Process message
      return { status: 'processed' };
    } catch (error) {
      console.error('Message processing failed:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

// 2. Validate message format
function validateMessage(message: Message): void {
  if (!message.type || typeof message.type !== 'string') {
    throw new Error('Message type is required and must be a string');
  }
  if (message.content === undefined) {
    throw new Error('Message content is required');
  }
}

// 3. Use safe state updates
const actorScript: ActorScript = {
  onMessage: async (message, context) => {
    const newState = {
      ...context.state,
      someProperty: 'new value',
    };
    return { status: 'processed', state: newState };
  },
};
```

### Memory and Performance Issues

#### Memory Leaks

**Symptoms:**

- Memory usage increases over time
- Application becomes slower
- Eventually crashes due to out-of-memory

**Common Causes:**

```typescript
// 1. Unclosed event listeners
const actor = makeActor(config);
actor.on('message', handler); // Never removed

// 2. Circular references
const obj1: any = {};
const obj2: any = {};
obj1.ref = obj2;
obj2.ref = obj1;

// 3. Growing caches without limits
const cache = new Map();
// Adding items without eviction policy
cache.set(key, largeObject);
```

**Solutions:**

```typescript
// 1. Proper cleanup of event listeners
class ActorManager {
  private listeners: Array<() => void> = [];

  addListener(actor: Actor, event: string, handler: Function): void {
    actor.on(event, handler);
    this.listeners.push(() => {
      actor.off(event, handler);
    });
  }

  cleanup(): void {
    this.listeners.forEach((cleanup) => cleanup());
    this.listeners = [];
  }
}

// 2. Use WeakMap for circular references
const weakMap = new WeakMap();
weakMap.set(obj1, obj2); // Won't prevent garbage collection

// 3. Implement cache eviction
class BoundedCache {
  private cache = new Map();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

#### High CPU Usage

**Symptoms:**

- CPU usage consistently high
- Slow response times
- System becomes unresponsive

**Common Causes:**

```typescript
// 1. Busy loops without delays
while (true) {
  // Process messages without yielding
  processMessages();
}

// 2. Inefficient algorithms
function findActor(actors: Actor[], id: string): Actor {
  // O(n) search instead of O(1) lookup
  return actors.find((actor) => actor.id === id);
}

// 3. Synchronous blocking operations
const result = fs.readFileSync('large-file.txt'); // Blocks event loop
```

**Solutions:**

```typescript
// 1. Add proper delays and yielding
async function messageLoop(): Promise<void> {
  while (true) {
    await processMessages();
    await new Promise((resolve) => setTimeout(resolve, 0)); // Yield
  }
}

// 2. Use efficient data structures
class ActorRegistry {
  private actors = new Map<string, Actor>();

  add(actor: Actor): void {
    this.actors.set(actor.id, actor);
  }

  get(id: string): Actor | undefined {
    return this.actors.get(id); // O(1) lookup
  }
}

// 3. Use asynchronous operations
const result = await fs.promises.readFile('large-file.txt'); // Non-blocking
```

### Context Engine Issues

#### Context Not Updating

**Symptoms:**

- Actors receive stale context data
- Changes to context sources not reflected
- Inconsistent state across actors

**Common Causes:**

```typescript
// 1. Context source not emitting updates
const staticSource: ContextSource = {
  getContext: () => ({ data: "static" }),
  // Missing subscribe method
};

// 2. Context cache not invalidated
const cache = makeMemoryCache();
// Cache never expires or invalidates

// 3. Context merge strategy issues
const mergeStrategy = (old: any, new: any) => {
  return old; // Always returns old data
};
```

**Solutions:**

```typescript
// 1. Implement proper context source
const dynamicSource: ContextSource = {
  getContext: () => ({ data: getCurrentData() }),
  subscribe: (callback) => {
    const interval = setInterval(() => {
      callback({ data: getCurrentData() });
    }, 1000);
    return () => clearInterval(interval);
  }
};

// 2. Configure cache with proper TTL
const cache = makeMemoryCache({
  ttl: 5000, // 5 seconds
  maxSize: 1000
});

// 3. Implement proper merge strategy
const mergeStrategy = (old: any, new: any) => {
  return {
    ...old,
    ...new,
    timestamp: Date.now()
  };
};
```

#### Context Memory Issues

**Symptoms:**

- Memory usage grows with context history
- Slow context retrieval
- Context data corruption

**Solutions:**

```typescript
// 1. Implement context history limits
class ContextManager {
  private history: Array<{ timestamp: number; data: any }> = [];
  private maxHistorySize: number = 100;

  addContext(data: any): void {
    this.history.push({
      timestamp: Date.now(),
      data,
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
}

// 2. Use efficient context storage
class ContextStorage {
  private storage = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any {
    const entry = this.storage.get(key);
    if (!entry) return null;

    // Remove expired entries
    if (Date.now() - entry.timestamp > 30000) {
      // 30 seconds
      this.storage.delete(key);
      return null;
    }

    return entry.data;
  }
}
```

---

## Performance Optimization

### Actor Optimization

#### Batch Processing

```typescript
// Instead of processing messages one by one
const actorScript: ActorScript = {
  onMessage: async (message, context) => {
    // Single message processing
    return processSingleMessage(message);
  },
};

// Use batch processing for better performance
const actorScript: ActorScript = {
  onMessage: async (message, context) => {
    // Collect messages in a batch
    const batch = [message];
    const batchSize = 10;
    const batchTimeout = 100; // ms

    // Wait for more messages or timeout
    await new Promise((resolve) => setTimeout(resolve, batchTimeout));

    // Process batch
    return processBatch(batch);
  },
};

async function processBatch(messages: Message[]): Promise<ActionResult> {
  // Process all messages in parallel
  const results = await Promise.all(messages.map((msg) => processSingleMessage(msg)));

  return {
    status: 'processed',
    results,
  };
}
```

#### Connection Pooling

```typescript
// Instead of creating new connections for each operation
class DatabaseService {
  async query(sql: string): Promise<any> {
    const connection = await createConnection(); // Expensive
    const result = await connection.query(sql);
    await connection.close();
    return result;
  }
}

// Use connection pooling
class DatabaseService {
  private pool: ConnectionPool;

  constructor() {
    this.pool = createConnectionPool({
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
    });
  }

  async query(sql: string): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      return await connection.query(sql);
    } finally {
      connection.release();
    }
  }
}
```

### Context Optimization

#### Context Caching Strategies

```typescript
// Multi-level caching strategy
class ContextCache {
  private l1Cache: Map<string, any>; // In-memory cache
  private l2Cache: RedisCache; // Distributed cache
  private l3Cache: DatabaseCache; // Persistent cache

  async get(key: string): Promise<any> {
    // Check L1 cache first
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // Check L2 cache
    const l2Result = await this.l2Cache.get(key);
    if (l2Result) {
      this.l1Cache.set(key, l2Result);
      return l2Result;
    }

    // Check L3 cache
    const l3Result = await this.l3Cache.get(key);
    if (l3Result) {
      this.l1Cache.set(key, l3Result);
      await this.l2Cache.set(key, l3Result);
      return l3Result;
    }

    return null;
  }
}
```

#### Context Compression

```typescript
// Compress large context data
import { compress, decompress } from 'lz4';

class ContextCompressor {
  compress(data: any): Buffer {
    const json = JSON.stringify(data);
    return compress(json);
  }

  decompress(buffer: Buffer): any {
    const json = decompress(buffer);
    return JSON.parse(json.toString());
  }
}

// Usage in context storage
class ContextStorage {
  private compressor = new ContextCompressor();

  async store(key: string, data: any): Promise<void> {
    const compressed = this.compressor.compress(data);
    await this.storage.set(key, compressed);
  }

  async retrieve(key: string): Promise<any> {
    const compressed = await this.storage.get(key);
    if (!compressed) return null;
    return this.compressor.decompress(compressed);
  }
}
```

### Memory Management

#### Garbage Collection Optimization

```typescript
// Use WeakMap and WeakSet for temporary references
class ActorReferenceManager {
  private weakRefs = new WeakMap<Actor, WeakRef<Actor>>();

  addRef(actor: Actor): void {
    this.weakRefs.set(actor, new WeakRef(actor));
  }

  getRef(actor: Actor): Actor | undefined {
    const weakRef = this.weakRefs.get(actor);
    return weakRef?.deref();
  }

  cleanup(): void {
    // WeakRefs are automatically cleaned up by GC
    // No manual cleanup needed
  }
}

// Use object pooling for frequently created/destroyed objects
class ActorPool {
  private pool: Actor[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  acquire(): Actor {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return createNewActor();
  }

  release(actor: Actor): void {
    if (this.pool.length < this.maxSize) {
      // Reset actor state
      actor.reset();
      this.pool.push(actor);
    }
  }
}
```

### Network Optimization

#### Request Batching and Caching

```typescript
// Batch HTTP requests
class RequestBatcher {
  private batch: Array<{ request: any; resolve: Function; reject: Function }> = [];
  private batchTimeout: number = 100;
  private batchSize: number = 10;

  async request(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batch.push({ request: req, resolve, reject });

      if (this.batch.length >= this.batchSize) {
        this.flush();
      } else {
        setTimeout(() => this.flush(), this.batchTimeout);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const currentBatch = this.batch;
    this.batch = [];

    try {
      const responses = await this.executeBatch(currentBatch.map((item) => item.request));

      currentBatch.forEach((item, index) => {
        item.resolve(responses[index]);
      });
    } catch (error) {
      currentBatch.forEach((item) => {
        item.reject(error);
      });
    }
  }

  private async executeBatch(requests: any[]): Promise<any[]> {
    // Implement batch request logic
    return Promise.all(requests.map((req) => fetch(req.url, req.options)));
  }
}
```

---

## Debugging Strategies

### Logging and Monitoring

#### Structured Logging

```typescript
// Use structured logging for better analysis
class Logger {
  private context: Record<string, any>;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }

  withContext(additionalContext: Record<string, any>): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }

  info(message: string, data?: any): void {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        context: this.context,
        data,
      }),
    );
  }

  error(message: string, error?: Error, data?: any): void {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        context: this.context,
        error: error?.stack,
        data,
      }),
    );
  }
}

// Usage in actors
const actorScript: ActorScript = {
  onMessage: async (message, context) => {
    const logger = new Logger({
      actorId: context.actor.id,
      messageId: message.id,
    });

    try {
      logger.info('Processing message', { type: message.type });
      const result = await processMessage(message);
      logger.info('Message processed successfully');
      return result;
    } catch (error) {
      logger.error('Message processing failed', error as Error);
      throw error;
    }
  },
};
```

#### Performance Monitoring

```typescript
// Add performance monitoring to critical operations
class PerformanceMonitor {
  private metrics = new Map<string, Array<number>>();

  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      throw error;
    }
  }

  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getStats(operation: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  } {
    const metrics = this.metrics.get(operation) || [];

    if (metrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p95: 0 };
    }

    const sorted = [...metrics].sort((a, b) => a - b);
    const sum = metrics.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      average: sum / metrics.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }
}

// Usage in orchestrator
const orchestrator = makeOrchestrator({
  // ... other config
  hooks: {
    beforeAction: async (action, context) => {
      context.performanceMonitor = new PerformanceMonitor();
    },
    afterAction: async (result, context) => {
      const stats = context.performanceMonitor.getStats('action_execution');
      console.log('Action execution stats:', stats);
    },
  },
});
```

### Debugging Tools

#### Actor State Inspector

```typescript
// Tool to inspect actor state
class ActorInspector {
  constructor(private orchestrator: Orchestrator) {}

  async getActorState(actorId: string): Promise<any> {
    const actor = this.orchestrator.getActor(actorId);
    if (!actor) {
      throw new Error(`Actor ${actorId} not found`);
    }

    return {
      id: actor.id,
      name: actor.name,
      status: actor.status,
      state: actor.getState(),
      messageQueue: actor.getMessageQueue(),
      lastActivity: actor.getLastActivity(),
      errorCount: actor.getErrorCount(),
    };
  }

  async getSystemOverview(): Promise<any> {
    const actors = this.orchestrator.getAllActors();

    return {
      totalActors: actors.length,
      actorsByStatus: this.groupByStatus(actors),
      systemMetrics: this.getSystemMetrics(),
      recentErrors: this.getRecentErrors(),
    };
  }

  private groupByStatus(actors: Actor[]): Record<string, number> {
    return actors.reduce(
      (acc, actor) => {
        acc[actor.status] = (acc[actor.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private getSystemMetrics(): any {
    return {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
    };
  }

  private getRecentErrors(): Array<{ timestamp: number; error: string }> {
    // Return recent system errors
    return [];
  }
}

// Usage as a tool
const inspectorTool: Tool = {
  name: 'inspect_actor',
  description: 'Inspect actor state and system overview',
  inputSchema: {
    type: 'object',
    properties: {
      actorId: {
        type: 'string',
        description: 'ID of the actor to inspect (optional)',
      },
    },
  },
  handler: async (input, context) => {
    const inspector = new ActorInspector(context.orchestrator);

    if (input.actorId) {
      return await inspector.getActorState(input.actorId);
    } else {
      return await inspector.getSystemOverview();
    }
  },
};
```

#### Message Tracing

```typescript
// Trace message flow through the system
class MessageTracer {
  private traces = new Map<string, MessageTrace>();

  startTrace(messageId: string): void {
    this.traces.set(messageId, {
      messageId,
      startTime: Date.now(),
      steps: [],
    });
  }

  addStep(messageId: string, step: TraceStep): void {
    const trace = this.traces.get(messageId);
    if (trace) {
      trace.steps.push({
        ...step,
        timestamp: Date.now(),
      });
    }
  }

  endTrace(messageId: string): MessageTrace | null {
    const trace = this.traces.get(messageId);
    if (trace) {
      trace.endTime = Date.now();
      trace.duration = trace.endTime - trace.startTime;
      this.traces.delete(messageId);
      return trace;
    }
    return null;
  }

  getActiveTraces(): MessageTrace[] {
    return Array.from(this.traces.values());
  }
}

interface MessageTrace {
  messageId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  steps: TraceStep[];
}

interface TraceStep {
  type: string;
  actorId?: string;
  details?: any;
  timestamp: number;
}

// Integration with orchestrator
const orchestrator = makeOrchestrator({
  // ... other config
  hooks: {
    beforeMessage: async (message, context) => {
      context.messageTracer?.startTrace(message.id);
    },
    afterMessage: async (result, context) => {
      if (context.message) {
        context.messageTracer?.endTrace(context.message.id);
      }
    },
  },
});
```

### Error Analysis

#### Error Classification and Recovery

```typescript
// Classify errors for better handling
class ErrorClassifier {
  classify(error: Error): ErrorClassification {
    if (error instanceof NetworkError) {
      return {
        type: 'network',
        severity: 'medium',
        recoverable: true,
        retryStrategy: 'exponential_backoff',
      };
    }

    if (error instanceof DatabaseError) {
      return {
        type: 'database',
        severity: 'high',
        recoverable: false,
        retryStrategy: 'none',
      };
    }

    if (error instanceof ValidationError) {
      return {
        type: 'validation',
        severity: 'low',
        recoverable: true,
        retryStrategy: 'immediate',
      };
    }

    return {
      type: 'unknown',
      severity: 'medium',
      recoverable: false,
      retryStrategy: 'none',
    };
  }
}

interface ErrorClassification {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryStrategy: 'none' | 'immediate' | 'exponential_backoff';
}

// Error recovery strategies
class ErrorRecovery {
  async recover(
    error: Error,
    context: ActorContext,
    classification: ErrorClassification,
  ): Promise<ActionResult> {
    switch (classification.retryStrategy) {
      case 'immediate':
        return this.immediateRetry(error, context);
      case 'exponential_backoff':
        return this.exponentialBackoffRetry(error, context);
      case 'none':
        return this.failGracefully(error, context);
      default:
        return this.failGracefully(error, context);
    }
  }

  private async immediateRetry(error: Error, context: ActorContext): Promise<ActionResult> {
    // Log and retry immediately
    context.logger?.warn('Retrying operation immediately', { error: error.message });
    return context.retry();
  }

  private async exponentialBackoffRetry(
    error: Error,
    context: ActorContext,
  ): Promise<ActionResult> {
    const attempt = context.retryCount || 0;
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds

    context.logger?.warn('Retrying operation with exponential backoff', {
      error: error.message,
      attempt,
      delay,
    });

    await new Promise((resolve) => setTimeout(resolve, delay));
    return context.retry();
  }

  private failGracefully(error: Error, context: ActorContext): ActionResult {
    context.logger?.error('Operation failed permanently', error);
    return {
      status: 'error',
      error: error.message,
      recoverable: false,
    };
  }
}
```

---

## Frequently Asked Questions

### General Questions

#### Q: What is the Pantheon Framework?

**A:** Pantheon is a comprehensive agent management framework that provides a structured approach to building, orchestrating, and managing AI agents. It implements a sophisticated actor model with context management, behavior selection, and extensible port-based architecture.

#### Q: How does Pantheon differ from other agent frameworks?

**A:** Pantheon distinguishes itself through:

- **Hexagonal Architecture**: Clean separation of core logic from external dependencies
- **Sophisticated Context Engine**: Multi-source context aggregation with intelligent merging
- **Behavior-Driven Actors**: Flexible behavior selection and composition
- **Extensible Port System**: Easy integration with various tools and services
- **Production-Ready**: Built-in monitoring, error handling, and performance optimization

#### Q: What are the system requirements for Pantheon?

**A:** Pantheon requires:

- **Node.js**: Version 16 or higher
- **Memory**: Minimum 512MB RAM, recommended 2GB+ for production
- **Storage**: Depends on use case, typically 1GB+ for logs and state
- **Network**: Required for external integrations (LLMs, databases, etc.)

### Architecture Questions

#### Q: What is the Actor Model in Pantheon?

**A:** The Actor Model is a computational model that treats "actors" as the universal primitives of concurrent computation. In Pantheon, actors are independent entities that:

- Process messages asynchronously
- Maintain their own state
- Communicate through message passing
- Can create other actors
- Exhibit specific behaviors

#### Q: How does the Context Engine work?

**A:** The Context Engine aggregates data from multiple sources and provides a unified view to actors. It:

- Collects context from various sources (databases, APIs, files, etc.)
- Merges context using configurable strategies
- Caches context for performance
- Provides real-time updates to actors
- Supports context validation and transformation

#### Q: What are Ports and Adapters?

**A:** Ports define interfaces for external dependencies, while Adapters implement these interfaces for specific technologies. This hexagonal architecture approach allows:

- Easy swapping of implementations
- Testable components with mock adapters
- Clear separation of concerns
- Extensible integration capabilities

### Development Questions

#### Q: How do I create a custom actor?

**A:** Creating a custom actor involves:

1. Define the actor script with message handlers
2. Configure required ports
3. Implement behaviors if needed
4. Register the actor with the orchestrator

```typescript
const myActorScript: ActorScript = {
  onMessage: async (message, context) => {
    // Handle incoming messages
    return { status: 'processed' };
  },

  onInitialize: async (context) => {
    // Initialize actor state
    return { initialized: true };
  },
};

const actor = makeActor({
  name: 'my-actor',
  script: myActorScript,
  ports: {
    context: contextPort,
    tool: toolPort,
    llm: llmPort,
    messageBus: messageBus,
    scheduler: scheduler,
    actorState: actorStatePort,
  },
});
```

#### Q: How do I integrate with external APIs?

**A:** Integration with external APIs is done through the port system:

1. Create a custom tool that calls the API
2. Register the tool with the ToolPort
3. Use the tool in actor behaviors

```typescript
const apiTool: Tool = {
  name: 'call_external_api',
  description: 'Call external API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: { type: 'string' },
      data: { type: 'object' },
    },
  },
  handler: async (input, context) => {
    const response = await fetch(input.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.data),
    });
    return response.json();
  },
};

const toolPort = makeToolPort({
  tools: [apiTool],
});
```

#### Q: How do I test my actors?

**A:** Testing actors involves multiple levels:

1. **Unit Tests**: Test individual actor scripts with mock contexts
2. **Integration Tests**: Test actor interactions with real ports
3. **System Tests**: Test complete workflows with multiple actors

```typescript
// Unit test example
test('actor processes message correctly', async () => {
  const mockContext = createMockContext();
  const message = createTestMessage();

  const result = await actorScript.onMessage(message, mockContext);

  expect(result.status).toBe('processed');
  expect(mockContext.state).toEqual(expectedState);
});
```

### Performance Questions

#### Q: How can I optimize actor performance?

**A:** Performance optimization strategies include:

- **Batch Processing**: Process multiple messages together
- **Connection Pooling**: Reuse connections to external services
- **Context Caching**: Cache frequently accessed context data
- **Memory Management**: Use appropriate data structures and garbage collection
- **Asynchronous Operations**: Avoid blocking the event loop

#### Q: How many actors can Pantheon handle?

**A:** Pantheon's actor capacity depends on:

- **Available Memory**: Each actor consumes memory for state and context
- **CPU Cores**: More cores allow better parallel processing
- **Message Volume**: Higher message rates require more resources
- **External Dependencies**: Database and API call latency affects throughput

Typical deployments handle hundreds to thousands of actors, with proper optimization and resource allocation.

#### Q: How do I monitor actor performance?

**A:** Monitoring can be done through:

- **Built-in Metrics**: Actor counts, message rates, error rates
- **Performance Hooks**: Custom metrics collection
- **External Tools**: Integration with Prometheus, Grafana, etc.
- **Logging**: Structured logging for analysis

```typescript
const orchestrator = makeOrchestrator({
  hooks: {
    afterAction: async (result, context) => {
      // Record metrics
      metrics.record('action_duration', context.duration);
      metrics.record('action_status', result.status);
    },
  },
});
```

### Troubleshooting Questions

#### Q: Why is my actor not responding to messages?

**A:** Common causes and solutions:

1. **Actor not started**: Ensure actor is properly initialized
2. **Message queue full**: Check for backpressure issues
3. **Error in message handler**: Check logs for exceptions
4. **Port configuration issues**: Verify all required ports are connected

#### Q: How do I debug memory leaks?

**A:** Memory leak debugging steps:

1. **Enable heap snapshots**: Use Node.js heap profiling
2. **Monitor memory usage**: Track memory growth over time
3. **Identify retained objects**: Use memory analysis tools
4. **Check event listeners**: Ensure proper cleanup
5. **Review cache usage**: Implement proper eviction policies

#### Q: What should I do if actors are crashing frequently?

**A:** Troubleshooting frequent crashes:

1. **Check error logs**: Identify common error patterns
2. **Review resource usage**: Check for memory/CPU exhaustion
3. **Implement error handling**: Add proper try-catch blocks
4. **Add health checks**: Monitor actor health
5. **Scale resources**: Increase available system resources

### Deployment Questions

#### Q: How do I deploy Pantheon in production?

**A:** Production deployment involves:

1. **Containerization**: Use Docker for consistent deployment
2. **Orchestration**: Use Kubernetes or similar for scaling
3. **Monitoring**: Set up comprehensive monitoring
4. **Logging**: Implement centralized logging
5. **Security**: Configure proper authentication and authorization

#### Q: How do I scale Pantheon horizontally?

**A:** Horizontal scaling strategies:

1. **Stateless Actors**: Design actors to be stateless where possible
2. **Shared State**: Use external state stores (Redis, database)
3. **Load Balancing**: Distribute actors across multiple instances
4. **Message Queues**: Use external message brokers for communication

#### Q: What are the best practices for production deployment?

**A:** Production best practices:

- **Environment Configuration**: Use environment variables for configuration
- **Secrets Management**: Use secure secret storage
- **Health Checks**: Implement comprehensive health checks
- **Graceful Shutdown**: Handle shutdown signals properly
- **Resource Limits**: Set appropriate memory and CPU limits
- **Backup and Recovery**: Implement backup strategies for state

---

## Error Resolution Guide

### Common Error Codes and Solutions

#### PAN-001: Actor Initialization Failed

**Description**: Actor failed to initialize during startup
**Common Causes**:

- Missing required ports
- Invalid actor configuration
- Port initialization failure

**Solutions**:

```typescript
// 1. Validate actor configuration
function validateActorConfig(config: ActorConfig): void {
  const requiredPorts = ['context', 'tool', 'llm', 'messageBus', 'scheduler', 'actorState'];
  const missingPorts = requiredPorts.filter((port) => !config.ports?.[port]);

  if (missingPorts.length > 0) {
    throw new Error(`Missing required ports: ${missingPorts.join(', ')}`);
  }
}

// 2. Add proper error handling
try {
  const actor = makeActor(config);
} catch (error) {
  console.error('Actor initialization failed:', error);
  // Implement fallback or retry logic
}
```

#### PAN-002: Context Source Error

**Description**: Error occurred while fetching context from a source
**Common Causes**:

- Network connectivity issues
- Authentication failure
- Data format mismatch

**Solutions**:

```typescript
// 1. Implement retry logic with exponential backoff
class ResilientContextSource implements ContextSource {
  async getContext(): Promise<any> {
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        return await this.fetchContext();
      } catch (error) {
        attempt++;
        if (attempt === maxAttempts) {
          throw new Error(`Failed to fetch context after ${maxAttempts} attempts`);
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async fetchContext(): Promise<any> {
    // Actual context fetching logic
  }
}

// 2. Add circuit breaker pattern
class CircuitBreakerContextSource implements ContextSource {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async getContext(): Promise<any> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await this.fetchContext();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

#### PAN-003: Tool Execution Failed

**Description**: Tool execution failed with an error
**Common Causes**:

- Invalid input parameters
- Tool not properly registered
- External service unavailable

**Solutions**:

```typescript
// 1. Add input validation
const validatedTool: Tool = {
  name: 'my_tool',
  description: 'A tool with validation',
  inputSchema: {
    type: 'object',
    properties: {
      requiredParam: { type: 'string' },
      optionalParam: { type: 'number' },
    },
    required: ['requiredParam'],
  },
  handler: async (input, context) => {
    // Validate input
    if (!input.requiredParam) {
      throw new Error('requiredParam is required');
    }

    // Execute tool logic
    return await executeToolLogic(input);
  },
};

// 2. Add timeout handling
const toolWithTimeout: Tool = {
  name: 'timeout_tool',
  description: 'Tool with timeout',
  inputSchema: {
    /* ... */
  },
  handler: async (input, context) => {
    const timeout = 30000; // 30 seconds

    const result = await Promise.race([
      executeToolLogic(input),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tool execution timeout')), timeout),
      ),
    ]);

    return result;
  },
};
```

#### PAN-004: Message Processing Error

**Description**: Error occurred while processing a message
**Common Causes**:

- Invalid message format
- Actor state corruption
- Unhandled exceptions in message handlers

**Solutions**:

```typescript
// 1. Add comprehensive error handling
const resilientActorScript: ActorScript = {
  onMessage: async (message, context) => {
    try {
      // Validate message
      if (!this.validateMessage(message)) {
        throw new Error('Invalid message format');
      }

      // Process message
      const result = await this.processMessage(message, context);

      // Validate result
      if (!this.validateResult(result)) {
        throw new Error('Invalid result format');
      }

      return result;
    } catch (error) {
      // Log error with context
      context.logger?.error('Message processing failed', error as Error, {
        messageId: message.id,
        actorId: context.actor.id,
      });

      // Return error result
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        messageId: message.id,
      };
    }
  },

  validateMessage(message: Message): boolean {
    return message.type && message.content !== undefined;
  },

  validateResult(result: any): boolean {
    return result && typeof result === 'object';
  },

  async processMessage(message: Message, context: ActorContext): Promise<ActionResult> {
    // Actual message processing logic
  },
};

// 2. Add message retry logic
const actorWithRetry: ActorScript = {
  onMessage: async (message, context) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await this.processMessage(message, context);
      } catch (error) {
        attempt++;

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  },
};
```

#### PAN-005: Port Connection Error

**Description**: Failed to connect to a port
**Common Causes**:

- Port not properly initialized
- Network connectivity issues
- Authentication failure

**Solutions**:

```typescript
// 1. Add connection health checks
class HealthCheckedPort implements Port {
  private isConnected = false;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private port: Port,
    private healthCheckIntervalMs: number = 30000,
  ) {
    this.startHealthCheck();
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkHealth();
        this.isConnected = true;
      } catch (error) {
        this.isConnected = false;
        console.error('Port health check failed:', error);
      }
    }, this.healthCheckIntervalMs);
  }

  private async checkHealth(): Promise<void> {
    // Implement health check logic
    // This could be a ping to the service or a simple query
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.port.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    clearInterval(this.healthCheckInterval);
    await this.port.disconnect();
    this.isConnected = false;
  }

  // Implement other port methods...
}

// 2. Add connection pooling
class PortPool {
  private availablePorts: Port[] = [];
  private busyPorts: Set<Port> = new Set();
  private maxPoolSize: number;

  constructor(maxPoolSize: number) {
    this.maxPoolSize = maxPoolSize;
  }

  async acquire(): Promise<Port> {
    if (this.availablePorts.length > 0) {
      const port = this.availablePorts.pop()!;
      this.busyPorts.add(port);
      return port;
    }

    if (this.busyPorts.size < this.maxPoolSize) {
      const port = await this.createPort();
      this.busyPorts.add(port);
      return port;
    }

    // Wait for a port to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.availablePorts.length > 0) {
          clearInterval(checkInterval);
          const port = this.availablePorts.pop()!;
          this.busyPorts.add(port);
          resolve(port);
        }
      }, 100);
    });
  }

  release(port: Port): void {
    this.busyPorts.delete(port);
    this.availablePorts.push(port);
  }

  private async createPort(): Promise<Port> {
    // Create new port instance
  }
}
```

---

## Best Practices Checklist

### Development Best Practices

#### ✅ Code Quality

- [ ] Use TypeScript for type safety
- [ ] Implement comprehensive error handling
- [ ] Write unit tests for all components
- [ ] Use ESLint and Prettier for code consistency
- [ ] Document all public APIs with JSDoc
- [ ] Follow the established code style guide

#### ✅ Architecture

- [ ] Use dependency injection for loose coupling
- [ ] Implement the hexagonal architecture pattern
- [ ] Separate concerns between layers
- [ ] Use interfaces for all external dependencies
- [ ] Implement proper abstraction layers
- [ ] Avoid circular dependencies

#### ✅ Performance

- [ ] Use connection pooling for external services
- [ ] Implement caching strategies for frequently accessed data
- [ ] Use asynchronous operations for I/O
- [ ] Monitor memory usage and implement garbage collection
- [ ] Optimize database queries and API calls
- [ ] Use efficient data structures and algorithms

#### ✅ Security

- [ ] Validate all input data
- [ ] Implement proper authentication and authorization
- [ ] Use secure communication channels (HTTPS)
- [ ] Sanitize all output data
- [ ] Implement rate limiting and throttling
- [ ] Keep dependencies updated and secure

### Testing Best Practices

#### ✅ Unit Testing

- [ ] Test all public methods and functions
- [ ] Mock external dependencies
- [ ] Test edge cases and error conditions
- [ ] Use descriptive test names
- [ ] Maintain high test coverage (>80%)
- [ ] Run tests in CI/CD pipeline

#### ✅ Integration Testing

- [ ] Test component interactions
- [ ] Use real dependencies where possible
- [ ] Test error scenarios and recovery
- [ ] Test performance under load
- [ ] Test data consistency
- [ ] Test configuration changes

#### ✅ System Testing

- [ ] Test complete workflows
- [ ] Test with realistic data volumes
- [ ] Test failover and recovery scenarios
- [ ] Test monitoring and alerting
- [ ] Test deployment and rollback
- [ ] Test security vulnerabilities

### Operations Best Practices

#### ✅ Monitoring

- [ ] Implement comprehensive logging
- [ ] Set up metrics collection
- [ ] Configure alerting for critical issues
- [ ] Monitor system health and performance
- [ ] Track business metrics and KPIs
- [ ] Set up dashboards for visualization

#### ✅ Deployment

- [ ] Use containerization (Docker)
- [ ] Implement CI/CD pipelines
- [ ] Use infrastructure as code
- [ ] Implement blue-green deployments
- [ ] Set up automated rollback
- [ ] Document deployment procedures

#### ✅ Maintenance

- [ ] Regular dependency updates
- [ ] Performance tuning and optimization
- [ ] Security audits and patches
- [ ] Database maintenance and optimization
- [ ] Log rotation and cleanup
- [ ] Backup and disaster recovery

### Documentation Best Practices

#### ✅ Code Documentation

- [ ] Document all public APIs
- [ ] Include usage examples
- [ ] Document configuration options
- [ ] Document error conditions
- [ ] Document performance characteristics
- [ ] Document security considerations

#### ✅ User Documentation

- [ ] Provide getting started guides
- [ ] Include tutorials and examples
- [ ] Document common use cases
- [ ] Provide troubleshooting guides
- [ ] Document best practices
- [ ] Keep documentation up to date

#### ✅ Architecture Documentation

- [ ] Document system architecture
- [ ] Include data flow diagrams
- [ ] Document integration points
- [ ] Document scalability considerations
- [ ] Document deployment architecture
- [ ] Document monitoring and observability

This comprehensive troubleshooting and FAQ guide should help developers effectively diagnose and resolve issues when working with the Pantheon Framework, while also providing best practices for building robust and maintainable agent-based systems.
