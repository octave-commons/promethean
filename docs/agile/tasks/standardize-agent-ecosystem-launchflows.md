---
uuid: "ab4b2c51-91e6-4880-9390-30609209389c"
title: "standardize agent ecosystem launch flows"
slug: "standardize-agent-ecosystem-launchflows"
status: "done"
priority: "P2"
labels: ["agents", "devx", "duck"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Background: Contributors still rely on outdated Makefile targets to launch agents. The backlog calls for PM2 (or an alternative) baselines, reusable ecosystem declarations (starting with Duck), and documentation that ties `pnpm --filter` scripts to real-world dev flows.

Goal: Ship a consistent launch workflow so every agent (Duck, Cephalon, Discord forwarders, etc.) advertises the same process metadata, tooling, and documentation.

Scope:

- Decide on a process manager baseline (PM2 or replacement), produce canonical ecosystem config examples, and codify them under `scripts/` or a new shared package.
- Inventories each agent package's `dev`/`start` scripts, aligning them with `pnpm --filter` workflows and ensuring docs reference the correct commands.
- Generate or update `AGENTS.md` stubs (potentially via automation) so every service inherits the same launch section, environment variable expectations, and health checks.
- Document the combined workflow in `docs/agents/` including quickstart tables for Duck, ENSO gateway, Cephalon, and supporting tooling.

Out of Scope:

- Refactoring agent business logic unrelated to launch orchestration.
- Building CI deployment pipelines (focus is on developer ergonomics and local ops).

Exit Criteria:

- A shared process manager configuration (or equivalent) exists with working examples for Duck and at least one additional agent.
- Agent package scripts (`pnpm --filter ...`) are verified and documented; stale Makefile references are removed or updated.
- `AGENTS.md` files across agent services share the standardized launch template.
- Docs include an end-to-end launch guide linking to ecosystem declarations and troubleshooting tips.

---

## ✅ Completion Notes

Successfully standardized agent ecosystem launch flows with:

### 🏗️ **Infrastructure Created**

- **`ecosystem.agents.config.js`** - Standardized PM2 configuration for all core agents
- **`scripts/launch-agents.mjs`** - Unified launcher script with comprehensive options
- **`docs/agents/launch-workflows.md`** - Complete launch workflow documentation

### 📦 **Agent Coverage**

- **Cephalon** (Discord agent) - `start:dev` / `start` scripts
- **Duck Web** (Web interface) - `dev` / `preview` scripts
- **ENSO Gateway** (Browser WebSocket) - `dev` script
- **SmartGPT Bridge** - `dev` / `start` scripts
- **Supporting services** (Broker, LLM, Voice) - standardized patterns

### 🔧 **Standardization Achieved**

- **Consistent script naming** across all agent packages
- **Unified environment variables** and configuration patterns
- **Standard health endpoints** (`/health`) for monitoring
- **PM2 ecosystem config** with development/production variants
- **Comprehensive launcher script** with health checks and status monitoring

### 📚 **Documentation Updated**

- **AGENTS.md** updated with launch workflow section
- **Migration guide** from old Makefile targets to pnpm commands
- **Troubleshooting guide** and production considerations
- **Quick reference tables** for ports, commands, and health endpoints

### 🚀 **Developer Experience**

- **Single command launch**: `node scripts/launch-agents.mjs cephalon`
- **Batch operations**: `node scripts/launch-agents.mjs --all --dev`
- **Health monitoring**: `node scripts/launch-agents.mjs --health`
- **Status tracking**: `node scripts/launch-agents.mjs --status`

The ecosystem now provides a consistent, well-documented launch experience that eliminates reliance on outdated Makefile targets and establishes clear patterns for agent development and deployment.
