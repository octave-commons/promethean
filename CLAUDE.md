# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment

This is a **pnpm-only monorepo** using Node.js 20.19.4. npm is intentionally blocked and will fail.

```bash
# Enable pnpm via Corepack (required)
corepack enable && corepack prepare pnpm@9 --activate

# Install dependencies
pnpm install

# Start all development servers
pnpm dev:all
```

## 📋 Kanban Task Management

All work must be tracked using the kanban system. The board lives at `docs/agile/boards/generated.md` and is managed via the `@promethean/kanban` package.

### 🎯 Essential Kanban Commands

```bash
# === BOARD OPERATIONS ===
pnpm kanban regenerate              # Generate board from task files
pnpm kanban sync                   # Bidirectional sync with conflict reporting
pnpm kanban count                  # Show task counts by column

# === TASK MANAGEMENT ===
pnpm kanban search <query>         # Search tasks by title or content
pnpm kanban update-status <uuid> <column>  # Move task to different column

# === CRUD OPERATIONS ===
pnpm kanban create <title> [options]  # Create new task
  --content <text>           # Task description
  --priority <P0|P1|P2|P3>   # Task priority
  --status <column>          # Initial status
  --labels <tag1,tag2>       # Comma-separated tags

pnpm kanban update <uuid> [options]   # Update existing task
pnpm kanban delete <uuid> [--confirm]  # Delete task

# === DEVELOPMENT ===
pnpm kanban ui [--port <port>]  # Start web UI server
pnpm kanban dev [--port <port>]  # Start dev server with live reload
```

### 🔄 Claude Workflow

1. **Start work**: `pnpm kanban search <work-type>` → find relevant tasks
2. **Update task**: `pnpm kanban update-status <uuid> in_progress`
3. **Complete work**: `pnpm kanban update-status <uuid> done`
4. **Generate board**: `pnpm kanban regenerate`

### 📍 Working Directory Independence

All kanban commands work from **any directory** in the repository. The CLI automatically detects the repo root and resolves paths correctly.

### 📚 Further Documentation

- **Complete CLI Reference**: `docs/agile/kanban-cli-reference.md`
- **Process Documentation**: `docs/agile/process.md`
- **Agent Guidelines**: `AGENTS.md`

---

## 🤖 MCP (Model Context Protocol)

Claude has access to 70+ development tools via the unified MCP server for enhanced workflow automation.

### 🚀 Quick Start

```bash
# Start MCP server (HTTP transport)
pnpm --filter @promethean/mcp dev

# Access interactive UI
http://localhost:3000/ui

# Start with custom config
pnpm --filter @promethean/mcp dev -- --config ./my-mcp.json
```

### 🔧 Essential Tools for Claude

**File Operations:**

```javascript
// Read file
await mcp.call('files_view_file', { path: 'README.md' });

// Write file
await mcp.call('files_write_content', { path: 'file.txt', content: 'Hello' });

// Search code
await mcp.call('files_search', { pattern: 'function', path: 'src' });
```

**Kanban Integration:**

```javascript
// Get board state
await mcp.call('kanban_get_board', {});

// Update task status
await mcp.call('kanban_update_status', { uuid: 'abc-123', status: 'done' });

// Search tasks
await mcp.call('kanban_search', { query: 'bug fix' });
```

**GitHub Automation:**

```javascript
// Get PR details
await mcp.call('github_pr_get', { owner: 'user', repo: 'repo', number: 123 });

// Start review
await mcp.call('github_pr_review_start', { pullRequestId: 'PR_NODE_ID' });

// Apply patch
await mcp.call('github_apply_patch', {
  owner: 'user',
  repo: 'repo',
  branch: 'main',
  patch: 'diff',
});
```

**Package Management:**

```javascript
// Install dependencies
await mcp.call('pnpm_install', { filter: '@promethean/core' });

// Add package
await mcp.call('pnpm_add', { packages: ['lodash'], filter: '@promethean/core' });

// Run script
await mcp.call('pnpm_run_script', { script: 'build', filter: '@promethean/core' });
```

### 🌐 Available Endpoints

- **`/mcp`** - Default endpoint with core tools
- **`/github`** - GitHub-specific tools (REST + GraphQL)
- **`/files`** - File system operations
- **`/ui`** - Interactive tool exploration UI

### 📝 Minimal Configuration

Create `promethean.mcp.json`:

```json
{
  "transport": "http",
  "tools": [
    "files_view_file",
    "files_write_content",
    "kanban_get_board",
    "kanban_update_status",
    "github_request"
  ]
}
```

