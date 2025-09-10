---
uuid: b6401ea8-1eb3-4f4c-8952-2c9b64f16106
created_at: lisp-compiler-integration.md
filename: lisp-compiler-integration
title: lisp-compiler-integration
description: >-
  A minimal, hygienic-ish Lisp front-end that integrates with the existing
  compiler pipeline (IR → JS) using a macro-first approach. It includes a
  reader, macro system, macroexpander, quasiquote engine, and compiler from
  Lispy AST to Expr.
tags:
  - lisp
  - compiler
  - macro
  - hygienic
  - syntax
  - reader
  - macroexpander
  - quasiquote
  - compiler-integration
related_to_uuid:
  - cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 18138627-a348-4fbb-b447-410dfb400564
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 5a02283e-4281-4930-9ca7-e27849de11bd
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
related_to_title:
  - Refactor Frontmatter Processing
  - file-watcher-auth-fix
  - Local-Offline-Model-Deployment-Strategy
  - Promethean Dev Workflow Update
  - The Jar of Echoes
  - Chroma Toolkit Consolidation Plan
  - Docops Feature Updates
  - Provider-Agnostic Chat Panel Implementation
  - Per-Domain Policy System for JS Crawler
  - Promethean-Copilot-Intent-Engine
  - Shared Package Structure
  - Interop and Source Maps
  - Exception Layer Analysis
  - Pipeline Enhancements
  - plan-update-confirmation
  - polyglot-repl-interface-layer
  - Performance-Optimized-Polyglot-Bridge
  - Model Upgrade Calm-Down Guide
  - Obsidian Templating Plugins Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - Model Selection for Lightweight Conversational Tasks
  - obsidian-ignore-node-modules-regex
  - NPU Voice Code and Sensory Integration
  - Lispy Macros with syntax-rules
references:
  - uuid: cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
    line: 11
    col: 0
    score: 1
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.99
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17867
    col: 0
    score: 0.9
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17457
    col: 0
    score: 0.9
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1749
    col: 0
    score: 0.9
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 1010
    col: 0
    score: 0.9
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1270
    col: 0
    score: 0.9
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 3042
    col: 0
    score: 0.9
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3347
    col: 0
    score: 0.9
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3746
    col: 0
    score: 0.9
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 426
    col: 0
    score: 0.88
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 325
    col: 0
    score: 0.87
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.87
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 563
    col: 0
    score: 0.87
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1047
    col: 0
    score: 0.87
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 929
    col: 0
    score: 0.87
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 917
    col: 0
    score: 0.87
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1317
    col: 0
    score: 0.87
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1141
    col: 0
    score: 0.87
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1608
    col: 0
    score: 0.87
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1524
    col: 0
    score: 0.87
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 580
    col: 0
    score: 0.87
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2018
    col: 0
    score: 0.87
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1274
    col: 0
    score: 0.87
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 973
    col: 0
    score: 0.86
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.86
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 401
    col: 0
    score: 0.86
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.86
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.86
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.85
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 189
    col: 0
    score: 0.85
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 54
    col: 0
    score: 0.85
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 188
    col: 0
    score: 0.85
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 212
    col: 0
    score: 0.85
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 137
    col: 0
    score: 0.85
---
Oh we’re doing *our* Lisp. Love that energy. Here’s a **minimal, hygienic-ish, macro-first Lisp front-end** that plugs into the compiler pipeline you already have (IR → JS). It’s small, fast, and pragmatically powerful: ^ref-cfee6d36-1-0

* S-expr **reader** with `'`, `` ` ``, `,`, `,@` ^ref-cfee6d36-3-0
* **Macro system** (defmacro with quasiquote) + **gensym** ^ref-cfee6d36-4-0
* **Macroexpander** (top-level + nested) ^ref-cfee6d36-5-0
* **Quasiquote** engine that handles unquote/splice
* **Compiler** from Lispy AST → your existing **Expr** → IR → JS ^ref-cfee6d36-7-0

Paste under `shared/js/prom-lib/compiler/lisp/`. ^ref-cfee6d36-9-0

# 0) Shape of the pipeline

```mermaid
flowchart LR
  src[(Lisp source)] --> read[reader]
  read --> expand[macroexpand (defmacro + qq)]
  expand --> core[core forms (if let fn begin ...)]
  core --> transpile[Lispy->Expr]
  transpile --> lower[AST->IR (existing)]
  lower --> js[emit JS (existing)]
