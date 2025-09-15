import { spawn, type ChildProcessByStdio } from "child_process";
import { EventEmitter } from "node:events";
import { IncomingMessage, request } from "http";
import { Readable, type Writable } from "stream";

import { createLogger } from "@promethean/utils";
export type VoiceSynthOptions = {
  readonly host: string;
  readonly endpoint: string;
  readonly port: number;
};
export type VoiceSynthEvents = Record<string, never>;

export class VoiceSynth extends EventEmitter<VoiceSynthEvents> {
  readonly host: string;
  readonly endpoint: string;
  readonly port: number;
  readonly #log = createLogger({ service: "voice:synth" });
  constructor(
    options: VoiceSynthOptions = {
      host: "localhost",
      endpoint: "/tts/synth_voice",
      port: Number(process.env.PROXY_PORT) || 8080,
    },
  ) {
    super();
    this.host = options.host;
    this.endpoint = options.endpoint;
    this.port = options.port;
  }

  spawnFfmpeg(): ChildProcessByStdio<Writable, Readable, null> {
    const args = [
      "-f",
      "s16le",
      "-ar",
      "22050",
      "-ac",
      "1",
      "-i",
      "pipe:0",
      "-f",
      "s16le",
      "-ar",
      "48000",
      "-ac",
      "2",
      "pipe:1",
    ];
    return spawn("ffmpeg", args, {
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
    });
  }
  async generateAndUpsampleVoice(
    text: string,
  ): Promise<{ stream: Readable; cleanup: () => void }> {
    const req = request({
      hostname: this.host,
      port: this.port,
      path: "/tts/synth_voice_pcm",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(
          `input_text=${encodeURIComponent(text)}`,
        ),
      },
    });

    req.write(`input_text=${encodeURIComponent(text)}`);
    req.end();

    return new Promise((resolve, reject) => {
      req
        .on("response", (res) => {
          const ffmpeg = this.spawnFfmpeg();
          const cleanup = () => {
            res.unpipe(ffmpeg.stdin);
            ffmpeg.stdin.destroy(); // prevent EPIPE
            ffmpeg.kill("SIGTERM");
          };
          res.pipe(ffmpeg.stdin);
          resolve({ stream: ffmpeg.stdout, cleanup });
        })
        .on("error", (e) => reject(e));
    });
  }
  async generateVoice(text: string): Promise<IncomingMessage> {
    this.#log.info("generate voice", { text });
    // Pipe the PCM stream directly
    return new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: this.host,
          port: this.port,
          path: "/tts/synth_voice",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(
              `input_text=${encodeURIComponent(text)}`,
            ),
          },
        },
        resolve,
      );

      req.on("error", (e) => {
        reject(e);
      });

      req.write(`input_text=${encodeURIComponent(text)}`);
      req.end();
    });
  }
}
