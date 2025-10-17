---
title: Fix @promethean/agent entrypoint/exports to match emitted build artifacts
status: incoming
priority: P1
storyPoints: 5
tags: [release-blocker, package-fix, build-system, critical]
uuid: 3c306b0e-da10-4047-bbee-ef1df37f763f
created: 2025-10-16
---

## 🚨 RELEASE BLOCKER - CRITICAL ISSUE

**Problem:** @promethean/agent package.json claims main: "dist/index.cjs", types: "dist/index.d.ts", exports pointing to ./dist/index._ BUT no src/index.ts exists and dist/index._ is not being emitted

**Impact:** Any consumer trying to import @promethean/agent will fail at runtime/import - this blocks all agent package adoption

## Current State Analysis

### Package.json Claims

```json
{
  "main": "dist/index.cjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

### Reality

- ❌ No `src/index.ts` exists
- ❌ No `dist/index.cjs` being emitted
- ❌ No `dist/index.d.ts` being emitted
- ✅ `dist/nlp/index.*` exists (from src/nlp/index.ts)
- ✅ Other files build correctly (envelope.ts, runtime.ts)

### Root Cause

Missing `src/index.ts` file that should re-export the actual public API

## Acceptance Criteria

1. ✅ `pnpm pack` succeeds without errors
2. ✅ `node -e "require('@promethean/agent')"` works
3. ✅ ESM import works in example project
4. ✅ Build verification script passes
5. ✅ Both CJS and ESM imports work correctly
6. ✅ TypeScript types are properly generated

## Implementation Plan

### Phase 1: Create Missing Entry Point (P0)

- [ ] Analyze existing src/ structure to determine public API
- [ ] Create src/index.ts with proper re-exports
- [ ] Test build generates correct dist/index.\* files

### Phase 2: Fix Package Configuration (P0)

- [ ] Verify package.json main/exports match actual build output
- [ ] Ensure TypeScript config generates declaration files
- [ ] Test both CJS and ESM entry points work

### Phase 3: Build Verification (P1)

- [ ] Create build verification script
- [ ] Test pnpm pack creates valid package
- [ ] Verify import in consumer project works
- [ ] Add to CI to prevent regression

## Risk Assessment

**Risk Level:** HIGH - Release blocker
**Time to Fix:** 2-4 hours
**Dependencies:** None (self-contained fix)

## Next Actions

1. **IMMEDIATE:** Move to breakdown phase
2. **Create subtasks** for each implementation phase
3. **Execute fix** - this is blocking all agent adoption
4. **Verify** with consumer testing

---

**This task blocks all @promethean/agent usage and must be treated as highest priority.**
