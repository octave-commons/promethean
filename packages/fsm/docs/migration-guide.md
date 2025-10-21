# FSM Migration Guide

This guide helps you migrate from the scattered FSM implementations to the unified, well-documented FSM package.

## 🎯 Overview

The FSM codebase has been consolidated into a single, cohesive package with three clear API levels:

1. **Simple FSM** (`@promethean/fsm/simple`) - For basic use cases
2. **Graph FSM** (`@promethean/fsm/graph`) - For complex scenarios
3. **Adapters** (`@promethean/fsm/adapters`) - Pre-built integrations

## 📋 Migration Scenarios

### Scenario 1: Using packages/ds/fsm

**Before (deprecated):**
```typescript
import { FSMGraph } from '@promethean/ds/fsm';

const fsm = new FSMGraph({
  id: 'my-state',
  metadata: { name: 'My State' }
});

fsm.addState('idle', { isInitial: true });
fsm.addTransition('idle', 'loading', 'start');
```

**After (recommended):**
```typescript
import { createGraphMachine } from '@promethean/fsm/graph';

const fsm = createGraphMachine({
  id: 'my-machine',
  name: 'My Machine',
  version: '1.0.0',
  initialState: 'idle',
  states: [
    {
      id: 'idle',
      isInitial: true,
      metadata: { name: 'My State' }
    }
  ],
  transitions: [
    {
      from: 'idle',
      to: 'loading',
      event: 'start'
    }
  ]
});
```

### Scenario 2: Using packages/fsm (functional API)

**Before (still works):**
```typescript
import { createMachine, transition } from '@promethean/fsm';

const machine = createMachine({
  initialState: 'idle',
  initialContext: { count: 0 },
  transitions: [
    transition('idle', 'loading', 'start')
  ]
});
```

**After (enhanced version):**
```typescript
import { createSimpleMachine } from '@promethean/fsm/simple';

const machine = createSimpleMachine({
  initialState: 'idle',
  context: { count: 0 },
  states: {
    idle: {
      on: {
        start: 'loading'
      }
    },
    loading: {}
  }
});
```

### Scenario 3: Complex Workflow Orchestration

**New approach using Graph FSM:**
```typescript
import { createGraphMachine } from '@promethean/fsm/graph';

const workflow = createGraphMachine({
  id: 'workflow-engine',
  name: 'Document Processing Workflow',
  version: '1.0.0',
  initialState: 'pending',
  states: [
    {
      id: 'pending',
      name: 'Pending Processing',
      description: 'Waiting to be processed',
      actions: {
        entry: (ctx) => ({ ...ctx, startedAt: Date.now() })
      }
    },
    {
      id: 'processing',
      name: 'Processing',
      description: 'Currently being processed',
      timeout: 30000,
      onTimeout: 'error'
    },
    {
      id: 'completed',
      name: 'Completed',
      description: 'Processing finished successfully',
      isFinal: true,
      actions: {
        entry: (ctx) => ({ ...ctx, completedAt: Date.now() })
      }
    },
    {
      id: 'error',
      name: 'Error',
      description: 'Processing failed',
      isFinal: true,
      accepting: true
    }
  ],
  transitions: [
    {
      from: 'pending',
      to: 'processing',
      event: 'start',
      actions: [(ctx) => ({ ...ctx, status: 'started' })]
    },
    {
      from: 'processing',
      to: 'completed',
      event: 'complete',
      reducer: (ctx, event) => ({ ...ctx, result: event.payload })
    },
    {
      from: 'processing',
      to: 'error',
      event: 'fail',
      reducer: (ctx, event) => ({ ...ctx, error: event.payload })
    }
  ]
});

// Advanced features
const result = workflow.transition({ type: 'start' });
console.log('Current state:', workflow.currentState);
console.log('Mermaid diagram:', workflow.toMermaid());
console.log('Analysis:', workflow.analyze());
```

## 🔄 Step-by-Step Migration

### Step 1: Identify Your Current Usage

1. **Search for FSM imports:**
   ```bash
   grep -r "import.*fsm" --include="*.ts" --include="*.js"
   ```

2. **Identify which API you're using:**
   - `FSMGraph` from `@promethean/ds/fsm` → Graph FSM
   - `createMachine` from `@promethean/fsm` → Simple FSM
   - Custom FSM implementations → Core types + custom implementation

### Step 2: Choose Your Target API

| Current Complexity | Recommended Target | Reasons |
|------------------|-------------------|---------|
| Simple state transitions (3-5 states) | Simple FSM | Easier to use, less overhead |
| Workflow with actions/guards | Simple FSM | Good balance of features |
| Complex hierarchies | Graph FSM | Visualization and analysis tools |
| Need state machine diagrams | Graph FSM | Built-in Mermaid export |
| Integration with existing systems | Adapters | Pre-built configurations |

### Step 3: Update Imports

