function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
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

function parseBase64DataUrl(value: string): { readonly mediaType: string; readonly data: string } | null {
  if (!value.startsWith("data:")) {
    return null;
  }

  const commaIndex = value.indexOf(",");
  if (commaIndex <= 5) {
    return null;
  }

  const metadata = value.slice(5, commaIndex);
  if (!metadata.toLowerCase().includes(";base64")) {
    return null;
  }

  const data = value.slice(commaIndex + 1);
  if (data.length === 0) {
    return null;
  }

  const mediaType = metadata.split(";", 1)[0] ?? "";
  return {
    mediaType: mediaType.length > 0 ? mediaType : "application/octet-stream",
    data
  };
}

function imageUrlToMessagesSource(url: string): Record<string, unknown> {
  const dataUrl = parseBase64DataUrl(url);
  if (!dataUrl) {
    return {
      type: "url",
      url
    };
  }

  return {
    type: "base64",
    media_type: dataUrl.mediaType,
    data: dataUrl.data
  };
}

function normalizeImagePart(part: Record<string, unknown>): Record<string, unknown> | null {
  const imageData = isRecord(part["image_url"]) ? part["image_url"] : null;
  const imageUrl = asString(imageData?.["url"]) ?? asString(part["image_url"]);
  if (imageUrl) {
    return {
      type: "image",
      source: imageUrlToMessagesSource(imageUrl)
    };
  }

  const source = isRecord(part["source"]) ? part["source"] : null;
  const sourceType = asString(source?.["type"]);
  if (sourceType === "url") {
    const sourceUrl = asString(source?.["url"]);
    if (sourceUrl) {
      return {
        type: "image",
        source: imageUrlToMessagesSource(sourceUrl)
      };
    }
  }

  if (sourceType === "base64") {
    const sourceData = asString(source?.["data"]);
    if (sourceData) {
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: asString(source?.["media_type"]) ?? "application/octet-stream",
          data: sourceData
        }
      };
    }
  }

  const directUrl = asString(part["url"]);
  if (directUrl) {
    return {
      type: "image",
      source: imageUrlToMessagesSource(directUrl)
    };
  }

  const data = asString(part["data"]);
  if (data) {
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: asString(part["mime_type"]) ?? asString(part["mimeType"]) ?? asString(part["media_type"]) ?? "application/octet-stream",
        data
      }
    };
  }

  return null;
}

function normalizeContentPart(part: unknown): unknown {
  if (typeof part === "string") {
    return {
      type: "text",
      text: part
    };
  }

  if (!isRecord(part)) {
    return part;
  }

  const type = asString(part["type"]);
  if (type === "text" || type === "input_text" || type === "output_text") {
    return {
      type: "text",
      text: asString(part["text"]) ?? ""
    };
  }

  if (type === "image_url" || type === "input_image" || type === "image") {
    const normalizedImage = normalizeImagePart(part);
    if (normalizedImage) {
      return normalizedImage;
    }

    return part;
  }

  return part;
}

function normalizeMessageContent(content: unknown): unknown {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return content;
  }

  return content.map((part) => normalizeContentPart(part));
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
      if (type !== "text" && type !== "input_text" && type !== "output_text") {
        return "";
      }

      return asString(part["text"]) ?? "";
    })
    .join("");
}

function normalizeMessageContentToParts(content: unknown): Record<string, unknown>[] {
  if (typeof content === "string") {
    if (content.length === 0) {
      return [];
    }

    return [{
      type: "text",
      text: content
    }];
  }

  if (!Array.isArray(content)) {
    if (content === null || content === undefined) {
      return [];
    }

    return [{
      type: "text",
      text: stringifyUnknown(content)
    }];
  }

  return content
    .map((part) => normalizeContentPart(part))
    .map((part) => {
      if (typeof part === "string") {
        return {
          type: "text",
          text: part
        };
      }

      return part;
    })
    .filter((part): part is Record<string, unknown> => {
      if (!isRecord(part)) {
        return false;
      }

      const type = asString(part["type"]);
      if (!type) {
        return false;
      }

      if (type !== "text") {
        return true;
      }

      const text = asString(part["text"]);
      return text !== undefined && text.length > 0;
    });
}

