---
uuid: "8542a56c-b037-4a71-90e8-8bd0a0c8b49f"
title: "Maintain Testing vs Working Databases w/ Migration Contract"
slug: "set-up-data-migration-pipeline-and-clearly-describe-conventions"
status: "breakdown"
priority: "P3"
tags: ["testing", "working", "migration", "databases"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







Here’s a repo-ready task you can paste into the board. It carves a bright line between **testing** and **working** dev/staging/prod databases and enforces a **migration contract** that every migration must satisfy before touching working data.

# Maintain Testing vs Working Databases w/ Migration Contract
```
**Owner:** Codex / Agent
```
```
**Status:** Planned
```
**Labels:** #data #migrations #contracts #mongodb #chroma #testing #ci #promethean

---

## 🛠️ Description

Set up clean, isolated **testing databases** for MongoDB and Chroma that can be brought up, seeded, migrated, verified against a **formal contract**, and torn down—without ever touching **working** databases. Enforce this separation in code, config, and CI. Make migrations refuse to run if the contract doesn’t hold.

---

## 🎯 Goals

* Deterministic, ephemeral **test DBs** for migration authoring and verification.
* A **migration contract** schema + indexes + invariants + collection/embedding metadata that is validated **pre** and **post** migration.
* Guardrails so working DBs cannot be mutated from test paths (and vice versa).
* CI path that spins Mongo+Chroma locally, runs migrations, validates, and publishes a report.

---

## 📦 Requirements (DoD — if missing, reject PR)

* [ ] Distinct **URIs and names** for testing vs working DBs. No shared prefixes.
* [ ] **Contract file(s)** committed JSON/YAML for Mongo (collections, indexes, required fields) and Chroma collections, embedding dim/model, metadata.
* [ ] **Preflight contract check** blocks migrations when actual ≠ declared.
* [ ] **Safety interlocks:** migrations require an explicit `MIGRATION_TARGET=test|working`, refuse on mismatch, and require a second confirm var for working.
* [ ] **Spin-up/tear-down** scripts for ephemeral test DBs, including seed + snapshots.
* [ ] CI job that runs a full **contract → migrate → verify** loop using the test DBs.
* [ ] No new TS path aliases; exports via **@shared/ts/dist/** only.

---

## 📋 Subtasks

### 1) Naming, URIs, and Safety Interlocks

* [ ] Add envs (documented; sample `.env.example`):

  ```
  # Working (dev/staging/prod)
  MONGO_URI_WORKING=mongodb://...
  MONGO_DB_WORKING=promethean_working
  CHROMA_URL_WORKING=http://...
  CHROMA_PREFIX_WORKING=promethean_working_

  # Testing (ephemeral)
  MONGO_URI_TEST= mongodb://localhost:37017
  MONGO_DB_TEST= prom_test_{RUN_ID}
  CHROMA_URL_TEST= http://localhost:38000
  CHROMA_PREFIX_TEST= prom_test_{RUN_ID}_
  MIGRATION_TARGET= test|working
  MIGRATION_CONFIRM= I_ACKNOWLEDGE_WORKING_MUTATION
  ```
* [ ] In shared config `@shared/ts/dist/config/db.ts`, expose a **resolver**:

  ```ts
  export function resolveDbTarget(target: 'test'|'working') { /* returns URIs, names, prefixes */ }
  ```
* [ ] Hard fail if `MIGRATION_TARGET=working` without `MIGRATION_CONFIRM` exact match.
* [ ] Hard fail if any test runner tries to connect to a `*_WORKING` URI.

### 2) Contract Definition (source of truth)

* [ ] Add `docs/data/contracts/mongo.schema.json`:

  * Collections (name), **primary key field**, required fields, types (JSON Schema), **indexes** (fields, unique, partial filter).
* [ ] Add `docs/data/contracts/chroma.schema.json`:

  * Collections (name), **embedding\_dim**, **embedding\_model id**, required metadata keys.
* [ ] Add contract loader/validator: `shared/ts/src/migrations/contract.ts`

  * `validateMongoContract(db): Promise<Report>`
  * `validateChromaContract(client): Promise<Report>`
  * Emits actionable diffs missing index, wrong dim, missing collection.

### 3) Test DB Lifecycle spin/seed/teardown

* [ ] Docker/Testcontainers helper under `scripts/db/`:

  * `db-test-up`: start Mongo (@ 37017) + Chroma (@ 38000) locally (compose or Testcontainers).
  * `db-test-down`: stop and prune.
  * `db-test-seed`: load minimal seed fixtures `fixtures/*.json` to Mongo; create empty Chroma collections with correct dim/model.
  * All commands must respect `RUN_ID=$date +%s` to isolate parallel runs.
* [ ] Seed data factories in TS: `shared/ts/src/migrations/fixtures.ts` for testable content.

### 4) Migration Runner + Contract Gates

* [ ] Migration CLI `services/ts/migrations/run.ts`:

  * `--target test|working`, `--up <version>`, `--down <version>`, `--dry-run`.
  * **Preflight:** load target, run `validateMongoContract` & `validateChromaContract` **before** migration; **fail on diff** unless `--allow-contract-drift` explicitly provided (only for working with approval).
  * Execute migration scripts from `services/ts/migrations/steps/*.ts` (versioned, idempotent).
  * **Post-flight:** rerun validators; write JSON+MD report under `docs/data/reports/`.
* [ ] Keep applied versions in per-DB collection `migrations_applied` contains `env`, `version`, `git_sha`, `run_id`, timestamps.

### 5) CI Integration

* [ ] Job `migrations-contract-check` steps:

  1. `db-test-up` → `db-test-seed`
  2. `node services/ts/migrations/run.js --target test --up latest`
  3. `node services/ts/migrations/run.js --target test --verify-only`
  4. Upload report artifacts `*.json`, `*.md`.
* [ ] CI must **fail** on any contract deviation or validator failure.

### 6) Docs & Runbooks

* [ ] `docs/data/contracts/README.md` — how contracts are authored, reviewed, and bumped.
* [ ] `docs/data/runbooks/test-migrations.md` — spin up test DBs, run a migration, view reports, tear down.
* [ ] `CONTRIBUTING.md` — “Never point tests at working DBs; use `MIGRATION_TARGET=test`.”

### 7) Guardrails & Linting

* [ ] Pre-commit check: forbid `MONGO_URI=` literals or hardcoded URIs in code.
* [ ] Script `scripts/ci/check-db-targets.ts`: greps for working URIs in test code and fails if found.
* [ ] Runtime banner logs: print **Target=TEST/WORKING**, URIs redacted; capture in reports.

---

## 🧩 Design Notes

* **Contracts are law.** Migrations that change schema must **update the contract** in the same PR.
* **Dim/model pinning**: Chroma must refuse collection creation when `embedding_dim` or `embedding_model` mismatches contract.
* **Idempotency**: every step checks existing state and only mutates when truly needed.
* **Isolation by RUN\_ID** prevents cross-test bleed and enables parallel CI.
* **No new aliases**: exports available via **@shared/ts/dist/migrations/**.

---

## ✅ Acceptance Criteria

* [ ] `db-test-up`/`db-test-down` works locally; seeds load; isolated by `RUN_ID`.
* [ ] `run.ts --target test` performs **preflight contract check**, migrates, and emits **success report**.
* [ ] CI job passes on green contract; **fails** on any deviation.
* [ ] Attempting `--target working` without `MIGRATION_CONFIRM` hard-fails.
* [ ] Working and testing DBs **never share** database names or collection prefixes.
* [ ] Docs exist (contracts README, runbook) and are linked from root README.

---

## 🗂️ Proposed Files/Paths

* `shared/ts/src/migrations/contract.ts`
* `shared/ts/src/migrations/report.ts`
* `shared/ts/src/migrations/index.ts` (barrel export)
* `services/ts/migrations/run.ts`
* `services/ts/migrations/steps/NNNN_name.ts` (versioned steps)
* `scripts/db/db-test-up.sh`, `db-test-down.sh`, `db-test-seed.sh`
* `scripts/ci/check-db-targets.ts`
* `docs/data/contracts/mongo.schema.json`
* `docs/data/contracts/chroma.schema.json`
* `docs/data/contracts/README.md`
* `docs/data/runbooks/test-migrations.md`
* `docs/data/reports/*.json`, `*.md`

---

## CLI Sketches

```bash
# Local: spin ephemeral test DBs
RUN_ID=(date +%s) ./scripts/db/db-test-up.sh && ./scripts/db/db-test-seed.sh

# Run all pending migrations against test target, with contract verification
MIGRATION_TARGET=test node services/ts/migrations/run.js --up latest

# Verify only (no changes), output report
MIGRATION_TARGET=test node services/ts/migrations/run.js --verify-only

# (Danger) Working target requires explicit confirm
MIGRATION_TARGET=working MIGRATION_CONFIRM=I_ACKNOWLEDGE_WORKING_MUTATION \
  node services/ts/migrations/run.js --up 2025_08_25_001
```

---

## Step 1–4 Milestones

* [ ] **Step 1 — Separation & Safety:** envs/URIs, resolver, interlocks, naming.
* [ ] **Step 2 — Contracts:** author `mongo.schema.json` + `chroma.schema.json`, validator code.
* [ ] **Step 3 — Lifecycle & Runner:** test DB scripts, seed, migration CLI w/ pre/post contract checks.
* [ ] **Step 4 — CI & Docs:** CI pipeline, reports, runbooks; enforce in pre-commit.

---

## Commit Template

```
feat(migrations): isolate test DBs and enforce migration contracts

- Separate testing vs working URIs/names with safety interlocks
- Add Mongo/Chroma contract schemas + validators
- Test DB lifecycle scripts (spin/seed/teardown)
- Migration runner with pre/post contract verification and reports
- CI job for contract->migrate->verify loop
- Docs: contracts README + runbook
```

\#tags #promethean #mongodb #chroma #migration #contracts #testing #ci #safety #idempotent

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 8
```
#in-progress
```






