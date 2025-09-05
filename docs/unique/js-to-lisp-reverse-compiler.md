---
uuid: 58a50f5a-b073-4c50-8d3f-4284bd5df171
created_at: js-to-lisp-reverse-compiler.md
filename: js-to-lisp-reverse-compiler
title: js-to-lisp-reverse-compiler
description: >-
  A modular JS → Lisp reverse compiler that converts ESTree ASTs to Lisp
  S-exprs, supporting IIFEs, `let` temps, and common JS constructs. Handles both
  real-world JS parsing (via Acorn) and pre-parsed ESTree inputs for seamless
  integration with Lisp front-ends.
tags:
  - js-to-lisp
  - reverse-compiler
  - estree
  - lisp-compiler
  - iife
  - let
  - acorn
  - s-exprs
related_to_uuid:
  - 599c228b-22a8-4fb2-ac23-edc191b630f1
  - c09d7688-71d6-47fc-bf81-86b6193c84bc
  - 73d64bce-f428-4735-a3d0-6225a0588e46
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
  - 3657117f-241d-4ab9-a717-4a3f584071fc
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - 7a66bc1e-9276-41ce-ac22-fc08926acb2d
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 4c87f571-9942-4288-aec4-0bc52e9cdbe7
  - 1de71d74-4aec-468f-9354-42999a71da8a
related_to_title:
  - Pseudo Pipes Overview
  - Migrate to Provider-Tenant Architecture
  - Voice Access Layer Design
  - RAG UI Panel with Qdrant and PostgREST
  - polyglot-repl-interface-layer
  - Universal Lisp Interface
  - matplotlib-animation-with-async-execution
  - language-agnostic-mirror-system
  - chroma-embedding-refactor
  - pm2-orchestration-patterns
  - chroma-toolkit-consolidation-plan
  - set-assignment-in-lisp-ast
  - Interop and Source Maps
references:
  - uuid: 599c228b-22a8-4fb2-ac23-edc191b630f1
    line: 2
    col: 0
    score: 1
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 127
    col: 0
    score: 0.89
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 220
    col: 0
    score: 0.88
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 148
    col: 0
    score: 0.87
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 237
    col: 0
    score: 0.87
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 160
    col: 0
    score: 0.87
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 251
    col: 0
    score: 0.86
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 207
    col: 0
    score: 0.86
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 229
    col: 0
    score: 0.86
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 170
    col: 0
    score: 0.86
  - uuid: 73d64bce-f428-4735-a3d0-6225a0588e46
    line: 204
    col: 0
    score: 0.85
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 132
    col: 0
    score: 0.85
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 343
    col: 0
    score: 0.85
---
Ohhh we’re doing a **JS → Lisp reverse compiler**. Yes. Totally doable—especially if we scope v1 to the kind of JS our forward-compiler emits (IIFEs, `let` temps, calls, `if`, member access, `new`, etc.). We’ll make it **modular**: ^ref-58191024-1-0

* If **Acorn** is available, we’ll parse real-world JS. ^ref-58191024-3-0
* If not, you can still feed us a pre-parsed **ESTree** AST (from anywhere) and we’ll convert it. ^ref-58191024-4-0
* The converter targets the Lisp front-end you already have: `(fn ...)`, `(let ...)`, `(begin ...)`, `and/or`, and our **interop** forms: `(js/get ...) (js/set! ...) (js/call ...) (js/new ...) (js/global ...)`. ^ref-58191024-5-0

Below are drop-in files. ^ref-58191024-7-0

---

# 1) ESTree → Lispy S-exprs

