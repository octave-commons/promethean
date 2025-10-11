---
uuid: "b40d6c61-6bcf-4ef3-8518-f26d43b99df4"
title: "client-ts-errors"
slug: "client-ts-errors"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.371Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/client-ts-errors.md

## 📝 Context Summary

---

title: 2025.09.30.11.42.46

  ESLint errors found in client.ts file related to type safety and promise
  handling. Multiple instances of 'any' type usage and unsafe operations
  detected.
tags:
  - eslint
  - typescript
  - client
  - errors
  - type-safety
  - promises
  - unsafe-access

references: []
---
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/ws/src/client.ts
     3:31  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
     7:63  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    19:13  error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
    24:23  error    Unexpected any. Specify a different type                              

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
