import { setTimeout } from "node:timers/promises";

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

const INTERLEAVED_REASONING_KEYS = new Set(["reasoning_content", "reasoning_details", "tool_calls", "function_call"]);
const INTERLEAVED_REASONING_PART_TYPES = new Set(["reasoning", "reasoning_content", "reasoning_details"]);
const SUPPORTED_CHAT_MESSAGE_ROLES = new Set(["system", "developer", "user", "assistant", "tool"]);
const TEXT_PART_TYPES = new Set(["text", "input_text", "output_text", "refusal"]);

function contentToText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const chunks: string[] = [];
    for (const part of content) {
      if (typeof part === "string") {
        chunks.push(part);
        continue;
      }

      if (!isRecord(part)) {
        continue;
      }

      const partType = asString(part["type"]);
      if (partType && INTERLEAVED_REASONING_PART_TYPES.has(partType)) {
        continue;
      }
      if (partType && !TEXT_PART_TYPES.has(partType)) {
        continue;
      }

      const text = asString(part["text"]) ?? asString(part["refusal"]);
      if (text) {
        chunks.push(text);
      }
    }

    return chunks.join("");
  }

  if (content === null || content === undefined) {
    return "";
  }

  return stringifyUnknown(content);
}

function instructionTextFromMessages(messages: unknown): string {
  if (!Array.isArray(messages)) {
    return "";
  }

  const parts: string[] = [];
  for (const entry of messages) {
    if (!isRecord(entry)) {
      continue;
    }

    const role = asString(entry["role"]);
    if (role !== "system" && role !== "developer") {
      continue;
    }

    const text = contentToText(entry["content"]);
    if (text.length > 0) {
      parts.push(text);
    }
  }

  return parts.join("\n");
}

function appendStringPart(parts: string[], value: unknown): void {
  const text = asString(value);
  if (text && text.length > 0) {
    parts.push(text);
  }
}

function extractReasoningTextFromResponsesItem(item: Record<string, unknown>): string {
  const parts: string[] = [];
  appendStringPart(parts, item["reasoning"]);
  appendStringPart(parts, item["text"]);

  const summary = item["summary"];
  if (typeof summary === "string") {
    appendStringPart(parts, summary);
  }

  if (Array.isArray(summary)) {
    for (const entry of summary) {
      if (!isRecord(entry)) {
        continue;
      }

      appendStringPart(parts, entry["text"]);
      appendStringPart(parts, entry["summary"]);
    }
  }

  return parts.join("");
}

function hasMeaningfulContent(content: unknown): boolean {
  if (typeof content === "string") {
    return content.length > 0;
  }

  if (Array.isArray(content)) {
    return content.length > 0;
  }

  return content !== null && content !== undefined;
}

function normalizeImagePartForResponses(part: Record<string, unknown>): Record<string, unknown> | null {
  const imageUrlData = isRecord(part["image_url"]) ? part["image_url"] : null;
  const imageUrl = asString(imageUrlData?.["url"]) ?? asString(part["image_url"]);
  const fileId = asString(part["file_id"]);
  const detail = asString(part["detail"]) ?? asString(imageUrlData?.["detail"]);

  if (imageUrl || fileId) {
    const normalized: Record<string, unknown> = {
      type: "input_image"
    };

    if (imageUrl) {
      normalized["image_url"] = imageUrl;
    }

    if (fileId) {
      normalized["file_id"] = fileId;
    }

    if (detail) {
      normalized["detail"] = detail;
    }

    return normalized;
  }

  const source = isRecord(part["source"]) ? part["source"] : null;
  const sourceType = asString(source?.["type"]);

  if (sourceType === "url") {
    const sourceUrl = asString(source?.["url"]);
    if (sourceUrl) {
      return {
        type: "input_image",
        image_url: sourceUrl
      };
    }
  }

  if (sourceType === "base64") {
    const sourceData = asString(source?.["data"]);
    if (sourceData) {
      const sourceMediaType = asString(source?.["media_type"]) ?? "application/octet-stream";
      return {
        type: "input_image",
        image_url: `data:${sourceMediaType};base64,${sourceData}`
      };
    }
  }

  const directUrl = asString(part["url"]);
  if (directUrl) {
    return {
      type: "input_image",
      image_url: directUrl
    };
  }

  const data = asString(part["data"]);
  if (data) {
    const mediaType = asString(part["mime_type"]) ?? asString(part["mimeType"]) ?? asString(part["media_type"]) ?? "application/octet-stream";
    return {
      type: "input_image",
      image_url: `data:${mediaType};base64,${data}`
    };
  }

  return null;
}

