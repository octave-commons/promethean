# OpenCode Client

TypeScript client for OpenCode with Ollama LLM queue management and asynchronous job processing.

## Installation

```bash
pnpm add @promethean-os/opencode-client
```

## Quick Start

```typescript
import { submitJob, getJobStatus, getJobResult } from '@promethean-os/opencode-client';

// Submit a job to the queue
const job = await submitJob.execute(
  {
    modelName: 'llama2',
    jobType: 'generate',
    prompt: 'Explain TypeScript compilation',
    priority: 'medium',
  },
  {
    agent: 'my-agent',
    sessionID: 'session-123',
  },
);

const { jobId } = JSON.parse(job);
console.log('Job submitted:', jobId);

// Check job status
const status = await getJobStatus.execute({ jobId });
console.log('Job status:', JSON.parse(status));

// Get result when complete
const result = await getJobResult.execute({ jobId });
console.log('Job result:', JSON.parse(result));
```

## Key Features

### 🚀 Asynchronous Job Processing

- Queue-based job management with priority handling
- Automatic retry and error recovery
- Concurrent job processing with configurable limits

### 💾 Intelligent Caching

- Semantic similarity-based cache hits
- Performance tracking and optimization
- User feedback integration for model routing

### 🔧 TypeScript-First Design

- Full type safety with comprehensive type definitions
- Proper error handling and validation
- Modern ES6+ patterns and practices

### 📊 Monitoring and Debugging

- Comprehensive logging and metrics
- Health check endpoints
- Performance profiling tools

## Core Tools

| Tool             | Purpose                     | Example                                           |
| ---------------- | --------------------------- | ------------------------------------------------- |
| `submitJob`      | Submit new LLM job          | `submitJob.execute({modelName, jobType, prompt})` |
| `getJobStatus`   | Check job status            | `getJobStatus.execute({jobId})`                   |
| `getJobResult`   | Get completed result        | `getJobResult.execute({jobId})`                   |
| `listJobs`       | List jobs with filters      | `listJobs.execute({status: 'completed'})`         |
| `cancelJob`      | Cancel pending job          | `cancelJob.execute({jobId})`                      |
| `listModels`     | List available models       | `listModels.execute({detailed: true})`            |
| `getQueueInfo`   | Get queue statistics        | `getQueueInfo.execute({})`                        |
| `manageCache`    | Cache operations            | `manageCache.execute({action: 'stats'})`          |
| `submitFeedback` | Submit performance feedback | `submitFeedback.execute({prompt, score})`         |

## Job Types

- **Generate**: Single-prompt text generation
- **Chat**: Multi-turn conversations
- **Embedding**: Text vector embeddings

## Priority Levels

- **Urgent**: Highest priority, processed first
- **High**: Important tasks
- **Medium**: Default priority
- **Low**: Background processing

## Documentation

### Core Documentation

- **[API Reference](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/api-reference.md)** - Complete API documentation for all functions and tools
- **[Development Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/development-guide.md)** - Setup, development workflows, and contribution guidelines
- **[Usage Examples](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/usage-examples.md)** - Comprehensive examples and workflows
- **[Troubleshooting Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/troubleshooting.md)** - Common issues and solutions

### Additional Documentation

- **[Ollama Queue Integration](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/ollama-queue-integration.md)** - Comprehensive guide to queue management and job processing
- **[TypeScript Compilation Fixes](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/typescript-compilation-fixes.md)** - Recent TypeScript fixes and type safety improvements
- **[Spawn Command](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/spawn-command.md)** - Quick session creation with spawn message
- **[Integration Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/integration.md)** - Integration patterns and best practices

## Setup & Configuration

### Prerequisites

- Node.js 18+ and TypeScript 5+
- Ollama service running locally or accessible via network
- pnpm package manager

### Install and Configure Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull a model
ollama pull llama2
```

### Basic Configuration

```typescript
// Configure Ollama URL (optional, defaults to localhost:11434)
process.env.OLLAMA_URL = 'http://localhost:11434';

// Enable debug logging (optional)
process.env.DEBUG = 'ollama-queue:*';
```

## Common Usage Patterns

### Batch Processing

```typescript
async function processBatch(prompts: string[]) {
  const jobs = prompts.map((prompt) =>
    submitJob.execute(
      {
        modelName: 'llama2',
        jobType: 'generate',
        prompt,
        priority: 'medium',
      },
      context,
    ),
  );

  const results = await Promise.all(jobs);
  return results.map((result) => JSON.parse(result));
}
```

### Chat Conversations

```typescript
async function chatConversation(messages: Array<{ role: string; content: string }>) {
  return await submitJob.execute(
    {
      modelName: 'llama2',
      jobType: 'chat',
      messages,
      options: {
        temperature: 0.5,
      },
    },
    context,
  );
}
```

### Text Embeddings

```typescript
async function generateEmbeddings(texts: string[]) {
  return await submitJob.execute(
    {
      modelName: 'all-minilm',
      jobType: 'embedding',
      input: texts,
    },
    context,
  );
}
```

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/riatzukiza/promethean.git
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

For detailed development guidelines, see the [Development Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/development-guide.md).

## Support and Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**: See [TypeScript Compilation Fixes](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/typescript-compilation-fixes.md)
2. **Queue Processing Issues**: See [Troubleshooting Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/troubleshooting.md)
3. **Ollama Connection Problems**: Ensure Ollama service is running
4. **Cache Issues**: Clear cache with `manageCache.execute({action: 'clear'})`

### Getting Help

- Check the [Troubleshooting Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/troubleshooting.md) for common issues
- Review the [API Reference](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/api-reference.md) for detailed usage
- Enable debug logging: `process.env.DEBUG = 'ollama-queue:*'`
- Create an issue with detailed error information

### Health Check

```typescript
import { getQueueInfo, listModels } from '@promethean-os/opencode-client';

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

## License

This project is licensed under the GPL-3.0 License. See the [LICENSE](https://github.com/riatzukiza/promethean/tree/main/LICENSE.txt) file for details.

## Related Packages

- **@promethean-os/ollama-queue**: Core queue management system
- **@promethean-os/persistence**: Data persistence layer
- **@opencode-ai/plugin**: OpenCode plugin framework
- **@opencode-ai/sdk**: OpenCode SDK
