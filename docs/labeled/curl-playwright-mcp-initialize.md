---
uuid: c5bbdb92-9657-47ac-9eaf-4682aabe454c
created_at: '2025-10-03T16:36:57Z'
title: 2025.10.03.16.36.57
filename: curl-playwright-mcp-initialize
description: >-
  Example curl command to initialize Playwright MCP with specified protocol
  version and client info.
tags:
  - curl
  - playwright
  - mcp
  - initialize
  - jsonrpc
  - protocol
related_to_uuid: []
related_to_title: []
references: []
---

  curl -N \
    -H 'content-type: application/json' \
    -H 'accept: application/json, text/event-stream' \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-10-01","capabilities":{},"clientInfo":
  {"name":"curl","version":"0.0.1"}}}' \
    https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/playwright/mcp
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
