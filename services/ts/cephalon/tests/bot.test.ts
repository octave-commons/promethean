import test from 'ava';
import { Bot } from '../src/bot.js';
import { lastPutArgs } from '../../tests/node_modules/discord.js/index.js';

class TestBot extends Bot {
	constructor() {
		super({ token: 'tok', applicationId: 'app' });
	}
}

function makeBot() {
	const bot = new TestBot();
	bot.client.guilds.fetch = async () => [{ id: 'g1' }];
	return bot;
}

test.skip('registerInteractions issues REST call', async (t) => {
	const bot = makeBot();
	await bot.registerInteractions();
	t.true(lastPutArgs.length > 0);
	const [endpoint] = lastPutArgs[0];
	t.is(endpoint, '/guilds/g1/commands');
});

test('set_config updates agent values', async (t) => {
	const bot = makeBot();
	const handler = Bot.handlers.get('set_config');
	const interaction: any = {
		options: {
			getString: (name: string) => (name === 'setting' ? 'historyLimit' : '7'),
		},
		reply: async () => {},
	};
	await handler?.(bot, interaction);
	t.is(bot.agent.historyLimit, 7);
});

test('set_state updates inner state', async (t) => {
	const bot = makeBot();
	bot.agent.updateInnerState = async function (newState: any) {
		this.innerState = { ...this.innerState, ...newState };
	};
	const handler = Bot.handlers.get('set_state');
	const interaction: any = {
		options: {
			getString: (name: string) => (name === 'field' ? 'currentMood' : 'excited'),
		},
		reply: async () => {},
	};
	await handler?.(bot, interaction);
	t.is(bot.agent.innerState.currentMood, 'excited');
});
