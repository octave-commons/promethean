import { randomUUID, UUID } from "crypto";
import { EventEmitter } from "node:events";

import {
  AudioPlayer,
  AudioPlayerStatus,
  EndBehaviorType,
  StreamType,
  VoiceConnection,
  VoiceReceiver,
  AudioReceiveStream,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import * as discord from "discord.js";
import { createLogger } from "@promethean-os/utils";

import { Speaker } from "./speaker.js";
// import {Transcript} from "./transcript"
import { Transcriber } from "./transcriber.js";
import { VoiceRecorder } from "./voice-recorder.js";
import { VoiceSynth } from "./voice-synth.js";

/**
   Handles all things voice. Emits an event when a user begins speaking, and when they stop speaking
   the start speaking event will have a timestamp and a wav  stream.
   */

export type VoiceSessionOptions = {
  voiceChannelId: string;
  guild: discord.Guild;
};
export type VoiceSessionEvents = {
  readonly audioPlayerStart: [AudioPlayer];
  readonly audioPlayerStop: [AudioPlayer];
};

export class VoiceSession extends EventEmitter<VoiceSessionEvents> {
  id: UUID;
  guild: discord.Guild;
  voiceChannelId: string;
  options: VoiceSessionOptions;
  speakers: Map<string, Speaker>;
  // transcript: Transcript;
  connection?: VoiceConnection;
  transcriber: Transcriber;
  recorder: VoiceRecorder;
  voiceSynth: VoiceSynth;
  #log = createLogger({ service: "voice:session" });
  constructor(options: VoiceSessionOptions) {
    super();
    this.id = randomUUID();
    this.guild = options.guild;
    this.voiceChannelId = options.voiceChannelId;

    this.options = options;
    this.speakers = new Map(); // Map of user IDs to Speaker instances
    // this.transcript = new Transcript();
    this.transcriber = new Transcriber();
    this.recorder = new VoiceRecorder();
    this.voiceSynth = new VoiceSynth();
  }
  get receiver(): VoiceReceiver | undefined {
    return this.connection?.receiver;
  }
  start(): void {
    const existingConnection = getVoiceConnection(this.guild.id);
    if (existingConnection) {
      throw new Error(
        "Cannot start new voice session with an existing connection. Bot must leave current voice  session to start a new one.",
      );
    }
    this.connection = joinVoiceChannel({
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
      channelId: this.voiceChannelId,
      selfDeaf: false,
      selfMute: false,
    });
    try {
      this.registerSpeakingListener();
    } catch (err) {
      this.#log.error("failed to register speaking listener", { err });
      throw new Error("Something went wrong starting the voice session");
    }
  }

  private registerSpeakingListener(): void {
    this.connection!.receiver.speaking.on("start", (userId) => {
      const speaker = this.speakers.get(userId);
      if (speaker) {
        speaker.isSpeaking = true;
        if (speaker.stream) return;
        if (!speaker.stream) speaker.stream = this.getOpusStreamForUser(userId);
        if (speaker.stream) {
          speaker.stream.on("end", () => {
            try {
              speaker.stream?.destroy();
            } catch (e) {
              this.#log.warn("failed to destroy stream cleanly", { err: e });
            }
          });

          speaker.stream.on("error", (err: unknown) => {
            this.#log.warn("stream error", { userId, err });
          });

          speaker.stream.on("close", () => {
            this.#log.info("stream closed", { userId });
            speaker.stream = null;
          });

          void speaker.handleSpeakingStart(speaker.stream);
        }
      }
    });
  }
  getOpusStreamForUser(userId: string): AudioReceiveStream | undefined {
    return this.receiver?.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1_000,
      },
    });
  }
  async stop(): Promise<void> {
    if (this.connection) {
      this.connection.destroy();
      this.speakers.clear();
    }
  }
  async addSpeaker(user: discord.User): Promise<void> {
    if (this.speakers.has(user.id)) return;
    this.speakers.set(
      user.id,
      new Speaker({
        user,
        transcriber: this.transcriber,
        recorder: this.recorder,
      }),
    );
  }
  async removeSpeaker(user: discord.User): Promise<void> {
    this.speakers.delete(user.id);
  }
  async startSpeakerRecord(user: discord.User): Promise<void> {
    const speaker = this.speakers.get(user.id);
    if (speaker) {
      speaker.isRecording = true;
    }
  }
  async startSpeakerTranscribe(
    user: discord.User,
    log: boolean = false,
  ): Promise<void> {
    const speaker = this.speakers.get(user.id);
    if (speaker) {
      speaker.isTranscribing = true;
      speaker.logTranscript = log;
    }
  }
  async stopSpeakerRecord(user: discord.User): Promise<void> {
    const speaker = this.speakers.get(user.id);
    if (speaker) speaker.isRecording = false;
  }
  async stopSpeakerTranscribe(user: discord.User): Promise<void> {
    const speaker = this.speakers.get(user.id);
    if (speaker) speaker.isTranscribing = false;
  }
  playVoice(text: string): Promise<VoiceSession> {
    return new Promise(async (resolve, _reject) => {
      if (!this.connection) throw new Error("No connection");
      const player = createAudioPlayer();
      const { stream, cleanup } =
        await this.voiceSynth.generateAndUpsampleVoice(text);

      const resource = createAudioResource(stream, {
        inputType: StreamType.Raw,
      });
      player.play(resource);

      this.emit("audioPlayerStart", player);

      this.connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        cleanup(); // ensure subprocesses are cleaned up
        this.emit("audioPlayerStop", player);
        resolve(this);
      });

      return player; // return the player so you can call pause/stop externally
    });
  }
}
