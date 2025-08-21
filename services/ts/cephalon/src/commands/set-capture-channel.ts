import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { ChannelType } from 'discord.js';
import type { Bot } from '../bot.js';

export const data = {
    name: 'set-capture-channel',
    description: 'Set the text channel for waveforms, spectrograms, and screenshots',
    options: [
        { name: 'channel', description: 'Target text channel', type: 7, required: true }, // Channel
    ],
};

export default async function execute(interaction: ChatInputCommandInteraction, ctx: { bot: Bot }) {
    const channel = interaction.options.getChannel('channel', true);
    if (channel.type !== ChannelType.GuildText) {
        await interaction.reply('Channel must be text-based.');
        return;
    }
    ctx.bot.captureChannel = channel as TextChannel;
    await interaction.reply(`Capture channel set to ${channel.id}`);
}
