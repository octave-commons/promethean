---
uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
created_at: 2025.07.28.12.07.18.md
filename: Recursive Prompt Construction Engine
description: >-
  A self-expanding prompt system that uses LLMs to recursively generate and
  refine prompts through reflection and feedback loops, creating a dynamic
  prompt tree for continuous improvement.
tags:
  - recursive
  - prompt
  - reflection
  - llm
  - metaagent
  - semanticmemory
  - promptcompiler
  - sibilant
  - meta-llm
  - recursiveprompting
related_to_title: []
related_to_uuid: []
references: []
---
**Understood.** ^ref-babdb9eb-1-0
We're not just compiling prompts — we’re *growing them*. Dynamically. Reflexively. Using previous LLM calls to synthesize new prompts.

You're asking for a **recursive, reflective prompt assembly system** — a self-expanding prompt tree, where:

* Prompts can be generated **by LLMs** ^ref-babdb9eb-6-0
* Prompt *chunks* are composable ^ref-babdb9eb-7-0
* Metadata is tracked across prompt history ^ref-babdb9eb-8-0
* New prompts can be built from **annotated fragments**, summaries, or embeddings ^ref-babdb9eb-9-0

This is **Layer 3 meets Layer 4** of your architecture. The **symbolic/rational mind building its own query language** to interact with external cognition. ^ref-babdb9eb-11-0

Let’s sketch it. ^ref-babdb9eb-13-0

---

# 🧠 System Sketch: Recursive Prompt Construction Engine

## 🔁 High-Level Cycle

```plaintext
[Input → Prompt A] → [LLM Call → Output A]
                          ↓
         [Extract Prompt Fragments from Output A]
                          ↓
         [Assemble Prompt B from Prompt A + Extracted Chunks]
                          ↓
                      [LLM Call B]
                          ↓
                (repeat, reflect, grow)
```
^ref-babdb9eb-21-0

---

## 🧱 Core Mechanisms

### 1. **Prompt Fragment**
 ^ref-babdb9eb-39-0
A prompt fragment is a chunk of meaningful, structured prompt text + metadata.
 ^ref-babdb9eb-41-0
```sibilant
(deffragment summary-block
  :source "agent:duck"
  :content "User is attempting to build cross-runtime prompt compiler"
  :timestamp now
  :tags ["meta" "llm" "promethean"])
^ref-babdb9eb-41-0
``` ^ref-babdb9eb-49-0

This gets stored in `PromptMemory`.

---

### 2. **PromptMemory** ^ref-babdb9eb-55-0

A container of prior fragments. ^ref-babdb9eb-57-0

```sibilant
(defmemory prompt-memory (list summary-block context-hint prompt-a))

(fn recall (filter)
^ref-babdb9eb-57-0
  (filter prompt-memory filter)) ^ref-babdb9eb-64-0
```

Recall strategies might use:

* `tags`
* `source`
* `vector similarity`
* `response confidence`

---
 ^ref-babdb9eb-75-0
### 3. **Meta-LLM Prompt Constructor**
 ^ref-babdb9eb-77-0
Uses LLM itself to generate new prompts from memory fragments:

```sibilant
(defn build-prompt-from (goal)
  (let ((fragments (recall (match :goal goal)))
        (assembled (llm:call
                    (prompt
                      (system "You are a prompt designer.")
                      (user (+ "Assemble a new prompt to achieve this goal: " goal))
                      (examples fragments)
^ref-babdb9eb-77-0
                      :expects "prompt-structure")))) ^ref-babdb9eb-89-0
    (parse-response assembled)))
```

This **uses the LLM to build its own next prompt**. You’ve entered meta-cognition.

--- ^ref-babdb9eb-95-0

### 4. **PromptAssembler DSL**

```sibilant
(defprompt assemble-agent-summary
  :goal "summarize last 3 messages"
  :strategy "chunk + extract + compress"
  :input
    (concat
^ref-babdb9eb-95-0
      (fragment context:recent) ^ref-babdb9eb-106-0
      (fragment logs:conversation)
      (fragment agent:status)))
```

This is declarative. The actual content comes from memory + DSL plumbing.
 ^ref-babdb9eb-112-0
---
 ^ref-babdb9eb-114-0
## 🧠 Reflection + Feedback

Add a feedback loop:

