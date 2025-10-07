---
uuid: a9ea7854-0c6f-46e8-9230-1055795a1a23
title: cephalon tests for persistence and ecs
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.509Z'
---
Cephalon: Tests for persistence and ECS flow

Goal: Add tests to ensure transcripts and agent messages are stored during ECS-driven conversations.

Why: Prevent regressions where the agent monologues/loops without context.

Scope:
- Unit test: simulate `agent.llm.result` and assert `agent_messages` insert via a stubbed `ContextManager`.
- Integration test: start `start-dialog` flow with mocked LLM + TTS, emit `transcriptEnd`, validate both transcript and agent message persistence.

Exit Criteria:
- Tests pass and fail if persistence calls are removed.

#incoming #cephalon #tests #persistence #ecs

