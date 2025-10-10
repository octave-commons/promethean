---
uuid: "8778346a-42cd-4e95-a412-ca69b2a097b0"
title: "typescript-eslint-fixes-2"
slug: "typescript-eslint-fixes-2"
status: "incoming"
priority: "P3"
tags: ["docops", "labeled"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🗂 Source

- Path: docs/labeled/typescript-eslint-fixes-2.md

## 📝 Context Summary

---
uuid: 9293588d-07d6-4625-a6c2-e0d896753823
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