```sibilant
(defn reflect (prompt response)
  (llm:call
    (prompt
      (system "You're a meta-prompt evaluator.")
^ref-babdb9eb-114-0
      (user (+ "Given the prompt: \n\n" prompt ^ref-babdb9eb-125-0
               "\n\nAnd the response:\n\n" response
               "\n\nWhat could improve the prompt?"))
      :expects "critique-summary")))
```
^ref-babdb9eb-127-0

And you store:
^ref-babdb9eb-127-0

```sibilant
(deffragment prompt-critique
  :source "meta"
  :content critique-summary)
^ref-babdb9eb-137-0
```
^ref-babdb9eb-137-0

---

## 🔧 Modular Macro Sketches

```sibilant
(macro prompt (…sections) `(assemble-prompt ,sections))

(macro deffragment (name &metadata)
  `(store-fragment ,name ,metadata))
^ref-babdb9eb-137-0

(macro defmemory (name fragments)
  `(store-memory ,name ,fragments))

(macro defprompt (name &options) ^ref-babdb9eb-154-0
^ref-babdb9eb-156-0 ^ref-babdb9eb-157-0
^ref-babdb9eb-154-0 ^ref-babdb9eb-158-0
  `(compile-structured-prompt ,name ,options)) ^ref-babdb9eb-159-0
^ref-babdb9eb-159-0 ^ref-babdb9eb-161-0
^ref-babdb9eb-158-0
^ref-babdb9eb-157-0
^ref-babdb9eb-156-0
^ref-babdb9eb-154-0
``` ^ref-babdb9eb-156-0
^ref-babdb9eb-159-0 ^ref-babdb9eb-167-0
^ref-babdb9eb-158-0
^ref-babdb9eb-157-0
^ref-babdb9eb-156-0
^ref-babdb9eb-154-0 ^ref-babdb9eb-171-0
^ref-babdb9eb-147-0
 ^ref-babdb9eb-157-0 ^ref-babdb9eb-161-0 ^ref-babdb9eb-167-0 ^ref-babdb9eb-173-0
--- ^ref-babdb9eb-158-0
 ^ref-babdb9eb-159-0
## 🧠 Final Vision ^ref-babdb9eb-176-0
 ^ref-babdb9eb-161-0 ^ref-babdb9eb-171-0
You’re constructing a:
 ^ref-babdb9eb-167-0 ^ref-babdb9eb-173-0
* **Recursive prompt building engine**
* **Semantic memory system**
* **LLM-driven compiler for prompts** ^ref-babdb9eb-176-0 ^ref-babdb9eb-182-0
* **Meta-LLM agent that rewrites its own instructions** ^ref-babdb9eb-167-0 ^ref-babdb9eb-171-0

You’re not building a chatbot. You’re building a **mind** that *thinks about its thoughts* and grows its queries over time. ^ref-babdb9eb-173-0

--- ^ref-babdb9eb-171-0
 ^ref-babdb9eb-176-0 ^ref-babdb9eb-182-0
## 🏷️ Tags ^ref-babdb9eb-173-0

\#sibilant #dsl #promptcompiler #reflection #llm #semanticmemory #metaagent #recursiveprompting #promethean
 ^ref-babdb9eb-176-0
---
 ^ref-babdb9eb-182-0
You want to build `deffragment`, `prompt-memory`, and the first `build-prompt-from` call next? Or define the core data model and memory indexing strategy? We can go either way — just say *deeper*.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [template-based-compilation](template-based-compilation.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Reawakening Duck](reawakening-duck.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [field-interaction-equations](field-interaction-equations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [EidolonField](eidolonfield.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [DSL](chunks/dsl.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Window Management](chunks/window-management.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [archetype-ecs](archetype-ecs.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Diagrams](chunks/diagrams.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Tooling](chunks/tooling.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Services](chunks/services.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Shared](chunks/shared.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [graph-ds](graph-ds.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Operations](chunks/operations.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Shared Package Structure](shared-package-structure.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean State Format](promethean-state-format.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Simple Log Example](simple-log-example.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [SentenceProcessing](sentenceprocessing.md)
- [refactor-relations](refactor-relations.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
## Sources
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [prompt-programming-language-lisp — L73](prompt-programming-language-lisp.md#^ref-d41a06d1-73-0) (line 73, col 0, score 0.6)
- [Reawakening Duck — L116](reawakening-duck.md#^ref-59b5670f-116-0) (line 116, col 0, score 0.6)
- [sibilant-macro-targets — L190](sibilant-macro-targets.md#^ref-c5c9a5c6-190-0) (line 190, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L176](sibilant-meta-prompt-dsl.md#^ref-af5d2824-176-0) (line 176, col 0, score 0.6)
- [sibilant-meta-string-templating-runtime — L119](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-119-0) (line 119, col 0, score 0.6)
- [sibilant-metacompiler-overview — L106](sibilant-metacompiler-overview.md#^ref-61d4086b-106-0) (line 106, col 0, score 0.6)
- [template-based-compilation — L132](template-based-compilation.md#^ref-f8877e5e-132-0) (line 132, col 0, score 0.71)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.7)
- [prompt-programming-language-lisp — L6](prompt-programming-language-lisp.md#^ref-d41a06d1-6-0) (line 6, col 0, score 0.78)
- [Cross-Target Macro System in Sibilant — L146](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-146-0) (line 146, col 0, score 0.74)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.71)
- [Promethean Agent Config DSL — L9](promethean-agent-config-dsl.md#^ref-2c00ce45-9-0) (line 9, col 0, score 0.65)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L67](sibilant-meta-prompt-dsl.md#^ref-af5d2824-67-0) (line 67, col 0, score 0.8)
- [Agent Reflections and Prompt Evolution — L102](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-102-0) (line 102, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L12](sibilant-meta-prompt-dsl.md#^ref-af5d2824-12-0) (line 12, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L345](dynamic-context-model-for-web-components.md#^ref-f7702bf8-345-0) (line 345, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L106](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-106-0) (line 106, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L123](cross-language-runtime-polymorphism.md#^ref-c34c36a6-123-0) (line 123, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L156](sibilant-meta-prompt-dsl.md#^ref-af5d2824-156-0) (line 156, col 0, score 0.73)
- [komorebi-group-window-hack — L186](komorebi-group-window-hack.md#^ref-dd89372d-186-0) (line 186, col 0, score 0.66)
- [Sibilant Meta-Prompt DSL — L18](sibilant-meta-prompt-dsl.md#^ref-af5d2824-18-0) (line 18, col 0, score 0.63)
- [The Jar of Echoes — L85](the-jar-of-echoes.md#^ref-18138627-85-0) (line 85, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L316](dynamic-context-model-for-web-components.md#^ref-f7702bf8-316-0) (line 316, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L74](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-74-0) (line 74, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L161](prompt-folder-bootstrap.md#^ref-bd4f0976-161-0) (line 161, col 0, score 0.69)
- [Vectorial Exception Descent — L8](vectorial-exception-descent.md#^ref-d771154e-8-0) (line 8, col 0, score 0.68)
- [Promethean State Format — L1](promethean-state-format.md#^ref-23df6ddb-1-0) (line 1, col 0, score 0.68)
- [Post-Linguistic Transhuman Design Frameworks — L15](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-15-0) (line 15, col 0, score 0.68)
- [Prompt_Folder_Bootstrap — L9](prompt-folder-bootstrap.md#^ref-bd4f0976-9-0) (line 9, col 0, score 0.68)
- [Promethean State Format — L78](promethean-state-format.md#^ref-23df6ddb-78-0) (line 78, col 0, score 0.68)
- [Agent Reflections and Prompt Evolution — L95](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-95-0) (line 95, col 0, score 0.67)
- [Agent Reflections and Prompt Evolution — L21](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-21-0) (line 21, col 0, score 0.59)
- [Post-Linguistic Transhuman Design Frameworks — L23](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-23-0) (line 23, col 0, score 0.67)
- [field-node-diagram-set — L3](field-node-diagram-set.md#^ref-22b989d5-3-0) (line 3, col 0, score 0.67)
- [field-interaction-equations — L3](field-interaction-equations.md#^ref-b09141b7-3-0) (line 3, col 0, score 0.67)
- [Post-Linguistic Transhuman Design Frameworks — L13](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-13-0) (line 13, col 0, score 0.67)
- [Promethean State Format — L34](promethean-state-format.md#^ref-23df6ddb-34-0) (line 34, col 0, score 0.56)
- [Post-Linguistic Transhuman Design Frameworks — L19](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-19-0) (line 19, col 0, score 0.66)
- [Vectorial Exception Descent — L24](vectorial-exception-descent.md#^ref-d771154e-24-0) (line 24, col 0, score 0.66)
- [promethean-system-diagrams — L34](promethean-system-diagrams.md#^ref-b51e19b4-34-0) (line 34, col 0, score 0.66)
- [field-node-diagram-set — L116](field-node-diagram-set.md#^ref-22b989d5-116-0) (line 116, col 0, score 0.74)
- [Promethean State Format — L3](promethean-state-format.md#^ref-23df6ddb-3-0) (line 3, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.69)
- [Smoke Resonance Visualizations — L1](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1-0) (line 1, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L37](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-37-0) (line 37, col 0, score 0.67)
- [Exception Layer Analysis — L5](exception-layer-analysis.md#^ref-21d5cc09-5-0) (line 5, col 0, score 0.66)
- [Layer1SurvivabilityEnvelope — L146](layer1survivabilityenvelope.md#^ref-64a9f9f9-146-0) (line 146, col 0, score 0.65)
- [mystery-lisp-search-session — L3](mystery-lisp-search-session.md#^ref-513dc4c7-3-0) (line 3, col 0, score 0.65)
- [Synchronicity Waves and Web — L3](synchronicity-waves-and-web.md#^ref-91295f3a-3-0) (line 3, col 0, score 0.63)
- [2d-sandbox-field — L18](2d-sandbox-field.md#^ref-c710dc93-18-0) (line 18, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L71](layer1survivabilityenvelope.md#^ref-64a9f9f9-71-0) (line 71, col 0, score 0.62)
- [Factorio AI with External Agents — L38](factorio-ai-with-external-agents.md#^ref-a4d90289-38-0) (line 38, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L93](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-93-0) (line 93, col 0, score 0.61)
- [layer-1-uptime-diagrams — L146](layer-1-uptime-diagrams.md#^ref-4127189a-146-0) (line 146, col 0, score 0.6)
- [Event Bus Projections Architecture — L143](event-bus-projections-architecture.md#^ref-cf6b9b17-143-0) (line 143, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L161](sibilant-meta-prompt-dsl.md#^ref-af5d2824-161-0) (line 161, col 0, score 0.74)
- [sibilant-meta-string-templating-runtime — L12](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-12-0) (line 12, col 0, score 0.81)
- [Duck's Self-Referential Perceptual Loop — L8](ducks-self-referential-perceptual-loop.md#^ref-71726f04-8-0) (line 8, col 0, score 0.73)
- [prompt-programming-language-lisp — L3](prompt-programming-language-lisp.md#^ref-d41a06d1-3-0) (line 3, col 0, score 0.72)
- [Sibilant Meta-Prompt DSL — L140](sibilant-meta-prompt-dsl.md#^ref-af5d2824-140-0) (line 140, col 0, score 0.68)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.67)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L379](dynamic-context-model-for-web-components.md#^ref-f7702bf8-379-0) (line 379, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L113](prompt-folder-bootstrap.md#^ref-bd4f0976-113-0) (line 113, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L44](sibilant-meta-prompt-dsl.md#^ref-af5d2824-44-0) (line 44, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.68)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L154](prompt-folder-bootstrap.md#^ref-bd4f0976-154-0) (line 154, col 0, score 0.68)
- [Prompt_Folder_Bootstrap — L75](prompt-folder-bootstrap.md#^ref-bd4f0976-75-0) (line 75, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.67)
- [sibilant-meta-string-templating-runtime — L105](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-105-0) (line 105, col 0, score 0.67)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.68)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.59)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.65)
- [Promethean Agent Config DSL — L125](promethean-agent-config-dsl.md#^ref-2c00ce45-125-0) (line 125, col 0, score 0.65)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.69)
- [sibilant-meta-string-templating-runtime — L97](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-97-0) (line 97, col 0, score 0.72)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.68)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.67)
- [smart-chatgpt-thingy — L10](smart-chatgpt-thingy.md#^ref-2facccf8-10-0) (line 10, col 0, score 0.67)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.67)
- [Voice Access Layer Design — L255](voice-access-layer-design.md#^ref-543ed9b3-255-0) (line 255, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L817](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-817-0) (line 817, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.66)
- [markdown-to-org-transpiler — L219](markdown-to-org-transpiler.md#^ref-ab54cdd8-219-0) (line 219, col 0, score 0.66)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L632](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-632-0) (line 632, col 0, score 0.65)
- [i3-bluetooth-setup — L45](i3-bluetooth-setup.md#^ref-5e408692-45-0) (line 45, col 0, score 0.66)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.66)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.72)
- [Prompt_Folder_Bootstrap — L44](prompt-folder-bootstrap.md#^ref-bd4f0976-44-0) (line 44, col 0, score 0.58)
- [markdown-to-org-transpiler — L3](markdown-to-org-transpiler.md#^ref-ab54cdd8-3-0) (line 3, col 0, score 0.62)
- [Voice Access Layer Design — L89](voice-access-layer-design.md#^ref-543ed9b3-89-0) (line 89, col 0, score 0.6)
- [Voice Access Layer Design — L95](voice-access-layer-design.md#^ref-543ed9b3-95-0) (line 95, col 0, score 0.6)
- [Voice Access Layer Design — L108](voice-access-layer-design.md#^ref-543ed9b3-108-0) (line 108, col 0, score 0.6)
- [Voice Access Layer Design — L114](voice-access-layer-design.md#^ref-543ed9b3-114-0) (line 114, col 0, score 0.6)
- [ripple-propagation-demo — L87](ripple-propagation-demo.md#^ref-8430617b-87-0) (line 87, col 0, score 0.71)
- [heartbeat-simulation-snippets — L65](heartbeat-simulation-snippets.md#^ref-23e221e9-65-0) (line 65, col 0, score 0.65)
- [ripple-propagation-demo — L9](ripple-propagation-demo.md#^ref-8430617b-9-0) (line 9, col 0, score 0.63)
- [The Jar of Echoes — L118](the-jar-of-echoes.md#^ref-18138627-118-0) (line 118, col 0, score 0.62)
- [The Jar of Echoes — L48](the-jar-of-echoes.md#^ref-18138627-48-0) (line 48, col 0, score 0.62)
- [heartbeat-fragment-demo — L9](heartbeat-fragment-demo.md#^ref-dd00677a-9-0) (line 9, col 0, score 0.61)
- [heartbeat-simulation-snippets — L9](heartbeat-simulation-snippets.md#^ref-23e221e9-9-0) (line 9, col 0, score 0.61)
- [heartbeat-simulation-snippets — L7](heartbeat-simulation-snippets.md#^ref-23e221e9-7-0) (line 7, col 0, score 0.61)
- [heartbeat-fragment-demo — L19](heartbeat-fragment-demo.md#^ref-dd00677a-19-0) (line 19, col 0, score 0.61)
- [heartbeat-simulation-snippets — L15](heartbeat-simulation-snippets.md#^ref-23e221e9-15-0) (line 15, col 0, score 0.61)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.6)
- [ripple-propagation-demo — L36](ripple-propagation-demo.md#^ref-8430617b-36-0) (line 36, col 0, score 0.59)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 0.59)
- [Protocol_0_The_Contradiction_Engine — L35](protocol-0-the-contradiction-engine.md#^ref-9a93a756-35-0) (line 35, col 0, score 0.64)
- [prompt-programming-language-lisp — L18](prompt-programming-language-lisp.md#^ref-d41a06d1-18-0) (line 18, col 0, score 0.72)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.56)
- [Dynamic Context Model for Web Components — L75](dynamic-context-model-for-web-components.md#^ref-f7702bf8-75-0) (line 75, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L47](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-47-0) (line 47, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L104](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-104-0) (line 104, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L117](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-117-0) (line 117, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.61)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.7)
- [Duck's Attractor States — L45](ducks-attractor-states.md#^ref-13951643-45-0) (line 45, col 0, score 0.7)
- [Agent Reflections and Prompt Evolution — L38](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-38-0) (line 38, col 0, score 0.69)
- [Voice Access Layer Design — L106](voice-access-layer-design.md#^ref-543ed9b3-106-0) (line 106, col 0, score 0.69)
- [Promethean Documentation Pipeline Overview — L27](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-27-0) (line 27, col 0, score 0.68)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.65)
- [prompt-programming-language-lisp — L5](prompt-programming-language-lisp.md#^ref-d41a06d1-5-0) (line 5, col 0, score 0.67)
- [SentenceProcessing — L29](sentenceprocessing.md#^ref-681a4ab2-29-0) (line 29, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.65)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L787](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-787-0) (line 787, col 0, score 0.64)
- [Promethean Agent Config DSL — L180](promethean-agent-config-dsl.md#^ref-2c00ce45-180-0) (line 180, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.64)
- [mystery-lisp-search-session — L27](mystery-lisp-search-session.md#^ref-513dc4c7-27-0) (line 27, col 0, score 0.64)
- [Event Bus Projections Architecture — L154](event-bus-projections-architecture.md#^ref-cf6b9b17-154-0) (line 154, col 0, score 0.63)
- [field-dynamics-math-blocks — L156](field-dynamics-math-blocks.md#^ref-7cfc230d-156-0) (line 156, col 0, score 0.63)
- [field-node-diagram-set — L151](field-node-diagram-set.md#^ref-22b989d5-151-0) (line 151, col 0, score 0.63)
- [graph-ds — L390](graph-ds.md#^ref-6620e2f2-390-0) (line 390, col 0, score 0.63)
- [heartbeat-fragment-demo — L113](heartbeat-fragment-demo.md#^ref-dd00677a-113-0) (line 113, col 0, score 0.63)
- [heartbeat-simulation-snippets — L103](heartbeat-simulation-snippets.md#^ref-23e221e9-103-0) (line 103, col 0, score 0.63)
- [homeostasis-decay-formulas — L163](homeostasis-decay-formulas.md#^ref-37b5d236-163-0) (line 163, col 0, score 0.63)
- [i3-config-validation-methods — L72](i3-config-validation-methods.md#^ref-d28090ac-72-0) (line 72, col 0, score 0.63)
- [Ice Box Reorganization — L82](ice-box-reorganization.md#^ref-291c7d91-82-0) (line 82, col 0, score 0.63)
- [Interop and Source Maps — L517](interop-and-source-maps.md#^ref-cdfac40c-517-0) (line 517, col 0, score 0.63)
- [komorebi-group-window-hack — L204](komorebi-group-window-hack.md#^ref-dd89372d-204-0) (line 204, col 0, score 0.63)
- [Duck's Self-Referential Perceptual Loop — L6](ducks-self-referential-perceptual-loop.md#^ref-71726f04-6-0) (line 6, col 0, score 0.67)
- [Duck's Self-Referential Perceptual Loop — L31](ducks-self-referential-perceptual-loop.md#^ref-71726f04-31-0) (line 31, col 0, score 0.73)
- [Reawakening Duck — L60](reawakening-duck.md#^ref-59b5670f-60-0) (line 60, col 0, score 0.72)
- [promethean-system-diagrams — L177](promethean-system-diagrams.md#^ref-b51e19b4-177-0) (line 177, col 0, score 0.71)
- [Duck's Attractor States — L1](ducks-attractor-states.md#^ref-13951643-1-0) (line 1, col 0, score 0.71)
- [windows-tiling-with-autohotkey — L78](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-78-0) (line 78, col 0, score 0.68)
- [Fnord Tracer Protocol — L118](fnord-tracer-protocol.md#^ref-fc21f824-118-0) (line 118, col 0, score 0.67)
- [Agent Reflections and Prompt Evolution — L52](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-52-0) (line 52, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L48](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-48-0) (line 48, col 0, score 0.65)
- [Fnord Tracer Protocol — L13](fnord-tracer-protocol.md#^ref-fc21f824-13-0) (line 13, col 0, score 0.64)
- [Agent Reflections and Prompt Evolution — L27](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-27-0) (line 27, col 0, score 0.73)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L338](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-338-0) (line 338, col 0, score 0.65)
- [aionian-circuit-math — L174](aionian-circuit-math.md#^ref-f2d83a77-174-0) (line 174, col 0, score 1)
- [DSL — L25](chunks/dsl.md#^ref-e87bc036-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#^ref-01b21543-610-0) (line 610, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#^ref-c34c36a6-203-0) (line 203, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L169](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-169-0) (line 169, col 0, score 1)
- [field-dynamics-math-blocks — L158](field-dynamics-math-blocks.md#^ref-7cfc230d-158-0) (line 158, col 0, score 1)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.74)
- [sibilant-macro-targets — L46](sibilant-macro-targets.md#^ref-c5c9a5c6-46-0) (line 46, col 0, score 0.73)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.72)
- [Sibilant Meta-Prompt DSL — L82](sibilant-meta-prompt-dsl.md#^ref-af5d2824-82-0) (line 82, col 0, score 0.72)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.71)
- [polyglot-repl-interface-layer — L96](polyglot-repl-interface-layer.md#^ref-9c79206d-96-0) (line 96, col 0, score 0.71)
- [Lisp-Compiler-Integration — L470](lisp-compiler-integration.md#^ref-cfee6d36-470-0) (line 470, col 0, score 0.7)
- [sibilant-macro-targets — L15](sibilant-macro-targets.md#^ref-c5c9a5c6-15-0) (line 15, col 0, score 0.7)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.78)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.65)
- [Synchronicity Waves and Web — L78](synchronicity-waves-and-web.md#^ref-91295f3a-78-0) (line 78, col 0, score 0.61)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.6)
- [Vectorial Exception Descent — L33](vectorial-exception-descent.md#^ref-d771154e-33-0) (line 33, col 0, score 0.58)
- [sibilant-meta-string-templating-runtime — L9](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-9-0) (line 9, col 0, score 0.57)
- [field-interaction-equations — L94](field-interaction-equations.md#^ref-b09141b7-94-0) (line 94, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L19](sibilant-meta-prompt-dsl.md#^ref-af5d2824-19-0) (line 19, col 0, score 0.81)
- [Promethean State Format — L17](promethean-state-format.md#^ref-23df6ddb-17-0) (line 17, col 0, score 0.65)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 1)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 1)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.58)
- [Protocol_0_The_Contradiction_Engine — L143](protocol-0-the-contradiction-engine.md#^ref-9a93a756-143-0) (line 143, col 0, score 0.57)
- [Provider-Agnostic Chat Panel Implementation — L236](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-236-0) (line 236, col 0, score 0.57)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L451](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-451-0) (line 451, col 0, score 0.57)
- [Pure TypeScript Search Microservice — L550](pure-typescript-search-microservice.md#^ref-d17d3a96-550-0) (line 550, col 0, score 0.57)
- [Reawakening Duck — L122](reawakening-duck.md#^ref-59b5670f-122-0) (line 122, col 0, score 0.57)
- [Redirecting Standard Error — L24](redirecting-standard-error.md#^ref-b3555ede-24-0) (line 24, col 0, score 0.57)
- [Self-Agency in AI Interaction — L46](self-agency-in-ai-interaction.md#^ref-49a9a860-46-0) (line 46, col 0, score 0.57)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#^ref-5020e892-200-0) (line 200, col 0, score 1)
- [DSL — L32](chunks/dsl.md#^ref-e87bc036-32-0) (line 32, col 0, score 1)
- [Window Management — L27](chunks/window-management.md#^ref-9e8ae388-27-0) (line 27, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L206](cross-language-runtime-polymorphism.md#^ref-c34c36a6-206-0) (line 206, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L174](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-174-0) (line 174, col 0, score 1)
- [komorebi-group-window-hack — L201](komorebi-group-window-hack.md#^ref-dd89372d-201-0) (line 201, col 0, score 1)
- [Lisp-Compiler-Integration — L548](lisp-compiler-integration.md#^ref-cfee6d36-548-0) (line 548, col 0, score 1)
- [lisp-dsl-for-window-management — L217](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-217-0) (line 217, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L198](chroma-toolkit-consolidation-plan.md#^ref-5020e892-198-0) (line 198, col 0, score 1)
- [compiler-kit-foundations — L625](compiler-kit-foundations.md#^ref-01b21543-625-0) (line 625, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L202](cross-language-runtime-polymorphism.md#^ref-c34c36a6-202-0) (line 202, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L172](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-172-0) (line 172, col 0, score 1)
- [Duck's Attractor States — L83](ducks-attractor-states.md#^ref-13951643-83-0) (line 83, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L39](ducks-self-referential-perceptual-loop.md#^ref-71726f04-39-0) (line 39, col 0, score 1)
- [field-interaction-equations — L176](field-interaction-equations.md#^ref-b09141b7-176-0) (line 176, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L317](migrate-to-provider-tenant-architecture.md#^ref-54382370-317-0) (line 317, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 1)
- [Universal Lisp Interface — L173](universal-lisp-interface.md#^ref-b01856b4-173-0) (line 173, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.65)
- [field-interaction-equations — L175](field-interaction-equations.md#^ref-b09141b7-175-0) (line 175, col 0, score 1)
- [layer-1-uptime-diagrams — L183](layer-1-uptime-diagrams.md#^ref-4127189a-183-0) (line 183, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
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
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
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
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 1)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 1)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 1)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 1)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L233](cross-language-runtime-polymorphism.md#^ref-c34c36a6-233-0) (line 233, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 1)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#^ref-c62a1815-429-0) (line 429, col 0, score 1)
- [Eidolon Field Abstract Model — L198](eidolon-field-abstract-model.md#^ref-5e8b2388-198-0) (line 198, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Event Bus MVP — L571](event-bus-mvp.md#^ref-534fe91d-571-0) (line 571, col 0, score 1)
- [field-node-diagram-outline — L114](field-node-diagram-outline.md#^ref-1f32c94a-114-0) (line 114, col 0, score 1)
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
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L179](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-179-0) (line 179, col 0, score 1)
- [AI-Centric OS with MCP Layer — L410](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-410-0) (line 410, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L234](cross-language-runtime-polymorphism.md#^ref-c34c36a6-234-0) (line 234, col 0, score 1)
- [Dynamic Context Model for Web Components — L394](dynamic-context-model-for-web-components.md#^ref-f7702bf8-394-0) (line 394, col 0, score 1)
- [heartbeat-simulation-snippets — L111](heartbeat-simulation-snippets.md#^ref-23e221e9-111-0) (line 111, col 0, score 1)
- [mystery-lisp-search-session — L135](mystery-lisp-search-session.md#^ref-513dc4c7-135-0) (line 135, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L33](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L84](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-84-0) (line 84, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L180](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-180-0) (line 180, col 0, score 1)
- [AI-Centric OS with MCP Layer — L411](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-411-0) (line 411, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L235](cross-language-runtime-polymorphism.md#^ref-c34c36a6-235-0) (line 235, col 0, score 1)
- [Dynamic Context Model for Web Components — L425](dynamic-context-model-for-web-components.md#^ref-f7702bf8-425-0) (line 425, col 0, score 1)
- [heartbeat-simulation-snippets — L112](heartbeat-simulation-snippets.md#^ref-23e221e9-112-0) (line 112, col 0, score 1)
- [mystery-lisp-search-session — L137](mystery-lisp-search-session.md#^ref-513dc4c7-137-0) (line 137, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L33](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L85](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-85-0) (line 85, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [js-to-lisp-reverse-compiler — L412](js-to-lisp-reverse-compiler.md#^ref-58191024-412-0) (line 412, col 0, score 1)
- [2d-sandbox-field — L199](2d-sandbox-field.md#^ref-c710dc93-199-0) (line 199, col 0, score 1)
- [Diagrams — L36](chunks/diagrams.md#^ref-45cd25b5-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L631](compiler-kit-foundations.md#^ref-01b21543-631-0) (line 631, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L220](cross-language-runtime-polymorphism.md#^ref-c34c36a6-220-0) (line 220, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L191](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-191-0) (line 191, col 0, score 1)
- [Duck's Attractor States — L69](ducks-attractor-states.md#^ref-13951643-69-0) (line 69, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L37](ducks-self-referential-perceptual-loop.md#^ref-71726f04-37-0) (line 37, col 0, score 1)
- [EidolonField — L244](eidolonfield.md#^ref-49d1e1e5-244-0) (line 244, col 0, score 1)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 0.58)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 0.58)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 0.58)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 0.58)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 0.58)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 0.58)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 0.58)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 0.58)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 0.58)
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
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [js-to-lisp-reverse-compiler — L418](js-to-lisp-reverse-compiler.md#^ref-58191024-418-0) (line 418, col 0, score 1)
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
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
- [Diagrams — L22](chunks/diagrams.md#^ref-45cd25b5-22-0) (line 22, col 0, score 1)
- [Shared — L21](chunks/shared.md#^ref-623a55f7-21-0) (line 21, col 0, score 1)
- [Duck's Attractor States — L60](ducks-attractor-states.md#^ref-13951643-60-0) (line 60, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L53](ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0) (line 53, col 0, score 1)
- [Event Bus Projections Architecture — L180](event-bus-projections-architecture.md#^ref-cf6b9b17-180-0) (line 180, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L288](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-288-0) (line 288, col 0, score 1)
- [Reawakening Duck — L129](reawakening-duck.md#^ref-59b5670f-129-0) (line 129, col 0, score 1)
- [Smoke Resonance Visualizations — L78](smoke-resonance-visualizations.md#^ref-ac9d3ac5-78-0) (line 78, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L218](chroma-toolkit-consolidation-plan.md#^ref-5020e892-218-0) (line 218, col 0, score 1)
- [DSL — L21](chunks/dsl.md#^ref-e87bc036-21-0) (line 21, col 0, score 1)
- [Window Management — L12](chunks/window-management.md#^ref-9e8ae388-12-0) (line 12, col 0, score 1)
- [compiler-kit-foundations — L638](compiler-kit-foundations.md#^ref-01b21543-638-0) (line 638, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L259](cross-language-runtime-polymorphism.md#^ref-c34c36a6-259-0) (line 259, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L217](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-217-0) (line 217, col 0, score 1)
- [Interop and Source Maps — L543](interop-and-source-maps.md#^ref-cdfac40c-543-0) (line 543, col 0, score 1)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#^ref-cfee6d36-553-0) (line 553, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
