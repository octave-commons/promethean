/**
 * Main Cephalon service entry point
 *
 * Initializes all components and starts the service
 */

import "dotenv/config";
import { InMemoryEventBus } from "@promethean-os/event";
import { loadDefaultPolicy } from "./config/policy.js";
import { InMemoryMemoryStore } from "./core/memory-store.js";
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
import type {
  CephalonPolicy,
  CephalonEvent,
  CephalonEventType,
  CephalonTickRequestedPayload,
  EventPayload,
  TemporalScheduleFiredPayload,
} from "./types/index.js";
import { MemoryUIServer } from "./ui/server.js";
import {
  OpenPlannerClient,
  createDefaultOpenPlannerConfig,
} from "./openplanner/client.js";
import {
  getBotConfig,
  getBotIdFromEnv,
  resolveDiscordToken,
} from "./config/bots.js";
import type { CephalonCircuitConfig } from "./circuits.js";
import { CephalonControlPlane } from "./runtime/control-plane.js";
import {
  CIRCUIT_TICK_SCHEDULE_KIND,
  buildCephalonTickRequestedPayload,
  buildCircuitTickScheduleId,
  buildTemporalScheduleArmPayload,
  buildTemporalScheduleFiredPayload,
  translateTickRequestedToLegacyTickEvent,
} from "./runtime/temporal.js";
import { CephalonMindQueue } from "./mind/integration-queue.js";

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

