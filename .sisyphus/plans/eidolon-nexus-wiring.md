# Eidolon + Nexus Wiring (Nexus Data Model MVP)

## TL;DR

> **Quick Summary**: Add a new Nexus data model package that can create Nexus records and fetch them by URN, persisted in Mongo via `@promethean-os/persistence`, with AVA TDD and a hard “no real Mongo” guarantee.
>
> **Deliverables**:
> - New package: `orgs/riatzukiza/promethean/packages/nexus` (`@promethean-os/nexus`)
> - Nexus URN helpers (provider=`nexus`) using `@promethean-os/platform` URN utilities
> - Mongo-backed `createNexus()` + `getNexus()` adapter (defaults: `db('database')`, collection `nexuses`)
> - AVA tests using in-memory persistence (and a “broken `MONGODB_URI` still passes” test)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Fix in-memory Mongo ↔ `getMongoClient()` mismatch → build Nexus package → tests green

---

## Context

### Original Request
Devel wants an Eidolon/Nexus/Nooi architecture with always-running agent runtimes (cephalon) and event-driven sentinels. For this slice we start with a shippable “Nexus data model” MVP.

### Interview Summary
- MVP scope: Nexus data model only (no field physics, no cephalon memory wiring)
- Persistence: Mongo via `@promethean-os/persistence` clients
- Operations: Create + Get
- Tests: YES (TDD), automated

### Key Research Findings (local)
- Canonical URN helper exists: `orgs/riatzukiza/promethean/packages/platform/src/urn.ts` (`toUrn`/`fromUrn`)
- UUID helper exists: `orgs/riatzukiza/promethean/packages/utils/src/uuid.ts` (`randomUUID()`)
- Mongo client is centralized: `orgs/riatzukiza/promethean/packages/persistence/src/clients.ts` (`getMongoClient()`)
- Test harness exists: `orgs/riatzukiza/promethean/packages/test-utils/src/persistence.ts` (`installInMemoryPersistence()`)
- Existing code frequently uses `.db('database')` for Mongo: `orgs/riatzukiza/promethean/packages/persistence/src/factories/dualStore.ts`

### Metis Review (critical gap)
- `installInMemoryPersistence()` currently provides a Fake Mongo client that does not support `db('admin').command({ ping: 1 })`, but `getMongoClient()` calls that ping and may clear overrides if it fails.
  - `orgs/riatzukiza/promethean/packages/test-utils/src/persistence.ts`
  - `orgs/riatzukiza/promethean/packages/persistence/src/clients.ts`

This must be fixed first, otherwise “no network” tests can silently fall back to a real Mongo connection.

---

## Work Objectives

### Core Objective
Introduce a stable, tenant-scoped Nexus record type with URN identifiers and a Mongo adapter to create and fetch those records.

### Concrete Deliverables
- `@promethean-os/nexus` package with:
  - `NexusRecord` type
  - `createNexusUrn()` / `parseNexusUrn()` wrappers around `toUrn`/`fromUrn`
  - `createNexus()` and `getNexus()` using `getMongoClient()`
  - A minimal Mongo collection contract (DB/collection names, indexes policy)

### Definition of Done
- `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/nexus test` exits 0
- `cd orgs/riatzukiza/promethean && MONGODB_URI=mongodb://127.0.0.1:1 pnpm --filter @promethean-os/nexus test` exits 0 (proves no real Mongo dependency)
- `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/nexus typecheck` exits 0

### Must Have
- URN scheme: `urn:nexus:nexus:<tenant>:<uuid>` (provider=`nexus`, kind=`nexus`)
- Get-by-URN returns `null` when missing; throws only on invalid URN/input
- Create returns a record with stable `urn` + `tenant`

### Must NOT Have (Guardrails)
- No eidolon-field changes, no Nooi implementation
- No binding/observe/evoke/forget semantics
- No list/search/update/delete in this slice
- No reliance on a running Mongo instance for tests

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (AVA in `packages/`)
- **User wants tests**: YES (TDD)
- **Framework**: AVA

### TDD Workflow
For each TODO:
1) RED: add/adjust AVA test (fails)
2) GREEN: implement minimal code
3) REFACTOR: clean up while keeping green

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately):
- Task 1: Fix the FakeMongoClient ↔ `getMongoClient()` ping mismatch
- Task 2: Scaffold `@promethean-os/nexus` package structure

Wave 2 (After Wave 1):
- Task 3: Implement URN helpers + types + Mongo adapter (Create/Get)
- Task 4: Add “no network” regression tests + package-level verification

Critical Path: Task 1 → Task 3 → Task 4

---

## TODOs