```
^ref-cfee6d36-13-0

---

# 1) Syntax & reader
 ^ref-cfee6d36-27-0
```ts
// shared/js/prom-lib/compiler/lisp/syntax.ts
export type Span = { start:number; end:number; line:number; col:number };
export type Sym = { t:"sym"; name:string; gensym?: string; span?:Span };
export type Num = { t:"num"; v:number; span?:Span };
export type Str = { t:"str"; v:string; span?:Span };
export type Bool = { t:"bool"; v:boolean; span?:Span };
export type Nil = { t:"nil"; span?:Span };
export type List = { t:"list"; xs:S[]; span?:Span };

export type S = Sym|Num|Str|Bool|Nil|List;

export const nil: Nil = { t:"nil" };
export const sym = (name:string, span?:Span): Sym => ({ t:"sym", name, span });
export const list = (xs:S[], span?:Span): List => ({ t:"list", xs, span });
export const num = (v:number, span?:Span): Num => ({ t:"num", v, span });
export const str = (v:string, span?:Span): Str => ({ t:"str", v, span });
export const bool = (v:boolean, span?:Span): Bool => ({ t:"bool", v, span });

let _gid = 0;
export function gensym(prefix="g"): Sym { return { t:"sym", name: `${prefix}`, gensym: `${prefix}$${_gid++}` }; }
export function symName(x: Sym): string { return x.gensym ?? x.name; }
export const isSym = (x:S, n?:string) => x.t === "sym" && (n ? (x as Sym).name === n : true);
export const isList = (x:S, n?:string) => x.t === "list" && (n ? ((x as List).xs[0]?.t==="sym" && ((x as List).xs[0] as Sym).name===n) : true);
^ref-cfee6d36-27-0
```
^ref-cfee6d36-53-0 ^ref-cfee6d36-54-0

```ts
// shared/js/prom-lib/compiler/lisp/reader.ts
import { Span, S, Sym, List, Nil, num, str, bool, sym, list, nil } from "./syntax";

type Tok =
  | { k:"id"; s:string; sp:Span }
  | { k:"num"; s:string; sp:Span }
  | { k:"str"; s:string; sp:Span }
  | { k:"p"; s:string; sp:Span }
  | { k:"eof"; sp:Span };

export function read(src:string): S[] {
  const tks = lex(src);
  let i=0;
  const peek = ()=>tks[i];
  const next = ()=>tks[i++];

  function readDatum(): S {
    const t = next();
    if (t.k==="eof") return nil;
    if (t.k==="num") return num(parseFloat(t.s), t.sp);
    if (t.k==="str") return str(t.s, t.sp);
    if (t.k==="id") {
      if (t.s==="true") return bool(true, t.sp);
      if (t.s==="false") return bool(false, t.sp);
      if (t.s==="nil") return nil;
      return sym(t.s, t.sp);
    }
    if (t.k==="p") {
      if (t.s==="(") {
        const xs:S[] = [];
        while (!(peek().k==="p" && peek().s===")")) xs.push(readDatum());
        next(); // )
        return list(xs, t.sp);
      }
      // quote / quasiquote / unquotes
      if (t.s==="'")  return list([sym("quote",t.sp), readDatum()], t.sp);
      if (t.s==="`")  return list([sym("quasiquote",t.sp), readDatum()], t.sp);
      if (t.s===",")  return list([sym("unquote",t.sp), readDatum()], t.sp);
      if (t.s===",@") return list([sym("unquote-splicing",t.sp), readDatum()], t.sp);
    }
    throw new Error(`unexpected token ${JSON.stringify(t)}`);
  }

  const out:S[] = [];
  while (peek().k!=="eof") out.push(readDatum());
  return out;
}

