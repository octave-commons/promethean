import test from 'ava';
import { Bot } from '../src/bot.js';

test('startVoiceAgent command registered', (t) => {
	t.true(Bot.interactions.has('start_voice_agent'));
});
