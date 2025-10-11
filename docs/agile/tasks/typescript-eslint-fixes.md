---
uuid: "f057e612-c9f9-4687-b613-0b60e6ca047b"
title: "typescript-eslint-fixes"
slug: "typescript-eslint-fixes"
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

- Path: docs/labeled/typescript-eslint-fixes.md

## 📝 Context Summary

---
uuid: e2aa54ae-0ad7-4400-b35f-91f4b874ba79
created_at: '2025-09-30T11:42:46Z'
title: 2025.09.30.11.42.46
filename: TypeScript ESLint Fixes
description: >-
  This document highlights ESLint errors found in the Promethean project's
  WebSocket client code. The issues include multiple instances of `any` type
  usage, unsafe member accesses, and floating promises that need correction to
  improve type safety and code reliability.
tags:
  - TypeScript
  - ESLint
  - code quality
  - type safety
  - promethean
  - websocket
  - error fixes
---
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/ws/src/client.ts
     3:31  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
     7:63  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    19:13  error    Promises must be awaited, end with a call to .catch, end wit

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
