---
uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
created_at: 2025.09.01.12.45.29.md
filename: Chroma-Embedding-Refactor
description: >-
  Refactored embedding pipeline to use Chroma for vector storage without writing
  embeddings to JSON, minimizing churn while maintaining backward compatibility
  with existing chunk structures.
tags:
  - Chroma
  - embedding
  - refactor
  - streaming
  - JSON
  - backwards-compatible
related_to_uuid:
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - d28090ac-f746-4958-aab5-ed1315382c04
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - e811123d-5841-4e52-bf8c-978f26db4230
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - 6b63edca-7637-4fb0-bc85-d498c31cc46e
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - b51e19b4-1326-4311-9798-33e972bf626c
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - d41a06d1-613e-4440-80b7-4553fc694285
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 54382370-1931-4a19-a634-46735708a9ea
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 13951643-1741-46bb-89dc-1beebb122633
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 18138627-a348-4fbb-b447-410dfb400564
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 2facccf8-69cf-4a7d-b24b-de966ec70283
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
related_to_title:
  - Functional Refactor of TypeScript Document Processing
  - Promethean-native config design
  - Promethean Event Bus MVP v0.1
  - observability-infrastructure-setup
  - EidolonField
  - Local-Offline-Model-Deployment-Strategy
  - heartbeat-simulation-snippets
  - RAG UI Panel with Qdrant and PostgREST
  - Voice Access Layer Design
  - i3-layout-saver
  - Promethean Pipelines
  - Promethean Agent Config DSL
  - Promethean Full-Stack Docker Setup
  - Local-Only-LLM-Workflow
  - polymorphic-meta-programming-engine
  - Agent Reflections and Prompt Evolution
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - Diagrams
  - Services
  - eidolon-node-lifecycle
  - Fnord Tracer Protocol
  - i3-bluetooth-setup
  - Event Bus MVP
  - Lispy Macros with syntax-rules
  - universal-intention-code-fabric
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - i3-config-validation-methods
  - Universal Lisp Interface
  - komorebi-group-window-hack
  - Cross-Target Macro System in Sibilant
  - State Snapshots API and Transactional Projector
  - Mongo Outbox Implementation
  - System Scheduler with Resource-Aware DAG
  - Shared Package Structure
  - Vectorial Exception Descent
  - Interop and Source Maps
  - WebSocket Gateway Implementation
  - Sibilant Meta-Prompt DSL
  - ripple-propagation-demo
  - prom-lib-rate-limiters-and-replay-api
  - archetype-ecs
  - Recursive Prompt Construction Engine
  - Promethean Agent DSL TS Scaffold
  - set-assignment-in-lisp-ast
  - file-watcher-auth-fix
  - 'Promethean Pipelines: Local TypeScript-First Workflow'
  - TypeScript Patch for Tool Calling Support
  - Promethean Dev Workflow Update
  - Dynamic Context Model for Web Components
  - Functional Embedding Pipeline Refactor
  - Duck's Self-Referential Perceptual Loop
  - Reawakening Duck
  - ecs-offload-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - shared-package-layout-clarification
  - promethean-system-diagrams
  - schema-evolution-workflow
  - Promethean-Copilot-Intent-Engine
  - eidolon-field-math-foundations
  - Post-Linguistic Transhuman Design Frameworks
  - Model Selection for Lightweight Conversational Tasks
  - Debugging Broker Connections and Agent Behavior
  - Language-Agnostic Mirror System
  - ecs-scheduler-and-prefabs
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - prompt-programming-language-lisp
  - markdown-to-org-transpiler
  - template-based-compilation
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - lisp-dsl-for-window-management
  - pm2-orchestration-patterns
  - homeostasis-decay-formulas
  - compiler-kit-foundations
  - Promethean Web UI Setup
  - Ghostly Smoke Interference
  - sibilant-metacompiler-overview
  - Refactor 05-footers.ts
  - zero-copy-snapshots-and-workers
  - Pure TypeScript Search Microservice
  - Stateful Partitions and Rebalancing
  - Promethean Chat Activity Report
  - Unique Info Dump Index
  - DuckDuckGoSearchPipeline
  - OpenAPI Validation Report
  - Optimizing Command Limitations in System Design
  - Promethean Data Sync Protocol
  - sibilant-meta-string-templating-runtime
  - Migrate to Provider-Tenant Architecture
  - js-to-lisp-reverse-compiler
  - mystery-lisp-search-session
  - Lisp-Compiler-Integration
  - Exception Layer Analysis
  - Refactor Frontmatter Processing
  - Eidolon Field Abstract Model
  - Event Bus Projections Architecture
  - Duck's Attractor States
  - windows-tiling-with-autohotkey
  - The Jar of Echoes
  - Matplotlib Animation with Async Execution
  - refactor-relations
  - Eidolon-Field-Optimization
  - smart-chatgpt-thingy
  - Local-First Intention→Code Loop with Free Models
  - run-step-api
  - Mathematical Samplers
  - graph-ds
