# Contributing to Pantheon

## Overview

This guide consolidates contribution guidelines, development patterns, and best practices for Pantheon framework. It combines insights from implementation guides, security documentation, and architectural patterns.

## Getting Started

### Development Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/promethean-os/promethean.git
cd promethean

# 2. Install dependencies
pnpm install

# 3. Set up development environment
cp .env.example .env
# Edit .env with your configuration

# 4. Build all packages
pnpm build

# 5. Run tests
pnpm test

# 6. Start development server
pnpm dev
```

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... develop your feature ...

# 3. Run linting and type checking
pnpm lint
pnpm typecheck:all

# 4. Run tests
pnpm test
pnpm --filter @promethean-os/pantheon-core test

# 5. Commit changes
git add .
git commit -m "feat: add your feature description"

# 6. Push and create PR
git push origin feature/your-feature-name
# Create pull request on GitHub
```

## Code Standards

### TypeScript Guidelines

```typescript
// Use strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
  }
}

// Prefer explicit types
interface ActorConfig {
  name: string;
  type: 'llm' | 'tool' | 'composite';
  goal: string;
}

// Use union types for enums
type ActorState = 'idle' | 'active' | 'error' | 'completed';

// Prefer readonly for immutable data
interface ContextRequest {
  readonly sources: readonly ContextSource[];
  readonly limit?: number;
}

// Use generic types for reusable functions
function createAdapter<T>(config: AdapterConfig<T>): Adapter<T> {
  // Implementation
}
```

### Functional Programming Patterns

```typescript
// Prefer pure functions
const processMessage = (message: Message): ProcessedMessage => {
  return {
    ...message,
    processed: true,
    timestamp: Date.now(),
  };
};

// Avoid mutations
const updateActor = (actor: Actor, updates: Partial<Actor>): Actor => {
  return {
    ...actor,
    ...updates,
  };
};

// Use immutable operations
const actors = [actor1, actor2];
const updatedActors = actors.map(actor => 
  actor.id === targetId ? updateActor(actor, updates) : actor
);

// Prefer function composition
const compose = <T, U, V>(f: (x: U) => V, g: (x: T) => U) => (x: T): V => f(g(x));

const processAndValidate = compose(validateMessage, processMessage);
```

### Error Handling Patterns

```typescript
// Use specific error types
export class PantheonError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'PantheonError';
  }
}

export class ValidationError extends PantheonError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

// Handle errors explicitly
try {
  const result = await executeActor(actor, input);
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn('Validation failed', { error: error.message, details: error.details });
    throw error;
  }
  
  if (error instanceof PantheonError) {
    logger.error('Pantheon error', { code: error.code, message: error.message });
    throw error;
  }
  
  logger.error('Unexpected error', { error: error.message, stack: error.stack });
  throw new PantheonError('Unexpected error', 'UNKNOWN_ERROR', { originalError: error });
}
```

## Testing Guidelines

### Test Structure

```typescript
// Test file organization
import test from 'ava';
import { createTestActor, createMockContextPort } from '../test-utils';

// Unit tests
test('actor creation with valid config', async (t) => {
  const config = {
    name: 'test-actor',
    type: 'llm' as const,
    goal: 'Test goal',
  };

  const actor = createActor(config);

  t.truthy(actor.id);
  t.is(actor.name, config.name);
  t.is(actor.type, config.type);
  t.is(actor.goal, config.goal);
});

// Integration tests
test('actor execution with mocked dependencies', async (t) => {
  const mockContext = createMockContextPort([
    { role: 'system', content: 'You are helpful assistant.' }
  ]);
  
  const orchestrator = createTestOrchestrator({ context: mockContext });
  const actor = createTestActor();

  const result = await orchestrator.tickActor(actor, { userMessage: 'Hello!' });

  t.truthy(result.success);
  t.truthy(result.response);
});

// Error scenario tests
test('actor creation fails with invalid config', async (t) => {
  const invalidConfig = {
    name: '', // Invalid: empty name
    type: 'invalid-type' as any,
    goal: 'Test goal',
  };

  await t.throwsAsync(
    () => createActor(invalidConfig),
    { instanceOf: ValidationError }
  );
});
```

### Test Utilities

