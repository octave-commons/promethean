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
