---
uuid: "6b5e14b9-ede4-4d06-a2d5-0284601aad5a"
title: "Fix Kanban Column Underscore Normalization Bug"
slug: "Fix Kanban Column Underscore Normalization Bug"
status: "breakdown"
priority: "P0"
labels: ["kanban", "column", "bug", "fix"]
created_at: "2025-10-12T23:41:48.142Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


# Critical Bug: Kanban Column Underscore Normalization

## Root Cause
Multiple components strip underscores from column names during normalization:
- `packages/kanban/src/lib/kanban.ts` (line 58-62)
- `packages/kanban/src/cli/command-handlers.ts` (line 29) 
- `packages/kanban/src/lib/transition-rules.ts` (line 269-275)
- `docs/agile/rules/kanban-transitions.clj` (line 6-11)

## Fix Required
Change regex patterns to preserve underscores:
- TypeScript: `.replace(/[^a-z0-9_]+/g, '')`
- Clojure: `(str/replace #"\s+" "")`

## Files to Update
1. packages/kanban/src/lib/kanban.ts
2. packages/kanban/src/cli/command-handlers.ts  
3. packages/kanban/src/lib/transition-rules.ts
4. docs/agile/rules/kanban-transitions.clj

## Test Cases
- `in_progress` column transitions work
- Multiple underscores: `time_to_completion`
- Mixed separators handled correctly
- Backward compatibility maintained

Priority: P0 - Blocks core kanban functionality

