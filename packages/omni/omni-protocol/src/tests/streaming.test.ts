/**
 * @fileoverview Tests for stream event types and helpers
 */

import test from "ava";
import {
  createErrorEnvelope,
  createStreamEvent,
  createAgentLogEvent,
  createAgentStatusEvent,
  createHeartbeatEvent,
  createStreamEndEvent,
  isAgentLogEvent,
  isAgentStatusEvent,
  isHeartbeatEvent,
  isEndEvent,
} from "../index.js";
import {
  AgentLogEventSchema,
  AgentStatusEventSchema,
  StreamHeartbeatEventSchema,
  StreamEndEventSchema,
  StreamEventUnionSchema,
} from "../validation/index.js";

test("createStreamEvent creates valid event", (t) => {
  const event = createStreamEvent("test.event", { message: "hello" }, 1);

  t.is(event.event, "test.event");
  t.deepEqual(event.data, { message: "hello" });
  t.is(event.seq, 1);
  t.true(typeof event.ts === "string");
});

test("createAgentLogEvent creates valid agent log", (t) => {
  const event = createAgentLogEvent(
    "agent-001",
    "info",
    "Agent started successfully",
    1,
    { source: "agent-manager" },
  );

  t.is(event.event, "agent.log");
  t.is(event.data.agentId, "agent-001");
  t.is(event.data.level, "info");
  t.is(event.data.message, "Agent started successfully");
  t.is(event.data.source, "agent-manager");
  t.is(event.seq, 1);
});

test("createAgentStatusEvent creates valid agent status", (t) => {
  const event = createAgentStatusEvent("agent-002", "running", 2, {
    uptimeMs: 60000,
    metrics: { cpu: 0.5, memory: 0.3 },
  });

  t.is(event.event, "agent.status");
  t.is(event.data.agentId, "agent-002");
  t.is(event.data.status, "running");
  t.is(event.data.uptimeMs, 60000);
  t.deepEqual(event.data.metrics, { cpu: 0.5, memory: 0.3 });
  t.is(event.seq, 2);
});

test("createHeartbeatEvent creates valid heartbeat", (t) => {
  const event = createHeartbeatEvent(30000, 3);

  t.is(event.event, "stream.heartbeat");
  t.is(event.data.intervalMs, 30000);
  t.is(event.seq, 3);
});

test("createStreamEndEvent creates valid end event", (t) => {
  const event = createStreamEndEvent(true, 4);

  t.is(event.event, "stream.end");
  t.is(event.data.ok, true);
  t.is(event.data.error, undefined);
  t.is(event.seq, 4);
});

test("createStreamEndEvent with error", (t) => {
  const error = createErrorEnvelope("INTERNAL", "Stream failed");
  const event = createStreamEndEvent(false, 5, { error });

  t.is(event.event, "stream.end");
  t.is(event.data.ok, false);
  t.deepEqual(event.data.error, error);
  t.is(event.seq, 5);
});

// ============================================================================
// Stream Event Type Guards
// ============================================================================

test("isAgentLogEvent correctly identifies agent log events", (t) => {
  const logEvent = createAgentLogEvent("agent-001", "info", "test", 1);
  const statusEvent = createAgentStatusEvent("agent-001", "running", 2);

  t.true(isAgentLogEvent(logEvent));
  t.false(isAgentLogEvent(statusEvent));
});

test("isAgentStatusEvent correctly identifies agent status events", (t) => {
  const logEvent = createAgentLogEvent("agent-001", "info", "test", 1);
  const statusEvent = createAgentStatusEvent("agent-001", "running", 2);

  t.true(isAgentStatusEvent(statusEvent));
  t.false(isAgentStatusEvent(logEvent));
});

test("isHeartbeatEvent correctly identifies heartbeat events", (t) => {
  const heartbeatEvent = createHeartbeatEvent(30000, 1);
  const logEvent = createAgentLogEvent("agent-001", "info", "test", 2);

  t.true(isHeartbeatEvent(heartbeatEvent));
  t.false(isHeartbeatEvent(logEvent));
});

test("isEndEvent correctly identifies end events", (t) => {
  const endEvent = createStreamEndEvent(true, 1);
  const logEvent = createAgentLogEvent("agent-001", "info", "test", 2);

  t.true(isEndEvent(endEvent));
  t.false(isEndEvent(logEvent));
});

// ============================================================================
// Stream Event Validation
// ============================================================================

test("AgentLogEvent validation", (t) => {
  const event = createAgentLogEvent(
    "agent-001",
    "error",
    "Something went wrong",
    1,
  );
  const result = AgentLogEventSchema.safeParse(event);

  t.true(result.success);
  if (result.success) {
    t.is(result.data.event, "agent.log");
    t.is(result.data.data.agentId, "agent-001");
    t.is(result.data.data.level, "error");
    t.is(result.data.data.message, "Something went wrong");
  }
});

test("AgentStatusEvent validation", (t) => {
  const event = createAgentStatusEvent("agent-002", "stopped", 2);
  const result = AgentStatusEventSchema.safeParse(event);

  t.true(result.success);
  if (result.success) {
    t.is(result.data.event, "agent.status");
    t.is(result.data.data.agentId, "agent-002");
    t.is(result.data.data.status, "stopped");
  }
});

test("StreamHeartbeatEvent validation", (t) => {
  const event = createHeartbeatEvent(15000, 3);
  const result = StreamHeartbeatEventSchema.safeParse(event);

  t.true(result.success);
  if (result.success) {
    t.is(result.data.event, "stream.heartbeat");
    t.is(result.data.data.intervalMs, 15000);
  }
});

test("StreamEndEvent validation", (t) => {
  const event = createStreamEndEvent(false, 4, {
    error: createErrorEnvelope("DEADLINE_EXCEEDED", "Operation timed out"),
  });
  const result = StreamEndEventSchema.safeParse(event);

  t.true(result.success);
  if (result.success) {
    t.is(result.data.event, "stream.end");
    t.is(result.data.data.ok, false);
    t.is(result.data.data.error?.error.code, "DEADLINE_EXCEEDED");
  }
});

test("StreamEventUnion validation accepts all event types", (t) => {
  const events = [
    createAgentLogEvent("agent-001", "info", "test", 1),
    createAgentStatusEvent("agent-001", "running", 2),
    createHeartbeatEvent(30000, 3),
    createStreamEndEvent(true, 4),
  ];

  events.forEach((event) => {
    const result = StreamEventUnionSchema.safeParse(event);
    t.true(result.success);
  });
});
