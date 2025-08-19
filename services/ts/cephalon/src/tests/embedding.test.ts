import test from 'ava';
import path from 'path';
import { fileURLToPath } from 'url';
import { RemoteEmbeddingFunction } from '../embedding.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dynamic imports for broker server and client
// @ts-ignore dynamic import of JS modules
const brokerModule = await import(path.resolve(__dirname, '../../../../js/broker/index.js'));
const { start: startBroker, stop: stopBroker } = brokerModule;
// @ts-ignore dynamic import of JS modules
const clientModule = await import('@shared/js/brokerClient.js');
const { BrokerClient } = clientModule;

test('requests embeddings via broker', async (t) => {
    const broker = await startBroker(0);
    const port = broker.address().port;
    const worker = new BrokerClient({
        url: `ws://127.0.0.1:${port}`,
        id: 'embed-worker',
    });
    await worker.connect();
    worker.onTaskReceived(async (task: any) => {
        await worker.ack(task.id);
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
        await worker.ready(task.queue);
    });
    await worker.ready('embedding.generate');
    process.env.BROKER_URL = `ws://127.0.0.1:${port}`;
    const fn = new RemoteEmbeddingFunction();
    const result = await fn.generate(['a', 'b']);
    t.deepEqual(result, [[0], [1]]);
    fn.broker.socket?.close();
    worker.socket?.close();
    await stopBroker(broker);
});
