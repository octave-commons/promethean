---
uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
created_at: 2025.08.09.00.08.11.md
filename: Local-First Intention→Code Loop with Free Models
description: >-
  A local-first stack for running intention→code loops using free/local models
  (Ollama, LM Studio) without paid APIs. Provides router, cache, and
  OpenAI-compatible adapters for seamless integration.
tags:
  - local-first
  - intention-to-code
  - router
  - cache
  - Ollama
  - LM Studio
  - OpenAI-compatible
  - transpiler
related_to_title: []
related_to_uuid: []
references: []
---
Totally get it. Local-first is the whole vibe. Let’s make your **intention→code** loop run on *your* box with free/local models — and be fast, reliable, and swappable. ^ref-871490c7-1-0

Here’s a tight, drop-in stack: ^ref-871490c7-3-0

# 1) Local LLMs: router + cache (no paid APIs)

```ts
// shared/js/prom-lib/intention/router.ts
import type { LLM } from "./llm";

export class RouterLLM implements LLM {
  constructor(private providers: LLM[]) {}
  async generate(io: { system: string; prompt: string }): Promise<string> {
    let lastErr: any;
    for (const p of this.providers) {
      try { return await p.generate(io); } catch (e) { lastErr = e; }
    }
    throw lastErr ?? new Error("No providers responded");
  }
}
```
^ref-871490c7-7-0
 ^ref-871490c7-23-0
```ts
// shared/js/prom-lib/intention/cache.ts
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { LLM } from "./llm";

export class FileCacheLLM implements LLM {
  constructor(private inner: LLM, private dir = ".promirror/cache") {}
  private key(s: string) { return createHash("sha256").update(s).digest("hex"); }
  async generate({ system, prompt }: { system: string; prompt: string }) {
    await fs.mkdir(this.dir, { recursive: true });
    const k = this.key(system + "\n---\n" + prompt);
    const p = path.join(this.dir, k + ".txt");
    try { return await fs.readFile(p, "utf8"); } catch {}
    const out = await this.inner.generate({ system, prompt });
    await fs.writeFile(p, out, "utf8");
    return out;
  }
}
^ref-871490c7-23-0
```

# 2) Providers: Ollama (you already have) + OpenAI-compatible (LM Studio, vLLM, TGI) ^ref-871490c7-47-0

````ts
// shared/js/prom-lib/intention/openai_compat.ts
import type { LLM } from "./llm";

export class OpenAICompatLLM implements LLM {
  constructor(
    private baseUrl = "http://127.0.0.1:1234/v1",     // LM Studio default
    private model = "qwen2.5-coder:7b",
    private apiKey = "sk-local",                      // ignored by most local servers
    private params: Partial<{ temperature: number; top_p: number; max_tokens: number; stop: string[] }> = {},
  ) {}
  async generate({ system, prompt }: { system: string; prompt: string }) {
    const r = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: `${system}\nReturn ONLY code. No fences.` },
          { role: "user", content: prompt },
        ],
        temperature: 0.1, top_p: 0.95, max_tokens: 1024, stop: ["```", ...(this.params.stop ?? [])],
        ...this.params,
        stream: false
      })
    });
    if (!r.ok) throw new Error(`openai-compat ${r.status}: ${await r.text().catch(()=>"<no body>")}`);
    const j: any = await r.json();
    const text = j.choices?.[0]?.message?.content ?? "";
    return text.replace(/^```[\w-]*\n?|\n?```$/g, "");
  }
^ref-871490c7-47-0
} ^ref-871490c7-81-0
````
 ^ref-871490c7-83-0
And your existing `OllamaLLM` (from that last message). Now compose:

```ts
// boot it
import { RouterLLM } from "./router";
import { FileCacheLLM } from "./cache";
import { OllamaLLM } from "./ollama";
import { OpenAICompatLLM } from "./openai_compat";

const local = new RouterLLM([
  new OllamaLLM({ model: "qwen2.5-coder:14b", options:{ temperature:0.1, num_predict: 1024 } }),
  new OpenAICompatLLM("http://127.0.0.1:1234/v1", "deepseek-coder:6.7b") // LM Studio fallback
]);
^ref-871490c7-83-0

export const LocalLLM = new FileCacheLLM(local, ".promirror/cache");
```
^ref-871490c7-100-0

