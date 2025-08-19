import test from 'ava';
import { RemoteEmbeddingFunction } from '../embedding.js';

class MockBrokerClient {
	handlers: Record<string, ((e: any) => void)[]> = {};
	socket: { close: () => void } = { close: () => {} };
	async connect() {
		return;
	}
	subscribe(topic: string, cb: (e: any) => void) {
		if (!this.handlers[topic]) this.handlers[topic] = [];
		this.handlers[topic].push(cb);
	}
	enqueue(queue: string, payload: any) {
		if (queue !== 'embedding.generate') return;
		const items = payload.items || [];
		const embeddings = items.map((_: unknown, i: number) => [i]);
		const ev = { replyTo: payload.replyTo, payload: { embeddings } };
		for (const cb of this.handlers['embedding.result'] || []) cb(ev);
	}
}

test('requests embeddings via mocked broker', async (t) => {
	const mock = new MockBrokerClient();
	const fn = new RemoteEmbeddingFunction(undefined, undefined, undefined, mock as any);
	const result = await fn.generate(['a', 'b']);
	t.deepEqual(result, [[0], [1]]);
});
