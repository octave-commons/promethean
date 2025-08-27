import type { ChatInputCommandInteraction, TextChannel } from "discord.js";
import type { Bot } from "../bot.js";
import type { Event } from "../store/events.js";

export const data = {
  name: "join-voice",
  description: "Join the requester's current voice channel",
};

export default async function execute(
  interaction: ChatInputCommandInteraction,
  ctx: { bot: Bot; dispatch: (e: Event) => Promise<void> },
) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply("This command requires a cached guild context.");
    return;
  }
  await interaction.deferReply({ ephemeral: true });

  // Resolve text channel if the command was issued from a text channel
  let textChannel: TextChannel | null = null;
  if (interaction.channel && interaction.channel.isTextBased()) {
    textChannel = interaction.channel as TextChannel;
  }
  if (!interaction.member.voice?.channelId) {
    await interaction.editReply("Join a voice channel then try again.");
    return;
  }

  const evt: any = {
    type: "VOICE/JOIN_REQUESTED",
    guildId: interaction.guild!.id,
    voiceChannelId: interaction.member.voice.channelId,
    by: interaction.user.id,
  };
  if (textChannel?.id) evt.textChannelId = textChannel.id;
  await ctx.dispatch(evt);
  await interaction.editReply("Joining voice…");
}
