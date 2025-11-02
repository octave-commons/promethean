# Pantheon Documentation Hub

## Welcome to Pantheon

Pantheon is a comprehensive framework for building and managing AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures. This documentation hub provides complete coverage of all Pantheon packages and their integration patterns.

## 🚀 Quick Start

### Installation

```bash
# Core framework
pnpm add @promethean-os/pantheon @promethean-os/pantheon-core

# Complete ecosystem
pnpm add @promethean-os/pantheon @promethean-os/pantheon-core @promethean-os/pantheon-mcp @promethean-os/persistence

# LLM integrations
pnpm add @promethean-os/pantheon-llm-openai @promethean-os/pantheon-llm-claude @promethean-os/pantheon-llm-opencode

# Coordination and UI
pnpm add @promethean-os/pantheon-coordination @promethean-os/pantheon-ui

# Frontend
pnpm add @promethean-os/frontend
```

### Basic Usage

```typescript
import { makeOrchestrator, makeInMemoryContextAdapter } from '@promethean-os/pantheon';
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

// Create adapters
const contextAdapter = makeInMemoryContextAdapter();
const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Create orchestrator
const orchestrator = makeOrchestrator({
  now: () => Date.now(),
  log: console.log,
  context: contextAdapter,
  tools: toolAdapter,
  llm: llmAdapter,
  bus: messageBus,
  schedule: scheduler,
  state: actorStateAdapter,
});

// Start using Pantheon
await orchestrator.tickActor(actor, { userMessage: 'Hello!' });
```

## 📚 Documentation Structure

### Core Documentation

| Document                  | Description                                |
| ------------------------- | ------------------------------------------ |
| [[package-overview]]      | Complete overview of all Pantheon packages |
| [[architecture-overview]] | System design and architectural principles |
| [[api-reference]]         | Complete API documentation                 |
| [[type-system-reference]] | Comprehensive type definitions             |

### Package Documentation

| Package                   | Description                                | Documentation             |
| ------------------------- | ------------------------------------------ | ------------------------- |
| [[pantheon-core]]         | Core framework with types and interfaces   | [[pantheon-core]]         |
| [[pantheon]]              | Main framework with CLI and adapters       | [[pantheon]]              |
| [[pantheon-mcp]]          | Model Context Protocol integration         | [[pantheon-mcp]]          |
| [[pantheon-llm-openai]]   | OpenAI API integration                     | [[pantheon-llm-openai]]   |
| [[pantheon-llm-claude]]   | Anthropic Claude API integration           | [[pantheon-llm-claude]]   |
| [[pantheon-llm-opencode]] | OpenCode local LLM integration             | [[pantheon-llm-opencode]] |
| [[pantheon-protocol]]     | Message protocol and transports            | [[pantheon-protocol]]     |
| [[pantheon-orchestrator]] | Agent coordination system                  | [[pantheon-orchestrator]] |
| [[pantheon-state]]        | Agent state management via event sourcing  | [[pantheon-state]]        |
| [[pantheon-persistence]]  | Context port adapter for persistence layer | [[pantheon-persistence]]  |
| [[pantheon-coordination]] | Advanced multi-agent coordination system   | [[pantheon-coordination]] |
| [[pantheon-ui]]           | Agent management web components            | [[pantheon-ui]]           |
| [[frontend]]              | Complete web frontend                      | [[frontend]]              |

### Guides and Tutorials

| Guide                    | Description                        |
| ------------------------ | ---------------------------------- |
| [[developer-guide]]      | Getting started and best practices |
| [[actor-model-guide]]    | Actor model deep dive              |
| [[context-engine-guide]] | Context compilation and management |
| [[orchestrator-guide]]   | Agent orchestration patterns       |
| [[ports-system-guide]]   | Adapter development                |
| [[integration-guide]]    | Integration with existing systems  |
| [[troubleshooting-faq]]  | Common issues and solutions        |

