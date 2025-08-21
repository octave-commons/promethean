import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../bot.js';
import { buildTtsScope, makeTtsAction } from '../actions/tts.scope.js';

export const data = {
    name: 'tts',
    description: 'Speak a message with text-to-speech in the current voice session',
    options: [
        {
            name: 'message',
            description: 'Message to speak',
            type: 3, // ApplicationCommandOptionType.String
            required: true,
        },
    ],
};

export default async function execute(interaction: ChatInputCommandInteraction, ctx: { bot: Bot }) {
    await interaction.deferReply({ ephemeral: true });
    const message = interaction.options.getString('message', true);
    const scope = { ...(await buildTtsScope()), speak: makeTtsAction() };
    const { ok } = await scope.speak({ bot: ctx.bot, message });
    await interaction.editReply(ok ? 'Speaking…' : "That didn't work… try again?");
}
