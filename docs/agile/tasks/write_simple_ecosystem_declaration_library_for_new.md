---
uuid: 5c8d8016-f4b8-421d-b335-73f7646173af
title: write simple ecosystem declaration library for new md md
status: done
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.524Z'
---
## 🛠️ Task: write simple ecosystem declaration library for new agents

Create a lightweight module that lets each agent declare which
services or processes it needs. The goal is a shared "ecosystem"
format—likely a JS or JSON file—that PM2 or similar tools can read to
spawn the correct services for an agent.

---

## 🎯 Goals

- Provide a single declaration file per agent (e.g. `duck.ecosystem.js`)
- Make it easy to add new agents without copying boilerplate
- Integrate with pm2 so `pm2 start duck.ecosystem.js` just works

---

## 📦 Requirements

- [ ] Define the declaration schema (services, env vars, command)
- [ ] Implement a loader that reads the file and spawns processes
- [ ] Document usage in `docs/` and reference `MIGRATION_PLAN.md`
- [ ] Clarify how this interacts with the Makefile PM2 targets

---

## 📋 Subtasks

- [ ] Draft an example for Duck using existing service commands
- [ ] Write a small Node script `ecosystem-loader.js`
- [ ] Test launching Cephalon, STT and TTS for one agent
- [ ] Add instructions in `agents/README.md`

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

- Pending PM2 config decisions in MIGRATION_PLAN.md$../MIGRATION_PLAN.md

## ⛓️ Blocks

- Future multi-agent orchestration features

---

## 🔍 Relevant Links

- [[kanban]]

## ❓ Questions

- Should PM2 remain the default process manager or is a custom tool planned?
- How will per-agent environment variables be stored?
#done

