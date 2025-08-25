import type { Bot } from '../bot.js';
import { makeLogger, type Logger } from '../factories/logger.js';
import { makePolicy, type PolicyChecker } from '../factories/policy.js';

export type TtsScope = {
    logger: Logger;
    policy: PolicyChecker;
    speak: (input: TtsInput) => Promise<TtsOutput>;
};

export type TtsInput = {
    bot: Bot;
    message: string;
};

export type TtsOutput = { ok: boolean };

export async function buildTtsScope(): Promise<Pick<TtsScope, 'logger' | 'policy'>> {
    return {
        logger: makeLogger('tts'),
        policy: makePolicy(),
    };
}

export function makeTtsAction(): TtsScope['speak'] {
    return async ({ bot, message }) => {
        if (!bot.currentVoiceSession) return { ok: false };
        await bot.currentVoiceSession.playVoice(message);
        return { ok: true };
    };
}
