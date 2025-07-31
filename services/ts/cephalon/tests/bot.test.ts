import test from 'ava';
import { Bot } from '../src/bot.js';
import { lastPutArgs } from '../../tests/node_modules/discord.js/index.js';

class TestBot extends Bot {
  constructor() {
    super({ token:'tok', applicationId:'app' });
  }
}

Bot.interactions.clear();
Bot.interactions.set('hello', { name:'hello', description:'d' });

function makeBot() {
  const bot = new TestBot();
  bot.client.guilds.fetch = async () => [{ id:'g1' }];
  return bot;
}

test.skip('registerInteractions issues REST call', async t => {
  const bot = makeBot();
  await bot.registerInteractions();
  t.true(lastPutArgs.length > 0);
  const [endpoint] = lastPutArgs[0];
  t.is(endpoint, '/guilds/g1/commands');
});
