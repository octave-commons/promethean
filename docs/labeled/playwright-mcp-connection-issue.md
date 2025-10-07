---
$$
uuid: b42bd558-e34f-41c4-8397-2ed79b276fa1
$$
$$
created_at: '2025-10-03T16:33:02Z'
$$
title: 2025.10.03.16.33.02
filename: Playwright MCP Connection Issue
$$
description: >-
$$
  The curl command successfully connects to Playwright's MCP endpoint with
  version 2025-06-18, but the chatgpt interface reports a 404 error when trying
  to access the same endpoint via a different URL. This discrepancy suggests a
  misconfiguration in the chatgpt interface's request URL.
tags:
  - Playwright
  - MCP
  - 404 error
  - URL misconfiguration
  - API integration
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
Ok, the command you gave me returns:
```
err:~/devel/promethean$   curl -N \
    -H 'content-type: application/json' \
    -H 'accept: application/json, text/event-stream' \
    -d '{
          "jsonrpc":"2.0",
          "id":1,
          "method":"initialize",
          "params":{
            "protocolVersion":"2024-10-01",
            "capabilities":{},
            "clientInfo":{"name":"curl","version":"0.0.1"}
          }
        }' \
    http://localhost:3210/playwright/mcp
event: message
data: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-06-18","capabilities":{"tools":{}},"serverInfo":{"name":"Playwright","version":"0.0.41"}}}
```

But chatgpt's interface is still returning:
```
Error creating connector
Client error '404 Not Found' for url 'https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/playwright/mcp' For more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
