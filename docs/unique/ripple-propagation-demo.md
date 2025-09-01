---
uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
created_at: ripple-propagation-demo.md
filename: ripple-propagation-demo
description: >-
  Demonstrates ripple propagation in a daemon-execution loop, showing how
  fragments interact with eidolon fields and cause layer perturbations through a
  feedback mechanism.
tags:
  - ripple
  - daemon
  - eidolon
  - field
  - feedback
  - layer
  - propagation
  - simulation
  - perturbation
  - cognitive-loop
related_to_title:
  - heartbeat-fragment-demo
  - heartbeat-simulation-snippets
  - Simulation Demo
  - Unique Info Dump Index
  - Eidolon Field Abstract Model
  - field-node-diagram-set
  - layer-1-uptime-diagrams
  - field-node-diagram-outline
  - eidolon-node-lifecycle
  - promethean-system-diagrams
  - field-node-diagram-visualizations
  - Eidolon-Field-Optimization
  - 2d-sandbox-field
  - aionian-circuit-math
  - eidolon-field-math-foundations
  - archetype-ecs
  - Diagrams
  - DSL
  - Event Bus Projections Architecture
  - 'Agent Tasks: Persistence Migration to DualStore'
  - EidolonField
  - homeostasis-decay-formulas
  - field-dynamics-math-blocks
  - Exception Layer Analysis
  - Factorio AI with External Agents
  - parenthetical-extraction
related_to_uuid:
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - b51e19b4-1326-4311-9798-33e972bf626c
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 51a4e477-1013-4016-bb5a-bd9392e99ed7
references:
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 92
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 79
    col: 1
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 94
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 81
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 9
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 9
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 201
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 201
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 37
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 37
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 115
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 115
    col: 3
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 10
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 10
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 200
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 200
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 38
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 38
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 116
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 116
    col: 3
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 100
    col: 1
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 100
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 87
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 87
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 69
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 69
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 119
    col: 1
    score: 0.93
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 119
    col: 3
    score: 0.93
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 193
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 193
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 243
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 243
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 148
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 148
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 145
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 145
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 33
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 33
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 101
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 101
    col: 3
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 87
    col: 1
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 87
    col: 3
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 107
    col: 1
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 107
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 199
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 199
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 196
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 196
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 35
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 35
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 249
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 249
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 198
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 198
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 195
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 195
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 137
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 137
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 32
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 32
    col: 3
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 152
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 152
    col: 3
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 146
    col: 1
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 146
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 102
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 102
    col: 3
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 138
    col: 1
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 138
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 135
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 135
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 34
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 34
    col: 3
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 149
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 149
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 103
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 103
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 31
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 31
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 100
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 100
    col: 3
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 136
    col: 1
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 136
    col: 3
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 105
    col: 1
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 105
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 157
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 157
    col: 3
    score: 1
  - uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
    line: 34
    col: 1
    score: 1
  - uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
    line: 34
    col: 3
    score: 1
  - uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
    line: 37
    col: 1
    score: 0.94
  - uuid: 51a4e477-1013-4016-bb5a-bd9392e99ed7
    line: 37
    col: 3
    score: 0.94
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 114
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 114
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 116
    col: 1
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 116
    col: 3
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 100
    col: 1
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 100
    col: 3
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 109
    col: 1
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 109
    col: 3
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 127
    col: 1
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 127
    col: 3
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 129
    col: 1
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 129
    col: 3
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 112
    col: 1
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 112
    col: 3
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 117
    col: 1
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 117
    col: 3
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 123
    col: 1
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 123
    col: 3
    score: 0.99
---
Note: Consolidated here → ../notes/simulation/ripple-propagation-demo.md

Alright, we’re going full feedback loop now — daimoi don’t just live and die. They affect the *field* they bind to. Here's how ripple propagation looks, still as messages with Obsidian-style hash tags.

---

### 🌊 Add Ripple to Daemon Execution

```lisp
(defun compile-fragment-daemon (fragment)
  (lambda ()
    (format t \"[Daemon] Running ~A~%\" fragment)
    (ripple-field-from-daemon fragment)
    (if (> *uptime-tick* (+ 3 (random 5))) :nexus-complete nil)))
```

##### #ripple #eidolon-field #daemon-impact #feedback #layer1to8

---

### 🌐 Ripple Function Logic

```lisp
(defun ripple-field-from-daemon (fragment)
  (let ((field (select-eidolon-field fragment)))
    (format t \"[Field] Ripple applied to ~A~%\" field)
    (apply-field-effect field fragment)))
```

##### #ripple-effect #eidolon-update #fragment-impact

---

### 🧭 Field Selection Heuristic

