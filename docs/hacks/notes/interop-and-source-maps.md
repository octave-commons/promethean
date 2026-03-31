---
```
uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
```
```
created_at: 2025.08.08.22.08.58.md
```
filename: Interop and Source Maps
```
description: >-
```
  Adds ergonomic Lisp-JS interop macros and a source map v3 builder for seamless
  JavaScript integration with Lisp code, supporting both Node and browser
  environments without dependencies.
tags:
  - lisp
  - js
  - interop
  - source-maps
  - compiler
  - emitter
  - debugging
```
related_to_title:
```
  - compiler-kit-foundations
  - set-assignment-in-lisp-ast
  - Lisp-Compiler-Integration
  - Lispy Macros with syntax-rules
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - universal-intention-code-fabric
  - DSL
  - Unique Info Dump Index
  - Language-Agnostic Mirror System
  - js-to-lisp-reverse-compiler
  - ecs-scheduler-and-prefabs
  - ecs-offload-workers
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - ts-to-lisp-transpiler
  - lisp-dsl-for-window-management
  - Window Management
  - Dynamic Context Model for Web Components
  - Cross-Target Macro System in Sibilant
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Local-Only-LLM-Workflow
  - Performance-Optimized-Polyglot-Bridge
  - zero-copy-snapshots-and-workers
  - template-based-compilation
```
related_to_uuid:
```
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 58191024-d04a-4520-8aae-a18be7b94263
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
references:
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 405
    col: 1
    score: 0.92
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 188
    col: 1
    score: 0.86
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 291
    col: 1
    score: 0.85
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 359
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 58
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 301
    col: 1
    score: 0.93
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 440
    col: 1
    score: 0.97
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 319
    col: 1
    score: 0.9
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 365
    col: 1
    score: 0.89
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 491
    col: 1
    score: 0.86
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 13
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 13
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
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 515
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 515
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
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
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 540
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 540
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
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 220
    col: 1
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 220
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
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 517
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 517
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
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 543
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 543
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 538
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 538
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 171
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 171
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 171
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 171
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 439
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 439
    col: 3
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 13
    col: 1
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 13
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 615
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 615
    col: 3
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 14
    col: 1
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 14
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 65
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 65
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
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
    line: 405
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 405
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
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 547
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 547
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 188
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 188
    col: 3
    score: 1
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 446
    col: 1
    score: 1
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 446
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 479
    col: 1
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 479
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 429
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 429
    col: 3
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 408
    col: 1
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 408
    col: 3
    score: 0.99
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 162
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 162
    col: 3
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 374
    col: 1
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 374
    col: 3
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 414
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 414
    col: 3
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 159
    col: 1
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 159
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 410
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 410
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 122
    col: 1
    score: 0.98
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 122
    col: 3
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 157
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 157
    col: 3
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 624
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 624
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 409
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 409
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
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 625
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 625
    col: 3
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 160
    col: 1
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 160
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
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 556
    col: 1
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 556
    col: 3
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 412
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 412
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 416
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 416
    col: 3
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 560
    col: 1
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 560
    col: 3
    score: 0.99
---
Note: Consolidated here → ../notes/dsl/interop-and-source-maps.md

Absolutely—let’s add **Interop** (ergonomic JS access) and real **Source Maps** that thread your Lisp spans all the way to generated JS. No deps, Node + browser safe.

I’ll give you:

* Lisp → JS **interop macros** `js/get`, `js/set!`, `js/call`, `js/new`, `js/global`
* An **IR pattern** and **JS emitter** special-cases that inline to clean JS `o[k]`, `o[k]=v`, `o[[...|k]]`, `new Ctor(...)`, `globalThis[name]`
* A tiny **source-map v3 builder** (base64 VLQ) and plumbing:

  * carry spans from Lisp → Expr → IR symbols
  * record mappings while emitting JS
  * return `{ code, map }` (optionally inline as a data URL)

---

# Interop

## 1) Lisp macros user-facing shape

```ts
// shared/js/prom-lib/compiler/lisp/interop.macros.ts
import { MacroEnv } from "./macros";
import { S, List, Sym, Str, isList, isSym, sym, str, list } from "./syntax";

export function installInteropMacros(M: MacroEnv) {
  // (js/get obj key)  => get(obj, key)
  M.define("js/get", (form) => {
    const [_t, obj, key] = (form as any).xs;
    return list([sym("get"), obj, asKeyLiteral(key)]);
  });

  // (js/set! obj key val) => set(obj, key, val)
  M.define("js/set!", (form) => {
    const [_t, obj, key, val] = (form as any).xs;
    return list([sym("set"), obj, asKeyLiteral(key), val]);
  });

  // (js/call obj key arg...) => call(obj, key, arg...)
  M.define("js/call", (form) => {
    const [_t, obj, key, ...args] = (form as any).xs;
    return list([sym("call"), obj, asKeyLiteral(key), ...args]);
  });

  // (js/new Ctor arg...) => new(Ctor, arg...)
  M.define("js/new", (form) => {
    const [_t, Ctor, ...args] = (form as any).xs;
    return list([sym("new"), Ctor, ...args]);
  });

  // (js/global "document") => g("document")
  M.define("js/global", (form) => {
    const [_t, name] = (form as any).xs;
    return list([sym("g"), asKeyLiteral(name)]);
  });
}

function asKeyLiteral(x: S): S {
  // Accept "prop" or 'prop or symbol foo → "foo"
  if (x.t === "str") return x;
  if (x.t === "sym") return str(x.name, x.span);
  return x; // allow computed
}
```

