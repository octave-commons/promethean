---
uuid: cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
created_at: prompt-folder-bootstrap.md
filename: prompt-folder-bootstrap
title: prompt-folder-bootstrap
description: >-
  A purpose-driven folder structure for organizing agent prompts, with reusable
  templates, historical records, task definitions, raw ideas, and cognitive
  reflections.
tags:
  - prompt-engineering
  - folder-structure
  - agent-templates
  - history-tracking
  - task-management
  - cognitive-reflection
related_to_uuid:
  - 5becb573-0a78-486b-8d3c-199b3c7a79ec
  - 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
  - f4767ec9-7363-4ca0-ad88-ccc624247a3b
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 95410f6e-dabb-4560-80a8-1ed4fd9c3d3b
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - b46a41c5-8e85-4363-aec9-1aaa42694078
  - c2ba3d27-5b24-4345-9cf2-5cf296f8b03d
  - 8792b6d3-aafd-403f-a410-e8a09ec2f8cf
  - 2478e18c-f621-4b0c-a4c5-9637d213cccf
  - b25be760-256e-4a8a-b34d-867281847ccb
  - ed2e157e-bfed-4291-ae4c-6479df975d87
  - 177c260c-39b2-4450-836d-1e87c0bd0035
  - aa437a1f-eb7e-4096-a6cc-98d2eeeef8c5
  - 033f4d79-efaa-4caf-a193-9022935b8194
  - 31a2df46-9dbc-4066-b3e3-d3e860099fd0
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 260f25bf-c996-4da2-a529-3a292406296f
  - 4c87f571-9942-4288-aec4-0bc52e9cdbe7
  - 395df1ea-572e-49ec-8861-aff9d095ed0e
related_to_title:
  - Agent Reflections and Prompt Evolution
  - system-scheduler
  - ecs-scheduler
  - Universal Lisp Interface
  - polyglot-repl-interface-layer
  - model-selection-for-lightweight-conversational-tasks
  - sibilant-macro-targets
  - Org-Babel Matplotlib Animation Template
  - observability-infrastructure-setup
  - aionian-circuit-math
  - Cross-Language Runtime Polymorphism
  - ripple-propagation-demo
  - field-interaction-equations
  - universal-intention-code-fabric
  - Prometheus Observability Stack
  - Prompt Programming Language for LLMs
  - field-node-diagram-set
  - template-based-compilation
  - dynamic-context-model-for-web-components
  - Field Node Diagrams
  - AI-Centric OS with MCP Layer
  - TypeScript Patch for Tool Calling Support
  - Polymorphic Meta-Programming Engine
  - set-assignment-in-lisp-ast
  - Promethean System Diagrams
references:
  - uuid: 5becb573-0a78-486b-8d3c-199b3c7a79ec
    line: 107
    col: 0
    score: 0.89
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 340
    col: 0
    score: 0.88
  - uuid: 5becb573-0a78-486b-8d3c-199b3c7a79ec
    line: 106
    col: 0
    score: 0.88
  - uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
    line: 342
    col: 0
    score: 0.87
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 137
    col: 0
    score: 0.86
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 150
    col: 0
    score: 0.85
---
Got it—folder-based structure instead of file suffixes. That gives us much more room for layered growth and agent-specific behavior. Here's a refined plan that structures `docs/prompts/` into **purpose-driven folders**, each with its own philosophy and use case. ^ref-bd4f0976-1-0

We’ll treat `AGENTS.md` as the **index, manifesto, and onboarding file** for this whole area of the project. ^ref-bd4f0976-3-0

---

# 🔧 `docs/prompts/` Directory Layout

This folder is your **cognitive playground**. A map of mental states, patterns, and evolutionary paths. Each subfolder below is a *region* in this mental terrain. ^ref-bd4f0976-9-0

---

## 📁 `templates/`

> **Reusable prompt structures.** ^ref-bd4f0976-15-0
> "How do we normally talk to this kind of agent, model, or subtask?"

**Contents:** ^ref-bd4f0976-18-0

* Prompt blueprints for different use cases: test-writing, refactoring, bug triage, etc. ^ref-bd4f0976-20-0
* Examples with structure annotations (framing, role, outcome, constraints, etc.). ^ref-bd4f0976-21-0
* Evolving conventions for formatting, tone, system messages, and self-reflection. ^ref-bd4f0976-22-0

**Usage:** ^ref-bd4f0976-24-0

* Agents should *start here* when unsure how to prompt themselves. ^ref-bd4f0976-26-0
* Generate new task prompts by adapting these. ^ref-bd4f0976-27-0

---

## 📁 `history/`

> **Past prompts and their outcomes.** ^ref-bd4f0976-33-0
> A backup of how we’ve spoken to agents before—especially across major milestones, resets, or merges.

