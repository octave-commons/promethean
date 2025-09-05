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
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 13951643-1741-46bb-89dc-1beebb122633
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 54382370-1931-4a19-a634-46735708a9ea
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 18138627-a348-4fbb-b447-410dfb400564
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
related_to_title:
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - graph-ds
  - eidolon-node-lifecycle
  - Diagrams
  - Fnord Tracer Protocol
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Canonical Org-Babel Matplotlib Animation Template
  - Promethean Dev Workflow Update
  - Duck's Attractor States
  - Creative Moments
  - eidolon-field-math-foundations
  - Promethean Infrastructure Setup
  - obsidian-ignore-node-modules-regex
  - Model Selection for Lightweight Conversational Tasks
  - Factorio AI with External Agents
  - Migrate to Provider-Tenant Architecture
  - Agent Reflections and Prompt Evolution
  - The Jar of Echoes
  - Prompt_Folder_Bootstrap
references:
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 809
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 202
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 171
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 87
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 617
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 315
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 338
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 698
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 242
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 95
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 621
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 238
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 344
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 640
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 232
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 102
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 180
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 120
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 396
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 68
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 49
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 73
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 43
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 75
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 48
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 127
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 151
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 105
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 150
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 258
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 164
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 351
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 201
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 609
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 133
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 209
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 137
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 138
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 207
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1100
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 230
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 125
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 147
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 140
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 76
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 33
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 98
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 179
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 116
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 136
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 95
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 133
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 68
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 211
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 75
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 629
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 95
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 264
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 144
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 658
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 140
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 281
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 746
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 186
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 179
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 550
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 163
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 319
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 619
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 237
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 566
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 602
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 641
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 656
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 684
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 603
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 347
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 594
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 578
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 616
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 571
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 385
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 176
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 195
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 198
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 65
    col: 0
    score: 1
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
