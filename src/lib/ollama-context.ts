import { fetchWithResponseTimeout, isRecord } from "./provider-utils.js";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function estimateTextTokens(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(text.length / 4));
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (!isRecord(part)) {
        return "";
      }

      const type = asString(part["type"]);
      if (type === "text" || type === "input_text" || type === "output_text") {
        return asString(part["text"]) ?? "";
      }

      if (type === "image" || type === "image_url" || type === "input_image") {
        return " [image] ";
      }

      return "";
    })
    .join("");
}

function estimateMessageTokens(messages: unknown): number {
  if (!Array.isArray(messages)) {
    return 0;
  }

  return messages.reduce((total, entry) => {
    if (!isRecord(entry)) {
      return total;
    }

    const role = asString(entry["role"]) ?? "user";
    const content = extractTextFromContent(entry["content"]);
    const toolCalls = Array.isArray(entry["tool_calls"]) ? entry["tool_calls"].length * 64 : 0;
    return total + estimateTextTokens(role) + estimateTextTokens(content) + 8 + toolCalls;
  }, 0);
}

function estimateNativeChatMessageTokens(messages: unknown): number {
  if (!Array.isArray(messages)) {
    return 0;
  }

  return messages.reduce((total, entry) => {
    if (!isRecord(entry)) {
      return total;
    }

    const role = asString(entry["role"]) ?? "user";
    const content = asString(entry["content"]) ?? "";
    const imageCount = Array.isArray(entry["images"]) ? entry["images"].length : 0;
    const toolCalls = Array.isArray(entry["tool_calls"]) ? entry["tool_calls"].length * 64 : 0;
    return total + estimateTextTokens(role) + estimateTextTokens(content) + 8 + (imageCount * 2048) + toolCalls;
  }, 0);
}

function estimateEmbedInputTokens(input: unknown): number {
  if (typeof input === "string") {
    return estimateTextTokens(input);
  }

  if (!Array.isArray(input)) {
    return 0;
  }

  return input.reduce((total, entry) => total + (typeof entry === "string" ? estimateTextTokens(entry) : 0), 0);
}

function roundUpToContextStep(value: number): number {
  const step = 1024;
  return Math.ceil(value / step) * step;
}

export interface OllamaContextBudget {
  readonly model: string;
  readonly contextLength: number;
  readonly estimatedInputTokens: number;
  readonly requestedOutputTokens: number;
  readonly requiredContextTokens: number;
  readonly availableContextTokens: number;
  readonly recommendedNumCtx: number;
}

export async function fetchOllamaModelContextLength(
  baseUrl: string,
  model: string,
  timeoutMs: number,
): Promise<number | null> {
  const response = await fetchWithResponseTimeout(`${baseUrl.replace(/\/+$/, "")}/api/show`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ model }),
  }, timeoutMs);

  if (!response.ok) {
    return null;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return null;
  }

  if (!isRecord(payload)) {
    return null;
  }

  const modelInfo = isRecord(payload["model_info"]) ? payload["model_info"] : null;
  const directContext = asNumber(payload["context_length"]);
  const modelInfoContext = asNumber(modelInfo?.["qwen3.context_length"])
    ?? asNumber(modelInfo?.["qwen35.context_length"])
    ?? asNumber(modelInfo?.["llama.context_length"])
    ?? asNumber(modelInfo?.["gemma3.context_length"])
    ?? asNumber(modelInfo?.["general.context_length"]);

  return directContext ?? modelInfoContext ?? null;
}

export async function ensureOllamaContextFits(
  baseUrl: string,
  requestBody: Record<string, unknown>,
  timeoutMs: number,
): Promise<OllamaContextBudget | null> {
  const model = asString(requestBody["model"]);
  if (!model || model.length === 0) {
    return null;
  }

  const contextLength = await fetchOllamaModelContextLength(baseUrl, model, timeoutMs);
  if (!contextLength || contextLength <= 0) {
    return null;
  }

  const estimatedInputTokens = estimateMessageTokens(requestBody["messages"]);
  const requestedOutputTokens = asNumber(requestBody["max_completion_tokens"])
    ?? asNumber(requestBody["max_tokens"])
    ?? 2048;
  const requiredContextTokens = estimatedInputTokens + requestedOutputTokens;

  return {
    model,
    contextLength,
    estimatedInputTokens,
    requestedOutputTokens,
    requiredContextTokens,
    availableContextTokens: contextLength,
    recommendedNumCtx: Math.min(contextLength, Math.max(4096, roundUpToContextStep(requiredContextTokens + 512))),
  };
}

export async function ensureNativeOllamaChatContextFits(
  baseUrl: string,
  requestBody: Record<string, unknown>,
  timeoutMs: number,
): Promise<OllamaContextBudget | null> {
  const model = asString(requestBody["model"]);
  if (!model || model.length === 0) {
    return null;
  }

  const contextLength = await fetchOllamaModelContextLength(baseUrl, model, timeoutMs);
  if (!contextLength || contextLength <= 0) {
    return null;
  }

  const estimatedInputTokens = estimateNativeChatMessageTokens(requestBody["messages"])
    + (Array.isArray(requestBody["tools"]) ? estimateTextTokens(JSON.stringify(requestBody["tools"])) : 0);
  const options = isRecord(requestBody["options"]) ? requestBody["options"] : null;
  const requestedOutputTokens = asNumber(options?.["num_predict"])
    ?? asNumber(requestBody["num_predict"])
    ?? 2048;
  const requiredContextTokens = estimatedInputTokens + requestedOutputTokens;

  return {
    model,
    contextLength,
    estimatedInputTokens,
    requestedOutputTokens,
    requiredContextTokens,
    availableContextTokens: contextLength,
    recommendedNumCtx: Math.min(contextLength, Math.max(4096, roundUpToContextStep(requiredContextTokens + 512))),
  };
}

export async function ensureNativeOllamaEmbedContextFits(
  baseUrl: string,
  requestBody: Record<string, unknown>,
  timeoutMs: number,
): Promise<OllamaContextBudget | null> {
  const model = asString(requestBody["model"]);
  if (!model || model.length === 0) {
    return null;
  }

  const contextLength = await fetchOllamaModelContextLength(baseUrl, model, timeoutMs);
  if (!contextLength || contextLength <= 0) {
    return null;
  }

  const estimatedInputTokens = estimateEmbedInputTokens(requestBody["input"] ?? requestBody["prompt"]);
  const requiredContextTokens = estimatedInputTokens;

  return {
    model,
    contextLength,
    estimatedInputTokens,
    requestedOutputTokens: 0,
    requiredContextTokens,
    availableContextTokens: contextLength,
    recommendedNumCtx: Math.min(contextLength, Math.max(4096, roundUpToContextStep(requiredContextTokens + 512))),
  };
}
