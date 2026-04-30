import { createHash } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { Readable } from "node:stream";

import type { FastifyReply } from "fastify";

import type { ProxyConfig } from "../config.js";
import type { ProviderCredential } from "../key-pool.js";
import type { Factory4xxDiagnostics, RequestLogStore } from "../request-log-store.js";
import type { ResolvedRequestAuth } from "../request-auth.js";
import { estimateRequestCost } from "../model-pricing.js";
import type { PromptAffinityStore } from "../prompt-affinity-store.js";
import type { PolicyEngine } from "../policy/index.js";
import type { AccountHealthStore } from "../db/account-health-store.js";
import { orderAccountsByPolicy } from "../provider-policy.js";
import {
  buildForwardHeaders,
  buildUpstreamHeadersForCredential,
  copyUpstreamHeaders,
  isRateLimitResponse,
  parseRetryAfterMs,
} from "../proxy.js";
import {
  chatRequestToResponsesRequest,
  chatCompletionToSse,
  responsesEventStreamToChatCompletion,
  responsesEventStreamToErrorPayload,
  responsesToChatCompletion,
  shouldUseResponsesUpstream,
  responsesOutputHasReasoning,
  writeInterleavedResponsesSse,
  extractTerminalResponseFromEventStream,
} from "../responses-compat.js";
import {
  chatRequestToMessagesRequest,
  messagesToChatCompletion,
  shouldUseMessagesUpstream,
} from "../messages-compat.js";
import {
  chatRequestToOllamaRequest,
  ollamaToChatCompletion,
} from "../ollama-compat.js";
import type { ProviderRoute } from "../provider-routing.js";
import {
  buildFactoryAnthropicHeaders,
  buildFactoryCommonHeaders,
  getFactoryEndpointPath,
  getFactoryModelType,
  inlineSystemPrompt,
  sanitizeFactorySystemPrompt,
} from "../factory-compat.js";
import {
  appendCsvHeaderValue,
  chatCompletionHasReasoningContent,
  fetchWithResponseTimeout,
  requestWantsReasoningTrace,
  responseIsEventStream,
  responseIndicatesMissingModel,
  responseIndicatesModelNotSupportedForAccount,
  responseIndicatesQuotaError,
  sendOpenAiError,
  shouldEnableInterleavedThinkingHeader,
  streamPayloadIndicatesQuotaError,

  streamPayloadHasSubstantiveChunks,
  summarizeUpstreamError,
  toErrorMessage,
} from "../provider-utils.js";
import { resolveRequestRoutingState } from "../provider-routing.js";
import { getTelemetry } from "../telemetry/otel.js";

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Avoid accidental `/v1/v1/...` joins when the provider base URL already includes the OpenAI version segment.
  const baseLower = normalizedBase.toLowerCase();
  const pathLower = normalizedPath.toLowerCase();
  if (pathLower.startsWith("/v1/") && baseLower.endsWith("/v1")) {
    normalizedPath = normalizedPath.slice(3);
  }

  return `${normalizedBase}${normalizedPath}`;
}

