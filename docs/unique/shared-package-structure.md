---
uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
created_at: 2025.08.25.18.44.53.md
filename: Shared Package Structure
description: >-
  Defines a namespaced package structure for shared TypeScript code, avoiding
  conflicts with existing `./src` while supporting explicit imports from
  `@shared/ts/dist/...`.
tags:
  - namespacing
  - package
  - types
  - ts
  - import
  - dist
  - module
related_to_title:
  - i3-bluetooth-setup
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Creative Moments
  - Duck's Attractor States
  - Unique Info Dump Index
  - typed-struct-compiler
  - Unique Concepts
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - eidolon-field-math-foundations
  - Language-Agnostic Mirror System
  - Math Fundamentals
  - Sibilant Meta-Prompt DSL
  - shared-package-layout-clarification
  - WebSocket Gateway Implementation
  - markdown-to-org-transpiler
  - Cross-Target Macro System in Sibilant
  - Voice Access Layer Design
  - lisp-dsl-for-window-management
  - 2d-sandbox-field
  - i3-config-validation-methods
  - ecs-offload-workers
  - Matplotlib Animation with Async Execution
  - compiler-kit-foundations
  - polymorphic-meta-programming-engine
  - universal-intention-code-fabric
  - System Scheduler with Resource-Aware DAG
  - Promethean Agent Config DSL
  - Dynamic Context Model for Web Components
  - Lispy Macros with syntax-rules
  - Exception Layer Analysis
  - mystery-lisp-search-session
  - Promethean Agent DSL TS Scaffold
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Promethean Full-Stack Docker Setup
  - Universal Lisp Interface
  - Model Selection for Lightweight Conversational Tasks
  - Per-Domain Policy System for JS Crawler
  - obsidian-ignore-node-modules-regex
  - Performance-Optimized-Polyglot-Bridge
  - ParticleSimulationWithCanvasAndFFmpeg
  - plan-update-confirmation
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - Obsidian Templating Plugins Integration Guide
  - polyglot-repl-interface-layer
  - Event Bus Projections Architecture
  - sibilant-meta-string-templating-runtime
  - State Snapshots API and Transactional Projector
  - Board Walk – 2025-08-11
  - Mongo Outbox Implementation
  - Promethean Event Bus MVP v0.1
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - 'Promethean Pipelines: Local TypeScript-First Workflow'
  - layer-1-uptime-diagrams
  - TypeScript Patch for Tool Calling Support
  - i3-layout-saver
  - Ghostly Smoke Interference
  - ecs-scheduler-and-prefabs
  - Event Bus MVP
  - AI-Centric OS with MCP Layer
  - file-watcher-auth-fix
  - archetype-ecs
  - RAG UI Panel with Qdrant and PostgREST
  - Refactor Frontmatter Processing
  - Promethean Web UI Setup
  - Migrate to Provider-Tenant Architecture
  - Functional Refactor of TypeScript Document Processing
  - Window Management
  - Factorio AI with External Agents
  - Refactor 05-footers.ts
  - sibilant-metacompiler-overview
  - Cross-Language Runtime Polymorphism
  - Local-Offline-Model-Deployment-Strategy
  - refactor-relations
  - Promethean-native config design
  - set-assignment-in-lisp-ast
  - observability-infrastructure-setup
  - SentenceProcessing
  - Lisp-Compiler-Integration
  - Recursive Prompt Construction Engine
  - Vectorial Exception Descent
  - promethean-system-diagrams
  - Interop and Source Maps
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Local-Only-LLM-Workflow
  - prompt-programming-language-lisp
  - Local-First Intention→Code Loop with Free Models
related_to_uuid:
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - e811123d-5841-4e52-bf8c-978f26db4230
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 6b63edca-7637-4fb0-bc85-d498c31cc46e
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 54382370-1931-4a19-a634-46735708a9ea
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - b51e19b4-1326-4311-9798-33e972bf626c
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - d41a06d1-613e-4440-80b7-4553fc694285
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
references:
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
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 65
    col: 0
    score: 0.86
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 85
    col: 0
    score: 0.86
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.88
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.86
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.88
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.85
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 161
    col: 0
    score: 0.91
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.89
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.85
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.87
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.93
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.92
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.91
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.9
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.89
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 185
    col: 0
    score: 0.89
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 150
    col: 0
    score: 0.88
  - uuid: 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
    line: 44
    col: 0
    score: 0.88
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.87
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.87
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 0.87
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.86
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 207
    col: 0
    score: 0.93
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 391
    col: 0
    score: 0.93
