# Functional Organizational Pattern in src/

This document outlines the functional programming organizational pattern used in each packages `src/`
which replaces object-oriented programming with functional equivalents.

## Migration from OOP to Functional

Not all packages have implemented the typeclass pattern yet.
Following clean coding guidelines, we leave our code better than we found it.
So we don't add new OOPies (get it?).

| OOP Concept        | Functional Equivalent | Location                              |
| ------------------ | --------------------- | ------------------------------------- |
| Class              | Typeclass             | `src/actions/<typeclass>/`            |
| Method             | Action function       | `src/actions/<typeclass>/<action>.ts` |
| Constructor        | Factory function      | `src/factories/<entity>-factory.ts`   |
| Property           | Input parameter       | Function parameters                   |
| Inheritance        | Composition           | Function composition                  |
| this keyword       | Explicit parameters   | Function scope parameter              |
| Instance variables | Immutable data        | Input/output types                    |

## Core Principles

- **No Classes**: All OOP constructs are replaced with functional equivalents
- **Typeclasses**: Replace classes with typeclasses (categories of related functionality)
- **Actions**: Replace methods with pure functions
- **Factories**: Replace constructors with factory functions
- **Serializers**: Handle data transformation and marshaling

## Directory Structure

```
src/
├── actions/           # Functional equivalent of class methods
├── factories/         # Functional equivalent of constructors
├── serializers/        # Data transformation and marshaling
├── adapters/          # External service adapters
├── core/              # Core business logic and types
├── auth/              # Authentication and authorization
├── cli/               # Command-line interfaces
├── llm/               # LLM-specific functionality
├── utils/             # Utility functions
└── tests/             # Test files (never in production paths)
```

---

## 💻 Languages

- **Typescript**
- **Clojure(script)**

---

## Actions (`src/actions/`)

**Purpose**: Functional equivalent of methods in a class. Each action is a pure function that performs a specific operation.

**Pattern**: `src/actions/<typeclass>/<action-name>.ts`

**Example**: Instead of `class Actor { createLLMActor() { ... } }`

```typescript
// src/actions/actors/create-llm-actor.ts
export type CreateLLMActorInput = {
  name: string;
  config: LLMActorConfig;
  contextSources?: ContextSource[];
};

export type CreateLLMActorScope = {
  // Dependencies injected here
};

export const createLLMActor = (
  input: CreateLLMActorInput,
  scope: CreateLLMActorScope,
): ActorScript => {
  // Pure function implementation
};
```

**Key Characteristics**:

- Pure functions with explicit inputs and outputs
- No side effects
- Explicit dependency injection via `scope` parameter
- Type-safe input/output contracts
- Composable and testable

## Factories (`src/factories/`)

**Purpose**: Functional equivalent of constructors. Create complex objects with dependencies injected.

**Pattern**: `src/factories/<entity>-factory.ts`

**Example**: Instead of `new Actor(config, dependencies)`

```typescript
// src/factories/actor-factory.ts
export interface LLMActorDependencies {
  llmProvider: unknown;
  logger?: unknown;
}

export const createLLMActorWithDependencies = (
  config: ActorConfig,
  dependencies: LLMActorDependencies,
): ActorScript => {
  // Use dependencies to create actor
  return createLLMActor({ name: config.name, config: config.parameters }, {} as any);
};
```

**Key Characteristics**:

- Factory functions for object creation
- Dependency injection through parameters
- Separation of configuration from dependencies
- Testable with mock dependencies

## Serializers (`src/serializers/`)

**Purpose**: Functions that transform data structures - convert objects to strings, arrays, or differently shaped objects. Anything that moves data around for something else to use.

**Pattern**: `src/serializers/<domain>-<format>.ts`

**Example**: JWT token serialization

```typescript
// src/serializers/jwt-tokens.ts
export const serializeJWTPayload = (
  payload: Record<string, unknown>,
  secret: string,
  options?: { algorithm?: string; issuer?: string; audience?: string },
): string => {
  // Transform payload object to JWT string
};

export const deserializeJWTPayload = (
  token: string,
  secret: string,
  options?: { algorithm?: string; issuer?: string; audience?: string },
): Record<string, unknown> => {
  // Transform JWT string back to payload object
};
```

**Key Characteristics**:

- Pure data transformation functions
- Bidirectional operations (serialize/deserialize)
- Format-specific implementations
- No business logic, only structural transformation

## Typeclasses

**Concept**: A typeclass is a category of related functionality that would be a class in OOP.

**Examples**:

- `actors` - All actor-related actions
- `auth` - All authentication-related actions
- `llm` - All LLM-related actions

**Structure**:

```
src/actions/
├── actors/           # Typeclass: Actor operations
│   ├── create-llm-actor.ts
│   ├── create-tool-actor.ts
│   └── create-composite-actor.ts
├── auth/             # Typeclass: Auth operations
│   ├── authenticate.ts
│   ├── authorize.ts
│   └── refresh-token.ts
└── llm/              # Typeclass: LLM operations
    ├── complete.ts
    ├── embed.ts
    └── stream.ts
```

## Barrel Exports

Each directory uses barrel exports (`index.ts`) to provide clean public APIs:

```typescript
// src/actions/actors/index.ts
export { createLLMActor } from './create-llm-actor.js';
export { createToolActor } from './create-tool-actor.js';
export { createCompositeActor } from './create-composite-actor.js';

export type {
  LLMActorConfig,
  CreateLLMActorInput,
  CreateLLMActorScope,
} from './create-llm-actor.js';
```


## Naming Conventions

- **Actions**: `verb-noun` (e.g., `create-llm-actor`, `authenticate-user`)
- **Factories**: `create-<entity>-with-dependencies`
- **Serializers**: `serialize<format>`, `deserialize<format>`
- **Types**: `<Action>Input`, `<Action>Scope`, `<Action>Output`
- **Interfaces**: `<Entity>Dependencies`

## Dependencies and Imports

- Use workspace packages for shared dependencies
- Import actions from typeclass directories
- Use barrel exports for clean imports
- Never use relative imports outside package root

Example:

```typescript
import { createLLMActor } from '../actions/actors/index.js';
import { createLLMActorWithDependencies } from '../factories/actor-factory.js';
import { serializeJWTPayload } from '../serializers/jwt-tokens.js';
```

---


## Benefits

1. **Testability**: Pure functions are easy to test
2. **Composability**: Functions can be easily combined
3. **Type Safety**: Explicit contracts for all operations
4. **No Hidden State**: All dependencies are explicit
5. **Functional Programming**: Aligns with FP principles
6. **Separation of Concerns**: Clear boundaries between different operations
