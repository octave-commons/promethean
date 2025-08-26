/** Handles saving pcm data to wav files on disk.
    In the future it will also accept other formats.
    */
import { PassThrough } from 'node:stream';
import { createWriteStream } from 'node:fs';
// @ts-ignore no types available
import * as wav from 'wav';
import EventEmitter from 'node:events';
import { User } from 'discord.js';

export type RecordingMetaData = {
    filename: string;
    userId: string;
    saveTime: number;
};
export type VoiceRecorderOptions = {
    saveDest: string;
};
export class VoiceRecorder extends EventEmitter {
    saveDest: string;
    constructor(
        options: VoiceRecorderOptions = {
            saveDest: './recordings',
        },
    ) {
        super();
        this.saveDest = options.saveDest;
    }
    recordPCMStream(saveTime: number, user: User, pcmStream: PassThrough) {
        const wavWriter = new wav.Writer({
            channels: 2,
            sampleRate: 48000,
            bitDepth: 16,
        });
        const filename = `./${this.saveDest}/${saveTime}-${user.id}.wav`;
        const wavFileStream = createWriteStream(filename).once('close', () => {
            console.log('recording to ', filename, 'is complete.');
            this.emit('saved', {
                filename,
                userId: user.id,
                saveTime,
            });
        });
        wavWriter.pipe(wavFileStream);

        return pcmStream.pipe(wavWriter);
    }
}
