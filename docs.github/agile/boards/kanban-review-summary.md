Kanban Hygiene & Routing Review — 2025-10-11

- Updated WIP limits in `promethean.kanban.json` to targets (accepted=21, breakdown=13, blocked=3, ready=55, todo=25, in_progress=13, testing=8, review=8, document=8, done=500, rejected=20; icebox/incoming=9999).
- Regenerated board and ran WIP enforcement in report mode.
- Added safety hook: require `tool:*` and `env:*` tags before entering `in_progress` (DSL rule in `docs/agile/rules/kanban-transitions.clj`).
- Normalized tags (small batch):
  - 4ba88faf-73ab-480f-9a17-1477c01a48ee — Tags: tool:codex env:cloud trace:<uuid>
  - d3e6cca5-2b2f-4cd9-8131-db74ebe7c8f9 — Tags: tool:codex role:engineer cap:codegen trace:<uuid>
  - 5386dc78-da5b-4dfa-bef3-f82094c4c58a — Tags: tool:claude provider:zai role:engineer cap:codegen trace:<uuid>
- Generated filtered views by tags under `docs/agile/boards/views/`:
  - codex.md (tool:codex)
  - claude.md (tool:claude)
  - local-no-egress.md (env:no-egress)
  - planning.md (role:planner)
  - engineering.md (role:engineer)
  - docs.md (docops)
- Residual WIP violations (post-regenerate): breakdown 26/13 (+13), ready 103/55 (+48), todo 29/25 (+4). Many violators are board-only entries without backing task files; safe moves are blocked by source existence rule.
- Next steps proposed: create stubs for a small batch of over-limit tasks to enable transitions, then iteratively move ≤5 per pass respecting FSM and new tool/env tag requirement.

