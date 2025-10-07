---
task-id: TASK-{{YYYYMMDD-hhmmss}}-{{rand4}}
title: "<verb> <thing> <qualifier>"
state: New
prev:
```
txn: "{{ISO8601}}-{{rand4}}"
```
owner: err
priority: p3
size: m
```
epic: EPC-000
```
```
depends_on: []
```
labels: ["board:auto", "lang:ts"]
due:
links: []
artifacts: []
rationale: "<why this matters in 1–4 sentences>"
```
proposed_transitions: ["New->Accepted","Accepted->Breakdown"]
```
tags:
  - task/TASK-{{YYYYMMDD-hhmmss}}-{{rand4}}
  - board/kanban
  - state/New
  - owner/err
  - priority/p3
  - epic/EPC-000
---

## Context
- What changed?
- Where?
- Why now?

## Inputs / Artifacts
- (link or path)

## Definition of Done
- [ ] test X passes
- [ ] doc Y updated
- [ ] PR merged: <link>

## Plan
1. …
2. …

## Relevent resources

You might find [this] useful while working on this task

## Notes
- …
```
-
``````smart-connections
{
  "render_markdown": true,
  "show_full_path": false,
  "exclude_blocks_from_source_connections": false,
  "exclude_frontmatter_blocks": true,
  "expanded_view": false,
  "results_limit": "20",
  "exclude_inlinks": false,
  "exclude_outlinks": false
}
```
