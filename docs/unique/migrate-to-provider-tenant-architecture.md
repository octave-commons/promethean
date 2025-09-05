---
uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
created_at: migrate-to-provider-tenant-architecture.md
filename: Migrate to Provider-Tenant Architecture
title: Migrate to Provider-Tenant Architecture
description: >-
  Refactor Promethean’s Discord services into a provider-agnostic, tenant-scoped
  architecture. This involves adding provider and tenant identifiers to message
  envelopes and topics, creating a provider registry, and implementing tokenless
  domain workers for Discord. The design ensures seamless integration with
  future providers like Reddit and Bluesky without structural changes.
tags:
  - provider-agnostic
  - tenant-scoped
  - Discord
  - architecture
  - refactor
  - tokenless
  - domain workers
  - provider registry
related_to_uuid:
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - 73d64bce-f428-4735-a3d0-6225a0588e46
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 58a50f5a-b073-4c50-8d3f-4284bd5df171
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 46b3c583-a4e2-4ecc-90de-6fd104da23db
  - 8802d059-6b36-4e56-bb17-6a80a7dba599
  - 3657117f-241d-4ab9-a717-4a3f584071fc
  - e4317155-7fa6-44e8-8aee-b72384581790
  - b9501b1c-c624-41e0-8ca9-b628f3962f52
  - 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - c3f0e260-531f-42ea-add4-4e6bb7e5f771
  - cd8f10e6-68d7-4b29-bdfd-3a6614d99229
  - 526317d7-2eaf-4559-bb17-1f8dcfe9e30c
  - 01c5547f-27eb-42d1-af24-9cad10b6a2ca
  - cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 1fcb8421-46eb-4813-ba66-f79b25ef5db7
  - 40bc2ba7-9c5c-4f72-8f88-17bef3c6163f
  - c4c099fb-728c-470c-be48-084c9a283e50
  - cb17c1e1-d9bb-4b95-98ab-ec8a920e977e
related_to_title:
  - board-walk-2025-08-11
  - Voice Access Layer Design
  - promethean-native-config-design
  - chroma-toolkit-consolidation-plan
  - js-to-lisp-reverse-compiler
  - RAG UI Panel with Qdrant and PostgREST
  - Promethean Event Bus MVP
  - agent-tasks-persistence-migration-to-dualstore
  - language-agnostic-mirror-system
  - TypeScript Patch for Tool Calling Support
  - Board Automation Improvements
  - matplotlib-animation-with-async-execution
  - WebSocket Gateway Implementation
  - Functional Embedding Pipeline Refactor
  - promethean-agent-config-dsl
  - Cross-Target Macro System in Sibilant
  - run-step-api
  - Unique Info Dump Index
  - dynamic-context-model-for-web-components
  - api-gateway-versioning
  - Lean AGENT Setup
  - Promethean Copilot Intent Engine
  - 'Protocol 0: Contradiction Engine'
