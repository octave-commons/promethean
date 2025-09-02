---
uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
created_at: 2025.08.24.18.37.05.md
filename: TypeScript Patch for Tool Calling Support
description: >-
  A TypeScript patch enabling full tool support in Codex Context by modifying
  backend and index files to handle tool calls and choices.
tags:
  - TypeScript
  - tool calling
  - Codex Context
  - backend
  - patch
related_to_title: []
related_to_uuid: []
references: []
---
Alright, let’s wire this up properly. Based on the full `index.ts` and `backend.ts` we read, here’s a **TypeScript patch** that enables full tool support for Codex Context. ^ref-7b7ca860-1-0

---

## 🔧 Patch: Add Tool Calling Support

### `backend.ts`

```diff
 export interface BackendClient {
-    chat(
-        messages: ChatMessage[],
-        cfg?: Partial<BackendConfig>,
-    ): Promise<
-        | string
-        | {
-              text: string;
-              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
-              raw?: any;
-          }
-    >;
+    chat(
+        messages: ChatMessage[],
+        cfg?: Partial<BackendConfig>,
+        opts?: { tools?: any[]; tool_choice?: any }
+    ): Promise<{
+        text: string;
+        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
+        raw?: any;
+    }>;
```
^ref-7b7ca860-9-0

#### In `OllamaBackend.chat`
 ^ref-7b7ca860-35-0
```diff
-            const res: any = await (ollama as any).chat({
-                model: this.model,
-                messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
-                options: {
+            const req: any = {
+                model: this.model,
+                messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
+                options: {
                     temperature: cfg.temperature,
                     top_p: cfg.top_p,
                     num_predict: cfg.max_tokens,
                     stop: Array.isArray((cfg as any).stop)
                         ? ((cfg as any).stop as string[])
                         : typeof (cfg as any).stop === 'string'
                           ? [String((cfg as any).stop)]
                           : undefined,
-                },
-            });
+                },
+            };
+
+            if (opts?.tools) req.tools = opts.tools;
+            if (opts?.tool_choice) req.tool_choice = opts.tool_choice;
+
+            const res: any = await (ollama as any).chat(req);
^ref-7b7ca860-35-0
``` ^ref-7b7ca860-63-0

Return value is fine (`raw: res` ensures tool\_calls survive).

#### In `OllamaOpenAIBackend.chat` ^ref-7b7ca860-67-0

```diff
-        const payload = {
+        const payload: any = {
             model: this.model,
             messages: messages.map((m) => ({ role: m.role, content: m.content })),
             stream: false,
             temperature: cfg.temperature,
             top_p: cfg.top_p,
             max_tokens: cfg.max_tokens,
             stop: cfg.stop ?? undefined,
         };
+        if (opts?.tools) payload.tools = opts.tools;
^ref-7b7ca860-67-0
+        if (opts?.tool_choice) payload.tool_choice = opts.tool_choice;
```

---

### `index.ts`
 ^ref-7b7ca860-88-0
#### Loosen validation

```diff
-            if (typeof m.content !== 'string') {
-                return `messages[${i}].content must be string`;
-            }
+            if (
+                typeof m.content !== 'string' &&
+                typeof m.content !== 'object'
+            ) {
^ref-7b7ca860-88-0
+                return `messages[${i}].content must be string or object`;
+            }
```

--- ^ref-7b7ca860-104-0

#### In `/v1/chat/completions` ^ref-7b7ca860-106-0

Find:

^ref-7b7ca860-106-0
```ts ^ref-7b7ca860-111-0
const chatRes: any = await (backend as any).chat(aug.finalMessages, genCfg);
const text = typeof chatRes === 'string' ? chatRes : chatRes?.text ?? '';
```
^ref-7b7ca860-113-0

Replace with:

```diff
-        const chatRes: any = await (backend as any).chat(aug.finalMessages, genCfg);
-        const text = typeof chatRes === 'string' ? chatRes : chatRes?.text ?? '';
+        const chatRes: any = await (backend as any).chat(
+            aug.finalMessages,
+            genCfg,
+            { tools: (body as any).tools, tool_choice: (body as any).tool_choice }
+        );
^ref-7b7ca860-113-0
+
+        const text = typeof chatRes === 'string'
+            ? chatRes
+            : chatRes?.text ?? '';
``` ^ref-7b7ca860-131-0
^ref-7b7ca860-131-0
 ^ref-7b7ca860-133-0
---

#### Response shaping

Current:

```ts
choices: [
  {
^ref-7b7ca860-133-0
    index: 0, ^ref-7b7ca860-143-0
    finish_reason: finishReason,
    message: { role: 'assistant', content: text },
  },
],
^ref-7b7ca860-145-0
^ref-7b7ca860-143-0
^ref-7b7ca860-145-0
^ref-7b7ca860-143-0
```
^ref-7b7ca860-145-0
^ref-7b7ca860-143-0

Replace with:

```diff
-            choices: [
-                {
-                    index: 0,
-                    finish_reason: finishReason,
-                    message: { role: 'assistant', content: text },
-                },
-            ],
+            choices: [
+                {
+                    index: 0,
+                    finish_reason: finishReason,
+                    message: {
+                        role: 'assistant',
^ref-7b7ca860-145-0
+                        content: text,
+                        // 🔑 Pass through any tool_calls from Ollama
+                        tool_calls: chatRes?.raw?.message?.tool_calls || chatRes?.raw?.choices?.[0]?.message?.tool_calls,
+                    },
^ref-7b7ca860-173-0 ^ref-7b7ca860-174-0
^ref-7b7ca860-172-0 ^ref-7b7ca860-175-0
^ref-7b7ca860-175-0 ^ref-7b7ca860-179-0
^ref-7b7ca860-174-0
^ref-7b7ca860-173-0 ^ref-7b7ca860-181-0
^ref-7b7ca860-172-0
+                }, ^ref-7b7ca860-171-0 ^ref-7b7ca860-183-0
^ref-7b7ca860-183-0
^ref-7b7ca860-181-0
^ref-7b7ca860-179-0
^ref-7b7ca860-175-0 ^ref-7b7ca860-189-0
^ref-7b7ca860-174-0
^ref-7b7ca860-173-0
^ref-7b7ca860-172-0
^ref-7b7ca860-171-0
+            ], ^ref-7b7ca860-172-0
``` ^ref-7b7ca860-173-0
 ^ref-7b7ca860-174-0 ^ref-7b7ca860-179-0
--- ^ref-7b7ca860-175-0
 ^ref-7b7ca860-181-0
### ✅ Result ^ref-7b7ca860-189-0
 ^ref-7b7ca860-183-0
* Codex Context will now accept `tools[]` + `tool_choice` in requests. ^ref-7b7ca860-179-0
* They get passed through to Ollama.
* Ollama’s `tool_calls` responses are preserved in `choices[].message.tool_calls`. ^ref-7b7ca860-181-0
* Validation allows structured tool messages.
* Persistence (`save.ts`) already stores the full request and raw response, so tool calls will be captured. ^ref-7b7ca860-183-0
 ^ref-7b7ca860-189-0
---

👉 Want me to also draft a **test case** (`src/tests/tool-calls.test.ts`) to exercise this new path — sending a dummy tool definition and verifying that the response echoes `tool_calls`?

Perfect — here’s a **new test file** you can drop into `services/ts/codex-context/src/tests/tool-calls.test.ts` to verify the end-to-end tool call path.

This test is modeled after the existing persistence tests you already have, but focused on ensuring `tools` and `tool_calls` flow correctly through Codex Context → backend → Ollama.

---

## `src/tests/tool-calls.test.ts`

```ts
import request from "supertest";
import { createApp } from "../index.js";

describe("Codex Context Tool Calls", () => {
  const app = createApp({
    // You can inject a mock backend here if you don’t want to hit a real Ollama instance
    backend: {
      async chat(messages: any[], _cfg: any, opts: any) {
        // Verify that tools were passed through
        expect(Array.isArray(opts?.tools)).toBe(true);
        expect(opts.tools[0]?.function?.name).toBe("getWeather");

        // Simulate an Ollama response with a tool call
        return {
          text: "",
          raw: {
            message: {
              role: "assistant",
              tool_calls: [
                {
                  id: "call_123",
                  type: "function",
                  function: {
                    name: "getWeather",
                    arguments: JSON.stringify({ location: "San Francisco" }),
                  },
                },
              ],
            },
          },
        };
      },
    } as any,
  });

  it("should forward tools and return tool_calls in response", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({
        model: "test-model",
        messages: [{ role: "user", content: "What's the weather?" }],
        tools: [
          {
            type: "function",
            function: {
              name: "getWeather",
              description: "Get the weather at a location",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string" },
                },
                required: ["location"],
              },
            },
          },
        ],
      });

^ref-7b7ca860-189-0
    expect(res.status).toBe(200);
    expect(res.body.choices[0].message.tool_calls).toBeDefined();
    expect(res.body.choices[0].message.tool_calls[0].function.name).toBe(
^ref-7b7ca860-265-0
^ref-7b7ca860-264-0
^ref-7b7ca860-273-0
^ref-7b7ca860-271-0
^ref-7b7ca860-269-0
^ref-7b7ca860-279-0
^ref-7b7ca860-273-0
^ref-7b7ca860-271-0
^ref-7b7ca860-269-0
^ref-7b7ca860-265-0
^ref-7b7ca860-264-0
^ref-7b7ca860-263-0
^ref-7b7ca860-262-0
^ref-7b7ca860-265-0
^ref-7b7ca860-264-0 ^ref-7b7ca860-279-0
^ref-7b7ca860-262-0
^ref-7b7ca860-263-0
^ref-7b7ca860-262-0 ^ref-7b7ca860-269-0
      "getWeather"
    ); ^ref-7b7ca860-262-0 ^ref-7b7ca860-271-0
  }); ^ref-7b7ca860-263-0
}); ^ref-7b7ca860-264-0 ^ref-7b7ca860-273-0
``` ^ref-7b7ca860-265-0