### 🔍 Claude Workflow Integration

1. **File Analysis**: Read and understand code structure
2. **Kanban Management**: Track and update task progress
3. **GitHub Operations**: PR reviews, issue management
4. **Build Automation**: Package management and testing
5. **Documentation**: Generate and update docs

### 🛠️ Advanced Features

**Stdio Proxies:** External MCP servers via HTTP bridge
**Dev UI:** Interactive tool testing at `http://localhost:3000/ui`
**Multi-endpoint:** Specialized toolsets per endpoint
**Security:** Command allowlist and path validation

### 📚 MCP Documentation

- **Complete Reference**: `docs/agile/mcp-reference.md`
- **Tool Catalog**: 70+ tools with examples
- **Configuration Guide**: JSON and EDN setup options

## Build System & Commands

### Core Commands

- `pnpm dev:all` - Run all package development servers without Docker
- `pnpm build` - Build all packages in dependency order
- `pnpm test:all` - Run full test suite with coverage
- `pnpm test:unit` - Run unit tests only
- `pnpm test:integration` - Run integration tests only
- `pnpm test:e2e` - Run end-to-end tests

### Linting & Formatting

- `pnpm lint` - Full repository ESLint scan (slow)
- `pnpm lint:diff` - ESLint only on files changed from origin/main (fast for development)
- `pnpm format` - Format code with Prettier
- `pnpm lint:dup` - Detect code duplication
- `pnpm lint:unused` - Find unused exports

### Service Management

The codebase uses PM2 for process management:

```bash
# Start shared infrastructure
pm2 start system/daemons/ecosystem.config.js

# Regenerate ecosystem config after adding/removing services
pnpm gen:ecosystem

# Start individual agents
pm2 start agents/duck/ecosystem.config.js
```

## Architecture Overview

### Monorepo Structure

- **`packages/`** - Shared libraries and components (Nx libs)
- **`services/`** - Runtime services and applications (Nx apps)
- **`agents/`** - AI agent configurations and ecosystem files
- **`system/daemons/`** - Shared infrastructure services

### Key Technologies

- **Node.js/TypeScript** - Primary language
- **ClojureScript** - CLI tools (`shadow-cljs.edn` configuration)
- **Nx** - Monorepo orchestration with caching
- **PM2** - Process management for services
- **Fastify** - HTTP server framework
- **WebSocket** - Real-time communication via message broker
- **MongoDB** - Data persistence for some services

### Message Broker Architecture

Services communicate through a WebSocket-based message broker (`packages/broker`). The `BrokerClient` sends periodic heartbeats (configurable via `BROKER_HEARTBEAT_MS`, default 30000ms) to maintain connections.

### Pipeline System

The repository uses **Piper** pipeline runner (`packages/piper`) with declarative pipelines defined in `pipelines.json`. Key pipelines include:

- `symdocs` - Generate package documentation and dependency graphs
- `simtasks` - Produce task backlogs from code analysis
- `codemods` - Generate and apply automated code transforms
- `buildfix` - Iteratively fix TypeScript build errors
- `test-gap` - Identify areas lacking test coverage

## Kanban & Task Management

Task management uses the `@promethean/kanban` package. **You can run kanban commands from any directory in the repository** - the system automatically resolves paths correctly.

### 🎯 Essential Kanban Commands for Claude

```bash
# Core operations (use from any directory)
pnpm kanban regenerate          # Generate board from task files
pnpm kanban search <query>      # Search tasks by title/content
pnpm kanban update-status <uuid> <column>  # Move task between columns
pnpm kanban count               # Show task counts by status

# Task discovery and management
pnpm kanban find-by-title <title> # Find task by exact title match
pnpm kanban getByColumn <col>   # Get formatted tasks for a column
pnpm kanban getColumn <col>     # Get raw tasks for a column

# Board synchronization
pnpm kanban sync                # Bidirectional sync with conflict reporting
pnpm kanban pull                # Sync board from task frontmatter
pnpm kanban push                # Project board columns back to tasks
```

### 📋 Claude-Specific Kanban Workflow

1. **Before starting work**: Always search first

   ```bash
   pnpm kanban search <keyword>  # Check for existing tasks
   ```

2. **When working on tasks**: Update status to track progress

   ```bash
   pnpm kanban update-status <uuid> in_progress
   ```

3. **After completing work**: Mark as done and regenerate

   ```bash
   pnpm kanban update-status <uuid> done
   pnpm kanban regenerate
   ```

