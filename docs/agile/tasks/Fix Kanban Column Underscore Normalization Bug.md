---
uuid: "6b5e14b9-ede4-4d06-a2d5-0284601aad5a"
title: "Fix Kanban Column Underscore Normalization Bug"
slug: "Fix Kanban Column Underscore Normalization Bug"
status: "breakdown"
priority: "P0"
labels: ["kanban", "column", "bug", "fix"]
created_at: "Sun Oct 12 2025 18:59:36 GMT-0500 (Central Daylight Time)"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Fix Kanban Column Underscore Normalization Bug

## Description

Critical bug in kanban column normalization where underscores in column names are not being properly handled, causing display and routing issues.

## Root Cause

- Column name normalization logic doesn't properly handle underscore-to-space conversion
- Affects task routing and board generation

## Solution

- Fix normalization function in kanban board code
- Add tests for edge cases with underscores
- Update documentation

## Impact

- High priority - affects core kanban functionality
- Blocks other kanban-related work
