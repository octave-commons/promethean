---
uuid: 488f2016-a9f4-44e2-b66f-f9b9d888164c
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
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - fc21f824-4244-4030-a48e-c4170160ea1d
related_to_title:
  - Per-Domain Policy System for JS Crawler
  - Prompt_Folder_Bootstrap
  - eidolon-field-math-foundations
  - Chroma Toolkit Consolidation Plan
  - Stateful Partitions and Rebalancing
  - Unique Info Dump Index
  - schema-evolution-workflow
  - homeostasis-decay-formulas
  - Dynamic Context Model for Web Components
  - Debugging Broker Connections and Agent Behavior
  - Factorio AI with External Agents
  - graph-ds
  - plan-update-confirmation
  - Promethean Documentation Pipeline Overview
  - Performance-Optimized-Polyglot-Bridge
  - i3-bluetooth-setup
  - field-dynamics-math-blocks
  - windows-tiling-with-autohotkey
  - field-interaction-equations
  - eidolon-node-lifecycle
  - Eidolon Field Abstract Model
  - Model Selection for Lightweight Conversational Tasks
  - DuckDuckGoSearchPipeline
  - Duck's Self-Referential Perceptual Loop
  - Fnord Tracer Protocol
references:
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 590
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 574
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 604
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 131
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 107
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 38
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 407
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 538
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 11
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 85
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 64
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 153
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 51
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 79
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 77
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 115
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 61
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 212
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 150
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 56
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 53
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 52
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 71
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 99
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 9
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 117
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 58
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 82
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 67
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 66
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 113
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 469
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 270
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 99
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 80
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 216
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 189
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 371
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 141
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 222
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 107
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 28
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 65
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 86
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 123
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 34
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 442
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 218
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 176
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 70
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 35
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 94
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 53
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 424
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 209
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 142
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 75
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 46
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 64
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 40
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 82
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 454
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 412
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 261
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 181
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 90
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 157
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 205
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 203
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 95
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 33
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 99
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 46
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 10
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 148
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 36
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 166
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 148
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 153
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 118
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 168
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 103
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 380
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 194
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 50
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 89
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 32
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 49
    col: 0
    score: 1
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