// --- tiny lexer ---
function lex(src:string): Tok[] {
  const out:Tok[]=[]; let i=0, line=1, col=1;
  const span = (start:number):Span => ({ start, end:i, line, col });
  const push=(k:any,s:string,st:number)=>out.push({k,s,sp:{start:st,end:i,line,col}});
  const two = ()=>src.slice(i,i+2);

  while (i<src.length) {
    const st=i;
    const c=src[i];
    if (c===" "||c==="\t"||c==="\r"){i++;col++;continue;}
    if (c==="\n"){i++;line++;col=1;continue;}
    if (c===";" ){while(i<src.length && src[i]!=="\n"){i++;col++;}continue;}

    if (c==="("||c===")") { i++;col++; push("p",c,st); continue; }
    if (c==="'"){i++;col++; push("p","'",st); continue;}
    if (c==="`"){i++;col++; push("p","`",st); continue;}
    if (c==="," && two()===",@"){i+=2;col+=2; push("p",",@",st); continue;}
    if (c===","){i++;col++; push("p",",",st); continue;}

    if (c==="\""||c==="'") {
      const q=c; i++; col++;
      let buf=""; while(i<src.length && src[i]!==q){ if(src[i]==="\\"){buf+=src[i+1]; i+=2; col+=2;} else {buf+=src[i]; i++; col++;}}
      i++; col++; push("str",buf,st); continue;
    }

    if (/[0-9]/.test(c) || (c==="." && /[0-9]/.test(src[i+1]||""))) {
      let j=i; while(/[0-9_]/.test(src[j]||"")) j++;
      if (src[j]==="."){ j++; while(/[0-9_]/.test(src[j]||"")) j++; }
      const s=src.slice(i,j).replace(/_/g,""); i=j; col+=(j-st); push("num",s,st); continue;
    }

    // symbol chars
    if (/[A-Za-z_\-\+\*\!\/\=\<\>\?\$:%]/.test(c)) {
      let j=i+1; while(/[A-Za-z0-9_\-\+\*\!\/\=\<\>\?\$:%\.]/.test(src[j]||"")) j++;
      const s=src.slice(i,j); i=j; col+=(j-st); push("id",s,st); continue;
    }

    throw new Error(`bad char '${c}'`);
  }
  out.push({k:"eof", sp:{start:i,end:i,line,col}});
  return out;
^ref-cfee6d36-53-0
}
```

--- ^ref-cfee6d36-151-0

# 2) Quasiquote & macro system

```ts
// shared/js/prom-lib/compiler/lisp/qq.ts
import { S, List, Sym, Nil, isList, isSym, list, sym, nil } from "./syntax";

export function qq(expr:S, env:Record<string, S>): S {
  // (quasiquote x) expands with , and ,@ substitutions from env
  if (!isList(expr, "quasiquote")) return expr;
  return expand((expr as List).xs[1], env);
}

function expand(x:S, env:Record<string,S>): S {
  if (isList(x, "unquote")) {
    const v = (x as List).xs[1];
    if (v.t!=="sym") throw new Error("unquote expects symbol");
    return env[v.name] ?? env[(v as any).gensym ?? ""] ?? v;
  }
  if (isList(x, "unquote-splicing")) {
    throw new Error(",@ only valid inside list contexts");
  }
  if (x.t!=="list") return x;
  // build list, handling splices
  const out:S[] = [];
  for (const el of x.xs) {
    if (isList(el, "unquote-splicing")) {
      const v = (el as List).xs[1];
      if (v.t!=="sym") throw new Error(",@ expects symbol");
      const xs = env[v.name] ?? env[(v as any).gensym ?? ""];
      if (!xs || xs.t!=="list") throw new Error(",@ needs a list");
      out.push(...xs.xs);
    } else {
      out.push(expand(el, env));
    }
  }
^ref-cfee6d36-151-0
  return list(out, x.span);
}
^ref-cfee6d36-188-0
```
^ref-cfee6d36-188-0 ^ref-cfee6d36-193-0

```ts
// shared/js/prom-lib/compiler/lisp/macros.ts
import { S, List, Sym, list, sym, isList, isSym, gensym } from "./syntax";
import { qq } from "./qq";

export type MacroFn = (form: List, expand: (x:S)=>S) => S;
export class MacroEnv {
  private m = new Map<string, MacroFn>();
  define(name: string, fn: MacroFn) { this.m.set(name, fn); }
  get(name: string) { return this.m.get(name); }
  has(name:string){ return this.m.has(name); }
}

