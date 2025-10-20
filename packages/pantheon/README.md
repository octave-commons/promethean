# Pantheon Agent Management Framework

A modern, functional programming-based framework for building and managing AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures.

## 🌟 Overview

Pantheon is a modular cognitive architecture that provides:

- **Functional Programming Architecture**: Clean ports/adapters pattern with full TypeScript coverage
- **Context Management**: Compile and manage agent contexts from multiple sources
- **Actor Lifecycle Management**: Complete actor lifecycle with LLM integration
- **MCP Integration**: Model Context Protocol tool adapter for standardized AI agent interfaces
- **Extensible Design**: Easy to add new providers, tools, and actor types
- **CLI Interface**: 6 powerful commands for agent management and interaction

## 🚀 Quick Start

### Installation

```bash
# Install framework
pnpm add @promethean/pantheon @promethean/pantheon-core @promethean/pantheon-mcp

# Or install globally for CLI usage
pnpm add -g @promethean/pantheon
```

### Basic Usage

```typescript
import {
  makeInMemoryContextAdapter,
  makeInMemoryActorStateAdapter,
  makeOrchestrator,
  createLLMActor,
  type ActorScript,
} from '@promethean/pantheon';

// Create adapters
const contextAdapter = makeInMemoryContextAdapter();
const actorStateAdapter = makeInMemoryActorStateAdapter();

// Compile context from sources
const context = await contextAdapter.compile({
  texts: ['Hello world, I am an AI agent'],
  sources: [{ id: 'sessions', label: 'Sessions' }],
});

console.log('Compiled context messages:', context.length);

// Create an actor script
const actorScript = createLLMActor('assistant', {
  model: 'demo-model',
  temperature: 0.7,
  systemPrompt: 'You are a helpful AI assistant.',
});

// Spawn the actor
const actor = await actorStateAdapter.spawn(actorScript, 'Assist users');

console.log('Created actor:', actor.id);
```

## 🛠 CLI Commands

The framework provides several CLI commands for actor and context management:

### Actor Management

```bash
# Create a new actor
pantheon actor:create llm my-assistant --goal "Help users with tasks"

# List all actors
pantheon actor:list

# Tick an actor (execute one cycle)
pantheon actor:tick <actor-id> --message "Hello, how are you?"

# Start an actor loop
pantheon actor:start <actor-id> --interval 5000
```

### Context Management

```bash
# Compile context from sources
pantheon context:compile --text "Hello world" --sources "sessions,agent-tasks"

# Output:
# Compiled context:
#   1. [user] Hello world
```

### Tool Management

```bash
# Execute a tool
pantheon tool:execute <tool-name> '{"arg1": "value1"}'
```

### Demo

```bash
# Run a framework demo
pantheon demo
```

## 🏗 Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Pantheon Framework                       │
├─────────────────────────────────────────────────────────────┤
│  CLI Interface                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │context:compile│ │actors:tick  │ │mcp:execute  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Core Adapters                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Context      │ │Actor        │ │Orchestrator │         │
│  │Adapter      │ │Adapter      │ │Adapter      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  LLM Integration                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │OpenAI       │ │LLM Actor    │ │Message      │         │
│  │Adapter      │ │Adapter      │ │Management   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  MCP Protocol                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Tool         │ │create_actor │ │tick_actor   │         │
│  │Adapter      │ │tool         │ │tool         │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Ports & Interfaces                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ToolPort     │ │ContextPort  │ │ActorPort    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Ports and Adapters Pattern

The framework follows a clean ports and adapters architecture:

- **Ports**: Define interfaces for core capabilities (ContextPort, ActorPort, ToolPort, LlmPort)
- **Adapters**: Implement these interfaces for specific technologies
- **Separation**: Business logic separated from infrastructure concerns

### Key Interfaces