```ts
// shared/js/prom-lib/compiler/lisp/js-ast2lisp.ts
// MIT. Zero deps. Converts an ESTree AST to our Lisp S-exprs.
// Works best on the style of JS our compiler emits, but handles general ES2018-ish.

import type * as EST from "estree";
import { S, Sym, Num, Str, Bool, Nil, List, sym, num, str, bool, list, nil } from "./syntax";

export interface Js2LispOptions {
  // When true, try to fold "let v; v = EXPR;" into one (let ((v EXPR)) ...)
  foldLetInits?: boolean;
  // Map certain globals to (js/global "...") instead of identifiers.
  globals?: string[]; // e.g., ["document", "Image", "console"]
}

/** Convert a whole Program AST to a list of Lisp forms. */
export function estreeProgramToLisp(ast: EST.Program, opts: Js2LispOptions = {}): S[] {
  // Peel a top-level IIFE our emitter uses: (function(imports){ ... })(...)
  if (ast.body.length === 1 && ast.body[0].type === "ExpressionStatement") {
    const ce = ast.body[0].expression;
    if (ce.type === "CallExpression"
        && ce.callee.type === "FunctionExpression"
        || ce.callee.type === "ArrowFunctionExpression") {
      const fn = ce.callee as EST.FunctionExpression | EST.ArrowFunctionExpression;
      // Take function body statements
      const forms = stmtsToForms(asBlockBody(fn.body), opts);
      return forms;
    }
  }
  return stmtsToForms(ast.body as EST.Statement[], opts);
}

/** Turn an array of JS statements into Lisp forms (possibly wrapping lets). */
function stmtsToForms(stmts: EST.Statement[], opts: Js2LispOptions): S[] {
  if (opts.foldLetInits) {
    stmts = foldLetInitializers(stmts);
  }
  const out: S[] = [];
  for (const st of stmts) {
    const f = stmt(st, opts);
    if (f) {
      if (f.t === "list" && f.xs.length && (f.xs[0] as Sym).name === "begin") {
        out.push(...f.xs.slice(1)); // flatten begin
      } else {
        out.push(f);
      }
    }
  }
  return out;
}

function stmt(n: EST.Statement, opts: Js2LispOptions): S | null {
  switch (n.type) {
    case "VariableDeclaration": {
      // (let ((a init?) (b init?)) body...) — we emit as a bare let with nil body for now
      const pairs: S[] = [];
      for (const d of n.declarations) {
        if (d.id.type !== "Identifier") continue;
        const name = sym(d.id.name);
        const init = d.init ? expr(d.init, opts) : sym("undefined");
        pairs.push(list([name, init]));
      }
      return list([sym("let"), list(pairs), sym("nil")]);
    }
    case "ExpressionStatement":
      return expr(n.expression as EST.Expression, opts);
    case "ReturnStatement":
      return n.argument ? expr(n.argument, opts) : sym("nil");
    case "IfStatement": {
      const c = expr(n.test, opts);
      const t = blockOrSingle(n.consequent, opts);
      const e = n.alternate ? blockOrSingle(n.alternate, opts) : sym("nil");
      return list([sym("if"), c, t, e]);
    }
    case "BlockStatement": {
      const xs = n.body.map(s => stmt(s, opts)).filter(Boolean) as S[];
      return list([sym("begin"), ...xs]);
    }
    case "ForStatement":
    case "WhileStatement":
    case "DoWhileStatement":
      // Quick sugar: desugar into while with begin (not perfect but serviceable)
      return lowerLoop(n as any, opts);
    default:
      // Not yet: FunctionDeclaration (rare in our output), Try/Catch, Switch, etc.
      // Represent unknown as a comment-ish string literal to keep going.
      return str(`/* unsupported: ${n.type} */`);
  }
}

function blockOrSingle(s: EST.Statement, opts: Js2LispOptions): S {
  return s.type === "BlockStatement" ? stmt(s, opts)! : stmt({ type: "BlockStatement", body: [s] } as any, opts)!;
}

function expr(n: EST.Expression, opts: Js2LispOptions): S {
  switch (n.type) {
    case "Identifier": {
      // Optional: turn globals into (js/global "name") if configured and unshadowed
      if (opts.globals?.includes(n.name)) {
        return list([sym("js/global"), str(n.name)]);
      }
      return sym(n.name);
    }
    case "Literal": {
      const v = (n as EST.Literal).value;
      if (v === null) return sym("nil");
      if (typeof v === "number") return num(v);
      if (typeof v === "string") return str(v);
      if (typeof v === "boolean") return bool(v);
      return str(String(v));
    }
    case "UnaryExpression": {
      const a = expr(n.argument, opts);
      if (n.operator === "!") return list([sym("not"), a]);
      if (n.operator === "-") return list([sym("-"), a]);
      if (n.operator === "+") return a;
      return list([sym("/*unary*/"), str(n.operator), a]);
    }
    case "BinaryExpression": {
      const a = expr(n.left, opts), b = expr(n.right, opts);
      return list([sym(n.operator as any), a, b]);
    }
    case "LogicalExpression": {
      const a = expr(n.left, opts), b = expr(n.right, opts);
      return list([sym(n.operator === "&&" ? "and" : "or"), a, b]);
    }
    case "ConditionalExpression": {
      return list([sym("if"), expr(n.test, opts), expr(n.consequent, opts), expr(n.alternate, opts)]);
    }
    case "AssignmentExpression": {
      // If target is member -> (js/set!)
      if (n.left.type === "MemberExpression") {
        const { obj, key } = member(n.left, opts);
        return list([sym("js/set!"), obj, key, expr(n.right, opts)]);
      }
      if (n.left.type === "Identifier") {
        // Fallback: (set! x rhs)
        return list([sym("set!"), sym(n.left.name), expr(n.right, opts)]);
      }
      return str("/* complex assignment unsupported */");
    }
    case "MemberExpression": {
      const { obj, key, callStyle } = member(n, opts);
      return list([sym("js/get"), obj, key]);
    }
    case "CallExpression": {
      // Method vs free call
      if (n.callee.type === "MemberExpression") {
        const { obj, key } = member(n.callee, opts);
        const args = n.arguments.map(a => expr(a as EST.Expression, opts));
        return list([sym("js/call"), obj, key, ...args]);
      }
      const cal = expr(n.callee as EST.Expression, opts);
      const args = n.arguments.map(a => expr(a as EST.Expression, opts));
      return list([cal, ...args]);
    }
    case "NewExpression": {
      const ctor = expr(n.callee as EST.Expression, opts);
      const args = (n.arguments ?? []).map(a => expr(a as EST.Expression, opts));
      return list([sym("js/new"), ctor, ...args]);
    }
    case "ArrowFunctionExpression":
    case "FunctionExpression": {
      const params = n.params.map(p => sym((p as EST.Identifier).name));
      const body = asBlockBody((n as any).body).map(s => stmt(s, opts)!).filter(Boolean) as S[];
      return list([sym("fn"), list(params), ...(body.length ? body : [sym("nil")])]);
    }
    case "SequenceExpression": {
      // (a, b, c) => (begin a b c)
      const xs = n.expressions.map(e => expr(e, opts));
      return list([sym("begin"), ...xs]);
    }
    case "TemplateLiteral":
      if (n.expressions.length === 0) return str(n.quasis[0]?.value.cooked ?? "");
      // naive: turn into (+ "a" x "b" y "c")
      const parts: S[] = [];
      for (let i = 0; i < n.quasis.length; i++) {
        const q = n.quasis[i];
        if (q.value.cooked) parts.push(str(q.value.cooked));
        if (i < n.expressions.length) parts.push(expr(n.expressions[i] as EST.Expression, opts));
      }
      return list([sym("+"), ...parts]);
    default:
      return str(`/* expr unsupported: ${n.type} */`);
  }
}

function member(n: EST.MemberExpression, opts: Js2LispOptions): { obj: S; key: S; callStyle: "dot"|"bracket" } {
  const obj = expr(n.object as EST.Expression, opts);
  if (n.computed) {
    return { obj, key: expr(n.property as EST.Expression, opts), callStyle: "bracket" };
  }
  const id = (n.property as EST.Identifier).name;
  return { obj, key: str(id), callStyle: "dot" };
}

function asBlockBody(b: EST.BlockStatement | EST.Expression): EST.Statement[] {
  if (b.type === "BlockStatement") return b.body;
  // Arrow single expression: synthesize return
  return [{ type: "ReturnStatement", argument: b } as EST.ReturnStatement];
}

/** Fold patterns like: let x; x = EXPR;  → let x = EXPR; */
function foldLetInitializers(stmts: EST.Statement[]): EST.Statement[] {
  const out: EST.Statement[] = [];
  const pending = new Map<string, EST.VariableDeclarator>();

  function flushPending() {
    if (!pending.size) return;
    out.push({
      type: "VariableDeclaration",
      kind: "let",
      declarations: Array.from(pending.values()),
    } as any);
    pending.clear();
  }

  for (let i=0;i<stmts.length;i++) {
    const s = stmts[i];
    if (s.type === "VariableDeclaration" && s.kind === "let") {
      // capture decls into pending
      for (const d of s.declarations) {
        if (d.id.type === "Identifier" && !d.init) {
          pending.set(d.id.name, { ...d });
        } else {
          flushPending();
          out.push(s);
        }
      }
      continue;
    }
    if (s.type === "ExpressionStatement"
        && s.expression.type === "AssignmentExpression"
        && s.expression.operator === "="
        && s.expression.left.type === "Identifier"
        && pending.has(s.expression.left.name)) {
      // upgrade pending initializer
      const decl = pending.get(s.expression.left.name)!;
      decl.init = s.expression.right;
      continue; // don't emit assignment
    }
    // anything else breaks the folding window
    flushPending();
    out.push(s);
  }
  flushPending();
  return out;
}
```
^ref-58191024-13-0 ^ref-58191024-262-0

