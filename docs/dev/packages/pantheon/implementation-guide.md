# Pantheon Implementation Guide

## Overview

This guide consolidates implementation patterns, architectural decisions, and best practices for building with Pantheon. It combines insights from the primer series, task implementations, and architectural documentation.

## Architecture Patterns

### Hexagonal Architecture (Ports and Adapters)

Pantheon follows hexagonal architecture to separate business logic from infrastructure concerns:

```typescript
// Core Port Interface
interface ContextPort {
  compile(opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }): Promise<Message[]>;
}

// Adapter Implementation
const makePantheonPersistenceAdapter = (deps: PersistenceAdapterDeps): ContextPort => {
  return {
    compile: async ({ texts = [], sources, recentLimit = 10, queryLimit = 5, limit = 20 }) => {
      const colls = await deps.getCollectionsFor(sources);
      const { makeContextStore } = await import('@promethean-os/persistence');
      const { compileContext } = makeContextStore({
        getCollections: () => colls,
        resolveRole: deps.resolveRole,
        resolveDisplayName: deps.resolveName,
        formatTime: deps.formatTime,
      });
      return compileContext({ texts, recentLimit, queryLimit, limit });
    },
  };
};
```

### Actor Model Implementation

```typescript
// Actor Definition
interface Actor {
  id: string;
  script: ActorScript;
  state: ActorState;
  goals: Goal[];
  behaviors: Behavior[];
  talents: Talent[];
}

// Actor Factory
export const createActor = (config: ActorConfig): Actor => {
  const validatedConfig = ActorConfigSchema.parse(config);
  
  return {
    id: generateId(),
    script: createActorScript(validatedConfig),
    state: ActorState.IDLE,
    goals: validatedConfig.goals || [],
    behaviors: validatedConfig.behaviors || [],
    talents: validatedConfig.talents || [],
  };
};
```

## Local-First Architecture

### Night Mode Execution

Pantheon supports local-only execution with strict boundaries:

```typescript
// Night Mode Configuration
interface NightModeConfig {
  allowCloudFallback: boolean;
  maxToolCalls: number;
  timeoutMs: number;
  allowedTools: string[];
  blockedDomains: string[];
}

const nightModeOrchestrator = makeOrchestrator({
  config: {
    allowCloudFallback: false,
    maxToolCalls: 10,
    timeoutMs: 30000,
    allowedTools: ['local-file', 'test-runner', 'linter'],
    blockedDomains: ['api.openai.com', 'api.anthropic.com'],
  },
  // ... other dependencies
});
```

### Agent Specialization

Create hyper-specialized agents for specific tasks:

```typescript
// Specialized Agent Types
const createDocOpsAgent = (): Agent => ({
  name: 'doc-ops',
  capabilities: ['rename', 'frontmatter', 'normalize'],
  tools: ['file-rename', 'frontmatter-editor', 'markdown-linter'],
  model: 'qwen2.5-coder-7b', // Local model
  runtime: 'local',
});

const createCodeReviewAgent = (): Agent => ({
  name: 'code-review',
  capabilities: ['syntax-check', 'style-review', 'security-scan'],
  tools: ['ava-runner', 'eslint', 'semgrep'],
  model: 'qwen2.5-coder-7b',
  runtime: 'local',
});
```

## Security Implementation

### Input Validation and Sanitization

```typescript
import { z } from 'zod';

// Schema Definitions
export const ActorConfigSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  type: z.enum(['llm', 'tool', 'composite']),
  goal: z.string().min(1).max(500).trim(),
  config: z.record(z.unknown()).optional(),
  model: z.object({
    provider: z.string().min(1),
    name: z.string().min(1),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().optional(),
  }).optional(),
});

// Safe JSON Parsing
export const safeJsonParse = <T>(input: string, schema: z.ZodSchema<T>): T => {
  try {
    const parsed = JSON.parse(input);
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON format');
    }
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw new ValidationError('Input validation failed');
  }
};

// Input Sanitization
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove JS protocols
    .replace(/data:/gi, '') // Remove data URLs
    .trim();
};

export const sanitizeFilePath = (path: string): string => {
  const normalized = path.replace(/\.\./g, '').replace(/^\//, '');
  return normalized;
};
```

