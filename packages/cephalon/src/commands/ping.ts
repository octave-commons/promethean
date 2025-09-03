// SPDX-License-Identifier: GPL-3.0-only
import type { ChatInputCommandInteraction } from "discord.js";
import type { Bot } from "../bot.js";
import runPing from "../actions/ping.js";
import { buildPingScope } from "../actions/ping.scope.js";

export const data = {
  name: "ping",
  description: "Respond with pong",
};

export default async function execute(
  interaction: ChatInputCommandInteraction,
  ctx: { bot: Bot },
) {
  void ctx;
  await interaction.deferReply({ ephemeral: true });
  const scope = await buildPingScope();
  const { message } = await runPing(scope, { userId: interaction.user.id });
  await interaction.editReply(message);
}
