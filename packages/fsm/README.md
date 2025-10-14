# Finite State Machine (FSM) Package

This package provides a comprehensive, layered approach to finite state machine implementation in TypeScript, designed to scale from simple use cases to complex workflow orchestration.

## Architecture Overview

The FSM package is organized into several layers, each building on the core concepts:

### 📁 Package Structure

```
packages/fsm/
├── src/
│   ├── core/           # Core types and interfaces (shared foundation)
│   ├── simple/         # Functional, lightweight FSM for basic use cases
│   ├── graph/          # Graph-based FSM for complex scenarios
│   ├── adapters/       # Application-specific integrations
│   └── utils/          # Shared utilities and helpers
├── docs/
│   ├── core-concepts.md     # Fundamental FSM concepts
│   ├── simple-fsm.md       # Simple FSM usage guide
│   ├── graph-fsm.md        # Graph-based FSM usage guide
│   ├── adapters.md          # Integration patterns
│   └── migration-guide.md  # How to migrate between APIs
└── examples/              # Practical examples
```

## 🎯 When to Use Which Layer

| Use Case | Recommended Layer | Characteristics |
|----------|-------------------|------------------|
| Simple state transitions (3-5 states) | `simple/` | Functional, minimal overhead |
| Workflow orchestration | `simple/` | Event-driven, clear transitions |
| Complex state hierarchies | `graph/` | Visualizable, analysis tools |
| Multi-system integration | `adapters/` | Pre-built integrations |
| Custom FSM needs | `core/` + `simple/` or `graph/` | Build your own |

## 🚀 Quick Start

### Simple FSM (Most Common Use Cases)

```typescript
import { createSimpleMachine } from '@promethean/fsm/simple';

// Define your states and events
type States = 'idle' | 'loading' | 'success' | 'error';
type Events = 'start' | 'complete' | 'fail';

// Create a machine definition
const machine = createSimpleMachine<States, Events>({
  initialState: 'idle',
  states: {
    idle: {
      on: {
        start: 'loading'
      }
    },
    loading: {
      on: {
        complete: 'success',
        fail: 'error'
      }
    },
    success: {},
    error: {
      on: {
        start: 'loading' // retry
      }
    }
  }
});

// Use the machine
let current = machine.initial;
current = machine.transition(current, 'start'); // -> 'loading'
current = machine.transition(current, 'complete'); // -> 'success'
```

### Graph-Based FSM (Complex Scenarios)

```typescript
import { createGraphMachine } from '@promethean/fsm/graph';

// For complex state machines with visualization needs
const graphMachine = createGraphMachine<States, Events, Context>({
  initialState: 'idle',
  states: {
    idle: { entry: () => console.log('Ready to start'), isInitial: true },
    loading: {
      entry: () => setLoading(true),
      exit: () => setLoading(false),
      timeout: 30000,
      onTimeout: 'error'
    },
    success: { isFinal: true },
    error: { isFinal: true }
  },
  transitions: [
    { from: 'idle', to: 'loading', event: 'start' },
    { from: 'loading', to: 'success', event: 'complete' },
    { from: 'loading', to: 'error', event: 'fail' }
  ]
});

// Advanced features
const result = graphMachine.processEvent('start');
console.log(result.state, result.context);
```

## 📚 Core Concepts

### States
- **Simple**: String identifiers for states
- **Rich**: State objects with metadata, actions, and lifecycle hooks

### Transitions
- **Event-driven**: Transitions triggered by specific events
- **Guarded**: Conditional transitions based on context
- **Action-based**: Side effects during transitions

### Context
- **Stateful**: Data that travels with the machine
- **Immutable**: Context is updated immutably
- **Typed**: Full TypeScript support for context shapes

## 🔧 Adapters

Pre-built integrations for common use cases:

### Kanban Board FSM
```typescript
import { createKanbanFSM, basicKanbanConfig } from '@promethean/fsm/adapters';

const kanbanMachine = createKanbanFSM(basicKanbanConfig);
```

### Workflow FSM
```typescript
import { createAgentsWorkflowFSM } from '@promethean/fsm/adapters';
```

### Pipeline FSM
```typescript
import { createPiperFSM } from '@promethean/fsm/adapters';
```

## 🧪 Testing

The package includes comprehensive testing utilities:

```typescript
import { testMachine, createTestMachine } from '@promethean/fsm/utils';

const test = createTestMachine(machine);
expect(test.transition('start').state).toBe('loading');
```

## 📖 Migration Guide

### From packages/ds/fsm
The previous FSM implementation in `@promethean/ds` is now deprecated. Use:

```typescript
// Old (deprecated)
import { FSMGraph } from '@promethean/ds/fsm';

// New (recommended)
import { createGraphMachine } from '@promethean/fsm/graph';
```

### From packages/fsm (functional API)
The functional API in `@promethean/fsm` is still available but enhanced:

```typescript
// Still works
import { createMachine, transition } from '@promethean/fsm';

// Enhanced version
import { createSimpleMachine } from '@promethean/fsm/simple';
```

## 🎨 Design Principles

1. **Progressive Enhancement**: Start simple, add complexity when needed
2. **Type Safety**: Full TypeScript support at all layers
3. **Immutability**: Predictable state management
4. **Performance**: Optimized for both runtime and bundle size
5. **Debuggability**: Rich debugging and visualization tools
6. **Composability**: Easy to compose and extend

## 🤝 Contributing

When contributing to the FSM package:

1. **Core Changes**: Modify `src/core/` and update all dependent layers
2. **Simple API**: Add to `src/simple/` with comprehensive tests
3. **Graph API**: Add to `src/graph/` with visualization considerations
4. **Adapters**: Add to `src/adapters/` following existing patterns
5. **Documentation**: Update all relevant documentation

## 📄 License

GPL3 - see LICENSE file for details.