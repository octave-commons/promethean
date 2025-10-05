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

Task management uses the `@promethean/kanban-cli` package:

```bash
pnpm kanban pull    # Sync board from task frontmatter
pnpm kanban push    # Project board columns back to tasks
pnpm kanban sync    # Bidirectional sync with conflict reporting
```

The kanban board lives at `docs/agile/boards/kanban.md` and uses Obsidian-style wikilinks.

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