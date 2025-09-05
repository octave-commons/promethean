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
  - 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
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
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - e811123d-5841-4e52-bf8c-978f26db4230
related_to_title:
  - Factorio AI with External Agents
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
  - Sibilant Meta-Prompt DSL
  - shared-package-layout-clarification
  - WebSocket Gateway Implementation
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
  - uuid: 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
    line: 1
    col: 0
    score: 1
  - uuid: 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
    line: 5
    col: 0
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.93
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 391
    col: 0
    score: 0.93
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.92
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 161
    col: 0
    score: 0.91
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.91
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.9
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.89
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.89
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 185
    col: 0
    score: 0.89
  - uuid: 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
    line: 8
    col: 0
    score: 0.89
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.88
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.88
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 150
    col: 0
    score: 0.88
  - uuid: 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
    line: 44
    col: 0
    score: 0.88
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.87
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
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 65
    col: 0
    score: 0.86
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 85
    col: 0
    score: 0.86
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.86
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.86
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.85
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
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
