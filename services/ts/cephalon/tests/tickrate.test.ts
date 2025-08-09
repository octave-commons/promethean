import test from 'ava';
import { AIAgent } from '../src/agent';
import type { ContextManager } from '../src/contextManager';

test('agent updates tick interval', (t) => {
	const context = {} as unknown as ContextManager;
	const bot = { context } as any;
	const agent = new AIAgent({ bot, context });
	t.is((agent as any).tickInterval, 100);
	agent.updateTickInterval(250);
	t.is((agent as any).tickInterval, 250);
});