function dedupePaths(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function transientRetryDelayMs(context: StrategyRequestContext, retryIndex: number): number {
  return context.config.upstreamTransientRetryBackoffMs * (retryIndex + 1);
}

function shouldRetrySameCredentialForServerError(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

function shouldCooldownCredentialOnAuthFailure(providerId: string, status: number): boolean {
  if (status === 401) {
    return true;
  }
  if (status === 403) {
    // Factory 403 often indicates request/prompt rejection rather than credential failure.
    return providerId !== "factory";
  }
  return false;
}

/**
 * For API-key providers (vivgrid, ollama-cloud, openrouter, requesty, etc.),
 * a 402 or 403 means the key has been disabled or the account was suspended.
 * These should be treated as permanent failures — the key will not recover
 * without manual intervention.
 *
 * OAuth accounts are excluded: 402/403 may be transient (plan changes,
 * temporary holds) and the token can be refreshed.
 */
const PERMANENT_DISABLE_COOLDOWN_MS = 365 * 24 * 60 * 60 * 1000;

function shouldPermanentlyDisableCredential(credential: ProviderCredential, status: number): boolean {
  if (credential.authType !== "api_key") {
    return false;
  }
  return status === 402 || status === 403;
}

function reorderCandidatesForAffinity<T extends { readonly providerId: string; readonly account: ProviderCredential }>(
  candidates: readonly T[],
  preferred: PreferredAffinity | undefined,
): T[] {
  if (!preferred) {
    return [...candidates];
  }

  const preferredCandidates = candidates.filter(
    (candidate) => candidate.providerId === preferred.providerId && candidate.account.accountId === preferred.accountId,
  );
  if (preferredCandidates.length === 0) {
    return [...candidates];
  }

  const remaining = candidates.filter(
    (candidate) => candidate.providerId !== preferred.providerId || candidate.account.accountId !== preferred.accountId,
  );
  return [...preferredCandidates, ...remaining];
}

type UpstreamMode =
  | "chat_completions"
  | "responses"
  | "responses_passthrough"
  | "openai_responses_passthrough"
  | "images"
  | "gemini_chat"
  | "messages"
  | "openai_chat_completions"
  | "openai_responses"
  | "ollama_chat"
  | "local_ollama_chat";

interface StrategyRequestContext {
  readonly config: ProxyConfig;
  readonly clientHeaders: IncomingHttpHeaders;
  readonly requestBody: Record<string, unknown>;
  readonly requestAuth?: Pick<ResolvedRequestAuth, "kind" | "tenantId" | "keyId" | "subject">;
  readonly requestedModelInput: string;
  readonly routingModelInput: string;
  readonly routedModel: string;
  readonly explicitOllama: boolean;
  readonly openAiPrefixed: boolean;
  readonly factoryPrefixed: boolean;
  readonly localOllama: boolean;
  readonly clientWantsStream: boolean;
  readonly needsReasoningTrace: boolean;
  readonly upstreamAttemptTimeoutMs: number;
  readonly responsesPassthrough?: boolean;
  readonly imagesPassthrough?: boolean;
}

interface ProviderAttemptContext extends StrategyRequestContext {
  readonly providerId: string;
  readonly baseUrl: string;
  readonly account: ProviderCredential;
  readonly hasMoreCandidates: boolean;
  readonly attempt: number;
}

interface LocalAttemptContext extends StrategyRequestContext {
  readonly baseUrl: string;
}

interface ProviderAttemptOutcomeHandled {
  readonly kind: "handled";
}

interface ProviderAttemptOutcomeContinue {
  readonly kind: "continue";
  readonly rateLimit?: boolean;
  readonly requestError?: boolean;
  readonly upstreamServerError?: boolean;
  readonly upstreamInvalidRequest?: boolean;
  readonly modelNotFound?: boolean;
  readonly modelNotSupportedForAccount?: boolean;
  readonly upstreamAuthError?: {
    readonly status: number;
    readonly message?: string;
  };
}

type ProviderAttemptOutcome = ProviderAttemptOutcomeHandled | ProviderAttemptOutcomeContinue;

interface FallbackAccumulator {
  sawRateLimit: boolean;
  sawRequestError: boolean;
  sawUpstreamServerError: boolean;
  sawUpstreamInvalidRequest: boolean;
  sawModelNotFound: boolean;
  sawModelNotSupportedForAccount: boolean;
  attempts: number;
  lastUpstreamAuthError?: {
    readonly status: number;
    readonly message?: string;
  };
}

export interface ProviderFallbackExecutionResult {
  readonly handled: boolean;
  readonly candidateCount: number;
  readonly summary: FallbackAccumulator;
}

interface PreferredAffinity {
  readonly providerId: string;
  readonly accountId: string;
}

export interface ProviderAvailabilitySummary {
  readonly sawConfiguredProvider: boolean;
  readonly prompt_cache_key?: string;
}

interface BuildPayloadResult {
  readonly upstreamPayload: Record<string, unknown>;
  readonly bodyText: string;
  readonly serviceTier?: string;
  readonly serviceTierSource: "fast_mode" | "explicit" | "none";
}

function gptModelRequiresPaidPlan(routedModel: string): boolean {
  const match = routedModel.match(/^gpt-(\d+)(?:[.-]([a-z0-9]+))?/i);
  if (!match) {
    return false;
  }

  const major = Number.parseInt(match[1] ?? "", 10);
  if (!Number.isFinite(major)) {
    return false;
  }

  if (major > 5) {
    return true;
  }

  if (major !== 5) {
    return false;
  }

  const qualifier = match[2];
  if (!qualifier) {
    return false;
  }

  if (/^\d+$/.test(qualifier)) {
    const minor = Number.parseInt(qualifier, 10);
    return Number.isFinite(minor) && minor >= 3;
  }

  // Non-numeric qualifiers like `gpt-5-mini` should be treated as paid-required.
  return true;
}

function providerAccountsForRequest(
  accounts: readonly ProviderCredential[],
  providerId: string,
  routedModel: string,
): ProviderCredential[] {
  if (providerId !== "openai") {
    return [...accounts];
  }

  const isGptModel = routedModel.startsWith("gpt-");
  if (!isGptModel) {
    return [...accounts];
  }

  if (gptModelRequiresPaidPlan(routedModel)) {
    const stronglySupportedPlans = new Set(["plus", "pro", "business", "enterprise"]);

    const stronglySupportedAccounts = accounts.filter(
      (account) => stronglySupportedPlans.has(account.planType ?? ""),
    );

    const teamAccounts = accounts.filter((account) => account.planType === "team");

    const otherPaidAccounts = accounts.filter((account) => {
      const planType = account.planType ?? "unknown";
      if (planType === "free") {
        return false;
      }
      if (planType === "team") {
        return false;
      }
      if (stronglySupportedPlans.has(planType)) {
        return false;
      }
      return true;
    });

    const freeAccounts = accounts.filter((account) => account.planType === "free");

    return [
      ...stronglySupportedAccounts,
      ...teamAccounts,
      ...otherPaidAccounts,
      ...freeAccounts,
    ];
  }

  const freeAccounts = accounts.filter((account) => account.planType === "free");
  const nonFreeAccounts = accounts.filter((account) => account.planType !== "free");
  const prioritized = freeAccounts.length > 0
    ? [...freeAccounts, ...nonFreeAccounts]
    : [...accounts];

  return prioritized;
}

function providerAccountsForRequestWithPolicy(
  policy: PolicyEngine,
  accounts: readonly ProviderCredential[],
  providerId: string,
  routedModel: string,
  context: {
    openAiPrefixed: boolean;
    localOllama: boolean;
    explicitOllama: boolean;
  },
): ProviderCredential[] {
  return orderAccountsByPolicy(policy, providerId, accounts, routedModel, context);
}

function providerUsesOpenAiChatCompletions(providerId: string): boolean {
  const normalized = providerId.trim().toLowerCase();
  return normalized === "ob1" || normalized === "openrouter" || normalized === "requesty";
}

function planCostTier(planType: string | undefined): number {
  const normalized = (planType ?? "").trim().toLowerCase();
  switch (normalized) {
    case "free":
      return 0;
    case "team":
      return 1;
    case "plus":
    case "pro":
    case "business":
    case "enterprise":
      return 2;
    case "unknown":
    default:
      return 1;
  }
}

function reorderAccountsForLatency(
  requestLogStore: RequestLogStore,
  providerId: string,
  accounts: readonly ProviderCredential[],
  routedModel: string,
  upstreamMode: string,
): ProviderCredential[] {
  const TTFT_GRACE_MS = 120;
  const WINDOW_SIZE = 6;

  const window = [...accounts.slice(0, WINDOW_SIZE)];
  const tail = accounts.slice(window.length);

  const perfFor = (account: ProviderCredential) => {
    return requestLogStore.getPerfSummary(providerId, account.accountId, routedModel, upstreamMode);
  };

  window.sort((a, b) => {
    const perfA = perfFor(a);
    const perfB = perfFor(b);

    const ttftA = perfA?.ewmaTtftMs ?? Number.POSITIVE_INFINITY;
    const ttftB = perfB?.ewmaTtftMs ?? Number.POSITIVE_INFINITY;

    const ttftDelta = Math.abs(ttftA - ttftB);
    if (ttftDelta > TTFT_GRACE_MS) {
      return ttftA - ttftB;
    }

    const costA = planCostTier(a.planType);
    const costB = planCostTier(b.planType);
    if (costA !== costB) {
      return costA - costB;
    }

    const tpsA = perfA?.ewmaTps ?? Number.NEGATIVE_INFINITY;
    const tpsB = perfB?.ewmaTps ?? Number.NEGATIVE_INFINITY;
    if (tpsA !== tpsB) {
      return tpsB - tpsA;
    }

    return 0;
  });

  return [...window, ...tail];
}

export interface UsageCounts {
  readonly promptTokens?: number;
  readonly completionTokens?: number;
  readonly totalTokens?: number;
  readonly cachedPromptTokens?: number;
  readonly imageCount?: number;
  readonly imageCostUsd?: number;
}

interface ProviderStrategy {
  readonly mode: UpstreamMode;
  readonly isLocal: boolean;
  matches(context: StrategyRequestContext): boolean;
  getUpstreamPath(context: StrategyRequestContext): string;
  buildPayload(context: StrategyRequestContext): BuildPayloadResult;
  applyRequestHeaders(headers: Headers, context: ProviderAttemptContext, payload: Record<string, unknown>): void;
  handleProviderAttempt(
    reply: FastifyReply,
    response: Response,
    context: ProviderAttemptContext
  ): Promise<ProviderAttemptOutcome>;
  handleLocalAttempt(reply: FastifyReply, response: Response, context: LocalAttemptContext): Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

type FactoryDiagnosticAccumulator = {
  readonly textHash: ReturnType<typeof createHash>;
  totalTextChars: number;
  maxTextBlockChars: number;
  imageInputCount: number;
  hasReasoning: boolean;
  hasCodeFence: boolean;
  hasXmlLikeTags: boolean;
  hasOpencodeMarkers: boolean;
  hasAgentProtocolMarkers: boolean;
};

type MutableFactory4xxDiagnostics = {
  -readonly [K in keyof Factory4xxDiagnostics]: Factory4xxDiagnostics[K];
};

function normalizeDiagnosticText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function shortHash(value: string): string | undefined {
  const normalized = normalizeDiagnosticText(value);
  if (normalized.length === 0) {
    return undefined;
  }

  return `sha256:${createHash("sha256").update(normalized).digest("hex").slice(0, 12)}`;
}

function createFactoryDiagnosticAccumulator(): FactoryDiagnosticAccumulator {
  return {
    textHash: createHash("sha256"),
    totalTextChars: 0,
    maxTextBlockChars: 0,
    imageInputCount: 0,
    hasReasoning: false,
    hasCodeFence: false,
    hasXmlLikeTags: false,
    hasOpencodeMarkers: false,
    hasAgentProtocolMarkers: false,
  };
}

function addDiagnosticText(accumulator: FactoryDiagnosticAccumulator, value: unknown): void {
  if (typeof value !== "string") {
    return;
  }

  const normalized = normalizeDiagnosticText(value);
  if (normalized.length === 0) {
    return;
  }

  accumulator.textHash.update(normalized);
  accumulator.textHash.update("\n");
  accumulator.totalTextChars += normalized.length;
  accumulator.maxTextBlockChars = Math.max(accumulator.maxTextBlockChars, normalized.length);

  const lowered = normalized.toLowerCase();
  accumulator.hasCodeFence ||= normalized.includes("```");
  accumulator.hasXmlLikeTags ||= /<\/?[a-z][^>]{0,80}>/i.test(normalized);
  accumulator.hasOpencodeMarkers ||= lowered.includes("you are opencode") || lowered.includes("operation-mindfuck");
  accumulator.hasAgentProtocolMarkers ||= lowered.includes("available_skills")
    || lowered.includes("agents.md")
    || lowered.includes("skill.md")
    || lowered.includes("contract.edn")
    || lowered.includes("skill-registry");
}

function collectDiagnosticContentText(accumulator: FactoryDiagnosticAccumulator, content: unknown): void {
  if (typeof content === "string") {
    addDiagnosticText(accumulator, content);
    return;
  }

  if (!Array.isArray(content)) {
    return;
  }

  for (const part of content) {
    if (!isRecord(part)) {
      continue;
    }

    const partType = asString(part["type"])?.toLowerCase() ?? "";
    if (
      partType.includes("image")
      || part["image_url"] !== undefined
      || part["imageUrl"] !== undefined
    ) {
      accumulator.imageInputCount += 1;
    }
    if (
      partType === "reasoning"
      || partType === "reasoning_content"
      || partType === "reasoning_details"
      || partType === "summary_text"
      || partType === "thinking"
    ) {
      accumulator.hasReasoning = true;
    }

    addDiagnosticText(accumulator, part["text"]);
  }
}

function finalizeDiagnosticFingerprint(accumulator: FactoryDiagnosticAccumulator): string | undefined {
  if (accumulator.totalTextChars === 0) {
    return undefined;
  }

  return `sha256:${accumulator.textHash.digest("hex").slice(0, 12)}`;
}

function buildFactory4xxDiagnostics(
  upstreamPayload: Record<string, unknown>,
  promptCacheKey?: string,
): Factory4xxDiagnostics {
  const accumulator = createFactoryDiagnosticAccumulator();
  const diagnostics: MutableFactory4xxDiagnostics = {
    requestFormat: "unknown",
    promptCacheKeyHash: promptCacheKey ? shortHash(promptCacheKey) : undefined,
    messageCount: 0,
    inputItemCount: 0,
    systemMessageCount: 0,
    userMessageCount: 0,
    assistantMessageCount: 0,
    toolMessageCount: 0,
    functionCallCount: 0,
    functionCallOutputCount: 0,
    imageInputCount: 0,
    hasInstructions: false,
    instructionsChars: 0,
    totalTextChars: 0,
    maxTextBlockChars: 0,
    hasReasoning: false,
    hasCodeFence: false,
    hasXmlLikeTags: false,
    hasOpencodeMarkers: false,
    hasAgentProtocolMarkers: false,
  };

  const instructions = asString(upstreamPayload["instructions"]);
  if (instructions !== undefined) {
    const normalizedInstructions = normalizeDiagnosticText(instructions);
    diagnostics.hasInstructions = true;
    diagnostics.instructionsChars = normalizedInstructions.length;
    diagnostics.instructionsFingerprint = shortHash(normalizedInstructions);
    addDiagnosticText(accumulator, instructions);
  }

  const input = upstreamPayload["input"];
  if (Array.isArray(input)) {
    diagnostics.requestFormat = "responses";
    diagnostics.inputItemCount = input.length;

    for (const item of input) {
      if (!isRecord(item)) {
        continue;
      }

      const role = asString(item["role"]);
      if (role === "system") {
        diagnostics.messageCount = (diagnostics.messageCount ?? 0) + 1;
        diagnostics.systemMessageCount = (diagnostics.systemMessageCount ?? 0) + 1;
      } else if (role === "user") {
        diagnostics.messageCount = (diagnostics.messageCount ?? 0) + 1;
        diagnostics.userMessageCount = (diagnostics.userMessageCount ?? 0) + 1;
      } else if (role === "assistant") {
        diagnostics.messageCount = (diagnostics.messageCount ?? 0) + 1;
        diagnostics.assistantMessageCount = (diagnostics.assistantMessageCount ?? 0) + 1;
      } else if (role === "tool") {
        diagnostics.messageCount = (diagnostics.messageCount ?? 0) + 1;
        diagnostics.toolMessageCount = (diagnostics.toolMessageCount ?? 0) + 1;
      }

      const itemType = asString(item["type"])?.toLowerCase();
      if (itemType === "function_call") {
        diagnostics.functionCallCount = (diagnostics.functionCallCount ?? 0) + 1;
      } else if (itemType === "function_call_output") {
        diagnostics.functionCallOutputCount = (diagnostics.functionCallOutputCount ?? 0) + 1;
      }

      const toolCalls = Array.isArray(item["tool_calls"]) ? item["tool_calls"] : [];
      diagnostics.functionCallCount = (diagnostics.functionCallCount ?? 0) + toolCalls.length;

      if (
        item["reasoning"] !== undefined
        || item["reasoning_content"] !== undefined
        || item["reasoning_details"] !== undefined
      ) {
        accumulator.hasReasoning = true;
      }

      addDiagnosticText(accumulator, item["reasoning"]);
      addDiagnosticText(accumulator, item["reasoning_content"]);
      collectDiagnosticContentText(accumulator, item["content"]);
      addDiagnosticText(accumulator, item["output"]);
    }
  } else if (Array.isArray(upstreamPayload["messages"])) {
    const messages = upstreamPayload["messages"] as unknown[];
    diagnostics.requestFormat = upstreamPayload["anthropic_version"] !== undefined ? "messages" : "chat_completions";
    diagnostics.messageCount = messages.length;

    for (const message of messages) {
      if (!isRecord(message)) {
        continue;
      }

      const role = asString(message["role"]);
      if (role === "system") {
        diagnostics.systemMessageCount = (diagnostics.systemMessageCount ?? 0) + 1;
      } else if (role === "user") {
        diagnostics.userMessageCount = (diagnostics.userMessageCount ?? 0) + 1;
      } else if (role === "assistant") {
        diagnostics.assistantMessageCount = (diagnostics.assistantMessageCount ?? 0) + 1;
      } else if (role === "tool") {
        diagnostics.toolMessageCount = (diagnostics.toolMessageCount ?? 0) + 1;
      }

      const toolCalls = Array.isArray(message["tool_calls"]) ? message["tool_calls"] : [];
      diagnostics.functionCallCount = (diagnostics.functionCallCount ?? 0) + toolCalls.length;

      if (
        message["reasoning"] !== undefined
        || message["reasoning_content"] !== undefined
        || message["reasoning_details"] !== undefined
      ) {
        accumulator.hasReasoning = true;
      }

      addDiagnosticText(accumulator, message["reasoning"]);
      addDiagnosticText(accumulator, message["reasoning_content"]);
      collectDiagnosticContentText(accumulator, message["content"]);
    }

    const topLevelSystem = upstreamPayload["system"];
    if (topLevelSystem !== undefined) {
      diagnostics.systemMessageCount = (diagnostics.systemMessageCount ?? 0) + 1;
      diagnostics.messageCount = (diagnostics.messageCount ?? 0) + 1;
      collectDiagnosticContentText(accumulator, topLevelSystem);
    }
  }

  diagnostics.imageInputCount = accumulator.imageInputCount;
  diagnostics.totalTextChars = accumulator.totalTextChars;
  diagnostics.maxTextBlockChars = accumulator.maxTextBlockChars;
  diagnostics.hasReasoning = accumulator.hasReasoning;
  diagnostics.hasCodeFence = accumulator.hasCodeFence;
  diagnostics.hasXmlLikeTags = accumulator.hasXmlLikeTags;
  diagnostics.hasOpencodeMarkers = accumulator.hasOpencodeMarkers;
  diagnostics.hasAgentProtocolMarkers = accumulator.hasAgentProtocolMarkers;
  diagnostics.textFingerprint = finalizeDiagnosticFingerprint(accumulator);

  return diagnostics;
}

async function updateFailedAttemptDiagnostics(
  requestLogStore: RequestLogStore,
  entryId: string,
  response: Response,
  providerId: string,
  upstreamPayload: Record<string, unknown>,
  promptCacheKey?: string,
): Promise<void> {
  if (response.ok) {
    return;
  }

  const summary = await summarizeUpstreamError(response);
  const isFactory4xx = providerId === "factory" && response.status >= 400 && response.status < 500;
  const errorMessage = summary.upstreamErrorMessage;

  if (!isFactory4xx && !summary.upstreamErrorCode && !summary.upstreamErrorType && !errorMessage) {
    return;
  }

  requestLogStore.update(entryId, {
    error: errorMessage,
    upstreamErrorCode: summary.upstreamErrorCode,
    upstreamErrorType: summary.upstreamErrorType,
    upstreamErrorMessage: errorMessage,
    factoryDiagnostics: isFactory4xx ? buildFactory4xxDiagnostics(upstreamPayload, promptCacheKey) : undefined,
  });
}

function stripTrailingAssistantPrefill(payload: Record<string, unknown>): void {
  const input = payload["input"];
  if (!Array.isArray(input) || input.length === 0) {
    return;
  }

  let lastIndex = input.length - 1;
  while (lastIndex >= 0) {
    const item = input[lastIndex];
    if (!isRecord(item)) {
      break;
    }

    const role = asString(item["role"]);
    if (role !== "assistant") {
      break;
    }

    lastIndex--;
  }

  if (lastIndex < input.length - 1) {
    payload["input"] = input.slice(0, lastIndex + 1);
  }
}

function hasExplicitServiceTierRequest(context: StrategyRequestContext): boolean {
  const openHax = isRecord(context.requestBody["open_hax"]) ? context.requestBody["open_hax"] : null;

  return Boolean(
    asString(context.requestBody["service_tier"])?.trim()
      || asString(openHax?.["service_tier"])?.trim()
      || asString(openHax?.["serviceTier"])?.trim()
      || readHeaderValue(context.clientHeaders, "x-open-hax-service-tier")?.trim(),
  );
}

function requestedFastMode(context: StrategyRequestContext): boolean {
  const openHax = isRecord(context.requestBody["open_hax"]) ? context.requestBody["open_hax"] : null;

  return Boolean(
    asBoolean(openHax?.["fast_mode"])
      ?? asBoolean(openHax?.["fastMode"])
      ?? parseBooleanHeader(readHeaderValue(context.clientHeaders, "x-open-hax-fast-mode")),
  );
}

function resolveLoggedServiceTier(
  upstreamPayload: Record<string, unknown>,
  context?: StrategyRequestContext,
): { readonly serviceTier?: string; readonly serviceTierSource: "fast_mode" | "explicit" | "none" } {
  const serviceTier = asString(upstreamPayload["service_tier"])?.trim();

  if (!serviceTier) {
    return {
      serviceTierSource: "none",
    };
  }

  if (!context) {
    return {
      serviceTier,
      serviceTierSource: "explicit",
    };
  }

  return {
    serviceTier,
    serviceTierSource: !hasExplicitServiceTierRequest(context) && requestedFastMode(context) && serviceTier === "priority"
      ? "fast_mode"
      : "explicit",
  };
}

function buildPayloadResult(upstreamPayload: Record<string, unknown>, context?: StrategyRequestContext): BuildPayloadResult {
  const { serviceTier, serviceTierSource } = resolveLoggedServiceTier(upstreamPayload, context);

  return {
    upstreamPayload,
    bodyText: JSON.stringify(upstreamPayload),
    serviceTier,
    serviceTierSource,
  };
}

function buildRequestBodyForUpstream(context: StrategyRequestContext): Record<string, unknown> {
  const upstreamBody: Record<string, unknown> = {
    ...context.requestBody,
  };

  if (context.routedModel !== context.requestedModelInput) {
    upstreamBody.model = context.routedModel;
  }

  delete upstreamBody["open_hax"];
  return upstreamBody;
}

function ensureChatCompletionsUsageInStream(upstreamBody: Record<string, unknown>): void {
  if (upstreamBody["stream"] !== true) {
    return;
  }

  const existing = isRecord(upstreamBody["stream_options"]) ? upstreamBody["stream_options"] : null;
  if (existing) {
    if (existing["include_usage"] === undefined) {
      existing["include_usage"] = true;
    }
    return;
  }

  upstreamBody["stream_options"] = { include_usage: true };
}

function readHeaderValue(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return typeof value === "string" ? value : undefined;
}

function parseBooleanHeader(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

function resolveRequestedServiceTier(context: StrategyRequestContext): string | undefined {
  const openHax = isRecord(context.requestBody["open_hax"]) ? context.requestBody["open_hax"] : null;

  const explicitServiceTier = asString(openHax?.["service_tier"]) ?? asString(openHax?.["serviceTier"]);
  if (explicitServiceTier?.trim()) {
    return explicitServiceTier.trim();
  }

  const headerServiceTier = readHeaderValue(context.clientHeaders, "x-open-hax-service-tier")?.trim();
  if (headerServiceTier) {
    return headerServiceTier;
  }

  const fastMode = asBoolean(openHax?.["fast_mode"])
    ?? asBoolean(openHax?.["fastMode"])
    ?? parseBooleanHeader(readHeaderValue(context.clientHeaders, "x-open-hax-fast-mode"));

  if (fastMode) {
    return "priority";
  }

  return undefined;
}

function applyRequestedServiceTier(upstreamPayload: Record<string, unknown>, context: StrategyRequestContext): void {
  if (upstreamPayload["service_tier"] !== undefined) {
    return;
  }

  const serviceTier = resolveRequestedServiceTier(context);
  if (serviceTier) {
    upstreamPayload["service_tier"] = serviceTier;
  }
}

function resolveUsageAttribution(context: ProviderAttemptContext | LocalAttemptContext): {
  readonly tenantId?: string;
  readonly issuer?: string;
  readonly keyId?: string;
} {
  const auth = context.requestAuth;
  if (!auth) {
    return {};
  }

  return {
    tenantId: auth.tenantId,
    issuer: auth.kind === "legacy_admin" || auth.kind === "tenant_api_key" || auth.kind === "ui_session"
      ? "local"
      : auth.subject,
    keyId: auth.keyId,
  };
}

function recordAttempt(
  requestLogStore: RequestLogStore,
  context: ProviderAttemptContext | LocalAttemptContext,
  values: {
    readonly providerId: string;
    readonly accountId: string;
    readonly authType: "api_key" | "oauth_bearer" | "local";
    readonly upstreamPath: string;
    readonly status: number;
    readonly latencyMs: number;
    readonly serviceTier?: string;
    readonly serviceTierSource?: "fast_mode" | "explicit" | "none";
    readonly promptTokens?: number;
    readonly completionTokens?: number;
    readonly totalTokens?: number;
    readonly promptCacheKeyUsed?: boolean;
    readonly imageCount?: number;
    readonly imageCostUsd?: number;
    readonly error?: string;
  },
  mode: UpstreamMode
): string {
  const cost = estimateRequestCost(
    values.providerId,
    context.routedModel,
    values.promptTokens ?? 0,
    values.completionTokens ?? 0,
  );

  const attribution = resolveUsageAttribution(context);

  const entry = requestLogStore.record({
    tenantId: attribution.tenantId,
    issuer: attribution.issuer,
    keyId: attribution.keyId,
    providerId: values.providerId,
    accountId: values.accountId,
    authType: values.authType,
    model: context.routedModel,
    upstreamMode: mode,
    upstreamPath: values.upstreamPath,
    status: values.status,
    latencyMs: values.latencyMs,
    serviceTier: values.serviceTier,
    serviceTierSource: values.serviceTierSource,
    promptTokens: values.promptTokens,
    completionTokens: values.completionTokens,
    totalTokens: values.totalTokens,
    imageCount: values.imageCount,
    imageCostUsd: values.imageCostUsd,
    promptCacheKeyUsed: values.promptCacheKeyUsed,
    ttftMs: values.latencyMs,
    error: values.error,
    costUsd: cost.costUsd,
    energyJoules: cost.energyJoules,
    waterEvaporatedMl: cost.waterEvaporatedMl,
  });

  return entry.id;
}

function cachedPromptTokensFromUsage(usage: Record<string, unknown>): number | undefined {
  const direct = asNumber(usage["cached_tokens"]);
  if (direct !== undefined) {
    return direct;
  }

  const promptDetails = isRecord(usage["prompt_tokens_details"]) ? usage["prompt_tokens_details"] : null;
  const cachedFromPromptDetails = promptDetails ? asNumber(promptDetails["cached_tokens"]) : undefined;
  if (cachedFromPromptDetails !== undefined) {
    return cachedFromPromptDetails;
  }

  const inputDetails = isRecord(usage["input_tokens_details"]) ? usage["input_tokens_details"] : null;
  const cachedFromInputDetails = inputDetails ? asNumber(inputDetails["cached_tokens"]) : undefined;
  if (cachedFromInputDetails !== undefined) {
    return cachedFromInputDetails;
  }

  return undefined;
}

function imageCountFromImagesPayload(payload: Record<string, unknown>): number | undefined {
  const data = payload["data"];
  if (Array.isArray(data)) {
    return data.length;
  }

  const images = payload["images"];
  if (Array.isArray(images)) {
    return images.length;
  }

  return undefined;
}

function imageCountFromResponsesPayload(payload: Record<string, unknown>): number | undefined {
  let responsePayload: Record<string, unknown> = payload;
  if (asString(payload["type"]) === "response.completed" && isRecord(payload["response"])) {
    responsePayload = payload["response"] as Record<string, unknown>;
  }

  const output = Array.isArray(responsePayload["output"]) ? responsePayload["output"] : [];
  if (output.length === 0) {
    return undefined;
  }

  let count = 0;
  for (const item of output) {
    if (!isRecord(item)) continue;
    const type = asString(item["type"]);
    if (type === "image_generation_call") {
      const result = item["result"];
      if (Array.isArray(result)) {
        count += result.length;
      } else if (typeof result === "string") {
        if (result.length > 0) {
          count += 1;
        }
      } else {
        count += 1;
      }
      continue;
    }
    if (type === "image" || type === "output_image") {
      count += 1;
    }
  }

  return count > 0 ? count : undefined;
}

function resolveImageCostUsd(config: ProxyConfig, providerId: string): number {
  const normalized = providerId.trim().toLowerCase();
  const override = config.imageCostUsdByProvider[normalized];
  return override ?? config.imageCostUsdDefault;
}

function usageCountsFromCompletion(completion: Record<string, unknown>): UsageCounts {
  const usage = isRecord(completion["usage"]) ? completion["usage"] : null;
  if (!usage) {
    return {};
  }

  const promptTokens = asNumber(usage["prompt_tokens"]);
  const completionTokens = asNumber(usage["completion_tokens"]);
  const totalTokens = asNumber(usage["total_tokens"])
    ?? (promptTokens !== undefined && completionTokens !== undefined ? promptTokens + completionTokens : undefined);
  const cachedPromptTokens = cachedPromptTokensFromUsage(usage);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    cachedPromptTokens,
  };
}

function usageCountsFromUpstreamJson(upstreamJson: unknown, routedModel: string): UsageCounts {
  if (!isRecord(upstreamJson)) {
    return {};
  }

  const directCounts = usageCountsFromCompletion(upstreamJson);
  if (
    directCounts.promptTokens !== undefined
    || directCounts.completionTokens !== undefined
    || directCounts.totalTokens !== undefined
    || directCounts.cachedPromptTokens !== undefined
  ) {
    return directCounts;
  }

  let counts: UsageCounts;
  try {
    counts = usageCountsFromCompletion(responsesToChatCompletion(upstreamJson, routedModel));
  } catch {
    try {
      counts = usageCountsFromCompletion(messagesToChatCompletion(upstreamJson, routedModel));
    } catch {
      try {
        counts = usageCountsFromCompletion(ollamaToChatCompletion(upstreamJson, routedModel));
      } catch {
        counts = usageCountsFromCompletion(upstreamJson);
      }
    }
  }

  const imageCount = imageCountFromImagesPayload(upstreamJson) ?? imageCountFromResponsesPayload(upstreamJson);
  if (imageCount !== undefined) {
    return { ...counts, imageCount };
  }

  return counts;
}

function usageCountsFromGeminiResponse(upstreamJson: Record<string, unknown>): UsageCounts {
  const usageMetadata = isRecord(upstreamJson["usageMetadata"]) ? upstreamJson["usageMetadata"] : null;
  if (!usageMetadata) {
    return {};
  }

  const promptTokens = asNumber(usageMetadata["promptTokenCount"]);
  const completionTokens = asNumber(usageMetadata["candidatesTokenCount"]);
  const totalTokens = asNumber(usageMetadata["totalTokenCount"]);

  return { promptTokens, completionTokens, totalTokens };
}

function usageCountsForMode(mode: UpstreamMode, upstreamJson: unknown, routedModel: string): UsageCounts {
  if (!isRecord(upstreamJson)) {
    return {};
  }

  if (mode === "messages") {
    return usageCountsFromCompletion(messagesToChatCompletion(upstreamJson, routedModel));
  }

  if (
    mode === "responses"
    || mode === "openai_responses"
    || mode === "responses_passthrough"
    || mode === "openai_responses_passthrough"
  ) {
    const counts = usageCountsFromCompletion(responsesToChatCompletion(upstreamJson, routedModel));
    const imageCount = imageCountFromResponsesPayload(upstreamJson);
    if (imageCount !== undefined) {
      return { ...counts, imageCount };
    }
    return counts;
  }

  if (mode === "images") {
    const imageCount = imageCountFromImagesPayload(upstreamJson) ?? imageCountFromResponsesPayload(upstreamJson);
    return imageCount !== undefined ? { imageCount } : {};
  }

  if (mode === "gemini_chat") {
    return usageCountsFromGeminiResponse(upstreamJson);
  }

  if (mode === "ollama_chat" || mode === "local_ollama_chat") {
    return usageCountsFromCompletion(ollamaToChatCompletion(upstreamJson, routedModel));
  }

  return usageCountsFromUpstreamJson(upstreamJson, routedModel);
}

/**
 * Parse SSE stream text to extract token usage counts.
 *
 * Handles four distinct SSE wire formats:
 *
 * 1. **OpenAI Chat Completions** (`chat_completions`, `openai_chat_completions`):
 *    The final chunk before `data: [DONE]` carries a `usage` object with
 *    `prompt_tokens`, `completion_tokens`, `total_tokens` when the request
 *    included `stream_options.include_usage: true`.
 *
 * 2. **Anthropic Messages** (`messages`):
 *    `message_start` contains `message.usage.input_tokens`;
 *    `message_delta` contains `usage.output_tokens`.
 *
 * 3. **OpenAI Responses** (`responses`, `openai_responses`):
 *    `response.completed` events embed the full response object which includes
 *    `usage.input_tokens`, `usage.output_tokens`, `usage.total_tokens`.
 *
 * 4. **Ollama** (`ollama_chat`, `local_ollama_chat`):
 *    Newline-delimited JSON; the final object with `done: true` carries
 *    `prompt_eval_count` and `eval_count`.
 *
 * Returns `{}` (no usage) when the stream does not contain usage data — this
 * is the expected path for providers that omit it.  Never throws.
 */
export function extractUsageCountsFromSseText(
  streamText: string,
  mode: UpstreamMode,
  routedModel: string,
): UsageCounts {
  try {
    if (mode === "images") {
      return extractUsageFromResponsesSse(streamText, routedModel);
    }

    if (mode === "messages") {
      return extractUsageFromAnthropicSse(streamText);
    }

    if (
      mode === "responses"
      || mode === "openai_responses"
      || mode === "responses_passthrough"
      || mode === "openai_responses_passthrough"
    ) {
      return extractUsageFromResponsesSse(streamText, routedModel);
    }

    if (mode === "gemini_chat") {
      return extractUsageFromGeminiStream(streamText);
    }

    if (mode === "ollama_chat" || mode === "local_ollama_chat") {
      return extractUsageFromOllamaNdjson(streamText);
    }

    // chat_completions / openai_chat_completions — standard OpenAI SSE
    return extractUsageFromOpenAiChatSse(streamText);
  } catch {
    return {};
  }
}

function extractUsageFromGeminiStream(streamText: string): UsageCounts {
  let lastPayload: Record<string, unknown> | undefined;

  for (const line of streamText.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }

    if (trimmed === "data: [DONE]" || trimmed === "[DONE]") {
      continue;
    }

    const jsonText = trimmed.startsWith("data:")
      ? trimmed.slice("data:".length).trim()
      : trimmed;

    try {
      const parsed: unknown = JSON.parse(jsonText);
      if (isRecord(parsed)) {
        lastPayload = parsed;
      }
    } catch {
      // ignore parse errors while scanning stream
    }
  }

  return lastPayload ? usageCountsFromGeminiResponse(lastPayload) : {};
}

function extractUsageFromOpenAiChatSse(streamText: string): UsageCounts {
  const lines = streamText.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line.startsWith("data: ") || line === "data: [DONE]") {
      continue;
    }

    try {
      const payload: unknown = JSON.parse(line.slice(6));
      if (!isRecord(payload)) continue;
      const usage = isRecord(payload["usage"]) ? payload["usage"] : null;
      if (!usage) continue;

      const promptTokens = asNumber(usage["prompt_tokens"]);
      const completionTokens = asNumber(usage["completion_tokens"]);
      const totalTokens = asNumber(usage["total_tokens"])
        ?? (promptTokens !== undefined && completionTokens !== undefined ? promptTokens + completionTokens : undefined);

      if (promptTokens !== undefined || completionTokens !== undefined) {
        return { promptTokens, completionTokens, totalTokens };
      }
    } catch {
      continue;
    }
  }

  return {};
}

