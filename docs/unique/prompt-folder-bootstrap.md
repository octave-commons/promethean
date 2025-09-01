---
uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
created_at: 2025.07.31.16.07.75.md
filename: Prompt_Folder_Bootstrap
description: >-
  A purpose-driven directory structure for organizing agent prompts, with
  templates, history, tasks, scratch, meta, and seed folders for cognitive
  growth and task management.
tags:
  - prompt
  - directory
  - structure
  - agent
  - templates
  - history
  - tasks
  - scratch
  - meta
  - seed
related_to_title:
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - Chroma Toolkit Consolidation Plan
  - Promethean Event Bus MVP v0.1
  - Agent Reflections and Prompt Evolution
  - Promethean-native config design
  - prompt-programming-language-lisp
  - Board Walk – 2025-08-11
  - 'Agent Tasks: Persistence Migration to DualStore'
  - archetype-ecs
  - aionian-circuit-math
  - JavaScript
  - ecs-offload-workers
  - Event Bus MVP
  - Dynamic Context Model for Web Components
  - eidolon-field-math-foundations
  - Event Bus Projections Architecture
  - Voice Access Layer Design
  - Cross-Language Runtime Polymorphism
  - Obsidian ChatGPT Plugin Integration Guide
  - heartbeat-simulation-snippets
  - Obsidian ChatGPT Plugin Integration
  - template-based-compilation
  - Sibilant Meta-Prompt DSL
  - Migrate to Provider-Tenant Architecture
  - Unique Info Dump Index
  - prom-lib-rate-limiters-and-replay-api
  - WebSocket Gateway Implementation
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - d41a06d1-613e-4440-80b7-4553fc694285
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 54382370-1931-4a19-a634-46735708a9ea
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - e811123d-5841-4e52-bf8c-978f26db4230
references: []
---
Got it—folder-based structure instead of file suffixes. That gives us much more room for layered growth and agent-specific behavior. Here's a refined plan that structures `docs/prompts/` into **purpose-driven folders**, each with its own philosophy and use case.

We’ll treat `AGENTS.md` as the **index, manifesto, and onboarding file** for this whole area of the project.

---

# 🔧 `docs/prompts/` Directory Layout

This folder is your **cognitive playground**. A map of mental states, patterns, and evolutionary paths. Each subfolder below is a *region* in this mental terrain.

---

## 📁 `templates/`

> **Reusable prompt structures.**
> "How do we normally talk to this kind of agent, model, or subtask?"

**Contents:**

* Prompt blueprints for different use cases: test-writing, refactoring, bug triage, etc.
* Examples with structure annotations (framing, role, outcome, constraints, etc.).
* Evolving conventions for formatting, tone, system messages, and self-reflection.

**Usage:**

* Agents should *start here* when unsure how to prompt themselves.
* Generate new task prompts by adapting these.

---

## 📁 `history/`

> **Past prompts and their outcomes.**
> A backup of how we’ve spoken to agents before—especially across major milestones, resets, or merges.

**Contents:**
![](../../Prompt_Folder_Bootstrap.csv)
* Prompt transcripts or summaries from key sessions.
* Prompts that led to meaningful breakthroughs or failures.
* Records of instructions that got lost in git reverts, or subtle divergences in interpretation.

**Usage:**
![](../../Prompt_Folder_Bootstrap.csv)
* Use this as a memory vault.
* Agents can review how similar prompts have worked in the past.
* You can refer to it when debugging regressions in agent behavior.

---

## 📁 `tasks/`

> **Current or proposed agent-facing task prompts.**
> When you give an agent a job to do, it gets written here. These are prompt-based versions of Kanban tasks.

**Contents:**

* One file per task (named after the task or ticket).
* Full context, constraints, and links to code/docs/board items.
* Clear expectations and outcomes.
* Often includes fields like:

  * `agent_role: "codex"`
  * `priority: high`
  * `related: agile/tasks/foo.md`

**Usage:**

* You write here when you want the agent to tackle something non-trivial.
* Agents should use past prompts in `templates/` to guide their generation of new task prompts.

---

## 📁 `scratch/`

> **Raw ideas, unfinished threads, free associations.**
> Not all prompts are formal. Some are sparks. This is where they land.

**Contents:**

* Freeform writing to the agent.
* Emotional venting. Meta reflection.
* “I don’t know how to say this yet, but…”

**Usage:**

* You write here when you're thinking out loud.
* Agents can scan this for vibes and unfinished ideas to revisit later.
* Can be mined for future tasks or templates.

---

## 📁 `meta/`

> **Prompt analysis and cognitive reflections.**
> Why did a prompt work or fail? What did we learn from it?

**Contents:**

* Post-mortems.
* Pattern mining from successful or failed prompt sessions.
* Discussions of language, tone, prompt engineering theory.

**Usage:**

* Both you and agents can write here.
* Improves the agent’s ability to self-grade, self-edit, and grow.
* Helps evolve the system’s prompt literacy.

---

## 📁 `seed/`

> **Scaffold prompts for future use.**
> Drafts or fragments that are meant to be extended later.

**Contents:**

* Barebones prompt shells.
* TODO-laden guides waiting for final context.
* Stuff like:

  ```md
  # Scaffold: Setup a new test harness
  agent_role: codex
  priority: med
  context: Add test coverage to new service
  status: DRAFT
  ```

**Usage:**

* Acts as a prompt todo list.
* Encourages generative reuse by agents.
* Good starting point for agents proposing new task files.

---

## 📁 `agents/`

> **Per-agent instruction sets and inner models.**
> This is how we teach each unique agent to see the world.

**Contents:**

* Files like:

  * `duck.md` (voice interface, emotional cognition, field resonance)
  * `codex.md` (test writing, documentation, debugging)
  * `scribe.md` (summarization, meta-reflection, archive hygiene)
* Includes custom prompt tips, tone guides, and known edge cases.

**Usage:**

* Direct reference during prompt generation.
* Gives each agent a stronger sense of self.

---

## Optional: 📁 `layers/` (if tied into Eidolon circuit model)

> A prompt perspective aligned with layered cognition.
> Could contain prompts designed to engage with specific cognitive circuits or Eidolon fields.

---

## Root: `AGENTS.md`

Acts as the **index and onboarding** file, explaining this whole system.
It contains:

* Why this folder exists.
* Philosophy of prompt-driven cognition.
* The structure and how to grow it.
* Instructions to agents on how to prompt themselves.
* Warnings about fragility (reverts, state loss) and how to recover.
* Expectations for self-reflective agent behavior.

---

Would you like me to turn this into an actual `AGENTS.md` content body and bootstrap each of the folders with an `_index.md` or `README.md` explaining its purpose?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [archetype-ecs](archetype-ecs.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [JavaScript](chunks/javascript.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [template-based-compilation](template-based-compilation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
