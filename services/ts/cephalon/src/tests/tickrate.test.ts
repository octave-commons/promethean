import test from 'ava';
import { AIAgent } from '../agent.js';
import type { Bot } from '../bot.js';
import type { ContextManager } from '../contextManager.js';

test('agent updates tick interval', (t) => {
    const context = {} as unknown as ContextManager;
    const bot = { context } as unknown as Bot;
    const agent = new AIAgent({ bot, context });
    t.is((agent as any).tickInterval, 100);
    agent.updateTickInterval(250);
    t.is((agent as any).tickInterval, 250);
});