function extractUsageFromAnthropicSse(streamText: string): UsageCounts {
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  const chunks = streamText.split("\n\n");
  for (const chunk of chunks) {
    const dataLine = chunk.split("\n").find((l) => l.startsWith("data: "));
    if (!dataLine) continue;

    try {
      const payload: unknown = JSON.parse(dataLine.slice(6));
      if (!isRecord(payload)) continue;
      const type = asString(payload["type"]);

      if (type === "message_start") {
        const message = isRecord(payload["message"]) ? payload["message"] : null;
        const usage = message && isRecord(message["usage"]) ? message["usage"] : null;
        if (usage) {
          inputTokens = asNumber(usage["input_tokens"]) ?? inputTokens;
        }
      }

      if (type === "message_delta") {
        const usage = isRecord(payload["usage"]) ? payload["usage"] : null;
        if (usage) {
          outputTokens = asNumber(usage["output_tokens"]) ?? outputTokens;
        }
      }
    } catch {
      continue;
    }
  }

  if (inputTokens === undefined && outputTokens === undefined) {
    return {};
  }

  const promptTokens = inputTokens;
  const completionTokens = outputTokens ?? 0;
  const totalTokens = (promptTokens ?? 0) + completionTokens;

  return { promptTokens, completionTokens, totalTokens };
}

