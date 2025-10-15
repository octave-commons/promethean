# AGENTS.md

## 🧱 Overview

This repo defines the **Promethean Framework**, a modular cognitive architecture
for running AI agents with embodied reasoning, perception-action loops, and
emotionally mediated decision structures.

## 🗂️ Board Process

All work must be follow the process
[[process|`docs/agile/process.md`]]

---

## 📂 Repository Structure

```
scripts/ # Build, test, deploy automation (depreciated)
packages/ # JS/TS modules
tests/ # Unit and integration test suites
docs/ # System-level documentation and markdown exports
sites/ # Frontend code for dashboards and chat UIs (depreciated)
configs/ # All base config files live here
```

---

## Anatomy of a Package

```
./src # All source code goes here
./src/tests # Tests go here
./src/frontend # Frontend code goes here
./tsconfig.json # Extends "../../config/tsconfig.base.json"
./ava.config.mjs # Extends "../../config/ava.config.mjs"
./package.json # Has, or should have 'build', 'test', 'clean', 'coverage',
'typecheck' etc. scripts
./static # Any files that might be served from a webserver go here.
```

Webservers should mount both `dist/frontend` and `static`.

---

# Stack

- TypeScript monorepo
- nx
- AVA for tests
- Webcomponents for frontends
- Fastify for REST
- MongoDB for main document store
- LevelDB for caching
- ESMODULEs
- Prefer key-value caches via `@promethean/level-cache`; avoid JSON files for transient data

# Programming Style

- Functional preferred
- Immutable data; no in-place object mutation
- TDD manditory
- Document-driven development
- No relative module resolution outside of the package root. Depend on `@promethean/<package>*` via "workspace:\*".
- Always use the ts-lsp server to diangose build errors. It is faster than running typechecks or building the project, and requires no permission
- Always use the eslint tool on each file you edit.
- **BuildFix Integration**: Use unified benchmark CLI for BuildFix testing and validation

## 🔧 BuildFix Provider Guidelines

### BuildFix Benchmarking

When working with BuildFix functionality, agents should use the unified benchmark CLI system:

```bash
# Quick BuildFix validation
pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --iterations 3

# Comprehensive BuildFix testing
pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --suite buildfix-massive

# Model comparison for BuildFix
pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --models qwen3:8b,qwen3:14b
```

### BuildFix Agent Workflows

1. **Initial Validation**: Always run quick BuildFix benchmark before making changes
2. **Model Selection**: Use `qwen3:8b` for development, `gpt-oss:20b-cloud` for production testing
3. **Resource Monitoring**: Include `--monitor-resources` flag for performance analysis
4. **Error Type Focus**: Specify TypeScript error types for targeted testing

### BuildFix Best Practices

- **Use Unified CLI**: Prefer `@promethean/benchmark` over direct BuildFix scripts
- **Monitor Performance**: Track success rates and fix effectiveness
- **Model Comparison**: Regularly compare different AI models for BuildFix tasks
- **Resource Awareness**: BuildFix can be resource-intensive; monitor memory usage
- **Fixture Testing**: Use both small and massive fixture sets for comprehensive testing

### BuildFix Configuration

Standard BuildFix provider configuration for benchmarking:

```typescript
{
  name: 'buildfix-local',
  type: 'buildfix',
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen3:8b',
  options: {
    errorContext: true,
    fixStrategy: 'conservative',
    maxRetries: 3,
    timeoutMs: 30000,
  }
}
```

# Working Style

- Prefer small, auditable changes over grand rewrites.
- If there aren't tests, write them.
- Do not edit config files when fixing problems unless explicitly asked. Prefer code changes in the affected modules.
- Add a summary of what you changed to a date string named file in `changelog.d` eg `changelog.d/<YYYY.MM.DD.hh.mm.ss>.md`
- If a task cannot be fully completed within the session, ship a partial, reviewable artifact (code, notes, or an audit log)
  that documents the current state so the next agent has traction—never leave with only "couldn't finish".

---

## 🎯 Task Estimation with Story Points

All agents must use **story points** for task estimation instead of time-based estimates. Story points measure relative complexity, effort, and uncertainty rather than absolute time duration.

### 📏 The Story Point Scale

We use the modified Fibonacci sequence to reflect increasing uncertainty:

```
1  - Trivial: Quick fix, well-understood, minimal risk
2  - Small: Simple changes, clear requirements, low uncertainty
3  - Medium: Moderate complexity, some research needed
5  - Large: Significant work, multiple components, moderate uncertainty
8  - Extra Large: Complex feature, high uncertainty, may need breakdown
13 - Very Large: Epic-level work, requires extensive planning
21 - Massive: Too large to estimate, must be broken down
```

### 🧠 Estimation Guidelines

**When estimating tasks, consider:**

