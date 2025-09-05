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
  - 6ff8d80e-7070-47b5-898c-ee506e353471
  - f9e200b4-742d-4786-ae2c-017996d53caf
  - c46718fe-73dd-4236-8f1c-f6565da58cc4
  - 7c3ee67a-f458-464f-9b5e-92f1c0ea8366
  - f4767ec9-7363-4ca0-ad88-ccc624247a3b
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - 3657117f-241d-4ab9-a717-4a3f584071fc
  - 972c820f-63a8-49c6-831f-013832195478
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
  - 21913df0-a1c6-4ba0-a9e9-8ffc35a71d74
  - d975dfe2-e98e-40b1-9df0-fcd13161e951
  - e9aece2c-221c-44fc-9bc3-83c591c8e74d
  - 2478e18c-f621-4b0c-a4c5-9637d213cccf
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - e0d3201b-826a-4976-ab01-36aae28882be
  - 50ac7389-a75e-476a-ab34-bb24776d4f38
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 2d0982f7-7518-432a-80b3-e89834cf9ab3
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - eb21f139-3125-4969-bc81-06a30887fc3a
  - 0e289525-1904-4f7d-9d3a-4fedc53efe9b
  - bdca8ded-0e64-417b-a258-4528829c4704
  - 688ad325-4243-4304-bccc-1a1d8745de08
related_to_title:
  - provider-agnostic-chat-panel-implementation
  - level-cache
  - shared-package-structure
  - Promethean Monorepo Law
  - ecs-scheduler
  - promethean-infrastructure-setup
  - language-agnostic-mirror-system
  - archetype-ecs
  - TypeScript Patch for Tool Calling Support
  - Local-Only LLM Workflow
  - Graph Data Structure
  - minimal-typescript-qdrant-demo
  - promethean-qdrant-demo
  - Cross-Language Runtime Polymorphism
  - dynamic-context-model-for-web-components
  - Field Node Diagrams
  - promethean-full-stack-docker-setup
  - heartbeat-fragment-demo
  - i3 Config Validation Methods
  - windows-tiling-with-autohotkey
  - WebSocket Gateway Implementation
  - Post-Linguistic Transhuman Design Frameworks
  - functional-programming-in-typescript
  - Pure TypeScript Search Microservice
  - template-based-compilation
references:
  - uuid: 6ff8d80e-7070-47b5-898c-ee506e353471
    line: 1
    col: 0
    score: 1
  - uuid: 6ff8d80e-7070-47b5-898c-ee506e353471
    line: 7
    col: 0
    score: 1
  - uuid: 6ff8d80e-7070-47b5-898c-ee506e353471
    line: 10
    col: 0
    score: 1
  - uuid: f9e200b4-742d-4786-ae2c-017996d53caf
    line: 40
    col: 0
    score: 0.98
  - uuid: c46718fe-73dd-4236-8f1c-f6565da58cc4
    line: 77
    col: 0
    score: 0.95
  - uuid: 7c3ee67a-f458-464f-9b5e-92f1c0ea8366
    line: 44
    col: 0
    score: 0.91
  - uuid: 6ff8d80e-7070-47b5-898c-ee506e353471
    line: 8
    col: 0
    score: 0.91
  - uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
    line: 373
    col: 0
    score: 0.9
  - uuid: 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
    line: 426
    col: 0
    score: 0.89
  - uuid: 3657117f-241d-4ab9-a717-4a3f584071fc
    line: 26
    col: 0
    score: 0.87
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 363
    col: 0
    score: 0.86
  - uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
    line: 312
    col: 0
    score: 0.86
  - uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
    line: 246
    col: 0
    score: 0.86
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 415
    col: 0
    score: 0.86
  - uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
    line: 309
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
