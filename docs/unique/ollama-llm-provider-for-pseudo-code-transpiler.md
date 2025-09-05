---
uuid: cce2f5f9-557e-4d35-9dff-5c29ca71efd2
created_at: ollama-llm-provider-for-pseudo-code-transpiler.md
filename: ollama-llm-provider-for-pseudo-code-transpiler
title: ollama-llm-provider-for-pseudo-code-transpiler
description: >-
  A drop-in Ollama LLM provider for transpiling pseudo-code into code. Handles
  model selection, temperature, and custom stop sequences while stripping code
  fences from Ollama's streaming responses.
tags:
  - ollama
  - llm
  - pseudo-code
  - transpiler
  - streaming
  - code-generation
  - model-config
  - temperature
  - stop-sequences
related_to_uuid:
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
  - 2478e18c-f621-4b0c-a4c5-9637d213cccf
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - c2ba3d27-5b24-4345-9cf2-5cf296f8b03d
  - a23de044-17e0-45f0-bba7-d870803cbfed
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 4c63f2be-b5cd-479c-ad0d-ca26424162f7
  - f4767ec9-7363-4ca0-ad88-ccc624247a3b
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 5becb573-0a78-486b-8d3c-199b3c7a79ec
  - 3657117f-241d-4ab9-a717-4a3f584071fc
  - 95410f6e-dabb-4560-80a8-1ed4fd9c3d3b
  - 6f13f134-7536-4bc3-b695-5aaa2906bb9d
  - 6ff8d80e-7070-47b5-898c-ee506e353471
  - 177c260c-39b2-4450-836d-1e87c0bd0035
related_to_title:
  - WebSocket Gateway Implementation
  - heartbeat-fragment-demo
  - Local-Only LLM Workflow
  - Cross-Language Runtime Polymorphism
  - RAG UI Panel with Qdrant and PostgREST
  - chroma-toolkit-consolidation-plan
  - observability-infrastructure-setup
  - Komorebi Group Manager
  - board-walk-2025-08-11
  - Universal Lisp Interface
  - lisp-compiler-integration
  - ecs-scheduler
  - dynamic-context-model-for-web-components
  - Agent Reflections and Prompt Evolution
  - language-agnostic-mirror-system
  - model-selection-for-lightweight-conversational-tasks
  - shared-package-layout-clarification
  - provider-agnostic-chat-panel-implementation
  - universal-intention-code-fabric
references: []
---
Ohhh nice—let’s plug **Ollama** in as the LLM backend for the pseudo-code transpiler. Here’s a drop-in provider that speaks Ollama’s `/api/chat` (streaming), strips code fences, and gives you knobs for model/temperature/stop tokens. ^ref-b362e12e-1-0

---

# 1) Ollama provider (drop-in)

````ts
// shared/js/prom-lib/intention/ollama.ts
import type { LLM } from "./llm";

type OllamaOpts = {
  model: string;                    // e.g. "qwen2.5-coder:14b" or "llama3.1:8b"
  host?: string;                    // default 
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
    num_ctx?: number;
    seed?: number;
    stop?: string[];               // extra stop sequences
  };
  timeoutMs?: number;               // fetch timeout
};

export class OllamaLLM implements LLM {
  private host: string;
  private model: string;
  private options: OllamaOpts["options"];
  private timeoutMs: number;

  constructor(opts: OllamaOpts) {
    this.model = opts.model;
    this.host = opts.host ?? "
    this.options = {
      temperature: 0.2,
      top_p: 0.95,
      num_predict: 512,
      stop: ["```", "</code>", "END_OF_CODE"],
      ...opts.options,
    };
    this.timeoutMs = opts.timeoutMs ?? 90_000;
  }

  async generate({ system, prompt }: { system: string; prompt: string }): Promise<string> {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: [
            { role: "system", content: `${system}\nReturn ONLY the code. No fences.` },
            { role: "user", content: prompt },
          ],
          options: this.options,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`ollama http ${res.status} ${await res.text().catch(()=>"<no body>")}`);
      }

      // Ollama streams NDJSON lines; each line is {"message":{"content":"..."}, ...} and ends with {"done":true}
      const reader = res.body.getReader();
      const td = new TextDecoder();
      let buf = "";
      let out = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += td.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          let obj: any;
          try { obj = JSON.parse(line); } catch { continue; }
          if (obj.done) break;
          const chunk = obj?.message?.content ?? "";
          out += chunk;
        }
      }
      return stripFences(out.trim());
    } finally {
      clearTimeout(to);
    }
  }
}

function stripFences(s: string): string {
  // remove ```lang ... ``` wrappers or stray backticks
  const fence = s.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
  if (fence) return fence[1];
  return s.replace(/^```|```$/g, "");
}
````
^ref-b362e12e-7-0

---

# 2) Wire it into the engine
 ^ref-b362e12e-108-0
````ts
// somewhere in your app
import { transpileIntention } from "./shared/js/prom-lib/intention/engine";
import { OllamaLLM } from "./shared/js/prom-lib/intention/ollama";

