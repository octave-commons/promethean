import type { FastifyReply } from "fastify";

import { chatCompletionToSse } from "../../responses-compat.js";
import { chatRequestToOllamaRequest, ollamaToChatCompletion } from "../../ollama-compat.js";
import { sendOpenAiError, toErrorMessage } from "../../provider-utils.js";
import { BaseProviderStrategy } from "../base.js";
import {
  buildPayloadResult,
  buildRequestBodyForUpstream,
  type BuildPayloadResult,
  type LocalAttemptContext,
  type StrategyRequestContext,
} from "../shared.js";

export class LocalOllamaProviderStrategy extends BaseProviderStrategy {
  public readonly mode = "local_ollama_chat" as const;

  public readonly isLocal = true;

  public matches(context: StrategyRequestContext): boolean {
    return context.localOllama && !context.explicitOllama;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.ollamaV1ChatPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamPayload = buildRequestBodyForUpstream(context);
    return buildPayloadResult(upstreamPayload);
  }

  public override async handleLocalAttempt(reply: FastifyReply, upstreamResponse: Response, context: LocalAttemptContext): Promise<void> {
    if (!upstreamResponse.ok) {
      await this.handleStandardLocalAttempt(reply, upstreamResponse, context);
      return;
    }

    if (context.clientWantsStream) {
      let upstreamJson: unknown;
      try {
        upstreamJson = await upstreamResponse.json();
      } catch (error) {
        sendOpenAiError(
          reply,
          502,
          `Failed to parse Ollama stream bootstrap payload: ${toErrorMessage(error)}`,
          "server_error",
          "ollama_stream_parse_failed"
        );
        return;
      }

      const chatCompletion = ollamaToChatCompletion(upstreamJson, context.routedModel);
      reply.code(200);
      reply.header("content-type", "text/event-stream; charset=utf-8");
      reply.header("cache-control", "no-cache");
      reply.header("x-accel-buffering", "no");
      reply.send(chatCompletionToSse(chatCompletion));
      return;
    }

    await this.handleStandardLocalAttempt(reply, upstreamResponse, context);
  }
}

export class OllamaProviderStrategy extends BaseProviderStrategy {
  public readonly mode = "ollama_chat" as const;

  public readonly isLocal = true;

  public matches(context: StrategyRequestContext): boolean {
    return context.explicitOllama;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    return context.config.ollamaChatPath;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    return buildPayloadResult(chatRequestToOllamaRequest(context.requestBody, context.config.ollamaModelPrefixes), context);
  }

  public override async handleLocalAttempt(
    reply: FastifyReply,
    upstreamResponse: Response,
    context: LocalAttemptContext
  ): Promise<void> {
    if (!upstreamResponse.ok) {
      await this.handleStandardLocalAttempt(reply, upstreamResponse, context);
      return;
    }

    let upstreamJson: unknown;
    try {
      upstreamJson = await upstreamResponse.json();
    } catch (error) {
      const code = context.clientWantsStream ? "ollama_stream_parse_failed" : "ollama_parse_failed";
      const label = context.clientWantsStream ? "stream bootstrap payload" : "upstream payload";
      sendOpenAiError(
        reply,
        502,
        `Failed to parse Ollama ${label}: ${toErrorMessage(error)}`,
        "server_error",
        code
      );
      return;
    }

    const chatCompletion = ollamaToChatCompletion(upstreamJson, context.routedModel);

    if (context.clientWantsStream) {
      reply.code(200);
      reply.header("content-type", "text/event-stream; charset=utf-8");
      reply.header("cache-control", "no-cache");
      reply.header("x-accel-buffering", "no");
      reply.send(chatCompletionToSse(chatCompletion));
      return;
    }

    reply.header("content-type", "application/json");
    reply.send(chatCompletion);
  }
}
