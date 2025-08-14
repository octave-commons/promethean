import test from 'ava';
import { RemoteEmbeddingFunction } from '../embedding.js';

// @ts-ignore
import { start as startBroker, stop as stopBroker } from '../../../../js/broker/index.js';
import { BrokerClient } from '@shared/js/brokerClient.js';

test('requests embeddings via broker', async (t) => {
	const broker = await startBroker(0);
	const port = broker.address().port;
	const worker = new BrokerClient({
		url: `ws://127.0.0.1:${port}`,
		id: 'embed-worker',
	});
	await worker.connect();
	worker.onTaskReceived(async (task: any) => {
		worker.ack(task.id);
		const items = task.payload.items || [];
		const embeddings = items.map((_: unknown, i: number) => [i]);
		await worker.publish(
			'embedding.result',
			{ embeddings },
			{
				replyTo: task.payload.replyTo,
				correlationId: task.id,
			},
		);
		worker.ready(task.queue);
	});
	worker.ready('embedding.generate');
	process.env.BROKER_URL = `ws://127.0.0.1:${port}`;
	const fn = new RemoteEmbeddingFunction();
	const result = await fn.generate(['a', 'b']);
	t.deepEqual(result, [[0], [1]]);
	fn.broker.socket?.close();
	worker.socket?.close();
	await stopBroker(broker);
});
