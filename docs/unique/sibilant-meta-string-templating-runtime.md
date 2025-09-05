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
related_to_uuid:
  - 3abeaf12-5a59-45f1-80d8-82b031b84b96
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 033f4d79-efaa-4caf-a193-9022935b8194
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - ee4b3631-a745-485b-aff1-2da806cfadfb
  - 0444fe9c-20cf-4b64-8cc4-fc37b59450cb
  - b46a41c5-8e85-4363-aec9-1aaa42694078
  - 9a7799ff-78bf-451d-9066-24555d8eb209
  - 10780cdc-5036-4e8a-9599-a11703bc30c9
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - fea4239d-8a60-479a-8eca-eb1ba09861ea
  - 45d70390-0334-422e-b487-4499b1424936
  - cd8f10e6-68d7-4b29-bdfd-3a6614d99229
  - 31a2df46-9dbc-4066-b3e3-d3e860099fd0
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 8fd08696-5338-493b-bed5-507f8a6a6ea9
  - 3657117f-241d-4ab9-a717-4a3f584071fc
  - e4317155-7fa6-44e8-8aee-b72384581790
  - a23de044-17e0-45f0-bba7-d870803cbfed
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
related_to_title:
  - sibilant-metacompiler
  - template-based-compilation
  - schema-evolution-workflow
  - dynamic-context-model-for-web-components
  - Prompt Programming Language for LLMs
  - sibilant-macro-targets
  - Promethean Documentation Pipeline Overview
  - Recursive Prompt Construction Engine
  - Org-Babel Matplotlib Animation Template
  - Sibilant Meta-Prompt DSL
  - Eidolon Field Abstract Model
  - chroma-embedding-refactor
  - board-walk-2025-08-11
  - promethean-native-config-design
  - AI-Centric OS with MCP Layer
  - Synchronicity Waves and Web
  - Semantic-Code-Commit-Optimization
  - promethean-agent-config-dsl
  - field-node-diagram-set
  - heartbeat-fragment-demo
  - typed-struct-compiler
  - language-agnostic-mirror-system
  - TypeScript Patch for Tool Calling Support
  - Komorebi Group Manager
  - polyglot-repl-interface-layer
references:
  - uuid: 3abeaf12-5a59-45f1-80d8-82b031b84b96
    line: 5
    col: 0
    score: 0.87
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 44
    col: 0
    score: 0.85
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

    col: 0
    score: 0.89
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 413
    col: 0
    score: 0.89
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 215
    col: 0
    score: 0.89
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 189
    col: 0
    score: 0.89
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 562
    col: 0
    score: 0.89
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 365
    col: 0
    score: 0.89
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 299
    col: 0
    score: 0.89
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 373
    col: 0
    score: 0.88
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 450
    col: 0
    score: 0.88
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 314
    col: 0
    score: 0.88
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 490
    col: 0
    score: 0.88
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 0.87
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.87
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 185
    col: 0
    score: 0.86
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 44
    col: 0
    score: 0.86
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.86
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 876
    col: 0
    score: 0.86
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 611
    col: 0
    score: 0.86
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 937
    col: 0
    score: 0.86
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 641
    col: 0
    score: 0.86
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 703
    col: 0
    score: 0.86
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 640
    col: 0
    score: 0.86
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1048
    col: 0
    score: 0.86
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 956
    col: 0
    score: 0.86
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1412
    col: 0
    score: 0.86
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 895
    col: 0
    score: 0.86
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.85
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
