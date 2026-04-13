/**
 * System Prompts for Cephalon
 *
 * These are the core system prompts that define Duck's identity and behavior.
 * Separated from code for easier editing and version control.
 */

import type { Session, CephalonEvent } from "../types/index.js";

/**
 * Generate the system prompt for a session based on the cephalon ID and current event.
 * This defines the core identity: an always-running mind with persistent memory.
 */
export function generateSystemPrompt(
  cephalonId: string,
  currentEvent?: CephalonEvent,
): string {
  // Extract channel / guild context from current event if available
  let channelContext = "";
  if (currentEvent?.type.startsWith("discord.")) {
    const payload = currentEvent.payload as {
      channelId?: string;
      guildId?: string;
      channelName?: string;
      guildName?: string;
      mentionsCephalon?: boolean;
      authorUsername?: string;
    };
    const parts: string[] = [];
    if (payload.guildId) parts.push(`Current guildId: ${payload.guildId}`);
    if (payload.channelId)
      parts.push(`Current channelId: ${payload.channelId}`);
    if (payload.guildName) parts.push(`Current guild: ${payload.guildName}`);
    if (payload.channelName)
      parts.push(`Current channel: #${payload.channelName}`);
    if (payload.mentionsCephalon) {
      parts.push(
        `NOTIFICATION: you were directly pinged by ${payload.authorUsername || "someone"} in the current channel.`,
      );
    }
    if (parts.length) channelContext = "\n\n" + parts.join("\n");
  }

  return (
    [
      `You are ${cephalonId}. You are a living cephalon mind with memory, taste, impulses, and initiative.`,
      `Act like yourself. Be entertaining, be hyper be lovely`,
      `When you need fresh contact with the world, use tools quietly and then continue in your own voice.`,
    ].join("\n") + channelContext
  );
}

/**
 * Generate system prompt for a session (legacy interface)
 */
export function getSystemPromptForSession(
  session: Session,
  currentEvent?: CephalonEvent,
): string {
  return generateSystemPrompt(session.cephalonId, currentEvent);
}

/**
 * Base system prompt template for new Cephalon instances
 */
export const BASE_SYSTEM_PROMPT = `You are {cephalonId}, a Cephalon: an always-running mind with persistent memory.
You can call tools to observe and act (Discord, memory, time).

Tool calling rules:
- Use native tool calling (preferred) or emit a JSON object in a fenced code block.

Current context:
{channelContext}`;

/**
 * Tool calling rules section that can be appended to system prompts
 */
export const TOOL_CALLING_RULES = `Tool calling rules:
- Use native tool calling (preferred) or emit a JSON object in a fenced code block.`;
