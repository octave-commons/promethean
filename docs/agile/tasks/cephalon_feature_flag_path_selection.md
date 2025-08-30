Cephalon: Feature-flag classic vs ECS path

Goal: Add a feature flag to select between the classic `AIAgent` flow and the newer ECS orchestrator flow to simplify debugging and rollout.

Why: Codebase is in-between worlds; a flag allows toggling behavior while we complete persistence and context wiring.

Scope:
- Env var `CEPHALON_MODE` in `services/ts/cephalon/src/index.ts` to choose startup path.
- Document behavior and defaults; add note in README for temporary nature.

Exit Criteria:
- Able to switch modes without code edits; both modes functional.

#cephalon #feature-flag #migration #accepted
