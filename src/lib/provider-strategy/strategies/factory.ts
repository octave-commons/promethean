import { Readable } from "node:stream";

import type { FastifyReply } from "fastify";

import { copyUpstreamHeaders } from "../../proxy.js";
import {
  chatRequestToMessagesRequest,
  messagesToChatCompletion,
  normalizeMessagesThinkingBudget,
} from "../../messages-compat.js";
import {
  chatRequestToResponsesRequest,
  chatCompletionToSse,
  responsesEventStreamToChatCompletion,
  responsesEventStreamToErrorPayload,
  responsesToChatCompletion,
  streamResponsesSseToChatCompletionChunks,
} from "../../responses-compat.js";
import {
  buildFactoryAnthropicHeaders,
  buildFactoryCommonHeaders,
  getFactoryEndpointPath,
  getFactoryModelType,
  inlineSystemPrompt,
  sanitizeFactorySystemPrompt,
} from "../../factory-compat.js";
import { chatCompletionHasReasoningContent } from "../../provider-utils.js";
import { BaseProviderStrategy, TransformedJsonProviderStrategy } from "../base.js";
import {
  applyRequestedServiceTier,
  buildPayloadResult,
  buildRequestBodyForUpstream,
  stripTrailingAssistantPrefill,
  type BuildPayloadResult,
  type ProviderAttemptContext,
  type ProviderAttemptOutcome,
  type StrategyRequestContext,
} from "../shared.js";

export class FactoryResponsesPassthroughStrategy extends BaseProviderStrategy {
  public readonly mode = "responses_passthrough" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.responsesPassthrough === true
      && context.factoryPrefixed
      && getFactoryModelType(context.routedModel) === "openai";
  }

  public getUpstreamPath(_context: StrategyRequestContext): string {
    return getFactoryEndpointPath("openai");
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload: Record<string, unknown> = { ...context.requestBody };
    delete upstreamPayload["open_hax"];
    stripTrailingAssistantPrefill(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
  }

  public override applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, _payload: Record<string, unknown>): void {
    const factoryHeaders = buildFactoryCommonHeaders(context.routedModel);
    for (const [name, value] of Object.entries(factoryHeaders)) {
      headers.set(name, value);
    }
  }

  public override async handleProviderAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: ProviderAttemptContext,
  ): Promise<ProviderAttemptOutcome> {
    if (!upstreamResponse.ok) {
      return this.handleStandardProviderAttempt(reply, upstreamResponse, context);
    }

    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const isEventStream = contentType.toLowerCase().includes("text/event-stream");

    reply.header("x-open-hax-upstream-provider", context.providerId);
    reply.code(upstreamResponse.status);
    copyUpstreamHeaders(reply, upstreamResponse.headers);

    if (isEventStream) {
      if (!upstreamResponse.body) {
        return { kind: "continue", requestError: true };
      }

      reply.removeHeader("content-length");
      reply.header("cache-control", "no-cache");
      reply.header("x-accel-buffering", "no");
      reply.header("content-type", "text/event-stream; charset=utf-8");
      reply.hijack();
      const rawResponse = reply.raw;
      rawResponse.statusCode = upstreamResponse.status;
      for (const [name, value] of Object.entries(reply.getHeaders())) {
        if (value !== undefined) {
          rawResponse.setHeader(name, value as never);
        }
      }
      rawResponse.flushHeaders();
      const nodeStream = Readable.fromWeb(upstreamResponse.body as never);
      nodeStream.on("error", () => {
        if (!rawResponse.writableEnded) {
          rawResponse.end();
        }
      });
      nodeStream.pipe(rawResponse);
      return { kind: "handled" };
    }

    if (!upstreamResponse.body) {
      const responseText = await upstreamResponse.text();
      reply.send(responseText);
      return { kind: "handled" };
    }

    const bytes = Buffer.from(await upstreamResponse.arrayBuffer());
    reply.send(bytes);
    return { kind: "handled" };
  }
}


