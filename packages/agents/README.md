# @promethean-os/agents

> _Comprehensive agent ecosystem for autonomous AI systems_

A collection of packages that provide the foundation for building, coordinating, and managing autonomous AI agents in the Promethean OS ecosystem.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   agent-ecs     │    │ agents-workflow  │    │ agent-coord.    │
│  (Voice/Real)   │    │ (Orchestration)  │    │ (Task Mgmt)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ agent-protocol  │    │ agent-os-protocol│    │  agent-state    │
│  (Transports)   │    │   (Messaging)    │    │ (Event Sourcing)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ agent-generator │
                    │ (Code Gen)      │
                    └─────────────────┘
```

## 📦 Package Overview

### 1. **@promethean-os/agent**

**Purpose**: Core agent base functionality

- **Status**: 🔴 Minimal implementation
- **Key Features**: Vision frame processing utilities
- **Dependencies**: Basic agent utilities
- **Use Case**: Foundation for agent implementations

---

### 2. **@promethean-os/agent-ecs** ⭐

**Purpose**: Entity Component System for agent orchestration

- **Status**: 🟢 Most mature package with comprehensive features
- **Key Features**:
  - Voice Activity Detection (VAD)
  - Speech arbitration and turn management
  - Real-time voice processing
  - Component-based architecture
  - WebSocket support for real-time communication
- **Dependencies**: MongoDB, Ollama, ChromaDB, Express
- **Use Case**: Multi-agent voice coordination and real-time systems

---

### 3. **@promethean-os/agent-coordination**

**Purpose**: Agent instance management and task coordination

- **Status**: 🔴 Type definitions only, no implementation
- **Key Features**:
  - Agent instance management
  - Task assignment algorithms
  - Kanban integration
  - Enso integration
  - Performance monitoring
  - Security coordination
- **Use Case**: Coordinating multiple agents in complex workflows

---

### 4. **@promethean-os/agent-generator** 🔧

**Purpose**: Automated agent instruction generation

- **Language**: ClojureScript with Shadow-CLJS
- **Status**: 🟡 Functional with template system
- **Key Features**:
  - Template-based agent generation
  - Cross-platform support (BB, NBB, CLJS)
  - Environment detection
  - File indexing capabilities
  - Kanban integration
  - Template engine
- **Templates Available**: Claude, CRUSH, general agents
- **Use Case**: Programmatically creating new agent configurations

---

### 5. **@promethean-os/agent-os-protocol**

**Purpose**: Core message protocol for agent communication

- **Status**: 🔴 Protocol definitions only
- **Key Features**:
  - Message envelope system
  - Type-safe message schemas
  - Protocol adapters
  - Message validation and signing
- **Use Case**: Standardizing agent-to-agent communication

---

### 6. **@promethean-os/agent-protocol** 📡

**Purpose**: Transport layer for agent messaging

- **Status**: 🟡 Implemented with multiple transports
- **Key Features**:
  - AMQP transport (RabbitMQ)
  - WebSocket transport
  - Message envelopes with signing
  - Dead letter queue support
  - UUID-based message tracking
- **Dependencies**: agent-state, amqplib, ws
- **Use Case**: Reliable message delivery between agents

---

### 7. **@promethean-os/agent-state** 💾

**Purpose**: Agent state management via event sourcing

- **Status**: 🟢 Fully implemented with functional approach
- **Key Features**:
  - Event sourcing for agent state
  - Snapshot management
  - JWT-based authentication
  - Context sharing between agents
  - Metadata management
  - LevelDB caching
- **Important**: Manages agent state, NOT conversation context
- **Use Case**: Persistent agent lifecycle and state management

---

### 8. **@promethean-os/agents-workflow** 🔄

**Purpose**: Workflow orchestration with self-healing

- **Status**: 🟡 Comprehensive but needs security fixes
- **Key Features**:
  - Workflow definition and execution
  - Self-healing mechanisms
  - Provider abstraction (OpenAI, Ollama)
  - Real-time monitoring
  - Kanban integration
  - Health scoring system
- **Issues**: Security vulnerabilities, incomplete implementation
- **Use Case**: Complex multi-agent workflows with automatic recovery

---

## 📊 Maturity Assessment

| Package                | Maturity  | Status           | Key Issues           |
| ---------------------- | --------- | ---------------- | -------------------- |
| **agent-ecs**          | 🟢 High   | Production-ready | Documentation needed |
| **agent-state**        | 🟢 High   | Production-ready | Complex API          |
| **agent-protocol**     | 🟡 Medium | Functional       | Limited testing      |
| **agents-workflow**    | 🟡 Medium | Functional       | Security issues      |
| **agent-generator**    | 🟡 Medium | Functional       | Clojure-only         |
| **agent-coordination** | 🔴 Low    | Types only       | No implementation    |
| **agent-os-protocol**  | 🔴 Low    | Types only       | No implementation    |
| **agent**              | 🔴 Low    | Minimal          | Incomplete           |

## 🎯 Recommended Usage

### For Production Systems:

- **agent-ecs** for voice/real-time agent coordination
- **agent-state** for persistent agent state management
- **agent-protocol** for reliable inter-agent messaging

### For Development & Prototyping:

- **agent-generator** for creating new agent configurations
- **agents-workflow** for workflow orchestration (after security fixes)

### Need Implementation:

- **agent-coordination** for advanced task management
- **agent-os-protocol** for standardized messaging

## 🚀 Quick Start

### Basic Agent Setup

```typescript
import { makeAgentStateManager } from '@promethean-os/agent-state';
import { AMQPTransport } from '@promethean-os/agent-protocol';
import { DefaultWorkflowHealingIntegration } from '@promethean-os/agents-workflow';

