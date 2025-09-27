import type { ChatInputCommandInteraction } from "discord.js";

import type { Bot } from "../bot.js";
import runLeave from "../actions/leave-voice.js";
import { buildLeaveVoiceScope } from "../actions/leave-voice.scope.js";
import type { Event } from "../store/events.js";

export const data = {
  name: "leave-voice",
  description: "Disconnect the bot from the current voice channel",
};

type CommandContext = { bot: Bot; dispatch?: (e: Event) => Promise<void> };

export default async function execute(
  interaction: ChatInputCommandInteraction,
  ctx: CommandContext,
) {
  await interaction.deferReply({ ephemeral: true });
  const payload = {
    guildId: interaction.guildId!,
    by: interaction.user.id,
  } as const;
  if (ctx.dispatch) {
    await ctx.dispatch({ type: "VOICE/LEAVE_REQUESTED", ...payload });
  }
  const scope = await buildLeaveVoiceScope({ bot: ctx.bot });
  await runLeave(scope, payload);
  await interaction.editReply("Leaving voice…");
}
