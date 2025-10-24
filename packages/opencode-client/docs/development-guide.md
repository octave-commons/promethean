# Development Guide - OpenCode Client

## Overview

This guide provides comprehensive documentation for developers working with the `@promethean-os/opencode-client` package, covering setup, development workflows, testing, and contribution guidelines.

## Prerequisites

### Required Tools

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **TypeScript** (v5 or higher)
- **OpenCode server** running locally or accessible via network

### Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/riatzukiza/promethean.git
cd promethean

# Install dependencies
pnpm install

# Navigate to the opencode-client package
cd packages/opencode-client

# Install package-specific dependencies
pnpm install
```

## Project Structure

```
packages/opencode-client/
├── src/
│   ├── actions/                    # High-level business logic
│   │   ├── events/                 # Event handling actions
│   │   │   ├── index.ts
│   │   │   ├── list.ts
│   │   │   └── subscribe.ts
│   │   ├── sessions/               # Session management actions
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── close.ts
│   │   │   ├── get.ts
│   │   │   ├── list.ts
│   │   │   ├── search.ts
│   │   │   ├── spawn.ts
│   │   │   └── utils.ts
│   │   ├── messages/               # Message handling actions
│   │   │   └── index.ts
│   │   ├── messaging/              # Messaging actions
│   │   │   └── index.ts
│   │   └── index.ts                # Action exports
│   ├── commands/                   # CLI command implementations
│   │   ├── events/                 # Event commands
│   │   │   ├── index.ts
│   │   │   ├── list.ts
│   │   │   └── subscribe.ts
│   │   ├── sessions/               # Session commands
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── close.ts
│   │   │   ├── get.ts
│   │   │   ├── list.ts
│   │   │   ├── search.ts
│   │   │   ├── spawn.ts
│   │   │   └── diagnose.ts
│   │   ├── messages/               # Message commands
│   │   │   ├── index.ts
│   │   │   ├── list.ts
│   │   │   ├── get.ts
│   │   │   └── send.ts
│   │   ├── indexer/                # Indexer commands
│   │   │   ├── index.ts
│   │   │   └── start.ts
│   │   └── index.ts                # Command exports
│   ├── plugins/                    # Plugin system
│   │   ├── index.ts                # Plugin exports
│   │   ├── opencode-interface/     # Main OpenCode interface
│   │   ├── realtime-capture/       # Real-time event capture
│   │   └── event-hooks/            # Event-driven hooks
│   ├── services/                   # Core services
│   │   ├── indexer.ts              # Indexing service
│   │   ├── indexer-types.ts        # Indexer type definitions
│   │   ├── indexer-formatters.ts  # Data formatting utilities
│   │   ├── indexer-operations.ts  # Indexer operations
│   │   ├── unified-store.ts       # Unified store management
│   │   └── composables/           # Reusable service components
│   ├── types/                      # Type definitions
│   │   ├── index.ts
│   │   ├── SessionData.ts
│   │   ├── StoreSession.ts
│   │   └── plugin-hooks.ts
│   ├── utils/                      # Utility functions
│   │   ├── session-cleanup.ts
│   │   ├── cleanup.ts
│   │   └── input-validation.ts
│   ├── hooks/                      # Custom hooks
│   │   └── tool-execute-hooks.ts
│   ├── tests/                      # Test files
│   │   ├── actions/
│   │   ├── events/
│   │   ├── sessions/
│   │   ├── messages/
│   │   ├── services/
│   │   └── e2e/
│   ├── cli.ts                      # CLI entry point
│   ├── index.ts                    # Main library entry point
│   ├── stores.ts                   # Store management
│   ├── SessionUtils.ts             # Session utilities
│   ├── SessionInfo.ts              # Session information
│   ├── initializeStores.ts         # Store initialization
│   ├── getStore.ts                 # Store getter
│   ├── getAllRelatedDocuments.ts   # Document retrieval
│   ├── getLatestDocuments.ts       # Latest document retrieval
│   ├── compileContext.ts           # Context compilation
│   └── createStoreProxy.ts        # Store proxy creation
├── docs/                          # Documentation files
├── dist/                          # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### 1. Making Changes

