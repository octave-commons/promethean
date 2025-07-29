## 🛠️ Task: Determine PM2 configuration for agents

Establish a shared PM2 ecosystem or alternative process manager setup that all agents can rely on. Document the chosen approach in `MIGRATION_PLAN.md`.

---

## 🎯 Goals

- Decide on the default process manager (PM2 vs custom)
- Provide example ecosystem files for at least one agent
- Outline how to start/stop all services consistently

---

## 📦 Requirements

- [ ] Review existing Makefile or npm scripts
- [ ] Draft a sample `ecosystem.config.js`
- [ ] Document instructions in `docs/MIGRATION_PLAN.md`

---

## 📋 Subtasks

- [ ] Prototype with Duck services
- [ ] Validate restart behavior and log handling
- [ ] Share the config with the team for feedback

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

- [write simple ecosystem declaration library for new agents](write%20simple%20ecosystem%20declaration%20library%20for%20new%20agents.md)

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)

## ❓ Questions

- Should we consider lightweight alternatives to PM2 for local dev?
- How will service logs be aggregated when using PM2?
