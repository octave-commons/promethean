# Developer Guide

## Overview

This guide provides comprehensive information for developers working with the Pantheon Framework. It covers getting started, creating custom components, testing strategies, and best practices for building robust agent-based applications.

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript 5.0+
- pnpm package manager
- Basic understanding of TypeScript and async/await patterns

### Installation

```bash
# Install the core package
pnpm add @promethean-os/pantheon-core

# Install additional adapters as needed
pnpm add @promethean-os/pantheon-persistence
pnpm add @promethean-os/pantheon-llm-openai
pnpm add @promethean-os/pantheon-llm-claude
```

### Basic Setup

```typescript
import { makeOrchestrator } from '@promethean-os/pantheon-core';
import { InMemoryContextAdapter } from '@promethean-os/pantheon-adapters';
import { OpenAiAdapter } from '@promethean-os/pantheon-llm-openai';

// Create adapters
const contextAdapter = new InMemoryContextAdapter();
const llmAdapter = new OpenAiAdapter({ apiKey: process.env.OPENAI_API_KEY });

// Create orchestrator
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
```

## Creating Custom Components

### 1. Custom Actors

Actors are the primary building blocks of the Pantheon Framework. Here's how to create a custom actor:

```typescript
import type { Actor, ActorScript, Talent, Behavior } from '@promethean-os/pantheon-core';

// Define custom talent
const customerServiceTalent: Talent = {
  name: 'customer-service',
  description: 'Handles customer inquiries and support',
  behaviors: [
    {
      name: 'greet-customer',
      description: 'Greets customers and identifies their needs',
      mode: 'active',
      plan: async ({ goal, context }) => {
        const response = await llmAdapter.complete([
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
    },
    {
      name: 'escalate-issue',
      description: 'Escalates complex issues to human agents',
      mode: 'passive',
      plan: async ({ goal, context }) => {
        // Check if issue needs escalation
        const needsEscalation = await analyzeComplexity(context);

        if (needsEscalation) {
          return {
            actions: [
              {
                type: 'message',
                content: 'I need to escalate this to a human agent.',
                target: 'supervisor',
              },
            ],
          };
        }

        return { actions: [] };
      },
    },
  ],
};

// Create actor script
const customerServiceScript: ActorScript = {
  name: 'customer-service-agent',
  description: 'Customer service representative',
  talents: [customerServiceTalent],
  contextSources: [
    {
      type: 'text',
      content: 'Company policies and procedures...',
      metadata: { category: 'policies' },
    },
  ],
};

// Create actor
const customerServiceActor: Actor = {
  id: 'customer-service-001',
  script: customerServiceScript,
  goals: [
    'Provide excellent customer service',
    'Resolve customer issues efficiently',
    'Escalate complex problems when needed',
  ],
};
```

### 2. Custom Behaviors

Behaviors define how actors respond to different situations:

```typescript
interface CustomBehaviorOptions {
  priority: number;
  conditions: Array<(context: Message[]) => Promise<boolean>>;
  maxRetries: number;
}

class CustomBehavior implements Behavior {
  name: string;
  description: string;
  mode: 'active' | 'passive' | 'persistent';
  private options: CustomBehaviorOptions;

  constructor(
    name: string,
    description: string,
    mode: Behavior['mode'],
    options: CustomBehaviorOptions,
  ) {
    this.name = name;
    this.description = description;
    this.mode = mode;
    this.options = options;
  }

  async plan(params: { goal: string; context: Message[] }): Promise<{ actions: Action[] }> {
    // Check if behavior should execute
    const shouldExecute = await this.checkConditions(params.context);

    if (!shouldExecute) {
      return { actions: [] };
    }

    // Execute with retry logic
    return await this.executeWithRetry(params);
  }

  private async checkConditions(context: Message[]): Promise<boolean> {
    for (const condition of this.options.conditions) {
      if (!(await condition(context))) {
        return false;
      }
    }
    return true;
  }

  private async executeWithRetry(params: {
    goal: string;
    context: Message[];
  }): Promise<{ actions: Action[] }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await this.doPlan(params);
      } catch (error) {
        lastError = error as Error;
        if (attempt === this.options.maxRetries) {
          break;
        }
        await this.delay(1000 * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    throw lastError || new Error('Unknown error in behavior execution');
  }

  private async doPlan(params: {
    goal: string;
    context: Message[];
  }): Promise<{ actions: Action[] }> {
    // Actual planning logic
    return { actions: [] };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Usage
const dataAnalysisBehavior = new CustomBehavior(
  'analyze-data',
  'Analyzes data and provides insights',
  'active',
  {
    priority: 1,
    conditions: [
      async (context) => context.some((msg) => msg.content.includes('data')),
      async (context) => context.some((msg) => msg.content.includes('analysis')),
    ],
    maxRetries: 3,
  },
);
```

