---
uuid: 93d2ba51-8689-49ee-94e2-296092e48058
created_at: 2025.08.24.10.12.32.md
filename: 'Agent Tasks: Persistence Migration to DualStore'
description: >-
  Migrate all services from legacy persistence to a shared DualStore module,
  deprecating old implementations and updating documentation, tests, and
  codebase.
tags:
  - persistence
  - migration
  - dualstore
  - cephalon
  - smartgpt
  - discord
  - kanban
  - markdown
  - tests
  - docs
related_to_title:
  - TypeScript Patch for Tool Calling Support
  - Promethean-native config design
  - Migrate to Provider-Tenant Architecture
  - Per-Domain Policy System for JS Crawler
  - eidolon-field-math-foundations
  - Chroma Toolkit Consolidation Plan
  - promethean-system-diagrams
  - prom-lib-rate-limiters-and-replay-api
  - Promethean Event Bus MVP v0.1
  - ecs-scheduler-and-prefabs
  - field-node-diagram-outline
  - ecs-offload-workers
  - field-node-diagram-set
  - aionian-circuit-math
  - Board Walk – 2025-08-11
  - Cross-Language Runtime Polymorphism
  - Math Fundamentals
  - eidolon-node-lifecycle
  - Event Bus Projections Architecture
  - Promethean Infrastructure Setup
  - Dynamic Context Model for Web Components
  - Event Bus MVP
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Exception Layer Analysis
  - Fnord Tracer Protocol
  - Mongo Outbox Implementation
  - js-to-lisp-reverse-compiler
  - plan-update-confirmation
  - Cross-Target Macro System in Sibilant
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Voice Access Layer Design
  - Promethean Agent Config DSL
  - Sibilant Meta-Prompt DSL
  - Model Selection for Lightweight Conversational Tasks
related_to_uuid:
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 54382370-1931-4a19-a634-46735708a9ea
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - b51e19b4-1326-4311-9798-33e972bf626c
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 58191024-d04a-4520-8aae-a18be7b94263
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - af5d2824-faad-476c-a389-e912d9bc672c
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
references: []
---
# 🤖 Agent Tasks: Persistence Migration to DualStore

---

## 🗂 Task 1 — Setup Shared Persistence Module

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

* [ ] Replace all imports of `CollectionManager` with `DualStore`.
* [ ] Replace `ContextManager` with `ContextStore` from shared.
* [ ] Adjust methods:

  * `addEntry` → `insert`
  * `getMostRecent` → `getMostRecent`
  * `getMostRelevant` → `getMostRelevant`

### SmartGPT Bridge

* [ ] Remove `DualSink` usage.
* [ ] Replace with `DualStore.create("bridge_logs")`.
* [ ] Move cleanup jobs to `shared/ts/persistence/maintenance.ts`.

### Discord-embedder

* [ ] Remove raw `MongoClient` + `ChromaClient`.
* [ ] Replace with `DualStore.create("discord_messages")`.

### Kanban Processor

* [ ] Replace raw `MongoClient` with `DualStore`.
* [ ] Enable optional Chroma indexing for tasks.

### Markdown Graph

* [ ] Replace raw `MongoClient` with `DualStore`.
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

* [ ] Update root `AGENTS.md`: add **Shared Persistence** section.
* [ ] Add new doc `docs/reports/persistence-migration-checklist.md` (we already drafted this).
* [ ] Add `docs/reports/persistence-dependency-graph.md` for before/after diagrams.
* [ ] Ensure diagrams show all services routing through `DualStore`.

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

* All services (`cephalon`, `bridge`, `discord-embedder`, `kanban-processor`, `markdown-graph`) use the shared persistence layer.
* Legacy persistence modules removed.
* Tests green.
* Docs updated.
* Obsidian diagrams show unified architecture.

---

👉 Do you want me to **encode these tasks into a YAML workflow** (like a `tasks.yaml` for an autonomous migration agent), so it can be scheduled/executed step by step?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
