import { Readable } from "node:stream";

import type { FastifyReply } from "fastify";

import { copyUpstreamHeaders } from "../../proxy.js";
import {
  chatRequestToResponsesRequest,
  chatCompletionToSse,
  responsesToChatCompletion,
  responsesOutputHasReasoning,
  shouldUseResponsesUpstream,
  writeInterleavedResponsesSse,
} from "../../responses-compat.js";
import {
  chatRequestToMessagesRequest,
  messagesToChatCompletion,
  shouldUseMessagesUpstream,
} from "../../messages-compat.js";
import { appendCsvHeaderValue, chatCompletionHasReasoningContent, shouldEnableInterleavedThinkingHeader } from "../../provider-utils.js";
import { BaseProviderStrategy, TransformedJsonProviderStrategy } from "../base.js";
import {
  applyRequestedServiceTier,
  buildPayloadResult,
  buildRequestBodyForUpstream,
  ensureChatCompletionsUsageInStream,
  isRecord,
  stripTrailingAssistantPrefill,
  type BuildPayloadResult,
  type ProviderAttemptContext,
  type ProviderAttemptOutcome,
  type StrategyRequestContext,
} from "../shared.js";

export class MessagesProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "messages" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return !context.localOllama
      && !context.openAiPrefixed
      && shouldUseMessagesUpstream(context.routedModel, context.config.messagesModelPrefixes);
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.messagesPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    return buildPayloadResult(chatRequestToMessagesRequest(buildRequestBodyForUpstream(context)), context);
  }

  public override applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, payload: Record<string, unknown>): void {
    if (context.config.messagesInterleavedThinkingBeta && shouldEnableInterleavedThinkingHeader(payload)) {
      appendCsvHeaderValue(headers, "anthropic-beta", context.config.messagesInterleavedThinkingBeta);
    }
  }

  protected convertResponseToChatCompletion(upstreamJson: unknown, routedModel: string): Record<string, unknown> {
    return messagesToChatCompletion(upstreamJson, routedModel);
  }
}

export class ResponsesProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "responses" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return !context.localOllama
      && !context.explicitOllama
      && !context.openAiPrefixed
      && shouldUseResponsesUpstream(context.routedModel, context.config.responsesModelPrefixes);
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.responsesPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload = chatRequestToResponsesRequest(buildRequestBodyForUpstream(context));
    applyRequestedServiceTier(upstreamPayload, context);
    stripTrailingAssistantPrefill(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
  }

  public override async handleProviderAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: ProviderAttemptContext
  ): Promise<ProviderAttemptOutcome> {
    if (!upstreamResponse.ok) {
      return this.handleStandardProviderAttempt(reply, upstreamResponse, context);
    }

    let upstreamJson: unknown;
    try {
      upstreamJson = await upstreamResponse.json();
    } catch {
      return {
        kind: "continue",
        requestError: true
      };
    }

    if (!isRecord(upstreamJson)) {
      return {
        kind: "continue",
        requestError: true
      };
    }

    const chatCompletion = this.convertResponseToChatCompletion(upstreamJson, context.routedModel);
    if (context.needsReasoningTrace && !chatCompletionHasReasoningContent(chatCompletion) && context.hasMoreCandidates) {
      return {
        kind: "continue",
        requestError: true
      };
    }

    reply.header("x-open-hax-upstream-provider", context.providerId);

    if (context.clientWantsStream && responsesOutputHasReasoning(upstreamJson)) {
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
      await writeInterleavedResponsesSse(upstreamJson, context.routedModel, (data) => rawResponse.write(data));
      rawResponse.end();
      return { kind: "handled" };
    }

    if (context.clientWantsStream) {
      reply.code(200);
      reply.header("content-type", "text/event-stream; charset=utf-8");
      reply.header("cache-control", "no-cache");
      reply.header("x-accel-buffering", "no");
      reply.send(chatCompletionToSse(chatCompletion));
      return { kind: "handled" };
    }

    reply.code(upstreamResponse.status);
    reply.header("content-type", "application/json");
    reply.send(chatCompletion);
    return { kind: "handled" };
  }

  protected convertResponseToChatCompletion(upstreamJson: unknown, routedModel: string): Record<string, unknown> {
    return responsesToChatCompletion(upstreamJson, routedModel);
  }
}


export class ChatCompletionsProviderStrategy extends BaseProviderStrategy {
  public readonly mode = "chat_completions" as const;

  public readonly isLocal = false;

  public matches(_context: StrategyRequestContext): boolean {
    return true;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.chatCompletionsPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload = buildRequestBodyForUpstream(context);
    ensureChatCompletionsUsageInStream(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
  }
}

export class ZaiChatCompletionsProviderStrategy extends ChatCompletionsProviderStrategy {
  public override getUpstreamPath(_context: StrategyRequestContext): string {
    return "/chat/completions";
  }
}

export class ImagesGenerationsPassthroughStrategy extends BaseProviderStrategy {
  public readonly mode = "images" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.imagesPassthrough === true;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.imagesGenerationsPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload: Record<string, unknown> = { ...context.requestBody };
    delete upstreamPayload["open_hax"];
    return buildPayloadResult(upstreamPayload, context);
  }
}


export class ResponsesPassthroughStrategy extends BaseProviderStrategy {
  public readonly mode = "responses_passthrough" as const;

  public readonly isLocal = false;

  public matches(context: StrategyRequestContext): boolean {
    return context.responsesPassthrough === true && !context.openAiPrefixed;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.responsesPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload: Record<string, unknown> = { ...context.requestBody };
    delete upstreamPayload["open_hax"];
    stripTrailingAssistantPrefill(upstreamPayload);
    return buildPayloadResult(upstreamPayload, context);
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
