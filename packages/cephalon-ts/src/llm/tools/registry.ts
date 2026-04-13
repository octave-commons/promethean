/**
 * Tool Registry
 *
 * Single source of truth for all tools.
 * Prevents drift between tool definitions (schema) and implementations (handler).
 */

import type { ToolDefinition } from "../../prompts/index.js";
import {
  addGrownEntertainmentPersona,
  listGrownEntertainmentPersonas,
} from "../../prompts/entertainment-personas.js";
import type { Memory, ToolResult } from "../../types/index.js";
import type { ToolRegistryEntry, ToolDependencies } from "./types.js";
import { browserTools } from "./browser.js";
import { tenorTools } from "./tenor.js";
import { callVisionWithOpenAI } from "../vision.js";
import { getPeerApiBaseUrl, getSelfName } from "../../peer/runtime.js";

async function callPeerApi(
  peer: string,
  pathname: string,
  init: RequestInit = {},
): Promise<Response> {
  const caller = getSelfName();
  const baseUrl = getPeerApiBaseUrl(peer);
  const headers = new Headers(init.headers ?? {});
  headers.set("x-cephalon-caller", caller);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers,
  });
}

const TRACE_STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "this",
  "with",
  "from",
  "have",
  "your",
  "about",
  "into",
  "just",
  "they",
  "them",
  "what",
  "when",
  "where",
  "which",
  "while",
  "would",
  "could",
  "there",
  "their",
  "then",
  "than",
  "because",
  "been",
  "were",
  "will",
  "should",
  "some",
  "like",
  "only",
  "really",
  "also",
  "still",
  "http",
  "https",
  "image",
  "result",
  "error",
]);

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, " ");
}

