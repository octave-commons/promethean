---
title: "Async-first in Clojure: what to use"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/agent-runtime-design.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Async-first in Clojure: what to use

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/agent-runtime-design.md`
- Category: `promethean`

## Draft Requirements
- **tree-shaped ownership + delegation**
- **high concurrency** (lots of subagents running at once)
- **strong isolation** (tools, prompts, model tiers, budgets)
- **coordination primitives** (messaging + file locks + conflict chats)
- **event-sourced durability** (never lose progress)
- **benchmarks that exercise the *same runtime*** you’ll use in production
- **`core.async`** for:
- agent inboxes
- supervisor loops (“parent sleeps, wakes up”)
- fan-out/fan-in of subagent tasks
- cancel/timeout propagation
- **Thread pools / executors** for:

## Summary Snippets
- You’re describing a **supervisor-style, async-first, hierarchical agent runtime** with:
- * **tree-shaped ownership + delegation** * **high concurrency** (lots of subagents running at once) * **strong isolation** (tools, prompts, model tiers, budgets) * **coordination primitives** (messaging + file locks + conflict chats) * **event-sourced durability** (never lose progress) * **benchmarks that exercise the *same runtime*** you’ll use in production

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
