---
project: Promethean
hashtags: [#agents, #codex, #gui, #promethean]
---

# 🖥️ Codex GUI Agent

Codex GUI is a **user-facing interface agent** for workflows.

## Responsibilities
- Maintain Kanban sync with [docs/agile/boards/kanban.md].
- Provide visual feedback to users on PR/test/build state.
- Interlink with Developer Agents and Infrastructure Agents.
- Reflect root `AGENTS.md` rules:
  - Display **service-specific test/CI states**.
  - Explicitly avoid showing **global validation results**.

## Restrictions
- Read-only access to resident agent prompts.
- Cannot alter memory or perception loops.

---
## 🔗 Cross-Links
- [agents/codex-gui/agents|Root Agents Governance] → service setup rules.
- [docs/agile/boards/kanban.md|Kanban Board] → visual sync surface.
