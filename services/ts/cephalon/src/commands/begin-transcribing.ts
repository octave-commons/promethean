import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../bot.js';
import { buildTranscribeSpeakerScope, makeTranscribeActions } from '../actions/transcribe-speaker.scope.js';

export const data = {
    name: 'begin-transcribing',
    description: 'Begin transcribing a user in the current voice session',
    options: [
        {
            name: 'speaker',
            description: 'User to transcribe',
            type: 6, // ApplicationCommandOptionType.User
            required: true,
        },
        {
            name: 'log',
            description: 'Echo transcripts to the current channel',
            type: 5, // ApplicationCommandOptionType.Boolean
            required: false,
        },
    ],
};

export default async function execute(interaction: ChatInputCommandInteraction, ctx: { bot: Bot }) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getUser('speaker', true);
    const log = interaction.options.getBoolean('log') || false;
    const scope = { ...(await buildTranscribeSpeakerScope()), ...makeTranscribeActions() };
    const { ok } = await scope.start({ bot: ctx.bot, user, log });
    await interaction.editReply(
        ok
            ? `I will faithfully transcribe every word ${user.displayName} says… I promise.`
            : "I can't transcribe what I can't hear. Join a voice channel.",
    );
}
