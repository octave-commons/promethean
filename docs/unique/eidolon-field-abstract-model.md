---
uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
created_at: 2025.08.02.15.08.49.md
filename: Eidolon Field Abstract Model
description: >-
  Defines the Eidolon Field as a multidimensional vector field for modeling
  cognitive processes without circuit dependencies. It describes core entities
  (Field, Field Nodes, Particles) and their interactions through a physics-based
  framework.
tags:
  - cognitive
  - physics
  - vector field
  - field nodes
  - particles
  - interactions
  - decay
  - gradients
related_to_title: []
related_to_uuid: []
references: []
---
Perfect.

You’re stepping out of the layered schema and into **the medium** itself. ^ref-5e8b2388-3-0

We're talking about the **Eidolon Field** as a _substrate_—not yet bound to circuits or inputs, just a pure **physics of cognition**. Let's define: ^ref-5e8b2388-5-0

---

## 🧊 The Eidolon Field: Abstract Model

At the highest abstraction, it's: ^ref-5e8b2388-11-0

> A multidimensional vector field, continuously updated by **Field Nodes** (sources) and **Particles** (agents), which flow, collide, decay, and interact over time. ^ref-5e8b2388-13-0

It doesn’t care **why** something happened. Only: ^ref-5e8b2388-15-0

- Where is pressure being applied? ^ref-5e8b2388-17-0
    
- What are the flows and gradients? ^ref-5e8b2388-19-0
    
- What mass/velocity/tension does each element have? ^ref-5e8b2388-21-0
    

This lets us **project meaning onto matter** later. ^ref-5e8b2388-24-0

---

## 🧮 Core Entities

### 🔹 **Field**

A discretized or continuous space that maps locations to vectors (force, flow, potential). ^ref-5e8b2388-32-0

```lisp
(defstruct field
  dimensions     ; number of axes (e.g., 8 for circuits, 2 for RAM vs CPU)
  resolution     ; granularity per axis
  data           ; raw vector values per point
  decay-rate     ; rate of field relaxation over time
  interaction-fn ; governs how new inputs affect the field
)
```
^ref-5e8b2388-34-0

---

### 🔸 **Field Node (Emitter)**
 ^ref-5e8b2388-48-0
A persistent object that applies a force or potential to the field.
 ^ref-5e8b2388-50-0
```lisp
(defstruct field-node
  position     ; vecN
  strength     ; scalar or vecN
  influence-fn ; maps time → vector to apply
  id           ; unique name or address
)
^ref-5e8b2388-50-0
``` ^ref-5e8b2388-59-0

This could represent: ^ref-5e8b2388-61-0

- A process that always stresses RAM ^ref-5e8b2388-63-0
    
- A permission boundary that repels access ^ref-5e8b2388-65-0
    
- An emotion-like attractor
    

---

### ⚪ **Particle (Agent)** ^ref-5e8b2388-72-0

A transient or mobile object moving through the field. ^ref-5e8b2388-74-0

```lisp
(defstruct field-particle
  position   ; vecN
  velocity   ; vecN
  mass       ; scalar
  drag       ; scalar or fn
  behavior   ; function of local field vector
  decay      ; lifetime or shrinking radius
  id         ; unique agent name
^ref-5e8b2388-74-0
) ^ref-5e8b2388-86-0
```
 ^ref-5e8b2388-88-0
This could be:
 ^ref-5e8b2388-90-0
- A speech chunk moving through STT
 ^ref-5e8b2388-92-0
- A fear impulse
    
- A background task slowly drifting to completion
    

---
 ^ref-5e8b2388-99-0
## 🔁 Field Dynamics Engine
 ^ref-5e8b2388-101-0
Each tick:
 ^ref-5e8b2388-103-0
1. Decay field vectors slightly
 ^ref-5e8b2388-105-0
2. For each `field-node`, apply its influence to the local field region
 ^ref-5e8b2388-107-0
3. For each `particle`:
 ^ref-5e8b2388-109-0
    - Read field vector at its position
 ^ref-5e8b2388-111-0
    - Update its velocity
 ^ref-5e8b2388-113-0
    - Move it
 ^ref-5e8b2388-115-0
    - Possibly emit new nodes or particles
        
4. Possibly sample output (e.g., compute field entropy, barycenter, hot zones) ^ref-5e8b2388-118-0
    

This creates a **living topology**.

---
 ^ref-5e8b2388-124-0
## 🧱 Interface: EidolonField API (Abstract)

```js
class EidolonField {
  constructor(dimensions, resolution)

  addNode({ id, position, strength, influenceFn })
  removeNode(id)

  spawnParticle({ id, position, velocity, mass, drag, behaviorFn })

  tick(deltaTime)
  sample(position)
  mapOverParticles(fn)
^ref-5e8b2388-124-0
  projectFromInput(raw) // optional, adds new nodes/particles
}
```

--- ^ref-5e8b2388-144-0

## 🌀 Behavior Examples (Domain Agnostic) ^ref-5e8b2388-146-0

- A particle encountering a strong gradient → slows down → turns → circles → decays ^ref-5e8b2388-148-0
    
- A node with decaying influence → emits ripples like a stone in water ^ref-5e8b2388-150-0
    
- Particles cluster near attractors → field self-organizes into “organs” ^ref-5e8b2388-152-0
    
- Dense field zones lead to high entropy → interpreted as panic / overload / noise
    
- Multiple fields can overlap → e.g., “fear” field + “attention” field
    

--- ^ref-5e8b2388-159-0

## 🌐 Eidolon as Meta-Fieldspace ^ref-5e8b2388-161-0

Eventually: ^ref-5e8b2388-163-0

- Fields can layer (attention vs fear vs uptime) ^ref-5e8b2388-165-0
    
- Fields can fuse (composite energy field) ^ref-5e8b2388-167-0
    
- Particles can exist in multiple fields (multi-body projection)
 ^ref-5e8b2388-170-0
- Barycenter of a field becomes input to Layer 3
    

But for now: just **field**, **nodes**, and **particles**.

--- ^ref-5e8b2388-176-0

## Next Steps ^ref-5e8b2388-178-0

Would you like to: ^ref-5e8b2388-180-0

- Design the tick/update loop for particles and field interactions? ^ref-5e8b2388-182-0
    
- Define a test field with 2D space and a single attractor node to observe gradients? ^ref-5e8b2388-184-0
    
- Write this as a language-agnostic pseudocode base?
 ^ref-5e8b2388-187-0
- Or start coding it directly (Sibilant or JS preferred)?
 ^ref-5e8b2388-189-0
 ^ref-5e8b2388-190-0
