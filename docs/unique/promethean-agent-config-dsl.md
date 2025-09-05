---
uuid: cd8f10e6-68d7-4b29-bdfd-3a6614d99229
created_at: promethean-agent-config-dsl.md
filename: promethean-agent-config-dsl
title: promethean-agent-config-dsl
description: >-
  Composable, declarative agent definitions using homoiconic S-expressions.
  Supports runtime compilation into PM2, Docker, and Node processes with
  explicit permissions and observability.
tags:
  - s-expression
  - agent-config
  - homoiconic
  - composable
  - runtime-agnostic
  - permissions-first
  - observability
---
# Promethean Agent Config DSL (S‑Expr) — Draft v1

> Composable, declarative agent definitions in homoiconic S‑expressions. Clean layering, zero YAML, built to compile into runtime artifacts (PM2, env, Make/Hy hooks, OpenAPI tool specs) and readable by `prom run agent`. ^ref-2c00ce45-3-0

---

## Design Goals

* **Composable building blocks**: small, importable blocks that assemble into a full agent. ^ref-2c00ce45-9-0
* **Runtime‑agnostic**: compile to PM2 ecosystem, Docker, or direct Node processes. ^ref-2c00ce45-10-0
* **Homoiconic**: configurations are code; allow macros, conditionals, and versioned schemas. ^ref-2c00ce45-11-0
* **Deterministic & auditable**: no implicit magic; explicit references to services, prompts, and permissions. ^ref-2c00ce45-12-0
* **Permissions‑first** (Circuit‑2): every capability must be declared and gated. ^ref-2c00ce45-13-0

---

## Core Forms (Minimal Surface)

```lisp
(ns agent.dsl.v1)

;; Declare an agent with a unique id (slug), human name, and metadata
(agent
  :id duck
  :name "Duck"
  :version "1.0.0"
  :tags [#discord #voice #cephalon]
  :owner "err"

  ;; Import composable building blocks (see Blocks below)
  (use discord.bot/v1 :with {:intents [:guilds :voice] :presence "online"})
  (use voice.pipeline/v1 :with {:stt :whisper-openvino :tts :kokoro})
  (use cephalon.client/v1 :with {:model :qwen3-code :context "promethean"})

  ;; Agent‑scoped env and secrets (resolved from secret store or .env)
  (env
    {:DISCORD_TOKEN (secret :discord/duck)
     :CHROMA_URL    "
     :MONGO_URI     (secret :mongo/main)})

  ;; Permissions (explicit allowlist)
  (perm
    (fs :read ["/data/promethean" "/logs"])
    (net :egress ["*.discord.com" "localhost:*" "*.twitch.tv"])
    (gpu :allow true)
    (proc :spawn [:llm :stt :tts]))

  ;; Runtime topology: which processes to spawn and how they connect
  (topology
    (proc :name :cephalon :service services/ts/cephalon :args {:port 7450})
    (proc :name :voice    :service services/ts/voice    :args {:stt "whisper"})
    (proc :name :discord  :service services/ts/discord  :args {:agent :duck})
    (link :from :discord :to :cephalon :via :ws)
    (link :from :discord :to :voice    :via :ws))

  ;; Lifecycle hooks
  (hooks
    (init   (task :hydrate-context :from "docs/agents/duck/seed"))
    (tick   (interval :seconds 30 (task :heartbeat/report)))
    (exit   (task :flush-logs)))

  ;; Observability (wires to heartbeat service)
  (metrics
    (scrape :from [:cephalon :voice :discord] :interval 15))
)
```
^ref-2c00ce45-19-0

---

## Blocks (Composable Modules)
 ^ref-2c00ce45-72-0
Blocks define reusable capability bundles. They compile into concrete service requirements, env, permissions, and runtime links.
 ^ref-2c00ce45-74-0
```lisp
(block discord.bot/v1
  :docs "Discord bot process with gateway intents and voice support"
  (requires :services [:discord])
  (exports :capabilities [:gateway :slash-commands :voice])
  (parameters {:intents [:guilds] :presence "online"})
  (env {:DISCORD_TOKEN (secret :discord/default)})
  (perm (net :egress ["*.discord.com"]))
  (topology (proc :name :discord :service services/ts/discord))
)

(block voice.pipeline/v1
  :docs "STT→LLM→TTS pipeline over WebSocket"
  (parameters {:stt :whisper :tts :kokoro})
  (requires :services [:voice :llm])
  (exports :streams [:pcm :opus])
  (topology
    (proc :name :voice :service services/ts/voice :args {:stt :$stt :tts :$tts}))
)

(block cephalon.client/v1
  :docs "LLM client and routing to Promethean Cephalon"
  (parameters {:model :qwen3-code :context "default"})
  (requires :services [:cephalon])
  (env {:CEPHALON_URL "ws://localhost:7450"})
  (topology (proc :name :cephalon :service services/ts/cephalon :args {:model :$model}))
)
^ref-2c00ce45-74-0
``` ^ref-2c00ce45-103-0

