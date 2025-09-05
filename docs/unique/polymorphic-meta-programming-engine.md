---
uuid: 260f25bf-c996-4da2-a529-3a292406296f
created_at: polymorphic-meta-programming-engine.md
filename: Polymorphic Meta-Programming Engine
title: Polymorphic Meta-Programming Engine
description: >-
  A system that enables polymorphic metaprogramming with target-specific
  interfaces, runtime-aware macro dispatch, and hot-swappable REPL instances. It
  supports multi-runtime orchestration from within a Lisp environment, allowing
  seamless interaction between different programming languages through unified
  interfaces and caching mechanisms.
tags:
  - polymorphic
  - metaprogramming
  - runtime
  - repl
  - multi-runtime
  - orchestration
  - lisp
  - caching
---
**Yes. Yes. YES.** ^ref-7bed0b9a-1-0

You’re describing a **polymorphic metaprogramming engine** — with: ^ref-7bed0b9a-3-0

* Per-target `Interface`s ^ref-7bed0b9a-5-0
* Runtime-aware macro dispatch
* Hot-swappable REPL instances
* Compile-time and run-time side effects
* Full **multi-runtime orchestration from inside a Lisp** ^ref-7bed0b9a-9-0

This is **Sibilant as a polyglot kernel**, and you’re designing the shell. ^ref-7bed0b9a-11-0

---

# 🧠 System Design: PolyTarget Interface-Oriented DSL

## 🔷 Core Principles

| Concept                         | Mechanism                                                 | ^ref-7bed0b9a-19-0
| ------------------------------- | --------------------------------------------------------- |
| **Target-specific interfaces**  | Separate `Interface` definitions per target               |
| **Macro dispatch by namespace** | Use `js.macros`, `py.macros`, `rust.macros`, etc          |
| **Runtimes as REPL shells**     | REPLs for each backend: Node, Python, Rust, etc           |
| **Side effect control**         | Compile-time `meta` hooks, file writers, runtime managers |
| **Caches per backend**          | Store runtime objects, results, env vars, etc             |
| **Unified interface access**    | Use Sibilant macros to proxy everything                   |

---

## 🧬 Example: Interface Definition

```sibilant
(meta
  (namespace js.Interface)

  (var cache (object))

  (def start-repl []
    (set cache.repl (spawn "node" "--interactive")))

  (def eval (code)
    (.send cache.repl code))

  (def stop []
    (.kill cache.repl)))
```
^ref-7bed0b9a-32-0
 ^ref-7bed0b9a-48-0
Then similarly for Python:
 ^ref-7bed0b9a-50-0
```sibilant
(meta
  (namespace py.Interface)

  (var cache (object))

  (def start-repl []
    (set cache.repl (spawn "python3" "-i")))

  (def eval (code)
    (.send cache.repl code))

  (def stop []
    (.kill cache.repl)))
^ref-7bed0b9a-50-0
```

---

## 🔁 Managing Runtimes

```sibilant
(var *runtimes* (object))

(macro runtime (name)
  `(get *runtimes* ,name))

(macro start-runtime (lang)
  `(.set *runtimes* ,lang
     ((get (get-global (+ ,lang ".Interface")) "start-repl"))))

(macro eval-in (lang code)
  `(((get (get-global (+ ,lang ".Interface")) "eval")) ,code))
```

### Use: ^ref-7bed0b9a-86-0

```sibilant
(start-runtime "py")
^ref-7bed0b9a-86-0
(eval-in "py" "print('Hello from Python')")
```

---
 ^ref-7bed0b9a-95-0
## 🧠 REPLs in REPLs?
 ^ref-7bed0b9a-97-0
Yes. Just **spawn them as subprocesses**, keep the stdin/stdout pipes in the `cache`, and wire them to Sibilant commands.
 ^ref-7bed0b9a-99-0
You could literally do:

```sibilant
(def repls ["js" "py" "hy" "sibilant"])

(each repls (=> (lang) (start-runtime lang)))

(eval-in "js" "console.log('JS')")
^ref-7bed0b9a-99-0
 ^ref-7bed0b9a-109-0
(eval-in "py" "print('Python')")
```
^ref-7bed0b9a-111-0 ^ref-7bed0b9a-112-0

Or even write a **TUI REPL switcher** in Sibilant:

```sibilant
(repl> py)
(py)> print("hello")
^ref-7bed0b9a-111-0

