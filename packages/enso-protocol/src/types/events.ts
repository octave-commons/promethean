import type { ChatMessage } from "./content.js";
import type {
  AssetCommitPayload,
  AssetDeletePayload,
  AssetDerivePayload,
  AssetDerivedPayload,
  AssetPut,
  AssetReadyPayload,
} from "./assets.js";
import type {
  CacheEvict,
  CacheHit,
  CacheMiss,
  CachePartial,
  CachePolicy,
  CachePut,
} from "./cache.js";
import type {
  FlowNackPayload,
  FlowPausePayload,
  FlowResumePayload,
} from "./flow.js";
import type { McpAnnouncePayload, McpMountPayload } from "./mcp.js";
import type { RoomPolicyPayload } from "./policy.js";
import type { PrivacyProfile } from "./privacy.js";
import type {
  ApprovalRequest,
  ContextDiff,
  ContextEntry,
  ContextInit,
  DataSourceId,
  DataSourceMeta,
} from "./context.js";
import type { VoiceMetaPayload } from "./voice.js";
import type { ToolAdvertisement, ToolCall, ToolResult } from "./tools.js";
import type { ActIntentDescriptor } from "./intents.js";

export type ChatMsgPayload = {
  readonly text: string;
  readonly format?: "md" | "plain";
  readonly threadId?: string;
};

export type PresenceJoinPayload = {
  readonly session: string;
  readonly caps?: readonly string[];
  readonly info?: Record<string, unknown>;
};

export type PresencePartPayload = {
  readonly session: string;
  readonly reason?: string;
};

export type CapsUpdatePayload = {
  readonly session: string;
  readonly caps: readonly string[];
  readonly revision: number;
  readonly granted?: readonly string[];
  readonly revoked?: readonly string[];
  readonly reason?: string;
  readonly requestId?: string;
  readonly acknowledgedAt?: string;
};

export type StatePatchPayload = {
  readonly room?: string;
  readonly diff?: unknown;
  readonly voice?: Record<string, "ok" | "degraded" | "paused">;
  readonly [key: string]: unknown;
};

export type ContentPostPayload = {
  readonly room: string;
  readonly message: ChatMessage;
  readonly replyTo?: string;
  readonly contextIds?: readonly string[];
};

export type ContentMessagePayload = {
  readonly messageId: string;
  readonly room: string;
  readonly message: ChatMessage;
  readonly related?: readonly string[];
};

export type ContentRetractPayload = {
  readonly messageIds: readonly string[];
  readonly reason?: string;
  readonly initiatedBy?: string;
};

export type ContentBurnPayload = {
  readonly messageId: string;
  readonly burnedAt: string;
  readonly by: string;
};

export type ToolPartialPayload = {
  readonly callId: string;
  readonly partial: unknown;
  readonly seq?: number;
  readonly done?: boolean;
};

export type DatasourceAddPayload = {
  readonly meta: DataSourceMeta;
};

export type DatasourceUpdatePayload = {
  readonly id: DataSourceId;
  readonly patch: Partial<DataSourceMeta>;
};

export type ContextCreatePayload = {
  readonly ctx: ContextInit;
};

export type ContextAddPayload = {
  readonly ctxId: string;
  readonly entry: ContextEntry;
};

export type ContextApplyPayload = {
  readonly ctxId: string;
};

export type ContextPinPayload = {
  readonly ctxId: string;
  readonly id: DataSourceId;
};

export type ContextActivatePayload = ContextPinPayload;
export type ContextIgnorePayload = ContextPinPayload;
export type ContextDiffPayload = ContextDiff;

export type ApprovalRequestPayload = Readonly<ApprovalRequest>;

export type ApprovalGrantPayload = {
  readonly approvalId: string;
  readonly grantedBy: string;
  readonly grantedAt: string;
  readonly status: "granted" | "denied";
  readonly note?: string;
};

export type ActRationalePayload = {
  readonly callId: string;
  readonly rationale: string;
  readonly evidence?: readonly string[];
};

export type ActIntentPayload = {
  readonly intents: readonly ActIntentDescriptor[];
  readonly scope?: string;
  readonly callId?: string;
  readonly justification?: string;
};

export type PrivacyAcceptedPayload = {
  readonly profile: PrivacyProfile;
  readonly wantsE2E?: boolean;
  readonly allowLogging?: boolean;
  readonly allowTelemetry?: boolean;
};

export type ConsentRecordPayload = {
  readonly consentId: string;
  readonly subject: string;
  readonly action: string;
  readonly granted: boolean;
  readonly scope?: string;
  readonly issuedAt: string;
  readonly expiresAt?: string;
  readonly issuedBy: string;
  readonly context?: Record<string, unknown>;
};

export type StreamResumePayload = {
  readonly scid: string;
  readonly seq: number;
};

