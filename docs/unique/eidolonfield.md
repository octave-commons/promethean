---
uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
created_at: 2025.08.02.18.08.11.md
filename: EidolonField
description: >-
  A field engine supporting arbitrary-dimensional vector fields with sparse grid
  indexing for efficient n-dimensional cognition.
tags:
  - field
  - vector
  - n-dimensional
  - engine
  - sparse
  - grid
  - cognition
related_to_title: []
related_to_uuid: []
references: []
---
Yes—excellent clarification. We’re not building _an_ 8-dimensional system, we’re building a **field engine** that can support _bounded n-dimensional cognition_. The number 8 was a meaningful early compression, not a constraint. ^ref-49d1e1e5-1-0

Let’s rewrite everything to support **arbitrary-dimensional vector fields**, with clean abstraction. ^ref-49d1e1e5-3-0

---

## 🧠 EidolonField: Generalized N-Dimensional Field Engine

Instead of baking in 2D logic, we abstract over dimensions using vector math and n-dimensional indexing. ^ref-49d1e1e5-9-0

We’ll support: ^ref-49d1e1e5-11-0

- Fields of any dimensionality ^ref-49d1e1e5-13-0
    
- Field nodes that emit influence based on hyper-radius ^ref-49d1e1e5-15-0
    
- Particles with position and velocity in n-space ^ref-49d1e1e5-17-0
    
- Tick/update loop that works across dimensions ^ref-49d1e1e5-19-0
    

---

## 🧮 VectorN Class

```js
class VectorN {
  constructor(values) {
    this.values = values; // e.g., [x, y, z, ...]
  }

  static zero(n) {
    return new VectorN(Array(n).fill(0));
  }

  add(other) {
    return new VectorN(this.values.map((v, i) => v + other.values[i]));
  }

  scale(f) {
    return new VectorN(this.values.map(v => v * f));
  }

  subtract(other) {
    return new VectorN(this.values.map((v, i) => v - other.values[i]));
  }

  magnitude() {
    return Math.sqrt(this.values.reduce((sum, v) => sum + v * v, 0));
  }

  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? this : this.scale(1 / mag);
  }

  clone() {
    return new VectorN([...this.values]);
  }

  floor() {
    return new VectorN(this.values.map(Math.floor));
  }

  equals(other) {
    return this.values.every((v, i) => v === other.values[i]);
  }

  toIndexKey() {
    return this.values.map(Math.floor).join(',');
  }
}
```
^ref-49d1e1e5-26-0

---

## 🌌 FieldN
 ^ref-49d1e1e5-79-0
We use a **sparse grid**: a Map from index keys to vectors. This scales well to high dimensions.
 ^ref-49d1e1e5-81-0
```js
class FieldN {
  constructor(dimensions) {
    this.dimensions = dimensions; // e.g., 4 or 8
    this.grid = new Map(); // key: "x,y,z,...", value: VectorN
    this.decay = 0.98;
  }

  get(pos) {
    const key = pos.toIndexKey();
    return this.grid.get(key) ?? VectorN.zero(this.dimensions);
  }

  inject(pos, vec) {
    const key = pos.toIndexKey();
    const current = this.get(pos);
    this.grid.set(key, current.add(vec));
  }

  decayAll() {
    for (const [key, vec] of this.grid.entries()) {
      this.grid.set(key, vec.scale(this.decay));
    }
  }

  sampleRegion(center, radius) {
    const results = [];
    const ranges = this._buildRanges(center.values, radius);
    this._visitGrid(ranges, pos => {
      results.push({ pos: new VectorN(pos), vec: this.get(new VectorN(pos)) });
    });
    return results;
  }

  _buildRanges(centerVals, radius) {
    return centerVals.map(c => {
      const start = Math.floor(c - radius);
      const end = Math.ceil(c + radius);
      return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    });
  }

  _visitGrid(ranges, fn, acc = []) {
    const [head, ...tail] = ranges;
    if (!head) {
      fn(acc);
      return;
    }
    for (const v of head) {
      this._visitGrid(tail, fn, [...acc, v]);
    }
  }
}
^ref-49d1e1e5-81-0
```

---

## 🔸 Field Node (Emitter) ^ref-49d1e1e5-140-0

