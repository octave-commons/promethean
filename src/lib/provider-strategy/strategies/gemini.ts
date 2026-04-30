import { TransformedJsonProviderStrategy } from "../base.js";
import { requestWantsReasoningTrace } from "../../provider-utils.js";
import {
  asNumber,
  asString,
  buildPayloadResult,
  buildRequestBodyForUpstream,
  isRecord,
  openAiContentToText,
  type BuildPayloadResult,
  type ProviderAttemptContext,
  type StrategyRequestContext,
} from "../shared.js";

type GeminiReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

function normalizeGeminiReasoningEffort(value: unknown): GeminiReasoningEffort | undefined {
  const raw = asString(value)?.trim().toLowerCase();
  if (!raw) {
    return undefined;
  }

  switch (raw) {
    case "none":
    case "disable":
    case "disabled":
    case "off":
      return "none";
    case "minimal":
      return "minimal";
    case "low":
      return "low";
    case "medium":
    case "normal":
    case "auto":
      return "medium";
    case "high":
      return "high";
    case "xhigh":
    case "very_high":
    case "max":
      return "xhigh";
    default:
      return undefined;
  }
}

function geminiReasoningEffort(body: Record<string, unknown>): GeminiReasoningEffort | undefined {
  const reasoning = isRecord(body.reasoning) ? body.reasoning : null;
  return normalizeGeminiReasoningEffort(
    reasoning?.effort
      ?? body.reasoning_effort
      ?? body.reasoningEffort,
  );
}

function buildGemini25ThinkingBudget(effort: GeminiReasoningEffort | undefined, minBudget: number, maxBudget: number, supportsOff: boolean): number {
  switch (effort) {
    case undefined:
      return -1;
    case "none":
      return supportsOff ? 0 : minBudget;
    case "minimal":
      return minBudget;
    case "low":
      return Math.max(minBudget, Math.min(maxBudget, Math.floor(maxBudget * 0.25)));
    case "medium":
      return Math.max(minBudget, Math.min(maxBudget, Math.floor(maxBudget * 0.5)));
    case "high":
      return Math.max(minBudget, Math.min(maxBudget, Math.floor(maxBudget * 0.75)));
    case "xhigh":
      return maxBudget;
  }
}

function buildGemini3ThinkingLevel(model: string, effort: GeminiReasoningEffort | undefined): string {
  const lower = model.toLowerCase();
  const isFlash = lower.includes("flash");

  if (isFlash) {
    switch (effort) {
      case undefined:
      case "medium":
        return "MEDIUM";
      case "none":
      case "minimal":
        return "MINIMAL";
      case "low":
        return "LOW";
      case "high":
      case "xhigh":
        return "HIGH";
    }
  }

  switch (effort) {
    case undefined:
    case "none":
    case "minimal":
    case "low":
    case "medium":
      return "LOW";
    case "high":
    case "xhigh":
      return "HIGH";
  }
}

function buildGeminiThinkingConfig(body: Record<string, unknown>, model: string): Record<string, unknown> | undefined {
  const effort = geminiReasoningEffort(body);
  const wantsReasoningTrace = requestWantsReasoningTrace(body);
  if (!wantsReasoningTrace && effort === undefined) {
    return undefined;
  }

  const lower = model.toLowerCase();
  const thinkingConfig: Record<string, unknown> = {};

  if (lower.startsWith("gemini-2.5-flash")) {
    thinkingConfig.thinkingBudget = buildGemini25ThinkingBudget(effort, 1024, 24576, true);
  } else if (lower.startsWith("gemini-2.5-pro")) {
    thinkingConfig.thinkingBudget = buildGemini25ThinkingBudget(effort, 128, 32768, false);
  } else if (lower.startsWith("gemini-3")) {
    thinkingConfig.thinkingLevel = buildGemini3ThinkingLevel(model, effort);
  } else {
    return undefined;
  }

  if (wantsReasoningTrace) {
    thinkingConfig.includeThoughts = true;
  }

  return thinkingConfig;
}

export class GeminiChatProviderStrategy extends TransformedJsonProviderStrategy {
  public readonly mode = "gemini_chat" as const;

  public readonly isLocal = false;

  public matches(_context: StrategyRequestContext): boolean {
    // Selected explicitly in selectRemoteProviderStrategyForRoute for providerId === "gemini".
    return false;
  }

  public getUpstreamPath(context: StrategyRequestContext): string {
    const model = encodeURIComponent(context.routedModel);
    return `/models/${model}:generateContent`;
  }

