---
uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
created_at: 2025.07.31.16.07.75.md
filename: Prompt_Folder_Bootstrap
description: >-
  A purpose-driven directory structure for organizing agent prompts, with
  templates, history, tasks, scratch, meta, and seed folders for cognitive
  growth and task management.
tags:
  - prompt
  - directory
  - structure
  - agent
  - templates
  - history
  - tasks
  - scratch
  - meta
  - seed
related_to_title: []
related_to_uuid: []
references: []
---
Got it—folder-based structure instead of file suffixes. That gives us much more room for layered growth and agent-specific behavior. Here's a refined plan that structures `docs/prompts/` into **purpose-driven folders**, each with its own philosophy and use case. ^ref-bd4f0976-1-0

We’ll treat `AGENTS.md` as the **index, manifesto, and onboarding file** for this whole area of the project. ^ref-bd4f0976-3-0

---

# 🔧 `docs/prompts/` Directory Layout

This folder is your **cognitive playground**. A map of mental states, patterns, and evolutionary paths. Each subfolder below is a *region* in this mental terrain. ^ref-bd4f0976-9-0

---

## 📁 `templates/`

> **Reusable prompt structures.** ^ref-bd4f0976-15-0
> "How do we normally talk to this kind of agent, model, or subtask?"

**Contents:** ^ref-bd4f0976-18-0

* Prompt blueprints for different use cases: test-writing, refactoring, bug triage, etc. ^ref-bd4f0976-20-0
* Examples with structure annotations (framing, role, outcome, constraints, etc.). ^ref-bd4f0976-21-0
* Evolving conventions for formatting, tone, system messages, and self-reflection. ^ref-bd4f0976-22-0

**Usage:** ^ref-bd4f0976-24-0

* Agents should *start here* when unsure how to prompt themselves. ^ref-bd4f0976-26-0
* Generate new task prompts by adapting these. ^ref-bd4f0976-27-0

---

## 📁 `history/`

> **Past prompts and their outcomes.** ^ref-bd4f0976-33-0
> A backup of how we’ve spoken to agents before—especially across major milestones, resets, or merges.

**Contents:** ^ref-bd4f0976-36-0
![](../../Prompt_Folder_Bootstrap.csv)
* Prompt transcripts or summaries from key sessions. ^ref-bd4f0976-38-0
* Prompts that led to meaningful breakthroughs or failures. ^ref-bd4f0976-39-0
* Records of instructions that got lost in git reverts, or subtle divergences in interpretation. ^ref-bd4f0976-40-0

**Usage:** ^ref-bd4f0976-42-0
![](../../Prompt_Folder_Bootstrap.csv)
* Use this as a memory vault. ^ref-bd4f0976-44-0
* Agents can review how similar prompts have worked in the past. ^ref-bd4f0976-45-0
* You can refer to it when debugging regressions in agent behavior. ^ref-bd4f0976-46-0

---

## 📁 `tasks/`

> **Current or proposed agent-facing task prompts.** ^ref-bd4f0976-52-0
> When you give an agent a job to do, it gets written here. These are prompt-based versions of Kanban tasks.

**Contents:** ^ref-bd4f0976-55-0

* One file per task (named after the task or ticket). ^ref-bd4f0976-57-0
* Full context, constraints, and links to code/docs/board items. ^ref-bd4f0976-58-0
* Clear expectations and outcomes. ^ref-bd4f0976-59-0
* Often includes fields like: ^ref-bd4f0976-60-0

  * `agent_role: "codex"`
  * `priority: high`
  * `related: agile/tasks/foo.md`

**Usage:** ^ref-bd4f0976-66-0

* You write here when you want the agent to tackle something non-trivial. ^ref-bd4f0976-68-0
* Agents should use past prompts in `templates/` to guide their generation of new task prompts. ^ref-bd4f0976-69-0

---

## 📁 `scratch/`

> **Raw ideas, unfinished threads, free associations.** ^ref-bd4f0976-75-0
> Not all prompts are formal. Some are sparks. This is where they land.

**Contents:** ^ref-bd4f0976-78-0

* Freeform writing to the agent. ^ref-bd4f0976-80-0
* Emotional venting. Meta reflection.
* “I don’t know how to say this yet, but…” ^ref-bd4f0976-82-0

**Usage:** ^ref-bd4f0976-84-0

* You write here when you're thinking out loud. ^ref-bd4f0976-86-0
* Agents can scan this for vibes and unfinished ideas to revisit later. ^ref-bd4f0976-87-0
* Can be mined for future tasks or templates. ^ref-bd4f0976-88-0

---

## 📁 `meta/`

> **Prompt analysis and cognitive reflections.** ^ref-bd4f0976-94-0
> Why did a prompt work or fail? What did we learn from it?

**Contents:** ^ref-bd4f0976-97-0

