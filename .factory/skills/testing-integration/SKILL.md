---
name: testing-integration
description: "Write integration tests that verify multiple components work together correctly with real dependencies"
---

# Skill: Testing Integration

## Goal
Write integration tests that verify multiple components work together correctly with real dependencies like databases, caches, and external services.

## Use This Skill When
- Testing how multiple modules work together
- Testing database operations with real queries
- Testing API endpoints with request/response cycles
- Testing cache + database coordination
- The user asks for "integration tests"

## Do Not Use This Skill When
- Testing single functions in isolation (use unit tests)
- Testing complete user journeys (use E2E tests)
- Tests should run in milliseconds (prefer unit tests)
- External services are unavailable (mock or skip)

## Integration Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserService } from './user.service';
import { Database } from './database';
import { Cache } from './cache';

describe('UserService Integration', () => {
  let db: Database;
  let cache: Cache;
  let service: UserService;

  beforeAll(async () => {
    db = await Database.connect(process.env.TEST_DB_URL);
    cache = await Cache.connect(process.env.TEST_CACHE_URL);
    service = new UserService(db, cache);
  });

  afterAll(async () => {
    await db.cleanup();
    await cache.cleanup();
  });

  describe('user creation and retrieval', () => {
    it('creates a user and retrieves it from cache', async () => {
      // Create user
      const created = await service.createUser({
        email: 'test@example.com',
        name: 'Test User'
      });
      expect(created.id).toBeDefined();
      expect(created.email).toBe('test@example.com');

      // Retrieve (should hit cache)
      const retrieved = await service.getUser(created.id);
      expect(retrieved).toEqual(created);

      // Verify cache was hit (implementation detail)
      const cacheStats = await cache.getStats();
      expect(cacheStats.hits).toBeGreaterThan(0);
    });
  });
});
```

## When to Use Integration Tests

| Scenario | Use Integration Test | Reason |
|----------|---------------------|--------|
| Database CRUD | ✅ | Verify queries work correctly |
| Cache + DB coordination | ✅ | Test cache invalidation |
| API endpoints | ✅ | Test full request/response |
| Service-to-service calls | ✅ | Test contract and data flow |
| Single utility function | ❌ | Use unit test instead |
| User login → purchase flow | ❌ | Use E2E test instead |

## Test Database Setup

### In-Memory Database
```typescript
import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from '@promethean-os/persistence';

export function createTestDatabase() {
  const db = new Database(':memory:');
  const dialect = new SqliteDialect({ database: db });
  const queryDb = new Kysely<any>({ dialect });
  
  // Initialize schema
  queryDb.schema
    .createTable('users')
    .addColumn('id', 'varchar(255)', col => col.primaryKey())
    .addColumn('email', 'varchar(255)', col => col.notNull())
    .addColumn('name', 'varchar(255)', col => col.notNull())
    .execute();
  
  return queryDb;
}
```

### Docker/Test Containers
```typescript
import { GenericContainer } from 'testcontainers';

let postgresContainer: GenericContainer;

beforeAll(async () => {
  postgresContainer = await GenericContainer
    .fromDockerfile('.')
    .withEnvironment({ POSTGRES_DB: 'test' })
    .withExposedPorts(5432)
    .start();
  
  process.env.TEST_DB_URL = postgresContainer.getConnectionUri();
});

