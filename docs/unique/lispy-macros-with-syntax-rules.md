---
uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
created_at: 2025.08.08.23.08.84.md
filename: Lispy Macros with syntax-rules
description: >-
  Implements hygienic-like Lisp macros using syntax-rules for pattern matching
  and variable binding, enhancing the Lisp front-end with n-ary operators and
  externs for host functions.
tags:
  - Lisp
  - macros
  - syntax-rules
  - hygiene
  - n-ary
  - operators
  - externs
  - JS
related_to_title: []
related_to_uuid: []
references: []
---
Alright, **Part next**: we wire **Lispy macros up a notch** with `syntax-rules` (hygienic-ish), make the Lisp front-end nicer (`and`/`or`, *n*-ary `+ - * /`), and let you **seed externs** so host functions like `print` compile cleanly to JS imports. ^ref-cbfe3513-1-0

Drop these in alongside your compiler stuff: ^ref-cbfe3513-3-0

---

# 1) `syntax-rules` macros (define-syntax)

```ts
// shared/js/prom-lib/compiler/lisp/syntax-rules.ts
import { S, Sym, List, Nil, isList, isSym, list, sym } from "./syntax";

type Bindings = Map<string, S | S[]>;   // symbol -> value (or vector for ... repeats)

type Pattern =
  | { k:"lit"; s:S }                          // literal (number/string/bool/nil)
  | { k:"var"; name:string }                  // pattern variable
  | { k:"list"; xs: Pattern[]; dotted?: boolean }
  | { k:"repeat"; sub: Pattern };             // sub ... (ellipses)

function compilePat(p: S, literals: Set<string>): Pattern {
  if (p.t === "list") {
    const xs = p.xs;
    const out: Pattern[] = [];
    for (let i=0;i<xs.length;i++) {
      if (isSym(xs[i], "...")) {
        if (out.length===0) throw new Error("bad ellipsis at list head");
        const last = out.pop()!;
        out.push({ k:"repeat", sub: last });
      } else {
        out.push(compilePat(xs[i], literals));
      }
    }
    return { k:"list", xs: out };
  }
  if (p.t === "sym") {
    if (literals.has(p.name)) return { k:"lit", s: p };
    if (p.name === "_")       return { k:"lit", s: p }; // wildcard literal underscore
    return { k:"var", name: p.name };
  }
  // atoms
  return { k:"lit", s: p };
}

function match(p: Pattern, x: S, b: Bindings): boolean {
  switch (p.k) {
    case "lit":   return structuralEq(p.s, x);
    case "var": {
      const prev = b.get(p.name);
      if (prev === undefined) { b.set(p.name, x); return true; }
      // For repeats, prev can be array; for single, keep single
      if (Array.isArray(prev)) return false;
      return structuralEq(prev as S, x);
    }
    case "list": {
      if (x.t !== "list") return false;
      return matchList(p.xs, x.xs, b);
    }
    case "repeat": {
      // A single repeat node should never appear outside a list
      throw new Error("internal: repeat at top level");
    }
  }
}

function matchList(pats: Pattern[], xs: S[], b: Bindings): boolean {
  let i = 0, j = 0;
  while (i < pats.length) {
    const p = pats[i];
    if (p.k === "repeat") {
      const sub = (p as any).sub as Pattern;
      // Greedy: consume as many xs as possible while sub matches
      const start = j;
      while (j < xs.length && matchClone(sub, xs[j], b, true)) j++;
      // Save the slice under any variables inside sub → vector bindings
      collectRepeatBindings(sub, xs.slice(start, j), b);
      i++;
      continue;
    }
    if (j >= xs.length) return false;
    if (!match(p, xs[j], b)) return false;
    i++; j++;
  }
  return j === xs.length;
}

function collectRepeatBindings(p: Pattern, seq: S[], b: Bindings) {
  // Walk pattern; whenever you see a var, push its matched seq items into an array.
  if (p.k === "var") {
    const name = p.name;
    const ex = b.get(name);
    const arr = Array.isArray(ex) ? ex.slice() : [];
    arr.push(...seq);
    b.set(name, arr);
    return;
  }
  if (p.k === "list") {
    for (const item of seq) {
      if (item.t !== "list") continue;
      for (let k=0;k<p.xs.length;k++) {
        collectRepeatBindings(p.xs[k], [item.xs[k]], b);
      }
    }
    return;
  }
  if (p.k === "repeat") collectRepeatBindings(p.sub, seq, b);
}

function matchClone(p: Pattern, x: S, b: Bindings, dry=false): boolean {
  // Dry-run clone of match to test greediness, without mutating bindings
  const tmp = new Map(b);
  const ok = match(p, x, tmp);
  return ok;
}

function substitute(tmpl: S, b: Bindings): S {
  // Replace vars and expand ellipses
  if (tmpl.t === "list") {
    const out: S[] = [];
    const xs = tmpl.xs;
    for (let i=0;i<xs.length;i++) {
      const cur = xs[i];
      if (isSym(cur, "...")) {
        const prev = out.pop();
        if (!prev) throw new Error("bad ellipsis position");
        // prev should be a list with pattern variables inside; replicate per vector bindings
        // Simple rule: if prev is a list, and contains any vars bound to arrays, explode per index
        const replicas = explode(prev, b);
        out.push(...replicas);
      } else {
        out.push(substitute(cur, b));
      }
    }
    return list(out, tmpl.span);
  }
  if (tmpl.t === "sym") {
    const k = tmpl.name;
    const v = b.get(k);
    if (v === undefined) return tmpl;
    if (Array.isArray(v)) return list(v as S[]);
    return v as S;
  }
  return tmpl;
}

function explode(node: S, b: Bindings): S[] {
  // Find array bindings used in node; replicate node N times and index into array elements
  const arrNames: { name:string; values: S[] }[] = [];
  collectArrNames(node, b, arrNames);
  if (arrNames.length === 0) return [substitute(node, b)];
  const N = arrNames[0].values.length;
  for (const n of arrNames) if (n.values.length !== N) throw new Error("ellipsis arity mismatch");
  const clones: S[] = [];
  for (let i=0;i<N;i++) {
    const bb = new Map(b);
    for (const n of arrNames) bb.set(n.name, n.values[i]);
    clones.push(substitute(node, bb));
  }
  return clones;
}
function collectArrNames(node: S, b: Bindings, acc: {name:string; values:S[]}[]) {
  if (node.t === "sym") {
    const k = node.name; const v = b.get(k);
    if (Array.isArray(v)) acc.push({ name:k, values: v as S[] });
    return;
  }
  if (node.t === "list") for (const x of node.xs) collectArrNames(x, b, acc);
}

function structuralEq(a: S, b: S): boolean {
  if (a.t !== b.t) return false;
  if (a.t === "list") {
    if (a.xs.length !== (b as List).xs.length) return false;
    for (let i=0;i<a.xs.length;i++) if (!structuralEq(a.xs[i], (b as List).xs[i])) return false;
    return true;
  }
  if (a.t === "sym") return (a as Sym).name === (b as Sym).name;
  if (a.t === "num") return (a as any).v === (b as any).v;
  if (a.t === "str") return (a as any).v === (b as any).v;
  if (a.t === "bool") return (a as any).v === (b as any).v;
  if (a.t === "nil") return true;
  return false;
}

export function makeSyntaxRules(defForm: List) {
  // (define-syntax name (syntax-rules (lit...) (pattern template) ...))
  const [_def, nameS, rulesForm] = defForm.xs as [S,S,S];
  const name = (nameS as Sym).name;
  const sr = rulesForm as List;
  if (!isList(sr, "syntax-rules")) throw new Error("define-syntax expects (syntax-rules ...)");
  const [, litsForm, ...rulePairs] = sr.xs;
  const lits = new Set<string>((litsForm as List).xs.filter(x=>x.t==="sym").map(x=>(x as Sym).name));

  const rules = rulePairs.map((pair:any) => {
    const [pat, tmpl] = pair.xs as [S,S];
    return { pat: compilePat(pat, lits), rawPat: pat, tmpl };
  });

  // The macro function used by MacroEnv
  const expand = (call: List): S => {
    for (const r of rules) {
      const b: Bindings = new Map();
      // First element is the name — patterns usually start with that symbol; match remaining call
      const form = list(call.xs, call.span);
      if (!match(r.pat, form, b)) continue;
      return substitute(r.tmpl, b);
    }
    throw new Error(`no syntax-rules matched for ${name}`);
  };

  return { name, expand };
}
```
^ref-cbfe3513-9-0
 ^ref-cbfe3513-215-0
