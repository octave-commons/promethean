# Pantheon State

> **Agent State Management via Event Sourcing** - Functional state management for agent lifecycle, events, and snapshots

## Overview

`@promethean-os/pantheon-state` provides a comprehensive event sourcing system for managing **agent state** (not conversation context). It implements functional dependency injection patterns and provides both modern functional APIs and legacy class-based compatibility.

**Key Distinction**: This package manages **agent state** (events, snapshots, lifecycle), while `@promethean-os/persistence` handles **conversation context** compilation.

## Architecture

### Core Components

```mermaid
graph TB
    A[Agent State Manager] --> B[Event Store]
    A --> C[Snapshot Store]
    A --> D[Context Manager]

    B --> E[PostgreSQL/LevelDB]
    C --> E
    D --> F[Context Lifecycle]
    D --> G[Context Sharing]
    D --> H[Context Metadata]

    I[Actor State Port] --> A
    J[Auth Service] --> A

    subgraph "Functional APIs"
        K[makeAgentStateManager]
        L[makeActorStatePort]
        M[makeAuthService]
    end

    K --> A
    L --> I
    M --> J
```

### Data Flow

1. **Events** are appended to the event store
2. **Snapshots** are created at intervals for performance
3. **Context** is reconstructed from events + latest snapshot
4. **Actors** are managed through the state port interface

## Installation

```bash
pnpm add @promethean-os/pantheon-state
```

## Quick Start

### Functional Approach (Recommended)

```typescript
import { makeAgentStateManager } from '@promethean-os/pantheon-state';
import { PostgresEventStore } from '@promethean-os/pantheon-state';
import { PostgresSnapshotStore } from '@promethean-os/pantheon-state';

// Create dependencies
const eventStore = new PostgresEventStore(dbConnection);
const snapshotStore = new PostgresSnapshotStore(dbConnection);

// Create state manager
const stateManager = makeAgentStateManager({
  eventStore,
  snapshotStore,
  snapshotInterval: 100, // Create snapshot every 100 events
});

// Use the state manager
const context = await stateManager.getContext('agent-123');
const updated = await stateManager.updateContext('agent-123', {
  state: { status: 'active', lastSeen: new Date() },
});
```

### Actor State Port (Pantheon Compatibility)

```typescript
import { makeActorStatePort } from '@promethean-os/pantheon-state';

const actorPort = makeActorStatePort({
  eventStore,
  snapshotStore,
});

// Spawn a new actor
const actor = await actorPort.spawn(
  {
    name: 'DataProcessor',
    contextSources: [{ id: 'database', label: 'Main Database' }],
    talents: [
      {
        name: 'processing',
        behaviors: [
          {
            name: 'process-data',
            mode: 'active',
            plan: async ({ goal, context }) => ({
              actions: [{ type: 'process', data: context[0] }],
            }),
          },
        ],
      },
    ],
  },
  'Process incoming data',
);

// Get actor details
const retrieved = await actorPort.get(actor.id);
```

## Core APIs

### Agent State Manager

```typescript
interface AgentStateManager {
  getContext(agentId: string): Promise<AgentContext>;
  updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext>;
  appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent>;
  createSnapshot(agentId: string): Promise<ContextSnapshot>;
  restoreFromSnapshot(snapshotId: string): Promise<AgentContext>;
  deleteContext(agentId: string): Promise<void>;
  getContextHistory(agentId: string, limit?: number): Promise<ContextEvent[]>;
}
```

#### Usage Examples

**Getting Agent Context**

```typescript
const context = await stateManager.getContext('agent-123');
console.log(context.state); // Agent's current state
console.log(context.version); // Current version number
```

**Updating Context**

```typescript
const updated = await stateManager.updateContext('agent-123', {
  state: {
    ...context.state,
    status: 'processing',
    currentTask: 'data-analysis',
  },
});
```

**Appending Events**

```typescript
const event = await stateManager.appendEvent({
  type: 'task.completed',
  agentId: 'agent-123',
  data: {
    taskId: 'task-456',
    result: 'success',
    duration: 1500,
  },
  metadata: {
    source: 'worker-pool',
    priority: 'high',
  },
});
```

**Managing Snapshots**

