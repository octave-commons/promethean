---
title: OpenCode Tooling Migrations Sub-Epic
status: todo
created: 2026-04-02
type: epic
parent: services-code-migration-epic
priority: high
---

# OpenCode Tooling Migrations Sub-Epic

Migrate 2 OpenCode-related packages from `services/` to `orgs/anomalyco/`.

**Total: 5 SP**

## Tasks (all <= 5 SP)

### opencode-compat - 3 SP
- Create `orgs/anomalyco/opencode-compat` repo, move source (17 files), update package.json — 2 SP
- Update workspace pnpm refs, opencode-stack deployment config, build/test, remove old dir — 1 SP

### opencode-indexer - 2 SP
- Create `orgs/anomalyco/opencode-indexer` repo, move source (8 files), update package.json — 1 SP
- Update workspace pnpm refs, opencode-stack deployment config, build/test, remove old dir — 1 SP
