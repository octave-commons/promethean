import type * as discord from "discord.js";

import type { Bot } from "../bot.js";
import { makeLogger, type Logger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "@promethean/security/policy.js";
import { checkPermission } from "@promethean/legacy/permissionGate.js";

export type TranscribeSpeakerScope = {
  logger: Logger;
  policy: PolicyChecker;
  start: (input: TranscribeSpeakerInput) => Promise<TranscribeSpeakerOutput>;
};

export type TranscribeSpeakerInput = {
  bot: Bot;
  user: discord.User;
  log?: boolean;
};

export type TranscribeSpeakerOutput = { ok: boolean };

export async function buildTranscribeSpeakerScope(): Promise<
  Pick<TranscribeSpeakerScope, "logger" | "policy">
> {
  return {
    logger: makeLogger("transcribe-speaker"),
    policy: makePolicy({ permissionGate: checkPermission }),
  };
}

export function makeTranscribeActions(): Pick<TranscribeSpeakerScope, "start"> {
  return {
    start: async ({ bot, user, log }) => {
      if (!bot.currentVoiceSession) return { ok: false };
      bot.currentVoiceSession.addSpeaker(user);
      await bot.currentVoiceSession.startSpeakerTranscribe(user, !!log);
      return { ok: true };
    },
  };
}
