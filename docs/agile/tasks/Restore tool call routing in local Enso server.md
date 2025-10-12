---
uuid: "06fd4307-3fcc-496d-b8f1-3df71b2a8922"
title: "restore tool call routing in local enso server"
slug: "Restore tool call routing in local Enso server"
status: "incoming"
priority: "P1"
labels: ["cephalon", "tests"]
created_at: "2025-10-12T02:22:05.423Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































The local harness for `@promethean/cephalon` spins up an `EnsoServer`, but no router handler forwards `tool.call` envelopes to
the agent client. Without a handler the router drops those messages, so tests waiting for `tool.result` never observe a
response and time out.

## Background
- `pnpm nx test @promethean/cephalon` currently stalls on tool execution specs.
- Production deployments rely on explicit routing, but the lightweight test harness never implemented it.

## Exit Criteria
- Register a router handler (or equivalent) so local tool calls reach the agent's `EnsoClient`.
- Confirm tool invocations emit matching `tool.result` responses under the test harness.
- Add regression coverage that fails if tool calls are not forwarded.

#incoming #enso #cephalon #tests








































































































