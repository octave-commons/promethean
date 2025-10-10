---
uuid: "ad65401b-d6bd-4a26-b9b5-6b0340a98da8"
title: "handle websocket teardown race in enso chat agent"
slug: "Handle websocket teardown race in Enso chat agent"
status: "incoming"
priority: "P1"
tags: ["cephalon", "reliability"]
created_at: "2025-10-10T03:23:55.969Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







`EnsoChatAgent.dispose()` currently awaits `wsHandle.close()`, which rejects with “WebSocket was closed before the connection
was established” when shutdown runs before the handshake finishes. AVA reports this as an uncaught exception during
`pnpm nx test @promethean/cephalon`.

## Background
- The cephalon test suite tears down quickly after starting the agent, so the race reproduces frequently.
- The websocket handle should tolerate teardown during connection startup.

## Exit Criteria
- Make `dispose()` resilient to websocket close races (e.g., swallow the specific premature-close error).
- Ensure teardown always resolves without bubbling an uncaught rejection.
- Add coverage for disposing the agent before the websocket fully opens.

#incoming #enso #cephalon #stability






