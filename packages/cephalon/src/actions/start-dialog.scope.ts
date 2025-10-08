import { randomUUID } from 'crypto';

import * as discord from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { createAgentWorld } from '@promethean/agent-ecs/world.js';
import { OrchestratorSystem } from '@promethean/agent-ecs/systems/orchestrator.js';
import { enqueueUtterance } from '@promethean/agent-ecs/helpers/enqueueUtterance.js';
import { AGENT_NAME } from '@promethean/legacy/env.js';
import { sleep } from '@promethean/utils';

import type { Bot } from '../bot.js';
import type { FinalTranscript } from '../transcriber.js';
import { defaultPrompt } from '../prompts.js';
import {
  classifyPause,
  estimatePauseDuration,
  seperateSpeechFromThought,
  splitSentances,
} from '../tokenizers.js';
import { AIAgent } from '../agent/index.js';

export type StartDialogInput = { bot: Bot };
export type StartDialogOutput = { started: boolean };

export async function storeAgentMessage(
  bot: Bot,
  text: string,
  is_transcript = true,
  startTime = Date.now(),
  endTime = Date.now(),
) {
  const messages = bot.context.getCollection('agent_messages');
  return messages.insert({
    text,
    createdAt: Date.now(),
    metadata: {
      startTime,
      endTime,
      is_transcript,
      author: bot.applicationId,
      agentMessage: true,
      userName: AGENT_NAME,
      channel: bot.currentVoiceSession?.voiceChannelId,
      recipient: bot.applicationId,
      createdAt: Date.now(),
    },
  });
}
async function processAgentMessage(bot: Bot, content: string) {
  const texts = seperateSpeechFromThought(content);
  const sentences: { type: string; text: string }[] = texts.flatMap(
    ({ text, type }: { text: string; type: string }) =>
      splitSentances(text).map((sentance: string) => ({
        text: sentance,
        type,
      })),
  );
  console.log({ sentences });
  const finishedSentences = [] as { type: string; text: string }[];

  const startTime = Date.now();
  for (const sentence of sentences) {
    if (sentence.type === 'thought') {
      const kind = classifyPause(sentence.text);
      const ms = estimatePauseDuration(sentence.text);
      console.log(`[Pause] (${kind}) "${sentence.text}" → sleeping ${ms}ms`);
      // TODO: Implement an enqueuePause
      await sleep(ms);
      continue;
    }
    console.log(sentence);

    const { w, agent, C } = bot.agentWorld as { w: any; agent: number; C: any };
    enqueueUtterance(w, agent, C, {
      id: `${Date.now()}-${randomUUID()}`,
      group: 'agent-speech',
      priority: 1,
      bargeIn: 'pause',
      factory: async () => bot.currentVoiceSession.makeResourceFromText(sentence),
    });

    finishedSentences.push(sentence);
  }

  const endTime = Date.now();

  await storeAgentMessage(
    bot,
    finishedSentences.map(({ text }) => text).join(' '),
    true,
    startTime,
    endTime,
  );
}

export async function runStartDialog({ bot }: StartDialogInput): Promise<StartDialogOutput> {
  if (!bot.currentVoiceSession) return { started: false };

  bot.desktop.start();

  (async () => {
    const voiceChan = await bot.client.channels.fetch(
      bot.currentVoiceSession!.voiceChannelId,
    );
    if (voiceChan?.isVoiceBased()) {
      for (const [, member] of voiceChan.members) {
        if (member.user.bot) continue;
        await bot.currentVoiceSession!.addSpeaker(member.user);
        await bot.currentVoiceSession!.startSpeakerTranscribe(member.user);
      }
    }

    if (bot.voiceStateHandler)
      bot.client.off(discord.Events.VoiceStateUpdate, bot.voiceStateHandler);
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

  if (bot.mode === 'classic') {
    return runClassicStartDialog({ bot });
  }

  const discordAudioRef = bot.currentVoiceSession.getEcsAudioRef();
  bot.agentWorld = createAgentWorld(discordAudioRef);
  const { w, agent, C, addSystem } = bot.agentWorld;

  addSystem(
    OrchestratorSystem(
      w,
      bot.bus,
      C,
      async (text: string) => {
        const msgs = await bot.context.compileContext([text]);
        return msgs.map((m: any) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));
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
  bot.currentVoiceSession.transcriber
    .on('transcriptStart', () => onLevel(1))
    .on('transcriptEnd', () => onLevel(0));

  const qUtter = w.makeQuery({ all: [C.Utterance] });
  bot.currentVoiceSession.getPlayer().on(AudioPlayerStatus.Idle, () => {
    for (const [e, get] of w.iter(qUtter)) {
      const u = get(C.Utterance);
      if (u?.status === 'playing') {
        w.set(e, C.Utterance, { ...u, status: 'done' });
      }
    }
  });

  bot.bus?.subscribe('agent.llm.result', (res: any) => {
    if (!bot.agentWorld) return;
    const text = res?.text ?? res?.reply ?? '';
    console.log('llm response', text);
    if (!text) return;
    processAgentMessage(bot, text);
  });

  return { started: true };
}

async function runClassicStartDialog({ bot }: StartDialogInput): Promise<StartDialogOutput> {
  if (!bot.currentVoiceSession) return { started: false };
  if (!bot.legacyAgent) {
    bot.legacyAgent = new AIAgent({ bot, context: bot.context });
  }
  const agent = bot.legacyAgent;
  if (agent.state !== 'running') {
    await agent.start();
  }
  return { started: true };
}