- [ ] 1. Make in-memory Mongo compatible with `getMongoClient()` ping

  **What to do**:
  - Update the in-memory persistence harness so `getMongoClient()` can validate the overridden client without throwing.
  - Preferred fix: implement `db('admin').command({ ping: 1 })` on the fake client/db layer used by `installInMemoryPersistence()`.
  - Add a regression test that sets `MONGODB_URI=mongodb://127.0.0.1:1`, installs in-memory persistence, calls `getMongoClient()`, and proves no network fallback occurs.

  **Must NOT do**:
  - Do not weaken production Mongo connection validation.
  - Do not add real network dependencies to unit tests.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: small, localized fix with high leverage.
  - **Skills**: `workspace-navigation`
    - `workspace-navigation`: quickly locate and align with test-utils + persistence conventions.
  - **Skills Evaluated but Omitted**:
    - `git-master`: not needed unless user asks for commits.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3, Task 4
  - **Blocked By**: None

  **References**:
  - `orgs/riatzukiza/promethean/packages/test-utils/src/persistence.ts` - current `FakeMongoClient`/`FakeDb`/`InMemoryCollection` implementations
  - `orgs/riatzukiza/promethean/packages/persistence/src/clients.ts` - `getMongoClient()` ping behavior + override clearing behavior
  - `orgs/riatzukiza/promethean/packages/test-utils/README.md` - intended “no network persistence” contract
  - `orgs/riatzukiza/promethean/packages/test-utils/src/tests/persistence-install.spec.ts` - existing test that should become strictly “no network”

  **Acceptance Criteria**:
  - [ ] `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/test-utils test` → PASS
  - [ ] Update/extend `orgs/riatzukiza/promethean/packages/test-utils/src/tests/persistence-install.spec.ts` to prove `getMongoClient()` works with `installInMemoryPersistence()` when `MONGODB_URI` is invalid → PASS

- [ ] 2. Scaffold `@promethean-os/nexus` package

  **What to do**:
  - Create a new package under `orgs/riatzukiza/promethean/packages/nexus` following repo conventions (ESM, `dist/`, AVA tests under `src/tests`).
  - Ensure `package.json` scripts exist: `build`, `typecheck`, `test`, `lint`.
  - Ensure workspace linking uses `workspace:*` dependencies.
  - Preferred scaffolding: use the workspace Nx generator (per `orgs/riatzukiza/promethean/packages/AGENTS.md`).
    - Example command: `cd orgs/riatzukiza/promethean && pnpm nx g tools:package nexus --preset library`

  **Must NOT do**:
  - Do not put this in `experimental/` (this is a reusable library).

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `workspace-navigation`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `orgs/riatzukiza/promethean/packages/AGENTS.md` - package scaffolding + AVA conventions
  - `orgs/riatzukiza/promethean/packages/utils/package.json` - example package scripts/layout

  **Acceptance Criteria**:
  - [ ] `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/nexus build` → PASS
  - [ ] `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/nexus typecheck` → PASS

- [ ] 3. Implement Nexus URN + record types + Mongo Create/Get (TDD)

  **What to do**:
  - Define `NexusRecord` and `CreateNexusInput` types.
  - Implement URN creation/parsing wrappers using `toUrn/fromUrn` with:
    - provider=`nexus`
    - kind=`nexus` (constant for MVP)
  - Implement a Mongo adapter that:
    - Uses `getMongoClient()` from `@promethean-os/persistence/clients.js`
    - Defaults to `db('database').collection('nexuses')`
    - Writes documents with `_id = urn` and fields `{ urn, tenant, id, type, title, metadata, createdAt, updatedAt }`
    - `createNexus()` returns the created record
    - `getNexus(urn)` returns record or `null`

  **Must NOT do**:
  - Do not implement list/search/update/delete.
  - Do not introduce a second URN format.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: new small library with careful boundaries and tests.
  - **Skills**: `workspace-navigation`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `orgs/riatzukiza/promethean/packages/platform/src/urn.ts` - canonical URN formatting/parsing
  - `orgs/riatzukiza/promethean/packages/utils/src/uuid.ts` - UUID generation
  - `orgs/riatzukiza/promethean/packages/persistence/src/clients.ts` - Mongo client API
  - `orgs/riatzukiza/promethean/docs/design/nexus.md` - conceptual fields and intent (Identifier/Type/Metadata)

  **Acceptance Criteria**:
  - [ ] AVA tests cover: URN format round-trip; invalid tenant/id with `:` rejected; create returns record with expected shape; get returns record; get missing returns `null`
  - [ ] `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/nexus test` → PASS

- [ ] 4. Add “no network” guard + package verification

  **What to do**:
  - Add an AVA test that sets `MONGODB_URI=mongodb://127.0.0.1:1` and verifies Create/Get tests still pass using in-memory persistence.
  - Ensure the package can be consumed (exports from `src/index.ts` and built output in `dist/`).

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `workspace-navigation`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:
  - `orgs/riatzukiza/promethean/packages/test-utils/src/persistence.ts` - in-memory harness
  - `orgs/riatzukiza/promethean/packages/persistence/src/clients.ts` - ensures tests don’t clear overrides and fall back

  **Acceptance Criteria**:
  - [ ] `cd orgs/riatzukiza/promethean && MONGODB_URI=mongodb://127.0.0.1:1 pnpm --filter @promethean-os/nexus test` → PASS
  - [ ] `cd orgs/riatzukiza/promethean && pnpm --filter @promethean-os/nexus typecheck` → PASS

---

## Commit Strategy
- Commit after Task 1 (test harness fix) and after Task 4 (new package), unless the user wants a different grouping.

---

## Success Criteria

### Verification Commands
```bash
cd orgs/riatzukiza/promethean

pnpm --filter @promethean-os/test-utils test
pnpm --filter @promethean-os/nexus test
MONGODB_URI=mongodb://127.0.0.1:1 pnpm --filter @promethean-os/nexus test
pnpm --filter @promethean-os/nexus typecheck
```

### Final Checklist
- [ ] Nexus URNs are consistent with `toUrn/fromUrn` and tenant-scoped
- [ ] Create/Get implemented and tested
- [ ] No eidolon-field coupling introduced
- [ ] Tests pass without a real Mongo instance
