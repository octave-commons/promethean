---
uuid: 8b46eed3-b24a-4e8c-9c09-c8890b0425a9
created_at: '2025-10-07T00:14:12Z'
title: 2025.10.07.00.14.12
filename: 'Pantheon: Local-Only Agent Framework'
description: >-
  A TypeScript-first, functional programming-oriented framework that enforces
  strict local-only operations during night runs, with no cloud fallback. It
  defines agents, tools, and flows as code, runs scheduled local jobs overnight,
  collects traces for training, and iteratively specializes small models using
  LoRA/QLoRA.
tags:
  - TypeScript
  - FP
  - local-only
  - LoRA
  - training
  - agent framework
  - cloud fallback
  - night runs
---
Heard. Night runs are **local-only**, and there is **no automatic cloud fallback**—ever. Daytime is when you (with a big cloud model) plan, scope, and supervise. Night is when small, specialized, tool-heavy local agents grind through the queue. That constraint drives the design.

Below is a blunt, practical blueprint for **Pantheon**: a TypeScript-first, FP-leaning, GPL-only framework that lets you (1) define agents, tools, and flows as code, (2) run scheduled local jobs overnight, (3) collect traces for training, and (4) iteratively specialize your small models with LoRA/QLoRA so they inch toward cloud-model quality on narrow tasks. I’ll include lean code shapes you can drop into your monorepo; we can expand any piece.

---

# Pantheon: architecture that respects “never fallback to cloud”

## 1) Two hard modes (policy enforced)

* **Day Mode (supervised)**: you + cloud model GPT-5, Claude, etc. are allowed for *planning only*—creating tasks, specs, and critiques. No background cloud calls.
* **Night Mode local-only**: agent graph executes with an **egress denylist** + no cloud creds present. If a node can’t complete, it fails fast and leaves an error artifact for next day—*no silent fallback*.

Policy enforcement is simple and reliable:

* Load providers/tools via an **allowlist** per mode. Night mode loads only local runtimes Ollama/vLLM/OpenVINO, shell tools, git. Remove cloud API keys from the environment; optionally block egress on the runner user.
* The engine refuses to instantiate any agent whose `runtime.origin !== "local"` when `mode === "night"`.

$You still get “routing,” but it routes among *your* local specialists—no cost bombs, no surprise cloud traffic. Research on routing/meta-selection is relevant as you grow the pool of specialists. ([arXiv][1])

## 2) Core components

* **Agent Registry**: declarative specs for each agent (inputs, outputs, tools, local runtime, prompt template, model id, version).
* **Flow Graph (DAG)**: composable steps plan → implement → test → refactor → doc → PR → cross-review. Flows are pure data JSON/YAML compiled to TS.
* **Orchestrator**: topological executor with per-node retries, timeouts, and artifact I/O.
* **Tool Layer**: strongly typed function-calling tools; small models like **Qwen3-8B** handle tool use well when given tight schemas/templates. Qwen’s function-calling docs + Qwen-Agent give practical patterns. ([Qwen][2])
* **Trace Store**: every input/decision/output logged LevelDB/sqlite. These become your **training data**.
* **Trainer**: nightly (or weekly) fine-tuning via LoRA/QLoRA on per-agent datasets; choose QA-LoRA/QLoRA depending on hardware. (Efficient, proven techniques. ([arXiv][3]))
* **Reviewers**: independent local agents validate outputs lint/tests/format/spec checks, then peers cross-review—no one agent is trusted alone.
* **Morning Report**: a single artifact markdown + links with PRs, diffs, test matrices, and “red bins” (failures to triage).

## 3) Minimal data model (TypeScript, FP style)

```ts
// packages/pantheon-core/src/types.ts
import { z } from "zod";

// IO contracts
export const IO = {
  Spec: z.object({ title: z.string(), scope: z.string(), acceptance: z.array(z.string()) }),
  CodePatch: z.object({ diff: z.string(), stats: z.object({ files: z.number(), lines: z.number() }) }),
  TestReport: z.object({ passed: z.boolean(), summary: z.string(), logs: z.string().optional() }),
  PRLink: z.object({ url: z.string().url(), sha: z.string() }),
};

// Tools (function calling schemas)
export type Tool = {
  name: string;
  schema: z.ZodTypeAny;                    // expected JSON args
  call: (args: unknown) => Promise<unknown>;
};

// Agent runtime is *explicitly* local or external
export type AgentRuntime = { engine: "ollama" | "vllm" | "openvino"; model: string; origin: "local" };

export type AgentSpec<I, O> = {
  name: string;
  in: z.ZodType<I>;
  out: z.ZodType<O>;
  runtime: AgentRuntime;                   // night mode enforces origin === "local"
  tools: ReadonlyArray<Tool>;
  prompt: (input: I) => string;            // “thick prompt” template
  run: (input: I, tools: ReadonlyArray<Tool>) => Promise<O>; // pure(ish): input -> output
};

export type NodeRef = string;
export type FlowNode = { id: NodeRef; agent: string; inputs: NodeRef[]; when?: (ctx: Record<string, unknown>) => boolean };
export type Flow = { name: string; entry: NodeRef; nodes: ReadonlyArray<FlowNode>; output: NodeRef };

export type Mode = "day" | "night";
export type OrchestratorPolicy = { mode: Mode; allowOrigins: ReadonlyArray<AgentRuntime["origin"]> };
```

