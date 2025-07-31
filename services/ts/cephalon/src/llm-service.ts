import { request } from 'http';
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
	constructor(options: LLMClientOptions = { host: 'localhost', port: 5003, endpoint: '/generate' }) {
		this.host = options.host;
		this.port = options.port;
		this.endpoint = options.endpoint;
	}

	async generate(opts: LLMRequest): Promise<string | object> {
		const data = JSON.stringify(opts);
		return new Promise((resolve, reject) => {
			const req = request(
				{
					hostname: this.host,
					port: this.port,
					path: this.endpoint,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(data),
					},
				},
				(res) => {
					let body = '';
					res.on('data', (c) => (body += c));
					res.on('end', () => {
						try {
							const parsed = JSON.parse(body);
							resolve(parsed.reply);
						} catch (e) {
							reject(e);
						}
					});
				},
			);
			req.on('error', reject);
			req.write(data);
			req.end();
		});
	}
}
