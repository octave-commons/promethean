# Development Guide

This guide provides comprehensive information for developers who want to contribute to or extend the OpenCode CLI client.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Adding New Commands](#adding-new-commands)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Code Style](#code-style)
- [Debugging](#debugging)
- [Performance](#performance)
- [Release Process](#release-process)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- TypeScript 5+
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd promethean/packages/opencode-client

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Link for local development
npm link
```

### Development Scripts

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## Project Structure

```
src/
├── cli.ts                    # Main CLI entry point
├── index.ts                  # Package entry point
├── api/                      # API abstraction layers
│   ├── ollama.ts            # Ollama API functions
│   └── sessions.ts          # Sessions API functions
├── commands/                 # Command implementations
│   ├── ollama/              # Ollama commands
│   │   ├── index.ts         # Command group
│   │   ├── submit.ts        # Submit job command
│   │   ├── list.ts          # List jobs command
│   │   ├── status.ts        # Job status command
│   │   ├── result.ts        # Job result command
│   │   ├── cancel.ts        # Cancel job command
│   │   ├── models.ts        # List models command
│   │   ├── info.ts          # Queue info command
│   │   └── cache.ts         # Cache management command
│   ├── sessions/            # Session commands
│   │   ├── index.ts         # Command group
│   │   ├── list.ts          # List sessions command
│   │   ├── get.ts           # Get session command
│   │   ├── create.ts        # Create session command
│   │   ├── close.ts         # Close session command
│   │   └── search.ts        # Search sessions command
│   └── pm2/                 # PM2 commands
│       └── index.ts         # PM2 command group
├── tools/                    # Tool implementations
│   ├── Job.ts               # Job type definitions
│   ├── OllamaModel.ts       # Model type definitions
│   ├── OllamaOptions.ts     # Options type definitions
│   ├── CacheEntry.ts        # Cache entry types
│   └── *.ts                 # Various utility tools
├── plugins/                  # Plugin system
│   ├── events.ts            # Event handling
│   └── session-manager.ts   # Session management
├── actions/                  # Action handlers
│   └── sessions/
│       └── index.ts         # Session actions
└── events.ts                 # Event definitions
```

### Key Files

#### `src/cli.ts`

Main CLI entry point that sets up the commander.js interface and registers all command groups.

#### `src/api/*.ts`

API abstraction layers that provide clean interfaces to OpenCode services. These files contain mock implementations that should be replaced with actual API calls.

#### `src/commands/**/*.ts`

Individual command implementations. Each command is a self-contained module that handles specific functionality.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/new-command
```

### 2. Implement Your Changes

- Add new commands in `src/commands/`
- Update API functions in `src/api/`
- Add types in `src/tools/`
- Update tests

### 3. Test Your Changes

```bash
# Run unit tests
npm test

# Test the CLI manually
npm start -- --help
npm start -- ollama --help
```

### 4. Lint and Format

```bash
npm run lint
npm run format
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add new command"
git push origin feature/new-command
```

### 6. Create a Pull Request

- Provide a clear description
- Include screenshots if applicable
- Link to relevant issues

## Adding New Commands

### Step 1: Create the Command File

Create a new file in the appropriate category directory:

```typescript
// src/commands/example/new-command.ts
import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';

export const newCommand = new Command('new-command')
  .description('Description of what this command does')
  .option('-f, --file <path>', 'Input file path')
  .option('-o, --output <path>', 'Output file path')
  .option('--format <type>', 'Output format', 'json')
  .argument('[input]', 'Input argument')
  .action(async (input, options) => {
    const spinner = ora('Processing...').start();

    try {
      // Your command logic here
      spinner.succeed('Command completed successfully');

      // Display results
      if (options.format === 'table') {
        const table = new Table({
          head: ['Column 1', 'Column 2'],
          colWidths: [20, 30],
        });
        table.push(['Value 1', 'Value 2']);
        console.log(table.toString());
      } else {
        console.log(JSON.stringify({ result: 'success' }, null, 2));
      }
    } catch (error) {
      spinner.fail('Command failed');
      console.error(chalk.red('Error:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });
```

### Step 2: Export from Category Index

Update the category's index file:

```typescript
// src/commands/example/index.ts
import { Command } from 'commander';
import { newCommand } from './new-command.js';

export { newCommand };

export const exampleCommands = new Command('example')
  .description('Example command group')
  .addCommand(newCommand);
```

### Step 3: Register in Main CLI

Update the main CLI file:

```typescript
// src/cli.ts
import { exampleCommands } from './commands/example/index.js';

// Add to the program
program.addCommand(exampleCommands);
```

### Step 4: Add Tests

Create test files for your command:

```typescript
// tests/commands/example/new-command.test.ts
import { describe, it, expect } from '@jest/globals';
import { newCommand } from '../../../src/commands/example/new-command.js';

describe('new-command', () => {
  it('should have correct configuration', () => {
    expect(newCommand.name()).toBe('new-command');
    expect(newCommand.description()).toContain('Description');
  });

  it('should handle options correctly', () => {
    // Test option parsing and validation
  });
});
```

## API Integration

### Replacing Mock Implementations

The current API functions use mock implementations. Here's how to replace them with real API calls:

#### 1. Create HTTP Client

```typescript
// src/utils/http-client.ts
export class HttpClient {
  private baseUrl: string;
  private authToken?: string;
  private timeout: number;

  constructor(config: { baseUrl: string; authToken?: string; timeout?: number }) {
    this.baseUrl = config.baseUrl;
    this.authToken = config.authToken;
    this.timeout = config.timeout || 30000;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
```

#### 2. Update API Functions

```typescript
// src/api/ollama.ts
import { HttpClient } from '../utils/http-client.js';

const client = new HttpClient({
  baseUrl: process.env.OPENCODE_SERVER_URL || 'http://localhost:3000',
  authToken: process.env.OPENCODE_AUTH_TOKEN,
  timeout: parseInt(process.env.OPENCODE_TIMEOUT || '30000'),
});

export async function listJobs(options: JobOptions): Promise<Job[]> {
  const params = new URLSearchParams();

  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.agentOnly !== undefined) {
    params.append('agentOnly', options.agentOnly.toString());
  }

  return client.request<Job[]>(`/api/ollama-queue/listJobs?${params}`);
}

export async function submitJob(options: SubmitJobOptions): Promise<Job> {
  return client.request<Job>('/api/ollama-queue/submitJob', {
    method: 'POST',
    body: JSON.stringify(options),
  });
}
```

### Error Handling

Implement comprehensive error handling:

```typescript
// src/utils/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string) {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

### Configuration Management

Create a configuration system:

```typescript
// src/config/index.ts
export interface Config {
  server: {
    url: string;
    timeout: number;
    retries: number;
  };
  auth?: {
    type: 'bearer' | 'apikey' | 'custom';
    token?: string;
    key?: string;
    header?: string;
  };
  defaults: {
    model: string;
    priority: string;
    jobType: string;
  };
}

export function loadConfig(): Config {
  // Load from config file, environment variables, and defaults
  const configPath = path.join(os.homedir(), '.opencode', 'config.json');

  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  return {
    server: {
      url: process.env.OPENCODE_SERVER_URL || 'http://localhost:3000',
      timeout: parseInt(process.env.OPENCODE_TIMEOUT || '30000'),
      retries: parseInt(process.env.OPENCODE_RETRIES || '3'),
      ...fileConfig.server,
    },
    auth: {
      type: 'bearer',
      token: process.env.OPENCODE_AUTH_TOKEN,
      ...fileConfig.auth,
    },
    defaults: {
      model: 'llama2',
      priority: 'medium',
      jobType: 'generate',
      ...fileConfig.defaults,
    },
  };
}
```

## Testing

### Unit Tests

Use Jest for unit testing:

```typescript
// tests/api/ollama.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { listJobs, submitJob } from '../../src/api/ollama.js';
import { HttpClient } from '../../src/utils/http-client.js';

// Mock the HTTP client
jest.mock('../../src/utils/http-client.js');

describe('Ollama API', () => {
  let mockClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockClient = new HttpClient({ baseUrl: 'http://test' }) as jest.Mocked<HttpClient>;
    (HttpClient as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listJobs', () => {
    it('should list jobs with default options', async () => {
      const mockJobs = [
        { id: 'job1', status: 'pending' },
        { id: 'job2', status: 'completed' },
      ];

      mockClient.request.mockResolvedValue(mockJobs);

      const jobs = await listJobs({});

      expect(mockClient.request).toHaveBeenCalledWith(
        '/api/ollama-queue/listJobs?agentOnly=true&limit=50',
      );
      expect(jobs).toEqual(mockJobs);
    });

    it('should handle API errors', async () => {
      mockClient.request.mockRejectedValue(new Error('Network error'));

      await expect(listJobs({})).rejects.toThrow('Network error');
    });
  });
});
```

### Integration Tests

Test the full CLI:

```typescript
// tests/cli.test.ts
import { describe, it, expect } from '@jest/globals';
import { spawn } from 'child_process';
import path from 'path';

describe('CLI Integration', () => {
  const cliPath = path.join(__dirname, '../dist/cli.js');

  it('should display help', (done) => {
    const child = spawn('node', [cliPath, '--help']);

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('CLI client for OpenCode');
      done();
    });
  });

  it('should handle ollama commands', (done) => {
    const child = spawn('node', [cliPath, 'ollama', '--help']);

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('Ollama commands');
      done();
    });
  });
});
```

### Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

## Code Style

### TypeScript Configuration

Use strict TypeScript settings:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: ['@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/cli.ts",
      "args": ["--help"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    }
  ]
}
```

