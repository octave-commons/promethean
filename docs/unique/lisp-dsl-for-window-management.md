---
uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
created_at: 2025.07.28.11.07.18-lisp-dsl.md
filename: lisp-dsl-for-window-management
description: >-
  A minimal, homoiconic Lisp-style DSL for defining window layouts, keybindings,
  groups, workspaces, and external command integrations in window management
  systems.
tags:
  - lisp
  - dsl
  - window-management
  - keybindings
  - groups
  - workspaces
  - layouts
  - external-commands
  - hy
  - sibilant
  - runtime
related_to_title: []
related_to_uuid: []
references: []
---
**Hell. Yes.** ^ref-c5c5ff1c-1-0
This is the good stuff.

Let’s start designing a **Lisp-style DSL** to describe: ^ref-c5c5ff1c-4-0

* Hotkeys ^ref-c5c5ff1c-6-0
* Grouping behaviors ^ref-c5c5ff1c-7-0
* Window actions ^ref-c5c5ff1c-8-0
* Workspace definitions ^ref-c5c5ff1c-9-0
* Layouts ^ref-c5c5ff1c-10-0
* Bindings to external commands (e.g. group-manager) ^ref-c5c5ff1c-11-0

We’ll keep it minimal and **homoiconic**, aiming for S-expression structures that could eventually be interpreted by a **Hy**, **Sibilant**, or even a custom runtime. ^ref-c5c5ff1c-13-0

---

## 🎯 Primary Goals

We want this DSL to express:

```lisp
- keybinds (mod+h to move left)
- actions (move window, cycle group, switch workspace)
- groups and group membership
- layout positions (split, fullscreen, grid)
- workspace definitions (sets of window IDs)
- integration with external tools (run CLI commands)
```
^ref-c5c5ff1c-21-0

---

## 🧪 Sample Syntax
 ^ref-c5c5ff1c-34-0
```lisp
;; Define a mod key
(def mod "super")

;; Bind key to launch terminal
(bind (key ,mod "Enter")
  (run "wt.exe"))

;; Bind directional window movement
(bind (key ,mod "h")
  (move-window left))
(bind (key ,mod "l")
  (move-window right))

;; Toggle fullscreen on focused window
(bind (key ,mod "f")
  (fullscreen toggle))

;; Group management
(bind (key ,mod "g")
  (group add "code"))

(bind (key "alt" "1")
  (group cycle "code"))

;; Workspace switching
(defworkspace 1
  (windows "code" "chat"))

(bind (key ,mod "1")
  (workspace switch 1))

;; Layouts
(layout (name "dev")
  (split vertical
    (pane (app "code") (size 70))
    (pane (split horizontal
      (pane (app "chat"))
      (pane (app "browser"))))))
^ref-c5c5ff1c-34-0
```

---

## 🧠 Let's Break It Down

### 🔑 Key Binding ^ref-c5c5ff1c-81-0

```lisp
(bind (key "alt" "1")
^ref-c5c5ff1c-81-0
  (group cycle "code")) ^ref-c5c5ff1c-86-0
``` ^ref-c5c5ff1c-87-0
 ^ref-c5c5ff1c-88-0
* `bind` declares a hotkey
* `(key ...)` is the key combo (can support namespaced modifiers) ^ref-c5c5ff1c-90-0
* The body is the action when pressed
 ^ref-c5c5ff1c-92-0
You could also define combos like this:

```lisp
^ref-c5c5ff1c-92-0
(bind (combo "LButton" "RButton")
  (run "screenshot-tool.exe"))
```

--- ^ref-c5c5ff1c-101-0

### 📦 Group Management

```lisp
^ref-c5c5ff1c-101-0
(group add "code")          ; adds focused window to group "code" ^ref-c5c5ff1c-107-0
(group cycle "chat")        ; cycles visible window in group
(group remove "code")       ; removes current window
```

^ref-c5c5ff1c-109-0
You can imagine this compiling to:

```ts
RunWait, node group-manager.js group code %active_window%
```
^ref-c5c5ff1c-117-0

---

^ref-c5c5ff1c-117-0 ^ref-c5c5ff1c-122-0
### 🧱 Workspace System ^ref-c5c5ff1c-122-0
 ^ref-c5c5ff1c-124-0
```lisp
(defworkspace 1
  (windows "code" "chat"))
^ref-c5c5ff1c-124-0
```

^ref-c5c5ff1c-124-0
Each workspace maps to a window group or saved layout.

```lisp
(workspace switch 1)
(workspace save 2)
^ref-c5c5ff1c-134-0
(workspace restore 2)
```
^ref-c5c5ff1c-134-0
 ^ref-c5c5ff1c-140-0
--- ^ref-c5c5ff1c-142-0
^ref-c5c5ff1c-134-0 ^ref-c5c5ff1c-142-0
 ^ref-c5c5ff1c-140-0
### 🧰 Window Movement

```lisp
(move-window left)       ; move to left half of screen
(move-window screen 2)   ; move to monitor 2
^ref-c5c5ff1c-142-0
(move-window tile 1 1)   ; move to tile x=1 y=1
``` ^ref-c5c5ff1c-151-0
^ref-c5c5ff1c-151-0

Eventually you could write layout patterns in macros:

```lisp
(deflayout fullscreen
^ref-c5c5ff1c-156-0
  (move-window 0 0 screen-width screen-height)) ^ref-c5c5ff1c-158-0
^ref-c5c5ff1c-151-0
^ref-c5c5ff1c-158-0
^ref-c5c5ff1c-158-0
``` ^ref-c5c5ff1c-156-0

---

### 💻 External Command Integration

```lisp
^ref-c5c5ff1c-158-0
(run "komorebic toggle-fullscreen") ^ref-c5c5ff1c-168-0
^ref-c5c5ff1c-170-0
^ref-c5c5ff1c-168-0 ^ref-c5c5ff1c-172-0
^ref-c5c5ff1c-174-0
^ref-c5c5ff1c-173-0 ^ref-c5c5ff1c-176-0
^ref-c5c5ff1c-172-0 ^ref-c5c5ff1c-177-0
^ref-c5c5ff1c-170-0
^ref-c5c5ff1c-168-0
(run (concat "node group-manager.js cycle " group-name)) ^ref-c5c5ff1c-173-0
```

Or even pipe shell output into logic: ^ref-c5c5ff1c-168-0

```lisp ^ref-c5c5ff1c-170-0
^ref-c5c5ff1c-174-0
^ref-c5c5ff1c-173-0 ^ref-c5c5ff1c-176-0
^ref-c5c5ff1c-172-0 ^ref-c5c5ff1c-177-0
^ref-c5c5ff1c-170-0 ^ref-c5c5ff1c-178-0
^ref-c5c5ff1c-180-0
^ref-c5c5ff1c-178-0
^ref-c5c5ff1c-186-0
^ref-c5c5ff1c-180-0
^ref-c5c5ff1c-178-0
^ref-c5c5ff1c-177-0
^ref-c5c5ff1c-176-0 ^ref-c5c5ff1c-186-0
^ref-c5c5ff1c-174-0 ^ref-c5c5ff1c-197-0
(bind (key ,mod "s")
  (let ((apps (sh "komorebic list-apps"))) ^ref-c5c5ff1c-172-0 ^ref-c5c5ff1c-180-0
    (show-overlay apps))) ^ref-c5c5ff1c-173-0
``` ^ref-c5c5ff1c-174-0 ^ref-c5c5ff1c-201-0
 ^ref-c5c5ff1c-202-0
