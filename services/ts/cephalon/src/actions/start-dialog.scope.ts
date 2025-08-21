import * as discord from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { randomUUID } from 'crypto';
import { createAgentWorld } from '@shared/ts/dist/agent-ecs/world.js';
import { OrchestratorSystem } from '@shared/ts/dist/agent-ecs/systems/orchestrator.js';
import type { Bot } from '../bot.js';
import type { FinalTranscript } from '../transcriber.js';
import { defaultPrompt } from '../prompts.js';

export type StartDialogInput = { bot: Bot };
export type StartDialogOutput = { started: boolean };

export async function runStartDialog({ bot }: StartDialogInput): Promise<StartDialogOutput> {
    if (!bot.currentVoiceSession) return { started: false };

    bot.desktop.start();

    const discordAudioRef = bot.currentVoiceSession.getEcsAudioRef();
    bot.agentWorld = createAgentWorld(discordAudioRef);
    const { w, agent, C, addSystem } = bot.agentWorld;

    addSystem(
        OrchestratorSystem(
            w,
            bot.bus!,
            C,
            async (text: string) => {
                const msgs = await bot.context.compileContext([text]);
                return msgs.map((m: any) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
            },
            () => defaultPrompt,
        ),
    );

    bot.agentWorld.start(50);

    bot.currentVoiceSession.transcriber.on('transcriptEnd', (tr: FinalTranscript) => {
        const turnId = w.get(agent, C.Turn)?.id ?? 0;
        const tf = { text: tr.transcript, ts: Date.now() };
        w.set(agent, C.TranscriptFinal, tf);
        bot.bus?.publish({
            topic: 'agent.transcript.final',
            corrId: randomUUID(),
            turnId,
            ts: Date.now(),
            text: tr.transcript,
            channelId: bot.currentVoiceSession!.voiceChannelId,
            userId: tr.user?.id,
        });
    });

    const speaking = bot.currentVoiceSession.connection?.receiver.speaking;
    let lastLevel = -1;
    const onLevel = (level: number) => {
        if (level === lastLevel) return;
        lastLevel = level;
        const rv0 = w.get(agent, C.RawVAD) ?? { level: 0, ts: 0 };
        const rv = { ...rv0, level, ts: Date.now() };
        w.set(agent, C.RawVAD, rv);
    };
    speaking?.on('start', () => onLevel(1));
    speaking?.on('end', () => onLevel(0));
    bot.currentVoiceSession.transcriber.on('transcriptStart', () => onLevel(1)).on('transcriptEnd', () => onLevel(0));

    const qUtter = w.makeQuery({ all: [C.Utterance] });
    bot.currentVoiceSession.getPlayer().on(AudioPlayerStatus.Idle, () => {
        for (const [e, get] of w.iter(qUtter)) {
            const u = get(C.Utterance);
            if (u?.status === 'playing') {
                w.set(e, C.Utterance, { ...u, status: 'done' });
            }
        }
    });

    // Seed current members and track joins/leaves
    (async () => {
        const voiceChan = await bot.client.channels.fetch(bot.currentVoiceSession!.voiceChannelId);
        if (voiceChan?.isVoiceBased()) {
            for (const [, member] of voiceChan.members) {
                if (member.user.bot) continue;
                await bot.currentVoiceSession!.addSpeaker(member.user);
                await bot.currentVoiceSession!.startSpeakerTranscribe(member.user);
            }
        }

        if (bot.voiceStateHandler) bot.client.off(discord.Events.VoiceStateUpdate, bot.voiceStateHandler);
        bot.voiceStateHandler = (oldState, newState) => {
            const id = bot.currentVoiceSession?.voiceChannelId;
            const user = newState.member?.user || oldState.member?.user;
            if (!id || !user || user.bot) return;
            if (oldState.channelId !== id && newState.channelId === id) {
                bot.currentVoiceSession?.addSpeaker(user);
                bot.currentVoiceSession?.startSpeakerTranscribe(user);
            } else if (oldState.channelId === id && newState.channelId !== id) {
                bot.currentVoiceSession?.stopSpeakerTranscribe(user);
                bot.currentVoiceSession?.removeSpeaker(user);
            }
        };
        bot.client.on(discord.Events.VoiceStateUpdate, bot.voiceStateHandler);
    })().catch(() => {});

    return { started: true };
}