Wire them into the expander right after core macros:

```ts
// shared/js/prom-lib/compiler/lisp/expand.ts
import { installInteropMacros } from "./interop.macros";
// ...
export function macroexpandAll(forms:S[], user?: (m:MacroEnv)=>void): S[] {
  const M = new MacroEnv();
  installCoreMacros(M);
  installInteropMacros(M);   // <-- add this
  user?.(M);
  // ...
}
```

## 2) JS emitter inlines the interop

No runtime helpers; we pattern-match calls to `"get"`, `"set"`, … and emit plain JS.

```ts
// shared/js/prom-lib/compiler/jsgen.ts
import type { Module, Fun, Stmt, Rhs, Sym } from "./ir";

export interface EmitOptions {
  iife?: boolean;
  exportFunctionName?: string;
  importNames?: string[];
  pretty?: boolean;
  // NEW: source map/debug
  debug?: {
    symSpan?: Map<Sym, { line:number; col:number; start:number; end:number }>; // 1-based lines/cols
    sourceName?: string;
    sourceContent?: string;
    inlineMap?: boolean;
  };
}

export function emitJS(mod: Module, opts: EmitOptions = {}): string | { code:string, map:any } {
  const pretty = !!opts.pretty;
  const IND = (n: number) => pretty ? "  ".repeat(n) : "";
  const NL = pretty ? "\n" : "";
  const imports = opts.importNames ?? [];

  // --- source map builder (simple) ---
  const sm = new SourceMapBuilder(opts.debug?.sourceName ?? "input.lisp", opts.debug?.sourceContent ?? "");
  const withMap = !!opts.debug?.symSpan;

  let code = "";
  let line = 1, col = 0;
  const write = (s: string) => {
    code += s;
    // update line/col
    for (let i=0;i<s.length;i++) {
      if (s.charCodeAt(i) === 10) { line++; col = 0; }
      else col++;
    }
  };
  const mapNow = (sym?: Sym) => {
    if (!withMap || !sym) return;
    const sp = opts.debug!.symSpan!.get(sym);
    if (!sp) return;
    // JS generator is 1-based; source map wants 0-based
    sm.addMapping(line-1, col, sp.line-1, sp.col-1);
  };

  const emitFunBody = (body: Stmt[], depth = 1): void => {
    const localDecl = [...collectLocals(body)].filter(s => !imports.includes(s as any));
    if (localDecl.length) { write(`{IND(depth)}let {localDecl.join(", ")};{NL}`); }
    for (const s of body) {
      if (s.k === "bind") { write(IND(depth)); mapNow(s.s); write(emitBind(s.s, s.rhs) + NL); }
      else if (s.k === "if") {
        write(IND(depth) + "if ("); mapNow(s.cond); write(sym(s.cond) + ") {" + NL);
        emitFunBody(s.then, depth + 1);
        write(IND(depth) + "} else {" + NL);
        emitFunBody(s.else, depth + 1);
        write(IND(depth) + "}" + NL);
      } else if (s.k === "ret") {
        write(IND(depth) + "return "); mapNow(s.s); write(sym(s.s) + ";" + NL);
      }
    }
  };

  const emitBind = (dst: Sym, rhs: Rhs): string => {
    // values
    if (rhs.r === "val") {
      if (rhs.v.t === "lit") return `{sym(dst)} = {lit(rhs.v.v)};`;
      if (rhs.v.t === "var") return `{sym(dst)} = {sym(rhs.v.s)};`;
      if (rhs.v.t === "lambda") {
        const params = rhs.v.params.map(sym).join(", ");
        let bodyCode = "";
        const saveLC = [line, col]; // inner body will add mappings too
        const inner = (stmts: Stmt[]) => {
          const innerLocals = [...collectLocals(stmts)];
          bodyCode += `{IND(1)}{innerLocals.length ? "let " + innerLocals.join(", ") + ";" + NL : ""}`;
          for (const st of stmts) {
            if (st.k === "bind") { bodyCode += IND(1) + emitBind(st.s, st.rhs) + NL; }
            else if (st.k === "if") {
              bodyCode += IND(1) + "if (" + sym(st.cond) + ") {" + NL;
              inner(st.then);
              bodyCode += IND(1) + "} else {" + NL;
              inner(st.else);
              bodyCode += IND(1) + "}" + NL;
            } else if (st.k === "ret") {
              bodyCode += IND(1) + "return " + sym(st.s) + ";" + NL;
            }
          }
        };
        inner(rhs.v.body);
        return `{sym(dst)} = ({params}) => {{NL}{bodyCode}};`;
      }
    }

    // primitives
    if (rhs.r === "prim") {
      if (rhs.op === "not") return `{sym(dst)} = (!{sym(rhs.a)});`;
      if (rhs.b == null && rhs.op === "sub") return `{sym(dst)} = (0 - {sym(rhs.a)});`;
      return `{sym(dst)} = ({sym(rhs.a)} {op(rhs.op)} {sym(rhs.b!)});`;
    }

    // calls (interop inlining)
    if (rhs.r === "call") {
      const fnName = rhs.fn as unknown as string;  // raw symbol text
      const args = rhs.args.map(sym);
      if (fnName === "get")  return `{sym(dst)} = {args[0]}[{args[1]}];`;
      if (fnName === "set")  return `{sym(dst)} = ({args[0]}[{args[1]}] = {args[2]});`;
      if (fnName === "call") return `{sym(dst)} = {args[0]}[{args[1]}]({args.slice(2).join(", ")});`;
      if (fnName === "new")  return `{sym(dst)} = new {args[0]}({args.slice(1).join(", ")});`;
      if (fnName === "g")    return `{sym(dst)} = globalThis[{args[0]}];`;
      // normal call
      return `{sym(dst)} = {sym(rhs.fn)}({args.join(", ")});`;
    }
    throw new Error("unknown rhs");
  };

  // wrapper
  if (opts.exportFunctionName) {
    const fname = opts.exportFunctionName;
    write(`function {fname}(imports = {}) {{NL}`);
    if (imports.length) write(`const { {imports.join(", ")} } = imports;{NL}`);
    emitFunBody(mod.main.body, 1);
    write(`}{NL}export { {fname} };{NL}`);
  } else {
    write(`(function(imports){{NL}`);
    if (imports.length) write(`const { {imports.join(", ")} } = (imports||{});{NL}`);
    emitFunBody(mod.main.body, 1);
    write(`})`);
  }

  if (!withMap) return opts.iife ? (code + `({}){pretty ? ";\n" : ""}`) : code;

  const map = sm.toJSON();
  const out = opts.iife ? (code + `({}){pretty ? ";\n" : ""}`) : code;

  if (opts.debug?.inlineMap) {
    const b64 = Buffer.from(JSON.stringify(map), "utf8").toString("base64");
    return { code: out + `\n//# sourceMappingURL=data:application/json;base64,{b64}\n`, map };
  }
  return { code: out + `\n//# sourceMappingURL={(opts.debug?.sourceName || "input")}.js.map\n`, map };

  // helpers
  function op(p: string): string {
    switch (p) {
      case "add": return "+";
      case "sub": return "-";
      case "mul": return "*";
      case "div": return "/";
      case "mod": return "%";
      case "lt":  return "<";
      case "gt":  return ">";
      case "le":  return "<=";
      case "ge":  return ">=";
      case "eq":  return "===";
      case "ne":  return "!==";
      default: throw new Error(`op {p}`);
    }
  }
  function sym(s: Sym): string { return (s as unknown as string).replace(/[^A-Za-z0-9_]/g, "_"); }
  function lit(v: any): string {
    if (typeof v === "string") return JSON.stringify(v);
    if (v === null) return "null";
    return String(v);
  }
}

