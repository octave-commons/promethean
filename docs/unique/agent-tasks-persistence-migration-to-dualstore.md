---
uuid: 8802d059-6b36-4e56-bb17-6a80a7dba599
created_at: agent-tasks-persistence-migration-to-dualstore.md
filename: agent-tasks-persistence-migration-to-dualstore
title: agent-tasks-persistence-migration-to-dualstore
description: >-
  Migrating agent tasks from legacy persistence to a shared DualStore module for
  improved scalability and maintainability across services.
tags:
  - persistence
  - migration
  - dualstore
  - shared-module
  - service-architecture
  - cephalon
  - smartgpt-bridge
  - discord-embedder
  - kanban-processor
  - markdown-graph
related_to_uuid:
  - 8792b6d3-aafd-403f-a410-e8a09ec2f8cf
  - 6420e101-2d34-45b5-bcff-d21e1c6e516b
  - 7a75d992-5267-4557-b464-b6c7d3f88dad
  - ed2e157e-bfed-4291-ae4c-6479df975d87
  - 4f9a7fd9-de08-4b9c-87c4-21268bc26d54
  - a09a2867-7f5a-4864-8150-6eee881a616b
  - 01c5547f-27eb-42d1-af24-9cad10b6a2ca
  - c09d7688-71d6-47fc-bf81-86b6193c84bc
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 50ac7389-a75e-476a-ab34-bb24776d4f38
  - aa437a1f-eb7e-4096-a6cc-98d2eeeef8c5
  - aa88652d-c8e5-4a1b-850e-afdf7fe15dae
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
  - 99c6d380-a2a6-4d8e-a391-f4bc0c9a631f
  - b25be760-256e-4a8a-b34d-867281847ccb
  - 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - a23de044-17e0-45f0-bba7-d870803cbfed
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 260f25bf-c996-4da2-a529-3a292406296f
related_to_title:
  - aionian-circuit-math
  - Eidolon Field Math Foundations
  - field-dynamics-math-blocks
  - field-interaction-equations
  - homeostasis-decay-formulas
  - pr-688-nitpack-extract
  - run-step-api
  - Migrate to Provider-Tenant Architecture
  - Universal Lisp Interface
  - chroma-embedding-refactor
  - TypeScript Patch for Tool Calling Support
  - promethean-native-config-design
  - ecs-offload-workers
  - promethean-full-stack-docker-setup
  - Prometheus Observability Stack
  - Promethean Web UI Setup
  - chroma-toolkit-consolidation-plan
  - matplotlib-animation-with-async-execution
  - Layer 1 Survivability Envelope
  - ripple-propagation-demo
  - system-scheduler
  - template-based-compilation
  - Komorebi Group Manager
  - polyglot-repl-interface-layer
  - Polymorphic Meta-Programming Engine
references:
  - uuid: 8792b6d3-aafd-403f-a410-e8a09ec2f8cf
    line: 147
    col: 0
    score: 1
  - uuid: 6420e101-2d34-45b5-bcff-d21e1c6e516b
    line: 119
    col: 0
    score: 1
  - uuid: 7a75d992-5267-4557-b464-b6c7d3f88dad
    line: 134
    col: 0
    score: 1
  - uuid: ed2e157e-bfed-4291-ae4c-6479df975d87
    line: 147
    col: 0
    score: 1
  - uuid: 4f9a7fd9-de08-4b9c-87c4-21268bc26d54
    line: 147
    col: 0
    score: 1
  - uuid: a09a2867-7f5a-4864-8150-6eee881a616b
    line: 78
    col: 0
    score: 1
  - uuid: 01c5547f-27eb-42d1-af24-9cad10b6a2ca
    line: 910
    col: 0
    score: 0.88
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 98
    col: 0
    score: 0.87
  - uuid: 6420e101-2d34-45b5-bcff-d21e1c6e516b
    line: 105
    col: 0
    score: 0.86
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 38
    col: 0
    score: 0.86
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 100
    col: 0
    score: 0.85
  - uuid: bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
    line: 26
    col: 0
    score: 0.85
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 56
    col: 0
    score: 0.85
---
# 🤖 Agent Tasks: Persistence Migration to DualStore

---

## 🗂 Task 1 — Setup Shared Persistence Module

* [ ] Create directory `shared/ts/persistence/`. ^ref-93d2ba51-7-0
* [ ] Add: ^ref-93d2ba51-8-0

  * `clients.ts`
  * `types.ts`
  * `dualStore.ts` (enhanced version with alias, timestamp, UUID, mostRelevant). ^ref-93d2ba51-12-0
  * `contextStore.ts` (from Cephalon’s ContextManager). ^ref-93d2ba51-13-0
  * `maintenance.ts`
  * `index.ts`
* [ ] Add `README.md` explaining usage of `DualStore` + `ContextStore`. ^ref-93d2ba51-16-0

✅ Output: Shared persistence module exists, documented, builds cleanly. ^ref-93d2ba51-18-0

---

## 🗂 Task 2 — Deprecate Legacy Persistence