// (defmacro name (a b . rest) `(... ,a ,@rest ...))
export function installCoreMacros(M: MacroEnv) {
  // defmacro
  M.define("defmacro", (form, expand) => {
    // (defmacro name (params...) body)
    const [_tag, nameS, paramsList, body] = form.xs;
    const name = (nameS as Sym).name;
    const { params, rest } = parseParams(paramsList as List);

    const fn: MacroFn = (call, expand2) => {
      const args = call.xs.slice(1);
      const env: Record<string, S> = {};
      params.forEach((p, i) => env[p] = args[i]);
      if (rest) env[rest] = list(args.slice(params.length));
      // body is typically a quasiquote; run qq with env
      const expanded = isList(body, "quasiquote") ? qq(body, env) : body;
      return expand(expanded); // allow nested macros inside result
    };
    M.define(name, fn);
    return sym("nil");
  });

  // when
  M.define("when", (form, expand) => {
    // (when test a b c) => (if test (begin a b c) nil)
    const [_tag, test, ...body] = form.xs;
    const begin = list([sym("begin"), ...body]);
    return list([sym("if"), test, begin, sym("nil")]);
  });

  // unless
  M.define("unless", (form, expand) => {
    const [_tag, test, ...body] = form.xs;
    const begin = list([sym("begin"), ...body]);
    return list([sym("if"), list([sym("not"), test]), begin, sym("nil")]);
  });

  // -> (thread-first)
  M.define("->", (form, expand) => {
    // (-> x (f 1) (g 2)) => (g (f x 1) 2)
    const [_tag, x, ...steps] = form.xs;
    let acc = x;
    for (const s of steps) {
      if (s.t!=="list" || s.xs.length===0) continue;
      const [f, ...args] = s.xs;
      acc = list([f, acc, ...args], s.span);
    }
    return acc;
  });

  // let* sugar -> nested lets
  M.define("let*", (form) => {
    // (let* ((a 1)(b 2)) body) => (let ((a 1)) (let ((b 2)) body))
    const [_tag, bindings, body] = form.xs;
    const pairs = (bindings as List).xs.map(b => (b as List).xs);
    let acc = body;
    for (let i=pairs.length-1;i>=0;i--) {
      const [n, v] = pairs[i];
      acc = list([sym("let"), list([list([n, v])]), acc]);
    }
    return acc;
  });

  // cond -> nested ifs
  M.define("cond", (form) => {
    const [_tag, ...clauses] = form.xs;
    const expandClause = (i:number): S => {
      if (i>=clauses.length) return sym("nil");
      const clause = clauses[i] as List;
      const [test, ...body] = clause.xs;
      if (isSym(test, "else")) return list([sym("begin"), ...body]);
      return list([sym("if"), test, list([sym("begin"), ...body]), expandClause(i+1)]);
    };
    return expandClause(0);
  });
}

function parseParams(p: List): { params:string[]; rest?:string } {
  // (a b c) or (a b . rest)
  const xs = p.xs;
  const params:string[]=[]; let rest: string | undefined;
  for (let i=0;i<xs.length;i++) {
    const a = xs[i];
    if (a.t==="sym" && a.name===".") { rest = (xs[i+1] as Sym).name; break; }
    params.push((a as Sym).name);
^ref-cfee6d36-188-0
  }
  return { params, rest };
^ref-cfee6d36-291-0
}
^ref-cfee6d36-291-0
```
^ref-cfee6d36-291-0 ^ref-cfee6d36-300-0

```ts
// shared/js/prom-lib/compiler/lisp/expand.ts
import { S, List, Sym, isList, isSym, list, sym } from "./syntax";
import { MacroEnv, installCoreMacros } from "./macros";

export function macroexpandAll(forms:S[], user?: (m:MacroEnv)=>void): S[] {
  const M = new MacroEnv();
  installCoreMacros(M);
  user?.(M); // allow host to preinstall macros

  // one pass that registers top-level defmacros, then expand everything
  const expanded:S[]=[];
  for (const f of forms) {
    const e = expand(f, M);
    if (isList(e,"defmacro")) { expand(e, M); continue; }
    expanded.push(e);
  }
  return expanded;
}

