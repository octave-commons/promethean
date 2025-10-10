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
- TDD non-negotiable
- Document-driven development
- No relative module resolution outside of the package root. Depend on `@promethean/<package>*` via "workspace:\*".
- Always use the ts-lsp server to diangose build errors. It is faster than running typechecks or building the project, and requires no permission
- Always use the eslint tool on each file you edit.

# Working Style

- Prefer small, auditable changes over grand rewrites.
- If there aren't tests, write them.
- Do not edit config files when fixing problems unless explicitly asked. Prefer code changes in the affected modules.
- Add a summary of what you changed to a date string named file in `changelog.d` eg `changelog.d/<YYYY.MM.DD.hh.mm.ss>.md`
- If a task cannot be fully completed within the session, ship a partial, reviewable artifact (code, notes, or an audit log)
  that documents the current state so the next agent has traction—never leave with only "couldn't finish".

---

## 📋 Kanban Task Management

All agents must use the kanban system for task tracking and work management. The kanban board lives at `docs/agile/boards/generated.md` and is managed via the `@promethean/kanban` package.

### 🎯 Core Kanban Commands

```bash
# Basic kanban operations (work from any directory in the repo)
pnpm kanban regenerate     # Generate board from task files
pnpm kanban sync          # Bidirectional sync with conflict reporting
pnpm kanban pull          # Sync board from task frontmatter
pnpm kanban push          # Project board columns back to tasks

# Task management
pnpm kanban list          # List all tasks
pnpm kanban search <query> # Search tasks by title or content
pnpm kanban update-status <uuid> <column> # Move task to different column
pnpm kanban count         # Show task counts by column

# Board operations
pnpm kanban getColumn <column>     # Get tasks in specific column
pnpm kanban getByColumn <column>   # Get formatted tasks for column
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

### 🐛 Path Resolution Note

The kanban system automatically resolves paths correctly from any subdirectory. If you encounter path issues, ensure you're running commands from within the git repository.

---

## 🚀 Agent Launch Workflows

### Standardized Launch Commands

All agents use consistent launch patterns via pnpm workspace filtering:

```bash
# Development mode (with hot reload)
pnpm --filter @promethean/cephalon start:dev

# Production mode
pnpm --filter @promethean/cephalon start

# Build and run
pnpm --filter @promethean/cephalon build && pnpm --filter @promethean/cephalon start
```

### Quick Launch Script

Use the standardized launcher for convenient agent management:

```bash
# Launch single agent
node scripts/launch-agents.mjs cephalon

# Launch all agents in development
node scripts/launch-agents.mjs --all --dev

# Launch all agents in production
node scripts/launch-agents.mjs --all --production

# List available agents
node scripts/launch-agents.mjs --list

# Check health of running agents
node scripts/launch-agents.mjs --health

# Show agent status
node scripts/launch-agents.mjs --status
```

### Core Agents

| Agent               | Package                            | Dev Command | Start Command | Port |
| ------------------- | ---------------------------------- | ----------- | ------------- | ---- |
| **Cephalon**        | `@promethean/cephalon`             | `start:dev` | `start`       | 8081 |
| **Duck Web**        | `@promethean/duck-web`             | `dev`       | `preview`     | 3000 |
| **ENSO Gateway**    | `@promethean/enso-browser-gateway` | `dev`       | N/A           | 8082 |
| **SmartGPT Bridge** | `@promethean/smartgpt-bridge`      | `dev`       | `start`       | 3210 |

### Process Management (PM2)

For production deployments, use PM2 with the standardized ecosystem configuration:

```bash
# Start all agents
pm2 start ecosystem.agents.config.js

# Start specific agent
pm2 start ecosystem.agents.config.js --only cephalon

# Start in development mode
pm2 start ecosystem.agents.config.js --env development

# Monitor processes
pm2 monit

# View logs
pm2 logs cephalon

# Restart agent
pm2 restart cephalon

# Stop agent
pm2 stop cephalon
```

### Environment Variables

Standardized environment variables for all agents:

```bash
# Core Configuration
NODE_ENV=development|production
PORT=3000                    # HTTP port
HOST=localhost              # Bind address

# Process Management
PM2_PROCESS_NAME=agent-name
HEARTBEAT_PORT=5005         # Health check port
CHECK_INTERVAL=300000       # 5 minutes
HEARTBEAT_TIMEOUT=600000    # 10 minutes
```

### Health Checks

All agents implement standardized health endpoints:

```bash
# Check agent health
curl http://localhost:8081/health  # Cephalon
curl http://localhost:3000/health  # Duck Web
curl http://localhost:3210/health  # SmartGPT Bridge
```

### Migration from Makefile

Old Makefile targets have been replaced with pnpm equivalents:

| Old Make Target       | New pnpm Command                               |
| --------------------- | ---------------------------------------------- |
| `make dev-cephalon`   | `pnpm --filter @promethean/cephalon start:dev` |
| `make start-cephalon` | `pnpm --filter @promethean/cephalon start`     |
| `make build-cephalon` | `pnpm --filter @promethean/cephalon build`     |

For detailed launch workflows and troubleshooting, see [Agent Launch Workflows Documentation](docs/agents/launch-workflows.md).
