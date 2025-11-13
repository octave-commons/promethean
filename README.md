# Promethean

> **"Stealing fire from the gods to grant man the gift of knowledge and wisdom."**

A modular cognitive architecture for building embodied AI agents with reasoning, perception-action loops, and emotionally mediated decision structures.

## 🎯 What is Promethean?

Promethean is a comprehensive framework for building AI agents and orchestration systems. It provides:

- **🧠 Modular Architecture** - Independent services that communicate via message brokers
- **⚡ Functional Programming** - Immutable data, pure functions, no side effects
- **🔧 TypeScript Monorepo** - 70+ packages managed with Nx, AVA testing, and ESM modules
- **📋 Document-Driven Development** - All work tracked through kanban tasks
- **🤖 AI-First Design** - Built from the ground up for AI agent development

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

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord UI   │    │   Web Frontend │    │   CLI Tools     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Message Broker Service                        │
│              (WebSocket pub/sub + task queues)                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌─────────────────┐    ┌─────────────────┐
│   LLM Service  │    │   MCP Server   │
│  (text gen)    │    │ (tools & auth) │
└─────────────────┘    └─────────────────┘
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

### 📡 Message Broker

**Package:** `broker-service`

WebSocket-based pub/sub communication backbone with task queue support.

```javascript
// Subscribe to topics
ws.send(
  JSON.stringify({
    action: 'subscribe',
    topic: 'agent.events',
  }),
);

// Publish messages
ws.send(
  JSON.stringify({
    action: 'publish',
    message: { type: 'user.input', payload: 'Hello' },
  }),
);
```

**Features:** Topic routing, Redis persistence, task queues, normalized events

### 🤖 LLM Service

**Package:** `@promethean-os/llm`

Text generation service with pluggable providers (Ollama, HuggingFace).

```bash
# Start service
./run.sh

# Generate text
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain quantum computing","context":"physics"}'
```

**Features:** Multiple providers, HTTP/WebSocket endpoints, streaming support

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

The workspace contains 70+ specialized packages organized by category:

### 🏗️ Core Infrastructure

- `@promethean-os/broker` - Message pub/sub and task queues
- `@promethean-os/persistence` - Data storage and caching layers
- `@promethean-os/security` - Authentication and authorization
- `@promethean-os/monitoring` - Health checks and metrics

### 🤖 AI & Agents

- `@promethean-os/agent` - Agent framework and ECS
- `@promethean-os/llm` - Text generation service
- `@promethean-os/embedding` - Vector embeddings and similarity
- `@promethean-os/intention` - Goal planning and execution

### 🛠️ Development Tools

- `@promethean-os/compiler` - TypeScript compilation pipeline
- `@promethean-os/test-utils` - Testing utilities and fixtures
- `@promethean-os/codemods` - Automated code transformations
- `@promethean-os/buildfix` - Iterative build error resolution

### 📊 Data & Processing

- `@promethean-os/markdown` - Document processing and parsing
- `@promethean-os/stream` - Reactive data streams
- `@promethean-os/fs` - File system operations
- `@promethean-os/event` - Event sourcing and handling

### 🌐 Web & Frontend

- `@promethean-os/http` - HTTP server and client utilities
- `@promethean-os/ws` - WebSocket connections
- `@promethean-os/frontend-service` - Static asset serving
- `@promethean-os/ui-components` - Reusable web components

[View complete package catalog →](packages/)

### Package Management

- **pnpm required** - npm is blocked and will fail with clear error messages
- **Workspace structure** - All packages use `@promethean-os/<package>*` via "workspace:\*"
- **No relative imports** outside package roots

> **Submodule packages:** The following packages now live in their own `github.com/riatzukiza/<name>` repositories and are mounted into this workspace as git submodules: `packages/apply-patch`, `packages/autocommit`, `packages/auth-service`, `packages/kanban`, `packages/logger`, `packages/mcp`, `packages/naming`, `packages/persistence`, and `packages/utils`. Run `git submodule update --init packages/<name>` after cloning to fetch their content, and use the upstream repo for issue tracking or standalone development.

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

