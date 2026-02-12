---
title: "1) One unified “Call Graph” abstraction"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/tool-call-loop-hooks.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) One unified “Call Graph” abstraction

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/tool-call-loop-hooks.md`
- Category: `promethean`

## Draft Requirements
- `:registry` → tool registry (local + MCP proxies)
- `:bus` → event bus
- `:agent` → current agent instance
- `:llm` → model driver (ollama/openai/etc.)
- `:policy` → deny/allow + capability narrowing
- single call
- multi-tool call chains
- tool-choice errors
- “decoys”
- streaming partial output (for entertainment)
- partial text streaming chunks
- tool calls interleaved

## Summary Snippets
- Alright — now we build the **actual heart** of the system:
- ✅ the **tool-call loop** (agent ↔ tools ↔ agent) ✅ **local tools + remote MCP tools** in one registry ✅ **before/after/around hooks** applied everywhere ✅ **async sub-agents** returning partials / events ✅ “stream performer” mode (vision + fun tools) without turning into spaghetti

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