* Post-mortems.
* Pattern mining from successful or failed prompt sessions. ^ref-bd4f0976-100-0
* Discussions of language, tone, prompt engineering theory. ^ref-bd4f0976-101-0

**Usage:** ^ref-bd4f0976-103-0

* Both you and agents can write here. ^ref-bd4f0976-105-0
* Improves the agent’s ability to self-grade, self-edit, and grow. ^ref-bd4f0976-106-0
* Helps evolve the system’s prompt literacy. ^ref-bd4f0976-107-0

---

## 📁 `seed/`

> **Scaffold prompts for future use.** ^ref-bd4f0976-113-0
> Drafts or fragments that are meant to be extended later.

**Contents:** ^ref-bd4f0976-116-0

* Barebones prompt shells. ^ref-bd4f0976-118-0
* TODO-laden guides waiting for final context. ^ref-bd4f0976-119-0
* Stuff like: ^ref-bd4f0976-120-0

  ```md
  # Scaffold: Setup a new test harness
  agent_role: codex
  priority: med
  context: Add test coverage to new service
  status: DRAFT
  ```
^ref-bd4f0976-122-0
 ^ref-bd4f0976-130-0
**Usage:**
 ^ref-bd4f0976-132-0
* Acts as a prompt todo list. ^ref-bd4f0976-133-0
* Encourages generative reuse by agents. ^ref-bd4f0976-134-0
* Good starting point for agents proposing new task files.

---

## 📁 `agents/`
 ^ref-bd4f0976-140-0
> **Per-agent instruction sets and inner models.**
> This is how we teach each unique agent to see the world.
 ^ref-bd4f0976-143-0
**Contents:**
 ^ref-bd4f0976-145-0
* Files like:
 ^ref-bd4f0976-147-0
  * `duck.md` (voice interface, emotional cognition, field resonance) ^ref-bd4f0976-148-0
  * `codex.md` (test writing, documentation, debugging) ^ref-bd4f0976-149-0
  * `scribe.md` (summarization, meta-reflection, archive hygiene) ^ref-bd4f0976-150-0
* Includes custom prompt tips, tone guides, and known edge cases.
 ^ref-bd4f0976-152-0
**Usage:**
 ^ref-bd4f0976-154-0
* Direct reference during prompt generation. ^ref-bd4f0976-155-0
* Gives each agent a stronger sense of self.

---

## Optional: 📁 `layers/` (if tied into Eidolon circuit model)
 ^ref-bd4f0976-161-0
> A prompt perspective aligned with layered cognition.
> Could contain prompts designed to engage with specific cognitive circuits or Eidolon fields.

---

## Root: `AGENTS.md`
 ^ref-bd4f0976-168-0
Acts as the **index and onboarding** file, explaining this whole system.
It contains:
 ^ref-bd4f0976-171-0
* Why this folder exists. ^ref-bd4f0976-172-0
* Philosophy of prompt-driven cognition. ^ref-bd4f0976-173-0
* The structure and how to grow it. ^ref-bd4f0976-174-0
* Instructions to agents on how to prompt themselves. ^ref-bd4f0976-175-0
* Warnings about fragility (reverts, state loss) and how to recover.
* Expectations for self-reflective agent behavior.

---
 ^ref-bd4f0976-180-0