**Contents:** ^ref-bd4f0976-36-0
![](../../Prompt_Folder_Bootstrap.csv)
* Prompt transcripts or summaries from key sessions. ^ref-bd4f0976-38-0
* Prompts that led to meaningful breakthroughs or failures. ^ref-bd4f0976-39-0
* Records of instructions that got lost in git reverts, or subtle divergences in interpretation. ^ref-bd4f0976-40-0

**Usage:** ^ref-bd4f0976-42-0
![](../../Prompt_Folder_Bootstrap.csv)
* Use this as a memory vault. ^ref-bd4f0976-44-0
* Agents can review how similar prompts have worked in the past. ^ref-bd4f0976-45-0
* You can refer to it when debugging regressions in agent behavior. ^ref-bd4f0976-46-0

---

## 📁 `tasks/`

> **Current or proposed agent-facing task prompts.** ^ref-bd4f0976-52-0
> When you give an agent a job to do, it gets written here. These are prompt-based versions of Kanban tasks.

**Contents:** ^ref-bd4f0976-55-0

* One file per task (named after the task or ticket). ^ref-bd4f0976-57-0
* Full context, constraints, and links to code/docs/board items. ^ref-bd4f0976-58-0
* Clear expectations and outcomes. ^ref-bd4f0976-59-0
* Often includes fields like: ^ref-bd4f0976-60-0

  * `agent_role: "codex"`
  * `priority: high`
  * `related: agile/tasks/foo.md`

**Usage:** ^ref-bd4f0976-66-0

* You write here when you want the agent to tackle something non-trivial. ^ref-bd4f0976-68-0
* Agents should use past prompts in `templates/` to guide their generation of new task prompts. ^ref-bd4f0976-69-0

---

## 📁 `scratch/`

> **Raw ideas, unfinished threads, free associations.** ^ref-bd4f0976-75-0
> Not all prompts are formal. Some are sparks. This is where they land.

**Contents:** ^ref-bd4f0976-78-0

* Freeform writing to the agent. ^ref-bd4f0976-80-0
* Emotional venting. Meta reflection.
* “I don’t know how to say this yet, but…” ^ref-bd4f0976-82-0

**Usage:** ^ref-bd4f0976-84-0

* You write here when you're thinking out loud. ^ref-bd4f0976-86-0
* Agents can scan this for vibes and unfinished ideas to revisit later. ^ref-bd4f0976-87-0
* Can be mined for future tasks or templates. ^ref-bd4f0976-88-0

---

## 📁 `meta/`

> **Prompt analysis and cognitive reflections.** ^ref-bd4f0976-94-0
> Why did a prompt work or fail? What did we learn from it?

**Contents:** ^ref-bd4f0976-97-0

* Post-mortems.
* Pattern mining from successful or failed prompt sessions. ^ref-bd4f0976-100-0
* Discussions of language, tone, prompt engineering theory. ^ref-bd4f0976-101-0

**Usage:** ^ref-bd4f0976-103-0

* Both you and agents can write here. ^ref-bd4f0976-105-0
* Improves the agent’s ability to self-grade, self-edit, and grow. ^ref-bd4f0976-106-0
* Helps evolve the system’s prompt literacy. ^ref-bd4f0976-107-0

---

## 📁 `seed/`

> **Scaffold prompts for future use.** ^ref-bd4f0976-113-0
> Drafts or fragments that are meant to be extended later.

**Contents:** ^ref-bd4f0976-116-0

* Barebones prompt shells. ^ref-bd4f0976-118-0
* TODO-laden guides waiting for final context. ^ref-bd4f0976-119-0
* Stuff like: ^ref-bd4f0976-120-0

  ```md
  # Scaffold: Setup a new test harness
  agent_role: codex
  priority: med
  context: Add test coverage to new service
  status: DRAFT
  ```
^ref-bd4f0976-122-0
 ^ref-bd4f0976-130-0
**Usage:**
 ^ref-bd4f0976-132-0
* Acts as a prompt todo list. ^ref-bd4f0976-133-0
* Encourages generative reuse by agents. ^ref-bd4f0976-134-0
* Good starting point for agents proposing new task files.

---

## 📁 `agents/`
 ^ref-bd4f0976-140-0
> **Per-agent instruction sets and inner models.**
> This is how we teach each unique agent to see the world.
 ^ref-bd4f0976-143-0
**Contents:**
 ^ref-bd4f0976-145-0
* Files like:
 ^ref-bd4f0976-147-0
  * `duck.md` (voice interface, emotional cognition, field resonance) ^ref-bd4f0976-148-0
  * `codex.md` (test writing, documentation, debugging) ^ref-bd4f0976-149-0
  * `scribe.md` (summarization, meta-reflection, archive hygiene) ^ref-bd4f0976-150-0
