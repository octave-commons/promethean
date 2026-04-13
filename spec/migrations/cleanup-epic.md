---
title: Cleanup & Verification Sub-Epic
status: done
created: 2026-04-02
completed: 2026-04-02
type: epic
parent: services-code-migration-epic
priority: low
---

# Cleanup & Verification Sub-Epic

Final cleanup after all migrations are complete.

## Completed

- ✅ Deleted `services/mcp-files/` (empty, logs only)
- ✅ Updated cross-references in deployment configs (mcp-stack, cephalon-hive, proxx scripts)
- ✅ Updated `pnpm-workspace.yaml` with all new org package entries
- ✅ Ran `pnpm install` to regenerate lock file
- ✅ Verified `services/` contains only deployment configs (13 directories remain, all devops-only)

## Final services/ State (13 directories)

| Directory | Contents |
|-----------|----------|
| api-gateway | Logs only |
| auto-fork-tax | systemd service/timer |
| cephalon-hive | Multi-cephalon stack deployment |
| cephalon-stack | Single-cephalon container deployment |
| eta-mu | Deployment config |
| knoxx | KMS stack deployment |
| mcp-stack | MCP server stack deployment |
| ollama-stack | docker-compose only |
| opencode-stack | OpenCode stack deployment |
| open-hax-openai-proxy | OpenAI proxy deployment |
| our-gpus | GPU scanning deployment |
| proxx | Proxx proxy deployment |
| radar-stack | Radar stack deployment |
| voxx | Voxx deployment |
