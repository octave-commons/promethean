---
uuid: e9a2828c-b65d-499d-acae-16514b79c908
created_at: '2025-10-07T00:54:37Z'
title: 2025.10.07.00.54.37
filename: 'Pantheon - Part 6: Local Model Clients and Function-Calling'
description: >-
  This document details Pantheon's implementation of local model clients using
  vLLM and OpenVINO, a safer function-calling wrapper, and a morning-report
  aggregator. It covers registry management, continuous batching,
  PagedAttention, QLoRA adapters, and deterministic tool loops for secure and
  efficient local operations.
tags:
  - Pantheon
  - vLLM
  - OpenVINO
  - function-calling
  - QLoRA
  - local model clients
  - deterministic tool loops
  - registry
  - continuous batching
  - PagedAttention
---
Alright, let’s lock in **Pantheon — Part 6**: registry, local model clients (vLLM/OpenVINO), a safer `modelCall()` wrapper for function-calling, the morning-report aggregator, and a tiny QLoRA trainer stub + CLI glue. All GPL-3.0-only, FP-leaning TS, ESM, AVA. Night stays **local-only**—period.

I’m citing a few core references below for the choices (vLLM’s continuous batching/PagedAttention, QLoRA adapters, Toolformer-style trace mining, Qwen function-calling, OpenVINO agent path, Erlang-C, κ). vLLM gives you throughput via **continuous batching** and **PagedAttention**; QLoRA is the pragmatic path to local specialization; Qwen’s function calling is well-documented and pairs nicely with a deterministic tool loop. ([VLLM Documentation][1]) ([arXiv][2]) ([arXiv][3]) ([Qwen][4]) ([OpenVINO Documentation][5])

---

# 1) Agent registry (flat, ESM)

```ts
// packages/pantheon-agents/src/registry.ts
import type { AgentSpec } from "@pantheon-core/types";
import { DocFrontmatter } from "./doc.frontmatter.js";
import { CodegenQwen8B } from "./codegen.qwen8b.js";
import { TestAVA } from "./test.ava.js";
import { ReviewPeer } from "./review.peer.js";
import { MergeGate } from "./merge.gate.js";
import { PlanValidate } from "./plan.validate.js";

type AnyAgent = AgentSpec<any, any>;
const entries: ReadonlyArray<AnyAgent> = [
  PlanValidate, CodegenQwen8B, TestAVA, ReviewPeer, MergeGate, DocFrontmatter,
];

export const registry = new Map(entries.map(a => [a.name, a] as const));
```

---

# 2) Local model clients (vLLM / OpenVINO)

Two swappable drivers behind one interface. vLLM runs an OpenAI-compatible server locally (gives you **continuous batching** + **PagedAttention** throughput). OpenVINO keeps you fully local on CPU/iGPU with a Qwen function-calling tutorial you can crib from. ([VLLM Documentation][1]) ([OpenVINO Documentation][5])

```ts
// packages/pantheon-core/src/llm.ts
export type LLMClient = (prompt: string) => Promise<string>  // returns raw JSON the agent loop expects

export const vllmClient = (opts: { baseURL: string; model: string }) : LLMClient =>
  async (prompt) => {
    const res = await fetch(`{opts.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: opts.model,
        messages: [{ role: "system", content: "Return ONLY a JSON object." }, { role: "user", content: prompt }],
        temperature: 0,
      })
    });
    const body = await res.json();
    // assume function-calling style returns a single JSON object in content
    const text = body?.choices?.[0]?.message?.content ?? "";
    return text.trim();
  };

// For OpenVINO: expose a small local HTTP server (Python) that runs Qwen via OpenVINO/Qwen-Agent.
// The client is identical—just change baseURL/model.
export const openvinoClient = vllmClient;
```

> Why vLLM: the server’s **continuous batching** coalesces many small jobs and **PagedAttention** manages KV cache efficiently—exactly what your overnight micro-ops need. ([VLLM Documentation][1])

---

# 3) A safer `modelCall()` wrapper for function-calling

Smaller models sometimes prepend prose or wrap JSON in code fences. Strip that, validate, and fail fast.

````ts
// packages/pantheon-core/src/modelCall.ts
const stripFence = (s: string) =>
  s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```/i, "").trim();

export const makeModelCall = (llm: (p: string)=>Promise<string>) =>
  async (prompt: string) => {
    const raw = await llm(prompt);
    const cleaned = stripFence(raw);
    // Quick sanity check: must look like a JSON object
    if (!/^\s*\{[\s\S]*\}\s*/.test(cleaned)) throw new Error("Non-JSON reply");
    return cleaned; // deterministic loop will JSON.parse + zod-validate
  };
