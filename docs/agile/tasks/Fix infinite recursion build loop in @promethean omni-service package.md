---
uuid: "c63e188b-1e11-4ce7-a082-c8a26694e49d"
title: "Fix infinite recursion build loop in @promethean/omni-service package"
slug: "Fix infinite recursion build loop in @promethean omni-service package"
status: "accepted"
priority: "P1"
labels: ["build", "package", "infinite", "recursion"]
created_at: "2025-10-12T02:22:05.426Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































The omni-service package has an infinite recursion issue in its build script:

## Root Cause:
- Package.json build script calls 'pnpm build' which creates endless loop
- Build command references itself instead of running actual compilation

## Relevant Files:
- [[packages/omni-service/package.json]] - Build script configuration
- Need to define proper build command (likely tsc build)

Priority: P1 - Blocking all builds and tests

## ⛓️ Blocked By
Nothing

## ⛓️ Blocks
Nothing








































































































