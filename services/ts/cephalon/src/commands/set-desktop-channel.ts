import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { ChannelType } from 'discord.js';
import type { Bot } from '../bot.js';
import runSetDesktop from '../actions/set-desktop-channel.js';
import { buildSetDesktopChannelScope } from '../actions/set-desktop-channel.scope.js';

export const data = {
    name: 'set-desktop-channel',
    description: 'Set the text channel for desktop capture uploads',
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
    await interaction.deferReply({ ephemeral: true });
    const scope = await buildSetDesktopChannelScope();
    await runSetDesktop(scope, { bot: ctx.bot, channel: channel as TextChannel, by: interaction.user.id });
    await interaction.editReply(`Desktop capture channel set to ${channel.id}`);
}