function parseToolUseInput(argumentsValue: unknown): Record<string, unknown> {
  if (isRecord(argumentsValue)) {
    return argumentsValue;
  }

  if (typeof argumentsValue === "string") {
    try {
      const parsed = JSON.parse(argumentsValue);
      if (isRecord(parsed)) {
        return parsed;
      }

      if (parsed === null || parsed === undefined) {
        return {};
      }

      return { value: parsed };
    } catch {
      return { value: argumentsValue };
    }
  }

  if (argumentsValue === null || argumentsValue === undefined) {
    return {};
  }

  return { value: argumentsValue };
}

function assistantToolCallsToToolUseParts(toolCalls: unknown): Record<string, unknown>[] {
  if (!Array.isArray(toolCalls)) {
    return [];
  }

  const parts: Record<string, unknown>[] = [];
  for (const [index, toolCall] of toolCalls.entries()) {
    if (!isRecord(toolCall)) {
      continue;
    }

    const type = asString(toolCall["type"]) ?? "function";
    if (type !== "function") {
      continue;
    }

    const fn = isRecord(toolCall["function"]) ? toolCall["function"] : null;
    const name = fn ? asString(fn["name"]) : undefined;
    if (!name) {
      continue;
    }

    const id = asString(toolCall["id"]) ?? `toolu_${index}`;
    const input = parseToolUseInput(fn ? fn["arguments"] : undefined);
    parts.push({
      type: "tool_use",
      id,
      name,
      input
    });
  }

  return parts;
}

function mapAssistantMessage(message: Record<string, unknown>): Record<string, unknown> | null {
  const contentParts = normalizeMessageContentToParts(message["content"]);
  const toolUseParts = assistantToolCallsToToolUseParts(message["tool_calls"]);
  const content = [...contentParts, ...toolUseParts];

  if (content.length === 0) {
    return null;
  }

  const first = content[0];
  if (toolUseParts.length === 0 && content.length === 1 && asString(first["type"]) === "text") {
    return {
      role: "assistant",
      content: asString(first["text"]) ?? ""
    };
  }

  return {
    role: "assistant",
    content
  };
}

function mapToolMessageToToolResult(message: Record<string, unknown>, index: number): Record<string, unknown> | null {
  const toolUseId = asString(message["tool_call_id"]);
  if (!toolUseId) {
    return null;
  }

  const block: Record<string, unknown> = {
    type: "tool_result",
    tool_use_id: toolUseId,
    content: contentToText(message["content"])
  };

  const isError = message["is_error"];
  if (typeof isError === "boolean") {
    block["is_error"] = isError;
  }

  if (asString(block["tool_use_id"]) === undefined) {
    block["tool_use_id"] = `toolu_${index}`;
  }

  return block;
}

function normalizeToolChoice(toolChoice: unknown): unknown {
  if (typeof toolChoice === "string") {
    if (toolChoice === "required" || toolChoice === "auto") {
      return { type: "any" };
    }
    if (toolChoice === "none") {
      return { type: "none" };
    }
    return toolChoice;
  }

  if (!isRecord(toolChoice)) {
    return toolChoice;
  }

  const type = asString(toolChoice["type"]);
  if (type === "function") {
    const functionConfig = isRecord(toolChoice["function"]) ? toolChoice["function"] : null;
    const name = functionConfig ? asString(functionConfig["name"]) : asString(toolChoice["name"]);
    if (!name) {
      return { type: "any" };
    }

    return {
      type: "tool",
      name
    };
  }

  if (type === "required") {
    return { type: "any" };
  }

  if (type === "auto") {
    return { type: "any" };
  }

  if (type === "none") {
    return { type: "none" };
  }

  return toolChoice;
}

