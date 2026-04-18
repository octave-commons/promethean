import type { FastifyReply } from "fastify";

import type { ProxyConfig } from "../config.js";
import type { AccountHealthStore } from "../db/account-health-store.js";
import type { EventStore } from "../db/event-store.js";
import type { ProviderCredential } from "../key-pool.js";
import type { PolicyEngine } from "../policy/index.js";
import type { PromptAffinityStore } from "../prompt-affinity-store.js";
import type { RequestLogStore } from "../request-log-store.js";
import { buildUpstreamHeadersForCredential, isRateLimitResponse, parseRetryAfterMs } from "../proxy.js";
import {
  extractTerminalResponseFromEventStream,
  responsesEventStreamToErrorPayload,
} from "../responses-compat.js";
import type { ProviderRoute } from "../provider-routing.js";
import {
  fetchWithResponseTimeout,
  responseIndicatesQuotaError,
  summarizeUpstreamError,
  toErrorMessage,
} from "../provider-utils.js";
import { getTelemetry } from "../telemetry/otel.js";
import { selectRemoteProviderStrategyForRoute } from "./registry.js";
import {
  PERMANENT_DISABLE_COOLDOWN_MS,
  buildCodexResponsesImagesBody,
  extractImagesFromCodexEventStream,
  extractImagesFromCodexResponse,
  joinUrl,
  providerAccountsForRequest,
  providerAccountsForRequestWithPolicy,
  reorderAccountsForLatency,
  reorderCandidatesForAffinity,
  responseLooksLikeEventStream,
  shouldCooldownCredentialOnAuthFailure,
  shouldPermanentlyDisableCredential,
  shouldRetrySameCredentialForServerError,
  sleep,
  transientRetryDelayMs,
  recordAttempt,
  updateFailedAttemptDiagnostics,
  updateUsageCountsFromResponse,
  type BuildPayloadResult,
  type FallbackAccumulator,
  type PreferredAffinity,
  type ProviderAttemptContext,
  type ProviderAvailabilitySummary,
  type ProviderFallbackExecutionResult,
  type ProviderStrategy,
  type StrategyRequestContext,
} from "./shared.js";

const REQUESTY_MODEL_PREFIXES: ReadonlyArray<readonly [string, string]> = [
  ["gpt-", "openai"],
  ["o1", "openai"],
  ["o3", "openai"],
  ["o4", "openai"],
  ["chatgpt-", "openai"],
  ["claude-", "anthropic"],
  ["gemini-", "google"],
  ["deepseek", "deepseek"],
  ["glm-", "zhipu"],
  ["kimi-", "moonshotai"],
  ["qwen", "qwen"],
];

function requestyModelPrefix(model: string): string {
  const lower = model.toLowerCase();
  for (const [prefix, provider] of REQUESTY_MODEL_PREFIXES) {
    if (lower.startsWith(prefix)) {
      return provider;
    }
  }
  return "openai";
}

