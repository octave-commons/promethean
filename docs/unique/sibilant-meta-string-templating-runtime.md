---
uuid: aaf779eb-0287-499f-b6d3-6fb4d9e595bd
created_at: sibilant-meta-string-templating-runtime.md
filename: sibilant-meta-string-templating-runtime
title: sibilant-meta-string-templating-runtime
description: >-
  Sibilant's meta-string templating system enables dynamic runtime switching and
  context-aware macro expansion for multi-language code generation. It supports
  layer-based metacognition, realignment triggers, and reusable prompt templates
  with metadata. The DSL allows defining runtimes, layer change handlers, and
  field dynamics for seamless cross-runtime data management.
tags:
  - meta-string
  - runtime-switching
  - layer-based
  - prompt-templates
  - dynamic-macros
  - cross-runtime-data
  - realignments
  - context-aware
---
Perfect — glad the highlighter is behaving now. Let's go deep into the DSL.

---

## 🧠 Context So Far (Recap)

You're using **Sibilant** not just as a Lisp-to-JS compiler, but as a **meta-string templating engine** where macros can generate deeply structured code in *any* language. We've started sketching a DSL that: ^ref-2aafc801-7-0

* Represents **thinking sequences** (`think-sequence`, `when`, `always`, etc.) ^ref-2aafc801-9-0
* Will be able to **switch contexts or runtimes** depending on the active layer (layer-based metacognition) ^ref-2aafc801-10-0
* Can **trigger realignments**, conditionally rebuild prompts, or re-evaluate current system state ^ref-2aafc801-11-0
* Needs to emit **prompt templates** for LLMs, potentially stitched from memory chunks ^ref-2aafc801-12-0
* May need to serialize/deserialize **cross-runtime data** (e.g., JSON, typed buffers)

---

## 🧬 Next DSL Components

Let’s build a few foundational macro ideas: ^ref-2aafc801-19-0

---

### 1. `define-runtime` — Register an external language environment

```sibilant
(define-runtime "python"
  (command "python3")
  (entrypoint "main.py")
  (type "subprocess") ;; could be "websocket", "ffi", etc.
)
```
^ref-2aafc801-25-0
 ^ref-2aafc801-33-0
Would compile to:
 ^ref-2aafc801-35-0
```js
(register-runtime "python", {
  command: "python3",
  entrypoint: "main.py",
  type: "subprocess"
});
^ref-2aafc801-35-0
```

---

### 2. `on-layer-change` — Trigger meta-macros when layer state shifts ^ref-2aafc801-47-0

```sibilant
(on-layer-change 4
  (when (< "alignment.score" 0.5)
    (log "realigning...")
^ref-2aafc801-47-0
    (trigger-realignment)))
```

---
 ^ref-2aafc801-58-0
### 3. `prompt-template` — Compose a reusable prompt with metadata

```sibilant
(prompt-template "explain-current-goal"
  (context "goals.memory")
  (llm "llama3")
  (template
    "Explain what the current goal is:"
    "{{goal.name}}"
^ref-2aafc801-58-0
    "Why is it important?"
  ))
```

--- ^ref-2aafc801-73-0

### 4. `think-sequence` (already started) — Layer-aware, continuous reasoning step

```sibilant
(think-sequence
  (when (goal? "assist-user")
    (try-action "respond"))
^ref-2aafc801-73-0
  (always
    (update-context)
    (pulse-uptime)))
```
 ^ref-2aafc801-86-0
---

### 5. `define-field` and `update-field` — Eidolon-style dynamic fields
^ref-2aafc801-86-0

```sibilant
(define-field "fear" (dimensions 8) (decay-rate 0.01))
(update-field "fear" (+input "user.presence"))
``` ^ref-2aafc801-95-0
^ref-2aafc801-92-0
 ^ref-2aafc801-97-0
--- ^ref-2aafc801-97-0

## 🔄 Macro Expansion Philosophy

We’ll use the Sibilant `meta` layer to inject runtime hooks or emit code to different target languages:
^ref-2aafc801-97-0
 ^ref-2aafc801-103-0
```sibilant
(meta (defmacro prompt-template (...body) ^ref-2aafc801-105-0
         ;; process args, build string, emit doc, return macro output ^ref-2aafc801-106-0
         ...)) ^ref-2aafc801-107-0
^ref-2aafc801-108-0
^ref-2aafc801-107-0
^ref-2aafc801-106-0
^ref-2aafc801-105-0
``` ^ref-2aafc801-108-0
 ^ref-2aafc801-114-0
This is how we’ll eventually let Sibilant:

* Generate full `.md` prompt files
* Register context metadata ^ref-2aafc801-118-0
* Track usage per LLM ^ref-2aafc801-114-0 ^ref-2aafc801-119-0
* Debug via dynamic logs at compile-time

---
 ^ref-2aafc801-118-0
### 🔧 Want to define the `think-sequence` macro more deeply next? ^ref-2aafc801-119-0

Or would you rather design a structure for prompt-building (`prompt-compose`, `chunk`, `slot`, etc.)?