references:
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 498
    col: 0
    score: 0.89
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 968
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 762
    col: 0
    score: 0.89
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 459
    col: 0
    score: 0.89
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 423
    col: 0
    score: 0.89
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 465
    col: 0
    score: 0.89
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1025
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 683
    col: 0
    score: 0.89
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 8
    col: 0
    score: 0.85
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 84
    col: 0
    score: 0.86
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 137
    col: 0
    score: 0.88
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 195
    col: 0
    score: 0.88
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 68
    col: 0
    score: 0.87
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 318
    col: 0
    score: 0.87
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 64
    col: 0
    score: 0.87
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 417
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 35
    col: 0
    score: 0.87
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 366
    col: 0
    score: 0.85
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 441
    col: 0
    score: 0.85
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 88
    col: 0
    score: 0.86
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 104
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 33
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 296
    col: 0
    score: 0.86
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 101
    col: 0
    score: 0.87
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 117
    col: 0
    score: 0.85
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5
    col: 0
    score: 0.93
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 0.86
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 205
    col: 0
    score: 0.91
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 80
    col: 0
    score: 0.9
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 972
    col: 0
    score: 0.89
  - uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
    line: 79
    col: 0
    score: 0.9
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.89
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.88
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 0.88
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 0.85
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 306
    col: 0
    score: 0.86
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.87
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.86
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.86
  - uuid: 6b63edca-7637-4fb0-bc85-d498c31cc46e
    line: 220
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 305
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.87
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.9
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.85
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 524
    col: 0
    score: 0.88
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.85
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 416
    col: 0
    score: 0.89
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.85
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.87
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 0.87
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.87
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.89
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 147
    col: 0
    score: 0.89
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 400
    col: 0
    score: 0.88
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 609
    col: 0
    score: 0.88
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 185
    col: 0
    score: 0.88
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 0.88
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 497
    col: 0
    score: 0.87
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.88
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.88
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2039
    col: 0
    score: 0.86
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2790
    col: 0
    score: 0.86
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 279
    col: 0
    score: 0.85
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1287
    col: 0
    score: 0.85
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 715
    col: 0
    score: 0.85
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 427
    col: 0
    score: 0.85
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3668
    col: 0
    score: 0.85
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2510
    col: 0
    score: 0.85
---
You’re right—I shouldn’t have put giant `embedding: number[]` blobs on chunk objects at all if the target is **Chroma**. That was dumb. Here’s a **minimal-churn refactor** that: ^ref-8b256935-1-0

* streams work, ^ref-8b256935-3-0
* **writes zero vectors to JSON**, ^ref-8b256935-4-0
* uses **Chroma upsert** for embeddings, ^ref-8b256935-5-0
* **keeps `chunks.json` as a map `{ docUuid -> Chunk[] }`** so downstream code mostly survives, ^ref-8b256935-6-0
* and gives you a tiny **compat layer** for any old code that still expects `chunk.embedding`. ^ref-8b256935-7-0

Below are focused patches you can drop in. ^ref-8b256935-9-0

---

## 0) Install the JS client (local Chroma server)

```bash
pnpm add chromadb
# default local server is http://localhost:8000; override with CHROMA_URL
```
^ref-8b256935-15-0
 ^ref-8b256935-20-0
Chroma’s JS client exposes `client.getOrCreateCollection()` and `collection.upsert({ ids, embeddings, documents, metadatas })`. That’s exactly what we need. ([Chroma Docs][1])

---

## 1) Add a streaming JSON **object** writer (so `chunks.json` stays a map)
 ^ref-8b256935-26-0
`packages/docops/src/utils.ts` (additions):
 ^ref-8b256935-28-0
