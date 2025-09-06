---
uuid: 3f2ad16b-21d8-4cf6-b14d-ea9ccdb5c793
created_at: shared-package-layout-clarification.md
filename: shared-package-layout-clarification
title: shared-package-layout-clarification
description: >-
  Clarifies the correct file structure and import patterns for a shared
  TypeScript package, emphasizing the distinction between source and build
  output directories and how consumers should import from the dist directory.
tags:
  - typescript
  - package-layout
  - import-patterns
  - shared-package
  - dist-directory
  - build-output
  - barrel-imports
related_to_uuid:
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
  - 3724ef1e-d13f-4b52-8045-ba149d90fdec
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - b51e19b4-1326-4311-9798-33e972bf626c
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - af5d2824-faad-476c-a389-e912d9bc672c
related_to_title:
  - i3-layout-saver
  - obsidian-templating-plugins-integration-guide
  - Event Bus MVP
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - WebSocket Gateway Implementation
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - promethean-system-diagrams
  - Lispy Macros with syntax-rules
  - Shared Package Structure
  - Promethean Event Bus MVP v0.1
  - Matplotlib Animation with Async Execution
  - mystery-lisp-search-session
  - sibilant-meta-string-templating-runtime
  - Chroma-Embedding-Refactor
  - RAG UI Panel with Qdrant and PostgREST
  - sibilant-metacompiler-overview
  - Cross-Target Macro System in Sibilant
  - ecs-scheduler-and-prefabs
  - Interop and Source Maps
  - Local-Offline-Model-Deployment-Strategy
  - Local-Only-LLM-Workflow
  - lisp-dsl-for-window-management
  - Vectorial Exception Descent
  - 2d-sandbox-field
  - Sibilant Meta-Prompt DSL
references:
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 5
    col: 0
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 490
    col: 0
    score: 0.97
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 400
    col: 0
    score: 0.97
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 524
    col: 0
    score: 0.97
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.97
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.96
  - uuid: b51e19b4-1326-4311-9798-33e972bf626c
    line: 169
    col: 0
    score: 0.96
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 972
    col: 0
    score: 0.95
  - uuid: 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
    line: 44
    col: 0
    score: 0.95
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 106
    col: 0
    score: 0.95
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 76
    col: 0
    score: 0.95
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 0.94
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 52
    col: 0
    score: 0.94
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.94
  - uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
    line: 289
    col: 0
    score: 0.94
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.94
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 376
    col: 0
    score: 0.94
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 497
    col: 0
    score: 0.94
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.93
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 147
    col: 0
    score: 0.93
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 185
    col: 0
    score: 0.93
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 0.92
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 150
    col: 0
    score: 0.92
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.91
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 440
    col: 0
    score: 0.9
  - uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
    line: 217
    col: 0
    score: 0.9
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 187
    col: 0
    score: 0.9
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.9
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 370
    col: 0
    score: 0.9
  - uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
    line: 79
    col: 0
    score: 0.89
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.89
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 211
    col: 0
    score: 0.89
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.89
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.89
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 80
    col: 0
    score: 0.89
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 185
    col: 0
    score: 0.89
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 424
    col: 0
    score: 0.89
  - uuid: 636f49b1-4bf4-4578-8153-f1f34c250b05
    line: 5
    col: 0
    score: 0.89
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 5
    col: 0
    score: 0.89
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.88
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.88
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.87
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5599
    col: 0
    score: 0.87
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2884
    col: 0
    score: 0.87
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6943
    col: 0
    score: 0.87
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3954
    col: 0
    score: 0.87
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7484
    col: 0
    score: 0.87
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5734
    col: 0
    score: 0.87
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2827
    col: 0
    score: 0.87
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.86
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.86
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.86
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 246
    col: 0
    score: 0.85
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.85
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 498
    col: 0
    score: 0.85
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.85
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.85
---

 ^ref-6f13f134-28-0 ^ref-6f13f134-128-0 ^ref-36c8882a-137-0 ^ref-36c8882a-146-0 ^ref-36c8882a-148-0 ^ref-36c8882a-161-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [i3-layout-saver](i3-layout-saver.md)
