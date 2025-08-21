import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../bot.js';
import type { Event } from '../store/events.js';

export const data = {
    name: 'leave-voice',
    description: 'Disconnect the bot from the current voice channel',
};

export default async function execute(
    interaction: ChatInputCommandInteraction,
    ctx: { bot: Bot; dispatch: (e: Event) => Promise<void> },
) {
    await interaction.deferReply({ ephemeral: true });
    await ctx.dispatch({ type: 'VOICE/LEAVE_REQUESTED', guildId: interaction.guildId!, by: interaction.user.id });
    await interaction.editReply('Leaving voice…');
}
