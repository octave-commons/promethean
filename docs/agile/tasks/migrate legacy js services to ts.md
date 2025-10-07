---
uuid: "907f268b-ced3-4206-aa3e-82b56dc811a1"
title: "<verb> <thing> <qualifier> :auto :ts"
slug: "migrate legacy js services to ts"
status: "breakdown"
priority: "p3"
labels: ["board", "lang"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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



