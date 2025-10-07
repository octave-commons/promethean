---
```
uuid: 36c8882a-badc-4e18-838d-2c54d7038141
```
```
created_at: 2025.08.25.18.45.12.md
```
filename: shared-package-layout-clarification
```
description: >-
```
  Clarifies the correct file structure and import patterns for a shared
  TypeScript package, ensuring build output is in `dist/` and consumers use
  `@shared/ts/dist/...` imports as per the specified rule.
tags:
  - typescript
  - package-layout
  - import-patterns
  - dist-output
  - shared-package
```
related_to_title:
```
  - Shared Package Structure
  - i3-config-validation-methods
  - Promethean Infrastructure Setup
  - Voice Access Layer Design
  - Migrate to Provider-Tenant Architecture
  - Post-Linguistic Transhuman Design Frameworks
  - Local-Only-LLM-Workflow
  - Promethean Web UI Setup
  - Pure TypeScript Search Microservice
  - Promethean Agent DSL TS Scaffold
  - i3-bluetooth-setup
  - Event Bus MVP
  - Local-First Intention→Code Loop with Free Models
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Dynamic Context Model for Web Components
  - ecs-offload-workers
  - Performance-Optimized-Polyglot-Bridge
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Promethean Full-Stack Docker Setup
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - Cross-Target Macro System in Sibilant
  - RAG UI Panel with Qdrant and PostgREST
  - eidolon-field-math-foundations
  - observability-infrastructure-setup
```
related_to_uuid:
```
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 54382370-1931-4a19-a634-46735708a9ea
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
references:
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 64
    col: 1
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 392
    col: 1
    score: 0.9
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 38
    col: 3
    score: 0.87
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 44
    col: 3
    score: 0.87
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 9
    col: 1
    score: 0.91
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 159
    col: 1
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 276
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 276
    col: 3
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 832
    col: 1
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 832
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 581
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 581
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 307
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 307
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 181
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 181
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 3
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 1
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 3
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 1
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 3
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 56
    col: 1
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 56
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 143
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 143
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 436
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 436
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 585
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 585
    col: 3
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 1
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 440
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 440
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 584
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 584
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 600
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 600
    col: 3
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 330
    col: 1
    score: 0.98
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 330
    col: 3
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 174
    col: 1
    score: 0.99
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 174
    col: 3
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 369
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 369
    col: 3
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 153
    col: 1
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 153
    col: 3
    score: 0.99
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 367
    col: 1
    score: 0.99
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 367
    col: 3
    score: 0.99
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 176
    col: 1
    score: 0.87
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 176
    col: 3
    score: 0.87
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 60
    col: 1
    score: 0.87
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 60
    col: 3
    score: 0.87
---
Got it — I was naming the **files** under `@shared/ts/dist/...` instead of the **imports**. Let’s fix the plan to match your repo reality:

* **Source lives in** `shared/ts/src/**`
* **`dist/` is build output**, not checked in
* **Consumers must import from** `@shared/ts/dist/...` (your rule)

Here’s the concrete layout + package wiring so this works cleanly.

# Shared package layout (source vs dist)

```
shared/
  ts/
    package.json
    tsconfig.json
    tsconfig.build.json
    src/
      agent-envelope.ts
      topic.ts
      events.ts
      urn.ts
      provider-registry.ts
      policy.ts
      effects.ts
      index.ts       # re-exports everything
    dist/            # build output (gitignored)
```

## `shared/ts/src/index.ts`

Re-export symbols so consumers can import either the barrel or subpaths:

```ts
export * from "./agent-envelope.js";
export * from "./topic.js";
export * from "./events.js";
export * from "./urn.js";
export * from "./provider-registry.js";
export * from "./policy.js";
export * from "./effects.js";
```

## `shared/ts/package.json`

Make **runtime imports** resolve to `dist/` while letting **subpath imports** also work:

```json
{
  "name": "@shared/ts",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./dist/*": "./dist/*"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "clean": "rimraf dist",
    "prepublishOnly": "npm run clean && npm run build"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "rimraf": "^5.0.0"
  }
}
```

> Key bit: the `exports` map includes **`"./dist/*": "./dist/*"`** so consumers can do `@shared/ts/dist/agent-envelope.js` if you insist on the dist-subpath style.

## `shared/ts/tsconfig.build.json`

