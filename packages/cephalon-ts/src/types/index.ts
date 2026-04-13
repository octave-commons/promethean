/**
 * Core type definitions for Cephalon
 * 
 * Based on the MVP specification:
 * - Memory records with full metadata
 * - Event types for the event bus
 * - Policy configuration types
 */

export type UUID = string;
export type Millis = number;

// ============================================================================
// Memory Types
// ============================================================================

export type Role = 'user' | 'assistant' | 'system' | 'developer' | 'tool';

export type MemoryKind = 
  | 'message' 
  | 'tool_call' 
  | 'tool_result' 
  | 'think' 
  | 'image' 
  | 'summary' 
  | 'admin' 
  | 'aggregate'
  | 'system'
  | 'developer';

export type SourceType = 'discord' | 'irc' | 'cli' | 'timer' | 'system' | 'admin' | 'sensor';

export interface MemoryContent {
  text: string;
  normalizedText?: string;
  snippets?: string[];
}

export interface MemorySource {
  type: SourceType;
  guildId?: string;
  channelId?: string;
  authorId?: string;
  authorIsBot?: boolean;
}

export interface MemoryCluster {
  clusterId?: string;
  threadId?: string;
  spamFamilyId?: string;
  parentMemoryId?: UUID;
  sourceMessageId?: string;
}

export interface MemoryRetrieval {
  pinned: boolean;
  lockedByAdmin: boolean;
  lockedBySystem: boolean;
  weightKind: number;
  weightSource: number;
}

export interface MemoryUsage {
  includedCountTotal: number;
  includedCountDecay: number;
  lastIncludedAt: number;
}

export interface MemoryEmbedding {
  status: 'none' | 'ready' | 'stale' | 'deleted';
  model?: string;
  vectorId?: string;
  dims?: number;
  embeddedAt?: number;
  vector?: number[];  // Only present when retrieved
}

export interface MemoryLifecycle {
  deleted: boolean;
  deletedAt?: number;
  replacedBySummaryId?: UUID;
}

export interface MemoryHashes {
  contentHash: string;
  normalizedHash?: string;
}

export interface Memory {
  id: UUID;
  timestamp: Millis;
  cephalonId: string;
  sessionId: string;
  eventId: UUID | null;
  role: Role;
  kind: MemoryKind;
  content: MemoryContent;
  source: MemorySource;
  cluster?: MemoryCluster;
  retrieval: MemoryRetrieval;
  usage: MemoryUsage;
  embedding: MemoryEmbedding;
  lifecycle: MemoryLifecycle;
  hashes: MemoryHashes;
  schemaVersion: number;
}

// ============================================================================
// Event Types
// ============================================================================

export type CephalonEventType =
  | 'discord.message.created'
  | 'discord.message.edited'
  | 'discord.message.deleted'
  | 'tool.call'
  | 'tool.result'
  | 'llm.assistant.message'
  | 'llm.think.trace'
  | 'system.tick'
  | 'system.proactive'
  | 'temporal.schedule.arm'
  | 'temporal.schedule.fired'
  | 'cephalon.tick.requested'
  | 'admin.command'
  | 'memory.summary.created'
  | 'memory.compaction.deleted';

export interface DiscordMessagePayload {
  platform?: 'discord' | 'irc';
  guildId: string;
  channelId: string;
  messageId: string;
  authorId: string;
  authorIsBot: boolean;
  content: string;
  embeds: unknown[];
  attachments: unknown[];
  authorUsername?: string;
  authorDiscriminator?: string;
  normalized?: unknown;
  timestamp?: number;
  replyTo?: string | null;
  channelName?: string;
  guildName?: string;
  mentionUserIds?: string[];
  mentionsCephalon?: boolean;
}

export interface ToolCallPayload {
  toolName: string;
  args: Record<string, unknown>;
  callId: string;
}

export interface ToolResultPayload {
  toolName: string;
  callId: string;
  result: unknown;
  error?: string;
}

export interface LLMAssistantPayload {
  content: string;
  model: string;
  tokensUsed: number;
}

export interface SystemTickPayload {
  intervalMs: number;
  tickNumber: number;
  loopId?: string;
  loopLabel?: string;
  circuitIndex?: number;
  modelName?: string;
  reasoningEffort?: Session['reasoningEffort'];
  defaultChannelHints?: string[];
  graphSummary?: string;
  rssSummary?: string;
  eidolonSummary?: string;
  promptFieldSummary?: string;
  promptFieldOverlay?: string;
  suggestedChannel?: string;
  recentActivity?: Array<{
    type: string;
    preview: string;
    timestamp?: number;
  }>;
  reflectionPrompt?: string;
  scheduleId?: string;
  scheduleKind?: string;
  dueAt?: number;
  firedAt?: number;
  compatibilityMode?: boolean;
}