// Initialize state management
const stateManager = makeAgentStateManager({
  eventStore: new PostgresEventStore(db),
  snapshotStore: new PostgresSnapshotStore(db),
});

// Setup messaging
const transport = new AMQPTransport({
  url: 'amqp://localhost:5672',
  exchanges: ['agent.events', 'agent.commands'],
});

// Configure workflow healing
const healing = new DefaultWorkflowHealingIntegration();
await healing.initialize({
  enabled: true,
  automationLevel: 'automated',
  autoHealingEnabled: true,
});
```

### Voice-Enabled Agent (ECS)

```typescript
import { World, System } from '@promethean-os/agent-ecs';

// Create agent world
const world = new World();

// Add voice processing system
const voiceSystem = new VoiceSystem({
  vad: new VoiceActivityDetector(),
  arbiter: new SpeechArbiter(),
});

world.addSystem(voiceSystem);

// Start processing
world.start();
```

### Generate New Agent

```bash
# Using agent-generator (Clojure)
cd packages/agents/agent-generator
bb -m promethean.agent-generator.cli.core generate \
  --template claude \
  --output-dir ./my-agent \
  --agent my-specialist-agent
```

## 🔧 Installation

```bash
# Install core packages
pnpm add @promethean-os/agent-state @promethean-os/agent-protocol

# Install for voice/real-time systems
pnpm add @promethean-os/agent-ecs

# Install for workflow orchestration
pnpm add @promethean-os/agents-workflow

# Install for agent generation
pnpm add @promethean-os/agent-generator
```

## 🧪 Testing

```bash
# Test all agent packages
pnpm --filter "@promethean-os/agent-*" test

# Test specific package
pnpm --filter @promethean-os/agent-ecs test

# Type checking
pnpm --filter "@promethean-os/agent-*" typecheck

# Linting
pnpm --filter "@promethean-os/agent-*" lint
```

## 🏗️ Development Patterns

### 1. State Management

Use event sourcing for agent state:

```typescript
// Good: Functional approach
const stateManager = makeAgentStateManager(deps);
const updatedState = stateManager.processEvent(state, event);

