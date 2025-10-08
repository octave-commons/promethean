---
uuid: "b67ff78e-f1b8-4cdf-ba1c-d2ed622a4882"
title: "replace polyglot makefile with pnpm-first workflow docs"
slug: "set_up_makefile_for_python_js_build_test_dev"
status: "done"
priority: "P3"
labels: ["pnpm", "makefile", "workflow", "replace"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


## 🛠️ Task: Replace polyglot Makefile with pnpm-first workflow docs

The repo already uses pnpm workspaces, TypeScript scripts, and `scripts/dev.mjs`. Instead of maintaining a cross-language
Makefile, capture the pnpm-based workflow and retire the old automation checklist.

## ✅ Decision
- Treat this initiative as documentation/cleanup—no new Makefile to be written.
- Publish guidance showing how pnpm covers setup, service start, testing, and cleanup.

---

## 🎯 Goals
- Provide a pnpm-focused quickstart for setting up JS/TS + any remaining Python helpers.
- Highlight existing scripts `pnpm install`, `pnpm test:all`, `pnpm run clean`, `scripts/dev.mjs`.
- Record that the Makefile experiment is archived and no longer required.

---

## 📦 Requirements
- [ ] Update onboarding docs with pnpm workflow tables.
- [ ] Call out how to execute Python tooling (if any) directly, without Makefile wrappers.
- [ ] Ensure the old Makefile checklist is marked as superseded.

---

## 📋 Subtasks
- [ ] Draft documentation section in README or docs/notes.
- [ ] Remove stale references to `make setup` / `make test` from guides.
- [ ] Link to the Makefile retirement note in `docs/notes/`.

---

## 🔗 Related Epics
#cicd #buildtools #devtools #devops

---

## ⛓️ Blocked By
- [update_makefile_to_have_commands_specific_for_agents_md|replace agent automation makefile targets with pnpm scripts]

## ⛓️ Blocks
Nothing

---

## 🔍 Relevant Links
- [[kanban]]
- [Makefile retirement note]../notes/promethean-dev-workflow-update.md

#cicd #buildtools #devtools #devops #archive


