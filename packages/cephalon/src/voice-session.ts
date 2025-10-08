import { randomUUID, UUID } from "crypto";
import EventEmitter from "events";
import { basename } from "node:path";
import { readFile } from "fs/promises";

import { VoiceConnection } from "@discordjs/voice";
import * as discord from "discord.js";

import { Speaker } from "./speaker.js";
import { Transcriber } from "./transcriber.js";
import { VoiceRecorder } from "./voice-recorder.js";
import { Bot } from "./bot.js";
import { VoiceSynth } from "./voice-synth.js";
import { captureScreen } from "./desktop/desktopLoop.js";
import { AudioService } from "./audio-service.js";

export type VoiceSessionOptions = {
  voiceChannelId: string;
  guild: discord.Guild;
  bot: Bot;
};
type CaptureDeps = {
  audioService: AudioService;
  captureScreen: typeof captureScreen;
  readFile: typeof readFile;
  transcriber: Transcriber;
};

export class VoiceSession extends EventEmitter {
  id: UUID;
  guild: discord.Guild;
  voiceChannelId: string;
  options: VoiceSessionOptions;
  speakers: Map<string, Speaker>;
  connection?: VoiceConnection;
  transcriber: Transcriber;
  recorder: VoiceRecorder;
  voiceSynth?: VoiceSynth;
  bot: Bot;
  deps: Omit<CaptureDeps, "transcriber">;
  // placeholders reserved for future use

  constructor(options: VoiceSessionOptions, deps: Partial<CaptureDeps> = {}) {
    super();
    this.id = randomUUID();
    this.guild = options.guild;
    this.voiceChannelId = options.voiceChannelId;
    this.bot = options.bot;
    this.options = options;
    this.speakers = new Map();
    this.transcriber = deps.transcriber ?? new Transcriber();
    this.recorder = new VoiceRecorder();
    this.deps = {
      audioService: deps.audioService ?? new AudioService(),
      captureScreen,
      readFile,
      ...deps,
    };

    this.recorder.on("saved", async ({ filename, saveTime }: any) => {
      const channel = this.bot.captureChannel;
      if (channel) {
        const files: any[] = [];
        try {
          const buffer = await this.deps.readFile(filename);
          files.push({
            name: basename(filename),
            attachment: buffer,
          });
          const { waveform, spectrogram } =
            await this.deps.audioService.generate(buffer);
          files.push({
            name: `waveform-${saveTime}.png`,
            attachment: waveform,
          });
          files.push({
            name: `spectrogram-${saveTime}.png`,
            attachment: spectrogram,
          });
          const screenshot = await this.deps.captureScreen();
          files.push({
            name: `screencap-${saveTime}.png`,
            attachment: screenshot,
          });
        } catch (err) {
          console.error("Error generating capture files", err);
        }
        await channel.send({ files });
      }
    });
  }
  // ... rest of file unchanged
}
