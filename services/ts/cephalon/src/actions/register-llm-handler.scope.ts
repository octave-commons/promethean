import type { AgentBus } from '@shared/ts/dist/agent-ecs/bus.js';
import type { Bot } from '../bot.js';

export type RegisterLlmHandlerScope = {
    bus: AgentBus;
    getAgentWorld: () => any;
    getVoiceSession: () => any;
};

export async function buildRegisterLlmHandlerScope(bot: Bot): Promise<RegisterLlmHandlerScope> {
    if (!bot.bus) throw new Error('bus not initialized');
    return {
        bus: bot.bus,
        getAgentWorld: () => bot.agentWorld,
        getVoiceSession: () => bot.currentVoiceSession,
    };
}
