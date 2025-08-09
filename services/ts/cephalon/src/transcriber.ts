import { User } from 'discord.js';
import EventEmitter from 'node:events';
import { PassThrough } from 'node:stream';
import { BrokerClient } from '../../../../shared/js/brokerClient.js';
import { Speaker } from './speaker';

export type TranscriberOptions = {
	brokerUrl?: string;
	broker?: BrokerClient;
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

type PendingRequest = {
	startTime: number;
	speaker: Speaker;
};

export class Transcriber extends EventEmitter {
	broker: BrokerClient;
	#ready: Promise<void>;
	#pending: PendingRequest[] = [];

	constructor(options: TranscriberOptions = {}) {
		super();
		this.broker =
			options.broker ||
			new BrokerClient({
				url: options.brokerUrl || process.env.BROKER_URL || 'ws://localhost:7000',
				id: 'cephalon-transcriber',
			});
		this.#ready = this.broker
			.connect()
			.then(() => {
				this.broker.subscribe('stt.transcribed', (event: any) => {
					const { payload } = event || {};
					const data = this.#pending.shift();
					if (!data) return;
					const { startTime, speaker } = data;
					const text = payload?.text || '';
					const endTime = Date.now();
					const chunk: TranscriptChunk = {
						startTime,
						speaker,
						text,
						endTime,
					};
					this.emit('transcriptChunk', chunk);
					this.emit('transcriptEnd', {
						startTime,
						speaker,
						originalTranscript: text,
						user: speaker.user,
						userName: speaker.user.username,
						transcript: text,
						endTime,
					});
				});
			})
			.catch((err: unknown) => {
				console.error('Failed to connect to broker', err);
			});
	}

	transcribePCMStream(startTime: number, speaker: Speaker, pcmStream: PassThrough) {
		this.emit('transcriptStart', { startTime, speaker });
		const buffers: Buffer[] = [];
		pcmStream.on('data', (chunk) => buffers.push(chunk));
		pcmStream.on('end', async () => {
			const pcm = Buffer.concat(buffers);
			const pcm_b64 = pcm.toString('base64');
			this.#pending.push({ startTime, speaker });
			try {
				await this.#ready;
				this.broker.enqueue('stt.transcribe', {
					pcm: pcm_b64,
					sample_rate: 48000,
				});
			} catch (err: unknown) {
				console.error('Transcription request error:', err);
			}
		});
		pcmStream.on('error', (err: unknown) => {
			console.error('Transcription stream error:', err);
		});
		return pcmStream;
	}
}
