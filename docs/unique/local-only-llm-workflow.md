---
uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
created_at: 2025.08.09.13.08.84.md
filename: Local-Only-LLM-Workflow
description: >-
  Configures local LLMs (Ollama/LM Studio) for code generation without paid
  APIs, enabling 100% self-hosted intention→code pipelines with minimal setup.
tags:
  - local
  - ollama
  - lm-studio
  - code-generation
  - self-hosted
  - intent-to-code
  - pipeline
related_to_title:
  - universal-intention-code-fabric
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Performance-Optimized-Polyglot-Bridge
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Promethean Infrastructure Setup
  - markdown-to-org-transpiler
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - Local-First Intention→Code Loop with Free Models
  - i3-config-validation-methods
  - shared-package-layout-clarification
  - Chroma Toolkit Consolidation Plan
  - js-to-lisp-reverse-compiler
  - Interop and Source Maps
  - compiler-kit-foundations
  - eidolon-field-math-foundations
  - archetype-ecs
  - JavaScript
  - Migrate to Provider-Tenant Architecture
  - Dynamic Context Model for Web Components
  - Admin Dashboard for User Management
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Post-Linguistic Transhuman Design Frameworks
  - Universal Lisp Interface
  - Voice Access Layer Design
  - Language-Agnostic Mirror System
related_to_uuid:
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 58191024-d04a-4520-8aae-a18be7b94263
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 54382370-1931-4a19-a634-46735708a9ea
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - d2b3628c-6cad-4664-8551-94ef8280851d
references: []
---
Yep—totally with you. Local-only is the whole point. Let’s finish the loop so your intention→code pipeline runs **100% on your box** with **Ollama/LM Studio** and zero paid APIs.

Here’s the *smallest useful bundle* to drop in:

# 1) Config (pick your local models once)

````json
// .promirror/intent.config.json
{
  "cacheDir": ".promirror/cache",
  "rounds": 3,
  "providers": [
    { "type": "ollama", "host": "http://127.0.0.1:11434", "model": "qwen2.5-coder:14b", "options": { "temperature": 0.1, "num_predict": 1200, "stop": ["```"] } },
    { "type": "openai_compat", "baseUrl": "http://127.0.0.1:1234/v1", "model": "deepseek-coder:6.7b", "params": { "temperature": 0.1, "max_tokens": 1200, "stop": ["```"] } }
  ],
  "targets": { "jsDir": "src/js/auto", "pyDir": "src/py/auto" }
}
````

Hardware cheat sheet:

* **CPU / tiny GPU**: `qwen2.5-coder:7b` or `deepseek-coder:6.7b`.
* **\~8–12GB VRAM**: `qwen2.5-coder:14b` (Q5\_K\_M in Ollama runs nicely).
* **>16GB VRAM**: go bigger if you want; same config.

Pull once:

```bash
ollama serve
ollama pull qwen2.5-coder:14b
# optional fallback server (LM Studio): pick a code model and start the local API (http://127.0.0.1:1234/v1)
```

# 2) Boot local LLM from config

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
```

# 3) CLI with watch (single file or whole folder)

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
}
```

Add executable bit:

```bash
chmod +x tools/intent.mjs
```

Run it:

```bash
# single spec
tools/intent.mjs specs/normalize2d.intent.md
# watch a folder
tools/intent.mjs specs --watch
```

# 4) Minimal spec file

```md
# specs/normalize2d.intent.md
# name: normalize2d
# target: js,py
# description:
Normalize 2D vector. Avoid div-by-zero.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# constraints:
- Return zeros if both inputs are zero.
# examples:
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 }
```

You’ll get `src/js/auto/normalize2d.js` and `src/py/auto/normalize2d.py` written locally, no external APIs, plus a `.report.json` with pass/fail per example.

# 5) Quality + speed knobs (still free)

* **Two-stage schedule**: keep `providers` ordered small→big so you draft fast and repair with a stronger model.
* **Aggressive caching**: the `FileCacheLLM` stops recomputation when you jiggle other code around.
* **Determinism**: set temperature \~0.1 (or 0) and, if your server supports it, a fixed seed.
* **Grammar-lite**: you already have stop tokens; if your local server supports JSON/regex grammars, wire it in later.

If you want, I can also:

* wire **property testing** (JS fast-check / Python hypothesis) as an extra gate,
* add a **JS wrapper for Python** so expensive numerics live in Py but import like normal JS,
* or hook this into your **mirror engine** so each passing intention updates your JS/TS/Lisp trees automatically.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
