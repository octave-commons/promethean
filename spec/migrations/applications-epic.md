---
title: Application Migrations Sub-Epic
status: todo
created: 2026-04-02
type: epic
parent: services-code-migration-epic
priority: medium
---

# Application Migrations Sub-Epic

Migrate 8 application packages from `services/` to `packages/` or `orgs/riatzukiza/`.

**Total: 23 SP**

## Tasks (all <= 5 SP)

### devel-eros-eris-field - 1 SP
- Create `orgs/octave-commons/eros-eris-field` and `orgs/octave-commons/eros-eris-field-app`, move source, update workspace refs, remove old dirs — 1 SP

### portal - 1 SP
- Create `packages/portal`, move source (5 files), update workspace refs, remove old dir — 1 SP

### devel-deps-garden → depenoxx - 2 SP ✅ COMPLETED
- Rebranded as `depenoxx` and moved to `orgs/open-hax/depenoxx`
- Made workspace-agnostic via `WORKSPACE_ROOT` and `PROJECT_NAME` env vars
- Updated all UI references from "Devel Dependency Garden" to "depenoxx"
- Updated `pnpm-workspace.yaml`, deleted `services/devel-deps-garden`

### riatzukiza-portfolio - 2 SP
- Create `orgs/riatzukiza/portfolio` repo, move source (8 files), update package.json — 1 SP
- Update workspace refs, build/test, remove old dir — 1 SP

### devel-graph-weaver - 3 SP
- Create `packages/graph-weaver`, move source (21 files), update package.json and workspace refs — 1 SP
- Build, test, update deployment config — 1 SP
- Verify functionality, remove old dir — 1 SP

### eta-mu-truth-workbench - 3 SP
- Create `packages/eta-mu-truth-workbench`, move source (16 files), update package.json and workspace refs — 1 SP
- Build, test UI components, update deployment config — 1 SP
- Verify functionality, remove old dir — 1 SP

### host-fleet-dashboard - 3 SP
- Create `packages/host-fleet-dashboard`, move source (16 files), update package.json and workspace refs — 1 SP
- Build, test UI components, update deployment config — 1 SP
- Verify functionality, remove old dir — 1 SP

### cephalon-cljs - 8 SP (broken into sub-tasks)
- Create `orgs/riatzukiza/cephalon-cljs` repo, move ClojureScript source (203 files) preserving git history — 3 SP
- Update deps.edn, shadow-cljs.edn, build config, and npm interop — 2 SP
- Run shadow-cljs build, fix any path/import issues, verify compilation — 2 SP
- Update workspace refs, update cephalon-stack deployment config, remove old dir — 1 SP