* [ ] In **Cephalon**, mark `collectionManager.ts` as **deprecated**.
* [ ] In **SmartGPT Bridge**, mark `DualSink.js` + `mongo.js` as **deprecated**. ^ref-93d2ba51-25-0
* [ ] In each service’s `AGENTS.md`, update: ^ref-93d2ba51-26-0

  * Remove references to local persistence implementations. ^ref-93d2ba51-28-0
  * Replace with: ^ref-93d2ba51-29-0

    ```
    Persistence is handled via shared module: @shared/ts/persistence/DualStore
    ```
^ref-93d2ba51-31-0 ^ref-93d2ba51-34-0

✅ Output: No governance doc refers to `CollectionManager` or `DualSink`.

---

## 🗂 Task 3 — Service Migrations

### Cephalon
 ^ref-93d2ba51-43-0
* [ ] Replace all imports of `CollectionManager` with `DualStore`.
* [ ] Replace `ContextManager` with `ContextStore` from shared. ^ref-93d2ba51-45-0
* [ ] Adjust methods:
 ^ref-93d2ba51-47-0
  * `addEntry` → `insert` ^ref-93d2ba51-48-0
  * `getMostRecent` → `getMostRecent` ^ref-93d2ba51-49-0
  * `getMostRelevant` → `getMostRelevant`

### SmartGPT Bridge
 ^ref-93d2ba51-53-0
* [ ] Remove `DualSink` usage. ^ref-93d2ba51-54-0
* [ ] Replace with `DualStore.create("bridge_logs")`. ^ref-93d2ba51-55-0
* [ ] Move cleanup jobs to `shared/ts/persistence/maintenance.ts`.

### Discord-embedder
 ^ref-93d2ba51-59-0
* [ ] Remove raw `MongoClient` + `ChromaClient`. ^ref-93d2ba51-60-0
* [ ] Replace with `DualStore.create("discord_messages")`.

### Kanban Processor
 ^ref-93d2ba51-64-0
* [ ] Replace raw `MongoClient` with `DualStore`. ^ref-93d2ba51-65-0
* [ ] Enable optional Chroma indexing for tasks.

### Markdown Graph
 ^ref-93d2ba51-69-0
* [ ] Replace raw `MongoClient` with `DualStore`. ^ref-93d2ba51-70-0
* [ ] Add optional embedding for graph queries if needed.
 ^ref-93d2ba51-72-0
✅ Output: All services use `DualStore` instead of local clients.

---

## 🗂 Task 4 — Update Tests
 ^ref-93d2ba51-78-0
* [ ] Write unit tests for `DualStore`:
 ^ref-93d2ba51-80-0
  * Insert, recent fetch, relevance query. ^ref-93d2ba51-81-0
* [ ] Write unit tests for `ContextStore`:
 ^ref-93d2ba51-83-0
  * Create multiple collections, insert entries, compile context. ^ref-93d2ba51-84-0
* [ ] Update existing Cephalon + Bridge tests to reference new shared persistence.
 ^ref-93d2ba51-86-0
✅ Output: All persistence tests point to shared module.

---

## 🗂 Task 5 — Update Docs
 ^ref-93d2ba51-92-0
* [ ] Update root `AGENTS.md`: add **Shared Persistence** section. ^ref-93d2ba51-93-0
* [ ] Add new doc `docs/reports/persistence-migration-checklist.md` (we already drafted this). ^ref-93d2ba51-94-0
* [ ] Add `docs/reports/persistence-dependency-graph.md` for before/after diagrams. ^ref-93d2ba51-95-0
* [ ] Ensure diagrams show all services routing through `DualStore`.
 ^ref-93d2ba51-97-0
✅ Output: Documentation reflects new persistence architecture.

---

## 🗂 Task 6 — Cleanup
 ^ref-93d2ba51-103-0
* [ ] Delete legacy files after migration is verified:

  * `services/ts/cephalon/src/collectionManager.ts`
  * `services/ts/cephalon/src/contextManager.ts`
  * `services/ts/smartgpt-bridge/src/utils/DualSink.js`
  * `services/ts/smartgpt-bridge/src/mongo.js` ^ref-93d2ba51-109-0
* [ ] Confirm `git grep "MongoClient" services/ts/` and `git grep "ChromaClient" services/ts/` return **no service-local usage**.
 ^ref-93d2ba51-111-0
✅ Output: Repo contains only `DualStore`/`ContextStore` persistence code.

---

## 🏁 Final Deliverable
 ^ref-93d2ba51-117-0
* All services (`cephalon`, `bridge`, `discord-embedder`, `kanban-processor`, `markdown-graph`) use the shared persistence layer. ^ref-93d2ba51-118-0
* Legacy persistence modules removed. ^ref-93d2ba51-119-0
* Tests green. ^ref-93d2ba51-120-0
* Docs updated. ^ref-93d2ba51-121-0
* Obsidian diagrams show unified architecture.

---

👉 Do you want me to **encode these tasks into a YAML workflow** (like a `tasks.yaml` for an autonomous migration agent), so it can be scheduled/executed step by step?
