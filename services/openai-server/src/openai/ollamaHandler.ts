import { URL } from "node:url";

import type {
  ChatCompletionHandler,
  ChatCompletionJob,
  ChatCompletionMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "./types.js";

type OllamaMessage = {
  readonly role?: string;
  readonly content?: string;
};

type OllamaChatResponse = {
  readonly model?: string;
  readonly created_at?: string;
  readonly message?: OllamaMessage;
  readonly done_reason?: string;
  readonly prompt_eval_count?: number;
  readonly eval_count?: number;
};

type OllamaHandlerOptions = Readonly<{
  readonly baseUrl?: string;
  readonly fetch?: typeof fetch;
}>;

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";

const normaliseFinishReason = (doneReason?: string): "stop" | "length" =>
  doneReason === "length" ? "length" : "stop";

const safeNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const parseCreatedAt = (
  createdAt: string | undefined,
  fallback: number,
): number => {
  if (!createdAt) {
    return fallback;
  }

  const timestamp = Date.parse(createdAt);
  if (Number.isFinite(timestamp)) {
    return Math.floor(timestamp / 1000);
  }
  return fallback;
};

const resolveCreatedTimestamp = (
  job: Readonly<ChatCompletionJob>,
  response: Readonly<OllamaChatResponse>,
): number =>
  parseCreatedAt(
    response.created_at,
    Math.floor(job.metadata.enqueuedAt / 1000),
  );

const mapMessage = (
  message: Readonly<ChatCompletionMessage>,
): OllamaMessage => ({
  role: message.role,
  content: message.content,
});

type OllamaOptions = Readonly<Record<string, number>>;

const buildOptions = (
  request: Readonly<ChatCompletionRequest>,
): OllamaOptions | undefined => {
  const candidates: ReadonlyArray<readonly [string, number | undefined]> = [
    ["temperature", request.temperature],
    ["top_p", request.top_p],
    ["num_predict", request.max_tokens],
  ];

  const defined = candidates.filter(([, value]) => typeof value === "number");
  if (defined.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    defined as ReadonlyArray<readonly [string, number]>,
  ) as OllamaOptions;
};

type OllamaChatPayload = Readonly<{
  readonly model: string;
  readonly messages: ReadonlyArray<OllamaMessage>;
  readonly stream: false;
  readonly options?: OllamaOptions;
}>;

const buildPayload = (
  request: Readonly<ChatCompletionRequest>,
): OllamaChatPayload => {
  const basePayload: OllamaChatPayload = {
    model: request.model,
    messages: request.messages.map(mapMessage),
    stream: false,
  };

  const options = buildOptions(request);
  return options ? { ...basePayload, options } : basePayload;
};

type ChatUsage = Readonly<{
  readonly prompt_tokens: number;
  readonly completion_tokens: number;
  readonly total_tokens: number;
}>;

const mapUsage = (response: Readonly<OllamaChatResponse>): ChatUsage => {
  const promptTokens = safeNumber(response.prompt_eval_count) ?? 0;
  const completionTokens = safeNumber(response.eval_count) ?? 0;
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  };
};

const toChatCompletionResponse = (
  job: Readonly<ChatCompletionJob>,
  response: Readonly<OllamaChatResponse>,
): ChatCompletionResponse => {
  const assistantContent = response.message?.content ?? "";
  return {
    id: job.metadata.id,
    object: "chat.completion",
    created: resolveCreatedTimestamp(job, response),
    model: response.model ?? job.request.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: assistantContent,
        },
        finish_reason: normaliseFinishReason(response.done_reason),
      },
    ],
    usage: mapUsage(response),
  };
};

type JsonResponse = Readonly<{
  readonly ok: boolean;
  readonly status: number;
  readonly text: () => Promise<string>;
  readonly json: Response["json"];
}>;

const ensureOkResponse = async <TResponse extends JsonResponse>(
  response: TResponse,
): Promise<TResponse> => {
  if (response.ok) {
    return response;
  }
  const detail = await response.text().catch(() => "");
  const trimmedDetail = detail.trim();
  const suffix = trimmedDetail.length > 0 ? `: ${trimmedDetail}` : "";
  throw new Error(
    `Ollama chat request failed with status ${response.status}${suffix}`,
  );
};

export const createOllamaChatCompletionHandler = (
  options: OllamaHandlerOptions = {},
): ChatCompletionHandler => {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchFn = options.fetch ?? fetch;
  const endpoint = new URL("/api/chat", baseUrl).toString();

  return async (job: Readonly<ChatCompletionJob>) => {
    const payload = buildPayload(job.request);
    const response = await fetchFn(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const checked = await ensureOkResponse(response);
    const ollamaResponse = (await checked.json()) as OllamaChatResponse;
    return toChatCompletionResponse(job, ollamaResponse);
  };
};