- [obsidian-templating-plugins-integration-guide](obsidian-templating-plugins-integration-guide.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
## Sources
- [obsidian-templating-plugins-integration-guide — L5](obsidian-templating-plugins-integration-guide.md#^ref-3724ef1e-5-0) (line 5, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-490-0) (line 490, col 0, score 0.97)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L400](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-400-0) (line 400, col 0, score 0.97)
- [Event Bus MVP — L524](event-bus-mvp.md#^ref-534fe91d-524-0) (line 524, col 0, score 0.97)
- [WebSocket Gateway Implementation — L630](websocket-gateway-implementation.md#^ref-e811123d-630-0) (line 630, col 0, score 0.97)
- [Lispy Macros with syntax-rules — L375](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-375-0) (line 375, col 0, score 0.96)
- [promethean-system-diagrams — L169](promethean-system-diagrams.md#^ref-b51e19b4-169-0) (line 169, col 0, score 0.96)
- [Promethean Event Bus MVP v0.1 — L972](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0) (line 972, col 0, score 0.95)
- [Matplotlib Animation with Async Execution — L44](matplotlib-animation-with-async-execution.md#^ref-687439f9-44-0) (line 44, col 0, score 0.95)
- [mystery-lisp-search-session — L106](mystery-lisp-search-session.md#^ref-513dc4c7-106-0) (line 106, col 0, score 0.95)
- [Shared Package Structure — L76](shared-package-structure.md#^ref-66a72fc3-76-0) (line 76, col 0, score 0.95)
- [RAG UI Panel with Qdrant and PostgREST — L349](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-349-0) (line 349, col 0, score 0.94)
- [sibilant-metacompiler-overview — L52](sibilant-metacompiler-overview.md#^ref-61d4086b-52-0) (line 52, col 0, score 0.94)
- [Cross-Target Macro System in Sibilant — L148](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-148-0) (line 148, col 0, score 0.94)
- [Chroma-Embedding-Refactor — L289](chroma-embedding-refactor.md#^ref-8b256935-289-0) (line 289, col 0, score 0.94)
- [sibilant-meta-string-templating-runtime — L92](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-92-0) (line 92, col 0, score 0.94)
- [ecs-scheduler-and-prefabs — L376](ecs-scheduler-and-prefabs.md#^ref-c62a1815-376-0) (line 376, col 0, score 0.94)
- [Interop and Source Maps — L497](interop-and-source-maps.md#^ref-cdfac40c-497-0) (line 497, col 0, score 0.94)
- [Local-Offline-Model-Deployment-Strategy — L232](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-232-0) (line 232, col 0, score 0.93)
- [Local-Only-LLM-Workflow — L147](local-only-llm-workflow.md#^ref-9a8ab57e-147-0) (line 147, col 0, score 0.93)
- [lisp-dsl-for-window-management — L185](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-185-0) (line 185, col 0, score 0.93)
- [Vectorial Exception Descent — L95](vectorial-exception-descent.md#^ref-d771154e-95-0) (line 95, col 0, score 0.92)
- [2d-sandbox-field — L150](2d-sandbox-field.md#^ref-c710dc93-150-0) (line 150, col 0, score 0.92)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.91)
- [prom ui bootstrap — L440](promethean-web-ui-setup.md#^ref-bc5172ca-440-0) (line 440, col 0, score 0.9)
- [pm2-orchestration-patterns — L217](pm2-orchestration-patterns.md#^ref-51932e7b-217-0) (line 217, col 0, score 0.9)
- [Universal Lisp Interface — L187](universal-lisp-interface.md#^ref-b01856b4-187-0) (line 187, col 0, score 0.9)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.9)
- [ecs-scheduler-and-prefabs — L370](ecs-scheduler-and-prefabs.md#^ref-c62a1815-370-0) (line 370, col 0, score 0.9)
- [i3-layout-saver — L79](i3-layout-saver.md#^ref-31f0166e-79-0) (line 79, col 0, score 0.89)
- [polymorphic-meta-programming-engine — L190](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-190-0) (line 190, col 0, score 0.89)
- [Cross-Language Runtime Polymorphism — L211](cross-language-runtime-polymorphism.md#^ref-c34c36a6-211-0) (line 211, col 0, score 0.89)
- [Promethean Agent Config DSL — L279](promethean-agent-config-dsl.md#^ref-2c00ce45-279-0) (line 279, col 0, score 0.89)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.89)
- [heartbeat-simulation-snippets — L80](heartbeat-simulation-snippets.md#^ref-23e221e9-80-0) (line 80, col 0, score 0.89)
- [Shared Package Structure — L185](shared-package-structure.md#^ref-66a72fc3-185-0) (line 185, col 0, score 0.89)
- [Promethean Infrastructure Setup — L424](promethean-infrastructure-setup.md#^ref-6deed6ac-424-0) (line 424, col 0, score 0.89)
- [Obsidian ChatGPT Plugin Integration — L5](obsidian-chatgpt-plugin-integration.md#^ref-636f49b1-5-0) (line 5, col 0, score 0.89)
- [Obsidian ChatGPT Plugin Integration Guide — L5](obsidian-chatgpt-plugin-integration-guide.md#^ref-3bea339f-5-0) (line 5, col 0, score 0.89)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.88)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.88)
- [markdown-to-org-transpiler — L272](markdown-to-org-transpiler.md#^ref-ab54cdd8-272-0) (line 272, col 0, score 0.87)
- [Chroma Toolkit Consolidation Plan — L5599](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5599-0) (line 5599, col 0, score 0.87)
- [Debugging Broker Connections and Agent Behavior — L2884](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2884-0) (line 2884, col 0, score 0.87)
- [Dynamic Context Model for Web Components — L6943](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6943-0) (line 6943, col 0, score 0.87)
- [eidolon-field-math-foundations — L3954](eidolon-field-math-foundations.md#^ref-008f2ac0-3954-0) (line 3954, col 0, score 0.87)
- [Migrate to Provider-Tenant Architecture — L7484](migrate-to-provider-tenant-architecture.md#^ref-54382370-7484-0) (line 7484, col 0, score 0.87)
- [Performance-Optimized-Polyglot-Bridge — L5734](performance-optimized-polyglot-bridge.md#^ref-f5579967-5734-0) (line 5734, col 0, score 0.87)
- [Post-Linguistic Transhuman Design Frameworks — L2827](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2827-0) (line 2827, col 0, score 0.87)
- [ecs-offload-workers — L427](ecs-offload-workers.md#^ref-6498b9d7-427-0) (line 427, col 0, score 0.86)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 0.86)
- [Exception Layer Analysis — L63](exception-layer-analysis.md#^ref-21d5cc09-63-0) (line 63, col 0, score 0.86)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#^ref-c62a1815-246-0) (line 246, col 0, score 0.85)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.85)
- [Interop and Source Maps — L498](interop-and-source-maps.md#^ref-cdfac40c-498-0) (line 498, col 0, score 0.85)
- [Local-First Intention→Code Loop with Free Models — L105](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-105-0) (line 105, col 0, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