* Includes custom prompt tips, tone guides, and known edge cases.
 ^ref-bd4f0976-152-0
**Usage:**
 ^ref-bd4f0976-154-0
* Direct reference during prompt generation. ^ref-bd4f0976-155-0
* Gives each agent a stronger sense of self.

---

## Optional: 📁 `layers/` (if tied into Eidolon circuit model)
 ^ref-bd4f0976-161-0
> A prompt perspective aligned with layered cognition.
> Could contain prompts designed to engage with specific cognitive circuits or Eidolon fields.

---

## Root: `AGENTS.md`
 ^ref-bd4f0976-168-0
Acts as the **index and onboarding** file, explaining this whole system.
It contains:
 ^ref-bd4f0976-171-0
* Why this folder exists. ^ref-bd4f0976-172-0
* Philosophy of prompt-driven cognition. ^ref-bd4f0976-173-0
* The structure and how to grow it. ^ref-bd4f0976-174-0
* Instructions to agents on how to prompt themselves. ^ref-bd4f0976-175-0
* Warnings about fragility (reverts, state loss) and how to recover.
* Expectations for self-reflective agent behavior.

---
 ^ref-bd4f0976-180-0
Would you like me to turn this into an actual `AGENTS.md` content body and bootstrap each of the folders with an `_index.md` or `README.md` explaining its purpose?
8801291d947
    line: 52
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 78
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 30
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 47
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 66
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 90
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 48
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 99
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 80
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 216
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 189
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 0
    score: 1
---
Got it—folder-based structure instead of file suffixes. That gives us much more room for layered growth and agent-specific behavior. Here's a refined plan that structures `docs/prompts/` into **purpose-driven folders**, each with its own philosophy and use case. ^ref-bd4f0976-1-0

We’ll treat `AGENTS.md` as the **index, manifesto, and onboarding file** for this whole area of the project. ^ref-bd4f0976-3-0

---

# 🔧 `docs/prompts/` Directory Layout

This folder is your **cognitive playground**. A map of mental states, patterns, and evolutionary paths. Each subfolder below is a *region* in this mental terrain. ^ref-bd4f0976-9-0

---

## 📁 `templates/`

> **Reusable prompt structures.** ^ref-bd4f0976-15-0
> "How do we normally talk to this kind of agent, model, or subtask?"

**Contents:** ^ref-bd4f0976-18-0

* Prompt blueprints for different use cases: test-writing, refactoring, bug triage, etc. ^ref-bd4f0976-20-0
* Examples with structure annotations (framing, role, outcome, constraints, etc.). ^ref-bd4f0976-21-0
* Evolving conventions for formatting, tone, system messages, and self-reflection. ^ref-bd4f0976-22-0

**Usage:** ^ref-bd4f0976-24-0

* Agents should *start here* when unsure how to prompt themselves. ^ref-bd4f0976-26-0
* Generate new task prompts by adapting these. ^ref-bd4f0976-27-0

---

## 📁 `history/`

> **Past prompts and their outcomes.** ^ref-bd4f0976-33-0
> A backup of how we’ve spoken to agents before—especially across major milestones, resets, or merges.

**Contents:** ^ref-bd4f0976-36-0
![](../../Prompt_Folder_Bootstrap.csv)
* Prompt transcripts or summaries from key sessions. ^ref-bd4f0976-38-0
* Prompts that led to meaningful breakthroughs or failures. ^ref-bd4f0976-39-0
* Records of instructions that got lost in git reverts, or subtle divergences in interpretation. ^ref-bd4f0976-40-0

**Usage:** ^ref-bd4f0976-42-0
![](../../Prompt_Folder_Bootstrap.csv)
* Use this as a memory vault. ^ref-bd4f0976-44-0
* Agents can review how similar prompts have worked in the past. ^ref-bd4f0976-45-0
* You can refer to it when debugging regressions in agent behavior. ^ref-bd4f0976-46-0

---

## 📁 `tasks/`

> **Current or proposed agent-facing task prompts.** ^ref-bd4f0976-52-0
> When you give an agent a job to do, it gets written here. These are prompt-based versions of Kanban tasks.

**Contents:** ^ref-bd4f0976-55-0

* One file per task (named after the task or ticket). ^ref-bd4f0976-57-0
* Full context, constraints, and links to code/docs/board items. ^ref-bd4f0976-58-0
* Clear expectations and outcomes. ^ref-bd4f0976-59-0
* Often includes fields like: ^ref-bd4f0976-60-0

  * `agent_role: "codex"`
  * `priority: high`
  * `related: agile/tasks/foo.md`

