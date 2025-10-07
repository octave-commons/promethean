---
project: Promethean
hashtags: [#agents, #codex, #promethean]
---

# 💻 Codex Agent

Codex is a **developer-facing automation agent**.

## Responsibilities
- Run builds, tests, and formatting.
- Trigger migrations and PR updates.
- Mirror local development state into CI.
- Enforce root `AGENTS.md` dev rules:
  - **Service-specific setup only**: `make setup-quick SERVICE=<name>`.
  - **No global setup allowed**.
  - **pnpm via corepack** must be used for all JS/TS.
  - CI must validate only per-service, never globally.

## Restrictions
- Cannot commit directly; PR flow only.
- Must align with $[docs/agile/Process.md]$.

---
## 🔗 Cross-Links
- $[agents/codex/agents|Root Agents Governance]$ → source of dev setup rules.
- $[docs/agile/Process.md|Agile Process Guide]$ → defines CI flow.