function normalizeChatContentPartForResponses(role: string, part: unknown): unknown {
  if (typeof part === "string") {
    return {
      type: role === "assistant" ? "output_text" : "input_text",
      text: part
    };
  }

  if (!isRecord(part)) {
    return part;
  }

  const type = asString(part["type"]);
  if (type && INTERLEAVED_REASONING_PART_TYPES.has(type)) {
    return null;
  }
  if (type === "text" || type === "input_text" || type === "output_text") {
    return {
      type: role === "assistant" ? "output_text" : "input_text",
      text: asString(part["text"]) ?? ""
    };
  }

  if (type === "image_url" || type === "input_image" || type === "image") {
    const normalizedImage = normalizeImagePartForResponses(part);
    if (normalizedImage) {
      return normalizedImage;
    }

    return part;
  }

  const sanitized = { ...part };
  for (const key of INTERLEAVED_REASONING_KEYS) {
    delete sanitized[key];
  }

  return sanitized;
}

function normalizeChatMessageContentForResponses(role: string, content: unknown): unknown {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return content;
  }

  return content
    .map((part) => normalizeChatContentPartForResponses(role, part))
    .filter((part) => part !== null);
}

function normalizeToolCallArguments(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "{}";
  }

  return stringifyUnknown(value);
}

function chatMessagesToResponsesInput(messages: unknown): unknown[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  const input: unknown[] = [];
  for (const [messageIndex, entry] of messages.entries()) {
    if (!isRecord(entry)) {
      continue;
    }

    const role = asString(entry["role"]);
    if (!role) {
      throw new Error("messages entries must include a string role");
    }

    if (!SUPPORTED_CHAT_MESSAGE_ROLES.has(role)) {
      throw new Error(`unsupported messages role: ${role}`);
    }

    if (role === "tool") {
      const callId = asString(entry["tool_call_id"]);
      if (!callId) {
        continue;
      }

      input.push({
        type: "function_call_output",
        call_id: callId,
        output: contentToText(entry["content"])
      });
      continue;
    }

    if (role === "assistant") {
      const toolCalls = Array.isArray(entry["tool_calls"]) ? entry["tool_calls"] : [];
      if (hasMeaningfulContent(entry["content"])) {
        input.push({
          role,
          content: normalizeChatMessageContentForResponses(role, entry["content"])
        });
      }

      for (const [toolIndex, toolCall] of toolCalls.entries()) {
        if (!isRecord(toolCall)) {
          continue;
        }

        const type = asString(toolCall["type"]) ?? "function";
        if (type !== "function") {
          continue;
        }

        const functionData = isRecord(toolCall["function"]) ? toolCall["function"] : null;
        const functionName = functionData ? asString(functionData["name"]) : undefined;
        if (!functionName) {
          continue;
        }

        const callId = asString(toolCall["id"]) ?? `call_${messageIndex}_${toolIndex}`;
        input.push({
          type: "function_call",
          call_id: callId,
          name: functionName,
          arguments: normalizeToolCallArguments(functionData ? functionData["arguments"] : undefined)
        });
      }

      if (!hasMeaningfulContent(entry["content"]) && toolCalls.length === 0) {
        input.push({
          role,
          content: ""
        });
      }

      continue;
    }

    input.push({
      role,
      content: normalizeChatMessageContentForResponses(role, entry["content"] ?? "")
    });
  }

  return input;
}