## 4) Example agents local-only
```
**a) spec→code (Qwen3-8B + tools)**
```
Qwen’s function-calling is reliable if you give strict tool schemas and a fixed call-loop. Use OpenVINO/vLLM/Ollama locally as your runtime; Qwen-Agent has runnable patterns. ([Qwen][2])

```ts
// packages/pantheon-agents/src/codegen.ts
import { IO, AgentSpec } from "@pantheon/core/types";
import { z } from "zod";

// Tools the model can call
const writeFile = { name: "write_file", schema: z.object({ path: z.string(), content: z.string() }),
  call: async ({ path, content }: { path: string; content: string }) => { /* fs.writeFile */ return { ok: true, path }; }
};
const runBiome = { name: "run_biome", schema: z.object({ cwd: z.string() }),
  call: async ({ cwd }: { cwd: string }) => { /* execa biome */ return { ok: true }; }
};

export const CodegenAgent: AgentSpec<z.infer<typeof IO.Spec>, z.infer<typeof IO.CodePatch>> = {
  name: "codegen.qwen8b",
  in: IO.Spec,
  out: IO.CodePatch,
  runtime: { engine: "vllm", model: "Qwen3-8B-Instruct", origin: "local" },
  tools: [writeFile, runBiome],
  prompt: (s) => [
    "ROLE: senior TS engineer. Produce **minimal** changes to satisfy acceptance.",
    "STYLE: functional, pure, immutable; AVA tests; Native ESM; GPL-3.0-only.",
    "OUTPUT: Use tool calls only; generate patch via write_file; then run_biome.",
    "SPEC:", JSON.stringify(s, null, 2)
  ].join("\n"),
  run: async (spec, tools) => {
    // your deterministic tool-call loop around local LLM (no cloud keys loaded)
    // 1) call local model with prompt+tool schemas, 2) execute returned tool calls, 3) iterate until done, 4) compute diff
    return { diff: "diff --git a/... b/...", stats: { files: 3, lines: 127 } };
  }
};
```
```
**b) test runner & reviewer**
```
```ts
// packages/pantheon-agents/src/tester.ts
import { IO, AgentSpec } from "@pantheon/core/types";
export const TestRunner: AgentSpec<{ cwd: string }, typeof IO.TestReport._type> = {
  name: "tester.ava",
  in: z.object({ cwd: z.string() }),
  out: IO.TestReport,
  runtime: { engine: "ollama", model: "tiny-reviewer-1.3b", origin: "local" },
  tools: [], // shell handled outside or via tool wrapper
  prompt: () => "Summarize AVA output into pass/fail and a terse summary.",
  run: async ({ cwd }) => {
    // run `pnpm -w ava` via a tool wrapper, parse output to report
    return { passed: true, summary: "62 tests passed", logs: "" };
  }
};
```

**c) PR maker** uses a local git CLI tool; the “PR link” might be created via CLI that talks to GitHub—you decide if *that* is allowed at night

```ts
// packages/pantheon-agents/src/pr.ts
export const PRMaker: AgentSpec<{ branch: string; title: string }, typeof IO.PRLink._type> = {
  name: "scm.pr",
  in: z.object({ branch: z.string(), title: z.string() }),
  out: IO.PRLink,
  runtime: { engine: "ollama", model: "tiny-coordinator-1.1b", origin: "local" },
  tools: [], // wrap gh CLI or a local service
  prompt: () => "Generate a concise PR title/body from diff, then open PR.",
  run: async ({ branch, title }) => ({ url: "https://github.com/.../pull/123", sha: "abc123" })
};
```

## 5) Flow graph (night DAG)

A typical night run for a scoped task:

