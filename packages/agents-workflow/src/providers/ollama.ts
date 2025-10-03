import { randomUUID } from "node:crypto";

import {
  Usage,
  assistant,
  type AgentInputItem,
  type AssistantMessageItem,
  type Model,
  type ModelProvider,
  type ModelRequest,
  type ModelResponse,
  type StreamEvent,
  type SystemMessageItem,
  type UserMessageItem,
} from "@openai/agents";
import {
  Ollama as OllamaClient,
  type ChatRequest,
  type ChatResponse,
  type Message,
  type Tool as OllamaTool,
} from "ollama";

interface OllamaClientLike {
  chat(
    request: ChatRequest & { stream: true },
  ): Promise<AsyncIterable<ChatResponse>>;
  chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse>;
}

export interface OllamaModelProviderOptions {
  host?: string;
  defaultModel?: string;
  client?: OllamaClientLike;
  requestOptions?: Partial<Omit<ChatRequest, "model" | "messages" | "stream">>;
}

function isMessageItem(
  item: AgentInputItem,
): item is AssistantMessageItem | SystemMessageItem | UserMessageItem {
  return typeof (item as { role?: unknown }).role === "string";
}

function flattenEntries(entries: ReadonlyArray<unknown>): string {
  return entries
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
}

function toMessageContent(
  item: AssistantMessageItem | SystemMessageItem | UserMessageItem,
): string {
  const { content } = item as { content: unknown };
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return flattenEntries(content);
  }
  return "";
}

function convertInputToMessages(request: ModelRequest): Message[] {
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
}

function normalizeJsonSchema(
  schema: unknown,
): Record<string, unknown> | undefined {
  if (!schema) {
    return undefined;
  }
  const plain = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;
  const required = plain.required;
  if (Array.isArray(required)) {
    plain.required = required.map((value) => value.toString());
  }
  return plain;
}

function convertTools(tools: ModelRequest["tools"]): OllamaTool[] | undefined {
  if (!tools || tools.length === 0) {
    return undefined;
  }
  const result: OllamaTool[] = [];
  for (const tool of tools) {
    if (tool.type !== "function") {
      continue;
    }
    result.push({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: normalizeJsonSchema(tool.parameters),
      },
    });
  }
  return result.length > 0 ? result : undefined;
}

function convertSettings(
  settings: ModelRequest["modelSettings"],
): ChatRequest["options"] | undefined {
  if (!settings) {
    return undefined;
  }
  const options: Record<string, unknown> = {};
  if (typeof settings.temperature === "number") {
    options.temperature = settings.temperature;
  }
  if (typeof settings.topP === "number") {
    options.top_p = settings.topP;
  }
  if (typeof settings.frequencyPenalty === "number") {
    options.repeat_penalty = settings.frequencyPenalty;
  }
  if (typeof settings.presencePenalty === "number") {
    options.presence_penalty = settings.presencePenalty;
  }
  if (typeof settings.maxTokens === "number") {
    options.num_predict = settings.maxTokens;
  }
  return Object.keys(options).length > 0
    ? (options as ChatRequest["options"])
    : undefined;
}

function toUsage(response: ChatResponse | undefined): Usage {
  const inputTokens = response?.prompt_eval_count ?? 0;
  const outputTokens = response?.eval_count ?? 0;
  return new Usage({
    requests: 1,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
  });
}

function toUsageComponents(response: ChatResponse | undefined): {
  usage: Usage;
  payload: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    requests?: number;
    inputTokensDetails?: Record<string, number>;
    outputTokensDetails?: Record<string, number>;
  };
} {
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
}

class OllamaModel implements Model {
  constructor(
    private readonly client: OllamaClientLike,
    private readonly modelName: string,
    private readonly defaults?: Partial<
      Omit<ChatRequest, "model" | "messages" | "stream">
    >,
  ) {}

  private buildRequest(request: ModelRequest, stream: boolean): ChatRequest {
    const base: ChatRequest = {
      model: this.modelName,
      messages: convertInputToMessages(request),
      stream,
    };
    if (this.defaults) {
      for (const [key, value] of Object.entries(this.defaults)) {
        if (value === undefined) {
          continue;
        }
        if (key === "model" || key === "messages" || key === "stream") {
          continue;
        }
        (base as unknown as Record<string, unknown>)[key] = value;
      }
    }
    const format =
      request.outputType && request.outputType !== "text"
        ? request.outputType
        : undefined;
    if (format) {
      (base as unknown as Record<string, unknown>).format = format;
    }
    const tools = convertTools(request.tools);
    if (tools) {
      base.tools = tools;
    }
    const options = convertSettings(request.modelSettings);
    if (options) {
      base.options = { ...(base.options ?? {}), ...options };
    }
    return base;
  }

  private toResponse(response: ChatResponse): ModelResponse {
    const { usage } = toUsageComponents(response);
    const text = response.message?.content ?? "";
    return {
      usage,
      output: [assistant(text)],
      responseId: `ollama-${randomUUID()}`,
      providerData: { raw: response },
    };
  }

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const chatRequest = this.buildRequest(request, false) as ChatRequest & {
      stream?: false;
    };
    const response = await this.client.chat(chatRequest);
    return this.toResponse(response);
  }

  async *getStreamedResponse(
    request: ModelRequest,
  ): AsyncIterable<StreamEvent> {
    const chatRequest = this.buildRequest(request, true) as ChatRequest & {
      stream: true;
    };
    const stream = await this.client.chat(chatRequest);
    let aggregated = "";
    let finalChunk: ChatResponse | undefined;
    yield { type: "response_started" } satisfies StreamEvent;
    for await (const chunk of stream) {
      finalChunk = chunk;
      const delta = chunk.message?.content ?? "";
      if (delta) {
        aggregated += delta;
        yield { type: "output_text_delta", delta } satisfies StreamEvent;
      }
    }
    const finalResponse =
      finalChunk ??
      ({
        model: this.modelName,
        created_at: new Date(),
        message: { role: "assistant", content: aggregated },
        done: true,
        done_reason: "stop",
        total_duration: 0,
        load_duration: 0,
        prompt_eval_count: 0,
        prompt_eval_duration: 0,
        eval_count: 0,
        eval_duration: 0,
      } satisfies ChatResponse);
    const { payload } = toUsageComponents(finalChunk);
    const responseId = `ollama-${randomUUID()}`;
    yield {
      type: "response_done",
      response: {
        id: responseId,
        usage: payload,
        output: [assistant(aggregated)],
        providerData: { raw: finalResponse },
      },
    } satisfies StreamEvent;
  }
}

export class OllamaModelProvider implements ModelProvider {
  private readonly client: OllamaClientLike;
  private readonly defaultModel: string;
  private readonly requestDefaults?: Partial<
    Omit<ChatRequest, "model" | "messages" | "stream">
  >;

  constructor(options: OllamaModelProviderOptions = {}) {
    this.defaultModel = options.defaultModel ?? "llama3.1";
    this.requestDefaults = options.requestOptions;
    this.client =
      options.client ??
      new OllamaClient(
        options.host
          ? {
              host: options.host,
            }
          : undefined,
      );
  }

  async getModel(modelName?: string): Promise<Model> {
    const target = modelName ?? this.defaultModel;
    return new OllamaModel(this.client, target, this.requestDefaults);
  }
}

export function createOllamaModelProvider(
  options: OllamaModelProviderOptions = {},
): OllamaModelProvider {
  return new OllamaModelProvider(options);
}
