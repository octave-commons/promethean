// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import { VoiceSession } from "../voice-session.js";

// Basic construction test for VoiceSession with stubbed transcriber

test("constructs VoiceSession with stubbed transcriber", (t) => {
  const bot = {} as any;
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
  t.truthy(vs);
  vs.recorder.removeAllListeners();
});
