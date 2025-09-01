---
uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
created_at: 2025.08.26.11.08.00.md
filename: Promethean Agent Config DSL
description: >-
  Composable, declarative agent definitions using homoiconic S-expressions.
  Supports runtime compilation into PM2, Docker, or Node processes with explicit
  permissions and observability.
tags:
  - agent
  - config
  - dsl
  - s-expression
  - homoiconic
  - composable
  - permissions
  - runtime
  - observability
related_to_title:
  - Migrate to Provider-Tenant Architecture
  - Cross-Target Macro System in Sibilant
  - js-to-lisp-reverse-compiler
  - Dynamic Context Model for Web Components
  - Promethean Event Bus MVP v0.1
  - AI-Centric OS with MCP Layer
  - Lisp-Compiler-Integration
  - sibilant-meta-string-templating-runtime
  - Promethean Agent DSL TS Scaffold
  - Prometheus Observability Stack
  - Cross-Language Runtime Polymorphism
  - Chroma Toolkit Consolidation Plan
  - api-gateway-versioning
  - plan-update-confirmation
  - field-interaction-equations
  - Board Walk – 2025-08-11
  - lisp-dsl-for-window-management
  - polymorphic-meta-programming-engine
  - Shared Package Structure
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Interop and Source Maps
  - Event Bus MVP
  - Language-Agnostic Mirror System
  - compiler-kit-foundations
  - Event Bus Projections Architecture
  - Per-Domain Policy System for JS Crawler
  - Promethean-native config design
  - sibilant-macro-targets
  - sibilant-metacompiler-overview
  - Sibilant Meta-Prompt DSL
  - set-assignment-in-lisp-ast
related_to_uuid:
  - 54382370-1931-4a19-a634-46735708a9ea
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 58191024-d04a-4520-8aae-a18be7b94263
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - af5d2824-faad-476c-a389-e912d9bc672c
  - c5fba0a0-9196-468d-a0f3-51c99e987263
references: []
---
# Promethean Agent Config DSL (S‑Expr) — Draft v1

> Composable, declarative agent definitions in homoiconic S‑expressions. Clean layering, zero YAML, built to compile into runtime artifacts (PM2, env, Make/Hy hooks, OpenAPI tool specs) and readable by `prom run agent`.

---

## Design Goals

* **Composable building blocks**: small, importable blocks that assemble into a full agent.
* **Runtime‑agnostic**: compile to PM2 ecosystem, Docker, or direct Node processes.
* **Homoiconic**: configurations are code; allow macros, conditionals, and versioned schemas.
* **Deterministic & auditable**: no implicit magic; explicit references to services, prompts, and permissions.
* **Permissions‑first** (Circuit‑2): every capability must be declared and gated.

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
     :CHROMA_URL    "http://localhost:8000"
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

---

## Blocks (Composable Modules)

Blocks define reusable capability bundles. They compile into concrete service requirements, env, permissions, and runtime links.

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
```

> **Note:** `:$param` references are parameter substitutions bound by `(use ... :with {...})` at compose time.

---

## Namespaces & Imports

```lisp
(ns agent.dsl.v1
  (:import [blocks.discord :as discord]
           [blocks.voice :as voice]
           [blocks.cephalon :as ceph]))
```

* Files live under `agents/` and `blocks/` with predictable `ns` → path mapping.
* Blocks are versioned: `discord.bot/v1`. New majors don’t break existing agents.

---

## Schema & Validation (Spec‑like)

Define specs for forms and validate at compile time.

```lisp
(defschema :agent
  {:id keyword :name string :version string
   :tags [keyword] :owner string
   :children [:use :env :perm :topology :hooks :metrics]})

(defschema :block
  {:docs string :requires [:services] :parameters map? :exports [keyword]})

