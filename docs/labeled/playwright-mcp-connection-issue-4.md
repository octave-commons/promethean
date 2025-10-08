---
uuid: 112cc354-9884-4a27-badc-afab6164ad22
created_at: '2025-10-03T16:33:02Z'
title: 2025.10.03.16.33.02
filename: Playwright MCP Connection Issue
description: >-
  The Playwright MCP connection fails with a 404 error when trying to access the
  server endpoint. The curl command shows a successful initial handshake, but
  the chat interface reports a 404 Not Found error for the same endpoint. This
  discrepancy suggests a misconfiguration in the server's URL or routing.
tags:
  - Playwright
  - MCP
  - 404 error
  - server configuration
  - endpoint misconfiguration
---
Ok, the command you gave me returns:
```
err:~/devel/promethean   curl -N \
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
