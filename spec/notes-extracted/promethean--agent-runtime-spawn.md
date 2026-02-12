---
title: "✅ Core runtime pieces we’re adding now"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/agent-runtime-spawn.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# ✅ Core runtime pieces we’re adding now

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/agent-runtime-spawn.md`
- Category: `promethean`

## Draft Requirements
- **Supervisor tree** (`spawn!`, `stop!`, parent/child relationships)
- **Async message bus** (topology rules: parent/child only by default)
- **Action interpreter** (tool calls / lock acquire / spawn / send / sleep)
- **Work queues** (LLM + tools executed on worker pools)
- **Plan reconciliation skeleton** (EDN plan drives agent spawning + progress)
- child <-> parent allowed
- child -> sibling disallowed unless enabled
- parent -> any child allowed
- jobs are durable via events (requested/result)
- execution is concurrent, bounded by worker count"
- bounded concurrency
- async replies

## Summary Snippets
- Alright — now we build the **actual runtime substrate**: spawn/supervise, async message routing, action execution, and a plan reconciler.
- This is the “Agent OS” core that both **real agents** and **benchmarks** can reuse.

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
