import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../bot.js';
import { runStartDialog } from '../actions/start-dialog.scope.js';

export const data = {
    name: 'start-dialog',
    description: 'Start a dialog with the bot',
};

export default async function execute(interaction: ChatInputCommandInteraction, ctx: { bot: Bot }) {
    if (!ctx.bot.currentVoiceSession) {
        await interaction.reply('Join a voice channel first.');
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    await runStartDialog({ bot: ctx.bot });
    await interaction.deleteReply().catch(() => {});
}