// --- tiny source map builder (base64 VLQ) ---
class SourceMapBuilder {
  private mappings: string[] = [""];
  private lastGenLine = 0;
  private lastGenCol = 0;
  private lastSrc = 0;
  private lastSrcLine = 0;
  private lastSrcCol = 0;
  constructor(private sourceName: string, private sourceContent: string) {}
  addMapping(genLine: number, genCol: number, srcLine: number, srcCol: number) {
    while (this.lastGenLine < genLine) {
      this.mappings.push("");
      this.lastGenLine++;
      this.lastGenCol = 0;
    }
    const seg = [
      this.vlq(genCol - this.lastGenCol), // generated column
      this.vlq(0 - this.lastSrc),         // source index delta (0 always)
      this.vlq(srcLine - this.lastSrcLine),
      this.vlq(srcCol - this.lastSrcCol),
    ].join("");
    this.mappings[this.mappings.length - 1] += (this.mappings[this.mappings.length - 1] ? "," : "") + seg;
    this.lastGenCol = genCol;
    this.lastSrc = 0;
    this.lastSrcLine = srcLine;
    this.lastSrcCol = srcCol;
  }
  toJSON() {
    return {
      version: 3,
      file: (this.sourceName || "out.js"),
      sources: [this.sourceName || "input.lisp"],
      sourcesContent: [this.sourceContent],
      names: [],
      mappings: this.mappings.join(";"),
    };
  }
  private vlq(value: number): string {
    // sign + zigzag + base64 VLQ
    let v = (value < 0) ? ((-value) << 1) + 1 : (value << 1);
    let out = "";
    do {
      let digit = v & 31; // 5 bits
      v >>>= 5;
      if (v > 0) digit |= 32; // continuation
      out += b64(digit);
    } while (v > 0);
    return out;
  }
}
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64(n: number) { return B64[n] ?? "?"; }
function collectLocals(stmts: Stmt[], into = new Set<string>()): Set<string> {
  for (const s of stmts) {
    if (s.k === "bind") into.add(s.s as unknown as string);
    if (s.k === "if") { collectLocals(s.then, into); collectLocals(s.else, into); }
  }
  return into;
}
```

---

# Source maps end-to-end

## 3) Lowerer records symbol ↔ source span

We add a debug map so the emitter can map each **bound** symbol to the **Lisp span** of its originating expression.

```ts
// shared/js/prom-lib/compiler/lower.ts
import type { Expr } from "./ast";
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lowerWithExterns(ast: Expr, externs: string[] = []): Module & { debug: { symSpan: Map<Sym, any> } } {
  const env: Map<string, Sym> = new Map();
  for (const name of externs) env.set(name, name as unknown as Sym);

  const symSpan = new Map<Sym, any>();
  const out: Stmt[] = [];
  const result = lowerExpr(ast, env, out, symSpan);
  out.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: out };
  return { funs: [], main, debug: { symSpan } };
}