export class FactoryMessagesProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "messages" as const;

  public readonly isLocal = false;

  private static readonly defaultMaxTokens = 4096;

  public matches(context: StrategyRequestContext): boolean {
    return context.factoryPrefixed
      && getFactoryModelType(context.routedModel) === "anthropic";
  }

  public getUpstreamPath(_context: StrategyRequestContext): string {
    return getFactoryEndpointPath("anthropic");
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const messagesPayload = chatRequestToMessagesRequest(buildRequestBodyForUpstream(context));
    const rawSystem = messagesPayload["system"];
    const sanitizedSystem = typeof rawSystem === "string" ? sanitizeFactorySystemPrompt(rawSystem) : rawSystem;
    const sanitizedPayload = sanitizedSystem === rawSystem
      ? messagesPayload
      : {
          ...messagesPayload,
          system: sanitizedSystem,
        };
    const payloadWithMaxTokens = sanitizedPayload["max_tokens"] === undefined
      ? {
          ...sanitizedPayload,
          max_tokens: FactoryMessagesProviderStrategy.defaultMaxTokens,
        }
      : sanitizedPayload;
    const normalizedThinkingPayload = normalizeMessagesThinkingBudget(payloadWithMaxTokens);
    // Inline system content into first user message to avoid Factory 403 with fk- keys.
    // We always inline for Factory to keep behavior consistent across credential types.
    const inlinedPayload = inlineSystemPrompt(normalizedThinkingPayload);
    return buildPayloadResult(inlinedPayload, context);
  }

  public override applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, payload: Record<string, unknown>): void {
    const anthropicHeaders = buildFactoryAnthropicHeaders(
      context.routedModel,
      payload,
      context.config.messagesInterleavedThinkingBeta,
    );
    for (const [name, value] of Object.entries(anthropicHeaders)) {
      headers.set(name, value);
    }
  }

  protected convertResponseToChatCompletion(upstreamJson: unknown, routedModel: string): Record<string, unknown> {
    return messagesToChatCompletion(upstreamJson, routedModel);
  }
}

/**
 * Factory.ai OpenAI Responses strategy.
 *
 * Routes gpt-* models to Factory's `/api/llm/o/v1/responses` endpoint,
 * translating OpenAI chat format to Responses format and back.
 * Adds Factory-specific headers. Streaming handled via Responses event stream translation.
 */
