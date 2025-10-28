# AGENTS.md

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

## ⚙️ Package Anatomy

```
src/               # source code
src/tests/         # test files
src/actions/       # individual, short, functional, operations, that can be taken in response to an event/hook
src/controllers/   # Execute actions on program inputs, produce program outputs
src/controllers/commands/      # CLI interfaces
src/controllers/routes/        # Restful endpoints
src/controllers/tools/         # Individual MCP tools
src/controllers/events/        # event handlers
src/controllers/events/        # event handlers
src/serializers    # take the output from actions and prepare them for dispatch to an external consumer
tsconfig.json      # extends ../../config/tsconfig.base.json
ava.config.mjs     # extends ../../config/ava.config.mjs
package.json       # scripts: build, test, clean, coverage, typecheck
pseudo/            # local pseudocode; never referenced internally
```

---

## 💻 Languages

- **Typescript**
- **Clojure(script)**

---

## 🧩 Programming Style

- Functional
- Data-oriented
- Test-driven
- Rapid prototyping
- Small, concise functions/files
- Clean code
- Factory pattern
- Dependency injection

---

## 🗂 Kanban Task Management

All agents use the **Kanban system** (`@promethean-os/kanban`) as a supportive map for tracking and coordination. The board is a living view into our work, not a rigid enforcement mechanism.

The board lives at:
`docs/agile/boards/generated.md`

### Guiding Philosophy

- **The board serves the team, not the other way around**
- **Work gets done, sometimes outside formal processes - and that's okay**
- **Retrospective card movement honors work completed**
- **Failed checks are learning opportunities, not violations**
- **We think better when we're calm** - even urgent work deserves thoughtful response

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

### When Work Happens Outside Board

Sometimes excellent work gets completed without following the formal flow. This is normal:

1. **Create retrospective cards** to honor the valuable work completed
2. **Move through board as a ritual** of acknowledgment and completion
3. **Learn from patterns** - How can we make the process more supportive?
4. **Update the map** - The board should reflect reality, not enforce an idealized version

### File Locations

- Tasks → `docs/agile/tasks/*.md`
- Board → `docs/agile/boards/generated.md`
- Config → `promethean.kanban.json`
- CLI Reference → `docs/agile/kanban-cli-reference.md`

### Docs

- [[docs/agile/kanban-cli-reference.md]]
- [[docs/agile/process.md]]
- [[docs/agile/rules/kanban-transitions.clj]]

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

- Always run bash commands from **package root**
- Keep temporary scripts in `pseudo/` (never referenced by source)
- Store documentation in `docs/`
- File changes auto-commit with LLM-generated messages
- MUST ALWAYS use `pnpm --filter @promethean-os/<pkg> ...`
- MUST NEVER use `cd ... && anything...`
- MUST NEVER use dynamic imports.
- MUST NEVER use class statements or expressions

  - No manual commits or backups needed

- Documentation must be **Obsidian-friendly**

  - Use `[[wikilinks]]`
  - Use [Dataviews](https://blacksmithgu.github.io/obsidian-dataview/)

- Keep [[HOME]] updated — treat it as a **living document**
- Manage runtime processes via **PM2**

---

## ⚖️ License

All packages use:

```
"license": "GPL-3.0-only"
```