Hook it into your macro environment:
 ^ref-cbfe3513-217-0
```ts
// shared/js/prom-lib/compiler/lisp/expand.ts (additions)
import { makeSyntaxRules } from "./syntax-rules";

// inside macroexpandAll(), before returning:
function expand(x:S, M: MacroEnv): S {
  if (x.t!=="list" || x.xs.length===0) return x;

  // (define-syntax name (syntax-rules ...))
  if (isList(x, "define-syntax")) {
    const { name, expand: expander } = makeSyntaxRules(x as any);
    M.define(name, (form) => expander(form as any));
    return sym("nil");
  }

  // existing defmacro, macro call, etc...
  // ...
}
^ref-cbfe3513-217-0
```

---

# 2) Friendlier Lisp core: `and`, `or`, var-arity `+ - * /`

### 2a) Macros for `and` / `or` ^ref-cbfe3513-243-0

```ts
// shared/js/prom-lib/compiler/lisp/macros.ts (append in installCoreMacros)
M.define("and", (form) => {
  const [_tag, ...xs] = form.xs;
  if (xs.length === 0) return sym("true");
  if (xs.length === 1) return xs[0];
  // (and a b c) => (if a (and b c) false)
  const [a, ...rest] = xs;
  return list([sym("if"), a, list([sym("and"), ...rest]), sym("false")]);
});

M.define("or", (form) => {
  const [_tag, ...xs] = form.xs;
  if (xs.length === 0) return sym("false");
  if (xs.length === 1) return xs[0];
  // (or a b c) => (if a a (or b c))
  const [a, ...rest] = xs;
  return list([sym("if"), a, a, list([sym("or"), ...rest])]);
^ref-cbfe3513-243-0
});
```

