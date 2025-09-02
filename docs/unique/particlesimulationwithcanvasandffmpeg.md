---
uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
created_at: 2025.08.02.18.08.49.md
filename: ParticleSimulationWithCanvasAndFFmpeg
description: >-
  A Node.js script that simulates particle interactions in an n-dimensional
  field, projects to 2D for rendering, and generates a video using ffmpeg.
tags:
  - Node.js
  - canvas
  - ffmpeg
  - particles
  - simulation
  - field
  - n-dimensional
related_to_title: []
related_to_uuid: []
references: []
---
Absolutely. Here’s a **Node.js + `canvas` + `ffmpeg`**-friendly script that: ^ref-e018dd7a-1-0

1. Creates an `n`-dimensional field (we’ll project it to 2D for rendering). ^ref-e018dd7a-3-0
    
2. Initializes a set of randomly placed particles. ^ref-e018dd7a-5-0
    
3. Evolves the field over 120 frames.
    
4. Renders each frame to a PNG. ^ref-e018dd7a-9-0
    
5. Optionally stitches those frames into a video using `ffmpeg`.
    

---

### ⚙️ Prereqs

Install dependencies: ^ref-e018dd7a-18-0

```bash
npm install canvas execa fs-extra
```
^ref-e018dd7a-20-0
 ^ref-e018dd7a-24-0
Ensure `ffmpeg` is installed and in your path.

---

### 📜 `simulate.js`
 ^ref-e018dd7a-30-0
```js
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');

const WIDTH = 400;
const HEIGHT = 400;
const DIM = 2;
const FRAMES = 120;
const PARTICLE_COUNT = 40;

class VectorN {
  constructor(values) {
    this.values = values;
  }
  static zero(n) {
    return new VectorN(Array(n).fill(0));
  }
  add(other) {
    return new VectorN(this.values.map((v, i) => v + other.values[i]));
  }
  subtract(other) {
    return new VectorN(this.values.map((v, i) => v - other.values[i]));
  }
  scale(f) {
    return new VectorN(this.values.map(v => v * f));
  }
  magnitude() {
    return Math.sqrt(this.values.reduce((s, v) => s + v ** 2, 0));
  }
  normalize() {
    const m = this.magnitude();
    return m === 0 ? this : this.scale(1 / m);
  }
  floor() {
    return new VectorN(this.values.map(Math.floor));
  }
  toIndexKey() {
    return this.values.map(Math.floor).join(',');
  }
}

class FieldN {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.grid = new Map();
    this.decay = 0.95;
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
    const ranges = center.values.map(c => {
      const start = Math.floor(c - radius);
      const end = Math.ceil(c + radius);
      return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    });

    const results = [];
    const recurse = (acc, dim) => {
      if (dim === ranges.length) {
        const pos = new VectorN(acc);
        results.push({ pos, vec: this.get(pos) });
        return;
      }
      for (const val of ranges[dim]) {
        recurse([...acc, val], dim + 1);
      }
    };
    recurse([], 0);
    return results;
  }
}

class FieldNode {
  constructor(position, strength = 1.0, radius = 4) {
    this.position = position;
    this.strength = strength;
    this.radius = radius;
  }

  apply(field) {
    for (const { pos } of field.sampleRegion(this.position, this.radius)) {
      const dir = pos.subtract(this.position).normalize().scale(this.strength);
      field.inject(pos, dir);
    }
  }
}

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
  }

  projected2D() {
    const [x, y] = this.position.values;
    return {
      x: Math.floor((x / 50) * WIDTH + WIDTH / 2),
      y: Math.floor((y / 50) * HEIGHT + HEIGHT / 2)
    };
  }
}

async function run() {
  const field = new FieldN(DIM);
  const node = new FieldNode(new VectorN([0, 0]), 1.5, 6);
  const particles = Array.from({ length: PARTICLE_COUNT }, () =>
    new Particle(new VectorN([
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    ]), 1 + Math.random() * 2, 0.9 + Math.random() * 0.09)
  );

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const outDir = 'frames';

  await fs.ensureDir(outDir);

  for (let i = 0; i < FRAMES; i++) {
    field.decayAll();
    node.apply(field);
    for (const p of particles) p.update(field);

    // draw frame
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = 'white';
    for (const p of particles) {
      const { x, y } = p.projected2D();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const filename = path.join(outDir, `frame_${String(i).padStart(3, '0')}.png`);
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filename, buffer);
    process.stdout.write('.');
  }

  console.log('\nEncoding video...');

  await execa('ffmpeg', [
    '-y',
    '-framerate', '30',
    '-i', path.join(outDir, 'frame_%03d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  ]);

  console.log('Video saved as output.mp4');
}

run();
^ref-e018dd7a-30-0
```

