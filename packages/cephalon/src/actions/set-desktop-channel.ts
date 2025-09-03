// SPDX-License-Identifier: GPL-3.0-only
import type { TextChannel } from "discord.js";
import type { Bot } from "../bot.js";
import type { SetDesktopChannelScope } from "./set-desktop-channel.scope.js";

export type SetDesktopChannelInput = {
  bot: Bot;
  channel: TextChannel;
  by: string;
};
export type SetDesktopChannelOutput = { ok: boolean };

export default async function run(
  scope: SetDesktopChannelScope,
  input: SetDesktopChannelInput,
): Promise<SetDesktopChannelOutput> {
  await scope.policy.assertAllowed(input.by, "set-desktop-channel");
  scope.logger.info("Setting desktop channel", { channelId: input.channel.id });
  input.bot.desktopChannel = input.channel;
  return { ok: true };
}
