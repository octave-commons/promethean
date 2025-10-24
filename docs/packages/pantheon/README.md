# Pantheon Agent Management Framework

## Overview

The Pantheon Framework is a modular cognitive architecture for running AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures. It consolidates scattered agent-related code into a unified system featuring:

- **Functional Core**: Pure functions and immutable data structures
- **Hexagonal Architecture**: Dependency injection through ports and adapters
- **Actor Model**: Agents with behaviors, talents, and dynamic capabilities
- **Context Engine**: Dynamic semantic retrieval and compilation
- **Cross-Platform Interop**: Support for multiple runtime environments

## Quick Start

```bash
# Install the framework
pnpm add @promethean-os/pantheon-core @promethean-os/pantheon-fp

# Basic usage
import { makeActorFactory, makeOrchestrator } from '@promethean-os/pantheon-core';

// Create an actor factory
const actorFactory = makeActorFactory();

// Define a behavior
const behavior = actorFactory.createBehavior('greeting', 'active', async ({ goal, context }) => {
  return {
    actions: [
      {
        type: 'message',
        content: `Hello! I'm working on: ${goal}`,
        target: 'user'
      }
    ]
  };
});

// Create a talent with the behavior
const talent = actorFactory.createTalent('social', [behavior]);

// Create an actor script
const script = {
  name: 'greeter',
  contextSources: [],
  talents: [talent]
};

// Create an actor instance
const actor = actorFactory.createActor(script, ['greet users']);
```

## Architecture

### Hexagonal Architecture

Pantheon follows the hexagonal architecture pattern, where the core business logic is isolated from external dependencies through well-defined ports:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Core                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Actor Model   │  │  Context Engine │  │Orchestrator │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
    ┌──────▼──────┐    ┌─────▼─────┐    ┌──────▼──────┐
    │  Tool Port  │    │ Context   │    │  Message    │
    │             │    │   Port    │    │    Bus      │
    └─────────────┘    └───────────┘    └─────────────┘
           │                  │                  │
    ┌──────▼──────┐    ┌─────▼─────┐    ┌──────▼──────┐
    │   MCP/HTTP  │    │Persistence│    │ WebSocket/  │
    │   Tools     │    │  Store    │    │   AMQP      │
    └─────────────┘    └───────────┘    └─────────────┘
```

### Core Components

1. **Actor Model**: Agents with behaviors, talents, and goals
2. **Context Engine**: Dynamic compilation of context from multiple sources
3. **Orchestrator**: Coordination of actor execution and action handling
4. **Ports System**: Dependency injection for external services

## Documentation Structure

- [[Architecture Overview]]: High-level system design and principles
- [[Type System Reference]]: Complete guide to all types and interfaces
- [[Actor Model Guide]]: How Actors, Behaviors, and Talents work together
- [[Context Engine Guide]]: Dynamic semantic retrieval and compilation
- [[Orchestrator Guide]]: Agent lifecycle and action execution
- [[Ports System Guide]]: Dependency injection and adapter pattern
- [[Developer Guide]]: Getting started and best practices
- [[API Reference]]: Complete API documentation
- [[Integration Guide]]: How to integrate with existing systems
- [[Troubleshooting]]: Common issues and solutions

## Key Features

### Actor Model

- **Behaviors**: Reusable action patterns with execution modes (active, passive, persistent)
- **Talents**: Collections of related behaviors that form capabilities
- **Goals**: High-level objectives that guide actor behavior
- **State Management**: Comprehensive actor lifecycle management

### Context Engine

- **Dynamic Compilation**: Real-time context assembly from multiple sources
- **Semantic Retrieval**: Intelligent context filtering and ranking
- **Multi-Source Support**: Integration with various data stores and APIs
- **Caching**: Optimized performance through intelligent caching

### Action System

- **Tool Invocation**: Execute external tools with proper error handling
- **Message Passing**: Send and receive messages between actors
- **Actor Spawning**: Create new actors dynamically
- **Context Operations**: Read, write, and delete context data

### Cross-Platform Support

- **MCP Integration**: Native support for Model Context Protocol
- **HTTP Tools**: RESTful API integration capabilities
- **Local Tools**: Direct function execution for performance
- **Message Brokers**: Support for various transport protocols

## Contributing

This framework follows the repository's established patterns:

- Functional programming preferred
- TDD non-negotiable
- Document-driven development
- No relative module resolution outside package root
- Always use the eslint tool on each file you edit

## License

GPL-3.0 (see LICENSE.txt for details)