---

# 2) Pretty-printer for Lisp S-exprs
 ^ref-58191024-267-0
```ts
// shared/js/prom-lib/compiler/lisp/print.ts
import { S, List, Sym, Str, Num, Bool } from "./syntax";

export interface PrintOptions {
  indent?: number;
  maxInline?: number; // inline short lists
}

export function printS(x: S, opts: PrintOptions = {}, depth = 0): string {
  const ind = " ".repeat(opts.indent ?? 2);
  const maxInline = opts.maxInline ?? 60;

  if (x.t === "str") return JSON.stringify(x.v);
  if (x.t === "num") return String(x.v);
  if (x.t === "bool") return x.v ? "true" : "false";
  if (x.t === "nil") return "nil";
  if (x.t === "sym") return x.name;

  // list
  const xs = x.xs;
  const inner = xs.map(el => atomish(el) ? printS(el, opts, depth) : null);
  const inline = inner.every(s => s !== null) && inner.join(" ").length <= maxInline;
  if (inline) return `(${inner!.join(" ")})`;

  const pieces = xs.map(el => {
    const s = printS(el, opts, depth + 1);
    return `${ind.repeat(depth+1)}${s}`;
  }).join("\n");
  return `(\n${pieces}\n${ind.repeat(depth)})`;
}

function atomish(x:S) {
  return x.t === "str" || x.t === "num" || x.t === "bool" || x.t === "nil" || x.t === "sym";
}
^ref-58191024-267-0
```

