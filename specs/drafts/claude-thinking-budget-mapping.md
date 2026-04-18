# Spec Draft: Safe Claude Thinking Budget Mapping for OpenAI `reasoning_effort`

## Summary
Map OpenAI reasoning effort levels (`none`, `low`, `medium`, `high`, `xhigh`) onto Anthropic-style thinking behavior for messages-compatible Claude models, while keeping generated `thinking` payloads inside safe Anthropic limits when `max_tokens` is constrained.

## Open Questions
- None blocking for this slice. Current scope assumes messages-compatible thinking models follow Anthropic-style `budget_tokens` rules.

## Risks
- Oversized thinking budgets can make upstream messages requests invalid when `max_tokens` is small.
- Auto-routed plain `claude-*` traffic could miss the clamp if a later provider strategy mutates `max_tokens` after the initial mapping.
- Shared helper changes must not regress explicit `thinking` payload passthrough.

## Priority
High — current reasoning control mapping can overshoot Anthropic thinking constraints, especially when a provider injects or forwards smaller `max_tokens` values.

## Implementation Phases
1. **Investigation**
   - Confirm the current `reasoning_effort` mapping in `src/lib/messages-compat.ts`.
   - Verify Anthropic thinking constraints relevant to safe budgeting.
2. **Implementation**
   - Add explicit GPT-effort → thinking-budget mapping for `none|low|medium|high|xhigh`.
   - Clamp enabled thinking budgets below request `max_tokens` and reject impossible budgets early.
   - Ensure the same normalization still applies when plain `claude-*` auto-routes into the Factory Claude strategy.
3. **Verification**
   - Add unit coverage for effort mapping, `max_tokens` clamping, and too-small `max_tokens` rejection.
   - Run targeted tests and a package build.

## Affected Files
- `src/lib/messages-compat.ts`
- `src/lib/provider-strategy/strategies/factory.ts`
- `src/tests/messages-compat.test.ts`
- `src/tests/factory-strategy.test.ts`
- `specs/drafts/claude-thinking-budget-mapping.md`
- `receipts.log`

## Dependencies
- Messages compatibility layer used by standard and Factory Anthropic routing.

## Existing Issues / PRs
- None referenced.

## Definition of Done
- `none`, `low`, `medium`, `high`, and `xhigh` map to deterministic Claude thinking behavior/budgets.
- Thinking budgets stay below `max_tokens` for messages-compatible thinking models.
- Plain `claude-*` auto-routing gets the same safe thinking budget normalization as explicit `factory/claude-*` routing.
- Requests that cannot satisfy the Anthropic minimum fail early instead of producing unsafe upstream payloads.
- Targeted tests and build pass.

## Progress
- [x] Investigation: located current `reasoning_effort` mapping in `src/lib/messages-compat.ts` and confirmed it collapses `minimal` into `low` without `max_tokens` safety.
- [x] Implementation: added deterministic `none|low|medium|high|xhigh` handling, normalized enabled thinking budgets against `max_tokens`, and re-normalized Factory Claude payloads after default `max_tokens` injection.
- [x] Verification: `pnpm test` (291/291) passed after adding unit coverage for direct bracket mapping/clamping plus integration coverage for both explicit `factory/claude-*` and auto-routed plain `claude-*` Factory paths.
