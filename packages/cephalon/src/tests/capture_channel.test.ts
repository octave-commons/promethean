import test from "ava";

import { VoiceSession } from "../voice-session.js";

// Verify that saved recordings and captures are sent to the configured channel

test("uploads saved waveform, spectrogram, and screenshot to configured channel", async (t) => {
  let sent: any = null;
  const channel = {
    send: async (data: any) => {
      sent = data;
    },
  } as any;
  const bot = { captureChannel: channel } as any;
  const deps = {
    readFile: async () => Buffer.from("wav"),
    audioService: {
      generate: async () => ({
        waveform: Buffer.from("wave"),
        spectrogram: Buffer.from("spec"),
      }),
    } as any,
    captureScreen: async () => Buffer.from("screen"),
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

  // Simulate a saved recording event so the handler is exercised
  vs.recorder.emit("saved", { filename: "test.wav", userId: "u", saveTime: 0 });

  await done;

  t.is(sent.files.length, 4);
  t.is(sent.files[0].name, "test.wav");
  t.is(sent.files[0].attachment.toString(), "wav");
  t.deepEqual(sent.files[1].name, "waveform-0.png");
  t.deepEqual(sent.files[2].name, "spectrogram-0.png");
  t.deepEqual(sent.files[3].name, "screencap-0.png");

  // Ensure cleanup
  vs.recorder.removeAllListeners();
});
