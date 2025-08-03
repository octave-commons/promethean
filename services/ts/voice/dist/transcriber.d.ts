import { User } from "discord.js";
import EventEmitter from "node:events";
import http, { RequestOptions } from "node:http";
import { PassThrough } from "node:stream";
import { Speaker } from "./speaker";
export type TranscriberOptions = {
    hostname: string;
    port: number;
    endpoint: string;
};
export type TranscriptChunk = {
    speaker: Speaker;
    startTime: number;
    endTime: number;
    text: string;
};
export type FinalTranscript = {
    speaker?: Speaker;
    user?: User;
    userName: string;
    startTime?: number;
    endTime: number;
    transcript: string;
    originalTranscript?: string;
};
export declare class Transcriber extends EventEmitter {
    httpOptions: RequestOptions;
    constructor(options?: TranscriberOptions);
    transcribePCMStream(startTime: number, speaker: Speaker, pcmStream: PassThrough): http.ClientRequest;
}
//# sourceMappingURL=transcriber.d.ts.map