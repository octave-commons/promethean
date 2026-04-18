---
title: MCP Server Migrations Sub-Epic
status: done
created: 2026-04-02
completed: 2026-04-02
type: epic
parent: services-code-migration-epic
priority: high
---

# MCP Server Migrations Sub-Epic

Migrate 10 MCP servers from `services/` to `orgs/riatzukiza/` and `orgs/open-hax/`.

**Total: 20.5 SP** — **COMPLETED**

## What Happened

The MCP servers already existed in their target locations under `orgs/riatzukiza/` and `orgs/open-hax/` with identical source code. The `services/` copies were redundant duplicates. Migration was simply:

1. Delete redundant `services/` copies (10 directories)
2. Update `services/mcp-stack/ecosystem.container.config.cjs` cwd paths
3. Update `pnpm-workspace.yaml` to reference new org locations
4. Delete empty `services/mcp-files/` directory

## Completed Tasks

### mcp-devtools - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-devtools`
- Deleted `services/mcp-devtools/`
- Updated ecosystem config cwd

### mcp-exec - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-exec`
- Deleted `services/mcp-exec/`
- Updated ecosystem config cwd

### mcp-github - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-github`
- Deleted `services/mcp-github/`
- Updated ecosystem config cwd

### mcp-ollama - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-ollama`
- Deleted `services/mcp-ollama/`
- Updated ecosystem config cwd

### mcp-process - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-process`
- Deleted `services/mcp-process/`
- Updated ecosystem config cwd

### mcp-sandboxes - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-sandboxes`
- Deleted `services/mcp-sandboxes/`
- Updated ecosystem config cwd

### mcp-tdd - 2 SP ✅
- Source already at `orgs/riatzukiza/mcp-tdd`
- Deleted `services/mcp-tdd/`
- Updated ecosystem config cwd

### mnemosyne - 2 SP ✅
- Source already at `orgs/riatzukiza/mnemosyne`
- Deleted `services/mnemosyne/`
- Updated ecosystem config cwd

### mcp-social-publisher - 3 SP ✅
- Source already at `orgs/riatzukiza/mcp-social-publisher`
- Deleted `services/mcp-social-publisher/`
- Updated ecosystem config cwd

### mcp-fs-oauth - 5 SP ✅
- Source already at `orgs/open-hax/mcp-fs-oauth`
- Deleted `services/mcp-fs-oauth/`
- Updated ecosystem config cwd (both stable and dev instances)

### mcp-files - 0.5 SP ✅
- Deleted empty `services/mcp-files/` (logs only)

## Files Changed
- `pnpm-workspace.yaml` — added 10 new org package entries
- `services/mcp-stack/ecosystem.container.config.cjs` — updated all 12 cwd paths
- Deleted: `services/mcp-devtools/`, `services/mcp-exec/`, `services/mcp-github/`, `services/mcp-ollama/`, `services/mcp-process/`, `services/mcp-sandboxes/`, `services/mcp-tdd/`, `services/mnemosyne/`, `services/mcp-social-publisher/`, `services/mcp-fs-oauth/`, `services/mcp-files/`