### 2b) Make `+ - * /` accept any number of args

```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts (near the "binOp" handling)
function foldNary(op:string, args:S[], span:any): Expr {
  if (args.length === 0) return { kind:"Num", value: (op==="*" ? 1 : 0), span };
  if (args.length === 1) {
    if (op === "-") return { kind:"Un", op:"-", expr: toExpr(args[0]), span };
    return toExpr(args[0]);
  }
  let acc = { kind:"Bin", op, left: toExpr(args[0]), right: toExpr(args[1]), span } as any;
  for (let i=2;i<args.length;i++) {
    acc = { kind:"Bin", op, left: acc, right: toExpr(args[i]), span } as any;
  }
  return acc;
}

// replace the old binOp block:
if (hd.t==="sym" && ["+","-","*","/","%","<",">","<=",">=","==","!="].includes(hd.name)) {
  const args = x.xs.slice(1);
  if (["<",">","<=",">=","==","!="].includes(hd.name) && args.length !== 2) {
    throw new Error(`${hd.name} expects 2 args`);
  }
  if (["+", "-", "*", "/", "%"].includes(hd.name)) {
    return foldNary(hd.name, args as S[], x.span!);
  }
  // relational still binary
  return { kind:"Bin", op: hd.name, left: toExpr(args[0]), right: toExpr(args[1]), span:x.span! } as any;
}
```

---
 ^ref-cbfe3513-299-0
# 3) Externs (host imports) without “unbound” errors
 ^ref-cbfe3513-301-0
Add an overload that seeds the lowerer’s environment with extern names, so `print`, `sin`, etc. are treated as bound variables (to be imported in JS).

```ts
// shared/js/prom-lib/compiler/lower.ts (add this helper)
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lowerWithExterns(ast: any, externs: string[] = []): Module {
  const env: Map<string, Sym> = new Map();
  // seed externs with stable symbols (no gensym) so JS import destructuring matches
  for (const name of externs) env.set(name, name as unknown as Sym);
  const stmts: Stmt[] = [];
  const result = lowerExpr(ast, env, stmts);
  stmts.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: stmts };
^ref-cbfe3513-301-0
  return { funs: [], main }; ^ref-cbfe3513-317-0
}
```
^ref-cbfe3513-304-0
^ref-cbfe3513-319-0

Use it in the Lisp driver:

