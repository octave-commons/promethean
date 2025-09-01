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
  - shared-package-layout-clarification
  - Voice Access Layer Design
  - Promethean Infrastructure Setup
  - Promethean Agent DSL TS Scaffold
  - Migrate to Provider-Tenant Architecture
  - WebSocket Gateway Implementation
  - Event Bus MVP
  - Local-First Intention→Code Loop with Free Models
  - i3-bluetooth-setup
  - Promethean Event Bus MVP v0.1
  - Promethean Agent Config DSL
  - api-gateway-versioning
  - ecs-offload-workers
  - Local-Only-LLM-Workflow
  - i3-config-validation-methods
  - Post-Linguistic Transhuman Design Frameworks
  - Debugging Broker Connections and Agent Behavior
  - Dynamic Context Model for Web Components
  - Mongo Outbox Implementation
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - Cross-Target Macro System in Sibilant
  - Per-Domain Policy System for JS Crawler
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Universal Lisp Interface
  - Vectorial Exception Descent
  - AI-Centric OS with MCP Layer
related_to_uuid:
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 54382370-1931-4a19-a634-46735708a9ea
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 5e408692-0e74-400e-a617-84247c7353ad
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
references: []
---
Yep—namespacing it is. Here’s a clean layout that won’t collide with your existing `./src` and still honors your “import from `@shared/ts/dist/...`” rule.

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

# Imports (explicitly namespaced, from `dist/`)

* Envelope & runtime:

  ```ts
  import { AgentEnvelope } from "@shared/ts/dist/agent/envelope.js";
  import { AgentRuntime }  from "@shared/ts/dist/agent/runtime.js";
  ```
* Platform types/util:

  ```ts
  import { SocialMessageCreated, PostMessage } from "@shared/ts/dist/platform/events.js";
  import { topic } from "@shared/ts/dist/platform/topic.js";
  import { toUrn } from "@shared/ts/dist/platform/urn.js";
  ```
* Effects:

  ```ts
  import { mongoForTenant }  from "@shared/ts/dist/effects/mongo.js";
  import { chromaForTenant } from "@shared/ts/dist/effects/chroma.js";
  import { restRequest }     from "@shared/ts/dist/effects/rest.js";
  ```
* Provider-specific helpers (only access layer should use these):

  ```ts
  import { normalizeDiscordMessage } from "@shared/ts/dist/providers/discord/normalize.js";
  ```

# `package.json` exports (allow dist subpaths per namespace)

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
    "clean": "rimraf dist",
    "prepublishOnly": "npm run clean && npm run build"
  }
}
```

# Minimal file contracts (short + stable)

* `src/agent/envelope.ts`

  ```ts
  export type AgentEnvelope<T = unknown> = {
    id: string; ts: string; src: string; dst: string;
    provider: string; tenant: string; intent: string;
    payload: T; trace?: string; corr?: string;
    build_sha?: string; models?: Array<{name:string;version:string;checksum?:string}>;
    config_rev?: string;
  };
  ```

* `src/platform/events.ts`

  ```ts
  export type SocialMessageCreated = {
    message_id: string; author_urn: string; space_urn: string;
    text?: string; attachments?: Array<{urn:string; url:string; content_type?:string; size?:number; sha256?:string}>;
    created_at: string; provider: string; tenant: string; provider_payload?: any;
  };
  export type PostMessage = {
    provider: string; tenant: string; space_urn: string;
    in_reply_to?: string; text: string; attachments?: Array<{ data_path?: string; url?: string }>;
  };
  ```

* `src/platform/topic.ts`

  ```ts
  export const topic = (p:{provider:string; tenant:string; area:string; name:string}) =>
    `promethean.p.${p.provider}.t.${p.tenant}.${p.area}.${p.name}`;
  ```

* `src/agent/policy.ts` (capabilities are provider-parametric)

  ```ts
  export type Capability =
    | { kind:"provider.gateway.connect"; provider:string; tenant:string }
    | { kind:"provider.rest.call";      provider:string; tenant:string; route:string }
    | { kind:"storage.mongo"; db:string; coll:string }
    | { kind:"embed.text"; model:string }
    | { kind:"embed.image"; model:string }
    | { kind:"http.fetch"; url:string; method?:string };
  export type PolicyCheck = (agentId:string, cap:Capability) => Promise<void>;
  ```

# Where the Discord bits go (namespaced)

Only the access layer should touch these:

* `src/providers/discord/normalize.ts` — raw Discord → `SocialMessageCreated`
* `src/providers/discord/events.ts` — (optional) raw type defs for gateway payloads

Everything else (indexers, embedders, cephalon-social) sticks to `platform/` + `effects/`.

# Migration checklist (namespaced)

* [ ] Add the folders above under `shared/ts/src/` (no base-level collisions).
* [ ] Update services to import from `@shared/ts/dist/<namespace>/*.js`.
* [ ] CI rule to forbid imports from `@shared/ts/dist/providers/*` **outside** access-layer services.
* [ ] Build shared, then services (`pnpm -F @shared/ts build` first).

# Sanity traps (avoid them)

* Don’t leak provider-specific helpers outside `providers/<name>/`.
* Don’t add new root files under `src/`; always tuck into `agent/`, `platform/`, `effects/`, or `providers/<name>/`.
* Keep provider-agnostic workers blind to `providers/*`.

If you want, I’ll fill in the tiny `index.ts` barrel and a one-page `normalizeDiscordMessage` stub under `providers/discord/` using this layout—kept terse so you can drop it in.

\#hashtags
\#promethean #namespaces #monorepo #typescript #shared-lib #architecture #clean-boundaries #provider-agnostic<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