> **Note:** `:$param` references are parameter substitutions bound by `(use ... :with {...})` at compose time.

---

## Namespaces & Imports ^ref-2c00ce45-109-0

```lisp
(ns agent.dsl.v1
  (:import [blocks.discord :as discord]
           [blocks.voice :as voice]
^ref-2c00ce45-109-0
           [blocks.cephalon :as ceph])) ^ref-2c00ce45-116-0
``` ^ref-2c00ce45-117-0

* Files live under `agents/` and `blocks/` with predictable `ns` → path mapping.
* Blocks are versioned: `discord.bot/v1`. New majors don’t break existing agents.

---
 ^ref-2c00ce45-123-0
## Schema & Validation (Spec‑like)
 ^ref-2c00ce45-125-0
Define specs for forms and validate at compile time.

```lisp
(defschema :agent
  {:id keyword :name string :version string
   :tags [keyword] :owner string
   :children [:use :env :perm :topology :hooks :metrics]})

(defschema :block
  {:docs string :requires [:services] :parameters map? :exports [keyword]})
^ref-2c00ce45-125-0
 ^ref-2c00ce45-137-0
(validate agent.dsl.v1/agent my-agent-form)
```

Validation errors produce precise paths and messages (no silent failures).

--- ^ref-2c00ce45-143-0

## Codegen Targets ^ref-2c00ce45-145-0
 ^ref-2c00ce45-146-0
`prom build agent :duck` emits: ^ref-2c00ce45-147-0
 ^ref-2c00ce45-148-0
* `dist/agents/duck/ecosystem.config.mjs` (PM2) ^ref-2c00ce45-149-0
* `dist/agents/duck/.env` (merged env with secrets placeholders resolved)
* `dist/agents/duck/permissions.json` (runtime guard for fs/net/gpu/proc) ^ref-2c00ce45-151-0
* `dist/agents/duck/topology.json` (wiring map for UI/debugger)
* optional: `docker-compose.yml`, `k8s/*.yaml` if requested

```lisp
(target pm2/v1
  (emit-ecosystem
^ref-2c00ce45-151-0
    (from (topology procs))
    (env  (merge (env) (block-envs)))
    (start (map proc->pm2 procs))))
```
 ^ref-2c00ce45-163-0
---

## Permissions (Circuit‑2 Bridge)

```lisp
(perm
  (fs :read ["/data/**"])            ; glob support
^ref-2c00ce45-163-0
  (fs :write ["/logs/**"]) ^ref-2c00ce45-172-0
  (net :egress ["*.discord.com" "localhost:*"])
  (gpu :allow true)
  (proc :spawn [:llm :stt :tts]))
```

A runtime guard reads `permissions.json` and enforces at process‑spawn and during capability use. ^ref-2c00ce45-178-0

--- ^ref-2c00ce45-180-0

## Hooks & Tasks

Hooks resolve to task definitions that can be implemented in Hy/Sibilant/TS. Tasks are named and discoverable.

```lisp
(taskdef :heartbeat/report
  :exec (ts "services/ts/heartbeat/report.ts")
  :args {:agent :$agent-id})
^ref-2c00ce45-180-0

(hooks
  (init (task :hydrate-context :from "docs/agents/duck/seed"))
  (tick (interval :seconds 30 (task :heartbeat/report)))
  (exit (task :flush-logs)))
```
^ref-2c00ce45-195-0

---

## Example: Composing a New Agent (Timmy)

```lisp
(ns agents.timmy)

(agent
  :id timmy
  :name "Timmy"
  :version "0.2.0"
  :tags [#discord #indexer]
  (use discord.bot/v1)
  (use cephalon.client/v1 :with {:model :llama3.1-8b :context "timmy"})
  (use voice.pipeline/v1 :with {:stt :whisper-openvino :tts :kokoro})
^ref-2c00ce45-195-0
  (env {:DISCORD_TOKEN (secret :discord/timmy)}) ^ref-2c00ce45-214-0
  (perm (net :egress ["*.discord.com" "*.openai.com"]))
  (topology
    (link :from :discord :to :cephalon :via :ws)
    (link :from :discord :to :voice    :via :ws))
)
^ref-2c00ce45-214-0
```
^ref-2c00ce45-214-0

Compile & run: ^ref-2c00ce45-225-0

```bash
prom build agent :timmy
^ref-2c00ce45-225-0
prom run agent :timmy
```

---

## Macro Layer (Sibilant‑style sugar)

```lisp
^ref-2c00ce45-225-0
(defmacro with-secret [k] `(secret ~k))

(defmacro defagent [id & body]
  `(agent :id ~id :version "1.0.0" ~@body))

^ref-2c00ce45-239-0
(defmacro compose [ & blocks]
  `(do ~@blocks))
