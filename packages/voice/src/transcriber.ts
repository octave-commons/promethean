import { EventEmitter } from "node:events";
import http, { RequestOptions } from "node:http";
import { PassThrough } from "node:stream";

import { User } from "discord.js";
import { createLogger } from "@promethean-os/utils";

import type { Speaker } from "./speaker.js";

export type TranscriberOptions = {
  hostname: string;
  port: number;
  endpoint: string;
};
export type TranscriptChunk = {
  speaker: Speaker;
  startTime: number;
  endTime: number;
  text: string;
};
export type FinalTranscript = {
  speaker?: Speaker;
  user?: User;
  userName: string;
  startTime?: number;
  endTime: number;
  transcript: string;
  originalTranscript?: string;
};
export type TranscriberEvents = {
  readonly transcriptStart: [
    {
      startTime: number;
      speaker: Speaker;
    },
  ];
  readonly transcriptChunk: [TranscriptChunk];
  readonly transcriptEnd: [FinalTranscript];
};

export class Transcriber extends EventEmitter<TranscriberEvents> {
  httpOptions: RequestOptions;
  #log = createLogger({ service: "voice:transcriber" });

  constructor(
    options: TranscriberOptions = {
      hostname: "localhost",
      port: Number(process.env.PROXY_PORT) || 8080,
      endpoint: "/stt/transcribe_pcm",
    },
  ) {
    super();
    this.httpOptions = {
      hostname: options.hostname,
      port: options.port,
      path: options.endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Transfer-Encoding": "chunked",
        "X-Sample-Rate": 48000,
        "X-Dtype": "int16",
      },
    };
  }
  transcribePCMStream(
    startTime: number,
    speaker: Speaker,
    pcmStream: PassThrough,
  ): http.ClientRequest {
    this.emit("transcriptStart", { startTime, speaker });
    // ✅ Pipe PCM directly into the HTTP request
    return pcmStream.pipe(
      http
        .request(this.httpOptions, (res) => {
          const transcriptChunks: TranscriptChunk[] = [];
          res.on("data", (chunk: Buffer) => {
            const chunkStr = chunk.toString();
            this.#log.debug("chunk", { chunk: chunkStr });
            const parsed = JSON.parse(chunkStr) as { transcription: string };
            const transcript = parsed.transcription;
            this.#log.info("transcription chunk", { transcript });
            const transcriptObject: TranscriptChunk = {
              startTime,
              speaker,
              text: transcript,
              endTime: Date.now(),
            };
            transcriptChunks.push(transcriptObject);
            this.emit("transcriptChunk", transcriptObject);
          });
          res.on("end", async () => {
            this.#log.info("transcription ended");

            const originalTranscript = transcriptChunks
              .map((t) => t.text)
              .join(" ");

            this.emit("transcriptEnd", {
              startTime,
              speaker,
              originalTranscript,
              user: speaker.user,
              userName: speaker.user.username,
              transcript: originalTranscript,
              endTime: Date.now(),
            });
          });
        })
        .on("error", (err) => {
          this.#log.error("transcription request error", { err });
        }),
    );
  }
}
