---
uuid: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"
title: "Eliminate any Types in omni-service Package"
slug: "eliminate-any-types-omni-service"
status: "incoming"
priority: "P1"
labels: ["typescript", "type-safety", "omni-service", "any-types"]
created_at: "2025-10-14T10:30:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Description

The `packages/omni-service` package contains excessive use of `any` types (100+ instances) particularly in request extensions, adapter configurations, and test files. This reduces type safety and makes the codebase error-prone.

## Acceptance Criteria

- [ ] Replace all `any` types in `packages/omni-service/src/app.ts` with proper TypeScript interfaces
- [ ] Create proper type definitions for request extensions and adapter configurations
- [ ] Fix `any` types in test files with appropriate test-specific types
- [ ] Eliminate `any` types in `packages/omni-service/src/adapters/` directory
- [ ] Ensure all TypeScript compilation passes without any `any` usage
- [ ] Add type tests to verify type safety improvements

## Technical Details

**Target Files:**

- `packages/omni-service/src/app.ts` - Request extensions
- `packages/omni-service/src/adapters/` - Adapter configurations
- `packages/omni-service/src/tests/` - Test files

**Current Issues:**

- 100+ instances of `any` types across the package
- Request extensions using `any` instead of proper interfaces
- Adapter configurations lacking proper type definitions
- Test files using `any` for mock objects

**Type Safety Improvements:**

1. Create interfaces for request extensions:

   ```typescript
   interface EnhancedRequest {
     user?: UserContext;
     session?: SessionData;
     // other extension properties
   }
   ```

2. Define adapter configuration types:

   ```typescript
   interface AdapterConfig {
     type: string;
     options: Record<string, unknown>;
     // other config properties
   }
   ```

3. Create test-specific types for mocks and fixtures

## Dependencies

- None (can be worked on independently)

## Risk Assessment

**Medium Risk:** Type changes may affect dependent packages
**Mitigation:** Use incremental approach and ensure backward compatibility where needed
