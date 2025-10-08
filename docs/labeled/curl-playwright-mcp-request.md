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

```
curl -N \
```
```
-H 'content-type: application/json' \
```
    -H 'accept: application/json, text/event-stream' \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-10-01","capabilities":{},"clientInfo":
  {"name":"curl","version":"0.0.1"}}}' \
    https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/playwright/mcp
