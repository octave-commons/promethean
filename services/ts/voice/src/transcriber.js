import EventEmitter from 'node:events';
import http from 'node:http';
export class Transcriber extends EventEmitter {
    httpOptions;
    constructor(options = {
        hostname: 'localhost',
        port: Number(process.env.PROXY_PORT) || 8080,
        endpoint: '/stt/transcribe_pcm',
    }) {
        super();
        this.httpOptions = {
            hostname: options.hostname,
            port: options.port,
            path: options.endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Transfer-Encoding': 'chunked',
                'X-Sample-Rate': 48000,
                'X-Dtype': 'int16',
            },
        };
    }
    transcribePCMStream(startTime, speaker, pcmStream) {
        this.emit('transcriptStart', { startTime, speaker });
        // ✅ Pipe PCM directly into the HTTP request
        return pcmStream.pipe(http
            .request(this.httpOptions, (res) => {
            const transcriptChunks = [];
            res.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                console.log(chunkStr);
                const transcript = JSON.parse(chunkStr).transcription;
                console.log(`Transcription chunk: ${transcript}`);
                const transcriptObject = {
                    startTime,
                    speaker,
                    text: transcript,
                    endTime: Date.now(),
                };
                transcriptChunks.push(transcriptObject);
                this.emit('transcriptChunk', transcriptObject);
            });
            res.on('end', async () => {
                console.log('Transcription ended');
                const originalTranscript = transcriptChunks.map((t) => t.text).join(' ');
                this.emit('transcriptEnd', {
                    startTime,
                    speaker,
                    originalTranscript,
                    user: speaker.user,
                    userName: speaker.user.username,
                    transcript: originalTranscript,
                    endTime: Date.now(),
                });
            });
        })
            .on('error', (err) => {
            console.error('Transcription request error:', err);
        }));
    }
}
//# sourceMappingURL=transcriber.js.map