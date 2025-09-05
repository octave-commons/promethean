---
uuid: b25be760-256e-4a8a-b34d-867281847ccb
created_at: ripple-propagation-demo.md
filename: ripple-propagation-demo
title: ripple-propagation-demo
description: >-
  Demonstrates how daemon fragments propagate through eidolon fields using a
  feedback loop mechanism, showing ripple effects on layer states and field
  perturbations. The simulation includes field selection heuristics, ripple
  application, and a full tick lifecycle output. This example illustrates the
  interaction between daemon execution and eidolon field dynamics.
tags:
  - ripple-propagation
  - daemon-impact
  - field-perturbation
  - layer-dynamics
  - feedback-loop
  - eidolon-field
  - simulation
  - cognitive-loop
  - layer2
  - fragment-impact
  - causal-trace
  - eidolon-log
---
Note: Consolidated here → ../notes/simulation/ripple-propagation-demo.md ^ref-8430617b-1-0

Alright, we’re going full feedback loop now — daimoi don’t just live and die. They affect the *field* they bind to. Here's how ripple propagation looks, still as messages with Obsidian-style hash tags. ^ref-8430617b-3-0

---

### 🌊 Add Ripple to Daemon Execution

```lisp
(defun compile-fragment-daemon (fragment)
  (lambda ()
    (format t \"[Daemon] Running ~A~%\" fragment)
    (ripple-field-from-daemon fragment)
    (if (> *uptime-tick* (+ 3 (random 5))) :nexus-complete nil)))
```
^ref-8430617b-9-0 ^ref-8430617b-16-0

##### #ripple #eidolon-field #daemon-impact #feedback #layer1to8

---

### 🌐 Ripple Function Logic
 ^ref-8430617b-23-0
```lisp
(defun ripple-field-from-daemon (fragment)
  (let ((field (select-eidolon-field fragment)))
    (format t \"[Field] Ripple applied to ~A~%\" field)
    (apply-field-effect field fragment)))
^ref-8430617b-23-0
```

##### #ripple-effect #eidolon-update #fragment-impact

---

### 🧭 Field Selection Heuristic ^ref-8430617b-36-0

```lisp
(defun select-eidolon-field (fragment)
  (cond
    ((string-match-p \"survival\" fragment) :uptime)
    ((string-match-p \"bonding\" fragment) :permission)
    ((string-match-p \"symbol\" fragment) :logos)
    ((string-match-p \"truth\" fragment) :nemesis)
^ref-8430617b-36-0
    (t :ambient)))
```

##### #eidolon-mapping #semantic-routing #layer-alignment

---
 ^ref-8430617b-52-0
### 🔧 Field Effect Simulation

```lisp
(defun apply-field-effect (field fragment)
^ref-8430617b-52-0
  (format t \"[Eidolon] ~A layer perturbed by: '~A'~%\" field fragment)
  (push (list :fragment fragment :field field :tick *uptime-tick*) *eidolon-fluctuations*))
```

##### #eidolon-fluctuations #layer-perturbation #causal-trace

--- ^ref-8430617b-64-0

### 🧾 Eidolon Log State
^ref-8430617b-64-0 ^ref-8430617b-67-0

```lisp
(defparameter *eidolon-fluctuations* '())
```

##### #eidolon-log #memory #field-trace
 ^ref-8430617b-74-0
---

### 🧠 Full Tick Lifecycle Output (Simulated)

```
^ref-8430617b-74-0
[Heartbeat] Tick 12
[Daemon] Running Social bonding is key to uptime.
[Field] Ripple applied to :permission
[Eidolon] :permission layer perturbed by: 'Social bonding is key to uptime.'
```

##### #simulation #cognitive-loop #layer2 ^ref-8430617b-87-0
 ^ref-8430617b-88-0
--- ^ref-8430617b-89-0

You now have a full round-trip simulation: ^ref-8430617b-91-0

1. Fragment descends. ^ref-8430617b-93-0
2. Daemon is born, bound to a nexus.
3. On each tick, it acts.
4. It perturbs the Eidolon field.
5. It expires, releasing memory. ^ref-8430617b-97-0

Let me know when you're ready to start tracking *compound field effects* — or when we want to analyze how resonance across layers leads to persistent attractors or recursive ideas.

---

Related notes: [[../notes/simulation/fragment-injection-simulation|fragment-injection-simulation]], [[../notes/simulation/heartbeat-fragment-flow|heartbeat-fragment-flow]], [[../notes/simulation/ripple-propagation-flow|ripple-propagation-flow]] [[index|unique/index]]

#tags: #simulation #design
