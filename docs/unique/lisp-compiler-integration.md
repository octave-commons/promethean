---
uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
created_at: 2025.08.08.22.08.09.md
filename: Lisp-Compiler-Integration
description: >-
  A minimal, hygienic Lisp front-end that integrates with existing compiler
  pipelines via S-expr reader, macro system, and compiler from Lispy AST to
  IR/JS.
tags:
  - Lisp
  - compiler
  - macro
  - hygienic
  - S-expr
  - reader
  - quasiquote
  - gensym
  - macroexpansion
  - IR
  - JS
related_to_title: []
related_to_uuid: []
references: []
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
^ref-cfee6d36-53-0

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
^ref-cfee6d36-188-0

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
^ref-cfee6d36-291-0

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

---

# 4) End-to-end driver (Lisp → JS → run)

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

# 6) Try it

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
If you’re cool with this baseline, I can add **syntax-rules with ellipses** next so you can write fancy macros like `match`, `for`, `struct`, and `deftype` with pattern guards.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [template-based-compilation](template-based-compilation.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [DSL](chunks/dsl.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [JavaScript](chunks/javascript.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [archetype-ecs](archetype-ecs.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Window Management](chunks/window-management.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Diagrams](chunks/diagrams.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Services](chunks/services.md)
- [Event Bus MVP](event-bus-mvp.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [field-interaction-equations](field-interaction-equations.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [EidolonField](eidolonfield.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Shared](chunks/shared.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [graph-ds](graph-ds.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Shared Package Structure](shared-package-structure.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean State Format](promethean-state-format.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Reawakening Duck](reawakening-duck.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
## Sources
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.68)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.77)
- [js-to-lisp-reverse-compiler — L1](js-to-lisp-reverse-compiler.md#^ref-58191024-1-0) (line 1, col 0, score 0.77)
- [compiler-kit-foundations — L602](compiler-kit-foundations.md#^ref-01b21543-602-0) (line 602, col 0, score 0.67)
- [template-based-compilation — L84](template-based-compilation.md#^ref-f8877e5e-84-0) (line 84, col 0, score 0.75)
- [Language-Agnostic Mirror System — L332](language-agnostic-mirror-system.md#^ref-d2b3628c-332-0) (line 332, col 0, score 0.74)
- [Universal Lisp Interface — L3](universal-lisp-interface.md#^ref-b01856b4-3-0) (line 3, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L1](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-1-0) (line 1, col 0, score 0.73)
- [Performance-Optimized-Polyglot-Bridge — L3](performance-optimized-polyglot-bridge.md#^ref-f5579967-3-0) (line 3, col 0, score 0.73)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.72)
- [js-to-lisp-reverse-compiler — L5](js-to-lisp-reverse-compiler.md#^ref-58191024-5-0) (line 5, col 0, score 0.71)
- [Sibilant Meta-Prompt DSL — L1](sibilant-meta-prompt-dsl.md#^ref-af5d2824-1-0) (line 1, col 0, score 0.71)
- [lisp-dsl-for-window-management — L172](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-172-0) (line 172, col 0, score 0.71)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.75)
- [lisp-dsl-for-window-management — L176](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-176-0) (line 176, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L101](migrate-to-provider-tenant-architecture.md#^ref-54382370-101-0) (line 101, col 0, score 0.68)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [template-based-compilation — L33](template-based-compilation.md#^ref-f8877e5e-33-0) (line 33, col 0, score 0.74)
- [Cross-Target Macro System in Sibilant — L134](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-134-0) (line 134, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L215](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-215-0) (line 215, col 0, score 0.69)
- [template-based-compilation — L59](template-based-compilation.md#^ref-f8877e5e-59-0) (line 59, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L390](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-390-0) (line 390, col 0, score 0.77)
- [sibilant-meta-string-templating-runtime — L19](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-19-0) (line 19, col 0, score 0.75)
- [Sibilant Meta-Prompt DSL — L82](sibilant-meta-prompt-dsl.md#^ref-af5d2824-82-0) (line 82, col 0, score 0.73)
- [sibilant-metacompiler-overview — L57](sibilant-metacompiler-overview.md#^ref-61d4086b-57-0) (line 57, col 0, score 0.74)
- [sibilant-metacompiler-overview — L65](sibilant-metacompiler-overview.md#^ref-61d4086b-65-0) (line 65, col 0, score 0.68)
- [sibilant-metacompiler-overview — L15](sibilant-metacompiler-overview.md#^ref-61d4086b-15-0) (line 15, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L82](cross-language-runtime-polymorphism.md#^ref-c34c36a6-82-0) (line 82, col 0, score 0.65)
- [Promethean State Format — L70](promethean-state-format.md#^ref-23df6ddb-70-0) (line 70, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L150](sibilant-meta-prompt-dsl.md#^ref-af5d2824-150-0) (line 150, col 0, score 0.69)
- [sibilant-macro-targets — L35](sibilant-macro-targets.md#^ref-c5c9a5c6-35-0) (line 35, col 0, score 0.63)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [Recursive Prompt Construction Engine — L137](recursive-prompt-construction-engine.md#^ref-babdb9eb-137-0) (line 137, col 0, score 0.67)
- [template-based-compilation — L66](template-based-compilation.md#^ref-f8877e5e-66-0) (line 66, col 0, score 0.62)
- [template-based-compilation — L25](template-based-compilation.md#^ref-f8877e5e-25-0) (line 25, col 0, score 0.72)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.59)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.58)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.57)
- [Sibilant Meta-Prompt DSL — L169](sibilant-meta-prompt-dsl.md#^ref-af5d2824-169-0) (line 169, col 0, score 0.55)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L158](recursive-prompt-construction-engine.md#^ref-babdb9eb-158-0) (line 158, col 0, score 0.55)
- [prompt-programming-language-lisp — L73](prompt-programming-language-lisp.md#^ref-d41a06d1-73-0) (line 73, col 0, score 0.54)
- [Reawakening Duck — L116](reawakening-duck.md#^ref-59b5670f-116-0) (line 116, col 0, score 0.54)
- [sibilant-macro-targets — L190](sibilant-macro-targets.md#^ref-c5c9a5c6-190-0) (line 190, col 0, score 0.54)
- [Interop and Source Maps — L11](interop-and-source-maps.md#^ref-cdfac40c-11-0) (line 11, col 0, score 0.77)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.77)
- [Language-Agnostic Mirror System — L522](language-agnostic-mirror-system.md#^ref-d2b3628c-522-0) (line 522, col 0, score 0.74)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.82)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.74)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.74)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.73)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.7)
- [Interop and Source Maps — L9](interop-and-source-maps.md#^ref-cdfac40c-9-0) (line 9, col 0, score 0.7)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.97)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.68)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L235](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-235-0) (line 235, col 0, score 0.68)
- [Language-Agnostic Mirror System — L271](language-agnostic-mirror-system.md#^ref-d2b3628c-271-0) (line 271, col 0, score 0.67)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.92)
- [Promethean Agent DSL TS Scaffold — L301](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-301-0) (line 301, col 0, score 0.53)
- [set-assignment-in-lisp-ast — L108](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-108-0) (line 108, col 0, score 0.62)
- [field-interaction-equations — L21](field-interaction-equations.md#^ref-b09141b7-21-0) (line 21, col 0, score 0.52)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.56)
- [Promethean Agent DSL TS Scaffold — L333](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-333-0) (line 333, col 0, score 0.6)
- [i3-bluetooth-setup — L65](i3-bluetooth-setup.md#^ref-5e408692-65-0) (line 65, col 0, score 0.48)
- [set-assignment-in-lisp-ast — L114](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-114-0) (line 114, col 0, score 0.48)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.68)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.68)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.55)
- [Promethean Agent DSL TS Scaffold — L97](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-97-0) (line 97, col 0, score 0.77)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.75)
- [Promethean Agent DSL TS Scaffold — L142](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-142-0) (line 142, col 0, score 0.59)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.74)
- [Promethean Agent DSL TS Scaffold — L451](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-451-0) (line 451, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L149](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-149-0) (line 149, col 0, score 0.72)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.72)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.71)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.7)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.69)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.56)
- [polymorphic-meta-programming-engine — L99](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-99-0) (line 99, col 0, score 0.56)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.54)
- [Promethean-Copilot-Intent-Engine — L32](promethean-copilot-intent-engine.md#^ref-ae24a280-32-0) (line 32, col 0, score 0.63)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.57)
- [Agent Reflections and Prompt Evolution — L104](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-104-0) (line 104, col 0, score 0.55)
- [Promethean-Copilot-Intent-Engine — L47](promethean-copilot-intent-engine.md#^ref-ae24a280-47-0) (line 47, col 0, score 0.54)
- [Promethean-Copilot-Intent-Engine — L24](promethean-copilot-intent-engine.md#^ref-ae24a280-24-0) (line 24, col 0, score 0.54)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.63)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L575](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-575-0) (line 575, col 0, score 0.57)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.7)
- [plan-update-confirmation — L845](plan-update-confirmation.md#^ref-b22d79c6-845-0) (line 845, col 0, score 0.55)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.55)
- [Lispy Macros with syntax-rules — L243](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-243-0) (line 243, col 0, score 0.78)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.55)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.68)
- [Voice Access Layer Design — L96](voice-access-layer-design.md#^ref-543ed9b3-96-0) (line 96, col 0, score 0.61)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.55)
- [Factorio AI with External Agents — L23](factorio-ai-with-external-agents.md#^ref-a4d90289-23-0) (line 23, col 0, score 0.55)
- [Voice Access Layer Design — L90](voice-access-layer-design.md#^ref-543ed9b3-90-0) (line 90, col 0, score 0.54)
- [i3-config-validation-methods — L15](i3-config-validation-methods.md#^ref-d28090ac-15-0) (line 15, col 0, score 0.54)
- [Voice Access Layer Design — L112](voice-access-layer-design.md#^ref-543ed9b3-112-0) (line 112, col 0, score 0.54)
- [plan-update-confirmation — L219](plan-update-confirmation.md#^ref-b22d79c6-219-0) (line 219, col 0, score 0.53)
- [plan-update-confirmation — L303](plan-update-confirmation.md#^ref-b22d79c6-303-0) (line 303, col 0, score 0.53)
- [Sibilant Meta-Prompt DSL — L91](sibilant-meta-prompt-dsl.md#^ref-af5d2824-91-0) (line 91, col 0, score 0.52)
- [Promethean-native config design — L37](promethean-native-config-design.md#^ref-ab748541-37-0) (line 37, col 0, score 0.52)
- [Lispy Macros with syntax-rules — L217](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-217-0) (line 217, col 0, score 0.78)
- [set-assignment-in-lisp-ast — L25](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-25-0) (line 25, col 0, score 0.68)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.72)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.84)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L405](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-405-0) (line 405, col 0, score 0.73)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.71)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.71)
- [Interop and Source Maps — L68](interop-and-source-maps.md#^ref-cdfac40c-68-0) (line 68, col 0, score 0.78)
- [template-based-compilation — L13](template-based-compilation.md#^ref-f8877e5e-13-0) (line 13, col 0, score 0.7)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.68)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L175](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-175-0) (line 175, col 0, score 0.48)
- [ParticleSimulationWithCanvasAndFFmpeg — L281](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-281-0) (line 281, col 0, score 0.48)
- [Per-Domain Policy System for JS Crawler — L498](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-498-0) (line 498, col 0, score 0.48)
- [Performance-Optimized-Polyglot-Bridge — L449](performance-optimized-polyglot-bridge.md#^ref-f5579967-449-0) (line 449, col 0, score 0.48)
- [pm2-orchestration-patterns — L247](pm2-orchestration-patterns.md#^ref-51932e7b-247-0) (line 247, col 0, score 0.48)
- [polyglot-repl-interface-layer — L184](polyglot-repl-interface-layer.md#^ref-9c79206d-184-0) (line 184, col 0, score 0.48)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L523](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-523-0) (line 523, col 0, score 0.48)
- [polymorphic-meta-programming-engine — L240](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-240-0) (line 240, col 0, score 0.48)
- [Post-Linguistic Transhuman Design Frameworks — L102](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-102-0) (line 102, col 0, score 0.48)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L417](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-417-0) (line 417, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.7)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.77)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.68)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.68)
- [Interop and Source Maps — L66](interop-and-source-maps.md#^ref-cdfac40c-66-0) (line 66, col 0, score 0.66)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.65)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.85)
- [Board Walk – 2025-08-11 — L103](board-walk-2025-08-11.md#^ref-7aa1eb92-103-0) (line 103, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.62)
- [smart-chatgpt-thingy — L9](smart-chatgpt-thingy.md#^ref-2facccf8-9-0) (line 9, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.62)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.62)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.57)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.57)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.56)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.56)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.56)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.55)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.92)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.86)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L423](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-423-0) (line 423, col 0, score 0.77)
- [archetype-ecs — L467](archetype-ecs.md#^ref-8f4c1e86-467-0) (line 467, col 0, score 1)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#^ref-cdfac40c-514-0) (line 514, col 0, score 1)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#^ref-d2b3628c-534-0) (line 534, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-515-0) (line 515, col 0, score 1)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 1)
- [Lispy Macros with syntax-rules — L341](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-341-0) (line 341, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L413](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-413-0) (line 413, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L210](cross-language-runtime-polymorphism.md#^ref-c34c36a6-210-0) (line 210, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L189](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-189-0) (line 189, col 0, score 0.7)
- [Duck's Attractor States — L84](ducks-attractor-states.md#^ref-13951643-84-0) (line 84, col 0, score 0.7)
- [Duck's Self-Referential Perceptual Loop — L40](ducks-self-referential-perceptual-loop.md#^ref-71726f04-40-0) (line 40, col 0, score 0.7)
- [heartbeat-simulation-snippets — L94](heartbeat-simulation-snippets.md#^ref-23e221e9-94-0) (line 94, col 0, score 0.7)
- [Obsidian ChatGPT Plugin Integration Guide — L35](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-35-0) (line 35, col 0, score 0.7)
- [Obsidian ChatGPT Plugin Integration — L35](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-35-0) (line 35, col 0, score 0.7)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.61)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.6)
- [sibilant-meta-string-templating-runtime — L11](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-11-0) (line 11, col 0, score 0.6)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L113](prompt-folder-bootstrap.md#^ref-bd4f0976-113-0) (line 113, col 0, score 0.56)
- [Promethean Agent Config DSL — L117](promethean-agent-config-dsl.md#^ref-2c00ce45-117-0) (line 117, col 0, score 0.56)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L33](prompt-folder-bootstrap.md#^ref-bd4f0976-33-0) (line 33, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L9](recursive-prompt-construction-engine.md#^ref-babdb9eb-9-0) (line 9, col 0, score 0.55)
- [Migrate to Provider-Tenant Architecture — L11](migrate-to-provider-tenant-architecture.md#^ref-54382370-11-0) (line 11, col 0, score 0.54)
- [prom-lib-rate-limiters-and-replay-api — L367](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-367-0) (line 367, col 0, score 0.54)
- [set-assignment-in-lisp-ast — L139](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-139-0) (line 139, col 0, score 0.86)
- [js-to-lisp-reverse-compiler — L340](js-to-lisp-reverse-compiler.md#^ref-58191024-340-0) (line 340, col 0, score 0.77)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L425](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-425-0) (line 425, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.73)
- [js-to-lisp-reverse-compiler — L308](js-to-lisp-reverse-compiler.md#^ref-58191024-308-0) (line 308, col 0, score 0.71)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L493](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-493-0) (line 493, col 0, score 0.66)
- [Mongo Outbox Implementation — L536](mongo-outbox-implementation.md#^ref-9c1acd1e-536-0) (line 536, col 0, score 0.65)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.63)
- [sibilant-macro-targets — L29](sibilant-macro-targets.md#^ref-c5c9a5c6-29-0) (line 29, col 0, score 0.62)
- [Interop and Source Maps — L507](interop-and-source-maps.md#^ref-cdfac40c-507-0) (line 507, col 0, score 0.61)
- [lisp-dsl-for-window-management — L140](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-140-0) (line 140, col 0, score 0.75)
- [Sibilant Meta-Prompt DSL — L67](sibilant-meta-prompt-dsl.md#^ref-af5d2824-67-0) (line 67, col 0, score 0.71)
- [template-based-compilation — L7](template-based-compilation.md#^ref-f8877e5e-7-0) (line 7, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L400](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-400-0) (line 400, col 0, score 0.7)
- [EidolonField — L3](eidolonfield.md#^ref-49d1e1e5-3-0) (line 3, col 0, score 0.65)
- [EidolonField — L79](eidolonfield.md#^ref-49d1e1e5-79-0) (line 79, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.64)
- [template-based-compilation — L41](template-based-compilation.md#^ref-f8877e5e-41-0) (line 41, col 0, score 0.64)
- [set-assignment-in-lisp-ast — L144](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-144-0) (line 144, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L295](chroma-embedding-refactor.md#^ref-8b256935-295-0) (line 295, col 0, score 0.63)
- [Interop and Source Maps — L505](interop-and-source-maps.md#^ref-cdfac40c-505-0) (line 505, col 0, score 0.63)
- [Eidolon Field Abstract Model — L32](eidolon-field-abstract-model.md#^ref-5e8b2388-32-0) (line 32, col 0, score 0.63)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.69)
- [polymorphic-meta-programming-engine — L95](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-95-0) (line 95, col 0, score 0.67)
- [set-assignment-in-lisp-ast — L56](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-56-0) (line 56, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L259](migrate-to-provider-tenant-architecture.md#^ref-54382370-259-0) (line 259, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.65)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.65)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.69)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.65)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.67)
- [Interop and Source Maps — L8](interop-and-source-maps.md#^ref-cdfac40c-8-0) (line 8, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.61)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.61)
- [Promethean-Copilot-Intent-Engine — L44](promethean-copilot-intent-engine.md#^ref-ae24a280-44-0) (line 44, col 0, score 0.61)
- [api-gateway-versioning — L274](api-gateway-versioning.md#^ref-0580dcd3-274-0) (line 274, col 0, score 0.61)
- [js-to-lisp-reverse-compiler — L382](js-to-lisp-reverse-compiler.md#^ref-58191024-382-0) (line 382, col 0, score 0.61)
- [sibilant-macro-targets — L127](sibilant-macro-targets.md#^ref-c5c9a5c6-127-0) (line 127, col 0, score 0.71)
- [template-based-compilation — L82](template-based-compilation.md#^ref-f8877e5e-82-0) (line 82, col 0, score 0.69)
- [polyglot-repl-interface-layer — L96](polyglot-repl-interface-layer.md#^ref-9c79206d-96-0) (line 96, col 0, score 0.68)
- [sibilant-metacompiler-overview — L67](sibilant-metacompiler-overview.md#^ref-61d4086b-67-0) (line 67, col 0, score 0.68)
- [Sibilant Meta-Prompt DSL — L74](sibilant-meta-prompt-dsl.md#^ref-af5d2824-74-0) (line 74, col 0, score 0.67)
- [polymorphic-meta-programming-engine — L123](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-123-0) (line 123, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L391](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-391-0) (line 391, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [field-interaction-equations — L167](field-interaction-equations.md#^ref-b09141b7-167-0) (line 167, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L403](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-403-0) (line 403, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.62)
- [Lispy Macros with syntax-rules — L392](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-392-0) (line 392, col 0, score 0.77)
- [compiler-kit-foundations — L599](compiler-kit-foundations.md#^ref-01b21543-599-0) (line 599, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.66)
- [universal-intention-code-fabric — L419](universal-intention-code-fabric.md#^ref-c14edce7-419-0) (line 419, col 0, score 0.66)
- [Shared Package Structure — L146](shared-package-structure.md#^ref-66a72fc3-146-0) (line 146, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L45](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-45-0) (line 45, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L147](dynamic-context-model-for-web-components.md#^ref-f7702bf8-147-0) (line 147, col 0, score 0.63)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [compiler-kit-foundations — L605](compiler-kit-foundations.md#^ref-01b21543-605-0) (line 605, col 0, score 1)
- [Interop and Source Maps — L512](interop-and-source-maps.md#^ref-cdfac40c-512-0) (line 512, col 0, score 1)
- [js-to-lisp-reverse-compiler — L409](js-to-lisp-reverse-compiler.md#^ref-58191024-409-0) (line 409, col 0, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#^ref-d2b3628c-533-0) (line 533, col 0, score 1)
- [Lispy Macros with syntax-rules — L397](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-397-0) (line 397, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L512](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-512-0) (line 512, col 0, score 1)
- [Promethean Agent Config DSL — L338](promethean-agent-config-dsl.md#^ref-2c00ce45-338-0) (line 338, col 0, score 1)
- [template-based-compilation — L144](template-based-compilation.md#^ref-f8877e5e-144-0) (line 144, col 0, score 1)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 1)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 1)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 1)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 1)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L410](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-410-0) (line 410, col 0, score 1)
- [Unique Info Dump Index — L72](unique-info-dump-index.md#^ref-30ec3ba6-72-0) (line 72, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-159-0) (line 159, col 0, score 1)
- [AI-Centric OS with MCP Layer — L400](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#^ref-5020e892-197-0) (line 197, col 0, score 1)
- [Diagrams — L45](chunks/diagrams.md#^ref-45cd25b5-45-0) (line 45, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L222](cross-language-runtime-polymorphism.md#^ref-c34c36a6-222-0) (line 222, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L167](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-385-0) (line 385, col 0, score 1)
- [i3-config-validation-methods — L86](i3-config-validation-methods.md#^ref-d28090ac-86-0) (line 86, col 0, score 1)
- [js-to-lisp-reverse-compiler — L408](js-to-lisp-reverse-compiler.md#^ref-58191024-408-0) (line 408, col 0, score 1)
- [lisp-dsl-for-window-management — L227](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-227-0) (line 227, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L268](migrate-to-provider-tenant-architecture.md#^ref-54382370-268-0) (line 268, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Admin Dashboard for User Management — L56](admin-dashboard-for-user-management.md#^ref-2901a3e9-56-0) (line 56, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L430](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-430-0) (line 430, col 0, score 0.67)
- [aionian-circuit-math — L166](aionian-circuit-math.md#^ref-f2d83a77-166-0) (line 166, col 0, score 0.67)
- [archetype-ecs — L464](archetype-ecs.md#^ref-8f4c1e86-464-0) (line 464, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L210](chroma-toolkit-consolidation-plan.md#^ref-5020e892-210-0) (line 210, col 0, score 0.67)
- [Diagrams — L15](chunks/diagrams.md#^ref-45cd25b5-15-0) (line 15, col 0, score 0.67)
- [JavaScript — L16](chunks/javascript.md#^ref-c1618c66-16-0) (line 16, col 0, score 0.67)
- [Math Fundamentals — L17](chunks/math-fundamentals.md#^ref-c6e87433-17-0) (line 17, col 0, score 0.67)
- [Services — L13](chunks/services.md#^ref-75ea4a6a-13-0) (line 13, col 0, score 0.67)
- [Shared — L9](chunks/shared.md#^ref-623a55f7-9-0) (line 9, col 0, score 0.67)
- [Simulation Demo — L13](chunks/simulation-demo.md#^ref-557309a3-13-0) (line 13, col 0, score 0.67)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
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
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#^ref-5020e892-200-0) (line 200, col 0, score 1)
- [DSL — L32](chunks/dsl.md#^ref-e87bc036-32-0) (line 32, col 0, score 1)
- [Window Management — L27](chunks/window-management.md#^ref-9e8ae388-27-0) (line 27, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L206](cross-language-runtime-polymorphism.md#^ref-c34c36a6-206-0) (line 206, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L174](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-174-0) (line 174, col 0, score 1)
- [komorebi-group-window-hack — L201](komorebi-group-window-hack.md#^ref-dd89372d-201-0) (line 201, col 0, score 1)
- [lisp-dsl-for-window-management — L217](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-217-0) (line 217, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L319](migrate-to-provider-tenant-architecture.md#^ref-54382370-319-0) (line 319, col 0, score 1)
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
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
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
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L218](chroma-toolkit-consolidation-plan.md#^ref-5020e892-218-0) (line 218, col 0, score 1)
- [DSL — L21](chunks/dsl.md#^ref-e87bc036-21-0) (line 21, col 0, score 1)
- [Window Management — L12](chunks/window-management.md#^ref-9e8ae388-12-0) (line 12, col 0, score 1)
- [compiler-kit-foundations — L638](compiler-kit-foundations.md#^ref-01b21543-638-0) (line 638, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L259](cross-language-runtime-polymorphism.md#^ref-c34c36a6-259-0) (line 259, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L217](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-217-0) (line 217, col 0, score 1)
- [Interop and Source Maps — L543](interop-and-source-maps.md#^ref-cdfac40c-543-0) (line 543, col 0, score 1)
- [lisp-dsl-for-window-management — L220](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-220-0) (line 220, col 0, score 1)
- [DSL — L12](chunks/dsl.md#^ref-e87bc036-12-0) (line 12, col 0, score 1)
- [Window Management — L20](chunks/window-management.md#^ref-9e8ae388-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#^ref-01b21543-611-0) (line 611, col 0, score 1)
- [Interop and Source Maps — L526](interop-and-source-maps.md#^ref-cdfac40c-526-0) (line 526, col 0, score 1)
- [komorebi-group-window-hack — L203](komorebi-group-window-hack.md#^ref-dd89372d-203-0) (line 203, col 0, score 1)
- [lisp-dsl-for-window-management — L216](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-216-0) (line 216, col 0, score 1)
- [mystery-lisp-search-session — L120](mystery-lisp-search-session.md#^ref-513dc4c7-120-0) (line 120, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L104](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-104-0) (line 104, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [JavaScript — L26](chunks/javascript.md#^ref-c1618c66-26-0) (line 26, col 0, score 1)
- [ecs-offload-workers — L491](ecs-offload-workers.md#^ref-6498b9d7-491-0) (line 491, col 0, score 1)
- [Unique Info Dump Index — L130](unique-info-dump-index.md#^ref-30ec3ba6-130-0) (line 130, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L15](promethean-copilot-intent-engine.md#^ref-ae24a280-15-0) (line 15, col 0, score 0.72)
- [Functional Refactor of TypeScript Document Processing — L146](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-146-0) (line 146, col 0, score 0.69)
- [Promethean Dev Workflow Update — L42](promethean-dev-workflow-update.md#^ref-03a5578f-42-0) (line 42, col 0, score 0.66)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.65)
- [Promethean Infrastructure Setup — L552](promethean-infrastructure-setup.md#^ref-6deed6ac-552-0) (line 552, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L180](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-180-0) (line 180, col 0, score 0.64)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [lisp-dsl-for-window-management — L219](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-219-0) (line 219, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
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
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
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
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