**Simple FSM:**
```typescript
// New imports
import { createSimpleMachine } from '@promethean/fsm/simple';
import type { SimpleMachineDefinition } from '@promethean/fsm/simple';
```

**Graph FSM:**
```typescript
// New imports
import { createGraphMachine } from '@promethean/fsm/graph';
import type { GraphMachineDefinition } from '@promethean/fsm/graph';
```

**Adapters:**
```typescript
// New imports
import { createKanbanFSM } from '@promethean/fsm/adapters';
```

### Step 4: Convert Machine Definitions

**From FSMGraph to GraphMachine:**

| FSMGraph Concept | GraphMachine Equivalent |
|------------------|------------------------|
| `addState(id, options)` | State object in `states` array |
| `addTransition(from, to, event)` | Transition object in `transitions` array |
| `currentState` property | `currentState` property |
| `currentContext` property | `currentContext` property |
| Manual validation | Built-in `validate()` method |
| No visualization | `toMermaid()` method |

**From createMachine to SimpleMachine:**

| createMachine Pattern | SimpleMachine Pattern |
|----------------------|-----------------------|
| `transitions: [transition(...)]` | `states: { idle: { on: { event: 'target' } } }` |
| `MachineDefinition` type | `SimpleMachineDefinition` type |
| `transition(machine, event)` | `machine.transition(event)` |
| Manual context management | Automatic context updates |

### Step 5: Update Usage Patterns

**State Transitions:**

```typescript
// Old
const result = transition(machine, event);

// New
const result = machine.transition(event);
```

**Context Updates:**

```typescript
// Old - manual context management
let context = { count: 0 };
const newMachine = { ...machine, context: { count: context.count + 1 } };

// New - automatic context updates
const result = machine.transition('increment', undefined); // context updated automatically
```

**Validation:**

```typescript
// Old - manual or no validation
// New - built-in validation
const validation = machine.validate();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

## 🧪 Testing Your Migration

### 1. Behavior Preservation Tests

```typescript
// Test that the new machine behaves identically to the old one
function testBehaviorEquivalence(oldMachine, newMachine) {
  const testEvents = ['start', 'process', 'complete'];

  for (const event of testEvents) {
    const oldResult = oldMachine.transition(event);
    const newResult = newMachine.transition(event);

    assert.equal(oldResult.state, newResult.state);
    assert.deepEqual(oldResult.context, newResult.context);
  }
}
```

### 2. Feature Validation Tests

```typescript
// Test that new features work as expected
function testNewFeatures(machine) {
  // Test validation
  const validation = machine.validate();
  assert.isTrue(validation.valid);

  // Test analysis (Graph FSM only)
  if (machine.analyze) {
    const analysis = machine.analyze();
    assert.isTrue(analysis.reachableStates.length > 0);
  }

  // Test visualization (Graph FSM only)
  if (machine.toMermaid) {
    const mermaid = machine.toMermaid();
    assert.isTrue(mermaid.includes('graph TD'));
  }
}
```

## 🚨 Common Migration Issues

### Issue 1: Missing Event Payloads

**Problem:** Old FSM passed full event objects, new FSM expects specific event types.

**Solution:**
```typescript
// Old
transition(machine, { type: 'complete', payload: result });

// New
machine.transition({ type: 'complete', payload: result });
```

### Issue 2: Different Guard Signatures

**Problem:** Guard functions have different signatures.

**Solution:**
```typescript
// Old
guard: (details) => details.context.isValid

// New
guard: (context, event) => context.isValid
```

### Issue 3: Context Mutations

**Problem:** Old FSM may have allowed context mutations.

**Solution:** Use reducer functions for predictable updates:
```typescript
// Old
action: (details) => { details.context.count++; }

// New
action: (context, event) => ({ ...context, count: context.count + 1 })
```

## 📚 Additional Resources

- [Core Concepts](./core-concepts.md) - Understanding FSM fundamentals
- [Simple FSM Guide](./simple-fsm.md) - Using the simple API
- [Graph FSM Guide](./graph-fsm.md) - Using the graph API
- [Adapters Guide](./adapters.md) - Pre-built integrations

## 🆘 Getting Help

If you encounter issues during migration:

1. Check the [API documentation](../README.md)
2. Look at the [examples](../examples/)
3. Review the [test files](../src/tests/)
4. Open an issue with your specific use case

## 🎉 Benefits of Migration

After migrating to the unified FSM package, you'll get:

- ✅ **Clearer API structure** - Choose the right tool for your needs
- ✅ **Better TypeScript support** - Fully typed interfaces
- ✅ **Enhanced debugging** - Rich error reporting and analysis
- ✅ **Built-in validation** - Catch configuration errors early
- ✅ **Visualization tools** - Generate diagrams from your state machines
- ✅ **Performance optimizations** - Efficient state management
- ✅ **Comprehensive documentation** - Clear guides and examples
- ✅ **Future-proof design** - Extensible architecture for new features