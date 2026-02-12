---
title: "Lock service as a first-class subsystem"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/agent-locks-conflict.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Lock service as a first-class subsystem

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/agent-locks-conflict.md`
- Category: `promethean`

## Draft Requirements
- **resources are owned**
- **ownership is visible**
- **conflicts become conversations**
- **no deadlocks after crashes**
- **agents can keep working around contention**
- Locks are **exclusive-write** (simple first)
- Locks have **TTL + heartbeats** (crash-safe)
- Attempting to use a locked file returns:
- current owner
- existing conflict thread id (or opens one)
- wait position / waiters list
- `state.locks`

## Summary Snippets
- Awesome — **locks + conflict threads** is the piece that turns “multi-agent chaos” into an actual **operating system**.
- What you want is basically:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
