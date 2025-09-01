---
uuid: d41a06d1-613e-4440-80b7-4553fc694285
created_at: 2025.07.28.13.07.07-prompt-programming-language-lisp.md
filename: prompt-programming-language-lisp
description: >-
  A meta-macro Lisp language for crafting prompt blueprints that assemble,
  adapt, and emit structured LLM interactions via composable fragments and
  cognitive wiring.
tags:
  - prompt
  - lisp
  - meta-macro
  - composable
  - cognitive
  - wiring
  - interactable
  - llm
  - templating
  - sibilant
related_to_title:
  - plan-update-confirmation
  - Obsidian Templating Plugins Integration Guide
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - Sibilant Meta-Prompt DSL
  - Recursive Prompt Construction Engine
  - Chroma Toolkit Consolidation Plan
  - Universal Lisp Interface
  - sibilant-meta-string-templating-runtime
  - Prompt_Folder_Bootstrap
  - heartbeat-simulation-snippets
  - template-based-compilation
  - Cross-Language Runtime Polymorphism
  - Protocol_0_The_Contradiction_Engine
  - Promethean-native config design
  - Dynamic Context Model for Web Components
  - Promethean-Copilot-Intent-Engine
  - 'Agent Tasks: Persistence Migration to DualStore'
  - lisp-dsl-for-window-management
  - Eidolon Field Abstract Model
  - AI-Centric OS with MCP Layer
  - Cross-Target Macro System in Sibilant
  - Duck's Self-Referential Perceptual Loop
  - polyglot-repl-interface-layer
  - aionian-circuit-math
  - Board Walk – 2025-08-11
  - polymorphic-meta-programming-engine
  - Simulation Demo
  - eidolon-node-lifecycle
  - field-node-diagram-outline
  - Agent Reflections and Prompt Evolution
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Local-First Intention→Code Loop with Free Models
  - EidolonField
  - obsidian-ignore-node-modules-regex
  - Canonical Org-Babel Matplotlib Animation Template
  - ecs-scheduler-and-prefabs
  - compiler-kit-foundations
related_to_uuid:
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - 7a3f66a1-3373-4db5-8581-9b4f5452f3b3
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - af5d2824-faad-476c-a389-e912d9bc672c
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 01b21543-7e03-4129-8fe4-b6306be69dee
references: []
---
Yes—this direction is 🔥.

You're essentially building a prompt programming language on top of a meta-macro Lisp (Sibilant) that targets LLMs as a runtime. Think of `.prompt.sibilant` files as:

* **Prompt blueprints** that assemble and adapt based on layered context.
* **Composable**, reusable prompt fragments (macros like `think-sequence`, `on-layer-change`, etc.).
* **Interpretable and inspectable**, unlike buried `.chat` transcripts.
* **Able to emit different formats**: `.chat`, `messages`, pure strings, or even raw function calls into the Cephalon.

You’re fusing:

* ✨ *Prompt templating DSL* (like Jinja2 for LLMs)
* 🧠 *Cognitive wiring* (based on your 8-layer Eidolon structure)
* 🔁 *Macro/micro prompting loops* for iterative thinking or alignment reevaluation

### Suggestion: Minimum viable syntax

```sibilant
(prompt
  (think-sequence
    (when (< (layer 4 "alignment.score") 0.6)
      (trigger "realign"))

    (when (goal = "generate-summary")
      (inject-context-from memory.summary)
      (call "summarize-state"))

    (always
      (update "uptime")
      (log "cycle complete"))))
```

Could output:

```json
[
  {"role": "system", "content": "...alignment warning..."},
  {"role": "user", "content": "...summary requested..."},
  {"role": "assistant", "content": "..."}
]
```

Or maybe:

```txt
System: alignment warning...
User: Please summarize the system state.
Assistant: Here's the summary...
```

Or maybe feed into Codex directly:

```js
codex.chat({
  think: [...],
  inject: memory.summary,
  constraints: {
    role: "assistant",
    align: true
  }
})
```

You’re not just writing templates—you’re scripting a mind.

Want to scaffold a sample `.prompt.sibilant` file layout? Or should we write a `render-prompt` function that compiles it into a `.chat` array or raw string?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [plan-update-confirmation](plan-update-confirmation.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [template-based-compilation](template-based-compilation.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [EidolonField](eidolonfield.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
