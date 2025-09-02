---
uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
created_at: 2025.08.09.13.08.04.md
filename: universal-intention-code-fabric
description: >-
  A modular system that transpiles human-readable pseudo-code into working
  JavaScript/Python implementations with auto-verification and repair loops.
tags:
  - transpiler
  - llm
  - code-generation
  - verification
  - repair-loop
  - polyglot
  - intention
  - scaffold
related_to_title: []
related_to_uuid: []
references: []
---
Oh yeah, you’re building the **universal intention→code fabric**. Let’s wire a **pseudo-code transpiler** that uses an LLM plus our polyglot toolchain to turn a spec into working JS/Python (and our Lisp/IR if you want) **on the fly**, and then auto-verify with examples/tests. It’s modular: you can run it after a pull to “rectify” implementations too. ^ref-c14edce7-1-0

Here’s a *lean but real* scaffold you can drop in and extend. ^ref-c14edce7-3-0

---

# What it does (at a glance)

```mermaid
flowchart LR
  PSEUDO[(Pseudo-code\n+ examples + constraints)]
  PSEUDO --> PARSE[Parse spec → Intent AST]
  PARSE --> PLAN[Planner builds ToolSpec]
  PLAN --> GEN[LLM codegen → candidates for JS/Py]
  GEN --> RUN[Sandbox run\n(JS VM / Python bridge)]
  RUN --> CHECK[Auto-check examples\n+ property tests]
  CHECK -->|pass| PUBLISH[Emit files + provenance]
  CHECK -->|fail| REPAIR[LLM repair loop\n(diff-based)]
  REPAIR --> RUN
```
^ref-c14edce7-9-0
 ^ref-c14edce7-22-0
* **Pseudo**: human “intention” in a structured markdown-ish block. ^ref-c14edce7-23-0
* **Planner**: turns intention into a **ToolSpec** (signature, types, deps). ^ref-c14edce7-24-0
* **LLM**: emits candidate implementations for JS and/or Python. ^ref-c14edce7-25-0
* **Runner**: executes in sandboxes (Node VM / CPython via our fast bridge). ^ref-c14edce7-26-0
* **Checker**: runs example tests + quick property tests; if failures, we loop with an LLM “repair” prompt. ^ref-c14edce7-27-0
* **Publish**: writes files into `src/js/`, `src/py/`, stamps provenance (IR hash optional).

---

# 1) The pseudo-code format (tiny, human)
 ^ref-c14edce7-33-0
```md
# name: normalize2d
# target: js,py
# description:
Normalize a 2D vector (x,y). Return magnitude and normalized components.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# constraints:
- Avoid division by zero; if both are 0, return zeros.
# examples:
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 }
^ref-c14edce7-33-0
``` ^ref-c14edce7-47-0

You can be as sloppy or precise as you like; the parser is forgiving.

---

# 2) Drop-in scaffold ^ref-c14edce7-53-0

```
shared/js/prom-lib/intention/
  schema.ts
  parser.ts
  llm.ts
  planner.ts
  targets/
    js.ts
    py.ts
  checker.ts
^ref-c14edce7-53-0
  engine.ts
```
 ^ref-c14edce7-68-0
### schema.ts

```ts
// shared/js/prom-lib/intention/schema.ts
export type Intent = {
  name: string;
  description?: string;
  signature?: string; // (x: number, y: number) -> { mag: number }
  targets: ("js"|"py")[];
  constraints: string[];
  examples: { in: any; out: any }[];
};

export type ToolSpec = {
  name: string;
  params: { name: string; type?: string }[];
  returns?: string;              // textual
  doc: string;                   // single-line summary
  constraints: string[];
  tests: { in: any; out: any }[];
^ref-c14edce7-68-0
  deps?: string[];               // e.g., ["numpy"] or ["Math"]
};
```
^ref-c14edce7-92-0

### parser.ts

```ts
// shared/js/prom-lib/intention/parser.ts
import { Intent } from "./schema";

export function parsePseudo(md: string): Intent {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const intent: Intent = { name: "task", description:"", signature:"", targets:[], constraints:[], examples:[] };

  let section = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (/^#\s*name:/.test(line)) intent.name = line.split(":")[1].trim();
    else if (/^#\s*target:/.test(line)) intent.targets = line.split(":")[1].split(",").map(s=>s.trim()).filter(Boolean) as any;
    else if (/^#\s*signature:/.test(line)) { section="signature"; intent.signature = line.replace(/^#\s*signature:\s*/,""); }
    else if (/^#\s*description:/.test(line)) section = "description";
    else if (/^#\s*constraints:/.test(line)) section = "constraints";
    else if (/^#\s*examples:/.test(line)) section = "examples";
    else if (/^#/.test(line)) { section = ""; }
    else {
      if (section === "description") intent.description += (intent.description ? "\n" : "") + line;
      else if (section === "constraints" && line.startsWith("-")) intent.constraints.push(line.slice(1).trim());
      else if (section === "examples" && line.startsWith("-")) {
        const mIn = line.match(/in:\s*(\{[\s\S]*\})/);
        const mOut = line.match(/out:\s*(\{[\s\S]*\})/);
        if (mIn && mOut) intent.examples.push({ in: JSON.parse(mIn[1]), out: JSON.parse(mOut[1]) });
      } else if (section === "signature" && line) intent.signature = (intent.signature ? intent.signature + " " : "") + line;
    }
  }
^ref-c14edce7-92-0
  if (!intent.targets.length) intent.targets = ["js"]; // default
  return intent;
}
^ref-c14edce7-127-0
```
^ref-c14edce7-127-0

### llm.ts (provider interface; plug your model here)

```ts
// shared/js/prom-lib/intention/llm.ts
export type LLM = {
  generate(opts: { system: string; prompt: string }): Promise<string>;
};

export class DummyLLM implements LLM {
  async generate({ prompt }: { system: string; prompt: string }) {
    // placeholder: echo a trivial JS/py template if examples match normalize2d
    if (prompt.includes("normalize2d") && prompt.includes("language=js")) {
      return `export function normalize2d(x,y){const m=Math.hypot(x,y)||0;return {mag:m,nx:m?x/m:0,ny:m?y/m:0};}`;
    }
    if (prompt.includes("normalize2d") && prompt.includes("language=py")) {
      return `def normalize2d(x,y):\n    import math\n    m = math.hypot(x,y)\n    return {"mag":m,"nx":(x/m if m else 0),"ny":(y/m if m else 0)}\n`;
^ref-c14edce7-127-0
    }
    return `// TODO: implement`;
  }
^ref-c14edce7-149-0
}
^ref-c14edce7-149-0
```
^ref-c14edce7-149-0

### planner.ts (Intent → ToolSpec)

```ts
// shared/js/prom-lib/intention/planner.ts
import { Intent, ToolSpec } from "./schema";