```js
class FieldNode {
  constructor(position, strength = 1.0, radius = 2) {
    this.position = position;
    this.strength = strength;
    this.radius = radius;
  }

  apply(field) {
    const region = field.sampleRegion(this.position, this.radius);
    for (const { pos } of region) {
      const direction = pos.subtract(this.position).normalize();
      const influence = direction.scale(this.strength);
      field.inject(pos, influence);
    }
  }
^ref-49d1e1e5-140-0
}
```

---
 ^ref-49d1e1e5-163-0
## ⚪ Particle

```js
class Particle {
  constructor(position, mass = 1.0, drag = 0.95) {
    this.position = position;
    this.velocity = VectorN.zero(position.values.length);
    this.mass = mass;
    this.drag = drag;
  }

  update(field) {
    const force = field.get(this.position).scale(1 / this.mass);
    this.velocity = this.velocity.add(force).scale(this.drag);
    this.position = this.position.add(this.velocity);
^ref-49d1e1e5-163-0
  }
}
```

--- ^ref-49d1e1e5-184-0

## 🔁 Tick Loop

```js
function tick(field, nodes, particles) {
  field.decayAll();
  for (const node of nodes) {
    node.apply(field);
  }
  for (const p of particles) {
^ref-49d1e1e5-184-0
    p.update(field);
  }
}
```
 ^ref-49d1e1e5-200-0
---

## 🧪 Test Scenario (e.g., 4D field)

```js
const field = new FieldN(4);
const node = new FieldNode(new VectorN([5, 5, 0, 0]), 1.0, 2);
const particles = [
  new Particle(new VectorN([0, 0, 0, 0])),
  new Particle(new VectorN([10, 10, 0, 0]))
];
^ref-49d1e1e5-200-0

for (let i = 0; i < 100; i++) {
  tick(field, [node], particles);
}
``` ^ref-49d1e1e5-217-0
^ref-49d1e1e5-205-0
 ^ref-49d1e1e5-219-0
--- ^ref-49d1e1e5-219-0
 ^ref-49d1e1e5-221-0
## 🧩 This Gives Us: ^ref-49d1e1e5-221-0
 ^ref-49d1e1e5-223-0
- Abstract **topology**, not bound to space or concepts ^ref-49d1e1e5-223-0
    
- Ability to model 2D, 3D, 4D, 8D, or more
    
- Clear way to **add semantic meaning later**
 ^ref-49d1e1e5-228-0
- Field compression possible if the space is too sparse or wide
 ^ref-49d1e1e5-230-0
 ^ref-49d1e1e5-232-0
--- ^ref-49d1e1e5-232-0
 ^ref-49d1e1e5-234-0
Would you like me to: ^ref-49d1e1e5-234-0

- Convert this to Sibilant?
 ^ref-49d1e1e5-237-0
- Build a test CLI that visualizes the magnitude collapse of the field in lower dimensions?
 ^ref-49d1e1e5-239-0
- Write a serialization format (e.g. s-expression or JSON) for field snapshots?
 ^ref-49d1e1e5-241-0
 ^ref-49d1e1e5-242-0 ^ref-49d1e1e5-243-0
