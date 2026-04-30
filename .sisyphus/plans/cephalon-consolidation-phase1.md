# Cephalon Phase 1 Consolidation Plan

Goal: Consolidate all CLJS/TS functionality into `services/cephalon-cljs/` with full TDD coverage, keeping legacy packages for reference and defining a Redis RPC envelope now (schema only).

Decisions (confirmed):
- Canonical package stays at `services/cephalon-cljs/` (no rename).
- Define Redis RPC envelope in Phase 1 (no Redis implementation yet).
- TDD: tests first for every migrated module.
- Keep all old packages for reference; do not delete.

Constraints:
- No refactors, no algorithm changes, no new features.
- Fix syntax/LSP errors only when required to make tests compile.
- Preserve existing behavior even if imperfect; document bugs instead of fixing.

## Phase 1 Tasks

### Wave 1: Planning + Contracts
- [x] Audit dependency graph for modules in `packages/cephalon-cljs/src/promethean/` and document migration order.
- [x] Sync `services/cephalon-cljs/package.json` dependencies with modules being migrated (chokidar, discord.js, openai).
- [x] Define Redis RPC envelope schema (CLJS only, no Redis IO), with tests.
- [x] Add test utilities for TDD (fixtures, helpers, mocks).

### Wave 2: Pure core libs (fast unit tests, no IO)
- [x] Migrate `memory/model.cljs` with unit tests.
- [x] Migrate `memory/dedupe.cljs` with unit tests.
- [x] Migrate `memory/tags.cljs` with unit tests.
- [x] Migrate `contracts/markdown_frontmatter.cljs` with unit tests.
- [x] Migrate `eidolon/similarity.cljs` with unit tests.
- [x] Migrate `eidolon/nexus_keys.cljs` with unit tests.

### Wave 3: Stateful but in-memory libs
- [x] Migrate `memory/store.cljs` with unit tests.
- [x] Migrate `eidolon/nexus_index.cljs` with unit tests.
- [x] Migrate `eidolon/vector_store.cljs` with unit tests.
- [x] Migrate `eidolon/embed.cljs` with unit tests.

### Wave 4: IO adapters + LLM
- [x] Migrate `adapters/fs.cljs` with unit tests (mock fs/chokidar).
- [x] Migrate `adapters/discord.cljs` with unit tests (mock Discord.js, no network).
- [x] Migrate `llm/openai.cljs` with unit tests (mock OpenAI client).

### Wave 5: Systems
- [x] Migrate `sys/route.cljs` with integration tests.
- [x] Migrate `sys/memory.cljs` with integration tests.
- [x] Migrate `sys/eidolon.cljs` with integration tests.
- [x] Migrate `sys/eidolon_vectors.cljs` with integration tests.
- [x] Migrate `sys/sentinel.cljs` with integration tests.
- [x] Migrate `sys/effects.cljs` with integration tests.
- [x] Migrate `sys/cephalon.cljs` with integration tests.

### Wave 6: Wire + E2E
- [x] Wire all systems into `services/cephalon-cljs/src/promethean/main.cljs` (preserve TS bridge).
- [x] Add E2E workflow tests (Discord event flow, file watcher flow, memory dedupe flow).

## Acceptance Criteria
- [x] All migrated modules compile in `services/cephalon-cljs` with zero LSP errors.
- [x] Unit, integration, and E2E tests pass.
- [x] `services/cephalon-cljs` builds via shadow-cljs :cephalon and :test.
- [x] Redis RPC envelope defined and tested, but no Redis IO added.
- [x] Legacy packages remain intact for reference.

## Verification Commands
```
cd services/cephalon-cljs && npx shadow-cljs compile :cephalon
cd services/cephalon-cljs && npx shadow-cljs compile :test
cd services/cephalon-cljs && bun run test
```

## Module Migration List (from packages → services)
- adapters: `adapters/discord.cljs`, `adapters/fs.cljs`
- llm: `llm/openai.cljs`
- memory: `memory/types.cljs`, `memory/store.cljs`, `memory/model.cljs`, `memory/dedupe.cljs`, `memory/tags.cljs`
- contracts: `contracts/markdown_frontmatter.cljs`
- eidolon: `eidolon/embed.cljs`, `eidolon/nexus_index.cljs`, `eidolon/nexus_keys.cljs`, `eidolon/similarity.cljs`, `eidolon/vector_store.cljs`
- sys: `sys/cephalon.cljs`, `sys/effects.cljs`, `sys/eidolon.cljs`, `sys/eidolon_vectors.cljs`, `sys/memory.cljs`, `sys/route.cljs`, `sys/sentinel.cljs`
