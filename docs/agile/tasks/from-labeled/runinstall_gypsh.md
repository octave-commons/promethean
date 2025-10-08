---
uuid: "3d559909-9c32-4b52-bef5-6f1d7a53f572"
title: "run/install_gyp.sh"
slug: "runinstall_gypsh"
status: "todo"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:45.988Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.15.22.04.54.md

## 📝 Context Summary

---
uuid: de9be148-8039-4bfe-9419-95e2cbc908e6
created_at: '2025-09-15T22:04:54Z'
title: 2025.09.15.22.04.54
filename: bash-printf-fixes
description: >-
  Fixes for bash `printf` usage to prevent shadowing and misinterpretation of
  leading hyphens. The solution involves explicitly calling the bash builtin
  `printf` with `--` to avoid common pitfalls.
tags:
  - bash
  - printf
  - shadowing
  - error-handling
  - shell-scripting
  - debugging
---
Good news: that `printf: usage: printf -v var format [arguments]` is almost always one of these:

1. a shadowed `printf` some envs define a `printf` **function** that masks the bash builtin, or
2. a format string that starts with `-` and the shell tries to treat it like an option, or
3. a call with a missing/empty format.

Your scripts only use `printf` in a few places (the `rg` list you showed). Two of those print lines **start with a dash** `"- Build: **%s**\n"` etc., and all of them rely on the builtin not being shadowed.

Easiest, bullet-proof fix: call the **bash builtin** explicitly and pass `--` so a leading `-` can’t be misread.

Below are tiny, safe patches you can drop in. They keep behavior the same, but eliminate the “printf u

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
