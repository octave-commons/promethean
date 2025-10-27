# Pantheon Persistence Troubleshooting Guide

This guide provides comprehensive troubleshooting information for common issues with [pantheon-persistence](../packages/pantheon/pantheon-persistence.md) package.

## Table of Contents

- [Common Issues](#common-issues)
- [Debugging Techniques](#debugging-techniques)
- [Performance Issues](#performance-issues)
- [Database Connection Problems](#database-connection-problems)
- [Context Compilation Issues](#context-compilation-issues)
- [Resolver Problems](#resolver-problems)
- [Memory and Resource Issues](#memory-and-resource-issues)
- [Testing and Development](#testing-and-development)

## Common Issues

### Issue: Context Compilation Returns Empty Results

**Symptoms**: `adapter.compile()` returns an empty array or fewer messages than expected

**Possible Causes**:

1. **Source ID Mismatch**: ContextSource IDs don't match DualStoreManager names
2. **No Data**: Stores are empty or data doesn't match filters
3. **Manager Creation Failure**: Store managers failed to initialize
4. **Permission Issues**: Database access permissions prevent data retrieval

**Solutions**:

```typescript
// 1. Debug source mapping
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: async () => {
    const managers = await getStoreManagers();
    console.log(
      'Available managers:',
      managers.map((m) => m.name),
    );
    return managers;
  },
});

// 2. Test with exact manager name
const context = await adapter.compile({
  sources: [{ id: 'sessions', label: 'Sessions' }], // Use exact name
});

// 3. Check manager creation
try {
  const manager = await DualStoreManager.create('test', 'text', 'createdAt');
  console.log('Manager created successfully:', manager.name);
} catch (error) {
  console.error('Manager creation failed:', error);
}
```

### Issue: Role Resolution Always Returns 'system'

**Symptoms**: All messages have role 'system' regardless of metadata

**Possible Causes**:

1. **Metadata Structure**: Metadata doesn't contain expected fields
2. **Resolver Logic**: Custom resolver has bugs or incorrect logic
3. **Data Type Issues**: Role values are not strings or have unexpected values

**Solutions**:

```typescript
// 1. Debug metadata structure
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  resolveRole: (meta) => {
    console.log('Resolving role for metadata:', JSON.stringify(meta, null, 2));

    // Check all possible role fields
    const possibleRoles = [meta?.role, meta?.type, meta?.senderType, meta?.messageType];

    console.log('Possible roles:', possibleRoles);

    // Use explicit role mapping
    const roleMap = {
      user: 'user',
      human: 'user',
      person: 'user',
      assistant: 'assistant',
      ai: 'assistant',
      bot: 'assistant',
      agent: 'assistant',
      system: 'system',
      admin: 'system',
    };

    for (const role of possibleRoles) {
      if (role && roleMap[role.toLowerCase()]) {
        const resolved = roleMap[role.toLowerCase()];
        console.log(`Resolved role: ${role} -> ${resolved}`);
        return resolved;
      }
    }

    console.log('No role found, defaulting to system');
    return 'system';
  },
});
```

### Issue: Names Show as 'Unknown'

**Symptoms**: All messages display as 'Unknown' instead of proper names

**Possible Causes**:

1. **Missing Name Fields**: Metadata doesn't contain name-related fields
2. **Field Name Mismatch**: Using wrong field names in resolver
3. **Data Type Issues**: Name values are null, undefined, or not strings

**Solutions**:

```typescript
// 1. Comprehensive name resolution with debugging
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  resolveName: (meta) => {
    console.log('Resolving name for metadata:', JSON.stringify(meta, null, 2));

    // Check all possible name fields
    const nameFields = [
      'displayName',
      'fullName',
      'preferredName',
      'username',
      'handle',
      'name',
      'title',
      'label',
      'agentName',
      'botName',
    ];

    for (const field of nameFields) {
      const value = meta?.[field];
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`Found name in field ${field}: ${value}`);
        return value.trim();
      }
    }

    // Check for ID-based fallbacks
    const idFields = ['userId', 'sessionId', 'agentId', 'id'];
    for (const field of idFields) {
      const value = meta?.[field];
      if (value) {
        const fallbackName = `${field.charAt(0).toUpperCase() + field.slice(1)} ${value}`;
        console.log(`Using ID fallback: ${fallbackName}`);
        return fallbackName;
      }
    }

    console.log('No name found, using Unknown');
    return 'Unknown';
  },
});
```

## Debugging Techniques

### Enable Detailed Logging

```typescript
const createDebugAdapter = (debug: boolean = false) => {
  return makePantheonPersistenceAdapter({
    getStoreManagers: async () => {
      if (debug) console.log('[DEBUG] Getting store managers...');

      const managers = await getStoreManagers();

      if (debug) {
        console.log('[DEBUG] Available managers:', managers.map(m => ({
          name: m.name,
          textKey: m.textKey,
          timeKey: m.timeKey,
        })));
      }

      return managers;
    },

    resolveRole: (meta) => {
      if (debug) console.log('[DEBUG] Resolving role:', meta);

      const role = /* your resolution logic */;

      if (debug) console.log('[DEBUG] Resolved role:', role);
      return role;
    },

    resolveName: (meta) => {
      if (debug) console.log('[DEBUG] Resolving name:', meta);

      const name = /* your resolution logic */;

      if (debug) console.log('[DEBUG] Resolved name:', name);
      return name;
    },

    formatTime: (ms) => {
      if (debug) console.log('[DEBUG] Formatting time:', ms);

      const formatted = /* your formatting logic */;

      if (debug) console.log('[DEBUG] Formatted time:', formatted);
      return formatted;
    },
  });
};

// Usage
const debugAdapter = createDebugAdapter(process.env.DEBUG_PERSISTENCE === 'true');
```

### Context Compilation Tracing

```typescript
const traceContextCompilation = async (adapter: ContextPort, sources: any[]) => {
  console.log('=== Context Compilation Trace ===');
  console.log('Input sources:', sources);

  const startTime = Date.now();

  try {
    const context = await adapter.compile({
      sources,
      recentLimit: 10,
      queryLimit: 5,
      limit: 20,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Compilation completed in ${duration}ms`);
    console.log('Result count:', context.length);
    console.log('Result preview:', context.slice(0, 3));

    // Analyze results
    const roleCounts = context.reduce((acc, msg) => {
      acc[msg.role] = (acc[msg.role] || 0) + 1;
      return acc;
    }, {});

    console.log('Role distribution:', roleCounts);

    return context;
  } catch (error) {
    console.error('Context compilation failed:', error);
    throw error;
  }
};
```

### Store Manager Health Check

```typescript
const checkStoreManagerHealth = async (manager: DualStoreManager) => {
  console.log(`=== Health Check for ${manager.name} ===`);

  try {
    // Test recent retrieval
    const recent = await manager.getMostRecent(1);
    console.log('Recent entries count:', recent.length);

    if (recent.length > 0) {
      console.log('Sample entry:', {
        id: recent[0].id,
        textLength: recent[0].text?.length || 0,
        hasMetadata: !!recent[0].metadata,
      });
    }

    // Test relevant retrieval
    const relevant = await manager.getMostRelevant(['test'], 1);
    console.log('Relevant entries count:', relevant.length);

    // Test specific entry retrieval
    if (recent.length > 0) {
      const specific = await manager.get(recent[0].id);
      console.log('Specific entry found:', !!specific);
    }

    console.log(`✅ ${manager.name} is healthy`);
    return true;
  } catch (error) {
    console.error(`❌ ${manager.name} health check failed:`, error);
    return false;
  }
};

// Usage
const managers = await getStoreManagers();
for (const manager of managers) {
  await checkStoreManagerHealth(manager);
}
```

## Performance Issues

### Issue: Slow Context Compilation

**Symptoms**: Context compilation takes several seconds or times out

**Possible Causes**:

1. **Large Datasets**: Stores contain too much data
2. **Inefficient Queries**: Missing indexes or poor query structure
3. **Network Latency**: Slow database connections
4. **Memory Pressure**: Insufficient memory for data processing

**Solutions**:

```typescript
// 1. Implement pagination and limits
const optimizedAdapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  // Add caching for frequently accessed data
  resolveRole: createCachedResolver((meta) => {
    // Your role resolution logic
  }),

  resolveName: createCachedResolver((meta) => {
    // Your name resolution logic
  }),
});

function createCachedResolver<T, R>(
  resolver: (input: T) => R,
  maxSize: number = 1000,
): (input: T) => R {
  const cache = new Map<string, R>();

  return (input: T): R => {
    const key = JSON.stringify(input);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // Implement LRU eviction if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    const result = resolver(input);
    cache.set(key, result);
    return result;
  };
}

// 2. Use smaller limits for faster compilation
const context = await adapter.compile({
  sources,
  recentLimit: 5, // Reduced from 10
  queryLimit: 3, // Reduced from 5
  limit: 15, // Reduced from 20
});
```

### Issue: Memory Usage Growing

**Symptoms**: Application memory usage increases over time

**Possible Causes**:

1. **Memory Leaks**: Managers not properly cleaned up
2. **Cache Accumulation**: Caches growing without bounds
3. **Large Data Retention**: Keeping too much data in memory

**Solutions**:

```typescript
class MemoryManagedAdapter {
  private managers = new Map<string, DualStoreManager>();
  private lastCleanup = Date.now();
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MANAGER_TTL = 30 * 60 * 1000; // 30 minutes

  async getStoreManagers(): Promise<DualStoreManager[]> {
    await this.cleanupExpiredManagers();
    return Array.from(this.managers.values());
  }

  private async cleanupExpiredManagers() {
    const now = Date.now();

    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    console.log('Running manager cleanup...');

    for (const [name, manager] of this.managers) {
      // Check if manager is expired (implement your own logic)
      const isExpired = await this.isManagerExpired(manager);

      if (isExpired) {
        console.log(`Cleaning up expired manager: ${name}`);
        await manager.cleanup();
        this.managers.delete(name);
      }
    }

    this.lastCleanup = now;
  }

  private async isManagerExpired(manager: DualStoreManager): Promise<boolean> {
    // Implement your expiration logic
    // For example, check last access time or creation time
    return false;
  }
}
```

## Database Connection Problems

### Issue: MongoDB Connection Fails

**Symptoms**: Errors connecting to MongoDB, timeouts, or authentication failures

**Diagnosis**:

```typescript
const diagnoseMongoConnection = async () => {
  console.log('=== MongoDB Connection Diagnosis ===');

  try {
    const { getMongoClient } = await import('@promethean-os/persistence');
    const client = await getMongoClient();

    console.log('✅ MongoDB client created');

    // Test database access
    const db = client.db('database');
    const admin = db.admin();
    const result = await admin.ping();

    console.log('✅ MongoDB ping successful:', result);

    // Test collection access
    const collections = await db.listCollections().toArray();
    console.log(
      '✅ Available collections:',
      collections.map((c) => c.name),
    );

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);

    // Provide specific guidance
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Check if MongoDB is running');
    }

    if (error.message.includes('authentication')) {
      console.log('💡 Check MongoDB credentials');
    }

    if (error.message.includes('timeout')) {
      console.log('💡 Check network connectivity and firewall');
    }

    return false;
  }
};
```

### Issue: ChromaDB Connection Fails

**Diagnosis**:

```typescript
const diagnoseChromaConnection = async () => {
  console.log('=== ChromaDB Connection Diagnosis ===');

  try {
    const { getChromaClient } = await import('@promethean-os/persistence');
    const client = await getChromaClient();

    console.log('✅ ChromaDB client created');

    // Test heartbeat
    const heartbeat = await client.heartbeat();
    console.log('✅ ChromaDB heartbeat:', heartbeat);

    // Test collection access
    const collections = await client.listCollections();
    console.log('✅ Available collections:', collections);

    return true;
  } catch (error) {
    console.error('❌ ChromaDB connection failed:', error);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Check if ChromaDB is running on port 8000');
    }

    if (error.message.includes('timeout')) {
      console.log('💡 Check ChromaDB server responsiveness');
    }

    return false;
  }
};
```

## Context Compilation Issues

### Issue: Duplicate Messages in Context

**Symptoms**: Same message appears multiple times in compiled context

**Causes**:

1. **Multiple Store Managers**: Same data exists in multiple stores
2. **Data Duplication**: Database contains duplicate entries
3. **ID Collisions**: Different entries have same ID

**Solutions**:

```typescript
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  // Add deduplication in resolvers
  resolveRole: (meta) => {
    // Add unique identifier to metadata
    if (meta && !meta._uniqueId) {
      meta._uniqueId = `${meta.id || 'unknown'}_${Date.now()}_${Math.random()}`;
    }

    return meta?.role || 'system';
  },
});

