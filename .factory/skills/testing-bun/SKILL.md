---
name: testing-bun
description: "Set up and write tests using Bun's built-in test runner for maximum performance and TypeScript support"
---

# Skill: Testing Bun

## Goal
Set up and write tests using Bun's built-in test runner for maximum performance, native TypeScript support, and workspace conventions.

## Use This Skill When
- Project uses Bun runtime
- Need fastest possible test execution
- Writing TypeScript tests without transpilation
- The user asks to "add Bun tests" or "use Bun test"

## Do Not Use This Skill When
- Project uses Node.js without Bun
- Need specific Node.js testing features
- CI environment doesn't support Bun

## Bun Test Setup

### Basic Configuration

```json
// package.json
{
  "scripts": {
    "test": "bun test",
    "test:coverage": "bun test --coverage",
    "test:watch": "bun test --watch"
  }
}
```

### bunfig.toml (Optional)

```toml
[test]
include = ["src/**/*.test.ts"]
exclude = ["node_modules", "dist"]
coverage = true
coverageThreshold = 0.8
```

## Test File Structure

```
src/
├── math.ts
├── math.test.ts    # Bun tests
└── __tests__/
```

## Basic Test Syntax

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { add, subtract, multiply } from './math';

describe('math utilities', () => {
  describe('add', () => {
    it('adds two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('handles negative numbers', () => {
      expect(add(-1, 1)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('subtracts second from first', () => {
      expect(subtract(5, 3)).toBe(2);
    });
  });

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      expect(multiply(4, 5)).toBe(20);
    });
  });
});
```

## Assertions

```typescript
import { expect, it } from 'bun:test';

it('equality', () => {
  expect(2 + 2).toBe(4);
  expect({ a: 1 }).toEqual({ a: 1 });
  expect([1, 2, 3]).toHaveLength(3);
});

it('truthiness', () => {
  expect('hello').toBeTruthy();
  expect(0).toBeFalsy();
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
});

it('strings', () => {
  expect('hello world').toContain('world');
  expect('hello').toMatch(/^hel/);
  expect('HELLO').toMatch(/^hello/i);
});

it('arrays', () => {
  expect([1, 2, 3]).toContain(2);
  expect([1, 2, 3]).toEqual([1, 2, 3]);
});

it('objects', () => {
  expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });
  expect({ a: 1 }).toHaveProperty('a');
});

it('exceptions', () => {
  expect(() => {
    throw new Error('fail');
  }).toThrow();

  expect(() => {
    throw new Error('specific error');
  }).toThrow('specific error');
});

it('floating point', () => {
  expect(0.1 + 0.2).toBeCloseTo(0.3);
});
```

## Async Testing

```typescript
import { it, expect } from 'bun:test';

it('async resolves', async () => {
  const result = await Promise.resolve('success');
  expect(result).toBe('success');
});

it('async rejects', async () => {
  await expect(Promise.reject(new Error('fail')))
    .rejects
    .toThrow('fail');
});

it('Promise.all', async () => {
  const results = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ]);
  expect(results).toEqual([1, 2, 3]);
});

it('Promise.race', async () => {
  const fast = Promise.resolve('fast');
  const slow = new Promise(r => setTimeout(() => r('slow'), 100));
  
  const result = await Promise.race([fast, slow]);
  expect(result).toBe('fast');
});
```

## Setup and Teardown

```typescript
import { describe, it, beforeAll, afterAll, beforeEach, afterEach, expect } from 'bun:test';

describe('Database Service', () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await createTestDatabase();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterEach(async () => {
    await db.clear();
  });

  it('creates records', async () => {
    const id = await db.create({ name: 'test' });
    expect(id).toBeDefined();
  });

  it('finds records', async () => {
    const id = await db.create({ name: 'test' });
    const record = await db.find(id);
    expect(record.name).toBe('test');
  });
});
```

## TypeScript with Bun

Bun natively supports TypeScript without configuration:

```typescript
// src/types.ts
interface User {
  id: string;
  name: string;
  email: string;
}

// src/user.test.ts
import { describe, it, expect } from 'bun:test';
import type { User } from './types';

describe('User types', () => {
  it('validates user structure', () => {
    const user: User = {
      id: '123',
      name: 'Test',
      email: 'test@example.com'
    };
    expect(user.id).toBe('123');
  });
});
```

## Mocking

```typescript
import { describe, it, expect, vi, beforeEach } from 'bun:test';

describe('API Service', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
  });

  it('calls get endpoint', async () => {
    mockClient.get.mockResolvedValue({ data: 'test' });
    
    const result = await mockClient.get('/api/data');
    
    expect(result.data).toBe('test');
    expect(mockClient.get).toHaveBeenCalledWith('/api/data');
  });

  it('posts to endpoint', async () => {
    mockClient.post.mockResolvedValue({ success: true });
    
    const result = await mockClient.post('/api/data', { name: 'test' });
    
    expect(result.success).toBe(true);
  });
});
```

## Spy on Objects

```typescript
import { describe, it, expect } from 'bun:test';

describe('Callback Handler', () => {
  it('calls onComplete callback', () => {
    const onComplete = vi.fn();
    const handler = new EventHandler({ onComplete });
    
    handler.trigger('complete');
    
    expect(onComplete).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls callback with arguments', () => {
    const onData = vi.fn();
    const handler = new DataHandler(onData);
    
    handler.process({ id: '123', value: 42 });
    
    expect(onData).toHaveBeenCalledWith({ id: '123', value: 42 });
  });
});
```

## Timers

```typescript
import { describe, it, expect, vi, beforeEach } from 'bun:test';

describe('Debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllTimers();
  });

  it('debounces function calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    // Call multiple times rapidly
    debounced('a');
    debounced('b');
    debounced('c');
    
    // Should not have been called yet
    expect(fn).not.toHaveBeenCalled();
    
    // Advance time
    vi.advanceTimersByTime(100);
    
    // Should have been called once with last value
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });
});
```

## Workspace Conventions

### Test File Naming
```
src/
├── module.ts
├── module.test.ts    # Bun tests
└── __tests__/
    └── integration.test.ts
```

### package.json Scripts
```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  }
}
```

## Performance Benefits

| Aspect | Bun | Jest/Vitest |
|--------|-----|-------------|
| Initial run | ~50ms | ~2-5s |
| Watch mode | Instant | ~500ms |
| TypeScript | Native | Requires config |
| Memory | Low | Higher |

## Output
- Bun test configuration (package.json scripts)
- Example test files with TypeScript
- Setup and teardown patterns
- Mock and spy utilities
- Timer mocking for async tests

## References
- Bun test: https://bun.sh/docs/test
- Bun assertions: https://bun.sh/docs/test/expect
- Bun mocking: https://bun.sh/docs/test/mock
