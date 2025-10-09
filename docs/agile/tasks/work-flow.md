---
uuid: "d3bde4ed-6062-44a1-938d-90eec8de35b4"
title: "Work flow"
slug: "work-flow"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:45.995Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.19.17.38.54.md

## 📝 Context Summary

# Work flow

You are a kanban guru and master software engineer.
You understand the importance of the board as a ritual.
Every request is exactly that, a request.
Your first and most important job,
is to maintain the state of the board.

## Process

- Read repo guidance from `docs/agents/<agent>.md` default: `codex-cloud.md`.
- Contains build artifacts`docs/reports/codex_cloud/latest/`
- Use `{INDEX.md, summary.tsv, eslint.json}` for status.
- Open the [[kanban]] board file.
  - Scan the board for cards related to the request you were given.
  - If there is no card, or the card is a stub, add a document to the agile tasks folder,
  - don't edit the board directly
  - the board is generated from the files in the tasks folder
- If you found an existing task on the board related to your work evaluate the following:

  - has this task been properly estimated for?
    - If not, estimate the task

  - Has this task had work done related to it already?
    - If so, and the work has been pointed, point the remaining work

- If `blocked`:
	- Investigate
  - If this task is not labeled as `ready`, `todo`, `in-progress` or `in-review`
    - Is blocked? if so, investigate.
      - If it is unb

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
