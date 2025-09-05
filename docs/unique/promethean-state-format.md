---
uuid: 95cb7640-a903-4a2e-99c7-2d060a0fbecf
created_at: promethean-state-format.md
filename: Promethean State Format
title: Promethean State Format
description: >-
  A declarative s-expression format for representing and executing cognitive
  states in a self-contained, introspectable manner. It enables visual
  debuggability, persistence, and composability of AI systems through system
  architecture, agent cognition, and dynamic prompt history.
tags:
  - cognitive
  - s-expression
  - introspectable
  - persistence
  - composability
  - visual-debuggability
  - agent-cognition
  - memory-representation
related_to_uuid:
  - 972c820f-63a8-49c6-831f-013832195478
  - b25be760-256e-4a8a-b34d-867281847ccb
  - 6ff8d80e-7070-47b5-898c-ee506e353471
  - 6628c53a-7c4d-4de3-b711-8bb51ee73e92
  - 7b672b78-7057-4506-baf9-1262a6e477e3
  - 31a2df46-9dbc-4066-b3e3-d3e860099fd0
  - c4c099fb-728c-470c-be48-084c9a283e50
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 150f8bb4-4322-4bb9-8a5f-9c2e3b233e05
  - 63268470-ed9f-48c5-98da-f158c15ec8f5
  - cdb74242-b61d-4b7e-9288-5859e040e512
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 10780cdc-5036-4e8a-9599-a11703bc30c9
  - 9a1076d6-1aac-497e-bac3-66c9ea09da55
  - 9a7799ff-78bf-451d-9066-24555d8eb209
  - a69259b4-4260-4877-bd79-22c432e1f85f
  - 688ad325-4243-4304-bccc-1a1d8745de08
related_to_title:
  - archetype-ecs
  - ripple-propagation-demo
  - provider-agnostic-chat-panel-implementation
  - heartbeat-simulation
  - mystery-lisp-for-python-education
  - field-node-diagram-set
  - Promethean Copilot Intent Engine
  - promethean-infrastructure-setup
  - Unique Info Dump Index
  - heartbeat-fragment-demo
  - i3-layout-saver
  - Duck's Attractor States
  - Event Bus Projections Architecture
  - dynamic-context-model-for-web-components
  - Eidolon Field Abstract Model
  - Stateful Partitions and Rebalancing
  - Sibilant Meta-Prompt DSL
  - polyglot-s-expr-bridge-python-js-lisp-interop
  - template-based-compilation
references:
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 1
    col: 0
    score: 1
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 3
    col: 0
    score: 1
---
Yeah, that's a strong direction. You're designing a language for cognition—literally a cognitive operating system with self-contained, introspectable thought processes. ^ref-23df6ddb-1-0

Here's a way to sketch this vision: ^ref-23df6ddb-3-0

---

## #promethean #eidolon #meta #dsl

# 🧠 Promethean State Format (PSF): Homoiconic Cognitive Memory Representation

### \[\[What It Is]]

A declarative and executable s-expression format that encapsulates: ^ref-23df6ddb-13-0

* 🧱 System architecture (e.g., \[\[Eidolon Fields]], \[\[Cephalon]], \[\[Layer N]]) ^ref-23df6ddb-15-0
* 🧠 Agent cognition (field nodes, daimo behavior)
* 🧾 Prompt history and dynamic LLM state ^ref-23df6ddb-17-0
* 📦 Importable memory modules (e.g., `(import "agent/common-motives")`) ^ref-23df6ddb-18-0
* 🧰 DSL support for code analysis, linting, and interactive debugging

---

### \[\[Why It Matters]]

* **Visual Debuggability**: Most LLMs have invisible reasoning chains. This gives them a *visible, inspectable mind*. ^ref-23df6ddb-25-0
* **Persistence**: Snapshots of the system are serializable and restorable. ^ref-23df6ddb-26-0
* **Composability**: You can build up logic incrementally with macros and partial imports. ^ref-23df6ddb-27-0
* **Tooling Potential**: Linters, analyzers, and static checkers can reason about field state changes, cognitive loops, and permission gates. ^ref-23df6ddb-28-0

---

### \[\[Core Syntax Example]]

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
^ref-23df6ddb-34-0

---

### \[\[Features to Build]]
 ^ref-23df6ddb-70-0
