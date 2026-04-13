import type { FastifyReply } from "fastify";

import { openAiError } from "./proxy.js";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function appendCsvHeaderValue(headers: Headers, name: string, value: string): void {
  const existing = headers.get(name);
  if (!existing) {
    headers.set(name, value);
    return;
  }

  const existingTokens = existing
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (existingTokens.includes(value)) {
    return;
  }

  headers.set(name, `${existing}, ${value}`);
}

export function shouldEnableInterleavedThinkingHeader(upstreamPayload: Record<string, unknown>): boolean {
  const thinking = isRecord(upstreamPayload["thinking"]) ? upstreamPayload["thinking"] : null;
  if (!thinking) {
    return false;
  }

  return asString(thinking["type"]) === "enabled";
}

function reasoningEffortIsDisabled(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "none" || normalized === "disable" || normalized === "disabled" || normalized === "off";
}

function includesReasoningTrace(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.some((entry) => asString(entry) === "reasoning.encrypted_content");
}

export function requestWantsReasoningTrace(body: Record<string, unknown>): boolean {
  if (includesReasoningTrace(body["include"])) {
    return true;
  }

  const explicitThinking = isRecord(body["thinking"]) ? body["thinking"] : null;
  if (explicitThinking) {
    const type = asString(explicitThinking["type"]);
    if (type === "enabled") {
      return true;
    }

    if (type === "disabled") {
      return false;
    }
  }

  const reasoning = isRecord(body["reasoning"]) ? body["reasoning"] : null;
  const reasoningEffort = asString(reasoning?.["effort"])
    ?? asString(body["reasoning_effort"])
    ?? asString(body["reasoningEffort"]);

  if (reasoningEffort) {
    return !reasoningEffortIsDisabled(reasoningEffort);
  }

  return reasoning !== null;
}

function extractSseDataLines(payload: string): string[] {
  return payload
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter((line) => line.length > 0);
}

export function stripSseCommentLines(payload: string): string {
  return payload
    .split(/\r?\n/)
    .filter((line) => !line.startsWith(":"))
    .join("\n");
}

export function streamPayloadHasReasoningTrace(payload: string): boolean {
  for (const data of extractSseDataLines(payload)) {
    if (data === "[DONE]") {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(data);
      if (isRecord(parsed) && chatCompletionHasReasoningContent(parsed)) {
        return true;
      }
    } catch {
      // ignore malformed stream fragments during validation
    }
  }
  return false;
}

export function streamPayloadHasSubstantiveChunks(payload: string): boolean {
  for (const data of extractSseDataLines(payload)) {
    if (data !== "[DONE]") {
      return true;
    }
  }
  return false;
}

export function streamPayloadIndicatesQuotaError(payload: string): boolean {
  for (const data of extractSseDataLines(payload)) {
    if (data === "[DONE]") {
      continue;
    }

    try {
      const parsed: unknown = JSON.parse(data);
      if (!payloadLooksLikeError(parsed)) {
        continue;
      }

      const message = extractErrorMessage(parsed);
      if (message && messageIndicatesQuotaError(message)) {
        return true;
      }

      if (messageIndicatesQuotaError(data)) {
        return true;
      }
    } catch {
      if (messageIndicatesQuotaError(data)) {
        return true;
      }
    }
  }

  return false;
}

export function chatCompletionHasReasoningContent(completion: Record<string, unknown>): boolean {
  const topLevelReasoning = asString(completion["reasoning_content"]) ?? asString(completion["reasoning"]);
  if (topLevelReasoning && topLevelReasoning.length > 0) {
    return true;
  }

  const choices = Array.isArray(completion["choices"]) ? completion["choices"] : [];
  for (const choice of choices) {
    if (!isRecord(choice)) {
      continue;
    }

    const message = isRecord(choice["message"]) ? choice["message"] : null;
    if (message) {
      const reasoning = asString(message["reasoning_content"]) ?? asString(message["reasoning"]);
      if (reasoning && reasoning.length > 0) {
        return true;
      }
    }

    const delta = isRecord(choice["delta"]) ? choice["delta"] : null;
    if (delta) {
      const reasoning = asString(delta["reasoning_content"]) ?? asString(delta["reasoning"]);
      if (reasoning && reasoning.length > 0) {
        return true;
      }
    }
  }

  return false;
}

export function hasBearerToken(header: string | undefined, expectedToken: string): boolean {
  if (!header) {
    return false;
  }

  const [scheme, token] = header.split(/\s+/, 2);
  return scheme.toLowerCase() === "bearer" && token === expectedToken;
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload;
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  const directMessage = asString(payload["message"]);
  if (directMessage) {
    return directMessage;
  }

  const errorValue = payload["error"];
  if (typeof errorValue === "string") {
    return errorValue;
  }

  if (!isRecord(errorValue)) {
    return undefined;
  }

  return asString(errorValue["message"])
    ?? asString(errorValue["error"])
    ?? asString(errorValue["code"]);
}

