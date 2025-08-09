// @ts-ignore import js module without types
import { BrokerClient } from '../../../../../shared/js/brokerClient.js';
import { randomUUID } from 'crypto';
import { Message } from 'ollama';

export type LLMClientOptions = {
	brokerUrl?: string;
	broker?: BrokerClient;
};

export type LLMRequest = {
	prompt: string;
	context: Message[];
	format?: object;
};

export class LLMService {
	broker: BrokerClient;
	#ready: Promise<void>;
	#pending: ((reply: string | object) => void)[] = [];
	#replyTopic: string;

	constructor(options: LLMClientOptions = {}) {
		const brokerUrl = options.brokerUrl || process.env.BROKER_URL || 'ws://localhost:7000';
		this.#replyTopic = `llm.result.${randomUUID()}`;
		this.broker =
			options.broker ||
			new BrokerClient({
				url: brokerUrl,
				id: `cephalon-llm-${randomUUID()}`,
			});
		this.#ready = this.broker
			.connect()
			.then(() => {
				this.broker.subscribe(this.#replyTopic, (event: any) => {
					const resolve = this.#pending.shift();
					if (resolve) {
						resolve(event.payload.reply);
					}
				});
			})
			.catch((err: unknown) => {
				console.error('Failed to connect to broker', err);
			});
	}

	async generate(opts: LLMRequest): Promise<string | object> {
		await this.#ready;
		return new Promise((resolve) => {
			this.#pending.push(resolve);
			this.broker.enqueue('llm.generate', {
				prompt: opts.prompt,
				context: opts.context,
				format: opts.format,
				replyTopic: this.#replyTopic,
			});
		});
	}
}