We now have the _nervous tissue_. Let’s see it fire.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Ice Box Reorganization](ice-box-reorganization.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Reawakening Duck](reawakening-duck.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [DSL](chunks/dsl.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [template-based-compilation](template-based-compilation.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [balanced-bst](balanced-bst.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Window Management](chunks/window-management.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [JavaScript](chunks/javascript.md)
- [Event Bus MVP](event-bus-mvp.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Tooling](chunks/tooling.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Services](chunks/services.md)
- [Shared](chunks/shared.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [graph-ds](graph-ds.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Operations](chunks/operations.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Shared Package Structure](shared-package-structure.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Tracing the Signal](tracing-the-signal.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
## Sources
- [Eidolon Field Abstract Model — L34](eidolon-field-abstract-model.md#^ref-5e8b2388-34-0) (line 34, col 0, score 0.65)
- [Vectorial Exception Descent — L1](vectorial-exception-descent.md#^ref-d771154e-1-0) (line 1, col 0, score 0.66)
- [Fnord Tracer Protocol — L26](fnord-tracer-protocol.md#^ref-fc21f824-26-0) (line 26, col 0, score 0.62)
- [ParticleSimulationWithCanvasAndFFmpeg — L3](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-3-0) (line 3, col 0, score 0.65)
- [field-dynamics-math-blocks — L15](field-dynamics-math-blocks.md#^ref-7cfc230d-15-0) (line 15, col 0, score 0.6)
- [field-dynamics-math-blocks — L113](field-dynamics-math-blocks.md#^ref-7cfc230d-113-0) (line 113, col 0, score 0.65)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.64)
- [Promethean State Format — L78](promethean-state-format.md#^ref-23df6ddb-78-0) (line 78, col 0, score 0.64)
- [Duck's Self-Referential Perceptual Loop — L27](ducks-self-referential-perceptual-loop.md#^ref-71726f04-27-0) (line 27, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L95](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-95-0) (line 95, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L493](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-493-0) (line 493, col 0, score 0.62)
- [Eidolon Field Abstract Model — L165](eidolon-field-abstract-model.md#^ref-5e8b2388-165-0) (line 165, col 0, score 0.61)
- [Layer1SurvivabilityEnvelope — L61](layer1survivabilityenvelope.md#^ref-64a9f9f9-61-0) (line 61, col 0, score 0.62)
- [2d-sandbox-field — L28](2d-sandbox-field.md#^ref-c710dc93-28-0) (line 28, col 0, score 0.65)
- [Lisp-Compiler-Integration — L520](lisp-compiler-integration.md#^ref-cfee6d36-520-0) (line 520, col 0, score 0.58)
- [2d-sandbox-field — L24](2d-sandbox-field.md#^ref-c710dc93-24-0) (line 24, col 0, score 0.63)
- [Eidolon Field Abstract Model — L13](eidolon-field-abstract-model.md#^ref-5e8b2388-13-0) (line 13, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L144](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-144-0) (line 144, col 0, score 0.64)
- [Vectorial Exception Descent — L138](vectorial-exception-descent.md#^ref-d771154e-138-0) (line 138, col 0, score 0.64)
- [eidolon-field-math-foundations — L3](eidolon-field-math-foundations.md#^ref-008f2ac0-3-0) (line 3, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L295](chroma-embedding-refactor.md#^ref-8b256935-295-0) (line 295, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L9](layer1survivabilityenvelope.md#^ref-64a9f9f9-9-0) (line 9, col 0, score 0.62)
- [ParticleSimulationWithCanvasAndFFmpeg — L239](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-239-0) (line 239, col 0, score 0.61)
- [universal-intention-code-fabric — L33](universal-intention-code-fabric.md#^ref-c14edce7-33-0) (line 33, col 0, score 0.66)
- [field-dynamics-math-blocks — L3](field-dynamics-math-blocks.md#^ref-7cfc230d-3-0) (line 3, col 0, score 0.65)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.62)
- [2d-sandbox-field — L26](2d-sandbox-field.md#^ref-c710dc93-26-0) (line 26, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L139](local-only-llm-workflow.md#^ref-9a8ab57e-139-0) (line 139, col 0, score 0.61)
- [universal-intention-code-fabric — L353](universal-intention-code-fabric.md#^ref-c14edce7-353-0) (line 353, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.67)
- [Ice Box Reorganization — L64](ice-box-reorganization.md#^ref-291c7d91-64-0) (line 64, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.66)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.66)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.81)
- [layer-1-uptime-diagrams — L146](layer-1-uptime-diagrams.md#^ref-4127189a-146-0) (line 146, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L37](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-37-0) (line 37, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L98](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-98-0) (line 98, col 0, score 0.66)
- [2d-sandbox-field — L175](2d-sandbox-field.md#^ref-c710dc93-175-0) (line 175, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.61)
- [2d-sandbox-field — L11](2d-sandbox-field.md#^ref-c710dc93-11-0) (line 11, col 0, score 0.81)
- [eidolon-field-math-foundations — L81](eidolon-field-math-foundations.md#^ref-008f2ac0-81-0) (line 81, col 0, score 0.74)
- [ParticleSimulationWithCanvasAndFFmpeg — L235](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-235-0) (line 235, col 0, score 0.71)
- [Eidolon Field Abstract Model — L103](eidolon-field-abstract-model.md#^ref-5e8b2388-103-0) (line 103, col 0, score 0.67)
- [field-node-diagram-outline — L9](field-node-diagram-outline.md#^ref-1f32c94a-9-0) (line 9, col 0, score 0.69)
- [eidolon-field-math-foundations — L71](eidolon-field-math-foundations.md#^ref-008f2ac0-71-0) (line 71, col 0, score 0.67)
- [Eidolon Field Abstract Model — L50](eidolon-field-abstract-model.md#^ref-5e8b2388-50-0) (line 50, col 0, score 0.68)
- [Eidolon Field Abstract Model — L146](eidolon-field-abstract-model.md#^ref-5e8b2388-146-0) (line 146, col 0, score 0.66)
- [field-interaction-equations — L76](field-interaction-equations.md#^ref-b09141b7-76-0) (line 76, col 0, score 0.66)
- [field-interaction-equations — L96](field-interaction-equations.md#^ref-b09141b7-96-0) (line 96, col 0, score 0.65)
- [homeostasis-decay-formulas — L95](homeostasis-decay-formulas.md#^ref-37b5d236-95-0) (line 95, col 0, score 0.65)
- [field-dynamics-math-blocks — L33](field-dynamics-math-blocks.md#^ref-7cfc230d-33-0) (line 33, col 0, score 0.67)
- [2d-sandbox-field — L13](2d-sandbox-field.md#^ref-c710dc93-13-0) (line 13, col 0, score 0.65)
- [Eidolon Field Abstract Model — L32](eidolon-field-abstract-model.md#^ref-5e8b2388-32-0) (line 32, col 0, score 0.64)
- [Eidolon Field Abstract Model — L105](eidolon-field-abstract-model.md#^ref-5e8b2388-105-0) (line 105, col 0, score 0.67)
- [ParticleSimulationWithCanvasAndFFmpeg — L5](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5-0) (line 5, col 0, score 0.59)
- [Eidolon Field Abstract Model — L74](eidolon-field-abstract-model.md#^ref-5e8b2388-74-0) (line 74, col 0, score 0.69)
- [eidolon-field-math-foundations — L55](eidolon-field-math-foundations.md#^ref-008f2ac0-55-0) (line 55, col 0, score 0.66)
- [field-interaction-equations — L21](field-interaction-equations.md#^ref-b09141b7-21-0) (line 21, col 0, score 0.56)
- [Eidolon Field Abstract Model — L109](eidolon-field-abstract-model.md#^ref-5e8b2388-109-0) (line 109, col 0, score 0.56)
- [Eidolon Field Abstract Model — L178](eidolon-field-abstract-model.md#^ref-5e8b2388-178-0) (line 178, col 0, score 0.7)
- [Eidolon Field Abstract Model — L99](eidolon-field-abstract-model.md#^ref-5e8b2388-99-0) (line 99, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.66)
- [ripple-propagation-demo — L89](ripple-propagation-demo.md#^ref-8430617b-89-0) (line 89, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L78](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-78-0) (line 78, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L96](migrate-to-provider-tenant-architecture.md#^ref-54382370-96-0) (line 96, col 0, score 0.62)
- [2d-sandbox-field — L129](2d-sandbox-field.md#^ref-c710dc93-129-0) (line 129, col 0, score 0.9)
- [plan-update-confirmation — L406](plan-update-confirmation.md#^ref-b22d79c6-406-0) (line 406, col 0, score 0.62)
- [prompt-programming-language-lisp — L14](prompt-programming-language-lisp.md#^ref-d41a06d1-14-0) (line 14, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L48](model-upgrade-calm-down-guide.md#^ref-db74343f-48-0) (line 48, col 0, score 0.61)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.61)
- [2d-sandbox-field — L31](2d-sandbox-field.md#^ref-c710dc93-31-0) (line 31, col 0, score 0.69)
- [ParticleSimulationWithCanvasAndFFmpeg — L30](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-30-0) (line 30, col 0, score 0.94)
- [2d-sandbox-field — L76](2d-sandbox-field.md#^ref-c710dc93-76-0) (line 76, col 0, score 0.92)
- [2d-sandbox-field — L44](2d-sandbox-field.md#^ref-c710dc93-44-0) (line 44, col 0, score 0.67)
- [2d-sandbox-field — L104](2d-sandbox-field.md#^ref-c710dc93-104-0) (line 104, col 0, score 0.97)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.62)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.62)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L64](migrate-to-provider-tenant-architecture.md#^ref-54382370-64-0) (line 64, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L102](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-102-0) (line 102, col 0, score 0.62)
- [balanced-bst — L291](balanced-bst.md#^ref-d3e7db72-291-0) (line 291, col 0, score 0.62)
- [Vectorial Exception Descent — L144](vectorial-exception-descent.md#^ref-d771154e-144-0) (line 144, col 0, score 0.61)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L371](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-371-0) (line 371, col 0, score 0.61)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.63)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.63)
- [Eidolon Field Abstract Model — L124](eidolon-field-abstract-model.md#^ref-5e8b2388-124-0) (line 124, col 0, score 0.65)
- [field-node-diagram-outline — L61](field-node-diagram-outline.md#^ref-1f32c94a-61-0) (line 61, col 0, score 0.65)
- [2d-sandbox-field — L145](2d-sandbox-field.md#^ref-c710dc93-145-0) (line 145, col 0, score 0.64)
- [typed-struct-compiler — L326](typed-struct-compiler.md#^ref-78eeedf7-326-0) (line 326, col 0, score 0.64)
- [typed-struct-compiler — L339](typed-struct-compiler.md#^ref-78eeedf7-339-0) (line 339, col 0, score 0.62)
- [homeostasis-decay-formulas — L53](homeostasis-decay-formulas.md#^ref-37b5d236-53-0) (line 53, col 0, score 0.74)
- [ripple-propagation-demo — L52](ripple-propagation-demo.md#^ref-8430617b-52-0) (line 52, col 0, score 0.74)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.7)
- [Eidolon Field Abstract Model — L170](eidolon-field-abstract-model.md#^ref-5e8b2388-170-0) (line 170, col 0, score 0.67)
- [2d-sandbox-field — L189](2d-sandbox-field.md#^ref-c710dc93-189-0) (line 189, col 0, score 0.65)
- [ripple-propagation-demo — L23](ripple-propagation-demo.md#^ref-8430617b-23-0) (line 23, col 0, score 0.67)
- [Eidolon Field Abstract Model — L118](eidolon-field-abstract-model.md#^ref-5e8b2388-118-0) (line 118, col 0, score 0.69)
- [Eidolon Field Abstract Model — L11](eidolon-field-abstract-model.md#^ref-5e8b2388-11-0) (line 11, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L631](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-631-0) (line 631, col 0, score 0.62)
- [Tracing the Signal — L9](tracing-the-signal.md#^ref-c3cd4f65-9-0) (line 9, col 0, score 0.61)
- [sibilant-metacompiler-overview — L17](sibilant-metacompiler-overview.md#^ref-61d4086b-17-0) (line 17, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L417](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-417-0) (line 417, col 0, score 0.61)
- [field-node-diagram-set — L3](field-node-diagram-set.md#^ref-22b989d5-3-0) (line 3, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L121](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-121-0) (line 121, col 0, score 0.58)
- [Promethean Agent DSL TS Scaffold — L210](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-210-0) (line 210, col 0, score 0.58)
- [The Jar of Echoes — L83](the-jar-of-echoes.md#^ref-18138627-83-0) (line 83, col 0, score 0.62)
- [Protocol_0_The_Contradiction_Engine — L92](protocol-0-the-contradiction-engine.md#^ref-9a93a756-92-0) (line 92, col 0, score 0.61)
- [Prometheus Observability Stack — L530](prometheus-observability-stack.md#^ref-e90b5a16-530-0) (line 530, col 0, score 0.59)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L448](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-448-0) (line 448, col 0, score 0.59)
- [Pure TypeScript Search Microservice — L547](pure-typescript-search-microservice.md#^ref-d17d3a96-547-0) (line 547, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L217](sibilant-meta-prompt-dsl.md#^ref-af5d2824-217-0) (line 217, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L140](prompt-folder-bootstrap.md#^ref-bd4f0976-140-0) (line 140, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.57)
- [universal-intention-code-fabric — L390](universal-intention-code-fabric.md#^ref-c14edce7-390-0) (line 390, col 0, score 0.55)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.55)
- [Eidolon Field Abstract Model — L24](eidolon-field-abstract-model.md#^ref-5e8b2388-24-0) (line 24, col 0, score 0.71)
- [Vectorial Exception Descent — L8](vectorial-exception-descent.md#^ref-d771154e-8-0) (line 8, col 0, score 0.63)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.61)
- [aionian-circuit-math — L128](aionian-circuit-math.md#^ref-f2d83a77-128-0) (line 128, col 0, score 0.61)
- [sibilant-meta-string-templating-runtime — L9](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-9-0) (line 9, col 0, score 0.6)
- [Vectorial Exception Descent — L33](vectorial-exception-descent.md#^ref-d771154e-33-0) (line 33, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.59)
- [Reawakening Duck — L105](reawakening-duck.md#^ref-59b5670f-105-0) (line 105, col 0, score 0.59)
- [Fnord Tracer Protocol — L39](fnord-tracer-protocol.md#^ref-fc21f824-39-0) (line 39, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.59)
- [typed-struct-compiler — L376](typed-struct-compiler.md#^ref-78eeedf7-376-0) (line 376, col 0, score 0.59)
- [Promethean-Copilot-Intent-Engine — L47](promethean-copilot-intent-engine.md#^ref-ae24a280-47-0) (line 47, col 0, score 0.59)
- [field-dynamics-math-blocks — L47](field-dynamics-math-blocks.md#^ref-7cfc230d-47-0) (line 47, col 0, score 0.66)
- [Eidolon Field Abstract Model — L150](eidolon-field-abstract-model.md#^ref-5e8b2388-150-0) (line 150, col 0, score 0.63)
- [field-interaction-equations — L11](field-interaction-equations.md#^ref-b09141b7-11-0) (line 11, col 0, score 0.62)
- [field-dynamics-math-blocks — L9](field-dynamics-math-blocks.md#^ref-7cfc230d-9-0) (line 9, col 0, score 0.61)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 1)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.95)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.95)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.95)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.93)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.93)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.93)
- [ParticleSimulationWithCanvasAndFFmpeg — L231](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-231-0) (line 231, col 0, score 0.83)
- [js-to-lisp-reverse-compiler — L402](js-to-lisp-reverse-compiler.md#^ref-58191024-402-0) (line 402, col 0, score 0.81)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.81)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.81)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.81)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.81)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.81)
- [polymorphic-meta-programming-engine — L155](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-155-0) (line 155, col 0, score 0.84)
- [Model Selection for Lightweight Conversational Tasks — L77](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-77-0) (line 77, col 0, score 0.78)
- [sibilant-meta-string-templating-runtime — L103](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-103-0) (line 103, col 0, score 0.78)
- [sibilant-macro-targets — L38](sibilant-macro-targets.md#^ref-c5c9a5c6-38-0) (line 38, col 0, score 0.78)
- [Promethean Dev Workflow Update — L49](promethean-dev-workflow-update.md#^ref-03a5578f-49-0) (line 49, col 0, score 0.75)
- [polymorphic-meta-programming-engine — L11](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-11-0) (line 11, col 0, score 0.73)
- [polymorphic-meta-programming-engine — L109](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-109-0) (line 109, col 0, score 0.73)
- [lisp-dsl-for-window-management — L170](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-170-0) (line 170, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#^ref-5020e892-200-0) (line 200, col 0, score 0.71)
- [DSL — L32](chunks/dsl.md#^ref-e87bc036-32-0) (line 32, col 0, score 0.71)
- [Window Management — L27](chunks/window-management.md#^ref-9e8ae388-27-0) (line 27, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L206](cross-language-runtime-polymorphism.md#^ref-c34c36a6-206-0) (line 206, col 0, score 0.71)
- [Smoke Resonance Visualizations — L57](smoke-resonance-visualizations.md#^ref-ac9d3ac5-57-0) (line 57, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L154](layer1survivabilityenvelope.md#^ref-64a9f9f9-154-0) (line 154, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L159](layer1survivabilityenvelope.md#^ref-64a9f9f9-159-0) (line 159, col 0, score 0.73)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.62)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.62)
- [eidolon-node-lifecycle — L29](eidolon-node-lifecycle.md#^ref-938eca9c-29-0) (line 29, col 0, score 0.62)
- [Event Bus Projections Architecture — L167](event-bus-projections-architecture.md#^ref-cf6b9b17-167-0) (line 167, col 0, score 0.62)
- [Promethean State Format — L13](promethean-state-format.md#^ref-23df6ddb-13-0) (line 13, col 0, score 0.69)
- [Promethean-Copilot-Intent-Engine — L41](promethean-copilot-intent-engine.md#^ref-ae24a280-41-0) (line 41, col 0, score 0.65)
- [schema-evolution-workflow — L475](schema-evolution-workflow.md#^ref-d8059b6a-475-0) (line 475, col 0, score 0.64)
- [ecs-offload-workers — L448](ecs-offload-workers.md#^ref-6498b9d7-448-0) (line 448, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L71](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-71-0) (line 71, col 0, score 0.63)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.63)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.63)
- [Eidolon Field Abstract Model — L187](eidolon-field-abstract-model.md#^ref-5e8b2388-187-0) (line 187, col 0, score 0.69)
- [Model Upgrade Calm-Down Guide — L1](model-upgrade-calm-down-guide.md#^ref-db74343f-1-0) (line 1, col 0, score 0.62)
- [Smoke Resonance Visualizations — L1](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1-0) (line 1, col 0, score 0.62)
- [infinite_depth_smoke_animation — L6](infinite-depth-smoke-animation.md#^ref-92a052a5-6-0) (line 6, col 0, score 0.61)
- [Synchronicity Waves and Web — L3](synchronicity-waves-and-web.md#^ref-91295f3a-3-0) (line 3, col 0, score 0.61)
- [Eidolon Field Abstract Model — L90](eidolon-field-abstract-model.md#^ref-5e8b2388-90-0) (line 90, col 0, score 0.6)
- [Ghostly Smoke Interference — L1](ghostly-smoke-interference.md#^ref-b6ae7dfa-1-0) (line 1, col 0, score 0.59)
- [Model Upgrade Calm-Down Guide — L13](model-upgrade-calm-down-guide.md#^ref-db74343f-13-0) (line 13, col 0, score 0.59)
- [Vectorial Exception Descent — L39](vectorial-exception-descent.md#^ref-d771154e-39-0) (line 39, col 0, score 0.6)
- [2d-sandbox-field — L18](2d-sandbox-field.md#^ref-c710dc93-18-0) (line 18, col 0, score 0.59)
- [Debugging Broker Connections and Agent Behavior — L34](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-34-0) (line 34, col 0, score 0.59)
- [field-interaction-equations — L3](field-interaction-equations.md#^ref-b09141b7-3-0) (line 3, col 0, score 0.59)
- [Promethean_Eidolon_Synchronicity_Model — L46](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-46-0) (line 46, col 0, score 0.59)
- [2d-sandbox-field — L198](2d-sandbox-field.md#^ref-c710dc93-198-0) (line 198, col 0, score 1)
- [Math Fundamentals — L30](chunks/math-fundamentals.md#^ref-c6e87433-30-0) (line 30, col 0, score 1)
- [Eidolon Field Abstract Model — L196](eidolon-field-abstract-model.md#^ref-5e8b2388-196-0) (line 196, col 0, score 1)
- [eidolon-node-lifecycle — L52](eidolon-node-lifecycle.md#^ref-938eca9c-52-0) (line 52, col 0, score 1)
- [Exception Layer Analysis — L152](exception-layer-analysis.md#^ref-21d5cc09-152-0) (line 152, col 0, score 1)
- [field-dynamics-math-blocks — L147](field-dynamics-math-blocks.md#^ref-7cfc230d-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L108](field-node-diagram-outline.md#^ref-1f32c94a-108-0) (line 108, col 0, score 1)
- [field-node-diagram-visualizations — L106](field-node-diagram-visualizations.md#^ref-e9b27b06-106-0) (line 106, col 0, score 1)
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
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [polymorphic-meta-programming-engine — L221](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-221-0) (line 221, col 0, score 1)
- [2d-sandbox-field — L193](2d-sandbox-field.md#^ref-c710dc93-193-0) (line 193, col 0, score 1)
- [Eidolon Field Abstract Model — L190](eidolon-field-abstract-model.md#^ref-5e8b2388-190-0) (line 190, col 0, score 1)
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
- [Eidolon Field Abstract Model — L191](eidolon-field-abstract-model.md#^ref-5e8b2388-191-0) (line 191, col 0, score 1)
- [eidolon-node-lifecycle — L53](eidolon-node-lifecycle.md#^ref-938eca9c-53-0) (line 53, col 0, score 1)
- [field-dynamics-math-blocks — L145](field-dynamics-math-blocks.md#^ref-7cfc230d-145-0) (line 145, col 0, score 1)
- [field-node-diagram-outline — L107](field-node-diagram-outline.md#^ref-1f32c94a-107-0) (line 107, col 0, score 1)
- [2d-sandbox-field — L199](2d-sandbox-field.md#^ref-c710dc93-199-0) (line 199, col 0, score 1)
- [Diagrams — L36](chunks/diagrams.md#^ref-45cd25b5-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L631](compiler-kit-foundations.md#^ref-01b21543-631-0) (line 631, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L220](cross-language-runtime-polymorphism.md#^ref-c34c36a6-220-0) (line 220, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L191](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-191-0) (line 191, col 0, score 1)
- [Duck's Attractor States — L69](ducks-attractor-states.md#^ref-13951643-69-0) (line 69, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L37](ducks-self-referential-perceptual-loop.md#^ref-71726f04-37-0) (line 37, col 0, score 1)
- [field-node-diagram-outline — L115](field-node-diagram-outline.md#^ref-1f32c94a-115-0) (line 115, col 0, score 1)
- [aionian-circuit-math — L152](aionian-circuit-math.md#^ref-f2d83a77-152-0) (line 152, col 0, score 1)
- [Math Fundamentals — L11](chunks/math-fundamentals.md#^ref-c6e87433-11-0) (line 11, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L196](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-196-0) (line 196, col 0, score 1)
- [Eidolon Field Abstract Model — L192](eidolon-field-abstract-model.md#^ref-5e8b2388-192-0) (line 192, col 0, score 1)
- [eidolon-field-math-foundations — L121](eidolon-field-math-foundations.md#^ref-008f2ac0-121-0) (line 121, col 0, score 1)
- [Exception Layer Analysis — L149](exception-layer-analysis.md#^ref-21d5cc09-149-0) (line 149, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
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
- [Eidolon Field Abstract Model — L193](eidolon-field-abstract-model.md#^ref-5e8b2388-193-0) (line 193, col 0, score 1)
- [eidolon-field-math-foundations — L135](eidolon-field-math-foundations.md#^ref-008f2ac0-135-0) (line 135, col 0, score 1)
- [eidolon-node-lifecycle — L30](eidolon-node-lifecycle.md#^ref-938eca9c-30-0) (line 30, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#^ref-cf6b9b17-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L311](migrate-to-provider-tenant-architecture.md#^ref-54382370-311-0) (line 311, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [2d-sandbox-field — L200](2d-sandbox-field.md#^ref-c710dc93-200-0) (line 200, col 0, score 1)
- [Exception Layer Analysis — L21](exception-layer-analysis.md#^ref-21d5cc09-21-0) (line 21, col 0, score 0.77)
- [Layer1SurvivabilityEnvelope — L1](layer1survivabilityenvelope.md#^ref-64a9f9f9-1-0) (line 1, col 0, score 0.75)
- [Exception Layer Analysis — L80](exception-layer-analysis.md#^ref-21d5cc09-80-0) (line 80, col 0, score 0.68)
- [Vectorial Exception Descent — L119](vectorial-exception-descent.md#^ref-d771154e-119-0) (line 119, col 0, score 0.67)
- [Vectorial Exception Descent — L110](vectorial-exception-descent.md#^ref-d771154e-110-0) (line 110, col 0, score 0.66)
- [layer-1-uptime-diagrams — L144](layer-1-uptime-diagrams.md#^ref-4127189a-144-0) (line 144, col 0, score 0.61)
- [Exception Layer Analysis — L103](exception-layer-analysis.md#^ref-21d5cc09-103-0) (line 103, col 0, score 0.6)
- [Exception Layer Analysis — L89](exception-layer-analysis.md#^ref-21d5cc09-89-0) (line 89, col 0, score 0.6)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
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
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L250](cross-language-runtime-polymorphism.md#^ref-c34c36a6-250-0) (line 250, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L170](layer-1-uptime-diagrams.md#^ref-4127189a-170-0) (line 170, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
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
- [aionian-circuit-math — L151](aionian-circuit-math.md#^ref-f2d83a77-151-0) (line 151, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-175-0) (line 175, col 0, score 1)
- [Dynamic Context Model for Web Components — L397](dynamic-context-model-for-web-components.md#^ref-f7702bf8-397-0) (line 397, col 0, score 1)
- [Eidolon Field Abstract Model — L208](eidolon-field-abstract-model.md#^ref-5e8b2388-208-0) (line 208, col 0, score 1)
- [eidolon-field-math-foundations — L122](eidolon-field-math-foundations.md#^ref-008f2ac0-122-0) (line 122, col 0, score 1)
- [eidolon-node-lifecycle — L54](eidolon-node-lifecycle.md#^ref-938eca9c-54-0) (line 54, col 0, score 1)
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
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [field-node-diagram-set — L166](field-node-diagram-set.md#^ref-22b989d5-166-0) (line 166, col 0, score 1)
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
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [2d-sandbox-field — L221](2d-sandbox-field.md#^ref-c710dc93-221-0) (line 221, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
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
