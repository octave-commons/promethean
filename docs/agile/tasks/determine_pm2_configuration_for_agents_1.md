---
uuid: "e6bbd2be-7191-4b32-ba5c-d82f1771b520"
title: "determine pm2 configuration for agents 1 md"
slug: "determine_pm2_configuration_for_agents_1"
status: "done"
priority: "P3"
labels: ["pm2", "agents", "determine", "configuration"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Task: Determine PM2 configuration for agents

Establish a shared PM2 ecosystem or alternative process manager setup that all
agents can rely on. Document the chosen approach in `MIGRATION_PLAN.md` and
include startup instructions in each service README.

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
- [ ] Show how environment variables are passed to each service
- [ ] Include environment variable examples for development vs production
- [ ] Ensure log files are rotated to `logs/pm2/*.log`

---

## 📋 Subtasks

- [ ] Prototype with Duck services
- [ ] Validate restart behavior and log handling
- [ ] Add `npm run start:all` that loads the ecosystem file
- [ ] Share the config with the team for feedback
- [ ] Add a Makefile target `make pm2-start` for convenience

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

- [write simple ecosystem declaration library for new agents](write%20simple%20ecosystem%20declaration%20library%20for%20new%20agents.md)

---

## 🔍 Relevant Links

- [[kanban]]

## ❓ Questions

- Should we consider lightweight alternatives to PM2 for local dev?
- feel like PM2 *is* the lightweight alternative MR AI, but if you have other ideas, I'm all ears. It's definitely lighter weight than docker
- And there is only gonna be local dev... this is a local tool
- as much as I am sure your greedy owners would like to use this in the cloud, it's designed to not scale that way
- unless you can afford well... all the people you're trying to automate's time to spend a life time training 1 model that only works for them.
- Then please.
- How will service logs be aggregated when using PM2?
#done
