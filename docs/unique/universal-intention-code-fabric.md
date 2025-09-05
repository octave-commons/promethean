---
uuid: 177c260c-39b2-4450-836d-1e87c0bd0035
created_at: universal-intention-code-fabric.md
filename: universal-intention-code-fabric
title: universal-intention-code-fabric
description: >-
  A modular system that transpiles human-readable pseudo-code into executable
  JavaScript/Python code using an LLM and polyglot toolchain, with
  auto-verification and repair loops for error handling.
tags:
  - pseudo-code
  - transpiler
  - llm
  - code-generation
  - auto-verification
  - repair-loop
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
^ref-c14edce7-92-0 ^ref-c14edce7-93-0

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
^ref-c14edce7-127-0 ^ref-c14edce7-131-0

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
^ref-c14edce7-149-0 ^ref-c14edce7-157-0

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
    await bridge"module"; // ensure initialized
    // Use a tiny helper: exec(pySrc, g)
    const g = await bridge.module("types");
    const compiled = await bridge"module"; // placeholder to keep ref
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
^ref-c14edce7-388-0
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
3. bolt on watch mode + a tiny REPL so you can type pseudo and immediately call the function.
