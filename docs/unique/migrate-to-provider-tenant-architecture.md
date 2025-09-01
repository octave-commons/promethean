---
uuid: 54382370-1931-4a19-a634-46735708a9ea
created_at: 2025.08.25.18.23.36.md
filename: Migrate to Provider-Tenant Architecture
description: >-
  Refactor Promethean’s Discord services into a provider-agnostic, tenant-scoped
  architecture with shared types, tokenless domain workers, and
  provider-specific storage partitioning. Ensures Discord tokens are confined to
  access layers and enables future expansion to Reddit/Bluesky/Twitch.
tags:
  - architecture
  - discord
  - tenant
  - provider
  - tokenless
  - domain
  - storage
  - partitioning
  - policy
  - effects
related_to_title:
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Promethean-native config design
  - Chroma Toolkit Consolidation Plan
  - Per-Domain Policy System for JS Crawler
  - Promethean Agent Config DSL
  - Sibilant Meta-Prompt DSL
  - Promethean Event Bus MVP v0.1
  - Voice Access Layer Design
  - Cross-Target Macro System in Sibilant
  - js-to-lisp-reverse-compiler
  - Shared Package Structure
  - eidolon-field-math-foundations
  - shared-package-layout-clarification
  - Unique Info Dump Index
  - Dynamic Context Model for Web Components
  - Prometheus Observability Stack
  - Model Selection for Lightweight Conversational Tasks
  - Vectorial Exception Descent
  - prom-lib-rate-limiters-and-replay-api
  - Cross-Language Runtime Polymorphism
  - ecs-offload-workers
  - AI-Centric OS with MCP Layer
  - Board Walk – 2025-08-11
  - Promethean Infrastructure Setup
  - api-gateway-versioning
  - Eidolon Field Abstract Model
  - Exception Layer Analysis
  - Event Bus MVP
  - 2d-sandbox-field
  - aionian-circuit-math
  - Local-First Intention→Code Loop with Free Models
  - Promethean Agent DSL TS Scaffold
  - field-interaction-equations
  - EidolonField
  - i3-bluetooth-setup
  - Math Fundamentals
  - archetype-ecs
  - Diagrams
  - DSL
  - Local-Offline-Model-Deployment-Strategy
  - i3-config-validation-methods
  - Local-Only-LLM-Workflow
  - observability-infrastructure-setup
  - Promethean Full-Stack Docker Setup
  - Event Bus Projections Architecture
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Post-Linguistic Transhuman Design Frameworks
  - polymorphic-meta-programming-engine
  - Mongo Outbox Implementation
  - Language-Agnostic Mirror System
  - Interop and Source Maps
  - template-based-compilation
  - Prompt_Folder_Bootstrap
  - polyglot-repl-interface-layer
  - sibilant-macro-targets
  - sibilant-meta-string-templating-runtime
  - Universal Lisp Interface
related_to_uuid:
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - af5d2824-faad-476c-a389-e912d9bc672c
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 5e408692-0e74-400e-a617-84247c7353ad
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - b01856b4-999f-418d-8009-ade49b00eb0f
references: []
---
# Codex Task — Migrate to Provider-Tenant Architecture (Discord now, others later)

**Goal:** Refactor Promethean’s Discord-bound services into a **provider-agnostic, tenant-scoped** architecture. Discord is the first provider; design must generalize cleanly to Reddit/Bluesky/Twitch without further structural changes.

---

## Scope

### In

* Add `provider` and `tenant` to the **message envelope** and **topics**.
* Introduce **Provider Registry** (`providers.yml`) and shared types.
* Create **access layer** for Discord: `discord-gateway` + `discord-rest` (tokened).
* Convert five “weird” services into **tokenless domain workers**:

  * `discord-message-indexer`
  * `discord-attachment-indexer`
  * `discord-message-embedder`
  * `attachment-embedder`
  * `cephalon-discord` (adapter binding only)
* Add **normalized domain events** (`SocialMessageCreated`) and **commands** (`PostMessage`).
* Partition storage & embeddings **by provider+tenant**.
* Wire **policy** so only access layer has `provider.*` capabilities.
* CI rule to **ban tokens** outside access layer.

### Out (Non-goals)

* Implementing Reddit/Bluesky/Twitch adapters (stubs optional).
* Changing STT/TTS/LLM internals.
* Replacing PM2. (Use existing process manager.)

---

## Deliverables

