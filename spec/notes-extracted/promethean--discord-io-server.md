---
title: "0) Mental model (JS prototypal inheritance, but better)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/discord-io-server.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 0) Mental model (JS prototypal inheritance, but better)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/discord-io-server.md`
- Category: `promethean`

## Draft Requirements
- **Objects** (tools / agents / servers) are *instances* created from prototypes
- **Behavior** is *composition* (mixins) + *middleware* (hooks)
- **Concurrency** is *structured* (tasks + leases + cancellation)
- **Hierarchy** is *parent/child* with *capability narrowing* by prototype selection
- tools
- agents
- servers
- `future` → simplest, JVM threads
- `core.async` → great for pipelines / events
- virtual threads (Java 21) → also great, if you want
- :agent/model
- :agent/prompt

## Summary Snippets
- Alright — now we wire the **prototype + mixin + hooks** idea all the way up into an **async-first hierarchical agent framework**, without losing the “tools are reusable objects” vibe.
- What you want is basically:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