```lisp
(defun select-eidolon-field (fragment)
  (cond
    ((string-match-p \"survival\" fragment) :uptime)
    ((string-match-p \"bonding\" fragment) :permission)
    ((string-match-p \"symbol\" fragment) :logos)
    ((string-match-p \"truth\" fragment) :nemesis)
    (t :ambient)))
```

##### #eidolon-mapping #semantic-routing #layer-alignment

---

### 🔧 Field Effect Simulation

```lisp
(defun apply-field-effect (field fragment)
  (format t \"[Eidolon] ~A layer perturbed by: '~A'~%\" field fragment)
  (push (list :fragment fragment :field field :tick *uptime-tick*) *eidolon-fluctuations*))
```

##### #eidolon-fluctuations #layer-perturbation #causal-trace

---

### 🧾 Eidolon Log State

```lisp
(defparameter *eidolon-fluctuations* '())
```

##### #eidolon-log #memory #field-trace

---

### 🧠 Full Tick Lifecycle Output (Simulated)

```
[Heartbeat] Tick 12
[Daemon] Running Social bonding is key to uptime.
[Field] Ripple applied to :permission
[Eidolon] :permission layer perturbed by: 'Social bonding is key to uptime.'
```

##### #simulation #cognitive-loop #layer2

---

You now have a full round-trip simulation:

1. Fragment descends.
2. Daemon is born, bound to a nexus.
3. On each tick, it acts.
4. It perturbs the Eidolon field.
5. It expires, releasing memory.

Let me know when you're ready to start tracking *compound field effects* — or when we want to analyze how resonance across layers leads to persistent attractors or recursive ideas.

---

Related notes: [[../notes/simulation/fragment-injection-simulation|fragment-injection-simulation]], [[../notes/simulation/heartbeat-fragment-flow|heartbeat-fragment-flow]], [[../notes/simulation/ripple-propagation-flow|ripple-propagation-flow]] [[index|unique/index]]

