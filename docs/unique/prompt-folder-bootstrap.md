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
