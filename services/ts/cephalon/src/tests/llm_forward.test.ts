import test from 'ava';
import { WebSocketServer } from 'ws';
import Module from 'module';
import EventEmitter from 'events';

const ModuleAny = Module as any;
const originalLoad = ModuleAny._load;
ModuleAny._load = function (request: string, parent: any, isMain: boolean) {
	if (request.includes('canvas')) return {};
	return originalLoad(request, parent, isMain);
};

const { AIAgent } = await import('../../src/agent/index.js');
const { LLMService } = await import('../../src/llm-service.js');
const { ContextManager } = await import('../../src/contextManager.js');

class StubBot extends EventEmitter {
	applicationId = 'app';
	context = new ContextManager();
	currentVoiceSession = undefined;
}

test('AIAgent forwards prompt to LLM service', async (t) => {
	process.env.NO_SCREENSHOT = '1';
	let received: any = null;
	const wss = new WebSocketServer({ port: 9999, path: '/generate' });
	wss.on('connection', (ws) => {
		ws.on('message', (data) => {
			received = JSON.parse(data.toString());
			ws.send(JSON.stringify({ reply: 'ok' }));
		});
	});

	const llm = new LLMService({
		host: 'localhost',
		port: 9999,
		endpoint: '/generate',
	});
	const agent = new AIAgent({
		bot: new StubBot() as any,
		context: new ContextManager(),
		llm,
	});

	const reply = await agent.generateTextResponse('hello', {
		context: [{ role: 'user', content: 'hi' }],
	});
	t.is(reply, 'ok');
	t.deepEqual(received.context[0].content, 'hi');

	await new Promise<void>((resolve) => wss.close(() => resolve()));
});
