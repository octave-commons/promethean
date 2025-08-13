//services/ts/dicosrd-embedder/src/embedder.ts
import type { EmbeddingFunction, EmbeddingFunctionSpace } from 'chromadb';
// @ts-ignore import js module without types
import { BrokerClient } from '../../../../../shared/js/brokerClient.js';
import { randomUUID } from 'crypto';

export class RemoteEmbeddingFunction implements EmbeddingFunction {
	name = 'remote';
	driver: string | undefined;
	fn: string | undefined;
	broker: BrokerClient;
	#ready: Promise<void>;
	#pending: ((embeddings: number[][]) => void)[] = [];
	#replyId: string;

	constructor(
		brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
		driver = process.env.EMBEDDING_DRIVER,
		fn = process.env.EMBEDDING_FUNCTION,
		broker?: BrokerClient,
	) {
		this.driver = driver;
		this.fn = fn;
		this.#replyId = randomUUID();
		this.broker =
			broker ||
			new BrokerClient({
				url: brokerUrl,
				id: `discord-embed-${this.#replyId}`,
			});
		this.#ready = this.broker
			.connect()
			.then(() => {
				this.broker.subscribe('embedding.result', (event: any) => {
					if (event.replyTo !== this.#replyId) return;
					const resolve = this.#pending.shift();
					if (resolve) {
						resolve(event.payload.embeddings);
					}
				});
			})
			.catch((err: unknown) => {
				console.error('Failed to connect to broker', err);
			});
	}

	async generate(texts: string[]): Promise<number[][]> {
		const items = texts.map((t) =>
			t.startsWith('img:') ? { type: 'image_url', data: t.slice(4) } : { type: 'text', data: t },
		);
		await this.#ready;
		return new Promise((resolve) => {
			this.#pending.push(resolve);
			this.broker.enqueue('embedding.generate', {
				items,
				driver: this.driver,
				function: this.fn,
				replyTo: this.#replyId,
			});
		});
	}

	defaultSpace(): EmbeddingFunctionSpace {
		return 'l2';
	}
	supportedSpaces(): EmbeddingFunctionSpace[] {
		return ['l2', 'cosine'];
	}
	static fromConfig(cfg: { driver: string; fn: string; brokerUrl?: string }): RemoteEmbeddingFunction {
		return new RemoteEmbeddingFunction(cfg.brokerUrl, cfg.driver, cfg.fn);
	}
	getConfig() {
		return {};
	}
}
