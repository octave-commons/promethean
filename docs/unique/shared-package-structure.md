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