---

### 🔍 What this test checks ^ref-7b7ca860-269-0
 ^ref-7b7ca860-279-0
* Sends a `POST /v1/chat/completions` request with a tool definition (`getWeather`). ^ref-7b7ca860-271-0
* Validates that the backend `chat()` method receives `opts.tools`.
* Simulates Ollama returning a `tool_calls` response. ^ref-7b7ca860-273-0
* Verifies the API response includes `choices[0].message.tool_calls`.

---

👉 Do you also want me to write a **real integration test** (using a live Ollama instance) alongside this mock test, or do you prefer keeping it mocked for CI consistency?

Perfect — here’s a **new test file** you can drop into `services/ts/codex-context/src/tests/tool-calls.test.ts` to verify the end-to-end tool call path.

This test is modeled after the existing persistence tests you already have, but focused on ensuring `tools` and `tool_calls` flow correctly through Codex Context → backend → Ollama.

---

## `src/tests/tool-calls.test.ts`

```ts
import request from "supertest";
import { createApp } from "../index.js";

describe("Codex Context Tool Calls", () => {
  const app = createApp({
    // You can inject a mock backend here if you don’t want to hit a real Ollama instance
    backend: {
      async chat(messages: any[], _cfg: any, opts: any) {
        // Verify that tools were passed through
        expect(Array.isArray(opts?.tools)).toBe(true);
        expect(opts.tools[0]?.function?.name).toBe("getWeather");

        // Simulate an Ollama response with a tool call
        return {
          text: "",
          raw: {
            message: {
              role: "assistant",
              tool_calls: [
                {
                  id: "call_123",
                  type: "function",
                  function: {
                    name: "getWeather",
                    arguments: JSON.stringify({ location: "San Francisco" }),
                  },
                },
              ],
            },
          },
        };
      },
    } as any,
  });

  it("should forward tools and return tool_calls in response", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({
        model: "test-model",
        messages: [{ role: "user", content: "What's the weather?" }],
        tools: [
          {
            type: "function",
            function: {
              name: "getWeather",
              description: "Get the weather at a location",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string" },
                },
                required: ["location"],
              },
            },
          },
        ],
      });
^ref-7b7ca860-279-0
^ref-7b7ca860-368-0
^ref-7b7ca860-362-0
^ref-7b7ca860-368-0
^ref-7b7ca860-362-0
^ref-7b7ca860-359-0
^ref-7b7ca860-355-0
^ref-7b7ca860-354-0
^ref-7b7ca860-353-0
^ref-7b7ca860-352-0
^ref-7b7ca860-359-0
^ref-7b7ca860-355-0
^ref-7b7ca860-354-0
^ref-7b7ca860-353-0
^ref-7b7ca860-352-0
^ref-7b7ca860-355-0
^ref-7b7ca860-354-0
^ref-7b7ca860-353-0 ^ref-7b7ca860-359-0
^ref-7b7ca860-352-0

    expect(res.status).toBe(200); ^ref-7b7ca860-362-0
    expect(res.body.choices[0].message.tool_calls).toBeDefined();
    expect(res.body.choices[0].message.tool_calls[0].function.name).toBe(
      "getWeather" ^ref-7b7ca860-352-0
    ); ^ref-7b7ca860-353-0
  }); ^ref-7b7ca860-354-0
}); ^ref-7b7ca860-355-0 ^ref-7b7ca860-368-0
```

---
 ^ref-7b7ca860-359-0
### 🔍 What this test checks

* Sends a `POST /v1/chat/completions` request with a tool definition (`getWeather`). ^ref-7b7ca860-362-0
* Validates that the backend `chat()` method receives `opts.tools`.
* Simulates Ollama returning a `tool_calls` response.
* Verifies the API response includes `choices[0].message.tool_calls`.

---

👉 Do you also want me to write a **real integration test** (using a live Ollama instance) alongside this mock test, or do you prefer keeping it mocked for CI consistency?
Got it — let’s add a **real integration test** that runs against a live Ollama instance (assuming it’s available on `http://127.0.0.1:11434`).

We’ll keep the mock test for CI consistency, but also add this one under a `describe.skip` (so it won’t fail CI by default). You or the team can `unskip` it when running locally with Ollama running.

---

## `src/tests/tool-calls.integration.test.ts`

