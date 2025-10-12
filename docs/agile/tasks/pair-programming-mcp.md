---
uuid: "a38e8b3e-aeb3-4753-9bbd-a8716783cf05"
title: "Pair programming MCP"
slug: "pair-programming-mcp"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-12T02:22:05.425Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🗂 Source

- Path: docs/labeled/2025.09.20.12.55.06.md

## 📝 Context Summary

# Pair programming MCP
The next step is to narrow the scope, sharpen the intent, and design/describe a workflow

The agent will use this tool in 4 different "modes" solo programming, code review, and driver/navigator pair programming mode.

# Top level github api tools advertised by MCP
- create working tree
- open PR
- get PR comments
- get PR review comments
- submit PR comment
- submit PR review /w comments
- get action status
- commit
- push
- checkout branch
- create branch
- revert commits

Additive operations only. Destructive operations are strictly forbidden.
Revert is fine because it leaves a record, it creates a new commit, so it is undoable.
It's additive in that it adds information to the history, even if it removes code from the current branch state.

## Workspace tools
These are tools he has available to interact with my workspace when we are pair programming
- get file event history
- enqueue sandbox job
- read my file
- analyze file
- add comment
- search code files
- search language/library docs

## Sandbox tools
When he is in solo dev or driver pair programming mode
- edit file

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs








































































