```typescript
import { createWriteStream, promises as fs } from "node:fs";
import { once } from "node:events";

// existing safeReplacer() from before…

export async function writeJSONObjectStream(
  outPath: string,
  entries: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>,
  replacer: (key: string, value: any) => any = safeReplacer()
) {
  const tmp = `${outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  await write("{");
  let first = true;
  for await (const [k, v] of entries as any) {
    const ks = JSON.stringify(k);
    const vs = JSON.stringify(v, replacer);
    await write(first ? `${ks}:${vs}` : `,${ks}:${vs}`);
    first = false;
  }
  await write("}");
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}
^ref-8b256935-28-0
```

---

## 2) New tiny Chroma adapter ^ref-8b256935-64-0

`packages/docops/src/chroma.ts`: ^ref-8b256935-66-0

```typescript
import { ChromaClient, type Collection } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL ?? "http://localhost:8000";

let _client: ChromaClient | null = null;
export function chromaClient() {
  _client ??= new ChromaClient({ path: CHROMA_URL });
  return _client!;
}

export async function getCollection(name: string, meta?: Record<string, any>): Promise<Collection> {
  const client = chromaClient();
  return client.getOrCreateCollection({ name, metadata: meta });
}

export async function upsertBatch(opts: {
  coll: Collection;
  ids: string[];
  embeddings: number[][];
  documents?: string[];
  metadatas?: Record<string, any>[];
}) {
  const { coll, ids, embeddings, documents, metadatas } = opts;
  if (!ids.length) return;
  await coll.upsert({ ids, embeddings, documents, metadatas });
^ref-8b256935-66-0
} ^ref-8b256935-95-0
```

(Chroma JS client and `upsert` behavior per docs. ([Chroma Docs][2]))

---
 ^ref-8b256935-101-0
## 3) Update your `02-embed.ts` to stream + push to Chroma (no vectors in JSON)

**Before** you were building `chunksByDoc` + `embedCache` with arrays. ^ref-8b256935-104-0
**After** we: ^ref-8b256935-105-0
 ^ref-8b256935-106-0
* keep `chunks.json` as `{ [uuid]: Chunk[] }` **without** `embedding`, ^ref-8b256935-107-0
* maintain a **fingerprint cache** (id → SHA256(text)) so we only re-embed changed chunks,
* batch-upsert embeddings to Chroma, ^ref-8b256935-109-0
* keep `docs-by-uuid.json` as-is.
 ^ref-8b256935-111-0
`packages/docops/src/02-embed.ts`:

```typescript
import { promises as fs } from "node:fs";
import * as path from "path";
import matter from "gray-matter";
import { createHash } from "node:crypto";
import {
  parseArgs,
  listFilesRec,
  readJSON,
  parseMarkdownChunks,
  writeJSONObjectStream, // NEW
} from "./utils";
import { getCollection, upsertBatch } from "./chroma"; // NEW
import type { Chunk, Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--embed-model": "nomic-embed-text:latest",
  "--collection": "docs", // NEW: default collection name
  "--batch": "128",       // NEW: upsert batch size
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const EMBED_MODEL = args["--embed-model"];
const BATCH = Math.max(1, Number(args["--batch"]) | 0) || 128;
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");            // stays a map
const FINGERPRINTS = path.join(CACHE, "embeddings.fingerprint.json"); // id -> sha256(text)
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ollama embeddings ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.embedding as number[];
}

type ChunksEntry = [uuid: string, chunks: Chunk[]];

