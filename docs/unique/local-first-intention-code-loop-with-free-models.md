---
uuid: 006182ac-45a4-449d-8a60-c9bd5a3a9bff
created_at: local-first-intention-code-loop-with-free-models.md
filename: local-first-intention-code-loop
title: local-first-intention-code-loop
description: >-
  A local-first approach to running the intention→code loop using free/local
  models for fast, reliable, and swappable execution without paid APIs.
tags:
  - local-first
  - intention-code-loop
  - free-models
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
^ref-871490c7-7-0 ^ref-871490c7-22-0
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
    private baseUrl = "     // LM Studio default
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
  new OpenAICompatLLM(" "deepseek-coder:6.7b") // LM Studio fallback
]);
^ref-871490c7-83-0

export const LocalLLM = new FileCacheLLM(local, ".promirror/cache");
```
^ref-871490c7-100-0 ^ref-871490c7-101-0

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
^ref-871490c7-105-0
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
Want me to also wire a **watcher CLI** (auto-transpile on `*.intent.md` change) and a **dual-model round schedule** baked into the engine? Or set up a **tiny config file** so you can switch models/endpoints without touching code?
