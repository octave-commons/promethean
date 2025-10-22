---
uuid: "pantheon-core-001-complete-core-type-system-2025-10-20"
title: "Complete Core Type System"
slug: "pantheon-core-001-complete-core-type-system"
status: "incoming"
priority: "P0"
labels: ["pantheon", "core", "types", "implementation"]
created_at: "2025-10-20T00:00:00Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "755c38a693eb21fa9c676e29f6951152ef68e21f"
commitHistory:
  -
    sha: "755c38a693eb21fa9c676e29f6951152ef68e21f"
    timestamp: "2025-10-22 01:48:12 -0500\n\ndiff --git a/docs/agile/tasks/pantheon-core-001-complete-core-type-system.md b/docs/agile/tasks/pantheon-core-001-complete-core-type-system.md\nindex 4438f96f7..36dacee99 100644\n--- a/docs/agile/tasks/pantheon-core-001-complete-core-type-system.md\n+++ b/docs/agile/tasks/pantheon-core-001-complete-core-type-system.md\n@@ -1,15 +1,15 @@\n ---\n-uuid: 'pantheon-core-001-complete-core-type-system-2025-10-20'\n-title: 'Complete Core Type System'\n-slug: 'pantheon-core-001-complete-core-type-system'\n-status: 'incoming'\n-priority: 'P0'\n-labels: ['pantheon', 'core', 'types', 'implementation']\n-created_at: '2025-10-20T00:00:00Z'\n+uuid: \"pantheon-core-001-complete-core-type-system-2025-10-20\"\n+title: \"Complete Core Type System\"\n+slug: \"pantheon-core-001-complete-core-type-system\"\n+status: \"incoming\"\n+priority: \"P0\"\n+labels: [\"pantheon\", \"core\", \"types\", \"implementation\"]\n+created_at: \"2025-10-20T00:00:00Z\"\n estimates:\n-  complexity: 'medium'\n-  scale: 'task'\n-  time_to_completion: '1-2 days'\n+  complexity: \"\"\n+  scale: \"\"\n+  time_to_completion: \"\"\n ---\n \n # Complete Core Type System"
    message: "Update task: pantheon-core-001-complete-core-type-system-2025-10-20 - Update task: Complete Core Type System"
    author: "Error"
    type: "update"
---

# Complete Core Type System

## Description

Complete and enhance the core type system in `packages/pantheon-core/src/core/types.ts` to cover all agent-related concepts including enhanced message types, context sources, behavior modes, talent compositions, and action types.

## Acceptance Criteria

- [ ] All core types are properly defined with TypeScript interfaces
- [ ] Type system supports actor scripts with multiple talents and behaviors
- [ ] Message types include role, content, and optional images
- [ ] Context sources support dynamic filtering and metadata
- [ ] Behavior modes include active, passive, and persistent states
- [ ] Action types cover tool invocation, messaging, and actor spawning
- [ ] Tool specifications include runtime type (MCP, local, HTTP)
- [ ] All types have comprehensive JSDoc documentation
- [ ] Type system is exported and available for import by other modules

## Definition of Done

Core type system is complete, documented, and exported. All type definitions pass TypeScript compilation and provide clear interfaces for the rest of the framework.

## Dependencies

- None

## Implementation Notes

1. Review existing types in `packages/pantheon-core/src/core/types.ts`
2. Identify missing types based on the consolidation plan
3. Add comprehensive JSDoc documentation
4. Ensure all types are properly exported
5. Verify TypeScript compilation succeeds
6. Test type imports from other modules

## Related Files

- `packages/pantheon-core/src/core/types.ts`
- `packages/pantheon-core/src/index.ts`
- `.serena/memories/pantheon-consolidation-plan.md`