// Post-processing deduplication
const deduplicateContext = (context: any[]) => {
  const seen = new Set();
  return context.filter((msg) => {
    const key = `${msg.role}_${msg.content}_${msg.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const context = await adapter.compile(options);
const deduplicated = deduplicateContext(context);
```

### Issue: Context Order is Incorrect

**Symptoms**: Messages appear in wrong chronological order

**Causes**:

1. **Time Key Mismatch**: Using wrong timestamp field
2. **Time Format Issues**: Inconsistent timestamp formats
3. **Sorting Logic Error**: Incorrect sorting implementation

**Solutions**:

```typescript
// Ensure consistent time handling
const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: async () => {
    const managers = await getStoreManagers();

    // Validate time keys
    for (const manager of managers) {
      console.log(`Manager ${manager.name} uses time key: ${manager.timeStampKey}`);
    }

    return managers;
  },

  formatTime: (ms) => {
    // Ensure consistent time formatting
    if (typeof ms !== 'number' || isNaN(ms)) {
      console.warn('Invalid timestamp:', ms);
      return new Date().toISOString();
    }

    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date from timestamp:', ms);
      return new Date().toISOString();
    }

    return date.toISOString();
  },
});
```

## Resolver Problems

### Issue: Custom Resolver Throws Errors

**Symptoms**: Context compilation fails with resolver-related errors

**Solutions**:

```typescript
const createSafeResolver = <T, R>(
  resolver: (input: T) => R,
  fallback: R,
  errorHandler?: (error: Error, input: T) => R,
) => {
  return (input: T): R => {
    try {
      const result = resolver(input);
      return result !== undefined && result !== null ? result : fallback;
    } catch (error) {
      console.error('Resolver error:', error);

      if (errorHandler) {
        try {
          return errorHandler(error as Error, input);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
        }
      }

      return fallback;
    }
  };
};

const adapter = makePantheonPersistenceAdapter({
  getStoreManagers: () => getStoreManagers(),

  resolveRole: createSafeResolver(
    (meta) => meta?.role || 'system',
    'system',
    (error, meta) => {
      console.error('Role resolution failed for:', meta);
      return 'system';
    },
  ),

  resolveName: createSafeResolver(
    (meta) => meta?.name || 'Unknown',
    'Unknown',
    (error, meta) => {
      console.error('Name resolution failed for:', meta);
      return 'Unknown';
    },
  ),
});
```

## Memory and Resource Issues

### Issue: Store Manager Cleanup Not Working

**Symptoms**: Memory usage remains high after calling cleanup()

**Solutions**:

```typescript
const forceCleanupManager = async (manager: DualStoreManager) => {
  console.log(`Force cleaning up manager: ${manager.name}`);

  try {
    // 1. Clear any internal caches
    if ((manager as any).cache) {
      (manager as any).cache.clear();
    }

    // 2. Close database connections
    await manager.cleanup();

    // 3. Force garbage collection (if available)
    if (global.gc) {
      global.gc();
    }

    console.log(`✅ Manager ${manager.name} cleaned up`);
  } catch (error) {
    console.error(`❌ Failed to cleanup manager ${manager.name}:`, error);
  }
};

// Monitor memory usage
const monitorMemory = () => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB',
  });
};
```

## Testing and Development

### Issue: Tests Fail with Connection Errors

**Solutions**:

```typescript
// Create test-specific configuration
const createTestAdapter = async () => {
  // Use test database
  process.env.MONGODB_URL = 'mongodb://localhost:27017/test';
  process.env.CHROMA_URL = 'http://localhost:8000';

  const testManagers = [];

  try {
    testManagers.push(await DualStoreManager.create('test-sessions', 'text', 'createdAt'));
  } catch (error) {
    console.warn('Test database not available, using mocks');

    // Fallback to mock managers
    return createMockAdapter();
  }

  return makePantheonPersistenceAdapter({
    getStoreManagers: () => Promise.resolve(testManagers),

    // Deterministic resolvers for testing
    resolveRole: (meta) => meta?.testRole || 'system',
    resolveName: (meta) => meta?.testName || 'Test User',
    formatTime: (ms) => `T${ms}`,
  });
};

const createMockAdapter = () => {
  return makePantheonPersistenceAdapter({
    getStoreManagers: () =>
      Promise.resolve([
        createMockDualStoreManager('test-sessions', [
          {
            id: '1',
            text: 'Test message',
            metadata: { testRole: 'user', testName: 'Test User' },
          },
        ]),
      ]),
  });
};
```

### Issue: Inconsistent Test Results

**Solutions**:

```typescript
// Create isolated test environment
const createIsolatedTest = async () => {
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const manager = await DualStoreManager.create(testId, 'text', 'createdAt');

  // Insert test data
  await manager.insert({
    text: 'Test message 1',
    metadata: { role: 'user', name: 'Test User 1' },
  });

  await manager.insert({
    text: 'Test message 2',
    metadata: { role: 'assistant', name: 'Test Assistant' },
  });

  const adapter = makePantheonPersistenceAdapter({
    getStoreManagers: () => Promise.resolve([manager]),
  });

  return {
    adapter,
    cleanup: async () => {
      await manager.cleanup();
    },
  };
};

// Usage in tests
describe('Isolated Tests', () => {
  it('should work consistently', async () => {
    const { adapter, cleanup } = await createIsolatedTest();

    try {
      const context = await adapter.compile({
        sources: [
          { id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, label: 'Test' },
        ],
      });

      expect(context).toHaveLength(2);
    } finally {
      await cleanup();
    }
  });
});
```

## Getting Help

### Collect Debug Information

```typescript
const collectDebugInfo = async () => {
  const info = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    configuration: {
      mongodbUrl: process.env.MONGODB_URL ? 'SET' : 'NOT SET',
      chromaUrl: process.env.CHROMA_URL ? 'SET' : 'NOT SET',
      embeddingDriver: process.env.EMBEDDING_DRIVER,
      embeddingFunction: process.env.EMBEDDING_FUNCTION,
    },
    managers: [],
    errors: [],
  };

  try {
    const managers = await getStoreManagers();
    info.managers = managers.map((m) => ({
      name: m.name,
      textKey: m.textKey,
      timeKey: m.timeStampKey,
    }));
  } catch (error) {
    info.errors.push(`Manager creation: ${error.message}`);
  }

  try {
    const { getMongoClient } = await import('@promethean-os/persistence');
    const mongoClient = await getMongoClient();
    info.mongodb = { connected: true };
    await mongoClient.close();
  } catch (error) {
    info.errors.push(`MongoDB: ${error.message}`);
    info.mongodb = { connected: false };
  }

  try {
    const { getChromaClient } = await import('@promethean-os/persistence');
    const chromaClient = await getChromaClient();
    info.chromadb = { connected: true };
  } catch (error) {
    info.errors.push(`ChromaDB: ${error.message}`);
    info.chromadb = { connected: false };
  }

  return info;
};

// Usage
const debugInfo = await collectDebugInfo();
console.log('Debug Information:', JSON.stringify(debugInfo, null, 2));
```

### Common Environment Issues

Check these environment variables:

```bash
# Required variables
echo "MongoDB URL: ${MONGODB_URL:-NOT SET}"
echo "ChromaDB URL: ${CHROMA_URL:-NOT SET}"
echo "Embedding Driver: ${EMBEDDING_DRIVER:-NOT SET}"
echo "Embedding Function: ${EMBEDDING_FUNCTION:-NOT SET}"

# Optional but recommended
echo "Agent Name: ${AGENT_NAME:-NOT SET}"
echo "Dual Write Enabled: ${DUAL_WRITE_ENABLED:-NOT SET}"
echo "Dual Write Consistency: ${DUAL_WRITE_CONSISTENCY:-NOT SET}"
```

### Performance Monitoring

```typescript
const monitorPerformance = () => {
  const startCompile = Date.now();
  let compileCount = 0;
  let totalCompileTime = 0;

  return {
    wrapAdapter: (adapter: ContextPort): ContextPort => {
      return {
        compile: async (options) => {
          const startTime = Date.now();
          const result = await adapter.compile(options);
          const endTime = Date.now();

          compileCount++;
          totalCompileTime += endTime - startTime;

          console.log(
            `Context compilation #${compileCount}: ${endTime - startTime}ms (avg: ${Math.round(totalCompileTime / compileCount)}ms)`,
          );

          return result;
        },
      };
    },

    getStats: () => ({
      compileCount,
      averageTime: Math.round(totalCompileTime / compileCount),
      totalTime: totalCompileTime,
    }),
  };
};
```

This troubleshooting guide should help you diagnose and resolve common issues with the [pantheon-persistence](../packages/pantheon/pantheon-persistence.md) package.

#hashtags: #troubleshooting #pantheon #persistence #debugging