const llm = new OllamaLLM({
  model: "qwen2.5-coder:14b",      // pick your local code model
  // model: "deepseek-coder:6.7b",  // or any you’ve pulled with `ollama pull ...`
  options: { temperature: 0.1, num_predict: 800, stop: ["```"] },
});

const pseudo = `
# name: normalize2d
# target: js,py
# description:
Normalize (x,y) -> mag,nx,ny ; avoid div-by-zero.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# examples:
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 }
`;

const result = await transpileIntention(pseudo, {
  llm,
  rounds: 3,
  outDir: { js: "src/js/auto", py: "src/py/auto" },
});
console.log(result.out.map(o => ({ lang: o.lang, pass: o.pass })));
^ref-b362e12e-108-0
````

---

# 3) Quick notes for smooth sailing ^ref-b362e12e-143-0

* Start the daemon and pull a model: ^ref-b362e12e-145-0

  ```
  ollama serve
^ref-b362e12e-145-0 ^ref-b362e12e-149-0
  ollama pull qwen2.5-coder:14b ^ref-b362e12e-150-0
  ``` ^ref-b362e12e-151-0
* If you see fences in outputs, keep `stop: ["```"]` (already set) and the “no fences” line in `system`.
* Want *faster* drafts? Use a smaller model for round 1, then repair with a bigger model. You can wrap two `OllamaLLM` instances and alternate per round. ^ref-b362e12e-153-0
* To target **Python** reliably, set a language hint in the planner’s prompt (already does `language=py/js`). You can also add “Use only the standard library.”
 ^ref-b362e12e-155-0
If you want, I can add: ^ref-b362e12e-156-0
 ^ref-b362e12e-157-0
* a tiny **health check** that pings `/api/tags` and warns if the model isn’t pulled,
* **retry with backoff** on 409 “model loading”,
* or a **dual-provider** that tries local Ollama first, then falls back to your cloud LLM.
     signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: [
            { role: "system", content: `${system}\nReturn ONLY the code. No fences.` },
            { role: "user", content: prompt },
          ],
          options: this.options,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`ollama http ${res.status} ${await res.text().catch(()=>"<no body>")}`);
      }

      // Ollama streams NDJSON lines; each line is {"message":{"content":"..."}, ...} and ends with {"done":true}
      const reader = res.body.getReader();
      const td = new TextDecoder();
      let buf = "";
      let out = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += td.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          let obj: any;
          try { obj = JSON.parse(line); } catch { continue; }
          if (obj.done) break;
          const chunk = obj?.message?.content ?? "";
          out += chunk;
        }
      }
      return stripFences(out.trim());
    } finally {
      clearTimeout(to);
    }
  }
}

function stripFences(s: string): string {
  // remove ```lang ... ``` wrappers or stray backticks
  const fence = s.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
  if (fence) return fence[1];
  return s.replace(/^```|```$/g, "");
}
````
^ref-b362e12e-7-0

---

# 2) Wire it into the engine
 ^ref-b362e12e-108-0
````ts
// somewhere in your app
import { transpileIntention } from "./shared/js/prom-lib/intention/engine";
import { OllamaLLM } from "./shared/js/prom-lib/intention/ollama";

const llm = new OllamaLLM({
  model: "qwen2.5-coder:14b",      // pick your local code model
  // model: "deepseek-coder:6.7b",  // or any you’ve pulled with `ollama pull ...`
  options: { temperature: 0.1, num_predict: 800, stop: ["```"] },
});

const pseudo = `
# name: normalize2d
# target: js,py
# description:
Normalize (x,y) -> mag,nx,ny ; avoid div-by-zero.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# examples:
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 }
`;

const result = await transpileIntention(pseudo, {
  llm,
  rounds: 3,
  outDir: { js: "src/js/auto", py: "src/py/auto" },
});
console.log(result.out.map(o => ({ lang: o.lang, pass: o.pass })));
^ref-b362e12e-108-0
````

---

# 3) Quick notes for smooth sailing ^ref-b362e12e-143-0

* Start the daemon and pull a model: ^ref-b362e12e-145-0

  ```
  ollama serve
^ref-b362e12e-145-0 ^ref-b362e12e-149-0
  ollama pull qwen2.5-coder:14b ^ref-b362e12e-150-0
  ``` ^ref-b362e12e-151-0
* If you see fences in outputs, keep `stop: ["```"]` (already set) and the “no fences” line in `system`.
* Want *faster* drafts? Use a smaller model for round 1, then repair with a bigger model. You can wrap two `OllamaLLM` instances and alternate per round. ^ref-b362e12e-153-0
* To target **Python** reliably, set a language hint in the planner’s prompt (already does `language=py/js`). You can also add “Use only the standard library.”
 ^ref-b362e12e-155-0
If you want, I can add: ^ref-b362e12e-156-0
 ^ref-b362e12e-157-0
* a tiny **health check** that pings `/api/tags` and warns if the model isn’t pulled,
* **retry with backoff** on 409 “model loading”,
* or a **dual-provider** that tries local Ollama first, then falls back to your cloud LLM.
