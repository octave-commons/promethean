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
			endpoint: '/synth-voice', // fix this later
			port: 5002,
		},
	) {
		super();
		this.host = options.host;
		this.endpoint = options.endpoint;
		this.port = options.port;
	}
	async generateAndUpsampleVoice(text: string): Promise<{ stream: Readable; cleanup: () => void }> {
		const req = request({
			hostname: 'localhost',
			port: 5002,
			path: '/synth_voice_pcm',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(`input_text=${encodeURIComponent(text)}`),
			},
		});

		req.write(`input_text=${encodeURIComponent(text)}`);
		req.end();

		return new Promise((resolve, reject) => {
			req
				.on('response', (res) => {
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
						{
							stdio: ['pipe', 'pipe', 'ignore'],
							windowsHide: true,
						},
					);

					const cleanup = () => {
						res.unpipe(ffmpeg.stdin);
						ffmpeg.stdin.destroy(); // prevent EPIPE
						ffmpeg.kill('SIGTERM');
					};

					res.pipe(ffmpeg.stdin);
					resolve({ stream: ffmpeg.stdout, cleanup });
				})
				.on('error', (e) => reject(e));
		});
	}
	async generateVoice(text: string): Promise<IncomingMessage> {
		console.log('generate voice for', text);
		// Pipe the PCM stream directly
		return new Promise((resolve, reject) => {
			const req = request(
				{
					hostname: 'localhost',
					port: 5002,
					path: '/synth_voice',
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
