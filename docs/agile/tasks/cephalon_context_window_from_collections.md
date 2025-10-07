---
uuid: fa552127-22e2-45b7-85ca-0c9f5064ea48
title: cephalon context window from collections
status: incoming
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.508Z'
---
Cephalon: Build LLM context window from collections

Goal: Ensure the LLM prompt context draws from `transcripts`, `agent_messages`, and any domain-specific collections using `ContextManager.compileContext` consistently in ECS orchestration.

Why: Without persisted agent/user messages in Mongo/Chroma, the agent loops. With persistence restored, wire context fetch for each turn.

Scope:
- In `OrchestratorSystem` integration wired in `start-dialog.scope.ts`, replace ad-hoc getContext callback with a call to `bot.context.compileContext([text])` including both user and agent histories.
- Optionally add a `formatAssistantMessages` flag for role-annotated context.

Exit Criteria:
- LLM requests include recent conversation and relevant memories from collections.
- Unit test stubbing `ContextManager` to validate callback invocation.

#incoming #cephalon #context #llm