(validate agent.dsl.v1/agent my-agent-form)
```

Validation errors produce precise paths and messages (no silent failures).

---

## Codegen Targets

`prom build agent :duck` emits:

* `dist/agents/duck/ecosystem.config.mjs` (PM2)
* `dist/agents/duck/.env` (merged env with secrets placeholders resolved)
* `dist/agents/duck/permissions.json` (runtime guard for fs/net/gpu/proc)
* `dist/agents/duck/topology.json` (wiring map for UI/debugger)
* optional: `docker-compose.yml`, `k8s/*.yaml` if requested

```lisp
(target pm2/v1
  (emit-ecosystem
    (from (topology procs))
    (env  (merge (env) (block-envs)))
    (start (map proc->pm2 procs))))
```

---

## Permissions (Circuit‑2 Bridge)

```lisp
(perm
  (fs :read ["/data/**"])            ; glob support
  (fs :write ["/logs/**"])
  (net :egress ["*.discord.com" "localhost:*"])
  (gpu :allow true)
  (proc :spawn [:llm :stt :tts]))
```

A runtime guard reads `permissions.json` and enforces at process‑spawn and during capability use.

---

## Hooks & Tasks

Hooks resolve to task definitions that can be implemented in Hy/Sibilant/TS. Tasks are named and discoverable.

```lisp
(taskdef :heartbeat/report
  :exec (ts "services/ts/heartbeat/report.ts")
  :args {:agent :$agent-id})

(hooks
  (init (task :hydrate-context :from "docs/agents/duck/seed"))
  (tick (interval :seconds 30 (task :heartbeat/report)))
  (exit (task :flush-logs)))
```

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
  (env {:DISCORD_TOKEN (secret :discord/timmy)})
  (perm (net :egress ["*.discord.com" "*.openai.com"]))
  (topology
    (link :from :discord :to :cephalon :via :ws)
    (link :from :discord :to :voice    :via :ws))
)
```

Compile & run:

```bash
prom build agent :timmy
prom run agent :timmy
```

---

## Macro Layer (Sibilant‑style sugar)

```lisp
(defmacro with-secret [k] `(secret ~k))

(defmacro defagent [id & body]
  `(agent :id ~id :version "1.0.0" ~@body))

(defmacro compose [ & blocks]
  `(do ~@blocks))
```

---

## Mermaid: From DSL → Runtime

```mermaid
flowchart LR
  A[agent.sx] --> B[DSL Parser]
  B --> C[Validator/Specs]
  C --> D[Resolver\n(block params, secrets, imports)]
  D --> E[Codegen]
  E --> F[PM2 ecosystem]
  E --> G[.env]
  E --> H[permissions.json]
  E --> I[topology.json]
  F --> J[`prom run agent`]
  G --> J
  H --> J
  I --> J
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
  parser.ts        # small reader to S‑expr AST
  spec.ts          # schemas & validation
  codegen/
    pm2.ts
    docker.ts
    k8s.ts
/runtime
  guard/permissions.ts
  runner.ts        # `prom run agent` entry
```

---

## Next Steps (MVP Cut)

1. **Reader/Parser**: S‑expr → JS AST (use existing reader or small PEG; simple first).
2. **Spec/Validation**: define `:agent`, `:block`, `:perm`, `:topology` specs.
3. **Block Registry**: load `blocks/**.sx`, resolve `(use ...)` with params.
4. **Codegen: PM2 + .env + permissions.json + topology.json**.
5. **Runner**: `prom run agent :<id>` loads dist artifacts, enforces permissions, spawns procs, wires WS.
6. **Examples**: Duck + Timmy using 3 starter blocks above.

---

## Open Questions

* Secret resolution backend: env, file, or Vault? Provide adapters.
* Live reload of topology on block update? (hot‑swap vs restart)
* Multi‑tenancy overlays: `(overlay :discord {...})` vs multiple `(use discord.bot/v1 ...)` forms.
* How do we describe **tools** (OpenAPI → tool specs) as composable blocks? (likely `(use tools/openapi/v1 :with {:spec ".../openapi.json"})`).

---

*End Draft v1 — ready for iteration.*<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Shared Package Structure](shared-package-structure.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
