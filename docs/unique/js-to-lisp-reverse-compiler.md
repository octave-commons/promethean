---
uuid: 8a5cb1ca-ee14-4096-9348-48349e838b8b
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
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
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
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 13951643-1741-46bb-89dc-1beebb122633
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
related_to_title:
  - Chroma Toolkit Consolidation Plan
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
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
  - eidolon-field-math-foundations
  - Duck's Attractor States
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - Interop and Source Maps
  - Optimizing Command Limitations in System Design
references:
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
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 498
    col: 0
    score: 0.93
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 4122
    col: 0
    score: 0.91
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 4053
    col: 0
    score: 0.91
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 239
    col: 0
    score: 0.91
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 203
    col: 0
    score: 0.91
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 397
    col: 0
    score: 0.91
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 1735
    col: 0
    score: 0.9
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3239
    col: 0
    score: 0.9
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2451
    col: 0
    score: 0.9
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1952
    col: 0
    score: 0.9
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2070
    col: 0
    score: 0.9
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.9
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 602
    col: 0
    score: 0.89
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 282
    col: 0
    score: 0.89
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 303
    col: 0
    score: 0.89
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 129
    col: 0
    score: 0.89
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 523
    col: 0
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 148
    col: 0
    score: 0.87
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.87
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 476
    col: 0
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 426
    col: 0
    score: 0.87
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 138
    col: 0
    score: 0.86
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 127
    col: 0
    score: 0.86
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 251
    col: 0
    score: 0.86
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 237
    col: 0
    score: 0.86
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 220
    col: 0
    score: 0.86
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.86
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.86
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 106
    col: 0
    score: 0.86
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2033
    col: 0
    score: 0.86
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2534
    col: 0
    score: 0.86
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2368
    col: 0
    score: 0.86
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 8143
    col: 0
    score: 0.86
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3515
    col: 0
    score: 0.86
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 3103
    col: 0
    score: 0.86
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3544
    col: 0
    score: 0.86
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 207
    col: 0
    score: 0.85
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 160
    col: 0
    score: 0.85
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3980
    col: 0
    score: 0.85
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2695
    col: 0
    score: 0.85
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1863
    col: 0
    score: 0.85
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 5070
    col: 0
    score: 0.85
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 610
    col: 0
    score: 0.85
---
Ohhh we’re doing a **JS → Lisp reverse compiler**. Yes. Totally doable—especially if we scope v1 to the kind of JS our forward-compiler emits (IIFEs, `let` temps, calls, `if`, member access, `new`, etc.). We’ll make it **modular**: ^ref-58191024-1-0

