---
uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
created_at: 2025.08.08.23.08.19.md
filename: set-assignment-in-lisp-ast
description: >-
  Adds `Set` node to AST for `set!` operations, implements Lisp front-end
  recognition, lowering to assignments, and ensures compatibility with existing
  JS emitter and reverse compiler.
tags:
  - lisp
  - ast
  - set
  - assignment
  - compiler
  - ir
  - js
  - reverse
related_to_title:
  - Duck's Attractor States
  - Duck's Self-Referential Perceptual Loop
  - Eidolon Field Abstract Model
  - eidolon-node-lifecycle
  - Factorio AI with External Agents
  - field-dynamics-math-blocks
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Docops Feature Updates
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Agent Reflections and Prompt Evolution
  - ChatGPT Custom Prompts
  - Chroma Toolkit Consolidation Plan
  - Diagrams
  - DSL
  - JavaScript
  - Math Fundamentals
  - Operations
  - Services
  - Shared
  - Simulation Demo
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - eidolon-field-math-foundations
  - WebSocket Gateway Implementation
  - Voice Access Layer Design
  - Interop and Source Maps
  - Shared Package Structure
  - compiler-kit-foundations
  - Lispy Macros with syntax-rules
  - Language-Agnostic Mirror System
  - Promethean Agent DSL TS Scaffold
  - file-watcher-auth-fix
  - Event Bus Projections Architecture
  - js-to-lisp-reverse-compiler
  - ecs-scheduler-and-prefabs
  - plan-update-confirmation
  - Promethean Pipelines
  - shared-package-layout-clarification
  - Functional Refactor of TypeScript Document Processing
  - layer-1-uptime-diagrams
  - Promethean State Format
  - Model Selection for Lightweight Conversational Tasks
  - Local-First Intention→Code Loop with Free Models
  - sibilant-meta-string-templating-runtime
  - prom-lib-rate-limiters-and-replay-api
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - template-based-compilation
  - sibilant-macro-targets
  - ecs-offload-workers
  - Exception Layer Analysis
  - universal-intention-code-fabric
  - lisp-dsl-for-window-management
  - System Scheduler with Resource-Aware DAG
  - Cross-Target Macro System in Sibilant
  - State Snapshots API and Transactional Projector
  - Promethean Full-Stack Docker Setup
  - mystery-lisp-search-session
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Local-Only-LLM-Workflow
  - prompt-programming-language-lisp
  - Recursive Prompt Construction Engine
  - Promethean Agent Config DSL
  - Event Bus MVP
  - promethean-system-diagrams
  - Local-Offline-Model-Deployment-Strategy
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - observability-infrastructure-setup
  - 'Promethean Pipelines: Local TypeScript-First Workflow'
  - Eidolon-Field-Optimization
  - heartbeat-simulation-snippets
  - RAG UI Panel with Qdrant and PostgREST
  - windows-tiling-with-autohotkey
  - Mongo Outbox Implementation
  - i3-config-validation-methods
  - polymorphic-meta-programming-engine
  - Matplotlib Animation with Async Execution
  - pm2-orchestration-patterns
  - Ghostly Smoke Interference
  - markdown-to-org-transpiler
  - Promethean Web UI Setup
  - refactor-relations
  - Vectorial Exception Descent
  - Promethean-native config design
  - EidolonField
  - Window Management
  - Dynamic Context Model for Web Components
  - Debugging Broker Connections and Agent Behavior
  - DuckDuckGoSearchPipeline