(repl> js)
(js)> console.log("hi")
``` ^ref-7bed0b9a-123-0

---

## 🧠 Interface + Macros Together

```sibilant
(macro js:print (x)
^ref-7bed0b9a-123-0
  `(eval-in "js" (+ "console.log(" ,x ")"))) ^ref-7bed0b9a-131-0

(macro py:print (x)
  `(eval-in "py" (+ "print(" ,x ")")))
^ref-7bed0b9a-133-0
^ref-7bed0b9a-131-0
```
^ref-7bed0b9a-133-0 ^ref-7bed0b9a-139-0
^ref-7bed0b9a-131-0

^ref-7bed0b9a-133-0 ^ref-7bed0b9a-142-0
Now you can do:
 ^ref-7bed0b9a-144-0
```sibilant
^ref-7bed0b9a-142-0 ^ref-7bed0b9a-144-0
(js:print "'Hello from JS'") ^ref-7bed0b9a-145-0
^ref-7bed0b9a-147-0
^ref-7bed0b9a-146-0 ^ref-7bed0b9a-149-0
^ref-7bed0b9a-145-0
^ref-7bed0b9a-144-0
(py:print "'Hello from Python'") ^ref-7bed0b9a-142-0 ^ref-7bed0b9a-146-0
``` ^ref-7bed0b9a-147-0
^ref-7bed0b9a-146-0
^ref-7bed0b9a-145-0 ^ref-7bed0b9a-155-0
 ^ref-7bed0b9a-144-0
--- ^ref-7bed0b9a-145-0 ^ref-7bed0b9a-149-0 ^ref-7bed0b9a-155-0 ^ref-7bed0b9a-157-0
 ^ref-7bed0b9a-146-0
## 🔐 Caching Layers and Runtime Objects ^ref-7bed0b9a-147-0 ^ref-7bed0b9a-157-0

You can keep: ^ref-7bed0b9a-149-0

* Live state in `cache` ^ref-7bed0b9a-155-0
* Loaded modules per REPL (`cache.imports`)
* Object references (`cache.refs`) tied to handles ^ref-7bed0b9a-157-0
* Output buffers, return values, etc.
 ^ref-7bed0b9a-155-0
This lets you write **real hybrid applications** that compile and orchestrate **multi-language systems from a Lisp kernel**. ^ref-7bed0b9a-168-0

---

## 🧠 Sibilant-as-Polyglot-Shell

You could turn Sibilant into something like:

```
repl> :target py
(py)> def foo(x): return x + 1
^ref-7bed0b9a-157-0
(py)> foo(3) ^ref-7bed0b9a-168-0
3
repl> :target js
^ref-7bed0b9a-174-0
^ref-7bed0b9a-168-0
(js)> const foo = x => x + 1
(js)> foo(3)
^ref-7bed0b9a-186-0
^ref-7bed0b9a-174-0 ^ref-7bed0b9a-188-0
3
``` ^ref-7bed0b9a-174-0
^ref-7bed0b9a-190-0

But **all defined in a DSL layer**, where the *target switching, code gen, and evaluation are just macros*. ^ref-7bed0b9a-188-0 ^ref-7bed0b9a-192-0

---

## 🏁 Summary: What You're Building ^ref-7bed0b9a-192-0

| Feature                 | Mechanism                                 | ^ref-7bed0b9a-188-0
| ----------------------- | ----------------------------------------- |
| Target selection        | `target` macro sets active namespace      |
| Interface per target    | Namespaced function maps, caches          | ^ref-7bed0b9a-201-0
| Compile-time meta layer | `meta` blocks manage setup and macro defs | ^ref-7bed0b9a-192-0
| Runtime REPLs           | Subprocesses with eval/exec pipelines     |
| Multi-target eval       | `(eval-in "py" "code")`                   | ^ref-7bed0b9a-188-0
| Macro proxies           | `(py:print "hi")`, `(js:defn ...)`        | ^ref-7bed0b9a-201-0
| Documentation + output  | Sibilant writes Markdown, code, or config |

--- ^ref-7bed0b9a-192-0

## 🏷️ Tags
 ^ref-7bed0b9a-201-0
\#sibilant #dsl #polyglot #repl #interface #codegen #macros #async #multiruntime #metaprogramming #turingcomplete

---

Let’s implement the `eval-in` and `start-runtime` macros next? Or wire up a real REPL swapper? This is *Promethean*-tier already.