```bash
# Start development with watch mode
pnpm dev

# This will watch for changes and recompile automatically
# Output will be in the dist/ directory
```

### 2. Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test src/tests/sessions/create.test.ts

# Watch mode for tests
pnpm test:watch
```

### 3. Building the Package

```bash
# Build for production
pnpm build

# Check for TypeScript errors only
pnpm typecheck

# Build tests
pnpm build:tests
```

### 4. Local Development with Linked Packages

```bash
# Link the package for local development
pnpm link --global

# Use in another project
cd /path/to/other-project
pnpm link @promethean-os/opencode-client --global
```

## Code Style and Standards

### TypeScript Configuration

The project uses strict TypeScript settings defined in `tsconfig.json`:

```json
{
  "extends": "../../config/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Code Formatting

```bash
# Format code with Prettier
pnpm format

# Check linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Naming Conventions

- **Files**: kebab-case (`session-utils.ts`)
- **Functions**: camelCase (`createSession`)
- **Variables**: camelCase (`sessionData`)
- **Types**: PascalCase (`SessionData`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)

## Architecture Overview

### Core Components

1. **CLI Layer** (`src/cli.ts`): Command-line interface using Commander.js
2. **Command Layer** (`src/commands/`): CLI command implementations
3. **Action Layer** (`src/actions/`): Business logic and API interactions
4. **Service Layer** (`src/services/`): Core services and utilities
5. **Plugin Layer** (`src/plugins/`): Extensible plugin system
6. **Type Layer** (`src/types/`): TypeScript type definitions

### Data Flow

```
CLI Command → Command Handler → Action → Service → OpenCode API
     ↓              ↓              ↓         ↓
   Parser      → Validation   → Business → Network
     ↓              ↓              ↓         ↓
   Options    → Types       → Logic    → Response
```

## Working with Sessions

### Adding New Session Commands

1. **Create Command Handler** in `src/commands/sessions/`:

```typescript
// src/commands/sessions/new-command.ts
import { Command } from 'commander';
import { newSessionAction } from '../../actions/sessions/index.js';

export const newSessionCommand = new Command('new-command')
  .description('Description of the new command')
  .argument('<sessionId>', 'Session ID')
  .option('--option <value>', 'Command option')
  .action(async (sessionId, options) => {
    try {
      const result = await newSessionAction(sessionId, options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });
```

2. **Add Action Logic** in `src/actions/sessions/`:

```typescript
// src/actions/sessions/new-action.ts
import { getSessionStore } from '../../getStore.js';

export async function newSessionAction(sessionId: string, options: any) {
  const store = await getSessionStore();

  // Business logic implementation
  const session = await store.get(sessionId);

  return {
    sessionId,
    status: 'processed',
    timestamp: Date.now(),
  };
}
```

3. **Export Command** in `src/commands/sessions/index.ts`:

```typescript
import { newSessionCommand } from './new-command.js';

export const sessionCommands = new Command('sessions')
  .description('Manage OpenCode sessions')
  .alias('sess');

sessionCommands.addCommand(newSessionCommand);
```

### Session Types and Interfaces

```typescript
// src/types/SessionData.ts
export interface SessionData {
  id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
  activityStatus: 'active' | 'idle' | 'closed';
  metadata?: Record<string, any>;
  messages?: MessageData[];
}

export interface MessageData {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  metadata?: Record<string, any>;
}
```

## Working with Events

### Event Subscription Patterns

```typescript
// src/actions/events/subscribe.ts
export async function subscribe(options: SubscribeOptions = {}) {
  const { eventType, sessionId, query } = options;

  // Create subscription
  const subscription = await createSubscription({
    eventType,
    sessionId,
    query,
    callback: handleEvent,
  });

  return {
    subscriptionId: subscription.id,
    status: 'subscribed',
  };
}

function handleEvent(event: Event) {
  console.log(`Event received: ${event.type}`, event.data);
}
```

### Event Types

```typescript
export interface Event {
  id: string;
  type: string;
  sessionId?: string;
  timestamp: number;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export type EventType =
  | 'session_created'
  | 'session_updated'
  | 'session_closed'
  | 'message_sent'
  | 'message_updated'
  | 'tool_executed';
```

## Plugin Development

### Creating a New Plugin

1. **Plugin Structure**:

```typescript
// src/plugins/my-plugin/index.ts
import { Plugin, PluginContext } from '../../types/plugin-hooks.js';

export interface MyPluginConfig {
  option1: string;
  option2?: number;
}

export class MyPlugin implements Plugin {
  private config: MyPluginConfig;

  constructor(config: MyPluginConfig) {
    this.config = config;
  }

  async initialize(context: PluginContext): Promise<void> {
    // Plugin initialization logic
    console.log('MyPlugin initialized with config:', this.config);
  }

  async onSessionCreated(session: SessionData): Promise<void> {
    // Handle session creation
    console.log('Session created:', session.id);
  }

  async onMessageSent(message: MessageData): Promise<void> {
    // Handle message sending
    console.log('Message sent:', message.id);
  }

  async cleanup(): Promise<void> {
    // Plugin cleanup logic
    console.log('MyPlugin cleaned up');
  }
}
```

2. **Export Plugin**:

```typescript
// src/plugins/index.ts
export { MyPlugin } from './my-plugin/index.js';
export { default as MyPluginDefault } from './my-plugin/index.js';
```

3. **Plugin Usage**:

```typescript
import { MyPlugin } from '@promethean-os/opencode-client';

const plugin = new MyPlugin({
  option1: 'value1',
  option2: 42,
});

await plugin.initialize(context);
```

## Working with the Indexer Service

### Indexer Configuration

```typescript
// src/services/indexer.ts
export interface IndexerConfig {
  baseUrl: string;
  apiKey?: string;
  batchSize: number;
  flushInterval: number;
  retryAttempts: number;
}

export class IndexerService {
  private config: IndexerConfig;
  private isRunning = false;

  constructor(config: IndexerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Indexer service started');

    // Start indexing loop
    this.startIndexingLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('Indexer service stopped');
  }

  private async startIndexingLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processBatch();
        await this.sleep(this.config.flushInterval);
      } catch (error) {
        console.error('Indexer error:', error);
        await this.sleep(5000); // Backoff on error
      }
    }
  }
}
```

## Testing

### Unit Tests

Create test files alongside source files with `.test.ts` suffix:

```typescript
// src/tests/sessions/create.test.ts
import { describe, it, beforeEach, afterEach } from 'ava';
import { create } from '../../../actions/sessions/create.js';

describe('create session', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup test environment
  });

  it('should create a session successfully', async (t) => {
    const result = await create('Test Session', 'Initial message');

    t.truthy(result.sessionId);
    t.is(result.title, 'Test Session');
    t.is(result.message, 'Initial message');
  });
});
```

### Integration Tests

```typescript
// src/tests/e2e/complete-system.integration.test.ts
import { describe, it } from 'ava';
import { create, close, listSessions } from '../../actions/sessions/index.js';