  public buildPayload(context: StrategyRequestContext): BuildPayloadResult {
    const upstreamBody = buildRequestBodyForUpstream(context);
    const rawMessages = Array.isArray(upstreamBody.messages) ? upstreamBody.messages : [];

    const contents: Array<{ readonly role: string; readonly parts: Array<{ readonly text: string }> }> = [];
    const systemParts: string[] = [];

    for (const message of rawMessages) {
      if (!isRecord(message)) {
        continue;
      }

      const role = asString(message.role)?.trim().toLowerCase() ?? "";
      const text = openAiContentToText(message.content).trim();
      if (text.length === 0) {
        continue;
      }

      if (role === "system") {
        systemParts.push(text);
        continue;
      }

      if (role === "user") {
        contents.push({ role: "user", parts: [{ text }] });
        continue;
      }

      if (role === "assistant") {
        contents.push({ role: "model", parts: [{ text }] });
        continue;
      }
    }

    const generationConfig: Record<string, unknown> = {};
    const temperature = asNumber(upstreamBody.temperature);
    if (temperature !== undefined) {
      generationConfig.temperature = temperature;
    }
    const maxTokens = asNumber(upstreamBody.max_output_tokens)
      ?? asNumber(upstreamBody.max_tokens)
      ?? asNumber(upstreamBody.maxTokens);
    if (maxTokens !== undefined) {
      generationConfig.maxOutputTokens = maxTokens;
    }

    const thinkingConfig = buildGeminiThinkingConfig(upstreamBody, context.routedModel);
    if (thinkingConfig) {
      generationConfig.thinkingConfig = thinkingConfig;
    }

    const payload: Record<string, unknown> = {
      contents,
    };

    if (systemParts.length > 0) {
      payload.systemInstruction = {
        parts: [{ text: systemParts.join("\n\n") }],
      };
    }

    if (Object.keys(generationConfig).length > 0) {
      payload.generationConfig = generationConfig;
    }

    return buildPayloadResult(payload, context);
  }

  public override applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, _payload: Record<string, unknown>): void {
    // Gemini uses API key auth (X-Goog-Api-Key header) rather than OpenAI bearer headers.
    headers.delete("authorization");
    headers.set("x-goog-api-key", context.account.token);
    headers.set("content-type", "application/json");
  }

  protected convertResponseToChatCompletion(upstreamJson: unknown, routedModel: string): Record<string, unknown> {
    const created = Math.floor(Date.now() / 1000);

    if (!isRecord(upstreamJson)) {
      return {
        id: `chatcmpl-gemini-${created}`,
        object: "chat.completion",
        created,
        model: routedModel,
        choices: [{ index: 0, message: { role: "assistant", content: "" }, finish_reason: "stop" }],
      };
    }

    const candidates = Array.isArray(upstreamJson.candidates) ? upstreamJson.candidates : [];
    const firstCandidate = candidates.length > 0 && isRecord(candidates[0]) ? candidates[0] : undefined;
    const candidateContent = firstCandidate && isRecord(firstCandidate.content) ? firstCandidate.content : undefined;
    const parts = candidateContent && Array.isArray(candidateContent.parts) ? candidateContent.parts : [];
    const textParts: string[] = [];
    const reasoningParts: string[] = [];

    for (const part of parts) {
      if (!isRecord(part)) {
        continue;
      }

      const text = asString(part.text)?.trim() ?? "";
      if (text.length === 0) {
        continue;
      }

      if (part.thought === true) {
        reasoningParts.push(text);
        continue;
      }

      textParts.push(text);
    }

    const text = textParts.join("\n").trim();
    const reasoningContent = reasoningParts.join("\n").trim();

    const finishReasonRaw = firstCandidate ? asString(firstCandidate.finishReason) ?? asString(firstCandidate.finish_reason) : undefined;
    const finishReason = finishReasonRaw
      ? finishReasonRaw.toLowerCase() === "stop"
        ? "stop"
        : finishReasonRaw.toLowerCase() === "max_tokens"
          ? "length"
          : "stop"
      : "stop";

    const usageMetadata = isRecord(upstreamJson.usageMetadata) ? upstreamJson.usageMetadata : null;
    const promptTokens = usageMetadata ? asNumber(usageMetadata.promptTokenCount) : undefined;
    const completionTokens = usageMetadata ? asNumber(usageMetadata.candidatesTokenCount) : undefined;
    const totalTokens = usageMetadata ? asNumber(usageMetadata.totalTokenCount) : undefined;

    return {
      id: `chatcmpl-gemini-${created}`,
      object: "chat.completion",
      created,
      model: routedModel,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: text,
            ...(reasoningContent.length > 0 ? { reasoning_content: reasoningContent } : {}),
          },
          finish_reason: finishReason,
        },
      ],
      ...(promptTokens !== undefined || completionTokens !== undefined || totalTokens !== undefined
        ? {
            usage: {
              ...(promptTokens !== undefined ? { prompt_tokens: promptTokens } : {}),
              ...(completionTokens !== undefined ? { completion_tokens: completionTokens } : {}),
              ...(totalTokens !== undefined
                ? { total_tokens: totalTokens }
                : promptTokens !== undefined && completionTokens !== undefined
                  ? { total_tokens: promptTokens + completionTokens }
                  : {}),
            },
          }
        : {}),
    };
  }
}
