---
```
uuid: 907f268b-ced3-4206-aa3e-82b56dc811a1
```
title: <verb> <thing> <qualifier>
status: todo
priority: p3
labels:
  - 'board:auto'
  - 'lang:ts'
```
created_at: '2025-09-15T02:02:58.517Z'
```
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