afterAll(async () => {
  await postgresContainer.stop();
});
```

## Testing Database Operations

```typescript
describe('UserRepository', () => {
  let repo: UserRepository;
  
  beforeEach(async () => {
    repo = new UserRepository(testDb);
    await repo.clear(); // Clean state before each test
  });

  it('creates a user and persists to database', async () => {
    const user = await repo.create({
      email: 'new@example.com',
      name: 'New User'
    });

    expect(user.id).toBeDefined();

    // Verify in database directly
    const found = await testDb
      .selectFrom('users')
      .selectAll()
      .where('id', '=', user.id)
      .executeTakeFirst();

    expect(found.email).toBe('new@example.com');
  });

  it('finds users by email', async () => {
    await repo.create({ email: 'findme@example.com', name: 'Test' });
    
    const users = await repo.findByEmail('findme@example.com');
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Test');
  });

  it('updates user and reflects changes', async () => {
    const created = await repo.create({ email: 'old@example.com', name: 'Old' });
    
    const updated = await repo.update(created.id, { name: 'New' });
    expect(updated.name).toBe('New');

    // Verify persistence
    const found = await repo.findById(created.id);
    expect(found.name).toBe('New');
  });

  it('soft deletes user', async () => {
    const created = await repo.create({ email: 'delete@example.com', name: 'Delete' });
    
    await repo.softDelete(created.id);
    
    const found = await repo.findById(created.id);
    expect(found.deletedAt).toBeDefined();
  });
});
```

## Testing Cache Integration

```typescript
describe('Cache + Repository Integration', () => {
  let repo: UserRepository;
  let cache: Cache;

  beforeEach(async () => {
    await repo.clear();
    await cache.flush();
  });

  it('caches user after first read', async () => {
    const created = await repo.create({ email: 'cache@example.com', name: 'Test' });
    
    // First read - cache miss
    const user1 = await service.getUser(created.id);
    expect(user1).toEqual(created);

    // Verify cache was populated
    const cached = await cache.get(`user:${created.id}`);
    expect(cached).toBeDefined();

    // Second read - cache hit
    const user2 = await service.getUser(created.id);
    expect(user2).toEqual(user1);

    // Verify only one database query occurred
    const dbQueries = await testDb.getQueryCount();
    expect(dbQueries).toBe(1);
  });

  it('invalidates cache on update', async () => {
    const created = await repo.create({ email: 'update@example.com', name: 'Old' });
    
    // Populate cache
    await service.getUser(created.id);

    // Update user
    await service.updateUser(created.id, { name: 'New' });

    // Verify cache was invalidated
    const cached = await cache.get(`user:${created.id}`);
    expect(cached).toBeNull();
  });
});
```

## Testing API Endpoints

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp } from './test-utils';
import { createUser, getUser } from './handlers';

describe('User API Endpoints', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
    app.route('POST /users', createUser);
    app.route('GET /users/:id', getUser);
  });

  afterAll(async () => {
    await app.cleanup();
  });

  describe('POST /users', () => {
    it('creates a user and returns 201', async () => {
      const response = await app.request('POST /users', {
        body: { email: 'api@example.com', name: 'API Test' }
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.id).toBeDefined();
      expect(body.email).toBe('api@example.com');
    });

    it('returns 400 for invalid input', async () => {
      const response = await app.request('POST /users', {
        body: { email: 'invalid-email' }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /users/:id', () => {
    it('returns user by id', async () => {
      // Create user first
      const created = await app.request('POST /users', {
        body: { email: 'get@example.com', name: 'Get Test' }
      });
      const { id } = await created.json();

      // Get user
      const response = await app.request(`GET /users/${id}`);
      expect(response.status).toBe(200);
      
      const user = await response.json();
      expect(user.id).toBe(id);
      expect(user.email).toBe('get@example.com');
    });

    it('returns 404 for non-existent user', async () => {
      const response = await app.request('GET /users/non-existent-id');
      expect(response.status).toBe(404);
    });
  });
});
```

## Service-to-Service Integration

```typescript
describe('Notification Service Integration', () => {
  let notificationService: NotificationService;
  let emailClient: TestEmailClient;
  let queue: TestQueue;

  beforeEach(() => {
    emailClient = new TestEmailClient();
    queue = new TestQueue();
    notificationService = new NotificationService(emailClient, queue);
  });

  it('sends email notification through queue', async () => {
    await notificationService.sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      body: 'Hello'
    });

    // Verify message was queued
    const messages = await queue.getMessages('notifications');
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('send_email');
    expect(messages[0].payload.to).toBe('user@example.com');
  });
});
```

## Best Practices

### 1. Use Real Implementations Where Possible
```typescript
// GOOD - use real database, mock only external services
const repo = new UserRepository(realDatabase);
const emailService = mockEmailService();

// BAD - over-mock, test nothing meaningful
const repo = mockUserRepository();
expect(repo.create).toHaveBeenCalled();
```

### 2. Clean State Between Tests
```typescript
beforeEach(async () => {
  await testDb.clearTables(['users', 'posts', 'comments']);
  await cache.flush();
});
```

### 3. Use Transactions for Isolation
```typescript
it('handles concurrent updates', async () => {
  const user = await repo.create({ balance: 100 });
  
  // Run concurrent withdrawals
  await Promise.all([
    withdraw(user.id, 30),
    withdraw(user.id, 40),
    withdraw(user.id, 50)
  ]);

  // Verify final balance (should handle race condition)
  const final = await repo.getBalance(user.id);
  expect(final.balance).toBe(80); // 100 - 30 - 40 - 50 + (handled)
});
```

### 4. Test Failure Modes
```typescript
it('rolls back transaction on error', async () => {
  const initialCount = await repo.count();
  
  await expect(
    repo.createWithFailure({ invalid: 'data' })
  ).rejects.toThrow();

  const finalCount = await repo.count();
  expect(finalCount).toBe(initialCount); // No change
});
```

## Output
- Integration test files for multi-component scenarios
- Real database/cache configuration with cleanup
- Proper test data setup and teardown
- Edge case testing for component interactions
- Failure mode and rollback testing

## References
- Vitest: https://vitest.dev/
- Test containers: https://github.com/testcontainers/testcontainers-node
- Pact contract testing: https://docs.pact.io/