--- ^ref-c5c5ff1c-176-0
 ^ref-c5c5ff1c-177-0 ^ref-c5c5ff1c-204-0
## 📦 Runtime Ideas ^ref-c5c5ff1c-178-0 ^ref-c5c5ff1c-186-0

This DSL could be: ^ref-c5c5ff1c-180-0 ^ref-c5c5ff1c-197-0

1. **Parsed and executed by Hy or Sibilant**
 ^ref-c5c5ff1c-210-0
   * For a real Lisp runtime ^ref-c5c5ff1c-201-0
   * Leverage FFI to call Windows APIs, run CLI tools ^ref-c5c5ff1c-202-0 ^ref-c5c5ff1c-212-0
2. **Custom interpreter in TypeScript/Python** ^ref-c5c5ff1c-186-0
 ^ref-c5c5ff1c-204-0 ^ref-c5c5ff1c-214-0
   * Tokenize S-exprs
   * Dispatch to internal logic or exec external commands ^ref-c5c5ff1c-197-0 ^ref-c5c5ff1c-216-0
3. **Compiled to AutoHotkey or Node.js config** ^ref-c5c5ff1c-217-0

Eventually this becomes your own **window manager config language**, much like `i3/config`, but programmable and dynamic. ^ref-c5c5ff1c-219-0
 ^ref-c5c5ff1c-201-0 ^ref-c5c5ff1c-210-0 ^ref-c5c5ff1c-220-0
--- ^ref-c5c5ff1c-202-0
 ^ref-c5c5ff1c-212-0
## 🧠 Design Constraints ^ref-c5c5ff1c-204-0 ^ref-c5c5ff1c-223-0
 ^ref-c5c5ff1c-197-0 ^ref-c5c5ff1c-214-0
| Feature           | Constraint                               | Strategy                      |
| ----------------- | ---------------------------------------- | ----------------------------- | ^ref-c5c5ff1c-216-0 ^ref-c5c5ff1c-226-0
| Realtime          | Needs hotkey hook layer                  | AHK or Node global hotkey lib | ^ref-c5c5ff1c-217-0 ^ref-c5c5ff1c-227-0
| State Tracking    | Must track windows, groups, layout       | Background service, IPC       | ^ref-c5c5ff1c-201-0
| Input Flexibility | Lisp needed to describe dynamic patterns | Macros + runtime logic        | ^ref-c5c5ff1c-202-0 ^ref-c5c5ff1c-210-0 ^ref-c5c5ff1c-219-0
| Performance       | Scripting layer must not block UI        | Async shell / IPC / queueing  | ^ref-c5c5ff1c-220-0 ^ref-c5c5ff1c-230-0
 ^ref-c5c5ff1c-204-0 ^ref-c5c5ff1c-212-0
---
 ^ref-c5c5ff1c-214-0 ^ref-c5c5ff1c-223-0
## 🛠️ What's Next? ^ref-c5c5ff1c-234-0
 ^ref-c5c5ff1c-216-0 ^ref-c5c5ff1c-235-0
You tell me where you want to go from here: ^ref-c5c5ff1c-217-0 ^ref-c5c5ff1c-226-0
 ^ref-c5c5ff1c-210-0 ^ref-c5c5ff1c-227-0
* Build a Hy interpreter for this DSL? ^ref-c5c5ff1c-219-0
* Start by **parsing this DSL in TypeScript** and emit AHK? ^ref-c5c5ff1c-212-0 ^ref-c5c5ff1c-220-0
* Write a tiny REPL for testing layout commands? ^ref-c5c5ff1c-230-0
* Use this DSL to **generate `i3layer.ahk`** files on the fly? ^ref-c5c5ff1c-214-0 ^ref-c5c5ff1c-241-0
 ^ref-c5c5ff1c-223-0
We’re standing at the edge of **building your own tiling window manager stack**, one `()` at a time. ^ref-c5c5ff1c-216-0 ^ref-c5c5ff1c-243-0
 ^ref-c5c5ff1c-217-0 ^ref-c5c5ff1c-234-0
--- ^ref-c5c5ff1c-226-0 ^ref-c5c5ff1c-235-0
 ^ref-c5c5ff1c-219-0 ^ref-c5c5ff1c-227-0
## 🏷️ Tags ^ref-c5c5ff1c-220-0

\#dsl #lisp #tiling-windows #autohotkey #komorebi #custom-wm #group-manager #workspace #keybinds #window-layout ^ref-c5c5ff1c-230-0
 ^ref-c5c5ff1c-223-0