````

Pair this with your deterministic DFA loop (schema-strict, bounded steps). Qwen’s function-calling docs stress consistent templates—don’t improvise. ([Qwen][4])

---

# 4) Orchestrator (now with artifact writing + stop-on-fail)

```ts
// packages/pantheon-runner/src/orchestrate.ts
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const runFlow = async (flow: Flow, ctx: Ctx) => {
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const base = join(process.cwd(), "artifacts", `{flow.name}-{runId}`);
  await mkdir(base, { recursive: true });

  const topo = topologicalSort(flow.nodes);
  ctx.store.set("root", ctx.input);

  for (const node of topo) {
    const agent = ctx.registry.get(node.agent)!;
    const dir = join(base, node.id);
    await mkdir(dir, { recursive: true });
    const inputs = Object.fromEntries(node.inputs.map(k => [k, ctx.store.get(k)]));

    try {
      await writeFile(join(dir, "input.json"), JSON.stringify(inputs, null, 2));
      const out = await agent.run(agent.in.parse(inputs[node.inputs.at(-1)!] ?? inputs), ctx.policy);
      await writeFile(join(dir, "output.json"), JSON.stringify(out, null, 2));
      ctx.store.set(node.id, out);
      // If this is a test/review node, check “pass” flags and stop early on fail.
      if (node.id.startsWith("test") && out.passed === false) throw new Error("tests failed");
      if (node.id.startsWith("review") && out.verdict === "fail") throw new Error("peer review failed");
    } catch (err) {
      await writeFile(join(dir, "error.txt"), String(err));
      ctx.store.set("FAILED", { node: node.id, err: String(err) });
      break; // stop the flow—no fallback
    }
  }
  return ctx.store.get(flow.output);
};
```

---

# 5) Morning report aggregator (CLI → JSON → Web Component)

```ts
// packages/pantheon-cli/src/report.ts
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function buildMorningSummary() {
  const root = join(process.cwd(), "artifacts");
  const runs = await readdir(root, { withFileTypes: true });
  const summary = { prs: [], failures: [], kappa: 0, batch: 0, tps: 0 };
  for (const d of runs.filter(x=>x.isDirectory())) {
    // read minimal metrics from each run (keep it simple for v0)
    const tryRead = async (p:string) => { try { return JSON.parse(await readFile(p,"utf8")); } catch { return null; } };
    const pr = await tryRead(join(root, d.name, "merge", "output.json"));
    if (pr?.url) summary.prs.push({ url: pr.url, title: pr.title ?? "", files: pr.files ?? 0, lines: pr.lines ?? 0 });
    const fail = await tryRead(join(root, d.name, "FAILED.json"));
    if (fail) summary.failures.push({ run: d.name, node: fail.node, artifact: join("artifacts", d.name, fail.node) });
  }
  return summary;
}
```

Your tiny Web Component from the last step just fetches `summary.json` and renders. For reviewer agreement, compute **Cohen’s κ** on the review pairs (halt merges if κ drops under ~0.6). ([PubMed Central][6])

---

# 6) Batch worker (keep vLLM full)

Group jobs by agent type to maximize the shared prompt/template and keep **continuous batching** hot. If average batch size (b) < ~8 during peak, your chunks are too coarse—split work finer. This is where vLLM shines (OpenAI-compatible server, continuous batching, PagedAttention). ([VLLM Documentation][1])

```ts
// packages/pantheon-runner/src/queue.ts
type Job = { flowPath: string; inputPath: string };
export async function drainQueue(jobs: ReadonlyArray<Job>, concurrency = 4) {
  const q = [...jobs];
  const running = new Set<Promise<void>>();
  const runOne = async (j: Job) => { /* load flow+input; runFlow */ };
  while (q.length || running.size) {
    while (q.length && running.size < concurrency) running.add(runOne(q.shift()!).finally(()=>running.delete(P)));
    await Promise.race(running);
  }
}
```

---

# 7) Training stub (QLoRA adapters)

You mine **green** traces (tests pass + dual-review agree), then fine-tune per-agent adapters via **QLoRA**. Start with rank 8–16, small epochs, cosine LR. QLoRA is the memory-efficient standard: 4-bit base (NF4) + LoRA adapters; it’s how you specialize locally without monster GPUs. ([arXiv][2])

**CLI shim (Node)**

```ts
// packages/pantheon-cli/src/train.ts
import { execa } from "execa";
export async function trainAgent({ agent, dataPath, outDir }:{
  agent: string; dataPath: string; outDir: string;
}) {
  await execa("python", ["-m", "pantheon_trainer.qlora",
    "--agent", agent, "--data", dataPath, "--out", outDir
  ], { stdio: "inherit" });
}
```