### Security Error Handling

```typescript
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
```

## Performance Optimization

### Continuous Batching

```typescript
// vLLM Integration for Efficient Local Inference
const createBatchedLLMAdapter = (config: BatchedLLMConfig): LlmPort => {
  const batchQueue: BatchRequest[] = [];
  let batchTimer: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    if (batchQueue.length === 0) return;

    const batch = batchQueue.splice(0);
    const responses = await vllm.complete({
      prompts: batch.map(req => req.prompt),
      max_tokens: Math.max(...batch.map(req => req.maxTokens)),
      temperature: config.temperature,
    });

    batch.forEach((req, index) => {
      req.resolve(responses[index]);
    });
  };

  return {
    complete: async (prompt: string, options: CompletionOptions) => {
      return new Promise((resolve) => {
        batchQueue.push({ prompt, resolve, ...options });
        
        if (!batchTimer) {
          batchTimer = setTimeout(processBatch, config.batchDelayMs);
        }
      });
    },
  };
};
```

### Context Caching

```typescript
// Context Compilation with Caching
class CachedContextCompiler {
  private cache = new Map<string, CompiledContext>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  async compile(request: ContextRequest): Promise<Message[]> {
    const key = this.generateCacheKey(request);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.messages;
    }

    const messages = await this.doCompile(request);
    this.cache.set(key, {
      messages,
      timestamp: Date.now(),
    });

    return messages;
  }

  private generateCacheKey(request: ContextRequest): string {
    return JSON.stringify({
      sources: request.sources.map(s => s.id).sort(),
      recentLimit: request.recentLimit,
      queryLimit: request.queryLimit,
    });
  }
}
```

## Testing Patterns

### Unit Testing with Mocks

```typescript
import test from 'ava';

// Mock Adapter for Testing
const createMockContextPort = (messages: Message[]): ContextPort => ({
  compile: async () => messages,
});

// Mock LLM Adapter
const createMockLLMPort = (responses: string[]): LlmPort => ({
  complete: async (prompt: string) => {
    return responses.shift() || 'Default response';
  },
});

test('actor execution with mocked dependencies', async (t) => {
  const mockContext = createMockContextPort([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ]);

  const mockLLM = createMockLLMPort(['Hi there! How can I help?']);

  const orchestrator = makeOrchestrator({
    context: mockContext,
    llm: mockLLM,
    // ... other mocked dependencies
  });

  const actor = createTestActor();
  const result = await orchestrator.tickActor(actor, { userMessage: 'Hello!' });

  t.is(result.response, 'Hi there! How can I help?');
});
```

### Integration Testing

```typescript
test('full context compilation pipeline', async (t) => {
  const testManagers = [
    await createTestDualStoreManager('sessions', [
      { id: '1', text: 'Hello', metadata: { role: 'user' } },
      { id: '2', text: 'Hi there!', metadata: { role: 'assistant' } },
    ]),
    await createTestDualStoreManager('tasks', [
      { id: '3', text: 'Task 1', metadata: { role: 'system' } },
    ]),
  ];

  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: () => Promise.resolve(testManagers),
  });

  const context = await adapter.compile({
    sources: [
      { id: 'sessions', label: 'Sessions' },
      { id: 'tasks', label: 'Tasks' },
    ],
  });

  t.is(context.length, 3);
  t.is(context[0].role, 'user');
  t.is(context[1].role, 'assistant');
  t.is(context[2].role, 'system');
});
```

## Error Handling Patterns

### Resilient Error Handling

```typescript
// Graceful Degradation
const getStoreManagers: async () => {
  try {
    const managers = await createAllManagers();
    return managers;
  } catch (error) {
    console.error('Failed to create some managers:', error);
    return await createEssentialManagers();
  }
};

// Safe Defaults
const resolveRole: (meta?: any) => {
  try {
    return customRoleLogic(meta);
  } catch (error) {
    console.warn('Role resolution failed, using default:', error);
    return 'system';
  }
};

// Validation Guards
const compile: async ({ sources, ...options }) => {
  if (!Array.isArray(sources)) {
    throw new Error('Sources must be an array');
  }

  if (sources.length === 0) {
    return [];
  }

  const validSources = sources.filter(source =>
    source.id && typeof source.id === 'string'
  );

  if (validSources.length === 0) {
    console.warn('No valid sources provided');
    return [];
  }

  return await processValidSources(validSources, options);
};
```

