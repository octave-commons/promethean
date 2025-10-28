import { type ModelRequest } from "@openai/agents";
import { Usage, type AgentInputItem, type AssistantMessageItem, type SystemMessageItem, type UserMessageItem } from "@openai/agents";
import { Message, type ChatRequest, type ChatResponse, type Tool as OllamaTool } from "ollama";

export const isMessageItem = (
  item: AgentInputItem,
): item is AssistantMessageItem | SystemMessageItem | UserMessageItem =>
  typeof (item as { role?: unknown }).role === "string";

export const flattenEntries = (entries: ReadonlyArray<unknown>): string =>
  entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return typeof entry === "string" ? entry : "";
      }
      if (
        "text" in (entry as Record<string, unknown>) &&
        typeof (entry as { text?: unknown }).text === "string"
      ) {
        return (entry as { text: string }).text;
      }
      if (
        "refusal" in (entry as Record<string, unknown>) &&
        typeof (entry as { refusal?: unknown }).refusal === "string"
      ) {
        return (entry as { refusal: string }).refusal;
      }
      return JSON.stringify(entry);
    })
    .filter((segment) => segment.length > 0)
    .join("\n");

export const toMessageContent = (
  item: AssistantMessageItem | SystemMessageItem | UserMessageItem,
): string => {
  const { content } = item as { content: unknown };
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return flattenEntries(content);
  }
  return "";
};

export const convertInputToMessages = (request: ModelRequest): Message[] => {
  const messages: Message[] = [];
  if (request.systemInstructions) {
    messages.push({ role: "system", content: request.systemInstructions });
  }
  if (typeof request.input === "string") {
    messages.push({ role: "user", content: request.input });
    return messages;
  }
  for (const item of request.input) {
    if (!isMessageItem(item)) {
      throw new Error(
        `Ollama provider only supports message conversation items. Unsupported item: ${JSON.stringify(
          item,
        )}`,
      );
    }
    messages.push({ role: item.role, content: toMessageContent(item) });
  }
  return messages;
};

export const normalizeJsonSchema = (
  schema: unknown,
): Record<string, unknown> | undefined => {
  if (!schema) {
    return undefined;
  }
  const plain = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;
  const required = plain.required;
  if (Array.isArray(required)) {
    plain.required = required.map((value) => value.toString());
  }
  return plain;
};

export const convertTools = (
  tools: ModelRequest["tools"],
): OllamaTool[] | undefined =>
  tools && tools.length > 0
    ? tools
        .filter((tool) => tool.type === "function")
        .map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: normalizeJsonSchema(tool.parameters),
          },
        }))
    : undefined;

export const convertSettings = (
  settings: ModelRequest["modelSettings"],
): ChatRequest["options"] | undefined => {
  if (!settings) {
    return undefined;
  }
  const { temperature, topP, frequencyPenalty, presencePenalty, maxTokens } = settings;
  const options: ChatRequest["options"] = {};
  if (typeof temperature === "number") options.temperature = temperature;
  if (typeof topP === "number") options.top_p = topP;
  if (typeof frequencyPenalty === "number") options.repeat_penalty = frequencyPenalty;
  if (typeof presencePenalty === "number") options.presence_penalty = presencePenalty;
  if (typeof maxTokens === "number") options.num_predict = maxTokens;
  return Object.keys(options).length > 0 ? (options as ChatRequest["options"]) : undefined;
};

export const toUsage = (response: ChatResponse | undefined): Usage => {
  const inputTokens = response?.prompt_eval_count ?? 0;
  const outputTokens = response?.eval_count ?? 0;
  return new Usage({
    requests: 1,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
  });
};

export const toUsageComponents = (
  response: ChatResponse | undefined,
): {
  usage: Usage;
  payload: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    requests?: number;
    inputTokensDetails?: Record<string, number>;
    outputTokensDetails?: Record<string, number>;
  };
} => {
  const usage = toUsage(response);
  const payload: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    requests?: number;
    inputTokensDetails?: Record<string, number>;
    outputTokensDetails?: Record<string, number>;
  } = {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  };
  if (usage.requests) {
    payload.requests = usage.requests;
  }
  if (usage.inputTokensDetails[0]) {
    payload.inputTokensDetails = usage.inputTokensDetails[0];
  }
  if (usage.outputTokensDetails[0]) {
    payload.outputTokensDetails = usage.outputTokensDetails[0];
  }
  return { usage, payload };
};