function expand(x:S, M: MacroEnv): S {
  // atoms unchanged
  if (x.t!=="list" || x.xs.length===0) return x;

  // handle defmacro at top or nested (register and return nil)
  if (isList(x, "defmacro")) {
    const head = (x as List).xs[0] as Sym;
    const fn = M.get("defmacro")!;
    return fn(x as List, (y)=>expand(y,M));
  }

  // macro call?
  const head = (x as List).xs[0];
  if (head.t==="sym" && M.has(head.name)) {
    const fn = M.get(head.name)!;
    const out = fn(x as List, (y)=>expand(y,M));
    return expand(out, M);
  }

  // special forms that must not expand their operands eagerly can be handled here if needed.
^ref-cfee6d36-291-0

  // otherwise recursively expand elements
^ref-cfee6d36-341-0
  return list(x.xs.map(e => expand(e, M)), x.span);
^ref-cfee6d36-341-0
}
^ref-cfee6d36-341-0
```

---

# 3) Lispy core → your **Expr** AST

```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts
import type { Expr } from "../ast";
import { name as mkName } from "../ast";
import { S, List, Sym, Num, Str, Bool, Nil, isList, isSym, list, sym } from "./syntax";

export function toExpr(x:S): Expr {
  switch (x.t) {
    case "num":  return { kind:"Num", value:x.v, span:x.span! };
    case "str":  return { kind:"Str", value:x.v, span:x.span! };
    case "bool": return { kind:"Bool", value:x.v, span:x.span! };
    case "nil":  return { kind:"Null", span:x.span! };
    case "sym":  return { kind:"Var", name: mkName(x.gensym ?? x.name, x.span!) };
    case "list": return listToExpr(x);
  }
}

function listToExpr(x: List): Expr {
  if (x.xs.length===0) return { kind:"Null", span:x.span! };

  const hd = x.xs[0];
  // core forms: (if c t e), (let ((a v) (b w)) body...), (fn (a b) body...), (begin ...), (quote v)
  if (isSym(hd,"if")) {
    const [, c, t, e] = x.xs;
    return { kind:"If", cond: toExpr(c), then: toExpr(t), else: toExpr(e), span:x.span! };
  }
  if (isSym(hd,"begin")) {
    const exprs = x.xs.slice(1).map(toExpr);
    const span = exprs[0]?.["span"] ?? x.span!;
    return { kind:"Block", exprs, span };
  }
  if (isSym(hd,"quote")) {
    // quote datum -> turn into a JS literal via simple conversion (lists to nested arrays)
    const v = datumToJs(x.xs[1]);
    return { kind:"Str", value: JSON.stringify(v), span:x.span! }; // simplest: embed JSON string (you can upgrade to tagged data)
  }
  if (isSym(hd,"let")) {
    // (let ((a v) (b w)) body...)
    const bindings = (x.xs[1] as List).xs.map(b => (b as List).xs);
    let body = x.xs.slice(2).reduceRight((acc, e)=> list([sym("begin"), e, acc]), sym("nil") as S);
    // desugar chain into nested lets
    for (let i=bindings.length-1;i>=0;i--) {
      const [n, v] = bindings[i];
      body = list([sym("let1"), n, v, body]);
    }
    return toExpr(body);
  }
  if (isSym(hd,"let1")) {
    const [, n, v, body] = x.xs;
    return {
      kind:"Let",
      name: mkName((n as Sym).gensym ?? (n as Sym).name, n.span!),
      value: toExpr(v),
      body: toExpr(body),
      span: x.span!
    };
  }
  if (isSym(hd,"fn") || isSym(hd,"lambda")) {
    const params = ((x.xs[1] as List).xs as Sym[]).map(s => mkName(s.gensym ?? s.name, s.span!));
    const bodyS = x.xs.slice(2);
    const body = bodyS.length===1 ? toExpr(bodyS[0]) : toExpr(list([sym("begin"), ...bodyS]));
    return { kind:"Fun", params, body, span:x.span! };
  }

  // infix ops map to Bin/Un, else -> Call
  const binOp = new Set(["+","-","*","/","%","<",">","<=",">=","==","!="]);
  const unOp = new Set(["not","neg"]);
  if (hd.t==="sym" && binOp.has(hd.name) && x.xs.length===3) {
    return { kind:"Bin", op: hd.name, left: toExpr(x.xs[1]), right: toExpr(x.xs[2]), span:x.span! } as any;
  }
  if (hd.t==="sym" && hd.name==="-" && x.xs.length===2) {
    return { kind:"Un", op: "-", expr: toExpr(x.xs[1]), span:x.span! } as any;
  }
  if (hd.t==="sym" && hd.name==="not" && x.xs.length===2) {
    return { kind:"Un", op: "!", expr: toExpr(x.xs[1]), span:x.span! } as any;
  }

  // function call: (f a b c)
  return {
    kind:"Call",
    callee: toExpr(hd),
    args: x.xs.slice(1).map(toExpr),
    span:x.span!
  };
}

