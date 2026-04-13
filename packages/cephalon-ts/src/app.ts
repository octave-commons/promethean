/**
 * CephalonApp
 *
 * Library-friendly wrapper around the Cephalon runtime.
 *
 * - No process.exit()
 * - Exposes start()/stop()
 */

import { InMemoryEventBus, type EventBus } from "@promethean-os/event";
import { loadDefaultPolicy } from "./config/policy.js";
import { envInt } from "./config/env.js";
import { InMemoryMemoryStore, type MemoryStore } from "./core/memory-store.js";
import { MongoDBMemoryStore } from "./core/mongodb-memory-store.js";
import { DiscordIntegration } from "./discord/integration.js";
import {
  SessionManager,
  createDefaultSessionManagerConfig,
} from "./sessions/manager.js";
import {
  OllamaProvider,
  ToolExecutor,
  TurnProcessor,
  createOllamaConfig,
} from "./llm/index.js";
import { DiscordApiClient } from "./discord/api-client.js";
import { createDefaultIrcApiConfig, IrcApiClient } from "./irc/api-client.js";
import { IrcIntegration } from "./irc/integration.js";
import type {
  CephalonPolicy,
  CephalonEvent,
  CephalonEventType,
  CephalonTickRequestedPayload,
  EventPayload,
  TemporalScheduleFiredPayload,
} from "./types/index.js";
import type { ChromaMemoryStore } from "./chroma/client.js";
import { MemoryUIServer } from "./ui/server.js";
import { OpenPlannerClient, createDefaultOpenPlannerConfig } from "./openplanner/client.js";
import { EIGHT_CIRCUIT_CONFIGS } from "./circuits.js";
import { GraphWeaver } from "./mind/graph-weaver.js";
import { RssPoller } from "./mind/rss-poller.js";
import { EidolonFieldState } from "./mind/eidolon-field.js";
import { PromptFieldEngine } from "./mind/prompt-field.js";
import { CephalonMindQueue } from "./mind/integration-queue.js";
import { getBotConfig, getBotIdFromEnv, resolveDiscordToken } from "./config/bots.js";
import { getBrowserSessionState } from "./llm/tools/browser.js";
import {
  CIRCUIT_TICK_SCHEDULE_KIND,
  buildCephalonTickRequestedPayload,
  buildCircuitTickScheduleId,
  resolveInitialCircuitTickDelayMs,
  buildTemporalScheduleArmPayload,
  buildTemporalScheduleFiredPayload,
  translateTickRequestedToLegacyTickEvent,
} from "./runtime/temporal.js";

function safeStringify(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === "bigint") return val.toString();
    if (val !== null && typeof val === "object") {
      if (seen.has(val)) return "[Circular]";
      seen.add(val);
    }
    return val;
  });
}

export interface CephalonAppOptions {
  botId?: string;
  cephalonId?: string;
  discordToken?: string;
  policy?: CephalonPolicy;
  uiPort?: number;
  enableProactiveLoop?: boolean;
  tickIntervalMs?: number;
  mongoUri?: string;
}

export interface CephalonApp {
  policy: CephalonPolicy;
  eventBus: EventBus;
  memoryStore: MemoryStore;
  chromaStore?: ChromaMemoryStore;
  sessionManager: SessionManager;
  discord: DiscordIntegration;
  start(): Promise<void>;
  stop(signal?: string): Promise<void>;
}

