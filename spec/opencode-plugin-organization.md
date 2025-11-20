# OpenCode Plugin Organization Audit

## Purpose

- Catalog all OpenCode-related plugins, highlight duplication or fragmentation, and outline a consolidation/splitting strategy that improves maintainability, testing, and developer ergonomics.
- Provide actionable testing hooks so each plugin can be validated in isolation and together as part of the `opencode-client` surface.

## Code References

- `packages/opencode-client/src/plugins/opencode-interface/index.ts:5` — Primary interface plugin exposing 12+ tools, currently intermixing session/event/message logic and markdown serialization.
- `packages/opencode-client/src/plugins/realtime-capture/index.ts:5` — Real-time indexing plugin with custom composables (`createStateManagerComposable`, `createEventManager`, etc.) tightly coupled to local instantiation.
- `packages/opencode-client/src/plugins/event-hooks/index.ts:10` — Event hook plugin that wraps `hookManager` functions from `packages/opencode-client/src/hooks/tool-execute-hooks.ts:1` but leaves serialization and validation as TODOs.
- `packages/opencode-interface-plugin/src/index.ts:5` — Stand-alone package that duplicates most of the interface plugin logic (including validation helpers) instead of importing from `opencode-client`.
- `packages/realtime-capture-plugin/src/index.ts:5` and `packages/event-hooks-plugin/src/index.ts:9` — Thin wrappers re-exporting the `opencode-client` plugin implementations via dynamic import, signaling an opportunity to formalize a shared runtime adapter.
- `docs/agile/tasks/2025.10.26.17.17.40-extract-plugins-to-independent-packages.md:15` and `docs/agile/tasks/plugin-parity-001-implement-event-hooks-plugin.md:15` — Active work items capturing the desire to extract and harden plugin packages.

## Existing Work / Issues

- **Extract Plugins to Independent Packages** (`docs/agile/tasks/2025.10.26.17.17.40-extract-plugins-to-independent-packages.md`) — tracks modularization of interface, real-time capture, and event-hooks plugins.
- **plugin-parity-001: implement event-hooks plugin** (`docs/agile/tasks/plugin-parity-001-implement-event-hooks-plugin.md`) — mandates a tested hook manager API and examples under `packages/opencode-client/src/plugins/event-hooks/`.
- Build failures logged in `build-report.txt:212-230` and `docs/agile/tasks/2025.11.07.fix-promethean-os-opencode-interface-plugin-build.md` show the interface plugin package currently blocks CI until `@promethean-os/persistence` exports align.

## Requirements

- Inventory each plugin’s responsibilities, dependencies, and consumers (CLI tools, SDKs, automation) with clear boundaries.
- Identify logic that should be split (e.g., markdown formatting vs. store access) to lower coupling and surface reusable utilities.
- Flag components that should be consolidated (e.g., duplicate interface plugin implementations, shared hook/runtime adapters) to eliminate divergence.
- Provide a concrete testing approach per plugin (unit + integration) plus minimal end-to-end coverage across combined deployments.
- Recommend a packaging strategy that keeps `opencode-client` as the canonical implementation while exposing thin distribution wrappers where necessary.

## Definition of Done

- Written audit summarizing current plugin inventory, dependency graph, and drift areas.
- Prioritized backlog of “split” vs “merge” actions, each pointing to specific files/lines and justified by coupling or duplication concerns.
- Testing matrix describing which existing AVA suites (`packages/opencode-interface-plugin/tests/*.ts`, `packages/opencode-client/test-*.ts`) or new cases validate each plugin scenario.
- Consolidation blueprint that explains how to share runtimes (client creation, hook manager, composables) without re-copying code between packages.

## Plan (Phased)

1. **Phase 1 – Inventory & Mapping**
   - Enumerate all plugin entrypoints (`opencode-client` + dedicated packages) and build a feature table (tools exposed, events handled, stateful components, dependencies on stores/services).
   - Highlight duplication, e.g., the interface plugin defined twice (`opencode-client` vs `opencode-interface-plugin`) and inconsistent validation logic.
2. **Phase 2 – Testing Surfaces**
   - Align package-level AVA configs so `pnpm --filter @promethean-os/<plugin> test` exercises the same contract exposed from `opencode-client`.
   - Introduce smoke/e2e coverage via `pnpm --filter @promethean-os/opencode-unified exec playwright tests/e2e/opencode-integration.playwright.spec.ts` to assert multi-plugin interactions.
3. **Phase 3 – Split & Share**
   - Extract shared concerns (markdown serialization, store initialization, client adapters) into `packages/opencode-client/src/plugins/shared/*` and re-export them into `packages/opencode-interface-plugin` to prevent drift.
   - Break gargantuan files (e.g., `packages/opencode-client/src/plugins/opencode-interface/index.ts:5-630`) into feature modules: `sessions.ts`, `events.ts`, `messages.ts`, `search.ts`.
4. **Phase 4 – Consolidate & Package**
   - Replace the thin wrapper packages (`event-hooks-plugin`, `realtime-capture-plugin`) with generated bundles that depend on published `opencode-client` artifacts or share a single `@promethean-os/opencode-plugins-runtime` bridge.
   - Document the finalized structure inside `docs/agile/kanban-cli-reference.md` and `docs/agile/process.md` to keep the knowledge graph traversable.
5. **Phase 5 – Verification & Migration**
   - Run targeted builds/tests per package plus `pnpm --filter @promethean-os/opencode-client build` to ensure shared modules compile.
   - Update change-logs (`changelog.d/*`) with migration guidance and deprecate duplicate entrypoints once new packages are proven stable.

---

### 2025-11-12 Update

- Introduced shared tool builders (`src/shared`, `src/tools`) and renamed the interface plugin to **Session Orchestrator Plugin** with `SessionIndexingPlugin` + `AgentOrchestrationPlugin` splits.
- `@promethean-os/opencode-client` now re-exports the shared implementation instead of maintaining a forked copy.
- README now documents npm installation, dev setup (file:// opencode.json entries), and publish steps for the renamed plugin.