* If **Acorn** is available, we’ll parse real-world JS. ^ref-58191024-3-0
* If not, you can still feed us a pre-parsed **ESTree** AST (from anywhere) and we’ll convert it. ^ref-58191024-4-0 ^ref-58a50f5a-4-0
* The converter targets the Lisp front-end you already have: `(fn ...)`, `(let ...)`, `(begin ...)`, `and/or`, and our **interop** forms: `(js/get ...) (js/set! ...) (js/call ...) (js/new ...) (js/global ...)`. ^ref-58191024-5-0 ^ref-58a50f5a-5-0

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
^ref-58a50f5a-343-0
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
2))   ; or a simplified call if pattern-matched
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
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
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
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
## Sources
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
- [Interop and Source Maps — L498](interop-and-source-maps.md#^ref-cdfac40c-498-0) (line 498, col 0, score 0.93)
- [Model Upgrade Calm-Down Guide — L4122](model-upgrade-calm-down-guide.md#^ref-db74343f-4122-0) (line 4122, col 0, score 0.91)
- [Promethean State Format — L4053](promethean-state-format.md#^ref-23df6ddb-4053-0) (line 4053, col 0, score 0.91)
- [Unique Info Dump Index — L239](unique-info-dump-index.md#^ref-30ec3ba6-239-0) (line 239, col 0, score 0.91)
- [Optimizing Command Limitations in System Design — L203](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-203-0) (line 203, col 0, score 0.91)
- [sibilant-macro-targets — L397](sibilant-macro-targets.md#^ref-c5c9a5c6-397-0) (line 397, col 0, score 0.91)
- [ParticleSimulationWithCanvasAndFFmpeg — L1735](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1735-0) (line 1735, col 0, score 0.9)
- [Factorio AI with External Agents — L3239](factorio-ai-with-external-agents.md#^ref-a4d90289-3239-0) (line 3239, col 0, score 0.9)
- [Functional Embedding Pipeline Refactor — L2451](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2451-0) (line 2451, col 0, score 0.9)
- [Functional Refactor of TypeScript Document Processing — L1952](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1952-0) (line 1952, col 0, score 0.9)
- [graph-ds — L2070](graph-ds.md#^ref-6620e2f2-2070-0) (line 2070, col 0, score 0.9)
- [Cross-Target Macro System in Sibilant — L148](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-148-0) (line 148, col 0, score 0.9)
- [graph-ds — L602](graph-ds.md#^ref-6620e2f2-602-0) (line 602, col 0, score 0.89)
- [Admin Dashboard for User Management — L282](admin-dashboard-for-user-management.md#^ref-2901a3e9-282-0) (line 282, col 0, score 0.89)
- [Promethean Pipelines — L303](promethean-pipelines.md#^ref-8b8e6103-303-0) (line 303, col 0, score 0.89)
- [Local-Only-LLM-Workflow — L129](local-only-llm-workflow.md#^ref-9a8ab57e-129-0) (line 129, col 0, score 0.89)
- [Lisp-Compiler-Integration — L523](lisp-compiler-integration.md#^ref-cfee6d36-523-0) (line 523, col 0, score 0.88)
- [Migrate to Provider-Tenant Architecture — L148](migrate-to-provider-tenant-architecture.md#^ref-54382370-148-0) (line 148, col 0, score 0.87)
- [compiler-kit-foundations — L588](compiler-kit-foundations.md#^ref-01b21543-588-0) (line 588, col 0, score 0.87)
- [Eidolon Field Abstract Model — L476](eidolon-field-abstract-model.md#^ref-5e8b2388-476-0) (line 476, col 0, score 0.87)
- [Unique Info Dump Index — L426](unique-info-dump-index.md#^ref-30ec3ba6-426-0) (line 426, col 0, score 0.87)
- [polyglot-repl-interface-layer — L138](polyglot-repl-interface-layer.md#^ref-9c79206d-138-0) (line 138, col 0, score 0.86)
- [Migrate to Provider-Tenant Architecture — L127](migrate-to-provider-tenant-architecture.md#^ref-54382370-127-0) (line 127, col 0, score 0.86)
- [Migrate to Provider-Tenant Architecture — L251](migrate-to-provider-tenant-architecture.md#^ref-54382370-251-0) (line 251, col 0, score 0.86)
- [Migrate to Provider-Tenant Architecture — L237](migrate-to-provider-tenant-architecture.md#^ref-54382370-237-0) (line 237, col 0, score 0.86)
- [Migrate to Provider-Tenant Architecture — L220](migrate-to-provider-tenant-architecture.md#^ref-54382370-220-0) (line 220, col 0, score 0.86)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.86)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.86)
- [mystery-lisp-search-session — L106](mystery-lisp-search-session.md#^ref-513dc4c7-106-0) (line 106, col 0, score 0.86)
- [Dynamic Context Model for Web Components — L2033](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2033-0) (line 2033, col 0, score 0.86)
- [Prometheus Observability Stack — L2534](prometheus-observability-stack.md#^ref-e90b5a16-2534-0) (line 2534, col 0, score 0.86)
- [sibilant-macro-targets — L2368](sibilant-macro-targets.md#^ref-c5c9a5c6-2368-0) (line 2368, col 0, score 0.86)
- [Dynamic Context Model for Web Components — L8143](dynamic-context-model-for-web-components.md#^ref-f7702bf8-8143-0) (line 8143, col 0, score 0.86)
- [Fnord Tracer Protocol — L3515](fnord-tracer-protocol.md#^ref-fc21f824-3515-0) (line 3515, col 0, score 0.86)
- [Protocol_0_The_Contradiction_Engine — L3103](protocol-0-the-contradiction-engine.md#^ref-9a93a756-3103-0) (line 3103, col 0, score 0.86)
- [Per-Domain Policy System for JS Crawler — L3544](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3544-0) (line 3544, col 0, score 0.86)
- [Migrate to Provider-Tenant Architecture — L207](migrate-to-provider-tenant-architecture.md#^ref-54382370-207-0) (line 207, col 0, score 0.85)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.85)
- [Chroma Toolkit Consolidation Plan — L3980](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3980-0) (line 3980, col 0, score 0.85)
- [komorebi-group-window-hack — L2695](komorebi-group-window-hack.md#^ref-dd89372d-2695-0) (line 2695, col 0, score 0.85)
- [Model Selection for Lightweight Conversational Tasks — L1863](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1863-0) (line 1863, col 0, score 0.85)
- [sibilant-macro-targets — L5070](sibilant-macro-targets.md#^ref-c5c9a5c6-5070-0) (line 5070, col 0, score 0.85)
- [Mongo Outbox Implementation — L610](mongo-outbox-implementation.md#^ref-9c1acd1e-610-0) (line 610, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