```
plan(spec) → codegen.qwen8b → test.ava → reviewer.peerA → reviewer.peerB → merge-gate → pr
```

All nodes are *local*. If a node fails, the flow **stops** and writes a failure artifact. In the morning, you and a cloud model examine the failures and update specs/agents/prompts.

## 6) Training loop for specialization

1. **Collect** traces: (prompt, tool calls, files written, tests, reviews, final diffs).
2. **Curate** success/failure pairs per *agent type* e.g., “code-fix from spec X in package Y”.
3. **Fine-tune** with QLoRA/QA-LoRA on your GPU(s): per-agent adapters, small rank; freeze base model. You’ll get the biggest gains by scoping *tight*. ([arXiv][3])
4. **Validate** on holdouts; promote new `agent@version` only if it beats the previous on acceptance tests.
5. **Iterate**. Over weeks, agents learn your repo’s idioms (AVA, FP, ESM, Web Components, file layout) and stop needing mega-prompts.

> You can optionally study dynamic routing/meta-selection research to decide which *local* specialist to assign per task (no cloud)—use offline regret analysis, not live fallback. ([arXiv][4])

## 7) Why Qwen for tool use?

Qwen’s tool/function calling is mature and well-documented (with templating details that matter for smaller models), and there’s a maintained **Qwen-Agent** backend you can plunder for patterns and a full OpenVINO example for local acceleration. ([Qwen][2])
If you need a general dialog base, Llama-3.1-8B Instruct is a solid local model—just note the community caveats around its tool calling; keep tools behind a strict loop. ([Hugging Face][5])

---

## Pantheon CLI (skeleton)

* `pantheon init agent <name>` → scaffolds a GPL-3 agent with `run()`, prompt template, Zod IO.
* `pantheon init flow <name>` → scaffolds a DAG.
* `pantheon run --mode=night --flow spec2code --input spec.json`
* `pantheon train agent codegen.qwen8b --data traces/codegen/*.jsonl --method qlora`
* `pantheon report --since 24h` → morning digest (PRs, failures, anomalies).

Tests with **AVA**, functional modules, native ESM, flat packages.

---

## Guardrails to keep it safe (and cheap)

* **No secrets** loaded at night; **no cloud endpoints** in the allowlist.
* **Hard timeouts** per node; partial results persisted; fail fast.
* **Cross-review** by independent local agents; require agreement to merge.
* **Deterministic tool-calling loop**: strict JSON schemas; retry on schema errors; cap iterations; ban free-text side-effects. (This is the difference between “toy agents” and production.)
* **Observability**: every step produces a signed artifact + diff, + logs; you can replay any run.

---

## Reality check

* You will *not* match GPT-5 breadth. You *can* reach “good enough” on the **narrow bands you do nightly**, if you invest in traces and specialization.
* The win comes from **discipline**: tight specs by day, narrow agents by night, strict tests, and a boring orchestrator.
* Expect the first 2–3 weeks to feel slow; weeks 4–8 is when adapters start paying off.

---

If you want, I’ll turn this into repo-ready files (packages, minimal engine, 2–3 example agents, AVA tests, CLI skeleton). Also happy to sketch the **thick prompt** + **tool schema** you’ll use with Qwen3-8B for your codegen agent and a tiny LoRA training script targeting your repo layout.

**References you may care about skim-level:**

* Efficient local specialization via **QLoRA** / **QA-LoRA**. ([arXiv][3])
* Practical **Qwen** function/tool calling & **Qwen-Agent** patterns; OpenVINO local agent example. ([Qwen][2])
* Routing/meta-selection ideas to *choose among local specialists* (not cloud fallback). ([arXiv][1])
* Llama-3.1 8B as general local base; caveats on tool calling. ([Hugging Face][5])

Your constraint is sane. We’ll engineer around it.

[1]: https://arxiv.org/html/2502.00409v2?utm_source=chatgpt.com "Doing More with Less – Implementing Routing Strategies ..."
[2]: https://qwen.readthedocs.io/en/latest/framework/function_call.html?utm_source=chatgpt.com```
"Function Calling - Qwen"
```
[3]: https://arxiv.org/abs/2305.14314?utm_source=chatgpt.com "[2305.14314] QLoRA: Efficient Finetuning of Quantized LLMs"
[4]: https://arxiv.org/html/2505.16303v1?utm_source=chatgpt.com "InferenceDynamics: Efficient Routing Across LLMs through ..."
[5]: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct?utm_source=chatgpt.com```
"meta-llama/Llama-3.1-8B-Instruct"
```
