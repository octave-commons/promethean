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

# ✅ COMPLETED

## 🛠️ Description

Define `ActRationalePayload` in `enso-protocol` with `policy`, `evidence`, and `evidenceKind`. Optionally rename `act.rationale` → `guardrail.rationale`.

✅ **RESOLVED**: Payload now includes `policy`, `evidence`, and `evidenceKind` with Cephalon defaulting to the Morganna guardrail metadata. Event name remains `act.rationale`; rename deferred until downstream consumers align.

## Requirements

- [x] Export type in protocol - `ActRationalePayload` defined in `packages/enso-protocol/src/types/events.ts:147-153`
- [x] Update producers/consumers - Cephalon emits proper payload structure
- [x] Tests adjusted - Unit tests cover new payload fields

## 📋 Implementation Details

**Type Definition**:

```typescript
export type ActRationalePayload = {
  readonly callId: string;
  readonly rationale: string;
  readonly policy?: string;
  readonly evidence?: readonly string[];
  readonly evidenceKind?: 'url' | 'messageId' | 'note';
};
```

**Event Mapping**:

- Event type: `act.rationale` (unchanged)
- Payload interface: `ActRationalePayload` ✅
- Exported as: `ActRationaleEvent` ✅

**Usage in Cephalon**:

- Morganna guardrail metadata populated by default
- Evidence tracking for audit trails
- Policy references for compliance

## ⛓️ Blocks

- ~~Merge PR #1450~~ (landed) ✅

## 🔍 Related

- PR #1450 ✅
- Transport chapter: [Security, Signatures, and Guardrails]06-security-and-guardrails.md
- Type definitions: `packages/enso-protocol/src/types/events.ts`

## 📝 Notes

- Event name `act.rationale` retained for backward compatibility
- Future rename to `guardrail.rationale` deferred pending downstream alignment
- All payload fields now optional except `callId` and `rationale`