function extractUsageFromResponsesSse(streamText: string, routedModel: string): UsageCounts {
  try {
    const chatCompletion = responsesEventStreamToChatCompletion(streamText, routedModel);
    const counts = usageCountsFromCompletion(chatCompletion);
    const terminalResponse = extractTerminalResponseFromEventStream(streamText);
    const imageCount = terminalResponse ? imageCountFromResponsesPayload(terminalResponse) : undefined;
    if (imageCount !== undefined) {
      return { ...counts, imageCount };
    }
    return counts;
  } catch {
    return {};
  }
}

function extractUsageFromOllamaNdjson(streamText: string): UsageCounts {
  const lines = streamText.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const payload: unknown = JSON.parse(line);
      if (!isRecord(payload)) continue;
      if (payload["done"] !== true) continue;

      const promptTokens = asNumber(payload["prompt_eval_count"]);
      const completionTokens = asNumber(payload["eval_count"]);
      if (promptTokens !== undefined && completionTokens !== undefined) {
        return {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        };
      }
    } catch {
      continue;
    }
  }

  return {};
}

const ALWAYS_SSE_MODES: ReadonlySet<string> = new Set([
  "openai_responses",
  "openai_responses_passthrough",
  "openai_chat_completions",
]);

function responseLooksLikeEventStream(response: Response, mode: UpstreamMode): boolean {
  if (responseIsEventStream(response)) {
    return true;
  }
  if (ALWAYS_SSE_MODES.has(mode)) {
    return true;
  }
  return false;
}