describe('Complete System Integration', () => {
  it('should handle complete session lifecycle', async (t) => {
    // Create session
    const created = await create('Integration Test', 'Test message');
    t.truthy(created.sessionId);

    // List sessions
    const listed = await listSessions();
    t.true(listed.sessions.some((s) => s.id === created.sessionId));

    // Close session
    const closed = await close(created.sessionId);
    t.is(closed.status, 'closed');
  });
});
```

### Mock Testing

```typescript
// src/tests/mocks/store.ts
export class MockStore {
  private data = new Map<string, any>();

  async get(key: string): Promise<any> {
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}
```

## Debugging

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/opencode-client/dist/cli.js",
      "args": ["sessions", "list"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "opencode-client:*"
      },
      "console": "integratedTerminal",
      "outFiles": ["${workspaceFolder}/packages/opencode-client/dist/**/*.js"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/ava",
      "args": ["src/tests/sessions/create.test.ts"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging

```typescript
// Enable debug logging
process.env.DEBUG = 'opencode-client:*';

// Custom logging
import { createLogger } from '@promethean-os/logger';

const logger = createLogger('opencode-client');

logger.info('Processing session', { sessionId });
logger.error('Session operation failed', { sessionId, error: error.message });
logger.debug('Cache hit', { sessionId, timestamp });
```

### Common Debugging Scenarios

#### 1. Store Connection Issues

```typescript
// Check store connection
import { getStore } from '../getStore.js';

try {
  const store = await getStore();
  console.log('Store connected successfully');
} catch (error) {
  console.error('Store connection failed:', error.message);
}
```

#### 2. Event Subscription Problems

```typescript
// Debug event subscription
import { subscribe } from '../actions/events/subscribe.js';

const subscription = await subscribe({
  eventType: 'session_created',
  callback: (event) => {
    console.log('Event received:', event);
  },
});

console.log('Subscription created:', subscription.subscriptionId);
```

#### 3. Type Errors

```bash
# Use TypeScript compiler for detailed error info
npx tsc --noEmit --pretty

# Check specific file
npx tsc src/actions/sessions/create.ts --noEmit --pretty
```

## Performance Optimization

### Profiling

```typescript
import { performance } from 'perf_hooks';

export async function profiledFunction() {
  const start = performance.now();

  // Function logic here

  const end = performance.now();
  console.log(`Function took ${end - start} milliseconds`);
}
```

### Memory Management

```typescript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round((used.rss / 1024 / 1024) * 100) / 100,
    heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100,
    heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100,
    external: Math.round((used.external / 1024 / 1024) * 100) / 100,
  });
}, 30000);
```

### Batch Processing

```typescript
// Batch processing for better performance
export async function processBatchSessions(sessions: SessionData[]) {
  const batchSize = 10;
  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    await Promise.all(batch.map((session) => processSession(session)));

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
```

## Contributing

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/new-feature`
3. **Make** your changes
4. **Add** tests for new functionality
5. **Run** the test suite: `pnpm test`
6. **Build** the package: `pnpm build`
7. **Commit** your changes: `git commit -m "feat: add new feature"`
8. **Push** to your fork: `git push origin feature/new-feature`
9. **Create** a pull request

### Commit Message Format

Follow conventional commits:

```
feat: add new session command
fix: resolve type error in event handling
docs: update api documentation
refactor: improve store performance
test: add integration tests for indexer
chore: update dependencies
```

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] TypeScript compilation succeeds
- [ ] No console.log statements left in production code
- [ ] Error handling is appropriate
- [ ] Performance implications are considered
- [ ] Security implications are considered

