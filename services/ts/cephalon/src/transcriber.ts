import { User } from 'discord.js';
import EventEmitter from 'node:events';
import http, { RequestOptions } from 'node:http';
import { PassThrough } from 'node:stream';
import { Speaker } from './speaker';

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
export class Transcriber extends EventEmitter {
	httpOptions: RequestOptions;

	constructor(
		options: TranscriberOptions = {
			hostname: 'localhost',
			port: Number(process.env.PROXY_PORT) || 8080,
			endpoint: '/stt/transcribe_pcm',
		},
	) {
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
	transcribePCMStream(startTime: number, speaker: Speaker, pcmStream: PassThrough) {
		this.emit('transcriptStart', { startTime, speaker });
		// ✅ Pipe PCM directly into the HTTP request
		return pcmStream.pipe(
			http
				.request(this.httpOptions, (res) => {
					const transcriptChunks: TranscriptChunk[] = [];
					res.on('data', (chunk) => {
						const chunkStr = chunk.toString();
						console.log(chunkStr);
						const transcript = JSON.parse(chunkStr).transcription;
						console.log(`Transcription chunk: ${transcript}`);
						const transcriptObject: TranscriptChunk = {
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
				}),
		);
	}
}
