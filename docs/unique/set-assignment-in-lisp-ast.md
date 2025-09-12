---
uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
created_at: 2025.08.08.23.08.19.md
filename: set-assignment-in-lisp-ast
description: >-
  Adds `Set` node to AST for `set!` operations, implements Lisp front-end
  recognition, lowering to assignments, and ensures compatibility with existing
  JS emitter and reverse compiler.
tags:
  - lisp
  - ast
  - set
  - assignment
  - compiler
  - ir
  - js
  - reverse
related_to_title:
  - Interop and Source Maps
  - compiler-kit-foundations
  - Lispy Macros with syntax-rules
  - Lisp-Compiler-Integration
  - js-to-lisp-reverse-compiler
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Language-Agnostic Mirror System
  - ecs-scheduler-and-prefabs
  - DSL
  - ecs-offload-workers
  - Dynamic Context Model for Web Components
  - Cross-Target Macro System in Sibilant
  - archetype-ecs
  - template-based-compilation
  - Promethean Agent Config DSL
related_to_uuid:
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
references:
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 140
    col: 1
    score: 0.89
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 319
    col: 1
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 359
    col: 1
    score: 0.96
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 301
    col: 1
    score: 0.94
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 13
    col: 1
    score: 0.86
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 491
    col: 1
    score: 0.86
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 11
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 11
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 606
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 606
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 422
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 422
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 534
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 534
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 13
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 13
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 513
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 513
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 539
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 539
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 400
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 400
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 608
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 608
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 516
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 516
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 536
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 536
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 538
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 538
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 423
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 423
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 532
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 532
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 611
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 611
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 462
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 462
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 398
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 398
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 517
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 517
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 458
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 458
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 521
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 521
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 413
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 413
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 542
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 542
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 410
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 410
    col: 3
    score: 0.98
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 122
    col: 1
    score: 0.98
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 122
    col: 3
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 528
    col: 1
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 528
    col: 3
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 550
    col: 1
    score: 0.97
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 550
    col: 3
    score: 0.97
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 623
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 623
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 411
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 411
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 415
    col: 1
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 415
    col: 3
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 559
    col: 1
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 559
    col: 3
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 625
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 625
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 530
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 530
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 557
    col: 1
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 557
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 533
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 533
    col: 3
    score: 0.99
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 324
    col: 1
    score: 0.96
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 324
    col: 3
    score: 0.96
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 325
    col: 1
    score: 0.95
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 325
    col: 3
    score: 0.95
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 534
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 534
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 414
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 414
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 412
    col: 1
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 412
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 531
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 531
    col: 3
    score: 0.99
---
Heck yeah—here’s **`set!`** wired end-to-end (Lisp → AST → IR → JS) + the reverse compiler already emits it from `x = ...`.

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

## 2) Lisp front-end: recognize `(set! x expr)`

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
```

## 3) Lowering: turn `Set` into an assignment on the existing symbol

We keep IR simple: **reuse** the existing `bind` statement to assign to the *same* Sym. (Our JS emitter already outputs `dst = ...;` for `bind`, so this “just works”.)

Also: prevent `set!` on **externs** (imports destructured as `const`), since that would blow up at runtime.

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

// bindVal, binToPrim unchanged
```

## 4) JS emitter: no changes needed 🎉

Your `emitJS` already turns every `bind` into `dst = ...;`. Because we assign to the **same** Sym, `set!` becomes a normal JS assignment to the existing `let` variable.

(And `collectLocals` still declares each Sym once—duplicates are ignored via the Set.)

## 5) Reverse compiler already outputs `(set! ...)`

We already mapped:

```ts
// shared/js/prom-lib/compiler/lisp/js-ast2lisp.ts
case "AssignmentExpression": {
  if (n.left.type === "MemberExpression") {
    // -> (js/set! obj key val)
  }
  if (n.left.type === "Identifier") {
    return list([sym("set!"), sym(n.left.name), expr(n.right, opts)]);
  }
}
```

So **`x = y`** becomes **`(set! x y)`**.

## 6) Quick sanity check

```lisp
; test.lisp
(let ((x 1)
      (y 2))
  (set! x (+ x y))   ; x = 3
  (set! y 10)        ; y = 10
  (+ x y))           ; -> 13
```

```ts
import { runLisp } from "./compiler/lisp/driver";
console.log(runLisp(`(let ((x 1) (y 2)) (set! x (+ x y)) (set! y 10) (+ x y))`)); // 13
```