// Avoid: Direct state mutation
state.someProperty = newValue; // ❌
```

### 2. Message Passing

Use the protocol layer for communication:

```typescript
// Good: Structured messaging
const envelope = new EnvelopeBuilder()
  .setType(MessageType.REQUEST)
  .setPayload(data)
  .sign(privateKey)
  .build();

await transport.send(envelope);
```

### 3. Component Architecture (ECS)

Use entity-component-system for complex agents:

```typescript
// Good: Component-based
const agent = world.createEntity();
agent.addComponent(new VoiceComponent());
agent.addComponent(new AIComponent());

// Avoid: Monolithic classes
class BigAgent {
  voice: VoiceSystem;
  ai: AISystem;
  // ... many responsibilities
}
```

## 🔄 Integration Examples

### Multi-Agent Voice Chat

```typescript
import { World, VoiceSystem, TurnSystem } from '@promethean-os/agent-ecs';
import { AMQPTransport } from '@promethean-os/agent-protocol';

// Setup voice coordination
const world = new World();
world.addSystem(new VoiceSystem());
world.addSystem(new TurnSystem());

// Setup inter-agent communication
const transport = new AMQPTransport();

// Agents can now coordinate voice turns and exchange messages
```

### Self-Healing Workflow

```typescript
import { DefaultWorkflowHealingIntegration } from '@promethean-os/agents-workflow';

const healing = new DefaultWorkflowHealingIntegration();

// Define workflow with automatic healing
const workflow = {
  id: 'customer-service',
  agents: ['triage', 'specialist', 'resolver'],
  healingStrategies: ['restart', 'scale', 'reroute'],
};

await healing.registerWorkflow(workflow);
// System will auto-heal failures
```

## 🚨 Known Issues & TODOs

### Critical Issues

- **agents-workflow**: Security vulnerabilities in file loading
- **agent-coordination**: No implementation beyond types
- **agent-os-protocol**: Protocol definitions need implementation

### High Priority

- Add comprehensive test coverage across all packages
- Implement missing coordination features
- Fix security issues in workflow system
- Add performance benchmarks

### Medium Priority

- Improve documentation and examples
- Add more transport options to agent-protocol
- Extend agent-generator templates
- Add monitoring and observability

## 🤝 Contributing

When contributing to the agents ecosystem:

1. **Follow the maturity patterns** - match existing code style
2. **Add comprehensive tests** - especially for new features
3. **Update documentation** - include examples and integration guides
4. **Consider security** - validate all inputs and use proper authentication
5. **Maintain compatibility** - don't break existing APIs without versioning

### Package-Specific Guidelines

- **agent-ecs**: Follow ECS patterns, add component tests
- **agent-state**: Use functional approach, test event sourcing
- **agent-protocol**: Test all transports, add integration tests
- **agents-workflow**: Address security issues, add healing tests
- **agent-generator**: Add templates, test generation pipeline

## 📚 Related Documentation

- [Agent ECS Documentation](./agent-ecs/README.md)
- [Agent Workflow Documentation](./agents-workflow/README.md)
- [Agent State API Reference](./agent-state/src/)
- [Agent Protocol Guide](./agent-protocol/src/)

## 📄 License

All agent packages are licensed under the GPL-3.0 License.

## 🔗 External Dependencies

- **MongoDB**: Used by agent-ecs for data persistence
- **RabbitMQ**: Used by agent-protocol for message queuing
- **Ollama**: Used by agents-workflow for local LLM execution
- **ChromaDB**: Used by agent-ecs for vector storage
- **LevelDB**: Used by agent-state for caching

## 🆘 Support

For issues and questions:

1. Check individual package documentation
2. Review existing [GitHub issues](https://github.com/promethean-os/promethean/issues)
3. Create new issues with detailed reproduction steps
4. Join our [Discord community](https://discord.gg/promethean) for real-time help
