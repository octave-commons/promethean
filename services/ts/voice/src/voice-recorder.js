import { createWriteStream } from 'node:fs';
// @ts-ignore no types available
import * as wav from 'wav';
import EventEmitter from 'node:events';
export class VoiceRecorder extends EventEmitter {
    saveDest;
    constructor(options = {
        saveDest: './recordings',
    }) {
        super();
        this.saveDest = options.saveDest;
    }
    recordPCMStream(saveTime, user, pcmStream) {
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
//# sourceMappingURL=voice-recorder.js.map