export type EventPayloadMap = {
  readonly "chat.msg": ChatMsgPayload;
  readonly "content.post": ContentPostPayload;
  readonly "content.message": ContentMessagePayload;
  readonly "content.retract": ContentRetractPayload;
  readonly "content.burn": ContentBurnPayload;
  readonly "presence.join": PresenceJoinPayload;
  readonly "presence.part": PresencePartPayload;
  readonly "caps.update": CapsUpdatePayload;
  readonly "state.patch": StatePatchPayload;
  readonly "tool.advertise": ToolAdvertisement;
  readonly "tool.call": ToolCall;
  readonly "tool.result": ToolResult;
  readonly "tool.partial": ToolPartialPayload;
  readonly "voice.meta": VoiceMetaPayload;
  readonly "flow.nack": FlowNackPayload;
  readonly "flow.pause": FlowPausePayload;
  readonly "flow.resume": FlowResumePayload;
  readonly "stream.resume": StreamResumePayload;
  readonly "asset.put": AssetPut;
  readonly "asset.commit": AssetCommitPayload;
  readonly "asset.ready": AssetReadyPayload;
  readonly "asset.derive": AssetDerivePayload;
  readonly "asset.derived": AssetDerivedPayload;
  readonly "asset.delete": AssetDeletePayload;
  readonly "cache.put": CachePut;
  readonly "cache.hit": CacheHit;
  readonly "cache.miss": CacheMiss;
  readonly "cache.evict": CacheEvict;
  readonly "cache.partial": CachePartial;
  readonly "cache.policy": CachePolicy;
  readonly "datasource.add": DatasourceAddPayload;
  readonly "datasource.update": DatasourceUpdatePayload;
  readonly "context.create": ContextCreatePayload;
  readonly "context.add": ContextAddPayload;
  readonly "context.apply": ContextApplyPayload;
  readonly "context.pin": ContextPinPayload;
  readonly "context.activate": ContextActivatePayload;
  readonly "context.ignore": ContextIgnorePayload;
  readonly "context.diff": ContextDiffPayload;
  readonly "approval.request": ApprovalRequestPayload;
  readonly "approval.grant": ApprovalGrantPayload;
  readonly "act.rationale": ActRationalePayload;
  readonly "act.intent": ActIntentPayload;
  readonly "privacy.accepted": PrivacyAcceptedPayload;
  readonly "room.policy": RoomPolicyPayload;
  readonly "consent.record": ConsentRecordPayload;
  readonly "mcp.mount": McpMountPayload;
  readonly "mcp.announce": McpAnnouncePayload;
};

export type EnsoEventType = keyof EventPayloadMap;

export type EnsoEvent<K extends EnsoEventType = EnsoEventType> = {
  readonly type: K;
  readonly payload: EventPayloadMap[K];
};

export type EventOf<K extends EnsoEventType> = EnsoEvent<K>;

export type ChatMsgEvent = EventOf<"chat.msg">;
export type ContentPostEvent = EventOf<"content.post">;
export type ContentMessageEvent = EventOf<"content.message">;
export type ContentRetractEvent = EventOf<"content.retract">;
export type ContentBurnEvent = EventOf<"content.burn">;
export type PresenceJoinEvent = EventOf<"presence.join">;
export type PresencePartEvent = EventOf<"presence.part">;
export type CapsUpdateEvent = EventOf<"caps.update">;
export type StatePatchEvent = EventOf<"state.patch">;
export type ToolAdvertiseEvent = EventOf<"tool.advertise">;
export type ToolCallEvent = EventOf<"tool.call">;
export type ToolResultEvent = EventOf<"tool.result">;
export type ToolPartialEvent = EventOf<"tool.partial">;
export type VoiceMetaEvent = EventOf<"voice.meta">;
export type FlowNackEvent = EventOf<"flow.nack">;
export type FlowPauseEvent = EventOf<"flow.pause">;
export type FlowResumeEvent = EventOf<"flow.resume">;
export type StreamResumeEvent = EventOf<"stream.resume">;
export type AssetPutEvent = EventOf<"asset.put">;
export type AssetCommitEvent = EventOf<"asset.commit">;
export type AssetReadyEvent = EventOf<"asset.ready">;
export type AssetDeriveEvent = EventOf<"asset.derive">;
export type AssetDerivedEvent = EventOf<"asset.derived">;
export type AssetDeleteEvent = EventOf<"asset.delete">;
export type CachePutEvent = EventOf<"cache.put">;
export type CacheHitEvent = EventOf<"cache.hit">;
export type CacheMissEvent = EventOf<"cache.miss">;
export type CacheEvictEvent = EventOf<"cache.evict">;
export type CachePartialEvent = EventOf<"cache.partial">;
export type CachePolicyEvent = EventOf<"cache.policy">;
export type DatasourceAddEvent = EventOf<"datasource.add">;
export type DatasourceUpdateEvent = EventOf<"datasource.update">;
export type ContextCreateEvent = EventOf<"context.create">;
export type ContextAddEvent = EventOf<"context.add">;
export type ContextApplyEvent = EventOf<"context.apply">;
export type ContextPinEvent = EventOf<"context.pin">;
export type ContextActivateEvent = EventOf<"context.activate">;
export type ContextIgnoreEvent = EventOf<"context.ignore">;
export type ContextDiffEvent = EventOf<"context.diff">;
export type ApprovalRequestEvent = EventOf<"approval.request">;
export type ApprovalGrantEvent = EventOf<"approval.grant">;
export type ActRationaleEvent = EventOf<"act.rationale">;
export type ActIntentEvent = EventOf<"act.intent">;
export type PrivacyAcceptedEvent = EventOf<"privacy.accepted">;
export type RoomPolicyEvent = EventOf<"room.policy">;
export type ConsentRecordEvent = EventOf<"consent.record">;
export type McpMountEvent = EventOf<"mcp.mount">;
export type McpAnnounceEvent = EventOf<"mcp.announce">;