## Release Process

### Version Management

```bash
# Update version
pnpm version patch  # or minor, major

# Build and publish
pnpm build
pnpm publish
```

### Changelog

Add entries to `changelog.d/YYYY.MM.DD.hh.mm.ss.md`:

```markdown
# Feature: New Session Management

## Summary

Added enhanced session management with improved search capabilities.

## Changes Made

- New command: sessions search
- Enhanced session metadata handling
- Improved error handling in session operations
- Added session diagnostics command

## Impact

Better session discovery and debugging capabilities
```

## Troubleshooting

### Common Development Issues

1. **TypeScript Compilation Errors**

   ```bash
   # Clear TypeScript cache
   rm -rf node_modules/.cache

   # Rebuild
   pnpm build
   ```

2. **Dependency Issues**

   ```bash
   # Clean install
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **OpenCode Connection Issues**

   ```bash
   # Check OpenCode server
   curl http://localhost:4096/health

   # Set custom OpenCode URL
   export OPENCODE_BASE_URL=http://localhost:4096
   ```

4. **Store Initialization Issues**

   ```bash
   # Check store configuration
   opencode-client sessions diagnose

   # Clear store cache
   rm -rf ~/.opencode-client/store
   ```

### Getting Help

- Check existing documentation in `docs/`
- Review test files for usage examples
- Look at similar implementations in the codebase
- Create an issue for bugs or feature requests
- Check the [Troubleshooting Guide](./troubleshooting.md) for common issues

For more troubleshooting information, see the [Troubleshooting Guide](./troubleshooting.md).
