import test from 'ava';
import http from 'http';
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
const { ContextManager } = await import('@shared/ts/contextManager');

class StubBot extends EventEmitter {
	applicationId = 'app';
	context = new ContextManager();
	currentVoiceSession = undefined;
}

test('AIAgent forwards prompt to LLM service', async (t) => {
	process.env.NO_SCREENSHOT = '1';
	let received: any = null;
	const server = http.createServer((req, res) => {
		let body = '';
		req.on('data', (chunk) => (body += chunk));
		req.on('end', () => {
			received = JSON.parse(body);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ reply: 'ok' }));
		});
	});
	await new Promise<void>((resolve) => server.listen(9999, resolve));

	const llm = new LLMService({ host: 'localhost', port: 9999, endpoint: '/generate' });
	const agent = new AIAgent({ bot: new StubBot() as any, context: new ContextManager(), llm });

	const reply = await agent.generateTextResponse('hello', { context: [{ role: 'user', content: 'hi' }] });
	t.is(reply, 'ok');
	t.deepEqual(received.context[0].content, 'hi');

	await new Promise<void>((resolve) => server.close(() => resolve()));
});
