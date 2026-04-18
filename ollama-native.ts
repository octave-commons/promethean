import { randomUUID } from "node:crypto";

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

function normalizePositiveNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
  }

  return undefined;
}

function mapRole(value: unknown): "system" | "user" | "assistant" | "tool" {
  const role = asString(value);
  if (role === "system" || role === "assistant" || role === "tool") {
    return role;
  }

  return "user";
}

function normalizeMessages(messages: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => ({
      role: mapRole(entry["role"]),
      content: entry["content"],
      images: Array.isArray(entry["images"]) ? entry["images"] : undefined,
      tool_calls: Array.isArray(entry["tool_calls"]) ? entry["tool_calls"] : undefined,
      tool_call_id: asString(entry["tool_call_id"]),
      name: asString(entry["name"]),
    }))
    .map((entry) => Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined)));
}

function buildOptions(body: Record<string, unknown>): Record<string, unknown> | undefined {
  const existing = isRecord(body["options"]) ? { ...body["options"] } : {};

  const temperature = asNumber(body["temperature"]);
  if (temperature !== undefined && existing["temperature"] === undefined) {
    existing["temperature"] = temperature;
  }

  const numPredict = normalizePositiveNumber(body["max_tokens"])
    ?? normalizePositiveNumber(body["max_completion_tokens"])
    ?? normalizePositiveNumber(body["num_predict"]);
  if (numPredict !== undefined && existing["num_predict"] === undefined) {
    existing["num_predict"] = numPredict;
  }

  const numCtx = normalizePositiveNumber(body["num_ctx"])
    ?? normalizePositiveNumber(body["ollama_num_ctx"]);
  if (numCtx !== undefined && existing["num_ctx"] === undefined) {
    existing["num_ctx"] = numCtx;
  }

  return Object.keys(existing).length > 0 ? existing : undefined;
}

export function nativeChatToOpenAiRequest(body: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    model: asString(body["model"]),
    messages: normalizeMessages(body["messages"]),
    stream: body["stream"] === true,
  };

  const reasoningEffort = asString(body["reasoning_effort"]);
  if (reasoningEffort) {
    payload["reasoning_effort"] = reasoningEffort;
  }

  const reasoning = isRecord(body["reasoning"]) ? body["reasoning"] : null;
  if (reasoning) {
    payload["reasoning"] = reasoning;
  }

  if (Array.isArray(body["tools"])) {
    payload["tools"] = body["tools"];
  }

  const options = buildOptions(body);
  const think = asBoolean(body["think"]);
  if (options || think !== undefined) {
    payload["open_hax"] = {
      ollama: {
        ...(options ?? {}),
        ...(think !== undefined ? { think } : {}),
      },
    };
  }

  return payload;
}

export function nativeGenerateToChatRequest(body: Record<string, unknown>): Record<string, unknown> {
  const prompt = asString(body["prompt"]) ?? "";
  const system = asString(body["system"]);
  const messages: Array<Record<string, unknown>> = [];

  if (system && system.length > 0) {
    messages.push({ role: "system", content: system });
  }
  messages.push({ role: "user", content: prompt });

  return nativeChatToOpenAiRequest({
    ...body,
    messages,
    stream: false,
  });
}

export function chatCompletionToNativeChat(response: Record<string, unknown>): Record<string, unknown> {
  const choices = Array.isArray(response["choices"]) ? response["choices"] : [];
  const firstChoice = choices.find((entry): entry is Record<string, unknown> => isRecord(entry));
  const message = firstChoice && isRecord(firstChoice["message"]) ? firstChoice["message"] : {};
  const usage = isRecord(response["usage"]) ? response["usage"] : {};

  return {
    model: asString(response["model"]) ?? "",
    created_at: new Date().toISOString(),
    message: {
      role: asString(message["role"]) ?? "assistant",
      content: asString(message["content"]) ?? "",
      thinking: asString(message["reasoning_content"]) ?? asString(message["reasoning"]),
      tool_calls: Array.isArray(message["tool_calls"]) ? message["tool_calls"] : undefined,
    },
    done: true,
    done_reason: asString(firstChoice?.["finish_reason"]) ?? "stop",
    prompt_eval_count: asNumber(usage["prompt_tokens"]) ?? 0,
    eval_count: asNumber(usage["completion_tokens"]) ?? 0,
  };
}

