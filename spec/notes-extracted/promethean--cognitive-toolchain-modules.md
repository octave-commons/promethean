---
title: "The right abstraction: a “Cognitive Toolchain”"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/cognitive-toolchain-modules.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# The right abstraction: a “Cognitive Toolchain”

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/cognitive-toolchain-modules.md`
- Category: `promethean`

## Draft Requirements
- observes the world (sensors)
- builds state (memory + perception)
- chooses actions (planning)
- executes safely (tools + policies)
- learns what matters (feedback loops)
- **Vision**: object detector, OCR/CRNN, scene classifier, activity recognition
- **Audio**: VAD, speaker diarization, STT, emotion/energy estimator
- **Embedding/RAG**: retrieval, clustering, intent routing, novelty detection
- **Planning**: task DAG, retry/backoff, constraints
- **Safety**: permission layer, sandboxing, deny/allow
- **LLM**: reasoning + language + tool coordination
- *interpreter*

## Summary Snippets
- Yeah — this is the *actual* leap.
- An **LLM-first** system is like hiring a genius and making them do spreadsheet math by hand.

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