## 🏗 Package Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Pantheon Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│  Core Framework                                           │
│  ├── pantheon-core          # Core types and interfaces    │
│  ├── pantheon              # Main framework package       │
│  └── pantheon-state        # State management system      │
├─────────────────────────────────────────────────────────────┤
│  Communication & Protocol                                │
│  ├── pantheon-protocol      # Message protocol           │
│  └── pantheon-orchestrator # Agent coordination         │
├─────────────────────────────────────────────────────────────┤
│  Adapters & Integrations                                  │
│  ├── pantheon-mcp             # Model Context Protocol       │
│  ├── pantheon-persistence       # Data persistence             │
│  ├── pantheon-llm-openai      # OpenAI integration           │
│  ├── pantheon-llm-claude      # Claude integration           │
│  ├── pantheon-llm-opencode    # Opencode integration         │
│  └── pantheon-coordination     # Agent coordination system   │
├─────────────────────────────────────────────────────────────┤
│  User Interface & Management                               │
│  ├── pantheon-ui            # React UI components        │
│  └── frontend               # Web frontend              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### Actor Model

- **Autonomous Agents**: Self-directed AI entities with goals and behaviors
- **Behaviors**: Reusable action patterns with execution modes
- **Talents**: Collections of related behaviors forming capabilities
- **Dynamic Spawning**: Create new actors at runtime

### Context Engine

- **Multi-Source Compilation**: Context from various data sources
- **Semantic Filtering**: Intelligent relevance-based filtering
- **Real-time Assembly**: On-demand context compilation
- **Performance Optimization**: Caching and efficient retrieval

### Port System

- **Hexagonal Architecture**: Clean separation of concerns
- **Dependency Injection**: Testable and flexible design
- **Multiple Adapters**: Support for various backends
- **Extensible**: Easy to add new integrations

### Communication Protocol

- **Envelope Messaging**: Structured message format
- **Multiple Transports**: AMQP, WebSocket, in-memory
- **Security**: Message signing and validation
- **Reliability**: Dead letter queues and retries

## 🔧 Development Patterns

### Functional Programming

```typescript
// Pure functions preferred
const processMessage = (message: Message): string => {
  return message.content.toUpperCase();
};

// Immutable data structures
const updatedActor = {
  ...actor,
  goals: [...actor.goals, 'New goal'],
};
```

### Type Safety

```typescript
// Runtime type checking
function handleAction(action: unknown) {
  if (isAction(action)) {
    switch (action.type) {
      case 'message':
        // TypeScript knows action has content
        console.log(action.content);
        break;
    }
  }
}
```

### Error Handling

```typescript
// Specific error types
try {
  await orchestrator.tickActor(actor);
} catch (error) {
  if (error instanceof ActorError) {
    console.error(`Actor ${error.actorId} failed: ${error.message}`);
  }
}
```

## 🚀 Performance Considerations

### Context Optimization

- **Intelligent Caching**: TTL-based context caching
- **Source Filtering**: Relevance-based source selection
- **Batch Processing**: Efficient bulk operations
- **Memory Management**: Optimized data structures

### Actor Scheduling

- **Concurrent Execution**: Parallel actor processing
- **Resource Management**: CPU and memory optimization
- **Priority Queuing**: Important tasks first
- **Load Balancing**: Distributed execution

### Communication Efficiency

- **Message Batching**: Reduce network overhead
- **Connection Pooling**: Reuse connections
- **Compression**: Optimize message size
- **Selective Updates**: Only send changes

## 🔒 Security Features

### Input Validation

- **Schema Validation**: Zod-based validation
- **Sanitization**: Remove malicious content
- **Type Checking**: Runtime type verification
- **Rate Limiting**: Prevent abuse

### Authentication & Authorization

- **JWT Tokens**: Secure authentication
- **Role-Based Access**: Permission management
- **API Key Security**: Secure credential handling
- **Audit Logging**: Track all actions

### Data Protection

- **Encryption**: Data at rest and in transit
- **Secure Storage**: Sensitive data handling
- **Access Controls**: Restricted data access
- **Compliance**: Privacy regulations

## 🧪 Testing Strategy

### Unit Testing

```typescript
import test from 'ava';

test('actor creation', async (t) => {
  const actor = createTestActor();
  t.truthy(actor.id);
  t.is(actor.script.name, 'Test Actor');
});
```

### Integration Testing