function lowerExpr(e: Expr, env: Map<string, Sym>, out: Stmt[], dbg: Map<Sym, any>): Sym {
  switch (e.kind) {
    case "Num": return bindVal(out, { t:"lit", v: e.value }, e, dbg);
    case "Str": return bindVal(out, { t:"lit", v: e.value }, e, dbg);
    case "Bool": return bindVal(out, { t:"lit", v: e.value }, e, dbg);
    case "Null": return bindVal(out, { t:"lit", v: null }, e, dbg);
    case "Var": {
      const s = env.get(e.name.text);
      if (!s) throw new Error(`unbound {e.name.text}`);
      return s;
    }
    case "Let": {
      const v = lowerExpr(e.value, env, out, dbg);
      const s = gensym(e.name.text);
      out.push({ k:"bind", s, rhs: { r:"val", v: { t:"var", s: v } } });
      dbg.set(s, e.value.span);
      const child = new Map(env); child.set(e.name.text, s);
      return lowerExpr(e.body, child, out, dbg);
    }
    case "If": {
      const cond = lowerExpr(e.cond, env, out, dbg);
      const thenS: Stmt[] = []; const tRes = lowerExpr(e.then, new Map(env), thenS, dbg);
      const elS: Stmt[] = [];   const eRes = lowerExpr(e.else, new Map(env), elS, dbg);
      const r = gensym("phi");
      thenS.push({ k:"bind", s: r, rhs: { r:"val", v: { t:"var", s: tRes } }});
      elS.push({ k:"bind", s: r, rhs: { r:"val", v: { t:"var", s: eRes } }});
      out.push({ k:"if", cond, then: thenS, else: elS });
      dbg.set(r, e.span);
      return r;
    }
    case "Fun": {
      const params: Sym[] = e.params.map(p => gensym(p.text));
      const body: Stmt[] = [];
      const child = new Map(env); e.params.forEach((p,i)=> child.set(p.text, params[i]));
      const ret = lowerExpr(e.body, child, body, dbg);
      body.push({ k:"ret", s: ret });
      const s = gensym("lam");
      out.push({ k:"bind", s, rhs: { r:"val", v: { t:"lambda", params, body } } });
      dbg.set(s, e.span);
      return s;
    }
    case "Call": {
      const fn = lowerExpr(e.callee, env, out, dbg);
      const args = e.args.map(a => lowerExpr(a, env, out, dbg));
      const s = gensym("call");
      out.push({ k:"bind", s, rhs: { r:"call", fn, args } });
      dbg.set(s, e.span);
      return s;
    }
    case "Bin": {
      const a = lowerExpr(e.left, env, out, dbg);
      const b = lowerExpr(e.right, env, out, dbg);
      const op = binToPrim(e.op);
      const s = gensym("bin");
      out.push({ k:"bind", s, rhs: { r:"prim", op, a, b } });
      dbg.set(s, e.span);
      return s;
    }
    case "Un": {
      const a = lowerExpr(e.expr, env, out, dbg);
      const op = e.op === "!" ? "not" : (e.op === "-" ? "sub" : "add");
      const s = gensym("un");
      out.push({ k:"bind", s, rhs: { r:"prim", op: op as any, a } });
      dbg.set(s, e.span);
      return s;
    }
    case "Block": {
      let last: Sym = gensym("unit");
      for (const x of e.exprs) last = lowerExpr(x, env, out, dbg);
      dbg.set(last, e.span);
      return last;
    }
  }
}

function bindVal(out: Stmt[], v: Val, e: Expr, dbg: Map<Sym, any>): Sym {
  const s = gensym("v"); out.push({ k:"bind", s, rhs: { r:"val", v } }); dbg.set(s, e.span); return s;
}
function binToPrim(op: string) { /* same as before */ }
```

---

## 4) Lisp driver returns `{ code, map }`

```ts
// shared/js/prom-lib/compiler/lisp/driver.ts
import { read } from "./reader";
import { macroexpandAll } from "./expand";
import { toExpr } from "./to-expr";
import { lowerWithExterns } from "../lower";
import { emitJS } from "../jsgen";

