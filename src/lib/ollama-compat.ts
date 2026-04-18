import { requestWantsReasoningTrace } from "./provider-utils.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function contentToText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    if (content === null || content === undefined) {
      return "";
    }
    return stringifyUnknown(content);
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
      if (type === "text") {
        return asString(part["text"]) ?? "";
      }

      if (type === "input_text") {
        return asString(part["text"]) ?? "";
      }

      return "";
    })
    .join("");
}

function normalizeRole(role: unknown): "system" | "user" | "assistant" {
  const value = asString(role);
  if (value === "system" || value === "user" || value === "assistant") {
    return value;
  }

  if (value === "tool") {
    return "user";
  }

  return "user";
}

function chatMessagesToOllamaMessages(messages: unknown): Array<{ readonly role: string; readonly content: string }> {
  if (!Array.isArray(messages)) {
    return [];
  }

  const normalized: Array<{ readonly role: string; readonly content: string }> = [];

  for (const rawMessage of messages) {
    if (!isRecord(rawMessage)) {
      continue;
    }

    const role = normalizeRole(rawMessage["role"]);
    const content = contentToText(rawMessage["content"]);

    if (content.length === 0 && role !== "assistant") {
      continue;
    }

    normalized.push({ role, content });
  }

  return normalized;
}

function normalizePositiveNumber(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }

    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }

    return Math.floor(parsed);
  }

  throw new Error(`${fieldName} must be a positive number`);
}

function extractOllamaControlObject(requestBody: Record<string, unknown>): Record<string, unknown> | null {
  const openHax = isRecord(requestBody["open_hax"]) ? requestBody["open_hax"] : null;
  const openHaxOllama = openHax && isRecord(openHax["ollama"]) ? openHax["ollama"] : null;
  if (openHaxOllama) {
    return openHaxOllama;
  }

  const providerOptions = isRecord(requestBody["provider_options"]) ? requestBody["provider_options"] : null;
  const providerOllama = providerOptions && isRecord(providerOptions["ollama"]) ? providerOptions["ollama"] : null;
  if (providerOllama) {
    return providerOllama;
  }

  return null;
}

function extractNumCtx(requestBody: Record<string, unknown>): number | undefined {
  const control = extractOllamaControlObject(requestBody);

  const preferred = control ? normalizePositiveNumber(control["num_ctx"], "num_ctx") : undefined;
  if (preferred !== undefined) {
    return preferred;
  }

  const topLevel = normalizePositiveNumber(requestBody["num_ctx"], "num_ctx");
  if (topLevel !== undefined) {
    return topLevel;
  }

  return normalizePositiveNumber(requestBody["ollama_num_ctx"], "ollama_num_ctx");
}

export function requestHasExplicitNumCtx(requestBody: Record<string, unknown>): boolean {
  return extractNumCtx(requestBody) !== undefined;
}

function extractThinkPreference(requestBody: Record<string, unknown>): boolean | undefined {
  const control = extractOllamaControlObject(requestBody);
  const controlValue = control ? asBoolean(control["think"]) : undefined;
  if (controlValue !== undefined) {
    return controlValue;
  }

  const topLevelValue = asBoolean(requestBody["think"]);
  if (topLevelValue !== undefined) {
    return topLevelValue;
  }

  if (
    requestBody["reasoning"] !== undefined
    || requestBody["reasoning_effort"] !== undefined
    || requestBody["reasoningEffort"] !== undefined
    || requestBody["thinking"] !== undefined
    || requestBody["include"] !== undefined
  ) {
    return requestWantsReasoningTrace(requestBody);
  }

  return undefined;
}

function normalizeStopSequences(stop: unknown): string[] | undefined {
  if (typeof stop === "string") {
    return stop.length > 0 ? [stop] : undefined;
  }

  if (!Array.isArray(stop)) {
    return undefined;
  }

  const values = stop
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return values.length > 0 ? values : undefined;
}

function stripModelPrefix(model: string, prefixes: readonly string[]): string {
  const lowerModel = model.toLowerCase();

  for (const prefix of prefixes) {
    if (!prefix) {
      continue;
    }

    const lowerPrefix = prefix.toLowerCase();
    if (!lowerModel.startsWith(lowerPrefix)) {
      continue;
    }

    const stripped = model.slice(prefix.length).trim();
    return stripped.length > 0 ? stripped : model;
  }

  return model;
}

export function shouldUseOllamaUpstream(model: unknown, prefixes: readonly string[]): boolean {
  if (typeof model !== "string") {
    return false;
  }

  const lowerModel = model.toLowerCase();
  return prefixes.some((prefix) => prefix.length > 0 && lowerModel.startsWith(prefix.toLowerCase()));
}

