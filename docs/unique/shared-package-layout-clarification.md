---
uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
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
Got it — I was naming the **files** under `@shared/ts/dist/...` instead of the **imports**. Let’s fix the plan to match your repo reality: ^ref-36c8882a-1-0

* **Source lives in** `shared/ts/src/**` ^ref-36c8882a-3-0
* **`dist/` is build output**, not checked in ^ref-36c8882a-4-0
* **Consumers must import from** `@shared/ts/dist/...` (your rule) ^ref-36c8882a-5-0

Here’s the concrete layout + package wiring so this works cleanly. ^ref-36c8882a-7-0

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
^ref-36c8882a-11-0 ^ref-36c8882a-28-0

## `shared/ts/src/index.ts`
 ^ref-36c8882a-31-0
Re-export symbols so consumers can import either the barrel or subpaths:
 ^ref-36c8882a-33-0
```ts
export * from "./agent-envelope.js";
export * from "./topic.js";
export * from "./events.js";
export * from "./urn.js";
export * from "./provider-registry.js";
export * from "./policy.js";
export * from "./effects.js";
^ref-36c8882a-33-0
```

## `shared/ts/package.json`

Make **runtime imports** resolve to `dist/` while letting **subpath imports** also work: ^ref-36c8882a-47-0

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
^ref-36c8882a-47-0
} ^ref-36c8882a-78-0
```
^ref-36c8882a-49-0

> Key bit: the `exports` map includes **`"./dist/*": "./dist/*"`** so consumers can do `@shared/ts/dist/agent-envelope.js` if you insist on the dist-subpath style.
 ^ref-36c8882a-82-0
## `shared/ts/tsconfig.build.json`
 ^ref-36c8882a-84-0
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
^ref-36c8882a-84-0
  "include": ["src"]
}
```
^ref-36c8882a-106-0

## `.gitignore` (repo root or `shared/ts/.gitignore`)
^ref-36c8882a-106-0

```
shared/ts/dist/ ^ref-36c8882a-112-0
^ref-36c8882a-112-0 ^ref-36c8882a-114-0
``` ^ref-36c8882a-116-0
^ref-36c8882a-112-0

# How consumers should import (matches your rule)
 ^ref-36c8882a-118-0
^ref-36c8882a-114-0 ^ref-36c8882a-120-0
* **Barrel import (preferred for stability):** ^ref-36c8882a-118-0

  ```ts
^ref-36c8882a-120-0
  import { AgentEnvelope, topic, SocialMessageCreated } from "@shared/ts";
  ```
 ^ref-36c8882a-126-0
* **Explicit dist subpath (your stated rule):** ^ref-36c8882a-128-0
^ref-36c8882a-120-0
 ^ref-36c8882a-126-0
  ```ts
  import { AgentEnvelope } from "@shared/ts/dist/agent-envelope.js"; ^ref-36c8882a-128-0
^ref-36c8882a-128-0 ^ref-36c8882a-132-0
  import { topic } from "@shared/ts/dist/topic.js";
  import { SocialMessageCreated } from "@shared/ts/dist/events.js";
  ```
^ref-36c8882a-137-0
 ^ref-36c8882a-132-0
  This works because of the `exports: { "./dist/*": "./dist/*" }` entry.

> Don’t import from `src/` outside the shared package. Everything outside should see **only** `@shared/ts` or `@shared/ts/dist/...`.

# Minimal new files (in **src/**, not dist)
 ^ref-36c8882a-143-0
Create these **under `shared/ts/src/`**: ^ref-36c8882a-143-0 ^ref-36c8882a-146-0
 ^ref-36c8882a-145-0 ^ref-36c8882a-146-0
* `agent-envelope.ts` ^ref-36c8882a-145-0 ^ref-36c8882a-148-0
* `topic.ts` ^ref-36c8882a-148-0
* `events.ts` ^ref-36c8882a-143-0 ^ref-36c8882a-149-0
* `urn.ts` ^ref-36c8882a-149-0 ^ref-36c8882a-150-0
* `provider-registry.ts` ^ref-36c8882a-149-0
* `policy.ts`
* `effects.ts`
^ref-36c8882a-145-0 ^ref-36c8882a-153-0
* `index.ts` (barrel) ^ref-36c8882a-149-0 ^ref-36c8882a-154-0
 ^ref-36c8882a-155-0
Then run: ^ref-36c8882a-156-0
^ref-36c8882a-155-0 ^ref-36c8882a-156-0 ^ref-36c8882a-157-0
^ref-36c8882a-154-0 ^ref-36c8882a-157-0
^ref-36c8882a-153-0 ^ref-36c8882a-161-0
 ^ref-36c8882a-159-0
```bash ^ref-36c8882a-153-0
pnpm --filter @shared/ts build   # or npm/yarn equivalent ^ref-36c8882a-154-0 ^ref-36c8882a-161-0
^ref-36c8882a-161-0
``` ^ref-36c8882a-155-0 ^ref-36c8882a-164-0
^ref-36c8882a-161-0
 ^ref-36c8882a-156-0
All consumers keep (or switch to) imports like `@shared/ts/dist/<module>.js`, while you, as a developer, only touch `shared/ts/src/**`. ^ref-36c8882a-157-0 ^ref-36c8882a-164-0

# Sanity checks ^ref-36c8882a-159-0
 ^ref-36c8882a-169-0
