/** Handles saving pcm data to wav files on disk.
    In the future it will also accept other formats.
    */
import { PassThrough } from "node:stream";
import { createWriteStream } from "node:fs";
import { EventEmitter } from "node:events";

import * as wav from "wav";
import type { Writer } from "wav";
import { User } from "discord.js";
import { createLogger } from "@promethean-os/utils";

export type RecordingMetaData = {
  filename: string;
  userId: string;
  saveTime: number;
};
export type VoiceRecorderOptions = {
  saveDest: string;
};

export type VoiceRecorderEvents = {
  readonly saved: [RecordingMetaData];
  readonly error: [unknown];
};

export class VoiceRecorder extends EventEmitter<VoiceRecorderEvents> {
  saveDest: string;
  #log = createLogger({ service: "voice:recorder" });
  constructor(
    options: VoiceRecorderOptions = {
      saveDest: "./recordings",
    },
  ) {
    super();
    this.saveDest = options.saveDest;
  }
  recordPCMStream(
    saveTime: number,
    user: User,
    pcmStream: PassThrough,
  ): Writer {
    const wavWriter = new wav.Writer({
      channels: 2,
      sampleRate: 48000,
      bitDepth: 16,
    }).once("error", (err) => {
      this.#log.error("wav writer failure", { err });
      this.emit("error", err);
    });
    const filename = `./${this.saveDest}/${saveTime}-${user.id}.wav`;
    const wavFileStream = createWriteStream(filename)
      .once("close", () => {
        this.#log.info("recording complete", { filename });
        this.emit("saved", {
          filename,
          userId: user.id,
          saveTime,
        });
      })
      .once("error", (err) => {
        this.#log.error("wav file stream failure", { err, filename });
        this.emit("error", err);
      });
    wavWriter.pipe(wavFileStream);

    return pcmStream.pipe(wavWriter);
  }
}
