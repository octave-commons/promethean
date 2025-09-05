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