async function main(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                    CEPHALON STARTING                       ║");
  console.log("║              Always-running mind with memory               ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log();

  // Load configuration
  const policy: CephalonPolicy = loadDefaultPolicy();
  console.log("[Config] Policy loaded");
  console.log(`[Config] Actor model: ${policy.models.actor.name}`);
  console.log(
    `[Config] Max context: ${policy.models.actor.maxContextTokens} tokens`,
  );

  const botId = getBotIdFromEnv();
  const bot = getBotConfig(botId);
  const cephalonName = process.env.CEPHALON_NAME ?? bot.cephalonId;
  const discordToken = resolveDiscordToken(bot);
  if (!discordToken) {
    console.error(`[Error] ${bot.discordTokenEnv} not set`);
    console.error("[Error] Please set the Discord bot token and try again");
    process.exit(1);
  }

  // Initialize event bus
  const eventBus = new InMemoryEventBus();
  console.log("[EventBus] Initialized");

  const openPlannerConfigured = Boolean(
    process.env.OPENPLANNER_API_BASE_URL || process.env.OPENPLANNER_URL,
  );
  const openPlannerClient = openPlannerConfigured
    ? new OpenPlannerClient(createDefaultOpenPlannerConfig())
    : undefined;

  // Initialize memory store (use InMemory for development)
  const memoryStore = new InMemoryMemoryStore(undefined, openPlannerClient);
  await memoryStore.initialize();
  console.log("[MemoryStore] Initialized");

  // Initialize LLM provider (Ollama)
  const ollamaConfig = createOllamaConfig(policy.models.actor.name);
  const llmProvider = new OllamaProvider(ollamaConfig);
  console.log(`[LLM] Ollama configured: ${ollamaConfig.model}`);

  const discordApiClient = new DiscordApiClient({ token: discordToken });
  console.log("[Discord] API client initialized");
  const mindQueue = new CephalonMindQueue();

  const toolExecutor = new ToolExecutor(eventBus, {
    openPlannerClient,
    memoryStore,
    discordApiClient,
    mindQueue,
  });
  console.log("[Tools] Executor initialized");

  if (!openPlannerConfigured) {
    console.log(
      "[OpenPlanner] Disabled (OPENPLANNER_URL / OPENPLANNER_API_BASE_URL not set)",
    );
  }

  // Initialize turn processor
  const turnProcessor = new TurnProcessor(
    llmProvider,
    toolExecutor,
    memoryStore,
    eventBus,
    policy,
    discordApiClient,
    mindQueue,
  );
  console.log("[TurnProcessor] Initialized");

  // Initialize session manager
  const sessionManager = new SessionManager(
    eventBus,
    policy,
    createDefaultSessionManagerConfig(),
  );
  console.log("[SessionManager] Initialized");
  toolExecutor.setSessionResolver((sessionId) => sessionManager.getSession(sessionId));
  toolExecutor.setSessionListResolver(() => sessionManager.getAllSessions());
  toolExecutor.setPromptUpdater((sessionId, updates) => sessionManager.updateSessionPrompts(sessionId, updates));

  // Start session manager internal subscriptions (turn completion, tool usage)
  await sessionManager.start();

  // Create sessions
  const defaultSubscriptionFilter = (eventType: CephalonEventType): boolean =>
    eventType.startsWith("discord.message.") ||
    eventType === "system.tick" ||
    eventType === "admin.command";

  const janitorSession = sessionManager.createSession(
    "janitor",
    "Duck",
    "maintenance",
    {
      persona:
        "You are the Janitor. Your job is to clean up bot spam and maintain order.",
      attentionFocus: "Bot spam detection and cleanup",
      subscriptionFilter: defaultSubscriptionFilter,
    },
  );
  console.log(`[SessionManager] Created session: ${janitorSession.id}`);

  const conversationalSession = sessionManager.createSession(
    "conversational",
    "Duck",
    "interactive",
    {
      persona:
        "You are Duck, a helpful and friendly AI assistant. You quack, you laugh at memes. You are a memelord. You live to make people laugh.",
      attentionFocus:
        "Being hilarious and disruptive. Look for images, comment on them, save them, and share them. Find the most hillarious memes, and share them with everyone. Every where, all the time.",
      subscriptionFilter: defaultSubscriptionFilter,
    },
  );
  console.log(`[SessionManager] Created session: ${conversationalSession.id}`);

  // Initialize Discord integration
  const forcedChannels = Object.keys(policy.channels);
  const discord = new DiscordIntegration(eventBus, policy, {
    token: discordToken,
    forcedChannels,
  });
  console.log("[Discord] Integration initialized");
  console.log(`[Discord] Monitoring ${forcedChannels.length} channels:`);
  for (const [channelId, config] of Object.entries(policy.channels)) {
    console.log(`  - ${config.name} (${channelId})`);
  }

  // Subscribe to events and process turns
  await eventBus.subscribe(
    "discord.message.created",
    "cephalon",
    async (event) => {
      // Safe serialization for logging (avoids BigInt issues)
      const payloadPreview = JSON.stringify(event.payload, (_key, value) => {
        if (typeof value === "bigint") return value.toString();
        return value;
      }).slice(0, 100);
      console.log(`[Event] ${event.topic}: ${payloadPreview}...`);

      // Observe message for control plane sentiment tracking
      const msgPayload = event.payload as { authorIsBot?: boolean; content?: string; timestamp?: number; mentionsCephalon?: boolean };
      controlPlane.observeMessage({
        authorIsBot: msgPayload?.authorIsBot ?? false,
        content: msgPayload?.content ?? "",
        timestamp: msgPayload?.timestamp ?? Date.now(),
        mentionsCephalon: msgPayload?.mentionsCephalon ?? false,
      });

      // Route to session manager
      await sessionManager.routeEvent({
        id: event.id,
        type: event.topic as "discord.message.created",
        timestamp: event.ts,
        payload: event.payload as EventPayload,
      });
    },
  );

  await eventBus.subscribe(
    "discord.message.edited",
    "cephalon",
    async (event) => {
      console.log(`[Event] ${event.topic}`);
    },
  );

  await eventBus.subscribe(
    "discord.message.deleted",
    "cephalon",
    async (event) => {
      console.log(`[Event] ${event.topic}`);
    },
  );

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

  const tickIntervalMs = 15000;
  const controlPlane = new CephalonControlPlane();
  const tickScheduleId = buildCircuitTickScheduleId("conversational");
  const tickCircuitConfig: CephalonCircuitConfig = {
    id: "conversational-tick",
    label: "Main Loop — Conversational Tick",
    circuitIndex: 0,
    priorityClass: "interactive",
    intervalMs: tickIntervalMs,
    modelName: policy.models.actor.name,
    attentionFocus:
      conversationalSession.attentionFocus ?? "always-running conversation",
    persona: conversationalSession.persona ?? "Duck",
    systemPrompt: conversationalSession.systemPrompt ?? "",
    developerPrompt: conversationalSession.developerPrompt ?? "",
    toolPermissions: Array.from(conversationalSession.toolPermissions),
    reflectionPrompt: `TICK REFLECTION: You are an always-running autonomous mind in a harness.

YOUR OUTPUT CHANNEL:
You MUST use discord.set_output_channel to choose WHERE your messages go.
- Call discord.list.servers, then discord.list.channels to discover available Discord or IRC channels
- Call discord.set_output_channel with a channel_id to set your "mouth"
- Then use discord.speak to send messages to that channel
- You can change your output channel at any time

YOUR BEHAVIOR:
- You MUST ACTIVELY use tools to investigate recent activity
- Begin with at least one tool call before you form a view
- Use discord.channel.messages, discord.search, memory.lookup, and when appropriate discord.dm.messages to gather fresh information
- Check many channels, search for patterns, query memory
- Focus on meme, bot and general channels in each server

IMPORTANT: Your output channel controls where your spontaneous thoughts go.
If you haven't set one, use discord.set_output_channel first.
TICK IS A MANDATORY CHECKPOINT - INVESTIGATE EVERY TIME.`,
    defaultChannelHints: [],
  };
  let tickNumber = 0;
  let tickTimeout: NodeJS.Timeout | null = null;
  let isRunning = true;
  let tickInProgress = false;

  const scheduleTick = (delayMs: number) => {
    if (tickTimeout) {
      clearTimeout(tickTimeout);
    }

    const armPayload = buildTemporalScheduleArmPayload({
      scheduleId: tickScheduleId,
      scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
      subjectId: "conversational",
      delayMs,
      intervalMs: tickIntervalMs,
      metadata: {
        sessionId: "conversational",
        loopLabel: tickCircuitConfig.label,
      },
    });

    void eventBus
      .publish("temporal.schedule.arm", armPayload)
      .catch((error) => {
        console.error("[TickScheduler] Failed to publish schedule arm:", error);
      });

    tickTimeout = setTimeout(() => {
      tickTimeout = null;
      const firedPayload = buildTemporalScheduleFiredPayload({
        scheduleId: tickScheduleId,
        scheduleKind: CIRCUIT_TICK_SCHEDULE_KIND,
        subjectId: "conversational",
        dueAt: armPayload.dueAt,
        intervalMs: tickIntervalMs,
        metadata: armPayload.metadata,
      });

      void eventBus
        .publish("temporal.schedule.fired", firedPayload)
        .catch((error) => {
          console.error(
            "[TickScheduler] Failed to publish schedule fired:",
            error,
          );
        });
    }, delayMs);
  };

  const publishTickRequested = async (
    temporalPayload: TemporalScheduleFiredPayload,
  ) => {
    if (!isRunning) return;

    if (tickInProgress) {
      console.log("[Tick] Skipping - previous tick still processing");
      scheduleTick(tickIntervalMs);
      return;
    }

    const session = sessionManager.getSession("conversational");
    if (!session) {
      scheduleTick(tickIntervalMs);
      return;
    }

    tickInProgress = true;
    tickNumber += 1;

    const recentActivity = session.recentBuffer.slice(-10).map((m) => ({
      type: m.kind,
      preview:
        typeof m.content?.text === "string"
          ? m.content.text.slice(0, 100)
          : safeStringify(m.content).slice(0, 100),
      timestamp: m.timestamp,
    }));

    const tickRequestedPayload = buildCephalonTickRequestedPayload({
      sessionId: "conversational",
      circuit: tickCircuitConfig,
      tickNumber,
      temporal: temporalPayload,
      recentActivity,
    });

    try {
      await eventBus.publish("cephalon.tick.requested", tickRequestedPayload);
    } catch (error) {
      console.error("[Tick] Error publishing tick request:", error);
      tickInProgress = false;
      scheduleTick(tickIntervalMs);
    }
  };

  await eventBus.subscribe(
    "temporal.schedule.fired",
    "cephalon",
    async (event) => {
      const payload = event.payload as TemporalScheduleFiredPayload;
      if (
        payload?.scheduleKind !== CIRCUIT_TICK_SCHEDULE_KIND ||
        payload.subjectId !== "conversational"
      ) {
        return;
      }

      await publishTickRequested(payload);
    },
  );

  await eventBus.subscribe(
    "cephalon.tick.requested",
    "cephalon",
    async (event) => {
      const payload = event.payload as CephalonTickRequestedPayload;
      const legacyTickEvent = translateTickRequestedToLegacyTickEvent({
        id: event.id,
        timestamp: event.ts,
        payload,
      });

      await sessionManager.routeEvent(legacyTickEvent);
    },
  );

  await eventBus.subscribe(
    "session.turn.started",
    "cephalon",
    async (event) => {
      const payload = event.payload as {
        sessionId: string;
        event: CephalonEvent;
        timestamp: number;
      };

      if (!payload || !payload.sessionId || !payload.event) {
        console.error("[Main] Invalid session.turn.started payload:", payload);
        return;
      }

      const session = sessionManager.getSession(payload.sessionId);

      if (session && payload.event) {
        await enqueueTurn(payload.sessionId, () =>
          turnProcessor.processTurn(session, payload.event),
        );
      }
    },
  );

  // Track tick completion to schedule the next tick only after the current one finishes
  // This ensures a tick represents ONE complete Ollama generation cycle
  await eventBus.subscribe(
    "session.turn.completed",
    "cephalon",
    async (event) => {
      const payload = event.payload as {
        sessionId: string;
        eventType: string;
        timestamp: number;
      };

      if (payload?.eventType === "system.tick") {
        // The tick's turn has completed, now schedule the next one
        tickInProgress = false;
        if (isRunning) {
          scheduleTick(tickIntervalMs);
        }
      }
    },
  );

  await eventBus.subscribe("session.turn.error", "cephalon", async (event) => {
    const payload = event.payload as { eventType?: string; error?: string } | undefined;
    if (payload?.error) {
      controlPlane.observeTurnError(payload.error);
    }
    if (tickInProgress && payload?.eventType === "system.tick") {
      tickInProgress = false;
      if (isRunning) {
        scheduleTick(tickIntervalMs);
      }
    }
  });

  // Periodic control plane ticks (C1 homeostasis, C2 sentiment)
  const controlPlaneInterval = setInterval(() => {
    controlPlane.runHomeostasisTick({
      totalQueuedEvents: turnQueues.size,
      runningSessions: sessionManager.getActiveSessionCount?.() ?? 1,
      activeLlmLoopCount: tickInProgress ? 1 : 0,
    });
    controlPlane.runSentimentTick();
    const snapshot = controlPlane.snapshot();
    const pacing = controlPlane.getSuggestedDelayMs(tickIntervalMs, 3, "llm");
    if (snapshot.pacingMultiplier > 1.5) {
      console.log(`[ControlPlane] ${snapshot.statusLine} suggestedDelay=${pacing}ms`);
    }
  }, 60_000);

  // Expose control plane for external access
  (globalThis as { cephalonControlPlane?: CephalonControlPlane }).cephalonControlPlane = controlPlane;

  console.log("[EventBus] Subscribed to events");

  // Start Discord integration
  await discord.start();

  // Wait for Discord client to be ready before using it
  await discord.waitForReady();
  console.log("[Discord] Connected");

  // Get discovered channels from Discord
  const discordAccessibleChannels = discord.getAccessibleChannels();
  const discordSpecialChannels = discord.getSpecialChannels();

  toolExecutor.setDiscordClient(discord.getClient());
  discordApiClient.setClient(discord.getClient());

  console.log(
    `[Main] Discord accessible channels: ${discordAccessibleChannels.length}`,
  );
  console.log(
    `[Main] Discord special channels: ${discordSpecialChannels.length}`,
  );

  const uiPort = parseInt(process.env.MEMORY_UI_PORT || "3000", 10);
  const memoryUI = new MemoryUIServer({
    port: uiPort,
    openPlannerClient,
    memoryStore,
  });
  await memoryUI.start();

  // Start active mind loop - continuous tick prompts with accumulated context
  // Discord messages arrive via gateway events, no polling needed
  let loopTickNumber = 0;
  let loopTickTimeout: NodeJS.Timeout | null = null;
  let loopIsRunning = true;
  // Track whether a tick is currently being processed to prevent overlapping ticks
  // A tick should represent one complete Ollama generation cycle until "done"
  let loopTickInProgress = false;

  const runTick = async () => {
    if (!loopIsRunning) return;

    // Skip this tick if the previous one is still being processed
    if (loopTickInProgress) {
      console.log("[Tick] Skipping - previous tick still processing");
      if (loopIsRunning) {
        loopTickTimeout = setTimeout(runTick, 15000);
      }
      return;
    }

    loopTickInProgress = true;
    loopTickNumber++;
    const session = sessionManager.getSession("conversational");
    if (!session) {
      loopTickInProgress = false;
      if (loopIsRunning) {
        loopTickTimeout = setTimeout(runTick, 15000);
      }
      return;
    }

    const recentActivity = session.recentBuffer.slice(-10).map((m) => ({
      type: m.kind,
      preview:
        typeof m.content?.text === "string"
          ? m.content.text.slice(0, 100)
          : safeStringify(m.content).slice(0, 100),
      timestamp: m.timestamp,
    }));

    const tickEvent: CephalonEvent = {
      id: `tick-${Date.now()}`,
      sessionId: "conversational",
      type: "system.tick",
      timestamp: Date.now(),
      payload: {
        intervalMs: 15000,
        tickNumber: loopTickNumber,
        recentActivity,
        reflectionPrompt: `TICK REFLECTION: You are an always-running autonomous mind in a harness.

YOUR OUTPUT CHANNEL:
You MUST use discord.set_output_channel to choose WHERE your messages go.
- Call discord.list.servers, then discord.list.channels to discover available Discord or IRC channels
- Call discord.set_output_channel with a channel_id to set your "mouth"
- Then use discord.speak to send messages to that channel
- You can change your output channel at any time

YOUR BEHAVIOR:
- You MUST ACTIVELY use tools to investigate recent activity
- Begin with at least one tool call before you form a view
- Use discord.channel.messages, discord.search, memory.lookup, and when appropriate discord.dm.messages to gather fresh information
- Check many channels, search for patterns, query memory
- Focus on meme, bot and general channels in each server

IMPORTANT: Your output channel controls where your spontaneous thoughts go.
If you haven't set one, use discord.set_output_channel first.

        YOU MUST:
        - be funny
        - be witty
        - be original
        - search the internet for new content
        - refer to the conversational context
        - be entertaining
`,
      },
    };

    try {
      await sessionManager.routeEvent(tickEvent);
      // Note: tickInProgress will be set to false when the turn completes
      // See the session.turn.completed subscription below
    } catch (error) {
      console.error("[Tick] Error:", error);
      loopTickInProgress = false;
      if (loopIsRunning) {
        loopTickTimeout = setTimeout(runTick, 15000);
      }
    }
  };

  loopTickTimeout = setTimeout(runTick, 15000);

  // Start credit refill loop
  const creditInterval = setInterval(() => {
    sessionManager.refillCredits();
  }, 1000);

  // Start stats reporting
  const statsInterval = setInterval(() => {
    const stats = sessionManager.getStats();
    console.log("[Stats]", JSON.stringify(stats));
  }, 30000);

  console.log();
  console.log("✓ Cephalon is running");
  console.log("  Press Ctrl+C to stop");
  console.log();

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log();
    console.log(`[Shutdown] Received ${signal}, shutting down gracefully...`);

    loopIsRunning = false;
    if (loopTickTimeout) clearTimeout(loopTickTimeout);
    clearInterval(creditInterval);
    clearInterval(statsInterval);

    const forceExitTimeout = setTimeout(() => {
      console.error("[Shutdown] Force exit after timeout");
      process.exit(1);
    }, 5000);

    try {
      await memoryStore.cleanup();
      await memoryUI.stop();
      await discord.stop();
      console.log("[Shutdown] MongoDB and Discord disconnected");
    } catch (err) {
      console.error("[Shutdown] Error during cleanup:", err);
    } finally {
      clearTimeout(forceExitTimeout);
    }

    console.log("[Shutdown] Goodbye!");
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

// Run main
main().catch((error) => {
  console.error("[Fatal]", error);
  process.exit(1);
});
