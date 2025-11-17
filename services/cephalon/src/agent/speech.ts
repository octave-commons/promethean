import { randomUUID } from "crypto";

import { createAudioResource, StreamType } from "@discordjs/voice";
import { sleep } from "@promethean-os/utils";

import {
  splitSentances,
  seperateSpeechFromThought,
  classifyPause,
  estimatePauseDuration,
} from "../tokenizers.js";

import { Utterance } from "./speechCoordinator.js";

import type { AIAgent } from "./index.js";

let AGENT_NAME = "Agent";
try {
  ({ AGENT_NAME } = await import("@promethean-os/legacy/env.js"));
} catch {}

export async function speak(this: AIAgent, text: string) {
  const session = this.bot.currentVoiceSession;
  if (!session || !session.connection) return;
  let cleanup: (() => void) | undefined;
  return new Promise((resolve) => {
    const utterance: Utterance = {
      id: randomUUID(),
      turnId: this.turnManager.turnId,
      priority: 1,
      bargeIn: "pause",
      group: "agent-speech",
      makeResource: async () => {
        const { stream, cleanup: c } =
          await session.voiceSynth.generateAndUpsampleVoice(text);
        cleanup = c;
        return createAudioResource(stream, { inputType: StreamType.Raw });
      },
      onEnd: () => {
        cleanup?.();
        resolve(null);
      },
    };
    session.connection.subscribe(this.speechArbiter.audioPlayer);
    this.speechArbiter.enqueue(utterance);
  });
}

export async function storeAgentMessage(
  this: AIAgent,
  text: string,
  is_transcript = true,
  startTime = Date.now(),
  endTime = Date.now(),
) {
  const messages = this.context.getCollection("agent_messages");
  return messages.insert({
    text,
    createdAt: Date.now(),
    metadata: {
      startTime,
      endTime,
      is_transcript,
      author: this.bot.applicationId,
      agentMessage: true,
      userName: AGENT_NAME,
      channel: this.bot.currentVoiceSession?.voiceChannelId,
      recipient: this.bot.applicationId,
      createdAt: Date.now(),
    },
  });
}

export async function generateVoiceResponse(this: AIAgent) {
  try {
    if (this.isSpeaking) return;
    this.isSpeaking = true;
    console.log("Generating voice response");
    let content = await this.generateVoiceContent();

    if (!content) {
      content =
        "I'm a duck, who's name is Duck. How creative. Quack quack quack. Seems like there is a problem with my AI.";
    }

    console.log("Generated voice response:", content);
    this.emit("readyToSpeak", content);

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
      if (sentence.type === "thought") {
        const kind = classifyPause(sentence.text);
        const ms = estimatePauseDuration(sentence.text);
        console.log(`[Pause] (${kind}) "${sentence.text}" → sleeping ${ms}ms`);
        await sleep(ms);
        continue;
      }
      console.log(sentence);
      await this.speak(sentence.text.trim());

      finishedSentences.push(sentence);

      if (this.isStopped) {
        this.isStopped = false;
        break;
      }
    }

    const endTime = Date.now();

    await this.storeAgentMessage(
      finishedSentences.map(({ text }) => text).join(" "),
      true,
      startTime,
      endTime,
    );

    this.isSpeaking = false;
  } catch (err) {
    console.error(err);
  } finally {
    this.isSpeaking = false;
    this.emit("doneSpeaking");
  }
}