export interface TemporalScheduleArmPayload {
  scheduleId: string;
  scheduleKind: string;
  subjectId?: string;
  armedAt: number;
  dueAt: number;
  delayMs: number;
  intervalMs?: number;
  metadata?: Record<string, unknown>;
}

export interface TemporalScheduleFiredPayload {
  scheduleId: string;
  scheduleKind: string;
  subjectId?: string;
  dueAt: number;
  firedAt: number;
  intervalMs?: number;
  metadata?: Record<string, unknown>;
}

export interface CephalonTickRequestedPayload extends SystemTickPayload {
  sessionId: string;
  scheduleId: string;
  scheduleKind: string;
  dueAt: number;
  firedAt: number;
}

export interface AdminCommandPayload {
  command: string;
  args: string[];
  adminId: string;
}

export interface ProactivePayload {
  channelId: string;
  content: string;
  authorId: string;
  authorIsBot: boolean;
}

export type EventPayload =
  | DiscordMessagePayload
  | ToolCallPayload
  | ToolResultPayload
  | LLMAssistantPayload
  | SystemTickPayload
  | TemporalScheduleArmPayload
  | TemporalScheduleFiredPayload
  | CephalonTickRequestedPayload
  | AdminCommandPayload
  | ProactivePayload;

// ============================================================================
// Policy Types
// ============================================================================

export interface ModelConfig {
  name: string;
  maxContextTokens: number;
  toolCallStrict?: boolean;
}

export interface ContextBudgets {
  systemDevPct: number;
  persistentPct: number;
  recentPct: number;
  relatedPct: number;
}

export interface ContextInvariants {
  relatedGteRecentMult: number;
  dedupeWithinContext: boolean;
}

export interface ContextPolicy {
  budgets: ContextBudgets;
  invariants: ContextInvariants;
}

export interface NormalizePolicy {
  volatileRewrites: Array<[string, string]>;  // [regex pattern, replacement]
  stripTrackingParams: boolean;
}

export interface DedupePolicy {
  exactTtlSeconds: number;
  nearWindowSeconds: number;
  simhashHammingThreshold: number;
  aggregateBotDupes: boolean;
}

export interface ChannelPolicy {
  name: string;
  embedRawBotMessages: boolean;
  embedAggregates: boolean;
}

export interface AccessPolicy {
  tauDays: number;
  threshold: number;
}

export interface GroupingPolicy {
  by: Array<'channel-id' | 'day' | 'thread'>;
  maxSourceCount: number;
  maxSourceTokens: number;
}

export interface SummaryPolicy {
  format: 'json_v1';
  maxBullets: number;
  maxPatterns: number;
  indexSummary: boolean;
}

export interface LocksPolicy {
  neverDeleteKinds: Set<MemoryKind>;
  neverDeleteTags: Set<string>;
}

export interface CompactionPolicy {
  intervalMinutes: number;
  ageMinDays: number;
  access: AccessPolicy;
  grouping: GroupingPolicy;
  summary: SummaryPolicy;
  locks: LocksPolicy;
}

export interface SpamChannelPolicy {
  embedAggregates: boolean;
  embedRawBotMessages: boolean;
}

export interface SpamPolicy {
  dedupe: DedupePolicy;
  channels: Record<string, SpamChannelPolicy>;
}

export interface JanitorPolicy {
  enabled: boolean;
  reportChannelId: string;
  reportIntervalMinutes: number;
  maxActionsPerHour: number;
  proposeSuppressRules: boolean;
}

export interface OutputPolicy {
  defaultChannelId?: string;
  preventFeedbackLoops: boolean;
  ignoredAuthorIds: string[];
}

export interface CephalonPolicy {
  models: {
    actor: ModelConfig;
    fallbacks: ModelConfig[];
  };
  context: ContextPolicy;
  normalize: NormalizePolicy;
  dedupe: DedupePolicy;
  channels: Record<string, ChannelPolicy>;
  compaction: CompactionPolicy;
  spam: SpamPolicy;
  janitor: JanitorPolicy;
  output: OutputPolicy;
}

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  id: string;
  cephalonId: string;
  priorityClass: 'interactive' | 'operational' | 'maintenance';
  credits: number;
  recentBuffer: Memory[];
  subscriptionFilter?: (event: CephalonEventType) => boolean;
  toolPermissions: Set<string>;
  persona?: string;
  systemPrompt?: string;
  developerPrompt?: string;
  attentionFocus?: string;
  circuitIndex?: number;
  modelName?: string;
  reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh';
  loopIntervalMs?: number;
  defaultChannelHints?: string[];
  homeChannelId?: string;
  retrievalContextHint?: string;
  retrievalKeywords?: string[];
}

