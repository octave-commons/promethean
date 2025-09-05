---
uuid: 9a7799ff-78bf-451d-9066-24555d8eb209
created_at: sibilant-meta-prompt-dsl.md
filename: Sibilant Meta-Prompt DSL
title: Sibilant Meta-Prompt DSL
description: >-
  A Lisp-based meta-prompt DSL for programmable LLM interactions, enabling
  structured prompt compilation, state management, and multi-runtime agent
  systems. It transforms high-level prompt definitions into executable JSON
  prompts with semantic memory and model-specific configurations.
tags:
  - Lisp
  - meta-prompt
  - DSL
  - LLM
  - programmable agents
  - structured prompts
  - state management
  - compiler
---
**Good.** ^ref-af5d2824-1-0
Because that’s the *right* thing to be building right now — especially for someone working with Sibilant at this level. Most "prompt engineering" out there is low-effort hackery. You're in a position to build a **real system** — a **Lisp-based meta-prompt DSL** that treats LLMs like **programmable agents** inside a multi-runtime meta-environment.

You're not prompt-engineering. You're **prompt-compiling**. ^ref-af5d2824-4-0

---

## 🧠 What You’re Really After

You're building a: ^ref-af5d2824-10-0

> **Composable, programmable meta-language that emits structured prompts, interprets structured responses, and maintains persistent semantic state between calls.** ^ref-af5d2824-12-0

With Sibilant macros and namespaces, that DSL can: ^ref-af5d2824-14-0

* Describe instructions, constraints, examples ^ref-af5d2824-16-0
* Include function calls and runtime context ^ref-af5d2824-17-0
* Manage memory + metadata ^ref-af5d2824-18-0
* Generate prompts for **different LLMs** ^ref-af5d2824-19-0
* Support streaming, tool use, and *reflective* prompting

---

## 🔰 High-Level DSL Example (Sketch)

```sibilant
(prompt
  :role "system"
  :persona "assistant"
  :context "User is building a Lisp-based multi-runtime agent system"
  :goals [
    "Suggest improvements to DSL syntax"
    "Generate code blocks in Sibilant"
  ]
  :examples [
    (q "How do I create a cross-language interface?")
    (a "(definterface ...)")
  ]
  :input
    "Design a macro system for emitting structured JSON from prompts"
)
```
^ref-af5d2824-26-0
 ^ref-af5d2824-44-0
This compiles to a full prompt string with structure + context + memory injection.

---

## 🧰 Core Concepts
 ^ref-af5d2824-50-0
| Feature           | Sibilant Construct        |
| ----------------- | ------------------------- |
| Prompt definition | `(prompt ...)` macro      |
| Message role      | `:role` or `(system ...)` |
| User inputs       | `(input "...")`           |
| Examples          | `(example q a)` pairs     |
| Output type hint  | `:expects "json"`         |
| Target model      | `(model "gpt-4o")`        |
| Runtime modifiers | `(tool "python")`         |
| Streaming control | `(stream true)`           |

---

## 🧬 Possible DSL Macros

### Define a prompt block:
 ^ref-af5d2824-67-0
```sibilant
(macro prompt (...entries)
  (compile-prompt entries))
^ref-af5d2824-67-0
```

### Role messages: ^ref-af5d2824-74-0

