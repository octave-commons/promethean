# Promethean Framework

A modular cognitive architecture for building embodied AI agents with reasoning, perception-action loops, and emotionally mediated decision structures.

## 🚀 Quick Start

```bash
git clone https://github.com/PrometheanAI/promethean.git
cd promethean

# Enable pnpm 9 via Corepack (required)
corepack enable && corepack prepare pnpm@9 --activate

# Install dependencies and start development
pnpm install
pnpm dev:all
```

For containerized development:

```bash
docker compose up
```

## 📋 Overview

Promethean breaks AI systems into small, focused services handling speech-to-text, text-to-speech, memory, and higher-level reasoning. The framework emphasizes:

- **Modular architecture** - Independent services that communicate via message brokers
- **Functional programming** - Immutable data, no in-place mutation
- **TypeScript monorepo** - Managed with Nx, AVA testing, and ESM modules
- **Document-driven development** - All work tracked through kanban tasks

## 🏗️ Repository Structure

```
packages/     # JS/TS modules with individual READMEs
tests/        # Unit and integration test suites
docs/         # System documentation and architecture
apps/         # Frontend applications
scripts/      # Build and automation tools
```

## 🎯 Kanban Task Management

All work follows the kanban process defined in `docs/agile/process.md`. The board is managed via the `@promethean/kanban` package.

### Essential Commands

```bash
# Core workflow (works from any directory)
pnpm kanban search <query>          # Find existing tasks
pnpm kanban update-status <uuid> <column>  # Move tasks
pnpm kanban regenerate             # Refresh board after changes
pnpm kanban count                  # Show task counts

# Full help and advanced operations
pnpm kanban --help
```

### Key Files

- **Tasks**: `docs/agile/tasks/*.md` - Individual task definitions
- **Board**: `docs/agile/boards/generated.md` - Auto-generated kanban board
- **Config**: `promethean.kanban.json` - System configuration

## 🔄 Repository Migrations

Schema and content changes use structured migrations to avoid ad-hoc scripts:

```bash
# Apply pending migrations
pnpm tsx packages/migrations/src/index.ts up

# List migration status
pnpm tsx packages/migrations/src/index.ts list

# Regenerate board after migrations
pnpm kanban regenerate
```

**Current policy**: Use `tags:` (lowercase) in frontmatter instead of deprecated `labels`.

## 🛠️ Development Workflow

### Package Management

- **pnpm required** - npm is blocked and will fail with clear error messages
- **Workspace structure** - All packages use `@promethean/<package>*` via "workspace:\*"
- **No relative imports** outside package roots

### Testing

```bash
# Split by type for faster feedback
pnpm test:unit         # Unit tests (fastest)
pnpm test:integration  # Integration tests
pnpm test:e2e         # End-to-end tests
```

### Linting

```bash
pnpm lint:diff        # Only changed files (development)
pnpm lint            # Full repository (CI/pre-commit)
```

## 🏃 Service Management

Start shared infrastructure with PM2:

```bash
# Start core services
pm2 start system/daemons/ecosystem.config.js

# Regenerate config after adding/removing services
pnpm gen:ecosystem

# Start individual agents
pm2 start agents/duck/ecosystem.config.js
```

Install PM2 globally: `pnpm add -g pm2`

## 📚 Documentation

This repository doubles as an [Obsidian vault](https://obsidian.md/). Enable the kanban plugin:

```bash
cp -r docs/vault-config/.obsidian docs/.obsidian
```

### Key Documentation

- **Architecture**: `docs/architecture/` - System design and roadmaps
- **Process**: `docs/agile/process.md` - Workflow and methodology
- **Environment**: `docs/environment-variables.md` - Configuration options
- **Nx Workspace**: `docs/nx-workspace.md` - Build tooling commands

## 🤖 For AI Agents

The kanban system is designed for AI assistants:

- **No directory navigation needed** - commands work from anywhere
- **Automatic path resolution** - system finds config and files
- **Task search capabilities** - find existing work before creating new tasks

See `AGENTS.md` for detailed AI-specific guidelines.

## 📦 Package Catalog

The workspace contains 70+ packages. Each has its own README with detailed usage information. Key packages include:

| Package              | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `@promethean/kanban` | Task management and workflow automation   |
| `@promethean/broker` | WebSocket-based message pub/sub           |
| `@promethean/llm`    | LLM service with HTTP/WebSocket endpoints |
| `@promethean/piper`  | Pipeline runner for automation workflows  |
| `@promethean/docops` | Documentation processing and maintenance  |
| `@promethean/mcp`    | MCP server with composable tools          |

[View complete package catalog →](packages/)

## 🔧 Automation Pipelines

Complex workflows are defined in `pipelines.json`. Key pipelines:

- **symdocs** - Generate package documentation and dependency graphs
- **simtasks** - Create task backlogs from code analysis
- **codemods** - Automated code transformations
- **buildfix** - Iterate on TypeScript build failures
- **test-gap** - Identify code without test coverage

## 📄 License

Promethean Framework is released under the [GNU General Public License v3](LICENSE.txt).

---

**Getting Help**:

- Check individual package READMEs for detailed usage
- Review `docs/agile/process.md` for workflow questions
- Use `pnpm kanban --help` for task management commands
