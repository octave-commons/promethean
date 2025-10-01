---
uuid: 9fbe9f3a-0c6a-472b-8f7c-b100dab6f5de
title: update makefile to have commands specific for agents md
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.523Z'
---
## 🛠️ Task: Update Makefile to have commands specific for agents

The monorepo hosts multiple agents. The Makefile should expose targets to launch or test each agent individually as referenced in the migration plan.

Agents will be there own kind of unit with in the system.

There are going to be "shared" services, and there are going to be services specific to an agent...
But not really. no. It should be that the services that I am thinking would be specific simply have ways for the agents who use them to flag their messages as coming from them so they can be routed accordingly.
It's too complicated to seperate this idea of "agents", "Agent specififc services", and "shared services" when there are also suposed to be "shared" libraries.

---

## 🎯 Goals
- `make start:duck` through `make start:%`
- Reusable patterns for any future agent

---

## 📦 Requirements
- [ ] Define agent-specific PM2 targets
- [ ] Document usage in the root README

---

## 📋 Subtasks
- [ ] Extend current Makefile with per-agent start/stop
- [ ] Provide example for Duck
- [ ] Add placeholder for new agents

---

## 🔗 Related Epics
#devops

---

## ⛓️ Blocked By
- [update github actions to use makefile](update%20github%20actions%20to%20use%20makefile.md)
- [write simple ecosystem declaration library for new agents](write%20simple%20ecosystem%20declaration%20library%20for%20new%20agents.md)
- [Determine PM2 configuration for agents](Determine%20PM2%20configuration%20for%20agents.md)


## ⛓️ Blocks
Nothing



## 🔍 Relevant Links
- [[kanban]]
- [MIGRATION_PLAN](../MIGRATION_PLAN.md)
- [write simple ecosystem declaration library for new agents](write%20simple%20ecosystem%20declaration%20library%20for%20new%20agents.md)


#devops #Ready
#ready