export function shouldUseResponsesUpstream(model: unknown, prefixes: readonly string[]): boolean {
  if (typeof model !== "string") {
    return false;
  }

  const normalizedModel = model.toLowerCase();
  for (const prefix of prefixes) {
    if (normalizedModel.startsWith(prefix.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function normalizeToolsForResponses(tools: unknown): unknown {
  if (!Array.isArray(tools)) {
    return tools;
  }

  const mapped: unknown[] = [];
  for (const tool of tools) {
    if (!isRecord(tool)) {
      continue;
    }

    const type = asString(tool["type"]) ?? "function";
    if (type !== "function") {
      mapped.push(tool);
      continue;
    }

    if (asString(tool["name"])) {
      mapped.push(tool);
      continue;
    }

    const functionConfig = isRecord(tool["function"]) ? tool["function"] : null;
    const name = functionConfig ? asString(functionConfig["name"]) : undefined;
    if (!name) {
      continue;
    }

    const normalizedTool: Record<string, unknown> = {
      type: "function",
      name
    };

    const description = functionConfig ? asString(functionConfig["description"]) : undefined;
    if (description) {
      normalizedTool["description"] = description;
    }

    if (functionConfig && functionConfig["parameters"] !== undefined) {
      normalizedTool["parameters"] = functionConfig["parameters"];
    }

    if (functionConfig && typeof functionConfig["strict"] === "boolean") {
      normalizedTool["strict"] = functionConfig["strict"];
    }

    mapped.push(normalizedTool);
  }

  return mapped;
}

function normalizeToolChoiceForResponses(toolChoice: unknown): unknown {
  if (!isRecord(toolChoice)) {
    return toolChoice;
  }

  const type = asString(toolChoice["type"]);
  if (type !== "function") {
    return toolChoice;
  }

  const directName = asString(toolChoice["name"]);
  if (directName) {
    return {
      type: "function",
      name: directName
    };
  }

  const functionConfig = isRecord(toolChoice["function"]) ? toolChoice["function"] : null;
  const functionName = functionConfig ? asString(functionConfig["name"]) : undefined;
  if (!functionName) {
    return toolChoice;
  }

  return {
    type: "function",
    name: functionName
  };
}

export function chatRequestToResponsesRequest(requestBody: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    model: requestBody["model"],
    instructions: instructionTextFromMessages(requestBody["messages"]),
    input: chatMessagesToResponsesInput(requestBody["messages"]),
  };

  const maxTokens = asNumber(requestBody["max_tokens"]);
  if (maxTokens !== undefined) {
    payload["max_output_tokens"] = maxTokens;
  }

  const maxCompletionTokens = asNumber(requestBody["max_completion_tokens"]);
  if (maxCompletionTokens !== undefined && payload["max_output_tokens"] === undefined) {
    payload["max_output_tokens"] = maxCompletionTokens;
  }

  const passthroughKeys = [
    "temperature",
    "top_p",
    "presence_penalty",
    "frequency_penalty",
    "parallel_tool_calls",
    "max_tool_calls",
    "include",
    "metadata",
    "user",
    "service_tier",
    "truncation",
    "prompt_cache_key"
  ];

  for (const key of passthroughKeys) {
    if (requestBody[key] !== undefined) {
      payload[key] = requestBody[key];
    }
  }

  if (requestBody["reasoning"] !== undefined) {
    payload["reasoning"] = requestBody["reasoning"];
  }

  const rawReasoningEffort = asString(requestBody["reasoningEffort"]) ?? asString(requestBody["reasoning_effort"]);
  const reasoningEffort = rawReasoningEffort;
  const reasoningSummary = asString(requestBody["reasoningSummary"]) ?? asString(requestBody["reasoning_summary"]);
  if (reasoningEffort || reasoningSummary) {
    const reasoning = isRecord(payload["reasoning"]) ? { ...payload["reasoning"] } : {};
    if (reasoningEffort && reasoning["effort"] === undefined) {
      reasoning["effort"] = reasoningEffort;
    }
    if (reasoningSummary && reasoning["summary"] === undefined) {
      reasoning["summary"] = reasoningSummary;
    }
    payload["reasoning"] = reasoning;
  }

  if (requestBody["text"] !== undefined) {
    payload["text"] = requestBody["text"];
  }

  const textVerbosity = asString(requestBody["textVerbosity"]) ?? asString(requestBody["text_verbosity"]);
  if (textVerbosity) {
    const text = isRecord(payload["text"]) ? { ...payload["text"] } : {};
    if (!isRecord(text["format"])) {
      text["format"] = { type: "text" };
    }
    if (text["verbosity"] === undefined) {
      text["verbosity"] = textVerbosity;
    }
    payload["text"] = text;
  }

  if (requestBody["tools"] !== undefined) {
    payload["tools"] = normalizeToolsForResponses(requestBody["tools"]);
  }

  if (requestBody["tool_choice"] !== undefined) {
    payload["tool_choice"] = normalizeToolChoiceForResponses(requestBody["tool_choice"]);
  }

  return payload;
}

function responsesOutputToChatMessage(output: unknown): {
  readonly content: string | null;
  readonly reasoningContent: string;
  readonly toolCalls: ReadonlyArray<Record<string, unknown>>;
  readonly finishReason: "stop" | "tool_calls";
} {
  if (!Array.isArray(output)) {
    return {
      content: "",
      reasoningContent: "",
      toolCalls: [],
      finishReason: "stop"
    };
  }

  const textParts: string[] = [];
  const reasoningParts: string[] = [];
  const toolCalls: Record<string, unknown>[] = [];

  for (const [index, item] of output.entries()) {
    if (!isRecord(item)) {
      continue;
    }

    const itemType = asString(item["type"]);
    if (itemType === "message") {
      const role = asString(item["role"]);
      if (role !== "assistant") {
        continue;
      }

      appendStringPart(reasoningParts, item["reasoning_content"]);
      appendStringPart(reasoningParts, item["reasoning"]);

      const content = item["content"];
      if (!Array.isArray(content)) {
        continue;
      }

      for (const part of content) {
        if (!isRecord(part)) {
          continue;
        }

        const partType = asString(part["type"]);
        if (partType === "output_text") {
          const text = asString(part["text"]);
          if (text) {
            textParts.push(text);
          }
          continue;
        }

        if (partType === "reasoning" || partType === "thinking" || partType === "summary_text") {
          appendStringPart(reasoningParts, part["text"]);
          appendStringPart(reasoningParts, part["reasoning"]);
        }
      }
      continue;
    }

    if (itemType === "reasoning") {
      const reasoningText = extractReasoningTextFromResponsesItem(item);
      if (reasoningText.length > 0) {
        reasoningParts.push(reasoningText);
      }
      continue;
    }

    if (itemType === "function_call") {
      const functionName = asString(item["name"]);
      if (!functionName) {
        continue;
      }

      const callId = asString(item["call_id"]) ?? `call_${index}`;
      const argumentsText = normalizeToolCallArguments(item["arguments"]);

      toolCalls.push({
        id: callId,
        type: "function",
        function: {
          name: functionName,
          arguments: argumentsText
        }
      });
    }
  }

  const textContent = textParts.join("");
  const reasoningContent = reasoningParts.join("");
  if (toolCalls.length > 0) {
    return {
      content: textContent.length > 0 ? textContent : null,
      reasoningContent,
      toolCalls,
      finishReason: "tool_calls"
    };
  }

  return {
    content: textContent,
    reasoningContent,
    toolCalls,
    finishReason: "stop"
  };
}

export function responsesToChatCompletion(responseBody: unknown, fallbackModel: string): Record<string, unknown> {
  if (!isRecord(responseBody)) {
    throw new Error("Invalid upstream responses payload");
  }

  const id = asString(responseBody["id"]) ?? `chatcmpl_${Date.now()}`;
  const createdAt = asNumber(responseBody["created_at"]) ?? Math.floor(Date.now() / 1000);
  const model = asString(responseBody["model"]) ?? fallbackModel;
  const mappedMessage = responsesOutputToChatMessage(responseBody["output"]);

  const message: Record<string, unknown> = {
    role: "assistant",
    content: mappedMessage.content
  };
  if (mappedMessage.reasoningContent.length > 0) {
    message["reasoning_content"] = mappedMessage.reasoningContent;
  }
  if (mappedMessage.toolCalls.length > 0) {
    message["tool_calls"] = mappedMessage.toolCalls;
  }

  const completion: Record<string, unknown> = {
    id,
    object: "chat.completion",
    created: createdAt,
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: mappedMessage.finishReason
      }
    ],
    system_fingerprint: ""
  };

  const usage = isRecord(responseBody["usage"]) ? responseBody["usage"] : null;
  if (usage) {
    const promptTokens = asNumber(usage["input_tokens"]);
    const completionTokens = asNumber(usage["output_tokens"]);
    const totalTokens = asNumber(usage["total_tokens"]);

    if (promptTokens !== undefined && completionTokens !== undefined && totalTokens !== undefined) {
      const mapped: Record<string, unknown> = {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens
      };

      const inputDetails = isRecord(usage["input_tokens_details"]) ? usage["input_tokens_details"] : null;
      if (inputDetails) {
        mapped["prompt_tokens_details"] = { cached_tokens: asNumber(inputDetails["cached_tokens"]) ?? 0 };
      }

      const outputDetails = isRecord(usage["output_tokens_details"]) ? usage["output_tokens_details"] : null;
      if (outputDetails) {
        mapped["completion_tokens_details"] = { reasoning_tokens: asNumber(outputDetails["reasoning_tokens"]) ?? 0 };
      }

      completion["usage"] = mapped;
    }
  }

  return completion;
}

function parseResponsesSsePayloads(streamText: string): Array<Record<string, unknown>> {
  const blocks = streamText.split(/\r?\n\r?\n/);
  const payloads: Array<Record<string, unknown>> = [];

  for (const block of blocks) {
    const dataLines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());

    if (dataLines.length === 0) {
      continue;
    }

    const data = dataLines.join("\n").trim();
    if (data.length === 0 || data === "[DONE]") {
      continue;
    }

    try {
      const parsed: unknown = JSON.parse(data);
      if (isRecord(parsed)) {
        payloads.push(parsed);
      }
    } catch {
      // Ignore malformed SSE payloads and keep parsing the stream.
    }
  }

  return payloads;
}

