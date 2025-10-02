import type { AgentBus } from "@promethean/agent-ecs/bus.js";
import type { ContextStore } from "@promethean/persistence/contextStore.js";

import type { Bot } from "../bot.js";
import type { EnsoChatAgent } from "../enso/chat-agent.js";

export type RegisterLlmHandlerScope = {
  bus: AgentBus;
  getAgentWorld: () => any;
  getVoiceSession: () => any;
  getEnsoChat: () => EnsoChatAgent | undefined;
  getContext: () => ContextStore;
};

export async function buildRegisterLlmHandlerScope(
  bot: Bot,
): Promise<RegisterLlmHandlerScope> {
  if (!bot.bus) throw new Error("bus not initialized");
  return {
    bus: bot.bus,
    getAgentWorld: () => bot.agentWorld,
    getVoiceSession: () => bot.currentVoiceSession,
    getEnsoChat: () => bot.ensoChat,
    getContext: () => bot.context,
  };
}
