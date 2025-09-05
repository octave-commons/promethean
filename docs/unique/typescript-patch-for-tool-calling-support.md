---
uuid: e4317155-7fa6-44e8-8aee-b72384581790
created_at: typescript-patch-for-tool-calling-support.md
filename: TypeScript Patch for Tool Calling Support
title: TypeScript Patch for Tool Calling Support
description: >-
  This TypeScript patch adds tool calling capabilities to the Codex Context
  backend by modifying the chat interface to accept tool parameters and ensuring
  tool calls are properly handled across different backend implementations.
tags:
  - TypeScript
  - tool calling
  - backend integration
  - Codex Context
  - patch
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
^ref-7b7ca860-9-0 ^ref-7b7ca860-32-0

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

^ref-7b7ca860-106-0 ^ref-7b7ca860-110-0
```ts ^ref-7b7ca860-111-0
const chatRes: any = await (backend as any).chat(aug.finalMessages, genCfg);
const text = typeof chatRes === 'string' ? chatRes : chatRes?.text ?? '';
```
^ref-7b7ca860-113-0 ^ref-7b7ca860-115-0

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
^ref-7b7ca860-160-0
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

--- ^ref-7b7ca860-417-0
 ^ref-7b7ca860-359-0
### 🔍 What this test checks

* Sends a `POST /v1/chat/completions` request with a tool definition (`getWeather`). ^ref-7b7ca860-362-0
* Validates that the backend `chat()` method receives `opts.tools`.
* Simulates Ollama returning a `tool_calls` response.
* Verifies the API response includes `choices[0].message.tool_calls`.

---

👉 Do you also want me to write a **real integration test** (using a live Ollama instance) alongside this mock test, or do you prefer keeping it mocked for CI consistency?
Got it — let’s add a **real integration test** that runs against a live Ollama instance (assuming it’s available on `

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
 ^ref-7b7ca860-534-0
--- ^ref-7b7ca860-534-0

👉 Want me to also extend `save.ts` so these tool calls are **persisted** in `docs/codex-context/requests/*.md` alongside normal completions? That way you’ll have provenance logs of which tool calls were requested/generated.
