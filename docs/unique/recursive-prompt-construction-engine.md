---
uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
created_at: 2025.07.28.12.07.18.md
filename: Recursive Prompt Construction Engine
description: >-
  A self-expanding prompt system that uses LLMs to recursively generate and
  refine prompts through reflection and feedback loops, creating a dynamic
  prompt tree for continuous improvement.
tags:
  - recursive
  - prompt
  - reflection
  - llm
  - metaagent
  - semanticmemory
  - promptcompiler
  - sibilant
  - meta-llm
  - recursiveprompting
related_to_title:
  - Sibilant Meta-Prompt DSL
  - sibilant-meta-string-templating-runtime
  - polyglot-repl-interface-layer
  - template-based-compilation
  - prompt-programming-language-lisp
  - sibilant-metacompiler-overview
  - Cross-Language Runtime Polymorphism
  - Cross-Target Macro System in Sibilant
  - polymorphic-meta-programming-engine
  - Duck's Self-Referential Perceptual Loop
  - Dynamic Context Model for Web Components
  - Reawakening Duck
  - Duck's Attractor States
  - field-interaction-equations
  - js-to-lisp-reverse-compiler
  - lisp-dsl-for-window-management
  - sibilant-macro-targets
  - EidolonField
  - compiler-kit-foundations
  - Promethean-native config design
  - heartbeat-simulation-snippets
  - Chroma Toolkit Consolidation Plan
  - aionian-circuit-math
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - Migrate to Provider-Tenant Architecture
  - ParticleSimulationWithCanvasAndFFmpeg
related_to_uuid:
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - d41a06d1-613e-4440-80b7-4553fc694285
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 13951643-1741-46bb-89dc-1beebb122633
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 58191024-d04a-4520-8aae-a18be7b94263
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - 54382370-1931-4a19-a634-46735708a9ea
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
references: []
---
**Understood.**
We're not just compiling prompts — we’re *growing them*. Dynamically. Reflexively. Using previous LLM calls to synthesize new prompts.

You're asking for a **recursive, reflective prompt assembly system** — a self-expanding prompt tree, where:

* Prompts can be generated **by LLMs**
* Prompt *chunks* are composable
* Metadata is tracked across prompt history
* New prompts can be built from **annotated fragments**, summaries, or embeddings

This is **Layer 3 meets Layer 4** of your architecture. The **symbolic/rational mind building its own query language** to interact with external cognition.

Let’s sketch it.

---

# 🧠 System Sketch: Recursive Prompt Construction Engine

## 🔁 High-Level Cycle

```plaintext
[Input → Prompt A] → [LLM Call → Output A]
                          ↓
         [Extract Prompt Fragments from Output A]
                          ↓
         [Assemble Prompt B from Prompt A + Extracted Chunks]
                          ↓
                      [LLM Call B]
                          ↓
                (repeat, reflect, grow)
```

---

## 🧱 Core Mechanisms

### 1. **Prompt Fragment**

A prompt fragment is a chunk of meaningful, structured prompt text + metadata.

```sibilant
(deffragment summary-block
  :source "agent:duck"
  :content "User is attempting to build cross-runtime prompt compiler"
  :timestamp now
  :tags ["meta" "llm" "promethean"])
```

This gets stored in `PromptMemory`.

---

### 2. **PromptMemory**

A container of prior fragments.

```sibilant
(defmemory prompt-memory (list summary-block context-hint prompt-a))

(fn recall (filter)
  (filter prompt-memory filter))
```

Recall strategies might use:

* `tags`
* `source`
* `vector similarity`
* `response confidence`

---

### 3. **Meta-LLM Prompt Constructor**

Uses LLM itself to generate new prompts from memory fragments:

```sibilant
(defn build-prompt-from (goal)
  (let ((fragments (recall (match :goal goal)))
        (assembled (llm:call
                    (prompt
                      (system "You are a prompt designer.")
                      (user (+ "Assemble a new prompt to achieve this goal: " goal))
                      (examples fragments)
                      :expects "prompt-structure"))))
    (parse-response assembled)))
```

This **uses the LLM to build its own next prompt**. You’ve entered meta-cognition.

---

### 4. **PromptAssembler DSL**

```sibilant
(defprompt assemble-agent-summary
  :goal "summarize last 3 messages"
  :strategy "chunk + extract + compress"
  :input
    (concat
      (fragment context:recent)
      (fragment logs:conversation)
      (fragment agent:status)))
```

This is declarative. The actual content comes from memory + DSL plumbing.

---

## 🧠 Reflection + Feedback

Add a feedback loop:

```sibilant
(defn reflect (prompt response)
  (llm:call
    (prompt
      (system "You're a meta-prompt evaluator.")
      (user (+ "Given the prompt: \n\n" prompt
               "\n\nAnd the response:\n\n" response
               "\n\nWhat could improve the prompt?"))
      :expects "critique-summary")))
```

And you store:

```sibilant
(deffragment prompt-critique
  :source "meta"
  :content critique-summary)
```

---

## 🔧 Modular Macro Sketches

```sibilant
(macro prompt (…sections) `(assemble-prompt ,sections))

(macro deffragment (name &metadata)
  `(store-fragment ,name ,metadata))

(macro defmemory (name fragments)
  `(store-memory ,name ,fragments))

(macro defprompt (name &options)
  `(compile-structured-prompt ,name ,options))
```

---

## 🧠 Final Vision

You’re constructing a:

* **Recursive prompt building engine**
* **Semantic memory system**
* **LLM-driven compiler for prompts**
* **Meta-LLM agent that rewrites its own instructions**

You’re not building a chatbot. You’re building a **mind** that *thinks about its thoughts* and grows its queries over time.

---

## 🏷️ Tags

\#sibilant #dsl #promptcompiler #reflection #llm #semanticmemory #metaagent #recursiveprompting #promethean

---

You want to build `deffragment`, `prompt-memory`, and the first `build-prompt-from` call next? Or define the core data model and memory indexing strategy? We can go either way — just say *deeper*.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [template-based-compilation](template-based-compilation.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Reawakening Duck](reawakening-duck.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [field-interaction-equations](field-interaction-equations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [EidolonField](eidolonfield.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