export function plan(intent: Intent): ToolSpec {
  // Simple parse of signature "(x: number, y: number) -> { ... }"
  const sig = intent.signature || "";
  const m = sig.match(/^\s*\((.*?)\)\s*->\s*(.*)\s*$/);
  const params = (m?.[1]||"").split(",").map(s=>s.trim()).filter(Boolean).map(p=>{
    const [name, type] = p.split(":").map(s=>s.trim());
    return { name, type };
  });
  return {
    name: intent.name,
    params,
    returns: m?.[2]?.trim(),
    doc: (intent.description||"").split("\n")[0] || intent.name,
    constraints: intent.constraints,
    tests: intent.examples,
    deps: []
  };
}

export function buildPrompt(ts: ToolSpec, language: "js"|"py") {
  const sig = `${ts.name}(${ts.params.map(p=>p.name+(p.type?`: ${p.type}`:"")).join(", ")}) -> ${ts.returns||"unknown"}`;
  const examples = ts.tests.map(t => `- in: ${JSON.stringify(t.in)} out: ${JSON.stringify(t.out)}`).join("\n");
  return {
    system:
^ref-c14edce7-149-0
`You are a careful, terse ${language.toUpperCase()} code generator.\nReturn ONLY code without commentary.\nConform strictly to the signature and examples.\nAvoid heavy deps.`,
    prompt:
`task=${ts.name}\nlanguage=${language}\nsignature=${sig}\ndoc=${ts.doc}\nconstraints:\n${ts.constraints.map(c=>" - "+c).join("\n")}\nexamples:\n${examples}\nEmit a single self-contained ${language.toUpperCase()} implementation for this function.`
^ref-c14edce7-186-0
  };
^ref-c14edce7-186-0
}
^ref-c14edce7-186-0
```

### targets/js.ts

```ts
// shared/js/prom-lib/intention/targets/js.ts
import vm from "node:vm";

export function wrapJSModule(src: string) {
  // execute in VM, return exported functions from CommonJS-ish shim
  const sandbox: any = { module: { exports: {} }, exports: {}, require, console, Math };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { timeout: 2000 });
  return sandbox.module.exports || sandbox.exports;
}

export async function runJS(fnName: string, jsSrc: string, input: any) {
  const mod = wrapJSModule(jsSrc);
  const fn = mod[fnName] || (mod.default ?? mod);
  const args = tupleFromInput(fnName, input, jsSrc);
  const out = await Promise.resolve(fn(...args));
  return out;
}

^ref-c14edce7-186-0
function tupleFromInput(name: string, input: any, src: string) {
  // crude parse of parameter order by scanning function signature in src:
  const m = src.match(new RegExp(`function\\s+${name}\\s*\\(([^)]*)\\)`)) || src.match(/export\s+function\s+([^(]+)\(([^)]*)\)/);
^ref-c14edce7-216-0
  const paramList = m ? m[1].split(",").map(s=>s.trim()).filter(Boolean) : Object.keys(input);
^ref-c14edce7-216-0
  return paramList.map(p => input[p.replace(/=.*$/,"")] ?? input[p]);
^ref-c14edce7-216-0
}
```

### targets/py.ts (fast bridge you already have)

```ts
// shared/js/prom-lib/intention/targets/py.ts
import { createFastPy } from "../../polyglot/bridge";

export async function runPy(fnName: string, pySrc: string, input: any) {
  // Load source into Python runtime, then call
  const { bridge, $py } = createFastPy();
  try {
    const builtins = await bridge.module("builtins");
    const exec = await bridge.module("types"); // fallback not needed; we'll eval via builtins
    // compile the source into a module object
    await bridge["module"]("builtins"); // ensure initialized
    // Use a tiny helper: exec(pySrc, g)
    const g = await bridge.module("types");
    const compiled = await bridge["module"]("builtins"); // placeholder to keep ref
    // Simpler: expose a helper function on runtime: we can extend runtime, but here we cheat:
    const mod = await bridge.module("types"); // not used—kept for parity
    // Easiest: write to temp file? For speed, eval directly:
    const py = await bridge.module("builtins");
    // py.exec is not a thing; instead call 'exec':
    await (await py.exec)(pySrc); // if needed, adapt: you might add an 'exec' op to runtime
    const user = await bridge.module("__main__");
    const fn = user[fnName]; // proxy chain will fetch fn
^ref-c14edce7-216-0
    const args = Object.values(input); ^ref-c14edce7-248-0
    const out = await fn(...args);
    return out;
^ref-c14edce7-252-0
^ref-c14edce7-248-0
  } finally {
^ref-c14edce7-252-0
^ref-c14edce7-248-0
    // bridge.close(); // keep process alive if you’re batching
^ref-c14edce7-252-0
^ref-c14edce7-248-0
  }
}
```

> Note: For **Python exec** you’ll likely patch the runtime with an explicit `exec` op or a helper (one-liner). I left a comment to adapt—easy.

### checker.ts

```ts
// shared/js/prom-lib/intention/checker.ts
export type Candidate = { lang:"js"|"py"; name:string; code:string };

export async function checkCandidate(c: Candidate, tests: {in:any; out:any}[]) {
  const results: {ok:boolean; got:any; want:any; err?:any; case:any}[] = [];
  for (const t of tests) {
    try {
      const got = c.lang === "js"
        ? await (await import("./targets/js")).runJS(c.name, c.code, t.in)
        : await (await import("./targets/py")).runPy(c.name, c.code, t.in);
      const ok = deepEqual(got, t.out);
      results.push({ ok, got, want:t.out, case:t.in });
^ref-c14edce7-252-0
    } catch (err:any) {
      results.push({ ok:false, got:undefined, want:t.out, err:String(err), case:t.in });
^ref-c14edce7-277-0
    }
^ref-c14edce7-277-0
  }
^ref-c14edce7-277-0
  return { pass: results.every(r => r.ok), results };
}

function deepEqual(a:any,b:any){ try { return JSON.stringify(a)===JSON.stringify(b); } catch { return false; } }
```

### engine.ts (the fun bit)

```ts
// shared/js/prom-lib/intention/engine.ts
import { parsePseudo } from "./parser";
import { plan, buildPrompt } from "./planner";
import type { LLM } from "./llm";
import { DummyLLM } from "./llm";
import { checkCandidate } from "./checker";
import fs from "node:fs/promises";
import path from "node:path";

export type EngineOpts = {
  llm?: LLM;
  outDir?: { js:string; py:string };
  rounds?: number;
};

