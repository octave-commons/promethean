// SPDX-License-Identifier: GPL-3.0-only
import type { LeaveVoiceScope } from "./leave-voice.scope.js";

export type LeaveVoiceInput = {
  guildId: string;
  channelId?: string;
  by?: string;
};
export type LeaveVoiceOutput = { left: boolean };

export default async function run(
  scope: LeaveVoiceScope,
  input: LeaveVoiceInput,
): Promise<LeaveVoiceOutput> {
  const { policy, logger, voice } = scope;
  await policy.assertAllowed(
    input.by ?? "unknown",
    "leave-voice",
    input.guildId,
  );
  logger.info("Leaving voice session", {
    guildId: input.guildId,
    channelId: input.channelId,
  });
  const left = await voice.leaveGuild(input.guildId);
  return { left };
}