export async function createCephalonApp(
  options: CephalonAppOptions = {},
): Promise<CephalonApp> {
  const botId = options.botId ?? getBotIdFromEnv();
  const bot = getBotConfig(botId);
  const basePolicy = options.policy ?? loadDefaultPolicy();
  const policy: CephalonPolicy = {
    ...basePolicy,
    output: {
      ...basePolicy.output,
      defaultChannelId: bot.defaultOutputChannelId ?? basePolicy.output?.defaultChannelId,
    },
  };

  const cephalonName = options.cephalonId ?? process.env.CEPHALON_NAME ?? bot.cephalonId;
  const expectedTokenEnv = bot.discordTokenEnv || `${cephalonName.toUpperCase()}_DISCORD_TOKEN`;
  const discordToken =
    options.discordToken ??
    resolveDiscordToken(bot) ??
    process.env[`${cephalonName.toUpperCase()}_DISCORD_TOKEN`] ??
    process.env.DISCORD_TOKEN;

  if (!discordToken) {
    throw new Error(
      `Discord token not set. Set ${expectedTokenEnv} (or DISCORD_TOKEN).`,
    );
  }

  // Event bus (in-memory for now; upgrade to persisted bus later)
  const eventBus = new InMemoryEventBus();

  // Initialize LLM provider (OpenAI-compatible via OllamaProvider)
  const llmProvider = new OllamaProvider(createOllamaConfig(policy.models.actor.name));

  const openPlannerConfigured = Boolean(
    process.env.OPENPLANNER_API_BASE_URL || process.env.OPENPLANNER_URL,
  );
  const openPlannerClient = openPlannerConfigured
    ? new OpenPlannerClient(createDefaultOpenPlannerConfig())
    : undefined;

  // Choose memory store (MongoDB if configured)
  const mongoUri =
    options.mongoUri ??
    process.env.CEPHALON_MONGODB_URI ??
    process.env.MONGODB_URI;

  const memoryStore: MemoryStore & { initialize?: () => Promise<void>; close?: () => Promise<void> } =
    mongoUri
        ? new MongoDBMemoryStore({
          cephalonId: `${bot.id}-cephalon`,
          uri: mongoUri,
          databaseName: process.env.CEPHALON_MONGODB_DB || "promethean",
          collectionName: process.env.CEPHALON_MONGODB_COLLECTION || "cephalon_memories",
          openPlannerClient,
        })
      : new InMemoryMemoryStore(undefined, openPlannerClient);

  if (memoryStore.initialize) {
    await memoryStore.initialize();
  }

  const discordApiClient = new DiscordApiClient({ token: discordToken });
  let getRuntimeState: (() => unknown) | undefined;
  const ircEnabled = /^(1|true|yes|on)$/i.test(process.env.CEPHALON_ENABLE_IRC ?? "");
  const ircApiClient = ircEnabled ? new IrcApiClient(createDefaultIrcApiConfig(process.env)) : undefined;
  const preferredHomeChannelId = bot.defaultOutputChannelId ?? ircApiClient?.getDefaultChannelId();
  if (preferredHomeChannelId) {
    policy.output = {
      ...policy.output,
      defaultChannelId: preferredHomeChannelId,
    };
  }

  const graphWeaver = new GraphWeaver();
  const rssPoller = new RssPoller(graphWeaver);
  const eidolonField = new EidolonFieldState();
  const promptField = new PromptFieldEngine();
  const mindQueue = new CephalonMindQueue();

  const toolExecutor = new ToolExecutor(eventBus, {
    openPlannerClient,
    memoryStore,
    discordApiClient,
    ircApiClient,
    mindQueue,
    runtimeInspector: () => getRuntimeState?.(),
  });

  if (!openPlannerConfigured) {
    console.log("[OpenPlanner] Disabled (OPENPLANNER_URL / OPENPLANNER_API_BASE_URL not set)");
  }

  const turnProcessor = new TurnProcessor(
    llmProvider,
    toolExecutor,
    memoryStore,
    eventBus,
    policy,
    discordApiClient,
    mindQueue,
  );

  const sessionManager = new SessionManager(
    eventBus,
    policy,
    createDefaultSessionManagerConfig(),
  );
  toolExecutor.setSessionResolver((sessionId) => sessionManager.getSession(sessionId));
  toolExecutor.setSessionListResolver(() => sessionManager.getAllSessions());
  toolExecutor.setPromptUpdater((sessionId, updates) => sessionManager.updateSessionPrompts(sessionId, updates));

  getRuntimeState = async () => ({
    cephalonName,
    graphSummary: graphWeaver.summarize(),
    rssSummary: rssPoller.summary(),
    eidolonSummary: eidolonField.summary(),
    promptFieldSummary: promptField.summary(),
    mindQueueSummary: mindQueue.summary(),
    browserState: await getBrowserSessionState(),
    channelTrails: toolExecutor.describeChannelTrails(8),
    sessions: sessionManager.getAllSessions().map((entry) => ({
      id: entry.id,
      circuitIndex: entry.circuitIndex,
      modelName: entry.modelName,
      reasoningEffort: entry.reasoningEffort,
      loopIntervalMs: entry.loopIntervalMs,
      attentionFocus: entry.attentionFocus,
      defaultChannelHints: entry.defaultChannelHints ?? [],
      toolPermissions: Array.from(entry.toolPermissions),
      systemPromptPreview: entry.systemPrompt?.slice(0, 240),
      developerPromptPreview: entry.developerPrompt?.slice(0, 240),
      outputChannel: toolExecutor.getOutputChannel(entry.id),
    })),
  });

  const defaultSubscriptionFilter = (eventType: CephalonEventType): boolean =>
    eventType.startsWith("discord.message.") ||
    eventType === "system.tick" ||
    eventType === "admin.command";

  const circuitConfigs = EIGHT_CIRCUIT_CONFIGS;
  for (const circuit of circuitConfigs) {
    sessionManager.createSession(circuit.id, cephalonName, circuit.priorityClass, {
      persona: circuit.persona,
      systemPrompt: circuit.systemPrompt,
      developerPrompt: circuit.developerPrompt,
      attentionFocus: circuit.attentionFocus,
      toolPermissions: circuit.toolPermissions,
      subscriptionFilter: defaultSubscriptionFilter,
      circuitIndex: circuit.circuitIndex,
      modelName: circuit.modelName,
      reasoningEffort: circuit.reasoningEffort,
      loopIntervalMs: circuit.intervalMs,
      defaultChannelHints: circuit.defaultChannelHints,
      homeChannelId: preferredHomeChannelId,
    });

  }

  const forcedChannels = Object.keys(policy.channels);
  const discord = new DiscordIntegration(eventBus, policy, {
    token: discordToken,
    forcedChannels,
  });
  const irc = ircApiClient
    ? new IrcIntegration(eventBus, ircApiClient, { enabled: ircEnabled })
    : undefined;

  const uiPort =
    options.uiPort
      ?? parseInt(
        process.env[bot.memoryUi?.portEnv ?? ""]
          || process.env.MEMORY_UI_PORT
          || String(bot.memoryUi?.port ?? 3000),
        10,
      );
  const memoryUI = new MemoryUIServer({
    port: uiPort,
    openPlannerClient,
    memoryStore,
    runtimeInspector: {
      getState: getRuntimeState,
    },
  });

  const turnQueues = new Map<string, Promise<void>>();
  const enqueueTurn = (
    sessionId: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    const prev = turnQueues.get(sessionId) ?? Promise.resolve();
    const next = prev.then(fn).catch((err) => {
      console.error(`[TurnQueue] Error for session ${sessionId}:`, err);
    });
    turnQueues.set(sessionId, next);
    return next;
  };

  // Timers / loops
  let creditInterval: NodeJS.Timeout | null = null;
  let statsInterval: NodeJS.Timeout | null = null;
  let promptFieldInterval: NodeJS.Timeout | null = null;
  let isRunning = false;
  const enableProactiveLoop = options.enableProactiveLoop ?? true;
  const startupTickJitterMs = envInt("CEPHALON_STARTUP_TICK_JITTER_MS", 30_000, {
    min: 0,
    max: 600_000,
  });

  const loopRuntimes = new Map(
    circuitConfigs.map((circuit) => [
      circuit.id,
      {
        config: circuit,
        scheduleId: buildCircuitTickScheduleId(circuit.id),
        tickNumber: 0,
        inProgress: false,
        timeout: null as NodeJS.Timeout | null,
        nextDueAt: undefined as number | undefined,
      },
    ]),
  );

  const scheduleCircuitTick = (sessionId: string, delayMs: number) => {
    const runtime = loopRuntimes.get(sessionId);
    if (!runtime) return;
    if (runtime.timeout) {
      clearTimeout(runtime.timeout);
    }

    const armPayload = buildTemporalScheduleArmPayload({
      scheduleId: runtime.scheduleId,
      scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
      subjectId: sessionId,
      delayMs,
      intervalMs: runtime.config.intervalMs,
      metadata: {
        circuitId: runtime.config.id,
        circuitIndex: runtime.config.circuitIndex,
        loopLabel: runtime.config.label,
      },
    });

    runtime.nextDueAt = armPayload.dueAt;

    void eventBus.publish("temporal.schedule.arm", armPayload).catch((error) => {
      console.error(`[Scheduler:${sessionId}] Failed to publish schedule arm:`, error);
    });

    runtime.timeout = setTimeout(() => {
      runtime.timeout = null;
      const firedPayload = buildTemporalScheduleFiredPayload({
        scheduleId: runtime.scheduleId,
        scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
        subjectId: sessionId,
        dueAt: armPayload.dueAt,
        intervalMs: runtime.config.intervalMs,
        metadata: armPayload.metadata,
      });
      void eventBus.publish("temporal.schedule.fired", firedPayload).catch((error) => {
        console.error(`[Scheduler:${sessionId}] Failed to publish schedule fired:`, error);
      });
    }, delayMs);
  };

  const publishTickRequested = async (
    sessionId: string,
    temporalPayload: TemporalScheduleFiredPayload,
  ) => {
    if (!isRunning || !enableProactiveLoop) return;

    const runtime = loopRuntimes.get(sessionId);
    const session = sessionManager.getSession(sessionId);
    if (!runtime || !session) {
      return;
    }

    if (runtime.inProgress) {
      console.log(`[Tick:${sessionId}] Skipping - previous tick still processing`);
      scheduleCircuitTick(sessionId, runtime.config.intervalMs);
      return;
    }

    runtime.inProgress = true;
    runtime.tickNumber += 1;

    // Let the ants roam: pick an output channel using the router.
    const outputChannel = await toolExecutor.ensureOutputChannel(sessionId);
    console.log(
      `[Tick:${sessionId}] Passive channel => ${outputChannel?.channelName || outputChannel?.channelId || "unset"} (${outputChannel?.mode || "auto"}; ${outputChannel?.reason || "no-reason"})`,
    );
    console.log(
      `[Tick:${sessionId}] Channel trails => ${JSON.stringify(toolExecutor.describeChannelTrails(4))}`,
    );

    const recentActivity = session.recentBuffer.slice(-12).map((m) => ({
      type: m.kind,
      preview:
        typeof m.content?.text === "string"
          ? m.content.text.slice(0, 140)
          : safeStringify(m.content).slice(0, 140),
      timestamp: m.timestamp,
    }));

    const tickRequestedPayload = buildCephalonTickRequestedPayload({
      sessionId,
      circuit: runtime.config,
      tickNumber: runtime.tickNumber,
      temporal: temporalPayload,
      graphSummary: graphWeaver.summarize(),
      rssSummary: rssPoller.summary(),
      eidolonSummary: eidolonField.summary(),
      promptFieldSummary: promptField.summary(),
      promptFieldOverlay: promptField.overlayForCircuit(sessionId),
      suggestedChannel: outputChannel?.channelName ?? outputChannel?.channelId ?? undefined,
      recentActivity,
    });

    try {
      await eventBus.publish("cephalon.tick.requested", tickRequestedPayload);
    } catch (error) {
      console.error(`[Tick:${sessionId}] Error publishing tick request:`, error);
      runtime.inProgress = false;
      scheduleCircuitTick(sessionId, runtime.config.intervalMs);
    }
  };

  async function start(): Promise<void> {
    if (isRunning) return;

    console.log("[EventBus] Initializing subscriptions...");

    await eventBus.subscribe(
      "discord.message.created",
      "cephalon",
      async (event) => {
        const payload = event.payload as { mentionsCephalon?: boolean; channelName?: string; authorUsername?: string };
        const payloadPreview = JSON.stringify(event.payload, (_key, value) => {
          if (typeof value === "bigint") return value.toString();
          return value;
        }).slice(0, 200);
        console.log(`[Event] ${event.topic}: ${payloadPreview}...`);

        if (payload.mentionsCephalon) {
          console.log(
            `[Notification] Mention detected from ${payload.authorUsername || "unknown"} in #${payload.channelName || "unknown"}`,
          );
        }

        toolExecutor.observeDiscordMessage(event.payload as any);
        graphWeaver.ingestDiscordMessage(event.payload as any);
        eidolonField.ingestDiscordMessage(event.payload as any);
        promptField.observeMessage(event.payload as any);

        await sessionManager.routeEvent({
          id: event.id,
          type: event.topic as "discord.message.created",
          timestamp: event.ts,
          payload: event.payload as EventPayload,
        });
      },
    );

    await eventBus.subscribe("temporal.schedule.fired", "cephalon", async (event) => {
      const payload = event.payload as TemporalScheduleFiredPayload;
      if (payload?.scheduleKind !== CIRCUIT_TICK_SCHEDULE_KIND || !payload.subjectId) {
        return;
      }

      await publishTickRequested(payload.subjectId, payload);
    });

    await eventBus.subscribe("cephalon.tick.requested", "cephalon", async (event) => {
      const payload = event.payload as CephalonTickRequestedPayload;
      const legacyTickEvent = translateTickRequestedToLegacyTickEvent({
        id: event.id,
        timestamp: event.ts,
        payload,
      });
      await sessionManager.routeEvent(legacyTickEvent);
    });

    await eventBus.subscribe("session.turn.started", "cephalon", async (event) => {
      const payload = event.payload as {
        sessionId: string;
        event: CephalonEvent;
        timestamp: number;
      };

      if (!payload || !payload.sessionId || !payload.event) {
        console.error("[CephalonApp] Invalid session.turn.started payload:", payload);
        return;
      }

      const session = sessionManager.getSession(payload.sessionId);
      if (session) {
        await enqueueTurn(payload.sessionId, () =>
          turnProcessor.processTurn(session, payload.event),
        );
      }
    });

    await eventBus.subscribe("session.turn.completed", "cephalon", async (event) => {
      const payload = event.payload as {
        sessionId: string;
        eventType: string;
        timestamp: number;
      };

      if (payload?.eventType === "system.tick") {
        const runtime = payload.sessionId ? loopRuntimes.get(payload.sessionId) : undefined;
        if (runtime) {
          runtime.inProgress = false;
          toolExecutor.noteSessionTurn(payload.sessionId);
          if (isRunning && enableProactiveLoop) {
            scheduleCircuitTick(payload.sessionId, runtime.config.intervalMs);
          }
        }
      }
    });

    await eventBus.subscribe("session.turn.error", "cephalon", async (event) => {
      const payload = event.payload as { sessionId?: string; eventType?: string };
      if (payload?.eventType === "system.tick" && payload.sessionId) {
        const runtime = loopRuntimes.get(payload.sessionId);
        if (runtime) {
          runtime.inProgress = false;
          toolExecutor.noteSessionTurn(payload.sessionId);
          if (isRunning && enableProactiveLoop) {
            scheduleCircuitTick(payload.sessionId, runtime.config.intervalMs);
          }
        }
      }
    });

    isRunning = true;

    await graphWeaver.load();
    await rssPoller.start();
    promptField.evolve(graphWeaver.summarize(), rssPoller.summary(), eidolonField.summary());

    await sessionManager.start();

    await discord.start();
    await discord.waitForReady();

    if (irc) {
      await irc.start();
    }

    toolExecutor.setDiscordClient(discord.getClient());
    discordApiClient.setClient(discord.getClient());

    await Promise.all(
      circuitConfigs.map(async (circuit) => {
        const seeded = await toolExecutor.ensureOutputChannel(circuit.id);
        if (seeded?.channelId) {
          console.log(
            `[Routing] Seeded ${circuit.id} output => ${seeded.channelName || seeded.channelId} (${seeded.mode || 'auto'}; ${seeded.reason || 'unspecified'})`,
          );
        }
      }),
    );

    await memoryUI.start();

    if (enableProactiveLoop) {
      for (const circuit of circuitConfigs) {
        const initialDelay = resolveInitialCircuitTickDelayMs({
          botId: bot.id,
          sessionId: circuit.id,
          intervalMs: circuit.intervalMs,
          maxJitterMs: startupTickJitterMs,
        });
        const startupJitter = initialDelay - circuit.intervalMs;
        console.log(
          `[Scheduler:${circuit.id}] Initial tick in ${initialDelay}ms (base=${circuit.intervalMs}ms, jitter=${startupJitter}ms)`,
        );
        scheduleCircuitTick(circuit.id, initialDelay);
      }
    }

    promptFieldInterval = setInterval(() => {
      promptField.evolve(graphWeaver.summarize(), rssPoller.summary(), eidolonField.summary());
      console.log(`[PromptField] ${promptField.summary()}`);
    }, Number(process.env.CEPHALON_PROMPT_FIELD_MS || 180000));

    // Start credit refill loop
    creditInterval = setInterval(() => {
      sessionManager.refillCredits();
    }, 1000);

    // Start stats reporting
    statsInterval = setInterval(() => {
      const stats = sessionManager.getStats();
      console.log("[Stats]", JSON.stringify(stats));
    }, 30000);

    console.log("✓ Cephalon started");
  }

  async function stop(signal = "stop"): Promise<void> {
    if (!isRunning) return;
    console.log(`[Shutdown] ${signal} ...`);

    isRunning = false;

    for (const runtime of loopRuntimes.values()) {
      if (runtime.timeout) {
        clearTimeout(runtime.timeout);
        runtime.timeout = null;
      }
      runtime.inProgress = false;
    }
    if (creditInterval) clearInterval(creditInterval);
    if (statsInterval) clearInterval(statsInterval);
    if (promptFieldInterval) clearInterval(promptFieldInterval);

    try {
      rssPoller.stop();
      await graphWeaver.flush();
    } catch (err) {
      console.error("[Shutdown] Error flushing mind state:", err);
    }

    try {
      await memoryUI.stop();
    } catch (err) {
      console.error("[Shutdown] Error stopping Memory UI:", err);
    }

    try {
      if (irc) {
        await irc.stop();
      }
    } catch (err) {
      console.error("[Shutdown] Error stopping IRC integration:", err);
    }

    try {
      await discord.stop();
    } catch (err) {
      console.error("[Shutdown] Error stopping Discord:", err);
    }

    try {
      if ((memoryStore as any).close) {
        await (memoryStore as any).close();
      }
    } catch (err) {
      console.error("[Shutdown] Error closing memory store:", err);
    }

    console.log("[Shutdown] Done.");
  }

  return {
    policy,
    eventBus,
    memoryStore,
    sessionManager,
    discord,
    start,
    stop,
  };
}
