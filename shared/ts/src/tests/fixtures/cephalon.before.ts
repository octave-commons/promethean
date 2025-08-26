import { spawn } from 'child_process';
import EventEmitter from 'events';
import { IncomingMessage, request } from 'http';
import { Readable } from 'stream';
export type VoiceSynthOptions = {
    host: string;
    endpoint: string;
    port: number;
};
export class VoiceSynth extends EventEmitter {
    host: string;
    endpoint: string;
    port: number;
    constructor(
        options: VoiceSynthOptions = {
            host: 'localhost',
            endpoint: '/tts/synth_voice_pcm',
            port: Number(process.env.PROXY_PORT) || 8080,
        },
    ) {
        super();
        this.host = options.host;
        this.endpoint = options.endpoint;
        this.port = options.port;
    }
    async generateAndUpsampleVoice(text: string): Promise<{ stream: Readable; cleanup: () => void }> {
        const req = request({
            hostname: this.host,
            port: this.port,
            path: this.endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(`input_text=${encodeURIComponent(text)}`),
            },
        });

        req.write(`input_text=${encodeURIComponent(text)}`);
        req.end();

        return new Promise((resolve, reject) => {
            req.on('response', (res) => {
                const ffmpeg = spawn(
                    'ffmpeg',
                    [
                        '-f',
                        's16le',
                        '-ar',
                        '22050',
                        '-ac',
                        '1',
                        '-i',
                        'pipe:0',
                        '-f',
                        's16le',
                        '-ar',
                        '48000',
                        '-ac',
                        '2',
                        'pipe:1',
                    ],
                    { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true },
                );

                const cleanup = () => {
                    try {
                        res.unpipe(ffmpeg.stdin);
                    } catch {}
                    try {
                        ffmpeg.stdin.destroy();
                    } catch {}
                    try {
                        ffmpeg.kill('SIGTERM');
                    } catch {}
                };

                res.pipe(ffmpeg.stdin);
                resolve({ stream: ffmpeg.stdout, cleanup });
            }).on('error', (e) => reject(e));
        });
    }
    async generateVoice(text: string): Promise<IncomingMessage> {
        console.log('generate voice for', text);
        // Pipe the PCM stream directly
        return new Promise((resolve, reject) => {
            const req = request(
                {
                    hostname: this.host,
                    port: this.port,
                    path: this.endpoint,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(`input_text=${encodeURIComponent(text)}`),
                    },
                },
                resolve,
            );

            req.on('error', (e) => {
                reject(e);
            });

            req.write(`input_text=${encodeURIComponent(text)}`);
            req.end();
        });
    }
}
