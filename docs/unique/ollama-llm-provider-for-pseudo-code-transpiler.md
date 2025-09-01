---
uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
created_at: 2025.08.09.13.08.58.md
filename: Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
description: >-
  Implements a drop-in Ollama provider for pseudo-code transpilation, handling
  model configuration, streaming responses, and code fence stripping.
tags:
  - Ollama
  - LLM
  - pseudo-code
  - transpiler
  - streaming
  - code-fences
  - model-config
related_to_title:
  - markdown-to-org-transpiler
  - ecs-scheduler-and-prefabs
  - ecs-offload-workers
  - System Scheduler with Resource-Aware DAG
  - Promethean Infrastructure Setup
  - eidolon-field-math-foundations
  - Local-Only-LLM-Workflow
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Local-First Intention→Code Loop with Free Models
  - universal-intention-code-fabric
  - Provider-Agnostic Chat Panel Implementation
  - Interop and Source Maps
  - aionian-circuit-math
  - Promethean Event Bus MVP v0.1
  - js-to-lisp-reverse-compiler
  - archetype-ecs
  - Chroma Toolkit Consolidation Plan
  - JavaScript
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Math Fundamentals
  - compiler-kit-foundations
  - Dynamic Context Model for Web Components
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - i3-config-validation-methods
  - Admin Dashboard for User Management
  - Language-Agnostic Mirror System
  - Voice Access Layer Design
  - Universal Lisp Interface
related_to_uuid:
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - b01856b4-999f-418d-8009-ade49b00eb0f
references: []
---
Ohhh nice—let’s plug **Ollama** in as the LLM backend for the pseudo-code transpiler. Here’s a drop-in provider that speaks Ollama’s `/api/chat` (streaming), strips code fences, and gives you knobs for model/temperature/stop tokens.

---

# 1) Ollama provider (drop-in)

````ts
// shared/js/prom-lib/intention/ollama.ts
import type { LLM } from "./llm";

type OllamaOpts = {
  model: string;                    // e.g. "qwen2.5-coder:14b" or "llama3.1:8b"
  host?: string;                    // default http://127.0.0.1:11434
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
    this.host = opts.host ?? "http://127.0.0.1:11434";
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

---

# 2) Wire it into the engine

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
````

---

# 3) Quick notes for smooth sailing

* Start the daemon and pull a model:

  ```
  ollama serve
  ollama pull qwen2.5-coder:14b
  ```
* If you see fences in outputs, keep `stop: ["```"]` (already set) and the “no fences” line in `system`.
* Want *faster* drafts? Use a smaller model for round 1, then repair with a bigger model. You can wrap two `OllamaLLM` instances and alternate per round.
* To target **Python** reliably, set a language hint in the planner’s prompt (already does `language=py/js`). You can also add “Use only the standard library.”

If you want, I can add:

* a tiny **health check** that pings `/api/tags` and warns if the model isn’t pulled,
* **retry with backoff** on 409 “model loading”,
* or a **dual-provider** that tries local Ollama first, then falls back to your cloud LLM.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [archetype-ecs](archetype-ecs.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [JavaScript](chunks/javascript.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