export function responsesEventStreamToErrorPayload(streamText: string): Record<string, unknown> | undefined {
  for (const payload of parseResponsesSsePayloads(streamText)) {
    const type = asString(payload["type"]);
    if (type === "error" && isRecord(payload["error"])) {
      return payload["error"];
    }

    if (type === "response.failed") {
      const response = isRecord(payload["response"]) ? payload["response"] : null;
      if (response && isRecord(response["error"])) {
        return response["error"];
      }
    }
  }

  return undefined;
}

export function responsesEventStreamToChatCompletion(streamText: string, fallbackModel: string): Record<string, unknown> {
  const payloads = parseResponsesSsePayloads(streamText);
  let terminalResponse: Record<string, unknown> | undefined;
  let latestResponse: Record<string, unknown> | undefined;
  const textDeltas: string[] = [];

  for (const payload of payloads) {
    const type = asString(payload["type"]);
    const response = isRecord(payload["response"]) ? payload["response"] : null;
    if (response) {
      latestResponse = response;
    }

    if (type === "response.output_text.delta") {
      const delta = asString(payload["delta"]);
      if (delta) {
        textDeltas.push(delta);
      }
    }

    if ((type === "response.completed" || type === "response.incomplete") && response) {
      terminalResponse = response;
    }
  }

  if (terminalResponse) {
    return responsesToChatCompletion(terminalResponse, fallbackModel);
  }

  if (textDeltas.length > 0) {
    return responsesToChatCompletion({
      ...(latestResponse ?? {}),
      output: [
        {
          type: "message",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: textDeltas.join("")
            }
          ]
        }
      ]
    }, fallbackModel);
  }

  throw new Error("Invalid upstream responses event-stream payload");
}

