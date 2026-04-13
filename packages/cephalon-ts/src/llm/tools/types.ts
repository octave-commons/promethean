/**
 * Tool Types
 * 
 * Type definitions for tool execution system.
 */

import type { ToolResult } from "../../types/index.js";
import type { ToolDefinition } from "../../prompts/index.js";
import type { DiscordApiClient } from "../../discord/api-client.js";
import type { IrcApiClient } from "../../irc/api-client.js";
import type { ChromaMemoryStore } from "../../chroma/client.js";
import type { OpenPlannerClient } from "../../openplanner/client.js";
import type { MemoryStore } from "../../core/memory-store.js";
import type { Session } from "../../types/index.js";
import type { CephalonMindQueue } from "../../mind/integration-queue.js";

/**
 * Tool call interface
 */
export interface ToolCall {
  type: "tool_call";
  name: string;
  args: Record<string, unknown>;
  callId: string;
}

/**
 * Tool registry entry: combines schema (ToolDefinition) with handler
 */
export type ToolRegistryEntry = {
  schema: ToolDefinition;
  handler: (
    args: Record<string, unknown>,
    deps: ToolDependencies,
  ) => Promise<ToolResult>;
};

/**
 * Output channel state - controls where spontaneous messages go
 */
export type OutputChannelState = {
  channelId: string | null;
  channelName?: string;
  serverName?: string;
  setAt: number;
  mode?: "auto" | "manual";
  reason?: string;
};

/**
 * Tool dependencies injected at runtime
 */
export type ToolDependencies = {
  chromaStore?: ChromaMemoryStore;
  openPlannerClient?: OpenPlannerClient;
  memoryStore?: MemoryStore;
  discordApiClient: DiscordApiClient;
  ircApiClient?: IrcApiClient;
  mindQueue?: CephalonMindQueue;
  sessionId?: string;
  session?: Session;
  listSessions?: () => Session[];
  updateSessionPrompts?: (sessionId: string, updates: {
    systemPrompt?: string;
    developerPrompt?: string;
    attentionFocus?: string;
  }) => Session | undefined;
  runtimeInspector?: () => unknown | Promise<unknown>;
  /** Output channel for spontaneous messages - set by discord.set_output_channel */
  outputChannel?: OutputChannelState;
  /** Resolve or auto-select an output channel for the current session */
  resolveOutputChannel?: () => Promise<OutputChannelState | undefined>;
  /** Callback to update output channel */
  setOutputChannel?: (channel: OutputChannelState) => void;
};

/**
 * Tool executor options
 */
export interface ToolExecutorOptions {
  chromaStore?: ChromaMemoryStore;
  openPlannerClient?: OpenPlannerClient;
  memoryStore?: MemoryStore;
  discordApiClient: DiscordApiClient;
  ircApiClient?: IrcApiClient;
  mindQueue?: CephalonMindQueue;
  runtimeInspector?: () => unknown | Promise<unknown>;
}