### 3. Custom Tools

Tools extend actor capabilities by providing external functionality:

```typescript
import type { ToolSpec } from '@promethean-os/pantheon-core';

interface WeatherToolArgs {
  location: string;
  units?: 'metric' | 'imperial';
}

class WeatherTool implements ToolSpec {
  name = 'get-weather';
  description = 'Gets current weather information for a location';
  parameters = {
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
  };

  async execute(args: WeatherToolArgs): Promise<string> {
    // Validate arguments
    if (!args.location) {
      throw new Error('Location is required');
    }

    // Call weather API
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${args.location}`,
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Format response
    const temp = args.units === 'metric' ? data.current.temp_c : data.current.temp_f;

    const unit = args.units === 'metric' ? '°C' : '°F';

    return `The current temperature in ${args.location} is ${temp}${unit} with ${data.current.condition.text}.`;
  }
}

// Register tool
toolAdapter.register(new WeatherTool());
```

### 4. Custom Adapters

Create custom adapters to integrate with external systems:

```typescript
import type { ContextPort, Message, ContextSource } from '@promethean-os/pantheon-core';

export class ElasticsearchContextAdapter implements ContextPort {
  private client: any; // Elasticsearch client

  constructor(client: any) {
    this.client = client;
  }

  async compile(opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }): Promise<Message[]> {
    const messages: Message[] = [];

    // Add text inputs
    if (opts.texts) {
      messages.push(
        ...opts.texts.map((text) => ({
          role: 'user' as const,
          content: text,
        })),
      );
    }

    // Search Elasticsearch for relevant context
    for (const source of opts.sources) {
      const searchResults = await this.searchContext(source, opts);
      messages.push(...searchResults);
    }

    // Apply limits
    return this.applyLimits(messages, opts);
  }

  private async searchContext(source: ContextSource, opts: any): Promise<Message[]> {
    try {
      const response = await this.client.search({
        index: 'context',
        body: {
          query: {
            bool: {
              must: [
                { match: { category: source.metadata?.category || 'default' } },
                {
                  multi_match: {
                    query: opts.texts?.join(' ') || '',
                    fields: ['title^2', 'content'],
                  },
                },
              ],
            },
          },
          size: opts.queryLimit || 10,
          sort: [{ _score: { order: 'desc' } }],
        },
      });

      return response.hits.hits.map((hit: any) => ({
        role: 'system' as const,
        content: hit._source.content,
        metadata: {
          source: 'elasticsearch',
          score: hit._score,
          category: hit._source.category,
        },
      }));
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      return [];
    }
  }

  private applyLimits(messages: Message[], opts: any): Message[] {
    let result = messages;

    if (opts.recentLimit) {
      result = result.slice(-opts.recentLimit);
    }

    if (opts.limit) {
      result = result.slice(0, opts.limit);
    }

    return result;
  }
}
```

## Testing Strategies

### 1. Unit Testing Actors

```typescript
import { describe, it, expect, beforeEach } from 'test';
import { MockContextAdapter, MockToolAdapter, MockLlmAdapter } from '@promethean-os/pantheon-test';