export function chatCompletionToNativeGenerate(response: Record<string, unknown>): Record<string, unknown> {
  const choices = Array.isArray(response["choices"]) ? response["choices"] : [];
  const firstChoice = choices.find((entry): entry is Record<string, unknown> => isRecord(entry));
  const message = firstChoice && isRecord(firstChoice["message"]) ? firstChoice["message"] : {};
  const usage = isRecord(response["usage"]) ? response["usage"] : {};

  return {
    model: asString(response["model"]) ?? "",
    created_at: new Date().toISOString(),
    response: asString(message["content"]) ?? "",
    thinking: asString(message["reasoning_content"]) ?? asString(message["reasoning"]),
    done: true,
    done_reason: asString(firstChoice?.["finish_reason"]) ?? "stop",
    context: [],
    prompt_eval_count: asNumber(usage["prompt_tokens"]) ?? 0,
    eval_count: asNumber(usage["completion_tokens"]) ?? 0,
  };
}

export function nativeEmbedToOpenAiRequest(body: Record<string, unknown>): {
  readonly model: string;
  readonly input: string | readonly string[];
} {
  const model = asString(body["model"] ) ?? "";
  const input = body["input"] ?? body["prompt"];

  if (Array.isArray(input)) {
    return { model, input: input.filter((entry): entry is string => typeof entry === "string") };
  }

  return {
    model,
    input: typeof input === "string" ? input : "",
  };
}

function vectorizeEmbeddingData(data: unknown): number[][] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((entry) => {
      if (!isRecord(entry) || !Array.isArray(entry["embedding"])) {
        return null;
      }

      const vector = entry["embedding"].filter((value): value is number => typeof value === "number");
      return vector.length > 0 ? vector : null;
    })
    .filter((entry): entry is number[] => entry !== null);
}

export function openAiEmbeddingsToNativeEmbed(response: Record<string, unknown>): Record<string, unknown> {
  const embeddings = vectorizeEmbeddingData(response["data"]);
  return {
    model: asString(response["model"]) ?? "",
    embeddings,
    total_duration: 0,
    load_duration: 0,
    prompt_eval_count: embeddings.length,
  };
}

export function openAiEmbeddingsToNativeEmbeddings(response: Record<string, unknown>): Record<string, unknown> {
  const embeddings = vectorizeEmbeddingData(response["data"]);
  return {
    embedding: embeddings[0] ?? [],
  };
}

export function nativeEmbedResponseToOpenAiEmbeddings(
  response: Record<string, unknown>,
  model: string,
): Record<string, unknown> {
  const rawEmbeddings = Array.isArray(response["embeddings"])
    ? response["embeddings"]
    : Array.isArray(response["embedding"])
      ? [response["embedding"]]
      : [];

  const embeddings = rawEmbeddings
    .map((entry) => Array.isArray(entry) ? entry.filter((value): value is number => typeof value === "number") : null)
    .filter((entry): entry is number[] => entry !== null);

  return {
    object: "list",
    data: embeddings.map((embedding, index) => ({
      object: "embedding",
      index,
      embedding,
    })),
    model,
    usage: {
      prompt_tokens: 0,
      total_tokens: 0,
    },
  };
}

export function modelIdsToNativeTags(modelIds: readonly string[]): Record<string, unknown> {
  return {
    models: modelIds.map((modelId) => ({
      name: modelId,
      model: modelId,
      modified_at: new Date().toISOString(),
      size: 0,
      digest: randomUUID().replace(/-/g, ""),
      details: {},
    })),
  };
}