references:
  - uuid: c0e6ea38-a9a0-4379-aa9c-b634a6591a59
    line: 3
    col: 0
    score: 1
  - uuid: c0e6ea38-a9a0-4379-aa9c-b634a6591a59
    line: 5
    col: 0
    score: 1
  - uuid: c0e6ea38-a9a0-4379-aa9c-b634a6591a59
    line: 6
    col: 0
    score: 1
  - uuid: 7d584c12-7517-4f30-8378-34ac9fc3a3f8
    line: 38
    col: 0
    score: 0.9
  - uuid: e2955491-020a-4009-b7ed-a5a348c63cfd
    line: 12
    col: 0
    score: 0.89
  - uuid: 73d64bce-f428-4735-a3d0-6225a0588e46
    line: 237
    col: 0
    score: 0.89
  - uuid: 73d64bce-f428-4735-a3d0-6225a0588e46
    line: 263
    col: 0
    score: 0.89
  - uuid: 58a50f5a-b073-4c50-8d3f-4284bd5df171
    line: 262
    col: 0
    score: 0.89
  - uuid: 73d64bce-f428-4735-a3d0-6225a0588e46
    line: 204
    col: 0
    score: 0.88
  - uuid: e2955491-020a-4009-b7ed-a5a348c63cfd
    line: 6
    col: 0
    score: 0.88
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 137
    col: 0
    score: 0.88
  - uuid: 8802d059-6b36-4e56-bb17-6a80a7dba599
    line: 8
    col: 0
    score: 0.87
  - uuid: 7d584c12-7517-4f30-8378-34ac9fc3a3f8
    line: 39
    col: 0
    score: 0.87
  - uuid: 46b3c583-a4e2-4ecc-90de-6fd104da23db
    line: 101
    col: 0
    score: 0.87
  - uuid: 3657117f-241d-4ab9-a717-4a3f584071fc
    line: 130
    col: 0
    score: 0.86
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 115
    col: 0
    score: 0.86
  - uuid: 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
    line: 13
    col: 0
    score: 0.86
  - uuid: b9501b1c-c624-41e0-8ca9-b628f3962f52
    line: 1
    col: 0
    score: 0.86
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 47
    col: 0
    score: 0.85
---
# Codex Task — Migrate to Provider-Tenant Architecture (Discord now, others later)

**Goal:** Refactor Promethean’s Discord-bound services into a **provider-agnostic, tenant-scoped** architecture. Discord is the first provider; design must generalize cleanly to Reddit/Bluesky/Twitch without further structural changes. ^ref-54382370-3-0

---

## Scope

### In

* Add `provider` and `tenant` to the **message envelope** and **topics**. ^ref-54382370-11-0
* Introduce **Provider Registry** (`providers.yml`) and shared types. ^ref-54382370-12-0
* Create **access layer** for Discord: `discord-gateway` + `discord-rest` (tokened). ^ref-54382370-13-0
* Convert five “weird” services into **tokenless domain workers**: ^ref-54382370-14-0

  * `discord-message-indexer`
  * `discord-attachment-indexer`
  * `discord-message-embedder`
  * `attachment-embedder`
  * `cephalon-discord` (adapter binding only) ^ref-54382370-20-0
* Add **normalized domain events** (`SocialMessageCreated`) and **commands** (`PostMessage`). ^ref-54382370-21-0
* Partition storage & embeddings **by provider+tenant**. ^ref-54382370-22-0
* Wire **policy** so only access layer has `provider.*` capabilities. ^ref-54382370-23-0
* CI rule to **ban tokens** outside access layer. ^ref-54382370-24-0

### Out (Non-goals)

* Implementing Reddit/Bluesky/Twitch adapters (stubs optional). ^ref-54382370-28-0
* Changing STT/TTS/LLM internals. ^ref-54382370-29-0
* Replacing PM2. (Use existing process manager.) ^ref-54382370-30-0

---

## Deliverables

1. **Shared library additions** under `shared/ts` (compiled to `@shared/ts/dist/...`): ^ref-54382370-36-0

   * `agent-envelope.ts` → add `provider`, `tenant`. ^ref-54382370-38-0
   * `topic.ts` → `topic({provider,tenant,area,name})`. ^ref-54382370-39-0
   * `urn.ts` → `toUrn()/fromUrn()` helpers. ^ref-54382370-40-0
   * `events.ts` → `SocialMessageCreated`, `PostMessage` types. ^ref-54382370-41-0
   * `provider-registry.ts` → loads `providers.yml`. ^ref-54382370-42-0
   * `policy.ts` → `provider.*` caps enforced here. ^ref-54382370-43-0
   * `effects.ts` → tenant-scoped `mongo()`, `chroma()`, `http.fetch()`, `rest.request()`. ^ref-54382370-44-0

2. **New services**

   * `services/ts/discord-gateway/`
   * `services/ts/discord-rest/`

