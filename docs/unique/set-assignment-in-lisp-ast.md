---
uuid: 4c87f571-9942-4288-aec4-0bc52e9cdbe7
created_at: set-assignment-in-lisp-ast.md
filename: set-assignment-in-lisp-ast
title: set-assignment-in-lisp-ast
description: >-
  Adds `Set` node to AST for handling `set!` operations, including Lisp
  front-end recognition, lowering to assignments, and JS emitter compatibility
  without changes.
tags:
  - lisp
  - ast
  - set!
  - assignment
  - compiler
  - ir
  - javascript
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - f4767ec9-7363-4ca0-ad88-ccc624247a3b
  - 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
  - 13951643-1741-46bb-89dc-1beebb122633
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 2792d448-c3b5-4050-93dd-93768529d99c
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
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
related_to_title:
  - ecs-scheduler-and-prefabs
  - ecs-scheduler
  - system-scheduler
  - Duck's Attractor States
  - Duck's Self-Referential Perceptual Loop
  - Eidolon Field Abstract Model
  - eidolon-node-lifecycle
  - Factorio AI with External Agents
  - field-dynamics-math-blocks
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Docops Feature Updates
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
  - Diagrams
references:
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4244
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 150
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 6384
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 4132
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 5020
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 6493
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 5209
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 5007
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 4525
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
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 519
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 466
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 505
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 451
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 178
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 437
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 367
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 378
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
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 7
    col: 0
    score: 1
  - uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
    line: 7
    col: 0
    score: 1
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 5
    col: 0
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 322
    col: 0
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 366
    col: 0
    score: 0.96
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 188
    col: 0
    score: 0.96
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 304
    col: 0
    score: 0.94
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.91
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.91
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.9
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.9
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 207
    col: 0
    score: 0.9
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 391
    col: 0
    score: 0.9
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 111
    col: 0
    score: 0.89
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 343
    col: 0
    score: 0.89
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.88
  - uuid: 4127189a-e0ab-436f-8571-cc852b8e9add
    line: 129
    col: 0
    score: 0.86
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 137
    col: 0
    score: 0.86
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1697
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 717
    col: 0
    score: 0.86
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 364
    col: 0
    score: 0.86
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 363
    col: 0
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 718
    col: 0
    score: 0.86
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1695
    col: 0
    score: 0.86
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1854
    col: 0
    score: 0.86
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2739
    col: 0
    score: 0.86
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21709
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22281
    col: 0
    score: 0.86
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3581
    col: 0
    score: 0.86
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1624
    col: 0
    score: 0.86
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.86
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7937
    col: 0
    score: 0.86
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4933
    col: 0
    score: 0.86
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 307
    col: 0
    score: 0.85
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.85
---
Heck yeah—here’s **`set!`** wired end-to-end (Lisp → AST → IR → JS) + the reverse compiler already emits it from `x = ...`. ^ref-c5fba0a0-1-0

## 1) AST: add a `Set` node

```ts
// shared/js/prom-lib/compiler/ast.ts
export type Expr =
  | { kind: "Num"; value: number; span: Span }
  | { kind: "Str"; value: string; span: Span }
  | { kind: "Bool"; value: boolean; span: Span }
  | { kind: "Null"; span: Span }
  | { kind: "Var"; name: Name }
  | { kind: "Let"; name: Name; value: Expr; body: Expr; span: Span }
  | { kind: "If"; cond: Expr; then: Expr; else: Expr; span: Span }
  | { kind: "Fun"; params: Name[]; body: Expr; span: Span }
  | { kind: "Call"; callee: Expr; args: Expr[]; span: Span }
  | { kind: "Bin"; op: string; left: Expr; right: Expr; span: Span }
  | { kind: "Un"; op: string; expr: Expr; span: Span }
  | { kind: "Block"; exprs: Expr[]; span: Span }
  | { kind: "Set"; name: Name; value: Expr; span: Span };  // <-- NEW
```
^ref-c5fba0a0-5-0 ^ref-c5fba0a0-22-0

## 2) Lisp front-end: recognize `(set! x expr)`
 ^ref-c5fba0a0-25-0
```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts
import { name as mkName } from "../ast";
// ...

function listToExpr(x: List): Expr {
  if (x.xs.length===0) return { kind:"Null", span:x.span! };

  const hd = x.xs[0];

  // --- NEW: (set! id value)
  if (isSym(hd,"set!")) {
    const id = x.xs[1] as Sym;
    if (id.t !== "sym") throw new Error("(set!) expects a symbol as the first argument");
    const value = x.xs[2];
    return {
      kind: "Set",
      name: mkName(id.gensym ?? id.name, id.span!),
      value: toExpr(value),
      span: x.span!
    };
  }

  // ... (rest unchanged)
}
^ref-c5fba0a0-25-0
```

