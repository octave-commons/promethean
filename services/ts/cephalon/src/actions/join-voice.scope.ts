import * as discord from 'discord.js';
import type { Bot } from '../bot.js';
import { VoiceSession } from '../voice-session.js';
import { makeLogger, type Logger } from '../factories/logger.js';
import { makePolicy, type PolicyChecker } from '../factories/policy.js';
import { CollectionManager } from '../collectionManager.js';
import type { FinalTranscript } from '../transcriber.js';

export type JoinVoiceScope = {
    logger: Logger;
    policy: PolicyChecker;
    join: (input: JoinVoiceInput) => Promise<JoinVoiceOutput>;
};

export type JoinVoiceInput = {
    guild: discord.Guild;
    voiceChannelId: string;
    bot: Bot;
    textChannel?: discord.TextChannel | null;
};

export type JoinVoiceOutput = { joined: boolean };

export async function buildJoinVoiceScope(): Promise<Pick<JoinVoiceScope, 'logger' | 'policy'>> {
    return {
        logger: makeLogger('join-voice'),
        policy: makePolicy(),
    };
}

export function makeJoinAction(): JoinVoiceScope['join'] {
    return async (input: JoinVoiceInput): Promise<JoinVoiceOutput> => {
        const { bot, guild, voiceChannelId, textChannel } = input;
        if (bot.currentVoiceSession) return { joined: false };

        bot.currentVoiceSession = new VoiceSession({ bot, guild, voiceChannelId });
        bot.currentVoiceSession.transcriber.on('transcriptEnd', async (transcript: FinalTranscript) => {
            const transcripts = bot.context.getCollection('transcripts') as CollectionManager<'text', 'createdAt'>;
            await transcripts.addEntry({
                text: transcript.transcript,
                createdAt: transcript.startTime || Date.now(),
                metadata: {
                    createdAt: Date.now(),
                    endTime: transcript.endTime,
                    userId: transcript.user?.id,
                    userName: transcript.user?.username,
                    is_transcript: true,
                    channel: bot.currentVoiceSession?.voiceChannelId,
                    recipient: bot.applicationId,
                },
            });
            if (textChannel && transcript.transcript.trim().length > 0 && transcript.speaker?.logTranscript) {
                await textChannel.send(`${transcript.user?.username}:${transcript.transcript}`);
            }
        });
        bot.currentVoiceSession.start();
        return { joined: true };
    };
}
