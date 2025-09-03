import { PassThrough } from "node:stream";
import { Transcriber } from "./transcriber.js";
import { AudioReceiveStream } from "@discordjs/voice";
import { User } from "discord.js";
import EventEmitter from "node:events";
import { VoiceRecorder } from "./voice-recorder.js";
export type SpeakerOptions = {
  user: User;
  transcriber: Transcriber;
  recorder: VoiceRecorder;
};
export declare class Speaker extends EventEmitter {
  logTranscript?: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  user: User;
  transcriber: Transcriber;
  recorder: VoiceRecorder;
  stream?: AudioReceiveStream | null | undefined;
  constructor(options: SpeakerOptions);
  get userId(): string;
  get userName(): string;
  handleSpeakingStart(opusStream: AudioReceiveStream): Promise<PassThrough>;
  toggleTranscription(): boolean;
  toggleRecording(): boolean;
}
//# sourceMappingURL=speaker.d.ts.map
