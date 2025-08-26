import type { TextChannel } from 'discord.js';
import type { Bot } from '../bot.js';
import type { SetCaptureChannelScope } from './set-capture-channel.scope.js';

export type SetCaptureChannelInput = { bot: Bot; channel: TextChannel; by: string };
export type SetCaptureChannelOutput = { ok: boolean };

export default async function run(
    scope: SetCaptureChannelScope,
    input: SetCaptureChannelInput,
): Promise<SetCaptureChannelOutput> {
    await scope.policy.assertAllowed(input.by, 'set-capture-channel');
    scope.logger.info('Setting capture channel', { channelId: input.channel.id });
    input.bot.captureChannel = input.channel;
    return { ok: true };
}