```typescript
// Test utilities for consistent testing
export const createTestActor = (overrides: Partial<ActorConfig> = {}): Actor => {
  const defaultConfig: ActorConfig = {
    name: 'test-actor',
    type: 'llm',
    goal: 'Test goal',
    ...overrides,
  };

  return createActor(defaultConfig);
};

export const createMockContextPort = (messages: Message[] = []): ContextPort => ({
  compile: async () => messages,
});

export const createMockLLMPort = (responses: string[] = []): LlmPort => ({
  complete: async (prompt: string) => {
    return responses.shift() || 'Default mock response';
  },
});

export const createTestOrchestrator = (overrides: Partial<OrchestratorDeps> = {}): Orchestrator => {
  const defaultDeps: OrchestratorDeps = {
    context: createMockContextPort(),
    llm: createMockLLMPort(['Mock response']),
    tools: createMockToolPort(),
    bus: createMockMessageBus(),
    schedule: createMockScheduler(),
    state: createMockActorStatePort(),
    ...overrides,
  };

  return makeOrchestrator(defaultDeps);
};
```

### Test Coverage Requirements

```bash
# Run coverage report
pnpm test:coverage

# Coverage requirements:
# - Overall coverage: > 90%
# - Function coverage: > 95%
# - Branch coverage: > 85%
# - Line coverage: > 90%

# Generate coverage report
pnpm --filter @promethean-os/pantheon-core test:coverage
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Creates a new Pantheon actor with the specified configuration.
 * 
 * @example
 * ```typescript
 * const actor = createActor({
 *   name: 'my-actor',
 *   type: 'llm',
 *   goal: 'Assist users with tasks',
 * });
 * ```
 * 
 * @param config - The actor configuration object
 * @param config.name - The unique name for the actor
 * @param config.type - The type of actor (llm, tool, or composite)
 * @param config.goal - The primary goal or purpose of the actor
 * @param config.behaviors - Optional array of behaviors the actor can perform
 * @param config.talents - Optional array of talents the actor possesses
 * 
 * @returns A promise that resolves to the created actor
 * 
 * @throws {ValidationError} When the configuration is invalid
 * @throws {PantheonError} When actor creation fails for other reasons
 * 
 * @since 1.0.0
 * 
 * @see {@link Actor} for the actor interface
 * @see {@link ActorConfig} for configuration options
 */
export async function createActor(config: ActorConfig): Promise<Actor> {
  // Implementation
}
```

### README Documentation

```markdown
# Package Name

Brief description of the package.

## Installation

```bash
pnpm add @promethean-os/package-name
```

## Quick Start

```typescript
import { mainFunction } from '@promethean-os/package-name';

// Example usage
const result = await mainFunction(config);
```

## API Reference

### mainFunction

Creates or processes something.

**Parameters:**

- `config` (Config): Configuration object
  - `option1` (string): Description of option1
  - `option2` (number): Description of option2

**Returns:** Promise<Result>

**Example:**

```typescript
const result = await mainFunction({
  option1: 'value',
  option2: 123,
});
```

## Examples

See the [examples](./examples) directory for more detailed usage examples.

## Contributing

See the [contributing guide](../CONTRIBUTING.md) for development guidelines.

## License

GPL-3.0-only
```

## Security Guidelines

### Secure Coding Practices

```typescript
// Input validation
import { z } from 'zod';

const UserInputSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

const validateUserInput = (input: unknown): UserInput => {
  return UserInputSchema.parse(input);
};

// Output sanitization
const sanitizeOutput = (output: any): any => {
  if (typeof output === 'string') {
    return output
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  return output;
};

// Secure error messages
const createSecureError = (message: string, internalDetails?: any): Error => {
  const error = new Error(message);
  // Don't expose internal details in production
  if (process.env.NODE_ENV !== 'production' && internalDetails) {
    (error as any).internalDetails = internalDetails;
  }
  return error;
};
```

### Security Review Checklist

- [ ] **Input Validation**
  - [ ] All external inputs validated with schemas
  - [ ] JSON parsing uses safe methods
  - [ ] File paths sanitized against traversal
  - [ ] Command arguments sanitized

- [ ] **Output Sanitization**
  - [ ] HTML characters escaped in web responses
  - [ ] Sensitive data not exposed in errors
  - [ ] Debug information removed in production

- [ ] **Authentication & Authorization**
  - [ ] Strong authentication mechanisms
  - [ ] Proper session management
  - [ ] Authorization checks on sensitive operations
  - [ ] Rate limiting implemented

- [ ] **Data Protection**
  - [ ] Encryption at rest
  - [ ] Encryption in transit
  - [ ] Secure key management
  - [ ] Data retention policies

## Performance Guidelines

### Performance Optimization

```typescript
// Efficient data structures
const efficientLookup = new Map<string, Actor>(); // O(1) lookup
const inefficientLookup = [{ id: '1', actor }, { id: '2', actor }]; // O(n) lookup

// Memoization
const memoize = <T, R>(fn: (arg: T) => R) => {
  const cache = new Map<T, R>();
  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
};

// Lazy loading
class LazyResourceLoader {
  private resource: Resource | null = null;
  private loadPromise: Promise<Resource> | null = null;

  async getResource(): Promise<Resource> {
    if (this.resource) {
      return this.resource;
    }

    if (!this.loadPromise) {
      this.loadPromise = this.loadResource();
    }

    this.resource = await this.loadPromise;
    return this.resource;
  }
}
```