- **Complexity**: How difficult is the work? (technical challenges, algorithms)
- **Effort**: How much work is required? (lines of code, files touched)
- **Uncertainty**: What are the unknowns? (research, dependencies, risks)
- **Dependencies**: How many other systems/components are involved?

**Estimation Process:**

1. **Understand the Task**: Read the full description and ask clarifying questions
2. **Identify Components**: Break down into logical pieces if needed
3. **Assess Complexity**: Consider technical challenges and required skills
4. **Evaluate Uncertainty**: Factor in research, unknown dependencies, risks
5. **Compare to Baseline**: Use completed tasks as reference points
6. **Choose Point Value**: Select the lowest value that comfortably fits the work

### 🚫 Why We Avoid Time Estimates

**Time estimates fail because:**

- **Individual Variation**: Different agents work at different speeds
- **Context Switching**: Interruptions and multitasking affect productivity
- **Learning Curve**: New domains or technologies slow initial progress
- **External Dependencies**: Waiting for reviews, feedback, or other teams
- **Technical Debt**: Unexpected complications from existing code
- **Pressure to Meet Deadlines**: Leads to rushed work and quality issues

**Story points succeed because:**

- **Relative Measurement**: Compares tasks to each other, not to time
- **Team-Based**: Reflects collective wisdom, not individual speed
- **Focus on Value**: Encourages discussion about complexity and risk
- **Adaptable**: Accounts for changing conditions and new information
- **Velocity Tracking**: Enables predictable delivery over time

### 📊 Practical Examples

**1-Point Tasks:**

- Fix a typo in documentation
- Add a simple validation rule
- Update a configuration value
- Fix a straightforward bug with clear reproduction steps

**3-Point Tasks:**

- Add a new API endpoint with basic validation
- Implement a small feature with clear requirements
- Refactor a single function for better performance
- Write unit tests for an existing module

**5-Point Tasks:**

- Add a new feature with multiple components
- Implement authentication for a service
- Create a new data model with migrations
- Set up CI/CD pipeline for a new service

**8+ Point Tasks:**

- Major feature spanning multiple services
- Complex integration with external systems
- Performance optimization across the codebase
- Breaking down large epics into smaller stories

### 🔄 Estimation Best Practices

**✅ DO:**

- Discuss tasks as a team before estimating
- Use recent completed tasks as reference points
- Break down tasks larger than 8 points
- Re-estimate when requirements change significantly
- Track velocity to improve future estimates
- Consider technical debt and maintenance overhead

**❌ DON'T:**

- Convert story points to hours ("1 point = 4 hours")
- Estimate under pressure or without full understanding
- Ignore uncertainty and risk factors
- Use the same point value for all similar-looking tasks
- Forget to update estimates when scope changes
- Estimate tasks you haven't discussed with the team

### 📈 Velocity and Planning

- **Velocity**: Average story points completed per iteration
- **Capacity**: Maximum story points an agent can handle per iteration
- **Sprint Planning**: Use historical velocity to commit to realistic workloads
- **Continuous Improvement**: Review estimation accuracy regularly and adjust

---

## 📋 Kanban Task Management

All agents must use the kanban system for task tracking and work management. The kanban board lives at `docs/agile/boards/generated.md` and is managed via the `@promethean/kanban` package.

### 🔁 Migrations (agent-facing policy)

- Agents MUST NOT add new one-off scripts for repo-wide content changes.
- Use the migration runner instead:`,`pnpm tsx packages/migrations/src/index.ts up`.
- All schema/content evolutions (frontmatter keys, tag normalization, etc.) must ship as migrations under `packages/migrations/src/migrations/`.
- Migrations are parser-based; call `@promethean/markdown/frontmatter` utilities — never regex frontmatter.

#### Tags vs labels

- `labels` is **deprecated**. Use **`tags`** (lowercase) in frontmatter for Obsidian + CLI.
- Body "Tags:" headers are deprecated; migrations move tokens into frontmatter `tags` and drop that line.
- Tools-as-roles routing is tag-based: `tool:codex`, `provider:zai`, `env:no-egress`, `role:engineer`, `cap:codegen`, etc.

#### After running migrations

- `pnpm kanban regenerate` to refresh the board.
- `pnpm kanban generate-by-tags "tool:codex" --kanban docs/agile/boards/views/codex.md` to refresh agent views.

### 🎯 Core Kanban Commands

```bash
# === BOARD OPERATIONS ===
pnpm kanban regenerate              # Generate board from task files
pnpm kanban sync                   # Bidirectional sync with conflict reporting
pnpm kanban pull                   # Sync board from task frontmatter
pnpm kanban push                   # Project board columns back to tasks
pnpm kanban count                  # Show task counts by column

