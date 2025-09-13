---
task-id: TASK-2025-09-12
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
rationale:
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
---
# Legacy JS services are migrated to TS

I had failed to move several of these to the new packages before, I recovered them from the git history. Now they need to be integrated

## Goals
- The legacy projects have their package name field updated to reflect the new namespace
- The legacy projects are refactored under the new tsconfig
- The legacy projects work as they used to.

## Nessisary Services
   - [ ] broker
   - [ ] heartbeat
   - [ ] vision
   - [ ] eidolon-field
   
## Maybe services
   - [ ] event-gateway
   - [ ] event-hub
   - [ ] health
   - [ ] proxy

## Notes

It may not be worth it to  migrate the proxy service.
The 