## 🔧 Automation Pipelines

Complex workflows are defined in `pipelines.json`. Key pipelines:

- **symdocs** - Generate package documentation and dependency graphs
- **simtasks** - Create task backlogs from code analysis
- **codemods** - Automated code transformations
- **buildfix** - Iterate on TypeScript build failures
- **test-gap** - Identify code without test coverage

## 🔗 Promethean Remote READMEs

<!-- BEGIN: PROMETHEAN-PACKAGES-READMES -->
- [riatzukiza/agent-os-protocol](https://github.com/riatzukiza/agent-os-protocol#readme)
- [riatzukiza/ai-learning](https://github.com/riatzukiza/ai-learning#readme)
- [riatzukiza/apply-patch](https://github.com/riatzukiza/apply-patch#readme)
- [riatzukiza/auth-service](https://github.com/riatzukiza/auth-service#readme)
- [riatzukiza/autocommit](https://github.com/riatzukiza/autocommit#readme)
- [riatzukiza/build-monitoring](https://github.com/riatzukiza/build-monitoring#readme)
- [riatzukiza/cli](https://github.com/riatzukiza/cli#readme)
- [riatzukiza/clj-hacks-tools](https://github.com/riatzukiza/clj-hacks-tools#readme)
- [riatzukiza/compliance-monitor](https://github.com/riatzukiza/compliance-monitor#readme)
- [riatzukiza/dlq](https://github.com/riatzukiza/dlq#readme)
- [riatzukiza/ds](https://github.com/riatzukiza/ds#readme)
- [riatzukiza/eidolon-field](https://github.com/riatzukiza/eidolon-field#readme)
- [riatzukiza/enso-agent-communication](https://github.com/riatzukiza/enso-agent-communication#readme)
- [riatzukiza/http](https://github.com/riatzukiza/http#readme)
- [riatzukiza/kanban](https://github.com/riatzukiza/kanban#readme)
- [riatzukiza/logger](https://github.com/riatzukiza/logger#readme)
- [riatzukiza/math-utils](https://github.com/riatzukiza/math-utils#readme)
- [riatzukiza/mcp](https://github.com/riatzukiza/mcp#readme)
- [riatzukiza/mcp-dev-ui-frontend](https://github.com/riatzukiza/mcp-dev-ui-frontend#readme)
- [riatzukiza/migrations](https://github.com/riatzukiza/migrations#readme)
- [riatzukiza/naming](https://github.com/riatzukiza/naming#readme)
- [riatzukiza/obsidian-export](https://github.com/riatzukiza/obsidian-export#readme)
- [riatzukiza/omni-tools](https://github.com/riatzukiza/omni-tools#readme)
- [riatzukiza/opencode-hub](https://github.com/riatzukiza/opencode-hub#readme)
- [riatzukiza/persistence](https://github.com/riatzukiza/persistence#readme)
- [riatzukiza/platform](https://github.com/riatzukiza/platform#readme)
- [riatzukiza/plugin-hooks](https://github.com/riatzukiza/plugin-hooks#readme)
- [riatzukiza/report-forge](https://github.com/riatzukiza/report-forge#readme)
- [riatzukiza/security](https://github.com/riatzukiza/security#readme)
- [riatzukiza/shadow-conf](https://github.com/riatzukiza/shadow-conf#readme)
- [riatzukiza/snapshots](https://github.com/riatzukiza/snapshots#readme)
- [riatzukiza/test-classifier](https://github.com/riatzukiza/test-classifier#readme)
- [riatzukiza/test-utils](https://github.com/riatzukiza/test-utils#readme)
- [riatzukiza/utils](https://github.com/riatzukiza/utils#readme)
- [riatzukiza/worker](https://github.com/riatzukiza/worker#readme)
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
