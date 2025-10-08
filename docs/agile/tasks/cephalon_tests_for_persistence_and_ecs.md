---
uuid: "a9ea7854-0c6f-46e8-9230-1055795a1a23"
title: "cephalon tests for persistence and ecs"
slug: "cephalon_tests_for_persistence_and_ecs"
status: "icebox"
priority: "P3"
labels: ["tests", "persistence", "ecs", "agent"]
created_at: "2025-10-08T21:27:18.930Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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

Notes:
- Persistence verification is the next backlog slice; start these tests once feature delivery pauses so regressions are caught early.


