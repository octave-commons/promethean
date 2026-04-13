/**
 * Tool Executor
 * 
 * Handles tool registration, execution, and definition retrieval.
 * Uses the tool registry to manage all available tools.
 */

import { InMemoryEventBus, type EventBus } from "@promethean-os/event";
import type { ToolResult } from "../../types/index.js";
import type { ToolDefinition } from "../../prompts/index.js";
import type { ToolCall, ToolDependencies, ToolExecutorOptions, OutputChannelState } from "./types.js";
import { TOOL_REGISTRY } from "./registry.js";
import { ChannelAcoRouter } from "../../mind/channel-aco.js";
import type { Session } from "../../types/index.js";
import type { CephalonMindQueue } from "../../mind/integration-queue.js";

/**
 * Tool executor that handles tool calls
 */
export class ToolExecutor {
  private tools: Map<
    string,
    (args: Record<string, unknown>, sessionId?: string) => Promise<ToolResult>
  > = new Map();
  private eventBus: InMemoryEventBus;
  private chromaStore?: import("../../chroma/client.js").ChromaMemoryStore;
  private openPlannerClient?: import("../../openplanner/client.js").OpenPlannerClient;
  private memoryStore?: import("../../core/memory-store.js").MemoryStore;
  private discordApiClient: import("../../discord/api-client.js").DiscordApiClient;
  private ircApiClient?: import("../../irc/api-client.js").IrcApiClient;
  private runtimeInspector?: () => unknown | Promise<unknown>;
  private mindQueue?: CephalonMindQueue;
  /** Output channels per session/circuit */
  private outputChannels = new Map<string, OutputChannelState>();
  private channelRouter = new ChannelAcoRouter();
  private sessionResolver?: (sessionId: string) => Session | undefined;
  private sessionListResolver?: () => Session[];
  private promptUpdater?: (sessionId: string, updates: {
    systemPrompt?: string;
    developerPrompt?: string;
    attentionFocus?: string;
  }) => Session | undefined;
  private toolAliases = new Map<string, string>();
  private semanticWeightsCache = new Map<string, { computedAt: number; weights: Map<string, number> }>();

  constructor(
    eventBus: InMemoryEventBus,
    options: ToolExecutorOptions,
  ) {
    this.eventBus = eventBus;
    this.chromaStore = options.chromaStore;
    this.openPlannerClient = options.openPlannerClient;
    this.memoryStore = options.memoryStore;
    this.runtimeInspector = options.runtimeInspector;
    this.ircApiClient = options.ircApiClient;
    this.mindQueue = options.mindQueue;
    if (!options.discordApiClient) {
      throw new Error(
        "DiscordApiClient is required. Pass a single shared instance from main.ts",
      );
    }
    this.discordApiClient = options.discordApiClient;
    this.registerDefaultTools();
  }

  setDiscordClient(client: import("discord.js").Client): void {
    this.discordApiClient.setClient(client);
  }

  /** Get current output channel state */
  getOutputChannel(sessionId = "default"): OutputChannelState {
    return this.outputChannels.get(sessionId) ?? { channelId: null, setAt: 0 };
  }

  /** Set output channel for spontaneous messages */
  setOutputChannel(channel: OutputChannelState, sessionId = "default"): void {
    this.outputChannels.set(sessionId, channel);
    if (channel.channelId) {
      this.channelRouter.setManualChannel(
        sessionId,
        channel.channelId,
        channel.channelName,
        channel.serverName,
      );
    }
    console.log(`[ToolExecutor] Output channel for ${sessionId} set to: ${channel.channelId} (${channel.channelName || 'unnamed'})`);
  }

  setSessionResolver(resolver: (sessionId: string) => Session | undefined): void {
    this.sessionResolver = resolver;
  }

  setSessionListResolver(resolver: () => Session[]): void {
    this.sessionListResolver = resolver;
  }