# 3) Plug into the transpiler

```ts
// wherever you call transpileIntention(...)
import { transpileIntention } from "./shared/js/prom-lib/intention/engine";
import { LocalLLM } from "./shared/js/prom-lib/intention/boot-local";

await transpileIntention(pseudoSpec, {
  llm: LocalLLM,
^ref-871490c7-100-0
  rounds: 3,
  outDir: { js: "src/js/auto", py: "src/py/auto" }
}); ^ref-871490c7-114-0
^ref-871490c7-114-0 ^ref-871490c7-116-0
``` ^ref-871490c7-117-0
^ref-871490c7-114-0 ^ref-871490c7-118-0
^ref-871490c7-105-0 ^ref-871490c7-119-0
^ref-871490c7-114-0 ^ref-871490c7-118-0 ^ref-871490c7-120-0
 ^ref-871490c7-116-0 ^ref-871490c7-118-0 ^ref-871490c7-119-0 ^ref-871490c7-121-0
# 4) Local-first tips (to keep it snappy) ^ref-871490c7-117-0 ^ref-871490c7-119-0 ^ref-871490c7-120-0
 ^ref-871490c7-118-0 ^ref-871490c7-120-0 ^ref-871490c7-121-0
* **Pick models that fly on CPU/GPU:** ^ref-871490c7-119-0 ^ref-871490c7-121-0
 ^ref-871490c7-120-0 ^ref-871490c7-125-0
  * *JS code:* `qwen2.5-coder:7b` or `deepseek-coder:6.7b`. ^ref-871490c7-121-0
  * *General:* `llama3.1:8b-instruct` (solid reasoning for repair passes). ^ref-871490c7-125-0 ^ref-871490c7-127-0
* **Quantization:** prefer Q5\_K\_M / Q6\_K for speed-quality balance in Ollama. ^ref-871490c7-125-0
* **Prompt schedule:** round 1 small fast model, repair on bigger one (Router handles order). ^ref-871490c7-127-0
* **Determinism:** set `temperature: 0.1` (or 0), fixed `seed` if your server supports it. ^ref-871490c7-125-0 ^ref-871490c7-127-0
* **Cache everything:** that file cache saves tons of cycles when you re-run tests.

# 5) Optional: grammar lock (emit only code)

If your server supports **JSON schema** or **grammar**, great. Otherwise, this little post-filter mows down junk:

````ts
export function extractCode(s: string) {
^ref-871490c7-127-0
  const fence = s.match(/```[a-zA-Z-]*\n([\s\S]*?)```/); if (fence) return fence[1]; ^ref-871490c7-135-0
  const triple = s.split(/\n-{3,}\n/)[0]; // drop after separators
  return triple.trim();
^ref-871490c7-139-0
^ref-871490c7-135-0 ^ref-871490c7-141-0
} ^ref-871490c7-142-0
^ref-871490c7-143-0 ^ref-871490c7-144-0
^ref-871490c7-142-0
^ref-871490c7-141-0 ^ref-871490c7-146-0
^ref-871490c7-139-0 ^ref-871490c7-147-0
^ref-871490c7-147-0 ^ref-871490c7-150-0
^ref-871490c7-146-0
^ref-871490c7-144-0
^ref-871490c7-143-0
^ref-871490c7-142-0 ^ref-871490c7-154-0
^ref-871490c7-141-0 ^ref-871490c7-155-0
^ref-871490c7-139-0 ^ref-871490c7-156-0
^ref-871490c7-135-0
```` ^ref-871490c7-139-0 ^ref-871490c7-143-0
 ^ref-871490c7-144-0 ^ref-871490c7-150-0
Use it inside providers before returning. ^ref-871490c7-141-0 ^ref-871490c7-160-0
 ^ref-871490c7-142-0 ^ref-871490c7-146-0
--- ^ref-871490c7-143-0 ^ref-871490c7-147-0
 ^ref-871490c7-144-0 ^ref-871490c7-154-0
