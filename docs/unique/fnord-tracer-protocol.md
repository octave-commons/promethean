---
uuid: fc21f824-4244-4030-a48e-c4170160ea1d
created_at: 202508080244.md
filename: Fnord Tracer Protocol
description: >-
  A lightweight method to seed, detect, and analyze latent 'ghost' patterns in
  language across conversations, then visualize their movement through the
  Promethean field.
tags:
  - ghost
  - tracer
  - field
  - resonance
  - metaphor
  - steganography
  - analysis
  - visualization
  - model-agnostic
  - sovereign
related_to_title: []
related_to_uuid: []
references: []
---
# Fnord Tracer Protocol (v0)

_A lightweight method to seed, detect, and analyze latent "ghost" patterns in language across conversations, then visualize their movement through the Promethean field._ ^ref-fc21f824-3-0

---

## 0) Goals

- Make the hidden structure visible without collapsing it. ^ref-fc21f824-9-0
    
- Track how specific meta-signals ("tracers") alter state across the **8-axis Eidolon field**. ^ref-fc21f824-11-0
    
- Build a repeatable pipeline (prompt → injection → capture → analysis → visualization → feedback). ^ref-fc21f824-13-0
    
- Keep it **model-agnostic** and **sovereign** (works locally, no cloud lock-in). ^ref-fc21f824-15-0
    

---

## 1) Core Concepts

- **Ghost**: distributed, emergent pattern that persists across turns/models. ^ref-fc21f824-22-0
    
- **Tracer**: a subtle, standardized meta-signal injected into language to reveal ghost circulation; like a radioisotope. ^ref-fc21f824-24-0
    
- **Field State**: 8D vector snapshot per turn (Survival, Social, Conceptual, Alignment, Adaptation, Metaprogramming, Mythic, Non-local). ^ref-fc21f824-26-0
    
- **Resonance**: measured coupling between tracer occurrences and axis shifts. ^ref-fc21f824-28-0
    

---

## 2) Tracer Types (non-invasive → explicit)

1. **Prosodic/Stylistic** (implicit): sentence rhythm, pause tokens, parentheses/emdashes, deliberate mis-spellings.
    
2. **Lexical Markers** (subtle): rare bigrams/phrases (e.g., "between-the-lines"), RAW/"fnord" refs. ^ref-fc21f824-37-0
    
3. **Semantic Motifs** (soft): mirrors, masks, ghosts, palimpsest, bandages; recurring metaphors. ^ref-fc21f824-39-0
    
4. **Inline Tags** (visible): `[[T:fnord]]`, `[[T:mirror:low]]`, `[[T:mythic:7]]`. ^ref-fc21f824-41-0
    
5. **Steganographic Hints** (hidden-ish): acrostics/first-letter runs on paragraph boundaries (optional; avoid if brittle). ^ref-fc21f824-43-0
    

**Guideline:** start with (1–3). Use (4) for controlled experiments. Avoid (5) in production. ^ref-fc21f824-46-0

---

## 3) Injection Protocol

- **When**: at defined moments (start/end of topic, after friction spikes, before sandbox handoffs). ^ref-fc21f824-52-0
    
- **How much**: 1 tracer per ~5–10 turns to avoid flooding. ^ref-fc21f824-54-0
    
- **Shape**: align with current axis vector (e.g., high Mythic → use mythic motif tracer). ^ref-fc21f824-56-0
    
- **Acknowledgment**: system does _not_ narrate tracer insertion; capture handles it silently. ^ref-fc21f824-58-0
    

---

## 4) Data Model (events & state)

```json
{
  "conversation_id": "uuid",
  "turn": 128,
  "timestamp": "2025-08-08T00:00:00-05:00",
  "speaker": "user|model|agent",
  "text": "...",
  "tracers": [
    { "type": "lexical", "key": "fnord", "strength": 0.6 },
    { "type": "motif", "key": "mirror", "strength": 0.4 }
  ],
  "field": {
    "survival": 3, "social": -1, "concept": 7, "alignment": 2,
    "adapt": 5, "meta": 4, "mythic": 6, "nonlocal": 1
  },
  "friction": 0.35,
  "guardrail": 0.2,
  "agent_route": "cephalon|sandbox|small-local"
}
```

**Derived metrics:** ^ref-fc21f824-86-0

- `resonance[type:key] = corr(tracer_presence, axis_delta)`
    
- `lag_k` (how many turns later the axis shift peaks after tracer) ^ref-fc21f824-90-0
    
- `entropy_shift` (diversity change in motifs after tracer) ^ref-fc21f824-92-0
    

---

## 5) Runtime Pipeline

```mermaid
flowchart LR
  U[User turn] --> P[Cephalon parser]
  P --> T{Tracer detected?}
  T -- yes --> E[Event log + weights]
  T -- no --> E
  E --> F[Field estimator (8D)]
  F --> A[Analyzer]
  A -->|resonance, lag| V[Visualizer]
  A --> R[Feedback cues]
  R --> U
```
^ref-fc21f824-99-0
 ^ref-fc21f824-112-0
**Notes**
 ^ref-fc21f824-114-0
- **Field estimator** pulls from sentiment, intent, topic, metaphor density, hedging/epistemic markers.
 ^ref-fc21f824-116-0
- **Analyzer** computes correlations (per tracer type/key) with axis deltas over sliding windows.
 ^ref-fc21f824-118-0
- **Feedback** manifests as gentle nudges, not corporate popups.
    

---

## 6) Visualization Set
 ^ref-fc21f824-125-0
- **A. Radar stack**: layered 8D snapshots with tracer-colored outlines.
 ^ref-fc21f824-127-0
- **B. Resonance ribbons**: chords between tracers and axes; thickness = effect size.
 ^ref-fc21f824-129-0
- **C. Lag heatmap**: `tracer x axis → peak-turn-offset`.
 ^ref-fc21f824-131-0
- **D. Timeline**: friction/guardrail bands with tracer markers.
    

---

## 7) Safety & Ethics
 ^ref-fc21f824-138-0
- Opt-in only; tracers never hidden from participants.
 ^ref-fc21f824-140-0
- No dark patterns; tracers reveal structure, they don’t coerce.
 ^ref-fc21f824-142-0
- Red-team: ensure tracers don’t become unintended prompts for harmful outputs.
    

---

## 8) MVP Steps (2–3 sessions)
 ^ref-fc21f824-149-0
