---
uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
created_at: 202508071111.md
filename: pm2-orchestration-patterns
description: >-
  Refined PM2 orchestration patterns for Python, Node, and TypeScript services
  with agent-specific configurations. Unifies service definitions, minimizes
  ecosystem files, and enables clean agent setups.
tags:
  - pm2
  - orchestration
  - python
  - node
  - typescript
  - agent
  - service
  - ecosystem
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/tooling/pm2-ecosystem-patterns.md ^ref-51932e7b-1-0

You're **90% of the way there** to having a clean, abstracted PM2 orchestration layer for Promethean. Let’s turn your current pattern into a more maintainable system that: ^ref-51932e7b-3-0

---

### 🧠 **Goals**

- Unifies `defineApp` logic for Python, Node, and TS services. ^ref-51932e7b-9-0
    
- Encapsulates agent-specific setups (like Duck) cleanly. ^ref-51932e7b-11-0
    
- Keeps each service/agent ecosystem file minimal and declarative. ^ref-51932e7b-13-0
    
- Makes the `master ecosystem.config.js` almost boilerplate.
    

---

## ✅ Refined `defineApp` Utility

Let's break this down into **three helper functions**: ^ref-51932e7b-22-0

### 1. `defineApp` (your base stays nearly the same, with improved flexibility)

```js
// dev/pm2Helpers.js
const path = require("path");

function defineApp(name, script, args = [], opts = {}) {
  const {
    cwd,
    watch,
    env_file,
    env = {},
    instances = 1,
    exec_mode = "fork",
  } = opts;

  return {
    name,
    script,
    args,
    exec_mode,
    cwd,
    watch,
    env_file,
    out_file: `./logs/${name}-out.log`,
    error_file: `./logs/${name}-err.log`,
    merge_logs: true,
    instances,
    autorestart: true,
    restart_delay: 10000,
    kill_timeout: 10000,
    env: {
      ...env,
      PM2_PROCESS_NAME: name,
      HEARTBEAT_PORT: defineApp.HEARTBEAT_PORT,
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: defineApp.PYTHONPATH,
      CHECK_INTERVAL: 1000 * 60 * 5,
      HEARTBEAT_TIMEOUT: 1000 * 60 * 10,
    },
  };
}

defineApp.HEARTBEAT_PORT = 5005;
defineApp.PYTHONPATH = path.resolve(__dirname, "..");

module.exports = {
  defineApp,
};
```
^ref-51932e7b-26-0

---

### 2. `definePythonService` and `defineNodeService`
 ^ref-51932e7b-79-0
Create small wrappers to make service configs easier to read.
 ^ref-51932e7b-81-0
```js
// dev/pm2Helpers.js
function definePythonService(name, serviceDir, opts = {}) {
  return defineApp(
    name,
    "pipenv",
    ["run", "python", "-m", "main"],
    {
      cwd: serviceDir,
      ...opts,
    }
  );
}

function defineNodeService(name, serviceDir, opts = {}) {
  return defineApp(
    name,
    ".", // Assume entry is in package.json or index.js
    [],
    {
      cwd: serviceDir,
      ...opts,
    }
  );
}

module.exports.definePythonService = definePythonService;
module.exports.defineNodeService = defineNodeService;
^ref-51932e7b-81-0
```

---

## 🔄 Standard Ecosystem File for Services ^ref-51932e7b-115-0

Instead of custom boilerplate for each service, use this template: ^ref-51932e7b-117-0

```js
// services/py/tts/ecosystem.config.js
const path = require("path");
const { definePythonService } = require("../../../dev/pm2Helpers");

module.exports = {
  apps: [
    definePythonService("tts", __dirname)
  ],
^ref-51932e7b-117-0
}; ^ref-51932e7b-129-0
```
 ^ref-51932e7b-131-0
Same idea applies to Node/TS services:

```js
// services/js/vision/ecosystem.config.js
const path = require("path");
const { defineNodeService } = require("../../../dev/pm2Helpers");

module.exports = {
  apps: [
    defineNodeService("vision", __dirname)
^ref-51932e7b-131-0
  ],
};
```

