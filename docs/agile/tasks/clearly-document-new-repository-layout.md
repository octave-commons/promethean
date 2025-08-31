---
task-id: TASK-{{YYYYMMDD-hhmmss}}-{{rand4}}
title: <verb> <thing> <qualifier>
state: New
prev:
txn: "{{ISO8601}}-{{rand4}}"
owner: err
priority: p3
size: m
epic: EPC-000
depends_on: []
labels:
  - board:auto
  - lang:ts
due:
links: []
artifacts: []
rationale: <why this matters in 1–4 sentences>
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
tags:
  - task/TASK-{{YYYYMMDD-hhmmss}}-{{rand4}}
  - board/kanban
  - state/New
  - owner/err
  - priority/p3
  - epic/EPC-000
  - "#devops"
  - migration
  - "#architectural-decisions"
  - "#monorepo"
  - "#packages"
  - "#package-manager"
  - "#runtime"
  - "#multiruntime"
---

## Context

- Shared package monolith creep was affecting us in difficult to understand ways
- need a dumb, flat, package based system.
- no more dividing anything up by language, or by runtime, each package declares it's structure in a manifest edn file.
- services are packages that spun up as long running background processes
- everything that is not a package is just a config file
- declarative beats imperative.
- 

## Inputs / Artifacts
- (link or path)

## Definition of Done
- [ ] any reference to the old way of doing things is eradicated
- [ ] The new way of doing things is unavoidable and strictly enforced
- [ ] 

## Plan
1. …
2. …

## Relevent resources

You might find [this] useful while working on this task

## Notes
- …
#accepted
