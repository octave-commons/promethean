/** Handles saving pcm data to wav files on disk.
    In the future it will also accept other formats.
    */
import { PassThrough } from "node:stream";
import EventEmitter from "node:events";
import { User } from "discord.js";
export type RecordingMetaData = {
    filename: string;
    userId: string;
    saveTime: number;
};
export type VoiceRecorderOptions = {
    saveDest: string;
};
export declare class VoiceRecorder extends EventEmitter {
    saveDest: string;
    constructor(options?: VoiceRecorderOptions);
    recordPCMStream(saveTime: number, user: User, pcmStream: PassThrough): any;
}
//# sourceMappingURL=voice-recorder.d.ts.map