function normalizeTools(tools: unknown): unknown {
  if (!Array.isArray(tools)) {
    return tools;
  }

  return tools
    .map((tool) => {
      if (!isRecord(tool)) {
        return null;
      }

      const type = asString(tool["type"]) ?? "function";
      if (type !== "function") {
        return null;
      }

      const functionData = isRecord(tool["function"]) ? tool["function"] : null;
      const name = functionData ? asString(functionData["name"]) : asString(tool["name"]);
      if (!name) {
        return null;
      }

      const mapped: Record<string, unknown> = {
        name
      };

      const description = functionData ? asString(functionData["description"]) : asString(tool["description"]);
      if (description) {
        mapped["description"] = description;
      }

      const parameters = functionData?.["parameters"] ?? tool["input_schema"];
      if (parameters !== undefined) {
        mapped["input_schema"] = parameters;
      }

      return mapped;
    })
    .filter((tool): tool is Record<string, unknown> => tool !== null);
}

export function shouldUseMessagesUpstream(model: unknown, prefixes: readonly string[]): boolean {
  if (typeof model !== "string") {
    return false;
  }

  const lower = model.toLowerCase();
  return prefixes.some((prefix) => lower.startsWith(prefix.toLowerCase()));
}

const MIN_THINKING_BUDGET_TOKENS = 1024;
const DEFAULT_THINKING_BUDGET_TOKENS = 12288;
const THINKING_BUDGET_TOKENS_BY_EFFORT = {
  minimal: 1024,
  low: 4096,
  medium: 12288,
  high: 24576,
  xhigh: 32768,
} as const;

type ThinkingEffort = "disabled" | keyof typeof THINKING_BUDGET_TOKENS_BY_EFFORT;

