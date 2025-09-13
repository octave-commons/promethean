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

I had failed to move several of these to the new packages before, I reoc
## Services
   - [ ] broker
   - [ ] eidolon-field
   - [ ] eslint.config.js
   - [ ] event-gateway
   - [ ] event-hub
   - [ ] health
   - [ ] heartbeat
   - [ ] proxy
   - [ ] vision