* [ ] `shared/ts/src/**` contains the real code. ^ref-36c8882a-161-0
* [ ] `shared/ts/dist/**` is generated, **gitignored**, and contains `.js/.d.ts`. ^ref-36c8882a-169-0
* [ ] `services/*` import from `@shared/ts/dist/...` (or `@shared/ts`). ^ref-36c8882a-173-0
* [ ] No consumer ever imports `shared/ts/src/**`. ^ref-36c8882a-164-0 ^ref-36c8882a-173-0
* [ ] CI builds `@shared/ts` before building the services.
 ^ref-36c8882a-173-0
If you want, I’ll spit out the exact `src/*.ts` content for the envelope, topics, events, etc., under this structure—**all placed in `src/`**, imports set to `@shared/ts/dist/...`, zero churn to your VCS rules.

\#hashtags ^ref-36c8882a-169-0
\#promethean #shared-lib #typescript #esm #package-exports #distlayout #monorepo #build-system
t/*": "./dist/*"`** so consumers can do `@shared/ts/dist/agent-envelope.js` if you insist on the dist-subpath style.
 ^ref-36c8882a-82-0
## `shared/ts/tsconfig.build.json`
 ^ref-36c8882a-84-0
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
^ref-36c8882a-84-0
  "include": ["src"]
}
```
^ref-36c8882a-106-0

## `.gitignore` (repo root or `shared/ts/.gitignore`)
^ref-36c8882a-106-0

```
shared/ts/dist/ ^ref-36c8882a-112-0
^ref-36c8882a-112-0 ^ref-36c8882a-114-0
``` ^ref-36c8882a-116-0
^ref-36c8882a-112-0

# How consumers should import (matches your rule)
 ^ref-36c8882a-118-0
^ref-36c8882a-114-0 ^ref-36c8882a-120-0
* **Barrel import (preferred for stability):** ^ref-36c8882a-118-0

  ```ts
^ref-36c8882a-120-0
  import { AgentEnvelope, topic, SocialMessageCreated } from "@shared/ts";
  ```
 ^ref-36c8882a-126-0
* **Explicit dist subpath (your stated rule):** ^ref-36c8882a-128-0
^ref-36c8882a-120-0
 ^ref-36c8882a-126-0
  ```ts
  import { AgentEnvelope } from "@shared/ts/dist/agent-envelope.js"; ^ref-36c8882a-128-0
^ref-36c8882a-128-0 ^ref-36c8882a-132-0
  import { topic } from "@shared/ts/dist/topic.js";
  import { SocialMessageCreated } from "@shared/ts/dist/events.js";
  ```
^ref-36c8882a-137-0
 ^ref-36c8882a-132-0
  This works because of the `exports: { "./dist/*": "./dist/*" }` entry.

> Don’t import from `src/` outside the shared package. Everything outside should see **only** `@shared/ts` or `@shared/ts/dist/...`.

# Minimal new files (in **src/**, not dist)
 ^ref-36c8882a-143-0
Create these **under `shared/ts/src/`**: ^ref-36c8882a-143-0 ^ref-36c8882a-146-0
 ^ref-36c8882a-145-0 ^ref-36c8882a-146-0
* `agent-envelope.ts` ^ref-36c8882a-145-0 ^ref-36c8882a-148-0
* `topic.ts` ^ref-36c8882a-148-0
* `events.ts` ^ref-36c8882a-143-0 ^ref-36c8882a-149-0
* `urn.ts` ^ref-36c8882a-149-0 ^ref-36c8882a-150-0
* `provider-registry.ts` ^ref-36c8882a-149-0
* `policy.ts`
* `effects.ts`
^ref-36c8882a-145-0 ^ref-36c8882a-153-0
* `index.ts` (barrel) ^ref-36c8882a-149-0 ^ref-36c8882a-154-0
 ^ref-36c8882a-155-0
Then run: ^ref-36c8882a-156-0
^ref-36c8882a-155-0 ^ref-36c8882a-156-0 ^ref-36c8882a-157-0
^ref-36c8882a-154-0 ^ref-36c8882a-157-0
^ref-36c8882a-153-0 ^ref-36c8882a-161-0
 ^ref-36c8882a-159-0
```bash ^ref-36c8882a-153-0
pnpm --filter @shared/ts build   # or npm/yarn equivalent ^ref-36c8882a-154-0 ^ref-36c8882a-161-0
^ref-36c8882a-161-0
``` ^ref-36c8882a-155-0 ^ref-36c8882a-164-0
^ref-36c8882a-161-0
 ^ref-36c8882a-156-0
All consumers keep (or switch to) imports like `@shared/ts/dist/<module>.js`, while you, as a developer, only touch `shared/ts/src/**`. ^ref-36c8882a-157-0 ^ref-36c8882a-164-0

# Sanity checks ^ref-36c8882a-159-0
 ^ref-36c8882a-169-0
* [ ] `shared/ts/src/**` contains the real code. ^ref-36c8882a-161-0
* [ ] `shared/ts/dist/**` is generated, **gitignored**, and contains `.js/.d.ts`. ^ref-36c8882a-169-0
* [ ] `services/*` import from `@shared/ts/dist/...` (or `@shared/ts`). ^ref-36c8882a-173-0
* [ ] No consumer ever imports `shared/ts/src/**`. ^ref-36c8882a-164-0 ^ref-36c8882a-173-0
* [ ] CI builds `@shared/ts` before building the services.
 ^ref-36c8882a-173-0
If you want, I’ll spit out the exact `src/*.ts` content for the envelope, topics, events, etc., under this structure—**all placed in `src/`**, imports set to `@shared/ts/dist/...`, zero churn to your VCS rules.

\#hashtags ^ref-36c8882a-169-0
\#promethean #shared-lib #typescript #esm #package-exports #distlayout #monorepo #build-system