Would you like me to turn this into an actual `AGENTS.md` content body and bootstrap each of the folders with an `_index.md` or `README.md` explaining its purpose?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [archetype-ecs](archetype-ecs.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [JavaScript](chunks/javascript.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [template-based-compilation](template-based-compilation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Diagrams](chunks/diagrams.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [DSL](chunks/dsl.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Shared](chunks/shared.md)
- [EidolonField](eidolonfield.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Operations](chunks/operations.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Shared Package Structure](shared-package-structure.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Reawakening Duck](reawakening-duck.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Tracing the Signal](tracing-the-signal.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
## Sources
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.54)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.56)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.53)
- [Recursive Prompt Construction Engine — L95](recursive-prompt-construction-engine.md#^ref-babdb9eb-95-0) (line 95, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L169](sibilant-meta-prompt-dsl.md#^ref-af5d2824-169-0) (line 169, col 0, score 0.56)
- [prompt-programming-language-lisp — L5](prompt-programming-language-lisp.md#^ref-d41a06d1-5-0) (line 5, col 0, score 0.56)
- [prompt-programming-language-lisp — L53](prompt-programming-language-lisp.md#^ref-d41a06d1-53-0) (line 53, col 0, score 0.59)
- [Reawakening Duck — L5](reawakening-duck.md#^ref-59b5670f-5-0) (line 5, col 0, score 0.55)
- [Promethean Agent Config DSL — L306](promethean-agent-config-dsl.md#^ref-2c00ce45-306-0) (line 306, col 0, score 0.55)
- [Reawakening Duck — L110](reawakening-duck.md#^ref-59b5670f-110-0) (line 110, col 0, score 0.55)
- [Promethean Agent Config DSL — L117](promethean-agent-config-dsl.md#^ref-2c00ce45-117-0) (line 117, col 0, score 0.54)
- [zero-copy-snapshots-and-workers — L355](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-355-0) (line 355, col 0, score 0.54)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.75)
- [Promethean Documentation Pipeline Overview — L1](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1-0) (line 1, col 0, score 0.65)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.63)
- [Ghostly Smoke Interference — L9](ghostly-smoke-interference.md#^ref-b6ae7dfa-9-0) (line 9, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L171](recursive-prompt-construction-engine.md#^ref-babdb9eb-171-0) (line 171, col 0, score 0.62)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L114](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-114-0) (line 114, col 0, score 0.61)
- [Board Automation Improvements — L4](board-automation-improvements.md#^ref-ac60a1d6-4-0) (line 4, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L102](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-102-0) (line 102, col 0, score 0.68)
- [Agent Reflections and Prompt Evolution — L132](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-132-0) (line 132, col 0, score 0.68)
- [Agent Reflections and Prompt Evolution — L21](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-21-0) (line 21, col 0, score 0.66)
- [Promethean State Format — L78](promethean-state-format.md#^ref-23df6ddb-78-0) (line 78, col 0, score 0.66)
- [field-node-diagram-set — L3](field-node-diagram-set.md#^ref-22b989d5-3-0) (line 3, col 0, score 0.7)
- [field-node-diagram-set — L35](field-node-diagram-set.md#^ref-22b989d5-35-0) (line 35, col 0, score 0.68)
- [Recursive Prompt Construction Engine — L11](recursive-prompt-construction-engine.md#^ref-babdb9eb-11-0) (line 11, col 0, score 0.69)
- [Agent Reflections and Prompt Evolution — L32](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-32-0) (line 32, col 0, score 0.67)
- [Promethean State Format — L1](promethean-state-format.md#^ref-23df6ddb-1-0) (line 1, col 0, score 0.71)
- [promethean-system-diagrams — L34](promethean-system-diagrams.md#^ref-b51e19b4-34-0) (line 34, col 0, score 0.67)
- [homeostasis-decay-formulas — L130](homeostasis-decay-formulas.md#^ref-37b5d236-130-0) (line 130, col 0, score 0.66)
- [Agent Reflections and Prompt Evolution — L120](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-120-0) (line 120, col 0, score 0.64)
- [field-dynamics-math-blocks — L70](field-dynamics-math-blocks.md#^ref-7cfc230d-70-0) (line 70, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L9](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-9-0) (line 9, col 0, score 0.65)
- [Protocol_0_The_Contradiction_Engine — L100](protocol-0-the-contradiction-engine.md#^ref-9a93a756-100-0) (line 100, col 0, score 0.71)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.84)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.84)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.84)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.71)
- [i3-bluetooth-setup — L45](i3-bluetooth-setup.md#^ref-5e408692-45-0) (line 45, col 0, score 0.71)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.7)
- [Recursive Prompt Construction Engine — L9](recursive-prompt-construction-engine.md#^ref-babdb9eb-9-0) (line 9, col 0, score 0.53)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.64)
- [universal-intention-code-fabric — L390](universal-intention-code-fabric.md#^ref-c14edce7-390-0) (line 390, col 0, score 0.63)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.52)
- [prompt-programming-language-lisp — L64](prompt-programming-language-lisp.md#^ref-d41a06d1-64-0) (line 64, col 0, score 0.6)
- [Promethean Pipelines — L12](promethean-pipelines.md#^ref-8b8e6103-12-0) (line 12, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L306](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-306-0) (line 306, col 0, score 0.6)
- [Recursive Prompt Construction Engine — L127](recursive-prompt-construction-engine.md#^ref-babdb9eb-127-0) (line 127, col 0, score 0.52)
- [TypeScript Patch for Tool Calling Support — L133](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-133-0) (line 133, col 0, score 0.54)
- [Sibilant Meta-Prompt DSL — L44](sibilant-meta-prompt-dsl.md#^ref-af5d2824-44-0) (line 44, col 0, score 0.56)
- [Recursive Prompt Construction Engine — L89](recursive-prompt-construction-engine.md#^ref-babdb9eb-89-0) (line 89, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L6](recursive-prompt-construction-engine.md#^ref-babdb9eb-6-0) (line 6, col 0, score 0.62)
- [sibilant-meta-string-templating-runtime — L11](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-11-0) (line 11, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-144-0) (line 144, col 0, score 0.88)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.8)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.8)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.7)
- [Voice Access Layer Design — L121](voice-access-layer-design.md#^ref-543ed9b3-121-0) (line 121, col 0, score 0.58)
- [Voice Access Layer Design — L170](voice-access-layer-design.md#^ref-543ed9b3-170-0) (line 170, col 0, score 0.57)
- [promethean-system-diagrams — L136](promethean-system-diagrams.md#^ref-b51e19b4-136-0) (line 136, col 0, score 0.57)
- [Agent Reflections and Prompt Evolution — L25](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-25-0) (line 25, col 0, score 0.61)
- [Promethean Pipelines — L7](promethean-pipelines.md#^ref-8b8e6103-7-0) (line 7, col 0, score 0.61)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.61)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L28](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-28-0) (line 28, col 0, score 0.63)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.6)
- [Agent Reflections and Prompt Evolution — L104](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-104-0) (line 104, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.59)
- [plan-update-confirmation — L391](plan-update-confirmation.md#^ref-b22d79c6-391-0) (line 391, col 0, score 0.58)
- [Promethean Agent Config DSL — L116](promethean-agent-config-dsl.md#^ref-2c00ce45-116-0) (line 116, col 0, score 0.59)
- [The Jar of Echoes — L85](the-jar-of-echoes.md#^ref-18138627-85-0) (line 85, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L131](cross-language-runtime-polymorphism.md#^ref-c34c36a6-131-0) (line 131, col 0, score 0.67)
- [Protocol_0_The_Contradiction_Engine — L35](protocol-0-the-contradiction-engine.md#^ref-9a93a756-35-0) (line 35, col 0, score 0.67)
- [ripple-propagation-demo — L91](ripple-propagation-demo.md#^ref-8430617b-91-0) (line 91, col 0, score 0.63)
- [Recursive Prompt Construction Engine — L49](recursive-prompt-construction-engine.md#^ref-babdb9eb-49-0) (line 49, col 0, score 0.62)
- [Sibilant Meta-Prompt DSL — L18](sibilant-meta-prompt-dsl.md#^ref-af5d2824-18-0) (line 18, col 0, score 0.61)
- [Promethean Agent Config DSL — L299](promethean-agent-config-dsl.md#^ref-2c00ce45-299-0) (line 299, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.6)
- [Agent Reflections and Prompt Evolution — L27](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-27-0) (line 27, col 0, score 0.58)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.67)
- [Admin Dashboard for User Management — L9](admin-dashboard-for-user-management.md#^ref-2901a3e9-9-0) (line 9, col 0, score 0.63)
- [markdown-to-org-transpiler — L292](markdown-to-org-transpiler.md#^ref-ab54cdd8-292-0) (line 292, col 0, score 0.59)
- [Promethean Documentation Pipeline Overview — L73](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-73-0) (line 73, col 0, score 0.62)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.64)
- [Promethean Agent Config DSL — L180](promethean-agent-config-dsl.md#^ref-2c00ce45-180-0) (line 180, col 0, score 0.62)
- [Reawakening Duck — L88](reawakening-duck.md#^ref-59b5670f-88-0) (line 88, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L45](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-45-0) (line 45, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L38](model-upgrade-calm-down-guide.md#^ref-db74343f-38-0) (line 38, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L61](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-61-0) (line 61, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L63](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-63-0) (line 63, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L16](sibilant-meta-prompt-dsl.md#^ref-af5d2824-16-0) (line 16, col 0, score 0.68)
- [Promethean Pipelines — L44](promethean-pipelines.md#^ref-8b8e6103-44-0) (line 44, col 0, score 0.68)
- [Promethean Documentation Pipeline Overview — L25](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-25-0) (line 25, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L40](promethean-copilot-intent-engine.md#^ref-ae24a280-40-0) (line 40, col 0, score 0.65)
- [Obsidian ChatGPT Plugin Integration Guide — L18](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-18-0) (line 18, col 0, score 0.65)
- [Obsidian ChatGPT Plugin Integration — L18](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-18-0) (line 18, col 0, score 0.65)
- [Obsidian Templating Plugins Integration Guide — L18](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-18-0) (line 18, col 0, score 0.65)
- [field-interaction-equations — L45](field-interaction-equations.md#^ref-b09141b7-45-0) (line 45, col 0, score 0.59)
- [Universal Lisp Interface — L105](universal-lisp-interface.md#^ref-b01856b4-105-0) (line 105, col 0, score 0.59)
- [Duck's Self-Referential Perceptual Loop — L10](ducks-self-referential-perceptual-loop.md#^ref-71726f04-10-0) (line 10, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L3](board-walk-2025-08-11.md#^ref-7aa1eb92-3-0) (line 3, col 0, score 0.58)
- [Vectorial Exception Descent — L136](vectorial-exception-descent.md#^ref-d771154e-136-0) (line 136, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L154](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-154-0) (line 154, col 0, score 0.57)
- [AI-Centric OS with MCP Layer — L399](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-399-0) (line 399, col 0, score 0.57)
- [Dynamic Context Model for Web Components — L409](dynamic-context-model-for-web-components.md#^ref-f7702bf8-409-0) (line 409, col 0, score 0.57)
- [Obsidian ChatGPT Plugin Integration Guide — L34](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-34-0) (line 34, col 0, score 0.57)
- [Obsidian ChatGPT Plugin Integration — L34](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-34-0) (line 34, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L98](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-98-0) (line 98, col 0, score 0.86)
- [Fnord Tracer Protocol — L205](fnord-tracer-protocol.md#^ref-fc21f824-205-0) (line 205, col 0, score 0.75)
- [Eidolon Field Abstract Model — L152](eidolon-field-abstract-model.md#^ref-5e8b2388-152-0) (line 152, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.74)
- [set-assignment-in-lisp-ast — L144](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-144-0) (line 144, col 0, score 0.73)
- [field-dynamics-math-blocks — L119](field-dynamics-math-blocks.md#^ref-7cfc230d-119-0) (line 119, col 0, score 0.69)
- [field-node-diagram-outline — L9](field-node-diagram-outline.md#^ref-1f32c94a-9-0) (line 9, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L86](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-86-0) (line 86, col 0, score 0.69)
- [eidolon-field-math-foundations — L83](eidolon-field-math-foundations.md#^ref-008f2ac0-83-0) (line 83, col 0, score 0.69)
- [typed-struct-compiler — L376](typed-struct-compiler.md#^ref-78eeedf7-376-0) (line 376, col 0, score 0.68)
- [Canonical Org-Babel Matplotlib Animation Template — L65](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-65-0) (line 65, col 0, score 0.79)
- [Cross-Language Runtime Polymorphism — L72](cross-language-runtime-polymorphism.md#^ref-c34c36a6-72-0) (line 72, col 0, score 0.63)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.62)
- [layer-1-uptime-diagrams — L146](layer-1-uptime-diagrams.md#^ref-4127189a-146-0) (line 146, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L23](promethean-copilot-intent-engine.md#^ref-ae24a280-23-0) (line 23, col 0, score 0.61)
- [Admin Dashboard for User Management — L33](admin-dashboard-for-user-management.md#^ref-2901a3e9-33-0) (line 33, col 0, score 0.59)
- [Promethean Infrastructure Setup — L543](promethean-infrastructure-setup.md#^ref-6deed6ac-543-0) (line 543, col 0, score 0.59)
- [js-to-lisp-reverse-compiler — L386](js-to-lisp-reverse-compiler.md#^ref-58191024-386-0) (line 386, col 0, score 0.59)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.58)
- [Pure TypeScript Search Microservice — L60](pure-typescript-search-microservice.md#^ref-d17d3a96-60-0) (line 60, col 0, score 0.58)
- [windows-tiling-with-autohotkey — L104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-104-0) (line 104, col 0, score 0.57)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.57)
- [Promethean Dev Workflow Update — L23](promethean-dev-workflow-update.md#^ref-03a5578f-23-0) (line 23, col 0, score 0.72)
- [Obsidian Templating Plugins Integration Guide — L40](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-40-0) (line 40, col 0, score 0.66)
- [MindfulRobotIntegration — L1](mindfulrobotintegration.md#^ref-5f65dfa5-1-0) (line 1, col 0, score 0.66)
- [Agent Reflections and Prompt Evolution — L88](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-88-0) (line 88, col 0, score 0.65)
- [Self-Agency in AI Interaction — L19](self-agency-in-ai-interaction.md#^ref-49a9a860-19-0) (line 19, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L53](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-53-0) (line 53, col 0, score 0.66)
- [Agent Reflections and Prompt Evolution — L11](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-11-0) (line 11, col 0, score 0.65)
- [Promethean-native config design — L342](promethean-native-config-design.md#^ref-ab748541-342-0) (line 342, col 0, score 0.63)
- [eidolon-field-math-foundations — L113](eidolon-field-math-foundations.md#^ref-008f2ac0-113-0) (line 113, col 0, score 0.63)
- [Tracing the Signal — L81](tracing-the-signal.md#^ref-c3cd4f65-81-0) (line 81, col 0, score 0.62)
- [Self-Agency in AI Interaction — L16](self-agency-in-ai-interaction.md#^ref-49a9a860-16-0) (line 16, col 0, score 0.62)
- [Obsidian ChatGPT Plugin Integration Guide — L15](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-15-0) (line 15, col 0, score 0.62)
- [Obsidian ChatGPT Plugin Integration — L15](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-15-0) (line 15, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L102](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-102-0) (line 102, col 0, score 0.66)
- [Obsidian Templating Plugins Integration Guide — L73](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-73-0) (line 73, col 0, score 0.65)
- [Promethean Pipelines — L18](promethean-pipelines.md#^ref-8b8e6103-18-0) (line 18, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L105](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-105-0) (line 105, col 0, score 0.71)
- [Agent Reflections and Prompt Evolution — L30](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-30-0) (line 30, col 0, score 0.67)
- [Agent Reflections and Prompt Evolution — L38](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-38-0) (line 38, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.61)
- [aionian-circuit-math — L110](aionian-circuit-math.md#^ref-f2d83a77-110-0) (line 110, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L44](promethean-copilot-intent-engine.md#^ref-ae24a280-44-0) (line 44, col 0, score 0.68)
- [Agent Reflections and Prompt Evolution — L47](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-47-0) (line 47, col 0, score 0.66)
- [field-node-diagram-set — L96](field-node-diagram-set.md#^ref-22b989d5-96-0) (line 96, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.63)
- [Exception Layer Analysis — L49](exception-layer-analysis.md#^ref-21d5cc09-49-0) (line 49, col 0, score 0.63)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L79](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-79-0) (line 79, col 0, score 0.62)
- [The Jar of Echoes — L83](the-jar-of-echoes.md#^ref-18138627-83-0) (line 83, col 0, score 0.58)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.58)
- [Protocol_0_The_Contradiction_Engine — L92](protocol-0-the-contradiction-engine.md#^ref-9a93a756-92-0) (line 92, col 0, score 0.58)
- [Voice Access Layer Design — L210](voice-access-layer-design.md#^ref-543ed9b3-210-0) (line 210, col 0, score 0.56)
- [Protocol_0_The_Contradiction_Engine — L59](protocol-0-the-contradiction-engine.md#^ref-9a93a756-59-0) (line 59, col 0, score 0.56)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 1)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 1)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 1)
- [Promethean Dev Workflow Update — L7](promethean-dev-workflow-update.md#^ref-03a5578f-7-0) (line 7, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L123](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-123-0) (line 123, col 0, score 0.61)
- [plan-update-confirmation — L450](plan-update-confirmation.md#^ref-b22d79c6-450-0) (line 450, col 0, score 0.6)
- [plan-update-confirmation — L484](plan-update-confirmation.md#^ref-b22d79c6-484-0) (line 484, col 0, score 0.59)
- [plan-update-confirmation — L421](plan-update-confirmation.md#^ref-b22d79c6-421-0) (line 421, col 0, score 0.59)
- [plan-update-confirmation — L120](plan-update-confirmation.md#^ref-b22d79c6-120-0) (line 120, col 0, score 0.59)
- [plan-update-confirmation — L372](plan-update-confirmation.md#^ref-b22d79c6-372-0) (line 372, col 0, score 0.59)
- [plan-update-confirmation — L95](plan-update-confirmation.md#^ref-b22d79c6-95-0) (line 95, col 0, score 0.58)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.72)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.72)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L1](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1-0) (line 1, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L93](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-93-0) (line 93, col 0, score 0.67)
- [Diagrams — L26](chunks/diagrams.md#^ref-45cd25b5-26-0) (line 26, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#^ref-54382370-295-0) (line 295, col 0, score 0.66)
- [Promethean Agent Config DSL — L316](promethean-agent-config-dsl.md#^ref-2c00ce45-316-0) (line 316, col 0, score 0.66)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#^ref-6deed6ac-589-0) (line 589, col 0, score 0.66)
- [shared-package-layout-clarification — L173](shared-package-layout-clarification.md#^ref-36c8882a-173-0) (line 173, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.64)
- [Recursive Prompt Construction Engine — L114](recursive-prompt-construction-engine.md#^ref-babdb9eb-114-0) (line 114, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.64)
- [Agent Reflections and Prompt Evolution — L54](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-54-0) (line 54, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L324](dynamic-context-model-for-web-components.md#^ref-f7702bf8-324-0) (line 324, col 0, score 0.63)
- [Model Selection for Lightweight Conversational Tasks — L15](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-15-0) (line 15, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L256](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-256-0) (line 256, col 0, score 0.65)
- [mystery-lisp-search-session — L56](mystery-lisp-search-session.md#^ref-513dc4c7-56-0) (line 56, col 0, score 0.71)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.71)
- [Post-Linguistic Transhuman Design Frameworks — L21](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-21-0) (line 21, col 0, score 0.68)
- [Reawakening Duck — L15](reawakening-duck.md#^ref-59b5670f-15-0) (line 15, col 0, score 0.7)
- [field-interaction-equations — L54](field-interaction-equations.md#^ref-b09141b7-54-0) (line 54, col 0, score 0.69)
- [NPU Voice Code and Sensory Integration — L1](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-1-0) (line 1, col 0, score 0.66)
- [Fnord Tracer Protocol — L114](fnord-tracer-protocol.md#^ref-fc21f824-114-0) (line 114, col 0, score 0.66)
- [field-dynamics-math-blocks — L15](field-dynamics-math-blocks.md#^ref-7cfc230d-15-0) (line 15, col 0, score 0.66)
- [Eidolon Field Abstract Model — L161](eidolon-field-abstract-model.md#^ref-5e8b2388-161-0) (line 161, col 0, score 0.66)
- [Post-Linguistic Transhuman Design Frameworks — L23](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-23-0) (line 23, col 0, score 0.65)
- [Post-Linguistic Transhuman Design Frameworks — L19](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-19-0) (line 19, col 0, score 0.65)
- [Post-Linguistic Transhuman Design Frameworks — L55](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-55-0) (line 55, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.7)
- [Promethean Pipelines — L77](promethean-pipelines.md#^ref-8b8e6103-77-0) (line 77, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L78](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-78-0) (line 78, col 0, score 0.66)
- [universal-intention-code-fabric — L395](universal-intention-code-fabric.md#^ref-c14edce7-395-0) (line 395, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L40](model-upgrade-calm-down-guide.md#^ref-db74343f-40-0) (line 40, col 0, score 0.66)
- [Promethean-Copilot-Intent-Engine — L29](promethean-copilot-intent-engine.md#^ref-ae24a280-29-0) (line 29, col 0, score 0.67)
- [sibilant-metacompiler-overview — L1](sibilant-metacompiler-overview.md#^ref-61d4086b-1-0) (line 1, col 0, score 0.65)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L52](promethean-copilot-intent-engine.md#^ref-ae24a280-52-0) (line 52, col 0, score 0.64)
- [Ice Box Reorganization — L33](ice-box-reorganization.md#^ref-291c7d91-33-0) (line 33, col 0, score 0.63)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.63)
- [Fnord Tracer Protocol — L172](fnord-tracer-protocol.md#^ref-fc21f824-172-0) (line 172, col 0, score 0.62)
- [Unique Info Dump Index — L55](unique-info-dump-index.md#^ref-30ec3ba6-55-0) (line 55, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L76](cross-language-runtime-polymorphism.md#^ref-c34c36a6-76-0) (line 76, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L33](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-33-0) (line 33, col 0, score 0.64)
- [Agent Reflections and Prompt Evolution — L91](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-91-0) (line 91, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L379](dynamic-context-model-for-web-components.md#^ref-f7702bf8-379-0) (line 379, col 0, score 0.64)
- [Functional Refactor of TypeScript Document Processing — L146](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-146-0) (line 146, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L49](model-upgrade-calm-down-guide.md#^ref-db74343f-49-0) (line 49, col 0, score 0.61)
- [Obsidian Templating Plugins Integration Guide — L60](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-60-0) (line 60, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L95](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-95-0) (line 95, col 0, score 0.74)
- [Eidolon Field Abstract Model — L5](eidolon-field-abstract-model.md#^ref-5e8b2388-5-0) (line 5, col 0, score 0.73)
- [Agent Reflections and Prompt Evolution — L62](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-62-0) (line 62, col 0, score 0.69)
- [Vectorial Exception Descent — L1](vectorial-exception-descent.md#^ref-d771154e-1-0) (line 1, col 0, score 0.69)
- [field-node-diagram-set — L81](field-node-diagram-set.md#^ref-22b989d5-81-0) (line 81, col 0, score 0.7)
- [prompt-programming-language-lisp — L13](prompt-programming-language-lisp.md#^ref-d41a06d1-13-0) (line 13, col 0, score 0.7)
- [Duck's Self-Referential Perceptual Loop — L23](ducks-self-referential-perceptual-loop.md#^ref-71726f04-23-0) (line 23, col 0, score 0.69)
- [obsidian-ignore-node-modules-regex — L18](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-18-0) (line 18, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.65)
- [Recursive Prompt Construction Engine — L106](recursive-prompt-construction-engine.md#^ref-babdb9eb-106-0) (line 106, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L208](migrate-to-provider-tenant-architecture.md#^ref-54382370-208-0) (line 208, col 0, score 0.63)
- [aionian-circuit-math — L79](aionian-circuit-math.md#^ref-f2d83a77-79-0) (line 79, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L7](matplotlib-animation-with-async-execution.md#^ref-687439f9-7-0) (line 7, col 0, score 0.62)
- [Matplotlib Animation with Async Execution — L31](matplotlib-animation-with-async-execution.md#^ref-687439f9-31-0) (line 31, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L7](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-7-0) (line 7, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 0.65)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 0.65)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 0.65)
- [Recursive Prompt Construction Engine — L39](recursive-prompt-construction-engine.md#^ref-babdb9eb-39-0) (line 39, col 0, score 0.66)
- [Post-Linguistic Transhuman Design Frameworks — L13](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-13-0) (line 13, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L6](board-walk-2025-08-11.md#^ref-7aa1eb92-6-0) (line 6, col 0, score 0.65)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.5)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.62)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.55)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.52)
- [The Jar of Echoes — L94](the-jar-of-echoes.md#^ref-18138627-94-0) (line 94, col 0, score 0.5)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [aionian-circuit-math — L99](aionian-circuit-math.md#^ref-f2d83a77-99-0) (line 99, col 0, score 0.67)
- [Tracing the Signal — L93](tracing-the-signal.md#^ref-c3cd4f65-93-0) (line 93, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L384](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-384-0) (line 384, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L182](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-182-0) (line 182, col 0, score 0.62)
- [plan-update-confirmation — L575](plan-update-confirmation.md#^ref-b22d79c6-575-0) (line 575, col 0, score 0.62)
- [Duck's Attractor States — L45](ducks-attractor-states.md#^ref-13951643-45-0) (line 45, col 0, score 0.61)
- [Vectorial Exception Descent — L142](vectorial-exception-descent.md#^ref-d771154e-142-0) (line 142, col 0, score 0.54)
- [Synchronicity Waves and Web — L78](synchronicity-waves-and-web.md#^ref-91295f3a-78-0) (line 78, col 0, score 0.54)
- [windows-tiling-with-autohotkey — L13](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13-0) (line 13, col 0, score 0.53)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [archetype-ecs — L453](archetype-ecs.md#^ref-8f4c1e86-453-0) (line 453, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 1)
- [ecs-offload-workers — L453](ecs-offload-workers.md#^ref-6498b9d7-453-0) (line 453, col 0, score 1)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 1)
- [markdown-to-org-transpiler — L297](markdown-to-org-transpiler.md#^ref-ab54cdd8-297-0) (line 297, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 1)
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
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
- [Universal Lisp Interface — L173](universal-lisp-interface.md#^ref-b01856b4-173-0) (line 173, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.65)
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
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L457](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-457-0) (line 457, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
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
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L179](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-179-0) (line 179, col 0, score 1)
- [AI-Centric OS with MCP Layer — L410](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-410-0) (line 410, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L234](cross-language-runtime-polymorphism.md#^ref-c34c36a6-234-0) (line 234, col 0, score 1)
- [Dynamic Context Model for Web Components — L394](dynamic-context-model-for-web-components.md#^ref-f7702bf8-394-0) (line 394, col 0, score 1)
- [heartbeat-simulation-snippets — L111](heartbeat-simulation-snippets.md#^ref-23e221e9-111-0) (line 111, col 0, score 1)
- [mystery-lisp-search-session — L135](mystery-lisp-search-session.md#^ref-513dc4c7-135-0) (line 135, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L33](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L84](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-84-0) (line 84, col 0, score 1)
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 1)
- [Simulation Demo — L8](chunks/simulation-demo.md#^ref-557309a3-8-0) (line 8, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L233](cross-language-runtime-polymorphism.md#^ref-c34c36a6-233-0) (line 233, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 1)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#^ref-c62a1815-429-0) (line 429, col 0, score 1)
- [Eidolon Field Abstract Model — L198](eidolon-field-abstract-model.md#^ref-5e8b2388-198-0) (line 198, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Event Bus MVP — L571](event-bus-mvp.md#^ref-534fe91d-571-0) (line 571, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L180](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-180-0) (line 180, col 0, score 1)
- [AI-Centric OS with MCP Layer — L411](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-411-0) (line 411, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L235](cross-language-runtime-polymorphism.md#^ref-c34c36a6-235-0) (line 235, col 0, score 1)
- [Dynamic Context Model for Web Components — L425](dynamic-context-model-for-web-components.md#^ref-f7702bf8-425-0) (line 425, col 0, score 1)
- [heartbeat-simulation-snippets — L112](heartbeat-simulation-snippets.md#^ref-23e221e9-112-0) (line 112, col 0, score 1)
- [mystery-lisp-search-session — L137](mystery-lisp-search-session.md#^ref-513dc4c7-137-0) (line 137, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L33](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L85](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-85-0) (line 85, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [js-to-lisp-reverse-compiler — L418](js-to-lisp-reverse-compiler.md#^ref-58191024-418-0) (line 418, col 0, score 1)
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [sibilant-macro-targets — L178](sibilant-macro-targets.md#^ref-c5c9a5c6-178-0) (line 178, col 0, score 1)
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
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
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 1)
- [aionian-circuit-math — L184](aionian-circuit-math.md#^ref-f2d83a77-184-0) (line 184, col 0, score 1)
- [Board Walk – 2025-08-11 — L154](board-walk-2025-08-11.md#^ref-7aa1eb92-154-0) (line 154, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L208](chroma-toolkit-consolidation-plan.md#^ref-5020e892-208-0) (line 208, col 0, score 1)
- [Dynamic Context Model for Web Components — L437](dynamic-context-model-for-web-components.md#^ref-f7702bf8-437-0) (line 437, col 0, score 1)
- [eidolon-field-math-foundations — L175](eidolon-field-math-foundations.md#^ref-008f2ac0-175-0) (line 175, col 0, score 1)
- [Exception Layer Analysis — L173](exception-layer-analysis.md#^ref-21d5cc09-173-0) (line 173, col 0, score 1)
- [Factorio AI with External Agents — L162](factorio-ai-with-external-agents.md#^ref-a4d90289-162-0) (line 162, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L317](functional-embedding-pipeline-refactor.md#^ref-a4a25141-317-0) (line 317, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
