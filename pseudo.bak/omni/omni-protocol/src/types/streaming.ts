/**
 * @fileoverview Stream event definitions for Omni protocol
 */

import type { Agents } from "./methods.js";
import type { ErrorEnvelope } from "./envelopes.js";

// ============================================================================
// Base Stream Event Types
// ============================================================================

/**
 * Base stream event interface
 */
export interface StreamEvent<T extends string, D> {
  /** Event type/name */
  event: T;

  /** Event data payload */
  data: D;

  /** ISO8601 UTC timestamp */
  ts: string;

  /** Monotonically increasing sequence number per stream */
  seq: number;
}

/**
 * Stream heartbeat event
 */
export interface StreamHeartbeatEvent
  extends StreamEvent<
    "stream.heartbeat",
    {
      /** Heartbeat interval in milliseconds */
      intervalMs: number;
    }
  > {}

/**
 * Stream end event (terminal)
 */
export interface StreamEndEvent
  extends StreamEvent<
    "stream.end",
    {
      /** Whether the stream ended successfully */
      ok: boolean;

      /** Error information if stream ended due to error */
      error?: ErrorEnvelope;
    }
  > {}

// ============================================================================
// Agent Stream Events
// ============================================================================

/**
 * Agent log event data
 */
export interface AgentLogEventData {
  /** Agent identifier */
  agentId: string;

  /** Log level */
  level: "debug" | "info" | "warn" | "error";

  /** Log message */
  message: string;

  /** Whether this is a chunk of a larger message */
  chunk?: boolean;

  /** Source component */
  source?: string;
}

/**
 * Agent log stream event
 */
export interface AgentLogEvent
  extends StreamEvent<"agent.log", AgentLogEventData> {}

/**
 * Agent status event data
 */
export interface AgentStatusEventData {
  /** Agent identifier */
  agentId: string;

  /** Current status */
  status: Agents.AgentStatus["status"];

  /** Uptime in milliseconds */
  uptimeMs?: number;

  /** Additional metrics */
  metrics?: Record<string, number>;
}

/**
 * Agent status stream event
 */
export interface AgentStatusEvent
  extends StreamEvent<"agent.status", AgentStatusEventData> {}

// ============================================================================
// Indexer Stream Events (Reserved)
// ============================================================================

/**
 * Indexer progress event data
 */
export interface IndexerProgressEventData {
  /** Shard identifier */
  shard: string;

  /** Number of completed items */
  completed: number;

  /** Total number of items */
  total: number;

  /** Progress percentage (0-100) */
  progress?: number;

  /** Current operation */
  operation?: string;
}

/**
 * Indexer progress stream event (reserved for future use)
 */
export interface IndexerProgressEvent
  extends StreamEvent<"indexer.progress", IndexerProgressEventData> {}

// ============================================================================
// Union Types
// ============================================================================

/**
 * Union of all possible stream event types
 */
export type StreamEventUnion =
  | StreamHeartbeatEvent
  | StreamEndEvent
  | AgentLogEvent
  | AgentStatusEvent
  | IndexerProgressEvent;

/**
 * Type guard to check if a stream event is an agent log event
 */
export function isAgentLogEvent(
  event: StreamEventUnion,
): event is AgentLogEvent {
  return event.event === "agent.log";
}

/**
 * Type guard to check if a stream event is an agent status event
 */
export function isAgentStatusEvent(
  event: StreamEventUnion,
): event is AgentStatusEvent {
  return event.event === "agent.status";
}

/**
 * Type guard to check if a stream event is a heartbeat event
 */
export function isHeartbeatEvent(
  event: StreamEventUnion,
): event is StreamHeartbeatEvent {
  return event.event === "stream.heartbeat";
}

/**
 * Type guard to check if a stream event is an end event
 */
export function isEndEvent(event: StreamEventUnion): event is StreamEndEvent {
  return event.event === "stream.end";
}

/**
 * Type guard to check if a stream event is an indexer progress event
 */
export function isIndexerProgressEvent(
  event: StreamEventUnion,
): event is IndexerProgressEvent {
  return event.event === "indexer.progress";
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a stream event
 */
export function createStreamEvent<T extends string, D>(
  eventType: T,
  data: D,
  seq: number,
  timestamp?: string,
): StreamEvent<T, D> {
  return {
    event: eventType,
    data,
    ts: timestamp || new Date().toISOString(),
    seq,
  };
}

/**
 * Create an agent log event
 */
export function createAgentLogEvent(
  agentId: string,
  level: AgentLogEventData["level"],
  message: string,
  seq: number,
  options?: {
    chunk?: boolean;
    source?: string;
    timestamp?: string;
  },
): AgentLogEvent {
  return createStreamEvent(
    "agent.log",
    {
      agentId,
      level,
      message,
      chunk: options?.chunk,
      source: options?.source,
    },
    seq,
    options?.timestamp,
  );
}

/**
 * Create an agent status event
 */
export function createAgentStatusEvent(
  agentId: string,
  status: AgentStatusEventData["status"],
  seq: number,
  options?: {
    uptimeMs?: number;
    metrics?: Record<string, number>;
    timestamp?: string;
  },
): AgentStatusEvent {
  return createStreamEvent(
    "agent.status",
    {
      agentId,
      status,
      uptimeMs: options?.uptimeMs,
      metrics: options?.metrics,
    },
    seq,
    options?.timestamp,
  );
}

/**
 * Create a heartbeat event
 */
export function createHeartbeatEvent(
  intervalMs: number,
  seq: number,
  timestamp?: string,
): StreamHeartbeatEvent {
  return createStreamEvent("stream.heartbeat", { intervalMs }, seq, timestamp);
}

/**
 * Create a stream end event
 */
export function createStreamEndEvent(
  ok: boolean,
  seq: number,
  options?: {
    error?: ErrorEnvelope;
    timestamp?: string;
  },
): StreamEndEvent {
  return createStreamEvent(
    "stream.end",
    {
      ok,
      error: options?.error,
    },
    seq,
    options?.timestamp,
  );
}

/**
 * Create an indexer progress event
 */
export function createIndexerProgressEvent(
  shard: string,
  completed: number,
  total: number,
  seq: number,
  options?: {
    progress?: number;
    operation?: string;
    timestamp?: string;
  },
): IndexerProgressEvent {
  return createStreamEvent(
    "indexer.progress",
    {
      shard,
      completed,
      total,
      progress: options?.progress,
      operation: options?.operation,
    },
    seq,
    options?.timestamp,
  );
}
