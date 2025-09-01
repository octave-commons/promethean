---
uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
created_at: 2025.07.28.13.07.74-meta-string-templating-runtime.md
filename: sibilant-meta-string-templating-runtime
description: >-
  Sibilant's meta-string templating system for runtime context switching and
  dynamic prompt composition across languages.
tags:
  - meta-string
  - templating
  - runtime
  - context-switching
  - prompt-composition
  - layer-based
  - dynamic-fields
  - realignments
related_to_title:
  - sibilant-metacompiler-overview
  - template-based-compilation
  - Sibilant Meta-Prompt DSL
  - Recursive Prompt Construction Engine
  - Cross-Target Macro System in Sibilant
  - sibilant-macro-targets
  - Cross-Language Runtime Polymorphism
  - polymorphic-meta-programming-engine
  - lisp-dsl-for-window-management
  - Promethean Agent Config DSL
  - ts-to-lisp-transpiler
  - Dynamic Context Model for Web Components
  - Lisp-Compiler-Integration
  - komorebi-group-window-hack
  - field-interaction-equations
  - js-to-lisp-reverse-compiler
  - AI-Centric OS with MCP Layer
  - prompt-programming-language-lisp
  - polyglot-repl-interface-layer
  - EidolonField
  - Duck's Self-Referential Perceptual Loop
  - compiler-kit-foundations
  - ParticleSimulationWithCanvasAndFFmpeg
  - Promethean-native config design
  - aionian-circuit-math
  - Chroma Toolkit Consolidation Plan
  - Unique Info Dump Index
related_to_uuid:
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - af5d2824-faad-476c-a389-e912d9bc672c
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - d41a06d1-613e-4440-80b7-4553fc694285
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
references: []
---
Perfect — glad the highlighter is behaving now. Let's go deep into the DSL.

---

## 🧠 Context So Far (Recap)

You're using **Sibilant** not just as a Lisp-to-JS compiler, but as a **meta-string templating engine** where macros can generate deeply structured code in *any* language. We've started sketching a DSL that:

* Represents **thinking sequences** (`think-sequence`, `when`, `always`, etc.)
* Will be able to **switch contexts or runtimes** depending on the active layer (layer-based metacognition)
* Can **trigger realignments**, conditionally rebuild prompts, or re-evaluate current system state
* Needs to emit **prompt templates** for LLMs, potentially stitched from memory chunks
* May need to serialize/deserialize **cross-runtime data** (e.g., JSON, typed buffers)

---

## 🧬 Next DSL Components

Let’s build a few foundational macro ideas:

---

### 1. `define-runtime` — Register an external language environment

```sibilant
(define-runtime "python"
  (command "python3")
  (entrypoint "main.py")
  (type "subprocess") ;; could be "websocket", "ffi", etc.
)
```

Would compile to:

```js
(register-runtime "python", {
  command: "python3",
  entrypoint: "main.py",
  type: "subprocess"
});
```

---

### 2. `on-layer-change` — Trigger meta-macros when layer state shifts

```sibilant
(on-layer-change 4
  (when (< "alignment.score" 0.5)
    (log "realigning...")
    (trigger-realignment)))
```

---

### 3. `prompt-template` — Compose a reusable prompt with metadata

```sibilant
(prompt-template "explain-current-goal"
  (context "goals.memory")
  (llm "llama3")
  (template
    "Explain what the current goal is:"
    "{{goal.name}}"
    "Why is it important?"
  ))
```

---

### 4. `think-sequence` (already started) — Layer-aware, continuous reasoning step

```sibilant
(think-sequence
  (when (goal? "assist-user")
    (try-action "respond"))
  (always
    (update-context)
    (pulse-uptime)))
```

---

### 5. `define-field` and `update-field` — Eidolon-style dynamic fields

```sibilant
(define-field "fear" (dimensions 8) (decay-rate 0.01))
(update-field "fear" (+input "user.presence"))
```

---

## 🔄 Macro Expansion Philosophy

We’ll use the Sibilant `meta` layer to inject runtime hooks or emit code to different target languages:

```sibilant
(meta (defmacro prompt-template (...body)
         ;; process args, build string, emit doc, return macro output
         ...))
```

This is how we’ll eventually let Sibilant:

* Generate full `.md` prompt files
* Register context metadata
* Track usage per LLM
* Debug via dynamic logs at compile-time

---

### 🔧 Want to define the `think-sequence` macro more deeply next?

Or would you rather design a structure for prompt-building (`prompt-compose`, `chunk`, `slot`, etc.)?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [template-based-compilation](template-based-compilation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [field-interaction-equations](field-interaction-equations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [EidolonField](eidolonfield.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
