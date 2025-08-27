import test from 'ava';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dynamic imports for broker server and client
// @ts-ignore dynamic import of JS modules
const brokerModule = await import(path.resolve(__dirname, '../../../../js/broker/index.js'));
const { start: startBroker, stop: stopBroker } = brokerModule;
// @ts-ignore dynamic import of JS modules
const clientModule = await import('@shared/js/brokerClient.js');
const { BrokerClient } = clientModule;

const { AIAgent } = await import('../agent/index.js');
const { LLMService } = await import('../llm-service.js');
const { ContextStore } = await import('@shared/ts/dist/persistence/contextStore.js');

class StubBot extends EventEmitter {
    applicationId = 'app';
    context = new ContextStore();
    currentVoiceSession = undefined;
}

test('AIAgent forwards prompt to LLM service via broker', async (t) => {
    process.env.NO_SCREENSHOT = '1';
    let received: any = null;
    const broker = await startBroker(0);
    const port = broker.address().port;
    const worker = new BrokerClient({
        url: `ws://127.0.0.1:${port}`,
        id: 'llm-worker',
    });
    await worker.connect();
    worker.onTaskReceived(async (task: any) => {
        received = task.payload;
        await worker.ack(task.id);
        await worker.publish(task.payload.replyTopic, {
            reply: 'ok',
            taskId: task.id,
        });
        await worker.ready(task.queue);
    });
    await worker.ready('llm.generate');

    const llm = new LLMService({ brokerUrl: `ws://127.0.0.1:${port}` });
    const agent = new AIAgent({
        bot: new StubBot() as any,
        context: new ContextStore(),
        llm,
    });

    const reply = await agent.generateTextResponse('hello', {
        context: [{ role: 'user', content: 'hi' }],
    });
    t.is(reply, 'ok');
    t.deepEqual(received.context[0].content, 'hi');
    t.deepEqual(received.tools, []);

    worker.socket?.close();
    await stopBroker(broker);
});