3. **Refactors (tokenless)** ^ref-54382370-51-0

   * `services/ts/discord-message-indexer/`
   * `services/ts/discord-attachment-indexer/`
   * `services/ts/discord-message-embedder/`
   * `services/ts/attachment-embedder/`
   * `services/ts/cephalon-discord/`

4. **Config** ^ref-54382370-59-0

   * `providers.yml` with `discord/duck` tenant. ^ref-54382370-61-0
   * `ecosystem.discord.js` (PM2) to boot per-tenant access layer. ^ref-54382370-62-0

5. **DB & Vector schema** ^ref-54382370-64-0

   * Unique indexes including `{ provider, tenant, foreign_id }`. ^ref-54382370-66-0
   * Chroma namespaces: `<provider>__<tenant>__messages`, `<provider>__<tenant>__attachments`. ^ref-54382370-67-0

6. **Tests** ^ref-54382370-69-0

   * Golden tests for envelopes/topics and normalized events. ^ref-54382370-71-0
   * Mocks for gateway, rest proxy, and policy. ^ref-54382370-72-0
   * CI grep rule to fail build if tokens appear outside access layer. ^ref-54382370-73-0

---

## Acceptance Criteria

* [ ] All pub/sub messages include `provider` and `tenant`. ^ref-54382370-79-0
* [ ] Topics follow: `promethean.p.<provider>.t.<tenant>.<area>.<name>`. ^ref-54382370-80-0
* [ ] Discord tokens exist **only** in `discord-gateway` and `discord-rest`. ^ref-54382370-81-0
* [ ] Workers run with **no Discord SDK** or tokens; interact via bus and shared effects. ^ref-54382370-82-0
* [ ] `SocialMessageCreated` emitted for live Discord messages and consumed by indexers/embedders. ^ref-54382370-83-0
* [ ] Replies flow through `PostMessage` → `discord-rest` (no direct SDK). ^ref-54382370-84-0
* [ ] Storage and Chroma partitioned by provider+tenant, with unique indexes. ^ref-54382370-85-0
* [ ] Policy blocks `provider.*` caps for non-access agents (tested). ^ref-54382370-86-0
* [ ] PM2 can start one or more tenants by changing `providers.yml` + env. ^ref-54382370-87-0
* [ ] CI fails if secrets are found outside access layer. ^ref-54382370-88-0

---

## Implementation Plan (sequenced, atomic commits)

### 1) Shared types & envelope

* Update `shared/ts/agent-envelope.ts`: ^ref-54382370-96-0

  * Add `provider: string`, `tenant: string`. ^ref-54382370-98-0
  * Bump **contract version**.
* Add `shared/ts/topic.ts`: `topic({provider,tenant,area,name})`. ^ref-54382370-100-0
* Add `shared/ts/events.ts`: `SocialMessageCreated`, `PostMessage`. ^ref-54382370-101-0
* Add `shared/ts/urn.ts`: URN helpers. ^ref-54382370-102-0
* Add `shared/ts/provider-registry.ts`: file-backed registry for `providers.yml`. ^ref-54382370-103-0
* Add `shared/ts/policy.ts`: capability types; enforce `provider.*` only for access agents. ^ref-54382370-104-0
* Add `shared/ts/effects.ts`: wrappers for mongo/chroma/http and **bus-based rest.request**. ^ref-54382370-105-0

**Tests:** unit tests for type guards, topic formatting, URN round-trip. ^ref-54382370-107-0

### 2) Providers config

* Create `providers.yml`: ^ref-54382370-111-0

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
^ref-54382370-113-0 ^ref-54382370-127-0
 ^ref-54382370-128-0
* Add loader + schema validation (zod).

### 3) Discord access layer
 ^ref-54382370-132-0