---

### 🧪 To run: ^ref-e018dd7a-218-0

```bash
^ref-e018dd7a-218-0
node simulate.js ^ref-e018dd7a-222-0
```
 ^ref-e018dd7a-224-0
You'll get:

- 120 PNG frames in `./frames`
    
- `output.mp4` as a smooth, projected simulation
    
 ^ref-e018dd7a-231-0
---
 ^ref-e018dd7a-233-0
Let me know if you want to:
 ^ref-e018dd7a-235-0
- Add coloring based on velocity or mass
 ^ref-e018dd7a-237-0
- Emit multiple field nodes
 ^ref-e018dd7a-239-0
- Add trails or heatmaps to the field
    
- Project higher dimensions (e.g. 4D → 2D slice) ^ref-e018dd7a-242-0
    

This is your **visual probe into the Eidolon’s physics**.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [EidolonField](eidolonfield.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Reawakening Duck](reawakening-duck.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [JavaScript](chunks/javascript.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [archetype-ecs](archetype-ecs.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Diagrams](chunks/diagrams.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Services](chunks/services.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [field-interaction-equations](field-interaction-equations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [balanced-bst](balanced-bst.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Shared](chunks/shared.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Tooling](chunks/tooling.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [graph-ds](graph-ds.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Operations](chunks/operations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Shared Package Structure](shared-package-structure.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean State Format](promethean-state-format.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
## Sources
- [typed-struct-compiler — L10](typed-struct-compiler.md#^ref-78eeedf7-10-0) (line 10, col 0, score 0.73)
- [Promethean-native config design — L347](promethean-native-config-design.md#^ref-ab748541-347-0) (line 347, col 0, score 0.72)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.73)
- [Universal Lisp Interface — L91](universal-lisp-interface.md#^ref-b01856b4-91-0) (line 91, col 0, score 0.69)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.69)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.68)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.68)
- [Cross-Language Runtime Polymorphism — L23](cross-language-runtime-polymorphism.md#^ref-c34c36a6-23-0) (line 23, col 0, score 0.7)
- [Promethean-native config design — L363](promethean-native-config-design.md#^ref-ab748541-363-0) (line 363, col 0, score 0.68)
- [obsidian-ignore-node-modules-regex — L38](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-38-0) (line 38, col 0, score 0.67)
- [lisp-dsl-for-window-management — L178](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-178-0) (line 178, col 0, score 0.62)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.66)
- [EidolonField — L13](eidolonfield.md#^ref-49d1e1e5-13-0) (line 13, col 0, score 0.59)
- [EidolonField — L3](eidolonfield.md#^ref-49d1e1e5-3-0) (line 3, col 0, score 0.7)
- [Layer1SurvivabilityEnvelope — L61](layer1survivabilityenvelope.md#^ref-64a9f9f9-61-0) (line 61, col 0, score 0.7)
- [2d-sandbox-field — L24](2d-sandbox-field.md#^ref-c710dc93-24-0) (line 24, col 0, score 0.69)
- [2d-sandbox-field — L1](2d-sandbox-field.md#^ref-c710dc93-1-0) (line 1, col 0, score 0.72)
- [archetype-ecs — L474](archetype-ecs.md#^ref-8f4c1e86-474-0) (line 474, col 0, score 0.69)
- [Duck's Attractor States — L73](ducks-attractor-states.md#^ref-13951643-73-0) (line 73, col 0, score 0.69)
- [Duck's Self-Referential Perceptual Loop — L46](ducks-self-referential-perceptual-loop.md#^ref-71726f04-46-0) (line 46, col 0, score 0.69)
- [ecs-offload-workers — L494](ecs-offload-workers.md#^ref-6498b9d7-494-0) (line 494, col 0, score 0.69)
- [Eidolon Field Abstract Model — L189](eidolon-field-abstract-model.md#^ref-5e8b2388-189-0) (line 189, col 0, score 0.69)
- [eidolon-node-lifecycle — L40](eidolon-node-lifecycle.md#^ref-938eca9c-40-0) (line 40, col 0, score 0.69)
- [Event Bus MVP — L584](event-bus-mvp.md#^ref-534fe91d-584-0) (line 584, col 0, score 0.69)
- [Eidolon-Field-Optimization — L19](eidolon-field-optimization.md#^ref-40e05c14-19-0) (line 19, col 0, score 0.67)
- [Eidolon Field Abstract Model — L113](eidolon-field-abstract-model.md#^ref-5e8b2388-113-0) (line 113, col 0, score 0.72)
- [2d-sandbox-field — L13](2d-sandbox-field.md#^ref-c710dc93-13-0) (line 13, col 0, score 0.57)
- [2d-sandbox-field — L186](2d-sandbox-field.md#^ref-c710dc93-186-0) (line 186, col 0, score 0.63)
- [2d-sandbox-field — L173](2d-sandbox-field.md#^ref-c710dc93-173-0) (line 173, col 0, score 0.62)
- [Eidolon Field Abstract Model — L105](eidolon-field-abstract-model.md#^ref-5e8b2388-105-0) (line 105, col 0, score 0.62)
- [2d-sandbox-field — L199](2d-sandbox-field.md#^ref-c710dc93-199-0) (line 199, col 0, score 0.62)
- [compiler-kit-foundations — L631](compiler-kit-foundations.md#^ref-01b21543-631-0) (line 631, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L220](cross-language-runtime-polymorphism.md#^ref-c34c36a6-220-0) (line 220, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L191](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-191-0) (line 191, col 0, score 0.62)
- [Duck's Attractor States — L69](ducks-attractor-states.md#^ref-13951643-69-0) (line 69, col 0, score 0.62)
- [Fnord Tracer Protocol — L26](fnord-tracer-protocol.md#^ref-fc21f824-26-0) (line 26, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L98](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-98-0) (line 98, col 0, score 0.7)
- [eidolon-field-math-foundations — L83](eidolon-field-math-foundations.md#^ref-008f2ac0-83-0) (line 83, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.63)
- [2d-sandbox-field — L195](2d-sandbox-field.md#^ref-c710dc93-195-0) (line 195, col 0, score 0.62)
- [aionian-circuit-math — L152](aionian-circuit-math.md#^ref-f2d83a77-152-0) (line 152, col 0, score 1)
- [Math Fundamentals — L11](chunks/math-fundamentals.md#^ref-c6e87433-11-0) (line 11, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L196](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-196-0) (line 196, col 0, score 1)
- [Eidolon Field Abstract Model — L192](eidolon-field-abstract-model.md#^ref-5e8b2388-192-0) (line 192, col 0, score 1)
- [eidolon-field-math-foundations — L121](eidolon-field-math-foundations.md#^ref-008f2ac0-121-0) (line 121, col 0, score 1)
- [Voice Access Layer Design — L284](voice-access-layer-design.md#^ref-543ed9b3-284-0) (line 284, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L159](cross-language-runtime-polymorphism.md#^ref-c34c36a6-159-0) (line 159, col 0, score 0.63)
- [Cross-Language Runtime Polymorphism — L93](cross-language-runtime-polymorphism.md#^ref-c34c36a6-93-0) (line 93, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L62](matplotlib-animation-with-async-execution.md#^ref-687439f9-62-0) (line 62, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L139](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-139-0) (line 139, col 0, score 0.52)
- [Matplotlib Animation with Async Execution — L15](matplotlib-animation-with-async-execution.md#^ref-687439f9-15-0) (line 15, col 0, score 0.62)
- [Matplotlib Animation with Async Execution — L40](matplotlib-animation-with-async-execution.md#^ref-687439f9-40-0) (line 40, col 0, score 0.62)
- [Eidolon-Field-Optimization — L10](eidolon-field-optimization.md#^ref-40e05c14-10-0) (line 10, col 0, score 0.59)
- [Eidolon-Field-Optimization — L14](eidolon-field-optimization.md#^ref-40e05c14-14-0) (line 14, col 0, score 0.57)
- [Promethean State Format — L3](promethean-state-format.md#^ref-23df6ddb-3-0) (line 3, col 0, score 0.61)
- [Canonical Org-Babel Matplotlib Animation Template — L5](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-5-0) (line 5, col 0, score 0.6)
- [infinite_depth_smoke_animation — L7](infinite-depth-smoke-animation.md#^ref-92a052a5-7-0) (line 7, col 0, score 0.58)
- [Language-Agnostic Mirror System — L523](language-agnostic-mirror-system.md#^ref-d2b3628c-523-0) (line 523, col 0, score 0.58)
- [komorebi-group-window-hack — L1](komorebi-group-window-hack.md#^ref-dd89372d-1-0) (line 1, col 0, score 0.58)
- [schema-evolution-workflow — L469](schema-evolution-workflow.md#^ref-d8059b6a-469-0) (line 469, col 0, score 0.56)
- [field-interaction-equations — L85](field-interaction-equations.md#^ref-b09141b7-85-0) (line 85, col 0, score 0.56)
- [Eidolon-Field-Optimization — L9](eidolon-field-optimization.md#^ref-40e05c14-9-0) (line 9, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L242](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-242-0) (line 242, col 0, score 0.56)
- [schema-evolution-workflow — L25](schema-evolution-workflow.md#^ref-d8059b6a-25-0) (line 25, col 0, score 0.56)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L398](ecs-scheduler-and-prefabs.md#^ref-c62a1815-398-0) (line 398, col 0, score 0.6)
- [eidolon-field-math-foundations — L160](eidolon-field-math-foundations.md#^ref-008f2ac0-160-0) (line 160, col 0, score 0.6)
- [field-interaction-equations — L172](field-interaction-equations.md#^ref-b09141b7-172-0) (line 172, col 0, score 0.6)
- [field-node-diagram-outline — L137](field-node-diagram-outline.md#^ref-1f32c94a-137-0) (line 137, col 0, score 0.6)
- [graph-ds — L372](graph-ds.md#^ref-6620e2f2-372-0) (line 372, col 0, score 0.6)
- [heartbeat-simulation-snippets — L119](heartbeat-simulation-snippets.md#^ref-23e221e9-119-0) (line 119, col 0, score 0.6)
- [homeostasis-decay-formulas — L178](homeostasis-decay-formulas.md#^ref-37b5d236-178-0) (line 178, col 0, score 0.6)
- [i3-config-validation-methods — L73](i3-config-validation-methods.md#^ref-d28090ac-73-0) (line 73, col 0, score 0.6)
- [js-to-lisp-reverse-compiler — L424](js-to-lisp-reverse-compiler.md#^ref-58191024-424-0) (line 424, col 0, score 0.6)
- [komorebi-group-window-hack — L209](komorebi-group-window-hack.md#^ref-dd89372d-209-0) (line 209, col 0, score 0.6)
- [Language-Agnostic Mirror System — L537](language-agnostic-mirror-system.md#^ref-d2b3628c-537-0) (line 537, col 0, score 0.6)
- [layer-1-uptime-diagrams — L194](layer-1-uptime-diagrams.md#^ref-4127189a-194-0) (line 194, col 0, score 0.6)
- [Provider-Agnostic Chat Panel Implementation — L223](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-223-0) (line 223, col 0, score 0.61)
- [Provider-Agnostic Chat Panel Implementation — L1](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-1-0) (line 1, col 0, score 0.6)
- [Matplotlib Animation with Async Execution — L7](matplotlib-animation-with-async-execution.md#^ref-687439f9-7-0) (line 7, col 0, score 0.69)
- [Matplotlib Animation with Async Execution — L31](matplotlib-animation-with-async-execution.md#^ref-687439f9-31-0) (line 31, col 0, score 0.69)
- [Universal Lisp Interface — L61](universal-lisp-interface.md#^ref-b01856b4-61-0) (line 61, col 0, score 0.56)
- [Provider-Agnostic Chat Panel Implementation — L221](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-221-0) (line 221, col 0, score 0.56)
- [Provider-Agnostic Chat Panel Implementation — L20](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-20-0) (line 20, col 0, score 0.55)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.54)
- [Universal Lisp Interface — L74](universal-lisp-interface.md#^ref-b01856b4-74-0) (line 74, col 0, score 0.54)
- [Universal Lisp Interface — L39](universal-lisp-interface.md#^ref-b01856b4-39-0) (line 39, col 0, score 0.54)
- [file-watcher-auth-fix — L9](file-watcher-auth-fix.md#^ref-9044701b-9-0) (line 9, col 0, score 0.53)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.53)
- [2d-sandbox-field — L184](2d-sandbox-field.md#^ref-c710dc93-184-0) (line 184, col 0, score 0.52)
- [Local-Offline-Model-Deployment-Strategy — L234](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-234-0) (line 234, col 0, score 0.65)
- [windows-tiling-with-autohotkey — L34](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-34-0) (line 34, col 0, score 0.64)
- [Promethean Agent Config DSL — L116](promethean-agent-config-dsl.md#^ref-2c00ce45-116-0) (line 116, col 0, score 0.62)
- [obsidian-ignore-node-modules-regex — L12](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-12-0) (line 12, col 0, score 0.61)
- [Promethean Agent Config DSL — L137](promethean-agent-config-dsl.md#^ref-2c00ce45-137-0) (line 137, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.6)
- [obsidian-ignore-node-modules-regex — L6](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-6-0) (line 6, col 0, score 0.59)
- [RAG UI Panel with Qdrant and PostgREST — L79](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-79-0) (line 79, col 0, score 0.59)
- [Matplotlib Animation with Async Execution — L9](matplotlib-animation-with-async-execution.md#^ref-687439f9-9-0) (line 9, col 0, score 0.58)
- [shared-package-layout-clarification — L118](shared-package-layout-clarification.md#^ref-36c8882a-118-0) (line 118, col 0, score 0.58)
- [plan-update-confirmation — L443](plan-update-confirmation.md#^ref-b22d79c6-443-0) (line 443, col 0, score 0.58)
- [EidolonField — L81](eidolonfield.md#^ref-49d1e1e5-81-0) (line 81, col 0, score 0.94)
- [EidolonField — L26](eidolonfield.md#^ref-49d1e1e5-26-0) (line 26, col 0, score 0.64)
- [2d-sandbox-field — L31](2d-sandbox-field.md#^ref-c710dc93-31-0) (line 31, col 0, score 0.65)
- [2d-sandbox-field — L76](2d-sandbox-field.md#^ref-c710dc93-76-0) (line 76, col 0, score 0.75)
- [2d-sandbox-field — L44](2d-sandbox-field.md#^ref-c710dc93-44-0) (line 44, col 0, score 0.7)
- [EidolonField — L140](eidolonfield.md#^ref-49d1e1e5-140-0) (line 140, col 0, score 0.73)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.59)
- [2d-sandbox-field — L104](2d-sandbox-field.md#^ref-c710dc93-104-0) (line 104, col 0, score 0.58)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.68)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.65)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.64)
- [EidolonField — L163](eidolonfield.md#^ref-49d1e1e5-163-0) (line 163, col 0, score 0.58)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.66)
- [EidolonField — L200](eidolonfield.md#^ref-49d1e1e5-200-0) (line 200, col 0, score 0.7)
- [2d-sandbox-field — L145](2d-sandbox-field.md#^ref-c710dc93-145-0) (line 145, col 0, score 0.74)
- [2d-sandbox-field — L129](2d-sandbox-field.md#^ref-c710dc93-129-0) (line 129, col 0, score 0.73)
- [Eidolon Field Abstract Model — L124](eidolon-field-abstract-model.md#^ref-5e8b2388-124-0) (line 124, col 0, score 0.59)
- [EidolonField — L184](eidolonfield.md#^ref-49d1e1e5-184-0) (line 184, col 0, score 0.74)
- [Eidolon Field Abstract Model — L74](eidolon-field-abstract-model.md#^ref-5e8b2388-74-0) (line 74, col 0, score 0.64)
- [typed-struct-compiler — L339](typed-struct-compiler.md#^ref-78eeedf7-339-0) (line 339, col 0, score 0.65)
- [ripple-propagation-demo — L52](ripple-propagation-demo.md#^ref-8430617b-52-0) (line 52, col 0, score 0.65)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.64)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.63)
- [2d-sandbox-field — L189](2d-sandbox-field.md#^ref-c710dc93-189-0) (line 189, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L63](layer1survivabilityenvelope.md#^ref-64a9f9f9-63-0) (line 63, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L32](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-32-0) (line 32, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L169](cross-language-runtime-polymorphism.md#^ref-c34c36a6-169-0) (line 169, col 0, score 0.63)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.63)
- [Diagrams — L12](chunks/diagrams.md#^ref-45cd25b5-12-0) (line 12, col 0, score 0.61)
- [Math Fundamentals — L25](chunks/math-fundamentals.md#^ref-c6e87433-25-0) (line 25, col 0, score 0.61)
- [Services — L24](chunks/services.md#^ref-75ea4a6a-24-0) (line 24, col 0, score 0.61)
- [Shared — L16](chunks/shared.md#^ref-623a55f7-16-0) (line 16, col 0, score 0.61)
- [Simulation Demo — L19](chunks/simulation-demo.md#^ref-557309a3-19-0) (line 19, col 0, score 0.61)
- [sibilant-macro-targets — L33](sibilant-macro-targets.md#^ref-c5c9a5c6-33-0) (line 33, col 0, score 0.88)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.77)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.71)
- [Universal Lisp Interface — L5](universal-lisp-interface.md#^ref-b01856b4-5-0) (line 5, col 0, score 0.69)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.78)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.68)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.78)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.78)
- [Voice Access Layer Design — L201](voice-access-layer-design.md#^ref-543ed9b3-201-0) (line 201, col 0, score 0.54)
- [Performance-Optimized-Polyglot-Bridge — L414](performance-optimized-polyglot-bridge.md#^ref-f5579967-414-0) (line 414, col 0, score 0.53)
- [Voice Access Layer Design — L11](voice-access-layer-design.md#^ref-543ed9b3-11-0) (line 11, col 0, score 0.52)
- [Canonical Org-Babel Matplotlib Animation Template — L67](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-67-0) (line 67, col 0, score 0.52)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [eidolon-node-lifecycle — L50](eidolon-node-lifecycle.md#^ref-938eca9c-50-0) (line 50, col 0, score 1)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.83)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.83)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.82)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.82)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.82)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.81)
- [windows-tiling-with-autohotkey — L104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-104-0) (line 104, col 0, score 0.8)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.78)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.77)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.77)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.77)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.77)
- [field-dynamics-math-blocks — L33](field-dynamics-math-blocks.md#^ref-7cfc230d-33-0) (line 33, col 0, score 0.67)
- [Eidolon Field Abstract Model — L109](eidolon-field-abstract-model.md#^ref-5e8b2388-109-0) (line 109, col 0, score 0.65)
- [Eidolon Field Abstract Model — L21](eidolon-field-abstract-model.md#^ref-5e8b2388-21-0) (line 21, col 0, score 0.63)
- [Duck's Attractor States — L47](ducks-attractor-states.md#^ref-13951643-47-0) (line 47, col 0, score 0.59)
- [field-dynamics-math-blocks — L99](field-dynamics-math-blocks.md#^ref-7cfc230d-99-0) (line 99, col 0, score 0.58)
- [field-dynamics-math-blocks — L23](field-dynamics-math-blocks.md#^ref-7cfc230d-23-0) (line 23, col 0, score 0.58)
- [field-node-diagram-outline — L9](field-node-diagram-outline.md#^ref-1f32c94a-9-0) (line 9, col 0, score 0.78)
- [2d-sandbox-field — L11](2d-sandbox-field.md#^ref-c710dc93-11-0) (line 11, col 0, score 0.73)
- [EidolonField — L15](eidolonfield.md#^ref-49d1e1e5-15-0) (line 15, col 0, score 0.71)
- [eidolon-field-math-foundations — L71](eidolon-field-math-foundations.md#^ref-008f2ac0-71-0) (line 71, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L139](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-139-0) (line 139, col 0, score 0.7)
- [Simulation Demo — L17](chunks/simulation-demo.md#^ref-557309a3-17-0) (line 17, col 0, score 0.7)
- [Eidolon Field Abstract Model — L203](eidolon-field-abstract-model.md#^ref-5e8b2388-203-0) (line 203, col 0, score 0.7)
- [eidolon-node-lifecycle — L31](eidolon-node-lifecycle.md#^ref-938eca9c-31-0) (line 31, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.65)
- [field-node-diagram-set — L118](field-node-diagram-set.md#^ref-22b989d5-118-0) (line 118, col 0, score 0.64)
- [Exception Layer Analysis — L54](exception-layer-analysis.md#^ref-21d5cc09-54-0) (line 54, col 0, score 0.74)
- [field-node-diagram-outline — L3](field-node-diagram-outline.md#^ref-1f32c94a-3-0) (line 3, col 0, score 0.63)
- [set-assignment-in-lisp-ast — L144](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-144-0) (line 144, col 0, score 0.63)
- [field-dynamics-math-blocks — L119](field-dynamics-math-blocks.md#^ref-7cfc230d-119-0) (line 119, col 0, score 0.63)
- [Fnord Tracer Protocol — L205](fnord-tracer-protocol.md#^ref-fc21f824-205-0) (line 205, col 0, score 0.62)
- [Eidolon Field Abstract Model — L115](eidolon-field-abstract-model.md#^ref-5e8b2388-115-0) (line 115, col 0, score 0.62)
- [eidolon-node-lifecycle — L29](eidolon-node-lifecycle.md#^ref-938eca9c-29-0) (line 29, col 0, score 0.61)
- [EidolonField — L219](eidolonfield.md#^ref-49d1e1e5-219-0) (line 219, col 0, score 0.68)
- [EidolonField — L9](eidolonfield.md#^ref-49d1e1e5-9-0) (line 9, col 0, score 0.67)
- [EidolonField — L1](eidolonfield.md#^ref-49d1e1e5-1-0) (line 1, col 0, score 0.61)
- [EidolonField — L79](eidolonfield.md#^ref-49d1e1e5-79-0) (line 79, col 0, score 0.61)
- [2d-sandbox-field — L175](2d-sandbox-field.md#^ref-c710dc93-175-0) (line 175, col 0, score 0.6)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L493](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-493-0) (line 493, col 0, score 0.59)
- [State Snapshots API and Transactional Projector — L318](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-318-0) (line 318, col 0, score 0.59)
- [Eidolon-Field-Optimization — L3](eidolon-field-optimization.md#^ref-40e05c14-3-0) (line 3, col 0, score 0.74)
- [js-to-lisp-reverse-compiler — L418](js-to-lisp-reverse-compiler.md#^ref-58191024-418-0) (line 418, col 0, score 1)
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
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
- [2d-sandbox-field — L198](2d-sandbox-field.md#^ref-c710dc93-198-0) (line 198, col 0, score 1)
- [Math Fundamentals — L30](chunks/math-fundamentals.md#^ref-c6e87433-30-0) (line 30, col 0, score 1)
- [Eidolon Field Abstract Model — L196](eidolon-field-abstract-model.md#^ref-5e8b2388-196-0) (line 196, col 0, score 1)
- [eidolon-node-lifecycle — L52](eidolon-node-lifecycle.md#^ref-938eca9c-52-0) (line 52, col 0, score 1)
- [EidolonField — L239](eidolonfield.md#^ref-49d1e1e5-239-0) (line 239, col 0, score 1)
- [Exception Layer Analysis — L152](exception-layer-analysis.md#^ref-21d5cc09-152-0) (line 152, col 0, score 1)
- [field-dynamics-math-blocks — L147](field-dynamics-math-blocks.md#^ref-7cfc230d-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L108](field-node-diagram-outline.md#^ref-1f32c94a-108-0) (line 108, col 0, score 1)
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
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [polymorphic-meta-programming-engine — L221](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-221-0) (line 221, col 0, score 1)
- [2d-sandbox-field — L193](2d-sandbox-field.md#^ref-c710dc93-193-0) (line 193, col 0, score 1)
- [Eidolon Field Abstract Model — L190](eidolon-field-abstract-model.md#^ref-5e8b2388-190-0) (line 190, col 0, score 1)
- [EidolonField — L242](eidolonfield.md#^ref-49d1e1e5-242-0) (line 242, col 0, score 1)
- [Exception Layer Analysis — L145](exception-layer-analysis.md#^ref-21d5cc09-145-0) (line 145, col 0, score 1)
- [field-dynamics-math-blocks — L144](field-dynamics-math-blocks.md#^ref-7cfc230d-144-0) (line 144, col 0, score 1)
- [field-node-diagram-outline — L105](field-node-diagram-outline.md#^ref-1f32c94a-105-0) (line 105, col 0, score 1)
- [Ice Box Reorganization — L69](ice-box-reorganization.md#^ref-291c7d91-69-0) (line 69, col 0, score 1)
- [js-to-lisp-reverse-compiler — L417](js-to-lisp-reverse-compiler.md#^ref-58191024-417-0) (line 417, col 0, score 1)
- [aionian-circuit-math — L169](aionian-circuit-math.md#^ref-f2d83a77-169-0) (line 169, col 0, score 1)
- [api-gateway-versioning — L290](api-gateway-versioning.md#^ref-0580dcd3-290-0) (line 290, col 0, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#^ref-7aa1eb92-135-0) (line 135, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#^ref-5020e892-180-0) (line 180, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L185](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-185-0) (line 185, col 0, score 1)
- [Dynamic Context Model for Web Components — L402](dynamic-context-model-for-web-components.md#^ref-f7702bf8-402-0) (line 402, col 0, score 1)
- [Eidolon Field Abstract Model — L191](eidolon-field-abstract-model.md#^ref-5e8b2388-191-0) (line 191, col 0, score 1)
- [eidolon-node-lifecycle — L53](eidolon-node-lifecycle.md#^ref-938eca9c-53-0) (line 53, col 0, score 1)
- [EidolonField — L243](eidolonfield.md#^ref-49d1e1e5-243-0) (line 243, col 0, score 1)
- [field-dynamics-math-blocks — L145](field-dynamics-math-blocks.md#^ref-7cfc230d-145-0) (line 145, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
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
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [EidolonField — L245](eidolonfield.md#^ref-49d1e1e5-245-0) (line 245, col 0, score 1)
- [Exception Layer Analysis — L149](exception-layer-analysis.md#^ref-21d5cc09-149-0) (line 149, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#^ref-1f32c94a-103-0) (line 103, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L198](chroma-toolkit-consolidation-plan.md#^ref-5020e892-198-0) (line 198, col 0, score 1)
- [compiler-kit-foundations — L625](compiler-kit-foundations.md#^ref-01b21543-625-0) (line 625, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L202](cross-language-runtime-polymorphism.md#^ref-c34c36a6-202-0) (line 202, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L172](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-172-0) (line 172, col 0, score 1)
- [Duck's Attractor States — L83](ducks-attractor-states.md#^ref-13951643-83-0) (line 83, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L39](ducks-self-referential-perceptual-loop.md#^ref-71726f04-39-0) (line 39, col 0, score 1)
- [field-interaction-equations — L176](field-interaction-equations.md#^ref-b09141b7-176-0) (line 176, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L317](migrate-to-provider-tenant-architecture.md#^ref-54382370-317-0) (line 317, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#^ref-cf6b9b17-149-0) (line 149, col 0, score 1)
- [Diagrams — L21](chunks/diagrams.md#^ref-45cd25b5-21-0) (line 21, col 0, score 1)
- [Duck's Attractor States — L59](ducks-attractor-states.md#^ref-13951643-59-0) (line 59, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L41](ducks-self-referential-perceptual-loop.md#^ref-71726f04-41-0) (line 41, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L52](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-52-0) (line 52, col 0, score 1)
- [Smoke Resonance Visualizations — L76](smoke-resonance-visualizations.md#^ref-ac9d3ac5-76-0) (line 76, col 0, score 1)
- [Synchronicity Waves and Web — L84](synchronicity-waves-and-web.md#^ref-91295f3a-84-0) (line 84, col 0, score 1)
- [Unique Info Dump Index — L124](unique-info-dump-index.md#^ref-30ec3ba6-124-0) (line 124, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L45](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-45-0) (line 45, col 0, score 0.71)
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
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
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
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
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
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [plan-update-confirmation — L1022](plan-update-confirmation.md#^ref-b22d79c6-1022-0) (line 1022, col 0, score 1)
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
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Diagrams — L22](chunks/diagrams.md#^ref-45cd25b5-22-0) (line 22, col 0, score 1)
- [Shared — L21](chunks/shared.md#^ref-623a55f7-21-0) (line 21, col 0, score 1)
- [Duck's Attractor States — L60](ducks-attractor-states.md#^ref-13951643-60-0) (line 60, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L53](ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0) (line 53, col 0, score 1)
- [Event Bus Projections Architecture — L180](event-bus-projections-architecture.md#^ref-cf6b9b17-180-0) (line 180, col 0, score 1)
- [Reawakening Duck — L129](reawakening-duck.md#^ref-59b5670f-129-0) (line 129, col 0, score 1)
- [Recursive Prompt Construction Engine — L213](recursive-prompt-construction-engine.md#^ref-babdb9eb-213-0) (line 213, col 0, score 1)
- [Smoke Resonance Visualizations — L78](smoke-resonance-visualizations.md#^ref-ac9d3ac5-78-0) (line 78, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 1)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 1)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.7)
- [Universal Lisp Interface — L173](universal-lisp-interface.md#^ref-b01856b4-173-0) (line 173, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.65)
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