### Logging

Implement structured logging:

```typescript
// src/utils/logger.ts
import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(`[INFO] ${message}`), ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.log(chalk.yellow(`[WARN] ${message}`), ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.log(chalk.red(`[ERROR] ${message}`), ...args);
    }
  }
}

export const logger = new Logger(process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO);
```

## Performance

### Optimization Tips

1. **Lazy Loading**: Load modules only when needed
2. **Caching**: Cache API responses when appropriate
3. **Streaming**: Use streaming for large data sets
4. **Concurrency**: Use Promise.all for parallel operations

### Example: Lazy Loading

```typescript
// src/commands/heavy/index.ts
export const heavyCommand = new Command('heavy')
  .description('Heavy command that loads modules on demand')
  .action(async () => {
    // Load heavy modules only when command is executed
    const { heavyProcessor } = await import('./heavy-processor.js');
    await heavyProcessor.run();
  });
```

### Example: Caching

```typescript
// src/utils/cache.ts
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  set(key: string, value: T, ttlMs: number = 60000) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }
}
```

## Release Process

### Version Management

Use semantic versioning:

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### Build and Publish

```bash
# Build the project
npm run build

# Run tests
npm test

# Publish to npm
npm publish
```

### Changelog

Maintain a changelog:

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added

- New search command for sessions
- Configuration file support
- Improved error messages

### Fixed

- Fixed timeout handling in API calls
- Resolved memory leak in cache

### Changed

- Updated dependencies
- Improved CLI help text
```

### GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Contributing Guidelines

### Before Contributing

1. Read the existing code and documentation
2. Create an issue for your proposed change
3. Get feedback from maintainers

### Making Changes

1. Create a feature branch from `main`
2. Write clean, well-documented code
3. Add comprehensive tests
4. Update documentation
5. Submit a pull request

### Code Review Process

1. All changes require review
2. Maintain test coverage above 80%
3. Follow the established code style
4. Update changelog for user-facing changes

### Community

- Join our Discord server
- Participate in discussions
- Help other contributors
- Share your use cases
