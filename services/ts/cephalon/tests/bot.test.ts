import test, { type ExecutionContext } from 'ava';
import Module from 'module';

const ModuleAny = Module as any;
const originalLoad = ModuleAny._load;
ModuleAny._load = function (request: string, parent: any, isMain: boolean) {
	if (request.includes('canvas')) return {};
	return originalLoad(request, parent, isMain);
};

const { REST } = await import('discord.js');
const { Bot } = await import('../src/bot.js');

class TestBot extends Bot {
	constructor() {
		super({ token: 'tok', applicationId: 'app' });
	}
}

Bot.interactions.clear();
Bot.interactions.set('hello', { name: 'hello', description: 'd' });

function makeBot() {
	const bot = new TestBot();
	(bot.client.guilds.fetch as any) = async (id?: string) => (id ? { id } : [{ id: 'g1' }]);
	return bot;
}

test('registerInteractions issues REST call', async (t: ExecutionContext) => {
	const originalPut = REST.prototype.put;
	const calls: unknown[][] = [];
	(REST.prototype as any).put = async (...args: unknown[]) => {
		calls.push(args);
		return Promise.resolve();
	};
	try {
		const bot = makeBot();
		await bot.registerInteractions();
	} finally {
		REST.prototype.put = originalPut;
	}
	t.true(calls.length > 0);
	const [endpoint] = calls[0]!;
	t.is(endpoint, '/applications/app/guilds/g1/commands');
});