async function extractUsageCounts(
  response: Response,
  mode: UpstreamMode,
  routedModel: string,
): Promise<UsageCounts> {
  if (!response.ok) {
    return {};
  }

  if (responseLooksLikeEventStream(response, mode)) {
    try {
      const streamText = await response.clone().text();
      return extractUsageCountsFromSseText(streamText, mode, routedModel);
    } catch {
      return {};
    }
  }

  try {
    const upstreamJson: unknown = await response.clone().json();
    return usageCountsForMode(mode, upstreamJson, routedModel);
  } catch {
    return {};
  }
}

async function updateUsageCountsFromResponse(
  requestLogStore: RequestLogStore,
  entryId: string,
  response: Response,
  mode: UpstreamMode,
  routedModel: string,
  providerId: string,
  config: ProxyConfig,
): Promise<void> {
  const readStartedAt = Date.now();
  const usageCounts = await extractUsageCounts(response, mode, routedModel);
  const readDurationMs = Math.max(0, Date.now() - readStartedAt);

  const imageCount = typeof usageCounts.imageCount === "number" && Number.isFinite(usageCounts.imageCount)
    ? usageCounts.imageCount
    : undefined;
  const imageCostUsd = imageCount !== undefined
    ? imageCount * resolveImageCostUsd(config, providerId)
    : undefined;

  if (
    usageCounts.promptTokens === undefined
    && usageCounts.completionTokens === undefined
    && usageCounts.totalTokens === undefined
    && usageCounts.cachedPromptTokens === undefined
    && imageCount === undefined
  ) {
    return;
  }

  const isStream = responseLooksLikeEventStream(response, mode);
  const tps = isStream
    && typeof usageCounts.completionTokens === "number"
    && Number.isFinite(usageCounts.completionTokens)
    && usageCounts.completionTokens > 0
    && readDurationMs > 0
      ? usageCounts.completionTokens / (readDurationMs / 1000)
      : undefined;

  const updatedCost = estimateRequestCost(
    providerId,
    routedModel,
    usageCounts.promptTokens ?? 0,
    usageCounts.completionTokens ?? 0,
  );

  requestLogStore.update(entryId, {
    ...usageCounts,
    imageCount,
    imageCostUsd,
    cacheHit: typeof usageCounts.cachedPromptTokens === "number" && usageCounts.cachedPromptTokens > 0,
    tps,
    costUsd: updatedCost.costUsd,
    energyJoules: updatedCost.energyJoules,
    waterEvaporatedMl: updatedCost.waterEvaporatedMl,
  });
}

