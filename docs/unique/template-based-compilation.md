---
uuid: 688ad325-4243-4304-bccc-1a1d8745de08
created_at: template-based-compilation.md
filename: template-based-compilation
title: template-based-compilation
description: >-
  Sibilant's template-based compilation allows writing macros that directly
  generate code as strings, bypassing traditional AST interpretation. This
  approach enables custom code generation without host language constraints,
  enabling seamless cross-language compilation and macro-driven code weaving.
  The system demonstrates how Lisp can be used to create domain-specific
  languages and compile to multiple target languages with minimal overhead.
tags:
  - sibilant
  - template-compilation
  - metaprogramming
  - codegen
  - lisp
  - macros
  - cross-language
  - string-templating
  - async-await
  - syntax-extension
  - transpiler
  - domain-specific-languages
related_to_uuid:
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - f9e200b4-742d-4786-ae2c-017996d53caf
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 18138627-a348-4fbb-b447-410dfb400564
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
related_to_title:
  - Chroma Toolkit Consolidation Plan
  - Diagrams
  - DSL
  - JavaScript
  - Math Fundamentals
  - Operations
  - Services
  - Shared
  - level-cache
  - Promethean Chat Activity Report
  - eidolon-field-math-foundations
  - The Jar of Echoes
  - Canonical Org-Babel Matplotlib Animation Template
  - windows-tiling-with-autohotkey
  - Promethean Dev Workflow Update
  - Dynamic Context Model for Web Components
  - graph-ds
  - Factorio AI with External Agents
  - Functional Refactor of TypeScript Document Processing
  - eidolon-node-lifecycle
  - field-dynamics-math-blocks
  - field-interaction-equations
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
references:
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1002
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 522
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 469
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 508
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 454
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 181
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 440
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 370
    col: 0
    score: 1
  - uuid: f9e200b4-742d-4786-ae2c-017996d53caf
    line: 1
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1157
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3097
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2827
    col: 0
    score: 0.94
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2418
    col: 0
    score: 0.93
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2761
    col: 0
    score: 0.93
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1359
    col: 0
    score: 0.93
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1643
    col: 0
    score: 0.93
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1574
    col: 0
    score: 0.93
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 471
    col: 0
    score: 0.93
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 235
    col: 0
    score: 0.93
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 117
    col: 0
    score: 0.93
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 260
    col: 0
    score: 0.93
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 234
    col: 0
    score: 0.93
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 245
    col: 0
    score: 0.93
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 208
    col: 0
    score: 0.93
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 235
    col: 0
    score: 0.93
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 180
    col: 0
    score: 0.93
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 225
    col: 0
    score: 0.93
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 478
    col: 0
    score: 0.93
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 128
    col: 0
    score: 0.92
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 440
    col: 0
    score: 0.89
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 0.89
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.89
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 207
    col: 0
    score: 0.88
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 184
    col: 0
    score: 0.88
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 443
    col: 0
    score: 0.88
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 271
    col: 0
    score: 0.88
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 165
    col: 0
    score: 0.88
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 231
    col: 0
    score: 0.88
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 243
    col: 0
    score: 0.88
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 199
    col: 0
    score: 0.88
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 225
    col: 0
    score: 0.88
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 325
    col: 0
    score: 0.88
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 465
    col: 0
    score: 0.88
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 242
    col: 0
    score: 0.88
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 142
    col: 0
    score: 0.88
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 0.87
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.87
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 358
    col: 0
    score: 0.87
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 0.87
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.87
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 524
    col: 0
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1810
    col: 0
    score: 0.87
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4929
    col: 0
    score: 0.87
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 1905
    col: 0
    score: 0.87
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 1981
    col: 0
    score: 0.87
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 1614
    col: 0
    score: 0.87
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1599
    col: 0
    score: 0.87
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 1799
    col: 0
    score: 0.87
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1606
    col: 0
    score: 0.87
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1598
    col: 0
    score: 0.87
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 10088
    col: 0
    score: 0.87
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 5613
    col: 0
    score: 0.87
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.86
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.86
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.86
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.86
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 0.86
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.86
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.86
  - uuid: b51e19b4-1326-4311-9798-33e972bf626c
    line: 169
    col: 0
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 35
    col: 0
    score: 0.85
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 159
    col: 0
    score: 0.85
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 144
    col: 0
    score: 0.85
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 33
    col: 0
    score: 0.85
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.85
---
Note: Consolidated here → ../notes/dsl/template-based-compilation.md ^ref-f8877e5e-1-0

