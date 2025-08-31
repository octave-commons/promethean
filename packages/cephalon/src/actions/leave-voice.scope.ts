import type { Logger } from "../factories/logger.js";
import { makeLogger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "../factories/policy.js";
import {
  makeDiscordVoiceAdapter,
  type VoiceAdapter,
} from "../factories/voice.js";
import type { Bot, VoiceStateChangeHandler } from "../bot.js";

export type LeaveVoiceScope = {
  logger: Logger;
  policy: PolicyChecker;
  voice: VoiceAdapter;
};

// Builder that can work with or without a live Bot (e.g., broker/CLI)
export async function buildLeaveVoiceScope(ctx?: {
  bot?: Bot;
}): Promise<LeaveVoiceScope> {
  const logger = makeLogger("leave-voice");
  const policy = makePolicy();

  // If we have a bot, create a Discord-specific adapter. Otherwise, make a no-op adapter.
  const voice = ctx?.bot
    ? makeDiscordVoiceAdapter({
        client: ctx.bot.client,
        getCurrentVoiceSession: () => ctx.bot!.currentVoiceSession,
        setCurrentVoiceSession: (v: any) => {
          ctx.bot!.currentVoiceSession = v;
        },
        getVoiceStateHandler: (): VoiceStateChangeHandler | undefined =>
          ctx.bot!.voiceStateHandler,
        setVoiceStateHandler: (h: VoiceStateChangeHandler) => {
          ctx.bot!.voiceStateHandler = h;
        },
      })
    : { leaveGuild: async () => false };

  return { logger, policy, voice };
}
