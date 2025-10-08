---
uuid: 0b9f6e21-3c4d-4c80-9e10-62d3a7d9c421
title: cephalon/enso — type rationale payload + consider event rename
status: document
priority: P2
labels:
  - cephalon
  - enso
  - policy
  - evaluation
created_at: '2025-10-02T00:00:00.000Z'
---
#Todo

## 🛠️ Description
Define `ActRationalePayload` in `enso-protocol` with `policy`, `evidence`, and `evidenceKind`. Optionally rename `act.rationale` → `guardrail.rationale`.

✅ Payload now includes `policy`, `evidence`, and `evidenceKind` with Cephalon defaulting to the Morganna guardrail metadata. Event name remains `act.rationale`; rename deferred until downstream consumers align.

## Requirements
- [x] Export type in protocol
- [x] Update producers/consumers
- [x] Tests adjusted

## ⛓️ Blocks
- ~~Merge PR #1450~~ (landed)

## 🔍 Related
- PR #1450
