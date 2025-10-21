# Development Guide - OpenCode Client

## Overview

This guide provides comprehensive documentation for developers working with the `@promethean/opencode-client` package, covering setup, development workflows, testing, and contribution guidelines.

## Prerequisites

### Required Tools

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **TypeScript** (v5 or higher)
- **Ollama** service running locally or accessible via network

### Development Environment Setup

```bash
# Clone the repository
git clone <repository-url>
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
│   ├── actions/
│   │   └── ollama/
│   │       ├── tools.ts          # High-level tool actions
│   │       ├── types.ts          # Type definitions
│   │       ├── jobs.ts           # Job management functions
│   │       ├── queue.ts          # Queue processing logic
│   │       └── index.ts          # Action exports
│   ├── tools/
│   │   ├── ollama.ts             # Main tool definitions
│   │   ├── Job.ts                # Job type definitions
│   │   ├── OllamaModel.ts        # Model type definitions
│   │   ├── CacheEntry.ts         # Cache entry types
│   │   └── *.ts                  # Individual tool implementations
│   ├── api/
│   │   ├── *.ts                  # API layer implementations
│   ├── plugins/
│   │   ├── *.ts                  # Plugin definitions
│   ├── factories/
│   │   ├── *.ts                  # Factory functions
│   ├── cli.ts                    # CLI interface
│   └── index.ts                  # Main entry point
├── docs/
│   ├── *.md                      # Documentation files
├── dist/                         # Compiled output
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
pnpm test path/to/test.test.ts
```

### 3. Building the Package

```bash
# Build for production
pnpm build

# Check for TypeScript errors
pnpm build --noEmit  # Type checking only
```

### 4. Local Development with Linked Packages

```bash
# Link the package for local development
pnpm link --global

# Use in another project
cd /path/to/other-project
pnpm link @promethean/opencode-client --global
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

- **Files**: kebab-case (`ollama-tools.ts`)
- **Functions**: camelCase (`submitJob`)
- **Variables**: camelCase (`jobQueue`)
- **Types**: PascalCase (`JobStatus`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CONCURRENT_JOBS`)

## Working with Ollama Queue Integration

### Understanding the Architecture

The Ollama queue integration consists of several layers:

1. **Tool Layer** (`src/tools/ollama.ts`): OpenCode tool definitions
2. **Action Layer** (`src/actions/ollama/`): High-level business logic
3. **Queue Layer** (`@promethean/ollama-queue`): Core queue management

### Adding New Tools

1. **Define the Tool** in `src/tools/ollama.ts`:

```typescript
export const newTool: any = tool({
  description: 'Description of what the tool does',
  args: {
    param1: tool.schema.string().describe('Parameter description'),
    param2: tool.schema.number().optional().describe('Optional parameter')
  },
  async execute(args, context) {
    const { param1, param2 } = args;
    const { agent, sessionID } = context;
    
    // Implementation logic here
    const result = await performOperation(param1, param2);
    
    return JSON.stringify(result);
  },
});
```

2. **Add Action Logic** in `src/actions/ollama/tools.ts`:

```typescript
export async function performOperation(param1: string, param2?: number) {
  // Business logic implementation
  // Use queue functions, cache, etc.
  
  return {
    success: true,
    data: result
  };
}
```

3. **Export the Tool** in `src/tools/ollama.ts`:

```typescript
export {
  // ... existing exports
  newTool
};
```

### Working with Jobs

#### Creating Custom Job Types

```typescript
// In src/actions/ollama/types.ts
export type CustomJobType = Job & {
  customField: string;
  customOptions?: {
    setting1: boolean;
    setting2: number;
  };
};

// In src/actions/ollama/jobs.ts
export function createCustomJob(params: CustomJobParams): CustomJobType {
  return {
    id: randomUUID(),
    type: 'custom',
    status: 'pending',
    // ... other job fields
    customField: params.customField,
    customOptions: params.customOptions
  };
}
```

#### Job Processing Logic

```typescript
// In src/actions/ollama/queue.ts
export async function processCustomJob(job: CustomJobType): Promise<void> {
  try {
    updateJobStatus(job.id, 'running', { startedAt: now() });
    
    // Custom processing logic
    const result = await performCustomOperation(job);
    
    updateJobStatus(job.id, 'completed', { 
      result, 
      completedAt: now() 
    });
  } catch (error) {
    updateJobStatus(job.id, 'failed', { 
      error: { message: error.message },
      completedAt: now() 
    });
  }
}
```

### Cache Integration

#### Custom Cache Operations

```typescript
import { initializeCache, checkCache, storeInCache } from '@promethean/ollama-queue';

export async function getCachedResult(key: string, modelName: string): Promise<any | null> {
  const cache = await initializeCache(modelName);
  const embedding = await getPromptEmbedding(key, modelName);
  
  const hits = cache.queryByEmbedding(embedding, {
    k: 1,
    filter: (metadata) => metadata.customKey === key
  });
  
  return hits.length > 0 ? hits[0].metadata.result : null;
}

export async function cacheResult(key: string, result: any, modelName: string): Promise<void> {
  await storeInCache(key, result, modelName, 'custom', {
    customKey: key,
    taskCategory: 'custom-operation'
  });
}
```

