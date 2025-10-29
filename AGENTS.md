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

## Clean Code

- Leave every file you touch a bit cleaner than you found it.
- Run eslint on changed paths and fix violations instead of ignoring them.
- Prefer small, incremental improvements to code quality.

## Code Style Guidelines

**Imports:**

- ESM only (no require/module.exports)
- Import order: builtin → external → internal → parent → sibling → index
- No default exports (prefer named exports)
- No dynamic imports

**Formatting:**

- Prettier with `pnpm format`
- Max 300 lines per file, 50 lines per function
- Max 4 function parameters
- LF line endings

**Types:**

- TypeScript strict mode enabled
- No `any` types (error)
- Prefer readonly/immutable types
- Explicit function return types
- No unchecked indexed access

**Naming:**

- PascalCase for types/interfaces
- camelCase for functions/variables
- kebab-case for file names

**Error Handling:**

- Avoid try/catch when possible
- Prefer Result/Either patterns
- Use functional error handling

**Forbidden:**

- Class statements/expressions
- `var` declarations
- `let` statements (prefer const)
- `else` statements (avoid when possible)
- setTimeout in tests (use sleep from test-utils)

**Testing:**

- AVA test runner
- Tests in `src/tests/`
- No test code in production paths
- Mock at module boundaries with esmock

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

## 🗂 Kanban Task Management

This is a **solo operation with AI helpers** - you're the only stakeholder working on a massive undertaking. The Kanban system (`@promethean-os/kanban`) exists to support you, not to add overhead or corporate-style process to what's already a huge challenge.

The board lives at: `docs/agile/boards/generated.md`

Think of it as a **personal GPS** for your development journey - it helps you see where you've been, where you're going, and what's realistic to tackle next.


### Commands

```bash
pnpm kanban --help
pnpm kanban process
pnpm kanban audit
pnpm kanban update-status <uuid> <column>
pnpm kanban regenerate
pnpm kanban search <query>
pnpm kanban count
```

**Flow:**

1. `pnpm kanban search <work-type>` - Find relevant work
2. `pnpm kanban update-status <uuid> in_progress` - Pull task for active work
3. `pnpm kanban update-status <uuid> done` - Complete work and move through documentation
4. `pnpm kanban regenerate` - Update board to reflect current reality

### File Locations

- Tasks → `docs/agile/tasks/*.md`
- Board → `docs/agile/boards/generated.md`
- Config → `promethean.kanban.json`
- CLI Reference → `docs/agile/kanban-cli-reference.md`

### Docs

- [[docs/agile/kanban-cli-reference.md]]
- [[docs/agile/process.md]]
- [[docs/agile/rules/kanban-transitions.clj]]

### When Work Happens Outside Board

This will happen. A lot. And that's completely normal for solo development:

1. **Create retrospective cards** when you remember - no pressure to be perfect
2. **Move through board as a quick cleanup** - 5 minutes to acknowledge what got done
3. **Learn from your patterns** - Are you consistently bypassing certain steps? Maybe they're not needed
4. **Update the map to match reality** - The board should document what actually happened, not what was "supposed" to happen

### Sustainable Solo Development

**Managing the Overwhelm:**

- **Pick one thing** and finish it before starting the next
- **Use the board to say "no"** - If it's not on the board and not urgent, it can wait
- **Celebrate small wins** - Moving one card to "done" is genuinely good progress
- **Forgive yourself** - Some weeks you'll crush it, others you'll barely tread water

**Working with AI:**

- **AI is your junior dev** - Great for implementation, not for strategic decisions
- **Batch AI requests** - Context switching between different AI tasks is expensive
- **Review AI output carefully** - It helps but doesn't replace your judgment
- **Use AI for documentation** - Let it help you remember what you built and why

**Balancing Urgency and Sustainability:**

- **True emergencies are rare** - Most "urgent" things can wait a day
- **Protect your energy** - You can't build massive things if you're constantly exhausted
- **Take breaks** - Step away from the workstation. The work will still be there.
- **Trust your gut** - If something feels too complicated, it probably is

---

## 🚀 Solo Development with AI Assistance

