import WebSocket from 'ws';
import { Message } from 'ollama';

export type LLMClientOptions = {
	host: string;
	port: number;
	endpoint: string;
};

export type LLMRequest = {
	prompt: string;
	context: Message[];
	format?: object;
};

export class LLMService {
	host: string;
	port: number;
	endpoint: string;
	socket: WebSocket | null = null;

	constructor(
		options: LLMClientOptions = {
			host: 'localhost',
			port: Number(process.env.LLM_PORT) || 5003,
			endpoint: '/generate',
		},
	) {
		this.host = options.host;
		this.port = options.port;
		this.endpoint = options.endpoint;
	}

	private connect(): Promise<void> {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}
		const url = `ws://${this.host}:${this.port}${this.endpoint}`;
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(url);
			this.socket.on('open', () => resolve());
			this.socket.on('error', (err) => reject(err));
		});
	}

	async generate(opts: LLMRequest): Promise<string | object> {
		await this.connect();
		const data = JSON.stringify(opts);
		return new Promise((resolve, reject) => {
			if (!this.socket) {
				reject(new Error('WebSocket not connected'));
				return;
			}
			const handleMessage = (msg: WebSocket.RawData) => {
				try {
					const parsed = JSON.parse(msg.toString());
					this.socket?.off('message', handleMessage);
					resolve(parsed.reply);
				} catch (e) {
					this.socket?.off('message', handleMessage);
					reject(e);
				}
			};
			this.socket.once('message', handleMessage);
			this.socket.once('error', reject);
			this.socket.send(data);
		});
	}
}
