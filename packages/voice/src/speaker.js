// SPDX-License-Identifier: GPL-3.0-only
// Handles decoding ogg streams to pcm packets.
// Emits pcm packets for consumption by other sources.
// import { once } from 'node:events';
import * as prism from "prism-media";
import { PassThrough } from "node:stream";
import { Transform } from "node:stream";
import EventEmitter from "node:events";
class OpusSilenceFilter extends Transform {
  _transform(chunk, _, callback) {
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
export class Speaker extends EventEmitter {
  logTranscript;
  isRecording = false;
  isTranscribing = false;
  isSpeaking = false;
  user;
  transcriber;
  recorder;
  stream;
  constructor(options) {
    super();
    this.user = options.user;
    this.transcriber = options.transcriber;
    this.recorder = options.recorder;
  }
  get userId() {
    return this.user.id;
  }
  get userName() {
    return this.user.username;
  }
  async handleSpeakingStart(opusStream) {
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
  toggleTranscription() {
    this.isTranscribing = !this.isTranscribing;
    return this.isTranscribing;
  }
  toggleRecording() {
    this.isRecording = !this.isRecording;
    return this.isRecording;
  }
}
//# sourceMappingURL=speaker.js.map