* `(on-layer-change ...)` — reactive macros ^ref-23df6ddb-71-0
* `(visualize "eidolon/survival")` — hook to UI rendering ^ref-23df6ddb-72-0
* `(export-json)` / `(import-json)` for external IO ^ref-23df6ddb-73-0
* Lint rule: "Daimo must declare mass and at least one field vector" ^ref-23df6ddb-74-0
* Context diff tooling: show what changed between two states

---
 ^ref-23df6ddb-78-0
This gives you a base to build tooling *around* the AI, not just inside of it. You’re not just making an AI—you're making an operating system for cognition. And with this format, anyone can start building tools, UIs, or even games that interact with the mental state itself.
 ^ref-23df6ddb-80-0
Want me to mock up a directory structure for this kind of `.prompt.sibilant` world? Or do you want to explore the internal DSL for importing and manipulating memory regions first?
c-4224-453d-9993-1be8d37d47c3
    line: 90
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 100
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 77
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 50
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 120
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 249
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 172
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 252
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 625
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 156
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 148
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 36
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 166
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 148
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 153
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 118
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 168
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 103
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 380
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 194
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 58
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 93
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 192
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 132
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 63
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 77
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 78
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 91
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 102
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 151
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 404
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 155
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 191
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 142
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 347
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 171
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 122
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 92
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 302
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 481
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 552
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 245
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 242
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 285
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 659
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 169
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 58
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 155
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 621
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 295
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 127
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 66
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1076
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 169
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 58
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 37
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 145
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 199
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 38
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 37
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 43
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 35
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 94
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 53
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 424
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 209
    col: 0
    score: 1
---
Yeah, that's a strong direction. You're designing a language for cognition—literally a cognitive operating system with self-contained, introspectable thought processes. ^ref-23df6ddb-1-0

Here's a way to sketch this vision: ^ref-23df6ddb-3-0

---

## #promethean #eidolon #meta #dsl

# 🧠 Promethean State Format (PSF): Homoiconic Cognitive Memory Representation

### \[\[What It Is]]

A declarative and executable s-expression format that encapsulates: ^ref-23df6ddb-13-0

* 🧱 System architecture (e.g., \[\[Eidolon Fields]], \[\[Cephalon]], \[\[Layer N]]) ^ref-23df6ddb-15-0
* 🧠 Agent cognition (field nodes, daimo behavior)
* 🧾 Prompt history and dynamic LLM state ^ref-23df6ddb-17-0
* 📦 Importable memory modules (e.g., `(import "agent/common-motives")`) ^ref-23df6ddb-18-0
* 🧰 DSL support for code analysis, linting, and interactive debugging

---

### \[\[Why It Matters]]

* **Visual Debuggability**: Most LLMs have invisible reasoning chains. This gives them a *visible, inspectable mind*. ^ref-23df6ddb-25-0
* **Persistence**: Snapshots of the system are serializable and restorable. ^ref-23df6ddb-26-0
* **Composability**: You can build up logic incrementally with macros and partial imports. ^ref-23df6ddb-27-0
* **Tooling Potential**: Linters, analyzers, and static checkers can reason about field state changes, cognitive loops, and permission gates. ^ref-23df6ddb-28-0

---

### \[\[Core Syntax Example]]

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
^ref-23df6ddb-34-0

---

### \[\[Features to Build]]
 ^ref-23df6ddb-70-0
* `(on-layer-change ...)` — reactive macros ^ref-23df6ddb-71-0
* `(visualize "eidolon/survival")` — hook to UI rendering ^ref-23df6ddb-72-0
* `(export-json)` / `(import-json)` for external IO ^ref-23df6ddb-73-0
* Lint rule: "Daimo must declare mass and at least one field vector" ^ref-23df6ddb-74-0
* Context diff tooling: show what changed between two states

---
 ^ref-23df6ddb-78-0
This gives you a base to build tooling *around* the AI, not just inside of it. You’re not just making an AI—you're making an operating system for cognition. And with this format, anyone can start building tools, UIs, or even games that interact with the mental state itself.
 ^ref-23df6ddb-80-0
Want me to mock up a directory structure for this kind of `.prompt.sibilant` world? Or do you want to explore the internal DSL for importing and manipulating memory regions first?