Want me to also wire a **watcher CLI** (auto-transpile on `*.intent.md` change) and a **dual-model round schedule** baked into the engine? Or set up a **tiny config file** so you can switch models/endpoints without touching code?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Event Bus MVP](event-bus-mvp.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [balanced-bst](balanced-bst.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [DSL](chunks/dsl.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [Tooling](chunks/tooling.md)
- [Services](chunks/services.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Diagrams](chunks/diagrams.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [EidolonField](eidolonfield.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-interaction-equations](field-interaction-equations.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Shared](chunks/shared.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Shared Package Structure](shared-package-structure.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [refactor-relations](refactor-relations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
## Sources
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 0.84)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 0.84)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 0.84)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 0.84)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 0.84)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 0.84)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 0.84)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 0.84)
- [Local-Only-LLM-Workflow — L3](local-only-llm-workflow.md#^ref-9a8ab57e-3-0) (line 3, col 0, score 0.76)
- [markdown-to-org-transpiler — L3](markdown-to-org-transpiler.md#^ref-ab54cdd8-3-0) (line 3, col 0, score 0.73)
- [js-to-lisp-reverse-compiler — L7](js-to-lisp-reverse-compiler.md#^ref-58191024-7-0) (line 7, col 0, score 0.69)
- [Shared Package Structure — L157](shared-package-structure.md#^ref-66a72fc3-157-0) (line 157, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L3](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-3-0) (line 3, col 0, score 0.65)
- [ecs-offload-workers — L9](ecs-offload-workers.md#^ref-6498b9d7-9-0) (line 9, col 0, score 0.64)
- [universal-intention-code-fabric — L3](universal-intention-code-fabric.md#^ref-c14edce7-3-0) (line 3, col 0, score 0.64)
- [balanced-bst — L1](balanced-bst.md#^ref-d3e7db72-1-0) (line 1, col 0, score 0.63)
- [homeostasis-decay-formulas — L134](homeostasis-decay-formulas.md#^ref-37b5d236-134-0) (line 134, col 0, score 0.63)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L9](chroma-embedding-refactor.md#^ref-8b256935-9-0) (line 9, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.62)
- [field-node-diagram-visualizations — L5](field-node-diagram-visualizations.md#^ref-e9b27b06-5-0) (line 5, col 0, score 0.61)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.61)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.7)
- [Local-Only-LLM-Workflow — L36](local-only-llm-workflow.md#^ref-9a8ab57e-36-0) (line 36, col 0, score 0.78)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.7)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.73)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.69)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.69)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.67)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.66)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.66)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.74)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.65)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.65)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.74)
- [Language-Agnostic Mirror System — L109](language-agnostic-mirror-system.md#^ref-d2b3628c-109-0) (line 109, col 0, score 0.74)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.73)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.71)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.71)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.7)
- [Language-Agnostic Mirror System — L237](language-agnostic-mirror-system.md#^ref-d2b3628c-237-0) (line 237, col 0, score 0.69)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [universal-intention-code-fabric — L149](universal-intention-code-fabric.md#^ref-c14edce7-149-0) (line 149, col 0, score 0.69)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.84)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.69)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.69)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.69)
- [Local-Offline-Model-Deployment-Strategy — L10](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-10-0) (line 10, col 0, score 0.69)
- [universal-intention-code-fabric — L415](universal-intention-code-fabric.md#^ref-c14edce7-415-0) (line 415, col 0, score 0.65)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L368](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-368-0) (line 368, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.67)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.71)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.74)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.73)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.72)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L380](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-380-0) (line 380, col 0, score 0.7)
- [TypeScript Patch for Tool Calling Support — L145](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-145-0) (line 145, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.65)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.69)
- [Voice Access Layer Design — L215](voice-access-layer-design.md#^ref-543ed9b3-215-0) (line 215, col 0, score 0.69)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.67)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [universal-intention-code-fabric — L353](universal-intention-code-fabric.md#^ref-c14edce7-353-0) (line 353, col 0, score 0.78)
- [universal-intention-code-fabric — L1](universal-intention-code-fabric.md#^ref-c14edce7-1-0) (line 1, col 0, score 0.72)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.71)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.69)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.69)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L423](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-423-0) (line 423, col 0, score 0.69)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.68)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.68)
- [universal-intention-code-fabric — L395](universal-intention-code-fabric.md#^ref-c14edce7-395-0) (line 395, col 0, score 0.62)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.69)
- [Local-Only-LLM-Workflow — L22](local-only-llm-workflow.md#^ref-9a8ab57e-22-0) (line 22, col 0, score 0.7)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.64)
- [compiler-kit-foundations — L9](compiler-kit-foundations.md#^ref-01b21543-9-0) (line 9, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L115](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-115-0) (line 115, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L392](js-to-lisp-reverse-compiler.md#^ref-58191024-392-0) (line 392, col 0, score 0.66)
- [Eidolon Field Abstract Model — L184](eidolon-field-abstract-model.md#^ref-5e8b2388-184-0) (line 184, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.61)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L377](dynamic-context-model-for-web-components.md#^ref-f7702bf8-377-0) (line 377, col 0, score 0.63)
- [Model Selection for Lightweight Conversational Tasks — L24](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-24-0) (line 24, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L16](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-16-0) (line 16, col 0, score 0.61)
- [Layer1SurvivabilityEnvelope — L11](layer1survivabilityenvelope.md#^ref-64a9f9f9-11-0) (line 11, col 0, score 0.6)
- [EidolonField — L219](eidolonfield.md#^ref-49d1e1e5-219-0) (line 219, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L161](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-161-0) (line 161, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L431](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-431-0) (line 431, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L172](chroma-toolkit-consolidation-plan.md#^ref-5020e892-172-0) (line 172, col 0, score 0.6)
- [Voice Access Layer Design — L115](voice-access-layer-design.md#^ref-543ed9b3-115-0) (line 115, col 0, score 0.84)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-b01856b4-117-0) (line 117, col 0, score 0.81)
- [shared-package-layout-clarification — L155](shared-package-layout-clarification.md#^ref-36c8882a-155-0) (line 155, col 0, score 0.73)
- [Voice Access Layer Design — L112](voice-access-layer-design.md#^ref-543ed9b3-112-0) (line 112, col 0, score 0.72)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.68)
- [Universal Lisp Interface — L91](universal-lisp-interface.md#^ref-b01856b4-91-0) (line 91, col 0, score 0.68)
- [plan-update-confirmation — L868](plan-update-confirmation.md#^ref-b22d79c6-868-0) (line 868, col 0, score 0.67)
- [prompt-programming-language-lisp — L43](prompt-programming-language-lisp.md#^ref-d41a06d1-43-0) (line 43, col 0, score 0.67)
- [obsidian-ignore-node-modules-regex — L42](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-42-0) (line 42, col 0, score 0.67)
- [Universal Lisp Interface — L90](universal-lisp-interface.md#^ref-b01856b4-90-0) (line 90, col 0, score 0.67)
- [obsidian-ignore-node-modules-regex — L18](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-18-0) (line 18, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.64)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.64)
- [Local-Only-LLM-Workflow — L23](local-only-llm-workflow.md#^ref-9a8ab57e-23-0) (line 23, col 0, score 0.75)
- [Functional Embedding Pipeline Refactor — L6](functional-embedding-pipeline-refactor.md#^ref-a4a25141-6-0) (line 6, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L264](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-264-0) (line 264, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L354](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-354-0) (line 354, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L145](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-145-0) (line 145, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L19](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-19-0) (line 19, col 0, score 0.65)
- [Docops Feature Updates — L2](docops-feature-updates-3.md#^ref-cdbd21ee-2-0) (line 2, col 0, score 0.65)
- [Docops Feature Updates — L19](docops-feature-updates.md#^ref-2792d448-19-0) (line 19, col 0, score 0.65)
- [Local-Only-LLM-Workflow — L158](local-only-llm-workflow.md#^ref-9a8ab57e-158-0) (line 158, col 0, score 0.77)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L150](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-150-0) (line 150, col 0, score 0.73)
- [Agent Reflections and Prompt Evolution — L105](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-105-0) (line 105, col 0, score 0.64)
- [aionian-circuit-math — L3](aionian-circuit-math.md#^ref-f2d83a77-3-0) (line 3, col 0, score 0.62)
- [Board Walk – 2025-08-11 — L6](board-walk-2025-08-11.md#^ref-7aa1eb92-6-0) (line 6, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L379](dynamic-context-model-for-web-components.md#^ref-f7702bf8-379-0) (line 379, col 0, score 0.62)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L160](local-only-llm-workflow.md#^ref-9a8ab57e-160-0) (line 160, col 0, score 0.85)
- [Functional Embedding Pipeline Refactor — L303](functional-embedding-pipeline-refactor.md#^ref-a4a25141-303-0) (line 303, col 0, score 0.71)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.7)
- [Dynamic Context Model for Web Components — L189](dynamic-context-model-for-web-components.md#^ref-f7702bf8-189-0) (line 189, col 0, score 0.7)
- [Promethean-native config design — L17](promethean-native-config-design.md#^ref-ab748541-17-0) (line 17, col 0, score 0.69)
- [Promethean Agent Config DSL — L12](promethean-agent-config-dsl.md#^ref-2c00ce45-12-0) (line 12, col 0, score 0.68)
- [Promethean Pipelines — L78](promethean-pipelines.md#^ref-8b8e6103-78-0) (line 78, col 0, score 0.67)
- [Functional Embedding Pipeline Refactor — L24](functional-embedding-pipeline-refactor.md#^ref-a4a25141-24-0) (line 24, col 0, score 0.73)
- [Promethean Documentation Pipeline Overview — L19](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-19-0) (line 19, col 0, score 0.72)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L418](performance-optimized-polyglot-bridge.md#^ref-f5579967-418-0) (line 418, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.68)
- [Promethean Documentation Pipeline Overview — L146](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-146-0) (line 146, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L159](local-only-llm-workflow.md#^ref-9a8ab57e-159-0) (line 159, col 0, score 0.67)
- [Functional Embedding Pipeline Refactor — L5](functional-embedding-pipeline-refactor.md#^ref-a4a25141-5-0) (line 5, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L315](dynamic-context-model-for-web-components.md#^ref-f7702bf8-315-0) (line 315, col 0, score 0.66)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.74)
- [Cross-Language Runtime Polymorphism — L119](cross-language-runtime-polymorphism.md#^ref-c34c36a6-119-0) (line 119, col 0, score 0.7)
- [plan-update-confirmation — L550](plan-update-confirmation.md#^ref-b22d79c6-550-0) (line 550, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L40](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-40-0) (line 40, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L20](cross-language-runtime-polymorphism.md#^ref-c34c36a6-20-0) (line 20, col 0, score 0.68)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L139](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-139-0) (line 139, col 0, score 0.67)
- [plan-update-confirmation — L470](plan-update-confirmation.md#^ref-b22d79c6-470-0) (line 470, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L294](chroma-embedding-refactor.md#^ref-8b256935-294-0) (line 294, col 0, score 0.66)
- [Factorio AI with External Agents — L90](factorio-ai-with-external-agents.md#^ref-a4d90289-90-0) (line 90, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L109](cross-language-runtime-polymorphism.md#^ref-c34c36a6-109-0) (line 109, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L111](cross-language-runtime-polymorphism.md#^ref-c34c36a6-111-0) (line 111, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L1](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1-0) (line 1, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.65)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L488](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-488-0) (line 488, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L154](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-154-0) (line 154, col 0, score 0.7)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.7)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L97](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-97-0) (line 97, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L223](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-223-0) (line 223, col 0, score 0.68)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.68)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.68)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L599](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-599-0) (line 599, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 0.6)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 0.6)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 0.6)
- [Language-Agnostic Mirror System — L7](language-agnostic-mirror-system.md#^ref-d2b3628c-7-0) (line 7, col 0, score 0.66)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L419](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-419-0) (line 419, col 0, score 0.64)
- [archetype-ecs — L450](archetype-ecs.md#^ref-8f4c1e86-450-0) (line 450, col 0, score 0.64)
- [Promethean Pipelines — L85](promethean-pipelines.md#^ref-8b8e6103-85-0) (line 85, col 0, score 0.63)
- [universal-intention-code-fabric — L382](universal-intention-code-fabric.md#^ref-c14edce7-382-0) (line 382, col 0, score 0.62)
- [lisp-dsl-for-window-management — L180](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-180-0) (line 180, col 0, score 0.62)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.62)
- [Promethean Web UI Setup — L598](promethean-web-ui-setup.md#^ref-bc5172ca-598-0) (line 598, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L3](ecs-scheduler-and-prefabs.md#^ref-c62a1815-3-0) (line 3, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L1](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-1-0) (line 1, col 0, score 0.62)
- [Factorio AI with External Agents — L138](factorio-ai-with-external-agents.md#^ref-a4d90289-138-0) (line 138, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L167](local-only-llm-workflow.md#^ref-9a8ab57e-167-0) (line 167, col 0, score 0.61)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L271](migrate-to-provider-tenant-architecture.md#^ref-54382370-271-0) (line 271, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Tooling — L13](chunks/tooling.md#^ref-6cb4943e-13-0) (line 13, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L205](cross-language-runtime-polymorphism.md#^ref-c34c36a6-205-0) (line 205, col 0, score 1)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#^ref-9a8ab57e-194-0) (line 194, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L320](migrate-to-provider-tenant-architecture.md#^ref-54382370-320-0) (line 320, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L50](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-50-0) (line 50, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L188](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-188-0) (line 188, col 0, score 1)
- [polyglot-repl-interface-layer — L173](polyglot-repl-interface-layer.md#^ref-9c79206d-173-0) (line 173, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-517-0) (line 517, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Matplotlib Animation with Async Execution — L78](matplotlib-animation-with-async-execution.md#^ref-687439f9-78-0) (line 78, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L132](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-132-0) (line 132, col 0, score 1)
- [Mongo Outbox Implementation — L584](mongo-outbox-implementation.md#^ref-9c1acd1e-584-0) (line 584, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L90](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-90-0) (line 90, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L311](migrate-to-provider-tenant-architecture.md#^ref-54382370-311-0) (line 311, col 0, score 1)
- [Tooling — L7](chunks/tooling.md#^ref-6cb4943e-7-0) (line 7, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L227](cross-language-runtime-polymorphism.md#^ref-c34c36a6-227-0) (line 227, col 0, score 1)
- [ecs-scheduler-and-prefabs — L421](ecs-scheduler-and-prefabs.md#^ref-c62a1815-421-0) (line 421, col 0, score 1)
- [pm2-orchestration-patterns — L250](pm2-orchestration-patterns.md#^ref-51932e7b-250-0) (line 250, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L532](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-532-0) (line 532, col 0, score 1)
- [polymorphic-meta-programming-engine — L226](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-226-0) (line 226, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L920](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-920-0) (line 920, col 0, score 1)
- [prompt-programming-language-lisp — L102](prompt-programming-language-lisp.md#^ref-d41a06d1-102-0) (line 102, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
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
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 1)
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
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
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
- [Tooling — L8](chunks/tooling.md#^ref-6cb4943e-8-0) (line 8, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L257](cross-language-runtime-polymorphism.md#^ref-c34c36a6-257-0) (line 257, col 0, score 1)
- [ecs-scheduler-and-prefabs — L434](ecs-scheduler-and-prefabs.md#^ref-c62a1815-434-0) (line 434, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L55](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-55-0) (line 55, col 0, score 1)
- [Unique Info Dump Index — L101](unique-info-dump-index.md#^ref-30ec3ba6-101-0) (line 101, col 0, score 1)
- [Promethean Agent Config DSL — L145](promethean-agent-config-dsl.md#^ref-2c00ce45-145-0) (line 145, col 0, score 0.72)
- [Tooling — L4](chunks/tooling.md#^ref-6cb4943e-4-0) (line 4, col 0, score 0.7)
- [Unique Info Dump Index — L36](unique-info-dump-index.md#^ref-30ec3ba6-36-0) (line 36, col 0, score 0.7)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [observability-infrastructure-setup — L363](observability-infrastructure-setup.md#^ref-b4e64f8c-363-0) (line 363, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
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
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
