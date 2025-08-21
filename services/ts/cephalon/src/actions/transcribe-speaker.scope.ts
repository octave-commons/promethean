import type { Bot } from '../bot.js';
import type * as discord from 'discord.js';
import { makeLogger, type Logger } from '../factories/logger.js';
import { makePolicy, type PolicyChecker } from '../factories/policy.js';

export type TranscribeSpeakerScope = {
    logger: Logger;
    policy: PolicyChecker;
    start: (input: TranscribeSpeakerInput) => Promise<TranscribeSpeakerOutput>;
};

export type TranscribeSpeakerInput = {
    bot: Bot;
    user: discord.User;
    log?: boolean;
};

export type TranscribeSpeakerOutput = { ok: boolean };

export async function buildTranscribeSpeakerScope(): Promise<Pick<TranscribeSpeakerScope, 'logger' | 'policy'>> {
    return {
        logger: makeLogger('transcribe-speaker'),
        policy: makePolicy(),
    };
}

export function makeTranscribeActions(): Pick<TranscribeSpeakerScope, 'start'> {
    return {
        start: async ({ bot, user, log }) => {
            if (!bot.currentVoiceSession) return { ok: false };
            bot.currentVoiceSession.addSpeaker(user);
            await bot.currentVoiceSession.startSpeakerTranscribe(user, !!log);
            return { ok: true };
        },
    };
}