---
Yep—namespacing it is. Here’s a clean layout that won’t collide with your existing `./src` and still honors your “import from `@shared/ts/dist/...`” rule. ^ref-66a72fc3-1-0

# Shared package structure (namespaced)

```
shared/ts/
  package.json
  tsconfig.json
  tsconfig.build.json
  src/
    agent/
      envelope.ts           # types for the envelope, health, runtime
      runtime.ts            # AgentRuntime interface (pub/sub, effects)
      policy.ts             # capability types + policy gate
    platform/
      provider-registry.ts  # loads providers.yml
      events.ts             # SocialMessageCreated, PostMessage (provider-agnostic)
      topic.ts              # topic({ provider, tenant, area, name })
      urn.ts                # toUrn()/fromUrn()
    effects/
      mongo.ts              # tenant-scoped mongo(db/coll)
      chroma.ts             # tenant-scoped chroma(ns)
      http.ts               # plain http.fetch (no tokens)
      rest.ts               # bus-based provider REST request helper
    providers/
      discord/
        events.ts           # raw Discord event shapes (optional)
        normalize.ts        # raw->SocialMessageCreated
      # (future) reddit/, bluesky/, twitch/ …
    index.ts                # barrel re-exports (namespaced)
  dist/                      # build output (gitignored)
```
^ref-66a72fc3-5-0 ^ref-66a72fc3-33-0

# Imports (explicitly namespaced, from `dist/`)

* Envelope & runtime:
 ^ref-66a72fc3-38-0
  ```ts
  import { AgentEnvelope } from "@shared/ts/dist/agent/envelope.js";
  import { AgentRuntime }  from "@shared/ts/dist/agent/runtime.js";
^ref-66a72fc3-38-0 ^ref-66a72fc3-42-0
  ```
^ref-66a72fc3-39-0
* Platform types/util: ^ref-66a72fc3-44-0

  ```ts
  import { SocialMessageCreated, PostMessage } from "@shared/ts/dist/platform/events.js";
  import { topic } from "@shared/ts/dist/platform/topic.js";
^ref-66a72fc3-44-0 ^ref-66a72fc3-49-0
  import { toUrn } from "@shared/ts/dist/platform/urn.js";
  ```
^ref-66a72fc3-51-0
* Effects:

  ```ts
  import { mongoForTenant }  from "@shared/ts/dist/effects/mongo.js";
^ref-66a72fc3-51-0 ^ref-66a72fc3-56-0
  import { chromaForTenant } from "@shared/ts/dist/effects/chroma.js";
  import { restRequest }     from "@shared/ts/dist/effects/rest.js";
^ref-66a72fc3-58-0
^ref-66a72fc3-56-0
  ```
^ref-66a72fc3-56-0
^ref-66a72fc3-58-0 ^ref-66a72fc3-64-0
^ref-66a72fc3-56-0 ^ref-66a72fc3-64-0
* Provider-specific helpers (only access layer should use these):
^ref-66a72fc3-58-0

^ref-66a72fc3-64-0
  ```ts
  import { normalizeDiscordMessage } from "@shared/ts/dist/providers/discord/normalize.js";
  ```

# `package.json` exports (allow dist subpaths per namespace)
 ^ref-66a72fc3-76-0
```json
{
  "name": "@shared/ts",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./dist/*": "./dist/*",
    "./dist/agent/*": "./dist/agent/*",
    "./dist/platform/*": "./dist/platform/*",
    "./dist/effects/*": "./dist/effects/*",
    "./dist/providers/*": "./dist/providers/*"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
^ref-66a72fc3-64-0
    "clean": "rimraf dist",
^ref-66a72fc3-91-0
    "prepublishOnly": "npm run clean && npm run build"
  }
^ref-66a72fc3-91-0
}
^ref-66a72fc3-91-0
^ref-66a72fc3-76-0
```
^ref-66a72fc3-77-0

# Minimal file contracts (short + stable) ^ref-66a72fc3-103-0

* `src/agent/envelope.ts`

  ```ts
  export type AgentEnvelope<T = unknown> = {
    id: string; ts: string; src: string; dst: string;
^ref-66a72fc3-91-0
    provider: string; tenant: string; intent: string;
^ref-66a72fc3-103-0
    payload: T; trace?: string; corr?: string;
    build_sha?: string; models?: Array<{name:string;version:string;checksum?:string}>;
^ref-66a72fc3-103-0
    config_rev?: string;
  }; ^ref-66a72fc3-117-0
  ```

