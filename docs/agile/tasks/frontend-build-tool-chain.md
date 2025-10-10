---
uuid: "1ca3cb3e-b00a-457d-83a9-d0df3c1159ce"
title: "frontend build tool chain"
slug: "frontend-build-tool-chain"
status: "rejected"
priority: "P3"
tags: ["frontend", "build", "tool", "chain"]
created_at: "2025-10-10T03:23:55.972Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🛠️ Description

Establish a repeatable build pipeline for the `sites/` frontend that shares TypeScript code with `shared/` and participates in CI.

---

## 🎯 Goals

- Bundle frontend assets with a modern toolchain
- Integrate lint, test, and build steps into existing Makefile

---

## 📦 Requirements

- [ ] Dedicated package manages frontend dependencies and scripts
- [ ] GitHub Action runs lint/test/build for frontend on pull requests
- [ ] `make build` triggers frontend build step

---

## 📋 Subtasks

- [ ] Scaffold frontend package (e.g., Vite or Next.js)
- [ ] Wire shared TypeScript imports from `shared/`
- [ ] Add lint and test tooling
- [ ] Update Makefile and CI to invoke frontend pipeline

---

## 🔗 Related Epics

#devops

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]

#devops #Ready






