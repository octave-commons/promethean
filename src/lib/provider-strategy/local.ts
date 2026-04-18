import type { FastifyReply } from "fastify";

import type { RequestLogStore } from "../request-log-store.js";
import { buildForwardHeaders } from "../proxy.js";
import { fetchWithResponseTimeout, sendOpenAiError, toErrorMessage } from "../provider-utils.js";
import { getTelemetry } from "../telemetry/otel.js";
import {
  joinUrl,
  recordAttempt,
  responseLooksLikeEventStream,
  updateUsageCountsFromResponse,
  type BuildPayloadResult,
  type ProviderStrategy,
  type StrategyRequestContext,
} from "./shared.js";

export async function executeLocalStrategy(
  strategy: ProviderStrategy,
  reply: FastifyReply,
  requestLogStore: RequestLogStore,
  context: StrategyRequestContext,
  payload: BuildPayloadResult
): Promise<void> {
  reply.header("x-open-hax-upstream-provider", "local-ollama");
  const upstreamPath = strategy.getUpstreamPath(context);
  const upstreamUrl = joinUrl(context.config.ollamaBaseUrl, upstreamPath);
  const upstreamHeaders = buildForwardHeaders(context.clientHeaders);
  const attemptStartedAt = Date.now();

  const upstreamSpan = getTelemetry().startSpan("proxy.upstream_attempt", {
    "proxy.provider_id": "ollama",
    "proxy.account_id": "local",
    "proxy.auth_type": "local",
    "proxy.upstream_mode": strategy.mode,
    "proxy.upstream_path": upstreamPath,
    "proxy.model": context.routedModel,
    "proxy.requested_model": context.requestedModelInput,
  });
  upstreamSpan.setAttributes({
    "proxy.service_tier": payload.serviceTier,
    "proxy.service_tier_source": payload.serviceTierSource,
  });

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetchWithResponseTimeout(upstreamUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body: payload.bodyText
    }, context.upstreamAttemptTimeoutMs);
  } catch (error) {
    const latencyMs = Date.now() - attemptStartedAt;
    upstreamSpan.setAttribute("proxy.latency_ms", latencyMs);
    upstreamSpan.setAttribute("proxy.status", 0);
    upstreamSpan.recordError(error);
    upstreamSpan.end();
    recordAttempt(requestLogStore, { ...context, baseUrl: context.config.ollamaBaseUrl }, {
      providerId: "ollama",
      accountId: "local",
      authType: "local",
      upstreamPath,
      status: 0,
      latencyMs,
      serviceTier: payload.serviceTier,
      serviceTierSource: payload.serviceTierSource,
      error: toErrorMessage(error)
    }, strategy.mode);
    sendOpenAiError(
      reply,
      502,
      "Ollama upstream request failed due to a network or transport error.",
      "server_error",
      "ollama_upstream_unavailable"
    );
    return;
  }

    const latencyMs = Date.now() - attemptStartedAt;
    upstreamSpan.setAttribute("proxy.status", upstreamResponse.status);
    upstreamSpan.setAttribute("proxy.latency_ms", latencyMs);
    if (upstreamResponse.ok) upstreamSpan.setStatus("ok");
    else upstreamSpan.setStatus("error", `HTTP ${upstreamResponse.status}`);
    upstreamSpan.end();

    const requestLogEntryId = recordAttempt(requestLogStore, { ...context, baseUrl: context.config.ollamaBaseUrl }, {
      providerId: "ollama",
      accountId: "local",
      authType: "local",
      upstreamPath,
      status: upstreamResponse.status,
      latencyMs,
      serviceTier: payload.serviceTier,
      serviceTierSource: payload.serviceTierSource
    }, strategy.mode);

    const usagePromise = updateUsageCountsFromResponse(
      requestLogStore,
      requestLogEntryId,
      upstreamResponse,
      strategy.mode,
      context.routedModel,
      "ollama",
      context.config,
    );
    if (responseLooksLikeEventStream(upstreamResponse, strategy.mode) && context.clientWantsStream) {
      void usagePromise;
    } else {
      await usagePromise;
    }

    await strategy.handleLocalAttempt(reply, upstreamResponse, {
      ...context,
      baseUrl: context.config.ollamaBaseUrl
  });
}