* `src/platform/events.ts`

  ```ts
  export type SocialMessageCreated = {
    message_id: string; author_urn: string; space_urn: string;
    text?: string; attachments?: Array<{urn:string; url:string; content_type?:string; size?:number; sha256?:string}>;
^ref-66a72fc3-103-0
    created_at: string; provider: string; tenant: string; provider_payload?: any;
  };
^ref-66a72fc3-122-0
^ref-66a72fc3-117-0 ^ref-66a72fc3-124-0
  export type PostMessage = {
    provider: string; tenant: string; space_urn: string;
^ref-66a72fc3-124-0
^ref-66a72fc3-122-0
^ref-66a72fc3-117-0
    in_reply_to?: string; text: string; attachments?: Array<{ data_path?: string; url?: string }>;
  };
^ref-66a72fc3-137-0
^ref-66a72fc3-124-0 ^ref-66a72fc3-139-0
^ref-66a72fc3-122-0 ^ref-66a72fc3-140-0
^ref-66a72fc3-117-0
  ``` ^ref-66a72fc3-122-0
^ref-66a72fc3-137-0
 ^ref-66a72fc3-139-0
* `src/platform/topic.ts` ^ref-66a72fc3-140-0
^ref-66a72fc3-142-0 ^ref-66a72fc3-146-0
 ^ref-66a72fc3-147-0
  ```ts ^ref-66a72fc3-148-0
  export const topic = (p:{provider:string; tenant:string; area:string; name:string}) =>
    `promethean.p.${p.provider}.t.${p.tenant}.${p.area}.${p.name}`;
  ```

* `src/agent/policy.ts` (capabilities are provider-parametric)

  ```ts
^ref-66a72fc3-124-0
  export type Capability =
^ref-66a72fc3-142-0
^ref-66a72fc3-140-0
^ref-66a72fc3-139-0 ^ref-66a72fc3-146-0
^ref-66a72fc3-137-0 ^ref-66a72fc3-147-0
^ref-66a72fc3-155-0
^ref-66a72fc3-154-0 ^ref-66a72fc3-157-0
^ref-66a72fc3-153-0
^ref-66a72fc3-149-0 ^ref-66a72fc3-159-0
^ref-66a72fc3-148-0
^ref-66a72fc3-147-0
^ref-66a72fc3-146-0
^ref-66a72fc3-142-0
    | { kind:"provider.gateway.connect"; provider:string; tenant:string } ^ref-66a72fc3-148-0
    | { kind:"provider.rest.call";      provider:string; tenant:string; route:string } ^ref-66a72fc3-137-0 ^ref-66a72fc3-149-0 ^ref-66a72fc3-165-0
^ref-66a72fc3-171-0
^ref-66a72fc3-165-0
^ref-66a72fc3-159-0
^ref-66a72fc3-157-0
^ref-66a72fc3-155-0
^ref-66a72fc3-154-0 ^ref-66a72fc3-177-0
^ref-66a72fc3-153-0
^ref-66a72fc3-149-0
    | { kind:"storage.mongo"; db:string; coll:string }
    | { kind:"embed.text"; model:string } ^ref-66a72fc3-139-0 ^ref-66a72fc3-181-0
    | { kind:"embed.image"; model:string } ^ref-66a72fc3-140-0
    | { kind:"http.fetch"; url:string; method?:string }; ^ref-66a72fc3-153-0
^ref-66a72fc3-185-0
  export type PolicyCheck = (agentId:string, cap:Capability) => Promise<void>; ^ref-66a72fc3-142-0 ^ref-66a72fc3-154-0
^ref-66a72fc3-188-0
^ref-66a72fc3-185-0
  ``` ^ref-66a72fc3-155-0

# Where the Discord bits go (namespaced) ^ref-66a72fc3-157-0
 ^ref-66a72fc3-146-0
Only the access layer should touch these: ^ref-66a72fc3-147-0 ^ref-66a72fc3-159-0
 ^ref-66a72fc3-148-0
* `src/providers/discord/normalize.ts` — raw Discord → `SocialMessageCreated` ^ref-66a72fc3-149-0 ^ref-66a72fc3-177-0
* `src/providers/discord/events.ts` — (optional) raw type defs for gateway payloads

