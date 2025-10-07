---
uuid: 1f5f505f-155d-4a1b-ba1b-73cb1dd0ea97
title: cephalon feature flag path selection
status: incoming
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.509Z'
---
Cephalon: Feature-flag classic vs ECS path

Goal: Add a feature flag to select between the classic `AIAgent` flow and the newer ECS orchestrator flow to simplify debugging and rollout.

Why: Codebase is in-between worlds; a flag allows toggling behavior while we complete persistence and context wiring.

Scope:
- Env var `CEPHALON_MODE` in `services/ts/cephalon/src/index.ts` to choose startup path.
- Document behavior and defaults; add note in README for temporary nature.

Exit Criteria:
- Able to switch modes without code edits; both modes functional.

#incoming #cephalon #feature-flag #migration

