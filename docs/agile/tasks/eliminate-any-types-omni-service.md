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
lastCommitSha: "9c3205ece94db8b2aeda4e96357b01499f3622ab"
commitHistory:
  -
    sha: "9c3205ece94db8b2aeda4e96357b01499f3622ab"
    timestamp: "2025-10-19 17:05:17 -0500\n\ndiff --git a/docs/agile/tasks/design-migration-architecture.md b/docs/agile/tasks/design-migration-architecture.md\nindex 5bdde4fc6..7bbe3e91e 100644\n--- a/docs/agile/tasks/design-migration-architecture.md\n+++ b/docs/agile/tasks/design-migration-architecture.md\n@@ -10,11 +10,14 @@ estimates:\n   complexity: \"\"\n   scale: \"\"\n   time_to_completion: \"\"\n-lastCommitSha: \"deec21fe4553bb49020b6aa2bdfee1b89110f15d\"\n-commitHistory: \n-  - sha: \"deec21fe4553bb49020b6aa2bdfee1b89110f15d\"\n-    timestamp: \"2025-10-19T16:27:40.286Z\"\n-    action: \"Bulk commit tracking initialization\"\n+lastCommitSha: \"4da3944ab08e2638e6729fe2626600a23056266d\"\n+commitHistory:\n+  -\n+    sha: \"4da3944ab08e2638e6729fe2626600a23056266d\"\n+    timestamp: \"2025-10-19 17:05:17 -0500\\n\\ndiff --git a/docs/agile/tasks/design-migration-architecture 5.md b/docs/agile/tasks/design-migration-architecture 5.md\\nindex 4f3415376..5c157cc60 100644\\n--- a/docs/agile/tasks/design-migration-architecture 5.md\\t\\n+++ b/docs/agile/tasks/design-migration-architecture 5.md\\t\\n@@ -10,9 +10,12 @@ estimates:\\n   complexity: \\\"\\\"\\n   scale: \\\"\\\"\\n   time_to_completion: \\\"\\\"\\n-lastCommitSha: \\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\"\\n-commitHistory: \\n-  - sha: \\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\"\\n-    timestamp: \\\"2025-10-19T16:27:40.286Z\\\"\\n-    action: \\\"Bulk commit tracking initialization\\\"\\n+lastCommitSha: \\\"6ef6798a4ee44151cd7262e763ba91bc95f5dd61\\\"\\n+commitHistory:\\n+  -\\n+    sha: \\\"6ef6798a4ee44151cd7262e763ba91bc95f5dd61\\\"\\n+    timestamp: \\\"2025-10-19 17:05:17 -0500\\\\n\\\\ndiff --git a/docs/agile/tasks/design-migration-architecture 4.md b/docs/agile/tasks/design-migration-architecture 4.md\\\\nindex e5d6dad8e..dab9ff9f1 100644\\\\n--- a/docs/agile/tasks/design-migration-architecture 4.md\\\\t\\\\n+++ b/docs/agile/tasks/design-migration-architecture 4.md\\\\t\\\\n@@ -10,9 +10,12 @@ estimates:\\\\n   complexity: \\\\\\\"\\\\\\\"\\\\n   scale: \\\\\\\"\\\\\\\"\\\\n   time_to_completion: \\\\\\\"\\\\\\\"\\\\n-lastCommitSha: \\\\\\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\\\\\"\\\\n-commitHistory: \\\\n-  - sha: \\\\\\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\\\\\"\\\\n-    timestamp: \\\\\\\"2025-10-19T16:27:40.286Z\\\\\\\"\\\\n-    action: \\\\\\\"Bulk commit tracking initialization\\\\\\\"\\\\n+lastCommitSha: \\\\\\\"66339afdc3d05c596c0d73fbdf327d46b94612b3\\\\\\\"\\\\n+commitHistory:\\\\n+  -\\\\n+    sha: \\\\\\\"66339afdc3d05c596c0d73fbdf327d46b94612b3\\\\\\\"\\\\n+    timestamp: \\\\\\\"2025-10-19 17:05:17 -0500\\\\\\\\n\\\\\\\\ndiff --git a/docs/agile/tasks/design-migration-architecture 3.md b/docs/agile/tasks/design-migration-architecture 3.md\\\\\\\\nindex 3f5fe1b4f..99e2f36f1 100644\\\\\\\\n--- a/docs/agile/tasks/design-migration-architecture 3.md\\\\\\\\t\\\\\\\\n+++ b/docs/agile/tasks/design-migration-architecture 3.md\\\\\\\\t\\\\\\\\n@@ -10,9 +10,12 @@ estimates:\\\\\\\\n   complexity: \\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"\\\\\\\\n   scale: \\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"\\\\\\\\n   time_to_completion: \\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"\\\\\\\\n-lastCommitSha: \\\\\\\\\\\\\\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\\\\\\\\\\\\\"\\\\\\\\n-commitHistory: \\\\\\\\n-  - sha: \\\\\\\\\\\\\\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\\\\\\\\\\\\\"\\\\\\\\n-    timestamp: \\\\\\\\\\\\\\\"2025-10-19T16:27:40.286Z\\\\\\\\\\\\\\\"\\\\\\\\n-    action: \\\\\\\\\\\\\\\"Bulk commit tracking initialization\\\\\\\\\\\\\\\"\\\\\\\\n+lastCommitSha: \\\\\\\\\\\\\\\"9f2ccf31b47929854d93f77184a585db9219078b\\\\\\\\\\\\\\\"\\\\\\\\n+commitHistory:\\\\\\\\n+  -\\\\\\\\n+    sha: \\\\\\\\\\\\\\\"9f2ccf31b47929854d93f77184a585db9219078b\\\\\\\\\\\\\\\"\\\\\\\\n+    timestamp: \\\\\\\\\\\\\\\"2025-10-19 17:05:16 -0500\\\\\\\\\\\\\\\\n\\\\\\\\\\\\\\\\ndiff --git a/docs/agile/tasks/design-migration-architecture 2.md b/docs/agile/tasks/design-migration-architecture 2.md\\\\\\\\\\\\\\\\nindex af241e5a8..40cb615d3 100644\\\\\\\\\\\\\\\\n--- a/docs/agile/tasks/design-migration-architecture 2.md\\\\\\\\\\\\\\\\t\\\\\\\\\\\\\\\\n+++ b/docs/agile/tasks/design-migration-architecture 2.md\\\\\\\\\\\\\\\\t\\\\\\\\\\\\\\\\n@@ -10,9 +10,12 @@ estimates:\\\\\\\\\\\\\\\\n   complexity: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n   scale: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n   time_to_completion: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n-lastCommitSha: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n-commitHistory: \\\\\\\\\\\\\\\\n-  - sha: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n-    timestamp: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"2025-10-19T16:27:40.286Z\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n-    action: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"Bulk commit tracking initialization\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n+lastCommitSha: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"f9f3d222ecfeb39b0f8d55b7c46b2a72abcfd630\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n+commitHistory:\\\\\\\\\\\\\\\\n+  -\\\\\\\\\\\\\\\\n+    sha: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"f9f3d222ecfeb39b0f8d55b7c46b2a72abcfd630\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n+    timestamp: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"2025-10-19T22:05:16.732Z\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n+    message: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"Update task: bc0ba923-8fd2-4bae-87a5-7db523716f6a - Update task: Design Migration Architecture\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n+    author: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"Error <foamy125@gmail.com>\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n+    type: \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"update\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\n ---\\\\\\\\\\\\\\\"\\\\\\\\n+    message: \\\\\\\\\\\\\\\"Update task: bc0ba923-8fd2-4bae-87a5-7db523716f6a - Update task: Design Migration Architecture\\\\\\\\\\\\\\\"\\\\\\\\n+    author: \\\\\\\\\\\\\\\"Error\\\\\\\\\\\\\\\"\\\\\\\\n+    type: \\\\\\\\\\\\\\\"update\\\\\\\\\\\\\\\"\\\\\\\\n ---\\\\\\\"\\\\n+    message: \\\\\\\"Update task: 89cb8912-5cb0-4b56-a409-e43a73d03382 - Update task: Design Migration Architecture\\\\\\\"\\\\n+    author: \\\\\\\"Error\\\\\\\"\\\\n+    type: \\\\\\\"update\\\\\\\"\\\\n ---\\\"\\n+    message: \\\"Update task: 231d601c-ff3d-4373-8a66-c021963d991d - Update task: Design Migration Architecture\\\"\\n+    author: \\\"Error\\\"\\n+    type: \\\"update\\\"\\n ---\"\n+    message: \"Update task: 2c0f6e81-c18e-43e1-8919-38f4049f1e92 - Update task: Design Migration Architecture\"\n+    author: \"Error\"\n+    type: \"update\"\n ---\n \n # Design Migration Architecture"
    message: "Update task: task-design-migration-arch-2025-10-15 - Update task: Design Migration Architecture"
    author: "Error"
    type: "update"
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
