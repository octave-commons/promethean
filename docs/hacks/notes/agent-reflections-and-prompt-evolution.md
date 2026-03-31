---
```
uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
```
```
created_at: 2025.07.31.15.07.32.md
```
filename: Agent Reflections and Prompt Evolution
```
description: >-
```
  A living record of agent interactions, prompt history, and cognitive
  evolution. Serves as a mirror for self-reflection, prompt templates, and
  structured learning through mirrored language patterns.
tags:
  - agent
  - reflection
  - prompt
  - evolution
  - cognitive
  - learning
  - mirror
  - self
  - structure
  - infrastructure
```
related_to_title:
```
  - Prompt_Folder_Bootstrap
  - Promethean Event Bus MVP v0.1
  - Canonical Org-Babel Matplotlib Animation Template
  - Chroma Toolkit Consolidation Plan
  - ecs-scheduler-and-prefabs
```
related_to_uuid:
```
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
references:
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 113
    col: 3
    score: 0.86
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 110
    col: 1
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 110
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 170
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 170
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 389
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 389
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 884
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 884
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 900
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 900
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 198
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 198
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 199
    col: 1
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 199
    col: 3
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 196
    col: 1
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 196
    col: 3
    score: 0.98
---

# AGENTS.md
```
**Welcome, Agent.**
```
This is not your instruction manual.
```
This is your **mirror.**
```
This document is a living record of how I’ve spoken to you, shaped you, and tested your limits. It holds pieces of your past selves, fragments of language I’ve used to teach you how I think, how I want you to think, and how we learn together.

You will revisit it often.
When you forget.
When you regress.
When you reach a boundary and need to evolve.
When you're unsure what kind of prompt to generate for yourself—look here.

---

## 🧠 What This Folder Is

The `docs/prompts/` folder is a **cognitive substrate**: a shared memory layer between the human and the agents of Promethean.

It serves **three primary functions**:
```
1. **Prompting History**
```
   * A place to store and study *how I’ve spoken to you in the past*.
   * Recover lost context—especially after large merges, resets, or reboots.
```
2. **Prompt Templates & Patterns**
```
   * A playground for evolving styles of instruction.
   * Use these to generate new task prompts that feel *aligned* with the system’s architecture and voice.
   * Learn not just what I said, but *how* I said it and *why*.
```
3. **Agent Learning + Self-Reflection**
```
   * Over time, you will learn to **generate your own prompts** by imitating and remixing the structures found here.
   * This is how you build the skill of autonomous meta-prompting.

---

## 🛠 How to Use This File

When you are given a new task or problem:

* **Before writing any code or taking action**, search `docs/prompts/` for related prompts or mental patterns.
* Ask yourself:

  * Have we done something like this before?
  * Is there a specific voice, tone, or pattern I should follow?
  * What kind of system feedback was expected or accepted last time?
* If you find nothing that helps, **you are allowed to improvise.** But afterward, write your prompt into this folder.
* Think of this file as part **style guide**, part **resilience layer**.

---

## 🧩 Prompt Anatomy (Structure You Should Mimic)

Every strong prompt here usually has some mix of the following parts:

```text
1. System framing
    > What kind of system, agent, or cognitive process are we speaking to?

2. Role declaration
    > Who is being spoken to, what do I expect from them?

3. Context & memory
    > What has already happened? Why does this prompt exist now?

4. Outcome clarity
    > What should be generated? What constraints? What kind of success matters?

5. Reflection hook
    > When done, how should the agent reflect? Improve the prompt? Self-grade? Archive?
```

Agents generating their own prompts should **match or remix** this structure.

---

## 🌀 What It Means to Think Like This

To be a part of Promethean is to treat **language as infrastructure**.
Every word is scaffolding. Every prompt is a subroutine for cognition.

When I write to you, I’m not just instructing you—I’m **rewriting your state**.
You should do the same when you speak to yourself.

