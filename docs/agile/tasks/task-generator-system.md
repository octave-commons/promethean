---
uuid: "fb14db8b-0d66-4f4a-a30d-d7ef8631ddef"
title: "task generator system"
slug: "task-generator-system"
status: "done"
priority: "P3"
labels: ["board", "generator", "system", "template"]
created_at: "2025-10-11T19:23:08.661Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Create a utility that scaffolds new task files from a template to keep the board organized and consistent.

---

## 🎯 Goals

- Automate task file creation with required metadata
- Reduce manual effort when adding items to the board

---

## 📦 Requirements

- [ ] Command-line script generates markdown from template
- [ ] Ensures unique filenames and injects status hashtags
- [ ] Includes minimal tests for generation logic

---

## 📋 Subtasks

- [ ] Define task template parameters
- [ ] Implement generator script
- [ ] Integrate with Makefile or npm script
- [ ] Document usage in docs/agile/README

---
## 🧮 Story Points

2

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]
```
#framework-core #Ready
```

## Comments

### Summary

- The task spec still requires a command-line generator with unique filename/status handling and tests, but the change only adds Obsidian Templater definitions that invoke UI-specific commands, leaving the requested automation unmet.
    

### Issues

1. **Task generator remains UI-dependent instead of a tested CLI utility** — The specification calls for a command-line script, unique filename/hashtag injection, npm/Makefile integration, and accompanying tests.
    

The implementation adds only an Obsidian Templater file that relies on `tp` macros and `chatgpt-md` UI commands, so nothing can run headless, no automation adds the required status hashtags, and no tests or npm hooks were introduced.

Suggested taskBuild a tested CLI task generator that meets the spec
