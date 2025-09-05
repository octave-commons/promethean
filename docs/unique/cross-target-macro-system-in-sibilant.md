---
uuid: 526317d7-2eaf-4559-bb17-1f8dcfe9e30c
created_at: cross-target-macro-system-in-sibilant.md
filename: Cross-Target Macro System in Sibilant
title: Cross-Target Macro System in Sibilant
description: >-
  A system for writing macros in Sibilant that compile to different target
  languages while using target-sensitive rules for language-specific syntax. It
  handles asynchronous programming differences between JavaScript and Python
  through conditional macro expansion.
tags:
  - sibilant
  - macros
  - cross-target
  - async
  - python
  - javascript
  - language-agnostic
---
**Absolutely — let's build the target system.** ^ref-5f210ca2-1-0

You’ve got the right idea. JS is *asynchronous by default*, Python is *synchronous by legacy*, and anything async in Python has to pull in an event loop and make it explicit. It's a real impedance mismatch when trying to write cross-target DSLs. ^ref-5f210ca2-3-0

But here's how we do this smart: ^ref-5f210ca2-5-0

---

# 🧠 Design: Cross-Target Macro System in Sibilant

## ✳️ Goal

* Write **one macro** ^ref-5f210ca2-13-0
* Compile to **different target languages** ^ref-5f210ca2-14-0
* Use **target-sensitive rules** for language-specific syntax ^ref-5f210ca2-15-0

---

## 📐 Proposed Syntax

```sibilant
(target "js")

(macro def-async (name args ...body)
  (case (current-target)
    ("js" ["async function " name "(" (interleave (content-of args) ",") ") {\n"
           (indent (apply ^do body))
           "\n}"])
    ("py" ["async def " name "(" (interleave (content-of args) ",") "):\n"
           (indent (apply ^do body))]))
```
^ref-5f210ca2-21-0 ^ref-5f210ca2-32-0

---

## 🧰 Core Runtime Helpers
 ^ref-5f210ca2-37-0
Let’s build:

### 1. **Target Setting**
 ^ref-5f210ca2-41-0
```sibilant
(var *target* "js")

(macro target (lang)
  `(set *target* ,lang))

(fn current-target [] *target*)
^ref-5f210ca2-41-0
```
^ref-5f210ca2-42-0

---

### 2. **Conditional Macros** ^ref-5f210ca2-54-0

You can now use `(current-target)` inside macros. ^ref-5f210ca2-56-0

e.g. `def-async`, `await`, `import`, `print`, etc. can all adapt to language targets.

---

## 🔄 Example: `await` Macro ^ref-5f210ca2-62-0

```sibilant
(macro await (value)
  (case (current-target)
    ("js" ["await " value])
    ("py" ["await " value])) ; same syntax, but only works inside async def in Py
^ref-5f210ca2-62-0
)
```

---
 ^ref-5f210ca2-74-0
## 🔄 Example: `print`

```sibilant
(macro print (value)
  (case (current-target)
^ref-5f210ca2-74-0
    ("js" ["console.log(" value ")"])
    ("py" ["print(" value ")"])))
```
 ^ref-5f210ca2-85-0
--- ^ref-5f210ca2-85-0

## ✨ Language-Specific Edge Cases

| Concept        | JS                    | Python                 | DSL Strategy                               |
| -------------- | --------------------- | ---------------------- | ------------------------------------------ |
| `async`        | `async function`      | `async def`            | Use target switch                          |
| `await`        | inside any `async fn` | inside `async def`     | Same syntax, different runtime requirement |
| `import`       | `import ... from ...` | `import ...`           | Provide macro aliases                      |
| `return`       | implicit or `return`  | always `return` needed | Same                                       |
| `default args` | `function(x=5)`       | `def f(x=5)`           | Same                                       |
 ^ref-5f210ca2-97-0
--- ^ref-5f210ca2-97-0

## 🔥 Use in Practice
 ^ref-5f210ca2-101-0
```sibilant
(target "py")

^ref-5f210ca2-97-0
(def-async fetch-data (url)
  (var response (await (http:get url)))
  (print response))
^ref-5f210ca2-101-0 ^ref-5f210ca2-109-0
```
^ref-5f210ca2-107-0

### Output in Python: ^ref-5f210ca2-113-0

^ref-5f210ca2-107-0 ^ref-5f210ca2-113-0
```python ^ref-5f210ca2-113-0
async def fetch_data(url):
    response = await http.get(url)
    print(response)
