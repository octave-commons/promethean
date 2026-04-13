# Spec Draft: Provider Thinking Capability Mapping from Live proxx Models

## Summary
Pull the live model catalog from the running proxx API, identify provider/model families that expose reasoning or thinking controls, research their official thinking setup, and define a normalized mapping to GPT-style reasoning levels (`none|low|medium|high|xhigh`) where applicable.

## Open Questions
- Should the first slice be research + capability matrix only, or should it immediately drive runtime request translation for non-OpenAI/non-Claude providers that support thinking controls?
- For router providers (`vivgrid`, `requesty`), should capability mapping be modeled by underlying vendor family or only by documented router-level request parameters?
- For providers that support only on/off thinking or dedicated reasoning model variants, should `low|medium|high|xhigh` collapse to a single enablement state?

## Risks
- Some providers expose model-family-level thinking docs but not per-model hard guarantees, so mappings may require explicit confidence notes.
- Router providers may not preserve vendor-native thinking knobs across all upstreams.
- Overgeneralizing “reasoning” support from model branding could cause invalid request translation.

## Priority
High — user wants a live-catalog-backed reasoning capability map across accepted providers, not just GPT and Claude.

## Implementation Phases
1. **Investigation**
   - Pull the live `/v1/models` catalog from the running proxx API.
   - Identify active/accepted providers from runtime health and credentials APIs.
   - Group live models by likely provider/model family.
2. **Research**
   - Gather official docs for provider/model-family thinking controls.
   - Record whether each family supports: native GPT reasoning levels, token budgets, on/off thinking, dedicated thinking variants, or no documented control.
3. **Mapping Design**
   - Propose normalized `none|low|medium|high|xhigh` mappings where applicable.
   - Mark unsupported / not-applicable families explicitly.
4. **Implementation / Reporting**
   - Write the capability matrix into a tracked doc and, if confidence is sufficient, codify it into runtime mapping helpers/config.
5. **Verification**
   - Validate any code changes with focused tests and package verification.

## Affected Files
- `specs/drafts/provider-thinking-capability-mapping.md`
- `specs/drafts/provider-thinking-capability-report.md`
- `receipts.log`
- `src/lib/responses-compat.ts`
- `src/lib/provider-strategy/strategies/gemini.ts`
- `src/tests/proxy.test.ts`

## Dependencies
- Running proxx API at `127.0.0.1:8789`
- Provider/model documentation from official sources

## Existing Issues / PRs
- None referenced.

## Definition of Done
- Live proxx model list is captured and grouped by provider/model family.
- Each relevant family has a documented thinking setup from official docs or a clearly labeled gap.
- A normalized GPT-style reasoning mapping exists for applicable families.
- If runtime code is changed, tests pass.

## Progress
- [x] Investigation started: confirmed running proxx API on `127.0.0.1:8789`, fetched live `/v1/models`, and confirmed active providers from `/health`.
- [x] Research: gathered official provider/model-family docs covering OpenAI GPT effort levels, Anthropic extended thinking budgets, Gemini 2.5/3 thinking controls, Ollama `think`, DeepSeek `thinking`, GLM `enable_thinking`, MiniMax `reasoning_split`, Kimi thinking variants, and Vivgrid/Requesty surface capabilities.
- [x] Mapping Design: wrote the live capability matrix and normalized mapping recommendations in `specs/drafts/provider-thinking-capability-report.md`.
- [x] Implementation / Reporting: codified two high-confidence runtime fixes from the research — OpenAI Responses now preserves `xhigh`, and native Gemini routing now translates normalized reasoning into `thinkingConfig` plus maps Gemini thought parts back into `reasoning_content`.
- [x] Verification: `pnpm test` passed after adding regression coverage for GPT `xhigh` passthrough and Gemini 2.5/3 reasoning translation.