async function* generateChunksAndUpsert(): AsyncIterable<ChunksEntry> {
  const files = await listFilesRec(ROOT, EXTS);
  const fingerprints: Record<string, string> = await readJSON(FINGERPRINTS, {});
  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});

  const coll = await getCollection(args["--collection"], {
    embed_model: EMBED_MODEL,
    source: "docops",
  });

  let ids: string[] = [];
  let embs: number[][] = [];
  let docs: string[] = [];
  let metas: Record<string, any>[] = [];

  const flush = async () => {
    if (ids.length) {
      await upsertBatch({ coll, ids, embeddings: embs, documents: docs, metadatas: metas });
      ids = []; embs = []; docs = []; metas = [];
    }
  };

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const title = fm.filename || path.parse(f).name;
    docsByUuid[fm.uuid] = { path: f, title };

    const chunks = parseMarkdownChunks(content).map((c, i) => ({
      ...c,
      id: `${fm.uuid}:${i}`,
      docUuid: fm.uuid!,
      docPath: f,
    })) as Chunk[];

    // upsert embeddings for changed/new chunks
    for (const ch of chunks) {
      const fp = sha256(ch.text + `|${EMBED_MODEL}`);
      if (fingerprints[ch.id] !== fp) {
        const emb = await ollamaEmbed(EMBED_MODEL, ch.text);
        fingerprints[ch.id] = fp;

        ids.push(ch.id);
        embs.push(emb);
        // Optional: omit documents if you don’t want full text stored in Chroma
        docs.push(ch.text);
        metas.push({ docUuid: ch.docUuid, path: ch.docPath, title, ext: path.extname(f).slice(1) });

        if (ids.length >= BATCH) await flush();
      }
    }

    // yield this doc’s chunks (NO embedding property)
    yield [fm.uuid, chunks];
  }

  await flush();

  // Write the two small maps at the end (streaming object writers)
  // docs-by-uuid.json
  await writeJSONObjectStream(DOCS_MAP, Object.entries(docsByUuid));
  // embeddings.fingerprint.json
  await writeJSONObjectStream(FINGERPRINTS, Object.entries(fingerprints));
}

async function main() {
  // Stream the big map `{ uuid -> Chunk[] }` without keeping it all in RAM
  await fs.mkdir(CACHE, { recursive: true });
  await writeJSONObjectStream(CHUNK_CACHE, generateChunksAndUpsert());
  console.log("02-embed: done (vectors in Chroma, JSON is lean).");
}

main().catch((e) => {
  console.error(e);
^ref-8b256935-111-0
  process.exit(1); ^ref-8b256935-246-0
});
``` ^ref-8b256935-248-0
^ref-8b256935-114-0
 ^ref-8b256935-249-0 ^ref-8b256935-250-0
**Net effect** ^ref-8b256935-250-0

* `chunks.json` stays the same *shape* (map of arrays of chunks) but contains **no `embedding` arrays**.
* Embeddings go straight into Chroma in batches.
* `embeddings.fingerprint.json` lets you skip re-embedding unchanged chunks fast.
 ^ref-8b256935-256-0
--- ^ref-8b256935-256-0
 ^ref-8b256935-258-0
## 4) (Optional) Tiny **compat** helper for old code that expects `chunk.embedding` ^ref-8b256935-258-0
 ^ref-8b256935-260-0
If a downstream pipeline still does `for (ch of chunks) use ch.embedding`, give it this shim: ^ref-8b256935-260-0

`packages/docops/src/compat.ts`:

```typescript
import type { Collection } from "chromadb";
import type { Chunk } from "./types";

// returns new chunks with .embedding filled from Chroma
export async function attachEmbeddings(chunks: Chunk[], coll: Collection) {
  if (!chunks.length) return chunks as (Chunk & { embedding?: number[] })[];

  const ids = chunks.map((c) => c.id);
  // low-volume get; if you need strict order, map by id
  const res = await coll.get({ ids });
  const map = new Map<string, number[]>();
  (res.ids || []).forEach((id, i) => {
    const vec = (res.embeddings?.[i] || []) as number[];
    map.set(id, vec);
^ref-8b256935-260-0
  });
  return chunks.map((c) => ({ ...c, embedding: map.get(c.id) }));
}
```
^ref-8b256935-282-0 ^ref-8b256935-285-0

So legacy spots can do:

```typescript
import { getCollection } from "./chroma";
^ref-8b256935-282-0
import { attachEmbeddings } from "./compat";