### Acknowledging the Reality

You're building something ambitious while being fundamentally the only human stakeholder. Even with AI helpers, this means:

- **You're the bottleneck** - All decisions flow through you
- **Context is precious** - You can't afford to lose track of what you're doing
- **Energy is finite** - Mental bandwidth is your most limited resource
- **AI amplifies but doesn't replace** - It helps you go faster, not be everywhere at once

### Practical Workflow

**Daily Reality Check:**

- Start each day by assessing realistic capacity, not ideal outcomes
- Select 1-3 objectives that would represent successful completion
- End each day by documenting completed work - even if it differs from initial plan

**Weekly Planning:**

- Monday: Assess the week ahead. What's realistically achievable??
- Wednesday: Mid-week capacity check. Are expectations aligned with reality??
- Friday: Review the board. Document completed work, adjust remaining priorities.

**Managing the Backlog:**

- **Everything is optional** until it's not
- **Delete ideas liberally** - If you haven't touched it in 3 months, it's probably not happening
- **Merge similar tasks** - Often 5 small tasks are really 1 medium task
- **Break down monsters** - Huge tasks become procrastination magnets

### Working Effectively with AI

**Treat AI Like a Very Capable Junior Developer:**

- **Give clear context** - AI can't read your mind or remember previous conversations perfectly
- **Review everything** - AI makes plausible-sounding mistakes
- **Use it for grunt work** - Boilerplate, documentation, first drafts, refactoring
- **Keep the hard thinking for yourself** - Architecture, trade-offs, user experience

**Batch Your AI Interactions:**

- **Similar tasks together** - Stay in the same mental context
- **Document your patterns** - Create templates for common requests
- **Save good prompts** - Don't reinvent the wheel every effort
- **Know when to stop** - Someefforts it's faster to do it yourself

### Staying Sane

**Protect Your Energy:**

- **Work during productive periods** - Not when you feel obligated
- **Take meaningful breaks** - Away from the keyboard, not just switching tabs
- **Conclude the work session** - Have a ritual that signals "work session is complete"
- **Celebrate progress** - You're building something massive - that's worth acknowledging

**When You're Stuck:**

- **Switch to something easier** - Build momentum with a quick win
- **Go for a walk** - Your brain keeps working on problems in the background
- **Ask the AI to explain it differently** - Someefforts a new perspective helps
- **Accept "good enough"** - Perfect is the enemy of progress

**Remember:**

- **You're not behind** - You're on your own effortline
- **Comparison is meaningless** - No one else is building exactly what you're building
- **Progress compounds** - Small consistent efforts add up to massive results
- **This is supposed to be hard** - If it were easy, everyone would do it

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

## 🧭 Operational Notes

**The Essentials (actually important):**

- Always run bash commands from **package root** - saves so much confusion
- Use `pnpm --filter @promethean-os/<pkg> ...` - keeps things isolated and predictable
- Keep temporary scripts in `pseudo/` - they're experiments, not production code
- Store documentation in `docs/` - keeps knowledge organized
- File changes auto-commit with LLM-generated messages - one less thing to think about

**The "Try to Follow" Rules:**

- Avoid `cd ... && anything...` - it's confusing and error-prone
- Skip dynamic imports unless absolutely necessary
- No class statements - stick to the functional pattern we've established
- Keep documentation **Obsidian-friendly** with `[[wikilinks]]` and Dataviews
- Keep [[HOME]] updated - it's your personal knowledge hub
- Use PM2 for runeffort processes - keeps things running reliably

**When Rules Get in the Way:**

- **Break the rules if they're slowing you down** - This is your project, not a corporate codebase
- **Quick hacks are okay** - Just move them to `pseudo/` or clean them up later
- **Documentation can be rough** - Better to have something than nothing
- **"Good enough" beats "perfect"** - Especially when you're tired or stuck

**Remember:**

- **You're building something massive** - Cut yourself some slack
- **Consistency matters more than perfection** - Small, steady progress wins
- **The tools serve you, not the other way around** - If a process isn't helping, change it

---

## ⚖️ License

All packages use:

```
"license": "GPL-3.0-only"
```