**YES. That's the good shit.** ^ref-f8877e5e-3-0

That right there is **template-as-compilation**, raw and powerful. You're not building ASTs that are interpreted — you're literally **composing code as strings**, with Lisp macros giving you the syntax abstraction **and** codegen at the same time. ^ref-f8877e5e-5-0

You’re not stuck with AST rules — you’re writing a **custom compiler** for every macro. ^ref-f8877e5e-7-0

---

## 🧠 Why This Is a Game Changer

In Common Lisp or Hy, macros return **quoted code** to be executed in a fixed runtime. ^ref-f8877e5e-13-0

But in Sibilant, macros return: ^ref-f8877e5e-15-0

* Raw strings ^ref-f8877e5e-17-0
* Lists of strings ^ref-f8877e5e-18-0
* Nested arrays that **flatten into formatted code** ^ref-f8877e5e-19-0

Which means: ^ref-f8877e5e-21-0

* You don’t need to wait for someone to add a feature to the host language
* You don’t even need to *target* the host language
* You can use macros as **code weaving machines** ^ref-f8877e5e-25-0

You’re not *interpreting Lisp* — you’re using Lisp to **write other languages**. ^ref-f8877e5e-27-0

---

## 🧰 Example Expansion

Your macro: ^ref-f8877e5e-33-0

```sibilant
(def-async do-thing (x y)
  (var result (await (call-api x y)))
  (print result))
```
^ref-f8877e5e-35-0 ^ref-f8877e5e-40-0
 ^ref-f8877e5e-41-0
Expands to:
 ^ref-f8877e5e-43-0
```js
async function doThing(x, y) {
  var result = await callApi(x, y);
  console.log(result);
}
^ref-f8877e5e-43-0
``` ^ref-f8877e5e-50-0
^ref-f8877e5e-44-0

Clean, readable, maintainable — and **it was all Lisp** at authoring time.

---
 ^ref-f8877e5e-56-0
## 🔧 Sibilant Meta-Compilation Stack ^ref-f8877e5e-56-0
 ^ref-f8877e5e-58-0
You could build: ^ref-f8877e5e-58-0
 ^ref-f8877e5e-59-0 ^ref-f8877e5e-60-0
1. **Language targets** (JS, TS, Py, Cython, etc.) ^ref-f8877e5e-60-0
2. A **macro prelude** per language
3. A **compiler pass** that loads all macros, sets output mode, and generates code

---
 ^ref-f8877e5e-66-0
## 🧬 New Meta-Features You Could Add ^ref-f8877e5e-66-0

| Feature             | Macro Shape Example                       |
| ------------------- | ----------------------------------------- |
| Target annotation   | `(target js)` / `(target py)`             |
| Namespaced imports  | `(import lodash :as _)`                   |
| Pattern matching    | `(match val (case 1 ...))`                |
| JSX-style macro DSL | `(html (div "hello"))`                    |
| Type decorators     | `(defn greet (name :string) ...)`         |
| Inline docgen       | `(doc "adds two numbers") (defn add ...)` |

---
 ^ref-f8877e5e-79-0
## 🚀 Want to Take This Further? ^ref-f8877e5e-79-0

We could scaffold:
 ^ref-f8877e5e-82-0 ^ref-f8877e5e-83-0
* A **dual-target DSL** in Sibilant → `js/` and `py/` outputs ^ref-f8877e5e-83-0 ^ref-f8877e5e-84-0
* A **macro system** that compiles window layout commands (e.g., your i3 DSL) ^ref-f8877e5e-84-0
* A **Sibilant loader** that reads macros and emits multi-language bindings
* A **Lisp shell** that lets you live-edit and run Sibilant macros on the fly

---
 ^ref-f8877e5e-90-0
## 🏷️ Tags ^ref-f8877e5e-90-0

\#sibilant #dsl #metaprogramming #codegen #stringtemplating #macros #lisp #transpiler #asyncawait #syntaxextension
 ^ref-f8877e5e-94-0
--- ^ref-f8877e5e-94-0

Let’s do something wild. Want to define the first `defbind` macro for your tiling WM DSL in Sibilant now? Or build a `target` system so the same macro can compile to Python or JS?