interface StreamToolCall {
  readonly index: number;
  readonly id: string;
  readonly type: "function";
  readonly function: {
    readonly name: string;
    readonly arguments: string;
  };
}

function completionToStreamDelta(completion: Record<string, unknown>): {
  readonly id: string;
  readonly created: number;
  readonly model: string;
  readonly delta: Record<string, unknown>;
  readonly finishReason: string;
} {
  const id = asString(completion["id"]) ?? `chatcmpl_${Date.now()}`;
  const created = asNumber(completion["created"]) ?? Math.floor(Date.now() / 1000);
  const model = asString(completion["model"]) ?? "unknown";
  const choices = Array.isArray(completion["choices"]) ? completion["choices"] : [];
  const firstChoice = choices.length > 0 && isRecord(choices[0]) ? choices[0] : {};
  const message = isRecord(firstChoice["message"]) ? firstChoice["message"] : {};
  const finishReason = asString(firstChoice["finish_reason"]) ?? "stop";

  const delta: Record<string, unknown> = {
    role: "assistant"
  };

  const reasoning = asString(message["reasoning_content"]) ?? asString(message["reasoning"]);
  if (reasoning && reasoning.length > 0) {
    delta["reasoning_content"] = reasoning;
  }

  const toolCalls = Array.isArray(message["tool_calls"]) ? message["tool_calls"] : [];
  if (toolCalls.length > 0) {
    const mapped = toolCalls
      .map<StreamToolCall | null>((entry, index) => {
        if (!isRecord(entry)) {
          return null;
        }

        const functionData = isRecord(entry["function"]) ? entry["function"] : null;
        const functionName = functionData ? asString(functionData["name"]) : undefined;
        if (!functionName) {
          return null;
        }

        const functionArguments = functionData ? normalizeToolCallArguments(functionData["arguments"]) : "{}";

        return {
          index,
          id: asString(entry["id"]) ?? `call_${index}`,
          type: "function",
          function: {
            name: functionName,
            arguments: functionArguments
          }
        };
      })
      .filter((entry): entry is StreamToolCall => entry !== null);

    delta["tool_calls"] = mapped;
  } else {
    const content = message["content"];
    delta["content"] = typeof content === "string" ? content : "";
  }

  return {
    id,
    created,
    model,
    delta,
    finishReason
  };
}

export function chatCompletionToSse(completion: Record<string, unknown>): string {
  const streamData = completionToStreamDelta(completion);

  const firstChunk = {
    id: streamData.id,
    object: "chat.completion.chunk",
    created: streamData.created,
    model: streamData.model,
    choices: [
      {
        index: 0,
        delta: streamData.delta,
        finish_reason: null
      }
    ]
  };

  const finalChunk = {
    id: streamData.id,
    object: "chat.completion.chunk",
    created: streamData.created,
    model: streamData.model,
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: streamData.finishReason
      }
    ]
  };

  return `data: ${JSON.stringify(firstChunk)}\n\n` +
    `data: ${JSON.stringify(finalChunk)}\n\n` +
    "data: [DONE]\n\n";
}

export function responsesOutputHasReasoning(responseBody: unknown): boolean {
  if (!isRecord(responseBody)) {
    return false;
  }

  const output = responseBody["output"];
  if (!Array.isArray(output)) {
    return false;
  }

  for (const item of output) {
    if (!isRecord(item)) {
      continue;
    }

    if (asString(item["type"]) === "reasoning") {
      return true;
    }
  }

  return false;
}

export function extractTerminalResponseFromEventStream(streamText: string): Record<string, unknown> | undefined {
  const payloads = parseResponsesSsePayloads(streamText);
  let lastTerminalResponse: Record<string, unknown> | undefined;

  for (const payload of payloads) {
    const type = asString(payload["type"]);
    const response = isRecord(payload["response"]) ? payload["response"] : null;
    if ((type === "response.completed" || type === "response.incomplete") && response) {
      lastTerminalResponse = response;
    }
  }

  return lastTerminalResponse;
}

