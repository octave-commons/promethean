Cephalon: Tests for persistence and ECS flow

Goal: Add tests to ensure transcripts and agent messages are stored during ECS-driven conversations.

Why: Prevent regressions where the agent monologues/loops without context.

Scope:
- Unit test: simulate `agent.llm.result` and assert `agent_messages` insert via a stubbed `ContextManager`.
- Integration test: start `start-dialog` flow with mocked LLM + TTS, emit `transcriptEnd`, validate both transcript and agent message persistence.

Exit Criteria:
- Tests pass and fail if persistence calls are removed.

#cephalon #tests #persistence #ecs #ready
