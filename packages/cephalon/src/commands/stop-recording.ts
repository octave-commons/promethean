import type { ChatInputCommandInteraction } from "discord.js";
import type { Bot } from "../bot.js";
import {
  buildRecordSpeakerScope,
  makeRecordActions,
} from "../actions/record-speaker.scope.js";

export const data = {
  name: "stop-recording",
  description: "Stop recording a user in the current voice session",
  options: [
    {
      name: "speaker",
      description: "User to stop recording",
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
  const { ok } = await scope.stop({ bot: ctx.bot, user });
  await interaction.editReply(
    ok
      ? "I'm not recording you anymore… I promise…"
      : "No active voice session.",
  );
}
