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
related_to_title:
  - set-assignment-in-lisp-ast
  - compiler-kit-foundations
  - Interop and Source Maps
  - Lisp-Compiler-Integration
  - template-based-compilation
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Language-Agnostic Mirror System
  - js-to-lisp-reverse-compiler
  - ecs-scheduler-and-prefabs
  - DSL
  - ecs-offload-workers
  - Cross-Target Macro System in Sibilant
  - aionian-circuit-math
  - Cross-Language Runtime Polymorphism
  - archetype-ecs
  - zero-copy-snapshots-and-workers
related_to_uuid:
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 58191024-d04a-4520-8aae-a18be7b94263
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
references:
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 291
    col: 1
    score: 0.88
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 58
    col: 1
    score: 0.94
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 359
    col: 1
    score: 0.94
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 319
    col: 1
    score: 0.93
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 440
    col: 1
    score: 0.92
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 421
    col: 1
    score: 0.9
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 491
    col: 1
    score: 0.92
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 470
    col: 1
    score: 0.89
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 529
    col: 1
    score: 0.9
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 529
    col: 3
    score: 0.9
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 514
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 514
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 411
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 411
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 535
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 535
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
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 515
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 515
    col: 3
    score: 1
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
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 155
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 155
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 609
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 609
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 203
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 203
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 168
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 168
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
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 527
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 527
    col: 3
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 374
    col: 1
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 374
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 526
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 526
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 534
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 534
    col: 3
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 624
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 624
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 529
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 529
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 558
    col: 1
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 558
    col: 3
    score: 0.99
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 427
    col: 1
    score: 0.99
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 427
    col: 3
    score: 0.99
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 159
    col: 1
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 159
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 528
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 528
    col: 3
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 157
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 157
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
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 623
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 623
    col: 3
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 158
    col: 1
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 158
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 555
    col: 1
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 555
    col: 3
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 559
    col: 1
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 559
    col: 3
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 531
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 531
    col: 3
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 162
    col: 1
    score: 0.99
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 162
    col: 3
    score: 0.99
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 523
    col: 1
    score: 0.98
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 523
    col: 3
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 551
    col: 1
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 551
    col: 3
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 553
    col: 1
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 553
    col: 3
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 621
    col: 1
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 621
    col: 3
    score: 0.99
---
Alright, **Part next**: we wire **Lispy macros up a notch** with `syntax-rules` (hygienic-ish), make the Lisp front-end nicer (`and`/`or`, *n*-ary `+ - * /`), and let you **seed externs** so host functions like `print` compile cleanly to JS imports.

Drop these in alongside your compiler stuff:

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

Hook it into your macro environment:

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
```

---

# 2) Friendlier Lisp core: `and`, `or`, var-arity `+ - * /`

### 2a) Macros for `and` / `or`

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

# 3) Externs (host imports) without “unbound” errors

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
  return { funs: [], main };
}
```

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
  const js = emitJS(ir, { iife:false, importNames, pretty });
  return { forms, expanded, ast, ir, js };
}
```

---

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
    ((-> x) x)
    ((-> x (f args ...) rest ...) (-> (f x args ...) rest ...))))

; You can add more: cond, let*, etc., using syntax-rules now.
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

const { js } = compileLispToJS(src, { pretty:true, importNames:["print"] });
console.log(js);
// run it:
(0, eval)(js)({ print: console.log });  // => 42
```

---

# 6) What’s next (pick a lane)

* **Hygiene**: add scope-sets to `Sym` and a resolver so macros can’t accidentally capture user vars.
* **Modules**: `(require "prelude.lisp")` with caching + macro phase separation (so required macros expand at compile time).
* **Pattern goodness**: a `match` macro (built on `syntax-rules` or `syntax-case`) with guards.
* **Interop**: `(js . ...)` macro for direct JS property/method calls safely.
* **Optimizations**: const folding & DCE over ANF IR before JS emission.
* **Source maps**: map Lisp spans → JS for friendly stack traces.

Tell me which slice you want next and I’ll shovel more code.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
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

