import test from 'ava';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use memory broker via BrokerClient
// @ts-ignore dynamic import of JS modules
const clientModule = await import('@shared/js/brokerClient.js');
const { BrokerClient } = clientModule;

const { LLMService } = await import('../llm-service.js');

if (process.env.SKIP_NETWORK_TESTS === '1') {
    test('cephalon tool-call network tests skipped in sandbox', (t) => t.pass());
} else {
    test('LLMService routes tool calls through broker', async (t) => {
        process.env.NO_SCREENSHOT = '1';
        process.env.BROKER_URL = 'memory://llm-tools';
        let received: any = null;
        const worker = new BrokerClient({
            url: process.env.BROKER_URL,
            id: 'llm-worker',
        });
        await worker.connect();
        worker.onTaskReceived(async (task: any) => {
            received = task.payload;
            await worker.ack(task.id);
            await worker.publish(task.payload.replyTopic, {
                reply: {
                    tool_calls: [
                        {
                            type: 'function',
                            function: {
                                name: 'add',
                                arguments: JSON.stringify({ a: 2, b: 3 }),
                            },
                        },
                    ],
                },
                taskId: task.id,
            });
            await worker.ready(task.queue);
        });
        await worker.ready('llm.generate');

        const llm = new LLMService({ brokerUrl: process.env.BROKER_URL });
        llm.registerTool(
            {
                type: 'function',
                function: {
                    name: 'add',
                    description: 'sum two numbers',
                    parameters: {
                        type: 'object',
                        properties: { a: { type: 'number' }, b: { type: 'number' } },
                    },
                },
            },
            ({ a, b }: any) => a + b,
        );

        const result = await llm.generate({ prompt: 'add', context: [] });
        t.is(result, 5);
        t.truthy(received.tools[0]);

        worker.socket?.close();
    });
}
