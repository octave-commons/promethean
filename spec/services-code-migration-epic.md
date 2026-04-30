---
title: Services/ Code Migration Epic
status: done
created: 2026-04-02
completed: 2026-04-02
type: epic
priority: high
---

# Services/ Code Migration Epic (Master)

## Summary

All source code has been migrated from `services/` into appropriate locations.

### Final State

**services/ now contains only 13 devops directories:**
- api-gateway, auto-fork-tax, cephalon-hive, cephalon-stack, eta-mu, mcp-stack, ollama-stack, opencode-stack, open-hax-openai-proxy, our-gpus, proxx, radar-stack, voxx

### Migrated Packages

| Category | Count | Destinations |
|----------|-------|--------------|
| MCP Servers | 10 | `orgs/riatzukiza/mcp-*`, `orgs/open-hax/mcp-fs-oauth` |
| Applications | 7 | `packages/portal`, `packages/graph-weaver`, etc. |
| Services | 6 | `orgs/riatzukiza/kronos`, `orgs/open-hax/janus`, etc. |
| OpenCode Tooling | 2 | `orgs/anomalyco/opencode-*` |
| Cephalon Monorepo | 2 | `orgs/octave-commons/cephalon/packages/*` |

## Sub-Epics Completed

1. ✅ MCP Server Migrations (20.5 SP)
2. ✅ OpenCode Tooling Migrations (5 SP)
3. ✅ Application Migrations (23 SP)
4. ✅ Services Migrations (25 SP)
5. ✅ Cleanup & Verification (10 SP)

## Sub-Epics

Each sub-epic has its own spec file with individual tasks broken down to **5 SP or less**.

| Sub-Epic | Spec File | Tasks | Total SP |
|----------|-----------|-------|----------|
| 1. MCP Server Migrations | `spec/migrations/mcp-servers-epic.md` | 11 | 20.5 |
| 2. OpenCode Tooling Migrations | `spec/migrations/opencode-tooling-epic.md` | 2 | 5 |
| 3. Application Migrations | `spec/migrations/applications-epic.md` | 8 | 23 |
| 4. Service Migrations | `spec/migrations/services-epic.md` | 6 | 25 |
| 5. Cleanup & Verification | `spec/migrations/cleanup-epic.md` | 4 | 10 |

**Grand Total: 83.5 SP**

## Classification Summary

### DevOps/Deployment (Stay in services/) - 13 packages

| Package | Contents |
|---------|----------|
| `api-gateway/` | Logs only (deployment artifact) |
| `auto-fork-tax/` | systemd service/timer files |
| `cephalon-hive/` | Deployment orchestrator (docker-compose, deploy.sh) |
| `cephalon-stack/` | Stack deployment (docker-compose, Dockerfile) |
| `eta-mu/` | Deployment config (compose, Dockerfile, Caddyfile) |
| `mcp-stack/` | Stack deployment (docker-compose, Dockerfile) |
| `ollama-stack/` | docker-compose only |
| `open-hax-openai-proxy/` | Deployment config (multiple docker-compose files) |
| `opencode-stack/` | Stack deployment (docker-compose, Dockerfile) |
| `our-gpus/` | Deployment/scanning config (compose, masscan) |
| `proxx/` | Deployment config (docker-compose files) |
| `radar-stack/` | Stack deployment (Dockerfiles, docker-compose) |
| `voxx/` | Deployment config (compose, Dockerfile) |

### Source Code (Must Migrate) - 27 packages