--- ^ref-51932e7b-147-0

## 🦆 Specialized Agent Ecosystem File (Duck) ^ref-51932e7b-149-0

Yours is mostly perfect already, just slight cleanup and better naming.

```js
// agents/duck/ecosystem.config.js
const path = require("path");
const dotenv = require("dotenv");
const { definePythonService, defineNodeService } = require("../../dev/pm2Helpers");

dotenv.config({ path: __dirname + "/.tokens" });

const discord_env = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_CLIENT_USER_ID: "449279570445729793",
  DEFAULT_CHANNEL: "450688080542695436",
  DEFAULT_CHANNEL_NAME: "duck-bots",
  DISCORD_CLIENT_USER_NAME: "Duck",
  AUTHOR_USER_NAME: "Error",
  AGENT_NAME: "Duck",
};

module.exports = {
  apps: [
    definePythonService("duck_discord_indexer", path.join(__dirname, "../../services/py/discord_indexer"), {
      env: discord_env,
    }),
    defineNodeService("duck_cephalon", path.join(__dirname, "../../services/ts/cephalon"), {
      env: discord_env,
    }),
    defineNodeService("duck_embedder", path.join(__dirname, "../../services/ts/discord-embedder"), {
      env: discord_env,
    }),
    defineNodeService("duck_voice", path.join(__dirname, "../../services/ts/voice"), {
      env: discord_env,
    }),
    definePythonService("duck_attachment_indexer", path.join(__dirname, "../../services/py/discord_attachment_indexer"), {
      watch: ["./services/py/tts"],
      env: {
        ...discord_env,
        DEESKTOP_CAPTURE_CHANNEL_ID: "1401730790467047586",
      },
    }),
    definePythonService("duck_attachment_embedder", path.join(__dirname, "../../services/py/discord_attachment_embedder"), {
      watch: ["./services/py/tts"],
      env: {
        ...discord_env,
        DEESKTOP_CAPTURE_CHANNEL_ID: "1401730790467047586",
      },
    }),
    {
      name: "chromadb",
      cwd: __dirname,
      script: "./scripts/run_chroma.sh",
      restart_delay: 10000,
      kill_timeout: 10000,
^ref-51932e7b-149-0
    },
  ],
};
```
 ^ref-51932e7b-210-0
---
 ^ref-51932e7b-212-0
## 🧩 Master Ecosystem File

You now have a clean and declarative entrypoint:

```js
// ecosystem.config.js
const duck = require("./agents/duck/ecosystem.config.js");

const services = [
  require("./services/py/embedding_service/ecosystem.config.js"),
  require("./services/py/tts/ecosystem.config.js"),
  require("./services/py/stt/ecosystem.config.js"),
  require("./services/ts/file-watcher/ecosystem.config.js"),
  require("./services/js/vision/ecosystem.config.js"),
  require("./services/ts/llm/ecosystem.config.js"),
  require("./services/js/heartbeat/ecosystem.config.js"),
  require("./services/js/proxy/ecosystem.config.js"),
  require("./services/js/eidolon-field/ecosystem.config.js"),
  require("./services/ts/markdown-graph/ecosystem.config.js"),
];
^ref-51932e7b-212-0

module.exports = {
  apps: [...duck.apps, ...services.flatMap((svc) => svc.apps)],
};
``` ^ref-51932e7b-238-0
^ref-51932e7b-217-0

---
 ^ref-51932e7b-242-0
## 💡 Optional: Dynamic Service Loader ^ref-51932e7b-242-0

If you're feeling fancy, we could load all service ecosystem files dynamically instead of manually requiring each one. Let me know if you want that too.
 ^ref-51932e7b-245-0
---
 ^ref-51932e7b-247-0 ^ref-51932e7b-248-0