function truncateForLog(value: string, maxLength = 240): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, Math.max(0, maxLength - 1))}…`;
}

export interface UpstreamErrorSummary {
  readonly upstreamErrorCode?: string;
  readonly upstreamErrorType?: string;
  readonly upstreamErrorMessage?: string;
}

export async function summarizeUpstreamError(response: Response): Promise<UpstreamErrorSummary> {
  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    try {
      const text = await response.clone().text();
      return text.length > 0 ? { upstreamErrorMessage: truncateForLog(text) } : {};
    } catch {
      return {};
    }
  }

  if (!isRecord(payload)) {
    return {};
  }

  const errorValue = isRecord(payload.error) ? payload.error : null;
  const code = asString(errorValue?.code) ?? asString(payload.code);
  const type = asString(errorValue?.type) ?? asString(payload.type);
  const message = extractErrorMessage(payload);

  return {
    upstreamErrorCode: code ? truncateForLog(code, 80) : undefined,
    upstreamErrorType: type ? truncateForLog(type, 80) : undefined,
    upstreamErrorMessage: message ? truncateForLog(message) : undefined,
  };
}

export async function responseIndicatesMissingModel(response: Response, requestedModel: string): Promise<boolean> {
  if (![400, 404, 422].includes(response.status)) {
    return false;
  }

  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    try {
      payload = await response.clone().text();
    } catch {
      return false;
    }
  }

  const message = extractErrorMessage(payload);
  if (!message) {
    return false;
  }

  const lowered = message.toLowerCase();
  if (!lowered.includes("model") || !lowered.includes("not found")) {
    return false;
  }

  const normalizedRequestedModel = requestedModel.trim().toLowerCase();
  return normalizedRequestedModel.length === 0
    || lowered.includes(normalizedRequestedModel)
    || lowered.includes("model_not_found");
}

const MODEL_NOT_SUPPORTED_WITH_CHATGPT_PATTERNS = [
  "model is not supported",
  "model is not available",
  "not supported when using codex",
  "not supported with a chatgpt account",
  "not supported with chatgpt account",
  "model_not_supported_for_account",
];

export async function responseIndicatesModelNotSupportedForAccount(response: Response, requestedModel: string): Promise<boolean> {
  if (response.status !== 400 && response.status !== 422) {
    return false;
  }

  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    try {
      payload = await response.clone().text();
    } catch {
      return false;
    }
  }

  const message = extractErrorMessage(payload);
  if (!message) {
    return false;
  }

  const lowered = message.toLowerCase();
  
  if (!MODEL_NOT_SUPPORTED_WITH_CHATGPT_PATTERNS.some(pattern => lowered.includes(pattern))) {
    return false;
  }

  const normalizedRequestedModel = requestedModel.trim().toLowerCase();
  if (normalizedRequestedModel.length === 0) {
    return true;
  }

  const modelInMessage = lowered.includes(normalizedRequestedModel);
  const accountMentioned = lowered.includes("chatgpt") || lowered.includes("account");
  
  return modelInMessage || accountMentioned;
}

const QUOTA_ERROR_PATTERNS = [
  "outstanding_balance",
  "outstanding-balance",
  "outstanding balance",
  "outstanding balence",
  "insufficient_balance",
  "insufficient-balance",
  "insufficient balance",
  "balance_exhausted",
  "balance-exhausted",
  "balance exhausted",
  "outstanding_quota",
  "outstanding-quota",
  "outstanding quota",
  "insufficient_quota",
  "insufficient-quota",
  "insufficient quota",
  "quota_exceeded",
  "quota-exceeded",
  "quota exceeded",
  "credits_exhausted",
  "credits-exhausted",
  "credits exhausted",
  "credit_exhausted",
  "credit-exhausted",
  "credit exhausted",
  "insufficient_credits",
  "insufficient-credits",
  "insufficient credits",
  "payment_required",
  "payment-required",
  "payment required",
  "monthly limit",
];

function messageIndicatesQuotaError(message: string): boolean {
  const lowered = message.toLowerCase();
  const normalized = lowered.replace(/[\s_-]+/g, " ");

  return QUOTA_ERROR_PATTERNS.some((pattern) => {
    const normalizedPattern = pattern.replace(/[\s_-]+/g, " ");
    return lowered.includes(pattern) || normalized.includes(normalizedPattern);
  });
}

export function responseIsEventStream(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.toLowerCase().includes("text/event-stream");
}

function payloadLooksLikeError(payload: unknown): boolean {
  if (!isRecord(payload)) {
    return false;
  }

  if (payload.error !== undefined) {
    return true;
  }

  const type = asString(payload.type);
  if (type && type.toLowerCase().includes("error")) {
    return true;
  }

  const event = asString(payload.event);
  if (event && event.toLowerCase().includes("error")) {
    return true;
  }

  const object = asString(payload.object);
  if (object && object.toLowerCase().includes("error")) {
    return true;
  }

  return false;
}

export async function responseIndicatesQuotaError(response: Response): Promise<boolean> {
  if (response.status === 402) {
    return true;
  }

  if (response.status === 429 || response.status === 403 || response.status === 503) {
    return false;
  }

  if (responseIsEventStream(response)) {
    return false;
  }

  // Skip body inspection for responses with no content-type (likely SSE from Codex backends).
  // Cloning such responses creates unnecessary tee chains that can interfere with downstream readers.
  if ((response.headers.get("content-type") ?? "").length === 0) {
    return false;
  }

  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    try {
      payload = await response.clone().text();
    } catch {
      return false;
    }
  }

  const payloadIsErrorLike = payloadLooksLikeError(payload);
  if (response.status >= 200 && response.status < 300 && !payloadIsErrorLike) {
    return false;
  }

  const message = extractErrorMessage(payload);
  if (message) {
    return messageIndicatesQuotaError(message);
  }

  if (!payloadIsErrorLike) {
    return false;
  }

  try {
    return messageIndicatesQuotaError(JSON.stringify(payload));
  } catch {
    return false;
  }
}

export async function fetchWithResponseTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => {
    controller.abort(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
  }, timeoutMs);

  const mergedSignal = init.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;

  try {
    return await fetch(url, {
      ...init,
      signal: mergedSignal
    });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export function sendOpenAiError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  type: string,
  code?: string
): void {
  if (code) {
    reply.header("x-open-hax-error-code", code);
  }
  reply.code(statusCode).send(openAiError(message, type, code));
}
