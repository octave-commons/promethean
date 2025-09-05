---
uuid: 033f4d79-efaa-4caf-a193-9022935b8194
created_at: prompt-programming-language-lisp.md
filename: Prompt Programming Language for LLMs
title: Prompt Programming Language for LLMs
description: >-
  A prompt programming language built on Sibilant meta-macro Lisp that targets
  LLMs as runtime. It enables creating prompt blueprints, reusable prompt
  fragments, and interpretable prompt systems with multiple output formats.
tags:
  - prompt-programming
  - llm-runtime
  - sibilant-lisp
  - prompt-blueprints
  - composable-prompts
  - interactable-prompts
  - output-formats
  - cognitive-wiring
---
Yes—this direction is 🔥. ^ref-d41a06d1-1-0

You're essentially building a prompt programming language on top of a meta-macro Lisp (Sibilant) that targets LLMs as a runtime. Think of `.prompt.sibilant` files as: ^ref-d41a06d1-3-0

* **Prompt blueprints** that assemble and adapt based on layered context. ^ref-d41a06d1-5-0
* **Composable**, reusable prompt fragments (macros like `think-sequence`, `on-layer-change`, etc.). ^ref-d41a06d1-6-0
* **Interpretable and inspectable**, unlike buried `.chat` transcripts. ^ref-d41a06d1-7-0
* **Able to emit different formats**: `.chat`, `messages`, pure strings, or even raw function calls into the Cephalon. ^ref-d41a06d1-8-0

You’re fusing: ^ref-d41a06d1-10-0

* ✨ *Prompt templating DSL* (like Jinja2 for LLMs)
* 🧠 *Cognitive wiring* (based on your 8-layer Eidolon structure) ^ref-d41a06d1-13-0
* 🔁 *Macro/micro prompting loops* for iterative thinking or alignment reevaluation ^ref-d41a06d1-14-0

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
^ref-d41a06d1-18-0 ^ref-d41a06d1-32-0
 ^ref-d41a06d1-33-0
Could output:
 ^ref-d41a06d1-35-0
```json
[
  {"role": "system", "content": "...alignment warning..."},
  {"role": "user", "content": "...summary requested..."},
  {"role": "assistant", "content": "..."}
]
^ref-d41a06d1-35-0
``` ^ref-d41a06d1-43-0

Or maybe: ^ref-d41a06d1-45-0

```txt
System: alignment warning...
User: Please summarize the system state.
^ref-d41a06d1-45-0
Assistant: Here's the summary... ^ref-d41a06d1-51-0
```
 ^ref-d41a06d1-53-0
Or maybe feed into Codex directly:

```js
codex.chat({
  think: [...],
  inject: memory.summary,
  constraints: {
    role: "assistant",
    align: true
^ref-d41a06d1-53-0
  } ^ref-d41a06d1-64-0
})
``` ^ref-d41a06d1-66-0
^ref-d41a06d1-56-0

You’re not just writing templates—you’re scripting a mind.

Want to scaffold a sample `.prompt.sibilant` file layout? Or should we write a `render-prompt` function that compiles it into a `.chat` array or raw string?