  setPromptUpdater(
    updater: (sessionId: string, updates: {
      systemPrompt?: string;
      developerPrompt?: string;
      attentionFocus?: string;
    }) => Session | undefined,
  ): void {
    this.promptUpdater = updater;
  }

  observeDiscordMessage(payload: import("../../types/index.js").DiscordMessagePayload): void {
    this.channelRouter.observeMessage(payload);
  }

  noteSessionTurn(sessionId: string): void {
    this.channelRouter.noteTurn(sessionId);
  }

  recordSpeech(sessionId: string, channelId: string): void {
    this.channelRouter.recordSpeech(sessionId, channelId);
  }

  recordSpeechMessage(sessionId: string, channelId: string, messageId: string): void {
    this.channelRouter.recordSpeechMessage(sessionId, channelId, messageId);
  }

  describeChannelTrails(limit = 5) {
    return this.channelRouter.describeTopChannels(limit);
  }

  async listAllChannels(): Promise<Array<{ id: string; name: string; guildId: string; type: string }>> {
    const channels: Array<{ id: string; name: string; guildId: string; type: string }> = [];

    try {
      const discordChannels = await this.discordApiClient.listChannels();
      channels.push(...discordChannels.channels);
    } catch {
      void 0;
    }

    if (this.ircApiClient) {
      try {
        const ircChannels = await this.ircApiClient.listChannels();
        channels.push(...ircChannels.channels);
      } catch {
        void 0;
      }
    }

    return channels;
  }

  private async listOutputChannels(): Promise<Array<{ id: string; name: string; guildId: string; type: string }>> {
    const channels: Array<{ id: string; name: string; guildId: string; type: string }> = [];

    try {
      const discordChannels = await this.discordApiClient.listSendableChannels();
      channels.push(...discordChannels.channels);
    } catch {
      void 0;
    }

    if (this.ircApiClient) {
      try {
        const ircChannels = await this.ircApiClient.listChannels();
        channels.push(...ircChannels.channels);
      } catch {
        void 0;
      }
    }

    return channels;
  }

  async sendChatMessage(channelId: string, text: string, replyTo?: string) {
    if (this.ircApiClient && channelId.startsWith("irc:")) {
      return this.ircApiClient.sendMessage(channelId, text, replyTo);
    }

    return this.discordApiClient.sendMessage(channelId, text, replyTo);
  }

  async ensureOutputChannel(sessionId: string): Promise<OutputChannelState | undefined> {
    return this.resolveOutputChannelForSession(sessionId);
  }

  private async resolveOutputChannelForSession(sessionId?: string): Promise<OutputChannelState | undefined> {
    const resolvedSessionId = sessionId ?? "default";
    const current = this.getOutputChannel(resolvedSessionId);
    if (current.channelId && current.mode === "manual") {
      return current;
    }

    const session = this.sessionResolver?.(resolvedSessionId);
    const channels = await this.listOutputChannels();

    if (!current.channelId && session?.homeChannelId) {
      const homeChannel = channels.find((channel) => channel.id === session.homeChannelId);
      if (homeChannel) {
        const seeded: OutputChannelState = {
          channelId: homeChannel.id,
          channelName: homeChannel.name,
          serverName: homeChannel.guildId,
          setAt: Date.now(),
          mode: "auto",
          reason: "home channel seed",
        };
        this.outputChannels.set(resolvedSessionId, seeded);
        return seeded;
      }
    }

    const semanticWeights = await this.computeSemanticWeights(resolvedSessionId, session, channels);

    const selection = this.channelRouter.chooseChannel(
      session ?? {
        id: resolvedSessionId,
        cephalonId: "Cephalon",
        priorityClass: "interactive",
        credits: 0,
        recentBuffer: [],
        toolPermissions: new Set(),
      },
      channels,
      { semanticWeights },
    );
    if (!selection) {
      return current.channelId ? current : undefined;
    }

    const next: OutputChannelState = {
      channelId: selection.channelId,
      channelName: selection.channelName,
      serverName: selection.serverName,
      setAt: selection.setAt,
      mode: selection.mode,
      reason: selection.reason,
    };
    this.outputChannels.set(resolvedSessionId, next);
    return next;
  }