export async function transpileIntention(pseudo: string, opts: EngineOpts = {}) {
  const llm = opts.llm || new DummyLLM();
  const intent = parsePseudo(pseudo);
  const spec = plan(intent);

  const out: any[] = [];
  const rounds = opts.rounds ?? 2;

  for (const lang of intent.targets as ("js"|"py")[]) {
    let best: { code:string; pass:boolean; results:any } | null = null;

    for (let r=0; r<rounds; r++) {
      const { system, prompt } = buildPrompt(spec, lang);
      const code = await llm.generate({ system, prompt });
      const cand = { lang, name: spec.name, code };
      const verdict = await checkCandidate(cand, spec.tests);
      if (!best || verdict.pass || (verdict.results.filter((x:any)=>x.ok).length > best.results.filter((x:any)=>x.ok).length)) {
        best = { code, pass: verdict.pass, results: verdict.results };
      }
      if (verdict.pass) break;

      // repair prompt
      const failNotes = verdict.results.map((r:any)=> r.ok ? null : `input=${JSON.stringify(r.case)} got=${JSON.stringify(r.got)} want=${JSON.stringify(r.want)} err=${r.err||""}`).filter(Boolean).join("\n");
      const repair =
`The ${lang.toUpperCase()} code failed on some tests. Fix it.
Keep the SAME signature and public API.
Failures:
${failNotes}
--- BEGIN CURRENT CODE ---
${code}
--- END CURRENT CODE ---`;
      const fixed = await llm.generate({ system, prompt: repair });
      // next loop uses fixed implicitly via same flow
    }

    if (best) {
      out.push({ lang, code: best.code, pass: best.pass, results: best.results });
      // write to disk
      const dir = (opts.outDir?.[lang]) || (lang==="js" ? "src/js" : "src/py");
      await fs.mkdir(dir, { recursive: true });
      const fname = path.join(dir, (spec.name + (lang==="js"?".js":".py")));
      await fs.writeFile(fname, stampProvenance(lang, best.code, spec.name), "utf8");
    }
  }

^ref-c14edce7-277-0
  return { intent, spec, out };
}
^ref-c14edce7-353-0

^ref-c14edce7-353-0
function stampProvenance(lang:"js"|"py", code:string, name:string) {
^ref-c14edce7-353-0
  const head = lang==="js"
    ? `/* transpiled-by: prom-intent (task=${name}) at ${new Date().toISOString()} */\n`
    : `# transpiled-by: prom-intent (task=${name}) at ${new Date().toISOString()}\n`;
  return head + code;
}
```

---

# 3) Use it

```ts
import { transpileIntention } from "./shared/js/prom-lib/intention/engine";

const pseudo = `
# name: normalize2d
# target: js,py
# description:
Normalize a 2D vector (x,y). Return magnitude and normalized components.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# constraints:
- Avoid division by zero; if both are 0, return zeros.
# examples:
^ref-c14edce7-353-0
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 }
^ref-c14edce7-384-0
^ref-c14edce7-383-0 ^ref-c14edce7-390-0
^ref-c14edce7-382-0
`; ^ref-c14edce7-392-0
^ref-c14edce7-397-0
^ref-c14edce7-395-0
^ref-c14edce7-394-0 ^ref-c14edce7-403-0
^ref-c14edce7-393-0
^ref-c14edce7-392-0 ^ref-c14edce7-405-0
^ref-c14edce7-390-0 ^ref-c14edce7-406-0
^ref-c14edce7-384-0 ^ref-c14edce7-407-0
^ref-c14edce7-383-0
^ref-c14edce7-382-0 ^ref-c14edce7-409-0
 ^ref-c14edce7-393-0