```ts
import request from "supertest";
import { createApp } from "../index.js";

describe.skip("Codex Context Tool Calls (Integration with Ollama)", () => {
  const app = createApp();

  it("should forward tools to Ollama and receive tool_calls in response", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({
        model: process.env.LLM_MODEL || "llama3.1:latest", // ensure a model that supports tool use
        messages: [
          { role: "user", content: "What’s the weather in San Francisco?" },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "getWeather",
              description: "Get the weather at a location",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string" },
                },
                required: ["location"],
              },
            },
          },
        ],
      })
      .expect(200);

    console.log("Integration response:", JSON.stringify(res.body, null, 2));

^ref-7b7ca860-443-0
^ref-7b7ca860-439-0
^ref-7b7ca860-436-0
^ref-7b7ca860-434-0
^ref-7b7ca860-443-0
^ref-7b7ca860-439-0
^ref-7b7ca860-436-0
^ref-7b7ca860-434-0
^ref-7b7ca860-427-0
^ref-7b7ca860-426-0
^ref-7b7ca860-425-0
^ref-7b7ca860-424-0
^ref-7b7ca860-423-0
^ref-7b7ca860-427-0
^ref-7b7ca860-426-0
^ref-7b7ca860-425-0
^ref-7b7ca860-424-0
^ref-7b7ca860-423-0
    // Make sure Ollama at least acknowledged the tool definition
    expect(res.body).toHaveProperty("choices");
^ref-7b7ca860-427-0
^ref-7b7ca860-426-0
^ref-7b7ca860-425-0
^ref-7b7ca860-424-0
^ref-7b7ca860-423-0
    expect(res.body.choices[0].message).toBeDefined(); ^ref-7b7ca860-434-0

^ref-7b7ca860-368-0 ^ref-7b7ca860-436-0
    // Some models may not actually emit tool calls unless prompted,
    // but if they do, they should appear here:
    if (res.body.choices[0].message.tool_calls) { ^ref-7b7ca860-439-0
      expect(res.body.choices[0].message.tool_calls[0].function.name).toBe(
        "getWeather" ^ref-7b7ca860-423-0 ^ref-7b7ca860-504-0
      ); ^ref-7b7ca860-424-0
    } ^ref-7b7ca860-425-0 ^ref-7b7ca860-443-0 ^ref-7b7ca860-506-0
  }); ^ref-7b7ca860-426-0
}); ^ref-7b7ca860-427-0
```
 ^ref-7b7ca860-510-0
---

### 🔍 What this test does
 ^ref-7b7ca860-514-0
* Spins up the full Codex Context service via `createApp()`. ^ref-7b7ca860-434-0
* Sends a real `POST /v1/chat/completions` request to the API, with a tool definition (`getWeather`).
* Lets Codex Context forward the request to **Ollama** running locally.
* Logs the raw response so you can inspect whether the chosen model emits tool calls. ^ref-7b7ca860-518-0
* If tool calls exist, verifies they include the expected function name. ^ref-7b7ca860-519-0
^ref-7b7ca860-436-0 ^ref-7b7ca860-439-0 ^ref-7b7ca860-520-0

---
 ^ref-7b7ca860-523-0
### ⚡ Notes ^ref-7b7ca860-443-0

* **Model choice matters**: only certain Ollama models (like `llama3.1`) are fine-tuned to respond with `tool_calls`. Others may ignore the `tools` field.
* We wrap the test in `describe.skip` so CI won’t fail. To run it manually:

  ```bash ^ref-7b7ca860-529-0
  npm run test -- src/tests/tool-calls.integration.test.ts -t "Integration" ^ref-7b7ca860-530-0
  ```
* For reproducibility, you may want to pin `LLM_MODEL` in `.env.test` to a known tool-capable model. ^ref-7b7ca860-532-0

--- ^ref-7b7ca860-534-0