```typescript
// Create manual snapshot
const snapshot = await stateManager.createSnapshot('agent-123');

// Restore from snapshot
const restored = await stateManager.restoreFromSnapshot(snapshot.id);

// Get event history
const history = await stateManager.getContextHistory('agent-123', 50);
```

### Event Store Interface

```typescript
interface EventStore {
  appendEvent(event: ContextEvent): Promise<void>;
  getEvents(agentId: string, fromVersion?: number): Promise<ContextEvent[]>;
  getEvent(eventId: string): Promise<ContextEvent | null>;
}
```

#### PostgreSQL Implementation

```typescript
import { PostgresEventStore } from '@promethean-os/pantheon-state';

const eventStore = new PostgresEventStore({
  connectionString: 'postgresql://user:pass@localhost/pantheon',
  tableName: 'agent_events',
});

// Append events
await eventStore.appendEvent({
  id: 'event-123',
  type: 'state.changed',
  agentId: 'agent-456',
  timestamp: new Date(),
  data: { oldState: 'idle', newState: 'active' },
});

// Query events
const events = await eventStore.getEvents('agent-456', 100);
```

### Snapshot Store Interface

```typescript
interface SnapshotStore {
  saveSnapshot(snapshot: ContextSnapshot): Promise<void>;
  getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null>;
  getSnapshot(snapshotId: string): Promise<ContextSnapshot | null>;
}
```

#### PostgreSQL Implementation

```typescript
import { PostgresSnapshotStore } from '@promethean-os/pantheon-state';

const snapshotStore = new PostgresSnapshotStore({
  connectionString: 'postgresql://user:pass@localhost/pantheon',
  tableName: 'agent_snapshots',
});

// Save snapshot
await snapshotStore.saveSnapshot({
  id: 'snapshot-123',
  agentId: 'agent-456',
  timestamp: new Date(),
  state: { status: 'active', tasks: 5 },
  version: 150,
  eventId: 'event-789',
});

// Get latest snapshot
const latest = await snapshotStore.getLatestSnapshot('agent-456');
```

## Authentication & Security

### JWT Auth Service

```typescript
import { makeAuthService, JWTAuthService } from '@promethean-os/pantheon-state';

const authService = makeAuthService({
  jwtSecret: process.env.JWT_SECRET!,
  tokenExpiry: '24h',
});

// Generate token
const token = await authService.generateToken('agent-123', ['read', 'write']);

// Validate token
const validated = await authService.validateToken(token.token);

// Revoke token
await authService.revokeToken(token.token);
```

### Context Sharing

```typescript
import { ContextSharingService } from '@promethean-os/pantheon-state';

const sharingService = new ContextSharingService(shareStore);

// Share context with another agent
const share = await sharingService.shareContext({
  sourceAgentId: 'agent-123',
  targetAgentId: 'agent-456',
  contextSnapshotId: 'snapshot-789',
  shareType: 'read',
  permissions: { canView: true, canEdit: false },
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});

// Get shared contexts
const shared = await sharingService.getSharedContexts('agent-456');
```

## Context Metadata Management

```typescript
import { ContextMetadataService } from '@promethean-os/pantheon-state';

const metadataService = new ContextMetadataService(metadataStore);

// Set metadata
await metadataService.setMetadata({
  agentId: 'agent-123',
  contextKey: 'preferences',
  contextValue: { theme: 'dark', language: 'en' },
  contextType: 'user-preferences',
  visibility: 'private',
});

// Get metadata
const preferences = await metadataService.getMetadata('agent-123', 'preferences');

// Query metadata
const allPrivate = await metadataService.queryMetadata({
  agentId: 'agent-123',
  visibility: 'private',
});
```

## Context Lifecycle Management

```typescript
import { ContextLifecycleManager } from '@promethean-os/pantheon-state';

const lifecycleManager = new ContextLifecycleManager(stateManager, metadataService);

// Create new context
const context = await lifecycleManager.createContext('agent-123', {
  status: 'initialized',
  capabilities: ['data-processing', 'analysis'],
});

// Get statistics
const stats = await lifecycleManager.getContextStatistics('agent-123');
console.log(`Total events: ${stats.totalEvents}`);
console.log(`Context size: ${stats.contextSize} bytes`);

// Archive context
await lifecycleManager.archiveContext('agent-123');

// Cleanup expired contexts
await lifecycleManager.cleanupExpiredContexts();
```