export async function executeProviderFallback(
  strategy: ProviderStrategy,
  reply: FastifyReply,
  requestLogStore: RequestLogStore,
  promptAffinityStore: PromptAffinityStore,
  keyPool: {
    getRequestOrder(providerId: string): Promise<ProviderCredential[]>;
    markInFlight(credential: ProviderCredential): () => void;
    markRateLimited(credential: ProviderCredential, retryAfterMs?: number): void;
    isAccountExpired?(credential: ProviderCredential): boolean;
  },
  providerRoutes: readonly ProviderRoute[],
  context: StrategyRequestContext,
  payload: BuildPayloadResult,
  promptCacheKey?: string,
  refreshExpiredToken?: (credential: ProviderCredential) => Promise<ProviderCredential | null>,
  policy?: PolicyEngine,
  healthStore?: AccountHealthStore,
  eventStore?: EventStore,
): Promise<ProviderFallbackExecutionResult> {
  const accumulator: FallbackAccumulator = {
    sawRateLimit: false,
    sawRequestError: false,
    sawUpstreamServerError: false,
    sawUpstreamInvalidRequest: false,
    sawModelNotFound: false,
    sawModelNotSupportedForAccount: false,
    attempts: 0,
  };

  const candidatesByProvider: Record<string, Array<{ readonly providerId: string; readonly baseUrl: string; readonly account: ProviderCredential }>> = {};

  for (const route of providerRoutes) {
    let routeAccounts: ProviderCredential[];
    try {
      const rawAccounts = await keyPool.getRequestOrder(route.providerId);
      routeAccounts = policy
        ? providerAccountsForRequestWithPolicy(policy, rawAccounts, route.providerId, context.routedModel, {
            openAiPrefixed: context.openAiPrefixed,
            localOllama: context.localOllama,
            explicitOllama: context.explicitOllama,
          })
        : providerAccountsForRequest(rawAccounts, route.providerId, context.routedModel);
    } catch {
      continue;
    }

    routeAccounts = reorderAccountsForLatency(requestLogStore, route.providerId, routeAccounts, context.routedModel, strategy.mode);

    const routeCandidates = routeAccounts.map((account) => ({
      providerId: route.providerId,
      baseUrl: route.baseUrl,
      account,
    }));

    if (routeCandidates.length > 0) {
      candidatesByProvider[route.providerId] = routeCandidates;
    }
  }

  const preferredAffinity = promptCacheKey
    ? await promptAffinityStore.get(promptCacheKey).then((record) => record
      ? { providerId: record.providerId, accountId: record.accountId }
      : undefined)
    : undefined;

  const allCandidates = providerRoutes.flatMap((route) => candidatesByProvider[route.providerId] ?? []);

  const providerIndex = new Map(providerRoutes.map((route, index) => [route.providerId, index] as const));

  const sortedCandidates = [...allCandidates].sort((left, right) => {
    const idxLeft = providerIndex.get(left.providerId) ?? Number.MAX_SAFE_INTEGER;
    const idxRight = providerIndex.get(right.providerId) ?? Number.MAX_SAFE_INTEGER;

    // Respect provider ordering first (already policy-ordered), with an escape hatch
    // for significant TTFT differences.
    if (idxLeft !== idxRight) {
      const perfLeft = requestLogStore.getPerfSummary(left.providerId, left.account.accountId, context.routedModel, strategy.mode);
      const perfRight = requestLogStore.getPerfSummary(right.providerId, right.account.accountId, context.routedModel, strategy.mode);

      const ttftLeft = perfLeft?.ewmaTtftMs;
      const ttftRight = perfRight?.ewmaTtftMs;
      if (
        typeof ttftLeft === "number" && Number.isFinite(ttftLeft)
        && typeof ttftRight === "number" && Number.isFinite(ttftRight)
      ) {
        const ttftDelta = Math.abs(ttftLeft - ttftRight);
        if (ttftDelta > 120) {
          return ttftLeft - ttftRight;
        }
      }

      return idxLeft - idxRight;
    }

    // Within a provider, preserve upstream ordering (policy + account ordering + latency window).
    return 0;
  });

  const candidates = reorderCandidatesForAffinity(sortedCandidates, preferredAffinity);

  if (candidates.length === 0) {
    return {
      handled: false,
      candidateCount: 0,
      summary: accumulator
    };
  }

  let preferredReassignmentAllowed = preferredAffinity === undefined || candidates.every(
    (candidate) => candidate.providerId !== preferredAffinity.providerId || candidate.account.accountId !== preferredAffinity.accountId,
  );

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const candidateStrategy = selectRemoteProviderStrategyForRoute(context, candidate.providerId);
    let candidatePayload = candidateStrategy === strategy
      ? payload
      : candidateStrategy.buildPayload(context);

    // Requesty requires model names in "provider/model" format (e.g., "openai/gpt-5.4").
    if (candidate.providerId.trim().toLowerCase() === "requesty") {
      const model = typeof candidatePayload.upstreamPayload.model === "string"
        ? candidatePayload.upstreamPayload.model
        : "";
      if (model && !model.includes("/")) {
        const prefix = requestyModelPrefix(model);
        const prefixed = { ...candidatePayload.upstreamPayload, model: `${prefix}/${model}` };
        candidatePayload = { ...candidatePayload, upstreamPayload: prefixed, bodyText: JSON.stringify(prefixed) };
      }
    }

    const hasMoreCandidates = candidateIndex < candidates.length - 1;
    const releaseInFlight = keyPool.markInFlight(candidate.account);

    for (let retryIndex = 0; retryIndex <= context.config.upstreamTransientRetryCount; retryIndex += 1) {
      const baseProviderContext: Omit<ProviderAttemptContext, "attempt"> = {
        ...context,
        providerId: candidate.providerId,
        // This may be overridden per-attempt when `OPENAI_IMAGES_UPSTREAM_MODE=platform|auto`.
        baseUrl: candidate.baseUrl,
        account: candidate.account,
        hasMoreCandidates,
      };

      const primaryUpstreamPath = candidateStrategy.getUpstreamPath(baseProviderContext);
      const isOpenAiImages = candidate.providerId === context.config.openaiProviderId && candidateStrategy.mode === "images";

      type UpstreamStepKind = "default" | "openai_platform" | "openai_chatgpt" | "openai_codex_responses_images";
      type UpstreamStep = {
        readonly baseUrl: string;
        readonly upstreamPath: string;
        readonly kind: UpstreamStepKind;
        /** HTTP statuses that should fall through to the *next base URL* step (used for platform → ChatGPT). */
        readonly fallbackToNextBaseOnStatuses?: readonly number[];
      };

      const upstreamSteps: readonly UpstreamStep[] = (() => {
        if (!isOpenAiImages) {
          return [{ baseUrl: candidate.baseUrl, upstreamPath: primaryUpstreamPath, kind: "default" as const }];
        }
        const mode = context.config.openaiImagesUpstreamMode;

        // API keys should always use the Platform endpoint.
        if (candidate.account.authType === "api_key") {
          return [{ baseUrl: context.config.openaiApiBaseUrl, upstreamPath: primaryUpstreamPath, kind: "openai_platform" as const }];
        }

        // ChatGPT mode uses the Codex backend Responses stream + the built-in `image_generation`
        // tool, then translates the result back into an Images API-compatible response.
        if (mode === "chatgpt") {
          return [{
            baseUrl: context.config.openaiBaseUrl,
            upstreamPath: context.config.openaiResponsesPath,
            kind: "openai_codex_responses_images" as const,
          }];
        }

        if (mode === "platform") {
          return [{ baseUrl: context.config.openaiApiBaseUrl, upstreamPath: primaryUpstreamPath, kind: "openai_platform" as const }];
        }

        // auto: try Platform Images API first, then fall back to Codex Responses image generation
        // on auth/scope failures.
        return [
          {
            baseUrl: context.config.openaiApiBaseUrl,
            upstreamPath: primaryUpstreamPath,
            kind: "openai_platform" as const,
            fallbackToNextBaseOnStatuses: [401, 403],
          },
          {
            baseUrl: context.config.openaiBaseUrl,
            upstreamPath: context.config.openaiResponsesPath,
            kind: "openai_codex_responses_images" as const,
          },
        ];
      })();

      const hasRetryRemaining = retryIndex < context.config.upstreamTransientRetryCount;
      let shouldContinueTransientRetry = false;

      for (const [stepIndex, step] of upstreamSteps.entries()) {
        const upstreamPath = step.upstreamPath;
        accumulator.attempts += 1;
        const providerContext: ProviderAttemptContext = {
          ...baseProviderContext,
          baseUrl: step.baseUrl,
          attempt: accumulator.attempts,
        };

        const upstreamUrl = joinUrl(providerContext.baseUrl, upstreamPath);
        const upstreamHeaders = buildUpstreamHeadersForCredential(context.clientHeaders, candidate.account);
        candidateStrategy.applyRequestHeaders(upstreamHeaders, providerContext, candidatePayload.upstreamPayload);
        const attemptStartedAt = Date.now();

        const upstreamSpan = getTelemetry().startSpan("proxy.upstream_attempt", {
          "proxy.provider_id": candidate.providerId,
          "proxy.account_id": candidate.account.accountId,
          "proxy.auth_type": candidate.account.authType,
          "proxy.upstream_mode": candidateStrategy.mode,
          "proxy.upstream_path": upstreamPath,
          "proxy.model": context.routedModel,
          "proxy.requested_model": context.requestedModelInput,
          "proxy.base_url": providerContext.baseUrl,
          "proxy.fallback_attempt": accumulator.attempts,
        });
        upstreamSpan.setAttributes({
          "proxy.service_tier": candidatePayload.serviceTier,
          "proxy.service_tier_source": candidatePayload.serviceTierSource,
        });

        const isCodexResponsesImages = step.kind === "openai_codex_responses_images";
        const effectiveBody = isCodexResponsesImages
          ? buildCodexResponsesImagesBody(candidatePayload.upstreamPayload)
          : candidatePayload.bodyText;

        // Emit request event to the data lake before sending upstream.
        const attemptEntryId = `${candidate.providerId}:${candidate.account.accountId}:${Date.now()}`;
        if (eventStore) {
          eventStore.emitRequest(
            attemptEntryId,
            candidate.providerId,
            candidate.account.accountId,
            context.routedModel,
            candidatePayload.upstreamPayload,
            {
              upstreamMode: candidateStrategy.mode,
              upstreamPath,
              upstreamUrl,
              attempt: accumulator.attempts,
              requestedModel: context.requestedModelInput,
              serviceTier: candidatePayload.serviceTier,
            },
          );
        }

        let upstreamResponse: Response;
        try {
          upstreamResponse = await fetchWithResponseTimeout(upstreamUrl, {
            method: "POST",
            headers: upstreamHeaders,
            body: effectiveBody
          }, context.upstreamAttemptTimeoutMs);
        } catch (error) {
          const latencyMs = Date.now() - attemptStartedAt;
          upstreamSpan.setAttribute("proxy.latency_ms", latencyMs);
          upstreamSpan.setAttribute("proxy.status", 0);
          upstreamSpan.recordError(error);
          upstreamSpan.end();
          accumulator.sawRequestError = true;
          const logEntryId = recordAttempt(requestLogStore, providerContext, {
            providerId: candidate.providerId,
            accountId: candidate.account.accountId,
            authType: candidate.account.authType,
            upstreamPath,
            status: 0,
            latencyMs,
            serviceTier: candidatePayload.serviceTier,
            serviceTierSource: candidatePayload.serviceTierSource,
            error: toErrorMessage(error)
          }, candidateStrategy.mode);

          if (eventStore) {
            eventStore.emitError(attemptEntryId, candidate.providerId, candidate.account.accountId, context.routedModel, 0, {
              error: toErrorMessage(error),
              logEntryId,
            }, { latencyMs });
          }
          break;
        }

        const latencyMs = Date.now() - attemptStartedAt;
        upstreamSpan.setAttribute("proxy.status", upstreamResponse.status);
        upstreamSpan.setAttribute("proxy.latency_ms", latencyMs);

        const requestLogEntryId = recordAttempt(requestLogStore, providerContext, {
          providerId: candidate.providerId,
          accountId: candidate.account.accountId,
          authType: candidate.account.authType,
          upstreamPath,
          status: upstreamResponse.status,
          latencyMs,
          serviceTier: candidatePayload.serviceTier,
          serviceTierSource: candidatePayload.serviceTierSource,
          promptCacheKeyUsed: Boolean(promptCacheKey),
        }, candidateStrategy.mode);

        const diagnosticsPromise = updateFailedAttemptDiagnostics(
          requestLogStore,
          requestLogEntryId,
          upstreamResponse,
          candidate.providerId,
          candidatePayload.upstreamPayload,
          promptCacheKey,
        );

        // Emit error event for non-OK responses with the response body.
        if (eventStore && !upstreamResponse.ok) {
          try {
            const errorBody = await upstreamResponse.clone().json() as Record<string, unknown>;
            eventStore.emitError(
              attemptEntryId, candidate.providerId, candidate.account.accountId,
              context.routedModel, upstreamResponse.status, errorBody,
              { latencyMs, logEntryId: requestLogEntryId },
            );
          } catch {
            eventStore.emitError(
              attemptEntryId, candidate.providerId, candidate.account.accountId,
              context.routedModel, upstreamResponse.status,
              { status: upstreamResponse.status, statusText: upstreamResponse.statusText },
              { latencyMs, logEntryId: requestLogEntryId },
            );
          }
        }

        const usagePromise = updateUsageCountsFromResponse(
          requestLogStore,
          requestLogEntryId,
          upstreamResponse,
          candidateStrategy.mode,
          context.routedModel,
          candidate.providerId,
          context.config,
        );
        if (responseLooksLikeEventStream(upstreamResponse, candidateStrategy.mode) && context.clientWantsStream) {
          void usagePromise;
        } else {
          await usagePromise;
        }
        await diagnosticsPromise;

        // OpenAI image generation can target either Platform Images API (`api.openai.com`) or the
        // ChatGPT Codex Responses backend (`chatgpt.com/backend-api/codex/responses`).
        // When `OPENAI_IMAGES_UPSTREAM_MODE=auto`, fall back from Platform → Codex Responses on
        // scope/auth failures.
        if (isOpenAiImages) {
          const nextStep = stepIndex < upstreamSteps.length - 1 ? upstreamSteps[stepIndex + 1] : undefined;
          const canFallbackToNextBase =
            step.fallbackToNextBaseOnStatuses?.includes(upstreamResponse.status) === true
            && nextStep
            && nextStep.baseUrl !== step.baseUrl;

          if (canFallbackToNextBase) {
            try {
              await upstreamResponse.arrayBuffer();
            } catch {
              // ignore
            }
            upstreamSpan.setStatus("error", "openai_images_fallback_to_next_base");
            upstreamSpan.end();
            continue;
          }

          // NOTE: We intentionally do not attempt alternate paths for Codex Responses image
          // generation. If the configured Codex Responses path is invalid, treat it as an upstream
          // rejection.
        }

        if (isRateLimitResponse(upstreamResponse)) {
          accumulator.sawRateLimit = true;
          keyPool.markRateLimited(candidate.account, parseRetryAfterMs(upstreamResponse.headers.get("retry-after")));
          if (
            preferredAffinity
            && candidate.providerId === preferredAffinity.providerId
            && candidate.account.accountId === preferredAffinity.accountId
          ) {
            preferredReassignmentAllowed = true;
          }
          upstreamSpan.setStatus("error", "rate_limited");
          upstreamSpan.end();
          break;
        }

        if (await responseIndicatesQuotaError(upstreamResponse)) {
          accumulator.sawRateLimit = true;
          const permanentlyDisable = shouldPermanentlyDisableCredential(candidate.account, upstreamResponse.status);
          const quotaCooldownMs = permanentlyDisable
            ? PERMANENT_DISABLE_COOLDOWN_MS
            : upstreamResponse.status === 402
              ? 24 * 60 * 60 * 1000
              : Math.min(context.config.keyCooldownMs, 60_000);
          keyPool.markRateLimited(candidate.account, quotaCooldownMs);
          if (healthStore) {
            healthStore.recordFailure(candidate.account, upstreamResponse.status, "quota_exhausted");
          }
          if (
            preferredAffinity
            && candidate.providerId === preferredAffinity.providerId
            && candidate.account.accountId === preferredAffinity.accountId
          ) {
            preferredReassignmentAllowed = true;
          }
          try {
            await upstreamResponse.arrayBuffer();
          } catch {
            // Ignore body read failures while failing over.
          }
          upstreamSpan.setStatus("error", "quota_exhausted");
          upstreamSpan.end();
          break;
        }

        // Factory intermittently returns 403 during auth token rotation; retry once
        // just like a server error so the next attempt often succeeds.
        if (upstreamResponse.status === 403 && candidate.providerId === "factory" && hasRetryRemaining) {
          try { await upstreamResponse.arrayBuffer(); } catch { /* ignore */ }
          upstreamSpan.setStatus("error", "factory_transient_403");
          upstreamSpan.end();
          await sleep(transientRetryDelayMs(context, retryIndex));
          shouldContinueTransientRetry = true;
          break;
        }

        if (upstreamResponse.status >= 500 && upstreamResponse.status <= 599) {
          accumulator.sawUpstreamServerError = true;
          if (hasRetryRemaining && shouldRetrySameCredentialForServerError(upstreamResponse.status)) {
            try {
              await upstreamResponse.arrayBuffer();
            } catch {
              // Ignore body read failures while retrying.
            }
            upstreamSpan.setStatus("error", `upstream_server_error_${upstreamResponse.status}`);
            upstreamSpan.end();
            await sleep(transientRetryDelayMs(context, retryIndex));
            shouldContinueTransientRetry = true;
            break;
          }
          keyPool.markRateLimited(candidate.account, Math.min(context.config.keyCooldownMs, 5000));
          try {
            await upstreamResponse.arrayBuffer();
          } catch {
            // Ignore body read failures while failing over.
          }
          upstreamSpan.setStatus("error", `upstream_server_error_${upstreamResponse.status}`);
          upstreamSpan.end();
          break;
        }

        // Codex Responses API → Images API translation: read the streaming Responses output,
        // extract `image_generation_call` results, and synthesize an Images API JSON response.
        if (isCodexResponsesImages && upstreamResponse.ok) {
          const responseText = await upstreamResponse.text();
          const contentType = upstreamResponse.headers.get("content-type") ?? "";
          const looksLikeEventStream = contentType.toLowerCase().includes("text/event-stream") || contentType.length === 0;

          // Check for errors in the SSE stream.
          if (looksLikeEventStream) {
            const streamError = responsesEventStreamToErrorPayload(responseText);
            if (streamError) {
              upstreamSpan.setStatus("error", "codex_responses_stream_error");
              upstreamSpan.end();
              accumulator.sawUpstreamInvalidRequest = true;
              break;
            }
          }

          const imagesPayload = looksLikeEventStream
            ? extractImagesFromCodexEventStream(responseText)
            : extractImagesFromCodexResponse(responseText);

          if (imagesPayload) {
            reply.header("x-open-hax-upstream-provider", providerContext.providerId);
            reply.header("x-open-hax-upstream-mode", "codex_responses_images");
            reply.code(200);
            reply.header("content-type", "application/json");
            reply.send(imagesPayload);
            upstreamSpan.setStatus("ok");
            upstreamSpan.end();
            if (healthStore) {
              healthStore.recordSuccess(candidate.account, upstreamResponse.status);
            }
            releaseInFlight();
            return { handled: true, candidateCount: candidates.length, summary: accumulator };
          }

          // Responses completed but contained no image_generation_call outputs.
          upstreamSpan.setStatus("error", "codex_responses_no_image_output");
          upstreamSpan.end();
          accumulator.sawUpstreamInvalidRequest = true;
          break;
        }

        reply.header("x-open-hax-upstream-mode", candidateStrategy.mode);
        const outcome = await candidateStrategy.handleProviderAttempt(reply, upstreamResponse, providerContext);
        if (outcome.kind === "handled") {
          upstreamSpan.setStatus("ok");
          upstreamSpan.end();
          if (healthStore && upstreamResponse.ok) {
            healthStore.recordSuccess(candidate.account, upstreamResponse.status);
          }
          if (eventStore) {
            eventStore.emitResponse(
              attemptEntryId, candidate.providerId, candidate.account.accountId,
              context.routedModel, upstreamResponse.status, null,
              { latencyMs: Date.now() - attemptStartedAt, logEntryId: requestLogEntryId },
            );
          }
          if (
            promptCacheKey
            && (
              preferredAffinity === undefined
              || preferredReassignmentAllowed
              || (candidate.providerId === preferredAffinity.providerId && candidate.account.accountId === preferredAffinity.accountId)
            )
          ) {
            await promptAffinityStore.upsert(promptCacheKey, candidate.providerId, candidate.account.accountId);
          }
          releaseInFlight();
          return {
            handled: true,
            candidateCount: candidates.length,
            summary: accumulator
          };
        }

        if (
          healthStore
          && !upstreamResponse.ok
          && upstreamResponse.status >= 500
          && !outcome.upstreamInvalidRequest
          && !outcome.modelNotFound
          && !outcome.modelNotSupportedForAccount
        ) {
          healthStore.recordFailure(candidate.account, upstreamResponse.status);
        }

        accumulator.sawRateLimit ||= outcome.rateLimit === true;
        accumulator.sawRequestError ||= outcome.requestError === true;
        accumulator.sawUpstreamServerError ||= outcome.upstreamServerError === true;
        accumulator.sawUpstreamInvalidRequest ||= outcome.upstreamInvalidRequest === true;
        accumulator.sawModelNotFound ||= outcome.modelNotFound === true;
        accumulator.sawModelNotSupportedForAccount ||= outcome.modelNotSupportedForAccount === true;
        if (outcome.upstreamAuthError) {
          accumulator.lastUpstreamAuthError = outcome.upstreamAuthError;
        }

        if (!upstreamResponse.ok && outcome.requestError === true && upstreamResponse.status === 401 && candidate.account.authType === "oauth_bearer" && candidate.account.refreshToken && refreshExpiredToken) {
          const refreshedCredential = await refreshExpiredToken(candidate.account);
          if (refreshedCredential) {
            const refreshedProviderContext: ProviderAttemptContext = { ...providerContext, account: refreshedCredential };
            const refreshedHeaders = buildUpstreamHeadersForCredential(context.clientHeaders, refreshedCredential);
            candidateStrategy.applyRequestHeaders(refreshedHeaders, refreshedProviderContext, candidatePayload.upstreamPayload);
            const refreshedRelease = keyPool.markInFlight(refreshedCredential);
            const refreshedAttemptStartedAt = Date.now();
            let refreshedResponse: Response;
            try {
              refreshedResponse = await fetchWithResponseTimeout(upstreamUrl, {
                method: "POST",
                headers: refreshedHeaders,
                body: effectiveBody
              }, context.upstreamAttemptTimeoutMs);
            } catch (error) {
              refreshedRelease();
              releaseInFlight();
              throw error;
            }

            try {
              const refreshedLatencyMs = Date.now() - refreshedAttemptStartedAt;
              const refreshedLogId = recordAttempt(requestLogStore, refreshedProviderContext, {
                providerId: candidate.providerId,
                accountId: refreshedCredential.accountId,
                authType: refreshedCredential.authType,
                upstreamPath,
                status: refreshedResponse.status,
                latencyMs: refreshedLatencyMs,
                serviceTier: candidatePayload.serviceTier,
                serviceTierSource: candidatePayload.serviceTierSource,
                promptCacheKeyUsed: Boolean(promptCacheKey),
              }, candidateStrategy.mode);
              const refreshedDiagnosticsPromise = updateFailedAttemptDiagnostics(
                requestLogStore,
                refreshedLogId,
                refreshedResponse,
                candidate.providerId,
                candidatePayload.upstreamPayload,
                promptCacheKey,
              );
              const usagePromise = updateUsageCountsFromResponse(
                requestLogStore,
                refreshedLogId,
                refreshedResponse,
                candidateStrategy.mode,
                context.routedModel,
                candidate.providerId,
                context.config,
              );
              if (responseLooksLikeEventStream(refreshedResponse, candidateStrategy.mode) && context.clientWantsStream) {
                void usagePromise;
              } else {
                await usagePromise;
              }
              await refreshedDiagnosticsPromise;
              if (isRateLimitResponse(refreshedResponse)) {
                accumulator.sawRateLimit = true;
                keyPool.markRateLimited(refreshedCredential, parseRetryAfterMs(refreshedResponse.headers.get("retry-after")));
                try {
                  await refreshedResponse.arrayBuffer();
                } catch {
                  // Ignore body read failures while failing over after refresh.
                }
                break;
              }
              // Handle Codex Responses → Images translation for the refreshed response.
              if (isCodexResponsesImages && refreshedResponse.ok) {
                const refreshedText = await refreshedResponse.text();
                const refreshedContentType = refreshedResponse.headers.get("content-type") ?? "";
                const refreshedLooksLikeEventStream = refreshedContentType.toLowerCase().includes("text/event-stream") || refreshedContentType.length === 0;

                if (refreshedLooksLikeEventStream) {
                  const streamError = responsesEventStreamToErrorPayload(refreshedText);
                  if (streamError) {
                    upstreamSpan.setStatus("error", "codex_responses_stream_error");
                    upstreamSpan.end();
                    accumulator.sawUpstreamInvalidRequest = true;
                    break;
                  }
                }

                const refreshedImagesPayload = refreshedLooksLikeEventStream
                  ? extractImagesFromCodexEventStream(refreshedText)
                  : extractImagesFromCodexResponse(refreshedText);

                if (refreshedImagesPayload) {
                  reply.header("x-open-hax-upstream-provider", providerContext.providerId);
                  reply.header("x-open-hax-upstream-mode", "codex_responses_images");
                  reply.code(200);
                  reply.header("content-type", "application/json");
                  reply.send(refreshedImagesPayload);
                  upstreamSpan.setStatus("ok");
                  upstreamSpan.end();
                  if (healthStore) {
                    healthStore.recordSuccess(refreshedCredential, refreshedResponse.status);
                  }
                  releaseInFlight();
                  return { handled: true, candidateCount: candidates.length, summary: accumulator };
                }
                upstreamSpan.setStatus("error", "codex_responses_no_image_output");
                upstreamSpan.end();
                accumulator.sawUpstreamInvalidRequest = true;
                break;
              }

              reply.header("x-open-hax-upstream-mode", candidateStrategy.mode);
              const refreshedOutcome = await candidateStrategy.handleProviderAttempt(reply, refreshedResponse, refreshedProviderContext);
              if (refreshedOutcome.kind === "handled") {
                upstreamSpan.setStatus("ok");
                upstreamSpan.end();

                if (healthStore && refreshedResponse.ok) {
                  healthStore.recordSuccess(refreshedCredential, refreshedResponse.status);
                }

                if (
                  promptCacheKey
                  && (
                    preferredAffinity === undefined
                    || preferredReassignmentAllowed
                    || (candidate.providerId === preferredAffinity.providerId && refreshedCredential.accountId === preferredAffinity.accountId)
                  )
                ) {
                  await promptAffinityStore.upsert(promptCacheKey, candidate.providerId, refreshedCredential.accountId);
                }

                releaseInFlight();
                return { handled: true, candidateCount: candidates.length, summary: accumulator };
              }
              accumulator.sawRateLimit ||= refreshedOutcome.rateLimit === true;
              accumulator.sawRequestError ||= refreshedOutcome.requestError === true;
              accumulator.sawUpstreamServerError ||= refreshedOutcome.upstreamServerError === true;
              accumulator.sawUpstreamInvalidRequest ||= refreshedOutcome.upstreamInvalidRequest === true;
              accumulator.sawModelNotFound ||= refreshedOutcome.modelNotFound === true;
              accumulator.sawModelNotSupportedForAccount ||= refreshedOutcome.modelNotSupportedForAccount === true;
              if (refreshedOutcome.upstreamAuthError) {
                accumulator.lastUpstreamAuthError = refreshedOutcome.upstreamAuthError;
              }
              if (!refreshedResponse.ok && refreshedOutcome.requestError === true && (refreshedResponse.status === 401 || refreshedResponse.status === 403)) {
                if (shouldCooldownCredentialOnAuthFailure(candidate.providerId, refreshedResponse.status)) {
                  keyPool.markRateLimited(refreshedCredential, Math.min(context.config.keyCooldownMs, 10_000));
                  if (preferredAffinity && candidate.providerId === preferredAffinity.providerId && refreshedCredential.accountId === preferredAffinity.accountId) {
                    preferredReassignmentAllowed = true;
                  }
                }
              }
              break;
            } finally {
              refreshedRelease();
            }
          }
          keyPool.markRateLimited(candidate.account, Math.min(context.config.keyCooldownMs, 10_000));
          if (preferredAffinity && candidate.providerId === preferredAffinity.providerId && candidate.account.accountId === preferredAffinity.accountId) {
            preferredReassignmentAllowed = true;
          }
        } else if (!upstreamResponse.ok && outcome.requestError === true && (upstreamResponse.status === 401 || upstreamResponse.status === 402 || upstreamResponse.status === 403)) {
          if (shouldCooldownCredentialOnAuthFailure(candidate.providerId, upstreamResponse.status) || shouldPermanentlyDisableCredential(candidate.account, upstreamResponse.status)) {
            const cooldownMs = shouldPermanentlyDisableCredential(candidate.account, upstreamResponse.status)
              ? PERMANENT_DISABLE_COOLDOWN_MS
              : Math.min(context.config.keyCooldownMs, 10_000);
            keyPool.markRateLimited(candidate.account, cooldownMs);
            if (healthStore) {
              healthStore.recordFailure(candidate.account, upstreamResponse.status, "credential_disabled");
            }
            if (preferredAffinity && candidate.providerId === preferredAffinity.providerId && candidate.account.accountId === preferredAffinity.accountId) {
              preferredReassignmentAllowed = true;
            }
          }
        }

        // Cooldown accounts that reject the model (e.g. free-tier ChatGPT accounts
        // that cannot use gpt-5.4). Without this, the same accounts are retried on
        // every request, causing long cascading failures before reaching a working
        // provider.
        if (outcome.modelNotSupportedForAccount === true) {
          keyPool.markRateLimited(candidate.account, Math.min(context.config.keyCooldownMs, 60_000));
        }

        if (!upstreamResponse.ok && outcome.requestError === true && !outcome.modelNotFound && !outcome.modelNotSupportedForAccount) {
          await summarizeUpstreamError(upstreamResponse);
        }

        upstreamSpan.setStatus("error", `fallback_continue_${upstreamResponse.status}`);
        upstreamSpan.end();
        break;
      }

      if (shouldContinueTransientRetry) {
        continue;
      }

      break;
    }

    releaseInFlight();
  }

  return {
    handled: false,
    candidateCount: candidates.length,
    summary: accumulator
  };
}

export async function inspectProviderAvailability(
  keyPool: {
    getStatus(providerId: string): Promise<{ readonly totalAccounts: number }>;
  },
  providerRoutes: readonly ProviderRoute[],
  promptCacheKey?: string,
): Promise<ProviderAvailabilitySummary> {
  let sawConfiguredProvider = false;

  for (const route of providerRoutes) {
    try {
      const status = await keyPool.getStatus(route.providerId);
      if (status.totalAccounts > 0) {
        sawConfiguredProvider = true;
      }
    } catch {
      // Ignore status lookup errors and continue collecting provider info.
    }
  }

  return { sawConfiguredProvider, prompt_cache_key: promptCacheKey };
}