export function compileLispToJS(src: string, { pretty=false, importNames=[] as string[], inlineMap=false, sourceName="input.lisp" } = {}) {
  const forms = read(src);
  const expanded = macroexpandAll(forms);
  const program = expanded.length===1 ? expanded[0] : { t:"list", xs:[{t:"sym",name:"begin"}, ...expanded] } as any;
  const ast = toExpr(program as any);
  const irm = lowerWithExterns(ast, [...importNames, "get", "set", "call", "new", "g"]);
  const out = emitJS(irm, {
    pretty,
    importNames,
    debug: {
      symSpan: irm.debug.symSpan,
      sourceName,
      sourceContent: src,
      inlineMap
    }
  });
  if (typeof out === "string") return { code: out, map: null };
  return out; // { code, map }
}

export function runLisp(src: string, imports: Record<string, any> = {}) {
  const { code } = compileLispToJS(src, { inlineMap: true });
  const fn = (0, eval)(typeof code === "string" ? code : code.code);
  return fn(imports);
}
```

---

# How you use it

```lisp
; demo.lisp
(let ((doc (js/global "document"))
      (div (js/new (js/get (js/global "Image")))))
  (js/set! div "alt" "hello")
  (js/set! div "width" 320)
  (js/set! div "height" 200)
  (js/call (js/get doc "body") "appendChild" div))
```

```ts
import { compileLispToJS } from "./compiler/lisp/driver";
const src = await (await fetch("/demo.lisp")).text();
const { code, map } = compileLispToJS(src, { pretty:true, sourceName:"demo.lisp" });