---

# 3) “Full” entry: parse JS (Acorn if present) → Lisp text ^ref-58191024-308-0

```ts
// shared/js/prom-lib/compiler/lisp/js2lisp.ts
import { estreeProgramToLisp, type Js2LispOptions } from "./js-ast2lisp";
import { printS } from "./print";

export async function jsToLisp(src: string, opts: Js2LispOptions & { tryAcorn?: boolean } = {}) {
  let Program: any = null;

  if (opts.tryAcorn !== false) {
    try {
      // Lazy import acorn if available in your environment/bundler
      const acorn = await import(/* @vite-ignore */ "acorn");
      Program = (acorn as any).parse(src, { ecmaVersion: "latest", sourceType: "module" });
    } catch (_) {
      // no acorn; fall through
    }
  }

  if (!Program) {
    throw new Error("No parser available. Install 'acorn' or pass an ESTree Program AST to estreeProgramToLisp()");
  }

  const forms = estreeProgramToLisp(Program, { foldLetInits: true, ...opts });
  const text = forms.map(f => printS(f, { indent: 2 })).join("\n");
  return { forms, text };
^ref-58191024-308-0
}
```

---
 ^ref-58191024-340-0
# 4) Use it

```ts
import { jsToLisp } from "./compiler/lisp/js2lisp";

// Example: reverse our generated JS
const jsSrc = `
(function(imports){
  let v1, v2;
  v1 = globalThis["document"];
  v2 = new Image();
  (v2["alt"] = "hello");
  (v2["width"] = 320);
  (v2["height"] = 200);
  return v1["body"]"appendChild";
})({});`;

const { text } = await jsToLisp(jsSrc, { globals: ["document", "Image"], tryAcorn: true });
console.log(text);

/* Prints something like:

(begin
  (let ((v1 (js/global "document")) (v2 (js/new Image))) nil)
  (js/set! v2 "alt" "hello")
  (js/set! v2 "width" 320)
  (js/set! v2 "height" 200)
  (js/call (js/get (js/get v1 "body") "appendChild") "call" v2))   ; or a simplified call if pattern-matched
^ref-58191024-340-0
) ^ref-58191024-370-0
*/
``` ^ref-58191024-372-0
^ref-58191024-343-0