export interface CephalonEvent {
  id: UUID;
  type: CephalonEventType;
  timestamp: Millis;
  sessionId?: string;
  payload: EventPayload;
}

// ============================================================================
// Context Assembly Types
// ============================================================================

export interface ContextBudgetResult {
  sys: number;
  persistent: number;
  recent: number;
  related: number;
  safety: number;
}

export interface ContextItem {
  memory: Memory;
  estimatedTokens: number;
  bucket: 'persistent' | 'related' | 'recent';
}

export interface InclusionLogItem {
  memoryId: UUID;
  tokens: number;
  bucket: 'persistent' | 'related' | 'recent';
}

export interface InclusionLog {
  contextId: UUID;
  sessionId: string;
  timestamp: Millis;
  windowTokens: number;
  items: InclusionLogItem[];
}

export interface AssembledContext {
  contextId: UUID;
  messages: ChatMessage[];
  inclusionLog: InclusionLog;
  totalTokens: number;
}

// ============================================================================
// Retrieval Types
// ============================================================================

export interface QueryEmbedding {
  text: string;
  vector: number[];
}

export interface ScoredMemory {
  memory: Memory;
  score: number;
  similarity: number;
  recencyBoost: number;
}

export interface ScoringPolicy {
  alpha: number;
  tauDays: number;
  kindWeights: Record<MemoryKind, number>;
}

// ============================================================================
// Chat Message Types (for LLM Provider)
// ============================================================================
// Chat Message Types (for LLM Provider)
// ============================================================================

export interface OllamaToolCall {
  id?: string;
  type: "function";
  function: { name: string; arguments: Record<string, unknown>; index?: number };
}

// Image content for Ollama native API (raw base64, no data URI prefix)
export interface OllamaImageContent {
  type: "image";
  data: string;
}

// Text content for multimodal messages
export interface OllamaTextContent {
  type: "text";
  text: string;
}

// Message content union (supports multimodal)
export type OllamaMessageContent = string | Array<OllamaTextContent | OllamaImageContent>;

// ChatMessage with optional images array for Ollama native API
export type ChatMessage =
  | { role: "system" | "developer" | "user" | "assistant"; content?: OllamaMessageContent; tool_calls?: OllamaToolCall[]; images?: string[] }
  | { role: "tool"; tool_name: string; content: string; tool_call_id?: string; call_id?: string };

// ============================================================================
// Tool Types
// ============================================================================

export interface ToolCall {
  type: 'tool_call';
  name: string;
  args: Record<string, unknown>;
  callId: string;  // Unique identifier for this tool call
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export interface SessionManagerConfig {
  concurrency: number;
  lanes: {
    interactive: { turns: number; toolCalls: number };
    operational: { turns: number; toolCalls: number };
    maintenance: { turns: number; toolCalls: number };
  };
  credits: {
    refillPerSecond: number;
    max: number;
    cost: {
      interactive: number;
      operational: number;
      maintenance: number;
    };
  };
  queue: {
    maxPerSession: number;
    dropPolicy: 'drop_oldest' | 'drop_newest';
  };
}

export interface ProactiveTask {
  id: string;
  description: string;
  toolCall?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export interface ProactiveBehaviorConfig {
  pauseMs: number;
  tasks: ProactiveTask[];
  sessionId: string;
  emitToolResultsAsEvents?: boolean;
}

export interface ChromaConfig {
  url: string;
  collectionName: string;
}

export interface EmbeddingConfig {
  baseUrl: string;
  model: string;
  contextSize: number;
  apiKey?: string;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

// ============================================================================
// Normalization Types
// ============================================================================


export interface AttachmentSignature {
  count: number;
  types: string[];
  sizeBuckets: string[];
}

export interface EmbedSignature {
  count: number;
  primaryUrlToken?: string;
  titleHash?: string;
  descriptionHash?: string;
}

export interface NormalizedDiscordMessage {
  normalizedText: string;
  signature: {
    authorKind: 'bot' | 'human';
    channelId: string;
    normalizedText: string;
    attachmentSig: AttachmentSignature;
    embedSig: EmbedSignature;
  };
  features: {
    tokens: string[];
    simhash: bigint | string;  // Can be bigint or string (for JSON serialization)
    hasUrl: boolean;
    mentionCount: number;
  };
  exactHash: string;
}
