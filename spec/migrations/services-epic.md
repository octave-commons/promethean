---
title: Service Migrations Sub-Epic
status: todo
created: 2026-04-02
type: epic
parent: services-code-migration-epic
priority: medium
---

# Service Migrations Sub-Epic

Migrate 6 service packages from `services/` to `orgs/riatzukiza/` and `orgs/open-hax/`.

**Total: 25 SP**

## Tasks (all <= 5 SP)

### janus - 3 SP
- Create `orgs/open-hax/janus` repo, move source (24 files), update package.json — 2 SP
- Update workspace refs, build/test OAuth flow, update deployment config, remove old dir — 1 SP

### ourllamas - 3 SP
- Create `orgs/riatzukiza/ourllamas` repo, move Python source (20 files) — 2 SP
- Update deployment config, verify Python env, remove old dir — 1 SP

### vivgrid-openai-proxy - 3 SP
- Create `orgs/open-hax/vivgrid-openai-proxy` repo, move source (18 files), update package.json — 2 SP
- Update workspace refs, verify proxy config, update deployment, remove old dir — 1 SP

### openplanner - 5 SP
- Create `orgs/riatzukiza/openplanner` repo, move source (56 files), update package.json — 2 SP
- Update workspace refs, migrate prometheus/grafana configs — 1 SP
- Update docker-compose, build, test API endpoints — 1 SP
- Verify monitoring stack integration, remove old dir — 1 SP

### kronos - 8 SP (broken into sub-tasks)
- Create `orgs/riatzukiza/kronos` repo, move TypeScript source (190 files) preserving git history — 3 SP
- Update package.json, tsconfig, import paths, workspace refs — 2 SP
- Migrate test suite, run tests, fix any breaking changes — 2 SP
- Update deployment config, verify OAuth server, remove old dir — 1 SP

### futuresight-kms - 2 SP (DEPRIORITIZED)
- Delete old `kms-ingestion/` source directory (already migrated to `orgs/open-hax/knoxx/ingestion/`) — 1 SP
- Delete `vendor/` compiled artifacts, verify deployment config still works — 1 SP
- **Note**: Deprioritized. Ingestion already lives in knoxx. Only cleanup needed.