> Note: if the call is exactly `v1["body"][[v2|"appendChild"]]` (no `.call` indirection), you’ll get:
>
> ```
> (js/call (js/get v1 "body") "appendChild" v2)
> ```
 ^ref-58191024-380-0
--- ^ref-58191024-380-0
 ^ref-58191024-382-0
# 5) Bonus: tiny `set!` support (optional) ^ref-58191024-382-0
 ^ref-58191024-383-0 ^ref-58191024-384-0
Your forward Lisp → JS pipeline is “immutable by default.” If you plan to reverse code with `x = y`, add a minimal `(set! x expr)` form: ^ref-58191024-384-0
 ^ref-58191024-386-0
* In `to-expr.ts`: recognize `(set! id val)` and produce a new `Expr` kind, e.g., `{ kind:"Set", name: Name, value: Expr }`. ^ref-58191024-386-0
* In `lower.ts`: lower it to a `prim` or special `stmt` you add (e.g., `{ k:"set", s: Sym, rhs: Sym }`).
* In `jsgen.ts`: emit `id = expr;`.

If you want, I’ll wire that end-to-end next—just say the word.
 ^ref-58191024-392-0
--- ^ref-58191024-392-0
 ^ref-58191024-393-0
## What this v1 supports well

* The exact JS we emit today (IIFEs, `let` + assignment, `if`, returns, calls, `new`, member access via `[]`, globalThis indexed). ^ref-58191024-397-0
* Many “normal” JS snippets once Acorn parses them. ^ref-58191024-397-0
 ^ref-58191024-398-0
## What’s deliberately rough (for now)

* `class`, `try/catch`, `switch`, `for..of/in`, destructuring (non-trivial to map cleanly to Lisp). ^ref-58191024-402-0
* Advanced control flow. We can desugar gradually. ^ref-58191024-402-0
 ^ref-58191024-404-0
--- ^ref-58191024-404-0
 ^ref-58191024-406-0
Want me to: ^ref-58191024-406-0
 ^ref-58191024-408-0
* add **variable `set!`** support so reverse-compiling JS assignments becomes perfect? ^ref-58191024-408-0 ^ref-58191024-409-0
* improve `for/while` lowering into higher-level Lispy loops? ^ref-58191024-409-0
* or make a **round-trip test harness** (Lisp → JS → Lisp) to ensure stability as we evolve both sides?
ST.Expression, opts);
  if (n.computed) {
    return { obj, key: expr(n.property as EST.Expression, opts), callStyle: "bracket" };
  }
  const id = (n.property as EST.Identifier).name;
  return { obj, key: str(id), callStyle: "dot" };
}