^ref-2c00ce45-239-0
```
^ref-2c00ce45-239-0

---

## Mermaid: From DSL → Runtime

```mermaid
flowchart LR
  A[agent.sx] --> B[DSL Parser]
  B --> C[Validator/Specs]
  C --> D[Resolver\n(block params, secrets, imports)]
  D --> E[Codegen]
^ref-2c00ce45-239-0
  E --> F[PM2 ecosystem]
  E --> G[.env]
  E --> H[permissions.json]
  E --> I[topology.json]
  F --> J[`prom run agent`]
^ref-2c00ce45-259-0
  G --> J
  H --> J
^ref-2c00ce45-259-0
  I --> J
^ref-2c00ce45-259-0
```

---

## File Layout (Proposal)

```
/agents
  /duck
    agent.sx
    prompts/
    seed/
  /timmy
    agent.sx
/blocks
  discord.sx
  voice.sx
  cephalon.sx
/dsl
  core.sx
^ref-2c00ce45-259-0
  parser.ts        # small reader to S‑expr AST
  spec.ts          # schemas & validation
  codegen/
    pm2.ts
    docker.ts ^ref-2c00ce45-288-0
^ref-2c00ce45-293-0
^ref-2c00ce45-292-0
^ref-2c00ce45-291-0
^ref-2c00ce45-290-0
^ref-2c00ce45-289-0
^ref-2c00ce45-288-0 ^ref-2c00ce45-299-0
    k8s.ts ^ref-2c00ce45-289-0 ^ref-2c00ce45-300-0
/runtime ^ref-2c00ce45-290-0 ^ref-2c00ce45-301-0
^ref-2c00ce45-302-0
^ref-2c00ce45-301-0 ^ref-2c00ce45-306-0
^ref-2c00ce45-300-0
^ref-2c00ce45-299-0
^ref-2c00ce45-293-0
^ref-2c00ce45-292-0
^ref-2c00ce45-291-0 ^ref-2c00ce45-311-0
^ref-2c00ce45-290-0
^ref-2c00ce45-289-0
^ref-2c00ce45-288-0
  guard/permissions.ts ^ref-2c00ce45-291-0 ^ref-2c00ce45-302-0
^ref-2c00ce45-316-0
^ref-2c00ce45-311-0
^ref-2c00ce45-306-0
^ref-2c00ce45-302-0 ^ref-2c00ce45-321-0
^ref-2c00ce45-301-0
^ref-2c00ce45-300-0
^ref-2c00ce45-299-0
^ref-2c00ce45-293-0
^ref-2c00ce45-292-0 ^ref-2c00ce45-326-0
^ref-2c00ce45-291-0
^ref-2c00ce45-290-0
^ref-2c00ce45-289-0 ^ref-2c00ce45-329-0
^ref-2c00ce45-288-0
^ref-2c00ce45-277-0
  runner.ts        # `prom run agent` entry ^ref-2c00ce45-292-0 ^ref-2c00ce45-316-0
``` ^ref-2c00ce45-293-0 ^ref-2c00ce45-333-0
^ref-2c00ce45-279-0

--- ^ref-2c00ce45-306-0

## Next Steps (MVP Cut) ^ref-2c00ce45-321-0
 ^ref-2c00ce45-338-0
1. **Reader/Parser**: S‑expr → JS AST (use existing reader or small PEG; simple first). ^ref-2c00ce45-299-0
2. **Spec/Validation**: define `:agent`, `:block`, `:perm`, `:topology` specs. ^ref-2c00ce45-300-0 ^ref-2c00ce45-311-0
3. **Block Registry**: load `blocks/**.sx`, resolve `(use ...)` with params. ^ref-2c00ce45-301-0
4. **Codegen: PM2 + .env + permissions.json + topology.json**. ^ref-2c00ce45-302-0 ^ref-2c00ce45-326-0
5. **Runner**: `prom run agent :<id>` loads dist artifacts, enforces permissions, spawns procs, wires WS.
6. **Examples**: Duck + Timmy using 3 starter blocks above.
 ^ref-2c00ce45-316-0 ^ref-2c00ce45-329-0
--- ^ref-2c00ce45-306-0

## Open Questions ^ref-2c00ce45-348-0
 ^ref-2c00ce45-333-0
* Secret resolution backend: env, file, or Vault? Provide adapters. ^ref-2c00ce45-321-0
* Live reload of topology on block update? (hot‑swap vs restart) ^ref-2c00ce45-311-0
* Multi‑tenancy overlays: `(overlay :discord {...})` vs multiple `(use discord.bot/v1 ...)` forms. ^ref-2c00ce45-352-0
* How do we describe **tools** (OpenAPI → tool specs) as composable blocks? (likely `(use tools/openapi/v1 :with {:spec ".../openapi.json"})`). ^ref-2c00ce45-353-0
 ^ref-2c00ce45-338-0
--- ^ref-2c00ce45-326-0
 ^ref-2c00ce45-316-0
*End Draft v1 — ready for iteration.*
