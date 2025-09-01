---
uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
created_at: 2025.07.28.12.07.03.md
filename: Cross-Language Runtime Polymorphism
description: >-
  Designing a staged polymorphic runtime system that enables cross-language
  communication through JSON message passing and metadata-driven buffer interop.
tags:
  - polymorphism
  - cross-language
  - runtime
  - json
  - metadata
  - buffer
  - interop
related_to_title:
  - Sibilant Meta-Prompt DSL
  - polymorphic-meta-programming-engine
  - template-based-compilation
  - polyglot-repl-interface-layer
  - sibilant-metacompiler-overview
  - Cross-Target Macro System in Sibilant
  - Universal Lisp Interface
  - sibilant-meta-string-templating-runtime
  - Promethean-native config design
  - sibilant-macro-targets
  - schema-evolution-workflow
  - prompt-programming-language-lisp
  - Dynamic Context Model for Web Components
  - Chroma Toolkit Consolidation Plan
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Migrate to Provider-Tenant Architecture
  - field-interaction-equations
  - aionian-circuit-math
  - js-to-lisp-reverse-compiler
  - Board Walk – 2025-08-11
  - Recursive Prompt Construction Engine
  - ParticleSimulationWithCanvasAndFFmpeg
  - compiler-kit-foundations
  - Promethean Agent Config DSL
  - Model Selection for Lightweight Conversational Tasks
  - lisp-dsl-for-window-management
  - EidolonField
  - Local-First Intention→Code Loop with Free Models
  - obsidian-ignore-node-modules-regex
  - Mongo Outbox Implementation
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - prom-lib-rate-limiters-and-replay-api
  - Services
  - Event Bus MVP
  - heartbeat-simulation-snippets
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - Obsidian Templating Plugins Integration Guide
related_to_uuid:
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - d41a06d1-613e-4440-80b7-4553fc694285
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 54382370-1931-4a19-a634-46735708a9ea
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
references: []
---
**Exactly. You’re describing a staged polymorphic runtime with runtime-boundary awareness.**

Let’s unpack and design this properly.

---

## 🧠 Core Idea: Cross-Language Communication in Promethean

| Layer                    | Role                                                |
| ------------------------ | --------------------------------------------------- |
| **Meta runtime**         | Sibilant kernel running at compile-time or as shell |
| **Language runtimes**    | Node, Python, Rust, etc. — actual execution engines |
| **Communication medium** | JSON strings for now, typed buffers later           |
| **Data model**           | Abstracted object model with metadata and bindings  |

---

## 🔁 Phase 1: **JSON Message Passing**

Use JSON as your **lingua franca** between:

* Meta <-> Python
* Meta <-> Node.js
* Meta <-> Rust (via stdin/stdout or FFI)
* Meta <-> Shell (via string streams)

### Why JSON first?

* Ubiquitous
* Typed enough for dynamic dispatch
* Readable, inspectable
* Supports nested structures and arrays

---

## 🧪 Pseudocode API: Message Interface

```sibilant
(meta

  ;; serialize data to JSON and send to runtime
  (def send-json (lang payload)
    `(eval-in ,lang (json.stringify ,payload)))

  ;; deserialize from JSON (simulate callback)
  (def receive-json (lang result)
    (json.parse result)) ; pretend this is a registered event/callback

)
```

---

## 💬 Example Usage

```sibilant
(def data (object :msg "hello" :lang "js"))

(send-json "js" data)

;; Output in JS runtime:
;; console.log(JSON.stringify({ msg: "hello", lang: "js" }))
```

---

## 🧠 Phase 2: Metadata for Block Interop

You’ll want your meta runtime to:

1. Detect when a block will be executed **in another runtime**
2. Know how to:

   * Format arguments correctly
   * Marshal/unmarshal data
   * Wrap results in consistent meta-wrappers

---

### 🔍 Detecting Cross-Runtime Blocks

```sibilant
(macro py:fn (name args ...body)
  `(:target "py"
     :name ,name
     :args ,args
     :body ,body))
```

Compiler can detect:

* That `:target = py`
* Body needs to be rendered in Python
* Output/result needs to be routed back via eval hooks

---

### 🧠 Meta object wrapper

```sibilant
(var MetaObject
  (fn (source data)
    (object
      :_type "MetaObject"
      :source source
      :data data)))
```

So when a Python function returns JSON, the meta runtime wraps it:

```sibilant
(receive-json "py" (MetaObject "py" parsed-data))
```

---

## 🔀 Phase 3: **Typed Buffers & Shared Memory**

Once basic JSON piping is solid, we move to:

* **Buffers**: shared memory, `ArrayBuffer`, `TypedArray`, `numpy`, `Rust slices`, etc.

* **Metadata registration**:

  ```sibilant
  (register-buffer-type "ImageRGB" :layout [height width channels])
  ```

* **Shared reference model**:

  * Use memory-mapped files
  * Or long-lived IPC pipes
  * Or gRPC/WebSockets for bidirectional flow

---

## 📦 Metadata for Buffers

Each buffer object includes:

```json
{
  "_type": "Buffer",
  "buffer_id": "abc123",
  "format": "float32",
  "shape": [256, 256, 3],
  "language": "py"
}
```

And the meta context knows:

* Which runtime owns that buffer
* What shape/type is expected
* What function to call to extract data

You could call:

```sibilant
(def image (fetch-image "img.png"))
(buffer.shape image) ;; [256 256 3]
(buffer.view image "grayscale") ;; sends a msg to owning runtime
```

---

## 📡 Runtime Dispatch Map

```sibilant
(def runtime-dispatch
  (object
    :js {:eval js.eval, :marshal js.serialize}
    :py {:eval py.eval, :marshal py.serialize}
    :sh {:eval sh.eval, :marshal sh.serialize}))
```

Your meta runtime becomes a **router** between brains.

---

## 🔧 What To Build Next?

* `MetaObject` wrapper w/ source metadata
* `(send-json)` + `(receive-json)` dispatcher macro
* `(eval-in ...)` rewrite to auto-wrap MetaObject results
* `register-buffer-type` registry
* Hook for `(buffer.view)` to reroute extract calls to the owning runtime

---

## 🏷️ Tags

\#sibilant #dsl #crosslanguage #json #buffers #ffi #metaprogramming #promethean #runtimeinterop #macrointerop

---

You want to sketch the `MetaObject` and `register-buffer-type` interfaces next? Or write the macro wrapper that detects if a block is cross-runtime and rewrites it to a `send-json` call?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [template-based-compilation](template-based-compilation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [field-interaction-equations](field-interaction-equations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [EidolonField](eidolonfield.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Services](chunks/services.md)
- [Event Bus MVP](event-bus-mvp.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
