// Handles decoding ogg streams to pcm packets.
// Emits pcm packets for consumption by other sources.

// import { once } from 'node:events';
import { PassThrough } from "node:stream";
import { Transform, TransformCallback } from "node:stream";
import { EventEmitter } from "node:events";

import { AudioReceiveStream } from "@discordjs/voice";
import { User } from "discord.js";
import * as prism from "prism-media";

import type { Transcriber } from "./transcriber.js";
import type { VoiceRecorder } from "./voice-recorder.js";

export type SpeakerEvents = Record<string, never>;

class OpusSilenceFilter extends Transform {
  override _transform(
    chunk: Buffer,
    _: BufferEncoding,
    callback: TransformCallback,
  ): void {
    // Skip Discord's known Opus silence frame
    if (
      chunk.length === 3 &&
      chunk[0] === 0xf8 &&
      chunk[1] === 0xff &&
      chunk[2] === 0xfe
    ) {
      callback(); // Don't push anything, just skip this chunk
      return;
    }
    this.push(chunk);
    callback();
  }
}
export type SpeakerOptions = {
  user: User;
  transcriber: Transcriber;
  recorder: VoiceRecorder;
};

export class Speaker extends EventEmitter<SpeakerEvents> {
  logTranscript?: boolean;
  isRecording: boolean = false;
  isTranscribing: boolean = false;
  isSpeaking: boolean = false;
  user: User;
  transcriber: Transcriber;
  recorder: VoiceRecorder;
  stream?: AudioReceiveStream | null | undefined;

  constructor(options: SpeakerOptions) {
    super();
    this.user = options.user;
    this.transcriber = options.transcriber;
    this.recorder = options.recorder;
  }

  get userId(): string {
    return this.user.id;
  }

  get userName(): string {
    return this.user.username;
  }

  async handleSpeakingStart(
    opusStream: AudioReceiveStream,
  ): Promise<PassThrough> {
    this.isSpeaking = true;
    // Silence filter
    const filter = new OpusSilenceFilter();

    // Decoder -> PCM
    const decoder = new prism.opus.Decoder({
      channels: 2,
      rate: 48000,
      frameSize: 960,
    });

    // Shared stream for both sinks
    const pcmSplitter = new PassThrough();

    // Recording setup
    const startTime = Date.now();

    if (this.isRecording) {
      this.recorder.recordPCMStream(startTime, this.user, pcmSplitter);
    }

    if (this.isTranscribing) {
      this.transcriber.transcribePCMStream(startTime, this, pcmSplitter);
    }
    pcmSplitter.once("end", () => (this.isSpeaking = false));
    // Pipe everything
    return opusStream.pipe(filter).pipe(decoder).pipe(pcmSplitter);
  }

  toggleTranscription(): boolean {
    this.isTranscribing = !this.isTranscribing;
    return this.isTranscribing;
  }

  toggleRecording(): boolean {
    this.isRecording = !this.isRecording;
    return this.isRecording;
  }
}