* **discord-rest**:

  * Fastify service consuming `promethean.p.discord.t.<tenant>.rest.request`. ^ref-54382370-135-0
  * Global **bucket map** + `retry_after_ms` handling. ^ref-54382370-136-0
  * Emits `...rest.response` with `ok`, `status`, `bucket`, `retry_after_ms`. ^ref-54382370-137-0
  * Handles `PostMessage` command: map to `POST /channels/{id}/messages`. ^ref-54382370-138-0
* **discord-gateway**:
 ^ref-54382370-140-0
  * WS gateway with intents; normalize `MESSAGE_CREATE` into `SocialMessageCreated`. ^ref-54382370-141-0
  * Emit raw event topic **and** normalized event. ^ref-54382370-142-0
  * Health pings (seq, ping, shard).
 ^ref-54382370-144-0
**Tests:** simulate rate-limit, reconnect, normalized payload snapshot.

### 4) Domain workers refactor (tokenless)
 ^ref-54382370-148-0
* Replace Discord SDK calls with:
 ^ref-54382370-150-0
  * publish `rest.request` and await `rest.response` (corr id). ^ref-54382370-151-0
* Consume `SocialMessageCreated` instead of raw payloads where possible. ^ref-54382370-152-0
* Indexers upsert on `{ provider, tenant, foreign_id }`. ^ref-54382370-153-0
* Embedders write to `<provider>__<tenant>__*` collections.
* `cephalon-discord` produces `PostMessage` instead of calling SDK.
 ^ref-54382370-156-0
**Tests:** golden tests: event → DB upsert; text → PostMessage; attachment hashing.

### 5) Storage & embeddings
 ^ref-54382370-160-0
* Migrations:
 ^ref-54382370-162-0
  * Add compound unique indexes (`provider`,`tenant`,`foreign_id`).
  * Rename/alias existing collections & chroma namespaces.
* Backfill jobs remain; now publish to `promethean.p.discord.t.<tenant>.jobs.backfill.messages.enqueue`.
 ^ref-54382370-166-0
**Tests:** verify uniqueness, namespace selection from tenant registry.

### 6) PM2 & env
 ^ref-54382370-170-0
* `ecosystem.discord.js` to spawn per-tenant access agents using `TENANTS` env or reading `providers.yml`.
* Ensure workers start once, access layer per tenant.

### 7) CI & lint rules
 ^ref-54382370-175-0
* Add secret-leak guard:
 ^ref-54382370-177-0
  * Grep for `DISCORD_TOKEN|CLIENT_SECRET|REFRESH_TOKEN` outside `services/ts/discord-*/` and `providers.yml`.
  * Fail build on matches. ^ref-54382370-179-0
* Type-check ensures all publishes include `provider`, `tenant`.

---

## File/Dir Changes (relative to repo root)
 ^ref-54382370-185-0
* `shared/ts/src/agent-envelope.ts` (update) ^ref-54382370-186-0
* `shared/ts/src/topic.ts` (new) ^ref-54382370-187-0
* `shared/ts/src/events.ts` (new) ^ref-54382370-188-0
* `shared/ts/src/urn.ts` (new) ^ref-54382370-189-0
* `shared/ts/src/provider-registry.ts` (new) ^ref-54382370-190-0
* `shared/ts/src/policy.ts` (new) ^ref-54382370-191-0
* `shared/ts/src/effects.ts` (new) ^ref-54382370-192-0
* `services/ts/discord-rest/` (new) ^ref-54382370-193-0
* `services/ts/discord-gateway/` (new) ^ref-54382370-194-0
* `services/ts/discord-message-indexer/` (refactor) ^ref-54382370-195-0
* `services/ts/discord-attachment-indexer/` (refactor) ^ref-54382370-196-0
* `services/ts/discord-message-embedder/` (refactor) ^ref-54382370-197-0
* `services/ts/attachment-embedder/` (refactor) ^ref-54382370-198-0
* `services/ts/cephalon-discord/` (refactor)
* `config/providers.yml` (new)
* `ecosystem.discord.js` (new) ^ref-54382370-201-0
* DB migrations: scripts under `scripts/migrate/2025-08-provider-tenant/`

