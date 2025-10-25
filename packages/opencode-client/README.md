# OpenCode Client

TypeScript client for OpenCode with comprehensive session management, event processing, and context indexing capabilities.

## Installation

```bash
pnpm add @promethean-os/opencode-client
```

## Quick Start

```typescript
import { spawnSession, listSessions, sendPrompt, listEvents } from '@promethean-os/opencode-client';

// Create a new session
const session = await spawnSession.execute({
  title: 'Development Session',
  message: 'Start working on TypeScript project',
});

const { session: sessionData } = JSON.parse(session);
console.log('Session created:', sessionData.id);

// Send a message to the session
const message = await sendPrompt.execute({
  sessionId: sessionData.id,
  content: 'Analyze the codebase for performance issues',
  type: 'instruction',
});

console.log('Message sent:', JSON.parse(message));

// List all active sessions
const sessions = await listSessions.execute({ limit: 10 });
console.log('Active sessions:', JSON.parse(sessions));
```

## Key Features

### 🚀 Session Management

- Create, list, and manage OpenCode sessions
- Real-time session status tracking
- Interactive messaging within sessions
- Session lifecycle management

### 📊 Event Processing

- Comprehensive event tracking and querying
- Real-time event streaming
- Event filtering and aggregation
- Historical event analysis

### 🔍 Context Indexing

- Full-text search across sessions, events, and messages
- Semantic search capabilities
- Context compilation for analysis
- Intelligent result ranking

### 🔧 TypeScript-First Design

- Full type safety with comprehensive type definitions
- Proper error handling and validation
- Modern ES6+ patterns and practices

### 📋 Plugin System

- Extensible architecture for custom functionality
- Built-in plugins for common operations
- Tool registration and execution
- Cross-plugin communication

## Core Tools

| Tool             | Purpose                       | Example                                                  |
| ---------------- | ----------------------------- | -------------------------------------------------------- |
| `spawnSession`   | Create new session            | `spawnSession.execute({title, message})`                 |
| `listSessions`   | List sessions                 | `listSessions.execute({limit: 20})`                      |
| `sendPrompt`     | Send message to session       | `sendPrompt.execute({sessionId, content})`               |
| `listMessages`   | Get session messages          | `listMessages.execute({sessionId, limit: 50})`           |
| `closeSession`   | Close session                 | `closeSession.execute({sessionId})`                      |
| `listEvents`     | List system events            | `listEvents.execute({limit: 100})`                       |
| `searchContext`  | Search across content         | `searchContext.execute({query, limit: 20})`              |
| `compileContext` | Compile comprehensive context | `compileContext.execute({query, includeSessions: true})` |

## Documentation

### Core Documentation

- **[API Reference](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/api-reference.md)** - Complete API documentation for all functions and tools
- **[Development Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/development-guide.md)** - Setup, development workflows, and contribution guidelines
- **[Usage Examples](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/usage-examples.md)** - Comprehensive examples and workflows
- **[Troubleshooting Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/troubleshooting.md)** - Common issues and solutions

### Additional Documentation

- **[OpenCode Client Integration](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/ollama-queue-integration.md)** - Comprehensive guide to OpenCode client integration
- **[TypeScript Compilation Fixes](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/typescript-compilation-fixes.md)** - Recent TypeScript fixes and type safety improvements
- **[Spawn Command](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/spawn-command.md)** - Quick session creation with spawn message
- **[Integration Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/integration.md)** - Integration patterns and best practices
- **[Indexer Service Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/indexer-service-guide.md)** - Search and context compilation documentation
- **[Plugin System Guide](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/plugin-system-guide.md)** - Plugin development and management
- **[Unified Agent Management](https://github.com/riatzukiza/promethean/tree/main/packages/opencode-client/docs/unified-agent-management.md)** - High-level agent session management

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
