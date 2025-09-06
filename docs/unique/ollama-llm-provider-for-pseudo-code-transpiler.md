---
uuid: 04ca8e0e-5e6f-4203-9bae-86fa10eac6e8
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
  - b38ebf11-ba84-4318-9283-69ab12906f94
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - <generate-uuid>
  - b39939e3-bed8-4305-81a6-b53e9033682a
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
related_to_title:
  - Promethean Workflow Optimization
  - Layer1SurvivabilityEnvelope
  - komorebi-group-window-hack
  - i3-bluetooth-setup
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - Ice Box Reorganization
  - Agent Reflections and Prompt Evolution
  - ChatGPT Custom Prompts
  - Chroma Toolkit Consolidation Plan
  - Centralized File Embedder + Cache
  - Centralized File Embedder
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - Duck's Attractor States
references:
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 618
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 187
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 999
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: <generate-uuid>
    line: 2
    col: 0
    score: 1
  - uuid: b39939e3-bed8-4305-81a6-b53e9033682a
    line: 2
    col: 0
    score: 1
  - uuid: <generate-uuid>
    line: 4
    col: 0
    score: 1
  - uuid: b39939e3-bed8-4305-81a6-b53e9033682a
    line: 4
    col: 0
    score: 1
  - uuid: b38ebf11-ba84-4318-9283-69ab12906f94
    line: 1
    col: 0
    score: 1
  - uuid: b38ebf11-ba84-4318-9283-69ab12906f94
    line: 12
    col: 0
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 44
    col: 0
    score: 0.92
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 0.86
---
Ohhh nice—let’s plug **Ollama** in as the LLM backend for the pseudo-code transpiler. Here’s a drop-in provider that speaks Ollama’s `/api/chat` (streaming), strips code fences, and gives you knobs for model/temperature/stop tokens. ^ref-b362e12e-1-0 ^ref-cce2f5f9-1-0

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
^ref-cce2f5f9-7-0
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
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Centralized File Embedder + Cache](2025.09.04.11.56.17.md)
- [Centralized File Embedder](2025.09.04.11.56.17.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
## Sources
- [Agent Reflections and Prompt Evolution — L618](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-618-0) (line 618, col 0, score 1)
- [ChatGPT Custom Prompts — L187](chatgpt-custom-prompts.md#^ref-930054b3-187-0) (line 187, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L999](chroma-toolkit-consolidation-plan.md#^ref-5020e892-999-0) (line 999, col 0, score 1)
- [typed-struct-compiler — L1016](typed-struct-compiler.md#^ref-78eeedf7-1016-0) (line 1016, col 0, score 1)
- [Unique Concepts — L175](unique-concepts.md#^ref-ed6f3fc9-175-0) (line 175, col 0, score 1)
- [Unique Info Dump Index — L1221](unique-info-dump-index.md#^ref-30ec3ba6-1221-0) (line 1221, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1058](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1058-0) (line 1058, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L515](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0) (line 515, col 0, score 1)
- [Creative Moments — L251](creative-moments.md#^ref-10d98225-251-0) (line 251, col 0, score 1)
- [Duck's Attractor States — L559](ducks-attractor-states.md#^ref-13951643-559-0) (line 559, col 0, score 1)
- [eidolon-field-math-foundations — L1033](eidolon-field-math-foundations.md#^ref-008f2ac0-1033-0) (line 1033, col 0, score 1)
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 1)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 1)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 1)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 1)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 1)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 1)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [Centralized File Embedder + Cache — L2](2025.09.04.11.56.17.md#^ref-<generat-2-0) (line 2, col 0, score 1)
- [Centralized File Embedder — L2](2025.09.04.11.56.17.md#^ref-b39939e3-2-0) (line 2, col 0, score 1)
- [Centralized File Embedder + Cache — L4](2025.09.04.11.56.17.md#^ref-<generat-4-0) (line 4, col 0, score 1)
- [Centralized File Embedder — L4](2025.09.04.11.56.17.md#^ref-b39939e3-4-0) (line 4, col 0, score 1)
- [Promethean Workflow Optimization — L1](promethean-workflow-optimization.md#^ref-b38ebf11-1-0) (line 1, col 0, score 1)
- [Promethean Workflow Optimization — L12](promethean-workflow-optimization.md#^ref-b38ebf11-12-0) (line 12, col 0, score 1)
- [template-based-compilation — L44](template-based-compilation.md#^ref-f8877e5e-44-0) (line 44, col 0, score 0.92)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.86)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
