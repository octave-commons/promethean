---
uuid: "cd2f96f3-bd40-410b-94f2-f7d0dbce4da4"
title: "update github actions automation to pnpm scripts"
slug: "update_github_actions_to_use_makefile"
status: "done"
priority: "P3"
labels: ["pnpm", "scripts", "update", "github"]
created_at: "2025-10-11T01:03:41.283Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🛠️ Task: Update GitHub Actions to use pnpm scripts

The Makefile targets referenced by the original plan never stabilized. CI already leans on pnpm (`pnpm lint`, `pnpm test:all`),
so workflows should call the same scripts instead of Makefile wrappers.

## ✅ Decision
- Replace all Makefile references with pnpm workspace commands.
- Keep workflow steps close to the developer experience `pnpm lint`, `pnpm test:all`, `pnpm --filter … build`.

---

## 🎯 Goals
- Invoke pnpm scripts for lint/build/test in every workflow.
- Remove Makefile-specific setup instructions from CI docs.
- Ensure package-scoped tests run via pnpm filters where relevant.

---

## 📦 Requirements
- [ ] Audit current workflow steps for Makefile usage.
- [ ] Swap `make lint|test|build` with pnpm equivalents.
- [ ] Align documentation/README references with pnpm tooling.
- [ ] Verify environment variables and caching remain intact after changes.

---

## 📋 Subtasks
- [ ] Identify pnpm scripts that replace each Makefile target.
- [ ] Update YAML workflows accordingly.
- [ ] Update contributing or CI docs describing the pipeline.

---

## 🔗 Related Epics
```
#cicd #devops #framework-core
```
---

## ⛓️ Blocked By
- [breakdown-makefile.hy|audit makefile.hy remnants and confirm deprecation]

## ⛓️ Blocks
- [update_makefile_to_have_commands_specific_for_agents_md|replace agent automation makefile targets with pnpm scripts]

---

## 🔍 Relevant Links
- [[kanban]]
- [[process]]
- scripts/dev.mjs$../../scripts/dev.mjs

#cicd #devops #framework-core #todo

























