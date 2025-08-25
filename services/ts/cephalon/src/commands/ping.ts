import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../bot.js';
import runPing from '../actions/ping.js';
import { buildPingScope } from '../actions/ping.scope.js';

export const data = {
    name: 'ping',
    description: 'Respond with pong',
};

export default async function execute(interaction: ChatInputCommandInteraction, ctx?: { bot: Bot }) {
    await interaction.deferReply({ ephemeral: true });
    // Mark optional context as used to satisfy noUnusedParameters/noUnusedLocals
    if (ctx) void ctx.bot;
    const scope = await buildPingScope();
    const { message } = await runPing(scope, { userId: interaction.user.id });
    await interaction.editReply(message);
}