# === TASK MANAGEMENT ===
pnpm kanban list                   # List all tasks with details
pnpm kanban search <query>         # Search tasks by title or content
pnpm kanban find <uuid>            # Find task by UUID
pnpm kanban find-by-title <title>  # Find task by exact title
pnpm kanban update-status <uuid> <column>  # Move task to different column

# === COLUMN OPERATIONS ===
pnpm kanban getColumn <column>     # Get tasks in specific column (JSON)
pnpm kanban getByColumn <column>   # Get formatted tasks for column (markdown)
pnpm kanban move_up <uuid>         # Move task up within column
pnpm kanban move_down <uuid>       # Move task down within column

# === CRUD OPERATIONS ===
pnpm kanban create <title> [options]  # Create new task
  --content <text>           # Task description/content
  --priority <P0|P1|P2|P3>   # Task priority
  --status <column>          # Initial status (default: incoming)
  --labels <tag1,tag2>       # Comma-separated tags

pnpm kanban update <uuid> [options]   # Update existing task
  --title <text>            # New title
  --content <text>          # New content
  --priority <P0|P1|P2|P3>  # New priority
  --status <column>         # New status

pnpm kanban delete <uuid> [--confirm]  # Delete task (requires confirmation)

# === ADVANCED OPERATIONS ===
pnpm kanban breakdown-task <uuid>     # AI-powered task breakdown
pnpm kanban prioritize-tasks          # Task prioritization analysis
pnpm kanban compare-tasks <uuid1> <uuid2>  # Compare two tasks
pnpm kanban generate-by-tags <tags>   # Generate filtered board
pnpm kanban indexForSearch            # Build search index

# === PROCESS & WORKFLOW ===
pnpm kanban process                  # Show workflow process
pnpm kanban show-process             # Display detailed process info
pnpm kanban show-transitions         # Show valid transitions
pnpm kanban enforce-wip-limits       # Check and report WIP violations

# === DEVELOPMENT & UI ===
pnpm kanban ui [--port <port>] [--host <host>]  # Start web UI server
pnpm kanban dev [--port <port>] [--host <host>]  # Start dev server with live reload

# === AUDIT & MAINTENANCE ===
pnpm kanban audit                    # Audit board for issues
pnpm kanban doccheck                 # Check documentation consistency
```

### 📍 Working with Kanban

**✅ DO:**

- Use kanban commands from **any directory** in the repository
- Update task status via `pnpm kanban update-status <uuid> <column>`
- Regenerate board after making task changes: `pnpm kanban regenerate`
- Search tasks before creating new ones: `pnpm kanban search <query>`
- Check task counts to understand workflow: `pnpm kanban count`

**❌ DON'T:**

- Navigate to specific directories to use kanban commands
- Manually edit the generated board file
- Create tasks without checking for duplicates first
- Forget to sync board changes back to task files

### 🔄 Common Agent Workflows

1. **Start work**: `pnpm kanban search <work-type>` → find relevant tasks
2. **Update task**: `pnpm kanban update-status <uuid> in_progress`
3. **Complete work**: `pnpm kanban update-status <uuid> done`
4. **Generate board**: `pnpm kanban regenerate`

### 🧭 Path Resolution Guarantees

- The CLI walks upward until it finds `.git` or `pnpm-workspace.yaml` and treats
  that directory as the repo root.
- Relative paths inside `promethean.kanban.json` resolve against the config
  file's directory, **not** your shell's working directory.
- CLI flag overrides are resolved relative to the directory you run the command
  from; environment-variable overrides resolve relative to the detected repo
  root.
- `--config <path>` (or `KANBAN_CONFIG`) accepts relative paths from your
  current directory; once loaded, every entry inside the config is resolved from
  the config file's location.

### 🛠 Troubleshooting

- If a command cannot find tasks or the board, confirm the config file exists
  (default: `promethean.kanban.json`) and that its relative paths point to real
  directories.
- Run `pnpm kanban list --debug` (or add `--verbose`) to print the resolved
  paths when diagnosing unexpected behaviour.
- When experimenting, prefer overriding via CLI flags first; environment
  overrides are great for automation but can linger between shells.

### 📁 Task File Locations

- Tasks live in: `docs/agile/tasks/*.md`
- Generated board: `docs/agile/boards/generated.md`
- Config file: `promethean.kanban.json`
- CLI reference: `docs/agile/kanban-cli-reference.md`

### 🐛 Path Resolution Note

The kanban system automatically resolves paths correctly from any subdirectory. If you encounter path issues, ensure you're running commands from within the git repository.

### 📚 Further Documentation

- **Complete CLI Reference**: `docs/agile/kanban-cli-reference.md`
- **Process Documentation**: `docs/agile/process.md`
- **FSM Rules**: `docs/agile/rules/kanban-transitions.clj`