function asBlockBody(b: EST.BlockStatement | EST.Expression): EST.Statement[] {
  if (b.type === "BlockStatement") return b.body;
  // Arrow single expression: synthesize return
  return [{ type: "ReturnStatement", argument: b } as EST.ReturnStatement];
}

/** Fold patterns like: let x; x = EXPR;  → let x = EXPR; */
function foldLetInitializers(stmts: EST.Statement[]): EST.Statement[] {
  const out: EST.Statement[] = [];
  const pending = new Map<string, EST.VariableDeclarator>();

  function flushPending() {
    if (!pending.size) return;
    out.push({
      type: "VariableDeclaration",
      kind: "let",
      declarations: Array.from(pending.values()),
    } as any);
    pending.clear();
  }

  for (let i=0;i<stmts.length;i++) {
    const s = stmts[i];
    if (s.type === "VariableDeclaration" && s.kind === "let") {
      // capture decls into pending
      for (const d of s.declarations) {
        if (d.id.type === "Identifier" && !d.init) {
          pending.set(d.id.name, { ...d });
        } else {
          flushPending();
          out.push(s);
        }
      }
      continue;
    }
    if (s.type === "ExpressionStatement"
        && s.expression.type === "AssignmentExpression"
        && s.expression.operator === "="
        && s.expression.left.type === "Identifier"
        && pending.has(s.expression.left.name)) {
      // upgrade pending initializer
      const decl = pending.get(s.expression.left.name)!;
      decl.init = s.expression.right;
      continue; // don't emit assignment
    }
    // anything else breaks the folding window
    flushPending();
    out.push(s);
  }
  flushPending();
  return out;
}
```
^ref-58191024-13-0 ^ref-58191024-262-0

---

# 2) Pretty-printer for Lisp S-exprs
 ^ref-58191024-267-0
```ts
// shared/js/prom-lib/compiler/lisp/print.ts
import { S, List, Sym, Str, Num, Bool } from "./syntax";

export interface PrintOptions {
  indent?: number;
  maxInline?: number; // inline short lists
}

export function printS(x: S, opts: PrintOptions = {}, depth = 0): string {
  const ind = " ".repeat(opts.indent ?? 2);
  const maxInline = opts.maxInline ?? 60;

  if (x.t === "str") return JSON.stringify(x.v);
  if (x.t === "num") return String(x.v);
  if (x.t === "bool") return x.v ? "true" : "false";
  if (x.t === "nil") return "nil";
  if (x.t === "sym") return x.name;

  // list
  const xs = x.xs;
  const inner = xs.map(el => atomish(el) ? printS(el, opts, depth) : null);
  const inline = inner.every(s => s !== null) && inner.join(" ").length <= maxInline;
  if (inline) return `(${inner!.join(" ")})`;

  const pieces = xs.map(el => {
    const s = printS(el, opts, depth + 1);
    return `${ind.repeat(depth+1)}${s}`;
  }).join("\n");
  return `(\n${pieces}\n${ind.repeat(depth)})`;
}

function atomish(x:S) {
  return x.t === "str" || x.t === "num" || x.t === "bool" || x.t === "nil" || x.t === "sym";
}
^ref-58191024-267-0
```

---

# 3) “Full” entry: parse JS (Acorn if present) → Lisp text ^ref-58191024-308-0

```ts
// shared/js/prom-lib/compiler/lisp/js2lisp.ts
import { estreeProgramToLisp, type Js2LispOptions } from "./js-ast2lisp";
import { printS } from "./print";

