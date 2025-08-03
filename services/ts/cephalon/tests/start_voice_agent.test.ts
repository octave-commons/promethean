import test, { type ExecutionContext } from 'ava';
import { Bot } from '../src/bot.js';

test('startVoiceAgent command registered', (t: ExecutionContext) => {
	t.true(Bot.interactions.has('start_voice_agent'));
});
