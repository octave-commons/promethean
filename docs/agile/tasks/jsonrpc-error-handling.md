---
uuid: "0964f077-ba2d-414c-9cde-e512a172b0fc"
title: "jsonrpc-error-handling"
slug: "jsonrpc-error-handling"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.818Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/jsonrpc-error-handling.md

## 📝 Context Summary

---

title: 2025.10.03.16.07.03
filename: JSONRPC Error Handling

  This document details a JSON-RPC error response when attempting to initialize
  a server with invalid parameters. The error indicates missing required fields
  like 'id' and 'method', and unexpected keys in the request payload. The
  response shows a detailed breakdown of validation failures using Zod schema
  validation.
tags:
  - jsonrpc
  - error
  - validation
  - zod
  - api
  - request
  - parameters

references: []
---
Ok, when I use that curl command I get:

Error creating connector
Client error '404 Not Found' for url 'https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/playwright/mcp' For more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