related_to_uuid:
  - 13951643-1741-46bb-89dc-1beebb122633
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 58191024-d04a-4520-8aae-a18be7b94263
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - d41a06d1-613e-4440-80b7-4553fc694285
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - b51e19b4-1326-4311-9798-33e972bf626c
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 6b63edca-7637-4fb0-bc85-d498c31cc46e
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
references:
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4244
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 150
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 6384
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 4132
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 5020
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 6493
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 5209
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 5007
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 4525
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 618
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 187
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 999
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 519
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 466
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 505
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 451
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 178
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 437
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 367
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 378
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
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
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 322
    col: 0
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 366
    col: 0
    score: 0.96
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 304
    col: 0
    score: 0.94
  - uuid: 4127189a-e0ab-436f-8571-cc852b8e9add
    line: 129
    col: 0
    score: 0.86
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 137
    col: 0
    score: 0.86
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.9
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 111
    col: 0
    score: 0.89
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 307
    col: 0
    score: 0.85
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 188
    col: 0
    score: 0.96
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.85
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.91
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.9
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 343
    col: 0
    score: 0.89
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1697
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 717
    col: 0
    score: 0.86
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 364
    col: 0
    score: 0.86
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 363
    col: 0
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 718
    col: 0
    score: 0.86
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1695
    col: 0
    score: 0.86
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.91
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.88
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1854
    col: 0
    score: 0.86
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2739
    col: 0
    score: 0.86
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21709
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22281
    col: 0
    score: 0.86
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3581
    col: 0
    score: 0.86
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1624
    col: 0
    score: 0.86
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.86
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7937
    col: 0
    score: 0.86
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4933
    col: 0
    score: 0.86
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 207
    col: 0
    score: 0.9
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 391
    col: 0
    score: 0.9
---
Heck yeah—here’s **`set!`** wired end-to-end (Lisp → AST → IR → JS) + the reverse compiler already emits it from `x = ...`. ^ref-c5fba0a0-1-0

## 1) AST: add a `Set` node

```ts
// shared/js/prom-lib/compiler/ast.ts
export type Expr =
  | { kind: "Num"; value: number; span: Span }
  | { kind: "Str"; value: string; span: Span }
  | { kind: "Bool"; value: boolean; span: Span }
  | { kind: "Null"; span: Span }
  | { kind: "Var"; name: Name }
  | { kind: "Let"; name: Name; value: Expr; body: Expr; span: Span }
  | { kind: "If"; cond: Expr; then: Expr; else: Expr; span: Span }
  | { kind: "Fun"; params: Name[]; body: Expr; span: Span }
  | { kind: "Call"; callee: Expr; args: Expr[]; span: Span }
  | { kind: "Bin"; op: string; left: Expr; right: Expr; span: Span }
  | { kind: "Un"; op: string; expr: Expr; span: Span }
  | { kind: "Block"; exprs: Expr[]; span: Span }
  | { kind: "Set"; name: Name; value: Expr; span: Span };  // <-- NEW
```
^ref-c5fba0a0-5-0 ^ref-c5fba0a0-22-0

## 2) Lisp front-end: recognize `(set! x expr)`
 ^ref-c5fba0a0-25-0
```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts
import { name as mkName } from "../ast";
// ...

function listToExpr(x: List): Expr {
  if (x.xs.length===0) return { kind:"Null", span:x.span! };

  const hd = x.xs[0];

  // --- NEW: (set! id value)
  if (isSym(hd,"set!")) {
    const id = x.xs[1] as Sym;
    if (id.t !== "sym") throw new Error("(set!) expects a symbol as the first argument");
    const value = x.xs[2];
    return {
      kind: "Set",
      name: mkName(id.gensym ?? id.name, id.span!),
      value: toExpr(value),
      span: x.span!
    };
  }

  // ... (rest unchanged)
}
^ref-c5fba0a0-25-0
```

## 3) Lowering: turn `Set` into an assignment on the existing symbol ^ref-c5fba0a0-54-0

We keep IR simple: **reuse** the existing `bind` statement to assign to the *same* Sym. (Our JS emitter already outputs `dst = ...;` for `bind`, so this “just works”.) ^ref-c5fba0a0-56-0

Also: prevent `set!` on **externs** (imports destructured as `const`), since that would blow up at runtime. ^ref-c5fba0a0-58-0