Would you like this turned into a `canvas` so we can break out a real migration plan?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Tooling](chunks/tooling.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [JavaScript](chunks/javascript.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Event Bus MVP](event-bus-mvp.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [EidolonField](eidolonfield.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [graph-ds](graph-ds.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Shared Package Structure](shared-package-structure.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Python Services CI](python-services-ci.md)
- [Reawakening Duck](reawakening-duck.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Tracing the Signal](tracing-the-signal.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [template-based-compilation](template-based-compilation.md)
## Sources
- [Tooling — L4](chunks/tooling.md#^ref-6cb4943e-4-0) (line 4, col 0, score 0.8)
- [Unique Info Dump Index — L36](unique-info-dump-index.md#^ref-30ec3ba6-36-0) (line 36, col 0, score 0.8)
- [field-node-diagram-outline — L1](field-node-diagram-outline.md#^ref-1f32c94a-1-0) (line 1, col 0, score 0.74)
- [field-node-diagram-set — L1](field-node-diagram-set.md#^ref-22b989d5-1-0) (line 1, col 0, score 0.74)
- [field-node-diagram-visualizations — L1](field-node-diagram-visualizations.md#^ref-e9b27b06-1-0) (line 1, col 0, score 0.74)
- [eidolon-node-lifecycle — L1](eidolon-node-lifecycle.md#^ref-938eca9c-1-0) (line 1, col 0, score 0.74)
- [field-dynamics-math-blocks — L1](field-dynamics-math-blocks.md#^ref-7cfc230d-1-0) (line 1, col 0, score 0.74)
- [promethean-system-diagrams — L1](promethean-system-diagrams.md#^ref-b51e19b4-1-0) (line 1, col 0, score 0.73)
- [graph-ds — L1](graph-ds.md#^ref-6620e2f2-1-0) (line 1, col 0, score 0.72)
- [layer-1-uptime-diagrams — L1](layer-1-uptime-diagrams.md#^ref-4127189a-1-0) (line 1, col 0, score 0.71)
- [archetype-ecs — L1](archetype-ecs.md#^ref-8f4c1e86-1-0) (line 1, col 0, score 0.71)
- [Event Bus Projections Architecture — L1](event-bus-projections-architecture.md#^ref-cf6b9b17-1-0) (line 1, col 0, score 0.7)
- [obsidian-ignore-node-modules-regex — L1](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1-0) (line 1, col 0, score 0.7)
- [field-interaction-equations — L1](field-interaction-equations.md#^ref-b09141b7-1-0) (line 1, col 0, score 0.7)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.7)
- [Tooling — L8](chunks/tooling.md#^ref-6cb4943e-8-0) (line 8, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L257](cross-language-runtime-polymorphism.md#^ref-c34c36a6-257-0) (line 257, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L434](ecs-scheduler-and-prefabs.md#^ref-c62a1815-434-0) (line 434, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L177](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-177-0) (line 177, col 0, score 0.7)
- [obsidian-ignore-node-modules-regex — L55](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-55-0) (line 55, col 0, score 0.7)
- [Unique Info Dump Index — L101](unique-info-dump-index.md#^ref-30ec3ba6-101-0) (line 101, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.7)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L463](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-463-0) (line 463, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.64)
- [Universal Lisp Interface — L174](universal-lisp-interface.md#^ref-b01856b4-174-0) (line 174, col 0, score 0.65)
- [lisp-dsl-for-window-management — L156](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-156-0) (line 156, col 0, score 0.65)
- [ecs-offload-workers — L5](ecs-offload-workers.md#^ref-6498b9d7-5-0) (line 5, col 0, score 0.64)
- [lisp-dsl-for-window-management — L174](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-174-0) (line 174, col 0, score 0.64)
- [Universal Lisp Interface — L192](universal-lisp-interface.md#^ref-b01856b4-192-0) (line 192, col 0, score 0.64)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.63)
- [Python Services CI — L1](python-services-ci.md#^ref-4c951657-1-0) (line 1, col 0, score 0.67)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.63)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.6)
- [Reawakening Duck — L9](reawakening-duck.md#^ref-59b5670f-9-0) (line 9, col 0, score 0.65)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.65)
- [Promethean Agent Config DSL — L9](promethean-agent-config-dsl.md#^ref-2c00ce45-9-0) (line 9, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L798](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-798-0) (line 798, col 0, score 0.67)
- [promethean-system-diagrams — L159](promethean-system-diagrams.md#^ref-b51e19b4-159-0) (line 159, col 0, score 0.7)
- [Factorio AI with External Agents — L8](factorio-ai-with-external-agents.md#^ref-a4d90289-8-0) (line 8, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L6](promethean-copilot-intent-engine.md#^ref-ae24a280-6-0) (line 6, col 0, score 0.63)
- [Promethean Agent Config DSL — L3](promethean-agent-config-dsl.md#^ref-2c00ce45-3-0) (line 3, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.66)
- [Duck's Self-Referential Perceptual Loop — L29](ducks-self-referential-perceptual-loop.md#^ref-71726f04-29-0) (line 29, col 0, score 0.62)
- [Promethean Agent Config DSL — L225](promethean-agent-config-dsl.md#^ref-2c00ce45-225-0) (line 225, col 0, score 0.62)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.66)
- [Reawakening Duck — L90](reawakening-duck.md#^ref-59b5670f-90-0) (line 90, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L1](prompt-folder-bootstrap.md#^ref-bd4f0976-1-0) (line 1, col 0, score 0.63)
- [sibilant-metacompiler-overview — L68](sibilant-metacompiler-overview.md#^ref-61d4086b-68-0) (line 68, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L393](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-393-0) (line 393, col 0, score 0.59)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.6)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.6)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L24](promethean-copilot-intent-engine.md#^ref-ae24a280-24-0) (line 24, col 0, score 0.6)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L120](prompt-folder-bootstrap.md#^ref-bd4f0976-120-0) (line 120, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.58)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.58)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.56)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#^ref-54382370-40-0) (line 40, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L12](chroma-toolkit-consolidation-plan.md#^ref-5020e892-12-0) (line 12, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#^ref-af5d2824-158-0) (line 158, col 0, score 0.66)
- [Agent Reflections and Prompt Evolution — L23](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-23-0) (line 23, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L301](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-301-0) (line 301, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L345](performance-optimized-polyglot-bridge.md#^ref-f5579967-345-0) (line 345, col 0, score 0.64)
- [Model Selection for Lightweight Conversational Tasks — L1](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1-0) (line 1, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L869](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-869-0) (line 869, col 0, score 0.63)
- [Vectorial Exception Descent — L73](vectorial-exception-descent.md#^ref-d771154e-73-0) (line 73, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L23](functional-embedding-pipeline-refactor.md#^ref-a4a25141-23-0) (line 23, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L38](model-upgrade-calm-down-guide.md#^ref-db74343f-38-0) (line 38, col 0, score 0.62)
- [Promethean Agent Config DSL — L10](promethean-agent-config-dsl.md#^ref-2c00ce45-10-0) (line 10, col 0, score 0.66)
- [Promethean Agent Config DSL — L145](promethean-agent-config-dsl.md#^ref-2c00ce45-145-0) (line 145, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L696](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-696-0) (line 696, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L774](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-774-0) (line 774, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.64)
- [universal-intention-code-fabric — L216](universal-intention-code-fabric.md#^ref-c14edce7-216-0) (line 216, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L25](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-25-0) (line 25, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.64)
- [Promethean Agent Config DSL — L291](promethean-agent-config-dsl.md#^ref-2c00ce45-291-0) (line 291, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L105](migrate-to-provider-tenant-architecture.md#^ref-54382370-105-0) (line 105, col 0, score 0.65)
- [WebSocket Gateway Implementation — L385](websocket-gateway-implementation.md#^ref-e811123d-385-0) (line 385, col 0, score 0.63)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.61)
- [observability-infrastructure-setup — L1](observability-infrastructure-setup.md#^ref-b4e64f8c-1-0) (line 1, col 0, score 0.6)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.6)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.6)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.63)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L6](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-6-0) (line 6, col 0, score 0.63)
- [universal-intention-code-fabric — L405](universal-intention-code-fabric.md#^ref-c14edce7-405-0) (line 405, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L14](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-14-0) (line 14, col 0, score 0.62)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.63)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.61)
- [prompt-programming-language-lisp — L79](prompt-programming-language-lisp.md#^ref-d41a06d1-79-0) (line 79, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L176](recursive-prompt-construction-engine.md#^ref-babdb9eb-176-0) (line 176, col 0, score 0.62)
- [set-assignment-in-lisp-ast — L159](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-159-0) (line 159, col 0, score 0.62)
- [sibilant-macro-targets — L159](sibilant-macro-targets.md#^ref-c5c9a5c6-159-0) (line 159, col 0, score 0.62)
- [prompt-programming-language-lisp — L5](prompt-programming-language-lisp.md#^ref-d41a06d1-5-0) (line 5, col 0, score 0.6)
- [universal-intention-code-fabric — L397](universal-intention-code-fabric.md#^ref-c14edce7-397-0) (line 397, col 0, score 0.59)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.58)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.55)
- [prompt-programming-language-lisp — L64](prompt-programming-language-lisp.md#^ref-d41a06d1-64-0) (line 64, col 0, score 0.58)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.54)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.56)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.64)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.65)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.65)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.63)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.65)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.65)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.64)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.64)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.62)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L271](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-271-0) (line 271, col 0, score 0.66)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.65)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.65)
- [Pure TypeScript Search Microservice — L112](pure-typescript-search-microservice.md#^ref-d17d3a96-112-0) (line 112, col 0, score 0.63)
- [api-gateway-versioning — L51](api-gateway-versioning.md#^ref-0580dcd3-51-0) (line 51, col 0, score 0.62)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.62)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.62)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 0.61)
- [Promethean Web UI Setup — L317](promethean-web-ui-setup.md#^ref-bc5172ca-317-0) (line 317, col 0, score 0.65)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L417](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-417-0) (line 417, col 0, score 0.62)
- [Ice Box Reorganization — L3](ice-box-reorganization.md#^ref-291c7d91-3-0) (line 3, col 0, score 0.64)
- [Local-First Intention→Code Loop with Free Models — L81](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-81-0) (line 81, col 0, score 0.61)
- [Shared Package Structure — L1](shared-package-structure.md#^ref-66a72fc3-1-0) (line 1, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L185](migrate-to-provider-tenant-architecture.md#^ref-54382370-185-0) (line 185, col 0, score 0.6)
- [Lisp-Compiler-Integration — L518](lisp-compiler-integration.md#^ref-cfee6d36-518-0) (line 518, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L96](migrate-to-provider-tenant-architecture.md#^ref-54382370-96-0) (line 96, col 0, score 0.59)
- [Tracing the Signal — L95](tracing-the-signal.md#^ref-c3cd4f65-95-0) (line 95, col 0, score 0.59)
- [heartbeat-fragment-demo — L3](heartbeat-fragment-demo.md#^ref-dd00677a-3-0) (line 3, col 0, score 0.58)
- [Promethean Infrastructure Setup — L1](promethean-infrastructure-setup.md#^ref-6deed6ac-1-0) (line 1, col 0, score 0.57)
- [template-based-compilation — L50](template-based-compilation.md#^ref-f8877e5e-50-0) (line 50, col 0, score 0.57)
- [plan-update-confirmation — L106](plan-update-confirmation.md#^ref-b22d79c6-106-0) (line 106, col 0, score 0.57)
- [plan-update-confirmation — L134](plan-update-confirmation.md#^ref-b22d79c6-134-0) (line 134, col 0, score 0.57)
- [shared-package-layout-clarification — L1](shared-package-layout-clarification.md#^ref-36c8882a-1-0) (line 1, col 0, score 0.57)
- [Migrate to Provider-Tenant Architecture — L113](migrate-to-provider-tenant-architecture.md#^ref-54382370-113-0) (line 113, col 0, score 0.7)
- [promethean-system-diagrams — L95](promethean-system-diagrams.md#^ref-b51e19b4-95-0) (line 95, col 0, score 0.67)
- [Voice Access Layer Design — L236](voice-access-layer-design.md#^ref-543ed9b3-236-0) (line 236, col 0, score 0.65)
- [Promethean Agent Config DSL — L195](promethean-agent-config-dsl.md#^ref-2c00ce45-195-0) (line 195, col 0, score 0.67)
- [Voice Access Layer Design — L38](voice-access-layer-design.md#^ref-543ed9b3-38-0) (line 38, col 0, score 0.69)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.65)
- [Promethean Agent Config DSL — L74](promethean-agent-config-dsl.md#^ref-2c00ce45-74-0) (line 74, col 0, score 0.64)
- [promethean-system-diagrams — L9](promethean-system-diagrams.md#^ref-b51e19b4-9-0) (line 9, col 0, score 0.63)
- [Promethean Agent Config DSL — L163](promethean-agent-config-dsl.md#^ref-2c00ce45-163-0) (line 163, col 0, score 0.65)
- [Voice Access Layer Design — L17](voice-access-layer-design.md#^ref-543ed9b3-17-0) (line 17, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L14](chroma-toolkit-consolidation-plan.md#^ref-5020e892-14-0) (line 14, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L83](migrate-to-provider-tenant-architecture.md#^ref-54382370-83-0) (line 83, col 0, score 0.63)
- [Voice Access Layer Design — L222](voice-access-layer-design.md#^ref-543ed9b3-222-0) (line 222, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L75](prompt-folder-bootstrap.md#^ref-bd4f0976-75-0) (line 75, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L33](prompt-folder-bootstrap.md#^ref-bd4f0976-33-0) (line 33, col 0, score 0.57)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L68](prompt-folder-bootstrap.md#^ref-bd4f0976-68-0) (line 68, col 0, score 0.56)
- [Recursive Prompt Construction Engine — L9](recursive-prompt-construction-engine.md#^ref-babdb9eb-9-0) (line 9, col 0, score 0.56)
- [Recursive Prompt Construction Engine — L127](recursive-prompt-construction-engine.md#^ref-babdb9eb-127-0) (line 127, col 0, score 0.56)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.55)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.55)
- [universal-intention-code-fabric — L390](universal-intention-code-fabric.md#^ref-c14edce7-390-0) (line 390, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L26](prompt-folder-bootstrap.md#^ref-bd4f0976-26-0) (line 26, col 0, score 0.54)
- [Universal Lisp Interface — L28](universal-lisp-interface.md#^ref-b01856b4-28-0) (line 28, col 0, score 0.62)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L368](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-368-0) (line 368, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L189](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-189-0) (line 189, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L279](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-279-0) (line 279, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L381](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-381-0) (line 381, col 0, score 0.64)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.63)
- [Promethean-native config design — L1](promethean-native-config-design.md#^ref-ab748541-1-0) (line 1, col 0, score 0.62)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L395](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-395-0) (line 395, col 0, score 0.61)
- [Promethean-native config design — L375](promethean-native-config-design.md#^ref-ab748541-375-0) (line 375, col 0, score 0.63)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.62)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.62)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.62)
- [plan-update-confirmation — L367](plan-update-confirmation.md#^ref-b22d79c6-367-0) (line 367, col 0, score 0.62)
- [sibilant-macro-targets — L27](sibilant-macro-targets.md#^ref-c5c9a5c6-27-0) (line 27, col 0, score 0.6)
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.6)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.6)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.6)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.59)
- [plan-update-confirmation — L414](plan-update-confirmation.md#^ref-b22d79c6-414-0) (line 414, col 0, score 0.59)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.59)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.59)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
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
- [Tooling — L7](chunks/tooling.md#^ref-6cb4943e-7-0) (line 7, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L227](cross-language-runtime-polymorphism.md#^ref-c34c36a6-227-0) (line 227, col 0, score 1)
- [ecs-scheduler-and-prefabs — L421](ecs-scheduler-and-prefabs.md#^ref-c62a1815-421-0) (line 421, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L156](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-156-0) (line 156, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L532](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-532-0) (line 532, col 0, score 1)
- [polymorphic-meta-programming-engine — L226](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-226-0) (line 226, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L920](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-920-0) (line 920, col 0, score 1)
- [prompt-programming-language-lisp — L102](prompt-programming-language-lisp.md#^ref-d41a06d1-102-0) (line 102, col 0, score 1)
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
- [Obsidian ChatGPT Plugin Integration Guide — L56](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-56-0) (line 56, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
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
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 1)
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
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