export async function jsToLisp(src: string, opts: Js2LispOptions & { tryAcorn?: boolean } = {}) {
  let Program: any = null;

  if (opts.tryAcorn !== false) {
    try {
      // Lazy import acorn if available in your environment/bundler
      const acorn = await import(/* @vite-ignore */ "acorn");
      Program = (acorn as any).parse(src, { ecmaVersion: "latest", sourceType: "module" });
    } catch (_) {
      // no acorn; fall through
    }
  }

  if (!Program) {
    throw new Error("No parser available. Install 'acorn' or pass an ESTree Program AST to estreeProgramToLisp()");
  }

  const forms = estreeProgramToLisp(Program, { foldLetInits: true, ...opts });
  const text = forms.map(f => printS(f, { indent: 2 })).join("\n");
  return { forms, text };
^ref-58191024-308-0
}
```

---
 ^ref-58191024-340-0
# 4) Use it

```ts
import { jsToLisp } from "./compiler/lisp/js2lisp";

// Example: reverse our generated JS
const jsSrc = `
(function(imports){
  let v1, v2;
  v1 = globalThis["document"];
  v2 = new Image();
  (v2["alt"] = "hello");
  (v2["width"] = 320);
  (v2["height"] = 200);
  return v1["body"]"appendChild";
})({});`;

const { text } = await jsToLisp(jsSrc, { globals: ["document", "Image"], tryAcorn: true });
console.log(text);

/* Prints something like:

(begin
  (let ((v1 (js/global "document")) (v2 (js/new Image))) nil)
  (js/set! v2 "alt" "hello")
  (js/set! v2 "width" 320)
  (js/set! v2 "height" 200)
  (js/call (js/get (js/get v1 "body") "appendChild") "call" v2))   ; or a simplified call if pattern-matched
^ref-58191024-340-0
) ^ref-58191024-370-0
*/
``` ^ref-58191024-372-0
^ref-58191024-343-0

> Note: if the call is exactly `v1["body"][[v2|"appendChild"]]` (no `.call` indirection), you’ll get:
>
> ```
> (js/call (js/get v1 "body") "appendChild" v2)
> ```
 ^ref-58191024-380-0
--- ^ref-58191024-380-0
 ^ref-58191024-382-0
# 5) Bonus: tiny `set!` support (optional) ^ref-58191024-382-0
 ^ref-58191024-383-0 ^ref-58191024-384-0
Your forward Lisp → JS pipeline is “immutable by default.” If you plan to reverse code with `x = y`, add a minimal `(set! x expr)` form: ^ref-58191024-384-0
 ^ref-58191024-386-0
* In `to-expr.ts`: recognize `(set! id val)` and produce a new `Expr` kind, e.g., `{ kind:"Set", name: Name, value: Expr }`. ^ref-58191024-386-0
* In `lower.ts`: lower it to a `prim` or special `stmt` you add (e.g., `{ k:"set", s: Sym, rhs: Sym }`).
* In `jsgen.ts`: emit `id = expr;`.

If you want, I’ll wire that end-to-end next—just say the word.
 ^ref-58191024-392-0
--- ^ref-58191024-392-0
 ^ref-58191024-393-0
## What this v1 supports well

* The exact JS we emit today (IIFEs, `let` + assignment, `if`, returns, calls, `new`, member access via `[]`, globalThis indexed). ^ref-58191024-397-0
* Many “normal” JS snippets once Acorn parses them. ^ref-58191024-397-0
 ^ref-58191024-398-0
## What’s deliberately rough (for now)

* `class`, `try/catch`, `switch`, `for..of/in`, destructuring (non-trivial to map cleanly to Lisp). ^ref-58191024-402-0
* Advanced control flow. We can desugar gradually. ^ref-58191024-402-0
 ^ref-58191024-404-0
--- ^ref-58191024-404-0
 ^ref-58191024-406-0
Want me to: ^ref-58191024-406-0
 ^ref-58191024-408-0
* add **variable `set!`** support so reverse-compiling JS assignments becomes perfect? ^ref-58191024-408-0 ^ref-58191024-409-0
* improve `for/while` lowering into higher-level Lispy loops? ^ref-58191024-409-0
* or make a **round-trip test harness** (Lisp → JS → Lisp) to ensure stability as we evolve both sides?