// Browser: attach map file (or inlineMap:true). Node: write .js and .js.map for debugging.
console.log(code);
console.log(map);
```

Generated JS (clean, no runtime helpers):

```js
(function(imports){
  let v_jtkf1t, v_2k1m3f, v_1n3sdf, v_kk92ls, v_f33f2d;
  v_jtkf1t = globalThis["document"];
  v_2k1m3f = new Image();
  (v_2k1m3f["alt"] = "hello");
  (v_2k1m3f["width"] = 320);
  (v_2k1m3f["height"] = 200);
  v_1n3sdf = v_jtkf1t["body"];
  v_kk92ls = v_1n3sdf["appendChild"](v_2k1m3f);
  return v_kk92ls;
})
//# sourceMappingURL=demo.lisp.js.map
```

…and the `.map` points right back to your Lisp source spans for stepping and stack traces.

---

# Notes / next knobs

* **Property shorthand:** if you want `.-prop obj` or `(. obj prop)`, we can add small syntax sugar macros that expand to `js/get`.
* **Optional chaining:** add `get?` / `call?` in JS emitter → `o?.[k]` and `o?.[k]?.(...)`.
* **Precise mappings:** we currently map per-**binding** and **condition** sites (coarse but useful). If you want per-token fidelity, we can propagate spans into IR **Rhs** and mark before each operator/operand emission.
* **Module loader:** `(require "prelude.lisp")` that injects sourceName into maps and expands macros at compile time.
* **Type-safe interop:** a tiny `zod`-style checker at macro-expansion time (optional).

Want me to add **optional chaining**, **set?**, and a few more **ergonomic macros** (`(. obj :prop)`, `(.? obj :prop)`, `(new! Ctor ...)`) next, or go deeper on **mapping fidelity**?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [docs/unique/compiler-kit-foundations|compiler-kit-foundations]
- [set-assignment-in-lisp-ast]
- [lisp-compiler-integration]
- [lispy-macros-with-syntax-rules|Lispy Macros with syntax-rules]
- [polyglot-s-expr-bridge-python-js-lisp-interop|Polyglot S-expr Bridge: Python-JS-Lisp Interop]
- [universal-intention-code-fabric]
- [DSL]chunks/dsl.md
- [unique-info-dump-index|Unique Info Dump Index]
- [language-agnostic-mirror-system|Language-Agnostic Mirror System]
- [js-to-lisp-reverse-compiler]
- [ecs-scheduler-and-prefabs]
- [docs/unique/ecs-offload-workers|ecs-offload-workers]
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [docs/unique/archetype-ecs|archetype-ecs]
- [Diagrams]chunks/diagrams.md
- [ts-to-lisp-transpiler]
- lisp-dsl-for-window-management$lisp-dsl-for-window-management.md
- [Window Management]chunks/window-management.md
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]
- [ollama-llm-provider-for-pseudo-code-transpiler]
- [local-only-llm-workflow]
- [performance-optimized-polyglot-bridge]
- [docs/unique/zero-copy-snapshots-and-workers|zero-copy-snapshots-and-workers]
- [docs/unique/template-based-compilation|template-based-compilation]

## Sources
- [polyglot-s-expr-bridge-python-js-lisp-interop#L405|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L405] (line 405, col 1, score 0.92)
- [lisp-compiler-integration#L188|Lisp-Compiler-Integration — L188] (line 188, col 1, score 0.86)
- [lisp-compiler-integration#L291|Lisp-Compiler-Integration — L291] (line 291, col 1, score 0.85)
- [docs/unique/compiler-kit-foundations#L359|compiler-kit-foundations — L359] (line 359, col 1, score 0.98)
- [set-assignment-in-lisp-ast#L58|set-assignment-in-lisp-ast — L58] (line 58, col 1, score 0.98)
- [lispy-macros-with-syntax-rules#L301|Lispy Macros with syntax-rules — L301] (line 301, col 1, score 0.93)
- [lisp-compiler-integration#L440|Lisp-Compiler-Integration — L440] (line 440, col 1, score 0.97)
- [lispy-macros-with-syntax-rules#L319|Lispy Macros with syntax-rules — L319] (line 319, col 1, score 0.9)
- [lispy-macros-with-syntax-rules#L365|Lispy Macros with syntax-rules — L365] (line 365, col 1, score 0.89)
- [lisp-compiler-integration#L491|Lisp-Compiler-Integration — L491] (line 491, col 1, score 0.86)
- [DSL — L13]chunks/dsl.md#L13 (line 13, col 1, score 1)
- [DSL — L13]chunks/dsl.md#L13 (line 13, col 3, score 1)
- [lisp-compiler-integration#L539|Lisp-Compiler-Integration — L539] (line 539, col 1, score 1)
- [lisp-compiler-integration#L539|Lisp-Compiler-Integration — L539] (line 539, col 3, score 1)
- [lispy-macros-with-syntax-rules#L400|Lispy Macros with syntax-rules — L400] (line 400, col 1, score 1)
- [lispy-macros-with-syntax-rules#L400|Lispy Macros with syntax-rules — L400] (line 400, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L515|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515] (line 515, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L515|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515] (line 515, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L607|compiler-kit-foundations — L607] (line 607, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L607|compiler-kit-foundations — L607] (line 607, col 3, score 1)
- [js-to-lisp-reverse-compiler#L411|js-to-lisp-reverse-compiler — L411] (line 411, col 1, score 1)
- [js-to-lisp-reverse-compiler#L411|js-to-lisp-reverse-compiler — L411] (line 411, col 3, score 1)
- [language-agnostic-mirror-system#L535|Language-Agnostic Mirror System — L535] (line 535, col 1, score 1)
- [language-agnostic-mirror-system#L535|Language-Agnostic Mirror System — L535] (line 535, col 3, score 1)
- [lisp-compiler-integration#L540|Lisp-Compiler-Integration — L540] (line 540, col 1, score 1)
- [lisp-compiler-integration#L540|Lisp-Compiler-Integration — L540] (line 540, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610] (line 610, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610] (line 610, col 3, score 1)
- [js-to-lisp-reverse-compiler#L423|js-to-lisp-reverse-compiler — L423] (line 423, col 1, score 1)
- [js-to-lisp-reverse-compiler#L423|js-to-lisp-reverse-compiler — L423] (line 423, col 3, score 1)
- [language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532] (line 532, col 1, score 1)
- [language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532] (line 532, col 3, score 1)
- lisp-dsl-for-window-management — L220$lisp-dsl-for-window-management.md#L220 (line 220, col 1, score 1)
- lisp-dsl-for-window-management — L220$lisp-dsl-for-window-management.md#L220 (line 220, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L608|compiler-kit-foundations — L608] (line 608, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L608|compiler-kit-foundations — L608] (line 608, col 3, score 1)
- [language-agnostic-mirror-system#L536|Language-Agnostic Mirror System — L536] (line 536, col 1, score 1)
- [language-agnostic-mirror-system#L536|Language-Agnostic Mirror System — L536] (line 536, col 3, score 1)
- [lisp-compiler-integration#L538|Lisp-Compiler-Integration — L538] (line 538, col 1, score 1)
- [lisp-compiler-integration#L538|Lisp-Compiler-Integration — L538] (line 538, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L517|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517] (line 517, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L517|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517] (line 517, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L611|compiler-kit-foundations — L611] (line 611, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L611|compiler-kit-foundations — L611] (line 611, col 3, score 1)
- [docs/unique/ecs-offload-workers#L462|ecs-offload-workers — L462] (line 462, col 1, score 1)
- [docs/unique/ecs-offload-workers#L462|ecs-offload-workers — L462] (line 462, col 3, score 1)
- [ecs-scheduler-and-prefabs#L398|ecs-scheduler-and-prefabs — L398] (line 398, col 1, score 1)
- [ecs-scheduler-and-prefabs#L398|ecs-scheduler-and-prefabs — L398] (line 398, col 3, score 1)
- [lisp-compiler-integration#L543|Lisp-Compiler-Integration — L543] (line 543, col 1, score 1)
- [lisp-compiler-integration#L543|Lisp-Compiler-Integration — L543] (line 543, col 3, score 1)
- [language-agnostic-mirror-system#L538|Language-Agnostic Mirror System — L538] (line 538, col 1, score 1)
- [language-agnostic-mirror-system#L538|Language-Agnostic Mirror System — L538] (line 538, col 3, score 1)
- [local-only-llm-workflow#L171|Local-Only-LLM-Workflow — L171] (line 171, col 1, score 1)
- [local-only-llm-workflow#L171|Local-Only-LLM-Workflow — L171] (line 171, col 3, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L171|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171] (line 171, col 1, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L171|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171] (line 171, col 3, score 1)
- [performance-optimized-polyglot-bridge#L439|Performance-Optimized-Polyglot-Bridge — L439] (line 439, col 1, score 1)
- [performance-optimized-polyglot-bridge#L439|Performance-Optimized-Polyglot-Bridge — L439] (line 439, col 3, score 1)
- [Window Management — L13]chunks/window-management.md#L13 (line 13, col 1, score 1)
- [Window Management — L13]chunks/window-management.md#L13 (line 13, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L615|compiler-kit-foundations — L615] (line 615, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L615|compiler-kit-foundations — L615] (line 615, col 3, score 1)
- [ts-to-lisp-transpiler#L14|ts-to-lisp-transpiler — L14] (line 14, col 1, score 1)
- [ts-to-lisp-transpiler#L14|ts-to-lisp-transpiler — L14] (line 14, col 3, score 1)
- [unique-info-dump-index#L65|Unique Info Dump Index — L65] (line 65, col 1, score 1)
- [unique-info-dump-index#L65|Unique Info Dump Index — L65] (line 65, col 3, score 1)
- [docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158] (line 158, col 1, score 1)
- [docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158] (line 158, col 3, score 1)
- [docs/unique/archetype-ecs#L457|archetype-ecs — L457] (line 457, col 1, score 1)
- [docs/unique/archetype-ecs#L457|archetype-ecs — L457] (line 457, col 3, score 1)
- [Diagrams — L9]chunks/diagrams.md#L9 (line 9, col 1, score 1)
- [Diagrams — L9]chunks/diagrams.md#L9 (line 9, col 3, score 1)
- [DSL — L10]chunks/dsl.md#L10 (line 10, col 1, score 1)
- [DSL — L10]chunks/dsl.md#L10 (line 10, col 3, score 1)
- [docs/unique/archetype-ecs#L458|archetype-ecs — L458] (line 458, col 1, score 1)
- [docs/unique/archetype-ecs#L458|archetype-ecs — L458] (line 458, col 3, score 1)
- [js-to-lisp-reverse-compiler#L413|js-to-lisp-reverse-compiler — L413] (line 413, col 1, score 1)
- [js-to-lisp-reverse-compiler#L413|js-to-lisp-reverse-compiler — L413] (line 413, col 3, score 1)
- [lisp-compiler-integration#L542|Lisp-Compiler-Integration — L542] (line 542, col 1, score 1)
- [lisp-compiler-integration#L542|Lisp-Compiler-Integration — L542] (line 542, col 3, score 1)
- [lispy-macros-with-syntax-rules#L405|Lispy Macros with syntax-rules — L405] (line 405, col 1, score 1)
- [lispy-macros-with-syntax-rules#L405|Lispy Macros with syntax-rules — L405] (line 405, col 3, score 1)
- [cross-target-macro-system-in-sibilant#L179|Cross-Target Macro System in Sibilant — L179] (line 179, col 1, score 1)
- [cross-target-macro-system-in-sibilant#L179|Cross-Target Macro System in Sibilant — L179] (line 179, col 3, score 1)
- [dynamic-context-model-for-web-components#L389|Dynamic Context Model for Web Components — L389] (line 389, col 1, score 1)
- [dynamic-context-model-for-web-components#L389|Dynamic Context Model for Web Components — L389] (line 389, col 3, score 1)
- [language-agnostic-mirror-system#L533|Language-Agnostic Mirror System — L533] (line 533, col 1, score 1)
- [language-agnostic-mirror-system#L533|Language-Agnostic Mirror System — L533] (line 533, col 3, score 1)
- [lisp-compiler-integration#L547|Lisp-Compiler-Integration — L547] (line 547, col 1, score 1)
- [lisp-compiler-integration#L547|Lisp-Compiler-Integration — L547] (line 547, col 3, score 1)
- [local-only-llm-workflow#L188|Local-Only-LLM-Workflow — L188] (line 188, col 1, score 1)
- [local-only-llm-workflow#L188|Local-Only-LLM-Workflow — L188] (line 188, col 3, score 1)
- [universal-intention-code-fabric#L446|universal-intention-code-fabric — L446] (line 446, col 1, score 1)
- [universal-intention-code-fabric#L446|universal-intention-code-fabric — L446] (line 446, col 3, score 1)
- [docs/unique/ecs-offload-workers#L479|ecs-offload-workers — L479] (line 479, col 1, score 0.99)
- [docs/unique/ecs-offload-workers#L479|ecs-offload-workers — L479] (line 479, col 3, score 0.99)
- [ecs-scheduler-and-prefabs#L429|ecs-scheduler-and-prefabs — L429] (line 429, col 1, score 0.99)
- [ecs-scheduler-and-prefabs#L429|ecs-scheduler-and-prefabs — L429] (line 429, col 3, score 0.99)
- [lispy-macros-with-syntax-rules#L408|Lispy Macros with syntax-rules — L408] (line 408, col 1, score 0.99)
- [lispy-macros-with-syntax-rules#L408|Lispy Macros with syntax-rules — L408] (line 408, col 3, score 0.99)
- [set-assignment-in-lisp-ast#L162|set-assignment-in-lisp-ast — L162] (line 162, col 1, score 0.98)
- [set-assignment-in-lisp-ast#L162|set-assignment-in-lisp-ast — L162] (line 162, col 3, score 0.98)
- [docs/unique/zero-copy-snapshots-and-workers#L374|zero-copy-snapshots-and-workers — L374] (line 374, col 1, score 0.98)
- [docs/unique/zero-copy-snapshots-and-workers#L374|zero-copy-snapshots-and-workers — L374] (line 374, col 3, score 0.98)
- [lispy-macros-with-syntax-rules#L414|Lispy Macros with syntax-rules — L414] (line 414, col 1, score 0.98)
- [lispy-macros-with-syntax-rules#L414|Lispy Macros with syntax-rules — L414] (line 414, col 3, score 0.98)
- [set-assignment-in-lisp-ast#L159|set-assignment-in-lisp-ast — L159] (line 159, col 1, score 1)
- [set-assignment-in-lisp-ast#L159|set-assignment-in-lisp-ast — L159] (line 159, col 3, score 1)
- [lispy-macros-with-syntax-rules#L410|Lispy Macros with syntax-rules — L410] (line 410, col 1, score 1)
- [lispy-macros-with-syntax-rules#L410|Lispy Macros with syntax-rules — L410] (line 410, col 3, score 1)
- [docs/unique/template-based-compilation#L122|template-based-compilation — L122] (line 122, col 1, score 0.98)
- [docs/unique/template-based-compilation#L122|template-based-compilation — L122] (line 122, col 3, score 0.98)
- [set-assignment-in-lisp-ast#L157|set-assignment-in-lisp-ast — L157] (line 157, col 1, score 0.98)
- [set-assignment-in-lisp-ast#L157|set-assignment-in-lisp-ast — L157] (line 157, col 3, score 0.98)
- [docs/unique/compiler-kit-foundations#L624|compiler-kit-foundations — L624] (line 624, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L624|compiler-kit-foundations — L624] (line 624, col 3, score 1)
- [lispy-macros-with-syntax-rules#L409|Lispy Macros with syntax-rules — L409] (line 409, col 1, score 1)
- [lispy-macros-with-syntax-rules#L409|Lispy Macros with syntax-rules — L409] (line 409, col 3, score 1)
- [lisp-compiler-integration#L558|Lisp-Compiler-Integration — L558] (line 558, col 1, score 0.99)
- [lisp-compiler-integration#L558|Lisp-Compiler-Integration — L558] (line 558, col 3, score 0.99)
- [js-to-lisp-reverse-compiler#L427|js-to-lisp-reverse-compiler — L427] (line 427, col 1, score 0.99)
- [js-to-lisp-reverse-compiler#L427|js-to-lisp-reverse-compiler — L427] (line 427, col 3, score 0.99)
- [docs/unique/compiler-kit-foundations#L625|compiler-kit-foundations — L625] (line 625, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L625|compiler-kit-foundations — L625] (line 625, col 3, score 1)
- [set-assignment-in-lisp-ast#L160|set-assignment-in-lisp-ast — L160] (line 160, col 1, score 1)
- [set-assignment-in-lisp-ast#L160|set-assignment-in-lisp-ast — L160] (line 160, col 3, score 1)
- [lisp-compiler-integration#L557|Lisp-Compiler-Integration — L557] (line 557, col 1, score 0.99)
- [lisp-compiler-integration#L557|Lisp-Compiler-Integration — L557] (line 557, col 3, score 0.99)
- [lisp-compiler-integration#L556|Lisp-Compiler-Integration — L556] (line 556, col 1, score 0.99)
- [lisp-compiler-integration#L556|Lisp-Compiler-Integration — L556] (line 556, col 3, score 0.99)
- [lispy-macros-with-syntax-rules#L412|Lispy Macros with syntax-rules — L412] (line 412, col 1, score 1)
- [lispy-macros-with-syntax-rules#L412|Lispy Macros with syntax-rules — L412] (line 412, col 3, score 1)
- [lispy-macros-with-syntax-rules#L416|Lispy Macros with syntax-rules — L416] (line 416, col 1, score 0.98)
- [lispy-macros-with-syntax-rules#L416|Lispy Macros with syntax-rules — L416] (line 416, col 3, score 0.98)
- [lisp-compiler-integration#L560|Lisp-Compiler-Integration — L560] (line 560, col 1, score 0.99)
- [lisp-compiler-integration#L560|Lisp-Compiler-Integration — L560] (line 560, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