```ts
// shared/js/prom-lib/compiler/lisp/driver.ts (swap in)
import { lowerWithExterns } from "../lower";
import { emitJS } from "../jsgen";

export function compileLispToJS(src: string, { pretty=false, importNames=[] as string[] } = {}) {
  const forms = read(src);
  const expanded = macroexpandAll(forms);
  const program = expanded.length===1 ? expanded[0] : { t:"list", xs:[{t:"sym",name:"begin"}, ...expanded] } as any;
  const ast = toExpr(program as any);
  const ir = lowerWithExterns(ast, importNames);
^ref-cbfe3513-319-0
  const js = emitJS(ir, { iife:false, importNames, pretty });
  return { forms, expanded, ast, ir, js };
}
```
 ^ref-cbfe3513-339-0 ^ref-cbfe3513-341-0
--- ^ref-cbfe3513-341-0

# 4) Tiny stdlib (userland) you can require

You can load this as the first form in your Lisp source or pre-concatenate it:

```lisp
; shared/js/prom-lib/compiler/lisp/prelude.lisp
; arithmetic n-ary handled in compiler; here are basic list ops:

(define-syntax when
  (syntax-rules ()
    ((when test body ...) (if test (begin body ...) nil))))

(define-syntax unless
  (syntax-rules ()
    ((unless test body ...) (if (not test) (begin body ...) nil))))

(define-syntax -> 
  (syntax-rules ()
^ref-cbfe3513-341-0
    ((-> x) x)
    ((-> x (f args ...) rest ...) (-> (f x args ...) rest ...))))

; You can add more: cond, let*, etc., using syntax-rules now.
^ref-cbfe3513-365-0
^ref-cbfe3513-365-0
```

---

# 5) Quick demo

```ts
import { compileLispToJS } from "./compiler/lisp/driver";

const src = `
  (define-syntax inc
    (syntax-rules ()
      ((inc x) (+ x 1))))

  (let ((x 2))
    (when (< x 10)
      (print (-> x inc inc (+ 38)))))
`;
^ref-cbfe3513-365-0

const { js } = compileLispToJS(src, { pretty:true, importNames:["print"] });
console.log(js);
// run it:
^ref-cbfe3513-389-0 ^ref-cbfe3513-390-0
^ref-cbfe3513-392-0 ^ref-cbfe3513-393-0
^ref-cbfe3513-391-0
^ref-cbfe3513-390-0 ^ref-cbfe3513-395-0
^ref-cbfe3513-389-0
^ref-cbfe3513-388-0 ^ref-cbfe3513-397-0
^ref-cbfe3513-373-0
(0, eval)(js)({ print: console.log });  // => 42 ^ref-cbfe3513-388-0 ^ref-cbfe3513-391-0 ^ref-cbfe3513-399-0
``` ^ref-cbfe3513-389-0 ^ref-cbfe3513-392-0
^ref-cbfe3513-389-0 ^ref-cbfe3513-393-0
^ref-cbfe3513-388-0 ^ref-cbfe3513-402-0
 ^ref-cbfe3513-390-0 ^ref-cbfe3513-393-0 ^ref-cbfe3513-395-0
--- ^ref-cbfe3513-391-0
 ^ref-cbfe3513-392-0 ^ref-cbfe3513-395-0 ^ref-cbfe3513-397-0
# 6) What’s next (pick a lane) ^ref-cbfe3513-393-0 ^ref-cbfe3513-406-0
 ^ref-cbfe3513-397-0 ^ref-cbfe3513-399-0
* **Hygiene**: add scope-sets to `Sym` and a resolver so macros can’t accidentally capture user vars. ^ref-cbfe3513-395-0 ^ref-cbfe3513-408-0
* **Modules**: `(require "prelude.lisp")` with caching + macro phase separation (so required macros expand at compile time). ^ref-cbfe3513-399-0
* **Pattern goodness**: a `match` macro (built on `syntax-rules` or `syntax-case`) with guards. ^ref-cbfe3513-397-0 ^ref-cbfe3513-402-0
* **Interop**: `(js . ...)` macro for direct JS property/method calls safely.
* **Optimizations**: const folding & DCE over ANF IR before JS emission. ^ref-cbfe3513-399-0 ^ref-cbfe3513-402-0 ^ref-cbfe3513-412-0
* **Source maps**: map Lisp spans → JS for friendly stack traces.
 ^ref-cbfe3513-406-0
