---
uuid: "02e8c2e6-e235-482e-90d9-eb0ce93f8ef8"
title: "agent tasks persistence migration to dualstore"
slug: "agent-tasks-persistence-migration-to-dualstore"
status: "done"
priority: "P3"
labels: ["agent", "dualstore", "persistence", "tasks"]
created_at: "2025-10-11T03:39:14.374Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Task 1 — Setup Shared Persistence Module
```
**Status:** blocked
```
* [ ] Create directory `shared/ts/persistence/`.
* [ ] Add:

  * `clients.ts`
  * `types.ts`
  * `dualStore.ts` (enhanced version with alias, timestamp, UUID, mostRelevant).
  * `contextStore.ts` (from Cephalon’s ContextManager).
  * `maintenance.ts`
  * `index.ts`
* [ ] Add `README.md` explaining usage of `DualStore` + `ContextStore`.

✅ Output: Shared persistence module exists, documented, builds cleanly.

---

## 🗂 Task 2 — Deprecate Legacy Persistence

* [ ] In **Cephalon**, mark `collectionManager.ts` as **deprecated**.
* [ ] In **SmartGPT Bridge**, mark `DualSink.js` + `mongo.js` as **deprecated**.
* [ ] In each service’s `AGENTS.md`, update:

  * Remove references to local persistence implementations.
  * Replace with:

    ```
    Persistence is handled via shared module: @shared/ts/persistence/DualStore
    ```

✅ Output: No governance doc refers to `CollectionManager` or `DualSink`.

---

## 🗂 Task 3 — Service Migrations

### Cephalon

* [x] Replace all imports of `CollectionManager` with `DualStore`.
* [x] Replace `ContextManager` with `ContextStore` from shared.
* [x] Adjust methods:

  * `addEntry` → `insert`
  * `getMostRecent` → `getMostRecent`
  * `getMostRelevant` → `getMostRelevant`

### SmartGPT Bridge

* [ ] Remove `DualSink` usage.
* [ ] Replace with `DualStore.create"bridge_logs"`.
* [ ] Move cleanup jobs to `shared/ts/persistence/maintenance.ts`.

### Discord-embedder

* [ ] Remove raw `MongoClient` + `ChromaClient`.
* [ ] Replace with `DualStore.create"discord_messages"`.

### Kanban Processor

* [ ] Replace raw `MongoClient` with `DualStore`.
* [ ] Enable optional Chroma indexing for tasks.

### Markdown Graph

* [x] Replace raw `MongoClient` with `DualStore`.
* [ ] Add optional embedding for graph queries if needed.

✅ Output: All services use `DualStore` instead of local clients.

---

## 🗂 Task 4 — Update Tests

* [ ] Write unit tests for `DualStore`:

  * Insert, recent fetch, relevance query.
* [ ] Write unit tests for `ContextStore`:

  * Create multiple collections, insert entries, compile context.
* [ ] Update existing Cephalon + Bridge tests to reference new shared persistence.

✅ Output: All persistence tests point to shared module.

---

## 🗂 Task 5 — Update Docs

* [x] Update root `AGENTS.md`: add **Shared Persistence** section.
* [x] Add new doc `docs/reports/persistence-migration-checklist.md` (we already drafted this).
* [x] Add `docs/reports/persistence-dependency-graph.md` for before/after diagrams.
* [x] Ensure diagrams show all services routing through `DualStore`.

✅ Output: Documentation reflects new persistence architecture.

---

## 🗂 Task 6 — Cleanup

* [ ] Delete legacy files after migration is verified:

  * `services/ts/cephalon/src/collectionManager.ts`
  * `services/ts/cephalon/src/contextManager.ts`
  * `services/ts/smartgpt-bridge/src/utils/DualSink.js`
  * `services/ts/smartgpt-bridge/src/mongo.js`
* [ ] Confirm `git grep "MongoClient" services/ts/` and `git grep "ChromaClient" services/ts/` return **no service-local usage**.

✅ Output: Repo contains only `DualStore`/`ContextStore` persistence code.

---

## 🏁 Final Deliverable

* All services `cephalon`, `bridge`, `discord-embedder`, `kanban-processor`, `markdown-graph` use the shared persistence layer.
* Legacy persistence modules removed.
* Tests green.
* Docs updated.
* Obsidian diagrams show unified architecture.

---

## Blockers
- No active owner or unclear scope

#breakdown
