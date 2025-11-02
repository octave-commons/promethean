import { BrokerClient } from "@promethean-os/legacy/brokerClient.js";

export type AudioServiceOptions = {
  brokerUrl?: string;
  broker?: BrokerClient;
};

export type AudioArtifacts = {
  waveform: Buffer;
  spectrogram: Buffer;
};

export class AudioService {
  broker: BrokerClient;
  #ready: Promise<void>;
  #pending: ((res: AudioArtifacts) => void)[] = [];
  #replyTopic: string;

  constructor(options: AudioServiceOptions = {}) {
    const brokerUrl =
      options.brokerUrl || process.env.BROKER_URL || "ws://localhost:7000";
    this.#replyTopic = "cephalon.audio.artifacts";
    this.broker =
      options.broker ||
      new BrokerClient({
        url: brokerUrl,
        id: "cephalon-audio-service",
      });
    this.#ready = this.broker
      .connect()
      .then(() => {
        this.broker.subscribe(this.#replyTopic, (event: any) => {
          const resolve = this.#pending.shift();
          if (resolve) {
            const { waveform, spectrogram } = event.payload || {};
            resolve({
              waveform: Buffer.from(waveform, "base64"),
              spectrogram: Buffer.from(spectrogram, "base64"),
            });
          }
        });
      })
      .catch((err: unknown) => {
        console.error("Failed to connect to broker", err);
      });
  }

  async generate(audio: Buffer): Promise<AudioArtifacts> {
    await this.#ready;
    return new Promise((resolve) => {
      this.#pending.push(resolve);
      this.broker.enqueue("audio.generateArtifacts", {
        audio: audio.toString("base64"),
        replyTopic: this.#replyTopic,
      });
    });
  }
}
