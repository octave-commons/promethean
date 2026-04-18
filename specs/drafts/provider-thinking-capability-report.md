# Research Report: Live proxx Thinking Capability Matrix (2026-03-19)

## Runtime snapshot

### Live proxx API
- Verified healthy at `http://127.0.0.1:8789/health`.
- Active providers reported by `/health`:
  - `factory`
  - `gemini`
  - `ollama-cloud`
  - `openai`
  - `requesty`
  - `vivgrid`

### Live model catalog pulled from proxx
Source: authenticated `GET /v1/models` against the running local proxy.

#### Static models from `services/proxx/models.json`
- `claude-opus-4-5`
- `claude-opus-4-6`
- `DeepSeek-V3.2`
- `factory/claude-haiku-4-5-20251001`
- `factory/claude-opus-4-5-20251101`
- `factory/claude-opus-4-6`
- `factory/claude-opus-4-6-fast`
- `factory/claude-sonnet-4-5-20250929`
- `factory/claude-sonnet-4-6`
- `gemini-2.5-flash`
- `gemini-2.5-pro`
- `gemini-3.1-pro-preview`
- `gemini-3-flash-preview`
- `gemini-3-pro-preview`
- `glm-5`
- `gpt-5`
- `gpt-5.1`
- `gpt-5.1-codex`
- `gpt-5.1-codex-max`
- `gpt-5.2`
- `gpt-5.2-codex`
- `gpt-5.3-codex`
- `gpt-5.4`
- `gpt-5-mini`
- `Kimi-K2.5`
- `qwen3.5:2b-bf16`
- `qwen3.5:4b-q8_0`

#### Live non-static models (likely dynamic provider catalogs, especially Ollama-family catalogs)
- `cogito-2.1`
- `cogito-2.1:671b`
- `deepseek-v3.1`
- `deepseek-v3.1:671b`
- `deepseek-v3.2`
- `devstral-2`
- `devstral-2:123b`
- `devstral-small-2`
- `devstral-small-2:24b`
- `gemma3`
- `gemma3:12b`
- `gemma3:27b`
- `gemma3:4b`
- `glm-4.6`
- `glm-4.7`
- `gpt-oss`
- `gpt-oss:120b`
- `gpt-oss:20b`
- `kimi-k2`
- `kimi-k2:1t`
- `kimi-k2.5`
- `kimi-k2-thinking`
- `minimax-m2`
- `minimax-m2.1`
- `minimax-m2.5`
- `minimax-m2.7`
- `ministral-3`
- `ministral-3:14b`
- `ministral-3:3b`
- `ministral-3:8b`
- `mistral-large-3`
- `mistral-large-3:675b`
- `nemotron-3-nano`
- `nemotron-3-nano:30b`
- `nemotron-3-super`
- `qwen3.5`
- `qwen3.5:397b`
- `qwen3-coder`
- `qwen3-coder:480b`
- `qwen3-coder-next`
- `qwen3-next`
- `qwen3-next:80b`
- `qwen3-vl`
- `qwen3-vl:235b`
- `qwen3-vl:235b-instruct`
- `rnj-1`
- `rnj-1:8b`

## Canonical normalized levels
Use GPT-style normalized effort levels as the cross-provider vocabulary:
- `none`
- `low`
- `medium`
- `high`
- `xhigh`

## Mapping taxonomy

### 1. Identity mapping
Provider already accepts GPT-style effort levels directly.
- Example: OpenAI GPT-5 family.

### 2. Budgeted mapping
Provider exposes a token/thinking budget, so normalized effort maps to numeric tiers.
- Example: Claude `thinking.budget_tokens`, Gemini 2.5 `thinkingBudget`.

### 3. Categorical mapping
Provider exposes a smaller enum of reasoning levels, so normalized effort must collapse into supported categories.
- Example: Gemini 3 `thinkingLevel`.

### 4. Boolean mapping
Provider only exposes on/off reasoning.
- Example: Ollama `think`, DeepSeek `thinking.enabled`, GLM `enable_thinking`.

### 5. Variant-selection mapping
Provider/model family separates instant vs thinking into different model variants or mode toggles rather than a graded effort control.
- Example: Kimi K2.5 / `kimi-k2-thinking`.

### 6. Trace-splitting only
Provider can return reasoning traces separately but does not expose a reliable effort knob.
- Example: MiniMax `reasoning_split`.

## Provider + model-family matrix