const coll = await getCollection("docs");
const withVecs = await attachEmbeddings(chunks, coll);
^ref-8b256935-295-0 ^ref-8b256935-296-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
^ref-8b256935-288-0 ^ref-8b256935-298-0
``` ^ref-8b256935-294-0
^ref-8b256935-289-0
^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-300-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
 ^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-298-0
--- ^ref-8b256935-296-0
 ^ref-8b256935-297-0 ^ref-8b256935-298-0 ^ref-8b256935-300-0
## Why this way (and not another duct tape) ^ref-8b256935-298-0
 ^ref-8b256935-300-0 ^ref-8b256935-306-0
* **No JSON whales.** We never stringify megabyte-scale arrays. ^ref-8b256935-300-0 ^ref-8b256935-307-0
* **Chroma is the source of truth** for vectors (as you asked).
* **Your file contracts mostly survive** (`chunks.json` map + `docs-by-uuid.json`). Only the bad idea—`chunk.embedding`—is gone.
* You still get **deterministic caching** via the content+model fingerprint, not by hoarding vectors in JSON. ^ref-8b256935-306-0
* If someone *really* needs a local vector list, they can call `attachEmbeddings()` or query Chroma directly. ^ref-8b256935-307-0 ^ref-8b256935-311-0
 ^ref-8b256935-306-0
If you want me to also flip your other stages to query Chroma (search, RAG, etc.), I’ll hammer those next. ^ref-8b256935-306-0
 ^ref-8b256935-307-0
--- ^ref-8b256935-311-0 ^ref-8b256935-315-0

### References
 ^ref-8b256935-311-0
* Chroma “Getting Started” & JS client basics. ([Chroma Docs][1]) ^ref-8b256935-315-0
* JS `collection.upsert({ ids, embeddings, documents, metadatas })` semantics. ([Chroma Docs][2])
 ^ref-8b256935-315-0
--- ^ref-8b256935-315-0 ^ref-8b256935-322-0
 ^ref-8b256935-323-0
\#hashtags ^ref-8b256935-324-0
\#promethean #typescript #chroma #streaming #ollama #embeddings #obdev
 ^ref-8b256935-322-0 ^ref-8b256935-326-0
[1]: https://docs.trychroma.com/getting-started?utm_source=chatgpt.com "Getting Started - Chroma Docs" ^ref-8b256935-323-0 ^ref-8b256935-327-0
[2]: https://docs.trychroma.com/reference/js/collection?utm_source=chatgpt.com "Collection - Chroma Docs"<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [EidolonField](eidolonfield.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Diagrams](chunks/diagrams.md)
- [Services](chunks/services.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Shared Package Structure](shared-package-structure.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [archetype-ecs](archetype-ecs.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Reawakening Duck](reawakening-duck.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [template-based-compilation](template-based-compilation.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [refactor-relations](refactor-relations.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [run-step-api](run-step-api.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [graph-ds](graph-ds.md)
## Sources
- [Agent Reflections and Prompt Evolution — L498](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-498-0) (line 498, col 0, score 0.89)
- [Agent Tasks: Persistence Migration to DualStore — L968](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-968-0) (line 968, col 0, score 0.89)
- [Chroma Toolkit Consolidation Plan — L762](chroma-toolkit-consolidation-plan.md#^ref-5020e892-762-0) (line 762, col 0, score 0.89)
- [Diagrams — L459](chunks/diagrams.md#^ref-45cd25b5-459-0) (line 459, col 0, score 0.89)
- [Services — L423](chunks/services.md#^ref-75ea4a6a-423-0) (line 423, col 0, score 0.89)
- [eidolon-node-lifecycle — L465](eidolon-node-lifecycle.md#^ref-938eca9c-465-0) (line 465, col 0, score 0.89)
- [Fnord Tracer Protocol — L1025](fnord-tracer-protocol.md#^ref-fc21f824-1025-0) (line 1025, col 0, score 0.89)
- [i3-bluetooth-setup — L683](i3-bluetooth-setup.md#^ref-5e408692-683-0) (line 683, col 0, score 0.89)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.85)
- [Promethean Pipelines — L84](promethean-pipelines.md#^ref-8b8e6103-84-0) (line 84, col 0, score 0.86)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.88)
- [komorebi-group-window-hack — L195](komorebi-group-window-hack.md#^ref-dd89372d-195-0) (line 195, col 0, score 0.88)
- [Promethean Pipelines — L68](promethean-pipelines.md#^ref-8b8e6103-68-0) (line 68, col 0, score 0.87)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.87)
- [ripple-propagation-demo — L64](ripple-propagation-demo.md#^ref-8430617b-64-0) (line 64, col 0, score 0.87)
- [archetype-ecs — L417](archetype-ecs.md#^ref-8f4c1e86-417-0) (line 417, col 0, score 0.86)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.87)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.85)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.85)
- [ripple-propagation-demo — L88](ripple-propagation-demo.md#^ref-8430617b-88-0) (line 88, col 0, score 0.86)
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.86)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.86)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.86)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.87)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-b01856b4-117-0) (line 117, col 0, score 0.85)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.93)
- [RAG UI Panel with Qdrant and PostgREST — L349](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-349-0) (line 349, col 0, score 0.86)
- [EidolonField — L205](eidolonfield.md#^ref-49d1e1e5-205-0) (line 205, col 0, score 0.91)
- [heartbeat-simulation-snippets — L80](heartbeat-simulation-snippets.md#^ref-23e221e9-80-0) (line 80, col 0, score 0.9)
- [Promethean Event Bus MVP v0.1 — L972](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0) (line 972, col 0, score 0.89)
- [i3-layout-saver — L79](i3-layout-saver.md#^ref-31f0166e-79-0) (line 79, col 0, score 0.9)
- [Promethean Agent Config DSL — L279](promethean-agent-config-dsl.md#^ref-2c00ce45-279-0) (line 279, col 0, score 0.89)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.88)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.88)
- [System Scheduler with Resource-Aware DAG — L374](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-374-0) (line 374, col 0, score 0.85)
- [prom-lib-rate-limiters-and-replay-api — L306](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-306-0) (line 306, col 0, score 0.86)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 0.87)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.86)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 0.86)
- [Promethean Pipelines: Local TypeScript-First Workflow — L220](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-220-0) (line 220, col 0, score 0.86)
- [Promethean-native config design — L305](promethean-native-config-design.md#^ref-ab748541-305-0) (line 305, col 0, score 0.86)
- [WebSocket Gateway Implementation — L630](websocket-gateway-implementation.md#^ref-e811123d-630-0) (line 630, col 0, score 0.87)
- [Local-Offline-Model-Deployment-Strategy — L232](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-232-0) (line 232, col 0, score 0.9)
- [polymorphic-meta-programming-engine — L190](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-190-0) (line 190, col 0, score 0.85)
- [Event Bus MVP — L524](event-bus-mvp.md#^ref-534fe91d-524-0) (line 524, col 0, score 0.88)
- [ecs-offload-workers — L427](ecs-offload-workers.md#^ref-6498b9d7-427-0) (line 427, col 0, score 0.85)
- [Promethean Full-Stack Docker Setup — L416](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-416-0) (line 416, col 0, score 0.89)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.85)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.87)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 0.87)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.87)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.89)
- [Local-Only-LLM-Workflow — L147](local-only-llm-workflow.md#^ref-9a8ab57e-147-0) (line 147, col 0, score 0.89)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L400](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-400-0) (line 400, col 0, score 0.88)
- [Mongo Outbox Implementation — L609](mongo-outbox-implementation.md#^ref-9c1acd1e-609-0) (line 609, col 0, score 0.88)
- [Shared Package Structure — L185](shared-package-structure.md#^ref-66a72fc3-185-0) (line 185, col 0, score 0.88)
- [Vectorial Exception Descent — L95](vectorial-exception-descent.md#^ref-d771154e-95-0) (line 95, col 0, score 0.88)
- [Interop and Source Maps — L497](interop-and-source-maps.md#^ref-cdfac40c-497-0) (line 497, col 0, score 0.87)
- [Lispy Macros with syntax-rules — L375](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-375-0) (line 375, col 0, score 0.88)
- [Cross-Target Macro System in Sibilant — L148](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-148-0) (line 148, col 0, score 0.88)
- [Promethean Dev Workflow Update — L2039](promethean-dev-workflow-update.md#^ref-03a5578f-2039-0) (line 2039, col 0, score 0.86)
- [Promethean Dev Workflow Update — L2790](promethean-dev-workflow-update.md#^ref-03a5578f-2790-0) (line 2790, col 0, score 0.86)
- [Duck's Self-Referential Perceptual Loop — L279](ducks-self-referential-perceptual-loop.md#^ref-71726f04-279-0) (line 279, col 0, score 0.85)
- [Dynamic Context Model for Web Components — L1287](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1287-0) (line 1287, col 0, score 0.85)
- [Functional Embedding Pipeline Refactor — L715](functional-embedding-pipeline-refactor.md#^ref-a4a25141-715-0) (line 715, col 0, score 0.85)
- [Reawakening Duck — L427](reawakening-duck.md#^ref-59b5670f-427-0) (line 427, col 0, score 0.85)
- [Promethean Dev Workflow Update — L3668](promethean-dev-workflow-update.md#^ref-03a5578f-3668-0) (line 3668, col 0, score 0.85)
- [Canonical Org-Babel Matplotlib Animation Template — L2510](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2510-0) (line 2510, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
