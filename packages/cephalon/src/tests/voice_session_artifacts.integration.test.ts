import test from "ava";

import { VoiceSession } from "../voice-session.js";
import { AudioService } from "../audio-service.js";

class FakeBroker {
  subs = new Map<string, (event: any) => void>();
  async connect() {}
  subscribe(topic: string, cb: (event: any) => void) {
    this.subs.set(topic, cb);
  }
  enqueue(topic: string, payload: any) {
    if (topic === "audio.generateArtifacts") {
      const handler = this.subs.get(payload.replyTopic);
      handler?.({
        payload: {
          waveform: Buffer.from("wave").toString("base64"),
          spectrogram: Buffer.from("spec").toString("base64"),
        },
      });
    }
  }
}

test("voice session captures and uploads artifacts via audio service", async (t) => {
  let sent: any = null;
  const channel = {
    send: async (data: any) => {
      sent = data;
    },
  } as any;
  const bot = { captureChannel: channel } as any;
  const audioService = new AudioService({ broker: new FakeBroker() as any });
  const deps = {
    readFile: async () => Buffer.from("wav"),
    captureScreen: async () => Buffer.from("screen"),
    audioService,
    transcriber: { push: () => {}, stop: () => {} } as any,
  };
  const vs = new VoiceSession(
    { voiceChannelId: "1", guild: {} as any, bot },
    deps as any,
  );

  const done = new Promise<void>((resolve) => {
    channel.send = async (data: any) => {
      sent = data;
      resolve();
    };
  });

  vs.recorder.emit("saved", { filename: "test.wav", userId: "u", saveTime: 0 });
  await done;

  t.is(sent.files.length, 4);
  t.is(sent.files[0].name, "test.wav");
  t.is(sent.files[0].attachment.toString(), "wav");
  t.is(sent.files[1].name, "waveform-0.png");
  t.is(sent.files[1].attachment.toString(), "wave");
  t.is(sent.files[2].name, "spectrogram-0.png");
  t.is(sent.files[2].attachment.toString(), "spec");
  t.is(sent.files[3].name, "screencap-0.png");
  t.is(sent.files[3].attachment.toString(), "screen");

  vs.recorder.removeAllListeners();
});
