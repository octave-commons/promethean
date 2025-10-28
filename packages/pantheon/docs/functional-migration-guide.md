# Functional Framework Migration Guide

> _Comprehensive guide for migrating 70+ classes to functional patterns across the Promethean Pantheon codebase._

## Table of Contents

1. [Overview](#overview)
2. [Migration Patterns](#migration-patterns)
3. [Code Examples](#code-examples)
4. [Package-Specific Guidelines](#package-specific-guidelines)
5. [Best Practices](#best-practices)
6. [Implementation Checklist](#implementation-checklist)
7. [Testing Strategies](#testing-strategies)
8. [Backward Compatibility](#backward-compatibility)

---

## Overview

This guide provides standardized patterns for converting object-oriented code to functional programming patterns while maintaining code quality, test coverage, and backward compatibility.

### Migration Goals

- **Eliminate Classes**: Convert all OOP constructs to functional equivalents
- **Pure Functions**: Ensure all functions are pure with explicit inputs/outputs
- **Dependency Injection**: Replace implicit dependencies with explicit parameters
- **Type Safety**: Maintain strong TypeScript typing throughout migration
- **Test Coverage**: Preserve and improve test coverage during migration
- **Backward Compatibility**: Provide migration path without breaking existing code

### Scope

- **66+ Classes** across 8 packages require migration
- **State Package**: 15 classes (DefaultContextManager, JWTAuthService, etc.)
- **Protocol Package**: 9 classes (EnvelopeBuilder, MessageSigner, etc.)
- **Workflow Package**: 5 classes (OllamaModel, recovery managers)
- **ECS Package**: 2 classes (AgentTicker, AgentBus)
- **UI Package**: 3 classes (AgentList, AgentCard, StateManager)
- **Other Packages**: 32 classes across orchestrator, core, auth

---

## Migration Patterns

### Pattern 1: Class → Typeclass + Action Functions

**When to Use**: Classes with multiple related operations

**Template**:

```typescript
// BEFORE: Class-based approach
export class ExampleManager {
  private dependency: Dependency;
  private config: Config;

  constructor(dependency: Dependency, config: Config) {
    this.dependency = dependency;
    this.config = config;
  }

  async operation1(input: Input1): Promise<Output1> {
    // Implementation using this.dependency and this.config
  }

  async operation2(input: Input2): Promise<Output2> {
    // Implementation using this.dependency and this.config
  }
}

// AFTER: Functional approach
// Type: State interface
export interface ExampleManagerState {
  dependency: Dependency;
  config: Config;
}

// Factory: Create initial state
export const createExampleManagerState = (
  dependency: Dependency,
  config: Config,
): ExampleManagerState => ({
  dependency,
  config,
});

// Actions: Pure functions
export const operation1 = async (state: ExampleManagerState, input: Input1): Promise<Output1> => {
  // Implementation using state.dependency and state.config
};

export const operation2 = async (state: ExampleManagerState, input: Input2): Promise<Output2> => {
  // Implementation using state.dependency and state.config
};
```

### Pattern 2: Constructor → Factory Function

**When to Use**: Class constructors with dependency injection

**Template**:

```typescript
// BEFORE: Constructor
export class Service {
  private readonly dependency: Dependency;
  private readonly config: Config;

  constructor(dependency: Dependency, config?: Partial<Config>) {
    this.dependency = dependency;
    this.config = { ...defaultConfig, ...config };
  }
}

// AFTER: Factory function
export type ServiceDeps = {
  dependency: Dependency;
  config?: Partial<Config>;
};

export const createService = (deps: ServiceDeps = {}) => {
  const { dependency, config = {} } = deps;

  const finalConfig = { ...defaultConfig, ...config };

  return {
    // Service methods as functions
    operation: async (input: Input): Promise<Output> => {
      // Implementation using dependency and finalConfig
    },
  };
};
```

### Pattern 3: Method → Action Function

**When to Use**: Individual class methods

**Template**:

```typescript
// BEFORE: Method
export class Manager {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  async processData(data: Data): Promise<Result> {
    // Method implementation
  }
}

// AFTER: Action function
export type ProcessDataInput = {
  data: Data;
};

export type ProcessDataScope = {
  state: State;
};

export const processData = async (
  input: ProcessDataInput,
  scope: ProcessDataScope,
): Promise<Result> => {
  // Function implementation
};
```

### Pattern 4: Property → Input Parameter

**When to Use**: Class properties used in methods

**Template**:

```typescript
// BEFORE: Properties
export class Processor {
  private readonly validator: Validator;
  private readonly logger: Logger;

  constructor(validator: Validator, logger: Logger) {
    this.validator = validator;
    this.logger = logger;
  }

  process(item: Item): Result {
    this.validator.validate(item);
    this.logger.log('Processing item');
    // Processing logic
  }
}

// AFTER: Input parameters
export type ProcessItemInput = {
  item: Item;
};

export type ProcessItemScope = {
  validator: Validator;
  logger: Logger;
};

export const processItem = (input: ProcessItemInput, scope: ProcessItemScope): Result => {
  const { item } = input;
  const { validator, logger } = scope;

  validator.validate(item);
  logger.log('Processing item');
  // Processing logic
};
```

### Pattern 5: Data Transformation → Serializer

**When to Use**: Methods that convert data structures

**Template**:

```typescript
// BEFORE: Method in class
export class Transformer {
  toDto(entity: Entity): EntityDto {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  fromDto(dto: EntityDto): Entity {
    return {
      id: dto.id,
      name: dto.name,
      createdAt: new Date(dto.createdAt),
    };
  }
}

// AFTER: Serializer functions
export const serializeEntityToDto = (entity: Entity): EntityDto => ({
  id: entity.id,
  name: entity.name,
  createdAt: entity.createdAt.toISOString(),
});

export const deserializeDtoToEntity = (dto: EntityDto): Entity => ({
  id: dto.id,
  name: dto.name,
  createdAt: new Date(dto.createdAt),
});
```

---

## Code Examples

### Example 1: DefaultContextManager Migration

**Before (Class-based)**:

```typescript
export class DefaultContextManager implements ContextManager {
  private state: ContextManagerState;

  constructor(
    eventStore: EventStore,
    snapshotStore: SnapshotStore,
    snapshotInterval: number = 100,
  ) {
    this.state = createContextManagerState(eventStore, snapshotStore, snapshotInterval);
  }

  async getContext(agentId: string): Promise<AgentContext> {
    // Implementation using this.state
  }

  async updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    // Implementation using this.state
  }
}
```

**After (Functional)**:

```typescript
// State interface
export interface ContextManagerState {
  versionCounters: Map<string, number>;
  rateLimiter: RateLimiter;
  eventStore: EventStore;
  snapshotStore: SnapshotStore;
  snapshotInterval: number;
}

// Factory function
export const createContextManagerState = (
  eventStore: EventStore,
  snapshotStore: SnapshotStore,
  snapshotInterval: number = 100,
): ContextManagerState => ({
  versionCounters: new Map(),
  rateLimiter: RateLimiter.getInstance('context-manager', 60000, 100),
  eventStore,
  snapshotStore,
  snapshotInterval,
});

// Action functions
export const getContext = async (
  state: ContextManagerState,
  agentId: string,
): Promise<AgentContext> => {
  // Pure function implementation
};

export const updateContext = async (
  state: ContextManagerState,
  agentId: string,
  updates: Partial<AgentContext>,
): Promise<{ updatedContext: AgentContext; newState: ContextManagerState }> => {
  // Pure function implementation
};
```

### Example 2: JWTAuthService Migration

**Before (Class-based)**:

```typescript
export class JWTAuthService implements AuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiry: string;
  private revokedTokens: Set<string> = new Set();
  private rateLimiter: RateLimiter;

  constructor(configOrSecret?: string | AuthServiceConfig) {
    // Constructor logic
  }

  async generateToken(agentId: string, permissions: string[]): Promise<AuthToken> {
    // Method implementation
  }

  async validateToken(token: string): Promise<AuthToken | null> {
    // Method implementation
  }
}
```

**After (Functional)**:

```typescript
// Dependencies interface
export type AuthServiceDeps = {
  jwtSecret?: string;
  config?: AuthServiceConfig;
  id?: () => string;
  now?: () => Date;
  log?: (level: 'info' | 'warn' | 'error', message: string, data?: any) => void;
};

// Factory function
export const makeAuthService = (deps: AuthServiceDeps = {}) => {
  const {
    jwtSecret: secret = process.env.JWT_SECRET,
    config = {},
    id = () => uuidv4(),
    now = () => new Date(),
    log = () => {},
  } = deps;

  // State initialization
  const revokedTokens: Set<string> = new Set();
  const rateLimiter = RateLimiter.getInstance('auth-service', 60000, 3);

  // Service methods as functions
  return {
    generateToken: async (agentId: string, permissions: string[]): Promise<AuthToken> => {
      // Pure function implementation
    },

    validateToken: async (token: string): Promise<AuthToken | null> => {
      // Pure function implementation
    },
  };
};
```

### Example 3: EnvelopeBuilder Migration

**Before (Builder Pattern)**:

```typescript
export class EnvelopeBuilder {
  private envelope: Partial<MessageEnvelope> = {};

  constructor(type: string, sender: string, recipient: string) {
    this.envelope = { type, sender, recipient /* ... */ };
  }

  withPayload(payload: Record<string, any>): EnvelopeBuilder {
    this.envelope.payload = payload;
    return this;
  }

  withCorrelationId(correlationId: string): EnvelopeBuilder {
    this.envelope.correlationId = correlationId;
    return this;
  }

  build(): MessageEnvelope {
    // Build and validate
  }
}
```

**After (Functional Builder)**:

```typescript
// Base envelope type
export type EnvelopeBuilderState = {
  type: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  retryCount: number;
  maxRetries: number;
  correlationId?: string;
  replyTo?: string;
  ttl?: number;
  metadata?: Record<string, any>;
  payload?: Record<string, any>;
};

// Factory function
export const createEnvelopeBuilder = (
  type: string,
  sender: string,
  recipient: string,
): EnvelopeBuilderState => ({
  type,
  sender,
  recipient,
  timestamp: new Date(),
  priority: 'normal',
  retryCount: 0,
  maxRetries: 3,
});

// Builder functions
export const withPayload = (
  state: EnvelopeBuilderState,
  payload: Record<string, any>,
): EnvelopeBuilderState => ({
  ...state,
  payload,
});

export const withCorrelationId = (
  state: EnvelopeBuilderState,
  correlationId: string,
): EnvelopeBuilderState => ({
  ...state,
  correlationId,
});

export const withReplyTo = (
  state: EnvelopeBuilderState,
  replyTo: string,
): EnvelopeBuilderState => ({
  ...state,
  replyTo,
});

export const withPriority = (
  state: EnvelopeBuilderState,
  priority: 'low' | 'normal' | 'high' | 'urgent',
): EnvelopeBuilderState => ({
  ...state,
  priority,
});

export const withTTL = (state: EnvelopeBuilderState, ttl: number): EnvelopeBuilderState => ({
  ...state,
  ttl,
});

export const withMaxRetries = (
  state: EnvelopeBuilderState,
  maxRetries: number,
): EnvelopeBuilderState => ({
  ...state,
  maxRetries,
});

export const withMetadata = (
  state: EnvelopeBuilderState,
  metadata: Record<string, any>,
): EnvelopeBuilderState => ({
  ...state,
  metadata,
});

// Build function
export const buildEnvelope = (state: EnvelopeBuilderState): MessageEnvelope => {
  const envelope: MessageEnvelope = {
    id: uuidv4(),
    ...state,
  } as MessageEnvelope;

  // Validation
  if (!envelope.payload) {
    throw new Error('Message payload is required');
  }

  return envelope;
};
```

---

## Package-Specific Guidelines

### State Package Migration

#### Classes to Migrate:

- `DefaultContextManager` → `context-manager-functional.ts`
- `JWTAuthService` → `auth-service-functional.ts`
- `SecurityValidator` → `security-functional.ts`
- `RateLimiter` → `rate-limiter-functional.ts`
- `SecurityLogger` → `security-logger-functional.ts`
- `ApiKeyManager` → `api-key-manager-functional.ts`

#### Migration Strategy:

1. **Context Manager**: Already has functional implementation, create deprecated wrapper
2. **Auth Service**: Use factory pattern with dependency injection
3. **Security Components**: Convert to pure functions with explicit state
4. **Data Stores**: Convert to adapter pattern with functional interfaces

#### Directory Structure:

```
state/src/
├── functional/
│   ├── context-manager-functional.ts
│   ├── auth-service-functional.ts
│   ├── security-functional.ts
│   └── index.ts
├── adapters/
│   ├── postgres-event-store-adapter.ts
│   ├── postgres-snapshot-store-adapter.ts
│   └── index.ts
└── deprecated/
    ├── context-manager.ts
    ├── auth.ts
    └── index.ts
```

### Protocol Package Migration

#### Classes to Migrate:

- `EnvelopeBuilder` → `envelope-builder-functional.ts`
- `MessageSigner` → `message-signer-functional.ts`
- `MessageValidator` → `message-validator-functional.ts`
- `AMQPTransport` → `amqp-transport-functional.ts`
- `WebSocketTransport` → `websocket-transport-functional.ts`
- `BaseTransport` → `base-transport-functional.ts`

#### Migration Strategy:

1. **Envelope Builder**: Use functional builder pattern with immutable state
2. **Message Operations**: Convert to pure functions
3. **Transport Layer**: Use factory pattern with dependency injection
4. **Validation**: Convert to pure validation functions

#### Directory Structure:

```
protocol/src/
├── functional/
│   ├── envelope-builder-functional.ts
│   ├── message-signer-functional.ts
│   ├── message-validator-functional.ts
│   ├── transport-functional.ts
│   └── index.ts
├── adapters/
│   ├── amqp-transport-adapter.ts
│   ├── websocket-transport-adapter.ts
│   └── index.ts
└── deprecated/
    ├── envelope.ts
    ├── amqp-transport.ts
    └── index.ts
```

### Workflow Package Migration

#### Classes to Migrate:

- `OllamaModel` → `ollama-model-functional.ts`
- `OllamaModelProvider` → `ollama-provider-functional.ts`
- `DefaultRecoveryManager` → `recovery-manager-functional.ts`
- `DefaultWorkflowMonitor` → `workflow-monitor-functional.ts`
- `DefaultWorkflowHealer` → `workflow-healer-functional.ts`

#### Migration Strategy:

1. **Model Classes**: Convert to factory pattern with functional interfaces
2. **Provider Classes**: Use factory functions returning model creators
3. **Recovery/Healing**: Convert to pure functions with state management
4. **Monitoring**: Use functional observers with immutable state

#### Directory Structure:

```
workflow/src/
├── functional/
│   ├── ollama-model-functional.ts
│   ├── ollama-provider-functional.ts
│   ├── recovery-functional.ts
│   ├── monitoring-functional.ts
│   └── index.ts
├── providers/
│   └── ollama-provider-adapter.ts
└── deprecated/
    ├── ollama.ts
    ├── healing/
    └── index.ts
```

### ECS Package Migration

#### Classes to Migrate:

- `AgentTicker` → `agent-ticker-functional.ts`
- `AgentBus` → `agent-bus-functional.ts`

#### Migration Strategy:

1. **Agent Ticker**: Convert to functional system with state management
2. **Agent Bus**: Use functional message passing with immutable state
3. **World Management**: Maintain ECS world as external dependency

#### Directory Structure:

```
ecs/src/
├── functional/
│   ├── agent-ticker-functional.ts
│   ├── agent-bus-functional.ts
│   └── index.ts
├── systems/
│   └── (existing systems)
└── deprecated/
    ├── world.ts
    ├── bus.ts
    └── index.ts
```

---

## Best Practices

### 1. Dependency Injection Patterns

**Explicit Dependencies**:

```typescript
// Good: Explicit dependencies
export const processData = (
  input: ProcessInput,
  scope: {
    validator: Validator;
    logger: Logger;
    repository: Repository;
  },
): Promise<ProcessOutput> => {
  // Implementation
};

// Avoid: Hidden dependencies
export const processData = (input: ProcessInput): Promise<ProcessOutput> => {
  const validator = new Validator(); // Hidden dependency
  // Implementation
};
```

**Factory Pattern for Services**:

```typescript
export const createService = (deps: ServiceDependencies) => {
  const { database, logger, config = {} } = deps;

  return {
    operation: async (input: Input): Promise<Output> => {
      logger.log('Starting operation');
      const result = await database.query(input);
      return result;
    },
  };
};
```

### 2. State Management

**Immutable State Updates**:

```typescript
// Good: Immutable updates
export const updateState = (state: State, updates: Partial<State>): State => ({
  ...state,
  ...updates,
  updatedAt: new Date(),
});

// Avoid: Mutable state
export const updateState = (state: State, updates: Partial<State>): void => {
  Object.assign(state, updates);
  state.updatedAt = new Date();
};
```

**State Transition Functions**:

```typescript
export type StateTransition<T> = (
  currentState: T,
  input: any,
) => {
  nextState: T;
  result: any;
  events: Event[];
};

export const processEvent: StateTransition<AgentState> = (currentState, event) => {
  const nextState = applyEvent(currentState, event);
  const result = generateResult(event);
  const events = [event];

  return { nextState, result, events };
};
```

### 3. Error Handling

**Result Types**:

```typescript
export type Result<T, E = Error> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

export const safeOperation = async (input: Input): Promise<Result<Output>> => {
  try {
    const result = await riskyOperation(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
```

**Validation Functions**:

```typescript
export const validateInput = (
  input: unknown,
): { valid: true; data: ValidatedInput } | { valid: false; errors: string[] } => {
  const errors = [];

  if (!input || typeof input !== 'object') {
    errors.push('Input must be an object');
    return { valid: false, errors };
  }

  // Additional validation logic

  return { valid: true, data: input as ValidatedInput };
};
```

### 4. Type Safety

**Strong Typing for Functions**:

```typescript
// Good: Explicit types
export const processUser = async (
  input: ProcessUserInput,
  scope: ProcessUserScope,
): Promise<ProcessUserOutput> => {
  // Implementation
};

// Avoid: Implicit any types
export const processUser = async (input: any, scope: any): Promise<any> => {
  // Implementation
};
```

**Generic Functions**:

```typescript
export const createRepository = <T>(client: DatabaseClient, tableName: string) => {
  return {
    findById: async (id: string): Promise<T | null> => {
      const result = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      return result.rows[0] || null;
    },

    save: async (entity: T): Promise<T> => {
      const result = await client.query(`INSERT INTO ${tableName} ...`, [entity]);
      return result.rows[0];
    },
  };
};
```

### 5. Testing Patterns

**Pure Function Testing**:

```typescript
import test from 'ava';

test('processData returns correct result', async (t) => {
  const input = { data: 'test' };
  const scope = {
    validator: { validate: () => true },
    logger: { log: () => {} },
    repository: { find: async () => ({ id: '1', value: 'test' }) },
  };

  const result = await processData(input, scope);

  t.is(result.success, true);
  t.is(result.data.value, 'test');
});
```

**Mock Dependencies**:

```typescript
test('processData handles validation errors', async (t) => {
  const input = { data: 'invalid' };
  const scope = {
    validator: { validate: () => false },
    logger: { log: () => {} },
    repository: { find: async () => null },
  };

  const result = await processData(input, scope);

  t.is(result.success, false);
  t.true(result.error.message.includes('validation'));
});
```

---

## Implementation Checklist

### Phase 1: Preparation

#### 1.1 Analysis

- [ ] Identify all classes in target package
- [ ] Document class dependencies and relationships
- [ ] Identify shared utilities and helpers
- [ ] Create migration plan with priorities

#### 1.2 Setup

- [ ] Create `functional/` directory structure
- [ ] Set up barrel exports (`index.ts`)
- [ ] Create type definitions for functional interfaces
- [ ] Set up test structure for functional implementations

#### 1.3 Dependencies

- [ ] Identify external dependencies
- [ ] Create adapter interfaces for external services
- [ ] Document dependency injection requirements
- [ ] Set up factory function signatures

### Phase 2: Core Migration

#### 2.1 State Management

- [ ] Define state interfaces for each class
- [ ] Create factory functions for initial state
- [ ] Implement state transition functions
- [ ] Add state validation and sanitization

#### 2.2 Function Conversion

- [ ] Convert each method to pure function
- [ ] Add explicit input/output types
- [ ] Implement dependency injection via scope parameter
- [ ] Add comprehensive error handling

#### 2.3 Factory Functions

- [ ] Create factory functions for complex objects
- [ ] Implement dependency injection patterns
- [ ] Add configuration management
- [ ] Include initialization logic

### Phase 3: Integration

#### 3.1 Barrel Exports

- [ ] Create clean public APIs
- [ ] Export all functional implementations
- [ ] Maintain backward compatibility exports
- [ ] Document new functional interfaces

#### 3.2 Migration Support

- [ ] Create deprecated wrapper classes
- [ ] Add migration warnings and deprecation notices
- [ ] Provide migration guides for consumers
- [ ] Set up gradual migration path

#### 3.3 Testing

- [ ] Write comprehensive tests for functional implementations
- [ ] Test all error scenarios and edge cases
- [ ] Verify backward compatibility
- [ ] Add integration tests

### Phase 4: Cleanup

#### 4.1 Documentation

- [ ] Update API documentation
- [ ] Create migration guides
- [ ] Add examples and usage patterns
- [ ] Document breaking changes

#### 4.2 Validation

- [ ] Run full test suite
- [ ] Verify type checking
- [ ] Check code coverage
- [ ] Performance testing

#### 4.3 Finalization

- [ ] Remove deprecated classes (if applicable)
- [ ] Update package exports
- [ ] Version bump and changelog
- [ ] Communicate changes to team

---

## Testing Strategies

### 1. Unit Testing Functional Code

#### Pure Function Testing

```typescript
// Test file: src/tests/functional/context-manager.test.ts
import test from 'ava';
import {
  getContext,
  updateContext,
  createContextManagerState,
} from '../../functional/context-manager-functional.js';
import { createMockEventStore, createMockSnapshotStore } from '../fixtures/mocks.js';

test('getContext returns agent context from snapshot', async (t) => {
  // Arrange
  const eventStore = createMockEventStore();
  const snapshotStore = createMockSnapshotStore();
  const state = createContextManagerState(eventStore, snapshotStore);
  const agentId = 'agent-123';

  // Act
  const result = await getContext(state, agentId);

  // Assert
  t.is(result.agentId, agentId);
  t.true(typeof result.version === 'number');
  t.true(result.state instanceof Object);
});
```

#### State Transition Testing

```typescript
test('updateContext returns updated context and new state', async (t) => {
  // Arrange
  const eventStore = createMockEventStore();
  const snapshotStore = createMockSnapshotStore();
  const state = createContextManagerState(eventStore, snapshotStore);
  const agentId = 'agent-123';
  const updates = { status: 'active' };

  // Act
  const result = await updateContext(state, agentId, updates);

  // Assert
  t.is(result.updatedContext.status, 'active');
  t.true(result.updatedContext.version > 0);
  t.not(result.newState, state); // State should be immutable
});
```

### 2. Integration Testing

#### End-to-End Testing

```typescript
test('full context management workflow', async (t) => {
  // Arrange
  const eventStore = createMockEventStore();
  const snapshotStore = createMockSnapshotStore();
  const state = createContextManagerState(eventStore, snapshotStore);
  const agentId = 'agent-123';

  // Act & Assert - Create context
  const initialContext = await getContext(state, agentId);
  t.is(initialContext.agentId, agentId);

  // Act & Assert - Update context
  const updateResult = await updateContext(state, agentId, { status: 'active' });
  t.is(updateResult.updatedContext.status, 'active');

  // Act & Assert - Get updated context
  const updatedContext = await getContext(state, agentId);
  t.is(updatedContext.status, 'active');
});
```

### 3. Mock Strategy

#### Mock Factories

```typescript
// Test fixture: src/tests/fixtures/mocks.ts
export const createMockEventStore = (): EventStore => ({
  appendEvent: async (event) => {
    // Mock implementation
    return event;
  },
  getEvents: async (agentId) => {
    // Mock implementation
    return [];
  },
});

export const createMockSnapshotStore = (): SnapshotStore => ({
  saveSnapshot: async (snapshot) => {
    // Mock implementation
    return snapshot;
  },
  getSnapshot: async (snapshotId) => {
    // Mock implementation
    return null;
  },
  getLatestSnapshot: async (agentId) => {
    // Mock implementation
    return null;
  },
});
```

#### Dependency Injection Testing

```typescript
test('function with injected dependencies', async (t) => {
  // Arrange
  const mockValidator = {
    validate: (input: any) => input.isValid,
  };

  const mockLogger = {
    log: (message: string) => {
      t.pass(); // Verify logging occurred
    },
  };

  const input = { data: 'test', isValid: true };
  const scope = { validator: mockValidator, logger: mockLogger };

  // Act
  const result = await processData(input, scope);

  // Assert
  t.true(result.success);
});
```

### 4. Performance Testing

#### Benchmarking Functional Code

```typescript
import { performance } from 'perf_hooks';

test('performance comparison: class vs functional', async (t) => {
  const iterations = 10000;

  // Class-based implementation
  const classStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const manager = new DefaultContextManager(eventStore, snapshotStore);
    await manager.getContext(`agent-${i}`);
  }
  const classTime = performance.now() - classStart;

  // Functional implementation
  const state = createContextManagerState(eventStore, snapshotStore);
  const functionalStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await getContext(state, `agent-${i}`);
  }
  const functionalTime = performance.now() - functionalStart;

  // Assert performance is comparable
  t.true(functionalTime < classTime * 1.5); // Allow 50% overhead
});
```

---

## Backward Compatibility

### 1. Deprecated Wrapper Classes

#### Wrapper Pattern

```typescript
/**
 * @deprecated Use functional implementations from './functional/context-manager-functional.js' instead.
 * This class is provided for backward compatibility and will be removed in v2.0.0.
 */
export class DefaultContextManager implements ContextManager {
  private state: ContextManagerState;

  constructor(
    eventStore: EventStore,
    snapshotStore: SnapshotStore,
    snapshotInterval: number = 100,
  ) {
    console.warn(
      'DefaultContextManager is deprecated. Use createContextManagerState and functional operations instead.',
    );
    this.state = createContextManagerState(eventStore, snapshotStore, snapshotInterval);
  }

  async getContext(agentId: string): Promise<AgentContext> {
    console.warn(
      'DefaultContextManager.getContext is deprecated. Use getContext from functional implementation instead.',
    );
    return getContext(this.state, agentId);
  }

  async updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    console.warn(
      'DefaultContextManager.updateContext is deprecated. Use updateContext from functional implementation instead.',
    );
    const result = await updateContext(this.state, agentId, updates);
    this.state = result.newState;
    return result.updatedContext;
  }
}
```

### 2. Migration Utilities

#### Migration Helper Functions

```typescript
// Migration utilities for gradual transition
export const migrateFromClass = (classInstance: DeprecatedClass): FunctionalState => {
  // Extract state from class instance
  return {
    // Convert class properties to functional state
  };
};

export const createBackwardCompatibleAdapter = (
  functionalImplementation: FunctionalImplementation,
): DeprecatedInterface => {
  return {
    // Wrap functional implementation in class interface
    oldMethod: async (...args) => {
      console.warn('Method is deprecated, use functional equivalent');
      return functionalImplementation.newMethod(...args);
    },
  };
};
```

### 3. Version Management

#### Semantic Versioning Strategy

```typescript
// package.json versioning strategy
{
  "version": "1.0.0", // Current version with deprecated classes
  // "version": "1.1.0", // Add functional implementations alongside deprecated
  // "version": "1.2.0", // Add migration warnings
  // "version": "2.0.0", // Remove deprecated classes
}
```

#### Deprecation Timeline

```typescript
// Deprecation warnings with timeline
const deprecationWarning = (methodName: string, removalVersion: string) => {
  const currentDate = new Date();
  const removalDate = new Date('2024-12-31'); // Example removal date

  if (currentDate > removalDate) {
    throw new Error(`${methodName} has been removed as of ${removalVersion}`);
  }

  console.warn(
    `${methodName} is deprecated and will be removed in ${removalVersion}. ` +
      `Please migrate to the functional implementation.`,
  );
};
```

### 4. Documentation and Communication

#### Migration Guide Template

````markdown
# Migration Guide: [Package Name] v1.x to v2.x

## Overview

This package is migrating from class-based to functional programming patterns.

## Breaking Changes

- Classes have been replaced with functional equivalents
- Constructor patterns replaced with factory functions
- Method calls replaced with function calls

## Migration Steps

### Before (v1.x)

```typescript
const manager = new DefaultContextManager(eventStore, snapshotStore);
const context = await manager.getContext(agentId);
```
````

### After (v2.x)

```typescript
const state = createContextManagerState(eventStore, snapshotStore);
const context = await getContext(state, agentId);
```

## Timeline

- v1.0.0: Initial release with classes
- v1.5.0: Add functional implementations alongside classes
- v1.8.0: Add deprecation warnings
- v2.0.0: Remove deprecated classes

## Support

For migration assistance, see [examples](./examples/) or open an issue.

```

---

## Conclusion

This migration guide provides a comprehensive framework for converting the Promethean Pantheon codebase from object-oriented to functional programming patterns. By following these patterns, checklists, and best practices, teams can systematically migrate 70+ classes while maintaining code quality, test coverage, and backward compatibility.

### Key Success Factors

1. **Systematic Approach**: Follow the phased migration plan to ensure thoroughness
2. **Testing**: Maintain comprehensive test coverage throughout migration
3. **Documentation**: Keep documentation updated with migration progress
4. **Communication**: Clearly communicate changes and timelines to consumers
5. **Quality**: Ensure functional implementations meet or exceed existing quality standards

### Expected Benefits

- **Improved Testability**: Pure functions are easier to test and mock
- **Better Composability**: Functions can be easily combined and reused
- **Enhanced Type Safety**: Explicit contracts for all operations
- **Reduced Complexity**: Elimination of hidden state and side effects
- **Easier Refactoring**: Functional code is more modular and maintainable

By following this guide, the migration to functional patterns will result in a more robust, maintainable, and testable codebase that aligns with modern functional programming best practices.
```
