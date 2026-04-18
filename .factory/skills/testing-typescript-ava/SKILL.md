---
name: testing-typescript-ava
description: "Set up and write tests using Ava test runner for TypeScript with minimal configuration and fast execution"
---

# Skill: Testing TypeScript Ava

## Goal
Set up and write tests using Ava test runner for TypeScript with minimal configuration, fast execution, and workspace conventions.

## Use This Skill When
- Project uses or prefers Ava test runner
- Need minimal test configuration
- Want fast test execution with parallel execution
- Writing tests for Promethean packages
- The user asks to "add Ava tests" or "use Ava"

## Do Not Use This Skill When
- Project already uses Vitest
- Need advanced Vitest features (snapshot testing, mocking)
- Testing ClojureScript (use testing-clojure-cljs skill)

## Ava Setup

### Package Dependencies

```bash
pnpm add -D ava @ava/typescript typescript
```

### package.json Configuration

```json
{
  "ava": {
    "typescript": {
      "rewritePaths": {
        "src/": "dist/"
      }
    },
    "files": [
      "src/**/*.test.ts",
      "dist/**/*.test.js"
    ],
    "concurrency": 5,
    "timeout": "30s",
    "verbose": true
  },
  "scripts": {
    "test": "pnpm run build && pnpm run test:ava",
    "test:ava": "ava",
    "test:watch": "ava --watch"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Test File Structure

```
src/
├── utils/
│   ├── string.ts
│   └── string.test.ts    # Ava tests
└── test/
    ├── setup.ts
    └── helpers/
```

## Basic Test Syntax

```typescript
import test from 'ava';
import { capitalize, slugify } from './string';

test('capitalize converts first letter to uppercase', (t) => {
  t.is(capitalize('hello'), 'Hello');
  t.is(capitalize('world'), 'World');
});

test('capitalize handles empty string', (t) => {
  t.is(capitalize(''), '');
});

test('slugify converts to kebab-case', (t) => {
  t.is(slugify('Hello World'), 'hello-world');
  t.is(slugify('Test 123'), 'test-123');
});

test('slugify handles special characters', (t) => {
  t.is(slugify('Hello@World!'), 'hello-world');
});
```

## Assertions

```typescript
import test from 'ava';

test('basic assertions', (t) => {
  // Equality
  t.is(2 + 2, 4);
  t.not(2 + 2, 5);
  
  // Deep equality
  t.deepEqual({ a: 1 }, { a: 1 });
  t.notDeepEqual({ a: 1 }, { a: 2 });
  
  // Truthiness
  t.truthy('hello');
  t.falsy(null);
  t.true(true);
  t.false(false);
  
  // Type checks
  t.is(typeof 'hello', 'string');
  t.assert(Array.isArray([]));
  
  // Numeric
  t.is(0.1 + 0.2, 0.3); // Note: precision issues possible
  t.throws(() => { throw new Error('fail'); });
  
  // Array
  t.deepEqual([1, 2, 3], [1, 2, 3]);
  t.notDeepEqual([1, 2], [1, 2, 3]);
  
  // Regex
  t.regex('hello world', /world/);
  t.notRegex('hello world', /foo/);
});
```

## Async Testing

```typescript
import test from 'ava';

test('async function returns value', async (t) => {
  const result = await Promise.resolve('success');
  t.is(result, 'success');
});

test('async function throws error', async (t) => {
  await t.throwsAsync(
    Promise.reject(new Error('fail')),
    { message: 'fail' }
  );
});

test('concurrent tests run in parallel', async (t) => {
  const [first, second] = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2)
  ]);
  t.is(first, 1);
  t.is(second, 2);
});

test('promise resolves to expected value', async (t) => {
  const value = await getValue();
  t.is(value, expectedValue);
});
```

## Setup and Teardown

```typescript
import test from 'ava';

test.before((t) => {
  // Runs once before all tests
  t.context.db = createTestDatabase();
});

