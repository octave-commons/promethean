import type * as discord from "discord.js";
import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

import type { Bot } from "../bot.js";

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
    logger: createLogger({
      service: "cephalon",
      base: { component: "transcribe-speaker" },
    }),
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