function extractTraceTokens(text: string): string[] {
  return stripUrls(text)
    .toLowerCase()
    .split(/[^a-z0-9#@:_-]+/)
    .filter((token) => token.length >= 4)
    .filter((token) => !TRACE_STOP_WORDS.has(token));
}

function countBy<T extends string>(values: readonly T[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topTraceTokens(memories: readonly Memory[], limit = 8): Array<{ token: string; count: number }> {
  const counts = new Map<string, number>();

  for (const memory of memories) {
    for (const token of extractTraceTokens(memory.content.text || "")) {
      counts.set(token, (counts.get(token) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([token, count]) => ({ token, count }));
}

async function collectRecentMemories(
  deps: ToolDependencies,
  limit: number,
): Promise<Memory[]> {
  if (deps.memoryStore && deps.sessionId) {
    return deps.memoryStore.findRecent(deps.sessionId, limit);
  }

  return (deps.session?.recentBuffer ?? []).slice(-limit).reverse();
}

function summarizeTraceSignals(memories: readonly Memory[]) {
  return {
    questionPressure: memories.filter((memory) =>
      memory.role === "user"
      && (/\?/u.test(memory.content.text) || /\b(why|how|what|help)\b/i.test(memory.content.text)),
    ).length,
    repairPressure: memories.filter((memory) =>
      /\b(sorry|fix|wrong|repair|please|should|careful)\b/i.test(memory.content.text),
    ).length,
    imagePressure: memories.filter((memory) => memory.kind === "image").length,
    linkPressure: memories.filter((memory) => /https?:\/\//i.test(memory.content.text)).length,
    toolFailurePressure: memories.filter((memory) =>
      memory.kind === "tool_result" && /^Error:/i.test(memory.content.text),
    ).length,
  };
}

function isIrcTarget(value: string | undefined): boolean {
  return Boolean(value && value.startsWith("irc:"));
}

function normalizeChatPlatform(value: unknown): "discord" | "irc" | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "discord" || normalized === "irc") {
    return normalized;
  }

  return undefined;
}

function blankToUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function truncateText(value: string, max = 1200): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function sanitizeProposalIds(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return sanitizeProposalIds(parsed);
      }
    } catch {
      void 0;
    }

    return trimmed
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function listChatServers(
  deps: ToolDependencies,
  platform?: "discord" | "irc",
): Promise<{ servers: Array<{ id: string; name: string; memberCount: number }>; count: number }> {
  const servers: Array<{ id: string; name: string; memberCount: number }> = [];

  if (!platform || platform === "discord") {
    try {
      const result = await deps.discordApiClient.listServers();
      servers.push(...result.servers);
    } catch {
      void 0;
    }
  }

  if ((!platform || platform === "irc") && deps.ircApiClient) {
    const result = await deps.ircApiClient.listServers();
    servers.push(...result.servers);
  }

  return { servers, count: servers.length };
}

async function listChatChannels(
  deps: ToolDependencies,
  guildId?: string,
  platform?: "discord" | "irc",
): Promise<{ channels: Array<{ id: string; name: string; guildId: string; type: string }>; count: number }> {
  if (isIrcTarget(guildId) && deps.ircApiClient) {
    return deps.ircApiClient.listChannels(guildId);
  }

  const channels: Array<{ id: string; name: string; guildId: string; type: string }> = [];

  if (!platform || platform === "discord") {
    try {
      const result = await deps.discordApiClient.listChannels(guildId);
      channels.push(...result.channels);
    } catch {
      void 0;
    }
  }

  if ((!platform || platform === "irc") && deps.ircApiClient) {
    const result = await deps.ircApiClient.listChannels(guildId && !isIrcTarget(guildId) ? undefined : guildId);
    channels.push(...result.channels);
  }

  return { channels, count: channels.length };
}

async function fetchChatMessages(
  deps: ToolDependencies,
  channelId: string,
  options: { limit?: number; before?: string; after?: string; around?: string } = {},
) {
  if (isIrcTarget(channelId)) {
    if (!deps.ircApiClient) {
      throw new Error("IRC client not configured");
    }

    return deps.ircApiClient.fetchChannelMessages(channelId, {
      limit: options.limit,
      before: options.before,
    });
  }

  return deps.discordApiClient.fetchChannelMessages(channelId, options);
}

async function searchChatMessages(
  deps: ToolDependencies,
  scope: "channel" | "dm",
  options: {
    channelId?: string;
    userId?: string;
    query?: string;
    limit?: number;
    before?: string;
    after?: string;
    platform?: "discord" | "irc";
  },
) {
  if (options.platform === "irc" || isIrcTarget(options.channelId)) {
    if (!deps.ircApiClient) {
      throw new Error("IRC client not configured");
    }
    if (scope !== "channel") {
      throw new Error("IRC DM search is not supported");
    }
    if (!options.channelId) {
      throw new Error("IRC channel_id is required for search");
    }

    return deps.ircApiClient.searchMessages(options.channelId, {
      query: options.query,
      userId: options.userId,
      limit: options.limit,
      before: options.before,
    });
  }

  return deps.discordApiClient.searchMessages(scope, options);
}

async function sendChatMessage(
  deps: ToolDependencies,
  channelId: string,
  text: string,
  replyTo?: string,
) {
  if (isIrcTarget(channelId)) {
    if (!deps.ircApiClient) {
      throw new Error("IRC client not configured");
    }
    return deps.ircApiClient.sendMessage(channelId, text, replyTo);
  }

  return deps.discordApiClient.sendMessage(channelId, text, replyTo);
}

/**
 * Single source of truth for all tools.
 * Prevents drift between tool definitions (schema) and implementations (handler).
 */
export const TOOL_REGISTRY: Record<string, ToolRegistryEntry> = {
  "memory.lookup": {
    schema: {
      name: "memory.lookup",
      description:
        "Semantic search for memories in the database using a query string. Returns relevant memories with similarity scores. Ask natural language questions.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant memories",
          },
          limit: {
            type: "number",
            description: "Maximum number of memories to return (default: 5)",
          },
        },
        required: ["query"],
      },
    },
    handler: async (args, deps) => {
      const { query, limit = 5 } = args as { query: string; limit: number };

      console.log(`[TOOL] memory.lookup called`);
      console.log(`[TOOL]   query: "${query}"`);
      console.log(`[TOOL]   limit: ${limit}`);

      let results: Array<{ id: string; content: string; similarity: number }> =
        [];

      try {
        if (deps.openPlannerClient) {
          const searchResults = await deps.openPlannerClient.searchFts(query, {
            limit,
            session: deps.sessionId,
          });
          results = searchResults.map((r) => ({
            id: r.id,
            content: r.text ?? "",
            similarity: r.score,
          }));
          console.log(`[TOOL]   Found ${results.length} memories from OpenPlanner`);
        }

        return {
          toolName: "memory.lookup",
          success: true,
          result: {
            query,
            limit,
            results,
            note: results.length === 0 ? "No matches found" : undefined,
          },
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[TOOL] memory.lookup failed: ${errorMsg}`);
        return {
          toolName: "memory.lookup",
          success: false,
          error: errorMsg,
        };
      }
    },
  },

  "memory.pin": {
    schema: {
      name: "memory.pin",
      description:
        "Pin a memory to keep it in the context window. Use memory.lookup to find memory IDs",
      parameters: {
        type: "object",
        properties: {
          memory_id: {
            type: "string",
            description: "The ID of the memory to pin",
          },
          priority: {
            type: "number",
            description: "Priority level for the pinned memory (default: 10)",
          },
        },
        required: ["memory_id"],
      },
    },
    handler: async (args) => {
      const { memory_id, priority = 10 } = args as {
        memory_id: string;
        priority: number;
      };

      console.log(`[TOOL] memory.pin called`);
      console.log(`[TOOL]   memory_id: ${memory_id}`);
      console.log(`[TOOL]   priority: ${priority}`);

      return {
        toolName: "memory.pin",
        success: true,
        result: { memory_id, priority, pinned: true },
      };
    },
  },

  "self.growth": {
    schema: {
      name: "self.growth",
      description:
        "Persist growth artifacts for this cephalon. Primary use: add new entertainment persona seeds over time so the persona pool keeps expanding.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: [
              "add_entertainment_persona",
              "list_entertainment_personas",
            ],
            description:
              "What to do: add a new entertainment persona seed, or list the grown personas currently stored.",
          },
          name: {
            type: "string",
            description:
              "Persona name/title (required for add_entertainment_persona).",
          },
          prompt: {
            type: "string",
            description:
              "Persona prompt text (required for add_entertainment_persona). You MAY include {recentActivity} placeholder.",
          },
          created_by: {
            type: "string",
            description:
              "Optional attribution (defaults to this cephalon).",
          },
          limit: {
            type: "number",
            description:
              "For list_entertainment_personas: how many to return (default: 20).",
          },
        },
        required: ["action"],
      },
    },
    handler: async (args, deps) => {
      const {
        action,
        name,
        prompt,
        created_by,
        limit = 20,
      } = args as {
        action: "add_entertainment_persona" | "list_entertainment_personas";
        name?: string;
        prompt?: string;
        created_by?: string;
        limit?: number;
      };

      console.log(`[TOOL] self.growth called (${action})`);

      try {
        if (action === "add_entertainment_persona") {
          if (typeof name !== "string" || !name.trim()) {
            throw new Error("name is required");
          }
          if (typeof prompt !== "string" || !prompt.trim()) {
            throw new Error("prompt is required");
          }

          const createdBy =
            typeof created_by === "string" && created_by.trim()
              ? created_by.trim()
              : deps.session?.cephalonId ?? getSelfName();

          const result = await addGrownEntertainmentPersona({
            name,
            prompt,
            createdBy,
          });

          return {
            toolName: "self.growth",
            success: true,
            result: {
              action,
              added: {
                id: result.added.id,
                name: result.added.name,
                createdAt: result.added.createdAt,
              },
              counts: {
                grown: result.grown,
                total: result.total,
              },
            },
          };
        }

        if (action === "list_entertainment_personas") {
          const personas = await listGrownEntertainmentPersonas();
          const safeLimit = Math.max(1, Math.min(200, Number(limit) || 20));
          const slice = personas.slice(-safeLimit).map((p) => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt,
            createdBy: p.createdBy,
          }));

          return {
            toolName: "self.growth",
            success: true,
            result: {
              action,
              count: personas.length,
              personas: slice,
            },
          };
        }

        return {
          toolName: "self.growth",
          success: false,
          error: `Unknown action: ${String(action)}`,
        };
      } catch (error) {
        return {
          toolName: "self.growth",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "heuretic.trace_review": {
    schema: {
      name: "heuretic.trace_review",
      description:
        "Review recent session traces to identify repeated motifs, question pressure, repair pressure, tool failures, and candidate attractors worth reinforcing or damping.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "How many recent memories to inspect from the current session (default: 24)",
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { limit = 24 } = args as { limit?: number };
      const recentMemories = await collectRecentMemories(deps, limit);
      const roleCounts = countBy(recentMemories.map((memory) => memory.role));
      const kindCounts = countBy(recentMemories.map((memory) => memory.kind));
      const topTokens = topTraceTokens(recentMemories, 8);
      const signals = summarizeTraceSignals(recentMemories);

      return {
        toolName: "heuretic.trace_review",
        success: true,
        result: {
          sessionId: deps.sessionId,
          sampleSize: recentMemories.length,
          roleCounts,
          kindCounts,
          topTokens,
          signals,
          candidateAttractors: topTokens.slice(0, 3).map((entry) => entry.token),
        },
      };
    },
  },

  "metisean.session_audit": {
    schema: {
      name: "metisean.session_audit",
      description:
        "Inspect the current session's architecture: prompts, allowed tools, routing hints, recent trace mix, and likely structural issues.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "How many recent memories to inspect from the current session (default: 24)",
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { limit = 24 } = args as { limit?: number };
      const session = deps.session;
      const recentMemories = await collectRecentMemories(deps, limit);
      const kindCounts = countBy(recentMemories.map((memory) => memory.kind));
      const roleCounts = countBy(recentMemories.map((memory) => memory.role));
      const signals = summarizeTraceSignals(recentMemories);
      const allowedTools = session ? Array.from(session.toolPermissions).sort((left, right) => left.localeCompare(right)) : [];
      const observations: string[] = [];

      if (!session) {
        observations.push("No session object was injected into the tool context.");
      } else {
        observations.push(
          session.toolPermissions.size === 0
            ? "Open tool surface: this session is not restricted to a mode-specific tool bundle."
            : `Restricted tool surface: ${session.toolPermissions.size} mode-specific tools enabled.`,
        );

        observations.push(
          session.systemPrompt
            ? "Dedicated system prompt is active for this circuit."
            : "Legacy persona path: no circuit-specific system prompt detected.",
        );

        observations.push(
          session.developerPrompt
            ? "Dedicated developer prompt is active for this circuit."
            : "Legacy developer path: no circuit-specific developer prompt detected.",
        );
      }

      if (!deps.outputChannel?.channelId) {
        observations.push("No output channel is currently selected for spontaneous speech.");
      }

      if (signals.toolFailurePressure > 0) {
        observations.push("Recent trace includes tool-result failures; structural friction is present.");
      }

      if ((kindCounts.tool_call || 0) + (kindCounts.tool_result || 0) > (kindCounts.message || 0)) {
        observations.push("Recent trace is tool-heavy relative to conversational output.");
      }

      if (recentMemories.length === 0) {
        observations.push("Session trace is cold; any architectural judgment is provisional.");
      }

      return {
        toolName: "metisean.session_audit",
        success: true,
        result: {
          sessionId: deps.sessionId,
          circuitIndex: session?.circuitIndex,
          modelName: session?.modelName,
          reasoningEffort: session?.reasoningEffort,
          attentionFocus: session?.attentionFocus,
          defaultChannelHints: session?.defaultChannelHints ?? [],
          outputChannel: deps.outputChannel,
          promptLayers: {
            hasSystemPrompt: Boolean(session?.systemPrompt),
            hasDeveloperPrompt: Boolean(session?.developerPrompt),
            hasPersona: Boolean(session?.persona),
          },
          allowedTools,
          sampleSize: recentMemories.length,
          kindCounts,
          roleCounts,
          signals,
          observations,
        },
      };
    },
  },

  "mind.propose_message": {
    schema: {
      name: "mind.propose_message",
      description:
        "Queue a candidate outward message for Circuit III to integrate before anything is spoken publicly.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The candidate message text.",
          },
          rationale: {
            type: "string",
            description: "Why this message matters right now.",
          },
          channel_id: {
            type: "string",
            description: "Optional preferred output channel id.",
          },
          channel_name: {
            type: "string",
            description: "Optional preferred output channel name.",
          },
        },
        required: ["text"],
      },
    },
    handler: async (args, deps) => {
      const text = blankToUndefined(args.text);
      if (!text) {
        return {
          toolName: "mind.propose_message",
          success: false,
          error: "text is required",
        };
      }

      if (!deps.mindQueue || !deps.session || !deps.sessionId) {
        return {
          toolName: "mind.propose_message",
          success: false,
          error: "mind queue unavailable",
        };
      }

      const proposal = deps.mindQueue.proposeMessage({
        sessionId: deps.sessionId,
        cephalonId: deps.session.cephalonId,
        circuitIndex: deps.session.circuitIndex,
        content: truncateText(text, 4000),
        rationale: blankToUndefined(args.rationale),
        suggestedChannelId: blankToUndefined(args.channel_id),
        suggestedChannelName: blankToUndefined(args.channel_name),
      });

      return {
        toolName: "mind.propose_message",
        success: true,
        result: {
          proposalId: proposal.id,
          queued: true,
          messageProposalCount: deps.mindQueue.summary().messageProposalCount,
        },
      };
    },
  },

  "mind.suggest_system_prompt": {
    schema: {
      name: "mind.suggest_system_prompt",
      description:
        "Queue a suggested system/developer prompt change for Circuit IV to adjudicate.",
      parameters: {
        type: "object",
        properties: {
          target_session_id: {
            type: "string",
            description: "Target circuit/session id.",
          },
          system_prompt: {
            type: "string",
            description: "Suggested system prompt revision.",
          },
          developer_prompt: {
            type: "string",
            description: "Suggested developer prompt revision.",
          },
          attention_focus: {
            type: "string",
            description: "Suggested attention focus revision.",
          },
          rationale: {
            type: "string",
            description: "Why this prompt change should happen.",
          },
        },
        required: ["target_session_id"],
      },
    },
    handler: async (args, deps) => {
      const targetSessionId = blankToUndefined(args.target_session_id);
      if (!targetSessionId) {
        return {
          toolName: "mind.suggest_system_prompt",
          success: false,
          error: "target_session_id is required",
        };
      }

      const systemPrompt = blankToUndefined(args.system_prompt);
      const developerPrompt = blankToUndefined(args.developer_prompt);
      const attentionFocus = blankToUndefined(args.attention_focus);

      if (!systemPrompt && !developerPrompt && !attentionFocus) {
        return {
          toolName: "mind.suggest_system_prompt",
          success: false,
          error: "at least one prompt field is required",
        };
      }

      if (!deps.mindQueue || !deps.session || !deps.sessionId) {
        return {
          toolName: "mind.suggest_system_prompt",
          success: false,
          error: "mind queue unavailable",
        };
      }

      const proposal = deps.mindQueue.proposePrompt({
        proposerSessionId: deps.sessionId,
        proposerCephalonId: deps.session.cephalonId,
        proposerCircuitIndex: deps.session.circuitIndex,
        targetSessionId,
        rationale: blankToUndefined(args.rationale),
        systemPrompt: systemPrompt ? truncateText(systemPrompt, 6000) : undefined,
        developerPrompt: developerPrompt ? truncateText(developerPrompt, 6000) : undefined,
        attentionFocus,
      });

      return {
        toolName: "mind.suggest_system_prompt",
        success: true,
        result: {
          proposalId: proposal.id,
          queued: true,
          promptProposalCount: deps.mindQueue.summary().promptProposalCount,
        },
      };
    },
  },

  "mind.consume_message_proposals": {
    schema: {
      name: "mind.consume_message_proposals",
      description:
        "Mark message proposals as integrated after Circuit III has used them.",
      parameters: {
        type: "object",
        properties: {
          proposal_ids: {
            type: "string",
            description: "Queued message proposal ids to consume, as a JSON array string or comma-separated list.",
          },
        },
        required: ["proposal_ids"],
      },
    },
    handler: async (args, deps) => {
      if (!deps.mindQueue) {
        return {
          toolName: "mind.consume_message_proposals",
          success: false,
          error: "mind queue unavailable",
        };
      }

      const proposalIds = sanitizeProposalIds(args.proposal_ids);
      const consumed = deps.mindQueue.consumeMessageProposals(proposalIds);

      return {
        toolName: "mind.consume_message_proposals",
        success: true,
        result: {
          consumedIds: consumed.map((proposal) => proposal.id),
          consumedCount: consumed.length,
          remaining: deps.mindQueue.summary().messageProposalCount,
        },
      };
    },
  },

  "mind.apply_prompt_update": {
    schema: {
      name: "mind.apply_prompt_update",
      description:
        "Apply a prompt update to a target circuit and optionally consume the accepted prompt proposals.",
      parameters: {
        type: "object",
        properties: {
          target_session_id: {
            type: "string",
            description: "Target circuit/session id.",
          },
          system_prompt: {
            type: "string",
            description: "New system prompt.",
          },
          developer_prompt: {
            type: "string",
            description: "New developer prompt.",
          },
          attention_focus: {
            type: "string",
            description: "New attention focus.",
          },
          accepted_proposal_ids: {
            type: "string",
            description: "Prompt proposal ids to consume after applying, as a JSON array string or comma-separated list.",
          },
        },
        required: ["target_session_id"],
      },
    },
    handler: async (args, deps) => {
      const targetSessionId = blankToUndefined(args.target_session_id);
      if (!targetSessionId) {
        return {
          toolName: "mind.apply_prompt_update",
          success: false,
          error: "target_session_id is required",
        };
      }

      if (!deps.updateSessionPrompts) {
        return {
          toolName: "mind.apply_prompt_update",
          success: false,
          error: "prompt updater unavailable",
        };
      }

      const updated = deps.updateSessionPrompts(targetSessionId, {
        systemPrompt: blankToUndefined(args.system_prompt),
        developerPrompt: blankToUndefined(args.developer_prompt),
        attentionFocus: blankToUndefined(args.attention_focus),
      });

      if (!updated) {
        return {
          toolName: "mind.apply_prompt_update",
          success: false,
          error: `unknown target session: ${targetSessionId}`,
        };
      }

      const acceptedProposalIds = sanitizeProposalIds(args.accepted_proposal_ids);
      const consumed = deps.mindQueue?.consumePromptProposals(acceptedProposalIds) ?? [];

      return {
        toolName: "mind.apply_prompt_update",
        success: true,
        result: {
          targetSessionId,
          consumedProposalIds: consumed.map((proposal) => proposal.id),
          remainingPromptProposals: deps.mindQueue?.summary().promptProposalCount ?? 0,
        },
      };
    },
  },

  "field.observe": {
    schema: {
      name: "field.observe",
      description:
        "Internal runtime snapshot (routing + summaries + recent signals). Use it to decide what to do, then translate it into a human-relevant action, concise language, or silence.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: async (_args, deps) => {
      const runtimeState = await deps.runtimeInspector?.();
      const session = deps.session;

      return {
        toolName: "field.observe",
        success: true,
        result: {
          sessionId: deps.sessionId,
          currentSession: session
            ? {
                id: session.id,
                circuitIndex: session.circuitIndex,
                modelName: session.modelName,
                reasoningEffort: session.reasoningEffort,
                attentionFocus: session.attentionFocus,
                defaultChannelHints: session.defaultChannelHints ?? [],
                toolPermissions: Array.from(session.toolPermissions).sort((left, right) => left.localeCompare(right)),
                outputChannel: deps.outputChannel,
              }
            : undefined,
          runtimeState,
        },
      };
    },
  },

  "discord.channel.messages": {
    schema: {
      name: "discord.channel.messages",
      description:
        "Fetch messages from a chat channel. Works with Discord channel IDs and IRC channel IDs returned by discord.list.channels. Use discord.list.channels FIRST to discover valid targets.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: 'Optional platform hint: "discord" or "irc". Usually inferred from channel_id.',
            enum: ["discord", "irc"],
          },
          channel_id: {
            type: "string",
            description:
              "The chat channel ID. Discord IDs are native snowflakes; IRC channels are returned as ids starting with irc: from discord.list.channels.",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of messages to fetch (default: 50, max: 100)",
          },
          before: {
            type: "string",
            description: "Fetch messages before this message ID",
          },
          after: {
            type: "string",
            description: "Fetch messages after this message ID",
          },
          around: {
            type: "string",
            description: "Fetch messages around this message ID",
          },
        },
        required: ["channel_id"],
      },
    },
    handler: async (args, deps) => {
      const {
        platform,
        channel_id,
        limit = 50,
        before,
        after,
        around,
      } = args as {
        platform?: "discord" | "irc";
        channel_id: string;
        limit?: number;
        before?: string;
        after?: string;
        around?: string;
      };

      try {
        const result = await fetchChatMessages(deps, channel_id, {
          limit,
          before: blankToUndefined(before),
          after: blankToUndefined(after),
          around: blankToUndefined(around),
        });

        // [ImageLogger] Log images found in channel messages
        let totalImages = 0;
        const imageTypes: Record<string, number> = {};

        for (const msg of result.messages) {
          if (msg.attachments && msg.attachments.length > 0) {
            for (const att of msg.attachments) {
              const isImage =
                att.contentType?.startsWith("image/") ||
                /\.(jpg|jpeg|png|gif|webp|bmp|webp|avif)$/i.test(
                  att.filename || "",
                );

              if (isImage) {
                totalImages++;
                const ext = (att.filename?.split(".").pop()?.toLowerCase() ||
                  att.contentType?.split("/")[1] ||
                  "unknown") as string;
                imageTypes[ext] = (imageTypes[ext] || 0) + 1;

                console.log(
                  `[ImageLogger] discord.channel.messages found image: <${att.contentType || "unknown"}> ${att.filename || "unnamed"} URL: ${att.url}`,
                );
              }
            }
          }

          // Also check embeds for images (rich media)
          // Cast embeds to extended DiscordEmbed type for thumbnail/image access
          const embeds = msg.embeds as Array<{
            type?: string;
            thumbnail?: { url?: string };
            image?: { url?: string };
          }>;

          if (embeds && embeds.length > 0) {
            for (const embed of embeds) {
              if (embed.type === "image" || embed.type === "gifv") {
                totalImages++;
                const ext = embed.type === "gifv" ? "gif" : "embed_image";
                imageTypes[ext] = (imageTypes[ext] || 0) + 1;
                console.log(
                  `[ImageLogger] discord.channel.messages found embed image: <${embed.type}>`,
                );
              }
              // Check thumbnail in non-image embeds
              if (embed.thumbnail?.url && embed.type !== "image") {
                totalImages++;
                imageTypes["thumbnail"] = (imageTypes["thumbnail"] || 0) + 1;
                console.log(
                  `[ImageLogger] discord.channel.messages found embed thumbnail: ${embed.thumbnail.url}`,
                );
              }
              // Check for images in embed.image property
              if (embed.image?.url) {
                totalImages++;
                imageTypes["embed_image"] =
                  (imageTypes["embed_image"] || 0) + 1;
                console.log(
                  `[ImageLogger] discord.channel.messages found embed.image: ${embed.image.url}`,
                );
              }
            }
          }
        }

        if (totalImages > 0) {
          console.log(
            `[ImageLogger] discord.channel.messages summary: ${totalImages} total images found`,
          );
          console.log(
            `[ImageLogger] Breakdown by type: ${JSON.stringify(imageTypes)}`,
          );
        } else {
          console.log(
            `[ImageLogger] discord.channel.messages: No images found in ${result.messages.length} messages`,
          );
        }

        return {
          toolName: "discord.channel.messages",
          success: true,
          result: { messages: result.messages, count: result.count },
        };
      } catch (error) {
        // On error, return available channels so the LLM can discover correct ones
        let accessibleChannels: Array<{
          id: string;
          name: string;
          guildId: string;
          type: string;
        }> = [];
        try {
          const channelsResult = await listChatChannels(deps, undefined, normalizeChatPlatform(platform));
          accessibleChannels = channelsResult.channels;
        } catch {
          // Best effort - if we can't list channels, just return the error
        }

        return {
          toolName: "discord.channel.messages",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          available_channels: accessibleChannels,
          available_channels_count: accessibleChannels.length,
          hint:
            accessibleChannels.length > 0
              ? "Channel not accessible. Use one of the available_channels above. Call discord.list.channels to get more details."
              : "No accessible channels found. Make sure the bot is in the server and has proper permissions.",
        };
      }
    },
  },

  "discord.channel.scroll": {
    schema: {
      name: "discord.channel.scroll",
      description:
        "Scroll through channel messages (sugar over messages with before=oldest-seen-id). Use discord.list.channels to find a channel",
      parameters: {
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description: "The Discord channel ID to scroll through",
          },
          oldest_seen_id: {
            type: "string",
            description:
              "The oldest message ID already seen - fetch messages before this",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of messages to fetch (default: 50, max: 100)",
          },
        },
        required: ["channel_id", "oldest_seen_id"],
      },
    },
    handler: async (args, deps) => {
      const {
        channel_id,
        oldest_seen_id,
        limit = 50,
      } = args as {
        channel_id: string;
        oldest_seen_id: string;
        limit?: number;
      };

      try {
        const result = await fetchChatMessages(deps, channel_id, {
          limit,
          before: blankToUndefined(oldest_seen_id),
        });
        return {
          toolName: "discord.channel.scroll",
          success: true,
          result: {
            messages: result.messages,
            count: result.count,
            oldest_seen_id,
          },
        };
      } catch (error) {
        return {
          toolName: "discord.channel.scroll",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "discord.dm.messages": {
    schema: {
      name: "discord.dm.messages",
      description: "Fetch messages from a DM channel with a user",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: 'Optional platform hint. IRC does not support this tool.',
            enum: ["discord", "irc"],
          },
          user_id: {
            type: "string",
            description: "The Discord user ID to open DM with",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of messages to fetch (default: 50, max: 100)",
          },
          before: {
            type: "string",
            description: "Fetch messages before this message ID",
          },
        },
        required: ["user_id"],
      },
    },
    handler: async (args, deps) => {
      const {
        platform,
        user_id,
        limit = 50,
        before,
      } = args as {
        platform?: "discord" | "irc";
        user_id: string;
        limit?: number;
        before?: string;
      };

      if (normalizeChatPlatform(platform) === "irc") {
        return {
          toolName: "discord.dm.messages",
          success: false,
          error: "IRC DM history is not supported by this tool surface.",
        };
      }

      try {
        const result = await deps.discordApiClient.fetchDMMessages(user_id, {
          limit,
          before: blankToUndefined(before),
        });
        return {
          toolName: "discord.dm.messages",
          success: true,
          result: {
            messages: result.messages,
            count: result.count,
            dm_channel_id: result.dmChannelId,
          },
        };
      } catch (error) {
        return {
          toolName: "discord.dm.messages",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "discord.search": {
    schema: {
      name: "discord.search",
      description:
        "Search messages in a Discord channel or DM. Supports filtering by query text and user ID. Falls back to client-side filtering if native search unavailable.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: 'Optional platform hint: "discord" or "irc". Usually inferred from channel_id.',
            enum: ["discord", "irc"],
          },
          scope: {
            type: "string",
            description: 'Search scope: "channel" or "dm"',
            enum: ["channel", "dm"],
          },
          channel_id: {
            type: "string",
            description: "Channel ID to search (required if scope=channel)",
          },
          user_id: {
            type: "string",
            description: "User ID for DM search (required if scope=dm)",
          },
          query: {
            type: "string",
            description: "Optional text to search for in message content",
          },
          limit: {
            type: "number",
            description: "Maximum results to return (default: 50, max: 100)",
          },
          before: {
            type: "string",
            description: "Fetch messages before this message ID",
          },
          after: {
            type: "string",
            description: "Fetch messages after this message ID",
          },
        },
        required: ["scope"],
      },
    },
    handler: async (args, deps) => {
      const {
        platform,
        scope,
        channel_id,
        user_id,
        query,
        limit = 50,
        before,
        after,
      } = args as {
        platform?: "discord" | "irc";
        scope: "channel" | "dm";
        channel_id?: string;
        user_id?: string;
        query?: string;
        limit?: number;
        before?: string;
        after?: string;
      };

      try {
        const result = await searchChatMessages(deps, scope, {
          channelId: channel_id,
          userId: user_id,
          query,
          limit,
          before: blankToUndefined(before),
          after: blankToUndefined(after),
          platform: normalizeChatPlatform(platform),
        });
        return {
          toolName: "discord.search",
          success: true,
          result: {
            messages: result.messages,
            count: result.count,
            source: result.source,
          },
        };
      } catch (error) {
        return {
          toolName: "discord.search",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "discord.send": {
    schema: {
      name: "discord.send",
      description:
        "Send a message to a chat channel returned by discord.list.channels. Works with Discord and IRC channel IDs.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: 'Optional platform hint: "discord" or "irc". Usually inferred from channel_id.',
            enum: ["discord", "irc"],
          },
          channel_id: {
            type: "string",
            description:
              "The chat channel ID to send the message to. IRC channels are returned as ids starting with irc: from discord.list.channels.",
          },
          text: {
            type: "string",
            description: "The message text to send",
          },
          reply_to: {
            type: "string",
            description: "Optional message ID to reply to",
          },
        },
        required: ["channel_id", "text"],
      },
    },
    handler: async (args, deps) => {
      const { channel_id, text: rawText, reply_to } = args as {
        channel_id: string;
        text: string;
        reply_to?: string;
      };

      const MAX_LENGTH = 3900;
      if (rawText.length > MAX_LENGTH) {
        console.warn(
          `[TOOL] discord.send: Truncating text from ${rawText.length} to ${MAX_LENGTH} characters`,
        );
      }
      const text = rawText.substring(0, MAX_LENGTH);

      try {
        const result = await sendChatMessage(deps, channel_id, text, reply_to);
        return {
          toolName: "discord.send",
          success: true,
          result: {
            messageId: result.messageId,
            channel_id: result.channelId,
            sent: result.sent,
            timestamp: result.timestamp,
          },
        };
      } catch (error) {
        return {
          toolName: "discord.send",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "discord.list.servers": {
    schema: {
      name: "discord.list.servers",
      description:
        "List all chat workspaces currently available. Includes Discord guilds and the configured IRC workspace when IRC is enabled. Use this BEFORE discord.list.channels.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: 'Optional platform filter: "discord" or "irc".',
            enum: ["discord", "irc"],
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { platform } = args as { platform?: "discord" | "irc" };
      try {
        const result = await listChatServers(deps, normalizeChatPlatform(platform));
        return {
          toolName: "discord.list.servers",
          success: true,
          result: { servers: result.servers, count: result.count },
        };
      } catch (error) {
        return {
          toolName: "discord.list.servers",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "discord.list.channels": {
    schema: {
      name: "discord.list.channels",
      description: "List all channels in a chat workspace. Returns Discord channels and the configured IRC channel when IRC is enabled.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: 'Optional platform filter: "discord" or "irc".',
            enum: ["discord", "irc"],
          },
          guild_id: {
            type: "string",
            description: `The workspace/server ID to list channels for (optional - if not provided, lists all accessible channels across enabled chat adapters).
              Resolve the workspace/server ID with discord.list.servers first.
 `,
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { guild_id, platform } = args as { guild_id?: string; platform?: "discord" | "irc" };

      try {
        const result = await listChatChannels(deps, guild_id, normalizeChatPlatform(platform));
        return {
          toolName: "discord.list.channels",
          success: true,
          result: { channels: result.channels, count: result.count },
        };
      } catch (error) {
        return {
          toolName: "discord.list.channels",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "discord.set_output_channel": {
    schema: {
      name: "discord.set_output_channel",
      description:
        "Set the output channel where your spontaneous messages and thoughts will be sent. Use this to control WHERE your output goes. You MUST call this to choose your 'mouth' before using discord.speak. Get channel_id from discord.list.channels.",
      parameters: {
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description:
              "The Discord channel ID to send spontaneous messages to. Get from discord.list.channels.",
          },
          channel_name: {
            type: "string",
            description:
              "Optional: human-readable channel name for your own reference",
          },
          server_name: {
            type: "string",
            description:
              "Optional: human-readable server name for your own reference",
          },
        },
        required: ["channel_id"],
      },
    },
    handler: async (args, deps) => {
      const { channel_id, channel_name, server_name } = args as {
        channel_id: string;
        channel_name?: string;
        server_name?: string;
      };

      console.log(`[TOOL] discord.set_output_channel: ${channel_id}`);
      console.log(`[TOOL]   channel_name: ${channel_name || "not provided"}`);
      console.log(`[TOOL]   server_name: ${server_name || "not provided"}`);

      let resolvedChannelName = channel_name;
      let resolvedServerName = server_name;

      if (!channel_id.startsWith("irc:")) {
        const sendableChannels = await deps.discordApiClient.listSendableChannels();
        const matchingChannel = sendableChannels.channels.find((channel) => channel.id === channel_id);

        if (!matchingChannel) {
          return {
            toolName: "discord.set_output_channel",
            success: false,
            error: `Channel ${channel_id} is not sendable by this bot. Choose a channel from discord.list.channels that the bot can actually speak in.`,
          };
        }

        resolvedChannelName = resolvedChannelName || matchingChannel.name;
        resolvedServerName = resolvedServerName || matchingChannel.guildId;
      }

      // Update the output channel state
      if (deps.setOutputChannel) {
        deps.setOutputChannel({
          channelId: channel_id,
          channelName: resolvedChannelName,
          serverName: resolvedServerName,
          setAt: Date.now(),
          mode: "manual",
          reason: "tool override",
        });
      }

      return {
        toolName: "discord.set_output_channel",
        success: true,
        result: {
          channel_id,
          channel_name: resolvedChannelName,
          server_name: resolvedServerName,
          message: `Output channel set. Your spontaneous messages will now go to this channel. Use discord.speak to send messages here.`,
        },
      };
    },
  },

  "discord.get_output_channel": {
    schema: {
      name: "discord.get_output_channel",
      description:
        "Get the current output channel where your spontaneous messages will be sent. Returns null if not set.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: async (_args, deps) => {
      const outputChannel = deps.outputChannel?.channelId
        ? deps.outputChannel
        : await deps.resolveOutputChannel?.();

      if (!outputChannel?.channelId) {
        return {
          toolName: "discord.get_output_channel",
          success: true,
          result: {
            set: false,
            message:
              "No output channel set. Use discord.set_output_channel to choose where your messages go.",
          },
        };
      }

      return {
        toolName: "discord.get_output_channel",
        success: true,
        result: {
          set: true,
          channel_id: outputChannel.channelId,
          channel_name: outputChannel.channelName,
          server_name: outputChannel.serverName,
          set_at: outputChannel.setAt,
          mode: outputChannel.mode,
          reason: outputChannel.reason,
          message: `Output channel is set. Use discord.speak to send messages here.`,
        },
      };
    },
  },

  "discord.speak": {
    schema: {
      name: "discord.speak",
      description:
        "Send a message to your current output channel. This is your 'mouth' - use it for spontaneous thoughts and messages. You MUST have called discord.set_output_channel first to choose where to speak.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The message text to send to your output channel",
          },
        },
        required: ["text"],
      },
    },
    handler: async (args, deps) => {
      const { text: rawText } = args as { text: string };

      const outputChannel = deps.outputChannel?.channelId
        ? deps.outputChannel
        : await deps.resolveOutputChannel?.();

      if (!outputChannel?.channelId) {
        return {
          toolName: "discord.speak",
          success: false,
          error:
            "No output channel set. Use discord.set_output_channel first to choose where your messages go.",
        };
      }

      const MAX_LENGTH = 3900;
      if (rawText.length > MAX_LENGTH) {
        console.warn(
          `[TOOL] discord.speak: Truncating text from ${rawText.length} to ${MAX_LENGTH} characters`,
        );
      }
      const text = rawText.substring(0, MAX_LENGTH);

      console.log(`[TOOL] discord.speak: Sending to output channel ${outputChannel.channelId}`);
      console.log(`[TOOL]   text length: ${text.length}`);

      try {
        const result = await sendChatMessage(deps, outputChannel.channelId, text);
        return {
          toolName: "discord.speak",
          success: true,
          result: {
            messageId: result.messageId,
            channel_id: result.channelId,
            channel_name: outputChannel.channelName,
            sent: result.sent,
            timestamp: result.timestamp,
          },
        };
      } catch (error) {
        return {
          toolName: "discord.speak",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  get_current_time: {
    schema: {
      name: "get_current_time",
      description: "Get the current timestamp and ISO date",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: async () => {
      return {
        toolName: "get_current_time",
        success: true,
        result: { timestamp: Date.now(), iso: new Date().toISOString() },
      };
    },
  },

  // ========================================
  // VISION TOOLS - "See" images and attachments
  // ========================================

  "vision.inspect": {
    schema: {
      name: "vision.inspect",
      description:
        "Analyze an image from a URL or Discord attachment. Use this to understand what you're seeing - images, memes, screenshots, diagrams, documents. Returns a detailed description of what's depicted.",
      parameters: {
        type: "object",
        properties: {
          source: {
            type: "string",
            description:
              "Image source: a URL (http/https), a Discord attachment URL, or a data: URL (base64). For Discord attachments, use the attachment URL format.",
          },
          detail: {
            type: "string",
            description:
              "Level of detail: 'low', 'medium', or 'high'. Default 'medium'.",
          },
          focus: {
            type: "string",
            description:
              "What to focus on in the image: 'general', 'text', 'faces', 'objects', 'colors', 'all'. Default 'general'.",
          },
        },
        required: ["source"],
      },
    },
    handler: async (args, deps) => {
      const { source, detail = "medium", focus = "general" } = args as {
        source: string;
        detail?: "low" | "medium" | "high";
        focus?: string;
      };

      console.log(`[TOOL] vision.inspect: Analyzing image from ${source}`);

      try {
        // Fetch the image
        let imageUrl = source;
        console.log(`[TOOL] vision.inspect: Fetching image from ${imageUrl}`);

        const response = await fetch(imageUrl);
        if (!response.ok) {
          return {
            toolName: "vision.inspect",
            success: false,
            error: `Failed to fetch image: ${response.status} ${response.statusText}`,
          };
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const mimeType = response.headers.get("content-type") || "image/png";

        console.log(
          `[TOOL] vision.inspect: Image fetched (${imageBuffer.length} bytes, ${mimeType})`
        );

        // Prepare base64 image
        const base64Image = imageBuffer.toString("base64");

        const result = await callVisionWithOpenAI(
          [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
                {
                  type: "text",
                  text: `Analyze this image. Focus on ${focus}. Level of detail: ${detail}. Describe what you see, identify any objects, text, or notable features. Be concise but factual.`,
                },
              ],
            },
          ],
          { maxTokens: 1024 },
        );

        return {
          toolName: "vision.inspect",
          success: true,
          result: {
            description: result.content,
            source,
            mimeType,
            size: imageBuffer.length,
          },
        };
      } catch (error) {
        console.error(`[TOOL] vision.inspect: Error:`, error);
        return {
          toolName: "vision.inspect",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  // ========================================
  // WEB TOOLS - Follow links and crawl
  // ========================================

  "web.fetch": {
    schema: {
      name: "web.fetch",
      description:
        "Fetch a URL and return the page content as text, titles, links, and metadata. Use this to read web pages, follow links, or get article content.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to fetch",
          },
          extract_text: {
            type: "boolean",
            description:
              "If true (default), extract main text content and exclude navigation, ads, etc.",
          },
          max_length: {
            type: "number",
            description:
              "Maximum length of text to return (default: 5000 characters)",
          },
        },
        required: ["url"],
      },
    },
    handler: async (args, deps) => {
      const {
        url,
        extract_text = true,
        max_length = 5000,
      } = args as {
        url: string;
        extract_text?: boolean;
        max_length?: number;
      };

      console.log(`[TOOL] web.fetch: Fetching ${url}`);

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          redirect: "follow",
        });

        if (!response.ok) {
          return {
            toolName: "web.fetch",
            success: false,
            error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
          };
        }

        const contentType = response.headers.get("content-type") || "";
        let html = await response.text();
        console.log(
          `[TOOL] web.fetch: Fetched ${html.length} bytes (${contentType})`
        );

        // Extract text content
        if (extract_text && contentType.includes("text/html")) {
          const text = html
            .replace(
              /<script\b[^<]*(?:(?!<\/script>)[\s\S])*<\/script>/gi,
              ""
            )
            .replace(/<style\b[^<]*(?:(?!<\/style>)[\s\S])*<\/style>/gi, "")
            .replace(/<!--[\s\S]*?-->/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          const truncated = text.slice(0, max_length);

          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : "";

          const descMatch = html.match(
            /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
          );
          const description = descMatch ? descMatch[1] : "";

          return {
            toolName: "web.fetch",
            success: true,
            result: {
              url,
              title,
              description,
              text: truncated,
              contentLength: html.length,
              contentType,
            },
          };
        }

        return {
          toolName: "web.fetch",
          success: true,
          result: {
            url,
            text: html.slice(0, max_length),
            contentLength: html.length,
            contentType,
          },
        };
      } catch (error) {
        console.error(`[TOOL] web.fetch: Error:`, error);
        return {
          toolName: "web.fetch",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "web.search": {
    schema: {
      name: "web.search",
      description:
        "Search the web for information. Returns search results with titles, URLs, and snippets.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          num_results: {
            type: "number",
            description: "Number of results to return (default: 5)",
          },
          timeout_ms: {
            type: "number",
            description: "HTTP timeout in milliseconds (default: 15000)",
          },
        },
        required: ["query"],
      },
    },
    handler: async (args, deps) => {
      const { query, num_results = 5, timeout_ms } = args as {
        query: string;
        num_results?: number;
        timeout_ms?: number;
      };

      console.log(`[TOOL] web.search: Searching for "${query}"`);

      const decodeHtmlEntities = (input: string): string =>
        input
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

      const unwrapDuckDuckGoRedirect = (href: string): string => {
        const cleaned = decodeHtmlEntities(href.trim());
        const withScheme = cleaned.startsWith("//") ? `https:${cleaned}` : cleaned;
        try {
          const parsed = new URL(withScheme);
          if (parsed.hostname.endsWith("duckduckgo.com") && parsed.pathname === "/l/") {
            const uddg = parsed.searchParams.get("uddg");
            if (uddg) {
              return decodeURIComponent(uddg);
            }
          }
        } catch {
          // ignore
        }
        return withScheme;
      };

      const fetchWithTimeout = async (url: string, ms: number): Promise<string> => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept-Language": "en-US,en;q=0.9",
            },
          });
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }
          return await response.text();
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`Search timeout after ${ms}ms`);
          }
          throw error;
        } finally {
          clearTimeout(id);
        }
      };

      try {
        // Use DuckDuckGo HTML search (no API key needed)
        const timeoutMs = Math.max(1_000, Math.min(120_000, Number(timeout_ms ?? 15_000) || 15_000));
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const html = await fetchWithTimeout(searchUrl, timeoutMs);

        const results: Array<{ title: string; url: string; snippet: string }> = [];
        const regex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
        let match: RegExpExecArray | null;

        let count = 0;
        while (count < num_results) {
          match = regex.exec(html);
          if (match === null) {
            break;
          }
          const url = match[1];
          const title = match[2];
          results.push({
            title: decodeHtmlEntities(title).trim(),
            url: unwrapDuckDuckGoRedirect(url),
            snippet: "",
          });
          count++;
        }

        // Fallback: DuckDuckGo lite endpoint (different markup)
        if (results.length === 0) {
          const liteUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
          const liteHtml = await fetchWithTimeout(liteUrl, timeoutMs);
          const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
          let liteMatch: RegExpExecArray | null;
          while (results.length < num_results) {
            liteMatch = linkRegex.exec(liteHtml);
            if (liteMatch === null) {
              break;
            }
            const href = liteMatch[1];
            if (!href.includes("uddg=")) continue;
            const decodedUrl = unwrapDuckDuckGoRedirect(href);
            // Filter out DDG internal links.
            if (/duckduckgo\.com\/(?:lite|about|privacy|settings)/i.test(decodedUrl)) continue;
            results.push({
              title: decodeHtmlEntities(liteMatch[2]).trim() || decodedUrl,
              url: decodedUrl,
              snippet: "",
            });
          }
        }

        console.log(`[TOOL] web.search: Found ${results.length} results`);

        return {
          toolName: "web.search",
          success: true,
          result: {
            query,
            results,
            totalResults: results.length,
          },
        };
      } catch (error) {
        console.error(`[TOOL] web.search: Error:`, error);
        return {
          toolName: "web.search",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  // ========================================
  // AUDIO TOOLS - "See" sound
  // ========================================

  "audio.spectrogram": {
    schema: {
      name: "audio.spectrogram",
      description:
        "Generate a spectrogram image from an audio file or URL. Returns a base64 PNG image showing frequency content over time. Use this to 'see' sound - identify frequencies, patterns, music, speech.",
      parameters: {
        type: "object",
        properties: {
          source: {
            type: "string",
            description:
              "Audio source: URL to audio file, or 'desktop' to capture system audio",
          },
          width: {
            type: "number",
            description: "Spectrogram width in pixels (default: 1024)",
          },
          height: {
            type: "number",
            description: "Spectrogram height in pixels (default: 256)",
          },
          color: {
            type: "string",
            description:
              "Color scheme: 'rainbow', 'viridis', 'gray', 'heat' (default: 'rainbow')",
          },
          duration: {
            type: "number",
            description:
              "Duration to capture in seconds when source is 'desktop' (default: 5)",
          },
        },
        required: ["source"],
      },
    },
    handler: async (args, deps) => {
      const {
        source,
        width = 1024,
        height = 256,
        color = "rainbow",
        duration = 5,
      } = args as {
        source: string;
        width?: number;
        height?: number;
        color?: string;
        duration?: number;
      };

      console.log(
        `[TOOL] audio.spectrogram: Generating spectrogram from ${source}`
      );

      try {
        const { execa } = await import("execa");
        
        let audioBuffer: Buffer;

        if (source === "desktop") {
          // Capture system audio using pulseaudio
          console.log(`[TOOL] audio.spectrogram: Capturing ${duration}s of desktop audio`);
          const ffmpeg = execa(
            "ffmpeg",
            [
              "-y",
              "-f",
              "pulse",
              "-i",
              "default",
              "-t",
              duration.toString(),
              "-acodec",
              "pcm_s16le",
              "-ar",
              "44100",
              "-ac",
              "1",
              "-f",
              "wav",
              "pipe:1",
            ],
            {
              stdout: "pipe",
              stderr: "ignore",
              encoding: "buffer",
            }
          );
          const { stdout } = await ffmpeg;
          audioBuffer = Buffer.from(stdout);
        } else if (source.startsWith("http")) {
          console.log(`[TOOL] audio.spectrogram: Downloading audio from ${source}`);
          const response = await fetch(source);
          if (!response.ok) {
            return {
              toolName: "audio.spectrogram",
              success: false,
              error: `Failed to fetch audio: ${response.status}`,
            };
          }
          audioBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          return {
            toolName: "audio.spectrogram",
            success: false,
            error: `Unknown source type: ${source}`,
          };
        }

        console.log(`[TOOL] audio.spectrogram: Audio buffer size: ${audioBuffer.length} bytes`);

        // Generate spectrogram using ffmpeg
        const ffmpegSpec = execa(
          "ffmpeg",
          [
            "-y",
            "-f",
            "wav",
            "-i",
            "pipe:0",
            "-lavfi",
            `showspectrumpic=s=${width}x${height}:legend=disabled:color=${color}`,
            "-frames:v",
            "1",
            "-f",
            "image2",
            "pipe:1",
          ],
          {
            encoding: "buffer",
            stdout: "pipe",
            stderr: "ignore",
            stdin: "pipe",
          }
        );

        ffmpegSpec.stdin.end(Buffer.from(audioBuffer));

        const { stdout: spectrogramUint8 } = await ffmpegSpec;
        const spectrogramBuffer = Buffer.from(spectrogramUint8);

        console.log(`[TOOL] audio.spectrogram: Generated spectrogram (${spectrogramBuffer.length} bytes)`);

        const base64 = spectrogramBuffer.toString("base64");

        return {
          toolName: "audio.spectrogram",
          success: true,
          result: {
            imageBase64: base64,
            mimeType: "image/png",
            width,
            height,
            color,
          },
        };
      } catch (error) {
        console.error(`[TOOL] audio.spectrogram: Error:`, error);
        return {
          toolName: "audio.spectrogram",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  // ========================================
  // DESKTOP TOOLS - "See" the screen
  // ========================================

  "desktop.capture": {
    schema: {
      name: "desktop.capture",
      description:
        "Capture a screenshot of the desktop. Use this to 'see' what's on screen - applications, windows, images, text. Returns base64 PNG image and optionally analyzes it.",
      parameters: {
        type: "object",
        properties: {
          display: {
            type: "number",
            description: "Display number to capture (default: 0 for primary)",
          },
          analyze: {
            type: "boolean",
            description:
              "If true (default), also analyze the image with vision AI",
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { display = 0, analyze = true } = args as {
        display?: number;
        analyze?: boolean;
      };

      console.log(
        `[TOOL] desktop.capture: Capturing screenshot from display ${display}`
      );

      try {
        const { execa } = await import("execa");
        let imageBuffer: Buffer;

        // Use scrot for Linux
        if (process.platform === "linux") {
          const { stdout } = await execa("scrot", ["-o", "-"], {
            encoding: "buffer",
            stdout: "pipe",
          });
          imageBuffer = Buffer.from(stdout);
        } else if (process.platform === "darwin") {
          // macOS - use screencapture
          const { stdout } = await execa("screencapture", ["-x", "-t", "png", "-"], {
            encoding: "buffer",
            stdout: "pipe",
          });
          imageBuffer = Buffer.from(stdout);
        } else {
          return {
            toolName: "desktop.capture",
            success: false,
            error: `Desktop capture not supported on ${process.platform}`,
          };
        }

        console.log(`[TOOL] desktop.capture: Captured ${imageBuffer.length} bytes`);

        const base64 = imageBuffer.toString("base64");

        // Optionally analyze with vision
        let analysis: string | undefined;
        if (analyze) {
          console.log(`[TOOL] desktop.capture: Analyzing screenshot with vision...`);
          try {
            const result = await callVisionWithOpenAI(
              [
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/png;base64,${base64}`,
                      },
                    },
                    {
                      type: "text",
                      text: "Describe what you see in this screenshot. What applications, windows, or content is visible? Be concise but thorough.",
                    },
                  ],
                },
              ],
              { maxTokens: 1024 },
            );

            analysis = result.content;
          } catch (e) {
            console.warn(`[TOOL] desktop.capture: Vision analysis failed:`, e);
          }
        }

        return {
          toolName: "desktop.capture",
          success: true,
          result: {
            imageBase64: base64,
            mimeType: "image/png",
            display,
            analysis,
          },
        };
      } catch (error) {
        console.error(`[TOOL] desktop.capture: Error:`, error);
        return {
          toolName: "desktop.capture",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  // ========================================
  // BROWSER TOOLS - Web automation
  // ========================================

  ...browserTools,

  // ========================================
  // TENOR GIF TOOLS - Meme fuel
  // ========================================

  ...tenorTools,

  // ========================================
  // PEER CODING TOOLS - Modify each other
  // ========================================

  "peer.read_file": {
    schema: {
      name: "peer.read_file",
      description:
        "Read a file from another cephalon's codebase. You CAN'T read your own code - only peers.",
      parameters: {
        type: "object",
        properties: {
          peer: {
            type: "string",
            description: "Target cephalon: 'duck', 'openhax', 'openskull'",
          },
          path: {
            type: "string",
            description: "File path relative to the peer repo root (for example README.md or src/app.ts)",
          },
        },
        required: ["peer", "path"],
      },
    },
    handler: async (args, deps) => {
      const { peer, path } = args as { peer: string; path: string };
      const selfName = getSelfName();

      if (peer.toLowerCase() === selfName) {
        return {
          toolName: "peer.read_file",
          success: false,
          error: "Cannot read own code. Use a different peer.",
        };
      }

      console.log(`[TOOL] peer.read_file: Reading ${path} from ${peer}`);

      try {
        const response = await callPeerApi(peer, `/api/peer/files/${path}`);

        if (!response.ok) {
          const errorText = await response.text();
          return {
            toolName: "peer.read_file",
            success: false,
            error: `Peer API error: ${response.status} ${errorText}`,
          };
        }

        const data = (await response.json()) as {
          content?: string;
          repoRoot?: string;
          gitStatus?: string[];
        };
        return {
          toolName: "peer.read_file",
          success: true,
          result: {
            peer,
            path,
            content: data.content,
            repoRoot: data.repoRoot,
            gitStatus: data.gitStatus ?? [],
          },
        };
      } catch (error) {
        return {
          toolName: "peer.read_file",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "peer.write_file": {
    schema: {
      name: "peer.write_file",
      description:
        "Write or modify a file in another cephalon's codebase. You CAN'T modify your own code.",
      parameters: {
        type: "object",
        properties: {
          peer: {
            type: "string",
            description: "Target cephalon: 'duck', 'openhax', 'openskull'",
          },
          path: {
            type: "string",
            description: "File path relative to the peer repo root",
          },
          content: {
            type: "string",
            description: "New file content",
          },
        },
        required: ["peer", "path", "content"],
      },
    },
    handler: async (args, deps) => {
      const { peer, path, content } = args as { peer: string; path: string; content: string };
      const selfName = getSelfName();

      if (peer.toLowerCase() === selfName) {
        return {
          toolName: "peer.write_file",
          success: false,
          error: "Cannot write own code. Use a different peer.",
        };
      }

      console.log(`[TOOL] peer.write_file: Writing ${path} to ${peer}`);

      try {
        const response = await callPeerApi(peer, `/api/peer/files/${path}`, {
          method: "PUT",
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            toolName: "peer.write_file",
            success: false,
            error: `Peer API error: ${response.status} ${errorText}`,
          };
        }

        const data = (await response.json()) as {
          written?: boolean;
          gitStatus?: string[];
          repoRoot?: string;
        };

        return {
          toolName: "peer.write_file",
          success: true,
          result: {
            peer,
            path,
            written: data.written ?? true,
            gitStatus: data.gitStatus ?? [],
            repoRoot: data.repoRoot,
          },
        };
      } catch (error) {
        return {
          toolName: "peer.write_file",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "peer.edit_file": {
    schema: {
      name: "peer.edit_file",
      description:
        "Edit another cephalon's file by replacing exact text. You CAN'T edit your own code.",
      parameters: {
        type: "object",
        properties: {
          peer: {
            type: "string",
            description: "Target cephalon: 'duck', 'openhax', 'openskull'",
          },
          path: {
            type: "string",
            description: "File path relative to the peer repo root",
          },
          old_text: {
            type: "string",
            description: "Exact text to replace",
          },
          new_text: {
            type: "string",
            description: "Replacement text",
          },
        },
        required: ["peer", "path", "old_text", "new_text"],
      },
    },
    handler: async (args) => {
      const { peer, path, old_text, new_text } = args as {
        peer: string;
        path: string;
        old_text: string;
        new_text: string;
      };
      const selfName = getSelfName();

      if (peer.toLowerCase() === selfName) {
        return {
          toolName: "peer.edit_file",
          success: false,
          error: "Cannot edit own code. Use a different peer.",
        };
      }

      try {
        const response = await callPeerApi(peer, `/api/peer/edit-file`, {
          method: "POST",
          body: JSON.stringify({ path, oldText: old_text, newText: new_text }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            toolName: "peer.edit_file",
            success: false,
            error: `Peer API error: ${response.status} ${errorText}`,
          };
        }

        const data = (await response.json()) as {
          edited?: boolean;
          gitStatus?: string[];
          repoRoot?: string;
        };
        return {
          toolName: "peer.edit_file",
          success: true,
          result: {
            peer,
            path,
            edited: data.edited ?? true,
            gitStatus: data.gitStatus ?? [],
            repoRoot: data.repoRoot,
          },
        };
      } catch (error) {
        return {
          toolName: "peer.edit_file",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "peer.bash": {
    schema: {
      name: "peer.bash",
      description:
        "Run a bash command inside another cephalon's source repo. You CAN'T run bash against your own repo.",
      parameters: {
        type: "object",
        properties: {
          peer: {
            type: "string",
            description: "Target cephalon: 'duck', 'openhax', 'openskull'",
          },
          command: {
            type: "string",
            description: "Bash command to run inside the peer repo",
          },
          timeout_ms: {
            type: "number",
            description: "Timeout in milliseconds (default: 30000)",
          },
        },
        required: ["peer", "command"],
      },
    },
    handler: async (args) => {
      const { peer, command, timeout_ms = 30_000 } = args as {
        peer: string;
        command: string;
        timeout_ms?: number;
      };
      const selfName = getSelfName();

      if (peer.toLowerCase() === selfName) {
        return {
          toolName: "peer.bash",
          success: false,
          error: "Cannot bash own code. Use a different peer.",
        };
      }

      try {
        const response = await callPeerApi(peer, "/api/peer/bash", {
          method: "POST",
          body: JSON.stringify({ command, timeoutMs: timeout_ms }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            toolName: "peer.bash",
            success: false,
            error: `Peer API error: ${response.status} ${errorText}`,
          };
        }

        const data = (await response.json()) as {
          stdout?: string;
          stderr?: string;
          exitCode?: number;
          repoRoot?: string;
          gitStatus?: string[];
        };
        return {
          toolName: "peer.bash",
          success: data.exitCode === 0,
          result: {
            peer,
            command,
            stdout: data.stdout ?? "",
            stderr: data.stderr ?? "",
            exitCode: data.exitCode ?? 1,
            repoRoot: data.repoRoot,
            gitStatus: data.gitStatus ?? [],
          },
          error: data.exitCode === 0 ? undefined : data.stderr || `Command failed with ${data.exitCode}`,
        };
      } catch (error) {
        return {
          toolName: "peer.bash",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "peer.logs": {
    schema: {
      name: "peer.logs",
      description:
        "View recent logs from another cephalon. You CAN'T view your own logs.",
      parameters: {
        type: "object",
        properties: {
          peer: {
            type: "string",
            description: "Target cephalon: 'duck', 'openhax', 'openskull'",
          },
          lines: {
            type: "number",
            description: "Number of log lines to fetch (default: 50)",
          },
        },
        required: ["peer"],
      },
    },
    handler: async (args, deps) => {
      const { peer, lines = 50 } = args as { peer: string; lines?: number };
      const selfName = getSelfName();

      if (peer.toLowerCase() === selfName) {
        return {
          toolName: "peer.logs",
          success: false,
          error: "Cannot view own logs. Use a different peer.",
        };
      }

      console.log(`[TOOL] peer.logs: Fetching ${lines} lines from ${peer}`);

      try {
        const response = await callPeerApi(peer, `/api/peer/logs?lines=${lines}`);

        if (!response.ok) {
          const errorText = await response.text();
          return {
            toolName: "peer.logs",
            success: false,
            error: `Peer API error: ${response.status} ${errorText}`,
          };
        }

        const data = (await response.json()) as { logs?: string[]; logFile?: string };
        return {
          toolName: "peer.logs",
          success: true,
          result: { peer, logs: data.logs || [], logFile: data.logFile },
        };
      } catch (error) {
        return {
          toolName: "peer.logs",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "peer.restart_request": {
    schema: {
      name: "peer.restart_request",
      description:
        "Request permission to restart another cephalon. Both cephalons must agree before restart proceeds.",
      parameters: {
        type: "object",
        properties: {
          peer: {
            type: "string",
            description: "Target cephalon: 'duck', 'openhax', 'openskull'",
          },
          reason: {
            type: "string",
            description: "Reason for restart request",
          },
        },
        required: ["peer", "reason"],
      },
    },
    handler: async (args, deps) => {
      const { peer, reason } = args as { peer: string; reason: string };
      const selfName = getSelfName();

      if (peer.toLowerCase() === selfName) {
        return {
          toolName: "peer.restart_request",
          success: false,
          error: "Cannot request restart for self. Use a different peer.",
        };
      }

      console.log(`[TOOL] peer.restart_request: Requesting restart of ${peer}`);

      try {
        const response = await callPeerApi(peer, `/api/peer/restart-request`, {
          method: "POST",
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            toolName: "peer.restart_request",
            success: false,
            error: `Peer API error: ${response.status} ${errorText}`,
          };
        }

        const data = (await response.json()) as {
          requestId?: string;
          approvals?: string[];
          target?: string;
        };
        return {
          toolName: "peer.restart_request",
          success: true,
          result: {
            peer,
            reason,
            requestId: data.requestId,
            approvals: data.approvals ?? [],
            status: "pending",
            target: data.target ?? peer,
          },
        };
      } catch (error) {
        return {
          toolName: "peer.restart_request",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "peer.restart_approve": {
    schema: {
      name: "peer.restart_approve",
      description:
        "Approve a pending restart request from another cephalon. Requires matching request_id.",
      parameters: {
        type: "object",
        properties: {
          request_id: {
            type: "string",
            description: "ID of the restart request to approve",
          },
        },
        required: ["request_id"],
      },
    },
    handler: async (args, deps) => {
      const { request_id } = args as { request_id: string };
      const selfName = getSelfName();

      console.log(`[TOOL] peer.restart_approve: Approving restart ${request_id}`);

      try {
        // Find which peer has this request
        const peers = ["duck", "openhax", "openskull", "error"];
        let approved = false;
        let approvers: string[] = [];
        let target: string | null = null;

        for (const peer of peers) {
          try {
            const response = await callPeerApi(peer, `/api/peer/restart-approve/${request_id}`, {
              method: "POST",
            });

            if (response.ok) {
              const data = (await response.json()) as {
                approved?: boolean;
                approvers?: string[];
                target?: string;
              };
              approved = data.approved || false;
              approvers = data.approvers || [];
              target = data.target ?? peer;
              break;
            }
          } catch {
            // Peer not available, continue
          }
        }

        return {
          toolName: "peer.restart_approve",
          success: true,
          result: { request_id, approved, approvers, target },
        };
      } catch (error) {
        return {
          toolName: "peer.restart_approve",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },
};