Everything else (indexers, embedders, cephalon-social) sticks to `platform/` + `effects/`.
 ^ref-66a72fc3-153-0 ^ref-66a72fc3-165-0 ^ref-66a72fc3-181-0 ^ref-66a72fc3-195-0
# Migration checklist (namespaced) ^ref-66a72fc3-154-0
 ^ref-66a72fc3-155-0
* [ ] Add the folders above under `shared/ts/src/` (no base-level collisions).
* [ ] Update services to import from `@shared/ts/dist/<namespace>/*.js`. ^ref-66a72fc3-157-0
* [ ] CI rule to forbid imports from `@shared/ts/dist/providers/*` **outside** access-layer services.
* [ ] Build shared, then services (`pnpm -F @shared/ts build` first). ^ref-66a72fc3-159-0

# Sanity traps (avoid them)

* Don’t leak provider-specific helpers outside `providers/<name>/`.
* Don’t add new root files under `src/`; always tuck into `agent/`, `platform/`, `effects/`, or `providers/<name>/`.
* Keep provider-agnostic workers blind to `providers/*`. ^ref-66a72fc3-165-0 ^ref-66a72fc3-177-0
 ^ref-66a72fc3-208-0
If you want, I’ll fill in the tiny `index.ts` barrel and a one-page `normalizeDiscordMessage` stub under `providers/discord/` using this layout—kept terse so you can drop it in. ^ref-66a72fc3-195-0

\#hashtags ^ref-66a72fc3-181-0
\#promethean #namespaces #monorepo #typescript #shared-lib #architecture #clean-boundaries #provider-agnostic<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Event Bus MVP](event-bus-mvp.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [archetype-ecs](archetype-ecs.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Window Management](chunks/window-management.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [refactor-relations](refactor-relations.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [SentenceProcessing](sentenceprocessing.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
## Sources
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
- [Dynamic Context Model for Web Components — L65](dynamic-context-model-for-web-components.md#^ref-f7702bf8-65-0) (line 65, col 0, score 0.86)
- [mystery-lisp-search-session — L85](mystery-lisp-search-session.md#^ref-513dc4c7-85-0) (line 85, col 0, score 0.86)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.88)
- [Exception Layer Analysis — L63](exception-layer-analysis.md#^ref-21d5cc09-63-0) (line 63, col 0, score 0.86)
- [ecs-offload-workers — L427](ecs-offload-workers.md#^ref-6498b9d7-427-0) (line 427, col 0, score 0.88)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.85)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.91)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 0.89)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.85)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.87)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.93)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.92)
- [WebSocket Gateway Implementation — L630](websocket-gateway-implementation.md#^ref-e811123d-630-0) (line 630, col 0, score 0.91)
- [markdown-to-org-transpiler — L272](markdown-to-org-transpiler.md#^ref-ab54cdd8-272-0) (line 272, col 0, score 0.9)
- [Cross-Target Macro System in Sibilant — L148](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-148-0) (line 148, col 0, score 0.89)
- [lisp-dsl-for-window-management — L185](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-185-0) (line 185, col 0, score 0.89)
- [2d-sandbox-field — L150](2d-sandbox-field.md#^ref-c710dc93-150-0) (line 150, col 0, score 0.88)
- [Matplotlib Animation with Async Execution — L44](matplotlib-animation-with-async-execution.md#^ref-687439f9-44-0) (line 44, col 0, score 0.88)
- [compiler-kit-foundations — L588](compiler-kit-foundations.md#^ref-01b21543-588-0) (line 588, col 0, score 0.87)
- [polymorphic-meta-programming-engine — L190](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-190-0) (line 190, col 0, score 0.87)
- [System Scheduler with Resource-Aware DAG — L374](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-374-0) (line 374, col 0, score 0.87)
- [Promethean Agent Config DSL — L279](promethean-agent-config-dsl.md#^ref-2c00ce45-279-0) (line 279, col 0, score 0.86)
- [Lispy Macros with syntax-rules — L375](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-375-0) (line 375, col 0, score 0.86)
- [Math Fundamentals — L207](chunks/math-fundamentals.md#^ref-c6e87433-207-0) (line 207, col 0, score 0.93)
- [Fnord Tracer Protocol — L391](fnord-tracer-protocol.md#^ref-fc21f824-391-0) (line 391, col 0, score 0.93)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
