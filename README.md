# Promethean

> **"Stealing fire from the gods to grant man the gift of knowledge and wisdom."**

A modular cognitive architecture for building embodied AI agents with reasoning, perception-action loops, and emotionally mediated decision structures.

## 🎯 What is Promethean?

Promethean is a comprehensive framework for building AI agents and orchestration systems. It provides:

- **🧠 Modular Architecture** - Independent services that communicate via message brokers
- **⚡ Functional Programming** - Immutable data, pure functions, no side effects
- **🔧 Multi-language workspace** - TypeScript and Clojure packages across `cli/`, `services/`, and `experimental/`, many vendored as git submodules
- **📋 Document-Driven Development** - All work tracked through kanban tasks
- **🤖 AI-First Design** - Built from the ground up for AI agent development

## 🚀 Quick Start

```bash
git clone https://github.com/octave-commons/promethean.git
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

## 🔧 Core Components

### 📋 Kanban System

**Package:** `@promethean-os/kanban`

Task management and workflow automation designed for AI-assisted development.

```bash
# Find existing work
pnpm kanban search "authentication"

# Create new task
pnpm kanban create "Implement OAuth flow" --priority=P1 --labels="auth,security"

# Move work through process
pnpm kanban update-status <uuid> in_progress
pnpm kanban update-status <uuid> done

# Interactive dashboard
pnpm kanban ui
```

**Features:** CRUD operations, process automation, web UI, AI-friendly commands

### 🛠️ MCP Server

**Package:** `@promethean-os/mcp`

Model Context Protocol server with composable tools and enterprise-grade security.

```json
{
  "transport": "http",
  "tools": ["github_request", "files_search", "kanban_get_board"],
  "endpoints": {
    "github": { "tools": ["github_request", "github_graphql"] }
  }
}
```

**Features:** RBAC security, tool composition, HTTP/stdio transports, GitHub integration

### 🎭 Cephalon

**Package:** `@promethean-os/cephalon`

Production Discord agent runner with ENSO chat agents and evaluation guardrails.

```typescript
import { createEnsoChatAgent } from '@promethean-os/cephalon';

const agent = createEnsoChatAgent({ room: 'duck:smoke' });
await agent.connect();

// Send chat message
await agent.sendText('human', 'Check system status');

// Call tools with guardrails
await agent.callTool({
  provider: 'native',
  name: 'duck.ping',
  args: { echo: 'health-check' },
});
```

**Features:** Discord integration, voice capture, evaluation guardrails, ENSO protocol

### ⌨️ CLI Tools

**Package:** `@promethean-os/promethean-cli`

Unified interface for all workspace packages and scripts.

```bash
# Discover available commands
pnpm exec promethean --help