---

## Test Plan
 ^ref-54382370-207-0
* **Unit:** shared helpers, topic, URN, policy checks. ^ref-54382370-208-0
* **Integration (mocked):** gateway emits normalized event → indexer upserts; cephalon publishes `PostMessage` → rest proxy receives correct route/body. ^ref-54382370-209-0
* **E2E (dev env):** run gateway against Discord test guild; verify:
 ^ref-54382370-211-0
  * live messages appear in `messages` (provider+tenant fields) ^ref-54382370-212-0
  * embeddings land in namespaced collections ^ref-54382370-213-0
  * replying via `PostMessage` posts in channel ^ref-54382370-214-0
* **Performance:** ensure rest proxy honors buckets; no 429 storm under backfill.

---

## Risks & Mitigations
 ^ref-54382370-220-0
* **Token leak** → CI grep + codeowners review on `providers.yml`. ^ref-54382370-221-0
* **Rate-limit regressions** → Bucket map with circuit breaker; exponential backoff. ^ref-54382370-222-0
* **Schema drift** → Versioned envelope; golden tests for normalized events. ^ref-54382370-223-0
* **Backfill overload** → Queue with max concurrency per tenant; sleep on `retry_after_ms`.

---

## Rollback Plan
 ^ref-54382370-229-0
* Keep old Discord worker processes & direct SDK code behind a feature flag `DISCORD_LEGACY=true`.
* Migration is reversible by switching topics back and disabling access layer. ^ref-54382370-231-0
* DB migrations add **new indexes and collections**; do **not** drop old until cutover verified.

---

## Milestones (suggested commits)
 ^ref-54382370-237-0
1. **M1:** Shared types + envelope + topics (+ tests). ^ref-54382370-238-0
2. **M2:** Provider registry + providers.yml + policy gate. ^ref-54382370-239-0
3. **M3:** discord-rest proxy (green tests). ^ref-54382370-240-0
4. **M4:** discord-gateway normalizer (green tests). ^ref-54382370-241-0
5. **M5:** Refactor indexers/embedders → tokenless (unit + integration tests). ^ref-54382370-242-0
6. **M6:** cephalon-discord → PostMessage path (integration test). ^ref-54382370-243-0
7. **M7:** Schema migrations + embeddings namespaces. ^ref-54382370-244-0
8. **M8:** PM2 wiring + E2E on dev guild. ^ref-54382370-245-0
9. **M9:** CI secret guard + docs.

---

## Definition of Done (DoD)
 ^ref-54382370-251-0
* No service outside `discord-*` has access to Discord tokens nor imports Discord SDK. ^ref-54382370-252-0
* **All** Discord traffic (in/out) flows via the bus topics with `provider` and `tenant`. ^ref-54382370-253-0
* Normalized event & command types are documented and enforced in code. ^ref-54382370-254-0
* One additional tenant can be added by editing `providers.yml` and starting access layer—**no worker code changes**. ^ref-54382370-255-0
* Docs updated: `docs/agents.md`, `docs/providers.md`, `docs/topics.md`.

---
 ^ref-54382370-259-0