Strict ESM build into `dist/` with `.js` extensions:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "rootDir": "src",
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "stripInternal": false
  },
  "include": ["src"]
}
```

## `.gitignore` repo root or `shared/ts/.gitignore`

```
shared/ts/dist/
```

# How consumers should import (matches your rule)

* **Barrel import (preferred for stability):**

  ```ts
  import { AgentEnvelope, topic, SocialMessageCreated } from "@shared/ts";
  ```

* **Explicit dist subpath (your stated rule):**

  ```ts
  import { AgentEnvelope } from "@shared/ts/dist/agent-envelope.js";
  import { topic } from "@shared/ts/dist/topic.js";
  import { SocialMessageCreated } from "@shared/ts/dist/events.js";
  ```

  This works because of the `exports: { "./dist/*": "./dist/*" }` entry.

> Don’t import from `src/` outside the shared package. Everything outside should see **only** `@shared/ts` or `@shared/ts/dist/...`.

# Minimal new files in **src/**, not dist

Create these **under `shared/ts/src/`**:

* `agent-envelope.ts`
* `topic.ts`
* `events.ts`
* `urn.ts`
* `provider-registry.ts`
* `policy.ts`
* `effects.ts`
* `index.ts` (barrel)

Then run:

```bash
pnpm --filter @shared/ts build   # or npm/yarn equivalent
```

All consumers keep (or switch to) imports like `@shared/ts/dist/<module>.js`, while you, as a developer, only touch `shared/ts/src/**`.

# Sanity checks

* [ ] `shared/ts/src/**` contains the real code.
* [ ] `shared/ts/dist/**` is generated, **gitignored**, and contains `.js/.d.ts`.
* [ ] `services/*` import from `@shared/ts/dist/...` or `@shared/ts`.
* [ ] No consumer ever imports `shared/ts/src/**`.
* [ ] CI builds `@shared/ts` before building the services.

If you want, I’ll spit out the exact `src/*.ts` content for the envelope, topics, events, etc., under this structure—**all placed in `src/`**, imports set to `@shared/ts/dist/...`, zero churn to your VCS rules.

\#hashtags
\#promethean #shared-lib #typescript #esm #package-exports #distlayout #monorepo #build-system
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
<<<<<<< HEAD
- [i3-layout-saver]
- [obsidian-templating-plugins-integration-guide]
- [docs/unique/event-bus-mvp|Event Bus MVP]
- [pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]
- [websocket-gateway-implementation|WebSocket Gateway Implementation]
- [polyglot-s-expr-bridge-python-js-lisp-interop|Polyglot S-expr Bridge: Python-JS-Lisp Interop]
- [promethean-system-diagrams]
- [lispy-macros-with-syntax-rules|Lispy Macros with syntax-rules]
- [shared-package-structure|Shared Package Structure]
- [Promethean Event Bus MVP v0.1]promethean-event-bus-mvp-v0-1.md
- [matplotlib-animation-with-async-execution|Matplotlib Animation with Async Execution]
- [mystery-lisp-search-session]
- [sibilant-meta-string-templating-runtime]
- [chroma-embedding-refactor]
- [rag-ui-panel-with-qdrant-and-postgrest|RAG UI Panel with Qdrant and PostgREST]
- [sibilant-metacompiler-overview]
- [cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]
- [ecs-scheduler-and-prefabs]
- [docs/unique/interop-and-source-maps|Interop and Source Maps]
- [local-offline-model-deployment-strategy]
- [local-only-llm-workflow]
- lisp-dsl-for-window-management$lisp-dsl-for-window-management.md
- [vectorial-exception-descent|Vectorial Exception Descent]
- [2d-sandbox-field]
- [sibilant-meta-prompt-dsl|Sibilant Meta-Prompt DSL]
## Sources
- [obsidian-templating-plugins-integration-guide#^ref-3724ef1e-5-0|obsidian-templating-plugins-integration-guide — L5] (line 5, col 0, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#^ref-63a1cc28-490-0|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490] (line 490, col 0, score 0.97)
- [pure-node-crawl-stack-with-playwright-and-crawlee#^ref-d527c05d-400-0|Pure-Node Crawl Stack with Playwright and Crawlee — L400] (line 400, col 0, score 0.97)
- [docs/unique/event-bus-mvp#^ref-534fe91d-524-0|Event Bus MVP — L524] (line 524, col 0, score 0.97)
- [websocket-gateway-implementation#^ref-e811123d-630-0|WebSocket Gateway Implementation — L630] (line 630, col 0, score 0.97)
- [lispy-macros-with-syntax-rules#^ref-cbfe3513-375-0|Lispy Macros with syntax-rules — L375] (line 375, col 0, score 0.96)
- [promethean-system-diagrams#^ref-b51e19b4-169-0|promethean-system-diagrams — L169] (line 169, col 0, score 0.96)
- [Promethean Event Bus MVP v0.1 — L972]promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0 (line 972, col 0, score 0.95)
- [matplotlib-animation-with-async-execution#^ref-687439f9-44-0|Matplotlib Animation with Async Execution — L44] (line 44, col 0, score 0.95)
- [mystery-lisp-search-session#^ref-513dc4c7-106-0|mystery-lisp-search-session — L106] (line 106, col 0, score 0.95)
- [shared-package-structure#^ref-66a72fc3-76-0|Shared Package Structure — L76] (line 76, col 0, score 0.95)
- [rag-ui-panel-with-qdrant-and-postgrest#^ref-e1056831-349-0|RAG UI Panel with Qdrant and PostgREST — L349] (line 349, col 0, score 0.94)
- [sibilant-metacompiler-overview#^ref-61d4086b-52-0|sibilant-metacompiler-overview — L52] (line 52, col 0, score 0.94)
- [cross-target-macro-system-in-sibilant#^ref-5f210ca2-148-0|Cross-Target Macro System in Sibilant — L148] (line 148, col 0, score 0.94)
- [chroma-embedding-refactor#^ref-8b256935-289-0|Chroma-Embedding-Refactor — L289] (line 289, col 0, score 0.94)
- [sibilant-meta-string-templating-runtime#^ref-2aafc801-92-0|sibilant-meta-string-templating-runtime — L92] (line 92, col 0, score 0.94)
- [ecs-scheduler-and-prefabs#^ref-c62a1815-376-0|ecs-scheduler-and-prefabs — L376] (line 376, col 0, score 0.94)
- [docs/unique/interop-and-source-maps#^ref-cdfac40c-497-0|Interop and Source Maps — L497] (line 497, col 0, score 0.94)
- [local-offline-model-deployment-strategy#^ref-ad7f1ed3-232-0|Local-Offline-Model-Deployment-Strategy — L232] (line 232, col 0, score 0.93)
- [local-only-llm-workflow#^ref-9a8ab57e-147-0|Local-Only-LLM-Workflow — L147] (line 147, col 0, score 0.93)
- lisp-dsl-for-window-management — L185$lisp-dsl-for-window-management.md#^ref-c5c5ff1c-185-0 (line 185, col 0, score 0.93)
- [vectorial-exception-descent#^ref-d771154e-95-0|Vectorial Exception Descent — L95] (line 95, col 0, score 0.92)
- [2d-sandbox-field#^ref-c710dc93-150-0|2d-sandbox-field — L150] (line 150, col 0, score 0.92)
- [sibilant-meta-prompt-dsl#^ref-af5d2824-120-0|Sibilant Meta-Prompt DSL — L120] (line 120, col 0, score 0.91)
- [promethean-web-ui-setup#^ref-bc5172ca-440-0|prom ui bootstrap — L440] (line 440, col 0, score 0.9)
- [pm2-orchestration-patterns#^ref-51932e7b-217-0|pm2-orchestration-patterns — L217] (line 217, col 0, score 0.9)
- [docs/unique/universal-lisp-interface#^ref-b01856b4-187-0|Universal Lisp Interface — L187] (line 187, col 0, score 0.9)
- [i3-config-validation-methods#^ref-d28090ac-28-0|i3-config-validation-methods — L28] (line 28, col 0, score 0.9)
- [ecs-scheduler-and-prefabs#^ref-c62a1815-370-0|ecs-scheduler-and-prefabs — L370] (line 370, col 0, score 0.9)
- [i3-layout-saver#^ref-31f0166e-79-0|i3-layout-saver — L79] (line 79, col 0, score 0.89)
- [polymorphic-meta-programming-engine#^ref-7bed0b9a-190-0|polymorphic-meta-programming-engine — L190] (line 190, col 0, score 0.89)
- [cross-language-runtime-polymorphism#^ref-c34c36a6-211-0|Cross-Language Runtime Polymorphism — L211] (line 211, col 0, score 0.89)
- [promethean-agent-config-dsl#^ref-2c00ce45-279-0|Promethean Agent Config DSL — L279] (line 279, col 0, score 0.89)
- [eidolon-field-optimization#^ref-40e05c14-50-0|Eidolon-Field-Optimization — L50] (line 50, col 0, score 0.89)
- heartbeat-simulation-snippets — L80$heartbeat-simulation-snippets.md#^ref-23e221e9-80-0 (line 80, col 0, score 0.89)
- [shared-package-structure#^ref-66a72fc3-185-0|Shared Package Structure — L185] (line 185, col 0, score 0.89)
- [promethean-infrastructure-setup#^ref-6deed6ac-424-0|Promethean Infrastructure Setup — L424] (line 424, col 0, score 0.89)
- [obsidian-chatgpt-plugin-integration#^ref-636f49b1-5-0|Obsidian ChatGPT Plugin Integration — L5] (line 5, col 0, score 0.89)
- [obsidian-chatgpt-plugin-integration-guide#^ref-3bea339f-5-0|Obsidian ChatGPT Plugin Integration Guide — L5] (line 5, col 0, score 0.89)
- [language-agnostic-mirror-system#^ref-d2b3628c-504-0|Language-Agnostic Mirror System — L504] (line 504, col 0, score 0.88)
- [universal-intention-code-fabric#^ref-c14edce7-388-0|universal-intention-code-fabric — L388] (line 388, col 0, score 0.88)
- [markdown-to-org-transpiler#^ref-ab54cdd8-272-0|markdown-to-org-transpiler — L272] (line 272, col 0, score 0.87)
- [chroma-toolkit-consolidation-plan#^ref-5020e892-5599-0|Chroma Toolkit Consolidation Plan — L5599] (line 5599, col 0, score 0.87)
- [Debugging Broker Connections and Agent Behavior — L2884]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2884-0 (line 2884, col 0, score 0.87)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-6943-0|Dynamic Context Model for Web Components — L6943] (line 6943, col 0, score 0.87)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-3954-0|eidolon-field-math-foundations — L3954] (line 3954, col 0, score 0.87)
- [migrate-to-provider-tenant-architecture#^ref-54382370-7484-0|Migrate to Provider-Tenant Architecture — L7484] (line 7484, col 0, score 0.87)
- [performance-optimized-polyglot-bridge#^ref-f5579967-5734-0|Performance-Optimized-Polyglot-Bridge — L5734] (line 5734, col 0, score 0.87)
- [post-linguistic-transhuman-design-frameworks#^ref-6bcff92c-2827-0|Post-Linguistic Transhuman Design Frameworks — L2827] (line 2827, col 0, score 0.87)
- [docs/unique/ecs-offload-workers#^ref-6498b9d7-427-0|ecs-offload-workers — L427] (line 427, col 0, score 0.86)
- [set-assignment-in-lisp-ast#^ref-c5fba0a0-148-0|set-assignment-in-lisp-ast — L148] (line 148, col 0, score 0.86)
- [exception-layer-analysis#^ref-21d5cc09-63-0|Exception Layer Analysis — L63] (line 63, col 0, score 0.86)
- [ecs-scheduler-and-prefabs#^ref-c62a1815-246-0|ecs-scheduler-and-prefabs — L246] (line 246, col 0, score 0.85)
- [promethean-agent-dsl-ts-scaffold#^ref-5158f742-818-0|Promethean Agent DSL TS Scaffold — L818] (line 818, col 0, score 0.85)
- [docs/unique/interop-and-source-maps#^ref-cdfac40c-498-0|Interop and Source Maps — L498] (line 498, col 0, score 0.85)
- Local-First Intention→Code Loop with Free Models — L105$local-first-intention-code-loop-with-free-models.md#^ref-871490c7-105-0 (line 105, col 0, score 0.85)
- [polyglot-s-expr-bridge-python-js-lisp-interop#^ref-63a1cc28-491-0|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491] (line 491, col 0, score 0.85)
```
=======
```
- [shared-package-structure|Shared Package Structure]
- [i3-config-validation-methods]
- [promethean-infrastructure-setup|Promethean Infrastructure Setup]
- [voice-access-layer-design|Voice Access Layer Design]
- [migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]
- [post-linguistic-transhuman-design-frameworks|Post-Linguistic Transhuman Design Frameworks]
- [local-only-llm-workflow]
- [promethean-web-ui-setup|Promethean Web UI Setup]
- [pure-typescript-search-microservice|Pure TypeScript Search Microservice]
- [promethean-agent-dsl-ts-scaffold|Promethean Agent DSL TS Scaffold]
- [i3-bluetooth-setup]
- [docs/unique/event-bus-mvp|Event Bus MVP]
- Local-First Intention→Code Loop with Free Models$local-first-intention-code-loop-with-free-models.md
- [pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]
- [api-gateway-versioning]
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [docs/unique/ecs-offload-workers|ecs-offload-workers]
- [performance-optimized-polyglot-bridge]
- [ollama-llm-provider-for-pseudo-code-transpiler]
- [promethean-full-stack-docker-setup|Promethean Full-Stack Docker Setup]
- [docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]
- [rag-ui-panel-with-qdrant-and-postgrest|RAG UI Panel with Qdrant and PostgREST]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [observability-infrastructure-setup]

## Sources
- [shared-package-structure#L64|Shared Package Structure — L64] (line 64, col 1, score 0.95)
- [promethean-infrastructure-setup#L392|Promethean Infrastructure Setup — L392] (line 392, col 1, score 0.9)
- [shared-package-structure#L38|Shared Package Structure — L38] (line 38, col 3, score 0.87)
- [shared-package-structure#L44|Shared Package Structure — L44] (line 44, col 3, score 0.87)
- [i3-config-validation-methods#L9|i3-config-validation-methods — L9] (line 9, col 1, score 0.91)
- [shared-package-structure#L159|Shared Package Structure — L159] (line 159, col 1, score 0.89)
- [migrate-to-provider-tenant-architecture#L276|Migrate to Provider-Tenant Architecture — L276] (line 276, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L276|Migrate to Provider-Tenant Architecture — L276] (line 276, col 3, score 1)
- [promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832] (line 832, col 1, score 1)
- [promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832] (line 832, col 3, score 1)
- [promethean-infrastructure-setup#L581|Promethean Infrastructure Setup — L581] (line 581, col 1, score 1)
- [promethean-infrastructure-setup#L581|Promethean Infrastructure Setup — L581] (line 581, col 3, score 1)
- [voice-access-layer-design#L307|Voice Access Layer Design — L307] (line 307, col 1, score 1)
- [voice-access-layer-design#L307|Voice Access Layer Design — L307] (line 307, col 3, score 1)
- [local-only-llm-workflow#L181|Local-Only-LLM-Workflow — L181] (line 181, col 1, score 1)
- [local-only-llm-workflow#L181|Local-Only-LLM-Workflow — L181] (line 181, col 3, score 1)
- [api-gateway-versioning#L284|api-gateway-versioning — L284] (line 284, col 1, score 1)
- [api-gateway-versioning#L284|api-gateway-versioning — L284] (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]debugging-broker-connections-and-agent-behavior.md#L40 (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]debugging-broker-connections-and-agent-behavior.md#L40 (line 40, col 3, score 1)
- [dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384] (line 384, col 1, score 1)
- [dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384] (line 384, col 3, score 1)
- [docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458] (line 458, col 1, score 1)
- [docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458] (line 458, col 3, score 1)
- [docs/unique/event-bus-mvp#L552|Event Bus MVP — L552] (line 552, col 1, score 1)
- [docs/unique/event-bus-mvp#L552|Event Bus MVP — L552] (line 552, col 3, score 1)
- [i3-bluetooth-setup#L104|i3-bluetooth-setup — L104] (line 104, col 1, score 1)
- [i3-bluetooth-setup#L104|i3-bluetooth-setup — L104] (line 104, col 3, score 1)
- Local-First Intention→Code Loop with Free Models — L144$local-first-intention-code-loop-with-free-models.md#L144 (line 144, col 1, score 1)
- Local-First Intention→Code Loop with Free Models — L144$local-first-intention-code-loop-with-free-models.md#L144 (line 144, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L273|Migrate to Provider-Tenant Architecture — L273] (line 273, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L273|Migrate to Provider-Tenant Architecture — L273] (line 273, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L131|Agent Tasks: Persistence Migration to DualStore — L131] (line 131, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L131|Agent Tasks: Persistence Migration to DualStore — L131] (line 131, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169] (line 169, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169] (line 169, col 3, score 1)
- [cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175] (line 175, col 1, score 1)
- [cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175] (line 175, col 3, score 1)
- [dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392] (line 392, col 1, score 1)
- [dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392] (line 392, col 3, score 1)
- [i3-config-validation-methods#L56|i3-config-validation-methods — L56] (line 56, col 1, score 1)
- [i3-config-validation-methods#L56|i3-config-validation-methods — L56] (line 56, col 3, score 1)
- Local-First Intention→Code Loop with Free Models — L143$local-first-intention-code-loop-with-free-models.md#L143 (line 143, col 1, score 1)
- Local-First Intention→Code Loop with Free Models — L143$local-first-intention-code-loop-with-free-models.md#L143 (line 143, col 3, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L167|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167] (line 167, col 1, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L167|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167] (line 167, col 3, score 1)
- [performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438] (line 438, col 1, score 1)
- [performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438] (line 438, col 3, score 1)
- [promethean-full-stack-docker-setup#L436|Promethean Full-Stack Docker Setup — L436] (line 436, col 1, score 1)
- [promethean-full-stack-docker-setup#L436|Promethean Full-Stack Docker Setup — L436] (line 436, col 3, score 1)
- [promethean-infrastructure-setup#L585|Promethean Infrastructure Setup — L585] (line 585, col 1, score 1)
- [promethean-infrastructure-setup#L585|Promethean Infrastructure Setup — L585] (line 585, col 3, score 1)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428] (line 428, col 1, score 1)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428] (line 428, col 3, score 1)
- [pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521] (line 521, col 1, score 1)
- [pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521] (line 521, col 3, score 1)
- [api-gateway-versioning#L288|api-gateway-versioning — L288] (line 288, col 1, score 1)
- [api-gateway-versioning#L288|api-gateway-versioning — L288] (line 288, col 3, score 1)
- [promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440] (line 440, col 1, score 1)
- [promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440] (line 440, col 3, score 1)
- [promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584] (line 584, col 1, score 1)
- [promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584] (line 584, col 3, score 1)
- [promethean-web-ui-setup#L603|Promethean Web UI Setup — L603] (line 603, col 1, score 1)
- [promethean-web-ui-setup#L603|Promethean Web UI Setup — L603] (line 603, col 3, score 1)
- [promethean-infrastructure-setup#L600|Promethean Infrastructure Setup — L600] (line 600, col 1, score 0.99)
- [promethean-infrastructure-setup#L600|Promethean Infrastructure Setup — L600] (line 600, col 3, score 0.99)
- [voice-access-layer-design#L330|Voice Access Layer Design — L330] (line 330, col 1, score 0.98)
- [voice-access-layer-design#L330|Voice Access Layer Design — L330] (line 330, col 3, score 0.98)
- [shared-package-structure#L174|Shared Package Structure — L174] (line 174, col 1, score 0.99)
- [shared-package-structure#L174|Shared Package Structure — L174] (line 174, col 3, score 0.99)
- [rag-ui-panel-with-qdrant-and-postgrest#L369|RAG UI Panel with Qdrant and PostgREST — L369] (line 369, col 1, score 0.99)
- [rag-ui-panel-with-qdrant-and-postgrest#L369|RAG UI Panel with Qdrant and PostgREST — L369] (line 369, col 3, score 0.99)
- [docs/unique/eidolon-field-math-foundations#L153|eidolon-field-math-foundations — L153] (line 153, col 1, score 0.99)
- [docs/unique/eidolon-field-math-foundations#L153|eidolon-field-math-foundations — L153] (line 153, col 3, score 0.99)
- [observability-infrastructure-setup#L367|observability-infrastructure-setup — L367] (line 367, col 1, score 0.99)
- [observability-infrastructure-setup#L367|observability-infrastructure-setup — L367] (line 367, col 3, score 0.99)
- [shared-package-structure#L176|Shared Package Structure — L176] (line 176, col 1, score 0.87)
- [shared-package-structure#L176|Shared Package Structure — L176] (line 176, col 3, score 0.87)
- [i3-config-validation-methods#L60|i3-config-validation-methods — L60] (line 60, col 1, score 0.87)
- [i3-config-validation-methods#L60|i3-config-validation-methods — L60] (line 60, col 3, score 0.87)
```
>>>>>>> stealth/obsidian
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