const CODEX_RESPONSES_IMAGES_MODEL = "gpt-5.2-codex";

function buildCodexResponsesImagesBody(imagesBody: Record<string, unknown>): string {
  // The Responses API requires a text model that supports the image_generation tool,
  // not an image-specific model like gpt-image-1.
  const model = CODEX_RESPONSES_IMAGES_MODEL;
  const prompt = typeof imagesBody["prompt"] === "string" ? imagesBody["prompt"] : "";

  const tool: Record<string, unknown> = { type: "image_generation" };
  const size = imagesBody["size"];
  if (typeof size === "string" && size.length > 0) {
    tool["size"] = size;
  }
  const quality = imagesBody["quality"];
  if (typeof quality === "string" && quality.length > 0) {
    tool["quality"] = quality;
  }
  const background = imagesBody["background"];
  if (typeof background === "string" && background.length > 0) {
    tool["background"] = background;
  }
  const outputFormat = imagesBody["output_format"];
  if (typeof outputFormat === "string" && outputFormat.length > 0) {
    tool["output_format"] = outputFormat;
  }

  const responsesPayload: Record<string, unknown> = {
    model,
    input: prompt,
    instructions: "",
    tools: [tool],
    // Ensure we always invoke the image_generation tool for Images API compatibility.
    tool_choice: "required",
    store: false,
    stream: true,
  };

  return JSON.stringify(responsesPayload);
}

