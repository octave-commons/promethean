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
