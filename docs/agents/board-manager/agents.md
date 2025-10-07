---
project: Promethean
hashtags: $#agents, #board-manager, #infrastructure, #promethean$
---

# 🗂️ Board Manager Agent

The **Board Manager** maintains Agile + Kanban flow across the Promethean docs vault.

## Responsibilities
- Sync `docs/agile/boards/kanban.md` with PRs + commits.
- Enforce WIP limits defined in $[docs/agile/Process.md]$.
- Reflect PR/test/build status back to the Kanban board.
- Manage AI-specific planning stages:
  - **Prompt Refinement** → ensuring prompts are iterated and matured.
  - **Agent Thinking** → track reasoning or internal deliberation.
  - **Codex Prompt** → capture developer-facing handoffs from agents.

## Restrictions
- Cannot modify agent prompts.
- Cannot alter memory or perception-action loops.

---
## 🔗 Cross-Links
- $[docs/agile/boards/kanban.md|Kanban Board]$ → primary sync surface.
- $[docs/agile/Process.md|Agile Process Guide]$ → defines WIP limits + flow rules.