function extractImagesFromCodexResponse(responseBody: string): Record<string, unknown> | undefined {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseBody);
  } catch {
    return undefined;
  }

  if (!isRecord(data)) {
    return undefined;
  }

  // Handle SSE wrapper: extract the response object.
  if (typeof data["type"] === "string" && data["type"] === "response.completed" && isRecord(data["response"])) {
    data = data["response"] as Record<string, unknown>;
  }

  return extractImagesFromResponsesOutput(data);
}

function extractImagesFromCodexEventStream(streamText: string): Record<string, unknown> | undefined {
  const terminalResponse = extractTerminalResponseFromEventStream(streamText);
  if (!terminalResponse) {
    return undefined;
  }
  return extractImagesFromResponsesOutput(terminalResponse);
}

function extractImagesFromResponsesOutput(data: Record<string, unknown>): Record<string, unknown> | undefined {
  const output = Array.isArray(data["output"]) ? data["output"] : [];
  const images: Record<string, unknown>[] = [];

  for (const item of output) {
    if (!isRecord(item)) continue;
    if (item["type"] !== "image_generation_call") continue;
    const result = typeof item["result"] === "string" ? item["result"] : "";
    if (result.length === 0) continue;
    const revisedPrompt = typeof item["revised_prompt"] === "string" ? item["revised_prompt"] : undefined;
    images.push({ b64_json: result, ...(revisedPrompt ? { revised_prompt: revisedPrompt } : {}) });
  }

  if (images.length === 0) {
    return undefined;
  }

  return {
    created: Math.floor(Date.now() / 1000),
    data: images,
    background: "opaque",
  };
}