1. **Shared library additions** under `shared/ts` (compiled to `@shared/ts/dist/...`):

   * `agent-envelope.ts` → add `provider`, `tenant`.
   * `topic.ts` → `topic({provider,tenant,area,name})`.
   * `urn.ts` → `toUrn()/fromUrn()` helpers.
   * `events.ts` → `SocialMessageCreated`, `PostMessage` types.
   * `provider-registry.ts` → loads `providers.yml`.
   * `policy.ts` → `provider.*` caps enforced here.
   * `effects.ts` → tenant-scoped `mongo()`, `chroma()`, `http.fetch()`, `rest.request()`.

2. **New services**

   * `services/ts/discord-gateway/`
   * `services/ts/discord-rest/`

3. **Refactors (tokenless)**

   * `services/ts/discord-message-indexer/`
   * `services/ts/discord-attachment-indexer/`
   * `services/ts/discord-message-embedder/`
   * `services/ts/attachment-embedder/`
   * `services/ts/cephalon-discord/`

4. **Config**

   * `providers.yml` with `discord/duck` tenant.
   * `ecosystem.discord.js` (PM2) to boot per-tenant access layer.

5. **DB & Vector schema**

   * Unique indexes including `{ provider, tenant, foreign_id }`.
   * Chroma namespaces: `<provider>__<tenant>__messages`, `<provider>__<tenant>__attachments`.

6. **Tests**

   * Golden tests for envelopes/topics and normalized events.
   * Mocks for gateway, rest proxy, and policy.
   * CI grep rule to fail build if tokens appear outside access layer.

---

## Acceptance Criteria

* [ ] All pub/sub messages include `provider` and `tenant`.
* [ ] Topics follow: `promethean.p.<provider>.t.<tenant>.<area>.<name>`.
* [ ] Discord tokens exist **only** in `discord-gateway` and `discord-rest`.
* [ ] Workers run with **no Discord SDK** or tokens; interact via bus and shared effects.
* [ ] `SocialMessageCreated` emitted for live Discord messages and consumed by indexers/embedders.
* [ ] Replies flow through `PostMessage` → `discord-rest` (no direct SDK).
* [ ] Storage and Chroma partitioned by provider+tenant, with unique indexes.
* [ ] Policy blocks `provider.*` caps for non-access agents (tested).
* [ ] PM2 can start one or more tenants by changing `providers.yml` + env.
* [ ] CI fails if secrets are found outside access layer.

---

## Implementation Plan (sequenced, atomic commits)

### 1) Shared types & envelope

* Update `shared/ts/agent-envelope.ts`:

  * Add `provider: string`, `tenant: string`.
  * Bump **contract version**.
* Add `shared/ts/topic.ts`: `topic({provider,tenant,area,name})`.
* Add `shared/ts/events.ts`: `SocialMessageCreated`, `PostMessage`.
* Add `shared/ts/urn.ts`: URN helpers.
* Add `shared/ts/provider-registry.ts`: file-backed registry for `providers.yml`.
* Add `shared/ts/policy.ts`: capability types; enforce `provider.*` only for access agents.
* Add `shared/ts/effects.ts`: wrappers for mongo/chroma/http and **bus-based rest.request**.

**Tests:** unit tests for type guards, topic formatting, URN round-trip.

### 2) Providers config

* Create `providers.yml`:

  ```
  providers:
    - provider: discord
      tenant: duck
      credentials:
        bot_token: ${DISCORD_TOKEN_DUCK}
        app_id: "123..."
      allow:
        guilds: ["111111111111111111"]
        channels: ["*"]
      storage:
        mongo_db: "promethean_discord_duck"
        chroma_ns: "discord__duck"
  ```

* Add loader + schema validation (zod).

### 3) Discord access layer

* **discord-rest**:

  * Fastify service consuming `promethean.p.discord.t.<tenant>.rest.request`.
  * Global **bucket map** + `retry_after_ms` handling.
  * Emits `...rest.response` with `ok`, `status`, `bucket`, `retry_after_ms`.
  * Handles `PostMessage` command: map to `POST /channels/{id}/messages`.
* **discord-gateway**:

  * WS gateway with intents; normalize `MESSAGE_CREATE` into `SocialMessageCreated`.
  * Emit raw event topic **and** normalized event.
  * Health pings (seq, ping, shard).

**Tests:** simulate rate-limit, reconnect, normalized payload snapshot.

### 4) Domain workers refactor (tokenless)

* Replace Discord SDK calls with:

  * publish `rest.request` and await `rest.response` (corr id).
* Consume `SocialMessageCreated` instead of raw payloads where possible.
* Indexers upsert on `{ provider, tenant, foreign_id }`.
* Embedders write to `<provider>__<tenant>__*` collections.
* `cephalon-discord` produces `PostMessage` instead of calling SDK.

**Tests:** golden tests: event → DB upsert; text → PostMessage; attachment hashing.