## Testing

### Unit Tests

Create test files alongside source files with `.test.ts` suffix:

```typescript
// src/tools/ollama.test.ts
import { describe, it, beforeEach, afterEach } from 'ava';
import { submitJob } from './ollama.js';

describe('submitJob', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup test environment
  });

  it('should submit a job successfully', async (t) => {
    const result = await submitJob.execute({
      modelName: 'test-model',
      jobType: 'generate',
      prompt: 'Test prompt'
    }, { agent: 'test-agent', sessionID: 'test-session' });

    const parsed = JSON.parse(result);
    t.is(parsed.status, 'pending');
    t.truthy(parsed.jobId);
  });
});
```

### Integration Tests

```typescript
// test-integration/ollama-queue.test.ts
import { describe, it } from 'ava';
import { submitJob, getJobStatus, getJobResult } from '../src/tools/ollama.js';

describe('Ollama Queue Integration', () => {
  it('should process a complete job lifecycle', async (t) => {
    // Submit job
    const jobResult = await submitJob.execute({
      modelName: 'llama2',
      jobType: 'generate',
      prompt: 'What is TypeScript?'
    }, { agent: 'test-agent', sessionID: 'test-session' });

    const { jobId } = JSON.parse(jobResult);

    // Wait for completion
    let status = 'pending';
    while (status !== 'completed' && status !== 'failed') {
      const statusResult = await getJobStatus.execute({ jobId });
      status = JSON.parse(statusResult).status;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Verify result
    t.is(status, 'completed');
    const result = await getJobResult.execute({ jobId });
    const parsedResult = JSON.parse(result);
    t.truthy(parsedResult.result);
  });
});
```

### Mock Testing

```typescript
// test/mocks/ollama-queue.ts
import { mock } from 'ts-mockito';

export const mockJobQueue = [];
export const mockActiveJobs = new Map();

export function mockOllamaQueue() {
  return {
    jobQueue: mockJobQueue,
    activeJobs: mockActiveJobs,
    getProcessingInterval: () => null,
    setProcessingInterval: () => {},
    clearProcessingInterval: () => {},
    now: () => Date.now()
  };
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
      "name": "Debug OpenCode Client",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/opencode-client/dist/cli.js",
      "args": ["--help"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "ollama-queue:*"
      },
      "console": "integratedTerminal",
      "outFiles": ["${workspaceFolder}/packages/opencode-client/dist/**/*.js"]
    }
  ]
}
```

### Logging

```typescript
// Enable debug logging
process.env.DEBUG = 'ollama-queue:*';

// Custom logging
import { createLogger } from '@promethean/utils';

const logger = createLogger('opencode-client');

logger.info('Processing job', { jobId, jobType });
logger.error('Job failed', { jobId, error: error.message });
logger.debug('Cache hit', { modelName, similarity });
```

### Common Debugging Scenarios

#### 1. Job Stuck in Pending

```typescript
// Check processor status
import { getProcessingInterval } from '@promethean/ollama-queue';

const interval = getProcessingInterval();
if (!interval) {
  console.log('Queue processor is not running');
  // Start it manually
  startQueueProcessor();
}
```

#### 2. Cache Issues

```typescript
// Clear cache for debugging
import { manageCache } from './tools/ollama.js';

await manageCache.execute({ action: 'clear' });
console.log('Cache cleared for debugging');
```

#### 3. Type Errors

```bash
# Use TypeScript compiler for detailed error info
npx tsc --noEmit --pretty

# Check specific file
npx tsc src/tools/ollama.ts --noEmit --pretty
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
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  });
}, 30000);
```

### Queue Optimization

```typescript
// Batch processing for better performance
export async function processBatchJobs(jobs: Job[]) {
  const batchSize = 5;
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    await Promise.all(batch.map(job => processJob(job)));
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
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
feat: add new ollama tool
fix: resolve type error in queue processor
docs: update api documentation
refactor: improve cache performance
test: add integration tests for job submission
```

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] TypeScript compilation succeeds
- [ ] No console.log statements left in production code
- [ ] Error handling is appropriate
- [ ] Performance implications are considered

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
# Feature: New Ollama Tool

## Summary
Added support for custom job processing with enhanced caching.

## Changes Made
- New tool: customProcessor
- Enhanced cache management
- Improved error handling

## Impact
Better performance for custom job types
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

3. **Ollama Connection Issues**
   ```bash
   # Check Ollama service
   curl http://localhost:11434/api/tags
   
   # Set custom Ollama URL
   export OLLAMA_URL=http://localhost:11434
   ```

### Getting Help

- Check existing documentation in `docs/`
- Review test files for usage examples
- Look at similar implementations in the codebase
- Create an issue for bugs or feature requests

For more troubleshooting information, see the [Troubleshooting Guide](./troubleshooting.md).