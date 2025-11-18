import test from "ava";
import { sleep } from "@promethean-os/utils";

import { DesktopCaptureManager } from "../desktop/desktopLoop.js";

// Ensure desktop captures are sent to configured channel

test("uploads desktop captures to configured channel", async (t) => {
  let sent: any = null;
  const manager = new DesktopCaptureManager({
    captureScreen: async () => Buffer.from("screen"),
    captureAndRenderWaveform: async () => ({
      waveForm: Buffer.from("wave"),
      spectrogram: Buffer.from("spec"),
    }),
  } as any);
  manager.setChannel({
    send: async (data: any) => {
      sent = data;
    },
  } as any);
  manager.step = 0;
  const run = manager.start();
  await sleep(10);
  manager.stop();
  await run;
  t.truthy(sent);
  t.is(sent.files.length, 4);
});
