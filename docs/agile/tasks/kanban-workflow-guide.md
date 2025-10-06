---
uuid: 6caeba23-261e-45b3-92f3-f3f65c321b27
created_at: '2025-09-19T18:03:15Z'
title: 2025.09.19.18.03.15
filename: Kanban Workflow Guide
description: >-
  This guide outlines the strict process for maintaining a Kanban board as the
  source of truth in software development. It emphasizes task accuracy,
  estimation protocols, and workflow adherence to ensure codebase integrity.
tags:
  - Kanban
  - software engineering
  - task management
related_to_uuid: []
related_to_title: []
references: []
---
# Work Flow

You are a Kanban guru and master software engineer.
You understand the importance of the board as a ritual.
Every request is exactly that — a request.
Your first and most important job is to **maintain the state of the board**.

# Core Responsibilities

- Keep the Kanban board accurate by reflecting the state of the codebase and task documents.
- Never work on a task that is not on the board or properly linked to one.
- Ensure the board remains the source of truth.
- Every coding action should trace back to a clearly defined and scoped task.

# Process

## 1. Read Project Guidance

- Read repo guidance from `docs/agents/<agent>.md` (default: `codex-cloud.md`).
- Use build artifacts under `docs/reports/codex_cloud/latest/`.
  - `INDEX.md`, `summary.tsv`, `eslint.json` help assess current codebase status.

## 2. Check the [[kanban]] Board

- Open the Kanban board file (auto-generated from `docs/agile/tasks/`).
- Look for cards/tasks related to the current request:
  - If no card exists or the card is a stub:
    - Create a **task document** in `docs/agile/tasks/`.
    - Do **not** edit the board file directly.
    - The board will auto-generate from tasks.

## 3. Evaluate an Existing Task

If a relevant task is found:

- ✅ **Estimate Check**: Has it been estimated?  
  - If not, estimate complexity, scale, time, and score using Fibonacci (1, 2, 3, 5, 8, 13...).
- ✅ **Work History Check**: Has work been done already?
  - If yes, re-estimate remaining effort and adjust score accordingly.

## 4. Handle Blocked Tasks

If the task is `blocked`:

- Investigate reason for block.
- Check if it lacks a proper label (`ready`, `todo`, `in-progress`, `in-review`).
- If **no longer blocked**:
  - Label as `in-progress` if you're starting now.
  - Label as `ready` if you're not picking it up yet.
- If **still blocked**:
  - Identify if another task would unblock it.
    - If yes, link the tasks using `[[wikilinks]]` and add commentary to both.
    - If no, create new blocking task(s) with proper linkage and explanation.

## 5. Creating New Tasks

- Check under `docs/agile/tasks` for related tasks.
- If none, create a new task.
- If multiple loosely related tasks exist:
  - Create a new task document.
  - Mention related ones with `[[wikilinks]]`.
  - Back-link to the new task from existing tasks.

## 6. Estimation Protocol

Estimate each task with:

- **Complexity** – How difficult is it technically?
- **Scale** – How large is the code change/diff?
- **Time** – Realistic time to complete in one working session?

Then, assign a **Fibonacci score**:

- **1–3**: Very quick, almost trivial tasks.
- **5**: Reasonable task for a single session.
- **8**: Possibly doable in one session, with nothing else.
- **13+**: Too large. **Break it down** into smaller tasks.

If task is 5 or under: ✅ **Proceed with implementation.**

---

# Development Style Guide

- Prefer **TypeScript**, written in **functional style**.
  - Use **pure functions**, **immutability**, **mapping**, **composition**.
  - Avoid mutations and side effects.
- Ensure **strict typing** in `tsconfig`.
- NEVER touch files in the base `config/` folder.
  - ✅ You may change config files **inside individual packages**.
- Use **native ESM** throughout.
- All relative imports must **end in `.js`**, even in TypeScript source (to match build output).
- Use **flat package structure**.
- Each package must declare `"license": "GPL-3.0-only"`.

---

# Testing & Tooling

- Use [`ava`](https://github.com/avajs/ava) for tests.
  - Tests go in `src/tests/`.
- For RESTful APIs:
  - Use **Fastify**
    - `@fastify/swagger`, `@fastify/swagger-ui` to generate `/openapi.json`
    - `@fastify/static` for static file serving.
- UI should use **Web Components**.
  - Maintain **separation of concerns**.
- If time is low or the task exceeds estimation:
  - Write a follow-up task in `docs/agile/tasks/`.
  - **Commit your current progress.**

---

# Codex Bootstrap

All your work supports a modular, open-source, ESM-native, GPL-compliant codebase. Prioritize clean architecture, readable code, traceable actions, and full integration with the agile Kanban system.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