## Data Types

### Context Event

```typescript
interface ContextEvent {
  id: string;
  type: string;
  agentId: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}
```

### Context Snapshot

```typescript
interface ContextSnapshot {
  id: string;
  agentId: string;
  timestamp: Date;
  state: Record<string, any>;
  version: number;
  eventId: string;
}
```

### Agent Context

```typescript
interface AgentContext {
  id: string;
  agentId: string;
  state: Record<string, any>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}
```

## Advanced Patterns

### Event Sourcing with Snapshots

```typescript
class OptimizedStateManager {
  constructor(
    private stateManager: AgentStateManager,
    private snapshotInterval: number = 100,
  ) {}

  async updateWithSnapshot(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    const updated = await this.stateManager.updateContext(agentId, updates);

    // Create snapshot every N events
    if (updated.version % this.snapshotInterval === 0) {
      await this.stateManager.createSnapshot(agentId);
    }

    return updated;
  }

  async getOptimizedContext(agentId: string): Promise<AgentContext> {
    try {
      // Try to get latest snapshot first
      const snapshots = await this.stateManager.snapshotStore.getLatestSnapshot(agentId);

      if (snapshots) {
        // Restore from snapshot and apply recent events
        return await this.stateManager.restoreFromSnapshot(snapshots.id);
      }
    } catch (error) {
      console.warn('Snapshot restoration failed, using full event history');
    }

    // Fallback to full event history
    return await this.stateManager.getContext(agentId);
  }
}
```

### Multi-Agent Coordination

```typescript
class CoordinatorState {
  constructor(private stateManager: AgentStateManager) {}

  async coordinateAgents(coordinatorId: string, agentIds: string[], task: any): Promise<void> {
    // Create coordination event
    await this.stateManager.appendEvent({
      type: 'coordination.started',
      agentId: coordinatorId,
      data: { participants: agentIds, task },
    });

    // Update each agent's context
    for (const agentId of agentIds) {
      await this.stateManager.updateContext(agentId, {
        state: {
          coordinationId: coordinatorId,
          task,
          status: 'coordinated',
        },
      });
    }
  }
}
```

## Testing

### Unit Testing with Mocks

```typescript
import { test } from 'ava';
import { makeAgentStateManager } from '@promethean-os/pantheon-state';

test('agent state manager - context operations', async (t) => {
  const mockEventStore = {
    appendEvent: async () => {},
    getEvents: async () => [],
    getEvent: async () => null,
  };

  const mockSnapshotStore = {
    saveSnapshot: async () => {},
    getLatestSnapshot: async () => null,
    getSnapshot: async () => null,
  };

  const stateManager = makeAgentStateManager({
    eventStore: mockEventStore,
    snapshotStore: mockSnapshotStore,
  });

  // Test context operations
  const event = await stateManager.appendEvent({
    type: 'test.event',
    agentId: 'test-agent',
    data: { test: true },
  });

  t.truthy(event.id);
  t.is(event.type, 'test.event');
});
```

## Performance Considerations

### Snapshot Strategy

```typescript
// Configure optimal snapshot intervals based on event volume
const config = {
  highVolume: { snapshotInterval: 50 }, // Every 50 events
  mediumVolume: { snapshotInterval: 100 }, // Every 100 events
  lowVolume: { snapshotInterval: 500 }, // Every 500 events
};

const stateManager = makeAgentStateManager({
  eventStore,
  snapshotStore,
  snapshotInterval: config.mediumVolume.snapshotInterval,
});
```

### Event Batching

```typescript
class BatchEventProcessor {
  constructor(
    private stateManager: AgentStateManager,
    private batchSize: number = 10,
  ) {}

  private eventBatch: Omit<ContextEvent, 'id' | 'timestamp'>[] = [];

  async addEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<void> {
    this.eventBatch.push(event);

    if (this.eventBatch.length >= this.batchSize) {
      await this.flushBatch();
    }
  }

  private async flushBatch(): Promise<void> {
    const batch = this.eventBatch.splice(0);

    await Promise.all(batch.map((event) => this.stateManager.appendEvent(event)));
  }

  async flush(): Promise<void> {
    if (this.eventBatch.length > 0) {
      await this.flushBatch();
    }
  }
}
```