## Sources
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#L291) (line 291, col 1, score 0.88)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#L58) (line 58, col 1, score 0.94)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#L359) (line 359, col 1, score 0.94)
- [Interop and Source Maps — L319](interop-and-source-maps.md#L319) (line 319, col 1, score 0.93)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#L440) (line 440, col 1, score 0.92)
- [Interop and Source Maps — L421](interop-and-source-maps.md#L421) (line 421, col 1, score 0.9)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#L491) (line 491, col 1, score 0.92)
- [Interop and Source Maps — L470](interop-and-source-maps.md#L470) (line 470, col 1, score 0.89)
- [Lisp-Compiler-Integration — L529](lisp-compiler-integration.md#L529) (line 529, col 1, score 0.9)
- [Lisp-Compiler-Integration — L529](lisp-compiler-integration.md#L529) (line 529, col 3, score 0.9)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#L607) (line 607, col 1, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#L607) (line 607, col 3, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#L514) (line 514, col 1, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#L514) (line 514, col 3, score 1)
- [js-to-lisp-reverse-compiler — L411](js-to-lisp-reverse-compiler.md#L411) (line 411, col 1, score 1)
- [js-to-lisp-reverse-compiler — L411](js-to-lisp-reverse-compiler.md#L411) (line 411, col 3, score 1)
- [Language-Agnostic Mirror System — L535](language-agnostic-mirror-system.md#L535) (line 535, col 1, score 1)
- [Language-Agnostic Mirror System — L535](language-agnostic-mirror-system.md#L535) (line 535, col 3, score 1)
- [DSL — L13](chunks/dsl.md#L13) (line 13, col 1, score 1)
- [DSL — L13](chunks/dsl.md#L13) (line 13, col 3, score 1)
- [Interop and Source Maps — L513](interop-and-source-maps.md#L513) (line 513, col 1, score 1)
- [Interop and Source Maps — L513](interop-and-source-maps.md#L513) (line 513, col 3, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#L539) (line 539, col 1, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#L539) (line 539, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#L515) (line 515, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#L515) (line 515, col 3, score 1)
- [DSL — L11](chunks/dsl.md#L11) (line 11, col 1, score 1)
- [DSL — L11](chunks/dsl.md#L11) (line 11, col 3, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#L606) (line 606, col 1, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#L606) (line 606, col 3, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#L422) (line 422, col 1, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#L422) (line 422, col 3, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#L534) (line 534, col 1, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#L534) (line 534, col 3, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#L610) (line 610, col 1, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#L610) (line 610, col 3, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#L515) (line 515, col 1, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#L515) (line 515, col 3, score 1)
- [js-to-lisp-reverse-compiler — L423](js-to-lisp-reverse-compiler.md#L423) (line 423, col 1, score 1)
- [js-to-lisp-reverse-compiler — L423](js-to-lisp-reverse-compiler.md#L423) (line 423, col 3, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#L532) (line 532, col 1, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#L532) (line 532, col 3, score 1)
- [aionian-circuit-math — L155](aionian-circuit-math.md#L155) (line 155, col 1, score 1)
- [aionian-circuit-math — L155](aionian-circuit-math.md#L155) (line 155, col 3, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#L609) (line 609, col 1, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#L609) (line 609, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#L203) (line 203, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#L203) (line 203, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L168](cross-target-macro-system-in-sibilant.md#L168) (line 168, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L168](cross-target-macro-system-in-sibilant.md#L168) (line 168, col 3, score 1)
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
- [Interop and Source Maps — L527](interop-and-source-maps.md#L527) (line 527, col 1, score 1)
- [Interop and Source Maps — L527](interop-and-source-maps.md#L527) (line 527, col 3, score 1)
- [zero-copy-snapshots-and-workers — L374](zero-copy-snapshots-and-workers.md#L374) (line 374, col 1, score 0.99)
- [zero-copy-snapshots-and-workers — L374](zero-copy-snapshots-and-workers.md#L374) (line 374, col 3, score 0.99)
- [Interop and Source Maps — L526](interop-and-source-maps.md#L526) (line 526, col 1, score 0.99)
- [Interop and Source Maps — L526](interop-and-source-maps.md#L526) (line 526, col 3, score 0.99)
- [Interop and Source Maps — L534](interop-and-source-maps.md#L534) (line 534, col 1, score 0.99)
- [Interop and Source Maps — L534](interop-and-source-maps.md#L534) (line 534, col 3, score 0.99)
- [compiler-kit-foundations — L624](compiler-kit-foundations.md#L624) (line 624, col 1, score 1)
- [compiler-kit-foundations — L624](compiler-kit-foundations.md#L624) (line 624, col 3, score 1)
- [Interop and Source Maps — L529](interop-and-source-maps.md#L529) (line 529, col 1, score 1)
- [Interop and Source Maps — L529](interop-and-source-maps.md#L529) (line 529, col 3, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#L558) (line 558, col 1, score 0.99)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#L558) (line 558, col 3, score 0.99)
- [js-to-lisp-reverse-compiler — L427](js-to-lisp-reverse-compiler.md#L427) (line 427, col 1, score 0.99)
- [js-to-lisp-reverse-compiler — L427](js-to-lisp-reverse-compiler.md#L427) (line 427, col 3, score 0.99)
- [set-assignment-in-lisp-ast — L159](set-assignment-in-lisp-ast.md#L159) (line 159, col 1, score 1)
- [set-assignment-in-lisp-ast — L159](set-assignment-in-lisp-ast.md#L159) (line 159, col 3, score 1)
- [Interop and Source Maps — L528](interop-and-source-maps.md#L528) (line 528, col 1, score 1)
- [Interop and Source Maps — L528](interop-and-source-maps.md#L528) (line 528, col 3, score 1)
- [set-assignment-in-lisp-ast — L157](set-assignment-in-lisp-ast.md#L157) (line 157, col 1, score 0.98)
- [set-assignment-in-lisp-ast — L157](set-assignment-in-lisp-ast.md#L157) (line 157, col 3, score 0.98)
- [template-based-compilation — L122](template-based-compilation.md#L122) (line 122, col 1, score 0.98)
- [template-based-compilation — L122](template-based-compilation.md#L122) (line 122, col 3, score 0.98)
- [compiler-kit-foundations — L623](compiler-kit-foundations.md#L623) (line 623, col 1, score 1)
- [compiler-kit-foundations — L623](compiler-kit-foundations.md#L623) (line 623, col 3, score 1)
- [set-assignment-in-lisp-ast — L158](set-assignment-in-lisp-ast.md#L158) (line 158, col 1, score 1)
- [set-assignment-in-lisp-ast — L158](set-assignment-in-lisp-ast.md#L158) (line 158, col 3, score 1)
- [Lisp-Compiler-Integration — L555](lisp-compiler-integration.md#L555) (line 555, col 1, score 0.98)
- [Lisp-Compiler-Integration — L555](lisp-compiler-integration.md#L555) (line 555, col 3, score 0.98)
- [Lisp-Compiler-Integration — L559](lisp-compiler-integration.md#L559) (line 559, col 1, score 0.98)
- [Lisp-Compiler-Integration — L559](lisp-compiler-integration.md#L559) (line 559, col 3, score 0.98)
- [Interop and Source Maps — L531](interop-and-source-maps.md#L531) (line 531, col 1, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#L531) (line 531, col 3, score 1)
- [set-assignment-in-lisp-ast — L162](set-assignment-in-lisp-ast.md#L162) (line 162, col 1, score 0.99)
- [set-assignment-in-lisp-ast — L162](set-assignment-in-lisp-ast.md#L162) (line 162, col 3, score 0.99)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L523](polyglot-s-expr-bridge-python-js-lisp-interop.md#L523) (line 523, col 1, score 0.98)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L523](polyglot-s-expr-bridge-python-js-lisp-interop.md#L523) (line 523, col 3, score 0.98)
- [Lisp-Compiler-Integration — L551](lisp-compiler-integration.md#L551) (line 551, col 1, score 0.98)
- [Lisp-Compiler-Integration — L551](lisp-compiler-integration.md#L551) (line 551, col 3, score 0.98)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#L553) (line 553, col 1, score 0.99)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#L553) (line 553, col 3, score 0.99)
- [compiler-kit-foundations — L621](compiler-kit-foundations.md#L621) (line 621, col 1, score 0.99)
- [compiler-kit-foundations — L621](compiler-kit-foundations.md#L621) (line 621, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
