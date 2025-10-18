# OpenCode Client Documentation

## Overview

The `@promethean/opencode-client` package provides a comprehensive TypeScript-based client for interacting with OpenCode plugins and tools, with specialized support for Ollama LLM queue management and asynchronous job processing.

## Quick Start

### Installation

```bash
# Install the package
pnpm add @promethean/opencode-client

# Or install in the monorepo
cd packages/opencode-client
pnpm install
```

### Basic Usage

```typescript
import { submitJob, getJobStatus, getJobResult } from '@promethean/opencode-client';

// Submit a job to the queue
const job = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'generate',
  prompt: 'Explain TypeScript compilation',
  priority: 'medium'
}, {
  agent: 'my-agent',
  sessionID: 'session-123'
});

const { jobId } = JSON.parse(job);
console.log('Job submitted:', jobId);

// Check job status
const status = await getJobStatus.execute({ jobId });
console.log('Job status:', JSON.parse(status));

// Get result when complete
const result = await getJobResult.execute({ jobId });
console.log('Job result:', JSON.parse(result));
```

## Documentation Structure

### Core Documentation

- **[TypeScript Compilation Fixes](./typescript-compilation-fixes.md)** - Details about recent TypeScript fixes and type safety improvements
- **[API Reference](./api-reference.md)** - Complete API documentation for all functions and tools
- **[Ollama Queue Integration](./ollama-queue-integration.md)** - Comprehensive guide to queue management and job processing
- **[Development Guide](./development-guide.md)** - Setup, development workflows, and contribution guidelines
- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues and solutions

### Key Features

#### 🚀 Asynchronous Job Processing
- Queue-based job management with priority handling
- Automatic retry and error recovery
- Concurrent job processing with configurable limits

#### 💾 Intelligent Caching
- Semantic similarity-based cache hits
- Performance tracking and optimization
- User feedback integration for model routing

#### 🔧 TypeScript-First Design
- Full type safety with comprehensive type definitions
- Proper error handling and validation
- Modern ES6+ patterns and practices

#### 📊 Monitoring and Debugging
- Comprehensive logging and metrics
- Health check endpoints
- Performance profiling tools

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Tools  │───▶│   Job Queue      │───▶│  Ollama API     │
│                 │    │                  │    │                 │
│ • submitJob     │    │ • Priority Queue │    │ • Generate      │
│ • getJobStatus  │    │ • Concurrent     │    │ • Chat          │
│ • cancelJob     │    │ • Retry Logic    │    │ • Embedding     │
│ • listJobs      │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Cache Layer     │◀───────────┘
                        │                  │
                        │ • Semantic Cache │
                        │ • Performance    │
                        │ • Feedback       │
                        └──────────────────┘
```

## Recent Updates

### TypeScript Compilation Fixes (October 2025)

The package recently underwent significant TypeScript compilation fixes to resolve build errors and improve type safety:

- ✅ Fixed `setProcessingInterval(null)` type mismatch
- ✅ Updated imports to use proper `clearProcessingInterval()` function
- ✅ Removed unused imports and functions
- ✅ Enhanced type safety across the codebase
- ✅ All builds now succeed without errors

**Key Changes:**
- Updated `src/tools/ollama.ts` to use proper queue management functions
- Cleaned up `src/actions/ollama/tools.ts` imports and implementations
- Established best practices for queue processor lifecycle management

For detailed technical information, see the [TypeScript Compilation Fixes](./typescript-compilation-fixes.md) document.

## Getting Started Guide

### 1. Prerequisites

- Node.js 18+ and TypeScript 5+
- Ollama service running locally or accessible via network
- pnpm package manager

### 2. Setup Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull a model
ollama pull llama2
```

### 3. Basic Configuration

```typescript
// Configure Ollama URL (optional, defaults to localhost:11434)
process.env.OLLAMA_URL = 'http://localhost:11434';

// Enable debug logging (optional)
process.env.DEBUG = 'ollama-queue:*';
```

### 4. Your First Job

