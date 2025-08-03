import test from 'ava';
import { Bot } from '../src/bot.js';
import { REST } from 'discord.js';

// Record arguments passed to REST.put for inspection
const lastPutArgs: any[] = [];
(REST.prototype as any).put = async function (...args: any[]) {
        lastPutArgs.push(args);
        return Promise.resolve();
};

class TestBot extends Bot {
	constructor() {
		super({ token: 'tok', applicationId: 'app' });
	}
}

Bot.interactions.clear();
Bot.interactions.set('hello', { name: 'hello', description: 'd' });

function makeBot() {
        const bot = new TestBot();
        (bot.client.guilds.fetch as any) = async () => [{ id: 'g1' }];
        return bot;
}

test.skip('registerInteractions issues REST call', async (t) => {
	const bot = makeBot();
	await bot.registerInteractions();
	t.true(lastPutArgs.length > 0);
	const [endpoint] = lastPutArgs[0];
	t.is(endpoint, '/guilds/g1/commands');
});