```typescript
test('full actor execution', async (t) => {
  const orchestrator = createTestOrchestrator();
  const actor = createTestActor();

  await orchestrator.tickActor(actor);

  t.pass();
});
```

### End-to-End Testing

```typescript
test('complete workflow', async (t) => {
  // Test entire user workflow
  const result = await simulateUserInteraction();
  t.truthy(result.success);
});
```

## 📊 Monitoring & Observability

### Metrics Collection

- **Actor Performance**: Execution time and success rates
- **System Health**: Resource utilization and errors
- **User Activity**: Interaction patterns and usage
- **API Performance**: Response times and throughput

### Logging

- **Structured Logging**: JSON format with metadata
- **Log Levels**: Debug, info, warn, error
- **Correlation IDs**: Track request flows
- **Log Aggregation**: Centralized collection

### Alerting

- **Threshold Monitoring**: Alert on limits exceeded
- **Error Rates**: High error rate notifications
- **Performance Degradation**: Slow response alerts
- **System Failures**: Immediate critical alerts

## 🔄 CI/CD Integration

### Build Pipeline

```yaml
# Example GitHub Actions
name: Pantheon CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: pnpm lint
```

### Deployment

```bash
# Production deployment
pnpm build
pnpm test:prod
docker build -t pantheon .
docker push registry/pantheon:latest
```

## 🤝 Community & Support

### Contributing

1. **Fork** the repository
2. **Create** feature branch
3. **Follow** coding standards
4. **Add** tests
5. **Submit** pull request

### Getting Help

- **Documentation**: Read these guides first
- **Issues**: Report bugs on GitHub
- **Discussions**: Ask questions
- **Discord**: Real-time chat

### Code of Conduct

- **Respectful**: Professional communication
- **Inclusive**: Welcome all contributors
- **Helpful**: Support community members
- **Constructive**: Positive feedback

## 📋 Roadmap

### Upcoming Features

- **Enhanced LLM Support**: More provider integrations
- **Performance Improvements**: Faster context compilation
- **Advanced UI**: More sophisticated frontend
- **Better Monitoring**: Enhanced observability
- **Documentation**: More examples and tutorials

### Version Planning

- **v0.2**: Enhanced actor coordination
- **v0.3**: Advanced workflow management
- **v0.4**: Performance optimizations
- **v1.0**: Stable production release

## 🔗 External Resources

### Related Projects

- **Promethean OS**: Main repository
- **Agent Coordination**: Multi-agent systems
- **Context Management**: Information retrieval
- **LLM Integration**: Language model adapters

### Standards & Protocols

- **Model Context Protocol**: Standardized tool interfaces
- **Hexagonal Architecture**: Clean design patterns
- **Functional Programming**: Best practices
- **TypeScript**: Type-safe development

## 📖 Quick Reference

### Common Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm test                    # Run tests
pnpm lint                    # Code quality checks
pnpm typecheck              # Type checking

# Pantheon CLI
pantheon actor:create llm my-agent
pantheon actor:list
pantheon actor:tick <id>
pantheon context:compile --sources "sessions,tasks"
pantheon tool:execute <tool> <args>
```

### Environment Variables

```bash
# Core Configuration
NODE_ENV=development
LOG_LEVEL=debug

# OpenAI Integration
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1

# Database
DATABASE_URL=mongodb://localhost:27017/pantheon

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:8080
```

### File Structure

```
pantheon-project/
├── src/
│   ├── actors/              # Actor definitions
│   ├── behaviors/           # Behavior implementations
│   ├── contexts/            # Context sources
│   ├── tools/               # Tool definitions
│   └── main.ts             # Application entry
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── docs/                  # Documentation
├── package.json           # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## 🎉 Getting Started

1. **Read** the [[package-overview]] to understand the ecosystem
2. **Choose** your starting point based on needs:
   - [[pantheon-core]] for core functionality
   - [[pantheon]] for complete framework
   - [[frontend]] for web interface
3. **Follow** the [[developer-guide]] for best practices
4. **Explore** examples in individual package documentation
5. **Join** the community for support and contributions

Welcome to Pantheon! 🚀
