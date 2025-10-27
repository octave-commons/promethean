# Pantheon Package Overview

## Introduction

The Pantheon ecosystem is a comprehensive framework for building and managing AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures. It consists of 15 specialized packages that work together to provide a complete agent management solution.

## Package Architecture

The Pantheon packages follow a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Pantheon Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│  Core Framework                                           │
│  ├── pantheon-core          # Core types and interfaces    │
│  ├── pantheon              # Main framework package       │
│  └── pantheon-state        # State management system      │
├─────────────────────────────────────────────────────────────┤
  Communication & Protocol                                │
│  ├── pantheon-protocol      # Message protocol           │
│  └── pantheon-orchestrator # Agent coordination         │
├─────────────────────────────────────────────────────────────┤
│  Adapters & Integrations                                  │
│  ├── pantheon-mcp           # Model Context Protocol     │
│  ├── pantheon-persistence   # Data persistence           │
│  ├── pantheon-llm-openai    # OpenAI integration         │
│  ├── pantheon-llm-claude    # Claude integration         │
│  └── pantheon-llm-opencode  # Opencode integration       │
├─────────────────────────────────────────────────────────────┤
│  User Interface & Management                               │
│  ├── pantheon-ui            # React UI components        │
│  └── pantheon-generator     # Code generation tools     │
├─────────────────────────────────────────────────────────────┤
│  Advanced Features                                        │
│  ├── pantheon-coordination  # Multi-agent coordination   │
│  ├── pantheon-workflow      # Workflow management        │
│  ├── pantheon-ecs           # Entity Component System    │
│  └── frontend               # Web frontend              │
└─────────────────────────────────────────────────────────────┘
```

## Package Categories

### Core Framework Packages

#### [[pantheon-core]] - Core Library

**Purpose**: Provides fundamental types, interfaces, and core functionality
**Key Features**:

- Actor model with behaviors and talents
- Context engine for dynamic semantic retrieval
- Port interfaces for dependency injection
- Orchestrator for agent lifecycle management
- Comprehensive type system (747 lines of documented interfaces)

**Dependencies**: None (base package)
**License**: GPL-3.0-only

#### [[pantheon]] - Main Framework

**Purpose**: Complete framework with CLI, UI, and adapters
**Key Features**:

- CLI interface with 6 powerful commands
- Actor creation utilities (LLM, Tool, Composite actors)
- Adapter implementations
- Utility functions and error handling
- Complete system factory

**Dependencies**: pantheon-core, pantheon-persistence, pantheon-mcp, pantheon-llm-openai
**License**: GPL-3.0-only

#### [[pantheon-state]] - State Management

**Purpose**: Event sourcing and snapshot management system
**Key Features**:

- Functional façade for state operations
- Event sourcing capabilities
- Snapshot management
- Authentication and authorization
- Cache integration with level-cache

**Dependencies**: @promethean-os/level-cache, bcryptjs, jsonwebtoken, uuid, zod
**License**: GPL-3.0-only

### Communication & Protocol Packages

#### [[pantheon-protocol]] - Message Protocol

**Purpose**: Core message protocol with envelope messaging and multiple transports
**Key Features**:

- Envelope-based messaging system
- Message signing and validation
- Multiple transport implementations (AMQP, WebSocket)
- Dead letter queue support
- Type-safe message handling

**Dependencies**: pantheon-state, amqplib, ws, uuid, zod, crypto
**License**: GPL-3.0-only

#### [[pantheon-orchestrator]] - Agent Coordination

**Purpose**: Agent coordination and session management
**Key Features**:

- Multi-agent orchestration
- Session management
- Agent lifecycle coordination
- Event-driven architecture
- UUID-based identification

**Dependencies**: pantheon-state, pantheon-protocol, uuid, zod
**License**: GPL-3.0-only

### Adapter & Integration Packages

#### [[pantheon-mcp]] - Model Context Protocol

**Purpose**: MCP tool adapter for standardized AI agent interfaces
**Key Features**:

- MCP tool registration and execution
- Predefined tools for Pantheon operations
- Schema validation
- Error handling and result formatting
- Extensible tool system

**Dependencies**: pantheon-core
**License**: GPL-3.0-only

#### [[pantheon-persistence]] - Data Persistence

**Purpose**: Wraps @promethean-os/persistence for Pantheon context port
**Key Features**:

- Context port implementation
- Persistence adapter integration
- Data storage and retrieval
- Performance optimizations

**Dependencies**: @promethean-os/persistence, pantheon-core
**License**: GPL-3.0-only

#### [[pantheon-llm-openai]] - OpenAI Integration

**Purpose**: LLM adapter for OpenAI API
**Key Features**:

- OpenAI API integration
- Configurable model parameters
- Error handling and retries
- Type-safe message handling
- Streaming support

**Dependencies**: pantheon-core, openai
**License**: GPL-3.0-only

#### [[pantheon-llm-claude]] - Claude Integration

**Purpose**: LLM adapter for Anthropic Claude
**Key Features**:

- Claude API integration
- Advanced reasoning capabilities
- Configurable parameters
- Error handling

**Dependencies**: pantheon-core
**License**: GPL-3.0-only

#### [[pantheon-llm-opencode]] - Opencode Integration

**Purpose**: LLM adapter for Opencode platform
**Key Features**:

- Opencode platform integration
- Specialized tool usage
- Context-aware responses

**Dependencies**: pantheon-core
**License**: GPL-3.0-only

### User Interface & Management Packages

#### [[pantheon-ui]] - React UI Components

**Purpose**: Agent management interface
**Key Features**:

- React-based UI components
- Agent management dashboard
- Real-time updates
- Responsive design

**Dependencies**: pantheon-state, react, react-dom
**License**: GPL-3.0-only

#### [[pantheon-generator]] - Code Generation

**Purpose**: Code generation tools for Pantheon
**Key Features**:

- Template-based code generation
- Actor script generation
- Configuration file generation
- Boilerplate reduction

**Dependencies**: pantheon-core
**License**: GPL-3.0-only

#### [[frontend]] - Web Frontend

**Purpose**: Complete web frontend for Pantheon management
**Key Features**:

- React-based single-page application
- WebSocket integration for real-time updates
- Multiple pages (Dashboard, Actors, Context, Tools, Settings)
- Query management with TanStack Query
- Responsive design with Tailwind CSS

**Dependencies**: React, React Router, TanStack Query, WebSocket
**License**: GPL-3.0-only

### Advanced Features Packages

#### [[pantheon-coordination]] - Multi-Agent Coordination

**Purpose**: Advanced multi-agent coordination algorithms
**Key Features**:

- Multi-agent coordination patterns
- Conflict resolution
- Resource allocation
- Distributed decision making

**Dependencies**: pantheon-core, pantheon-protocol
**License**: GPL-3.0-only

#### [[pantheon-workflow]] - Workflow Management

**Purpose**: Workflow management and automation
**Key Features**:

- Workflow definition and execution
- Task scheduling
- Conditional logic
- State machine implementation

**Dependencies**: pantheon-core, pantheon-state
**License**: GPL-3.0-only

#### [[pantheon-ecs]] - Entity Component System

**Purpose**: Entity Component System for complex agent behaviors
**Key Features**:

- ECS architecture
- Component-based design
- System processing
- Performance optimization

**Dependencies**: pantheon-core
**License**: GPL-3.0-only

## Package Dependencies

### Dependency Graph

```
pantheon-core (base)
├── pantheon
├── pantheon-mcp
├── pantheon-persistence
├── pantheon-llm-*
├── pantheon-coordination
├── pantheon-workflow
├── pantheon-ecs
└── pantheon-generator

