## Signal

The `/api/tools/websearch` route provides a unified web search API that attempts OpenAI's `web_search` tool with fallback to Exa MCP, returning structured results with extracted citations.

## Evidence

**Core Architecture:**

1. **Input Validation** (lines 96-110): Validates `query` (required string), normalizes `numResults` to 1-20 range (default 8), accepts optional `searchContextSize` (low/medium/high), `allowedDomains` array (max 50), and `model` string.

2. **Model Selection** (lines 119-128): Builds a unique model list from requested model + `OPEN_HAX_WEBSEARCH_FALLBACK_MODEL` env var (defaults to `gpt-5.2`). Deduplicates while preserving order.

**Key Helpers:**

- `exaWebSearch()` (lines 32-89): Handles MCP JSON-RPC protocol for Exa, with 25s timeout, abort signal composition, and markdown link extraction
- `buildUserText()` (lines 147-155): Constructs the user prompt with optional domain restrictions

## Frames

1. **Intentional Fallback Cascade**: The double-loop (models × domain-in-tool vs domain-in-prompt) suggests hard-won experience with OpenAI's `allowed_domains` parameter being unreliable or inconsistently supported across model versions.

2. **MCP-as-Backup**: Exa is treated as a safety net, not a peer—activated only after OpenAI failures, gated by env var, returns fewer metadata fields (no `responseId` or `model`).

3. **Internal Injection Pattern**: Uses Fastify's `inject()` to call the internal `/v1/responses` endpoint rather than making external HTTP calls, keeping auth internal and avoiding network overhead.

## Countermoves

1. **Retry Budget Exhaustion**: The double-loop over models × domain-config could burn through rate limits quickly. A caller with 3 fallback models would generate 6 internal `/v1/responses` calls before hitting Exa.

2. **Silent Degradation**: If `OPEN_HAX_WEBSEARCH_EXA_FALLBACK=false` and all OpenAI attempts fail, the 502 error surfaces `lastErrorPayload` but doesn't distinguish between auth failures, rate limits, or model unavailability—callers can't adapt their retry strategy.

## Next

Read `orgs/open-hax/proxx/src/lib/response-utils.ts` to understand the citation extraction logic that bridges OpenAI's response format to the unified `sources` array.