#tags: #simulation #design
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [EidolonField](eidolonfield.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [parenthetical-extraction](parenthetical-extraction.md)

## Sources
- [heartbeat-fragment-demo — L92](heartbeat-fragment-demo.md#L92) (line 92, col 1, score 1)
- [heartbeat-simulation-snippets — L79](heartbeat-simulation-snippets.md#L79) (line 79, col 1, score 1)
- [heartbeat-fragment-demo — L94](heartbeat-fragment-demo.md#L94) (line 94, col 1, score 1)
- [heartbeat-simulation-snippets — L81](heartbeat-simulation-snippets.md#L81) (line 81, col 1, score 1)
- [Simulation Demo — L9](chunks/simulation-demo.md#L9) (line 9, col 1, score 1)
- [Simulation Demo — L9](chunks/simulation-demo.md#L9) (line 9, col 3, score 1)
- [Eidolon Field Abstract Model — L201](eidolon-field-abstract-model.md#L201) (line 201, col 1, score 1)
- [Eidolon Field Abstract Model — L201](eidolon-field-abstract-model.md#L201) (line 201, col 3, score 1)
- [eidolon-node-lifecycle — L37](eidolon-node-lifecycle.md#L37) (line 37, col 1, score 1)
- [eidolon-node-lifecycle — L37](eidolon-node-lifecycle.md#L37) (line 37, col 3, score 1)
- [field-node-diagram-outline — L115](field-node-diagram-outline.md#L115) (line 115, col 1, score 1)
- [field-node-diagram-outline — L115](field-node-diagram-outline.md#L115) (line 115, col 3, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#L10) (line 10, col 1, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#L10) (line 10, col 3, score 1)
- [Eidolon Field Abstract Model — L200](eidolon-field-abstract-model.md#L200) (line 200, col 1, score 1)
- [Eidolon Field Abstract Model — L200](eidolon-field-abstract-model.md#L200) (line 200, col 3, score 1)
- [eidolon-node-lifecycle — L38](eidolon-node-lifecycle.md#L38) (line 38, col 1, score 1)
- [eidolon-node-lifecycle — L38](eidolon-node-lifecycle.md#L38) (line 38, col 3, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#L116) (line 116, col 1, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#L116) (line 116, col 3, score 1)
- [heartbeat-fragment-demo — L100](heartbeat-fragment-demo.md#L100) (line 100, col 1, score 1)
- [heartbeat-fragment-demo — L100](heartbeat-fragment-demo.md#L100) (line 100, col 3, score 1)
- [heartbeat-simulation-snippets — L87](heartbeat-simulation-snippets.md#L87) (line 87, col 1, score 1)
- [heartbeat-simulation-snippets — L87](heartbeat-simulation-snippets.md#L87) (line 87, col 3, score 1)
- [Unique Info Dump Index — L69](unique-info-dump-index.md#L69) (line 69, col 1, score 1)
- [Unique Info Dump Index — L69](unique-info-dump-index.md#L69) (line 69, col 3, score 1)
- [Unique Info Dump Index — L119](unique-info-dump-index.md#L119) (line 119, col 1, score 0.93)
- [Unique Info Dump Index — L119](unique-info-dump-index.md#L119) (line 119, col 3, score 0.93)
- [aionian-circuit-math — L158](aionian-circuit-math.md#L158) (line 158, col 1, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#L158) (line 158, col 3, score 1)
- [archetype-ecs — L457](archetype-ecs.md#L457) (line 457, col 1, score 1)
- [archetype-ecs — L457](archetype-ecs.md#L457) (line 457, col 3, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 1, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 3, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 1, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 3, score 1)
- [2d-sandbox-field — L193](2d-sandbox-field.md#L193) (line 193, col 1, score 1)
- [2d-sandbox-field — L193](2d-sandbox-field.md#L193) (line 193, col 3, score 1)
- [EidolonField — L243](eidolonfield.md#L243) (line 243, col 1, score 1)
- [EidolonField — L243](eidolonfield.md#L243) (line 243, col 3, score 1)
- [Exception Layer Analysis — L148](exception-layer-analysis.md#L148) (line 148, col 1, score 1)
- [Exception Layer Analysis — L148](exception-layer-analysis.md#L148) (line 148, col 3, score 1)
- [field-dynamics-math-blocks — L145](field-dynamics-math-blocks.md#L145) (line 145, col 1, score 1)
- [field-dynamics-math-blocks — L145](field-dynamics-math-blocks.md#L145) (line 145, col 3, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#L33) (line 33, col 1, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#L33) (line 33, col 3, score 1)
- [field-node-diagram-outline — L101](field-node-diagram-outline.md#L101) (line 101, col 1, score 1)
- [field-node-diagram-outline — L101](field-node-diagram-outline.md#L101) (line 101, col 3, score 1)
- [field-node-diagram-visualizations — L87](field-node-diagram-visualizations.md#L87) (line 87, col 1, score 1)
- [field-node-diagram-visualizations — L87](field-node-diagram-visualizations.md#L87) (line 87, col 3, score 1)
- [heartbeat-fragment-demo — L107](heartbeat-fragment-demo.md#L107) (line 107, col 1, score 1)
- [heartbeat-fragment-demo — L107](heartbeat-fragment-demo.md#L107) (line 107, col 3, score 1)
- [2d-sandbox-field — L199](2d-sandbox-field.md#L199) (line 199, col 1, score 1)
- [2d-sandbox-field — L199](2d-sandbox-field.md#L199) (line 199, col 3, score 1)
- [Eidolon Field Abstract Model — L196](eidolon-field-abstract-model.md#L196) (line 196, col 1, score 1)
- [Eidolon Field Abstract Model — L196](eidolon-field-abstract-model.md#L196) (line 196, col 3, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#L35) (line 35, col 1, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#L35) (line 35, col 3, score 1)
- [EidolonField — L249](eidolonfield.md#L249) (line 249, col 1, score 1)
- [EidolonField — L249](eidolonfield.md#L249) (line 249, col 3, score 1)
- [2d-sandbox-field — L198](2d-sandbox-field.md#L198) (line 198, col 1, score 1)
- [2d-sandbox-field — L198](2d-sandbox-field.md#L198) (line 198, col 3, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#L195) (line 195, col 1, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#L195) (line 195, col 3, score 1)
- [eidolon-field-math-foundations — L137](eidolon-field-math-foundations.md#L137) (line 137, col 1, score 1)
- [eidolon-field-math-foundations — L137](eidolon-field-math-foundations.md#L137) (line 137, col 3, score 1)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#L32) (line 32, col 1, score 1)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#L32) (line 32, col 3, score 1)
- [Event Bus Projections Architecture — L152](event-bus-projections-architecture.md#L152) (line 152, col 1, score 1)
- [Event Bus Projections Architecture — L152](event-bus-projections-architecture.md#L152) (line 152, col 3, score 1)
- [Factorio AI with External Agents — L146](factorio-ai-with-external-agents.md#L146) (line 146, col 1, score 1)
- [Factorio AI with External Agents — L146](factorio-ai-with-external-agents.md#L146) (line 146, col 3, score 1)
- [field-node-diagram-outline — L102](field-node-diagram-outline.md#L102) (line 102, col 1, score 1)
- [field-node-diagram-outline — L102](field-node-diagram-outline.md#L102) (line 102, col 3, score 1)
- [field-node-diagram-set — L138](field-node-diagram-set.md#L138) (line 138, col 1, score 1)
- [field-node-diagram-set — L138](field-node-diagram-set.md#L138) (line 138, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#L135) (line 135, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#L135) (line 135, col 3, score 1)
- [eidolon-node-lifecycle — L34](eidolon-node-lifecycle.md#L34) (line 34, col 1, score 1)
- [eidolon-node-lifecycle — L34](eidolon-node-lifecycle.md#L34) (line 34, col 3, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#L149) (line 149, col 1, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#L149) (line 149, col 3, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#L103) (line 103, col 1, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#L103) (line 103, col 3, score 1)
- [eidolon-node-lifecycle — L31](eidolon-node-lifecycle.md#L31) (line 31, col 1, score 1)
- [eidolon-node-lifecycle — L31](eidolon-node-lifecycle.md#L31) (line 31, col 3, score 1)
- [field-node-diagram-outline — L100](field-node-diagram-outline.md#L100) (line 100, col 1, score 1)
- [field-node-diagram-outline — L100](field-node-diagram-outline.md#L100) (line 100, col 3, score 1)
- [field-node-diagram-set — L136](field-node-diagram-set.md#L136) (line 136, col 1, score 1)
- [field-node-diagram-set — L136](field-node-diagram-set.md#L136) (line 136, col 3, score 1)
- [heartbeat-fragment-demo — L105](heartbeat-fragment-demo.md#L105) (line 105, col 1, score 1)
- [heartbeat-fragment-demo — L105](heartbeat-fragment-demo.md#L105) (line 105, col 3, score 1)
- [homeostasis-decay-formulas — L157](homeostasis-decay-formulas.md#L157) (line 157, col 1, score 1)
- [homeostasis-decay-formulas — L157](homeostasis-decay-formulas.md#L157) (line 157, col 3, score 1)
- [parenthetical-extraction — L34](parenthetical-extraction.md#L34) (line 34, col 1, score 1)
- [parenthetical-extraction — L34](parenthetical-extraction.md#L34) (line 34, col 3, score 1)
- [parenthetical-extraction — L37](parenthetical-extraction.md#L37) (line 37, col 1, score 0.94)
- [parenthetical-extraction — L37](parenthetical-extraction.md#L37) (line 37, col 3, score 0.94)
- [heartbeat-simulation-snippets — L114](heartbeat-simulation-snippets.md#L114) (line 114, col 1, score 1)
- [heartbeat-simulation-snippets — L114](heartbeat-simulation-snippets.md#L114) (line 114, col 3, score 1)
- [heartbeat-simulation-snippets — L116](heartbeat-simulation-snippets.md#L116) (line 116, col 1, score 0.99)
- [heartbeat-simulation-snippets — L116](heartbeat-simulation-snippets.md#L116) (line 116, col 3, score 0.99)
- [heartbeat-simulation-snippets — L100](heartbeat-simulation-snippets.md#L100) (line 100, col 1, score 0.99)
- [heartbeat-simulation-snippets — L100](heartbeat-simulation-snippets.md#L100) (line 100, col 3, score 0.99)
- [heartbeat-simulation-snippets — L109](heartbeat-simulation-snippets.md#L109) (line 109, col 1, score 0.99)
- [heartbeat-simulation-snippets — L109](heartbeat-simulation-snippets.md#L109) (line 109, col 3, score 0.99)
- [heartbeat-fragment-demo — L127](heartbeat-fragment-demo.md#L127) (line 127, col 1, score 1)
- [heartbeat-fragment-demo — L127](heartbeat-fragment-demo.md#L127) (line 127, col 3, score 1)
- [heartbeat-fragment-demo — L129](heartbeat-fragment-demo.md#L129) (line 129, col 1, score 0.99)
- [heartbeat-fragment-demo — L129](heartbeat-fragment-demo.md#L129) (line 129, col 3, score 0.99)
- [heartbeat-fragment-demo — L112](heartbeat-fragment-demo.md#L112) (line 112, col 1, score 0.99)
- [heartbeat-fragment-demo — L112](heartbeat-fragment-demo.md#L112) (line 112, col 3, score 0.99)
- [heartbeat-fragment-demo — L117](heartbeat-fragment-demo.md#L117) (line 117, col 1, score 0.99)
- [heartbeat-fragment-demo — L117](heartbeat-fragment-demo.md#L117) (line 117, col 3, score 0.99)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#L123) (line 123, col 1, score 0.99)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#L123) (line 123, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