export class FactoryResponsesProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "responses" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.factoryPrefixed
      && getFactoryModelType(context.routedModel) === "openai";
  }

  public getUpstreamPath(_context: StrategyRequestContext): string {
    return getFactoryEndpointPath("openai");
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload = chatRequestToResponsesRequest(buildRequestBodyForUpstream(context));
    applyRequestedServiceTier(upstreamPayload, context);
    upstreamPayload["store"] = false;
    upstreamPayload["stream"] = true;

    // Factory rejects non-empty `instructions` with 403; move system instructions
    // into the input array as a developer message instead.
    const instructions = typeof upstreamPayload["instructions"] === "string"
      ? upstreamPayload["instructions"].trim()
      : "";
    if (instructions.length > 0 && Array.isArray(upstreamPayload["input"])) {
      const input = upstreamPayload["input"] as unknown[];
      input.unshift({
        role: "developer",
        content: [{ type: "input_text", text: instructions }],
      });
    }
    delete upstreamPayload["instructions"];

    return buildPayloadResult(upstreamPayload, context);
  }

  public override applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, _payload: Record<string, unknown>): void {
    const factoryHeaders = buildFactoryCommonHeaders(context.routedModel);
    for (const [name, value] of Object.entries(factoryHeaders)) {
      headers.set(name, value);
    }
  }

  public override async handleProviderAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: ProviderAttemptContext
  ): Promise<ProviderAttemptOutcome> {
    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const looksLikeEventStream = contentType.toLowerCase().includes("text/event-stream")
      || contentType.length === 0;

    if (!upstreamResponse.ok) {
      return super.handleProviderAttempt(reply, upstreamResponse, context);
    }

    // When factory returns JSON (not SSE) for a 200, parse and convert it directly
    // instead of falling through to the base class which may skip valid responses
    // due to missing reasoning traces.
    if (!looksLikeEventStream) {
      let upstreamJson: unknown;
      try {
        upstreamJson = await upstreamResponse.json();
      } catch {
        return { kind: "continue", requestError: true };
      }
      const chatCompletion = this.convertResponseToChatCompletion(upstreamJson, context.routedModel);
      reply.header("x-open-hax-upstream-provider", context.providerId);
      if (context.clientWantsStream) {
        reply.code(200);
        reply.header("content-type", "text/event-stream; charset=utf-8");
        reply.header("cache-control", "no-cache");
        reply.header("x-accel-buffering", "no");
        reply.send(chatCompletionToSse(chatCompletion));
        return { kind: "handled" };
      }
      reply.code(200);
      reply.header("content-type", "application/json");
      reply.send(chatCompletion);
      return { kind: "handled" };
    }

    // True streaming: pipe upstream Responses SSE → chat completion chunks
    if (context.clientWantsStream && upstreamResponse.body) {
      reply.header("x-open-hax-upstream-provider", context.providerId);
      reply.code(200);
      reply.header("content-type", "text/event-stream; charset=utf-8");
      reply.header("cache-control", "no-cache");
      reply.header("x-accel-buffering", "no");
      reply.hijack();
      const rawResponse = reply.raw;
      rawResponse.statusCode = 200;
      for (const [name, value] of Object.entries(reply.getHeaders())) {
        if (value !== undefined) {
          rawResponse.setHeader(name, value as never);
        }
      }
      rawResponse.flushHeaders();

      try {
        const result = await streamResponsesSseToChatCompletionChunks(
          upstreamResponse.body,
          { fallbackModel: context.routedModel, writeFn: (data) => rawResponse.write(data) },
        );
        if (result.sawError && !rawResponse.writableEnded) {
          rawResponse.end();
          return { kind: "handled" };
        }
      } catch {
        // Stream read error — close gracefully
      }
      if (!rawResponse.writableEnded) {
        rawResponse.end();
      }
      return { kind: "handled" };
    }

    // Non-streaming: buffer and convert
    const streamText = await upstreamResponse.text();
    const upstreamError = responsesEventStreamToErrorPayload(streamText);
    if (upstreamError) {
      reply.header("x-open-hax-upstream-provider", context.providerId);
      reply.code(400);
      reply.header("content-type", "application/json");
      reply.send({ error: upstreamError });
      return { kind: "handled" };
    }

    let chatCompletion: Record<string, unknown>;
    try {
      chatCompletion = responsesEventStreamToChatCompletion(streamText, context.routedModel);
    } catch {
      return {
        kind: "continue",
        requestError: true
      };
    }

    // Accept valid completions even without reasoning content -- skipping a working
    // provider to chase reasoning traces from another candidate causes cascading 400s
    // when those candidates reject the request format entirely.

    reply.header("x-open-hax-upstream-provider", context.providerId);
    reply.code(200);
    reply.header("content-type", "application/json");
    reply.send(chatCompletion);
    return { kind: "handled" };
  }

  protected convertResponseToChatCompletion(upstreamJson: unknown, routedModel: string): Record<string, unknown> {
    return responsesToChatCompletion(upstreamJson, routedModel);
  }
}

/**
 * Factory.ai Common Chat Completions strategy.
 *
 * Routes non-Claude, non-GPT models (gemini, glm, kimi, DeepSeek, etc.)
 * to Factory's `/api/llm/o/v1/chat/completions` endpoint.
 * Passes through standard chat completions format with Factory-specific headers.
 */
export class FactoryChatCompletionsProviderStrategy extends BaseProviderStrategy {
  public readonly mode = "chat_completions" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.factoryPrefixed
      && getFactoryModelType(context.routedModel) === "common";
  }

  public getUpstreamPath(_context: StrategyRequestContext): string {
    return getFactoryEndpointPath("common");
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    return buildPayloadResult(buildRequestBodyForUpstream(context), context);
  }

  public override applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, _payload: Record<string, unknown>): void {
    const factoryHeaders = buildFactoryCommonHeaders(context.routedModel);
    for (const [name, value] of Object.entries(factoryHeaders)) {
      headers.set(name, value);
    }
  }
}