test.after.always((t) => {
  // Runs always after all tests, even if they fail
  t.context.db.cleanup();
});

test.beforeEach((t) => {
  // Runs before each test
  t.context.user = createTestUser();
});

test.afterEach.always((t) => {
  // Cleanup after each test
  cleanupTestUser(t.context.user.id);
});

// Access context
test('uses context', (t) => {
  t.is(t.context.user.name, 'Test User');
});
```

## TypeScript Support

### With type assertions
```typescript
import test from 'ava';

interface User {
  id: string;
  name: string;
}

test('user has correct properties', (t) => {
  const user = { id: '123', name: 'Test' } as User;
  t.is(user.id, '123');
  t.is(user.name, 'Test');
});
```

### Generic test functions
```typescript
import test from 'ava';

function testCase<T>(input: T, expected: T) {
  test(`handles ${JSON.stringify(input)}`, (t) => {
    t.is(transform(input), expected);
  });
}

testCase(1, 1);
testCase('str', 'str');
testCase(true, true);
```

## Mocking with Proxyquire

```typescript
import test from 'ava';
import * as proxyquire from 'proxyquire';

// Mock dependencies
const fetchUser = proxyquire('./api', {
  './client': {
    fetch: () => Promise.resolve({ id: '123', name: 'Mocked' })
  }
}).default;

test('fetches user from API', async (t) => {
  const user = await fetchUser('123');
  t.is(user.name, 'Mocked');
});
```

## Snapshots

```typescript
import test from 'ava';

test('snapshot of complex object', (t) => {
  const object = {
    id: '123',
    nested: {
      value: true,
      items: [1, 2, 3]
    }
  };
  
  t.snapshot(object);
});
```

## Workspace Conventions

### Ava Config Location
- Project-level: `ava.config.mjs` or `ava.config.cjs`
- Workspace-level: `config/ava.config.mjs`

### Example Workspace Config
```javascript
// config/ava.config.mjs
export default {
  files: [
    'packages/**/src/**/*.test.ts',
    'packages/**/dist/**/*.test.js'
  ],
  extensions: {
    ts: 'commonjs'
  },
  require: [
    'ts-node/register'
  ],
  concurrency: 5,
  timeout: '30s',
  verbose: true
};
```

### Test File Naming
```
src/
├── module.ts
├── module.test.ts    # Unit tests
└── __tests__/
    └── integration.test.ts  # Integration tests
```

## Best Practices

### 1. Keep Tests Independent
```typescript
// GOOD - no dependencies between tests
test('adds numbers', (t) => {
  t.is(add(2, 3), 5);
});

test('multiplies numbers', (t) => {
  t.is(multiply(2, 3), 6);
});

// BAD - test depends on state
let counter = 0;
test('increments', (t) => {
  counter++;
  t.is(counter, 1);
});

test('increments again', (t) => {
  counter++;  // Relies on previous test
  t.is(counter, 2);
});
```

### 2. Use Descriptive Test Names
```typescript
// GOOD
test('validateEmail rejects invalid email formats', (t) => {
  t.false(validateEmail('invalid'));
});

// BAD
test('validate', (t) => {
  t.false(validateEmail('invalid'));
});
```

### 3. Test Edge Cases
```typescript
test('handles empty string in slugify', (t) => {
  t.is(slugify(''), '');
});

test('handles single character', (t) => {
  t.is(slugify('a'), 'a');
});

test('handles leading/trailing spaces', (t) => {
  t.is(slugify('  hello  '), 'hello');
});
```

## Output
- Ava configuration file (ava.config.mjs)
- Updated package.json with test scripts
- Example test files with TypeScript
- Setup and teardown patterns
- Mock and fixture utilities

## References
- Ava: https://github.com/avajs/ava
- Ava docs: https://github.com/avajs/ava/blob/main/readme.md
- Proxyquire: https://github.com/thloratan/proxyquire

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[testing-clojure-cljs](../testing-clojure-cljs/SKILL.md)**
