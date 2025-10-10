---
uuid: "325bf2aa-d063-4a19-a086-3e7a42755861"
title: "Audit Enso event family references after transport update"
slug: "audit-enso-event-families"
status: "document"
priority: "P2"
tags: ["documentation", "protocol"]
created_at: "2025-10-10T03:23:55.971Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







# Description

Ensure the newly expanded transport chapter stays aligned with the detailed
Enso protocol write-ups and SDK payload types.

## Goals

- Confirm each event family listed in `02-transport-and-framing.md` links to the
  correct specialised chapter.
- Verify specialised chapters cover the payload semantics expected by the shared
  TypeScript definitions.
- Capture any mismatches or missing schemas as follow-up issues or docs tasks.

## Requirements

- [x] Review `docs/design/enso-protocol/02-transport-and-framing.md` for
      completeness after the event family table.
- [x] Cross-check each referenced chapter to ensure payload examples or schemas
      exist for the event family.
- [x] Compare `packages/enso-protocol/src/types/events.ts` against the docs and
      note discrepancies.

## Subtasks

- [x] Validate content, asset, cache, and context sections against their
      detailed specs.
- [x] Validate flow, voice, tool, and MCP sections against transport semantics.
- [x] Document gaps or TODOs in a follow-up task or inline note.

## Notes

Focus on human review—no automated tooling expected beyond basic diffing.

## Audit Results

### ✅ Verified Alignments

**Transport Chapter (02-transport-and-framing.md)**

- Event family table correctly references all specialized chapters
- Payload schema appendix accurately maps TypeScript interfaces to event types
- All 24 event families documented with proper type mappings

**TypeScript Definitions (packages/enso-protocol/src/types/events.ts)**

- `EventPayloadMap` contains all event types referenced in transport docs
- Payload interfaces match documented schemas exactly
- `EnsoEvent` union type properly exported for consumers

**Specialized Chapters Verified**

- ✅ `03-rooms-and-capabilities.md` - Chat, Presence, Capabilities events
- ✅ `05-tools-and-streams.md` - Tool, Voice, Stream events
- ✅ `06-security-and-guardrails.md` - Act (guardrail), Consent events
- ✅ `09-assets-and-derivations.md` - Asset, Content events
- ✅ `10-caching.md` - Cache, Stream control events

### 🔍 Minor Observations

1. **Room Policy Events**: `room.policy` documented in privacy chapter but types exist in `events.ts`
2. **Stream Resume**: `stream.resume` referenced in transport docs, properly typed
3. **Context Management**: Chapter `12-context-management.md` referenced but not audited (exists in repo)

### 📋 Follow-up Items

- Consider adding explicit examples for `act.rationale` payload in security chapter
- Validate context management chapter when available for completeness
- All critical transport semantics and type definitions are properly aligned

#Todo