If Codex needs stubs, generate them; keep imports on **@shared/ts/dist/**. Prefer Zod for runtime validation. Keep tests deterministic; record sample Discord payloads as fixtures.
 ^ref-54382370-261-0
\#hashtags
\#promethean #codex-task #migration #multi-provider #multi-tenant #discord #access-layer #event-driven #policy #observability #typescript #broker #refactor
     bot_token: ${DISCORD_TOKEN_DUCK}
        app_id: "123..."
      allow:
        guilds: ["111111111111111111"]
        channels: ["*"]
      storage:
        mongo_db: "promethean_discord_duck"
        chroma_ns: "discord__duck"
  ```
^ref-54382370-113-0 ^ref-54382370-127-0
 ^ref-54382370-128-0
* Add loader + schema validation (zod).

### 3) Discord access layer
 ^ref-54382370-132-0
* **discord-rest**:

  * Fastify service consuming `promethean.p.discord.t.<tenant>.rest.request`. ^ref-54382370-135-0
  * Global **bucket map** + `retry_after_ms` handling. ^ref-54382370-136-0
  * Emits `...rest.response` with `ok`, `status`, `bucket`, `retry_after_ms`. ^ref-54382370-137-0
  * Handles `PostMessage` command: map to `POST /channels/{id}/messages`. ^ref-54382370-138-0
* **discord-gateway**:
 ^ref-54382370-140-0
  * WS gateway with intents; normalize `MESSAGE_CREATE` into `SocialMessageCreated`. ^ref-54382370-141-0
  * Emit raw event topic **and** normalized event. ^ref-54382370-142-0
  * Health pings (seq, ping, shard).
 ^ref-54382370-144-0
**Tests:** simulate rate-limit, reconnect, normalized payload snapshot.

### 4) Domain workers refactor (tokenless)
 ^ref-54382370-148-0
* Replace Discord SDK calls with:
 ^ref-54382370-150-0
  * publish `rest.request` and await `rest.response` (corr id). ^ref-54382370-151-0
* Consume `SocialMessageCreated` instead of raw payloads where possible. ^ref-54382370-152-0
* Indexers upsert on `{ provider, tenant, foreign_id }`. ^ref-54382370-153-0
* Embedders write to `<provider>__<tenant>__*` collections.
* `cephalon-discord` produces `PostMessage` instead of calling SDK.
 ^ref-54382370-156-0
**Tests:** golden tests: event → DB upsert; text → PostMessage; attachment hashing.

### 5) Storage & embeddings
 ^ref-54382370-160-0
* Migrations:
 ^ref-54382370-162-0
  * Add compound unique indexes (`provider`,`tenant`,`foreign_id`).
  * Rename/alias existing collections & chroma namespaces.
* Backfill jobs remain; now publish to `promethean.p.discord.t.<tenant>.jobs.backfill.messages.enqueue`.
 ^ref-54382370-166-0
**Tests:** verify uniqueness, namespace selection from tenant registry.

### 6) PM2 & env
 ^ref-54382370-170-0
* `ecosystem.discord.js` to spawn per-tenant access agents using `TENANTS` env or reading `providers.yml`.
* Ensure workers start once, access layer per tenant.

### 7) CI & lint rules
 ^ref-54382370-175-0
* Add secret-leak guard:
 ^ref-54382370-177-0
  * Grep for `DISCORD_TOKEN|CLIENT_SECRET|REFRESH_TOKEN` outside `services/ts/discord-*/` and `providers.yml`.
  * Fail build on matches. ^ref-54382370-179-0
* Type-check ensures all publishes include `provider`, `tenant`.

---

## File/Dir Changes (relative to repo root)
 ^ref-54382370-185-0
* `shared/ts/src/agent-envelope.ts` (update) ^ref-54382370-186-0
* `shared/ts/src/topic.ts` (new) ^ref-54382370-187-0
* `shared/ts/src/events.ts` (new) ^ref-54382370-188-0
* `shared/ts/src/urn.ts` (new) ^ref-54382370-189-0
* `shared/ts/src/provider-registry.ts` (new) ^ref-54382370-190-0
* `shared/ts/src/policy.ts` (new) ^ref-54382370-191-0
* `shared/ts/src/effects.ts` (new) ^ref-54382370-192-0
* `services/ts/discord-rest/` (new) ^ref-54382370-193-0
* `services/ts/discord-gateway/` (new) ^ref-54382370-194-0
* `services/ts/discord-message-indexer/` (refactor) ^ref-54382370-195-0
* `services/ts/discord-attachment-indexer/` (refactor) ^ref-54382370-196-0
* `services/ts/discord-message-embedder/` (refactor) ^ref-54382370-197-0
* `services/ts/attachment-embedder/` (refactor) ^ref-54382370-198-0
* `services/ts/cephalon-discord/` (refactor)
* `config/providers.yml` (new)
* `ecosystem.discord.js` (new) ^ref-54382370-201-0
* DB migrations: scripts under `scripts/migrate/2025-08-provider-tenant/`

---

## Test Plan
 ^ref-54382370-207-0
* **Unit:** shared helpers, topic, URN, policy checks. ^ref-54382370-208-0
* **Integration (mocked):** gateway emits normalized event → indexer upserts; cephalon publishes `PostMessage` → rest proxy receives correct route/body. ^ref-54382370-209-0
* **E2E (dev env):** run gateway against Discord test guild; verify:
 ^ref-54382370-211-0
  * live messages appear in `messages` (provider+tenant fields) ^ref-54382370-212-0
  * embeddings land in namespaced collections ^ref-54382370-213-0
  * replying via `PostMessage` posts in channel ^ref-54382370-214-0
* **Performance:** ensure rest proxy honors buckets; no 429 storm under backfill.

---

## Risks & Mitigations
 ^ref-54382370-220-0
* **Token leak** → CI grep + codeowners review on `providers.yml`. ^ref-54382370-221-0
* **Rate-limit regressions** → Bucket map with circuit breaker; exponential backoff. ^ref-54382370-222-0
* **Schema drift** → Versioned envelope; golden tests for normalized events. ^ref-54382370-223-0
* **Backfill overload** → Queue with max concurrency per tenant; sleep on `retry_after_ms`.

---

## Rollback Plan
 ^ref-54382370-229-0
* Keep old Discord worker processes & direct SDK code behind a feature flag `DISCORD_LEGACY=true`.
* Migration is reversible by switching topics back and disabling access layer. ^ref-54382370-231-0
* DB migrations add **new indexes and collections**; do **not** drop old until cutover verified.

---

## Milestones (suggested commits)
 ^ref-54382370-237-0
1. **M1:** Shared types + envelope + topics (+ tests). ^ref-54382370-238-0
2. **M2:** Provider registry + providers.yml + policy gate. ^ref-54382370-239-0
3. **M3:** discord-rest proxy (green tests). ^ref-54382370-240-0
4. **M4:** discord-gateway normalizer (green tests). ^ref-54382370-241-0
5. **M5:** Refactor indexers/embedders → tokenless (unit + integration tests). ^ref-54382370-242-0
6. **M6:** cephalon-discord → PostMessage path (integration test). ^ref-54382370-243-0
7. **M7:** Schema migrations + embeddings namespaces. ^ref-54382370-244-0
8. **M8:** PM2 wiring + E2E on dev guild. ^ref-54382370-245-0
9. **M9:** CI secret guard + docs.

---

## Definition of Done (DoD)
 ^ref-54382370-251-0
* No service outside `discord-*` has access to Discord tokens nor imports Discord SDK. ^ref-54382370-252-0
* **All** Discord traffic (in/out) flows via the bus topics with `provider` and `tenant`. ^ref-54382370-253-0
* Normalized event & command types are documented and enforced in code. ^ref-54382370-254-0
* One additional tenant can be added by editing `providers.yml` and starting access layer—**no worker code changes**. ^ref-54382370-255-0
* Docs updated: `docs/agents.md`, `docs/providers.md`, `docs/topics.md`.

---
 ^ref-54382370-259-0
If Codex needs stubs, generate them; keep imports on **@shared/ts/dist/**. Prefer Zod for runtime validation. Keep tests deterministic; record sample Discord payloads as fixtures.
 ^ref-54382370-261-0
\#hashtags
\#promethean #codex-task #migration #multi-provider #multi-tenant #discord #access-layer #event-driven #policy #observability #typescript #broker #refactor