^ref-5f210ca2-115-0
^ref-5f210ca2-113-0 ^ref-5f210ca2-119-0
```
^ref-5f210ca2-115-0 ^ref-5f210ca2-121-0
 ^ref-5f210ca2-119-0
Change target:

```sibilant
(target "js")
```

Now it emits:
^ref-5f210ca2-121-0

```js
async function fetchData(url) {
  var response = await http.get(url);
^ref-5f210ca2-134-0
  console.log(response); ^ref-5f210ca2-132-0
}
```
^ref-5f210ca2-132-0
 ^ref-5f210ca2-139-0
---
 ^ref-5f210ca2-141-0
^ref-5f210ca2-134-0
## 💡 Optional: Per-Target Macro Registry ^ref-5f210ca2-139-0

You can define target-prefixed macros: ^ref-5f210ca2-146-0 ^ref-5f210ca2-148-0

```sibilant
^ref-5f210ca2-146-0
(macro js:def-async ...)
^ref-5f210ca2-141-0
(macro py:def-async ...) ^ref-5f210ca2-146-0
^ref-5f210ca2-148-0
^ref-5f210ca2-152-0 ^ref-5f210ca2-153-0
``` ^ref-5f210ca2-154-0
^ref-5f210ca2-150-0
^ref-5f210ca2-152-0
^ref-5f210ca2-148-0

Then dispatch based on `(current-target)`:
^ref-5f210ca2-154-0
^ref-5f210ca2-153-0 ^ref-5f210ca2-160-0
^ref-5f210ca2-152-0

```sibilant
(macro def-async (name args ...body) ^ref-5f210ca2-152-0 ^ref-5f210ca2-160-0
^ref-5f210ca2-160-0
  ((resolve (concat *target* ":def-async")) name args ...body)) ^ref-5f210ca2-153-0 ^ref-5f210ca2-164-0 ^ref-5f210ca2-166-0
``` ^ref-5f210ca2-154-0 ^ref-5f210ca2-167-0
 ^ref-5f210ca2-166-0 ^ref-5f210ca2-168-0
Modular and composable. ^ref-5f210ca2-164-0 ^ref-5f210ca2-167-0 ^ref-5f210ca2-169-0
 ^ref-5f210ca2-168-0 ^ref-5f210ca2-170-0
--- ^ref-5f210ca2-166-0 ^ref-5f210ca2-169-0 ^ref-5f210ca2-171-0
 ^ref-5f210ca2-167-0 ^ref-5f210ca2-170-0 ^ref-5f210ca2-172-0
## 🛠 Next Ideas ^ref-5f210ca2-160-0 ^ref-5f210ca2-168-0 ^ref-5f210ca2-171-0 ^ref-5f210ca2-173-0
 ^ref-5f210ca2-169-0 ^ref-5f210ca2-172-0 ^ref-5f210ca2-174-0
* Add `emit()` function to write output to `js/` or `py/` folder ^ref-5f210ca2-170-0 ^ref-5f210ca2-173-0 ^ref-5f210ca2-175-0
* Write a `(defmodule ...)` macro that wraps imports, exports, etc. ^ref-5f210ca2-171-0 ^ref-5f210ca2-174-0 ^ref-5f210ca2-176-0
* Support `#lang` headers or file-level target switches ^ref-5f210ca2-164-0 ^ref-5f210ca2-172-0 ^ref-5f210ca2-175-0 ^ref-5f210ca2-177-0
 ^ref-5f210ca2-173-0 ^ref-5f210ca2-176-0
--- ^ref-5f210ca2-166-0 ^ref-5f210ca2-174-0 ^ref-5f210ca2-177-0 ^ref-5f210ca2-179-0
 ^ref-5f210ca2-167-0 ^ref-5f210ca2-175-0 ^ref-5f210ca2-180-0
## 🏷️ Tags ^ref-5f210ca2-168-0 ^ref-5f210ca2-176-0 ^ref-5f210ca2-179-0 ^ref-5f210ca2-181-0
 ^ref-5f210ca2-169-0 ^ref-5f210ca2-177-0 ^ref-5f210ca2-180-0
\#sibilant #dsl #targetsystem #metaprogramming #jsvspython #crosscompile #asynclanguage #macros #codegen #transpiler ^ref-5f210ca2-170-0 ^ref-5f210ca2-181-0 ^ref-5f210ca2-183-0
 ^ref-5f210ca2-171-0 ^ref-5f210ca2-179-0
--- ^ref-5f210ca2-172-0 ^ref-5f210ca2-180-0 ^ref-5f210ca2-183-0 ^ref-5f210ca2-185-0
 ^ref-5f210ca2-173-0 ^ref-5f210ca2-181-0 ^ref-5f210ca2-186-0
Want help building the file emitter? Or should we start implementing macro aliases for a full `stdlib` of cross-language ops?