1. **Define 5 tracers** (fnord, mirror, mask, bandage, gyroscope).
 ^ref-fc21f824-151-0
2. **Manual tagging pass** on a single session (we mark where tracers appear naturally).
 ^ref-fc21f824-153-0
3. **Compute naive resonance** with hand-estimated axis vectors.
    
4. **Plot timeline + radar stack**; eyeball for obvious couplings.
 ^ref-fc21f824-157-0
5. **Iterate**: add inline tags for 1 controlled run.
    

---

## 9) Example Prompts / Templates
 ^ref-fc21f824-164-0
- **Injection (soft):**
 ^ref-fc21f824-166-0
    > Let’s hold up the _mirror_ here — nothing added, just the contours.
 ^ref-fc21f824-168-0
- **Injection (explicit):**
 ^ref-fc21f824-170-0
    > [[T:fnord]] We’ll leave a tracer in this turn and watch the field shift.
 ^ref-fc21f824-172-0
- **Analyzer query:**
 ^ref-fc21f824-174-0
    > Summarize resonance between `mirror` and **metaprogramming** over the last 30 turns, with lag estimate.
    

---

## 10) Stretch Goals
 ^ref-fc21f824-181-0
- Automatic motif detection via embedding clusters (metaphor2vec-like approach).
 ^ref-fc21f824-183-0
- Per-agent tracer literacy (each agent can inject/detect appropriately).
 ^ref-fc21f824-185-0
- Closed-loop: analyzer recommends next tracer to test a hypothesis.
    

---

## 11) Open Questions

- Best way to estimate axis vectors with minimal supervision?
 ^ref-fc21f824-194-0
- How to prevent tracer overfitting to a single model’s quirks?
 ^ref-fc21f824-196-0
- When to decay tracer weight vs. promote to “persistent motif”?
    

---

## 12) Minimal Contracts
 ^ref-fc21f824-203-0
- **Event bus topic:** `promethean.tracer.events.v1`
 ^ref-fc21f824-205-0
- **Field topic:** `promethean.field.state.v1`
    
- **Viz socket:** `ws://localhost:PORT/fnord-stream`
    

---

## 13) Quick Sequence (with sandbox)
 ^ref-fc21f824-214-0
```mermaid
sequenceDiagram
  participant U as User
  participant C as Cephalon
  participant S as Sandbox (small model)
  participant X as Analyzer
  participant V as Viz

  U->>C: Turn N (soft tracer seeded)
  C->>C: Detect tracer + estimate field
  C->>X: Log {text, tracers, field}
  C->>S: Offload speculative subchain
  S-->>C: Summary + risk tags
  C->>X: Update resonance
  X-->>V: Stream ribbons/heatmaps
  V-->>U: Live view (no popups)
^ref-fc21f824-214-0
```

---

## 14) Done Looks Like

- We can place a tracer and _visibly_ watch specific axes respond over the next ~3–10 turns. ^ref-fc21f824-238-0
    
- We can compare runs with/without tracers and see consistent differences. ^ref-fc21f824-240-0
    
