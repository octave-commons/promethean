# TODOs for plugin-parity-001 (Event-Driven Plugin Hooks)

This memory records the planned subtasks, estimates, files, and acceptance criteria for the Event-Driven Plugin Hooks feature.

## Acceptance Criteria
- Hook system can intercept any tool execution
- Hooks can modify input/output data safely
- Priority-based hook execution works correctly
- Error handling prevents system failures
- Performance monitoring tracks hook execution time
- Comprehensive test coverage achieved
- Documentation with examples provided

## Phased Plan (subtasks)

1) Types & Contracts — 1 day
- Create: packages/opencode-client/src/types/plugin-hooks.ts
- Define HookContext, ToolExecuteHook, HookReturn, HookPriority, HookRegistration API
- Include JSDoc comments and examples

2) Hook Manager Implementation — 2 days
- Create: packages/opencode-client/src/hooks/tool-execute-hooks.ts
- Provide registration API: registerBefore, registerAfter, unregister
- Ensure priority ordering, safe mutation semantics (clone inputs), context propagation
- Implement performance monitoring, timeout wrapper, and rollback/error hooks
- Export runBeforeHooks(toolMeta, input) and runAfterHooks(toolMeta, output)

3) Plugin Integration & Exports — 1.5 days
- Create: packages/opencode-client/src/plugins/event-hooks.ts
- Modify: packages/opencode-client/src/plugins/index.ts (export & register plugin)
- Plugin should attach to tool execution lifecycle and call the hook manager

4) Tests — 2 days
- Create tests: packages/opencode-client/src/hooks/__tests__/tool-execute-hooks.test.ts
- Cover registration, priority ordering, input/output mutation, error handling and rollback, timeout behavior, and performance reporting

5) Documentation & Examples — 0.5 day
- Add docs: docs/plugins/event-hooks.md or packages/opencode-client/HOOKS.md
- Provide examples: registering a before hook to modify inputs, an after hook to log outputs, handling errors

## Files to Create/Modify (summary)
- packages/opencode-client/src/types/plugin-hooks.ts (new)
- packages/opencode-client/src/hooks/tool-execute-hooks.ts (new)
- packages/opencode-client/src/plugins/event-hooks.ts (new)
- packages/opencode-client/src/plugins/index.ts (modify)
- packages/opencode-client/src/hooks/__tests__/tool-execute-hooks.test.ts (new)
- docs/plugins/event-hooks.md or packages/opencode-client/HOOKS.md (new)

## Estimates
- Total: ~7 days (1 + 2 + 1.5 + 2 + 0.5)

## Notes
- Keep operations pure where possible; hooks may return mutated copies rather than mutate in-place
- Timeout defaults: 2000ms per hook (configurable)
- Rollback: provide optional compensating hook or run registered rollback callbacks if a hook fails

