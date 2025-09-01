---
uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
created_at: 2025.07.28.12.07.32.md
filename: Cross-Target Macro System in Sibilant
description: >-
  A system for writing one macro that compiles to different target languages
  using target-sensitive rules, with examples for JS and Python async
  operations.
tags:
  - sibilant
  - cross-target
  - macro
  - async
  - python
  - javascript
  - metaprogramming
  - transpiler
  - codegen
  - dsl
related_to_title:
  - template-based-compilation
  - Promethean Agent Config DSL
  - sibilant-macro-targets
  - sibilant-metacompiler-overview
  - polymorphic-meta-programming-engine
  - Cross-Language Runtime Polymorphism
  - polyglot-repl-interface-layer
  - Migrate to Provider-Tenant Architecture
  - sibilant-meta-string-templating-runtime
  - field-interaction-equations
  - Sibilant Meta-Prompt DSL
  - js-to-lisp-reverse-compiler
  - Dynamic Context Model for Web Components
  - Recursive Prompt Construction Engine
  - Chroma Toolkit Consolidation Plan
  - Lisp-Compiler-Integration
  - AI-Centric OS with MCP Layer
  - api-gateway-versioning
  - Board Walk – 2025-08-11
  - Exception Layer Analysis
  - Model Selection for Lightweight Conversational Tasks
  - compiler-kit-foundations
  - eidolon-field-math-foundations
  - prompt-programming-language-lisp
  - aionian-circuit-math
  - ParticleSimulationWithCanvasAndFFmpeg
  - EidolonField
  - Promethean-native config design
  - lisp-dsl-for-window-management
  - Math Fundamentals
  - field-dynamics-math-blocks
  - Duck's Self-Referential Perceptual Loop
  - Language-Agnostic Mirror System
  - Interop and Source Maps
  - 'Agent Tasks: Persistence Migration to DualStore'
related_to_uuid:
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 54382370-1931-4a19-a634-46735708a9ea
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 58191024-d04a-4520-8aae-a18be7b94263
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - d41a06d1-613e-4440-80b7-4553fc694285
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 93d2ba51-8689-49ee-94e2-296092e48058
references: []
---
**Absolutely — let's build the target system.**

You’ve got the right idea. JS is *asynchronous by default*, Python is *synchronous by legacy*, and anything async in Python has to pull in an event loop and make it explicit. It's a real impedance mismatch when trying to write cross-target DSLs.

But here's how we do this smart:

---

# 🧠 Design: Cross-Target Macro System in Sibilant

## ✳️ Goal

* Write **one macro**
* Compile to **different target languages**
* Use **target-sensitive rules** for language-specific syntax

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

---

## 🧰 Core Runtime Helpers

Let’s build:

### 1. **Target Setting**

```sibilant
(var *target* "js")

(macro target (lang)
  `(set *target* ,lang))

(fn current-target [] *target*)
```

---

### 2. **Conditional Macros**

You can now use `(current-target)` inside macros.

e.g. `def-async`, `await`, `import`, `print`, etc. can all adapt to language targets.

---

## 🔄 Example: `await` Macro

```sibilant
(macro await (value)
  (case (current-target)
    ("js" ["await " value])
    ("py" ["await " value])) ; same syntax, but only works inside async def in Py
)
```

---

## 🔄 Example: `print`

```sibilant
(macro print (value)
  (case (current-target)
    ("js" ["console.log(" value ")"])
    ("py" ["print(" value ")"])))
```

---

## ✨ Language-Specific Edge Cases

| Concept        | JS                    | Python                 | DSL Strategy                               |
| -------------- | --------------------- | ---------------------- | ------------------------------------------ |
| `async`        | `async function`      | `async def`            | Use target switch                          |
| `await`        | inside any `async fn` | inside `async def`     | Same syntax, different runtime requirement |
| `import`       | `import ... from ...` | `import ...`           | Provide macro aliases                      |
| `return`       | implicit or `return`  | always `return` needed | Same                                       |
| `default args` | `function(x=5)`       | `def f(x=5)`           | Same                                       |

---

## 🔥 Use in Practice

```sibilant
(target "py")

(def-async fetch-data (url)
  (var response (await (http:get url)))
  (print response))
```

### Output in Python:

```python
async def fetch_data(url):
    response = await http.get(url)
    print(response)
```

Change target:

```sibilant
(target "js")
```

Now it emits:

```js
async function fetchData(url) {
  var response = await http.get(url);
  console.log(response);
}
```

---

## 💡 Optional: Per-Target Macro Registry

You can define target-prefixed macros:

```sibilant
(macro js:def-async ...)
(macro py:def-async ...)
```

Then dispatch based on `(current-target)`:

```sibilant
(macro def-async (name args ...body)
  ((resolve (concat *target* ":def-async")) name args ...body))
```

Modular and composable.

---

## 🛠 Next Ideas

* Add `emit()` function to write output to `js/` or `py/` folder
* Write a `(defmodule ...)` macro that wraps imports, exports, etc.
* Support `#lang` headers or file-level target switches

---

## 🏷️ Tags

\#sibilant #dsl #targetsystem #metaprogramming #jsvspython #crosscompile #asynclanguage #macros #codegen #transpiler

---

Want help building the file emitter? Or should we start implementing macro aliases for a full `stdlib` of cross-language ops?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [template-based-compilation](template-based-compilation.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [EidolonField](eidolonfield.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
