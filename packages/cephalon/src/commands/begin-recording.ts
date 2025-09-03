// SPDX-License-Identifier: GPL-3.0-only
import type { ChatInputCommandInteraction } from "discord.js";
import type { Bot } from "../bot.js";
import {
  buildRecordSpeakerScope,
  makeRecordActions,
} from "../actions/record-speaker.scope.js";

export const data = {
  name: "begin-recording",
  description: "Begin recording a user in the current voice session",
  options: [
    {
      name: "speaker",
      description: "User to record",
      type: 6, // ApplicationCommandOptionType.User
      required: true,
    },
  ],
};

export default async function execute(
  interaction: ChatInputCommandInteraction,
  ctx: { bot: Bot },
) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser("speaker", true);
  const scope = {
    ...(await buildRecordSpeakerScope()),
    ...makeRecordActions(),
  };
  const { ok } = await scope.start({ bot: ctx.bot, user });
  await interaction.editReply(ok ? "Recording!" : "No active voice session.");
}
