---
name: testing-typescript-vitest
description: "Set up and write tests using Vitest for TypeScript projects with proper configuration and TypeScript support"
---

# Skill: Testing TypeScript Vitest

## Goal
Set up and write tests using Vitest for TypeScript projects with proper configuration, TypeScript support, and workspace conventions.

## Use This Skill When
- Setting up tests for a new TypeScript project
- Writing tests using Vitest framework
- Configuring Vitest for TypeScript
- The user asks to "add Vitest tests" or "set up testing"

## Do Not Use This Skill When
- Project already has test framework configured
- Using a different test framework (Ava, Jest)
- Testing ClojureScript (use testing-clojure-cljs skill)

## Vitest Setup

### Package Dependencies

```bash
pnpm add -D vitest @vitest/ui @vitest/coverage-v8
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', '.git'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    },
    
    // TypeScript setup
    globals: false, // Don't import vitest globals
    environment: 'node',
    
    // Setup files
    setupFiles: ['src/test/setup.ts'],
    
    // Thread options
    threads: true,
    isolate: true,
  },
  plugins: [tsconfigPaths()]
});
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:run": "vitest run --reporter=verbose"
  }
}
```

## Test File Structure

```
src/
├── module.ts
├── module.test.ts        # Unit tests
├── module.integration.test.ts  # Integration tests
└── test/
    ├── setup.ts          # Test setup
    ├── mocks.ts          # Mock factories
    └── fixtures/         # Test fixtures
```

## Basic Test Syntax

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    service = new UserService(mockRepository);
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const mockUser = { id: '123', name: 'Test' };
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('123');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
    });

    it('returns null when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns new user', async () => {
      const input = { name: 'New User', email: 'new@example.com' };
      const created = { id: '456', ...input };
      mockRepository.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(result).toEqual(created);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });
  });
});
```

## TypeScript Features

### Generic Fixtures
```typescript
// test/fixtures/user.fixture.ts
export function createUserFixture(overrides = {}) {
  return {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    ...overrides
  };
}

export type UserFixture = ReturnType<typeof createUserFixture>;

// In tests
import { createUserFixture } from '../fixtures/user.fixture';

it('validates user email', () => {
  const user = createUserFixture({ email: 'invalid-email' });
  expect(validateEmail(user.email)).toBe(false);
});
```

### Mocking with vi
```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock module
vi.mock('./api/client');

// Get mocked imports
import { fetchUser, updateUser } from './api/client';

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user with retry', async () => {
    fetchUser.mockRejectedValueOnce(new Error('Network error'));
    fetchUser.mockResolvedValue({ id: '123', name: 'Test' });

    const result = await fetchUserWithRetry('123');

    expect(result).toEqual({ id: '123', name: 'Test' });
    expect(fetchUser).toHaveBeenCalledTimes(2);
  });
});
```

### Spy on Objects
```typescript
describe('Service with callbacks', () => {
  it('calls onComplete callback', () => {
    const onComplete = vi.fn();
    const service = new ProcessingService({ onComplete });

    service.process();

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ status: 'complete' });
  });

  it('calls callback with correct arguments', () => {
    const callback = vi.fn();
    const processor = new BatchProcessor(callback);

    processor.run([1, 2, 3]);

    expect(callback).toHaveBeenCalledWith(3); // Final result
  });
});
```

## Async Testing

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Async Operations', () => {
  describe('promises', () => {
    it('resolves with value', async () => {
      const result = await Promise.resolve('success');
      expect(result).toBe('success');
    });

    it('rejects with error', async () => {
      await expect(Promise.reject(new Error('fail')))
        .rejects
        .toThrow('fail');
    });
  });

  describe('timers', () => {
    it('handles setTimeout', async () => {
      vi.useFakeTimers();
      const callback = vi.fn();
      
      setTimeout(callback, 1000);
      
      // Advance timers
      vi.advanceTimersByTime(1000);
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('concurrent', () => {
    it('handles Promise.all', async () => {
      const results = await Promise.all([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3)
      ]);
      
      expect(results).toEqual([1, 2, 3]);
    });

    it('handles Promise.allSettled', async () => {
      const results = await Promise.allSettled([
        Promise.resolve('success'),
        Promise.reject('fail')
      ]);
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });
});
```

## Test Setup File

```typescript
// src/test/setup.ts
import { beforeEach, afterEach, vi } from 'vitest';

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// Clean up after all tests
afterAll(() => {
  vi.clearAllTimers();
});

// Global test utilities
globalThis.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  }),
  
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};
```

## Type-Safe Mocks

```typescript
// test/mocks/repository.mock.ts
import { vi } from 'vitest';
import type { UserRepository } from '../../src/user.repository';

export function createMockRepository(): UserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn()
  };
}

// In test
import { createMockRepository } from '../mocks/repository.mock';

it('uses repository methods', () => {
  const repo = createMockRepository();
  const service = new UserService(repo);
  
  service.getById('123');
  
  expect(repo.findById).toHaveBeenCalledWith('123');
});
```

## Workspace Conventions

### Naming
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `tests/e2e/*.test.ts`

### Location
```
src/
├── component.ts
├── component.test.ts         # Unit tests
└── __tests__/
    └── integration.test.ts   # Integration tests
```

### Assertions
Use descriptive assertions:
```typescript
// GOOD
expect(user.id).toBeDefined();
expect(users).toHaveLength(3);
expect(result).toEqual(expected);

// AVOID
expect(user.id).toBeTruthy();
expect(users.length).toBe(3);
expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
```

## Output
- Vitest configuration file (vitest.config.ts)
- Test setup file with utilities
- Example test files with TypeScript
- Mock factories and fixtures
- Updated package.json scripts

## References
- Vitest: https://vitest.dev/
- Vitest API: https://vitest.dev/api/
- Vite: https://vitejs.dev/
- TypeScript: https://www.typescriptlang.org/

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[testing-clojure-cljs](../testing-clojure-cljs/SKILL.md)**