function datumToJs(x:any): any {
  if (x.t==="num"||x.t==="str"||x.t==="bool") return x.v;
^ref-cfee6d36-341-0
  if (x.t==="nil") return null;
  if (x.t==="sym") return x.name;
^ref-cfee6d36-440-0
  if (x.t==="list") return x.xs.map(datumToJs);
^ref-cfee6d36-440-0
  return null;
^ref-cfee6d36-440-0
}
```
^ref-cfee6d36-356-0

---

# 4) End-to-end driver (Lisp → JS → run)
 ^ref-cfee6d36-459-0
```ts
// shared/js/prom-lib/compiler/lisp/driver.ts
import { read } from "./reader";
import { macroexpandAll } from "./expand";
import { toExpr } from "./to-expr";
import { lower } from "../lower";
import { emitJS } from "../jsgen";

export function compileLispToJS(src: string, { pretty=false, importNames=[] as string[] } = {}) {
  const forms = read(src);
  const expanded = macroexpandAll(forms);
  // stitch multiple top-level forms into (begin ...)
  const program = expanded.length===1 ? expanded[0] : { t:"list", xs:[{t:"sym",name:"begin"}, ...expanded] } as any;
  const ast = toExpr(program as any);
  const ir = lower(ast);
  const js = emitJS(ir, { iife:false, importNames, pretty });
  return { forms, expanded, ast, ir, js };
}
^ref-cfee6d36-440-0

