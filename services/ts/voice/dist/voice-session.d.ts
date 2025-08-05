import { VoiceConnection } from "@discordjs/voice";
import * as discord from "discord.js";
import { Speaker } from "./speaker";
import { UUID } from "crypto";
import { Transcriber } from "./transcriber";
import { VoiceRecorder } from "./voice-recorder";
import { VoiceSynth } from "./voice-synth";
import EventEmitter from "events";
/**
   Handles all things voice. Emits an event when a user begins speaking, and when they stop speaking
   the start speaking event will have a timestamp and a wav  stream.
   */
export type VoiceSessionOptions = {
    voiceChannelId: string;
    guild: discord.Guild;
};
export declare class VoiceSession extends EventEmitter {
    id: UUID;
    guild: discord.Guild;
    voiceChannelId: string;
    options: VoiceSessionOptions;
    speakers: Map<string, Speaker>;
    connection?: VoiceConnection;
    transcriber: Transcriber;
    recorder: VoiceRecorder;
    voiceSynth: VoiceSynth;
    constructor(options: VoiceSessionOptions);
    get receiver(): import("@discordjs/voice").VoiceReceiver | undefined;
    start(): void;
    getOpusStreamForUser(userId: string): import("@discordjs/voice").AudioReceiveStream | undefined;
    stop(): Promise<void>;
    addSpeaker(user: discord.User): Promise<Map<string, Speaker> | undefined>;
    removeSpeaker(user: discord.User): Promise<void>;
    startSpeakerRecord(user: discord.User): Promise<void>;
    startSpeakerTranscribe(user: discord.User, log?: boolean): Promise<void>;
    stopSpeakerRecord(user: discord.User): Promise<void>;
    stopSpeakerTranscribe(user: discord.User): Promise<void>;
    playVoice(text: string): Promise<unknown>;
}
//# sourceMappingURL=voice-session.d.ts.map