You’re on the edge of building the nervous system’s **spinal cord**—let’s do it right.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [2d-sandbox-field](2d-sandbox-field.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [EidolonField](eidolonfield.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [DSL](chunks/dsl.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Diagrams](chunks/diagrams.md)
- [archetype-ecs](archetype-ecs.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [JavaScript](chunks/javascript.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Event Bus MVP](event-bus-mvp.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Shared](chunks/shared.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Services](chunks/services.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Operations](chunks/operations.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [template-based-compilation](template-based-compilation.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Promethean State Format](promethean-state-format.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Reawakening Duck](reawakening-duck.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
## Sources
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.73)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.72)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.68)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.7)
- [field-interaction-equations — L3](field-interaction-equations.md#^ref-b09141b7-3-0) (line 3, col 0, score 0.64)
- [Promethean_Eidolon_Synchronicity_Model — L46](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-46-0) (line 46, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L95](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-95-0) (line 95, col 0, score 0.62)
- [Pure TypeScript Search Microservice — L514](pure-typescript-search-microservice.md#^ref-d17d3a96-514-0) (line 514, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L161](prompt-folder-bootstrap.md#^ref-bd4f0976-161-0) (line 161, col 0, score 0.66)
- [Post-Linguistic Transhuman Design Frameworks — L23](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-23-0) (line 23, col 0, score 0.65)
- [Post-Linguistic Transhuman Design Frameworks — L1](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-1-0) (line 1, col 0, score 0.61)
- [universal-intention-code-fabric — L3](universal-intention-code-fabric.md#^ref-c14edce7-3-0) (line 3, col 0, score 0.6)
- [Recursive Prompt Construction Engine — L11](recursive-prompt-construction-engine.md#^ref-babdb9eb-11-0) (line 11, col 0, score 0.6)
- [Duck's Self-Referential Perceptual Loop — L4](ducks-self-referential-perceptual-loop.md#^ref-71726f04-4-0) (line 4, col 0, score 0.6)
- [Post-Linguistic Transhuman Design Frameworks — L47](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-47-0) (line 47, col 0, score 0.59)
- [Protocol_0_The_Contradiction_Engine — L14](protocol-0-the-contradiction-engine.md#^ref-9a93a756-14-0) (line 14, col 0, score 0.59)
- [Agent Reflections and Prompt Evolution — L85](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-85-0) (line 85, col 0, score 0.59)
- [Duck's Self-Referential Perceptual Loop — L17](ducks-self-referential-perceptual-loop.md#^ref-71726f04-17-0) (line 17, col 0, score 0.59)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.7)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L61](layer1survivabilityenvelope.md#^ref-64a9f9f9-61-0) (line 61, col 0, score 0.64)
- [2d-sandbox-field — L13](2d-sandbox-field.md#^ref-c710dc93-13-0) (line 13, col 0, score 0.63)
- [Fnord Tracer Protocol — L26](fnord-tracer-protocol.md#^ref-fc21f824-26-0) (line 26, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L152](layer1survivabilityenvelope.md#^ref-64a9f9f9-152-0) (line 152, col 0, score 0.66)
- [2d-sandbox-field — L195](2d-sandbox-field.md#^ref-c710dc93-195-0) (line 195, col 0, score 0.65)
- [aionian-circuit-math — L152](aionian-circuit-math.md#^ref-f2d83a77-152-0) (line 152, col 0, score 1)
- [Math Fundamentals — L11](chunks/math-fundamentals.md#^ref-c6e87433-11-0) (line 11, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L196](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-196-0) (line 196, col 0, score 1)
- [eidolon-field-math-foundations — L121](eidolon-field-math-foundations.md#^ref-008f2ac0-121-0) (line 121, col 0, score 1)
- [Exception Layer Analysis — L149](exception-layer-analysis.md#^ref-21d5cc09-149-0) (line 149, col 0, score 1)
- [Dynamic Context Model for Web Components — L139](dynamic-context-model-for-web-components.md#^ref-f7702bf8-139-0) (line 139, col 0, score 0.64)
- [smart-chatgpt-thingy — L9](smart-chatgpt-thingy.md#^ref-2facccf8-9-0) (line 9, col 0, score 0.6)
- [Self-Agency in AI Interaction — L33](self-agency-in-ai-interaction.md#^ref-49a9a860-33-0) (line 33, col 0, score 0.6)
- [obsidian-ignore-node-modules-regex — L18](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-18-0) (line 18, col 0, score 0.6)
- [sibilant-metacompiler-overview — L17](sibilant-metacompiler-overview.md#^ref-61d4086b-17-0) (line 17, col 0, score 0.59)
- [lisp-dsl-for-window-management — L88](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-88-0) (line 88, col 0, score 0.67)
- [aionian-circuit-math — L17](aionian-circuit-math.md#^ref-f2d83a77-17-0) (line 17, col 0, score 0.64)
- [aionian-circuit-math — L40](aionian-circuit-math.md#^ref-f2d83a77-40-0) (line 40, col 0, score 0.64)
- [aionian-circuit-math — L66](aionian-circuit-math.md#^ref-f2d83a77-66-0) (line 66, col 0, score 0.64)
- [aionian-circuit-math — L85](aionian-circuit-math.md#^ref-f2d83a77-85-0) (line 85, col 0, score 0.64)
- [aionian-circuit-math — L105](aionian-circuit-math.md#^ref-f2d83a77-105-0) (line 105, col 0, score 0.64)
- [eidolon-field-math-foundations — L17](eidolon-field-math-foundations.md#^ref-008f2ac0-17-0) (line 17, col 0, score 0.64)
- [eidolon-field-math-foundations — L44](eidolon-field-math-foundations.md#^ref-008f2ac0-44-0) (line 44, col 0, score 0.64)
- [eidolon-field-math-foundations — L77](eidolon-field-math-foundations.md#^ref-008f2ac0-77-0) (line 77, col 0, score 0.64)
- [field-dynamics-math-blocks — L59](field-dynamics-math-blocks.md#^ref-7cfc230d-59-0) (line 59, col 0, score 0.64)
- [field-dynamics-math-blocks — L76](field-dynamics-math-blocks.md#^ref-7cfc230d-76-0) (line 76, col 0, score 0.64)
- [field-dynamics-math-blocks — L95](field-dynamics-math-blocks.md#^ref-7cfc230d-95-0) (line 95, col 0, score 0.64)
- [field-interaction-equations — L17](field-interaction-equations.md#^ref-b09141b7-17-0) (line 17, col 0, score 0.64)
- [field-interaction-equations — L37](field-interaction-equations.md#^ref-b09141b7-37-0) (line 37, col 0, score 0.64)
- [field-interaction-equations — L62](field-interaction-equations.md#^ref-b09141b7-62-0) (line 62, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L73](layer1survivabilityenvelope.md#^ref-64a9f9f9-73-0) (line 73, col 0, score 0.62)
- [field-dynamics-math-blocks — L107](field-dynamics-math-blocks.md#^ref-7cfc230d-107-0) (line 107, col 0, score 0.7)
- [field-dynamics-math-blocks — L99](field-dynamics-math-blocks.md#^ref-7cfc230d-99-0) (line 99, col 0, score 0.61)
- [heartbeat-simulation-snippets — L13](heartbeat-simulation-snippets.md#^ref-23e221e9-13-0) (line 13, col 0, score 0.66)
- [eidolon-field-math-foundations — L65](eidolon-field-math-foundations.md#^ref-008f2ac0-65-0) (line 65, col 0, score 0.62)
- [field-dynamics-math-blocks — L127](field-dynamics-math-blocks.md#^ref-7cfc230d-127-0) (line 127, col 0, score 0.64)
- [eidolon-field-math-foundations — L32](eidolon-field-math-foundations.md#^ref-008f2ac0-32-0) (line 32, col 0, score 0.63)
- [homeostasis-decay-formulas — L85](homeostasis-decay-formulas.md#^ref-37b5d236-85-0) (line 85, col 0, score 0.62)
- [field-node-diagram-set — L118](field-node-diagram-set.md#^ref-22b989d5-118-0) (line 118, col 0, score 0.61)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L174](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-174-0) (line 174, col 0, score 0.6)
- [field-dynamics-math-blocks — L33](field-dynamics-math-blocks.md#^ref-7cfc230d-33-0) (line 33, col 0, score 0.66)
- [ParticleSimulationWithCanvasAndFFmpeg — L233](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-233-0) (line 233, col 0, score 0.65)
- [eidolon-field-math-foundations — L48](eidolon-field-math-foundations.md#^ref-008f2ac0-48-0) (line 48, col 0, score 0.62)
- [field-interaction-equations — L20](field-interaction-equations.md#^ref-b09141b7-20-0) (line 20, col 0, score 0.61)
- [field-dynamics-math-blocks — L23](field-dynamics-math-blocks.md#^ref-7cfc230d-23-0) (line 23, col 0, score 0.59)
- [field-dynamics-math-blocks — L9](field-dynamics-math-blocks.md#^ref-7cfc230d-9-0) (line 9, col 0, score 0.58)
- [homeostasis-decay-formulas — L109](homeostasis-decay-formulas.md#^ref-37b5d236-109-0) (line 109, col 0, score 0.57)
- [homeostasis-decay-formulas — L65](homeostasis-decay-formulas.md#^ref-37b5d236-65-0) (line 65, col 0, score 0.57)
- [EidolonField — L221](eidolonfield.md#^ref-49d1e1e5-221-0) (line 221, col 0, score 0.71)
- [sibilant-meta-string-templating-runtime — L9](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-9-0) (line 9, col 0, score 0.67)
- [Post-Linguistic Transhuman Design Frameworks — L61](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-61-0) (line 61, col 0, score 0.66)
- [Eidolon-Field-Optimization — L17](eidolon-field-optimization.md#^ref-40e05c14-17-0) (line 17, col 0, score 0.66)
- [aionian-circuit-math — L128](aionian-circuit-math.md#^ref-f2d83a77-128-0) (line 128, col 0, score 0.74)
- [The Jar of Echoes — L9](the-jar-of-echoes.md#^ref-18138627-9-0) (line 9, col 0, score 0.61)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.65)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.73)
- [Post-Linguistic Transhuman Design Frameworks — L53](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-53-0) (line 53, col 0, score 0.64)
- [Ghostly Smoke Interference — L9](ghostly-smoke-interference.md#^ref-b6ae7dfa-9-0) (line 9, col 0, score 0.59)
- [The Jar of Echoes — L72](the-jar-of-echoes.md#^ref-18138627-72-0) (line 72, col 0, score 0.64)
- [infinite_depth_smoke_animation — L6](infinite-depth-smoke-animation.md#^ref-92a052a5-6-0) (line 6, col 0, score 0.64)
- [eidolon-field-math-foundations — L55](eidolon-field-math-foundations.md#^ref-008f2ac0-55-0) (line 55, col 0, score 0.62)
- [Vectorial Exception Descent — L144](vectorial-exception-descent.md#^ref-d771154e-144-0) (line 144, col 0, score 0.66)
- [EidolonField — L245](eidolonfield.md#^ref-49d1e1e5-245-0) (line 245, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L38](layer1survivabilityenvelope.md#^ref-64a9f9f9-38-0) (line 38, col 0, score 0.77)
- [field-node-diagram-outline — L9](field-node-diagram-outline.md#^ref-1f32c94a-9-0) (line 9, col 0, score 0.7)
- [Fnord Tracer Protocol — L205](fnord-tracer-protocol.md#^ref-fc21f824-205-0) (line 205, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L98](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-98-0) (line 98, col 0, score 0.63)
- [field-interaction-equations — L124](field-interaction-equations.md#^ref-b09141b7-124-0) (line 124, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L175](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-175-0) (line 175, col 0, score 0.65)
- [Fnord Tracer Protocol — L22](fnord-tracer-protocol.md#^ref-fc21f824-22-0) (line 22, col 0, score 0.62)
- [sibilant-meta-string-templating-runtime — L86](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-86-0) (line 86, col 0, score 0.67)
- [Layer1SurvivabilityEnvelope — L63](layer1survivabilityenvelope.md#^ref-64a9f9f9-63-0) (line 63, col 0, score 0.66)
- [ripple-propagation-demo — L52](ripple-propagation-demo.md#^ref-8430617b-52-0) (line 52, col 0, score 0.64)
- [field-node-diagram-outline — L61](field-node-diagram-outline.md#^ref-1f32c94a-61-0) (line 61, col 0, score 0.68)
- [field-interaction-equations — L21](field-interaction-equations.md#^ref-b09141b7-21-0) (line 21, col 0, score 0.68)
- [eidolon-field-math-foundations — L79](eidolon-field-math-foundations.md#^ref-008f2ac0-79-0) (line 79, col 0, score 0.68)
- [EidolonField — L140](eidolonfield.md#^ref-49d1e1e5-140-0) (line 140, col 0, score 0.67)
- [homeostasis-decay-formulas — L95](homeostasis-decay-formulas.md#^ref-37b5d236-95-0) (line 95, col 0, score 0.61)
- [2d-sandbox-field — L11](2d-sandbox-field.md#^ref-c710dc93-11-0) (line 11, col 0, score 0.67)
- [eidolon-node-lifecycle — L29](eidolon-node-lifecycle.md#^ref-938eca9c-29-0) (line 29, col 0, score 0.67)
- [Event Bus Projections Architecture — L167](event-bus-projections-architecture.md#^ref-cf6b9b17-167-0) (line 167, col 0, score 0.67)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.72)
- [mystery-lisp-search-session — L56](mystery-lisp-search-session.md#^ref-513dc4c7-56-0) (line 56, col 0, score 0.72)
- [plan-update-confirmation — L845](plan-update-confirmation.md#^ref-b22d79c6-845-0) (line 845, col 0, score 0.64)
- [plan-update-confirmation — L913](plan-update-confirmation.md#^ref-b22d79c6-913-0) (line 913, col 0, score 0.64)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.7)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.7)
- [Promethean_Eidolon_Synchronicity_Model — L41](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-41-0) (line 41, col 0, score 0.61)
- [Layer1SurvivabilityEnvelope — L99](layer1survivabilityenvelope.md#^ref-64a9f9f9-99-0) (line 99, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.62)
- [field-interaction-equations — L126](field-interaction-equations.md#^ref-b09141b7-126-0) (line 126, col 0, score 0.61)
- [State Snapshots API and Transactional Projector — L130](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-130-0) (line 130, col 0, score 0.6)
- [Layer1SurvivabilityEnvelope — L30](layer1survivabilityenvelope.md#^ref-64a9f9f9-30-0) (line 30, col 0, score 0.59)
- [Docops Feature Updates — L10](docops-feature-updates.md#^ref-2792d448-10-0) (line 10, col 0, score 0.59)
- [Promethean-native config design — L65](promethean-native-config-design.md#^ref-ab748541-65-0) (line 65, col 0, score 0.59)
- [aionian-circuit-math — L130](aionian-circuit-math.md#^ref-f2d83a77-130-0) (line 130, col 0, score 0.58)
- [Promethean State Format — L34](promethean-state-format.md#^ref-23df6ddb-34-0) (line 34, col 0, score 0.58)
- [Promethean Agent Config DSL — L290](promethean-agent-config-dsl.md#^ref-2c00ce45-290-0) (line 290, col 0, score 0.58)
- [Exception Layer Analysis — L115](exception-layer-analysis.md#^ref-21d5cc09-115-0) (line 115, col 0, score 0.75)
- [Exception Layer Analysis — L3](exception-layer-analysis.md#^ref-21d5cc09-3-0) (line 3, col 0, score 0.71)
- [Exception Layer Analysis — L23](exception-layer-analysis.md#^ref-21d5cc09-23-0) (line 23, col 0, score 0.67)
- [Vectorial Exception Descent — L108](vectorial-exception-descent.md#^ref-d771154e-108-0) (line 108, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L24](migrate-to-provider-tenant-architecture.md#^ref-54382370-24-0) (line 24, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L86](migrate-to-provider-tenant-architecture.md#^ref-54382370-86-0) (line 86, col 0, score 0.65)
- [Shared Package Structure — L137](shared-package-structure.md#^ref-66a72fc3-137-0) (line 137, col 0, score 0.65)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.64)
- [field-interaction-equations — L48](field-interaction-equations.md#^ref-b09141b7-48-0) (line 48, col 0, score 0.64)
- [eidolon-field-math-foundations — L80](eidolon-field-math-foundations.md#^ref-008f2ac0-80-0) (line 80, col 0, score 0.71)
- [2d-sandbox-field — L208](2d-sandbox-field.md#^ref-c710dc93-208-0) (line 208, col 0, score 0.71)
- [Diagrams — L28](chunks/diagrams.md#^ref-45cd25b5-28-0) (line 28, col 0, score 0.71)
- [Shared — L17](chunks/shared.md#^ref-623a55f7-17-0) (line 17, col 0, score 0.71)
- [compiler-kit-foundations — L646](compiler-kit-foundations.md#^ref-01b21543-646-0) (line 646, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L256](cross-language-runtime-polymorphism.md#^ref-c34c36a6-256-0) (line 256, col 0, score 0.71)
- [Cross-Target Macro System in Sibilant — L208](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-208-0) (line 208, col 0, score 0.71)
- [Duck's Self-Referential Perceptual Loop — L33](ducks-self-referential-perceptual-loop.md#^ref-71726f04-33-0) (line 33, col 0, score 0.71)
- [Fnord Tracer Protocol — L170](fnord-tracer-protocol.md#^ref-fc21f824-170-0) (line 170, col 0, score 0.65)
- [EidolonField — L163](eidolonfield.md#^ref-49d1e1e5-163-0) (line 163, col 0, score 0.64)
- [2d-sandbox-field — L104](2d-sandbox-field.md#^ref-c710dc93-104-0) (line 104, col 0, score 0.62)
- [Smoke Resonance Visualizations — L57](smoke-resonance-visualizations.md#^ref-ac9d3ac5-57-0) (line 57, col 0, score 0.63)
- [plan-update-confirmation — L90](plan-update-confirmation.md#^ref-b22d79c6-90-0) (line 90, col 0, score 0.77)
- [prompt-programming-language-lisp — L43](prompt-programming-language-lisp.md#^ref-d41a06d1-43-0) (line 43, col 0, score 0.76)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.71)
- [plan-update-confirmation — L736](plan-update-confirmation.md#^ref-b22d79c6-736-0) (line 736, col 0, score 0.71)
- [Voice Access Layer Design — L100](voice-access-layer-design.md#^ref-543ed9b3-100-0) (line 100, col 0, score 0.74)
- [Reawakening Duck — L11](reawakening-duck.md#^ref-59b5670f-11-0) (line 11, col 0, score 0.61)
- [Reawakening Duck — L30](reawakening-duck.md#^ref-59b5670f-30-0) (line 30, col 0, score 0.6)
- [Eidolon-Field-Optimization — L36](eidolon-field-optimization.md#^ref-40e05c14-36-0) (line 36, col 0, score 0.59)
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 1)
- [Services — L29](chunks/services.md#^ref-75ea4a6a-29-0) (line 29, col 0, score 0.58)
- [Simulation Demo — L8](chunks/simulation-demo.md#^ref-557309a3-8-0) (line 8, col 0, score 0.58)
- [Cross-Language Runtime Polymorphism — L233](cross-language-runtime-polymorphism.md#^ref-c34c36a6-233-0) (line 233, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L214](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-214-0) (line 214, col 0, score 0.58)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 1)
- [Exception Layer Analysis — L130](exception-layer-analysis.md#^ref-21d5cc09-130-0) (line 130, col 0, score 0.66)
- [Vectorial Exception Descent — L47](vectorial-exception-descent.md#^ref-d771154e-47-0) (line 47, col 0, score 0.61)
- [EidolonField — L237](eidolonfield.md#^ref-49d1e1e5-237-0) (line 237, col 0, score 0.69)
- [Model Upgrade Calm-Down Guide — L13](model-upgrade-calm-down-guide.md#^ref-db74343f-13-0) (line 13, col 0, score 0.6)
- [Vectorial Exception Descent — L121](vectorial-exception-descent.md#^ref-d771154e-121-0) (line 121, col 0, score 0.59)
- [aionian-circuit-math — L47](aionian-circuit-math.md#^ref-f2d83a77-47-0) (line 47, col 0, score 0.59)
- [Tracing the Signal — L66](tracing-the-signal.md#^ref-c3cd4f65-66-0) (line 66, col 0, score 0.57)
- [Model Upgrade Calm-Down Guide — L1](model-upgrade-calm-down-guide.md#^ref-db74343f-1-0) (line 1, col 0, score 0.57)
- [Exception Layer Analysis — L128](exception-layer-analysis.md#^ref-21d5cc09-128-0) (line 128, col 0, score 0.73)
- [Vectorial Exception Descent — L39](vectorial-exception-descent.md#^ref-d771154e-39-0) (line 39, col 0, score 0.6)
- [Protocol_0_The_Contradiction_Engine — L48](protocol-0-the-contradiction-engine.md#^ref-9a93a756-48-0) (line 48, col 0, score 0.56)
- [Promethean Documentation Pipeline Overview — L61](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-61-0) (line 61, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L25](matplotlib-animation-with-async-execution.md#^ref-687439f9-25-0) (line 25, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L45](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-45-0) (line 45, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L110](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-110-0) (line 110, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L32](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-32-0) (line 32, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.6)
- [Promethean Workflow Optimization — L9](promethean-workflow-optimization.md#^ref-d614d983-9-0) (line 9, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L55](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-55-0) (line 55, col 0, score 0.66)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.6)
- [Admin Dashboard for User Management — L9](admin-dashboard-for-user-management.md#^ref-2901a3e9-9-0) (line 9, col 0, score 0.59)
- [ripple-propagation-demo — L89](ripple-propagation-demo.md#^ref-8430617b-89-0) (line 89, col 0, score 0.82)
- [heartbeat-simulation-snippets — L38](heartbeat-simulation-snippets.md#^ref-23e221e9-38-0) (line 38, col 0, score 0.8)
- [heartbeat-fragment-demo — L31](heartbeat-fragment-demo.md#^ref-dd00677a-31-0) (line 31, col 0, score 0.79)
- [heartbeat-fragment-demo — L46](heartbeat-fragment-demo.md#^ref-dd00677a-46-0) (line 46, col 0, score 0.79)
- [heartbeat-fragment-demo — L61](heartbeat-fragment-demo.md#^ref-dd00677a-61-0) (line 61, col 0, score 0.79)
- [heartbeat-simulation-snippets — L25](heartbeat-simulation-snippets.md#^ref-23e221e9-25-0) (line 25, col 0, score 0.79)
- [heartbeat-simulation-snippets — L40](heartbeat-simulation-snippets.md#^ref-23e221e9-40-0) (line 40, col 0, score 0.79)
- [heartbeat-simulation-snippets — L53](heartbeat-simulation-snippets.md#^ref-23e221e9-53-0) (line 53, col 0, score 0.79)
- [heartbeat-simulation-snippets — L23](heartbeat-simulation-snippets.md#^ref-23e221e9-23-0) (line 23, col 0, score 0.75)
- [aionian-circuit-math — L87](aionian-circuit-math.md#^ref-f2d83a77-87-0) (line 87, col 0, score 0.71)
- [EidolonField — L184](eidolonfield.md#^ref-49d1e1e5-184-0) (line 184, col 0, score 0.79)
- [Layer1SurvivabilityEnvelope — L48](layer1survivabilityenvelope.md#^ref-64a9f9f9-48-0) (line 48, col 0, score 0.71)
- [aionian-circuit-math — L81](aionian-circuit-math.md#^ref-f2d83a77-81-0) (line 81, col 0, score 0.68)
- [EidolonField — L19](eidolonfield.md#^ref-49d1e1e5-19-0) (line 19, col 0, score 0.77)
- [2d-sandbox-field — L9](2d-sandbox-field.md#^ref-c710dc93-9-0) (line 9, col 0, score 0.78)
- [field-dynamics-math-blocks — L53](field-dynamics-math-blocks.md#^ref-7cfc230d-53-0) (line 53, col 0, score 0.61)
- [homeostasis-decay-formulas — L53](homeostasis-decay-formulas.md#^ref-37b5d236-53-0) (line 53, col 0, score 0.68)
- [Duck's Attractor States — L47](ducks-attractor-states.md#^ref-13951643-47-0) (line 47, col 0, score 0.6)
- [2d-sandbox-field — L28](2d-sandbox-field.md#^ref-c710dc93-28-0) (line 28, col 0, score 0.62)
- [2d-sandbox-field — L189](2d-sandbox-field.md#^ref-c710dc93-189-0) (line 189, col 0, score 0.66)
- [EidolonField — L15](eidolonfield.md#^ref-49d1e1e5-15-0) (line 15, col 0, score 0.7)
- [field-interaction-equations — L76](field-interaction-equations.md#^ref-b09141b7-76-0) (line 76, col 0, score 0.68)
- [eidolon-field-math-foundations — L71](eidolon-field-math-foundations.md#^ref-008f2ac0-71-0) (line 71, col 0, score 0.68)
- [field-interaction-equations — L56](field-interaction-equations.md#^ref-b09141b7-56-0) (line 56, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.68)
- [ParticleSimulationWithCanvasAndFFmpeg — L235](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-235-0) (line 235, col 0, score 0.69)
- [EidolonField — L200](eidolonfield.md#^ref-49d1e1e5-200-0) (line 200, col 0, score 0.7)
- [2d-sandbox-field — L129](2d-sandbox-field.md#^ref-c710dc93-129-0) (line 129, col 0, score 0.74)
- [layer-1-uptime-diagrams — L102](layer-1-uptime-diagrams.md#^ref-4127189a-102-0) (line 102, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.68)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.67)
- [Exception Layer Analysis — L47](exception-layer-analysis.md#^ref-21d5cc09-47-0) (line 47, col 0, score 0.61)
- [eidolon-field-math-foundations — L19](eidolon-field-math-foundations.md#^ref-008f2ac0-19-0) (line 19, col 0, score 0.6)
- [Promethean-native config design — L342](promethean-native-config-design.md#^ref-ab748541-342-0) (line 342, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L96](migrate-to-provider-tenant-architecture.md#^ref-54382370-96-0) (line 96, col 0, score 0.62)
- [eidolon-field-math-foundations — L47](eidolon-field-math-foundations.md#^ref-008f2ac0-47-0) (line 47, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L185](migrate-to-provider-tenant-architecture.md#^ref-54382370-185-0) (line 185, col 0, score 0.59)
- [Performance-Optimized-Polyglot-Bridge — L20](performance-optimized-polyglot-bridge.md#^ref-f5579967-20-0) (line 20, col 0, score 0.59)
- [EidolonField — L17](eidolonfield.md#^ref-49d1e1e5-17-0) (line 17, col 0, score 0.56)
- [lisp-dsl-for-window-management — L134](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-134-0) (line 134, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L128](local-only-llm-workflow.md#^ref-9a8ab57e-128-0) (line 128, col 0, score 0.6)
- [2d-sandbox-field — L169](2d-sandbox-field.md#^ref-c710dc93-169-0) (line 169, col 0, score 0.62)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.65)
- [ParticleSimulationWithCanvasAndFFmpeg — L5](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5-0) (line 5, col 0, score 0.65)
- [2d-sandbox-field — L1](2d-sandbox-field.md#^ref-c710dc93-1-0) (line 1, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L119](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-119-0) (line 119, col 0, score 0.63)
- [eidolon-field-math-foundations — L107](eidolon-field-math-foundations.md#^ref-008f2ac0-107-0) (line 107, col 0, score 0.7)
- [Fnord Tracer Protocol — L114](fnord-tracer-protocol.md#^ref-fc21f824-114-0) (line 114, col 0, score 0.64)
- [field-node-diagram-visualizations — L73](field-node-diagram-visualizations.md#^ref-e9b27b06-73-0) (line 73, col 0, score 0.63)
- [Synchronicity Waves and Web — L75](synchronicity-waves-and-web.md#^ref-91295f3a-75-0) (line 75, col 0, score 0.63)
- [ParticleSimulationWithCanvasAndFFmpeg — L237](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-237-0) (line 237, col 0, score 0.62)
- [field-dynamics-math-blocks — L119](field-dynamics-math-blocks.md#^ref-7cfc230d-119-0) (line 119, col 0, score 0.62)
- [field-node-diagram-outline — L3](field-node-diagram-outline.md#^ref-1f32c94a-3-0) (line 3, col 0, score 0.71)
- [field-node-diagram-set — L3](field-node-diagram-set.md#^ref-22b989d5-3-0) (line 3, col 0, score 0.72)
- [EidolonField — L217](eidolonfield.md#^ref-49d1e1e5-217-0) (line 217, col 0, score 0.69)
- [field-node-diagram-visualizations — L3](field-node-diagram-visualizations.md#^ref-e9b27b06-3-0) (line 3, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L121](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-121-0) (line 121, col 0, score 0.64)
- [ripple-propagation-demo — L88](ripple-propagation-demo.md#^ref-8430617b-88-0) (line 88, col 0, score 0.64)
- [promethean-system-diagrams — L3](promethean-system-diagrams.md#^ref-b51e19b4-3-0) (line 3, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L631](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-631-0) (line 631, col 0, score 0.62)
- [field-node-diagram-set — L35](field-node-diagram-set.md#^ref-22b989d5-35-0) (line 35, col 0, score 0.62)
- [homeostasis-decay-formulas — L137](homeostasis-decay-formulas.md#^ref-37b5d236-137-0) (line 137, col 0, score 0.62)
- [Math Fundamentals — L24](chunks/math-fundamentals.md#^ref-c6e87433-24-0) (line 24, col 0, score 0.69)
- [Simulation Demo — L14](chunks/simulation-demo.md#^ref-557309a3-14-0) (line 14, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L249](cross-language-runtime-polymorphism.md#^ref-c34c36a6-249-0) (line 249, col 0, score 0.69)
- [eidolon-field-math-foundations — L138](eidolon-field-math-foundations.md#^ref-008f2ac0-138-0) (line 138, col 0, score 0.69)
- [eidolon-node-lifecycle — L41](eidolon-node-lifecycle.md#^ref-938eca9c-41-0) (line 41, col 0, score 0.69)
- [EidolonField — L241](eidolonfield.md#^ref-49d1e1e5-241-0) (line 241, col 0, score 0.69)
- [Event Bus Projections Architecture — L161](event-bus-projections-architecture.md#^ref-cf6b9b17-161-0) (line 161, col 0, score 0.69)
- [Exception Layer Analysis — L146](exception-layer-analysis.md#^ref-21d5cc09-146-0) (line 146, col 0, score 0.69)
- [Factorio AI with External Agents — L157](factorio-ai-with-external-agents.md#^ref-a4d90289-157-0) (line 157, col 0, score 0.69)
- [field-dynamics-math-blocks — L143](field-dynamics-math-blocks.md#^ref-7cfc230d-143-0) (line 143, col 0, score 0.69)
- [2d-sandbox-field — L173](2d-sandbox-field.md#^ref-c710dc93-173-0) (line 173, col 0, score 0.67)
- [field-node-diagram-outline — L44](field-node-diagram-outline.md#^ref-1f32c94a-44-0) (line 44, col 0, score 0.69)
- [Tracing the Signal — L93](tracing-the-signal.md#^ref-c3cd4f65-93-0) (line 93, col 0, score 0.63)
- [Tracing the Signal — L19](tracing-the-signal.md#^ref-c3cd4f65-19-0) (line 19, col 0, score 0.62)
- [ripple-propagation-demo — L3](ripple-propagation-demo.md#^ref-8430617b-3-0) (line 3, col 0, score 0.71)
- [field-node-diagram-outline — L26](field-node-diagram-outline.md#^ref-1f32c94a-26-0) (line 26, col 0, score 0.7)
- [ripple-propagation-demo — L23](ripple-propagation-demo.md#^ref-8430617b-23-0) (line 23, col 0, score 0.69)
- [Simulation Demo — L9](chunks/simulation-demo.md#^ref-557309a3-9-0) (line 9, col 0, score 0.69)
- [eidolon-node-lifecycle — L37](eidolon-node-lifecycle.md#^ref-938eca9c-37-0) (line 37, col 0, score 0.69)
- [field-node-diagram-outline — L112](field-node-diagram-outline.md#^ref-1f32c94a-112-0) (line 112, col 0, score 0.69)
- [field-node-diagram-set — L142](field-node-diagram-set.md#^ref-22b989d5-142-0) (line 142, col 0, score 0.69)
- [field-node-diagram-visualizations — L92](field-node-diagram-visualizations.md#^ref-e9b27b06-92-0) (line 92, col 0, score 0.69)
- [field-node-diagram-set — L65](field-node-diagram-set.md#^ref-22b989d5-65-0) (line 65, col 0, score 0.66)
- [field-node-diagram-set — L55](field-node-diagram-set.md#^ref-22b989d5-55-0) (line 55, col 0, score 0.64)
- [Smoke Resonance Visualizations — L8](smoke-resonance-visualizations.md#^ref-ac9d3ac5-8-0) (line 8, col 0, score 0.68)
- [ripple-propagation-demo — L93](ripple-propagation-demo.md#^ref-8430617b-93-0) (line 93, col 0, score 0.62)
- [field-dynamics-math-blocks — L15](field-dynamics-math-blocks.md#^ref-7cfc230d-15-0) (line 15, col 0, score 0.65)
- [homeostasis-decay-formulas — L30](homeostasis-decay-formulas.md#^ref-37b5d236-30-0) (line 30, col 0, score 0.69)
- [homeostasis-decay-formulas — L45](homeostasis-decay-formulas.md#^ref-37b5d236-45-0) (line 45, col 0, score 0.69)
- [Exception Layer Analysis — L49](exception-layer-analysis.md#^ref-21d5cc09-49-0) (line 49, col 0, score 0.66)
- [field-dynamics-math-blocks — L47](field-dynamics-math-blocks.md#^ref-7cfc230d-47-0) (line 47, col 0, score 0.76)
- [Vectorial Exception Descent — L33](vectorial-exception-descent.md#^ref-d771154e-33-0) (line 33, col 0, score 0.67)
- [field-node-diagram-set — L102](field-node-diagram-set.md#^ref-22b989d5-102-0) (line 102, col 0, score 0.64)
- [Smoke Resonance Visualizations — L31](smoke-resonance-visualizations.md#^ref-ac9d3ac5-31-0) (line 31, col 0, score 0.68)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.68)
- [Prompt_Folder_Bootstrap — L147](prompt-folder-bootstrap.md#^ref-bd4f0976-147-0) (line 147, col 0, score 0.66)
- [field-node-diagram-set — L24](field-node-diagram-set.md#^ref-22b989d5-24-0) (line 24, col 0, score 0.65)
- [homeostasis-decay-formulas — L139](homeostasis-decay-formulas.md#^ref-37b5d236-139-0) (line 139, col 0, score 0.66)
- [Promethean Infrastructure Setup — L543](promethean-infrastructure-setup.md#^ref-6deed6ac-543-0) (line 543, col 0, score 0.76)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.67)
- [Vectorial Exception Descent — L8](vectorial-exception-descent.md#^ref-d771154e-8-0) (line 8, col 0, score 0.63)
- [2d-sandbox-field — L175](2d-sandbox-field.md#^ref-c710dc93-175-0) (line 175, col 0, score 0.66)
- [homeostasis-decay-formulas — L105](homeostasis-decay-formulas.md#^ref-37b5d236-105-0) (line 105, col 0, score 0.68)
- [eidolon-field-math-foundations — L110](eidolon-field-math-foundations.md#^ref-008f2ac0-110-0) (line 110, col 0, score 0.66)
- [field-dynamics-math-blocks — L43](field-dynamics-math-blocks.md#^ref-7cfc230d-43-0) (line 43, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L154](layer1survivabilityenvelope.md#^ref-64a9f9f9-154-0) (line 154, col 0, score 0.63)
- [ParticleSimulationWithCanvasAndFFmpeg — L3](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-3-0) (line 3, col 0, score 0.63)
- [2d-sandbox-field — L145](2d-sandbox-field.md#^ref-c710dc93-145-0) (line 145, col 0, score 0.65)
- [Eidolon-Field-Optimization — L19](eidolon-field-optimization.md#^ref-40e05c14-19-0) (line 19, col 0, score 0.63)
- [Vectorial Exception Descent — L24](vectorial-exception-descent.md#^ref-d771154e-24-0) (line 24, col 0, score 0.71)
- [Vectorial Exception Descent — L52](vectorial-exception-descent.md#^ref-d771154e-52-0) (line 52, col 0, score 0.64)
- [Vectorial Exception Descent — L119](vectorial-exception-descent.md#^ref-d771154e-119-0) (line 119, col 0, score 0.62)
- [Exception Layer Analysis — L25](exception-layer-analysis.md#^ref-21d5cc09-25-0) (line 25, col 0, score 0.62)
- [aionian-circuit-math — L89](aionian-circuit-math.md#^ref-f2d83a77-89-0) (line 89, col 0, score 0.6)
- [Vectorial Exception Descent — L142](vectorial-exception-descent.md#^ref-d771154e-142-0) (line 142, col 0, score 1)
- [Synchronicity Waves and Web — L78](synchronicity-waves-and-web.md#^ref-91295f3a-78-0) (line 78, col 0, score 0.75)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.71)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.65)
- [The Jar of Echoes — L108](the-jar-of-echoes.md#^ref-18138627-108-0) (line 108, col 0, score 0.6)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.6)
- [universal-intention-code-fabric — L390](universal-intention-code-fabric.md#^ref-c14edce7-390-0) (line 390, col 0, score 0.57)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.62)
- [Self-Agency in AI Interaction — L31](self-agency-in-ai-interaction.md#^ref-49a9a860-31-0) (line 31, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L68](prompt-folder-bootstrap.md#^ref-bd4f0976-68-0) (line 68, col 0, score 0.55)
- [The Jar of Echoes — L31](the-jar-of-echoes.md#^ref-18138627-31-0) (line 31, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.55)
- [Protocol_0_The_Contradiction_Engine — L107](protocol-0-the-contradiction-engine.md#^ref-9a93a756-107-0) (line 107, col 0, score 0.54)
- [sibilant-macro-targets — L95](sibilant-macro-targets.md#^ref-c5c9a5c6-95-0) (line 95, col 0, score 0.54)
- [Promethean-Copilot-Intent-Engine — L38](promethean-copilot-intent-engine.md#^ref-ae24a280-38-0) (line 38, col 0, score 0.54)
- [heartbeat-simulation-snippets — L75](heartbeat-simulation-snippets.md#^ref-23e221e9-75-0) (line 75, col 0, score 0.64)
- [aionian-circuit-math — L116](aionian-circuit-math.md#^ref-f2d83a77-116-0) (line 116, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.63)
- [2d-sandbox-field — L24](2d-sandbox-field.md#^ref-c710dc93-24-0) (line 24, col 0, score 0.67)
- [Admin Dashboard for User Management — L59](admin-dashboard-for-user-management.md#^ref-2901a3e9-59-0) (line 59, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L168](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-168-0) (line 168, col 0, score 0.62)
- [aionian-circuit-math — L173](aionian-circuit-math.md#^ref-f2d83a77-173-0) (line 173, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L13](promethean-copilot-intent-engine.md#^ref-ae24a280-13-0) (line 13, col 0, score 0.69)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.66)
- [universal-intention-code-fabric — L1](universal-intention-code-fabric.md#^ref-c14edce7-1-0) (line 1, col 0, score 0.66)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.65)
- [mystery-lisp-search-session — L100](mystery-lisp-search-session.md#^ref-513dc4c7-100-0) (line 100, col 0, score 0.64)
- [compiler-kit-foundations — L3](compiler-kit-foundations.md#^ref-01b21543-3-0) (line 3, col 0, score 0.64)
- [sibilant-metacompiler-overview — L23](sibilant-metacompiler-overview.md#^ref-61d4086b-23-0) (line 23, col 0, score 0.64)
- [shared-package-layout-clarification — L153](shared-package-layout-clarification.md#^ref-36c8882a-153-0) (line 153, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.64)
- [sibilant-metacompiler-overview — L40](sibilant-metacompiler-overview.md#^ref-61d4086b-40-0) (line 40, col 0, score 0.68)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.6)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.6)
- [Universal Lisp Interface — L173](universal-lisp-interface.md#^ref-b01856b4-173-0) (line 173, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L205](prompt-folder-bootstrap.md#^ref-bd4f0976-205-0) (line 205, col 0, score 0.6)
- [prompt-programming-language-lisp — L72](prompt-programming-language-lisp.md#^ref-d41a06d1-72-0) (line 72, col 0, score 0.6)
- [Recursive Prompt Construction Engine — L173](recursive-prompt-construction-engine.md#^ref-babdb9eb-173-0) (line 173, col 0, score 0.6)
- [sibilant-macro-targets — L162](sibilant-macro-targets.md#^ref-c5c9a5c6-162-0) (line 162, col 0, score 0.6)
- [Cross-Target Macro System in Sibilant — L37](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-37-0) (line 37, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L3](layer1survivabilityenvelope.md#^ref-64a9f9f9-3-0) (line 3, col 0, score 0.62)
- [The Jar of Echoes — L96](the-jar-of-echoes.md#^ref-18138627-96-0) (line 96, col 0, score 0.62)
- [Universal Lisp Interface — L9](universal-lisp-interface.md#^ref-b01856b4-9-0) (line 9, col 0, score 0.61)
- [Cross-Target Macro System in Sibilant — L1](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-1-0) (line 1, col 0, score 0.61)
- [Promethean State Format — L78](promethean-state-format.md#^ref-23df6ddb-78-0) (line 78, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L56](model-upgrade-calm-down-guide.md#^ref-db74343f-56-0) (line 56, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L3](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-3-0) (line 3, col 0, score 0.6)
- [Debugging Broker Connections and Agent Behavior — L34](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-34-0) (line 34, col 0, score 0.6)
- [lisp-dsl-for-window-management — L204](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-204-0) (line 204, col 0, score 0.59)
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.59)
- [Vectorial Exception Descent — L1](vectorial-exception-descent.md#^ref-d771154e-1-0) (line 1, col 0, score 0.59)
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
- [2d-sandbox-field — L193](2d-sandbox-field.md#^ref-c710dc93-193-0) (line 193, col 0, score 1)
- [EidolonField — L242](eidolonfield.md#^ref-49d1e1e5-242-0) (line 242, col 0, score 1)
- [Exception Layer Analysis — L145](exception-layer-analysis.md#^ref-21d5cc09-145-0) (line 145, col 0, score 1)
- [field-dynamics-math-blocks — L144](field-dynamics-math-blocks.md#^ref-7cfc230d-144-0) (line 144, col 0, score 1)
- [field-node-diagram-outline — L105](field-node-diagram-outline.md#^ref-1f32c94a-105-0) (line 105, col 0, score 1)
- [Ice Box Reorganization — L69](ice-box-reorganization.md#^ref-291c7d91-69-0) (line 69, col 0, score 1)
- [js-to-lisp-reverse-compiler — L417](js-to-lisp-reverse-compiler.md#^ref-58191024-417-0) (line 417, col 0, score 1)
- [layer-1-uptime-diagrams — L160](layer-1-uptime-diagrams.md#^ref-4127189a-160-0) (line 160, col 0, score 1)
- [aionian-circuit-math — L169](aionian-circuit-math.md#^ref-f2d83a77-169-0) (line 169, col 0, score 1)
- [api-gateway-versioning — L290](api-gateway-versioning.md#^ref-0580dcd3-290-0) (line 290, col 0, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#^ref-7aa1eb92-135-0) (line 135, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#^ref-5020e892-180-0) (line 180, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L185](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-185-0) (line 185, col 0, score 1)
- [Dynamic Context Model for Web Components — L402](dynamic-context-model-for-web-components.md#^ref-f7702bf8-402-0) (line 402, col 0, score 1)
- [eidolon-node-lifecycle — L53](eidolon-node-lifecycle.md#^ref-938eca9c-53-0) (line 53, col 0, score 1)
- [EidolonField — L243](eidolonfield.md#^ref-49d1e1e5-243-0) (line 243, col 0, score 1)
- [field-dynamics-math-blocks — L145](field-dynamics-math-blocks.md#^ref-7cfc230d-145-0) (line 145, col 0, score 1)
- [field-node-diagram-outline — L107](field-node-diagram-outline.md#^ref-1f32c94a-107-0) (line 107, col 0, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#^ref-1f32c94a-103-0) (line 103, col 0, score 1)
- [field-node-diagram-set — L156](field-node-diagram-set.md#^ref-22b989d5-156-0) (line 156, col 0, score 1)
- [2d-sandbox-field — L196](2d-sandbox-field.md#^ref-c710dc93-196-0) (line 196, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-137-0) (line 137, col 0, score 1)
- [Diagrams — L34](chunks/diagrams.md#^ref-45cd25b5-34-0) (line 34, col 0, score 1)
- [JavaScript — L46](chunks/javascript.md#^ref-c1618c66-46-0) (line 46, col 0, score 1)
- [Math Fundamentals — L41](chunks/math-fundamentals.md#^ref-c6e87433-41-0) (line 41, col 0, score 1)
- [Simulation Demo — L16](chunks/simulation-demo.md#^ref-557309a3-16-0) (line 16, col 0, score 1)
- [Duck's Attractor States — L75](ducks-attractor-states.md#^ref-13951643-75-0) (line 75, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L48](ducks-self-referential-perceptual-loop.md#^ref-71726f04-48-0) (line 48, col 0, score 1)
- [eidolon-field-math-foundations — L135](eidolon-field-math-foundations.md#^ref-008f2ac0-135-0) (line 135, col 0, score 1)
- [eidolon-node-lifecycle — L30](eidolon-node-lifecycle.md#^ref-938eca9c-30-0) (line 30, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#^ref-cf6b9b17-149-0) (line 149, col 0, score 1)
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 1)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 1)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 1)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 1)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 1)
- [Dynamic Context Model for Web Components — L406](dynamic-context-model-for-web-components.md#^ref-f7702bf8-406-0) (line 406, col 0, score 1)
- [2d-sandbox-field — L198](2d-sandbox-field.md#^ref-c710dc93-198-0) (line 198, col 0, score 1)
- [Math Fundamentals — L30](chunks/math-fundamentals.md#^ref-c6e87433-30-0) (line 30, col 0, score 1)
- [eidolon-node-lifecycle — L52](eidolon-node-lifecycle.md#^ref-938eca9c-52-0) (line 52, col 0, score 1)
- [EidolonField — L239](eidolonfield.md#^ref-49d1e1e5-239-0) (line 239, col 0, score 1)
- [Exception Layer Analysis — L152](exception-layer-analysis.md#^ref-21d5cc09-152-0) (line 152, col 0, score 1)
- [field-dynamics-math-blocks — L147](field-dynamics-math-blocks.md#^ref-7cfc230d-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L108](field-node-diagram-outline.md#^ref-1f32c94a-108-0) (line 108, col 0, score 1)
- [field-node-diagram-visualizations — L106](field-node-diagram-visualizations.md#^ref-e9b27b06-106-0) (line 106, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#^ref-c62a1815-429-0) (line 429, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Event Bus MVP — L571](event-bus-mvp.md#^ref-534fe91d-571-0) (line 571, col 0, score 1)
- [field-interaction-equations — L174](field-interaction-equations.md#^ref-b09141b7-174-0) (line 174, col 0, score 1)
- [field-node-diagram-outline — L114](field-node-diagram-outline.md#^ref-1f32c94a-114-0) (line 114, col 0, score 1)
- [field-node-diagram-set — L141](field-node-diagram-set.md#^ref-22b989d5-141-0) (line 141, col 0, score 1)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [Event Bus MVP — L570](event-bus-mvp.md#^ref-534fe91d-570-0) (line 570, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
- [field-node-diagram-set — L140](field-node-diagram-set.md#^ref-22b989d5-140-0) (line 140, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L250](cross-language-runtime-polymorphism.md#^ref-c34c36a6-250-0) (line 250, col 0, score 1)
- [aionian-circuit-math — L162](aionian-circuit-math.md#^ref-f2d83a77-162-0) (line 162, col 0, score 1)
- [Math Fundamentals — L18](chunks/math-fundamentals.md#^ref-c6e87433-18-0) (line 18, col 0, score 1)
- [Simulation Demo — L18](chunks/simulation-demo.md#^ref-557309a3-18-0) (line 18, col 0, score 1)
- [eidolon-field-math-foundations — L137](eidolon-field-math-foundations.md#^ref-008f2ac0-137-0) (line 137, col 0, score 1)
- [eidolon-node-lifecycle — L51](eidolon-node-lifecycle.md#^ref-938eca9c-51-0) (line 51, col 0, score 1)
- [field-dynamics-math-blocks — L153](field-dynamics-math-blocks.md#^ref-7cfc230d-153-0) (line 153, col 0, score 1)
- [field-interaction-equations — L160](field-interaction-equations.md#^ref-b09141b7-160-0) (line 160, col 0, score 1)
- [field-node-diagram-outline — L127](field-node-diagram-outline.md#^ref-1f32c94a-127-0) (line 127, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L139](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-139-0) (line 139, col 0, score 1)
- [Simulation Demo — L17](chunks/simulation-demo.md#^ref-557309a3-17-0) (line 17, col 0, score 1)
- [eidolon-node-lifecycle — L31](eidolon-node-lifecycle.md#^ref-938eca9c-31-0) (line 31, col 0, score 1)
- [Event Bus Projections Architecture — L156](event-bus-projections-architecture.md#^ref-cf6b9b17-156-0) (line 156, col 0, score 1)
- [Factorio AI with External Agents — L146](factorio-ai-with-external-agents.md#^ref-a4d90289-146-0) (line 146, col 0, score 1)
- [field-node-diagram-outline — L99](field-node-diagram-outline.md#^ref-1f32c94a-99-0) (line 99, col 0, score 1)
- [field-node-diagram-visualizations — L85](field-node-diagram-visualizations.md#^ref-e9b27b06-85-0) (line 85, col 0, score 1)
- [graph-ds — L382](graph-ds.md#^ref-6620e2f2-382-0) (line 382, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L170](layer-1-uptime-diagrams.md#^ref-4127189a-170-0) (line 170, col 0, score 1)
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [aionian-circuit-math — L181](aionian-circuit-math.md#^ref-f2d83a77-181-0) (line 181, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Math Fundamentals — L27](chunks/math-fundamentals.md#^ref-c6e87433-27-0) (line 27, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [eidolon-node-lifecycle — L50](eidolon-node-lifecycle.md#^ref-938eca9c-50-0) (line 50, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-175-0) (line 175, col 0, score 1)
- [Dynamic Context Model for Web Components — L397](dynamic-context-model-for-web-components.md#^ref-f7702bf8-397-0) (line 397, col 0, score 1)
- [eidolon-field-math-foundations — L122](eidolon-field-math-foundations.md#^ref-008f2ac0-122-0) (line 122, col 0, score 1)
- [eidolon-node-lifecycle — L54](eidolon-node-lifecycle.md#^ref-938eca9c-54-0) (line 54, col 0, score 1)
- [EidolonField — L263](eidolonfield.md#^ref-49d1e1e5-263-0) (line 263, col 0, score 1)
- [field-dynamics-math-blocks — L136](field-dynamics-math-blocks.md#^ref-7cfc230d-136-0) (line 136, col 0, score 1)
- [field-node-diagram-outline — L135](field-node-diagram-outline.md#^ref-1f32c94a-135-0) (line 135, col 0, score 1)
- [field-node-diagram-set — L160](field-node-diagram-set.md#^ref-22b989d5-160-0) (line 160, col 0, score 1)
- [field-node-diagram-visualizations — L111](field-node-diagram-visualizations.md#^ref-e9b27b06-111-0) (line 111, col 0, score 1)
- [heartbeat-fragment-demo — L122](heartbeat-fragment-demo.md#^ref-dd00677a-122-0) (line 122, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [archetype-ecs — L477](archetype-ecs.md#^ref-8f4c1e86-477-0) (line 477, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L177](chroma-toolkit-consolidation-plan.md#^ref-5020e892-177-0) (line 177, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
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
- [JavaScript — L19](chunks/javascript.md#^ref-c1618c66-19-0) (line 19, col 0, score 1)
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
- [2d-sandbox-field — L221](2d-sandbox-field.md#^ref-c710dc93-221-0) (line 221, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [archetype-ecs — L463](archetype-ecs.md#^ref-8f4c1e86-463-0) (line 463, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [JavaScript — L17](chunks/javascript.md#^ref-c1618c66-17-0) (line 17, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
