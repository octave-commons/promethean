---
uuid: d262f6ec-43bd-4807-8052-3c4527882b51
created_at: '2025-09-20T12:55:06Z'
title: 2025.09.20.12.55.06
filename: Pair Programming MCP
description: >-
  This document outlines the MCP's workflow for pair programming, detailing the
  four operational modes and the specific tools available for workspace and
  sandbox interactions. It emphasizes additive operations only, with destructive
  operations strictly forbidden to ensure maintainable code history.
tags:
  - pair programming
  - MCP
  - workflow
  - workspace tools
  - sandbox tools
  - additive operations
  - code review
  - driver/navigator
---
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