export function chatRequestToOllamaRequest(
  requestBody: Record<string, unknown>,
  modelPrefixes: readonly string[]
): Record<string, unknown> {
  const requestedModel = asString(requestBody["model"]) ?? "";
  const ollamaModel = stripModelPrefix(requestedModel, modelPrefixes);

  if (ollamaModel.length === 0) {
    throw new Error("Ollama routing requires a non-empty model name");
  }

  const payload: Record<string, unknown> = {
    model: ollamaModel,
    stream: false,
    messages: chatMessagesToOllamaMessages(requestBody["messages"])
  };

  const think = extractThinkPreference(requestBody);
  if (think !== undefined) {
    payload["think"] = think;
  }

  if (Array.isArray(requestBody["tools"])) {
    payload["tools"] = requestBody["tools"];
  }

  const options: Record<string, unknown> = {};

  const numCtx = extractNumCtx(requestBody);
  if (numCtx !== undefined) {
    options["num_ctx"] = numCtx;
  }

  const maxTokens = asNumber(requestBody["max_completion_tokens"]) ?? asNumber(requestBody["max_tokens"]);
  if (maxTokens !== undefined) {
    options["num_predict"] = Math.max(1, Math.floor(maxTokens));
  }

  const temperature = asNumber(requestBody["temperature"]);
  if (temperature !== undefined) {
    options["temperature"] = temperature;
  }

  const topP = asNumber(requestBody["top_p"]);
  if (topP !== undefined) {
    options["top_p"] = topP;
  }

  const stop = normalizeStopSequences(requestBody["stop"]);
  if (stop) {
    options["stop"] = stop;
  }

  if (Object.keys(options).length > 0) {
    payload["options"] = options;
  }

  return payload;
}

function parseCreatedAt(createdAt: unknown): number {
  if (typeof createdAt !== "string") {
    return Math.floor(Date.now() / 1000);
  }

  const parsed = Date.parse(createdAt);
  if (Number.isNaN(parsed)) {
    return Math.floor(Date.now() / 1000);
  }

  return Math.floor(parsed / 1000);
}

function mapOllamaToolCalls(message: Record<string, unknown> | null): Array<Record<string, unknown>> {
  if (!message || !Array.isArray(message["tool_calls"])) {
    return [];
  }

  return message["tool_calls"]
    .map<Record<string, unknown> | null>((entry, index) => {
      if (!isRecord(entry)) {
        return null;
      }

      const functionData = isRecord(entry["function"]) ? entry["function"] : null;
      const name = asString(functionData?.["name"]) ?? asString(entry["name"]);
      if (!name) {
        return null;
      }

      const argumentsValue = functionData ? functionData["arguments"] : entry["arguments"];
      const argumentsText = typeof argumentsValue === "string"
        ? argumentsValue
        : JSON.stringify(argumentsValue ?? {});

      return {
        id: `call_${index}`,
        type: "function",
        function: {
          name,
          arguments: argumentsText
        }
      };
    })
    .filter((entry): entry is Record<string, unknown> => entry !== null);
}

function resolveFinishReason(doneReason: unknown, hasToolCalls: boolean): "stop" | "length" | "tool_calls" {
  if (hasToolCalls) {
    return "tool_calls";
  }

  const reason = asString(doneReason);
  if (reason === "length") {
    return "length";
  }

  return "stop";
}

export function ollamaToChatCompletion(responseBody: unknown, fallbackModel: string): Record<string, unknown> {
  if (!isRecord(responseBody)) {
    throw new Error("Invalid Ollama /api/chat response payload");
  }

  const model = asString(responseBody["model"]) ?? fallbackModel;
  const created = parseCreatedAt(responseBody["created_at"]);
  const message = isRecord(responseBody["message"]) ? responseBody["message"] : null;
  const toolCalls = mapOllamaToolCalls(message);
  const content = asString(message?.["content"]) ?? "";
  const reasoning = asString(message?.["thinking"]) ?? asString(responseBody["thinking"]) ?? "";
  const finishReason = resolveFinishReason(responseBody["done_reason"], toolCalls.length > 0);

  const assistantMessage: Record<string, unknown> = {
    role: "assistant",
    content: toolCalls.length > 0 ? (content.length > 0 ? content : null) : content
  };

  if (reasoning.length > 0) {
    assistantMessage["reasoning_content"] = reasoning;
  }

  if (toolCalls.length > 0) {
    assistantMessage["tool_calls"] = toolCalls;
  }

  const completion: Record<string, unknown> = {
    id: `chatcmpl_ollama_${Date.now()}`,
    object: "chat.completion",
    created,
    model,
    choices: [
      {
        index: 0,
        message: assistantMessage,
        finish_reason: finishReason
      }
    ],
    system_fingerprint: ""
  };

  const promptTokens = asNumber(responseBody["prompt_eval_count"]);
  const completionTokens = asNumber(responseBody["eval_count"]);
  if (promptTokens !== undefined && completionTokens !== undefined) {
    completion["usage"] = {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    };
  }

  return completion;
}
