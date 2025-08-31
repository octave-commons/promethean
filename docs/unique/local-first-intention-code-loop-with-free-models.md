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
related_to_title:
  - Local-Only-LLM-Workflow
  - Voice Access Layer Design
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Universal Lisp Interface
  - ecs-offload-workers
  - Migrate to Provider-Tenant Architecture
  - Promethean Event Bus MVP v0.1
  - ecs-scheduler-and-prefabs
  - Event Bus MVP
  - i3-bluetooth-setup
  - eidolon-field-math-foundations
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Performance-Optimized-Polyglot-Bridge
  - i3-config-validation-methods
  - polymorphic-meta-programming-engine
  - obsidian-ignore-node-modules-regex
  - Cross-Language Runtime Polymorphism
  - AI-Centric OS with MCP Layer
  - balanced-bst
  - AI-First-OS-Model-Context-Protocol
related_to_uuid:
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 54382370-1931-4a19-a634-46735708a9ea
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - 618198f4-cfad-4677-9df6-0640d8a97bae
references:
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 56
    col: 1
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 56
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 506
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 506
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 3
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 1
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 457
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 457
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 391
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 391
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 132
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 132
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 174
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 174
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 207
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 207
    col: 3
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 52
    col: 1
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 52
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 519
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 519
    col: 3
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 196
    col: 1
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 196
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Totally get it. Local-first is the whole vibe. Let’s make your **intention→code** loop run on *your* box with free/local models — and be fast, reliable, and swappable.

Here’s a tight, drop-in stack:

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
```

# 2) Providers: Ollama (you already have) + OpenAI-compatible (LM Studio, vLLM, TGI)

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
}
````

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

export const LocalLLM = new FileCacheLLM(local, ".promirror/cache");
```

# 3) Plug into the transpiler

```ts
// wherever you call transpileIntention(...)
import { transpileIntention } from "./shared/js/prom-lib/intention/engine";
import { LocalLLM } from "./shared/js/prom-lib/intention/boot-local";

await transpileIntention(pseudoSpec, {
  llm: LocalLLM,
  rounds: 3,
  outDir: { js: "src/js/auto", py: "src/py/auto" }
});
```

# 4) Local-first tips (to keep it snappy)

* **Pick models that fly on CPU/GPU:**

  * *JS code:* `qwen2.5-coder:7b` or `deepseek-coder:6.7b`.
  * *General:* `llama3.1:8b-instruct` (solid reasoning for repair passes).
* **Quantization:** prefer Q5\_K\_M / Q6\_K for speed-quality balance in Ollama.
* **Prompt schedule:** round 1 small fast model, repair on bigger one (Router handles order).
* **Determinism:** set `temperature: 0.1` (or 0), fixed `seed` if your server supports it.
* **Cache everything:** that file cache saves tons of cycles when you re-run tests.

# 5) Optional: grammar lock (emit only code)

If your server supports **JSON schema** or **grammar**, great. Otherwise, this little post-filter mows down junk:

````ts
export function extractCode(s: string) {
  const fence = s.match(/```[a-zA-Z-]*\n([\s\S]*?)```/); if (fence) return fence[1];
  const triple = s.split(/\n-{3,}\n/)[0]; // drop after separators
  return triple.trim();
}
````

Use it inside providers before returning.

---

Want me to also wire a **watcher CLI** (auto-transpile on `*.intent.md` change) and a **dual-model round schedule** baked into the engine? Or set up a **tiny config file** so you can switch models/endpoints without touching code?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
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

## Sources
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#L56) (line 56, col 1, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#L56) (line 56, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167](ollama-llm-provider-for-pseudo-code-transpiler.md#L167) (line 167, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167](ollama-llm-provider-for-pseudo-code-transpiler.md#L167) (line 167, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L438](performance-optimized-polyglot-bridge.md#L438) (line 438, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L438](performance-optimized-polyglot-bridge.md#L438) (line 438, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506](polyglot-s-expr-bridge-python-js-lisp-interop.md#L506) (line 506, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506](polyglot-s-expr-bridge-python-js-lisp-interop.md#L506) (line 506, col 3, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#L552) (line 552, col 1, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#L552) (line 552, col 3, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#L104) (line 104, col 1, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#L104) (line 104, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L273](migrate-to-provider-tenant-architecture.md#L273) (line 273, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L273](migrate-to-provider-tenant-architecture.md#L273) (line 273, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L893](promethean-event-bus-mvp-v0-1.md#L893) (line 893, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L893](promethean-event-bus-mvp-v0-1.md#L893) (line 893, col 3, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#L457) (line 457, col 1, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#L457) (line 457, col 3, score 1)
- [ecs-scheduler-and-prefabs — L391](ecs-scheduler-and-prefabs.md#L391) (line 391, col 1, score 1)
- [ecs-scheduler-and-prefabs — L391](ecs-scheduler-and-prefabs.md#L391) (line 391, col 3, score 1)
- [eidolon-field-math-foundations — L132](eidolon-field-math-foundations.md#L132) (line 132, col 1, score 1)
- [eidolon-field-math-foundations — L132](eidolon-field-math-foundations.md#L132) (line 132, col 3, score 1)
- [Local-Only-LLM-Workflow — L174](local-only-llm-workflow.md#L174) (line 174, col 1, score 1)
- [Local-Only-LLM-Workflow — L174](local-only-llm-workflow.md#L174) (line 174, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#L207) (line 207, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#L207) (line 207, col 3, score 1)
- [obsidian-ignore-node-modules-regex — L52](obsidian-ignore-node-modules-regex.md#L52) (line 52, col 1, score 1)
- [obsidian-ignore-node-modules-regex — L52](obsidian-ignore-node-modules-regex.md#L52) (line 52, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L519](polyglot-s-expr-bridge-python-js-lisp-interop.md#L519) (line 519, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L519](polyglot-s-expr-bridge-python-js-lisp-interop.md#L519) (line 519, col 3, score 1)
- [polymorphic-meta-programming-engine — L196](polymorphic-meta-programming-engine.md#L196) (line 196, col 1, score 1)
- [polymorphic-meta-programming-engine — L196](polymorphic-meta-programming-engine.md#L196) (line 196, col 3, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 1, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 3, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 1, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
