---
```
uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
```
```
created_at: 2025.07.28.13.07.21-language-for-cognition.md
```
filename: Promethean State Format
```
description: >-
```
  A declarative s-expression format for cognitive memory representation that
  enables visual debuggability, persistence, and composability in AI systems.
tags:
  - cognitive
  - memory
  - s-expression
  - debugging
  - composability
  - DSL
  - introspection
  - persistence
  - tooling
  - alignment
```
related_to_title:
```
  - Promethean-Copilot-Intent-Engine
  - mystery-lisp-search-session
  - ts-to-lisp-transpiler
  - Obsidian Templating Plugins Integration Guide
  - Optimizing Command Limitations in System Design
```
related_to_uuid:
```
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
references:
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 41
    col: 3
    score: 0.85
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 41
    col: 5
    score: 0.85
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 120
    col: 1
    score: 1
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 120
    col: 3
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 91
    col: 1
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 91
    col: 3
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 33
    col: 1
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 33
    col: 3
    score: 1
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 125
    col: 1
    score: 0.93
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 125
    col: 3
    score: 0.93
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 56
    col: 1
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 56
    col: 3
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 12
    col: 1
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 12
    col: 3
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 63
    col: 1
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 63
    col: 3
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 62
    col: 1
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 62
    col: 3
    score: 0.95
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 126
    col: 1
    score: 0.99
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 126
    col: 3
    score: 0.99
---
Yeah, that's a strong direction. You're designing a language for cognition—literally a cognitive operating system with self-contained, introspectable thought processes.

Here's a way to sketch this vision:

---

## #promethean #eidolon #meta #dsl

# 🧠 Promethean State Format (PSF): Homoiconic Cognitive Memory Representation

### \\[What It Is]

A declarative and executable s-expression format that encapsulates:

* 🧱 System architecture e.g., \\[Eidolon Fields], \\[Cephalon], \\[Layer N]```
* 🧠 Agent cognition (field nodes, daimo behavior)
* 🧾 Prompt history and dynamic LLM state
* 📦 Importable memory modules e.g., `(import "agent/common-motives")`
* 🧰 DSL support for code analysis, linting, and interactive debugging

---

### \\[Why It Matters]

* **Visual Debuggability**: Most LLMs have invisible reasoning chains. This gives them a *visible, inspectable mind*.
* **Persistence**: Snapshots of the system are serializable and restorable.
* **Composability**: You can build up logic incrementally with macros and partial imports.
* **Tooling Potential**: Linters, analyzers, and static checkers can reason about field state changes, cognitive loops, and permission gates.

---

### \\[Core Syntax Example]

```lisp
(memory-state
  (import "core/layer1.sibilant")
  (import "agents/common-thoughts")

  (layer 1
    (field :uptime 1000)
    (field :resources (cpu 0.6) (ram 0.3))
    (pulse "heartbeat"))

  (layer 2
    (permission-check
      (if (user.trust < 0.5)
          (deny "access.restricted"))))

  (daimo "alignment-monitor"
    (trigger (layer 4 "alignment.score" < 0.6))
    (action (realign "layer4"))
    (log "realigning due to low alignment score"))

  (eidolon-field :survival
    (node "system-critical" (mass 1.0) (vector (1 0 0 0 0 0 0 0))))

  ;; Traceable thoughts
  (thought-sequence
    (when (memory.contains "user.command")
          (execute-command (memory.get "user.command"))))

  (meta-log "System stable. Ready for extension.")
)
```

---

### \\[Features to Build]

* `on-layer-change ...` — reactive macros
* `visualize "eidolon/survival"` — hook to UI rendering
* `export-json` / `import-json` for external IO
* Lint rule: "Daimo must declare mass and at least one field vector"
* Context diff tooling: show what changed between two states

---

This gives you a base to build tooling *around* the AI, not just inside of it. You’re not just making an AI—you're making an operating system for cognition. And with this format, anyone can start building tools, UIs, or even games that interact with the mental state itself.

Want me to mock up a directory structure for this kind of `.prompt.sibilant` world? Or do you want to explore the internal DSL for importing and manipulating memory regions first?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
<<<<<<< HEAD
- [reawakening-duck|Reawakening Duck]
- [field-node-diagram-set]
- [fnord-tracer-protocol|Fnord Tracer Protocol]
- [functional-embedding-pipeline-refactor|Functional Embedding Pipeline Refactor]
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [eidolon-field-abstract-model|Eidolon Field Abstract Model]
- [docs/unique/ripple-propagation-demo|ripple-propagation-demo]
- [unique-info-dump-index|Unique Info Dump Index]
- [windows-tiling-with-autohotkey]
- [promethean-eidolon-synchronicity-model|Promethean_Eidolon_Synchronicity_Model]
- [smoke-resonance-visualizations|Smoke Resonance Visualizations]
- [field-node-diagram-outline]
- field-node-diagram-visualizations$field-node-diagram-visualizations.md
- [graph-ds]
- [heartbeat-fragment-demo]
- [i3-bluetooth-setup]
- komorebi-group-window-hack$komorebi-group-window-hack.md
- [promethean-copilot-intent-engine]
- [promethean-infrastructure-setup|Promethean Infrastructure Setup]
- [provider-agnostic-chat-panel-implementation|Provider-Agnostic Chat Panel Implementation]
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [docs/unique/field-interaction-equations|field-interaction-equations]
- [docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]
- [ducks-attractor-states|Duck's Attractor States]
## Sources
- [docops-feature-updates#^ref-2792d448-226-0|Docops Feature Updates — L226] (line 226, col 0, score 1)
- [field-node-diagram-outline#^ref-1f32c94a-705-0|field-node-diagram-outline — L705] (line 705, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-719-0|field-node-diagram-set — L719] (line 719, col 0, score 1)
- field-node-diagram-visualizations — L601$field-node-diagram-visualizations.md#^ref-e9b27b06-601-0 (line 601, col 0, score 1)
- [fnord-tracer-protocol#^ref-fc21f824-1060-0|Fnord Tracer Protocol — L1060] (line 1060, col 0, score 1)
- [functional-embedding-pipeline-refactor#^ref-a4a25141-726-0|Functional Embedding Pipeline Refactor — L726] (line 726, col 0, score 1)
- [graph-ds#^ref-6620e2f2-996-0|graph-ds — L996] (line 996, col 0, score 1)
- [heartbeat-fragment-demo#^ref-dd00677a-667-0|heartbeat-fragment-demo — L667] (line 667, col 0, score 1)
- [i3-bluetooth-setup#^ref-5e408692-736-0|i3-bluetooth-setup — L736] (line 736, col 0, score 1)
- [ice-box-reorganization#^ref-291c7d91-645-0|Ice Box Reorganization — L645] (line 645, col 0, score 1)
- komorebi-group-window-hack — L739$komorebi-group-window-hack.md#^ref-dd89372d-739-0 (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816]layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0 (line 816, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L60]npu-voice-code-and-sensory-integration.md#^ref-5a02283e-60-0 (line 60, col 0, score 1)
- [obsidian-chatgpt-plugin-integration-guide#^ref-1d3d6c3a-48-0|Obsidian ChatGPT Plugin Integration Guide — L48] (line 48, col 0, score 1)
- [obsidian-chatgpt-plugin-integration#^ref-ca8e1399-71-0|Obsidian ChatGPT Plugin Integration — L71] (line 71, col 0, score 1)
- [docs/unique/obsidian-ignore-node-modules-regex#^ref-ffb9b2a9-107-0|obsidian-ignore-node-modules-regex — L107] (line 107, col 0, score 1)
- [obsidian-task-generation#^ref-9b694a91-72-0|Obsidian Task Generation — L72] (line 72, col 0, score 1)
- [obsidian-templating-plugins-integration-guide#^ref-b39dc9d4-148-0|Obsidian Templating Plugins Integration Guide — L148] (line 148, col 0, score 1)
- [optimizing-command-limitations-in-system-design#^ref-98c8ff62-40-0|Optimizing Command Limitations in System Design — L40] (line 40, col 0, score 1)
- [promethean-notes#^ref-1c4046b5-16-0|Promethean Notes — L16] (line 16, col 0, score 1)
- [promethean-pipelines#^ref-8b8e6103-138-0|Promethean Pipelines — L138] (line 138, col 0, score 1)
- [promethean-requirements#^ref-95205cd3-68-0|promethean-requirements — L68] (line 68, col 0, score 1)
- [promethean-workflow-optimization#^ref-d614d983-18-0|Promethean Workflow Optimization — L18] (line 18, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-148-0|eidolon-field-math-foundations — L148] (line 148, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-36-0|eidolon-node-lifecycle — L36] (line 36, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-166-0|Factorio AI with External Agents — L166] (line 166, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-148-0|field-dynamics-math-blocks — L148] (line 148, col 0, score 1)
- [docs/unique/field-interaction-equations#^ref-b09141b7-153-0|field-interaction-equations — L153] (line 153, col 0, score 1)
- [field-node-diagram-outline#^ref-1f32c94a-118-0|field-node-diagram-outline — L118] (line 118, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-168-0|field-node-diagram-set — L168] (line 168, col 0, score 1)
- field-node-diagram-visualizations — L103$field-node-diagram-visualizations.md#^ref-e9b27b06-103-0 (line 103, col 0, score 1)
- [functional-embedding-pipeline-refactor#^ref-a4a25141-380-0|Functional Embedding Pipeline Refactor — L380] (line 380, col 0, score 1)
- [functional-refactor-of-typescript-document-processing#^ref-1cfae310-194-0|Functional Refactor of TypeScript Document Processing — L194] (line 194, col 0, score 1)
- [chroma-toolkit-consolidation-plan#^ref-5020e892-295-0|Chroma Toolkit Consolidation Plan — L295] (line 295, col 0, score 1)
- [openapi-validation-report#^ref-5c152b08-66-0|OpenAPI Validation Report — L66] (line 66, col 0, score 1)
- plan-update-confirmation — L1076$plan-update-confirmation.md#^ref-b22d79c6-1076-0 (line 1076, col 0, score 1)
- [post-linguistic-transhuman-design-frameworks#^ref-6bcff92c-169-0|Post-Linguistic Transhuman Design Frameworks — L169] (line 169, col 0, score 1)
- [promethean-chat-activity-report#^ref-18344cf9-58-0|Promethean Chat Activity Report — L58] (line 58, col 0, score 1)
- [promethean-data-sync-protocol#^ref-9fab9e76-37-0|Promethean Data Sync Protocol — L37] (line 37, col 0, score 1)
- [promethean-dev-workflow-update#^ref-03a5578f-145-0|Promethean Dev Workflow Update — L145] (line 145, col 0, score 1)
- [promethean-documentation-pipeline-overview#^ref-3a3bf2c9-199-0|Promethean Documentation Pipeline Overview — L199] (line 199, col 0, score 1)
- [promethean-documentation-update#^ref-c0392040-38-0|Promethean Documentation Update — L38] (line 38, col 0, score 1)
- [promethean-documentation-update.txt#^ref-0b872af2-37-0|Promethean Documentation Update — L37] (line 37, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-35-0|Docops Feature Updates — L35] (line 35, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-94-0|Duck's Attractor States — L94] (line 94, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-53-0|Duck's Self-Referential Perceptual Loop — L53] (line 53, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-424-0|Dynamic Context Model for Web Components — L424] (line 424, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-209-0|Eidolon Field Abstract Model — L209] (line 209, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-142-0|eidolon-field-math-foundations — L142] (line 142, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-39-0|eidolon-node-lifecycle — L39] (line 39, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-412-0|Dynamic Context Model for Web Components — L412] (line 412, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-261-0|Eidolon Field Abstract Model — L261] (line 261, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-181-0|eidolon-field-math-foundations — L181] (line 181, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-90-0|eidolon-node-lifecycle — L90] (line 90, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-157-0|Factorio AI with External Agents — L157] (line 157, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-205-0|field-dynamics-math-blocks — L205] (line 205, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-203-0|field-node-diagram-set — L203] (line 203, col 0, score 1)
- field-node-diagram-visualizations — L95$field-node-diagram-visualizations.md#^ref-e9b27b06-95-0 (line 95, col 0, score 1)
- [creative-moments#^ref-10d98225-8-0|Creative Moments — L8] (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0 (line 38, col 0, score 1)
- [Docops Feature Updates — L56]docops-feature-updates-3.md#^ref-cdbd21ee-56-0 (line 56, col 0, score 1)
- [creative-moments#^ref-10d98225-38-0|Creative Moments — L38] (line 38, col 0, score 1)
- [Docops Feature Updates — L51]docops-feature-updates-3.md#^ref-cdbd21ee-51-0 (line 51, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-79-0|Docops Feature Updates — L79] (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77]duckduckgosearchpipeline.md#^ref-e979c50f-77-0 (line 77, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-115-0|Duck's Attractor States — L115] (line 115, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-61-0|Duck's Self-Referential Perceptual Loop — L61] (line 61, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-212-0|Eidolon Field Abstract Model — L212] (line 212, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-150-0|eidolon-field-math-foundations — L150] (line 150, col 0, score 1)
- [graph-ds#^ref-6620e2f2-371-0|graph-ds — L371] (line 371, col 0, score 1)
- [heartbeat-fragment-demo#^ref-dd00677a-141-0|heartbeat-fragment-demo — L141] (line 141, col 0, score 1)
- [homeostasis-decay-formulas#^ref-37b5d236-222-0|homeostasis-decay-formulas — L222] (line 222, col 0, score 1)
- [i3-bluetooth-setup#^ref-5e408692-107-0|i3-bluetooth-setup — L107] (line 107, col 0, score 1)
- [Docops Feature Updates — L85]docops-feature-updates-3.md#^ref-cdbd21ee-85-0 (line 85, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-93-0|Duck's Attractor States — L93] (line 93, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-64-0|Duck's Self-Referential Perceptual Loop — L64] (line 64, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-153-0|Factorio AI with External Agents — L153] (line 153, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-141-0|field-dynamics-math-blocks — L141] (line 141, col 0, score 1)
- [creative-moments#^ref-10d98225-28-0|Creative Moments — L28] (line 28, col 0, score 1)
- [Docops Feature Updates — L65]docops-feature-updates-3.md#^ref-cdbd21ee-65-0 (line 65, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-86-0|Docops Feature Updates — L86] (line 86, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-123-0|Duck's Attractor States — L123] (line 123, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-34-0|Duck's Self-Referential Perceptual Loop — L34] (line 34, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-442-0|Dynamic Context Model for Web Components — L442] (line 442, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-218-0|Eidolon Field Abstract Model — L218] (line 218, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-176-0|eidolon-field-math-foundations — L176] (line 176, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-70-0|eidolon-node-lifecycle — L70] (line 70, col 0, score 1)
- [Docops Feature Updates — L44]docops-feature-updates-3.md#^ref-cdbd21ee-44-0 (line 44, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-61-0|Docops Feature Updates — L61] (line 61, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-99-0|Duck's Attractor States — L99] (line 99, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-80-0|Duck's Self-Referential Perceptual Loop — L80] (line 80, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-405-0|Dynamic Context Model for Web Components — L405] (line 405, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-216-0|Eidolon Field Abstract Model — L216] (line 216, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-189-0|Factorio AI with External Agents — L189] (line 189, col 0, score 1)
- [docs/unique/field-interaction-equations#^ref-b09141b7-172-0|field-interaction-equations — L172] (line 172, col 0, score 1)
- [creative-moments#^ref-10d98225-52-0|Creative Moments — L52] (line 52, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L71]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-71-0 (line 71, col 0, score 1)
- [DuckDuckGoSearchPipeline — L99]duckduckgosearchpipeline.md#^ref-e979c50f-99-0 (line 99, col 0, score 1)
- [creative-moments#^ref-10d98225-53-0|Creative Moments — L53] (line 53, col 0, score 1)
- [creative-moments#^ref-10d98225-33-0|Creative Moments — L33] (line 33, col 0, score 1)
```
=======
```
- [promethean-copilot-intent-engine]
- [mystery-lisp-search-session]
- [ts-to-lisp-transpiler]
- [obsidian-templating-plugins-integration-guide|Obsidian Templating Plugins Integration Guide]
- [optimizing-command-limitations-in-system-design|Optimizing Command Limitations in System Design]

## Sources
- [promethean-copilot-intent-engine#L41|Promethean-Copilot-Intent-Engine — L41] (line 41, col 3, score 0.85)
- [promethean-copilot-intent-engine#L41|Promethean-Copilot-Intent-Engine — L41] (line 41, col 5, score 0.85)
- [mystery-lisp-search-session#L120|mystery-lisp-search-session — L120] (line 120, col 1, score 1)
- [mystery-lisp-search-session#L120|mystery-lisp-search-session — L120] (line 120, col 3, score 1)
- [obsidian-templating-plugins-integration-guide#L91|Obsidian Templating Plugins Integration Guide — L91] (line 91, col 1, score 1)
- [obsidian-templating-plugins-integration-guide#L91|Obsidian Templating Plugins Integration Guide — L91] (line 91, col 3, score 1)
- [optimizing-command-limitations-in-system-design#L33|Optimizing Command Limitations in System Design — L33] (line 33, col 1, score 1)
- [optimizing-command-limitations-in-system-design#L33|Optimizing Command Limitations in System Design — L33] (line 33, col 3, score 1)
- [mystery-lisp-search-session#L125|mystery-lisp-search-session — L125] (line 125, col 1, score 0.93)
- [mystery-lisp-search-session#L125|mystery-lisp-search-session — L125] (line 125, col 3, score 0.93)
- [promethean-copilot-intent-engine#L56|Promethean-Copilot-Intent-Engine — L56] (line 56, col 1, score 1)
- [promethean-copilot-intent-engine#L56|Promethean-Copilot-Intent-Engine — L56] (line 56, col 3, score 1)
- [ts-to-lisp-transpiler#L12|ts-to-lisp-transpiler — L12] (line 12, col 1, score 1)
- [ts-to-lisp-transpiler#L12|ts-to-lisp-transpiler — L12] (line 12, col 3, score 1)
- [promethean-copilot-intent-engine#L63|Promethean-Copilot-Intent-Engine — L63] (line 63, col 1, score 0.95)
- [promethean-copilot-intent-engine#L63|Promethean-Copilot-Intent-Engine — L63] (line 63, col 3, score 0.95)
- [promethean-copilot-intent-engine#L62|Promethean-Copilot-Intent-Engine — L62] (line 62, col 1, score 0.95)
- [promethean-copilot-intent-engine#L62|Promethean-Copilot-Intent-Engine — L62] (line 62, col 3, score 0.95)
- [mystery-lisp-search-session#L126|mystery-lisp-search-session — L126] (line 126, col 1, score 0.99)
- [mystery-lisp-search-session#L126|mystery-lisp-search-session — L126] (line 126, col 3, score 0.99)
```
>>>>>>> stealth/obsidian
$$
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