```typescript
// Context management
interface ContextPort {
  compile(sources: string[], text: string): Promise<Context>;
  get(id: string): Promise<Context | null>;
  save(context: Context): Promise<void>;
}

// Actor lifecycle
interface ActorPort {
  tick(actorId: string): Promise<void>;
  create(config: ActorConfig): Promise<string>;
  get(id: string): Promise<Actor | null>;
}

// LLM integration
interface LlmPort {
  complete(messages: Message[], opts?: { model?: string; temperature?: number }): Promise<Message>;
}

// Tool execution
interface ToolPort {
  execute(command: string, args?: Record<string, unknown>): Promise<unknown>;
  list?(): Promise<string[]>;
  register?(tool: MCPTool): void;
}
```

## 📦 Package Structure

```
packages/pantheon/
├── src/
│   ├── actors/
│   │   ├── index.ts      # Actor creation utilities
│   │   └── llm-actor.ts  # LLM actor implementation
│   ├── adapters/
│   │   └── index.ts      # Adapter implementations
│   ├── cli/
│   │   └── index.ts      # CLI interface
│   ├── utils/
│   │   └── index.ts      # Utility functions
│   └── index.ts          # Main exports
├── package.json
└── tsconfig.json

packages/pantheon-core/
├── src/
│   ├── core/
│   │   ├── ports.ts      # Core port interfaces
│   │   ├── types.ts      # Type definitions
│   │   ├── context.ts    # Context adapter
│   │   ├── actors.ts     # Actor adapter
│   │   ├── orchestrator.ts
│   │   └── adapters.ts   # In-memory implementations
│   └── index.ts          # Core exports
├── package.json
└── tsconfig.json

packages/pantheon-mcp/
├── src/
│   └── index.ts          # MCP tool adapter
├── package.json
└── tsconfig.json

packages/pantheon-llm-openai/
├── src/
│   └── index.ts          # OpenAI LLM adapter
├── package.json
└── tsconfig.json
```

## 🔧 Configuration

### Environment Variables

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# Default Model Configuration
DEFAULT_MODEL=gpt-3.5-turbo
DEFAULT_TEMPERATURE=0.7

# Actor Configuration
MAX_MESSAGES=20
SYSTEM_PROMPT="You are a helpful AI assistant."
```

### Configuration Files

Create a `pantheon.config.json` in your project root:

```json
{
  "llm": {
    "defaultModel": "gpt-3.5-turbo",
    "temperature": 0.7,
    "maxTokens": 1000
  },
  "actors": {
    "maxMessages": 20,
    "defaultSystemPrompt": "You are a helpful AI assistant."
  },
  "context": {
    "defaultSources": ["sessions", "agent-tasks"],
    "cacheSize": 100
  },
  "mcp": {
    "tools": ["create_actor", "tick_actor", "compile_context"]
  }
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Run with coverage
pnpm coverage
```

## 📚 Examples

### Creating a Custom Actor

```typescript
import {
  makeInMemoryActorStateAdapter,
  makeOrchestrator,
  type ActorScript,
  type ActorStatePort,
} from '@promethean/pantheon';

interface CustomActorConfig {
  customLogic: (input: string) => Promise<string>;
}

function createCustomActorScript(name: string, config: CustomActorConfig): ActorScript {
  return {
    name,
    contextSources: [],
    talents: [
      {
        name: 'custom-talent',
        behaviors: [
          {
            name: 'custom-behavior',
            mode: 'active',
            plan: async ({ goal }) => {
              const result = await config.customLogic(goal);
              return {
                actions: [{ type: 'message', content: result, target: 'user' }],
              };
            },
          },
        ],
      },
    ],
  };
}

// Usage
const actorStateAdapter = makeInMemoryActorStateAdapter();
const actorScript = createCustomActorScript('my-custom-actor', {
  customLogic: async (input) => `Processed: ${input}`,
});

const actor = await actorStateAdapter.spawn(actorScript, 'Custom task');
```

### Adding Custom MCP Tools

```typescript
import { makeMCPToolAdapter, type MCPTool } from '@promethean/pantheon-mcp';

const customTool: MCPTool = {
  name: 'custom_analysis',
  description: 'Perform custom analysis on data',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'Data to analyze',
      },
      options: {
        type: 'object',
        description: 'Analysis options',
      },
    },
    required: ['data'],
  },
  handler: async (args) => {
    const { data, options = {} } = args;

    // Perform custom analysis
    const result = {
      analysis: `Analyzed: ${data}`,
      confidence: 0.95,
      timestamp: Date.now(),
    };

    return result;
  },
};