### 5) Storage & embeddings

* Migrations:

  * Add compound unique indexes (`provider`,`tenant`,`foreign_id`).
  * Rename/alias existing collections & chroma namespaces.
* Backfill jobs remain; now publish to `promethean.p.discord.t.<tenant>.jobs.backfill.messages.enqueue`.

**Tests:** verify uniqueness, namespace selection from tenant registry.

### 6) PM2 & env

* `ecosystem.discord.js` to spawn per-tenant access agents using `TENANTS` env or reading `providers.yml`.
* Ensure workers start once, access layer per tenant.

### 7) CI & lint rules

* Add secret-leak guard:

  * Grep for `DISCORD_TOKEN|CLIENT_SECRET|REFRESH_TOKEN` outside `services/ts/discord-*/` and `providers.yml`.
  * Fail build on matches.
* Type-check ensures all publishes include `provider`, `tenant`.

---

## File/Dir Changes (relative to repo root)

* `shared/ts/src/agent-envelope.ts` (update)
* `shared/ts/src/topic.ts` (new)
* `shared/ts/src/events.ts` (new)
* `shared/ts/src/urn.ts` (new)
* `shared/ts/src/provider-registry.ts` (new)
* `shared/ts/src/policy.ts` (new)
* `shared/ts/src/effects.ts` (new)
* `services/ts/discord-rest/` (new)
* `services/ts/discord-gateway/` (new)
* `services/ts/discord-message-indexer/` (refactor)
* `services/ts/discord-attachment-indexer/` (refactor)
* `services/ts/discord-message-embedder/` (refactor)
* `services/ts/attachment-embedder/` (refactor)
* `services/ts/cephalon-discord/` (refactor)
* `config/providers.yml` (new)
* `ecosystem.discord.js` (new)
* DB migrations: scripts under `scripts/migrate/2025-08-provider-tenant/`

---

## Test Plan

* **Unit:** shared helpers, topic, URN, policy checks.
* **Integration (mocked):** gateway emits normalized event → indexer upserts; cephalon publishes `PostMessage` → rest proxy receives correct route/body.
* **E2E (dev env):** run gateway against Discord test guild; verify:

  * live messages appear in `messages` (provider+tenant fields)
  * embeddings land in namespaced collections
  * replying via `PostMessage` posts in channel
* **Performance:** ensure rest proxy honors buckets; no 429 storm under backfill.

---

## Risks & Mitigations

* **Token leak** → CI grep + codeowners review on `providers.yml`.
* **Rate-limit regressions** → Bucket map with circuit breaker; exponential backoff.
* **Schema drift** → Versioned envelope; golden tests for normalized events.
* **Backfill overload** → Queue with max concurrency per tenant; sleep on `retry_after_ms`.

---

## Rollback Plan

* Keep old Discord worker processes & direct SDK code behind a feature flag `DISCORD_LEGACY=true`.
* Migration is reversible by switching topics back and disabling access layer.
* DB migrations add **new indexes and collections**; do **not** drop old until cutover verified.

---

## Milestones (suggested commits)

1. **M1:** Shared types + envelope + topics (+ tests).
2. **M2:** Provider registry + providers.yml + policy gate.
3. **M3:** discord-rest proxy (green tests).
4. **M4:** discord-gateway normalizer (green tests).
5. **M5:** Refactor indexers/embedders → tokenless (unit + integration tests).
6. **M6:** cephalon-discord → PostMessage path (integration test).
7. **M7:** Schema migrations + embeddings namespaces.
8. **M8:** PM2 wiring + E2E on dev guild.
9. **M9:** CI secret guard + docs.

---

## Definition of Done (DoD)

* No service outside `discord-*` has access to Discord tokens nor imports Discord SDK.
* **All** Discord traffic (in/out) flows via the bus topics with `provider` and `tenant`.
* Normalized event & command types are documented and enforced in code.
* One additional tenant can be added by editing `providers.yml` and starting access layer—**no worker code changes**.
* Docs updated: `docs/agents.md`, `docs/providers.md`, `docs/topics.md`.

---

If Codex needs stubs, generate them; keep imports on **@shared/ts/dist/**. Prefer Zod for runtime validation. Keep tests deterministic; record sample Discord payloads as fixtures.

\#hashtags
\#promethean #codex-task #migration #multi-provider #multi-tenant #discord #access-layer #event-driven #policy #observability #typescript #broker #refactor<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Shared Package Structure](shared-package-structure.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Event Bus MVP](event-bus-mvp.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [field-interaction-equations](field-interaction-equations.md)
- [EidolonField](eidolonfield.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [template-based-compilation](template-based-compilation.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
