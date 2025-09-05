---
uuid: c46718fe-73dd-4236-8f1c-f6565da58cc4
created_at: shared-package-structure.md
filename: shared-package-structure
title: shared-package-structure
description: >-
  A clean, namespaced package structure for shared TypeScript code that avoids
  conflicts with existing `./src` and follows import rules from
  `@shared/ts/dist/...`. Includes explicit imports for agent, platform, effects,
  and provider-specific helpers with minimal file contracts.
tags:
  - namespaced
  - typescript
  - package-structure
  - shared
  - imports
  - dist
  - barrel
related_to_uuid:
  - c4c099fb-728c-470c-be48-084c9a283e50
  - 6f13f134-7536-4bc3-b695-5aaa2906bb9d
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - 7b672b78-7057-4506-baf9-1262a6e477e3
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 21913df0-a1c6-4ba0-a9e9-8ffc35a71d74
  - 46b3c583-a4e2-4ecc-90de-6fd104da23db
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - f0528a41-be17-4213-b5bc-7d37fcbef0e0
  - ee1a3ac8-7b0e-4174-a7c4-030c596acd17
  - e4317155-7fa6-44e8-8aee-b72384581790
  - cdb74242-b61d-4b7e-9288-5859e040e512
  - 150f8bb4-4322-4bb9-8a5f-9c2e3b233e05
  - b46a41c5-8e85-4363-aec9-1aaa42694078
  - 99c6d380-a2a6-4d8e-a391-f4bc0c9a631f
  - 73d64bce-f428-4735-a3d0-6225a0588e46
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - 972c820f-63a8-49c6-831f-013832195478
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - f9e200b4-742d-4786-ae2c-017996d53caf
related_to_title:
  - Promethean Copilot Intent Engine
  - shared-package-layout-clarification
  - dynamic-context-model-for-web-components
  - board-walk-2025-08-11
  - promethean-infrastructure-setup
  - mystery-lisp-for-python-education
  - heartbeat-fragment-demo
  - Graph Data Structure
  - Promethean Event Bus MVP
  - windows-tiling-with-autohotkey
  - local-offline-model-deployment-strategy
  - promethean-agent-dsl-ts-scaffold
  - TypeScript Patch for Tool Calling Support
  - Event Bus Projections Architecture
  - i3-layout-saver
  - Org-Babel Matplotlib Animation Template
  - Layer 1 Survivability Envelope
  - Voice Access Layer Design
  - AI-Centric OS with MCP Layer
  - archetype-ecs
  - Field Node Diagrams
  - sibilant-macro-targets
  - Universal Lisp Interface
  - level-cache
references:
  - uuid: c4c099fb-728c-470c-be48-084c9a283e50
    line: 1
    col: 0
    score: 1
  - uuid: c4c099fb-728c-470c-be48-084c9a283e50
    line: 3
    col: 0
    score: 1
  - uuid: c4c099fb-728c-470c-be48-084c9a283e50
    line: 4
    col: 0
    score: 1
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 49
    col: 0
    score: 0.95
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 132
    col: 0
    score: 0.88
  - uuid: c0e6ea38-a9a0-4379-aa9c-b634a6591a59
    line: 53
    col: 0
    score: 0.87
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 134
    col: 0
    score: 0.87
  - uuid: 7b672b78-7057-4506-baf9-1262a6e477e3
    line: 85
    col: 0
    score: 0.86
  - uuid: 740bbd1c-c039-405c-8a32-4baeddfb5637
    line: 67
    col: 0
    score: 0.86
  - uuid: 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
    line: 426
    col: 0
    score: 0.86
  - uuid: 0c501d52-ba38-42aa-ad25-2d78425dfaff
    line: 65
    col: 0
    score: 0.85
  - uuid: 0c501d52-ba38-42aa-ad25-2d78425dfaff
    line: 326
    col: 0
    score: 0.85
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
\#promethean #namespaces #monorepo #typescript #shared-lib #architecture #clean-boundaries #provider-agnostic
a:string; name:string}) =>
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
\#promethean #namespaces #monorepo #typescript #shared-lib #architecture #clean-boundaries #provider-agnostic