| Provider / family | Live models in proxx | Official thinking setup | Recommended normalized mapping | Current proxx runtime status | Confidence |
| --- | --- | --- | --- | --- | --- |
| OpenAI GPT-5 / Codex / mini | `gpt-5`, `gpt-5.1`, `gpt-5.1-codex`, `gpt-5.1-codex-max`, `gpt-5.2`, `gpt-5.2-codex`, `gpt-5.3-codex`, `gpt-5.4`, `gpt-5-mini` | Official OpenAI GPT-5 docs expose `reasoning.effort` / `reasoning_effort` with `none|low|medium|high|xhigh`. | Identity: forward levels unchanged. | Implemented for Responses-family routing. `responses-compat.ts` now preserves `xhigh`. | High |
| OpenAI gpt-oss family (native OpenAI semantics) | `gpt-oss`, `gpt-oss:120b`, `gpt-oss:20b` | Official OpenAI open-weight docs describe configurable reasoning effort, but published ranges emphasize `low|medium|high`. | If served through native OpenAI/open-weight semantics: `low|medium|high` direct; `none`/`xhigh` require clipping or unsupported handling. If served through Ollama, treat as boolean `think`. | Not explicitly modeled in proxx; current routing depends on provider path. | Medium |
| Anthropic Claude via Messages / Factory Anthropic | `claude-opus-4-5`, `claude-opus-4-6`, `factory/claude-haiku-4-5-20251001`, `factory/claude-sonnet-4-5-20250929`, `factory/claude-sonnet-4-6`, `factory/claude-opus-4-5-20251101`, `factory/claude-opus-4-6`, `factory/claude-opus-4-6-fast` | Official Anthropic Messages docs expose `thinking: { type: "enabled", budget_tokens }`; minimum budget `1024`; budget must stay below `max_tokens`. | `none -> disabled`; `low -> 4096`; `medium -> 12288`; `high -> 24576`; `xhigh -> 32768`, then clamp below `max_tokens`. | Implemented in `src/lib/messages-compat.ts`, including Factory default-`max_tokens` re-normalization. | High |
| Gemini 2.5 Flash | `gemini-2.5-flash` | Official Google docs use `thinkingBudget`; `0` disables thinking; `-1` enables dynamic thinking; docs indicate range `0..24576`. | Budgeted: `none -> 0`; `low -> 6144`; `medium -> 12288`; `high -> 18432`; `xhigh -> 24576`. Clamp to model max. | Implemented in `src/lib/provider-strategy/strategies/gemini.ts`, including `includeThoughts` when a reasoning trace is requested. | High |
| Gemini 2.5 Pro | `gemini-2.5-pro` | Official Google docs use `thinkingBudget`; `-1` dynamic; docs indicate range `128..32768`; disabling thinking is not available. | Budgeted with no true off switch: `low -> 4096`; `medium -> 12288`; `high -> 24576`; `xhigh -> 32768`; `none` degrades to the minimal supported budget instead of `0`. | Implemented. | High |
| Gemini 3 Flash | `gemini-3-flash-preview` | Official Google docs say Gemini 3 Flash uses `thinkingLevel` with `minimal|low|medium|high`. | Categorical: `none -> minimal` (best possible near-off fallback), `low -> low`, `medium -> medium`, `high -> high`, `xhigh -> high`. | Implemented. | High |
| Gemini 3 Pro / 3.1 Pro | `gemini-3-pro-preview`, `gemini-3.1-pro-preview` | Official Google docs say Gemini 3 Pro-family uses `thinkingLevel` with `low|high`; no true off switch is documented. | Categorical: `none -> low` fallback, `low -> low`, `medium -> low`, `high -> high`, `xhigh -> high`. | Implemented. | Medium |
| Ollama native / ollama-cloud thinking-capable families | Likely dynamic Ollama families including `qwen3.5*`, `qwen3-*`, `gpt-oss*`, `deepseek-v3.1*`, `deepseek-v3.2`, `glm-4.6`, `glm-4.7`, `devstral*`, `gemma3*`, `ministral*`, `mistral-large-3*`, `nemotron*`, `cogito*`, `rnj-*` | Official Ollama docs expose a boolean `think` field on `/api/chat`; official Qwen docs also describe `/think` / `/no_think` style toggles. No multi-level budget is documented at the Ollama provider layer. | Boolean: `none -> think:false`; any of `low|medium|high|xhigh -> think:true`. No safe provider-level gradation beyond on/off. | Implemented in `src/lib/ollama-compat.ts`, with explicit request-log regression coverage for Ollama token tracking. | High for on/off, low for finer gradation |
| DeepSeek V3.1 / V3.2 family | `DeepSeek-V3.2`, `deepseek-v3.1`, `deepseek-v3.1:671b`, `deepseek-v3.2` | Official DeepSeek docs expose `thinking: { type: "enabled" | "disabled" }` (or dedicated reasoner usage), plus `reasoning_content`. No multi-level effort scale was found. | Boolean: `none -> disabled`; any other normalized level -> enabled. | Not implemented as a dedicated translation path in proxx. | High |
| GLM 4.7 / 5 family | `glm-4.6`, `glm-4.7`, `glm-5` | Official Z.AI / GLM docs describe turn-level thinking with `enable_thinking` true/false. No graded public effort scale was found. | Boolean: `none -> false`; any other normalized level -> true`. | Not implemented. | High |
| MiniMax M2 family | `minimax-m2`, `minimax-m2.1`, `minimax-m2.5`, `minimax-m2.7` | Official MiniMax OpenAI-compatible docs describe `extra_body.reasoning_split = true` and `message.reasoning_details`; this is trace separation, not a graded effort control. | Trace-splitting only: no safe `none|low|medium|high|xhigh` mapping. If the client requests reasoning traces, enable `reasoning_split`; otherwise leave unset. | Not implemented. | High |
| Kimi K2 / K2.5 family | `Kimi-K2.5`, `kimi-k2`, `kimi-k2:1t`, `kimi-k2.5`, `kimi-k2-thinking` | Official Moonshot materials describe Thinking vs Instant modes and dedicated thinking variants. Verified multi-level effort budgets were not found. | Variant-selection: `none -> instant/base model`; any non-none -> thinking-capable mode or `kimi-k2-thinking` variant if the provider exposes it. | Not implemented; would require model substitution or provider-specific flag handling. | Medium |
| Vivgrid OpenAI-compatible surface | Provider active; mixed families in live catalog | Official Vivgrid chat-completions docs explicitly expose `reasoning_effort` on their OpenAI-compatible API. | Identity for models/providers that actually honor the OpenAI field. For non-OpenAI vendor families, prefer vendor-specific controls only if separately documented. | Generic pass-through exists; no model-family-specific translation layer exists. | Medium |
| Requesty OpenAI-compatible + Anthropic-compatible surfaces | Provider active; mixed families in live catalog | Official Requesty docs confirm OpenAI-compatible routing and Anthropic Agent SDK routing. An explicit Requesty-native reasoning parameter doc was not found in this pass. | GPT-like models: likely pass through raw OpenAI reasoning fields. Claude-like models: budgeted mapping is only appropriate if proxx adds a true Anthropic Messages strategy for Requesty. | No explicit translation layer today. | Medium |

## Suggested first implementation order

1. **Keep OpenAI GPT `xhigh` intact**
   - High confidence, already fixed in this session by removing the old `xhigh -> high` downgrade in `src/lib/responses-compat.ts`.
2. **Gemini native translation**
   - Implemented in this session in `src/lib/provider-strategy/strategies/gemini.ts` using `thinkingConfig` plus `reasoning_content` extraction from thought parts.
3. **DeepSeek + GLM boolean thinking**
   - Add per-family request translation on OpenAI-compatible routes when the routed model clearly belongs to those families.
5. **MiniMax trace splitting**
   - Support `reasoning_split` when the client asks for reasoning traces.
6. **Kimi variant routing**
   - Treat as a larger design change because it likely requires model substitution rather than a request flag.

## Current code status vs research
- `src/lib/messages-compat.ts`
  - Claude budget mapping implemented.
- `src/lib/provider-strategy/strategies/factory.ts`
  - Claude/Factory re-normalization implemented.
- `src/lib/responses-compat.ts`
  - OpenAI GPT `xhigh` now preserved instead of being downgraded.
- `src/lib/provider-strategy/strategies/gemini.ts`
  - Gemini 2.5/3 thinking translation now implemented, including `thinkingConfig` generation and `reasoning_content` extraction from thought parts.
- `src/lib/ollama-compat.ts`
  - Ollama `think` translation now implemented and Ollama `thinking` responses map back into chat `reasoning_content`.
- `src/tests/proxy.test.ts`
  - Covers Ollama `think:true|false`, Ollama request-log token tracking, GPT `xhigh` passthrough, and Gemini 2.5/3 reasoning translation.
- Generic OpenAI-compatible router providers (`vivgrid`, `requesty`)
  - No per-model-family translation yet.

## Evidence references
- OpenAI GPT-5.2 docs + model/help references: `reasoning.effort` includes `none|low|medium|high|xhigh`.
- Anthropic docs: `thinking.budget_tokens`, minimum `1024`, must be below `max_tokens`.
- Google Gemini docs:
  - Gemini 2.5 uses `thinkingBudget`
  - Gemini 2.5 Flash range includes `0..24576` and can disable at `0`
  - Gemini 2.5 Pro range includes `128..32768` and cannot disable
  - Gemini 3 uses `thinkingLevel`
  - Gemini 3 Flash supports `minimal|low|medium|high`
  - Gemini 3 Pro supports `low|high`
- Ollama docs: `/api/chat` supports `think: true|false`.
- DeepSeek docs: `thinking: { type: enabled|disabled }`.
- GLM docs: `enable_thinking` turn-level toggle.
- MiniMax docs: `reasoning_split` and `reasoning_details`.
- Moonshot K2.5 docs/blog/repo: Thinking vs Instant modes and dedicated thinking variants.
- Vivgrid docs: OpenAI-compatible chat-completions docs explicitly show `reasoning_effort`.
- Requesty docs: OpenAI-compatible `/v1` and Anthropic Agent SDK routing confirmed; no explicit reasoning-effort doc found in this pass.