**Usage:** ^ref-bd4f0976-66-0

* You write here when you want the agent to tackle something non-trivial. ^ref-bd4f0976-68-0
* Agents should use past prompts in `templates/` to guide their generation of new task prompts. ^ref-bd4f0976-69-0

---

## 📁 `scratch/`

> **Raw ideas, unfinished threads, free associations.** ^ref-bd4f0976-75-0
> Not all prompts are formal. Some are sparks. This is where they land.

**Contents:** ^ref-bd4f0976-78-0

* Freeform writing to the agent. ^ref-bd4f0976-80-0
* Emotional venting. Meta reflection.
* “I don’t know how to say this yet, but…” ^ref-bd4f0976-82-0

**Usage:** ^ref-bd4f0976-84-0

* You write here when you're thinking out loud. ^ref-bd4f0976-86-0
* Agents can scan this for vibes and unfinished ideas to revisit later. ^ref-bd4f0976-87-0
* Can be mined for future tasks or templates. ^ref-bd4f0976-88-0

---

## 📁 `meta/`

> **Prompt analysis and cognitive reflections.** ^ref-bd4f0976-94-0
> Why did a prompt work or fail? What did we learn from it?

**Contents:** ^ref-bd4f0976-97-0

* Post-mortems.
* Pattern mining from successful or failed prompt sessions. ^ref-bd4f0976-100-0
* Discussions of language, tone, prompt engineering theory. ^ref-bd4f0976-101-0

**Usage:** ^ref-bd4f0976-103-0

* Both you and agents can write here. ^ref-bd4f0976-105-0
* Improves the agent’s ability to self-grade, self-edit, and grow. ^ref-bd4f0976-106-0
* Helps evolve the system’s prompt literacy. ^ref-bd4f0976-107-0

---

## 📁 `seed/`

> **Scaffold prompts for future use.** ^ref-bd4f0976-113-0
> Drafts or fragments that are meant to be extended later.

**Contents:** ^ref-bd4f0976-116-0

* Barebones prompt shells. ^ref-bd4f0976-118-0
* TODO-laden guides waiting for final context. ^ref-bd4f0976-119-0
* Stuff like: ^ref-bd4f0976-120-0

  ```md
  # Scaffold: Setup a new test harness
  agent_role: codex
  priority: med
  context: Add test coverage to new service
  status: DRAFT
  ```
^ref-bd4f0976-122-0
 ^ref-bd4f0976-130-0
**Usage:**
 ^ref-bd4f0976-132-0
* Acts as a prompt todo list. ^ref-bd4f0976-133-0
* Encourages generative reuse by agents. ^ref-bd4f0976-134-0
* Good starting point for agents proposing new task files.

---

## 📁 `agents/`
 ^ref-bd4f0976-140-0
> **Per-agent instruction sets and inner models.**
> This is how we teach each unique agent to see the world.
 ^ref-bd4f0976-143-0
**Contents:**
 ^ref-bd4f0976-145-0
* Files like:
 ^ref-bd4f0976-147-0
  * `duck.md` (voice interface, emotional cognition, field resonance) ^ref-bd4f0976-148-0
  * `codex.md` (test writing, documentation, debugging) ^ref-bd4f0976-149-0
  * `scribe.md` (summarization, meta-reflection, archive hygiene) ^ref-bd4f0976-150-0
* Includes custom prompt tips, tone guides, and known edge cases.
 ^ref-bd4f0976-152-0
**Usage:**
 ^ref-bd4f0976-154-0
* Direct reference during prompt generation. ^ref-bd4f0976-155-0
* Gives each agent a stronger sense of self.

---

## Optional: 📁 `layers/` (if tied into Eidolon circuit model)
 ^ref-bd4f0976-161-0
> A prompt perspective aligned with layered cognition.
> Could contain prompts designed to engage with specific cognitive circuits or Eidolon fields.

---

## Root: `AGENTS.md`
 ^ref-bd4f0976-168-0
Acts as the **index and onboarding** file, explaining this whole system.
It contains:
 ^ref-bd4f0976-171-0
* Why this folder exists. ^ref-bd4f0976-172-0
* Philosophy of prompt-driven cognition. ^ref-bd4f0976-173-0
* The structure and how to grow it. ^ref-bd4f0976-174-0
* Instructions to agents on how to prompt themselves. ^ref-bd4f0976-175-0
* Warnings about fragility (reverts, state loss) and how to recover.
* Expectations for self-reflective agent behavior.

---
 ^ref-bd4f0976-180-0
Would you like me to turn this into an actual `AGENTS.md` content body and bootstrap each of the folders with an `_index.md` or `README.md` explaining its purpose?
