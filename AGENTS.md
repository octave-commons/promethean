# AGENTS.md

> **Note to self:** This is a solo operation with AI helpers. You're building something massive while being fundamentally "short-handed" even with automation. Be kind to yourself, focus on what matters, and remember that progress compounds.

## Build/Lint/Test Commands

**Root level (all packages):**

- `pnpm build` - Build all packages
- `pnpm test` - Test all packages
- `pnpm lint` - Lint all packages
- `pnpm typecheck:all` - Typecheck all packages

**Single package:**

- `pnpm --filter @promethean-os/<pkg> build`
- `pnpm --filter @promethean-os/<pkg> test`
- `pnpm --filter @promethean-os/<pkg> lint`
- `pnpm --filter @promethean-os/<pkg> typecheck`

**Single test file:**

- `pnpm --filter @promethean-os/<pkg> exec ava path/to/test.test.js`

## Package scaffolding

- Use Nx to create new workspace packages:
  - Libraries: `nx g tools:package <name> --preset library`
  - Fastify services: `nx g tools:package <name> --preset service`
  - Frontends: `nx g tools:package <name> --preset frontend`
- The generator writes `src/` with functional TypeScript entry points, AVA stubs in `src/tests`, and `static/` for assets that should be served by `@fastify/static`.
- Service presets include an OpenAPI template under `static/openapi`, and you must expose it through `/openapi.json` using `@fastify/swagger` and `@fastify/swagger-ui`.
- Frontend presets emit `src/frontend/` alongside `dist/frontend/` targets; serve `dist/frontend` and `static` together from Fastify when deploying UI shells.
- All packages compile to `dist/` with ESM outputs that keep `.js` extensions in import statements.
- Every package stays GPL-3.0-only and follows our functional TypeScript conventions (pure functions, immutability, composition).

## Testing

- Ava is always the test runner (tests live in `src/tests`).
- Test logic does not belong in module logic
- define **ports** (your own minimal interfaces),
- provide **adapters** for external services like Mongo/Chroma/level/redis/sql/etc,
- have a **composition root** that wires real adapters in prod,
- and in tests either inject fakes directly or **mock at the module boundary** (ESM-safe) without touching business code.
- **No test code in prod paths.** Ports/DI keeps boundaries explicit.
- **Deterministic & parallel-friendly.** No shared module singletons leaking between tests.
- **Easier refactors.** Adapters are the only place that knows Mongo/Chroma APIs.
- **Right tool for each test level.** Fakes for unit speed; containers for realistic integration. The principle is well-established: mock _your_ interfaces, not vendor clients. ([Hynek Schlawack][3], [8th Light][2])
- `esmock` provides native ESM import mocking and has examples for AVA. It avoids invasive "test hook" exports. ([NPM][5], [Skypack][6])


# Promethean

> _“Stealing fire from the gods to grant man the gift of knowledge and wisdom.”_
> Using **cloud LLMs** to make **local LLMs** smarter, specialized, and autonomous.

---

---

## 📂 Repository Structure

```
scripts/   # deprecated build/test/deploy
packages/  # JS/TS modules
tests/     # unit & integration tests
docs/      # system-level markdown docs
sites/     # deprecated UIs/dashboards
configs/   # base configuration
pseudo/    # throwaway scripts, pseudocode, retained for transparency
```

---

# Functional Organizational Pattern in src/

This document outlines the functional programming organizational pattern used in the `src/` directory, which replaces object-oriented programming with functional equivalents.

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

## Migration from OOP to Functional

| OOP Concept        | Functional Equivalent | Location                              |
| ------------------ | --------------------- | ------------------------------------- |
| Class              | Typeclass             | `src/actions/<typeclass>/`            |
| Method             | Action function       | `src/actions/<typeclass>/<action>.ts` |
| Constructor        | Factory function      | `src/factories/<entity>-factory.ts`   |
| Property           | Input parameter       | Function parameters                   |
| Inheritance        | Composition           | Function composition                  |
| this keyword       | Explicit parameters   | Function scope parameter              |
| Instance variables | Immutable data        | Input/output types                    |

## Benefits

1. **Testability**: Pure functions are easy to test
2. **Composability**: Functions can be easily combined
3. **Type Safety**: Explicit contracts for all operations
4. **No Hidden State**: All dependencies are explicit
5. **Functional Programming**: Aligns with FP principles
6. **Separation of Concerns**: Clear boundaries between different operations

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


## 🧱 Local Package Commands

MUST ALWAYS USE **locally scoped commands**:

```bash
pnpm --filter @promethean-os/<pkg> test
pnpm --filter @promethean-os/<pkg> build
pnpm --filter @promethean-os/<pkg> clean
pnpm --filter @promethean-os/<pkg> typecheck
pnpm --filter @promethean-os/<pkg> start
pnpm --filter @promethean-os/<pkg> exec node ./dist/index.ts
```
---


### Docs

- [[docs/agile/kanban-cli-reference.md]]
- [[docs/agile/process.md]]
- [[docs/agile/rules/kanban-transitions.clj]]
- [[operational-notes]]
- [[HUMANS]]
- [[HOME]]
- [[STYLE]]
- [[BOARD_COMMANDS]]
---

## ⚖️ License

All packages use:

```
"license": "GPL-3.0-only"
```