# Run package scripts with short aliases
pnpm exec prom packages lint
pnpm exec prom kanban search "bug"
pnpm exec prom llm start
```

**Features:** Script discovery, package management, short aliases, error recovery

## 📦 Package Ecosystem

The workspace spans CLI tools, services, experimental spikes, and legacy packages/ modules (many vendored as git submodules):

### Package Management

- **pnpm required** - npm is blocked and will fail with clear error messages
- **Workspace structure** - All packages use `@promethean-os/<package>*` via "workspace:\*"
- **Directory layout** - Active code lives under `cli/`, `services/`, and `experimental/`, with a few shared libraries still in `packages/` during migration
- **No relative imports** outside package roots

> **Submodule packages:** Many packages now live in their own `github.com/octave-commons/<name>` repositories and are mounted as git submodules under their target areas (for example: `cli/apply-patch`, `cli/kanban`, `services/autocommit`, `services/mcp`, `experimental/auth-service`). Run `git submodule update --init <path>` after cloning (or `git submodule update --init --recursive` to fetch all) and use the upstream repo for issue tracking or standalone development.

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

## 📚 Documentation

This repository doubles as an [Obsidian vault](https://obsidian.md/). Enable the kanban plugin:

```bash
cp -r docs/vault-config/.obsidian docs/.obsidian
```

### Key Documentation

- **Architecture**: `docs/architecture/index.md` - Graphs, roadmaps, and initiatives
- **Process**: `docs/agile/process.md` - Workflow and methodology
- **Environment**: `docs/environment-variables.md` - Core configuration variables
- **Nx Workspace**: `docs/nx-workspace.md` - Nx targets and graph tooling
- **Opencode Client**: `docs/inbox/README.md` - Package doc entrypoint

## 🤖 For AI Agents

The kanban system is designed for AI assistants:

- **No directory navigation needed** - commands work from anywhere
- **Automatic path resolution** - system finds config and files
- **Task search capabilities** - find existing work before creating new tasks

See `AGENTS.md` for detailed AI-specific guidelines.

## 🔧 Automation Pipelines

Complex workflows are defined in `pipelines.json`. Key pipelines:

- **symdocs** - Generate package documentation and dependency graphs
- **simtasks** - Create task backlogs from code analysis
- **codemods** - Automated code transformations
- **buildfix** - Iterate on TypeScript build failures
- **test-gap** - Identify code without test coverage

## 🔗 Promethean Remote READMEs

<!-- BEGIN: PROMETHEAN-PACKAGES-READMES -->

- [octave-commons/agent-os-protocol](https://github.com/octave-commons/agent-os-protocol#readme)
- [octave-commons/ai-learning](https://github.com/octave-commons/ai-learning#readme)
- [octave-commons/apply-patch](https://github.com/octave-commons/apply-patch#readme)
- [octave-commons/auth-service](https://github.com/octave-commons/auth-service#readme)
- [octave-commons/autocommit](https://github.com/octave-commons/autocommit#readme)
- [octave-commons/build-monitoring](https://github.com/octave-commons/build-monitoring#readme)
- [octave-commons/cli](https://github.com/octave-commons/cli#readme)
- [octave-commons/clj-hacks-tools](https://github.com/octave-commons/clj-hacks-tools#readme)
- [octave-commons/compliance-monitor](https://github.com/octave-commons/compliance-monitor#readme)
- [octave-commons/dlq](https://github.com/octave-commons/dlq#readme)
- [octave-commons/ds](https://github.com/octave-commons/ds#readme)
- [octave-commons/eidolon-field](https://github.com/octave-commons/eidolon-field#readme)
- [octave-commons/enso-agent-communication](https://github.com/octave-commons/enso-agent-communication#readme)
- [octave-commons/http](https://github.com/octave-commons/http#readme)
- [octave-commons/kanban](https://github.com/octave-commons/kanban#readme)
- [octave-commons/logger](https://github.com/octave-commons/logger#readme)
- [octave-commons/math-utils](https://github.com/octave-commons/math-utils#readme)
- [octave-commons/mcp](https://github.com/octave-commons/mcp#readme)
- [octave-commons/mcp-dev-ui-frontend](https://github.com/octave-commons/mcp-dev-ui-frontend#readme)
- [octave-commons/migrations](https://github.com/octave-commons/migrations#readme)
- [octave-commons/naming](https://github.com/octave-commons/naming#readme)
- [octave-commons/obsidian-export](https://github.com/octave-commons/obsidian-export#readme)
- [octave-commons/omni-tools](https://github.com/octave-commons/omni-tools#readme)
- [octave-commons/opencode-hub](https://github.com/octave-commons/opencode-hub#readme)
- [octave-commons/persistence](https://github.com/octave-commons/persistence#readme)
- [octave-commons/platform](https://github.com/octave-commons/platform#readme)
- [octave-commons/plugin-hooks](https://github.com/octave-commons/plugin-hooks#readme)
- [octave-commons/report-forge](https://github.com/octave-commons/report-forge#readme)
- [octave-commons/security](https://github.com/octave-commons/security#readme)
- [octave-commons/shadow-conf](https://github.com/octave-commons/shadow-conf#readme)
- [octave-commons/snapshots](https://github.com/octave-commons/snapshots#readme)
- [octave-commons/test-classifier](https://github.com/octave-commons/test-classifier#readme)
- [octave-commons/test-utils](https://github.com/octave-commons/test-utils#readme)
- [octave-commons/utils](https://github.com/octave-commons/utils#readme)
- [octave-commons/worker](https://github.com/octave-commons/worker#readme)
<!-- END: PROMETHEAN-PACKAGES-READMES -->

## 📄 License

Promethean Framework is released under the [GNU General Public License v3](LICENSE.txt).

---

**Getting Started**:

- 🚀 **New to Promethean?** Start with the [Quick Start](#-quick-start) section above
- 📦 **Need a specific component?** Browse the [Package Ecosystem](#-package-ecosystem)
- 🔧 **Developing locally?** Follow the [Development Workflow](#-development-workflow)
- 🤖 **AI Assistant?** See `AGENTS.md` for specialized guidelines
- ❓ **Need help?** Check individual package READMEs or `docs/agile/process.md`

<!-- PACKAGE-DOC-MATRIX:START -->

> This section is auto-generated by scripts/package-doc-matrix.ts. Do not edit manually.

## Internal Dependencies

- [@promethean-os/autocommit](packages/autocommit/README.md) — `orgs/octave-commons/promethean/packages/autocommit`
- [@promethean-os/kanban](cli/kanban/README.md) — `orgs/octave-commons/promethean/cli/kanban`
- [@promethean-os/persistence](packages/persistence/README.md) — `orgs/octave-commons/promethean/packages/persistence`
- [@promethean-os/shadow-conf](docs/dev/packages/shadow-conf/README.md) — `orgs/octave-commons/promethean/packages/shadow-conf`
- [@promethean-os/test-utils](packages/test-utils/README.md) — `orgs/octave-commons/promethean/packages/test-utils`
- [@promethean-os/utils](packages/utils/README.md) — `orgs/octave-commons/promethean/packages/utils`

## Internal Dependents

_None (external-only)._

_Last updated: 2025-11-16T11:25:38.889Z_

<!-- PACKAGE-DOC-MATRIX:END -->
