import test from "ava";

import type { CephalonCircuitConfig } from "../circuits.js";
import {
  CIRCUIT_TICK_SCHEDULE_KIND,
  buildCephalonTickRequestedPayload,
  buildCircuitTickScheduleId,
  buildTemporalScheduleArmPayload,
  buildTemporalScheduleFiredPayload,
  computeDeterministicJitterMs,
  resolveInitialCircuitTickDelayMs,
  translateTickRequestedToLegacyTickEvent,
} from "./temporal.js";

const circuit: CephalonCircuitConfig = {
  id: "c1-survival",
  label: "Circuit I — Aionian",
  circuitIndex: 1,
  priorityClass: "interactive",
  intervalMs: 45_000,
  modelName: "auto:cheapest",
  reasoningEffort: "low",
  attentionFocus: "liveness",
  persona: "watcher",
  systemPrompt: "system",
  developerPrompt: "developer",
  toolPermissions: ["memory.lookup"],
  reflectionPrompt: "reflect",
  defaultChannelHints: ["general"],
};

test("buildTemporalScheduleArmPayload derives dueAt from delay", (t) => {
  const payload = buildTemporalScheduleArmPayload({
    scheduleId: buildCircuitTickScheduleId("c1-survival"),
    scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
    subjectId: "c1-survival",
    delayMs: 1500,
    intervalMs: circuit.intervalMs,
    armedAt: 100,
    metadata: { circuitId: circuit.id },
  });

  t.is(payload.scheduleId, "cephalon:c1-survival:tick");
  t.is(payload.scheduleKind, CIRCUIT_TICK_SCHEDULE_KIND);
  t.is(payload.subjectId, "c1-survival");
  t.is(payload.armedAt, 100);
  t.is(payload.dueAt, 1600);
  t.is(payload.intervalMs, 45_000);
  t.deepEqual(payload.metadata, { circuitId: circuit.id });
});

test("buildCephalonTickRequestedPayload carries temporal metadata into the tick request", (t) => {
  const temporal = buildTemporalScheduleFiredPayload({
    scheduleId: buildCircuitTickScheduleId("c1-survival"),
    scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
    subjectId: "c1-survival",
    dueAt: 1600,
    firedAt: 1700,
    intervalMs: circuit.intervalMs,
  });

  const payload = buildCephalonTickRequestedPayload({
    sessionId: "c1-survival",
    circuit,
    tickNumber: 3,
    temporal,
    graphSummary: "graph",
    rssSummary: "rss",
    eidolonSummary: "eidolon",
    promptFieldSummary: "prompt-field",
    promptFieldOverlay: "overlay",
    suggestedChannel: "general",
    recentActivity: [{ type: "discord.message.created", preview: "hello", timestamp: 1234 }],
  });

  t.is(payload.sessionId, "c1-survival");
  t.is(payload.tickNumber, 3);
  t.is(payload.loopId, circuit.id);
  t.is(payload.loopLabel, circuit.label);
  t.is(payload.scheduleId, temporal.scheduleId);
  t.is(payload.scheduleKind, CIRCUIT_TICK_SCHEDULE_KIND);
  t.is(payload.firedAt, 1700);
  t.true(payload.compatibilityMode ?? false);
});

test("translateTickRequestedToLegacyTickEvent preserves session routing and emits system.tick", (t) => {
  const payload = buildCephalonTickRequestedPayload({
    sessionId: "c1-survival",
    circuit,
    tickNumber: 4,
    temporal: buildTemporalScheduleFiredPayload({
      scheduleId: buildCircuitTickScheduleId("c1-survival"),
      scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
      subjectId: "c1-survival",
      dueAt: 2000,
      firedAt: 2100,
    }),
  });

  const legacy = translateTickRequestedToLegacyTickEvent({
    id: "evt-1",
    timestamp: 2100,
    payload,
  });

  t.is(legacy.id, "evt-1");
  t.is(legacy.type, "system.tick");
  t.is(legacy.sessionId, "c1-survival");
  t.not((legacy.payload as { sessionId?: string }).sessionId, "c1-survival");
  t.is((legacy.payload as { scheduleKind?: string }).scheduleKind, CIRCUIT_TICK_SCHEDULE_KIND);
});

test("computeDeterministicJitterMs is stable and bounded", (t) => {
  const first = computeDeterministicJitterMs("duck:c4-performance", 30_000);
  const second = computeDeterministicJitterMs("duck:c4-performance", 30_000);
  const otherFirst = computeDeterministicJitterMs("openhax:c4-performance", 30_000);
  const otherSecond = computeDeterministicJitterMs("openhax:c4-performance", 30_000);

  t.is(first, second);
  t.is(otherFirst, otherSecond);
  t.true(first >= 0 && first <= 30_000);
  t.true(otherFirst >= 0 && otherFirst <= 30_000);
});

test("resolveInitialCircuitTickDelayMs clamps jitter to stay below the interval window", (t) => {
  const delayMs = resolveInitialCircuitTickDelayMs({
    botId: "duck",
    sessionId: "c1-survival",
    intervalMs: 5_000,
    maxJitterMs: 10_000,
  });

  t.true(delayMs >= 5_000);
  t.true(delayMs <= 9_000);
});