Tell me which slice you want next and I’ll shovel more code.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [template-based-compilation](template-based-compilation.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [DSL](chunks/dsl.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [archetype-ecs](archetype-ecs.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [JavaScript](chunks/javascript.md)
- [Window Management](chunks/window-management.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Diagrams](chunks/diagrams.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Services](chunks/services.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [balanced-bst](balanced-bst.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [graph-ds](graph-ds.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Operations](chunks/operations.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean State Format](promethean-state-format.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
## Sources
- [Lisp-Compiler-Integration — L1](lisp-compiler-integration.md#^ref-cfee6d36-1-0) (line 1, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L423](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-423-0) (line 423, col 0, score 0.75)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.68)
- [Interop and Source Maps — L7](interop-and-source-maps.md#^ref-cdfac40c-7-0) (line 7, col 0, score 0.79)
- [js-to-lisp-reverse-compiler — L1](js-to-lisp-reverse-compiler.md#^ref-58191024-1-0) (line 1, col 0, score 0.75)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.92)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.76)
- [compiler-kit-foundations — L602](compiler-kit-foundations.md#^ref-01b21543-602-0) (line 602, col 0, score 0.74)
- [Lisp-Compiler-Integration — L470](lisp-compiler-integration.md#^ref-cfee6d36-470-0) (line 470, col 0, score 0.7)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.92)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.73)
- [archetype-ecs — L467](archetype-ecs.md#^ref-8f4c1e86-467-0) (line 467, col 0, score 0.69)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 0.69)
- [Language-Agnostic Mirror System — L147](language-agnostic-mirror-system.md#^ref-d2b3628c-147-0) (line 147, col 0, score 0.77)
- [compiler-kit-foundations — L3](compiler-kit-foundations.md#^ref-01b21543-3-0) (line 3, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.71)
- [sibilant-macro-targets — L1](sibilant-macro-targets.md#^ref-c5c9a5c6-1-0) (line 1, col 0, score 0.71)
- [sibilant-meta-string-templating-runtime — L33](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-33-0) (line 33, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L137](sibilant-meta-prompt-dsl.md#^ref-af5d2824-137-0) (line 137, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.68)
- [Admin Dashboard for User Management — L51](admin-dashboard-for-user-management.md#^ref-2901a3e9-51-0) (line 51, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L436](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-436-0) (line 436, col 0, score 0.68)
- [aionian-circuit-math — L171](aionian-circuit-math.md#^ref-f2d83a77-171-0) (line 171, col 0, score 0.68)
- [archetype-ecs — L472](archetype-ecs.md#^ref-8f4c1e86-472-0) (line 472, col 0, score 0.68)
- [DSL — L11](chunks/dsl.md#^ref-e87bc036-11-0) (line 11, col 0, score 0.68)
- [JavaScript — L23](chunks/javascript.md#^ref-c1618c66-23-0) (line 23, col 0, score 0.68)
- [Window Management — L18](chunks/window-management.md#^ref-9e8ae388-18-0) (line 18, col 0, score 0.68)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.73)
- [Lisp-Compiler-Integration — L151](lisp-compiler-integration.md#^ref-cfee6d36-151-0) (line 151, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L340](js-to-lisp-reverse-compiler.md#^ref-58191024-340-0) (line 340, col 0, score 0.74)
- [set-assignment-in-lisp-ast — L25](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-25-0) (line 25, col 0, score 0.73)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.82)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L405](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-405-0) (line 405, col 0, score 0.71)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.76)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.74)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.56)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.7)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.78)
- [Mongo Outbox Implementation — L263](mongo-outbox-implementation.md#^ref-9c1acd1e-263-0) (line 263, col 0, score 0.67)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.69)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.69)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.94)
- [Mongo Outbox Implementation — L152](mongo-outbox-implementation.md#^ref-9c1acd1e-152-0) (line 152, col 0, score 0.67)
- [Lisp-Compiler-Integration — L341](lisp-compiler-integration.md#^ref-cfee6d36-341-0) (line 341, col 0, score 0.57)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.57)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.67)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L109](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-109-0) (line 109, col 0, score 0.64)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.55)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.68)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L352](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-352-0) (line 352, col 0, score 0.65)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.7)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L451](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-451-0) (line 451, col 0, score 0.67)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.67)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.67)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.77)
- [TypeScript Patch for Tool Calling Support — L113](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-113-0) (line 113, col 0, score 0.59)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.57)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.57)
- [TypeScript Patch for Tool Calling Support — L106](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-106-0) (line 106, col 0, score 0.55)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.55)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.55)
- [Promethean Agent DSL TS Scaffold — L631](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-631-0) (line 631, col 0, score 0.55)
- [Interop and Source Maps — L68](interop-and-source-maps.md#^ref-cdfac40c-68-0) (line 68, col 0, score 0.73)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.76)
- [template-based-compilation — L33](template-based-compilation.md#^ref-f8877e5e-33-0) (line 33, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L421](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-421-0) (line 421, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L54](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-54-0) (line 54, col 0, score 0.75)
- [sibilant-metacompiler-overview — L57](sibilant-metacompiler-overview.md#^ref-61d4086b-57-0) (line 57, col 0, score 0.72)
- [template-based-compilation — L25](template-based-compilation.md#^ref-f8877e5e-25-0) (line 25, col 0, score 0.71)
- [sibilant-macro-targets — L15](sibilant-macro-targets.md#^ref-c5c9a5c6-15-0) (line 15, col 0, score 0.72)
- [Sibilant Meta-Prompt DSL — L74](sibilant-meta-prompt-dsl.md#^ref-af5d2824-74-0) (line 74, col 0, score 0.65)
- [template-based-compilation — L84](template-based-compilation.md#^ref-f8877e5e-84-0) (line 84, col 0, score 0.71)
- [sibilant-meta-string-templating-runtime — L19](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-19-0) (line 19, col 0, score 0.72)
- [sibilant-metacompiler-overview — L15](sibilant-metacompiler-overview.md#^ref-61d4086b-15-0) (line 15, col 0, score 0.74)
- [Cross-Target Macro System in Sibilant — L153](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-153-0) (line 153, col 0, score 0.7)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.72)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.76)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.58)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.56)
- [Lisp-Compiler-Integration — L3](lisp-compiler-integration.md#^ref-cfee6d36-3-0) (line 3, col 0, score 0.55)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [js-to-lisp-reverse-compiler — L404](js-to-lisp-reverse-compiler.md#^ref-58191024-404-0) (line 404, col 0, score 0.68)
- [set-assignment-in-lisp-ast — L56](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-56-0) (line 56, col 0, score 0.66)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.94)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.93)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L359](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-359-0) (line 359, col 0, score 0.79)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.64)
- [set-assignment-in-lisp-ast — L106](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-106-0) (line 106, col 0, score 0.64)
- [universal-intention-code-fabric — L353](universal-intention-code-fabric.md#^ref-c14edce7-353-0) (line 353, col 0, score 0.64)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.64)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.76)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.79)
- [set-assignment-in-lisp-ast — L5](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-5-0) (line 5, col 0, score 0.74)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.73)
- [AI-Centric OS with MCP Layer — L413](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-413-0) (line 413, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L210](cross-language-runtime-polymorphism.md#^ref-c34c36a6-210-0) (line 210, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L189](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-189-0) (line 189, col 0, score 0.67)
- [Duck's Attractor States — L84](ducks-attractor-states.md#^ref-13951643-84-0) (line 84, col 0, score 0.67)
- [Duck's Self-Referential Perceptual Loop — L40](ducks-self-referential-perceptual-loop.md#^ref-71726f04-40-0) (line 40, col 0, score 0.67)
- [heartbeat-simulation-snippets — L94](heartbeat-simulation-snippets.md#^ref-23e221e9-94-0) (line 94, col 0, score 0.67)
- [Obsidian ChatGPT Plugin Integration Guide — L35](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-35-0) (line 35, col 0, score 0.75)
- [Obsidian ChatGPT Plugin Integration — L35](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-35-0) (line 35, col 0, score 0.75)
- [js-to-lisp-reverse-compiler — L5](js-to-lisp-reverse-compiler.md#^ref-58191024-5-0) (line 5, col 0, score 0.68)
- [Lisp-Compiler-Integration — L472](lisp-compiler-integration.md#^ref-cfee6d36-472-0) (line 472, col 0, score 0.71)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 0.69)
- [Interop and Source Maps — L514](interop-and-source-maps.md#^ref-cdfac40c-514-0) (line 514, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 0.69)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#^ref-d2b3628c-534-0) (line 534, col 0, score 0.69)
- [Lisp-Compiler-Integration — L536](lisp-compiler-integration.md#^ref-cfee6d36-536-0) (line 536, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-515-0) (line 515, col 0, score 0.69)
- [set-assignment-in-lisp-ast — L139](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-139-0) (line 139, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L425](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-425-0) (line 425, col 0, score 0.76)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.73)
- [js-to-lisp-reverse-compiler — L308](js-to-lisp-reverse-compiler.md#^ref-58191024-308-0) (line 308, col 0, score 0.69)
- [Lisp-Compiler-Integration — L518](lisp-compiler-integration.md#^ref-cfee6d36-518-0) (line 518, col 0, score 0.81)
- [sibilant-macro-targets — L29](sibilant-macro-targets.md#^ref-c5c9a5c6-29-0) (line 29, col 0, score 0.7)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.68)
- [sibilant-macro-targets — L85](sibilant-macro-targets.md#^ref-c5c9a5c6-85-0) (line 85, col 0, score 0.71)
- [Mongo Outbox Implementation — L536](mongo-outbox-implementation.md#^ref-9c1acd1e-536-0) (line 536, col 0, score 0.68)
- [Interop and Source Maps — L507](interop-and-source-maps.md#^ref-cdfac40c-507-0) (line 507, col 0, score 0.77)
- [Lisp-Compiler-Integration — L519](lisp-compiler-integration.md#^ref-cfee6d36-519-0) (line 519, col 0, score 0.77)
- [Lisp-Compiler-Integration — L528](lisp-compiler-integration.md#^ref-cfee6d36-528-0) (line 528, col 0, score 0.73)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.65)
- [Recursive Prompt Construction Engine — L137](recursive-prompt-construction-engine.md#^ref-babdb9eb-137-0) (line 137, col 0, score 0.74)
- [Sibilant Meta-Prompt DSL — L67](sibilant-meta-prompt-dsl.md#^ref-af5d2824-67-0) (line 67, col 0, score 0.72)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.72)
- [sibilant-macro-targets — L105](sibilant-macro-targets.md#^ref-c5c9a5c6-105-0) (line 105, col 0, score 0.72)
- [sibilant-macro-targets — L153](sibilant-macro-targets.md#^ref-c5c9a5c6-153-0) (line 153, col 0, score 0.71)
- [Sibilant Meta-Prompt DSL — L150](sibilant-meta-prompt-dsl.md#^ref-af5d2824-150-0) (line 150, col 0, score 0.7)
- [lisp-dsl-for-window-management — L140](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-140-0) (line 140, col 0, score 0.75)
- [Lisp-Compiler-Integration — L533](lisp-compiler-integration.md#^ref-cfee6d36-533-0) (line 533, col 0, score 0.62)
- [Promethean State Format — L70](promethean-state-format.md#^ref-23df6ddb-70-0) (line 70, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L134](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-134-0) (line 134, col 0, score 0.72)
- [template-based-compilation — L66](template-based-compilation.md#^ref-f8877e5e-66-0) (line 66, col 0, score 0.69)
- [sibilant-metacompiler-overview — L65](sibilant-metacompiler-overview.md#^ref-61d4086b-65-0) (line 65, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.74)
- [Cross-Target Macro System in Sibilant — L74](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-74-0) (line 74, col 0, score 0.72)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.72)
- [polymorphic-meta-programming-engine — L123](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-123-0) (line 123, col 0, score 0.71)
- [polyglot-repl-interface-layer — L76](polyglot-repl-interface-layer.md#^ref-9c79206d-76-0) (line 76, col 0, score 0.7)
- [polyglot-repl-interface-layer — L56](polyglot-repl-interface-layer.md#^ref-9c79206d-56-0) (line 56, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.69)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.77)
- [compiler-kit-foundations — L599](compiler-kit-foundations.md#^ref-01b21543-599-0) (line 599, col 0, score 0.72)
- [universal-intention-code-fabric — L419](universal-intention-code-fabric.md#^ref-c14edce7-419-0) (line 419, col 0, score 0.71)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.71)
- [Interop and Source Maps — L8](interop-and-source-maps.md#^ref-cdfac40c-8-0) (line 8, col 0, score 0.66)
- [Language-Agnostic Mirror System — L522](language-agnostic-mirror-system.md#^ref-d2b3628c-522-0) (line 522, col 0, score 0.66)
- [Language-Agnostic Mirror System — L4](language-agnostic-mirror-system.md#^ref-d2b3628c-4-0) (line 4, col 0, score 0.64)
- [Language-Agnostic Mirror System — L234](language-agnostic-mirror-system.md#^ref-d2b3628c-234-0) (line 234, col 0, score 0.64)
- [Lisp-Compiler-Integration — L529](lisp-compiler-integration.md#^ref-cfee6d36-529-0) (line 529, col 0, score 0.9)
- [Interop and Source Maps — L497](interop-and-source-maps.md#^ref-cdfac40c-497-0) (line 497, col 0, score 0.79)
- [Interop and Source Maps — L9](interop-and-source-maps.md#^ref-cdfac40c-9-0) (line 9, col 0, score 0.77)
- [Interop and Source Maps — L317](interop-and-source-maps.md#^ref-cdfac40c-317-0) (line 317, col 0, score 0.73)
- [js-to-lisp-reverse-compiler — L397](js-to-lisp-reverse-compiler.md#^ref-58191024-397-0) (line 397, col 0, score 0.7)
- [Interop and Source Maps — L12](interop-and-source-maps.md#^ref-cdfac40c-12-0) (line 12, col 0, score 0.69)
- [DSL — L9](chunks/dsl.md#^ref-e87bc036-9-0) (line 9, col 0, score 0.69)
- [JavaScript — L39](chunks/javascript.md#^ref-c1618c66-39-0) (line 39, col 0, score 0.69)
- [Window Management — L19](chunks/window-management.md#^ref-9e8ae388-19-0) (line 19, col 0, score 0.69)
- [compiler-kit-foundations — L604](compiler-kit-foundations.md#^ref-01b21543-604-0) (line 604, col 0, score 0.69)
- [Board Walk – 2025-08-11 — L127](board-walk-2025-08-11.md#^ref-7aa1eb92-127-0) (line 127, col 0, score 0.68)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.65)
- [Canonical Org-Babel Matplotlib Animation Template — L69](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-69-0) (line 69, col 0, score 0.65)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.64)
- [plan-update-confirmation — L913](plan-update-confirmation.md#^ref-b22d79c6-913-0) (line 913, col 0, score 0.62)
- [Smoke Resonance Visualizations — L74](smoke-resonance-visualizations.md#^ref-ac9d3ac5-74-0) (line 74, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L300](chroma-embedding-refactor.md#^ref-8b256935-300-0) (line 300, col 0, score 0.62)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.62)
- [Factorio AI with External Agents — L106](factorio-ai-with-external-agents.md#^ref-a4d90289-106-0) (line 106, col 0, score 0.62)
- [Model Upgrade Calm-Down Guide — L58](model-upgrade-calm-down-guide.md#^ref-db74343f-58-0) (line 58, col 0, score 0.62)
- [compiler-kit-foundations — L605](compiler-kit-foundations.md#^ref-01b21543-605-0) (line 605, col 0, score 1)
- [Interop and Source Maps — L512](interop-and-source-maps.md#^ref-cdfac40c-512-0) (line 512, col 0, score 1)
- [js-to-lisp-reverse-compiler — L409](js-to-lisp-reverse-compiler.md#^ref-58191024-409-0) (line 409, col 0, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#^ref-d2b3628c-533-0) (line 533, col 0, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#^ref-cfee6d36-538-0) (line 538, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L512](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-512-0) (line 512, col 0, score 1)
- [Promethean Agent Config DSL — L338](promethean-agent-config-dsl.md#^ref-2c00ce45-338-0) (line 338, col 0, score 1)
- [template-based-compilation — L144](template-based-compilation.md#^ref-f8877e5e-144-0) (line 144, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [homeostasis-decay-formulas — L175](homeostasis-decay-formulas.md#^ref-37b5d236-175-0) (line 175, col 0, score 1)
- [Interop and Source Maps — L535](interop-and-source-maps.md#^ref-cdfac40c-535-0) (line 535, col 0, score 1)
- [komorebi-group-window-hack — L202](komorebi-group-window-hack.md#^ref-dd89372d-202-0) (line 202, col 0, score 1)
- [Lisp-Compiler-Integration — L543](lisp-compiler-integration.md#^ref-cfee6d36-543-0) (line 543, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#^ref-cdfac40c-515-0) (line 515, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
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
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 1)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 1)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 1)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L410](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-410-0) (line 410, col 0, score 1)
- [Unique Info Dump Index — L72](unique-info-dump-index.md#^ref-30ec3ba6-72-0) (line 72, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
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
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
