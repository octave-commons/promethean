import test from "ava";
import type { Guild, User } from "discord.js";

import { VoiceSession } from "../voice-session.js";

test("recording state toggles with start/stop", async (t) => {
  const guild = { id: "1" } as unknown as Guild;
  const vs = new VoiceSession({ guild, voiceChannelId: "10" });
  const user = { id: "7", username: "bob" } as unknown as User;
  await vs.addSpeaker(user);
  await vs.startSpeakerRecord(user);
  t.true(vs.speakers.get("7")?.isRecording);
  await vs.stopSpeakerRecord(user);
  t.false(vs.speakers.get("7")?.isRecording);
});

test("transcription state toggles with start/stop", async (t) => {
  const guild = { id: "2" } as unknown as Guild;
  const vs = new VoiceSession({ guild, voiceChannelId: "11" });
  const user = { id: "8", username: "alice" } as unknown as User;
  await vs.addSpeaker(user);
  await vs.startSpeakerTranscribe(user, false);
  t.true(vs.speakers.get("8")?.isTranscribing);
  await vs.stopSpeakerTranscribe(user);
  t.false(vs.speakers.get("8")?.isTranscribing);
});
