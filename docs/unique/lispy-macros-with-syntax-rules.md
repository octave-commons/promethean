---
uuid: 3a5c8986-257e-4e1e-a005-dd40bb4103c8
created_at: lispy-macros-with-syntax-rules.md
filename: Lispy Macros with Syntax Rules
title: Lispy Macros with Syntax Rules
description: >-
  This document explains how to implement Lispy macros using `syntax-rules` for
  hygienic macro expansion, enhance Lisp syntax with `and`/`or` and n-ary
  operators, and enable seamless integration of host functions like `print`
  through externs.
tags:
  - Lispy
  - syntax-rules
  - hygienic
  - macros
  - Lisp
  - n-ary
  - externs
  - compiler
related_to_uuid:
  - cce2f5f9-557e-4d35-9dff-5c29ca71efd2
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
related_to_title:
  - ollama-llm-provider-for-pseudo-code-transpiler
  - Smoke Resonance Visualizations
  - Stateful Partitions and Rebalancing
  - Tracing the Signal
  - ts-to-lisp-transpiler
  - typed-struct-compiler
  - TypeScript Patch for Tool Calling Support
  - Unique Concepts
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - field-node-diagram-outline
  - field-node-diagram-set
  - Docops Feature Updates
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Agent Reflections and Prompt Evolution
  - ChatGPT Custom Prompts
  - Chroma Toolkit Consolidation Plan
references:
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 483
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1321
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 561
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 522
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1015
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1228
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 173
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1057
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 513
    col: 0
    score: 1
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
  - uuid: cce2f5f9-557e-4d35-9dff-5c29ca71efd2
    line: 1
    col: 0
    score: 1
  - uuid: cce2f5f9-557e-4d35-9dff-5c29ca71efd2
    line: 7
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 113
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 151
    col: 0
    score: 0.95
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 110
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 492
    col: 0
    score: 0.95
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 265
    col: 0
    score: 0.95
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 253
    col: 0
    score: 0.95
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 224
    col: 0
    score: 0.95
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 196
    col: 0
    score: 0.95
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 222
    col: 0
    score: 0.95
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 409
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 227
    col: 0
    score: 0.95
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 200
    col: 0
    score: 0.95
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 60
    col: 0
    score: 0.94
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 366
    col: 0
    score: 0.94
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 322
    col: 0
    score: 0.93
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 0.91
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 426
    col: 0
    score: 0.87
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 459
    col: 0
    score: 0.87
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.87
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.87
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.87
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.87
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 134
    col: 0
    score: 0.86
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 498
    col: 0
    score: 0.86
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 973
    col: 0
    score: 0.86
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 10
    col: 0
    score: 0.85
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 343
    col: 0
    score: 0.85
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
^ref-29676fd0-304-0
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
^ref-cbfe3513-325-0
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
 ^ref-cbfe3513-375-0
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
^ref-cbfe3513-375-0
``` ^ref-cbfe3513-389-0 ^ref-cbfe3513-392-0
^ref-cbfe3513-376-0
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
Tell me which slice you want next and I’ll shovel more code.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ollama-llm-provider-for-pseudo-code-transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Tracing the Signal](tracing-the-signal.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Unique Concepts](unique-concepts.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
## Sources
- [Smoke Resonance Visualizations — L483](smoke-resonance-visualizations.md#^ref-ac9d3ac5-483-0) (line 483, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1321](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1321-0) (line 1321, col 0, score 1)
- [Tracing the Signal — L561](tracing-the-signal.md#^ref-c3cd4f65-561-0) (line 561, col 0, score 1)
- [ts-to-lisp-transpiler — L522](ts-to-lisp-transpiler.md#^ref-ba11486b-522-0) (line 522, col 0, score 1)
- [typed-struct-compiler — L1015](typed-struct-compiler.md#^ref-78eeedf7-1015-0) (line 1015, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1228](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1228-0) (line 1228, col 0, score 1)
- [Unique Concepts — L173](unique-concepts.md#^ref-ed6f3fc9-173-0) (line 173, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1057](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1057-0) (line 1057, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L513](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-513-0) (line 513, col 0, score 1)
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
- [ollama-llm-provider-for-pseudo-code-transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-cce2f5f9-1-0) (line 1, col 0, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-cce2f5f9-7-0) (line 7, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L113](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-113-0) (line 113, col 0, score 0.95)
- [Duck's Attractor States — L151](ducks-attractor-states.md#^ref-13951643-151-0) (line 151, col 0, score 0.95)
- [Duck's Self-Referential Perceptual Loop — L110](ducks-self-referential-perceptual-loop.md#^ref-71726f04-110-0) (line 110, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L492](dynamic-context-model-for-web-components.md#^ref-f7702bf8-492-0) (line 492, col 0, score 0.95)
- [Eidolon Field Abstract Model — L265](eidolon-field-abstract-model.md#^ref-5e8b2388-265-0) (line 265, col 0, score 0.95)
- [Factorio AI with External Agents — L253](factorio-ai-with-external-agents.md#^ref-a4d90289-253-0) (line 253, col 0, score 0.95)
- [field-dynamics-math-blocks — L224](field-dynamics-math-blocks.md#^ref-7cfc230d-224-0) (line 224, col 0, score 0.95)
- [field-node-diagram-outline — L196](field-node-diagram-outline.md#^ref-1f32c94a-196-0) (line 196, col 0, score 0.95)
- [field-node-diagram-set — L222](field-node-diagram-set.md#^ref-22b989d5-222-0) (line 222, col 0, score 0.95)
- [Functional Embedding Pipeline Refactor — L409](functional-embedding-pipeline-refactor.md#^ref-a4a25141-409-0) (line 409, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L227](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-227-0) (line 227, col 0, score 0.95)
- [heartbeat-fragment-demo — L200](heartbeat-fragment-demo.md#^ref-dd00677a-200-0) (line 200, col 0, score 0.95)
- [set-assignment-in-lisp-ast — L60](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-60-0) (line 60, col 0, score 0.94)
- [compiler-kit-foundations — L366](compiler-kit-foundations.md#^ref-01b21543-366-0) (line 366, col 0, score 0.94)
- [Interop and Source Maps — L322](interop-and-source-maps.md#^ref-cdfac40c-322-0) (line 322, col 0, score 0.93)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.91)
- [Interop and Source Maps — L426](interop-and-source-maps.md#^ref-cdfac40c-426-0) (line 426, col 0, score 0.87)
- [Lisp-Compiler-Integration — L459](lisp-compiler-integration.md#^ref-cfee6d36-459-0) (line 459, col 0, score 0.87)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 0.87)
- [ecs-offload-workers — L427](ecs-offload-workers.md#^ref-6498b9d7-427-0) (line 427, col 0, score 0.87)
- [Event Bus MVP — L527](event-bus-mvp.md#^ref-534fe91d-527-0) (line 527, col 0, score 0.87)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.87)
- [Cross-Language Runtime Polymorphism — L134](cross-language-runtime-polymorphism.md#^ref-c34c36a6-134-0) (line 134, col 0, score 0.86)
- [Interop and Source Maps — L498](interop-and-source-maps.md#^ref-cdfac40c-498-0) (line 498, col 0, score 0.86)
- [Promethean Event Bus MVP v0.1 — L973](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-973-0) (line 973, col 0, score 0.86)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.85)
- [js-to-lisp-reverse-compiler — L343](js-to-lisp-reverse-compiler.md#^ref-58191024-343-0) (line 343, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