If you want `set!` for **fields** too (i.e. `(set! x.a 5)`), we can either macro-expand that to `(js/set! x "a" 5)` or add dotted lvalues to the reader—your call.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Interop and Source Maps](interop-and-source-maps.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [DSL](chunks/dsl.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [archetype-ecs](archetype-ecs.md)
- [template-based-compilation](template-based-compilation.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)

## Sources
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#L140) (line 140, col 1, score 0.89)
- [Interop and Source Maps — L319](interop-and-source-maps.md#L319) (line 319, col 1, score 0.98)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#L359) (line 359, col 1, score 0.96)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#L301) (line 301, col 1, score 0.94)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#L13) (line 13, col 1, score 0.86)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#L491) (line 491, col 1, score 0.86)
- [DSL — L11](chunks/dsl.md#L11) (line 11, col 1, score 1)
- [DSL — L11](chunks/dsl.md#L11) (line 11, col 3, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#L606) (line 606, col 1, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#L606) (line 606, col 3, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#L422) (line 422, col 1, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#L422) (line 422, col 3, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#L534) (line 534, col 1, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#L534) (line 534, col 3, score 1)
- [DSL — L13](chunks/dsl.md#L13) (line 13, col 1, score 1)
- [DSL — L13](chunks/dsl.md#L13) (line 13, col 3, score 1)
- [Interop and Source Maps — L513](interop-and-source-maps.md#L513) (line 513, col 1, score 1)
- [Interop and Source Maps — L513](interop-and-source-maps.md#L513) (line 513, col 3, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#L539) (line 539, col 1, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#L539) (line 539, col 3, score 1)
- [Lispy Macros with syntax-rules — L400](lispy-macros-with-syntax-rules.md#L400) (line 400, col 1, score 1)
- [Lispy Macros with syntax-rules — L400](lispy-macros-with-syntax-rules.md#L400) (line 400, col 3, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#L608) (line 608, col 1, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#L608) (line 608, col 3, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#L516) (line 516, col 1, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#L516) (line 516, col 3, score 1)
- [Language-Agnostic Mirror System — L536](language-agnostic-mirror-system.md#L536) (line 536, col 1, score 1)
- [Language-Agnostic Mirror System — L536](language-agnostic-mirror-system.md#L536) (line 536, col 3, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#L538) (line 538, col 1, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#L538) (line 538, col 3, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#L610) (line 610, col 1, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#L610) (line 610, col 3, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#L515) (line 515, col 1, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#L515) (line 515, col 3, score 1)
- [js-to-lisp-reverse-compiler — L423](js-to-lisp-reverse-compiler.md#L423) (line 423, col 1, score 1)
- [js-to-lisp-reverse-compiler — L423](js-to-lisp-reverse-compiler.md#L423) (line 423, col 3, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#L532) (line 532, col 1, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#L532) (line 532, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L179](cross-target-macro-system-in-sibilant.md#L179) (line 179, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L179](cross-target-macro-system-in-sibilant.md#L179) (line 179, col 3, score 1)
- [Dynamic Context Model for Web Components — L389](dynamic-context-model-for-web-components.md#L389) (line 389, col 1, score 1)
- [Dynamic Context Model for Web Components — L389](dynamic-context-model-for-web-components.md#L389) (line 389, col 3, score 1)
- [Interop and Source Maps — L522](interop-and-source-maps.md#L522) (line 522, col 1, score 1)
- [Interop and Source Maps — L522](interop-and-source-maps.md#L522) (line 522, col 3, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#L533) (line 533, col 1, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#L533) (line 533, col 3, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#L611) (line 611, col 1, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#L611) (line 611, col 3, score 1)
- [ecs-offload-workers — L462](ecs-offload-workers.md#L462) (line 462, col 1, score 1)
- [ecs-offload-workers — L462](ecs-offload-workers.md#L462) (line 462, col 3, score 1)
- [ecs-scheduler-and-prefabs — L398](ecs-scheduler-and-prefabs.md#L398) (line 398, col 1, score 1)
- [ecs-scheduler-and-prefabs — L398](ecs-scheduler-and-prefabs.md#L398) (line 398, col 3, score 1)
- [Interop and Source Maps — L517](interop-and-source-maps.md#L517) (line 517, col 1, score 1)
- [Interop and Source Maps — L517](interop-and-source-maps.md#L517) (line 517, col 3, score 1)
- [archetype-ecs — L458](archetype-ecs.md#L458) (line 458, col 1, score 1)
- [archetype-ecs — L458](archetype-ecs.md#L458) (line 458, col 3, score 1)
- [Interop and Source Maps — L521](interop-and-source-maps.md#L521) (line 521, col 1, score 1)
- [Interop and Source Maps — L521](interop-and-source-maps.md#L521) (line 521, col 3, score 1)
- [js-to-lisp-reverse-compiler — L413](js-to-lisp-reverse-compiler.md#L413) (line 413, col 1, score 1)
- [js-to-lisp-reverse-compiler — L413](js-to-lisp-reverse-compiler.md#L413) (line 413, col 3, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#L542) (line 542, col 1, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#L542) (line 542, col 3, score 1)
- [Lispy Macros with syntax-rules — L410](lispy-macros-with-syntax-rules.md#L410) (line 410, col 1, score 0.98)
- [Lispy Macros with syntax-rules — L410](lispy-macros-with-syntax-rules.md#L410) (line 410, col 3, score 0.98)
- [template-based-compilation — L122](template-based-compilation.md#L122) (line 122, col 1, score 0.98)
- [template-based-compilation — L122](template-based-compilation.md#L122) (line 122, col 3, score 0.98)
- [Interop and Source Maps — L528](interop-and-source-maps.md#L528) (line 528, col 1, score 0.98)
- [Interop and Source Maps — L528](interop-and-source-maps.md#L528) (line 528, col 3, score 0.98)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#L550) (line 550, col 1, score 0.97)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#L550) (line 550, col 3, score 0.97)
- [compiler-kit-foundations — L623](compiler-kit-foundations.md#L623) (line 623, col 1, score 1)
- [compiler-kit-foundations — L623](compiler-kit-foundations.md#L623) (line 623, col 3, score 1)
- [Lispy Macros with syntax-rules — L411](lispy-macros-with-syntax-rules.md#L411) (line 411, col 1, score 1)
- [Lispy Macros with syntax-rules — L411](lispy-macros-with-syntax-rules.md#L411) (line 411, col 3, score 1)
- [Lispy Macros with syntax-rules — L415](lispy-macros-with-syntax-rules.md#L415) (line 415, col 1, score 0.99)
- [Lispy Macros with syntax-rules — L415](lispy-macros-with-syntax-rules.md#L415) (line 415, col 3, score 0.99)
- [Lisp-Compiler-Integration — L559](lisp-compiler-integration.md#L559) (line 559, col 1, score 0.99)
- [Lisp-Compiler-Integration — L559](lisp-compiler-integration.md#L559) (line 559, col 3, score 0.99)
- [compiler-kit-foundations — L625](compiler-kit-foundations.md#L625) (line 625, col 1, score 1)
- [compiler-kit-foundations — L625](compiler-kit-foundations.md#L625) (line 625, col 3, score 1)
- [Interop and Source Maps — L530](interop-and-source-maps.md#L530) (line 530, col 1, score 1)
- [Interop and Source Maps — L530](interop-and-source-maps.md#L530) (line 530, col 3, score 1)
- [Lisp-Compiler-Integration — L557](lisp-compiler-integration.md#L557) (line 557, col 1, score 0.99)
- [Lisp-Compiler-Integration — L557](lisp-compiler-integration.md#L557) (line 557, col 3, score 0.99)
- [Interop and Source Maps — L533](interop-and-source-maps.md#L533) (line 533, col 1, score 0.99)
- [Interop and Source Maps — L533](interop-and-source-maps.md#L533) (line 533, col 3, score 0.99)
- [Promethean Agent Config DSL — L324](promethean-agent-config-dsl.md#L324) (line 324, col 1, score 0.96)
- [Promethean Agent Config DSL — L324](promethean-agent-config-dsl.md#L324) (line 324, col 3, score 0.96)
- [Promethean Agent Config DSL — L325](promethean-agent-config-dsl.md#L325) (line 325, col 1, score 0.95)
- [Promethean Agent Config DSL — L325](promethean-agent-config-dsl.md#L325) (line 325, col 3, score 0.95)
- [Interop and Source Maps — L534](interop-and-source-maps.md#L534) (line 534, col 1, score 1)
- [Interop and Source Maps — L534](interop-and-source-maps.md#L534) (line 534, col 3, score 1)
- [Lispy Macros with syntax-rules — L414](lispy-macros-with-syntax-rules.md#L414) (line 414, col 1, score 1)
- [Lispy Macros with syntax-rules — L414](lispy-macros-with-syntax-rules.md#L414) (line 414, col 3, score 1)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#L412) (line 412, col 1, score 0.99)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#L412) (line 412, col 3, score 0.99)
- [Interop and Source Maps — L531](interop-and-source-maps.md#L531) (line 531, col 1, score 0.99)
- [Interop and Source Maps — L531](interop-and-source-maps.md#L531) (line 531, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