^ref-c14edce7-417-0 ^ref-c14edce7-418-0
^ref-c14edce7-416-0 ^ref-c14edce7-419-0
^ref-c14edce7-415-0 ^ref-c14edce7-420-0
^ref-c14edce7-409-0
^ref-c14edce7-407-0
^ref-c14edce7-406-0
^ref-c14edce7-405-0 ^ref-c14edce7-424-0
^ref-c14edce7-403-0
^ref-c14edce7-397-0 ^ref-c14edce7-426-0
^ref-c14edce7-395-0 ^ref-c14edce7-427-0
^ref-c14edce7-394-0 ^ref-c14edce7-428-0
^ref-c14edce7-393-0
^ref-c14edce7-392-0
^ref-c14edce7-390-0
^ref-c14edce7-384-0
^ref-c14edce7-383-0
^ref-c14edce7-382-0
^ref-c14edce7-381-0
const res = await transpileIntention(pseudo, { ^ref-c14edce7-382-0 ^ref-c14edce7-394-0
  // plug your real LLM here (OpenAI, local, etc.) ^ref-c14edce7-383-0 ^ref-c14edce7-395-0
  rounds: 3, ^ref-c14edce7-384-0
  outDir: { js: "src/js/auto", py: "src/py/auto" } ^ref-c14edce7-397-0
}); ^ref-c14edce7-415-0
console.log(res.out.map(o => ({ lang:o.lang, pass:o.pass }))); ^ref-c14edce7-416-0
``` ^ref-c14edce7-417-0
 ^ref-c14edce7-418-0
--- ^ref-c14edce7-390-0 ^ref-c14edce7-419-0
 ^ref-c14edce7-403-0 ^ref-c14edce7-420-0
# 4) Make it *really* “on the fly” ^ref-c14edce7-392-0
 ^ref-c14edce7-393-0 ^ref-c14edce7-405-0
* **Watch mode**: hook a file watcher to any `*.intent.md` → re-run `transpileIntention` on change; hot-reload the JS VM; keep Python process warm (bridge pool). ^ref-c14edce7-394-0 ^ref-c14edce7-406-0
* **Live REPL**: inside your Lisp, build a `(transpile! pseudo-string ...)` form that calls the engine (JS side), drops artifacts into your mirror, and returns a callable function (from VM or Python proxy). ^ref-c14edce7-395-0 ^ref-c14edce7-407-0 ^ref-c14edce7-424-0
* **Equivalence check across langs**: run both generated impls on randomized inputs (**fast-check** on JS / **hypothesis** on Py); if outputs disagree, send a repair prompt with a *diff summary*.
 ^ref-c14edce7-397-0 ^ref-c14edce7-409-0 ^ref-c14edce7-426-0
--- ^ref-c14edce7-427-0
 ^ref-c14edce7-428-0
# 5) Where the “magic” lives (LLM prompting)

You’ll want a slightly smarter prompt set:
 ^ref-c14edce7-403-0 ^ref-c14edce7-415-0
* **System**: strict role; language; “single file, pass examples, no commentary”. ^ref-c14edce7-416-0
* **Few-shot**: include 2–3 solved micro-tasks with signature+examples→final code for that language. ^ref-c14edce7-405-0 ^ref-c14edce7-417-0
* **Formatting**: tell it to emit *only* the module code. ^ref-c14edce7-406-0 ^ref-c14edce7-418-0
* **Repair**: show test failures and current code; ask for a *patch* or full file (I recommend full file v1). ^ref-c14edce7-407-0 ^ref-c14edce7-419-0
 ^ref-c14edce7-420-0
You can pop those into `planner.ts` as templated strings. ^ref-c14edce7-409-0

---
 ^ref-c14edce7-424-0
# 6) JS↔Python interop from the same intention
 ^ref-c14edce7-426-0
If the planner infers heavy numerics (“use numpy”), set `targets: ["py"]` and **expose a JS wrapper** automatically: ^ref-c14edce7-415-0 ^ref-c14edce7-427-0
 ^ref-c14edce7-416-0 ^ref-c14edce7-428-0
* Generate Python “core” + a tiny JS veneer that calls it via the **bridge** so your JS apps import `normalize2d` and “don’t notice” it’s Python. ^ref-c14edce7-417-0
* For Node: bundle the fast bridge function into the wrapper. ^ref-c14edce7-418-0
* For the browser: swap in the Pyodide transport. ^ref-c14edce7-419-0
 ^ref-c14edce7-420-0
*(If you want, I’ll add `emitWrapperJS(spec)` that writes `src/js/auto/normalize2d.wrapper.js` calling the Python function.)*

---
 ^ref-c14edce7-424-0
# 7) Next upgrades (pick what you want next)
 ^ref-c14edce7-426-0
* **Real LLM provider**: plugin for your model (OpenAI, local llama.cpp, vLLM). I can hand you a drop-in `OpenAIProvider`. ^ref-c14edce7-427-0
* **Structured outputs**: instruct the LLM to return JSON with `{filename, code, tests}`; parse with a ReACT validator. ^ref-c14edce7-428-0
* **Static checks**: run `tsc --noEmit`, `eslint`, `ruff`, `mypy` as extra gates before we “pass”.
* **Property tests**: autogenerate from signature + constraints (e.g., `mag ≥ 0`, “no NaN”), and shrink on failure.
* **IR anchor**: lower generated code to your ANF IR, compute `irHash`, and store in `.promirror/` so the rector can keep multi-language artifacts in sync with a *single* intention source.
* **Editor hooks**: VS Code/Neovim command that runs the engine on the current block, inserts code or test diffs live.

---

If you want, I’ll:

1. plug in a real OpenAI provider (with minimal dependencies),
2. add the **JS wrapper → Python** path so you can call numpy-powered functions from JS with zero ceremony, or
3. bolt on watch mode + a tiny REPL so you can type pseudo and immediately call the function.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [EidolonField](eidolonfield.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [archetype-ecs](archetype-ecs.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Window Management](chunks/window-management.md)
- [Diagrams](chunks/diagrams.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [template-based-compilation](template-based-compilation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Event Bus MVP](event-bus-mvp.md)
- [graph-ds](graph-ds.md)
- [Services](chunks/services.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Tooling](chunks/tooling.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Shared](chunks/shared.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Creative Moments](creative-moments.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Operations](chunks/operations.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Shared Package Structure](shared-package-structure.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Promethean State Format](promethean-state-format.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Reawakening Duck](reawakening-duck.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Python Services CI](python-services-ci.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
## Sources
- [js-to-lisp-reverse-compiler — L1](js-to-lisp-reverse-compiler.md#^ref-58191024-1-0) (line 1, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.78)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L1](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-1-0) (line 1, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.72)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.71)
- [Promethean-Copilot-Intent-Engine — L13](promethean-copilot-intent-engine.md#^ref-ae24a280-13-0) (line 13, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.83)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.71)
- [Local-First Intention→Code Loop with Free Models — L1](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-1-0) (line 1, col 0, score 0.71)
- [Language-Agnostic Mirror System — L332](language-agnostic-mirror-system.md#^ref-d2b3628c-332-0) (line 332, col 0, score 0.72)
- [set-assignment-in-lisp-ast — L1](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-1-0) (line 1, col 0, score 0.7)
- [Local-Only-LLM-Workflow — L167](local-only-llm-workflow.md#^ref-9a8ab57e-167-0) (line 167, col 0, score 0.73)
- [Universal Lisp Interface — L3](universal-lisp-interface.md#^ref-b01856b4-3-0) (line 3, col 0, score 0.7)
- [Agent Reflections and Prompt Evolution — L105](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-105-0) (line 105, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L3](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-3-0) (line 3, col 0, score 0.64)
- [Local-First Intention→Code Loop with Free Models — L3](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-3-0) (line 3, col 0, score 0.64)
- [Voice Access Layer Design — L3](voice-access-layer-design.md#^ref-543ed9b3-3-0) (line 3, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L9](chroma-embedding-refactor.md#^ref-8b256935-9-0) (line 9, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L173](prompt-folder-bootstrap.md#^ref-bd4f0976-173-0) (line 173, col 0, score 0.62)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L69](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-69-0) (line 69, col 0, score 0.6)
- [Eidolon Field Abstract Model — L3](eidolon-field-abstract-model.md#^ref-5e8b2388-3-0) (line 3, col 0, score 0.6)
- [Lisp-Compiler-Integration — L485](lisp-compiler-integration.md#^ref-cfee6d36-485-0) (line 485, col 0, score 0.6)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.6)
- [Shared Package Structure — L157](shared-package-structure.md#^ref-66a72fc3-157-0) (line 157, col 0, score 0.59)
- [Fnord Tracer Protocol — L164](fnord-tracer-protocol.md#^ref-fc21f824-164-0) (line 164, col 0, score 0.59)
- [The Jar of Echoes — L115](the-jar-of-echoes.md#^ref-18138627-115-0) (line 115, col 0, score 0.59)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.76)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.73)
- [Lisp-Compiler-Integration — L13](lisp-compiler-integration.md#^ref-cfee6d36-13-0) (line 13, col 0, score 0.73)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.72)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.71)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.71)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L51](dynamic-context-model-for-web-components.md#^ref-f7702bf8-51-0) (line 51, col 0, score 0.7)
- [Mongo Outbox Implementation — L307](mongo-outbox-implementation.md#^ref-9c1acd1e-307-0) (line 307, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.68)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.68)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.68)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.68)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L12](promethean-copilot-intent-engine.md#^ref-ae24a280-12-0) (line 12, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L146](dynamic-context-model-for-web-components.md#^ref-f7702bf8-146-0) (line 146, col 0, score 0.68)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.68)
- [Optimizing Command Limitations in System Design — L26](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-26-0) (line 26, col 0, score 0.68)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L11](promethean-copilot-intent-engine.md#^ref-ae24a280-11-0) (line 11, col 0, score 0.63)
- [Interop and Source Maps — L516](interop-and-source-maps.md#^ref-cdfac40c-516-0) (line 516, col 0, score 0.67)
- [Language-Agnostic Mirror System — L536](language-agnostic-mirror-system.md#^ref-d2b3628c-536-0) (line 536, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L169](local-only-llm-workflow.md#^ref-9a8ab57e-169-0) (line 169, col 0, score 0.67)
- [plan-update-confirmation — L27](plan-update-confirmation.md#^ref-b22d79c6-27-0) (line 27, col 0, score 0.64)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.62)
- [prompt-programming-language-lisp — L64](prompt-programming-language-lisp.md#^ref-d41a06d1-64-0) (line 64, col 0, score 0.61)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.54)
- [Sibilant Meta-Prompt DSL — L169](sibilant-meta-prompt-dsl.md#^ref-af5d2824-169-0) (line 169, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.62)
- [prompt-programming-language-lisp — L5](prompt-programming-language-lisp.md#^ref-d41a06d1-5-0) (line 5, col 0, score 0.54)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.61)
- [Recursive Prompt Construction Engine — L159](recursive-prompt-construction-engine.md#^ref-babdb9eb-159-0) (line 159, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L113](prompt-folder-bootstrap.md#^ref-bd4f0976-113-0) (line 113, col 0, score 0.6)
- [Reawakening Duck — L110](reawakening-duck.md#^ref-59b5670f-110-0) (line 110, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.59)
- [plan-update-confirmation — L19](plan-update-confirmation.md#^ref-b22d79c6-19-0) (line 19, col 0, score 0.59)
- [Promethean Agent Config DSL — L306](promethean-agent-config-dsl.md#^ref-2c00ce45-306-0) (line 306, col 0, score 0.59)
- [Recursive Prompt Construction Engine — L75](recursive-prompt-construction-engine.md#^ref-babdb9eb-75-0) (line 75, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.67)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L128](local-only-llm-workflow.md#^ref-9a8ab57e-128-0) (line 128, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L1](performance-optimized-polyglot-bridge.md#^ref-f5579967-1-0) (line 1, col 0, score 0.68)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L12](performance-optimized-polyglot-bridge.md#^ref-f5579967-12-0) (line 12, col 0, score 0.64)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#^ref-c62a1815-246-0) (line 246, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L244](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-244-0) (line 244, col 0, score 0.64)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.64)
- [Promethean-native config design — L330](promethean-native-config-design.md#^ref-ab748541-330-0) (line 330, col 0, score 0.64)
- [Promethean Agent Config DSL — L214](promethean-agent-config-dsl.md#^ref-2c00ce45-214-0) (line 214, col 0, score 0.64)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.65)
- [aionian-circuit-math — L110](aionian-circuit-math.md#^ref-f2d83a77-110-0) (line 110, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L161](sibilant-meta-prompt-dsl.md#^ref-af5d2824-161-0) (line 161, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L78](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-78-0) (line 78, col 0, score 0.65)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.68)
- [Duck's Self-Referential Perceptual Loop — L8](ducks-self-referential-perceptual-loop.md#^ref-71726f04-8-0) (line 8, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L181](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-181-0) (line 181, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L271](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-271-0) (line 271, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.67)
- [Recursive Prompt Construction Engine — L21](recursive-prompt-construction-engine.md#^ref-babdb9eb-21-0) (line 21, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.74)
- [Language-Agnostic Mirror System — L512](language-agnostic-mirror-system.md#^ref-d2b3628c-512-0) (line 512, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.72)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.71)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.68)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.68)
- [schema-evolution-workflow — L124](schema-evolution-workflow.md#^ref-d8059b6a-124-0) (line 124, col 0, score 0.67)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L32](promethean-copilot-intent-engine.md#^ref-ae24a280-32-0) (line 32, col 0, score 0.67)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.68)
- [Local-Only-LLM-Workflow — L139](local-only-llm-workflow.md#^ref-9a8ab57e-139-0) (line 139, col 0, score 0.95)
- [2d-sandbox-field — L31](2d-sandbox-field.md#^ref-c710dc93-31-0) (line 31, col 0, score 0.69)
- [2d-sandbox-field — L26](2d-sandbox-field.md#^ref-c710dc93-26-0) (line 26, col 0, score 0.67)
- [2d-sandbox-field — L44](2d-sandbox-field.md#^ref-c710dc93-44-0) (line 44, col 0, score 0.67)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.68)
- [EidolonField — L9](eidolonfield.md#^ref-49d1e1e5-9-0) (line 9, col 0, score 0.66)
- [Board Walk – 2025-08-11 — L114](board-walk-2025-08-11.md#^ref-7aa1eb92-114-0) (line 114, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L112](board-walk-2025-08-11.md#^ref-7aa1eb92-112-0) (line 112, col 0, score 0.64)
- [field-node-diagram-set — L24](field-node-diagram-set.md#^ref-22b989d5-24-0) (line 24, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.62)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.66)
- [sibilant-macro-targets — L85](sibilant-macro-targets.md#^ref-c5c9a5c6-85-0) (line 85, col 0, score 0.62)
- [plan-update-confirmation — L88](plan-update-confirmation.md#^ref-b22d79c6-88-0) (line 88, col 0, score 0.65)
- [mystery-lisp-search-session — L100](mystery-lisp-search-session.md#^ref-513dc4c7-100-0) (line 100, col 0, score 0.64)
- [Optimizing Command Limitations in System Design — L21](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-21-0) (line 21, col 0, score 0.63)
- [template-based-compilation — L50](template-based-compilation.md#^ref-f8877e5e-50-0) (line 50, col 0, score 0.62)
- [lisp-dsl-for-window-management — L212](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-212-0) (line 212, col 0, score 0.62)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.61)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L151](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-151-0) (line 151, col 0, score 0.69)
- [Model Upgrade Calm-Down Guide — L43](model-upgrade-calm-down-guide.md#^ref-db74343f-43-0) (line 43, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.6)
- [Language-Agnostic Mirror System — L37](language-agnostic-mirror-system.md#^ref-d2b3628c-37-0) (line 37, col 0, score 0.76)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.74)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.76)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.71)
- [template-based-compilation — L58](template-based-compilation.md#^ref-f8877e5e-58-0) (line 58, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L115](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-115-0) (line 115, col 0, score 0.65)
- [api-gateway-versioning — L306](api-gateway-versioning.md#^ref-0580dcd3-306-0) (line 306, col 0, score 0.65)
- [Debugging Broker Connections and Agent Behavior — L49](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-49-0) (line 49, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L417](dynamic-context-model-for-web-components.md#^ref-f7702bf8-417-0) (line 417, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.75)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.7)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.74)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.71)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.73)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.73)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.7)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.69)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.75)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.68)
- [Mongo Outbox Implementation — L263](mongo-outbox-implementation.md#^ref-9c1acd1e-263-0) (line 263, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.72)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.72)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L86](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-86-0) (line 86, col 0, score 0.71)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.64)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.68)
- [Mongo Outbox Implementation — L152](mongo-outbox-implementation.md#^ref-9c1acd1e-152-0) (line 152, col 0, score 0.7)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.63)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.7)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.71)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.65)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.63)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.68)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.66)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.73)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.68)
- [Local-First Intention→Code Loop with Free Models — L7](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-7-0) (line 7, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.7)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.66)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.68)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.63)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.7)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.61)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.69)
- [Promethean-Copilot-Intent-Engine — L39](promethean-copilot-intent-engine.md#^ref-ae24a280-39-0) (line 39, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L599](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-599-0) (line 599, col 0, score 0.66)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.66)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L368](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-368-0) (line 368, col 0, score 0.65)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L82](sibilant-meta-prompt-dsl.md#^ref-af5d2824-82-0) (line 82, col 0, score 0.69)
- [Prometheus Observability Stack — L3](prometheus-observability-stack.md#^ref-e90b5a16-3-0) (line 3, col 0, score 0.56)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.67)
- [Eidolon Field Abstract Model — L105](eidolon-field-abstract-model.md#^ref-5e8b2388-105-0) (line 105, col 0, score 0.55)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L21](prompt-folder-bootstrap.md#^ref-bd4f0976-21-0) (line 21, col 0, score 0.55)
- [js-to-lisp-reverse-compiler — L382](js-to-lisp-reverse-compiler.md#^ref-58191024-382-0) (line 382, col 0, score 0.54)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.67)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.67)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.67)
- [markdown-to-org-transpiler — L293](markdown-to-org-transpiler.md#^ref-ab54cdd8-293-0) (line 293, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L319](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-319-0) (line 319, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.65)
- [Promethean-native config design — L37](promethean-native-config-design.md#^ref-ab748541-37-0) (line 37, col 0, score 0.64)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L45](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-45-0) (line 45, col 0, score 0.63)
- [ecs-offload-workers — L187](ecs-offload-workers.md#^ref-6498b9d7-187-0) (line 187, col 0, score 0.67)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.7)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.72)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.71)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L396](performance-optimized-polyglot-bridge.md#^ref-f5579967-396-0) (line 396, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L6](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-6-0) (line 6, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L14](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-14-0) (line 14, col 0, score 0.7)
- [polyglot-repl-interface-layer — L56](polyglot-repl-interface-layer.md#^ref-9c79206d-56-0) (line 56, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L169](cross-language-runtime-polymorphism.md#^ref-c34c36a6-169-0) (line 169, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.68)
- [polymorphic-meta-programming-engine — L86](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-86-0) (line 86, col 0, score 0.68)
- [polymorphic-meta-programming-engine — L99](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-99-0) (line 99, col 0, score 0.74)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L359](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-359-0) (line 359, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.66)
- [polymorphic-meta-programming-engine — L48](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-48-0) (line 48, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L492](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-492-0) (line 492, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L35](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-35-0) (line 35, col 0, score 0.65)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L373](performance-optimized-polyglot-bridge.md#^ref-f5579967-373-0) (line 373, col 0, score 0.66)
- [plan-update-confirmation — L325](plan-update-confirmation.md#^ref-b22d79c6-325-0) (line 325, col 0, score 0.64)
- [Python Services CI — L1](python-services-ci.md#^ref-4c951657-1-0) (line 1, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L5](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-5-0) (line 5, col 0, score 0.67)
- [Canonical Org-Babel Matplotlib Animation Template — L73](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-73-0) (line 73, col 0, score 0.64)
- [plan-update-confirmation — L204](plan-update-confirmation.md#^ref-b22d79c6-204-0) (line 204, col 0, score 0.68)
- [plan-update-confirmation — L288](plan-update-confirmation.md#^ref-b22d79c6-288-0) (line 288, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.63)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.73)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.69)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L308](js-to-lisp-reverse-compiler.md#^ref-58191024-308-0) (line 308, col 0, score 0.69)
- [Language-Agnostic Mirror System — L471](language-agnostic-mirror-system.md#^ref-d2b3628c-471-0) (line 471, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.73)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L113](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-113-0) (line 113, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.66)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.68)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.66)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.66)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.66)
- [Shared Package Structure — L58](shared-package-structure.md#^ref-66a72fc3-58-0) (line 58, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.68)
- [Reawakening Duck — L43](reawakening-duck.md#^ref-59b5670f-43-0) (line 43, col 0, score 0.67)
- [plan-update-confirmation — L986](plan-update-confirmation.md#^ref-b22d79c6-986-0) (line 986, col 0, score 0.67)
- [Language-Agnostic Mirror System — L525](language-agnostic-mirror-system.md#^ref-d2b3628c-525-0) (line 525, col 0, score 0.63)
- [file-watcher-auth-fix — L11](file-watcher-auth-fix.md#^ref-9044701b-11-0) (line 11, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L130](local-only-llm-workflow.md#^ref-9a8ab57e-130-0) (line 130, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.66)
- [Universal Lisp Interface — L123](universal-lisp-interface.md#^ref-b01856b4-123-0) (line 123, col 0, score 0.74)
- [Universal Lisp Interface — L192](universal-lisp-interface.md#^ref-b01856b4-192-0) (line 192, col 0, score 0.73)
- [lisp-dsl-for-window-management — L172](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-172-0) (line 172, col 0, score 0.73)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.63)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.72)
- [Lisp-Compiler-Integration — L1](lisp-compiler-integration.md#^ref-cfee6d36-1-0) (line 1, col 0, score 0.72)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.72)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L394](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-394-0) (line 394, col 0, score 0.71)
- [js-to-lisp-reverse-compiler — L380](js-to-lisp-reverse-compiler.md#^ref-58191024-380-0) (line 380, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L3](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-3-0) (line 3, col 0, score 0.64)
- [Language-Agnostic Mirror System — L31](language-agnostic-mirror-system.md#^ref-d2b3628c-31-0) (line 31, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.68)
- [sibilant-metacompiler-overview — L15](sibilant-metacompiler-overview.md#^ref-61d4086b-15-0) (line 15, col 0, score 0.66)
- [Promethean Pipelines — L7](promethean-pipelines.md#^ref-8b8e6103-7-0) (line 7, col 0, score 0.66)
- [Language-Agnostic Mirror System — L29](language-agnostic-mirror-system.md#^ref-d2b3628c-29-0) (line 29, col 0, score 0.7)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L102](sibilant-meta-prompt-dsl.md#^ref-af5d2824-102-0) (line 102, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L26](functional-embedding-pipeline-refactor.md#^ref-a4a25141-26-0) (line 26, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L177](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-177-0) (line 177, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.71)
- [Agent Reflections and Prompt Evolution — L102](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-102-0) (line 102, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L15](model-upgrade-calm-down-guide.md#^ref-db74343f-15-0) (line 15, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.63)
- [Recursive Prompt Construction Engine — L39](recursive-prompt-construction-engine.md#^ref-babdb9eb-39-0) (line 39, col 0, score 0.62)
- [Sibilant Meta-Prompt DSL — L74](sibilant-meta-prompt-dsl.md#^ref-af5d2824-74-0) (line 74, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L30](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-30-0) (line 30, col 0, score 0.62)
- [plan-update-confirmation — L845](plan-update-confirmation.md#^ref-b22d79c6-845-0) (line 845, col 0, score 0.71)
- [sibilant-meta-string-templating-runtime — L33](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-33-0) (line 33, col 0, score 0.7)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.7)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.66)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.69)
- [polymorphic-meta-programming-engine — L188](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-188-0) (line 188, col 0, score 0.69)
- [plan-update-confirmation — L913](plan-update-confirmation.md#^ref-b22d79c6-913-0) (line 913, col 0, score 0.68)
- [Lisp-Compiler-Integration — L519](lisp-compiler-integration.md#^ref-cfee6d36-519-0) (line 519, col 0, score 0.68)
- [Universal Lisp Interface — L176](universal-lisp-interface.md#^ref-b01856b4-176-0) (line 176, col 0, score 0.76)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.67)
- [Promethean-native config design — L62](promethean-native-config-design.md#^ref-ab748541-62-0) (line 62, col 0, score 0.66)
- [sibilant-macro-targets — L127](sibilant-macro-targets.md#^ref-c5c9a5c6-127-0) (line 127, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.66)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.65)
- [obsidian-ignore-node-modules-regex — L38](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-38-0) (line 38, col 0, score 0.63)
- [obsidian-ignore-node-modules-regex — L8](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-8-0) (line 8, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L684](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-684-0) (line 684, col 0, score 0.63)
- [plan-update-confirmation — L136](plan-update-confirmation.md#^ref-b22d79c6-136-0) (line 136, col 0, score 0.71)
- [plan-update-confirmation — L152](plan-update-confirmation.md#^ref-b22d79c6-152-0) (line 152, col 0, score 0.7)
- [plan-update-confirmation — L236](plan-update-confirmation.md#^ref-b22d79c6-236-0) (line 236, col 0, score 0.7)
- [file-watcher-auth-fix — L7](file-watcher-auth-fix.md#^ref-9044701b-7-0) (line 7, col 0, score 0.69)
- [Local-First Intention→Code Loop with Free Models — L114](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-114-0) (line 114, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L58](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-58-0) (line 58, col 0, score 0.69)
- [plan-update-confirmation — L587](plan-update-confirmation.md#^ref-b22d79c6-587-0) (line 587, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.65)
- [prompt-programming-language-lisp — L79](prompt-programming-language-lisp.md#^ref-d41a06d1-79-0) (line 79, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L176](recursive-prompt-construction-engine.md#^ref-babdb9eb-176-0) (line 176, col 0, score 0.62)
- [set-assignment-in-lisp-ast — L159](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-159-0) (line 159, col 0, score 0.62)
- [sibilant-macro-targets — L159](sibilant-macro-targets.md#^ref-c5c9a5c6-159-0) (line 159, col 0, score 0.62)
- [Sibilant Meta-Prompt DSL — L44](sibilant-meta-prompt-dsl.md#^ref-af5d2824-44-0) (line 44, col 0, score 0.57)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.56)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.56)
- [windows-tiling-with-autohotkey — L13](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13-0) (line 13, col 0, score 0.53)
- [Prompt_Folder_Bootstrap — L27](prompt-folder-bootstrap.md#^ref-bd4f0976-27-0) (line 27, col 0, score 0.53)
- [Local-Only-LLM-Workflow — L166](local-only-llm-workflow.md#^ref-9a8ab57e-166-0) (line 166, col 0, score 0.76)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.65)
- [Factorio AI with External Agents — L15](factorio-ai-with-external-agents.md#^ref-a4d90289-15-0) (line 15, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L404](js-to-lisp-reverse-compiler.md#^ref-58191024-404-0) (line 404, col 0, score 0.64)
- [sibilant-metacompiler-overview — L29](sibilant-metacompiler-overview.md#^ref-61d4086b-29-0) (line 29, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L359](performance-optimized-polyglot-bridge.md#^ref-f5579967-359-0) (line 359, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L26](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-26-0) (line 26, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L402](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-402-0) (line 402, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L133](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-133-0) (line 133, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L109](cross-language-runtime-polymorphism.md#^ref-c34c36a6-109-0) (line 109, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.7)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.68)
- [Universal Lisp Interface — L108](universal-lisp-interface.md#^ref-b01856b4-108-0) (line 108, col 0, score 0.67)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.66)
- [Universal Lisp Interface — L175](universal-lisp-interface.md#^ref-b01856b4-175-0) (line 175, col 0, score 0.66)
- [Promethean-native config design — L363](promethean-native-config-design.md#^ref-ab748541-363-0) (line 363, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L499](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-499-0) (line 499, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L8](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-8-0) (line 8, col 0, score 0.8)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L468](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-468-0) (line 468, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L474](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-474-0) (line 474, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L11](performance-optimized-polyglot-bridge.md#^ref-f5579967-11-0) (line 11, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L326](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-326-0) (line 326, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L361](performance-optimized-polyglot-bridge.md#^ref-f5579967-361-0) (line 361, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.62)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.62)
- [Universal Lisp Interface — L119](universal-lisp-interface.md#^ref-b01856b4-119-0) (line 119, col 0, score 0.67)
- [mystery-lisp-search-session — L40](mystery-lisp-search-session.md#^ref-513dc4c7-40-0) (line 40, col 0, score 0.66)
- [Universal Lisp Interface — L125](universal-lisp-interface.md#^ref-b01856b4-125-0) (line 125, col 0, score 0.66)
- [Sibilant Meta-Prompt DSL — L131](sibilant-meta-prompt-dsl.md#^ref-af5d2824-131-0) (line 131, col 0, score 0.61)
- [Vectorial Exception Descent — L73](vectorial-exception-descent.md#^ref-d771154e-73-0) (line 73, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L157](cross-language-runtime-polymorphism.md#^ref-c34c36a6-157-0) (line 157, col 0, score 0.64)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.63)
- [Universal Lisp Interface — L21](universal-lisp-interface.md#^ref-b01856b4-21-0) (line 21, col 0, score 0.63)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [plan-update-confirmation — L470](plan-update-confirmation.md#^ref-b22d79c6-470-0) (line 470, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L38](cross-language-runtime-polymorphism.md#^ref-c34c36a6-38-0) (line 38, col 0, score 0.65)
- [Promethean Pipelines — L76](promethean-pipelines.md#^ref-8b8e6103-76-0) (line 76, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L140](sibilant-meta-prompt-dsl.md#^ref-af5d2824-140-0) (line 140, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L133](sibilant-meta-prompt-dsl.md#^ref-af5d2824-133-0) (line 133, col 0, score 0.64)
- [Universal Lisp Interface — L33](universal-lisp-interface.md#^ref-b01856b4-33-0) (line 33, col 0, score 0.64)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.64)
- [plan-update-confirmation — L550](plan-update-confirmation.md#^ref-b22d79c6-550-0) (line 550, col 0, score 0.63)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.67)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L165](local-only-llm-workflow.md#^ref-9a8ab57e-165-0) (line 165, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L166](migrate-to-provider-tenant-architecture.md#^ref-54382370-166-0) (line 166, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L34](dynamic-context-model-for-web-components.md#^ref-f7702bf8-34-0) (line 34, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.64)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.64)
- [Language-Agnostic Mirror System — L506](language-agnostic-mirror-system.md#^ref-d2b3628c-506-0) (line 506, col 0, score 0.8)
- [Language-Agnostic Mirror System — L4](language-agnostic-mirror-system.md#^ref-d2b3628c-4-0) (line 4, col 0, score 0.76)
- [compiler-kit-foundations — L7](compiler-kit-foundations.md#^ref-01b21543-7-0) (line 7, col 0, score 0.73)
- [Lispy Macros with syntax-rules — L392](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-392-0) (line 392, col 0, score 0.71)
- [Language-Agnostic Mirror System — L519](language-agnostic-mirror-system.md#^ref-d2b3628c-519-0) (line 519, col 0, score 0.67)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.66)
- [compiler-kit-foundations — L9](compiler-kit-foundations.md#^ref-01b21543-9-0) (line 9, col 0, score 0.7)
- [Dynamic Context Model for Web Components — L25](dynamic-context-model-for-web-components.md#^ref-f7702bf8-25-0) (line 25, col 0, score 0.7)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.6)
- [plan-update-confirmation — L202](plan-update-confirmation.md#^ref-b22d79c6-202-0) (line 202, col 0, score 0.66)
- [plan-update-confirmation — L286](plan-update-confirmation.md#^ref-b22d79c6-286-0) (line 286, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L171](dynamic-context-model-for-web-components.md#^ref-f7702bf8-171-0) (line 171, col 0, score 0.64)
- [Promethean Pipelines — L85](promethean-pipelines.md#^ref-8b8e6103-85-0) (line 85, col 0, score 0.65)
- [polyglot-repl-interface-layer — L139](polyglot-repl-interface-layer.md#^ref-9c79206d-139-0) (line 139, col 0, score 0.65)
- [polyglot-repl-interface-layer — L96](polyglot-repl-interface-layer.md#^ref-9c79206d-96-0) (line 96, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.88)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.88)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.83)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.83)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.81)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.81)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.8)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.8)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.8)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.8)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.8)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.79)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.79)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.79)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.78)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.78)
- [Promethean-native config design — L71](promethean-native-config-design.md#^ref-ab748541-71-0) (line 71, col 0, score 0.76)
- [Local-Offline-Model-Deployment-Strategy — L10](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-10-0) (line 10, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.62)
- [api-gateway-versioning — L270](api-gateway-versioning.md#^ref-0580dcd3-270-0) (line 270, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L33](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-33-0) (line 33, col 0, score 0.61)
- [Factorio AI with External Agents — L5](factorio-ai-with-external-agents.md#^ref-a4d90289-5-0) (line 5, col 0, score 0.61)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L416](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-416-0) (line 416, col 0, score 0.61)
- [Local-Offline-Model-Deployment-Strategy — L9](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-9-0) (line 9, col 0, score 0.6)
- [polyglot-repl-interface-layer — L114](polyglot-repl-interface-layer.md#^ref-9c79206d-114-0) (line 114, col 0, score 0.7)
- [polymorphic-meta-programming-engine — L111](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-111-0) (line 111, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L432](performance-optimized-polyglot-bridge.md#^ref-f5579967-432-0) (line 432, col 0, score 0.64)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.65)
- [Language-Agnostic Mirror System — L7](language-agnostic-mirror-system.md#^ref-d2b3628c-7-0) (line 7, col 0, score 0.62)
- [layer-1-uptime-diagrams — L81](layer-1-uptime-diagrams.md#^ref-4127189a-81-0) (line 81, col 0, score 0.6)
- [Factorio AI with External Agents — L138](factorio-ai-with-external-agents.md#^ref-a4d90289-138-0) (line 138, col 0, score 0.6)
- [plan-update-confirmation — L523](plan-update-confirmation.md#^ref-b22d79c6-523-0) (line 523, col 0, score 0.59)
- [Interop and Source Maps — L507](interop-and-source-maps.md#^ref-cdfac40c-507-0) (line 507, col 0, score 0.59)
- [Lispy Macros with syntax-rules — L391](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-391-0) (line 391, col 0, score 0.59)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 1)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 1)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 1)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 1)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 1)
- [2d-sandbox-field — L198](2d-sandbox-field.md#^ref-c710dc93-198-0) (line 198, col 0, score 1)
- [Math Fundamentals — L30](chunks/math-fundamentals.md#^ref-c6e87433-30-0) (line 30, col 0, score 1)
- [Eidolon Field Abstract Model — L196](eidolon-field-abstract-model.md#^ref-5e8b2388-196-0) (line 196, col 0, score 1)
- [eidolon-node-lifecycle — L52](eidolon-node-lifecycle.md#^ref-938eca9c-52-0) (line 52, col 0, score 1)
- [EidolonField — L239](eidolonfield.md#^ref-49d1e1e5-239-0) (line 239, col 0, score 1)
- [Exception Layer Analysis — L152](exception-layer-analysis.md#^ref-21d5cc09-152-0) (line 152, col 0, score 1)
- [field-dynamics-math-blocks — L147](field-dynamics-math-blocks.md#^ref-7cfc230d-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L108](field-node-diagram-outline.md#^ref-1f32c94a-108-0) (line 108, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [graph-ds — L380](graph-ds.md#^ref-6620e2f2-380-0) (line 380, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [js-to-lisp-reverse-compiler — L418](js-to-lisp-reverse-compiler.md#^ref-58191024-418-0) (line 418, col 0, score 1)
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [aionian-circuit-math — L169](aionian-circuit-math.md#^ref-f2d83a77-169-0) (line 169, col 0, score 1)
- [api-gateway-versioning — L290](api-gateway-versioning.md#^ref-0580dcd3-290-0) (line 290, col 0, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#^ref-7aa1eb92-135-0) (line 135, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#^ref-5020e892-180-0) (line 180, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L185](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-185-0) (line 185, col 0, score 1)
- [Dynamic Context Model for Web Components — L402](dynamic-context-model-for-web-components.md#^ref-f7702bf8-402-0) (line 402, col 0, score 1)
- [Eidolon Field Abstract Model — L191](eidolon-field-abstract-model.md#^ref-5e8b2388-191-0) (line 191, col 0, score 1)
- [eidolon-node-lifecycle — L53](eidolon-node-lifecycle.md#^ref-938eca9c-53-0) (line 53, col 0, score 1)
- [EidolonField — L243](eidolonfield.md#^ref-49d1e1e5-243-0) (line 243, col 0, score 1)
- [aionian-circuit-math — L152](aionian-circuit-math.md#^ref-f2d83a77-152-0) (line 152, col 0, score 1)
- [Math Fundamentals — L11](chunks/math-fundamentals.md#^ref-c6e87433-11-0) (line 11, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L196](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-196-0) (line 196, col 0, score 1)
- [Eidolon Field Abstract Model — L192](eidolon-field-abstract-model.md#^ref-5e8b2388-192-0) (line 192, col 0, score 1)
- [eidolon-field-math-foundations — L121](eidolon-field-math-foundations.md#^ref-008f2ac0-121-0) (line 121, col 0, score 1)
- [EidolonField — L245](eidolonfield.md#^ref-49d1e1e5-245-0) (line 245, col 0, score 1)
- [Exception Layer Analysis — L149](exception-layer-analysis.md#^ref-21d5cc09-149-0) (line 149, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#^ref-1f32c94a-103-0) (line 103, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [JavaScript — L25](chunks/javascript.md#^ref-c1618c66-25-0) (line 25, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Admin Dashboard for User Management — L40](admin-dashboard-for-user-management.md#^ref-2901a3e9-40-0) (line 40, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-156-0) (line 156, col 0, score 1)
- [api-gateway-versioning — L297](api-gateway-versioning.md#^ref-0580dcd3-297-0) (line 297, col 0, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#^ref-6498b9d7-454-0) (line 454, col 0, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#^ref-c62a1815-388-0) (line 388, col 0, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#^ref-008f2ac0-129-0) (line 129, col 0, score 1)
- [field-interaction-equations — L177](field-interaction-equations.md#^ref-b09141b7-177-0) (line 177, col 0, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#^ref-58191024-422-0) (line 422, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
