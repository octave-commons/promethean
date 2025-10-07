---
```
uuid: 1b2b8d52-3f3a-4c4a-9f3c-0b9b8f6d9f67
```
title: Duck Revival — diagrams + docs linked
status: done
priority: P2
labels:
  - docs
  - duck-revival
```
created_at: '2025-10-02T21:05:00.000Z'
```
---
#Done

## 🛠️ Description
Add concise docs with Mermaid diagrams for all moving parts touched by the `duck-revival` PRs and link them in the PR threads.

## What changed?
- Created service docs:
  - `docs/services/enso-browser-gateway/HANDSHAKE_GUARD.md`
  - `docs/services/enso-browser-gateway/VOICE_FORWARDER.md`
  - `docs/services/duck-web/WEBSOCKET_HELPER.md`
  - `docs/services/duck-web/THROTTLED_SENDER.md`
  - `docs/services/duck-web/PCM16K_WORKLET.md`
  - `docs/services/enso-server/GUARDRAIL_RATIONALE.md`
- Library doc:
  - `docs/libraries/duck-audio/README.md`
- Feature flags doc:
  - `docs/duck/FEATURE_FLAGS.md`
- 2025-02-14: refreshed diagrams + service docs for WebRTC voice streaming.

## Goals
- Cross-link PRs with docs + diagrams.
- Make the flow legible to anyone reading diffs.

## Requirements
- [x] PR comments posted on #1451, #1450, #1448, #1447, #1446, #1445, #1444, #1443, #1442 with relevant links.
- [x] Diagrams render on GitHub.

## Related Epics
- [[kanban]]

## Relevant Links
- `docs/diagrams/duck-revival-overview.md`
