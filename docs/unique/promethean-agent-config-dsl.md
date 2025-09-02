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
related_to_title: []
related_to_uuid: []
references: []
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
- [aionian-circuit-math](aionian-circuit-math.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Window Management](chunks/window-management.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [archetype-ecs](archetype-ecs.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Services](chunks/services.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Diagrams](chunks/diagrams.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [EidolonField](eidolonfield.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Shared](chunks/shared.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean State Format](promethean-state-format.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Reawakening Duck](reawakening-duck.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [refactor-relations](refactor-relations.md)
- [Tracing the Signal](tracing-the-signal.md)
- [i3-layout-saver](i3-layout-saver.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
## Sources
- [lisp-dsl-for-window-management — L13](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-13-0) (line 13, col 0, score 0.63)
- [Promethean State Format — L13](promethean-state-format.md#^ref-23df6ddb-13-0) (line 13, col 0, score 0.68)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L627](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-627-0) (line 627, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L12](sibilant-meta-prompt-dsl.md#^ref-af5d2824-12-0) (line 12, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.67)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L330](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-330-0) (line 330, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L632](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-632-0) (line 632, col 0, score 0.7)
- [polymorphic-meta-programming-engine — L3](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-3-0) (line 3, col 0, score 0.68)
- [Voice Access Layer Design — L255](voice-access-layer-design.md#^ref-543ed9b3-255-0) (line 255, col 0, score 0.66)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L146](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-146-0) (line 146, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.64)
- [Recursive Prompt Construction Engine — L7](recursive-prompt-construction-engine.md#^ref-babdb9eb-7-0) (line 7, col 0, score 0.66)
- [pm2-orchestration-patterns — L11](pm2-orchestration-patterns.md#^ref-51932e7b-11-0) (line 11, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.65)
- [sibilant-macro-targets — L14](sibilant-macro-targets.md#^ref-c5c9a5c6-14-0) (line 14, col 0, score 0.65)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.64)
- [prompt-programming-language-lisp — L6](prompt-programming-language-lisp.md#^ref-d41a06d1-6-0) (line 6, col 0, score 0.64)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.69)
- [sibilant-meta-string-templating-runtime — L33](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-33-0) (line 33, col 0, score 0.79)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.67)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.67)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.66)
- [pm2-orchestration-patterns — L131](pm2-orchestration-patterns.md#^ref-51932e7b-131-0) (line 131, col 0, score 0.66)
- [pm2-orchestration-patterns — L26](pm2-orchestration-patterns.md#^ref-51932e7b-26-0) (line 26, col 0, score 0.66)
- [ripple-propagation-demo — L9](ripple-propagation-demo.md#^ref-8430617b-9-0) (line 9, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L30](migrate-to-provider-tenant-architecture.md#^ref-54382370-30-0) (line 30, col 0, score 0.78)
- [pm2-orchestration-patterns — L117](pm2-orchestration-patterns.md#^ref-51932e7b-117-0) (line 117, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L381](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-381-0) (line 381, col 0, score 0.64)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.66)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.69)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.68)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L120](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-120-0) (line 120, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L303](functional-embedding-pipeline-refactor.md#^ref-a4a25141-303-0) (line 303, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L179](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-179-0) (line 179, col 0, score 0.65)
- [Vectorial Exception Descent — L136](vectorial-exception-descent.md#^ref-d771154e-136-0) (line 136, col 0, score 0.69)
- [WebSocket Gateway Implementation — L52](websocket-gateway-implementation.md#^ref-e811123d-52-0) (line 52, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.61)
- [field-interaction-equations — L39](field-interaction-equations.md#^ref-b09141b7-39-0) (line 39, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L19](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-19-0) (line 19, col 0, score 0.61)
- [Voice Access Layer Design — L117](voice-access-layer-design.md#^ref-543ed9b3-117-0) (line 117, col 0, score 0.61)
- [Sibilant Meta-Prompt DSL — L1](sibilant-meta-prompt-dsl.md#^ref-af5d2824-1-0) (line 1, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.65)
- [promethean-system-diagrams — L181](promethean-system-diagrams.md#^ref-b51e19b4-181-0) (line 181, col 0, score 0.66)
- [Reawakening Duck — L60](reawakening-duck.md#^ref-59b5670f-60-0) (line 60, col 0, score 0.71)
- [Promethean-native config design — L368](promethean-native-config-design.md#^ref-ab748541-368-0) (line 368, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L104](migrate-to-provider-tenant-architecture.md#^ref-54382370-104-0) (line 104, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L287](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-287-0) (line 287, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L23](migrate-to-provider-tenant-architecture.md#^ref-54382370-23-0) (line 23, col 0, score 0.69)
- [Promethean-native config design — L336](promethean-native-config-design.md#^ref-ab748541-336-0) (line 336, col 0, score 0.68)
- [Voice Access Layer Design — L236](voice-access-layer-design.md#^ref-543ed9b3-236-0) (line 236, col 0, score 0.77)
- [Migrate to Provider-Tenant Architecture — L113](migrate-to-provider-tenant-architecture.md#^ref-54382370-113-0) (line 113, col 0, score 0.72)
- [pm2-orchestration-patterns — L149](pm2-orchestration-patterns.md#^ref-51932e7b-149-0) (line 149, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L798](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-798-0) (line 798, col 0, score 0.75)
- [Voice Access Layer Design — L17](voice-access-layer-design.md#^ref-543ed9b3-17-0) (line 17, col 0, score 0.74)
- [promethean-system-diagrams — L9](promethean-system-diagrams.md#^ref-b51e19b4-9-0) (line 9, col 0, score 0.71)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.7)
- [Voice Access Layer Design — L38](voice-access-layer-design.md#^ref-543ed9b3-38-0) (line 38, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L417](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-417-0) (line 417, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L518](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-518-0) (line 518, col 0, score 0.68)
- [promethean-system-diagrams — L95](promethean-system-diagrams.md#^ref-b51e19b4-95-0) (line 95, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L3](migrate-to-provider-tenant-architecture.md#^ref-54382370-3-0) (line 3, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L247](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-247-0) (line 247, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L138](migrate-to-provider-tenant-architecture.md#^ref-54382370-138-0) (line 138, col 0, score 0.67)
- [Layer1SurvivabilityEnvelope — L156](layer1survivabilityenvelope.md#^ref-64a9f9f9-156-0) (line 156, col 0, score 0.59)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L242](migrate-to-provider-tenant-architecture.md#^ref-54382370-242-0) (line 242, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.67)
- [Shared Package Structure — L122](shared-package-structure.md#^ref-66a72fc3-122-0) (line 122, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.66)
- [Promethean-native config design — L363](promethean-native-config-design.md#^ref-ab748541-363-0) (line 363, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L393](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-393-0) (line 393, col 0, score 0.64)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.66)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.64)
- [Voice Access Layer Design — L1](voice-access-layer-design.md#^ref-543ed9b3-1-0) (line 1, col 0, score 0.7)
- [Voice Access Layer Design — L106](voice-access-layer-design.md#^ref-543ed9b3-106-0) (line 106, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L209](migrate-to-provider-tenant-architecture.md#^ref-54382370-209-0) (line 209, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L83](migrate-to-provider-tenant-architecture.md#^ref-54382370-83-0) (line 83, col 0, score 0.7)
- [markdown-to-org-transpiler — L291](markdown-to-org-transpiler.md#^ref-ab54cdd8-291-0) (line 291, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L129](cross-language-runtime-polymorphism.md#^ref-c34c36a6-129-0) (line 129, col 0, score 0.66)
- [Docops Feature Updates — L13](docops-feature-updates-3.md#^ref-cdbd21ee-13-0) (line 13, col 0, score 0.63)
- [Docops Feature Updates — L30](docops-feature-updates.md#^ref-2792d448-30-0) (line 30, col 0, score 0.63)
- [polymorphic-meta-programming-engine — L146](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-146-0) (line 146, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.64)
- [Docops Feature Updates — L13](docops-feature-updates.md#^ref-2792d448-13-0) (line 13, col 0, score 0.63)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.62)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.64)
- [obsidian-ignore-node-modules-regex — L12](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-12-0) (line 12, col 0, score 0.67)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.67)
- [obsidian-ignore-node-modules-regex — L6](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-6-0) (line 6, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L393](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-393-0) (line 393, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L6](chroma-embedding-refactor.md#^ref-8b256935-6-0) (line 6, col 0, score 0.64)
- [Shared Package Structure — L154](shared-package-structure.md#^ref-66a72fc3-154-0) (line 154, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L296](chroma-embedding-refactor.md#^ref-8b256935-296-0) (line 296, col 0, score 0.63)
- [ecs-offload-workers — L443](ecs-offload-workers.md#^ref-6498b9d7-443-0) (line 443, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.66)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.66)
- [Model Upgrade Calm-Down Guide — L49](model-upgrade-calm-down-guide.md#^ref-db74343f-49-0) (line 49, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L137](sibilant-meta-prompt-dsl.md#^ref-af5d2824-137-0) (line 137, col 0, score 0.77)
- [Voice Access Layer Design — L201](voice-access-layer-design.md#^ref-543ed9b3-201-0) (line 201, col 0, score 0.64)
- [lisp-dsl-for-window-management — L212](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-212-0) (line 212, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L148](prompt-folder-bootstrap.md#^ref-bd4f0976-148-0) (line 148, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L40](model-upgrade-calm-down-guide.md#^ref-db74343f-40-0) (line 40, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L6](promethean-copilot-intent-engine.md#^ref-ae24a280-6-0) (line 6, col 0, score 0.66)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L693](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-693-0) (line 693, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L174](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-174-0) (line 174, col 0, score 0.72)
- [Protocol_0_The_Contradiction_Engine — L73](protocol-0-the-contradiction-engine.md#^ref-9a93a756-73-0) (line 73, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L263](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-263-0) (line 263, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L353](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-353-0) (line 353, col 0, score 0.65)
- [Protocol_0_The_Contradiction_Engine — L25](protocol-0-the-contradiction-engine.md#^ref-9a93a756-25-0) (line 25, col 0, score 0.64)
- [Exception Layer Analysis — L117](exception-layer-analysis.md#^ref-21d5cc09-117-0) (line 117, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L181](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-181-0) (line 181, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L271](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-271-0) (line 271, col 0, score 0.64)
- [Exception Layer Analysis — L3](exception-layer-analysis.md#^ref-21d5cc09-3-0) (line 3, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L136](migrate-to-provider-tenant-architecture.md#^ref-54382370-136-0) (line 136, col 0, score 0.91)
- [Cross-Target Macro System in Sibilant — L119](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-119-0) (line 119, col 0, score 0.9)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.9)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.88)
- [Dynamic Context Model for Web Components — L148](dynamic-context-model-for-web-components.md#^ref-f7702bf8-148-0) (line 148, col 0, score 0.81)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L87](migrate-to-provider-tenant-architecture.md#^ref-54382370-87-0) (line 87, col 0, score 0.61)
- [Tooling — L8](chunks/tooling.md#^ref-6cb4943e-8-0) (line 8, col 0, score 0.72)
- [Cross-Language Runtime Polymorphism — L257](cross-language-runtime-polymorphism.md#^ref-c34c36a6-257-0) (line 257, col 0, score 0.72)
- [ecs-scheduler-and-prefabs — L434](ecs-scheduler-and-prefabs.md#^ref-c62a1815-434-0) (line 434, col 0, score 0.72)
- [Local-First Intention→Code Loop with Free Models — L177](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-177-0) (line 177, col 0, score 0.72)
- [obsidian-ignore-node-modules-regex — L55](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-55-0) (line 55, col 0, score 0.72)
- [Unique Info Dump Index — L101](unique-info-dump-index.md#^ref-30ec3ba6-101-0) (line 101, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.66)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.61)
- [Per-Domain Policy System for JS Crawler — L7](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-7-0) (line 7, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L362](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-362-0) (line 362, col 0, score 0.63)
- [compiler-kit-foundations — L597](compiler-kit-foundations.md#^ref-01b21543-597-0) (line 597, col 0, score 0.63)
- [Promethean-native config design — L74](promethean-native-config-design.md#^ref-ab748541-74-0) (line 74, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L723](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-723-0) (line 723, col 0, score 0.62)
- [Promethean Pipelines — L10](promethean-pipelines.md#^ref-8b8e6103-10-0) (line 10, col 0, score 0.64)
- [Universal Lisp Interface — L30](universal-lisp-interface.md#^ref-b01856b4-30-0) (line 30, col 0, score 0.67)
- [i3-bluetooth-setup — L74](i3-bluetooth-setup.md#^ref-5e408692-74-0) (line 74, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L190](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-190-0) (line 190, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L153](cross-language-runtime-polymorphism.md#^ref-c34c36a6-153-0) (line 153, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.63)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L175](migrate-to-provider-tenant-architecture.md#^ref-54382370-175-0) (line 175, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L319](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-319-0) (line 319, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L492](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-492-0) (line 492, col 0, score 0.65)
- [Promethean State Format — L71](promethean-state-format.md#^ref-23df6ddb-71-0) (line 71, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L857](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-857-0) (line 857, col 0, score 0.62)
- [Promethean Web UI Setup — L598](promethean-web-ui-setup.md#^ref-bc5172ca-598-0) (line 598, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Tooling — L11](chunks/tooling.md#^ref-6cb4943e-11-0) (line 11, col 0, score 0.59)
- [Vectorial Exception Descent — L142](vectorial-exception-descent.md#^ref-d771154e-142-0) (line 142, col 0, score 0.7)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.63)
- [sibilant-macro-targets — L95](sibilant-macro-targets.md#^ref-c5c9a5c6-95-0) (line 95, col 0, score 0.59)
- [The Jar of Echoes — L108](the-jar-of-echoes.md#^ref-18138627-108-0) (line 108, col 0, score 0.59)
- [Synchronicity Waves and Web — L78](synchronicity-waves-and-web.md#^ref-91295f3a-78-0) (line 78, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.58)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.57)
- [Promethean-native config design — L50](promethean-native-config-design.md#^ref-ab748541-50-0) (line 50, col 0, score 0.57)
- [Protocol_0_The_Contradiction_Engine — L107](protocol-0-the-contradiction-engine.md#^ref-9a93a756-107-0) (line 107, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L367](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-367-0) (line 367, col 0, score 0.57)
- [Promethean-Copilot-Intent-Engine — L38](promethean-copilot-intent-engine.md#^ref-ae24a280-38-0) (line 38, col 0, score 0.56)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.55)
- [Tooling — L4](chunks/tooling.md#^ref-6cb4943e-4-0) (line 4, col 0, score 0.65)
- [Unique Info Dump Index — L36](unique-info-dump-index.md#^ref-30ec3ba6-36-0) (line 36, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L696](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-696-0) (line 696, col 0, score 0.7)
- [pm2-orchestration-patterns — L1](pm2-orchestration-patterns.md#^ref-51932e7b-1-0) (line 1, col 0, score 0.69)
- [sibilant-macro-targets — L135](sibilant-macro-targets.md#^ref-c5c9a5c6-135-0) (line 135, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L817](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-817-0) (line 817, col 0, score 0.65)
- [sibilant-macro-targets — L127](sibilant-macro-targets.md#^ref-c5c9a5c6-127-0) (line 127, col 0, score 0.64)
- [Universal Lisp Interface — L28](universal-lisp-interface.md#^ref-b01856b4-28-0) (line 28, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L380](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-380-0) (line 380, col 0, score 0.79)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L132](migrate-to-provider-tenant-architecture.md#^ref-54382370-132-0) (line 132, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L109](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-109-0) (line 109, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L186](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-186-0) (line 186, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.64)
- [Voice Access Layer Design — L222](voice-access-layer-design.md#^ref-543ed9b3-222-0) (line 222, col 0, score 0.68)
- [Promethean-native config design — L81](promethean-native-config-design.md#^ref-ab748541-81-0) (line 81, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L71](cross-language-runtime-polymorphism.md#^ref-c34c36a6-71-0) (line 71, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L130](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-130-0) (line 130, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L169](cross-language-runtime-polymorphism.md#^ref-c34c36a6-169-0) (line 169, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L1](cross-language-runtime-polymorphism.md#^ref-c34c36a6-1-0) (line 1, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L376](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-376-0) (line 376, col 0, score 0.63)
- [lisp-dsl-for-window-management — L170](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-170-0) (line 170, col 0, score 0.65)
- [sibilant-meta-string-templating-runtime — L95](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-95-0) (line 95, col 0, score 0.69)
- [sibilant-metacompiler-overview — L5](sibilant-metacompiler-overview.md#^ref-61d4086b-5-0) (line 5, col 0, score 0.66)
- [markdown-to-org-transpiler — L292](markdown-to-org-transpiler.md#^ref-ab54cdd8-292-0) (line 292, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L215](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-215-0) (line 215, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.64)
- [sibilant-macro-targets — L38](sibilant-macro-targets.md#^ref-c5c9a5c6-38-0) (line 38, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L50](sibilant-meta-prompt-dsl.md#^ref-af5d2824-50-0) (line 50, col 0, score 0.64)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.64)
- [Model Upgrade Calm-Down Guide — L38](model-upgrade-calm-down-guide.md#^ref-db74343f-38-0) (line 38, col 0, score 0.64)
- [komorebi-group-window-hack — L195](komorebi-group-window-hack.md#^ref-dd89372d-195-0) (line 195, col 0, score 0.63)
- [sibilant-macro-targets — L6](sibilant-macro-targets.md#^ref-c5c9a5c6-6-0) (line 6, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.68)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.66)
- [layer-1-uptime-diagrams — L29](layer-1-uptime-diagrams.md#^ref-4127189a-29-0) (line 29, col 0, score 0.65)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.64)
- [plan-update-confirmation — L623](plan-update-confirmation.md#^ref-b22d79c6-623-0) (line 623, col 0, score 0.62)
- [Factorio AI with External Agents — L8](factorio-ai-with-external-agents.md#^ref-a4d90289-8-0) (line 8, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.64)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.63)
- [Voice Access Layer Design — L302](voice-access-layer-design.md#^ref-543ed9b3-302-0) (line 302, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L13](migrate-to-provider-tenant-architecture.md#^ref-54382370-13-0) (line 13, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L128](local-only-llm-workflow.md#^ref-9a8ab57e-128-0) (line 128, col 0, score 0.74)
- [mystery-lisp-search-session — L67](mystery-lisp-search-session.md#^ref-513dc4c7-67-0) (line 67, col 0, score 0.71)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.69)
- [lisp-dsl-for-window-management — L107](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-107-0) (line 107, col 0, score 0.69)
- [sibilant-macro-targets — L19](sibilant-macro-targets.md#^ref-c5c9a5c6-19-0) (line 19, col 0, score 0.68)
- [sibilant-metacompiler-overview — L23](sibilant-metacompiler-overview.md#^ref-61d4086b-23-0) (line 23, col 0, score 0.66)
- [sibilant-macro-targets — L105](sibilant-macro-targets.md#^ref-c5c9a5c6-105-0) (line 105, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L14](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-14-0) (line 14, col 0, score 0.66)
- [sibilant-metacompiler-overview — L44](sibilant-metacompiler-overview.md#^ref-61d4086b-44-0) (line 44, col 0, score 0.68)
- [Layer1SurvivabilityEnvelope — L113](layer1survivabilityenvelope.md#^ref-64a9f9f9-113-0) (line 113, col 0, score 0.66)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L97](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-97-0) (line 97, col 0, score 0.63)
- [Exception Layer Analysis — L62](exception-layer-analysis.md#^ref-21d5cc09-62-0) (line 62, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L111](migrate-to-provider-tenant-architecture.md#^ref-54382370-111-0) (line 111, col 0, score 0.63)
- [Lisp-Compiler-Integration — L3](lisp-compiler-integration.md#^ref-cfee6d36-3-0) (line 3, col 0, score 0.8)
- [Lisp-Compiler-Integration — L7](lisp-compiler-integration.md#^ref-cfee6d36-7-0) (line 7, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.74)
- [compiler-kit-foundations — L6](compiler-kit-foundations.md#^ref-01b21543-6-0) (line 6, col 0, score 0.74)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L352](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-352-0) (line 352, col 0, score 0.72)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 0.71)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 0.71)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 0.71)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L382](js-to-lisp-reverse-compiler.md#^ref-58191024-382-0) (line 382, col 0, score 0.65)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L177](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-177-0) (line 177, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L383](js-to-lisp-reverse-compiler.md#^ref-58191024-383-0) (line 383, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L39](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-39-0) (line 39, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L625](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-625-0) (line 625, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L103](migrate-to-provider-tenant-architecture.md#^ref-54382370-103-0) (line 103, col 0, score 0.65)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.65)
- [Matplotlib Animation with Async Execution — L13](matplotlib-animation-with-async-execution.md#^ref-687439f9-13-0) (line 13, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L244](migrate-to-provider-tenant-architecture.md#^ref-54382370-244-0) (line 244, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L774](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-774-0) (line 774, col 0, score 0.64)
- [universal-intention-code-fabric — L25](universal-intention-code-fabric.md#^ref-c14edce7-25-0) (line 25, col 0, score 0.72)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.68)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.67)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L41](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-41-0) (line 41, col 0, score 0.66)
- [Matplotlib Animation with Async Execution — L7](matplotlib-animation-with-async-execution.md#^ref-687439f9-7-0) (line 7, col 0, score 0.65)
- [Matplotlib Animation with Async Execution — L31](matplotlib-animation-with-async-execution.md#^ref-687439f9-31-0) (line 31, col 0, score 0.65)
- [Reawakening Duck — L90](reawakening-duck.md#^ref-59b5670f-90-0) (line 90, col 0, score 0.63)
- [Prometheus Observability Stack — L3](prometheus-observability-stack.md#^ref-e90b5a16-3-0) (line 3, col 0, score 0.63)
- [Ghostly Smoke Interference — L35](ghostly-smoke-interference.md#^ref-b6ae7dfa-35-0) (line 35, col 0, score 0.62)
- [Tracing the Signal — L36](tracing-the-signal.md#^ref-c3cd4f65-36-0) (line 36, col 0, score 0.61)
- [Duck's Self-Referential Perceptual Loop — L20](ducks-self-referential-perceptual-loop.md#^ref-71726f04-20-0) (line 20, col 0, score 0.61)
- [Reawakening Duck — L9](reawakening-duck.md#^ref-59b5670f-9-0) (line 9, col 0, score 0.6)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.6)
- [Duck's Attractor States — L56](ducks-attractor-states.md#^ref-13951643-56-0) (line 56, col 0, score 0.6)
- [Promethean_Eidolon_Synchronicity_Model — L43](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-43-0) (line 43, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L82](sibilant-meta-prompt-dsl.md#^ref-af5d2824-82-0) (line 82, col 0, score 0.59)
- [obsidian-ignore-node-modules-regex — L36](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-36-0) (line 36, col 0, score 0.67)
- [Provider-Agnostic Chat Panel Implementation — L223](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-223-0) (line 223, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L9](promethean-copilot-intent-engine.md#^ref-ae24a280-9-0) (line 9, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.59)
- [i3-layout-saver — L5](i3-layout-saver.md#^ref-31f0166e-5-0) (line 5, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L345](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-345-0) (line 345, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.61)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.61)
- [Promethean Infrastructure Setup — L540](promethean-infrastructure-setup.md#^ref-6deed6ac-540-0) (line 540, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L96](migrate-to-provider-tenant-architecture.md#^ref-54382370-96-0) (line 96, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L107](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-107-0) (line 107, col 0, score 0.63)
- [plan-update-confirmation — L556](plan-update-confirmation.md#^ref-b22d79c6-556-0) (line 556, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L331](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-331-0) (line 331, col 0, score 0.62)
- [plan-update-confirmation — L363](plan-update-confirmation.md#^ref-b22d79c6-363-0) (line 363, col 0, score 0.62)
- [Promethean-native config design — L52](promethean-native-config-design.md#^ref-ab748541-52-0) (line 52, col 0, score 0.65)
- [Promethean-native config design — L41](promethean-native-config-design.md#^ref-ab748541-41-0) (line 41, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L34](dynamic-context-model-for-web-components.md#^ref-f7702bf8-34-0) (line 34, col 0, score 0.62)
- [Promethean-native config design — L58](promethean-native-config-design.md#^ref-ab748541-58-0) (line 58, col 0, score 0.61)
- [State Snapshots API and Transactional Projector — L327](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-327-0) (line 327, col 0, score 0.6)
- [Promethean-native config design — L51](promethean-native-config-design.md#^ref-ab748541-51-0) (line 51, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.58)
- [AI-First-OS-Model-Context-Protocol — L7](ai-first-os-model-context-protocol.md#^ref-618198f4-7-0) (line 7, col 0, score 0.64)
- [plan-update-confirmation — L554](plan-update-confirmation.md#^ref-b22d79c6-554-0) (line 554, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L262](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-262-0) (line 262, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L352](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-352-0) (line 352, col 0, score 0.64)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.63)
- [plan-update-confirmation — L210](plan-update-confirmation.md#^ref-b22d79c6-210-0) (line 210, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#^ref-5020e892-200-0) (line 200, col 0, score 1)
- [DSL — L32](chunks/dsl.md#^ref-e87bc036-32-0) (line 32, col 0, score 1)
- [Window Management — L27](chunks/window-management.md#^ref-9e8ae388-27-0) (line 27, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L206](cross-language-runtime-polymorphism.md#^ref-c34c36a6-206-0) (line 206, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L174](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-174-0) (line 174, col 0, score 1)
- [komorebi-group-window-hack — L201](komorebi-group-window-hack.md#^ref-dd89372d-201-0) (line 201, col 0, score 1)
- [Lisp-Compiler-Integration — L548](lisp-compiler-integration.md#^ref-cfee6d36-548-0) (line 548, col 0, score 1)
- [lisp-dsl-for-window-management — L217](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-217-0) (line 217, col 0, score 1)
- [Diagrams — L26](chunks/diagrams.md#^ref-45cd25b5-26-0) (line 26, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#^ref-54382370-295-0) (line 295, col 0, score 1)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#^ref-6deed6ac-589-0) (line 589, col 0, score 1)
- [shared-package-layout-clarification — L173](shared-package-layout-clarification.md#^ref-36c8882a-173-0) (line 173, col 0, score 1)
- [Shared Package Structure — L165](shared-package-structure.md#^ref-66a72fc3-165-0) (line 165, col 0, score 1)
- [Unique Info Dump Index — L140](unique-info-dump-index.md#^ref-30ec3ba6-140-0) (line 140, col 0, score 1)
- [Voice Access Layer Design — L323](voice-access-layer-design.md#^ref-543ed9b3-323-0) (line 323, col 0, score 1)
- [WebSocket Gateway Implementation — L640](websocket-gateway-implementation.md#^ref-e811123d-640-0) (line 640, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L154](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-154-0) (line 154, col 0, score 1)
- [AI-Centric OS with MCP Layer — L399](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-399-0) (line 399, col 0, score 1)
- [Dynamic Context Model for Web Components — L409](dynamic-context-model-for-web-components.md#^ref-f7702bf8-409-0) (line 409, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L34](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-34-0) (line 34, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L34](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-34-0) (line 34, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L86](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-86-0) (line 86, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L62](promethean-copilot-intent-engine.md#^ref-ae24a280-62-0) (line 62, col 0, score 1)
- [Promethean-native config design — L401](promethean-native-config-design.md#^ref-ab748541-401-0) (line 401, col 0, score 1)
- [aionian-circuit-math — L151](aionian-circuit-math.md#^ref-f2d83a77-151-0) (line 151, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-175-0) (line 175, col 0, score 1)
- [Dynamic Context Model for Web Components — L397](dynamic-context-model-for-web-components.md#^ref-f7702bf8-397-0) (line 397, col 0, score 1)
- [Eidolon Field Abstract Model — L208](eidolon-field-abstract-model.md#^ref-5e8b2388-208-0) (line 208, col 0, score 1)
- [eidolon-field-math-foundations — L122](eidolon-field-math-foundations.md#^ref-008f2ac0-122-0) (line 122, col 0, score 1)
- [eidolon-node-lifecycle — L54](eidolon-node-lifecycle.md#^ref-938eca9c-54-0) (line 54, col 0, score 1)
- [EidolonField — L263](eidolonfield.md#^ref-49d1e1e5-263-0) (line 263, col 0, score 1)
- [field-dynamics-math-blocks — L136](field-dynamics-math-blocks.md#^ref-7cfc230d-136-0) (line 136, col 0, score 1)
- [field-node-diagram-outline — L135](field-node-diagram-outline.md#^ref-1f32c94a-135-0) (line 135, col 0, score 1)
- [field-node-diagram-set — L160](field-node-diagram-set.md#^ref-22b989d5-160-0) (line 160, col 0, score 1)
- [field-node-diagram-visualizations — L111](field-node-diagram-visualizations.md#^ref-e9b27b06-111-0) (line 111, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [2d-sandbox-field — L213](2d-sandbox-field.md#^ref-c710dc93-213-0) (line 213, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L166](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-166-0) (line 166, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L430](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-430-0) (line 430, col 0, score 0.67)
- [aionian-circuit-math — L166](aionian-circuit-math.md#^ref-f2d83a77-166-0) (line 166, col 0, score 0.67)
- [archetype-ecs — L464](archetype-ecs.md#^ref-8f4c1e86-464-0) (line 464, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L210](chroma-toolkit-consolidation-plan.md#^ref-5020e892-210-0) (line 210, col 0, score 0.67)
- [Diagrams — L15](chunks/diagrams.md#^ref-45cd25b5-15-0) (line 15, col 0, score 0.67)
- [JavaScript — L16](chunks/javascript.md#^ref-c1618c66-16-0) (line 16, col 0, score 0.67)
- [Math Fundamentals — L17](chunks/math-fundamentals.md#^ref-c6e87433-17-0) (line 17, col 0, score 0.67)
- [Services — L13](chunks/services.md#^ref-75ea4a6a-13-0) (line 13, col 0, score 0.67)
- [Shared — L9](chunks/shared.md#^ref-623a55f7-9-0) (line 9, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 1)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L441](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-441-0) (line 441, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Vectorial Exception Descent — L175](vectorial-exception-descent.md#^ref-d771154e-175-0) (line 175, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-906-0) (line 906, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
- [aionian-circuit-math — L174](aionian-circuit-math.md#^ref-f2d83a77-174-0) (line 174, col 0, score 1)
- [DSL — L25](chunks/dsl.md#^ref-e87bc036-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#^ref-01b21543-610-0) (line 610, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#^ref-c34c36a6-203-0) (line 203, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L169](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-169-0) (line 169, col 0, score 1)
- [field-dynamics-math-blocks — L158](field-dynamics-math-blocks.md#^ref-7cfc230d-158-0) (line 158, col 0, score 1)
- [field-interaction-equations — L175](field-interaction-equations.md#^ref-b09141b7-175-0) (line 175, col 0, score 1)
- [layer-1-uptime-diagrams — L183](layer-1-uptime-diagrams.md#^ref-4127189a-183-0) (line 183, col 0, score 1)
- [compiler-kit-foundations — L605](compiler-kit-foundations.md#^ref-01b21543-605-0) (line 605, col 0, score 1)
- [Interop and Source Maps — L512](interop-and-source-maps.md#^ref-cdfac40c-512-0) (line 512, col 0, score 1)
- [js-to-lisp-reverse-compiler — L409](js-to-lisp-reverse-compiler.md#^ref-58191024-409-0) (line 409, col 0, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#^ref-d2b3628c-533-0) (line 533, col 0, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#^ref-cfee6d36-538-0) (line 538, col 0, score 1)
- [Lispy Macros with syntax-rules — L397](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-397-0) (line 397, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L512](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-512-0) (line 512, col 0, score 1)
- [template-based-compilation — L144](template-based-compilation.md#^ref-f8877e5e-144-0) (line 144, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L56](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-56-0) (line 56, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Operations — L7](chunks/operations.md#^ref-f1add613-7-0) (line 7, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L66](promethean-copilot-intent-engine.md#^ref-ae24a280-66-0) (line 66, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L218](chroma-toolkit-consolidation-plan.md#^ref-5020e892-218-0) (line 218, col 0, score 1)
- [DSL — L21](chunks/dsl.md#^ref-e87bc036-21-0) (line 21, col 0, score 1)
- [Window Management — L12](chunks/window-management.md#^ref-9e8ae388-12-0) (line 12, col 0, score 1)
- [compiler-kit-foundations — L638](compiler-kit-foundations.md#^ref-01b21543-638-0) (line 638, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L259](cross-language-runtime-polymorphism.md#^ref-c34c36a6-259-0) (line 259, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L217](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-217-0) (line 217, col 0, score 1)
- [Interop and Source Maps — L543](interop-and-source-maps.md#^ref-cdfac40c-543-0) (line 543, col 0, score 1)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#^ref-cfee6d36-553-0) (line 553, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Infrastructure Setup — L574](promethean-infrastructure-setup.md#^ref-6deed6ac-574-0) (line 574, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L179](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-179-0) (line 179, col 0, score 1)
- [AI-Centric OS with MCP Layer — L410](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-410-0) (line 410, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L234](cross-language-runtime-polymorphism.md#^ref-c34c36a6-234-0) (line 234, col 0, score 1)
- [Dynamic Context Model for Web Components — L394](dynamic-context-model-for-web-components.md#^ref-f7702bf8-394-0) (line 394, col 0, score 1)
- [heartbeat-simulation-snippets — L111](heartbeat-simulation-snippets.md#^ref-23e221e9-111-0) (line 111, col 0, score 1)
- [mystery-lisp-search-session — L135](mystery-lisp-search-session.md#^ref-513dc4c7-135-0) (line 135, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L33](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L84](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-84-0) (line 84, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