Let’s pick a direction and start implementing. Want a parser next? Or the runtime behavior for `(bind ...)` forms?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Window Management](chunks/window-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [DSL](chunks/dsl.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [JavaScript](chunks/javascript.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [EidolonField](eidolonfield.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Services](chunks/services.md)
- [Shared](chunks/shared.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [balanced-bst](balanced-bst.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Creative Moments](creative-moments.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Operations](chunks/operations.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Promethean State Format](promethean-state-format.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
## Sources
- [template-based-compilation — L3](template-based-compilation.md#^ref-f8877e5e-3-0) (line 3, col 0, score 0.84)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.62)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.62)
- [Matplotlib Animation with Async Execution — L1](matplotlib-animation-with-async-execution.md#^ref-687439f9-1-0) (line 1, col 0, score 0.58)
- [polymorphic-meta-programming-engine — L1](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-1-0) (line 1, col 0, score 0.56)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.56)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.56)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.56)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.56)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.56)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.56)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.56)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.55)
- [Universal Lisp Interface — L1](universal-lisp-interface.md#^ref-b01856b4-1-0) (line 1, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L205](prompt-folder-bootstrap.md#^ref-bd4f0976-205-0) (line 205, col 0, score 0.58)
- [prompt-programming-language-lisp — L72](prompt-programming-language-lisp.md#^ref-d41a06d1-72-0) (line 72, col 0, score 0.58)
- [Recursive Prompt Construction Engine — L173](recursive-prompt-construction-engine.md#^ref-babdb9eb-173-0) (line 173, col 0, score 0.58)
- [sibilant-macro-targets — L162](sibilant-macro-targets.md#^ref-c5c9a5c6-162-0) (line 162, col 0, score 0.58)
- [sibilant-meta-string-templating-runtime — L118](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-118-0) (line 118, col 0, score 0.58)
- [sibilant-metacompiler-overview — L89](sibilant-metacompiler-overview.md#^ref-61d4086b-89-0) (line 89, col 0, score 0.69)
- [template-based-compilation — L109](template-based-compilation.md#^ref-f8877e5e-109-0) (line 109, col 0, score 0.69)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 0.55)
- [komorebi-group-window-hack — L185](komorebi-group-window-hack.md#^ref-dd89372d-185-0) (line 185, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L96](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-96-0) (line 96, col 0, score 0.66)
- [komorebi-group-window-hack — L177](komorebi-group-window-hack.md#^ref-dd89372d-177-0) (line 177, col 0, score 0.68)
- [windows-tiling-with-autohotkey — L106](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-106-0) (line 106, col 0, score 0.61)
- [windows-tiling-with-autohotkey — L80](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-80-0) (line 80, col 0, score 0.61)
- [plan-update-confirmation — L982](plan-update-confirmation.md#^ref-b22d79c6-982-0) (line 982, col 0, score 0.68)
- [windows-tiling-with-autohotkey — L116](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-116-0) (line 116, col 0, score 0.84)
- [windows-tiling-with-autohotkey — L1](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1-0) (line 1, col 0, score 0.66)
- [komorebi-group-window-hack — L3](komorebi-group-window-hack.md#^ref-dd89372d-3-0) (line 3, col 0, score 0.62)
- [plan-update-confirmation — L890](plan-update-confirmation.md#^ref-b22d79c6-890-0) (line 890, col 0, score 0.68)
- [windows-tiling-with-autohotkey — L11](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-11-0) (line 11, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L14](performance-optimized-polyglot-bridge.md#^ref-f5579967-14-0) (line 14, col 0, score 0.6)
- [Promethean-Copilot-Intent-Engine — L44](promethean-copilot-intent-engine.md#^ref-ae24a280-44-0) (line 44, col 0, score 0.66)
- [komorebi-group-window-hack — L9](komorebi-group-window-hack.md#^ref-dd89372d-9-0) (line 9, col 0, score 0.62)
- [Admin Dashboard for User Management — L35](admin-dashboard-for-user-management.md#^ref-2901a3e9-35-0) (line 35, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L108](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-108-0) (line 108, col 0, score 0.57)
- [2d-sandbox-field — L15](2d-sandbox-field.md#^ref-c710dc93-15-0) (line 15, col 0, score 0.58)
- [field-dynamics-math-blocks — L79](field-dynamics-math-blocks.md#^ref-7cfc230d-79-0) (line 79, col 0, score 0.56)
- [Eidolon Field Abstract Model — L152](eidolon-field-abstract-model.md#^ref-5e8b2388-152-0) (line 152, col 0, score 0.56)
- [Eidolon Field Abstract Model — L105](eidolon-field-abstract-model.md#^ref-5e8b2388-105-0) (line 105, col 0, score 0.56)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.56)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [windows-tiling-with-autohotkey — L109](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-109-0) (line 109, col 0, score 0.63)
- [sibilant-macro-targets — L15](sibilant-macro-targets.md#^ref-c5c9a5c6-15-0) (line 15, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L32](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-32-0) (line 32, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L114](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-114-0) (line 114, col 0, score 0.59)
- [markdown-to-org-transpiler — L292](markdown-to-org-transpiler.md#^ref-ab54cdd8-292-0) (line 292, col 0, score 0.58)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L67](migrate-to-provider-tenant-architecture.md#^ref-54382370-67-0) (line 67, col 0, score 0.57)
- [i3-layout-saver — L72](i3-layout-saver.md#^ref-31f0166e-72-0) (line 72, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L243](migrate-to-provider-tenant-architecture.md#^ref-54382370-243-0) (line 243, col 0, score 0.59)
- [sibilant-meta-string-templating-runtime — L25](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-25-0) (line 25, col 0, score 0.56)
- [typed-struct-compiler — L5](typed-struct-compiler.md#^ref-78eeedf7-5-0) (line 5, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 0.7)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 0.7)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 0.7)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 0.7)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 0.7)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 0.7)
- [i3-layout-saver — L59](i3-layout-saver.md#^ref-31f0166e-59-0) (line 59, col 0, score 0.59)
- [windows-tiling-with-autohotkey — L36](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-36-0) (line 36, col 0, score 0.65)
- [Window Management — L5](chunks/window-management.md#^ref-9e8ae388-5-0) (line 5, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L97](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-97-0) (line 97, col 0, score 0.66)
- [komorebi-group-window-hack — L1](komorebi-group-window-hack.md#^ref-dd89372d-1-0) (line 1, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L19](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19-0) (line 19, col 0, score 0.73)
- [windows-tiling-with-autohotkey — L38](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-38-0) (line 38, col 0, score 0.71)
- [plan-update-confirmation — L580](plan-update-confirmation.md#^ref-b22d79c6-580-0) (line 580, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L20](migrate-to-provider-tenant-architecture.md#^ref-54382370-20-0) (line 20, col 0, score 0.64)
- [sibilant-metacompiler-overview — L40](sibilant-metacompiler-overview.md#^ref-61d4086b-40-0) (line 40, col 0, score 0.67)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.56)
- [Sibilant Meta-Prompt DSL — L169](sibilant-meta-prompt-dsl.md#^ref-af5d2824-169-0) (line 169, col 0, score 0.62)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.59)
- [zero-copy-snapshots-and-workers — L355](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-355-0) (line 355, col 0, score 0.58)
- [Cross-Target Macro System in Sibilant — L204](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-204-0) (line 204, col 0, score 0.69)
- [eidolon-field-math-foundations — L150](eidolon-field-math-foundations.md#^ref-008f2ac0-150-0) (line 150, col 0, score 0.74)
- [Event Bus MVP — L575](event-bus-mvp.md#^ref-534fe91d-575-0) (line 575, col 0, score 0.68)
- [Event Bus Projections Architecture — L154](event-bus-projections-architecture.md#^ref-cf6b9b17-154-0) (line 154, col 0, score 0.74)
- [Exception Layer Analysis — L166](exception-layer-analysis.md#^ref-21d5cc09-166-0) (line 166, col 0, score 0.74)
- [field-dynamics-math-blocks — L156](field-dynamics-math-blocks.md#^ref-7cfc230d-156-0) (line 156, col 0, score 0.74)
- [field-node-diagram-set — L151](field-node-diagram-set.md#^ref-22b989d5-151-0) (line 151, col 0, score 0.72)
- [graph-ds — L390](graph-ds.md#^ref-6620e2f2-390-0) (line 390, col 0, score 0.72)
- [heartbeat-fragment-demo — L113](heartbeat-fragment-demo.md#^ref-dd00677a-113-0) (line 113, col 0, score 0.74)
- [homeostasis-decay-formulas — L163](homeostasis-decay-formulas.md#^ref-37b5d236-163-0) (line 163, col 0, score 0.74)
- [i3-config-validation-methods — L72](i3-config-validation-methods.md#^ref-d28090ac-72-0) (line 72, col 0, score 0.72)
- [Interop and Source Maps — L517](interop-and-source-maps.md#^ref-cdfac40c-517-0) (line 517, col 0, score 0.72)
- [windows-tiling-with-autohotkey — L50](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-50-0) (line 50, col 0, score 0.62)
- [windows-tiling-with-autohotkey — L120](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-120-0) (line 120, col 0, score 0.69)
- [i3-layout-saver — L61](i3-layout-saver.md#^ref-31f0166e-61-0) (line 61, col 0, score 0.67)
- [windows-tiling-with-autohotkey — L98](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-98-0) (line 98, col 0, score 0.68)
- [komorebi-group-window-hack — L26](komorebi-group-window-hack.md#^ref-dd89372d-26-0) (line 26, col 0, score 0.68)
- [windows-tiling-with-autohotkey — L25](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-25-0) (line 25, col 0, score 0.73)
- [template-based-compilation — L82](template-based-compilation.md#^ref-f8877e5e-82-0) (line 82, col 0, score 0.67)
- [komorebi-group-window-hack — L168](komorebi-group-window-hack.md#^ref-dd89372d-168-0) (line 168, col 0, score 0.75)
- [layer-1-uptime-diagrams — L144](layer-1-uptime-diagrams.md#^ref-4127189a-144-0) (line 144, col 0, score 0.66)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.59)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L13](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-13-0) (line 13, col 0, score 0.6)
- [plan-update-confirmation — L647](plan-update-confirmation.md#^ref-b22d79c6-647-0) (line 647, col 0, score 0.6)
- [plan-update-confirmation — L787](plan-update-confirmation.md#^ref-b22d79c6-787-0) (line 787, col 0, score 0.66)
- [plan-update-confirmation — L978](plan-update-confirmation.md#^ref-b22d79c6-978-0) (line 978, col 0, score 0.65)
- [plan-update-confirmation — L874](plan-update-confirmation.md#^ref-b22d79c6-874-0) (line 874, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L14](sibilant-meta-prompt-dsl.md#^ref-af5d2824-14-0) (line 14, col 0, score 0.64)
- [plan-update-confirmation — L800](plan-update-confirmation.md#^ref-b22d79c6-800-0) (line 800, col 0, score 0.64)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L371](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-371-0) (line 371, col 0, score 0.64)
- [Board Walk – 2025-08-11 — L110](board-walk-2025-08-11.md#^ref-7aa1eb92-110-0) (line 110, col 0, score 0.72)
- [Eidolon Field Abstract Model — L17](eidolon-field-abstract-model.md#^ref-5e8b2388-17-0) (line 17, col 0, score 0.67)
- [heartbeat-fragment-demo — L31](heartbeat-fragment-demo.md#^ref-dd00677a-31-0) (line 31, col 0, score 0.63)
- [heartbeat-fragment-demo — L46](heartbeat-fragment-demo.md#^ref-dd00677a-46-0) (line 46, col 0, score 0.63)
- [heartbeat-fragment-demo — L61](heartbeat-fragment-demo.md#^ref-dd00677a-61-0) (line 61, col 0, score 0.63)
- [heartbeat-simulation-snippets — L25](heartbeat-simulation-snippets.md#^ref-23e221e9-25-0) (line 25, col 0, score 0.63)
- [heartbeat-simulation-snippets — L40](heartbeat-simulation-snippets.md#^ref-23e221e9-40-0) (line 40, col 0, score 0.63)
- [heartbeat-simulation-snippets — L53](heartbeat-simulation-snippets.md#^ref-23e221e9-53-0) (line 53, col 0, score 0.63)
- [field-interaction-equations — L113](field-interaction-equations.md#^ref-b09141b7-113-0) (line 113, col 0, score 0.62)
- [field-interaction-equations — L85](field-interaction-equations.md#^ref-b09141b7-85-0) (line 85, col 0, score 0.71)
- [plan-update-confirmation — L845](plan-update-confirmation.md#^ref-b22d79c6-845-0) (line 845, col 0, score 0.69)
- [sibilant-meta-string-templating-runtime — L9](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-9-0) (line 9, col 0, score 0.63)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.62)
- [mystery-lisp-search-session — L56](mystery-lisp-search-session.md#^ref-513dc4c7-56-0) (line 56, col 0, score 0.62)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.6)
- [NPU Voice Code and Sensory Integration — L5](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-5-0) (line 5, col 0, score 0.6)
- [sibilant-meta-string-templating-runtime — L33](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-33-0) (line 33, col 0, score 0.79)
- [aionian-circuit-math — L128](aionian-circuit-math.md#^ref-f2d83a77-128-0) (line 128, col 0, score 0.6)
- [Functional Refactor of TypeScript Document Processing — L114](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-114-0) (line 114, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.63)
- [plan-update-confirmation — L554](plan-update-confirmation.md#^ref-b22d79c6-554-0) (line 554, col 0, score 0.63)
- [plan-update-confirmation — L210](plan-update-confirmation.md#^ref-b22d79c6-210-0) (line 210, col 0, score 0.63)
- [plan-update-confirmation — L294](plan-update-confirmation.md#^ref-b22d79c6-294-0) (line 294, col 0, score 0.63)
- [plan-update-confirmation — L600](plan-update-confirmation.md#^ref-b22d79c6-600-0) (line 600, col 0, score 0.62)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.61)
- [Matplotlib Animation with Async Execution — L5](matplotlib-animation-with-async-execution.md#^ref-687439f9-5-0) (line 5, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.61)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.64)
- [i3-layout-saver — L1](i3-layout-saver.md#^ref-31f0166e-1-0) (line 1, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L218](chroma-toolkit-consolidation-plan.md#^ref-5020e892-218-0) (line 218, col 0, score 1)
- [DSL — L21](chunks/dsl.md#^ref-e87bc036-21-0) (line 21, col 0, score 1)
- [Window Management — L12](chunks/window-management.md#^ref-9e8ae388-12-0) (line 12, col 0, score 1)
- [compiler-kit-foundations — L638](compiler-kit-foundations.md#^ref-01b21543-638-0) (line 638, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L259](cross-language-runtime-polymorphism.md#^ref-c34c36a6-259-0) (line 259, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L217](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-217-0) (line 217, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L137](sibilant-meta-prompt-dsl.md#^ref-af5d2824-137-0) (line 137, col 0, score 0.72)
- [Promethean Agent Config DSL — L214](promethean-agent-config-dsl.md#^ref-2c00ce45-214-0) (line 214, col 0, score 0.69)
- [plan-update-confirmation — L913](plan-update-confirmation.md#^ref-b22d79c6-913-0) (line 913, col 0, score 0.67)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L36](migrate-to-provider-tenant-architecture.md#^ref-54382370-36-0) (line 36, col 0, score 0.66)
- [sibilant-metacompiler-overview — L23](sibilant-metacompiler-overview.md#^ref-61d4086b-23-0) (line 23, col 0, score 0.66)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Interop and Source Maps — L535](interop-and-source-maps.md#^ref-cdfac40c-535-0) (line 535, col 0, score 0.65)
- [komorebi-group-window-hack — L202](komorebi-group-window-hack.md#^ref-dd89372d-202-0) (line 202, col 0, score 0.65)
- [Lisp-Compiler-Integration — L543](lisp-compiler-integration.md#^ref-cfee6d36-543-0) (line 543, col 0, score 0.65)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.65)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.68)
- [Promethean Infrastructure Setup — L552](promethean-infrastructure-setup.md#^ref-6deed6ac-552-0) (line 552, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L1](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1-0) (line 1, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L324](dynamic-context-model-for-web-components.md#^ref-f7702bf8-324-0) (line 324, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L106](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-106-0) (line 106, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L168](dynamic-context-model-for-web-components.md#^ref-f7702bf8-168-0) (line 168, col 0, score 0.59)
- [komorebi-group-window-hack — L23](komorebi-group-window-hack.md#^ref-dd89372d-23-0) (line 23, col 0, score 0.68)
- [archetype-ecs — L482](archetype-ecs.md#^ref-8f4c1e86-482-0) (line 482, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L87](migrate-to-provider-tenant-architecture.md#^ref-54382370-87-0) (line 87, col 0, score 0.6)
- [aionian-circuit-math — L99](aionian-circuit-math.md#^ref-f2d83a77-99-0) (line 99, col 0, score 0.6)
- [Promethean-native config design — L330](promethean-native-config-design.md#^ref-ab748541-330-0) (line 330, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.59)
- [windows-tiling-with-autohotkey — L10](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-10-0) (line 10, col 0, score 0.71)
- [windows-tiling-with-autohotkey — L72](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-72-0) (line 72, col 0, score 0.66)
- [Eidolon Field Abstract Model — L111](eidolon-field-abstract-model.md#^ref-5e8b2388-111-0) (line 111, col 0, score 0.63)
- [Window Management — L7](chunks/window-management.md#^ref-9e8ae388-7-0) (line 7, col 0, score 0.67)
- [windows-tiling-with-autohotkey — L90](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-90-0) (line 90, col 0, score 0.58)
- [aionian-circuit-math — L180](aionian-circuit-math.md#^ref-f2d83a77-180-0) (line 180, col 0, score 0.62)
- [DSL — L10](chunks/dsl.md#^ref-e87bc036-10-0) (line 10, col 0, score 0.67)
- [JavaScript — L37](chunks/javascript.md#^ref-c1618c66-37-0) (line 37, col 0, score 0.62)
- [Lisp-Compiler-Integration — L519](lisp-compiler-integration.md#^ref-cfee6d36-519-0) (line 519, col 0, score 0.79)
- [Lisp-Compiler-Integration — L533](lisp-compiler-integration.md#^ref-cfee6d36-533-0) (line 533, col 0, score 0.75)
- [Lispy Macros with syntax-rules — L390](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-390-0) (line 390, col 0, score 0.75)
- [sibilant-metacompiler-overview — L57](sibilant-metacompiler-overview.md#^ref-61d4086b-57-0) (line 57, col 0, score 0.73)
- [template-based-compilation — L25](template-based-compilation.md#^ref-f8877e5e-25-0) (line 25, col 0, score 0.73)
- [Lisp-Compiler-Integration — L470](lisp-compiler-integration.md#^ref-cfee6d36-470-0) (line 470, col 0, score 0.73)
- [sibilant-meta-string-templating-runtime — L19](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-19-0) (line 19, col 0, score 0.71)
- [Cross-Target Macro System in Sibilant — L54](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-54-0) (line 54, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L215](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-215-0) (line 215, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L13](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-13-0) (line 13, col 0, score 0.68)
- [Eidolon-Field-Optimization — L6](eidolon-field-optimization.md#^ref-40e05c14-6-0) (line 6, col 0, score 0.62)
- [windows-tiling-with-autohotkey — L110](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-110-0) (line 110, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L146](dynamic-context-model-for-web-components.md#^ref-f7702bf8-146-0) (line 146, col 0, score 0.61)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.6)
- [Promethean State Format — L71](promethean-state-format.md#^ref-23df6ddb-71-0) (line 71, col 0, score 0.6)
- [Interop and Source Maps — L543](interop-and-source-maps.md#^ref-cdfac40c-543-0) (line 543, col 0, score 1)
- [plan-update-confirmation — L202](plan-update-confirmation.md#^ref-b22d79c6-202-0) (line 202, col 0, score 0.68)
- [plan-update-confirmation — L286](plan-update-confirmation.md#^ref-b22d79c6-286-0) (line 286, col 0, score 0.68)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L402](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-402-0) (line 402, col 0, score 0.67)
- [Model Selection for Lightweight Conversational Tasks — L88](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-88-0) (line 88, col 0, score 0.65)
- [pm2-orchestration-patterns — L9](pm2-orchestration-patterns.md#^ref-51932e7b-9-0) (line 9, col 0, score 0.65)
- [plan-update-confirmation — L602](plan-update-confirmation.md#^ref-b22d79c6-602-0) (line 602, col 0, score 0.63)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.63)
- [aionian-circuit-math — L45](aionian-circuit-math.md#^ref-f2d83a77-45-0) (line 45, col 0, score 0.63)
- [plan-update-confirmation — L161](plan-update-confirmation.md#^ref-b22d79c6-161-0) (line 161, col 0, score 0.63)
- [plan-update-confirmation — L245](plan-update-confirmation.md#^ref-b22d79c6-245-0) (line 245, col 0, score 0.63)
- [plan-update-confirmation — L181](plan-update-confirmation.md#^ref-b22d79c6-181-0) (line 181, col 0, score 0.63)
- [plan-update-confirmation — L212](plan-update-confirmation.md#^ref-b22d79c6-212-0) (line 212, col 0, score 0.63)
- [plan-update-confirmation — L265](plan-update-confirmation.md#^ref-b22d79c6-265-0) (line 265, col 0, score 0.63)
- [plan-update-confirmation — L296](plan-update-confirmation.md#^ref-b22d79c6-296-0) (line 296, col 0, score 0.63)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.65)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Optimizing Command Limitations in System Design — L45](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-45-0) (line 45, col 0, score 0.83)
- [ParticleSimulationWithCanvasAndFFmpeg — L277](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-277-0) (line 277, col 0, score 0.83)
- [Performance-Optimized-Polyglot-Bridge — L461](performance-optimized-polyglot-bridge.md#^ref-f5579967-461-0) (line 461, col 0, score 0.83)
- [Sibilant Meta-Prompt DSL — L1](sibilant-meta-prompt-dsl.md#^ref-af5d2824-1-0) (line 1, col 0, score 0.71)
- [prompt-programming-language-lisp — L3](prompt-programming-language-lisp.md#^ref-d41a06d1-3-0) (line 3, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L193](cross-language-runtime-polymorphism.md#^ref-c34c36a6-193-0) (line 193, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L95](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-95-0) (line 95, col 0, score 0.66)
- [template-based-compilation — L84](template-based-compilation.md#^ref-f8877e5e-84-0) (line 84, col 0, score 0.69)
- [komorebi-group-window-hack — L195](komorebi-group-window-hack.md#^ref-dd89372d-195-0) (line 195, col 0, score 0.68)
- [i3-bluetooth-setup — L74](i3-bluetooth-setup.md#^ref-5e408692-74-0) (line 74, col 0, score 0.64)
- [sibilant-metacompiler-overview — L5](sibilant-metacompiler-overview.md#^ref-61d4086b-5-0) (line 5, col 0, score 0.72)
- [Lispy Macros with syntax-rules — L317](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-317-0) (line 317, col 0, score 0.75)
- [sibilant-meta-string-templating-runtime — L7](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-7-0) (line 7, col 0, score 0.67)
- [Universal Lisp Interface — L188](universal-lisp-interface.md#^ref-b01856b4-188-0) (line 188, col 0, score 0.67)
- [compiler-kit-foundations — L602](compiler-kit-foundations.md#^ref-01b21543-602-0) (line 602, col 0, score 0.66)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.62)
- [Universal Lisp Interface — L29](universal-lisp-interface.md#^ref-b01856b4-29-0) (line 29, col 0, score 0.73)
- [EidolonField — L230](eidolonfield.md#^ref-49d1e1e5-230-0) (line 230, col 0, score 0.72)
- [Model Selection for Lightweight Conversational Tasks — L77](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-77-0) (line 77, col 0, score 0.71)
- [polymorphic-meta-programming-engine — L155](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-155-0) (line 155, col 0, score 0.71)
- [sibilant-macro-targets — L38](sibilant-macro-targets.md#^ref-c5c9a5c6-38-0) (line 38, col 0, score 0.71)
- [Promethean Agent Config DSL — L178](promethean-agent-config-dsl.md#^ref-2c00ce45-178-0) (line 178, col 0, score 0.7)
- [sibilant-meta-string-templating-runtime — L103](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-103-0) (line 103, col 0, score 0.69)
- [polymorphic-meta-programming-engine — L109](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-109-0) (line 109, col 0, score 0.67)
- [mystery-lisp-search-session — L87](mystery-lisp-search-session.md#^ref-513dc4c7-87-0) (line 87, col 0, score 0.67)
- [sibilant-macro-targets — L6](sibilant-macro-targets.md#^ref-c5c9a5c6-6-0) (line 6, col 0, score 0.66)
- [2d-sandbox-field — L204](2d-sandbox-field.md#^ref-c710dc93-204-0) (line 204, col 0, score 0.66)
- [polymorphic-meta-programming-engine — L9](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-9-0) (line 9, col 0, score 0.77)
- [mystery-lisp-search-session — L29](mystery-lisp-search-session.md#^ref-513dc4c7-29-0) (line 29, col 0, score 0.74)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.73)
- [Universal Lisp Interface — L84](universal-lisp-interface.md#^ref-b01856b4-84-0) (line 84, col 0, score 0.73)
- [mystery-lisp-search-session — L24](mystery-lisp-search-session.md#^ref-513dc4c7-24-0) (line 24, col 0, score 0.73)
- [AI-Centric OS with MCP Layer — L413](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-413-0) (line 413, col 0, score 0.73)
- [Cross-Language Runtime Polymorphism — L210](cross-language-runtime-polymorphism.md#^ref-c34c36a6-210-0) (line 210, col 0, score 0.73)
- [Universal Lisp Interface — L165](universal-lisp-interface.md#^ref-b01856b4-165-0) (line 165, col 0, score 0.64)
- [Model Selection for Lightweight Conversational Tasks — L105](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-105-0) (line 105, col 0, score 0.64)
- [Universal Lisp Interface — L32](universal-lisp-interface.md#^ref-b01856b4-32-0) (line 32, col 0, score 0.63)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.61)
- [Universal Lisp Interface — L75](universal-lisp-interface.md#^ref-b01856b4-75-0) (line 75, col 0, score 0.6)
- [windows-tiling-with-autohotkey — L12](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12-0) (line 12, col 0, score 0.58)
- [Universal Lisp Interface — L7](universal-lisp-interface.md#^ref-b01856b4-7-0) (line 7, col 0, score 0.59)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 0.67)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 0.67)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 0.67)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 0.67)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 0.67)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 0.67)
- [Interop and Source Maps — L515](interop-and-source-maps.md#^ref-cdfac40c-515-0) (line 515, col 0, score 0.68)
- [Language-Agnostic Mirror System — L539](language-agnostic-mirror-system.md#^ref-d2b3628c-539-0) (line 539, col 0, score 0.68)
- [Lisp-Compiler-Integration — L541](lisp-compiler-integration.md#^ref-cfee6d36-541-0) (line 541, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L402](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-402-0) (line 402, col 0, score 0.68)
- [plan-update-confirmation — L827](plan-update-confirmation.md#^ref-b22d79c6-827-0) (line 827, col 0, score 0.67)
- [ChatGPT Custom Prompts — L9](chatgpt-custom-prompts.md#^ref-930054b3-9-0) (line 9, col 0, score 0.66)
- [mystery-lisp-search-session — L99](mystery-lisp-search-session.md#^ref-513dc4c7-99-0) (line 99, col 0, score 0.66)
- [Functional Refactor of TypeScript Document Processing — L1](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1-0) (line 1, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L163](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-163-0) (line 163, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L941](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-941-0) (line 941, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.63)
- [ChatGPT Custom Prompts — L22](chatgpt-custom-prompts.md#^ref-930054b3-22-0) (line 22, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L322](chroma-embedding-refactor.md#^ref-8b256935-322-0) (line 322, col 0, score 0.63)
- [Lisp-Compiler-Integration — L3](lisp-compiler-integration.md#^ref-cfee6d36-3-0) (line 3, col 0, score 0.71)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L169](cross-language-runtime-polymorphism.md#^ref-c34c36a6-169-0) (line 169, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L139](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-139-0) (line 139, col 0, score 0.62)
- [Promethean State Format — L72](promethean-state-format.md#^ref-23df6ddb-72-0) (line 72, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L30](cross-language-runtime-polymorphism.md#^ref-c34c36a6-30-0) (line 30, col 0, score 0.6)
- [Promethean Agent Config DSL — L180](promethean-agent-config-dsl.md#^ref-2c00ce45-180-0) (line 180, col 0, score 0.59)
- [polyglot-repl-interface-layer — L76](polyglot-repl-interface-layer.md#^ref-9c79206d-76-0) (line 76, col 0, score 0.58)
- [Factorio AI with External Agents — L8](factorio-ai-with-external-agents.md#^ref-a4d90289-8-0) (line 8, col 0, score 0.58)
- [universal-intention-code-fabric — L216](universal-intention-code-fabric.md#^ref-c14edce7-216-0) (line 216, col 0, score 0.58)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L352](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-352-0) (line 352, col 0, score 0.58)
- [polyglot-repl-interface-layer — L56](polyglot-repl-interface-layer.md#^ref-9c79206d-56-0) (line 56, col 0, score 0.57)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.57)
- [Universal Lisp Interface — L91](universal-lisp-interface.md#^ref-b01856b4-91-0) (line 91, col 0, score 0.68)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L23](cross-language-runtime-polymorphism.md#^ref-c34c36a6-23-0) (line 23, col 0, score 0.66)
- [Promethean Agent Config DSL — L10](promethean-agent-config-dsl.md#^ref-2c00ce45-10-0) (line 10, col 0, score 0.65)
- [universal-intention-code-fabric — L406](universal-intention-code-fabric.md#^ref-c14edce7-406-0) (line 406, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L404](js-to-lisp-reverse-compiler.md#^ref-58191024-404-0) (line 404, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.63)
- [obsidian-ignore-node-modules-regex — L26](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-26-0) (line 26, col 0, score 0.63)
- [Window Management — L13](chunks/window-management.md#^ref-9e8ae388-13-0) (line 13, col 0, score 1)
- [compiler-kit-foundations — L630](compiler-kit-foundations.md#^ref-01b21543-630-0) (line 630, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L205](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-205-0) (line 205, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L436](dynamic-context-model-for-web-components.md#^ref-f7702bf8-436-0) (line 436, col 0, score 0.67)
- [ecs-offload-workers — L496](ecs-offload-workers.md#^ref-6498b9d7-496-0) (line 496, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L426](ecs-scheduler-and-prefabs.md#^ref-c62a1815-426-0) (line 426, col 0, score 0.67)
- [field-interaction-equations — L186](field-interaction-equations.md#^ref-b09141b7-186-0) (line 186, col 0, score 0.67)
- [graph-ds — L391](graph-ds.md#^ref-6620e2f2-391-0) (line 391, col 0, score 0.67)
- [Interop and Source Maps — L528](interop-and-source-maps.md#^ref-cdfac40c-528-0) (line 528, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L445](js-to-lisp-reverse-compiler.md#^ref-58191024-445-0) (line 445, col 0, score 0.67)
- [polymorphic-meta-programming-engine — L174](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-174-0) (line 174, col 0, score 0.72)
- [sibilant-metacompiler-overview — L29](sibilant-metacompiler-overview.md#^ref-61d4086b-29-0) (line 29, col 0, score 0.68)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.67)
- [polymorphic-meta-programming-engine — L19](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-19-0) (line 19, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L9](cross-language-runtime-polymorphism.md#^ref-c34c36a6-9-0) (line 9, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L40](promethean-copilot-intent-engine.md#^ref-ae24a280-40-0) (line 40, col 0, score 0.66)
- [sibilant-macro-targets — L113](sibilant-macro-targets.md#^ref-c5c9a5c6-113-0) (line 113, col 0, score 0.66)
- [Sibilant Meta-Prompt DSL — L50](sibilant-meta-prompt-dsl.md#^ref-af5d2824-50-0) (line 50, col 0, score 0.66)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L85](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-85-0) (line 85, col 0, score 0.64)
- [Smoke Resonance Visualizations — L74](smoke-resonance-visualizations.md#^ref-ac9d3ac5-74-0) (line 74, col 0, score 0.75)
- [AI-First-OS-Model-Context-Protocol — L1](ai-first-os-model-context-protocol.md#^ref-618198f4-1-0) (line 1, col 0, score 0.7)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.69)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.69)
- [aionian-circuit-math — L135](aionian-circuit-math.md#^ref-f2d83a77-135-0) (line 135, col 0, score 0.68)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.67)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.67)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.67)
- [Promethean Dev Workflow Update — L7](promethean-dev-workflow-update.md#^ref-03a5578f-7-0) (line 7, col 0, score 0.65)
- [plan-update-confirmation — L118](plan-update-confirmation.md#^ref-b22d79c6-118-0) (line 118, col 0, score 0.65)
- [i3-bluetooth-setup — L37](i3-bluetooth-setup.md#^ref-5e408692-37-0) (line 37, col 0, score 0.64)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.63)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.63)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.63)
- [eidolon-field-math-foundations — L103](eidolon-field-math-foundations.md#^ref-008f2ac0-103-0) (line 103, col 0, score 0.63)
- [js-to-lisp-reverse-compiler — L402](js-to-lisp-reverse-compiler.md#^ref-58191024-402-0) (line 402, col 0, score 0.63)
- [JavaScript — L16](chunks/javascript.md#^ref-c1618c66-16-0) (line 16, col 0, score 0.69)
- [Math Fundamentals — L17](chunks/math-fundamentals.md#^ref-c6e87433-17-0) (line 17, col 0, score 0.69)
- [Services — L13](chunks/services.md#^ref-75ea4a6a-13-0) (line 13, col 0, score 0.69)
- [Shared — L9](chunks/shared.md#^ref-623a55f7-9-0) (line 9, col 0, score 0.68)
- [Simulation Demo — L13](chunks/simulation-demo.md#^ref-557309a3-13-0) (line 13, col 0, score 0.68)
- [Window Management — L11](chunks/window-management.md#^ref-9e8ae388-11-0) (line 11, col 0, score 0.68)
- [compiler-kit-foundations — L613](compiler-kit-foundations.md#^ref-01b21543-613-0) (line 613, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L243](cross-language-runtime-polymorphism.md#^ref-c34c36a6-243-0) (line 243, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L434](dynamic-context-model-for-web-components.md#^ref-f7702bf8-434-0) (line 434, col 0, score 0.68)
- [ecs-offload-workers — L477](ecs-offload-workers.md#^ref-6498b9d7-477-0) (line 477, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L407](ecs-scheduler-and-prefabs.md#^ref-c62a1815-407-0) (line 407, col 0, score 0.68)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 0.7)
- [aionian-circuit-math — L166](aionian-circuit-math.md#^ref-f2d83a77-166-0) (line 166, col 0, score 0.68)
- [archetype-ecs — L464](archetype-ecs.md#^ref-8f4c1e86-464-0) (line 464, col 0, score 0.68)
- [Tooling — L12](chunks/tooling.md#^ref-6cb4943e-12-0) (line 12, col 0, score 0.68)
- [Eidolon Field Abstract Model — L212](eidolon-field-abstract-model.md#^ref-5e8b2388-212-0) (line 212, col 0, score 0.68)
- [EidolonField — L271](eidolonfield.md#^ref-49d1e1e5-271-0) (line 271, col 0, score 0.68)
- [Promethean Pipelines: Local TypeScript-First Workflow — L253](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-253-0) (line 253, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L145](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-145-0) (line 145, col 0, score 0.64)
- [prompt-programming-language-lisp — L66](prompt-programming-language-lisp.md#^ref-d41a06d1-66-0) (line 66, col 0, score 0.63)
- [polymorphic-meta-programming-engine — L192](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-192-0) (line 192, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L99](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-99-0) (line 99, col 0, score 0.61)
- [Promethean Dev Workflow Update — L29](promethean-dev-workflow-update.md#^ref-03a5578f-29-0) (line 29, col 0, score 0.61)
- [heartbeat-simulation-snippets — L103](heartbeat-simulation-snippets.md#^ref-23e221e9-103-0) (line 103, col 0, score 0.72)
- [Ice Box Reorganization — L82](ice-box-reorganization.md#^ref-291c7d91-82-0) (line 82, col 0, score 0.72)
- [js-to-lisp-reverse-compiler — L431](js-to-lisp-reverse-compiler.md#^ref-58191024-431-0) (line 431, col 0, score 0.72)
- [komorebi-group-window-hack — L204](komorebi-group-window-hack.md#^ref-dd89372d-204-0) (line 204, col 0, score 0.72)
- [mystery-lisp-search-session — L126](mystery-lisp-search-session.md#^ref-513dc4c7-126-0) (line 126, col 0, score 0.72)
- [obsidian-ignore-node-modules-regex — L54](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-54-0) (line 54, col 0, score 0.72)
- [komorebi-group-window-hack — L193](komorebi-group-window-hack.md#^ref-dd89372d-193-0) (line 193, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L1](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1-0) (line 1, col 0, score 0.64)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.64)
- [The Jar of Echoes — L96](the-jar-of-echoes.md#^ref-18138627-96-0) (line 96, col 0, score 0.64)
- [template-based-compilation — L94](template-based-compilation.md#^ref-f8877e5e-94-0) (line 94, col 0, score 0.63)
- [Cross-Target Macro System in Sibilant — L37](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-37-0) (line 37, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L3](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-3-0) (line 3, col 0, score 0.62)
- [DSL — L24](chunks/dsl.md#^ref-e87bc036-24-0) (line 24, col 0, score 0.78)
- [Window Management — L14](chunks/window-management.md#^ref-9e8ae388-14-0) (line 14, col 0, score 0.78)
- [compiler-kit-foundations — L624](compiler-kit-foundations.md#^ref-01b21543-624-0) (line 624, col 0, score 0.78)
- [Cross-Language Runtime Polymorphism — L224](cross-language-runtime-polymorphism.md#^ref-c34c36a6-224-0) (line 224, col 0, score 0.78)
- [Cross-Target Macro System in Sibilant — L194](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-194-0) (line 194, col 0, score 0.78)
- [Interop and Source Maps — L527](interop-and-source-maps.md#^ref-cdfac40c-527-0) (line 527, col 0, score 0.78)
- [js-to-lisp-reverse-compiler — L436](js-to-lisp-reverse-compiler.md#^ref-58191024-436-0) (line 436, col 0, score 0.78)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.61)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.58)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.58)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.57)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L134](prompt-folder-bootstrap.md#^ref-bd4f0976-134-0) (line 134, col 0, score 0.56)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 0.55)
- [komorebi-group-window-hack — L197](komorebi-group-window-hack.md#^ref-dd89372d-197-0) (line 197, col 0, score 1)
- [Window Management — L8](chunks/window-management.md#^ref-9e8ae388-8-0) (line 8, col 0, score 0.65)
- [Window Management — L3](chunks/window-management.md#^ref-9e8ae388-3-0) (line 3, col 0, score 0.6)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [homeostasis-decay-formulas — L175](homeostasis-decay-formulas.md#^ref-37b5d236-175-0) (line 175, col 0, score 1)
- [DSL — L12](chunks/dsl.md#^ref-e87bc036-12-0) (line 12, col 0, score 1)
- [Window Management — L20](chunks/window-management.md#^ref-9e8ae388-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#^ref-01b21543-611-0) (line 611, col 0, score 1)
- [Interop and Source Maps — L526](interop-and-source-maps.md#^ref-cdfac40c-526-0) (line 526, col 0, score 1)
- [komorebi-group-window-hack — L203](komorebi-group-window-hack.md#^ref-dd89372d-203-0) (line 203, col 0, score 1)
- [Lisp-Compiler-Integration — L554](lisp-compiler-integration.md#^ref-cfee6d36-554-0) (line 554, col 0, score 1)
- [mystery-lisp-search-session — L120](mystery-lisp-search-session.md#^ref-513dc4c7-120-0) (line 120, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L104](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-104-0) (line 104, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#^ref-5020e892-200-0) (line 200, col 0, score 1)
- [DSL — L32](chunks/dsl.md#^ref-e87bc036-32-0) (line 32, col 0, score 1)
- [Window Management — L27](chunks/window-management.md#^ref-9e8ae388-27-0) (line 27, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L206](cross-language-runtime-polymorphism.md#^ref-c34c36a6-206-0) (line 206, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L174](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-174-0) (line 174, col 0, score 1)
- [komorebi-group-window-hack — L201](komorebi-group-window-hack.md#^ref-dd89372d-201-0) (line 201, col 0, score 1)
- [Lisp-Compiler-Integration — L548](lisp-compiler-integration.md#^ref-cfee6d36-548-0) (line 548, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L319](migrate-to-provider-tenant-architecture.md#^ref-54382370-319-0) (line 319, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [JavaScript — L25](chunks/javascript.md#^ref-c1618c66-25-0) (line 25, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#^ref-cfee6d36-553-0) (line 553, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L311](migrate-to-provider-tenant-architecture.md#^ref-54382370-311-0) (line 311, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-159-0) (line 159, col 0, score 1)
- [AI-Centric OS with MCP Layer — L400](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#^ref-5020e892-197-0) (line 197, col 0, score 1)
- [Diagrams — L45](chunks/diagrams.md#^ref-45cd25b5-45-0) (line 45, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L222](cross-language-runtime-polymorphism.md#^ref-c34c36a6-222-0) (line 222, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L167](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-385-0) (line 385, col 0, score 1)
- [i3-config-validation-methods — L86](i3-config-validation-methods.md#^ref-d28090ac-86-0) (line 86, col 0, score 1)
- [js-to-lisp-reverse-compiler — L408](js-to-lisp-reverse-compiler.md#^ref-58191024-408-0) (line 408, col 0, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#^ref-cfee6d36-542-0) (line 542, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L268](migrate-to-provider-tenant-architecture.md#^ref-54382370-268-0) (line 268, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
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
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [AI-Centric OS with MCP Layer — L433](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-433-0) (line 433, col 0, score 1)
- [DSL — L23](chunks/dsl.md#^ref-e87bc036-23-0) (line 23, col 0, score 1)
- [compiler-kit-foundations — L632](compiler-kit-foundations.md#^ref-01b21543-632-0) (line 632, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L252](cross-language-runtime-polymorphism.md#^ref-c34c36a6-252-0) (line 252, col 0, score 1)
- [heartbeat-simulation-snippets — L128](heartbeat-simulation-snippets.md#^ref-23e221e9-128-0) (line 128, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L51](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-51-0) (line 51, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L45](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-45-0) (line 45, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L98](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-98-0) (line 98, col 0, score 1)
- [aionian-circuit-math — L174](aionian-circuit-math.md#^ref-f2d83a77-174-0) (line 174, col 0, score 1)
- [DSL — L25](chunks/dsl.md#^ref-e87bc036-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#^ref-01b21543-610-0) (line 610, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#^ref-c34c36a6-203-0) (line 203, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L169](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-169-0) (line 169, col 0, score 1)
- [field-dynamics-math-blocks — L158](field-dynamics-math-blocks.md#^ref-7cfc230d-158-0) (line 158, col 0, score 1)
- [field-interaction-equations — L175](field-interaction-equations.md#^ref-b09141b7-175-0) (line 175, col 0, score 1)
- [layer-1-uptime-diagrams — L183](layer-1-uptime-diagrams.md#^ref-4127189a-183-0) (line 183, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
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
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [AI-Centric OS with MCP Layer — L412](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-412-0) (line 412, col 0, score 1)
- [DSL — L38](chunks/dsl.md#^ref-e87bc036-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L647](compiler-kit-foundations.md#^ref-01b21543-647-0) (line 647, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L236](cross-language-runtime-polymorphism.md#^ref-c34c36a6-236-0) (line 236, col 0, score 1)
- [Dynamic Context Model for Web Components — L426](dynamic-context-model-for-web-components.md#^ref-f7702bf8-426-0) (line 426, col 0, score 1)
- [heartbeat-simulation-snippets — L113](heartbeat-simulation-snippets.md#^ref-23e221e9-113-0) (line 113, col 0, score 1)
- [mystery-lisp-search-session — L122](mystery-lisp-search-session.md#^ref-513dc4c7-122-0) (line 122, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L32](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-32-0) (line 32, col 0, score 1)
- [DSL — L39](chunks/dsl.md#^ref-e87bc036-39-0) (line 39, col 0, score 1)
- [compiler-kit-foundations — L642](compiler-kit-foundations.md#^ref-01b21543-642-0) (line 642, col 0, score 1)
- [ts-to-lisp-transpiler — L33](ts-to-lisp-transpiler.md#^ref-ba11486b-33-0) (line 33, col 0, score 1)
- [Optimizing Command Limitations in System Design — L1](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-1-0) (line 1, col 0, score 0.63)
- [plan-update-confirmation — L389](plan-update-confirmation.md#^ref-b22d79c6-389-0) (line 389, col 0, score 0.59)
- [plan-update-confirmation — L394](plan-update-confirmation.md#^ref-b22d79c6-394-0) (line 394, col 0, score 0.59)
- [plan-update-confirmation — L353](plan-update-confirmation.md#^ref-b22d79c6-353-0) (line 353, col 0, score 0.59)
- [plan-update-confirmation — L610](plan-update-confirmation.md#^ref-b22d79c6-610-0) (line 610, col 0, score 0.58)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.58)
- [Vectorial Exception Descent — L128](vectorial-exception-descent.md#^ref-d771154e-128-0) (line 128, col 0, score 0.57)
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