## CLI Integration

### Command Structure

```typescript
// CLI with Validation
program
  .command('actor:create')
  .argument('<type>', 'Actor type')
  .argument('<name>', 'Actor name')
  .option('--goal <goal>', 'Initial goal')
  .option('--config <config>', 'JSON configuration')
  .action(async (type, name, options) => {
    try {
      const validatedConfig = safeJsonParse(
        options.config || '{}', 
        ActorConfigSchema
      );
      
      const validatedGoal = sanitizeString(options.goal || 'Assist with tasks');
      
      const actor = await createActor({
        type,
        name: sanitizeString(name),
        goal: validatedGoal,
        config: validatedConfig
      });
      
      console.log(`Created actor: ${actor.id}`);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Validation error: ${error.message}`);
        process.exit(1);
      }
      throw error;
    }
  });
```

## Migration Patterns

### Package Consolidation

When migrating from agent-* to pantheon-* packages:

```typescript
// Compatibility Shim
// @promethean-os/agent-ecs
export * from '@promethean-os/pantheon-ecs';

if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '@promethean-os/agent-ecs is deprecated. ' +
      'Please migrate to @promethean-os/pantheon-ecs. ' +
      'See: https://docs.promethean.ai/migration/pantheon',
  );
}
```

### Gradual Migration

```typescript
// Migration Helper
export const migrateAgentConfig = (oldConfig: AgentConfig): PantheonConfig => {
  return {
    ...oldConfig,
    // Map old fields to new structure
    branding: 'pantheon',
    version: 'v1.0',
    capabilities: oldConfig.skills || [],
    runtime: oldConfig.runtime || 'local',
  };
};
```

## Best Practices

### 1. Type Safety

- Use Zod schemas for all external inputs
- Implement runtime type checking
- Provide clear error messages for validation failures

### 2. Security

- Sanitize all user inputs
- Validate file paths to prevent traversal
- Use allow-lists for tool access

### 3. Performance

- Implement caching for expensive operations
- Use batch processing for LLM calls
- Lazy-load resources when possible

### 4. Testing

- Mock external dependencies for unit tests
- Test error scenarios and edge cases
- Use integration tests for component interactions

### 5. Documentation

- Document all public APIs with JSDoc
- Provide usage examples
- Include troubleshooting guides

## Troubleshooting

### Common Issues

1. **Context Compilation Fails**
   - Check source IDs match manager names
   - Verify store managers are properly initialized
   - Ensure metadata structure is correct

2. **Actor Creation Errors**
   - Validate actor configuration against schema
   - Check required dependencies are available
   - Verify talent and behavior definitions

3. **Performance Issues**
   - Monitor context compilation times
   - Check cache hit rates
   - Profile LLM call patterns

### Debug Tools

```typescript
// Debug Logging
const createDebugAdapter = (baseAdapter: ContextPort): ContextPort => ({
  ...baseAdapter,
  compile: async (request) => {
    console.log('Context compilation request:', request);
    const start = Date.now();
    const result = await baseAdapter.compile(request);
    const duration = Date.now() - start;
    console.log(`Context compiled in ${duration}ms, ${result.length} messages`);
    return result;
  },
});
```

## Conclusion

This implementation guide provides the essential patterns and practices for building robust Pantheon applications. The key principles are:

1. **Security First**: Validate and sanitize all inputs
2. **Performance Aware**: Use caching and batching
3. **Test Thoroughly**: Mock dependencies and test edge cases
4. **Document Clearly**: Provide comprehensive API documentation
5. **Migrate Gradually**: Use compatibility shims for smooth transitions

By following these patterns, you can build scalable, secure, and maintainable Pantheon applications that leverage the full power of the framework while maintaining high code quality and reliability.