describe('CustomerServiceActor', () => {
  let orchestrator: ReturnType<typeof makeOrchestrator>;
  let mockContext: MockContextAdapter;
  let mockLlm: MockLlmAdapter;
  let actor: Actor;

  beforeEach(() => {
    // Setup mocks
    mockContext = new MockContextAdapter();
    mockLlm = new MockLlmAdapter();

    // Create orchestrator with mocks
    orchestrator = makeOrchestrator({
      now: () => Date.now(),
      log: () => {},
      context: mockContext,
      tools: new MockToolAdapter(),
      llm: mockLlm,
      bus: createMockMessageBus(),
      schedule: createMockScheduler(),
      state: createMockActorState(),
    });

    // Create test actor
    actor = createTestCustomerServiceActor();
  });

  it('should greet customer when user message is received', async () => {
    // Setup mock responses
    mockContext.setResponse([{ role: 'system', content: 'Company policies...' }]);

    mockLlm.setResponse({
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    });

    // Execute actor tick
    await orchestrator.tickActor(actor, {
      userMessage: 'Hello, I need help',
    });

    // Verify expectations
    expect(mockLlm.getCalls()).toHaveLength(1);
    expect(mockLlm.getCalls()[0].messages).toHaveLength(3); // system + context + user
  });

  it('should escalate complex issues', async () => {
    // Setup scenario that requires escalation
    mockContext.setResponse([{ role: 'system', content: 'Escalation policies...' }]);

    mockLlm.setResponse({
      role: 'assistant',
      content: 'This issue requires human intervention.',
    });

    await orchestrator.tickActor(actor, {
      userMessage: 'I want to speak to your manager about a serious complaint',
    });

    // Verify escalation message was sent
    const messageBusCalls = mockMessageBus.getCalls();
    expect(messageBusCalls).toHaveLength(1);
    expect(messageBusCalls[0].to).toBe('supervisor');
  });
});
```

### 2. Integration Testing

```typescript
describe('Pantheon Integration', () => {
  let pantheon: PantheonSystem;
  let testActor: Actor;

  beforeEach(async () => {
    // Create real adapters for integration testing
    const contextAdapter = new InMemoryContextAdapter();
    const toolAdapter = new InMemoryToolAdapter();
    const llmAdapter = new MockLlmAdapter();
    const messageBus = new InMemoryMessageBus();
    const scheduler = new NodeScheduler();
    const actorStateAdapter = new InMemoryActorStateAdapter();

    // Create Pantheon system
    pantheon = new PantheonSystem({
      contextAdapter,
      toolAdapter,
      llmAdapter,
      messageBus,
      scheduler,
      actorStateAdapter,
    });

    // Setup test actor
    testActor = await pantheon.createActor({
      name: 'test-agent',
      script: createTestScript(),
      goals: ['Test the system'],
    });
  });

  it('should handle complete actor lifecycle', async () => {
    // Start actor
    await pantheon.startActor(testActor.id);

    // Send message
    await pantheon.sendMessage(testActor.id, 'Hello, test!');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify actor responded
    const messages = await pantheon.getActorMessages(testActor.id);
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain('Hello');

    // Stop actor
    await pantheon.stopActor(testActor.id);
  });

  it('should handle multiple actors concurrently', async () => {
    // Create multiple actors
    const actors = await Promise.all([
      pantheon.createActor({ name: 'agent1', script: createTestScript(), goals: ['Goal 1'] }),
      pantheon.createActor({ name: 'agent2', script: createTestScript(), goals: ['Goal 2'] }),
      pantheon.createActor({ name: 'agent3', script: createTestScript(), goals: ['Goal 3'] }),
    ]);

    // Start all actors
    await Promise.all(actors.map((actor) => pantheon.startActor(actor.id)));

    // Send messages to all actors
    await Promise.all(
      actors.map((actor) => pantheon.sendMessage(actor.id, `Hello ${actor.name}!`)),
    );

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify all actors responded
    for (const actor of actors) {
      const messages = await pantheon.getActorMessages(actor.id);
      expect(messages).toHaveLength(1);
    }

    // Cleanup
    await Promise.all(actors.map((actor) => pantheon.stopActor(actor.id)));
  });
});
```

### 3. Performance Testing

```typescript
describe('Performance Tests', () => {
  it('should handle high message throughput', async () => {
    const pantheon = createPerformanceTestPantheon();
    const actor = await pantheon.createActor({
      name: 'performance-test',
      script: createLightweightScript(),
      goals: ['Handle high throughput'],
    });

    await pantheon.startActor(actor.id);

    const messageCount = 1000;
    const startTime = Date.now();

    // Send many messages concurrently
    const messagePromises = Array.from({ length: messageCount }, (_, i) =>
      pantheon.sendMessage(actor.id, `Message ${i}`),
    );

    await Promise.all(messagePromises);

    // Wait for all messages to be processed
    let processedCount = 0;
    while (processedCount < messageCount) {
      const messages = await pantheon.getActorMessages(actor.id);
      processedCount = messages.length;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const messagesPerSecond = (messageCount / duration) * 1000;

    console.log(`Processed ${messageCount} messages in ${duration}ms`);
    console.log(`Throughput: ${messagesPerSecond.toFixed(2)} messages/second`);

    expect(messagesPerSecond).toBeGreaterThan(100); // Adjust based on requirements

    await pantheon.stopActor(actor.id);
  });

  it('should handle many concurrent actors', async () => {
    const pantheon = createPerformanceTestPantheon();
    const actorCount = 100;

    // Create many actors
    const actors = await Promise.all(
      Array.from({ length: actorCount }, (_, i) =>
        pantheon.createActor({
          name: `actor-${i}`,
          script: createLightweightScript(),
          goals: [`Goal ${i}`],
        }),
      ),
    );

    // Start all actors
    await Promise.all(actors.map((actor) => pantheon.startActor(actor.id)));

    // Send messages to all actors
    const startTime = Date.now();
    await Promise.all(actors.map((actor) => pantheon.sendMessage(actor.id, 'Test message')));

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Processed ${actorCount} actors in ${duration}ms`);
    expect(duration).toBeLessThan(5000); // Adjust based on requirements

    // Cleanup
    await Promise.all(actors.map((actor) => pantheon.stopActor(actor.id)));
  });
});
```

## Debugging and Troubleshooting

### 1. Logging and Monitoring

```typescript
import { createLogger, format, transports } from 'winston';

// Create structured logger
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [new transports.Console(), new transports.File({ filename: 'pantheon.log' })],
});

// Create monitored orchestrator
const orchestrator = makeOrchestrator({
  now: () => Date.now(),
  log: (msg, meta) => {
    logger.info(msg, meta);
  },
  // ... other dependencies
});

// Add metrics collection
const metrics = {
  actorTicks: 0,
  actionsExecuted: 0,
  errors: 0,
  startTime: Date.now(),
};

// Wrap orchestrator methods for metrics
const originalTickActor = orchestrator.tickActor.bind(orchestrator);
orchestrator.tickActor = async (actor, input) => {
  metrics.actorTicks++;
  try {
    return await originalTickActor(actor, input);
  } catch (error) {
    metrics.errors++;
    throw error;
  }
};

// Periodically log metrics
setInterval(() => {
  const uptime = Date.now() - metrics.startTime;
  logger.info('Pantheon Metrics', {
    ...metrics,
    uptime,
    actorTicksPerSecond: (metrics.actorTicks / uptime) * 1000,
    averageActionsPerTick: metrics.actionsExecuted / metrics.actorTicks,
  });
}, 60000);
```

### 2. Common Issues and Solutions

#### Issue: Actor not responding to messages

**Symptoms:**

- Actor loop is running but no responses
- No error messages in logs
- Messages appear to be sent but not received

**Debugging Steps:**

```typescript
// 1. Check if actor is properly registered
const actor = await actorStateAdapter.get(actorId);
if (!actor) {
  console.error(`Actor not found: ${actorId}`);
}

// 2. Verify message bus subscription
messageBus.subscribe((msg) => {
  console.log('Message received:', msg);
});

// 3. Check behavior selection
const behaviors = selectBehaviors(actor, true);
console.log(
  'Selected behaviors:',
  behaviors.map((b) => b.name),
);

// 4. Verify context compilation
const context = await contextAdapter.compile({
  texts: ['test message'],
  sources: actor.script.contextSources,
});
console.log('Compiled context:', context);
```

**Solution:**

- Ensure actor is properly registered with ActorStatePort
- Verify message bus is properly configured
- Check that behaviors are correctly implemented
- Validate context sources are accessible

#### Issue: High memory usage

**Symptoms:**

- Memory usage increases over time
- Performance degrades with prolonged operation
- Garbage collection is frequent

**Debugging Steps:**

```typescript
// 1. Monitor memory usage
const memoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  });
};

// 2. Check for memory leaks
setInterval(memoryUsage, 5000);

// 3. Analyze context caching
if (contextAdapter instanceof InMemoryContextAdapter) {
  console.log('Cache size:', contextAdapter.getCacheSize());
}

// 4. Check actor state growth
const actors = await actorStateAdapter.list();
console.log('Total actors:', actors.length);
```

**Solution:**

- Implement proper cache eviction policies
- Limit context compilation results
- Clean up unused resources
- Implement actor lifecycle management

#### Issue: Tool execution timeouts

**Symptoms:**

- Tools take too long to execute
- Actor loops get stuck
- Timeout errors in logs

**Debugging Steps:**

```typescript
// 1. Add timeout monitoring
const timeoutToolAdapter = new TimeoutToolAdapter(toolAdapter, {
  timeout: 30000,
  onTimeout: (toolName, args) => {
    console.error(`Tool timeout: ${toolName}`, { args });
  },
});

// 2. Monitor tool execution times
const monitoredToolAdapter = new MonitoredToolAdapter(toolAdapter, {
  onExecution: (toolName, args, duration) => {
    if (duration > 10000) {
      console.warn(`Slow tool execution: ${toolName} took ${duration}ms`);
    }
  },
});

// 3. Check for blocking operations
// Review tool implementations for synchronous operations
```

**Solution:**

- Implement proper timeout handling
- Use asynchronous operations
- Add circuit breakers for external services
- Monitor and optimize slow tools

## Best Practices

### 1. Code Organization

```
src/
├── actors/
│   ├── customer-service/
│   │   ├── index.ts
│   │   ├── behaviors.ts
│   │   └── tools.ts
│   └── data-analyst/
│       ├── index.ts
│       ├── behaviors.ts
│       └── tools.ts
├── adapters/
│   ├── context/
│   │   ├── elasticsearch-adapter.ts
│   │   └── memory-adapter.ts
│   └── llm/
│       ├── openai-adapter.ts
│       └── claude-adapter.ts
├── config/
│   ├── pantheon.config.ts
│   └── adapters.config.ts
└── utils/
    ├── testing.ts
    ├── monitoring.ts
    └── logging.ts
```

### 2. Error Handling

```typescript
// Create custom error types
class PantheonError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'PantheonError';
  }
}

class ActorError extends PantheonError {
  constructor(
    message: string,
    public actorId: string,
    details?: any,
  ) {
    super(message, 'ACTOR_ERROR', { actorId, ...details });
  }
}

class BehaviorError extends PantheonError {
  constructor(
    message: string,
    public behaviorName: string,
    details?: any,
  ) {
    super(message, 'BEHAVIOR_ERROR', { behaviorName, ...details });
  }
}

// Use error boundaries
class ErrorBoundaryBehavior implements Behavior {
  async plan(params: { goal: string; context: Message[] }): Promise<{ actions: Action[] }> {
    try {
      return await this.executePlan(params);
    } catch (error) {
      console.error('Behavior execution failed:', error);

      // Return fallback action
      return {
        actions: [
          {
            type: 'message',
            content: 'I apologize, but I encountered an error. Please try again.',
            target: 'user',
          },
        ],
      };
    }
  }

  private async executePlan(params: {
    goal: string;
    context: Message[];
  }): Promise<{ actions: Action[] }> {
    // Actual implementation
    return { actions: [] };
  }
}
```

### 3. Configuration Management

```typescript
// Type-safe configuration
interface PantheonConfig {
  environment: 'development' | 'production' | 'test';
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
  adapters: {
    context: {
      type: 'memory' | 'elasticsearch' | 'hybrid';
      options?: any;
    };
    llm: {
      type: 'openai' | 'claude' | 'opencode';
      model: string;
      apiKey?: string;
      timeout: number;
    };
    // ... other adapter configs
  };
  performance: {
    maxConcurrentActors: number;
    maxContextSize: number;
    cacheTtl: number;
  };
}

// Configuration loader
class ConfigLoader {
  static load(): PantheonConfig {
    const baseConfig = this.loadBaseConfig();
    const envConfig = this.loadEnvironmentConfig();
    const fileConfig = this.loadFileConfig();

    return this.mergeConfigs(baseConfig, envConfig, fileConfig);
  }

  private static loadBaseConfig(): Partial<PantheonConfig> {
    return {
      environment: 'development',
      logging: {
        level: 'info',
        format: 'json',
      },
      performance: {
        maxConcurrentActors: 100,
        maxContextSize: 10000,
        cacheTtl: 300000,
      },
    };
  }

  private static loadEnvironmentConfig(): Partial<PantheonConfig> {
    return {
      adapters: {
        llm: {
          apiKey: process.env.OPENAI_API_KEY,
          timeout: parseInt(process.env.LLM_TIMEOUT || '30000'),
        },
      },
    };
  }

  private static loadFileConfig(): Partial<PantheonConfig> {
    try {
      return require('./pantheon.config.json');
    } catch {
      return {};
    }
  }

  private static mergeConfigs(...configs: Partial<PantheonConfig>[]): PantheonConfig {
    return configs.reduce(
      (acc, config) => ({
        ...acc,
        ...config,
        adapters: {
          ...acc.adapters,
          ...config.adapters,
        },
        logging: {
          ...acc.logging,
          ...config.logging,
        },
        performance: {
          ...acc.performance,
          ...config.performance,
        },
      }),
      {} as PantheonConfig,
    );
  }
}
```

### 4. Performance Optimization

```typescript
// Implement caching strategies
class CachedContextAdapter implements ContextPort {
  private cache = new Map<string, { data: Message[]; timestamp: number }>();
  private delegate: ContextPort;
  private ttl: number;

  constructor(delegate: ContextPort, ttl: number = 300000) {
    this.delegate = delegate;
    this.ttl = ttl;
  }

  async compile(opts: any): Promise<Message[]> {
    const cacheKey = this.generateCacheKey(opts);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const result = await this.delegate.compile(opts);
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Cleanup old entries
    this.cleanup();

    return result;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Use connection pooling
class PooledLlmAdapter implements LlmPort {
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

## Deployment and Operations

### 1. Containerization

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S pantheon -u 1001

# Change ownership
USER pantheon

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["pnpm", "start"]
```

### 2. Monitoring and Observability

```typescript
// Prometheus metrics
import { Counter, Histogram, Gauge } from 'prom-client';

const metrics = {
  actorTicks: new Counter({
    name: 'pantheon_actor_ticks_total',
    help: 'Total number of actor ticks',
    labelNames: ['actor_name', 'status'],
  }),

  actionExecution: new Histogram({
    name: 'pantheon_action_execution_duration_seconds',
    help: 'Duration of action execution',
    labelNames: ['action_type', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),

  activeActors: new Gauge({
    name: 'pantheon_active_actors',
    help: 'Number of currently active actors',
  }),

  contextCompilation: new Histogram({
    name: 'pantheon_context_compilation_duration_seconds',
    help: 'Duration of context compilation',
    labelNames: ['adapter_type'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  }),
};

// Wrap orchestrator methods
const monitoredOrchestrator = {
  async tickActor(actor: Actor, input?: any) {
    const startTime = Date.now();
    try {
      const result = await orchestrator.tickActor(actor, input);
      metrics.actorTicks.inc({ actor_name: actor.name, status: 'success' });
      return result;
    } catch (error) {
      metrics.actorTicks.inc({ actor_name: actor.name, status: 'error' });
      throw error;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      metrics.actionExecution.observe({ action_type: 'tick', status: 'total' }, duration);
    }
  },
};
```

### 3. Scaling Strategies

```typescript
// Horizontal scaling with multiple instances
class PantheonCluster {
  private instances: PantheonSystem[] = [];
  private loadBalancer: RoundRobinLoadBalancer;

  constructor(instanceCount: number) {
    this.instances = Array.from(
      { length: instanceCount },
      () => new PantheonSystem(createConfig()),
    );
    this.loadBalancer = new RoundRobinLoadBalancer(this.instances);
  }

  async createActor(config: any): Promise<Actor> {
    const instance = this.loadBalancer.getNext();
    return instance.createActor(config);
  }

  async sendMessage(actorId: string, message: string): Promise<void> {
    const instance = this.loadBalancer.getInstanceForActor(actorId);
    return instance.sendMessage(actorId, message);
  }
}

// Vertical scaling with resource management
class ResourceManager {
  private maxMemory: number;
  private maxCpu: number;

  constructor(maxMemory: number, maxCpu: number) {
    this.maxMemory = maxMemory;
    this.maxCpu = maxCpu;
  }

  canCreateActor(): boolean {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return memoryUsage.heapUsed < this.maxMemory * 0.8 && cpuUsage.user < this.maxCpu * 0.8;
  }

  async waitForResources(): Promise<void> {
    while (!this.canCreateActor()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
```

## Related Documentation

- [[Type System Reference]]: For detailed type definitions and interfaces
- [[Actor Model Guide]]: For actor and behavior development patterns
- [[Context Engine Guide]]: For context management and optimization
- [[Orchestrator Guide]]: For orchestrator usage and configuration
- [[Ports System Guide]]: For adapter development and integration
- [[API Reference]]: For complete API documentation

## File Locations

- **Core Package**: `/packages/pantheon-core/src/`
- **Adapters**: `/packages/pantheon-adapters/src/`
- **Examples**: `/packages/pantheon/examples/`
- **Tests**: `/packages/pantheon-core/src/test/`
- **Configuration**: `/packages/pantheon/src/config/`
