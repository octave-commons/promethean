import type { CephalonCircuitConfig } from "../circuits.js";
import type {
  CephalonEvent,
  CephalonTickRequestedPayload,
  SystemTickPayload,
  TemporalScheduleArmPayload,
  TemporalScheduleFiredPayload,
} from "../types/index.js";

export const CIRCUIT_TICK_SCHEDULE_KIND = "circuit-tick";

function stableHash32(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function computeDeterministicJitterMs(seed: string, maxJitterMs: number): number {
  const boundedMax = Number.isFinite(maxJitterMs)
    ? Math.max(0, Math.floor(maxJitterMs))
    : 0;

  if (boundedMax === 0) {
    return 0;
  }

  return stableHash32(seed) % (boundedMax + 1);
}

export function resolveInitialCircuitTickDelayMs(options: {
  botId: string;
  sessionId: string;
  intervalMs: number;
  maxJitterMs: number;
}): number {
  const intervalMs = Math.max(1, Math.floor(options.intervalMs));
  const boundedMaxJitterMs = Math.min(
    Math.max(0, Math.floor(options.maxJitterMs)),
    Math.max(0, intervalMs - 1000),
  );

  return intervalMs + computeDeterministicJitterMs(
    `${options.botId}:${options.sessionId}`,
    boundedMaxJitterMs,
  );
}

export function buildCircuitTickScheduleId(sessionId: string): string {
  return `cephalon:${sessionId}:tick`;
}

export function buildTemporalScheduleArmPayload(options: {
  scheduleId: string;
  scheduleKind: string;
  subjectId?: string;
  delayMs: number;
  intervalMs?: number;
  armedAt?: number;
  metadata?: Record<string, unknown>;
}): TemporalScheduleArmPayload {
  const armedAt = options.armedAt ?? Date.now();
  return {
    scheduleId: options.scheduleId,
    scheduleKind: options.scheduleKind,
    subjectId: options.subjectId,
    armedAt,
    delayMs: options.delayMs,
    dueAt: armedAt + options.delayMs,
    intervalMs: options.intervalMs,
    metadata: options.metadata,
  };
}

export function buildTemporalScheduleFiredPayload(options: {
  scheduleId: string;
  scheduleKind: string;
  subjectId?: string;
  dueAt: number;
  intervalMs?: number;
  firedAt?: number;
  metadata?: Record<string, unknown>;
}): TemporalScheduleFiredPayload {
  return {
    scheduleId: options.scheduleId,
    scheduleKind: options.scheduleKind,
    subjectId: options.subjectId,
    dueAt: options.dueAt,
    firedAt: options.firedAt ?? Date.now(),
    intervalMs: options.intervalMs,
    metadata: options.metadata,
  };
}

export function buildCephalonTickRequestedPayload(options: {
  sessionId: string;
  circuit: CephalonCircuitConfig;
  tickNumber: number;
  temporal: TemporalScheduleFiredPayload;
  graphSummary?: string;
  rssSummary?: string;
  eidolonSummary?: string;
  promptFieldSummary?: string;
  promptFieldOverlay?: string;
  suggestedChannel?: string;
  recentActivity?: SystemTickPayload["recentActivity"];
}): CephalonTickRequestedPayload {
  return {
    sessionId: options.sessionId,
    intervalMs: options.circuit.intervalMs,
    tickNumber: options.tickNumber,
    loopId: options.circuit.id,
    loopLabel: options.circuit.label,
    circuitIndex: options.circuit.circuitIndex,
    modelName: options.circuit.modelName,
    reasoningEffort: options.circuit.reasoningEffort,
    defaultChannelHints: options.circuit.defaultChannelHints,
    graphSummary: options.graphSummary,
    rssSummary: options.rssSummary,
    eidolonSummary: options.eidolonSummary,
    promptFieldSummary: options.promptFieldSummary,
    promptFieldOverlay: options.promptFieldOverlay,
    suggestedChannel: options.suggestedChannel,
    recentActivity: options.recentActivity,
    reflectionPrompt: options.circuit.reflectionPrompt,
    scheduleId: options.temporal.scheduleId,
    scheduleKind: options.temporal.scheduleKind,
    dueAt: options.temporal.dueAt,
    firedAt: options.temporal.firedAt,
    compatibilityMode: true,
  };
}

export function translateTickRequestedToLegacyTickEvent(options: {
  id: string;
  timestamp: number;
  payload: CephalonTickRequestedPayload;
}): CephalonEvent {
  const { sessionId, ...legacyPayload } = options.payload;
  return {
    id: options.id,
    type: "system.tick",
    timestamp: options.timestamp,
    sessionId,
    payload: legacyPayload,
  };
}