function normalizeThinkingEffort(value: unknown): ThinkingEffort | undefined {
  const raw = asString(value);
  if (!raw) {
    return undefined;
  }

  switch (raw.trim().toLowerCase()) {
    case "none":
    case "disable":
    case "disabled":
    case "off":
      return "disabled";
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

function requestedMaxTokens(body: Record<string, unknown>): number | undefined {
  return asNumber(body["max_completion_tokens"]) ?? asNumber(body["max_tokens"]);
}

function normalizeThinkingBudgetTokens(targetBudgetTokens: number, maxTokens: number | undefined): number | undefined {
  const normalizedTargetBudgetTokens = Math.max(MIN_THINKING_BUDGET_TOKENS, Math.floor(targetBudgetTokens));
  if (maxTokens === undefined) {
    return normalizedTargetBudgetTokens;
  }

  const normalizedMaxTokens = Math.floor(maxTokens);
  if (!Number.isFinite(normalizedMaxTokens) || normalizedMaxTokens <= 0) {
    return normalizedTargetBudgetTokens;
  }

  if (normalizedMaxTokens <= MIN_THINKING_BUDGET_TOKENS) {
    return undefined;
  }

  return Math.max(
    MIN_THINKING_BUDGET_TOKENS,
    Math.min(normalizedTargetBudgetTokens, normalizedMaxTokens - 1),
  );
}

function buildEnabledThinkingRequest(targetBudgetTokens: number, maxTokens: number | undefined): Record<string, unknown> {
  const budgetTokens = normalizeThinkingBudgetTokens(targetBudgetTokens, maxTokens);
  if (budgetTokens === undefined) {
    throw new Error(`Extended thinking requires max_tokens greater than ${MIN_THINKING_BUDGET_TOKENS} for messages-compatible models`);
  }

  return {
    type: "enabled",
    budget_tokens: budgetTokens,
  };
}

function thinkingBudgetTokensForEffort(effort: Exclude<ThinkingEffort, "disabled">): number {
  return THINKING_BUDGET_TOKENS_BY_EFFORT[effort];
}

export function normalizeMessagesThinkingBudget(payload: Record<string, unknown>): Record<string, unknown> {
  const thinking = isRecord(payload["thinking"]) ? payload["thinking"] : null;
  if (!thinking || asString(thinking["type"]) !== "enabled") {
    return payload;
  }

  const budgetTokens = asNumber(thinking["budget_tokens"]);
  const normalizedBudgetTokens = normalizeThinkingBudgetTokens(
    budgetTokens && budgetTokens > 0
      ? budgetTokens
      : DEFAULT_THINKING_BUDGET_TOKENS,
    asNumber(payload["max_tokens"]),
  );
  if (normalizedBudgetTokens === undefined) {
    throw new Error(`Extended thinking requires max_tokens greater than ${MIN_THINKING_BUDGET_TOKENS} for messages-compatible models`);
  }

  if (normalizedBudgetTokens === budgetTokens) {
    return payload;
  }

  return {
    ...payload,
    thinking: {
      ...thinking,
      budget_tokens: normalizedBudgetTokens,
    },
  };
}

function requestIncludesReasoningTrace(body: Record<string, unknown>): boolean {
  const include = body["include"];
  if (!Array.isArray(include)) {
    return false;
  }

  return include.some((entry) => asString(entry) === "reasoning.encrypted_content");
}

function normalizeThinkingRequest(body: Record<string, unknown>): Record<string, unknown> | undefined {
  const maxTokens = requestedMaxTokens(body);
  const explicitThinking = isRecord(body["thinking"]) ? body["thinking"] : null;
  if (explicitThinking) {
    const type = asString(explicitThinking["type"]);
    if (type === "disabled") {
      return {
        type: "disabled"
      };
    }

    if (type === "enabled") {
      const budgetTokens = asNumber(explicitThinking["budget_tokens"]);
      return buildEnabledThinkingRequest(
        budgetTokens && budgetTokens > 0
          ? budgetTokens
          : DEFAULT_THINKING_BUDGET_TOKENS,
        maxTokens,
      );
    }
  }

  const reasoning = isRecord(body["reasoning"]) ? body["reasoning"] : null;
  const effort = normalizeThinkingEffort(
    reasoning?.["effort"]
      ?? body["reasoning_effort"]
      ?? body["reasoningEffort"]
  );

  if (effort === "disabled") {
    return {
      type: "disabled"
    };
  }

  if (effort) {
    return buildEnabledThinkingRequest(thinkingBudgetTokensForEffort(effort), maxTokens);
  }

  if (requestIncludesReasoningTrace(body)) {
    return buildEnabledThinkingRequest(DEFAULT_THINKING_BUDGET_TOKENS, maxTokens);
  }

  return undefined;
}

export function chatRequestToMessagesRequest(body: Record<string, unknown>): Record<string, unknown> {
  let system: string | undefined;
  const messages: Record<string, unknown>[] = [];
  let pendingToolResults: Record<string, unknown>[] = [];

  const flushToolResults = () => {
    if (pendingToolResults.length === 0) {
      return;
    }

    messages.push({
      role: "user",
      content: pendingToolResults
    });
    pendingToolResults = [];
  };

  if (Array.isArray(body["messages"])) {
    for (const [index, rawMessage] of body["messages"].entries()) {
      if (!isRecord(rawMessage)) {
        continue;
      }

      const role = asString(rawMessage["role"]) ?? "user";
      if (role === "system") {
        const text = contentToText(normalizeMessageContent(rawMessage["content"]));
        if (text.length > 0) {
          system = system ? `${system}\n${text}` : text;
        }
        continue;
      }

      if (role === "tool") {
        const toolResult = mapToolMessageToToolResult(rawMessage, index);
        if (toolResult) {
          pendingToolResults.push(toolResult);
        }
        continue;
      }

      flushToolResults();

      if (role === "assistant") {
        const assistant = mapAssistantMessage(rawMessage);
        if (assistant) {
          messages.push(assistant);
        }
        continue;
      }

      if (role === "user") {
        messages.push({
          role,
          content: normalizeMessageContent(rawMessage["content"] ?? "")
        });
      }
    }
  }

  flushToolResults();

  const payload: Record<string, unknown> = {
    model: body["model"],
    messages,
    stream: false
  };

  if (system && system.trim().length > 0) {
    payload["system"] = system;
  }

  const maxTokens = requestedMaxTokens(body);
  if (maxTokens !== undefined) {
    payload["max_tokens"] = maxTokens;
  }

  const temperature = body["temperature"];
  if (temperature !== undefined) {
    payload["temperature"] = temperature;
  }

  const topP = body["top_p"];
  if (topP !== undefined) {
    payload["top_p"] = topP;
  }

  const thinking = normalizeThinkingRequest(body);
  if (thinking) {
    payload["thinking"] = thinking;
  }

  if (body["tools"] !== undefined) {
    payload["tools"] = normalizeTools(body["tools"]);
  }

  if (body["tool_choice"] !== undefined) {
    payload["tool_choice"] = normalizeToolChoice(body["tool_choice"]);
  }

  return normalizeMessagesThinkingBudget(payload);
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (!isRecord(part)) {
        return "";
      }
      if (asString(part["type"]) !== "text") {
        return "";
      }
      return asString(part["text"]) ?? "";
    })
    .join("");
}

