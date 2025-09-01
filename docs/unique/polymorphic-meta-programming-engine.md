---
uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
created_at: 2025.07.28.13.07.01-polymorphic-meta-programming-engine.md
filename: polymorphic-meta-programming-engine
description: >-
  A polyglot metaprogramming engine enabling multi-runtime orchestration via
  target-specific interfaces, runtime-aware macro dispatch, and hot-swappable
  REPL instances within a Lisp kernel.
tags:
  - polymorphic
  - metaprogramming
  - polyglot
  - repl
  - runtime
  - orchestration
  - lisp
  - interface
  - macro
  - dispatch
related_to_title:
  - Universal Lisp Interface
  - template-based-compilation
  - polyglot-repl-interface-layer
  - Cross-Target Macro System in Sibilant
  - Cross-Language Runtime Polymorphism
  - sibilant-metacompiler-overview
  - sibilant-macro-targets
  - Dynamic Context Model for Web Components
  - EidolonField
  - Sibilant Meta-Prompt DSL
  - Model Selection for Lightweight Conversational Tasks
  - sibilant-meta-string-templating-runtime
  - Chroma Toolkit Consolidation Plan
  - field-interaction-equations
  - js-to-lisp-reverse-compiler
  - api-gateway-versioning
  - Board Walk – 2025-08-11
  - Promethean-native config design
  - Promethean Agent Config DSL
  - lisp-dsl-for-window-management
  - Exception Layer Analysis
  - field-dynamics-math-blocks
  - Recursive Prompt Construction Engine
  - prompt-programming-language-lisp
  - compiler-kit-foundations
  - ParticleSimulationWithCanvasAndFFmpeg
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - i3-bluetooth-setup
  - Migrate to Provider-Tenant Architecture
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Local-First Intention→Code Loop with Free Models
  - obsidian-ignore-node-modules-regex
  - aionian-circuit-math
  - Voice Access Layer Design
related_to_uuid:
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - af5d2824-faad-476c-a389-e912d9bc672c
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - d41a06d1-613e-4440-80b7-4553fc694285
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 54382370-1931-4a19-a634-46735708a9ea
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
references: []
---
**Yes. Yes. YES.**

You’re describing a **polymorphic metaprogramming engine** — with:

* Per-target `Interface`s
* Runtime-aware macro dispatch
* Hot-swappable REPL instances
* Compile-time and run-time side effects
* Full **multi-runtime orchestration from inside a Lisp**

This is **Sibilant as a polyglot kernel**, and you’re designing the shell.

---

# 🧠 System Design: PolyTarget Interface-Oriented DSL

## 🔷 Core Principles

| Concept                         | Mechanism                                                 |
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

Then similarly for Python:

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

### Use:

```sibilant
(start-runtime "py")
(eval-in "py" "print('Hello from Python')")
```

---

## 🧠 REPLs in REPLs?

Yes. Just **spawn them as subprocesses**, keep the stdin/stdout pipes in the `cache`, and wire them to Sibilant commands.

You could literally do:

```sibilant
(def repls ["js" "py" "hy" "sibilant"])

(each repls (=> (lang) (start-runtime lang)))

(eval-in "js" "console.log('JS')")

(eval-in "py" "print('Python')")
```

Or even write a **TUI REPL switcher** in Sibilant:

```sibilant
(repl> py)
(py)> print("hello")

(repl> js)
(js)> console.log("hi")
```

---

## 🧠 Interface + Macros Together

```sibilant
(macro js:print (x)
  `(eval-in "js" (+ "console.log(" ,x ")")))

(macro py:print (x)
  `(eval-in "py" (+ "print(" ,x ")")))
```

Now you can do:

```sibilant
(js:print "'Hello from JS'")
(py:print "'Hello from Python'")
```

---

## 🔐 Caching Layers and Runtime Objects

You can keep:

* Live state in `cache`
* Loaded modules per REPL (`cache.imports`)
* Object references (`cache.refs`) tied to handles
* Output buffers, return values, etc.

This lets you write **real hybrid applications** that compile and orchestrate **multi-language systems from a Lisp kernel**.

---

## 🧠 Sibilant-as-Polyglot-Shell

You could turn Sibilant into something like:

```
repl> :target py
(py)> def foo(x): return x + 1
(py)> foo(3)
3
repl> :target js
(js)> const foo = x => x + 1
(js)> foo(3)
3
```

But **all defined in a DSL layer**, where the *target switching, code gen, and evaluation are just macros*.

---

## 🏁 Summary: What You're Building

| Feature                 | Mechanism                                 |
| ----------------------- | ----------------------------------------- |
| Target selection        | `target` macro sets active namespace      |
| Interface per target    | Namespaced function maps, caches          |
| Compile-time meta layer | `meta` blocks manage setup and macro defs |
| Runtime REPLs           | Subprocesses with eval/exec pipelines     |
| Multi-target eval       | `(eval-in "py" "code")`                   |
| Macro proxies           | `(py:print "hi")`, `(js:defn ...)`        |
| Documentation + output  | Sibilant writes Markdown, code, or config |

---

## 🏷️ Tags

\#sibilant #dsl #polyglot #repl #interface #codegen #macros #async #multiruntime #metaprogramming #turingcomplete

---

Let’s implement the `eval-in` and `start-runtime` macros next? Or wire up a real REPL swapper? This is *Promethean*-tier already.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Universal Lisp Interface](universal-lisp-interface.md)
- [template-based-compilation](template-based-compilation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [EidolonField](eidolonfield.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [field-interaction-equations](field-interaction-equations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