// Register the tool
const mcpAdapter = makeMCPToolAdapter();
mcpAdapter.register?.(customTool);
```

### Context Compilation with Multiple Sources

```typescript
import { makeContextAdapter } from '@promethean/pantheon-fp';

const contextAdapter = makeContextAdapter();

// Compile context from multiple sources
const context = await contextAdapter.compile(
  ['sessions', 'agent-tasks', 'user-preferences', 'system-config'],
  `User wants to create a new AI assistant with the following requirements:
   - Natural language processing
   - Memory management
   - Task automation
   - User preference learning`,
);

console.log('Compiled context with sources:', context.sources);
console.log('Context ID:', context.id);
```

## 🤝 Integration Patterns

### With Express.js

```typescript
import express from 'express';
import {
  makeInMemoryActorStateAdapter,
  makeOrchestrator,
  makeInMemoryLlmAdapter,
  createLLMActor,
  makeOpenAIAdapter,
} from '@promethean/pantheon';

const app = express();
app.use(express.json());

// Create adapters
const actorStateAdapter = makeInMemoryActorStateAdapter();
const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Create actor endpoint
app.post('/actors', async (req, res) => {
  try {
    const { name, prompt, model } = req.body;

    const actorScript = createLLMActor(name, {
      model: model || 'gpt-3.5-turbo',
      systemPrompt: prompt || 'You are a helpful AI assistant.',
    });

    const actor = await actorStateAdapter.spawn(actorScript, 'Assist users');
    res.json({ actorId: actor.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Message endpoint
app.post('/actors/:id/tick', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const actor = await actorStateAdapter.get(id);
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    const orchestrator = makeOrchestrator({
      now: () => Date.now(),
      log: console.log,
      context: makeInMemoryContextAdapter(),
      tools: makeInMemoryToolAdapter(),
      llm: llmAdapter,
      bus: makeInMemoryMessageBusAdapter(),
      schedule: makeInMemorySchedulerAdapter(),
      state: actorStateAdapter,
    });

    await orchestrator.tickActor(actor, { userMessage: message });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Pantheon server running on port 3000');
});
```

### With WebSocket

```typescript
import { WebSocketServer } from 'ws';
import { makeLLMActorAdapter, makeOpenAIAdapter } from '@promethean/pantheon-fp';

const wss = new WebSocketServer({ port: 8080 });
const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
});
const llmActorAdapter = makeLLMActorAdapter();

wss.on('connection', (ws) => {
  let actorId: string | null = null;

  ws.on('message', async (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'create':
        actorId = await llmActorAdapter.create({
          name: 'websocket-actor',
          type: 'llm',
          parameters: { model: 'gpt-3.5-turbo' },
          llm: llmAdapter,
          systemPrompt: 'You are a helpful AI assistant.',
          maxMessages: 20,
        });
        ws.send(JSON.stringify({ type: 'created', actorId }));
        break;

      case 'message':
        if (actorId) {
          await llmActorAdapter.addMessage(actorId, {
            role: 'user',
            content: message.content,
          });

          await llmActorAdapter.tick(actorId);

          const messages = await llmActorAdapter.getMessages(actorId);
          const response = messages[messages.length - 1];

          ws.send(
            JSON.stringify({
              type: 'response',
              content: response?.content,
            }),
          );
        }
        break;
    }
  });
});
```

## 🛡 Security Considerations

### API Key Management

```typescript
// Use environment variables for sensitive data
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Validate API key format
if (!apiKey.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format');
}
```

### Input Validation

```typescript
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().max(4000),
});

const ActorConfigSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['llm', 'tool', 'composite']),
  parameters: z.record(z.unknown()),
});

// Validate inputs
const validatedMessage = MessageSchema.parse(messageInput);
const validatedConfig = ActorConfigSchema.parse(configInput);
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  canMakeRequest(actorId: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.requests.get(actorId);

    if (!record || now > record.resetTime) {
      this.requests.set(actorId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count < limit) {
      record.count++;
      return true;
    }

    return false;
  }
}
```

## 📈 Performance Optimization

### Context Caching

```typescript
class ContextCache {
  private cache = new Map<string, { context: Context; expires: number }>();

  get(id: string): Context | null {
    const record = this.cache.get(id);
    if (!record) return null;

    if (Date.now() > record.expires) {
      this.cache.delete(id);
      return null;
    }

    return record.context;
  }

  set(id: string, context: Context, ttlMs: number = 300000): void {
    this.cache.set(id, {
      context,
      expires: Date.now() + ttlMs,
    });
  }
}
```

### Message History Management

```typescript
function optimizeMessageHistory(messages: Message[], maxTokens: number = 4000): Message[] {
  const optimized: Message[] = [];
  let totalTokens = 0;

  // Always include system message
  const systemMessage = messages.find((m) => m.role === 'system');
  if (systemMessage) {
    optimized.push(systemMessage);
    totalTokens += estimateTokens(systemMessage.content);
  }

  // Add recent messages until we hit the token limit
  const recentMessages = messages.filter((m) => m.role !== 'system').reverse();

  for (const message of recentMessages) {
    const tokens = estimateTokens(message.content);
    if (totalTokens + tokens > maxTokens) break;

    optimized.unshift(message);
    totalTokens += tokens;
  }

  return optimized;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Rough estimate
}
```

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Errors**

```bash
# Check API key
echo $OPENAI_API_KEY

# Test API connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.openai.com/v1/models
```

**Actor Not Found**

```typescript
// Check if actor exists
const actor = await actorAdapter.get(actorId);
if (!actor) {
  console.error(`Actor ${actorId} not found`);
  // Handle error appropriately
}
```

**Context Compilation Issues**

```typescript
try {
  const context = await contextAdapter.compile(sources, text);
} catch (error) {
  console.error('Context compilation failed:', error);
  // Check sources and text format
}
```

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
export DEBUG=pantheon:*
```

Or programmatically:

```typescript
process.env.DEBUG = 'pantheon:*';
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the existing code patterns**
4. **Add tests for new functionality**
5. **Update documentation**
6. **Submit a pull request**

### Development Setup

```bash
# Clone the repository
git clone https://github.com/promethean/pantheon.git
cd pantheon

# Install dependencies
pnpm install

# Build the packages
pnpm build

# Run tests
pnpm test

# Start development mode
pnpm dev
```

### Code Style

- Use TypeScript for all new code
- Follow the existing naming conventions
- Add JSDoc comments for all public APIs
- Ensure all code passes ESLint checks
- Write tests for all new functionality

## 📄 License

GPL-3.0-only - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Functional Programming**: Inspired by Elm and PureScript architectures
- **Ports and Adapters**: Based on Hexagonal Architecture principles
- **MCP Protocol**: Built on the Model Context Protocol standard
- **TypeScript**: Leveraging strong typing for better developer experience

## 📞 Support

- **Documentation**: [docs.pantheon.ai](https://docs.pantheon.ai)
- **Issues**: [GitHub Issues](https://github.com/promethean/pantheon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/promethean/pantheon/discussions)
- **Discord**: [Pantheon Community](https://discord.gg/pantheon)

---

Made with ❤️ by the Promethean team
