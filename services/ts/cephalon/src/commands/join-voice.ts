import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import type { Bot } from '../bot.js';
import runJoin from '../actions/join-voice.js';
import { buildJoinVoiceScope, makeJoinAction } from '../actions/join-voice.scope.js';

export const data = {
    name: 'join-voice',
    description: "Join the requester's current voice channel",
};

export default async function execute(interaction: ChatInputCommandInteraction, ctx: { bot: Bot }) {
    if (!interaction.inCachedGuild()) {
        await interaction.reply('This command requires a cached guild context.');
        return;
    }
    await interaction.deferReply({ ephemeral: true });

    // Resolve text channel if the command was issued from a text channel
    let textChannel: TextChannel | null = null;
    if (interaction.channel && interaction.channel.isTextBased()) {
        textChannel = interaction.channel as TextChannel;
    }
    if (!interaction.member.voice?.channelId) {
        await interaction.editReply('Join a voice channel then try again.');
        return;
    }

    const scope = { ...(await buildJoinVoiceScope()), join: makeJoinAction() };
    const { joined } = await runJoin(scope as any, {
        bot: ctx.bot,
        guild: interaction.guild!,
        voiceChannelId: interaction.member.voice.channelId,
        textChannel,
    });
    await interaction.editReply(joined ? 'Joined.' : 'Already in a voice session.');
}
