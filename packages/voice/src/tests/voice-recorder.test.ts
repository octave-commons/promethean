import { PassThrough } from "node:stream";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import test from "ava";
import type { User } from "discord.js";

import { VoiceRecorder, type RecordingMetaData } from "../voice-recorder.js";


test("saves pcm stream to wav file", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "voice-recorder-"));
  const recorder = new VoiceRecorder({
    saveDest: relative(process.cwd(), dir),
  });
  const user = { id: "123", username: "u" } as unknown as User;
  const pcm = new PassThrough();
  const saveTime = Date.now();

  recorder.recordPCMStream(saveTime, user, pcm);

  const done = new Promise<void>((resolve, reject) => {
    recorder.once("saved", (meta: RecordingMetaData) => {
      t.true(existsSync(meta.filename));
      rmSync(meta.filename);
      rmSync(dir, { recursive: true, force: true });
      resolve();
    });
    recorder.once("error", (err: unknown) => reject(err));
  });

  pcm.end(Buffer.alloc(2));
  await done;
});

test("emits error when write fails", async (t) => {
  const dir = join("nonexistent", "dir");
  const recorder = new VoiceRecorder({ saveDest: dir });
  const user = { id: "123", username: "u" } as unknown as User;
  const pcm = new PassThrough();
  const saveTime = Date.now();
  recorder.recordPCMStream(saveTime, user, pcm);
  const err = await new Promise<unknown>((resolve) => {
    recorder.once("error", (e: unknown) => resolve(e));
    pcm.end(Buffer.alloc(2));
  });
  t.truthy(err);
});