4. **When creating new tasks**: Check for duplicates first
   ```bash
   pnpm kanban search <potential-title>
   ```

### 📍 Key File Locations

- **Task files**: `docs/agile/tasks/*.md`
- **Generated board**: `docs/agile/boards/generated.md`
- **Configuration**: `promethean.kanban.json`

### 🧭 Path Resolution & Overrides

- You can invoke kanban commands from any directory. The CLI walks up the
  filesystem until it finds `.git` or `pnpm-workspace.yaml` and treats that as
  the repo root.
- Relative paths in `promethean.kanban.json` resolve from the config file's
  location. This keeps board/tasks paths stable even when running from nested
  folders.
- Override order of precedence:
  1. CLI flags such as `--board-file` and `--tasks-dir` (relative to the
     directory you run the command from).
  2. Environment variables like `KANBAN_BOARD_FILE` or `KANBAN_TASKS_DIR`
     (relative to the detected repo root).
  3. Config file entries (relative to the config directory).
- Use `--config <path>` or `KANBAN_CONFIG` to target a different config file;
  once loaded, all relative entries inside that file are resolved from its
  directory.

### 🔧 Common Column Names

**Brainstorm Lane (unbounded):**

- `icebox` - Deferred/archived tasks at varying refinement levels, not actively committed to
- `incoming` - All new tasks enter here (initial state), awaiting triage

**Planning Lane (WIP limited):**

- `accepted` - Triage complete, ready for breakdown analysis
- `breakdown` - Task being broken into small, testable slices with Fibonacci estimates
- `blocked` - Explicit dependency on another task (bidirectional links required)

**Execution Lane (WIP limited):**

- `ready` - Scoped, estimated (≤5), ready for execution queue (not priority-ordered)
- `todo` - Prioritized in execution queue, ready to pull (WIP limited)
- `in_progress` - Actively being worked on (WIP limited)
- `review` - Coherent, reviewable change exists (WIP limited)
- `document` - Recording evidence and summaries (WIP limited)
- `done` - Complete with documentation/evidence

**Abandoned Lane:**

- `rejected` - Non-viable, may be moved to Ice Box

### ⚠️ Important Notes

- **Never manually edit** `docs/agile/boards/generated.md`
- **Always regenerate** the board after task changes
- **Path resolution works from any directory** within the git repo
- **Use UUIDs** for precise task identification
- **Check duplicates** before creating new tasks

The kanban board uses Obsidian-style wikilinks and follows the workflow process in `docs/agile/process.md`.

## Package Development Workflow

### Creating New Packages

Follow the documented Nx package workflow in `docs/new-package.md` for presets, directory structure, and follow-up tasks.

### Package Dependencies

- Build dependencies are automatically handled by Nx caching
- Use `pnpm --filter <package-name>` to run commands in specific packages
- Packages should export clear APIs with TypeScript definitions

### Testing Conventions

- **Unit tests**: All tests excluding files/dirs containing `integration`, `e2e`, or `system`
- **Integration tests**: Files with `.integration.` or under `integration/` directories
- **E2E tests**: Files with `.e2e.` or under `e2e/` or `system/` directories

## Environment Configuration

Set `AGENT_NAME` in your environment before launching agent services to isolate collections and data. Key environment variables are documented in `docs/environment-variables.md`.

## Documentation

This repository doubles as an Obsidian vault. Documentation uses `[[wikilinks]]` syntax which is converted to standard Markdown during git commits via pre-commit hooks.

To enable Obsidian viewing:

```bash
cp -r docs/vault-config/.obsidian docs/.obsidian
```

## Build Requirements

### Node Version

- Required: Node.js 20.19.4
- Managed via Volta configuration in `package.json`

### Package Manager

- **Required**: pnpm 9.0.0 (enforced by preinstall script)
- npm will fail with permission errors

### Build Tools

- TypeScript 5.4.5
- Nx 20.0.0 for monorepo orchestration
- Shadow-CLJS for ClojureScript compilation
- AVA for testing with c8 coverage

## Common Patterns

### Immutable Data

Prefer immutable data structures and avoid in-place object mutation. Use key-value caches like `@promethean/level-cache` instead of JSON files for intermediate data.

### Service Communication

Services communicate through the message broker using WebSocket connections. Each service should register heartbeat monitoring for reliability.

### Error Handling

Use structured error handling with proper logging. Services should expose health check endpoints for monitoring.