```ts
// shared/js/prom-lib/compiler/lower.ts
import type { Expr } from "./ast";
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lowerWithExterns(ast: Expr, externs: string[] = []): Module & { debug: { symSpan: Map<Sym, any> } } {
  const env: Map<string, Sym> = new Map();
  const externSet = new Set(externs);
  for (const name of externs) env.set(name, name as unknown as Sym);

  const symSpan = new Map<Sym, any>();
  const out: Stmt[] = [];
  const result = lowerExpr(ast, env, out, symSpan, externSet);
  out.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: out };
  return { funs: [], main, debug: { symSpan } };
}

function lowerExpr(
  e: Expr,
  env: Map<string, Sym>,
  out: Stmt[],
  dbg: Map<Sym, any>,
  externs: Set<string>
): Sym {
  switch (e.kind) {
    // ... existing cases ...

    case "Set": {
      const target = env.get(e.name.text);
      if (!target) throw new Error(`set!: unbound variable ${e.name.text}`);
      if (externs.has(e.name.text)) throw new Error(`set!: cannot assign to extern '${e.name.text}'`);
      const rhs = lowerExpr(e.value, env, out, dbg, externs);
      // assign: target = rhs
      out.push({ k:"bind", s: target, rhs: { r:"val", v: { t:"var", s: rhs } } });
      dbg.set(target, e.span);
      return target;
    }

    // ... rest unchanged ...
  }
}

^ref-c5fba0a0-58-0
// bindVal, binToPrim unchanged
```
^ref-c5fba0a0-60-0
 ^ref-c5fba0a0-106-0
## 4) JS emitter: no changes needed 🎉
 ^ref-c5fba0a0-108-0
Your `emitJS` already turns every `bind` into `dst = ...;`. Because we assign to the **same** Sym, `set!` becomes a normal JS assignment to the existing `let` variable.

(And `collectLocals` still declares each Sym once—duplicates are ignored via the Set.)
 ^ref-c5fba0a0-112-0
## 5) Reverse compiler already outputs `(set! ...)`
 ^ref-c5fba0a0-114-0
We already mapped:

```ts
// shared/js/prom-lib/compiler/lisp/js-ast2lisp.ts
case "AssignmentExpression": {
  if (n.left.type === "MemberExpression") {
    // -> (js/set! obj key val)
  }
  if (n.left.type === "Identifier") {
    return list([sym("set!"), sym(n.left.name), expr(n.right, opts)]);
^ref-c5fba0a0-114-0
  } ^ref-c5fba0a0-126-0
}
^ref-c5fba0a0-126-0
``` ^ref-c5fba0a0-130-0

So **`x = y`** becomes **`(set! x y)`**. ^ref-c5fba0a0-130-0

## 6) Quick sanity check

```lisp
; test.lisp
(let ((x 1)
      (y 2))
^ref-c5fba0a0-130-0
  (set! x (+ x y))   ; x = 3
  (set! y 10)        ; y = 10
^ref-c5fba0a0-139-0
  (+ x y))           ; -> 13 ^ref-c5fba0a0-144-0
```
^ref-c5fba0a0-139-0
 ^ref-c5fba0a0-144-0
```ts
^ref-c5fba0a0-148-0
^ref-c5fba0a0-145-0
import { runLisp } from "./compiler/lisp/driver";
console.log(runLisp(`(let ((x 1) (y 2)) (set! x (+ x y)) (set! y 10) (+ x y))`)); // 13
``` ^ref-c5fba0a0-148-0
 ^ref-c5fba0a0-154-0
