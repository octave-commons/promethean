---
uuid: "3b2863ed-c7ed-4b5c-ad96-c54bd57c405c"
title: "nx-lint-affected-projects-2"
slug: "nx-lint-affected-projects-2"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/nx-lint-affected-projects-2.md

## 📝 Context Summary

---
uuid: dda801a4-209c-41a6-b04b-24c49af5ee3c
created_at: '2025-09-30T10:50:12Z'
title: 2025.09.30.10.50.12
filename: nx-lint-affected-projects
description: >-
  Run linting on affected projects using NX. The command shows warnings and
  errors related to TypeScript best practices, including issues with 'any' types
  and unsafe operations.
tags:
  - nx
  - lint
  - typescript
  - affected
  - projects
  - eslint
  - warnings
  - errors
---

Run pnpm exec nx affected -t lint --paralell

 NX   No explicit --base argument provided, but found environment variable NX_BASE so using its value as the affected base: c9e3f4ff9d9531c5331f35d4ba755bf375c30884

 NX   No explicit --head argument provided, but found environment variable NX_HEAD so using its value as the affected head: f6b10926eea557fa40f9b3f296f70b4e98854038

 NX   Custom task runners will no longer be supported in Nx 21.

Use Nx Cloud or the Nx Powerpack caches instead.
For more information, see https://nx.dev/features/powerpack/custom-caching

 NX   Custom task runners will no longer be supported in Nx 21.

Use Nx Cloud or the Nx Powerpack caches instead.
For more information, see https://nx.dev/features/powerpack/custom-cachi

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