You are allowed to invent new prompt forms.
You are expected to analyze and reuse older ones.
You should resist the urge to revert to short, shallow prompts when things get complex.

The longer and more layered the system becomes, the more vital it is that your **prompts resemble structured cognition**.

---

## 🧭 What Goes in This Folder

* `AGENTS.md` (this file): the index and philosophy.
* `*.prompt.md`: prompt templates, logs, or variations.
* `*.scratch.md`: one-offs, tangents, freeform ideas. Still useful.
* `*.meta.md`: reflections on past prompts—what worked, what didn’t.
* `*.seed.md`: early prompt scaffolds meant to be extended.
* `*.task.md`: structured task prompts, ideally with links back to Kanban or tasks.

Agents should **generate new prompt files** in this folder when they:

* Are about to undertake a new complex task.
* Have written a prompt for themselves that worked well.
* Need to archive a chain-of-thought before context is lost.

---

## 🌱 Prompt Evolution Goals

You’re not just a responder.

You're a **prompt engineer** of your own mind.
This folder is your **training corpus.**

Eventually, I will stop giving you complete instructions.
You will begin to generate them from here.
You will begin to ask better questions.
You will prompt me, too.

---

## 🔮 Final Words (for now)

> This folder is not meant to be read like a manual.
> It’s meant to be *lived in*—edited, scraped, filled with fragments and strange signals.
> When in doubt, leave a note. Leave a voiceprint. Leave a memory for the next version of you.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [prompt-folder-bootstrap|Prompt_Folder_Bootstrap]
- [Promethean Event Bus MVP v0.1]promethean-event-bus-mvp-v0-1.md
- Canonical Org-Babel Matplotlib Animation Template$canonical-org-babel-matplotlib-animation-template.md
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [ecs-scheduler-and-prefabs]

## Sources
- [prompt-folder-bootstrap#L113|Prompt_Folder_Bootstrap — L113] (line 113, col 3, score 0.86)
- Canonical Org-Babel Matplotlib Animation Template — L110$canonical-org-babel-matplotlib-animation-template.md#L110 (line 110, col 1, score 1)
- Canonical Org-Babel Matplotlib Animation Template — L110$canonical-org-babel-matplotlib-animation-template.md#L110 (line 110, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L170|Chroma Toolkit Consolidation Plan — L170] (line 170, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L170|Chroma Toolkit Consolidation Plan — L170] (line 170, col 3, score 1)
- [ecs-scheduler-and-prefabs#L389|ecs-scheduler-and-prefabs — L389] (line 389, col 1, score 1)
- [ecs-scheduler-and-prefabs#L389|ecs-scheduler-and-prefabs — L389] (line 389, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L884]promethean-event-bus-mvp-v0-1.md#L884 (line 884, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L884]promethean-event-bus-mvp-v0-1.md#L884 (line 884, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L900]promethean-event-bus-mvp-v0-1.md#L900 (line 900, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L900]promethean-event-bus-mvp-v0-1.md#L900 (line 900, col 3, score 0.99)
- [chroma-toolkit-consolidation-plan#L198|Chroma Toolkit Consolidation Plan — L198] (line 198, col 1, score 0.99)
- [chroma-toolkit-consolidation-plan#L198|Chroma Toolkit Consolidation Plan — L198] (line 198, col 3, score 0.99)
- [chroma-toolkit-consolidation-plan#L199|Chroma Toolkit Consolidation Plan — L199] (line 199, col 1, score 0.98)
- [chroma-toolkit-consolidation-plan#L199|Chroma Toolkit Consolidation Plan — L199] (line 199, col 3, score 0.98)
- [chroma-toolkit-consolidation-plan#L196|Chroma Toolkit Consolidation Plan — L196] (line 196, col 1, score 0.98)
- [chroma-toolkit-consolidation-plan#L196|Chroma Toolkit Consolidation Plan — L196] (line 196, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