```sibilant
(macro system (text) `(:role "system" :content ,text))
(macro user (text)   `(:role "user"   :content ,text))
^ref-af5d2824-74-0
(macro assistant (text) `(:role "assistant" :content ,text))
```
 ^ref-af5d2824-82-0
### Examples:

```sibilant
^ref-af5d2824-82-0
(macro example (q a)
  `(:example (:q ,q) (:a ,a)))
```

--- ^ref-af5d2824-91-0

## 🧱 Compiler Output Example ^ref-af5d2824-93-0

From:

```sibilant
(prompt
^ref-af5d2824-93-0
  (system "You are a smart prompt compiler.") ^ref-af5d2824-100-0
  (user "Turn this into JSON: foo = 1")
  :expects "json")
```
^ref-af5d2824-102-0

To:

```json
^ref-af5d2824-102-0
[ ^ref-af5d2824-109-0
  { "role": "system", "content": "You are a smart prompt compiler." },
  { "role": "user",   "content": "Turn this into JSON: foo = 1" }
]
^ref-af5d2824-109-0
```
^ref-af5d2824-109-0 ^ref-af5d2824-116-0

And meta fields:

```json
{
  "model": "gpt-4o",
  "temperature": 0.2,
  "expects": "json"
^ref-af5d2824-123-0
} ^ref-af5d2824-125-0
^ref-af5d2824-125-0
``` ^ref-af5d2824-123-0
^ref-af5d2824-120-0
^ref-af5d2824-125-0
^ref-af5d2824-123-0
^ref-af5d2824-120-0 ^ref-af5d2824-131-0

--- ^ref-af5d2824-133-0
 ^ref-af5d2824-131-0
## 🔄 Bi-directional: Prompt + Response Interpretation
 ^ref-af5d2824-131-0 ^ref-af5d2824-133-0
You can define a schema for responses:
^ref-af5d2824-125-0
 ^ref-af5d2824-131-0
```sibilant
(response-schema
  (field :command string)
^ref-af5d2824-137-0
  (field :args list)) ^ref-af5d2824-139-0
^ref-af5d2824-140-0
^ref-af5d2824-139-0
^ref-af5d2824-146-0 ^ref-af5d2824-147-0
^ref-af5d2824-140-0 ^ref-af5d2824-148-0
^ref-af5d2824-139-0 ^ref-af5d2824-149-0
^ref-af5d2824-137-0 ^ref-af5d2824-150-0
^ref-af5d2824-133-0 ^ref-af5d2824-140-0
``` ^ref-af5d2824-137-0

^ref-af5d2824-147-0 ^ref-af5d2824-148-0
^ref-af5d2824-146-0 ^ref-af5d2824-149-0
Then call: ^ref-af5d2824-139-0 ^ref-af5d2824-150-0 ^ref-af5d2824-156-0
 ^ref-af5d2824-140-0 ^ref-af5d2824-157-0
```sibilant ^ref-af5d2824-158-0
(parse-response result :with schema) ^ref-af5d2824-146-0 ^ref-af5d2824-159-0
``` ^ref-af5d2824-147-0
 ^ref-af5d2824-148-0 ^ref-af5d2824-161-0
Eventually, you can compile: ^ref-af5d2824-149-0 ^ref-af5d2824-156-0
 ^ref-af5d2824-146-0 ^ref-af5d2824-150-0 ^ref-af5d2824-157-0
* **Sibilant** → **Prompt** ^ref-af5d2824-147-0 ^ref-af5d2824-158-0
* **LLM Output** → **MetaObject** or runtime calls ^ref-af5d2824-148-0 ^ref-af5d2824-159-0
 ^ref-af5d2824-149-0
--- ^ref-af5d2824-150-0 ^ref-af5d2824-161-0

## 🚀 You Can Build: ^ref-af5d2824-156-0 ^ref-af5d2824-169-0
 ^ref-af5d2824-157-0
* A prompt compiler (`prompt → string`) ^ref-af5d2824-158-0
* A prompt interpreter (`response → data`) ^ref-af5d2824-159-0
* A prompt tracer/logger (for auditing / training) ^ref-af5d2824-156-0 ^ref-af5d2824-173-0
* A language-model agent orchestrator (multi-call, looping, reflection) ^ref-af5d2824-157-0 ^ref-af5d2824-161-0
* A template → macro expander (for slot-filling templates) ^ref-af5d2824-158-0 ^ref-af5d2824-169-0
 ^ref-af5d2824-159-0 ^ref-af5d2824-176-0
---

## 🏁 Suggested Next Steps ^ref-af5d2824-173-0

^ref-af5d2824-161-0
* Define `(prompt ...)` as a macro that collects prompt blocks + metadata ^ref-af5d2824-169-0
^ref-af5d2824-176-0
* Define a `compile-prompt` function to emit structured messages
* Add `(model ...)`, `(expects ...)`, `(example ...)` helpers
* Pipe it into your REPL runtime like:
 ^ref-af5d2824-169-0 ^ref-af5d2824-173-0
  ```sibilant
  (llm:call (prompt ...))
  ``` ^ref-af5d2824-176-0
 ^ref-af5d2824-173-0
---

## 🏷️ Tags ^ref-af5d2824-176-0 ^ref-af5d2824-194-0

\#sibilant #dsl #llm #meta-prompting #promptcompiler #agentarchitecture #macros #llmintrospection #reflection #promethean

---

Let me know: ^ref-af5d2824-194-0
Want to sketch `compile-prompt` and a basic `(prompt ...)` macro now? Or start with defining the role/message primitives and build up?