👉 Want me to also extend `save.ts` so these tool calls are **persisted** in `docs/codex-context/requests/*.md` alongside normal completions? That way you’ll have provenance logs of which tool calls were requested/generated.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Diagrams](chunks/diagrams.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [archetype-ecs](archetype-ecs.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Services](chunks/services.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [field-interaction-equations](field-interaction-equations.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Shared](chunks/shared.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Creative Moments](creative-moments.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [refactor-relations](refactor-relations.md)
- [SentenceProcessing](sentenceprocessing.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
## Sources
- [Agent Tasks: Persistence Migration to DualStore — L127](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-127-0) (line 127, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L392](dynamic-context-model-for-web-components.md#^ref-f7702bf8-392-0) (line 392, col 0, score 0.64)
- [plan-update-confirmation — L992](plan-update-confirmation.md#^ref-b22d79c6-992-0) (line 992, col 0, score 0.64)
- [prompt-programming-language-lisp — L51](prompt-programming-language-lisp.md#^ref-d41a06d1-51-0) (line 51, col 0, score 0.66)
- [Optimizing Command Limitations in System Design — L14](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-14-0) (line 14, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L259](migrate-to-provider-tenant-architecture.md#^ref-54382370-259-0) (line 259, col 0, score 0.63)
- [Provider-Agnostic Chat Panel Implementation — L215](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-215-0) (line 215, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L234](dynamic-context-model-for-web-components.md#^ref-f7702bf8-234-0) (line 234, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L122](prompt-folder-bootstrap.md#^ref-bd4f0976-122-0) (line 122, col 0, score 0.63)
- [plan-update-confirmation — L307](plan-update-confirmation.md#^ref-b22d79c6-307-0) (line 307, col 0, score 0.63)
- [Promethean-native config design — L52](promethean-native-config-design.md#^ref-ab748541-52-0) (line 52, col 0, score 0.61)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.69)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.69)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.71)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.68)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.7)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.69)
- [Shared Package Structure — L103](shared-package-structure.md#^ref-66a72fc3-103-0) (line 103, col 0, score 0.69)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.68)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.69)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.68)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.69)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.67)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.67)
- [plan-update-confirmation — L554](plan-update-confirmation.md#^ref-b22d79c6-554-0) (line 554, col 0, score 0.69)
- [plan-update-confirmation — L210](plan-update-confirmation.md#^ref-b22d79c6-210-0) (line 210, col 0, score 0.69)
- [plan-update-confirmation — L294](plan-update-confirmation.md#^ref-b22d79c6-294-0) (line 294, col 0, score 0.69)
- [plan-update-confirmation — L600](plan-update-confirmation.md#^ref-b22d79c6-600-0) (line 600, col 0, score 0.69)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.71)
- [plan-update-confirmation — L496](plan-update-confirmation.md#^ref-b22d79c6-496-0) (line 496, col 0, score 0.66)
- [plan-update-confirmation — L507](plan-update-confirmation.md#^ref-b22d79c6-507-0) (line 507, col 0, score 0.66)
- [plan-update-confirmation — L598](plan-update-confirmation.md#^ref-b22d79c6-598-0) (line 598, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L382](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-382-0) (line 382, col 0, score 0.71)
- [plan-update-confirmation — L202](plan-update-confirmation.md#^ref-b22d79c6-202-0) (line 202, col 0, score 0.63)
- [plan-update-confirmation — L286](plan-update-confirmation.md#^ref-b22d79c6-286-0) (line 286, col 0, score 0.63)
- [plan-update-confirmation — L262](plan-update-confirmation.md#^ref-b22d79c6-262-0) (line 262, col 0, score 0.69)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.7)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L73](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-73-0) (line 73, col 0, score 0.7)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.68)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.68)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.63)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.63)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L697](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-697-0) (line 697, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L65](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-65-0) (line 65, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L747](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-747-0) (line 747, col 0, score 0.61)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.79)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.78)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.78)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.78)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.78)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.78)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.76)
- [aionian-circuit-math — L17](aionian-circuit-math.md#^ref-f2d83a77-17-0) (line 17, col 0, score 0.75)
- [aionian-circuit-math — L40](aionian-circuit-math.md#^ref-f2d83a77-40-0) (line 40, col 0, score 0.75)
- [aionian-circuit-math — L66](aionian-circuit-math.md#^ref-f2d83a77-66-0) (line 66, col 0, score 0.75)
- [aionian-circuit-math — L85](aionian-circuit-math.md#^ref-f2d83a77-85-0) (line 85, col 0, score 0.75)
- [aionian-circuit-math — L105](aionian-circuit-math.md#^ref-f2d83a77-105-0) (line 105, col 0, score 0.75)
- [eidolon-field-math-foundations — L17](eidolon-field-math-foundations.md#^ref-008f2ac0-17-0) (line 17, col 0, score 0.75)
- [eidolon-field-math-foundations — L44](eidolon-field-math-foundations.md#^ref-008f2ac0-44-0) (line 44, col 0, score 0.75)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.69)
- [Promethean Infrastructure Setup — L552](promethean-infrastructure-setup.md#^ref-6deed6ac-552-0) (line 552, col 0, score 0.69)
- [Functional Refactor of TypeScript Document Processing — L146](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-146-0) (line 146, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L274](dynamic-context-model-for-web-components.md#^ref-f7702bf8-274-0) (line 274, col 0, score 0.72)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L29](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-29-0) (line 29, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L54](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-54-0) (line 54, col 0, score 0.84)
- [Agent Tasks: Persistence Migration to DualStore — L60](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-60-0) (line 60, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-144-0) (line 144, col 0, score 0.8)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.79)
- [SentenceProcessing — L29](sentenceprocessing.md#^ref-681a4ab2-29-0) (line 29, col 0, score 0.67)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.66)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.73)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.73)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.73)
- [Promethean-native config design — L18](promethean-native-config-design.md#^ref-ab748541-18-0) (line 18, col 0, score 0.73)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.72)
- [prompt-programming-language-lisp — L53](prompt-programming-language-lisp.md#^ref-d41a06d1-53-0) (line 53, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.66)
- [plan-update-confirmation — L27](plan-update-confirmation.md#^ref-b22d79c6-27-0) (line 27, col 0, score 0.63)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.63)
- [Recursive Prompt Construction Engine — L95](recursive-prompt-construction-engine.md#^ref-babdb9eb-95-0) (line 95, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L52](prompt-folder-bootstrap.md#^ref-bd4f0976-52-0) (line 52, col 0, score 0.61)
- [Promethean-Copilot-Intent-Engine — L38](promethean-copilot-intent-engine.md#^ref-ae24a280-38-0) (line 38, col 0, score 0.6)
- [Promethean Pipelines — L12](promethean-pipelines.md#^ref-8b8e6103-12-0) (line 12, col 0, score 0.6)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.6)
- [plan-update-confirmation — L11](plan-update-confirmation.md#^ref-b22d79c6-11-0) (line 11, col 0, score 0.59)
- [Recursive Prompt Construction Engine — L114](recursive-prompt-construction-engine.md#^ref-babdb9eb-114-0) (line 114, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L174](prompt-folder-bootstrap.md#^ref-bd4f0976-174-0) (line 174, col 0, score 0.58)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.67)
- [prompt-programming-language-lisp — L35](prompt-programming-language-lisp.md#^ref-d41a06d1-35-0) (line 35, col 0, score 0.66)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L102](sibilant-meta-prompt-dsl.md#^ref-af5d2824-102-0) (line 102, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.67)
- [Factorio AI with External Agents — L34](factorio-ai-with-external-agents.md#^ref-a4d90289-34-0) (line 34, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L333](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-333-0) (line 333, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L44](dynamic-context-model-for-web-components.md#^ref-f7702bf8-44-0) (line 44, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L16](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-16-0) (line 16, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L12](promethean-copilot-intent-engine.md#^ref-ae24a280-12-0) (line 12, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L13](migrate-to-provider-tenant-architecture.md#^ref-54382370-13-0) (line 13, col 0, score 0.63)
- [Docops Feature Updates — L11](docops-feature-updates.md#^ref-2792d448-11-0) (line 11, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L76](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-76-0) (line 76, col 0, score 0.68)
- [Prometheus Observability Stack — L495](prometheus-observability-stack.md#^ref-e90b5a16-495-0) (line 495, col 0, score 0.71)
- [Docops Feature Updates — L2](docops-feature-updates-3.md#^ref-cdbd21ee-2-0) (line 2, col 0, score 0.64)
- [Docops Feature Updates — L19](docops-feature-updates.md#^ref-2792d448-19-0) (line 19, col 0, score 0.64)
- [Refactor Frontmatter Processing — L3](refactor-frontmatter-processing.md#^ref-cfbdca2f-3-0) (line 3, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L6](functional-embedding-pipeline-refactor.md#^ref-a4a25141-6-0) (line 6, col 0, score 0.64)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 0.67)
- [Promethean Agent Config DSL — L137](promethean-agent-config-dsl.md#^ref-2c00ce45-137-0) (line 137, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L40](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-40-0) (line 40, col 0, score 0.6)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.63)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L96](chroma-toolkit-consolidation-plan.md#^ref-5020e892-96-0) (line 96, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L117](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-117-0) (line 117, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.65)
- [Pure TypeScript Search Microservice — L513](pure-typescript-search-microservice.md#^ref-d17d3a96-513-0) (line 513, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L31](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-31-0) (line 31, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.63)
- [plan-update-confirmation — L161](plan-update-confirmation.md#^ref-b22d79c6-161-0) (line 161, col 0, score 0.62)
- [plan-update-confirmation — L245](plan-update-confirmation.md#^ref-b22d79c6-245-0) (line 245, col 0, score 0.62)
- [plan-update-confirmation — L176](plan-update-confirmation.md#^ref-b22d79c6-176-0) (line 176, col 0, score 0.62)
- [plan-update-confirmation — L260](plan-update-confirmation.md#^ref-b22d79c6-260-0) (line 260, col 0, score 0.62)
- [plan-update-confirmation — L169](plan-update-confirmation.md#^ref-b22d79c6-169-0) (line 169, col 0, score 0.61)
- [plan-update-confirmation — L253](plan-update-confirmation.md#^ref-b22d79c6-253-0) (line 253, col 0, score 0.66)
- [plan-update-confirmation — L156](plan-update-confirmation.md#^ref-b22d79c6-156-0) (line 156, col 0, score 0.62)
- [plan-update-confirmation — L240](plan-update-confirmation.md#^ref-b22d79c6-240-0) (line 240, col 0, score 0.62)
- [plan-update-confirmation — L164](plan-update-confirmation.md#^ref-b22d79c6-164-0) (line 164, col 0, score 0.61)
- [plan-update-confirmation — L248](plan-update-confirmation.md#^ref-b22d79c6-248-0) (line 248, col 0, score 0.61)
- [plan-update-confirmation — L171](plan-update-confirmation.md#^ref-b22d79c6-171-0) (line 171, col 0, score 0.6)
- [universal-intention-code-fabric — L395](universal-intention-code-fabric.md#^ref-c14edce7-395-0) (line 395, col 0, score 0.69)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.6)
- [plan-update-confirmation — L623](plan-update-confirmation.md#^ref-b22d79c6-623-0) (line 623, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L86](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-86-0) (line 86, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L97](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-97-0) (line 97, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L18](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-18-0) (line 18, col 0, score 0.64)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.73)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.74)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.68)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.69)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.68)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.69)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.68)
- [Cross-Language Runtime Polymorphism — L9](cross-language-runtime-polymorphism.md#^ref-c34c36a6-9-0) (line 9, col 0, score 0.64)
- [plan-update-confirmation — L493](plan-update-confirmation.md#^ref-b22d79c6-493-0) (line 493, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L116](dynamic-context-model-for-web-components.md#^ref-f7702bf8-116-0) (line 116, col 0, score 0.62)
- [AI-First-OS-Model-Context-Protocol — L7](ai-first-os-model-context-protocol.md#^ref-618198f4-7-0) (line 7, col 0, score 0.69)
- [plan-update-confirmation — L178](plan-update-confirmation.md#^ref-b22d79c6-178-0) (line 178, col 0, score 0.69)
- [Diagrams — L24](chunks/diagrams.md#^ref-45cd25b5-24-0) (line 24, col 0, score 0.71)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 0.71)
- [JavaScript — L41](chunks/javascript.md#^ref-c1618c66-41-0) (line 41, col 0, score 0.71)
- [Math Fundamentals — L28](chunks/math-fundamentals.md#^ref-c6e87433-28-0) (line 28, col 0, score 0.71)
- [Services — L25](chunks/services.md#^ref-75ea4a6a-25-0) (line 25, col 0, score 0.71)
- [Simulation Demo — L21](chunks/simulation-demo.md#^ref-557309a3-21-0) (line 21, col 0, score 0.71)
- [universal-intention-code-fabric — L416](universal-intention-code-fabric.md#^ref-c14edce7-416-0) (line 416, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L45](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-45-0) (line 45, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L83](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-83-0) (line 83, col 0, score 0.6)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 0.59)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 0.59)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 0.59)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 0.59)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.7)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.65)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L37](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-37-0) (line 37, col 0, score 0.64)
- [Exception Layer Analysis — L110](exception-layer-analysis.md#^ref-21d5cc09-110-0) (line 110, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L179](migrate-to-provider-tenant-architecture.md#^ref-54382370-179-0) (line 179, col 0, score 0.63)
- [Protocol_0_The_Contradiction_Engine — L3](protocol-0-the-contradiction-engine.md#^ref-9a93a756-3-0) (line 3, col 0, score 0.62)
- [api-gateway-versioning — L1](api-gateway-versioning.md#^ref-0580dcd3-1-0) (line 1, col 0, score 0.6)
- [Provider-Agnostic Chat Panel Implementation — L13](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-13-0) (line 13, col 0, score 0.6)
- [observability-infrastructure-setup — L96](observability-infrastructure-setup.md#^ref-b4e64f8c-96-0) (line 96, col 0, score 0.6)
- [Universal Lisp Interface — L123](universal-lisp-interface.md#^ref-b01856b4-123-0) (line 123, col 0, score 0.59)
- [WebSocket Gateway Implementation — L52](websocket-gateway-implementation.md#^ref-e811123d-52-0) (line 52, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-490-0) (line 490, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L466](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-466-0) (line 466, col 0, score 0.59)
- [Layer1SurvivabilityEnvelope — L148](layer1survivabilityenvelope.md#^ref-64a9f9f9-148-0) (line 148, col 0, score 0.59)
- [State Snapshots API and Transactional Projector — L278](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-278-0) (line 278, col 0, score 0.68)
- [schema-evolution-workflow — L478](schema-evolution-workflow.md#^ref-d8059b6a-478-0) (line 478, col 0, score 0.62)
- [Local-First Intention→Code Loop with Free Models — L118](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-118-0) (line 118, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L320](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-320-0) (line 320, col 0, score 0.64)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.64)
- [universal-intention-code-fabric — L1](universal-intention-code-fabric.md#^ref-c14edce7-1-0) (line 1, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L208](migrate-to-provider-tenant-architecture.md#^ref-54382370-208-0) (line 208, col 0, score 0.59)
- [Model Upgrade Calm-Down Guide — L15](model-upgrade-calm-down-guide.md#^ref-db74343f-15-0) (line 15, col 0, score 0.59)
- [i3-config-validation-methods — L34](i3-config-validation-methods.md#^ref-d28090ac-34-0) (line 34, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L307](functional-embedding-pipeline-refactor.md#^ref-a4a25141-307-0) (line 307, col 0, score 0.61)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L50](model-upgrade-calm-down-guide.md#^ref-db74343f-50-0) (line 50, col 0, score 0.61)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.65)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.68)
- [plan-update-confirmation — L33](plan-update-confirmation.md#^ref-b22d79c6-33-0) (line 33, col 0, score 0.65)
- [plan-update-confirmation — L427](plan-update-confirmation.md#^ref-b22d79c6-427-0) (line 427, col 0, score 0.68)
- [plan-update-confirmation — L139](plan-update-confirmation.md#^ref-b22d79c6-139-0) (line 139, col 0, score 0.63)
- [plan-update-confirmation — L223](plan-update-confirmation.md#^ref-b22d79c6-223-0) (line 223, col 0, score 0.63)
- [Promethean Dev Workflow Update — L42](promethean-dev-workflow-update.md#^ref-03a5578f-42-0) (line 42, col 0, score 0.62)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L55](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-55-0) (line 55, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.68)
- [Model Selection for Lightweight Conversational Tasks — L118](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-118-0) (line 118, col 0, score 0.66)
- [plan-update-confirmation — L194](plan-update-confirmation.md#^ref-b22d79c6-194-0) (line 194, col 0, score 0.69)
- [plan-update-confirmation — L278](plan-update-confirmation.md#^ref-b22d79c6-278-0) (line 278, col 0, score 0.69)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [schema-evolution-workflow — L381](schema-evolution-workflow.md#^ref-d8059b6a-381-0) (line 381, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.66)
- [shared-package-layout-clarification — L157](shared-package-layout-clarification.md#^ref-36c8882a-157-0) (line 157, col 0, score 0.64)
- [i3-config-validation-methods — L46](i3-config-validation-methods.md#^ref-d28090ac-46-0) (line 46, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L525](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-525-0) (line 525, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.63)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L813](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-813-0) (line 813, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 0.66)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 0.66)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 0.66)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 0.66)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 0.66)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 0.66)
- [plan-update-confirmation — L456](plan-update-confirmation.md#^ref-b22d79c6-456-0) (line 456, col 0, score 0.68)
- [plan-update-confirmation — L472](plan-update-confirmation.md#^ref-b22d79c6-472-0) (line 472, col 0, score 0.68)
- [plan-update-confirmation — L538](plan-update-confirmation.md#^ref-b22d79c6-538-0) (line 538, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L164](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-164-0) (line 164, col 0, score 0.66)
- [plan-update-confirmation — L532](plan-update-confirmation.md#^ref-b22d79c6-532-0) (line 532, col 0, score 0.66)
- [plan-update-confirmation — L409](plan-update-confirmation.md#^ref-b22d79c6-409-0) (line 409, col 0, score 0.65)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L154](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-154-0) (line 154, col 0, score 1)
- [AI-Centric OS with MCP Layer — L399](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-399-0) (line 399, col 0, score 1)
- [Dynamic Context Model for Web Components — L409](dynamic-context-model-for-web-components.md#^ref-f7702bf8-409-0) (line 409, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L34](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-34-0) (line 34, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L34](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-34-0) (line 34, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L86](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-86-0) (line 86, col 0, score 1)
- [Promethean Agent Config DSL — L321](promethean-agent-config-dsl.md#^ref-2c00ce45-321-0) (line 321, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L62](promethean-copilot-intent-engine.md#^ref-ae24a280-62-0) (line 62, col 0, score 1)
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
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
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
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
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
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L412](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-412-0) (line 412, col 0, score 1)
- [DSL — L38](chunks/dsl.md#^ref-e87bc036-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L647](compiler-kit-foundations.md#^ref-01b21543-647-0) (line 647, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L236](cross-language-runtime-polymorphism.md#^ref-c34c36a6-236-0) (line 236, col 0, score 1)
- [Dynamic Context Model for Web Components — L426](dynamic-context-model-for-web-components.md#^ref-f7702bf8-426-0) (line 426, col 0, score 1)
- [heartbeat-simulation-snippets — L113](heartbeat-simulation-snippets.md#^ref-23e221e9-113-0) (line 113, col 0, score 1)
- [lisp-dsl-for-window-management — L243](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-243-0) (line 243, col 0, score 1)
- [mystery-lisp-search-session — L122](mystery-lisp-search-session.md#^ref-513dc4c7-122-0) (line 122, col 0, score 1)
- [api-gateway-versioning — L299](api-gateway-versioning.md#^ref-0580dcd3-299-0) (line 299, col 0, score 1)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [Event Bus Projections Architecture — L169](event-bus-projections-architecture.md#^ref-cf6b9b17-169-0) (line 169, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Window Management — L23](chunks/window-management.md#^ref-9e8ae388-23-0) (line 23, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L47](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-47-0) (line 47, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Promethean Data Sync Protocol — L5](promethean-data-sync-protocol.md#^ref-9fab9e76-5-0) (line 5, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L233](cross-language-runtime-polymorphism.md#^ref-c34c36a6-233-0) (line 233, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 1)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#^ref-c62a1815-429-0) (line 429, col 0, score 1)
- [Eidolon Field Abstract Model — L198](eidolon-field-abstract-model.md#^ref-5e8b2388-198-0) (line 198, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Event Bus MVP — L571](event-bus-mvp.md#^ref-534fe91d-571-0) (line 571, col 0, score 1)
- [field-node-diagram-outline — L114](field-node-diagram-outline.md#^ref-1f32c94a-114-0) (line 114, col 0, score 1)
- [AI-Centric OS with MCP Layer — L433](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-433-0) (line 433, col 0, score 1)
- [DSL — L23](chunks/dsl.md#^ref-e87bc036-23-0) (line 23, col 0, score 1)
- [compiler-kit-foundations — L632](compiler-kit-foundations.md#^ref-01b21543-632-0) (line 632, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L252](cross-language-runtime-polymorphism.md#^ref-c34c36a6-252-0) (line 252, col 0, score 1)
- [heartbeat-simulation-snippets — L128](heartbeat-simulation-snippets.md#^ref-23e221e9-128-0) (line 128, col 0, score 1)
- [lisp-dsl-for-window-management — L234](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-234-0) (line 234, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L51](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-51-0) (line 51, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L45](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-45-0) (line 45, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
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