^ref-54382370-402-0
^ref-54382370-388-0
^ref-54382370-382-0
^ref-54382370-375-0 ^ref-54382370-414-0
^ref-54382370-367-0
^ref-54382370-343-0
^ref-54382370-342-0 ^ref-54382370-417-0
^ref-54382370-333-0
^ref-54382370-314-0
^ref-54382370-308-0
^ref-54382370-298-0 ^ref-54382370-603-0 ^ref-54382370-632-0 ^ref-54382370-633-0 ^ref-54382370-1141-0 ^ref-54382370-1575-0 ^ref-54382370-2637-0 ^ref-54382370-2808-0 ^ref-54382370-3518-0 ^ref-54382370-4577-0 ^ref-54382370-5262-0 ^ref-54382370-5661-0 ^ref-54382370-6292-0 ^ref-54382370-6597-0 ^ref-54382370-6907-0 ^ref-54382370-7484-0 ^ref-54382370-8353-0 ^ref-54382370-9631-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [graph-ds](graph-ds.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [field-interaction-equations](field-interaction-equations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
## Sources
- [Pure TypeScript Search Microservice — L590](pure-typescript-search-microservice.md#^ref-d17d3a96-590-0) (line 590, col 0, score 1)
- [schema-evolution-workflow — L574](schema-evolution-workflow.md#^ref-d8059b6a-574-0) (line 574, col 0, score 1)
- [Stateful Partitions and Rebalancing — L604](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-604-0) (line 604, col 0, score 1)
- [The Jar of Echoes — L131](the-jar-of-echoes.md#^ref-18138627-131-0) (line 131, col 0, score 1)
- [Tracing the Signal — L107](tracing-the-signal.md#^ref-c3cd4f65-107-0) (line 107, col 0, score 1)
- [ts-to-lisp-transpiler — L38](ts-to-lisp-transpiler.md#^ref-ba11486b-38-0) (line 38, col 0, score 1)
- [typed-struct-compiler — L407](typed-struct-compiler.md#^ref-78eeedf7-407-0) (line 407, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L538](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-538-0) (line 538, col 0, score 1)
- [Unique Concepts — L11](unique-concepts.md#^ref-ed6f3fc9-11-0) (line 11, col 0, score 1)
- [Docops Feature Updates — L85](docops-feature-updates-3.md#^ref-cdbd21ee-85-0) (line 85, col 0, score 1)
- [Duck's Attractor States — L93](ducks-attractor-states.md#^ref-13951643-93-0) (line 93, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L64](ducks-self-referential-perceptual-loop.md#^ref-71726f04-64-0) (line 64, col 0, score 1)
- [Factorio AI with External Agents — L153](factorio-ai-with-external-agents.md#^ref-a4d90289-153-0) (line 153, col 0, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#^ref-7cfc230d-141-0) (line 141, col 0, score 1)
- [Creative Moments — L38](creative-moments.md#^ref-10d98225-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L51](docops-feature-updates-3.md#^ref-cdbd21ee-51-0) (line 51, col 0, score 1)
- [Docops Feature Updates — L79](docops-feature-updates.md#^ref-2792d448-79-0) (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77](duckduckgosearchpipeline.md#^ref-e979c50f-77-0) (line 77, col 0, score 1)
- [Duck's Attractor States — L115](ducks-attractor-states.md#^ref-13951643-115-0) (line 115, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L61](ducks-self-referential-perceptual-loop.md#^ref-71726f04-61-0) (line 61, col 0, score 1)
- [Eidolon Field Abstract Model — L212](eidolon-field-abstract-model.md#^ref-5e8b2388-212-0) (line 212, col 0, score 1)
- [eidolon-field-math-foundations — L150](eidolon-field-math-foundations.md#^ref-008f2ac0-150-0) (line 150, col 0, score 1)
- [Creative Moments — L8](creative-moments.md#^ref-10d98225-8-0) (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L56](docops-feature-updates-3.md#^ref-cdbd21ee-56-0) (line 56, col 0, score 1)
- [Creative Moments — L53](creative-moments.md#^ref-10d98225-53-0) (line 53, col 0, score 1)
- [Creative Moments — L52](creative-moments.md#^ref-10d98225-52-0) (line 52, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L71](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-71-0) (line 71, col 0, score 1)
- [DuckDuckGoSearchPipeline — L99](duckduckgosearchpipeline.md#^ref-e979c50f-99-0) (line 99, col 0, score 1)
- [Creative Moments — L9](creative-moments.md#^ref-10d98225-9-0) (line 9, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L117](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-117-0) (line 117, col 0, score 1)
- [Docops Feature Updates — L58](docops-feature-updates-3.md#^ref-cdbd21ee-58-0) (line 58, col 0, score 1)
- [Docops Feature Updates — L82](docops-feature-updates.md#^ref-2792d448-82-0) (line 82, col 0, score 1)
- [DuckDuckGoSearchPipeline — L67](duckduckgosearchpipeline.md#^ref-e979c50f-67-0) (line 67, col 0, score 1)
- [Duck's Attractor States — L66](ducks-attractor-states.md#^ref-13951643-66-0) (line 66, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L113](ducks-self-referential-perceptual-loop.md#^ref-71726f04-113-0) (line 113, col 0, score 1)
- [Dynamic Context Model for Web Components — L469](dynamic-context-model-for-web-components.md#^ref-f7702bf8-469-0) (line 469, col 0, score 1)
- [Eidolon Field Abstract Model — L270](eidolon-field-abstract-model.md#^ref-5e8b2388-270-0) (line 270, col 0, score 1)
- [Docops Feature Updates — L44](docops-feature-updates-3.md#^ref-cdbd21ee-44-0) (line 44, col 0, score 1)
- [Docops Feature Updates — L61](docops-feature-updates.md#^ref-2792d448-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L99](ducks-attractor-states.md#^ref-13951643-99-0) (line 99, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L80](ducks-self-referential-perceptual-loop.md#^ref-71726f04-80-0) (line 80, col 0, score 1)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#^ref-f7702bf8-405-0) (line 405, col 0, score 1)
- [Eidolon Field Abstract Model — L216](eidolon-field-abstract-model.md#^ref-5e8b2388-216-0) (line 216, col 0, score 1)
- [Factorio AI with External Agents — L189](factorio-ai-with-external-agents.md#^ref-a4d90289-189-0) (line 189, col 0, score 1)
- [field-interaction-equations — L172](field-interaction-equations.md#^ref-b09141b7-172-0) (line 172, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [heartbeat-fragment-demo — L141](heartbeat-fragment-demo.md#^ref-dd00677a-141-0) (line 141, col 0, score 1)
- [homeostasis-decay-formulas — L222](homeostasis-decay-formulas.md#^ref-37b5d236-222-0) (line 222, col 0, score 1)
- [i3-bluetooth-setup — L107](i3-bluetooth-setup.md#^ref-5e408692-107-0) (line 107, col 0, score 1)
- [Creative Moments — L28](creative-moments.md#^ref-10d98225-28-0) (line 28, col 0, score 1)
- [Docops Feature Updates — L65](docops-feature-updates-3.md#^ref-cdbd21ee-65-0) (line 65, col 0, score 1)
- [Docops Feature Updates — L86](docops-feature-updates.md#^ref-2792d448-86-0) (line 86, col 0, score 1)
- [Duck's Attractor States — L123](ducks-attractor-states.md#^ref-13951643-123-0) (line 123, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L34](ducks-self-referential-perceptual-loop.md#^ref-71726f04-34-0) (line 34, col 0, score 1)
- [Dynamic Context Model for Web Components — L442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-442-0) (line 442, col 0, score 1)
- [Eidolon Field Abstract Model — L218](eidolon-field-abstract-model.md#^ref-5e8b2388-218-0) (line 218, col 0, score 1)
- [eidolon-field-math-foundations — L176](eidolon-field-math-foundations.md#^ref-008f2ac0-176-0) (line 176, col 0, score 1)
- [eidolon-node-lifecycle — L70](eidolon-node-lifecycle.md#^ref-938eca9c-70-0) (line 70, col 0, score 1)
- [Docops Feature Updates — L35](docops-feature-updates.md#^ref-2792d448-35-0) (line 35, col 0, score 1)
- [Duck's Attractor States — L94](ducks-attractor-states.md#^ref-13951643-94-0) (line 94, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L53](ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0) (line 53, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Eidolon Field Abstract Model — L209](eidolon-field-abstract-model.md#^ref-5e8b2388-209-0) (line 209, col 0, score 1)
- [eidolon-field-math-foundations — L142](eidolon-field-math-foundations.md#^ref-008f2ac0-142-0) (line 142, col 0, score 1)
- [eidolon-node-lifecycle — L39](eidolon-node-lifecycle.md#^ref-938eca9c-39-0) (line 39, col 0, score 1)
- [Creative Moments — L75](creative-moments.md#^ref-10d98225-75-0) (line 75, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0) (line 104, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates-3.md#^ref-cdbd21ee-46-0) (line 46, col 0, score 1)
- [Docops Feature Updates — L64](docops-feature-updates.md#^ref-2792d448-64-0) (line 64, col 0, score 1)
- [DuckDuckGoSearchPipeline — L40](duckduckgosearchpipeline.md#^ref-e979c50f-40-0) (line 40, col 0, score 1)
- [Duck's Attractor States — L137](ducks-attractor-states.md#^ref-13951643-137-0) (line 137, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L82](ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0) (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L454](dynamic-context-model-for-web-components.md#^ref-f7702bf8-454-0) (line 454, col 0, score 1)
- [Dynamic Context Model for Web Components — L412](dynamic-context-model-for-web-components.md#^ref-f7702bf8-412-0) (line 412, col 0, score 1)
- [Eidolon Field Abstract Model — L261](eidolon-field-abstract-model.md#^ref-5e8b2388-261-0) (line 261, col 0, score 1)
- [eidolon-field-math-foundations — L181](eidolon-field-math-foundations.md#^ref-008f2ac0-181-0) (line 181, col 0, score 1)
- [eidolon-node-lifecycle — L90](eidolon-node-lifecycle.md#^ref-938eca9c-90-0) (line 90, col 0, score 1)
- [Factorio AI with External Agents — L157](factorio-ai-with-external-agents.md#^ref-a4d90289-157-0) (line 157, col 0, score 1)
- [field-dynamics-math-blocks — L205](field-dynamics-math-blocks.md#^ref-7cfc230d-205-0) (line 205, col 0, score 1)
- [field-node-diagram-set — L203](field-node-diagram-set.md#^ref-22b989d5-203-0) (line 203, col 0, score 1)
- [field-node-diagram-visualizations — L95](field-node-diagram-visualizations.md#^ref-e9b27b06-95-0) (line 95, col 0, score 1)
- [Creative Moments — L33](creative-moments.md#^ref-10d98225-33-0) (line 33, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L99](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-99-0) (line 99, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates.md#^ref-2792d448-46-0) (line 46, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Factorio AI with External Agents — L166](factorio-ai-with-external-agents.md#^ref-a4d90289-166-0) (line 166, col 0, score 1)
- [field-dynamics-math-blocks — L148](field-dynamics-math-blocks.md#^ref-7cfc230d-148-0) (line 148, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [field-node-diagram-outline — L118](field-node-diagram-outline.md#^ref-1f32c94a-118-0) (line 118, col 0, score 1)
- [field-node-diagram-set — L168](field-node-diagram-set.md#^ref-22b989d5-168-0) (line 168, col 0, score 1)
- [field-node-diagram-visualizations — L103](field-node-diagram-visualizations.md#^ref-e9b27b06-103-0) (line 103, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L380](functional-embedding-pipeline-refactor.md#^ref-a4a25141-380-0) (line 380, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L194](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-194-0) (line 194, col 0, score 1)
- [Creative Moments — L50](creative-moments.md#^ref-10d98225-50-0) (line 50, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L89](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-89-0) (line 89, col 0, score 1)
- [Docops Feature Updates — L32](docops-feature-updates-3.md#^ref-cdbd21ee-32-0) (line 32, col 0, score 1)
- [Docops Feature Updates — L49](docops-feature-updates.md#^ref-2792d448-49-0) (line 49, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