| # | Package | Type | Files | SP | Suggested Destination | Epic |
|---|---------|------|-------|----|----------------------|------|
| 1 | `cephalon-cljs/` | ClojureScript app with src/, test/, shadow-cljs | 203 | 8 | `orgs/riatzukiza/cephalon-cljs` | Applications |
| 2 | `devel-deps-garden/` | TypeScript web app | 11 | 2 | `packages/deps-garden` | Applications |
| 3 | `devel-eros-eris-field/` | TypeScript app | 5 | 1 | `orgs/octave-commons/eros-eris-field` + `orgs/octave-commons/eros-eris-field-app` | Applications |
| 4 | `devel-graph-weaver/` | TypeScript web app | 21 | 3 | `packages/graph-weaver` | Applications |
| 5 | `eta-mu-truth-workbench/` | TypeScript app with UI | 16 | 3 | `packages/eta-mu-truth-workbench` | Applications |
| 6 | `futuresight-kms/` | Deployment cleanup only (ingestion already in knoxx) | ~10 | 2 | Keep deployment config, delete old source | Services (deprioritized) |
| 7 | `host-fleet-dashboard/` | Dashboard app with UI | 16 | 3 | `packages/host-fleet-dashboard` | Applications |
| 8 | `janus/` | TypeScript OAuth service | 24 | 3 | `orgs/open-hax/janus` | Services |
| 9 | `kronos/` | TypeScript MCP server with tests | 190 | 8 | `orgs/riatzukiza/kronos` | Services |
| 10 | `mcp-devtools/` | MCP server | 5 | 2 | `orgs/riatzukiza/mcp-devtools` | MCP Servers |
| 11 | `mcp-exec/` | MCP server | 5 | 2 | `orgs/riatzukiza/mcp-exec` | MCP Servers |
| 12 | `mcp-files/` | Empty (logs only) | 0 | 0.5 | Delete | Cleanup |
| 13 | `mcp-fs-oauth/` | MCP OAuth server | 51 | 5 | `orgs/open-hax/mcp-fs-oauth` | MCP Servers |
| 14 | `mcp-github/` | MCP server | 6 | 2 | `orgs/riatzukiza/mcp-github` | MCP Servers |
| 15 | `mcp-ollama/` | MCP server | 5 | 2 | `orgs/riatzukiza/mcp-ollama` | MCP Servers |
| 16 | `mcp-process/` | MCP server | 5 | 2 | `orgs/riatzukiza/mcp-process` | MCP Servers |
| 17 | `mcp-sandboxes/` | MCP server | 5 | 2 | `orgs/riatzukiza/mcp-sandboxes` | MCP Servers |
| 18 | `mcp-social-publisher/` | MCP publisher | 14 | 3 | `orgs/riatzukiza/mcp-social-publisher` | MCP Servers |
| 19 | `mcp-tdd/` | MCP server | 5 | 2 | `orgs/riatzukiza/mcp-tdd` | MCP Servers |
| 20 | `mnemosyne/` | MCP server | 6 | 2 | `orgs/riatzukiza/mnemosyne` | MCP Servers |
| 21 | `opencode-compat/` | TypeScript compat layer | 17 | 3 | `orgs/anomalyco/opencode-compat` | OpenCode Tooling |
| 22 | `opencode-indexer/` | TypeScript indexer | 8 | 2 | `orgs/anomalyco/opencode-indexer` | OpenCode Tooling |
| 23 | `openplanner/` | Planner app with monitoring | 56 | 5 | `orgs/riatzukiza/openplanner` | Services |
| 24 | `ourllamas/` | Python service | 20 | 3 | `orgs/riatzukiza/ourllamas` | Services |
| 25 | `portal/` | Web frontend | 5 | 1 | `packages/portal` | Applications |
| 26 | `riatzukiza-portfolio/` | Portfolio app | 8 | 2 | `orgs/riatzukiza/portfolio` | Applications |
| 27 | `vivgrid-openai-proxy/` | TypeScript proxy server | 18 | 3 | `orgs/open-hax/vivgrid-openai-proxy` | Services |

## Notes on Specific Packages

### futuresight-kms (Deprioritized, Reduced Scope)
- The ingestion code has already been migrated to `orgs/open-hax/knoxx/ingestion/`
- The `vendor/` directory contains compiled artifacts that are regeneratable
- The `kms-ingestion/` subdirectory is the old location, superseded by knoxx
- **Actual work**: Delete old `kms-ingestion/` source and `vendor/` artifacts, keep only deployment config (docker-compose, Dockerfile.nginx, .env, scripts/)
- **Reduced from 13 SP to 2 SP**
- **Deprioritized** - can be done last

### cephalon-cljs (8 SP - needs breakdown)
- Largest ClojureScript codebase (203 files)
- Must be broken into sub-tasks: repo creation, source move, build config, test verification, deployment update

### kronos (8 SP - needs breakdown)
- Large TypeScript MCP server (190 files) with tests and OAuth complexity
- Must be broken into sub-tasks: repo creation, source move, test migration, deployment update

## Migration Checklist Per Package

For each package migration (all tasks must be <= 5 SP):

- [ ] Create target repository/directory
- [ ] Move source code (use `git mv` or `git subtree` to preserve history)
- [ ] Update package.json name if needed
- [ ] Update import paths in source files
- [ ] Update workspace pnpm references
- [ ] Create/update deployment config in services/
- [ ] Update any AGENTS.md files that reference the old location
- [ ] Update any skills that reference the old location
- [ ] Run builds and tests
- [ ] Verify functionality
- [ ] Remove old directory from services/
- [ ] Update this spec with completion status

## Dependencies and Risks

### Dependencies
- MCP servers may have interdependencies
- Deployment configs in services/ reference these packages
- Skills and AGENTS.md files may reference old paths
- pnpm workspace configuration needs updating

### Risks
- Breaking existing deployments during migration
- Lost git history if not moved carefully
- Import path errors after migration
- Docker build contexts may need updating

## Success Criteria

1. `services/` contains only deployment configuration (docker-compose, Dockerfiles, systemd units, etc.)
2. All source code lives in `packages/` or `orgs/*/`
3. All builds pass
4. All deployments still work
5. No broken references in skills, AGENTS.md, or configs