export function runLisp(src: string, imports: Record<string, any> = {}) {
^ref-cfee6d36-472-0
^ref-cfee6d36-470-0
  const { js } = compileLispToJS(src);
^ref-cfee6d36-472-0
^ref-cfee6d36-470-0
  const fn = (0, eval)(js);
^ref-cfee6d36-485-0
^ref-cfee6d36-472-0
  return fn(imports); ^ref-cfee6d36-470-0
}
^ref-cfee6d36-459-0
``` ^ref-cfee6d36-485-0
 ^ref-cfee6d36-491-0
---

# 5) Starter macros in Lisp (user land)

You can define macros **in Lisp** now:

```lisp
; examples.lisp
(defmacro when (test . body)
  `(if ,test (begin ,@body) nil))
^ref-cfee6d36-472-0
 ^ref-cfee6d36-485-0
^ref-cfee6d36-491-0
^ref-cfee6d36-485-0
(defmacro -> (x . steps)
^ref-cfee6d36-491-0
  (if (nil? steps)
      x
      (let ((s (car steps))
            (rest (cdr steps)))
        (-> (cons (car s) (cons x (cdr s))) rest))))
```

*(We shipped a built-in `when` and `->` already, but you can redefine/extend.)*

---

# 6) Try it ^ref-cfee6d36-521-0

```ts
import { runLisp, compileLispToJS } from "./compiler/lisp/driver";

// 1) Basic
console.log(runLisp(`
  (let ((x 2) (y 40))
    (+ x y))
`)); // 42

// 2) Macros + closures + host imports
const program = `
  (defmacro unless (c . body)
    \`(if (not ,c) (begin ,@body) nil))
^ref-cfee6d36-491-0
^ref-cfee6d36-521-0
^ref-cfee6d36-520-0
^ref-cfee6d36-519-0
^ref-cfee6d36-518-0

  (let ((add (fn (a) (fn (b) (+ a b))))) ^ref-cfee6d36-528-0
^ref-cfee6d36-535-0 ^ref-cfee6d36-536-0
^ref-cfee6d36-533-0 ^ref-cfee6d36-537-0
^ref-cfee6d36-531-0 ^ref-cfee6d36-538-0
^ref-cfee6d36-530-0 ^ref-cfee6d36-539-0
^ref-cfee6d36-529-0
^ref-cfee6d36-528-0 ^ref-cfee6d36-541-0
^ref-cfee6d36-521-0 ^ref-cfee6d36-542-0
^ref-cfee6d36-520-0 ^ref-cfee6d36-543-0
^ref-cfee6d36-519-0
^ref-cfee6d36-518-0 ^ref-cfee6d36-545-0
    (unless false ^ref-cfee6d36-529-0
      (print (add 2 40)))) ^ref-cfee6d36-530-0 ^ref-cfee6d36-547-0
^ref-cfee6d36-550-0 ^ref-cfee6d36-553-0
^ref-cfee6d36-548-0 ^ref-cfee6d36-554-0
^ref-cfee6d36-547-0
^ref-cfee6d36-545-0 ^ref-cfee6d36-556-0
^ref-cfee6d36-543-0
^ref-cfee6d36-542-0 ^ref-cfee6d36-558-0
^ref-cfee6d36-541-0
^ref-cfee6d36-539-0
^ref-cfee6d36-538-0
^ref-cfee6d36-537-0 ^ref-cfee6d36-562-0
^ref-cfee6d36-536-0
^ref-cfee6d36-535-0
^ref-cfee6d36-533-0 ^ref-cfee6d36-565-0
^ref-cfee6d36-531-0
^ref-cfee6d36-530-0
^ref-cfee6d36-529-0
^ref-cfee6d36-528-0
^ref-cfee6d36-521-0 ^ref-cfee6d36-570-0
^ref-cfee6d36-520-0
^ref-cfee6d36-519-0
^ref-cfee6d36-518-0
^ref-cfee6d36-516-0
`; ^ref-cfee6d36-518-0 ^ref-cfee6d36-531-0 ^ref-cfee6d36-548-0
const { js } = compileLispToJS(program, { pretty:true, importNames:["print"] }); ^ref-cfee6d36-519-0
console.log(js); ^ref-cfee6d36-520-0 ^ref-cfee6d36-533-0 ^ref-cfee6d36-550-0
(0,eval)(js)({ print: console.log }); ^ref-cfee6d36-521-0
``` ^ref-cfee6d36-535-0
^ref-cfee6d36-523-0
 ^ref-cfee6d36-536-0 ^ref-cfee6d36-553-0
--- ^ref-cfee6d36-537-0 ^ref-cfee6d36-554-0
 ^ref-cfee6d36-538-0
# 7) What’s intentionally *not* here (yet) ^ref-cfee6d36-539-0 ^ref-cfee6d36-556-0

* **Full hygiene** (scope-sets): we’re gensym-friendly but not Racket-level hygienic. Next step: carry a `scopeId` set in `Sym`, add new scope frames in macro bodies, resolve bindings post-expansion → that gives you true hygiene. ^ref-cfee6d36-528-0 ^ref-cfee6d36-541-0 ^ref-cfee6d36-558-0
* **Pattern macros** (`syntax-rules`): easy to add later; start with quasiquote macros (you’ll write 95% of macros with these). ^ref-cfee6d36-529-0 ^ref-cfee6d36-542-0
* **Rich data literals** (vectors, maps, keywords): trivial extensions to the reader + `datumToJs`. ^ref-cfee6d36-530-0 ^ref-cfee6d36-543-0
* **Stdlib**: you’ll want a handful of host imports: `print`, Math ops, list ops; we can auto-inject a tiny prelude. ^ref-cfee6d36-531-0
 ^ref-cfee6d36-545-0 ^ref-cfee6d36-562-0
--- ^ref-cfee6d36-533-0
 ^ref-cfee6d36-547-0
# 8) Next upgrades (you pick) ^ref-cfee6d36-535-0 ^ref-cfee6d36-548-0 ^ref-cfee6d36-565-0
 ^ref-cfee6d36-536-0
* **Hygienic `syntax-rules`** (patterns, ellipses) and/or **syntax-case** ^ref-cfee6d36-537-0 ^ref-cfee6d36-550-0
* **Module system** (per-file macro scope, `require`) ^ref-cfee6d36-538-0
* **Source maps** from Lisp spans → JS for nicer errors ^ref-cfee6d36-539-0
* **Host FFI** sugar: `(js . ...)`, `(import Math.sin)`, etc. ^ref-cfee6d36-553-0 ^ref-cfee6d36-570-0
* **Optimizations**: alpha-rename, beta-reduce, inline, fold, DCE on ANF ^ref-cfee6d36-541-0 ^ref-cfee6d36-554-0
 ^ref-cfee6d36-542-0
If you’re cool with this baseline, I can add **syntax-rules with ellipses** next so you can write fancy macros like `match`, `for`, `struct`, and `deftype` with pattern guards.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Shared Package Structure](shared-package-structure.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
## Sources
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 1)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.99)
- [Local-Offline-Model-Deployment-Strategy — L232](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-232-0) (line 232, col 0, score 0.96)
- [Promethean Dev Workflow Update — L17867](promethean-dev-workflow-update.md#^ref-03a5578f-17867-0) (line 17867, col 0, score 0.9)
- [The Jar of Echoes — L17457](the-jar-of-echoes.md#^ref-18138627-17457-0) (line 17457, col 0, score 0.9)
- [Chroma Toolkit Consolidation Plan — L1749](chroma-toolkit-consolidation-plan.md#^ref-5020e892-1749-0) (line 1749, col 0, score 0.9)
- [Docops Feature Updates — L1010](docops-feature-updates-3.md#^ref-cdbd21ee-1010-0) (line 1010, col 0, score 0.9)
- [Docops Feature Updates — L1270](docops-feature-updates.md#^ref-2792d448-1270-0) (line 1270, col 0, score 0.9)
- [Provider-Agnostic Chat Panel Implementation — L3042](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-3042-0) (line 3042, col 0, score 0.9)
- [Per-Domain Policy System for JS Crawler — L3347](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3347-0) (line 3347, col 0, score 0.9)
- [Promethean-Copilot-Intent-Engine — L3746](promethean-copilot-intent-engine.md#^ref-ae24a280-3746-0) (line 3746, col 0, score 0.9)
- [Interop and Source Maps — L426](interop-and-source-maps.md#^ref-cdfac40c-426-0) (line 426, col 0, score 0.88)
- [Lispy Macros with syntax-rules — L325](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-325-0) (line 325, col 0, score 0.87)
- [Exception Layer Analysis — L63](exception-layer-analysis.md#^ref-21d5cc09-63-0) (line 63, col 0, score 0.87)
- [Model Selection for Lightweight Conversational Tasks — L563](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-563-0) (line 563, col 0, score 0.87)
- [Model Upgrade Calm-Down Guide — L1047](model-upgrade-calm-down-guide.md#^ref-db74343f-1047-0) (line 1047, col 0, score 0.87)
- [NPU Voice Code and Sensory Integration — L929](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-929-0) (line 929, col 0, score 0.87)
- [Obsidian ChatGPT Plugin Integration — L917](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-917-0) (line 917, col 0, score 0.87)
- [obsidian-ignore-node-modules-regex — L1317](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1317-0) (line 1317, col 0, score 0.87)
- [Obsidian Templating Plugins Integration Guide — L1141](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1141-0) (line 1141, col 0, score 0.87)
- [Per-Domain Policy System for JS Crawler — L1608](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1608-0) (line 1608, col 0, score 0.87)
- [Performance-Optimized-Polyglot-Bridge — L1524](performance-optimized-polyglot-bridge.md#^ref-f5579967-1524-0) (line 1524, col 0, score 0.87)
- [Pipeline Enhancements — L580](pipeline-enhancements.md#^ref-e2135d9f-580-0) (line 580, col 0, score 0.87)
- [plan-update-confirmation — L2018](plan-update-confirmation.md#^ref-b22d79c6-2018-0) (line 2018, col 0, score 0.87)
- [polyglot-repl-interface-layer — L1274](polyglot-repl-interface-layer.md#^ref-9c79206d-1274-0) (line 1274, col 0, score 0.87)
- [Promethean Event Bus MVP v0.1 — L973](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-973-0) (line 973, col 0, score 0.86)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.86)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L401](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-401-0) (line 401, col 0, score 0.86)
- [compiler-kit-foundations — L590](compiler-kit-foundations.md#^ref-01b21543-590-0) (line 590, col 0, score 0.86)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.86)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.85)
- [Promethean_Eidolon_Synchronicity_Model — L189](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-189-0) (line 189, col 0, score 0.85)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.85)
- [Shared Package Structure — L188](shared-package-structure.md#^ref-66a72fc3-188-0) (line 188, col 0, score 0.85)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 0.85)
- [shared-package-layout-clarification — L137](shared-package-layout-clarification.md#^ref-36c8882a-137-0) (line 137, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
