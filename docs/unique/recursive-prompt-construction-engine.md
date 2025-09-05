---
uuid: 0444fe9c-20cf-4b64-8cc4-fc37b59450cb
created_at: recursive-prompt-construction-engine.md
filename: Recursive Prompt Construction Engine
title: Recursive Prompt Construction Engine
description: >-
  A self-expanding prompt system that dynamically generates new prompts from
  previous LLM outputs, using prompt fragments and memory to build recursive,
  reflective prompt trees. It enables meta-cognition by having the LLM construct
  its own next prompts through iterative cycles of extraction, assembly, and
  evaluation.
tags:
  - recursive prompts
  - prompt engineering
  - meta-cognition
  - prompt memory
  - self-improving systems
---
**Understood.** ^ref-babdb9eb-1-0
We're not just compiling prompts — we’re *growing them*. Dynamically. Reflexively. Using previous LLM calls to synthesize new prompts.

You're asking for a **recursive, reflective prompt assembly system** — a self-expanding prompt tree, where: ^ref-babdb9eb-4-0

* Prompts can be generated **by LLMs** ^ref-babdb9eb-6-0
* Prompt *chunks* are composable ^ref-babdb9eb-7-0
* Metadata is tracked across prompt history ^ref-babdb9eb-8-0
* New prompts can be built from **annotated fragments**, summaries, or embeddings ^ref-babdb9eb-9-0

This is **Layer 3 meets Layer 4** of your architecture. The **symbolic/rational mind building its own query language** to interact with external cognition. ^ref-babdb9eb-11-0

Let’s sketch it. ^ref-babdb9eb-13-0

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
^ref-babdb9eb-21-0

---

## 🧱 Core Mechanisms

### 1. **Prompt Fragment**
 ^ref-babdb9eb-39-0
A prompt fragment is a chunk of meaningful, structured prompt text + metadata.
 ^ref-babdb9eb-41-0
```sibilant
(deffragment summary-block
  :source "agent:duck"
  :content "User is attempting to build cross-runtime prompt compiler"
  :timestamp now
  :tags ["meta" "llm" "promethean"])
^ref-babdb9eb-41-0
``` ^ref-babdb9eb-49-0

This gets stored in `PromptMemory`.

---

### 2. **PromptMemory** ^ref-babdb9eb-55-0

A container of prior fragments. ^ref-babdb9eb-57-0

```sibilant
(defmemory prompt-memory (list summary-block context-hint prompt-a))

(fn recall (filter)
^ref-babdb9eb-57-0
  (filter prompt-memory filter)) ^ref-babdb9eb-64-0
```

Recall strategies might use:

* `tags`
* `source`
* `vector similarity`
* `response confidence`

---
 ^ref-babdb9eb-75-0
### 3. **Meta-LLM Prompt Constructor**
 ^ref-babdb9eb-77-0
Uses LLM itself to generate new prompts from memory fragments:

```sibilant
(defn build-prompt-from (goal)
  (let ((fragments (recall (match :goal goal)))
        (assembled (llm:call
                    (prompt
                      (system "You are a prompt designer.")
                      (user (+ "Assemble a new prompt to achieve this goal: " goal))
                      (examples fragments)
^ref-babdb9eb-77-0
                      :expects "prompt-structure")))) ^ref-babdb9eb-89-0
    (parse-response assembled)))
```

This **uses the LLM to build its own next prompt**. You’ve entered meta-cognition.

--- ^ref-babdb9eb-95-0

### 4. **PromptAssembler DSL**

```sibilant
(defprompt assemble-agent-summary
  :goal "summarize last 3 messages"
  :strategy "chunk + extract + compress"
  :input
    (concat
^ref-babdb9eb-95-0
      (fragment context:recent) ^ref-babdb9eb-106-0
      (fragment logs:conversation)
      (fragment agent:status)))
```

This is declarative. The actual content comes from memory + DSL plumbing.
 ^ref-babdb9eb-112-0
---
 ^ref-babdb9eb-114-0
## 🧠 Reflection + Feedback

Add a feedback loop:

```sibilant
(defn reflect (prompt response)
  (llm:call
    (prompt
      (system "You're a meta-prompt evaluator.")
^ref-babdb9eb-114-0
      (user (+ "Given the prompt: \n\n" prompt ^ref-babdb9eb-125-0
               "\n\nAnd the response:\n\n" response
               "\n\nWhat could improve the prompt?"))
      :expects "critique-summary")))
```
^ref-babdb9eb-127-0

And you store:
^ref-babdb9eb-127-0

```sibilant
(deffragment prompt-critique
  :source "meta"
  :content critique-summary)
^ref-babdb9eb-137-0
```
^ref-babdb9eb-137-0

---

## 🔧 Modular Macro Sketches

```sibilant
(macro prompt (…sections) `(assemble-prompt ,sections))

(macro deffragment (name &metadata)
  `(store-fragment ,name ,metadata))
^ref-babdb9eb-137-0

(macro defmemory (name fragments)
  `(store-memory ,name ,fragments))

(macro defprompt (name &options) ^ref-babdb9eb-154-0
^ref-babdb9eb-156-0 ^ref-babdb9eb-157-0
^ref-babdb9eb-154-0 ^ref-babdb9eb-158-0
  `(compile-structured-prompt ,name ,options)) ^ref-babdb9eb-159-0
^ref-babdb9eb-159-0 ^ref-babdb9eb-161-0
^ref-babdb9eb-158-0
^ref-babdb9eb-157-0
^ref-babdb9eb-156-0
^ref-babdb9eb-154-0
``` ^ref-babdb9eb-156-0
^ref-babdb9eb-147-0
^ref-babdb9eb-159-0 ^ref-babdb9eb-167-0
^ref-babdb9eb-158-0
^ref-babdb9eb-157-0
^ref-babdb9eb-156-0
^ref-babdb9eb-154-0 ^ref-babdb9eb-171-0
^ref-babdb9eb-147-0
 ^ref-babdb9eb-157-0 ^ref-babdb9eb-161-0 ^ref-babdb9eb-167-0 ^ref-babdb9eb-173-0
--- ^ref-babdb9eb-158-0
 ^ref-babdb9eb-159-0
## 🧠 Final Vision ^ref-babdb9eb-176-0
 ^ref-babdb9eb-161-0 ^ref-babdb9eb-171-0
You’re constructing a:
 ^ref-babdb9eb-167-0 ^ref-babdb9eb-173-0
* **Recursive prompt building engine**
* **Semantic memory system**
* **LLM-driven compiler for prompts** ^ref-babdb9eb-176-0 ^ref-babdb9eb-182-0
* **Meta-LLM agent that rewrites its own instructions** ^ref-babdb9eb-167-0 ^ref-babdb9eb-171-0

You’re not building a chatbot. You’re building a **mind** that *thinks about its thoughts* and grows its queries over time. ^ref-babdb9eb-173-0

--- ^ref-babdb9eb-171-0
 ^ref-babdb9eb-176-0 ^ref-babdb9eb-182-0
## 🏷️ Tags ^ref-babdb9eb-173-0

\#sibilant #dsl #promptcompiler #reflection #llm #semanticmemory #metaagent #recursiveprompting #promethean
 ^ref-babdb9eb-176-0
---
 ^ref-babdb9eb-182-0
You want to build `deffragment`, `prompt-memory`, and the first `build-prompt-from` call next? Or define the core data model and memory indexing strategy? We can go either way — just say *deeper*.
