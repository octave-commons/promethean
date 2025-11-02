# AGENTS.md

## Module Resolution

- Do not resolve modules via relative paths outside of a package's root.
- Shared types must be provided by dependencies (e.g., `"@promethean-os/packagename": "workspace:*"`).
- "@node/types" is installed at package root.
- node version is pinned by package.json

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

## Clean Code

- Leave every file you touch a bit cleaner than you found it.
- Run eslint on changed paths and fix violations instead of ignoring them.
- Prefer small, incremental improvements to code quality.

## Example package

Keep it simple, use barrel exports, minimal tsconfig extending `../../tsconfig.base.json`, minimal `ava.config.mjs`
build essentials (`typescript`, `rimraf`, `eslint`,`prettier`,`ts-node`,`ava`,`tsx`, etc) are pinned to the root ``package.json`
to prevent version drift.

node versions are pinned to root `package.json` to prevent version drift.

### packages/hack/src/hack.ts

```typescript
import { foo } from '@promethean-os/bar';
export function hack() {}
```

### packages/hack/src/index.ts

```typescript
export * from './hack.js';
```

### packages/hack/package.json

```json
{
  "name": "@promethean-os/hack",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.cjs",
  "types": "dist/index.d.ts",
  "module": "dist/index.js"
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./dist/*": "./dist/*",
    "./*": "./dist/*"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "typecheck": "tsc -p tsconfig.json",
    "test": "pnpm run build && ava",
    "lint": "pnpm exec eslint .",
    "coverage": "pnpm run build && c8 ava",
    "format": "pnpm exec prettier --write ."
  }
  "dependencies":{
  "@promethean-os/bar":"workspace:*"

  },
  "devDependencies":{}
}
```

### packages/hack/tsconfig.json

```json
{
  "extends": "../../config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "references": []
}
```

### packages/hack/ava.config.mjs

```javascript
export { default } from '../../config/ava.config.mjs';
```

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
