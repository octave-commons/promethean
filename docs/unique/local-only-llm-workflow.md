---
uuid: 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
created_at: local-only-llm-workflow.md
filename: Local-Only LLM Workflow
title: Local-Only LLM Workflow
description: >-
  A minimal workflow for running code generation entirely on your local machine
  using Ollama or LM Studio without paid APIs. Configures local models and
  provides a CLI tool for watching files and generating code.
tags:
  - local
  - llm
  - workflow
  - ollama
  - lmstudio
  - code-generation
  - intention-to-code
---
Yep—totally with you. Local-only is the whole point. Let’s finish the loop so your intention→code pipeline runs **100% on your box** with **Ollama/LM Studio** and zero paid APIs. ^ref-9a8ab57e-1-0

Here’s the *smallest useful bundle* to drop in: ^ref-9a8ab57e-3-0

# 1) Config (pick your local models once)

````json
// .promirror/intent.config.json
{
  "cacheDir": ".promirror/cache",
  "rounds": 3,
  "providers": [
    { "type": "ollama", "host": " "model": "qwen2.5-coder:14b", "options": { "temperature": 0.1, "num_predict": 1200, "stop": ["```"] } },
    { "type": "openai_compat", "baseUrl": " "model": "deepseek-coder:6.7b", "params": { "temperature": 0.1, "max_tokens": 1200, "stop": ["```"] } }
  ],
  "targets": { "jsDir": "src/js/auto", "pyDir": "src/py/auto" }
}
````
^ref-9a8ab57e-7-0

Hardware cheat sheet:

* **CPU / tiny GPU**: `qwen2.5-coder:7b` or `deepseek-coder:6.7b`. ^ref-9a8ab57e-22-0
* **\~8–12GB VRAM**: `qwen2.5-coder:14b` (Q5\_K\_M in Ollama runs nicely). ^ref-9a8ab57e-23-0
* **>16GB VRAM**: go bigger if you want; same config. ^ref-9a8ab57e-24-0

Pull once: ^ref-9a8ab57e-26-0

```bash
ollama serve
ollama pull qwen2.5-coder:14b
# optional fallback server (LM Studio): pick a code model and start the local API (
```
^ref-9a8ab57e-28-0

# 2) Boot local LLM from config
 ^ref-9a8ab57e-36-0
```ts
// shared/js/prom-lib/intention/boot-local.ts
import { promises as fs } from "node:fs";
import { RouterLLM } from "./router";
import { FileCacheLLM } from "./cache";
import { OllamaLLM } from "./ollama";
import { OpenAICompatLLM } from "./openai_compat";

type Cfg = {
  cacheDir?: string;
  rounds?: number;
  providers: any[];
  targets?: { jsDir?: string; pyDir?: string };
};

export async function loadLocalLLM(cfgPath = ".promirror/intent.config.json") {
  const raw = await fs.readFile(cfgPath, "utf8");
  const cfg = JSON.parse(raw) as Cfg;

  const providers = cfg.providers.map((p) => {
    if (p.type === "ollama") return new OllamaLLM({ model: p.model, host: p.host, options: p.options });
    if (p.type === "openai_compat") return new OpenAICompatLLM(p.baseUrl, p.model, "sk-local", p.params);
    throw new Error("unknown provider " + p.type);
  });

  const router = new RouterLLM(providers);
  const llm = new FileCacheLLM(router, cfg.cacheDir ?? ".promirror/cache");
  return { llm, cfg };
}
^ref-9a8ab57e-36-0
```

# 3) CLI with watch (single file or whole folder) ^ref-9a8ab57e-69-0

```ts
// tools/intent.mjs
#!/usr/bin/env node
import path from "node:path";
import { promises as fs } from "node:fs";
import chokidar from "chokidar";
import { transpileIntention } from "../shared/js/prom-lib/intention/engine.js";
import { loadLocalLLM } from "../shared/js/prom-lib/intention/boot-local.js";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: intent <file.intent.md | dir> [--watch]");
  process.exit(1);
}
const target = args[0];
const watch = args.includes("--watch");

const { llm, cfg } = await loadLocalLLM();

async function runOne(file) {
  if (!/\.intent\.md$/i.test(file)) return;
  const md = await fs.readFile(file, "utf8");
  const res = await transpileIntention(md, {
    llm,
    rounds: cfg.rounds ?? 3,
    outDir: { js: cfg.targets?.jsDir ?? "src/js/auto", py: cfg.targets?.pyDir ?? "src/py/auto" }
  });
  const summary = res.out.map(o => `${o.lang}:${o.pass ? "PASS" : "FAIL"}`).join(" ");
  console.log(`✓ ${path.basename(file)} → ${summary}`);
  // optional: write test report
  const report = JSON.stringify(res.out, null, 2);
  const repPath = path.join(".promirror", path.basename(file).replace(/\.intent\.md$/i, ".report.json"));
  await fs.mkdir(path.dirname(repPath), { recursive: true });
  await fs.writeFile(repPath, report, "utf8");
}

async function runAll(dir) {
  const files = (await fs.readdir(dir)).filter(f => f.endsWith(".intent.md"));
  for (const f of files) await runOne(path.join(dir, f));
}

if (watch) {
  const start = async () => {
    if ((await fs.stat(target)).isDirectory()) await runAll(target); else await runOne(target);
  };
  await start();
  chokidar.watch(target, { ignoreInitial: true }).on("add", runOne).on("change", runOne);
  console.log("👀 watching", target);
} else {
  if ((await fs.stat(target)).isDirectory()) await runAll(target); else await runOne(target);
^ref-9a8ab57e-69-0
} ^ref-9a8ab57e-122-0
```
 ^ref-9a8ab57e-124-0
Add executable bit:

^ref-9a8ab57e-124-0
```bash ^ref-9a8ab57e-128-0
chmod +x tools/intent.mjs
``` ^ref-9a8ab57e-131-0
^ref-9a8ab57e-129-0
^ref-9a8ab57e-130-0

Run it:

```bash
# single spec
^ref-9a8ab57e-130-0
tools/intent.mjs specs/normalize2d.intent.md
# watch a folder
tools/intent.mjs specs --watch
^ref-9a8ab57e-139-0
``` ^ref-9a8ab57e-143-0
^ref-9a8ab57e-139-0

# 4) Minimal spec file ^ref-9a8ab57e-147-0

```md
# specs/normalize2d.intent.md
# name: normalize2d
# target: js,py
# description:
Normalize 2D vector. Avoid div-by-zero.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# constraints:
^ref-9a8ab57e-139-0
- Return zeros if both inputs are zero. ^ref-9a8ab57e-154-0
# examples:
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
^ref-9a8ab57e-158-0 ^ref-9a8ab57e-159-0
^ref-9a8ab57e-154-0 ^ref-9a8ab57e-160-0
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 } ^ref-9a8ab57e-161-0
^ref-9a8ab57e-161-0 ^ref-9a8ab57e-163-0
^ref-9a8ab57e-160-0
^ref-9a8ab57e-159-0 ^ref-9a8ab57e-165-0
^ref-9a8ab57e-158-0 ^ref-9a8ab57e-166-0
^ref-9a8ab57e-154-0 ^ref-9a8ab57e-167-0
^ref-9a8ab57e-147-0
``` ^ref-9a8ab57e-158-0
^ref-9a8ab57e-161-0 ^ref-9a8ab57e-169-0
^ref-9a8ab57e-160-0
^ref-9a8ab57e-159-0
^ref-9a8ab57e-158-0 ^ref-9a8ab57e-172-0
^ref-9a8ab57e-154-0
^ref-9a8ab57e-147-0 ^ref-9a8ab57e-174-0
 ^ref-9a8ab57e-159-0 ^ref-9a8ab57e-163-0 ^ref-9a8ab57e-169-0
You’ll get `src/js/auto/normalize2d.js` and `src/py/auto/normalize2d.py` written locally, no external APIs, plus a `.report.json` with pass/fail per example. ^ref-9a8ab57e-160-0
 ^ref-9a8ab57e-161-0 ^ref-9a8ab57e-165-0 ^ref-9a8ab57e-177-0
# 5) Quality + speed knobs (still free) ^ref-9a8ab57e-166-0 ^ref-9a8ab57e-172-0
 ^ref-9a8ab57e-163-0 ^ref-9a8ab57e-167-0 ^ref-9a8ab57e-179-0
* **Two-stage schedule**: keep `providers` ordered small→big so you draft fast and repair with a stronger model. ^ref-9a8ab57e-174-0 ^ref-9a8ab57e-180-0
* **Aggressive caching**: the `FileCacheLLM` stops recomputation when you jiggle other code around. ^ref-9a8ab57e-165-0 ^ref-9a8ab57e-169-0
* **Determinism**: set temperature \~0.1 (or 0) and, if your server supports it, a fixed seed. ^ref-9a8ab57e-166-0
* **Grammar-lite**: you already have stop tokens; if your local server supports JSON/regex grammars, wire it in later. ^ref-9a8ab57e-167-0 ^ref-9a8ab57e-177-0 ^ref-9a8ab57e-183-0
 ^ref-9a8ab57e-172-0 ^ref-9a8ab57e-184-0
If you want, I can also: ^ref-9a8ab57e-169-0 ^ref-9a8ab57e-179-0
 ^ref-9a8ab57e-174-0 ^ref-9a8ab57e-180-0
* wire **property testing** (JS fast-check / Python hypothesis) as an extra gate,
* add a **JS wrapper for Python** so expensive numerics live in Py but import like normal JS, ^ref-9a8ab57e-172-0 ^ref-9a8ab57e-188-0
* or hook this into your **mirror engine** so each passing intention updates your JS/TS/Lisp trees automatically.