### Performance Testing

```typescript
// Performance benchmarks
import { performance } from 'perf_hooks';

const benchmarkFunction = async (fn: () => Promise<any>, iterations: number = 100) => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return { avg, min, max, iterations, times };
};

// Usage
const result = await benchmarkFunction(async () => {
  await contextAdapter.compile({ sources: testSources });
}, 1000);

console.log(`Average: ${result.avg.toFixed(2)}ms`);
console.log(`Min: ${result.min.toFixed(2)}ms`);
console.log(`Max: ${result.max.toFixed(2)}ms`);
```

## Release Process

### Version Management

```bash
# 1. Update version numbers
pnpm version patch  # 1.0.0 → 1.0.1
pnpm version minor  # 1.0.0 → 1.1.0
pnpm version major  # 1.0.0 → 2.0.0

# 2. Update changelog
# Edit CHANGELOG.md with version changes

# 3. Run full test suite
pnpm test
pnpm lint
pnpm typecheck:all

# 4. Build packages
pnpm build

# 5. Create release tag
git tag v1.0.1
git push origin v1.0.1

# 6. Publish to npm
pnpm publish --access public
```

### Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-01-15

### Added
- New actor scheduling system
- Support for custom tool adapters
- Performance monitoring dashboard

### Changed
- Improved context compilation performance by 40%
- Updated TypeScript to v5.0
- Refactored actor state management

### Deprecated
- Old agent configuration format (will be removed in v2.0)

### Removed
- Legacy authentication system
- Deprecated actor methods

### Fixed
- Memory leak in long-running actors
- Type inference issues in generic functions
- Security vulnerability in input validation

### Security
- Fixed prototype pollution vulnerability
- Improved input sanitization
- Added rate limiting to API endpoints
```

## Community Guidelines

### Code of Conduct

```markdown
# Our Code of Conduct

## Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

## Our Standards

- **Respect**: Treat all individuals with respect and professionalism
- **Inclusivity**: Welcome contributions from people of all backgrounds
- **Collaboration**: Work together constructively
- **Learning**: Be open to learning and teaching
- **Patience**: Remember that everyone was once a beginner

## Expected Behavior

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Personal attacks or political discussions
- Publishing private information without permission
- Any other conduct which could reasonably be considered inappropriate

## Enforcement

Instances of abusive behavior will be reviewed and addressed by the project maintainers.
```

### Issue Reporting

```markdown
# Issue Reporting Guidelines

## Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Try the latest version** to see if the issue is already fixed
4. **Create minimal reproduction** to isolate the problem

## Issue Template

```markdown
## Bug Description
Brief description of the bug.

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 18.17.0]
- Package version: [e.g., 1.2.0]

## Additional Context
Any other relevant information, logs, or screenshots.
```

### Pull Request Process

```markdown
# Pull Request Guidelines

## Before Submitting

1. **Read the contributing guide** thoroughly
2. **Set up development environment** locally
3. **Write tests** for your changes
4. **Ensure all tests pass** locally
5. **Follow code style** guidelines
6. **Update documentation** if needed

## PR Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Breaking changes documented
```

## Getting Help

### Development Support

- **Discord**: [Join our Discord](https://discord.gg/promethean)
- **GitHub Discussions**: [Ask questions](https://github.com/promethean-os/promethean/discussions)
- **Email**: development@promethean.ai

### Resources

- **Documentation**: [Pantheon Docs](https://docs.promethean.ai/pantheon)
- **API Reference**: [API Docs](https://api.promethean.ai)
- **Examples**: [Example Repository](https://github.com/promethean-os/examples)

## Recognition

### Contributor Recognition

We recognize all contributors through:
- **AUTHORS file**: List of all contributors
- **Release notes**: Mentioning significant contributors
- **Community highlights**: Featuring outstanding contributions
- **Contributor badges**: GitHub badges for active contributors

### Ways to Contribute

- **Code**: Bug fixes, features, improvements
- **Documentation**: Improving guides, examples, API docs
- **Testing**: Writing tests, reporting bugs
- **Community**: Helping others, answering questions
- **Design**: UI/UX improvements, graphics
- **Translation**: Localizing documentation and interfaces

## Conclusion

This contributing guide provides comprehensive guidelines for participating in Pantheon development. We welcome contributions of all types and are committed to maintaining an inclusive, respectful, and productive development environment.

Thank you for contributing to Pantheon! 🚀