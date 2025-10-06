---
uuid: e0a6842d-031a-4d1c-bee1-563bbda8cf80
title: Extract shared services into @promethean/omni-core
status: in_progress
priority: P1
labels:
  - omni
  - refactor
created_at: '2025-09-21T02:46:00Z'
---
## 🎯 Outcome
Relocate SmartGPT bridge domain logic (files/search/sinks/indexer/agents/exec) into a reusable `@promethean/omni-core` package that implements the Omni protocol interfaces.

## 📥 Inputs
- [[docs/architecture/omni/omni-service-roadmap.md]]
- `bridge/src/routes/v1/*`
- `packages/mcp/src/tools/github/*`

## ✅ Definition of Done
- [ ] New package `packages/omni-core/` with build/test scripts.
- [ ] Core services expose protocol-compliant methods consuming existing stores and supervisors.
- [ ] MCP file + GitHub helpers delegate to omni-core implementations.
- [ ] Existing SmartGPT bridge re-exports continue working via thin adapters.
- [ ] Regression tests (AVA) run against omni-core services.

## 🪜 Steps
1. Inventory dependencies (Mongo, Chroma, config) and define injection points.
2. Move file/search/sink/indexer/agent/exec modules into omni-core with minimal surface changes.
3. Update MCP package to consume omni-core services.
4. Provide Fastify request context builder hooking into auth/RBAC.
5. Run affected package tests; update docs + changelog.

## 🔗 Dependencies
- [[docs/agile/tasks/author-omni-protocol-package.md]]
- [[docs/agile/tasks/omni-unified-service-spec.md]]