pantheon-state
├── pantheon-protocol
├── pantheon-orchestrator
└── pantheon-ui

pantheon-protocol
└── pantheon-orchestrator
```

### Shared Dependencies

All packages share these common dependencies:

- **TypeScript**: For type safety and developer experience
- **Zod**: For runtime validation and schema definitions
- **AVA**: For testing framework
- **ESLint**: For code quality and consistency

## Installation Patterns

### Core Installation

```bash
# Install core framework
pnpm add @promethean-os/pantheon-core @promethean-os/pantheon
```

### Full Installation

```bash
# Install complete ecosystem
pnpm add @promethean-os/pantheon @promethean-os/pantheon-core @promethean-os/pantheon-mcp @promethean-os/pantheon-persistence
```

### LLM-Specific Installation

```bash
# OpenAI integration
pnpm add @promethean-os/pantheon-llm-openai

# Claude integration
pnpm add @promethean-os/pantheon-llm-claude

# Opencode integration
pnpm add @promethean-os/pantheon-llm-opencode
```

### UI Installation

```bash
# React UI components
pnpm add @promethean-os/pantheon-ui

# Complete frontend
pnpm add @promethean-os/frontend
```

## Version Compatibility

All Pantheon packages follow semantic versioning and maintain compatibility:

- **Major versions**: Breaking changes
- **Minor versions**: New features with backward compatibility
- **Patch versions**: Bug fixes and security updates

### Compatibility Matrix

| Package               | Core Version | State Version | Protocol Version |
| --------------------- | ------------ | ------------- | ---------------- |
| pantheon              | ^0.1.0       | ^0.1.0        | -                |
| pantheon-mcp          | ^0.1.0       | -             | -                |
| pantheon-persistence  | ^0.1.0       | -             | -                |
| pantheon-protocol     | -            | ^0.1.0        | -                |
| pantheon-orchestrator | -            | ^0.1.0        | ^0.1.0           |

## Licensing

All Pantheon packages are licensed under **GPL-3.0-only**, ensuring:

- Open source freedom
- Copyleft protection
- Commercial use restrictions
- Patent protection

## Development Patterns

### Functional Programming

- Pure functions preferred
- Immutable data structures
- No side effects in core logic
- Dependency injection through ports

### Type Safety

- Comprehensive TypeScript coverage
- Runtime validation with Zod
- Type guards for runtime checks
- Discriminated unions for action handling

### Testing

- Test-driven development (TDD)
- Unit tests with AVA
- Integration tests for adapters
- End-to-end tests for workflows

### Documentation

- JSDoc comments for all public APIs
- Obsidian-friendly wikilinks
- Comprehensive examples
- Architecture diagrams

## Performance Considerations

### Memory Management

- Efficient data structures
- Lazy loading where appropriate
- Cache management strategies
- Resource cleanup patterns

### Concurrency

- Asynchronous operations
- Non-blocking I/O
- Parallel processing support
- Actor isolation

### Scalability

- Horizontal scaling support
- Distributed architecture
- Load balancing capabilities
- Fault tolerance

## Security Considerations

### Input Validation

- Schema validation with Zod
- Sanitization of user inputs
- Type checking at runtime
- Error boundary handling

### Authentication & Authorization

- JWT token support
- Role-based access control
- API key management
- Secure communication protocols

### Data Protection

- Encryption at rest and in transit
- Sensitive data handling
- Audit logging
- Compliance considerations

## Migration Guide

### From v0.0.x to v0.1.x

- Updated dependency versions
- Improved type safety
- Enhanced error handling
- Performance optimizations

### Breaking Changes

- Actor interface restructuring
- Port method signatures updated
- Configuration format changes
- Migration utilities provided

## Community & Support

### Contributing

- Fork the repository
- Create feature branches
- Follow coding standards
- Submit pull requests

### Issues & Support

- GitHub Issues for bug reports
- Discussions for questions
- Documentation for guidance
- Community forums

### Roadmap

- Enhanced LLM integrations
- Improved performance
- Additional adapters
- Advanced coordination algorithms

---

This overview provides a comprehensive understanding of the Pantheon package ecosystem. Each package has detailed documentation available through the respective package links.