```typescript
import { submitJob, getJobResult } from '@promethean/opencode-client';

async function firstJob() {
  try {
    // Submit a generation job
    const jobResult = await submitJob.execute({
      modelName: 'llama2',
      jobType: 'generate',
      prompt: 'What are the benefits of TypeScript?',
      options: {
        temperature: 0.7,
        num_predict: 300
      }
    }, {
      agent: 'demo-agent',
      sessionID: 'demo-session'
    });

    const { jobId } = JSON.parse(jobResult);
    console.log('Job submitted with ID:', jobId);

    // Wait for completion and get result
    // Note: In production, you'd want to poll status or use events
    setTimeout(async () => {
      const result = await getJobResult.execute({ jobId });
      console.log('Job result:', JSON.parse(result));
    }, 5000);

  } catch (error) {
    console.error('Job failed:', error.message);
  }
}

firstJob();
```

## Common Usage Patterns

### Batch Processing

```typescript
async function processBatch(prompts: string[]) {
  const jobs = prompts.map(prompt => 
    submitJob.execute({
      modelName: 'llama2',
      jobType: 'generate',
      prompt,
      priority: 'medium'
    }, context)
  );

  const results = await Promise.all(jobs);
  return results.map(result => JSON.parse(result));
}
```

### Chat Conversations

```typescript
async function chatConversation(messages: Array<{role: string, content: string}>) {
  return await submitJob.execute({
    modelName: 'llama2',
    jobType: 'chat',
    messages,
    options: {
      temperature: 0.5
    }
  }, context);
}
```

### Text Embeddings

```typescript
async function generateEmbeddings(texts: string[]) {
  return await submitJob.execute({
    modelName: 'all-minilm',
    jobType: 'embedding',
    input: texts
  }, context);
}
```

## API Overview

### Core Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `submitJob` | Submit new LLM job | `submitJob.execute({modelName, jobType, prompt})` |
| `getJobStatus` | Check job status | `getJobStatus.execute({jobId})` |
| `getJobResult` | Get completed result | `getJobResult.execute({jobId})` |
| `listJobs` | List jobs with filters | `listJobs.execute({status: 'completed'})` |
| `cancelJob` | Cancel pending job | `cancelJob.execute({jobId})` |
| `listModels` | List available models | `listModels.execute({detailed: true})` |
| `getQueueInfo` | Get queue statistics | `getQueueInfo.execute({})` |
| `manageCache` | Cache operations | `manageCache.execute({action: 'stats'})` |
| `submitFeedback` | Submit performance feedback | `submitFeedback.execute({prompt, score})` |

### Job Types

- **Generate**: Single-prompt text generation
- **Chat**: Multi-turn conversations
- **Embedding**: Text vector embeddings

### Priority Levels

- **Urgent**: Highest priority, processed first
- **High**: Important tasks
- **Medium**: Default priority
- **Low**: Background processing

## Development

### Building from Source

```bash
# Clone repository
git clone <repository-url>
cd promethean/packages/opencode-client

# Install dependencies
pnpm install

# Build the package
pnpm build

# Run in development mode
pnpm dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure build passes
6. Submit a pull request

For detailed development guidelines, see the [Development Guide](./development-guide.md).

## Support and Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**: See [TypeScript Compilation Fixes](./typescript-compilation-fixes.md)
2. **Queue Processing Issues**: See [Troubleshooting Guide](./troubleshooting.md)
3. **Ollama Connection Problems**: Ensure Ollama service is running
4. **Cache Issues**: Clear cache with `manageCache.execute({action: 'clear'})`

### Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md) for common issues
- Review the [API Reference](./api-reference.md) for detailed usage
- Enable debug logging: `process.env.DEBUG = 'ollama-queue:*'`
- Create an issue with detailed error information

### Health Check

```typescript
import { getQueueInfo, listModels } from '@promethean/opencode-client';

async function healthCheck() {
  try {
    // Check queue
    const queueInfo = await getQueueInfo.execute({});
    console.log('Queue healthy:', JSON.parse(queueInfo));

    // Check Ollama
    const models = await listModels.execute({ detailed: false });
    console.log('Ollama healthy:', JSON.parse(models));

    console.log('✅ All systems operational');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

healthCheck();
```

## License

This project is licensed under the GPL-3.0 License. See the [LICENSE](../../LICENSE.txt) file for details.

## Related Packages

- **@promethean/ollama-queue**: Core queue management system
- **@promethean/persistence**: Data persistence layer
- **@opencode-ai/plugin**: OpenCode plugin framework
- **@opencode-ai/sdk**: OpenCode SDK

## Changelog

Recent changes are documented in the `changelog.d/` directory. The most recent significant update was the TypeScript compilation fixes in October 2025, which resolved all build errors and improved type safety across the package.