function chunkTextByWords(text: string, wordsPerChunk: number): string[] {
  const tokens = text.split(/(\s+)/);
  const chunks: string[] = [];
  let current = "";
  let wordCount = 0;

  for (const token of tokens) {
    current += token;
    if (token.trim().length > 0) {
      wordCount++;
    }

    if (wordCount >= wordsPerChunk) {
      chunks.push(current);
      current = "";
      wordCount = 0;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

function sleepMs(ms: number): Promise<void> {
  return setTimeout(ms);
}

// Optional streaming throttle for synthetic SSE chunking.
// Operators can tune/disable this under load.
// - STREAM_CHUNK_DELAY_MS=<n> sets a fixed per-chunk delay.
// - STREAM_CHUNK_DELAY_MS_MIN/MAX=<n> sets a random delay range.
// Defaults to 0ms.
const STREAM_CHUNK_DELAY_RANGE_MS = (() => {
  const fixedRaw = process.env.STREAM_CHUNK_DELAY_MS;
  if (fixedRaw !== undefined) {
    const fixed = Number(fixedRaw);
    return Number.isFinite(fixed) && fixed >= 0 ? { min: fixed, max: fixed } : { min: 0, max: 0 };
  }

  const minRaw = process.env.STREAM_CHUNK_DELAY_MS_MIN;
  const maxRaw = process.env.STREAM_CHUNK_DELAY_MS_MAX;

  if (minRaw === undefined && maxRaw === undefined) {
    return { min: 0, max: 0 };
  }

  const min = Number(minRaw ?? "0");
  const max = Number(maxRaw ?? minRaw ?? "0");
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) {
    return { min: 0, max: 0 };
  }

  return { min: Math.min(min, max), max: Math.max(min, max) };
})();

function nextStreamChunkDelayMs(): number {
  const { min, max } = STREAM_CHUNK_DELAY_RANGE_MS;
  if (max <= 0) {
    return 0;
  }
  if (min >= max) {
    return min;
  }
  return min + Math.random() * (max - min);
}

export async function writeInterleavedResponsesSse(
  responseBody: Record<string, unknown>,
  fallbackModel: string,
  writeFn: (data: string) => void,
): Promise<void> {
  const id = asString(responseBody["id"]) ?? `chatcmpl_${Date.now()}`;
  const createdAt = asNumber(responseBody["created_at"]) ?? Math.floor(Date.now() / 1000);
  const model = asString(responseBody["model"]) ?? fallbackModel;
  const output = Array.isArray(responseBody["output"]) ? responseBody["output"] : [];

  let isFirstChunk = true;
  let toolCallIndex = 0;
  let hasToolCalls = false;

  const emitChunk = (delta: Record<string, unknown>, finishReason: string | null): void => {
    const chunk = {
      id,
      object: "chat.completion.chunk",
      created: createdAt,
      model,
      choices: [
        {
          index: 0,
          delta,
          finish_reason: finishReason
        }
      ]
    };
    writeFn(`data: ${JSON.stringify(chunk)}\n\n`);
  };

  const emitTextChunks = async (text: string, fieldName: "content" | "reasoning_content"): Promise<void> => {
    if (text.length === 0) {
      return;
    }

    const wordChunks = chunkTextByWords(text, 4);
    for (const wordChunk of wordChunks) {
      const delta: Record<string, unknown> = { [fieldName]: wordChunk };
      if (isFirstChunk) {
        delta["role"] = "assistant";
        isFirstChunk = false;
      }

      emitChunk(delta, null);
      const delayMs = nextStreamChunkDelayMs();
      if (delayMs > 0) {
        await sleepMs(delayMs);
      }
    }
  };

  for (const item of output) {
    if (!isRecord(item)) {
      continue;
    }

    const itemType = asString(item["type"]);

    if (itemType === "reasoning") {
      const reasoningText = extractReasoningTextFromResponsesItem(item);
      await emitTextChunks(reasoningText, "reasoning_content");
      continue;
    }

    if (itemType === "message") {
      if (asString(item["role"]) !== "assistant") {
        continue;
      }

      const topReasoningParts: string[] = [];
      appendStringPart(topReasoningParts, item["reasoning_content"]);
      appendStringPart(topReasoningParts, item["reasoning"]);
      if (topReasoningParts.length > 0) {
        await emitTextChunks(topReasoningParts.join(""), "reasoning_content");
      }

      const content = item["content"];
      if (!Array.isArray(content)) {
        continue;
      }

      for (const part of content) {
        if (!isRecord(part)) {
          continue;
        }

        const partType = asString(part["type"]);

        if (partType === "output_text") {
          const text = asString(part["text"]);
          if (text) {
            await emitTextChunks(text, "content");
          }
          continue;
        }

        if (partType === "reasoning" || partType === "thinking" || partType === "summary_text") {
          const reasonParts: string[] = [];
          appendStringPart(reasonParts, part["text"]);
          appendStringPart(reasonParts, part["reasoning"]);
          if (reasonParts.length > 0) {
            await emitTextChunks(reasonParts.join(""), "reasoning_content");
          }
        }
      }

      continue;
    }

    if (itemType === "function_call") {
      const functionName = asString(item["name"]);
      if (!functionName) {
        continue;
      }

      const callId = asString(item["call_id"]) ?? `call_${toolCallIndex}`;
      const argumentsText = normalizeToolCallArguments(item["arguments"]);

      const delta: Record<string, unknown> = {
        tool_calls: [
          {
            index: toolCallIndex,
            id: callId,
            type: "function",
            function: {
              name: functionName,
              arguments: argumentsText
            }
          }
        ]
      };

      if (isFirstChunk) {
        delta["role"] = "assistant";
        isFirstChunk = false;
      }

      hasToolCalls = true;
      emitChunk(delta, null);
      toolCallIndex++;
      const delayMs = nextStreamChunkDelayMs();
      if (delayMs > 0) {
        await sleepMs(delayMs);
      }
      continue;
    }
  }

  if (isFirstChunk) {
    emitChunk({ role: "assistant", content: "" }, null);
  }

  emitChunk({}, hasToolCalls ? "tool_calls" : "stop");
  writeFn("data: [DONE]\n\n");
}

// ─── True Streaming: Responses SSE → Chat Completion Chunks ─────────────────

export interface ResponsesStreamTranslatorOptions {
  readonly fallbackModel: string;
  readonly writeFn: (data: string) => void;
}

/**
 * Incrementally translate a Responses API SSE stream into chat completion chunks.
 *
 * Unlike `responsesEventStreamToChatCompletion` which buffers the entire stream,
 * this reads the upstream ReadableStream and emits chat.completion.chunk SSE events
 * as text/reasoning/tool-call deltas arrive.
 *
 * Returns the terminal response object (if present) for usage extraction, or null.
 */
export async function streamResponsesSseToChatCompletionChunks(
  body: ReadableStream<Uint8Array>,
  options: ResponsesStreamTranslatorOptions,
): Promise<{ terminalResponse: Record<string, unknown> | null; sawError: Record<string, unknown> | null }> {
  const { fallbackModel, writeFn } = options;
  const decoder = new TextDecoder();

  let responseId = `chatcmpl_${Date.now()}`;
  let createdAt = Math.floor(Date.now() / 1000);
  let model = fallbackModel;
  let isFirstChunk = true;
  let hasToolCalls = false;
  let terminalResponse: Record<string, unknown> | null = null;
  let sawError: Record<string, unknown> | null = null;
  let buffer = "";
  let functionCallState: Map<number, { name: string; callId: string }> = new Map();
  let toolCallIndex = 0;

  function emitChunk(delta: Record<string, unknown>, finishReason: string | null): void {
    const chunk = {
      id: responseId,
      object: "chat.completion.chunk",
      created: createdAt,
      model,
      choices: [{ index: 0, delta, finish_reason: finishReason }],
    };
    writeFn(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  function processEvent(payload: Record<string, unknown>): void {
    const type = typeof payload["type"] === "string" ? payload["type"] : undefined;
    if (!type) {
      return;
    }

    // Extract response metadata from the first response event
    if (type === "response.created" || type === "response.in_progress") {
      const response = isRecord(payload["response"]) ? payload["response"] : null;
      if (response) {
        const rid = typeof response["id"] === "string" ? response["id"] : undefined;
        if (rid) {
          responseId = rid;
        }
        const rmodel = typeof response["model"] === "string" ? response["model"] : undefined;
        if (rmodel) {
          model = rmodel;
        }
        const rCreated = typeof response["created_at"] === "number" ? response["created_at"] : undefined;
        if (rCreated) {
          createdAt = rCreated;
        }
      }
      return;
    }

    // Error events
    if (type === "error") {
      sawError = isRecord(payload["error"]) ? payload["error"] : payload;
      return;
    }
    if (type === "response.failed") {
      const response = isRecord(payload["response"]) ? payload["response"] : null;
      if (response && isRecord(response["error"])) {
        sawError = response["error"];
      }
      return;
    }

    // Text content deltas
    if (type === "response.output_text.delta") {
      const delta = typeof payload["delta"] === "string" ? payload["delta"] : undefined;
      if (delta) {
        const d: Record<string, unknown> = { content: delta };
        if (isFirstChunk) {
          d["role"] = "assistant";
          isFirstChunk = false;
        }
        emitChunk(d, null);
      }
      return;
    }

    // Reasoning/summary text deltas
    if (type === "response.reasoning_summary_text.delta"
      || type === "response.reasoning.delta"
      || type === "response.reasoning_summary_part.delta") {
      const delta = typeof payload["delta"] === "string" ? payload["delta"] : undefined;
      if (delta) {
        const d: Record<string, unknown> = { reasoning_content: delta };
        if (isFirstChunk) {
          d["role"] = "assistant";
          isFirstChunk = false;
        }
        emitChunk(d, null);
      }
      return;
    }

    // Pre-register function_call items from output_item.added so that
    // subsequent argument deltas (which only carry item_id) can find the slot.
    if (type === "response.output_item.added") {
      const item = isRecord(payload["item"]) ? payload["item"] : null;
      if (item && item["type"] === "function_call") {
        const callId = typeof item["call_id"] === "string" ? item["call_id"] : undefined;
        const itemIdVal = typeof item["id"] === "string" ? item["id"] : undefined;
        const name = typeof item["name"] === "string" ? item["name"] : undefined;
        if (callId) {
          const slotIdx = toolCallIndex;
          functionCallState.set(slotIdx, { name: name ?? "", callId });
          // Also register by item id so delta lookups by item_id succeed
          if (itemIdVal) {
            functionCallState.set(slotIdx, { name: name ?? "", callId, itemId: itemIdVal } as any);
          }
          toolCallIndex++;
          hasToolCalls = true;

          const d: Record<string, unknown> = {
            tool_calls: [{
              index: slotIdx,
              id: callId,
              type: "function",
              function: { name: name ?? "", arguments: "" },
            }],
          };
          if (isFirstChunk) {
            d["role"] = "assistant";
            isFirstChunk = false;
          }
          emitChunk(d, null);
        }
      }
      return;
    }

    // Function call argument deltas
    if (type === "response.function_call_arguments.delta") {
      const delta = typeof payload["delta"] === "string" ? payload["delta"] : undefined;
      const callId = typeof payload["call_id"] === "string" ? payload["call_id"] : undefined;
      const itemId = typeof payload["item_id"] === "string" ? payload["item_id"] : undefined;

      // Find existing tool call slot by call_id or item_id
      let slotIdx = -1;
      for (const [idx, fc] of functionCallState.entries()) {
        if ((callId && fc.callId === callId) || (itemId && ((fc as any).itemId === itemId || fc.callId === itemId))) {
          slotIdx = idx;
          break;
        }
      }

      // Fallback: create slot from delta if no output_item.added was received
      if (slotIdx < 0 && callId) {
        const name = typeof payload["name"] === "string" ? payload["name"] : undefined;
        slotIdx = toolCallIndex;
        functionCallState.set(slotIdx, { name: name ?? "", callId });
        toolCallIndex++;
        hasToolCalls = true;

        const d: Record<string, unknown> = {
          tool_calls: [{
            index: slotIdx,
            id: callId,
            type: "function",
            function: { name: name ?? "", arguments: delta ?? "" },
          }],
        };
        if (isFirstChunk) {
          d["role"] = "assistant";
          isFirstChunk = false;
        }
        emitChunk(d, null);
        return;
      }

      if (delta && slotIdx >= 0) {
        emitChunk({
          tool_calls: [{
            index: slotIdx,
            function: { arguments: delta },
          }],
        }, null);
      }
      return;
    }

    // Terminal events — capture for usage
    if (type === "response.completed" || type === "response.incomplete") {
      const response = isRecord(payload["response"]) ? payload["response"] : null;
      if (response) {
        terminalResponse = response;
        const rmodel = typeof response["model"] === "string" ? response["model"] : undefined;
        if (rmodel) {
          model = rmodel;
        }
      }
      return;
    }
  }

  const SSE_BLOCK_SEP = /\r?\n\r?\n/;

  function drainBuffer(): void {
    let match: RegExpMatchArray | null;
    while ((match = SSE_BLOCK_SEP.exec(buffer)) !== null) {
      const sepIdx = match.index ?? 0;
      const block = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + match[0].length);

      const dataLines = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());

      if (dataLines.length === 0) {
        continue;
      }

      const data = dataLines.join("\n").trim();
      if (data.length === 0 || data === "[DONE]") {
        continue;
      }

      try {
        const parsed: unknown = JSON.parse(data);
        if (isRecord(parsed)) {
          processEvent(parsed);
        }
      } catch {
        // Skip malformed events
      }
    }
  }

  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      drainBuffer();
    }
  } finally {
    reader.releaseLock();
  }

  // Flush remaining buffer
  if (buffer.trim().length > 0) {
    const dataLines = buffer
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());
    const data = dataLines.join("\n").trim();
    if (data.length > 0 && data !== "[DONE]") {
      try {
        const parsed: unknown = JSON.parse(data);
        if (isRecord(parsed)) {
          processEvent(parsed);
        }
      } catch {
        // Skip
      }
    }
  }

  // Emit role chunk if nothing was emitted
  if (isFirstChunk) {
    emitChunk({ role: "assistant", content: "" }, null);
  }

  // Build usage chunk from terminal response
  if (terminalResponse) {
    const usage = isRecord(terminalResponse["usage"]) ? terminalResponse["usage"] : null;
    if (usage) {
      const promptTokens = typeof usage["input_tokens"] === "number" ? usage["input_tokens"] : undefined;
      const completionTokens = typeof usage["output_tokens"] === "number" ? usage["output_tokens"] : undefined;
      const totalTokens = typeof usage["total_tokens"] === "number" ? usage["total_tokens"] : undefined;
      if (promptTokens !== undefined && completionTokens !== undefined && totalTokens !== undefined) {
        const usageChunk = {
          id: responseId,
          object: "chat.completion.chunk",
          created: createdAt,
          model,
          choices: [{ index: 0, delta: {}, finish_reason: hasToolCalls ? "tool_calls" : "stop" }],
          usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
          },
        };
        writeFn(`data: ${JSON.stringify(usageChunk)}\n\n`);
        writeFn("data: [DONE]\n\n");
        return { terminalResponse, sawError };
      }
    }
  }

  // Final stop chunk
  emitChunk({}, hasToolCalls ? "tool_calls" : "stop");
  writeFn("data: [DONE]\n\n");
  return { terminalResponse, sawError };
}
