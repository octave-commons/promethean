# Procedure: Extending Provider Strategies in Proxx

This document describes how to extend Proxx with new provider strategies, using the `auto:cephalon` implementation as an example.

## Overview

Proxx uses a strategy pattern for routing requests to upstream providers. The key components are:

1. **Provider Base URLs** - Configured via `UPSTREAM_PROVIDER_BASE_URLS` env var or `defaultProviderBaseUrl()` defaults
2. **API Key Providers** - Loaded from env vars like `ZEN_API_KEY`, `REQUESTY_API_TOKEN`, etc.
3. **Auto Model Selection** - Strategies like `auto:cheapest`, `auto:fastest`, `auto:cephalon`
4. **Provider Fallback Order** - Controlled by `UPSTREAM_PROVIDER_ID` and `UPSTREAM_FALLBACK_PROVIDER_IDS`

## Step 1: Add a New Provider

### 1a. Add Base URL Configuration

In `orgs/open-hax/proxx/src/lib/config.ts`:

```typescript
function defaultProviderBaseUrl(providerId: string): string {
  switch (providerId.trim().toLowerCase()) {
    // Add your provider
    case "my-provider":
      return (process.env.MY_PROVIDER_BASE_URL ?? "https://api.my-provider.com/v1").replace(/\/+$/, "");
    // ... other cases
  }
}
```

Also add to the `providerBaseUrlsFromEnv` defaults:

```typescript
const upstreamProviderBaseUrls = providerBaseUrlsFromEnv("UPSTREAM_PROVIDER_BASE_URLS", {
  // ... existing providers
  "my-provider": defaultProviderBaseUrl("my-provider"),
});
```

### 1b. Add API Key Support

In `orgs/open-hax/proxx/src/lib/key-pool.ts`, add to `readProvidersFromEnv()`:

```typescript
const myProviderKey = (process.env.MY_PROVIDER_API_KEY ?? "").trim();
if (myProviderKey) {
  providers.set(
    normalizeProviderId(process.env.MY_PROVIDER_PROVIDER_ID ?? "my-provider"),
    createEnvProviderState(process.env.MY_PROVIDER_PROVIDER_ID ?? "my-provider", myProviderKey),
  );
}
```

### 1c. Mark as OpenAI-Compatible (if applicable)

If the provider uses OpenAI-compatible `/v1/chat/completions` endpoints:

In `orgs/open-hax/proxx/src/lib/provider-routing.ts`:
```typescript
const OPENAI_COMPATIBLE_API_PROVIDERS = new Set(["vivgrid", "openai", "factory", "requesty", "zen", "my-provider"]);
```

In `orgs/open-hax/proxx/src/lib/provider-strategy/shared.ts`:
```typescript
function providerUsesOpenAiChatCompletions(providerId: string): boolean {
  const normalized = providerId.trim().toLowerCase();
  return normalized === "ob1" || normalized === "openrouter" || normalized === "requesty" || normalized === "zen" || normalized === "my-provider";
}
```

## Step 2: Create a Provider Strategy (if needed)

Most OpenAI-compatible providers work with the existing `ChatCompletionsProviderStrategy`. If you need custom behavior:

1. Create `orgs/open-hax/proxx/src/lib/provider-strategy/strategies/my-provider.ts`
2. Export a class extending `BaseProviderStrategy` or `TransformedJsonProviderStrategy`
3. Register in `orgs/open-hax/proxx/src/lib/provider-strategy/registry.ts`

## Step 3: Create an Auto Model Strategy

For strategies like `auto:cephalon` that need custom provider ordering:

### 3a. Create the Strategy File

In `orgs/open-hax/proxx/src/lib/provider-strategy/strategies/cephalon.ts`:

```typescript
import { isAutoModel, rankAutoModels, selectAutoModel } from "../../auto-model-selector.js";
import type { ResolvedModelCatalog } from "../../provider-routing.js";
import type { RequestLogStore } from "../../request-log-store.js";
import type { AccountHealthStore } from "../../db/account-health-store.js";
import type { ProviderFallbackExecutionResult } from "../shared.js";

const CEPHALON_PROVIDER_ORDER: readonly string[] = [
  "ollama-cloud",
  "requesty",
  "zen",
  "openai",
  "ollama-stealth",
  "ollama-big-ussy",
];

export function isCephalonAutoModel(model: string): boolean {
  const normalized = model.trim().toLowerCase();
  return normalized === "auto:cephalon" || normalized.startsWith("auto:cephalon:");
}

export function resolveCephalonAutoModel(...) {
  // Custom model selection logic
}

export function reorderCephalonProviderRoutes(
  routes: readonly { readonly providerId: string; readonly baseUrl: string }[],
): { readonly providerId: string; readonly baseUrl: string }[] {
  // Reorder routes to match CEPHALON_PROVIDER_ORDER
}
```

### 3b. Integrate with Auto Model Selection

The strategy functions are called from the routing layer to:
1. Detect if the model is `auto:cephalon`
2. Resolve to a concrete model
3. Reorder provider routes

## Environment Variables

### New Provider

| Variable | Description | Example |
|----------|-------------|---------|
| `MY_PROVIDER_API_KEY` | API key for the provider | `sk-...` |
| `MY_PROVIDER_BASE_URL` | Base URL for the provider | `https://api.my-provider.com/v1` |
| `MY_PROVIDER_PROVIDER_ID` | Override provider ID | `my-provider` |

### Using as Fallback

```bash
UPSTREAM_PROVIDER_ID=ollama-cloud
UPSTREAM_FALLBACK_PROVIDER_IDS=requesty,zen,openai
```

### OpenAI-Compatible API Keys

For providers that accept OpenAI-style API keys:

```json
{
  "providers": [
    {
      "providerId": "zen",
      "authType": "api_key",
      "accounts": [
        {
          "id": "zen-main",
          "apiKey": "sk-..."
        }
      ]
    }
  ]
}
```

Or via `PROXY_KEYS_JSON`:

```bash
PROXY_KEYS_JSON='{"providers":[{"providerId":"zen","authType":"api_key","accounts":[{"id":"zen-main","apiKey":"..."}]}]}'
```

## Example: Adding Zen Provider

1. **Base URL**: Added `case "zen"` in `defaultProviderBaseUrl()` ↦ `https://opencode.ai/zen/v1`
2. **Env vars**: `ZEN_API_KEY`, `ZEN_BASE_URL` (optional override)
3. **OpenAI-compatible**: Added to `OPENAI_COMPATIBLE_API_PROVIDERS` and `providerUsesOpenAiChatCompletions()`

The Zen provider uses OpenAI-compatible `/v1/chat/completions` and `/v1/models` endpoints, so it works with the existing `ChatCompletionsProviderStrategy`.

## Example: Adding Local Ollama Endpoints

For named Ollama endpoints with different base URLs:

1. **Base URLs**: Added `ollama-stealth` (laptop) and `ollama-big-ussy` (server)
2. **Env vars**: `OLLAMA_STEALTH_BASE_URL`, `OLLAMA_BIG_USSY_BASE_URL`
3. **Routing**: These appear in `UPSTREAM_PROVIDER_BASE_URLS` and can be used as fallbacks

## Testing

1. **Type check**: `pnpm exec tsc --noEmit`
2. **Unit tests**: `pnpm test`
3. **Manual**: Set env vars and verify provider appears in `/v1/models`

## Deployment

1. Sync code to target host
2. Set environment variables in `.env` or compose file
3. Restart the proxy service
4. Verify via health endpoint or logs