If you want `set!` for **fields** too (i.e. `(set! x.a 5)`), we can either macro-expand that to `(js/set! x "a" 5)` or add dotted lvalues to the reader—your call.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Duck's Attractor States](ducks-attractor-states.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Operations](chunks/operations.md)
- [Services](chunks/services.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Shared Package Structure](shared-package-structure.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Promethean State Format](promethean-state-format.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [template-based-compilation](template-based-compilation.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Event Bus MVP](event-bus-mvp.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [refactor-relations](refactor-relations.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [EidolonField](eidolonfield.md)
- [Window Management](chunks/window-management.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Docops Feature Updates](docops-feature-updates-2.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
## Sources
- [Duck's Attractor States — L4244](ducks-attractor-states.md#^ref-13951643-4244-0) (line 4244, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L150](ducks-self-referential-perceptual-loop.md#^ref-71726f04-150-0) (line 150, col 0, score 1)
- [Eidolon Field Abstract Model — L6384](eidolon-field-abstract-model.md#^ref-5e8b2388-6384-0) (line 6384, col 0, score 1)
- [eidolon-node-lifecycle — L4132](eidolon-node-lifecycle.md#^ref-938eca9c-4132-0) (line 4132, col 0, score 1)
- [Factorio AI with External Agents — L5020](factorio-ai-with-external-agents.md#^ref-a4d90289-5020-0) (line 5020, col 0, score 1)
- [field-dynamics-math-blocks — L6493](field-dynamics-math-blocks.md#^ref-7cfc230d-6493-0) (line 6493, col 0, score 1)
- [field-node-diagram-outline — L5209](field-node-diagram-outline.md#^ref-1f32c94a-5209-0) (line 5209, col 0, score 1)
- [field-node-diagram-set — L5007](field-node-diagram-set.md#^ref-22b989d5-5007-0) (line 5007, col 0, score 1)
- [field-node-diagram-visualizations — L4525](field-node-diagram-visualizations.md#^ref-e9b27b06-4525-0) (line 4525, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L618](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-618-0) (line 618, col 0, score 1)
- [ChatGPT Custom Prompts — L187](chatgpt-custom-prompts.md#^ref-930054b3-187-0) (line 187, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L999](chroma-toolkit-consolidation-plan.md#^ref-5020e892-999-0) (line 999, col 0, score 1)
- [Diagrams — L519](chunks/diagrams.md#^ref-45cd25b5-519-0) (line 519, col 0, score 1)
- [DSL — L466](chunks/dsl.md#^ref-e87bc036-466-0) (line 466, col 0, score 1)
- [JavaScript — L505](chunks/javascript.md#^ref-c1618c66-505-0) (line 505, col 0, score 1)
- [Math Fundamentals — L451](chunks/math-fundamentals.md#^ref-c6e87433-451-0) (line 451, col 0, score 1)
- [Operations — L178](chunks/operations.md#^ref-f1add613-178-0) (line 178, col 0, score 1)
- [Services — L437](chunks/services.md#^ref-75ea4a6a-437-0) (line 437, col 0, score 1)
- [Shared — L367](chunks/shared.md#^ref-623a55f7-367-0) (line 367, col 0, score 1)
- [Simulation Demo — L378](chunks/simulation-demo.md#^ref-557309a3-378-0) (line 378, col 0, score 1)
- [typed-struct-compiler — L1016](typed-struct-compiler.md#^ref-78eeedf7-1016-0) (line 1016, col 0, score 1)
- [Unique Concepts — L175](unique-concepts.md#^ref-ed6f3fc9-175-0) (line 175, col 0, score 1)
- [Unique Info Dump Index — L1221](unique-info-dump-index.md#^ref-30ec3ba6-1221-0) (line 1221, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1058](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1058-0) (line 1058, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L515](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0) (line 515, col 0, score 1)
- [Creative Moments — L251](creative-moments.md#^ref-10d98225-251-0) (line 251, col 0, score 1)
- [Duck's Attractor States — L559](ducks-attractor-states.md#^ref-13951643-559-0) (line 559, col 0, score 1)
- [eidolon-field-math-foundations — L1033](eidolon-field-math-foundations.md#^ref-008f2ac0-1033-0) (line 1033, col 0, score 1)
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 1)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 1)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 1)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 1)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 1)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 1)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [Interop and Source Maps — L322](interop-and-source-maps.md#^ref-cdfac40c-322-0) (line 322, col 0, score 0.98)
- [compiler-kit-foundations — L366](compiler-kit-foundations.md#^ref-01b21543-366-0) (line 366, col 0, score 0.96)
- [Lispy Macros with syntax-rules — L304](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-304-0) (line 304, col 0, score 0.94)
- [layer-1-uptime-diagrams — L129](layer-1-uptime-diagrams.md#^ref-4127189a-129-0) (line 129, col 0, score 0.86)
- [shared-package-layout-clarification — L137](shared-package-layout-clarification.md#^ref-36c8882a-137-0) (line 137, col 0, score 0.86)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.9)
- [Event Bus Projections Architecture — L111](event-bus-projections-architecture.md#^ref-cf6b9b17-111-0) (line 111, col 0, score 0.89)
- [prom-lib-rate-limiters-and-replay-api — L307](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-307-0) (line 307, col 0, score 0.85)
- [Shared Package Structure — L188](shared-package-structure.md#^ref-66a72fc3-188-0) (line 188, col 0, score 0.96)
- [sibilant-meta-string-templating-runtime — L92](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-92-0) (line 92, col 0, score 0.85)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 1)
- [WebSocket Gateway Implementation — L631](websocket-gateway-implementation.md#^ref-e811123d-631-0) (line 631, col 0, score 1)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.91)
- [compiler-kit-foundations — L588](compiler-kit-foundations.md#^ref-01b21543-588-0) (line 588, col 0, score 0.9)
- [js-to-lisp-reverse-compiler — L343](js-to-lisp-reverse-compiler.md#^ref-58191024-343-0) (line 343, col 0, score 0.89)
- [plan-update-confirmation — L1697](plan-update-confirmation.md#^ref-b22d79c6-1697-0) (line 1697, col 0, score 0.86)
- [typed-struct-compiler — L717](typed-struct-compiler.md#^ref-78eeedf7-717-0) (line 717, col 0, score 0.86)
- [Promethean Pipelines — L364](promethean-pipelines.md#^ref-8b8e6103-364-0) (line 364, col 0, score 0.86)
- [Promethean Pipelines — L363](promethean-pipelines.md#^ref-8b8e6103-363-0) (line 363, col 0, score 0.86)
- [Lispy Macros with syntax-rules — L375](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-375-0) (line 375, col 0, score 0.86)
- [typed-struct-compiler — L718](typed-struct-compiler.md#^ref-78eeedf7-718-0) (line 718, col 0, score 0.86)
- [plan-update-confirmation — L1695](plan-update-confirmation.md#^ref-b22d79c6-1695-0) (line 1695, col 0, score 0.86)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.91)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.88)
- [Functional Refactor of TypeScript Document Processing — L1854](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1854-0) (line 1854, col 0, score 0.86)
- [Promethean State Format — L2739](promethean-state-format.md#^ref-23df6ddb-2739-0) (line 2739, col 0, score 0.86)
- [Duck's Attractor States — L21709](ducks-attractor-states.md#^ref-13951643-21709-0) (line 21709, col 0, score 0.86)
- [eidolon-field-math-foundations — L22281](eidolon-field-math-foundations.md#^ref-008f2ac0-22281-0) (line 22281, col 0, score 0.86)
- [Factorio AI with External Agents — L3581](factorio-ai-with-external-agents.md#^ref-a4d90289-3581-0) (line 3581, col 0, score 0.86)
- [Model Selection for Lightweight Conversational Tasks — L1624](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1624-0) (line 1624, col 0, score 0.86)
- [Local-First Intention→Code Loop with Free Models — L105](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-105-0) (line 105, col 0, score 0.86)
- [Unique Info Dump Index — L7937](unique-info-dump-index.md#^ref-30ec3ba6-7937-0) (line 7937, col 0, score 0.86)
- [zero-copy-snapshots-and-workers — L4933](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4933-0) (line 4933, col 0, score 0.86)
- [Math Fundamentals — L207](chunks/math-fundamentals.md#^ref-c6e87433-207-0) (line 207, col 0, score 0.9)
- [Fnord Tracer Protocol — L391](fnord-tracer-protocol.md#^ref-fc21f824-391-0) (line 391, col 0, score 0.9)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
