---
uuid: "eidolon-field-service-migration"
title: "Migrate eidolon-field service to TypeScript"
slug: "migrate-eidolon-field-service-to-ts"
status: "breakdown"
priority: "P3"
labels: ["board", "lang"]
created_at: "2025-10-08T00:00:00.000Z"
estimates:
  complexity: 3
  scale: 2
  time_to_completion: "4 hours"
---

# Migrate eidolon-field service to TypeScript

Migrate the legacy eidolon-field JavaScript service to TypeScript under the new package structure.

## Goals

- Update eidolon-field package name to reflect new namespace
- Refactor under new tsconfig configuration
- Ensure eidolon-field functionality remains intact
- Add proper TypeScript types

## Acceptance Criteria

- [ ] Package renamed with proper namespace
- [ ] All .js files converted to .ts
- [ ] TypeScript compilation passes
- [ ] Eidolon-field functionality preserved
- [ ] Tests updated and passing
