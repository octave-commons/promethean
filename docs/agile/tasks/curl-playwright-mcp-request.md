---
uuid: "20a740fa-45ce-4969-950e-8ff59bd9656c"
title: "curl-playwright-mcp-request"
slug: "curl-playwright-mcp-request"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:46.023Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/curl-playwright-mcp-request.md

## 📝 Context Summary

---
uuid: b4068ff1-7165-4f0e-b3c5-ba79fcec6e5a
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
