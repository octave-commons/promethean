---
```
uuid: 325bf2aa-d063-4a19-a086-3e7a42755861
```
title: Audit Enso event family references after transport update
status: todo
priority: P2
labels:
  - documentation
  - protocol
```
created_at: '2025-09-21T00:00:00Z'
```
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

- [ ] Review `docs/design/enso-protocol/02-transport-and-framing.md` for
  completeness after the event family table.
- [ ] Cross-check each referenced chapter to ensure payload examples or schemas
  exist for the event family.
- [ ] Compare `packages/enso-protocol/src/types/events.ts` against the docs and
  note discrepancies.

## Subtasks

- [ ] Validate content, asset, cache, and context sections against their
  detailed specs.
- [ ] Validate flow, voice, tool, and MCP sections against transport semantics.
- [ ] Document gaps or TODOs in a follow-up task or inline note.

## Notes

Focus on human review—no automated tooling expected beyond basic diffing.

#Todo
