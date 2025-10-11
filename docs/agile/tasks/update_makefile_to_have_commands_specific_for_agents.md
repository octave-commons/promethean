---
uuid: "9fbe9f3a-0c6a-472b-8f7c-b100dab6f5de"
title: "replace agent automation makefile targets with pnpm scripts"
slug: "update_makefile_to_have_commands_specific_for_agents"
status: "done"
priority: "P3"
labels: ["agent", "makefile", "pnpm", "scripts"]
created_at: "2025-10-11T03:39:14.524Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Task: Replace Makefile agent commands with pnpm scripts

The earlier plan called for agent-specific Makefile targets such as `make start:duck`. The audit showed those never shipped,
and the active tooling already relies on pnpm workspaces `scripts/dev.mjs`, `pnpm --filter …`. Rather than reviving the
Makefile, we will publish pnpm scripts that mirror the desired ergonomics.

## ✅ Decision
- Standardize on pnpm workspace scripts and `scripts/dev.mjs` for agent lifecycle management.
- Remove references to `%`-style Makefile dispatch and instead document `pnpm --filter @promethean/<agent> dev|test` patterns.

## 🔍 Findings from audit
- No maintained agent workflows depend on `Makefile`/`Makefile.hy`.
- Existing developers start services via `pnpm dev:all` scripts/dev.mjs or direct package scripts.
- Documentation still directs contributors to non-existent Makefile targets.

---

## 🎯 Goals
- Provide agent-scoped start/test commands via pnpm scripts.
- Document how to launch an individual agent without Makefile wrappers.
- Supply a concrete example (e.g., Duck) showing the new commands.

---

## 📦 Requirements
- [ ] Add workspace scripts or README snippets mapping agents to `pnpm --filter` commands.
- [ ] Ensure `scripts/dev.mjs` coverage is documented for multi-agent dev loops.
- [ ] Update root onboarding docs to drop Makefile references.

---

## 📋 Subtasks
- [ ] Inventory existing agent packages and confirm they expose `dev`/`test` scripts.
- [ ] Publish documented aliases (e.g., `pnpm agent:duck:dev`) if gaps exist.
- [ ] Update README / docs to reflect pnpm usage only.

---

## 🔗 Related Epics
#devops

---

## ⛓️ Blocked By
- [determine pm2 configuration for agents](Determine%20PM2%20configuration%20for%20agents.md)

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [[kanban]]
- MIGRATION_PLAN$../MIGRATION_PLAN.md
- [promethean-dev-workflow-update|promethean dev workflow update]

#devops #todo
