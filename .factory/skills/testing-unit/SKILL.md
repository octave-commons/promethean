---
name: testing-unit
description: "Write fast, focused unit tests for individual functions, classes, and modules with proper isolation and mocking"
---

# Skill: Testing Unit

## Goal
Write fast, focused unit tests for individual functions, classes, and modules with proper isolation and mocking.

## Use This Skill When
- Testing a single function or class
- Testing pure functions with no side effects
- Testing utility functions and helpers
- Adding tests to existing code
- The user asks for "unit tests" for specific code

## Do Not Use This Skill When
- Testing multiple components together (use integration tests)
- Testing user flows or complete features (use E2E tests)
- Database or network calls are involved (mock or use integration tests)

## Unit Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { functionUnderTest } from './module';

describe('Module.functionUnderTest', () => {
  describe('when input is X', () => {
    it('should return Y', () => {
      const result = functionUnderTest('X');
      expect(result).toBe('Y');
    });
  });

  describe('when input is invalid', () => {
    it('should throw an error', () => {
      expect(() => functionUnderTest('invalid'))
        .toThrow('Expected error message');
    });
  });
});
```

## Unit Test Principles

### 1. Single Responsibility
Each test should verify one behavior:

```typescript
// GOOD - one assertion per behavior
it('returns the sum of two numbers', () => {
  expect(add(2, 3)).toBe(5);
});

it('throws when first argument is not a number', () => {
  expect(() => add('2' as any, 3)).toThrow();
});

// BAD - multiple behaviors in one test
it('adds numbers and logs result', () => {
  const consoleSpy = vi.spyOn(console, 'log');
  const result = add(2, 3);
  expect(result).toBe(5);
  expect(consoleSpy).toHaveBeenCalledWith(5);  // Different behavior!
});
```

### 2. Test Behavior, Not Implementation

```typescript
// GOOD - test what the function DOES
it('returns the user name in title case', () => {
  const user = { firstName: 'john', lastName: 'doe' };
  expect(formatName(user)).toBe('John Doe');
});

// BAD - test HOW it's done (breaks on refactor)
it('capitalizes first letter of each name part', () => {
  const user = { firstName: 'john', lastName: 'doe' };
  const formatted = user.firstName[0].toUpperCase() + 
                    user.firstName.slice(1) + ' ' +
                    user.lastName[0].toUpperCase() + 
                    user.lastName.slice(1);
  expect(formatName(user)).toBe(formatted);
});
```

### 3. Meaningful Test Data

```typescript
// GOOD - realistic test data
const validUser = {
  id: 'user-123',
  email: 'jane@example.com',
  name: 'Jane Developer',
  role: 'admin'
};

// BAD - generic/obvious data
const user = { id: '1', email: 'a@b.com', name: 'Test', role: 'user' };
```

## Mocking Guidelines

### What to Mock
- External APIs and services
- Time-dependent code (`Date.now()`, `setTimeout`)
- Random number generators
- Database connections
- File system operations

### What NOT to Mock
- Pure functions being tested
- Simple utility functions
- Built-in JavaScript types
- Code in the same module

### Mocking Examples

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock external API
vi.mock('./api/client', () => ({
  fetchUser: vi.fn(),
  updateUser: vi.fn()
}));

// Mock time
const mockDate = new Date('2024-01-15');
vi.setSystemTime(mockDate);

// Mock environment
vi.stubEnv('NODE_ENV', 'test');

// Verify mock was called
import { fetchUser } from './api/client';
it('calls fetchUser with correct id', async () => {
  fetchUser.mockResolvedValue({ id: '123', name: 'Test' });
  const result = await getUser('123');
  expect(fetchUser).toHaveBeenCalledWith('123');
});
```

## Testing Edge Cases

```typescript
describe('parseNumber', () => {
  it('handles positive integers', () => {
    expect(parseNumber('42')).toBe(42);
  });

  it('handles negative numbers', () => {
    expect(parseNumber('-7')).toBe(-7);
  });

  it('handles decimals', () => {
    expect(parseNumber('3.14')).toBeCloseTo(3.14);
  });

  it('returns NaN for invalid input', () => {
    expect(Number.isNaN(parseNumber('abc'))).toBe(true);
  });

  it('handles whitespace', () => {
    expect(parseNumber('  42  ')).toBe(42);
  });

  it('handles zero', () => {
    expect(parseNumber('0')).toBe(0);
  });
});
```

## Testing Async Code

```typescript
describe('fetchUser', () => {
  it('returns user on success', async () => {
    const user = await fetchUser('user-123');
    expect(user).toEqual({ id: 'user-123', name: 'Test' });
  });

  it('throws on API error', async () => {
    await expect(fetchUser('invalid'))
      .rejects
      .toThrow('User not found');
  });

  it('caches repeated requests', async () => {
    const user1 = await fetchUser('user-123');
    const user2 = await fetchUser('user-123');
    // Same instance due to caching
    expect(user1).toBe(user2);
  });
});
```

## Test Organization Patterns

### By Function
```
utils/
├── string.test.ts      # All string utilities
├── number.test.ts      # All number utilities
└── validation.test.ts  # All validation functions
```

### By Feature
```
features/
├── auth/
│   ├── login.test.ts
│   ├── logout.test.ts
│   └── registration.test.ts
└── users/
    ├── user.model.test.ts
    ├── user.service.test.ts
    └── user.repository.test.ts
```

## Common Patterns

### Setup/Teardown
```typescript
describe('Database Repository', () => {
  let repo: UserRepository;
  let testDb: TestDatabase;

  beforeEach(() => {
    testDb = createTestDatabase();
    repo = new UserRepository(testDb);
  });

  afterEach(() => {
    testDb.cleanup();
  });

  it('creates a user', async () => {
    const user = await repo.create({ name: 'Test' });
    expect(user.id).toBeDefined();
  });
});
```

### Parameterized Tests
```typescript
import { describe, it, expect } from 'vitest';
import { add } from './math';

describe('add', () => {
  const testCases = [
    { a: 2, b: 3, expected: 5 },
    { a: 0, b: 0, expected: 0 },
    { a: -1, b: 1, expected: 0 },
    { a: 100, b: 200, expected: 300 },
  ];

  testCases.forEach(({ a, b, expected }) => {
    it(`adds ${a} + ${b} = ${expected}`, () => {
      expect(add(a, b)).toBe(expected);
    });
  });
});
```

## Output
- Unit test files following workspace conventions
- Focused tests with single responsibility
- Proper mocking of external dependencies
- Edge case coverage
- Meaningful test data and assertions

## References
- Vitest: https://vitest.dev/
- Jest mocking: https://jestjs.io/docs/mock-functions
- Testing JavaScript: https://testingjavascript.com/
