import * as discord from "discord.js";
import {
  captureAndRenderWaveform,
  AudioImageData,
} from "../audioProcessing/waveform.js";

const VISION_HOST = process.env.VISION_HOST || "http://localhost:8080/vision";
export async function captureScreen(): Promise<Buffer> {
  if (process.env.NO_SCREENSHOT === "1") {
    return Buffer.alloc(0);
  }
  const res = await fetch(`${VISION_HOST}/capture`);
  if (!res.ok) throw new Error("Failed to capture screen");
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export interface DesktopCaptureData {
  audio: AudioImageData;
  screen: Buffer;
}

type DesktopDeps = {
  captureScreen: typeof captureScreen;
  captureAndRenderWaveform: typeof captureAndRenderWaveform;
};

export class DesktopCaptureManager {
  frames: DesktopCaptureData[] = [];
  limit = 5;
  step = 5; // seconds between captures
  isRunning = false;
  channel?: discord.TextChannel;
  deps: DesktopDeps;

  constructor(deps: Partial<DesktopDeps> = {}) {
    this.deps = {
      captureScreen,
      captureAndRenderWaveform,
      ...deps,
    };
  }

  setChannel(channel?: discord.TextChannel) {
    if (!channel) throw TypeError("Cannot set an undefined channel");
    this.channel = channel;
  }

  async capture(): Promise<DesktopCaptureData> {
    const [screen, audio] = await Promise.all([
      this.deps.captureScreen(),
      this.deps.captureAndRenderWaveform(),
    ]);
    return { screen, audio };
  }

  async start() {
    this.isRunning = true;
    while (this.isRunning) {
      const frame = await this.capture();
      this.frames.push(frame);

      if (this.channel) {
        const now = Date.now();
        const files = [
          { attachment: frame.screen, name: `screen-${now}.png` },
          {
            attachment: frame.audio.waveForm,
            name: `desktop-waveform-${now}.png`,
          },
          {
            attachment: frame.audio.spectrogram,
            name: `desktop-spectrogram-${now}.png`,
          },
          {
            attachment: frame.audio.waveBuffer,
            name: `desktop-audio-${now}.wav`,
          },
        ];
        try {
          await this.channel.send({ files });
        } catch (e) {
          console.warn("Failed to upload desktop capture", e);
        }
      }

      if (this.frames.length > this.limit) {
        this.frames.shift();
      }

      await new Promise((res) => setTimeout(res, this.step * 1000));
    }
  }

  stop() {
    this.isRunning = false;
  }
}
