import type * as discord from "discord.js";
import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

import type { Bot } from "../bot.js";

export type RecordSpeakerScope = {
  logger: Logger;
  policy: PolicyChecker;
  start: (input: RecordSpeakerInput) => Promise<RecordSpeakerOutput>;
  stop: (input: RecordSpeakerInput) => Promise<RecordSpeakerOutput>;
};

export type RecordSpeakerInput = {
  bot: Bot;
  user: discord.User;
};

export type RecordSpeakerOutput = { ok: boolean };

export async function buildRecordSpeakerScope(): Promise<
  Pick<RecordSpeakerScope, "logger" | "policy">
> {
  return {
    logger: createLogger({
      service: "cephalon",
      base: { component: "record-speaker" },
    }),
    policy: makePolicy({ permissionGate: checkPermission }),
  };
}

export function makeRecordActions(): Pick<
  RecordSpeakerScope,
  "start" | "stop"
> {
  return {
    start: async ({ bot, user }) => {
      if (!bot.currentVoiceSession) return { ok: false };
      bot.currentVoiceSession.addSpeaker(user);
      await bot.currentVoiceSession.startSpeakerRecord(user);
      return { ok: true };
    },
    stop: async ({ bot, user }) => {
      if (!bot.currentVoiceSession) return { ok: false };
      await bot.currentVoiceSession.stopSpeakerRecord(user);
      return { ok: true };
    },
  };
}
