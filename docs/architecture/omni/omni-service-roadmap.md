# Omni Service Roadmap

**Status:** Draft (2025-09-21)

This roadmap converts the Omni protocol vision into an incremental delivery plan with milestones, success metrics, and task seeds.

## Phase 0 – Planning & Alignment (Week 0)
- ✅ Draft Omni Protocol Specification ([[docs/architecture/omni/omni-protocol-spec.md]]).
- Capture agile tasks for protocol package, core extraction, and unified service host.
- Hold architecture review with bridge + MCP maintainers.

**Exit Criteria**
- Spec signed off.
- Tasks transitioned to **Breakdown** with estimates ≤5.

## Phase 1 – Protocol Package (Weeks 1–2)
**Objective:** Publish `@promethean/omni-protocol` as the single source of truth.

**Workstreams**
1. Package scaffolding (build/test scripts, lint, license). *(Task: [[docs/agile/tasks/author-omni-protocol-package.md]])*
2. Type definitions + runtime validation (success/error envelopes, streaming events).
3. Metadata catalog for adapter generation (RBAC tags, JSON schema emitters).
4. Unit tests + documentation.

**Deliverables**
- NPM package `@promethean/omni-protocol@0.1.0`.
- Spec-to-code traceability table in `docs/packages/omni-protocol.md`.
- ESLint/TypeScript clean builds.

**Risks & Mitigations**
- *Risk:* Divergence from bridge response shapes → *Mitigation:* snapshot tests vs existing handlers.
- *Risk:* Schema drift → *Mitigation:* incorporate JSON schema generation tests in CI.

## Phase 2 – Core Consolidation (Weeks 2–4)
**Objective:** Move domain logic into `@promethean/omni-core` and eliminate duplication.

**Workstreams**
1. Dependency inventory + injection design (Mongo, Chroma, config, caches).
2. Port file/search/sink/indexer/agent/exec services with protocol-compliant signatures. *(Task: [[docs/agile/tasks/extract-omni-core-services.md]])*
3. Refactor `@promethean/mcp` GitHub + file helpers to delegate to core.
4. Introduce shared RequestContext builder utilities for Fastify + MCP.
5. Regression testing across bridge + MCP packages.

**Deliverables**
- Package `@promethean/omni-core@0.1.0`.
- Updated MCP package consuming omni-core.
- Bridge routes delegating to omni-core services.

**Risks & Mitigations**
- *Risk:* Hidden coupling in bridge code → *Mitigation:* incremental migration with feature flags.
- *Risk:* Test coverage gaps → *Mitigation:* expand AVA suites + contract tests before moving logic.

## Phase 3 – Adapter Packages (Weeks 4–7)
**Objective:** Provide transport-specific adapters for REST, GraphQL, WebSocket, MCP.

**Workstreams**
1. `@promethean/omni-rest` – Fastify plugin replicating `/v1` routes + OpenAPI.
2. `@promethean/omni-graphql` – Schema generation + resolvers.
3. `@promethean/omni-ws` – RPC + streaming channels.
4. `@promethean/omni-mcp` – Refactored MCP package hooking into omni-core.
5. Client SDK scaffolding (REST, GraphQL, WS, MCP) begins once server adapters stabilize.

**Milestones**
- REST adapter passes legacy integration suite.
- GraphQL schema validated with introspection + example queries.
- WebSocket adapter supports agent log streaming parity.
- MCP package offers HTTP + stdio transports.

**Risks & Mitigations**
- *Risk:* Schema explosion across adapters → *Mitigation:* generate from protocol metadata.
- *Risk:* SSE vs WS streaming divergence → *Mitigation:* adopt shared stream event tests.

## Phase 4 – Unified Omni Service (Weeks 7–9)
**Objective:** Launch `@promethean/omni-service` hosting all adapters on one Fastify instance.

**Workstreams**
1. Assemble service host (boot sequence, lifecycle hooks). *(Task: [[docs/agile/tasks/assemble-omni-service-host.md]])*
2. Configure shared auth/RBAC + RequestContext wiring.
3. Mount adapters under `/rest`, `/graphql`, `/ws`, `/mcp` namespaces.
4. Provide reference nginx config + health checks.
5. Implement cross-interface smoke tests + CI automation.

**Exit Criteria**
- Single server exposes all interfaces from same domain/port.
- Bridge package consumes omni-service.
- Documentation updated (deployment, migration guide).

## Phase 5 – Extension System (Weeks 9–11)
**Objective:** Allow arbitrary TypeScript modules to register new protocol namespaces consumed by all adapters.

**Workstreams**
1. Define `OmniExtension` contract (metadata + handler registration).
2. Adapter auto-projection of extensions (REST routes, GraphQL schema, WS channels, MCP tools).
3. Extension discovery (config-based import) and lifecycle management.
4. Author sample extension + tests.

**Dependencies**
- Omni protocol + core stabilized.
- Adapters expose metadata hooks.

## Phase 6 – Migration & Rollout (Weeks 11–13)
**Objective:** Cut traffic over to the unified Omni service without regressions.

**Workstreams**
1. Update SmartGPT bridge to depend on omni-service; maintain `/v0` compat layer.
2. Nginx config updates + observability dashboards.
3. Client SDK releases (REST/GraphQL/WS/MCP) with migration guides.
4. Parity + load testing, rollback plan.

**Success Metrics**
- 0 critical regressions in file/search/agent flows.
- Latency within ±5% of baseline for REST.
- New adapters meet SLA for streaming events (<1s tail).

## Backlog & Task Seeds
- [ ] Define cache provider abstraction for GitHub tooling.
- [ ] Write contract tests verifying identical results across adapters.
- [ ] Document extension authoring cookbook.
- [ ] Evaluate SSE retirement once WebSocket adapter stable.

## Governance
- Weekly Omni working group stand-up.
- Spec changes require PR + architecture sign-off.
- Roadmap updates tracked via kanban board (`#omni` label).

## Appendix A – Milestone Table
| Phase | Milestone | Owner | Target Week | Exit Artifact |
| --- | --- | --- | --- | --- |
| 0 | Spec ratified | Omni WG | W0 | Approved PR comment |
| 1 | Protocol package published | Core platform | W2 | npm tag + docs |
| 2 | Omni core integrated | Core platform | W4 | Bridge using omni-core |
| 3 | Adapters beta | Platform services | W7 | Integration suite green |
| 4 | Omni service GA | Platform services | W9 | Deployment guide |
| 5 | Extension SDK alpha | Developer experience | W11 | Sample extension repo |
| 6 | Migration complete | Platform ops | W13 | Postmortem doc |

---
*Roadmap maintained alongside Omni spec. Update tasks and milestones as progress occurs.*
