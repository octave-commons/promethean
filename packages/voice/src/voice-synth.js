// SPDX-License-Identifier: GPL-3.0-only
import { spawn } from "child_process";
import EventEmitter from "events";
import { request } from "http";
export class VoiceSynth extends EventEmitter {
  host;
  endpoint;
  port;
  constructor(
    options = {
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
  async generateAndUpsampleVoice(text) {
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
          const ffmpeg = spawn(
            "ffmpeg",
            [
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
            ],
            {
              stdio: ["pipe", "pipe", "ignore"],
              windowsHide: true,
            },
          );
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
  async generateVoice(text) {
    console.log("generate voice for", text);
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
//# sourceMappingURL=voice-synth.js.map