## Migration from Legacy APIs

### From Class-based to Functional

```typescript
// Old approach (deprecated)
import { DefaultContextManager } from '@promethean-os/pantheon-state';

const manager = new DefaultContextManager(eventStore, snapshotStore);

// New functional approach
import { makeAgentStateManager } from '@promethean-os/pantheon-state';

const stateManager = makeAgentStateManager({
  eventStore,
  snapshotStore,
});
```

### Migration Helper

```typescript
function migrateToFunctional(legacyManager: DefaultContextManager): AgentStateManager {
  return {
    getContext: legacyManager.getContext.bind(legacyManager),
    updateContext: legacyManager.updateContext.bind(legacyManager),
    appendEvent: legacyManager.appendEvent.bind(legacyManager),
    createSnapshot: legacyManager.createSnapshot.bind(legacyManager),
    restoreFromSnapshot: legacyManager.restoreFromSnapshot.bind(legacyManager),
    deleteContext: legacyManager.deleteContext.bind(legacyManager),
    getContextHistory: legacyManager.getContextHistory.bind(legacyManager),
  };
}
```

## Best Practices

### 1. Event Design

```typescript
// Good: Specific, typed events
const userEvent = {
  type: 'user.profile.updated',
  agentId: 'user-123',
  data: {
    field: 'email',
    oldValue: 'old@example.com',
    newValue: 'new@example.com',
  },
};

// Avoid: Generic, untyped events
const badEvent = {
  type: 'data.changed',
  agentId: 'user-123',
  data: { changes: 'some random data' },
};
```

### 2. Snapshot Strategy

```typescript
// Configure based on access patterns
const snapshotConfig = {
  // Frequently accessed agents
  activeAgents: { interval: 50 },

  // Moderately accessed agents
  regularAgents: { interval: 200 },

  // Rarely accessed agents
  archiveAgents: { interval: 1000 },
};
```

### 3. Error Handling

```typescript
async function safeContextOperation(
  stateManager: AgentStateManager,
  agentId: string,
  operation: () => Promise<any>,
): Promise<any> {
  try {
    return await operation();
  } catch (error) {
    // Log the error
    console.error(`Context operation failed for agent ${agentId}:`, error);

    // Try to restore from latest snapshot
    try {
      const snapshots = await stateManager.snapshotStore.getLatestSnapshot(agentId);

      if (snapshots) {
        return await stateManager.restoreFromSnapshot(snapshots.id);
      }
    } catch (restoreError) {
      console.error('Snapshot restoration also failed:', restoreError);
    }

    throw error;
  }
}
```

## Troubleshooting

### Common Issues

1. **Context Not Found**

   ```typescript
   // Check if context exists before operations
   try {
     const context = await stateManager.getContext(agentId);
   } catch (error) {
     if (error.message.includes('not found')) {
       // Create new context
       await stateManager.updateContext(agentId, { state: {} });
     }
   }
   ```

2. **Snapshot Restoration Fails**

   ```typescript
   // Implement fallback to full event history
   async function getContextWithFallback(agentId: string): Promise<AgentContext> {
     try {
       const snapshot = await snapshotStore.getLatestSnapshot(agentId);
       if (snapshot) {
         return await stateManager.restoreFromSnapshot(snapshot.id);
       }
     } catch (error) {
       console.warn('Snapshot failed, using event history');
     }

     return await stateManager.getContext(agentId);
   }
   ```

3. **Event Store Performance**
   ```typescript
   // Implement event pagination for large histories
   async function getEventHistory(
     agentId: string,
     limit: number = 100,
     offset: number = 0,
   ): Promise<ContextEvent[]> {
     const allEvents = await stateManager.getContextHistory(agentId);
     return allEvents.slice(offset, offset + limit);
   }
   ```

## Related Documentation

- [[pantheon-core]] - Core actor model and context engine
- [[pantheon-persistence]] - Conversation context management
- [[pantheon-protocol]] - Message transport and serialization
- [[pantheon-orchestrator]] - Multi-agent coordination

## License

GPL-3.0-only - see [[LICENSE]] for details.
