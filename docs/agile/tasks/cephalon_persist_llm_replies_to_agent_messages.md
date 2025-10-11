---
uuid: "cb45d915-0601-4df8-997d-71ca913ad9f6"
title: "cephalon persist llm replies to agent messages"
slug: "cephalon_persist_llm_replies_to_agent_messages"
status: "incoming"
priority: "P3"
labels: ["agent", "cephalon", "llm", "persist"]
created_at: "2025-10-11T03:39:14.371Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Cephalon: Persist LLM replies to `agent_messages`

Goal: When the ECS orchestrator receives an LLM reply current handler in `services/ts/cephalon/src/bot.ts` subscribing to `agent.llm.result`, persist the reply text and metadata to the `agent_messages` collection via `ContextManager`/`CollectionManager`.

Why: The agent currently speaks without storing their utterances, breaking conversational continuity and context reconstruction.

Scope:
- Add a persistence hook right before enqueuing the utterance (preferred) or when the audio finishes.
- Metadata: `{ userName: AGENT_NAME, agentMessage: true, channel, recipient, startTime, endTime? }`.
- Ensure `ContextManager` has `agent_messages` created before use already in `Bot.start()`.

Exit Criteria:
- LLM reply text stored in `agent_messages` on each response.
- Unit test simulating `agent.llm.result` that asserts Mongo insert and Chroma add.
```
#incoming #cephalon #persistence #agent_messages
```
