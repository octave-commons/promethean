# Pantheon Persistence Quick Reference

A quick reference guide for [pantheon-persistence](../packages/pantheon/pantheon-persistence.md) package.

## Core API

### makePantheonPersistenceAdapter

```typescript
function makePantheonPersistenceAdapter(deps: PersistenceAdapterDeps): ContextPort;
```

**Purpose**: Creates a ContextPort implementation that bridges Pantheon with persistence layer.

## PersistenceAdapterDeps Interface

```typescript
interface PersistenceAdapterDeps {
  getStoreManagers: () => Promise<DualStoreManager[]>;
  resolveRole?: (meta?: any) => 'system' | 'user' | 'assistant';
  resolveName?: (meta?: any) => string;
  formatTime?: (ms: number) => string;
}
```

### Required Properties

#### getStoreManagers

```typescript
getStoreManagers: () => Promise<DualStoreManager[]>;
```

Returns array of DualStoreManager instances for context compilation.

### Optional Properties

#### resolveRole (Default: System Logic)

```typescript
resolveRole?: (meta?: any) => 'system' | 'user' | 'assistant'
```

Determines message role from metadata.

**Default Implementation**:

```typescript
(meta) => {
  if (meta?.role) return meta.role;
  if (meta?.type === 'user') return 'user';
  if (meta?.type === 'assistant') return 'assistant';
  return 'system';
};
```

#### resolveName (Default: Field Priority)

```typescript
resolveName?: (meta?: any) => string
```

Resolves display name from metadata.

**Default Implementation**:

```typescript
(meta) => {
  return meta?.displayName || meta?.name || meta?.id || 'Unknown';
};
```

#### formatTime (Default: ISO String)

```typescript
formatTime?: (ms: number) => string
```

Formats timestamps for display.

**Default Implementation**:

```typescript
(ms) => new Date(ms).toISOString();
```

## Quick Examples

### Basic Setup

```typescript
import { makePantheonPersistenceAdapter } from '@promethean-os/pantheon-persistence';
import { DualStoreManager } from '@promethean-os/persistence';

const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: async () => [await DualStoreManager.create('sessions', 'text', 'createdAt')],
});
```

### With Custom Resolvers

```typescript
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getManagers(),

  resolveRole: (meta) => {
    if (meta?.senderType === 'human') return 'user';
    if (meta?.senderType === 'ai') return 'assistant';
    return 'system';
  },

  resolveName: (meta) => {
    if (meta?.username) return meta.username;
    if (meta?.agentName) return `🤖 ${meta.agentName}`;
    return 'Unknown';
  },

  formatTime: (ms) => new Date(ms).toLocaleString(),
});
```

### Context Compilation

```typescript
const context = await adapter.compile({
  sources: [
    { id: 'sessions', label: 'Chat Sessions' },
    { id: 'agent-tasks', label: 'Tasks' },
  ],
  recentLimit: 10,
  queryLimit: 5,
  limit: 20,
});
```

## Common Patterns

### Role Resolution Patterns

```typescript
// 1. Explicit role check
resolveRole: (meta) => meta?.role || 'system';

// 2. Type-based inference
resolveRole: (meta) => {
  switch (meta?.type) {
    case 'user-message':
      return 'user';
    case 'assistant-response':
      return 'assistant';
    default:
      return 'system';
  }
};

// 3. Content analysis
resolveRole: (meta) => {
  const content = meta?.text || '';
  if (content.startsWith('User:')) return 'user';
  if (content.startsWith('Assistant:')) return 'assistant';
  return 'system';
};
```

### Name Resolution Patterns

```typescript
// 1. Priority-based
resolveName: (meta) => meta?.displayName || meta?.fullName || meta?.username || 'Unknown';

// 2. Role-based with emoji
resolveName: (meta) => {
  const emoji = meta?.role === 'assistant' ? '🤖' : meta?.role === 'user' ? '👤' : '🔧';
  return `${emoji} ${meta?.name || 'Unknown'}`;
};

// 3. Privacy-aware
resolveName: (meta) => {
  if (meta?.privacyLevel === 'private') {
    return `User ${meta?.userId?.slice(-4) || '****'}`;
  }
  return meta?.displayName || 'Anonymous';
};
```

### Time Formatting Patterns

```typescript
// 1. Relative time
formatTime: (ms) => {
  const diff = Date.now() - ms;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(ms).toLocaleDateString();
};

// 2. Human-readable
formatTime: (ms) =>
  new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// 3. ISO with timezone
formatTime: (ms) => new Date(ms).toISOString();
```

## Environment Variables

### Required

```bash
MONGODB_URL=mongodb://localhost:27017
CHROMA_URL=http://localhost:8000
```

### Optional

```bash
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text
AGENT_NAME=duck
DUAL_WRITE_ENABLED=true
DUAL_WRITE_CONSISTENCY=eventual
```

## Store Manager Creation

### Basic

```typescript
const manager = await DualStoreManager.create('sessions', 'text', 'createdAt');
```

### With Custom Keys

```typescript
const manager = await DualStoreManager.create('tasks', 'description', 'dueDate');
```

### Multiple Managers