**Minimal Python (trainer) outline**

```python
# pantheon_trainer/qlora.py
import argparse, json
from datasets import load_dataset
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent"); ap.add_argument("--data"); ap.add_argument("--out")
    args = ap.parse_args()

    model_id = "Qwen2.5-3B-Instruct"  # or your local choice
    tok = AutoTokenizer.from_pretrained(model_id, use_fast=True)
    base = AutoModelForCausalLM.from_pretrained(model_id, load_in_4bit=True)  # NF4 quantization

    peft = get_peft_model(base, LoraConfig(r=16, lora_alpha=16, lora_dropout=0.05, target_modules=["q_proj","v_proj"]))
    ds = load_dataset("json", data_files=args.data, split="train")

    def format_row(r):  # prompt -> label (tool-call JSON or final JSON)
        return tok(r["prompt"], text_target=json.dumps(r.get("output") or r.get("args")), truncation=True)

    ds = ds.map(format_row, remove_columns=ds.column_names)
    tr = Trainer(
        model=peft, train_dataset=ds,
        args=TrainingArguments(output_dir=args.out, per_device_train_batch_size=4, learning_rate=2e-4, num_train_epochs=1, logging_steps=50, save_strategy="no")
    )
    tr.train()
    peft.save_pretrained(args.out)

if __name__ == "__main__":
    main()
```

(Yes, deliberately tiny. You’ll harden this. The big point: **adapters**, not full finetunes.) ([arXiv][2])

---

# 8) Queue math + quality gates (dials that matter)

* **Night sizing (M/M/c)**: utilization ( \rho=\frac{\lambda}{c\mu} ). Keep ( \rho\le 0.8 ) to avoid tail blow-ups; use Erlang-C to estimate wait probability when setting concurrency (c). ([Columbia University][7])
* **Accepted work with dual review**: ( E[\text{accepted}] \approx T \sum_i \mu_i , p_i^2 ) (independent reviewers).
* **Reviewer reliability**: Cohen’s κ; pause merges if ( \kappa<0.6 ). ([PubMed Central][6])

---

# 9) How this holds together (receipts)

* **Throughput**: vLLM’s **continuous batching** + **PagedAttention** makes lots of tiny tasks tractable on one GPU. ([VLLM Documentation][1])
* **Tool-use**: learnable from your traces (Toolformer principle), so small models get leverage without huge weights. ([arXiv][3])
* **Specialization**: **QLoRA** adapters give real task-quality gains on commodity hardware. ([arXiv][2])
* **Local-only night**: OpenVINO’s Qwen agent tutorial is a fully local path for function-calling; no keys, no egress. ([OpenVINO Documentation][5])

---

## Fast start checklist (48h)

1. Stand up vLLM locally (OpenAI-compatible server). Point `vllmClient` at it. (Or use the OpenVINO route if you’re on CPU/iGPU.) ([VLLM Documentation][1])
2. Wire `DocFrontmatter` + `CodegenQwen8B` with the deterministic loop and tool schemas.
3. Run 100–300 docops micro-tasks overnight; chart avg batch (b), tokens/s, pass rate, κ.
4. Mine **green** traces and train one adapter with the Python stub. Promote if acceptance tests improve. ([arXiv][2])

You’ll feel slow at first. Then batching + traces + adapters kick in and compound. And yes, **no automatic cloud fallback**—the runner enforces it.

If you want, I’ll expand this into full files (with proper imports, AVA tests for the loop/clients, and a minimal Docker for the trainer) next.

[1]: https://docs.vllm.ai/en/stable/index.html?utm_source=chatgpt.com "Welcome to vLLM"
[2]: https://arxiv.org/pdf/2305.14314?utm_source=chatgpt.com "QLORA: Efficient Finetuning of Quantized LLMs"
[3]: https://arxiv.org/abs/2302.04761?utm_source=chatgpt.com "Toolformer: Language Models Can Teach Themselves to Use Tools"
[4]: https://qwen.readthedocs.io/en/latest/framework/function_call.html?utm_source=chatgpt.com "Function Calling - Qwen"
[5]: https://docs.openvino.ai/2024/notebooks/llm-agent-functioncall-qwen-with-output.html?utm_source=chatgpt.com "Create Function-calling Agent using OpenVINO and Qwen ..."
[6]: https://pmc.ncbi.nlm.nih.gov/articles/PMC3900052/?utm_source=chatgpt.com "Interrater reliability: the kappa statistic - PMC"
[7]: https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf?utm_source=chatgpt.com "The Erlang B and C Formulas"