  /**
   * Register a tool handler
   */
  registerTool(
    name: string,
    handler: (args: Record<string, unknown>, sessionId?: string) => Promise<ToolResult>,
  ): void {
    this.tools.set(name, handler);
  }

  async execute(toolCall: ToolCall, sessionId?: string): Promise<ToolResult> {
    const normalizedToolName = toolCall.name.replace(/<\|channel\|>.*$/u, "");
    const canonicalToolName = this.toolAliases.get(normalizedToolName) ?? normalizedToolName;

    if (!this.isToolAllowed(sessionId, canonicalToolName)) {
      const error = `Tool ${canonicalToolName} is not allowed for session ${sessionId || "default"}`;
      console.error(`[TOOL] ${error}`);
      return {
        toolName: canonicalToolName,
        success: false,
        error,
      };
    }

    const handler = this.tools.get(toolCall.name) ?? this.tools.get(canonicalToolName);

    console.log(`[TOOL] Executing: ${toolCall.name}`);
    console.log(`[TOOL]   callId: ${toolCall.callId}`);
    console.log(`[TOOL]   sessionId: ${sessionId || "none"}`);
    console.log(`[TOOL]   args: ${JSON.stringify(toolCall.args)}`);

    if (!handler) {
      console.error(`[TOOL] Unknown tool: ${toolCall.name}`);
      return {
        toolName: toolCall.name,
        success: false,
        error: `Unknown tool: ${toolCall.name}`,
      };
    }

    try {
      console.log(`[TOOL] Running handler for ${toolCall.name}...`);
      const startTime = Date.now();
      const result = await handler(toolCall.args, sessionId);
      const duration = Date.now() - startTime;

      console.log(`[TOOL] ${toolCall.name} completed in ${duration}ms`);
      console.log(`[TOOL]   success: ${result.success}`);
      if (result.success && result.result) {
        console.log(
          `[TOOL]   result: ${JSON.stringify(result.result).slice(0, 200)}${JSON.stringify(result.result).length > 200 ? "..." : ""}`,
        );
      }
      if (!result.success && result.error) {
        console.log(`[TOOL]   error: ${result.error}`);
      }

      if (result.success && sessionId && toolCall.name === "discord.speak") {
        const channel = this.getOutputChannel(sessionId);
        const messageId = (result.result as any)?.messageId ?? (result.result as any)?.message_id;
        if (channel.channelId && messageId) {
          this.channelRouter.recordSpeechMessage(sessionId, channel.channelId, String(messageId));
        } else if (channel.channelId) {
          this.channelRouter.recordSpeech(sessionId, channel.channelId);
        }
      }

      await this.eventBus.publish("tool.result", {
        toolName: toolCall.name,
        callId: toolCall.callId,
        sessionId,
        result: result.result,
        error: result.error,
      });

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[TOOL] ${toolCall.name} failed: ${errorMsg}`);
      const result = {
        toolName: toolCall.name,
        success: false,
        error: errorMsg,
      };

      await this.eventBus.publish("tool.result", {
        toolName: toolCall.name,
        callId: toolCall.callId,
        sessionId,
        result: undefined,
        error: result.error,
      });

      return result;
    }
  }

  /**
   * Get all registered tool definitions for the LLM
   * Uses tool definitions from prompts module to prevent schema/handler drift
   */
  getToolDefinitions(sessionId?: string): ToolDefinition[] {
    return Object.entries(TOOL_REGISTRY)
      .filter(([name]) => this.isToolAllowed(sessionId, name))
      .map(([, entry]) => entry.schema);
  }

  private isToolAllowed(sessionId: string | undefined, toolName: string): boolean {
    if (!sessionId) {
      return true;
    }

    const session = this.sessionResolver?.(sessionId);
    if (!session) {
      return true;
    }

    if (session.toolPermissions.size === 0) {
      return true;
    }

    return session.toolPermissions.has(toolName);
  }

  /**
   * Register default tools from TOOL_REGISTRY
   * Wraps handlers to inject dependencies (chromaStore, discordApiClient, outputChannel)
   */
  private registerDefaultTools(): void {
    const toolAliases: Record<string, string> = {
      // LLM may generate singular form, but tools are registered with plural
      "discord.channel.message": "discord.channel.messages",
      "mind_propose_message": "mind.propose_message",
      "mind_suggest_system_prompt": "mind.suggest_system_prompt",
      "mind_consume_message_proposals": "mind.consume_message_proposals",
      "mind_apply_prompt_update": "mind.apply_prompt_update",
    };

    this.toolAliases = new Map(Object.entries(toolAliases));

    for (const [name, entry] of Object.entries(TOOL_REGISTRY)) {
      this.registerTool(name, (args, sessionId) => {
        const resolvedSessionId = sessionId || "default";
        const session = this.sessionResolver?.(resolvedSessionId);
        const callDeps: ToolDependencies = {
          chromaStore: this.chromaStore,
          openPlannerClient: this.openPlannerClient,
          memoryStore: this.memoryStore,
          discordApiClient: this.discordApiClient,
          ircApiClient: this.ircApiClient,
          mindQueue: this.mindQueue,
          sessionId: resolvedSessionId,
          session,
          listSessions: this.sessionListResolver,
          updateSessionPrompts: this.promptUpdater,
          runtimeInspector: this.runtimeInspector,
          outputChannel: this.getOutputChannel(resolvedSessionId),
          resolveOutputChannel: () => this.resolveOutputChannelForSession(resolvedSessionId),
          setOutputChannel: (channel: OutputChannelState) => {
            this.setOutputChannel(channel, resolvedSessionId);
          },
        };
        return entry.handler(args, callDeps);
      });
    }

    // Register tool aliases for common typos/variations
    for (const [alias, actual] of Object.entries(toolAliases)) {
      if (TOOL_REGISTRY[actual]) {
        this.registerTool(alias, (args, sessionId) => {
          const resolvedSessionId = sessionId || "default";
          const session = this.sessionResolver?.(resolvedSessionId);
          const callDeps: ToolDependencies = {
            chromaStore: this.chromaStore,
            openPlannerClient: this.openPlannerClient,
            memoryStore: this.memoryStore,
            discordApiClient: this.discordApiClient,
            ircApiClient: this.ircApiClient,
            mindQueue: this.mindQueue,
            sessionId: resolvedSessionId,
            session,
            listSessions: this.sessionListResolver,
            updateSessionPrompts: this.promptUpdater,
            runtimeInspector: this.runtimeInspector,
            outputChannel: this.getOutputChannel(resolvedSessionId),
            resolveOutputChannel: () => this.resolveOutputChannelForSession(resolvedSessionId),
            setOutputChannel: (channel: OutputChannelState) => {
              this.setOutputChannel(channel, resolvedSessionId);
            },
          };
          return TOOL_REGISTRY[actual].handler(args, callDeps);
        });
      }
    }
  }

  private buildSemanticQuery(session: Session | undefined, runtimeState: unknown): string {
    const runtime = (runtimeState && typeof runtimeState === "object")
      ? (runtimeState as Record<string, unknown>)
      : {};

    const parts: string[] = [];
    if (session?.attentionFocus) parts.push(`Focus: ${session.attentionFocus}`);

    const promptFieldSummary = runtime.promptFieldSummary;
    if (typeof promptFieldSummary === "string" && promptFieldSummary.trim()) {
      parts.push(`Motifs: ${promptFieldSummary}`);
    }

    const graphSummary = runtime.graphSummary;
    if (typeof graphSummary === "string" && graphSummary.trim()) {
      parts.push(graphSummary);
    }

    const rssSummary = runtime.rssSummary;
    if (typeof rssSummary === "string" && rssSummary.trim()) {
      parts.push(rssSummary);
    }

    return parts.join("\n");
  }

  private async computeSemanticWeights(
    sessionId: string,
    session: Session | undefined,
    channels: Array<{ id: string; name: string; guildId: string; type: string }>,
  ): Promise<Map<string, number>> {
    const enabled = /^(1|true|yes|on)$/i.test(
      process.env.CEPHALON_SEMANTIC_ROUTER_ENABLED ?? "1",
    );
    if (!enabled) return new Map();
    if (!this.openPlannerClient || !this.runtimeInspector) return new Map();

    const ttlMs = Number(process.env.CEPHALON_SEMANTIC_ROUTER_TTL_MS || 120_000);
    const now = Date.now();
    const cached = this.semanticWeightsCache.get(sessionId);
    if (cached && now - cached.computedAt < ttlMs) {
      return cached.weights;
    }

    const runtimeState = await this.runtimeInspector?.();
    const query = this.buildSemanticQuery(session, runtimeState);
    if (!query.trim()) return new Map();

    const candidateIds = new Set(channels.map((c) => c.id));

    const allowGuilds = (process.env.CEPHALON_SEMANTIC_GUILD_ALLOWLIST || "")
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allowGuildSet = allowGuilds.length ? new Set(allowGuilds) : null;

    const k = Math.max(8, Math.min(160, Number(process.env.CEPHALON_SEMANTIC_ROUTER_K || 64)));

    const weights = new Map<string, number>();
    try {
      const results = await this.openPlannerClient.search(query, { limit: k });

      for (const result of results) {
        const meta = (result as any).meta ?? {};
        const channelId =
          (typeof meta.source_channel_id === "string" && meta.source_channel_id) ||
          (typeof meta.sourceChannelId === "string" && meta.sourceChannelId) ||
          (typeof meta.channel_id === "string" && meta.channel_id) ||
          (typeof meta.channelId === "string" && meta.channelId) ||
          undefined;

        const guildId =
          (typeof meta.source_guild_id === "string" && meta.source_guild_id) ||
          (typeof meta.sourceGuildId === "string" && meta.sourceGuildId) ||
          (typeof meta.guild_id === "string" && meta.guild_id) ||
          (typeof meta.guildId === "string" && meta.guildId) ||
          undefined;

        if (!channelId || !candidateIds.has(channelId)) continue;
        if (allowGuildSet && (!guildId || !allowGuildSet.has(guildId))) continue;

        const score = typeof (result as any).score === "number" ? (result as any).score : 0;
        const tsRaw = typeof (result as any).ts === "string" ? (result as any).ts : "";
        const ts = tsRaw ? Date.parse(tsRaw) : NaN;
        const ageHours = Number.isFinite(ts) ? (now - ts) / 3_600_000 : 24;
        const recency = 1 / (1 + Math.max(0, ageHours) / 24);
        const bump = score * recency;
        if (bump <= 0) continue;
        weights.set(channelId, (weights.get(channelId) ?? 0) + bump);
      }
    } catch {
      // Fail closed: semantic routing is an optional enhancer.
      return new Map();
    }

    const total = Array.from(weights.values()).reduce((sum, value) => sum + value, 0);
    if (total <= 0) {
      this.semanticWeightsCache.set(sessionId, { computedAt: now, weights: new Map() });
      return new Map();
    }

    const normalized = new Map<string, number>();
    for (const [channelId, value] of weights.entries()) {
      normalized.set(channelId, value / total);
    }

    this.semanticWeightsCache.set(sessionId, { computedAt: now, weights: normalized });
    return normalized;
  }
}

export type { ToolCall, ToolDependencies, ToolExecutorOptions } from "./types.js";