## 3) Lowering: turn `Set` into an assignment on the existing symbol ^ref-c5fba0a0-54-0

We keep IR simple: **reuse** the existing `bind` statement to assign to the *same* Sym. (Our JS emitter already outputs `dst = ...;` for `bind`, so this “just works”.) ^ref-c5fba0a0-56-0

Also: prevent `set!` on **externs** (imports destructured as `const`), since that would blow up at runtime. ^ref-c5fba0a0-58-0

```ts
// shared/js/prom-lib/compiler/lower.ts
import type { Expr } from "./ast";
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lowerWithExterns(ast: Expr, externs: string[] = []): Module & { debug: { symSpan: Map<Sym, any> } } {
  const env: Map<string, Sym> = new Map();
  const externSet = new Set(externs);
  for (const name of externs) env.set(name, name as unknown as Sym);

  const symSpan = new Map<Sym, any>();
  const out: Stmt[] = [];
  const result = lowerExpr(ast, env, out, symSpan, externSet);
  out.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: out };
  return { funs: [], main, debug: { symSpan } };
}

function lowerExpr(
  e: Expr,
  env: Map<string, Sym>,
  out: Stmt[],
  dbg: Map<Sym, any>,
  externs: Set<string>
): Sym {
  switch (e.kind) {
    // ... existing cases ...

    case "Set": {
      const target = env.get(e.name.text);
      if (!target) throw new Error(`set!: unbound variable ${e.name.text}`);
      if (externs.has(e.name.text)) throw new Error(`set!: cannot assign to extern '${e.name.text}'`);
      const rhs = lowerExpr(e.value, env, out, dbg, externs);
      // assign: target = rhs
      out.push({ k:"bind", s: target, rhs: { r:"val", v: { t:"var", s: rhs } } });
      dbg.set(target, e.span);
      return target;
    }

    // ... rest unchanged ...
  }
}

^ref-c5fba0a0-58-0
// bindVal, binToPrim unchanged
```
^ref-c5fba0a0-60-0
 ^ref-c5fba0a0-106-0
## 4) JS emitter: no changes needed 🎉
 ^ref-c5fba0a0-108-0
Your `emitJS` already turns every `bind` into `dst = ...;`. Because we assign to the **same** Sym, `set!` becomes a normal JS assignment to the existing `let` variable.

(And `collectLocals` still declares each Sym once—duplicates are ignored via the Set.)
 ^ref-c5fba0a0-112-0
## 5) Reverse compiler already outputs `(set! ...)`
 ^ref-c5fba0a0-114-0
We already mapped:

```ts
// shared/js/prom-lib/compiler/lisp/js-ast2lisp.ts
case "AssignmentExpression": {
  if (n.left.type === "MemberExpression") {
    // -> (js/set! obj key val)
  }
  if (n.left.type === "Identifier") {
    return list([sym("set!"), sym(n.left.name), expr(n.right, opts)]);
^ref-c5fba0a0-114-0
  } ^ref-c5fba0a0-126-0
}
^ref-c5fba0a0-126-0
``` ^ref-c5fba0a0-130-0

So **`x = y`** becomes **`(set! x y)`**. ^ref-c5fba0a0-130-0

## 6) Quick sanity check

```lisp
; test.lisp
(let ((x 1)
      (y 2))
^ref-c5fba0a0-130-0
  (set! x (+ x y))   ; x = 3
  (set! y 10)        ; y = 10
^ref-c5fba0a0-139-0
  (+ x y))           ; -> 13 ^ref-c5fba0a0-144-0
```
^ref-c5fba0a0-139-0
 ^ref-c5fba0a0-144-0
```ts
^ref-c5fba0a0-148-0
^ref-c5fba0a0-145-0
import { runLisp } from "./compiler/lisp/driver";
console.log(runLisp(`(let ((x 1) (y 2)) (set! x (+ x y)) (set! y 10) (+ x y))`)); // 13
``` ^ref-c5fba0a0-148-0
 ^ref-c5fba0a0-154-0
If you want `set!` for **fields** too (i.e. `(set! x.a 5)`), we can either macro-expand that to `(js/set! x "a" 5)` or add dotted lvalues to the reader—your call.
