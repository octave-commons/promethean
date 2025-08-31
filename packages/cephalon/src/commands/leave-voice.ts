import type { ChatInputCommandInteraction } from "discord.js";
import type { Bot } from "../bot.js";
import runLeave from "../actions/leave-voice.js";
import { buildLeaveVoiceScope } from "../actions/leave-voice.scope.js";

export const data = {
  name: "leave-voice",
  description: "Disconnect the bot from the current voice channel",
};

export default async function execute(
  interaction: ChatInputCommandInteraction,
  ctx: { bot: Bot },
) {
  await interaction.deferReply({ ephemeral: true });
  const scope = await buildLeaveVoiceScope({ bot: ctx.bot });
  await runLeave(scope, {
    guildId: interaction.guildId!,
    by: interaction.user.id,
  });
  await interaction.editReply("Leaving voice…");
}