function extractReasoningContent(content: unknown): string {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (!isRecord(part)) {
        return "";
      }

      const type = asString(part["type"]);
      if (type === "thinking" || type === "reasoning") {
        return asString(part["thinking"]) ?? asString(part["text"]) ?? asString(part["reasoning"]) ?? "";
      }

      if (type === "text" && part["thought"] === true) {
        return asString(part["text"]) ?? "";
      }

      return "";
    })
    .join("");
}

interface ChatToolCall {
  readonly id: string;
  readonly type: "function";
  readonly function: {
    readonly name: string;
    readonly arguments: string;
  };
}

function mapToolCalls(content: unknown): ReadonlyArray<ChatToolCall> {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map<ChatToolCall | null>((part, index) => {
      if (!isRecord(part)) {
        return null;
      }

      if (asString(part["type"]) !== "tool_use") {
        return null;
      }

      const name = asString(part["name"]);
      if (!name) {
        return null;
      }

      const callId = asString(part["id"]) ?? `call_${index}`;
      const input = part["input"];

      return {
        id: callId,
        type: "function",
        function: {
          name,
          arguments: typeof input === "string" ? input : JSON.stringify(input ?? {})
        }
      };
    })
    .filter((entry): entry is ChatToolCall => entry !== null);
}

export function messagesToChatCompletion(body: unknown, fallbackModel: string): Record<string, unknown> {
  if (!isRecord(body)) {
    throw new Error("Invalid /v1/messages response payload");
  }

  const content = body["content"];
  const toolCalls = mapToolCalls(content);
  const text = extractTextContent(content);
  const reasoning = extractReasoningContent(content) || asString(body["reasoning_content"]) || asString(body["reasoning"]) || "";

  const finishReason = toolCalls.length > 0 ? "tool_calls" : "stop";
  const message: Record<string, unknown> = {
    role: "assistant",
    content: toolCalls.length > 0 ? (text.length > 0 ? text : null) : text
  };
  if (reasoning.length > 0) {
    message["reasoning_content"] = reasoning;
  }
  if (toolCalls.length > 0) {
    message["tool_calls"] = toolCalls;
  }

  const usage = isRecord(body["usage"]) ? body["usage"] : null;
  const promptTokens = usage ? asNumber(usage["input_tokens"]) : undefined;
  const completionTokens = usage ? asNumber(usage["output_tokens"]) : undefined;
  const totalTokens =
    promptTokens !== undefined && completionTokens !== undefined
      ? promptTokens + completionTokens
      : undefined;

  const completion: Record<string, unknown> = {
    id: asString(body["id"]) ?? `chatcmpl_${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: asString(body["model"]) ?? fallbackModel,
    choices: [
      {
        index: 0,
        message,
        finish_reason: finishReason
      }
    ],
    system_fingerprint: ""
  };

  if (promptTokens !== undefined && completionTokens !== undefined && totalTokens !== undefined) {
    completion["usage"] = {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens
    };
  }

  return completion;
}
