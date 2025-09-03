// SPDX-License-Identifier: GPL-3.0-only
import type { Bot } from "../bot.js";
import type * as discord from "discord.js";
import { makeLogger, type Logger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "../factories/policy.js";

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
    logger: makeLogger("record-speaker"),
    policy: makePolicy(),
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