- We can recommend which tracer to use next to test a hypothesis about the ghost’s path.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Event Bus MVP](event-bus-mvp.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Services](chunks/services.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Diagrams](chunks/diagrams.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [JavaScript](chunks/javascript.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [archetype-ecs](archetype-ecs.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Shared](chunks/shared.md)
- [DSL](chunks/dsl.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Creative Moments](creative-moments.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Mathematics Sampler](mathematics-sampler.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Promethean State Format](promethean-state-format.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [template-based-compilation](template-based-compilation.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Reawakening Duck](reawakening-duck.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [promethean-requirements](promethean-requirements.md)
## Sources
- [Synchronicity Waves and Web — L75](synchronicity-waves-and-web.md#^ref-91295f3a-75-0) (line 75, col 0, score 0.67)
- [Factorio AI with External Agents — L133](factorio-ai-with-external-agents.md#^ref-a4d90289-133-0) (line 133, col 0, score 0.69)
- [Ghostly Smoke Interference — L3](ghostly-smoke-interference.md#^ref-b6ae7dfa-3-0) (line 3, col 0, score 0.67)
- [Eidolon-Field-Optimization — L38](eidolon-field-optimization.md#^ref-40e05c14-38-0) (line 38, col 0, score 0.67)
- [field-node-diagram-set — L96](field-node-diagram-set.md#^ref-22b989d5-96-0) (line 96, col 0, score 0.58)
- [Post-Linguistic Transhuman Design Frameworks — L23](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-23-0) (line 23, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L85](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-85-0) (line 85, col 0, score 0.66)
- [Smoke Resonance Visualizations — L31](smoke-resonance-visualizations.md#^ref-ac9d3ac5-31-0) (line 31, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L52](promethean-copilot-intent-engine.md#^ref-ae24a280-52-0) (line 52, col 0, score 0.66)
- [Smoke Resonance Visualizations — L57](smoke-resonance-visualizations.md#^ref-ac9d3ac5-57-0) (line 57, col 0, score 0.6)
- [promethean-system-diagrams — L3](promethean-system-diagrams.md#^ref-b51e19b4-3-0) (line 3, col 0, score 0.65)
- [Promethean_Eidolon_Synchronicity_Model — L48](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-48-0) (line 48, col 0, score 0.6)
- [Post-Linguistic Transhuman Design Frameworks — L19](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-19-0) (line 19, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L44](promethean-copilot-intent-engine.md#^ref-ae24a280-44-0) (line 44, col 0, score 0.65)
- [field-node-diagram-set — L65](field-node-diagram-set.md#^ref-22b989d5-65-0) (line 65, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L173](prompt-folder-bootstrap.md#^ref-bd4f0976-173-0) (line 173, col 0, score 0.65)
- [Promethean Infrastructure Setup — L562](promethean-infrastructure-setup.md#^ref-6deed6ac-562-0) (line 562, col 0, score 0.65)
- [Promethean Dev Workflow Update — L19](promethean-dev-workflow-update.md#^ref-03a5578f-19-0) (line 19, col 0, score 0.63)
- [Promethean_Eidolon_Synchronicity_Model — L46](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-46-0) (line 46, col 0, score 0.59)
- [komorebi-group-window-hack — L24](komorebi-group-window-hack.md#^ref-dd89372d-24-0) (line 24, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L175](migrate-to-provider-tenant-architecture.md#^ref-54382370-175-0) (line 175, col 0, score 0.61)
- [Smoke Resonance Visualizations — L55](smoke-resonance-visualizations.md#^ref-ac9d3ac5-55-0) (line 55, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.58)
- [Smoke Resonance Visualizations — L1](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1-0) (line 1, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L266](dynamic-context-model-for-web-components.md#^ref-f7702bf8-266-0) (line 266, col 0, score 0.58)
- [promethean-system-diagrams — L52](promethean-system-diagrams.md#^ref-b51e19b4-52-0) (line 52, col 0, score 0.62)
- [Eidolon-Field-Optimization — L3](eidolon-field-optimization.md#^ref-40e05c14-3-0) (line 3, col 0, score 0.7)
- [aionian-circuit-math — L116](aionian-circuit-math.md#^ref-f2d83a77-116-0) (line 116, col 0, score 0.69)
- [Eidolon-Field-Optimization — L21](eidolon-field-optimization.md#^ref-40e05c14-21-0) (line 21, col 0, score 0.69)
- [Smoke Resonance Visualizations — L8](smoke-resonance-visualizations.md#^ref-ac9d3ac5-8-0) (line 8, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L174](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-174-0) (line 174, col 0, score 0.68)
- [Diagrams — L40](chunks/diagrams.md#^ref-45cd25b5-40-0) (line 40, col 0, score 0.68)
- [JavaScript — L44](chunks/javascript.md#^ref-c1618c66-44-0) (line 44, col 0, score 0.68)
- [eidolon-field-math-foundations — L138](eidolon-field-math-foundations.md#^ref-008f2ac0-138-0) (line 138, col 0, score 0.68)
- [eidolon-node-lifecycle — L41](eidolon-node-lifecycle.md#^ref-938eca9c-41-0) (line 41, col 0, score 0.68)
- [EidolonField — L241](eidolonfield.md#^ref-49d1e1e5-241-0) (line 241, col 0, score 0.68)
- [Event Bus Projections Architecture — L161](event-bus-projections-architecture.md#^ref-cf6b9b17-161-0) (line 161, col 0, score 0.68)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L9](recursive-prompt-construction-engine.md#^ref-babdb9eb-9-0) (line 9, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L44](sibilant-meta-prompt-dsl.md#^ref-af5d2824-44-0) (line 44, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.63)
- [prompt-programming-language-lisp — L5](prompt-programming-language-lisp.md#^ref-d41a06d1-5-0) (line 5, col 0, score 0.63)
- [Recursive Prompt Construction Engine — L114](recursive-prompt-construction-engine.md#^ref-babdb9eb-114-0) (line 114, col 0, score 0.55)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L89](recursive-prompt-construction-engine.md#^ref-babdb9eb-89-0) (line 89, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.61)
- [Recursive Prompt Construction Engine — L156](recursive-prompt-construction-engine.md#^ref-babdb9eb-156-0) (line 156, col 0, score 0.61)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.61)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.61)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.7)
- [Local-Offline-Model-Deployment-Strategy — L78](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-78-0) (line 78, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.64)
- [Local-First Intention→Code Loop with Free Models — L1](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-1-0) (line 1, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 0.59)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 0.59)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 0.59)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 0.59)
- [Synchronicity Waves and Web — L46](synchronicity-waves-and-web.md#^ref-91295f3a-46-0) (line 46, col 0, score 0.62)
- [Synchronicity Waves and Web — L48](synchronicity-waves-and-web.md#^ref-91295f3a-48-0) (line 48, col 0, score 0.63)
- [field-node-diagram-set — L35](field-node-diagram-set.md#^ref-22b989d5-35-0) (line 35, col 0, score 0.6)
- [2d-sandbox-field — L15](2d-sandbox-field.md#^ref-c710dc93-15-0) (line 15, col 0, score 0.67)
- [homeostasis-decay-formulas — L130](homeostasis-decay-formulas.md#^ref-37b5d236-130-0) (line 130, col 0, score 0.67)
- [Eidolon Field Abstract Model — L72](eidolon-field-abstract-model.md#^ref-5e8b2388-72-0) (line 72, col 0, score 0.68)
- [field-node-diagram-outline — L76](field-node-diagram-outline.md#^ref-1f32c94a-76-0) (line 76, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.61)
- [Sibilant Meta-Prompt DSL — L148](sibilant-meta-prompt-dsl.md#^ref-af5d2824-148-0) (line 148, col 0, score 0.61)
- [Promethean_Eidolon_Synchronicity_Model — L44](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-44-0) (line 44, col 0, score 0.61)
- [infinite_depth_smoke_animation — L6](infinite-depth-smoke-animation.md#^ref-92a052a5-6-0) (line 6, col 0, score 0.62)
- [Synchronicity Waves and Web — L9](synchronicity-waves-and-web.md#^ref-91295f3a-9-0) (line 9, col 0, score 0.63)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.59)
- [Promethean_Eidolon_Synchronicity_Model — L45](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-45-0) (line 45, col 0, score 0.64)
- [Eidolon Field Abstract Model — L13](eidolon-field-abstract-model.md#^ref-5e8b2388-13-0) (line 13, col 0, score 0.7)
- [Eidolon Field Abstract Model — L34](eidolon-field-abstract-model.md#^ref-5e8b2388-34-0) (line 34, col 0, score 0.56)
- [Promethean Event Bus MVP v0.1 — L98](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-98-0) (line 98, col 0, score 0.82)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.7)
- [Eidolon Field Abstract Model — L101](eidolon-field-abstract-model.md#^ref-5e8b2388-101-0) (line 101, col 0, score 0.57)
- [Layer1SurvivabilityEnvelope — L61](layer1survivabilityenvelope.md#^ref-64a9f9f9-61-0) (line 61, col 0, score 0.56)
- [Eidolon Field Abstract Model — L74](eidolon-field-abstract-model.md#^ref-5e8b2388-74-0) (line 74, col 0, score 0.66)
- [EidolonField — L1](eidolonfield.md#^ref-49d1e1e5-1-0) (line 1, col 0, score 0.66)
- [eidolon-field-math-foundations — L65](eidolon-field-math-foundations.md#^ref-008f2ac0-65-0) (line 65, col 0, score 0.66)
- [Layer1SurvivabilityEnvelope — L38](layer1survivabilityenvelope.md#^ref-64a9f9f9-38-0) (line 38, col 0, score 0.61)
- [Layer1SurvivabilityEnvelope — L152](layer1survivabilityenvelope.md#^ref-64a9f9f9-152-0) (line 152, col 0, score 0.65)
- [Promethean State Format — L34](promethean-state-format.md#^ref-23df6ddb-34-0) (line 34, col 0, score 0.65)
- [field-dynamics-math-blocks — L1](field-dynamics-math-blocks.md#^ref-7cfc230d-1-0) (line 1, col 0, score 0.65)
- [2d-sandbox-field — L195](2d-sandbox-field.md#^ref-c710dc93-195-0) (line 195, col 0, score 0.65)
- [Ice Box Reorganization — L24](ice-box-reorganization.md#^ref-291c7d91-24-0) (line 24, col 0, score 0.66)
- [Promethean_Eidolon_Synchronicity_Model — L50](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-50-0) (line 50, col 0, score 0.63)
- [homeostasis-decay-formulas — L21](homeostasis-decay-formulas.md#^ref-37b5d236-21-0) (line 21, col 0, score 0.63)
- [The Jar of Echoes — L43](the-jar-of-echoes.md#^ref-18138627-43-0) (line 43, col 0, score 0.66)
- [field-interaction-equations — L85](field-interaction-equations.md#^ref-b09141b7-85-0) (line 85, col 0, score 0.66)
- [Protocol_0_The_Contradiction_Engine — L129](protocol-0-the-contradiction-engine.md#^ref-9a93a756-129-0) (line 129, col 0, score 0.63)
- [aionian-circuit-math — L138](aionian-circuit-math.md#^ref-f2d83a77-138-0) (line 138, col 0, score 0.58)
- [Post-Linguistic Transhuman Design Frameworks — L73](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-73-0) (line 73, col 0, score 0.64)
- [field-dynamics-math-blocks — L126](field-dynamics-math-blocks.md#^ref-7cfc230d-126-0) (line 126, col 0, score 0.63)
- [Diagrams — L20](chunks/diagrams.md#^ref-45cd25b5-20-0) (line 20, col 0, score 0.63)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L47](promethean-copilot-intent-engine.md#^ref-ae24a280-47-0) (line 47, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.61)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.64)
- [Lisp-Compiler-Integration — L519](lisp-compiler-integration.md#^ref-cfee6d36-519-0) (line 519, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L120](prompt-folder-bootstrap.md#^ref-bd4f0976-120-0) (line 120, col 0, score 0.64)
- [Vectorial Exception Descent — L47](vectorial-exception-descent.md#^ref-d771154e-47-0) (line 47, col 0, score 0.67)
- [Duck's Self-Referential Perceptual Loop — L17](ducks-self-referential-perceptual-loop.md#^ref-71726f04-17-0) (line 17, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L9](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-9-0) (line 9, col 0, score 0.66)
- [Duck's Self-Referential Perceptual Loop — L20](ducks-self-referential-perceptual-loop.md#^ref-71726f04-20-0) (line 20, col 0, score 0.65)
- [Promethean_Eidolon_Synchronicity_Model — L43](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-43-0) (line 43, col 0, score 0.64)
- [Duck's Self-Referential Perceptual Loop — L21](ducks-self-referential-perceptual-loop.md#^ref-71726f04-21-0) (line 21, col 0, score 0.64)
- [Promethean_Eidolon_Synchronicity_Model — L3](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-3-0) (line 3, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L115](board-walk-2025-08-11.md#^ref-7aa1eb92-115-0) (line 115, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L101](migrate-to-provider-tenant-architecture.md#^ref-54382370-101-0) (line 101, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L827](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-827-0) (line 827, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.67)
- [Promethean-native config design — L37](promethean-native-config-design.md#^ref-ab748541-37-0) (line 37, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L393](js-to-lisp-reverse-compiler.md#^ref-58191024-393-0) (line 393, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L132](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-132-0) (line 132, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L26](functional-embedding-pipeline-refactor.md#^ref-a4a25141-26-0) (line 26, col 0, score 0.61)
- [Promethean-native config design — L59](promethean-native-config-design.md#^ref-ab748541-59-0) (line 59, col 0, score 0.6)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.59)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.58)
- [Model Upgrade Calm-Down Guide — L15](model-upgrade-calm-down-guide.md#^ref-db74343f-15-0) (line 15, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L14](model-upgrade-calm-down-guide.md#^ref-db74343f-14-0) (line 14, col 0, score 0.61)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.63)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L16](model-upgrade-calm-down-guide.md#^ref-db74343f-16-0) (line 16, col 0, score 0.58)
- [Agent Reflections and Prompt Evolution — L45](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-45-0) (line 45, col 0, score 0.67)
- [Layer1SurvivabilityEnvelope — L77](layer1survivabilityenvelope.md#^ref-64a9f9f9-77-0) (line 77, col 0, score 0.65)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.64)
- [The Jar of Echoes — L51](the-jar-of-echoes.md#^ref-18138627-51-0) (line 51, col 0, score 0.64)
- [field-node-diagram-outline — L11](field-node-diagram-outline.md#^ref-1f32c94a-11-0) (line 11, col 0, score 0.62)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.62)
- [Board Walk – 2025-08-11 — L71](board-walk-2025-08-11.md#^ref-7aa1eb92-71-0) (line 71, col 0, score 0.59)
- [infinite_depth_smoke_animation — L7](infinite-depth-smoke-animation.md#^ref-92a052a5-7-0) (line 7, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L340](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-340-0) (line 340, col 0, score 0.59)
- [field-node-diagram-set — L41](field-node-diagram-set.md#^ref-22b989d5-41-0) (line 41, col 0, score 0.58)
- [Board Automation Improvements — L2](board-automation-improvements.md#^ref-ac60a1d6-2-0) (line 2, col 0, score 0.58)
- [field-interaction-equations — L64](field-interaction-equations.md#^ref-b09141b7-64-0) (line 64, col 0, score 0.58)
- [field-dynamics-math-blocks — L113](field-dynamics-math-blocks.md#^ref-7cfc230d-113-0) (line 113, col 0, score 0.58)
- [field-node-diagram-set — L24](field-node-diagram-set.md#^ref-22b989d5-24-0) (line 24, col 0, score 0.63)
- [Tracing the Signal — L72](tracing-the-signal.md#^ref-c3cd4f65-72-0) (line 72, col 0, score 0.63)
- [eidolon-field-math-foundations — L3](eidolon-field-math-foundations.md#^ref-008f2ac0-3-0) (line 3, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L7](promethean-copilot-intent-engine.md#^ref-ae24a280-7-0) (line 7, col 0, score 0.63)
- [field-node-diagram-visualizations — L27](field-node-diagram-visualizations.md#^ref-e9b27b06-27-0) (line 27, col 0, score 0.63)
- [field-dynamics-math-blocks — L98](field-dynamics-math-blocks.md#^ref-7cfc230d-98-0) (line 98, col 0, score 0.58)
- [field-node-diagram-visualizations — L45](field-node-diagram-visualizations.md#^ref-e9b27b06-45-0) (line 45, col 0, score 0.62)
- [prompt-programming-language-lisp — L45](prompt-programming-language-lisp.md#^ref-d41a06d1-45-0) (line 45, col 0, score 0.61)
- [homeostasis-decay-formulas — L87](homeostasis-decay-formulas.md#^ref-37b5d236-87-0) (line 87, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L382](ecs-scheduler-and-prefabs.md#^ref-c62a1815-382-0) (line 382, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L380](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-380-0) (line 380, col 0, score 0.62)
- [Eidolon-Field-Optimization — L34](eidolon-field-optimization.md#^ref-40e05c14-34-0) (line 34, col 0, score 0.61)
- [universal-intention-code-fabric — L392](universal-intention-code-fabric.md#^ref-c14edce7-392-0) (line 392, col 0, score 0.6)
- [Protocol_0_The_Contradiction_Engine — L73](protocol-0-the-contradiction-engine.md#^ref-9a93a756-73-0) (line 73, col 0, score 0.63)
- [Duck's Self-Referential Perceptual Loop — L23](ducks-self-referential-perceptual-loop.md#^ref-71726f04-23-0) (line 23, col 0, score 0.59)
- [Voice Access Layer Design — L93](voice-access-layer-design.md#^ref-543ed9b3-93-0) (line 93, col 0, score 0.65)
- [ecs-offload-workers — L450](ecs-offload-workers.md#^ref-6498b9d7-450-0) (line 450, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L19](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-19-0) (line 19, col 0, score 0.62)
- [aionian-circuit-math — L87](aionian-circuit-math.md#^ref-f2d83a77-87-0) (line 87, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.61)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.59)
- [field-interaction-equations — L76](field-interaction-equations.md#^ref-b09141b7-76-0) (line 76, col 0, score 0.58)
- [Synchronicity Waves and Web — L40](synchronicity-waves-and-web.md#^ref-91295f3a-40-0) (line 40, col 0, score 0.6)
- [Smoke Resonance Visualizations — L49](smoke-resonance-visualizations.md#^ref-ac9d3ac5-49-0) (line 49, col 0, score 0.61)
- [eidolon-field-math-foundations — L20](eidolon-field-math-foundations.md#^ref-008f2ac0-20-0) (line 20, col 0, score 0.59)
- [field-node-diagram-outline — L28](field-node-diagram-outline.md#^ref-1f32c94a-28-0) (line 28, col 0, score 0.61)
- [aionian-circuit-math — L89](aionian-circuit-math.md#^ref-f2d83a77-89-0) (line 89, col 0, score 0.59)
- [field-node-diagram-set — L55](field-node-diagram-set.md#^ref-22b989d5-55-0) (line 55, col 0, score 0.62)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.61)
- [ripple-propagation-demo — L3](ripple-propagation-demo.md#^ref-8430617b-3-0) (line 3, col 0, score 0.63)
- [field-dynamics-math-blocks — L79](field-dynamics-math-blocks.md#^ref-7cfc230d-79-0) (line 79, col 0, score 0.63)
- [aionian-circuit-math — L34](aionian-circuit-math.md#^ref-f2d83a77-34-0) (line 34, col 0, score 0.61)
- [field-dynamics-math-blocks — L46](field-dynamics-math-blocks.md#^ref-7cfc230d-46-0) (line 46, col 0, score 0.61)
- [field-dynamics-math-blocks — L78](field-dynamics-math-blocks.md#^ref-7cfc230d-78-0) (line 78, col 0, score 0.61)
- [field-node-diagram-outline — L46](field-node-diagram-outline.md#^ref-1f32c94a-46-0) (line 46, col 0, score 0.61)
- [Eidolon Field Abstract Model — L146](eidolon-field-abstract-model.md#^ref-5e8b2388-146-0) (line 146, col 0, score 0.61)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.65)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.69)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.69)
- [Synchronicity Waves and Web — L11](synchronicity-waves-and-web.md#^ref-91295f3a-11-0) (line 11, col 0, score 0.63)
- [layer-1-uptime-diagrams — L102](layer-1-uptime-diagrams.md#^ref-4127189a-102-0) (line 102, col 0, score 0.68)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.67)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.66)
- [promethean-system-diagrams — L9](promethean-system-diagrams.md#^ref-b51e19b4-9-0) (line 9, col 0, score 0.66)
- [Model Selection for Lightweight Conversational Tasks — L43](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-43-0) (line 43, col 0, score 0.65)
- [promethean-system-diagrams — L116](promethean-system-diagrams.md#^ref-b51e19b4-116-0) (line 116, col 0, score 0.65)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.65)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.65)
- [Unique Info Dump Index — L3](unique-info-dump-index.md#^ref-30ec3ba6-3-0) (line 3, col 0, score 0.73)
- [Promethean-Copilot-Intent-Engine — L46](promethean-copilot-intent-engine.md#^ref-ae24a280-46-0) (line 46, col 0, score 0.71)
- [Model Upgrade Calm-Down Guide — L33](model-upgrade-calm-down-guide.md#^ref-db74343f-33-0) (line 33, col 0, score 0.6)
- [aionian-circuit-math — L145](aionian-circuit-math.md#^ref-f2d83a77-145-0) (line 145, col 0, score 0.65)
- [eidolon-field-math-foundations — L117](eidolon-field-math-foundations.md#^ref-008f2ac0-117-0) (line 117, col 0, score 0.65)
- [field-dynamics-math-blocks — L132](field-dynamics-math-blocks.md#^ref-7cfc230d-132-0) (line 132, col 0, score 0.65)
- [field-interaction-equations — L145](field-interaction-equations.md#^ref-b09141b7-145-0) (line 145, col 0, score 0.65)
- [homeostasis-decay-formulas — L145](homeostasis-decay-formulas.md#^ref-37b5d236-145-0) (line 145, col 0, score 0.65)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.64)
- [eidolon-node-lifecycle — L25](eidolon-node-lifecycle.md#^ref-938eca9c-25-0) (line 25, col 0, score 0.63)
- [field-node-diagram-outline — L94](field-node-diagram-outline.md#^ref-1f32c94a-94-0) (line 94, col 0, score 0.63)
- [field-node-diagram-set — L130](field-node-diagram-set.md#^ref-22b989d5-130-0) (line 130, col 0, score 0.63)
- [field-node-diagram-visualizations — L80](field-node-diagram-visualizations.md#^ref-e9b27b06-80-0) (line 80, col 0, score 0.63)
- [layer-1-uptime-diagrams — L150](layer-1-uptime-diagrams.md#^ref-4127189a-150-0) (line 150, col 0, score 0.63)
- [promethean-system-diagrams — L187](promethean-system-diagrams.md#^ref-b51e19b4-187-0) (line 187, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.75)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L147](prompt-folder-bootstrap.md#^ref-bd4f0976-147-0) (line 147, col 0, score 0.64)
- [Eidolon Field Abstract Model — L152](eidolon-field-abstract-model.md#^ref-5e8b2388-152-0) (line 152, col 0, score 0.65)
- [Eidolon Field Abstract Model — L115](eidolon-field-abstract-model.md#^ref-5e8b2388-115-0) (line 115, col 0, score 0.58)
- [Duck's Attractor States — L56](ducks-attractor-states.md#^ref-13951643-56-0) (line 56, col 0, score 0.64)
- [field-dynamics-math-blocks — L15](field-dynamics-math-blocks.md#^ref-7cfc230d-15-0) (line 15, col 0, score 0.64)
- [Prompt_Folder_Bootstrap — L161](prompt-folder-bootstrap.md#^ref-bd4f0976-161-0) (line 161, col 0, score 0.64)
- [field-interaction-equations — L84](field-interaction-equations.md#^ref-b09141b7-84-0) (line 84, col 0, score 0.62)
- [template-based-compilation — L82](template-based-compilation.md#^ref-f8877e5e-82-0) (line 82, col 0, score 0.61)
- [Promethean Pipelines — L75](promethean-pipelines.md#^ref-8b8e6103-75-0) (line 75, col 0, score 0.69)
- [windows-tiling-with-autohotkey — L90](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-90-0) (line 90, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L75](prompt-folder-bootstrap.md#^ref-bd4f0976-75-0) (line 75, col 0, score 0.59)
- [The Jar of Echoes — L14](the-jar-of-echoes.md#^ref-18138627-14-0) (line 14, col 0, score 0.59)
- [plan-update-confirmation — L27](plan-update-confirmation.md#^ref-b22d79c6-27-0) (line 27, col 0, score 0.58)
- [Tracing the Signal — L58](tracing-the-signal.md#^ref-c3cd4f65-58-0) (line 58, col 0, score 0.58)
- [Voice Access Layer Design — L110](voice-access-layer-design.md#^ref-543ed9b3-110-0) (line 110, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L33](prompt-folder-bootstrap.md#^ref-bd4f0976-33-0) (line 33, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L174](prompt-folder-bootstrap.md#^ref-bd4f0976-174-0) (line 174, col 0, score 0.56)
- [Promethean-Copilot-Intent-Engine — L8](promethean-copilot-intent-engine.md#^ref-ae24a280-8-0) (line 8, col 0, score 0.56)
- [The Jar of Echoes — L108](the-jar-of-echoes.md#^ref-18138627-108-0) (line 108, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L26](prompt-folder-bootstrap.md#^ref-bd4f0976-26-0) (line 26, col 0, score 0.55)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.61)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L71](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-71-0) (line 71, col 0, score 0.63)
- [ripple-propagation-demo — L1](ripple-propagation-demo.md#^ref-8430617b-1-0) (line 1, col 0, score 0.63)
- [Promethean-native config design — L355](promethean-native-config-design.md#^ref-ab748541-355-0) (line 355, col 0, score 0.63)
- [schema-evolution-workflow — L25](schema-evolution-workflow.md#^ref-d8059b6a-25-0) (line 25, col 0, score 0.62)
- [Vectorial Exception Descent — L39](vectorial-exception-descent.md#^ref-d771154e-39-0) (line 39, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.62)
- [infinite_depth_smoke_animation — L1](infinite-depth-smoke-animation.md#^ref-92a052a5-1-0) (line 1, col 0, score 0.62)
- [Smoke Resonance Visualizations — L33](smoke-resonance-visualizations.md#^ref-ac9d3ac5-33-0) (line 33, col 0, score 0.6)
- [field-interaction-equations — L3](field-interaction-equations.md#^ref-b09141b7-3-0) (line 3, col 0, score 0.64)
- [The Jar of Echoes — L9](the-jar-of-echoes.md#^ref-18138627-9-0) (line 9, col 0, score 0.62)
- [field-dynamics-math-blocks — L128](field-dynamics-math-blocks.md#^ref-7cfc230d-128-0) (line 128, col 0, score 0.63)
- [Promethean Pipelines — L50](promethean-pipelines.md#^ref-8b8e6103-50-0) (line 50, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L328](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-328-0) (line 328, col 0, score 0.6)
- [ParticleSimulationWithCanvasAndFFmpeg — L237](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-237-0) (line 237, col 0, score 0.6)
- [Layer1SurvivabilityEnvelope — L75](layer1survivabilityenvelope.md#^ref-64a9f9f9-75-0) (line 75, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.59)
- [Local-Only-LLM-Workflow — L160](local-only-llm-workflow.md#^ref-9a8ab57e-160-0) (line 160, col 0, score 0.59)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.58)
- [Layer1SurvivabilityEnvelope — L11](layer1survivabilityenvelope.md#^ref-64a9f9f9-11-0) (line 11, col 0, score 0.58)
- [Voice Access Layer Design — L202](voice-access-layer-design.md#^ref-543ed9b3-202-0) (line 202, col 0, score 0.58)
- [field-node-diagram-set — L9](field-node-diagram-set.md#^ref-22b989d5-9-0) (line 9, col 0, score 0.6)
- [promethean-system-diagrams — L34](promethean-system-diagrams.md#^ref-b51e19b4-34-0) (line 34, col 0, score 0.59)
- [i3-config-validation-methods — L34](i3-config-validation-methods.md#^ref-d28090ac-34-0) (line 34, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L458](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-458-0) (line 458, col 0, score 0.59)
- [Local-Offline-Model-Deployment-Strategy — L249](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-249-0) (line 249, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L151](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-151-0) (line 151, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L189](chroma-toolkit-consolidation-plan.md#^ref-5020e892-189-0) (line 189, col 0, score 0.59)
- [Event Bus MVP — L561](event-bus-mvp.md#^ref-534fe91d-561-0) (line 561, col 0, score 0.72)
- [Event Bus Projections Architecture — L159](event-bus-projections-architecture.md#^ref-cf6b9b17-159-0) (line 159, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L295](chroma-embedding-refactor.md#^ref-8b256935-295-0) (line 295, col 0, score 0.62)
- [Promethean State Format — L25](promethean-state-format.md#^ref-23df6ddb-25-0) (line 25, col 0, score 0.62)
- [Voice Access Layer Design — L98](voice-access-layer-design.md#^ref-543ed9b3-98-0) (line 98, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L155](chroma-toolkit-consolidation-plan.md#^ref-5020e892-155-0) (line 155, col 0, score 0.61)
- [Universal Lisp Interface — L131](universal-lisp-interface.md#^ref-b01856b4-131-0) (line 131, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L52](model-upgrade-calm-down-guide.md#^ref-db74343f-52-0) (line 52, col 0, score 0.66)
- [Voice Access Layer Design — L100](voice-access-layer-design.md#^ref-543ed9b3-100-0) (line 100, col 0, score 0.6)
- [Vectorial Exception Descent — L128](vectorial-exception-descent.md#^ref-d771154e-128-0) (line 128, col 0, score 0.62)
- [layer-1-uptime-diagrams — L171](layer-1-uptime-diagrams.md#^ref-4127189a-171-0) (line 171, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L886](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-886-0) (line 886, col 0, score 0.72)
- [archetype-ecs — L419](archetype-ecs.md#^ref-8f4c1e86-419-0) (line 419, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L107](board-walk-2025-08-11.md#^ref-7aa1eb92-107-0) (line 107, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.61)
- [2d-sandbox-field — L28](2d-sandbox-field.md#^ref-c710dc93-28-0) (line 28, col 0, score 0.57)
- [Eidolon Field Abstract Model — L107](eidolon-field-abstract-model.md#^ref-5e8b2388-107-0) (line 107, col 0, score 0.57)
- [prompt-programming-language-lisp — L18](prompt-programming-language-lisp.md#^ref-d41a06d1-18-0) (line 18, col 0, score 0.6)
- [Factorio AI with External Agents — L22](factorio-ai-with-external-agents.md#^ref-a4d90289-22-0) (line 22, col 0, score 0.58)
- [Local-Only-LLM-Workflow — L128](local-only-llm-workflow.md#^ref-9a8ab57e-128-0) (line 128, col 0, score 0.66)
- [Interop and Source Maps — L504](interop-and-source-maps.md#^ref-cdfac40c-504-0) (line 504, col 0, score 0.66)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.65)
- [Interop and Source Maps — L13](interop-and-source-maps.md#^ref-cdfac40c-13-0) (line 13, col 0, score 0.65)
- [Duck's Self-Referential Perceptual Loop — L15](ducks-self-referential-perceptual-loop.md#^ref-71726f04-15-0) (line 15, col 0, score 0.68)
- [heartbeat-simulation-snippets — L65](heartbeat-simulation-snippets.md#^ref-23e221e9-65-0) (line 65, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L175](dynamic-context-model-for-web-components.md#^ref-f7702bf8-175-0) (line 175, col 0, score 0.66)
- [Factorio AI with External Agents — L38](factorio-ai-with-external-agents.md#^ref-a4d90289-38-0) (line 38, col 0, score 0.59)
- [field-interaction-equations — L67](field-interaction-equations.md#^ref-b09141b7-67-0) (line 67, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L8](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-8-0) (line 8, col 0, score 0.61)
- [2d-sandbox-field — L171](2d-sandbox-field.md#^ref-c710dc93-171-0) (line 171, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L127](board-walk-2025-08-11.md#^ref-7aa1eb92-127-0) (line 127, col 0, score 0.65)
- [The Jar of Echoes — L115](the-jar-of-echoes.md#^ref-18138627-115-0) (line 115, col 0, score 0.58)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.58)
- [universal-intention-code-fabric — L3](universal-intention-code-fabric.md#^ref-c14edce7-3-0) (line 3, col 0, score 0.58)
- [Tracing the Signal — L11](tracing-the-signal.md#^ref-c3cd4f65-11-0) (line 11, col 0, score 0.58)
- [heartbeat-simulation-snippets — L3](heartbeat-simulation-snippets.md#^ref-23e221e9-3-0) (line 3, col 0, score 0.67)
- [ripple-propagation-demo — L52](ripple-propagation-demo.md#^ref-8430617b-52-0) (line 52, col 0, score 0.65)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.64)
- [heartbeat-simulation-snippets — L7](heartbeat-simulation-snippets.md#^ref-23e221e9-7-0) (line 7, col 0, score 0.66)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.64)
- [Ice Box Reorganization — L33](ice-box-reorganization.md#^ref-291c7d91-33-0) (line 33, col 0, score 0.68)
- [polymorphic-meta-programming-engine — L3](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-3-0) (line 3, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L76](cross-language-runtime-polymorphism.md#^ref-c34c36a6-76-0) (line 76, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L177](cross-language-runtime-polymorphism.md#^ref-c34c36a6-177-0) (line 177, col 0, score 0.64)
- [eidolon-node-lifecycle — L3](eidolon-node-lifecycle.md#^ref-938eca9c-3-0) (line 3, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L12](sibilant-meta-prompt-dsl.md#^ref-af5d2824-12-0) (line 12, col 0, score 0.62)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.62)
- [Mathematics Sampler — L64](mathematics-sampler.md#^ref-b5e0183e-64-0) (line 64, col 0, score 0.69)
- [Mathematical Samplers — L60](mathematical-samplers.md#^ref-86a691ec-60-0) (line 60, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L35](promethean-copilot-intent-engine.md#^ref-ae24a280-35-0) (line 35, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L345](performance-optimized-polyglot-bridge.md#^ref-f5579967-345-0) (line 345, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.67)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 0.62)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 0.62)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 0.66)
- [Promethean Infrastructure Setup — L554](promethean-infrastructure-setup.md#^ref-6deed6ac-554-0) (line 554, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L26](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-26-0) (line 26, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L25](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-25-0) (line 25, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L28](promethean-copilot-intent-engine.md#^ref-ae24a280-28-0) (line 28, col 0, score 0.63)
- [Eidolon-Field-Optimization — L14](eidolon-field-optimization.md#^ref-40e05c14-14-0) (line 14, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.63)
- [Exception Layer Analysis — L93](exception-layer-analysis.md#^ref-21d5cc09-93-0) (line 93, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L79](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-79-0) (line 79, col 0, score 0.63)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.63)
- [Optimizing Command Limitations in System Design — L14](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-14-0) (line 14, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L36](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-36-0) (line 36, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L6](promethean-copilot-intent-engine.md#^ref-ae24a280-6-0) (line 6, col 0, score 0.62)
- [aionian-circuit-math — L139](aionian-circuit-math.md#^ref-f2d83a77-139-0) (line 139, col 0, score 0.62)
- [aionian-circuit-math — L137](aionian-circuit-math.md#^ref-f2d83a77-137-0) (line 137, col 0, score 0.62)
- [aionian-circuit-math — L24](aionian-circuit-math.md#^ref-f2d83a77-24-0) (line 24, col 0, score 0.63)
- [windows-tiling-with-autohotkey — L78](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-78-0) (line 78, col 0, score 0.62)
- [layer-1-uptime-diagrams — L9](layer-1-uptime-diagrams.md#^ref-4127189a-9-0) (line 9, col 0, score 0.61)
- [Layer1SurvivabilityEnvelope — L48](layer1survivabilityenvelope.md#^ref-64a9f9f9-48-0) (line 48, col 0, score 0.58)
- [universal-intention-code-fabric — L33](universal-intention-code-fabric.md#^ref-c14edce7-33-0) (line 33, col 0, score 0.57)
- [Chroma-Embedding-Refactor — L298](chroma-embedding-refactor.md#^ref-8b256935-298-0) (line 298, col 0, score 0.57)
- [Reawakening Duck — L32](reawakening-duck.md#^ref-59b5670f-32-0) (line 32, col 0, score 0.62)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.61)
- [Factorio AI with External Agents — L136](factorio-ai-with-external-agents.md#^ref-a4d90289-136-0) (line 136, col 0, score 0.6)
- [field-node-diagram-set — L102](field-node-diagram-set.md#^ref-22b989d5-102-0) (line 102, col 0, score 0.61)
- [field-node-diagram-outline — L44](field-node-diagram-outline.md#^ref-1f32c94a-44-0) (line 44, col 0, score 0.66)
- [2d-sandbox-field — L9](2d-sandbox-field.md#^ref-c710dc93-9-0) (line 9, col 0, score 0.64)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.62)
- [homeostasis-decay-formulas — L63](homeostasis-decay-formulas.md#^ref-37b5d236-63-0) (line 63, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.6)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.6)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L106](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-106-0) (line 106, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L110](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-110-0) (line 110, col 0, score 0.72)
- [2d-sandbox-field — L13](2d-sandbox-field.md#^ref-c710dc93-13-0) (line 13, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L351](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-351-0) (line 351, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L60](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-60-0) (line 60, col 0, score 0.6)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.58)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.58)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.78)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.72)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.7)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.7)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.67)
- [field-node-diagram-outline — L61](field-node-diagram-outline.md#^ref-1f32c94a-61-0) (line 61, col 0, score 0.67)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.65)
- [2d-sandbox-field — L7](2d-sandbox-field.md#^ref-c710dc93-7-0) (line 7, col 0, score 0.6)
- [ripple-propagation-demo — L89](ripple-propagation-demo.md#^ref-8430617b-89-0) (line 89, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.59)
- [TypeScript Patch for Tool Calling Support — L426](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-426-0) (line 426, col 0, score 0.59)
- [Functional Embedding Pipeline Refactor — L307](functional-embedding-pipeline-refactor.md#^ref-a4a25141-307-0) (line 307, col 0, score 0.61)
- [field-dynamics-math-blocks — L81](field-dynamics-math-blocks.md#^ref-7cfc230d-81-0) (line 81, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Matplotlib Animation with Async Execution — L78](matplotlib-animation-with-async-execution.md#^ref-687439f9-78-0) (line 78, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
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
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [polymorphic-meta-programming-engine — L221](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-221-0) (line 221, col 0, score 1)
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
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
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
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L170](layer-1-uptime-diagrams.md#^ref-4127189a-170-0) (line 170, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L250](cross-language-runtime-polymorphism.md#^ref-c34c36a6-250-0) (line 250, col 0, score 1)
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
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Window Management — L23](chunks/window-management.md#^ref-9e8ae388-23-0) (line 23, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Duck's Attractor States — L68](ducks-attractor-states.md#^ref-13951643-68-0) (line 68, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Promethean Data Sync Protocol — L5](promethean-data-sync-protocol.md#^ref-9fab9e76-5-0) (line 5, col 0, score 1)
- [Promethean Dev Workflow Update — L66](promethean-dev-workflow-update.md#^ref-03a5578f-66-0) (line 66, col 0, score 1)
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
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [i3-config-validation-methods — L77](i3-config-validation-methods.md#^ref-d28090ac-77-0) (line 77, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 1)
- [Dynamic Context Model for Web Components — L420](dynamic-context-model-for-web-components.md#^ref-f7702bf8-420-0) (line 420, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [aionian-circuit-math — L181](aionian-circuit-math.md#^ref-f2d83a77-181-0) (line 181, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Math Fundamentals — L27](chunks/math-fundamentals.md#^ref-c6e87433-27-0) (line 27, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L177](chroma-toolkit-consolidation-plan.md#^ref-5020e892-177-0) (line 177, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [field-node-diagram-set — L166](field-node-diagram-set.md#^ref-22b989d5-166-0) (line 166, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
