---
uuid: "087e5693-6a74-4ea1-81d6-592d1b64186f"
title: "curl-playwright-mcp-request-2"
slug: "curl-playwright-mcp-request-2"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.817Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🗂 Source

- Path: docs/labeled/curl-playwright-mcp-request-2.md

## 📝 Context Summary

---
uuid: 036efefe-e72f-410e-9222-bf5dd3f52650
created_at: '2025-10-03T16:36:57Z'
title: 2025.10.03.16.36.57
filename: curl-playwright-mcp-request
description: >-
  Example curl command to initialize Playwright MCP with specific headers and
  JSON payload. Demonstrates API interaction for Playwright's remote control
  interface.
tags:
  - curl
  - playwright
  - mcp
  - api
  - jsonrpc
  - headers
  - payload
---

    -H 'accept: application/json, text/event-stream' \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-10-01","capabilities":{},"clientInfo":
  {"name":"curl","version":"0.0.1"}}}' \
    https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/playwright/mcp

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs



