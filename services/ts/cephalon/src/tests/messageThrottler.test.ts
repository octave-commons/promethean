import test from 'ava';
process.env.DISABLE_AUDIO = '1';
import { AIAgent } from '../agent.js';
import type { Bot } from '../bot.js';
import type { ContextManager } from '../contextManager.js';
import { initMessageThrottler } from '../messageThrottler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// @ts-ignore dynamic import of JS module without types
const brokerModule = await import(path.resolve(__dirname, '../../../../js/broker/index.js'));
const { start: startBroker, stop: stopBroker } = brokerModule;

test('throttles tick interval based on messages', async (t) => {
    const context = {} as unknown as ContextManager;
    const bot = { context } as unknown as Bot;
    const agent = new AIAgent({ bot, context });
    const broker = await startBroker(0);
    const port = broker.address().port;
    const client = await initMessageThrottler(agent, `ws://127.0.0.1:${port}`);
    for (let i = 0; i < 5; i++) {
        client.publish('test', {});
    }
    await new Promise((r) => setTimeout(r, 1100));
    client.publish('test', {});
    t.true((agent as any).tickInterval > 100);
    client.socket?.close();
    await stopBroker(broker);
    // stop audio player to let AVA exit cleanly
    if ((agent as any).audioPlayer?.stop) (agent as any).audioPlayer.stop(true);
});
