import { Readable } from "node:stream";

import type { FastifyReply } from "fastify";

import { copyUpstreamHeaders } from "../../proxy.js";
import {
  chatRequestToResponsesRequest,
  chatCompletionToSse,
  extractTerminalResponseFromEventStream,
  responsesEventStreamToChatCompletion,
  responsesEventStreamToErrorPayload,
  responsesOutputHasReasoning,
  responsesToChatCompletion,
  shouldUseResponsesUpstream,
  streamResponsesSseToChatCompletionChunks,
  writeInterleavedResponsesSse,
} from "../../responses-compat.js";
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

/**
 * Parameters that the ChatGPT Codex backend (`chatgpt.com/backend-api/codex/responses`)
 * does not support and will reject with HTTP 400.
 */
const CODEX_UNSUPPORTED_PARAMS = [
  "max_output_tokens",
  "temperature",
  "top_p",
  "presence_penalty",
  "frequency_penalty",
  "seed",
  "service_tier",
  "user",
] as const;

function stripCodexUnsupportedParams(payload: Record<string, unknown>): void {
  for (const key of CODEX_UNSUPPORTED_PARAMS) {
    delete payload[key];
  }
}

export class OpenAiResponsesProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "openai_responses" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.openAiPrefixed
      && (context.routedModel === "gpt-5.4"
        || shouldUseResponsesUpstream(context.routedModel, context.config.responsesModelPrefixes));
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.openaiResponsesPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload = chatRequestToResponsesRequest(buildRequestBodyForUpstream(context));
    applyRequestedServiceTier(upstreamPayload, context);
    stripCodexUnsupportedParams(upstreamPayload);
    if (upstreamPayload["instructions"] == null) {
      upstreamPayload["instructions"] = "";
    }
    upstreamPayload["store"] = false;
    upstreamPayload["stream"] = true;
    stripTrailingAssistantPrefill(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
  }

  public override async handleProviderAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: ProviderAttemptContext
  ): Promise<ProviderAttemptOutcome> {
    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const looksLikeEventStream = contentType.toLowerCase().includes("text/event-stream")
      || contentType.length === 0;

    if (!upstreamResponse.ok || !looksLikeEventStream) {
      return super.handleProviderAttempt(reply, upstreamResponse, context);
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

export class OpenAiChatCompletionsProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "openai_chat_completions" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.openAiPrefixed;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.openaiResponsesPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload = chatRequestToResponsesRequest(buildRequestBodyForUpstream(context));
    applyRequestedServiceTier(upstreamPayload, context);
    stripCodexUnsupportedParams(upstreamPayload);
    if (upstreamPayload["instructions"] == null) {
      upstreamPayload["instructions"] = "";
    }
    upstreamPayload["store"] = false;
    upstreamPayload["stream"] = true;
    stripTrailingAssistantPrefill(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
  }

  public override async handleProviderAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: ProviderAttemptContext
  ): Promise<ProviderAttemptOutcome> {
    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const looksLikeEventStream = contentType.toLowerCase().includes("text/event-stream")
      || contentType.length === 0;

    if (!upstreamResponse.ok || !looksLikeEventStream) {
      return super.handleProviderAttempt(reply, upstreamResponse, context);
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


export class OpenAiResponsesPassthroughStrategy extends BaseProviderStrategy {
  public readonly mode = "openai_responses_passthrough" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.responsesPassthrough === true && context.openAiPrefixed;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.openaiResponsesPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload: Record<string, unknown> = { ...context.requestBody };
    delete upstreamPayload["open_hax"];
    stripCodexUnsupportedParams(upstreamPayload);
    upstreamPayload["store"] = false;
    upstreamPayload["stream"] = true;
    if (upstreamPayload["instructions"] == null) {
      upstreamPayload["instructions"] = "";
    }
    stripTrailingAssistantPrefill(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
  }

  public override async handleProviderAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: ProviderAttemptContext,
  ): Promise<ProviderAttemptOutcome> {
    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const looksLikeEventStream = contentType.toLowerCase().includes("text/event-stream")
      || contentType.length === 0;

    if (!upstreamResponse.ok && !looksLikeEventStream) {
      return this.handleStandardProviderAttempt(reply, upstreamResponse, context);
    }

    if (!upstreamResponse.ok) {
      const streamText = await upstreamResponse.text();
      const upstreamError = responsesEventStreamToErrorPayload(streamText);
      if (upstreamError) {
        reply.header("x-open-hax-upstream-provider", context.providerId);
        reply.code(400);
        reply.header("content-type", "application/json");
        reply.send({ error: upstreamError });
        return { kind: "handled" };
      }

      return { kind: "continue", requestError: true };
    }

    if (context.clientWantsStream && looksLikeEventStream) {
      if (!upstreamResponse.body) {
        return { kind: "continue", requestError: true };
      }

      reply.header("x-open-hax-upstream-provider", context.providerId);
      reply.code(upstreamResponse.status);
      copyUpstreamHeaders(reply, upstreamResponse.headers);

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

    if (looksLikeEventStream) {
      const streamText = await upstreamResponse.text();
      const upstreamError = responsesEventStreamToErrorPayload(streamText);
      if (upstreamError) {
        reply.header("x-open-hax-upstream-provider", context.providerId);
        reply.code(400);
        reply.header("content-type", "application/json");
        reply.send({ error: upstreamError });
        return { kind: "handled" };
      }

      const terminalResponse = extractTerminalResponseFromEventStream(streamText);
      if (!terminalResponse) {
        return { kind: "continue", requestError: true };
      }

      reply.header("x-open-hax-upstream-provider", context.providerId);
      reply.code(200);
      reply.header("content-type", "application/json");
      reply.send(terminalResponse);
      return { kind: "handled" };
    }

    reply.header("x-open-hax-upstream-provider", context.providerId);
    reply.code(upstreamResponse.status);
    copyUpstreamHeaders(reply, upstreamResponse.headers);

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

/**
 * Factory.ai Anthropic Messages strategy.
 *
 * Routes claude-* models to Factory's `/api/llm/a/v1/messages` endpoint,
 * translating OpenAI chat format to Anthropic Messages format and back.
 * Adds all Factory-specific headers and handles system prompt inlining for fk- keys.
 */