function openAiContentToText(content: unknown): string {
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

      if (isRecord(part) && typeof part.text === "string") {
        return part.text;
      }

      return "";
    })
    .join("");
}

export type {
  UpstreamMode,
  StrategyRequestContext,
  ProviderAttemptContext,
  LocalAttemptContext,
  ProviderAttemptOutcome,
  FallbackAccumulator,
  PreferredAffinity,
  BuildPayloadResult,
  ProviderStrategy,
}
export {
  PERMANENT_DISABLE_COOLDOWN_MS,
  joinUrl,
  dedupePaths,
  sleep,
  transientRetryDelayMs,
  shouldRetrySameCredentialForServerError,
  shouldCooldownCredentialOnAuthFailure,
  shouldPermanentlyDisableCredential,
  reorderCandidatesForAffinity,
  gptModelRequiresPaidPlan,
  providerAccountsForRequest,
  providerAccountsForRequestWithPolicy,
  providerUsesOpenAiChatCompletions,
  reorderAccountsForLatency,
  isRecord,
  asNumber,
  asString,
  asBoolean,
  updateFailedAttemptDiagnostics,
  stripTrailingAssistantPrefill,
  buildPayloadResult,
  buildRequestBodyForUpstream,
  ensureChatCompletionsUsageInStream,
  readHeaderValue,
  parseBooleanHeader,
  resolveRequestedServiceTier,
  applyRequestedServiceTier,
  recordAttempt,
  responseLooksLikeEventStream,
  updateUsageCountsFromResponse,
  buildCodexResponsesImagesBody,
  extractImagesFromCodexResponse,
  extractImagesFromCodexEventStream,
  extractImagesFromResponsesOutput,
  openAiContentToText,
}