```typescript
const managers = await Promise.all([
  DualStoreManager.create('sessions', 'text', 'createdAt'),
  DualStoreManager.create('tasks', 'description', 'dueDate'),
  DualStoreManager.create('users', 'bio', 'updatedAt'),
]);
```

## Context Source Mapping

### Source Definition

```typescript
const sources: ContextSource[] = [
  {
    id: 'sessions', // Must match manager.name
    label: 'Chat Sessions', // Human-readable label
    where: {
      // Optional filter
      userId: 'user123',
      isActive: true,
    },
    metadata: {
      // Optional metadata
      priority: 'high',
    },
  },
];
```

### Manager Mapping

```typescript
// These managers map to the sources above
const managers = [
  new DualStoreManager('sessions', ...),    // Maps to sources[0]
  new DualStoreManager('tasks', ...),       // Maps to sources[1] (if exists)
  new DualStoreManager('users', ...),       // Maps to sources[2] (if exists)
];
```

## Error Handling

### Safe Resolver Pattern

```typescript
const safeResolver = <T, R>(resolver: (input: T) => R, fallback: R) => {
  return (input: T): R => {
    try {
      const result = resolver(input);
      return result !== undefined ? result : fallback;
    } catch (error) {
      console.error('Resolver error:', error);
      return fallback;
    }
  };
};

// Usage
resolveRole: safeResolver((meta) => meta?.role, 'system');
```

### Validation Pattern

```typescript
const validateContextSource = (source: ContextSource): boolean => {
  return !!(
    source.id &&
    source.label &&
    typeof source.id === 'string' &&
    typeof source.label === 'string'
  );
};
```

## Performance Tips

### Caching

```typescript
// Memoize expensive operations
const memoize = <T, R>(fn: (input: T) => R) => {
  const cache = new Map<string, R>();
  return (input: T): R => {
    const key = JSON.stringify(input);
    return cache.has(key) ? cache.get(key)! : (cache.set(key, fn(input)), cache.get(key)!);
  };
};

resolveName: memoize((meta) => meta?.displayName || 'Unknown');
```

### Lazy Loading

```typescript
let managers: DualStoreManager[] | null = null;

getStoreManagers: async () => {
  if (!managers) {
    managers = await createManagers();
  }
  return managers;
};
```

## Testing Patterns

### Mock Adapter

```typescript
const createMockAdapter = (data: any[]) => {
  return makePantheonPersistenceAdapter({
    getStoreManagers: () => Promise.resolve([createMockManager('test', data)]),
    resolveRole: (meta) => meta?.testRole || 'system',
    resolveName: (meta) => meta?.testName || 'Test',
    formatTime: (ms) => `T${ms}`,
  });
};
```

### Test Data

```typescript
const testData = [
  {
    id: '1',
    text: 'Hello',
    metadata: { testRole: 'user', testName: 'User' },
  },
  {
    id: '2',
    text: 'Hi there!',
    metadata: { testRole: 'assistant', testName: 'Assistant' },
  },
];
```

## Debugging

### Enable Logging

```typescript
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: async () => {
    const managers = await getStoreManagers();
    console.log('Available managers:', managers.map(m => m.name));
    return managers;
  },

  resolveRole: (meta) => {
    console.log('Resolving role:', meta);
    const role = /* logic */;
    console.log('Resolved role:', role);
    return role;
  },
});
```

### Health Check

```typescript
const checkHealth = async (adapter: ContextPort) => {
  try {
    const context = await adapter.compile({
      sources: [{ id: 'test', label: 'Test' }],
      recentLimit: 1,
    });
    console.log('✅ Adapter healthy, context length:', context.length);
    return true;
  } catch (error) {
    console.error('❌ Adapter unhealthy:', error);
    return false;
  }
};
```

## Common Gotchas

### 1. Source ID Mismatch

```typescript
// ❌ Wrong - ID doesn't match manager name
{ id: 'chat-sessions', label: 'Sessions' }  // Manager named 'sessions'

// ✅ Correct - ID matches manager name
{ id: 'sessions', label: 'Sessions' }
```

### 2. Async Store Managers

```typescript
// ❌ Wrong - Not awaiting manager creation
getStoreManagers: () => [
  DualStoreManager.create('test', 'text', 'createdAt'), // Returns Promise
];

// ✅ Correct - Awaiting creation
getStoreManagers: async () => [await DualStoreManager.create('test', 'text', 'createdAt')];
```

### 3. Metadata Access

```typescript
// ❌ Wrong - Might throw error
resolveRole: (meta) => meta.role.toUpperCase();

// ✅ Correct - Safe access
resolveRole: (meta) => (meta?.role || 'system').toUpperCase();
```

## Integration Checklist

- [ ] Environment variables configured
- [ ] Store managers created successfully
- [ ] Source IDs match manager names
- [ ] Custom resolvers handle edge cases
- [ ] Error handling implemented
- [ ] Performance optimizations applied
- [ ] Tests written for custom logic
- [ ] Documentation updated for custom resolvers

## Related Packages

- [pantheon-core](../packages/pantheon/pantheon-core.md) - Core interfaces
- [@promethean-os/persistence](@promethean-os/persistence.md) - Dual-store implementation
- [@promethean-os/pantheon](@promethean-os/pantheon.md) - Main framework

#hashtags: #quick-reference #pantheon #persistence #cheatsheet
